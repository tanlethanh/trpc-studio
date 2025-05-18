import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { includeIgnoreFile } from '@eslint/compat';
import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginJest from 'eslint-plugin-jest';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig([
	includeIgnoreFile(gitignorePath),
	tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		plugins: { js, prettier: pluginPrettier, import: pluginImport },
		extends: ['js/recommended'],
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-require-imports': 'off',
			'react/react-in-jsx-scope': 'off',
			'react/no-unescaped-entities': 'off',
			'no-empty': 'off',
			'import/consistent-type-specifier-style': [
				'error',
				'prefer-top-level',
			],
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'object',
						['parent', 'sibling'],
						'index',
					],
				},
			],
			'prettier/prettier': [
				'error',
				{
					endOfLine: 'auto',
					useTabs: true,
					trailingComma: 'all',
					singleQuote: true,
					tabWidth: 4,
				},
			],
		},
	},
	{
		files: ['tests/**/*'],
		plugins: { jest: pluginJest },
		languageOptions: { globals: { ...globals.jest } },
	},
]);
