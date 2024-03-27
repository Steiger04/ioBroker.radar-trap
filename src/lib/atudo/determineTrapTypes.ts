import { Feature, Point } from "@turf/helpers";
import { LineString } from "@turf/turf";

const descriptions: Record<string, string> = {
	"22,26": "construction site", // Baustelle
	"20": "traffic jam end", // Stauende
	"21,23,24,25,29": "danger spot", // Gefahrenstelle
	"101,102,103,104,105,106,107,108,109,110,111,112,113,114,115": "fixed speed camera", // Blitzer fest
	ts: "semi-stationary speed camera", // Blitzer teilstationär
	"0,1,2,3,4,5,6": "mobile speed camera", // Blitzer mobil
	"2015": "mobile speed camera hotspot", // Mobiler Blitzer Hotspot
	vwd: "police report", // Polizeimeldung
	vwda: "police report, archive", // Polizeimeldung, Archiv
};

const type_text: Record<string, string> = {
	"0": "unknown", // unbekannt
	"1": "speed camera", // Geschwindigkeitsblitzer
	"2": "traffic light camera", // Ampelblitzer
	"3": "weight control", // Gewichtskontrolle
	"4": "general traffic control", // allg. Verkehrskontrolle
	"5": "alcohol control", // Alkoholkontrolle
	"6": "distance control", // Abstandskontrolle
	"7": "speed camera", // Geschwindigkeitsblitzer
	"11": "traffic light camera", // Ampelblitzer
	"12": "Section Control", // Section Control
	"20": "traffic jam end", // Stauende
	"21": "accident", // Unfall
	"22": "day construction site", // Tagesbaustelle
	"23": "obstacle", // Hindernis
	"24": "risk of slipping", // Rutschgefahr
	"25": "visual obstruction", // Sichtbehinderung
	"26": "permanent construction site", // Dauerbaustelle
	"29": "defective vehicle", // Defektes Fahrzeug
	"101": "distance control", // Abstandskontrolle
	"102": "dummy", // Attrappe
	"103": "ramp control", // Auffahrtskontrolle
	"104": "bus lane control", // Busspurkontrolle
	"105": "entry control", // Einfahrtskontrolle
	"106": "pedestrian crossing", // Fußgängerüberweg
	"107": "speed camera", // Geschwindigkeitsblitzer
	"108": "weight control", // Gewichtskontrolle
	"109": "height control", // Höhenkontrolle
	"110": "traffic light and speed camera", // Ampel- und Geschwindigkeitsblitzer
	"111": "traffic light camera", // Ampelblitzer
	"112": "Section Control", // Section Control
	"113": "section control end", // Section Control Ende
	"114": "speed camera in tunnel", // Blitzer im Tunnel
	"115": "no overtaking", // Überholverbot
	"201": "speed camera", // Geschwindigkeitsblitzer
	"206": "distance control", // Abstandskontrolle
	"2015": "mobile speed camera hotspot", // Mobiler Blitzer Hotspot
	vwd: "police report", // Polizeimeldung
	vwda: "police report, archive", // Polizeimeldung, Archiv
	ts: "speed camera, semi-stationary", // Geschwindigkeitsblitzer, teilstationär
};

const determineTrapTypes = (
	trapTypes: Feature<Point, radarTrap.Poi>[],
): Record<string, Feature<Point | LineString, radarTrap.Poi>[]> =>
	trapTypes.reduce(
		(list, resultTrap) => {
			if ((resultTrap.properties.info as radarTrap.PoiInfo)?.partly_fixed === "1") {
				resultTrap.properties.type = "ts";
			}

			resultTrap.properties.type_text = type_text[resultTrap.properties.type];
			resultTrap.properties.type_desc = Object.entries(descriptions).find(([key]) =>
				key.split(",").includes(resultTrap.properties.type),
			)?.[1];

			switch (resultTrap.properties.type) {
				case "0":
					resultTrap.properties.type_name = "unknown";
					list.unknown.push(resultTrap);
					break;
				case "1":
					resultTrap.properties.type_name = "speedCamera";
					list.speedCamera.push(resultTrap);
					break;
				case "2":
					resultTrap.properties.type_name = "trafficLightCamera";
					list.trafficLightCamera.push(resultTrap);
					break;
				case "3":
					resultTrap.properties.type_name = "weightControl";
					list.weightControl.push(resultTrap);
					break;
				case "4":
					resultTrap.properties.type_name = "generalTrafficControl";
					list.generalTrafficControl.push(resultTrap);
					break;
				case "5":
					resultTrap.properties.type_name = "alcoholControl";
					list.alcoholControl.push(resultTrap);
					break;
				case "6":
					resultTrap.properties.type_name = "distanceControl";
					list.distanceControl.push(resultTrap);
					break;
				case "7":
					resultTrap.properties.type_name = "speedCamera";
					list.speedCamera.push(resultTrap);
					break;
				case "11":
					resultTrap.properties.type_name = "trafficLightCamera";
					list.trafficLightCamera.push(resultTrap);
					break;
				case "12":
					resultTrap.properties.type_name = "sectionControl";
					list.sectionControl.push(resultTrap);
					break;
				case "20":
					resultTrap.properties.type_name = "trafficJamEnd";
					list.trafficJamEnd.push(resultTrap);
					break;
				case "21":
					resultTrap.properties.type_name = "accident";
					list.accident.push(resultTrap);
					break;
				case "22":
					resultTrap.properties.type_name = "dayConstructionSite";
					list.dayConstructionSite.push(resultTrap);
					break;
				case "23":
					resultTrap.properties.type_name = "obstacle";
					list.obstacle.push(resultTrap);
					break;
				case "24":
					resultTrap.properties.type_name = "riskOfSlipping";
					list.riskOfSlipping.push(resultTrap);
					break;
				case "25":
					resultTrap.properties.type_name = "visualObstruction";
					list.visualObstruction.push(resultTrap);
					break;
				case "26":
					resultTrap.properties.type_name = "permanentConstructionSite";
					list.permanentConstructionSite.push(resultTrap);
					break;
				case "29":
					resultTrap.properties.type_name = "defectiveVehicle";
					list.defectiveVehicle.push(resultTrap);
					break;
				case "101":
					resultTrap.properties.type_name = "distanceControl";
					list.distanceControl.push(resultTrap);
					break;
				case "102":
					resultTrap.properties.type_name = "dummy";
					list.dummy.push(resultTrap);
					break;
				case "103":
					resultTrap.properties.type_name = "rampControl";
					list.rampControl.push(resultTrap);
					break;
				case "104":
					resultTrap.properties.type_name = "busLaneControl";
					list.busLaneControl.push(resultTrap);
					break;
				case "105":
					resultTrap.properties.type_name = "entryControl";
					list.entryControl.push(resultTrap);
					break;
				case "106":
					resultTrap.properties.type_name = "pedestrianCrossing";
					list.pedestrianCrossing.push(resultTrap);
					break;
				case "107":
					resultTrap.properties.type_name = "speedCamera";
					list.speedCamera.push(resultTrap);
					break;
				case "108":
					resultTrap.properties.type_name = "weightControl";
					list.weightControl.push(resultTrap);
					break;
				case "109":
					resultTrap.properties.type_name = "heightControl";
					list.heightControl.push(resultTrap);
					break;
				case "110":
					resultTrap.properties.type_name = "trafficLightAndSpeedCamera";
					list.trafficLightAndSpeedCamera.push(resultTrap);
					break;
				case "111":
					resultTrap.properties.type_name = "trafficLightCamera";
					list.trafficLightCamera.push(resultTrap);
					break;
				case "112":
					resultTrap.properties.type_name = "sectionControl";
					list.sectionControl.push(resultTrap);
					break;
				case "113":
					resultTrap.properties.type_name = "sectionControlEnd";
					list.sectionControlEnd.push(resultTrap);
					break;
				case "114":
					resultTrap.properties.type_name = "speedCameraInTunnel";
					list.speedCameraInTunnel.push(resultTrap);
					break;
				case "115":
					resultTrap.properties.type_name = "noOvertaking";
					list.noOvertaking.push(resultTrap);
					break;
				case "201":
					resultTrap.properties.type_name = "speedCamera";
					list.speedCamera.push(resultTrap);
					break;
				case "206":
					resultTrap.properties.type_name = "distanceControl";
					list.distanceControl.push(resultTrap);
					break;
				case "2015":
					resultTrap.properties.type_name = "mobileSpeedCameraHotspot";
					list.mobileSpeedCameraHotspot.push(resultTrap);
					break;
				case "vwd":
					resultTrap.properties.type_name = "policeReport";
					list.policeReport.push(resultTrap);
					break;
				case "vwda":
					resultTrap.properties.type_name = "policeReportArchive";
					list.policeReportArchive.push(resultTrap);
					break;
				case "ts":
					resultTrap.properties.type_name = "semiStationarySpeedCamera";
					list.semiStationarySpeedCamera.push(resultTrap);
					break;

				default:
					break;
			}

			return list;
		},
		{
			unknown: [] as Feature<Point, radarTrap.Poi>[], // unknown
			speedCamera: [] as Feature<Point, radarTrap.Poi>[], // speed camera
			trafficLightCamera: [] as Feature<Point, radarTrap.Poi>[], // traffic light camera
			weightControl: [] as Feature<Point, radarTrap.Poi>[], // weight control
			generalTrafficControl: [] as Feature<Point, radarTrap.Poi>[], // general traffic control
			alcoholControl: [] as Feature<Point, radarTrap.Poi>[], // alcohol control
			distanceControl: [] as Feature<Point, radarTrap.Poi>[], // distance control
			sectionControl: [] as Feature<Point, radarTrap.Poi>[], // section control
			trafficJamEnd: [] as Feature<Point, radarTrap.Poi>[], // traffic jam end
			accident: [] as Feature<Point, radarTrap.Poi>[], // accident
			dayConstructionSite: [] as Feature<Point, radarTrap.Poi>[], // day construction site
			obstacle: [] as Feature<Point, radarTrap.Poi>[], // obstacle
			riskOfSlipping: [] as Feature<Point, radarTrap.Poi>[], // risk of slipping
			visualObstruction: [] as Feature<Point, radarTrap.Poi>[], // visual obstruction
			permanentConstructionSite: [] as Feature<Point, radarTrap.Poi>[], // permanent construction site
			defectiveVehicle: [] as Feature<Point, radarTrap.Poi>[], // defective vehicle
			dummy: [] as Feature<Point, radarTrap.Poi>[], // dummy
			rampControl: [] as Feature<Point, radarTrap.Poi>[], // ramp control
			busLaneControl: [] as Feature<Point, radarTrap.Poi>[], // bus lane control
			entryControl: [] as Feature<Point, radarTrap.Poi>[], // entry control
			pedestrianCrossing: [] as Feature<Point, radarTrap.Poi>[], // pedestrian crossing
			heightControl: [] as Feature<Point, radarTrap.Poi>[], // height control
			trafficLightAndSpeedCamera: [] as Feature<Point, radarTrap.Poi>[], // traffic light and speed camera
			sectionControlEnd: [] as Feature<Point, radarTrap.Poi>[], // section control end
			speedCameraInTunnel: [] as Feature<Point, radarTrap.Poi>[], // speed camera in tunnel
			noOvertaking: [] as Feature<Point, radarTrap.Poi>[], // no overtaking
			mobileSpeedCameraHotspot: [] as Feature<Point, radarTrap.Poi>[], // mobile speed camera hotspot
			policeReport: [] as Feature<Point, radarTrap.Poi>[], // police report
			policeReportArchive: [] as Feature<Point, radarTrap.Poi>[], // police report, archive
			semiStationarySpeedCamera: [] as Feature<Point, radarTrap.Poi>[], // semi-stationary speed camera
		},
	);

export { determineTrapTypes };
