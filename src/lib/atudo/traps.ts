import { Feature, Point, point } from "@turf/helpers";
import { fetch } from "cross-fetch";
import { Value } from "@sinclair/typebox/value";
import { atudoPoisSchema } from "../schemas/atudoPoiSchema";
import { atudoPolysSchema } from "../schemas/atudoPolySchema";
import { LineString, feature } from "@turf/turf";
import polyline from "@mapbox/polyline";
import { uniqBy } from "lodash";

async function request<
	TResponse extends radarTrap.AtudoPoi | radarTrap.AtudoPoly,
	TArray extends TResponse[] = TResponse[],
>(url: string, config: RequestInit = {}): Promise<Record<string, TArray>> {
	const response = await fetch(url, config);
	return response.json();
}

/* const trapBase =
	"0,1,2,3,4,5,6,7,11,12,20,21,22,23,24,25,29,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,201,206,ts"; */

const trapBase =
	"0,1,2,3,4,5,6,7,11,12,20,21,22,23,24,25,29,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,ts";

const traps = async (
	minPos: { lng: number; lat: number },
	maxPos: { lng: number; lat: number },
): Promise<{
	poiPoints: Feature<Point, radarTrap.Poi>[];
	polyLines: Feature<LineString, radarTrap.Poly>[];
}> => {
	try {
		/* // Blitzer fest
		const { pois: poisFest } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=101,102,103,104,105,106,107,108,109,110,111,112,113,114,115&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_FEST >>>", JSON.stringify(poisFest, null, 2));

		// Blitzer teilstationär
		const { pois: poisTs } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=ts&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_TS >>>", JSON.stringify(poisTs, null, 2));

		// Blitzer mobil
		const { pois: poisMobil } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=0,1,2,3,4,5,6&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_MOBIL >>>", JSON.stringify(poisMobil, null, 2));

		// Baustellen
		const { pois: poisBaustelle } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=22,26&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_BAUSTELLE >>>", JSON.stringify(poisBaustelle, null, 2));

		// Stauenden
		const { pois: poisStauende } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=20&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_STAUENDE >>>", JSON.stringify(poisStauende, null, 2));

		// Gefahrenstellen
		const { pois: poisGefahr } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=21,23,24,25,29&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_GEFAHR >>>", JSON.stringify(poisGefahr, null, 2));

		// Mobile Blitzer Hotspots
		const { pois: poisHotspot } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=2015&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_HOTSPOT >>>", JSON.stringify(poisHotspot, null, 2)); 

		// Polizeimeldungen aktuell (48h)
		const { pois: poisPolizei48 } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=vwd&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_POLIZEI48 >>>", JSON.stringify(poisPolizei48, null, 2));

		// Polizeimeldungen Archiv
		const { pois: poisPolizeiArchiv } = await request<radarTrap.Poi[]>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=vwda&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		console.log("POIS_POLIZEI_ARCHIV >>>", JSON.stringify(poisPolizeiArchiv, null, 2)); */

		//----------------------------------------------
		const { pois } = await request<radarTrap.AtudoPoi>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=${trapBase}&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		Value.Default(atudoPoisSchema, pois); // add schemaType to each poi
		if (!Value.Check(atudoPoisSchema, pois))
			console.log("POIS SCHEMA ERRORS >>>", [...Value.Errors(atudoPoisSchema, pois)]);

		// nur Hotspots (2015) und Polizeimeldungen (vwd)
		const { pois: poisHsPn } = await request<radarTrap.AtudoPoi>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=2015,vwd&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		Value.Default(atudoPoisSchema, poisHsPn); // add schemaType to each poi
		if (!Value.Check(atudoPoisSchema, poisHsPn))
			console.log("POISHSPN SCHEMA ERRORS >>>", [...Value.Errors(atudoPoisSchema, poisHsPn)]);

		// nur archivierte Polizeimeldungen (vwda)
		const { pois: poisPnA } = await request<radarTrap.AtudoPoi>(
			`https://cdn2.atudo.net/api/4.0/pois.php?type=vwda&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		Value.Default(atudoPoisSchema, poisPnA); // add schemaType to each poi
		if (!Value.Check(atudoPoisSchema, poisPnA))
			console.log("POISPNA SCHEMA ERRORS >>>", [...Value.Errors(atudoPoisSchema, poisPnA)]);

		// Polylines
		const { polys } = await request<radarTrap.AtudoPoly>(
			`https://cdn2.atudo.net/api/4.0/polylines.php?type=traffic&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);
		Value.Default(atudoPolysSchema, polys); // add schemaType to each poly
		if (!Value.Check(atudoPolysSchema, polys))
			console.log("POLYS SCHEMA ERRORS >>>", [...Value.Errors(atudoPolysSchema, polys)]);

		if (pois.length > 499) console.log("POIS >>>", pois.length);
		if (poisHsPn.length > 499) console.log("POISHSPN >>>", poisHsPn.length);
		if (poisPnA.length > 499) console.log("POISPNA >>>", poisPnA.length);

		pois.push(...poisHsPn); // add poisHsPn to pois
		pois.push(...poisPnA.map((pna) => ({ ...pna, type: "vwda" }))); // add poisPnA to pois
		const _poiPoints = pois.reduce((list: Feature<Point, radarTrap.Poi>[], poi) => {
			list.push(point([+poi.lng, +poi.lat], { ...poi }));

			return list;
		}, []);

		// delete double police news
		const poiPoints = uniqBy(_poiPoints, (point) => point.geometry?.coordinates?.join(","));

		const polyLines = polys.reduce((list: Feature<LineString, radarTrap.Poly>[], poly) => {
			list.push(feature(polyline.toGeoJSON(poly.polyline), { ...poly }));

			return list;
		}, []);

		return { poiPoints, polyLines };
	} catch (error) {
		console.error("traps: ", error);
		return { poiPoints: [], polyLines: [] };
	}
};

export { traps };
