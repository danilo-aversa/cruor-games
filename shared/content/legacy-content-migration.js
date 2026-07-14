export const LEGACY_CONTENT_MIGRATION_SCHEMA_VERSION = "cruor-legacy-content-migration-v0.1";

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function stableSerialize(value) {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizeCandidate(candidate = {}) {
  return {
    path: String(candidate.path || "").trim(),
    value: candidate.value,
  };
}

export function resolveLegacyFieldCandidates(candidates = [], { objectOnly = false } = {}) {
  const resolvedCandidates = candidates
    .map(normalizeCandidate)
    .filter((candidate) => candidate.path)
    .filter((candidate) => candidate.value !== undefined && candidate.value !== null)
    .filter((candidate) => typeof candidate.value !== "string" || candidate.value.trim().length > 0)
    .filter((candidate) => !objectOnly || isPlainObject(candidate.value));
  const selected = resolvedCandidates[0] || null;
  const signatures = new Set(resolvedCandidates.map((candidate) => stableSerialize(candidate.value)));

  return Object.freeze({
    value: selected ? cloneValue(selected.value) : undefined,
    sourcePath: selected?.path || "",
    candidatePaths: Object.freeze(resolvedCandidates.map((candidate) => candidate.path)),
    ambiguous: signatures.size > 1,
  });
}

export function resolveLegacyObjectField(source = {}, field = "") {
  return resolveLegacyFieldCandidates(
    [
      { path: `location.${field}`, value: source?.location?.[field] },
      { path: `locationRegion.${field}`, value: source?.locationRegion?.[field] },
      { path: `map.${field}`, value: source?.map?.[field] },
      { path: `metadata.${field}`, value: source?.metadata?.[field] },
      { path: field, value: source?.[field] },
    ],
    { objectOnly: true },
  );
}

export function createLegacyContentMigration({
  fieldResolutions = {},
  sourceSchema = "legacy-content",
  targetSchema = "current-content",
} = {}) {
  const entries = Object.entries(fieldResolutions).filter(([, resolution]) => resolution);
  const ambiguousFields = entries
    .filter(([, resolution]) => resolution.ambiguous)
    .map(([field]) => field);
  const warnings = entries
    .filter(([, resolution]) => resolution.ambiguous)
    .map(
      ([field, resolution]) =>
        `Ambiguous legacy field ${field}; selected ${resolution.sourcePath} from ${resolution.candidatePaths.join(", ")}.`,
    );

  return Object.freeze({
    schemaVersion: LEGACY_CONTENT_MIGRATION_SCHEMA_VERSION,
    sourceSchema,
    targetSchema,
    status: warnings.length ? "review-required" : "normalized",
    fieldSources: Object.freeze(
      Object.fromEntries(entries.map(([field, resolution]) => [field, resolution.sourcePath || ""])),
    ),
    ambiguousFields: Object.freeze(ambiguousFields),
    warnings: Object.freeze(warnings),
  });
}
