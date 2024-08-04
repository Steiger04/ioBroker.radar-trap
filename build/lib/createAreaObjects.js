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
  await that.setObjectAsync(`${area._id}.area-infos`, {
    type: "channel",
    common: { name: "Area Infos" },
    native: {}
  });
  await that.setObjectAsync(`${area._id}.area-infos.lastUpdated`, {
    type: "state",
    common: {
      name: "Last Updated",
      defAck: true,
      type: "string",
      role: "text",
      read: true,
      write: false
    },
    native: {}
  }).then(() => that.setState(`${area._id}.area-infos.lastUpdated`, `${area.timestamp}`, true));
  await that.setObjectAsync(`${area._id}.area-infos.description`, {
    type: "state",
    common: {
      name: "Description",
      defAck: true,
      type: "string",
      role: "text",
      read: true,
      write: false
    },
    native: {}
  }).then(() => that.setState(`${area._id}.area-infos.description`, `${area.description}`, true));
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
    await that.setObjectAsync(`${area._id}.${channelName}`, {
      type: "channel",
      common: { name: "Area" },
      native: {}
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
      await that.setObjectAsync(`${area._id}.${channelName}.${trapName}`, {
        type: "state",
        common: {
          name: that.I18n[trapName],
          defAck: true,
          type: "array",
          role: "list",
          read: true,
          write: false
        },
        native: {}
      }).then(
        () => that.setState(`${area._id}.${channelName}.${trapName}`, JSON.stringify(newTraps), true)
      );
      await that.setObjectAsync(`${area._id}.${channelName}.${trapName}Count`, {
        type: "state",
        common: {
          name: `${that.I18n["count"]}: ${that.I18n[trapName]}`,
          defAck: true,
          type: "number",
          role: "value",
          read: true,
          write: false
        },
        native: {}
      }).then(() => that.setState(`${area._id}.${channelName}.${trapName}Count`, newTraps.length, true));
    }
    await that.setObjectAsync(`${area._id}.area-infos.${trapType}Count`, {
      type: "state",
      common: {
        name: `${that.I18n["count"]}: ${channelName}`,
        defAck: true,
        type: "number",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    }).then(() => that.setState(`${area._id}.area-infos.${trapType}Count`, totalTrapsCount, true));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAreaObjects
});
//# sourceMappingURL=createAreaObjects.js.map
