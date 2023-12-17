import I18n from "@iobroker/adapter-react/i18n";
import { Status, useFind } from "figbird";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import {
	FieldArrayWithId,
	useFieldArray,
	UseFieldArrayPrepend,
	UseFieldArrayRemove,
	UseFieldArrayUpdate,
	useForm,
} from "react-hook-form";
import { useAccordionExpanded, UseAccordionExpanded } from "./useAccordionExpanded";

const getDefault = (): radarTrap.Area => ({
	_id: nanoid(),
	description: ` ${I18n.t("Area description")}`,
	cron: "10 * * * *",
	areaPolygons: {},
});

type UseRadarTrapAreas = {
	status: Status;
	fields: FieldArrayWithId<radarTrap.FormAreas, "areas", "id">[];
	prepend: UseFieldArrayPrepend<radarTrap.FormAreas, "areas">;
	update: UseFieldArrayUpdate<radarTrap.FormAreas, "areas">;
	remove: UseFieldArrayRemove;
	getDefault: () => radarTrap.Area;
	expanded: UseAccordionExpanded["expanded"];
	handleChange: UseAccordionExpanded["handleChange"];
};

const useRadarTrapAreas = (): UseRadarTrapAreas => {
	const { expanded, handleChange } = useAccordionExpanded();
	const { data, status } = useFind<radarTrap.Area>("areas", {
		allPages: true,
		realtime: "refetch",
		query: {
			/* $sort: { description: 1 }, */
			$select: ["_id", "description", "cron", "areaPolygons"],
		},
	});

	const methods = useForm<radarTrap.FormAreas>();
	const { control, reset } = methods;

	const { fields, prepend, update, remove } = useFieldArray({
		control,
		name: "areas",
		shouldUnregister: false,
	});

	useEffect(() => {
		status === "success" && reset({ areas: data as radarTrap.Areas });
	}, [status]);

	return {
		status,
		fields,
		prepend,
		update,
		remove,
		getDefault,
		expanded,
		handleChange,
	};
};

export { useRadarTrapAreas, UseRadarTrapAreas };
