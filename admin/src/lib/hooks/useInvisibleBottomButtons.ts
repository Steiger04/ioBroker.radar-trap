import { useEffect, useState } from "react";
import { useAppData } from "../../App";

const useInvisibleBottomButtons = (): { bottomButtons: boolean } => {
	const { that } = useAppData();
	const [bottomButtons, setBottomButtons] = useState(that.state.bottomButtons);

	useEffect(() => {
		that.setState({ bottomButtons: false });
		setBottomButtons(false);

		return () => that.setState({ bottomButtons: true });
	}, [that]);

	return { bottomButtons };
};

export { useInvisibleBottomButtons };
