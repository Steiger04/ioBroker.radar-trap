import I18n from "@iobroker/adapter-react-v5/i18n";
import { RouteAccordion } from "..";
import { AreaAndRouteCard, Loading } from "../../components";
import { useInvisibleBottomButtons } from "../../lib";
import { useRadarTrapRoutes } from "../../lib";

import { type FC, type ReactElement } from "react";

interface RadarTrapRoutesProps {
	accordionDisabledMap: Map<string | null, boolean>;
}
const RadarTrapRoutes: FC<RadarTrapRoutesProps> = ({ accordionDisabledMap }): ReactElement => {
	const { status, fields, prepend, update, remove, getDefault, expanded, handleChange } = useRadarTrapRoutes();
	const { bottomButtons } = useInvisibleBottomButtons();

	const renderRouteAccordion = fields
		.map((field, index) => (
			<RouteAccordion
				key={field.id}
				{...{
					accordionDisabledMap,
					index,
					field,
					update,
					remove,
					expanded,
					handleChange,
				}}
			/>
		))
		.sort((a, b) => a.props.field.description!.localeCompare(b.props.field.description!));

	return !bottomButtons && status === "success" ? (
		<AreaAndRouteCard label={I18n.t("Add route")} buttonClickHandler={() => prepend(getDefault())}>
			{renderRouteAccordion}
		</AreaAndRouteCard>
	) : (
		<Loading />
	);
};

export { RadarTrapRoutes };
