import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { grey } from "@mui/material/colors";
import { gsap } from "gsap";
import {
	type FC,
	type PropsWithChildren,
	type ReactElement,
	type SyntheticEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { ButtonGroup } from "../components/ButtonGroup";

import type { UseAccordionExpanded } from "../lib";

const Grey = grey[500];

interface RadarTrapAccordionProps {
	_id: string;
	id: string;
	accordionDisabledMap: Map<string | null, boolean>;
	description: string | undefined;
	expanded: UseAccordionExpanded["expanded"];
	handleChange: UseAccordionExpanded["handleChange"];
	deleteHandler: (event: SyntheticEvent<Element, Event>) => Promise<void>;
	createHandler: (event: SyntheticEvent<Element, Event>) => void;
	isValid: boolean;
	isDirty: boolean;
}

const RadarTrapAccordion: FC<PropsWithChildren<RadarTrapAccordionProps>> = ({
	children,
	_id,
	id,
	accordionDisabledMap,
	description,
	expanded,
	handleChange,
	deleteHandler,
	createHandler,
	isValid,
	isDirty,
}): ReactElement => {
	const accordionRef = useRef<HTMLDivElement>(null);

	const [disabled, setDisabled] = useState<boolean | undefined>(false);

	useEffect(() => {
		const _value = accordionDisabledMap.get(_id);
		if (_value !== undefined) setDisabled(accordionDisabledMap.get(_id));
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
						accordionDisabledMap,
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
