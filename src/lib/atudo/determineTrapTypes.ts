import polyline from "@mapbox/polyline";
import { Feature, feature, Point } from "@turf/helpers";
import { LineString } from "@turf/turf";

const type_text: Record<string, string> = {
	0: "unbekannt, mobil",
	1: "Geschwindigkeit, mobil",
	2: "Rotlicht, mobil",
	3: "Gewicht, mobil",
	4: "allg. Verkehrskontrolle, mobil",
	5: "Alkohol, mobil",
	6: "Abstand, mobil",
	7: "Geschwindigkeit, mobil",
	11: "Rotlicht, mobil",
	12: "Section Control, mobil",
	20: "Stauende, mobil",
	21: "Unfall, mobil",
	22: "Tagesbaustelle, mobil",
	23: "Hindernis, mobil",
	24: "Rutschgefahr, mobil",
	25: "Sichtbehinderung, mobil",
	26: "Dauerbaustelle, mobil",
	29: "Panne, mobil",
	101: "Abstandskontrolle, fest",
	102: "Attrappe, fest",
	103: "Auffahrtskontrolle, fest",
	104: "Busspurkontrolle, fest",
	105: "Einfahrtskontrolle, fest",
	106: "Fußgängerüberweg, fest",
	107: "Geschwindigkeit, fest",
	108: "Gewichtskontrolle, fest",
	109: "Höhenkontrolle, fest",
	110: "Kombiniert, fest",
	111: "Rotlicht, fest",
	112: "Section Control, fest",
	113: "Section Control Ende, fest",
	114: "Tunnel, fest",
	115: "Überholverbot, fest",
	2015: "Geschwindigkeit, Hotspot",
	vwd: "Meldung, Polizei",
	ts: "Geschwindigkeit, teilstationär", //nur Abfrage
};

const determineTrapTypes = (
	trapTypes: Feature<Point, radarTrap.Poi>[],
): Record<string, Feature<Point | LineString, radarTrap.Poi>[]> =>
	trapTypes.reduce(
		(list, resultTrap) => {
			if (
				resultTrap.properties.type === "1" &&
				(resultTrap.properties.info as radarTrap.PoiInfo).partly_fixed === "1"
			) {
				resultTrap.properties.type = "ts";
			}

			resultTrap.properties.type_text = type_text[resultTrap.properties.type];

			if (resultTrap.properties.polyline !== "") {
				resultTrap.properties.polyline = feature<LineString, radarTrap.Poi>(
					polyline.toGeoJSON(resultTrap.properties.polyline as string),
				);

				resultTrap.properties.polyline.properties.linetrap = true;
				console.log("resultTrap >>> linetrap", resultTrap.properties.polyline.properties.linetrap);

				// resultTrap.properties!.polyline.properties!.lat = resultTrap.properties!.lat;
				// resultTrap.properties!.polyline.properties!.lng = resultTrap.properties!.lng;
			}

			if (
				[
					"101",
					"102",
					"103",
					"104",
					"105",
					"106",
					"107",
					"108",
					"109",
					"110",
					"111",
					"112",
					"113",
					"114",
					"115",
				].includes(resultTrap.properties!.type)
			) {
				resultTrap.properties.type_name = "fixed-trap";
				list.fixedTraps.push(resultTrap);
			}

			if (["0", "1", "2", "3", "4", "5", "6"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "mobile-trap";
				list.mobileTraps.push(resultTrap);
			}

			if (["ts"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "speed-trap";
				list.speedTraps.push(resultTrap);
			}

			if (["22", "26"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "road-work";
				list.roadWorks.push(resultTrap);
			}

			if (["20"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "traffic-jam";
				list.trafficJams.push(resultTrap);
			}

			if (["21"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "accident";
				list.accidents.push(resultTrap);
			}

			if (["23"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "object";
				list.objects.push(resultTrap);
			}

			if (["24"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "sleekness";
				list.sleekness.push(resultTrap);
			}

			if (["25"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "fog";
				list.fog.push(resultTrap);
			}

			if (["29"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "defective-vehicle";
				list.fog.push(resultTrap);
			}

			if (["vwd"].includes(resultTrap.properties!.type)) {
				resultTrap.properties!.type_name = "police-news";
				list.policeNews.push(resultTrap);
			}

			return list;
		},
		{
			fixedTraps: [] as Feature<Point, radarTrap.Poi>[],
			mobileTraps: [] as Feature<Point, radarTrap.Poi>[],
			speedTraps: [] as Feature<Point, radarTrap.Poi>[],
			roadWorks: [] as Feature<Point, radarTrap.Poi>[],
			trafficJams: [] as Feature<Point, radarTrap.Poi>[],
			sleekness: [] as Feature<Point, radarTrap.Poi>[],
			accidents: [] as Feature<Point, radarTrap.Poi>[],
			fog: [] as Feature<Point, radarTrap.Poi>[],
			objects: [] as Feature<Point, radarTrap.Poi>[],
			policeNews: [] as Feature<Point, radarTrap.Poi>[],
		},
	);

export { determineTrapTypes };
