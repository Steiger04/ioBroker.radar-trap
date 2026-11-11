import type { BBox, Feature, LineString, MultiPolygon, Point, Polygon } from '@turf/turf';
import {
    area,
    bbox,
    bboxPolygon,
    booleanDisjoint,
    buffer,
    featureCollection,
    pointToLineDistance,
    pointsWithinPolygon,
    squareGrid,
} from '@turf/turf';
import { uniqBy } from 'lodash';
import { getAdapterLog } from './adapterRef';
import { getDevisor } from './getDevisor';
import type { TrapsContext } from './atudo/traps';
import { MAX_REQUESTS, pausedUntil, traps } from './atudo/traps';

export enum AnalyzedType {
    POLYGONE,
    LINESTRING,
}

type Options = {
    analyzedFeature: Feature<Polygon | MultiPolygon> | Feature<LineString>;
    type: AnalyzedType;
    maxTrapDistance?: number | undefined;
};

/**
 * A box made wider by a distance on every side
 *
 * @param box west, south, east, north
 * @param meters the distance
 */
function widen(box: BBox, meters: number): BBox {
    if (!meters) {
        return box;
    }
    const lat = meters / 111_320;
    const lng = meters / (111_320 * Math.max(Math.cos((((box[1] + box[3]) / 2) * Math.PI) / 180), 0.01));
    return [box[0] - lng, box[1] - lat, box[2] + lng, box[3] + lat];
}

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
    if (process.env.NODE_ENV === 'development') {
        console.log('sideLength >>>', sideLength);
    }

    const sideLengthDivisor = getDevisor(sideLength);
    if (process.env.NODE_ENV === 'development') {
        console.log('sideLengthDivisor >>>', sideLengthDivisor);
    }

    const cellWidth = sideLength / sideLengthDivisor;

    let bufferedBbox: BBox;

    switch (type) {
        case AnalyzedType.POLYGONE:
            bufferedBbox = bbox(buffer(analyzedFeature, cellWidth, { units: 'kilometers' }));
            break;
        case AnalyzedType.LINESTRING:
            bufferedBbox = bbox(buffer(analyzedBox, cellWidth, { units: 'kilometers' }));
            break;
        default:
            throw new Error('Invalid type in getPoiPolyPointsAsync');
    }

    const squareBoxGrid = squareGrid(bufferedBbox, cellWidth);
    if (process.env.NODE_ENV === 'development') {
        console.log('squareBoxGrid >>>', squareBoxGrid.features.length);
    }

    const squareBoxGridReduced = squareBoxGrid.features.filter(feature => !booleanDisjoint(feature, analyzedFeature));
    if (process.env.NODE_ENV === 'development') {
        console.log('squareBoxGridReduced >>>', squareBoxGridReduced.length);
    }

    let resultPoiPoints: Feature<Point, radarTrap.Poi>[] = [];
    let resultPolyLines: Feature<LineString, radarTrap.Poly>[] = [];

    // blitzer.de is asked box by box; a group of traps is resolved only where its traps matter: inside the area, or
    // within the distance of the route
    const margin = type === AnalyzedType.LINESTRING ? maxTrapDistance || 0 : 0;
    const context: TrapsContext = {
        requests: 0,
        unresolvedGroups: 0,
        deepGroups: 0,
        wanted: box => !booleanDisjoint(bboxPolygon(widen(box, margin)), analyzedFeature),
    };

    // one warning for all boxes blitzer.de did not answer
    let failedBoxes = 0;
    let failure = '';

    for (const feature of squareBoxGridReduced) {
        const { poiPoints, polyLines, error } = await traps(bbox(feature), context);

        if (error) {
            failedBoxes++;
            failure ||= error;
        }
        resultPoiPoints = resultPoiPoints.concat(poiPoints);
        resultPolyLines = resultPolyLines.concat(polyLines);
    }
    // a trap or a closed road on the edge of two parts comes from both
    resultPoiPoints = uniqBy(resultPoiPoints, point => point.geometry?.coordinates?.join(','));
    resultPolyLines = uniqBy(resultPolyLines, line => line.properties.backend || line.properties.id);

    const log = getAdapterLog();
    const parts = squareBoxGridReduced.length;
    const deep = context.deepGroups ? `, ${context.deepGroups} groups still groups in the smallest box` : '';
    log.debug(`blitzer.de: ${context.requests} requests for ${parts} parts${deep}`);
    if (failedBoxes) {
        const again = pausedUntil();
        log.warn(
            `Cannot load the traps from blitzer.de for ${failedBoxes} of ${parts} parts: ${failure}. ` +
                `The result lacks their traps and closed roads${again ? `; blitzer.de is asked again after ${again}` : ''}`,
        );
    }
    if (context.unresolvedGroups) {
        log.warn(
            `${context.unresolvedGroups} groups of traps were not resolved: a computation asks blitzer.de at most ` +
                `${MAX_REQUESTS} times. The result may lack some traps`,
        );
    }

    switch (type) {
        case AnalyzedType.POLYGONE:
            resultPoiPoints = pointsWithinPolygon(featureCollection(resultPoiPoints), analyzedFeature).features;

            resultPolyLines = resultPolyLines.filter(polyLine => {
                return !booleanDisjoint(polyLine, analyzedFeature);
            });
            break;

        case AnalyzedType.LINESTRING:
            resultPoiPoints = resultPoiPoints.filter(poiPoint => {
                const trapDistance = pointToLineDistance(poiPoint, analyzedFeature as Feature<LineString>, {
                    units: 'meters',
                });

                return trapDistance <= maxTrapDistance!;
            });

            resultPolyLines = resultPolyLines.filter(polyLine => {
                return !booleanDisjoint(polyLine, analyzedFeature);
            });
            break;

        default:
            throw new Error('Invalid type in getPoiPolyPointsAsync');
    }

    return { resultPoiPoints, resultPolyLines };
};

export default getPoiPolyPointsAsync;
