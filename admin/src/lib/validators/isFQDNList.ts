import isFQDN from "validator/lib/isFQDN";
import isIP from "validator/lib/isIP";

const isFQDNList = (list: string | undefined): boolean =>
	!list!.split(",").some((item) => item !== "localhost" && !isIP(item.trim()) && !isFQDN(item.trim()));

export { isFQDNList };
