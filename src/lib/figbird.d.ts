declare module "figbird" {
	import { Application, Params, ServiceMethods } from "@feathersjs/feathers";
	import { FC } from "react";

	export interface ProviderProps {
		feathers: Application;
		idField?: string;
	}

	export const Provider: FC<ProviderProps>;

	export interface FigbirdContextValue {
		actions: any;
		atom: any;
		config: any;
		feathers: Application;
		useSelector: any;
	}

	export type Realtime = "merge" | "refetch" | "disabled";
	export type FetchPolicy = "swr" | "cache-first" | "network-only";
	export type Status = "loading" | "success" | "error";
	export type MutationStatus = Status | "idle";

	interface BaseParams {
		skip?: boolean;
		realtime?: string;
		fetchPolicy?: FetchPolicy;
	}

	interface FetchResult<T = any> {
		data: null | T;
		status: Status;
		isFetching?: null | boolean;
		error?: null | any;
		refetch: () => any;
	}

	export const useFigbird: () => FigbirdContextValue;
	export const useFeathers: () => Application;
	export const useIdField: (field?: string) => any;
	export const useUpdatedAtField: (updatedAtField?: string) => any;

	export const useQuery: (
		serviceName: string,
		options: any,
		queryHookOptions: any,
	) => any;

	export type UseGetParams = BaseParams;
	export type UseGetResult<T = any> = FetchResult<T>;

	export const useGet: <T = any>(
		serviceName: string,
		id: any,
		options?: any,
	) => UseGetResult<T>;

	export interface UseFindParams extends BaseParams, Params {
		allPages?: boolean;
		matcher?: (query: any) => (item: any) => boolean;
	}

	export interface UseFindResult<T = any> extends FetchResult<T[]> {
		total: number;
		limit: number;
		skip: number;
	}

	export const useFind: <T = any>(
		serviceName: string,
		params: UseFindParams,
	) => UseFindResult<T>;

	export interface UseMutationResult<T = any>
		extends Pick<
			ServiceMethods<T>,
			"create" | "update" | "patch" | "remove"
		> {
		status: MutationStatus;
		data: null | T | T[];
		error: null | any;
	}

	export const useMutation: <T = any>(
		serviceName: string,
	) => UseMutationResult<T>;
}
