export const MONSTER_GRAFT_SOURCE_AUTHORITY_SCHEMA_VERSION =
  "monster-graft-source-authority-v1.0";

export const MONSTER_GRAFT_SOURCE_AUTHORITY_MODES = Object.freeze({
  NATIVE_LEGACY: "native-legacy",
  REGISTRY_SHADOW: "registry-shadow",
  REGISTRY_CANONICAL: "registry-canonical",
});

const DEFAULT_AUTHORITY = Object.freeze({
  schemaVersion: MONSTER_GRAFT_SOURCE_AUTHORITY_SCHEMA_VERSION,
  sourceId: "",
  mode: MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY,
  allowNativeFallback: true,
  migrationWindow: "legacy",
  note: "Unregistered monster sources remain native-authoritative until explicitly migrated.",
});

function defineSourceAuthority(sourceId, config = {}) {
  return Object.freeze({
    ...DEFAULT_AUTHORITY,
    ...config,
    sourceId,
  });
}

/**
 * Source-by-source migration manifest.
 *
 * Phase 1 deliberately keeps every current production family native-authoritative.
 * A source may move to REGISTRY_SHADOW only after canonical shared components exist,
 * and to REGISTRY_CANONICAL only after parity, coverage and editorial gates pass.
 */
export const MONSTER_GRAFT_SOURCE_AUTHORITY = Object.freeze({
  decomposition: defineSourceAuthority("decomposition", {
    mode: MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY,
    migrationWindow: "phase-1-baseline",
  }),
  jikininki: defineSourceAuthority("jikininki", {
    mode: MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY,
    migrationWindow: "phase-1-baseline",
  }),
  "wolf-spiders": defineSourceAuthority("wolf-spiders", {
    mode: MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY,
    migrationWindow: "phase-1-baseline",
  }),
  "wax-death-masks": defineSourceAuthority("wax-death-masks", {
    mode: MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY,
    migrationWindow: "phase-1-baseline",
  }),
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeStringArray(value) {
  return asArray(value).map(normalizeString).filter(Boolean);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function uniqueArray(values) {
  return [...new Set(normalizeStringArray(values))];
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function toComparableGraft(graft = {}) {
  return stableValue({
    id: graft.id,
    title: graft.title,
    slot: graft.slot,
    section: graft.section,
    source: graft.source,
    sourceAnchors: normalizeStringArray(graft.sourceAnchors),
    sourceTypes: normalizeStringArray(graft.sourceTypes),
    themes: normalizeStringArray(graft.themes),
    motifs: normalizeStringArray(graft.motifs),
    contexts: normalizeStringArray(graft.contexts),
    horror: normalizeStringArray(graft.horror),
    typeBias: normalizeStringArray(graft.typeBias),
    roleBias: normalizeStringArray(graft.roleBias),
    grants: normalizeStringArray(graft.grants),
    cost: Number(graft.cost || 0),
    complexity: Number(graft.complexity || 0),
    stats: graft.stats || {},
    balanceProfile: graft.balanceProfile || null,
    fit: graft.fit || null,
    rules: graft.rules || null,
    constraints: graft.constraints || graft.anatomyConstraints || null,
    anatomyGrants: graft.anatomyGrants || null,
    summary: graft.summary || "",
    mechanics: graft.mechanics || "",
    counterplay: graft.counterplay || "",
    i18n: graft.i18n || {},
    schemaVersion: graft.schemaVersion || graft.graftSchemaVersion || null,
    kind: graft.kind || null,
    identity: graft.identity || null,
    abilities: graft.abilities || null,
    routine: graft.routine || null,
    progression: graft.progression || null,
    modifiers: graft.modifiers || null,
    compatibility: graft.compatibility || null,
    hooks: graft.hooks || null,
    migration: graft.migration || null,
    pressureProfile: graft.pressureProfile || null,
    complexityProfile: graft.complexityProfile || null,
    counterplayProfile: graft.counterplayProfile || null,
    spikeRiskProfile: graft.spikeRiskProfile || null,
  });
}

function mergeI18n(primary = {}, secondary = {}) {
  return {
    ...(secondary || {}),
    ...(primary || {}),
  };
}

function mergeNativePreferred(nativeGraft, registryGraft) {
  if (!nativeGraft) return registryGraft || null;
  if (!registryGraft) return nativeGraft;

  return {
    ...registryGraft,
    ...nativeGraft,
    sourceAnchors: uniqueArray([
      ...(nativeGraft.sourceAnchors || []),
      ...(registryGraft.sourceAnchors || []),
    ]),
    i18n: mergeI18n(nativeGraft.i18n, registryGraft.i18n),
    contentPack: registryGraft.contentPack || nativeGraft.contentPack,
    registry: registryGraft.registry || nativeGraft.registry,
  };
}

function mergeRegistryPreferred(nativeGraft, registryGraft) {
  if (!registryGraft) return nativeGraft || null;
  if (!nativeGraft) return registryGraft;

  return {
    ...nativeGraft,
    ...registryGraft,
    sourceAnchors: uniqueArray([
      ...(registryGraft.sourceAnchors || []),
      ...(nativeGraft.sourceAnchors || []),
    ]),
    i18n: mergeI18n(registryGraft.i18n, nativeGraft.i18n),
    contentPack: registryGraft.contentPack || nativeGraft.contentPack,
    registry: registryGraft.registry || nativeGraft.registry,
  };
}

export function getMonsterGraftSourceId(graft = {}) {
  return normalizeString(graft?.sourceAnchors?.[0] || graft?.source);
}

export function getMonsterGraftSourceAuthority(
  sourceId = "",
  manifest = MONSTER_GRAFT_SOURCE_AUTHORITY,
) {
  const normalizedSourceId = normalizeString(sourceId);
  return (
    manifest?.[normalizedSourceId] ||
    Object.freeze({
      ...DEFAULT_AUTHORITY,
      sourceId: normalizedSourceId,
    })
  );
}

export function isCanonicalRegistryMonsterGraft(graft = {}) {
  const authoring = graft?.authoring || graft?.monster?.authoring || {};
  return Boolean(
    authoring.canonical === true &&
      ["registry", "inspiration-module", "content-pack", "cms"].includes(
        normalizeString(authoring.origin),
      ),
  );
}

export function selectMonsterGraftRepresentation({
  nativeGraft = null,
  registryGraft = null,
  authority = null,
  manifest = MONSTER_GRAFT_SOURCE_AUTHORITY,
} = {}) {
  const nativeSourceId = getMonsterGraftSourceId(nativeGraft);
  const registrySourceId = getMonsterGraftSourceId(registryGraft);
  const sourceId = nativeSourceId || registrySourceId;
  const sourceMismatch = Boolean(
    nativeSourceId && registrySourceId && nativeSourceId !== registrySourceId,
  );
  const resolvedAuthority =
    authority || getMonsterGraftSourceAuthority(sourceId, manifest);
  const registryIsCanonical = isCanonicalRegistryMonsterGraft(registryGraft);
  let selectedOrigin = "none";
  let fallbackUsed = false;
  let fallbackReason = "";
  let graft = null;

  if (
    resolvedAuthority.mode ===
    MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.REGISTRY_CANONICAL
  ) {
    if (registryGraft && registryIsCanonical) {
      selectedOrigin = "registry";
      graft = mergeRegistryPreferred(nativeGraft, registryGraft);
    } else if (nativeGraft && resolvedAuthority.allowNativeFallback !== false) {
      selectedOrigin = "native";
      fallbackUsed = true;
      fallbackReason = registryGraft
        ? "registry-entry-is-not-canonical"
        : "registry-entry-missing";
      graft = mergeNativePreferred(nativeGraft, registryGraft);
    } else if (registryGraft) {
      selectedOrigin = "registry";
      fallbackUsed = true;
      fallbackReason = "non-canonical-registry-entry-selected-without-native-fallback";
      graft = registryGraft;
    }
  } else {
    selectedOrigin = nativeGraft ? "native" : registryGraft ? "registry" : "none";
    fallbackUsed = !nativeGraft && Boolean(registryGraft);
    fallbackReason = fallbackUsed ? "native-entry-missing" : "";
    graft = mergeNativePreferred(nativeGraft, registryGraft);
  }

  const comparableNative = nativeGraft ? toComparableGraft(nativeGraft) : null;
  const comparableRegistry = registryGraft ? toComparableGraft(registryGraft) : null;

  return {
    graft,
    audit: {
      schemaVersion: MONSTER_GRAFT_SOURCE_AUTHORITY_SCHEMA_VERSION,
      id: graft?.id || nativeGraft?.id || registryGraft?.id || "",
      sourceId,
      nativeSourceId,
      registrySourceId,
      sourceMismatch,
      authorityMode: resolvedAuthority.mode,
      selectedOrigin,
      nativeAvailable: Boolean(nativeGraft),
      registryAvailable: Boolean(registryGraft),
      registryIsCanonical,
      fallbackUsed,
      fallbackReason,
      representationsEquivalent:
        comparableNative && comparableRegistry
          ? JSON.stringify(comparableNative) === JSON.stringify(comparableRegistry)
          : null,
    },
  };
}

export function resolveMonsterGraftCatalogue({
  nativeGrafts = [],
  registryGrafts = [],
  manifest = MONSTER_GRAFT_SOURCE_AUTHORITY,
} = {}) {
  const nativeById = new Map(
    asArray(nativeGrafts)
      .filter((graft) => graft?.id)
      .map((graft) => [graft.id, graft]),
  );
  const registryById = new Map(
    asArray(registryGrafts)
      .filter((graft) => graft?.id)
      .map((graft) => [graft.id, graft]),
  );
  // Preserve the pre-Phase-1 catalogue ordering: registry entries establish the
  // first-seen position, while native-only compatibility grafts append afterward.
  // Authority changes which representation wins, never where the graft appears.
  const ids = uniqueArray([
    ...registryById.keys(),
    ...nativeById.keys(),
  ]);
  const rows = ids.map((id) =>
    selectMonsterGraftRepresentation({
      nativeGraft: nativeById.get(id) || null,
      registryGraft: registryById.get(id) || null,
      manifest,
    }),
  );

  const grafts = rows.map((row) => row.graft).filter(Boolean);
  const auditRows = rows.map((row) => row.audit);

  return {
    grafts,
    audit: {
      schemaVersion: MONSTER_GRAFT_SOURCE_AUTHORITY_SCHEMA_VERSION,
      nativeGrafts: nativeById.size,
      registryGrafts: registryById.size,
      totalGrafts: grafts.length,
      selectedNative: auditRows.filter((row) => row.selectedOrigin === "native").length,
      selectedRegistry: auditRows.filter((row) => row.selectedOrigin === "registry").length,
      canonicalRegistryEntries: auditRows.filter((row) => row.registryIsCanonical).length,
      sourceMismatches: auditRows.filter((row) => row.sourceMismatch).length,
      fallbacks: auditRows.filter((row) => row.fallbackUsed).length,
      nativeOnly: auditRows.filter(
        (row) => row.nativeAvailable && !row.registryAvailable,
      ).length,
      registryOnly: auditRows.filter(
        (row) => !row.nativeAvailable && row.registryAvailable,
      ).length,
      equivalentRepresentations: auditRows.filter(
        (row) => row.representationsEquivalent === true,
      ).length,
      divergentRepresentations: auditRows.filter(
        (row) => row.representationsEquivalent === false,
      ).length,
      byAuthorityMode: Object.fromEntries(
        Object.values(MONSTER_GRAFT_SOURCE_AUTHORITY_MODES).map((mode) => [
          mode,
          auditRows.filter((row) => row.authorityMode === mode).length,
        ]),
      ),
      rows: auditRows,
    },
  };
}
