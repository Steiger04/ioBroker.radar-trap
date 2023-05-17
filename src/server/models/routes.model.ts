import NeDB from "@seald-io/nedb";
import path from "path";
import type { Application } from "../declarations";

export default function (app: Application): NeDB<radarTrap.Route> {
	const dbPath = app.get("nedb");
	const Model = new NeDB({
		filename: path.join(dbPath, "routes.db"),
		autoload: true,
	});

	return Model;
}
