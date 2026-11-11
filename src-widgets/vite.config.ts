/**
 * vis-2's widget set of ioBroker.radar-trap: the maps of an area and of a route, and the list of traps.
 *
 * What the widgets know about traps lives in `../src-shared/src`, shared with the tile of the devices app and the
 * web component, and reached here through the `@radar-trap` alias; the icons of the traps lie in
 * `../src-shared/assets` (`@radar-trap-assets`).
 *
 * vis-2 shares React and MUI through Module Federation, as singletons in its share scope. `dedupe` still matters: a
 * file in `../src-shared/src` would otherwise resolve `react` next to itself and the federation runtime would see two
 * different packages.
 */

import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config.js';
import pack from './package.json' with { type: 'json' };

/**
 * Resolves a path relative to this file.
 *
 * @param relative path relative to `src-widgets`
 */
const dir = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));

const config = {
    plugins: [
        federation({
            manifest: true,
            // Not the name of the old widget set `vis-2-widgets-radar-trap`: both may be installed for a while
            name: 'vis2RadarTrapAdapterWidgets',
            filename: 'customWidgets.js',
            exposes: {
                './RadarTrapAreaWidget': './src/RadarTrapAreaWidget.tsx',
                './RadarTrapRouteWidget': './src/RadarTrapRouteWidget.tsx',
                './RadarTrapInfoWidget': './src/RadarTrapInfoWidget.tsx',
                './translations': './src/translations',
            },
            remotes: {},
            shared: moduleFederationShared(pack),
            dts: false,
        }),
        react(),
    ],
    resolve: {
        alias: [
            { find: '@radar-trap-assets', replacement: dir('../src-shared/assets') },
            { find: '@radar-trap', replacement: dir('../src-shared/src') },
            // The package itself only, not its sub-paths: `./src/guiComponents.ts` reaches `I18n` by one.
            { find: /^@iobroker\/gui-components$/, replacement: dir('./src/guiComponents.ts') },
            // The icon package reaches for this deep path, which the share scope does not cover - see
            // `./src/muiSvgIcon.tsx`.
            { find: /^@mui\/material\/SvgIcon$/, replacement: dir('./src/muiSvgIcon.tsx') },
        ],
        dedupe: [
            'react',
            'react-dom',
            '@emotion/react',
            '@emotion/styled',
            '@mui/material',
            '@mui/system',
            '@mui/icons-material',
            '@iobroker/gui-components',
        ],
    },
    server: {
        fs: {
            // The shared code, the words and the icons live outside this project root.
            allow: [dir('..')],
        },
    },
    base: './',
    build: {
        // Top-level await, emitted by the federation plugin, needs chrome89+.
        target: 'chrome89',
        outDir: './build',
        rollupOptions: {
            onwarn(warning: { code: string }, warn: (warning: { code: string }) => void): void {
                // "Module level directives cause errors when bundled" - harmless for "use client".
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
            },
        },
    },
};

export default config;
