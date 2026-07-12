const fs = require("fs");
const cp = require("child_process");

const STARTING_COMMIT = "be61f98fd2537d367c757bf9796b11735bc7d193";
const extensions = /\.(?:js|jsx|ts|tsx|mjs|cjs|html)$/;
const files = cp
  .execFileSync("git", ["ls-tree", "-r", "--name-only", STARTING_COMMIT], { encoding: "utf8" })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => extensions.test(file))
  .filter((file) => !/^(?:node_modules|dist|build|coverage|playwright-report)\//.test(file));

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function lineText(text, index) {
  const start = text.lastIndexOf("\n", index) + 1;
  const endValue = text.indexOf("\n", index);
  const end = endValue === -1 ? text.length : endValue;
  return text.slice(start, end).trim().replace(/\s+/g, " ").slice(0, 220);
}

function readArg(text, index) {
  while (/\s/.test(text[index] || "")) index += 1;
  const quote = text[index];
  if (quote === "\"" || quote === "'" || quote === String.fromCharCode(96)) {
    let value = "";
    for (let cursor = index + 1; cursor < text.length; cursor += 1) {
      const character = text[cursor];
      if (character === "\\") {
        value += character + (text[cursor + 1] || "");
        cursor += 1;
        continue;
      }
      if (character === quote) return { value, end: cursor + 1, literal: true };
      value += character;
    }
    return null;
  }
  const match = text.slice(index).match(/^([A-Za-z_$][\w$]*)/);
  return match ? { value: match[1], end: index + match[1].length, literal: false } : null;
}

function normalizeSelector(selector) {
  return selector
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\[([\w:-]+)='([^']*)'\]/g, "[$1=\"$2\"]");
}

function kebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function classifyActivity(path) {
  if (/^tests\/tests\//.test(path)) return "legacy-duplicate-test";
  if (/^tests\/e2e\//.test(path)) return "active-e2e-test";
  if (/^tests\/(?:unit\/|smoke\.test\.)/.test(path)) return "inactive-test";
  if (/^(?:app|features|shared)\/.*\.test\.(?:js|jsx|ts|tsx)$/.test(path)) return "active-unit-test";
  if (path === "scripts/run-circle-connector-diagnostics.test.js") return "active-qa-test";
  if (path === "scripts/map-generator.circle-anchors.test.js") return "reference-test";
  if (/^scripts\//.test(path) || /\/qa\//.test(path)) return "qa-tooling";
  if (/^dev\//.test(path)) return "dev-reference";
  if (/\/legacy\//.test(path)) return "legacy-reference";
  return "runtime";
}

function selectorKind(selector) {
  if (/^\.[-_a-zA-Z][\w-]*$/.test(selector)) return "class";
  if (/^#[-_a-zA-Z][\w-]*$/.test(selector)) return "id";
  if (/^\[[^\]]+\]$/.test(selector)) return "attribute";
  if (/^[a-z][\w-]*$/i.test(selector)) return "type";
  return "compound";
}

function inferRoles(path, selector, api, activity) {
  const roles = new Set();
  const isTest = activity.includes("test") || activity === "qa-tooling";
  if (isTest) roles.add("testing");
  if (
    !isTest &&
    /^(?:querySelector|querySelectorAll|closest|matches|getElementById|getElementsByClassName|selector-array)/.test(api)
  ) {
    roles.add("behavior");
  }
  if (/^(?:classList\.|className\.assignment|id\.assignment)/.test(api)) {
    roles.add("behavior");
    roles.add("state");
    roles.add("visual");
  }
  if (/^(?:dataset|getAttribute|setAttribute|removeAttribute|hasAttribute|toHaveAttribute)/.test(api)) {
    roles.add("state");
    if (!isTest) roles.add("behavior");
  }
  if (api === "getByTestId" || api === "locator" || api === "waitForSelector") roles.add("testing");
  if (
    /(?:viewport|stage|shell|menu|panel|toolbar|carousel|workbench|anatomy|map-svg|rail|scroll|popover|trigger|submenu)/i.test(
      selector,
    ) &&
    /(?:querySelector|closest|locator|getElementById)/.test(api)
  ) {
    roles.add("layout");
  }
  if (/^(?:\.is-|\.active$|\.dragging$|\.expanded$|\.compiled$|\.in-build$|\[data-)/.test(selector)) {
    roles.add("state");
  }
  if (/scripts\/(?:compare-site-elements|diagnose-workbench-scroll)\.mjs/.test(path)) roles.add("layout");
  if (!roles.size) roles.add("behavior");
  return Array.from(roles).sort();
}

function concernFor(api, selector, path) {
  const concerns = [];
  if (/classList/.test(api) && /(?:drag|inertia|fad|resiz|transition|active|open|visible)/i.test(selector)) {
    concerns.push("animation-or-transient-visual-state");
  }
  if (/closest|selector-array/.test(api)) concerns.push("event-delegation");
  if (/scripts\/compare-site-elements|scripts\/diagnose-workbench-scroll/.test(path)) {
    concerns.push("measurement-or-visual-qa");
  }
  if (/locator|getByTestId|toHaveAttribute/.test(api)) concerns.push("test-locator-or-assertion");
  if (/dataset|getAttribute|setAttribute/.test(api)) concerns.push("dom-state-contract");
  return concerns;
}

const occurrences = [];
const dynamicSelectors = [];

function addOccurrence(path, text, index, selector, api, evidence, confidence) {
  const normalized = normalizeSelector(selector);
  if (!normalized) return;
  const activity = classifyActivity(path);
  occurrences.push({
    selector: normalized,
    path,
    line: lineOf(text, index),
    api,
    activity,
    roles: inferRoles(path, normalized, api, activity),
    concerns: concernFor(api, normalized, path),
    evidence,
    confidence,
    context: lineText(text, index),
  });
}

for (const path of files) {
  const text = cp.execFileSync("git", ["show", `${STARTING_COMMIT}:${path}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const constants = new Map();

  for (const match of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal) constants.set(match[1], argument.value);
  }
  for (const match of text.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\[([\s\S]*?)\]\.join\(\s*(["'])(.*?)\3\s*\)/g,
  )) {
    const values = [];
    for (const stringMatch of match[2].matchAll(/(["'])(.*?)\1/g)) values.push(stringMatch[2]);
    constants.set(match[1], values.join(match[4]));
  }

  for (const match of text.matchAll(/\b(querySelectorAll|querySelector|closest|waitForSelector)\s*\(/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (!argument) continue;
    let selector = argument.value;
    let evidence = "static-literal";
    let confidence = selector.includes("\${") ? "medium" : "high";
    if (!argument.literal) {
      if (constants.has(selector)) {
        selector = constants.get(selector);
        evidence = "resolved-local-constant";
        confidence = selector.includes("\${") ? "medium" : "high";
      } else {
        dynamicSelectors.push({
          path,
          line: lineOf(text, match.index),
          api: match[1],
          expression: selector,
          activity: classifyActivity(path),
          confidence: "low",
          context: lineText(text, match.index),
        });
        continue;
      }
    }
    addOccurrence(path, text, match.index, selector, match[1], evidence, confidence);
  }

  for (const match of text.matchAll(/\.matches\s*\(/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal) {
      addOccurrence(
        path,
        text,
        match.index,
        argument.value,
        "matches",
        "static-literal",
        argument.value.includes("\${") ? "medium" : "high",
      );
    } else if (argument) {
      dynamicSelectors.push({
        path,
        line: lineOf(text, match.index),
        api: "matches",
        expression: argument.value,
        activity: classifyActivity(path),
        confidence: "low",
        context: lineText(text, match.index),
      });
    }
  }

  for (const match of text.matchAll(/\.locator\s*\(/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal) {
      addOccurrence(
        path,
        text,
        match.index,
        argument.value,
        "locator",
        "static-literal",
        argument.value.includes("\${") ? "medium" : "high",
      );
    } else if (argument) {
      dynamicSelectors.push({
        path,
        line: lineOf(text, match.index),
        api: "locator",
        expression: argument.value,
        activity: classifyActivity(path),
        confidence: "low",
        context: lineText(text, match.index),
      });
    }
  }

  for (const match of text.matchAll(/\bgetElementById\s*\(/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal) {
      addOccurrence(
        path,
        text,
        match.index,
        "#" + argument.value,
        "getElementById",
        "static-literal",
        argument.value.includes("\${") ? "medium" : "high",
      );
    }
  }

  for (const match of text.matchAll(/\bgetElementsByClassName\s*\(/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal) {
      addOccurrence(
        path,
        text,
        match.index,
        "." + argument.value.trim().split(/\s+/).join("."),
        "getElementsByClassName",
        "static-literal",
        "high",
      );
    }
  }

  for (const match of text.matchAll(/\bgetByTestId\s*\(/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal) {
      addOccurrence(
        path,
        text,
        match.index,
        "[data-testid=\"" + argument.value + "\"]",
        "getByTestId",
        "static-literal",
        "high",
      );
    }
  }

  for (const match of text.matchAll(/classList\.(add|remove|toggle|contains|replace)\s*\(/g)) {
    const method = match[1];
    let cursor = match.index + match[0].length;
    const maximum = method === "replace" ? 2 : method === "add" || method === "remove" ? 12 : 1;
    for (let argumentIndex = 0; argumentIndex < maximum; argumentIndex += 1) {
      const argument = readArg(text, cursor);
      if (!argument || !argument.literal) break;
      const classes = argument.value
        .split(/\s+/)
        .filter((value) => /^-?[_a-zA-Z][\w-]*$/.test(value));
      for (const className of classes) {
        addOccurrence(
          path,
          text,
          match.index,
          "." + className,
          "classList." + method,
          "static-literal",
          "high",
        );
      }
      cursor = argument.end;
      while (/\s/.test(text[cursor] || "")) cursor += 1;
      if (text[cursor] !== ",") break;
      cursor += 1;
    }
  }

  for (const match of text.matchAll(/\.className\s*=\s*/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (!argument || !argument.literal || argument.value.includes("\${")) continue;
    for (const className of argument.value
      .split(/\s+/)
      .filter((value) => /^-?[_a-zA-Z][\w-]*$/.test(value))) {
      addOccurrence(
        path,
        text,
        match.index,
        "." + className,
        "className.assignment",
        "static-literal",
        "high",
      );
    }
  }

  for (const match of text.matchAll(/\.id\s*=\s*/g)) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal) {
      addOccurrence(path, text, match.index, "#" + argument.value, "id.assignment", "static-literal", "high");
    }
  }

  for (const match of text.matchAll(
    /\b(getAttribute|setAttribute|removeAttribute|hasAttribute|toHaveAttribute)\s*\(/g,
  )) {
    const argument = readArg(text, match.index + match[0].length);
    if (argument && argument.literal && argument.value.startsWith("data-")) {
      addOccurrence(
        path,
        text,
        match.index,
        "[" + argument.value + "]",
        match[1],
        "static-literal",
        "high",
      );
    }
    if (match[1] === "setAttribute" && argument && argument.literal && argument.value === "class") {
      let cursor = argument.end;
      while (/\s/.test(text[cursor] || "")) cursor += 1;
      if (text[cursor] === ",") cursor += 1;
      const classArgument = readArg(text, cursor);
      if (classArgument && classArgument.literal && !classArgument.value.includes("\${")) {
        for (const className of classArgument.value
          .split(/\s+/)
          .filter((value) => /^-?[_a-zA-Z][\w-]*$/.test(value))) {
          addOccurrence(
            path,
            text,
            match.index,
            "." + className,
            "setAttribute.class",
            "static-literal",
            "high",
          );
        }
      }
    }
  }

  for (const match of text.matchAll(/\.dataset\??\.([A-Za-z_$][\w$]*)|\.dataset\[['"]([^'"]+)['"]\]/g)) {
    addOccurrence(
      path,
      text,
      match.index,
      "[data-" + kebabCase(match[1] || match[2]) + "]",
      "dataset",
      "static-property",
      "high",
    );
  }

  for (const match of text.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*Selectors)\s*=\s*\[([\s\S]*?)\]\s*;/g,
  )) {
    for (const stringMatch of match[2].matchAll(/(["'])(.*?)\1/g)) {
      if (/^[.#\[]/.test(stringMatch[2].trim())) {
        addOccurrence(
          path,
          text,
          match.index,
          stringMatch[2],
          "selector-array",
          "bounded-selector-array",
          "high",
        );
      }
    }
  }
}

const manualBindings = [
  [".cruor-home__tool-card", "app/HomePage.jsx", 614, "measurement-ref", ["layout", "behavior"], ["measurement", "height-transition"], "cardRef is read through offsetHeight and receives an inline height transition."],
  [".cruor-home__sources-carousel", "app/HomePage.jsx", 912, "measurement-ref", ["layout", "behavior", "state"], ["measurement", "pointer-drag", "animation"], "viewportRef owns pointer capture and transient drag/inertia classes."],
  [".cruor-home__sources-carousel-track", "app/HomePage.jsx", 920, "measurement-ref", ["layout", "behavior"], ["measurement", "animation"], "trackRef supplies scrollWidth and computed transform for the carousel loop."],
  ["#workbenchFlow", "app/HomePage.jsx", 1273, "measurement-ref", ["layout", "behavior", "state"], ["measurement", "scroll-animation"], "workbenchFlowRef and section offsets drive the staged scroll flow."],
  [".site-topbar__nav-button", "app/navigation/SiteTopbar.jsx", 299, "measurement-ref", ["layout", "behavior"], ["measurement", "popover-positioning"], "The stored trigger ref is measured to position the mega menu."],
  [".site-mega-menu", "app/navigation/SiteMegaMenu.jsx", 77, "portal-or-positioned-ref", ["layout", "behavior"], ["focus-management", "positioning"], "menuRef participates in focus management and positioned menu behavior."],
  [".map-viewport", "features/darken-location/map-generator/map-generator.page.jsx", 3258, "measurement-ref", ["layout", "behavior"], ["measurement", "pointer-coordinates", "resize-observer"], "viewportRef is repeatedly measured for fit, zoom, pan, and pointer coordinate conversion."],
  [".room-style-context-menu", "features/darken-location/map-generator/map-generator.page.jsx", 3977, "measurement-ref", ["layout", "behavior"], ["measurement", "adaptive-menu-positioning"], "menuRef width, height, children, and submenu geometry determine viewport placement."],
  ["[data-room-menu-group]", "features/darken-location/map-generator/map-generator.page.jsx", 3854, "measurement-selector-family", ["layout", "behavior", "state"], ["measurement", "adaptive-submenu-positioning"], "A value-qualified data-room-menu-group selector resolves the active measured menu item."],
  [".room-context-submenu", "features/darken-location/map-generator/map-generator.page.jsx", 3856, "measurement-selector-family", ["layout", "behavior"], ["measurement", "adaptive-submenu-positioning"], "The direct child submenu is measured for flyout size and direction."],
  [".location-map-toolbar__style-menu-trigger", "features/darken-location/map-generator/map-generator.page.jsx", 5616, "measurement-ref", ["layout", "behavior"], ["measurement", "portal-positioning"], "triggerRef geometry positions the portaled Map Style panel."],
  [".map-control-select-trigger", "features/darken-location/map-generator/map-generator.page.jsx", 6161, "measurement-ref", ["layout", "behavior"], ["measurement", "portal-positioning"], "triggerRef geometry positions custom select menus."],
  [".map-control-select-menu", "features/darken-location/map-generator/map-generator.page.jsx", 6173, "portal-or-positioned-ref", ["layout", "behavior"], ["portal-positioning", "outside-dismiss"], "menuRef owns the portaled custom select and outside-click boundary."],
  [".anatomy-stage__grid--grafts", "features/monster-composer/components/monster-composer.anatomy.jsx", 2224, "measurement-ref", ["layout", "behavior"], ["measurement", "resize-observer", "connector-routing"], "graftGridRef is the coordinate root for SVG connector paths."],
  [".monster-silhouette-node", "features/monster-composer/components/monster-composer.anatomy.jsx", 1454, "measurement-ref", ["layout", "behavior"], ["measurement", "connector-routing"], "Node refs are measured to calculate connector endpoints."],
  [".monster-silhouette-slot-card", "features/monster-composer/components/monster-composer.anatomy.jsx", 2090, "measurement-ref", ["layout", "behavior"], ["measurement", "connector-routing"], "Slot-card refs are measured to calculate connector endpoints."],
  [".monster-frame-select-field", "features/monster-composer/components/monster-composer.anatomy.jsx", 1590, "measurement-ref", ["layout", "behavior"], ["measurement", "portal-positioning"], "fieldRef contributes the clamped portal top coordinate."],
  [".monster-frame-select-trigger", "features/monster-composer/components/monster-composer.anatomy.jsx", 1600, "measurement-ref", ["layout", "behavior"], ["measurement", "portal-positioning"], "triggerRef controls the portaled menu side, size, and anchor."],
  [".monster-frame-select-menu", "features/monster-composer/components/monster-composer.anatomy.jsx", 1613, "portal-or-positioned-ref", ["layout", "behavior"], ["portal-positioning", "outside-dismiss"], "menuRef defines the portaled menu outside-click boundary."],
  [".cruor-tooltip", "shared/tooltips/tooltip.runtime.js", 39, "measurement-ref", ["layout", "behavior"], ["measurement", "portal-positioning"], "Tooltip bounds are measured against viewport or map boundary geometry."],
  [".map-viewport, .map-viewport-frame, .map-canvas-area", "shared/tooltips/tooltip.runtime.js", 5, "measurement-selector-family", ["layout", "behavior"], ["measurement", "tooltip-boundary"], "The resolved closest map boundary is measured to clamp tooltip placement."],
];

for (const item of manualBindings) {
  const selector = normalizeSelector(item[0]);
  const path = item[1];
  occurrences.push({
    selector,
    path,
    line: item[2],
    api: item[3],
    activity: classifyActivity(path),
    roles: item[4].slice().sort(),
    concerns: item[5],
    evidence: "manual-source-review",
    confidence: "high",
    context: item[6],
  });
}

for (const name of ["theme", "contrast", "motion", "text", "focus", "tooltips", "scrollbar"]) {
  occurrences.push({
    selector: "[data-a11y-" + name + "]",
    path: "shared/accessibility/accessibility.settings.js",
    line: 219,
    api: "dataset.dynamic-assignment",
    activity: "runtime",
    roles: ["behavior", "state"],
    concerns: ["dom-state-contract", "css-mode-switch"],
    evidence: "manual-resolution-of-bounded-setting-keys",
    confidence: "high",
    context: "applyAccessibilitySettingsToDocument writes every normalized accessibility group to root.dataset.",
  });
}

const seenOccurrence = new Set();
const uniqueOccurrences = occurrences.filter((entry) => {
  const key = [entry.selector, entry.path, entry.line, entry.api, entry.context].join("|");
  if (seenOccurrence.has(key)) return false;
  seenOccurrence.add(key);
  return true;
});

const grouped = new Map();
for (const occurrence of uniqueOccurrences) {
  if (!grouped.has(occurrence.selector)) grouped.set(occurrence.selector, []);
  grouped.get(occurrence.selector).push(occurrence);
}

const records = Array.from(grouped.entries())
  .sort((left, right) => left[0].localeCompare(right[0]))
  .map(([selector, consumers]) => {
    consumers.sort(
      (left, right) =>
        left.path.localeCompare(right.path) || left.line - right.line || left.api.localeCompare(right.api),
    );
    return {
      selector,
      selectorKind: selectorKind(selector),
      roles: Array.from(new Set(consumers.flatMap((consumer) => consumer.roles))).sort(),
      activities: Array.from(new Set(consumers.map((consumer) => consumer.activity))).sort(),
      unsafeToRemove: true,
      factStatus: "confirmed",
      confidence: consumers.some((consumer) => consumer.confidence === "medium") ? "medium" : "high",
      consumers,
    };
  });

const dynamicSeen = new Set();
const unresolvedDynamicSelectors = dynamicSelectors
  .filter((entry) => {
    const key = [entry.path, entry.line, entry.api, entry.expression].join("|");
    if (dynamicSeen.has(key)) return false;
    dynamicSeen.add(key);
    return true;
  })
  .sort((left, right) => left.path.localeCompare(right.path) || left.line - right.line)
  .map((entry) => ({
    ...entry,
    factStatus: "confirmed-dynamic",
    migrationNote:
      entry.path === "features/crucible/crucible.mount.js"
        ? "The selector variable is bounded by advancedSelectors/debugSelectors; static array members are separately inventoried."
        : entry.path === "scripts/compare-site-elements.mjs"
          ? "The selector comes from a user-supplied comparison preset or CLI configuration and cannot be enumerated from tracked files."
          : "Resolve the runtime producer before renaming any candidate selector.",
  }));

const activityCounts = {};
const roleCounts = {};
for (const record of records) {
  for (const activity of record.activities) activityCounts[activity] = (activityCounts[activity] || 0) + 1;
  for (const role of record.roles) roleCounts[role] = (roleCounts[role] || 0) + 1;
}

const result = {
  schemaVersion: 1,
  schema: {
    recordKey: "selector",
    pathFormat: "repository-relative POSIX",
    confidenceValues: ["high", "medium", "low"],
    factStatusValues: ["confirmed", "confirmed-dynamic", "heuristic"],
    activityValues: [
      "runtime",
      "active-unit-test",
      "active-e2e-test",
      "active-qa-test",
      "qa-tooling",
      "inactive-test",
      "legacy-duplicate-test",
      "reference-test",
      "dev-reference",
      "legacy-reference",
    ],
    roleValues: ["visual", "layout", "behavior", "testing", "analytics", "state"],
    roleDefinitions: {
      visual: "Imperative class or DOM state changes visual presentation.",
      layout: "The selector is tied to geometry, scrolling, positioning, portals, or measurements.",
      behavior: "Runtime lookup, event delegation, focus management, mutation, export, or interaction consumes the selector.",
      testing: "An automated test, QA script, fixture, screenshot helper, or comparison tool consumes the selector.",
      analytics: "Telemetry or product analytics consumes the selector; none were found in tracked runtime code.",
      state: "A class or data attribute is read or written as DOM state.",
    },
    consumerRequiredFields: [
      "path",
      "line",
      "api",
      "activity",
      "roles",
      "evidence",
      "confidence",
      "context",
    ],
  },
  audit: {
    date: "2026-07-12",
    startingCommit: STARTING_COMMIT,
    scope: {
      trackedExtensions: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".html"],
      trackedFilesScanned: files.length,
      excludedDirectories: ["node_modules", "dist", "build", "coverage", "playwright-report"],
      includedConsumers: [
        "runtime selector APIs",
        "event delegation",
        "imperative class and data-state mutation",
        "DOM measurement and portal bindings",
        "active Vitest and Playwright",
        "inactive and legacy duplicate tests",
        "QA, screenshot, comparison, and generated-gallery scripts",
      ],
    },
    methodology: [
      "Static literals and resolvable local selector constants were extracted from tracked files.",
      "Imperative classList, className, id, data-attribute, and data-testid contracts were normalized to CSS selector notation.",
      "Measurement and portal bindings that use React refs instead of querySelector were source-reviewed and added explicitly.",
      "Records aggregate unique consumers by normalized selector; unresolved runtime selector expressions remain separate.",
      "JSX className values used only for visual styling are outside this dependency file unless also tied to behavior, state, testing, measurement, or portals.",
    ],
    testConfigurationFacts: [
      "vitest.config.js includes app/**/*.test, features/**/*.test, and shared/**/*.test only.",
      "playwright.config.js uses tests/e2e only.",
      "tests/unit, tests/smoke.test.js, tests/tests, and tests/tests/tests are outside the active Vitest and Playwright includes.",
      "scripts/run-circle-connector-diagnostics.test.js is active only through scripts/vitest.circle-connectors.config.mjs.",
    ],
  },
  summary: {
    uniqueSelectors: records.length,
    uniqueConsumerOccurrences: uniqueOccurrences.length,
    unresolvedDynamicSelectorExpressions: unresolvedDynamicSelectors.length,
    recordsByActivity: Object.fromEntries(Object.entries(activityCounts).sort()),
    recordsByRole: Object.fromEntries(Object.entries(roleCounts).sort()),
    analyticsSelectorDependenciesFound: 0,
  },
  records,
  unresolvedDynamicSelectors,
};

const compactJson = JSON.stringify(result);
const lines = [];
const targetLineLength = 24000;
let lineStart = 0;
let lastSafeBreak = 0;
let insideString = false;
let escaped = false;
for (let index = 0; index < compactJson.length; index += 1) {
  const character = compactJson[index];
  if (insideString) {
    if (escaped) escaped = false;
    else if (character === "\\") escaped = true;
    else if (character === '"') insideString = false;
  } else if (character === '"') {
    insideString = true;
  } else if (character === "," || character === "}" || character === "]") {
    lastSafeBreak = index + 1;
  }
  if (index - lineStart >= targetLineLength && lastSafeBreak > lineStart) {
    lines.push(compactJson.slice(lineStart, lastSafeBreak));
    lineStart = lastSafeBreak;
  }
}
if (lineStart < compactJson.length) lines.push(compactJson.slice(lineStart));
const chunkSize = 1;
const renderedJson = `${lines.join("\n")}\n`;
const outputPath = "docs/design-system/audit/selector-dependencies.json";
const mode = process.argv[2];

if (mode === "write") {
  JSON.parse(renderedJson);
  fs.writeFileSync(outputPath, renderedJson, "utf8");
  process.stdout.write(`Wrote ${outputPath} (${result.summary.uniqueSelectors} selectors).\n`);
} else if (mode === "--check") {
  const currentJson = fs.readFileSync(outputPath, "utf8");
  JSON.parse(currentJson);
  if (currentJson !== renderedJson) {
    process.stderr.write(`${outputPath} is stale. Run this generator with the write argument.\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`${outputPath} is current and valid.\n`);
  }
} else if (mode === "meta") {
  process.stdout.write(
    JSON.stringify({
      lineCount: lines.length,
      chunkSize,
      chunkCount: Math.ceil(lines.length / chunkSize),
      byteCount: Buffer.byteLength(renderedJson),
      summary: result.summary,
    }),
  );
} else {
  const chunkIndex = Number(mode || 0);
  process.stdout.write(lines.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize).join("\n") + "\n");
}
