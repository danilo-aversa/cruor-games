import { describe, expect, it } from "vitest";
import {
  createInitialLocationComposerState,
  createLocationComposerSnapshot,
} from "./location-composer-state.js";

describe("Dark Places Map Plan defaults", () => {
  it("starts with Small scale and Standard complexity", () => {
    const state = createInitialLocationComposerState([]);

    expect(state.dungeonScale).toBe("small");
    expect(state.dungeonComplexity).toBe("standard");
  });

  it("uses the same defaults when serializing an incomplete state", () => {
    const snapshot = createLocationComposerSnapshot({
      locationRegions: [],
      slotAssignments: {},
    });

    expect(snapshot.dungeonScale).toBe("small");
    expect(snapshot.dungeonComplexity).toBe("standard");
  });
});
