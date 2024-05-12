import Logo from "@iobroker/adapter-react-v5/Components/Logo";
import Box from "@mui/material/Box";
import { useAppData } from "../App";

import type { FC, ReactElement } from "react";

const IbrHeader: FC = (): ReactElement => {
	const { that, instance, common } = useAppData();

	return (
		<Box
			component="header"
			sx={
				{
					/* bgcolor: "yellow", */
				}
			}
		>
			<Logo
				common={common}
				native={that.state.native}
				instance={instance}
				onError={(text): void => that.setState({ errorText: text })}
				onLoad={that.onLoadConfig.bind(that)}
			/>
		</Box>
	);
};

export { IbrHeader };
