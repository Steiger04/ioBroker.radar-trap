import { Type } from "@sinclair/typebox";

const poiInfoSchema = Type.Object({
	partly_fixed: Type.Optional(Type.String()),
	qltyCountryRoad: Type.Optional(Type.Union([Type.Number(), Type.String()])),
	confirmed: Type.Optional(Type.Number()),
	gesperrt: Type.Optional(Type.Number()),
	quality: Type.Optional(Type.Union([Type.Number(), Type.String()])),
	label: Type.Optional(Type.String()),
	tags: Type.Optional(Type.Array(Type.Any())),
	alert: Type.Optional(Type.Number()),
	alert_type: Type.Optional(Type.Number()),
	precheck: Type.Optional(Type.String()),
	reason: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	desc: Type.Optional(Type.String()),
	length: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	duration: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
	delay: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
	lat_end: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
	lng_end: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Null()])),
	refid_start: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

const poiSchema = Type.Object(
	{
		schemaType: Type.String({ default: "POI" }),
		id: Type.String(),
		lat: Type.String(),
		lng: Type.String(),
		street: Type.Optional(Type.String()),
		address: Type.Object({
			country: Type.String(),
			state: Type.String(),
			zip_code: Type.String(),
			city: Type.String(),
			city_district: Type.String(),
			street: Type.String(),
		}),
		content: Type.Optional(Type.String()),
		reason: Type.Optional(Type.String()),
		State: Type.Optional(Type.String()),
		City: Type.Optional(Type.String()),
		LocationLocRoadNumber: Type.Optional(Type.String()),
		backend: Type.String(),
		type: Type.String(),
		vmax: Type.Optional(Type.String()),
		counter: Type.String(),
		create_date: Type.String(),
		confirm_date: Type.String(),
		info: Type.Union([poiInfoSchema, Type.Boolean(), Type.String(), Type.Array(Type.Any())]),
		polyline: Type.Any(),
		style: Type.Number(),
	},
	{ additionalProperties: false },
);

const poisSchema = Type.Array(poiSchema);

export { poiSchema, poisSchema, poiInfoSchema };
