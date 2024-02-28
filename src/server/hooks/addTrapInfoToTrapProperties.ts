import type { Feature, LineString, Point } from "@turf/helpers";

function isArray(it: any): boolean {
	if (typeof Array.isArray === "function") {
		return Array.isArray(it);
	}

	return Object.prototype.toString.call(it) === "[object Array]";
}

const addTrapInfoToTrapProperties = (
	traps: Record<string, Feature<Point | LineString, radarTrap.Poi>[]>,
): Feature<Point | LineString, radarTrap.Poi>[] =>
	Object.values(traps).reduce(
		(list, t) => {
			if (isArray(t)) {
				t.forEach(({ properties }) => {
					const trapInfo = {} as radarTrap.trapInfo;

					trapInfo.id = properties!.backend;
					trapInfo.status = properties!.status;
					trapInfo.typeName = properties!.type_name;

					const info = !properties.info ? false : (properties.info as radarTrap.PoiInfo);

					if (info !== false) {
						trapInfo.reason = info.reason || properties.reason;
						// trapInfo.length = info.length > 0 && info.length;
						trapInfo.duration = Boolean(info.duration) && Math.round(Number(info.duration) / 60);
						trapInfo.delay = Boolean(info.delay) && Math.round(Number(info.delay) / 60);

						trapInfo.createDate = properties!.create_date !== "01.01.1970" && properties!.create_date;
						trapInfo.confirmDate = properties!.confirm_date !== "01.01.1970" && properties!.confirm_date;

						trapInfo.vmax =
							Boolean(properties!.vmax) &&
							properties!.vmax !== "?" &&
							properties!.vmax !== "/" &&
							properties!.vmax;
						trapInfo.typeText = Boolean(properties!.type_text) && properties!.type_text;
						trapInfo.country = Boolean(properties!.address.country) && properties!.address.country;
						trapInfo.state = Boolean(properties!.address.state) && properties!.address.state;
						trapInfo.zipCode = Boolean(properties!.address.zip_code) && properties!.address.zip_code;
						trapInfo.city = Boolean(properties!.address.city) && properties!.address.city;
						trapInfo.cityDistrict =
							Boolean(properties!.address.city_district) && properties!.address.city_district;
						trapInfo.street = Boolean(properties!.address.street) && properties!.address.street;

						properties!.trapInfo = trapInfo; // properties are mutable
					}
				});

				const lineTraps = t
					.filter((obj) => obj.properties.polyline !== "")
					.map((obj) => {
						const lt = obj.properties.polyline as Feature<LineString, radarTrap.Poi>;

						lt.properties.trapInfo = {};
						lt.properties.status = obj.properties?.status;

						return lt;
					});

				return [...list, ...t, ...lineTraps];
			}

			return list;
		},
		[] as Feature<Point | LineString, radarTrap.Poi>[],
	);

export { addTrapInfoToTrapProperties };
