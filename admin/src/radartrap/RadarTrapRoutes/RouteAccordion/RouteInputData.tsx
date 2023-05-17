import Stack from "@mui/material/Stack";
import { RouteGeocoderField, RouteProfileGroup } from ".";
import { RadarTrapCronField, RadarTrapTextField } from "../../../radartrap";

import type { FC, ReactElement } from "react";
import type { FieldArrayWithId } from "react-hook-form";

interface RouteInputDataProps {
	disabled: boolean;
	field: FieldArrayWithId<radarTrap.FormRoutes, "routes">;
}

const RouteInputData: FC<RouteInputDataProps> = ({
	disabled,
	field,
}): ReactElement => {
	return (
		<Stack spacing={2}>
			<RadarTrapTextField
				disabled={disabled}
				name="description"
				label="description"
				type="text"
			/>
			<RouteGeocoderField
				disabled={disabled}
				label="source"
				defaultAddress={field.src.address}
				defaultGeometry={field.src.geometry}
				addressPath="src.address"
				geometryPath="src.geometry"
			/>
			<RouteGeocoderField
				disabled={disabled}
				label="destination"
				defaultAddress={field.dst.address}
				defaultGeometry={field.dst.geometry}
				addressPath="dst.address"
				geometryPath="dst.geometry"
			/>
			<RouteProfileGroup disabled={disabled} />
			<RadarTrapTextField
				disabled={disabled}
				name="maxTrapDistance"
				label="maximum trap distance"
				type="number"
			/>
			<RadarTrapCronField disabled={disabled} cronDefault={field.cron} />
		</Stack>
	);
};

export { RouteInputData };
