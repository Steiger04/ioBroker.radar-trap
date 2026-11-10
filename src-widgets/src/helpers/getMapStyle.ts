/** The layers of the maps, coloured by the settings of the widget - the same as the maps of the configuration */

import type { LayerProps } from 'react-map-gl';

import { getMapLayer, type MapStyleData, type MapStyleKey } from '@radar-trap/mapLayers';

export type { MapStyleData, MapStyleKey };

/**
 * One layer of the map
 *
 * @param key which layer
 * @param data the settings of the widget
 */
export function getMapStyle(key: MapStyleKey, data: MapStyleData): LayerProps {
    return getMapLayer(key, data) as LayerProps;
}
