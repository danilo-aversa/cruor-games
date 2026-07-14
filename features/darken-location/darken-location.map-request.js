import {
  createDungeonBriefFromDarkenLocationSnapshot,
  createMapRequestFromDungeonBrief,
} from "./dungeon/dungeon.index.js";

export const SUPPORTED_DARK_PLACES_CONTEXTS = Object.freeze([
  "Crypt",
  "Chapel",
  "Cave",
  "Mine",
  "Ruins",
  "Noble House",
]);

const SUPPORTED_MAP_TYPES = new Set(SUPPORTED_DARK_PLACES_CONTEXTS);

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  if (value instanceof Set) return Array.from(value).filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function mapDarkenLocationContextToMapType(context) {
  const text = String(context || "").toLowerCase();
  if (!text.trim()) return "Crypt";
  if (text.includes("cave") || text.includes("cavern")) return "Cave";
  if (text.includes("mine")) return "Mine";
  if (text.includes("crypt") || text.includes("catacomb")) return "Crypt";
  if (
    text.includes("chapel") ||
    text.includes("temple") ||
    text.includes("shrine")
  )
    return "Chapel";
  if (text.includes("ruin")) return "Ruins";
  if (
    text.includes("noble") ||
    text.includes("house") ||
    text.includes("manor")
  )
    return "Noble House";
  return "";
}

function createStableSeedFromDungeonBrief(dungeonBrief) {
  const parts = [
    dungeonBrief?.title,
    dungeonBrief?.context,
    dungeonBrief?.themeId,
    normalizeArray(dungeonBrief?.sourceAnchors).join("|"),
    normalizeArray(dungeonBrief?.roomBriefs)
      .map((room) => room.sourceRegionId || room.id || room.name)
      .join("|"),
  ].filter(Boolean);

  return `darken-${
    parts
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 72) || "location"
  }`;
}

export function createMapRequestFromDarkenLocationState(crucibleSnapshot = {}) {
  const dungeonBrief = createDungeonBriefFromDarkenLocationSnapshot(crucibleSnapshot);
  const context = normalizeText(dungeonBrief.context || crucibleSnapshot.context, "Crypt");
  const requestedMapType = normalizeText(
    dungeonBrief.mapType || crucibleSnapshot.mapType || mapDarkenLocationContextToMapType(context),
  );
  const mappedContextType = mapDarkenLocationContextToMapType(context);
  const safeMapType = SUPPORTED_MAP_TYPES.has(requestedMapType)
    ? requestedMapType
    : mappedContextType;

  if (!safeMapType || !SUPPORTED_MAP_TYPES.has(safeMapType)) {
    throw new Error(
      `The Dark Places Map Generator does not support the "${context}" context yet. Choose Crypt, Chapel, Cave, Mine, Ruins, or Noble House.`,
    );
  }
  const seededDungeonBrief = {
    ...dungeonBrief,
    context,
    mapType: safeMapType,
    seed:
      normalizeText(crucibleSnapshot.seed) ||
      normalizeText(dungeonBrief.seed) ||
      createStableSeedFromDungeonBrief(dungeonBrief),
  };

  return createMapRequestFromDungeonBrief(seededDungeonBrief, {
    snapshot: crucibleSnapshot,
  });
}
