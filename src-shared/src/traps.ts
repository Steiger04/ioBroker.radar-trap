/**
 * What all front-ends of radar-trap know about traps: the vis-2 widgets, the tile of the devices app and the web
 * component. Pure TypeScript without React or MUI, so every build compiles it in through the `@radar-trap` alias.
 *
 * ## Where the traps come from
 *
 * The adapter writes them twice:
 * - into its feathers server (`areas` and `routes`), which the map widgets of vis-2 read over socket.io, because
 *   only it has the polygon of an area, the line of a route and the closed sections of road;
 * - into states, one list per kind of trap: `radar-trap.0.<id>.area-current.<typeName>` of an area and
 *   `radar-trap.0.<id>.direction-0-route-current.<typeName>` of a route, each a JSON array of {@link TrapFeature}.
 *   The tile and the web component read these - they need neither the port of the feathers server nor a
 *   mapbox token.
 */

/** Prefix of every word of `src-shared/i18n`; vis-2 is told it by `translations.ts` of the widgets */
export const PREFIX = 'radar_trap_';

/** The information about one trap the adapter adds (`src/server/hooks/addTrapInfoToTrapProperties.ts`) */
export interface TrapInfo {
    id?: string;
    /** `NEW` or `ESTABLISHED` */
    status?: string;
    /** Name of the list state the trap is in, e.g. `speedCamera` */
    typeName?: string;
    longitude?: number;
    latitude?: number;
    reason?: string | false;
    /** Length of a traffic jam in km */
    length?: string | number | false;
    /** In minutes */
    duration?: number | false;
    /** In minutes */
    delay?: number | false;
    createDate?: string | false;
    confirmDate?: string | false;
    /** Maximum speed: a number as text, `V` if unknown, `/` or false if there is none */
    vmax?: string | false;
    /** English name of the category, e.g. `mobile speed camera` */
    typeDesc?: string | false;
    /** English name of the kind of trap, e.g. `speed camera` */
    typeText?: string | false;
    country?: string | false;
    state?: string | false;
    zipCode?: string | false;
    city?: string | false;
    cityDistrict?: string | false;
    street?: string | false;
}

/** A trap as the list states hold it: the trap info is the whole of `properties` */
export interface TrapFeature {
    type: 'Feature';
    geometry: { type: string; coordinates: number[] | number[][] };
    properties: TrapInfo;
}

/** The map icons of `src-shared/assets/map-icons`, by name without `icon-` and `-sdf.png` */
export type CategoryIcon = 'road-work-22-26' | 'traffic-jam-20' | 'danger-spot' | 'speed-camera' | 'mobile-speed-camera-hotspot-2015' | 'police-report-vwd-vwda';

export type CategoryKey =
    | 'constructionSite'
    | 'trafficJamEnd'
    | 'dangerSpot'
    | 'fixedSpeedCamera'
    | 'semiStationarySpeedCamera'
    | 'mobileSpeedCamera'
    | 'mobileSpeedCameraHotspot'
    | 'policeReport'
    | 'policeReportArchive';

export interface Category {
    key: CategoryKey;
    /** English name, `typeDesc` of a trap and the source of its word */
    text: string;
    icon: CategoryIcon;
    /** The atudo types of the category, as `src/lib/atudo/determineTrapTypes.ts` sorts them */
    types: string[];
}

/** The categories in the order of the old info widget */
export const CATEGORIES: readonly Category[] = [
    { key: 'constructionSite', text: 'construction site', icon: 'road-work-22-26', types: ['22', '26'] },
    { key: 'trafficJamEnd', text: 'traffic jam end', icon: 'traffic-jam-20', types: ['20'] },
    { key: 'dangerSpot', text: 'danger spot', icon: 'danger-spot', types: ['21', '23', '24', '25', '29'] },
    {
        key: 'fixedSpeedCamera',
        text: 'fixed speed camera',
        icon: 'speed-camera',
        types: ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115'],
    },
    { key: 'semiStationarySpeedCamera', text: 'semi-stationary speed camera', icon: 'speed-camera', types: ['ts'] },
    {
        key: 'mobileSpeedCamera',
        text: 'mobile speed camera',
        icon: 'speed-camera',
        types: ['0', '1', '2', '3', '4', '5', '6', '7', '11', '12'],
    },
    {
        key: 'mobileSpeedCameraHotspot',
        text: 'mobile speed camera hotspot',
        icon: 'mobile-speed-camera-hotspot-2015',
        types: ['2015'],
    },
    { key: 'policeReport', text: 'police report', icon: 'police-report-vwd-vwda', types: ['vwd'] },
    { key: 'policeReportArchive', text: 'police report, archive', icon: 'police-report-vwd-vwda', types: ['vwda'] },
];

/** English name of every atudo type, `typeText` of a trap */
export const TYPE_TEXTS: Readonly<Record<string, string>> = {
    0: 'unknown',
    1: 'speed camera',
    2: 'traffic light camera',
    3: 'weight control',
    4: 'general traffic control',
    5: 'alcohol control',
    6: 'distance control',
    7: 'speed camera',
    11: 'traffic light camera',
    12: 'Section Control',
    20: 'traffic jam end',
    21: 'accident',
    22: 'day construction site',
    23: 'obstacle',
    24: 'risk of slipping',
    25: 'visual obstruction',
    26: 'permanent construction site',
    29: 'defective vehicle',
    101: 'distance control',
    102: 'dummy',
    103: 'ramp control',
    104: 'bus lane control',
    105: 'entry control',
    106: 'pedestrian crossing',
    107: 'speed camera',
    108: 'weight control',
    109: 'height control',
    110: 'traffic light and speed camera',
    111: 'traffic light camera',
    112: 'Section Control',
    113: 'section control end',
    114: 'speed camera in tunnel',
    115: 'no overtaking',
    2015: 'mobile speed camera hotspot',
    vwd: 'police report',
    vwda: 'police report, archive',
    ts: 'speed camera, semi-stationary',
};

/** Names of the list states below `area-current` / `direction-0-route-current` (`typeName` of a trap) */
export const TRAP_NAMES = [
    'unknown',
    'speedCamera',
    'trafficLightCamera',
    'weightControl',
    'generalTrafficControl',
    'alcoholControl',
    'distanceControl',
    'sectionControl',
    'trafficJamEnd',
    'accident',
    'dayConstructionSite',
    'obstacle',
    'riskOfSlipping',
    'visualObstruction',
    'permanentConstructionSite',
    'defectiveVehicle',
    'dummy',
    'rampControl',
    'busLaneControl',
    'entryControl',
    'pedestrianCrossing',
    'heightControl',
    'trafficLightAndSpeedCamera',
    'sectionControlEnd',
    'speedCameraInTunnel',
    'noOvertaking',
    'mobileSpeedCameraHotspot',
    'policeReport',
    'policeReportArchive',
    'semiStationarySpeedCamera',
] as const;

/** Which kinds of trap of which category a vis-2 widget shows: `visTraps[category][camelCase(typeText)]` */
export type VisTraps = Partial<Record<CategoryKey, Record<string, boolean>>>;

/** The default of the setting `visTraps` of the vis-2 widgets, as the old widget set had it */
export const VIS_TRAPS_DEFAULT: Readonly<Record<CategoryKey, Readonly<Record<string, boolean>>>> = {
    constructionSite: {
        dayConstructionSite: true,
        permanentConstructionSite: true,
    },
    trafficJamEnd: {
        trafficJamEnd: true,
    },
    dangerSpot: {
        accident: true,
        obstacle: true,
        riskOfSlipping: true,
        visualObstruction: true,
        defectiveVehicle: true,
    },
    fixedSpeedCamera: {
        distanceControl: true,
        dummy: true,
        rampControl: true,
        busLaneControl: true,
        entryControl: true,
        pedestrianCrossing: true,
        speedCamera: true,
        weightControl: true,
        heightControl: true,
        trafficLightAndSpeedCamera: true,
        trafficLightCamera: true,
        sectionControl: true,
        sectionControlEnd: true,
        speedCameraInTunnel: true,
        noOvertaking: true,
    },
    semiStationarySpeedCamera: {
        speedCameraSemiStationary: true,
    },
    mobileSpeedCamera: {
        unknown: true,
        speedCamera: true,
        trafficLightCamera: true,
        weightControl: true,
        generalTrafficControl: true,
        alcoholControl: true,
        distanceControl: true,
        sectionControl: true,
    },
    mobileSpeedCameraHotspot: {
        mobileSpeedCameraHotspot: false,
    },
    policeReport: {
        policeReport: true,
    },
    policeReportArchive: {
        policeReportArchive: false,
    },
};

/**
 * `camelCase` of lodash for the English names of categories and kinds: `police report, archive` ->
 * `policeReportArchive`, `Section Control` -> `sectionControl`
 *
 * @param text an English name
 */
export function camelCase(text: string): string {
    return text
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((word, i) => {
            const lower = word.toLowerCase();
            return i ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
        })
        .join('');
}

/**
 * The key of an English name in `src-shared/i18n`: `police report, archive` -> `radar_trap_police_report_archive`
 *
 * @param text an English name of a category or a kind of trap
 */
export function wordKey(text: string): string {
    return (
        PREFIX +
        text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
    );
}

/**
 * Whether a vis-2 widget shows a trap. A kind the setting does not know yet (it was saved by an older version) is
 * shown.
 *
 * @param info typeDesc, typeText and status of the trap
 * @param visTraps the setting `visTraps` of the widget
 * @param onlyNew the setting `onlyNewTraps`
 */
export function isTrapVisible(
    info: { typeDesc?: string | false; typeText?: string | false; status?: string } | undefined | null,
    visTraps: VisTraps | undefined | null,
    onlyNew: boolean | undefined,
): boolean {
    if (!info?.typeDesc || !info.typeText) {
        return false;
    }
    if (onlyNew && info.status !== 'NEW') {
        return false;
    }
    const category = (visTraps || VIS_TRAPS_DEFAULT)[camelCase(info.typeDesc) as CategoryKey];
    if (!category) {
        return false;
    }
    return category[camelCase(info.typeText)] !== false;
}

/**
 * The maximum speed of a trap for display
 *
 * @param vmax `vmax` of the trap info
 * @returns `unknown` if the trap has one that is not known, the speed in km/h, or null if it has none
 */
export function formatVmax(vmax: string | number | false | undefined | null): 'unknown' | string | null {
    if (vmax === undefined || vmax === null || vmax === false || vmax === '' || vmax === '/') {
        return null;
    }
    if (vmax === 'V' || vmax === 'v') {
        return 'unknown';
    }
    return `${vmax} km/h`;
}

/** An area or a route: `native.type` of its device object */
export type TrapSourceType = 'AREA' | 'ROUTE';

/**
 * Where the adapter writes the traps and the information about an area or a route.
 *
 * A route is asked for without alternatives, so there is always exactly one direction, `direction-0`.
 * `lastUpdated` of a route lies below `description` - that is how `src/lib/createRouteObjects.ts` creates it.
 *
 * @param device ID of the device, `radar-trap.0.<id>`
 * @param type `native.type` of the device
 */
export function getTrapIds(
    device: string,
    type: TrapSourceType,
): { lists: string[]; description: string; lastUpdated: string; run: string } {
    const channel = type === 'AREA' ? `${device}.area-current` : `${device}.direction-0-route-current`;
    const infos = type === 'AREA' ? `${device}.area-infos` : `${device}.direction-0-infos`;
    return {
        lists: TRAP_NAMES.map(name => `${channel}.${name}`),
        description: `${infos}.description`,
        lastUpdated: type === 'AREA' ? `${infos}.lastUpdated` : `${infos}.description.lastUpdated`,
        run: `${device}.cron-job.run`,
    };
}

/**
 * The device of an area or a route from an ID the user picked: the device itself or any object below it
 *
 * @param id e.g. `radar-trap.0.abc123` or `radar-trap.0.abc123.area-infos.description`
 * @returns `radar-trap.0.abc123`, or null if the ID is not one of radar-trap
 */
export function getDeviceId(id: string | undefined | null): string | null {
    const match = (id || '').trim().match(/^(radar-trap\.\d+\.[^.]+)/);
    if (!match || /^radar-trap\.\d+\.(info|cron-job)$/.test(match[1])) {
        return null;
    }
    return match[1];
}

/**
 * The traps of the list states of one area or route
 *
 * @param values the values of the list states, in any order
 */
export function parseTraps(values: (ioBroker.StateValue | undefined)[]): TrapFeature[] {
    const traps: TrapFeature[] = [];
    for (const value of values) {
        if (typeof value !== 'string' || !value) {
            continue;
        }
        try {
            const list = JSON.parse(value) as TrapFeature[];
            if (Array.isArray(list)) {
                traps.push(...list.filter(trap => trap?.properties));
            }
        } catch {
            // a list the adapter is just writing; the next value comes soon
        }
    }
    return traps;
}

/** Which traps the tile and the web component show */
export interface TrapFilter {
    /** Only traps that are new since the last search */
    onlyNew?: boolean;
    /** The places where the police often controls with mobile speed cameras */
    showHotspots?: boolean;
    /** Old police reports */
    showArchive?: boolean;
}

/** The traps of one category */
export interface TrapGroup {
    category: Category;
    traps: TrapFeature[];
    /** How many of them are new */
    newCount: number;
}

/**
 * The traps by category, in the order of {@link CATEGORIES}; categories without traps are left out
 *
 * @param traps all traps of the area or route
 * @param filter what to show
 */
export function groupTraps(traps: TrapFeature[], filter: TrapFilter): TrapGroup[] {
    const groups: TrapGroup[] = [];
    for (const category of CATEGORIES) {
        if (category.key === 'mobileSpeedCameraHotspot' && !filter.showHotspots) {
            continue;
        }
        if (category.key === 'policeReportArchive' && !filter.showArchive) {
            continue;
        }
        const own = traps.filter(
            trap =>
                trap.properties.typeDesc === category.text && (!filter.onlyNew || trap.properties.status === 'NEW'),
        );
        if (own.length) {
            groups.push({
                category,
                traps: own,
                newCount: own.filter(trap => trap.properties.status === 'NEW').length,
            });
        }
    }
    return groups;
}

/**
 * The time of the last search for display
 *
 * @param value `lastUpdated` of the area or route (`Date.toString()` of the adapter)
 * @param lang the language of the system
 */
export function formatLastUpdate(value: ioBroker.StateValue | undefined, lang: string): string {
    if (value === undefined || value === null || value === '') {
        return '';
    }
    const date = new Date(typeof value === 'number' ? value : String(value));
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    try {
        return date.toLocaleString(lang === 'zh-cn' ? 'zh-CN' : lang, {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return date.toLocaleString();
    }
}

/**
 * The address of a trap in one line: street, zip code and city, district
 *
 * @param info the trap info
 */
export function formatAddress(info: TrapInfo): string {
    const city = [info.zipCode, info.city].filter(Boolean).join(' ');
    return [info.street, city, info.cityDistrict].filter(Boolean).join(', ');
}
