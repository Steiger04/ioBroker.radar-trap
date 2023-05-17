import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import type { SxProps, Theme } from "@mui/material/styles";
import type { FC, MouseEventHandler, ReactElement } from "react";

interface AreaAndRouteCardProps {
	sx?: SxProps<Theme>;
	buttonClickHandler: MouseEventHandler<HTMLButtonElement>;
	label: string;
}

const AreaAndRouteCard: FC<AreaAndRouteCardProps> = ({
	sx = [],
	children,
	buttonClickHandler,
	label,
}): ReactElement => (
	<Box
		sx={{
			/* bgcolor: "blue", */
			height: "100%",
			display: "flex",
			flexFlow: "column",
		}}
	>
		<Box sx={{ pb: 2, alignSelf: "center" }}>
			<Button onClick={buttonClickHandler} variant="contained">
				{label}
			</Button>
		</Box>

		<Box
			sx={[
				{
					/* bgcolor: "gold", */
					flex: "1 1 0",
					overflowY: "auto",
				},
				...(Array.isArray(sx) ? sx : [sx]),
			]}
		>
			{children}
		</Box>
	</Box>
);

export { AreaAndRouteCard };
