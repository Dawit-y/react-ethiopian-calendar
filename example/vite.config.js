import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
	plugins: [react()],
	root: "./",
	build: {
		outDir: "dist",
	},
	server: {
		port: 3000,
	},
	resolve: {
		alias: {
			"react-ethiopian-calendar": resolve(__dirname, "../src/index.js"),
		},
	},
});
