import { useEffect, useState } from "react";
import type { Subscription } from "rxjs";
import { useAppData } from "../../App";
import { radarTrapEnabled$ } from "../helpers/radarTrapEnabledStream";

const useRadarTrapEnabled = (): { enabled: boolean } => {
	const { socket, instanceId } = useAppData();
	const [enabled, setEnabled] = useState<boolean>(false);

	useEffect(() => {
		let sub: Subscription;

		socket
			.getObject(instanceId)
			.then((instanceObj) => {
				sub = radarTrapEnabled$.subscribe((radarTrapEnabled) => {
					// console.log("radarTrapEnabled", radarTrapEnabled);

					setEnabled(radarTrapEnabled);
				});

				// console.log("instanceObj", instanceObj);
				radarTrapEnabled$.next(instanceObj?.common.enabled);
			})
			.catch((ex: any) => console.log(ex));

		return () => {
			if (sub !== undefined) sub.unsubscribe();
		};
	}, [instanceId, socket]);

	return { enabled };
};

export { useRadarTrapEnabled };
