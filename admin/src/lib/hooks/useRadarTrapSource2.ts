import { FeathersError } from "@feathersjs/errors";
import { featureCollection } from "@turf/helpers";
import { isEmpty } from "lodash";
import { useCallback, useEffect, useState } from "react";

type EmptyObj = Record<PropertyKey, never>;

type UseRadarTrapSource = {
	source: Partial<radarTrap.Route & radarTrap.Area>;
	sourceStatus: radarTrap.GenericStatus;
	areaSourceStatus: radarTrap.GenericStatus;
	routeSourceStatus: radarTrap.GenericStatus;
};

const useRadarTrapSource2 = (id: null | string, feathersClient: radarTrap.FeathersClient): UseRadarTrapSource => {
	const [areaData, setAreaData] = useState<radarTrap.Area | EmptyObj>({});
	const [routeData, setRouteData] = useState<radarTrap.Route | EmptyObj>({});

	const [areaSourceStatus, setAreaSourceStatus] = useState<radarTrap.GenericStatus>("idle");
	const [routeSourceStatus, setRouteSourceStatus] = useState<radarTrap.GenericStatus>("idle");
	const [sourceStatus, setSourceStatus] = useState<radarTrap.GenericStatus>("idle");

	const [source, setSource] = useState<Partial<radarTrap.Route & radarTrap.Area>>({
		directions: null,
		directionsFeatureCollection: featureCollection([]),
		trapsFeatureCollection: featureCollection([]),
		polysFeatureCollection: featureCollection([]),
		areaPolygons: null,
	});

	useEffect(() => {
		setAreaSourceStatus("idle");
		setRouteSourceStatus("idle");
		setSourceStatus("idle");
		setSource({
			directions: null,
			directionsFeatureCollection: featureCollection([]),
			trapsFeatureCollection: featureCollection([]),
			polysFeatureCollection: featureCollection([]),
			areaPolygons: null,
		});
	}, [id]);

	useEffect(() => {
		if (!feathersClient || !id) return;

		const areaCreatedHandler = (createdData: radarTrap.Area) => {
			setAreaSourceStatus("loading");
			if (createdData._id === id) setAreaData(createdData);
		};

		const routeCreatedHandler = (createdData: radarTrap.Route) => {
			setRouteSourceStatus("loading");
			if (createdData._id === id) setRouteData(createdData);
		};

		feathersClient.service("areas").on("created", areaCreatedHandler);
		feathersClient.service("routes").on("created", routeCreatedHandler);

		// eslint-disable-next-line consistent-return
		return () => {
			feathersClient.service("areas").removeListener("created", areaCreatedHandler);
			feathersClient.service("routes").removeListener("created", routeCreatedHandler);
		};
	}, [id, feathersClient]);

	const routes = useCallback(async () => {
		if (!feathersClient) return;

		try {
			setRouteSourceStatus("loading");
			const resData = await feathersClient.service("routes").get(id, {
				query: { $select: ["directions"] },
			});

			setRouteData(resData);
		} catch (err) {
			if (err instanceof FeathersError) {
				if (err.name === "NotFound") {
					setRouteData({});
					setRouteSourceStatus("error");
				} else {
					console.log(err);
				}
			} else {
				console.log(err);
			}
		}
	}, [id, feathersClient]);

	const areas = useCallback(async () => {
		if (!feathersClient) return;

		try {
			setAreaSourceStatus("loading");
			const resData = await feathersClient.service("areas").get(id, {
				query: {
					$select: ["areaPolygons", "areaTraps", "polysFeatureCollection"],
				},
			});

			setAreaData(resData);
		} catch (err) {
			if (err instanceof FeathersError) {
				if (err.name === "NotFound") {
					setAreaData({});
					setAreaSourceStatus("error");
				} else {
					console.log(err);
				}
			} else {
				console.log(err);
			}
		}
	}, [id, feathersClient]);

	useEffect(() => {
		areas();
	}, [areas]);

	useEffect(() => {
		routes();
	}, [routes]);

	useEffect(() => {
		if (!isEmpty(routeData)) {
			const { directions, directionsFeatureCollection, trapsFeatureCollection } = routeData;

			setSource({
				directions,
				directionsFeatureCollection,
				trapsFeatureCollection,
				polysFeatureCollection: featureCollection([]),
				areaPolygons: null,
			});

			setRouteSourceStatus("success");
		}
	}, [routeData]);

	useEffect(() => {
		if (!isEmpty(areaData)) {
			const { areaPolygons, trapsFeatureCollection, polysFeatureCollection } = areaData;

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
		}
	}, [areaData]);

	useEffect(() => {
		if (areaSourceStatus === "success" || routeSourceStatus === "success") {
			setSourceStatus("success");
		} else if (areaSourceStatus === "error" && routeSourceStatus === "error") {
			setSourceStatus("error");
		} else {
			setSourceStatus("loading");
		}
	}, [areaSourceStatus, routeSourceStatus]);

	return {
		source,
		sourceStatus,
		areaSourceStatus,
		routeSourceStatus,
	};
};

export { useRadarTrapSource2 };
