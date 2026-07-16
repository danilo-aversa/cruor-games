import {
  cleanText,
  cloneJson,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  findDuplicates,
  normalizeEnum,
  normalizeId,
  normalizeStringSet,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import {
  normalizeInspirationModuleV2,
  validateInspirationModuleV2,
} from "./inspiration-module-v2.js";
import { PACK_STATUSES, SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

const PACK_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "version",
  "status",
  "locale",
  "author",
  "license",
  "tags",
  "modules",
  "metadata",
]);

export function normalizeContentPackV0_2(value = {}) {
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    id: normalizeId(value.id),
    title: cleanText(value.title),
    version: cleanText(value.version) || "0.2.0",
    status: normalizeEnum(value.status, PACK_STATUSES, "draft"),
    locale: cleanText(value.locale) || "en",
    author: cleanText(value.author) || "Cruor Games",
    license: cleanText(value.license) || "internal-prototype",
    tags: normalizeStringSet(value.tags, { ids: true }),
    modules: (Array.isArray(value.modules) ? value.modules : [])
      .map(normalizeInspirationModuleV2)
      .sort((left, right) => left.id.localeCompare(right.id)),
    metadata: cloneJson(value.metadata, {}),
  });
}

export function validateContentPackV0_2(value = {}, { path = "pack" } = {}) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, PACK_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.title, `${path}.title`, issues);
  requireText(value.version, `${path}.version`, issues);
  requireText(value.locale, `${path}.locale`, issues);
  requireText(value.author, `${path}.author`, issues);
  requireText(value.license, `${path}.license`, issues);
  if (!PACK_STATUSES.includes(value.status)) {
    pushIssue(
      issues,
      "pack.invalid-status",
      `${path}.status`,
      `Unknown pack status: ${cleanText(value.status)}.`,
    );
  }
  requireArray(value.tags, `${path}.tags`, issues);
  requirePlainObject(value.metadata, `${path}.metadata`, issues);

  if (requireArray(value.modules, `${path}.modules`, issues)) {
    value.modules.forEach((module, index) => {
      const modulePath = `${path}.modules[${index}]`;
      issues.push(...validateInspirationModuleV2(module, { path: modulePath }));
      if (module.packId !== value.id) {
        pushIssue(
          issues,
          "pack.module-ownership",
          `${modulePath}.packId`,
          `Module packId ${module.packId || "(missing)"} does not match pack ${value.id}.`,
        );
      }
    });
    findDuplicates(value.modules, (module) => module.id).forEach((id) => {
      pushIssue(
        issues,
        "pack.duplicate-module-id",
        `${path}.modules`,
        `Duplicate module id: ${id}.`,
      );
    });
  }

  if (value.status === "published" && !value.modules?.length) {
    pushIssue(
      issues,
      "pack.module-required",
      `${path}.modules`,
      "Published semantic packs require at least one module.",
    );
  }
  return issues;
}

export function parseContentPackV0_2(value = {}, options = {}) {
  const normalized = normalizeContentPackV0_2(value);
  return createParseResult(normalized, validateContentPackV0_2(value, options));
}
