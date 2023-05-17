import { featureCollection } from "@turf/helpers";
import { prepareTraps } from "./prepareTraps";

const addTrapInfoToAllTraps = (data: radarTrap.Area): void => {
	if (data.areaTraps === undefined) {
		return;
	}

	data.trapsFeatureCollection = featureCollection(
		prepareTraps(data.areaTraps),
	);
};

export { addTrapInfoToAllTraps };
