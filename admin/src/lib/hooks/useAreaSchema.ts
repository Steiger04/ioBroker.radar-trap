import I18n from "@iobroker/adapter-react/i18n";
import { useEffect, useState } from "react";
import { object, ObjectSchema, string } from "yup";
import { cronCheck } from "..";
import { useAppData } from "../../App";

const getAreaSchema = (language: string) => () => {
	const _areaSchema = object<radarTrap.Area>({
		id: string(),
		_id: string().required(),
		description: string().required(() =>
			I18n.t("Description is a required field"),
		),
		cron: string()
			.required(() => I18n.t("Cron pattern is a required field"))
			.test({
				name: "cronCheck",
				test: (value) => cronCheck(value!, language).isValid!,
				message: ({ value }) => cronCheck(value, language).errorText!,
				exclusive: false,
			}),
	});

	return _areaSchema;
};

const useAreaSchema = (): ObjectSchema<object, radarTrap.Area, object, ""> => {
	const { language } = useAppData();

	const [areaSchema, setAreaSchema] = useState(getAreaSchema(language));

	useEffect(() => {
		setAreaSchema(getAreaSchema(language));
	}, [language]);

	return areaSchema;
};

export { useAreaSchema };
