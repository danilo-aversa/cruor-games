import {
  cleanText,
  collectUnknownFields,
  createIssue,
  createParseResult,
  deepFreeze,
  findDuplicates,
  normalizeEnum,
  normalizeId,
  normalizeInteger,
  normalizeStringSet,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
  slugifyLegacyId,
} from "./contract-utils.js";
import {
  normalizeComponentV2,
  normalizeLegacyComponentV2,
  validateComponentV2,
} from "./component-v2.js";
import {
  normalizeInspirationV2,
  normalizeLegacyInspiration,
  validateInspirationV2,
} from "./inspiration-v2.js";
import {
  createCompatibilityProvenance,
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import {
  MODULE_STATUSES,
  SEMANTIC_CAPABILITIES,
  SEMANTIC_SCHEMA_VERSIONS,
} from "./schema-versions.js";
import {
  normalizeLegacySourceAnchor,
  normalizeSourceAnchorV1,
  validateSourceAnchorV1,
} from "./source-anchor-v1.js";

const MODULE_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "title",
  "packId",
  "status",
  "locale",
  "capabilities",
  "sourceAnchor",
  "inspiration",
  "components",
  "metadata",
  "provenance",
]);
const METADATA_FIELDS = Object.freeze([
  "author",
  "revision",
  "reviewedAt",
  "sourceFile",
  "capabilityWaivers",
]);

const DARK_PLACES_REQUIRED_SEMANTIC_TYPES = Object.freeze([
  "place-identity",
  "site-atmosphere",
  "global-rule",
  "recurring-sign",
  "sensory-profile",
  "read-aloud-profile",
  "session-guide",
]);

export function normalizeInspirationModuleV2(value = {}) {
  const metadata = value.metadata || {};
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    id: normalizeId(value.id),
    title: cleanText(value.title),
    packId: normalizeId(value.packId),
    status: normalizeEnum(value.status, MODULE_STATUSES, "draft"),
    locale: cleanText(value.locale) || "en",
    capabilities: normalizeStringSet(value.capabilities, { ids: true }),
    sourceAnchor: normalizeSourceAnchorV1(value.sourceAnchor),
    inspiration: normalizeInspirationV2(value.inspiration),
    components: (Array.isArray(value.components) ? value.components : [])
      .map(normalizeComponentV2)
      .sort((left, right) => left.id.localeCompare(right.id)),
    metadata: {
      author: cleanText(metadata.author) || "Cruor Games",
      revision: normalizeInteger(metadata.revision, 1, { min: 0, max: 999999 }),
      reviewedAt: cleanText(metadata.reviewedAt),
      sourceFile: cleanText(metadata.sourceFile),
      capabilityWaivers: normalizeStringSet(metadata.capabilityWaivers),
    },
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

function validateCapabilityCoverage(value, path, issues) {
  const semanticTypes = new Set(
    (value.components || []).map((component) => component.semanticType),
  );
  const published = value.status === "published";
  const severity = published ? "error" : "warning";

  if (value.capabilities.includes("dark-places")) {
    DARK_PLACES_REQUIRED_SEMANTIC_TYPES.forEach((semanticType) => {
      if (semanticTypes.has(semanticType)) return;
      pushIssue(
        issues,
        "module.dark-places-coverage",
        `${path}.components`,
        `Dark Places capability is missing semantic type: ${semanticType}.`,
        severity,
        { semanticType },
      );
    });

    const recurringSigns = value.components.filter(
      (component) => component.semanticType === "recurring-sign",
    ).length;
    if (published && recurringSigns > 0 && recurringSigns < 4) {
      pushIssue(
        issues,
        "module.recurring-sign-target",
        `${path}.components`,
        "Published Dark Places modules target at least four Recurring Signs.",
        "warning",
      );
    }
  }

  if (
    value.capabilities.includes("monster-composer") &&
    !value.components.some(
      (component) =>
        component.semanticType === "monster-graft" ||
        component.contentType === "monster-graft",
    )
  ) {
    pushIssue(
      issues,
      "module.monster-coverage",
      `${path}.components`,
      "Monster Composer capability requires at least one monster graft component.",
      severity,
    );
  }
}

export function validateInspirationModuleV2(
  value = {},
  { path = "module" } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, MODULE_FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    `${path}.schemaVersion`,
    issues,
  );
  requireId(value.id, `${path}.id`, issues);
  requireText(value.title, `${path}.title`, issues);
  requireId(value.packId, `${path}.packId`, issues);
  if (!MODULE_STATUSES.includes(value.status)) {
    pushIssue(
      issues,
      "module.invalid-status",
      `${path}.status`,
      `Unknown module status: ${cleanText(value.status)}.`,
    );
  }
  requireText(value.locale, `${path}.locale`, issues);

  if (requireArray(value.capabilities, `${path}.capabilities`, issues)) {
    value.capabilities.forEach((capability, index) => {
      if (!SEMANTIC_CAPABILITIES.includes(capability)) {
        pushIssue(
          issues,
          "module.unknown-capability",
          `${path}.capabilities[${index}]`,
          `Unknown capability: ${cleanText(capability)}.`,
        );
      }
    });
    if (!value.capabilities.includes("inspiration-archive")) {
      pushIssue(
        issues,
        "module.archive-capability-required",
        `${path}.capabilities`,
        "Every Inspiration module must declare inspiration-archive.",
      );
    }
  }

  issues.push(
    ...validateSourceAnchorV1(value.sourceAnchor, {
      path: `${path}.sourceAnchor`,
    }),
  );
  issues.push(
    ...validateInspirationV2(value.inspiration, {
      path: `${path}.inspiration`,
    }),
  );

  if (
    value.sourceAnchor?.id &&
    !value.inspiration?.sourceAnchors?.includes(value.sourceAnchor.id)
  ) {
    pushIssue(
      issues,
      "module.inspiration-source-mismatch",
      `${path}.inspiration.sourceAnchors`,
      `Inspiration does not reference the module Source Anchor: ${value.sourceAnchor.id}.`,
    );
  }

  if (requireArray(value.components, `${path}.components`, issues)) {
    value.components.forEach((component, index) => {
      issues.push(
        ...validateComponentV2(component, {
          path: `${path}.components[${index}]`,
        }),
      );
    });
    findDuplicates(value.components, (component) => component.id).forEach(
      (id) => {
        pushIssue(
          issues,
          "module.duplicate-component-id",
          `${path}.components`,
          `Duplicate component id: ${id}.`,
        );
      },
    );
  }

  if (requirePlainObject(value.metadata, `${path}.metadata`, issues)) {
    collectUnknownFields(
      value.metadata,
      METADATA_FIELDS,
      `${path}.metadata`,
      issues,
    );
    requireText(value.metadata.author, `${path}.metadata.author`, issues);
    if (
      !Number.isInteger(value.metadata.revision) ||
      value.metadata.revision < 0
    ) {
      pushIssue(
        issues,
        "module.invalid-revision",
        `${path}.metadata.revision`,
        "Module revision must be a non-negative integer.",
      );
    }
    requireArray(
      value.metadata.capabilityWaivers,
      `${path}.metadata.capabilityWaivers`,
      issues,
    );
  }

  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  validateCapabilityCoverage(value, path, issues);

  if (value.status === "published") {
    if (value.inspiration?.status !== "approved") {
      pushIssue(
        issues,
        "module.inspiration-not-approved",
        `${path}.inspiration.status`,
        "Published modules require an approved Inspiration editorial record.",
      );
    }
    if (value.provenance?.migration?.method === "compatibility-normalized") {
      pushIssue(
        issues,
        "module.published-legacy-normalization",
        `${path}.provenance.migration.method`,
        "Compatibility-normalized modules cannot be published.",
      );
    }
  }

  return issues;
}

export function parseInspirationModuleV2(value = {}, options = {}) {
  const normalized = normalizeInspirationModuleV2(value);
  return createParseResult(
    normalized,
    validateInspirationModuleV2(value, options),
  );
}

function inferLegacyCapabilities(module = {}) {
  const workflows = new Set([
    ...(module.sourceAnchor?.workflows || []),
    ...(module.inspiration?.workflows || []),
    ...(module.components || []).flatMap(
      (component) => component.workflows || [],
    ),
  ]);
  const capabilities = ["inspiration-archive"];
  if (
    workflows.has("darken-location") ||
    (module.components || []).some((component) =>
      ["location-component", "location-region"].includes(component.contentType),
    )
  ) {
    capabilities.push("dark-places");
  }
  if (
    workflows.has("monster-composer") ||
    (module.components || []).some(
      (component) => component.contentType === "monster-graft",
    )
  ) {
    capabilities.push("monster-composer");
  }
  return capabilities;
}

export function normalizeLegacyInspirationModuleV2(module = {}) {
  const moduleId = slugifyLegacyId(
    module.id ||
      module.sourceAnchor?.id ||
      module.inspiration?.id ||
      module.title,
  );
  const sourceAnchor = normalizeLegacySourceAnchor({
    id: module.sourceAnchor?.id || moduleId,
    ...(module.sourceAnchor || {}),
  });
  const inspiration = normalizeLegacyInspiration(
    module.inspiration || {},
    sourceAnchor,
  );
  const components = (
    Array.isArray(module.components) ? module.components : []
  ).map((component) =>
    normalizeLegacyComponentV2(component, [sourceAnchor.id]),
  );
  const provenance = createCompatibilityProvenance({
    sourceAnchorIds: [sourceAnchor.id],
    legacyIds: [module.id, module.inspiration?.legacyId].filter(Boolean),
    fromSchema:
      cleanText(module.schemaVersion) || "legacy-inspiration-module-v1",
  });

  return normalizeInspirationModuleV2({
    id: moduleId,
    title: cleanText(module.title || sourceAnchor.title || moduleId),
    packId: slugifyLegacyId(
      module.packId || module.contentPackId || "existing-inspirations",
    ),
    status: "draft",
    locale: cleanText(module.locale) || "en",
    capabilities: inferLegacyCapabilities(module),
    sourceAnchor,
    inspiration,
    components,
    metadata: {
      author: cleanText(module.metadata?.author) || "Cruor Games",
      revision: 0,
      reviewedAt: "",
      sourceFile: cleanText(
        module.metadata?.source || module.metadata?.sourceFile,
      ),
      capabilityWaivers: [],
    },
    provenance,
  });
}

export function createLegacyModuleDiagnostic(moduleId, componentCount) {
  return createIssue({
    code: "compatibility.legacy-module-normalized",
    severity: "warning",
    path: "module",
    message:
      `Legacy module ${moduleId} was normalized as a v2 draft with ${componentCount} components; ` +
      "editorial review and capability completion are required before publication.",
  });
}
