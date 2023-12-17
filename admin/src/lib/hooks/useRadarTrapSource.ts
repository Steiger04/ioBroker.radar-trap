import { featureCollection } from "@turf/helpers";
import { useGet } from "figbird";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";

type UseRadarTrapSource = {
	areaSourceStatus: radarTrap.GenericStatus;
	routeSourceStatus: radarTrap.GenericStatus;
	source: Partial<radarTrap.Route & radarTrap.Area>;
};

const useRadarTrapSource = (id: null | string): UseRadarTrapSource => {
	const {
		data: routeData,
		status: routeStatus,
		isFetching: routeIsFetching,
	} = useGet<radarTrap.Route>("routes", id, {
		realtime: "refetch",
		query: { $select: ["directions"] },
	});

	const {
		data: areaData,
		status: areaStatus,
		isFetching: areaIsFetching,
	} = useGet<radarTrap.Area>("areas", id, {
		realtime: "refetch",
		query: {
			$select: ["areaPolygons", "areaTraps", "polysFeatureCollection"],
		},
	});

	const [source, setSource] = useState<Partial<radarTrap.Route & radarTrap.Area>>({
		directions: null,
		directionsFeatureCollection: featureCollection([]),
		trapsFeatureCollection: featureCollection([]),
		polysFeatureCollection: featureCollection([]),
		areaPolygons: null,
	});

	const [areaSourceStatus, setAreaSourceStatus] = useState<radarTrap.GenericStatus>("idle");

	const [routeSourceStatus, setRouteSourceStatus] = useState<radarTrap.GenericStatus>("idle");

	useEffect(() => {
		if (routeStatus === "success" && routeIsFetching === false) {
			const { directions, directionsFeatureCollection, trapsFeatureCollection } = routeData!;

			setSource({
				directions,
				directionsFeatureCollection,
				trapsFeatureCollection,
				polysFeatureCollection: featureCollection([]),
				areaPolygons: null,
			});

			setRouteSourceStatus("success");

			return;
		}

		if (routeStatus === "success" && routeIsFetching === true) {
			setRouteSourceStatus("loading");

			return;
		}

		if (routeStatus === "error") {
			setRouteSourceStatus("error");
		}
	}, [routeStatus, routeIsFetching]);

	useEffect(() => {
		if (areaStatus === "success" && areaIsFetching === false) {
			const { areaPolygons, trapsFeatureCollection, polysFeatureCollection } = areaData!;

			setSource({
				directions: null,
				directionsFeatureCollection: featureCollection([]),
				trapsFeatureCollection,
				polysFeatureCollection,
				areaPolygons: isEmpty(areaPolygons) ? null : areaPolygons,
			});

			if (isEmpty(areaPolygons)) {
				setAreaSourceStatus("error");
			} else {
				setAreaSourceStatus("success");
			}

			return;
		}

		if (areaStatus === "success" && areaIsFetching === true) {
			setAreaSourceStatus("loading");

			return;
		}

		if (areaStatus === "error") {
			setAreaSourceStatus("error");
		}
	}, [areaStatus, areaIsFetching]);

	return { source, areaSourceStatus, routeSourceStatus };
};

export { useRadarTrapSource };
