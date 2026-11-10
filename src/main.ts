// Created with @iobroker/create-adapter v2.1.1

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import { EMPTY, mergeMap, of, Subject } from 'rxjs';
import { areaServiceListener } from './lib/areaServiceListener';
import { migrateDatabase, syncConfig } from './lib/configSync';
import { createAllAreaAndRouteObjects } from './lib/createAllAreaAndRouteObjects';
import { routeServiceListener } from './lib/routeServiceListener';
import { Scheduler } from './lib/Scheduler';
import { feathers, provideFeathers, server } from './server/createFeathers';
import logger from './server/logger';
import translations from './lib/i18n';

/** The message of `getSourceOptions` */
interface SourceOptionsRequest {
    type?: 'route' | 'area' | 'all';
    value?: 'device' | 'id';
    lang?: string;
}

class RadarTrap2 extends utils.Adapter {
    private locale: string;
    public I18n: Record<string, string>;
    private pause$!: Subject<string>;
    private resume$!: Subject<string>;
    private run$!: Subject<string>;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'radar-trap',
        });

        this.locale = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
        this.I18n = JSON.parse(JSON.stringify(translations))[this.locale];

        this.subscribeStreams();

        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.on('message', this.onMessage.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration
     */
    private async onReady(): Promise<void> {
        process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason));

        // Muss in onReady direkt gesetzt werden
        process.env.MAPBOX_TOKEN = (this.config as ioBroker.INative).settings.mbxAccessToken;

        // Process.env['HOST'] = 'localhost';
        // process.env['PORT'] = String(this.config.settings.feathersPort);

        provideFeathers(this, (this.config as ioBroker.INative).settings.feathersPort);

        // the routes and areas of the database of 2.2.x go into the configuration once; writing it restarts the instance
        const migrated = await migrateDatabase(this as ioBroker.AdapterInstanceWithI18n, feathers).catch(ex => {
            this.log.error(`Cannot take the routes and areas into the configuration: ${(ex as Error).message}`);
            return false;
        });
        if (migrated) {
            return;
        }

        await syncConfig(this as ioBroker.AdapterInstanceWithI18n, feathers).catch(ex =>
            this.log.error(`Cannot compute the routes and areas of the configuration: ${(ex as Error).message}`),
        );

        await createAllAreaAndRouteObjects(this as ioBroker.AdapterInstanceWithI18n, feathers).catch(ex =>
            console.log(ex),
        );

        Scheduler.addThat(this);
        await Scheduler.scheduleAll().catch(ex => console.log(ex));

        routeServiceListener(this, feathers);
        areaServiceListener(this, feathers);

        await this.subscribeStatesAsync('*.pause').catch(ex => console.log(ex));
        await this.subscribeStatesAsync('*.resume').catch(ex => console.log(ex));
        await this.subscribeStatesAsync('*.run').catch(ex => console.log(ex));
    }

    /**
     * Is called if a subscribed state changes
     */

    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (!state || state.ack) {
            return;
        }

        this.setStateAsync(id, { val: state.val, ack: true }).catch(ex => console.log(ex));

        const DCS = this.idToDCS(id)!;

        switch (DCS.state) {
            case 'pause':
                this.pause$.next(DCS.device);
                break;
            case 'resume':
                this.resume$.next(DCS.device);
                break;
            case 'run':
                this.run$.next(DCS.device);
                break;
            default:
                break;
        }
    }

    private subscribeStreams(): void {
        this.pause$ = new Subject<string>();
        this.resume$ = new Subject<string>();
        this.run$ = new Subject<string>();

        this.pause$
            .pipe(
                mergeMap(device => {
                    const _schedule = Scheduler.getSchedule(device);

                    return _schedule?.cronJobIsRunning ? of(device) : EMPTY;
                }),
            )
            .subscribe(Scheduler.pause);

        this.resume$
            .pipe(
                mergeMap(device => {
                    const _schedule = Scheduler.getSchedule(device);
                    const notResume = _schedule?.cronJobIsRunning || _schedule?.status === 'loading';

                    return notResume ? EMPTY : of(device);
                }),
            )
            .subscribe(Scheduler.resume);

        this.run$
            .pipe(
                mergeMap(device => {
                    const _schedule = Scheduler.getSchedule(device);

                    return _schedule?.status === 'loading' ? EMPTY : of(device);
                }),
            )
            .subscribe(Scheduler.run);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            Scheduler.deleteAll();

            this.unsubscribeStatesAsync('*').catch(ex => console.log(ex));

            server.close();
            this.setStateAsync('info.connection', false, true).catch(ex => console.log(ex));

            callback();
        } catch {
            callback();
        }
    }

    /**
     * Answers the maps (`<iob-radar-trap-map>`) and the settings of the tile and the widgets:
     * - `getSources`: the computed routes and areas, `{ sources: [{ id, type, name }] }`
     * - `getSource` with `{ id }`: what the map draws of one of them
     * - `getSourceOptions` with `{ type?, value?, lang? }`: the routes and areas as options of a `selectSendTo`,
     *   `[{ value, label }]` - an array even on error, the select iterates it
     */
    private async onMessage(obj: ioBroker.Message): Promise<void> {
        if (typeof obj !== 'object' || !obj.callback) {
            return;
        }

        if (obj.command === 'getSourceOptions') {
            const options = await this.getSourceOptions(obj.message as SourceOptionsRequest | null).catch(
                (ex: Error) => {
                    this.log.warn(`getSourceOptions: ${ex.message}`);
                    return [];
                },
            );
            this.sendTo(obj.from, obj.command, options, obj.callback);
            return;
        }

        let answer: Record<string, unknown>;
        try {
            if (obj.command === 'getSources') {
                answer = { sources: await this.getSources() };
            } else if (obj.command === 'getSource') {
                const id = (obj.message as { id?: string } | undefined)?.id;
                answer = id ? { source: await this.getSource(id) } : { error: 'no id' };
            } else {
                answer = { error: `unknown command ${obj.command}` };
            }
        } catch (ex) {
            answer = { error: (ex as Error).message };
        }

        this.sendTo(obj.from, obj.command, answer, obj.callback);
    }

    /** The computed routes and areas, by name */
    private async getSources(): Promise<{ id: string; type: 'ROUTE' | 'AREA'; name: string }[]> {
        const routes = (await feathers.service('routes').find({
            query: { $limit: -1, $select: ['_id', 'description'] },
        })) as radarTrap.Routes;
        const areas = (await feathers.service('areas').find({
            query: { $limit: -1, $select: ['_id', 'description'] },
        })) as radarTrap.Areas;

        return [
            ...routes.map(route => ({ id: route._id, type: 'ROUTE' as const, name: route.description || route._id })),
            ...areas.map(area => ({ id: area._id, type: 'AREA' as const, name: area.description || area._id })),
        ].sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * The routes and areas as options of a select
     *
     * @param request `type`: only routes or only areas; `value`: `device` (default) gives the object id of the
     *   device, `radar-trap.0.<id>`, `id` the bare id; `lang`: the language of the labels, else that of the system
     */
    private async getSourceOptions(request: SourceOptionsRequest | null): Promise<{ value: string; label: string }[]> {
        const type = request?.type || 'all';
        const lang = request?.lang || (await this.getSystemLanguage());
        const words = (translations as Record<string, Record<string, string>>)[lang] || translations.en;

        return (await this.getSources())
            .filter(source => type === 'all' || source.type.toLowerCase() === type)
            .map(source => ({
                value: request?.value === 'id' ? source.id : `${this.namespace}.${source.id}`,
                label: `${source.name} (${source.type === 'ROUTE' ? words.route : words.area})`,
            }));
    }

    /** The language of the system, `en` if it has none */
    private async getSystemLanguage(): Promise<string> {
        const config = await this.getForeignObjectAsync('system.config');
        return (config?.common as { language?: string } | undefined)?.language || 'en';
    }

    /**
     * What the map draws of a route or an area: the line of the route or the polygon of the area, the traps and the
     * closed or congested sections of road
     *
     * @param id the ID of the route or the area
     */
    private async getSource(id: string): Promise<Record<string, unknown> | null> {
        const status = Scheduler.getSchedule(id)?.status || 'idle';
        const [route] = (await feathers.service('routes').find({
            query: { _id: id, $limit: -1, $select: ['_id'] },
        })) as radarTrap.Routes;
        if (route) {
            // `get` runs the hook that makes the feature collections of the directions and the traps
            const withTraps = await feathers.service('routes').get(id, {
                query: { $select: ['description', 'timestamp', 'directions'] },
            });
            return {
                id,
                type: 'ROUTE',
                name: withTraps.description || id,
                timestamp: withTraps.timestamp,
                status,
                directions: withTraps.directionsFeatureCollection || null,
                traps: withTraps.trapsFeatureCollection || null,
                polyLines: withTraps.polyLinesFeatureCollection || null,
            };
        }

        const [area] = (await feathers.service('areas').find({
            query: { _id: id, $limit: -1, $select: ['_id'] },
        })) as radarTrap.Areas;
        if (area) {
            const withTraps = await feathers.service('areas').get(id, {
                query: {
                    $select: ['description', 'timestamp', 'areaPolygons', 'areaTraps', 'polyLinesFeatureCollection'],
                },
            });
            return {
                id,
                type: 'AREA',
                name: withTraps.description || id,
                timestamp: withTraps.timestamp,
                status,
                areaPolygons: withTraps.areaPolygons || null,
                traps: withTraps.trapsFeatureCollection || null,
                polyLines: withTraps.polyLinesFeatureCollection || null,
            };
        }

        return null;
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode

    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new RadarTrap2(options);
} else {
    // Otherwise start the instance directly
    (() => new RadarTrap2())();
}
