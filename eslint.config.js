import js from "@eslint/js"
import prettierPlugin from "eslint-plugin-prettier"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
	{
		ignores: ["dist"],
	},

	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		files: ["**/*.{ts,tsx}"],

		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
		},

		plugins: {
			prettier: prettierPlugin,
			react,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},

		rules: {
			// --- React ---
			...reactHooks.configs.recommended.rules,
			
			// --- Prettier (config lives in .prettierrc) ---
			"prettier/prettier": "warn",

			// --- React prop sorting ---
			"react/jsx-sort-props": [
				"error",
				{
					callbacksLast: true,
					ignoreCase: true,
					shorthandFirst: false,
					shorthandLast: false,
				},
			],

			"react-refresh/only-export-components": "off",

			// --- Let Prettier handle these ---
			semi: "off",
			quotes: "off",
			indent: "off",

			// --- Object key sorting ---
			"sort-keys": ["warn", "asc", { caseSensitive: false, natural: true }],

			// --- TypeScript ---
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
		},

		settings: {
			react: { version: "detect" },
		},
	},
]