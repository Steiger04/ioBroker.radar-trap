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
var getPoiPolyPointsAsync_exports = {};
__export(getPoiPolyPointsAsync_exports, {
  AnalyzedType: () => AnalyzedType,
  default: () => getPoiPolyPointsAsync_default
});
module.exports = __toCommonJS(getPoiPolyPointsAsync_exports);
var import_turf = require("@turf/turf");
var import_getDevisor = require("./getDevisor");
var import_traps2 = require("./atudo/traps2");
var AnalyzedType = /* @__PURE__ */ ((AnalyzedType2) => {
  AnalyzedType2[AnalyzedType2["POLYGONE"] = 0] = "POLYGONE";
  AnalyzedType2[AnalyzedType2["LINESTRING"] = 1] = "LINESTRING";
  return AnalyzedType2;
})(AnalyzedType || {});
const getPoiPolyPointsAsync = async (analyzedFeature, type) => {
  const analyzedBbox = (0, import_turf.bbox)(analyzedFeature);
  const analyzedBox = (0, import_turf.bboxPolygon)(analyzedBbox);
  const sideLength = Math.sqrt((0, import_turf.area)(analyzedBox)) / 1e3;
  console.log("sideLength >>>", sideLength);
  const sideLengthDivisor = (0, import_getDevisor.getDevisor)(sideLength);
  console.log("sideLengthDivisor >>>", sideLengthDivisor);
  const cellWidth = sideLength / sideLengthDivisor;
  let bufferedBbox;
  switch (type) {
    case 0 /* POLYGONE */:
      bufferedBbox = (0, import_turf.bbox)((0, import_turf.buffer)(analyzedFeature, cellWidth, { units: "kilometers" }));
      break;
    case 1 /* LINESTRING */:
      bufferedBbox = (0, import_turf.bbox)((0, import_turf.buffer)(analyzedBox, cellWidth, { units: "kilometers" }));
      break;
    default:
      throw new Error("Invalid type in getPoiPolyPointsAsync");
  }
  const squareBoxGrid = (0, import_turf.squareGrid)(bufferedBbox, cellWidth);
  console.log("squareBoxGrid >>>", squareBoxGrid.features.length);
  const squareBoxGridReduced = squareBoxGrid.features.filter((feature) => !(0, import_turf.booleanDisjoint)(feature, analyzedFeature));
  console.log("squareBoxGridReduced >>>", squareBoxGridReduced.length);
  let resultPoiPoints = [];
  let resultPolyPoints = [];
  for (const feature of squareBoxGridReduced) {
    const tmpBbox = (0, import_turf.bbox)(feature);
    const { polyPoints, poiPoints } = await (0, import_traps2.traps2)(
      {
        lng: tmpBbox[0],
        lat: tmpBbox[1]
      },
      {
        lng: tmpBbox[2],
        lat: tmpBbox[3]
      }
    );
    console.log("poiPoints >>>", poiPoints.length);
    if (poiPoints.length > 499)
      console.log("gridTraps >>>", poiPoints.length);
    resultPolyPoints = resultPolyPoints.concat(polyPoints);
    resultPoiPoints = resultPoiPoints.concat(poiPoints);
  }
  return { resultPoiPoints, resultPolyPoints };
};
var getPoiPolyPointsAsync_default = getPoiPolyPointsAsync;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyzedType
});
//# sourceMappingURL=getPoiPolyPointsAsync.js.map
