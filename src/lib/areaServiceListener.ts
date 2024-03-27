import { createAreaObjects } from "./createAreaObjects";
import { Scheduler } from "./Scheduler";

import type { Application } from "@feathersjs/express";
import type { HookContext } from "../server/app";

const areaServiceListener = (that: ioBroker.AdapterInstanceWithI18n, feathers: Application): void => {
	feathers.service("areas").on("status", async (statusWithId: radarTrap.GenericStatusWithId) => {
		Scheduler.setStatus(statusWithId);
	});

	feathers.service("areas").on("removed", async (area: radarTrap.Area) => {
		await that.deleteDeviceAsync(area._id);

		Scheduler.delete(area._id);
	});

	feathers.service("areas").on("created", async (area: radarTrap.Area, ctx: HookContext) => {
		if (!ctx.params.patchSourceFromServer) {
			const areaData = {
				_id: area._id,
				cron: area.cron,
				areaPolygons: area.areaPolygons,
			};

			Scheduler.schedule(areaData, "AREA");
		}

		await createAreaObjects(that, area);
	});
};

export { areaServiceListener };
