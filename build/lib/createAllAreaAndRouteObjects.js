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
var createAllAreaAndRouteObjects_exports = {};
__export(createAllAreaAndRouteObjects_exports, {
  createAllAreaAndRouteObjects: () => createAllAreaAndRouteObjects
});
module.exports = __toCommonJS(createAllAreaAndRouteObjects_exports);
var import_createAreaObjects = require("./createAreaObjects");
var import_createRouteObjects = require("./createRouteObjects");
const createAllAreaAndRouteObjects = async (that, feathers) => {
  const routes = await feathers.service("routes").find({
    query: {
      $limit: -1,
      $select: ["_id", "timestamp", "description", "activeProfile", "directions"]
    }
  });
  const areas = await feathers.service("areas").find({
    query: {
      $limit: -1,
      $select: [
        "_id",
        "timestamp",
        "description",
        "areaTraps",
        "areaTrapsEstablished",
        "areaTrapsNew",
        "areaTrapsRejected"
      ]
    }
  });
  for (const routeData of routes) {
    await (0, import_createRouteObjects.createRouteObjects)(that, routeData);
  }
  for (const areaData of areas) {
    await (0, import_createAreaObjects.createAreaObjects)(that, areaData);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAllAreaAndRouteObjects
});
//# sourceMappingURL=createAllAreaAndRouteObjects.js.map
