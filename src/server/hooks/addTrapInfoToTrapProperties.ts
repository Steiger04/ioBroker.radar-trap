import type { Feature, LineString, Point } from "@turf/helpers";
import { isEmpty } from "lodash";

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

					const _info = JSON.parse(JSON.stringify(properties.info));

					trapInfo.id = properties.backend;
					trapInfo.status = properties.status;
					trapInfo.typeName = properties.type_name;
					trapInfo.longitude = +properties.lng;
					trapInfo.latitude = +properties.lat;
					trapInfo.reason = isEmpty(properties.reason)
						? isEmpty(_info.reason)
							? false
							: _info.reason
						: properties.reason;
					trapInfo.length = isEmpty(_info.length) ? false : _info.length;
					trapInfo.duration = isEmpty(_info.duration) ? false : Math.round(Number(_info.duration) / 60);
					trapInfo.delay = isEmpty(_info.delay) ? false : Math.round(Number(_info.delay) / 60);
					trapInfo.createDate = properties.create_date !== "01.01.1970" && properties.create_date;
					trapInfo.confirmDate = properties.confirm_date !== "01.01.1970" && properties.confirm_date;
					trapInfo.vmax = isEmpty(properties.vmax) ? false : properties.vmax === "?" ? "V" : properties.vmax;
					trapInfo.typeDesc = isEmpty(properties.type_desc) ? false : properties.type_desc;
					trapInfo.typeText = isEmpty(properties.type_text) ? false : properties.type_text;
					trapInfo.country = isEmpty(properties.address.country) ? false : properties.address.country;
					trapInfo.state = isEmpty(properties.address.state) ? false : properties.address.state;
					trapInfo.zipCode = isEmpty(properties.address.zip_code) ? false : properties.address.zip_code;
					trapInfo.city = isEmpty(properties.address.city) ? false : properties.address.city;
					trapInfo.cityDistrict = isEmpty(properties.address.city_district)
						? false
						: properties.address.city_district;
					trapInfo.street = isEmpty(properties.address.street) ? false : properties.address.street;

					properties.trapInfo = trapInfo; // properties are mutable
				});

				return [...list, ...t];
			}

			return list;
		},
		[] as Feature<Point | LineString, radarTrap.Poi>[],
	);

export { addTrapInfoToTrapProperties };
