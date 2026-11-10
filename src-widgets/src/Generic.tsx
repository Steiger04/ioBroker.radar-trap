/**
 * What the three widgets share: the settings of the radar-trap instance, the client of its feathers server, and
 * whether the instance is enabled.
 *
 * vis-2 provides the base class at runtime (`window.visRxWidget`), so the class is created when vis-2 loads this
 * module - after it has set the global.
 */

import type React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import type { Component } from 'react';
import type { VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import { PREFIX } from '@radar-trap/traps';

import { getFeathersClient, type FeathersClient, type RadarTrapSettings } from './feathers';

/** The settings all three widgets have */
export interface GenericRxData {
    /** Without the card around the content */
    noCard?: boolean;
    /** A state whose value is shown as the title */
    oid?: string;
}

export interface GenericState extends VisRxWidgetState {
    settings: RadarTrapSettings | null;
    feathersClient: FeathersClient | null;
    radarTrapEnabled: boolean;
    /** `system.adapter.radar-trap.0` */
    instanceId: string;
}

type ObjectHandler = (id: string, obj: ioBroker.Object | null | undefined) => void;

export default class Generic<TRxData extends GenericRxData & Record<string, any>> extends (
    window.visRxWidget as typeof VisRxWidget
)<TRxData, GenericState> {
    /** The handler of the subscription to the instance object, to unsubscribe exactly it */
    private instanceHandler: ObjectHandler | null = null;

    private unmounted = false;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {
            ...this.state,
            settings: null,
            feathersClient: null,
            radarTrapEnabled: false,
            instanceId: '',
        };
    }

    public static getI18nPrefix(): string {
        return PREFIX;
    }

    public componentDidMount(): void {
        super.componentDidMount();
        void this.readInstance();
    }

    public componentWillUnmount(): void {
        this.unmounted = true;
        super.componentWillUnmount();
        if (this.instanceHandler && this.state.instanceId) {
            void this.props.context.socket.unsubscribeObject(this.state.instanceId, this.instanceHandler);
            this.instanceHandler = null;
        }
    }

    /** Reads the first instance of radar-trap and follows whether it is enabled */
    private async readInstance(): Promise<void> {
        const socket = this.props.context.socket;
        try {
            const instances = await socket.getAdapterInstances('radar-trap');
            const instance = instances?.[0];
            if (!instance || this.unmounted) {
                return;
            }
            const settings = (instance.native?.settings as RadarTrapSettings | undefined) || null;
            const feathersClient = settings?.feathersPort ? getFeathersClient(settings) : null;
            const enabled = !!instance.common?.enabled;

            this.setState({ settings, feathersClient, radarTrapEnabled: enabled, instanceId: instance._id });
            this.connectFeathers(feathersClient, enabled);

            this.instanceHandler = (_id, obj): void => {
                const nowEnabled = !!obj?.common?.enabled;
                if (nowEnabled !== this.state.radarTrapEnabled) {
                    this.setState({ radarTrapEnabled: nowEnabled });
                    this.connectFeathers(this.state.feathersClient, nowEnabled);
                }
            };
            await socket.subscribeObject(instance._id, this.instanceHandler);
        } catch (error) {
            console.log(`radar-trap: cannot read the instance: ${String(error)}`);
        }
    }

    /**
     * A stopped instance has no feathers server: the client would try to reconnect forever
     *
     * @param client the feathers client
     * @param enabled whether the instance is enabled
     */
    private connectFeathers(client: FeathersClient | null, enabled: boolean): void {
        if (!client) {
            return;
        }
        if (enabled) {
            client.io.connect();
        } else {
            client.io.disconnect();
        }
    }

    /** The title: the value of the state `oid`, or the text of `oid` itself if it is no state */
    protected getTitle(): string | null {
        const oid = this.state.rxData.oid;
        if (!oid) {
            return null;
        }
        const value = this.state.values[`${oid}.val`] as ioBroker.StateValue | undefined;
        if (value === undefined || value === null) {
            return oid;
        }
        return String(value);
    }

    /**
     * The title above the content, in the font of the widget
     *
     * @param center whether the title is centered when the style says nothing
     */
    protected renderTitle(center: boolean): React.JSX.Element | null {
        const title = this.state.radarTrapEnabled ? this.getTitle() : null;
        if (!title) {
            return null;
        }
        const style = (this.state.rxStyle || {}) as Record<string, string | undefined>;
        return (
            <Box sx={{ width: '100%', textAlign: (style['text-align'] || (center ? 'center' : 'left')) as 'left' }}>
                <Typography
                    variant="h6"
                    component="h5"
                    sx={{
                        pb: 1,
                        fontFamily: style['font-family'],
                        fontWeight: style['font-weight'] || 'bold',
                        fontSize: style['font-size'] || 'large',
                        lineHeight: style['line-height'],
                        letterSpacing: style['letter-spacing'],
                        wordSpacing: style['word-spacing'],
                    }}
                >
                    {title}
                </Typography>
            </Box>
        );
    }

    public wrapContent(
        content: React.JSX.Element | React.JSX.Element[],
        addToHeader?: React.JSX.Element | null | React.JSX.Element[],
        cardContentStyle?: React.CSSProperties,
        headerStyle?: React.CSSProperties,
        onCardClick?: (e?: React.MouseEvent<HTMLDivElement>) => void,
    ): React.JSX.Element | React.JSX.Element[] | null {
        return super.wrapContent(content, addToHeader, cardContentStyle, headerStyle, onCardClick, {
            Card: Card as unknown as Component<any>,
            CardContent: CardContent as unknown as Component<any>,
        });
    }
}
