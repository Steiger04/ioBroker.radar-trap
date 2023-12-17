import type { HookContext } from "@feathersjs/feathers";
import {
	alterItems,
	disablePagination,
	disallow,
	iff,
	iffElse,
	isProvider,
	paramsFromClient,
} from "feathers-hooks-common";
import { Scheduler } from "../../../lib/Scheduler";
import { patchOrCreateArea } from "../../hooks";
import { addTrapInfoToAllTraps } from "../../hooks/addTrapInfoToAllTraps";

export default {
	before: {
		all: [],
		find: [
			iff(
				(ctx: HookContext) => isProvider("server")(ctx) || isProvider("rest")(ctx),
				(ctx: HookContext) => {
					if (ctx.params.query) {
						ctx.params.query.$limit = -1;
					}

					return ctx;
				},
				disablePagination(),
			),
		],
		get: [],
		create: [
			disallow("rest"),
			iffElse(
				isProvider("external"),
				[paramsFromClient("patchSourceFromClient"), patchOrCreateArea()],
				[patchOrCreateArea()],
			),
		],
		update: [disallow("rest")],
		patch: [disallow("rest")],
		remove: [disallow("rest")],
	},

	after: {
		all: [],
		find: [alterItems(addTrapInfoToAllTraps)],
		get: [alterItems(addTrapInfoToAllTraps)],
		create: [
			alterItems(addTrapInfoToAllTraps),
			(ctx: HookContext): HookContext => {
				ctx.service.emit("status", {
					_id: ctx.data._id,
					status: "success",
				});
				Scheduler.resume(ctx.data._id);

				return ctx;
			},
		],
		update: [],
		patch: [],
		remove: [],
	},

	error: {
		all: [],
		find: [],
		get: [],
		create: [],
		update: [],
		patch: [],
		remove: [],
	},
};
