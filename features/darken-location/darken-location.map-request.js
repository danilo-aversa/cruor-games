import {
  createDungeonBriefFromDarkenLocationSnapshot,
  createMapRequestFromDungeonBrief,
} from "./dungeon/dungeon.index.js";

const SUPPORTED_MAP_TYPES = new Set([
  "Crypt",
  "Chapel",
  "Cave",
  "Mine",
  "Noble House",
  "Ruins",
]);

function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeArray(value) {
  if (value instanceof Set) return Array.from(value).filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function mapDarkenLocationContextToMapType(context) {
  const text = String(context || "").toLowerCase();
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
  return "Crypt";
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
  const safeMapType = SUPPORTED_MAP_TYPES.has(requestedMapType)
    ? requestedMapType
    : mapDarkenLocationContextToMapType(context);
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
