import { useEffect, useState } from "react";
import { usePatchOrCreateSourceStatus } from "..";

const useAccordionDisabled = (): {
	disabled: boolean;
	accordionDisabledMap: Map<string, boolean>;
} => {
	const { _id: id, status } = usePatchOrCreateSourceStatus();
	const [disabled, setDisabled] = useState(false);

	const [accordionDisabledMap, setAccordionDisabledMap] = useState(
		new Map<string, boolean>(),
	);

	const updateMap = (key: string | null, value: boolean): void => {
		if (key) {
			setAccordionDisabledMap((map) => new Map(map.set(key, value)));
		}
	};

	useEffect(() => {
		updateMap(id, status === "loading");
	}, [id, status]);

	useEffect(() => {
		if (
			Object.values(
				Object.fromEntries(accordionDisabledMap.entries()),
			).includes(true)
		) {
			setDisabled(true);
		} else {
			setDisabled(false);
		}
	}, [accordionDisabledMap]);

	return { disabled, accordionDisabledMap };
};

export { useAccordionDisabled };
