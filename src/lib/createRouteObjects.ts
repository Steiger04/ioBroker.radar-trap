import { createCronJobAsync } from "./createCronJob";

import type * as utils from "@iobroker/adapter-core";

const createRouteObjects = async (that: utils.AdapterInstance, route: radarTrap.Route): Promise<void> => {
	await that.setObjectAsync(route._id, {
		type: "device",
		common: { name: route.description! },
		native: { type: "ROUTE" },
	});

	await createCronJobAsync(that, route._id);

	route.directions?.forEach(async (direction, idx) => {
		await that.createChannelAsync(`${route._id}`, `direction-${idx}`, {
			name: `Direction-${idx}`,
		});

		//
		await that.createChannelAsync(`${route._id}`, `direction-${idx}-infos`, {
			name: `Direction-${idx} Infos`,
		});

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}-infos`, "description", {
				name: "Description",
				defAck: true,
				read: true,
				write: false,
				type: "string",
				role: "text",
			})
			.then(() =>
				that.setStateAsync(`${route._id}.direction-${idx}-infos.description`, `${route.description}`, true),
			);

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}-infos`, "profile", {
				name: "Profile",
				defAck: true,
				read: true,
				write: false,
				type: "string",
				role: "text",
			})
			.then(() =>
				that.setStateAsync(`${route._id}.direction-${idx}-infos.profile`, `${route.activeProfile!.name}`, true),
			);

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}-infos`, "exclusions", {
				name: "Exclusions",
				defAck: true,
				read: true,
				write: false,
				type: "array",
				role: "list",
			})
			.then(() =>
				that.setStateAsync(
					`${route._id}.direction-${idx}-infos.exclusions`,
					`${JSON.stringify(route.activeProfile!.actualExclusion)}`,
					true,
				),
			);
		//

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}-infos`, "duration", {
				name: "Duration",
				unit: "s",
				defAck: true,
				read: true,
				write: false,
				type: "number",
				role: "value",
			})
			.then(() =>
				that.setStateAsync(
					`${route._id}.direction-${idx}-infos.duration`,
					Math.round(direction.direction.duration),
					true,
				),
			);

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}-infos`, "distance", {
				name: "Distance",
				unit: "m",
				defAck: true,
				read: true,
				write: false,
				type: "number",
				role: "value",
			})
			.then(
				async () =>
					await that.setStateAsync(
						`${route._id}.direction-${idx}-infos.distance`,
						Math.round(direction.direction.distance),
						true,
					),
			);

		let totalTrapsCount = 0;
		for (const [trapName, traps] of Object.entries(direction.traps)) {
			const newTraps = traps.map((trap) => ({
				type: trap.type,
				geometry: trap.geometry,
				properties: { ...trap.properties?.trapInfo },
			}));

			totalTrapsCount += newTraps.length;

			await that
				.createStateAsync(`${route._id}`, `direction-${idx}`, `${trapName}`, {
					name: `${trapName}`,
					defAck: true,
					read: true,
					write: false,
					type: "array",
					role: "list",
				})
				.then(() =>
					that.setStateAsync(`${route._id}.direction-${idx}.${trapName}`, JSON.stringify(newTraps), true),
				);

			await that
				.createStateAsync(`${route._id}`, `direction-${idx}`, `${trapName}Count`, {
					name: `${trapName} Count`,
					defAck: true,
					read: true,
					write: false,
					type: "number",
					role: "value",
				})
				.then(() =>
					that.setStateAsync(`${route._id}.direction-${idx}.${trapName}Count`, newTraps.length, true),
				);
		}

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}-infos`, "totalTrapsCount", {
				name: "totalTraps Count",
				defAck: true,
				read: true,
				write: false,
				type: "number",
				role: "value",
			})
			.then(() =>
				that.setStateAsync(`${route._id}.direction-${idx}-infos.totalTrapsCount`, totalTrapsCount, true),
			);
	});
};

export { createRouteObjects };
