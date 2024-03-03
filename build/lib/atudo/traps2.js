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
var traps2_exports = {};
__export(traps2_exports, {
  traps2: () => traps2
});
module.exports = __toCommonJS(traps2_exports);
var import_helpers = require("@turf/helpers");
var import_cross_fetch = require("cross-fetch");
var import_value = require("@sinclair/typebox/value");
var import_atudoPoiSchema = require("../schemas/atudoPoiSchema");
var import_atudoPolySchema = require("../schemas/atudoPolySchema");
async function request(url, config = {}) {
  const response = await (0, import_cross_fetch.fetch)(url, config);
  return response.json();
}
const trapBase = "0,1,2,3,4,5,6,20,21,22,23,24,25,29,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,ts,vwd";
const traps2 = async (minPos, maxPos) => {
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
      if (poly.type === "sc") {
        return list;
      }
      if (poly.type === "closure") {
        list.push((0, import_helpers.point)([+poly.pos.lng, +poly.pos.lat], { ...poly }));
      }
      if (poly.type === "20") {
        list.push((0, import_helpers.point)([+poly.showdelay_pos.lng, +poly.showdelay_pos.lat], { ...poly }));
      }
      return list;
    }, []);
    const poiPoints = pois.reduce((list, poi) => {
      const trapPoint = (0, import_helpers.point)([+poi.lng, +poi.lat], { ...poi });
      list.push(trapPoint);
      return list;
    }, []);
    return { poiPoints, polyPoints };
  } catch (error) {
    console.error("traps: ", error);
    return { poiPoints: [], polyPoints: [] };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  traps2
});
//# sourceMappingURL=traps2.js.map
