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
var import_area = __toESM(require("@turf/area"));
var import_bbox = __toESM(require("@turf/bbox"));
var import_bbox_polygon = __toESM(require("@turf/bbox-polygon"));
var import_boolean_contains = __toESM(require("@turf/boolean-contains"));
var import_boolean_overlap = __toESM(require("@turf/boolean-overlap"));
var import_helpers = require("@turf/helpers");
var import_points_within_polygon = __toESM(require("@turf/points-within-polygon"));
var import_square = __toESM(require("@turf/square"));
var import_square_grid = __toESM(require("@turf/square-grid"));
var import_determineTrapTypes = require("../../lib/atudo/determineTrapTypes");
var import_traps = require("../../lib/atudo/traps");
var import_Scheduler = require("../../lib/Scheduler");
var import_polyline = __toESM(require("@mapbox/polyline"));
var import_meta = require("@turf/meta");
var import_transform_scale = __toESM(require("@turf/transform-scale"));
var import_console = __toESM(require("console"));
const patchOrCreateArea = () => {
  return async (context) => {
    const startTime = performance.now();
    const { data, service, params } = context;
    const { _id } = data;
    data.timestamp = (/* @__PURE__ */ new Date()).toString();
    import_Scheduler.Scheduler.pause(_id);
    service.emit("status", { _id: data._id, status: "loading" });
    const [record] = await service.find({
      query: { _id },
      paginate: false
    });
    if (params.patchSourceFromClient || params.patchSourceFromServer) {
      const areaPolygon = Object.values(data.areaPolygons)[0];
      const areaBox = (0, import_bbox.default)(areaPolygon);
      const squareBox = (0, import_square.default)(areaBox);
      const squareBoxPolygon = (0, import_transform_scale.default)((0, import_bbox_polygon.default)(squareBox), 1.3);
      const sideLength = Math.sqrt((0, import_area.default)(squareBoxPolygon)) / 1e3;
      let sideLengthDivisor = 0;
      if (sideLength > 3e3) {
        sideLengthDivisor = 80;
      } else if (sideLength > 1500) {
        sideLengthDivisor = 60;
      } else if (sideLength > 900) {
        sideLengthDivisor = 25;
      } else if (sideLength > 500) {
        sideLengthDivisor = 15;
      } else if (sideLength > 100) {
        sideLengthDivisor = 10;
      } else {
        sideLengthDivisor = 10;
      }
      const squareBoxGrid = (0, import_square_grid.default)((0, import_bbox.default)(squareBoxPolygon), sideLength / sideLengthDivisor);
      const reducedSquareBoxGrid = (0, import_helpers.featureCollection)(
        squareBoxGrid.features.filter((feature2) => {
          return (0, import_boolean_overlap.default)(areaPolygon, feature2) || (0, import_boolean_contains.default)(areaPolygon, feature2);
        })
      );
      let resultTraps = [];
      let resultPolyPoints = [];
      let resultPolyLines = [];
      for (const feature2 of reducedSquareBoxGrid.features) {
        const tmpBbox = (0, import_bbox.default)(feature2);
        const { polyPoints, trapPoints: gridTraps } = await (0, import_traps.traps)(
          {
            lng: tmpBbox[0],
            lat: tmpBbox[1]
          },
          {
            lng: tmpBbox[2],
            lat: tmpBbox[3]
          }
        );
        if (gridTraps.length > 499)
          import_console.default.log("gridTraps >>>", gridTraps.length);
        resultTraps = resultTraps.concat(gridTraps);
        resultPolyPoints = resultPolyPoints.concat(polyPoints);
      }
      resultTraps = (0, import_points_within_polygon.default)((0, import_helpers.featureCollection)(resultTraps), areaPolygon).features;
      resultPolyPoints = (0, import_points_within_polygon.default)((0, import_helpers.featureCollection)(resultPolyPoints), areaPolygon).features;
      resultTraps = (0, import_determineTrapTypes.determineTrapTypes)(resultTraps);
      const endTime = performance.now();
      import_console.default.log(`patchOrCreateArea() dauerte: ${(endTime - startTime) / 1e3} Sekunden`);
      data.areaTraps = resultTraps;
      resultPolyLines = (0, import_meta.featureReduce)(
        (0, import_helpers.featureCollection)(resultPolyPoints),
        (features, tmpFeature) => {
          features.push(tmpFeature);
          features.push(
            (0, import_helpers.feature)(import_polyline.default.toGeoJSON(tmpFeature.properties.polyline), {
              ...tmpFeature.properties
            })
          );
          return features;
        },
        []
      );
      data.polysFeatureCollection = (0, import_helpers.featureCollection)(resultPolyLines);
    }
    if (record !== void 0) {
      context.result = await service.patch(_id, data, {
        ...params,
        publishEvent: false
      });
      return context;
    }
    return context;
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  patchOrCreateArea
});
//# sourceMappingURL=patchOrCreateArea.js.map
