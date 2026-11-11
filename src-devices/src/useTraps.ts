/**
 * The traps of one area or route, from its states: the device object says whether it is an area or a route, the
 * list states hold the traps.
 */

import { useEffect, useState } from 'react';
import type { IStateContext } from '@iobroker/dm-widgets';

import { getDeviceId, getTrapIds, parseTraps, type TrapFeature, type TrapSourceType } from '@radar-trap/traps';

export interface TrapData {
    /** `none`: no device chosen, `not-found`: the device is no area or route of radar-trap */
    status: 'none' | 'loading' | 'not-found' | 'ok';
    /** ID of the device, `radar-trap.0.<id>` */
    device: string | null;
    type: TrapSourceType | null;
    /** Name of the area or route */
    name: string;
    traps: TrapFeature[];
    lastUpdated: ioBroker.StateValue | undefined;
    /** The state that lets the adapter search again */
    runId: string | null;
}

const EMPTY: TrapData = {
    status: 'none',
    device: null,
    type: null,
    name: '',
    traps: [],
    lastUpdated: undefined,
    runId: null,
};

/**
 * The name of an object in the language of the app
 *
 * @param name `common.name`
 * @param lang the language
 */
function getName(name: ioBroker.StringOrTranslated | undefined, lang: ioBroker.Languages): string {
    if (!name) {
        return '';
    }
    if (typeof name === 'string') {
        return name;
    }
    return name[lang] || name.en || Object.values(name)[0] || '';
}

/**
 * Subscribes the traps of an area or a route
 *
 * @param context the state context of the devices app
 * @param setting what the user chose: the device or any object below it
 */
export function useTraps(context: IStateContext, setting: string | undefined): TrapData {
    const device = getDeviceId(setting);
    const [data, setData] = useState<TrapData>(EMPTY);

    useEffect(() => {
        if (!device) {
            setData(EMPTY);
            return;
        }
        setData({ ...EMPTY, status: 'loading', device });

        let cancelled = false;
        const values = new Map<string, ioBroker.StateValue | undefined>();
        const subscribed: { id: string; handler: (id: string, state: ioBroker.State) => void }[] = [];

        const start = async (): Promise<void> => {
            const obj = await context.getObject<ioBroker.DeviceObject>(device);
            if (cancelled) {
                return;
            }
            const type = obj?.native?.type as TrapSourceType | undefined;
            if (type !== 'AREA' && type !== 'ROUTE') {
                setData({ ...EMPTY, status: 'not-found', device });
                return;
            }
            const ids = getTrapIds(device, type);
            const name = getName(obj?.common?.name, context.language);
            let timer: ReturnType<typeof setTimeout> | undefined;

            // the adapter writes all lists one after the other: one update for all of them
            const update = (): void => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    if (!cancelled) {
                        setData({
                            status: 'ok',
                            device,
                            type,
                            name: name || String(values.get(ids.description) ?? ''),
                            traps: parseTraps(ids.lists.map(id => values.get(id))),
                            lastUpdated: values.get(ids.lastUpdated),
                            runId: ids.run,
                        });
                    }
                }, 50);
            };

            for (const id of [...ids.lists, ids.description, ids.lastUpdated]) {
                const handler = (_id: string, state: ioBroker.State): void => {
                    values.set(id, state ? state.val : undefined);
                    update();
                };
                context.getState(id, handler);
                subscribed.push({ id, handler });
            }
            update();
        };

        start().catch(() => !cancelled && setData({ ...EMPTY, status: 'not-found', device }));

        return () => {
            cancelled = true;
            for (const { id, handler } of subscribed) {
                context.removeState(id, handler);
            }
        };
    }, [context, device]);

    return data;
}
