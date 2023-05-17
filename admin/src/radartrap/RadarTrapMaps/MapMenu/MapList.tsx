import I18n from "@iobroker/adapter-react/i18n";
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
import { useFind } from "figbird";

import type { Dispatch, FC, ReactElement, SetStateAction } from "react";

interface MapListProps {
	routeId: null | string;
	setRouteId: Dispatch<React.SetStateAction<string | null>>;
	setRouteInfo: Dispatch<
		SetStateAction<{
			primaryText: string;
			secondaryText: string;
		}>
	>;
	setShowDrawer: Dispatch<SetStateAction<boolean>>;
}

const MapList: FC<MapListProps> = ({
	routeId,
	setRouteId,
	setRouteInfo,
	setShowDrawer,
}): ReactElement | null => {
	const { data: areaData, status: areaStatus } = useFind<radarTrap.Area>(
		"areas",
		{
			realtime: "refetch",
			allPages: true,
			query: { $select: ["_id", "description"] },
		},
	);

	const { data: routesData, status: routesStatus } = useFind<radarTrap.Route>(
		"routes",
		{
			realtime: "refetch",
			allPages: true,
			query: { $select: ["_id", "description", "activeProfile"] },
		},
	);

	const routesItems =
		routesStatus === "success" &&
		routesData!
			.slice()
			.sort((a, b) => a.description!.localeCompare(b.description!))
			.map((data) => {
				const actualExclusionsList = data
					.activeProfile!.actualExclusion.map((excl) =>
						I18n.t(excl as string),
					)
					.join(", ");

				const primaryText = data.description!;
				const secondaryText = `${I18n.t("profile")}: ${I18n.t(
					data.activeProfile!.name,
				)} | ${I18n.t("exclusions")}: ${
					actualExclusionsList.length > 0 ? actualExclusionsList : "-"
				} `;

				return (
					<ListItem key={data._id} disablePadding={true}>
						<ListItemButton
							onClick={() => {
								setShowDrawer(false);
								setRouteId(data._id);
								setRouteInfo({ primaryText, secondaryText });
							}}
						>
							<ListItemAvatar>
								<Avatar>
									<RouteIcon
										color={
											routeId === data._id
												? "primary"
												: "inherit"
										}
									/>
								</Avatar>
							</ListItemAvatar>
							<ListItemText
								primary={primaryText}
								secondary={secondaryText}
							/>
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
				const primaryText = data.description!;
				const secondaryText = "";

				return (
					<ListItem key={data._id} disablePadding={true}>
						<ListItemButton
							onClick={() => {
								setShowDrawer(false);
								setRouteId(data._id);
								setRouteInfo({ primaryText, secondaryText });
							}}
						>
							<ListItemAvatar>
								<Avatar>
									<PublicIcon
										color={
											routeId === data._id
												? "primary"
												: "inherit"
										}
									/>
								</Avatar>
							</ListItemAvatar>
							<ListItemText
								primary={primaryText}
								secondary={secondaryText}
							/>
						</ListItemButton>
					</ListItem>
				);
			});

	/* useEffect(() => {
		console.log("MapList: useEffect");

		return () => console.log("MapList: useEffect cleanup");
	}, []); */

	return areaStatus === "success" && routesStatus === "success" ? (
		<>
			{routesItems && !!routesItems.length && (
				<List
					subheader={
						<ListSubheader
							sx={{ display: "flex", justifyContent: "center" }}
						>
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
						<ListSubheader
							sx={{ display: "flex", justifyContent: "center" }}
						>
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
