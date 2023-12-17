import I18n from "@iobroker/adapter-react/i18n";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { RadarTrapTextField } from "./RadarTrapTextField";

import type { FC, ReactElement } from "react";
import { useCronCheck } from "../lib";

interface RadarTrapCronFieldProps {
	disabled: boolean;
	cronDefault: string;
}

const RadarTrapCronField: FC<RadarTrapCronFieldProps> = ({ disabled, cronDefault }): ReactElement => {
	const cron = useCronCheck(cronDefault);

	return (
		<Box>
			<RadarTrapTextField disabled={disabled} name="cron" label="Cron pattern" type="text" />
			<Typography sx={[disabled && { color: "text.disabled" }]} variant="subtitle2">
				{cron.isValid && cron.text}
			</Typography>
			<Link
				sx={[
					disabled && {
						color: "text.disabled",
						pointerEvents: "none",
					},
				]}
				variant="subtitle2"
				target="_blank"
				rel="noopener"
				underline="always"
				href="https://crontab.guru/"
			>
				{I18n.t("crontab guru")}
			</Link>
		</Box>
	);
};

export { RadarTrapCronField };
