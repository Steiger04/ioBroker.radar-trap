import type * as utils from "@iobroker/adapter-core";
import app from "./app";
import logger from "./logger";

import type { Server } from "http";

// console.log("### CREATEFEATHERS.TS ###");

let server: Server;

function provideFeathers(that: utils.AdapterInstance, port: number): void {
	// console.log("NODE_CONFIG_DIR");

	// Const port = app.get('port');
	server = app.listen(port);

	server.on("listening", () => {
		logger.info(
			"Feathers application started on http://%s:%d",
			app.get("host"),
			port,
		);

		that.setStateAsync("info.connection", true, true).catch((ex) =>
			console.log(ex),
		);
	});
}

export { app as feathers, server, provideFeathers };
