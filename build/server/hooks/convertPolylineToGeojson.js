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
var convertPolylineToGeojson_exports = {};
__export(convertPolylineToGeojson_exports, {
  convertPolylineToGeojson: () => convertPolylineToGeojson
});
module.exports = __toCommonJS(convertPolylineToGeojson_exports);
var import_polyline = __toESM(require("@mapbox/polyline"));
var import_helpers = require("@turf/helpers");
var import_lodash = require("lodash");
var import_prepareTraps = require("./prepareTraps");
const convertPolylineToGeojson = (data) => {
  if (data.directions === void 0) {
    return;
  }
  data.directions = data.directions.map((rec) => {
    const directionFeature = (0, import_helpers.feature)(
      import_polyline.default.toGeoJSON(rec.direction.geometry)
    );
    rec.direction.directionFeature = directionFeature;
    return rec;
  });
  const directionsFeatureCollection = (0, import_helpers.featureCollection)(
    data.directions.map((rec) => rec.direction.directionFeature)
  );
  data.directionsFeatureCollection = directionsFeatureCollection;
  let allTraps = data.directions.flatMap(({ traps }) => (0, import_prepareTraps.prepareTraps)(traps));
  allTraps = (0, import_lodash.uniqWith)(allTraps, (a, b) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!((_a = a.properties) == null ? void 0 : _a.linetrap) && !((_b = b.properties) == null ? void 0 : _b.linetrap) && ((_c = a.properties) == null ? void 0 : _c.lat) === ((_d = b.properties) == null ? void 0 : _d.lat) && ((_e = a.properties) == null ? void 0 : _e.lng) === ((_f = b.properties) == null ? void 0 : _f.lng)) {
      return true;
    }
    if (((_g = a.properties) == null ? void 0 : _g.linetrap) && ((_h = b.properties) == null ? void 0 : _h.linetrap) && a.properties.lat === b.properties.lat && a.properties.lng === b.properties.lng) {
      return true;
    }
    return false;
  });
  const trapsFeatureCollection = (0, import_helpers.featureCollection)(allTraps);
  data.trapsFeatureCollection = trapsFeatureCollection;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertPolylineToGeojson
});
//# sourceMappingURL=convertPolylineToGeojson.js.map
