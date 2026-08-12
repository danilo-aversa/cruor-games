import { describe, expect, it } from "vitest";
import { buildGuidedFlow } from "./monster-composer.start-flow.js";

function computed(overrides = {}) {
  return {
    pressure: 5,
    pressureLimit: 6,
    complexity: 4,
    complexityCap: 6,
    counterplayAudit: { rating: "Playable" },
    warnings: [],
    ...overrides,
  };
}

function collectActionKinds(flow) {
  return [
    flow.primaryAction,
    flow.previousAction,
    flow.nextAction,
    flow.blocker?.action,
    ...(flow.stages || []).map((stage) => stage.action),
    ...(flow.tasks || []).map((task) => task.action),
  ]
    .filter(Boolean)
    .map((action) => action.kind);
}

const coreSelection = { body: "body-1", weakness: "weakness-1" };

describe("Monster command flow", () => {
  it("opens the first required graft pipeline directly", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: {},
      computed: computed(),
      context: { category: "Zombie", role: "Standard", targetCr: 5 },
    });

    expect(flow.activeStageId).toBe("grafts");
    expect(flow.primaryAction).toMatchObject({ kind: "slot", slotId: "body" });
    expect(flow.tasks.filter((task) => task.required).map((task) => task.id)).toEqual([
      "body",
      "weakness",
    ]);
    expect(flow.tasks.find((task) => task.id === "attack")).toMatchObject({ required: false });
    expect(flow.blocker).toMatchObject({ id: "missing-body" });
  });

  it("treats Pressure and Complexity overages as continuous advisories rather than blockers", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: coreSelection,
      computed: computed({ pressure: 9, pressureLimit: 6, complexity: 8, complexityCap: 6 }),
    });

    expect(flow.coreReady).toBe(true);
    expect(flow.checks.pressureReady).toBe(false);
    expect(flow.checks.complexityReady).toBe(false);
    expect(flow.checks.advisories).toHaveLength(2);
    expect(flow.checks.tasks.find((task) => task.id === "pressure")).toMatchObject({ required: false, advisory: true, action: null });
    expect(flow.checks.tasks.find((task) => task.id === "complexity")).toMatchObject({ required: false, advisory: true, action: null });
    expect(flow.blocker).toBeNull();
    expect(flow.exportReady).toBe(true);
    expect(flow.primaryAction.kind).toBe("export");
  });

  it("allows export without an Attack Pattern because the engine supplies a Basic Attack", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: coreSelection,
      computed: computed(),
    });

    expect(flow.coreReady).toBe(true);
    expect(flow.blocker).toBeNull();
    expect(flow.exportReady).toBe(true);
  });

  it("routes unreliable counterplay directly to the Weakness slot", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: coreSelection,
      computed: computed({ counterplayAudit: { rating: "Weak" } }),
    });

    expect(flow.blocker).toMatchObject({
      id: "counterplay-needs-guidance",
      action: { kind: "slot", slotId: "weakness" },
    });
    expect(flow.exportReady).toBe(false);
    expect(flow.primaryAction).toMatchObject({ kind: "slot", slotId: "weakness" });
  });

  it("hands a clean build directly to the final stat block", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: { ...coreSelection, movement: "movement-1" },
      computed: computed(),
    });

    expect(flow.primaryAction.kind).toBe("export");
    expect(flow.nextAction.kind).toBe("export");
    expect(flow.blocker).toBeNull();
  });

  it("keeps graft blockers out of the Chassis stage", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "frame",
      selected: {},
      computed: computed(),
    });

    expect(flow.activeStageId).toBe("chassis");
    expect(flow.blocker).toBeNull();
    expect(flow.primaryAction.kind).toBe("grafts");
  });
});

describe("Monster command flow views", () => {
  it("uses a three-stage flow without Review", () => {
    const base = {
      composerStarted: true,
      stageMode: "grafts",
      selected: coreSelection,
      computed: computed(),
    };
    const graftFlow = buildGuidedFlow(base);
    const statBlockFlow = buildGuidedFlow({ ...base, viewMode: "export" });

    expect(graftFlow.activeStageId).toBe("grafts");
    expect(statBlockFlow.activeStageId).toBe("stat-block");
    expect(graftFlow.stages.map((stage) => stage.id)).toEqual([
      "chassis",
      "grafts",
      "stat-block",
    ]);
    expect(collectActionKinds(graftFlow)).not.toContain("review");
    expect(collectActionKinds(statBlockFlow)).not.toContain("review");
    expect(statBlockFlow.previousAction).toMatchObject({ kind: "grafts" });
  });
});
