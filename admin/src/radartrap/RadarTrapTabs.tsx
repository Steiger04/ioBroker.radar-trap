import I18n from "@iobroker/adapter-react/i18n";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import RouteIcon from "@mui/icons-material/Route";
import SettingsIcon from "@mui/icons-material/Settings";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/system";
import {
	Link,
	matchPath,
	MemoryRouter,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { useAppData } from "../App";
import { TabCard } from "../components";
import { useAccordionDisabled, useRadarTrapEnabled } from "../lib";
import { RadarTrapAreas } from "./RadarTrapAreas/RadarTrapAreas";
import { RadarTrapMaps } from "./RadarTrapMaps/RadarTrapMaps";
import { RadarTrapRoutes } from "./RadarTrapRoutes/RadarTrapRoutes";
import { RadarTrapSettings } from "./RadarTrapSettings/RadarTrapSettings";

import { FC, ReactElement, useEffect } from "react";
import { RadarTrapActiveInfo } from "./RadarTrapActiveInfo";

function useRouteMatch(patterns: readonly string[]) {
	const { pathname } = useLocation();

	// console.log("pathname", pathname);

	for (let i = 0; i < patterns.length; i += 1) {
		const pattern = patterns[i];
		const possibleMatch = matchPath(pattern, pathname);
		if (possibleMatch !== null) {
			// console.log("possibleMatch", possibleMatch);
			return possibleMatch;
		}
	}

	return null;
}

const Router: FC = ({ children }): ReactElement => {
	return (
		<MemoryRouter initialEntries={["/trap-settings"]}>
			{children}
		</MemoryRouter>
	);
};

const TrapTabs: FC = (): ReactElement => {
	const {
		savedNative: {
			settings: { mbxAccessToken },
		},
	} = useAppData();

	const { disabled: accordionDisabled } = useAccordionDisabled();

	const showTabIcons = useMediaQuery((theme: Theme) =>
		theme.breakpoints.down("md"),
	);
	const routeMatch = useRouteMatch([
		"/trap-areas",
		"/trap-maps",
		"/trap-routes",
		"/trap-settings",
	]);
	const currentTab = routeMatch?.pattern?.path;

	const navigate = useNavigate();
	// console.log("navigate", navigate);

	useEffect(() => {
		if (mbxAccessToken !== "") navigate("/trap-maps", { replace: true });
	}, [mbxAccessToken]);

	return (
		<Tabs variant="fullWidth" value={currentTab}>
			<Tab
				disabled={accordionDisabled || mbxAccessToken === ""}
				icon={showTabIcons ? <MapIcon /> : ""}
				label={!showTabIcons ? I18n.t("maps") : null}
				value="/trap-maps"
				to="/trap-maps"
				component={Link}
			/>
			<Tab
				disabled={mbxAccessToken === ""}
				icon={showTabIcons ? <RouteIcon /> : ""}
				label={!showTabIcons ? I18n.t("routes") : null}
				value="/trap-routes"
				to="/trap-routes"
				component={Link}
			/>
			<Tab
				disabled={mbxAccessToken === ""}
				icon={showTabIcons ? <PublicIcon /> : ""}
				label={!showTabIcons ? I18n.t("areas") : null}
				value="/trap-areas"
				to="/trap-areas"
				component={Link}
			/>
			<Tab
				disabled={accordionDisabled}
				icon={showTabIcons ? <SettingsIcon /> : ""}
				label={!showTabIcons ? I18n.t("settings") : null}
				value="/trap-settings"
				to="/trap-settings"
				component={Link}
			/>
		</Tabs>
	);
};

const RadarTrapTabs: FC = (): ReactElement => {
	const { enabled: radarTrapEnabled } = useRadarTrapEnabled();

	return (
		<>
			<RadarTrapActiveInfo />

			{/* {true && ( */}
			{(process.env.NODE_ENV === "development" ||
				(process.env.NODE_ENV === "production" &&
					radarTrapEnabled)) && (
				<Router>
					<TrapTabs />

					<Routes>
						<Route
							path="/trap-maps"
							element={
								<TabCard
									id="radar-trap-tabs-maps"
									sx={{
										px: { xs: 0 },
										py: { xs: 1 },
										p: { sm: 1 },
									}}
								>
									<RadarTrapMaps />
								</TabCard>
							}
						/>
						<Route
							path="/trap-routes"
							element={
								<TabCard
									id="radar-trap-tabs-route"
									sx={{
										px: { xs: 0 },
										py: { xs: 2 },
										p: { sm: 1 },
									}}
								>
									<RadarTrapRoutes />
								</TabCard>
							}
						/>
						<Route
							path="/trap-areas"
							element={
								<TabCard
									id="radar-trap-tabs-area"
									sx={{
										px: { xs: 0 },
										py: { xs: 2 },
										p: { sm: 1 },
									}}
								>
									<RadarTrapAreas />
								</TabCard>
							}
						/>
						<Route
							path="/trap-settings"
							element={
								<TabCard
									id="radar-trap-tabs-settings"
									sx={{
										px: { xs: 0 },
										py: { xs: 2 },
										p: { sm: 1 },
									}}
								>
									<RadarTrapSettings />
								</TabCard>
							}
						/>
					</Routes>
				</Router>
			)}
		</>
	);
};

export { RadarTrapTabs };
