import createModel from "../../models/routes.model";
import { Routes } from "./routes.class";
import hooks from "./routes.hooks";

import type { ServiceAddons } from "@feathersjs/feathers";
import type { Application } from "../../declarations";

// Add this service to the service type index
declare module "../../declarations" {
	interface ServiceTypes {
		routes: Routes & ServiceAddons<any>;
	}
}

export default function (app: Application): void {
	const options = {
		events: ["status"],
		Model: createModel(app),
		paginate: app.get("paginate"),
	};

	// Initialize our service with any options it requires
	app.use("/routes", new Routes(options, app));

	// Get our initialized service so that we can register hooks
	const service = app.service("routes");

	service.hooks(hooks);
}
