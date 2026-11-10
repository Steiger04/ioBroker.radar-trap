/**
 * The setting `visTraps` of the widgets: which kinds of trap of which category are shown, one checkbox per kind
 * and one per category for all its kinds.
 */

import type React from 'react';
import { Box, Checkbox, FormControlLabel } from '@mui/material';

import { CATEGORIES, TYPE_TEXTS, VIS_TRAPS_DEFAULT, camelCase, type Category, type VisTraps as VisTrapsValue } from '@radar-trap/traps';

import { tText } from '../i18n';

interface Kind {
    key: string;
    text: string;
}

/**
 * The kinds of a category: several atudo types share a name (`1` and `7` are both a speed camera), and share
 * the checkbox too
 *
 * @param category the category
 */
function getKinds(category: Category): Kind[] {
    const kinds = new Map<string, Kind>();
    for (const type of category.types) {
        const text = TYPE_TEXTS[type];
        if (text && !kinds.has(camelCase(text))) {
            kinds.set(camelCase(text), { key: camelCase(text), text });
        }
    }
    return [...kinds.values()].sort((a, b) => tText(a.text).localeCompare(tText(b.text)));
}

interface VisTrapsProps {
    fieldName: string;
    fieldValue: VisTrapsValue | undefined;
    onDataChange: (data: Record<string, VisTrapsValue>) => void;
}

export function VisTraps({ fieldName, fieldValue, onDataChange }: VisTrapsProps): React.JSX.Element {
    const value: VisTrapsValue = fieldValue && typeof fieldValue === 'object' ? fieldValue : VIS_TRAPS_DEFAULT;

    const categories = [...CATEGORIES].sort((a, b) => tText(a.text).localeCompare(tText(b.text)));

    return (
        <Box>
            {categories.map(category => {
                const kinds = getKinds(category);
                // a kind the saved setting does not know yet is shown, as on the map
                const own = { ...VIS_TRAPS_DEFAULT[category.key], ...value[category.key] };
                const states = kinds.map(kind => own[kind.key] !== false);
                const all = states.every(Boolean);
                const some = states.some(Boolean);

                const change = (changes: Record<string, boolean>): void =>
                    onDataChange({
                        [fieldName]: {
                            ...value,
                            [category.key]: { ...own, ...changes },
                        },
                    });

                return (
                    <Box key={category.key}>
                        <FormControlLabel
                            sx={{ '& .MuiTypography-root': { p: 0, fontSize: 16, fontWeight: 'bold' } }}
                            label={tText(category.text)}
                            control={
                                <Checkbox
                                    sx={{ pl: '11px' }}
                                    checked={all}
                                    indeterminate={some && !all}
                                    onChange={event =>
                                        change(Object.fromEntries(kinds.map(kind => [kind.key, event.target.checked])))
                                    }
                                />
                            }
                        />
                        {kinds.length > 1 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
                                {kinds.map((kind, i) => (
                                    <FormControlLabel
                                        key={kind.key}
                                        sx={{ '& .MuiTypography-root': { p: 0, fontSize: 13 } }}
                                        label={tText(kind.text)}
                                        control={
                                            <Checkbox
                                                checked={states[i]}
                                                onChange={event => change({ [kind.key]: event.target.checked })}
                                            />
                                        }
                                    />
                                ))}
                            </Box>
                        ) : null}
                    </Box>
                );
            })}
        </Box>
    );
}
