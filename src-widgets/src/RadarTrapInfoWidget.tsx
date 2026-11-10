/** The traps of an area or a route as a list; a click on one moves the map widget of the same source to it */

import type React from 'react';
import { ThemeProvider } from '@mui/material';
import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import { Message } from './components/Message';
import { RadarTrapInfoList, type RadarTrapInfoListData } from './components/RadarTrapInfoList';
import Generic, { type GenericRxData } from './Generic';
import { t } from './i18n';
import { COMMON_FIELDS, sourceField, trapGroup } from './widgetFields';

interface InfoRxData extends GenericRxData, RadarTrapInfoListData {
    routeOrAreaId?: string;
}

export default class RadarTrapInfoWidget extends Generic<InfoRxData> {
    public static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplRadarTrapsInfoWidget',
            visSet: 'radar-trap',
            visName: 'info',
            visWidgetLabel: 'info',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        ...COMMON_FIELDS,
                        sourceField('routeOrAreaId', 'route_or_area_id', 'all'),
                        {
                            name: 'nothingInfo',
                            label: 'nothing_info',
                            type: 'checkbox',
                            default: false,
                        },
                        {
                            name: 'symbolColor',
                            label: 'symbol_color',
                            type: 'color',
                            default: 'rgba(100,100,100,0.8)',
                        },
                        {
                            name: 'groupHeadline',
                            label: 'group_headline',
                            type: 'checkbox',
                            default: true,
                        },
                        {
                            name: 'trapHeadline',
                            label: 'trap_headline',
                            type: 'checkbox',
                            default: true,
                        },
                    ],
                },
                trapGroup(false),
            ],
            visDefaultStyle: {
                width: '100%',
                height: 200,
                position: 'relative',
            },
            visPrev: 'widgets/radar-trap/img/prev-info-widget.png',
        };
    }

    public getWidgetInfo(): RxWidgetInfo {
        return RadarTrapInfoWidget.getWidgetInfo();
    }

    public renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element | React.JSX.Element[] | null {
        super.renderWidgetBody(props);

        const content = this.state.radarTrapEnabled ? (
            <ThemeProvider theme={this.props.context.theme}>
                <RadarTrapInfoList
                    feathersClient={this.state.feathersClient}
                    routeOrAreaId={this.state.rxData.routeOrAreaId || null}
                    data={this.state.rxData}
                    style={(this.state.rxStyle || {}) as Record<string, string | undefined>}
                />
            </ThemeProvider>
        ) : (
            <Message message={t('instance_not_started')} />
        );

        if (this.state.rxData.noCard || props.widget.usedInWidget) {
            return content;
        }

        return this.wrapContent(content, this.renderTitle(false), {
            height: '100%',
            width: '100%',
            padding: 10,
            boxSizing: 'border-box',
        });
    }
}
