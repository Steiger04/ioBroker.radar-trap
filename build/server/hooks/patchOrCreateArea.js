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
var patchOrCreateArea_exports = {};
__export(patchOrCreateArea_exports, {
  patchOrCreateArea: () => patchOrCreateArea
});
module.exports = __toCommonJS(patchOrCreateArea_exports);
var import_helpers = require("@turf/helpers");
var import_determineTrapTypes = require("../../lib/atudo/determineTrapTypes");
var import_Scheduler = require("../../lib/Scheduler");
var import_trapsChain = require("./trapsChain");
var import_turf = require("@turf/turf");
var import_polyline = __toESM(require("@mapbox/polyline"));
var import_getPoiPolyPointsAsync = __toESM(require("../../lib/getPoiPolyPointsAsync"));
const patchOrCreateArea = () => {
  return async (context) => {
    var _a;
    const startTime = performance.now();
    const { data, service, params } = context;
    const { _id } = data;
    data.timestamp = (/* @__PURE__ */ new Date()).toString();
    import_Scheduler.Scheduler.pause(_id);
    service.emit("status", { _id: data._id, status: "loading" });
    const [record] = await service.find({
      query: { _id, $select: ["areaTraps", "polysFeatureCollection"] },
      paginate: false
    });
    if (params.patchSourceFromClient || params.patchSourceFromServer) {
      const areaPolygon = Object.values(data.areaPolygons)[0];
      let { resultPoiPoints, resultPolyPoints, resultPolyLines } = await (0, import_getPoiPolyPointsAsync.default)({
        analyzedFeature: areaPolygon,
        type: import_getPoiPolyPointsAsync.AnalyzedType.POLYGONE
      });
      console.log("resultPoiPoints >>>", resultPoiPoints.length);
      console.log("resultPolyPoints >>>", resultPolyPoints.length);
      console.log("resultPolyLines >>>", resultPolyLines.length);
      let resultPolys = [];
      resultPolys = (0, import_turf.featureReduce)(
        (0, import_helpers.featureCollection)(resultPolyPoints),
        (features, currentFeature) => {
          if (currentFeature.properties.type === "closure") {
            features.push(currentFeature);
            if (currentFeature.properties.polyline !== "") {
              features.push(
                (0, import_turf.feature)(
                  import_polyline.default.toGeoJSON(currentFeature.properties.polyline),
                  {
                    ...currentFeature.properties,
                    type: "120"
                  }
                )
              );
            }
          }
          if (currentFeature.properties.type === "20") {
            if (currentFeature.properties.polyline !== "") {
              features.push(
                (0, import_turf.feature)(
                  import_polyline.default.toGeoJSON(currentFeature.properties.polyline),
                  {
                    ...currentFeature.properties,
                    type: "120"
                  }
                )
              );
            }
          }
          return features;
        },
        []
      );
      const { traps: allPolys } = (0, import_trapsChain.trapsChain)(
        { allPolys: ((_a = record == null ? void 0 : record.polysFeatureCollection) == null ? void 0 : _a.features) || [] },
        { allPolys: resultPolys }
      );
      data.polysFeatureCollection = (0, import_helpers.featureCollection)(allPolys.allPolys);
      const resultTypeTraps = (0, import_determineTrapTypes.determineTrapTypes)(resultPoiPoints);
      const {
        traps: areaTraps,
        newTrapsReduced,
        rejectedTrapsReduced
      } = (0, import_trapsChain.trapsChain)(record == null ? void 0 : record.areaTraps, resultTypeTraps);
      data.areaTraps = areaTraps;
      data.areaTrapsNew = newTrapsReduced;
      data.areaTrapsRejected = rejectedTrapsReduced;
    }
    if (record !== void 0) {
      context.result = await service.patch(_id, data, {
        ...params,
        publishEvent: false
      });
    }
    const endTime = performance.now();
    console.log(`patchOrCreateArea2() dauerte: ${(endTime - startTime) / 1e3} Sekunden`);
    return context;
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  patchOrCreateArea
});
//# sourceMappingURL=patchOrCreateArea.js.map
