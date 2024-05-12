// import Geocoding from "@mapbox/mapbox-sdk/services/geocoding";
import Box from "@mui/material/Box";
import type { BaseSyntheticEvent, FC, PropsWithChildren, ReactElement } from "react";
import { useAppData, connectionReady } from "../App";

const SaveCloseButtonsWrapper: FC<PropsWithChildren> = ({ children }): ReactElement => {
	const { that, native, socket, instanceId } = useAppData();

	const onClickHandler = (event: BaseSyntheticEvent) => {
		const saveType =
			event.target.ariaLabel ||
			event.target.parentElement.ariaLabel ||
			event.target.parentElement.parentElement.ariaLabel ||
			event.target.parentElement.parentElement.parentElement.ariaLabel;

		if (saveType === "Save") {
			connectionReady(that, native as ioBroker.INative, socket, instanceId);
		}

		/* if (saveType === "Save" && native.settings!.mbxAccessToken) {
			console.log("Save", native.settings!.mbxAccessToken);
			setTimeout(
				() =>
					socket
						.getObject(instanceId)
						.then((instanceObj) => {
							if (instanceObj) {
								that.geocodingService = Geocoding({
									accessToken: native.settings!.mbxAccessToken,
								});

								socket.setObject(instanceId, instanceObj).catch((ex: any) => console.log(ex));
							}
						})
						.catch((ex: any) => console.log(ex)),
				1000,
			);
		} */
	};

	return <Box onClick={onClickHandler}>{children}</Box>;
};

const IbrFooter: FC = (): ReactElement => {
	const { that } = useAppData();

	return (
		<>
			{that.state.bottomButtons ? (
				<Box
					component="footer"
					sx={{
						/* flex: () => (that.state.bottomButtons ? { xs: "0 1 56px", sm: "0 1 64px" } : "0 1 auto"), */
						flex: { xs: "0 1 56px", sm: "0 1 64px" },
					}}
				>
					<SaveCloseButtonsWrapper>{that.renderSaveCloseButtons()}</SaveCloseButtonsWrapper>
				</Box>
			) : null}
		</>
	);
};

export { IbrFooter };
