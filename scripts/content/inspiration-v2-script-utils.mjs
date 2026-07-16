import { createHash } from "node:crypto";

import { STATIC_SEMANTIC_CONTENT_PACKS } from "../../shared/content/static-semantic-content-packs.js";

export function parseCliOptions(argv = process.argv.slice(2)) {
  return Object.fromEntries(
    argv.map((argument) => {
      const token = String(argument).replace(/^--/, "");
      const separator = token.indexOf("=");
      return separator === -1
        ? [token, true]
        : [token.slice(0, separator), token.slice(separator + 1)];
    }),
  );
}

export function getSemanticModuleCatalog() {
  return STATIC_SEMANTIC_CONTENT_PACKS.flatMap((pack) =>
    pack.modules.map((module) => ({ pack, module })),
  );
}

export function selectSemanticModules(moduleId = "") {
  const catalog = getSemanticModuleCatalog();
  return moduleId
    ? catalog.filter(({ module }) => module.id === moduleId)
    : catalog;
}

export function createSha256(value = "") {
  return createHash("sha256").update(value).digest("hex");
}

export function formatSummary(label, values = {}) {
  return `${label}: ${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ")}`;
}
