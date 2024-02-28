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
var addTrapInfoToTrapProperties_exports = {};
__export(addTrapInfoToTrapProperties_exports, {
  addTrapInfoToTrapProperties: () => addTrapInfoToTrapProperties
});
module.exports = __toCommonJS(addTrapInfoToTrapProperties_exports);
function isArray(it) {
  if (typeof Array.isArray === "function") {
    return Array.isArray(it);
  }
  return Object.prototype.toString.call(it) === "[object Array]";
}
const addTrapInfoToTrapProperties = (traps) => Object.values(traps).reduce(
  (list, t) => {
    if (isArray(t)) {
      t.forEach(({ properties }) => {
        const trapInfo = {};
        trapInfo.id = properties.backend;
        trapInfo.status = properties.status;
        trapInfo.typeName = properties.type_name;
        const info = !properties.info ? false : properties.info;
        if (info !== false) {
          trapInfo.reason = info.reason || properties.reason;
          trapInfo.duration = Boolean(info.duration) && Math.round(Number(info.duration) / 60);
          trapInfo.delay = Boolean(info.delay) && Math.round(Number(info.delay) / 60);
          trapInfo.createDate = properties.create_date !== "01.01.1970" && properties.create_date;
          trapInfo.confirmDate = properties.confirm_date !== "01.01.1970" && properties.confirm_date;
          trapInfo.vmax = Boolean(properties.vmax) && properties.vmax !== "?" && properties.vmax !== "/" && properties.vmax;
          trapInfo.typeText = Boolean(properties.type_text) && properties.type_text;
          trapInfo.country = Boolean(properties.address.country) && properties.address.country;
          trapInfo.state = Boolean(properties.address.state) && properties.address.state;
          trapInfo.zipCode = Boolean(properties.address.zip_code) && properties.address.zip_code;
          trapInfo.city = Boolean(properties.address.city) && properties.address.city;
          trapInfo.cityDistrict = Boolean(properties.address.city_district) && properties.address.city_district;
          trapInfo.street = Boolean(properties.address.street) && properties.address.street;
          properties.trapInfo = trapInfo;
        }
      });
      const lineTraps = t.filter((obj) => obj.properties.polyline !== "").map((obj) => {
        var _a;
        const lt = obj.properties.polyline;
        lt.properties.trapInfo = {};
        lt.properties.status = (_a = obj.properties) == null ? void 0 : _a.status;
        return lt;
      });
      return [...list, ...t, ...lineTraps];
    }
    return list;
  },
  []
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addTrapInfoToTrapProperties
});
//# sourceMappingURL=addTrapInfoToTrapProperties.js.map
