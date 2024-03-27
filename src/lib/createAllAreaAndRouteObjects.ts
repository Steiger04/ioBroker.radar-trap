import type { Application } from "../server/declarations";
import { createAreaObjects } from "./createAreaObjects";
import { createRouteObjects } from "./createRouteObjects";

const createAllAreaAndRouteObjects = async (
	that: ioBroker.AdapterInstanceWithI18n,
	feathers: Application,
): Promise<void> => {
	// console.log("createAllAreaAndRouteObjects");

	const routes = await feathers.service("routes").find({
		query: {
			$limit: -1,
			$select: ["_id", "timestamp", "description", "activeProfile", "directions"],
		},
	});

	const areas = await feathers.service("areas").find({
		query: {
			$limit: -1,
			$select: [
				"_id",
				"timestamp",
				"description",
				"areaTraps",
				"areaTrapsEstablished",
				"areaTrapsNew",
				"areaTrapsRejected",
			],
		},
	});

	// console.log("createAllAreaAndRouteObjects: areas", areas);

	for (const routeData of routes as radarTrap.Routes) {
		await createRouteObjects(that, routeData);
	}

	for (const areaData of areas as radarTrap.Areas) {
		await createAreaObjects(that, areaData);
	}
};

export { createAllAreaAndRouteObjects };
