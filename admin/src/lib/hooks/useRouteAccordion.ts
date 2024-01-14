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
import { useAppData } from "../../App";
import { useRouteSchema } from "./useRouteSchema";
import { Params } from "@feathersjs/feathers";

type UseRouteAccordion = {
	methods: UseFormReturn<radarTrap.Route, any>;
	register: UseFormRegister<radarTrap.Route>;
	deleteHandler: (event: SyntheticEvent) => Promise<void>;
	createHandler: (event: SyntheticEvent) => void;
};

const useRouteAccordion = ({
	index,
	field,
	update: fieldUpdate,
	remove: fieldRemove,
}: {
	index: number;
	field: FieldArrayWithId<radarTrap.FormRoutes, "routes">;
	update: UseFieldArrayUpdate<radarTrap.FormRoutes, "routes">;
	remove: UseFieldArrayRemove;
}): UseRouteAccordion => {
	const { feathers } = useAppData();
	const create = (data: radarTrap.Route, params?: Params) => feathers.service("routes").create(data, params);
	const remove = (id: string, params?: Params) => feathers.service("routes").remove(id, params);

	const routeSchema = useRouteSchema();
	const methods = useForm<radarTrap.Route>({
		mode: "onChange",
		defaultValues: field,
		resolver: yupResolver(routeSchema),
	});

	const {
		register,
		trigger,
		handleSubmit,
		formState: { dirtyFields },
	} = methods;

	useEffect(() => {
		trigger().catch((ex) => console.log(ex));
	}, [trigger]);

	const deleteHandler = async (event: SyntheticEvent) => {
		event.stopPropagation();
		try {
			fieldRemove(index);

			await remove(field._id);
		} catch (ex: any) {
			if (ex.type === "FeathersError" && ex.code === 404) {
				return;
			}

			console.log("Error in removeRoute", ex);
		}
	};

	const createHandler = (event: SyntheticEvent) => {
		event.stopPropagation();
		handleSubmit((data: radarTrap.Route) => {
			// Zwingend erforderlich, id mutable!
			delete data.id;

			setTimeout(() => fieldUpdate(index, data), 0);
			// fieldUpdate(index, data);

			create(
				data,
				paramsForServer({
					patchSourceFromClient: Boolean(
						dirtyFields.src || dirtyFields.dst || dirtyFields.profiles || dirtyFields.maxTrapDistance,
					),
				}),
			).catch((ex: any) => console.log("Error in createRoute", ex));
		})().catch((ex) => console.log("Error in handleSubmit", ex));
	};

	return {
		methods,
		register,
		deleteHandler,
		createHandler,
	};
};

export { useRouteAccordion };
