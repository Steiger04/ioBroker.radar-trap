import area from "@turf/area";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import booleanContains from "@turf/boolean-contains";
import booleanOverlap from "@turf/boolean-overlap";
import { feature, Feature, featureCollection, LineString, Point, Properties } from "@turf/helpers";
import pointsWithinPolygon from "@turf/points-within-polygon";
import square from "@turf/square";
import squareGrid from "@turf/square-grid";
import { determineTrapTypes } from "../../lib/atudo/determineTrapTypes";
import { traps } from "../../lib/atudo/traps";
import { Scheduler } from "../../lib/Scheduler";

import type { Hook, HookContext } from "@feathersjs/feathers";
import polyline from "@mapbox/polyline";
import { featureReduce } from "@turf/meta";
import transformScale from "@turf/transform-scale";
import console from "console";

const patchOrCreateArea = (): Hook => {
	return async (context: HookContext<radarTrap.Area>) => {
		const startTime = performance.now();
		const { data, service, params } = context;
		const { _id } = data!;

		data!.timestamp = new Date();

		Scheduler.pause(_id);
		service.emit("status", { _id: data!._id, status: "loading" });

		const [record] = (await service.find({
			query: { _id },
			paginate: false,
		})) as radarTrap.Areas;

		// console.log("record", record);

		if (params.patchSourceFromClient || params.patchSourceFromServer) {
			const areaPolygon = Object.values(data!.areaPolygons!)[0];
			// console.log("areaPolygon", areaPolygon.geometry.coordinates);

			const areaBox = bbox(areaPolygon);
			// console.log("areaBox", areaBox);

			const squareBox = square(areaBox);
			// console.log("squareBox", squareBox);

			const squareBoxPolygon = transformScale(bboxPolygon(squareBox), 1.3);
			// console.log("squareBoxPolygon", squareBoxPolygon);

			const sideLength = Math.sqrt(area(squareBoxPolygon)) / 1e3;
			// console.log("sideLength", sideLength);

			let sideLengthDivisor = 0;

			if (sideLength > 3000) {
				sideLengthDivisor = 80;
			} else if (sideLength > 1500) {
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
			// console.log("squareBoxGrid", squareBoxGrid.features.length);

			const reducedSquareBoxGrid = featureCollection(
				squareBoxGrid.features.filter((feature) => {
					// console.log("feature::", feature.geometry!.coordinates);
					return booleanOverlap(areaPolygon, feature) || booleanContains(areaPolygon, feature);
				}),
			);

			/* console.log(
				"reducedSquareBoxGrid",
				reducedSquareBoxGrid.features.length,
			); */

			let resultTraps: Feature<Point>[] | Record<string, Feature<Point, Properties>[]> = [];

			let resultPolyPoints: Feature<Point>[] = [];
			let resultPolyLines: Feature<Point | LineString>[] = [];

			for (const feature of reducedSquareBoxGrid.features) {
				const tmpBbox = bbox(feature);
				// console.log("feature coordinates", tmpBbox);

				const { polyPoints, trapPoints: gridTraps } = await traps(
					{
						lng: tmpBbox[0],
						lat: tmpBbox[1],
					},
					{
						lng: tmpBbox[2],
						lat: tmpBbox[3],
					},
				);

				if (gridTraps.length > 499) console.log("gridTraps >>>", gridTraps.length);

				resultTraps = resultTraps.concat(gridTraps);
				resultPolyPoints = resultPolyPoints.concat(polyPoints);
			}

			// console.log("resultPolyPoints", resultPolyPoints.length);
			// console.log("resultTraps", resultTraps.length);
			// console.log("resultTraps", JSON.stringify(resultTraps, null, 4));

			resultTraps = pointsWithinPolygon(featureCollection(resultTraps), areaPolygon).features;

			resultPolyPoints = pointsWithinPolygon(featureCollection(resultPolyPoints), areaPolygon).features;

			/* console.log(
				"resultPolyPoints after reduction",
				resultPolyPoints.length,
			); */

			// console.log("resultTraps after reduction", resultTraps.length);

			resultTraps = determineTrapTypes(resultTraps);
			// console.log("resultTraps", JSON.stringify(resultTraps, null, 4));

			const endTime = performance.now();
			console.log(`patchOrCreateArea() dauerte: ${(endTime - startTime) / 1_000} Sekunden`);

			data!.areaTraps = resultTraps;

			// console.log("resultPolyPoints", resultPolyPoints);

			resultPolyLines = featureReduce(
				featureCollection(resultPolyPoints),
				(features: Feature<Point | LineString, Properties>[], tmpFeature) => {
					features.push(tmpFeature);
					features.push(
						feature<LineString, Properties>(polyline.toGeoJSON(tmpFeature.properties!.polyline as string), {
							...tmpFeature.properties!,
						}),
					);

					return features;
				},
				[],
			);

			data!.polysFeatureCollection = featureCollection(resultPolyLines);
		}

		if (record !== undefined) {
			context.result = await service.patch(_id, data as Partial<radarTrap.Area>, {
				...params,
				publishEvent: false,
			});

			return context;
		}

		return context;
	};
};

export { patchOrCreateArea };
