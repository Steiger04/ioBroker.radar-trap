/**
 * The words the components show, in the language of the ioBroker system.
 *
 * They come from the dictionary of the widgets (`src-shared/i18n`): the build picks them in every language and puts
 * them in as `__RADAR_TRAP_WORDS__` (`vite.config.ts`).
 */
import { PREFIX, wordKey } from '@radar-trap/traps';

declare const __RADAR_TRAP_WORDS__: Record<string, Record<string, string>>;

/** A word in the language of the system; every `%s` takes the next argument */
export interface Translate {
    /** A word by its key without the prefix: `no_traps` */
    (key: string, ...args: (string | number)[]): string;
    /** The translation of an English name of a kind of trap */
    text(english: string | false | undefined | null): string;
}

/**
 * The words of one language, English where it has none
 *
 * @param lang the language of the ioBroker system
 */
export function getTranslate(lang: string): Translate {
    const words = __RADAR_TRAP_WORDS__[lang] || {};
    const english = __RADAR_TRAP_WORDS__.en || {};
    const translate = ((key: string, ...args: (string | number)[]): string => {
        let text = words[PREFIX + key] || english[PREFIX + key] || key;
        for (const arg of args) {
            text = text.replace('%s', String(arg));
        }
        return text;
    }) as Translate;
    translate.text = englishText => {
        if (!englishText) {
            return '';
        }
        const key = wordKey(englishText);
        return words[key] || englishText;
    };
    return translate;
}

/**
 * Text for HTML: the five characters that could start markup are escaped
 *
 * @param text any text, e.g. of a trap
 */
export function escapeHtml(text: unknown): string {
    return String(text ?? '').replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
}
