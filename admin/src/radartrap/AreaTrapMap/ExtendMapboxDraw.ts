import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

type ButtonOption = {
	classes?: string[];
	on: string;
	action: () => void;
	elButton?: HTMLButtonElement;
	content?: Element | string;
};

class ExtendMapboxDraw extends MapboxDraw implements mapboxgl.IControl {
	buttons: ButtonOption[];
	elContainer?: HTMLElement;
	onAddOrig: (map: mapboxgl.Map) => HTMLElement;
	onRemoveOrig: (map: mapboxgl.Map) => void;

	constructor({ buttons, ...props }: { buttons: ButtonOption[] } & ConstructorParameters<typeof MapboxDraw>[0]) {
		super(props);

		this.buttons = buttons;

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
		opt.elButton = elButton;
	}

	removeButton(opt: ButtonOption): void {
		opt.elButton?.removeEventListener(opt.on, opt.action);
		opt.elButton?.remove();
	}
}

export default ExtendMapboxDraw;
