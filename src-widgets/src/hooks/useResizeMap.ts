/** Fits the map to the area or route: when the widget changes its size, when the window does, and on request */

import type { RefObject } from 'react';
import { useCallback, useEffect } from 'react';
import type { MapRef } from 'react-map-gl';

import type { FeathersClient } from '../feathers';
import type { SourceStatus } from './useRadarTrapSource';
import { useRadarTrapMapBox } from './useRadarTrapMapBox';

export function useResizeMap({
    _id,
    width,
    height,
    feathersClient,
    map,
}: {
    _id: string | null;
    width: unknown;
    height: unknown;
    feathersClient: FeathersClient | null;
    map: RefObject<MapRef | null>;
}): { resizeMap: (animate: boolean) => void; boxStatus: SourceStatus } {
    const { status: boxStatus, directionsBox } = useRadarTrapMapBox(_id, feathersClient);

    const resizeMap = useCallback(
        (animate: boolean): void => {
            if (!map?.current) {
                return;
            }

            if (boxStatus === 'success' && directionsBox) {
                map.current.resize();
                map.current.fitBounds(
                    [
                        [directionsBox[0], directionsBox[1]],
                        [directionsBox[2], directionsBox[3]],
                    ],
                    { animate, padding: 10 },
                );
            }
        },
        [boxStatus, directionsBox, map],
    );

    useEffect(() => {
        if (!map?.current) {
            return;
        }

        resizeMap(false);
    }, [height, width, map, resizeMap]);

    useEffect(() => {
        let resizeTimer: ReturnType<typeof setTimeout> | undefined;

        const handleResize = (): void => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => resizeMap(false), 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', handleResize);
        };
    }, [resizeMap]);

    return { resizeMap, boxStatus };
}
