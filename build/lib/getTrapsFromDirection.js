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
var getTrapsFromDirection_exports = {};
__export(getTrapsFromDirection_exports, {
  getTrapsFromDirection: () => getTrapsFromDirection
});
module.exports = __toCommonJS(getTrapsFromDirection_exports);
var import_polyline = __toESM(require("@mapbox/polyline"));
var import_along = __toESM(require("@turf/along"));
var import_destination = __toESM(require("@turf/destination"));
var import_helpers = require("@turf/helpers");
var import_length = __toESM(require("@turf/length"));
var import_point_to_line_distance = __toESM(require("@turf/point-to-line-distance"));
var import_lodash = require("lodash");
var import_determineTrapTypes = require("./atudo/determineTrapTypes");
var import_traps = require("./atudo/traps");
const getTrapsFromDirection = async ({
  direction,
  maxTrapDistance
}) => {
  const directionLine = (0, import_helpers.feature)(import_polyline.default.toGeoJSON(direction));
  let resultTraps = [];
  const directionSteps = Math.trunc((0, import_length.default)(directionLine) / 6);
  for (let i = 0; i <= directionSteps; i++) {
    const directionPoint = (0, import_along.default)(directionLine, i * 6, {
      units: "kilometers"
    });
    const minBox = (0, import_destination.default)(directionPoint, 4, -135, {
      units: "kilometers"
    });
    const maxBox = (0, import_destination.default)(directionPoint, 4, 45, {
      units: "kilometers"
    });
    const { trapPoints: clusterTraps } = await (0, import_traps.traps)(
      {
        lng: minBox.geometry.coordinates[0],
        lat: minBox.geometry.coordinates[1]
      },
      {
        lng: maxBox.geometry.coordinates[0],
        lat: maxBox.geometry.coordinates[1]
      }
    );
    if (clusterTraps.length > 499)
      console.log("clusterTraps >>>", clusterTraps.length);
    resultTraps = [...resultTraps, ...clusterTraps];
  }
  resultTraps = (0, import_lodash.uniqWith)(resultTraps, (trapA, trapB) => trapA.properties.content === trapB.properties.content);
  resultTraps = resultTraps.reduce((list, trapPoint) => {
    const trapDistance = (0, import_point_to_line_distance.default)(trapPoint, directionLine, {
      units: "meters"
    });
    if (trapDistance <= maxTrapDistance) {
      trapPoint.properties.distance = trapDistance;
      list.push(trapPoint);
    }
    return list;
  }, []);
  return (0, import_determineTrapTypes.determineTrapTypes)(resultTraps);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getTrapsFromDirection
});
//# sourceMappingURL=getTrapsFromDirection.js.map
