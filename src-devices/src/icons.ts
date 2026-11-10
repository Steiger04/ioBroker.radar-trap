/**
 * The icons of the categories: monochrome shapes, which the tile colours as a CSS mask. The files live in
 * `src-shared/assets/map-icons`, shared with the map widgets of vis-2.
 */

import type { CategoryIcon } from '@radar-trap/traps';

import IconDangerSpot from '@radar-trap-assets/map-icons/icon-danger-spot-sdf.png';
import IconMobileSpeedCameraHotspot2015 from '@radar-trap-assets/map-icons/icon-mobile-speed-camera-hotspot-2015-sdf.png';
import IconPoliceReportVwdVwda from '@radar-trap-assets/map-icons/icon-police-report-vwd-vwda-sdf.png';
import IconRoadWork22_26 from '@radar-trap-assets/map-icons/icon-road-work-22-26-sdf.png';
import IconSpeedCamera from '@radar-trap-assets/map-icons/icon-speed-camera-sdf.png';
import IconTrafficJam20 from '@radar-trap-assets/map-icons/icon-traffic-jam-20-sdf.png';

export const CATEGORY_IMAGES: Readonly<Record<CategoryIcon, string>> = {
    'road-work-22-26': IconRoadWork22_26,
    'traffic-jam-20': IconTrafficJam20,
    'danger-spot': IconDangerSpot,
    'speed-camera': IconSpeedCamera,
    'mobile-speed-camera-hotspot-2015': IconMobileSpeedCameraHotspot2015,
    'police-report-vwd-vwda': IconPoliceReportVwdVwda,
};
