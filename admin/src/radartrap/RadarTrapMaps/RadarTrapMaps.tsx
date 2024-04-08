import { Box } from "@mui/material";
import { featureCollection } from "@turf/helpers";
import { useCallback, useEffect, useState } from "react";
import Map, {
	GeoJSONSource,
	Layer,
	LayerProps,
	LngLatLike,
	MapLayerMouseEvent,
	MapRef,
	Popup,
	ScaleControl,
	Source,
} from "react-map-gl";
import { MapMenu } from "..";
import { useAppData } from "../../App";
import { mapStyles, useInvisibleBottomButtons, useMapImages, useRadarTrapSource, useResizeMap } from "../../lib";
import { TrapInfo } from "./TrapInfo";

// import mapboxgl from "mapbox-gl";

import type { FC, ReactElement } from "react";

const RadarTrapMaps: FC = (): ReactElement => {
	const { feathers, savedNative } = useAppData();
	const [mapRef, setMapRef] = useState<MapRef | null>(null);

	useMapImages(mapRef);

	const [routeId, setRouteId] = useState<null | string>(null);

	const [trapInfo, setTrapInfo] = useState<radarTrap.trapInfo | null>(null);

	/* const {
		source: { directionsFeatureCollection, trapsFeatureCollection, polysFeatureCollection, areaPolygons },
	} = useRadarTrapSource(routeId, feathers); */

	const {
		source: { directionsFeatureCollection, trapsFeatureCollection, polyLinesFeatureCollection, areaPolygons },
	} = useRadarTrapSource(routeId, feathers);

	const [cursor, setCursor] = useState<string>("");

	const { bottomButtons } = useInvisibleBottomButtons();

	const mouseEnterHandler = useCallback(() => setCursor("pointer"), []);
	const mouseLeaveHandler = useCallback(() => setCursor(""), []);

	const clickHandler = (event: MapLayerMouseEvent) => {
		const feature = event.features && event.features[0];

		if (!feature) {
			return;
		}

		console.log("feature", feature);

		if (trapInfo !== null) {
			setTrapInfo(null);
		}

		const clusterId = feature.properties!.cluster_id;
		const sourceId = feature.source;
		const mapboxSource = mapRef!.getSource(sourceId) as GeoJSONSource;

		switch (feature.layer.id) {
			case "traffic-closure":
				const address = JSON.parse(feature.properties!.address);

				setTimeout(
					() =>
						setTrapInfo({
							typeText: "Verkehrssperrung",
							country: address.country,
							zipCode: address.zip,
							city: address.city,
							street: address.street,
							longitude: event.lngLat.lng,
							latitude: event.lngLat.lat,
						}),
					0,
				);
				break;

			case "traps":
				setTimeout(() => {
					setTrapInfo({
						...JSON.parse(feature.properties!.trapInfo),
						longitude: event.lngLat.lng,
						latitude: event.lngLat.lat,
					});
				}, 0);
				break;

			case "speed-traps":
				setTimeout(
					() =>
						setTrapInfo({
							...JSON.parse(feature.properties!.trapInfo),
							longitude: event.lngLat.lng,
							latitude: event.lngLat.lat,
						}),
					0,
				);
				break;

			case "cluster-traps":
				mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
					if (err) {
						return;
					}

					const geometry = feature.geometry as GeoJSON.Point;

					mapRef!.easeTo({
						center: geometry.coordinates as LngLatLike,
						zoom,
						duration: 750,
					});
				});
				break;

			default:
				break;
		}
	};

	const { resizeMap } = useResizeMap({
		_id: routeId,
		map: mapRef,
		feathers,
	});

	useEffect(() => {
		resizeMap(true);
	}, [resizeMap]);

	return (
		<>
			{!bottomButtons ? (
				<Box
					sx={{
						/* bgcolor: "blue", */
						height: "100%",
					}}
				>
					<Map
						mapboxAccessToken={savedNative.settings.mbxAccessToken}
						// mapLib={mapboxgl}
						/* projection="globe" */
						ref={setMapRef}
						logoPosition="bottom-right"
						reuseMaps={true}
						attributionControl={false}
						mapStyle="mapbox://styles/mapbox/streets-v12"
						interactiveLayerIds={["cluster-traps", "traps", "traffic-closure"]}
						cursor={cursor}
						onClick={clickHandler}
						onMouseEnter={mouseEnterHandler}
						onMouseLeave={mouseLeaveHandler}
					>
						{/* {routesStatus === "success" && ( */}
						<MapMenu
							{...{
								routeId,
								setRouteId,
								resizeMap,
							}}
						/>
						{/* )} */}

						{trapInfo && (
							<Popup
								maxWidth="auto"
								longitude={trapInfo.longitude!}
								latitude={trapInfo.latitude!}
								closeButton={false}
							>
								<TrapInfo info={trapInfo} />
							</Popup>
						)}

						<ScaleControl position="bottom-left" />

						<Source
							type="geojson"
							data={
								areaPolygons
									? featureCollection(Object.values(areaPolygons!)).features[0]
									: featureCollection([])
							}
						>
							<Layer {...(mapStyles.areaSurface as LayerProps)} />
							<Layer {...(mapStyles.areaSurfaceBorder as LayerProps)} />
						</Source>

						<Source type="geojson" data={directionsFeatureCollection!}>
							<Layer {...(mapStyles.route as LayerProps)} />
						</Source>

						<Source type="geojson" data={polyLinesFeatureCollection!}>
							<Layer {...(mapStyles.lineBackground as LayerProps)} />
							<Layer {...(mapStyles.lineDashed as LayerProps)} />
							<Layer {...(mapStyles.trafficClosure as LayerProps)} />
							{/* <Layer {...(mapStyles.traffic20 as LayerProps)} /> */}
						</Source>

						{/* <Source id="traps" type="geojson" data={trapsFeatureCollection!} cluster> */}
						<Source type="geojson" data={trapsFeatureCollection!} cluster>
							{/* <Layer {...(mapStyles.speedTraps as LayerProps)} /> */}
							{/* <Layer {...(mapStyles.speedTrapsVmax as LayerProps)} /> */}
							<Layer {...(mapStyles.traps as LayerProps)} />
							<Layer {...(mapStyles.clusterTraps as LayerProps)} />
							<Layer {...(mapStyles.clusterTrapsCount as LayerProps)} />
						</Source>
					</Map>
				</Box>
			) : null}
		</>
	);
};

export { RadarTrapMaps };
