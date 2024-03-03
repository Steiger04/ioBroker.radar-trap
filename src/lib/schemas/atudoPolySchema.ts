import { Type } from "@sinclair/typebox";

const atudoPolySchema = Type.Object(
	{
		schemaType: Type.String({ default: "POLY" }),
		id: Type.String(),
		type: Type.String(),
		polyline: Type.Any(),
		style: Type.Optional(Type.String()),
		info: Type.Optional(
			Type.Object({
				length: Type.Optional(Type.String()),
				duration: Type.Optional(Type.Number()),
				delay: Type.Optional(Type.Number()),
				desc: Type.Optional(Type.String()),
			}),
		),
		address: Type.Optional(
			Type.Object({
				country: Type.String(),
				zip: Type.Union([Type.String(), Type.Null()]),
				city: Type.String(),
				street: Type.String(),
				direction: Type.Union([Type.Number(), Type.String(), Type.Null()]),
				zip_code: Type.String(),
			}),
		),
		backend: Type.Optional(Type.String()),
		create_date: Type.Optional(Type.String()),
		pos: Type.Optional(
			Type.Object({
				lat: Type.String(),
				lng: Type.String(),
			}),
		),
		showdelay_pos: Type.Optional(
			Type.Union([
				Type.Object({
					lat: Type.String(),
					lng: Type.String(),
				}),
				Type.Null(),
			]),
		),
	},
	{ additionalProperties: false },
);

const atudoPolysSchema = Type.Array(atudoPolySchema);

export { atudoPolySchema, atudoPolysSchema };
