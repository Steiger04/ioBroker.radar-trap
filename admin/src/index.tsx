import Utils from "@iobroker/adapter-react/Components/Utils";
import theme from "@iobroker/adapter-react/Theme";
import CssBaseline from "@mui/material/CssBaseline";
import { adaptV4Theme, DeprecatedThemeOptions, ThemeProvider } from "@mui/material/styles";
import ReactDOM from "react-dom";
import { App } from "./App";

let themeName = Utils.getThemeName();
const themeV4 = theme(themeName);

const build = (): void => {
	ReactDOM.render(
		<ThemeProvider theme={adaptV4Theme(themeV4 as DeprecatedThemeOptions)}>
			<CssBaseline />
			<App
				adapterName="radar-trap"
				onThemeChange={(_theme): void => {
					themeName = _theme;
					build();
				}}
			/>
		</ThemeProvider>,
		document.getElementById("root"),
	);
};

build();
