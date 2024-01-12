import Logo from "@iobroker/adapter-react-v5/Components/Logo";
import Box from "@mui/material/Box";
import { useAppData } from "../App";

import type { FC, ReactElement } from "react";

const IbrHeader: FC = (): ReactElement => {
	const { that } = useAppData();

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
				common={that.common}				
				native={that.state.native}
				instance={that.instance}
				onError={(text): void => that.setState({ errorText: text })}
				onLoad={that.onLoadConfig.bind(that)}
			/>
		</Box>
	);
};

export { IbrHeader };
