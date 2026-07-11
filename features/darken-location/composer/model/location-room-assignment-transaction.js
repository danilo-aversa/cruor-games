import {
  DARK_PLACES_ROOM_ENGINE_CAPABILITIES,
  evaluateDarkPlacesRoomCandidate,
  resolveDarkPlacesRoomConstraints,
} from "../../room-constraint-evaluation.js";
import {
  assignComponentToSlot,
  LOCATION_SLOT_SCOPE_REGION,
  normalizeLocationSlotScope,
  normalizeSlotAssignments,
  removeComponentFromSlot,
} from "./location-composer-state.js";
import {
  getComponentById,
  getSlotById,
} from "./location-composer-selectors.js";
import { createLocationRoomConstraintStateEntry } from "./location-room-constraint-state.js";

export const LOCATION_COMPONENT_TRANSACTION_OPERATIONS = Object.freeze({
  ASSIGN: "assign",
  REMOVE: "remove",
  REPLACE: "replace",
});

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeOperation(value = "") {
  return Object.values(LOCATION_COMPONENT_TRANSACTION_OPERATIONS).includes(
    value,
  )
    ? value
    : LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN;
}

function normalizeTarget(state = {}, target = {}) {
  const scope = normalizeLocationSlotScope(target?.scope);
  return {
    scope,
    regionId:
      scope === LOCATION_SLOT_SCOPE_REGION
        ? String(target?.regionId || state.activeRegionId || "")
        : "",
  };
}

function createComponentMap(componentCatalog = [], candidateComponent = null) {
  return new Map(
    [...componentCatalog, candidateComponent]
      .filter(Boolean)
      .map((component) => [String(component.id || ""), component])
      .filter(([componentId]) => componentId),
  );
}

function resolveComponent(componentId, componentMap, componentLookup) {
  return (
    componentMap.get(componentId) ||
    componentLookup?.(componentId) ||
    getComponentById(componentId) ||
    null
  );
}

function getAssignedComponentsForRegion({
  state,
  regionId,
  componentCatalog = [],
  candidateComponent = null,
  componentLookup = null,
}) {
  const componentMap = createComponentMap(componentCatalog, candidateComponent);
  const assignments = Object.values(
    normalizeSlotAssignments(state?.slotAssignments),
  )
    .flat()
    .filter((assignment) => assignment.regionId === regionId);

  return assignments
    .map((assignment) => {
      const component = resolveComponent(
        assignment.componentId,
        componentMap,
        componentLookup,
      );
      if (!component) return null;
      return {
        ...component,
        assignment,
        slot: getSlotById(assignment.slotId),
      };
    })
    .filter(Boolean);
}

function getTargetRegion(state = {}, regionId = "") {
  return (
    (Array.isArray(state.locationRegions) ? state.locationRegions : []).find(
      (region) => region.id === regionId,
    ) || null
  );
}

function removeReplacementComponents(state, componentIds = [], target) {
  return unique(componentIds).reduce(
    (next, componentId) =>
      removeComponentFromSlot(next, componentId, "", target),
    state,
  );
}

function commitRoomConstraintState({
  state,
  region,
  assignedComponents,
  manualOverrides,
  engineCapabilities,
}) {
  const resolution = resolveDarkPlacesRoomConstraints({
    activeRegion: region,
    assignedComponents,
    manualOverrides,
    engineCapabilities,
  });
  const entry = createLocationRoomConstraintStateEntry({
    region,
    slotAssignments: state.slotAssignments,
    manualOverrides,
    resolution,
  });

  return {
    state: {
      ...state,
      roomConstraintStateByRegion: {
        ...(state.roomConstraintStateByRegion || {}),
        ...(entry ? { [region.id]: entry } : {}),
      },
    },
    resolution,
  };
}

function createRejectedTransaction(state, reason, evaluation = null) {
  return {
    ok: false,
    changed: false,
    state,
    reason: reason || "The room assignment could not be applied.",
    evaluation,
    resolution: evaluation?.currentResolution || null,
    removedComponentIds: [],
  };
}

export function applyLocationComponentAssignmentTransaction({
  state,
  operation = LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
  component = null,
  componentId = "",
  componentCatalog = [],
  componentLookup = null,
  slot = null,
  target = {},
  replacementComponentIds = [],
  manualOverrides = null,
  engineCapabilities = DARK_PLACES_ROOM_ENGINE_CAPABILITIES,
} = {}) {
  if (!state || typeof state !== "object") {
    return createRejectedTransaction(state, "Composer state is unavailable.");
  }

  const normalizedOperation = normalizeOperation(operation);
  const normalizedTarget = normalizeTarget(state, target);
  const removedComponentIds = unique(
    normalizedOperation === LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REPLACE
      ? replacementComponentIds
      : normalizedOperation === LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REMOVE
        ? [componentId || component?.id]
        : [],
  );

  if (
    normalizedOperation !== LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REMOVE &&
    (!component?.id || !slot?.id)
  ) {
    return createRejectedTransaction(
      state,
      "A component and destination slot are required.",
    );
  }

  if (
    normalizedOperation === LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REMOVE &&
    (!removedComponentIds.length || !slot?.id)
  ) {
    return createRejectedTransaction(
      state,
      "A component and source slot are required.",
    );
  }

  let workingState = state;
  if (removedComponentIds.length) {
    workingState = removeReplacementComponents(
      workingState,
      removedComponentIds,
      normalizedTarget,
    );
  }

  if (
    normalizedOperation !== LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REMOVE
  ) {
    if (normalizedTarget.scope === LOCATION_SLOT_SCOPE_REGION) {
      const region = getTargetRegion(workingState, normalizedTarget.regionId);
      if (!region) {
        return createRejectedTransaction(
          state,
          "The selected room is no longer available.",
        );
      }
      const assignedComponents = getAssignedComponentsForRegion({
        state: workingState,
        regionId: normalizedTarget.regionId,
        componentCatalog,
        candidateComponent: component,
        componentLookup,
      });
      const evaluation = evaluateDarkPlacesRoomCandidate({
        activeRegion: region,
        assignedComponents,
        candidateComponent: component,
        manualOverrides,
        engineCapabilities,
      });

      if (evaluation.blocking || evaluation.replaceable) {
        return createRejectedTransaction(
          state,
          evaluation.reason ||
            (evaluation.replaceable
              ? "The required replacement set is incomplete."
              : "This component is incompatible with the selected room."),
          evaluation,
        );
      }
    }

    workingState = assignComponentToSlot(
      workingState,
      component,
      slot,
      normalizedTarget,
    );
  }

  if (normalizedTarget.scope !== LOCATION_SLOT_SCOPE_REGION) {
    return {
      ok: true,
      changed: workingState !== state,
      state: workingState,
      reason: "",
      evaluation: null,
      resolution: null,
      removedComponentIds,
    };
  }

  const region = getTargetRegion(workingState, normalizedTarget.regionId);
  if (!region) {
    return createRejectedTransaction(
      state,
      "The selected room is no longer available.",
    );
  }
  const assignedComponents = getAssignedComponentsForRegion({
    state: workingState,
    regionId: normalizedTarget.regionId,
    componentCatalog,
    candidateComponent: component,
    componentLookup,
  });
  const committed = commitRoomConstraintState({
    state: workingState,
    region,
    assignedComponents,
    manualOverrides,
    engineCapabilities,
  });

  return {
    ok: true,
    changed: committed.state !== state,
    state: committed.state,
    reason: "",
    evaluation: null,
    resolution: committed.resolution,
    removedComponentIds,
  };
}

export function recomputeLocationRoomConstraintState({
  state,
  regionIds = null,
  componentCatalog = [],
  componentLookup = null,
  manualOverrides = null,
  engineCapabilities = DARK_PLACES_ROOM_ENGINE_CAPABILITIES,
} = {}) {
  if (!state || typeof state !== "object") return state;
  const requestedIds = Array.isArray(regionIds)
    ? new Set(regionIds.map((id) => String(id || "")))
    : null;
  const regions = (
    Array.isArray(state.locationRegions) ? state.locationRegions : []
  ).filter((region) => !requestedIds || requestedIds.has(String(region.id)));

  return regions.reduce((nextState, region) => {
    const assignedComponents = getAssignedComponentsForRegion({
      state: nextState,
      regionId: region.id,
      componentCatalog,
      componentLookup,
    });
    return commitRoomConstraintState({
      state: nextState,
      region,
      assignedComponents,
      manualOverrides,
      engineCapabilities,
    }).state;
  }, state);
}
