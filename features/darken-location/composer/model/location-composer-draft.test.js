import { beforeEach, describe, expect, test, vi } from "vitest";
import { createInitialLocationComposerState } from "./location-composer-state.js";
import {
  deleteStoredLocationDraftWithStatus,
  readStoredLocationDraft,
  restoreLocationDraftState,
  saveLocationDraftWithStatus,
} from "./location-composer-draft.js";

const DRAFT_V2_KEY = "cruor:darken-location-composer:draft:v2";
const DRAFT_V1_KEY = "cruor:darken-location-composer:draft:v1";

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createMemoryStorage() });
});

describe("Dark Places Composer draft v2", () => {
  test("persists the complete frame and manual map workspace", () => {
    const state = createInitialLocationComposerState([
      { id: "region-a", name: "Saved Chamber", role: "Entrance" },
    ]);
    Object.assign(state, {
      dungeonMode: "scratch",
      dungeonThemeId: "decomposition",
      dungeonScale: "custom",
      dungeonCustomRoomCount: 11,
      dungeonComplexity: "complex",
      themeProgramCandidates: [{ id: "candidate-a", review: { score: 9 } }],
      activeThemeProgramCandidateId: "candidate-a",
      mapManualOverrides: {
        roomPositions: {
          "region-a": { x: 15, y: 9 },
        },
      },
    });

    const saveResult = saveLocationDraftWithStatus(state);
    const stored = readStoredLocationDraft();
    const restored = restoreLocationDraftState(
      stored,
      createInitialLocationComposerState([]),
    );

    expect(saveResult.ok).toBe(true);
    expect(stored.version).toBe(2);
    expect(restored).toMatchObject({
      dungeonMode: "scratch",
      dungeonThemeId: "decomposition",
      dungeonScale: "custom",
      dungeonCustomRoomCount: 11,
      dungeonComplexity: "complex",
      activeThemeProgramCandidateId: "candidate-a",
    });
    expect(restored.themeProgramCandidates).toEqual(state.themeProgramCandidates);
    expect(restored.mapManualOverrides.roomPositions["region-a"]).toEqual({
      x: 15,
      y: 9,
    });
  });

  test("reads an existing v1 draft and migrates it in memory", () => {
    window.localStorage.setItem(
      DRAFT_V1_KEY,
      JSON.stringify({
        version: 1,
        savedAt: "2026-07-14T12:00:00.000Z",
        state: {
          title: "Legacy Draft",
          context: "Crypt",
          sourceAnchors: [],
          horrors: [],
          selectedComponentIds: [],
          slotAssignments: {},
          locationRegions: [{ id: "legacy-region", name: "Legacy Room" }],
        },
      }),
    );

    const stored = readStoredLocationDraft();

    expect(stored.version).toBe(2);
    expect(stored.migratedFromVersion).toBe(1);
    expect(stored.state.title).toBe("Legacy Draft");
  });

  test("clears both current and legacy draft keys", () => {
    window.localStorage.setItem(DRAFT_V2_KEY, "current");
    window.localStorage.setItem(DRAFT_V1_KEY, "legacy");

    expect(deleteStoredLocationDraftWithStatus()).toEqual({ ok: true, reason: "" });
    expect(window.localStorage.getItem(DRAFT_V2_KEY)).toBeNull();
    expect(window.localStorage.getItem(DRAFT_V1_KEY)).toBeNull();
  });
});
