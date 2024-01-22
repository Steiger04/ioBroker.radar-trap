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
var httpsOrHttp_exports = {};
__export(httpsOrHttp_exports, {
  httpsOrHttp: () => httpsOrHttp
});
module.exports = __toCommonJS(httpsOrHttp_exports);
var import_express = __toESM(require("express"));
var import_http = __toESM(require("http"));
var import_http2 = __toESM(require("http2"));
var import_getCertificate = require("./getCertificate");
const httpsOrHttp = async (options, callback) => {
  if (!options) {
    throw new Error("Options are missing.");
  }
  if (!options.app) {
    throw new Error("App is missing.");
  }
  if (!options.ports) {
    throw new Error("Ports are missing.");
  }
  if (!options.ports.http) {
    throw new Error("Http port is missing.");
  }
  if (!options.ports.https) {
    throw new Error("Https port is missing.");
  }
  if (!callback) {
    throw new Error("Callback is missing.");
  }
  let certificate;
  try {
    certificate = await (0, import_getCertificate.getCertificate)(options.that);
  } catch {
    certificate = void 0;
  }
  if (certificate) {
    import_http2.default.createSecureServer({ key: certificate.privateKey, cert: certificate.certificate }, options.app).listen(options.ports.https, () => {
      const redirectApp = (0, import_express.default)();
      redirectApp.get(/.*/u, (req, res) => {
        res.redirect(
          `https://${req.headers.host.replace(`:${options.ports.http}`, `:${options.ports.https}`)}${req.url}`
        );
      });
      import_http.default.createServer(redirectApp).listen(options.ports.http, () => {
        callback(null, {
          app: {
            protocol: "https",
            port: options.ports.https
          },
          redirect: {
            protocol: "http",
            port: options.ports.http
          }
        });
      });
    });
    return;
  }
  import_http.default.createServer(options.app).listen(options.ports.http, () => {
    callback(null, {
      app: { protocol: "http", port: options.ports.http }
    });
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  httpsOrHttp
});
//# sourceMappingURL=httpsOrHttp.js.map
