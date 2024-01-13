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
import {
	mapStyles,
	/* useAnimationFrame, */
	useInvisibleBottomButtons,
	useMapImages,
	// useRadarTrapSource,
	useRadarTrapSource,
	useResizeMap,
} from "../../lib";
import { TrapInfo } from "./TrapInfo";

import type { FC, ReactElement } from "react";

const RadarTrapMaps: FC = (): ReactElement => {
	const { feathers, savedNative } = useAppData();
	const [mapRef, setMapRef] = useState<MapRef | null>(null);

	useMapImages(mapRef);

	const [routeId, setRouteId] = useState<null | string>(null);

	const [trapInfo, setTrapInfo] = useState<radarTrap.trapInfo | null>(null);

	const {
		source: { directionsFeatureCollection, trapsFeatureCollection, polysFeatureCollection, areaPolygons },
	} = useRadarTrapSource(routeId, feathers);

	const [cursor, setCursor] = useState<string>("");

	const { bottomButtons } = useInvisibleBottomButtons();

	const mouseEnterHandler = useCallback(() => setCursor("pointer"), []);
	const mouseLeaveHandler = useCallback(() => setCursor(""), []);

	/* useAnimationFrame((timestamp, step) => {
		if (!mapRef.current || !mapRef.current.isStyleLoaded()) return step;

		const dashArraySequence = [
			[0, 4, 3],
			[0.5, 4, 2.5],
			[1, 4, 2],
			[1.5, 4, 1.5],
			[2, 4, 1],
			[2.5, 4, 0.5],
			[3, 4, 0],
			[0, 0.5, 3, 3.5],
			[0, 1, 3, 3],
			[0, 1.5, 3, 2.5],
			[0, 2, 3, 2],
			[0, 2.5, 3, 1.5],
			[0, 3, 3, 1],
			[0, 3.5, 3, 0.5],
		];

		const newStep = parseInt(
			((timestamp / 50) % dashArraySequence.length).toString(),
		);

		if (newStep !== step) {
			if (mapRef.current) {
				console.log("jetzt wird getMap ausgeführt");
				mapRef.current
					?.getMap()
					.setPaintProperty(
						"line-dashed",
						"line-dasharray",
						dashArraySequence[step],
					);
				step = newStep;
			}
		}

		return step;
	}); */

	const clickHandler = (event: MapLayerMouseEvent) => {
		const feature = event.features && event.features[0];

		if (trapInfo !== null) {
			setTrapInfo(null);
		}

		if (!feature) {
			return;
		}

		const clusterId = feature.properties!.cluster_id;
		const sourceId = feature.source;
		const mapboxSource = mapRef!.getSource(sourceId) as GeoJSONSource;

		switch (feature.layer.id) {
			case "traffic-closure":
				const address = JSON.parse(feature.properties!.address);

				setTrapInfo({
					typeText: "Verkehrssperrung",
					country: address.country,
					zipCode: address.zip,
					city: address.city,
					street: address.street,
					longitude: event.lngLat.lng,
					latitude: event.lngLat.lat,
				});
				break;

			case "traps":
				setTrapInfo({
					...JSON.parse(feature.properties!.trapInfo),
					longitude: event.lngLat.lng,
					latitude: event.lngLat.lat,
				});
				break;

			case "speed-traps":
				setTrapInfo({
					...JSON.parse(feature.properties!.trapInfo),
					longitude: event.lngLat.lng,
					latitude: event.lngLat.lat,
				});
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
						/* projection="globe" */
						ref={setMapRef}
						logoPosition="bottom-right"
						reuseMaps={true}
						attributionControl={false}
						mapStyle="mapbox://styles/mapbox/streets-v12"
						interactiveLayerIds={["cluster-traps", "traps", "speed-traps", "traffic-closure"]}
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

						<Source type="geojson" data={polysFeatureCollection!}>
							<Layer {...(mapStyles.lineBackground as LayerProps)} />
							<Layer {...(mapStyles.lineDashed as LayerProps)} />
							<Layer {...(mapStyles.trafficClosure as LayerProps)} />
						</Source>

						<Source
							type="geojson"
							data={trapsFeatureCollection!}
							cluster={true}
							clusterMaxZoom={14}
							clusterRadius={50}
						>
							<Layer {...(mapStyles.speedTraps as LayerProps)} />
							<Layer {...(mapStyles.speedTrapsVmax as LayerProps)} />
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
