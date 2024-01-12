import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Modal from "@mui/material/Modal";

import type { Dispatch, FC, PropsWithChildren, ReactElement } from "react";

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "88%",
	height: "85%",
	borderRadius: 0,
	borderWidth: 4,
	borderStyle: "solid",
	borderColor: "primary.main",

	p: 0,
} as const;

interface AreaModalProps {
	openModal: boolean;
	setOpenModal: Dispatch<React.SetStateAction<boolean>>;
}
const AreaModal: FC<PropsWithChildren<AreaModalProps>> = ({ children, openModal, setOpenModal }): ReactElement => {
	const handleClose = () => setOpenModal(false);

	return (
		<div>
			<Modal sx={{ bgcolor: "background.paper" }} open={openModal} onClose={handleClose}>
				<Fade in={openModal} timeout={1000}>
					<Box sx={style}>{children}</Box>
				</Fade>
			</Modal>
		</div>
	);
};

export { AreaModal };
