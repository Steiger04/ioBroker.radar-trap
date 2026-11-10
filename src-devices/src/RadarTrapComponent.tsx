/**
 * The traps of a route or an area as a tile of the devices app.
 *
 * On a 1x1 or a 2x½ tile there is room for the number of traps and the categories they belong to; a click opens
 * the list in a dialog. A 2x1 or 2x2 tile carries the list itself. The tile is lit while there are traps.
 *
 * The tile reads the states of the area or route the adapter writes (`<id>.area-current.*`,
 * `<id>.direction-0-route-current.*`): it needs neither the feathers server nor a mapbox token, unlike the map
 * widgets of vis-2.
 *
 * ## Split in two
 *
 * The class is what the devices app requires: a `WidgetGeneric` subclass that draws the frame in the app's own style
 * and answers for its size. What is inside the frame is {@link TileBody}, a function component built on hooks.
 */

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import type { Theme } from '@mui/material';
import WidgetGeneric, {
    getTileStyles,
    type CustomWidgetPlugin,
    type IStateContext,
    type WidgetGenericProps,
    type WidgetGenericState,
} from '@iobroker/dm-widgets';
import type { ConfigItemPanel, ConfigItemTabs } from '@iobroker/dm-utils';

import { groupTraps } from '@radar-trap/traps';

import { CategoryCounts, RefreshButton, TrapDialog, TrapIcon, TrapList, lastUpdateText, t } from './TrapViews';
import { useTraps } from './useTraps';

type TileSize = '1x1' | '2x0.5' | '2x1' | '2x2';
type TileContent = 'auto' | 'summary' | 'list';

export interface RadarTrapTileSettings extends CustomWidgetPlugin {
    /** The instance of radar-trap that lists the routes and areas, `radar-trap.0` */
    instance?: string;
    /** The device of the area or route, `radar-trap.0.<id>` */
    device?: string;
    content?: TileContent;
    onlyNew?: boolean;
    showHotspots?: boolean;
    showArchive?: boolean;
    showRefresh?: boolean;
}

interface RadarTrapComponentState extends WidgetGenericState {
    /** Whether there are traps: the tile is lit then */
    hasTraps: boolean;
}

/** Width to height of each tile size, so the frame keeps the grid's proportions */
const ASPECT: Record<TileSize, string> = {
    '1x1': '1',
    '2x0.5': '4',
    '2x1': '2',
    '2x2': '1',
};

/**
 * The padding of each size, as the tiles of the devices app have it. The star and the drag handle (top left) and the
 * settings button (top right) lie over the tile: the list starts below them, a 1x1 tile keeps its icon below them.
 */
const TILE_PADDING: Record<TileSize, string> = {
    '1x1': 'max(16px, 10cqi)',
    '2x0.5': '6px max(16px, 5cqi)',
    '2x1': 'max(32px, 9cqi) max(16px, 5cqi) max(12px, 4cqi)',
    '2x2': 'max(32px, 6cqi) max(16px, 5cqi) max(12px, 4cqi)',
};

/** Orange: a trap is a warning, not an alarm */
const ACCENT = '#ff9800';

/** The 2x2 frame style. Present on the app's real base class, absent from the compile-time stub */
type HugeStyle = (theme: Theme) => React.CSSProperties;

/**
 * Only the two larger tiles have room for the list; `auto` follows that
 *
 * @param content what the settings ask for
 * @param size the size the devices app is rendering
 */
function resolveContent(content: TileContent | undefined, size: TileSize): 'summary' | 'list' {
    if (content === 'summary' || content === 'list') {
        return content;
    }
    return size === '2x1' || size === '2x2' ? 'list' : 'summary';
}

export class RadarTrapComponent extends WidgetGeneric<RadarTrapComponentState, RadarTrapTileSettings> {
    public constructor(props: WidgetGenericProps<RadarTrapTileSettings>) {
        super(props);
        this.state = { ...this.state, hasTraps: false };
    }

    public static override getConfigSchema(): { name: string; schema: ConfigItemPanel | ConfigItemTabs } {
        return {
            name: 'RadarTrap',
            schema: {
                type: 'panel',
                items: {
                    // Replaces the app's own size field, which offers no 2x2: the list needs the room
                    size: {
                        type: 'select',
                        label: 'radar_trap_size',
                        options: [
                            { value: '1x1', label: '1×1' },
                            { value: '2x1', label: '2×1' },
                            { value: '2x0.5', label: '2×½' },
                            { value: '2x2', label: '2×2' },
                        ],
                        // the app renders `size || '1x1'`: a default other than 1x1 would show a size the tile does
                        // not have until the user clicks it
                        default: '1x1',
                        format: 'radio',
                        horizontal: true,
                        noTranslation: true,
                    },
                    instance: {
                        type: 'instance',
                        label: 'radar_trap_instance',
                        adapter: 'radar-trap',
                        default: 'radar-trap.0',
                        sm: 12,
                    },
                    // A drop-down of what the instance computes, labelled in the language of the system. The value
                    // stays the device id, as the objectId field of earlier versions stored it. Without a running
                    // instance the field takes the id as text.
                    device: {
                        type: 'selectSendTo',
                        label: 'radar_trap_device',
                        help: 'radar_trap_source_help',
                        instance: '${data.instance || "radar-trap.0"}',
                        command: 'getSourceOptions',
                        jsonData: '{"value": "device"}',
                        alsoDependsOn: ['instance'],
                        sm: 12,
                    },
                    content: {
                        type: 'select',
                        label: 'radar_trap_content',
                        help: 'radar_trap_content_help',
                        options: [
                            { value: 'auto', label: 'radar_trap_content_auto' },
                            { value: 'summary', label: 'radar_trap_content_summary' },
                            { value: 'list', label: 'radar_trap_content_list' },
                        ],
                        default: 'auto',
                        sm: 12,
                    },
                    onlyNew: {
                        type: 'checkbox',
                        label: 'radar_trap_only_new_traps',
                        default: false,
                        sm: 12,
                    },
                    showHotspots: {
                        type: 'checkbox',
                        label: 'radar_trap_show_hotspots',
                        default: false,
                        sm: 12,
                    },
                    showArchive: {
                        type: 'checkbox',
                        label: 'radar_trap_show_archive',
                        default: false,
                        sm: 12,
                    },
                    showRefresh: {
                        type: 'checkbox',
                        label: 'radar_trap_show_refresh',
                        default: true,
                        sm: 12,
                    },
                },
            },
        };
    }

    protected override isTileActive(): boolean {
        return this.state.hasTraps;
    }

    protected override getAccentColor(): string | undefined {
        return super.getAccentColor() || ACCENT;
    }

    private readonly onHasTrapsChange = (hasTraps: boolean): void => {
        if (hasTraps !== this.state.hasTraps) {
            this.setState({ hasTraps });
        }
    };

    private frameStyle(size: TileSize, theme: Theme): React.CSSProperties {
        if (size === '2x2') {
            const huge = (WidgetGeneric as unknown as { getStyleHuge?: HugeStyle }).getStyleHuge;
            return huge ? huge(theme) : WidgetGeneric.getStyleWideTall(theme);
        }
        if (size === '2x1') {
            return WidgetGeneric.getStyleWideTall(theme);
        }
        if (size === '2x0.5') {
            return WidgetGeneric.getStyleWide(theme);
        }
        return WidgetGeneric.getStyleCompact(theme);
    }

    private renderTile(size: TileSize): React.JSX.Element {
        const accent = this.getAccentColor();
        const indicators = this.renderIndicators(this.renderSettingsButton());

        return (
            <Box
                id={String(this.props.widget.id)}
                className={this.getWidgetClass()}
                sx={theme => this.frameStyle(size, theme)}
            >
                <Box
                    sx={theme => ({
                        position: 'relative',
                        boxSizing: 'border-box',
                        width: '100%',
                        aspectRatio: ASPECT[size],
                        overflow: 'hidden',
                        ...(getTileStyles(theme, this.state.hasTraps, accent) as object),
                        padding: TILE_PADDING[size],
                    })}
                >
                    {/* Indicators and the settings button must not open the dialog underneath */}
                    <div
                        onClick={event => event.stopPropagation()}
                        style={{ display: 'contents' }}
                    >
                        {indicators}
                    </div>
                    <TileBody
                        context={this.props.stateContext}
                        settings={this.props.settings}
                        title={this.props.settings.name || ''}
                        fallbackTitle={this.state.name || ''}
                        size={size}
                        onHasTrapsChange={this.onHasTrapsChange}
                    />
                </Box>
            </Box>
        );
    }

    public override renderCompact(): React.JSX.Element {
        return this.renderTile('1x1');
    }

    public override renderWide(): React.JSX.Element {
        return this.renderTile('2x0.5');
    }

    public override renderWideTall(): React.JSX.Element {
        return this.renderTile('2x1');
    }

    /**
     * The 2x2 tile.
     *
     * Not declared on the compile-time stub of the base class, so no `override` - but the devices app calls it on
     * its real base class for this size, which is why the method has to exist.
     */
    public renderHuge(): React.JSX.Element {
        return this.renderTile('2x2');
    }
}

interface TileBodyProps {
    context: IStateContext;
    settings: RadarTrapTileSettings;
    /** The name the user gave the tile */
    title: string;
    /** The name of the widget in the devices app, if the area or route has none */
    fallbackTitle: string;
    size: TileSize;
    onHasTrapsChange: (hasTraps: boolean) => void;
}

function Hint({ text }: { text: string }): React.JSX.Element {
    return (
        <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', textAlign: 'center' }}>
            <Typography
                variant="caption"
                sx={{ opacity: 0.7 }}
            >
                {text}
            </Typography>
        </Box>
    );
}

function TileBody({ context, settings, title, fallbackTitle, size, onHasTrapsChange }: TileBodyProps): React.JSX.Element {
    const data = useTraps(context, settings.device);
    const [open, setOpen] = useState(false);

    const groups = useMemo(
        () =>
            groupTraps(data.traps, {
                onlyNew: settings.onlyNew,
                showHotspots: settings.showHotspots,
                showArchive: settings.showArchive,
            }),
        [data.traps, settings.onlyNew, settings.showHotspots, settings.showArchive],
    );
    const total = groups.reduce((sum, group) => sum + group.traps.length, 0);
    const newCount = groups.reduce((sum, group) => sum + group.newCount, 0);

    useEffect(() => onHasTrapsChange(total > 0), [total, onHasTrapsChange]);

    if (data.status === 'none') {
        return <Hint text={t('no_device')} />;
    }
    if (data.status === 'not-found') {
        return <Hint text={t('not_found')} />;
    }

    const name = title || data.name || fallbackTitle || t('info');
    const lastUpdated = lastUpdateText(data.lastUpdated);
    const runId = data.runId;
    const onRefresh =
        settings.showRefresh !== false && runId
            ? async (): Promise<void> => {
                  await context.getSocket().setState(runId, { val: true, ack: false });
              }
            : undefined;

    const dialog = (
        <TrapDialog
            open={open}
            onClose={() => setOpen(false)}
            title={name}
            lastUpdated={lastUpdated}
            groups={groups}
            onRefresh={onRefresh}
        />
    );

    if (resolveContent(settings.content, size) === 'list') {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, pr: 3 }}>
                    <TrapIcon
                        icon="speed-camera"
                        size={20}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {name}
                        </Typography>
                        <Typography
                            variant="caption"
                            component="div"
                            sx={{ opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {[
                                `${total} ${t('traps')}`,
                                newCount ? t('new_count', newCount) : '',
                                lastUpdated ? t('last_update', lastUpdated) : '',
                            ]
                                .filter(Boolean)
                                .join(' · ')}
                        </Typography>
                    </Box>
                    {onRefresh ? <RefreshButton onRefresh={onRefresh} /> : null}
                </Box>
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', mt: 0.5 }}>
                    <TrapList
                        groups={groups}
                        dense
                    />
                </Box>
            </Box>
        );
    }

    if (size === '2x0.5') {
        return (
            <>
                <Box
                    onClick={() => setOpen(true)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        height: '100%',
                        minWidth: 0,
                        cursor: 'pointer',
                        pr: 3,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, lineHeight: 1 }}
                    >
                        {total}
                    </Typography>
                    <Box sx={{ minWidth: 0, flex: '0 1 auto' }}>
                        <Typography
                            variant="caption"
                            component="div"
                            sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {name}
                        </Typography>
                        {newCount ? (
                            <Typography
                                variant="caption"
                                component="div"
                                sx={{ opacity: 0.7, lineHeight: 1 }}
                            >
                                {t('new_count', newCount)}
                            </Typography>
                        ) : null}
                    </Box>
                    <Box sx={{ ml: 'auto', minWidth: 0, overflow: 'hidden' }}>
                        <CategoryCounts
                            groups={groups}
                            max={4}
                        />
                    </Box>
                </Box>
                {dialog}
            </>
        );
    }

    // 1x1, or a larger tile asked for the summary
    return (
        <>
            <Box
                onClick={() => setOpen(true)}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    cursor: 'pointer',
                }}
            >
                {/* At the top, below the star and the settings button, in the size of the icons of the other tiles
                    of the app; the text stays at the bottom (`space-between`) */}
                <Box sx={{ display: 'flex', mt: 'max(16px, 9cqi)', minHeight: 0 }}>
                    <TrapIcon
                        icon="speed-camera"
                        size="max(32px, 16cqi)"
                    />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, lineHeight: 1.1 }}
                        >
                            {total}
                        </Typography>
                        {newCount ? (
                            <Typography
                                variant="caption"
                                sx={{ opacity: 0.75 }}
                            >
                                {t('new_count', newCount)}
                            </Typography>
                        ) : null}
                    </Box>
                    {size !== '1x1' ? (
                        <Box sx={{ my: 0.5 }}>
                            <CategoryCounts groups={groups} />
                        </Box>
                    ) : null}
                    <Typography
                        variant="caption"
                        component="div"
                        sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                        {name}
                    </Typography>
                </Box>
            </Box>
            {dialog}
        </>
    );
}

export default RadarTrapComponent;
