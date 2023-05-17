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
import {
	convertPolylineToGeojson,
	patchOrCreateRoute,
	setActiveProfile,
} from "../../hooks";

import type { HookContext } from "@feathersjs/feathers";

export default {
	before: {
		all: [],
		find: [
			iff(
				(ctx: HookContext) =>
					isProvider("server")(ctx) || isProvider("rest")(ctx),
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
				[
					alterItems(setActiveProfile),
					paramsFromClient("patchSourceFromClient"),
					patchOrCreateRoute(),
				],
				[patchOrCreateRoute()],
			),
		],
		update: [disallow("rest")],
		patch: [disallow("rest")],
		remove: [disallow("rest")],
	},

	after: {
		all: [],
		find: [alterItems(convertPolylineToGeojson)],
		get: [alterItems(convertPolylineToGeojson)],
		create: [
			alterItems(convertPolylineToGeojson),
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
