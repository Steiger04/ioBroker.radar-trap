/**
 * The styles of the shadow root, and of the dialog the element opens (it has a shadow root of its own).
 *
 * The element fills the box of the host, has a transparent background and inherits `color` and `font`. The rest
 * comes from the theme of the host, which the base class sets as CSS variables: `--iob-primary`,
 * `--iob-text-secondary`, `--iob-divider`, `--iob-warning`, `--iob-border-radius`.
 *
 * `.mount` is a size container (`traps`): with `content-auto`, a box below 220 x 170 px shows the number of traps,
 * a larger one the list. In the dialog the height is not given, so `.mount.dialog` grows with the list.
 */
export const STYLES = `
:host {
    display: block;
    width: 100%;
    height: 100%;
}
* {
    box-sizing: border-box;
}
.mount {
    width: 100%;
    height: 100%;
    container-type: size;
    container-name: traps;
    font-family: var(--iob-font-family, inherit);
}
.mount.dialog {
    height: auto;
    container-type: inline-size;
}
.box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
.hint {
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8px;
    font-size: 0.85em;
    color: var(--iob-text-secondary);
}
.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
}
.grow {
    flex: 1;
    min-width: 0;
}
.secondary {
    font-size: 0.8em;
    color: var(--iob-text-secondary);
}
.icon {
    display: inline-block;
    flex: none;
    width: 20px;
    height: 20px;
    background-color: currentColor;
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
}
.icon.large {
    width: max(24px, 14cqmin);
    height: max(24px, 14cqmin);
}
button {
    font: inherit;
    color: inherit;
    margin: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}
button:focus-visible {
    outline: 2px solid var(--iob-primary);
    outline-offset: 1px;
}
button:disabled {
    cursor: default;
}
svg {
    display: block;
    fill: currentColor;
}

/* the number of traps */
.summary {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: 4px;
    padding: 8px;
    border: none;
    background: transparent;
    text-align: left;
    border-radius: var(--iob-border-radius, 4px);
}
.summary:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 6%, transparent);
}
.summary.active > .icon {
    color: var(--iob-warning);
}
.summary-count {
    display: flex;
    align-items: baseline;
    gap: 6px;
}
.total {
    font-size: 1.8em;
    font-weight: 700;
    line-height: 1;
}
.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;
    font-size: 0.8em;
    font-weight: 700;
}
.category {
    display: inline-flex;
    align-items: center;
    gap: 2px;
}
.category .icon {
    width: 16px;
    height: 16px;
}
.summary .name {
    max-width: 100%;
    font-size: 0.85em;
    font-weight: 600;
}

/* the list */
.list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 8px;
}
.header {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--iob-divider);
}
.header .name {
    font-weight: 700;
}
.icon-button {
    flex: none;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
}
.icon-button:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 8%, transparent);
}
.scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding-top: 4px;
}
.mount.dialog .list {
    padding: 0;
}
.mount.dialog .scroll {
    overflow: visible;
}
.empty {
    padding: 8px 0;
    font-size: 0.9em;
    color: var(--iob-text-secondary);
}
.groups {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85em;
    font-weight: 700;
    color: var(--iob-primary);
}
.group-title .icon {
    width: 18px;
    height: 18px;
}
ul {
    list-style: none;
    margin: 0;
    padding: 0 0 0 26px;
}
.trap {
    padding: 4px 0;
}
.trap + .trap {
    border-top: 1px solid var(--iob-divider);
}
.trap-title {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    font-size: 0.9em;
    font-weight: 600;
}
.trap-details,
.trap-address {
    font-size: 0.8em;
    color: var(--iob-text-secondary);
}
.badge {
    flex: none;
    padding: 0 6px;
    border-radius: 8px;
    font-size: 0.7em;
    line-height: 16px;
    background: var(--iob-warning);
    color: #fff;
}

/* what fits: the list in a large box, the number in a small one */
.content-auto > .summary {
    display: none;
}
@container traps (max-width: 219px) or (max-height: 169px) {
    .content-auto > .summary {
        display: flex;
    }
    .content-auto > .list {
        display: none;
    }
}
`;
