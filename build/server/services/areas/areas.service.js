"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var areas_service_exports = {};
__export(areas_service_exports, {
  default: () => areas_service_default
});
module.exports = __toCommonJS(areas_service_exports);
var import_areas = __toESM(require("../../models/areas.model"));
var import_areas2 = require("./areas.class");
var import_areas3 = __toESM(require("./areas.hooks"));
function areas_service_default(app) {
  const options = {
    events: ["status"],
    Model: (0, import_areas.default)(app),
    paginate: app.get("paginate")
  };
  app.use("/areas", new import_areas2.Areas(options, app));
  const service = app.service("areas");
  service.hooks(import_areas3.default);
}
//# sourceMappingURL=areas.service.js.map
