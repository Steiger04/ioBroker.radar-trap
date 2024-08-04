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
var createRouteObjects_exports = {};
__export(createRouteObjects_exports, {
  createRouteObjects: () => createRouteObjects
});
module.exports = __toCommonJS(createRouteObjects_exports);
var import_createCronJob = require("./createCronJob");
const createRouteObjects = async (that, route) => {
  var _a;
  await that.setObjectAsync(route._id, {
    type: "device",
    common: { name: route.description },
    native: { type: "ROUTE" }
  });
  await (0, import_createCronJob.createCronJobAsync)(that, route._id);
  (_a = route.directions) == null ? void 0 : _a.forEach(async (direction, idx) => {
    await that.setObjectAsync(`${route._id}.direction-${idx}-infos`, {
      type: "channel",
      common: { name: `Direction-${idx} Infos` },
      native: {}
    });
    await that.setObjectAsync(`${route._id}.direction-${idx}-infos.description.lastUpdated`, {
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
    }).then(() => that.setState(`${route._id}.direction-${idx}-infos.description.lastUpdated`, `${route.timestamp}`, true));
    await that.setObjectAsync(`${route._id}.direction-${idx}-infos.description`, {
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
    }).then(() => that.setState(`${route._id}.direction-${idx}-infos.description`, `${route.description}`, true));
    await that.setObjectAsync(`${route._id}.direction-${idx}-infos.profile`, {
      type: "state",
      common: {
        name: "Profile",
        defAck: true,
        type: "string",
        role: "text",
        read: true,
        write: false
      },
      native: {}
    }).then(() => that.setState(`${route._id}.direction-${idx}-infos.profile`, `${route.activeProfile.name}`, true));
    await that.setObjectAsync(`${route._id}.direction-${idx}-infos.exclusions`, {
      type: "state",
      common: {
        name: "Exclusions",
        defAck: true,
        type: "array",
        role: "list",
        read: true,
        write: false
      },
      native: {}
    }).then(() => that.setState(`${route._id}.direction-${idx}-infos.exclusions`, `${JSON.stringify(route.activeProfile.actualExclusion)}`, true));
    await that.setObjectAsync(`${route._id}.direction-${idx}-infos.duration`, {
      type: "state",
      common: {
        name: "Duration",
        unit: "s",
        defAck: true,
        type: "number",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    }).then(() => that.setState(`${route._id}.direction-${idx}-infos.duration`, Math.round(direction.direction.duration), true));
    await that.setObjectAsync(`${route._id}.direction-${idx}-infos.distance`, {
      type: "state",
      common: {
        name: "Distance",
        unit: "m",
        defAck: true,
        type: "number",
        role: "value",
        read: true,
        write: false
      },
      native: {}
    }).then(() => that.setState(`${route._id}.direction-${idx}-infos.distance`, Math.round(direction.direction.distance), true));
    for (const trapType of ["routeTraps", "routeTrapsEstablished", "routeTrapsNew", "routeTrapsRejected"]) {
      let totalTrapsCount = 0;
      let channelName = "";
      switch (trapType) {
        case "routeTraps":
          channelName = "route-current";
          break;
        case "routeTrapsNew":
          channelName = "route-new";
          break;
        case "routeTrapsRejected":
          channelName = "route-rejected";
          break;
        case "routeTrapsEstablished":
          channelName = "route-established";
          break;
        default:
          break;
      }
      await that.setObjectAsync(`${route._id}.direction-${idx}-${channelName}`, {
        type: "channel",
        common: { name: `Direction-${idx}` },
        native: {}
      });
      for (const [trapName, traps] of Object.entries(
        direction[trapType]
      )) {
        const newTraps = traps.map((trap) => {
          var _a2;
          return {
            type: trap.type,
            geometry: trap.geometry,
            properties: { ...(_a2 = trap.properties) == null ? void 0 : _a2.trapInfo }
          };
        });
        totalTrapsCount += newTraps.length;
        await that.setObjectAsync(`${route._id}.direction-${idx}-${channelName}.${trapName}`, {
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
        }).then(() => that.setState(`${route._id}.direction-${idx}-${channelName}.${trapName}`, JSON.stringify(newTraps), true));
        await that.setObjectAsync(`${route._id}.direction-${idx}-${channelName}.${trapName}Count`, {
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
        }).then(() => that.setState(`${route._id}.direction-${idx}-${channelName}.${trapName}Count`, newTraps.length, true));
      }
      await that.setObjectAsync(`${route._id}.direction-${idx}-infos.${trapType}Count`, {
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
      }).then(() => that.setState(`${route._id}.direction-${idx}-infos.${trapType}Count`, totalTrapsCount, true));
    }
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createRouteObjects
});
//# sourceMappingURL=createRouteObjects.js.map
