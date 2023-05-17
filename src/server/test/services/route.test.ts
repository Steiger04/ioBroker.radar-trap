import assert from "assert";
import app from "../../app";

describe("'route' service", () => {
	it("registered the service", () => {
		const service = app.service("route");

		assert.ok(service, "Registered the service");
	});
});
