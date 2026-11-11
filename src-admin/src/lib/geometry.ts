/** The few calculations on the sphere the area editor needs */

const EARTH_RADIUS_KM = 6371.0088;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * The distance of two points
 *
 * @param a longitude, latitude
 * @param b longitude, latitude
 * @returns kilometres
 */
export function distanceKm(a: [number, number], b: [number, number]): number {
    const dLat = toRad(b[1] - a[1]);
    const dLon = toRad(b[0] - a[0]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * The point at a distance and a bearing from another one
 *
 * @param from longitude, latitude
 * @param km the distance
 * @param bearing degrees from north, clockwise
 */
export function destination(from: [number, number], km: number, bearing: number): [number, number] {
    const delta = km / EARTH_RADIUS_KM;
    const theta = toRad(bearing);
    const phi1 = toRad(from[1]);
    const lambda1 = toRad(from[0]);
    const phi2 = Math.asin(Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta));
    const lambda2 =
        lambda1 +
        Math.atan2(Math.sin(theta) * Math.sin(delta) * Math.cos(phi1), Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2));
    return [((toDeg(lambda2) + 540) % 360) - 180, toDeg(phi2)];
}

/**
 * A circle as a polygon of 64 corners, closed
 *
 * @param center longitude, latitude
 * @param radiusKm the radius
 */
export function circleRing(center: [number, number], radiusKm: number): [number, number][] {
    const ring: [number, number][] = [];
    for (let i = 0; i < 64; i++) {
        ring.push(destination(center, radiusKm, (i * 360) / 64));
    }
    ring.push(ring[0]);
    return ring;
}

/**
 * A new ID for a polygon
 */
export function newId(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
}
