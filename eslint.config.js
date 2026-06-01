import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: [
			"dist",
			"coverage",
			"storybook-static",
			"example",
			"example-react-19",
			"**/*.config.js",
			"**/*.config.ts",
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: "latest",
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-explicit-any": "error",
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
		},
	},
	{
		files: ["**/*.{test,spec}.{ts,tsx}", "src/test/**"],
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
);
