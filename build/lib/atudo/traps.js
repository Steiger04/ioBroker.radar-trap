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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var traps_exports = {};
__export(traps_exports, {
  traps: () => traps
});
module.exports = __toCommonJS(traps_exports);
var import_helpers = require("@turf/helpers");
var import_cross_fetch = require("cross-fetch");
var import_value = require("@sinclair/typebox/value");
var import_atudoPoiSchema = require("../schemas/atudoPoiSchema");
var import_atudoPolySchema = require("../schemas/atudoPolySchema");
var import_turf = require("@turf/turf");
var import_polyline = __toESM(require("@mapbox/polyline"));
async function request(url, config = {}) {
  const response = await (0, import_cross_fetch.fetch)(url, config);
  return response.json();
}
const trapBase = "0,1,2,3,4,5,6,20,21,22,23,24,25,29,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,ts,vwd";
const traps = async (minPos, maxPos) => {
  try {
    const { pois } = await request(
      `https://cdn2.atudo.net/api/4.0/pois.php?type=${trapBase}&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`
    );
    import_value.Value.Default(import_atudoPoiSchema.atudoPoisSchema, pois);
    if (!import_value.Value.Check(import_atudoPoiSchema.atudoPoisSchema, pois))
      console.log("POIS SCHEMA ERRORS >>>", [...import_value.Value.Errors(import_atudoPoiSchema.atudoPoisSchema, pois)]);
    const { polys } = await request(
      `https://cdn2.atudo.net/api/4.0/polylines.php?type=traffic&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`
    );
    import_value.Value.Default(import_atudoPolySchema.atudoPolysSchema, polys);
    if (!import_value.Value.Check(import_atudoPolySchema.atudoPolysSchema, polys))
      console.log("POLYS SCHEMA ERRORS >>>", [...import_value.Value.Errors(import_atudoPolySchema.atudoPolysSchema, polys)]);
    const polyPoints = polys.reduce((list, poly) => {
      if (poly.type === "sc")
        return list;
      if (poly.type === "closure") {
        list.push((0, import_helpers.point)([+poly.pos.lng, +poly.pos.lat], { ...poly }));
      }
      if (poly.type === "20") {
        list.push((0, import_helpers.point)([+poly.showdelay_pos.lng, +poly.showdelay_pos.lat], { ...poly }));
      }
      return list;
    }, []);
    const poiPoints = pois.reduce((list, poi) => {
      list.push((0, import_helpers.point)([+poi.lng, +poi.lat], { ...poi }));
      return list;
    }, []);
    const polyLines = polys.reduce((list, poly) => {
      list.push((0, import_turf.feature)(import_polyline.default.toGeoJSON(poly.polyline), { ...poly }));
      return list;
    }, []);
    return { poiPoints, polyPoints, polyLines };
  } catch (error) {
    console.error("traps: ", error);
    return { poiPoints: [], polyPoints: [], polyLines: [] };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  traps
});
//# sourceMappingURL=traps.js.map
