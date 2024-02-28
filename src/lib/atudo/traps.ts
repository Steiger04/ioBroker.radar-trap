import { Feature, Point, point } from "@turf/helpers";
import { fetch } from "cross-fetch";
import { Value } from "@sinclair/typebox/value";
import { atudoPoisSchema } from "../schemas/atudoPoiSchema";
import { atudoPolysSchema } from "../schemas/atudoPolySchema";

async function request<
	TResponse extends radarTrap.AtudoPoi | radarTrap.AtudoPoly,
	TArray extends TResponse[] = TResponse[],
>(url: string, config: RequestInit = {}): Promise<Record<string, TArray>> {
	const response = await fetch(url, config);
	return response.json();
}

const trapBase =
	"0,1,2,3,4,5,6,20,21,22,23,24,25,29,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,ts,vwd";

const traps = async (
	minPos: { lng: number; lat: number },
	maxPos: { lng: number; lat: number },
): Promise<{
	poiPoints: Feature<Point, radarTrap.Poi>[];
	polyPoints: Feature<Point, radarTrap.Poly>[];
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

		const { polys } = await request<radarTrap.AtudoPoly>(
			`https://cdn2.atudo.net/api/4.0/polylines.php?type=traffic&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
		);

		Value.Default(atudoPolysSchema, polys); // add schemaType to each poly
		if (!Value.Check(atudoPolysSchema, polys))
			console.log("POLYS SCHEMA ERRORS >>>", [...Value.Errors(atudoPolysSchema, polys)]);

		const polyPoints = polys.reduce((list: Feature<Point, radarTrap.Poly>[], poly) => {
			if (poly.type === "sc") return list;

			if (poly.type === "closure") {
				list.push(point([+poly.pos!.lng, +poly.pos!.lat], { ...poly }));
			}
			if (poly.type === "20") {
				list.push(point([+poly.showdelay_pos!.lng, +poly.showdelay_pos!.lat], { ...poly }));
			}

			return list;
		}, []);

		const poiPoints = pois.reduce((list: Feature<Point, radarTrap.Poi>[], poi) => {
			const trapPoint = point([+poi.lng, +poi.lat], { ...poi });
			list.push(trapPoint);

			return list;
		}, []);

		return { poiPoints, polyPoints };
	} catch (error) {
		console.error("traps: ", error);
		return { poiPoints: [], polyPoints: [] };
	}
};

export { traps };
