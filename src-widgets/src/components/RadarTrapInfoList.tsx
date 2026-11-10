/** The traps of an area or a route as a list by category - the body of the info widget */

import type React from 'react';
import { useMemo } from 'react';
import {
    Avatar,
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Typography,
    darken,
    lighten,
} from '@mui/material';
import type { Feature, Point } from 'geojson';

import { CATEGORIES, TYPE_TEXTS, formatVmax, isTrapVisible, type TrapInfo, type VisTraps } from '@radar-trap/traps';

import type { FeathersClient } from '../feathers';
import { setJump } from '../helpers/jumpStore';
import { CATEGORY_IMAGES } from '../helpers/mapIcons';
import { useRadarTrapSource } from '../hooks/useRadarTrapSource';
import { t, tText } from '../i18n';

/** The settings of the info widget the list reads */
export interface RadarTrapInfoListData {
    nothingInfo?: boolean;
    symbolColor?: string;
    groupHeadline?: boolean;
    trapHeadline?: boolean;
    onlyNewTraps?: boolean;
    visTraps?: VisTraps;
}

interface TrapProperties {
    type_desc?: string;
    type_text?: string;
    status?: string;
    trapInfo?: TrapInfo;
}

type TextStyle = Record<string, string | undefined>;

/**
 * A colour lighter or darker than the background of the widget; nothing if the background is no colour MUI
 * understands
 *
 * @param color the background colour of the widget
 * @param change lighten (> 0) or darken (< 0) by this much
 */
function shade(color: string | undefined, change: number): string | undefined {
    if (!color) {
        return undefined;
    }
    try {
        return change > 0 ? lighten(color, change) : darken(color, -change);
    } catch {
        return undefined;
    }
}

function Line({
    label,
    children,
    variant,
    style,
}: {
    label?: string;
    children: React.ReactNode;
    variant: 'body1' | 'body2';
    style: TextStyle;
}): React.JSX.Element {
    return (
        <ListItemText
            sx={{ my: '2px' }}
            slotProps={{
                primary: {
                    variant,
                    sx: {
                        fontFamily: style['font-family'],
                        fontWeight: style['font-weight'],
                        fontSize: style['font-size'],
                        letterSpacing: style['letter-spacing'],
                        wordSpacing: style['word-spacing'],
                    },
                },
            }}
            primary={
                label ? (
                    <>
                        <b>{`${t(label)}: `}</b>
                        <span>{children}</span>
                    </>
                ) : (
                    <b>{children}</b>
                )
            }
        />
    );
}

export function RadarTrapInfoList({
    feathersClient,
    routeOrAreaId,
    data,
    style,
}: {
    feathersClient: FeathersClient | null;
    routeOrAreaId: string | null;
    data: RadarTrapInfoListData;
    style: TextStyle;
}): React.JSX.Element {
    const {
        source: { trapsFeatureCollection },
        sourceStatus,
    } = useRadarTrapSource(routeOrAreaId, feathersClient);

    const groups = useMemo(() => {
        const traps =
            sourceStatus === 'success'
                ? (trapsFeatureCollection.features as Feature<Point, TrapProperties>[]).filter(trap =>
                      isTrapVisible(
                          trap.properties
                              ? {
                                    typeDesc: trap.properties.type_desc,
                                    typeText: trap.properties.type_text,
                                    status: trap.properties.status,
                                }
                              : null,
                          data.visTraps,
                          data.onlyNewTraps,
                      ),
                  )
                : [];

        return CATEGORIES.map(category => ({
            category,
            traps: traps.filter(trap => trap.properties?.type_desc === category.text),
            // whether the settings show any kind of the category at all
            shown: category.types.some(type =>
                isTrapVisible({ typeDesc: category.text, typeText: TYPE_TEXTS[type], status: 'NEW' }, data.visTraps, false),
            ),
        })).filter(group => group.traps.length || (data.nothingInfo && group.shown));
    }, [trapsFeatureCollection, sourceStatus, data.visTraps, data.onlyNewTraps, data.nothingInfo]);

    const textAlign = style['text-align'] || 'left';
    const left = textAlign === 'left';

    return (
        <Box sx={{ overflow: 'auto', height: '100%', width: '100%', position: 'relative' }}>
            <Box sx={{ position: 'absolute', width: '100%', height: '100%', '& ul': { padding: 0 } }}>
                <List
                    sx={{ listStylePosition: 'inside', bgcolor: shade(style['background-color'], -0.2) }}
                    subheader={<li />}
                >
                    {groups.map(({ category, traps }) => (
                        <li key={category.key}>
                            <ul style={{ listStylePosition: 'inside' }}>
                                <ListSubheader
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-around',
                                        alignItems: 'center',
                                        bgcolor: shade(style['background-color'], 0.15),
                                        color: style.color || undefined,
                                    }}
                                >
                                    <ListItemAvatar
                                        sx={{
                                            flexGrow: left ? 0 : 1,
                                            display: 'flex',
                                            justifyContent: left ? 'left' : 'right',
                                        }}
                                    >
                                        <Avatar
                                            slotProps={{
                                                img: {
                                                    style: {
                                                        // the icons are black shapes: the shadow far below, moved
                                                        // up again, is the shape in the colour of the setting
                                                        filter: `drop-shadow(0px 1000px 0 ${data.symbolColor || 'rgba(100,100,100,0.8)'})`,
                                                        transform: 'translateY(-1000px)',
                                                    },
                                                },
                                            }}
                                            sx={{ width: 32, height: 32 }}
                                            variant="rounded"
                                            src={CATEGORY_IMAGES[category.icon]}
                                        />
                                    </ListItemAvatar>
                                    {data.groupHeadline !== false ? (
                                        <Typography
                                            variant="h6"
                                            component="h6"
                                            sx={{
                                                ml: textAlign === 'right' || textAlign === 'center' ? 2 : -1,
                                                p: 1,
                                                flexGrow: textAlign === 'right' ? 0 : 1,
                                                textAlign: 'left',
                                                fontFamily: style['font-family'],
                                                fontWeight: style['font-weight'],
                                                fontSize: style['font-size'],
                                                lineHeight: style['line-height'],
                                                letterSpacing: style['letter-spacing'],
                                                wordSpacing: style['word-spacing'],
                                            }}
                                        >
                                            <b>{tText(category.text)}</b>
                                        </Typography>
                                    ) : null}
                                </ListSubheader>
                                {traps.map((trap, i) => {
                                    const info = trap.properties.trapInfo || {};
                                    const vmax = formatVmax(info.vmax);
                                    return (
                                        <ListItem
                                            dense
                                            divider
                                            key={info.id || `${category.key}-${i}`}
                                        >
                                            <ListItemButton
                                                onClick={() =>
                                                    routeOrAreaId && setJump(routeOrAreaId, trap.geometry.coordinates)
                                                }
                                                sx={{ display: 'flex', justifyContent: textAlign }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    {data.trapHeadline !== false ? (
                                                        <Line
                                                            variant="body1"
                                                            style={style}
                                                        >
                                                            {tText(info.typeText)}
                                                        </Line>
                                                    ) : null}
                                                    {vmax ? (
                                                        <Line
                                                            label="maximum_speed"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {vmax === 'unknown' ? t('unknown_speed') : vmax}
                                                        </Line>
                                                    ) : null}
                                                    {info.reason ? (
                                                        <Line
                                                            label="reason"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {info.reason}
                                                        </Line>
                                                    ) : null}
                                                    {info.length ? (
                                                        <Line
                                                            label="jam_length"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {`${info.length} km`}
                                                        </Line>
                                                    ) : null}
                                                    {info.duration ? (
                                                        <Line
                                                            label="duration"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {`${info.duration} min.`}
                                                        </Line>
                                                    ) : null}
                                                    {info.delay ? (
                                                        <Line
                                                            label="delay"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {`${info.delay} min.`}
                                                        </Line>
                                                    ) : null}
                                                    {info.createDate ? (
                                                        <Line
                                                            label="reported"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {info.createDate}
                                                        </Line>
                                                    ) : null}
                                                    {info.confirmDate ? (
                                                        <Line
                                                            label="confirmed"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {info.confirmDate}
                                                        </Line>
                                                    ) : null}
                                                    {info.state ? (
                                                        <Line
                                                            label="state"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {info.state}
                                                        </Line>
                                                    ) : null}
                                                    {info.street ? (
                                                        <Line
                                                            label="street"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {info.street}
                                                        </Line>
                                                    ) : null}
                                                    {info.zipCode && info.city ? (
                                                        <Line
                                                            label="city"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {`${info.zipCode} ${info.city}`}
                                                        </Line>
                                                    ) : null}
                                                    {info.cityDistrict ? (
                                                        <Line
                                                            label="city_district"
                                                            variant="body2"
                                                            style={style}
                                                        >
                                                            {info.cityDistrict}
                                                        </Line>
                                                    ) : null}
                                                </Box>
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </ul>
                        </li>
                    ))}
                </List>
            </Box>
        </Box>
    );
}
