import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { FC, KeyboardEvent, ReactElement, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useAppData } from "../../../App";
import { RadarTrapTextField } from "../../../radartrap";

import type { Point } from "@turf/helpers";

interface RouteGeocoderFieldProps {
	disabled: boolean;
	label: string;
	defaultAddress: string;
	defaultGeometry: Point;
	addressPath: radarTrap.RouteKeys;
	geometryPath: radarTrap.RouteKeys;
}

const RouteGeocoderField: FC<RouteGeocoderFieldProps> = ({
	disabled,
	label,
	defaultAddress,
	defaultGeometry,
	addressPath,
	geometryPath,
}): ReactElement => {
	const { that, language } = useAppData();
	const [geocoderAddressAndGeometry, setGeocoderAddressAndGeometry] =
		useState<{
			address: string | null;
			geometry: Point | null;
		}>({
			address: "",
			geometry: defaultGeometry,
		});
	const { setValue } = useFormContext<radarTrap.Route>();

	const watchAddress = useWatch({
		name: addressPath,
		defaultValue: defaultAddress,
	});

	useEffect(() => {
		if (
			geocoderAddressAndGeometry.address?.trim() === watchAddress.trim()
		) {
			setGeocoderAddressAndGeometry({
				address: null,
				geometry: null,
			});
		} else {
			!!watchAddress &&
				watchAddress !== defaultAddress &&
				that.geocodingService &&
				that.geocodingService
					.forwardGeocode({
						language: [language],
						query: String(watchAddress),
						types: ["address", "poi"],
						limit: 1,
					})
					.send()
					.then((response) => {
						const { features } = response.body;

						if (features[0]) {
							const data: {
								address: string;
								geometry: Point;
							} = {
								address: features[0].place_name,
								geometry: features[0].geometry,
							};

							if (data.address === watchAddress) {
								setValue(addressPath, data.address, {
									shouldValidate: true,
									shouldDirty: true,
								});
								setValue(
									geometryPath,
									{ ...data.geometry },
									{
										shouldValidate: true,
										shouldDirty: true,
									},
								);
							} else {
								setGeocoderAddressAndGeometry(data);
							}
						}
					});
		}
	}, [watchAddress, that.geocodingService]);

	const handlePress = (e: KeyboardEvent<HTMLElement>) => {
		e.stopPropagation();
		if (e.key === "Enter" && geocoderAddressAndGeometry.address !== null) {
			setValue(addressPath, geocoderAddressAndGeometry.address, {
				shouldValidate: true,
				shouldDirty: true,
			});
			setValue(geometryPath, geocoderAddressAndGeometry.geometry, {
				shouldValidate: true,
				shouldDirty: true,
			});
		}
	};

	return (
		<Box sx={{ flex: "0 1 auto" }}>
			<RadarTrapTextField
				inputProps={{ onKeyUp: handlePress }}
				disabled={disabled}
				name={addressPath}
				label={label}
				type="text"
			/>
			<Typography variant="subtitle2">
				{geocoderAddressAndGeometry.address}
			</Typography>
		</Box>
	);
};

export { RouteGeocoderField };
