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
  await that.setObjectAsync(`${_id}.cron-job`, {
    type: "channel",
    common: { name: "Cron Job" },
    native: {}
  });
  await that.setObjectAsync(`${_id}.cron-job.timer`, {
    type: "state",
    common: {
      name: "Timer",
      unit: "s",
      defAck: true,
      read: true,
      write: false,
      type: "number",
      role: "value"
    },
    native: {}
  }).then(() => that.setState(`${_id}.cron-job.timer`, 0, true));
  await that.setObjectAsync(`${_id}.cron-job.pause`, {
    type: "state",
    common: {
      name: "Pause",
      defAck: true,
      read: false,
      write: true,
      type: "boolean",
      role: "button"
    },
    native: {}
  }).then(() => that.setState(`${_id}.cron-job.pause`, false, true));
  await that.setObjectAsync(`${_id}.cron-job.resume`, {
    type: "state",
    common: {
      name: "Resume",
      defAck: true,
      read: false,
      write: true,
      type: "boolean",
      role: "button"
    },
    native: {}
  }).then(() => that.setState(`${_id}.cron-job.resume`, false, true));
  await that.setObjectAsync(`${_id}.cron-job.run`, {
    type: "state",
    common: {
      name: "Run",
      defAck: true,
      read: false,
      write: true,
      type: "boolean",
      role: "button"
    },
    native: {}
  }).then(() => that.setState(`${_id}.cron-job.run`, false, true));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createCronJobAsync
});
//# sourceMappingURL=createCronJob.js.map
