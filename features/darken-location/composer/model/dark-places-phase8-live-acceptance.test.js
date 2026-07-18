import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SEMANTIC_MIGRATION_MODULES,
  serializeCanonicalSemanticContent,
} from "../../../../shared/content/content.index.js";
import {
  assignComponentToSlot,
  removeComponentFromSlot,
} from "./location-composer-state.js";
import {
  getComponentsForSlot,
  getLocationSlots,
  getSelectedComponents,
  getSlotScope,
  traceLocationComponentsForSlot,
} from "./location-composer-selectors.js";
import {
  createDarkPlacesComposerSemanticPreparation,
  createDarkPlacesComposerSemanticPreviewMemoizer,
} from "./location-composer-semantic-preview.js";

const STRUCTURAL_DOCUMENT = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary/location-document-v1.json",
    ),
    "utf8",
  ),
);

const MODULES_BY_ID = new Map(
  SEMANTIC_MIGRATION_MODULES.map((module) => [module.id, module]),
);

function createState(moduleId = "sedlec-ossuary", overrides = {}) {
  const module = MODULES_BY_ID.get(moduleId);
  return {
    title: module?.title || "Dark Places QA",
    context: "Any",
    horrors: new Set(["Any"]),
    horror: "Any",
    sourceAnchors: new Set([module?.sourceAnchor?.id || moduleId]),
    intrusion: "Any",
    seed: `phase8-live-${moduleId}`,
    dungeonThemeId: moduleId,
    selectedComponentIds: new Set(),
    slotAssignments: {},
    lockedSlots: new Set(),
    mapManualOverrides: null,
    ...overrides,
  };
}

function createMapRequest(state, overrides = {}) {
  return {
    source: "darken-location",
    seed: state.seed,
    title: state.title,
    context: state.context,
    mapType: "Crypt",
    requiredRegions: STRUCTURAL_DOCUMENT.rooms.map((room) => ({
      id: room.id,
      sourceRegionId: room.sourceRegionId || room.id,
      name: room.name,
      role: room.role,
      level: room.level,
      shape: room.shape,
    })),
    connections: STRUCTURAL_DOCUMENT.map.connections.map((connection) => ({
      id: connection.id,
      from: connection.fromRoomId,
      to: connection.toRoomId,
      kind: connection.kind,
      secret: connection.secret,
      locked: connection.locked,
    })),
    metadata: {},
    ...overrides,
  };
}

function createPreparation(state, overrides = {}) {
  return createDarkPlacesComposerSemanticPreparation({
    state,
    digest: { filledSlots: 0, totalSlots: 7 },
    mapRequest: createMapRequest(state),
    generatedMapPreview: null,
    ...overrides,
  });
}

describe("Dark Places Phase 8 live acceptance", () => {
  it.each(SEMANTIC_MIGRATION_MODULES.map((module) => [module.id, module]))(
    "compiles %s through the live Composer into deterministic v2 output",
    (moduleId, module) => {
      const preparation = createPreparation(createState(moduleId));
      const first = createDarkPlacesComposerSemanticPreviewMemoizer()(
        preparation,
      );
      const second = createDarkPlacesComposerSemanticPreviewMemoizer()(
        preparation,
      );

      expect(first.valid).toBe(true);
      expect(first.diagnostics).toEqual([]);
      expect(first.baseline.module.id).toBe(moduleId);
      expect(first.baseline.components).toHaveLength(module.components.length);
      expect(first.document.schemaVersion).toBe("cruor-location-document-v2");
      expect(first.document.rooms).toHaveLength(STRUCTURAL_DOCUMENT.rooms.length);
      expect(first.mapRequest.source).toBe("semantic-map-intent");
      expect(serializeCanonicalSemanticContent(first.document)).toBe(
        serializeCanonicalSemanticContent(second.document),
      );
    },
  );

  it("invalidates semantic work for Inspiration, seed, context, and room changes while preserving manual map edits", () => {
    const baseState = createState();
    const base = createPreparation(baseState);
    const inspiration = createPreparation(createState("decomposition"));
    const seed = createPreparation(
      createState("sedlec-ossuary", { seed: "phase8-changed-seed" }),
    );
    const context = createPreparation(
      createState("sedlec-ossuary", { context: "Catacombs" }),
    );
    const roomRequest = createMapRequest(baseState);
    roomRequest.requiredRegions[0] = {
      ...roomRequest.requiredRegions[0],
      role: "Finale",
      shape: "circular",
    };
    const room = createPreparation(baseState, { mapRequest: roomRequest });
    const manualOverrides = {
      roomPositions: { "location-region-1": { x: 41, y: 17 } },
      roomLabels: { "location-region-1": "Hand-set threshold" },
    };
    const manual = createPreparation({
      ...baseState,
      mapManualOverrides: manualOverrides,
    });

    expect(inspiration.moduleReference.moduleId).toBe("decomposition");
    expect(
      createDarkPlacesComposerSemanticPreviewMemoizer()(inspiration).valid,
    ).toBe(true);
    [inspiration, seed, context, room].forEach((changed) => {
      expect(changed.compilerFingerprint).not.toBe(base.compilerFingerprint);
    });
    expect(manual.compilerFingerprint).toBe(base.compilerFingerprint);
    expect(manual.input.mapState.manualOverrides).toEqual(manualOverrides);
  });

  it("applies, locks, changes, clears, and removes all seven granular slot assignments", () => {
    const slots = getLocationSlots();
    const regionId = STRUCTURAL_DOCUMENT.rooms[0].id;
    let assignedState = createState();
    const assignments = [];

    slots.forEach((slot) => {
      const component = getComponentsForSlot(slot.id, assignedState)[0];
      expect(component, `Missing Phase 8 candidate for ${slot.id}`).toBeTruthy();
      const scope = getSlotScope(slot.id);
      assignedState = assignComponentToSlot(
        assignedState,
        component,
        slot,
        scope === "region" ? { scope, regionId } : { scope },
      );
      assignments.push({ component, scope, slot });
    });
    assignedState = {
      ...assignedState,
      lockedSlots: new Set(["visibleAnomaly"]),
    };

    const baseline = createPreparation(createState());
    const assigned = createPreparation(assignedState, {
      selectedComponents: getSelectedComponents(assignedState),
    });
    const getPreview = createDarkPlacesComposerSemanticPreviewMemoizer();
    const assignedPreview = getPreview(assigned);

    expect(assigned.compilerFingerprint).toBe(baseline.compilerFingerprint);
    expect(assigned.hybridOverrideFingerprint).not.toBe(
      baseline.hybridOverrideFingerprint,
    );
    expect(assignedPreview.valid).toBe(true);
    expect(assignedPreview.runtimeContent.resolvedGranularSelection).toHaveLength(7);
    expect(assignedPreview.overrides.operations).toHaveLength(7);
    expect(
      assignedPreview.runtimeContent.resolvedGranularSelection.filter(
        ({ selection }) => selection.scope === "map",
      ),
    ).toHaveLength(4);
    expect(
      assignedPreview.runtimeContent.resolvedGranularSelection.filter(
        ({ selection }) => selection.scope === "region",
      ),
    ).toHaveLength(3);
    expect(
      assignedPreview.runtimeContent.hybridOverridePlan.all.find(
        ({ override }) => override.slotId === "visibleAnomaly",
      ).override.strategy,
    ).toBe("lock");

    const hazardAssignment = assignments.find(
      ({ slot }) => slot.id === "hazard",
    );
    const changedState = {
      ...assignedState,
      slotAssignments: {
        ...assignedState.slotAssignments,
        hazard: assignedState.slotAssignments.hazard.map((assignment) => ({
          ...assignment,
          strategy: "force",
        })),
      },
    };
    const changed = createPreparation(changedState, {
      selectedComponents: getSelectedComponents(changedState),
    });
    expect(changed.compilerFingerprint).toBe(assigned.compilerFingerprint);
    expect(changed.hybridOverrideFingerprint).not.toBe(
      assigned.hybridOverrideFingerprint,
    );

    const removedState = removeComponentFromSlot(
      assignedState,
      hazardAssignment.component.id,
      hazardAssignment.slot.id,
    );
    const removed = createPreparation(removedState, {
      selectedComponents: getSelectedComponents(removedState),
    });
    const removedPreview = getPreview(removed);
    expect(removedPreview.valid).toBe(true);
    expect(removedPreview.overrides.operations).toHaveLength(6);
    expect(
      removedPreview.overrides.operations.some(
        ({ componentId }) => componentId === hazardAssignment.component.id,
      ),
    ).toBe(false);

    const cleared = createPreparation(createState());
    const clearedPreview = getPreview(cleared);
    expect(clearedPreview.valid).toBe(true);
    expect(clearedPreview.overrides.operations).toEqual([]);
    expect(clearedPreview.document).toStrictEqual(
      clearedPreview.baselineCompileResult.document,
    );
  });

  it.each([
    ["context", { context: "Crypt", intrusion: "Any", sourceAnchors: ["Any"], horrors: ["Any"] }],
    ["intrusion", { context: "Any", intrusion: "Low", sourceAnchors: ["Any"], horrors: ["Any"] }],
    ["source", { context: "Any", intrusion: "Any", sourceAnchors: ["sedlec-ossuary"], horrors: ["Any"] }],
    ["horror", { context: "Any", intrusion: "Any", sourceAnchors: ["Any"], horrors: ["Religious Horror"] }],
  ])("attributes %s filtering to the matching picker stage", (stage, state) => {
    const trace = traceLocationComponentsForSlot("hazard", state);

    expect(trace.exclusions[stage].length).toBeGreaterThan(0);
    expect(
      trace.exclusions[stage].every(
        ({ reason }) => reason === `${stage}-mismatch`,
      ),
    ).toBe(true);
  });
});
