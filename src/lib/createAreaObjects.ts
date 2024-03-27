import { Feature, Point } from "@turf/turf";
import { createCronJobAsync } from "./createCronJob";

const createAreaObjects = async (that: ioBroker.AdapterInstanceWithI18n, area: radarTrap.Area): Promise<void> => {
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

	// for (const trapType of ["areaTrapsNew", "areaTrapsEstablished", "areaTrapsRejected"]) {
	for (const trapType of ["areaTraps", "areaTrapsEstablished", "areaTrapsNew", "areaTrapsRejected"]) {
		let totalTrapsCount = 0;

		let channelName = "";

		switch (trapType) {
			case "areaTraps":
				channelName = "area-current";
				break;
			case "areaTrapsNew":
				channelName = "area-new";
				break;
			case "areaTrapsRejected":
				channelName = "area-rejected";
				break;
			case "areaTrapsEstablished":
				channelName = "area-established";
				break;
			default:
				break;
		}

		await that.createChannelAsync(`${area._id}`, `${channelName}`, {
			name: "Area",
		});

		for (const [trapName, traps] of Object.entries(
			area[trapType as keyof radarTrap.Area] as Record<string, Feature<Point>[]>,
		)) {
			const newTraps = traps.map((trap) => ({
				type: trap.type,
				geometry: trap.geometry,
				properties: { ...trap.properties?.trapInfo },
			}));

			totalTrapsCount += newTraps.length;

			await that
				.createStateAsync(`${area._id}`, `${channelName}`, `${trapName}`, {
					name: that.I18n[trapName],
					defAck: true,
					read: true,
					write: false,
					type: "array",
					role: "list",
				})
				.then(() =>
					that.setStateAsync(`${area._id}.${channelName}.${trapName}`, JSON.stringify(newTraps), true),
				);

			await that
				.createStateAsync(`${area._id}`, `${channelName}`, `${trapName}Count`, {
					name: `${that.I18n["count"]}: ${that.I18n[trapName]}`,
					defAck: true,
					read: true,
					write: false,
					type: "number",
					role: "value",
				})
				.then(() => that.setStateAsync(`${area._id}.${channelName}.${trapName}Count`, newTraps.length, true));
		}

		await that
			.createStateAsync(`${area._id}`, "area-infos", `${trapType}Count`, {
				name: `${that.I18n["count"]}: ${channelName}`,
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
