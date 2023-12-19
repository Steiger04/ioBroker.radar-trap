import { useRadarTrapFind } from "./useRadarTrapFind";
import { useEffect, useState } from "react";

type UseRadarTrapCount = {
	count: {
		areas: number;
		routes: number;
		total: number;
	};
};

const useRadarTrapCount = (): UseRadarTrapCount => {
	const [count, setCount] = useState({
		areas: 0,
		routes: 0,
		total: 0,
	});

	const { status: areasStatus, total: areasTotal } = useRadarTrapFind<radarTrap.Area>("areas", {
		query: { $limit: 0 },
	});

	const { status: routesStatus, total: routesTotal } = useRadarTrapFind<radarTrap.Route>("routes", {
		query: { $limit: 0 },
	});

	useEffect(() => {
		if (areasStatus === "success" && routesStatus === "success") {
			setCount({
				areas: areasTotal!,
				routes: routesTotal!,
				total: areasTotal! + routesTotal!,
			});
		}
	}, [areasStatus, routesStatus, areasTotal, routesTotal]);

	return { count };
};

export { useRadarTrapCount };
