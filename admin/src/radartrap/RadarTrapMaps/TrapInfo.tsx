import I18n from "@iobroker/adapter-react/i18n";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";

import type { FC, ReactElement } from "react";

interface TrapInfoProps {
	info: radarTrap.trapInfo;
}

const TrapInfo: FC<TrapInfoProps> = ({ info }): ReactElement => (
	<Box
		sx={{
			margin: "-10px -10px -15px -10px",
			p: 0,
			minWidth: 200,
			maxWidth: 300,
		}}
	>
		<Card variant="elevation" elevation={6}>
			<Box sx={{ bgcolor: "primary.main", px: 1, borderBottom: 2 }}>
				<Typography align="center" variant="h6">
					{info.typeText}
				</Typography>
			</Box>
			<CardContent sx={{ mt: -1, mb: -2 }}>
				{info.vmax && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("maximum speed")}: `}</b>
						{info.vmax} km/h
					</Typography>
				)}
				{info.reason && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("reason")}: `}</b>
						{info.reason}
					</Typography>
				)}
				{info.length && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("jam length")}: `}</b>
						{info.length} km
					</Typography>
				)}
				{info.duration && info.duration !== 0 && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("duration")}: `}</b>
						{info.duration} min.
					</Typography>
				)}
				{info.delay && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("delay")}: `}</b>
						{info.delay} min.
					</Typography>
				)}
				{info.createDate && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("reported")}: `}</b>
						{info.createDate}
					</Typography>
				)}
				{info.confirmDate && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("confirmed")}: `}</b>
						{info.confirmDate}
					</Typography>
				)}
				{info.typeText != "Verkehrssperrung" && <Divider />}
				{info.state && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("state")}: `}</b>
						{info.state}
					</Typography>
				)}
				{info.street && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("street")}: `}</b>
						{info.street}
					</Typography>
				)}
				{info.zipCode && info.city && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("city")}: `}</b>
						{info.zipCode} {info.city}
					</Typography>
				)}
				{info.cityDistrict && (
					<Typography variant="subtitle2">
						<b>{`${I18n.t("cityDistrict")}: `}</b>
						{info.cityDistrict}
					</Typography>
				)}
			</CardContent>
		</Card>
	</Box>
);

export { TrapInfo };
