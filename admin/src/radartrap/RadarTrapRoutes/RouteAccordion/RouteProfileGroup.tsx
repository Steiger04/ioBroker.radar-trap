import I18n from "@iobroker/adapter-react-v5/i18n";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import type { ChangeEvent, FC, ReactElement } from "react";

interface RouteProfileGroupProps {
	disabled: boolean;
}
const RouteProfileGroup: FC<RouteProfileGroupProps> = ({ disabled }): ReactElement => {
	const { control } = useFormContext<radarTrap.Route>();

	const {
		field: { onChange, value: profiles },
	} = useController({
		control,
		name: "profiles",
	});

	const [activeProfile, setActiveProfile] = useState<radarTrap.Profile>(profiles.find((profile) => profile.active)!);

	const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
		profiles.forEach((profile) => {
			if (profile.name === event.target.value) {
				setActiveProfile({ ...profile, active: true });
			}
		});
	};

	const handleBoxChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const exclusion = event.target.value as radarTrap.Exclusions;
		const { checked } = event.target;

		let { actualExclusion } = activeProfile;

		actualExclusion = actualExclusion.filter((exc) => exc !== exclusion);
		if (checked) {
			actualExclusion.splice(actualExclusion.length + 1, 0, exclusion);
		}

		setActiveProfile((ap) => ({ ...ap, actualExclusion }));
	};

	useEffect(() => {
		const actualProfiles = profiles.map((profile) => {
			if (profile.name === activeProfile.name) {
				return activeProfile;
			}

			return { ...profile, active: false };
		});

		onChange(actualProfiles);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeProfile]);

	return (
		<FormControl>
			<FormLabel disabled={disabled}>{I18n.t("profile")}</FormLabel>
			<RadioGroup row={true} name={activeProfile.name} value={activeProfile.name} onChange={handleRadioChange}>
				{profiles.map((profile) => (
					<Tooltip key={profile.name} title={I18n.t(`${profile.name}-tooltip`)} placement="top">
						<FormControlLabel
							disabled={disabled}
							labelPlacement="end"
							value={profile.name}
							control={<Radio disabled={disabled} />}
							label={I18n.t(profile.name)}
						/>
					</Tooltip>
				))}
			</RadioGroup>

			<FormLabel disabled={disabled}>{I18n.t("exclusions")}</FormLabel>
			<FormGroup row={true}>
				{profiles
					.find((profile) => profile.active)!
					.allowedExclusion.map((exclusion) => (
						<FormControlLabel
							disabled={disabled}
							key={exclusion}
							labelPlacement="end"
							value={exclusion}
							control={
								<Checkbox
									disabled={disabled}
									value={exclusion}
									onChange={handleBoxChange}
									checked={activeProfile.actualExclusion.includes(exclusion)}
								/>
							}
							label={I18n.t(exclusion as AdminWord)}
						/>
					))}
			</FormGroup>
		</FormControl>
	);
};

export { RouteProfileGroup };
