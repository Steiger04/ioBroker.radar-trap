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
var traps_exports = {};
__export(traps_exports, {
  traps: () => traps
});
module.exports = __toCommonJS(traps_exports);
var import_helpers = require("@turf/helpers");
var import_cross_fetch = require("cross-fetch");
const trapBase = "0,1,2,3,4,5,6,20,21,22,23,24,25,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,ts,vwd";
const traps = async (minPos, maxPos) => {
  const { pois } = await (0, import_cross_fetch.fetch)(
    `https://cdn3.atudo.net/api/4.0/pois.php?type=${trapBase}&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`
  ).then((res) => res.json()).catch((ex) => console.log(ex));
  const { polys } = await (0, import_cross_fetch.fetch)(
    `https://cdn3.atudo.net/api/4.0/polylines.php?type=traffic&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`
  ).then((res) => res.json()).catch((ex) => console.log(ex));
  const polyPoints = polys.reduce((list, poly) => {
    let polyPoint;
    if (poly.type === "sc")
      return list;
    if (poly.type === "closure") {
      polyPoint = (0, import_helpers.point)([+poly.pos.lng, +poly.pos.lat], {
        ...poly
      });
    } else {
      polyPoint = (0, import_helpers.point)([+poly.showdelay_pos.lng, +poly.showdelay_pos.lat], { ...poly });
    }
    list.push(polyPoint);
    return list;
  }, []);
  const trapPoints = pois.reduce((list, poi) => {
    const trapPoint = (0, import_helpers.point)([+poi.lng, +poi.lat]);
    trapPoint.properties = poi;
    list.push(trapPoint);
    return list;
  }, []);
  return { trapPoints, polyPoints };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  traps
});
//# sourceMappingURL=traps.js.map
