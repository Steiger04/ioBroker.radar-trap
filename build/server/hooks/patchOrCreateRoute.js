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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var patchOrCreateRoute_exports = {};
__export(patchOrCreateRoute_exports, {
  patchOrCreateRoute: () => patchOrCreateRoute
});
module.exports = __toCommonJS(patchOrCreateRoute_exports);
var import_directions = __toESM(require("@mapbox/mapbox-sdk/services/directions"));
var import_matrix = __toESM(require("@mapbox/mapbox-sdk/services/matrix"));
var import_perf_hooks = require("perf_hooks");
var import_getTrapsFromDirection = require("../../lib/getTrapsFromDirection");
var import_Scheduler = require("../../lib/Scheduler");
const patchOrCreateRoute = () => {
  let directionsService = null;
  let matrixService = null;
  return async (context) => {
    if (!directionsService) {
      directionsService = (0, import_directions.default)({
        accessToken: process.env.MAPBOX_TOKEN
      });
    }
    if (!matrixService) {
      matrixService = (0, import_matrix.default)({
        accessToken: process.env.MAPBOX_TOKEN
      });
    }
    const { data, service, params } = context;
    const { _id, activeProfile, maxTrapDistance } = data;
    import_Scheduler.Scheduler.pause(_id);
    service.emit("status", { _id: data._id, status: "loading" });
    const [record] = await service.find({
      query: { _id },
      paginate: false
    });
    if (params.patchSourceFromClient || params.patchSourceFromServer) {
      const matrix = await matrixService.getMatrix({
        points: [
          {
            coordinates: data.src.geometry.coordinates
          },
          {
            coordinates: data.dst.geometry.coordinates
          }
        ],
        sources: [0],
        profile: activeProfile.name,
        annotations: ["duration", "distance"]
      }).send().then((response) => response.body);
      console.log("matrix", matrix);
      const directions = await directionsService.getDirections({
        profile: activeProfile.name,
        exclude: activeProfile.actualExclusion.length > 0 ? activeProfile.actualExclusion.join(",") : void 0,
        overview: "full",
        alternatives: false,
        waypoints: [
          {
            coordinates: data.src.geometry.coordinates
          },
          {
            coordinates: data.dst.geometry.coordinates
          }
        ]
      }).send().then((response) => response.body).catch((ex) => {
        console.log("Error in directionsService.getDirections()", ex);
      });
      data.directions = [];
      for (const route of directions.routes) {
        try {
          const startTime = import_perf_hooks.performance.now();
          const traps = await (0, import_getTrapsFromDirection.getTrapsFromDirection)({
            direction: route.geometry,
            maxTrapDistance
          });
          const endTime = import_perf_hooks.performance.now();
          console.log(`getTrapsFrom() dauerte: ${(endTime - startTime) / 1e3} Sekunden`);
          route.duration = matrix.durations[0][1];
          data.directions.push({ direction: route, traps, matrix });
        } catch (error) {
          console.log(error);
        }
      }
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
  patchOrCreateRoute
});
//# sourceMappingURL=patchOrCreateRoute.js.map
