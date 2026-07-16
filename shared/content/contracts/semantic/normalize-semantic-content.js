import {
  cleanText,
  createIssue,
  deepFreeze,
  hasErrors,
  normalizeStringSet,
  slugifyLegacyId,
} from "./contract-utils.js";
import { normalizeComponentV2, validateComponentV2 } from "./component-v2.js";
import {
  normalizeContentPackV0_2,
  validateContentPackV0_2,
} from "./content-pack-v0.2.js";
import {
  normalizeInspirationModuleV2,
  normalizeLegacyInspirationModuleV2,
  createLegacyModuleDiagnostic,
  validateInspirationModuleV2,
} from "./inspiration-module-v2.js";
import {
  normalizeInspirationV2,
  validateInspirationV2,
} from "./inspiration-v2.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

const LEGACY_PACK_SCHEMA = "cruor-content-pack-v0.1";
const LEGACY_MODULE_SCHEMA = "legacy-inspiration-module-v1";

function createResult({
  kind,
  sourceSchema,
  targetSchema,
  mode,
  value,
  diagnostics,
}) {
  return deepFreeze({
    kind,
    sourceSchema,
    targetSchema,
    mode,
    value,
    diagnostics: [...diagnostics],
    valid: Boolean(value) && !hasErrors(diagnostics),
  });
}

function normalizeV2(input) {
  switch (input.schemaVersion) {
    case SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK: {
      const value = normalizeContentPackV0_2(input);
      return createResult({
        kind: "content-pack",
        sourceSchema: input.schemaVersion,
        targetSchema: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
        mode: "v2",
        value,
        diagnostics: validateContentPackV0_2(input),
      });
    }
    case SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE: {
      const value = normalizeInspirationModuleV2(input);
      return createResult({
        kind: "inspiration-module",
        sourceSchema: input.schemaVersion,
        targetSchema: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
        mode: "v2",
        value,
        diagnostics: validateInspirationModuleV2(input),
      });
    }
    case SEMANTIC_SCHEMA_VERSIONS.COMPONENT: {
      const value = normalizeComponentV2(input);
      return createResult({
        kind: "component",
        sourceSchema: input.schemaVersion,
        targetSchema: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
        mode: "v2",
        value,
        diagnostics: validateComponentV2(input),
      });
    }
    case SEMANTIC_SCHEMA_VERSIONS.INSPIRATION: {
      const value = normalizeInspirationV2(input);
      return createResult({
        kind: "inspiration",
        sourceSchema: input.schemaVersion,
        targetSchema: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
        mode: "v2",
        value,
        diagnostics: validateInspirationV2(input),
      });
    }
    default:
      return null;
  }
}

function looksLikeLegacyModule(input) {
  return Boolean(
    input &&
    typeof input === "object" &&
    (input.sourceAnchor || input.inspiration) &&
    Array.isArray(input.components),
  );
}

function looksLikeLegacyPack(input) {
  return Boolean(
    input &&
    typeof input === "object" &&
    input.collections &&
    typeof input.collections === "object",
  );
}

function getLegacyEntrySourceAnchorIds(entry = {}) {
  return normalizeStringSet(
    entry.sourceAnchors || entry.sourceAnchorIds || entry.sourceAnchorId,
    { ids: true },
  );
}

function normalizeLegacyModule(input, sourceSchema = LEGACY_MODULE_SCHEMA) {
  const value = normalizeLegacyInspirationModuleV2(input);
  const diagnostics = [
    createLegacyModuleDiagnostic(value.id, value.components.length),
    ...validateInspirationModuleV2(value),
  ];
  return createResult({
    kind: "inspiration-module",
    sourceSchema,
    targetSchema: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    mode: "v1-compatibility",
    value,
    diagnostics,
  });
}

function normalizeLegacyPack(input, sourceSchema = LEGACY_PACK_SCHEMA) {
  const collections = input.collections || {};
  const sourceAnchors = Array.isArray(collections.sourceAnchors)
    ? collections.sourceAnchors
    : [];
  const inspirations = Array.isArray(collections.inspirations)
    ? collections.inspirations
    : [];
  const components = Array.isArray(collections.components)
    ? collections.components
    : [];
  const sourceAnchorById = new Map(
    sourceAnchors.map((sourceAnchor) => [
      slugifyLegacyId(sourceAnchor.id),
      sourceAnchor,
    ]),
  );
  const packId = slugifyLegacyId(
    input.id || input.slug || "legacy-semantic-pack",
  );

  const modules = inspirations.map((inspiration) => {
    const sourceAnchorId =
      getLegacyEntrySourceAnchorIds(inspiration)[0] ||
      slugifyLegacyId(
        inspiration.slug || inspiration.id?.replace(/^inspiration-/, ""),
      );
    const sourceAnchor = sourceAnchorById.get(sourceAnchorId) || {
      id: sourceAnchorId,
      label: inspiration.title || sourceAnchorId,
      type: inspiration.sourceTypes?.[0] || "Other",
      status: inspiration.status || "draft",
      summary: inspiration.summary || inspiration.caption || "",
    };
    const moduleComponents = components.filter((component) =>
      getLegacyEntrySourceAnchorIds(component).includes(sourceAnchorId),
    );
    return normalizeLegacyInspirationModuleV2({
      id: sourceAnchorId,
      title: sourceAnchor.label || inspiration.title || sourceAnchorId,
      status: "draft",
      packId,
      locale: input.locale,
      sourceAnchor,
      inspiration,
      components: moduleComponents,
      metadata: {
        author: input.author,
        source: cleanText(input.metadata?.source),
      },
    });
  });

  const value = normalizeContentPackV0_2({
    id: packId,
    title: input.title || packId,
    version: input.version || "0.2.0-compatibility",
    status: "draft",
    locale: input.locale || "en",
    author: input.author || "Cruor Games",
    license: input.license || "internal-prototype",
    tags: input.tags,
    modules,
    metadata: {
      compatibilitySourceSchema: sourceSchema,
      compatibilitySourcePackId: input.id || "",
    },
  });
  const diagnostics = [
    createIssue({
      code: "compatibility.legacy-pack-normalized",
      severity: "warning",
      path: "pack",
      message:
        `Legacy pack ${input.id || "(unknown)"} was normalized into ${modules.length} v2 draft modules; ` +
        "no editorial approval was inferred.",
    }),
    ...modules.map((module) =>
      createLegacyModuleDiagnostic(module.id, module.components.length),
    ),
    ...validateContentPackV0_2(value),
  ];

  return createResult({
    kind: "content-pack",
    sourceSchema,
    targetSchema: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    mode: "v1-compatibility",
    value,
    diagnostics,
  });
}

export function normalizeSemanticContent(input, { sourceSchema = "" } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return createResult({
      kind: "unknown",
      sourceSchema: cleanText(sourceSchema) || "unknown",
      targetSchema: "",
      mode: "unsupported",
      value: null,
      diagnostics: [
        createIssue({
          code: "semantic-normalizer.object-required",
          path: "input",
          message: "Semantic content input must be an object.",
        }),
      ],
    });
  }

  const v2Result = normalizeV2(input);
  if (v2Result) return v2Result;

  if (looksLikeLegacyModule(input)) {
    return normalizeLegacyModule(
      input,
      cleanText(sourceSchema) || LEGACY_MODULE_SCHEMA,
    );
  }
  if (looksLikeLegacyPack(input)) {
    return normalizeLegacyPack(
      input,
      cleanText(sourceSchema) ||
        cleanText(input.schemaVersion) ||
        LEGACY_PACK_SCHEMA,
    );
  }

  return createResult({
    kind: "unknown",
    sourceSchema:
      cleanText(sourceSchema) || cleanText(input.schemaVersion) || "unknown",
    targetSchema: "",
    mode: "unsupported",
    value: null,
    diagnostics: [
      createIssue({
        code: "semantic-normalizer.unsupported-schema",
        path: "input.schemaVersion",
        message: `Unsupported semantic input schema: ${cleanText(input.schemaVersion) || "unversioned"}.`,
      }),
    ],
  });
}
