import { getSourceAnchorId } from "../../../shared/content/source-anchors.js";
import { DUNGEON_THEMES } from "./dungeon-theme.data.js";

function asArray(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function unique(values) {
  return [...new Set(asArray(values).map((value) => String(value)).filter(Boolean))];
}

export function normalizeDungeonSourceAnchorIds(sourceAnchors = []) {
  return unique(asArray(sourceAnchors).map(getSourceAnchorId).filter(Boolean));
}

export function getDungeonThemes() {
  return DUNGEON_THEMES;
}

export function getDungeonThemeById(themeId) {
  const normalizedId = getSourceAnchorId(themeId);
  return DUNGEON_THEMES.find((theme) => theme.id === normalizedId) || null;
}

export function getFallbackDungeonTheme() {
  return getDungeonThemeById("generic-dark-location") || DUNGEON_THEMES[0];
}

export function resolveDungeonThemeForSourceAnchors(sourceAnchors = []) {
  const sourceAnchorIds = normalizeDungeonSourceAnchorIds(sourceAnchors);
  const directTheme = sourceAnchorIds
    .map((sourceAnchorId) => getDungeonThemeById(sourceAnchorId))
    .find(Boolean);

  if (directTheme) return directTheme;

  return getFallbackDungeonTheme();
}

export function normalizeDungeonTheme(theme) {
  const fallbackTheme = getFallbackDungeonTheme();
  const source = theme || fallbackTheme;

  return {
    id: normalizeString(source?.id, fallbackTheme.id),
    name: normalizeString(source?.name, fallbackTheme.name),
    sourceAnchorIds: normalizeDungeonSourceAnchorIds(source?.sourceAnchorIds),
    defaultArchetype: normalizeString(source?.defaultArchetype, fallbackTheme.defaultArchetype),
    allowedArchetypes: unique(source?.allowedArchetypes?.length ? source.allowedArchetypes : fallbackTheme.allowedArchetypes),
    forbiddenArchetypes: unique(source?.forbiddenArchetypes),
    mapTypeBias: unique(source?.mapTypeBias?.length ? source.mapTypeBias : fallbackTheme.mapTypeBias),
    roomTypeBias: unique(source?.roomTypeBias?.length ? source.roomTypeBias : fallbackTheme.roomTypeBias),
    roomRoleSequence: unique(source?.roomRoleSequence?.length ? source.roomRoleSequence : fallbackTheme.roomRoleSequence),
    sensoryPalette: unique(source?.sensoryPalette?.length ? source.sensoryPalette : fallbackTheme.sensoryPalette),
    visualPalette: unique(source?.visualPalette?.length ? source.visualPalette : fallbackTheme.visualPalette),
    hazardBias: unique(source?.hazardBias?.length ? source.hazardBias : fallbackTheme.hazardBias),
    rewardBias: unique(source?.rewardBias?.length ? source.rewardBias : fallbackTheme.rewardBias),
    layoutBias: {
      ...(fallbackTheme.layoutBias || {}),
      ...(source?.layoutBias || {}),
    },
  };
}
