import I18n from "@iobroker/adapter-react-v5/i18n";
import PublicIcon from "@mui/icons-material/Public";
import RouteIcon from "@mui/icons-material/Route";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import { useRadarTrapFind } from "../../../lib";

import type { Dispatch, FC, ReactElement, SetStateAction } from "react";

interface MapListProps {
	routeId: null | string;
	setRouteId: Dispatch<React.SetStateAction<string | null>>;
	setRouteDescription: Dispatch<SetStateAction<JSX.Element | undefined>>;
	setShowDrawer: Dispatch<SetStateAction<boolean>>;
}

const MapList: FC<MapListProps> = ({
	routeId,
	setRouteId,
	setRouteDescription,
	setShowDrawer,
}): ReactElement | null => {
	const { data: areaData, status: areaStatus } = useRadarTrapFind<radarTrap.Area>("areas", {
		query: { $select: ["_id", "timestamp", "description"] },
	});

	const { data: routesData, status: routesStatus } = useRadarTrapFind<radarTrap.Route>("routes", {
		query: { $select: ["_id", "timestamp", "description", "activeProfile"] },
	});

	const routesItems =
		routesStatus === "success" &&
		routesData!
			.slice()
			.sort((a, b) => a.description!.localeCompare(b.description!))
			.map((data) => {
				const actualExclusionsList = data
					.activeProfile!.actualExclusion.map((excl) => I18n.t(excl as string))
					.join(", ");

				const primaryText = (
					<>
						<Typography variant="subtitle1">{data.description!}</Typography>
						<Typography variant="caption">
							{`${I18n.t("profile")}: ${I18n.t(data.activeProfile!.name)} | ${I18n.t(
								"exclusions",
							)}: ${actualExclusionsList.length > 0 ? actualExclusionsList : "-"} `}
						</Typography>
					</>
				);

				const secondaryText = (
					<Typography sx={{ display: "block" }} variant="caption">
						{`${I18n.t("updated")}: `}
						{new Date(data.timestamp!).toLocaleString("de-DE", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						})}
					</Typography>
				);

				return (
					<ListItem key={data._id} disablePadding={true}>
						<ListItemButton
							onClick={() => {
								setShowDrawer(false);
								setRouteId(data._id);
								setRouteDescription(primaryText);
							}}
						>
							<ListItemAvatar>
								<Avatar>
									<RouteIcon color={routeId === data._id ? "primary" : "inherit"} />
								</Avatar>
							</ListItemAvatar>
							<ListItemText disableTypography primary={primaryText} secondary={secondaryText} />
						</ListItemButton>
					</ListItem>
				);
			});

	const areaItems =
		areaStatus === "success" &&
		areaData!
			.slice()
			.sort((a, b) => a.description!.localeCompare(b.description!))
			.map((data) => {
				const primaryText = <Typography variant="subtitle1">{data.description!}</Typography>;

				const secondaryText = (
					<Typography sx={{ display: "block" }} variant="caption">
						{`${I18n.t("updated")}: `}
						{new Date(data.timestamp!).toLocaleString("de-DE", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						})}
					</Typography>
				);

				return (
					<ListItem key={data._id} disablePadding={true}>
						<ListItemButton
							onClick={() => {
								setShowDrawer(false);
								setRouteId(data._id);
								setRouteDescription(primaryText);
							}}
						>
							<ListItemAvatar>
								<Avatar>
									<PublicIcon color={routeId === data._id ? "primary" : "inherit"} />
								</Avatar>
							</ListItemAvatar>
							<ListItemText disableTypography primary={primaryText} secondary={secondaryText} />
						</ListItemButton>
					</ListItem>
				);
			});

	return areaStatus === "success" && routesStatus === "success" ? (
		<>
			{routesItems && !!routesItems.length && (
				<List
					subheader={
						<ListSubheader sx={{ display: "flex", justifyContent: "center" }}>
							<Typography variant="body1" py={1}>
								{I18n.t("routes")}
							</Typography>
						</ListSubheader>
					}
				>
					{routesItems}
				</List>
			)}

			{areaItems && !!areaItems.length && (
				<List
					subheader={
						<ListSubheader sx={{ display: "flex", justifyContent: "center" }}>
							<Typography variant="body1" py={1}>
								{I18n.t("areas")}
							</Typography>
						</ListSubheader>
					}
				>
					{areaItems}
				</List>
			)}
		</>
	) : null;
};

export { MapList };
