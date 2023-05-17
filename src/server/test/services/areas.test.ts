import assert from "assert";
import app from "../../app";

describe("'areas' service", () => {
	it("registered the service", () => {
		const service = app.service("areas");

		assert.ok(service, "Registered the service");
	});
});
