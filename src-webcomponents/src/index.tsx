/**
 * The traps of a route or an area of ioBroker.radar-trap as a web component: `<iob-radar-trap-traps>`.
 *
 * One module for every host - vis-2, devices, Aura, admin (`@iobroker/web-components`). Its manifest is a file of
 * its own (`radar-trap-traps.json`, written by the build from `manifest.ts`), so a host loads this module only when
 * it shows the element. The host sets `socket` and `settings`, and if it has them `theme`, `editMode` and `dialogs`.
 *
 * The element reads the states the devices tile reads (`src-shared/src/traps.ts`): the device object tells an area
 * from a route, the list states below it hold the traps. It writes one state only, `<id>.cron-job.run`, when the
 * refresh button is pressed. In a small box it shows the number of traps; a click opens the list in a dialog of the
 * host.
 *
 * React is not in the module: it comes from `lib/esm/react-19.js` beside `adapter/`, see `vite.config.ts`.
 */
import type { JSX } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { defineWebComponent, getThemeCssVariables, IobWebComponent } from '@iobroker/web-components/element';

import {
    formatLastUpdate,
    getDeviceId,
    getTrapIds,
    groupTraps,
    parseTraps,
    type CategoryIcon,
    type TrapGroup,
    type TrapSourceType,
} from '@radar-trap/traps';

import { getContent, ICON_FOLDER, TAG, type TrapSettings } from './constants';
import { getTranslate, type Translate } from './i18n';
import { STYLES } from './styles';
import { Hint, TrapList, TrapView } from './views';

/**
 * Where the module was loaded from: the icons lie next to it. In a variable, so that the build does not take
 * `new URL(..., import.meta.url)` for an asset of its own and inline it
 */
const MODULE_URL = import.meta.url;

/**
 * The image of a category, next to the module
 *
 * @param icon the icon of the category
 */
function iconUrl(icon: CategoryIcon): string {
    return new URL(`${ICON_FOLDER}/icon-${icon}-sdf.png`, MODULE_URL).href;
}

/** What the element and its dialog show now */
interface View {
    name: string;
    groups: TrapGroup[];
    lastUpdated: string;
    t: Translate;
}

class RadarTrapTraps extends IobWebComponent<TrapSettings> {
    readonly #mount: HTMLDivElement;

    #root: Root | null = null;

    /** Draws the open dialog again with the current traps; null while none is open */
    #drawDialog: (() => void) | null = null;

    #view: View | null = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = STYLES;
        this.#mount = document.createElement('div');
        this.#mount.className = 'mount';
        shadow.append(style, this.#mount);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        // a host that only moves the element connects it again in the same task: keep React then
        queueMicrotask(() => {
            if (!this.isConnected) {
                this.#root?.unmount();
                this.#root = null;
            }
        });
    }

    /** The device of the settings */
    #device(settings: TrapSettings): string | null {
        return getDeviceId(settings.device);
    }

    /** Whether the device is an area or a route; null while its object has not arrived, or if it is neither */
    #type(device: string): TrapSourceType | null {
        const type = this.objects[device]?.native?.type as string | undefined;
        return type === 'AREA' || type === 'ROUTE' ? type : null;
    }

    protected override getObjectIds(settings: TrapSettings): string[] {
        const device = this.#device(settings);
        return device ? [device] : [];
    }

    protected override getStateIds(settings: TrapSettings): string[] {
        const device = this.#device(settings);
        const type = device ? this.#type(device) : null;
        if (!device || !type) {
            return [];
        }
        const ids = getTrapIds(device, type);
        return [...ids.lists, ids.description, ids.lastUpdated];
    }

    protected override render(): void {
        this.#root ||= createRoot(this.#mount);
        this.#mount.className = this.#mountClass();
        this.#root.render(this.#draw());
        // an open dialog follows the states too
        this.#drawDialog?.();
    }

    #mountClass(): string {
        return `mount${this.theme.type === 'dark' ? ' dark' : ''}`;
    }

    #draw(): JSX.Element {
        const settings = this.settings;
        const t = getTranslate(this.systemLang);
        const device = this.#device(settings);
        this.#view = null;

        if (!device) {
            return <Hint text={t('no_device')} />;
        }
        const object = this.objects[device];
        if (object === undefined || !this.socket) {
            // nothing yet rather than a hint for a moment
            return <div className="box" />;
        }
        const type = this.#type(device);
        if (!type) {
            return <Hint text={t('not_found')} />;
        }

        const ids = getTrapIds(device, type);
        const value = (id: string): ioBroker.StateValue | undefined => this.states[id]?.val;
        const traps = parseTraps(ids.lists.map(value));
        const groups = groupTraps(traps, {
            onlyNew: !!settings.onlyNew,
            showHotspots: !!settings.showHotspots,
            showArchive: !!settings.showArchive,
        });
        const name = settings.title || this.text(object?.common?.name) || String(value(ids.description) ?? '') || t('info');
        const view: View = { name, groups, lastUpdated: formatLastUpdate(value(ids.lastUpdated), this.systemLang), t };
        this.#view = view;

        return (
            <TrapView
                content={getContent(settings.content)}
                name={view.name}
                groups={view.groups}
                lastUpdated={view.lastUpdated}
                editMode={this.editMode}
                t={t}
                iconUrl={iconUrl}
                onOpen={() => void this.#openList()}
                onRefresh={settings.showRefresh !== false ? () => this.#refresh(ids.run) : undefined}
            />
        );
    }

    /**
     * Lets the adapter search the traps again
     *
     * @param id the state `<id>.cron-job.run`
     */
    #refresh(id: string): void {
        // `setState` of the base class writes nothing in edit mode
        this.setState(id, true).catch((error: unknown) =>
            console.error(`<${TAG}>: cannot write ${id}: ${String(error)}`),
        );
    }

    /** The list in a dialog of the host */
    async #openList(): Promise<void> {
        const view = this.#view;
        if (this.editMode || this.#drawDialog || !view) {
            return;
        }

        // The host moves the element into its own dialog: it brings its styles and the theme of the host along
        const element = document.createElement('div');
        const shadow = element.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = STYLES;
        const mount = document.createElement('div');
        shadow.append(style, mount);
        const root = createRoot(mount);

        // drawn again with every drawing of the element, so the dialog follows the states while it is open
        const draw = (): void => {
            for (const [name, value] of Object.entries(getThemeCssVariables(this.theme))) {
                element.style.setProperty(name, value);
            }
            mount.className = `${this.#mountClass()} dialog`;
            const current = this.#view;
            root.render(
                current ? (
                    <div className="list">
                        {current.lastUpdated ? (
                            <div className="secondary">{current.t('last_update', current.lastUpdated)}</div>
                        ) : null}
                        <div className="scroll">
                            <TrapList
                                groups={current.groups}
                                t={current.t}
                                iconUrl={iconUrl}
                            />
                        </div>
                    </div>
                ) : (
                    <Hint text={getTranslate(this.systemLang)('no_device')} />
                ),
            );
        };
        this.#drawDialog = draw;
        draw();

        try {
            await this.openDialog({ title: view.name, element, width: 480 });
        } finally {
            this.#drawDialog = null;
            root.unmount();
        }
    }
}

defineWebComponent(TAG, RadarTrapTraps);
