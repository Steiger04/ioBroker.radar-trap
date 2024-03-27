import polyline from "@mapbox/polyline";
import { feature, featureCollection } from "@turf/helpers";
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

	const allTraps = data.directions.flatMap(({ routeTraps }) => addTrapInfoToTrapProperties(routeTraps!));

	data.trapsFeatureCollection = featureCollection(allTraps);
};

export { routeTrapsWithTrapInfo };
