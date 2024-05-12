import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import DeleteForever from "@mui/icons-material/DeleteForever";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import Save from "@mui/icons-material/Save";
import { Box } from "@mui/material";
import { green, red } from "@mui/material/colors";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Fragment } from "react";
import { useAppData } from "../App";
import { useCronCounterHHMMSS } from "../lib";

import type { FC, ReactElement, SyntheticEvent } from "react";

const Red = red[700];
const Green = green[700];

interface ButtonGroupProps {
	_id: string;
	accordionDisabledMap: Map<string | null, boolean>;
	description: string | undefined;
	deleteHandler: (event: SyntheticEvent) => Promise<void>;
	createHandler: (event: SyntheticEvent) => void;
	isValid: boolean;
	isDirty: boolean;
}

const ButtonGroup: FC<ButtonGroupProps> = ({
	_id,
	description,
	accordionDisabledMap,
	deleteHandler,
	createHandler,
	isValid,
	isDirty,
}): ReactElement => {
	const { socket, adapterName, instance } = useAppData();

	const { cronCounterHHMMSS } = useCronCounterHHMMSS(_id);

	const cronHandler = (event: SyntheticEvent, name: string) => {
		event.stopPropagation();
		socket
			.setState(`${adapterName}.${instance}.${_id}.cron-job.${name}`, {
				val: true,
				ack: false,
			})
			.catch((ex: any) => console.log(ex));
	};

	return (
		<Fragment>
			<Typography
				style={{ wordWrap: "break-word" }}
				sx={{
					minWidth: { xs: "30%", sm: "50%" },
					maxWidth: { xs: "30%", sm: "50%" },
					width: { xs: "35%", sm: "50%" },
					flexGrow: 0,
					alignSelf: "center",
				}}
			>
				{description}
			</Typography>

			<Box sx={{ flexGrow: 1 }} />
			{!isDirty && isValid && (
				<Box sx={{ display: "flex", flexGrow: 0 }}>
					<Box sx={{ ml: 1, flexGrow: 0, alignSelf: "center" }}>
						<IconButton
							disabled={accordionDisabledMap.get(_id)}
							sx={{ color: Green, p: 0, mr: 1 }}
							onClick={(event) => cronHandler(event, "run")}
						>
							<AutorenewOutlinedIcon />
						</IconButton>
					</Box>

					<Divider orientation="vertical" flexItem={true} />

					<Box sx={{ mx: 1, flexGrow: 0, alignSelf: "center" }}>
						<IconButton
							disabled={accordionDisabledMap.get(_id)}
							sx={{ color: Green, p: 0, mr: 1 }}
							onClick={(event) => cronHandler(event, "resume")}
						>
							<PlayCircleOutlineIcon />
						</IconButton>
						<IconButton
							disabled={accordionDisabledMap.get(_id)}
							sx={{ color: Green, p: 0, mr: 1 }}
							onClick={(event) => cronHandler(event, "pause")}
						>
							<PauseCircleOutlineIcon />
						</IconButton>
					</Box>

					<Typography
						sx={{
							width: "4rem",
							flexGrow: 0,
							textAlign: "end",
							alignSelf: "center",
							mr: 1,
						}}
						variant="body2"
					>
						{cronCounterHHMMSS}
					</Typography>

					<Divider orientation="vertical" flexItem={true} />
				</Box>
			)}

			<Box sx={{ ml: 1, flexGrow: 0, alignSelf: "center" }}>
				<IconButton
					disabled={!isValid || !isDirty || accordionDisabledMap.get(_id)}
					sx={{ color: Green, mr: 1, p: 0 }}
					onClick={createHandler}
				>
					<Save />
				</IconButton>
				<IconButton
					// disabled={!isValid || isDirty || accordionDisabledMap.get(_id)}
					disabled={accordionDisabledMap.get(_id) === true}
					sx={{ color: Red, mr: 2, p: 0 }}
					onClick={deleteHandler}
				>
					<DeleteForever />
				</IconButton>
			</Box>
		</Fragment>
	);
};

export { ButtonGroup };
