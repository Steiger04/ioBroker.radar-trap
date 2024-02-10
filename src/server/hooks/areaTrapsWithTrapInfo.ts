import { featureCollection } from "@turf/helpers";
import { addTrapInfoToTrapProperties } from "./addTrapInfoToTrapProperties";

const areaTrapsWithTrapInfo = (data: radarTrap.Area): void => {
	if (data.areaTraps !== undefined)
		data.trapsFeatureCollection = featureCollection(addTrapInfoToTrapProperties(data.areaTraps));

	if (data.areaTrapsNew !== undefined) addTrapInfoToTrapProperties(data.areaTrapsNew);
	if (data.areaTrapsEstablished !== undefined) addTrapInfoToTrapProperties(data.areaTrapsEstablished);
	if (data.areaTrapsRejected !== undefined) addTrapInfoToTrapProperties(data.areaTrapsRejected);
};

export { areaTrapsWithTrapInfo };
