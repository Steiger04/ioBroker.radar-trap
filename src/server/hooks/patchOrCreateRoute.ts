import Directions, {
	DirectionsResponse,
	DirectionsService,
	DirectionsWaypoint,
} from "@mapbox/mapbox-sdk/services/directions";
import Matrix, { MatrixService } from "@mapbox/mapbox-sdk/services/matrix";
import { performance } from "perf_hooks";
import { Scheduler } from "../../lib/Scheduler";
import { trapsChain } from "./trapsChain";

import type { Hook, HookContext } from "@feathersjs/feathers";
import polyline from "@mapbox/polyline";
import { Feature, feature, LineString, Point, pointToLineDistance } from "@turf/turf";
import getPoiPolyPointsAsync, { AnalyzedType } from "../../lib/getPoiPolyPointsAsync";
import { determineTrapTypes } from "../../lib/atudo/determineTrapTypes";

const patchOrCreateRoute = (): Hook => {
	let directionsService: DirectionsService | null = null;
	let matrixService: MatrixService | null = null;

	return async (context: HookContext<radarTrap.Route>) => {
		if (!directionsService) {
			directionsService = Directions({
				accessToken: process.env.MAPBOX_TOKEN!,
			});
		}

		if (!matrixService) {
			matrixService = Matrix({
				accessToken: process.env.MAPBOX_TOKEN!,
			});
		}

		const { data, service, params } = context;
		const { _id, activeProfile, maxTrapDistance } = data!;

		data!.timestamp = new Date().toString();

		Scheduler.pause(_id);
		service.emit("status", { _id: data!._id, status: "loading" });

		const [record] = (await service.find({
			query: { _id },
			paginate: false,
		})) as radarTrap.Routes;

		if (params.patchSourceFromClient || params.patchSourceFromServer) {
			const matrix = await matrixService
				.getMatrix({
					points: [
						{
							coordinates: data!.src.geometry.coordinates,
						},
						{
							coordinates: data!.dst.geometry.coordinates,
						},
					] as DirectionsWaypoint[],
					sources: [0],
					//destinations: [1],
					profile: activeProfile!.name,
					annotations: ["duration", "distance"],
				})
				.send()
				.then((response) => response.body);

			console.log("matrix", matrix);

			const directions = await directionsService
				.getDirections({
					profile: activeProfile!.name,
					exclude:
						activeProfile!.actualExclusion.length > 0
							? (activeProfile!.actualExclusion.join(",") as any)
							: undefined,
					overview: "full",
					/* annotations: [
						"distance",
						"duration",
						"congestion",
						"speed",
					], */
					alternatives: false,
					waypoints: [
						{
							coordinates: data!.src.geometry.coordinates,
						},
						{
							coordinates: data!.dst.geometry.coordinates,
						},
					] as DirectionsWaypoint[],
				})
				.send()
				.then((response) => response.body)
				.catch((ex) => {
					console.log("Error in directionsService.getDirections()", ex);
				});

			data!.directions = [];

			for (const route of (directions as DirectionsResponse<string>).routes) {
				try {
					const startTime = performance.now();
					const directionLine = feature<LineString, radarTrap.Poi>(polyline.toGeoJSON(route.geometry));

					let { resultPoiPoints } = await getPoiPolyPointsAsync(directionLine, AnalyzedType.LINESTRING);

					resultPoiPoints = resultPoiPoints.filter((poiPoint) => {
						const trapDistance = pointToLineDistance(poiPoint, directionLine, {
							units: "meters",
						});

						return trapDistance <= maxTrapDistance;
					});

					console.log("resultPoiPoints >>>", resultPoiPoints.length);

					const traps = determineTrapTypes(resultPoiPoints as Feature<Point, radarTrap.Poi>[]);

					const endTime = performance.now();
					console.log(`getTrapsFrom() dauerte: ${(endTime - startTime) / 1_000} Sekunden`);

					route.duration = matrix.durations![0][1];
					const length = data!.directions.push({ direction: route, matrix });

					const {
						traps: routeTraps,
						newTrapsReduced,
						rejectedTrapsReduced,
					} = trapsChain(record?.directions![length - 1].routeTraps, traps);

					data!.directions[length - 1].routeTraps = routeTraps;
					data!.directions[length - 1].routeTrapsNew = newTrapsReduced;
					data!.directions[length - 1].routeTrapsRejected = rejectedTrapsReduced;
				} catch (error) {
					console.log(error);
				}
			}
		}

		if (record !== undefined) {
			context.result = await service.patch(_id, data as Partial<radarTrap.Route>, {
				...params,
				publishEvent: false,
			});

			// return context;
		}

		return context;
	};
};

export { patchOrCreateRoute };
