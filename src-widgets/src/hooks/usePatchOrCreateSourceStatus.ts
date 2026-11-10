/** Whether the adapter is searching the traps of this area or route right now (`status` event of the services) */

import { useCallback, useEffect, useState } from 'react';

import type { FeathersClient } from '../feathers';

export interface SourceStatusEvent {
    _id: string | null;
    status: 'idle' | 'loading' | 'success' | 'error' | string;
}

export function usePatchOrCreateSourceStatus(id: string | null, feathers: FeathersClient | null): SourceStatusEvent {
    const [status, setStatus] = useState<SourceStatusEvent>({ _id: null, status: 'idle' });

    const onStatusListener = useCallback(
        (data: SourceStatusEvent) => {
            if (id === data._id) {
                setStatus(data);
            }
        },
        [id],
    );

    useEffect(() => {
        if (!feathers) {
            return;
        }
        feathers.service('areas').on('status', onStatusListener);
        feathers.service('routes').on('status', onStatusListener);

        return () => {
            feathers.service('areas').removeListener('status', onStatusListener);
            feathers.service('routes').removeListener('status', onStatusListener);
        };
    }, [feathers, onStatusListener]);

    return status;
}
