import Box from "@mui/material/Box";
import { Feature, featureCollection } from "@turf/helpers";
import { FC, ReactElement, useCallback, useEffect, useRef } from "react";
import Map, { MapRef, ScaleControl, FullscreenControl } from "react-map-gl";
import { useAppData } from "../../App";
import { useResizeMap } from "../../lib";
import { DrawControl } from "./DrawControl";

import type { DrawCreateEvent, DrawDeleteEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
import { useFormContext } from "react-hook-form";

const AreaTrapMap: FC = (): ReactElement => {
	const { savedNative, feathers } = useAppData();
	const mapRef = useRef<MapRef>(null);
	const drawRef = useRef<MapboxDraw>(null);
	const { setValue, getValues } = useFormContext<radarTrap.Area>();

	const onUpdate = useCallback(
		(e: DrawUpdateEvent | DrawCreateEvent) => {
			if (!drawRef.current) return;

			const tmpFeature = e.features[0] as Feature<GeoJSON.Polygon, GeoJSON.GeoJsonProperties>;

			const newFeatures = { ...getValues("areaPolygons") };

			if (tmpFeature.id !== Object.keys(newFeatures)[0]) {
				drawRef.current.delete(Object.keys(newFeatures)[0]);
				drawRef.current.add(tmpFeature);
			}

			setValue(
				"areaPolygons",
				{ [tmpFeature.id!]: tmpFeature },
				{
					shouldValidate: true,
					shouldDirty: true,
				},
			);
		},
		[drawRef],
	);

	const onDelete = useCallback((e: DrawDeleteEvent) => {
		const newFeatures = { ...getValues("areaPolygons") };

		for (const f of e.features) {
			delete newFeatures[f.id!];
		}
		setValue("areaPolygons", newFeatures, {
			shouldValidate: true,
			shouldDirty: true,
		});
	}, []);

	const { resizeMap, boxStatus } = useResizeMap({
		_id: getValues("_id"),
		map: mapRef,
		feathers,
	});

	useEffect(() => {
		if (drawRef.current && boxStatus === "success") {
			const areaPolygons = getValues("areaPolygons");

			drawRef.current.add(featureCollection(Object.values(areaPolygons!)));
		}

		resizeMap(false);
	}, [drawRef, resizeMap, boxStatus]);

	return (
		<Box
			sx={{
				height: "100%",
			}}
		>
			<Map
				mapboxAccessToken={savedNative.settings.mbxAccessToken}
				ref={mapRef}
				logoPosition="bottom-right"
				reuseMaps={true}
				attributionControl={false}
				mapStyle="mapbox://styles/mapbox/streets-v12"
			>
				<FullscreenControl position="top-left" />
				<DrawControl
					ref={drawRef}
					position="top-left"
					displayControlsDefault={false}
					controls={{
						polygon: true,
						trash: true,
					}}
					defaultMode="draw_polygon"
					onCreate={onUpdate}
					onUpdate={onUpdate}
					onDelete={onDelete}
				/>
				<ScaleControl position="bottom-left" />
			</Map>
		</Box>
	);
};

export { AreaTrapMap };
