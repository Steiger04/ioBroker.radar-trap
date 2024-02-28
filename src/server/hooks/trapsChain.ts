import { differenceBy, mergeWith, intersectionBy, mapKeys, flatten, reduce } from "lodash";

import type { Feature, Point, LineString } from "@turf/helpers";

const trapsChain = <
	T extends radarTrap.Poi | radarTrap.Poly,
	F extends Feature<Point | LineString, T> = Feature<Point | LineString, T>,
>(
	record = {} as Record<string, F[]>,
	result = {} as Record<string, F[]>,
): {
	newTraps: Record<string, F[]>;
	establishedTraps: Record<string, F[]>;
	rejectedTraps: Record<string, F[]>;
	traps: Record<string, F[]>;
	newTrapsReduced: Record<string, F[]>;
	rejectedTrapsReduced: Record<string, F[]>;
} => {
	const newTraps = mapKeys(
		mergeWith({ ...record }, result, (recordValue, resultValue) =>
			differenceBy<F, F>(resultValue, recordValue || [], "properties.backend").map((item) => ({
				...item,
				properties: { ...item.properties, status: "NEW" },
			})),
		),
		(_, key) => `${key}New`,
	) as Record<string, F[]>;
	// if (process.env.NODE_ENV === "development") console.log("newTraps >>>", newTraps);

	const establishedTraps = mapKeys(
		mergeWith({ ...record }, result, (recordValue, resultValue) =>
			intersectionBy<F, F>(recordValue || [], resultValue, "properties.backend").map((item) => ({
				...item,
				properties: { ...item.properties, status: "ESTABLISHED" },
			})),
		),
		(_, key) => `${key}Established`,
	) as Record<string, F[]>;
	// if (process.env.NODE_ENV === "development") console.log("establishedTraps >>>", establishedTraps);

	const rejectedTraps = mapKeys(
		mergeWith({ ...record }, result, (recordValue, resultValue) =>
			differenceBy<F, F>(recordValue || [], resultValue, "properties.backend").map((item) => ({
				...item,
				properties: { ...item.properties, status: "REJECTED" },
			})),
		),
		(_, key) => `${key}Rejected`,
	) as Record<string, F[]>;
	// if (process.env.NODE_ENV === "development") console.log("rejectedTraps >>>", rejectedTraps);

	const traps = mergeWith(
		{ ...mapKeys(establishedTraps, (_, key) => key.substring(0, key.length - 11)) },
		mapKeys(newTraps, (_, key) => key.substring(0, key.length - 3)),
		(objValue, srcValue) => flatten<F>([objValue, srcValue]),
	) as Record<string, F[]>;
	// if (process.env.NODE_ENV === "development") console.log("traps >>>", traps);

	const newTrapsReduced = reduce(
		newTraps,
		function (acc, value) {
			acc.trapsNew.push(...value);
			return acc;
		},
		{ trapsNew: [] } as unknown as Record<string, F[]>,
	);
	// if (process.env.NODE_ENV === "development") console.log("newTrapsReduced >>>", newTrapsReduced);

	const rejectedTrapsReduced = reduce(
		rejectedTraps,
		function (acc, value) {
			acc.trapsRejected.push(...value);

			return acc;
		},
		{ trapsRejected: [] } as unknown as Record<string, F[]>,
	);
	// if (process.env.NODE_ENV === "development") console.log("rejectedTrapsReduced >>>", rejectedTrapsReduced);

	return { traps, newTraps, establishedTraps, rejectedTraps, newTrapsReduced, rejectedTrapsReduced };
};

export { trapsChain };
