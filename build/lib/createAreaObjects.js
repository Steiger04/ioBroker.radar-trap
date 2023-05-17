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
  that.setObjectAsync(area._id, {
    type: "device",
    common: { name: area.description },
    native: { type: "AREA" }
  });
  await (0, import_createCronJob.createCronJobAsync)(that, area._id);
  await that.createChannelAsync(`${area._id}`, "area-infos", {
    name: "Area Infos"
  });
  await that.createStateAsync(`${area._id}`, "area-infos", "description", {
    name: "Description",
    defAck: true,
    read: true,
    write: false,
    type: "string",
    role: "text"
  }).then(
    async () => await that.setStateAsync(
      `${area._id}.area-infos.description`,
      `${area.description}`,
      true
    )
  );
  await that.createChannelAsync(`${area._id}`, "area", {
    name: "Area"
  });
  for (const [trapName, traps] of Object.entries(area.areaTraps)) {
    const newTraps = traps.map((trap) => {
      var _a;
      return {
        type: trap.type,
        geometry: trap.geometry,
        properties: { ...(_a = trap.properties) == null ? void 0 : _a.trapInfo }
      };
    });
    await that.createStateAsync(`${area._id}`, `area`, `${trapName}`, {
      name: `${trapName}`,
      defAck: true,
      read: true,
      write: false,
      type: "array",
      role: "list"
    }).then(
      async () => await that.setStateAsync(
        `${area._id}.area.${trapName}`,
        JSON.stringify(newTraps),
        true
      )
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAreaObjects
});
//# sourceMappingURL=createAreaObjects.js.map
