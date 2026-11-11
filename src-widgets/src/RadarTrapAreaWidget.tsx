/** The map of an area with its traps */

import type React from 'react';
import { ThemeProvider } from '@mui/material';
import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import { Message } from './components/Message';
import { LazyRadarTrapMap } from './components/LazyRadarTrapMap';
import type { RadarTrapMapData } from './components/RadarTrapMap';
import Generic, { type GenericRxData } from './Generic';
import { t } from './i18n';
import { COMMON_FIELDS, MAP_FIELDS, STYLE_FIELDS, SYMBOL_FIELDS, sourceField, trapGroup } from './widgetFields';

interface AreaRxData extends GenericRxData, RadarTrapMapData {
    areaId?: string;
}

export default class RadarTrapAreaWidget extends Generic<AreaRxData> {
    public static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplRadarTrapAreaWidget',
            visSet: 'radar-trap',
            visSetLabel: 'set_label',
            visSetColor: '#4169E1',
            visName: 'area',
            visWidgetLabel: 'area',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        COMMON_FIELDS[0],
                        ...MAP_FIELDS,
                        COMMON_FIELDS[1],
                        sourceField('areaId', 'area_id', 'area'),
                        ...STYLE_FIELDS,
                        {
                            name: 'showPolygon',
                            label: 'show_polygon',
                            type: 'checkbox',
                            default: true,
                        },
                        {
                            name: 'polygonBorder',
                            label: 'polygon_border',
                            type: 'slider',
                            default: 4,
                            min: 0,
                            max: 20,
                            step: 0.5,
                        },
                        {
                            name: 'polygonColor',
                            label: 'polygon_color',
                            type: 'color',
                            default: 'rgba(10,138,232,0.15)',
                        },
                        {
                            name: 'polygonBorderColor',
                            label: 'polygon_border_color',
                            type: 'color',
                            default: 'rgba(61,156,226,0.6)',
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
            visPrev: 'widgets/radar-trap/img/prev-area-widget.png',
        };
    }

    public getWidgetInfo(): RxWidgetInfo {
        return RadarTrapAreaWidget.getWidgetInfo();
    }

    public renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const content = this.state.radarTrapEnabled ? (
            <ThemeProvider theme={this.props.context.theme}>
                <LazyRadarTrapMap
                    type="area"
                    feathersClient={this.state.feathersClient}
                    routeOrAreaId={this.state.rxData.areaId || null}
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
            width: '100%',
            padding: 10,
            boxSizing: 'border-box',
        });
    }
}
