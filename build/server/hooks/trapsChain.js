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
var trapsChain_exports = {};
__export(trapsChain_exports, {
  trapsChain: () => trapsChain
});
module.exports = __toCommonJS(trapsChain_exports);
var import_lodash = require("lodash");
const trapsChain = (record = {}, result = {}) => {
  const newTraps = (0, import_lodash.mapKeys)(
    (0, import_lodash.mergeWith)(
      { ...record },
      result,
      (recordValue, resultValue) => (0, import_lodash.differenceBy)(resultValue, recordValue || [], "properties.backend").map((item) => ({
        ...item,
        properties: { ...item.properties, status: "NEW" }
      }))
    ),
    (_, key) => `${key}New`
  );
  const establishedTraps = (0, import_lodash.mapKeys)(
    (0, import_lodash.mergeWith)(
      { ...record },
      result,
      (recordValue, resultValue) => (0, import_lodash.intersectionBy)(recordValue || [], resultValue, "properties.backend").map((item) => ({
        ...item,
        properties: { ...item.properties, status: "ESTABLISHED" }
      }))
    ),
    (_, key) => `${key}Established`
  );
  const rejectedTraps = (0, import_lodash.mapKeys)(
    (0, import_lodash.mergeWith)(
      { ...record },
      result,
      (recordValue, resultValue) => (0, import_lodash.differenceBy)(recordValue || [], resultValue, "properties.backend").map((item) => ({
        ...item,
        properties: { ...item.properties, status: "REJECTED" }
      }))
    ),
    (_, key) => `${key}Rejected`
  );
  const traps = (0, import_lodash.mergeWith)(
    { ...(0, import_lodash.mapKeys)(establishedTraps, (_, key) => key.substring(0, key.length - 11)) },
    (0, import_lodash.mapKeys)(newTraps, (_, key) => key.substring(0, key.length - 3)),
    (objValue, srcValue) => (0, import_lodash.flatten)([objValue, srcValue])
  );
  const newTrapsReduced = (0, import_lodash.reduce)(
    newTraps,
    function(acc, value) {
      acc.trapsNew.push(...value);
      return acc;
    },
    { trapsNew: [] }
  );
  const rejectedTrapsReduced = (0, import_lodash.reduce)(
    rejectedTraps,
    function(acc, value) {
      acc.trapsRejected.push(...value);
      return acc;
    },
    { trapsRejected: [] }
  );
  return { traps, newTraps, establishedTraps, rejectedTraps, newTrapsReduced, rejectedTrapsReduced };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trapsChain
});
//# sourceMappingURL=trapsChain.js.map
