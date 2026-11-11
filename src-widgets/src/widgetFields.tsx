/**
 * Settings the widgets share. The names of the fields are those of the old widget set
 * `vis-2-widgets-radar-trap`, so that its widgets keep their settings.
 */

import type { RxWidgetInfoAttributesField, RxWidgetInfoGroup } from '@iobroker/types-vis-2';

import { VIS_TRAPS_DEFAULT } from '@radar-trap/traps';

import { VisRadarMapSelect } from './components/VisRadarMapSelect';
import { VisTraps } from './components/VisTraps';

/** The styles of mapbox; the label is a word of the dictionary (`style_streets_v12`) */
const MAP_STYLES = [
    'satellite-v9',
    'satellite-streets-v11',
    'streets-v11',
    'streets-v12',
    'light-v10',
    'dark-v10',
    'outdoors-v11',
    'traffic-day-v2',
    'traffic-night-v2',
];

export const MAP_STYLE_OPTIONS = MAP_STYLES.map(style => ({
    value: style,
    label: `style_${style.replace(/-/g, '_')}`,
}));

/**
 * The selection of an area or a route
 *
 * @param name name of the field
 * @param label word of its label
 * @param type which sources to offer
 */
export function sourceField(name: string, label: string, type: 'area' | 'route' | 'all'): RxWidgetInfoAttributesField {
    return {
        name,
        label,
        default: '',
        type: 'custom',
        noBinding: true,
        component: (field, data, onDataChange, props) => (
            <VisRadarMapSelect
                type={type}
                socket={props.context.socket}
                fieldName={field.name || name}
                fieldValue={(data[field.name || name] as string) || ''}
                onDataChange={onDataChange}
            />
        ),
    };
}

/** The checkbox "without card" and the title */
export const COMMON_FIELDS: RxWidgetInfoAttributesField[] = [
    {
        name: 'noCard',
        label: 'no_card',
        type: 'checkbox',
    },
    {
        name: 'oid',
        label: 'title',
        type: 'id',
        noInit: true,
        filter: { common: { type: 'string' } },
    },
];

/**
 * The group "Traps": which of them are shown
 *
 * @param map whether the fields of the map belong to it
 */
export function trapGroup(map: boolean): RxWidgetInfoGroup {
    const fields: RxWidgetInfoAttributesField[] = [
        {
            name: 'onlyNewTraps',
            label: 'only_new_traps',
            type: 'checkbox',
            noBinding: true,
            default: false,
        },
    ];
    if (map) {
        fields.push(
            {
                name: 'closedCongestedRoad',
                label: 'closed_congested_road',
                type: 'checkbox',
                noBinding: true,
                default: true,
            },
            {
                name: 'animateClosedCongestedRoad',
                label: 'animate_closed_congested_road',
                type: 'checkbox',
                noBinding: true,
                default: false,
            },
        );
    }
    fields.push({
        name: 'visTraps',
        label: 'group_traps',
        noBinding: true,
        // an object: the type of the field allows simple values only, vis-2 takes any
        default: VIS_TRAPS_DEFAULT as unknown as string,
        type: 'custom',
        component: (field, data, onDataChange) => (
            <VisTraps
                fieldName={field.name || 'visTraps'}
                fieldValue={data[field.name || 'visTraps']}
                onDataChange={onDataChange}
            />
        ),
    });

    return {
        name: 'traps',
        label: 'group_traps',
        fields,
    };
}

/** The colours of the traps and their clusters on the map */
export const SYMBOL_FIELDS: RxWidgetInfoAttributesField[] = [
    {
        name: 'clusterColor',
        label: 'cluster_color',
        type: 'color',
        default: 'rgba(197,14,228,0.4)',
    },
    {
        name: 'clusterTextColor',
        label: 'cluster_text_color',
        type: 'color',
        default: 'rgba(52,27,57,0.95)',
    },
    {
        name: 'symbolColor',
        label: 'symbol_color',
        type: 'color',
        default: 'rgba(13,77,133,0.8)',
    },
    {
        name: 'symbolTextColor',
        label: 'symbol_text_color',
        type: 'color',
        default: 'rgba(10,34,55,0.95)',
    },
    {
        name: 'symbolNewColor',
        label: 'symbol_new_color',
        type: 'color',
        default: 'rgba(232,10,10,0.7)',
    },
    {
        name: 'symbolTextNewColor',
        label: 'symbol_text_new_color',
        type: 'color',
        default: 'rgba(123,25,25,0.95)',
    },
];

/** The buttons, the style and the clusters of a map */
export const MAP_FIELDS: RxWidgetInfoAttributesField[] = [
    {
        name: 'fitButton',
        label: 'fit_button',
        type: 'checkbox',
        default: true,
    },
    {
        name: 'refreshButton',
        label: 'refresh_button',
        type: 'checkbox',
        default: true,
    },
];

export const STYLE_FIELDS: RxWidgetInfoAttributesField[] = [
    {
        name: 'styleSelect',
        label: 'style_select',
        type: 'select',
        default: 'streets-v12',
        options: MAP_STYLE_OPTIONS,
    },
    {
        name: 'showCluster',
        label: 'show_cluster',
        type: 'checkbox',
        default: true,
    },
];
