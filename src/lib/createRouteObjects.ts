import { createCronJobAsync } from "./createCronJob";

import type * as utils from "@iobroker/adapter-core";

const createRouteObjects = async (
	that: utils.AdapterInstance,
	route: radarTrap.Route,
): Promise<void> => {
	that.setObjectAsync(route._id, {
		type: "device",
		common: { name: route.description! },
		native: { type: "ROUTE" },
	});

	await that.createChannelAsync(`${route._id}`, "direction-infos", {
		name: "Direction Infos",
	});

	await that
		.createStateAsync(`${route._id}`, "direction-infos", "description", {
			name: "Description",
			defAck: true,
			read: true,
			write: false,
			type: "string",
			role: "text",
		})
		.then(
			async () =>
				await that.setStateAsync(
					`${route._id}.direction-infos.description`,
					`${route.description}`,
					true,
				),
		);

	await that
		.createStateAsync(`${route._id}`, "direction-infos", "profile", {
			name: "Profile",
			defAck: true,
			read: true,
			write: false,
			type: "string",
			role: "text",
		})
		.then(
			async () =>
				await that.setStateAsync(
					`${route._id}.direction-infos.profile`,
					`${route.activeProfile!.name}`,
					true,
				),
		);

	await that
		.createStateAsync(`${route._id}`, "direction-infos", "exclusions", {
			name: "Exclusions",
			defAck: true,
			read: true,
			write: false,
			type: "array",
			role: "list",
		})
		.then(
			async () =>
				await that.setStateAsync(
					`${route._id}.direction-infos.exclusions`,
					`${JSON.stringify(route.activeProfile!.actualExclusion)}`,
					true,
				),
		);

	await createCronJobAsync(that, route._id);

	route.directions?.forEach(async (direction, idx) => {
		await that.createChannelAsync(`${route._id}`, `direction-${idx}`, {
			name: `Direction ${idx}`,
		});

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}`, "duration", {
				name: "Duration",
				unit: "s",
				defAck: true,
				read: true,
				write: false,
				type: "number",
				role: "value",
			})
			.then(
				async () =>
					await that.setStateAsync(
						`${route._id}.direction-${idx}.duration`,
						Math.round(direction.direction.duration),
						true,
					),
			);

		await that
			.createStateAsync(`${route._id}`, `direction-${idx}`, "distance", {
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
						`${route._id}.direction-${idx}.distance`,
						Math.round(direction.direction.distance),
						true,
					),
			);

		for (const [trapName, traps] of Object.entries(direction.traps)) {
			const newTraps = traps.map((trap) => ({
				type: trap.type,
				geometry: trap.geometry,
				properties: { ...trap.properties?.trapInfo },
			}));

			await that
				.createStateAsync(
					`${route._id}`,
					`direction-${idx}`,
					`${trapName}`,
					{
						name: `${trapName}`,
						defAck: true,
						read: true,
						write: false,
						type: "array",
						role: "list",
					},
				)
				.then(
					async () =>
						await that.setStateAsync(
							`${route._id}.direction-${idx}.${trapName}`,
							JSON.stringify(newTraps),
							true,
						),
				);
		}
	});
};

export { createRouteObjects };
