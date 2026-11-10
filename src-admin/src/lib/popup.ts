/** What the popup of the map shows about a trap or a closed road - as the popup of the vis-2 widgets */
import { formatVmax, type TrapInfo } from '@radar-trap/traps';

import { escapeHtml, type Translate } from '../i18n';

/** The CSS of the popup, inside the shadow root of the map */
export const POPUP_CSS = `
.trap-popup { min-width: 200px; max-width: 300px; font-size: 13px; line-height: 1.4; }
.trap-popup .head {
    background: var(--iob-primary, #3399cc);
    color: var(--iob-primary-contrast, #fff);
    padding: 6px 28px 6px 10px;
    font-size: 15px;
    font-weight: 500;
}
.trap-popup .body { padding: 6px 10px 8px; }
.trap-popup .line b { font-weight: 600; }
.trap-popup hr { border: 0; border-top: 1px solid var(--iob-divider, #ddd); margin: 4px 0; }
.maplibregl-popup-close-button { color: var(--iob-primary-contrast, #fff); font-size: 18px; padding: 0 6px; }
`;

/**
 * One line of the popup
 *
 * @param label the word of the label
 * @param value the value, as text
 */
function line(label: string, value: string): string {
    return `<div class="line"><b>${escapeHtml(label)}:</b> ${escapeHtml(value)}</div>`;
}

/**
 * The popup of a trap
 *
 * @param info the trap info of the feature
 * @param t the words
 */
export function trapPopupHtml(info: TrapInfo, t: Translate): string {
    const vmax = formatVmax(info.vmax);
    const lines: string[] = [];
    if (info.typeText) {
        lines.push(line(t('kind'), t.text(info.typeText)));
    }
    if (vmax) {
        lines.push(line(t('maximum_speed'), vmax === 'unknown' ? t('unknown_speed') : vmax));
    }
    if (info.reason) {
        lines.push(line(t('reason'), String(info.reason)));
    }
    if (info.length) {
        lines.push(line(t('jam_length'), `${info.length} km`));
    }
    if (info.duration) {
        lines.push(line(t('duration'), `${info.duration} min.`));
    }
    if (info.delay) {
        lines.push(line(t('delay'), `${info.delay} min.`));
    }
    if (info.createDate) {
        lines.push(line(t('reported'), String(info.createDate)));
    }
    if (info.confirmDate) {
        lines.push(line(t('confirmed'), String(info.confirmDate)));
    }
    const address: string[] = [];
    if (info.state) {
        address.push(line(t('state'), String(info.state)));
    }
    if (info.street) {
        address.push(line(t('street'), String(info.street)));
    }
    if (info.zipCode && info.city) {
        address.push(line(t('city'), `${info.zipCode} ${info.city}`));
    }
    if (info.cityDistrict) {
        address.push(line(t('city_district'), String(info.cityDistrict)));
    }
    const head = info.typeDesc ? `<div class="head">${escapeHtml(t.text(String(info.typeDesc)))}</div>` : '';
    const divider = lines.length && address.length ? '<hr>' : '';
    return `<div class="trap-popup">${head}<div class="body">${lines.join('')}${divider}${address.join('')}</div></div>`;
}

/** The address of a closed road, as the polylines carry it */
export interface ClosureAddress {
    country?: string;
    zip?: string;
    city?: string;
    street?: string;
}

/**
 * The popup of a closed road
 *
 * @param address the address of the closure
 * @param t the words
 */
export function closurePopupHtml(address: ClosureAddress, t: Translate): string {
    const lines: string[] = [];
    if (address.street) {
        lines.push(line(t('street'), address.street));
    }
    if (address.city) {
        lines.push(line(t('city'), `${address.zip || ''} ${address.city}`.trim()));
    }
    return `<div class="trap-popup"><div class="head">${escapeHtml(t('traffic_closure'))}</div><div class="body">${lines.join('')}</div></div>`;
}
