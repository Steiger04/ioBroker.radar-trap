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
var createCronJob_exports = {};
__export(createCronJob_exports, {
  createCronJobAsync: () => createCronJobAsync
});
module.exports = __toCommonJS(createCronJob_exports);
const createCronJobAsync = async (that, _id) => {
  await that.createChannelAsync(`${_id}`, "cron-job", {
    name: "Cron Job"
  });
  await that.createStateAsync(`${_id}`, "cron-job", "timer", {
    name: "Timer",
    unit: "s",
    defAck: true,
    read: true,
    write: false,
    type: "number",
    role: "value"
  }).then(
    async () => await that.setStateAsync(
      `${_id}.cron-job.timer`,
      0,
      true
    )
  );
  await that.createStateAsync(`${_id}`, "cron-job", "pause", {
    name: "Pause",
    defAck: true,
    def: false,
    read: false,
    write: true,
    type: "boolean",
    role: "button"
  });
  await that.createStateAsync(`${_id}`, "cron-job", "resume", {
    name: "Resume",
    defAck: true,
    def: false,
    read: false,
    write: true,
    type: "boolean",
    role: "button"
  });
  await that.createStateAsync(`${_id}`, "cron-job", "run", {
    name: "Run",
    defAck: true,
    def: false,
    read: false,
    write: true,
    type: "boolean",
    role: "button"
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createCronJobAsync
});
//# sourceMappingURL=createCronJob.js.map
