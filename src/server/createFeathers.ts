import type * as utils from "@iobroker/adapter-core";
import app from "./app";
import logger from "./logger";
import { getCertificate } from "./httpsOrHttp/getCertificate";
import https from "https";

import type { Server } from "http";

// console.log("### CREATEFEATHERS.TS ###");

let server: Server;

function provideFeathers(that: utils.AdapterInstance, port: number): void {
	server = app.listen(port);

	server.on("listening", () => {
		that.setStateAsync("info.connection", true, true).catch((ex) => console.log(ex));

		logger.info("Feathers application started on http://%s:%d", app.get("host"), port);
	});
}

async function provideFeathersHTTPSAsync(that: utils.AdapterInstance, port: number): Promise<void> {
	const { certificate, privateKey } = await getCertificate(that);

	server = https
		.createServer(
			{
				key: privateKey,
				cert: certificate,
			},
			app,
		)
		.listen(port);

	app.setup(server);

	server.on("listening", () => {
		that.setStateAsync("info.connection", true, true).catch((ex) => console.log(ex));

		that.log.info(`Feathers server for radar-trap started on https://${app.get("host")}:${port}`);
	});
}

export { app as feathers, server, provideFeathers, provideFeathersHTTPSAsync };
