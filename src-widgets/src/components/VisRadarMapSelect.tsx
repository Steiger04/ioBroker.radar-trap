/**
 * The selection of an area or a route in the settings of a widget. The instance lists them (`getSourceOptions`), so
 * the list needs no connection to the feathers server - only the widgets that draw a map do.
 */

import type React from 'react';
import { useEffect, useState } from 'react';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import { I18n, type Connection } from '@iobroker/gui-components';

import { t } from '../i18n';

interface Item {
    /** The ID of the route or area */
    value: string;
    /** Its name and whether it is a route or an area */
    label: string;
}

interface VisRadarMapSelectProps {
    /** Which sources to offer */
    type: 'area' | 'route' | 'all';
    socket: Connection;
    fieldName: string;
    fieldValue: string;
    onDataChange: (data: Record<string, string>) => void;
}

export function VisRadarMapSelect({
    type,
    socket,
    fieldName,
    fieldValue,
    onDataChange,
}: VisRadarMapSelectProps): React.JSX.Element {
    const [items, setItems] = useState<Item[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async (): Promise<void> => {
            const instances = await socket.getAdapterInstances('radar-trap');
            const instance = instances?.find(obj => obj.common?.enabled)?._id.replace('system.adapter.', '');
            const alive = instance ? await socket.getState(`system.adapter.${instance}.alive`) : null;
            if (!instance || !alive?.val) {
                throw new Error(t('instance_not_started'));
            }
            const list = (await socket.sendTo(instance, 'getSourceOptions', {
                type,
                value: 'id',
                lang: I18n.getLanguage(),
            })) as Item[] | null;
            if (!cancelled) {
                setItems(Array.isArray(list) ? list : []);
                setError('');
            }
        };

        load().catch((err: unknown) => {
            if (!cancelled) {
                setError(err instanceof Error ? err.message : String(err));
                setItems(null);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [socket, type]);

    if (error) {
        return (
            <Typography
                variant="caption"
                sx={{ color: 'error.main' }}
            >
                {error}
            </Typography>
        );
    }

    // the saved ID stays selectable while the list loads, and if its area or route was deleted
    const known = !fieldValue || !!items?.find(item => item.value === fieldValue);

    return (
        <FormControl
            variant="standard"
            sx={{ width: '100%' }}
        >
            <Select
                sx={{
                    '& .MuiTypography-root': { p: 0, fontSize: 13 },
                    '& .MuiSelect-select': { p: 0 },
                }}
                value={fieldValue || ''}
                onChange={e => onDataChange({ [fieldName]: e.target.value })}
            >
                <MenuItem
                    sx={{ fontStyle: 'italic' }}
                    value=""
                >
                    <Typography variant="subtitle2">---</Typography>
                </MenuItem>
                {!known ? (
                    <MenuItem value={fieldValue}>
                        <Typography variant="subtitle2">{fieldValue}</Typography>
                    </MenuItem>
                ) : null}
                {(items || []).map(item => (
                    <MenuItem
                        key={item.value}
                        value={item.value}
                    >
                        <Typography variant="subtitle2">{item.label}</Typography>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
