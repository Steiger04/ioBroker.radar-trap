import { yupResolver } from "@hookform/resolvers/yup";
import I18n from "@iobroker/adapter-react-v5/i18n";
import { Box, Link } from "@mui/material";
import Stack from "@mui/material/Stack";
import { FC, ReactElement, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppData } from "../../App";
import { IbrTextField } from "../../ibr";
import { nativeSettingsSchema } from "../../lib";

const RadarTrapSettings: FC = (): ReactElement => {
	const { that, native, updateNativeValue } = useAppData();

	const methods = useForm<ioBroker.INative>({
		resolver: yupResolver(nativeSettingsSchema),
		defaultValues: {
			settings: {
				httpsEnabled: native.settings!.httpsEnabled,
				domains: native.settings!.domains,
				feathersPort: native.settings!.feathersPort,
				mbxAccessToken: native.settings!.mbxAccessToken,
			},
		},
	});

	const {
		watch,
		formState: { isValidating, isValid },
		handleSubmit,
	} = methods;

	useEffect(() => {
		handleSubmit(
			(data: ioBroker.INative) => !isValidating && isValid && updateNativeValue("settings", { ...data.settings }),
			() => that.setState({ changed: false }),
		)().catch((ex) => console.log(ex));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isValidating, isValid]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const watchHttpsEnabled = watch("settings.httpsEnabled", native!.settings?.httpsEnabled);

	return (
		<Box
			sx={{
				/* bgcolor: "blue", */
				height: "100%",
				flex: "1 1 0",
				overflowY: "auto",
			}}
		>
			{/* <IbrCheckBox
					sx={{ pb: 1 }}
					methods={methods}
					name="settings.httpsEnabled"
					label="https"
				/> */}
			<Stack spacing={3}>
				{/* {watchHttpsEnabled && (
						<IbrTextField
							methods={methods}
							name="settings.domains"
							label="domains"
							type="text"
						/>
					)} */}
				<IbrTextField methods={methods} name="settings.feathersPort" label="Feathers Port" type="number" />
				<Box>
					<IbrTextField methods={methods} name="settings.mbxAccessToken" label="Mapbox Token" type="text" />
					<Link
						variant="subtitle2"
						target="_blank"
						rel="noopener"
						underline="always"
						href="https://mapbox.com"
					>
						{I18n.t("get Mapbox Token")}
					</Link>
				</Box>
			</Stack>
		</Box>
	);
};

export { RadarTrapSettings };
