import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import type { SxProps, Theme } from "@mui/material/styles";
import { useRef, type FC, type MouseEventHandler, type ReactElement, useState, useEffect, useCallback } from "react";

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
}): ReactElement => {
	const boxRef = useRef(null);
	const [isOverflowing, setIsOverflowing] = useState(false);

	const checkOverflow = useCallback(() => {
		if (boxRef.current) {
			const { scrollHeight, clientHeight } = boxRef.current;
			setIsOverflowing(scrollHeight >= clientHeight);
		}
	}, [boxRef]);

	useEffect(() => {
		checkOverflow();
		window.addEventListener("resize", checkOverflow);

		return () => {
			window.removeEventListener("resize", checkOverflow);
		};
	}, [checkOverflow]);

	return (
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
				ref={boxRef}
				sx={[
					{
						/* bgcolor: "gold", */
						flex: "1 1 0",
						overflowY: "auto",
						pr: isOverflowing ? 0.75 : 0,
					},
					...(Array.isArray(sx) ? sx : [sx]),
				]}
			>
				{children}
			</Box>
		</Box>
	);
};

export { AreaAndRouteCard };
