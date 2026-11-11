/**
 * Builds the adapter: the backend and the front-ends, each copied where its host looks for it.
 *
 *   src/                -> build/                  the backend (tsc, `tsconfig.build.json`)
 *   src-admin/          -> admin/custom/           the web components of the configuration (`admin/jsonConfig.json5`)
 *   src-widgets/        -> widgets/radar-trap/     the vis-2 widget set (`common.visWidgets`)
 *   src-devices/        -> admin/dm-widgets/       the tile of the devices app (`common.deviceWidgets`)
 *   src-webcomponents/  -> admin/webcomponents/    the web component <iob-radar-trap-traps> (`common.webComponents`)
 *
 * The front-ends share `src-shared/`: what they know about traps, the words and the icons. Their outputs are
 * committed; `build/` is not (`common.nogit`).
 *
 *   tsx tasks.ts                     everything
 *   tsx tasks.ts --backend | --admin | --widgets | --devices | --wc
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fork } from 'node:child_process';
import { buildReact, copyFiles, deleteFoldersRecursive, npmInstall } from '@iobroker/build-tools';

const ROOT = __dirname;

/** The icons of the categories the web component shows, next to its module (`src-webcomponents/src/index.tsx`) */
const WC_ICONS = [
    'danger-spot',
    'mobile-speed-camera-hotspot-2015',
    'police-report-vwd-vwda',
    'road-work-22-26',
    'speed-camera',
    'traffic-jam-20',
];

/**
 * Installs the packages of a front-end and builds it with vite
 *
 * @param dir the folder of the front-end, below the root
 */
async function build(dir: string): Promise<void> {
    await npmInstall(`${ROOT}/${dir}/`);
    await buildReact(`${ROOT}/${dir}/`, { rootDir: `${ROOT}/${dir}/`, vite: true });
}

// --- backend: src -> build -----------------------------------------------------------------------------------------

/** Compiles the backend with tsc */
function backend(): Promise<void> {
    deleteFoldersRecursive(`${ROOT}/build`);
    return new Promise((resolve, reject) => {
        const script = `${ROOT}/node_modules/typescript/bin/tsc`;
        if (!existsSync(script)) {
            reject(new Error(`Cannot find execution file: ${script}`));
            return;
        }
        const child = fork(script, ['-p', `${ROOT}/tsconfig.build.json`], { stdio: 'pipe', cwd: ROOT });
        child.stdout?.on('data', (data: Buffer) => process.stdout.write(data));
        child.stderr?.on('data', (data: Buffer) => process.stderr.write(data));
        child.on('close', code => (code ? reject(new Error(`tsc exit code: ${code}`)) : resolve()));
    });
}

// --- configuration: src-admin -> admin/custom ----------------------------------------------------------------------

type Coordinates = number | Coordinates[];

interface County {
    id: number | string;
    properties: { NAME_1?: string; NAME_2?: string; NAME_3?: string };
    geometry: { type: string; coordinates: Coordinates };
}

/**
 * Rounds a coordinate or a ring of them to 5 decimals - about one metre, plenty for a county
 *
 * @param value a number or an array of them, nested
 */
function round(value: Coordinates): Coordinates {
    return Array.isArray(value) ? value.map(round) : Math.round(value * 1e5) / 1e5;
}

/**
 * Writes the German counties for the area editor: of their properties only the names, which it lists and stores. A
 * county the user picks goes into the configuration of the instance as it is, so it should be small.
 */
function writeCounties(): void {
    const counties = JSON.parse(readFileSync(`${ROOT}/src-admin/assets/landkreise.json`, 'utf8')) as {
        features: County[];
    };
    const features = counties.features.map(({ id, properties, geometry }) => ({
        type: 'Feature',
        id,
        properties: { NAME_1: properties.NAME_1, NAME_2: properties.NAME_2, NAME_3: properties.NAME_3 },
        geometry: { type: geometry.type, coordinates: round(geometry.coordinates) },
    }));
    writeFileSync(`${ROOT}/admin/custom/landkreise.json`, JSON.stringify({ type: 'FeatureCollection', features }));
}

async function admin(): Promise<void> {
    deleteFoldersRecursive(`${ROOT}/admin/custom`);
    deleteFoldersRecursive(`${ROOT}/src-admin/build`);
    // the vite build writes the manifests and fails if one is not valid
    await build('src-admin');
    copyFiles(['src-admin/build/*.js', 'src-admin/build/*.json'], 'admin/custom/');
    // every icon: the maps show all kinds of trap
    copyFiles(['src-shared/assets/map-icons/*.png'], 'admin/custom/icons/');
    writeCounties();
}

// --- vis-2 widget set: src-widgets -> widgets/radar-trap -----------------------------------------------------------

async function widgets(): Promise<void> {
    deleteFoldersRecursive(`${ROOT}/widgets/radar-trap`);
    deleteFoldersRecursive(`${ROOT}/src-widgets/build`);
    await build('src-widgets');
    // `index.html` is the stand-alone dev page. `mf-manifest.json` is shipped: vis-2 reads it next to the remote
    // entry to see which shared modules the set was built against.
    copyFiles(['src-widgets/build/**/*', '!src-widgets/build/index.html'], 'widgets/radar-trap/');
}

// --- devices app tile: src-devices -> admin/dm-widgets -------------------------------------------------------------

async function devices(): Promise<void> {
    deleteFoldersRecursive(`${ROOT}/admin/dm-widgets`);
    deleteFoldersRecursive(`${ROOT}/src-devices/build`);
    await build('src-devices');
    copyFiles(['src-devices/build/**/*', '!src-devices/build/index.html'], 'admin/dm-widgets/');
    // The icon of the tile in the catalogue of the devices app, named by `common.deviceWidgets`
    copyFiles(['src-devices/img/*'], 'admin/dm-widgets/');
}

// --- web component: src-webcomponents -> admin/webcomponents -------------------------------------------------------

async function webComponents(): Promise<void> {
    deleteFoldersRecursive(`${ROOT}/admin/webcomponents`);
    deleteFoldersRecursive(`${ROOT}/src-webcomponents/build`);
    // the vite build writes the manifest and fails if it is not valid
    await build('src-webcomponents');
    copyFiles(['src-webcomponents/build/*.js', 'src-webcomponents/build/*.json'], 'admin/webcomponents/');
    copyFiles(
        WC_ICONS.map(icon => `src-shared/assets/map-icons/icon-${icon}-sdf.png`),
        'admin/webcomponents/icons/',
    );
}

const TASKS: Record<string, () => Promise<void>> = {
    '--backend': backend,
    '--admin': admin,
    '--widgets': widgets,
    '--devices': devices,
    '--wc': webComponents,
};

async function main(): Promise<void> {
    const chosen = Object.keys(TASKS).filter(flag => process.argv.includes(flag));
    for (const flag of chosen.length ? chosen : Object.keys(TASKS)) {
        await TASKS[flag]();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
