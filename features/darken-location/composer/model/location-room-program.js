import { getAssignedComponentsForRegion, getLocationSlotsForScope } from "./location-composer-selectors.js";
import { LOCATION_SLOT_SCOPE_REGION, toArray } from "./location-composer-state.js";
import { getGeneratedRoomForRegionIndex } from "./location-composer-map-preview.js";
import { getRegionPreviewMarkers } from "./location-composer-output.js";
import { REGION_READY_SLOT_IDS } from "./location-workflow.constants.js";

export { REGION_READY_SLOT_IDS } from "./location-workflow.constants.js";

function cleanLabel(value, fallback = "—") {
  const text = String(value || "").trim();
  return text || fallback;
}

function titleCase(value) {
  return cleanLabel(value, "Room")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`);
}

function getRoutePressure(complexity = "standard") {
  if (complexity === "simple") return "Clean Route";
  if (complexity === "complex") return "Branching Pressure";
  return "Standard Pressure";
}

function getPrimaryUse(context = "", horror = "") {
  const normalizedContext = String(context || "").toLowerCase();
  const normalizedHorror = String(horror || "").toLowerCase();
  if (normalizedContext.includes("chapel") || normalizedHorror.includes("religious")) return "Ritual reveal";
  if (normalizedContext.includes("noble")) return "Social exploration";
  if (normalizedContext.includes("cave") || normalizedContext.includes("mine")) return "Route pressure";
  if (normalizedHorror.includes("body") || normalizedHorror.includes("disease")) return "Contamination site";
  return "Exploration insert";
}

function getComponentMapInfluence(component = {}) {
  return component?.mapInfluence || component?.location?.mapInfluence || component?.locationRegion?.mapInfluence || component?.map?.mapInfluence || null;
}

function getRoomArchetypeSummary(region = {}, generatedRoom = null, assigned = []) {
  const resolution = generatedRoom?.roomArchetypeResolution || {};
  const resolvedId =
    resolution.resolvedRoomArchetype ||
    generatedRoom?.roomArchetype ||
    region.roomArchetype ||
    region.locationRegion?.roomArchetype ||
    region.map?.roomArchetype ||
    "";
  const label =
    resolution.resolvedRoomArchetypeLabel ||
    generatedRoom?.roomArchetypeLabel ||
    (resolvedId ? titleCase(resolvedId) : "Auto");
  const source =
    resolution.resolvedRoomArchetypeSource ||
    generatedRoom?.roomArchetypeSource ||
    region.roomArchetypeSource ||
    "inferred";
  const influenceCount = assigned.filter((component) => Boolean(getComponentMapInfluence(component))).length;

  return {
    id: resolvedId,
    label,
    source,
    influenceCount,
    hasMapInfluence: influenceCount > 0 || source === "map-influence",
    forced: Boolean(resolution.hasForce),
  };
}

export function getLocationPlaceFrame(state = {}, mapRequest = null) {
  const sourceAnchors = toArray(state.sourceAnchors).filter((source) => source !== "Any Source");
  const horrors = toArray(state.horrors);
  const regions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
  const roomCount = mapRequest?.requiredRegions?.length || regions.length || 0;
  const source = sourceAnchors[0] || "Any Source";
  const horror = horrors[0] || state.horror || "Horror";
  const context = state.context || mapRequest?.context || "Location";
  const scale = titleCase(state.dungeonScale || "medium");
  const complexity = titleCase(state.dungeonComplexity || "standard");

  return {
    title: cleanLabel(state.title, "Cursed Location Build"),
    source,
    context,
    horror,
    scale,
    complexity,
    routePressure: getRoutePressure(state.dungeonComplexity),
    roomCount,
    primaryUse: getPrimaryUse(context, horror),
    mapType: mapRequest?.mapType || context,
    mode: state.dungeonMode === "scratch" ? "Room Program" : "Place Frame",
    summary: `${source} · ${context} · ${roomCount || 0} room${roomCount === 1 ? "" : "s"} · ${horror}`,
  };
}

export function getRoomProgramEntryStatus(state = {}, regionId = "") {
  const assigned = getAssignedComponentsForRegion(state, regionId);
  const assignedSlotIds = new Set(assigned.map((component) => component.assignment?.slotId).filter(Boolean));
  const mapInfluenceComponents = assigned.filter((component) => Boolean(getComponentMapInfluence(component)));
  const completedSlots = REGION_READY_SLOT_IDS.filter((slotId) => assignedSlotIds.has(slotId));
  const missingSlots = REGION_READY_SLOT_IDS.filter((slotId) => !assignedSlotIds.has(slotId));
  const hasAny = assigned.length > 0;
  const complete = completedSlots.length >= REGION_READY_SLOT_IDS.length;

  return {
    assigned,
    assignedSlotIds,
    completedSlots,
    missingSlots,
    mapInfluenceComponents,
    mapInfluenceCount: mapInfluenceComponents.length,
    complete,
    status: complete ? "ready" : hasAny ? "partial" : "empty",
    label: complete ? "Ready" : hasAny ? "Partial" : "Empty",
  };
}

export function getRoomProgramEntries(state = {}, generatedMapPreview = null) {
  const regions = Array.isArray(state.locationRegions) ? state.locationRegions : [];

  return regions.map((region, index) => {
    const generatedRoom = getGeneratedRoomForRegionIndex(generatedMapPreview, region.id, index);
    const status = getRoomProgramEntryStatus(state, region.id);
    const markers = getRegionPreviewMarkers(state, region.id);
    const roomNumber = generatedRoom?.number || index + 1;
    const role = region.role || generatedRoom?.graphRole || generatedRoom?.role || "room";
    const roomType = region.roomType || region.shape || region.preferredShape || generatedRoom?.shape || "room";
    const roomArchetype = getRoomArchetypeSummary(region, generatedRoom, status.assigned);

    return {
      id: region.id,
      region,
      generatedRoom,
      index,
      number: roomNumber,
      numberLabel: String(roomNumber).padStart(2, "0"),
      name: cleanLabel(region.name, `Room ${roomNumber}`),
      role,
      roleLabel: titleCase(role),
      roomType,
      roomTypeLabel: titleCase(roomType),
      roomArchetype: roomArchetype.id,
      roomArchetypeLabel: roomArchetype.label,
      roomArchetypeSource: roomArchetype.source,
      roomArchetypeHasMapInfluence: roomArchetype.hasMapInfluence,
      roomArchetypeForced: roomArchetype.forced,
      size: cleanLabel(region.size, "Medium"),
      level: Number.isFinite(Number(region.level)) ? Number(region.level) : 0,
      markers,
      ...status,
      mapLabel: generatedRoom ? `Map Room ${roomNumber}` : `Program Room ${roomNumber}`,
    };
  });
}

export function getSelectedRoomProgramEntry(state = {}, generatedMapPreview = null) {
  const activeRegionId = String(state.activeRegionId || "").trim();
  if (!activeRegionId) return null;

  const entries = getRoomProgramEntries(state, generatedMapPreview);
  return entries.find((entry) => entry.id === activeRegionId) || null;
}

export function getRoomProgramMetrics(state = {}, generatedMapPreview = null) {
  const entries = getRoomProgramEntries(state, generatedMapPreview);
  const readyCount = entries.filter((entry) => entry.status === "ready").length;
  const partialCount = entries.filter((entry) => entry.status === "partial").length;
  const emptyCount = entries.filter((entry) => entry.status === "empty").length;
  const generatedCount = generatedMapPreview?.regions?.length || 0;

  return {
    entries,
    total: entries.length,
    readyCount,
    partialCount,
    emptyCount,
    generatedCount,
    progress: entries.length ? readyCount / entries.length : 0,
    label: `${readyCount}/${entries.length || 0} ready`,
  };
}

export function getRoomSlotProgramRows(state = {}, regionId = "") {
  const slots = getLocationSlotsForScope(LOCATION_SLOT_SCOPE_REGION);
  const status = getRoomProgramEntryStatus(state, regionId);
  const nextMissingSlotId = REGION_READY_SLOT_IDS.find((slotId) => !status.assignedSlotIds.has(slotId)) || "";

  return slots.map((slot) => {
    const components = status.assigned.filter((component) => component.assignment?.slotId === slot.id);
    const filled = status.assignedSlotIds.has(slot.id);
    const required = REGION_READY_SLOT_IDS.includes(slot.id);
    const missing = required && !filled;

    return {
      slot,
      filled,
      required,
      missing,
      suggested: missing && slot.id === nextMissingSlotId,
      statusLabel: filled ? "Filled" : required ? "Missing" : "Optional",
      components,
    };
  });
}

export function getNextMissingRoomSlot(state = {}, regionId = "") {
  return getRoomSlotProgramRows(state, regionId).find((row) => row.missing) || null;
}

export function getRoomWorkProgress(state = {}, regionId = "") {
  const rows = getRoomSlotProgramRows(state, regionId).filter((row) => row.required);
  const completed = rows.filter((row) => row.filled).length;
  const total = rows.length;

  return {
    completed,
    total,
    progress: total ? completed / total : 0,
    label: `${completed}/${total} ready`,
  };
}
