import I18n from "@iobroker/adapter-react/i18n";
import { Box, TextField } from "@mui/material";

import type { FC, HTMLInputTypeAttribute, ReactElement } from "react";
import type { UseFormReturn } from "react-hook-form";

interface IbrTextFieldProps {
	methods: UseFormReturn<ioBroker.INative, any>;
	name: ioBroker.nativeKeys;
	label: string;
	type: HTMLInputTypeAttribute;
}

const IbrTextField: FC<IbrTextFieldProps> = ({ methods, name, label, type }): ReactElement => {
	const { register, getFieldState } = methods;

	const { error } = getFieldState(name);

	return (
		<Box sx={{ flex: "0 1 auto" }}>
			<TextField
				variant="standard"
				fullWidth={true}
				label={I18n.t(label)}
				type={type}
				{...register(name, { valueAsNumber: type === "number" })}
				error={Boolean(error)}
				helperText={error?.message}
			/>
		</Box>
	);
};

export { IbrTextField };
