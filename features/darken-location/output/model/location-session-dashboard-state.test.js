import { describe, expect, it } from "vitest";

import {
  createLocationSessionDashboardState,
  getLocationSessionDashboardStorageKey,
  loadLocationSessionDashboardState,
  resetLocationSessionDashboardState,
  saveLocationSessionDashboardState,
  toggleLocationSessionClue,
  updateLocationSessionPressure,
} from "./location-session-dashboard-state.js";

const GUIDE = Object.freeze({
  pressureTracks: [
    {
      id: "litany",
      metadata: {
        dashboard: { minimum: 0, maximum: 4, initial: 1 },
      },
    },
  ],
  clueFlow: {
    nodes: [{ id: "named-bone" }, { id: "fresh-remain" }],
  },
});

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function createState() {
  return createLocationSessionDashboardState({
    buildId: "build-one",
    documentVersion: "cruor-location-document-v2",
    guide: GUIDE,
  });
}

describe("Location session dashboard state", () => {
  it("tracks pressure and discovered clues without mutating the build guide", () => {
    const guideBefore = JSON.stringify(GUIDE);
    const initial = createState();
    const raised = updateLocationSessionPressure(initial, GUIDE, "litany", 9);
    const discovered = toggleLocationSessionClue(raised, GUIDE, "named-bone");

    expect(initial.pressureValues.litany).toBe(1);
    expect(raised.pressureValues.litany).toBe(4);
    expect(discovered.discoveredClueIds).toEqual(["named-bone"]);
    expect(JSON.stringify(GUIDE)).toBe(guideBefore);
    expect(Object.isFrozen(discovered)).toBe(true);
  });

  it("persists only under build id and document version", () => {
    const storage = createMemoryStorage();
    const initial = toggleLocationSessionClue(
      updateLocationSessionPressure(createState(), GUIDE, "litany", 1),
      GUIDE,
      "fresh-remain",
    );

    expect(saveLocationSessionDashboardState(storage, initial)).toBe(true);
    expect(getLocationSessionDashboardStorageKey(initial)).toContain(
      "build-one:cruor-location-document-v2",
    );
    expect(
      loadLocationSessionDashboardState(
        storage,
        {
          buildId: "build-one",
          documentVersion: "cruor-location-document-v2",
        },
        GUIDE,
      ),
    ).toEqual(initial);
    expect(
      loadLocationSessionDashboardState(
        storage,
        {
          buildId: "build-two",
          documentVersion: "cruor-location-document-v2",
        },
        GUIDE,
      ).discoveredClueIds,
    ).toEqual([]);
  });

  it("resets operational state to authored track defaults", () => {
    const changed = toggleLocationSessionClue(
      updateLocationSessionPressure(createState(), GUIDE, "litany", 2),
      GUIDE,
      "named-bone",
    );
    const reset = resetLocationSessionDashboardState(changed, GUIDE);

    expect(reset.pressureValues).toEqual({ litany: 1 });
    expect(reset.discoveredClueIds).toEqual([]);
    expect(reset.buildId).toBe(changed.buildId);
  });
});
