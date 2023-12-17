import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { grey } from "@mui/material/colors";
import { gsap } from "gsap";
import { FC, ReactElement, SyntheticEvent, useEffect, useRef, useState } from "react";
import { ButtonGroup } from "../components/ButtonGroup";

import type { UseAccordionExpanded } from "../lib";

const Grey = grey[500];

interface RadarTrapAccordionProps {
	accordionDisabledMap: Map<string, boolean>;
	_id: string;
	id: string;
	description: string | undefined;
	expanded: UseAccordionExpanded["expanded"];
	handleChange: UseAccordionExpanded["handleChange"];
	deleteHandler: (event: SyntheticEvent<Element, Event>) => Promise<void>;
	createHandler: (event: SyntheticEvent<Element, Event>) => void;
	isValid: boolean;
	isDirty: boolean;
}

const RadarTrapAccordion: FC<RadarTrapAccordionProps> = ({
	children,
	accordionDisabledMap,
	_id,
	id,
	description,
	expanded,
	handleChange,
	deleteHandler,
	createHandler,
	isValid,
	isDirty,
}): ReactElement => {
	const accordionRef = useRef<HTMLDivElement>(null);

	const [disabled, setDisabled] = useState<boolean | undefined>(accordionDisabledMap.get(_id));

	useEffect(() => {
		setDisabled(accordionDisabledMap.get(_id));
	}, [accordionDisabledMap, _id]);

	useEffect(() => {
		if (disabled === true) {
			gsap.to(accordionRef.current, {
				ease: "power3.easeIn",
				duration: 1.0,
				autoAlpha: 0.4,
				repeat: -1.0,
				yoyo: true,
			});
		} else if (disabled === false) {
			gsap.killTweensOf(accordionRef.current);
			gsap.to(accordionRef.current, {
				ease: "power1.easeIn",
				duration: 1.0,
				autoAlpha: 1,
			});
		}
	}, [disabled]);

	return (
		<Accordion
			ref={accordionRef}
			sx={{
				"&.MuiAccordion-root": {
					border: `1px solid ${Grey}`,
				},
			}}
			disabled={accordionDisabledMap.get(_id)}
			square={true}
			expanded={expanded === id}
			onChange={handleChange(id)}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<ButtonGroup
					{...{
						_id,
						description,
						deleteHandler,
						createHandler,
						isValid,
						isDirty,
					}}
				/>
			</AccordionSummary>
			<AccordionDetails sx={{ px: 4 }}>{children}</AccordionDetails>
		</Accordion>
	);
};

export { RadarTrapAccordion };
