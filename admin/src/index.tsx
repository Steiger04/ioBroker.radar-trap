import Utils from "@iobroker/adapter-react-v5/Components/Utils";
import theme from "@iobroker/adapter-react-v5/Theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider, createTheme, ThemeOptions } from "@mui/material/styles";
import { createRoot } from "react-dom/client";
import { App } from "./App";

let themeName = Utils.getThemeName();
const _theme = createTheme(theme(themeName) as ThemeOptions);

const container = document.getElementById("root");
const root = createRoot(container as Element);

const build = (): void => {
	root.render(
		<StyledEngineProvider injectFirst>
			<ThemeProvider theme={_theme}>
				<CssBaseline />
				<App
					adapterName="radar-trap"
					onThemeChange={(_theme): void => {
						themeName = _theme;
						build();
					}}
				/>
			</ThemeProvider>
		</StyledEngineProvider>,
	);
};

build();
