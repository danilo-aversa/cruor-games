import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { normalizeLocationDocumentV2 } from "../../../../shared/content/content.index.js";
import { LocationOutputWorkspace } from "../LocationOutputWorkspace.jsx";
import { getLocationSessionDashboardStorageKey } from "../model/location-session-dashboard-state.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const PROVENANCE = {
  schemaVersion: "cruor-semantic-provenance-v1",
  sources: [
    {
      sourceAnchorId: "test-anchor",
      relation: "derived",
      note: "At the Table interaction test.",
    },
  ],
  legacyIds: [],
  migration: {
    method: "authored-v2",
    editorialDecision: "approved",
    reviewVersion: "phase5-dashboard-test-v1",
    note: "Reviewed test fixture.",
  },
};

function createBlock(overrides = {}) {
  return {
    id: "test-pressure",
    kind: "global-rule",
    subtype: "global-rule",
    title: "Test Pressure",
    text: "Every loud sound raises Pressure.",
    summary: "",
    audience: "gm",
    facets: [],
    sourceComponentId: "test-pressure",
    sourceAnchorIds: ["test-anchor"],
    mechanics: {
      trigger: "loud noise",
      savingThrow: "Wisdom DC 14",
      effect: "1d6 psychic damage",
    },
    counterplay: "Restore a name to reduce Pressure by 1.",
    narrative: "",
    provenance: PROVENANCE,
    metadata: {
      dashboard: {
        label: "Pressure",
        minimum: 0,
        maximum: 4,
        initial: 0,
        thresholds: [
          { at: 2, effect: "The doors close." },
          { at: 4, effect: "The archive wakes." },
        ],
      },
    },
    ...overrides,
  };
}

function createDocument() {
  const pressure = createBlock();
  return normalizeLocationDocumentV2({
    id: "phase5-dashboard-build",
    seed: "phase5-dashboard-seed",
    meta: {
      title: "The Counting Archive",
      context: "Crypt",
      horror: ["Gothic"],
      sourceAnchors: ["test-anchor"],
      intrusion: "Medium",
    },
    identity: {
      historyParagraph: "The archive once preserved every name.",
      currentSituationParagraph: "It has begun deleting living visitors.",
      playerEntryPoint: "Recover a missing name.",
      stakes: ["A visitor is erased."],
      provenance: PROVENANCE,
    },
    siteWide: {
      atmosphere: [],
      globalRules: [pressure],
      recurringSigns: [],
      stakesAndConsequences: [],
      provenance: PROVENANCE,
    },
    sessionGuide: {
      openingBeat: {
        situation: "A living name vanishes from the register.",
        immediateSignal: "The entrance door counts each visitor twice.",
        playerDecision: "Enter now or seal the archive.",
        entranceRoomId: "room-one",
      },
      objectives: ["Recover the missing name."],
      pressureTracks: [pressure],
      alwaysOnRules: [pressure],
      clueFlow: {
        requiredRevelations: ["missing-name"],
        entryNodeIds: ["missing-name"],
        nodes: [
          {
            id: "missing-name",
            title: "Missing Name",
            summary: "One label has been cut away.",
            required: true,
            available: true,
            roomIds: ["room-one"],
            sourceBlockIds: ["clue-one"],
            evidence: [
              {
                id: "clue-one",
                kind: "clue",
                title: "Missing Label",
                text: "One label has been cut away.",
                roomId: "room-one",
                roomNumber: 1,
                roomName: "Threshold Archive",
              },
            ],
          },
        ],
        links: [],
        fallbackClues: [],
      },
      stallMoves: [
        {
          id: "raise-pressure",
          trigger: "The group waits.",
          action: "Raise Pressure by 1.",
        },
      ],
      roomShortcuts: [
        {
          id: "shortcut-room-one",
          roomId: "room-one",
          number: 1,
          name: "Threshold Archive",
          role: "entrance",
          level: 0,
          shape: "narrow",
          routeIndex: 0,
          escalation: false,
          signal: "The shelves click in sequence.",
          danger: "",
          clueNodeIds: ["missing-name"],
          guidance: "",
        },
      ],
      provenance: PROVENANCE,
    },
    map: {
      mapType: "Crypt",
      counts: { rooms: 1, connections: 0, levels: 1 },
      legend: [],
      levels: [0],
      rooms: [
        {
          id: "room-one",
          number: 1,
          name: "Threshold Archive",
          role: "entrance",
          level: 0,
          shape: "narrow",
          sourceRegionId: "room-one",
          sourceComponentIds: [],
        },
      ],
      connections: [],
      provenance: PROVENANCE,
    },
    rooms: [
      {
        id: "room-one",
        number: 1,
        name: "Threshold Archive",
        role: "entrance",
        level: 0,
        shape: "narrow",
        sourceRegionId: "room-one",
        readAloud: {
          compact: "A numbered door opens into dust.",
          standard:
            "A numbered door opens into an archive whose shelves click in sequence.",
          extended: "",
          fragments: [],
          provenance: PROVENANCE,
        },
        immediateImpressions: [],
        visibleFeatures: [],
        interactions: [],
        hazards: [],
        clues: [],
        encounterTwists: [],
        secrets: [],
        rewards: [],
        recurringSigns: [],
        connections: [],
        readiness: {
          status: "ready",
          label: "Ready",
          completedSlotIds: [],
          missingSlotIds: [],
          missingSlotLabels: [],
          readyCount: 0,
          totalCount: 0,
        },
        sourceComponentIds: [],
        sourceAnchorIds: ["test-anchor"],
        provenance: PROVENANCE,
      },
    ],
    validation: {
      status: "valid",
      issues: [],
      coverage: {
        filledSlots: 0,
        totalSlots: 0,
        readyRooms: 1,
        incompleteRooms: [],
      },
    },
    provenance: PROVENANCE,
  });
}

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

function findButton(container, label) {
  return [...container.querySelectorAll("button")].find(
    (button) =>
      button.getAttribute("aria-label") === label ||
      button.textContent.includes(label),
  );
}

describe("LocationAtTheTableDashboard interactions", () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("updates pressure and clue state, opens rooms, resets, and persists by build", async () => {
    const locationDocument = createDocument();
    const documentBefore = JSON.stringify(locationDocument);
    const storage = createMemoryStorage();
    await act(async () => {
      root.render(
        <LocationOutputWorkspace
          documentModel={locationDocument}
          exportBundle={{ title: locationDocument.meta.title }}
          generatedMapPreview={null}
          initialSectionId="table"
          sessionStateStorage={storage}
        />,
      );
    });

    const increase = findButton(container, "Increase Pressure");
    expect(increase).toBeDefined();
    increase.focus();
    expect(document.activeElement).toBe(increase);
    await act(async () => increase.click());
    await act(async () => increase.click());
    expect(container.querySelector("[data-pressure-value='2']")).not.toBeNull();
    expect(
      container.querySelector(".location-session-pressure__consequence")
        .textContent,
    ).toContain("The doors close.");

    const clue = findButton(container, "Mark discovered: Missing Name");
    expect(clue.getAttribute("aria-pressed")).toBe("false");
    await act(async () => clue.click());
    expect(
      findButton(container, "Mark undiscovered: Missing Name").getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");

    const remember = container.querySelector("input[type='checkbox']");
    await act(async () => remember.click());
    const storageKey = getLocationSessionDashboardStorageKey({
      buildId: locationDocument.id,
      documentVersion: locationDocument.schemaVersion,
    });
    expect(JSON.parse(storage.getItem(storageKey))).toMatchObject({
      buildId: locationDocument.id,
      pressureValues: { "test-pressure": 2 },
      discoveredClueIds: ["missing-name"],
    });

    const reset = findButton(container, "Reset Session");
    await act(async () => reset.click());
    expect(container.querySelector("[data-pressure-value='0']")).not.toBeNull();
    expect(
      container.querySelector(".location-session-pressure__consequence")
        .textContent,
    ).toContain("No threshold consequence is active.");
    expect(
      findButton(container, "Mark discovered: Missing Name"),
    ).toBeDefined();

    const shortcut = findButton(container, "Open room 01 Threshold Archive");
    await act(async () => shortcut.click());
    expect(
      container.querySelector('[data-testid="dark-places-output-room"]'),
    ).not.toBeNull();
    expect(container.textContent).toContain("Threshold Archive");
    expect(JSON.stringify(locationDocument)).toBe(documentBefore);
  });
});
