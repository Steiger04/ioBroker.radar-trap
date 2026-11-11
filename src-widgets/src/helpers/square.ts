import destination from '@turf/destination';
import { polygon } from '@turf/helpers';
import type { Feature, Polygon } from 'geojson';

/**
 * A square around a point, as a polygon
 *
 * @param center longitude and latitude
 * @param radius half the side in kilometres
 */
export function square(center: number[], radius: number): Feature<Polygon> {
    const cross = Math.sqrt(2 * radius ** 2);
    const coordinates: number[][] = [];

    for (let i = 0; i < 4; i++) {
        coordinates.push(destination(center, cross, (i * -360) / 4 + 45, {}).geometry.coordinates);
    }
    coordinates.push(coordinates[0]);

    return polygon([coordinates], {});
}
