import { useEffect, useRef } from "react";

const useAnimationFrame = (
	animationHandler: (timestamp: number, step: number) => number,
): void => {
	// init ref with fake animation frame ID
	const frame = useRef(0);
	const mounted = useRef(false);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			console.log("useEffect->return", mounted.current);
		};
	}, []);

	const animate = (timestamp: number, step: number) => {
		const new_step = animationHandler(timestamp, step);
		// update ref to new animation frame ID
		frame.current = requestAnimationFrame((timestamp) =>
			animate(timestamp, new_step),
		);
	};

	useEffect(() => {
		// update ref to new animation frame ID
		if (mounted.current === true) {
			frame.current = requestAnimationFrame((timestamp) =>
				animate(timestamp, 0),
			);
		} else {
			console.log("useEffect->else", mounted.current);
			cancelAnimationFrame(frame.current);
		}

		// kill animation cycle on component unmount
		return () => cancelAnimationFrame(frame.current);

		// start animation on first render
	}, [mounted.current]);
};

export { useAnimationFrame };
