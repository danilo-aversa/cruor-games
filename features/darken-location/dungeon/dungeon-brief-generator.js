import { getSourceAnchorId } from "../../../shared/content/source-anchors.js";
import { createDungeonBrief } from "./dungeon-brief.js";
import { resolveDungeonThemeForSourceAnchors } from "./dungeon-theme.js";

const GLOBAL_SLOT_IDS = new Set(["horrorPremise", "sensoryLayer", "visibleAnomaly", "reward"]);
const ROOM_SLOT_IDS = new Set(["hazard", "clue", "encounterTwist"]);

function asArray(value) {
  if (!value) return [];
  if (value instanceof Set) return [...value].filter(Boolean);
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeSourceAnchorIds(sourceAnchors = []) {
  return [...new Set(asArray(sourceAnchors).map(getSourceAnchorId).filter(Boolean))];
}

function normalizeSlotAssignments(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([slotId, assignments]) => [
      slotId,
      asArray(assignments)
        .filter((assignment) => assignment && typeof assignment === "object")
        .map((assignment) => ({
          componentId: normalizeString(assignment.componentId),
          slotId: normalizeString(assignment.slotId, slotId),
          regionId: normalizeString(assignment.regionId),
          addedAt: assignment.addedAt || 0,
        }))
        .filter((assignment) => assignment.componentId),
    ]),
  );
}

function createComponentIndex(components = []) {
  return new Map(
    asArray(components)
      .filter((component) => component && typeof component === "object")
      .map((component) => [normalizeString(component.id), component])
      .filter(([id]) => Boolean(id)),
  );
}

function normalizeAssignedComponents(slotAssignments, selectedComponents = []) {
  const componentIndex = createComponentIndex(selectedComponents);
  const assignedComponents = Object.entries(slotAssignments)
    .flatMap(([slotId, assignments]) =>
      asArray(assignments).map((assignment) => {
        const component = componentIndex.get(assignment.componentId) || {};
        return {
          id: normalizeString(assignment.componentId || component.id),
          title: normalizeString(component.title),
          type: normalizeString(component.type),
          summary: normalizeString(component.summary),
          slotId: normalizeString(assignment.slotId, slotId),
          regionId: normalizeString(assignment.regionId),
        };
      }),
    )
    .filter((component) => component.id || component.title || component.slotId);

  if (assignedComponents.length) return assignedComponents;

  return asArray(selectedComponents)
    .map((component) => ({
      id: normalizeString(component?.id),
      title: normalizeString(component?.title),
      type: normalizeString(component?.type),
      summary: normalizeString(component?.summary),
      slotId: normalizeString(component?.slotId),
      regionId: normalizeString(component?.regionId),
    }))
    .filter((component) => component.id || component.title || component.slotId);
}

function getAssignedComponentsForRegion(regionId, assignedComponents) {
  return asArray(assignedComponents).filter(
    (component) => component.regionId && component.regionId === regionId,
  );
}

function getGlobalComponents(assignedComponents) {
  return asArray(assignedComponents).filter(
    (component) => !component.regionId && GLOBAL_SLOT_IDS.has(component.slotId),
  );
}

function getRoomSlotValue(regionComponents, slotId) {
  return asArray(regionComponents).find((component) => component.slotId === slotId)?.summary || "";
}

function normalizeRegionToRoomBrief(region, index, assignedComponents = [], theme) {
  if (!region || typeof region !== "object") return null;

  const sourceRegionId = normalizeString(region.id, `location-region-${index + 1}`);
  const regionComponents = getAssignedComponentsForRegion(sourceRegionId, assignedComponents);
  const roomSlotComponents = regionComponents.filter((component) => ROOM_SLOT_IDS.has(component.slotId));
  const tags = [
    ...(asArray(region.tags)),
    region.role,
    region.density,
    ...asArray(region.links),
  ].filter(Boolean);

  return {
    id: `room-${String(index + 1).padStart(2, "0")}`,
    index: index + 1,
    name: normalizeString(region.name || region.label, `Location Region ${index + 1}`),
    role: normalizeString(region.role, theme?.roomRoleSequence?.[index % Math.max(1, theme.roomRoleSequence.length)] || "location region"),
    type: normalizeString(region.roomType || region.shape || region.preferredShape, theme?.roomTypeBias?.[index % Math.max(1, theme.roomTypeBias.length)] || "room"),
    size: normalizeString(region.size, "Medium"),
    connectors: region.connectors,
    density: normalizeString(region.density),
    shape: normalizeString(region.shape || region.preferredShape),
    level: region.level || 0,
    sourceRegionId,
    sourceAnchors: normalizeSourceAnchorIds(region.sourceAnchors),
    horror: asArray(region.horror),
    contexts: asArray(region.contexts),
    tags,
    sensoryLayer: normalizeString(region.sensoryLayer),
    visualSigns: normalizeString(region.feature || region.visualSigns),
    hazard: getRoomSlotValue(roomSlotComponents, "hazard") || normalizeString(region.danger),
    clue: getRoomSlotValue(roomSlotComponents, "clue") || normalizeString(region.secret),
    encounter: getRoomSlotValue(roomSlotComponents, "encounterTwist"),
    reward: normalizeString(region.reward),
    interaction: normalizeString(region.interaction || region.interact),
    readAloud: region.readAloud,
    secret: Boolean(region.secret || tags.some((tag) => String(tag).toLowerCase().includes("secret"))),
    links: asArray(region.links),
    assignedComponents: regionComponents,
    assignedSlotIds: [...new Set(regionComponents.map((component) => component.slotId).filter(Boolean))],
  };
}

function inferScaleFromRoomCount(roomCount) {
  if (roomCount <= 6) return "small";
  if (roomCount >= 11) return "large";
  return "medium";
}


function normalizeDungeonThemeMode(value) {
  return value === "scratch" ? "scratch" : "theme";
}

function normalizeThemeControl(value, allowedValues, fallback) {
  const normalized = normalizeString(value, fallback).toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function titleCase(value) {
  return normalizeString(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`);
}

function getThemeRoomCount({ scale = "medium", complexity = "standard", theme } = {}) {
  const normalizedScale = normalizeThemeControl(scale, ["small", "medium", "large"], "medium");
  const normalizedComplexity = normalizeThemeControl(complexity, ["simple", "standard", "complex"], "standard");
  const scaleRanges = {
    small: { min: 4, max: 6, fallback: 5 },
    medium: { min: 7, max: 10, fallback: 8 },
    large: { min: 11, max: 16, fallback: 12 },
  };
  const complexityBonuses = { simple: -1, standard: 0, complex: 2 };
  const base = scaleRanges[normalizedScale] || scaleRanges.medium;
  const bonus = complexityBonuses[normalizedComplexity] || 0;
  const themeModifier = theme?.layoutBias?.density === "compact" ? 0 : 0;
  return Math.max(base.min, Math.min(base.max, base.fallback + bonus + themeModifier));
}

function getThemeRoomSize(role, index, roomCount, scale) {
  const normalizedRole = normalizeString(role).toLowerCase();
  if (normalizedRole.includes("climax") || normalizedRole.includes("ritual")) return "Large";
  if (normalizedRole.includes("entrance") || normalizedRole.includes("secret") || normalizedRole.includes("reward")) return "Small";
  if (scale === "large" && index === roomCount - 1) return "Large";
  return "Medium";
}

function getThemeConnectors(role, index, roomCount, complexity) {
  const normalizedRole = normalizeString(role).toLowerCase();
  if (index === 0) return complexity === "complex" ? 3 : 2;
  if (index >= roomCount - 1) return 1;
  if (normalizedRole.includes("secret")) return 1;
  if (normalizedRole.includes("loop")) return 3;
  return complexity === "complex" && index % 3 === 0 ? 3 : 2;
}

function createThemeRoomName(theme, roomType, index) {
  const prefix = String(index + 1).padStart(2, "0");
  const name = titleCase(roomType || theme?.roomTypeBias?.[index] || "Location Region");
  return `${prefix} ${name}`;
}

export function createThemeRoomBriefs({ theme, roomCount, scale = "medium", complexity = "standard", context = "" } = {}) {
  const safeTheme = theme || resolveDungeonThemeForSourceAnchors([]);
  const count = Number.isFinite(Number(roomCount)) && Number(roomCount) > 0
    ? Math.round(Number(roomCount))
    : getThemeRoomCount({ scale, complexity, theme: safeTheme });
  const roomTypes = asArray(safeTheme.roomTypeBias);
  const roles = asArray(safeTheme.roomRoleSequence);
  const sensoryPalette = asArray(safeTheme.sensoryPalette);
  const visualPalette = asArray(safeTheme.visualPalette);
  const hazardBias = asArray(safeTheme.hazardBias);
  const rewardBias = asArray(safeTheme.rewardBias);

  return Array.from({ length: count }, (_, index) => {
    const role = roles[index % Math.max(1, roles.length)] || "location region";
    const roomType = roomTypes[index % Math.max(1, roomTypes.length)] || "room";
    const lowerRole = normalizeString(role).toLowerCase();
    const isHazard = lowerRole.includes("hazard") || lowerRole.includes("ambush");
    const isReward = lowerRole.includes("reward");
    const isSecret = lowerRole.includes("secret");
    const isClimax = lowerRole.includes("climax") || index === count - 1;

    return {
      id: `room-${String(index + 1).padStart(2, "0")}`,
      index: index + 1,
      name: createThemeRoomName(safeTheme, roomType, index),
      role,
      type: roomType,
      size: getThemeRoomSize(role, index, count, scale),
      level: safeTheme.layoutBias?.verticality === "crypt_below_chapel" && index >= Math.ceil(count / 2) ? -1 : 0,
      connectors: getThemeConnectors(role, index, count, complexity),
      density: safeTheme.layoutBias?.density || "standard",
      shape: roomType,
      sourceRegionId: `location-region-${index + 1}`,
      sourceAnchors: safeTheme.sourceAnchorIds,
      horror: [],
      contexts: [context || safeTheme.mapTypeBias?.[0] || "Crypt"],
      tags: [role, roomType, safeTheme.id, isSecret ? "secret" : ""].filter(Boolean),
      sensoryLayer: sensoryPalette[index % Math.max(1, sensoryPalette.length)] || "",
      visualSigns: visualPalette[index % Math.max(1, visualPalette.length)] || "",
      hazard: isHazard ? hazardBias[index % Math.max(1, hazardBias.length)] || "" : "",
      reward: isReward || isClimax ? rewardBias[index % Math.max(1, rewardBias.length)] || "" : "",
      clue: lowerRole.includes("clue") || isSecret ? visualPalette[(index + 1) % Math.max(1, visualPalette.length)] || "" : "",
      encounter: isClimax ? `${titleCase(safeTheme.name)} climax pressure` : "",
      interaction: "",
      secret: isSecret,
      links: [isSecret ? "secret" : "main"],
      notes: "",
    };
  });
}

export function createThemeDungeonBriefFromDarkenLocationSnapshot(snapshot = {}) {
  const sourceAnchors = normalizeSourceAnchorIds(snapshot.sourceAnchors);
  const requestedTheme = snapshot.dungeonThemeId
    ? resolveDungeonThemeForSourceAnchors([snapshot.dungeonThemeId])
    : resolveDungeonThemeForSourceAnchors(sourceAnchors);
  const theme = requestedTheme || resolveDungeonThemeForSourceAnchors(sourceAnchors);
  const scale = normalizeThemeControl(snapshot.dungeonScale, ["small", "medium", "large"], "medium");
  const complexity = normalizeThemeControl(snapshot.dungeonComplexity, ["simple", "standard", "complex"], "standard");
  const context = normalizeString(snapshot.context, theme.mapTypeBias[0] || "Crypt");
  const roomBriefs = createThemeRoomBriefs({
    theme,
    scale,
    complexity,
    context,
  });

  return createDungeonBrief({
    id: normalizeString(snapshot.dungeonBriefId),
    mode: "theme",
    title: normalizeString(snapshot.title, `${theme.name} Dungeon`),
    workflow: normalizeString(snapshot.workflow, "darken-location"),
    seed: normalizeString(snapshot.seed),
    theme,
    themeId: theme.id,
    themeName: theme.name,
    archetype: normalizeString(snapshot.archetype, theme.defaultArchetype),
    context,
    mapType: normalizeString(snapshot.mapType || context, theme.mapTypeBias[0] || "Crypt"),
    roomCount: roomBriefs.length,
    levelCount: theme.layoutBias?.verticality === "crypt_below_chapel" ? 2 : 1,
    density: normalizeString(snapshot.density, theme.layoutBias?.density || "standard"),
    connectionStyle: normalizeString(snapshot.connectionStyle, theme.layoutBias?.connectionStyle || "branching"),
    verticality: normalizeString(snapshot.verticality, theme.layoutBias?.verticality || "flat"),
    sourceAnchors: theme.sourceAnchorIds?.length ? theme.sourceAnchorIds : sourceAnchors,
    horror: asArray(snapshot.horrors),
    globalPalette: {
      sensory: theme.sensoryPalette,
      visual: theme.visualPalette,
      hazards: theme.hazardBias,
      rewards: theme.rewardBias,
    },
    roomBriefs,
    metadata: {
      createdFrom: "theme-mode-mvp",
      scale,
      complexity,
      activeSlot: normalizeString(snapshot.activeSlot),
      activeSlotScope: normalizeString(snapshot.activeSlotScope),
      activeRegionId: normalizeString(snapshot.activeRegionId),
    },
  });
}

export function createLocationRegionsFromDungeonBrief(dungeonBrief = {}) {
  const brief = createDungeonBrief(dungeonBrief);
  return asArray(brief.roomBriefs).map((room, index) => ({
    id: room.sourceRegionId || `location-region-${index + 1}`,
    templateId: room.sourceRegionId || `location-region-${index + 1}`,
    name: room.name,
    role: room.role,
    roomType: room.type,
    shape: room.shape,
    preferredShape: room.shape,
    size: room.size,
    connectors: room.connectors,
    density: room.density,
    level: room.level,
    contexts: room.contexts,
    horror: room.horror,
    sourceAnchors: room.sourceAnchors,
    tags: room.tags,
    sensoryLayer: room.sensoryLayer,
    feature: room.visualSigns,
    interaction: room.interaction,
    interact: room.interaction,
    danger: room.hazard,
    secret: room.clue,
    reward: room.reward,
    encounter: room.encounter,
    readAloud: room.readAloud,
    links: room.links,
    dungeonRoomBrief: room,
  }));
}

export function createDungeonBriefFromDarkenLocationSnapshot(snapshot = {}) {
  const slotAssignments = normalizeSlotAssignments(snapshot.slotAssignments);
  const assignedComponents = normalizeAssignedComponents(slotAssignments, snapshot.selectedComponents);
  const sourceAnchors = normalizeSourceAnchorIds(snapshot.sourceAnchors);
  const theme = snapshot.dungeonThemeId
    ? resolveDungeonThemeForSourceAnchors([snapshot.dungeonThemeId])
    : resolveDungeonThemeForSourceAnchors(sourceAnchors);
  const locationRegions = asArray(snapshot.locationRegions);
  const roomBriefs = locationRegions
    .map((region, index) => normalizeRegionToRoomBrief(region, index, assignedComponents, theme))
    .filter(Boolean);
  const globalComponents = getGlobalComponents(assignedComponents);
  const roomCount = roomBriefs.length || undefined;

  return createDungeonBrief({
    id: normalizeString(snapshot.dungeonBriefId),
    mode: normalizeDungeonThemeMode(snapshot.dungeonMode),
    title: normalizeString(snapshot.title, "Cursed Location Build"),
    workflow: normalizeString(snapshot.workflow, "darken-location"),
    seed: normalizeString(snapshot.seed),
    theme,
    themeId: theme.id,
    themeName: theme.name,
    archetype: normalizeString(snapshot.archetype, theme.defaultArchetype),
    context: normalizeString(snapshot.context, theme.mapTypeBias[0] || "Crypt"),
    mapType: normalizeString(snapshot.mapType || snapshot.context, theme.mapTypeBias[0] || "Crypt"),
    roomCount,
    levelCount: Number(snapshot.levelCount || 1),
    density: normalizeString(snapshot.density, theme.layoutBias?.density || "standard"),
    connectionStyle: normalizeString(snapshot.connectionStyle, theme.layoutBias?.connectionStyle || "branching"),
    verticality: normalizeString(snapshot.verticality, theme.layoutBias?.verticality || "flat"),
    sourceAnchors,
    horror: asArray(snapshot.horrors),
    globalPalette: {
      sensory: [
        ...theme.sensoryPalette,
        ...globalComponents
          .filter((component) => component.slotId === "sensoryLayer")
          .map((component) => component.summary || component.title),
      ],
      visual: [
        ...theme.visualPalette,
        ...globalComponents
          .filter((component) => component.slotId === "visibleAnomaly")
          .map((component) => component.summary || component.title),
      ],
      hazards: theme.hazardBias,
      rewards: [
        ...theme.rewardBias,
        ...globalComponents
          .filter((component) => component.slotId === "reward")
          .map((component) => component.summary || component.title),
      ],
    },
    roomBriefs,
    metadata: {
      createdFrom: "darken-location-composer",
      scale: normalizeThemeControl(snapshot.dungeonScale, ["small", "medium", "large"], inferScaleFromRoomCount(roomBriefs.length || 0)),
      complexity: normalizeThemeControl(snapshot.dungeonComplexity, ["simple", "standard", "complex"], "standard"),
      intrusion: normalizeString(snapshot.intrusion),
      activeSlot: normalizeString(snapshot.activeSlot),
      activeSlotScope: normalizeString(snapshot.activeSlotScope),
      activeRegionId: normalizeString(snapshot.activeRegionId),
      slotAssignments,
      selectedComponents: assignedComponents,
    },
  });
}
