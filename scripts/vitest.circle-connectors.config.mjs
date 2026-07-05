import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

export default defineConfig({
  root: repoRoot,
  plugins: [react()],
  resolve: {
    alias: {
      "@": repoRoot,
    },
  },
  test: {
    include: ["scripts/run-circle-connector-diagnostics.test.js"],
    exclude: ["node_modules/**", "dist/**", "tests/e2e/**"],
    environment: "node",
  },
});
