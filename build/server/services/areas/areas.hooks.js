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
var areas_hooks_exports = {};
__export(areas_hooks_exports, {
  default: () => areas_hooks_default
});
module.exports = __toCommonJS(areas_hooks_exports);
var import_feathers_hooks_common = require("feathers-hooks-common");
var import_Scheduler = require("../../../lib/Scheduler");
var import_hooks = require("../../hooks");
var import_addTrapInfoToAllTraps = require("../../hooks/addTrapInfoToAllTraps");
var areas_hooks_default = {
  before: {
    all: [],
    find: [
      (0, import_feathers_hooks_common.iff)(
        (ctx) => (0, import_feathers_hooks_common.isProvider)("server")(ctx) || (0, import_feathers_hooks_common.isProvider)("rest")(ctx),
        (ctx) => {
          if (ctx.params.query) {
            ctx.params.query.$limit = -1;
          }
          return ctx;
        },
        (0, import_feathers_hooks_common.disablePagination)()
      )
    ],
    get: [],
    create: [
      (0, import_feathers_hooks_common.disallow)("rest"),
      (0, import_feathers_hooks_common.iffElse)(
        (0, import_feathers_hooks_common.isProvider)("external"),
        [(0, import_feathers_hooks_common.paramsFromClient)("patchSourceFromClient"), (0, import_hooks.patchOrCreateArea)()],
        [(0, import_hooks.patchOrCreateArea)()]
      )
    ],
    update: [(0, import_feathers_hooks_common.disallow)("rest")],
    patch: [(0, import_feathers_hooks_common.disallow)("rest")],
    remove: [(0, import_feathers_hooks_common.disallow)("rest")]
  },
  after: {
    all: [],
    find: [(0, import_feathers_hooks_common.alterItems)(import_addTrapInfoToAllTraps.addTrapInfoToAllTraps)],
    get: [(0, import_feathers_hooks_common.alterItems)(import_addTrapInfoToAllTraps.addTrapInfoToAllTraps)],
    create: [
      (0, import_feathers_hooks_common.alterItems)(import_addTrapInfoToAllTraps.addTrapInfoToAllTraps),
      (ctx) => {
        ctx.service.emit("status", {
          _id: ctx.data._id,
          status: "success"
        });
        import_Scheduler.Scheduler.resume(ctx.data._id);
        return ctx;
      }
    ],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
//# sourceMappingURL=areas.hooks.js.map
