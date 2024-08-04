import { Feature, Point } from "@turf/turf";
import { createCronJobAsync } from "./createCronJob";

const createAreaObjects = async (that: ioBroker.AdapterInstanceWithI18n, area: radarTrap.Area): Promise<void> => {
	await that.setObjectAsync(area._id, {
		type: "device",
		common: { name: area.description! },
		native: { type: "AREA" },
	});

	await createCronJobAsync(that, area._id);

	await that.setObjectAsync(`${area._id}.area-infos`, {
		type: "channel",
		common: { name: "Area Infos" },
		native: {}
	});

	await that.setObjectAsync(`${area._id}.area-infos.lastUpdated`, {
		type: "state",
		common: {
			name: "Last Updated",
			defAck: true,
			type: "string",
			role: "text",
			read: true,
			write: false,
		},
		native: {},
	}).then(() => that.setState(`${area._id}.area-infos.lastUpdated`, `${area.timestamp}`, true));

	await that.setObjectAsync(`${area._id}.area-infos.description`, {
		type: "state",
		common: {
			name: "Description",
			defAck: true,
			type: "string",
			role: "text",
			read: true,
			write: false,
		},
		native: {},
	}).then(() => that.setState(`${area._id}.area-infos.description`, `${area.description}`, true));

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

		await that.setObjectAsync(`${area._id}.${channelName}`, {
			type: "channel",
			common: { name: "Area" },
			native: {},
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

			await that.setObjectAsync(`${area._id}.${channelName}.${trapName}`, {
				type: "state",
				common: {
					name: that.I18n[trapName],
					defAck: true,
					type: "array",
					role: "list",
					read: true,
					write: false,
				},
				native: {},
			}).then(() =>
				that.setState(`${area._id}.${channelName}.${trapName}`, JSON.stringify(newTraps), true),
			);

			await that.setObjectAsync(`${area._id}.${channelName}.${trapName}Count`, {
				type: "state",
				common: {
					name: `${that.I18n["count"]}: ${that.I18n[trapName]}`,
					defAck: true,
					type: "number",
					role: "value",
					read: true,
					write: false,
				},
				native: {},
			}).then(() => that.setState(`${area._id}.${channelName}.${trapName}Count`, newTraps.length, true));
		}

		await that.setObjectAsync(`${area._id}.area-infos.${trapType}Count`, {
			type: "state",
			common: {
				name: `${that.I18n["count"]}: ${channelName}`,
				defAck: true,
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		}).then(() => that.setState(`${area._id}.area-infos.${trapType}Count`, totalTrapsCount, true));
	}
};

export { createAreaObjects };
