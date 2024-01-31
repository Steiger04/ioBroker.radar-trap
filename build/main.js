"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_rxjs = require("rxjs");
var import_areaServiceListener = require("./lib/areaServiceListener");
var import_createAllAreaAndRouteObjects = require("./lib/createAllAreaAndRouteObjects");
var import_routeServiceListener = require("./lib/routeServiceListener");
var import_Scheduler = require("./lib/Scheduler");
var import_createFeathers = require("./server/createFeathers");
var import_logger = __toESM(require("./server/logger"));
class RadarTrap2 extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "radar-trap"
    });
    this.subscribeStreams();
    this.on("ready", this.onReady.bind(this));
    this.on("stateChange", this.onStateChange.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  /**
   * Is called when databases are connected and adapter received configuration
   */
  async onReady() {
    process.on("unhandledRejection", (reason, p) => import_logger.default.error("Unhandled Rejection at: Promise ", p, reason));
    process.env.MAPBOX_TOKEN = this.config.settings.mbxAccessToken;
    await (0, import_createFeathers.provideFeathersHTTPSAsync)(this, this.config.settings.feathersPort);
    await (0, import_createAllAreaAndRouteObjects.createAllAreaAndRouteObjects)(this, import_createFeathers.feathers).catch((ex) => console.log(ex));
    import_Scheduler.Scheduler.addThat(this);
    await import_Scheduler.Scheduler.scheduleAll().catch((ex) => console.log(ex));
    (0, import_routeServiceListener.routeServiceListener)(this, import_createFeathers.feathers);
    (0, import_areaServiceListener.areaServiceListener)(this, import_createFeathers.feathers);
    await this.subscribeStatesAsync("*.pause").catch((ex) => console.log(ex));
    await this.subscribeStatesAsync("*.resume").catch((ex) => console.log(ex));
    await this.subscribeStatesAsync("*.run").catch((ex) => console.log(ex));
  }
  /**
   * Is called if a subscribed state changes
   */
  onStateChange(id, state) {
    if (!state || state.ack) {
      return;
    }
    this.setStateAsync(id, { val: state.val, ack: true }).catch((ex) => console.log(ex));
    const DCS = this.idToDCS(id);
    switch (DCS.state) {
      case "pause":
        this.pause$.next(DCS.device);
        break;
      case "resume":
        this.resume$.next(DCS.device);
        break;
      case "run":
        this.run$.next(DCS.device);
        break;
      default:
        break;
    }
  }
  subscribeStreams() {
    this.pause$ = new import_rxjs.Subject();
    this.resume$ = new import_rxjs.Subject();
    this.run$ = new import_rxjs.Subject();
    this.pause$.pipe(
      (0, import_rxjs.mergeMap)((device) => {
        const _schedule = import_Scheduler.Scheduler.getSchedule(device);
        return (_schedule == null ? void 0 : _schedule.cronJobIsRunning) ? (0, import_rxjs.of)(device) : import_rxjs.EMPTY;
      })
    ).subscribe(import_Scheduler.Scheduler.pause);
    this.resume$.pipe(
      (0, import_rxjs.mergeMap)((device) => {
        const _schedule = import_Scheduler.Scheduler.getSchedule(device);
        const notResume = (_schedule == null ? void 0 : _schedule.cronJobIsRunning) || (_schedule == null ? void 0 : _schedule.status) === "loading";
        return notResume ? import_rxjs.EMPTY : (0, import_rxjs.of)(device);
      })
    ).subscribe(import_Scheduler.Scheduler.resume);
    this.run$.pipe(
      (0, import_rxjs.mergeMap)((device) => {
        const _schedule = import_Scheduler.Scheduler.getSchedule(device);
        return (_schedule == null ? void 0 : _schedule.status) === "loading" ? import_rxjs.EMPTY : (0, import_rxjs.of)(device);
      })
    ).subscribe(import_Scheduler.Scheduler.run);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      import_Scheduler.Scheduler.deleteAll();
      this.unsubscribeStatesAsync("*").catch((ex) => console.log(ex));
      import_createFeathers.server.close();
      this.setStateAsync("info.connection", false, true).catch((ex) => console.log(ex));
      callback();
    } catch {
      callback();
    }
  }
  // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
  // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
  // /**
  //  * Is called if a subscribed object changes
  //  */
  // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
  //     if (obj) {
  //         // The object was changed
  //         this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
  //     } else {
  //         // The object was deleted
  //         this.log.info(`object ${id} deleted`);
  //     }
  // }
  // If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
  // /**
  //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
  //  * Using this method requires "common.messagebox" property to be set to true in io-package.json
  //  */
  // private onMessage(obj: ioBroker.Message): void {
  //     if (typeof obj === 'object' && obj.message) {
  //         if (obj.command === 'send') {
  //             // e.g. send email or pushover or whatever
  //             this.log.info('send command');
  //             // Send response in callback if required
  //             if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
  //         }
  //     }
  // }
}
if (require.main !== module) {
  module.exports = (options) => new RadarTrap2(options);
} else {
  (() => new RadarTrap2())();
}
//# sourceMappingURL=main.js.map
