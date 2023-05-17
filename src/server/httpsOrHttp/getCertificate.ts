import type * as utils from "@iobroker/adapter-core";

const getCertificate = async (
	that: utils.AdapterInstance,
): Promise<{ certificate: string; privateKey: string }> => {
	const obj = await that.getForeignObjectAsync("system.certificates");

	return {
		certificate: obj?.native.certificates.defaultPublic,
		privateKey: obj?.native.certificates.defaultPrivate,
	};
};

export { getCertificate };
