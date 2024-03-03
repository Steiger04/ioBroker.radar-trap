const getDevisor = (number: number): number => {
	const quotient = Math.ceil(number / 50);
	return Math.max(1, quotient);
};

export { getDevisor };
