import feathers from "@feathersjs/client";
import socketio from "@feathersjs/socketio-client";
import GenericApp from "@iobroker/adapter-react-v5/GenericApp";
import Geocoding, { GeocodeService } from "@mapbox/mapbox-sdk/services/geocoding";
import { createContext, ReactElement, useContext } from "react";
import io from "socket.io-client";
import { IbrContainer, IbrFooter, IbrHeader } from "./ibr";
import { cronCounter$ } from "./lib";
import { radarTrapEnabled$ } from "./lib/helpers/radarTrapEnabledStream";
import { RadarTrapTabs } from "./radartrap";

import type { GenericAppProps, GenericAppSettings } from "@iobroker/adapter-react-v5/types";
import type { AdminConnection } from "@iobroker/adapter-react-v5";

const AppContext = createContext<ioBroker.IAppContext>({} as ioBroker.IAppContext);

const connectionReady = (
	that: App,
	savedNative: ioBroker.INative,
	socket: AdminConnection,
	instanceId: string,
): void => {
	// const savedNative = that.savedNative as ioBroker.INative;
	// const savedNative = { ...this.state.native } as ioBroker.INative;
	const port = savedNative.settings.feathersPort;
	const activeUrl = new URL(document.URL);
	const url = `${activeUrl.protocol}//${activeUrl.hostname}:${port}`;
	// const url = `https://${activeUrl.hostname}:${port}`;

	// that.feathersClient = feathers() as radarTrap.FeathersClient;
	if (that.feathersClient.io !== undefined) {
		that.feathersClient.io.disconnect();
		that.feathersClient = feathers() as radarTrap.FeathersClient;
	} else {
		socket.subscribeState("*.timer", false, (id, state) => {
			const routeId = id.split(".")[2]; //

			if (state === null) {
				socket.unsubscribeState(id, (id, obj) => console.log(id, obj));
			} else {
				cronCounter$.next({ [routeId]: state!.val });
			}
		});

		socket.subscribeObject(instanceId, (id, obj) => {
			radarTrapEnabled$.next(obj!.common.enabled);
		});
	}

	const _socket = io(url, {
		// transports: ["websocket"],
		forceNew: true,
	});

	that.feathersClient.configure(
		socketio(_socket, {
			timeout: 600_000,
		}),
	);

	if (savedNative.settings.mbxAccessToken) {
		that.geocodingService = Geocoding({
			accessToken: savedNative.settings.mbxAccessToken,
		});
	}
};

class App extends GenericApp {
	public feathersClient = feathers() as radarTrap.FeathersClient;
	public geocodingService: GeocodeService | null = null;

	public constructor(props: GenericAppProps) {
		const extendedProps: GenericAppSettings = {
			...props,
			encryptedFields: [],
			translations: {
				en: require("./i18n/en.json"),
				de: require("./i18n/de.json"),
				ru: require("./i18n/ru.json"),
				pt: require("./i18n/pt.json"),
				nl: require("./i18n/nl.json"),
				fr: require("./i18n/fr.json"),
				it: require("./i18n/it.json"),
				es: require("./i18n/es.json"),
				pl: require("./i18n/pl.json"),
				"zh-cn": require("./i18n/zh-cn.json"),
			},
		};

		super(props, extendedProps);
	}

	public onConnectionReady(): void {
		// console.log("onConnectionReady", this);
		connectionReady(this, this.savedNative as ioBroker.INative, this.socket, this.instanceId);

		/* console.log("onConnectionReady", this);

		const savedNative = this.savedNative as ioBroker.INative;
		// const savedNative = { ...this.state.native } as ioBroker.INative;
		const port = savedNative.settings.feathersPort;
		const activeUrl = new URL(document.URL);
		const url = `${activeUrl.protocol}//${activeUrl.hostname}:${port}`;
		// const url = `https://${activeUrl.hostname}:${port}`;

		const socket = io(url, {
			// transports: ["websocket"],
			forceNew: true,
		});

		this.feathersClient.configure(
			socketio(socket, {
				timeout: 600_000,
			}),
		);

		console.log("this.feathersClient", this.feathersClient);

		if (savedNative.settings.mbxAccessToken) {
			this.geocodingService = Geocoding({
				accessToken: savedNative.settings.mbxAccessToken,
			});
		}

		this.socket.subscribeState("*.timer", false, (id, state) => {
			const routeId = id.split(".")[2]; //

			if (state === null) {
				this.socket.unsubscribeState(id, (id, obj) => console.log(id, obj));
			} else {
				cronCounter$.next({ [routeId]: state!.val });
			}
		});

		this.socket.subscribeObject(this.instanceId, (id, obj) => {
			radarTrapEnabled$.next(obj!.common.enabled);
		}); */
	}

	public componentWillUnmount(): void {
		this.socket.unsubscribeState("*.timer", (id, obj) => console.log(id, obj));

		this.socket.unsubscribeObject(this.instanceId, (id, obj) => console.log(id, obj));
	}

	public render(): ReactElement {
		if (!this.state.loaded) {
			return super.render();
		}

		const appContext: ioBroker.IAppContext = {
			that: this,
			savedNative: this.savedNative as ioBroker.INative,
			// savedNative: { ...this.state.native } as ioBroker.INative,
			updateNativeValue: this.updateNativeValue.bind(this),
			native: this.state.native,
			feathers: this.feathersClient,
			// language: this.socket.objects["system.config"].common.language,
			language: this.socket.systemLang,
			socket: this.socket,
			adapterName: this.adapterName,
			instance: this.instance,
			instanceId: this.instanceId,
			common: this.common,
		};

		return (
			<AppContext.Provider value={appContext}>
				<IbrContainer id="ibr-container" component="main" maxWidth={false}>
					<IbrHeader />
					<RadarTrapTabs />
					<IbrFooter />
				</IbrContainer>
			</AppContext.Provider>
		);
	}
}

const useAppData = (): ioBroker.IAppContext => useContext(AppContext);

export { App, useAppData, connectionReady };
