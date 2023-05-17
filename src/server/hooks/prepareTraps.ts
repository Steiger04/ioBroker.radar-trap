import type { Feature, LineString, Point, Properties } from "@turf/helpers";

function isArray(it: any): boolean {
	if (typeof Array.isArray === "function") {
		return Array.isArray(it);
	}

	return Object.prototype.toString.call(it) === "[object Array]";
}

const prepareTraps = (
	traps: Record<string, Feature<Point | LineString, Properties>[]>,
): Feature<Point | LineString, Properties>[] =>
	Object.values(traps).reduce((list, t) => {
		if (isArray(t)) {
			t.forEach(({ properties }) => {
				const trapInfo = {} as radarTrap.trapInfo;

				trapInfo.typeName = properties!.type_name;

				const info =
					properties!.info === "false" ? false : properties!.info;

				trapInfo.reason =
					(Boolean(info) && Boolean(info.reason) && info.reason) ||
					(Boolean(properties!.reason) && properties!.reason);
				trapInfo.length =
					Boolean(info) && info.length > 0 && info.length;
				trapInfo.duration =
					Boolean(info) &&
					Boolean(info.duration) &&
					Math.round(Number(info.duration) / 60);
				trapInfo.delay =
					Boolean(info) &&
					Boolean(info.delay) &&
					Math.round(Number(info.delay) / 60);

				trapInfo.createDate =
					properties!.create_date !== "01.01.1970" &&
					properties!.create_date;
				trapInfo.confirmDate =
					properties!.confirm_date !== "01.01.1970" &&
					properties!.confirm_date;

				trapInfo.vmax =
					Boolean(properties!.vmax) &&
					properties!.vmax !== "?" &&
					properties!.vmax !== "/" &&
					properties!.vmax;
				trapInfo.typeText =
					Boolean(properties!.type_text) && properties!.type_text;
				trapInfo.country =
					Boolean(properties!.address.country) &&
					properties!.address.country;
				trapInfo.state =
					Boolean(properties!.address.state) &&
					properties!.address.state;
				trapInfo.zipCode =
					Boolean(properties!.address.zip_code) &&
					properties!.address.zip_code;
				trapInfo.city =
					Boolean(properties!.address.city) &&
					properties!.address.city;
				trapInfo.cityDistrict =
					Boolean(properties!.address.city_district) &&
					properties!.address.city_district;
				trapInfo.street =
					Boolean(properties!.address.street) &&
					properties!.address.street;

				properties!.trapInfo = trapInfo;
			});

			const lineTraps = t
				.filter((obj) => obj.properties?.polyline !== "")
				.map((obj) => {
					const lt = obj.properties?.polyline;

					lt.properties.trapInfo = null;

					return lt;
				});

			return [...list, ...t, ...lineTraps];
		}

		return list;
	}, []);

export { prepareTraps };
