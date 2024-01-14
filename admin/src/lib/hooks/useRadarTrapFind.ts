import { useCallback, useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { useAppData } from "../../App";
import { FeathersError } from "@feathersjs/errors";
import { filter, findIndex, set } from "lodash";
import { Params } from "@feathersjs/feathers";

const useRadarTrapFind = <T extends radarTrap.Area | radarTrap.Route>(
	serviceName: string,
	params: Params = {},
): { status: radarTrap.GenericStatus; data: T[]; total: number | null } => {
	type TWithIndex = T & Record<string, unknown>;
	type AreaWithIndex = radarTrap.Area & { [key: string]: unknown };
	type RouteWithIndex = radarTrap.Route & { [key: string]: unknown };

	const { feathers } = useAppData();

	const [total, setTotal] = useState<number | null>(null);
	const [data, setData] = useState<T[]>([]);
	const [status, setStatus] = useState<radarTrap.GenericStatus>("idle");

	const find = useCallback(
		async (serviceName: string, params: Params) => {
			try {
				setStatus("loading");

				const { data: _data, total: _total }: { data: T[]; total: number } = await feathers
					.service(serviceName)
					.find(params);

				setTotal(_total);
				setData(_data);

				setStatus("success");
			} catch (err) {
				if (err instanceof FeathersError) {
					if (err.name === "NotFound") {
						setData([]);
						setStatus("error");
					} else {
						console.log(err);
					}
				} else {
					console.log(err);
				}
			}
		},
		[feathers],
	);

	useDeepCompareEffect(() => {
		find(serviceName, params);
	}, [find, serviceName, params]);

	const dataCreatedHandler = useCallback(
		(params: Params) => (createdData: AreaWithIndex | RouteWithIndex) => {
			setStatus("loading");

			setData((prevData) => {
				const index = findIndex(prevData, (_data) => _data._id === createdData._id);

				const _data: Partial<TWithIndex> | undefined =
					params.query && params.query.$select
						? params.query.$select.reduce((acc: Partial<TWithIndex>, key: string) => {
								if (key in createdData) {
									(acc as Record<string, unknown>)[key] = createdData[key];
								}
								return acc;
							}, {} as Partial<TWithIndex>)
						: undefined;

				if (_data === undefined) {
					return prevData;
				} else {
					return index === -1
						? [...prevData, _data as unknown as T]
						: set(prevData, index, _data as unknown as T);
				}
			});

			setStatus("success");
		},
		[],
	);

	const dataRemovedHandler = useCallback((removedData: T) => {
		setStatus("loading");
		setData((prevData) => filter(prevData, (data) => data._id !== removedData._id));
		setStatus("success");
	}, []);

	useDeepCompareEffect(() => {
		const _dataCreatedHandler = dataCreatedHandler(params);

		feathers.service(serviceName).on("created", _dataCreatedHandler);
		feathers.service(serviceName).on("removed", dataRemovedHandler);

		// eslint-disable-next-line consistent-return
		return () => {
			feathers.service(serviceName).removeListener("created", _dataCreatedHandler);
			feathers.service(serviceName).removeListener("removed", dataRemovedHandler);
		};
	}, [feathers, serviceName, params]);

	return { status, data, total };
};

export { useRadarTrapFind };
