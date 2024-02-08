import polyline from "@mapbox/polyline";
import { feature, featureCollection } from "@turf/helpers";
import { uniqWith } from "lodash";
import { prepareTraps } from "./prepareTraps";

const convertPolylineToGeojson = (data: radarTrap.Route): void => {
	if (data.directions === undefined) {
		return;
	}

	data.directions = data.directions!.map((rec) => {
		const directionFeature = feature(
			polyline.toGeoJSON(rec.direction.geometry),
		) as GeoJSON.Feature<GeoJSON.LineString>;

		rec.direction.directionFeature = directionFeature;

		return rec;
	});

	const directionsFeatureCollection = featureCollection(
		data.directions.map((rec) => rec.direction.directionFeature!),
	);

	data.directionsFeatureCollection = directionsFeatureCollection;

	let allTraps = data.directions.flatMap(({ routeTraps }) => prepareTraps(routeTraps!));

	allTraps = uniqWith(allTraps, (a, b) => {
		if (
			!a.properties?.linetrap &&
			!b.properties?.linetrap &&
			a.properties?.lat === b.properties?.lat &&
			a.properties?.lng === b.properties?.lng
		) {
			return true;
		}

		if (
			a.properties?.linetrap &&
			b.properties?.linetrap &&
			a.properties.lat === b.properties.lat &&
			a.properties.lng === b.properties.lng
		) {
			return true;
		}

		return false;
	});

	const trapsFeatureCollection = featureCollection(allTraps);

	data.trapsFeatureCollection = trapsFeatureCollection;
};

export { convertPolylineToGeojson };
