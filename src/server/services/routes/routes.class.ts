import { NedbServiceOptions, Service } from "feathers-nedb";
import type { Application } from "../../declarations";

export class Routes extends Service<radarTrap.Route> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	constructor(options: Partial<NedbServiceOptions>, app: Application) {
		super(options);
	}
}
