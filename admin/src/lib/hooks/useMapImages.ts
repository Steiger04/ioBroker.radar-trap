import { useCallback, useEffect, useState } from "react";
import IconFixedTrap from "../../../assets/map-icons/icon-fixed-trap.png";
import IconMobileTrap from "../../../assets/map-icons/icon-mobile-trap.png";
import IconTrafficJam from "../../../assets/map-icons/icon-traffic-jam.png";
import IconRoadWork from "../../../assets/map-icons/icon-road-work.png";
import IconAccident from "../../../assets/map-icons/icon-accident.png";
import IconObject from "../../../assets/map-icons/icon-object.png";
import IconSleekness from "../../../assets/map-icons/icon-sleekness.png";
import IconFog from "../../../assets/map-icons/icon-fog.png";
import IconPoliceNews from "../../../assets/map-icons/icon-police-news.png";
import IconTrafficClosure from "../../../assets/map-icons/icon-traffic-closure.png";
import Icon20 from "../../../assets/map-icons/icon-20.png";

import type { MapRef } from "react-map-gl";

const images = [
	{ id: "icon-fixed-trap", png: IconFixedTrap },
	{ id: "icon-mobile-trap", png: IconMobileTrap },
	{ id: "icon-traffic-jam", png: IconTrafficJam },
	{ id: "icon-road-work", png: IconRoadWork },
	{ id: "icon-accident", png: IconAccident },
	{ id: "icon-object", png: IconObject },
	{ id: "icon-sleekness", png: IconSleekness },
	{ id: "icon-fog", png: IconFog },
	{ id: "icon-police-news", png: IconPoliceNews },
	{ id: "icon-traffic-closure", png: IconTrafficClosure },
	{ id: "icon-20", png: Icon20 },
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

							map.addImage(image.id, mapimage as HTMLImageElement, { sdf: false });

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
