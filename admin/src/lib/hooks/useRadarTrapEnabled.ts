import { useEffect, useState } from "react";
import type { Subscription } from "rxjs";
import { useAppData } from "../../App";
import { radarTrapEnabled$ } from "../helpers/radarTrapEnabledStream";

const useRadarTrapEnabled = (): { enabled: boolean } => {
	const { that } = useAppData();
	const [enabled, setEnabled] = useState<boolean>(false);

	useEffect(() => {
		let sub: Subscription;

		that.socket
			.getObject(that.instanceId)
			.then((instanceObj: ioBroker.Object) => {
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
	}, [that]);

	return { enabled };
};

export { useRadarTrapEnabled };
