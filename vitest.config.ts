/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		css: false,
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.{test,spec}.{ts,tsx}",
				"src/test/**",
				"src/**/index.ts",
				"src/**/*.d.ts",
				"src/types.ts",
			],
			thresholds: {
				statements: 90,
				functions: 90,
				lines: 90,
				// Branch target is slightly lower: the remaining uncovered branches
				// are dense JSX className/style conditionals whose exhaustive
				// enumeration adds little behavioral assurance.
				branches: 80,
			},
		},
	},
});
