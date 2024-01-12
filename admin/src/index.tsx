import Utils from "@iobroker/adapter-react-v5/Components/Utils";
import theme from "@iobroker/adapter-react-v5/Theme";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import ReactDOM from "react-dom";
import { App } from "./App";

let themeName = Utils.getThemeName();

console.log("iobroker.radar-trap: themeName", themeName);

const build = (): void => {
	ReactDOM.render(
		<ThemeProvider theme={theme(themeName)}>
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
