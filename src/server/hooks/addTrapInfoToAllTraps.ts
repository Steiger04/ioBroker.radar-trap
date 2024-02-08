import { featureCollection } from "@turf/helpers";
import { prepareTraps } from "./prepareTraps";

const addTrapInfoToAllTraps = (data: radarTrap.Area): void => {
	if (data.areaTraps !== undefined) data.trapsFeatureCollection = featureCollection(prepareTraps(data.areaTraps));
	if (data.areaTrapsNew !== undefined) prepareTraps(data.areaTrapsNew);
	if (data.areaTrapsEstablished !== undefined) prepareTraps(data.areaTrapsEstablished);
	if (data.areaTrapsRejected !== undefined) prepareTraps(data.areaTrapsRejected);
};

export { addTrapInfoToAllTraps };
