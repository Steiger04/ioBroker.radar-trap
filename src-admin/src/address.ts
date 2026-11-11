/**
 * `<iob-radar-trap-address>`: the start or the destination of a route in the configuration.
 *
 * The value is `{ address, geometry }` - the address as the geocoder named it and the point. What the user types is
 * only a search: the value changes when they pick a suggestion, so the address and the point always belong together.
 * Leaving the field without picking one shows the stored address again.
 */
import { defineWebComponent, IobWebComponent } from '@iobroker/web-components/element';

import { COMPONENTS, type Place } from './constants';
import { escapeHtml, getTranslate, type Translate } from './i18n';
import { searchAddress, type Suggestion } from './lib/geocode';

type AddressSettings = {
    /** The token of mapbox; without it Photon (OpenStreetMap) searches */
    token?: string;
};

const CSS = `
:host { display: block; font-family: var(--iob-font-family, inherit); font-size: var(--iob-font-size, 14px); }
.box { position: relative; height: 100%; }
input {
    width: 100%;
    box-sizing: border-box;
    height: 32px;
    border: 0;
    border-bottom: 1px solid var(--iob-text-secondary, #888);
    background: transparent;
    color: var(--iob-text, inherit);
    font: inherit;
    font-size: 16px;
    padding: 4px 0;
    outline: none;
}
input:focus { border-bottom: 2px solid var(--iob-primary, #3399cc); padding-bottom: 3px; }
.status { font-size: 12px; color: var(--iob-text-secondary, #888); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status.missing { color: var(--iob-warning, #ed6c02); }
.status.error { color: var(--iob-error, #d32f2f); }
ul {
    position: absolute;
    left: 0;
    right: 0;
    top: 34px;
    z-index: 1500;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    background: var(--iob-paper, #fff);
    color: var(--iob-text, #000);
    border-radius: var(--iob-border-radius, 4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-height: 260px;
    overflow-y: auto;
}
ul[hidden] { display: none; }
li { padding: 6px 12px; cursor: pointer; line-height: 1.3; }
li.active, li:hover { background: color-mix(in srgb, var(--iob-primary, #3399cc) 18%, transparent); }
li.info { cursor: default; color: var(--iob-text-secondary, #888); background: none; }
`;

class RadarTrapAddress extends IobWebComponent<AddressSettings, Place | null> {
    readonly #input: HTMLInputElement;

    readonly #status: HTMLDivElement;

    readonly #list: HTMLUListElement;

    #suggestions: Suggestion[] = [];

    #active = -1;

    #timer: ReturnType<typeof setTimeout> | null = null;

    #abort: AbortController | null = null;

    /** The words in the language of the system; made anew when it changes */
    #t: Translate = getTranslate('en');

    #error = '';

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = CSS;
        const box = document.createElement('div');
        box.className = 'box';
        this.#input = document.createElement('input');
        this.#input.type = 'text';
        this.#input.autocomplete = 'off';
        this.#input.spellcheck = false;
        this.#status = document.createElement('div');
        this.#status.className = 'status';
        this.#list = document.createElement('ul');
        this.#list.hidden = true;
        this.#list.setAttribute('role', 'listbox');
        box.append(this.#input, this.#list, this.#status);
        shadow.append(style, box);

        this.#input.addEventListener('input', () => this.#onInput());
        this.#input.addEventListener('keydown', event => this.#onKey(event));
        this.#input.addEventListener('blur', () => {
            // after a click on a suggestion, which comes with `mousedown`
            setTimeout(() => this.#close(true), 150);
        });
        this.#list.addEventListener('mousedown', event => {
            event.preventDefault();
            const item = (event.target as HTMLElement).closest('li');
            const index = item ? Number(item.dataset.index) : -1;
            if (index >= 0 && this.#suggestions[index]) {
                this.#choose(this.#suggestions[index]);
            }
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        this.#cancel();
    }

    /** True while the user types into the field */
    #isEditing(): boolean {
        return this.shadowRoot?.activeElement === this.#input;
    }

    #cancel(): void {
        if (this.#timer) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
        this.#abort?.abort();
        this.#abort = null;
    }

    #onInput(): void {
        this.#cancel();
        this.#error = '';
        const query = this.#input.value.trim();
        if (query.length < 3) {
            this.#suggestions = [];
            this.#drawList(false);
            return;
        }
        this.#timer = setTimeout(() => {
            this.#timer = null;
            const abort = new AbortController();
            this.#abort = abort;
            searchAddress(query, this.settings.token, this.systemLang, abort.signal)
                .then(suggestions => {
                    if (abort.signal.aborted) {
                        return;
                    }
                    this.#suggestions = suggestions;
                    this.#active = suggestions.length ? 0 : -1;
                    this.#drawList(true);
                })
                .catch((error: unknown) => {
                    if (abort.signal.aborted) {
                        return;
                    }
                    this.#suggestions = [];
                    this.#error = this.#t('search_failed', (error as Error)?.message || String(error));
                    this.#drawList(false);
                    this.render();
                });
        }, 350);
    }

    #onKey(event: KeyboardEvent): void {
        // the keys of the field are the field's: JSON-Config shall not take Enter for itself
        event.stopPropagation();
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (this.#suggestions.length) {
                event.preventDefault();
                const step = event.key === 'ArrowDown' ? 1 : -1;
                this.#active = (this.#active + step + this.#suggestions.length) % this.#suggestions.length;
                this.#drawList(true);
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const suggestion = this.#suggestions[this.#active];
            if (suggestion) {
                this.#choose(suggestion);
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.#close(true);
        }
    }

    #choose(suggestion: Suggestion): void {
        this.#cancel();
        this.#input.value = suggestion.address;
        this.#suggestions = [];
        this.#drawList(false);
        this.changeValue({
            address: suggestion.address,
            geometry: { type: 'Point', coordinates: [suggestion.coordinates[0], suggestion.coordinates[1]] },
        });
        this.render();
    }

    /**
     * Closes the list
     *
     * @param restore true: the field shows the stored address again
     */
    #close(restore: boolean): void {
        this.#cancel();
        this.#suggestions = [];
        this.#drawList(false);
        if (restore && !this.#isEditing()) {
            this.#input.value = this.value?.address || '';
            this.#error = '';
            this.render();
        }
    }

    /**
     * Draws the suggestions
     *
     * @param open false: the list closes
     */
    #drawList(open: boolean): void {
        if (!open) {
            this.#list.hidden = true;
            this.#list.replaceChildren();
            return;
        }
        this.#list.innerHTML = this.#suggestions.length
            ? this.#suggestions
                  .map(
                      (suggestion, index) =>
                          `<li role="option" data-index="${index}" class="${index === this.#active ? 'active' : ''}">${escapeHtml(suggestion.address)}</li>`,
                  )
                  .join('')
            : `<li class="info">${escapeHtml(this.#t('no_address_found'))}</li>`;
        this.#list.hidden = false;
    }

    protected render(): void {
        this.#t = getTranslate(this.systemLang);
        this.#input.placeholder = this.#t('search_address');
        const value = this.value;
        if (!this.#isEditing()) {
            this.#input.value = value?.address || '';
        }
        const coordinates = value?.geometry?.coordinates;
        if (this.#error) {
            this.#status.className = 'status error';
            this.#status.textContent = this.#error;
        } else if (Array.isArray(coordinates) && coordinates.length === 2) {
            this.#status.className = 'status';
            this.#status.textContent = `${Number(coordinates[1]).toFixed(5)}, ${Number(coordinates[0]).toFixed(5)}`;
        } else {
            this.#status.className = 'status missing';
            this.#status.textContent = this.#t('pick_suggestion');
        }
    }
}

defineWebComponent(COMPONENTS.address.tag, RadarTrapAddress);
