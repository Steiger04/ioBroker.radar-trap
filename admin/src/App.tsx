import feathers from "@feathersjs/client";
import socketio from "@feathersjs/socketio-client";
import GenericApp from "@iobroker/adapter-react/GenericApp";
import Geocoding, {
	GeocodeService,
} from "@mapbox/mapbox-sdk/services/geocoding";
import { Provider } from "figbird";
import { createContext, ReactElement, useContext } from "react";
import io from "socket.io-client";
import { IbrContainer, IbrFooter, IbrHeader } from "./ibr";
import { cronCounter$ } from "./lib";
import { radarTrapEnabled$ } from "./lib/helpers/radarTrapEnabledStream";
import { RadarTrapTabs } from "./radartrap";

import type {
	GenericAppProps,
	GenericAppSettings,
} from "@iobroker/adapter-react/types";

const AppContext = createContext<ioBroker.IAppContext>(undefined!);

class App extends GenericApp {
	protected feathersClient = feathers() as radarTrap.FeathersClient;
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
		const savedNative = this.savedNative as ioBroker.INative;
		const port = savedNative.settings.feathersPort;
		const activeUrl = new URL(document.URL);
		const url = `${activeUrl.protocol}//${activeUrl.hostname}:${port}`;

		const socket = io(url, {
			// transports: ["websocket"],
			forceNew: true,
		});

		this.feathersClient.configure(
			socketio(socket, {
				timeout: 600_000,
			}),
		);

		if (savedNative.settings.mbxAccessToken) {
			this.geocodingService = Geocoding({
				accessToken: savedNative.settings.mbxAccessToken,
			});
		}

		this.socket.subscribeState("*.timer", false, (id, state) => {
			const routeId = id.split(".")[2]; //

			if (state === null) {
				this.socket.unsubscribeState(id, (id, obj) =>
					console.log(id, obj),
				);
			} else {
				cronCounter$.next({ [routeId]: state!.val });
			}
		});

		this.socket.subscribeObject(this.instanceId, (id, obj) => {
			// console.log("subscribeObject", id, obj);

			radarTrapEnabled$.next(obj?.common.enabled);
		});
	}

	public componentWillUnmount(): void {
		this.socket.unsubscribeState("*.timer", (id, obj) =>
			console.log(id, obj),
		);

		this.socket.unsubscribeObject(this.instanceId, (id, obj) =>
			console.log(id, obj),
		);
	}

	public render(): ReactElement {
		if (!this.state.loaded) {
			return super.render();
		}

		const appContext: ioBroker.IAppContext = {
			that: this,
			savedNative: this.savedNative as ioBroker.INative,
			updateNativeValue: this.updateNativeValue.bind(this),
			native: this.state.native,
			feathers: this.feathersClient,
			language: this.socket.objects["system.config"].common.language,
		};

		return (
			<Provider feathers={this.feathersClient}>
				<AppContext.Provider value={appContext}>
					<IbrContainer
						id="ibr-container"
						component="main"
						maxWidth={false}
					>
						<IbrHeader />

						<RadarTrapTabs />

						<IbrFooter />
					</IbrContainer>
				</AppContext.Provider>
			</Provider>
		);
	}
}

const useAppData = (): ioBroker.IAppContext => useContext(AppContext);

export { App, useAppData };
