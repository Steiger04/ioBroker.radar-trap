import assert from "assert";
import axios from "axios";
import url from "url";
import app from "../app";

import type { Server } from "http";

const port = app.get("port") || 8_998;
const getUrl = (pathname?: string): string =>
	url.format({
		hostname: app.get("host") || "localhost",
		protocol: "http",
		port,
		pathname,
	});

describe("Feathers application tests", () => {
	let server: Server;

	before((done) => {
		server = app.listen(port);
		server.once("listening", () => done());
	});

	after((done) => {
		server.close(done);
	});

	it("starts and shows the index page", async () => {
		const { data } = await axios.get(getUrl());

		assert.ok(data.includes('<html lang="en">'));
	});

	describe("404", () => {
		it("shows a 404 HTML page", async () => {
			try {
				await axios.get(getUrl("path/to/nowhere"), {
					headers: {
						Accept: "text/html",
					},
				});
				assert.fail("should never get here");
			} catch (ex: any) {
				const { response } = ex;

				assert.equal(response.status, 404);
				assert.ok(response.data.includes("<html>"));
			}
		});

		it("shows a 404 JSON error without stack trace", async () => {
			try {
				await axios.get(getUrl("path/to/nowhere"));
				assert.fail("should never get here");
			} catch (ex: any) {
				const { response } = ex;

				assert.equal(response.status, 404);
				assert.equal(response.data.code, 404);
				assert.equal(response.data.message, "Page not found");
				assert.equal(response.data.name, "NotFound");
			}
		});
	});
});
