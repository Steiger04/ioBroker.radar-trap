import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { cronCheck } from "..";
import { useAppData } from "../../App";

const useCronCheck = (defaultValue: string): Partial<radarTrap.CronResult> => {
	const { language } = useAppData();
	const watchCron = useWatch({ name: "cron", defaultValue });

	const [cron, setCron] = useState<Partial<radarTrap.CronResult>>(() => cronCheck(watchCron, language));

	useEffect(() => {
		setCron(cronCheck(watchCron, language));
	}, [watchCron, language]);

	return cron;
};

export { useCronCheck };
