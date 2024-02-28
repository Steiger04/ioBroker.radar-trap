import area from "@turf/area";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import booleanContains from "@turf/boolean-contains";
import booleanOverlap from "@turf/boolean-overlap";
import { Feature, featureCollection, LineString, Point } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";
import square from "@turf/square";
import squareGrid from "@turf/square-grid";
import { determineTrapTypes } from "../../lib/atudo/determineTrapTypes";
import { traps } from "../../lib/atudo/traps";
import { Scheduler } from "../../lib/Scheduler";

import type { Hook, HookContext } from "@feathersjs/feathers";
import transformScale from "@turf/transform-scale";
import { trapsChain } from "./trapsChain";
import { feature, featureReduce } from "@turf/turf";
import polyline from "@mapbox/polyline";

const patchOrCreateArea = (): Hook => {
	return async (context: HookContext<radarTrap.Area>) => {
		const startTime = performance.now();
		const { data, service, params } = context;
		const { _id } = data!;

		data!.timestamp = new Date().toString();

		Scheduler.pause(_id);
		service.emit("status", { _id: data!._id, status: "loading" });

		const [record] = (await service.find({
			query: { _id, $select: ["areaTraps", "polysFeatureCollection"] },
			paginate: false,
		})) as Partial<radarTrap.Areas>;

		if (params.patchSourceFromClient || params.patchSourceFromServer) {
			const areaPolygon = Object.values(data!.areaPolygons!)[0];

			const squareBox = square(bbox(areaPolygon));

			const squareBoxPolygon = transformScale(bboxPolygon(squareBox), 1.3);

			const sideLength = Math.sqrt(area(squareBoxPolygon)) / 1_000;

			let sideLengthDivisor = 0;

			if (sideLength > 3000) {
				sideLengthDivisor = 80;
			} else if (sideLength > 1_500) {
				sideLengthDivisor = 60;
			} else if (sideLength > 900) {
				sideLengthDivisor = 25;
			} else if (sideLength > 500) {
				sideLengthDivisor = 15;
			} else if (sideLength > 100) {
				sideLengthDivisor = 10;
			} else {
				sideLengthDivisor = 10;
			}

			const squareBoxGrid = squareGrid(bbox(squareBoxPolygon), sideLength / sideLengthDivisor);

			const reducedSquareBoxGrid = featureCollection(
				squareBoxGrid.features.filter((feature) => {
					return booleanOverlap(areaPolygon, feature) || booleanContains(areaPolygon, feature);
				}),
			);

			let resultPoiPoints: Feature<Point, radarTrap.Poi>[] = [];
			let resultPolyPoints: Feature<Point, radarTrap.Poly>[] = [];

			for (const feature of reducedSquareBoxGrid.features) {
				const tmpBbox = bbox(feature);

				const { polyPoints, poiPoints } = await traps(
					{
						lng: tmpBbox[0],
						lat: tmpBbox[1],
					},
					{
						lng: tmpBbox[2],
						lat: tmpBbox[3],
					},
				);

				if (poiPoints.length > 499) console.log("gridTraps >>>", poiPoints.length);

				resultPolyPoints = resultPolyPoints.concat(polyPoints);
				resultPoiPoints = resultPoiPoints.concat(poiPoints);
			}

			resultPolyPoints = pointsWithinPolygon(featureCollection(resultPolyPoints), areaPolygon).features;

			let resultPolys: Feature<Point | LineString, radarTrap.Poly>[] = [];
			resultPolys = featureReduce(
				featureCollection(resultPolyPoints),
				(features: Feature<Point | LineString, radarTrap.Poly>[], currentFeature) => {
					if (currentFeature.properties.type === "closure") {
						features.push(currentFeature);

						if (currentFeature.properties.polyline !== "") {
							features.push(
								feature<LineString, radarTrap.Poly>(
									polyline.toGeoJSON(currentFeature.properties.polyline as string),
									{
										...currentFeature.properties,
										type: "120",
									},
								),
							);
						}
					}

					if (currentFeature.properties.type === "20") {
						if (currentFeature.properties.polyline !== "") {
							features.push(
								feature<LineString, radarTrap.Poly>(
									polyline.toGeoJSON(currentFeature.properties.polyline as string),
									{
										...currentFeature.properties,
										type: "120",
									},
								),
							);
						}
					}

					return features;
				},
				[],
			);

			const { traps: allPolys } = trapsChain<radarTrap.Poly>(
				{ allPolys: record?.polysFeatureCollection?.features || [] },
				{ allPolys: resultPolys },
			);
			data!.polysFeatureCollection = featureCollection(allPolys.allPolys);

			resultPoiPoints = pointsWithinPolygon(featureCollection(resultPoiPoints), areaPolygon).features;
			const resultTypeTraps = determineTrapTypes(resultPoiPoints);
			const {
				traps: areaTraps,
				newTrapsReduced,
				rejectedTrapsReduced,
			} = trapsChain(record?.areaTraps, resultTypeTraps);

			data!.areaTraps = areaTraps;
			data!.areaTrapsNew = newTrapsReduced;
			data!.areaTrapsRejected = rejectedTrapsReduced;
			// data!.areaTrapsNew = newTraps;
			// data!.areaTrapsEstablished = establishedTraps;
			// data!.areaTrapsRejected = rejectedTraps;
		}

		if (record !== undefined) {
			context.result = await service.patch(_id, data as Partial<radarTrap.Area>, {
				...params,
				publishEvent: false,
			});
		}

		const endTime = performance.now();
		console.log(`patchOrCreateArea() dauerte: ${(endTime - startTime) / 1_000} Sekunden`);

		return context;
	};
};

export { patchOrCreateArea };
