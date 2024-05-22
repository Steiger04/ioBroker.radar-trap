module.exports = {
	reactRaw: {
		define: {
			"global": "window",
		},
		loader: {
			".png": "dataurl",
			".svg": "text",
		},
	},
};
