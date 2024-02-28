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
var atudoPoiSchema_exports = {};
__export(atudoPoiSchema_exports, {
  atudoPoiInfoSchema: () => atudoPoiInfoSchema,
  atudoPoiSchema: () => atudoPoiSchema,
  atudoPoisSchema: () => atudoPoisSchema
});
module.exports = __toCommonJS(atudoPoiSchema_exports);
var import_typebox = require("@sinclair/typebox");
const atudoPoiInfoSchema = import_typebox.Type.Object({
  partly_fixed: import_typebox.Type.Optional(import_typebox.Type.String()),
  qltyCountryRoad: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.Number(), import_typebox.Type.String()])),
  confirmed: import_typebox.Type.Optional(import_typebox.Type.Number()),
  gesperrt: import_typebox.Type.Optional(import_typebox.Type.Number()),
  quality: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.Number(), import_typebox.Type.String()])),
  label: import_typebox.Type.Optional(import_typebox.Type.String()),
  tags: import_typebox.Type.Optional(import_typebox.Type.Array(import_typebox.Type.Any())),
  alert: import_typebox.Type.Optional(import_typebox.Type.Number()),
  alert_type: import_typebox.Type.Optional(import_typebox.Type.Number()),
  precheck: import_typebox.Type.Optional(import_typebox.Type.String()),
  reason: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Null()])),
  desc: import_typebox.Type.Optional(import_typebox.Type.String()),
  length: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Null()])),
  duration: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Number(), import_typebox.Type.Null()])),
  delay: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.Number(), import_typebox.Type.Null()])),
  lat_end: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Number(), import_typebox.Type.Null()])),
  lng_end: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Number(), import_typebox.Type.Null()])),
  refid_start: import_typebox.Type.Optional(import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Null()]))
});
const atudoPoiSchema = import_typebox.Type.Object(
  {
    schemaType: import_typebox.Type.String({ default: "POI" }),
    id: import_typebox.Type.String(),
    lat: import_typebox.Type.String(),
    lng: import_typebox.Type.String(),
    street: import_typebox.Type.Optional(import_typebox.Type.String()),
    address: import_typebox.Type.Object({
      country: import_typebox.Type.String(),
      state: import_typebox.Type.String(),
      zip_code: import_typebox.Type.String(),
      city: import_typebox.Type.String(),
      city_district: import_typebox.Type.String(),
      street: import_typebox.Type.String()
    }),
    content: import_typebox.Type.Optional(import_typebox.Type.String()),
    reason: import_typebox.Type.Optional(import_typebox.Type.String()),
    State: import_typebox.Type.Optional(import_typebox.Type.String()),
    City: import_typebox.Type.Optional(import_typebox.Type.String()),
    LocationLocRoadNumber: import_typebox.Type.Optional(import_typebox.Type.String()),
    backend: import_typebox.Type.String(),
    type: import_typebox.Type.String(),
    vmax: import_typebox.Type.Optional(import_typebox.Type.String()),
    counter: import_typebox.Type.String(),
    create_date: import_typebox.Type.String(),
    confirm_date: import_typebox.Type.String(),
    info: import_typebox.Type.Union([atudoPoiInfoSchema, import_typebox.Type.Boolean(), import_typebox.Type.String(), import_typebox.Type.Array(import_typebox.Type.Any())]),
    polyline: import_typebox.Type.Any(),
    style: import_typebox.Type.Number()
  },
  { additionalProperties: false }
);
const atudoPoisSchema = import_typebox.Type.Array(atudoPoiSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  atudoPoiInfoSchema,
  atudoPoiSchema,
  atudoPoisSchema
});
//# sourceMappingURL=atudoPoiSchema.js.map
