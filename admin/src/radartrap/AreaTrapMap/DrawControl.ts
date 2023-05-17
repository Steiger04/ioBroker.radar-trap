/* eslint-disable @typescript-eslint/no-empty-function */
import MapboxDraw, {
	DrawCreateEvent,
	DrawDeleteEvent,
	DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";

import { forwardRef, useImperativeHandle } from "react";
import type { ControlPosition, MapRef } from "react-map-gl";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
	position?: ControlPosition;

	onCreate?: (evt: DrawUpdateEvent | DrawCreateEvent) => void;
	onUpdate?: (evt: DrawUpdateEvent | DrawCreateEvent) => void;
	onDelete?: (evt: DrawDeleteEvent) => void;
};

const DrawControl = forwardRef((props: DrawControlProps, ref): null => {
	const drawRef = useControl<MapboxDraw>(
		() => new MapboxDraw(props),
		({ map }: { map: MapRef }) => {
			map.on("draw.create", props.onCreate!);
			map.on("draw.update", props.onUpdate!);
			map.on("draw.delete", props.onDelete!);
		},
		({ map }: { map: MapRef }) => {
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

DrawControl.defaultProps = {
	onCreate: () => {},
	onUpdate: () => {},
	onDelete: () => {},
};

export { DrawControl };
