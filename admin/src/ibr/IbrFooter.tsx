import Geocoding from "@mapbox/mapbox-sdk/services/geocoding";
import Box from "@mui/material/Box";
import type { BaseSyntheticEvent, FC, PropsWithChildren, ReactElement } from "react";
import { useAppData } from "../App";

const SaveCloseButtonsWrapper: FC<PropsWithChildren> = ({ children }): ReactElement => {
	const { that, native } = useAppData();

	const onClickHandler = (event: BaseSyntheticEvent) => {
		const saveType =
			event.target.ariaLabel ||
			event.target.parentElement.parentElement.ariaLabel ||
			event.target.parentElement.parentElement.parentElement.ariaLabel;

		if (
			saveType === "Save" &&
			native.settings!.mbxAccessToken /* &&
			native.settings?.mbxAccessToken !==
				savedNative.settings.mbxAccessToken */
		) {
			setTimeout(
				() =>
					that.socket
						.getObject(that.instanceId)
						.then((instanceObj: ioBroker.Object) => {
							if (instanceObj) {
								that.geocodingService = Geocoding({
									accessToken: native.settings!.mbxAccessToken,
								});

								that.socket.setObject(that.instanceId, instanceObj).catch((ex: any) => console.log(ex));
							}
						})
						.catch((ex: any) => console.log(ex)),
				1000,
			);
		}
	};

	return <Box onClick={onClickHandler}>{children}</Box>;
};

const IbrFooter: FC = (): ReactElement => {
	const { that } = useAppData();

	return (
		<Box
			component="footer"
			sx={{
				flex: () => (that!.state.bottomButtons ? { xs: "0 1 56px", sm: "0 1 64px" } : "0 1 auto"),
			}}
		>
			{/* {that.renderError()}
			{that.renderToast()} */}
			<SaveCloseButtonsWrapper>{that!.renderSaveCloseButtons()}</SaveCloseButtonsWrapper>
		</Box>
	);
};

export { IbrFooter };
