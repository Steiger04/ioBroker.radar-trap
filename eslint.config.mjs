import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.mjs'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        // the front-ends have their own tooling; admin/ and widgets/ hold their builds
        ignores: [
            'src-admin/**/*',
            'src-devices/**/*',
            'src-shared/**/*',
            'src-webcomponents/**/*',
            'src-widgets/**/*',
            'admin/**/*',
            'widgets/**/*',
            'public/**/*',
            'node_modules/**/*',
            'test/**/*',
            'build/**/*',
            'tasks.ts',
            'tmp/**/*',
            'www/**/*',
            '.**/*',
        ],
    },
    {
        // disable temporary the rule 'jsdoc/require-param' and enable 'jsdoc/require-jsdoc'
        rules: {
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param': 'off',

            '@typescript-eslint/no-require-imports': 'off',
        },
    },
];
