import I18n from "@iobroker/adapter-react-v5/i18n";
import { Box, InputBaseComponentProps, TextField } from "@mui/material";
import { useFormContext } from "react-hook-form";

import type { FC, HTMLInputTypeAttribute, ReactElement } from "react";

interface RadarTrapTextFieldProps {
	inputProps?: InputBaseComponentProps | undefined;
	disabled: boolean;
	name: radarTrap.RouteKeys | radarTrap.AreaKeys;
	label: string;
	type: HTMLInputTypeAttribute;
}
const RadarTrapTextField: FC<RadarTrapTextFieldProps> = ({ inputProps, disabled, name, label, type }): ReactElement => {
	const { register, getFieldState, formState } = useFormContext<radarTrap.Route | radarTrap.Area>();
	const { error } = getFieldState(name, formState);

	return (
		<Box sx={{ flex: "0 1 auto" }}>
			<TextField
				variant="standard"
				fullWidth={true}
				disabled={disabled}
				inputProps={inputProps}
				label={I18n.t(label as AdminWord)}
				type={type}
				{...register(name, { valueAsNumber: type === "number" })}
				error={Boolean(error)}
				helperText={error?.message}
			/>
		</Box>
	);
};

export { RadarTrapTextField };
