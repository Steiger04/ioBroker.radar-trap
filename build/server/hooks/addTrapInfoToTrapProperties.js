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
var import_lodash = require("lodash");
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
        const _info = JSON.parse(JSON.stringify(properties.info));
        trapInfo.id = properties.backend;
        trapInfo.status = properties.status;
        trapInfo.typeName = properties.type_name;
        trapInfo.longitude = +properties.lng;
        trapInfo.latitude = +properties.lat;
        trapInfo.reason = (0, import_lodash.isEmpty)(properties.reason) ? (0, import_lodash.isEmpty)(_info.reason) ? false : _info.reason : properties.reason;
        trapInfo.length = (0, import_lodash.isEmpty)(_info.length) ? false : _info.length;
        trapInfo.duration = (0, import_lodash.isEmpty)(_info.duration) ? false : Math.round(Number(_info.duration) / 60);
        trapInfo.delay = (0, import_lodash.isEmpty)(_info.delay) ? false : Math.round(Number(_info.delay) / 60);
        trapInfo.createDate = properties.create_date !== "01.01.1970" && properties.create_date;
        trapInfo.confirmDate = properties.confirm_date !== "01.01.1970" && properties.confirm_date;
        trapInfo.vmax = (0, import_lodash.isEmpty)(properties.vmax) ? false : properties.vmax === "?" ? "V" : properties.vmax;
        trapInfo.typeDesc = (0, import_lodash.isEmpty)(properties.type_desc) ? false : properties.type_desc;
        trapInfo.typeText = (0, import_lodash.isEmpty)(properties.type_text) ? false : properties.type_text;
        trapInfo.country = (0, import_lodash.isEmpty)(properties.address.country) ? false : properties.address.country;
        trapInfo.state = (0, import_lodash.isEmpty)(properties.address.state) ? false : properties.address.state;
        trapInfo.zipCode = (0, import_lodash.isEmpty)(properties.address.zip_code) ? false : properties.address.zip_code;
        trapInfo.city = (0, import_lodash.isEmpty)(properties.address.city) ? false : properties.address.city;
        trapInfo.cityDistrict = (0, import_lodash.isEmpty)(properties.address.city_district) ? false : properties.address.city_district;
        trapInfo.street = (0, import_lodash.isEmpty)(properties.address.street) ? false : properties.address.street;
        properties.trapInfo = trapInfo;
      });
      return [...list, ...t];
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
