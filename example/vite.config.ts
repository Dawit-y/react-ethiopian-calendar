import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The library is installed via `file:..`, so it resolves through node_modules
// and its package.json `exports` map (which maps `./style.css` → dist/index.css).
// We only dedupe React so the externalized peer dependency resolves to a single
// copy shared with this app.
export default defineConfig({
	plugins: [react()],
	server: { port: 3000 },
	resolve: {
		alias: {
			react: path.resolve(__dirname, "node_modules/react"),
			"react-dom": path.resolve(__dirname, "node_modules/react-dom"),
		},
		dedupe: ["react", "react-dom"],
	},
});
