/**
 * The box the map shows: around the area or the route, or - if neither exists - 10 km around the place the
 * public IP address of the browser is located at.
 */

import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import type { BBox } from 'geojson';
import { useCallback, useEffect, useState } from 'react';

import type { FeathersClient } from '../feathers';
import { square } from '../helpers/square';
import { useRadarTrapSource, type SourceStatus } from './useRadarTrapSource';

const cache = new Map<string, { lon: number; lat: number } | undefined>();

export function useRadarTrapMapBox(
    id: string | null,
    feathersClient: FeathersClient | null,
): { status: SourceStatus; directionsBox: BBox | null } {
    const [status, setStatus] = useState<SourceStatus>('idle');
    const [directionsBox, setDirectionsBox] = useState<BBox | null>(null);

    const {
        source: { directionsFeatureCollection, areaPolygons },
        areaSourceStatus,
        routeSourceStatus,
    } = useRadarTrapSource(id, feathersClient);

    const fetchData = useCallback(async (): Promise<void> => {
        const url = 'http://ip-api.com/json?fields=lon,lat';

        setStatus('loading');
        let json = cache.get(url);
        if (!cache.has(url)) {
            json = await fetch(url)
                .then(response => response.json() as Promise<{ lon: number; lat: number }>)
                .catch((ex: unknown) => {
                    console.log(`useRadarTrapMapBox() -> fetch(): url=${url} -> Error: ${String(ex)}`);
                    return undefined;
                });
            cache.set(url, json);
        }

        if (!json) {
            setStatus('error');
            return;
        }

        const box = bbox(square([json.lon, json.lat], 10));

        setDirectionsBox([
            Number(box[1].toFixed(5)),
            Number(box[0].toFixed(5)),
            Number(box[3].toFixed(5)),
            Number(box[2].toFixed(5)),
        ]);

        setStatus('success');
    }, []);

    useEffect(() => {
        if (areaSourceStatus === 'error' && routeSourceStatus === 'error') {
            fetchData().catch((ex: unknown) => {
                setStatus('error');
                console.log(`useRadarTrapMapBox() -> fetchData() -> Error: ${String(ex)}`);
            });
        }
    }, [areaSourceStatus, routeSourceStatus, fetchData]);

    useEffect(() => {
        if (!areaPolygons) {
            return;
        }

        if (areaSourceStatus === 'success') {
            setDirectionsBox(bbox(featureCollection(Object.values(areaPolygons))));
            setStatus('success');
            return;
        }

        if (areaSourceStatus === 'loading') {
            setStatus('loading');
        }
    }, [areaSourceStatus, areaPolygons]);

    useEffect(() => {
        if (!directionsFeatureCollection.features.length) {
            return;
        }

        if (routeSourceStatus === 'success') {
            setDirectionsBox(bbox(directionsFeatureCollection));
            setStatus('success');
            return;
        }

        if (routeSourceStatus === 'loading') {
            setStatus('loading');
        }
    }, [routeSourceStatus, directionsFeatureCollection]);

    return { status, directionsBox };
}
