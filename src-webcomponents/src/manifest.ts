/**
 * The manifest of `<iob-radar-trap-traps>`. Read by the build only (`vite.config.ts`), which writes it as
 * `radar-trap-traps.json` next to the module - a host reads that file for its palette and its settings without
 * loading the module.
 *
 * The texts are not written here: the name and the description are those of the devices tile
 * (`common.deviceWidgets` in `io-package.json`), the labels of the settings come from the dictionary of the widgets
 * (`src-shared/i18n`). The same name is what lets vis-2 and devices hide the web component behind their own widget.
 */
import type { WebComponentManifest, WebComponentText } from '@iobroker/web-components';

// with the extension: `vite.config.ts` imports this file, and Vite may load its config natively
import { MODULE_FILE, TAG } from './constants.ts';

/** The words of the dictionary the settings are labelled with */
export const MANIFEST_WORD_KEYS = [
    'radar_trap_device',
    'radar_trap_device_help',
    'radar_trap_name',
    'radar_trap_name_help',
    'radar_trap_content',
    'radar_trap_content_help',
    'radar_trap_content_auto',
    'radar_trap_content_summary',
    'radar_trap_content_list',
    'radar_trap_only_new_traps',
    'radar_trap_show_hotspots',
    'radar_trap_show_archive',
    'radar_trap_show_refresh',
] as const;

export type ManifestWordKey = (typeof MANIFEST_WORD_KEYS)[number];

/**
 * The manifest, with the texts of the adapter
 *
 * @param word a word of the dictionary in every language
 * @param widget name and description of the devices tile
 * @param widget.name the label of the devices tile
 * @param widget.description the description of the devices tile
 */
export function buildManifest(
    word: (key: ManifestWordKey) => WebComponentText,
    widget: { name: WebComponentText; description: WebComponentText },
): WebComponentManifest {
    return {
        $schema: 'https://raw.githubusercontent.com/ioBroker/web-components/main/schemas/manifest.json',
        manifestVersion: 1,
        tag: TAG,
        name: widget.name,
        description: widget.description,
        // relative to this file: the icon of the devices tile, /adapter/radar-trap/dm-widgets/radar-trap.png
        icon: '../dm-widgets/radar-trap.png',
        module: MODULE_FILE,
        size: { width: 320, height: 300 },
        settings: {
            type: 'panel',
            items: {
                device: {
                    type: 'objectId',
                    types: 'device',
                    root: 'radar-trap',
                    label: word('radar_trap_device'),
                    help: word('radar_trap_device_help'),
                },
                title: {
                    type: 'text',
                    label: word('radar_trap_name'),
                    help: word('radar_trap_name_help'),
                },
                content: {
                    type: 'select',
                    label: word('radar_trap_content'),
                    help: word('radar_trap_content_help'),
                    default: 'auto',
                    options: [
                        { value: 'auto', label: word('radar_trap_content_auto') },
                        { value: 'summary', label: word('radar_trap_content_summary') },
                        { value: 'list', label: word('radar_trap_content_list') },
                    ],
                },
                onlyNew: {
                    type: 'checkbox',
                    label: word('radar_trap_only_new_traps'),
                    default: false,
                },
                showHotspots: {
                    type: 'checkbox',
                    label: word('radar_trap_show_hotspots'),
                    default: false,
                },
                showArchive: {
                    type: 'checkbox',
                    label: word('radar_trap_show_archive'),
                    default: false,
                },
                showRefresh: {
                    type: 'checkbox',
                    label: word('radar_trap_show_refresh'),
                    default: true,
                },
            },
        },
    };
}
