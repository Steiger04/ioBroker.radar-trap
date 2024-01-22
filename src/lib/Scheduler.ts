import { Cron } from "croner";
import { feathers } from "../server/createFeathers";

import type * as utils from "@iobroker/adapter-core";

type DataType = "ROUTE" | "AREA";

class Scheduler {
	private routeStatus: radarTrap.GenericStatus;
	private readonly dataType: DataType;
	private readonly routeData: Partial<radarTrap.Area & radarTrap.Route>;
	private readonly cronJob: Cron;
	private interval: NodeJS.Timeout | null;

	static #scheduleMap = new Map<string, Scheduler>();
	static #areasService = feathers.service("areas");
	static #routesService = feathers.service("routes");
	static #adapter: utils.AdapterInstance;

	constructor(routeData: Partial<radarTrap.Route>, type: DataType) {
		// console.log("inside Scheduler Constructor()");
		const { _id: id, cron: pattern } = routeData;

		this.routeStatus = "idle";

		this.dataType = type;
		this.routeData = routeData;

		this.cronJob = new Cron(pattern!.trim(), () => {
			if (process.env.NODE_ENV === "development")
				console.log(`Cron-Job with id ${id} and pattern ${pattern!.trim()} scheduled`);
			Scheduler.run(id!);
		});

		this.interval = setInterval(() => {
			Scheduler.#adapter.setStateAsync(`${id}.cron-job.timer`, this.next, true).catch((ex) => console.log(ex));
		}, 1_000);

		if (process.env.NODE_ENV === "development")
			console.log(`Cron-Job with id ${id} and pattern ${pattern!.trim()} created.`);
	}

	get next(): number | null {
		const next = this.cronJob.msToNext();

		if (next !== null) {
			return Math.floor(next / 1_000);
		}

		return null;
	}

	get cronJobIsRunning(): boolean {
		return this.cronJob.isRunning();
	}

	get status(): radarTrap.GenericStatus {
		return this.routeStatus;
	}

	private set status(status: radarTrap.GenericStatus) {
		this.routeStatus = status;
	}

	static setStatus(statusWithId: radarTrap.GenericStatusWithId): void {
		const { _id, status } = statusWithId;
		const _schedule = Scheduler.getSchedule(_id!);

		if (Boolean(!_id) || Boolean(!_schedule)) {
			return;
		}

		_schedule!.status = status;
	}

	static addThat(adapter: utils.AdapterInstance): void {
		Scheduler.#adapter = adapter;
	}

	static getSchedule(id: string): Scheduler | undefined {
		return Scheduler.#scheduleMap.get(id);
	}

	static schedule(routeData: Partial<radarTrap.Route>, type: DataType): void {
		const { _id: id } = routeData;

		Scheduler.delete(id!);

		Scheduler.#scheduleMap.set(id!, new this(routeData, type));

		console.log("process.env.NODE_ENV", process.env.NODE_ENV);

		if (process.env.NODE_ENV === "development") console.log(`Scheduled with id: ${id}`);
	}

	static async scheduleAll(): Promise<void> {
		const routes = await Scheduler.#routesService.find({
			query: {
				$limit: -1,
				$select: ["_id", "src", "dst", "activeProfile", "maxTrapDistance", "cron"],
			},
		});

		const areas = await Scheduler.#areasService.find({
			query: {
				$limit: -1,
				$select: ["_id", "cron", "areaPolygons"],
			},
		});

		for (const routeData of routes as radarTrap.Routes) {
			Scheduler.schedule(routeData, "ROUTE");
		}

		for (const areaData of areas as radarTrap.Areas) {
			Scheduler.schedule(areaData, "AREA");
		}
	}

	static delete(id: string): void {
		if (!Scheduler.#scheduleMap.has(id)) {
			return;
		}

		const _schedule = Scheduler.#scheduleMap.get(id)!;

		if (_schedule.interval !== null) {
			clearInterval(_schedule.interval);
		}

		_schedule.cronJob.stop();
		Scheduler.#scheduleMap.delete(id);
	}

	static deleteAll(): void {
		for (const _schedule of Scheduler.#scheduleMap.values()) {
			if (_schedule.interval !== null) {
				clearInterval(_schedule.interval);
			}

			_schedule.cronJob.stop();
		}

		Scheduler.#scheduleMap.clear();
	}

	static async run(id: string): Promise<void> {
		const _schedule = Scheduler.#scheduleMap.get(id)!;

		if (_schedule.status === "loading") {
			return;
		}

		Scheduler.pause(id);

		try {
			if (_schedule.dataType === "AREA") {
				// console.log("AREA");
				await Scheduler.#areasService.create(_schedule.routeData, {
					patchSourceFromServer: true,
				});
			} else if (_schedule.dataType === "ROUTE") {
				await Scheduler.#routesService.create(_schedule.routeData, {
					patchSourceFromServer: true,
				});
			}
		} catch (ex) {
			console.log(ex);
		}

		Scheduler.resume(id);
	}

	static pause(id: string): void {
		if (!Scheduler.#scheduleMap.has(id)) return;

		const _schedule = Scheduler.#scheduleMap.get(id)!;

		if (!_schedule.cronJob.isRunning() || _schedule.interval === null) {
			return;
		}

		clearInterval(_schedule.interval);
		_schedule.interval = null;
		_schedule.cronJob.pause();

		Scheduler.#adapter.setStateAsync(`${id}.cron-job.timer`, 0, true).catch((ex) => console.log(ex));
	}

	static resume(id: string): void {
		if (!Scheduler.#scheduleMap.has(id)) return;

		const _schedule = Scheduler.#scheduleMap.get(id)!;

		if (_schedule.cronJob.isRunning()) {
			return;
		}

		if (_schedule.interval === null) {
			_schedule.cronJob.resume();

			_schedule.interval = setInterval(() => {
				Scheduler.#adapter
					.setStateAsync(`${id}.cron-job.timer`, _schedule.next, true)
					.catch((ex) => console.log(ex));
			}, 1_000);
		}
	}
}

export { Scheduler };
