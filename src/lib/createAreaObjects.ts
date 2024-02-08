import { Feature, Point } from "@turf/turf";
import { createCronJobAsync } from "./createCronJob";

import type * as utils from "@iobroker/adapter-core";

const createAreaObjects = async (that: utils.AdapterInstance, area: radarTrap.Area): Promise<void> => {
	await that.setObjectAsync(area._id, {
		type: "device",
		common: { name: area.description! },
		native: { type: "AREA" },
	});

	await createCronJobAsync(that, area._id);

	await that.createChannelAsync(`${area._id}`, "area-infos", {
		name: "Area Infos",
	});

	await that
		.createStateAsync(`${area._id}`, "area-infos", "lastUpdated", {
			name: "Last Updated",
			defAck: true,
			read: true,
			write: false,
			type: "string",
			role: "text",
		})
		.then(() => that.setStateAsync(`${area._id}.area-infos.lastUpdated`, `${area.timestamp}`, true));

	await that
		.createStateAsync(`${area._id}`, "area-infos", "description", {
			name: "Description",
			defAck: true,
			read: true,
			write: false,
			type: "string",
			role: "text",
		})
		.then(() => that.setStateAsync(`${area._id}.area-infos.description`, `${area.description}`, true));

	await that.createChannelAsync(`${area._id}`, "area", {
		name: "Area",
	});

	// for (const trapType of ["areaTrapsNew", "areaTrapsEstablished", "areaTrapsRejected"]) {
	for (const trapType of ["areaTraps", "areaTrapsNew", "areaTrapsRejected"]) {
		let totalTrapsCount = 0;

		for (const [trapName, traps] of Object.entries(
			area[trapType as keyof radarTrap.Area]! as Record<string, Feature<Point>[]>,
		)) {
			const newTraps = traps.map((trap) => ({
				type: trap.type,
				geometry: trap.geometry,
				properties: { ...trap.properties?.trapInfo },
			}));

			totalTrapsCount += newTraps.length;

			await that
				.createStateAsync(`${area._id}`, `area`, `${trapName}`, {
					name: `${trapName}`,
					defAck: true,
					read: true,
					write: false,
					type: "array",
					role: "list",
				})
				.then(() => that.setStateAsync(`${area._id}.area.${trapName}`, JSON.stringify(newTraps), true));

			await that
				.createStateAsync(`${area._id}`, `area`, `${trapName}Count`, {
					name: `${trapName} Count`,
					defAck: true,
					read: true,
					write: false,
					type: "number",
					role: "value",
				})
				.then(() => that.setStateAsync(`${area._id}.area.${trapName}Count`, newTraps.length, true));
		}

		await that
			.createStateAsync(`${area._id}`, "area-infos", `${trapType}Count`, {
				name: "totalTraps Count",
				defAck: true,
				read: true,
				write: false,
				type: "number",
				role: "value",
			})
			.then(() => that.setStateAsync(`${area._id}.area-infos.${trapType}Count`, totalTrapsCount, true));
	}
};

export { createAreaObjects };
