/**
 * A click on a trap of the info widget moves the map widget of the same area or route to it. The two widgets know
 * nothing of each other, so they meet here: the info widget sets where to jump, every map widget listens.
 *
 * A module of the widget set is loaded once per page, so all widgets of the set share this store.
 */

import { useSyncExternalStore } from 'react';

export interface Jump {
    /** ID of the area or route the trap belongs to */
    jumpId: string;
    /** Longitude and latitude of the trap */
    coordinates: number[];
}

let current: Jump = { jumpId: '', coordinates: [] };
const listeners = new Set<() => void>();

/**
 * Move the map widgets of this area or route to a trap
 *
 * @param jumpId ID of the area or route
 * @param coordinates longitude and latitude of the trap
 */
export function setJump(jumpId: string, coordinates: number[]): void {
    // a new object every time: a second click on the same trap jumps again
    current = { jumpId, coordinates };
    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** Where the map widgets are asked to jump to */
export function useJump(): Jump {
    return useSyncExternalStore(subscribe, () => current);
}
