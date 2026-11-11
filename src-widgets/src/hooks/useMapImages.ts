/**
 * Sets the style of the map and adds the icons of the traps to it - again after every change of the style, which
 * drops all images.
 *
 * `loadMapImages` is the callback ref of the map: it is called with the map once it exists.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl';

import { MAP_IMAGES } from '../helpers/mapIcons';

export type MapImageStatus = 'idle' | 'loading' | 'success';

export function useMapImages(styleSelect: string | undefined): {
    mapRef: React.RefObject<MapRef | null>;
    status: MapImageStatus;
    loadMapImages: (map: MapRef | null) => void;
} {
    const mapRef = useRef<MapRef | null>(null);
    const [status, setStatus] = useState<MapImageStatus>('idle');
    const [loadImages, setLoadImages] = useState<(() => void) | null>(null);

    const loadMapImages = useCallback((map: MapRef | null): void => {
        mapRef.current = map;
        if (!map) {
            return;
        }

        const _loadImages = (): void => {
            setStatus('loading');
            const loading: Promise<void>[] = [];
            const mapboxMap = map.getMap();
            for (const image of MAP_IMAGES) {
                if (!mapboxMap.hasImage(image.id)) {
                    loading.push(
                        new Promise<void>((resolve, reject) => {
                            mapboxMap.loadImage(image.png, (error, mapImage) => {
                                if (error || !mapImage) {
                                    reject(error || new Error(`cannot load ${image.id}`));
                                    return;
                                }
                                if (!mapboxMap.hasImage(image.id)) {
                                    mapboxMap.addImage(image.id, mapImage, {
                                        sdf: image.id !== 'icon-traffic-closure',
                                    });
                                }
                                resolve();
                            });
                        }).catch((ex: unknown) => console.log(`useMapImages() -> loadImages() -> Error: ${String(ex)}`)),
                    );
                }
            }
            Promise.all(loading)
                .then(() => setStatus('success'))
                .catch((ex: unknown) => console.log(ex));
        };

        setLoadImages(() => _loadImages);
    }, []);

    useEffect(() => {
        if (!mapRef.current || !loadImages) {
            return;
        }
        mapRef.current.getMap().setStyle(`mapbox://styles/mapbox/${styleSelect || 'streets-v12'}`, {
            diff: false,
        });
        loadImages();
    }, [styleSelect, loadImages]);

    return {
        mapRef,
        status,
        loadMapImages,
    };
}
