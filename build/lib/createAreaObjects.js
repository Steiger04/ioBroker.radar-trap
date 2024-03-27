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
var createAreaObjects_exports = {};
__export(createAreaObjects_exports, {
  createAreaObjects: () => createAreaObjects
});
module.exports = __toCommonJS(createAreaObjects_exports);
var import_createCronJob = require("./createCronJob");
const createAreaObjects = async (that, area) => {
  await that.setObjectAsync(area._id, {
    type: "device",
    common: { name: area.description },
    native: { type: "AREA" }
  });
  await (0, import_createCronJob.createCronJobAsync)(that, area._id);
  await that.createChannelAsync(`${area._id}`, "area-infos", {
    name: "Area Infos"
  });
  await that.createStateAsync(`${area._id}`, "area-infos", "lastUpdated", {
    name: "Last Updated",
    defAck: true,
    read: true,
    write: false,
    type: "string",
    role: "text"
  }).then(() => that.setStateAsync(`${area._id}.area-infos.lastUpdated`, `${area.timestamp}`, true));
  await that.createStateAsync(`${area._id}`, "area-infos", "description", {
    name: "Description",
    defAck: true,
    read: true,
    write: false,
    type: "string",
    role: "text"
  }).then(() => that.setStateAsync(`${area._id}.area-infos.description`, `${area.description}`, true));
  for (const trapType of ["areaTraps", "areaTrapsEstablished", "areaTrapsNew", "areaTrapsRejected"]) {
    let totalTrapsCount = 0;
    let channelName = "";
    switch (trapType) {
      case "areaTraps":
        channelName = "area-current";
        break;
      case "areaTrapsNew":
        channelName = "area-new";
        break;
      case "areaTrapsRejected":
        channelName = "area-rejected";
        break;
      case "areaTrapsEstablished":
        channelName = "area-established";
        break;
      default:
        break;
    }
    await that.createChannelAsync(`${area._id}`, `${channelName}`, {
      name: "Area"
    });
    for (const [trapName, traps] of Object.entries(
      area[trapType]
    )) {
      const newTraps = traps.map((trap) => {
        var _a;
        return {
          type: trap.type,
          geometry: trap.geometry,
          properties: { ...(_a = trap.properties) == null ? void 0 : _a.trapInfo }
        };
      });
      totalTrapsCount += newTraps.length;
      await that.createStateAsync(`${area._id}`, `${channelName}`, `${trapName}`, {
        name: that.I18n[trapName],
        defAck: true,
        read: true,
        write: false,
        type: "array",
        role: "list"
      }).then(
        () => that.setStateAsync(`${area._id}.${channelName}.${trapName}`, JSON.stringify(newTraps), true)
      );
      await that.createStateAsync(`${area._id}`, `${channelName}`, `${trapName}Count`, {
        name: `${that.I18n["count"]}: ${that.I18n[trapName]}`,
        defAck: true,
        read: true,
        write: false,
        type: "number",
        role: "value"
      }).then(() => that.setStateAsync(`${area._id}.${channelName}.${trapName}Count`, newTraps.length, true));
    }
    await that.createStateAsync(`${area._id}`, "area-infos", `${trapType}Count`, {
      name: `${that.I18n["count"]}: ${channelName}`,
      defAck: true,
      read: true,
      write: false,
      type: "number",
      role: "value"
    }).then(() => that.setStateAsync(`${area._id}.area-infos.${trapType}Count`, totalTrapsCount, true));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAreaObjects
});
//# sourceMappingURL=createAreaObjects.js.map
