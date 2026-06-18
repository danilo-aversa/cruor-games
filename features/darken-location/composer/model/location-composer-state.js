import { createInitialCrucibleState } from "../../../crucible/crucible.state.js";

const DEFAULT_SELECTED_SOURCE = "Sedlec Ossuary";
const DEFAULT_SELECTED_HORROR = "Religious Horror";
const DEFAULT_CONTEXT = "Crypt";
const DEFAULT_INTRUSION = "Medium";

export const LOCATION_SLOT_SCOPE_MAP = "map";
export const LOCATION_SLOT_SCOPE_REGION = "region";

export const DEFAULT_LOCATION_SLOT_IDS = [
  "horrorPremise",
  "sensoryLayer",
  "visibleAnomaly",
  "hazard",
  "clue",
  "encounterTwist",
  "reward",
];

const MAP_SCOPED_SLOT_IDS = new Set([
  "horrorPremise",
  "sensoryLayer",
  "visibleAnomaly",
  "reward",
]);

export function createLocationMapSeed(prefix = "darken-map") {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${timePart}-${randomPart}`;
}

export function normalizeLocationSlotScope(value) {
  return value === LOCATION_SLOT_SCOPE_REGION
    ? LOCATION_SLOT_SCOPE_REGION
    : LOCATION_SLOT_SCOPE_MAP;
}

export function createInitialLocationComposerState(regionTemplates = []) {
  const legacyState = createInitialCrucibleState();
  const initialRegions = Array.isArray(regionTemplates)
    ? regionTemplates.slice(0, 4).map((region, index) => ({
        ...region,
        id: region.templateId || region.id || `location-region-${index + 1}`,
      }))
    : [];

  return {
    ...legacyState,
    workflow: "darken-location",
    title: "Cursed Location Build",
    context: DEFAULT_CONTEXT,
    horror: DEFAULT_SELECTED_HORROR,
    sourceAnchors: new Set([DEFAULT_SELECTED_SOURCE]),
    horrors: new Set([DEFAULT_SELECTED_HORROR]),
    intrusion: DEFAULT_INTRUSION,
    seed: "",
    dungeonMode: "theme",
    dungeonThemeId: "sedlec-ossuary",
    dungeonScale: "medium",
    dungeonComplexity: "standard",
    themeProgramCandidates: [],
    activeThemeProgramCandidateId: "",
    activeSlot: "horrorPremise",
    activeSlotScope: LOCATION_SLOT_SCOPE_MAP,
    activeRegionId: initialRegions[0]?.id || "",
    selectedComponentIds: new Set(),
    slotAssignments: {},
    locationRegions: initialRegions,
  };
}

export function toArray(value) {
  if (value instanceof Set) return Array.from(value);
  if (Array.isArray(value)) return value;
  return [];
}

export function normalizeSlotAssignments(assignments = {}) {
  return Object.fromEntries(
    Object.entries(assignments || {}).map(([slotId, items]) => [
      slotId,
      Array.isArray(items)
        ? items
            .filter((item) => item && item.componentId)
            .map((item) => {
              const normalizedSlotId = item.slotId || slotId;
              return {
                componentId: item.componentId,
                slotId: normalizedSlotId,
                regionId: MAP_SCOPED_SLOT_IDS.has(normalizedSlotId) ? "" : item.regionId || "",
                addedAt: item.addedAt || 0,
              };
            })
        : [],
    ]),
  );
}

export function deriveSelectedComponentIds(slotAssignments = {}) {
  return new Set(
    Object.values(slotAssignments)
      .flat()
      .map((assignment) => assignment.componentId)
      .filter(Boolean),
  );
}

function normalizeAssignmentTarget(state, target = {}) {
  if (typeof target === "string") {
    return {
      scope: target ? LOCATION_SLOT_SCOPE_REGION : LOCATION_SLOT_SCOPE_MAP,
      regionId: target,
    };
  }

  const scope = normalizeLocationSlotScope(target.scope);
  return {
    scope,
    regionId:
      scope === LOCATION_SLOT_SCOPE_REGION
        ? target.regionId || state.activeRegionId || ""
        : "",
  };
}

export function assignComponentToSlot(state, component, slot, target = {}) {
  if (!component?.id || !slot?.id) return state;

  const slotId = slot.id;
  const max = Number.isFinite(slot.max) ? Math.max(1, slot.max) : 1;
  const normalizedAssignments = normalizeSlotAssignments(state.slotAssignments);
  const { scope, regionId } = normalizeAssignmentTarget(state, target);

  const cleanedAssignments = Object.fromEntries(
    Object.entries(normalizedAssignments).map(([currentSlotId, assignments]) => [
      currentSlotId,
      assignments.filter((assignment) => assignment.componentId !== component.id),
    ]),
  );

  const currentSlotAssignments = cleanedAssignments[slotId] || [];
  const otherScopeAssignments = currentSlotAssignments.filter(
    (assignment) => assignment.regionId !== regionId,
  );
  const sameScopeAssignments = currentSlotAssignments.filter(
    (assignment) => assignment.regionId === regionId,
  );
  const nextAssignment = {
    componentId: component.id,
    slotId,
    regionId,
    addedAt: Date.now(),
  };
  const nextScopedAssignments = [...sameScopeAssignments, nextAssignment].slice(-max);
  const nextSlotAssignmentsMap = {
    ...cleanedAssignments,
    [slotId]: [...otherScopeAssignments, ...nextScopedAssignments],
  };

  return {
    ...state,
    activeSlot: slotId,
    activeSlotScope: scope,
    activeRegionId:
      scope === LOCATION_SLOT_SCOPE_REGION
        ? regionId || state.activeRegionId
        : state.activeRegionId,
    slotAssignments: nextSlotAssignmentsMap,
    selectedComponentIds: deriveSelectedComponentIds(nextSlotAssignmentsMap),
  };
}

export function removeComponentFromSlot(state, componentId, slotId = "") {
  const normalizedAssignments = normalizeSlotAssignments(state.slotAssignments);
  const nextSlotAssignmentsMap = Object.fromEntries(
    Object.entries(normalizedAssignments).map(([currentSlotId, assignments]) => [
      currentSlotId,
      assignments.filter((assignment) => {
        if (slotId && currentSlotId !== slotId) return true;
        return assignment.componentId !== componentId;
      }),
    ]),
  );

  return {
    ...state,
    slotAssignments: nextSlotAssignmentsMap,
    selectedComponentIds: deriveSelectedComponentIds(nextSlotAssignmentsMap),
  };
}

export function moveAssignmentToRegion(state, componentId, regionId) {
  const normalizedAssignments = normalizeSlotAssignments(state.slotAssignments);
  const nextSlotAssignmentsMap = Object.fromEntries(
    Object.entries(normalizedAssignments).map(([slotId, assignments]) => [
      slotId,
      assignments.map((assignment) =>
        assignment.componentId === componentId
          ? { ...assignment, regionId: regionId || "" }
          : assignment,
      ),
    ]),
  );

  return {
    ...state,
    activeSlotScope: regionId ? LOCATION_SLOT_SCOPE_REGION : LOCATION_SLOT_SCOPE_MAP,
    activeRegionId: regionId || state.activeRegionId,
    slotAssignments: nextSlotAssignmentsMap,
    selectedComponentIds: deriveSelectedComponentIds(nextSlotAssignmentsMap),
  };
}

export function createLocationComposerSnapshot(state, selectedComponents = []) {
  const slotAssignments = normalizeSlotAssignments(state.slotAssignments);

  return {
    workflow: state.workflow || "darken-location",
    title: state.title || "Cursed Location Build",
    context: state.context || DEFAULT_CONTEXT,
    horror: state.horror || DEFAULT_SELECTED_HORROR,
    horrors: toArray(state.horrors),
    sourceAnchors: toArray(state.sourceAnchors),
    intrusion: state.intrusion || DEFAULT_INTRUSION,
    seed: state.seed || "",
    dungeonMode: state.dungeonMode || "theme",
    dungeonThemeId: state.dungeonThemeId || "",
    dungeonScale: state.dungeonScale || "medium",
    dungeonComplexity: state.dungeonComplexity || "standard",
    themeProgramCandidates: Array.isArray(state.themeProgramCandidates) ? state.themeProgramCandidates : [],
    activeThemeProgramCandidateId: state.activeThemeProgramCandidateId || "",
    activeSlot: state.activeSlot || "horrorPremise",
    activeSlotScope: normalizeLocationSlotScope(state.activeSlotScope),
    activeRegionId: state.activeRegionId || "",
    selectedComponentIds: Array.from(deriveSelectedComponentIds(slotAssignments)),
    slotAssignments,
    selectedComponents,
    locationRegions: Array.isArray(state.locationRegions) ? state.locationRegions : [],
  };
}

export function toggleSetValue(sourceSet, value) {
  const next = new Set(sourceSet || []);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export const SCRATCH_ROOM_ROLE_OPTIONS = [
  "entrance",
  "transition",
  "discovery",
  "hazard",
  "clue",
  "reward",
  "secret",
  "climax",
  "exit",
  "custom",
];

export const SCRATCH_ROOM_SIZE_OPTIONS = ["Small", "Medium", "Large"];

export const SCRATCH_ROOM_TYPE_OPTIONS = [
  "vestibule",
  "corridor",
  "gallery",
  "chapel",
  "crypt",
  "archive",
  "reliquary",
  "lair",
  "secret passage",
  "final chamber",
];

export function normalizeScratchRoomCount(value, fallback = 4) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(16, Math.round(parsed)));
}

function titleCaseScratchValue(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`);
}

function createScratchRegionId(index) {
  return `location-region-${index + 1}`;
}

export function createScratchLocationRegion(index = 0, overrides = {}) {
  const safeIndex = Math.max(0, Number.isFinite(Number(index)) ? Math.round(Number(index)) : 0);
  const role = overrides.role || SCRATCH_ROOM_ROLE_OPTIONS[safeIndex % SCRATCH_ROOM_ROLE_OPTIONS.length] || "location region";
  const roomType = overrides.roomType || overrides.type || SCRATCH_ROOM_TYPE_OPTIONS[safeIndex % SCRATCH_ROOM_TYPE_OPTIONS.length] || "room";
  const name = overrides.name || `${String(safeIndex + 1).padStart(2, "0")} ${titleCaseScratchValue(roomType || role || "Room")}`;
  const id = overrides.id || overrides.templateId || createScratchRegionId(safeIndex);

  return {
    id,
    templateId: id,
    name,
    role,
    roomType,
    shape: overrides.shape || overrides.preferredShape || roomType,
    preferredShape: overrides.preferredShape || overrides.shape || roomType,
    size: SCRATCH_ROOM_SIZE_OPTIONS.includes(overrides.size) ? overrides.size : "Medium",
    connectors: Number.isFinite(Number(overrides.connectors)) ? Math.max(0, Math.min(8, Math.round(Number(overrides.connectors)))) : safeIndex === 0 ? 2 : 1,
    density: overrides.density || "interactive",
    level: Number.isFinite(Number(overrides.level)) ? Math.max(-9, Math.min(9, Math.round(Number(overrides.level)))) : 0,
    contexts: toArray(overrides.contexts),
    horror: toArray(overrides.horror),
    sourceAnchors: toArray(overrides.sourceAnchors),
    tags: toArray(overrides.tags || [role, roomType]).filter(Boolean),
    sensoryLayer: overrides.sensoryLayer || "",
    feature: overrides.feature || overrides.visualSigns || "",
    interaction: overrides.interaction || overrides.interact || "",
    interact: overrides.interact || overrides.interaction || "",
    danger: overrides.danger || overrides.hazard || "",
    secret: overrides.secret || overrides.clue || "",
    reward: overrides.reward || "",
    encounter: overrides.encounter || overrides.encounterTwist || "",
    readAloud: overrides.readAloud || "",
    links: toArray(overrides.links || [role === "secret" ? "secret" : "main"]),
    dungeonRoomBrief: overrides.dungeonRoomBrief || null,
  };
}

export function setScratchLocationRoomCount(state, roomCount) {
  const currentRegions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
  const count = normalizeScratchRoomCount(roomCount, currentRegions.length || 4);
  const nextRegions = Array.from({ length: count }, (_, index) =>
    currentRegions[index]
      ? createScratchLocationRegion(index, currentRegions[index])
      : createScratchLocationRegion(index, {
          contexts: state.context ? [state.context] : [],
          horror: toArray(state.horrors),
          sourceAnchors: toArray(state.sourceAnchors),
        }),
  );
  const activeRegionId = nextRegions.some((region) => region.id === state.activeRegionId)
    ? state.activeRegionId
    : nextRegions[0]?.id || "";

  return {
    ...state,
    dungeonMode: "scratch",
    locationRegions: nextRegions,
    activeRegionId,
    activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
  };
}

export function addScratchLocationRoom(state) {
  const currentRegions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
  if (currentRegions.length >= 16) return state;
  const nextRegion = createScratchLocationRegion(currentRegions.length, {
    contexts: state.context ? [state.context] : [],
    horror: toArray(state.horrors),
    sourceAnchors: toArray(state.sourceAnchors),
  });

  return {
    ...state,
    dungeonMode: "scratch",
    locationRegions: [...currentRegions, nextRegion],
    activeRegionId: nextRegion.id,
    activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
  };
}

export function removeScratchLocationRoom(state, regionId) {
  const currentRegions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
  if (currentRegions.length <= 1) return state;
  const removeId = regionId || state.activeRegionId;
  const nextRegions = currentRegions
    .filter((region) => region.id !== removeId)
    .map((region, index) => createScratchLocationRegion(index, region));
  const activeRegionId = nextRegions.some((region) => region.id === state.activeRegionId)
    ? state.activeRegionId
    : nextRegions[Math.max(0, Math.min(nextRegions.length - 1, currentRegions.findIndex((region) => region.id === removeId)))]?.id || nextRegions[0]?.id || "";

  return {
    ...state,
    dungeonMode: "scratch",
    locationRegions: nextRegions,
    activeRegionId,
    activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
  };
}

export function updateScratchLocationRoom(state, regionId, updates = {}) {
  const currentRegions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
  const targetId = regionId || state.activeRegionId;
  const nextRegions = currentRegions.map((region, index) =>
    region.id === targetId
      ? createScratchLocationRegion(index, { ...region, ...updates, id: region.id, templateId: region.templateId || region.id })
      : region,
  );

  return {
    ...state,
    dungeonMode: "scratch",
    locationRegions: nextRegions,
    activeRegionId: targetId || state.activeRegionId,
    activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
  };
}

export function regenerateScratchLocationRoom(state, regionId) {
  const currentRegions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
  const targetId = regionId || state.activeRegionId;
  const nextRegions = currentRegions.map((region, index) =>
    region.id === targetId
      ? createScratchLocationRegion(index, {
          id: region.id,
          templateId: region.templateId || region.id,
          contexts: state.context ? [state.context] : [],
          horror: toArray(state.horrors),
          sourceAnchors: toArray(state.sourceAnchors),
        })
      : region,
  );

  return {
    ...state,
    dungeonMode: "scratch",
    locationRegions: nextRegions,
    activeRegionId: targetId || state.activeRegionId,
    activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
  };
}
