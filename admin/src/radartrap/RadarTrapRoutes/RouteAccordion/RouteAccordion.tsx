import { FormProvider } from "react-hook-form";
import { RouteInputData } from ".";
import { useRouteAccordion } from "../../../lib";
import { RadarTrapAccordion } from "../../../radartrap";

import { type FC, type ReactElement } from "react";
import type { FieldArrayWithId, UseFieldArrayRemove, UseFieldArrayUpdate } from "react-hook-form";
import type { UseAccordionExpanded } from "../../../lib";

interface RouteAccordionProps {
	accordionDisabledMap: Map<string | null, boolean>;
	expanded: UseAccordionExpanded["expanded"];
	handleChange: UseAccordionExpanded["handleChange"];
	update: UseFieldArrayUpdate<radarTrap.FormRoutes, "routes">;
	remove: UseFieldArrayRemove;
	index: number;
	field: FieldArrayWithId<radarTrap.FormRoutes, "routes">;
}

const RouteAccordion: FC<RouteAccordionProps> = ({
	accordionDisabledMap,
	expanded,
	handleChange,
	update,
	remove,
	index,
	field,
}): ReactElement => {
	const { methods, register, deleteHandler, createHandler } = useRouteAccordion({
		index,
		field,
		remove,
		update,
	});

	const {
		formState: { isValid, isDirty },
	} = methods;

	return (
		<FormProvider {...methods}>
			<input type="hidden" {...register("_id")} />

			<RadarTrapAccordion
				_id={field._id}
				id={field.id}
				description={field.description}
				{...{
					accordionDisabledMap,
					expanded,
					handleChange,
					deleteHandler,
					createHandler,
					isValid,
					isDirty,
				}}
			>
				<RouteInputData
					{...{
						disabled: accordionDisabledMap.get(field._id)!,
						field,
					}}
				/>
			</RadarTrapAccordion>
		</FormProvider>
	);
};

export { RouteAccordion };
