const mapStyles = {
	// Routes
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

	// Areas
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
	/* speedTraps: {
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
	}, */
	/* traps: {
		id: "traps",
		type: "symbol",
		source: "traps",
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
				"icon-20",
				// "icon-traffic-jam",
				// "",
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
			// "icon-size": ["interpolate", ["linear"], ["zoom"], 0, 0.4, 8, 0.8, 10, 1.2, 14, 1.6],
			"icon-size": ["match", ["get", "type_name"], "traffic-jam", 0.25, 0.8],
			"icon-anchor": "bottom",
		},
		paint: {
			// "icon-color": "#263238",
			"icon-color": "rgba(255,0,0,1.0)",
			// "icon-opacity": 1.0,
		},
	}, */
	// Cluster
	clusterTraps: {
		id: "cluster-traps",
		type: "circle",
		filter: ["has", "point_count"],
		paint: {
			"circle-opacity": 0.3,
			"circle-color": ["step", ["get", "point_count"], "#263238", 100, "#263238", 750, "#263238"],
			"circle-radius": ["step", ["get", "point_count"], 12, 9, 15, 100, 18],
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

	// resultPolyPoints
	traps: {
		id: "traps",
		type: "symbol",
		source: "traps",
		layout: {
			"icon-allow-overlap": true,
			"icon-image": [
				"match",
				["get", "type"],
				["1", "2", "107"],
				"speed-camera",
				"6",
				"mobile-distance-speed-camera",
				"20",
				"traffic-jam",
				"21",
				"accident",
				["22", "26"],
				"road-work",
				"25",
				"visual-obstruction",
				"29",
				"breakdown",
				"104",
				"bus-lane",
				"108",
				"weight-control",
				"109",
				"height-control",
				"110",
				"redlight-fixed",
				"111",
				"combined-fixed",
				"112",
				"section-control-start",
				"113",
				"section-control-end",
				"114",
				"tunnel-speed-camera",
				"115",
				"no-overtaking",
				"2015",
				"mobile-speed-camera-hotspot",
				["vwd", "vwda"],
				"police-news",
				"",
			],
			"icon-size": ["interpolate", ["linear"], ["zoom"], 8, 0.06, 15, 0.15],
			"icon-anchor": "center",
			// ----------- Text ------------
			"text-allow-overlap": true,
			"text-anchor": "center",
			"text-field": [
				"format",
				["match", ["get", "type"], ["1", "2", "107", "110", "112"], ["get", "vmax", ["get", "trapInfo"]], ""],
				{
					"text-font": ["literal", ["DIN Offc Pro Medium", "Arial Unicode MS Bold"]],
					"text-color": [
						"match",
						["get", "status"],
						"NEW",
						"rgba(123,25,25,0.95)",
						"ESTABLISHED",
						"rgba(10,34,55,0.95)",
						"rgba(10,34,55,0.95)",
					],
				},
			],
			"text-offset": [
				"match",
				["get", "type"],
				"110",
				["literal", [0.2, 0]],
				["1", "2", "107", "112"],
				["literal", [0, 0]],
				["literal", [0, 0]],
			],
			"text-size": ["interpolate", ["linear"], ["zoom"], 8, 8, 15, 16],
		},
		paint: {
			"icon-color": [
				"match",
				["get", "status"],
				"NEW",
				"rgba(232,10,10,1.0)",
				"ESTABLISHED",
				"rgba(13,77,133,1.0)",
				"rgba(13,77,133,1.0)",
			],
		},
	},

	// resultPolyLines
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
			"line-color": ["match", ["get", "type"], "sc", "blue", "closure", "red", "20", "green", "black"],
			"line-width": 6,
			"line-dasharray": [0, 4, 3],
		},
	},
	trafficClosure: {
		type: "symbol",
		id: "traffic-closure",
		filter: ["all", ["==", "type", "closure"]], // filter: ["all", ["==", "type", "20"]]
		layout: {
			"icon-allow-overlap": true,
			"icon-image": "icon-traffic-closure",
			"icon-size": ["interpolate", ["linear"], ["zoom"], 8, 0.04, 15, 0.1],
		},
		paint: {
			"icon-opacity": 1.0,
		},
	},
};

export { mapStyles };
