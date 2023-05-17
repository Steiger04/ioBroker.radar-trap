// import { nextTick } from "async";
import { RefObject, useCallback, useEffect } from "react";
import { useRadarTrapMapBox } from "..";

import type { MapRef } from "react-map-gl";

type UseResizeMap = {
	_id: null | string;
	map: RefObject<MapRef>;
	animate?: boolean;
};
const useResizeMap = ({
	_id,
	map,
	animate = false,
}: UseResizeMap): {
	resizeMap: () => void;
	boxStatus: radarTrap.GenericStatus;
} => {
	const { status: boxStatus, directionsBox } = useRadarTrapMapBox(_id);

	const resizeMap = useCallback(() => {
		setTimeout(() => {
			/* console.log(
				"useResizeMap() -> resizeMap() -> boxStatus:",
				boxStatus,
			); */
			/* console.log(
				"useResizeMap() -> resizeMap() -> directionsBox:",
				directionsBox,
			); */

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
	}, [boxStatus, directionsBox, map.current]);

	useEffect(() => {
		let resizeTimer: NodeJS.Timeout | undefined;

		const handleResize = (): void => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				resizeMap();
			}, 100);
		};

		window.removeEventListener("resize", handleResize);
		window.addEventListener("resize", handleResize);

		return (): void => window.removeEventListener("resize", handleResize);
	}, [resizeMap]);

	return { resizeMap, boxStatus };
};

export { useResizeMap };
