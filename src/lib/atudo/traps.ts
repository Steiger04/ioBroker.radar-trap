import { Feature, Point, point, Properties } from "@turf/helpers";
import { fetch } from "cross-fetch";

type Poi = {
	id: string;
	lat: string;
	lat_s: string;
	lng: string;
	lng_s: string;
	street: string;
	content: string;
	backend: string;
	type: string;
	vmax: string;
	counter: string;
	create_date: string;
	confirm_date: string;
	gps_status: string;
	info: string;
	polyline: string;
};

const trapBase = "0,1,2,3,4,5,6,20,21,22,23,24,25,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,ts,vwd";

const traps = async (
	minPos: { lng: number; lat: number },
	maxPos: { lng: number; lat: number },
): Promise<{
	trapPoints: Feature<Point, Properties>[];
	polyPoints: Feature<Point, Properties>[];
}> => {
	const { pois }: { pois: Poi[] } = await fetch(
		`https://cdn3.atudo.net/api/4.0/pois.php?type=${trapBase}&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
	)
		.then((res) => res.json())
		.catch((ex) => console.log(ex));

	const { polys } = await fetch(
		`https://cdn3.atudo.net/api/4.0/polylines.php?type=traffic&z=100&box=${minPos.lat},${minPos.lng},${maxPos.lat},${maxPos.lng}`,
	)
		.then((res) => res.json())
		.catch((ex) => console.log(ex));

	const polyPoints = polys.reduce((list: Feature<Point, Properties>[], poly: any) => {
		let polyPoint;

		if (poly.type === "sc") return list;

		if (poly.type === "closure") {
			polyPoint = point<Properties>([+poly.pos.lng, +poly.pos.lat], {
				...poly,
			});
		} else {
			polyPoint = point<Properties>([+poly.showdelay_pos.lng, +poly.showdelay_pos.lat], { ...poly });
		}

		list.push(polyPoint);

		return list;
	}, []);

	const trapPoints = pois.reduce((list: Feature<Point, Properties>[], poi: Poi) => {
		const trapPoint = point<Properties>([+poi.lng, +poi.lat]);

		trapPoint.properties = poi;
		list.push(trapPoint);

		return list;
	}, []);

	return { trapPoints, polyPoints };
};

export { traps };
