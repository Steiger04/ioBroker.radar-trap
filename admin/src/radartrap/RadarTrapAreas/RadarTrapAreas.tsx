import I18n from "@iobroker/adapter-react-v5/i18n";
import { AreaAndRouteCard, Loading } from "../../components";
import { useInvisibleBottomButtons, useRadarTrapAreas } from "../../lib";
import { AreaAccordion } from "./AreaAccordion";

import { type FC, type ReactElement } from "react";

interface RadarTrapAreasProps {
	accordionDisabledMap: Map<string | null, boolean>;
}
const RadarTrapAreas: FC<RadarTrapAreasProps> = ({ accordionDisabledMap }): ReactElement => {
	const { status, fields, prepend, update, remove, getDefault, expanded, handleChange } = useRadarTrapAreas();
	const { bottomButtons } = useInvisibleBottomButtons();

	const renderAreaAccordion = fields
		.map((field, index) => (
			<AreaAccordion
				key={field.id}
				{...{
					accordionDisabledMap,
					index,
					expanded,
					update,
					remove,
					handleChange,
					field,
				}}
			/>
		))
		.sort((a, b) => a.props.field.description!.localeCompare(b.props.field.description!));

	return !bottomButtons && status === "success" ? (
		<AreaAndRouteCard label={I18n.t("Add area")} buttonClickHandler={() => prepend(getDefault())}>
			{renderAreaAccordion}
		</AreaAndRouteCard>
	) : (
		<Loading />
	);
};

export { RadarTrapAreas };
