import polyline from "@mapbox/polyline";
import { feature, featureCollection } from "@turf/helpers";
import { uniqWith } from "lodash";
import { addTrapInfoToTrapProperties } from "./addTrapInfoToTrapProperties";
import { LineString, Point } from "@turf/turf";

const routeTrapsWithTrapInfo = (data: radarTrap.Route): void => {
	if (data.directions === undefined) {
		return;
	}

	data.directions = data.directions!.map((rec) => {
		const directionFeature = feature<LineString, radarTrap.Poi>(polyline.toGeoJSON(rec.direction.geometry));

		rec.direction.directionFeature = directionFeature;

		if (rec.routeTrapsNew !== undefined) addTrapInfoToTrapProperties(rec.routeTrapsNew);
		if (rec.routeTrapsEstablished !== undefined) addTrapInfoToTrapProperties(rec.routeTrapsEstablished);
		if (rec.routeTrapsRejected !== undefined) addTrapInfoToTrapProperties(rec.routeTrapsRejected);

		return rec;
	});

	const directionsFeatureCollection = featureCollection<Point | LineString, radarTrap.Poi>(
		data.directions.map((rec) => rec.direction.directionFeature!),
	);

	data.directionsFeatureCollection = directionsFeatureCollection;

	const polyLinesFeatureCollection = featureCollection<LineString, radarTrap.Poly>(
		data.directions.flatMap((rec) => rec.polyLineFeatures!),
	);

	data.polyLinesFeatureCollection = polyLinesFeatureCollection;

	let allTraps = data.directions.flatMap(({ routeTraps }) => addTrapInfoToTrapProperties(routeTraps!));

	allTraps = uniqWith(allTraps, (a, b) => {
		if (a.properties.schemaType === "POI" && b.properties.schemaType === "POI") {
			if (
				!a.properties.linetrap &&
				!b.properties.linetrap &&
				a.properties.lat === b.properties.lat &&
				a.properties.lng === b.properties.lng
			) {
				return true;
			}

			if (
				a.properties.linetrap &&
				b.properties.linetrap &&
				a.properties.lat === b.properties.lat &&
				a.properties.lng === b.properties.lng
			) {
				return true;
			}
		}

		return false;
	});

	data.trapsFeatureCollection = featureCollection(allTraps);
};

export { routeTrapsWithTrapInfo };
