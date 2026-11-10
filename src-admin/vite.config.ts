import { checkManifest, type WebComponentText } from '@iobroker/web-components';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

// with the extension: Vite may load its config natively, without a bundler that would add it
import { COMPONENTS, LANGUAGES, WORD_KEYS, WORKER_FILE, type ComponentName } from './src/constants.ts';
import { buildManifest } from './src/manifests.ts';
import { CATEGORIES, TYPE_TEXTS, wordKey } from '../src-shared/src/traps.ts';

/**
 * The web components of the configuration (JSON-Config): `radar-trap-address.js`, `radar-trap-area.js` and
 * `radar-trap-map.js` with their manifests, built into `admin/custom/` by `tasks.js`. What they share - MapLibre
 * above all, loaded only when a map is shown - lies beside them in chunks of the same folder, so that every module
 * finds the icons (`icons/`) and the counties (`landkreise.json`) relative to itself.
 *
 * No React: the elements draw themselves. Their words come from `src-shared/i18n`, picked here.
 */

type Dictionary = Record<string, string>;

/**
 * A JSON file, relative to this one
 *
 * @param path e.g. `../src-shared/i18n/en.json`
 */
function readJson<T>(path: string): T {
    return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as T;
}

const DICTIONARIES: Record<string, Dictionary> = Object.fromEntries(
    LANGUAGES.map(lang => [lang, readJson<Dictionary>(`../src-shared/i18n/${lang}.json`)] as const),
);

/**
 * A word of the dictionary in every language, for the manifests; the build fails if a language misses it
 *
 * @param key the key with its prefix: `radar_trap_map_name`
 */
function word(key: string): WebComponentText {
    const missing = LANGUAGES.filter(lang => !DICTIONARIES[lang]?.[key]);
    if (missing.length) {
        throw new Error(`The word "${key}" of src-shared/i18n is missing in: ${missing.join(', ')}`);
    }
    return Object.fromEntries(LANGUAGES.map(lang => [lang, DICTIONARIES[lang][key]])) as WebComponentText;
}

/**
 * The words the components show (`src/constants.ts`) and the names of all categories and kinds of trap: every word
 * in every language, or the build fails
 */
function pickWords(): Record<string, Dictionary> {
    const dictionaries = DICTIONARIES;
    const keys = new Set<string>([
        ...WORD_KEYS,
        ...CATEGORIES.map(category => wordKey(category.text)),
        ...Object.values(TYPE_TEXTS).map(text => wordKey(text)),
    ]);
    const picked: Record<string, Dictionary> = Object.fromEntries(LANGUAGES.map(lang => [lang, {}]));
    for (const key of keys) {
        const missing = LANGUAGES.filter(lang => !dictionaries[lang]?.[key]);
        if (missing.length) {
            throw new Error(`The word "${key}" of src-shared/i18n is missing in: ${missing.join(', ')}`);
        }
        for (const lang of LANGUAGES) {
            picked[lang][key] = dictionaries[lang][key];
        }
    }
    return picked;
}

/**
 * Copies the worker of MapLibre next to the modules: MapLibre 6 starts it from a file of its own
 * (`setWorkerUrl` in `src/lib/maps.ts`)
 */
function mapLibreWorker(): Plugin {
    return {
        name: 'radar-trap-maplibre-worker',
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: WORKER_FILE,
                source: readFileSync(
                    fileURLToPath(new URL('./node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url)),
                ),
            });
        },
    };
}

/** Writes the manifest of every component next to its module, checked like a host checks it */
function manifestFiles(): Plugin {
    return {
        name: 'radar-trap-admin-manifests',
        generateBundle() {
            for (const name of Object.keys(COMPONENTS) as ComponentName[]) {
                const manifest = buildManifest(name, word);
                const problem = checkManifest(manifest);
                if (problem) {
                    this.error(`${COMPONENTS[name].file}.json: ${problem}`);
                }
                this.emitFile({
                    type: 'asset',
                    fileName: `${COMPONENTS[name].file}.json`,
                    source: `${JSON.stringify(manifest, null, 4)}\n`,
                });
            }
        },
    };
}

export default {
    plugins: [manifestFiles(), mapLibreWorker()],
    resolve: {
        alias: {
            '@radar-trap': fileURLToPath(new URL('../src-shared/src', import.meta.url)),
        },
    },
    define: {
        __RADAR_TRAP_WORDS__: JSON.stringify(pickWords()),
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        target: 'es2022',
        outDir: './build',
        emptyOutDir: true,
        lib: {
            entry: Object.fromEntries(
                (Object.keys(COMPONENTS) as ComponentName[]).map(name => [COMPONENTS[name].file, `./src/${name}.ts`]),
            ),
            formats: ['es'],
            fileName: (_format: string, name: string): string => `${name}.js`,
        },
        rollupOptions: {
            output: {
                // in the folder of the modules: they find what lies beside them relative to `import.meta.url`
                chunkFileNames: 'radar-trap-[name]-[hash].js',
                assetFileNames: 'radar-trap-[name]-[hash][extname]',
                // library mode keeps whitespace for the bundler of a consumer; these modules are loaded as they are
                minify: true,
            },
        },
    },
};
