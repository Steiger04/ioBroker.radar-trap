import { useCallback, useEffect, useState } from "react";

import type { MapRef } from "react-map-gl";

import IconTrafficClosure from "../../../assets/map-icons/icon-traffic-closure.png";
import IconUnknown0 from "../../../assets/map-icons/icon-unknown-0-sdf.png";
import IconGeneralTrafficControl4 from "../../../assets/map-icons/icon-general-traffic-control-4-sdf.png";
import IconAlcoholControl5 from "../../../assets/map-icons/icon-alcohol-control-5-sdf.png";
import IconRampControl103 from "../../../assets/map-icons/icon-ramp-control-103-sdf.png";
import IconPedestrianCrossing106 from "../../../assets/map-icons/icon-pedestrian-crossing-106-sdf.png";
import IconMobileDistanceSpeedCamera6 from "../../../assets/map-icons/icon-mobile-distance-speed-camera-6-sdf.png";
import IconTrafficJam20 from "../../../assets/map-icons/icon-traffic-jam-20-sdf.png";
import IconAccident21 from "../../../assets/map-icons/icon-accident-21-sdf.png";
import IconObstacle23 from "../../../assets/map-icons/icon-obstacle-23-sdf.png";
import IconRiskOfSlipping24 from "../../../assets/map-icons/icon-risk-of-slipping-24-sdf.png";
import IconVisualObstruction25 from "../../../assets/map-icons/icon-visual-obstruction-25-sdf.png";
import IconRoadWork22_26 from "../../../assets/map-icons/icon-road-work-22-26-sdf.png";
import IconBreakdown29 from "../../../assets/map-icons/icon-breakdown-29-sdf.png";
import IconFixedDistanceSpeedCamera101 from "../../../assets/map-icons/icon-fixed-distance-speed-camera-101-sdf.png";
import IconBusLane104 from "../../../assets/map-icons/icon-bus-lane-104-sdf.png";
import IconFixedTrap1_2_107 from "../../../assets/map-icons/icon-fixed-trap-1-2-107-sdf.png";
import IconWeightControl108 from "../../../assets/map-icons/icon-weight-control-108-sdf.png";
import IconHeightControl109 from "../../../assets/map-icons/icon-height-control-109-sdf.png";
import IconFixedTrap110 from "../../../assets/map-icons/icon-fixed-trap-110-sdf.png";
import IconFixedTrap111 from "../../../assets/map-icons/icon-fixed-trap-111-sdf.png";
import IconFixedTrap112 from "../../../assets/map-icons/icon-fixed-trap-112-sdf.png";
import IconFixedTrap113 from "../../../assets/map-icons/icon-fixed-trap-113-sdf.png";
import IconFixedTrap114 from "../../../assets/map-icons/icon-fixed-trap-114-sdf.png";
import IconNoOvertaking115 from "../../../assets/map-icons/icon-no-overtaking-115-sdf.png";
import IconMobileSpeedCameraHotspot2015 from "../../../assets/map-icons/icon-mobile-speed-camera-hotspot-2015-sdf.png";
import IconPoliceReport_vwd_vwda from "../../../assets/map-icons/icon-police-report-vwd-vwda-sdf.png";

const images = [
	{ id: "icon-traffic-closure", png: IconTrafficClosure },
	{ id: "unknown", png: IconUnknown0 },
	{ id: "general-traffic-control", png: IconGeneralTrafficControl4 },
	{ id: "alcohol-control", png: IconAlcoholControl5 },
	{ id: "mobile-distance-speed-camera", png: IconMobileDistanceSpeedCamera6 },
	{ id: "traffic-jam", png: IconTrafficJam20 },
	{ id: "accident", png: IconAccident21 },
	{ id: "obstacle", png: IconObstacle23 },
	{ id: "risk-of-slipping", png: IconRiskOfSlipping24 },
	{ id: "visual-obstruction", png: IconVisualObstruction25 },
	{ id: "road-work", png: IconRoadWork22_26 },
	{ id: "breakdown", png: IconBreakdown29 },
	{ id: "fixed-distance-speed-camera", png: IconFixedDistanceSpeedCamera101 },
	{ id: "ramp-control", png: IconRampControl103 },
	{ id: "bus-lane", png: IconBusLane104 },
	{ id: "pedestrian-crossing", png: IconPedestrianCrossing106 },
	{ id: "speed-camera", png: IconFixedTrap1_2_107 },
	{ id: "weight-control", png: IconWeightControl108 },
	{ id: "height-control", png: IconHeightControl109 },
	{ id: "combined-fixed", png: IconFixedTrap110 },
	{ id: "redlight-fixed", png: IconFixedTrap111 },
	{ id: "section-control-start", png: IconFixedTrap112 },
	{ id: "section-control-end", png: IconFixedTrap113 },
	{ id: "tunnel-speed-camera", png: IconFixedTrap114 },
	{ id: "no-overtaking", png: IconNoOvertaking115 },
	{ id: "mobile-speed-camera-hotspot", png: IconMobileSpeedCameraHotspot2015 },
	{ id: "police-report", png: IconPoliceReport_vwd_vwda },
];

const useMapImages = (map: MapRef | null): { status: radarTrap.GenericStatus } => {
	const [status, setStatus] = useState<radarTrap.GenericStatus>("idle");

	const loadHandler = useCallback(() => {
		const loadedImages: Promise<void>[] = [];

		for (const image of images) {
			if (map && !map.hasImage(image.id)) {
				loadedImages.push(
					new Promise<void>((resolve, reject) => {
						map.loadImage(image.png, (error, mapimage) => {
							if (error) {
								reject(error);
							}

							map.addImage(image.id, mapimage as HTMLImageElement, {
								sdf: image.id !== "icon-traffic-closure",
							});

							resolve();
						});
					}).catch((ex) => console.log(`useMapImages() -> loadImage() -> Error: ${ex}`)),
				);
			}
		}

		Promise.all(loadedImages)
			.then(() => setStatus("success"))
			.catch((ex) => console.log(ex));
	}, [map]);

	useEffect(() => {
		if (map) {
			setStatus("loading");
			loadHandler();
		}
	}, [map, loadHandler]);

	return { status };
};

export { useMapImages };
