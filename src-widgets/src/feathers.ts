/**
 * The connection to the feathers server of the adapter.
 *
 * The map widgets need what only the feathers server has: the polygon of an area, the line of a route and the
 * closed and congested sections of road. The server listens on its own port (`native.settings.feathersPort`,
 * 3040 by default) on the host of the page, and speaks socket.io 2 - so the client is the feathers 4 client with
 * socket.io-client 2, exactly as the admin of the adapter uses it.
 *
 * One client per URL for all widgets of the page: they all watch the same services.
 */

import feathers from '@feathersjs/client/core';
import socketio from '@feathersjs/client/socketio';
import io from 'socket.io-client';

/** The settings of the adapter instance the widgets need */
export interface RadarTrapSettings {
    feathersPort: number;
    mbxAccessToken: string;
    httpsEnabled?: boolean;
    domains?: string;
}

/** What the widgets call of a feathers service */
export interface FeathersService {
    find(params?: { query?: Record<string, unknown> }): Promise<{ data: { _id: string; description?: string }[] }>;
    get(id: string, params?: { query?: Record<string, unknown> }): Promise<any>;
    on(event: string, listener: (data: any) => void): void;
    removeListener(event: string, listener: (data: any) => void): void;
}

export interface FeathersClient {
    service(name: 'areas' | 'routes'): FeathersService;
    /** The socket.io socket */
    io: { connect(): void; disconnect(): void; connected?: boolean };
}

const clients = new Map<string, FeathersClient>();

/**
 * The URL of the feathers server: the host of the page, the port of the settings
 *
 * @param settings the settings of the adapter instance
 */
export function getFeathersUrl(settings: RadarTrapSettings): string {
    const page = new URL(document.URL);
    return `${page.protocol}//${page.hostname}:${settings.feathersPort}`;
}

/**
 * The client for the feathers server of these settings, created on the first call
 *
 * @param settings the settings of the adapter instance
 */
export function getFeathersClient(settings: RadarTrapSettings): FeathersClient {
    const url = getFeathersUrl(settings);
    let client = clients.get(url);
    if (!client) {
        const socket = io(url, { forceNew: true });
        const app = feathers();
        // Searching the traps of a long route takes minutes: the default of 5 seconds would fail every refresh
        app.configure(socketio(socket, { timeout: 600_000 }));
        client = app as unknown as FeathersClient;
        clients.set(url, client);
    }
    return client;
}
