import type { DirectionsService, DirectionsWaypoint } from '@mapbox/mapbox-sdk/services/directions';
import Directions from '@mapbox/mapbox-sdk/services/directions';
import type { MatrixService } from '@mapbox/mapbox-sdk/services/matrix';
import Matrix from '@mapbox/mapbox-sdk/services/matrix';
import { performance } from 'perf_hooks';
import { Scheduler } from '../../lib/Scheduler';
import { trapsChain } from './trapsChain';

import type { Hook, HookContext } from '@feathersjs/feathers';
import polyline from '@mapbox/polyline';
import type { LineString } from '@turf/turf';
import { feature } from '@turf/turf';
import getPoiPolyPointsAsync, { AnalyzedType } from '../../lib/getPoiPolyPointsAsync';
import { countTraps, determineTrapTypes } from '../../lib/atudo/determineTrapTypes';
import { TRAPS_SOURCE } from '../../lib/atudo/traps';
import { getAdapterLog } from '../../lib/adapterRef';

/** What mapbox says when it refuses: the status and its message (an invalid or URL-restricted token, a quota) */
function mapboxError(error: unknown): string {
    const reason = error as { statusCode?: number; message?: string; body?: { message?: string } } | undefined;
    return [reason?.statusCode, reason?.body?.message || reason?.message].filter(Boolean).join(' ') || String(error);
}

const patchOrCreateRoute = (): Hook => {
    let directionsService: DirectionsService | null = null;
    let matrixService: MatrixService | null = null;

    return async (context: HookContext<radarTrap.Route>) => {
        if (!directionsService) {
            directionsService = Directions({
                accessToken: process.env.MAPBOX_TOKEN!,
            });
        }

        if (!matrixService) {
            matrixService = Matrix({
                accessToken: process.env.MAPBOX_TOKEN!,
            });
        }

        const { data, service, params } = context;
        const { _id, activeProfile, maxTrapDistance } = data!;
        // the scheduler passes the route without its name
        const name = data!.description || _id;

        data!.timestamp = new Date().toString();

        Scheduler.pause(_id);
        service.emit('status', { _id: data!._id, status: 'loading' });

        const [record] = (await service.find({
            query: { _id },
            paginate: false,
        })) as radarTrap.Routes;

        if (params.patchSourceFromClient || params.patchSourceFromServer) {
            const matrix = await matrixService
                .getMatrix({
                    points: [
                        {
                            coordinates: data!.src.geometry.coordinates,
                        },
                        {
                            coordinates: data!.dst.geometry.coordinates,
                        },
                    ] as DirectionsWaypoint[],
                    sources: [0],
                    //destinations: [1],
                    profile: activeProfile!.name,
                    annotations: ['duration', 'distance'],
                })
                .send()
                .then(response => response.body)
                .catch(ex => {
                    throw new Error(`mapbox cannot compute the travel time of the route "${name}": ${mapboxError(ex)}`);
                });

            if (process.env.NODE_ENV === 'development') {
                console.log('matrix', matrix);
            }

            const directions = await directionsService
                .getDirections({
                    profile: activeProfile!.name,
                    exclude:
                        activeProfile!.actualExclusion.length > 0
                            ? (activeProfile!.actualExclusion.join(',') as any)
                            : undefined,
                    overview: 'full',
                    /* annotations: [
						"distance",
						"duration",
						"congestion",
						"speed",
					], */
                    alternatives: false,
                    waypoints: [
                        {
                            coordinates: data!.src.geometry.coordinates,
                        },
                        {
                            coordinates: data!.dst.geometry.coordinates,
                        },
                    ] as DirectionsWaypoint[],
                })
                .send()
                .then(response => response.body)
                .catch(ex => {
                    throw new Error(`mapbox cannot compute the route "${name}": ${mapboxError(ex)}`);
                });

            data!.directions = [];
            data!.trapsSource = TRAPS_SOURCE;

            for (const route of directions.routes || []) {
                try {
                    const startTime = performance.now();
                    const directionLine = feature<LineString, radarTrap.Poi>(polyline.toGeoJSON(route.geometry));

                    // eslint-disable-next-line prefer-const
                    let { resultPoiPoints, resultPolyLines } = await getPoiPolyPointsAsync({
                        analyzedFeature: directionLine,
                        type: AnalyzedType.LINESTRING,
                        maxTrapDistance,
                    });
                    console.log('resultPoiPoints >>>', resultPoiPoints.length);
                    console.log('resultPolyLines >>>', resultPolyLines.length);

                    const traps = determineTrapTypes(resultPoiPoints);

                    const endTime = performance.now();
                    console.log(`getTrapsFrom() dauerte: ${(endTime - startTime) / 1_000} Sekunden`);

                    route.duration = matrix.durations![0][1];
                    const length = data!.directions.push({
                        direction: route,
                        matrix,
                        polyLineFeatures: resultPolyLines,
                    });

                    const {
                        traps: routeTraps,
                        establishedTraps,
                        newTraps,
                        rejectedTraps,
                    } = trapsChain(record?.directions?.[length - 1]?.routeTraps, traps);

                    data!.directions[length - 1].routeTraps = routeTraps;
                    data!.directions[length - 1].routeTrapsEstablished = establishedTraps;
                    data!.directions[length - 1].routeTrapsNew = newTraps;
                    data!.directions[length - 1].routeTrapsRejected = rejectedTraps;
                } catch (error) {
                    getAdapterLog().warn(
                        `Cannot compute the traps of the route "${name}": ${(error as Error)?.message || String(error)}`,
                    );
                }
            }

            const log = getAdapterLog();
            if (!data!.directions.length) {
                log.warn(`mapbox found no way for the route "${name}"`);
            }
            data!.directions.forEach((direction, index) => {
                const traps = countTraps(direction.routeTraps);
                const closures = direction.polyLineFeatures?.length || 0;
                const which = data!.directions!.length > 1 ? ` (way ${index + 1})` : '';
                log.info(
                    `The route "${name}"${which}: ${traps} traps and ${closures} closed roads within ${maxTrapDistance} m`,
                );
            });
        }

        if (record !== undefined) {
            context.result = await service.patch(_id, data as Partial<radarTrap.Route>, {
                ...params,
                publishEvent: false,
            });

            // return context;
        }

        return context;
    };
};

export { patchOrCreateRoute };
