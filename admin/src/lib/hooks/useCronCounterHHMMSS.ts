import { useEffect, useState } from "react";
import { cronCounter$ } from "../helpers/cronCounterStream";

const toHHMMSS = (secs: number): string => {
	const hours =
		Math.floor(secs / 3_600) < 10
			? `00${Math.floor(secs / 3_600)}`.slice(-2)
			: Math.floor(secs / 3_600);
	const minutes = `00${Math.floor((secs % 3_600) / 60)}`.slice(-2);
	const seconds = `00${(secs % 3_600) % 60}`.slice(-2);

	return `${hours}:${minutes}:${seconds}`;
};

const useCronCounterHHMMSS = (
	id: string,
): { cronCounterHHMMSS: string | undefined } => {
	const [cronCounterHHMMSS, setCronCounterHHMMSS] =
		useState<string>("00:00:00");

	useEffect(() => {
		const sub = cronCounter$.subscribe((cronCounter) => {
			if (Object.keys(cronCounter)[0] === id) {
				setCronCounterHHMMSS(toHHMMSS(cronCounter[id] as number));
			}
		});

		return (): void => sub.unsubscribe();
	}, [id]);

	return { cronCounterHHMMSS };
};

export { useCronCounterHHMMSS };
