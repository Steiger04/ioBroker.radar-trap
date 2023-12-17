// import { nextTick } from "async";
import { RefObject, useCallback, useEffect } from "react";
import { useRadarTrapMapBox2 } from "..";

import type { MapRef } from "react-map-gl";

type UseResizeMap2 = {
	_id: null | string;
	map: RefObject<MapRef>;
	feathers: radarTrap.FeathersClient;
};
const useResizeMap2 = ({
	_id,
	map,
	feathers,
}: UseResizeMap2): {
	resizeMap: (animate: boolean) => void;
	boxStatus: radarTrap.GenericStatus;
} => {
	const { status: boxStatus, directionsBox } = useRadarTrapMapBox2(_id, feathers);

	const resizeMap = useCallback(
		(animate: boolean) => {
			setTimeout(() => {
				if (Boolean(map.current) && boxStatus === "success") {
					map.current!.fitBounds(
						[
							[directionsBox![0], directionsBox![1]],
							[directionsBox![2], directionsBox![3]],
						],
						{ animate, padding: 10 },
					);
				}
			}, 100);
		},
		[boxStatus, directionsBox, map.current],
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

export { useResizeMap2 };
