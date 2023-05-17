import { Box, Typography } from "@mui/material";

import type { FC, ReactElement } from "react";

const styles = {
	message: {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
	},
};

interface MessageProps {
	message: string;
}
const Message: FC<MessageProps> = ({ message }): ReactElement => {
	return (
		<Box sx={styles.message}>
			<Typography variant="h5">{message}</Typography>
		</Box>
	);
};

export { Message };
