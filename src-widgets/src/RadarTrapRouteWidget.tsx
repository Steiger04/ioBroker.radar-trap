/** The map of a route with its traps */

import type React from 'react';
import { ThemeProvider } from '@mui/material';
import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import { Message } from './components/Message';
import { LazyRadarTrapMap } from './components/LazyRadarTrapMap';
import type { RadarTrapMapData } from './components/RadarTrapMap';
import Generic, { type GenericRxData } from './Generic';
import { t } from './i18n';
import { COMMON_FIELDS, MAP_FIELDS, STYLE_FIELDS, SYMBOL_FIELDS, sourceField, trapGroup } from './widgetFields';

interface RouteRxData extends GenericRxData, RadarTrapMapData {
    routeId?: string;
}

export default class RadarTrapRouteWidget extends Generic<RouteRxData> {
    public static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplRadarTrapRouteWidget',
            visSet: 'radar-trap',
            visName: 'route',
            visWidgetLabel: 'route',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        COMMON_FIELDS[0],
                        ...MAP_FIELDS,
                        COMMON_FIELDS[1],
                        sourceField('routeId', 'route_id', 'route'),
                        ...STYLE_FIELDS,
                        {
                            name: 'routeColor',
                            label: 'route_color',
                            type: 'color',
                            default: '#9c27b0',
                        },
                        {
                            name: 'routeWidth',
                            label: 'route_width',
                            type: 'slider',
                            default: 5,
                            min: 1,
                            max: 20,
                            step: 0.5,
                        },
                        ...SYMBOL_FIELDS,
                    ],
                },
                trapGroup(true),
            ],
            visDefaultStyle: {
                width: '100%',
                height: 200,
                position: 'relative',
            },
            visPrev: 'widgets/radar-trap/img/prev-route-widget.png',
        };
    }

    public getWidgetInfo(): RxWidgetInfo {
        return RadarTrapRouteWidget.getWidgetInfo();
    }

    public renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const content = this.state.radarTrapEnabled ? (
            <ThemeProvider theme={this.props.context.theme}>
                <LazyRadarTrapMap
                    type="route"
                    feathersClient={this.state.feathersClient}
                    routeOrAreaId={this.state.rxData.routeId || null}
                    settings={this.state.settings}
                    editMode={this.props.editMode}
                    socket={this.props.context.socket}
                    instanceId={this.state.instanceId}
                    data={this.state.rxData}
                    backgroundColor={(this.state.rxStyle as Record<string, string | undefined> | undefined)?.['background-color']}
                    width={this.state.rxStyle?.width}
                    height={this.state.rxStyle?.height}
                />
            </ThemeProvider>
        ) : (
            <Message message={t('instance_not_started')} />
        );

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, this.renderTitle(true), {
            height: '100%',
            padding: 10,
            boxSizing: 'border-box',
        });
    }
}
