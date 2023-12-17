import I18n from "@iobroker/adapter-react/i18n";
import { RouteAccordion } from "..";
import { AreaAndRouteCard, Loading } from "../../components";
import { useInvisibleBottomButtons } from "../../lib";
import { useRadarTrapRoutes } from "../../lib/hooks/useRadarTrapRoutes";

import type { FC, ReactElement } from "react";

const RadarTrapRoutes: FC = (): ReactElement => {
	const { status, fields, prepend, update, remove, getDefault, expanded, handleChange } = useRadarTrapRoutes();

	useInvisibleBottomButtons();

	const renderRouteAccordion = fields
		.map((field, index) => (
			<RouteAccordion
				key={field.id}
				{...{
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

	return status === "success" ? (
		<AreaAndRouteCard label={I18n.t("Add route")} buttonClickHandler={() => prepend(getDefault())}>
			{renderRouteAccordion}
		</AreaAndRouteCard>
	) : (
		<Loading />
	);
};

export { RadarTrapRoutes };
