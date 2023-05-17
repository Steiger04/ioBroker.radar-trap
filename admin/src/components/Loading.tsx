import {
	Backdrop,
	Box,
	CircularProgress,
	circularProgressClasses,
} from "@mui/material";
import type { FC, ReactElement } from "react";

const Loading: FC = (): ReactElement => (
	<Backdrop
		open={true}
		sx={{ zIndex: (theme): number => theme.zIndex.modal + 1 }}
	>
		<Box sx={{ position: "relative" }}>
			<CircularProgress
				variant="determinate"
				sx={{
					color: (theme): string =>
						theme.palette.grey[
							theme.palette.mode === "light" ? "200" : "800"
						],
				}}
				size={120}
				thickness={4}
				value={100}
			/>
			<CircularProgress
				variant="indeterminate"
				disableShrink={true}
				sx={{
					color: (theme): string =>
						theme.palette.mode === "light"
							? "primary.light"
							: "primary.main",
					animationDuration: "550ms",
					position: "absolute",
					left: 0,
					[`& .${circularProgressClasses.circle}`]: {
						strokeLinecap: "round",
					},
				}}
				size={120}
				thickness={4}
			/>
		</Box>
	</Backdrop>
);

export { Loading };
