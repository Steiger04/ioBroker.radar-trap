import I18n from "@iobroker/adapter-react/i18n";
import { useEffect, useState } from "react";
import { array, number, object, ObjectSchema, string } from "yup";
import { cronCheck } from "..";
import { useAppData } from "../../App";

const getRouteSchema = (language: string) => () => {
	const _routeSchema = object<radarTrap.Route>({
		id: string(),
		_id: string().required(),
		description: string().required(() => I18n.t("Description is a required field")),
		src: object({
			address: string().required(() => I18n.t("Start is a required field")),
			geometry: object<GeoJSON.Point>({
				type: string<"Point">(),
				coordinates: array<GeoJSON.Position>().length(2),
			}),
		}),
		dst: object({
			address: string().required(() => I18n.t("Destination is a required field")),
			geometry: object<GeoJSON.Point>({
				type: string<"Point">(),
				coordinates: array<GeoJSON.Position>().length(2),
			}),
		}),
		cron: string()
			.required(() => I18n.t("Cron pattern is a required field"))
			.test({
				name: "cronCheck",
				test: (value) => cronCheck(value!, language).isValid!,
				message: ({ value }) => cronCheck(value, language).errorText!,
				exclusive: false,
			}),
		maxTrapDistance: number()
			.typeError(I18n.t("Maximum trap distance must be a number"))
			.min(1, I18n.t("Maximum trap distance must be at least 1"))
			.max(100, I18n.t("Maximum trap distance must be no more than 100"))
			.required(I18n.t("Maximum trap distance is a required field")),
	});

	return _routeSchema;
};

const useRouteSchema = (): ObjectSchema<object, radarTrap.Route, object, ""> => {
	const { language } = useAppData();
	const [routeSchema, setRouteSchema] = useState(getRouteSchema(language));

	useEffect(() => {
		setRouteSchema(getRouteSchema(language));
	}, [language]);

	return routeSchema;
};

export { useRouteSchema };
