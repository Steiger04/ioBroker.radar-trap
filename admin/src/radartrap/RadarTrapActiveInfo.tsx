import I18n from "@iobroker/adapter-react-v5/i18n";
import { FC, ReactElement, useEffect } from "react";
import { useAppData } from "../App";
import { Message } from "../components";
import { useRadarTrapEnabled } from "../lib";

const RadarTrapActiveInfo: FC = (): ReactElement | null => {
	const { feathers } = useAppData();
	const { enabled: radarTrapEnabled } = useRadarTrapEnabled();

	useEffect(() => {
		if (!radarTrapEnabled && process.env.NODE_ENV === "production") {
			feathers.io.disconnect();
			// feathers.io.connect();
		} else {
			feathers.io.connect();
		}
	}, [radarTrapEnabled, feathers]);

	/* return radarTrapEnabled ? ( */
	return !radarTrapEnabled && process.env.NODE_ENV === "production" ? (
		<Message message={`${I18n.t("For the configuration the radar-trap instance must be started")}`} />
	) : null;
};

export { RadarTrapActiveInfo };
