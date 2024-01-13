// import { nextTick } from "async";
import { useCallback, useEffect } from "react";
import { useRadarTrapMapBox } from "..";

import type { MapRef } from "react-map-gl";

type UseResizeMap = {
	_id: null | string;
	map: MapRef | null;
	feathers: radarTrap.FeathersClient;
};
const useResizeMap = ({
	_id,
	map,
	feathers,
}: UseResizeMap): {
	resizeMap: (animate: boolean) => void;
	boxStatus: radarTrap.GenericStatus;
} => {
	const { status: boxStatus, directionsBox } = useRadarTrapMapBox(_id, feathers);

	const resizeMap = useCallback(
		(animate: boolean) => {
			setTimeout(() => {
				if (map && boxStatus === "success") {
					map.fitBounds(
						[
							[directionsBox![0], directionsBox![1]],
							[directionsBox![2], directionsBox![3]],
						],
						{ animate, padding: 10 },
					);
				}
			}, 100);
		},
		[boxStatus, directionsBox, map],
	);

	useEffect(() => {
		let resizeTimer: NodeJS.Timeout | undefined;

		const handleResize = (): void => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				resizeMap(false);
			}, 100);
		};

		// window.removeEventListener("resize", handleResize);
		window.addEventListener("resize", handleResize);

		return (): void => window.removeEventListener("resize", handleResize);
	}, [resizeMap]);

	return { resizeMap, boxStatus };
};

export { useResizeMap };
