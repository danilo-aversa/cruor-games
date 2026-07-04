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

function unique(values) {
  return [...new Set(asArray(values).map((value) => String(value).trim()).filter(Boolean))];
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getMapInfluenceSource(source = {}) {
  if (!isPlainObject(source)) return null;
  return (
    source.mapInfluence ||
    source.location?.mapInfluence ||
    source.locationRegion?.mapInfluence ||
    source.map?.mapInfluence ||
    source.map?.influence ||
    null
  );
}

function normalizeMapInfluence(value = {}) {
  if (!isPlainObject(value)) return null;
  const forcedRoomArchetype = normalizeString(
    value.forcedRoomArchetype || value.forcedRoomArchetypeId,
  );
  const directRoomArchetype = normalizeString(
    forcedRoomArchetype || value.roomArchetype || value.roomArchetypeId,
  );
  const preferredRoomArchetypes = unique([
    directRoomArchetype && !forcedRoomArchetype ? directRoomArchetype : "",
    value.preferredRoomArchetype,
    value.preferredRoomArchetypeId,
    ...asArray(value.preferredRoomArchetypes),
    ...asArray(value.preferredRoomArchetypeIds),
  ]);
  const forbiddenRoomArchetypes = unique([
    value.forbiddenRoomArchetype,
    value.forbiddenRoomArchetypeId,
    ...asArray(value.forbiddenRoomArchetypes),
    ...asArray(value.forbiddenRoomArchetypeIds),
  ]);
  const sources = unique([
    ...asArray(value.sources),
    value.source,
    value.componentId,
    value.componentTitle,
  ]);
  const hasInfluence = Boolean(
    directRoomArchetype ||
      preferredRoomArchetypes.length ||
      forbiddenRoomArchetypes.length ||
      value.forceRoomArchetype ||
      value.force ||
      value.required,
  );
  if (!hasInfluence) return null;
  return {
    roomArchetype: directRoomArchetype,
    preferredRoomArchetypes,
    forbiddenRoomArchetypes,
    forceRoomArchetype: Boolean(value.forceRoomArchetype || value.force || value.required || forcedRoomArchetype),
    weight: normalizeNumber(value.weight ?? value.priority, 1),
    source: sources[0] || "",
    sources,
  };
}

function normalizeInfluenceToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getRoomArchetypeFromMapInfluence(influence = {}) {
  if (!isPlainObject(influence)) return "";
  const forbidden = new Set(asArray(influence.forbiddenRoomArchetypes).map(normalizeInfluenceToken));
  const isForced = Boolean(influence.forceRoomArchetype || influence.force || influence.required);
  const candidates = unique([
    influence.roomArchetype,
    influence.roomArchetypeId,
    influence.forcedRoomArchetype,
    influence.forcedRoomArchetypeId,
    ...asArray(influence.preferredRoomArchetypes),
    ...asArray(influence.preferredRoomArchetypeIds),
  ]);
  return candidates.find((candidate) => isForced || !forbidden.has(normalizeInfluenceToken(candidate))) || "";
}

function mergeMapInfluences(influences = []) {
  const normalized = asArray(influences).map(normalizeMapInfluence).filter(Boolean);
  if (!normalized.length) return null;
  const ordered = [...normalized].sort((a, b) => {
    if (a.forceRoomArchetype !== b.forceRoomArchetype) return a.forceRoomArchetype ? -1 : 1;
    return normalizeNumber(b.weight, 1) - normalizeNumber(a.weight, 1);
  });
  const primary = ordered.find((item) => getRoomArchetypeFromMapInfluence(item)) || ordered[0];
  return {
    roomArchetype: getRoomArchetypeFromMapInfluence(primary),
    preferredRoomArchetypes: unique(ordered.flatMap((item) => item.preferredRoomArchetypes)),
    forbiddenRoomArchetypes: unique(ordered.flatMap((item) => item.forbiddenRoomArchetypes)),
    forceRoomArchetype: ordered.some((item) => item.forceRoomArchetype),
    weight: ordered.reduce((sum, item) => sum + normalizeNumber(item.weight, 1), 0),
    sources: unique(ordered.flatMap((item) => [...asArray(item.sources), item.source])),
  };
}

function clonePlainObject(value) {
  if (!isPlainObject(value)) return {};
  return JSON.parse(JSON.stringify(value));
}

function buildComponentMapInfluence(component = {}) {
  const source = getMapInfluenceSource(component) || {};
  return normalizeMapInfluence({
    ...source,
    componentId: component.id,
    componentTitle: component.title || component.label,
    roomArchetype:
      source.roomArchetype ||
      source.roomArchetypeId ||
      component.roomArchetype ||
      component.roomArchetypeId ||
      component.locationRegion?.roomArchetype ||
      component.locationRegion?.roomArchetypeId ||
      component.map?.roomArchetype ||
      component.map?.roomArchetypeId ||
      "",
  });
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
        const mapInfluence = buildComponentMapInfluence(component);
        return {
          id: normalizeString(assignment.componentId || component.id),
          title: normalizeString(component.title),
          type: normalizeString(component.type),
          contentType: normalizeString(component.contentType),
          summary: normalizeString(component.summary),
          slotId: normalizeString(assignment.slotId, slotId),
          regionId: normalizeString(assignment.regionId),
          sourceAnchors: normalizeSourceAnchorIds(component.sourceAnchors),
          tags: asArray(component.tags),
          mapInfluence,
          locationRegion: clonePlainObject(component.locationRegion),
          map: clonePlainObject(component.map),
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
      contentType: normalizeString(component?.contentType),
      summary: normalizeString(component?.summary),
      slotId: normalizeString(component?.slotId),
      regionId: normalizeString(component?.regionId),
      sourceAnchors: normalizeSourceAnchorIds(component?.sourceAnchors),
      tags: asArray(component?.tags),
      mapInfluence: buildComponentMapInfluence(component),
      locationRegion: clonePlainObject(component?.locationRegion),
      map: clonePlainObject(component?.map),
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
  const regionLocation = isPlainObject(region.locationRegion) ? region.locationRegion : {};
  const regionMap = isPlainObject(region.map) ? region.map : {};
  const declaredRoomArchetypeSource = normalizeString(
    region.roomArchetypeSource ||
      region.metadata?.roomArchetypeSource ||
      region.requestMetadata?.roomArchetypeSource,
  );
  const rawDirectRoomArchetype =
    region.roomArchetype ||
    region.roomArchetypeId ||
    region.archetype ||
    regionLocation.roomArchetype ||
    regionLocation.roomArchetypeId ||
    regionMap.roomArchetype ||
    regionMap.roomArchetypeId ||
    "";
  const directRoomArchetype = normalizeString(
    declaredRoomArchetypeSource === "map-influence" ? "" : rawDirectRoomArchetype,
  );
  const regionMapInfluence = normalizeMapInfluence({
    ...(getMapInfluenceSource(region) || {}),
    roomArchetype: rawDirectRoomArchetype,
  });
  const componentInfluences = regionComponents.map((component) => component.mapInfluence).filter(Boolean);
  const mapInfluence = mergeMapInfluences([regionMapInfluence, ...componentInfluences]);
  const roomArchetype = normalizeString(directRoomArchetype || getRoomArchetypeFromMapInfluence(mapInfluence));
  const roomArchetypeSource = directRoomArchetype ? "explicit" : roomArchetype ? "map-influence" : "";
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
    roomArchetype,
    roomArchetypeSource,
    mapInfluence,
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

const THEME_SIGNATURE_ROOM_TYPES = Object.freeze({
  "generic-dark-location": Object.freeze([
    "cursed threshold",
    "ominous passage",
    "darkened clue room",
    "pressure chamber",
    "sealed reward room",
    "final chamber",
  ]),
  "sedlec-ossuary": Object.freeze([
    "bone-lit vestibule",
    "skull-lined corridor",
    "ossuary gallery",
    "crypt chapel",
    "reliquary niche",
    "sealed catacomb",
    "bone archive",
    "mass grave",
  ]),
  decomposition: Object.freeze([
    "soft-floored tunnel",
    "gas pocket",
    "wet archive",
    "bloated chamber",
    "drainage crypt",
    "collapse room",
    "grave-wax shrine",
  ]),
  "towers-of-silence": Object.freeze([
    "ritual boundary",
    "exposure court",
    "vulture gallery",
    "sun-bleached stair",
    "purity chamber",
    "bone well",
    "open sky chamber",
  ]),
  "the-mist": Object.freeze([
    "fog-return corridor",
    "visibility break",
    "sealed supply room",
    "panic chamber",
    "glass threshold",
    "creature pressure point",
    "false exit",
  ]),
  "wolf-spiders": Object.freeze([
    "webbed threshold",
    "hunting corridor",
    "egg chamber",
    "molting room",
    "victim cache",
    "brood nest",
    "silk choke point",
  ]),
});

const THEME_PROGRAM_VARIANTS = Object.freeze([
  Object.freeze({
    id: "signature-path",
    label: "Signature Path",
    summary: "A focused sequence built around the theme's iconic rooms.",
    roomCountDelta: 0,
    roomTypeShift: 0,
    roleShift: 0,
    branchBias: 0,
    secretBias: 0,
  }),
  Object.freeze({
    id: "hidden-branch",
    label: "Hidden Branch",
    summary: "A stronger side route with an extra clue or secret pressure point.",
    roomCountDelta: 1,
    roomTypeShift: 2,
    roleShift: 1,
    branchBias: 1,
    secretBias: 1,
  }),
  Object.freeze({
    id: "pressure-loop",
    label: "Pressure Loop",
    summary: "A loopier program with repeated danger, return paths, and a sharper climax.",
    roomCountDelta: 2,
    roomTypeShift: 4,
    roleShift: 2,
    branchBias: 2,
    secretBias: 0,
  }),
]);

function clampInteger(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(Number(value))));
}

function createSeededRandom(seed = "") {
  let hash = 2166136261;
  const text = normalizeString(seed, "cruor-theme-program");
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return () => {
    hash += 0x6d2b79f5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function rotateArray(values = [], shift = 0) {
  const list = asArray(values);
  if (!list.length) return [];
  const normalizedShift = ((Math.round(shift) % list.length) + list.length) % list.length;
  return [...list.slice(normalizedShift), ...list.slice(0, normalizedShift)];
}

function normalizeThemeScale(scale, roomCount) {
  if (normalizeString(scale).toLowerCase() === "custom") return "custom";
  return normalizeThemeControl(scale, ["small", "medium", "large"], roomCount ? inferScaleFromRoomCount(roomCount) : "medium");
}

function getThemeLayoutScale(scale, roomCount) {
  return normalizeThemeScale(scale, roomCount) === "custom"
    ? inferScaleFromRoomCount(roomCount || 8)
    : normalizeThemeControl(scale, ["small", "medium", "large"], "medium");
}

function getRequestedThemeRoomCount(snapshot = {}) {
  const scale = normalizeString(snapshot.dungeonScale).toLowerCase();
  const rawCount = snapshot.roomCount ?? snapshot.dungeonCustomRoomCount;
  const parsed = Number.parseInt(rawCount, 10);
  if (scale !== "custom" || !Number.isFinite(parsed)) return undefined;
  return clampInteger(parsed, 1, 16);
}

function getThemeRoomCount({ scale = "medium", complexity = "standard", theme, variant = null } = {}) {
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
  const variantDelta = Number(variant?.roomCountDelta || 0);
  return Math.max(base.min, Math.min(base.max, base.fallback + bonus + themeModifier + variantDelta));
}

function getThemeRoomSize(role, index, roomCount, scale, variant = null) {
  const normalizedRole = normalizeString(role).toLowerCase();
  if (normalizedRole.includes("climax") || normalizedRole.includes("ritual")) return "Large";
  if (normalizedRole.includes("entrance") || normalizedRole.includes("secret") || normalizedRole.includes("reward")) return "Small";
  if (variant?.id === "pressure-loop" && index > 0 && index % 4 === 0) return "Large";
  if (scale === "large" && index === roomCount - 1) return "Large";
  return "Medium";
}

function getThemeConnectors(role, index, roomCount, complexity, variant = null) {
  const normalizedRole = normalizeString(role).toLowerCase();
  const branchBias = Number(variant?.branchBias || 0);
  if (index === 0) return Math.min(4, (complexity === "complex" ? 3 : 2) + Math.min(1, branchBias));
  if (index >= roomCount - 1) return 1;
  if (normalizedRole.includes("secret")) return 1;
  if (normalizedRole.includes("loop")) return 3;
  if (branchBias && index % 4 === 2) return Math.min(4, 2 + branchBias);
  return complexity === "complex" && index % 3 === 0 ? 3 : 2;
}

function roomRoleIncludes(room, terms = []) {
  const role = normalizeString(room?.role).toLowerCase();
  const tags = asArray(room?.tags).map((tag) => normalizeString(tag).toLowerCase());
  return asArray(terms).some((term) => {
    const text = normalizeString(term).toLowerCase();
    return role.includes(text) || tags.some((tag) => tag.includes(text));
  });
}

function countRoomsByRole(roomBriefs = [], terms = []) {
  return asArray(roomBriefs).filter((room) => roomRoleIncludes(room, terms)).length;
}

function createThemeProgramReview({ roomBriefs = [], metrics = {}, scale = "medium", complexity = "standard", theme = null, variant = null } = {}) {
  const rooms = asArray(roomBriefs);
  const roomCount = rooms.length;
  const branchRooms = Number(metrics.branches || 0);
  const secretRooms = Number(metrics.secrets || 0);
  const hazardRooms = Number(metrics.hazards || 0);
  const clueRooms = rooms.filter((room) => normalizeString(room.clue)).length + countRoomsByRole(rooms, ["clue", "discovery"]);
  const rewardRooms = rooms.filter((room) => normalizeString(room.reward)).length + countRoomsByRole(rooms, ["reward"]);
  const loopRooms = countRoomsByRole(rooms, ["loop"]);
  const largeRooms = rooms.filter((room) => room.size === "Large").length;
  const verticalRooms = rooms.filter((room) => Number(room.level || 0) !== 0).length;
  const connectorValues = rooms.map((room) => Number(room.connectors || 0)).filter(Number.isFinite);
  const maxConnectors = connectorValues.length ? Math.max(...connectorValues) : 0;
  const totalConnectors = connectorValues.reduce((total, value) => total + value, 0);
  const averageConnectors = roomCount ? totalConnectors / roomCount : 0;
  const warnings = [];
  const strengths = [];
  const notes = [];
  const flowTags = [];
  let score = 100;

  if (roomCount >= 12 && complexity === "complex") {
    score -= 12;
    warnings.push("Large complex program: expect longer routes or detours; review in Scratch before export.");
  } else if (roomCount >= 12) {
    score -= 5;
    warnings.push("Large program: check route readability after map generation.");
  }

  if (branchRooms >= Math.max(3, Math.ceil(roomCount * 0.34))) {
    score -= 10;
    warnings.push("High branch pressure: side paths may stretch the map layout.");
  }

  if (maxConnectors >= 4) {
    score -= 6;
    warnings.push("One room asks for many exits; verify that the generated hub remains readable.");
  }

  if (roomCount <= 5 && branchRooms >= 2) {
    score -= 7;
    warnings.push("Small map with multiple branches: consider Scratch review before using it.");
  }

  if (largeRooms >= Math.max(3, Math.ceil(roomCount * 0.3))) {
    score -= 5;
    warnings.push("Many large rooms: generated footprints may feel wide or sparse.");
  }

  if (variant?.id === "hidden-branch" && secretRooms < 1) {
    score -= 8;
    warnings.push("Hidden Branch has no secret room; regenerate if you need a stronger reveal.");
  }

  if (complexity !== "simple" && hazardRooms < 1) {
    score -= 5;
    warnings.push("Low danger density for this complexity level.");
  }

  if (secretRooms > 0) {
    strengths.push("Has a dedicated secret pressure point.");
    flowTags.push("Secret");
  }

  if (hazardRooms > 0) {
    strengths.push("Includes explicit danger beats.");
    flowTags.push("Hazard");
  }

  if (branchRooms > 0) {
    strengths.push("Supports at least one branch or tactical choice.");
    flowTags.push(branchRooms > 2 ? "Branching" : "Side Path");
  }

  if (loopRooms > 0) {
    strengths.push("Contains a loop beat for return pressure.");
    flowTags.push("Loop");
  }

  if (rewardRooms > 0 || clueRooms > 0) {
    strengths.push("Has clue or reward pacing after pressure.");
    flowTags.push("Payoff");
  }

  if (verticalRooms > 0) {
    notes.push("Uses vertical or lower-level rooms.");
    flowTags.push("Vertical");
  }

  if (!strengths.length) {
    strengths.push("Clear linear baseline for fast prep.");
    flowTags.push("Linear");
  }

  const normalizedScore = clampInteger(score, 40, 100);
  const status = normalizedScore >= 84 ? "ready" : normalizedScore >= 70 ? "review" : "caution";
  const statusLabel = status === "ready" ? "Ready" : status === "review" ? "Review" : "Caution";
  const recommendedAction = status === "ready"
    ? "Use this program or open it in Scratch for final room wording."
    : "Open this program in Scratch before committing to the map.";

  return {
    score: normalizedScore,
    status,
    statusLabel,
    recommendedAction,
    warnings: warnings.slice(0, 3),
    strengths: strengths.slice(0, 3),
    notes: notes.slice(0, 2),
    flowTags: [...new Set(flowTags)].slice(0, 4),
    layoutRisk: status,
    metrics: {
      averageConnectors: Number(averageConnectors.toFixed(1)),
      maxConnectors,
      branchRooms,
      secretRooms,
      hazardRooms,
      clueRooms,
      rewardRooms,
      loopRooms,
      largeRooms,
      verticalRooms,
      roomCount,
      scale: normalizeThemeScale(scale, roomCount),
      complexity: normalizeThemeControl(complexity, ["simple", "standard", "complex"], "standard"),
      themeId: normalizeString(theme?.id),
    },
  };
}

function getThemeSignatureRoomTypes(theme) {
  return asArray(THEME_SIGNATURE_ROOM_TYPES[theme?.id]).length
    ? asArray(THEME_SIGNATURE_ROOM_TYPES[theme.id])
    : asArray(theme?.roomTypeBias);
}

function getRoomRoleForThemeProgram(roles, index, count, variant = null) {
  if (index === 0) return "entrance";
  if (index === count - 1) return "climax";
  if (variant?.secretBias && index === Math.max(1, count - 2)) return "secret";
  if (variant?.id === "pressure-loop" && index > 1 && index % 4 === 0) return "loop";
  const rotatedRoles = rotateArray(roles, variant?.roleShift || 0).filter((role) => role !== "entrance" && role !== "exit");
  return rotatedRoles[(index - 1) % Math.max(1, rotatedRoles.length)] || "transition";
}

function createThemeRoomName(theme, roomType, index, variant = null) {
  const prefix = String(index + 1).padStart(2, "0");
  const name = titleCase(roomType || theme?.roomTypeBias?.[index] || "Location Region");
  if (!variant || variant.id === "signature-path") return `${prefix} ${name}`;
  return `${prefix} ${name}`;
}

function createThemeProgramId({ theme, scale, complexity, context, seed, variant, roomCount }) {
  return [
    "theme-program",
    normalizeString(theme?.id, "generic"),
    normalizeThemeScale(scale, roomCount),
    roomCount ? `rooms-${clampInteger(roomCount, 1, 16)}` : "auto",
    normalizeThemeControl(complexity, ["simple", "standard", "complex"], "standard"),
    getSourceAnchorId(context || "context"),
    getSourceAnchorId(seed || "draft"),
    variant?.id || "signature-path",
  ].join("-");
}

export function createThemeRoomBriefs({
  theme,
  roomCount,
  scale = "medium",
  complexity = "standard",
  context = "",
  seed = "",
  variant = null,
  variantIndex = 0,
} = {}) {
  const safeTheme = theme || resolveDungeonThemeForSourceAnchors([]);
  const random = createSeededRandom(`${safeTheme.id}:${scale}:${complexity}:${context}:${seed}:${variant?.id || variantIndex}`);
  const explicitRoomCount = Number.isFinite(Number(roomCount)) && Number(roomCount) > 0;
  const count = explicitRoomCount
    ? clampInteger(roomCount, 1, 16)
    : getThemeRoomCount({ scale, complexity, theme: safeTheme, variant });
  const signatureRoomTypes = getThemeSignatureRoomTypes(safeTheme);
  const roomTypes = rotateArray(signatureRoomTypes.length ? signatureRoomTypes : safeTheme.roomTypeBias, (variant?.roomTypeShift || 0) + Math.floor(random() * 2));
  const roles = asArray(safeTheme.roomRoleSequence);
  const sensoryPalette = rotateArray(safeTheme.sensoryPalette, variantIndex);
  const visualPalette = rotateArray(safeTheme.visualPalette, variantIndex + 1);
  const hazardBias = rotateArray(safeTheme.hazardBias, variantIndex + 2);
  const rewardBias = rotateArray(safeTheme.rewardBias, variantIndex + 3);

  return Array.from({ length: count }, (_, index) => {
    const role = getRoomRoleForThemeProgram(roles, index, count, variant);
    const roomType = roomTypes[index % Math.max(1, roomTypes.length)] || "room";
    const lowerRole = normalizeString(role).toLowerCase();
    const isHazard = lowerRole.includes("hazard") || lowerRole.includes("ambush") || lowerRole.includes("loop");
    const isReward = lowerRole.includes("reward");
    const isSecret = lowerRole.includes("secret");
    const isClimax = lowerRole.includes("climax") || index === count - 1;

    return {
      id: `room-${String(index + 1).padStart(2, "0")}`,
      index: index + 1,
      name: createThemeRoomName(safeTheme, roomType, index, variant),
      role,
      type: roomType,
      size: getThemeRoomSize(role, index, count, scale, variant),
      level: safeTheme.layoutBias?.verticality === "crypt_below_chapel" && index >= Math.ceil(count / 2) ? -1 : 0,
      connectors: getThemeConnectors(role, index, count, complexity, variant),
      density: safeTheme.layoutBias?.density || "standard",
      shape: roomType,
      sourceRegionId: `location-region-${index + 1}`,
      sourceAnchors: safeTheme.sourceAnchorIds,
      horror: [],
      contexts: [context || safeTheme.mapTypeBias?.[0] || "Crypt"],
      tags: [role, roomType, safeTheme.id, variant?.id, isSecret ? "secret" : ""].filter(Boolean),
      sensoryLayer: sensoryPalette[index % Math.max(1, sensoryPalette.length)] || "",
      visualSigns: visualPalette[index % Math.max(1, visualPalette.length)] || "",
      hazard: isHazard ? hazardBias[index % Math.max(1, hazardBias.length)] || "" : "",
      reward: isReward || isClimax ? rewardBias[index % Math.max(1, rewardBias.length)] || "" : "",
      clue: lowerRole.includes("clue") || isSecret ? visualPalette[(index + 1) % Math.max(1, visualPalette.length)] || "" : "",
      encounter: isClimax ? `${titleCase(safeTheme.name)} climax pressure` : "",
      interaction: "",
      secret: isSecret,
      links: [isSecret ? "secret" : variant?.id || "main"],
      notes: variant?.summary || "",
    };
  });
}

export function createThemeRoomProgramCandidates({
  theme,
  scale = "medium",
  complexity = "standard",
  context = "",
  seed = "",
  roomCount,
  count = 3,
} = {}) {
  const safeTheme = theme || resolveDungeonThemeForSourceAnchors([]);
  const candidateCount = clampInteger(count, 1, THEME_PROGRAM_VARIANTS.length);
  const requestedRoomCount = Number.isFinite(Number(roomCount)) ? clampInteger(roomCount, 1, 16) : undefined;
  const layoutScale = getThemeLayoutScale(scale, requestedRoomCount);
  return THEME_PROGRAM_VARIANTS.slice(0, candidateCount).map((variant, index) => {
    const roomBriefs = createThemeRoomBriefs({
      theme: safeTheme,
      scale: layoutScale,
      complexity,
      context,
      seed,
      roomCount: requestedRoomCount,
      variant,
      variantIndex: index,
    });
    const signatureRooms = roomBriefs
      .filter((room) => room.role === "climax" || room.role === "secret" || room.role === "hazard" || room.role === "loop")
      .slice(0, 4)
      .map((room) => room.name);

    const metrics = {
      branches: roomBriefs.filter((room) => Number(room.connectors) >= 3).length,
      secrets: roomBriefs.filter((room) => room.secret).length,
      hazards: roomBriefs.filter((room) => room.hazard).length,
    };

    return {
      id: createThemeProgramId({ theme: safeTheme, scale, complexity, context, seed, variant, roomCount: requestedRoomCount }),
      label: variant.label,
      summary: variant.summary,
      themeId: safeTheme.id,
      themeName: safeTheme.name,
      scale: normalizeThemeScale(scale, requestedRoomCount),
      complexity: normalizeThemeControl(complexity, ["simple", "standard", "complex"], "standard"),
      context: context || safeTheme.mapTypeBias?.[0] || "Crypt",
      roomCount: roomBriefs.length,
      signatureRooms,
      roomBriefs,
      metrics,
      review: createThemeProgramReview({
        roomBriefs,
        metrics,
        scale,
        complexity,
        theme: safeTheme,
        variant,
      }),
    };
  });
}

export function createThemeDungeonBriefCandidatesFromDarkenLocationSnapshot(snapshot = {}, { count = 3 } = {}) {
  const sourceAnchors = normalizeSourceAnchorIds(snapshot.sourceAnchors);
  const requestedTheme = snapshot.dungeonThemeId
    ? resolveDungeonThemeForSourceAnchors([snapshot.dungeonThemeId])
    : resolveDungeonThemeForSourceAnchors(sourceAnchors);
  const theme = requestedTheme || resolveDungeonThemeForSourceAnchors(sourceAnchors);
  const roomCount = getRequestedThemeRoomCount(snapshot);
  const scale = normalizeThemeScale(snapshot.dungeonScale, roomCount);
  const complexity = normalizeThemeControl(snapshot.dungeonComplexity, ["simple", "standard", "complex"], "standard");
  const context = normalizeString(snapshot.context, theme.mapTypeBias[0] || "Crypt");

  return createThemeRoomProgramCandidates({ theme, scale, complexity, context, seed: snapshot.seed, roomCount, count })
    .map((candidate) => {
      const dungeonBrief = createDungeonBrief({
        id: `${normalizeString(snapshot.dungeonBriefId, "dungeon-brief")}-${candidate.id}`,
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
        roomCount: candidate.roomBriefs.length,
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
        roomBriefs: candidate.roomBriefs,
        metadata: {
          createdFrom: "theme-mode-candidate",
          scale,
          complexity,
          candidateId: candidate.id,
          activeSlot: normalizeString(snapshot.activeSlot),
          activeSlotScope: normalizeString(snapshot.activeSlotScope),
          activeRegionId: normalizeString(snapshot.activeRegionId),
        },
      });

      return {
        ...candidate,
        dungeonBrief,
      };
    });
}

export function createThemeDungeonBriefFromDarkenLocationSnapshot(snapshot = {}) {
  const sourceAnchors = normalizeSourceAnchorIds(snapshot.sourceAnchors);
  const requestedTheme = snapshot.dungeonThemeId
    ? resolveDungeonThemeForSourceAnchors([snapshot.dungeonThemeId])
    : resolveDungeonThemeForSourceAnchors(sourceAnchors);
  const theme = requestedTheme || resolveDungeonThemeForSourceAnchors(sourceAnchors);
  const roomCount = getRequestedThemeRoomCount(snapshot);
  const scale = normalizeThemeScale(snapshot.dungeonScale, roomCount);
  const layoutScale = getThemeLayoutScale(scale, roomCount);
  const complexity = normalizeThemeControl(snapshot.dungeonComplexity, ["simple", "standard", "complex"], "standard");
  const context = normalizeString(snapshot.context, theme.mapTypeBias[0] || "Crypt");
  const roomBriefs = createThemeRoomBriefs({
    theme,
    scale: layoutScale,
    complexity,
    context,
    roomCount,
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
    roomArchetype: room.roomArchetype,
    roomArchetypeSource: room.roomArchetypeSource,
    mapInfluence: room.mapInfluence,
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
      scale: normalizeThemeScale(snapshot.dungeonScale, roomBriefs.length || 0),
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
