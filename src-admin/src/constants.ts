/**
 * The web components of the configuration (JSON-Config, `admin/jsonConfig.json5`). Each is one ES module next to its
 * manifest in `admin/custom/`; what they share - MapLibre, the layers, the icons - lies beside them in chunks and
 * folders that the modules load relative to themselves.
 */

/** The languages of ioBroker; every text of the manifests and of the elements comes in all of them */
export const LANGUAGES = ['en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'uk', 'zh-cn'] as const;

/** Where `tasks.js` puts the build in the admin folder */
export const OUTPUT_FOLDER = 'custom';

/** The folder of the icons of the traps, next to the modules (`tasks.js` copies them) */
export const ICON_FOLDER = 'icons';

/** The German counties for the area editor, next to the modules; loaded only when the user searches one */
export const COUNTIES_FILE = 'landkreise.json';

/**
 * The worker of MapLibre, next to the modules (`vite.config.ts` copies it). As `.js`: every web server of ioBroker
 * serves that as JavaScript, which a module worker needs
 */
export const WORKER_FILE = 'radar-trap-maplibre-worker.js';

/** The components: tag, module and manifest file */
export const COMPONENTS = {
    address: { tag: 'iob-radar-trap-address', file: 'radar-trap-address' },
    area: { tag: 'iob-radar-trap-area', file: 'radar-trap-area' },
    map: { tag: 'iob-radar-trap-map', file: 'radar-trap-map' },
} as const;

export type ComponentName = keyof typeof COMPONENTS;

/**
 * The words the components show, from the dictionary of the widgets (`src-shared/i18n`). The build picks them, and
 * the names of all kinds of trap besides (`vite.config.ts`)
 */
export const WORD_KEYS = [
    'radar_trap_search_address',
    'radar_trap_pick_suggestion',
    'radar_trap_no_address_found',
    'radar_trap_search_failed',
    'radar_trap_polygon',
    'radar_trap_circle',
    'radar_trap_county',
    'radar_trap_search_county',
    'radar_trap_delete_area',
    'radar_trap_draw_polygon_hint',
    'radar_trap_draw_circle_hint',
    'radar_trap_edit_hint',
    'radar_trap_no_area_yet',
    'radar_trap_radius',
    'radar_trap_select_source',
    'radar_trap_no_sources',
    'radar_trap_save_to_compute',
    'radar_trap_computing',
    'radar_trap_loading',
    'radar_trap_load_failed',
    'radar_trap_fit',
    'radar_trap_instance_not_started',
    'radar_trap_traffic_needs_token',
    'radar_trap_last_update',
    'radar_trap_refresh',
    'radar_trap_traps',
    'radar_trap_no_traps',
    'radar_trap_new',
    'radar_trap_traffic_closure',
    'radar_trap_kind',
    'radar_trap_maximum_speed',
    'radar_trap_unknown_speed',
    'radar_trap_reason',
    'radar_trap_jam_length',
    'radar_trap_duration',
    'radar_trap_delay',
    'radar_trap_reported',
    'radar_trap_confirmed',
    'radar_trap_state',
    'radar_trap_street',
    'radar_trap_city',
    'radar_trap_city_district',
] as const;

/** The value of the address component: the address as the geocoder named it and where it is */
export interface Place {
    address: string;
    geometry: { type: 'Point'; coordinates: [number, number] };
}

/** A polygon of an area; a circle carries its centre and radius as well */
export interface AreaFeature {
    type: 'Feature';
    id: string;
    properties: Record<string, unknown> & { isCircle?: boolean; center?: [number, number]; radiusInKm?: number };
    geometry: { type: 'Polygon'; coordinates: number[][][] } | { type: 'MultiPolygon'; coordinates: number[][][][] };
}

/** The value of the area component: one polygon by its ID, as the database of the adapter stores it */
export type AreaPolygons = Record<string, AreaFeature>;
