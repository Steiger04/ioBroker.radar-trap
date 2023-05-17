import { useEffect } from "react";
import { useAppData } from "../../App";

const useInvisibleBottomButtons = (): void => {
	const { that } = useAppData();

	useEffect(() => {
		that.setState({ bottomButtons: false });

		return () => that.setState({ bottomButtons: true });
	}, []);
};

export { useInvisibleBottomButtons };
