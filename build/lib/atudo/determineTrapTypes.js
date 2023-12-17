"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var determineTrapTypes_exports = {};
__export(determineTrapTypes_exports, {
  determineTrapTypes: () => determineTrapTypes
});
module.exports = __toCommonJS(determineTrapTypes_exports);
var import_polyline = __toESM(require("@mapbox/polyline"));
var import_helpers = require("@turf/helpers");
const type_text = {
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
  101: "Abstandskontrolle, fest",
  102: "Attrappe, fest",
  103: "Auffahrtskontrolle, fest",
  104: "Busspurkontrolle, fest",
  105: "Einfahrtskontrolle, fest",
  106: "Fu\xDFg\xE4nger\xFCberweg, fest",
  107: "Geschwindigkeit, fest",
  110: "Kombiniert, fest",
  111: "Rotlicht, fest",
  108: "Gewichtskontrolle, fest",
  109: "H\xF6henkontrolle, fest",
  112: "Section Control, fest",
  113: "Section Control Ende, fest",
  114: "Tunnel, fest",
  115: "\xDCberholverbot, fest",
  vwd: "Meldung, Polizei",
  ts: "Geschwindigkeit, teilstation\xE4r"
};
const determineTrapTypes = (trapTypes) => trapTypes.reduce(
  (list, resultTrap) => {
    if (resultTrap.properties.type === "1" && resultTrap.properties.info.partly_fixed === "1") {
      resultTrap.properties.type = "ts";
    }
    resultTrap.properties.type_text = type_text[resultTrap.properties.type];
    if (resultTrap.properties.polyline !== "") {
      resultTrap.properties.polyline = (0, import_helpers.feature)(
        import_polyline.default.toGeoJSON(resultTrap.properties.polyline)
      );
      resultTrap.properties.polyline.properties.linetrap = true;
      resultTrap.properties.polyline.properties.lat = resultTrap.properties.lat;
      resultTrap.properties.polyline.properties.lng = resultTrap.properties.lng;
    }
    if ([
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
      "115"
    ].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "fixed-trap";
      list.fixedTraps.push(resultTrap);
    }
    if (["0", "1", "2", "3", "4", "5", "6"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "mobile-trap";
      list.mobileTraps.push(resultTrap);
    }
    if (["ts"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "speed-trap";
      list.speedTraps.push(resultTrap);
    }
    if (["22", "26"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "road-work";
      list.roadWorks.push(resultTrap);
    }
    if (["20"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "traffic-jam";
      list.trafficJams.push(resultTrap);
    }
    if (["21"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "accident";
      list.accidents.push(resultTrap);
    }
    if (["23"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "object";
      list.objects.push(resultTrap);
    }
    if (["24"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "sleekness";
      list.sleekness.push(resultTrap);
    }
    if (["25"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "fog";
      list.fog.push(resultTrap);
    }
    if (["vwd"].includes(resultTrap.properties.type)) {
      resultTrap.properties.type_name = "police-news";
      list.policeNews.push(resultTrap);
    }
    return list;
  },
  {
    fixedTraps: [],
    mobileTraps: [],
    speedTraps: [],
    roadWorks: [],
    trafficJams: [],
    sleekness: [],
    accidents: [],
    fog: [],
    objects: [],
    policeNews: []
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  determineTrapTypes
});
//# sourceMappingURL=determineTrapTypes.js.map
