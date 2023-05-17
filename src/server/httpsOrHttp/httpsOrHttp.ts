import express from "express";
import http from "http";
import http2 from "http2";
import { getCertificate } from "./getCertificate";

const httpsOrHttp = async (options: any, callback: any): Promise<void> => {
	if (!options) {
		throw new Error("Options are missing.");
	}
	if (!options.app) {
		throw new Error("App is missing.");
	}
	if (!options.ports) {
		throw new Error("Ports are missing.");
	}
	if (!options.ports.http) {
		throw new Error("Http port is missing.");
	}
	if (!options.ports.https) {
		throw new Error("Https port is missing.");
	}
	if (!callback) {
		throw new Error("Callback is missing.");
	}

	let certificate;

	try {
		certificate = await getCertificate(options.that);
	} catch {
		certificate = undefined;
	}

	if (certificate) {
		http2
			.createSecureServer(
				{ key: certificate.privateKey, cert: certificate.certificate },
				options.app,
			)
			.listen(options.ports.https, () => {
				const redirectApp = express();

				redirectApp.get(/.*/u, (req: any, res: any) => {
					res.redirect(
						`https://${req.headers.host.replace(
							`:${options.ports.http}`,
							`:${options.ports.https}`,
						)}${req.url}`,
					);
				});

				http.createServer(redirectApp).listen(
					options.ports.http,
					() => {
						callback(null, {
							app: {
								protocol: "https",
								port: options.ports.https,
							},
							redirect: {
								protocol: "http",
								port: options.ports.http,
							},
						});
					},
				);
			});

		return;
	}

	http.createServer(options.app).listen(options.ports.http, () => {
		callback(null, {
			app: { protocol: "http", port: options.ports.http },
		});
	});
};

export { httpsOrHttp };
