import js from "@eslint/js";
import globals from "globals";

const GENERATED_PATHS = [
  "coverage/**",
  "dist/**",
  "node_modules/**",
  "playwright-report/**",
  "test-results/**",
];

export default [
  { ignores: GENERATED_PATHS },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },
    rules: {
      // JSX variable-use tracking requires eslint-plugin-react, which this
      // dependency-light repository does not install. Keep the core safety
      // rules active without reporting JSX-only imports as unused.
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
];
