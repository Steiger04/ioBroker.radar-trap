/** What the popup of the map shows about a trap or a closed road */

import type React from 'react';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';

import { formatVmax, type TrapInfo } from '@radar-trap/traps';

import { t, tText } from '../i18n';

/** `typeText` of a closed road: it is not a trap of atudo, the map draws it from the polylines */
export const TRAFFIC_CLOSURE = 'traffic closure';

function Line({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
    return (
        <Typography variant="subtitle2">
            <b>{`${t(label)}: `}</b>
            {children}
        </Typography>
    );
}

export function TrapInfoPopup({ info }: { info: TrapInfo }): React.JSX.Element {
    const vmax = formatVmax(info.vmax);
    const isClosure = info.typeText === TRAFFIC_CLOSURE;

    return (
        <Box
            sx={{
                margin: '-10px -10px -15px -10px',
                p: 0,
                minWidth: 200,
                maxWidth: 300,
            }}
        >
            <Card
                variant="elevation"
                elevation={6}
            >
                <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 1, borderBottom: 2 }}>
                    {info.typeDesc || isClosure ? (
                        <Typography
                            align="center"
                            variant="h6"
                        >
                            {isClosure ? t('traffic_closure') : tText(info.typeDesc)}
                        </Typography>
                    ) : null}
                </Box>
                <CardContent sx={{ mt: -1, mb: -2 }}>
                    {info.typeText && !isClosure ? <Line label="kind">{tText(info.typeText)}</Line> : null}
                    {vmax ? <Line label="maximum_speed">{vmax === 'unknown' ? t('unknown_speed') : vmax}</Line> : null}
                    {info.reason ? <Line label="reason">{info.reason}</Line> : null}
                    {info.length ? <Line label="jam_length">{`${info.length} km`}</Line> : null}
                    {info.duration ? <Line label="duration">{`${info.duration} min.`}</Line> : null}
                    {info.delay ? <Line label="delay">{`${info.delay} min.`}</Line> : null}
                    {info.createDate ? <Line label="reported">{info.createDate}</Line> : null}
                    {info.confirmDate ? <Line label="confirmed">{info.confirmDate}</Line> : null}
                    {!isClosure ? <Divider /> : null}
                    {info.state ? <Line label="state">{info.state}</Line> : null}
                    {info.street ? <Line label="street">{info.street}</Line> : null}
                    {info.zipCode && info.city ? (
                        <Line label="city">
                            {info.zipCode} {info.city}
                        </Line>
                    ) : null}
                    {info.cityDistrict ? <Line label="city_district">{info.cityDistrict}</Line> : null}
                </CardContent>
            </Card>
        </Box>
    );
}
