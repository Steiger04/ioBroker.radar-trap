import polyline from "@mapbox/polyline";
import { feature, featureCollection } from "@turf/helpers";
import { uniqWith } from "lodash";
import { addTrapInfoToTrapProperties } from "./addTrapInfoToTrapProperties";

const routeTrapsWithTrapInfo = (data: radarTrap.Route): void => {
	if (data.directions === undefined) {
		return;
	}

	data.directions = data.directions!.map((rec) => {
		const directionFeature = feature(
			polyline.toGeoJSON(rec.direction.geometry),
		) as GeoJSON.Feature<GeoJSON.LineString>;

		rec.direction.directionFeature = directionFeature;

		if (rec.routeTrapsNew !== undefined) addTrapInfoToTrapProperties(rec.routeTrapsNew);
		if (rec.routeTrapsEstablished !== undefined) addTrapInfoToTrapProperties(rec.routeTrapsEstablished);
		if (rec.routeTrapsRejected !== undefined) addTrapInfoToTrapProperties(rec.routeTrapsRejected);

		return rec;
	});

	const directionsFeatureCollection = featureCollection(
		data.directions.map((rec) => rec.direction.directionFeature!),
	);

	data.directionsFeatureCollection = directionsFeatureCollection;

	let allTraps = data.directions.flatMap(({ routeTraps }) => addTrapInfoToTrapProperties(routeTraps!));

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

	data.trapsFeatureCollection = featureCollection(allTraps);
};

export { routeTrapsWithTrapInfo };
