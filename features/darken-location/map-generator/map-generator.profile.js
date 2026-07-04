function hashStringToSeed(...parts) {
  const text = parts.join("::");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const ROOM_ARCHETYPE_SCHEMA_VERSION = "room-archetype-v0.2";

export const CRYPT_ROOM_ARCHETYPES = Object.freeze({
  "crypt-burial-cell": Object.freeze({
    id: "crypt-burial-cell",
    label: "Burial Cell",
    family: "crypt",
    contexts: Object.freeze(["crypt"]),
    shape: "rect",
    roomType: "none",
    maskProfile: "burial-cell",
    detailProfile: "burial-cell",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 3, maxW: 4, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Medium: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 6, maxW: 7, minH: 4, maxH: 5 }),
      Huge: Object.freeze({ minW: 7, maxW: 8, minH: 5, maxH: 6 }),
    }),
    motifs: Object.freeze(["tomb", "burial", "sealed dead"]),
  }),
  "ossuary-gallery": Object.freeze({
    id: "ossuary-gallery",
    label: "Ossuary Gallery",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "alcove",
    roomType: "alcove",
    maskProfile: "ossuary-gallery",
    detailProfile: "ossuary-gallery",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 5, maxW: 6, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 6, maxW: 7, minH: 4, maxH: 4 }),
      Medium: Object.freeze({ minW: 7, maxW: 9, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 9, maxW: 11, minH: 5, maxH: 6 }),
      Huge: Object.freeze({ minW: 11, maxW: 13, minH: 6, maxH: 7 }),
    }),
    motifs: Object.freeze(["bones", "alcoves", "display wall"]),
  }),
  "reliquary-niche": Object.freeze({
    id: "reliquary-niche",
    label: "Reliquary Niche",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "alcove",
    roomType: "alcove",
    maskProfile: "reliquary-niche",
    detailProfile: "reliquary-niche",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 3, maxW: 4, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Medium: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 6, maxW: 7, minH: 5, maxH: 6 }),
      Huge: Object.freeze({ minW: 7, maxW: 8, minH: 5, maxH: 7 }),
    }),
    motifs: Object.freeze(["reliquary", "niche", "devotional object"]),
  }),
  "charnel-vault": Object.freeze({
    id: "charnel-vault",
    label: "Charnel Vault",
    family: "crypt",
    contexts: Object.freeze(["crypt"]),
    shape: "notched",
    roomType: "alcove",
    maskProfile: "charnel-vault",
    detailProfile: "charnel-vault",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Small: Object.freeze({ minW: 6, maxW: 7, minH: 5, maxH: 5 }),
      Medium: Object.freeze({ minW: 7, maxW: 9, minH: 5, maxH: 6 }),
      Large: Object.freeze({ minW: 9, maxW: 11, minH: 6, maxH: 8 }),
      Huge: Object.freeze({ minW: 11, maxW: 13, minH: 7, maxH: 9 }),
    }),
    motifs: Object.freeze(["charnel", "bone heap", "mass burial"]),
  }),
  "sealed-family-tomb": Object.freeze({
    id: "sealed-family-tomb",
    label: "Sealed Family Tomb",
    family: "crypt",
    contexts: Object.freeze(["crypt", "noble-house"]),
    shape: "rect",
    roomType: "none",
    maskProfile: "sealed-family-tomb",
    detailProfile: "sealed-family-tomb",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 5 }),
      Medium: Object.freeze({ minW: 6, maxW: 8, minH: 5, maxH: 6 }),
      Large: Object.freeze({ minW: 8, maxW: 9, minH: 5, maxH: 7 }),
      Huge: Object.freeze({ minW: 9, maxW: 11, minH: 6, maxH: 8 }),
    }),
    motifs: Object.freeze(["family tomb", "sealed door", "lineage"]),
  }),
  "processional-crypt-hall": Object.freeze({
    id: "processional-crypt-hall",
    label: "Processional Crypt Hall",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "hall",
    roomType: "none",
    maskProfile: "processional-crypt-hall",
    detailProfile: "processional-crypt-hall",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 6, maxW: 7, minH: 3, maxH: 3 }),
      Small: Object.freeze({ minW: 7, maxW: 9, minH: 3, maxH: 4 }),
      Medium: Object.freeze({ minW: 9, maxW: 11, minH: 4, maxH: 4 }),
      Large: Object.freeze({ minW: 11, maxW: 13, minH: 4, maxH: 5 }),
      Huge: Object.freeze({ minW: 13, maxW: 14, minH: 5, maxH: 6 }),
    }),
    motifs: Object.freeze(["procession", "threshold", "crypt passage"]),
  }),
  "bone-well": Object.freeze({
    id: "bone-well",
    label: "Bone Well",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "shaft",
    roomType: "none",
    maskProfile: "bone-well",
    detailProfile: "bone-well",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 4, maxW: 5, minH: 4, maxH: 5 }),
      Small: Object.freeze({ minW: 5, maxW: 6, minH: 5, maxH: 6 }),
      Medium: Object.freeze({ minW: 6, maxW: 7, minH: 6, maxH: 7 }),
      Large: Object.freeze({ minW: 7, maxW: 9, minH: 7, maxH: 9 }),
      Huge: Object.freeze({ minW: 9, maxW: 10, minH: 9, maxH: 10 }),
    }),
    motifs: Object.freeze(["well", "vertical drop", "bone shaft"]),
  }),
  "hidden-reliquary": Object.freeze({
    id: "hidden-reliquary",
    label: "Hidden Reliquary",
    family: "crypt",
    contexts: Object.freeze(["crypt", "chapel"]),
    shape: "archive",
    roomType: "archive",
    maskProfile: "hidden-reliquary",
    detailProfile: "hidden-reliquary",
    sizeByPreset: Object.freeze({
      Tiny: Object.freeze({ minW: 4, maxW: 5, minH: 3, maxH: 4 }),
      Small: Object.freeze({ minW: 5, maxW: 6, minH: 4, maxH: 4 }),
      Medium: Object.freeze({ minW: 6, maxW: 7, minH: 4, maxH: 5 }),
      Large: Object.freeze({ minW: 7, maxW: 9, minH: 5, maxH: 6 }),
      Huge: Object.freeze({ minW: 9, maxW: 10, minH: 6, maxH: 7 }),
    }),
    motifs: Object.freeze(["hidden relic", "archive", "sacred storage"]),
  }),
});

export const ROOM_ARCHETYPES_BY_ID = Object.freeze({
  ...CRYPT_ROOM_ARCHETYPES,
});

export const ROOM_ARCHETYPE_OPTIONS = Object.freeze(
  Object.values(ROOM_ARCHETYPES_BY_ID).map((archetype) =>
    Object.freeze({
      id: archetype.id,
      label: archetype.label,
      family: archetype.family,
      contexts: Object.freeze([...(archetype.contexts || [])]),
    }),
  ),
);

const ROOM_ARCHETYPE_ALIASES = Object.freeze({
  burial: "crypt-burial-cell",
  "burial-cell": "crypt-burial-cell",
  crypt: "crypt-burial-cell",
  ossuary: "ossuary-gallery",
  gallery: "ossuary-gallery",
  "ossuary-wall-gallery": "ossuary-gallery",
  reliquary: "reliquary-niche",
  "reliquary-room": "reliquary-niche",
  charnel: "charnel-vault",
  vault: "charnel-vault",
  tomb: "sealed-family-tomb",
  "family-tomb": "sealed-family-tomb",
  hall: "processional-crypt-hall",
  "crypt-hall": "processional-crypt-hall",
  well: "bone-well",
  shaft: "bone-well",
  archive: "hidden-reliquary",
  "secret-reliquary": "hidden-reliquary",
});

export function normalizeRoomArchetypeId(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) return "";
  return ROOM_ARCHETYPES_BY_ID[normalized]
    ? normalized
    : ROOM_ARCHETYPE_ALIASES[normalized] || "";
}

export function getRoomArchetypeDefinition(id = "") {
  const normalized = normalizeRoomArchetypeId(id);
  return normalized ? ROOM_ARCHETYPES_BY_ID[normalized] || null : null;
}

function asList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function uniqueRoomArchetypeIds(values = []) {
  return [...new Set(asList(values).map(normalizeRoomArchetypeId).filter(Boolean))];
}

function getInfluencePreferredRoomArchetypes(influence = {}) {
  if (!influence || typeof influence !== "object" || Array.isArray(influence)) return [];
  return uniqueRoomArchetypeIds([
    influence.roomArchetype,
    influence.roomArchetypeId,
    influence.forcedRoomArchetype,
    influence.forcedRoomArchetypeId,
    influence.preferredRoomArchetype,
    influence.preferredRoomArchetypeId,
    ...asList(influence.preferredRoomArchetypes),
    ...asList(influence.preferredRoomArchetypeIds),
  ]);
}

function getInfluenceForbiddenRoomArchetypes(influence = {}) {
  if (!influence || typeof influence !== "object" || Array.isArray(influence)) return [];
  return uniqueRoomArchetypeIds([
    influence.forbiddenRoomArchetype,
    influence.forbiddenRoomArchetypeId,
    ...asList(influence.forbiddenRoomArchetypes),
    ...asList(influence.forbiddenRoomArchetypeIds),
  ]);
}

function getRoomArchetypeFromInfluence(influence = {}, forbiddenIds = [], contextKey = "crypt") {
  const forbidden = new Set(uniqueRoomArchetypeIds(forbiddenIds));
  const preferred = getInfluencePreferredRoomArchetypes(influence);
  const isForced = Boolean(influence?.forceRoomArchetype || influence?.force || influence?.required);
  return preferred.find((id) => {
    const definition = getRoomArchetypeDefinition(id);
    if (!definition) return false;
    if (!isForced && forbidden.has(id)) return false;
    return !definition.contexts?.length || definition.contexts.includes(contextKey);
  }) || "";
}

function getRegionForbiddenRoomArchetypeIds(region = {}) {
  return uniqueRoomArchetypeIds(
    getRegionMapInfluenceSources(region).flatMap(getInfluenceForbiddenRoomArchetypes),
  );
}

function isRoomArchetypeUsable(id, contextKey = "crypt", forbiddenIds = []) {
  const normalized = normalizeRoomArchetypeId(id);
  if (!normalized) return false;
  if (new Set(uniqueRoomArchetypeIds(forbiddenIds)).has(normalized)) return false;
  const definition = getRoomArchetypeDefinition(normalized);
  if (!definition) return false;
  return !definition.contexts?.length || definition.contexts.includes(contextKey);
}

function findFallbackRoomArchetypeId(preferredIds = [], contextKey = "crypt", forbiddenIds = []) {
  return uniqueRoomArchetypeIds(preferredIds).find((id) => isRoomArchetypeUsable(id, contextKey, forbiddenIds)) || "";
}

function createMapInfluenceFingerprint(influence = {}) {
  if (!influence || typeof influence !== "object" || Array.isArray(influence)) return "";
  return JSON.stringify({
    roomArchetype: influence.roomArchetype || influence.roomArchetypeId || "",
    forcedRoomArchetype: influence.forcedRoomArchetype || influence.forcedRoomArchetypeId || "",
    preferredRoomArchetypes: uniqueRoomArchetypeIds([
      influence.preferredRoomArchetype,
      influence.preferredRoomArchetypeId,
      ...asList(influence.preferredRoomArchetypes),
      ...asList(influence.preferredRoomArchetypeIds),
    ]),
    forbiddenRoomArchetypes: uniqueRoomArchetypeIds([
      influence.forbiddenRoomArchetype,
      influence.forbiddenRoomArchetypeId,
      ...asList(influence.forbiddenRoomArchetypes),
      ...asList(influence.forbiddenRoomArchetypeIds),
    ]),
    forceRoomArchetype: Boolean(influence.forceRoomArchetype || influence.force || influence.required),
    source: asList(influence.sources).join("|") || influence.source || "",
  });
}

function getRegionMapInfluenceSources(region = {}) {
  const seen = new Set();
  return [
    region.mapInfluence,
    region.location?.mapInfluence,
    region.locationRegion?.mapInfluence,
    region.map?.mapInfluence,
    region.metadata?.mapInfluence,
    region.requestMetadata?.mapInfluence,
  ].filter((influence) => {
    if (!influence) return false;
    const fingerprint = createMapInfluenceFingerprint(influence);
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
}

function getDeclaredRoomArchetypeSource(region = {}) {
  return String(
    region.roomArchetypeSource ||
      region.metadata?.roomArchetypeSource ||
      region.requestMetadata?.roomArchetypeSource ||
      "",
  ).trim();
}

function getDirectRoomArchetypeId(region = {}) {
  if (getDeclaredRoomArchetypeSource(region) === "map-influence") return "";
  return normalizeRoomArchetypeId(
    region.roomArchetype ||
      region.roomArchetypeId ||
      region.archetype ||
      region.locationRegion?.roomArchetype ||
      region.locationRegion?.roomArchetypeId ||
      region.map?.roomArchetype ||
      region.map?.roomArchetypeId ||
      region.metadata?.roomArchetype ||
      region.metadata?.roomArchetypeId ||
      region.requestMetadata?.roomArchetype ||
      region.requestMetadata?.roomArchetypeId ||
      "",
  );
}

function getInfluencedRoomArchetypeId(region = {}, contextKey = "crypt") {
  const sources = getRegionMapInfluenceSources(region);
  const forbiddenIds = getRegionForbiddenRoomArchetypeIds(region);
  const forced = sources
    .filter((influence) => influence?.forceRoomArchetype || influence?.force || influence?.required)
    .map((influence) => getRoomArchetypeFromInfluence(influence, [], contextKey))
    .find(Boolean);
  if (forced) return forced;
  return sources.map((influence) => getRoomArchetypeFromInfluence(influence, forbiddenIds, contextKey)).find(Boolean) || "";
}

export function getExplicitRoomArchetypeId(region = {}) {
  return getDirectRoomArchetypeId(region) || getInfluencedRoomArchetypeId(region, getContextKey(region?.context || region?.biome || "crypt"));
}

export function getRoomArchetypeResolutionSummary(region = {}, contextKey = "crypt", resolvedArchetype = null) {
  const sources = getRegionMapInfluenceSources(region);
  const directRoomArchetype = getDirectRoomArchetypeId(region);
  const forbiddenRoomArchetypes = getRegionForbiddenRoomArchetypeIds(region);
  const preferredRoomArchetypes = uniqueRoomArchetypeIds(
    sources.flatMap(getInfluencePreferredRoomArchetypes),
  );
  const forcedRoomArchetypes = uniqueRoomArchetypeIds(
    sources
      .filter((influence) => influence?.forceRoomArchetype || influence?.force || influence?.required)
      .flatMap(getInfluencePreferredRoomArchetypes),
  );
  const influencedRoomArchetype = directRoomArchetype
    ? ""
    : getInfluencedRoomArchetypeId(region, contextKey);
  const resolved = resolvedArchetype || resolveRoomArchetype(region, contextKey);

  return {
    schemaVersion: `${ROOM_ARCHETYPE_SCHEMA_VERSION}:resolution-v0.1`,
    context: contextKey,
    resolvedRoomArchetype: resolved?.id || "",
    resolvedRoomArchetypeLabel: resolved?.label || "",
    resolvedRoomArchetypeSource: resolved?.source || "",
    directRoomArchetype,
    influencedRoomArchetype,
    preferredRoomArchetypes,
    forbiddenRoomArchetypes,
    forcedRoomArchetypes,
    mapInfluenceCount: sources.length,
    hasMapInfluence: sources.length > 0,
    hasForce: forcedRoomArchetypes.length > 0,
    hasForbiddenConflict: forbiddenRoomArchetypes.includes(resolved?.id || ""),
  };
}

export function resolveRoomArchetype(region = {}, contextKey = "crypt") {
  const directId = getDirectRoomArchetypeId(region);
  const forbiddenIds = getRegionForbiddenRoomArchetypeIds(region);
  const influencedId = directId ? "" : getInfluencedRoomArchetypeId(region, contextKey);
  const explicitId = directId || influencedId;
  const declaredSource = getDeclaredRoomArchetypeSource(region);
  if (explicitId) {
    const explicitDefinition = getRoomArchetypeDefinition(explicitId);
    if (
      explicitDefinition &&
      (!explicitDefinition.contexts?.length || explicitDefinition.contexts.includes(contextKey))
    ) {
      return { ...explicitDefinition, source: declaredSource || (directId ? "explicit" : "map-influence") };
    }
  }

  if (contextKey !== "crypt") return null;

  const text = `${getRegionText(region)} ${region.name || ""} ${region.preferredShape || ""}`.toLowerCase();
  const semanticFlags = getRegionSemanticFlags(region);
  const placementFlags = classifyRegion(region);
  const role = getPlacementRole(region);
  let id = "crypt-burial-cell";

  if (role === "connector" || placementFlags.entrance || text.includes("threshold") || text.includes("passage") || text.includes("corridor")) {
    id = "processional-crypt-hall";
  } else if (semanticFlags.vertical || text.includes("well") || text.includes("shaft")) {
    id = "bone-well";
  } else if (placementFlags.secret && (semanticFlags.archive || text.includes("reliquary") || text.includes("lore"))) {
    id = "hidden-reliquary";
  } else if (text.includes("reliquary") || text.includes("relic") || text.includes("saint") || placementFlags.clue) {
    id = "reliquary-niche";
  } else if (semanticFlags.archive) {
    id = "hidden-reliquary";
  } else if (placementFlags.secret || text.includes("sealed") || text.includes("family") || text.includes("tomb")) {
    id = "sealed-family-tomb";
  } else if (placementFlags.hazard || placementFlags.climax || placementFlags.outcome || text.includes("charnel") || text.includes("vault")) {
    id = "charnel-vault";
  } else if (text.includes("ossuary") || text.includes("bone") || text.includes("skull")) {
    id = "ossuary-gallery";
  }

  if (forbiddenIds.includes(id)) {
    id = findFallbackRoomArchetypeId([
      "crypt-burial-cell",
      "ossuary-gallery",
      "reliquary-niche",
      "sealed-family-tomb",
      "hidden-reliquary",
      "processional-crypt-hall",
      "charnel-vault",
      "bone-well",
    ], contextKey, forbiddenIds) || id;
  }

  const definition = getRoomArchetypeDefinition(id);
  return definition ? { ...definition, source: "inferred" } : null;
}

export function regionDepthScore(region, seed) {
  const text = `${region.role} ${region.tags.join(" ")}`.toLowerCase();
  if (
    region.isEntrance ||
    text.includes("entrance") ||
    text.includes("threshold")
  )
    return 0;
  if (text.includes("connector") || text.includes("corridor")) return 20;
  if (text.includes("clue")) return 35;
  if (text.includes("hazard")) return 45;
  if (text.includes("main") || text.includes("setpiece")) return 60;
  if (text.includes("outcome") || text.includes("reward")) return 75;
  if (text.includes("secret") || text.includes("lore")) return 90;
  return 45 + (hashStringToSeed(seed, region.id, "depth") % 15);
}

export function roleDepth(region) {
  if (Number.isFinite(region.graphDepth)) return clamp(region.graphDepth, 0, 6);
  const text = `${region.role} ${region.tags.join(" ")}`.toLowerCase();
  if (
    region.isEntrance ||
    text.includes("entrance") ||
    text.includes("threshold")
  )
    return 0;
  if (text.includes("connector") || text.includes("corridor")) return 1;
  if (text.includes("clue")) return 2;
  if (text.includes("hazard")) return 3;
  if (text.includes("main") || text.includes("setpiece")) return 4;
  if (text.includes("reward") || text.includes("outcome")) return 5;
  if (text.includes("secret") || text.includes("lore")) return 6;
  return 3;
}

export function getRegionText(region) {
  return `${region.role || ""} ${(region.tags || []).join(" ")} ${(region.sourceAnchors || []).join(" ")}`.toLowerCase();
}

export function classifyRegion(region) {
  const text = getRegionText(region);
  return {
    entrance: Boolean(
      region.isEntrance ||
      text.includes("entrance") ||
      text.includes("threshold") ||
      text.includes("start"),
    ),
    exit: Boolean(
      region.isExit || text.includes("exit") || text.includes("escape"),
    ),
    connector: Boolean(
      text.includes("connector") ||
      text.includes("corridor") ||
      text.includes("passage") ||
      text.includes("tunnel"),
    ),
    clue: Boolean(
      text.includes("clue") ||
      text.includes("investigation") ||
      text.includes("evidence"),
    ),
    hazard: Boolean(
      text.includes("hazard") ||
      text.includes("danger") ||
      text.includes("trap") ||
      text.includes("collapse"),
    ),
    climax: Boolean(
      text.includes("climax") ||
      text.includes("main") ||
      text.includes("setpiece") ||
      text.includes("boss") ||
      text.includes("final"),
    ),
    outcome: Boolean(
      text.includes("outcome") ||
      text.includes("reward") ||
      text.includes("revelation") ||
      text.includes("escape"),
    ),
    secret: Boolean(
      region.secret ||
      text.includes("secret") ||
      text.includes("hidden") ||
      text.includes("lore"),
    ),
    loop: Boolean(
      text.includes("loop") ||
      text.includes("return") ||
      text.includes("false return"),
    ),
  };
}

export function getContextKey(context) {
  const text = String(context || "").toLowerCase();
  if (
    text.includes("chapel") ||
    text.includes("church") ||
    text.includes("temple")
  )
    return "chapel";
  if (text.includes("cave") || text.includes("cavern")) return "cave";
  if (text.includes("mine") || text.includes("shaft")) return "mine";
  if (
    text.includes("noble") ||
    text.includes("house") ||
    text.includes("manor")
  )
    return "noble-house";
  if (text.includes("ruin")) return "ruins";
  return "crypt";
}

export function getPlacementProfile(config) {
  const key = getContextKey(config.context || config.biome);
  const profiles = {
    crypt: {
      key,
      directRoomLinks: false,
      mazeBias: 0.15,
      loopBudgetMultiplier: 0.2,
      sideLoopChance: 0.15,
      corridorOverlapPenalty: 5.8,
      adjacentCorridorPenalty: 1.15,
      turnCost: 2.1,
      wallPenalty: 1.7,
      doorCenterBias: 2.4,
      spread: 4.8,
      branchSpread: 6.2,
      depthJitter: 1.25,
      lateralJitter: 2.4,
      compactness: 0.74,
      roleLane: {
        entrance: 0,
        connector: 0,
        clue: -1,
        hazard: 1,
        final: 0,
        secret: 1.6,
        side: -1.25,
      },
      roleDepthBias: {
        entrance: 0,
        connector: 0.1,
        clue: 0.2,
        hazard: 0.35,
        final: 0.75,
        secret: 1.05,
        side: 0.25,
      },
    },
    chapel: {
      key,
      directRoomLinks: true,
      mazeBias: 0.04,
      loopBudgetMultiplier: 0,
      sideLoopChance: 0,
      corridorOverlapPenalty: 9.5,
      adjacentCorridorPenalty: 1.85,
      turnCost: 2.2,
      wallPenalty: 1.6,
      doorCenterBias: 4.8,
      spread: 5.2,
      branchSpread: 5.4,
      depthJitter: 0.8,
      lateralJitter: 1.8,
      compactness: 0.82,
      roleLane: {
        entrance: 0,
        connector: 0,
        clue: -1.35,
        hazard: 1.25,
        final: 0,
        secret: 1.75,
        side: -1.15,
      },
      roleDepthBias: {
        entrance: 0,
        connector: 0.05,
        clue: 0.22,
        hazard: 0.28,
        final: 0.95,
        secret: 0.7,
        side: 0.18,
      },
    },
    cave: {
      key,
      directRoomLinks: true,
      mazeBias: 0.12,
      loopBudgetMultiplier: 0.28,
      sideLoopChance: 0.22,
      corridorOverlapPenalty: 0.6,
      adjacentCorridorPenalty: 0.08,
      turnCost: 1.45,
      wallPenalty: 0.8,
      doorCenterBias: 0.45,
      spread: 3.4,
      branchSpread: 3.8,
      depthJitter: 0.9,
      lateralJitter: 1.4,
      compactness: 0.9,
      roleLane: {
        entrance: -0.15,
        connector: 0,
        clue: -0.55,
        hazard: 0.65,
        final: 0.2,
        secret: -0.9,
        side: 0.85,
      },
      roleDepthBias: {
        entrance: 0,
        connector: 0.04,
        clue: 0.12,
        hazard: 0.2,
        final: 0.32,
        secret: 0.4,
        side: 0.16,
      },
    },
    mine: {
      key,
      directRoomLinks: false,
      mazeBias: 0.42,
      loopBudgetMultiplier: 0.7,
      sideLoopChance: 0.55,
      corridorOverlapPenalty: 1.65,
      adjacentCorridorPenalty: 0.35,
      turnCost: 1.65,
      wallPenalty: 1.1,
      doorCenterBias: 1.15,
      spread: 7,
      branchSpread: 8,
      depthJitter: 1.7,
      lateralJitter: 3.8,
      compactness: 0.5,
      roleLane: {
        entrance: 0,
        connector: 0,
        clue: -1,
        hazard: 1.2,
        final: 0.35,
        secret: -1.7,
        side: 1.55,
      },
      roleDepthBias: {
        entrance: 0,
        connector: 0.18,
        clue: 0.22,
        hazard: 0.48,
        final: 0.75,
        secret: 0.82,
        side: 0.32,
      },
    },
    "noble-house": {
      key,
      directRoomLinks: true,
      mazeBias: 0.05,
      loopBudgetMultiplier: 0,
      sideLoopChance: 0,
      corridorOverlapPenalty: 9.0,
      adjacentCorridorPenalty: 1.6,
      turnCost: 2.15,
      wallPenalty: 1.55,
      doorCenterBias: 4.2,
      spread: 5.8,
      branchSpread: 5.2,
      depthJitter: 0.95,
      lateralJitter: 2.1,
      compactness: 0.78,
      roleLane: {
        entrance: 0,
        connector: 0,
        clue: -1.1,
        hazard: 1.1,
        final: 0,
        secret: 1.65,
        side: -1.5,
      },
      roleDepthBias: {
        entrance: 0,
        connector: 0.05,
        clue: 0.2,
        hazard: 0.4,
        final: 0.68,
        secret: 0.55,
        side: 0.24,
      },
    },
    ruins: {
      key,
      directRoomLinks: false,
      mazeBias: 0.34,
      loopBudgetMultiplier: 0.55,
      sideLoopChance: 0.45,
      corridorOverlapPenalty: 2.8,
      adjacentCorridorPenalty: 0.65,
      turnCost: 1.9,
      wallPenalty: 1.25,
      doorCenterBias: 1.6,
      spread: 6.8,
      branchSpread: 7.6,
      depthJitter: 1.8,
      lateralJitter: 3.8,
      compactness: 0.6,
      roleLane: {
        entrance: -0.2,
        connector: 0,
        clue: -1.3,
        hazard: 1.2,
        final: 0.55,
        secret: -1.65,
        side: 1.55,
      },
      roleDepthBias: {
        entrance: 0,
        connector: 0.1,
        clue: 0.18,
        hazard: 0.42,
        final: 0.72,
        secret: 0.75,
        side: 0.28,
      },
    },
  };
  return profiles[key] || profiles.crypt;
}

export function getPlacementRole(region) {
  if (region.graphRole) return region.graphRole;
  const flags = classifyRegion(region);
  if (flags.entrance) return "entrance";
  if (flags.secret) return "secret";
  if (flags.climax || flags.outcome || flags.exit) return "final";
  if (flags.hazard) return "hazard";
  if (flags.clue) return "clue";
  if (flags.connector) return "connector";
  return "side";
}

export function normalizeRegionSurfaceKind(
  surfaceKind,
  fallback = "structure",
) {
  if (
    surfaceKind === "cave" ||
    surfaceKind === "hybrid" ||
    surfaceKind === "structure"
  )
    return surfaceKind;
  if (
    surfaceKind === "dungeon" ||
    surfaceKind === "structured" ||
    surfaceKind === "room"
  )
    return "structure";
  if (surfaceKind === "organic-cave" || surfaceKind === "natural")
    return "cave";
  return fallback;
}

export function getRegionSurfaceProfile(region, contextKey = "crypt") {
  const explicit = normalizeRegionSurfaceKind(
    region?.surfaceKind || region?.generationKind || region?.surface?.kind,
    null,
  );
  if (explicit) return explicit;

  const flags = getRegionSemanticFlags(region || {});
  const text =
    `${getRegionText(region || {})} ${region?.name || ""} ${region?.roomType || ""} ${region?.shape || ""}`.toLowerCase();

  if (contextKey === "cave") return "cave";
  if (contextKey === "mine") {
    if (
      flags.archive ||
      flags.ritual ||
      text.includes("office") ||
      text.includes("workshop") ||
      text.includes("barrack")
    )
      return "structure";
    if (
      flags.vertical ||
      flags.ruined ||
      text.includes("shaft") ||
      text.includes("support") ||
      text.includes("rail")
    )
      return "hybrid";
    return "cave";
  }
  if (contextKey === "ruins" || contextKey === "crypt") return "structure";
  return "structure";
}

export function getCorridorSurfaceProfile(
  config,
  fromRegion,
  toRegion,
  edge = null,
) {
  const contextKey = getContextKey(config?.context || config?.biome);
  const fromSurface = getRegionSurfaceProfile(fromRegion, contextKey);
  const toSurface = getRegionSurfaceProfile(toRegion, contextKey);
  const edgeText =
    `${edge?.type || ""} ${edge?.reason || ""} ${edge?.label || ""}`.toLowerCase();

  if (contextKey === "cave") return "natural-tunnel";
  if (contextKey === "mine") return "mine-tunnel";
  if (contextKey === "ruins" || contextKey === "crypt") return "structure";
  if (
    edgeText.includes("collapse") ||
    edgeText.includes("rubble") ||
    edgeText.includes("breach")
  )
    return "collapsed-transition";
  if (fromSurface === "cave" && toSurface === "cave") return "natural-tunnel";
  if (
    fromSurface !== toSurface ||
    fromSurface === "hybrid" ||
    toSurface === "hybrid"
  )
    return "collapsed-transition";
  return "structure";
}

export function getMapAccessIntent(region, contextKey) {
  const flags = classifyRegion(region);
  const text = getRegionText(region);
  const role = getPlacementRole(region);

  if (flags.entrance) return { type: "entrance", priority: 0, label: "IN" };
  if (
    region.isExit ||
    flags.exit ||
    text.includes("escape") ||
    text.includes("egress")
  )
    return { type: "exit", priority: 1, label: "OUT" };
  if (flags.outcome && !flags.secret)
    return { type: "exit", priority: 2, label: "OUT" };
  if (
    (contextKey === "mine" ||
      contextKey === "cave" ||
      contextKey === "ruins") &&
    (flags.connector ||
      role === "connector" ||
      text.includes("tunnel") ||
      text.includes("passage"))
  ) {
    return { type: "passage", priority: 5, label: "PASS" };
  }
  return null;
}

export function getFallbackMapAccessIntent(region, generatedMap) {
  const contextKey = getContextKey(
    generatedMap.config.context || generatedMap.config.biome,
  );
  return (
    getMapAccessIntent(region, contextKey) || {
      type: "passage",
      priority: 9,
      label: "PASS",
    }
  );
}

export function getRegionSemanticFlags(region) {
  const text =
    `${region.role || ""} ${(region.tags || []).join(" ")} ${(region.sourceAnchors || []).join(" ")} ${region.name || ""} ${region.roomType || ""} ${region.shape || ""} ${region.roomArchetype || ""} ${region.roomArchetypeLabel || ""} ${region.shapeOptions?.archetypeId || ""}`.toLowerCase();
  return {
    archive:
      text.includes("archive") ||
      text.includes("library") ||
      text.includes("book") ||
      text.includes("biblio"),
    crypt:
      text.includes("crypt") ||
      text.includes("ossuary") ||
      text.includes("tomb") ||
      text.includes("bone") ||
      text.includes("ribcage") ||
      text.includes("death"),
    hazard:
      text.includes("hazard") ||
      text.includes("collapse") ||
      text.includes("trap") ||
      text.includes("danger"),
    clue:
      text.includes("clue") ||
      text.includes("evidence") ||
      text.includes("investigation") ||
      text.includes("mask"),
    outcome:
      text.includes("outcome") ||
      text.includes("reward") ||
      text.includes("revelation") ||
      text.includes("final") ||
      text.includes("main"),
    vertical:
      text.includes("shaft") ||
      text.includes("well") ||
      text.includes("vertical"),
    fog: text.includes("fog") || text.includes("mist"),
    water:
      text.includes("water") || text.includes("flood") || text.includes("pool"),
    ritual:
      text.includes("altar") ||
      text.includes("ritual") ||
      text.includes("chapel") ||
      text.includes("religious"),
    ruined:
      text.includes("ruin") ||
      text.includes("broken") ||
      text.includes("collapsed") ||
      text.includes("rubble"),
    kitchen: text.includes("kitchen"),
  };
}
