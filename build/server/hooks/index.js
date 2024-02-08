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
var hooks_exports = {};
__export(hooks_exports, {
  addTrapInfoToAllTraps: () => import_addTrapInfoToAllTraps.addTrapInfoToAllTraps,
  convertPolylineToGeojson: () => import_convertPolylineToGeojson.convertPolylineToGeojson,
  patchOrCreateArea: () => import_patchOrCreateArea.patchOrCreateArea,
  patchOrCreateRoute: () => import_patchOrCreateRoute.patchOrCreateRoute,
  prepareTraps: () => import_prepareTraps.prepareTraps,
  setActiveProfile: () => import_setActiveProfile.setActiveProfile,
  trapsChain: () => import_trapsChain.trapsChain
});
module.exports = __toCommonJS(hooks_exports);
var import_convertPolylineToGeojson = require("./convertPolylineToGeojson");
var import_patchOrCreateArea = require("./patchOrCreateArea");
var import_patchOrCreateRoute = require("./patchOrCreateRoute");
var import_setActiveProfile = require("./setActiveProfile");
var import_addTrapInfoToAllTraps = require("./addTrapInfoToAllTraps");
var import_prepareTraps = require("./prepareTraps");
var import_trapsChain = require("./trapsChain");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addTrapInfoToAllTraps,
  convertPolylineToGeojson,
  patchOrCreateArea,
  patchOrCreateRoute,
  prepareTraps,
  setActiveProfile,
  trapsChain
});
//# sourceMappingURL=index.js.map
