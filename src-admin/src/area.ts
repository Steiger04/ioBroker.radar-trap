/**
 * `<iob-radar-trap-area>`: the area of an area in the configuration, drawn on a map.
 *
 * The value is `{ [id]: polygon }` - one polygon, as the database of the adapter stores it. The user draws a polygon
 * corner by corner, a circle by its centre and edge, or picks a German county. The corners of a polygon and the
 * centre and the edge of a circle can be dragged; dragging the point between two corners adds one. A county keeps
 * its outline: it has too many corners to drag them.
 *
 * MapLibre is loaded when the element becomes visible, so that the collapsed areas of the configuration cost nothing.
 */
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent, MapLayerTouchEvent, MapMouseEvent } from 'maplibre-gl';

import { defineWebComponent, IobWebComponent } from '@iobroker/web-components/element';

import { COMPONENTS, COUNTIES_FILE, type AreaFeature, type AreaPolygons } from './constants';
import { escapeHtml, getTranslate, type Translate } from './i18n';
import { circleRing, destination, distanceKm, newId } from './lib/geometry';
import { fileUrl, getBounds, getStyle, loadMapLibre, MAP_CSS, onStyle } from './lib/maps';

type AreaSettings = {
    /** The token of mapbox, for its styles */
    token?: string;
    /** The style of the map, see `getStyle` */
    style?: string;
};

type LngLat = [number, number];

/** A point that can be dragged: a corner, the middle between two corners, the centre or the edge of a circle */
type HandleKind = 'vertex' | 'mid' | 'center' | 'edge';

/** A polygon with more corners shows none to drag */
const MAX_HANDLES = 300;

const SOURCE_AREA = 'rt-edit-area';
const SOURCE_HANDLES = 'rt-edit-handles';
const LAYER_HANDLES = 'rt-edit-handles';

/** A county of `landkreise.json` */
interface County {
    id: number | string;
    properties: { NAME_1?: string; NAME_2?: string; NAME_3?: string };
    geometry: AreaFeature['geometry'];
}

let countiesLoading: Promise<County[]> | null = null;

/** The German counties, loaded once for all elements, by name */
function loadCounties(): Promise<County[]> {
    countiesLoading ||= fetch(fileUrl(COUNTIES_FILE))
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText || String(response.status));
            }
            return response.json() as Promise<{ features: County[] }>;
        })
        .then(collection =>
            collection.features.sort((a, b) => (a.properties.NAME_3 || '').localeCompare(b.properties.NAME_3 || '')),
        );
    countiesLoading.catch(() => {
        countiesLoading = null;
    });
    return countiesLoading;
}

/**
 * How a county is listed: its name, its region, its state
 *
 * @param county the county
 */
function countyLabel(county: County): string {
    const { NAME_1, NAME_2, NAME_3 } = county.properties;
    return [NAME_3, NAME_2, NAME_1].filter(Boolean).join(' | ');
}

const ICONS = {
    polygon:
        '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 7l7-4 9 6-3 11H6z"/><g fill="currentColor"><circle cx="4" cy="7" r="2"/><circle cx="11" cy="3" r="2"/><circle cx="20" cy="9" r="2"/><circle cx="17" cy="20" r="2"/><circle cx="6" cy="20" r="2"/></g></svg>',
    circle: '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    county: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/></svg>',
    delete: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>',
};

const CSS = `
:host { display: block; font-family: var(--iob-font-family, inherit); font-size: var(--iob-font-size, 14px); color: var(--iob-text, inherit); }
.area { display: flex; flex-direction: column; height: 100%; gap: 6px; }
.toolbar { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--iob-divider, #ccc);
    border-radius: var(--iob-border-radius, 4px);
    background: transparent;
    color: var(--iob-text, inherit);
    font: inherit;
    cursor: pointer;
}
button:hover:not(:disabled) { border-color: var(--iob-primary, #3399cc); }
button.active { background: var(--iob-primary, #3399cc); border-color: var(--iob-primary, #3399cc); color: var(--iob-primary-contrast, #fff); }
button:disabled { opacity: 0.45; cursor: default; }
button.delete { padding: 0 8px; }
.county { position: relative; flex: 1 1 220px; max-width: 360px; display: flex; align-items: center; gap: 4px; }
.county svg { flex: none; color: var(--iob-text-secondary, #888); }
.county input {
    flex: 1;
    min-width: 0;
    height: 30px;
    border: 0;
    border-bottom: 1px solid var(--iob-text-secondary, #888);
    background: transparent;
    color: var(--iob-text, inherit);
    font: inherit;
    outline: none;
}
.county input:focus { border-bottom: 2px solid var(--iob-primary, #3399cc); }
.county ul {
    position: absolute;
    left: 0;
    right: 0;
    top: 34px;
    z-index: 1500;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    background: var(--iob-paper, #fff);
    color: var(--iob-text, #000);
    border-radius: var(--iob-border-radius, 4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-height: 280px;
    overflow-y: auto;
}
.county ul[hidden] { display: none; }
.county li { padding: 6px 12px; cursor: pointer; }
.county li.active, .county li:hover { background: color-mix(in srgb, var(--iob-primary, #3399cc) 18%, transparent); }
.county li.info { cursor: default; color: var(--iob-text-secondary, #888); background: none; }
.spacer { flex: 1; }
.map { position: relative; flex: 1 1 auto; min-height: 160px; border-radius: var(--iob-border-radius, 4px); overflow: hidden; background: var(--iob-background, #eee); }
.hint { font-size: 12px; color: var(--iob-text-secondary, #888); min-height: 16px; }
${MAP_CSS}
`;

class RadarTrapArea extends IobWebComponent<AreaSettings, AreaPolygons | null> {
    readonly #shadow: ShadowRoot;

    readonly #mapBox: HTMLDivElement;

    readonly #hint: HTMLDivElement;

    readonly #buttons: { polygon: HTMLButtonElement; circle: HTMLButtonElement; delete: HTMLButtonElement };

    readonly #countyInput: HTMLInputElement;

    readonly #countyList: HTMLUListElement;

    #map: MapLibreMap | null = null;

    #creating = false;

    #visible = false;

    readonly #observer: IntersectionObserver;

    #t: Translate = getTranslate('en');

    /** What the map shows: the stored polygon, or the changed one while a point is dragged */
    #feature: AreaFeature | null = null;

    /** The value as it was drawn last, to tell a new one */
    #valueJson = 'null';

    /** True once the map showed the stored polygon in full */
    #fitted = false;

    #mode: 'edit' | 'polygon' | 'circle' = 'edit';

    /** The corners of the polygon being drawn */
    #draft: LngLat[] = [];

    /** The centre of the circle being drawn */
    #circleCenter: LngLat | null = null;

    #mouse: LngLat | null = null;

    #drag: { kind: HandleKind; index: number } | null = null;

    /** The style the map shows, to tell a new one */
    #styleKey = '';

    #counties: County[] = [];

    #countyHits: County[] = [];

    #countyActive = -1;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = CSS;

        const area = document.createElement('div');
        area.className = 'area';
        const toolbar = document.createElement('div');
        toolbar.className = 'toolbar';

        const button = (className: string, icon: string): HTMLButtonElement => {
            const element = document.createElement('button');
            element.type = 'button';
            element.className = className;
            element.innerHTML = `${icon}<span></span>`;
            return element;
        };
        this.#buttons = {
            polygon: button('polygon', ICONS.polygon),
            circle: button('circle', ICONS.circle),
            delete: button('delete', ICONS.delete),
        };
        this.#buttons.delete.querySelector('span')!.remove();

        const county = document.createElement('div');
        county.className = 'county';
        county.innerHTML = ICONS.county;
        this.#countyInput = document.createElement('input');
        this.#countyInput.type = 'text';
        this.#countyInput.autocomplete = 'off';
        this.#countyList = document.createElement('ul');
        this.#countyList.hidden = true;
        county.append(this.#countyInput, this.#countyList);

        const spacer = document.createElement('span');
        spacer.className = 'spacer';
        toolbar.append(this.#buttons.polygon, this.#buttons.circle, county, spacer, this.#buttons.delete);

        this.#mapBox = document.createElement('div');
        this.#mapBox.className = 'map';
        this.#hint = document.createElement('div');
        this.#hint.className = 'hint';
        area.append(toolbar, this.#mapBox, this.#hint);
        this.#shadow.append(style, area);

        this.#buttons.polygon.addEventListener('click', () => this.#setMode(this.#mode === 'polygon' ? 'edit' : 'polygon'));
        this.#buttons.circle.addEventListener('click', () => this.#setMode(this.#mode === 'circle' ? 'edit' : 'circle'));
        this.#buttons.delete.addEventListener('click', () => {
            this.#setMode('edit');
            this.#commit(null);
        });
        this.#countyInput.addEventListener('focus', () => this.#searchCounty());
        this.#countyInput.addEventListener('input', () => this.#searchCounty());
        this.#countyInput.addEventListener('keydown', event => this.#onCountyKey(event));
        this.#countyInput.addEventListener('blur', () => setTimeout(() => this.#closeCounties(), 150));
        this.#countyList.addEventListener('mousedown', event => {
            event.preventDefault();
            const item = (event.target as HTMLElement).closest('li');
            const index = item ? Number(item.dataset.index) : -1;
            if (index >= 0 && this.#countyHits[index]) {
                this.#chooseCounty(this.#countyHits[index]);
            }
        });

        this.#observer = new IntersectionObserver(entries => {
            this.#visible = entries.some(entry => entry.isIntersecting);
            if (this.#visible) {
                void this.#createMap();
            }
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.#observer.observe(this);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.#observer.disconnect();
        this.#setMode('edit');
        // a WebGL context each: a page has only a few of them
        this.#map?.remove();
        this.#map = null;
        this.#styleKey = '';
        this.#fitted = false;
    }

    // --- the map ---------------------------------------------------------------------------------------------------

    async #createMap(): Promise<void> {
        if (this.#map || this.#creating || !this.isConnected) {
            return;
        }
        this.#creating = true;
        try {
            const { maplibre, css } = await loadMapLibre();
            if (!this.#shadow.querySelector('style.maplibre')) {
                const style = document.createElement('style');
                style.className = 'maplibre';
                style.textContent = css;
                this.#shadow.prepend(style);
            }
            if (!this.isConnected || this.#map) {
                return;
            }
            this.#styleKey = `${this.settings.style}|${this.settings.token}`;
            const map = new maplibre.Map({
                container: this.#mapBox,
                style: getStyle(this.settings.style, this.settings.token),
                center: [10.45, 51.16],
                zoom: 5,
                attributionControl: { compact: true },
                dragRotate: false,
                touchPitch: false,
            });
            map.touchZoomRotate.disableRotation();
            map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
            map.addControl(new maplibre.FullscreenControl({ container: this.#mapBox }), 'top-right');
            map.addControl(new maplibre.ScaleControl({}), 'bottom-left');
            this.#map = map;

            onStyle(map, () => this.#addLayers(map));
            map.on('click', event => this.#onClick(event));
            map.on('dblclick', event => this.#onDoubleClick(event));
            map.on('mousemove', event => this.#onMove(event.lngLat.toArray() as LngLat));
            map.on('touchmove', event => this.#onMove(event.lngLat.toArray() as LngLat));
            map.on('mouseup', () => this.#endDrag());
            map.on('touchend', () => this.#endDrag());
            map.on('mousedown', LAYER_HANDLES, event => this.#startDrag(event));
            map.on('touchstart', LAYER_HANDLES, event => this.#startDrag(event));
            map.on('mouseenter', LAYER_HANDLES, () => {
                if (this.#mode === 'edit') {
                    map.getCanvas().style.cursor = 'move';
                }
            });
            map.on('mouseleave', LAYER_HANDLES, () => {
                if (!this.#drag) {
                    this.#updateCursor();
                }
            });
        } catch (error) {
            this.#hint.textContent = this.#t('load_failed', (error as Error)?.message || String(error));
        } finally {
            this.#creating = false;
        }
    }

    #addLayers(map: MapLibreMap): void {
        const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
        if (!map.getSource(SOURCE_AREA)) {
            map.addSource(SOURCE_AREA, { type: 'geojson', data: empty });
        }
        if (!map.getSource(SOURCE_HANDLES)) {
            map.addSource(SOURCE_HANDLES, { type: 'geojson', data: empty });
        }
        const color = this.theme.primary;
        if (!map.getLayer('rt-edit-fill')) {
            map.addLayer({
                id: 'rt-edit-fill',
                type: 'fill',
                source: SOURCE_AREA,
                filter: ['==', ['geometry-type'], 'Polygon'],
                paint: { 'fill-color': color, 'fill-opacity': 0.15 },
            });
            map.addLayer({
                id: 'rt-edit-line',
                type: 'line',
                source: SOURCE_AREA,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': color,
                    'line-width': 3,
                    'line-dasharray': ['case', ['==', ['get', 'draft'], true], ['literal', [2, 2]], ['literal', [1, 0]]],
                },
            });
            map.addLayer({
                id: LAYER_HANDLES,
                type: 'circle',
                source: SOURCE_HANDLES,
                paint: {
                    'circle-radius': ['match', ['get', 'kind'], 'mid', 4, 'center', 7, 6],
                    'circle-color': ['match', ['get', 'kind'], 'mid', color, '#ffffff'],
                    'circle-opacity': ['match', ['get', 'kind'], 'mid', 0.7, 1],
                    'circle-stroke-color': color,
                    'circle-stroke-width': 2,
                },
            });
        }
        this.#draw();
        if (!this.#fitted) {
            this.#fit();
        }
    }

    /** Puts the polygon, the drawing and the points to drag onto the map */
    #draw(): void {
        const map = this.#map;
        if (!map || !map.getSource(SOURCE_AREA)) {
            return;
        }
        const shapes: GeoJSON.Feature[] = [];
        const handles: GeoJSON.Feature[] = [];
        const point = (coordinates: LngLat, kind: HandleKind, index: number): GeoJSON.Feature => ({
            type: 'Feature',
            properties: { kind, index },
            geometry: { type: 'Point', coordinates },
        });

        if (this.#mode === 'polygon') {
            const corners = this.#mouse ? [...this.#draft, this.#mouse] : this.#draft;
            if (corners.length >= 3) {
                shapes.push({
                    type: 'Feature',
                    properties: { draft: true },
                    geometry: { type: 'Polygon', coordinates: [[...corners, corners[0]]] },
                });
            } else if (corners.length === 2) {
                shapes.push({ type: 'Feature', properties: { draft: true }, geometry: { type: 'LineString', coordinates: corners } });
            }
            this.#draft.forEach((corner, index) => handles.push(point(corner, 'vertex', index)));
        } else if (this.#mode === 'circle') {
            if (this.#circleCenter) {
                handles.push(point(this.#circleCenter, 'center', 0));
                if (this.#mouse) {
                    const radius = distanceKm(this.#circleCenter, this.#mouse);
                    if (radius > 0) {
                        shapes.push({
                            type: 'Feature',
                            properties: { draft: true },
                            geometry: { type: 'Polygon', coordinates: [circleRing(this.#circleCenter, radius)] },
                        });
                    }
                }
            }
        } else if (this.#feature) {
            shapes.push(this.#feature as unknown as GeoJSON.Feature);
            const { properties, geometry } = this.#feature;
            if (properties.isCircle && properties.center && properties.radiusInKm) {
                handles.push(point(properties.center, 'center', 0));
                handles.push(point(destination(properties.center, properties.radiusInKm, 90), 'edge', 0));
            } else if (geometry.type === 'Polygon' && geometry.coordinates[0].length <= MAX_HANDLES + 1) {
                const ring = geometry.coordinates[0].slice(0, -1) as LngLat[];
                ring.forEach((corner, index) => {
                    handles.push(point(corner, 'vertex', index));
                    const next = ring[(index + 1) % ring.length];
                    handles.push(point([(corner[0] + next[0]) / 2, (corner[1] + next[1]) / 2], 'mid', index));
                });
            }
        }

        (map.getSource(SOURCE_AREA) as GeoJSONSource).setData({ type: 'FeatureCollection', features: shapes });
        (map.getSource(SOURCE_HANDLES) as GeoJSONSource).setData({ type: 'FeatureCollection', features: handles });
        this.#drawHint();
    }

    /** Shows the stored polygon in full */
    #fit(): void {
        const map = this.#map;
        if (!map) {
            return;
        }
        const bounds = getBounds([this.#feature as unknown as GeoJSON.Feature | null]);
        if (bounds) {
            map.fitBounds(bounds, { padding: 30, animate: false, maxZoom: 14 });
            this.#fitted = true;
        }
    }

    #updateCursor(): void {
        if (this.#map) {
            this.#map.getCanvas().style.cursor = this.#mode === 'edit' ? '' : 'crosshair';
        }
    }

    // --- drawing ---------------------------------------------------------------------------------------------------

    #setMode(mode: 'edit' | 'polygon' | 'circle'): void {
        this.#mode = mode;
        this.#draft = [];
        this.#circleCenter = null;
        this.#mouse = null;
        this.#drag = null;
        if (this.#map) {
            if (mode === 'edit') {
                this.#map.doubleClickZoom.enable();
            } else {
                this.#map.doubleClickZoom.disable();
            }
        }
        if (mode === 'edit') {
            window.removeEventListener('keydown', this.#onWindowKey, true);
        } else {
            window.addEventListener('keydown', this.#onWindowKey, true);
        }
        this.#buttons.polygon.classList.toggle('active', mode === 'polygon');
        this.#buttons.circle.classList.toggle('active', mode === 'circle');
        this.#updateCursor();
        this.#draw();
        this.#drawHint();
    }

    readonly #onWindowKey = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            this.#setMode('edit');
        } else if (event.key === 'Enter' && this.#mode === 'polygon') {
            event.preventDefault();
            event.stopPropagation();
            this.#finishPolygon();
        }
    };

    #onClick(event: MapMouseEvent): void {
        const lngLat = event.lngLat.toArray() as LngLat;
        if (this.#mode === 'polygon') {
            const first = this.#draft[0];
            if (first && this.#draft.length >= 3 && this.#map) {
                const a = this.#map.project(first);
                if (Math.hypot(a.x - event.point.x, a.y - event.point.y) < 10) {
                    this.#finishPolygon();
                    return;
                }
            }
            this.#draft.push(lngLat);
            this.#draw();
        } else if (this.#mode === 'circle') {
            if (!this.#circleCenter) {
                this.#circleCenter = lngLat;
                this.#draw();
            } else {
                const radius = Math.round(distanceKm(this.#circleCenter, lngLat) * 100) / 100;
                if (radius > 0) {
                    const center = this.#circleCenter;
                    this.#setMode('edit');
                    this.#commit(this.#makeCircle(newId(), center, radius));
                }
            }
        }
    }

    #onDoubleClick(event: MapMouseEvent): void {
        if (this.#mode === 'polygon') {
            event.preventDefault();
            // the double click added its point twice
            const last = this.#draft[this.#draft.length - 1];
            const before = this.#draft[this.#draft.length - 2];
            if (last && before && last[0] === before[0] && last[1] === before[1]) {
                this.#draft.pop();
            }
            this.#finishPolygon();
        }
    }

    #finishPolygon(): void {
        const corners = this.#draft;
        if (corners.length < 3) {
            return;
        }
        this.#setMode('edit');
        this.#commit({
            type: 'Feature',
            id: newId(),
            properties: {},
            geometry: { type: 'Polygon', coordinates: [[...corners, corners[0]]] },
        });
    }

    /**
     * A circle as a polygon that keeps its centre and radius
     *
     * @param id the ID of the polygon
     * @param center longitude, latitude
     * @param radiusInKm the radius
     */
    #makeCircle(id: string, center: LngLat, radiusInKm: number): AreaFeature {
        return {
            type: 'Feature',
            id,
            properties: { isCircle: true, center, radiusInKm },
            geometry: { type: 'Polygon', coordinates: [circleRing(center, radiusInKm)] },
        };
    }

    #startDrag(event: MapLayerMouseEvent | MapLayerTouchEvent): void {
        const handle = event.features?.[0]?.properties as { kind?: HandleKind; index?: number } | undefined;
        if (this.#mode !== 'edit' || !this.#feature || !handle?.kind || this.editMode) {
            return;
        }
        event.preventDefault();
        let index = Number(handle.index) || 0;
        if (handle.kind === 'mid' && this.#feature.geometry.type === 'Polygon') {
            // a new corner between two others, dragged from here on
            const ring = [...this.#feature.geometry.coordinates[0]];
            const a = ring[index];
            const b = ring[index + 1];
            ring.splice(index + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
            this.#feature = { ...this.#feature, geometry: { type: 'Polygon', coordinates: [ring] } };
            index += 1;
            this.#drag = { kind: 'vertex', index };
        } else {
            this.#drag = { kind: handle.kind, index };
        }
        this.#map?.dragPan.disable();
    }

    #onMove(lngLat: LngLat): void {
        if (this.#drag && this.#feature) {
            const feature = this.#feature;
            const { properties } = feature;
            if (this.#drag.kind === 'vertex' && feature.geometry.type === 'Polygon') {
                const ring = [...feature.geometry.coordinates[0]];
                ring[this.#drag.index] = lngLat;
                if (this.#drag.index === 0) {
                    ring[ring.length - 1] = lngLat;
                }
                this.#feature = { ...feature, geometry: { type: 'Polygon', coordinates: [ring] } };
            } else if (this.#drag.kind === 'center' && properties.radiusInKm) {
                this.#feature = this.#makeCircle(feature.id, lngLat, properties.radiusInKm);
            } else if (this.#drag.kind === 'edge' && properties.center) {
                const radius = Math.max(0.05, Math.round(distanceKm(properties.center, lngLat) * 100) / 100);
                this.#feature = this.#makeCircle(feature.id, properties.center, radius);
            }
            this.#draw();
        } else if (this.#mode !== 'edit') {
            this.#mouse = lngLat;
            this.#draw();
        }
    }

    #endDrag(): void {
        if (!this.#drag) {
            return;
        }
        this.#drag = null;
        this.#map?.dragPan.enable();
        this.#updateCursor();
        this.#commit(this.#feature);
    }

    /**
     * Stores a new polygon, or none
     *
     * @param feature the polygon; null deletes the area
     */
    #commit(feature: AreaFeature | null): void {
        this.#feature = feature;
        const value: AreaPolygons | null = feature ? { [feature.id]: feature } : null;
        this.#valueJson = JSON.stringify(value);
        this.changeValue(value);
        this.#draw();
        this.#buttons.delete.disabled = !feature;
    }

    // --- the counties ----------------------------------------------------------------------------------------------

    #searchCounty(): void {
        const query = this.#countyInput.value.trim().toLowerCase();
        if (!this.#counties.length) {
            this.#drawCounties(this.#t('loading'));
            loadCounties()
                .then(counties => {
                    this.#counties = counties;
                    if (this.#shadow.activeElement === this.#countyInput) {
                        this.#searchCounty();
                    }
                })
                .catch((error: unknown) => this.#drawCounties(this.#t('load_failed', String((error as Error)?.message || error))));
            return;
        }
        this.#countyHits = (query
            ? this.#counties.filter(county => countyLabel(county).toLowerCase().includes(query))
            : this.#counties
        ).slice(0, 50);
        this.#countyActive = this.#countyHits.length ? 0 : -1;
        this.#drawCounties();
    }

    /**
     * Draws the list of the counties
     *
     * @param info instead of the counties: what is going on
     */
    #drawCounties(info?: string): void {
        this.#countyList.innerHTML = info
            ? `<li class="info">${escapeHtml(info)}</li>`
            : this.#countyHits
                  .map(
                      (county, index) =>
                          `<li data-index="${index}" class="${index === this.#countyActive ? 'active' : ''}">${escapeHtml(countyLabel(county))}</li>`,
                  )
                  .join('');
        this.#countyList.hidden = !info && !this.#countyHits.length;
    }

    #closeCounties(): void {
        this.#countyHits = [];
        this.#countyList.hidden = true;
    }

    #onCountyKey(event: KeyboardEvent): void {
        event.stopPropagation();
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && this.#countyHits.length) {
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            this.#countyActive = (this.#countyActive + step + this.#countyHits.length) % this.#countyHits.length;
            this.#drawCounties();
            this.#countyList.querySelector('li.active')?.scrollIntoView({ block: 'nearest' });
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const county = this.#countyHits[this.#countyActive];
            if (county) {
                this.#chooseCounty(county);
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.#closeCounties();
        }
    }

    #chooseCounty(county: County): void {
        this.#closeCounties();
        this.#countyInput.value = '';
        this.#countyInput.blur();
        this.#setMode('edit');
        const { NAME_1, NAME_2, NAME_3 } = county.properties;
        this.#commit({
            type: 'Feature',
            id: String(county.id),
            properties: { NAME_1, NAME_2, NAME_3 },
            geometry: county.geometry,
        });
        this.#fit();
    }

    // --- the element -----------------------------------------------------------------------------------------------

    #drawHint(): void {
        const t = this.#t;
        let hint: string;
        if (this.#mode === 'polygon') {
            hint = t('draw_polygon_hint');
        } else if (this.#mode === 'circle') {
            hint = t('draw_circle_hint');
            if (this.#circleCenter && this.#mouse) {
                hint = `${t('radius', distanceKm(this.#circleCenter, this.#mouse).toFixed(2))} - ${hint}`;
            }
        } else if (!this.#feature) {
            hint = t('no_area_yet');
        } else if (this.#feature.properties.isCircle && this.#feature.properties.radiusInKm) {
            hint = `${t('radius', this.#feature.properties.radiusInKm.toFixed(2))} - ${t('edit_hint')}`;
        } else if (this.#feature.properties.NAME_3) {
            hint = countyLabel({
                id: '',
                properties: this.#feature.properties as County['properties'],
                geometry: this.#feature.geometry,
            });
        } else if (this.#feature.geometry.type === 'Polygon' && this.#feature.geometry.coordinates[0].length <= MAX_HANDLES + 1) {
            hint = t('edit_hint');
        } else {
            hint = '';
        }
        this.#hint.textContent = hint;
    }

    protected render(): void {
        this.#t = getTranslate(this.systemLang);
        const t = this.#t;
        this.#buttons.polygon.querySelector('span')!.textContent = t('polygon');
        this.#buttons.circle.querySelector('span')!.textContent = t('circle');
        this.#buttons.delete.title = t('delete_area');
        this.#countyInput.placeholder = t('search_county');

        // a new value from the host: the stored one, or one another field set
        const value = this.value || null;
        const valueJson = JSON.stringify(value);
        if (valueJson !== this.#valueJson && !this.#drag) {
            this.#valueJson = valueJson;
            const feature = value ? Object.values(value)[0] : undefined;
            this.#feature = feature?.geometry ? { ...feature, id: feature.id ?? Object.keys(value!)[0] } : null;
            this.#fitted = false;
        }
        this.#buttons.delete.disabled = !this.#feature;

        const map = this.#map;
        if (map) {
            const styleKey = `${this.settings.style}|${this.settings.token}`;
            if (styleKey !== this.#styleKey) {
                this.#styleKey = styleKey;
                // the layers come back with `style.load`
                map.setStyle(getStyle(this.settings.style, this.settings.token));
            } else if (map.getLayer('rt-edit-fill')) {
                const color = this.theme.primary;
                map.setPaintProperty('rt-edit-fill', 'fill-color', color);
                map.setPaintProperty('rt-edit-line', 'line-color', color);
                map.setPaintProperty(LAYER_HANDLES, 'circle-stroke-color', color);
                this.#draw();
                if (!this.#fitted) {
                    this.#fit();
                }
            }
        } else if (this.#visible) {
            void this.#createMap();
        }
        this.#drawHint();
    }
}

defineWebComponent(COMPONENTS.area.tag, RadarTrapArea);
