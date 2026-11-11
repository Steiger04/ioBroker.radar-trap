/**
 * The adapter for the code that has none at hand - the hooks of feathers and what they call: its log and its timers.
 * Until the adapter sets itself, the messages go to the console and the timers are the global ones.
 */
type AdapterRef = Pick<ioBroker.Adapter, 'log' | 'delay'>;

let adapterRef: AdapterRef | null = null;

/**
 * Sets the adapter the messages and the timers go to
 *
 * @param adapter the adapter; null: the console and the global timers again
 */
export function setAdapter(adapter: AdapterRef | null): void {
    adapterRef = adapter;
}

/** The log of the adapter, the console if there is none */
export function getAdapterLog(): Pick<ioBroker.Logger, 'debug' | 'info' | 'warn' | 'error'> {
    return (
        adapterRef?.log || {
            debug: (message: string) => console.debug(message),
            info: (message: string) => console.info(message),
            warn: (message: string) => console.warn(message),
            error: (message: string) => console.error(message),
        }
    );
}

/**
 * Waits - with the timer of the adapter, which js-controller stops on unload
 *
 * @param ms how long, in milliseconds
 */
export function delay(ms: number): Promise<void> {
    // `delay` came with js-controller 5; older ones get the global timer
    return typeof adapterRef?.delay === 'function'
        ? adapterRef.delay(ms)
        : new Promise(resolve => setTimeout(resolve, ms));
}
