import MenuIcon from "@mui/icons-material/Menu";
import ZoomOutMap from "@mui/icons-material/ZoomOutMap";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Toolbar from "@mui/material/Toolbar";
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

			<Box sx={{ flexGrow: 1 }}>
				<AppBar
					/* sx={{ top: "145px" }} */
					position="absolute"
					color="transparent"
					elevation={0}
				>
					<Toolbar sx={{ px: { xs: 0 }, py: { xs: 2 }, p: { sm: 2 } }}>
						{!!count.total && (
							<Fab
								sx={{ opacity: 0.7, ml: 1 }}
								size={upSmall ? "medium" : "small"}
								color="primary"
								onClick={() => setShowDrawer(true)}
							>
								<MenuIcon />
							</Fab>
						)}

						<Box sx={{ flexGrow: 1 }} />

						<Fab
							sx={{ opacity: 0.7, mr: 1 }}
							size={upSmall ? "medium" : "small"}
							color="primary"
							onClick={() => resizeMap(true)}
						>
							<ZoomOutMap />
						</Fab>
					</Toolbar>
				</AppBar>

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
			</Box>
		</>
	);
};

export { MapMenu };
