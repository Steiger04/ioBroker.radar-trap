import MenuIcon from "@mui/icons-material/Menu";
import ZoomOutMap from "@mui/icons-material/ZoomOutMap";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Theme } from "@mui/system";
import type { Dispatch, FC, ReactElement, SetStateAction } from "react";
import { useState } from "react";
import { useRadarTrapCount } from "../../../lib";
import { MapList } from "./MapList";

interface MapMenuProps {
	routeId: null | string;
	setRouteId: Dispatch<SetStateAction<string | null>>;
	resizeMap: (animate: boolean) => void;
}

const MapMenu: FC<MapMenuProps> = ({ routeId, setRouteId, resizeMap }): ReactElement => {
	const { count } = useRadarTrapCount();
	const upSmall = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));
	const [showDrawer, setShowDrawer] = useState(false);
	const [{ primaryText, secondaryText }, setRouteInfo] = useState({
		primaryText: "",
		secondaryText: "",
	});

	return (
		<>
			{upSmall && (Boolean(primaryText) || Boolean(secondaryText)) && (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						/* color: "primary.main", */
						border: "2px solid",
						borderRadius: "4px",
						borderColor: (theme) => theme.palette.primary.dark,
						backgroundColor: (theme) => theme.palette.primary.main,
						mt: 1,
						p: 1,
						position: "fixed",
						left: "50%",
						top: 0,
						transform: "translate(-50%, 0)",
						overflowY: "auto",
						height: "70px",
						width: "100%",
						maxWidth: {
							xs: "35%",
							sm: "50%",
							md: "70%",
							lg: "75%",
						},
					}}
				>
					<Typography variant="subtitle1">{primaryText}</Typography>
					<Typography variant="caption">{secondaryText}</Typography>
				</Box>
			)}

			{!!count.total && (
				<Fab
					sx={{ position: "absolute", top: 0, left: 0, opacity: 0.7, ml: 1, mt: 1 }}
					size={upSmall ? "medium" : "small"}
					color="primary"
					onClick={() => setShowDrawer(true)}
				>
					<MenuIcon />
				</Fab>
			)}

			<Box sx={{ flexGrow: 1 }} />

			<Fab
				sx={{ position: "absolute", top: 0, right: 0, opacity: 0.7, mr: 1, mt: 1 }}
				size={upSmall ? "medium" : "small"}
				color="primary"
				onClick={() => resizeMap(true)}
			>
				<ZoomOutMap />
			</Fab>

			<SwipeableDrawer
				PaperProps={{
					style: { top: "127px", height: "calc(100vh - 135px)" },
				}}
				anchor="left"
				open={showDrawer}
				onOpen={() => setShowDrawer(true)}
				onClose={() => setShowDrawer(false)}
			>
				<MapList
					{...{
						routeId,
						setRouteId,
						setRouteInfo,
						setShowDrawer,
					}}
				/>
			</SwipeableDrawer>
		</>
	);
};

export { MapMenu };
