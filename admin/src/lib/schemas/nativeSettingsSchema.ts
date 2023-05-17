import I18n from "@iobroker/adapter-react/i18n";
import { boolean, number, object, string } from "yup";
import { isFQDNList } from "../validators/isFQDNList";

const nativeSettingsSchema = object<ioBroker.INative>({
	settings: object({
		httpsEnabled: boolean().required(),
		domains: string()
			.required()
			.when(["httpsEnabled"], {
				is: true,
				then: (schema) =>
					schema
						.test({
							name: "FQDNList",
							test: (value) => isFQDNList(value),
							message: I18n.t(
								"Domains must be localhost, an IP or a FQDN",
							),
							exclusive: false,
						})
						.required(),
			}),
		feathersPort: number()
			.min(3_000, ({ min }) =>
				I18n.t("feathersPort must be greater or equal %s!", `${min}`),
			)
			.max(65_535, ({ max }) =>
				I18n.t(
					"feathersPort must be less than or equal to %s!",
					`${max}`,
				),
			)
			.required(),
		mbxAccessToken: string().required(() =>
			I18n.t("Mapbox token is a required field!"),
		),
		// mbxAccessToken: string(),
	}),
});

export { nativeSettingsSchema };
