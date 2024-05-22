import { Dispatch, FC, ReactElement, useMemo, useState } from "react";
import { Autocomplete, Box, Fade, Paper, TextField } from "@mui/material";
import I18n from "@iobroker/adapter-react-v5/i18n";

import { features as _landkreisFeatures } from "../../../assets/landkreise.json";
interface AreaAutocompleteProps {
	toggle: boolean;
	setToggle: Dispatch<React.SetStateAction<boolean>>;
	setLandkreisFeature: Dispatch<radarTrap.AreaPolygons>;
}

const AreaAutocomplete: FC<AreaAutocompleteProps> = ({
	toggle,
	setToggle,
	setLandkreisFeature,
}): ReactElement | null => {
	const [value, setValue] = useState<(typeof _landkreisFeatures)[0] | null>(null);

	const sortOptions = useMemo(
		() =>
			_landkreisFeatures.sort((a, b) => {
				const nameA = a.properties!.NAME_3.toLowerCase();
				const nameB = b.properties!.NAME_3.toLowerCase();
				return nameA.localeCompare(nameB);
			}),
		[],
	);

	return (
		<Fade in={toggle} timeout={{ enter: 0, exit: 4000 }}>
			<Box
				sx={{
					position: "absolute",
					top: "9px",
					right: "calc(50% - 25%)",
					width: "50%",
					borderRadius: "5px",
				}}
			>
				<Autocomplete
					value={value}
					onChange={(event: any, newValue) => {
						setValue(newValue);
						newValue &&
							setLandkreisFeature({
								[newValue.id.toString()]: { ...newValue, id: newValue.id.toString() },
							} as radarTrap.AreaPolygons);
						setToggle(false);
					}}
					size="small"
					ListboxProps={{ sx: { typography: "subtitle2" } }}
					slotProps={{ paper: { sx: { opacity: 0.7 } } }}
					disablePortal
					id="area-auto-complete"
					options={sortOptions}
					getOptionLabel={({ properties: { NAME_1, NAME_2, NAME_3 } }) => `${NAME_3} | ${NAME_2} | ${NAME_1}`}
					renderInput={(params) => (
						<Paper sx={{ opacity: 0.75 }} elevation={0}>
							<TextField
								{...params}
								InputProps={{
									...params.InputProps,
									sx: { typography: "subtitle2" },
								}}
								InputLabelProps={{ ...params.InputLabelProps, sx: { typography: "subtitle2" } }}
								label={I18n.t("counties")}
							/>
						</Paper>
					)}
				/>
			</Box>
		</Fade>
	);
};

export { AreaAutocomplete };
