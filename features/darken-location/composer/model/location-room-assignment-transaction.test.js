import { describe, expect, it } from "vitest";
import { createMapRequestFromDarkenLocationState } from "../../darken-location.map-request.js";
import {
  createDraftFingerprint,
  restoreLocationDraftState,
} from "./location-composer-draft.js";
import {
  createInitialLocationComposerState,
  createLocationComposerSnapshot,
  LOCATION_SLOT_SCOPE_REGION,
} from "./location-composer-state.js";
import {
  applyLocationComponentAssignmentTransaction,
  LOCATION_COMPONENT_TRANSACTION_OPERATIONS,
} from "./location-room-assignment-transaction.js";
import {
  createLocationAssignmentHistorySnapshot,
  restoreLocationAssignmentHistorySnapshot,
} from "./location-room-constraint-state.js";

const HAZARD_SLOT = { id: "hazard", label: "Hazard", max: 3 };
const CLUE_SLOT = { id: "clue", label: "Clue", max: 3 };

function component(id, roomDesign = null, extra = {}) {
  return {
    id,
    title: id,
    slots: ["hazard", "clue"],
    ...(roomDesign ? { roomDesign } : {}),
    ...extra,
  };
}

function createState() {
  return {
    ...createInitialLocationComposerState([
      {
        id: "room-1",
        templateId: "room-1",
        name: "Test Room",
        role: "clue",
        roomType: "crypt",
        shape: "rect",
        preferredShape: "rect",
        size: "Medium",
        connectors: 2,
      },
    ]),
    activeSlot: "hazard",
    activeSlotScope: LOCATION_SLOT_SCOPE_REGION,
    activeRegionId: "room-1",
  };
}

function apply(state, options) {
  return applyLocationComponentAssignmentTransaction({
    state,
    target: { scope: LOCATION_SLOT_SCOPE_REGION, regionId: "room-1" },
    ...options,
  });
}

describe("location room assignment transactions", () => {
  it("commits assignment and effective design as one state update", () => {
    const roundLarge = component("round-large", {
      strength: "required",
      shape: { required: "circle" },
      size: { minScale: "Large", maxScale: "Large" },
    });
    const initial = createState();
    const result = apply(initial, {
      component: roundLarge,
      componentCatalog: [roundLarge],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: HAZARD_SLOT,
    });

    expect(result.ok).toBe(true);
    expect(result.state).not.toBe(initial);
    expect(result.state.slotAssignments.hazard).toHaveLength(1);
    expect(
      result.state.roomConstraintStateByRegion["room-1"].effectiveRoomDesign,
    ).toMatchObject({
      shape: { kind: "circle" },
      size: { scale: "Large" },
    });

    const snapshot = createLocationComposerSnapshot(result.state, [roundLarge]);
    expect(snapshot.locationRegions[0]).toMatchObject({
      effectiveRoomDesign: {
        shape: { kind: "circle" },
        size: { scale: "Large" },
      },
      roomConstraintResolution: { status: "transforms-room" },
    });

    const mapRequest = createMapRequestFromDarkenLocationState(snapshot);
    expect(mapRequest.requiredRegions[0].effectiveRoomDesign).toMatchObject({
      shape: { kind: "circle" },
      size: { scale: "Large" },
    });
  });

  it("rejects an incompatible assignment without partially mutating state", () => {
    const round = component("round", {
      strength: "required",
      shape: { required: "circle" },
    });
    const cross = component("cross", {
      strength: "required",
      shape: { required: "cross" },
    });
    const assigned = apply(createState(), {
      component: round,
      componentCatalog: [round, cross],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: HAZARD_SLOT,
    }).state;
    const blocked = apply(assigned, {
      component: cross,
      componentCatalog: [round, cross],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: HAZARD_SLOT,
    });

    expect(blocked.ok).toBe(false);
    expect(blocked.state).toBe(assigned);
    expect(blocked.reason).toContain("Required room shapes conflict");
    expect(
      blocked.state.slotAssignments.hazard.map((item) => item.componentId),
    ).toEqual(["round"]);
  });

  it("applies replacement removal, assignment, and design recalculation atomically", () => {
    const round = component(
      "round",
      {
        strength: "required",
        shape: { required: "circle" },
      },
      {
        roomCompatibility: {
          exclusiveGroups: ["room-focus"],
          conflictPolicy: "block",
        },
      },
    );
    const cross = component(
      "cross",
      {
        strength: "required",
        shape: { required: "cross" },
      },
      {
        roomCompatibility: {
          exclusiveGroups: ["room-focus"],
          conflictPolicy: "replace",
        },
      },
    );
    const assigned = apply(createState(), {
      component: round,
      componentCatalog: [round, cross],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: CLUE_SLOT,
    }).state;
    const replaced = apply(assigned, {
      component: cross,
      componentCatalog: [round, cross],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REPLACE,
      replacementComponentIds: ["round"],
      slot: HAZARD_SLOT,
    });

    expect(replaced.ok).toBe(true);
    expect(replaced.removedComponentIds).toEqual(["round"]);
    expect(replaced.state.slotAssignments.clue).toEqual([]);
    expect(
      replaced.state.slotAssignments.hazard.map((item) => item.componentId),
    ).toEqual(["cross"]);
    expect(
      replaced.state.roomConstraintStateByRegion["room-1"].effectiveRoomDesign,
    ).toMatchObject({ shape: { kind: "cross" } });
  });

  it("recalculates from the residual component set after removal", () => {
    const round = component("round", {
      strength: "required",
      shape: { required: "circle" },
    });
    const large = component("large", {
      strength: "required",
      size: { minScale: "Large", maxScale: "Large" },
    });
    let current = apply(createState(), {
      component: round,
      componentCatalog: [round, large],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: HAZARD_SLOT,
    }).state;
    current = apply(current, {
      component: large,
      componentCatalog: [round, large],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: CLUE_SLOT,
    }).state;

    const removed = apply(current, {
      componentCatalog: [round, large],
      componentId: "round",
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.REMOVE,
      slot: HAZARD_SLOT,
    });

    expect(removed.ok).toBe(true);
    expect(removed.state.slotAssignments.hazard).toEqual([]);
    expect(
      removed.state.roomConstraintStateByRegion["room-1"].effectiveRoomDesign,
    ).toMatchObject({
      shape: { kind: "rect" },
      size: { scale: "Large" },
    });
  });

  it("restores assignment and derived metadata together for undo and redo", () => {
    const round = component("round", {
      strength: "required",
      shape: { required: "circle" },
    });
    const large = component("large", {
      strength: "required",
      size: { minScale: "Large", maxScale: "Large" },
    });
    const first = apply(createState(), {
      component: round,
      componentCatalog: [round, large],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: HAZARD_SLOT,
    }).state;
    const firstSnapshot = createLocationAssignmentHistorySnapshot(first);
    const second = apply(first, {
      component: large,
      componentCatalog: [round, large],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: CLUE_SLOT,
    }).state;
    const secondSnapshot = createLocationAssignmentHistorySnapshot(second);

    const undone = restoreLocationAssignmentHistorySnapshot(
      second,
      firstSnapshot,
    );
    expect(undone.slotAssignments.clue || []).toEqual([]);
    expect(
      undone.roomConstraintStateByRegion["room-1"].effectiveRoomDesign.size
        .scale,
    ).toBe("Medium");

    const redone = restoreLocationAssignmentHistorySnapshot(
      undone,
      secondSnapshot,
    );
    expect(redone.slotAssignments.clue.map((item) => item.componentId)).toEqual(
      ["large"],
    );
    expect(
      redone.roomConstraintStateByRegion["room-1"].effectiveRoomDesign.size
        .scale,
    ).toBe("Large");
  });

  it("round-trips effective design through draft recovery without stale fields", () => {
    const round = component("round", {
      strength: "required",
      shape: { required: "circle" },
    });
    const committed = apply(createState(), {
      component: round,
      componentCatalog: [round],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: HAZARD_SLOT,
    }).state;
    const serializedState = JSON.parse(createDraftFingerprint(committed));
    const restored = restoreLocationDraftState(
      { version: 1, state: serializedState },
      createState(),
    );
    const snapshot = createLocationComposerSnapshot(restored, [round]);

    expect(restored.roomConstraintStateByRegion).toEqual(
      committed.roomConstraintStateByRegion,
    );
    expect(snapshot.locationRegions[0].effectiveRoomDesign).toMatchObject({
      shape: { kind: "circle" },
    });
  });
  it("drops stale derived metadata from snapshots and draft payloads", () => {
    const round = component("round", {
      strength: "required",
      shape: { required: "circle" },
    });
    const committed = apply(createState(), {
      component: round,
      componentCatalog: [round],
      operation: LOCATION_COMPONENT_TRANSACTION_OPERATIONS.ASSIGN,
      slot: HAZARD_SLOT,
    }).state;
    const staleState = {
      ...committed,
      slotAssignments: { hazard: [] },
      selectedComponentIds: new Set(),
    };
    const snapshot = createLocationComposerSnapshot(staleState, []);
    const serializedState = JSON.parse(createDraftFingerprint(staleState));

    expect(snapshot.roomConstraintStateByRegion).toEqual({});
    expect(snapshot.locationRegions[0].effectiveRoomDesign).toBeUndefined();
    expect(serializedState.roomConstraintStateByRegion).toEqual({});
  });
});
