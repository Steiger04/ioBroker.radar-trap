/**
 * The manifests of the components: the build writes each next to its module. The address search and the area editor
 * are for JSON-Config of this adapter only. The map is in `common.webComponents` as well: devices, vis-2 and aura
 * offer it in their palettes, with the settings below. JSON-Config sets `changed` and `form` besides, which no
 * palette shows.
 */
import type { WebComponentManifest, WebComponentText } from '@iobroker/web-components';

import { COMPONENTS, type ComponentName } from './constants.ts';

/** The styles of the maps, as `mapStyle` of the configuration has them */
const STYLE_OPTIONS: { value: string; label: WebComponentText }[] = [
    { value: 'osm', label: 'OpenStreetMap' },
    { value: 'osm-dark', label: { en: 'OpenStreetMap, dark', de: 'OpenStreetMap, dunkel' } },
    { value: 'liberty', label: 'OpenFreeMap Liberty' },
    { value: 'positron', label: 'OpenFreeMap Positron' },
    { value: 'mapbox-streets-v12', label: 'Mapbox Streets' },
    { value: 'mapbox-outdoors-v12', label: 'Mapbox Outdoors' },
    { value: 'mapbox-light-v11', label: 'Mapbox Light' },
    { value: 'mapbox-dark-v11', label: 'Mapbox Dark' },
    { value: 'mapbox-satellite-streets-v12', label: { en: 'Mapbox Satellite', de: 'Mapbox Satellit' } },
];

const TOKEN = { type: 'text', label: { en: 'Mapbox token', de: 'Mapbox-Token' } } as const;

const STYLE = {
    type: 'select',
    label: { en: 'Style of the map', de: 'Stil der Karte' },
    options: STYLE_OPTIONS,
    default: 'osm',
} as const;

/**
 * The manifest of a component
 *
 * @param name which one
 * @param word a word of the dictionary (`src-shared/i18n`) in every language
 */
export function buildManifest(name: ComponentName, word: (key: string) => WebComponentText): WebComponentManifest {
    const { tag, file } = COMPONENTS[name];
    const base = { manifestVersion: 1 as const, tag, module: `./${file}.js` };
    switch (name) {
        case 'address':
            return {
                ...base,
                name: { en: 'Address of a route', de: 'Adresse einer Route' },
                description: {
                    en: 'Searches an address and stores it with its position',
                    de: 'Sucht eine Adresse und speichert sie mit ihrer Position',
                },
                size: { width: 400, height: 64 },
                editsValue: true,
                settings: { type: 'panel', items: { token: TOKEN } },
            };
        case 'area':
            return {
                ...base,
                name: { en: 'Area of radar traps', de: 'Gebiet für Blitzer' },
                description: {
                    en: 'Draws an area as a polygon or a circle, or takes a German county',
                    de: 'Zeichnet ein Gebiet als Polygon oder Kreis oder übernimmt einen Landkreis',
                },
                size: { width: 600, height: 440 },
                editsValue: true,
                settings: { type: 'panel', items: { token: TOKEN, style: STYLE } },
            };
        case 'map':
            return {
                ...base,
                name: word('radar_trap_map_name'),
                description: word('radar_trap_map_description'),
                // relative to this file: the icon of the devices tile, /adapter/radar-trap/dm-widgets/radar-trap.png
                icon: '../dm-widgets/radar-trap.png',
                // a 2x2 tile of devices
                size: { width: 480, height: 400 },
                settings: {
                    type: 'panel',
                    items: {
                        instance: {
                            type: 'instance',
                            adapter: 'radar-trap',
                            label: word('radar_trap_instance'),
                            default: 'radar-trap.0',
                        },
                        source: {
                            type: 'objectId',
                            types: 'device',
                            root: 'radar-trap',
                            label: word('radar_trap_device'),
                            help: word('radar_trap_map_source_help'),
                        },
                        showSelect: { type: 'checkbox', label: word('radar_trap_show_select'), default: true },
                        traffic: {
                            type: 'checkbox',
                            label: word('radar_trap_traffic'),
                            help: word('radar_trap_traffic_help'),
                            default: false,
                        },
                        style: {
                            type: 'select',
                            label: word('radar_trap_map_style'),
                            options: [{ value: '', label: word('radar_trap_style_of_instance') }, ...STYLE_OPTIONS],
                            default: '',
                        },
                        token: {
                            type: 'text',
                            label: word('radar_trap_mapbox_token'),
                            help: word('radar_trap_mapbox_token_help'),
                        },
                        // Set by JSON-Config only, hidden in the palettes. In the manifest all the same: a host hands
                        // the element only the settings of the manifest
                        changed: { type: 'checkbox', hidden: 'true' },
                        form: { type: 'checkbox', hidden: 'true' },
                    },
                },
            };
    }
}
