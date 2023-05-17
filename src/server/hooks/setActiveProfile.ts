const setActiveProfile = (data: radarTrap.Route): void => {
	data.activeProfile = data.profiles.find((profile) => profile.active);
};

export { setActiveProfile };
