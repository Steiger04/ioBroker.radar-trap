import { differenceBy, mergeWith, intersectionBy, flatten, reduce } from "lodash";

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
	const newTraps = mergeWith({ ...record }, result, (recordValue, resultValue) =>
		differenceBy<F, F>(resultValue, recordValue || [], "properties.backend").map((item) => ({
			...item,
			properties: { ...item.properties, status: "NEW" },
		})),
	) as Record<string, F[]>;
	// if (process.env.NODE_ENV === "development") console.log("newTraps >>>", newTraps);

	const establishedTraps = mergeWith({ ...record }, result, (recordValue, resultValue) =>
		intersectionBy<F, F>(recordValue || [], resultValue, "properties.backend").map((item) => ({
			...item,
			properties: { ...item.properties, status: "ESTABLISHED" },
		})),
	) as Record<string, F[]>;
	// if (process.env.NODE_ENV === "development") console.log("establishedTraps >>>", establishedTraps);

	const rejectedTraps = mergeWith({ ...record }, result, (recordValue, resultValue) =>
		differenceBy<F, F>(recordValue || [], resultValue, "properties.backend").map((item) => ({
			...item,
			properties: { ...item.properties, status: "REJECTED" },
		})),
	) as Record<string, F[]>;
	// if (process.env.NODE_ENV === "development") console.log("rejectedTraps >>>", rejectedTraps);

	const traps = mergeWith({ ...establishedTraps }, newTraps, (objValue, srcValue) =>
		flatten<F>([objValue, srcValue]),
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
