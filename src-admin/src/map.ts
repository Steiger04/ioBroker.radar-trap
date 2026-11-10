/**
 * `<iob-radar-trap-map>`: a route or an area with its traps on a map, as the instance computed them - in the
 * configuration (JSON-Config) and as a widget of devices, vis-2 and aura (`common.webComponents`).
 *
 * The data comes from the instance by `sendTo` over the connection of the host (`getSources`, `getSource`), so the
 * browser needs no port of the instance. The element follows the state `lastUpdated` of the route or area and loads
 * it again when the instance computed it anew; the button "refresh" lets the instance search the traps now
 * (`cron-job.run`).
 *
 * A widget may name the route or area to show first (`source`) and hide the choice. The token and the style of the
 * map come from the instance unless the settings give them; with a token the map shows the traffic of mapbox too.
 */
import type { Map as MapLibreMap, MapLayerMouseEvent, Popup } from 'maplibre-gl';

import { defineWebComponent, IobWebComponent } from '@iobroker/web-components/element';

import { formatLastUpdate, getDeviceId, getTrapIds, type TrapInfo } from '@radar-trap/traps';

import { COMPONENTS, type AreaPolygons } from './constants';
import { escapeHtml, getTranslate, type Translate } from './i18n';
import {
    addTrapImages,
    addTrapLayers,
    getBounds,
    getStyle,
    LAYERS,
    loadMapLibre,
    MAP_CSS,
    onStyle,
    setTrapData,
    setTraffic,
    SOURCES,
    type FeatureCollection,
    type TrapData,
} from './lib/maps';
import { closurePopupHtml, POPUP_CSS, trapPopupHtml, type ClosureAddress } from './lib/popup';

type MapSettings = {
    /** The instance, `radar-trap.0`; that of `source` if empty */
    instance?: string;
    /** The device of the route or area to show first, `radar-trap.0.<id>`; empty: the one chosen last */
    source?: string;
    /** False: no choice of the route or area, if `source` names one */
    showSelect?: boolean;
    /** True: the traffic of mapbox over the map, if there is a token */
    traffic?: boolean;
    /** The token of mapbox, for its styles and its traffic; that of the instance if empty */
    token?: string;
    /** The style of the map, see `getStyle`; that of the instance if empty */
    style?: string;
    /** True while the configuration has changes that are not saved (JSON-Config only) */
    changed?: boolean;
    /** True in a form (JSON-Config): no frame of its own. A widget keeps a distance to the edges of its tile */
    form?: boolean;
};

/** What the configuration of the instance says about maps (`native`) */
interface InstanceNative {
    mapStyle?: string;
    settings?: { mbxAccessToken?: string };
}

/**
 * The instance of the settings: the one they name, else that of the route or area
 *
 * @param settings the settings of the element
 */
function instanceOf(settings: MapSettings): string {
    return settings.instance || getDeviceId(settings.source)?.split('.').slice(0, 2).join('.') || '';
}

/** A route or an area the instance computed */
interface SourceInfo {
    id: string;
    type: 'ROUTE' | 'AREA';
    name: string;
}

/** What the map draws of a route or an area (`getSource` of the adapter) */
interface SourceData extends SourceInfo {
    timestamp?: string;
    status?: string;
    directions?: FeatureCollection | null;
    traps?: FeatureCollection | null;
    polyLines?: FeatureCollection | null;
    areaPolygons?: AreaPolygons | null;
}

const ICONS = {
    refresh:
        '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg>',
    // corners and a dot: "show all of it" - not the arrows of the full screen button beside it
    fit: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
};

const CSS = `
:host { display: block; font-family: var(--iob-font-family, inherit); font-size: var(--iob-font-size, 14px); color: var(--iob-text, inherit); }
.root { display: flex; flex-direction: column; height: 100%; gap: 6px; box-sizing: border-box; }
.root.widget { padding: 8px 10px 10px; }
/* devices puts its own buttons over the top corners while it is edited */
.root.widget.edit .bar { padding: 0 26px; }
.bar { display: flex; gap: 4px 8px; align-items: center; flex-wrap: wrap; }
/* a narrow tile: the choice and the button in one row, what is going on below */
.root.widget .bar.with-select .info { order: 3; flex-basis: 100%; }
select {
    flex: 1 1 0;
    min-width: 0;
    max-width: 420px;
    height: 32px;
    border: 1px solid var(--iob-divider, #ccc);
    border-radius: var(--iob-border-radius, 4px);
    background: var(--iob-paper, #fff);
    color: var(--iob-text, inherit);
    font: inherit;
    padding: 0 8px;
}
.info {
    flex: 1 1 0;
    min-width: 0;
    font-size: 12px;
    color: var(--iob-text-secondary, #888);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.info.busy { color: var(--iob-primary, #3399cc); }
button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 32px;
    border: 1px solid var(--iob-divider, #ccc);
    border-radius: var(--iob-border-radius, 4px);
    background: transparent;
    color: var(--iob-text, inherit);
    cursor: pointer;
}
button:hover:not(:disabled) { border-color: var(--iob-primary, #3399cc); color: var(--iob-primary, #3399cc); }
button:disabled { opacity: 0.45; cursor: default; }
.banner {
    padding: 6px 10px;
    border-radius: var(--iob-border-radius, 4px);
    background: color-mix(in srgb, var(--iob-warning, #ed6c02) 18%, transparent);
    border: 1px solid var(--iob-warning, #ed6c02);
    font-size: 13px;
}
.banner[hidden] { display: none; }
select[hidden] { display: none; }
/* the button "fit" sits in the controls of the map, in their look */
.maplibregl-ctrl-group button.fit { display: flex; align-items: center; justify-content: center; color: #333; }
.maplibregl-ctrl-group button.fit:disabled { opacity: 0.4; }
.map { position: relative; flex: 1 1 auto; min-height: 200px; border-radius: var(--iob-border-radius, 4px); overflow: hidden; background: var(--iob-background, #eee); }
.message {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    background: color-mix(in srgb, var(--iob-background, #fff) 82%, transparent);
    font-size: 15px;
}
.message[hidden] { display: none; }
${MAP_CSS}
${POPUP_CSS}
`;

/**
 * The polygons of an area as a collection
 *
 * @param areaPolygons the polygons by ID
 */
function areaCollection(areaPolygons: AreaPolygons | null | undefined): FeatureCollection | null {
    const features = Object.values(areaPolygons || {}).filter(feature => feature?.geometry);
    return features.length
        ? ({ type: 'FeatureCollection', features } as unknown as FeatureCollection)
        : null;
}

class RadarTrapMap extends IobWebComponent<MapSettings> {
    readonly #shadow: ShadowRoot;

    readonly #root: HTMLDivElement;

    readonly #bar: HTMLDivElement;

    readonly #select: HTMLSelectElement;

    readonly #info: HTMLDivElement;

    readonly #refresh: HTMLButtonElement;

    readonly #fitButton: HTMLButtonElement;

    readonly #banner: HTMLDivElement;

    readonly #mapBox: HTMLDivElement;

    readonly #message: HTMLDivElement;

    readonly #observer: IntersectionObserver;

    #visible = false;

    #map: MapLibreMap | null = null;

    #creating = false;

    #popup: Popup | null = null;

    #styleKey = '';

    #t: Translate = getTranslate('en');

    /** The routes and areas; null until the instance told them */
    #sources: SourceInfo[] | null = null;

    #sourcesLoading = false;

    #selected = '';

    #data: SourceData | null = null;

    #dataLoading = false;

    /** True while loaded data waits for the map to show it in full */
    #pendingFit = false;

    #error = '';

    /** True after the button "refresh" until the instance computed the route or area */
    #running = false;

    /** Whether the instance ran when the routes and areas were loaded: it loads them again after a restart */
    #wasAlive = false;

    /** The state `lastUpdated` of the shown route or area that the element follows */
    #followed: { id: string; socket: unknown } | null = null;

    /** The route or area of the settings the element showed last: it shows a new one at once */
    #preferred = '';

    /** Closes the attribution of a widget whenever MapLibre opens it by itself */
    #attributionObserver: MutationObserver | null = null;

    #lastUpdated: ioBroker.StateValue | undefined;

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = CSS;
        const root = document.createElement('div');
        root.className = 'root';
        this.#root = root;

        const bar = document.createElement('div');
        bar.className = 'bar';
        this.#bar = bar;
        this.#select = document.createElement('select');
        this.#info = document.createElement('div');
        this.#info.className = 'info';
        this.#refresh = document.createElement('button');
        this.#refresh.type = 'button';
        this.#refresh.innerHTML = ICONS.refresh;
        // goes into the controls of the map when the map is there
        this.#fitButton = document.createElement('button');
        this.#fitButton.type = 'button';
        this.#fitButton.className = 'fit';
        this.#fitButton.innerHTML = ICONS.fit;
        bar.append(this.#select, this.#info, this.#refresh);

        this.#banner = document.createElement('div');
        this.#banner.className = 'banner';
        this.#banner.hidden = true;

        this.#mapBox = document.createElement('div');
        this.#mapBox.className = 'map';
        this.#message = document.createElement('div');
        this.#message.className = 'message';
        this.#mapBox.append(this.#message);

        root.append(bar, this.#banner, this.#mapBox);
        this.#shadow.append(style, root);

        this.#select.addEventListener('change', () => this.#choose(this.#select.value));
        this.#fitButton.addEventListener('click', () => this.#fit(true));
        this.#refresh.addEventListener('click', () => {
            const instance = this.#instance();
            if (instance && this.#selected && !this.editMode) {
                this.#running = true;
                void this.setState(`${instance}.${this.#selected}.cron-job.run`, true);
                this.render();
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
        this.#attributionObserver?.disconnect();
        this.#attributionObserver = null;
        this.#follow(null);
        this.#popup?.remove();
        this.#popup = null;
        this.#map?.remove();
        this.#map = null;
        this.#styleKey = '';
    }

    protected getStateIds(settings: MapSettings): (string | undefined | null)[] {
        const instance = instanceOf(settings);
        return instance ? [`system.adapter.${instance}.alive`] : [];
    }

    /** The object of the instance: its token and style of the map serve when the settings have none */
    protected getObjectIds(settings: MapSettings): (string | undefined | null)[] {
        const instance = instanceOf(settings);
        return instance ? [`system.adapter.${instance}`] : [];
    }

    #instance(): string {
        return instanceOf(this.settings);
    }

    #isAlive(): boolean {
        const instance = this.#instance();
        return !!instance && !!this.states[`system.adapter.${instance}.alive`]?.val;
    }

    /** The token and the style of the map: of the settings, else of the instance */
    #mapConfig(): { token: string; style: string } {
        const native = this.objects[`system.adapter.${this.#instance()}`]?.native as InstanceNative | undefined;
        return {
            token: this.settings.token || native?.settings?.mbxAccessToken || '',
            style: this.settings.style || native?.mapStyle || 'osm',
        };
    }

    /** The ID of the route or area the settings name, `''` if none */
    #preferredSource(): string {
        return getDeviceId(this.settings.source)?.split('.')[2] || '';
    }

    // --- the data --------------------------------------------------------------------------------------------------

    /** The key of the remembered route or area of this instance */
    #storageKey(): string {
        return `radar-trap-map-${this.#instance()}`;
    }

    async #loadSources(): Promise<void> {
        const socket = this.socket;
        const instance = this.#instance();
        if (!socket || !instance || this.#sourcesLoading) {
            return;
        }
        this.#sourcesLoading = true;
        try {
            const answer = await socket.sendTo<{ sources?: SourceInfo[]; error?: string }>(instance, 'getSources', {});
            if (answer?.error) {
                throw new Error(answer.error);
            }
            this.#sources = answer?.sources || [];
            this.#error = '';
            const preferred = this.#preferredSource();
            this.#preferred = preferred;
            let selected = this.#selected || preferred;
            if (!selected) {
                try {
                    selected = window.localStorage.getItem(this.#storageKey()) || '';
                } catch {
                    // no storage in this browser
                }
            }
            if (!this.#sources.some(source => source.id === selected)) {
                selected = this.#sources[0]?.id || '';
            }
            this.#sourcesLoading = false;
            this.#choose(selected, true);
        } catch (error) {
            this.#sources = null;
            this.#error = this.#t('load_failed', (error as Error)?.message || String(error));
        } finally {
            this.#sourcesLoading = false;
            this.render();
        }
    }

    /**
     * Shows a route or an area
     *
     * @param id its ID; empty for none
     * @param force true: loads it even if it is shown already
     */
    #choose(id: string, force = false): void {
        if (id === this.#selected && !force) {
            return;
        }
        if (id !== this.#selected) {
            this.#data = null;
            this.#popup?.remove();
            this.#running = false;
        }
        this.#selected = id;
        // a widget that names its route or area starts with it every time
        if (!this.#preferredSource()) {
            try {
                window.localStorage.setItem(this.#storageKey(), id);
            } catch {
                // no storage in this browser
            }
        }
        const source = this.#sources?.find(item => item.id === id);
        this.#follow(source || null);
        void this.#loadData(true);
    }

    /**
     * Loads what the map draws of the chosen route or area
     *
     * @param fit true: the map shows it in full afterwards
     */
    async #loadData(fit: boolean): Promise<void> {
        const socket = this.socket;
        const instance = this.#instance();
        const id = this.#selected;
        if (!socket || !instance || !id) {
            this.#drawData(false);
            this.render();
            return;
        }
        this.#dataLoading = true;
        this.render();
        try {
            const answer = await socket.sendTo<{ source?: SourceData | null; error?: string }>(instance, 'getSource', { id });
            if (answer?.error) {
                throw new Error(answer.error);
            }
            if (id !== this.#selected) {
                return;
            }
            this.#data = answer?.source || null;
            this.#error = '';
            this.#drawData(fit);
        } catch (error) {
            this.#error = this.#t('load_failed', (error as Error)?.message || String(error));
        } finally {
            this.#dataLoading = false;
            this.render();
        }
    }

    /**
     * Follows the state `lastUpdated` of a route or an area, to load it again when the instance computed it anew
     *
     * @param source the route or area; null follows none
     */
    #follow(source: SourceInfo | null): void {
        const socket = this.socket;
        const instance = this.#instance();
        const id = source && instance ? getTrapIds(`${instance}.${source.id}`, source.type).lastUpdated : '';
        if (this.#followed?.id === id && this.#followed.socket === socket) {
            return;
        }
        if (this.#followed) {
            (this.#followed.socket as typeof socket)?.unsubscribeState(this.#followed.id, this.#onLastUpdated);
            this.#followed = null;
        }
        this.#lastUpdated = undefined;
        if (id && socket) {
            this.#followed = { id, socket };
            void socket.subscribeState(id, this.#onLastUpdated);
        }
    }

    readonly #onLastUpdated = (_id: string, state: ioBroker.State | null | undefined): void => {
        const value = state?.val;
        if (this.#lastUpdated !== undefined && value !== this.#lastUpdated) {
            this.#running = false;
            void this.#loadData(false);
        }
        this.#lastUpdated = value ?? null;
        this.render();
    };

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
            const { token, style } = this.#mapConfig();
            this.#styleKey = `${style}|${token}`;
            const map = new maplibre.Map({
                container: this.#mapBox,
                style: getStyle(style, token),
                center: [10.45, 51.16],
                zoom: 5,
                attributionControl: { compact: true },
            });
            map.addControl(new maplibre.NavigationControl({}), 'top-right');
            const fitButton = this.#fitButton;
            map.addControl(
                {
                    onAdd: () => {
                        const group = document.createElement('div');
                        group.className = 'maplibregl-ctrl maplibregl-ctrl-group';
                        group.append(fitButton);
                        return group;
                    },
                    onRemove: () => fitButton.parentElement?.remove(),
                },
                'top-right',
            );
            map.addControl(new maplibre.FullscreenControl({ container: this.#mapBox }), 'top-right');
            map.addControl(new maplibre.ScaleControl({}), 'bottom-left');
            if (!this.settings.form) {
                this.#collapseAttribution();
            }
            this.#map = map;
            this.#popup = new maplibre.Popup({ closeButton: true, maxWidth: '320px', offset: 12 });

            onStyle(map, () => {
                addTrapLayers(map);
                void addTrapImages(map);
                this.#showTraffic();
                this.#drawData(this.#pendingFit);
            });

            for (const layer of [LAYERS.traps, LAYERS.clusters, LAYERS.trafficClosure]) {
                map.on('mouseenter', layer, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });
                map.on('mouseleave', layer, () => {
                    map.getCanvas().style.cursor = '';
                });
            }
            map.on('click', LAYERS.clusters, event => this.#onClusterClick(event));
            map.on('click', LAYERS.traps, event => this.#onTrapClick(event));
            map.on('click', LAYERS.trafficClosure, event => this.#onClosureClick(event));
        } catch (error) {
            this.#error = this.#t('load_failed', (error as Error)?.message || String(error));
            this.render();
        } finally {
            this.#creating = false;
        }
    }

    /**
     * A widget shows the attribution closed: a tile has no room for it, the button "i" opens it.
     *
     * MapLibre opens the compact attribution itself whenever it makes it compact - once the style brings the first
     * attribution, and again after the full screen - and closes it only when the map is dragged. The observer closes
     * it right then; a click on "i" leaves the attribution compact, so the observer lets it be.
     */
    #collapseAttribution(): void {
        const attribution = this.#mapBox.querySelector<HTMLElement>('.maplibregl-ctrl-attrib');
        if (!attribution) {
            return;
        }
        const close = (): void => attribution.classList.remove('maplibregl-compact-show');
        if (attribution.classList.contains('maplibregl-compact')) {
            close();
        }
        this.#attributionObserver?.disconnect();
        this.#attributionObserver = new MutationObserver(records => {
            const madeCompact = records.some(
                record => !(record.oldValue || '').split(' ').includes('maplibregl-compact'),
            );
            if (madeCompact && attribution.classList.contains('maplibregl-compact')) {
                close();
            }
        });
        this.#attributionObserver.observe(attribution, {
            attributes: true,
            attributeFilter: ['class'],
            attributeOldValue: true,
        });
    }

    #onClusterClick(event: MapLayerMouseEvent): void {
        const feature = event.features?.[0];
        const map = this.#map;
        const source = feature && map?.getSource(feature.source);
        if (!feature || !source || !('getClusterExpansionZoom' in source)) {
            return;
        }
        void (source as unknown as { getClusterExpansionZoom(id: number): Promise<number> })
            .getClusterExpansionZoom(Number(feature.properties?.cluster_id))
            .then(zoom => {
                map!.easeTo({ center: (feature.geometry as GeoJSON.Point).coordinates as [number, number], zoom, duration: 600 });
            })
            .catch(() => undefined);
    }

    #onTrapClick(event: MapLayerMouseEvent): void {
        const raw = event.features?.[0]?.properties?.trapInfo as string | TrapInfo | undefined;
        if (!raw || !this.#map || !this.#popup) {
            return;
        }
        let info: TrapInfo;
        try {
            info = typeof raw === 'string' ? (JSON.parse(raw) as TrapInfo) : raw;
        } catch {
            return;
        }
        this.#popup.setLngLat(event.lngLat).setHTML(trapPopupHtml(info, this.#t)).addTo(this.#map);
    }

    #onClosureClick(event: MapLayerMouseEvent): void {
        const raw = event.features?.[0]?.properties?.address as string | ClosureAddress | undefined;
        if (!this.#map || !this.#popup) {
            return;
        }
        let address: ClosureAddress = {};
        try {
            address = typeof raw === 'string' ? (JSON.parse(raw) as ClosureAddress) : raw || {};
        } catch {
            // no address
        }
        this.#popup.setLngLat(event.lngLat).setHTML(closurePopupHtml(address, this.#t)).addTo(this.#map);
    }

    /** The traffic of mapbox over the map, if the settings ask for it and there is a token */
    #showTraffic(): void {
        const map = this.#map;
        if (map?.getSource(SOURCES.traps)) {
            setTraffic(map, this.settings.traffic ? this.#mapConfig().token : '');
        }
    }

    /** What the map draws of the loaded route or area */
    #trapData(): TrapData {
        const data = this.#data;
        return {
            directions: data?.directions,
            area: areaCollection(data?.areaPolygons),
            traps: data?.traps,
            polyLines: data?.polyLines,
        };
    }

    /**
     * Draws the loaded route or area
     *
     * @param fit true: the map shows it in full
     */
    #drawData(fit: boolean): void {
        const map = this.#map;
        if (!map || !map.getSource(SOURCES.traps)) {
            // the map shows it once its style is there
            this.#pendingFit ||= fit;
            return;
        }
        setTrapData(map, this.#trapData());
        if (fit) {
            this.#pendingFit = false;
            this.#fit(false);
        }
    }

    /**
     * Shows the route or area in full
     *
     * @param animate true: the map moves there
     */
    #fit(animate: boolean): void {
        const data = this.#trapData();
        const bounds = getBounds([data.directions, data.area, data.traps]);
        if (bounds && this.#map) {
            this.#map.fitBounds(bounds, { padding: 40, animate, maxZoom: 15 });
        }
    }

    // --- the element -----------------------------------------------------------------------------------------------

    protected render(): void {
        this.#t = getTranslate(this.systemLang);
        const t = this.#t;
        this.#refresh.title = t('refresh');
        this.#fitButton.title = t('fit');
        this.#select.title = t('select_source');

        const alive = this.#isAlive();
        if (alive && (!this.#wasAlive || !this.#sources) && !this.#sourcesLoading && this.socket) {
            // the instance (re)started: after saving, it computed the configuration anew
            this.#wasAlive = true;
            void this.#loadSources();
        } else if (!alive) {
            this.#wasAlive = false;
        }
        // a new connection: follow the state again
        if (this.#followed && this.#followed.socket !== this.socket) {
            this.#follow(this.#sources?.find(source => source.id === this.#selected) || null);
        }
        // the settings name another route or area: show it
        const preferred = this.#preferredSource();
        if (this.#sources && preferred !== this.#preferred) {
            this.#preferred = preferred;
            if (preferred && this.#sources.some(source => source.id === preferred)) {
                this.#choose(preferred);
            }
        }

        // the list of the routes and areas
        const sources = this.#sources || [];
        const options = sources
            .map(
                source =>
                    `<option value="${escapeHtml(source.id)}"${source.id === this.#selected ? ' selected' : ''}>${escapeHtml(source.name)}</option>`,
            )
            .join('');
        if (this.#select.dataset.options !== options) {
            this.#select.dataset.options = options;
            this.#select.innerHTML = options;
        }
        this.#select.value = this.#selected;
        this.#select.disabled = !sources.length;
        this.#select.hidden = this.settings.showSelect === false;
        this.#root.className = `root${this.settings.form ? '' : ' widget'}${this.editMode ? ' edit' : ''}`;
        this.#bar.className = this.#select.hidden ? 'bar' : 'bar with-select';

        // what is going on
        const computing = this.#running || this.#data?.status === 'loading';
        this.#info.className = computing || this.#dataLoading ? 'info busy' : 'info';
        if (computing) {
            this.#info.textContent = t('computing');
        } else if (this.#dataLoading) {
            this.#info.textContent = t('loading');
        } else if (this.#data) {
            const count = this.#data.traps?.features?.length || 0;
            const updated = this.#lastUpdated ?? this.#data.timestamp;
            const when = updated ? formatLastUpdate(updated, this.systemLang) : '';
            this.#info.textContent = [count ? `${count} ${t('traps')}` : t('no_traps'), when ? t('last_update', when) : '']
                .filter(Boolean)
                .join(' - ');
        } else {
            this.#info.textContent = '';
        }
        this.#refresh.disabled = !alive || !this.#selected || computing || this.editMode;
        this.#fitButton.disabled = !this.#data;

        const { token, style } = this.#mapConfig();
        const banner = this.settings.changed
            ? t('save_to_compute')
            : this.settings.traffic && !token
              ? t('traffic_needs_token')
              : '';
        this.#banner.textContent = banner;
        this.#banner.hidden = !banner;

        // a message over the map
        let message = '';
        if (!alive) {
            message = t('instance_not_started');
        } else if (this.#error) {
            message = this.#error;
        } else if (this.#sources && !this.#sources.length) {
            message = t('no_sources');
        } else if (!this.#sources) {
            message = t('loading');
        }
        this.#message.textContent = message;
        this.#message.hidden = !message;

        const map = this.#map;
        if (map) {
            const styleKey = `${style}|${token}`;
            if (styleKey !== this.#styleKey) {
                this.#styleKey = styleKey;
                // the layers, the traffic and the data come back with `style.load`
                map.setStyle(getStyle(style, token));
            } else {
                this.#showTraffic();
            }
        } else if (this.#visible) {
            void this.#createMap();
        }
    }
}

defineWebComponent(COMPONENTS.map.tag, RadarTrapMap);
