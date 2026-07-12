#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT_PATH), "../..");
const OUTPUT_DIR = path.join(ROOT, "docs/design-system/audit");
const CSS_OUTPUT = path.join(OUTPUT_DIR, "css-inventory.json");
const TOKEN_OUTPUT = path.join(OUTPUT_DIR, "token-inventory.json");
const TOKEN_MARKDOWN_OUTPUT = path.join(OUTPUT_DIR, "token-inventory.md");
const SOURCE_COMMIT = "be61f98fd2537d367c757bf9796b11735bc7d193";
const SOURCE_BRANCH = "refactor/sitewide-design-system";

const CHECK_MODE = process.argv.includes("--check");
const POSIX = path.posix;
const STYLE_EXTENSIONS = new Set([".css", ".pcss", ".postcss"]);
const MODULE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];
const RESOLUTION_EXTENSIONS = [...MODULE_EXTENSIONS, ...STYLE_EXTENSIONS, ".json", ".svg"];
const ANALYSIS_EXTENSIONS = new Set([
  ...STYLE_EXTENSIONS,
  ...MODULE_EXTENSIONS,
  ".html",
  ".htm",
  ".svg",
]);
const CANONICAL_TOKEN_FILES = new Set([
  "shared/styles/colors.css",
  "shared/styles/theme.css",
  "shared/styles/typography.css",
]);
const EXCLUDED_PREFIXES = [
  "dist/",
  "coverage/",
  "node_modules/",
  "playwright-report/",
  "test-results/",
  ".cache/",
  ".vite/",
  "docs/",
  "reports/",
  "scripts/design-system-audit/",
];

const ROUTE_SURFACES = [
  { id: "home", route: "/", entry: "app/HomePage.jsx" },
  {
    id: "dark-places",
    route: "/darkplaces",
    entry: "features/darken-location/composer/darken-location-composer.index.js",
  },
  {
    id: "dark-places-map",
    route: "/darkplaces/map",
    entry: "features/darken-location/map-generator/map-generator.index.js",
  },
  {
    id: "terrifying-monsters",
    route: "/terrifyingmonsters",
    entry: "features/monster-composer/monster-composer.index.js",
  },
  {
    id: "inspirations",
    route: "/inspirations",
    entry: "features/inspirations/inspirations.index.js",
  },
  {
    id: "inspiration-studio",
    route: "/inspiration-studio",
    entry: "features/inspiration-studio/inspiration-studio.index.js",
  },
  {
    id: "crucible-shell",
    route: "?section=crucible",
    entry: "features/crucible/components/CrucibleTopbar.jsx",
  },
];

const VISUAL_PROPERTY_PATTERN =
  /^(?:background(?:-color|-image)?|color|fill|stroke|outline(?:-color|-width)?|border(?:-(?:top|right|bottom|left))?(?:-color|-width|-style|-radius)?|box-shadow|text-shadow|filter|backdrop-filter|opacity|margin(?:-(?:top|right|bottom|left))?|padding(?:-(?:top|right|bottom|left))?|gap|row-gap|column-gap|inset(?:-(?:block|inline)(?:-start|-end)?)?|top|right|bottom|left|width|height|min-width|max-width|min-height|max-height|font-size|font-family|font-weight|line-height|letter-spacing|transition(?:-[\w-]+)?|animation(?:-[\w-]+)?|z-index|scrollbar-width|scrollbar-color)$/i;
const COLOR_NAMES = [
  "transparent",
  "currentcolor",
  "black",
  "white",
  "red",
  "green",
  "blue",
  "gray",
  "grey",
  "silver",
  "maroon",
  "purple",
  "fuchsia",
  "lime",
  "olive",
  "yellow",
  "navy",
  "teal",
  "aqua",
  "orange",
  "aliceblue",
  "rebeccapurple",
];
const RAW_CATEGORY_ORDER = [
  "color",
  "gradient",
  "shadow",
  "border",
  "radius",
  "opacity",
  "spacing",
  "sizing",
  "font-size",
  "line-height",
  "font-family",
  "motion-duration",
  "motion-easing",
  "effect",
  "z-index",
  "scrollbar",
];

function git(args, encoding = "utf8") {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding,
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
}

function toPosix(value) {
  return value.replaceAll(path.sep, "/");
}

function compareText(a, b) {
  return String(a).localeCompare(String(b), "en");
}

function sortByLocation(a, b) {
  return (
    compareText(a.file ?? a.from ?? "", b.file ?? b.from ?? "") ||
    (a.line ?? 0) - (b.line ?? 0) ||
    (a.column ?? 0) - (b.column ?? 0) ||
    compareText(a.name ?? a.to ?? a.value ?? "", b.name ?? b.to ?? b.value ?? "")
  );
}

function uniqueSorted(values) {
  return [...new Set(values)].sort(compareText);
}

function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, " ");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isStyleFile(file) {
  return STYLE_EXTENSIONS.has(POSIX.extname(file).toLowerCase());
}

function isModuleFile(file) {
  return MODULE_EXTENSIONS.includes(POSIX.extname(file).toLowerCase());
}

function isExternalSpecifier(specifier) {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(specifier);
}

function isExcludedAnalysisFile(file) {
  return EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function sourceScope(file) {
  if (file.startsWith("tests/") || /\.test\.[^.]+$/.test(file) || /\.spec\.[^.]+$/.test(file)) {
    return "test-or-qa";
  }
  if (file.startsWith("scripts/")) return "tooling";
  if (file.startsWith("public/") || POSIX.extname(file).toLowerCase() === ".svg") {
    return "public-or-svg-asset";
  }
  if (
    file === "index.html" ||
    file.startsWith("app/") ||
    file.startsWith("features/") ||
    file.startsWith("shared/") ||
    file.startsWith("components/")
  ) {
    return "browser-runtime-source";
  }
  return "support-source";
}

function buildLineStarts(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") starts.push(index + 1);
  }
  return starts;
}

function lineAndColumn(lineStarts, index) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (lineStarts[middle] <= index) low = middle + 1;
    else high = middle - 1;
  }
  const lineIndex = Math.max(0, high);
  return { line: lineIndex + 1, column: index - lineStarts[lineIndex] + 1 };
}

function maskComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\r\n]/g, " "));
}

function parseCssBlocks(text) {
  const masked = maskComments(text);
  const blocks = [];
  const stack = [];
  let boundary = 0;
  let quote = null;
  let escaped = false;
  let parentheses = 0;
  let brackets = 0;

  for (let index = 0; index < masked.length; index += 1) {
    const character = masked[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(") parentheses += 1;
    else if (character === ")") parentheses = Math.max(0, parentheses - 1);
    else if (character === "[") brackets += 1;
    else if (character === "]") brackets = Math.max(0, brackets - 1);

    if (parentheses || brackets) continue;

    if (character === "{") {
      const prelude = normalizeWhitespace(masked.slice(boundary, index));
      const block = {
        prelude,
        open: index,
        close: masked.length,
        type: prelude.startsWith("@") ? "at-rule" : "rule",
        ancestorAtRules: stack
          .map((entry) => entry.prelude)
          .filter((entry) => entry.startsWith("@")),
      };
      blocks.push(block);
      stack.push(block);
      boundary = index + 1;
    } else if (character === "}") {
      const block = stack.pop();
      if (block) block.close = index;
      boundary = index + 1;
    } else if (character === ";") {
      boundary = index + 1;
    }
  }
  return blocks;
}

function selectorContextAt(blocks, index) {
  let selected = null;
  for (const block of blocks) {
    if (block.type !== "rule") continue;
    if (block.open < index && block.close >= index) {
      if (!selected || block.open > selected.open) selected = block;
    }
  }
  return selected?.prelude ?? null;
}

function broadSelectorReasons(selector) {
  const reasons = [];
  if (/(^|[\s>+~,(]):root(?=$|[\s>+~.#:[(])/i.test(selector)) reasons.push("root-selector");
  if (/(^|[\s>+~,(])(?:html|body)(?=$|[\s>+~.#:[(])/i.test(selector)) {
    reasons.push("document-element-selector");
  }
  if (/(^|[\s>+~,(])\*(?=$|[\s>+~.#:[(])/.test(selector)) reasons.push("universal-selector");
  const rawElementPattern =
    /(^|[\s>+~,(])(?:a|article|aside|button|canvas|dialog|div|fieldset|footer|form|h[1-6]|header|img|input|label|legend|li|main|nav|ol|option|p|section|select|span|svg|table|tbody|td|textarea|th|thead|tr|ul)(?=$|[\s>+~.#:[(])/i;
  if (rawElementPattern.test(selector)) reasons.push("raw-html-element-selector");
  return uniqueSorted(reasons);
}

function parseModuleImports(text) {
  const found = [];
  const addMatches = (regex, kind, sourceGroup) => {
    regex.lastIndex = 0;
    for (let match = regex.exec(text); match; match = regex.exec(text)) {
      const specifier = match[sourceGroup];
      const specifierOffset = match[0].lastIndexOf(specifier);
      found.push({ specifier, kind, index: match.index + Math.max(0, specifierOffset) });
    }
  };

  addMatches(/\bimport\s*(["'])([^"']+)\1/g, "esm-side-effect", 2);
  addMatches(/\b(?:import|export)\s+(?!\()[\s\S]*?\bfrom\s*(["'])([^"']+)\1/g, "esm-static", 2);
  addMatches(/\bimport\s*\(\s*(["'])([^"']+)\1\s*\)/g, "esm-dynamic", 2);
  addMatches(/\brequire\s*\(\s*(["'])([^"']+)\1\s*\)/g, "commonjs-require", 2);

  const seen = new Set();
  return found
    .filter((entry) => {
      const key = `${entry.index}\u0000${entry.specifier}\u0000${entry.kind}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.index - b.index || compareText(a.specifier, b.specifier));
}

function parseCssImports(text) {
  const imports = [];
  const regex = /@import\s+(?:url\(\s*)?(?:(['"])(.*?)\1|([^;\s)]+))\s*\)?[^;]*;/gi;
  for (let match = regex.exec(text); match; match = regex.exec(text)) {
    const specifier = match[2] || match[3];
    const offset = match[0].indexOf(specifier);
    imports.push({ specifier, kind: "css-at-import", index: match.index + Math.max(0, offset) });
  }
  return imports;
}

function parseHtmlImports(text) {
  const imports = [];
  const scriptRegex = /<script\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi;
  const styleRegex =
    /<link\b(?=[^>]*\brel\s*=\s*(["'])stylesheet\1)[^>]*\bhref\s*=\s*(["'])(.*?)\2[^>]*>/gi;
  for (let match = scriptRegex.exec(text); match; match = scriptRegex.exec(text)) {
    imports.push({
      specifier: match[2],
      kind: "html-module-script",
      index: match.index + match[0].indexOf(match[2]),
    });
  }
  for (let match = styleRegex.exec(text); match; match = styleRegex.exec(text)) {
    imports.push({
      specifier: match[3],
      kind: "html-stylesheet-link",
      index: match.index + match[0].indexOf(match[3]),
    });
  }
  return imports.sort((a, b) => a.index - b.index);
}

function inferOwners(file) {
  if (file.startsWith("shared/styles/")) return ["shared-design-system"];
  if (file === "app/app-shell.css" || file.startsWith("app/navigation/"))
    return ["application-shell"];
  if (file.startsWith("app/home-page")) return ["home"];
  if (file.startsWith("features/crucible/")) return ["crucible-shell"];
  if (file.startsWith("features/darken-location/composer/")) return ["dark-places"];
  if (file.startsWith("features/darken-location/map-generator/")) return ["dark-places-map"];
  if (file.startsWith("features/monster-composer/")) return ["terrifying-monsters"];
  if (file.startsWith("features/inspirations/")) return ["inspirations"];
  if (file.startsWith("features/inspiration-studio/")) return ["inspiration-studio"];
  return ["unassigned"];
}

function inferStylesheetRole(file, runtimeStatus) {
  if (/\b(?:old|legacy|archive|unused)\b/i.test(file.replaceAll("-", " "))) {
    return {
      kind: "legacy-candidate",
      confidence: "medium",
      basis:
        "Heuristic filename marker; import reachability is recorded separately and must be checked before removal.",
    };
  }
  if (runtimeStatus !== "runtime-reachable") {
    return {
      kind: "apparently-unreferenced-or-reference",
      confidence: "medium",
      basis: "No confirmed path from index.html/app/main.jsx through tracked static imports.",
    };
  }
  if (file.startsWith("shared/styles/")) {
    return {
      kind: "shared",
      confidence: "high",
      basis: "Path and confirmed runtime import graph.",
    };
  }
  if (file === "app/app-shell.css" || file.startsWith("app/navigation/")) {
    return {
      kind: "global-shell",
      confidence: "high",
      basis: "Application-shell path and runtime graph.",
    };
  }
  return {
    kind: "feature-specific",
    confidence: "high",
    basis: "Feature/app page path and runtime graph.",
  };
}

function inferTokenRole(name, definitions) {
  const files = uniqueSorted(definitions.map((definition) => definition.file));
  const joined = files.join(" ");
  const componentPattern =
    /(?:button|control|panel|card|input|textarea|select|dropdown|tooltip|badge|chip|tab|modal|dialog|menu|notice|sidebar|scroll)/i;
  const layoutPattern =
    /(?:width|height|gap|size|padding|pad|column|row|rail|stage|workspace|max|min|inset|offset|top|right|bottom|left|grid)/i;
  const visualPattern =
    /(?:color|surface|bg|background|text|muted|faint|line|border|shadow|accent|danger|warning|success|info|glow|radius|opacity|transition|font)/i;
  const domainPattern =
    /(?:map|room|corridor|anatomy|region|connector|node|slot|flow|brief|silhouette|meter)/i;

  if (joined.includes("shared/styles/colors.css")) {
    if (/^--cruor-(?:rgb|color-(?:hex|.+-a\d+)|gradient|shadow|filter)/i.test(name)) {
      return "global-primitive-token";
    }
    return "global-semantic-token";
  }
  if (joined.includes("shared/styles/typography.css")) return "global-primitive-token";
  if (joined.includes("shared/styles/theme.css")) {
    if (componentPattern.test(name)) return "component-token";
    if (layoutPattern.test(name)) return "layout-token";
    return "global-semantic-token";
  }
  if (joined.includes("shared/styles/")) {
    if (componentPattern.test(name)) return "component-token";
    if (layoutPattern.test(name)) return "layout-token";
    return "global-semantic-token";
  }
  if (joined.includes("features/") || joined.includes("app/")) {
    if (domainPattern.test(name) && !visualPattern.test(name)) return "feature-domain-token";
    if (layoutPattern.test(name)) return "layout-token";
    if (
      componentPattern.test(name) &&
      !/^(?:--studio|--inspirations|--monster|--location|--home)/i.test(name)
    ) {
      return "component-token";
    }
    if (visualPattern.test(name)) return "page-specific-visual-token";
    return "feature-domain-token";
  }
  return "feature-domain-token";
}

function tokenMigrationTarget(category, role) {
  if (category === "unresolved-or-undefined")
    return "resolve-definition-or-document-external-contract-before-migration";
  if (category === "deprecated-or-apparently-unused")
    return "verify-runtime-and-test-consumers-before-deprecation";
  if (category === "alias") return "retain-as-compatibility-alias-until-consumers-migrate";
  if (role === "global-primitive-token") return "shared/styles/tokens/appropriate-primitive-family";
  if (role === "global-semantic-token") return "shared/styles/tokens/semantic-alias-layer";
  if (role === "component-token") return "shared/styles/components/owning-component-family";
  if (role === "layout-token") return "retain-near-owning-layout-unless-cross-route-use-is-proven";
  if (role === "page-specific-visual-token")
    return "compare-with-shared-semantic-or-component-token-before-keeping-local";
  return "retain-in-feature-domain-unless-a-cross-feature-contract-is-proven";
}

function extractBalancedFunctions(value, namePattern) {
  const results = [];
  const regex = new RegExp(`(?:${namePattern})\\s*\\(`, "gi");
  for (let match = regex.exec(value); match; match = regex.exec(value)) {
    let depth = 0;
    let quote = null;
    let escaped = false;
    let end = match.index;
    for (let index = match.index; index < value.length; index += 1) {
      const character = value[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'") quote = character;
      else if (character === "(") depth += 1;
      else if (character === ")") {
        depth -= 1;
        if (depth === 0) {
          end = index + 1;
          break;
        }
      }
    }
    if (end > match.index)
      results.push({ value: value.slice(match.index, end), index: match.index });
  }
  return results;
}

function rawClassification(category, value, occurrences) {
  const allDomainOrSvg = occurrences.every(
    (occurrence) =>
      occurrence.file.includes("map-generator/") ||
      occurrence.file.includes("anatomy") ||
      occurrence.sourceScope === "public-or-svg-asset"
  );
  if (allDomainOrSvg) return "feature-domain-or-svg-value-review";
  if (occurrences.length === 1) return "one-off-value-requiring-review";
  if (
    ["spacing", "sizing", "border"].includes(category) &&
    /^(?:0|1px|100%|100vh|100vw|auto|calc\(|clamp\()/i.test(value)
  ) {
    return "structural-or-mathematical-value";
  }
  if (["spacing", "sizing"].includes(category)) return "candidate-layout-or-sizing-token";
  return "likely-design-token";
}

function markdownTable(headers, rows) {
  if (!rows.length) return "_None found._";
  const escape = (value) => String(value).replaceAll("|", "\\|").replace(/\r?\n/g, " ");
  const head = `| ${headers.map(escape).join(" | ")} |`;
  const rule = `| ${headers.map(() => "---").join(" | ")} |`;
  return [head, rule, ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`)].join("\n");
}

const trackedFiles = git(["ls-tree", "-r", "-z", "--name-only", SOURCE_COMMIT], "buffer")
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .map((file) => file.replaceAll("\\", "/"))
  .sort(compareText);
const trackedSet = new Set(trackedFiles);
const trackedLower = new Map(trackedFiles.map((file) => [file.toLowerCase(), file]));
const trackedAuditScopeFileCount = trackedFiles.filter(
  (file) =>
    !file.startsWith("docs/design-system/audit/") &&
    !file.startsWith("scripts/design-system-audit/")
).length;
const sourceCommit = SOURCE_COMMIT;
const sourceBranch = SOURCE_BRANCH;
const fileCache = new Map();

function getFile(file) {
  if (!fileCache.has(file)) {
    const buffer = git(["show", `${SOURCE_COMMIT}:${file}`], "buffer");
    const text = buffer.toString("utf8");
    fileCache.set(file, {
      file,
      text,
      buffer,
      bytes: buffer.byteLength,
      lineStarts: buildLineStarts(text),
      blocks: isStyleFile(file) ? parseCssBlocks(text) : [],
    });
  }
  return fileCache.get(file);
}

function resolveSpecifier(from, rawSpecifier) {
  const specifier = rawSpecifier.trim().replace(/[?#].*$/, "");
  if (!specifier || isExternalSpecifier(specifier)) return { target: null, external: rawSpecifier };
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return { target: null, external: rawSpecifier };
  }
  const base = specifier.startsWith("/")
    ? POSIX.normalize(specifier.slice(1))
    : POSIX.normalize(POSIX.join(POSIX.dirname(from), specifier));
  const candidates = [base];
  if (!POSIX.extname(base)) {
    for (const extension of RESOLUTION_EXTENSIONS) candidates.push(`${base}${extension}`);
    for (const extension of RESOLUTION_EXTENSIONS)
      candidates.push(POSIX.join(base, `index${extension}`));
  }
  for (const candidate of candidates) {
    if (trackedSet.has(candidate)) return { target: candidate, external: null };
    const caseMatch = trackedLower.get(candidate.toLowerCase());
    if (caseMatch) return { target: caseMatch, external: null };
  }
  return { target: null, external: null, unresolved: rawSpecifier };
}

const importEdges = [];
for (const file of trackedFiles) {
  const extension = POSIX.extname(file).toLowerCase();
  if (![...MODULE_EXTENSIONS, ...STYLE_EXTENSIONS, ".html", ".htm"].includes(extension)) continue;
  if (isExcludedAnalysisFile(file) && !file.startsWith("docs/")) continue;
  const data = getFile(file);
  const parsed = isStyleFile(file)
    ? parseCssImports(data.text)
    : isModuleFile(file)
      ? parseModuleImports(data.text)
      : parseHtmlImports(data.text);
  for (const entry of parsed) {
    const resolution = resolveSpecifier(file, entry.specifier);
    const location = lineAndColumn(data.lineStarts, entry.index);
    importEdges.push({
      from: file,
      to: resolution.target,
      specifier: entry.specifier,
      kind: entry.kind,
      ...location,
      external: resolution.external ?? null,
      unresolved: resolution.unresolved ?? null,
    });
  }
}
importEdges.sort((a, b) => sortByLocation(a, b) || compareText(a.specifier, b.specifier));

const edgesFrom = new Map();
for (const edge of importEdges) {
  if (!edgesFrom.has(edge.from)) edgesFrom.set(edge.from, []);
  edgesFrom.get(edge.from).push(edge);
}

function collectReachable(entry, { includeDynamic = true } = {}) {
  const visited = new Set();
  function visit(file) {
    if (!file || visited.has(file)) return;
    visited.add(file);
    for (const edge of edgesFrom.get(file) ?? []) {
      if (!edge.to) continue;
      if (!includeDynamic && edge.kind === "esm-dynamic") continue;
      visit(edge.to);
    }
  }
  visit(entry);
  return visited;
}

const browserEntry = "app/main.jsx";
const runtimeReachable = collectReachable(browserEntry, { includeDynamic: true });
const staticallyReachable = collectReachable(browserEntry, { includeDynamic: false });

function collectCssClosure(style, target = new Set()) {
  if (!style || target.has(style)) return target;
  target.add(style);
  for (const edge of edgesFrom.get(style) ?? []) {
    if (edge.to && isStyleFile(edge.to)) collectCssClosure(edge.to, target);
  }
  return target;
}

function collectStyleEncounterOrder(entry) {
  const visitedModules = new Set();
  const emittedStyles = new Set();
  const order = [];
  function emitStyle(style, chain, conditional) {
    if (emittedStyles.has(style)) return;
    for (const edge of edgesFrom.get(style) ?? []) {
      if (edge.to && isStyleFile(edge.to)) emitStyle(edge.to, [...chain, style], conditional);
    }
    if (emittedStyles.has(style)) return;
    emittedStyles.add(style);
    order.push({
      path: style,
      order: order.length + 1,
      load:
        conditional || !staticallyReachable.has(style)
          ? "conditional-or-dynamic"
          : "initial-static-graph",
      firstEncounterChain: [...chain, style],
      confidence: "medium",
      basis:
        "Deterministic depth-first traversal of static source import order; final Vite bundle extraction remains the authoritative cascade order.",
    });
  }
  function visitModule(file, chain = [], conditional = false) {
    const visitKey = `${file}\u0000${conditional ? "dynamic" : "static"}`;
    if (visitedModules.has(visitKey)) return;
    visitedModules.add(visitKey);
    for (const edge of edgesFrom.get(file) ?? []) {
      if (!edge.to) continue;
      const nextConditional = conditional || edge.kind === "esm-dynamic";
      if (isStyleFile(edge.to)) emitStyle(edge.to, [...chain, file], nextConditional);
      else if (isModuleFile(edge.to)) visitModule(edge.to, [...chain, file], nextConditional);
    }
  }
  visitModule(entry);
  return order;
}

const styleEncounterOrder = collectStyleEncounterOrder(browserEntry);
const styleOrderByPath = new Map(styleEncounterOrder.map((entry) => [entry.path, entry]));
const routeStyleSets = new Map();
for (const surface of ROUTE_SURFACES) {
  const reachable = collectReachable(surface.entry, { includeDynamic: true });
  routeStyleSets.set(surface.id, new Set([...reachable].filter(isStyleFile)));
}
const globalStyleSet = new Set();
for (const edge of edgesFrom.get(browserEntry) ?? []) {
  if (edge.to && isStyleFile(edge.to)) collectCssClosure(edge.to, globalStyleSet);
}
const appShellReachable = collectReachable("app/AppShell.jsx", { includeDynamic: true });
for (const file of appShellReachable) if (isStyleFile(file)) globalStyleSet.add(file);

const stylesheetPaths = trackedFiles.filter(isStyleFile);
const exactDuplicateGroupsMap = new Map();
for (const file of stylesheetPaths) {
  const hash = sha256(getFile(file).buffer);
  if (!exactDuplicateGroupsMap.has(hash)) exactDuplicateGroupsMap.set(hash, []);
  exactDuplicateGroupsMap.get(hash).push(file);
}

const stylesheets = stylesheetPaths.map((file) => {
  const data = getFile(file);
  const importerEdges = importEdges.filter((edge) => edge.to === file);
  const outgoingStyleEdges = (edgesFrom.get(file) ?? []).filter(
    (edge) =>
      (edge.to && isStyleFile(edge.to)) ||
      (edge.external && /(?:\.css|fonts|font-awesome)/i.test(edge.external))
  );
  const runtimeStatus = runtimeReachable.has(file)
    ? "runtime-reachable"
    : importerEdges.length
      ? "referenced-only-from-unreachable-source"
      : "no-tracked-import-reference";
  const blocks = data.blocks;
  const broadSelectors = [];
  const broadSeen = new Set();
  for (const block of blocks) {
    if (block.type !== "rule") continue;
    if (block.ancestorAtRules.some((atRule) => /keyframes/i.test(atRule))) continue;
    const reasons = broadSelectorReasons(block.prelude);
    if (!reasons.length) continue;
    const location = lineAndColumn(data.lineStarts, Math.max(0, block.open - block.prelude.length));
    const key = `${block.prelude}\u0000${location.line}\u0000${reasons.join(",")}`;
    if (broadSeen.has(key)) continue;
    broadSeen.add(key);
    broadSelectors.push({ selector: block.prelude, line: location.line, reasons });
  }
  broadSelectors.sort((a, b) => a.line - b.line || compareText(a.selector, b.selector));

  const layers = [];
  const layerRegex = /@layer\s+([^;{]+)([;{])/gi;
  for (
    let match = layerRegex.exec(maskComments(data.text));
    match;
    match = layerRegex.exec(maskComments(data.text))
  ) {
    layers.push({
      names: match[1].split(",").map(normalizeWhitespace).filter(Boolean),
      form: match[2] === ";" ? "order-declaration" : "layer-block",
      ...lineAndColumn(data.lineStarts, match.index),
    });
  }

  const appliesToRoutes = ROUTE_SURFACES.filter((surface) => {
    return globalStyleSet.has(file) || routeStyleSets.get(surface.id)?.has(file);
  }).map((surface) => surface.id);
  const encounter = styleOrderByPath.get(file);
  const role = inferStylesheetRole(file, runtimeStatus);
  return {
    path: file,
    bytes: data.bytes,
    lineCount: data.lineStarts.length,
    sha256: sha256(data.buffer),
    runtime: {
      imported: runtimeReachable.has(file),
      status: runtimeStatus,
      initialStaticGraph: staticallyReachable.has(file),
      firstEncounterOrder: encounter?.order ?? null,
      orderConfidence: encounter?.confidence ?? null,
      firstEncounterChain: encounter?.firstEncounterChain ?? [],
      loadedForAllRoutes: globalStyleSet.has(file),
      appliesToRoutes,
    },
    owners: inferOwners(file),
    apparentRole: role,
    classificationFlags: {
      shared: file.startsWith("shared/styles/"),
      globalShell: file === "app/app-shell.css" || file.startsWith("app/navigation/"),
      featureOrPageSpecific: file.startsWith("features/") || file.startsWith("app/home-page"),
      legacyCandidate: role.kind === "legacy-candidate",
      generatedCandidate: /(?:@generated|generated file|do not edit)/i.test(
        data.text.slice(0, 1200)
      ),
      apparentlyUnusedOrReference: runtimeStatus !== "runtime-reachable",
      factVsHeuristic:
        "Path and reachability flags are confirmed; legacy/generated/unused interpretation remains heuristic.",
    },
    imports: outgoingStyleEdges.map((edge) => ({
      target: edge.to ?? edge.external ?? edge.unresolved,
      targetKind: edge.to
        ? "tracked-stylesheet"
        : edge.external
          ? "external-stylesheet"
          : "unresolved",
      specifier: edge.specifier,
      line: edge.line,
      orderWithinFile: (edgesFrom.get(file) ?? []).indexOf(edge) + 1,
      fact: "confirmed-static-source-reference",
    })),
    importedBy: importerEdges.map((edge) => ({
      path: edge.from,
      line: edge.line,
      kind: edge.kind,
      importerRuntimeReachable: runtimeReachable.has(edge.from),
      fact: "confirmed-static-source-reference",
    })),
    layers: {
      used: layers.length > 0,
      statements: layers,
    },
    broadSelectors: {
      present: broadSelectors.length > 0,
      count: broadSelectors.length,
      records: broadSelectors,
      confidence: "high",
      basis:
        "Static selector scan for :root, document elements, universal selectors, and raw HTML element selectors.",
    },
  };
});

const cssImportRelationships = importEdges
  .filter(
    (edge) =>
      isStyleFile(edge.from) ||
      (edge.to && isStyleFile(edge.to)) ||
      edge.kind === "html-stylesheet-link"
  )
  .map((edge) => ({
    from: edge.from,
    to: edge.to ?? edge.external ?? edge.unresolved,
    kind: edge.kind,
    line: edge.line,
    column: edge.column,
    runtimeReachable: runtimeReachable.has(edge.from),
    resolution: edge.to ? "tracked" : edge.external ? "external" : "unresolved",
    fact: "confirmed-static-source-reference",
    confidence: "high",
  }));

const cssInventory = {
  schemaVersion: "1.0.0",
  schema: {
    recordKey: "stylesheets[].path",
    pathFormat: "repository-relative POSIX",
    ordering:
      "All arrays are deterministically sorted by path, source location, or explicit cascade encounter order.",
    factModel:
      "Static imports and file metrics are confirmed facts. Role, ownership, first-encounter cascade order, and unused status are labeled heuristics with confidence/basis.",
  },
  source: {
    repository: "danilo-aversa/cruor-games",
    branch: sourceBranch,
    commit: sourceCommit,
    browserEntry: "index.html -> app/main.jsx",
    trackedAuditScopeFileCount,
  },
  methodology: {
    generatedBy: "scripts/design-system-audit/generate-inventories.mjs",
    runtimeReachability:
      "Transitive local static and literal dynamic import traversal from app/main.jsx; CSS @import edges are traversed.",
    orderCaveat:
      "firstEncounterOrder is a deterministic source-graph model, not a claim about Vite's extracted production CSS order. Compare the built bundle before order-sensitive migration.",
    excluded:
      "Generated dependencies/build outputs, docs, reports, and this audit tool are excluded from runtime token scanning. Every Git-tracked stylesheet is still listed.",
  },
  summary: {
    stylesheetCount: stylesheets.length,
    runtimeReachableCount: stylesheets.filter((entry) => entry.runtime.imported).length,
    initialStaticGraphCount: stylesheets.filter((entry) => entry.runtime.initialStaticGraph).length,
    noRuntimePathCount: stylesheets.filter((entry) => !entry.runtime.imported).length,
    stylesheetsUsingLayers: stylesheets.filter((entry) => entry.layers.used).length,
    stylesheetsWithBroadSelectors: stylesheets.filter((entry) => entry.broadSelectors.present)
      .length,
    externalStylesheetImportCount: cssImportRelationships.filter(
      (entry) => entry.resolution === "external"
    ).length,
  },
  entryPoints: [
    { path: "index.html", kind: "html-entry", fact: "confirmed" },
    { path: "app/main.jsx", kind: "browser-module-entry", fact: "confirmed" },
  ],
  routeSurfaces: ROUTE_SURFACES.map((surface) => ({
    ...surface,
    entryExists: trackedSet.has(surface.entry),
    directlyReachableStyles: uniqueSorted([...(routeStyleSets.get(surface.id) ?? [])]),
    inheritedGlobalStyles: uniqueSorted([...globalStyleSet]),
  })),
  sourceGraphFirstEncounterOrder: styleEncounterOrder,
  importRelationships: cssImportRelationships,
  exactDuplicateStylesheetGroups: [...exactDuplicateGroupsMap.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([hash, files]) => ({ sha256: hash, files: files.sort(compareText), confidence: "high" }))
    .sort((a, b) => compareText(a.files[0], b.files[0])),
  stylesheets,
};

const analysisFiles = trackedFiles.filter((file) => {
  const extension = POSIX.extname(file).toLowerCase();
  return ANALYSIS_EXTENSIONS.has(extension) && !isExcludedAnalysisFile(file);
});
const definitions = [];
const usages = [];
const definitionSeen = new Set();
const usageSeen = new Set();

function addDefinition(definition) {
  const key = `${definition.name}\u0000${definition.file}\u0000${definition.line}\u0000${definition.column}\u0000${definition.kind}`;
  if (definitionSeen.has(key)) return;
  definitionSeen.add(key);
  definitions.push(definition);
}

function addUsage(usage) {
  const key = `${usage.name}\u0000${usage.file}\u0000${usage.line}\u0000${usage.column}\u0000${usage.kind}`;
  if (usageSeen.has(key)) return;
  usageSeen.add(key);
  usages.push(usage);
}

for (const file of analysisFiles) {
  const data = getFile(file);
  const text = data.text;
  const masked = maskComments(text);
  const scope = sourceScope(file);
  const runtime = runtimeReachable.has(file);

  if (isStyleFile(file)) {
    const definitionRegex = /(--[A-Za-z_][A-Za-z0-9_-]*)\s*:\s*([^;{}]+)(?=;|})/g;
    for (let match = definitionRegex.exec(masked); match; match = definitionRegex.exec(masked)) {
      const location = lineAndColumn(data.lineStarts, match.index);
      addDefinition({
        name: match[1],
        file,
        ...location,
        value: normalizeWhitespace(
          text.slice(
            match.index + match[0].indexOf(match[2]),
            match.index + match[0].indexOf(match[2]) + match[2].length
          )
        ),
        kind: "css-custom-property-declaration",
        selector: selectorContextAt(data.blocks, match.index),
        sourceScope: scope,
        runtimeReachable: runtime,
        fact: "confirmed-static-definition",
        confidence: "high",
      });
    }
    const propertyRegex = /@property\s+(--[A-Za-z_][A-Za-z0-9_-]*)/g;
    for (let match = propertyRegex.exec(masked); match; match = propertyRegex.exec(masked)) {
      addDefinition({
        name: match[1],
        file,
        ...lineAndColumn(data.lineStarts, match.index),
        value: null,
        kind: "css-property-registration",
        selector: null,
        sourceScope: scope,
        runtimeReachable: runtime,
        fact: "confirmed-static-registration",
        confidence: "high",
      });
    }
  } else {
    const embeddedDefinitionRegex = /(--[A-Za-z_][A-Za-z0-9_-]*)\s*:\s*([^;{}\r\n]+)(?=;|})/g;
    for (
      let match = embeddedDefinitionRegex.exec(masked);
      match;
      match = embeddedDefinitionRegex.exec(masked)
    ) {
      addDefinition({
        name: match[1],
        file,
        ...lineAndColumn(data.lineStarts, match.index),
        value: normalizeWhitespace(match[2]),
        kind: "embedded-css-custom-property-declaration",
        selector: null,
        sourceScope: scope,
        runtimeReachable: runtime,
        fact: "confirmed-static-name-in-embedded-css",
        confidence: "medium",
      });
    }
    const setPropertyRegex =
      /\.setProperty\(\s*(["'])(--[A-Za-z_][A-Za-z0-9_-]*)\1\s*,\s*([^\r\n)]+)/g;
    for (let match = setPropertyRegex.exec(masked); match; match = setPropertyRegex.exec(masked)) {
      addDefinition({
        name: match[2],
        file,
        ...lineAndColumn(data.lineStarts, match.index),
        value: normalizeWhitespace(match[3]),
        kind: "javascript-set-property",
        selector: null,
        sourceScope: scope,
        runtimeReachable: runtime,
        fact: "confirmed-static-name-dynamic-value",
        confidence: "medium",
      });
    }
    const objectDefinitionRegex = /(["'`])(--[A-Za-z_][A-Za-z0-9_-]*)\1\s*:\s*([^,}\r\n]+)/g;
    for (
      let match = objectDefinitionRegex.exec(masked);
      match;
      match = objectDefinitionRegex.exec(masked)
    ) {
      addDefinition({
        name: match[2],
        file,
        ...lineAndColumn(data.lineStarts, match.index),
        value: normalizeWhitespace(match[3]),
        kind: "style-object-or-inline-custom-property",
        selector: null,
        sourceScope: scope,
        runtimeReachable: runtime,
        fact: "confirmed-static-name-dynamic-or-static-value",
        confidence: "medium",
      });
    }
  }

  const varRegex = /var\(\s*(--[A-Za-z_][A-Za-z0-9_-]*)\s*(?:,\s*([^)]*))?\)/g;
  for (let match = varRegex.exec(masked); match; match = varRegex.exec(masked)) {
    addUsage({
      name: match[1],
      file,
      ...lineAndColumn(data.lineStarts, match.index),
      kind: "css-var-reference",
      hasFallback: match[2] != null && match[2].trim() !== "",
      fallback: match[2] == null ? null : normalizeWhitespace(match[2]),
      sourceScope: scope,
      runtimeReachable: runtime,
      fact: "confirmed-static-reference",
      confidence: "high",
    });
  }
  const getPropertyRegex =
    /\.(?:getPropertyValue|removeProperty)\(\s*(["'])(--[A-Za-z_][A-Za-z0-9_-]*)\1/g;
  for (let match = getPropertyRegex.exec(masked); match; match = getPropertyRegex.exec(masked)) {
    addUsage({
      name: match[2],
      file,
      ...lineAndColumn(data.lineStarts, match.index),
      kind: match[0].includes("removeProperty")
        ? "javascript-remove-property"
        : "javascript-get-property",
      hasFallback: false,
      fallback: null,
      sourceScope: scope,
      runtimeReachable: runtime,
      fact: "confirmed-static-reference",
      confidence: "high",
    });
  }
}
definitions.sort(sortByLocation);
usages.sort(sortByLocation);

const definitionsByName = new Map();
const usagesByName = new Map();
for (const definition of definitions) {
  if (!definitionsByName.has(definition.name)) definitionsByName.set(definition.name, []);
  definitionsByName.get(definition.name).push(definition);
}
for (const usage of usages) {
  if (!usagesByName.has(usage.name)) usagesByName.set(usage.name, []);
  usagesByName.get(usage.name).push(usage);
}
const tokenNames = uniqueSorted([...definitionsByName.keys(), ...usagesByName.keys()]);
const adjacency = new Map();
for (const name of tokenNames) {
  const targets = [];
  for (const definition of definitionsByName.get(name) ?? []) {
    if (!definition.value) continue;
    for (const match of definition.value.matchAll(/var\(\s*(--[A-Za-z_][A-Za-z0-9_-]*)/g))
      targets.push(match[1]);
  }
  adjacency.set(name, uniqueSorted(targets));
}

const aliasCycles = [];
let tarjanIndex = 0;
const tarjanStack = [];
const tarjanOnStack = new Set();
const tarjanIndexes = new Map();
const tarjanLowLinks = new Map();
function strongConnect(name) {
  tarjanIndexes.set(name, tarjanIndex);
  tarjanLowLinks.set(name, tarjanIndex);
  tarjanIndex += 1;
  tarjanStack.push(name);
  tarjanOnStack.add(name);
  for (const target of adjacency.get(name) ?? []) {
    if (!adjacency.has(target)) continue;
    if (!tarjanIndexes.has(target)) {
      strongConnect(target);
      tarjanLowLinks.set(name, Math.min(tarjanLowLinks.get(name), tarjanLowLinks.get(target)));
    } else if (tarjanOnStack.has(target)) {
      tarjanLowLinks.set(name, Math.min(tarjanLowLinks.get(name), tarjanIndexes.get(target)));
    }
  }
  if (tarjanLowLinks.get(name) === tarjanIndexes.get(name)) {
    const component = [];
    let current;
    do {
      current = tarjanStack.pop();
      tarjanOnStack.delete(current);
      component.push(current);
    } while (current !== name);
    component.sort(compareText);
    if (component.length > 1 || (adjacency.get(component[0]) ?? []).includes(component[0])) {
      aliasCycles.push({
        tokens: component,
        edges: component.flatMap((token) =>
          (adjacency.get(token) ?? [])
            .filter((target) => component.includes(target))
            .map((target) => ({ from: token, to: target }))
        ),
        potential: true,
        confidence: "medium",
        basis:
          "Confirmed dependency edges form a cycle when definitions from all selector scopes are merged. Cascade scope and active selectors must be evaluated before treating it as a runtime cycle.",
      });
    }
  }
}
for (const name of tokenNames) if (!tarjanIndexes.has(name)) strongConnect(name);
aliasCycles.sort((a, b) => compareText(a.tokens[0], b.tokens[0]));
const tokensInCycle = new Set(aliasCycles.flatMap((cycle) => cycle.tokens));
const depthMemo = new Map();
function dependencyDepth(name, active = new Set()) {
  if (tokensInCycle.has(name) || active.has(name)) return null;
  if (depthMemo.has(name)) return depthMemo.get(name);
  const targets = adjacency.get(name) ?? [];
  if (!targets.length) {
    depthMemo.set(name, 0);
    return 0;
  }
  const nextActive = new Set(active).add(name);
  let maximum = 0;
  for (const target of targets) {
    const targetDepth = adjacency.has(target) ? dependencyDepth(target, nextActive) : 0;
    if (targetDepth == null) return null;
    maximum = Math.max(maximum, targetDepth + 1);
  }
  depthMemo.set(name, maximum);
  return maximum;
}

const tokenRecords = tokenNames.map((name) => {
  const tokenDefinitions = definitionsByName.get(name) ?? [];
  const tokenUsages = usagesByName.get(name) ?? [];
  const values = uniqueSorted(
    tokenDefinitions.map((definition) => definition.value).filter((value) => value != null)
  );
  const aliasTargets = adjacency.get(name) ?? [];
  const directAlias =
    values.length > 0 &&
    values.every((value) => /^var\(\s*--[A-Za-z_][A-Za-z0-9_-]*\s*(?:,[^)]+)?\)$/.test(value));
  const role = tokenDefinitions.length
    ? inferTokenRole(name, tokenDefinitions)
    : "unresolved-or-undefined";
  let category;
  if (!tokenDefinitions.length) category = "unresolved-or-undefined";
  else if (!tokenUsages.length) category = "deprecated-or-apparently-unused";
  else if (directAlias) category = "alias";
  else category = role;
  const status = !tokenDefinitions.length
    ? "used-without-confirmed-definition"
    : !tokenUsages.length
      ? "defined-without-confirmed-usage"
      : "defined-and-used";
  return {
    name,
    category,
    inferredRole: role,
    status,
    classificationConfidence: category === "unresolved-or-undefined" ? "high" : "medium",
    definitions: tokenDefinitions,
    usages: tokenUsages,
    counts: {
      definitions: tokenDefinitions.length,
      usages: tokenUsages.length,
      runtimeDefinitions: tokenDefinitions.filter((entry) => entry.runtimeReachable).length,
      runtimeUsages: tokenUsages.filter((entry) => entry.runtimeReachable).length,
      usesWithFallback: tokenUsages.filter((entry) => entry.hasFallback).length,
    },
    values,
    alias: {
      kind: directAlias ? "direct" : aliasTargets.length ? "derived-or-composite" : "none",
      targets: aliasTargets,
      dependencyDepth: dependencyDepth(name),
      potentiallyCircularAcrossDefinitions: tokensInCycle.has(name),
    },
    pagePrefixedGenericVisualCandidate:
      /^(?:--studio|--inspirations|--monster|--location|--home)/i.test(name) &&
      /(?:color|surface|bg|text|muted|line|border|shadow|accent|danger|warning|success|info|radius)/i.test(
        name
      ),
    likelyMigrationTarget: tokenMigrationTarget(category, role),
    factVsHeuristic: {
      definitionsAndUsages: "confirmed-static-scan",
      categoryAndMigrationTarget: "heuristic-recommendation",
    },
  };
});

const duplicateValueMap = new Map();
for (const token of tokenRecords) {
  for (const value of token.values) {
    const normalized = normalizeWhitespace(value).toLowerCase();
    if (!duplicateValueMap.has(normalized)) duplicateValueMap.set(normalized, new Set());
    duplicateValueMap.get(normalized).add(token.name);
  }
}
const duplicateValueGroups = [...duplicateValueMap.entries()]
  .filter(([, names]) => names.size > 1)
  .map(([value, names]) => ({
    normalizedValue: value,
    tokens: [...names].sort(compareText),
    kind: value.includes("var(") ? "alias-or-derived-duplicate" : "literal-duplicate",
    confidence: "high",
  }))
  .sort(
    (a, b) => b.tokens.length - a.tokens.length || compareText(a.normalizedValue, b.normalizedValue)
  );

const rawOccurrenceMap = new Map();
function addRawOccurrence(category, value, occurrence) {
  const normalizedValue = normalizeWhitespace(value);
  if (
    !normalizedValue ||
    normalizedValue === "initial" ||
    normalizedValue === "inherit" ||
    normalizedValue === "unset"
  )
    return;
  const key = `${category}\u0000${normalizedValue.toLowerCase()}`;
  const occurrenceKey = `${occurrence.file}\u0000${occurrence.line}\u0000${occurrence.column}\u0000${occurrence.property}\u0000${normalizedValue.toLowerCase()}`;
  if (!rawOccurrenceMap.has(key)) {
    rawOccurrenceMap.set(key, {
      category,
      value: normalizedValue,
      occurrenceKeys: new Set(),
      occurrences: [],
    });
  }
  const group = rawOccurrenceMap.get(key);
  if (group.occurrenceKeys.has(occurrenceKey)) return;
  group.occurrenceKeys.add(occurrenceKey);
  group.occurrences.push({ ...occurrence, value: normalizedValue });
}

function addRawValuesFromDeclaration(
  file,
  data,
  property,
  value,
  absoluteValueIndex,
  selector,
  context
) {
  const scope = sourceScope(file);
  const canonical = CANONICAL_TOKEN_FILES.has(file);
  if (canonical) return;
  const baseOccurrence = (relativeIndex = 0) => ({
    file,
    ...lineAndColumn(data.lineStarts, absoluteValueIndex + relativeIndex),
    property,
    selector,
    context,
    sourceScope: scope,
    runtimeReachable: runtimeReachable.has(file),
  });
  for (const match of value.matchAll(/#[0-9a-f]{3,4}(?:[0-9a-f]{2}){0,2}\b/gi)) {
    addRawOccurrence("color", match[0], baseOccurrence(match.index));
  }
  for (const colorFunction of extractBalancedFunctions(value, "rgba?|hsla?")) {
    if (!colorFunction.value.includes("var(")) {
      addRawOccurrence("color", colorFunction.value, baseOccurrence(colorFunction.index));
    }
  }
  const colorNameSource = value
    .replace(/var\([^)]*\)/gi, (reference) => reference.replace(/[^\r\n]/g, " "))
    .replace(/url\([^)]*\)/gi, (reference) => reference.replace(/[^\r\n]/g, " "));
  const colorNameRegex = new RegExp(`\\b(?:${COLOR_NAMES.join("|")})\\b`, "gi");
  for (const match of colorNameSource.matchAll(colorNameRegex)) {
    addRawOccurrence("color", match[0].toLowerCase(), baseOccurrence(match.index));
  }
  for (const gradient of extractBalancedFunctions(
    value,
    "(?:repeating-)?(?:linear|radial|conic)-gradient"
  )) {
    addRawOccurrence("gradient", gradient.value, baseOccurrence(gradient.index));
  }

  const normalizedProperty = property
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .toLowerCase();
  if (/shadow$/.test(normalizedProperty) && !/^var\(/.test(value.trim())) {
    addRawOccurrence("shadow", value, baseOccurrence());
  }
  if (/^(?:filter|backdrop-filter)$/.test(normalizedProperty) && !/^var\(/.test(value.trim())) {
    addRawOccurrence("effect", value, baseOccurrence());
  }
  if (
    /^border(?:-(?:top|right|bottom|left))?(?:-width|-style|-color)?$/.test(normalizedProperty) &&
    !/^var\(/.test(value.trim())
  ) {
    addRawOccurrence("border", value, baseOccurrence());
  }
  if (/border.*radius/.test(normalizedProperty) && !/^var\(/.test(value.trim())) {
    addRawOccurrence("radius", value, baseOccurrence());
  }
  if (normalizedProperty === "opacity" && /^-?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())) {
    addRawOccurrence("opacity", value.trim(), baseOccurrence());
  }
  const dimensionMatches = [
    ...value.matchAll(/-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|%|vh|vw|vmin|vmax|ch|ex|fr)\b/gi),
  ];
  let dimensionCategory = null;
  if (
    /^(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)/.test(
      normalizedProperty
    )
  ) {
    dimensionCategory = "spacing";
  } else if (
    /^(?:width|height|min-width|max-width|min-height|max-height)/.test(normalizedProperty)
  ) {
    dimensionCategory = "sizing";
  } else if (normalizedProperty === "font-size") dimensionCategory = "font-size";
  else if (normalizedProperty === "line-height") dimensionCategory = "line-height";
  else if (normalizedProperty === "scrollbar-width" || selector?.includes("scrollbar"))
    dimensionCategory = "scrollbar";
  if (dimensionCategory) {
    for (const match of dimensionMatches)
      addRawOccurrence(dimensionCategory, match[0], baseOccurrence(match.index));
    if (/^(?:0|0\.0+)$/.test(value.trim()))
      addRawOccurrence(dimensionCategory, "0", baseOccurrence());
  }
  if (normalizedProperty === "line-height" && /^\d*\.?\d+$/.test(value.trim())) {
    addRawOccurrence("line-height", value.trim(), baseOccurrence());
  }
  if (normalizedProperty === "font-family" && !value.includes("var(")) {
    addRawOccurrence("font-family", value, baseOccurrence());
  }
  if (/^(?:transition|animation)(?:-|$)/.test(normalizedProperty)) {
    for (const match of value.matchAll(/(?:\d+\.?\d*|\.\d+)(?:ms|s)\b/gi)) {
      addRawOccurrence("motion-duration", match[0], baseOccurrence(match.index));
    }
    for (const easing of extractBalancedFunctions(value, "cubic-bezier|steps|linear")) {
      addRawOccurrence("motion-easing", easing.value, baseOccurrence(easing.index));
    }
    for (const match of value.matchAll(
      /\b(?:ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)\b/gi
    )) {
      addRawOccurrence("motion-easing", match[0], baseOccurrence(match.index));
    }
  }
  if (normalizedProperty === "z-index" && /^-?\d+$/.test(value.trim())) {
    addRawOccurrence("z-index", value.trim(), baseOccurrence());
  }
  if (
    /^scrollbar-(?:width|color|gutter)$/.test(normalizedProperty) &&
    !/^var\(/.test(value.trim())
  ) {
    addRawOccurrence("scrollbar", value, baseOccurrence());
  }
}

for (const file of analysisFiles) {
  const data = getFile(file);
  if (CANONICAL_TOKEN_FILES.has(file)) continue;
  const masked = maskComments(data.text);
  if (isStyleFile(file)) {
    const declarationRegex = /(^|[;{}])\s*([-A-Za-z0-9_]+)\s*:\s*([^;{}]+)(?=;|})/gm;
    for (let match = declarationRegex.exec(masked); match; match = declarationRegex.exec(masked)) {
      const property = match[2];
      const value = data.text.slice(
        match.index + match[0].indexOf(match[3]),
        match.index + match[0].indexOf(match[3]) + match[3].length
      );
      const valueIndex = match.index + match[0].indexOf(match[3]);
      addRawValuesFromDeclaration(
        file,
        data,
        property,
        value,
        valueIndex,
        selectorContextAt(data.blocks, match.index),
        property.startsWith("--") ? "custom-property-definition" : "css-declaration"
      );
    }
  } else {
    const stylePropertyRegex =
      /(?:^|[,{]\s*)([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(["'`])([^"'`\r\n]*)\2/gm;
    for (
      let match = stylePropertyRegex.exec(masked);
      match;
      match = stylePropertyRegex.exec(masked)
    ) {
      if (
        !VISUAL_PROPERTY_PATTERN.test(
          match[1].replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        )
      )
        continue;
      const valueIndex = match.index + match[0].indexOf(match[3]);
      addRawValuesFromDeclaration(
        file,
        data,
        match[1],
        match[3],
        valueIndex,
        null,
        "code-style-object"
      );
    }
    const numericStyleRegex =
      /(?:^|[,{]\s*)([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(-?(?:\d+\.?\d*|\.\d+))(?=\s*[,}])/gm;
    for (
      let match = numericStyleRegex.exec(masked);
      match;
      match = numericStyleRegex.exec(masked)
    ) {
      const normalizedProperty = match[1].replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      if (!VISUAL_PROPERTY_PATTERN.test(normalizedProperty)) continue;
      const value = /^(?:opacity|z-index|line-height)$/.test(normalizedProperty)
        ? match[2]
        : `${match[2]}px`;
      const valueIndex = match.index + match[0].indexOf(match[2]);
      addRawValuesFromDeclaration(
        file,
        data,
        normalizedProperty,
        value,
        valueIndex,
        null,
        "code-style-object-numeric"
      );
    }
    const svgAttributeRegex = /\b(fill|stroke|color)\s*=\s*(["'])([^"']+)\2/g;
    for (
      let match = svgAttributeRegex.exec(masked);
      match;
      match = svgAttributeRegex.exec(masked)
    ) {
      const valueIndex = match.index + match[0].indexOf(match[3]);
      addRawValuesFromDeclaration(
        file,
        data,
        match[1],
        match[3],
        valueIndex,
        null,
        "svg-or-jsx-attribute"
      );
    }
    const rawColorRegex = /#[0-9a-f]{3,4}(?:[0-9a-f]{2}){0,2}\b/gi;
    for (let match = rawColorRegex.exec(masked); match; match = rawColorRegex.exec(masked)) {
      if (match.index > 0 && masked[match.index - 1] === "&") continue;
      const location = lineAndColumn(data.lineStarts, match.index);
      addRawOccurrence("color", match[0], {
        file,
        ...location,
        property: null,
        selector: null,
        context: "code-or-markup-color-literal",
        sourceScope: sourceScope(file),
        runtimeReachable: runtimeReachable.has(file),
      });
    }
  }
}

const rawValueGroups = [...rawOccurrenceMap.values()]
  .map((group) => {
    group.occurrences.sort(sortByLocation);
    const files = uniqueSorted(group.occurrences.map((occurrence) => occurrence.file));
    const properties = uniqueSorted(
      group.occurrences.map((occurrence) => occurrence.property).filter(Boolean)
    );
    return {
      category: group.category,
      value: group.value,
      count: group.occurrences.length,
      fileCount: files.length,
      files,
      properties,
      runtimeOccurrenceCount: group.occurrences.filter((occurrence) => occurrence.runtimeReachable)
        .length,
      classification: rawClassification(group.category, group.value, group.occurrences),
      classificationConfidence: "medium",
      examples: group.occurrences
        .slice(0, 12)
        .map(({ value: _value, ...occurrence }) => occurrence),
    };
  })
  .sort((a, b) => {
    const categoryDifference =
      RAW_CATEGORY_ORDER.indexOf(a.category) - RAW_CATEGORY_ORDER.indexOf(b.category);
    return categoryDifference || b.count - a.count || compareText(a.value, b.value);
  });

const categoryCounts = {};
for (const token of tokenRecords)
  categoryCounts[token.category] = (categoryCounts[token.category] ?? 0) + 1;
const rawCategoryCounts = {};
for (const group of rawValueGroups) {
  if (!rawCategoryCounts[group.category])
    rawCategoryCounts[group.category] = { groups: 0, occurrences: 0 };
  rawCategoryCounts[group.category].groups += 1;
  rawCategoryCounts[group.category].occurrences += group.count;
}
const undefinedTokens = tokenRecords.filter(
  (token) => token.category === "unresolved-or-undefined"
);
const apparentlyUnusedTokens = tokenRecords.filter(
  (token) => token.category === "deprecated-or-apparently-unused"
);
const deepAliasChains = tokenRecords
  .filter((token) => token.alias.dependencyDepth != null && token.alias.dependencyDepth >= 4)
  .map((token) => ({
    name: token.name,
    depth: token.alias.dependencyDepth,
    targets: token.alias.targets,
  }))
  .sort((a, b) => b.depth - a.depth || compareText(a.name, b.name));

const tokenInventory = {
  schemaVersion: "1.0.0",
  schema: {
    recordKey: "tokens[].name",
    pathFormat: "repository-relative POSIX",
    ordering:
      "Tokens sort by name; definitions/usages sort by file and source location; grouped values use deterministic count/value ordering.",
    categories: [
      "global-semantic-token",
      "global-primitive-token",
      "component-token",
      "layout-token",
      "feature-domain-token",
      "page-specific-visual-token",
      "alias",
      "deprecated-or-apparently-unused",
      "unresolved-or-undefined",
    ],
    factModel:
      "Definition, usage, value, and source locations are static facts. Categories, unused status, raw-value disposition, and migration targets are heuristics and carry confidence labels.",
  },
  source: {
    repository: "danilo-aversa/cruor-games",
    branch: sourceBranch,
    commit: sourceCommit,
    analyzedFileCount: analysisFiles.length,
    canonicalTokenFiles: [...CANONICAL_TOKEN_FILES].sort(compareText),
  },
  methodology: {
    generatedBy: "scripts/design-system-audit/generate-inventories.mjs",
    definitions:
      "CSS custom-property declarations, @property registrations, JavaScript setProperty calls, and quoted style-object custom-property keys.",
    usages:
      "CSS var() references plus JavaScript getPropertyValue/removeProperty calls with static custom-property names.",
    rawValues:
      "Visual CSS declarations, code style objects, SVG/JSX color attributes, and code/markup color literals outside the three current canonical token files.",
    caveats: [
      "Dynamic token names assembled at runtime cannot be proven by a static scan.",
      "Unused means no confirmed tracked static consumer; it is not deletion authorization.",
      "Raw-value grouping is lexical. Structural math, geometry, and SVG values require owner review before tokenization.",
      "CSS in remote @import stylesheets is outside this repository inventory.",
    ],
  },
  summary: {
    uniqueTokenCount: tokenRecords.length,
    definitionCount: definitions.length,
    usageCount: usages.length,
    categoryCounts: Object.fromEntries(
      Object.entries(categoryCounts).sort(([a], [b]) => compareText(a, b))
    ),
    undefinedTokenCount: undefinedTokens.length,
    apparentlyUnusedTokenCount: apparentlyUnusedTokens.length,
    duplicateValueGroupCount: duplicateValueGroups.length,
    potentialCircularAliasGroupCount: aliasCycles.length,
    deepAliasChainCount: deepAliasChains.length,
    rawValueGroupCountOutsideCanonicalFiles: rawValueGroups.length,
    rawValueOccurrenceCountOutsideCanonicalFiles: rawValueGroups.reduce(
      (total, group) => total + group.count,
      0
    ),
    rawCategoryCounts: Object.fromEntries(
      Object.entries(rawCategoryCounts).sort(([a], [b]) => compareText(a, b))
    ),
  },
  aliasAnalysis: {
    potentialCircularGroups: aliasCycles,
    excessiveDepthThreshold: 4,
    deepChains: deepAliasChains,
  },
  duplicateValueGroups,
  undefinedTokens: undefinedTokens.map((token) => ({
    name: token.name,
    usages: token.usages,
    allUsesHaveFallback:
      token.usages.length > 0 && token.usages.every((usage) => usage.hasFallback),
    confidence: "high",
    basis:
      "No tracked static definition was found; dynamic and remote definitions remain outside proof scope.",
  })),
  apparentlyUnusedTokens: apparentlyUnusedTokens.map((token) => ({
    name: token.name,
    definitions: token.definitions,
    inferredRole: token.inferredRole,
    confidence: "medium",
    warning: "Do not remove without runtime, state, and external-consumer verification.",
  })),
  rawValues: {
    scope: "Occurrences outside current canonical token files only.",
    groups: rawValueGroups,
  },
  tokens: tokenRecords,
};

function renderTokenMarkdown(inventory, css) {
  const categoryRows = Object.entries(inventory.summary.categoryCounts).map(([category, count]) => [
    category,
    count,
  ]);
  const undefinedRows = inventory.undefinedTokens.map((token) => [
    `\`${token.name}\``,
    token.usages.length,
    token.allUsesHaveFallback ? "yes" : "no",
    token.usages
      .slice(0, 3)
      .map((usage) => `\`${usage.file}:${usage.line}\``)
      .join(", "),
  ]);
  const unusedRows = inventory.apparentlyUnusedTokens.slice(0, 40).map((token) => [
    `\`${token.name}\``,
    token.inferredRole,
    token.definitions.length,
    token.definitions
      .slice(0, 2)
      .map((definition) => `\`${definition.file}:${definition.line}\``)
      .join(", "),
  ]);
  const duplicateRows = inventory.duplicateValueGroups.slice(0, 35).map((group) => [
    `\`${group.normalizedValue}\``,
    group.tokens.length,
    group.kind,
    group.tokens
      .slice(0, 6)
      .map((token) => `\`${token}\``)
      .join(", ") + (group.tokens.length > 6 ? " …" : ""),
  ]);
  const genericVisualRows = inventory.tokens
    .filter((token) => token.pagePrefixedGenericVisualCandidate)
    .slice(0, 45)
    .map((token) => [
      `\`${token.name}\``,
      token.inferredRole,
      token.definitions
        .slice(0, 2)
        .map((definition) => `\`${definition.file}:${definition.line}\``)
        .join(", "),
      token.likelyMigrationTarget,
    ]);
  const rawCategoryRows = Object.entries(inventory.summary.rawCategoryCounts).map(
    ([category, counts]) => [category, counts.groups, counts.occurrences]
  );
  const rawTopRows = inventory.rawValues.groups
    .filter((group) => group.count >= 2)
    .sort((a, b) => b.count - a.count || compareText(a.value, b.value))
    .slice(0, 60)
    .map((group) => [
      group.category,
      `\`${group.value}\``,
      group.count,
      group.fileCount,
      group.classification,
      group.examples
        .slice(0, 2)
        .map((example) => `\`${example.file}:${example.line}\``)
        .join(", "),
    ]);
  const deepRows = inventory.aliasAnalysis.deepChains
    .slice(0, 30)
    .map((chain) => [
      `\`${chain.name}\``,
      chain.depth,
      chain.targets.map((target) => `\`${target}\``).join(", "),
    ]);
  const cycleRows = inventory.aliasAnalysis.potentialCircularGroups.map((cycle) => [
    cycle.tokens.map((token) => `\`${token}\``).join(" -> "),
    cycle.edges.map((edge) => `${edge.from} -> ${edge.to}`).join(", "),
  ]);

  return `# Design-token and raw-value inventory

This is the human-readable companion to \`token-inventory.json\`. It was generated deterministically by \`node scripts/design-system-audit/generate-inventories.mjs\` from Git-tracked source at commit \`${inventory.source.commit}\` on branch \`${inventory.source.branch}\`.

No runtime file is changed by the generator. “Unused,” category assignments, migration targets, and raw-value classifications are static heuristics, not deletion or refactor authorization.

## Scope and method

- ${css.summary.stylesheetCount} tracked stylesheets were inventoried; ${css.summary.runtimeReachableCount} have a confirmed import path from \`index.html\` / \`app/main.jsx\`, and ${css.summary.noRuntimePathCount} do not.
- Custom properties are scanned in tracked CSS, browser modules, tests/QA, scripts, HTML, and SVG source. Documentation, reports, generated outputs, dependencies, and the audit script itself are excluded.
- The current canonical token-file boundary is \`shared/styles/colors.css\`, \`shared/styles/theme.css\`, and \`shared/styles/typography.css\`. This is a description of the present architecture, not an endorsement of keeping all three monolithic.
- Runtime reachability includes literal dynamic imports. Dynamic token names and styles injected by remote stylesheets cannot be proven statically.
- All paths in JSON are repository-relative POSIX paths. Every finding distinguishes confirmed source evidence from heuristic classification.

## Headline counts

| Measure | Count |
| --- | ---: |
| Unique custom-property names | ${inventory.summary.uniqueTokenCount} |
| Definition sites | ${inventory.summary.definitionCount} |
| Usage sites | ${inventory.summary.usageCount} |
| Used without a confirmed definition | ${inventory.summary.undefinedTokenCount} |
| Defined without a confirmed tracked usage | ${inventory.summary.apparentlyUnusedTokenCount} |
| Duplicate normalized value groups | ${inventory.summary.duplicateValueGroupCount} |
| Potential circular alias groups across merged selector scopes | ${inventory.summary.potentialCircularAliasGroupCount} |
| Alias/dependency chains at depth 4+ | ${inventory.summary.deepAliasChainCount} |
| Raw-value groups outside current canonical files | ${inventory.summary.rawValueGroupCountOutsideCanonicalFiles} |
| Raw-value occurrences outside current canonical files | ${inventory.summary.rawValueOccurrenceCountOutsideCanonicalFiles} |

## Token categories

${markdownTable(["Category", "Tokens"], categoryRows)}

The split already contains useful migration boundaries:

- \`shared/styles/colors.css\` is a large primitive/effect catalog. Its RGB primitives, alpha variants, gradients, shadows, and filters are existing design-system work and should be normalized or partitioned only after consumer coverage is locked.
- \`shared/styles/typography.css\` is the current type-size scale and accessibility scaling boundary. Display sizes intentionally remain unscaled while interface copy depends on \`--cruor-text-scale\`.
- \`shared/styles/theme.css\` mixes semantic aliases with spacing, sizing, border, surface, control, component, and z-index values. That mixed ownership is the clearest future partition point.
- \`shared/styles/composer-system.css\` and \`shared/styles/composer-internals.css\` are already cross-feature Composer component work. Their APIs should be evaluated and preserved through migration rather than replaced wholesale.
- Feature-prefixed variables divide into two groups: layout/domain values that should usually remain local, and generic visual concepts that should be compared against shared semantic/component tokens.

## Used without a confirmed definition

${markdownTable(["Token", "Uses", "All uses have fallback", "First evidence"], undefinedRows)}

An undefined result means only that no tracked static definition was found. A fallback can reduce immediate breakage, but does not prove that the intended theme value is correct. Dynamic names, remote CSS, and host integration remain possible sources.

## Defined without a confirmed tracked usage

The JSON file contains the complete list. The first 40, sorted by token name, are shown here.

${markdownTable(["Token", "Inferred role", "Definitions", "Evidence"], unusedRows)}

The large primitive catalog deliberately exposes more values than current source may consume. Therefore “apparently unused” is a verification queue, especially for \`colors.css\`; it is not evidence sufficient for deletion.

## Aliases and dependency depth

${markdownTable(["Token", "Dependency depth", "Direct targets"], deepRows)}

${markdownTable(["Potential circular group", "Internal edges"], cycleRows)}

Depth counts custom-property dependencies in definitions, including composite values such as \`rgb(var(...))\`. A deep chain is a migration/order risk even when it is not a pure one-to-one alias. Potential cycles merge definitions from every selector scope; their edges are confirmed, but whether all edges are simultaneously active is a cascade question that must be verified before migration.

## Duplicate values under different names

${markdownTable(["Normalized value", "Token names", "Kind", "Examples"], duplicateRows)}

Duplicate literals are candidate primitives. Duplicate aliases can be intentional semantic names and should not be collapsed merely because their current resolved value is equal.

## Page-prefixed variables describing generic visual concepts

${markdownTable(["Token", "Current role", "Evidence", "Future review target"], genericVisualRows)}

These are strong comparison candidates for shared colors, surfaces, borders, status tones, or component tokens. Variables describing rail width, grid geometry, map masks, room nodes, anatomy measurements, or stage mechanics are different: their names encode feature behavior/layout and they should remain local unless another route proves the same contract.

## Raw visual values outside current canonical token files

${markdownTable(["Category", "Groups", "Occurrences"], rawCategoryRows)}

### Most repeated raw values

${markdownTable(["Category", "Value", "Uses", "Files", "Disposition", "Evidence"], rawTopRows)}

Interpretation boundaries:

- Repeated colors, gradients, shadows, radii, opacity, type sizes, motion, effects, and z-index values are likely token candidates.
- Spacing and sizing require semantic review. Percentages, viewport units, zeroes, \`calc()\`/\`clamp()\`, grid tracks, and geometry-derived dimensions are often structural or mathematical rather than design tokens.
- Map-generator geometry, room/corridor dimensions, anatomy placement, SVG coordinates, canvas behavior, and export-rendering values may legitimately remain feature-local even when repeated.
- Studio rail widths and transitions, Dark Places grid/rail mechanics, Monster anatomy/stage dimensions, and Home workbench/carousel math are migration boundaries, not automatic global-token candidates.
- One-off values remain review items. Their uniqueness alone neither justifies a global token nor proves dead code.

## Import and documentation drift relevant to token work

- The repository-map narrative baseline names branch \`main\` at commit \`2155e52…\`, while this audit runs at \`${inventory.source.commit}\` on \`${inventory.source.branch}\`; generated-map freshness must be validated independently after all audit documentation is assembled.
- \`docs/ARCHITECTURE.md\` still describes a \`src/app\`, \`src/shared\`, and \`src/features\` layout, while the current tracked implementation uses root-level \`app/\`, \`shared/\`, and \`features/\`.
- \`docs/repository-map/routes-and-navigation.md\` diagrams a \`CruciblePage.jsx\`; no such tracked file exists. Current Crucible workspace composition is inline in \`app/router.jsx\` with \`CrucibleTopbar.jsx\` and the Darken/Monster pages.
- The claim that global CSS precedes feature CSS should be treated as an intended boundary, not assumed final cascade fact: \`app/main.jsx\` imports \`AppRouter\` before its direct CSS imports, and feature modules also import styles transitively. The CSS inventory records confirmed edges and a medium-confidence source-graph encounter order; the built Vite CSS remains the final order check.

## Migration boundary recommendation

Partition by responsibility before renaming consumers: primitives (color/type/spacing/sizing/motion/z), semantic aliases, shared component tokens, and feature layout/domain tokens. Preserve compatibility aliases and current import order while each family moves. Verify visual neutrality route-by-route, then consider cascade layers in a separate guarded phase; none of the tracked stylesheets currently proves a layer-based cascade contract unless \`css-inventory.json\` reports otherwise.
`;
}

const tokenMarkdown = renderTokenMarkdown(tokenInventory, cssInventory);
const serializedCss = `${JSON.stringify(cssInventory, null, 2)}\n`;
const serializedTokens = `${JSON.stringify(tokenInventory, null, 2)}\n`;
const serializedMarkdown = tokenMarkdown.endsWith("\n") ? tokenMarkdown : `${tokenMarkdown}\n`;

const outputs = [
  [CSS_OUTPUT, serializedCss],
  [TOKEN_OUTPUT, serializedTokens],
  [TOKEN_MARKDOWN_OUTPUT, serializedMarkdown],
];

if (CHECK_MODE) {
  let failed = false;
  for (const [output, expected] of outputs) {
    const relative = toPosix(path.relative(ROOT, output));
    if (!fs.existsSync(output)) {
      console.error(`MISSING ${relative}`);
      failed = true;
      continue;
    }
    const actual = fs.readFileSync(output, "utf8");
    if (actual !== expected) {
      console.error(`STALE ${relative}`);
      failed = true;
    } else {
      console.log(`OK ${relative}`);
    }
  }
  if (failed) process.exitCode = 1;
} else {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const [output, contents] of outputs) {
    fs.writeFileSync(output, contents, "utf8");
    console.log(`WROTE ${toPosix(path.relative(ROOT, output))}`);
  }
}
