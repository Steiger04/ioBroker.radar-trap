import { createRouteObjects } from "./createRouteObjects";
import { Scheduler } from "./Scheduler";

import type { Application } from "@feathersjs/express";
import type * as utils from "@iobroker/adapter-core";
import type { HookContext } from "../server/app";

const routeServiceListener = (
	that: utils.AdapterInstance,
	feathers: Application,
): void => {
	feathers
		.service("routes")
		.on("status", async (statusWithId: radarTrap.GenericStatusWithId) => {
			Scheduler.setStatus(statusWithId);
		});

	feathers.service("routes").on("removed", async (route: radarTrap.Route) => {
		await that.deleteDeviceAsync(route._id);

		Scheduler.delete(route._id);
	});

	feathers
		.service("routes")
		.on("created", async (route: radarTrap.Route, ctx: HookContext) => {
			if (!ctx.params.patchSourceFromServer) {
				const routeData = {
					_id: route._id,
					src: route.src,
					dst: route.dst,
					activeProfile: route.activeProfile,
					maxTrapDistance: route.maxTrapDistance,
					cron: route.cron,
				};

				Scheduler.schedule(routeData, "ROUTE");
			}

			await createRouteObjects(that, route);
		});
};

export { routeServiceListener };
