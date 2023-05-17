import cronstrue from "cronstrue/i18n";

const cronCheck = (
	cron: string,
	language: string,
): Partial<radarTrap.CronResult> => {
	const cronResult: Partial<radarTrap.CronResult> = {};

	try {
		cronResult.text = cronstrue.toString(cron, { locale: language });
		cronResult.errorText = "";
		cronResult.isValid = true;
	} catch (ex) {
		const errorText = ex as string;

		cronResult.text = "";
		cronResult.errorText = errorText.substring(
			"Error: ".length,
			errorText.length,
		);
		cronResult.isValid = false;
	}

	return cronResult;
};

export { cronCheck };
