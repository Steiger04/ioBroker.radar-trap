import {
	BBox,
	Feature,
	LineString,
	Point,
	Polygon,
	area,
	bbox,
	bboxPolygon,
	booleanDisjoint,
	buffer,
	featureCollection,
	pointToLineDistance,
	pointsWithinPolygon,
	squareGrid,
} from "@turf/turf";
import { getDevisor } from "./getDevisor";
import { traps } from "./atudo/traps";

export enum AnalyzedType {
	POLYGONE,
	LINESTRING,
}

type Options = {
	analyzedFeature: Feature<Polygon> | Feature<LineString>;
	type: AnalyzedType;
	maxTrapDistance?: number | undefined;
};

const getPoiPolyPointsAsync = async ({
	analyzedFeature,
	type,
	maxTrapDistance,
}: Options): Promise<{
	resultPoiPoints: Feature<Point, radarTrap.Poi>[];
	resultPolyLines: Feature<LineString, radarTrap.Poly>[];
}> => {
	// const areaPolygon = Object.values(data!.areaPolygons!)[0];
	const analyzedBbox = bbox(analyzedFeature);
	const analyzedBox = bboxPolygon(analyzedBbox);

	const sideLength = Math.sqrt(area(analyzedBox)) / 1_000;
	console.log("sideLength >>>", sideLength);

	const sideLengthDivisor = getDevisor(sideLength);
	console.log("sideLengthDivisor >>>", sideLengthDivisor);

	const cellWidth = sideLength / sideLengthDivisor;

	let bufferedBbox: BBox;

	switch (type) {
		case AnalyzedType.POLYGONE:
			bufferedBbox = bbox(buffer(analyzedFeature, cellWidth, { units: "kilometers" }));
			break;
		case AnalyzedType.LINESTRING:
			bufferedBbox = bbox(buffer(analyzedBox, cellWidth, { units: "kilometers" }));
			break;
		default:
			throw new Error("Invalid type in getPoiPolyPointsAsync");
	}

	const squareBoxGrid = squareGrid(bufferedBbox, cellWidth);
	console.log("squareBoxGrid >>>", squareBoxGrid.features.length);

	const squareBoxGridReduced = squareBoxGrid.features.filter((feature) => !booleanDisjoint(feature, analyzedFeature));
	console.log("squareBoxGridReduced >>>", squareBoxGridReduced.length);

	let resultPoiPoints: Feature<Point, radarTrap.Poi>[] = [];
	let resultPolyLines: Feature<LineString, radarTrap.Poly>[] = [];

	for (const feature of squareBoxGridReduced) {
		const tmpBbox = bbox(feature);

		const { poiPoints, polyLines } = await traps(
			{
				lng: tmpBbox[0],
				lat: tmpBbox[1],
			},
			{
				lng: tmpBbox[2],
				lat: tmpBbox[3],
			},
		);

		resultPoiPoints = resultPoiPoints.concat(poiPoints);
		resultPolyLines = resultPolyLines.concat(polyLines);
	}

	switch (type) {
		case AnalyzedType.POLYGONE:
			resultPoiPoints = pointsWithinPolygon(
				featureCollection(resultPoiPoints),
				analyzedFeature as Feature<Polygon>,
			).features;

			resultPolyLines = resultPolyLines.filter((polyLine) => {
				return !booleanDisjoint(polyLine, analyzedFeature);
			});
			break;

		case AnalyzedType.LINESTRING:
			resultPoiPoints = resultPoiPoints.filter((poiPoint) => {
				const trapDistance = pointToLineDistance(poiPoint, analyzedFeature as Feature<LineString>, {
					units: "meters",
				});

				return trapDistance <= maxTrapDistance!;
			});

			resultPolyLines = resultPolyLines.filter((polyLine) => {
				return !booleanDisjoint(polyLine, analyzedFeature);
			});
			break;

		default:
			throw new Error("Invalid type in getPoiPolyPointsAsync");
	}

	return { resultPoiPoints, resultPolyLines };
};

export default getPoiPolyPointsAsync;
