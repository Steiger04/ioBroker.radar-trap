import { Feature, featureCollection, LineString, Point } from "@turf/helpers";
import { determineTrapTypes } from "../../lib/atudo/determineTrapTypes";
// import { traps } from "../../lib/atudo/traps";
import { Scheduler } from "../../lib/Scheduler";

import type { Hook, HookContext } from "@feathersjs/feathers";
import { trapsChain } from "./trapsChain";
import { feature, featureReduce } from "@turf/turf";
import polyline from "@mapbox/polyline";
import getPoiPolyPointsAsync, { AnalyzedType } from "../../lib/getPoiPolyPointsAsync";

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

			// eslint-disable-next-line prefer-const
			let { resultPoiPoints, resultPolyPoints, resultPolyLines } = await getPoiPolyPointsAsync({
				analyzedFeature: areaPolygon,
				type: AnalyzedType.POLYGONE,
			});
			console.log("resultPoiPoints >>>", resultPoiPoints.length);
			console.log("resultPolyPoints >>>", resultPolyPoints.length);
			console.log("resultPolyLines >>>", resultPolyLines.length);

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

			data!.polyLinesFeatureCollection = featureCollection(resultPolyLines);

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
		console.log(`patchOrCreateArea2() dauerte: ${(endTime - startTime) / 1_000} Sekunden`);

		return context;
	};
};

export { patchOrCreateArea };
