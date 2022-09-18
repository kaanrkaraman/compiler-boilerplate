const compile = require("../dist/src/parser.js").compiler;

describe("Math operations", () => {
	test("adds 1 + 2 to equal 3", () => {
		const compiled = compile("1 + 2");
		const result = eval(compiled);
		expect(result).toBe(3);
	});

	test("subtracts 2 from 3 to equal 1", () => {
		const compiled = compile("3 - 2");
		const result = eval(compiled);
		expect(result).toBe(1);
	});
});
