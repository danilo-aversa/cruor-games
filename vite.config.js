import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesBase = process.env.CRUOR_PAGES_BASE || "/";

export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  test: {
    exclude: ["node_modules/**", "dist/**", "tests/e2e/**"],
  },
});
