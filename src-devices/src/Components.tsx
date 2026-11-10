// The module the devices app loads through Module Federation. It picks the component by the name declared in
// `common.deviceWidgets.components[].name` of io-package.json, so the keys here and the names there must match.
import RadarTrapComponent from './RadarTrapComponent';

export default { RadarTrapComponent };
