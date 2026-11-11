/**
 * The map, loaded when a map widget is drawn for the first time.
 *
 * vis-2 loads every widget of every set when it starts; mapbox alone is a megabyte, which views without a map of
 * radar-trap need not wait for.
 */

import type React from 'react';
import { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';

import type { RadarTrapMapProps } from './RadarTrapMap';

const RadarTrapMap = lazy(() => import('./RadarTrapMap').then(module => ({ default: module.RadarTrapMap })));

export function LazyRadarTrapMap(props: RadarTrapMapProps): React.JSX.Element {
    return (
        <Suspense
            fallback={
                <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }}>
                    <CircularProgress />
                </Box>
            }
        >
            <RadarTrapMap {...props} />
        </Suspense>
    );
}
