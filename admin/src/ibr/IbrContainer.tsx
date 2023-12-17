import { Container } from "@mui/material";

import type { SxProps, Theme } from "@mui/system";
import type { FC, ReactElement } from "react";

interface IbrContainerProps {
	sx?: SxProps<Theme>;
	[key: string]: any;
}

const IbrContainer: FC<IbrContainerProps> = ({ children, sx = [], ...props }): ReactElement => (
	<Container
		disableGutters={true}
		sx={[
			{
				/* bgcolor: "red", */
				height: "100vh",
				display: "flex",
				flexFlow: "column",
				alignItems: " stretch",
			},
			...(Array.isArray(sx) ? sx : [sx]),
		]}
		{...props}
	>
		{children}
	</Container>
);

export { IbrContainer };
