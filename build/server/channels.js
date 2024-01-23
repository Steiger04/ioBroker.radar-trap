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
var channels_exports = {};
__export(channels_exports, {
  default: () => channels_default
});
module.exports = __toCommonJS(channels_exports);
var import_transport_commons = require("@feathersjs/transport-commons");
function channels_default(app) {
  if (typeof app.channel !== "function") {
    return;
  }
  app.on("connection", (connection) => {
    app.channel("anonymous").join(connection);
  });
  app.service("routes").publish((data, context) => {
    if (context.params.publishEvent === false) {
      return;
    }
    return app.channel("anonymous");
  });
  app.service("routes").publish(
    "status",
    (data, context) => app.channel("anonymous")
  );
  app.service("areas").publish((data, context) => {
    if (context.params.publishEvent === false) {
      return;
    }
    return app.channel("anonymous");
  });
  app.service("areas").publish(
    "status",
    (data, context) => app.channel("anonymous")
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=channels.js.map
