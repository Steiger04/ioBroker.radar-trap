import { differenceBy, mergeWith, intersectionBy, mapKeys, flatten, reduce } from "lodash";

import type { Feature, Point, LineString, Properties } from "@turf/helpers";

const trapsChain = <T extends Record<string, Feature<LineString | Point, Properties>[]>>(
	recordTraps: T = {} as T,
	resultTraps: T = {} as T,
): {
	newTraps: T;
	establishedTraps: T;
	rejectedTraps: T;
	traps: T;
	newTrapsReduced: T;
	rejectedTrapsReduced: T;
} => {
	const newTraps = mapKeys(
		mergeWith<T, T>({ ...recordTraps }, resultTraps, (objValue, srcValue) =>
			differenceBy<Feature<Point>, Feature<Point>>(srcValue, objValue || [], "properties.backend").map(
				(item) => ({
					...item,
					properties: { ...item.properties, status: "NEW" },
				}),
			),
		),
		(_, key) => `${key}New`,
	) as unknown as T;
	if (process.env.NODE_ENV === "development") console.log("newTraps >>>", newTraps);

	const establishedTraps = mapKeys(
		mergeWith<T, T>({ ...recordTraps }, resultTraps, (objValue, srcValue) =>
			intersectionBy<Feature<Point>, Feature<Point>>(objValue || [], srcValue, "properties.backend").map(
				(item) => ({
					...item,
					properties: { ...item.properties, status: "ESTABLISHED" },
				}),
			),
		),
		(_, key) => `${key}Established`,
	) as unknown as T;
	if (process.env.NODE_ENV === "development") console.log("establishedTraps >>>", establishedTraps);

	const rejectedTraps = mapKeys(
		mergeWith<T, T>({ ...recordTraps }, resultTraps, (objValue, srcValue) =>
			differenceBy<Feature<Point>, Feature<Point>>(objValue || [], srcValue, "properties.backend").map(
				(item) => ({
					...item,
					properties: { ...item.properties, status: "REJECTED" },
				}),
			),
		),
		(_, key) => `${key}Rejected`,
	) as unknown as T;
	if (process.env.NODE_ENV === "development") console.log("rejectedTraps >>>", rejectedTraps);

	const traps = mergeWith(
		{ ...mapKeys(establishedTraps, (_, key) => key.substring(0, key.length - 11)) },
		mapKeys(newTraps, (_, key) => key.substring(0, key.length - 3)),
		(objValue, srcValue) => flatten<Feature<Point>>([objValue, srcValue]),
	) as unknown as T;
	if (process.env.NODE_ENV === "development") console.log("areaTraps >>>", traps);

	const newTrapsReduced = reduce<
		Record<string, Feature<LineString | Point, Properties>[]>,
		Record<string, Feature<LineString | Point, Properties>[]>
	>(
		newTraps,
		function (acc, value) {
			acc.trapsNew.push(...value);
			return acc;
		},
		{ trapsNew: [] },
	) as unknown as T;
	if (process.env.NODE_ENV === "development") console.log("newTrapsReduced >>>", newTrapsReduced);

	const rejectedTrapsReduced = reduce<
		Record<string, Feature<LineString | Point, Properties>[]>,
		Record<string, Feature<LineString | Point, Properties>[]>
	>(
		rejectedTraps,
		function (acc, value) {
			acc.trapsRejected.push(...value);
			return acc;
		},
		{ trapsRejected: [] },
	) as unknown as T;
	if (process.env.NODE_ENV === "development") console.log("rejectedTrapsReduced >>>", rejectedTrapsReduced);

	return { newTraps, establishedTraps, rejectedTraps, traps, newTrapsReduced, rejectedTrapsReduced };
};

export { trapsChain };
