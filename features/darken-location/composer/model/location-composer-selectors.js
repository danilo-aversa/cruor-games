import {
  getSourceAnchorId,
  getStaticContentRegistry,
  sharedLocationRegionToLegacyTemplate,
} from "../../../../shared/content/content.index.js";
import {
  DEFAULT_LOCATION_SLOT_IDS,
  LOCATION_SLOT_SCOPE_MAP,
  LOCATION_SLOT_SCOPE_REGION,
  normalizeLocationSlotScope,
  normalizeSlotAssignments,
  toArray,
} from "./location-composer-state.js";

const CONTENT_REGISTRY = getStaticContentRegistry();
const DARKEN_LOCATION_WORKFLOW_ID = "darken-location";
const LOCATION_COMPONENT_CONTENT_TYPE = "location-component";
const LOCATION_REGION_CONTENT_TYPE = "location-region";
const ANY_SOURCE_LABEL = "Any Source";
const MAX_LOCATION_COMPONENT_CANDIDATES = 16;

function toFilterArray(value) {
  if (value instanceof Set) return Array.from(value);
  if (Array.isArray(value)) return value;
  return value === undefined || value === null || value === "" ? [] : [value];
}

function getFilterValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return (
    value.sourceAnchorId ||
    value.id ||
    value.value ||
    value.slug ||
    value.label ||
    value.name ||
    value.title ||
    ""
  );
}

function normalizeCategoryToken(value) {
  return String(getFilterValue(value) || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategorySelection(values) {
  return [...new Set(toFilterArray(values).map(normalizeCategoryToken).filter(Boolean))];
}

function isAnyCategoryToken(value) {
  return value === "any" || value === "any-source";
}

function matchesCategorySelection(componentValues, selectedValues) {
  const selected = normalizeCategorySelection(selectedValues);
  if (!selected.length || selected.some(isAnyCategoryToken)) return true;

  const available = normalizeCategorySelection(componentValues);
  if (available.some(isAnyCategoryToken)) return true;
  return selected.some((value) => available.includes(value));
}

function normalizeSourceSelection(values = []) {
  return toFilterArray(values)
    .filter((source) => {
      const token = normalizeCategoryToken(source);
      return source !== ANY_SOURCE_LABEL && !isAnyCategoryToken(token);
    })
    .map(getFilterValue)
    .map(getSourceAnchorId)
    .filter(Boolean);
}

function matchesSourceSelection(componentValues, selectedValues) {
  const selected = normalizeSourceSelection(selectedValues);
  if (!selected.length) return true;
  const available = normalizeSourceSelection(componentValues);
  return selected.some((value) => available.includes(value));
}

function filterLocationComponents(components, {
  actualValues,
  expectedValues,
  reason,
  predicate,
}) {
  const included = [];
  const excluded = [];

  components.forEach((component) => {
    if (predicate(component)) {
      included.push(component);
      return;
    }

    excluded.push({
      componentId: component.id,
      expected: expectedValues,
      received: actualValues(component),
      reason,
    });
  });

  return { excluded, included };
}

function createLocationComponentFilterTrace(slotId, state = {}) {
  const sourceAnchors = normalizeSourceSelection(state.sourceAnchors);
  const contexts = normalizeCategorySelection(state.context);
  const intrusions = normalizeCategorySelection(state.intrusion);
  const horrors = normalizeCategorySelection(state.horrors ?? state.horror);
  const registryComponents = CONTENT_REGISTRY.getComponents({
    workflow: DARKEN_LOCATION_WORKFLOW_ID,
    contentType: LOCATION_COMPONENT_CONTENT_TYPE,
    slot: slotId,
  });
  const stages = [{
    componentIds: registryComponents.map((component) => component.id),
    count: registryComponents.length,
    id: "registry",
  }];
  const exclusions = {};

  const contextResult = filterLocationComponents(registryComponents, {
    actualValues: (component) => normalizeCategorySelection(component.contexts),
    expectedValues: contexts,
    reason: "context-mismatch",
    predicate: (component) => matchesCategorySelection(component.contexts, contexts),
  });
  exclusions.context = contextResult.excluded;
  stages.push({
    componentIds: contextResult.included.map((component) => component.id),
    count: contextResult.included.length,
    id: "context",
  });

  const intrusionResult = filterLocationComponents(contextResult.included, {
    actualValues: (component) => normalizeCategorySelection(component.intrusion),
    expectedValues: intrusions,
    reason: "intrusion-mismatch",
    predicate: (component) => matchesCategorySelection(component.intrusion, intrusions),
  });
  exclusions.intrusion = intrusionResult.excluded;
  stages.push({
    componentIds: intrusionResult.included.map((component) => component.id),
    count: intrusionResult.included.length,
    id: "intrusion",
  });

  const sourceResult = filterLocationComponents(intrusionResult.included, {
    actualValues: (component) => normalizeSourceSelection(component.sourceAnchors),
    expectedValues: sourceAnchors,
    reason: "source-mismatch",
    predicate: (component) => matchesSourceSelection(component.sourceAnchors, sourceAnchors),
  });
  exclusions.source = sourceResult.excluded;
  stages.push({
    componentIds: sourceResult.included.map((component) => component.id),
    count: sourceResult.included.length,
    id: "source",
  });

  const horrorResult = filterLocationComponents(sourceResult.included, {
    actualValues: (component) => normalizeCategorySelection(component.horror),
    expectedValues: horrors,
    reason: "horror-mismatch",
    predicate: (component) => matchesCategorySelection(component.horror, horrors),
  });
  exclusions.horror = horrorResult.excluded;
  stages.push({
    componentIds: horrorResult.included.map((component) => component.id),
    count: horrorResult.included.length,
    id: "horror",
  });

  const candidates = horrorResult.included.slice(0, MAX_LOCATION_COMPONENT_CANDIDATES);
  stages.push({
    componentIds: candidates.map((component) => component.id),
    count: candidates.length,
    id: "limit",
  });

  return {
    candidates,
    criteria: {
      contexts,
      horrors,
      intrusions,
      sourceAnchors,
    },
    exclusions,
    slotId,
    stages,
  };
}

export const LOCATION_SLOT_SCOPE_DEFINITIONS = {
  [LOCATION_SLOT_SCOPE_MAP]: {
    id: LOCATION_SLOT_SCOPE_MAP,
    label: "Map",
    description: "Dungeon-wide premise, atmosphere, anomaly, and outcome.",
    slotIds: ["horrorPremise", "sensoryLayer", "visibleAnomaly", "reward"],
    defaultSlotId: "horrorPremise",
  },
  [LOCATION_SLOT_SCOPE_REGION]: {
    id: LOCATION_SLOT_SCOPE_REGION,
    label: "Selected Location",
    description: "Hazards, clues, and twists assigned to the room selected on the map.",
    slotIds: ["hazard", "clue", "encounterTwist"],
    defaultSlotId: "hazard",
  },
};

export function getLocationWorkflow() {
  return CONTENT_REGISTRY.getWorkflow(DARKEN_LOCATION_WORKFLOW_ID) || {
    id: DARKEN_LOCATION_WORKFLOW_ID,
    label: "Darken a Location",
  };
}

export function getLocationSlots() {
  const registrySlots = CONTENT_REGISTRY.slots.filter((slot) =>
    (slot.workflows || []).includes(DARKEN_LOCATION_WORKFLOW_ID),
  );
  const slotById = new Map(registrySlots.map((slot) => [slot.id, slot]));
  const slots = DEFAULT_LOCATION_SLOT_IDS.map((id) =>
    slotById.get(id) || {
      id,
      label: id.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
      max: 1,
      summary: "",
    },
  );

  return slots.map((slot) => ({
    ...slot,
    max: Number.isFinite(slot.max) ? Math.max(1, slot.max) : 1,
    description: slot.description || slot.summary || "",
  }));
}

export function getLocationSlotScopeDefinition(scope) {
  return LOCATION_SLOT_SCOPE_DEFINITIONS[normalizeLocationSlotScope(scope)];
}

export function getLocationSlotsForScope(scope) {
  const definition = getLocationSlotScopeDefinition(scope);
  const slotIds = new Set(definition.slotIds);
  return getLocationSlots().filter((slot) => slotIds.has(slot.id));
}

export function getDefaultSlotIdForScope(scope) {
  const definition = getLocationSlotScopeDefinition(scope);
  return definition.defaultSlotId || getLocationSlotsForScope(scope)[0]?.id || getLocationSlots()[0]?.id || "";
}

export function isSlotInScope(slotId, scope) {
  const definition = getLocationSlotScopeDefinition(scope);
  return definition.slotIds.includes(slotId);
}

export function getSlotScope(slotId) {
  if (LOCATION_SLOT_SCOPE_DEFINITIONS[LOCATION_SLOT_SCOPE_REGION].slotIds.includes(slotId)) {
    return LOCATION_SLOT_SCOPE_REGION;
  }

  return LOCATION_SLOT_SCOPE_MAP;
}

export function getSlotById(slotId) {
  return getLocationSlots().find((slot) => slot.id === slotId) || getLocationSlots()[0];
}

export function getLocationComponents() {
  return CONTENT_REGISTRY.getComponents({
    workflow: DARKEN_LOCATION_WORKFLOW_ID,
    contentType: LOCATION_COMPONENT_CONTENT_TYPE,
  });
}

export function getComponentById(componentId) {
  return CONTENT_REGISTRY.getComponent(componentId);
}

export function getSlotAssignments(state, slotId = "") {
  const assignments = normalizeSlotAssignments(state?.slotAssignments);
  if (slotId) return assignments[slotId] || [];
  return assignments;
}

function getScopedSlotAssignments(state, slotId, scope, regionId = "") {
  const normalizedScope = normalizeLocationSlotScope(scope);
  const targetRegionId = normalizedScope === LOCATION_SLOT_SCOPE_REGION ? regionId || state?.activeRegionId || "" : "";
  return getSlotAssignments(state, slotId).filter((assignment) =>
    normalizedScope === LOCATION_SLOT_SCOPE_REGION
      ? assignment.regionId === targetRegionId
      : !assignment.regionId,
  );
}

export function getSelectedComponents(state) {
  const assignments = normalizeSlotAssignments(state?.slotAssignments);
  const selectedIds = Object.values(assignments)
    .flat()
    .map((assignment) => assignment.componentId)
    .filter(Boolean);

  return selectedIds
    .map((componentId) => getComponentById(componentId))
    .filter(Boolean);
}

export function getAssignedComponentsForSlot(state, slotId) {
  return getSlotAssignments(state, slotId)
    .map((assignment) => {
      const component = getComponentById(assignment.componentId);
      return component ? { ...component, assignment } : null;
    })
    .filter(Boolean);
}

export function getAssignedComponentsForSlotScope(state, slotId, scope, regionId = "") {
  return getScopedSlotAssignments(state, slotId, scope, regionId)
    .map((assignment) => {
      const component = getComponentById(assignment.componentId);
      return component ? { ...component, assignment } : null;
    })
    .filter(Boolean);
}

export function getAssignedComponentsForRegion(state, regionId) {
  const assignments = Object.values(getSlotAssignments(state))
    .flat()
    .filter((assignment) => assignment.regionId === regionId);

  return assignments
    .map((assignment) => {
      const component = getComponentById(assignment.componentId);
      const slot = getSlotById(assignment.slotId);
      return component ? { ...component, assignment, slot } : null;
    })
    .filter(Boolean);
}

export function getComponentAssignment(state, componentId) {
  return Object.values(getSlotAssignments(state))
    .flat()
    .find((assignment) => assignment.componentId === componentId);
}

export function isComponentAssignedToSlot(state, componentId, slotId) {
  return getSlotAssignments(state, slotId).some((assignment) => assignment.componentId === componentId);
}

export function getSlotFilledCount(state, slotId) {
  return getSlotAssignments(state, slotId).length;
}

export function getSlotFilledCountForScope(state, slotId, scope, regionId = "") {
  return getScopedSlotAssignments(state, slotId, scope, regionId).length;
}

export function getSlotCapacityLabel(state, slot) {
  const filledCount = getSlotFilledCount(state, slot.id);
  return `${filledCount}/${slot.max || 1}`;
}

export function getSlotStatus(state, slot) {
  const filledCount = getSlotFilledCount(state, slot.id);
  if (filledCount <= 0) return "empty";
  if (filledCount >= (slot.max || 1)) return "full";
  return "partial";
}

export function getSlotStatusForScope(state, slot, scope, regionId = "") {
  const filledCount = getSlotFilledCountForScope(state, slot.id, scope, regionId);
  if (filledCount <= 0) return "empty";
  if (filledCount >= (slot.max || 1)) return "full";
  return "partial";
}

export function getComponentsForSlot(slotId, state) {
  return createLocationComponentFilterTrace(slotId, state).candidates;
}

export function traceLocationComponentsForSlot(slotId, state) {
  return createLocationComponentFilterTrace(slotId, state);
}

export function getRegionTemplatesForState(state) {
  const sourceAnchors = state?.sourceAnchors;
  const contexts = state?.context;
  const horrors = state?.horrors ?? state?.horror;

  return CONTENT_REGISTRY.getComponents({
    workflow: DARKEN_LOCATION_WORKFLOW_ID,
    contentType: LOCATION_REGION_CONTENT_TYPE,
  })
    .filter((region) => {
      const matchesContext = matchesCategorySelection(region.contexts, contexts);
      const matchesSource = matchesSourceSelection(region.sourceAnchors, sourceAnchors);
      const matchesHorror = matchesCategorySelection(region.horror, horrors);
      return matchesContext && matchesSource && matchesHorror;
    })
    .map(sharedLocationRegionToLegacyTemplate)
    .slice(0, 8);
}

export function describeSourceAnchor(anchor) {
  const sourceAnchorId = normalizeSourceSelection([anchor])[0] || "";
  const sourceAnchor = CONTENT_REGISTRY.getSourceAnchor(sourceAnchorId);
  const inspiration = CONTENT_REGISTRY.getLinkedInspirations(sourceAnchorId)[0];
  return inspiration?.inspiration?.logic || inspiration?.narrative || sourceAnchor?.summary || "";
}

export function getPrimaryPremise(state) {
  return (
    getAssignedComponentsForSlotScope(state, "horrorPremise", LOCATION_SLOT_SCOPE_MAP)[0] ||
    getAssignedComponentsForSlot(state, "horrorPremise")[0] ||
    null
  );
}

export function getComposerDigest(state) {
  const slots = getLocationSlots();
  const assignedBySlot = slots.map((slot) => ({
    slot,
    components: getAssignedComponentsForSlot(state, slot.id),
  }));
  const activeRegion = state.locationRegions?.find((region) => region.id === state.activeRegionId);
  const premise = getPrimaryPremise(state);

  return {
    activeRegion,
    premise,
    assignedBySlot,
    filledSlots: assignedBySlot.filter((entry) => entry.components.length > 0).length,
    totalSlots: slots.length,
  };
}

export function getRegionById(state, regionId) {
  return (state?.locationRegions || []).find((region) => region.id === regionId);
}

export function getRegionDetailRows(region) {
  if (!region) return [];

  return [
    { label: "Feature", value: region.feature },
    { label: "Interaction", value: region.interaction || region.interact },
    { label: "Danger", value: region.danger },
    { label: "Secret", value: region.secret },
    { label: "Reward", value: region.reward },
    {
      label: "Read-Aloud",
      value:
        typeof region.readAloud === "string"
          ? region.readAloud
          : region.readAloud?.compact || region.readAloud?.extended,
    },
  ].filter((row) => row.value);
}

export function getRegionStageSummary(state, regionId) {
  const region = getRegionById(state, regionId);
  if (!region) return null;

  const assigned = getAssignedComponentsForRegion(state, regionId);
  const detailRows = getRegionDetailRows(region);
  const firstDetail = detailRows[0]?.value || region.role || "Location Region";

  return {
    region,
    assigned,
    assignedCount: assigned.length,
    shortRole: region.role || region.shape || "Location Region",
    firstDetail,
    hasDanger: Boolean(region.danger),
    hasSecret: Boolean(region.secret),
    hasReward: Boolean(region.reward),
  };
}

export function getRegionAttachmentSummary(state) {
  return (state?.locationRegions || []).map((region) => getRegionStageSummary(state, region.id)).filter(Boolean);
}
