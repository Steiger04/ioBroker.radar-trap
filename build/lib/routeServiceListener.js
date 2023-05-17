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
var routeServiceListener_exports = {};
__export(routeServiceListener_exports, {
  routeServiceListener: () => routeServiceListener
});
module.exports = __toCommonJS(routeServiceListener_exports);
var import_createRouteObjects = require("./createRouteObjects");
var import_Scheduler = require("./Scheduler");
const routeServiceListener = (that, feathers) => {
  feathers.service("routes").on("status", async (statusWithId) => {
    import_Scheduler.Scheduler.setStatus(statusWithId);
  });
  feathers.service("routes").on("removed", async (route) => {
    await that.deleteDeviceAsync(route._id);
    import_Scheduler.Scheduler.delete(route._id);
  });
  feathers.service("routes").on("created", async (route, ctx) => {
    if (!ctx.params.patchSourceFromServer) {
      const routeData = {
        _id: route._id,
        src: route.src,
        dst: route.dst,
        activeProfile: route.activeProfile,
        maxTrapDistance: route.maxTrapDistance,
        cron: route.cron
      };
      import_Scheduler.Scheduler.schedule(routeData, "ROUTE");
    }
    await (0, import_createRouteObjects.createRouteObjects)(that, route);
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  routeServiceListener
});
//# sourceMappingURL=routeServiceListener.js.map
