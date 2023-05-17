import Box from "@mui/material/Box";

import type { SxProps, Theme } from "@mui/material/styles";
import type { FC, ReactElement } from "react";

type TabCardProps = {
	id?: string;
	sx?: SxProps<Theme>;
};

const TabCard: FC<TabCardProps> = ({ children, id, sx = [] }): ReactElement => (
	<Box
		id={id}
		component="section"
		sx={[
			{
				/* bgcolor: "blueviolet", */
				flexGrow: 1,
			},
			...(Array.isArray(sx) ? sx : [sx]),
		]}
	>
		{children}
	</Box>
);

export { TabCard };
