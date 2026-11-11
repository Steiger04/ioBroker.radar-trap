/**
 * The routes and areas live in the configuration of the instance (`native.routes`, `native.areas`), where JSON-Config
 * edits them. The adapter computes them - directions, traps - into its database (NeDB, served by feathers to the
 * vis-2 widgets).
 *
 * Up to 2.2.x the database was the only place: the old admin page wrote into it directly. `migrateDatabase` takes
 * those routes and areas into the configuration once. `syncConfig` brings the database in line with the
 * configuration on every start: it computes what is new or whose source changed, takes over a new name or CRON, and
 * removes what the configuration does not have anymore.
 */
import { Cron } from 'croner';

import type { Application } from '../server/declarations';
import { TRAPS_SOURCE } from './atudo/traps';

/** The profiles of mapbox and the exclusions each of them allows */
const ALLOWED_EXCLUSIONS: Readonly<Record<radarTrap.ProfileName, radarTrap.Exclusions[]>> = {
    driving: ['motorway', 'toll', 'ferry', 'unpaved', 'cash_only_tolls'],
    'driving-traffic': ['motorway', 'toll', 'ferry', 'unpaved', 'cash_only_tolls'],
    cycling: ['ferry'],
    walking: ['ferry', 'cash_only_tolls'],
};

const PROFILE_NAMES = Object.keys(ALLOWED_EXCLUSIONS) as radarTrap.ProfileName[];

/** What a route needs from the database to compare it with the configuration */
const ROUTE_FIELDS = [
    '_id',
    'description',
    'src',
    'dst',
    'profiles',
    'activeProfile',
    'maxTrapDistance',
    'cron',
    'directions',
    'trapsSource',
];

/** What an area needs from the database to compare it with the configuration */
const AREA_FIELDS = ['_id', 'description', 'areaPolygons', 'cron', 'areaTraps', 'trapsSource'];

/**
 * The profiles of a route as the database stores them: all four, the chosen one active with its exclusions
 *
 * @param profile the chosen profile
 * @param exclusions what the route avoids; what the profile does not allow is dropped
 */
function toProfiles(profile: radarTrap.ProfileName, exclusions: radarTrap.Exclusions[]): radarTrap.Profile[] {
    return PROFILE_NAMES.map(name => ({
        name,
        active: name === profile,
        allowedExclusion: [...ALLOWED_EXCLUSIONS[name]],
        actualExclusion:
            name === profile ? exclusions.filter(exclusion => ALLOWED_EXCLUSIONS[name].includes(exclusion)) : [],
    }));
}

/**
 * A route of the database as the configuration stores it
 *
 * @param route the route of the database
 */
function routeToConfig(route: radarTrap.Route): radarTrap.ConfigRoute {
    const active = route.activeProfile || route.profiles?.find(profile => profile.active);
    return {
        _id: route._id,
        description: (route.description || '').trim(),
        src: route.src?.address ? { address: route.src.address, geometry: route.src.geometry } : null,
        dst: route.dst?.address ? { address: route.dst.address, geometry: route.dst.geometry } : null,
        profile: active?.name && PROFILE_NAMES.includes(active.name) ? active.name : 'driving',
        exclusions: active?.actualExclusion ? [...active.actualExclusion] : [],
        maxTrapDistance: Number(route.maxTrapDistance) || 10,
        cron: route.cron || '10 * * * *',
    };
}

/**
 * An area of the database as the configuration stores it
 *
 * @param area the area of the database
 */
function areaToConfig(area: radarTrap.Area): radarTrap.ConfigArea {
    return {
        _id: area._id,
        description: (area.description || '').trim(),
        areaPolygons: area.areaPolygons && Object.keys(area.areaPolygons).length ? area.areaPolygons : null,
        cron: area.cron || '10 * * * *',
    };
}

/**
 * Why a CRON pattern cannot be used, or an empty string
 *
 * @param pattern the pattern of a route or an area
 */
function checkCron(pattern: string | undefined): string {
    if (!pattern?.trim()) {
        return 'no CRON pattern';
    }
    try {
        new Cron(pattern.trim(), { paused: true }).stop();
        return '';
    } catch (error) {
        return `invalid CRON pattern "${pattern}": ${(error as Error).message}`;
    }
}

/**
 * Whether a point has two numbers as coordinates
 *
 * @param place a point of a route
 */
function isPlace(place: radarTrap.Place | null | undefined): place is radarTrap.Place {
    const coordinates = place?.geometry?.coordinates;
    return (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        coordinates.every(value => typeof value === 'number' && Number.isFinite(value))
    );
}

/**
 * Why a route of the configuration cannot be computed, or an empty string
 *
 * @param route the route of the configuration
 */
function checkRoute(route: radarTrap.ConfigRoute): string {
    if (!isPlace(route.src)) {
        return 'no start: choose an address from the suggestions';
    }
    if (!isPlace(route.dst)) {
        return 'no destination: choose an address from the suggestions';
    }
    if (!PROFILE_NAMES.includes(route.profile)) {
        return `unknown profile "${route.profile}"`;
    }
    const distance = Number(route.maxTrapDistance);
    if (!Number.isFinite(distance) || distance < 1 || distance > 100) {
        return 'the maximum trap distance must be between 1 and 100';
    }
    return checkCron(route.cron);
}

/**
 * Why an area of the configuration cannot be computed, or an empty string
 *
 * @param area the area of the configuration
 */
function checkArea(area: radarTrap.ConfigArea): string {
    const polygon = area.areaPolygons && Object.values(area.areaPolygons)[0];
    const type = polygon?.geometry?.type;
    if (type !== 'Polygon' && type !== 'MultiPolygon') {
        return 'no area: draw it on the map or choose a county';
    }
    return checkCron(area.cron);
}

/**
 * The route the database stores for a route of the configuration (without what is computed)
 *
 * @param route the route of the configuration, checked
 */
function configToRoute(route: radarTrap.ConfigRoute): radarTrap.Route {
    const profiles = toProfiles(route.profile, Array.isArray(route.exclusions) ? route.exclusions : []);
    return {
        _id: route._id,
        description: (route.description || '').trim() || route._id,
        src: route.src!,
        dst: route.dst!,
        profiles,
        activeProfile: profiles.find(profile => profile.active),
        maxTrapDistance: Number(route.maxTrapDistance),
        cron: route.cron.trim(),
    };
}

/**
 * What decides the directions and traps of a route: when it changes, the route is computed anew
 *
 * @param route a route of the database or of the configuration
 */
function routeSource(route: Partial<radarTrap.Route>): string {
    const active = route.activeProfile || route.profiles?.find(profile => profile.active);
    return JSON.stringify([
        route.src?.geometry?.coordinates,
        route.dst?.geometry?.coordinates,
        active?.name,
        [...(active?.actualExclusion || [])].sort(),
        Number(route.maxTrapDistance),
    ]);
}

/**
 * What decides the traps of an area
 *
 * @param areaPolygons the polygon of the area
 */
function areaSource(areaPolygons: radarTrap.AreaPolygons | null | undefined): string {
    return JSON.stringify(Object.values(areaPolygons || {}).map(polygon => polygon.geometry));
}

/**
 * The IDs a list of the configuration may use: each once, as an object ID
 *
 * @param adapter the adapter, for the log
 * @param kind "route" or "area", for the log
 * @param items the routes or areas of the configuration
 */
function usableIds(
    adapter: ioBroker.AdapterInstanceWithI18n,
    kind: string,
    items: { _id: string; description: string }[],
): Set<string> {
    const ids = new Set<string>();
    for (const item of items) {
        const id = typeof item._id === 'string' ? item._id.trim() : '';
        if (!id || /[^a-zA-Z0-9_-]/.test(id)) {
            adapter.log.warn(`The ${kind} "${item.description}" has no valid ID "${item._id}" and is ignored`);
        } else if (ids.has(id)) {
            adapter.log.warn(`The ${kind} "${item.description}" has the same ID as another one (${id}) and is ignored`);
        } else {
            ids.add(id);
        }
    }
    return ids;
}

/**
 * Takes the routes and areas of the database into the configuration, once. Writing the configuration restarts the
 * instance; the next start finds `dbMigrated` and continues.
 *
 * @param adapter the adapter
 * @param feathers the feathers application with the services `routes` and `areas`
 * @returns true if the configuration was written - the instance restarts now
 */
async function migrateDatabase(adapter: ioBroker.AdapterInstanceWithI18n, feathers: Application): Promise<boolean> {
    const config = adapter.config as ioBroker.INative;
    if (config.dbMigrated) {
        return false;
    }

    const dbRoutes = (await feathers.service('routes').find({
        query: { $limit: -1, $select: ROUTE_FIELDS.filter(field => field !== 'directions') },
    })) as radarTrap.Routes;
    const dbAreas = (await feathers.service('areas').find({
        query: { $limit: -1, $select: AREA_FIELDS.filter(field => field !== 'areaTraps') },
    })) as radarTrap.Areas;

    const routes = Array.isArray(config.routes) ? [...config.routes] : [];
    const areas = Array.isArray(config.areas) ? [...config.areas] : [];
    for (const route of dbRoutes) {
        if (!routes.some(item => item._id === route._id)) {
            routes.push(routeToConfig(route));
        }
    }
    for (const area of dbAreas) {
        if (!areas.some(item => item._id === area._id)) {
            areas.push(areaToConfig(area));
        }
    }

    adapter.log.info(
        `Took ${dbRoutes.length} route(s) and ${dbAreas.length} area(s) into the configuration, the instance restarts`,
    );
    await adapter.extendForeignObjectAsync(`system.adapter.${adapter.namespace}`, {
        native: { routes, areas, dbMigrated: true },
    });
    return true;
}

/**
 * Brings the database in line with the configuration: computes new routes and areas and those whose source changed,
 * takes over the name and the CRON of the others and removes what the configuration does not have. The objects of
 * the routes and areas are made afterwards from the database (`createAllAreaAndRouteObjects`).
 *
 * @param adapter the adapter
 * @param feathers the feathers application with the services `routes` and `areas`
 */
async function syncConfig(adapter: ioBroker.AdapterInstanceWithI18n, feathers: Application): Promise<void> {
    const config = adapter.config as ioBroker.INative;
    const hasToken = !!config.settings?.mbxAccessToken;
    const routes = Array.isArray(config.routes) ? config.routes : [];
    const areas = Array.isArray(config.areas) ? config.areas : [];

    // the routes
    const routeService = feathers.service('routes');
    const dbRoutes = (await routeService.find({ query: { $limit: -1, $select: ROUTE_FIELDS } })) as radarTrap.Routes;
    const routeIds = usableIds(adapter, 'route', routes);
    const keepRoutes = new Set<string>();

    for (const item of routes) {
        const id = typeof item._id === 'string' ? item._id.trim() : '';
        if (!routeIds.has(id) || keepRoutes.has(id)) {
            continue;
        }
        keepRoutes.add(id);
        const problem = checkRoute(item);
        if (problem) {
            adapter.log.warn(`The route "${item.description}" is not computed: ${problem}`);
            continue;
        }
        const route = configToRoute({ ...item, _id: id });
        const stored = dbRoutes.find(dbRoute => dbRoute._id === id);
        try {
            const outdated = !!stored?.directions?.length && stored.trapsSource !== TRAPS_SOURCE;
            if (!stored || !stored.directions?.length || outdated || routeSource(stored) !== routeSource(route)) {
                if (!hasToken) {
                    adapter.log.warn(`The route "${route.description}" is not computed: the mapbox token is missing`);
                    continue;
                }
                adapter.log.info(
                    outdated
                        ? `Computing the route "${route.description}" again: its traps are from atudo, which no longer answers`
                        : `Computing the route "${route.description}"`,
                );
                await routeService.create(route, { patchSourceFromServer: true });
            } else if (
                stored.description !== route.description ||
                stored.cron !== route.cron ||
                JSON.stringify(stored.profiles) !== JSON.stringify(route.profiles)
            ) {
                await routeService.patch(id, {
                    description: route.description,
                    cron: route.cron,
                    profiles: route.profiles,
                    activeProfile: route.activeProfile,
                });
            }
        } catch (error) {
            adapter.log.error(`Cannot compute the route "${route.description}": ${(error as Error).message}`);
        }
    }

    for (const stored of dbRoutes) {
        if (!keepRoutes.has(stored._id)) {
            adapter.log.info(`Removing the route "${stored.description}"`);
            await routeService.remove(stored._id).catch((error: Error) => adapter.log.warn(error.message));
            await adapter.delObjectAsync(stored._id, { recursive: true }).catch(() => undefined);
        }
    }

    // the areas
    const areaService = feathers.service('areas');
    const dbAreas = (await areaService.find({ query: { $limit: -1, $select: AREA_FIELDS } })) as radarTrap.Areas;
    const areaIds = usableIds(adapter, 'area', areas);
    const keepAreas = new Set<string>();

    for (const item of areas) {
        const id = typeof item._id === 'string' ? item._id.trim() : '';
        if (!areaIds.has(id) || keepAreas.has(id)) {
            continue;
        }
        keepAreas.add(id);
        const problem = checkArea(item);
        if (problem) {
            adapter.log.warn(`The area "${item.description}" is not computed: ${problem}`);
            continue;
        }
        const area: radarTrap.Area = {
            _id: id,
            description: (item.description || '').trim() || id,
            areaPolygons: item.areaPolygons,
            cron: item.cron.trim(),
        };
        const stored = dbAreas.find(dbArea => dbArea._id === id);
        try {
            const outdated = !!stored?.areaTraps && stored.trapsSource !== TRAPS_SOURCE;
            if (
                !stored ||
                !stored.areaTraps ||
                outdated ||
                areaSource(stored.areaPolygons) !== areaSource(area.areaPolygons)
            ) {
                adapter.log.info(
                    outdated
                        ? `Computing the area "${area.description}" again: its traps are from atudo, which no longer answers`
                        : `Computing the area "${area.description}"`,
                );
                await areaService.create(area, { patchSourceFromServer: true });
            } else if (
                stored.description !== area.description ||
                stored.cron !== area.cron ||
                JSON.stringify(stored.areaPolygons) !== JSON.stringify(area.areaPolygons)
            ) {
                await areaService.patch(id, {
                    description: area.description,
                    cron: area.cron,
                    areaPolygons: area.areaPolygons,
                });
            }
        } catch (error) {
            adapter.log.error(`Cannot compute the area "${area.description}": ${(error as Error).message}`);
        }
    }

    for (const stored of dbAreas) {
        if (!keepAreas.has(stored._id)) {
            adapter.log.info(`Removing the area "${stored.description}"`);
            await areaService.remove(stored._id).catch((error: Error) => adapter.log.warn(error.message));
            await adapter.delObjectAsync(stored._id, { recursive: true }).catch(() => undefined);
        }
    }
}

export { checkCron, migrateDatabase, syncConfig };
