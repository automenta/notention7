import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['dist', 'node_modules', 'eslint.config.js'],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            react: pluginReact,
            'react-hooks': pluginReactHooks,
            'react-refresh': pluginReactRefresh,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: './tsconfig.json',
            },
            globals: {
                ...globals.browser,
                ...globals.es2020,
            },
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...pluginReact.configs.recommended.rules,
            ...pluginReactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {argsIgnorePattern: '^_'},
            ],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    eslintConfigPrettier
);
