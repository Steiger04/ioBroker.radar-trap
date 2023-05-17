// Initializes the `areas` service on path `/areas`
import createModel from "../../models/areas.model";
import { Areas } from "./areas.class";
import hooks from "./areas.hooks";

import type { ServiceAddons } from "@feathersjs/feathers";
import type { Application } from "../../declarations";
// Add this service to the service type index
declare module "../../declarations" {
	interface ServiceTypes {
		areas: Areas & ServiceAddons<any>;
	}
}

export default function (app: Application): void {
	const options = {
		events: ["status"],
		Model: createModel(app),
		paginate: app.get("paginate"),
	};

	// Initialize our service with any options it requires
	app.use("/areas", new Areas(options, app));

	// Get our initialized service so that we can register hooks
	const service = app.service("areas");

	service.hooks(hooks);
}
