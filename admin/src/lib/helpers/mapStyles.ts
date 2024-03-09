const mapStyles = {
	route: {
		id: "route",
		type: "line",
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#9C27B0",
			"line-width": 5,
			"line-opacity": 0.8,
		},
	},
	speedTraps: {
		id: "speed-traps",
		type: "circle",
		filter: ["match", ["get", "type_name"], "speed-trap", true, false],
		paint: {
			"circle-opacity": 0.3,
			"circle-color": ["step", ["to-number", ["get", "vmax"]], "#ff0000", 80, "#00ff00"],
			"circle-radius": ["step", ["to-number", ["get", "vmax"]], 15, 99, 18],
		},
	},
	speedTrapsVmax: {
		id: "speed-traps-vmax",
		type: "symbol",
		filter: ["match", ["get", "type_name"], "speed-trap", true, false],
		layout: {
			"text-allow-overlap": true,
			"text-field": "{vmax}",
			"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
			"text-size": 12,
		},
	},
	traps: {
		id: "traps",
		type: "symbol",
		layout: {
			"icon-allow-overlap": true,
			"icon-image": [
				"match",
				["get", "type_name"],
				"fixed-trap",
				"icon-fixed-trap",
				"mobile-trap",
				"icon-mobile-trap",
				"traffic-jam",
				// "icon-traffic-jam",
				"",
				"road-work",
				"icon-road-work",
				"accident",
				"icon-accident",
				"object",
				"icon-object",
				"sleekness",
				"icon-sleekness",
				"fog",
				"icon-fog",
				"police-news",
				"icon-police-news",
				"",
			],
			"icon-size": ["interpolate", ["linear"], ["zoom"], 0, 0.4, 8, 0.8, 10, 1.2, 14, 1.6],
		},
		paint: {
			"icon-color": "#263238",
			"icon-opacity": 0.7,
		},
	},
	clusterTraps: {
		id: "cluster-traps",
		type: "circle",
		filter: ["has", "point_count"],
		paint: {
			"circle-opacity": 0.3,
			"circle-color": ["step", ["get", "point_count"], "#263238", 100, "#263238", 750, "#263238"],
			"circle-radius": ["step", ["get", "point_count"], 12, 9, 15, 99, 18],
		},
	},
	clusterTrapsCount: {
		id: "cluster-traps-count",
		type: "symbol",
		filter: ["has", "point_count"],
		layout: {
			"text-allow-overlap": true,
			"text-field": "{point_count_abbreviated}",
			"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
			"text-size": 12,
		},
	},
	lineBackground: {
		type: "line",
		id: "line-background",
		paint: {
			"line-color": "white",
			"line-width": 6,
			"line-opacity": 0.8,
		},
	},
	lineDashed: {
		type: "line",
		id: "line-dashed",
		paint: {
			/* "line-color": "red", */
			"line-color": ["match", ["get", "type"], "sc", "blue", "closure", "red", "20", "green", "white"],
			"line-width": 6,
			"line-dasharray": [0, 4, 3],
		},
	},
	trafficClosure2: {
		type: "symbol",
		id: "traffic-closure2",
		filter: ["all", ["==", "type", "closure"]],
		layout: {
			"icon-allow-overlap": true,
			"icon-image": "icon-traffic-closure",
			"icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.2, 10, 0.3, 14, 0.4],
		},
		paint: {
			"icon-opacity": 0.7,
		},
	},

	traffic20: {
		type: "symbol",
		id: "traffic-20",
		filter: ["all", ["==", "type", "20"]],
		layout: {
			"icon-allow-overlap": true,
			"icon-image": "icon-20",
			// "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.04, 10, 0.05, 14, 0.06],
			"icon-size": 0.04,
			"icon-anchor": "bottom",
		},
		paint: {
			"icon-opacity": 1.0,
			"icon-color": "rgba(13,77,133,0.8)",
		},
	},
	trafficClosure: {
		type: "symbol",
		id: "traffic-closure",
		filter: ["all", ["==", "type", "closure"], ["==", "$type", "Point"]],
		layout: {
			"icon-allow-overlap": true,
			"icon-image": "icon-traffic-closure",
			"icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.005, 10, 0.005, 14, 0.005],
		},
		paint: {
			"icon-opacity": 0.7,
		},
	},
	/* lineTraps: {
		id: "line-traps",
		type: "line",
		filter: ["has", "polyline"],
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#ff0000",
			"line-width": 9,
			"line-opacity": 1,
			"line-dasharray": [1, 1.5],
		},
	}, */
	areaSurface: {
		id: "area-surface",
		type: "fill",
		paint: {
			"fill-color": "#3288bd",
			"fill-opacity": 0.1,
		},
	},
	areaSurfaceBorder: {
		id: "area-surface-border",
		type: "line",
		paint: {
			"line-color": "#3288bd",
			"line-width": 2,
		},
	},
};

export { mapStyles };
