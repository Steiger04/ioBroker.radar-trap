// This file extends the AdapterConfig type from "@types/iobroker"
import createApplication from "@feathersjs/feathers";
import { Route as MapBoxRoute } from "@mapbox/mapbox-sdk/services/directions";
import { Path } from "react-hook-form";
import { App } from "../../admin/src/App";
import { atudoPoiSchema, atudoPoiInfoSchema } from "./schemas/atudoPoiSchema";
import { atudoPolySchema } from "./schemas/atudoPolySchema";
import type { Static } from "@sinclair/typebox";

import type { MatrixResponse } from "@mapbox/mapbox-sdk/services/matrix";
import type { FeatureCollection, LineString, Point, Feature } from "@turf/helpers/dist/js/lib/geojson";

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
	namespace ioBroker {
		interface INativeSettings {
			httpsEnabled: boolean;
			domains: string;
			feathersPort: number;
			mbxAccessToken: string;
		}
		interface INative {
			settings: INativeSettings;
		}
		type nativeKeys = Path<INative>;

		type AdapterConfig = INative;

		interface IAppContext {
			that: App;
			savedNative: INative;
			updateNativeValue: (attr: nativeKeys, value: any, cb?: () => void) => void;
			native: INative | Partial<INative>;
			feathers: createApplication.Application<any> & {
				io: SocketIOClient.Socket;
			};
			language: string;
		}
	}
}

declare global {
	namespace radarTrap {
		type FeathersClient = createApplication.Application<any> & {
			io: SocketIOClient.Socket;
		};

		type ICronCounter = Record<string, ioBroker.StateValue>;

		type GenericStatus = "idle" | "loading" | "success" | "error";
		interface GenericStatusWithId {
			_id: string | null;
			status: GenericStatus;
		}

		type Exclusions = "motorway" | "toll" | "ferry" | "unpaved" | "cash_only_tolls";

		interface Profile {
			active: boolean;
			name: "driving" | "driving-traffic" | "cycling" | "walking";
			allowedExclusion: Exclusions[];
			actualExclusion: Exclusions[];
		}

		interface Direction {
			direction: MapBoxRoute<string> & {
				directionFeature?: Feature<Point | LineString, Poi>;
			};
			// traps: Record<string, GeoJSON.Feature<GeoJSON.LineString | GeoJSON.Point>[]>;
			routeTraps?: Record<string, Feature<LineString | Point, Poi>[]>;
			routeTrapsNew?: Record<string, Feature<LineString | Point, Poi>[]>;
			routeTrapsEstablished?: Record<string, Feature<LineString | Point, Poi>[]>;
			routeTrapsRejected?: Record<string, Feature<LineString | Point, Poi>[]>;
			polyLineFeatures?: Feature<LineString, Poly>[];
			matrix: MatrixResponse;
		}

		interface Route {
			id?: string;
			_id: string;
			description: string | undefined;
			src: { address: string; geometry: GeoJSON.Point };
			dst: { address: string; geometry: GeoJSON.Point };
			profiles: Profile[];
			activeProfile?: Profile;
			cron: string;
			maxTrapDistance: number;
			directions?: Direction[] | null;
			directionsFeatureCollection?: FeatureCollection<Point | LineString, Poi | Poly> | null;
			trapsFeatureCollection?: FeatureCollection<Point | LineString, Poi> | null;
			polyLinesFeatureCollection?: FeatureCollection<LineString, Poly> | null;
			timestamp?: string;
		}

		type Routes = Route[];

		type RouteKeys = Path<Route>;

		interface FormRoutes {
			routes: Routes;
		}

		type AtudoPoi = Static<typeof atudoPoiSchema>;
		type Poi = AtudoPoi & {
			trapInfo?: trapInfo;
			// from determineTrapTypes.ts
			type_name?: string;
			type_text?: string;
			linetrap?: boolean;
			// from trapsChain.ts
			status?: string;
			// from getTrapsFromDirection.ts
			distance?: number;
		};

		type PoiInfo = Static<typeof atudoPoiInfoSchema>;
		type AtudoPoly = Static<typeof atudoPolySchema>;
		type Poly = AtudoPoly & {
			// from trapsChain.ts
			status?: string;
		};
		type trapInfo = {
			id?: string;
			status?: string;
			typeName?: string;
			longitude?: number;
			latitude?: number;
			reason?: string | boolean;
			length?: string | boolean;
			duration?: number | boolean;
			delay?: number | boolean;
			createDate?: string | boolean;
			confirmDate?: string | boolean;
			vmax?: string | boolean;
			typeText?: string | boolean;
			country?: string | boolean;
			state?: string | boolean;
			zipCode?: string | boolean;
			city?: string | boolean;
			cityDistrict?: string | boolean;
			street?: string | boolean;
		};

		interface CronResult {
			text: string;
			errorText: string;
			isValid: boolean;
		}

		type AreaPolygons = Record<string, Feature<GeoJSON.Polygon>>;

		interface Area {
			id?: string;
			_id: string;
			description: string | undefined;
			cron: string;
			areaPolygons: AreaPolygons | null;
			areaTraps?: Record<string, Feature<LineString | Point, Poi>[]>;
			areaTrapsNew?: Record<string, Feature<LineString | Point, Poi>[]>;
			areaTrapsEstablished?: Record<string, Feature<LineString | Point, Poi>[]>;
			areaTrapsRejected?: Record<string, Feature<LineString | Point, Poi>[]>;
			trapsFeatureCollection?: FeatureCollection<Point | LineString, Poi> | null;
			polysFeatureCollection?: FeatureCollection<Point | LineString, Poly> | null;
			polyLinesFeatureCollection?: FeatureCollection<LineString, Poly> | null;
			timestamp?: string;
		}

		type Areas = Area[];

		type AreaKeys = Path<Area>;

		interface FormAreas {
			areas: Areas;
		}
	}
}
