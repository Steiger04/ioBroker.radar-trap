import { useCallback, useEffect, useState } from "react";

import type { MapRef } from "react-map-gl";

const images = [
	{ id: "icon-fixed-trap", png: "assets/map-icons/icon-fixed-trap.png" },
	{ id: "icon-mobile-trap", png: "assets/map-icons/icon-mobile-trap.png" },
	{ id: "icon-traffic-jam", png: "assets/map-icons/icon-traffic-jam.png" },
	{ id: "icon-road-work", png: "assets/map-icons/icon-road-work.png" },
	{ id: "icon-accident", png: "assets/map-icons/icon-accident.png" },
	{ id: "icon-object", png: "assets/map-icons/icon-object.png" },
	{ id: "icon-sleekness", png: "assets/map-icons/icon-sleekness.png" },
	{ id: "icon-fog", png: "assets/map-icons/icon-fog.png" },
	{ id: "icon-police-news", png: "assets/map-icons/icon-police-news.png" },
	{
		id: "icon-traffic-closure",
		png: "assets/map-icons/icon-traffic-closure.png",
	},
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
