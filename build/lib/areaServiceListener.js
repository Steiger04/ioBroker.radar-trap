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
var areaServiceListener_exports = {};
__export(areaServiceListener_exports, {
  areaServiceListener: () => areaServiceListener
});
module.exports = __toCommonJS(areaServiceListener_exports);
var import_createAreaObjects = require("./createAreaObjects");
var import_Scheduler = require("./Scheduler");
const areaServiceListener = (that, feathers) => {
  feathers.service("areas").on("status", async (statusWithId) => {
    import_Scheduler.Scheduler.setStatus(statusWithId);
  });
  feathers.service("areas").on("removed", async (area) => {
    await that.deleteDeviceAsync(area._id);
    import_Scheduler.Scheduler.delete(area._id);
  });
  feathers.service("areas").on("created", async (area, ctx) => {
    if (!ctx.params.patchSourceFromServer) {
      const areaData = {
        _id: area._id,
        cron: area.cron,
        areaPolygons: area.areaPolygons
      };
      import_Scheduler.Scheduler.schedule(areaData, "AREA");
    }
    await (0, import_createAreaObjects.createAreaObjects)(that, area);
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  areaServiceListener
});
//# sourceMappingURL=areaServiceListener.js.map
