/** Translation helpers of the widget set: the words live in `src-shared/i18n`, every key with `radar_trap_` */

import { I18n } from '@iobroker/gui-components';
import { PREFIX, wordKey } from '@radar-trap/traps';

/**
 * A word of the dictionary
 *
 * @param key the key without the prefix, e.g. `no_card`
 * @param args replace the `%s` in the text one after the other
 */
export function t(key: string, ...args: (string | number)[]): string {
    return I18n.t(PREFIX + key, ...args.map(String));
}

/**
 * The translation of an English name of a category or a kind of trap, e.g. `police report, archive`
 *
 * @param text the English name, as the adapter writes it into `typeDesc` and `typeText`
 */
export function tText(text: string | false | undefined | null): string {
    if (!text) {
        return '';
    }
    const key = wordKey(text);
    const translated = I18n.t(key);
    return translated === key ? text : translated;
}
