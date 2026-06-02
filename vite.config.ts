import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// All runtime + peer dependencies are kept external so the consumer's bundler
// can de-duplicate and tree-shake them, and so our bundle and source maps stay
// small. This is the standard packaging for a React component library, which is
// always consumed through a bundler (Vite/webpack/Next) that resolves these
// imports — including `react-icons` deep subpaths — correctly.
const EXTERNAL =
	/^(react|react-dom|react\/jsx-runtime|dayjs|ethiopian-date|react-element-popper|react-icons)(\/.*)?$/;

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src"],
			exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}", "src/test/**"],
			rollupTypes: true,
			insertTypesEntry: true,
			tsconfigPath: "./tsconfig.json",
		}),
	],
	build: {
		sourcemap: true,
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			formats: ["es", "cjs"],
			fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
		},
		rollupOptions: {
			external: EXTERNAL,
			output: {
				assetFileNames: "index.css",
			},
		},
		cssCodeSplit: false,
	},
});
