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
var areaTrapsWithTrapInfo_exports = {};
__export(areaTrapsWithTrapInfo_exports, {
  areaTrapsWithTrapInfo: () => areaTrapsWithTrapInfo
});
module.exports = __toCommonJS(areaTrapsWithTrapInfo_exports);
var import_helpers = require("@turf/helpers");
var import_addTrapInfoToTrapProperties = require("./addTrapInfoToTrapProperties");
const areaTrapsWithTrapInfo = (data) => {
  if (data.areaTraps !== void 0)
    data.trapsFeatureCollection = (0, import_helpers.featureCollection)((0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(data.areaTraps));
  if (data.areaTrapsNew !== void 0)
    (0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(data.areaTrapsNew);
  if (data.areaTrapsEstablished !== void 0)
    (0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(data.areaTrapsEstablished);
  if (data.areaTrapsRejected !== void 0)
    (0, import_addTrapInfoToTrapProperties.addTrapInfoToTrapProperties)(data.areaTrapsRejected);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  areaTrapsWithTrapInfo
});
//# sourceMappingURL=areaTrapsWithTrapInfo.js.map
