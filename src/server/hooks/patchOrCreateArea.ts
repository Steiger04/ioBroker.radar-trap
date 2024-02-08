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
import { differenceBy, mergeWith, intersectionBy, mapKeys, flatten, reduce } from "lodash";

const patchOrCreateArea = (): Hook => {
	return async (context: HookContext<radarTrap.Area>) => {
		const startTime = performance.now();
		const { data, service, params } = context;
		const { _id } = data!;

		data!.timestamp = new Date().toString();

		Scheduler.pause(_id);
		service.emit("status", { _id: data!._id, status: "loading" });

		const [record] = (await service.find({
			query: { _id, $select: ["areaTraps"] },
			paginate: false,
		})) as Partial<radarTrap.Areas>;

		if (params.patchSourceFromClient || params.patchSourceFromServer) {
			const areaPolygon = Object.values(data!.areaPolygons!)[0];

			const areaBox = bbox(areaPolygon);

			const squareBox = square(areaBox);

			const squareBoxPolygon = transformScale(bboxPolygon(squareBox), 1.3);

			const sideLength = Math.sqrt(area(squareBoxPolygon)) / 1e3;

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

			const reducedSquareBoxGrid = featureCollection(
				squareBoxGrid.features.filter((feature) => {
					return booleanOverlap(areaPolygon, feature) || booleanContains(areaPolygon, feature);
				}),
			);

			let resultTraps: Feature<Point>[] = [];
			let resultPolyPoints: Feature<Point>[] = [];
			let resultPolyLines: Feature<Point | LineString>[] = [];

			for (const feature of reducedSquareBoxGrid.features) {
				const tmpBbox = bbox(feature);

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

				resultPolyPoints = resultPolyPoints.concat(polyPoints);
				resultTraps = resultTraps.concat(gridTraps);
			}

			resultPolyPoints = pointsWithinPolygon(featureCollection(resultPolyPoints), areaPolygon).features;
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

			resultTraps = pointsWithinPolygon(featureCollection(resultTraps), areaPolygon).features;
			const resultTypeTraps = determineTrapTypes(resultTraps);

			const newTraps = mapKeys(
				mergeWith<radarTrap.Area["areaTraps"], radarTrap.Area["areaTraps"]>(
					{ ...(record?.areaTraps || {}) },
					resultTypeTraps,
					(objValue, srcValue) =>
						differenceBy<Feature<Point>, Feature<Point>>(
							srcValue,
							objValue || [],
							"properties.backend",
						).map((item) => ({
							...item,
							properties: { ...item.properties, status: "NEW" },
						})),
				),
				(_, key) => `${key}New`,
			);
			if (process.env.NODE_ENV === "development") console.log("newTraps >>>", newTraps);

			const establishedTraps = mapKeys(
				mergeWith<radarTrap.Area["areaTraps"], radarTrap.Area["areaTraps"]>(
					{ ...(record?.areaTraps || {}) },
					resultTypeTraps,
					(objValue, srcValue) =>
						intersectionBy<Feature<Point>, Feature<Point>>(
							objValue || [],
							srcValue,
							"properties.backend",
						).map((item) => ({
							...item,
							properties: { ...item.properties, status: "ESTABLISHED" },
						})),
				),
				(_, key) => `${key}Established`,
			);
			if (process.env.NODE_ENV === "development") console.log("establishedTraps >>>", establishedTraps);

			const rejectedTraps = mapKeys(
				mergeWith<radarTrap.Area["areaTraps"], radarTrap.Area["areaTraps"]>(
					{ ...(record?.areaTraps || {}) },
					resultTypeTraps,
					(objValue, srcValue) =>
						differenceBy<Feature<Point>, Feature<Point>>(
							objValue || [],
							srcValue,
							"properties.backend",
						).map((item) => ({
							...item,
							properties: { ...item.properties, status: "REJECTED" },
						})),
				),
				(_, key) => `${key}Rejected`,
			);
			if (process.env.NODE_ENV === "development") console.log("rejectedTraps >>>", rejectedTraps);

			const areaTraps = mergeWith<radarTrap.Area["areaTraps"], radarTrap.Area["areaTraps"]>(
				{ ...mapKeys(establishedTraps, (_, key) => key.substring(0, key.length - 11)) },
				mapKeys(newTraps, (_, key) => key.substring(0, key.length - 3)),
				(objValue, srcValue) => flatten<Feature<Point>>([objValue, srcValue]),
			);
			if (process.env.NODE_ENV === "development") console.log("areaTraps >>>", areaTraps);

			const newTrapsReduced = reduce<
				NonNullable<radarTrap.Area["areaTrapsNew"]>,
				NonNullable<radarTrap.Area["areaTrapsNew"]>
			>(
				newTraps,
				function (acc, value) {
					acc.trapsNew.push(...value);
					return acc;
				},
				{ trapsNew: [] },
			);
			if (process.env.NODE_ENV === "development") console.log("newTrapsReduced >>>", newTrapsReduced);

			const rejectedTrapsReduced = reduce<
				NonNullable<radarTrap.Area["areaTrapsRejected"]>,
				NonNullable<radarTrap.Area["areaTrapsRejected"]>
			>(
				rejectedTraps,
				function (acc, value) {
					acc.trapsRejected.push(...value);
					return acc;
				},
				{ trapsRejected: [] },
			);
			if (process.env.NODE_ENV === "development") console.log("rejectedTrapsReduced >>>", rejectedTrapsReduced);

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
