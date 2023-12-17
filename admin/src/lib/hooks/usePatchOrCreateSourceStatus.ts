import { useEffect, useState } from "react";
import { useAppData } from "../../App";

const usePatchOrCreateSourceStatus = (): radarTrap.GenericStatusWithId => {
	const { feathers } = useAppData();

	const [patchOrCreateSourceStatus, setpatchOrCreateSourceStatus] = useState<radarTrap.GenericStatusWithId>({
		_id: null,
		status: "idle",
	});

	const onStatusListener = (data: radarTrap.GenericStatusWithId): void => {
		setpatchOrCreateSourceStatus(data);
	};

	useEffect(() => {
		feathers.service("areas").on("status", onStatusListener);
		feathers.service("routes").on("status", onStatusListener);

		return (): void => {
			feathers.service("areas").removeListener("status", onStatusListener);

			feathers.service("routes").removeListener("status", onStatusListener);
		};
	}, []);

	return patchOrCreateSourceStatus;
};

export { usePatchOrCreateSourceStatus };
