// This file extends the AdapterConfig type from "@types/iobroker"
import type createApplication from '@feathersjs/feathers';
import type { Route as MapBoxRoute } from '@mapbox/mapbox-sdk/services/directions';
import type { atudoPoiSchema, atudoPoiInfoSchema } from './schemas/atudoPoiSchema';
import type { atudoPolySchema } from './schemas/atudoPolySchema';

import type { Static } from '@sinclair/typebox';
import type { MatrixResponse } from '@mapbox/mapbox-sdk/services/matrix';
import type { FeatureCollection, LineString, Point, Feature } from '@turf/helpers';
import type * as utils from '@iobroker/adapter-core';

// Augment the globally declared type ioBroker.AdapterConfig
declare global {
    namespace ioBroker {
        interface AdapterInstanceWithI18n extends utils.AdapterInstance {
            I18n: Record<string, string>;
        }
        interface INativeSettings {
            httpsEnabled: boolean;
            domains: string;
            feathersPort: number;
            mbxAccessToken: string;
        }
        interface INative {
            settings: INativeSettings;
            /** The routes as the configuration (JSON-Config) edits them; the adapter computes them into the database */
            routes?: radarTrap.ConfigRoute[];
            /** The areas as the configuration edits them */
            areas?: radarTrap.ConfigArea[];
            /** True once the routes and areas of the database (up to 2.2.x the only place) were taken into the configuration */
            dbMigrated?: boolean;
            /** The style of the maps of the configuration */
            mapStyle?: string;
        }

        type AdapterConfig = INative;
    }
}

declare global {
    namespace radarTrap {
        type FeathersClient = createApplication.Application<any>;

        type GenericStatus = 'idle' | 'loading' | 'success' | 'error';
        interface GenericStatusWithId {
            _id: string | null;
            status: GenericStatus;
        }

        type Exclusions = 'motorway' | 'toll' | 'ferry' | 'unpaved' | 'cash_only_tolls';

        interface Profile {
            active: boolean;
            name: 'driving' | 'driving-traffic' | 'cycling' | 'walking';
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
            /** Where the traps come from (`TRAPS_SOURCE`); missing for what 2.2.x computed from atudo */
            trapsSource?: string;
        }

        type Routes = Route[];

        /** A point the user picked: the address as the geocoder named it and where it is */
        interface Place {
            address: string;
            geometry: GeoJSON.Point;
        }

        type ProfileName = Profile['name'];

        /** A route as the configuration stores it; the adapter makes a `Route` of it */
        interface ConfigRoute {
            _id: string;
            description: string;
            src: Place | null;
            dst: Place | null;
            profile: ProfileName;
            exclusions: Exclusions[];
            maxTrapDistance: number;
            cron: string;
        }

        /** An area as the configuration stores it */
        interface ConfigArea {
            _id: string;
            description: string;
            areaPolygons: AreaPolygons | null;
            cron: string;
        }

        type AtudoPoi = Static<typeof atudoPoiSchema>;
        type Poi = AtudoPoi & {
            trapInfo?: trapInfo;
            // from determineTrapTypes.ts
            type_name?: string;
            type_text?: string;
            type_desc?: string;
            // linetrap?: boolean;
            // from trapsChain.ts
            status?: string;
            // from getTrapsFromDirection.ts
            // distance?: number;
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
            typeDesc?: string | boolean;
            typeText?: string | boolean;
            country?: string | boolean;
            state?: string | boolean;
            zipCode?: string | boolean;
            city?: string | boolean;
            cityDistrict?: string | boolean;
            street?: string | boolean;
        };

        type AreaPolygons = Record<string, Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>>;

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
            polyLinesFeatureCollection?: FeatureCollection<LineString, Poly> | null;
            timestamp?: string;
            /** Where the traps come from (`TRAPS_SOURCE`); missing for what 2.2.x computed from atudo */
            trapsSource?: string;
        }

        type Areas = Area[];
    }
}
