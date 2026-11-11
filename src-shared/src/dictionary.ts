/**
 * The words of all front-ends of radar-trap, per language. Every key starts with `radar_trap_` (`PREFIX`), so the
 * dictionary can be merged into the one of any host: vis-2 is told the prefix, the devices app takes the keys as
 * they are, the web component picks its words at build time.
 */

import en from '../i18n/en.json';
import de from '../i18n/de.json';
import ru from '../i18n/ru.json';
import pt from '../i18n/pt.json';
import nl from '../i18n/nl.json';
import fr from '../i18n/fr.json';
import it from '../i18n/it.json';
import es from '../i18n/es.json';
import pl from '../i18n/pl.json';
import uk from '../i18n/uk.json';
import zhCn from '../i18n/zh-cn.json';

export const dictionary: Record<ioBroker.Languages, Record<string, string>> = {
    en,
    de,
    ru,
    pt,
    nl,
    fr,
    it,
    es,
    pl,
    uk,
    'zh-cn': zhCn,
};
