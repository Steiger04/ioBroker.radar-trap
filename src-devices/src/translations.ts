/**
 * The words of the tile, as the devices app loads them.
 *
 * No `prefix` here, unlike the vis-2 side: the devices app hands the dictionary to `I18n.extendTranslations`
 * unchanged, and the keys already carry the `radar_trap_` prefix themselves.
 */

import { dictionary } from '@radar-trap/dictionary';

export default dictionary;
