import { describe, expect, it } from "vitest";
import { buildGuidedFlow } from "./monster-composer.start-flow.js";

function computed(overrides = {}) {
  return {
    pressure: 10,
    budget: 12,
    complexity: 4,
    complexityCap: 7,
    counterplayAudit: { rating: "Playable" },
    warnings: [],
    ...overrides,
  };
}

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
      "attack",
      "weakness",
    ]);
    expect(flow.blocker).toMatchObject({ id: "missing-body" });
  });

  it("surfaces a structured review blocker after the core loop is complete", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: { body: "body-1", attack: "attack-1", weakness: "weakness-1" },
      computed: computed({ pressure: 16, budget: 12 }),
    });

    expect(flow.coreReady).toBe(true);
    expect(flow.primaryAction.kind).toBe("review");
    expect(flow.blocker).toMatchObject({ id: "pressure-over-budget" });
    expect(flow.stages.find((stage) => stage.id === "review")?.status).toBe("open");
  });

  it("hands a clean build to the final stat block", () => {
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: {
        body: "body-1",
        attack: "attack-1",
        weakness: "weakness-1",
        movement: "movement-1",
      },
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
      selected: { body: "body", attack: "attack", weakness: "weakness" },
      computed: computed(),
    };
    expect(buildGuidedFlow({ ...base, viewMode: "balance" }).activeStageId).toBe("review");
    expect(buildGuidedFlow({ ...base, viewMode: "export" }).activeStageId).toBe("stat-block");
  });
});
