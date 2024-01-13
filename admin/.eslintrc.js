module.exports = {
	extends: ["../.eslintrc.js", "plugin:react-hooks/recommended"],
	parserOptions: {
		ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
		sourceType: "module", // Allows for the use of imports
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
	},
	globals: {
		React: false,
		ReactDOM: false,
	},
};
