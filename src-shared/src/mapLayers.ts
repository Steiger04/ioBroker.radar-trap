/**
 * The layers of the maps of the traps: the route, the area, the traps and their clusters, closed and congested
 * sections of road. The vis-2 widgets (mapbox-gl) and the maps of the configuration (MapLibre) draw the same layers;
 * they only differ in the font of the texts, which the server of the glyphs of the style must have.
 */

/** A layer as mapbox-gl and MapLibre take it - typed loosely, each library checks it itself */
export interface MapLayer {
    id: string;
    type: 'line' | 'fill' | 'circle' | 'symbol';
    source?: string;
    filter?: unknown[];
    layout?: Record<string, unknown>;
    paint?: Record<string, unknown>;
}

/** The colours and sizes of the settings of the map widgets */
export interface MapStyleData {
    routeColor?: string;
    routeWidth?: number;
    polygonColor?: string;
    polygonBorderColor?: string;
    polygonBorder?: number;
    clusterColor?: string;
    clusterTextColor?: string;
    symbolColor?: string;
    symbolTextColor?: string;
    symbolNewColor?: string;
    symbolTextNewColor?: string;
}

export type MapStyleKey =
    | 'route'
    | 'areaSurface'
    | 'areaSurfaceBorder'
    | 'clusterTraps'
    | 'clusterTrapsCount'
    | 'traps'
    | 'lineBackground'
    | 'lineDashed'
    | 'trafficClosure';

/** The font of the styles of mapbox */
export const MAPBOX_FONT = ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'];

/**
 * One layer of the map
 *
 * @param key which layer
 * @param data the colours and sizes, e.g. the settings of the widget
 * @param font the font of the texts, as the glyphs of the style have it
 */
export function getMapLayer(key: MapStyleKey, data: MapStyleData, font: string[] = MAPBOX_FONT): MapLayer {
    const TEXT_FONT = ['literal', font];
    const clusterColor = data.clusterColor || 'rgba(197,14,228,0.4)';
    const symbolColor = data.symbolColor || 'rgba(13,77,133,0.8)';
    const symbolTextColor = data.symbolTextColor || 'rgba(10,34,55,0.95)';

    const styles: Record<MapStyleKey, MapLayer> = {
        route: {
            id: 'route',
            type: 'line',
            source: 'directions',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
            },
            paint: {
                'line-color': data.routeColor || '#9C27B0',
                'line-width': Number(data.routeWidth) || 5,
                'line-opacity': 1.0,
            },
        },
        // Areas
        areaSurface: {
            id: 'area-surface',
            type: 'fill',
            source: 'areaPolygons',
            paint: {
                'fill-color': data.polygonColor || 'rgba(10,138,232,0.15)',
                'fill-opacity': 1.0,
            },
        },
        areaSurfaceBorder: {
            id: 'area-surface-border',
            type: 'line',
            source: 'areaPolygons',
            paint: {
                'line-color': data.polygonBorderColor || 'rgba(61,156,226,0.6)',
                'line-width': Number(data.polygonBorder ?? 4),
            },
        },
        // cluster
        clusterTraps: {
            id: 'cluster-traps',
            type: 'circle',
            source: 'traps',
            filter: ['has', 'point_count'],
            paint: {
                'circle-opacity': 1.0,
                'circle-color': ['step', ['get', 'point_count'], clusterColor, 100, clusterColor, 750, clusterColor],
                'circle-radius': ['step', ['get', 'point_count'], 12, 9, 15, 100, 18],
            },
        },
        clusterTrapsCount: {
            id: 'cluster-traps-count',
            type: 'symbol',
            filter: ['has', 'point_count'],
            layout: {
                'text-allow-overlap': true,
                'text-size': 12,
                'text-field': [
                    'format',
                    ['get', 'point_count_abbreviated'],
                    {
                        'text-font': TEXT_FONT,
                        'text-color': data.clusterTextColor || 'rgba(52,27,57,0.95)',
                    },
                ],
            },
        },
        // the traps
        traps: {
            id: 'traps',
            type: 'symbol',
            source: 'traps',
            layout: {
                'icon-allow-overlap': true,
                'icon-image': [
                    'match',
                    ['get', 'type'],
                    '0',
                    'unknown',
                    '4',
                    'general-traffic-control',
                    '5',
                    'alcohol-control',
                    '103',
                    'ramp-control',
                    '106',
                    'pedestrian-crossing',
                    ['1', '7', '107', '201', 'ts'],
                    'speed-camera',
                    ['6', '206'],
                    'mobile-distance-speed-camera',
                    '20',
                    'traffic-jam',
                    '21',
                    'accident',
                    '23',
                    'obstacle',
                    '24',
                    'risk-of-slipping',
                    ['22', '26'],
                    'road-work',
                    '25',
                    'visual-obstruction',
                    '29',
                    'breakdown',
                    '101',
                    'fixed-distance-speed-camera',
                    '104',
                    'bus-lane',
                    '105',
                    'icon-traffic-closure',
                    ['3', '108'],
                    'weight-control',
                    '109',
                    'height-control',
                    ['2', '110'],
                    'combined-fixed',
                    ['11', '111'],
                    'redlight-fixed',
                    ['12', '112'],
                    'section-control-start',
                    '113',
                    'section-control-end',
                    '114',
                    'tunnel-speed-camera',
                    '115',
                    'no-overtaking',
                    '2015',
                    'mobile-speed-camera-hotspot',
                    ['vwd', 'vwda'],
                    'police-report',
                    '',
                ],
                'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.1, 15, 0.15],
                'icon-anchor': 'center',
                // ----------- Text ------------
                'text-allow-overlap': true,
                'text-anchor': 'center',
                'text-field': [
                    'format',
                    [
                        'match',
                        ['get', 'type'],
                        ['1', '2', '107', '110', '112', '201', 'ts'],
                        ['get', 'vmax', ['get', 'trapInfo']],
                        '',
                    ],
                    {
                        'text-font': TEXT_FONT,
                        'text-color': [
                            'match',
                            ['get', 'status'],
                            'NEW',
                            data.symbolTextNewColor || 'rgba(123,25,25,0.95)',
                            'ESTABLISHED',
                            symbolTextColor,
                            symbolTextColor,
                        ],
                    },
                ],
                'text-offset': [
                    'match',
                    ['get', 'type'],
                    ['2', '110'],
                    ['literal', [0.2, 0]],
                    ['1', '107', '112'],
                    ['literal', [0, 0]],
                    ['literal', [0, 0]],
                ],
                'text-size': ['interpolate', ['linear'], ['zoom'], 8, 11, 15, 16],
            },
            paint: {
                'icon-color': [
                    'match',
                    ['get', 'status'],
                    'NEW',
                    data.symbolNewColor || 'rgba(232,10,10,0.7)',
                    'ESTABLISHED',
                    symbolColor,
                    symbolColor,
                ],
                'icon-opacity': 1.0,
            },
        },
        // closed and congested sections of road
        lineBackground: {
            type: 'line',
            id: 'line-background',
            paint: {
                'line-color': 'white',
                'line-width': 6,
                'line-opacity': 0.8,
            },
        },
        lineDashed: {
            type: 'line',
            id: 'line-dashed',
            paint: {
                'line-color': ['match', ['get', 'type'], 'sc', 'blue', 'closure', 'red', '20', 'green', 'black'],
                'line-width': 6,
                'line-dasharray': [0, 4, 3],
            },
        },
        trafficClosure: {
            type: 'symbol',
            id: 'traffic-closure',
            filter: ['all', ['==', 'type', 'closure']],
            layout: {
                'icon-allow-overlap': true,
                'icon-image': 'icon-traffic-closure',
                'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.04, 15, 0.1],
            },
            paint: {
                'icon-opacity': 1.0,
            },
        },
    };

    return styles[key];
}
