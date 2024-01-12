import I18n from "@iobroker/adapter-react-v5/i18n";
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
import { useRadarTrapFind } from "./useRadarTrapFind";

const getDefault = (): radarTrap.Route => ({
	_id: nanoid(),
	description: ` ${I18n.t("Route description")}`,
	src: { address: "", geometry: { coordinates: [], type: "Point" } },
	dst: { address: "", geometry: { coordinates: [], type: "Point" } },
	profiles: [
		{
			name: "driving",
			active: true,
			allowedExclusion: ["motorway", "toll", "ferry", "unpaved", "cash_only_tolls"],
			actualExclusion: [],
		},
		{
			name: "driving-traffic",
			active: false,
			allowedExclusion: ["motorway", "toll", "ferry", "unpaved", "cash_only_tolls"],
			actualExclusion: [],
		},
		{
			name: "cycling",
			active: false,
			allowedExclusion: ["ferry"],
			actualExclusion: [],
		},
		{
			name: "walking",
			active: false,
			allowedExclusion: ["ferry", "cash_only_tolls"],
			actualExclusion: [],
		},
	],
	cron: "10 * * * *",
	maxTrapDistance: 10,
});

type UseRadarTrapRoutes = {
	status: radarTrap.GenericStatus;
	fields: FieldArrayWithId<radarTrap.FormRoutes, "routes", "id">[];
	prepend: UseFieldArrayPrepend<radarTrap.FormRoutes, "routes">;
	update: UseFieldArrayUpdate<radarTrap.FormRoutes, "routes">;
	remove: UseFieldArrayRemove;
	getDefault: () => radarTrap.Route;
	expanded: UseAccordionExpanded["expanded"];
	handleChange: UseAccordionExpanded["handleChange"];
};

const useRadarTrapRoutes = (): UseRadarTrapRoutes => {
	const { expanded, handleChange } = useAccordionExpanded();

	const { data, status } = useRadarTrapFind<radarTrap.Route>("routes", {
		query: {
			$select: ["_id", "description", "src", "dst", "profiles", "cron", "maxTrapDistance"],
		},
	});

	const methods = useForm<radarTrap.FormRoutes>();
	const { control, reset } = methods;

	const { fields, prepend, update, remove } = useFieldArray({
		control,
		name: "routes",
		shouldUnregister: false,
	});

	useEffect(() => {
		status === "success" && reset({ routes: data as radarTrap.Routes });
	}, [status, data]);

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

export { useRadarTrapRoutes, UseRadarTrapRoutes };
