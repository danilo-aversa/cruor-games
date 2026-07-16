import { describe, expect, it } from "vitest";

import { compileLocationSessionGuide } from "./location-session-guide.compiler.js";

const PROVENANCE = Object.freeze({
  schemaVersion: "cruor-semantic-provenance-v1",
  sources: [
    {
      sourceAnchorId: "test-anchor",
      relation: "derived",
      note: "Session Guide compiler fixture.",
    },
  ],
  legacyIds: [],
  migration: {
    method: "authored-v2",
    editorialDecision: "approved",
    reviewVersion: "phase5-test-v1",
    note: "Reviewed fixture.",
  },
});

function createInput() {
  const pressureRule = {
    id: "test-pressure",
    kind: "global-rule",
    title: "Test Pressure",
    text: "Noise raises Pressure.",
    metadata: {
      resolvedRule: {
        category: "pressure-track",
        state: { label: "Pressure", minimum: 0, maximum: 4, initial: 1 },
        escalation: [
          { at: 2, effect: "Doors close." },
          { at: 4, effect: "The archive wakes." },
        ],
        trigger: { events: ["loud-noise"] },
        resolution: { threshold: 2 },
        reset: { value: 0, condition: "Restore a record." },
      },
    },
  };
  const rooms = [
    {
      id: "room-1",
      number: 1,
      name: "Threshold Archive",
      role: "entrance",
      level: 0,
      shape: "narrow",
      readAloud: { compact: "A numbered door opens into dust." },
      immediateImpressions: [{ text: "Dry paper catches in the throat." }],
      hazards: [],
      clues: [
        { id: "clue-1", title: "Missing Record", text: "A name is gone." },
      ],
      recurringSigns: [
        {
          id: "sign-1",
          sourceComponentId: "sign-missing-name",
          title: "Missing Name",
          text: "One label has been cut away.",
          metadata: { revelationLink: "missing-name-revelation" },
        },
      ],
    },
    {
      id: "room-2",
      number: 2,
      name: "Counting Vault",
      role: "final",
      level: -1,
      shape: "circular",
      immediateImpressions: [{ text: "The shelves click in sequence." }],
      hazards: [{ title: "Falling Index" }],
      clues: [],
      recurringSigns: [],
    },
  ];
  const component = {
    id: "test-session-guide",
    provenance: PROVENANCE,
    semantic: {
      openingBeat: {
        situation: "The archive has lost a living name.",
        immediateSignal: "The first door counts every visitor.",
        playerDecision: "Enter or seal the archive.",
      },
      objectives: ["Recover the missing name."],
      alwaysOnRuleIds: ["test-pressure"],
      pressureTrackId: "test-pressure",
      clueFlow: {
        requiredRevelations: ["missing-name-revelation"],
        links: [],
        fallbackClues: ["A clerk repeats the missing name."],
      },
      stallMoves: [
        {
          id: "advance-pressure",
          trigger: "The group waits.",
          action: "Raise Pressure by 1.",
        },
      ],
      pacing: {
        defaultRoute: ["room-1", "room-2"],
        escalationRooms: ["room-2"],
        climaxGuidance: "Resolve the missing name before adding a new threat.",
      },
    },
  };
  return {
    components: [component],
    identity: {
      currentSituationParagraph: "The archive is deleting names.",
      playerEntryPoint: "Recover a missing name.",
      stakes: ["A visitor is erased."],
    },
    globalRuleBlocks: [pressureRule],
    rooms,
    fallbackProvenance: PROVENANCE,
  };
}

describe("Location Session Guide compiler", () => {
  it("builds operational pressure, clue, and shortcut data without counts", () => {
    const result = compileLocationSessionGuide(createInput());
    const guide = result.sessionGuide;

    expect(result.diagnostics).toEqual([]);
    expect(guide.openingBeat.entranceRoomId).toBe("room-1");
    expect(guide.pressureTracks[0].metadata.dashboard).toMatchObject({
      label: "Pressure",
      minimum: 0,
      maximum: 4,
      initial: 1,
    });
    expect(guide.pressureTracks[0].metadata.dashboard.thresholds).toEqual([
      { at: 2, effect: "Doors close." },
      { at: 4, effect: "The archive wakes." },
    ]);
    expect(guide.alwaysOnRules.map((rule) => rule.id)).toEqual([
      "test-pressure",
    ]);
    expect(guide.clueFlow.nodes[0]).toMatchObject({
      id: "missing-name-revelation",
      required: true,
      available: true,
      roomIds: ["room-1"],
    });
    expect(guide.roomShortcuts.map((shortcut) => shortcut.roomId)).toEqual([
      "room-1",
      "room-2",
    ]);
    expect(guide.roomShortcuts[1]).toMatchObject({
      escalation: true,
      danger: "Falling Index",
    });
    expect(JSON.stringify(guide)).not.toMatch(/roomCount|componentCount/i);
  });

  it("reports an impossible required revelation", () => {
    const input = createInput();
    input.components[0].semantic.clueFlow.requiredRevelations.push(
      "unreachable-revelation",
    );

    const result = compileLocationSessionGuide(input);

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "session-guide.impossible-required-revelation",
          severity: "error",
        }),
      ]),
    );
  });

  it("does not mutate its inputs and freezes its output", () => {
    const input = createInput();
    const before = JSON.stringify(input);
    const first = compileLocationSessionGuide(input);
    const second = compileLocationSessionGuide(input);

    expect(first).toEqual(second);
    expect(JSON.stringify(input)).toBe(before);
    expect(Object.isFrozen(first.sessionGuide)).toBe(true);
    expect(Object.isFrozen(first.sessionGuide.clueFlow.nodes[0])).toBe(true);
  });
});
