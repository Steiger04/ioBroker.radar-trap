import type * as utils from "@iobroker/adapter-core";

const createCronJobAsync = async (
	that: utils.AdapterInstance,
	_id: string,
): Promise<void> => {
	await that.createChannelAsync(`${_id}`, "cron-job", {
		name: "Cron Job",
	});

	await that
		.createStateAsync(`${_id}`, "cron-job", "timer", {
			name: "Timer",
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
					`${_id}.cron-job.timer`,
					/* Scheduler.getSchedule(route._id)!.next, */
					0,
					true,
				),
		);

	await that.createStateAsync(`${_id}`, "cron-job", "pause", {
		name: "Pause",
		defAck: true,
		def: false,
		read: false,
		write: true,
		type: "boolean",
		role: "button",
	});

	await that.createStateAsync(`${_id}`, "cron-job", "resume", {
		name: "Resume",
		defAck: true,
		def: false,
		read: false,
		write: true,
		type: "boolean",
		role: "button",
	});

	await that.createStateAsync(`${_id}`, "cron-job", "run", {
		name: "Run",
		defAck: true,
		def: false,
		read: false,
		write: true,
		type: "boolean",
		role: "button",
	});
};

export { createCronJobAsync };
