import { featureCollection } from "@turf/helpers";
import { determineTrapTypes } from "../../lib/atudo/determineTrapTypes";
// import { traps } from "../../lib/atudo/traps";
import { Scheduler } from "../../lib/Scheduler";

import type { Hook, HookContext } from "@feathersjs/feathers";
import { trapsChain } from "./trapsChain";
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
			query: { _id, $select: ["areaTraps"] },
			paginate: false,
		})) as Partial<radarTrap.Areas>;

		if (params.patchSourceFromClient || params.patchSourceFromServer) {
			const areaPolygon = Object.values(data!.areaPolygons!)[0];

			// eslint-disable-next-line prefer-const
			let { resultPoiPoints, resultPolyLines } = await getPoiPolyPointsAsync({
				analyzedFeature: areaPolygon,
				type: AnalyzedType.POLYGONE,
			});

			if (process.env.NODE_ENV === "development") {
				console.log("resultPoiPoints >>>", resultPoiPoints.length);
				console.log("resultPolyLines >>>", resultPolyLines.length);
			}

			data!.polyLinesFeatureCollection = featureCollection(resultPolyLines);

			const resultTypeTraps = determineTrapTypes(resultPoiPoints);
			const {
				traps: areaTraps,
				establishedTraps,
				newTraps,
				rejectedTraps,
			} = trapsChain(record?.areaTraps, resultTypeTraps);

			data!.areaTraps = areaTraps;
			data!.areaTrapsEstablished = establishedTraps;
			data!.areaTrapsNew = newTraps;
			data!.areaTrapsRejected = rejectedTraps;
			// data!.areaTrapsNew = newTraps;
			// data!.areaTrapsRejected = rejectedTraps;
		}

		if (record !== undefined) {
			context.result = await service.patch(_id, data as Partial<radarTrap.Area>, {
				...params,
				publishEvent: false,
			});
		}

		const endTime = performance.now();
		if (process.env.NODE_ENV === "development")
			console.log(`patchOrCreateArea() dauerte: ${(endTime - startTime) / 1_000} Sekunden`);

		return context;
	};
};

export { patchOrCreateArea };
