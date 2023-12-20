import { yupResolver } from "@hookform/resolvers/yup";
import { paramsForServer } from "feathers-hooks-common";
import { SyntheticEvent, useEffect } from "react";
import {
	FieldArrayWithId,
	UseFieldArrayRemove,
	UseFieldArrayUpdate,
	useForm,
	UseFormRegister,
	UseFormReturn,
} from "react-hook-form";
import { useAccordionDisabled } from "./useAccordionDisabled";
import { useAreaSchema } from "./useAreaSchema";
import { useAppData } from "../../App";
import { Params } from "@feathersjs/feathers";

type UseAreaAccordion = {
	methods: UseFormReturn<radarTrap.Area, any>;
	accordionDisabledMap: Map<string, boolean>;
	register: UseFormRegister<radarTrap.Area>;
	deleteHandler: (event: SyntheticEvent) => Promise<void>;
	createHandler: (event: SyntheticEvent) => void;
};

const useAreaAccordion = ({
	index,
	field,
	update: fieldUpdate,
	remove: fieldRemove,
}: {
	index: number;
	field: FieldArrayWithId<radarTrap.FormAreas, "areas">;
	update: UseFieldArrayUpdate<radarTrap.FormAreas, "areas">;
	remove: UseFieldArrayRemove;
}): UseAreaAccordion => {
	const { feathers } = useAppData();
	const create = (data: radarTrap.Area, params?: Params) => feathers.service("areas").create(data, params);
	const remove = (id: string, params?: Params) => feathers.service("areas").remove(id, params);

	const { accordionDisabledMap } = useAccordionDisabled();

	const areaSchema = useAreaSchema();
	const methods = useForm<radarTrap.Area>({
		mode: "onChange",
		defaultValues: field,
		resolver: yupResolver(areaSchema),
	});

	const {
		register,
		trigger,
		handleSubmit,
		formState: { dirtyFields },
	} = methods;

	useEffect(() => {
		trigger().catch((ex) => console.log(ex));
	}, []);

	const deleteHandler = async (event: SyntheticEvent) => {
		event.stopPropagation();
		try {
			fieldRemove(index);

			await remove(field._id);
		} catch (ex: any) {
			if (ex.type === "FeathersError" && ex.code === 404) {
				return;
			}

			console.log("Error in removeArea", ex);
		}
	};

	const createHandler = (event: SyntheticEvent) => {
		event.stopPropagation();
		handleSubmit((data: radarTrap.Area) => {
			// Zwingend erforderlich, id mutable!
			delete data.id;

			// setTimeout(() => fieldUpdate(index, data), 0);
			fieldUpdate(index, data);

			// console.log("data", data);

			create(
				data,
				paramsForServer({
					patchSourceFromClient: Boolean(dirtyFields.areaPolygons),
				}),
			).catch((ex: any) => console.log("Error in createArea", ex));
		})().catch((ex) => console.log("Error in handleSubmit", ex));
	};

	return {
		methods,
		accordionDisabledMap,
		register,
		deleteHandler,
		createHandler,
	};
};

export { useAreaAccordion };
