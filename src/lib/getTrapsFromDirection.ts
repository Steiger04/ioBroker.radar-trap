import polyline from "@mapbox/polyline";
import along from "@turf/along";
import destination from "@turf/destination";
import { feature } from "@turf/helpers";
import length from "@turf/length";
import pointToLineDistance from "@turf/point-to-line-distance";
import { uniqWith } from "lodash";
import { determineTrapTypes } from "./atudo/determineTrapTypes";
import { traps } from "./atudo/traps";

type GetTrapsFromAtude = { direction: string; maxTrapDistance: number };

const getTrapsFromDirection = async ({
	direction,
	maxTrapDistance,
}: GetTrapsFromAtude): Promise<
	Record<string, GeoJSON.Feature<GeoJSON.Point>[]>
> => {
	const directionLine = feature<
		GeoJSON.LineString,
		GeoJSON.GeoJsonProperties
	>(polyline.toGeoJSON(direction));

	let resultTraps: GeoJSON.Feature<GeoJSON.Point>[] = [];
	const directionSteps = Math.trunc(length(directionLine) / 6);

	// Console.log('directionSteps', directionSteps);

	for (let i = 0; i <= directionSteps; i++) {
		const directionPoint = along(directionLine, i * 6, {
			units: "kilometers",
		});
		const minBox = destination(directionPoint, 4, -135, {
			units: "kilometers",
		});
		const maxBox = destination(directionPoint, 4, 45, {
			units: "kilometers",
		});

		const { trapPoints: clusterTraps } = await traps(
			{
				lng: minBox.geometry.coordinates[0],
				lat: minBox.geometry.coordinates[1],
			},
			{
				lng: maxBox.geometry.coordinates[0],
				lat: maxBox.geometry.coordinates[1],
			},
		);

		if (clusterTraps.length > 499)
			console.log("clusterTraps >>>", clusterTraps.length);

		resultTraps = [...resultTraps, ...clusterTraps];
	}

	resultTraps = uniqWith(
		resultTraps,
		(trapA, trapB) =>
			trapA.properties!.content === trapB.properties!.content,
	);

	resultTraps = resultTraps.reduce<GeoJSON.Feature<GeoJSON.Point>[]>(
		(list, trapPoint) => {
			const trapDistance = pointToLineDistance(trapPoint, directionLine, {
				units: "meters",
			});

			if (trapDistance <= maxTrapDistance) {
				// console.log("Treffer->Distanz:", trapDistance);
				trapPoint.properties!.distance = trapDistance;
				list.push(trapPoint);
			}

			return list;
		},
		[],
	);

	return determineTrapTypes(resultTraps);
};

export { getTrapsFromDirection };
