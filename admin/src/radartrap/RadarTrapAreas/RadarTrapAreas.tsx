import I18n from "@iobroker/adapter-react/i18n";
import { AreaAndRouteCard, Loading } from "../../components";
import { useInvisibleBottomButtons, useRadarTrapAreas } from "../../lib";
import { AreaAccordion } from "./AreaAccordion";

import type { FC, ReactElement } from "react";

const RadarTrapAreas: FC = (): ReactElement => {
	const {
		status,
		fields,
		prepend,
		update,
		remove,
		getDefault,
		expanded,
		handleChange,
	} = useRadarTrapAreas();

	useInvisibleBottomButtons();

	const renderAreaAccordion = fields
		.map((field, index) => (
			<AreaAccordion
				key={field.id}
				{...{
					index,
					expanded,
					update,
					remove,
					handleChange,
					field,
				}}
			/>
		))
		.sort((a, b) =>
			a.props.field.description!.localeCompare(
				b.props.field.description!,
			),
		);

	return status === "success" ? (
		<AreaAndRouteCard
			label={I18n.t("Add area")}
			buttonClickHandler={() => prepend(getDefault())}
		>
			{renderAreaAccordion}
		</AreaAndRouteCard>
	) : (
		<Loading />
	);
};

export { RadarTrapAreas };
