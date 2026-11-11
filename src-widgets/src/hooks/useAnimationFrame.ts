/** Lets the dashes of the closed and congested sections of road run, outside the editor only */

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { MapRef } from 'react-map-gl';

import type { MapImageStatus } from './useMapImages';

const dashArraySequence = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5],
    [0, 1, 3, 3],
    [0, 1.5, 3, 2.5],
    [0, 2, 3, 2],
    [0, 2.5, 3, 1.5],
    [0, 3, 3, 1],
    [0, 3.5, 3, 0.5],
];

export function useAnimationFrame(
    editMode: boolean,
    map: RefObject<MapRef | null>,
    mapImageStatus: MapImageStatus,
    closedCongestedRoad: boolean | undefined,
    animateClosedCongestedRoad: boolean | undefined,
): void {
    const frame = useRef(0);

    const animateDashArray = useCallback(
        (timestamp: number, step: number): number => {
            const mapboxMap = map.current?.getMap();
            if (!mapboxMap) {
                return step;
            }

            const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);

            if (newStep !== step && mapboxMap.getLayer('line-dashed')) {
                mapboxMap.setPaintProperty('line-dashed', 'line-dasharray', dashArraySequence[newStep]);
            }

            return newStep;
        },
        [map],
    );

    const animate = useCallback(
        (timestamp: number, step: number): void => {
            const newStep = animateDashArray(timestamp, step);
            frame.current = requestAnimationFrame(ts => animate(ts, newStep));
        },
        [animateDashArray],
    );

    useEffect(() => {
        if (!editMode && mapImageStatus === 'success' && closedCongestedRoad && animateClosedCongestedRoad) {
            frame.current = requestAnimationFrame(timestamp => animate(timestamp, 0));
        } else {
            cancelAnimationFrame(frame.current);
        }

        return () => cancelAnimationFrame(frame.current);
    }, [editMode, mapImageStatus, closedCongestedRoad, animateClosedCongestedRoad, animate]);
}
