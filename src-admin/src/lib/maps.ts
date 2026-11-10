/**
 * What the maps of the configuration share: MapLibre (loaded only when a map is shown), the styles, the icons of
 * the traps and the layers of a route or an area.
 *
 * The styles need no token: OpenStreetMap as raster tiles (also darkened), the vector styles of OpenFreeMap, and with
 * a token the styles of mapbox as raster tiles and its traffic over any style (`setTraffic`). The texts of the layers (speed limits, numbers of the clusters) take
 * their glyphs from OpenFreeMap, which has the font for every style.
 */
import type { GeoJSONSource, Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';

import { getMapLayer, type MapLayer, type MapStyleKey } from '@radar-trap/mapLayers';

import { ICON_FOLDER, WORKER_FILE } from '../constants';

/**
 * Where the modules were loaded from: the icons and the counties lie next to them. The build puts all chunks into
 * the same folder, so this is the folder of every module. In a variable, so that the build does not take
 * `new URL(..., import.meta.url)` for an asset of its own
 */
const MODULE_URL = import.meta.url;

/**
 * A file next to the modules
 *
 * @param file e.g. `landkreise.json`
 */
export function fileUrl(file: string): string {
    return new URL(file, MODULE_URL).href;
}

type MapLibre = typeof import('maplibre-gl');

let loading: Promise<{ maplibre: MapLibre; css: string }> | null = null;

/** MapLibre and its CSS, imported once for all maps */
export function loadMapLibre(): Promise<{ maplibre: MapLibre; css: string }> {
    loading ||= Promise.all([import('maplibre-gl'), import('maplibre-gl/dist/maplibre-gl.css?inline')]).then(
        ([module, css]) => {
            const maplibre = ((module as unknown as { default?: MapLibre }).default || module) as MapLibre;
            maplibre.setWorkerUrl(fileUrl(WORKER_FILE));
            return { maplibre, css: css.default };
        },
    );
    // a failed import is tried again by the next map
    loading.catch(() => {
        loading = null;
    });
    return loading;
}

const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

/** The font of the texts of the layers; the glyphs of OpenFreeMap have it */
const FONT = ['Noto Sans Bold'];

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

/**
 * A style of raster tiles
 *
 * @param url the URL of the tiles with `{z}/{x}/{y}`
 * @param tileSize the size of a tile in px
 * @param attribution what the tiles must show
 * @param dark true: the colours are inverted and turned back, so that the map is dark
 */
function rasterStyle(url: string, tileSize: number, attribution: string, dark: boolean): StyleSpecification {
    return {
        version: 8,
        glyphs: GLYPHS,
        sources: {
            base: { type: 'raster', tiles: [url], tileSize, attribution, maxzoom: 19 },
        },
        layers: [
            {
                id: 'base',
                type: 'raster',
                source: 'base',
                paint: dark
                    ? {
                          'raster-brightness-min': 1,
                          'raster-brightness-max': 0,
                          'raster-hue-rotate': 180,
                          'raster-saturation': -0.3,
                      }
                    : {},
            },
        ],
    };
}

/** The vector styles of OpenFreeMap */
const OPEN_FREE_MAP = ['liberty', 'positron', 'bright'];

/**
 * The style of a map by the setting `mapStyle`; OpenStreetMap for an unknown one and for mapbox without a token
 *
 * @param style e.g. `osm`, `liberty`, `mapbox-streets-v12`
 * @param token the token of mapbox, if there is one
 */
export function getStyle(style: string | undefined, token: string | undefined): StyleSpecification | string {
    const name = style || 'osm';
    if (OPEN_FREE_MAP.includes(name)) {
        return `https://tiles.openfreemap.org/styles/${name}`;
    }
    if (name.startsWith('mapbox-') && token) {
        return rasterStyle(
            `https://api.mapbox.com/styles/v1/mapbox/${name.substring('mapbox-'.length)}/tiles/512/{z}/{x}/{y}@2x?access_token=${encodeURIComponent(token)}`,
            512,
            `&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> ${OSM_ATTRIBUTION}`,
            false,
        );
    }
    return rasterStyle('https://tile.openstreetmap.org/{z}/{x}/{y}.png', 256, OSM_ATTRIBUTION, name === 'osm-dark');
}

/** The icons of the traps by the names the layer `traps` asks for (`@radar-trap/mapLayers`) */
const IMAGES: readonly { id: string; file: string; sdf?: false }[] = [
    { id: 'icon-traffic-closure', file: 'icon-traffic-closure.png', sdf: false },
    { id: 'unknown', file: 'icon-unknown-0-sdf.png' },
    { id: 'general-traffic-control', file: 'icon-general-traffic-control-4-sdf.png' },
    { id: 'alcohol-control', file: 'icon-alcohol-control-5-sdf.png' },
    { id: 'mobile-distance-speed-camera', file: 'icon-mobile-distance-speed-camera-6-sdf.png' },
    { id: 'traffic-jam', file: 'icon-traffic-jam-20-sdf.png' },
    { id: 'accident', file: 'icon-accident-21-sdf.png' },
    { id: 'obstacle', file: 'icon-obstacle-23-sdf.png' },
    { id: 'risk-of-slipping', file: 'icon-risk-of-slipping-24-sdf.png' },
    { id: 'visual-obstruction', file: 'icon-visual-obstruction-25-sdf.png' },
    { id: 'road-work', file: 'icon-road-work-22-26-sdf.png' },
    { id: 'breakdown', file: 'icon-breakdown-29-sdf.png' },
    { id: 'fixed-distance-speed-camera', file: 'icon-fixed-distance-speed-camera-101-sdf.png' },
    { id: 'ramp-control', file: 'icon-ramp-control-103-sdf.png' },
    { id: 'bus-lane', file: 'icon-bus-lane-104-sdf.png' },
    { id: 'pedestrian-crossing', file: 'icon-pedestrian-crossing-106-sdf.png' },
    { id: 'speed-camera', file: 'icon-fixed-trap-1-2-107-sdf.png' },
    { id: 'weight-control', file: 'icon-weight-control-108-sdf.png' },
    { id: 'height-control', file: 'icon-height-control-109-sdf.png' },
    { id: 'combined-fixed', file: 'icon-fixed-trap-110-sdf.png' },
    { id: 'redlight-fixed', file: 'icon-fixed-trap-111-sdf.png' },
    { id: 'section-control-start', file: 'icon-fixed-trap-112-sdf.png' },
    { id: 'section-control-end', file: 'icon-fixed-trap-113-sdf.png' },
    { id: 'tunnel-speed-camera', file: 'icon-fixed-trap-114-sdf.png' },
    { id: 'no-overtaking', file: 'icon-no-overtaking-115-sdf.png' },
    { id: 'mobile-speed-camera-hotspot', file: 'icon-mobile-speed-camera-hotspot-2015-sdf.png' },
    { id: 'police-report', file: 'icon-police-report-vwd-vwda-sdf.png' },
];

/** The files of the icons, for the build that copies them */
export const ICON_FILES: readonly string[] = IMAGES.map(image => image.file);

/**
 * Adds the icons of the traps to the style of the map - again after every change of the style, which drops them
 *
 * @param map the map
 */
export async function addTrapImages(map: MapLibreMap): Promise<void> {
    await Promise.all(
        IMAGES.map(async image => {
            if (map.hasImage(image.id)) {
                return;
            }
            try {
                const { data } = await map.loadImage(fileUrl(`${ICON_FOLDER}/${image.file}`));
                if (!map.hasImage(image.id)) {
                    map.addImage(image.id, data, { sdf: image.sdf !== false });
                }
            } catch (error) {
                console.warn(`Cannot load the icon ${image.file}: ${String(error)}`);
            }
        }),
    );
}

/** The sources of a route or an area on the map */
export const SOURCES = {
    directions: 'rt-directions',
    area: 'rt-area',
    traps: 'rt-traps',
    polyLines: 'rt-polylines',
} as const;

/** The IDs of the layers that react to a click */
export const LAYERS = {
    traps: 'rt-traps',
    clusters: 'rt-cluster-traps',
    trafficClosure: 'rt-traffic-closure',
} as const;

/** The layers and the source each one draws, bottom up */
const LAYER_SOURCES: readonly [MapStyleKey, string][] = [
    ['areaSurface', SOURCES.area],
    ['areaSurfaceBorder', SOURCES.area],
    ['route', SOURCES.directions],
    ['lineBackground', SOURCES.polyLines],
    ['lineDashed', SOURCES.polyLines],
    ['trafficClosure', SOURCES.polyLines],
    ['traps', SOURCES.traps],
    ['clusterTraps', SOURCES.traps],
    ['clusterTrapsCount', SOURCES.traps],
];

export type FeatureCollection = GeoJSON.FeatureCollection;

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

/** What a map of the traps draws */
export interface TrapData {
    directions?: FeatureCollection | null;
    area?: FeatureCollection | null;
    traps?: FeatureCollection | null;
    polyLines?: FeatureCollection | null;
}

/**
 * Adds the sources and layers of a route or an area to the style of the map, empty
 *
 * @param map the map, its style loaded
 */
export function addTrapLayers(map: MapLibreMap): void {
    for (const id of Object.values(SOURCES)) {
        if (!map.getSource(id)) {
            map.addSource(
                id,
                id === SOURCES.traps
                    ? { type: 'geojson', data: EMPTY, cluster: true, clusterMaxZoom: 14, clusterRadius: 40 }
                    : { type: 'geojson', data: EMPTY },
            );
        }
    }
    for (const [key, source] of LAYER_SOURCES) {
        const layer: MapLayer = getMapLayer(key, {}, FONT);
        const id = `rt-${layer.id}`;
        if (map.getLayer(id)) {
            continue;
        }
        const filter =
            key === 'traps' ? ['all', ['!', ['has', 'point_count']], ...(layer.filter ? [layer.filter] : [])] : layer.filter;
        map.addLayer({ ...layer, id, source, ...(filter ? { filter } : {}) } as Parameters<MapLibreMap['addLayer']>[0]);
    }
}

/**
 * Shows a route or an area: what is missing is drawn empty
 *
 * @param map the map with the layers of `addTrapLayers`
 * @param data what to draw
 */
export function setTrapData(map: MapLibreMap, data: TrapData): void {
    const set = (id: string, collection: FeatureCollection | null | undefined): void => {
        (map.getSource(id) as GeoJSONSource | undefined)?.setData(collection || EMPTY);
    };
    set(SOURCES.directions, data.directions);
    set(SOURCES.area, data.area);
    set(SOURCES.traps, data.traps);
    set(SOURCES.polyLines, data.polyLines);
}

/** The source and the layer of the traffic of mapbox */
const TRAFFIC = 'rt-traffic';

/** The URL of the traffic tiles each map shows; a new style drops the source, the URL stays here */
const trafficUrls = new WeakMap<MapLibreMap, string>();

/**
 * Shows the traffic of mapbox - slow traffic and jams, live - or takes it away. Call it again after every new style.
 *
 * The vector tiles of `mapbox.mapbox-traffic-v1` carry the roads in the layer `traffic`, with `congestion` low,
 * moderate, heavy or severe. Low is left out: it is the normal state, and would paint every road. The lines lie above
 * the route, below the closures and the traps.
 *
 * @param map the map with the layers of `addTrapLayers`
 * @param token the token of mapbox; empty takes the traffic away
 */
export function setTraffic(map: MapLibreMap, token: string | null | undefined): void {
    const url = token
        ? `https://api.mapbox.com/v4/mapbox.mapbox-traffic-v1/{z}/{x}/{y}.vector.pbf?access_token=${encodeURIComponent(token)}`
        : '';
    if (map.getSource(TRAFFIC) && trafficUrls.get(map) === url) {
        return;
    }
    if (map.getLayer(TRAFFIC)) {
        map.removeLayer(TRAFFIC);
    }
    if (map.getSource(TRAFFIC)) {
        map.removeSource(TRAFFIC);
    }
    trafficUrls.set(map, url);
    if (!url) {
        return;
    }
    map.addSource(TRAFFIC, {
        type: 'vector',
        tiles: [url],
        maxzoom: 16,
        attribution: '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a>',
    });
    // the first layer above the route that the map has
    const route = LAYER_SOURCES.findIndex(([key]) => key === 'route');
    const before = LAYER_SOURCES.slice(route + 1)
        .map(([key]) => `rt-${getMapLayer(key, {}, FONT).id}`)
        .find(id => map.getLayer(id));
    map.addLayer(
        {
            id: TRAFFIC,
            type: 'line',
            source: TRAFFIC,
            'source-layer': 'traffic',
            // below, the roads of a whole country: tiles for nothing
            minzoom: 5,
            filter: ['in', ['get', 'congestion'], ['literal', ['moderate', 'heavy', 'severe']]],
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': ['match', ['get', 'congestion'], 'moderate', '#ff9800', 'heavy', '#e53935', '#8b0000'],
                'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.5, 12, 3, 16, 6],
                'line-opacity': 0.9,
                // each direction of a road is a line of its own: the offset keeps them apart
                'line-offset': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 16, 3],
            },
        },
        before,
    );
}

/**
 * The box around all coordinates of some collections, `null` if they have none
 *
 * @param collections e.g. the route and the traps
 */
export function getBounds(
    collections: (FeatureCollection | GeoJSON.Feature | null | undefined)[],
): [[number, number], [number, number]] | null {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const visit = (coordinates: unknown): void => {
        if (!Array.isArray(coordinates)) {
            return;
        }
        if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
            minX = Math.min(minX, coordinates[0]);
            maxX = Math.max(maxX, coordinates[0]);
            minY = Math.min(minY, coordinates[1]);
            maxY = Math.max(maxY, coordinates[1]);
            return;
        }
        for (const item of coordinates) {
            visit(item);
        }
    };
    const visitGeometry = (geometry: GeoJSON.Geometry | null | undefined): void => {
        if (!geometry) {
            return;
        }
        if (geometry.type === 'GeometryCollection') {
            geometry.geometries.forEach(visitGeometry);
        } else {
            visit(geometry.coordinates);
        }
    };
    for (const collection of collections) {
        if (!collection) {
            continue;
        }
        if (collection.type === 'FeatureCollection') {
            collection.features.forEach(feature => visitGeometry(feature.geometry));
        } else {
            visitGeometry(collection.geometry);
        }
    }
    return Number.isFinite(minX) ? [[minX, minY], [maxX, maxY]] : null;
}

/**
 * Calls back once the style of the map is loaded, and again after every new style: the sources, layers and images
 * are gone then
 *
 * @param map the map
 * @param callback adds what the map draws
 */
export function onStyle(map: MapLibreMap, callback: () => void): void {
    map.on('style.load', callback);
    if (map.isStyleLoaded()) {
        callback();
    }
}

/** The CSS of a map inside a shadow root, beside the CSS of MapLibre */
export const MAP_CSS = `
.maplibregl-map { font-family: var(--iob-font-family, inherit); }
.maplibregl-popup-content {
    background: var(--iob-paper, #fff);
    color: var(--iob-text, #000);
    border-radius: var(--iob-border-radius, 4px);
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    overflow: hidden;
}
.maplibregl-popup-anchor-top .maplibregl-popup-tip,
.maplibregl-popup-anchor-top-left .maplibregl-popup-tip,
.maplibregl-popup-anchor-top-right .maplibregl-popup-tip { border-bottom-color: var(--iob-paper, #fff); }
.maplibregl-popup-anchor-bottom .maplibregl-popup-tip,
.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip,
.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip { border-top-color: var(--iob-paper, #fff); }
.maplibregl-popup-anchor-left .maplibregl-popup-tip { border-right-color: var(--iob-paper, #fff); }
.maplibregl-popup-anchor-right .maplibregl-popup-tip { border-left-color: var(--iob-paper, #fff); }
`;
