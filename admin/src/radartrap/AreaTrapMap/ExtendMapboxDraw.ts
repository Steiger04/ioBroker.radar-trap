import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CircleMode, DragCircleMode, DirectMode, SimpleSelectMode } = require("maplibre-gl-draw-circle");

type ButtonOption = {
	classes?: string[];
	on: string;
	action: () => void;
	elButton?: HTMLButtonElement;
	buttonStyle: string;
	content?: string | Element;
};

class ExtendMapboxDraw extends MapboxDraw implements mapboxgl.IControl {
	buttons: ButtonOption[];
	elContainer?: HTMLElement;
	onAddOrig: (map: mapboxgl.Map) => HTMLElement;
	onRemoveOrig: (map: mapboxgl.Map) => void;

	constructor(props: ConstructorParameters<typeof MapboxDraw>[0]) {
		super({
			...props,
			modes: {
				...MapboxDraw.modes,
				draw_circle: CircleMode,
				drag_circle: DragCircleMode,
				direct_select: DirectMode,
				simple_select: SimpleSelectMode,
			},
		} as ConstructorParameters<typeof MapboxDraw>[0]);

		this.buttons = [
			{
				on: "click",
				action: () => {
					this.changeMode("draw_circle", { initialRadiusInKm: 5.0 });
				},
				classes: ["mapbox-gl-draw_ctrl-draw-btn"],
				buttonStyle: "background-image: url(./assets/circle.svg);background-size: 15px 15px;",
			},
		];

		this.onAddOrig = this.onAdd;

		this.onAdd = (map: mapboxgl.Map): HTMLElement => {
			this.elContainer = this.onAddOrig(map);

			this.buttons.forEach((b) => {
				this.addButton(b);
			});

			return this.elContainer;
		};

		this.onRemoveOrig = this.onRemove;
		this.onRemove = (map: mapboxgl.Map): void => {
			this.buttons.forEach((b) => {
				this.removeButton(b);
			});

			this.onRemoveOrig(map);
		};
	}

	addButton(opt: ButtonOption): void {
		const elButton = document.createElement("button");

		elButton.className = "mapbox-gl-draw_ctrl-draw-btn";
		elButton.style.cssText = opt.buttonStyle;

		if (opt.classes instanceof Array) {
			opt.classes.forEach((c) => {
				elButton.classList.add(c);
			});
		}

		if (opt.content) {
			if (opt.content instanceof Element) {
				elButton.appendChild(opt.content);
			} else {
				elButton.innerHTML = opt.content;
			}
		}

		elButton.addEventListener(opt.on, opt.action);
		this.elContainer?.prepend(elButton);
		// opt.elButton = elButton;
	}

	removeButton(opt: ButtonOption): void {
		opt.elButton?.removeEventListener(opt.on, opt.action);
		opt.elButton?.remove();
	}
}

export default ExtendMapboxDraw;
