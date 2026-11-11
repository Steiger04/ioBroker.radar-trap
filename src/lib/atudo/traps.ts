import type { Feature, Point } from '@turf/helpers';
import { point } from '@turf/helpers';
import { fetch } from 'cross-fetch';
import type { TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import type { BBox, LineString } from '@turf/turf';
import { feature } from '@turf/turf';
import polyline from '@mapbox/polyline';
import { uniqBy } from 'lodash';
import { delay, getAdapterLog } from '../adapterRef';
import { atudoPoisSchema } from '../schemas/atudoPoiSchema';
import { atudoPolysSchema } from '../schemas/atudoPolySchema';

/**
 * The API of the map of blitzer.de. The server of atudo that the adapter asked before (`cdn2.atudo.net/api/4.0`, the
 * same data) does not answer since October 2026; the map of blitzer.de reads its own site, with the same query
 * (`type`, `box`, `z`) and nearly the same answer. It is not documented and may change at any time.
 */
const API = 'https://www.blitzer.de/karte/api/markers';
/** The zoom asked for: 18 gives the traps themselves, but a box wider than about 10 km still comes back in groups */
const ZOOM = 18;
/** How long a request may take: a server that does not answer would hold the computation for minutes */
const REQUEST_TIMEOUT = 30_000;
/** The least time between two requests: by default all routes and areas are computed at the same minute */
const REQUEST_GAP = 500;
/** How long blitzer.de is not asked after it refused or did not answer: it blocks an address that asks too often */
const PAUSE_AFTER_FAILURE = 15 * 60_000;
/**
 * A box that comes back with groups is asked again in quarters, at most this many times in a row: 35 km, 17.5 km,
 * 8.8 km, 4.4 km, 2.2 km, 1.1 km. Measured in Berlin in November 2026: a box of 3 km comes back without groups, one
 * of 11 km with 11
 */
const SPLIT_DEPTH = 5;
/**
 * Where the traps of a computed route or area come from, stored with it. On start the adapter computes again what
 * has another source - what 2.2.x computed from atudo, which no longer answers, has none and stays empty otherwise
 */
export const TRAPS_SOURCE = 'blitzer.de';
/** The most requests of one computation: groups beyond it stay unresolved */
export const MAX_REQUESTS = 300;

/* const trapBase =
	"0,1,2,3,4,5,6,7,11,12,20,21,22,23,24,25,29,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,201,206,ts"; */

const trapBase =
    '0,1,2,3,4,5,6,7,11,12,20,21,22,23,24,25,29,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,ts';

/**
 * The traps and hazards, the hotspots of mobile cameras (2015), the reports of the police (vwd) and the closed roads
 * (closure, with the line of the road), in one request. The archive of the reports of the police (vwda) is no longer
 * delivered.
 */
const MARKER_TYPES = `${trapBase},2015,vwd,closure`;

/** What one computation shares between its boxes */
export interface TrapsContext {
    /** The requests made */
    requests: number;
    /** The groups not resolved, because the computation reached `MAX_REQUESTS` */
    unresolvedGroups: number;
    /** The groups not resolved, because they were still groups in the smallest box */
    deepGroups: number;
    /** Whether the traps in a box matter: only along the route or inside the area are groups resolved */
    wanted: (box: BBox) => boolean;
}

type Raw = Record<string, unknown>;

/** The requests, one after the other */
let queue: Promise<unknown> = Promise.resolve();
let lastRequest = 0;
/** Until when blitzer.de is not asked after a failure, and why */
let paused = { since: 0, until: 0, reason: '' };

const clock = (ms: number): string => new Date(ms).toTimeString().slice(0, 5);

/**
 * When blitzer.de is asked again after a failure
 *
 * @returns the time as `HH:MM`, empty if it is not paused
 */
export function pausedUntil(): string {
    return paused.until > Date.now() ? clock(paused.until) : '';
}

function describe(error: unknown): string {
    const reason = error as Error | undefined;
    if (reason?.name === 'TimeoutError' || reason?.name === 'AbortError') {
        return `no answer within ${REQUEST_TIMEOUT / 1_000} seconds`;
    }
    // without the query: the list of the kinds and the box say nothing about the failure
    return (reason?.message || String(error)).replace(/\?\S*/g, '');
}

/** Asks blitzer.de - one request after the other, with a gap between them; after a failure it is paused */
function request(query: string, context: TrapsContext): Promise<Raw> {
    const run = queue.then(async () => {
        if (paused.until > Date.now()) {
            throw new Error(`not asked since ${clock(paused.since)}: ${paused.reason}`);
        }
        const wait = lastRequest + REQUEST_GAP - Date.now();
        if (wait > 0) {
            await delay(wait);
        }
        context.requests++;
        try {
            const response = await fetch(`${API}?${query}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
            if (!response.ok) {
                throw new Error(`blitzer.de answered ${response.status} ${response.statusText}`.trim());
            }
            const answer = (await response.json()) as unknown;
            if (!answer || typeof answer !== 'object') {
                throw new Error('blitzer.de answered without data');
            }
            return answer as Raw;
        } catch (error) {
            paused = { since: Date.now(), until: Date.now() + PAUSE_AFTER_FAILURE, reason: describe(error) };
            throw new Error(paused.reason);
        } finally {
            lastRequest = Date.now();
        }
    });
    queue = run.catch(() => undefined);
    return run;
}

/** The box as the API takes it: south, west, north, east */
const apiBox = (box: BBox): string => `${box[1]},${box[0]},${box[3]},${box[2]}`;

/** A group of traps stands at the centre of its members, with a type of 1000 or more and without an ID */
const isGroup = (raw: Raw): boolean => raw.type === 'cluster' || (Number(raw.type) >= 1000 && !raw.backend);

/**
 * The markers in a box. A box that comes back with groups where the traps matter is asked again in its quarters -
 * those along the route or inside the area. Quarters do not overlap, unlike boxes around each group: in a city full
 * of roadworks those asked the same streets again and again
 */
async function markers(box: BBox, context: TrapsContext, depth: number): Promise<Raw[]> {
    const answer = await request(`type=${MARKER_TYPES}&box=${apiBox(box)}&z=${ZOOM}`, context);
    // an empty box answers null
    const pois = Array.isArray(answer.pois) ? (answer.pois as Raw[]) : [];
    if (pois.length >= 500) {
        getAdapterLog().debug(`blitzer.de answered ${pois.length} markers for one box: it may have left some out`);
    }

    const single = pois.filter(poi => !isGroup(poi));
    // a group whose members may matter: its members lie around it, up to a quarter of the box away
    const [west, south, east, north] = box;
    const halfLng = (east - west) / 8;
    const halfLat = (north - south) / 8;
    const groups = pois.filter(poi => {
        const lat = Number(poi.lat);
        const lng = Number(poi.lng);
        return (
            isGroup(poi) &&
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            context.wanted([lng - halfLng, lat - halfLat, lng + halfLng, lat + halfLat])
        );
    });
    if (!groups.length) {
        return single;
    }

    const midLng = (west + east) / 2;
    const midLat = (south + north) / 2;
    const quarters = (
        [
            [west, south, midLng, midLat],
            [midLng, south, east, midLat],
            [west, midLat, midLng, north],
            [midLng, midLat, east, north],
        ] as BBox[]
    ).filter(quarter => context.wanted(quarter));
    if (depth >= SPLIT_DEPTH) {
        context.deepGroups += groups.length;
        return single;
    }
    if (context.requests + quarters.length > MAX_REQUESTS) {
        context.unresolvedGroups += groups.length;
        return single;
    }

    // the quarters deliver the single traps of this box again, where they matter
    const found: Raw[] = [];
    for (const quarter of quarters) {
        found.push(...(await markers(quarter, context, depth + 1)));
    }
    return found;
}

/** A number or a string as a string; anything else (null, a missing field) as an empty one */
const text = (value: unknown): string =>
    typeof value === 'string' ? value : typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
const object = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});

/** `2026-11-11 10:00:15` as `11.11.2026 10:00`, like the dates of atudo; anything else as it is */
function date(value: unknown): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(text(value));
    return match ? `${match[3]}.${match[2]}.${match[1]} ${match[4]}:${match[5]}` : text(value);
}

/**
 * The info of a trap, with the figures that atudo sent as strings as strings again: `partly_fixed` - a trailer, which
 * `determineTrapTypes` finds by `'1'` - and the length, duration and delay of a jam, which the trap info reads with
 * `isEmpty`, true for every number
 */
function info(value: unknown): Raw {
    const result = { ...object(value) };
    for (const key of ['partly_fixed', 'length', 'duration', 'delay']) {
        const figure = result[key];
        if (typeof figure === 'number') {
            result[key] = String(figure);
        }
    }
    return result;
}

/**
 * A trap of blitzer.de in the form of the traps of atudo, which the rest of the adapter reads: blitzer.de sends
 * numbers where atudo sent strings (`type`, `vmax`, `lat`, ...) - `determineTrapTypes` compares the type as a string,
 * `vmax` is checked with `isEmpty` - and an address without postcode and district
 */
function toPoi(raw: Raw): radarTrap.AtudoPoi {
    const address = object(raw.address);
    const vmax = text(raw.vmax);
    const poi: radarTrap.AtudoPoi = {
        schemaType: 'POI',
        id: text(raw.id),
        lat: text(raw.lat),
        lng: text(raw.lng),
        address: {
            country: text(address.country),
            state: text(address.state),
            zip_code: text(address.zip_code ?? address.zip),
            city: text(address.city),
            city_district: text(address.city_district),
            street: text(address.street),
        },
        backend: text(raw.backend),
        type: text(raw.type),
        // 0: no limit known - a red-light camera, a report of the police
        vmax: vmax === '0' ? '' : vmax,
        counter: text(raw.counter),
        create_date: date(raw.create_date),
        confirm_date: date(raw.confirm_date),
        info: info(raw.info),
        polyline: raw.polyline,
        style: Number(raw.style) || 0,
    };
    for (const key of ['key', 'content', 'reason', 'street'] as const) {
        const value = raw[key];
        if (typeof value === 'string') {
            poi[key] = value;
        }
    }
    return poi;
}

/**
 * A closed road as the maps draw it: a line of the type `closure`. atudo sent it as a line of its own, blitzer.de
 * sends it as a marker with the line of the road (`polyline`, Google's encoding); one without a line is left out
 */
function toClosure(raw: Raw): radarTrap.AtudoPoly | null {
    if (typeof raw.polyline !== 'string' || raw.polyline.length < 6) {
        return null;
    }
    const address = object(raw.address);
    const rawInfo = object(raw.info);
    const desc = text(raw.reason) || text(rawInfo.reason) || text(rawInfo.desc);
    const zip = text(address.zip_code ?? address.zip);
    return {
        schemaType: 'POLY',
        id: text(raw.id),
        type: 'closure',
        polyline: raw.polyline,
        backend: text(raw.backend),
        create_date: date(raw.create_date),
        address: {
            country: text(address.country),
            zip,
            city: text(address.city),
            street: text(address.street),
            direction: null,
            zip_code: zip,
        },
        ...(desc ? { info: { desc } } : {}),
    };
}

/** Says at debug level what does not fit the schema - the API is not documented, its answer may change */
function checkSchema(what: string, schema: TSchema, value: unknown[]): void {
    if (value.length && !Value.Check(schema, value)) {
        const [first] = [...Value.Errors(schema, value)];
        const sample = JSON.stringify(first?.value)?.slice(0, 300);
        getAdapterLog().debug(
            `blitzer.de sent ${what} of an unknown form: ${first?.path} ${first?.message}: ${sample}`,
        );
    }
}

/**
 * The traps and the closed roads in a box, from blitzer.de
 *
 * @param box the box: west, south, east, north
 * @param context what the computation shares between its boxes: the count of the requests, where traps matter
 * @returns the traps and the closed roads; if blitzer.de could not be asked, none and the reason in `error` - the
 *   caller says so in the log, once
 */
const traps = async (
    box: BBox,
    context: TrapsContext,
): Promise<{
    poiPoints: Feature<Point, radarTrap.Poi>[];
    polyLines: Feature<LineString, radarTrap.Poly>[];
    error?: string;
}> => {
    let found: Raw[];
    try {
        found = await markers(box, context, 0);
    } catch (error) {
        return { poiPoints: [], polyLines: [], error: (error as Error).message };
    }

    const pois = found.filter(raw => raw.type !== 'closure').map(toPoi);
    checkSchema('a trap', atudoPoisSchema, pois);
    const closures = found
        .filter(raw => raw.type === 'closure')
        .map(toClosure)
        .filter(poly => poly !== null);
    checkSchema('a closed road', atudoPolysSchema, closures);

    const _poiPoints = pois
        .filter(poi => Number.isFinite(+poi.lng) && Number.isFinite(+poi.lat))
        .map(poi => point([+poi.lng, +poi.lat], { ...poi }));

    // the same trap from overlapping boxes of groups, and double reports of the police
    const poiPoints = uniqBy(_poiPoints, point => point.geometry?.coordinates?.join(','));

    const polyLines = uniqBy(closures, poly => poly.backend || (poly.polyline as string)).map(poly =>
        feature(polyline.toGeoJSON(poly.polyline as string), { ...poly }),
    );

    return { poiPoints, polyLines };
};

export { traps };
