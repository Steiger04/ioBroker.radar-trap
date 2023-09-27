/* global $ turf mapboxgl io feathers vis systemDictionary */

const cache = new Map();

function isArray(it) {
	if (typeof Array.isArray === "function") return Array.isArray(it);
	return Object.prototype.toString.call(it) === "[object Array]";
}

if (vis.editMode) {
	$.extend(true, systemDictionary, {
		area: {
			en: "area",
			de: "Gebiet",
		},
		route: {
			en: "route",
			de: "Route",
		},
		areaorroute: {
			en: "area or route",
			de: "Gebiet oder Route",
		},
		polygonBorder: {
			en: "polygon border [px]",
			de: "Polygon-Rand [px]",
		},
		polygonColor: {
			en: "polygon color",
			de: "Polygon-Farbe",
		},
		polygonBorderColor: {
			en: "polygon border color",
			de: "Polygon-Randfarbe",
		},
		showPolygon: {
			en: "show polygon",
			de: "Polygon anzeigen",
		},
		polygonOpacity: {
			en: "polygon opacity",
			de: "Polygon-Deckkraft",
		},
		showCluster: {
			en: "show cluster",
			de: "Cluster anzeigen",
		},
		routeColor: {
			en: "route color",
			de: "Routen-Farbe",
		},
		clusterColor: {
			en: "cluster color",
			de: "Cluster-Farbe",
		},
		symbolColor: {
			en: "symbol color",
			de: "Symbol-Farbe",
		},
		styleSelect: {
			en: "style",
			de: "Stil",
		},
		fitButton: {
			en: "fit button",
			de: "Fit-Button",
		},
		"satellite-v9": {
			en: "satellite-v9",
			de: "satellite-v9",
		},
		"satellite-streets-v11": {
			en: "satellite-streets-v11",
			de: "satellite-streets-v11",
		},
		"streets-v12": {
			en: "streets-v12",
			de: "streets-v12",
		},
		"light-v10": {
			en: "light-v10",
			de: "light-v10",
		},
		"dark-v10": {
			en: "dark-v10",
			de: "dark-v10",
		},
		"navigation-night-v1": {
			en: "navigation-night-v1",
			de: "navigation-night-v1",
		},
		"outdoors-v11": {
			en: "outdoors-v11",
			de: "outdoors-v11",
		},
		noNothingInfo: {
			en: "no nothing info",
			de: "Traps Info nur wenn vorhanden",
		},
		group_Traps: {
			en: "show traps",
			de: "Traps anzeigen",
		},
	});
}

$.extend(true, systemDictionary, {
	"fixed-trap": {
		en: "fixed traps",
		de: "Blitzer fest",
	},
	"mobile-trap": {
		en: "mobile traps",
		de: "Blitzer mobil",
	},
	"speed-trap": {
		en: "speed traps",
		de: "Blitzer teilstationär",
	},
	"traffic-jam": {
		en: "traffic jams",
		de: "Staus",
	},
	accident: {
		en: "accidents",
		de: "Unfälle",
	},
	"road-work": {
		en: "road works",
		de: "Baustellen",
	},
	sleekness: {
		en: "sleekness",
		de: "Glätte",
	},
	fog: {
		en: "fog",
		de: "Nebel",
	},
	object: {
		en: "objects",
		de: "Gegenstände",
	},
	"police-news": {
		en: "police news",
		de: "Polizeimeldungen",
	},
	"closed-congested-road": {
		en: "closed and congested section of roads",
		de: "Sperr- und Staustrecken",
	},
	"animate-closed-congested-road": {
		en: "animate closed and congested section of roads",
		de: "Sperr- und Staustrecken animieren",
	},
	"please select area or route": {
		en: "Please select area or route . . .",
		de: "Bitte ein Gebiet oder eine Route auswählen . . .",
	},
	"no radar-trap instance active": {
		en: "No radar-trap instance active",
		de: "Keine radar-trap Instanz aktiv",
	},
});

vis.binds["radar-trap"] = {
	version: "1.0.0",
	feathersClient: null,
	areasService: null,
	routesService: null,
	language: null,
	ids: null,
	native: null,
	isInstanceEnabled: false,
	url: new URL(document.URL),
	showVersion: function () {
		console.log("Version radar-trap: " + vis.binds["radar-trap"].version);
		console.log("Version Vis:", vis.version);
	},
	selectId: (widAttr) => {
		return vis.editSelect(
			widAttr,
			[
				"",
				...Object.entries(vis.objects)
					.filter(
						([key, val]) =>
							key.split(".")[0] === "radar-trap" &&
							val.type === "device" &&
							widAttr.toUpperCase() === val.native.type,
					)
					.map(
						([key, value]) =>
							value.common.name + " | " + key.split(".")[2],
					),
			],
			true,
		);
	},
	selectAllId: (widAttr) => {
		return vis.editSelect(
			widAttr,
			[
				"",
				...Object.entries(vis.objects)
					.filter(
						([key, val]) =>
							key.split(".")[0] === "radar-trap" &&
							val.type === "device",
					)
					.map(
						([key, value]) =>
							value.common.name + " | " + key.split(".")[2],
					),
			],
			true,
		);
	},
	initRadarTrap: function () {
		if (!!!vis.conn) {
			setTimeout(() => {
				vis.binds["radar-trap"].initRadarTrap();
			}, 100);
			return;
		}

		vis.conn._socket.emit(
			"getObject",
			"system.config",
			function (err, res) {
				vis.binds["radar-trap"].language = res.common.language;
			},
		);

		vis.conn._socket.emit(
			"getObjectView",
			"system",
			"instance",
			{
				startkey: "system.adapter.radar-trap",
				endkey: "system.adapter.radar-trap.\u9999",
			},
			function (err, res) {
				if (res.rows.length > 0) {
					// instance found
					vis.binds["radar-trap"].isInstanceEnabled =
						res.rows[0].value.common.enabled;

					vis.binds["radar-trap"].native = {
						...res.rows[0].value.native,
					};
				} else {
					// no instance found
					console.log("no radar-trap instance found");

					return;
				}

				if (!vis.binds["radar-trap"].isInstanceEnabled) return; // no instance enabled

				let socket;
				if (
					vis.binds["radar-trap"].native.settings.httpsEnabled ===
					true
				) {
					socket = io(
						`https://${vis.binds["radar-trap"].url.hostname}:${vis.binds["radar-trap"].native.settings.feathersPort}`,
						{
							forceNew: true,
						},
					);
				} else {
					socket = io(
						`http://${vis.binds["radar-trap"].url.hostname}:${vis.binds["radar-trap"].native.settings.feathersPort}`,
						{
							forceNew: true,
						},
					);
				}

				vis.binds["radar-trap"].feathersClient = feathers();
				vis.binds["radar-trap"].feathersClient.configure(
					feathers.socketio(socket, { timeout: 60_000 }),
				);

				vis.binds["radar-trap"].routesService =
					vis.binds["radar-trap"].feathersClient.service("routes");

				vis.binds["radar-trap"].routesService.on(
					"created",
					vis.binds["radar-trap"].onUpdatedListener("ROUTE"),
				);

				vis.binds["radar-trap"].areasService =
					vis.binds["radar-trap"].feathersClient.service("areas");

				vis.binds["radar-trap"].areasService.on(
					"created",
					vis.binds["radar-trap"].onUpdatedListener("AREA"),
				);
			},
		);
	},
	onUpdatedListener: (type) => (updatedData) => {
		const $data = $("div[id^=mapbox_]");
		const $mapboxes = [];

		$data.each(function () {
			if ($(this).data("_id") === updatedData._id) {
				if (type === "ROUTE") {
					$(this).data(
						"directionsFeatureCollection",
						updatedData.directionsFeatureCollection,
					);
				}

				if (type === "AREA") {
					$(this).data(
						"polysFeatureCollection",
						updatedData.polysFeatureCollection,
					);

					$(this).data(
						"areaPolygonsFeatureCollection",
						turf.featureCollection(
							Object.values(updatedData.areaPolygons),
						).features[0],
					);
				}

				$(this).data(
					"trapsFeatureCollection",
					updatedData.trapsFeatureCollection,
				);

				$mapboxes.push($(this));
			}
		});

		if (!!$mapboxes.length) {
			$mapboxes.forEach(($mapbox) => {
				vis.binds["radar-trap"].mapbox.updateMapAsync($mapbox, type);
			});
		}

		const $trapsinfos2 = $("div[id^=trapsinfo_]");
		$trapsinfos2.each(function () {
			const wid = $(this).data("wid");

			if (
				updatedData._id ===
				vis.widgets[wid].data.attr("areaorroute").split("|")[1].trim()
			) {
				// vis.widgets[wid].data.removeAttr("trapsFeatureGroups");

				const trapsFeature =
					updatedData.trapsFeatureCollection.features.filter(
						(feature) => feature.properties.trapInfo !== null,
					);

				const trapsFeatureGroups = trapsFeature.reduce(
					(groups, trapFeature) => {
						groups[trapFeature.properties.type_name].push(
							trapFeature,
						);
						return groups;
					},
					{
						"fixed-trap": [],
						"mobile-trap": [],
						"speed-trap": [],
						"road-work": [],
						"traffic-jam": [],
						sleekness: [],
						accident: [],
						fog: [],
						object: [],
						"police-news": [],
					},
				);
				vis.widgets[wid].data.attr(
					"trapsFeatureGroups",
					trapsFeatureGroups,
				);

				vis.binds["radar-trap"].trapsInfo.bindListClickEventHandler(
					$(this),
				);
			}
		});
	},
	mapbox: {
		getMapStyle: function (key, data) {
			const mapStyles = {
				route: {
					id: "route",
					type: "line",
					source: "route",
					layout: {
						"line-join": "round",
						"line-cap": "round",
					},
					paint: {
						"line-color": data["routeColor"],
						"line-width": 5,
						"line-opacity": 0.8,
					},
				},
				speedTraps: {
					id: "speed-traps",
					type: "circle",
					source: "clustertraps",
					filter: [
						"match",
						["get", "type_name"],
						"speed-trap",
						true,
						false,
					],
					paint: {
						"circle-opacity": 0.3,
						"circle-color": [
							"step",
							["to-number", ["get", "vmax"]],
							data["symbolColor"],
							80,
							data["symbolColor"],
						],
						"circle-radius": [
							"step",
							["to-number", ["get", "vmax"]],
							15,
							99,
							18,
						],
					},
				},
				speedTrapsVmax: {
					id: "speed-traps-vmax",
					type: "symbol",
					source: "clustertraps",
					filter: [
						"match",
						["get", "type_name"],
						"speed-trap",
						true,
						false,
					],
					layout: {
						"text-allow-overlap": true,
						"text-field": "{vmax}",
						"text-font": [
							"DIN Offc Pro Medium",
							"Arial Unicode MS Bold",
						],
						"text-size": 12,
					},
				},
				traps: {
					id: "traps",
					type: "symbol",
					source: "clustertraps",
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
							"icon-traffic-jam",
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
						"icon-size": [
							"interpolate",
							["linear"],
							["zoom"],
							0,
							0.4,
							8,
							0.8,
							10,
							1.2,
							14,
							1.6,
						],
					},
					paint: {
						"icon-color": data["symbolColor"],
						"icon-opacity": 0.8,
					},
				},
				clusterTraps: {
					id: "cluster-traps",
					type: "circle",
					source: "clustertraps",
					filter: ["has", "point_count"],
					paint: {
						"circle-opacity": 0.7,
						"circle-color": [
							"step",
							["get", "point_count"],
							data["clusterColor"],
							100,
							data["clusterColor"],
							750,
							data["clusterColor"],
						],
						"circle-radius": [
							"step",
							["get", "point_count"],
							12,
							9,
							15,
							99,
							18,
						],
					},
				},
				clusterTrapsCount: {
					id: "cluster-traps-count",
					type: "symbol",
					source: "clustertraps",
					filter: ["has", "point_count"],
					layout: {
						"text-allow-overlap": true,
						"text-field": "{point_count_abbreviated}",
						"text-font": [
							"DIN Offc Pro Medium",
							"Arial Unicode MS Bold",
						],
						"text-size": 12,
					},
				},
				lineTraps: {
					id: "line-traps",
					type: "line",
					source: "traps",
					filter: ["has", "linetrap"],
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
				},
				areaSurface: {
					id: "area-surface",
					type: "fill",
					source: "areasurface",
					paint: {
						"fill-color": data["polygonColor"],
						"fill-opacity": parseFloat(data["polygonOpacity"]),
					},
				},
				areaSurfaceBorder: {
					id: "area-surface-border",
					type: "line",
					source: "areasurface",
					paint: {
						"line-color": data["polygonBorderColor"],
						"line-width": parseFloat(data["polygonBorder"]),
					},
				},
				lineBackground: {
					id: "line-background",
					type: "line",
					source: "polys",
					paint: {
						"line-color": "red",
						"line-width": 6,
						"line-opacity": 0.4,
					},
				},
				lineDashed: {
					id: "line-dashed",
					type: "line",
					source: "polys",
					paint: {
						/* "line-color": "red", */
						"line-color": [
							"match",
							["get", "type"],
							"20",
							"red",
							"white",
						],
						"line-width": 6,
						"line-dasharray": [0, 4, 3],
					},
				},
				trafficClosure: {
					id: "traffic-closure",
					type: "symbol",
					source: "polys",
					filter: [
						"all",
						["==", "type", "closure"],
						["==", "$type", "Point"],
					],
					layout: {
						"icon-allow-overlap": true,
						"icon-image": "icon-traffic-closure",
						"icon-size": [
							"interpolate",
							["linear"],
							["zoom"],
							6,
							0.2,
							10,
							0.3,
							14,
							0.4,
						],
					},
					paint: {
						"icon-opacity": 0.7,
					},
				},
			};

			return mapStyles[key];
		},
		getTrapsBoxAsync: async function (collection) {
			const url = "http://ip-api.com/json?fields=lon,lat";
			let directionsBox;

			const square = (center, radius) => {
				const cross = Math.sqrt(2 * radius ** 2);
				const coordinates = [];

				for (let i = 0; i < 4; i++) {
					coordinates.push(
						turf.destination(center, cross, (i * -360) / 4 + 45, {})
							.geometry.coordinates,
					);
				}
				coordinates.push(coordinates[0]);

				return turf.polygon([coordinates], {});
			};

			if (!!!collection) {
				if (cache.has(url)) {
					directionsBox = cache.get(url);
				} else {
					const json = await fetch(url)
						.then((response) => response.json())
						.catch((err) =>
							console.log(
								`getTrapsBoxAsync() -> fetch(): url=${url} -> Error: ${err}`,
							),
						);

					const coord = Object.values(json);
					const box = turf.bbox(square(coord, 10));

					directionsBox = [
						[+box[1].toFixed(5), +box[0].toFixed(5)],
						[+box[3].toFixed(5), +box[2].toFixed(5)],
					];
					cache.set(url, directionsBox);
				}
			} else {
				directionsBox = turf.bbox(collection);
			}

			return directionsBox;
		},
		initAsync: async function (wid, view, data, style, type) {
			const $div = $(`#${wid}`);

			if (!$div.length) {
				setTimeout(function () {
					vis.binds["radar-trap"].mapbox.initAsync(
						wid,
						view,
						data,
						style,
						type,
					);
				}, 300);
				return;
			}

			if (!vis.binds["radar-trap"].isInstanceEnabled) {
				data.attr("isInstance", false);
				return;
			} else {
				data.attr("isInstance", true);
			} // no instance enabled

			/* $div.data("destroy", (widget, $widget) => {
				console.log("DESTROY WIDGET", widget, $widget);
			}); */

			const $mapbox = $div.find(`#mapbox_${wid}`);

			$mapbox.data("widgetData", data);

			if (type === "ROUTE") {
				if (!!data.attr("route")) {
					const routeId = data.attr("route").split("|")[1].trim();

					const {
						directionsFeatureCollection,
						trapsFeatureCollection,
					} = await vis.binds["radar-trap"].routesService.get(
						routeId,
						{
							query: { $select: ["directions"] },
						},
					);

					$mapbox.data("_id", routeId);
					$mapbox.data(
						"directionsFeatureCollection",
						directionsFeatureCollection,
					);
					$mapbox.data(
						"trapsFeatureCollection",
						trapsFeatureCollection,
					);
				} else {
					$mapbox.data("_id", null);
					$mapbox.data("directionsFeatureCollection", null);
					$mapbox.data("trapsFeatureCollection", null);
				}
			}

			if (type === "AREA") {
				if (!!data.attr("area")) {
					const areaId = data.attr("area").split("|")[1].trim();

					const {
						areaPolygons,
						trapsFeatureCollection,
						polysFeatureCollection,
					} = await vis.binds["radar-trap"].areasService.get(areaId, {
						query: {
							$select: [
								"areaPolygons",
								"areaTraps",
								"polysFeatureCollection",
							],
						},
					});

					$mapbox.data("_id", areaId);
					$mapbox.data(
						"areaPolygonsFeatureCollection",
						turf.featureCollection(Object.values(areaPolygons))
							.features[0],
					);
					$mapbox.data(
						"trapsFeatureCollection",
						trapsFeatureCollection,
					);
					$mapbox.data(
						"polysFeatureCollection",
						polysFeatureCollection,
					);
				} else {
					$mapbox.data("_id", null);
					$mapbox.data("areaPolygonsFeatureCollection", null);
					$mapbox.data("trapsFeatureCollection", null);
					$mapbox.data("polysFeatureCollection", null);
				}
			}

			if (type === "AREA" && !!$mapbox.data("trapsFeatureCollection")) {
				const result = turf.featureReduce(
					$mapbox.data("trapsFeatureCollection"),
					(features, feature) => {
						if (
							Boolean(
								data.attr(
									feature.properties["trapInfo"].typeName,
								),
							)
						)
							features.push(feature);

						return features;
					},
					[],
				);

				$mapbox.data(
					"trapsFeatureCollection",
					turf.featureCollection(result),
				);
			}

			$mapbox.data(
				"map",
				await vis.binds["radar-trap"].mapbox.showmapAsync(
					`mapbox_${wid}`,
					$mapbox,
					data,
					type,
				),
			);
		},
		showmapAsync: async function (divId, $mapbox, data, type) {
			if (!!!data.attr("styleSelect")) {
				setTimeout(() => {
					vis.binds["radar-trap"].mapbox.showmapAsync(
						divId,
						$mapbox,
						data,
						type,
					);
				}, 100);

				return;
			}

			if (type === "ROUTE") {
				$mapbox.data(
					"trapsBox",
					await vis.binds["radar-trap"].mapbox.getTrapsBoxAsync(
						$mapbox.data("directionsFeatureCollection"),
					),
				);
			} else if (type === "AREA") {
				$mapbox.data(
					"trapsBox",
					await vis.binds["radar-trap"].mapbox.getTrapsBoxAsync(
						$mapbox.data("areaPolygonsFeatureCollection"),
					),
				);
			}

			$mapbox
				.css("border-radius", $mapbox.parent().css("border-radius"))
				.css("overflow", "hidden");

			const map = new mapboxgl.Map({
				logoPosition: "bottom-right",
				attributionControl: false,
				accessToken:
					vis.binds["radar-trap"].native.settings.mbxAccessToken,
				container: divId,
				style: `mapbox://styles/mapbox/${data.attr("styleSelect")}`,
				bounds: $mapbox.data("trapsBox"),
				fitBoundsOptions: { padding: 10 },
			});

			const scale = new mapboxgl.ScaleControl({
				maxWidth: 80,
				unit: "metric",
			});
			map.addControl(scale);

			if (!vis.editMode && data.attr("fitButton")) {
				$(`#mapbox_button_${data.attr("wid")}`).on(
					"click",
					function () {
						map.fitBounds($mapbox.data("trapsBox"), {
							padding: 10,
						});
					},
				);
			}

			if (!data.attr("fitButton")) {
				$(`#mapbox_button_${data.attr("wid")}`).addClass(
					"radar-trap-button-hidden",
				);
			}

			let doFit = true;
			map.on("resize", () => {
				if (doFit) {
					map.fitBounds($mapbox.data("trapsBox"), {
						padding: 10,
					});

					doFit = false;
					setTimeout(() => (doFit = true), 50);
				}
			});

			(!!data.attr("route") || !!data.attr("area")) &&
				map.on("load", () => {
					[
						"icon-fixed-trap",
						"icon-mobile-trap",
						"icon-traffic-jam",
						"icon-road-work",
						"icon-accident",
						"icon-object",
						"icon-sleekness",
						"icon-fog",
						"icon-police-news",
						"icon-traffic-closure",
					].forEach((image) => {
						if (!map.hasImage(image)) {
							map.loadImage(
								`http://${vis.binds["radar-trap"].url.hostname}:8082/vis/widgets/radar-trap/img/mapbox/map-icons/${image}.png`,
								(error, mapimage) => {
									if (error) throw error;

									map.addImage(image, mapimage, {
										sdf:
											image !== "icon-traffic-closure"
												? true
												: false,
									});
								},
							);
						}
					});

					if (type === "AREA") {
						if (Boolean(data.attr("closed-congested-road"))) {
							map.addSource("polys", {
								type: "geojson",
								data: $mapbox.data("polysFeatureCollection"),
							});
							map.addLayer(
								vis.binds["radar-trap"].mapbox.getMapStyle(
									"lineBackground",
									data,
								),
							);
							map.addLayer(
								vis.binds["radar-trap"].mapbox.getMapStyle(
									"lineDashed",
									data,
								),
							);
							map.addLayer(
								vis.binds["radar-trap"].mapbox.getMapStyle(
									"trafficClosure",
									data,
								),
							);

							if (
								Boolean(
									data.attr("animate-closed-congested-road"),
								)
							) {
								const dashArraySequence = [
									[0, 4, 3],
									[0.5, 4, 2.5],
									[1, 4, 2],
									[1.5, 4, 1.5],
									[2, 4, 1],
									[2.5, 4, 0.5],
									[3, 4, 0],
									[0, 0.5, 3, 3.5],
									[0, 1, 3, 3],
									[0, 1.5, 3, 2.5],
									[0, 2, 3, 2],
									[0, 2.5, 3, 1.5],
									[0, 3, 3, 1],
									[0, 3.5, 3, 0.5],
								];

								let step = 0;

								function animateDashArray(timestamp) {
									// Update line-dasharray using the next value in dashArraySequence. The
									// divisor in the expression `timestamp / 50` controls the animation speed.
									const newStep = parseInt(
										(timestamp / 50) %
											dashArraySequence.length,
									);

									if (newStep !== step) {
										map.setPaintProperty(
											"line-dashed",
											"line-dasharray",
											dashArraySequence[step],
										);
										step = newStep;
									}

									// Request the next frame of the animation.
									requestAnimationFrame(animateDashArray);
								}

								// start the animation
								animateDashArray(0);
							}
						}

						if (Boolean(data.attr("showPolygon"))) {
							map.addSource("areasurface", {
								type: "geojson",
								data: $mapbox.data(
									"areaPolygonsFeatureCollection",
								),
							});
							map.addLayer(
								vis.binds["radar-trap"].mapbox.getMapStyle(
									"areaSurface",
									data,
								),
							);
							map.addLayer(
								vis.binds["radar-trap"].mapbox.getMapStyle(
									"areaSurfaceBorder",
									data,
								),
							);
						}
					}

					if (type === "ROUTE") {
						map.addSource("route", {
							type: "geojson",
							data: $mapbox.data("directionsFeatureCollection"),
						});
						map.addLayer(
							vis.binds["radar-trap"].mapbox.getMapStyle(
								"route",
								data,
							),
						);
					}

					map.addSource("traps", {
						type: "geojson",
						data: $mapbox.data("trapsFeatureCollection"),
					});
					map.addLayer(
						vis.binds["radar-trap"].mapbox.getMapStyle(
							"lineTraps",
							data,
						),
					);

					map.addSource("clustertraps", {
						type: "geojson",
						data: $mapbox.data("trapsFeatureCollection"),
						cluster: Boolean(data.attr("showCluster")),
						clusterMaxZoom: 14,
						clusterRadius: 50,
					});
					map.addLayer(
						vis.binds["radar-trap"].mapbox.getMapStyle(
							"traps",
							data,
						),
					);
					map.addLayer(
						vis.binds["radar-trap"].mapbox.getMapStyle(
							"speedTraps",
							data,
						),
					);
					map.addLayer(
						vis.binds["radar-trap"].mapbox.getMapStyle(
							"speedTrapsVmax",
							data,
						),
					);

					if (Boolean(data.attr("showCluster"))) {
						map.addLayer(
							vis.binds["radar-trap"].mapbox.getMapStyle(
								"clusterTraps",
								data,
							),
						);
						map.addLayer(
							vis.binds["radar-trap"].mapbox.getMapStyle(
								"clusterTrapsCount",
								data,
							),
						);
					}

					map.getStyle().layers.forEach((layer) => {
						if (layer.id.indexOf("-label") > 0) {
							map.setLayoutProperty(layer.id, "text-field", [
								"coalesce",
								[
									"get",
									`name_${vis.binds["radar-trap"].language}`,
								],
								["get", "name"],
							]);
						}
					});

					if (!vis.editMode) {
						const popup = new mapboxgl.Popup({
							closeButton: false,
							closeOnClick: false,
						});

						map.on(
							"mouseenter",
							["traps", "speed-traps"],
							(event) => {
								map.getCanvas().style.cursor = "pointer";
								const feature =
									event.features && event.features[0];

								const coordinates =
									feature.geometry.coordinates.slice();
								while (
									Math.abs(
										event.lngLat.lng - coordinates[0],
									) > 180
								) {
									coordinates[0] +=
										event.lngLat.lng > coordinates[0]
											? 360
											: -360;
								}

								const trapInfo = JSON.parse(
									feature.properties.trapInfo,
								);

								popup
									.setLngLat(coordinates)
									.setHTML(
										`<div>
										<div><b>${trapInfo.typeText}</b></div>
										<div>${
											trapInfo.vmax
												? `Höchstgeschwindigkeit: ${trapInfo.vmax} km/h`
												: ""
										}</div>
										<div>${trapInfo.reason ? `Grund: ${trapInfo.reason}` : ""}</div>
										<div>${trapInfo.length ? `Staulänge: ${trapInfo.length} km` : ""}</div>
										<div>${trapInfo.duration ? `Dauer: ${trapInfo.duration} min.` : ""}</div>
										<div>${trapInfo.delay ? `Verzögerung: ${trapInfo.delay} min.` : ""}</div>
										<div>${trapInfo.createDate ? `gemeldet: ${trapInfo.createDate}` : ""}</div>
										<div>${trapInfo.confirmDate ? `bestätigt: ${trapInfo.confirmDate}` : ""}</div>
										<div>${trapInfo.state ? `Bundesland: ${trapInfo.state}` : ""}</div>
										<div>${trapInfo.street ? `Straße: ${trapInfo.street}` : ""}</div>
										<div>${
											trapInfo.zipCode && trapInfo.city
												? `Ort: ${trapInfo.zipCode} ${trapInfo.city}`
												: ""
										}</div>
										<div>${trapInfo.cityDistrict ? `Stadtteil: ${trapInfo.cityDistrict}` : ""}</div>
									</div>`,
									)
									.addTo(map);
							},
						);

						map.on("mouseenter", ["traffic-closure"], (event) => {
							map.getCanvas().style.cursor = "pointer";

							console.log("traffic-closure");

							const feature = event.features && event.features[0];

							const coordinates =
								feature.geometry.coordinates.slice();
							while (
								Math.abs(event.lngLat.lng - coordinates[0]) >
								180
							) {
								coordinates[0] +=
									event.lngLat.lng > coordinates[0]
										? 360
										: -360;
							}

							const address = JSON.parse(
								feature.properties.address,
							);

							const trapInfo = {
								typeText: "Verkehrssperrung",
								country: address.country,
								zipCode: address.zip,
								city: address.city,
								street: address.street,
							};

							popup
								.setLngLat(coordinates)
								.setHTML(
									`<div>
									<div><b>${trapInfo.typeText}</b></div>									
									<div>${trapInfo.country ? `Land: ${trapInfo.country}` : ""}</div>
									<div>${trapInfo.street ? `Straße: ${trapInfo.street}` : ""}</div>
									<div>${
										trapInfo.zipCode && trapInfo.city
											? `Ort: ${trapInfo.zipCode} ${trapInfo.city}`
											: ""
									}</div>									
								</div>`,
								)
								.addTo(map);
						});

						map.on(
							"mouseleave",
							["traps", "speed-traps", "traffic-closure"],
							() => {
								map.getCanvas().style.cursor = "";
								popup.remove();
							},
						);
					}

					if (!vis.editMode && Boolean(data.attr("showCluster"))) {
						map.on("click", "cluster-traps", (event) => {
							const feature = event.features && event.features[0];
							if (!feature) return;

							const clusterId = feature.properties.cluster_id;
							const sourceId = feature.source;

							const mapboxSource = map.getSource(sourceId);

							mapboxSource.getClusterExpansionZoom(
								clusterId,
								(err, zoom) => {
									if (err) return;

									map.easeTo({
										center: feature.geometry.coordinates,
										zoom: zoom,
									});
								},
							);
						});

						map.on("mouseenter", "cluster-traps", () => {
							map.getCanvas().style.cursor = "pointer";
						});
						map.on("mouseleave", "cluster-traps", () => {
							map.getCanvas().style.cursor = "";
						});
					}
				});

			return map;
		},
		updateMapAsync: async function ($mapbox, type) {
			const map = $mapbox.data("map");

			if (type === "AREA" && !!$mapbox.data("trapsFeatureCollection")) {
				const result = turf.featureReduce(
					$mapbox.data("trapsFeatureCollection"),
					(features, feature) => {
						if (
							Boolean(
								$mapbox
									.data("widgetData")
									.attr(
										feature.properties["trapInfo"].typeName,
									),
							)
						)
							features.push(feature);

						return features;
					},
					[],
				);

				$mapbox.data(
					"trapsFeatureCollection",
					turf.featureCollection(result),
				);
			}

			map.getSource("traps").setData(
				$mapbox.data("trapsFeatureCollection"),
			);
			map.getSource("clustertraps").setData(
				$mapbox.data("trapsFeatureCollection"),
			);

			let collection = null;
			if (type === "AREA") {
				map.getSource("polys").setData(
					$mapbox.data("polysFeatureCollection"),
				);

				collection = $mapbox.data("areaPolygonsFeatureCollection");
				map.getSource("areasurface").setData(collection);
			}

			if (type === "ROUTE") {
				collection = $mapbox.data("directionsFeatureCollection");
				map.getSource("route").setData(collection);
			}

			const trapsBox = await vis.binds[
				"radar-trap"
			].mapbox.getTrapsBoxAsync(collection);
			map.fitBounds(trapsBox, { padding: 20 });

			$mapbox.data("trapsBox", trapsBox);
		},
	},
	trapsInfo: {
		bindListClickEventHandler: function ($div) {
			$div.find("li").each(function () {
				$(this).bind("click", () => {
					Object.entries(vis.views[vis.activeView].widgets).forEach(
						([key, { tpl, data: widgetData }]) => {
							if (
								tpl !== "tplMapboxArea" &&
								tpl !== "tplMapboxRoute"
							)
								return;

							const areaOrRouteId = (
								widgetData["area"] || widgetData["route"]
							)
								.split("|")[1]
								.trim();

							if (
								$(this).data("areaorrouteId") === areaOrRouteId
							) {
								const map = $(`#mapbox_${key}`).data("map");

								map.jumpTo({
									center: $(this).data("position"),
									zoom: 15,
								});
							}
						},
					);
				});
			});
		},
		initAsync: async function (wid, view, data, style) {
			if (!vis.binds["radar-trap"].isInstanceEnabled) {
				data.attr("isInstance", false);
				return;
			} else {
				data.attr("isInstance", true);
			} // no instance enabled

			if (!!!data.attr("areaorroute")) return;

			const $div = $(`#${wid}`);

			if (!$div.length) {
				setTimeout(function () {
					vis.binds["radar-trap"].trapsInfo.initAsync(
						wid,
						view,
						data,
						style,
					);
				}, 100);
				return;
			}

			const $trapsinfo = $div.find(`#trapsinfo_${wid}`);
			$trapsinfo.data("wid", wid);

			data.attr("mapImages", {
				accident: "icon-accident.png",
				"fixed-trap": "icon-fixed-trap.png",
				"speed-trap": "icon-speed-trap.png",
				fog: "icon-fog.png",
				"mobile-trap": "icon-mobile-trap.png",
				object: "icon-object.png",
				"road-work": "icon-road-work.png",
				sleekness: "icon-sleekness.png",
				"traffic-jam": "icon-traffic-jam.png",
				"police-news": "icon-police-news.png",
			});

			const areaOrRouteId = data.attr("areaorroute").split("|")[1].trim();
			let result = await vis.binds["radar-trap"].routesService
				.get(areaOrRouteId, {
					query: { $select: ["directions"] },
				})
				.catch(() => {
					return;
				});

			if (!!!result) {
				result = await vis.binds["radar-trap"].areasService.get(
					areaOrRouteId,
					{
						query: { $select: ["areaTraps"] },
					},
				);
			}

			const { trapsFeatureCollection } = result;

			const trapsFeature = trapsFeatureCollection.features.filter(
				(feature) => feature.properties.trapInfo !== null,
			);

			const trapsFeatureGroups = trapsFeature.reduce(
				(groups, trapFeature) => {
					groups[trapFeature.properties.type_name].push(trapFeature);
					return groups;
				},
				{
					"fixed-trap": [],
					"mobile-trap": [],
					"speed-trap": [],
					"road-work": [],
					"traffic-jam": [],
					sleekness: [],
					accident: [],
					fog: [],
					object: [],
					"police-news": [],
				},
			);
			data.attr("trapsFeatureGroups", trapsFeatureGroups);

			vis.binds["radar-trap"].trapsInfo.bindListClickEventHandler($div);
		},
	},
};

vis.binds["radar-trap"].showVersion();
vis.binds["radar-trap"].initRadarTrap();
//# sourceMappingURL=radar-trap.js.map
