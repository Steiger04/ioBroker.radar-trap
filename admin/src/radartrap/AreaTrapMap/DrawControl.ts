/* eslint-disable @typescript-eslint/no-empty-function */
import MapboxDraw, { DrawCreateEvent, DrawDeleteEvent, DrawUpdateEvent } from "@mapbox/mapbox-gl-draw";
import ExtendMapboxDraw from "./ExtendMapboxDraw";
import { Dispatch, forwardRef, useImperativeHandle } from "react";
import { useControl } from "react-map-gl";

import type { ControlPosition } from "react-map-gl";
import type { MapContextValue } from "react-map-gl/dist/esm/components/map";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
	position?: ControlPosition;

	onCreate?: (evt: DrawUpdateEvent | DrawCreateEvent) => void;
	onUpdate?: (evt: DrawUpdateEvent | DrawCreateEvent) => void;
	onDelete?: (evt: DrawDeleteEvent) => void;

	setToggle?: Dispatch<React.SetStateAction<boolean>>;
};

const DrawControl = forwardRef((props: DrawControlProps, ref): null => {
	const extendMapboxDraw = new ExtendMapboxDraw(props);

	const drawRef = useControl<ExtendMapboxDraw>(
		() => extendMapboxDraw,
		({ map }: MapContextValue) => {
			map.on("draw.create", props.onCreate!);
			map.on("draw.update", props.onUpdate!);
			map.on("draw.delete", props.onDelete!);
		},
		({ map }: MapContextValue) => {
			map.off("draw.create", props.onCreate!);
			map.off("draw.update", props.onUpdate!);
			map.off("draw.delete", props.onDelete!);
		},
		{
			position: props.position,
		},
	);

	useImperativeHandle(ref, () => drawRef, [drawRef]);

	return null;
});

export { DrawControl, DrawControlProps };
