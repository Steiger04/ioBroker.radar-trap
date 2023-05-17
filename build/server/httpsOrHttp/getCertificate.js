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
var getCertificate_exports = {};
__export(getCertificate_exports, {
  getCertificate: () => getCertificate
});
module.exports = __toCommonJS(getCertificate_exports);
const getCertificate = async (that) => {
  const obj = await that.getForeignObjectAsync("system.certificates");
  return {
    certificate: obj == null ? void 0 : obj.native.certificates.defaultPublic,
    privateKey: obj == null ? void 0 : obj.native.certificates.defaultPrivate
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCertificate
});
//# sourceMappingURL=getCertificate.js.map
