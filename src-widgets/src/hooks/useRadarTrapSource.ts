/**
 * The geometry and the traps of one area or route, from the feathers server - kept up to date while the adapter
 * searches again (`created` event of the services).
 *
 * The ID is tried as an area and as a route at the same time; the one that is not found ends in `error`.
 */

import { featureCollection } from '@turf/helpers';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useCallback, useEffect, useState } from 'react';

import type { FeathersClient } from '../feathers';

export type SourceStatus = 'idle' | 'loading' | 'success' | 'error';

export interface RadarTrapSource {
    directions: unknown;
    directionsFeatureCollection: FeatureCollection;
    trapsFeatureCollection: FeatureCollection;
    polyLinesFeatureCollection: FeatureCollection;
    areaPolygons: Record<string, Feature<Geometry>> | null;
}

/** What the services answer, as far as the widgets read it */
interface SourceData {
    _id?: string;
    directions?: unknown;
    directionsFeatureCollection?: FeatureCollection;
    trapsFeatureCollection?: FeatureCollection;
    polyLinesFeatureCollection?: FeatureCollection;
    areaPolygons?: Record<string, Feature<Geometry>>;
}

function emptySource(): RadarTrapSource {
    return {
        directions: null,
        directionsFeatureCollection: featureCollection([]),
        trapsFeatureCollection: featureCollection([]),
        polyLinesFeatureCollection: featureCollection([]),
        areaPolygons: null,
    };
}

function isEmpty(value: object | null | undefined): boolean {
    return !value || !Object.keys(value).length;
}

export function useRadarTrapSource(
    id: string | null,
    feathersClient: FeathersClient | null,
): {
    source: RadarTrapSource;
    areaSourceStatus: SourceStatus;
    routeSourceStatus: SourceStatus;
    sourceStatus: SourceStatus;
} {
    const [areaData, setAreaData] = useState<SourceData>({});
    const [routeData, setRouteData] = useState<SourceData>({});

    const [areaSourceStatus, setAreaSourceStatus] = useState<SourceStatus>('idle');
    const [routeSourceStatus, setRouteSourceStatus] = useState<SourceStatus>('idle');
    const [sourceStatus, setSourceStatus] = useState<SourceStatus>('idle');

    const [source, setSource] = useState<RadarTrapSource>(emptySource);

    useEffect(() => {
        setAreaSourceStatus('idle');
        setRouteSourceStatus('idle');
        setSourceStatus('idle');
        setAreaData({});
        setRouteData({});
        setSource(emptySource());
    }, [id]);

    useEffect(() => {
        if (!feathersClient || !id) {
            return;
        }

        const areaCreatedHandler = (createdData: SourceData): void => {
            if (createdData._id === id) {
                setAreaSourceStatus('loading');
                setAreaData(createdData);
            }
        };

        const routeCreatedHandler = (createdData: SourceData): void => {
            if (createdData._id === id) {
                setRouteSourceStatus('loading');
                setRouteData(createdData);
            }
        };

        feathersClient.service('areas').on('created', areaCreatedHandler);
        feathersClient.service('routes').on('created', routeCreatedHandler);

        return () => {
            feathersClient.service('areas').removeListener('created', areaCreatedHandler);
            feathersClient.service('routes').removeListener('created', routeCreatedHandler);
        };
    }, [id, feathersClient]);

    const routes = useCallback(async (): Promise<void> => {
        if (!feathersClient || !id) {
            return;
        }

        try {
            setRouteSourceStatus('loading');
            const resData = (await feathersClient.service('routes').get(id, {
                query: { $select: ['directions'] },
            })) as SourceData;

            setRouteData(resData);
        } catch (err) {
            if ((err as { name?: string })?.name === 'NotFound') {
                setRouteData({});
                setRouteSourceStatus('error');
            } else {
                console.log(err);
            }
        }
    }, [id, feathersClient]);

    const areas = useCallback(async (): Promise<void> => {
        if (!feathersClient || !id) {
            return;
        }

        try {
            setAreaSourceStatus('loading');
            const resData = (await feathersClient.service('areas').get(id, {
                query: {
                    $select: ['areaPolygons', 'areaTraps', 'polyLinesFeatureCollection'],
                },
            })) as SourceData;

            setAreaData(resData);
        } catch (err) {
            if ((err as { name?: string })?.name === 'NotFound') {
                setAreaData({});
                setAreaSourceStatus('error');
            } else {
                console.log(err);
            }
        }
    }, [id, feathersClient]);

    useEffect(() => {
        void areas();
    }, [areas]);

    useEffect(() => {
        void routes();
    }, [routes]);

    useEffect(() => {
        if (!isEmpty(routeData)) {
            const { directions, directionsFeatureCollection, trapsFeatureCollection, polyLinesFeatureCollection } =
                routeData;

            setSource({
                directions,
                directionsFeatureCollection: directionsFeatureCollection || featureCollection([]),
                trapsFeatureCollection: trapsFeatureCollection || featureCollection([]),
                polyLinesFeatureCollection: polyLinesFeatureCollection || featureCollection([]),
                areaPolygons: null,
            });

            setRouteSourceStatus('success');
        }
    }, [routeData]);

    useEffect(() => {
        if (!isEmpty(areaData)) {
            const { areaPolygons, trapsFeatureCollection, polyLinesFeatureCollection } = areaData;

            setSource({
                directions: null,
                directionsFeatureCollection: featureCollection([]),
                trapsFeatureCollection: trapsFeatureCollection || featureCollection([]),
                polyLinesFeatureCollection: polyLinesFeatureCollection || featureCollection([]),
                areaPolygons: isEmpty(areaPolygons) ? null : areaPolygons!,
            });

            setAreaSourceStatus(isEmpty(areaPolygons) ? 'error' : 'success');
        }
    }, [areaData]);

    useEffect(() => {
        if (areaSourceStatus === 'success' || routeSourceStatus === 'success') {
            setSourceStatus('success');
        } else if (areaSourceStatus === 'error' && routeSourceStatus === 'error') {
            setSourceStatus('error');
        } else {
            setSourceStatus('loading');
        }
    }, [areaSourceStatus, routeSourceStatus]);

    return {
        source,
        areaSourceStatus,
        routeSourceStatus,
        sourceStatus,
    };
}
