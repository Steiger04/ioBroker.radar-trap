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
var Scheduler_exports = {};
__export(Scheduler_exports, {
  Scheduler: () => Scheduler
});
module.exports = __toCommonJS(Scheduler_exports);
var import_croner = require("croner");
var import_createFeathers = require("../server/createFeathers");
class Scheduler {
  static #scheduleMap = /* @__PURE__ */ new Map();
  static #areasService = import_createFeathers.feathers.service("areas");
  static #routesService = import_createFeathers.feathers.service("routes");
  static #adapter;
  constructor(data, type) {
    const { _id: id, cron: pattern } = data;
    this._status = "idle";
    this.dataType = type;
    this.data = data;
    this.cronJob = new import_croner.Cron(pattern.trim(), () => {
      if (false)
        console.log(`Cron-Job with id ${id} and pattern ${pattern.trim()} scheduled`);
      Scheduler.run(id);
    });
    this.interval = setInterval(() => {
      Scheduler.#adapter.setStateAsync(`${id}.cron-job.timer`, this.next, true).catch((ex) => console.log(ex));
    }, 1e3);
    if (false)
      console.log(`Cron-Job with id ${id} and pattern ${pattern.trim()} created.`);
  }
  get next() {
    const next = this.cronJob.msToNext();
    if (next !== null) {
      return Math.floor(next / 1e3);
    }
    return null;
  }
  get cronJobIsRunning() {
    return this.cronJob.isRunning();
  }
  get status() {
    return this._status;
  }
  set status(status) {
    this._status = status;
  }
  static setStatus(statusWithId) {
    const { _id, status } = statusWithId;
    const _schedule = Scheduler.getSchedule(_id);
    if (Boolean(!_id) || Boolean(!_schedule)) {
      return;
    }
    _schedule.status = status;
  }
  static addThat(adapter) {
    Scheduler.#adapter = adapter;
  }
  static getSchedule(id) {
    return Scheduler.#scheduleMap.get(id);
  }
  static schedule(data, type) {
    const { _id: id } = data;
    Scheduler.delete(id);
    Scheduler.#scheduleMap.set(id, new this(data, type));
    if (false)
      console.log(`Scheduled with id: ${id}`);
  }
  static async scheduleAll() {
    const routes = await Scheduler.#routesService.find({
      query: {
        $limit: -1,
        $select: ["_id", "src", "dst", "activeProfile", "maxTrapDistance", "cron"]
      }
    });
    const areas = await Scheduler.#areasService.find({
      query: {
        $limit: -1,
        $select: ["_id", "cron", "areaPolygons"]
      }
    });
    for (const routeData of routes) {
      Scheduler.schedule(routeData, "ROUTE");
    }
    for (const areaData of areas) {
      Scheduler.schedule(areaData, "AREA");
    }
  }
  static delete(id) {
    if (!Scheduler.#scheduleMap.has(id)) {
      return;
    }
    const _schedule = Scheduler.#scheduleMap.get(id);
    if (_schedule.interval !== null) {
      clearInterval(_schedule.interval);
    }
    _schedule.cronJob.stop();
    Scheduler.#scheduleMap.delete(id);
  }
  static deleteAll() {
    for (const _schedule of Scheduler.#scheduleMap.values()) {
      if (_schedule.interval !== null) {
        clearInterval(_schedule.interval);
      }
      _schedule.cronJob.stop();
    }
    Scheduler.#scheduleMap.clear();
  }
  static async run(id) {
    const _schedule = Scheduler.#scheduleMap.get(id);
    if (_schedule.status === "loading") {
      return;
    }
    Scheduler.pause(id);
    try {
      if (_schedule.dataType === "AREA") {
        await Scheduler.#areasService.create(_schedule.data, {
          patchSourceFromServer: true
        });
      } else if (_schedule.dataType === "ROUTE") {
        await Scheduler.#routesService.create(_schedule.data, {
          patchSourceFromServer: true
        });
      }
    } catch (ex) {
      console.log(ex);
    }
    Scheduler.resume(id);
  }
  static pause(id) {
    if (!Scheduler.#scheduleMap.has(id))
      return;
    const _schedule = Scheduler.#scheduleMap.get(id);
    if (!_schedule.cronJob.isRunning() || _schedule.interval === null) {
      return;
    }
    clearInterval(_schedule.interval);
    _schedule.interval = null;
    _schedule.cronJob.pause();
    Scheduler.#adapter.setStateAsync(`${id}.cron-job.timer`, 0, true).catch((ex) => console.log(ex));
  }
  static resume(id) {
    if (!Scheduler.#scheduleMap.has(id))
      return;
    const _schedule = Scheduler.#scheduleMap.get(id);
    if (_schedule.cronJob.isRunning()) {
      return;
    }
    if (_schedule.interval === null) {
      _schedule.cronJob.resume();
      _schedule.interval = setInterval(() => {
        Scheduler.#adapter.setStateAsync(`${id}.cron-job.timer`, _schedule.next, true).catch((ex) => console.log(ex));
      }, 1e3);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Scheduler
});
//# sourceMappingURL=Scheduler.js.map
