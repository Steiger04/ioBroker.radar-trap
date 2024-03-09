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
var routeTrapsWithTrapInfo_exports = {};
__export(routeTrapsWithTrapInfo_exports, {
  routeTrapsWithTrapInfo: () => routeTrapsWithTrapInfo
});
module.exports = __toCommonJS(routeTrapsWithTrapInfo_exports);
var import_polyline = __toESM(require("@mapbox/polyline"));
var import_helpers = require("@turf/helpers");
var import_lodash = require("lodash");
var import_addTrapInfoToTrapProperties = require("./addTrapInfoToTrapProperties");
const routeTrapsWithTrapInfo = (data) => {
  if (data.directions === void 0) {
    return;
  }
  data.directions = data.directions.map((rec) => {
    const directionFeature = (0, import_helpers.feature)(import_polyline.default.toGeoJSON(rec.direction.geometry));
    rec.direction.directionFeature = directionFeature;
    if (rec.routeTrapsNew !== void 0)
      (0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(rec.routeTrapsNew);
    if (rec.routeTrapsEstablished !== void 0)
      (0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(rec.routeTrapsEstablished);
    if (rec.routeTrapsRejected !== void 0)
      (0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(rec.routeTrapsRejected);
    return rec;
  });
  const directionsFeatureCollection = (0, import_helpers.featureCollection)(
    data.directions.map((rec) => rec.direction.directionFeature)
  );
  data.directionsFeatureCollection = directionsFeatureCollection;
  const polyLinesFeatureCollection = (0, import_helpers.featureCollection)(
    data.directions.flatMap((rec) => rec.polyLineFeatures)
  );
  data.polyLinesFeatureCollection = polyLinesFeatureCollection;
  let allTraps = data.directions.flatMap(({ routeTraps }) => (0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(routeTraps));
  allTraps = (0, import_lodash.uniqWith)(allTraps, (a, b) => {
    if (a.properties.schemaType === "POI" && b.properties.schemaType === "POI") {
      if (!a.properties.linetrap && !b.properties.linetrap && a.properties.lat === b.properties.lat && a.properties.lng === b.properties.lng) {
        return true;
      }
      if (a.properties.linetrap && b.properties.linetrap && a.properties.lat === b.properties.lat && a.properties.lng === b.properties.lng) {
        return true;
      }
    }
    return false;
  });
  data.trapsFeatureCollection = (0, import_helpers.featureCollection)(allTraps);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  routeTrapsWithTrapInfo
});
//# sourceMappingURL=routeTrapsWithTrapInfo.js.map
