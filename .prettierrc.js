module.exports = {
	semi: true,
	trailingComma: "all",
	singleQuote: false,
	printWidth: 120,
	useTabs: true,
	tabWidth: 4,
	endOfLine: "lf",
	overrides: [
		{
			files: "admin/src/i18n/*.json",
			options: {
				useTabs: false,
			},
		},
	],
};
