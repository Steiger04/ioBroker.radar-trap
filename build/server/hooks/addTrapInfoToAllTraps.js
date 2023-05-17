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
var addTrapInfoToAllTraps_exports = {};
__export(addTrapInfoToAllTraps_exports, {
  addTrapInfoToAllTraps: () => addTrapInfoToAllTraps
});
module.exports = __toCommonJS(addTrapInfoToAllTraps_exports);
var import_helpers = require("@turf/helpers");
var import_prepareTraps = require("./prepareTraps");
const addTrapInfoToAllTraps = (data) => {
  if (data.areaTraps === void 0) {
    return;
  }
  data.trapsFeatureCollection = (0, import_helpers.featureCollection)(
    (0, import_prepareTraps.prepareTraps)(data.areaTraps)
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addTrapInfoToAllTraps
});
//# sourceMappingURL=addTrapInfoToAllTraps.js.map
