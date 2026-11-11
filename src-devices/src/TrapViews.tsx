/**
 * What the tile shows: the number of traps, by category, and the list of them - in the tile or in a dialog.
 *
 * React, MUI and gui-components are those of the devices app (see `hostShared.ts`), so these are plain function
 * components with hooks.
 */

import type React from 'react';
import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { I18n } from '@iobroker/gui-components';

import {
    PREFIX,
    formatAddress,
    formatLastUpdate,
    formatVmax,
    wordKey,
    type CategoryIcon,
    type TrapFeature,
    type TrapGroup,
} from '@radar-trap/traps';

import { CATEGORY_IMAGES } from './icons';

/**
 * A word of the dictionary
 *
 * @param key the key without the prefix
 * @param args replace the `%s` one after the other
 */
export function t(key: string, ...args: (string | number)[]): string {
    return I18n.t(PREFIX + key, ...args.map(String));
}

/**
 * The translation of an English name of a category or a kind of trap
 *
 * @param text the English name
 */
export function tText(text: string | false | undefined | null): string {
    if (!text) {
        return '';
    }
    const key = wordKey(text);
    const translated = I18n.t(key);
    return translated === key ? text : translated;
}

/** The icon of a category in the colour of the text: the images are shapes, used as a mask */
export function TrapIcon({ icon, size }: { icon: CategoryIcon; size: number | string }): React.JSX.Element {
    const url = `url("${CATEGORY_IMAGES[icon]}")`;
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-block',
                flex: '0 0 auto',
                width: size,
                height: size,
                bgcolor: 'currentColor',
                maskImage: url,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: url,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
            }}
        />
    );
}

/** One trap of the list */
function TrapItem({ trap }: { trap: TrapFeature }): React.JSX.Element {
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
        <Box sx={{ py: 0.5, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                    {tText(info.typeText) || tText(info.typeDesc)}
                </Typography>
                {info.status === 'NEW' ? (
                    <Chip
                        label={t('new')}
                        size="small"
                        color="warning"
                        sx={{ height: 16, fontSize: 10, '& .MuiChip-label': { px: 0.75 } }}
                    />
                ) : null}
            </Box>
            {details.length ? (
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ opacity: 0.85 }}
                >
                    {details.join(' · ')}
                </Typography>
            ) : null}
            {address ? (
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ opacity: 0.65 }}
                >
                    {address}
                </Typography>
            ) : null}
        </Box>
    );
}

/** The traps by category */
export function TrapList({ groups, dense }: { groups: TrapGroup[]; dense?: boolean }): React.JSX.Element {
    if (!groups.length) {
        return (
            <Typography
                variant="body2"
                sx={{ opacity: 0.6, py: 1 }}
            >
                {t('no_traps')}
            </Typography>
        );
    }
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: dense ? 0.5 : 1 }}>
            {groups.map(group => (
                <Box key={group.category.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                        <TrapIcon
                            icon={group.category.icon}
                            size={dense ? 18 : 22}
                        />
                        <Typography
                            variant={dense ? 'caption' : 'subtitle2'}
                            sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}
                        >
                            {tText(group.category.text)}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ fontWeight: 700 }}
                        >
                            {group.traps.length}
                        </Typography>
                    </Box>
                    <Box sx={{ pl: dense ? 3.25 : 4 }}>
                        {group.traps.map((trap, i) => (
                            <Box key={trap.properties.id || i}>
                                {i ? <Divider sx={{ opacity: 0.5 }} /> : null}
                                <TrapItem trap={trap} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

/** The number of traps per category, as small icons with a count */
export function CategoryCounts({ groups, max }: { groups: TrapGroup[]; max?: number }): React.JSX.Element {
    const shown = max ? groups.slice(0, max) : groups;
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', minWidth: 0 }}>
            {shown.map(group => (
                <Tooltip
                    key={group.category.key}
                    title={tText(group.category.text)}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <TrapIcon
                            icon={group.category.icon}
                            size={18}
                        />
                        <Typography
                            variant="caption"
                            sx={{ fontWeight: 700 }}
                        >
                            {group.traps.length}
                        </Typography>
                    </Box>
                </Tooltip>
            ))}
            {max && groups.length > max ? <Typography variant="caption">…</Typography> : null}
        </Box>
    );
}

/** The button that lets the adapter search again */
export function RefreshButton({
    onRefresh,
    size,
}: {
    onRefresh: () => Promise<void>;
    size?: 'small' | 'medium';
}): React.JSX.Element {
    const [busy, setBusy] = useState(false);
    return (
        <Tooltip title={t('refresh')}>
            <span>
                <IconButton
                    size={size || 'small'}
                    disabled={busy}
                    onClick={event => {
                        event.stopPropagation();
                        setBusy(true);
                        onRefresh()
                            .catch(() => {})
                            // the search itself takes a while; the button only must not be pressed twice at once
                            .finally(() => setTimeout(() => setBusy(false), 3000));
                    }}
                >
                    <Refresh fontSize="small" />
                </IconButton>
            </span>
        </Tooltip>
    );
}

/** All traps in a dialog */
export function TrapDialog({
    open,
    onClose,
    title,
    lastUpdated,
    groups,
    onRefresh,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    lastUpdated: string;
    groups: TrapGroup[];
    onRefresh?: () => Promise<void>;
}): React.JSX.Element {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            onClick={event => event.stopPropagation()}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Box>
                    {lastUpdated ? (
                        <Typography
                            variant="caption"
                            component="div"
                            sx={{ opacity: 0.7 }}
                        >
                            {t('last_update', lastUpdated)}
                        </Typography>
                    ) : null}
                </Box>
                {onRefresh ? <RefreshButton onRefresh={onRefresh} /> : null}
            </DialogTitle>
            <DialogContent dividers>
                <TrapList groups={groups} />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onClose}
                >
                    {t('close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * The time of the last search for display
 *
 * @param value the value of `lastUpdated`
 */
export function lastUpdateText(value: ioBroker.StateValue | undefined): string {
    return formatLastUpdate(value, I18n.getLanguage());
}
