/**
 * What the element draws: the number of traps with their categories, or the list of them. Plain React without MUI;
 * the look comes from `styles.ts` and the theme of the host.
 */
import type { JSX } from 'react';

import {
    formatAddress,
    formatVmax,
    type CategoryIcon,
    type TrapFeature,
    type TrapGroup,
} from '@radar-trap/traps';

import type { Translate } from './i18n';

/** The URL of the image of a category */
export type IconUrl = (icon: CategoryIcon) => string;

export function Hint({ text }: { text: string }): JSX.Element {
    return (
        <div className="box hint">
            <span>{text}</span>
        </div>
    );
}

/** The icon of a category in the colour of the text: the images are shapes, used as a mask */
function TrapIcon({ icon, iconUrl, large }: { icon: CategoryIcon; iconUrl: IconUrl; large?: boolean }): JSX.Element {
    const url = `url("${iconUrl(icon)}")`;
    return (
        <span
            className={large ? 'icon large' : 'icon'}
            style={{ maskImage: url, WebkitMaskImage: url }}
            aria-hidden="true"
        />
    );
}

function RefreshIcon(): JSX.Element {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
        >
            <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z" />
        </svg>
    );
}

function TrapItem({ trap, t }: { trap: TrapFeature; t: Translate }): JSX.Element {
    const info = trap.properties;
    const vmax = formatVmax(info.vmax);
    const address = formatAddress(info);
    const details = [
        vmax ? (vmax === 'unknown' ? t('unknown_speed') : vmax) : '',
        info.length ? `${info.length} km` : '',
        info.delay ? `+${info.delay} min.` : '',
        info.reason || '',
    ].filter(Boolean);

    return (
        <li className="trap">
            <div className="trap-title">
                <span className="ellipsis">{t.text(info.typeText) || t.text(info.typeDesc)}</span>
                {info.status === 'NEW' ? <span className="badge">{t('new')}</span> : null}
            </div>
            {details.length ? <div className="trap-details">{details.join(' · ')}</div> : null}
            {address ? <div className="trap-address">{address}</div> : null}
        </li>
    );
}

/** The traps by category */
export function TrapList({ groups, t, iconUrl }: { groups: TrapGroup[]; t: Translate; iconUrl: IconUrl }): JSX.Element {
    if (!groups.length) {
        return <div className="empty">{t('no_traps')}</div>;
    }
    return (
        <div className="groups">
            {groups.map(group => (
                <section
                    key={group.category.key}
                    className="group"
                >
                    <div className="group-title">
                        <TrapIcon
                            icon={group.category.icon}
                            iconUrl={iconUrl}
                        />
                        <span className="ellipsis grow">{t.text(group.category.text)}</span>
                        <span className="count">{group.traps.length}</span>
                    </div>
                    <ul>
                        {group.traps.map((trap, i) => (
                            <TrapItem
                                key={trap.properties.id || i}
                                trap={trap}
                                t={t}
                            />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}

export interface TrapViewProps {
    content: 'auto' | 'summary' | 'list';
    name: string;
    groups: TrapGroup[];
    lastUpdated: string;
    editMode: boolean;
    t: Translate;
    iconUrl: IconUrl;
    /** Opens the list in a dialog */
    onOpen: () => void;
    /** Lets the adapter search again; missing if the settings hide the button */
    onRefresh?: () => void;
}

/** The number of traps and their categories; a click opens the list */
function Summary({ name, groups, t, iconUrl, editMode, onOpen }: TrapViewProps): JSX.Element {
    const total = groups.reduce((sum, group) => sum + group.traps.length, 0);
    const newCount = groups.reduce((sum, group) => sum + group.newCount, 0);
    return (
        <button
            type="button"
            className={total ? 'summary active' : 'summary'}
            disabled={editMode}
            onClick={onOpen}
            title={name}
        >
            <TrapIcon
                icon="speed-camera"
                iconUrl={iconUrl}
                large
            />
            <span className="summary-count">
                <span className="total">{total}</span>
                {newCount ? <span className="secondary">{t('new_count', newCount)}</span> : null}
            </span>
            <span className="categories">
                {groups.map(group => (
                    <span
                        key={group.category.key}
                        className="category"
                        title={t.text(group.category.text)}
                    >
                        <TrapIcon
                            icon={group.category.icon}
                            iconUrl={iconUrl}
                        />
                        {group.traps.length}
                    </span>
                ))}
            </span>
            <span className="name ellipsis">{name}</span>
        </button>
    );
}

/** The name, the numbers and the list */
function ListBox({ name, groups, lastUpdated, editMode, t, iconUrl, onRefresh }: TrapViewProps): JSX.Element {
    const total = groups.reduce((sum, group) => sum + group.traps.length, 0);
    const newCount = groups.reduce((sum, group) => sum + group.newCount, 0);
    return (
        <div className="list">
            <div className="header">
                <TrapIcon
                    icon="speed-camera"
                    iconUrl={iconUrl}
                />
                <div className="grow">
                    <div className="name ellipsis">{name}</div>
                    <div className="secondary ellipsis">
                        {[
                            `${total} ${t('traps')}`,
                            newCount ? t('new_count', newCount) : '',
                            lastUpdated ? t('last_update', lastUpdated) : '',
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </div>
                </div>
                {onRefresh ? (
                    <button
                        type="button"
                        className="icon-button"
                        title={t('refresh')}
                        disabled={editMode}
                        onClick={onRefresh}
                    >
                        <RefreshIcon />
                    </button>
                ) : null}
            </div>
            <div className="scroll">
                <TrapList
                    groups={groups}
                    t={t}
                    iconUrl={iconUrl}
                />
            </div>
        </div>
    );
}

/**
 * The element: in `auto` both are drawn and the box decides which shows (`styles.ts`), so that the element follows
 * a resize without drawing again
 */
export function TrapView(props: TrapViewProps): JSX.Element {
    return (
        <div className={`box content-${props.content}`}>
            {props.content !== 'list' ? <Summary {...props} /> : null}
            {props.content !== 'summary' ? <ListBox {...props} /> : null}
        </div>
    );
}
