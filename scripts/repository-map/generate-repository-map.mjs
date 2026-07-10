#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const outputPath = "docs/repository-map/repository-map.json";
const schemaPath = "docs/repository-map/repository-map.schema.json";
const generatedAt = new Date().toISOString();

const binaryExtensions = new Set([
  ".png",
  ".webp",
  ".mp4",
  ".otf",
  ".woff",
  ".woff2",
  ".ico",
]);

const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const textExtensions = new Set([
  ...sourceExtensions,
  ".css",
  ".json",
  ".md",
  ".html",
  ".yml",
  ".yaml",
  ".txt",
  ".tsv",
  ".csv",
  ".svg",
  ".gitignore",
]);
const localImportExtensions = [
  "",
  ".js",
  ".jsx",
  ".mjs",
  ".json",
  ".css",
  ".svg",
  ".png",
  ".webp",
  ".mp4",
  ".otf",
];

function runGit(args, { nullSeparated = false, optional = false } = {}) {
  try {
    const output = execFileSync("git", args, {
      cwd: rootDir,
      encoding: nullSeparated ? "buffer" : "utf8",
      stdio: ["ignore", "pipe", optional ? "ignore" : "pipe"],
    });
    if (nullSeparated) {
      return output
        .toString("utf8")
        .split("\0")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return String(output).trim();
  } catch (error) {
    if (optional) return null;
    throw error;
  }
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function absolutePath(relativePath) {
  return path.join(rootDir, relativePath);
}

function fileExists(relativePath) {
  return existsSync(absolutePath(relativePath));
}

function getHash(relativePath) {
  if (relativePath === outputPath) return null;
  return createHash("sha256").update(readFileSync(absolutePath(relativePath))).digest("hex");
}

function isBinary(relativePath) {
  return binaryExtensions.has(path.extname(relativePath).toLowerCase());
}

function readTextFile(relativePath) {
  if (isBinary(relativePath)) return "";
  const ext = path.extname(relativePath).toLowerCase();
  if (!textExtensions.has(ext) && path.basename(relativePath) !== "CNAME") return "";
  return readFileSync(absolutePath(relativePath), "utf8");
}

function getLineCount(text, binary) {
  if (binary) return null;
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).length;
}

function getLanguage(relativePath) {
  const ext = path.extname(relativePath).toLowerCase();
  const name = path.basename(relativePath);
  if (ext === ".js" || ext === ".mjs" || ext === ".cjs") return "JavaScript";
  if (ext === ".jsx") return "JSX";
  if (ext === ".ts") return "TypeScript";
  if (ext === ".tsx") return "TSX";
  if (ext === ".css") return "CSS";
  if (ext === ".json") return "JSON";
  if (ext === ".md") return "Markdown";
  if (ext === ".html") return "HTML";
  if (ext === ".yml" || ext === ".yaml") return "YAML";
  if (ext === ".svg") return "SVG";
  if (ext === ".png" || ext === ".webp") return "Image";
  if (ext === ".mp4") return "Video";
  if (ext === ".otf") return "Font";
  if (ext === ".tsv") return "TSV";
  if (ext === ".txt") return "Text";
  if (name === "CNAME") return "DNS";
  if (name === ".gitignore") return "Git ignore rules";
  return "Plain text";
}

function getCategory(relativePath) {
  const ext = path.extname(relativePath).toLowerCase();
  const name = path.basename(relativePath);
  if (relativePath.startsWith("reports/") || relativePath.includes("/reports/")) return "report";
  if (relativePath.startsWith("test-results/")) return "test-artifact";
  if (relativePath.startsWith("tests/") || /\.test\.(js|jsx|mjs|ts|tsx)$/.test(relativePath)) return "test";
  if (relativePath.startsWith("scripts/")) return relativePath.includes("/repository-map/") ? "documentation-tooling" : "script";
  if (sourceExtensions.has(ext)) return "source";
  if (ext === ".css") return "style";
  if (ext === ".json" || ext === ".tsv" || ext === ".csv") return "data";
  if (ext === ".md") return "documentation";
  if (relativePath.startsWith(".github/")) return "ci";
  if (relativePath.startsWith("public/") || [".png", ".webp", ".mp4", ".otf", ".svg"].includes(ext)) return "asset";
  if (["package.json", "package-lock.json", "vite.config.js", "vitest.config.js", "playwright.config.js", ".gitignore", "CNAME"].includes(name)) return "configuration";
  if (ext === ".html") return "entry";
  return "misc";
}

function getArea(relativePath) {
  if (relativePath.startsWith("docs/repository-map/") || relativePath.startsWith("scripts/repository-map/")) return "repository-map";
  if (relativePath.startsWith(".github/")) return "github-workflows";
  if (relativePath.startsWith("app/navigation/")) return "app-shell";
  if (relativePath.startsWith("app/HomePage") || relativePath.includes("home-page")) return "home";
  if (relativePath.startsWith("app/")) return "app-shell";
  if (relativePath.startsWith("components/ui/")) return "shared-ui";
  if (relativePath.startsWith("data/i18n/") || relativePath.startsWith("shared/i18n/")) return "i18n";
  if (relativePath.startsWith("features/crucible/")) return "crucible";
  if (relativePath.startsWith("features/darken-location/map-generator/")) return "map-generator";
  if (relativePath.startsWith("features/darken-location/composer/")) return "darken-location";
  if (relativePath.startsWith("features/darken-location/dungeon/")) return "darken-location";
  if (relativePath.startsWith("features/darken-location/")) return "darken-location";
  if (relativePath.startsWith("features/inspirations/")) return "inspirations";
  if (relativePath.startsWith("features/inspiration-studio/")) return "inspiration-studio";
  if (relativePath.startsWith("features/monster-composer/")) return "monster-composer";
  if (relativePath.startsWith("shared/content/content-packs/")) return "content-packs";
  if (relativePath.startsWith("shared/content/")) return "shared-content";
  if (relativePath.startsWith("shared/styles/")) return "styles-and-design-system";
  if (relativePath.startsWith("shared/accessibility/")) return "app-shell";
  if (relativePath.startsWith("shared/tooltips/")) return "app-shell";
  if (relativePath.startsWith("scripts/")) return "scripts-and-tooling";
  if (relativePath.startsWith("tests/")) return "tests-and-qa";
  if (relativePath.startsWith("public/")) return "public-assets";
  if (relativePath.startsWith("docs/content-packs/")) return "content-packs";
  if (relativePath.startsWith("docs/")) return "documentation";
  if (relativePath.startsWith("dev/")) return "dev-reference";
  if (relativePath.startsWith("reports/") || relativePath.includes("/reports/")) return "reference-reports";
  if (["index.html", "vite.config.js", "vitest.config.js", "playwright.config.js", "package.json", "package-lock.json"].includes(relativePath)) return "scripts-and-tooling";
  if (["README.md", "AGENTS.md", "CNAME", ".gitignore", "chatgpt-zip-apply-log.md"].includes(relativePath)) return "documentation";
  return "uncategorized";
}

function getLayer(relativePath, category) {
  if (category === "asset") return "asset";
  if (category === "style") return "style";
  if (category === "test" || category === "script") return "qa-tooling";
  if (category === "ci" || category === "configuration") return "configuration";
  if (category === "documentation" || category === "report") return "documentation";
  if (relativePath.includes("/components/") || /\.page\.jsx$/.test(relativePath) || relativePath.startsWith("app/")) return "ui";
  if (relativePath.includes("/model/")) return "domain-model";
  if (relativePath.includes("/data/") || relativePath.includes("/content-packs/")) return "data";
  if (relativePath.includes("registry") || relativePath.includes("schema") || relativePath.includes("validation")) return "contract";
  if (relativePath.includes("render")) return "renderer";
  if (relativePath.includes("pipeline") || relativePath.includes("generator")) return "orchestration";
  return "module";
}

function getStatus(relativePath, category) {
  if (relativePath.startsWith("tests/tests/")) return "legacy";
  if (relativePath === "scripts/map-generator.circle-anchors.test.js") return "reference-only";
  if (relativePath.includes("/legacy/") || relativePath.includes("styles-old")) return "legacy";
  if (relativePath.startsWith("reports/") || relativePath.includes("/reports/") || relativePath.startsWith("dev/")) return "reference-only";
  if (relativePath.startsWith("test-results/") || relativePath.includes("qa-report") || relativePath.includes("zip-apply-log")) return "generated";
  if (relativePath.includes("legacy-darken-location-pack") || relativePath.includes("adapter")) return "transitional";
  if (category === "asset" && relativePath.includes(".grissino-rename-log")) return "generated";
  return "current";
}

function inferRuntimeFlows(relativePath) {
  const flows = new Set();
  if (relativePath === "index.html" || relativePath === "app/main.jsx" || relativePath === "app/router.jsx" || relativePath === "app/AppShell.jsx") flows.add("application-startup");
  if (relativePath === "app/router.jsx" || relativePath.startsWith("app/navigation/")) flows.add("navigation");
  if (relativePath.startsWith("features/inspirations/") || relativePath.startsWith("shared/content/")) flows.add("inspiration-archive");
  if (relativePath.startsWith("features/darken-location/composer/") || relativePath.includes("darken-location.map-request")) flows.add("darken-location");
  if (relativePath.includes("darken-location.map-request") || relativePath.startsWith("features/darken-location/map-generator/")) flows.add("composer-to-map");
  if (relativePath.startsWith("features/darken-location/map-generator/") && !relativePath.includes("/reports/")) flows.add("map-generation");
  if (relativePath === "features/darken-location/map-generator/map-generator.page.jsx" || relativePath === "features/darken-location/map-generator/map-generator.render.jsx" || relativePath === "features/darken-location/map-generator/map-generator.state.js" || relativePath === "features/darken-location/map-generator/map-generator.export.js") flows.add("map-editor");
  if (relativePath.startsWith("features/monster-composer/")) flows.add("monster-composer");
  if (relativePath.includes("draft") || relativePath.includes("storage") || relativePath.includes("accessibility.settings")) flows.add("save-and-recovery");
  if (relativePath.includes("export") || relativePath.startsWith("scripts/export")) flows.add("export");
  if (relativePath.startsWith("features/inspiration-studio/")) flows.add("inspiration-studio");
  return [...flows];
}

function inferResponsibilities(relativePath, category, publicApi, content) {
  const area = getArea(relativePath);
  const base = [];
  if (category === "asset") base.push("Provides static media or font assets consumed by the browser build.");
  else if (category === "style") base.push("Defines CSS selectors and design tokens for the related UI area.");
  else if (category === "test") base.push("Exercises automated checks for the related runtime or domain area.");
  else if (category === "script" || category === "documentation-tooling") base.push("Provides a Node-based project utility or QA entry point.");
  else if (category === "documentation" || category === "report") base.push("Provides developer documentation or historical implementation evidence.");
  else if (category === "configuration" || category === "ci") base.push("Configures package tooling, deployment, CI, or repository behavior.");
  else base.push(`Implements ${area} runtime, model, data, or rendering behavior.`);

  if (publicApi.namedExports.length || publicApi.defaultExport) {
    base.push("Exposes public module API through ESM exports.");
  }
  if (content.includes("useState(") || content.includes("useMemo(") || content.includes("useEffect(")) {
    base.push("Owns React component state, derived values, or lifecycle effects.");
  }
  if (content.includes("localStorage")) base.push("Reads or writes browser localStorage state.");
  if (content.includes("addEventListener")) base.push("Registers runtime event listeners.");
  if (content.includes("writeFile") || content.includes("mkdir")) base.push("Writes generated artifacts from Node tooling.");
  return base;
}

function inferRole(relativePath, category, publicApi, _content) {
  const name = path.basename(relativePath);
  const area = getArea(relativePath);
  if (relativePath === "index.html") return "Browser HTML entry that mounts the Vite React application.";
  if (relativePath === "app/main.jsx") return "React bootstrap that applies global side effects and renders AppRouter into #root.";
  if (relativePath === "app/router.jsx") return "Custom route and top-level state coordinator for Cruor sections and Crucible tool views.";
  if (relativePath === "app/AppShell.jsx") return "Top-level application shell that renders the active workspace and global topbar.";
  if (name === "package.json") return "Node package manifest, dependency list, and script command registry.";
  if (name === "package-lock.json") return "npm lockfile pinning the installed dependency graph.";
  if (relativePath.startsWith(".github/workflows/")) return "GitHub Actions workflow entry for CI, build, test, or Pages deployment.";
  if (relativePath.startsWith("reports/") || relativePath.includes("/reports/")) return "Historical report artifact retained as reference evidence, not runtime code.";
  if (relativePath.includes("/legacy/")) return "Legacy implementation retained for reference or compatibility; not the primary current runtime path.";
  if (category === "asset") return `${getLanguage(relativePath)} asset for ${area}.`;
  if (category === "style") return `Stylesheet for ${area} UI surfaces and responsive states.`;
  if (category === "test") return `Automated test or QA file for ${area}.`;
  if (category === "script" || category === "documentation-tooling") return `Node script for ${area} generation, validation, diagnostics, or QA.`;
  if (category === "documentation") return `Developer documentation for ${area}.`;
  if (name.endsWith(".page.jsx")) return `React page component for ${area}.`;
  if (relativePath.includes("/components/") && name.endsWith(".jsx")) return `React component used by the ${area} UI.`;
  if (relativePath.includes("/model/")) return `Domain model helpers for ${area}.`;
  if (relativePath.includes("/data/")) return `Static data definitions for ${area}.`;
  if (relativePath.includes("registry")) return `Registry construction or access layer for ${area}.`;
  if (relativePath.includes("schema") || relativePath.includes("validation")) return `Schema or validation contract for ${area}.`;
  if (relativePath.includes("render")) return `Rendering helpers for ${area}.`;
  if (relativePath.includes("pipeline")) return `Pipeline orchestration for ${area}.`;
  if (publicApi.defaultExport?.kind === "function" || publicApi.defaultExport?.kind === "component") return `Default-exported component or function for ${area}.`;
  return `${getLanguage(relativePath)} file participating in ${area}.`;
}

function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1 ");
}

function parseImportSymbols(clause = "") {
  const symbols = [];
  const cleanClause = clause.trim();
  if (!cleanClause) return symbols;
  if (cleanClause.startsWith("{")) {
    return cleanClause
      .replace(/[{}]/g, "")
      .split(",")
      .map((item) => item.trim().split(/\s+as\s+/i)[0])
      .filter(Boolean);
  }
  const namedMatch = cleanClause.match(/\{([\s\S]*?)\}/);
  if (namedMatch) {
    symbols.push(
      ...namedMatch[1]
        .split(",")
        .map((item) => item.trim().split(/\s+as\s+/i)[0])
        .filter(Boolean),
    );
  }
  const defaultName = cleanClause.split(",")[0].trim();
  if (defaultName && !defaultName.startsWith("{") && !defaultName.startsWith("*")) symbols.unshift("default");
  if (cleanClause.includes("* as ")) symbols.push("*");
  return [...new Set(symbols)];
}

function splitExportList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, alias] = item.split(/\s+as\s+/i).map((part) => part.trim());
      return alias || name;
    })
    .filter((item) => item !== "default");
}

function parseImportsAndExports(relativePath, content) {
  if (!sourceExtensions.has(path.extname(relativePath).toLowerCase())) {
    return {
      imports: [],
      dynamicImports: [],
      publicApi: { defaultExport: null, namedExports: [], reExports: [] },
    };
  }

  const stripped = stripComments(content);
  const imports = [];
  const dynamicImports = [];
  const namedExports = new Map();
  let defaultExport = null;
  const reExports = [];

  const importRe = /\bimport\s+(?:([\s\S]*?)\s+from\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRe.exec(stripped))) {
    imports.push({
      source: match[2],
      kind: "static",
      symbols: parseImportSymbols(match[1] || ""),
      external: false,
      resolvedPath: null,
    });
  }

  const exportFromRe = /\bexport\s+(?:\*|\{([\s\S]*?)\})\s+from\s+["']([^"']+)["']/g;
  while ((match = exportFromRe.exec(stripped))) {
    const symbols = match[1] ? splitExportList(match[1]) : ["*"];
    imports.push({
      source: match[2],
      kind: "re-export",
      symbols,
      external: false,
      resolvedPath: null,
    });
    reExports.push({ source: match[2], symbols });
  }

  const dynamicRe = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((match = dynamicRe.exec(stripped))) {
    dynamicImports.push({
      source: match[1],
      kind: "dynamic",
      symbols: [],
      external: false,
      resolvedPath: null,
    });
  }

  const requireRe = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;
  while ((match = requireRe.exec(stripped))) {
    imports.push({
      source: match[1],
      kind: "require",
      symbols: [],
      external: false,
      resolvedPath: null,
    });
  }

  const declarationRe = /\bexport\s+(?:async\s+)?(function|class)\s+([A-Za-z_$][\w$]*)/g;
  while ((match = declarationRe.exec(stripped))) {
    namedExports.set(match[2], { name: match[2], kind: match[1], role: `Exported ${match[1]}.` });
  }

  const variableRe = /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  while ((match = variableRe.exec(stripped))) {
    namedExports.set(match[1], { name: match[1], kind: "constant", role: "Exported binding." });
  }

  const namedListRe = /\bexport\s+\{([\s\S]*?)\}(?!\s+from)/g;
  while ((match = namedListRe.exec(stripped))) {
    splitExportList(match[1]).forEach((name) => {
      namedExports.set(name, { name, kind: "binding", role: "Named export binding." });
    });
  }

  const defaultDeclarationRe = /\bexport\s+default\s+(?:async\s+)?(function|class)\s*([A-Za-z_$][\w$]*)?/;
  const defaultIdentifierRe = /\bexport\s+default\s+([A-Za-z_$][\w$]*)/;
  const defaultDeclaration = stripped.match(defaultDeclarationRe);
  if (defaultDeclaration) {
    defaultExport = {
      name: defaultDeclaration[2] || "default",
      kind: defaultDeclaration[1] === "function" && /^[A-Z]/.test(defaultDeclaration[2] || "") ? "component" : defaultDeclaration[1],
      role: "Default module export.",
    };
  } else {
    const defaultIdentifier = stripped.match(defaultIdentifierRe);
    if (defaultIdentifier) {
      defaultExport = {
        name: defaultIdentifier[1],
        kind: /^[A-Z]/.test(defaultIdentifier[1]) ? "component" : "binding",
        role: "Default module export.",
      };
    }
  }

  return {
    imports,
    dynamicImports,
    publicApi: {
      defaultExport,
      namedExports: [...namedExports.values()].sort((a, b) => a.name.localeCompare(b.name)),
      reExports,
    },
  };
}

function resolveLocalImport(fromPath, source, allPathSet) {
  if (!source || (!source.startsWith(".") && !source.startsWith("@/"))) return { external: true, resolvedPath: null };
  const fromDir = path.dirname(fromPath);
  const rawBase = source.startsWith("@/")
    ? path.join(rootDir, source.slice(2))
    : path.resolve(rootDir, fromDir, source);
  const candidates = [];
  localImportExtensions.forEach((ext) => {
    candidates.push(`${rawBase}${ext}`);
  });
  ["index.js", "index.jsx", "index.mjs", "index.json", "index.css"].forEach((indexName) => {
    candidates.push(path.join(rawBase, indexName));
  });
  for (const candidate of candidates) {
    const relativeCandidate = toPosix(path.relative(rootDir, candidate));
    if (allPathSet.has(relativeCandidate) || existsSync(candidate)) {
      return { external: false, resolvedPath: relativeCandidate };
    }
  }
  return { external: false, resolvedPath: null };
}

function detectSideEffects(relativePath, content) {
  const sideEffects = new Set();
  const browserApis = new Set();
  if (!content) return { sideEffects: [], browserApis: [] };

  if (content.includes("localStorage")) {
    sideEffects.add("Reads or writes browser localStorage.");
    browserApis.add("localStorage");
  }
  if (content.includes("sessionStorage")) {
    sideEffects.add("Reads or writes browser sessionStorage.");
    browserApis.add("sessionStorage");
  }
  if (content.includes("addEventListener")) {
    sideEffects.add("Registers event listeners.");
    if (content.includes("window.addEventListener")) browserApis.add("window events");
    if (content.includes("document.addEventListener")) browserApis.add("document events");
  }
  if (content.includes("window.history") || content.includes("pushState") || content.includes("replaceState")) {
    sideEffects.add("Mutates browser history or URL state.");
    browserApis.add("history");
  }
  if (content.includes("navigator.clipboard")) {
    sideEffects.add("Uses clipboard write/read APIs.");
    browserApis.add("clipboard");
  }
  if (content.includes("document.createElement") || content.includes("document.body") || content.includes("querySelector")) {
    sideEffects.add("Creates or queries DOM nodes directly.");
    browserApis.add("DOM");
  }
  if (content.includes("new Blob") || content.includes("Blob(")) {
    sideEffects.add("Creates Blob objects for export/download.");
    browserApis.add("Blob");
  }
  if (content.includes("URL.createObjectURL") || content.includes("URL.revokeObjectURL")) {
    sideEffects.add("Creates or revokes object URLs.");
    browserApis.add("URL");
  }
  if (content.includes("setTimeout") || content.includes("setInterval") || content.includes("requestAnimationFrame")) {
    sideEffects.add("Uses timers or animation frames.");
    browserApis.add("timers");
  }
  if (content.includes("window.confirm")) {
    sideEffects.add("Displays blocking browser confirmation dialogs.");
    browserApis.add("window.confirm");
  }
  if (content.includes("window.open")) {
    sideEffects.add("Opens a secondary browser window.");
    browserApis.add("window.open");
  }
  if (/\b(writeFile|writeFileSync|mkdir|mkdirSync)\b/.test(content)) {
    sideEffects.add("Writes files from Node tooling.");
  }
  if (content.includes("execFileSync") || content.includes("spawn") || content.includes("child_process")) {
    sideEffects.add("Runs child processes from Node tooling.");
  }
  if (content.includes("process.env") || content.includes("process.argv")) {
    sideEffects.add("Reads process environment or command-line arguments.");
  }
  if (content.includes("console.")) {
    sideEffects.add("Writes command-line or browser console output.");
  }
  if (relativePath.endsWith(".css")) {
    sideEffects.add("Applies global CSS selectors when imported.");
  }
  return { sideEffects: [...sideEffects].sort(), browserApis: [...browserApis].sort() };
}

function inferStateOwnership(relativePath, content) {
  const ownership = new Set();
  if (content.includes("useState(")) ownership.add("React local component state");
  if (content.includes("useReducer(")) ownership.add("React reducer state");
  if (content.includes("useRef(")) ownership.add("React mutable refs");
  if (content.includes("localStorage")) ownership.add("Browser localStorage state");
  if (relativePath === "app/router.jsx") ownership.add("URL route state and top-level tool selection state");
  if (relativePath.includes("location-composer-state")) ownership.add("Darken location composer state model");
  if (relativePath.includes("location-composer-draft")) ownership.add("Darken location draft persistence state");
  if (relativePath.includes("map-generator.state")) ownership.add("Map editor manual override state schema");
  if (relativePath.includes("registry") || relativePath.includes("content-pack")) ownership.add("Shared content registry data");
  if (relativePath.includes("monster-composer.page")) ownership.add("Monster frame, selected graft, view, navigator, and export UI state");
  if (relativePath.includes("InspirationStudioPage")) ownership.add("Inspiration Studio draft, filters, modal, and rail UI state");
  return [...ownership].sort();
}

function inferDataConsumed(relativePath, imports, content) {
  const values = new Set();
  imports.forEach((item) => {
    if (item.source.includes("content")) values.add("Shared content registry or content-pack data");
    if (item.source.includes("map-generator")) values.add("Map generation models or geometry data");
    if (item.source.includes("monster")) values.add("Monster Composer graft, frame, rules, or QA data");
    if (item.source.includes("i18n")) values.add("Locale dictionaries and translation helpers");
  });
  if (content.includes("process.argv")) values.add("Command-line arguments");
  if (content.includes("initialRequest")) values.add("Initial map request payload");
  if (content.includes("localStorage")) values.add("Persisted browser storage values");
  return [...values];
}

function inferDataProduced(relativePath, publicApi, content) {
  const values = new Set();
  if (publicApi.namedExports.length || publicApi.defaultExport) values.add("ES module exports consumed by other files");
  if (content.includes("JSON.stringify")) values.add("Serialized JSON payloads");
  if (content.includes("renderToStaticMarkup") || relativePath.includes("render")) values.add("Rendered HTML/SVG or React elements");
  if (content.includes("createMapRequest")) values.add("Map request payloads");
  if (content.includes("generateMap")) values.add("Generated map model data");
  if (content.includes("buildExport") || relativePath.includes("export")) values.add("Export payloads or downloaded files");
  if (content.includes("validate")) values.add("Validation reports or issue lists");
  return [...values];
}

function inferTests(relativePath, recordsByPath) {
  const tests = [];
  const basename = path.basename(relativePath).replace(/\.(jsx|js|mjs|css|json|md)$/, "");
  recordsByPath.forEach((record) => {
    if (record.path === relativePath) return;
    const isTest = record.category === "test" || record.path.startsWith("scripts/run-") || record.path.includes("/qa/");
    if (!isTest) return;
    const text = record.generated?.sourceText || "";
    if (text.includes(relativePath) || text.includes(`/${basename}`) || text.includes(basename)) {
      tests.push({
        path: record.path,
        coverage: "Imports or references this file, adjacent basename, or related QA target.",
      });
    }
  });
  return tests.slice(0, 12);
}

function getRisk(relativePath, importedBy, sideEffects, category) {
  if (relativePath === "app/router.jsx" || relativePath === "features/darken-location/map-generator/map-generator.page.jsx") {
    return {
      changeRisk: "critical",
      changeRiskReasons: ["Central runtime coordinator with broad state and side-effect responsibilities."],
    };
  }
  if (
    relativePath.includes("map-generator.pipeline") ||
    relativePath.includes("map-generator.render") ||
    relativePath.includes("map-generator.corridors") ||
    relativePath.includes("monster-composer.page") ||
    relativePath.includes("shared/content/registry") ||
    importedBy.length > 8
  ) {
    return {
      changeRisk: "high",
      changeRiskReasons: ["High fan-in, core runtime flow ownership, or geometry/rendering complexity."],
    };
  }
  if (importedBy.length > 3 || sideEffects.length > 2 || category === "configuration") {
    return {
      changeRisk: "medium",
      changeRiskReasons: ["Multiple dependents, browser/Node side effects, or project tooling impact."],
    };
  }
  return { changeRisk: "low", changeRiskReasons: [] };
}

function isGeneratedFile(relativePath, status, category) {
  if (status === "generated" || category === "test-artifact") return true;
  if (relativePath.startsWith("reports/") || relativePath.includes("/reports/")) return true;
  if (relativePath === "package-lock.json") return true;
  if (relativePath === outputPath) return true;
  return false;
}

function getGeneratedInfo(relativePath, generated) {
  if (!generated) return null;
  if (relativePath === outputPath) {
    return { generator: "npm run docs:repo-map", manualEditAllowed: false };
  }
  if (relativePath === "package-lock.json") {
    return { generator: "npm install / npm update", manualEditAllowed: false };
  }
  if (relativePath.startsWith("reports/") || relativePath.includes("/reports/")) {
    return { generator: "Historical QA or implementation scripts; exact generator varies by report.", manualEditAllowed: false };
  }
  if (relativePath.startsWith("test-results/")) {
    return { generator: "Playwright test runner", manualEditAllowed: false };
  }
  return { generator: "Project tooling", manualEditAllowed: false };
}

function getManualDocumentation(previous, fallback) {
  const previousDoc = previous?.documentation || {};
  return {
    intentionallyDoesNotOwn: previousDoc.intentionallyDoesNotOwn || fallback.intentionallyDoesNotOwn || [],
    notes: previousDoc.notes || fallback.notes || [],
    findings: previousDoc.findings || fallback.findings || [],
  };
}

function buildDependencyGraph(records) {
  const edges = [];
  records.forEach((record) => {
    record.imports
      .filter((item) => !item.external && item.resolvedPath)
      .forEach((item) => edges.push({ from: record.path, to: item.resolvedPath, kind: item.kind }));
  });

  const adjacency = new Map();
  edges.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push(edge.to);
  });

  const cycles = [];
  const visiting = new Set();
  const visited = new Set();
  const stack = [];

  function visit(node) {
    if (visiting.has(node)) {
      const index = stack.indexOf(node);
      if (index >= 0) cycles.push([...stack.slice(index), node]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    stack.push(node);
    (adjacency.get(node) || []).forEach(visit);
    stack.pop();
    visiting.delete(node);
    visited.add(node);
  }

  records.forEach((record) => visit(record.path));

  const fanIn = new Map();
  const fanOut = new Map();
  edges.forEach((edge) => {
    fanIn.set(edge.to, (fanIn.get(edge.to) || 0) + 1);
    fanOut.set(edge.from, (fanOut.get(edge.from) || 0) + 1);
  });

  function topCounts(map) {
    return [...map.entries()]
      .map(([file, count]) => ({ file, count }))
      .sort((a, b) => b.count - a.count || a.file.localeCompare(b.file))
      .slice(0, 20);
  }

  return {
    edges,
    cycles: cycles.slice(0, 50),
    highFanIn: topCounts(fanIn),
    highFanOut: topCounts(fanOut),
  };
}

function getIncludedFiles() {
  const tracked = runGit(["ls-files", "-z"], { nullSeparated: true });
  const supplemental = runGit(
    ["ls-files", "-z", "--others", "--exclude-standard", "docs/repository-map", "scripts/repository-map"],
    { nullSeparated: true, optional: true },
  ) || [];
  return {
    tracked,
    supplemental,
    all: [...new Set([...tracked, ...supplemental])].filter(fileExists).sort(),
  };
}

function loadPreviousMap() {
  if (!existsSync(absolutePath(outputPath))) return new Map();
  try {
    const parsed = JSON.parse(readFileSync(absolutePath(outputPath), "utf8"));
    return new Map((parsed.files || []).map((record) => [record.path, record]));
  } catch {
    return new Map();
  }
}

function getCounts(records, trackedCount) {
  const byCategory = {};
  const byExtension = {};
  const byArea = {};
  records.forEach((record) => {
    byCategory[record.category] = (byCategory[record.category] || 0) + 1;
    byExtension[record.extension || "(none)"] = (byExtension[record.extension || "(none)"] || 0) + 1;
    byArea[record.area] = (byArea[record.area] || 0) + 1;
  });
  return {
    trackedFiles: trackedCount,
    records: records.length,
    sourceFiles: records.filter((record) => record.category === "source").length,
    assets: records.filter((record) => record.category === "asset").length,
    testsAndQa: records.filter((record) => record.category === "test" || record.category === "script").length,
    documentationFiles: records.filter((record) => record.category === "documentation").length,
    byCategory,
    byExtension,
    byArea,
  };
}

function packageScripts() {
  try {
    const pkg = JSON.parse(readFileSync(absolutePath("package.json"), "utf8"));
    return pkg.scripts || {};
  } catch {
    return {};
  }
}

function buildMap() {
  const { tracked, supplemental, all } = getIncludedFiles();
  const allPathSet = new Set(all);
  const previousByPath = loadPreviousMap();
  const initialRecords = all.map((relativePath) => {
    const binary = isBinary(relativePath);
    const content = readTextFile(relativePath);
    const ext = path.extname(relativePath);
    const category = getCategory(relativePath);
    const area = getArea(relativePath);
    const status = getStatus(relativePath, category);
    const layer = getLayer(relativePath, category);
    const { imports, dynamicImports, publicApi } = parseImportsAndExports(relativePath, content);
    const resolvedImports = [...imports, ...dynamicImports].map((item) => {
      const resolved = resolveLocalImport(relativePath, item.source, allPathSet);
      return { ...item, ...resolved };
    });
    const sideEffectInfo = detectSideEffects(relativePath, content);
    const generated = isGeneratedFile(relativePath, status, category);
    const previous = previousByPath.get(relativePath);
    const role = previous?.role || inferRole(relativePath, category, publicApi, content);
    const responsibilities = previous?.responsibilities?.length
      ? previous.responsibilities
      : inferResponsibilities(relativePath, category, publicApi, content);
    const documentation = getManualDocumentation(previous, {});

    return {
      path: relativePath,
      name: path.basename(relativePath),
      extension: ext || "",
      language: getLanguage(relativePath),
      category,
      area,
      status,
      role,
      responsibilities,
      architecturalLayer: layer,
      entryPoint:
        relativePath === "index.html" ||
        relativePath === "app/main.jsx" ||
        relativePath === "app/router.jsx" ||
        relativePath.startsWith(".github/workflows/") ||
        relativePath.startsWith("scripts/") ||
        relativePath === "vite.config.js" ||
        relativePath === "vitest.config.js" ||
        relativePath === "playwright.config.js",
      publicApi,
      imports: resolvedImports,
      importedBy: [],
      dataConsumed: inferDataConsumed(relativePath, resolvedImports, content),
      dataProduced: inferDataProduced(relativePath, publicApi, content),
      sideEffects: sideEffectInfo.sideEffects,
      browserApis: sideEffectInfo.browserApis,
      stateOwnership: inferStateOwnership(relativePath, content),
      runtimeFlows: inferRuntimeFlows(relativePath),
      relatedFiles: [],
      tests: [],
      changeRisk: "low",
      changeRiskReasons: [],
      generated,
      vendored: false,
      referenceOnly: status === "reference-only",
      legacy: status === "legacy",
      deprecated: false,
      confidence: resolvedImports.some((item) => !item.external && !item.resolvedPath) ? "medium" : "high",
      notes: documentation.notes,
      findings: documentation.findings,
      generatedInfo: getGeneratedInfo(relativePath, generated),
      documentation,
      generatedFields: {
        hash: getHash(relativePath),
        bytes: readFileSync(absolutePath(relativePath)).byteLength,
        lineCount: getLineCount(content, binary),
        binary,
        tracked: tracked.includes(relativePath),
        supplemental: supplemental.includes(relativePath),
        generatedAt,
      },
      // Used only during this run to infer test references. Removed before writing.
      _sourceText: content,
    };
  });

  const recordsByPath = new Map(initialRecords.map((record) => [record.path, record]));
  initialRecords.forEach((record) => {
    record.imports.forEach((item) => {
      if (item.external || !item.resolvedPath) return;
      const target = recordsByPath.get(item.resolvedPath);
      if (!target) return;
      target.importedBy.push({ path: record.path, symbols: item.symbols || [] });
    });
  });

  initialRecords.forEach((record) => {
    const risk = getRisk(record.path, record.importedBy, record.sideEffects, record.category);
    record.changeRisk = risk.changeRisk;
    record.changeRiskReasons = risk.changeRiskReasons;
    record.tests = inferTests(record.path, new Map(initialRecords.map((item) => [
      item.path,
      { ...item, generated: { sourceText: item._sourceText }, category: item.category },
    ])));
    record.relatedFiles = record.imports
      .filter((item) => !item.external && item.resolvedPath)
      .slice(0, 12)
      .map((item) => ({ path: item.resolvedPath, relationship: `${item.kind} import` }));
    record.generated = isGeneratedFile(record.path, record.status, record.category);
    delete record._sourceText;
  });

  const dependencyGraph = buildDependencyGraph(initialRecords);
  const commit = runGit(["rev-parse", "HEAD"]);
  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  const counts = getCounts(initialRecords, tracked.length);

  return {
    metadata: {
      schemaVersion: "cruor-repository-map-v1",
      generatedAt,
      inspectedCommit: commit,
      branch,
      trackedFileCount: tracked.length,
      supplementalUntrackedFiles: supplemental,
      generator: "scripts/repository-map/generate-repository-map.mjs",
      schemaPath,
      packageScripts: packageScripts(),
      counts,
      notes: [
        "Structural fields are generated from Git inventory and file contents.",
        "Semantic fields are generated as a maintainable baseline and can be manually refined; the generator preserves manual documentation notes/findings.",
        "docs/repository-map/repository-map.json is self-referential, so its own hash is intentionally null.",
      ],
    },
    files: initialRecords,
    dependencyGraph,
  };
}

function main() {
  const map = buildMap();
  mkdirSync(path.dirname(absolutePath(outputPath)), { recursive: true });
  writeFileSync(absolutePath(outputPath), `${JSON.stringify(map, null, 2)}\n`, "utf8");
  console.log(
    `Repository map generated: ${map.files.length} records (${map.metadata.trackedFileCount} Git-tracked files).`,
  );
  console.log(`Output: ${outputPath}`);
}

main();
