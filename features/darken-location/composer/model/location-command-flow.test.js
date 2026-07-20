import { describe, expect, it } from "vitest";
import { buildLocationCommandFlow } from "./location-command-flow.js";

const rooms = [
  {
    id: "room-1",
    numberLabel: "01",
    name: "Ossuary Threshold",
    completedSlots: ["hazard"],
    missingSlots: ["clue", "encounterTwist"],
    complete: false,
  },
  {
    id: "room-2",
    numberLabel: "02",
    name: "Reliquary Gallery",
    completedSlots: ["hazard", "clue", "encounterTwist"],
    missingSlots: [],
    complete: true,
  },
];

describe("Dark Places command flow", () => {
  it("runs the existing frame generation boundary before Rooms", () => {
    const flow = buildLocationCommandFlow({
      builderMode: "theme",
      roomEntries: [],
      generatedMapPreview: null,
      frameContext: { context: "Chapel", source: "Sedlec Ossuary" },
    });

    expect(flow.activeStageId).toBe("frame");
    expect(flow.primaryAction.kind).toBe("generate-theme");
    expect(flow.nextAction.disabled).toBe(true);
  });

  it("opens the exact missing room slot", () => {
    const flow = buildLocationCommandFlow({
      activeRegion: { id: "room-1", name: "Ossuary Threshold" },
      builderMode: "scratch",
      roomEntries: rooms,
      generatedMapPreview: { regions: [] },
      exportIncompleteCount: 1,
    });

    expect(flow.activeStageId).toBe("rooms");
    expect(flow.primaryAction).toMatchObject({ kind: "open-slot", slotId: "clue" });
    expect(flow.tasks.find((task) => task.id === "hazard")?.status).toBe("complete");
    expect(flow.tasks.find((task) => task.id === "clue")?.status).toBe("current");
  });

  it("advances from a ready room to the next incomplete room", () => {
    const reordered = [rooms[1], rooms[0]];
    const flow = buildLocationCommandFlow({
      activeRegion: { id: "room-2", name: "Reliquary Gallery" },
      builderMode: "scratch",
      roomEntries: reordered,
      generatedMapPreview: { regions: [] },
      exportIncompleteCount: 1,
    });

    expect(flow.primaryAction).toMatchObject({ kind: "select-room", regionId: "room-1" });
  });
});
