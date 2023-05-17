import bbox from "@turf/bbox";
import { BBox, Coord, featureCollection } from "@turf/helpers";
import { useCallback, useEffect, useState } from "react";
import { square, useRadarTrapSource } from "..";

const cache = new Map();

const useRadarTrapMapBox = (
	routeId: null | string,
): { status: radarTrap.GenericStatus; directionsBox: BBox | null } => {
	const [status, setStatus] = useState<radarTrap.GenericStatus>("idle");
	const [directionsBox, setDirectionsBox] = useState<BBox | null>(null);

	const {
		source: { directionsFeatureCollection, areaPolygons },
		areaSourceStatus,
		routeSourceStatus,
	} = useRadarTrapSource(routeId);

	const fetchData = useCallback(async (): Promise<void> => {
		//console.log("useRadarTrapMapBox() -> fetchData");

		const url = "http://ip-api.com/json?fields=lon,lat";

		let json: Record<string, number> | ArrayLike<number>;

		setStatus("loading");
		if (cache.has(url)) {
			json = cache.get(url);
		} else {
			json = await fetch(url)
				.then(async (response) => response.json())
				.catch((ex) => {
					setStatus("error");
					console.log(
						`useRadarTrapMapBox() -> fetch(): url=${url} -> Error: ${ex}`,
					);
				});

			cache.set(url, json);
		}

		const coord: Coord = Object.values(json);
		const box: BBox = bbox(square(coord, 10));

		setDirectionsBox([
			Number(box[1].toFixed(5)),
			Number(box[0].toFixed(5)),
			Number(box[3].toFixed(5)),
			Number(box[2].toFixed(5)),
		]);

		setStatus("success");
	}, []);

	useEffect(() => {
		if (areaSourceStatus === "error" && routeSourceStatus === "error") {
			fetchData().catch((ex) => {
				setStatus("error");
				console.log(
					`useRadarTrapMapBox() -> fetchData() -> Error: ${ex}`,
				);
			});
		}
	}, [areaSourceStatus, routeSourceStatus]);

	useEffect(() => {
		if (areaSourceStatus === "success") {
			setDirectionsBox(
				bbox(featureCollection(Object.values(areaPolygons!))),
			);
			setStatus("success");

			return;
		}

		if (areaSourceStatus === "loading") {
			setStatus("loading");

			return;
		}
	}, [areaSourceStatus]);

	useEffect(() => {
		if (routeSourceStatus === "success") {
			setDirectionsBox(bbox(directionsFeatureCollection));
			setStatus("success");

			return;
		}

		if (routeSourceStatus === "loading") {
			setStatus("loading");

			return;
		}
	}, [routeSourceStatus]);

	/* useEffect(() => {
		console.log(
			"useRadarTrapMapBox() -> areaSourceStatus:",
			areaSourceStatus,
		);
		console.log("useRadarTrapMapBox() -> areaPolygons:", areaPolygons);
	}, [areaSourceStatus]); */

	/* useEffect(() => {
		console.log(
			"useRadarTrapMapBox() -> routeSourceStatus:",
			routeSourceStatus,
		);
		console.log(
			"useRadarTrapMapBox() -> directionsFeatureCollection:",
			directionsFeatureCollection,
		);
	}, [routeSourceStatus]); */

	return { status, directionsBox };
};

export { useRadarTrapMapBox };
