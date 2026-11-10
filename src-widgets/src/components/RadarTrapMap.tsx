/** The map of an area or a route with its traps - the body of the two map widgets */

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import mapboxCss from 'mapbox-gl/dist/mapbox-gl.css?inline';
import Map, { Layer, Popup, ScaleControl, Source, type MapLayerMouseEvent } from 'react-map-gl';
import { featureCollection } from '@turf/helpers';
import type { Feature, FeatureCollection, Point } from 'geojson';
import { Backdrop, CircularProgress, Fab, useMediaQuery, useTheme } from '@mui/material';
import { AutorenewOutlined as AutorenewOutlinedIcon, ZoomOutMap } from '@mui/icons-material';
import type { Connection } from '@iobroker/gui-components';

import { isTrapVisible, type TrapInfo, type VisTraps } from '@radar-trap/traps';

import type { FeathersClient, RadarTrapSettings } from '../feathers';
import { getMapStyle, type MapStyleData } from '../helpers/getMapStyle';
import { useJump } from '../helpers/jumpStore';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import { useMapImages } from '../hooks/useMapImages';
import { usePatchOrCreateSourceStatus } from '../hooks/usePatchOrCreateSourceStatus';
import { useRadarTrapSource } from '../hooks/useRadarTrapSource';
import { useResizeMap } from '../hooks/useResizeMap';
import { TRAFFIC_CLOSURE, TrapInfoPopup } from './TrapInfoPopup';

/** The settings of the map widgets the map reads */
export interface RadarTrapMapData extends MapStyleData {
    styleSelect?: string;
    showCluster?: boolean;
    showPolygon?: boolean;
    fitButton?: boolean;
    refreshButton?: boolean;
    onlyNewTraps?: boolean;
    closedCongestedRoad?: boolean;
    animateClosedCongestedRoad?: boolean;
    visTraps?: VisTraps;
}

export interface RadarTrapMapProps {
    type: 'area' | 'route';
    feathersClient: FeathersClient | null;
    routeOrAreaId: string | null;
    settings: RadarTrapSettings | null;
    editMode: boolean;
    socket: Connection;
    /** `system.adapter.radar-trap.0` */
    instanceId: string;
    data: RadarTrapMapData;
    /** The background colour of the widget, for the spinner */
    backgroundColor?: string;
    width: unknown;
    height: unknown;
}

type PopupInfo = TrapInfo & { longitude: number; latitude: number };

let cssInjected = false;

/**
 * The style sheet of mapbox, once per page. Imported as text and added by hand: a style sheet of a module that vis-2
 * loads through module federation would not reach the page otherwise.
 */
function injectMapboxCss(): void {
    if (cssInjected || document.getElementById('radar-trap-mapbox-css')) {
        cssInjected = true;
        return;
    }
    const style = document.createElement('style');
    style.id = 'radar-trap-mapbox-css';
    style.textContent = mapboxCss;
    document.head.appendChild(style);
    cssInjected = true;
}

export function RadarTrapMap({
    type,
    feathersClient,
    routeOrAreaId,
    settings,
    editMode,
    socket,
    instanceId,
    data,
    backgroundColor,
    width,
    height,
}: RadarTrapMapProps): React.JSX.Element | null {
    injectMapboxCss();

    const { jumpId, coordinates } = useJump();
    const [trapInfo, setTrapInfo] = useState<PopupInfo | null>(null);
    const [cursor, setCursor] = useState('');
    const theme = useTheme();
    const upSmall = useMediaQuery(theme.breakpoints.up('sm'));

    const { mapRef, loadMapImages, status: mapImageStatus } = useMapImages(data.styleSelect);

    const { resizeMap } = useResizeMap({
        _id: routeOrAreaId,
        width,
        height,
        feathersClient,
        map: mapRef,
    });

    const {
        source: { directionsFeatureCollection, trapsFeatureCollection, polyLinesFeatureCollection, areaPolygons },
        sourceStatus,
    } = useRadarTrapSource(routeOrAreaId, feathersClient);

    const patchOrCreateSourceStatus = usePatchOrCreateSourceStatus(routeOrAreaId, feathersClient);

    useAnimationFrame(editMode, mapRef, mapImageStatus, data.closedCongestedRoad, data.animateClosedCongestedRoad);

    const mouseEnterHandler = useCallback(() => setCursor('pointer'), []);
    const mouseLeaveHandler = useCallback(() => setCursor(''), []);

    /** Lets the adapter search the traps of this area or route now */
    const refreshHandler = useCallback(() => {
        if (!routeOrAreaId || !instanceId) {
            return;
        }
        // `system.adapter.radar-trap.0` -> `radar-trap.0`
        const instance = instanceId.split('.').slice(2, 4).join('.');
        void socket.setState(`${instance}.${routeOrAreaId}.cron-job.run`, { val: true, ack: false });
    }, [socket, instanceId, routeOrAreaId]);

    const clickHandler = useCallback(
        (event: MapLayerMouseEvent) => {
            const feature = event.features?.[0];
            if (!feature?.layer) {
                return;
            }

            const properties = feature.properties || {};

            switch (feature.layer.id) {
                case 'traffic-closure': {
                    const address = JSON.parse((properties.address as string) || '{}') as Record<string, string>;
                    setTimeout(
                        () =>
                            setTrapInfo({
                                typeText: TRAFFIC_CLOSURE,
                                country: address.country,
                                zipCode: address.zip,
                                city: address.city,
                                street: address.street,
                                longitude: event.lngLat.lng,
                                latitude: event.lngLat.lat,
                            }),
                        0,
                    );
                    break;
                }

                case 'traps':
                    setTimeout(
                        () =>
                            setTrapInfo({
                                ...(JSON.parse((properties.trapInfo as string) || '{}') as TrapInfo),
                                longitude: event.lngLat.lng,
                                latitude: event.lngLat.lat,
                            }),
                        0,
                    );
                    break;

                case 'cluster-traps': {
                    const clusterId = properties.cluster_id as number;
                    const mapboxMap = mapRef.current?.getMap();
                    const source = mapboxMap?.getSource(feature.source as string) as
                        | mapboxgl.GeoJSONSource
                        | undefined;
                    source?.getClusterExpansionZoom(clusterId, (err, zoom) => {
                        if (err) {
                            return;
                        }
                        mapRef.current?.easeTo({
                            center: (feature.geometry as Point).coordinates as [number, number],
                            zoom,
                            duration: 750,
                        });
                    });
                    break;
                }

                default:
                    break;
            }
        },
        [mapRef],
    );

    // a click on a trap in the info widget
    useEffect(() => {
        if (!mapRef.current || !jumpId || !routeOrAreaId || coordinates.length < 2) {
            return;
        }

        if (routeOrAreaId === jumpId) {
            mapRef.current.jumpTo({
                center: coordinates as [number, number],
                zoom: 15,
            });
        }
    }, [mapRef, jumpId, coordinates, routeOrAreaId]);

    const filteredTraps = useMemo<FeatureCollection>(() => {
        if (sourceStatus !== 'success') {
            return featureCollection([]);
        }
        return featureCollection(
            (trapsFeatureCollection.features as Feature<Point>[]).filter(trap =>
                isTrapVisible(
                    trap.properties
                        ? {
                              typeDesc: trap.properties.type_desc,
                              typeText: trap.properties.type_text,
                              status: trap.properties.status,
                          }
                        : null,
                    data.visTraps,
                    data.onlyNewTraps,
                ),
            ),
        );
    }, [trapsFeatureCollection, sourceStatus, data.visTraps, data.onlyNewTraps]);

    if (!settings) {
        return null;
    }

    const ready = mapImageStatus === 'success' && sourceStatus === 'success';

    return (
        <>
            <Backdrop
                open={patchOrCreateSourceStatus.status === 'loading'}
                sx={{
                    position: 'absolute',
                    zIndex: muiTheme => muiTheme.zIndex.drawer + 1,
                }}
            >
                <CircularProgress
                    size={80}
                    sx={{ color: backgroundColor || 'white' }}
                />
            </Backdrop>
            <Map
                mapboxAccessToken={settings.mbxAccessToken}
                mapLib={mapboxgl}
                ref={loadMapImages}
                reuseMaps
                attributionControl={false}
                logoPosition="bottom-right"
                interactiveLayerIds={['cluster-traps', 'traps', 'traffic-closure']}
                cursor={cursor}
                onClick={clickHandler}
                onMouseEnter={mouseEnterHandler}
                onMouseLeave={mouseLeaveHandler}
            >
                {data.refreshButton && routeOrAreaId ? (
                    <Fab
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            opacity: 0.7,
                            m: 1,
                        }}
                        size={upSmall ? 'medium' : 'small'}
                        color="primary"
                        onClick={refreshHandler}
                        disabled={editMode}
                    >
                        <AutorenewOutlinedIcon />
                    </Fab>
                ) : null}

                {data.fitButton ? (
                    <Fab
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            opacity: 0.7,
                            m: 1,
                        }}
                        size={upSmall ? 'medium' : 'small'}
                        color="primary"
                        onClick={() => resizeMap(true)}
                    >
                        <ZoomOutMap />
                    </Fab>
                ) : null}

                {trapInfo ? (
                    <Popup
                        maxWidth="auto"
                        longitude={trapInfo.longitude}
                        latitude={trapInfo.latitude}
                        closeButton={false}
                        onClose={() => setTrapInfo(null)}
                    >
                        <TrapInfoPopup info={trapInfo} />
                    </Popup>
                ) : null}

                <ScaleControl position="bottom-left" />

                {type === 'area' && ready && data.showPolygon ? (
                    <Source
                        id="areaPolygons"
                        type="geojson"
                        data={
                            areaPolygons
                                ? (featureCollection(Object.values(areaPolygons)).features[0] as Feature)
                                : featureCollection([])
                        }
                    >
                        <Layer {...getMapStyle('areaSurface', data)} />
                        <Layer {...getMapStyle('areaSurfaceBorder', data)} />
                    </Source>
                ) : null}

                {type === 'route' && ready ? (
                    <Source
                        id="directions"
                        type="geojson"
                        data={directionsFeatureCollection}
                    >
                        <Layer {...getMapStyle('route', data)} />
                    </Source>
                ) : null}

                {ready && data.closedCongestedRoad ? (
                    <Source
                        id="polys"
                        type="geojson"
                        data={polyLinesFeatureCollection}
                    >
                        <Layer {...getMapStyle('lineBackground', data)} />
                        <Layer {...getMapStyle('lineDashed', data)} />
                        <Layer {...getMapStyle('trafficClosure', data)} />
                    </Source>
                ) : null}

                {ready && !data.showCluster ? (
                    <Source
                        id="traps"
                        type="geojson"
                        data={filteredTraps}
                    >
                        <Layer {...getMapStyle('traps', data)} />
                    </Source>
                ) : null}

                {ready && data.showCluster ? (
                    <Source
                        id="traps"
                        type="geojson"
                        data={filteredTraps}
                        cluster
                    >
                        <Layer {...getMapStyle('traps', data)} />
                        <Layer {...getMapStyle('clusterTraps', data)} />
                        <Layer {...getMapStyle('clusterTrapsCount', data)} />
                    </Source>
                ) : null}
            </Map>
        </>
    );
}
