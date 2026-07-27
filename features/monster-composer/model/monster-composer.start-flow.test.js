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

  it("treats Pressure and Complexity overages as advisories rather than blockers", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: coreSelection,
      computed: computed({ pressure: 9, pressureLimit: 6, complexity: 8, complexityCap: 6 }),
    });

    expect(flow.coreReady).toBe(true);
    expect(flow.review.pressureReady).toBe(false);
    expect(flow.review.complexityReady).toBe(false);
    expect(flow.review.advisories).toHaveLength(2);
    expect(flow.review.tasks.find((task) => task.id === "pressure")).toMatchObject({ required: false, advisory: true });
    expect(flow.review.tasks.find((task) => task.id === "complexity")).toMatchObject({ required: false, advisory: true });
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

  it("still blocks a core-ready build when counterplay is not reliable", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: coreSelection,
      computed: computed({ counterplayAudit: { rating: "Weak" } }),
    });

    expect(flow.blocker).toMatchObject({ id: "counterplay-needs-review" });
    expect(flow.exportReady).toBe(false);
    expect(flow.primaryAction.kind).toBe("review");
  });

  it("hands a clean build to the final stat block", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: { ...coreSelection, movement: "movement-1" },
      computed: computed(),
    });

    expect(flow.primaryAction.kind).toBe("export");
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
  it("tracks Review and Stat Block as real active stages", () => {
    const base = {
      composerStarted: true,
      stageMode: "grafts",
      selected: coreSelection,
      computed: computed(),
    };
    expect(buildGuidedFlow({ ...base, viewMode: "balance" }).activeStageId).toBe("review");
    expect(buildGuidedFlow({ ...base, viewMode: "export" }).activeStageId).toBe("stat-block");
  });
});
