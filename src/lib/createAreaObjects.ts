import { createCronJobAsync } from "./createCronJob";

import type * as utils from "@iobroker/adapter-core";

const createAreaObjects = async (
	that: utils.AdapterInstance,
	area: radarTrap.Area,
): Promise<void> => {
	that.setObjectAsync(area._id, {
		type: "device",
		common: { name: area.description! },
		native: { type: "AREA" },
	});

	await createCronJobAsync(that, area._id);

	await that.createChannelAsync(`${area._id}`, "area-infos", {
		name: "Area Infos",
	});

	await that
		.createStateAsync(`${area._id}`, "area-infos", "description", {
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
					`${area._id}.area-infos.description`,
					`${area.description}`,
					true,
				),
		);

	await that.createChannelAsync(`${area._id}`, "area", {
		name: "Area",
	});

	for (const [trapName, traps] of Object.entries(area.areaTraps!)) {
		const newTraps = traps.map((trap) => ({
			type: trap.type,
			geometry: trap.geometry,
			properties: { ...trap.properties?.trapInfo },
		}));

		await that
			.createStateAsync(`${area._id}`, `area`, `${trapName}`, {
				name: `${trapName}`,
				defAck: true,
				read: true,
				write: false,
				type: "array",
				role: "list",
			})
			.then(
				async () =>
					await that.setStateAsync(
						`${area._id}.area.${trapName}`,
						JSON.stringify(newTraps),
						true,
					),
			);
	}
};

export { createAreaObjects };
