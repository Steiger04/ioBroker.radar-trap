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
	squareGrid,
} from "@turf/turf";
import { getDevisor } from "./getDevisor";
import { traps2 } from "./atudo/traps2";

export enum AnalyzedType {
	POLYGONE,
	LINESTRING,
}

type AnalyzedFeature = Feature<Polygon> | Feature<LineString>;

const getPoiPolyPointsAsync = async (analyzedFeature: AnalyzedFeature, type: AnalyzedType) => {
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
	let resultPolyPoints: Feature<Point, radarTrap.Poly>[] = [];

	for (const feature of squareBoxGridReduced) {
		const tmpBbox = bbox(feature);

		const { polyPoints, poiPoints } = await traps2(
			{
				lng: tmpBbox[0],
				lat: tmpBbox[1],
			},
			{
				lng: tmpBbox[2],
				lat: tmpBbox[3],
			},
		);
		console.log("poiPoints >>>", poiPoints.length);

		if (poiPoints.length > 499) console.log("gridTraps >>>", poiPoints.length);

		resultPolyPoints = resultPolyPoints.concat(polyPoints);
		resultPoiPoints = resultPoiPoints.concat(poiPoints);
	}

	return { resultPoiPoints, resultPolyPoints };
};

export default getPoiPolyPointsAsync;
