import I18n from "@iobroker/adapter-react/i18n";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { Control, useController } from "react-hook-form";

import type { SxProps, Theme } from "@mui/system";
import type { FC, ReactElement } from "react";

interface IbrCheckBoxProps {
	sx?: SxProps<Theme>;
	control: Control<ioBroker.INative>;
	name: ioBroker.nativeKeys;
	label: string;
}

const IbrCheckBox: FC<IbrCheckBoxProps> = ({
	sx = [],
	control,
	name,
	label,
}): ReactElement => {
	const {
		field: { value, onBlur, onChange, ref },
	} = useController({
		control,
		name,
	});

	return (
		<Box sx={[{ flex: "0 1 auto" }, ...(Array.isArray(sx) ? sx : [sx])]}>
			<FormControlLabel
				control={
					<Checkbox
						name={name}
						checked={Boolean(value)}
						ref={ref}
						onChange={onChange}
						onBlur={onBlur}
					/>
				}
				label={I18n.t(label)}
			/>
		</Box>
	);
};

export { IbrCheckBox };
