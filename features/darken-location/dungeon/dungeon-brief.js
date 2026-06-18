import { normalizeDungeonTheme } from "./dungeon-theme.js";

export const DUNGEON_BRIEF_SCHEMA_VERSION = "0.1";

export const DUNGEON_BRIEF_MODE_THEME = "theme";
export const DUNGEON_BRIEF_MODE_SCRATCH = "scratch";

const ROOM_SIZE_SET = new Set(["Small", "Medium", "Large"]);

function asArray(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeInteger(value, fallback = 0, { min = 0, max = 999 } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function unique(values) {
  return [...new Set(asArray(values).map((value) => String(value).trim()).filter(Boolean))];
}

function normalizeRoomSize(value, fallback = "Medium") {
  const text = normalizeString(value, fallback);
  return ROOM_SIZE_SET.has(text) ? text : fallback;
}

function createRoomId(index) {
  return `room-${String(index + 1).padStart(2, "0")}`;
}

function createRoomNameFallback(index, theme) {
  const themeRoomTypes = asArray(theme?.roomTypeBias);
  const roomType = themeRoomTypes[index % Math.max(1, themeRoomTypes.length)] || "Location Region";
  return `${String(index + 1).padStart(2, "0")} ${roomType.replace(/^./, (letter) => letter.toUpperCase())}`;
}

export function createRoomBrief(input = {}, index = 0, { theme = null } = {}) {
  const normalizedTheme = normalizeDungeonTheme(theme);
  const metadata = input.metadata && typeof input.metadata === "object" ? input.metadata : {};
  const assignedComponents = asArray(input.assignedComponents || metadata.assignedComponents).filter(Boolean);
  const sourceRegionId = normalizeString(input.sourceRegionId || input.id || metadata.sourceRegionId, createRoomId(index));
  const role = normalizeString(input.role, normalizedTheme.roomRoleSequence[index % Math.max(1, normalizedTheme.roomRoleSequence.length)] || "location region");
  const type = normalizeString(input.type || input.roomType || input.shape || input.preferredShape, normalizedTheme.roomTypeBias[index % Math.max(1, normalizedTheme.roomTypeBias.length)] || "room");
  const sensoryLayer = normalizeString(input.sensoryLayer || metadata.sensoryLayer, normalizedTheme.sensoryPalette[index % Math.max(1, normalizedTheme.sensoryPalette.length)] || "");
  const visualSigns = normalizeString(input.visualSigns || input.feature || metadata.feature, normalizedTheme.visualPalette[index % Math.max(1, normalizedTheme.visualPalette.length)] || "");

  return {
    schemaVersion: DUNGEON_BRIEF_SCHEMA_VERSION,
    id: normalizeString(input.roomBriefId || metadata.roomBriefId, createRoomId(index)),
    index: normalizeInteger(input.index, index + 1, { min: 1, max: 99 }),
    name: normalizeString(input.name || input.label, createRoomNameFallback(index, normalizedTheme)),
    role,
    type,
    size: normalizeRoomSize(input.size || metadata.size),
    level: normalizeInteger(input.level ?? metadata.level, 0, { min: -9, max: 9 }),
    connectors: normalizeInteger(input.connectors, index === 0 ? 2 : 1, { min: 0, max: 8 }),
    density: normalizeString(input.density || metadata.density, "interactive"),
    shape: normalizeString(input.shape || input.preferredShape, type),
    sourceRegionId,
    sourceAnchors: unique(input.sourceAnchors || metadata.sourceAnchors || normalizedTheme.sourceAnchorIds),
    horror: unique(input.horror || metadata.horror),
    contexts: unique(input.contexts || metadata.contexts),
    tags: unique(input.tags || metadata.tags),
    sensoryLayer,
    visualSigns,
    hazard: normalizeString(input.hazard || input.danger || metadata.danger),
    reward: normalizeString(input.reward || metadata.reward),
    encounter: normalizeString(input.encounter || input.encounterTwist || metadata.encounterTwist),
    clue: normalizeString(input.clue || input.secret || metadata.secret),
    interaction: normalizeString(input.interaction || input.interact || metadata.interaction || metadata.interact),
    readAloud:
      input.readAloud && typeof input.readAloud === "object"
        ? { ...input.readAloud }
        : input.readAloud || metadata.readAloud || "",
    secret: Boolean(input.secret || metadata.secret || unique(input.tags).some((tag) => tag.toLowerCase().includes("secret"))),
    locked: Boolean(input.locked),
    links: unique(input.links),
    notes: normalizeString(input.notes),
    assignedComponents,
    assignedSlotIds: unique(input.assignedSlotIds || metadata.assignedSlotIds || assignedComponents.map((component) => component.slotId)),
  };
}

export function createDungeonBrief(input = {}) {
  const theme = normalizeDungeonTheme(input.theme);
  const mode = input.mode === DUNGEON_BRIEF_MODE_SCRATCH ? DUNGEON_BRIEF_MODE_SCRATCH : DUNGEON_BRIEF_MODE_THEME;
  const roomInputs = asArray(input.roomBriefs);
  const roomBriefs = roomInputs.map((room, index) => createRoomBrief(room, index, { theme }));
  const roomCount = normalizeInteger(input.roomCount, roomBriefs.length || 1, { min: 1, max: 16 });

  return {
    schemaVersion: DUNGEON_BRIEF_SCHEMA_VERSION,
    id: normalizeString(input.id, `dungeon-brief-${normalizeString(input.seed, "draft")}`),
    mode,
    title: normalizeString(input.title, "Cursed Location Build"),
    seed: normalizeString(input.seed, ""),
    workflow: normalizeString(input.workflow, "darken-location"),
    theme,
    themeId: normalizeString(input.themeId, theme.id),
    themeName: normalizeString(input.themeName, theme.name),
    archetype: normalizeString(input.archetype, theme.defaultArchetype),
    context: normalizeString(input.context, theme.mapTypeBias[0] || "Crypt"),
    mapType: normalizeString(input.mapType, theme.mapTypeBias[0] || input.context || "Crypt"),
    roomCount,
    levelCount: normalizeInteger(input.levelCount, 1, { min: 1, max: 6 }),
    density: normalizeString(input.density, theme.layoutBias?.density || "standard"),
    connectionStyle: normalizeString(input.connectionStyle, theme.layoutBias?.connectionStyle || "branching"),
    verticality: normalizeString(input.verticality, theme.layoutBias?.verticality || "flat"),
    danger: normalizeString(input.danger, "standard"),
    secrets: normalizeString(input.secrets, "few"),
    sourceAnchors: unique(input.sourceAnchors || theme.sourceAnchorIds),
    horror: unique(input.horror),
    globalPalette: {
      sensory: unique(input.globalPalette?.sensory || theme.sensoryPalette),
      visual: unique(input.globalPalette?.visual || theme.visualPalette),
      hazards: unique(input.globalPalette?.hazards || theme.hazardBias),
      rewards: unique(input.globalPalette?.rewards || theme.rewardBias),
    },
    roomBriefs,
    metadata: {
      ...(input.metadata || {}),
      createdFrom: normalizeString(input.metadata?.createdFrom, "darken-location-composer"),
    },
  };
}

export function roomBriefToRequiredRegion(roomBrief, index = 0) {
  const room = createRoomBrief(roomBrief, index);

  return {
    id: `map-region-${index + 1}`,
    label: room.name,
    role: room.role,
    size: room.size,
    shape: room.shape,
    connectors: room.connectors,
    density: room.density,
    links: room.links,
    sourceRegionId: room.sourceRegionId,
    metadata: {
      roomBriefId: room.id,
      roomIndex: room.index,
      roomType: room.type,
      level: room.level,
      contexts: room.contexts,
      horror: room.horror,
      sourceAnchors: room.sourceAnchors,
      feature: room.visualSigns,
      interaction: room.interaction,
      interact: room.interaction,
      danger: room.hazard,
      secret: room.clue,
      reward: room.reward,
      encounter: room.encounter,
      sensoryLayer: room.sensoryLayer,
      readAloud: room.readAloud,
      assignedComponents: room.assignedComponents,
      assignedSlotIds: room.assignedSlotIds,
      dungeonRoomBrief: room,
    },
  };
}

export function createMapRequestFromDungeonBrief(dungeonBrief = {}, { snapshot = {} } = {}) {
  const brief = createDungeonBrief(dungeonBrief);
  const requiredRegions = brief.roomBriefs.map(roomBriefToRequiredRegion);

  return {
    source: "dungeon-brief",
    workflow: brief.workflow,
    title: brief.title,
    seed: brief.seed,
    context: brief.context,
    mapType: brief.mapType,
    roomCount: requiredRegions.length || brief.roomCount || undefined,
    requiredRegions,
    dungeonBrief: brief,
    metadata: {
      horror: brief.horror,
      sourceAnchors: brief.sourceAnchors,
      intrusion: normalizeString(snapshot?.intrusion),
      activeSlot: normalizeString(snapshot?.activeSlot),
      activeRegionId: normalizeString(snapshot?.activeRegionId),
      activeSlotScope: normalizeString(snapshot?.activeSlotScope),
      slotAssignments: snapshot?.slotAssignments || {},
      selectedComponents: asArray(brief.metadata?.selectedComponents || snapshot?.selectedComponents),
      regionComponentLinks: asArray(brief.metadata?.selectedComponents || snapshot?.selectedComponents)
        .filter((component) => component?.regionId)
        .map((component) => ({
          regionId: component.regionId,
          slotId: component.slotId,
          componentId: component.id,
          title: component.title,
        })),
      dungeonBrief: brief,
    },
  };
}
