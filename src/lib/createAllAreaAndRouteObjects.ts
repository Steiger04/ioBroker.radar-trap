import type * as utils from "@iobroker/adapter-core";
import type { Application } from "../server/declarations";
import { createAreaObjects } from "./createAreaObjects";
import { createRouteObjects } from "./createRouteObjects";

const createAllAreaAndRouteObjects = async (that: utils.AdapterInstance, feathers: Application): Promise<void> => {
	// console.log("createAllAreaAndRouteObjects");

	const routes = await feathers.service("routes").find({
		query: {
			$limit: -1,
			$select: [
				"_id",
				"description",
				/* "src",
				"dst", */
				"activeProfile",
				/* "cron", */
				"directions",
			],
		},
	});

	const areas = await feathers.service("areas").find({
		query: {
			$limit: -1,
			$select: [
				"_id",
				"description",
				"areaTraps",
				/* "src",
				"dst", */
				/* "cron", */
			],
		},
	});

	for (const routeData of routes as radarTrap.Routes) {
		await createRouteObjects(that, routeData);
	}

	for (const areaData of areas as radarTrap.Areas) {
		await createAreaObjects(that, areaData);
	}
};

export { createAllAreaAndRouteObjects };
