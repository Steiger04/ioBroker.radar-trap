/** Tag of the custom element; a host checks that the module defines exactly this one */
export const TAG = 'iob-radar-trap-traps';

/** The built module, next to its manifest */
export const MODULE_FILE = 'radar-trap-traps.js';

/** The manifest the build writes next to the module; `common.webComponents` names this one */
export const MANIFEST_FILE = 'radar-trap-traps.json';

/** Where `tasks.js` puts the module in the admin folder; the React import is relative to it */
export const MODULE_PATH = `webcomponents/${MODULE_FILE}`;

/** The folder of the icons of the categories, next to the module (`tasks.js` copies them) */
export const ICON_FOLDER = 'icons';

/** The languages of ioBroker; every text of the manifest and of the element comes in all of them */
export const LANGUAGES = ['en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'uk', 'zh-cn'] as const;

/**
 * The words the element shows, from the dictionary of the widgets (`src-shared/i18n`). The build picks them, and the
 * names of all categories and kinds of trap besides (`vite.config.ts`), so the module carries these and not the
 * labels of the settings.
 */
export const WORD_KEYS = [
    'radar_trap_info',
    'radar_trap_no_device',
    'radar_trap_not_found',
    'radar_trap_no_traps',
    'radar_trap_traps',
    'radar_trap_new',
    'radar_trap_new_count',
    'radar_trap_last_update',
    'radar_trap_refresh',
    'radar_trap_unknown_speed',
] as const;

/** What the element shows in its box: the number, the list, or what fits */
export type TrapContent = 'auto' | 'summary' | 'list';

/** The values of the settings of the manifest; a setting without a value is missing */
export type TrapSettings = {
    /** The device of the area or route, `radar-trap.0.<id>` */
    device?: string;
    /** Instead of the name of the area or route */
    title?: string;
    content?: string;
    onlyNew?: boolean;
    showHotspots?: boolean;
    showArchive?: boolean;
    showRefresh?: boolean;
};

/**
 * What the element shows, `auto` for an unknown value
 *
 * @param value the value of the setting `content`
 */
export function getContent(value: string | undefined): TrapContent {
    return value === 'summary' || value === 'list' ? value : 'auto';
}
