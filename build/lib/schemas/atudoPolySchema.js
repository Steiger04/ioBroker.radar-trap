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
var atudoPolySchema_exports = {};
__export(atudoPolySchema_exports, {
  atudoPolySchema: () => atudoPolySchema,
  atudoPolysSchema: () => atudoPolysSchema
});
module.exports = __toCommonJS(atudoPolySchema_exports);
var import_typebox = require("@sinclair/typebox");
const atudoPolySchema = import_typebox.Type.Object(
  {
    schemaType: import_typebox.Type.String({ default: "POLY" }),
    id: import_typebox.Type.String(),
    type: import_typebox.Type.String(),
    polyline: import_typebox.Type.Any(),
    style: import_typebox.Type.Optional(import_typebox.Type.String()),
    info: import_typebox.Type.Optional(
      import_typebox.Type.Object({
        length: import_typebox.Type.Optional(import_typebox.Type.String()),
        duration: import_typebox.Type.Optional(import_typebox.Type.Number()),
        delay: import_typebox.Type.Optional(import_typebox.Type.Number()),
        desc: import_typebox.Type.Optional(import_typebox.Type.String())
      })
    ),
    address: import_typebox.Type.Optional(
      import_typebox.Type.Object({
        country: import_typebox.Type.String(),
        zip: import_typebox.Type.Union([import_typebox.Type.String(), import_typebox.Type.Null()]),
        city: import_typebox.Type.String(),
        street: import_typebox.Type.String(),
        direction: import_typebox.Type.Union([import_typebox.Type.Number(), import_typebox.Type.Null()]),
        zip_code: import_typebox.Type.String()
      })
    ),
    backend: import_typebox.Type.Optional(import_typebox.Type.String()),
    create_date: import_typebox.Type.Optional(import_typebox.Type.String()),
    pos: import_typebox.Type.Optional(
      import_typebox.Type.Object({
        lat: import_typebox.Type.String(),
        lng: import_typebox.Type.String()
      })
    ),
    showdelay_pos: import_typebox.Type.Optional(
      import_typebox.Type.Union([
        import_typebox.Type.Object({
          lat: import_typebox.Type.String(),
          lng: import_typebox.Type.String()
        }),
        import_typebox.Type.Null()
      ])
    )
  },
  { additionalProperties: false }
);
const atudoPolysSchema = import_typebox.Type.Array(atudoPolySchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  atudoPolySchema,
  atudoPolysSchema
});
//# sourceMappingURL=atudoPolySchema.js.map
