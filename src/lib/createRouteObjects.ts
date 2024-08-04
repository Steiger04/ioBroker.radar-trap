import { createCronJobAsync } from "./createCronJob";
import { Feature, Point, LineString } from "@turf/turf";

const createRouteObjects = async (that: ioBroker.AdapterInstanceWithI18n, route: radarTrap.Route): Promise<void> => {
	await that.setObjectAsync(route._id, {
		type: "device",
		common: { name: route.description! },
		native: { type: "ROUTE" },
	});

	await createCronJobAsync(that, route._id);

	route.directions?.forEach(async (direction, idx) => {
		await that.setObjectAsync(`${route._id}.direction-${idx}-infos`, {
			type: "channel",
			common: { name: `Direction-${idx} Infos` },
			native: {},
		});

		await that.setObjectAsync(`${route._id}.direction-${idx}-infos.description.lastUpdated`, {
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
		}).then(() => that.setState(`${route._id}.direction-${idx}-infos.description.lastUpdated`, `${route.timestamp}`, true));

		await that.setObjectAsync(`${route._id}.direction-${idx}-infos.description`, {
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
		}).then(() => that.setState(`${route._id}.direction-${idx}-infos.description`, `${route.description}`, true));

		await that.setObjectAsync(`${route._id}.direction-${idx}-infos.profile`, {
			type: "state",
			common: {
				name: "Profile",
				defAck: true,
				type: "string",
				role: "text",
				read: true,
				write: false,
			},
			native: {},
		}).then(() => that.setState(`${route._id}.direction-${idx}-infos.profile`, `${route.activeProfile!.name}`, true));

		await that.setObjectAsync(`${route._id}.direction-${idx}-infos.exclusions`, {
			type: "state",
			common: {
				name: "Exclusions",
				defAck: true,
				type: "array",
				role: "list",
				read: true,
				write: false,
			},
			native: {},
		}).then(() => that.setState(`${route._id}.direction-${idx}-infos.exclusions`, `${JSON.stringify(route.activeProfile!.actualExclusion)}`, true));

		await that.setObjectAsync(`${route._id}.direction-${idx}-infos.duration`, {
			type: "state",
			common: {
				name: "Duration",
				unit: "s",
				defAck: true,
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		}).then(() => that.setState(`${route._id}.direction-${idx}-infos.duration`, Math.round(direction.direction.duration), true));

		await that.setObjectAsync(`${route._id}.direction-${idx}-infos.distance`, {
			type: "state",
			common: {
				name: "Distance",
				unit: "m",
				defAck: true,
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		}).then(() => that.setState(`${route._id}.direction-${idx}-infos.distance`, Math.round(direction.direction.distance), true));

		for (const trapType of ["routeTraps", "routeTrapsEstablished", "routeTrapsNew", "routeTrapsRejected"]) {
			let totalTrapsCount = 0;

			let channelName = "";

			switch (trapType) {
				case "routeTraps":
					channelName = "route-current";
					break;
				case "routeTrapsNew":
					channelName = "route-new";
					break;
				case "routeTrapsRejected":
					channelName = "route-rejected";
					break;
				case "routeTrapsEstablished":
					channelName = "route-established";
					break;
				default:
					break;
			}

			await that.setObjectAsync(`${route._id}.direction-${idx}-${channelName}`, {
				type: "channel",
				common: { name: `Direction-${idx}` },
				native: {},
			});

			for (const [trapName, traps] of Object.entries(
				direction[trapType as keyof radarTrap.Direction]! as Record<string, Feature<Point | LineString>[]>,
			)) {
				const newTraps = traps.map((trap) => ({
					type: trap.type,
					geometry: trap.geometry,
					properties: { ...trap.properties?.trapInfo },
				}));

				totalTrapsCount += newTraps.length;

				await that.setObjectAsync(`${route._id}.direction-${idx}-${channelName}.${trapName}`, {
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
				}).then(() => that.setState(`${route._id}.direction-${idx}-${channelName}.${trapName}`, JSON.stringify(newTraps), true));

				await that.setObjectAsync(`${route._id}.direction-${idx}-${channelName}.${trapName}Count`, {
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
				}).then(() => that.setState(`${route._id}.direction-${idx}-${channelName}.${trapName}Count`, newTraps.length, true));
			}

			await that.setObjectAsync(`${route._id}.direction-${idx}-infos.${trapType}Count`, {
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
			}).then(() => that.setState(`${route._id}.direction-${idx}-infos.${trapType}Count`, totalTrapsCount, true));
		}
	});
};

export { createRouteObjects };
