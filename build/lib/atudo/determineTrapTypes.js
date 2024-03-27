"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var determineTrapTypes_exports = {};
__export(determineTrapTypes_exports, {
  determineTrapTypes: () => determineTrapTypes
});
module.exports = __toCommonJS(determineTrapTypes_exports);
const descriptions = {
  "22,26": "construction site",
  // Baustelle
  "20": "traffic jam end",
  // Stauende
  "21,23,24,25,29": "danger spot",
  // Gefahrenstelle
  "101,102,103,104,105,106,107,108,109,110,111,112,113,114,115": "fixed speed camera",
  // Blitzer fest
  ts: "semi-stationary speed camera",
  // Blitzer teilstationär
  "0,1,2,3,4,5,6": "mobile speed camera",
  // Blitzer mobil
  "2015": "mobile speed camera hotspot",
  // Mobiler Blitzer Hotspot
  vwd: "police report",
  // Polizeimeldung
  vwda: "police report, archive"
  // Polizeimeldung, Archiv
};
const type_text = {
  "0": "unknown",
  // unbekannt
  "1": "speed camera",
  // Geschwindigkeitsblitzer
  "2": "traffic light camera",
  // Ampelblitzer
  "3": "weight control",
  // Gewichtskontrolle
  "4": "general traffic control",
  // allg. Verkehrskontrolle
  "5": "alcohol control",
  // Alkoholkontrolle
  "6": "distance control",
  // Abstandskontrolle
  "7": "speed camera",
  // Geschwindigkeitsblitzer
  "11": "traffic light camera",
  // Ampelblitzer
  "12": "Section Control",
  // Section Control
  "20": "traffic jam end",
  // Stauende
  "21": "accident",
  // Unfall
  "22": "day construction site",
  // Tagesbaustelle
  "23": "obstacle",
  // Hindernis
  "24": "risk of slipping",
  // Rutschgefahr
  "25": "visual obstruction",
  // Sichtbehinderung
  "26": "permanent construction site",
  // Dauerbaustelle
  "29": "defective vehicle",
  // Defektes Fahrzeug
  "101": "distance control",
  // Abstandskontrolle
  "102": "dummy",
  // Attrappe
  "103": "ramp control",
  // Auffahrtskontrolle
  "104": "bus lane control",
  // Busspurkontrolle
  "105": "entry control",
  // Einfahrtskontrolle
  "106": "pedestrian crossing",
  // Fußgängerüberweg
  "107": "speed camera",
  // Geschwindigkeitsblitzer
  "108": "weight control",
  // Gewichtskontrolle
  "109": "height control",
  // Höhenkontrolle
  "110": "traffic light and speed camera",
  // Ampel- und Geschwindigkeitsblitzer
  "111": "traffic light camera",
  // Ampelblitzer
  "112": "Section Control",
  // Section Control
  "113": "section control end",
  // Section Control Ende
  "114": "speed camera in tunnel",
  // Blitzer im Tunnel
  "115": "no overtaking",
  // Überholverbot
  "201": "speed camera",
  // Geschwindigkeitsblitzer
  "206": "distance control",
  // Abstandskontrolle
  "2015": "mobile speed camera hotspot",
  // Mobiler Blitzer Hotspot
  vwd: "police report",
  // Polizeimeldung
  vwda: "police report, archive",
  // Polizeimeldung, Archiv
  ts: "speed camera, semi-stationary"
  // Geschwindigkeitsblitzer, teilstationär
};
const determineTrapTypes = (trapTypes) => trapTypes.reduce(
  (list, resultTrap) => {
    var _a, _b;
    if (((_a = resultTrap.properties.info) == null ? void 0 : _a.partly_fixed) === "1") {
      resultTrap.properties.type = "ts";
    }
    resultTrap.properties.type_text = type_text[resultTrap.properties.type];
    resultTrap.properties.type_desc = (_b = Object.entries(descriptions).find(
      ([key]) => key.split(",").includes(resultTrap.properties.type)
    )) == null ? void 0 : _b[1];
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
    unknown: [],
    // unknown
    speedCamera: [],
    // speed camera
    trafficLightCamera: [],
    // traffic light camera
    weightControl: [],
    // weight control
    generalTrafficControl: [],
    // general traffic control
    alcoholControl: [],
    // alcohol control
    distanceControl: [],
    // distance control
    sectionControl: [],
    // section control
    trafficJamEnd: [],
    // traffic jam end
    accident: [],
    // accident
    dayConstructionSite: [],
    // day construction site
    obstacle: [],
    // obstacle
    riskOfSlipping: [],
    // risk of slipping
    visualObstruction: [],
    // visual obstruction
    permanentConstructionSite: [],
    // permanent construction site
    defectiveVehicle: [],
    // defective vehicle
    dummy: [],
    // dummy
    rampControl: [],
    // ramp control
    busLaneControl: [],
    // bus lane control
    entryControl: [],
    // entry control
    pedestrianCrossing: [],
    // pedestrian crossing
    heightControl: [],
    // height control
    trafficLightAndSpeedCamera: [],
    // traffic light and speed camera
    sectionControlEnd: [],
    // section control end
    speedCameraInTunnel: [],
    // speed camera in tunnel
    noOvertaking: [],
    // no overtaking
    mobileSpeedCameraHotspot: [],
    // mobile speed camera hotspot
    policeReport: [],
    // police report
    policeReportArchive: [],
    // police report, archive
    semiStationarySpeedCamera: []
    // semi-stationary speed camera
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  determineTrapTypes
});
//# sourceMappingURL=determineTrapTypes.js.map
