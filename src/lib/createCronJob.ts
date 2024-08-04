import type * as utils from "@iobroker/adapter-core";

const createCronJobAsync = async (that: utils.AdapterInstance, _id: string): Promise<void> => {
	await that.setObjectAsync(`${_id}.cron-job`, {
		type: "channel",
		common: { name: "Cron Job" },
		native: {},
	});

	await that.setObjectAsync(`${_id}.cron-job.timer`, {
		type: "state",
		common: {
			name: "Timer",
			unit: "s",
			defAck: true,
			read: true,
			write: false,
			type: "number",
			role: "value",
		},
		native: {},
	}).then(() => that.setState(`${_id}.cron-job.timer`, 0, true));

	await that.setObjectAsync(`${_id}.cron-job.pause`, {
		type: "state",
		common: {
			name: "Pause",
			defAck: true,
			read: false,
			write: true,
			type: "boolean",
			role: "button",
		},
		native: {},
	}).then(() => that.setState(`${_id}.cron-job.pause`, false, true));

	await that.setObjectAsync(`${_id}.cron-job.resume`, {
		type: "state",
		common: {
			name: "Resume",
			defAck: true,
			read: false,
			write: true,
			type: "boolean",
			role: "button",
		},
		native: {},
	}).then(() => that.setState(`${_id}.cron-job.resume`, false, true));

	await that.setObjectAsync(`${_id}.cron-job.run`, {
		type: "state",
		common: {
			name: "Run",
			defAck: true,
			read: false,
			write: true,
			type: "boolean",
			role: "button",
		},
		native: {},
	}).then(() => that.setState(`${_id}.cron-job.run`, false, true));
};

export { createCronJobAsync };
