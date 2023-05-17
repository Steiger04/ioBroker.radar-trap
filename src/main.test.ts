/**
 * This is a dummy TypeScript test file using chai and mocha
 *
 * It's automatically excluded from npm and its build output is excluded from both git and npm.
 * It is advised to test all your modules with accompanying *.test.ts-files
 */

import { expect } from "chai";

// Import { functionToTest } from "./moduleToTest";

describe("module to test => function to test", () => {
	// Initializing logic
	const expected = 5;

	it(`should return ${expected}`, () => {
		const result = 5;

		// Assign result a value from functionToTest
		expect(result).to.equal(expected);

		// Or using the should() syntax
		result.should.equal(expected);
	});

	// ... more tests => it
});

// ... more test suites => describe
