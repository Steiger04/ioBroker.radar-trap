// Created with @iobroker/create-adapter v2.1.1

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";
import { EMPTY, mergeMap, of, Subject } from "rxjs";
import { areaServiceListener } from "./lib/areaServiceListener";
import { createAllAreaAndRouteObjects } from "./lib/createAllAreaAndRouteObjects";
import { routeServiceListener } from "./lib/routeServiceListener";
import { Scheduler } from "./lib/Scheduler";
import { feathers, provideFeathers, server } from "./server/createFeathers";
import logger from "./server/logger";

console.log("### MAIN.TS ###");

class RadarTrap2 extends utils.Adapter {
	private pause$!: Subject<string>;
	private resume$!: Subject<string>;
	private run$!: Subject<string>;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		// console.log("inside RadarTrap2 Constructor()");
		super({
			...options,
			name: "radar-trap",
		});

		this.subscribeStreams();

		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		this.on("unload", this.onUnload.bind(this));

		// This.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration
	 */
	private async onReady(): Promise<void> {
		// console.log("inside main() -> onReady()");
		process.on("unhandledRejection", (reason, p) => logger.error("Unhandled Rejection at: Promise ", p, reason));

		// Muss in onReady direkt gesetzt werden
		process.env.MAPBOX_TOKEN = (this.config as ioBroker.INative).settings.mbxAccessToken;

		// Process.env['HOST'] = 'localhost';
		// process.env['PORT'] = String(this.config.settings.feathersPort);

		provideFeathers(this, (this.config as ioBroker.INative).settings.feathersPort);

		await createAllAreaAndRouteObjects(this, feathers).catch((ex) => console.log(ex));

		Scheduler.addThat(this);
		await Scheduler.scheduleAll().catch((ex) => console.log(ex));

		routeServiceListener(this, feathers);
		areaServiceListener(this, feathers);

		await this.subscribeStatesAsync("*.pause").catch((ex) => console.log(ex));
		await this.subscribeStatesAsync("*.resume").catch((ex) => console.log(ex));
		await this.subscribeStatesAsync("*.run").catch((ex) => console.log(ex));
	}

	/**
	 * Is called if a subscribed state changes
	 */

	private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
		if (!state || state.ack) {
			return;
		}

		this.setStateAsync(id, { val: state.val, ack: true }).catch((ex) => console.log(ex));

		const DCS = this.idToDCS(id)!;

		switch (DCS.state) {
			case "pause":
				this.pause$.next(DCS.device);
				break;
			case "resume":
				this.resume$.next(DCS.device);
				break;
			case "run":
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
				mergeMap((device) => {
					const _schedule = Scheduler.getSchedule(device);

					return _schedule?.cronJobIsRunning ? of(device) : EMPTY;
				}),
			)
			.subscribe(Scheduler.pause);

		this.resume$
			.pipe(
				mergeMap((device) => {
					const _schedule = Scheduler.getSchedule(device);
					const notResume = _schedule?.cronJobIsRunning || _schedule?.status === "loading";

					return notResume ? EMPTY : of(device);
				}),
			)
			.subscribe(Scheduler.resume);

		this.run$
			.pipe(
				mergeMap((device) => {
					const _schedule = Scheduler.getSchedule(device);

					return _schedule?.status === "loading" ? EMPTY : of(device);
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

			this.unsubscribeStatesAsync("*").catch((ex) => console.log(ex));

			server.close();
			this.setStateAsync("info.connection", false, true).catch((ex) => console.log(ex));

			callback();
		} catch {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	// private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
	//     if (obj) {
	//         // The object was changed
	//         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	//     } else {
	//         // The object was deleted
	//         this.log.info(`object ${id} deleted`);
	//     }
	// }

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  */
	// private onMessage(obj: ioBroker.Message): void {
	//     if (typeof obj === 'object' && obj.message) {
	//         if (obj.command === 'send') {
	//             // e.g. send email or pushover or whatever
	//             this.log.info('send command');

	//             // Send response in callback if required
	//             if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	//         }
	//     }
	// }
}

if (require.main !== module) {
	// Export the constructor in compact mode

	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new RadarTrap2(options);
} else {
	// Otherwise start the instance directly
	(() => new RadarTrap2())();
}
