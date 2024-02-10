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
var app_exports = {};
__export(app_exports, {
  default: () => app_default
});
module.exports = __toCommonJS(app_exports);
var import_express = __toESM(require("@feathersjs/express"));
var import_feathers = __toESM(require("@feathersjs/feathers"));
var import_socketio = __toESM(require("@feathersjs/socketio"));
var import_compression = __toESM(require("compression"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_path = __toESM(require("path"));
var import_app = __toESM(require("./app.hooks"));
var import_channels = __toESM(require("./channels"));
var import_logger = __toESM(require("./logger"));
var import_middleware = __toESM(require("./middleware"));
var import_services = __toESM(require("./services"));
process.env.NODE_CONFIG_DIR = import_path.default.join(__dirname, "config/");
const configuration = require("@feathersjs/configuration");
const app = (0, import_express.default)((0, import_feathers.default)());
app.configure(configuration());
app.use(
  (0, import_helmet.default)({
    contentSecurityPolicy: false
  })
);
app.use((0, import_cors.default)());
app.use((0, import_compression.default)());
app.use(import_express.default.json());
app.use(import_express.default.urlencoded({ extended: true }));
app.configure(import_express.default.rest());
app.configure((0, import_socketio.default)());
app.configure(import_middleware.default);
app.configure(import_services.default);
app.configure(import_channels.default);
app.use(import_express.default.notFound());
app.use(import_express.default.errorHandler({ logger: import_logger.default }));
app.hooks(import_app.default);
var app_default = app;
//# sourceMappingURL=app.js.map
