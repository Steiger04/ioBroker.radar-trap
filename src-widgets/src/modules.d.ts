/* Declarations of the CommonJS packages without types; no import here, or these would be augmentations */

declare module '@feathersjs/client/core' {
    /** The feathers 4 application factory, from the browser bundle of the client */
    const feathers: () => { configure(plugin: unknown): void };
    export default feathers;
}

declare module '@feathersjs/client/socketio' {
    /** The socket.io transport of feathers 4, from the browser bundle of the client */
    const socketio: (socket: unknown, options?: { timeout?: number }) => unknown;
    export default socketio;
}

declare module 'socket.io-client' {
    /** socket.io-client 2, as far as the widgets use it */
    const io: (url: string, options?: { forceNew?: boolean }) => unknown;
    export default io;
}
