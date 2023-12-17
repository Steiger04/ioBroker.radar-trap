import { SyntheticEvent, useState } from "react";

type UseAccordionExpanded = {
	expanded: string | boolean;
	handleChange: (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => void;
};

const useAccordionExpanded = (): UseAccordionExpanded => {
	const [expanded, setExpanded] = useState<string | boolean>(false);

	const handleChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	return { expanded, handleChange };
};

export { useAccordionExpanded, UseAccordionExpanded };
