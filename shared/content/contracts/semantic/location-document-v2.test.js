import { describe, expect, it } from "vitest";

import {
  normalizeLocationDocumentV2,
  normalizeSemanticProvenance,
  normalizeSessionStateV1,
  validateLocationDocumentV2,
  validateSessionStateV1,
} from "./index.js";

function createProvenance() {
  return normalizeSemanticProvenance({
    sources: [
      {
        sourceAnchorId: "test-anchor",
        relation: "derived",
        note: "Generated from the Phase 2 contract test source.",
      },
    ],
    legacyIds: [],
    migration: {
      method: "authored-v2",
      editorialDecision: "approved",
      reviewVersion: "phase2-test-v1",
      note: "Reviewed test provenance.",
    },
  });
}

function createDocument() {
  const provenance = createProvenance();
  const block = {
    id: "room-one-hazard",
    kind: "hazard",
    subtype: "trap",
    title: "Counting Floor",
    text: "The floor counts every hurried step.",
    summary: "",
    audience: "gm",
    facets: [],
    sourceComponentId: "hazard-counting-floor",
    sourceAnchorIds: ["test-anchor"],
    mechanics: { dc: 14 },
    counterplay: "Move one step at a time.",
    narrative: "",
    provenance,
    metadata: {},
  };
  return normalizeLocationDocumentV2({
    id: "phase2-test-location",
    seed: "phase2-test-seed",
    meta: {
      title: "The Counting Archive",
      context: "Crypt",
      horror: ["Religious Horror"],
      sourceAnchors: ["test-anchor"],
      intrusion: "Medium",
    },
    identity: {
      historyParagraph: "The archive was built to preserve names.",
      currentSituationParagraph: "It now erases every visitor it records.",
      playerEntryPoint: "Recover a missing name.",
      stakes: ["The final living record is erased."],
      provenance,
    },
    siteWide: {
      atmosphere: [],
      globalRules: [],
      recurringSigns: [],
      stakesAndConsequences: [],
      provenance,
    },
    sessionGuide: {
      openingBeat: {},
      objectives: [],
      pressureTracks: [],
      alwaysOnRules: [],
      clueFlow: {},
      stallMoves: [],
      roomShortcuts: [],
      provenance,
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
          name: "Counting Floor",
          role: "Entrance",
          level: 0,
          shape: "rect",
          sourceRegionId: "room-one",
          sourceComponentIds: ["hazard-counting-floor"],
        },
      ],
      connections: [],
      provenance,
    },
    rooms: [
      {
        id: "room-one",
        number: 1,
        name: "Counting Floor",
        role: "Entrance",
        level: 0,
        shape: "rect",
        sourceRegionId: "room-one",
        readAloud: {
          compact: "",
          standard: "A grid of names covers the floor.",
          extended: "",
          fragments: [],
          provenance,
        },
        immediateImpressions: [],
        visibleFeatures: [],
        interactions: [],
        hazards: [block],
        clues: [],
        encounterTwists: [],
        secrets: [],
        rewards: [],
        recurringSigns: [],
        connections: [],
        readiness: {
          status: "ready",
          label: "Ready",
          completedSlotIds: ["hazard"],
          missingSlotIds: [],
          missingSlotLabels: [],
          readyCount: 1,
          totalCount: 1,
        },
        sourceComponentIds: ["hazard-counting-floor"],
        sourceAnchorIds: ["test-anchor"],
        provenance,
      },
    ],
    validation: {
      status: "valid",
      issues: [],
      coverage: {
        filledSlots: 1,
        totalSlots: 1,
        readyRooms: 1,
        incompleteRooms: [],
      },
    },
    provenance,
  });
}

describe("Location Document v2 and Session State v1 contracts", () => {
  it("normalizes a renderer-independent document with complete provenance", () => {
    const document = createDocument();

    expect(validateLocationDocumentV2(document)).toEqual([]);
    expect(Object.isFrozen(document.rooms[0])).toBe(true);
    expect(document.rooms[0].hazards[0].provenance.schemaVersion).toBe(
      "cruor-semantic-provenance-v1",
    );
    expect(JSON.stringify(document)).not.toMatch(
      /cellRect|labelPoint|contentBounds|renderPath|svg/i,
    );
  });

  it("rejects unknown document fields and missing nested provenance", () => {
    const document = createDocument();
    const invalid = {
      ...document,
      rendererGeometry: { x: 1 },
      rooms: [
        {
          ...document.rooms[0],
          provenance: {
            ...document.rooms[0].provenance,
            sources: [],
          },
        },
      ],
    };
    const codes = validateLocationDocumentV2(invalid).map(
      (issue) => issue.code,
    );

    expect(codes).toContain("contract.unknown-field");
    expect(codes).toContain("provenance.source-required");
  });

  it("normalizes the document seed into an immutable compiler session", () => {
    const document = createDocument();
    const session = normalizeSessionStateV1({
      id: "phase2-test-session",
      seed: document.seed,
      moduleId: "test-module",
      selectedComponentIds: ["hazard-counting-floor"],
      locationSeed: {
        meta: document.meta,
        identity: document.identity,
        siteWide: document.siteWide,
        sessionGuide: document.sessionGuide,
        map: document.map,
        rooms: document.rooms,
        coverage: document.validation.coverage,
      },
      provenance: document.provenance,
    });

    expect(validateSessionStateV1(session)).toEqual([]);
    expect(Object.isFrozen(session.locationSeed.rooms[0])).toBe(true);
    expect(session.locationSeed.rooms).toHaveLength(1);
  });
});
