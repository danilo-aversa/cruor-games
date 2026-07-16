import { describe, expect, it } from "vitest";

import { SEDLEC_OSSUARY_SEMANTIC_V2_PACK } from "../../../shared/content/content.index.js";
import { composeRoomReadAloud } from "./location-read-aloud.compiler.js";
import { allocateSensoryImpressions } from "./location-sensory.compiler.js";

const COMPONENTS = SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules[0].components;
const SENSORY_COMPONENT = COMPONENTS.find(
  (component) => component.semanticType === "sensory-profile",
);
const READ_ALOUD_COMPONENT = COMPONENTS.find(
  (component) => component.semanticType === "read-aloud-profile",
);

function createRooms() {
  return [
    {
      id: "room-a",
      number: 1,
      name: "01 Rib Corridor",
      role: "entrance",
      shape: "corridor",
      level: 0,
      sourceComponentIds: ["bone-chandelier"],
      sourceAnchorIds: ["sedlec-ossuary"],
      immediateImpressions: [],
      visibleFeatures: [
        {
          id: "bone-chandelier",
          title: "Bone Chandelier",
          text: "A bone chandelier marks the route.",
        },
      ],
      recurringSigns: [],
      connections: [],
    },
    {
      id: "room-b",
      number: 2,
      name: "02 Counting Rotunda",
      role: "ritual",
      shape: "circle",
      level: 0,
      sourceComponentIds: ["skull-garland"],
      sourceAnchorIds: ["sedlec-ossuary"],
      immediateImpressions: [],
      visibleFeatures: [
        {
          id: "skull-garland",
          title: "Skull Garland",
          text: "Skull garlands ring the rotunda.",
        },
      ],
      recurringSigns: [],
      connections: [],
    },
    {
      id: "room-c",
      number: 3,
      name: "03 Sealed Reliquary",
      role: "final",
      shape: "vertical",
      level: -1,
      sourceComponentIds: ["prayer-slip"],
      sourceAnchorIds: ["sedlec-ossuary"],
      immediateImpressions: [],
      visibleFeatures: [
        {
          id: "prayer-slip-mortar",
          title: "Prayer-Slip Mortar",
          text: "Prayer slips protrude from the mortar.",
        },
      ],
      recurringSigns: [],
      connections: [],
    },
  ];
}

function countWords(value) {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function compile(rooms = createRooms()) {
  const sensory = allocateSensoryImpressions({
    rooms,
    components: [SENSORY_COMPONENT],
    seed: "phase4-read-aloud-test-seed",
  });
  return composeRoomReadAloud({
    rooms: sensory.rooms,
    components: [READ_ALOUD_COMPONENT],
    seed: "phase4-read-aloud-test-seed",
  });
}

describe("location Read-Aloud compiler", () => {
  it("composes compact, standard, and extended variants within target ranges", () => {
    const result = compile();

    expect(result.diagnostics).toEqual([]);
    result.rooms.forEach((room) => {
      expect(countWords(room.readAloud.compact)).toBeGreaterThanOrEqual(20);
      expect(countWords(room.readAloud.compact)).toBeLessThanOrEqual(35);
      expect(countWords(room.readAloud.standard)).toBeGreaterThanOrEqual(45);
      expect(countWords(room.readAloud.standard)).toBeLessThanOrEqual(75);
      expect(countWords(room.readAloud.extended)).toBeGreaterThanOrEqual(80);
      expect(countWords(room.readAloud.extended)).toBeLessThanOrEqual(120);
      expect(room.readAloud.compact).not.toBe(room.readAloud.standard);
      expect(room.readAloud.standard).not.toBe(room.readAloud.extended);
    });
  });

  it("retains source fragment ids and filters every forbidden spoiler tag", () => {
    const result = compile();
    const serialized = JSON.stringify(result.rooms);

    expect(serialized).not.toContain("hidden-rib-initial");
    expect(serialized).not.toContain("unmapped-chandelier-room");
    expect(serialized).not.toContain("gm-only");
    expect(serialized).not.toContain("future-reveal");
    result.rooms.forEach((room) => {
      room.readAloud.fragments.forEach((fragment) => {
        expect(fragment.audience).toBe("both");
        expect(fragment.metadata.compilerStage).toBe("compose-read-aloud");
        expect(fragment.metadata.sourceFragmentId).toBeTruthy();
        expect(fragment.metadata.usedIn.length).toBeGreaterThan(0);
      });
    });
  });

  it("uses room role, shape, and visible content without changing other rooms", () => {
    const rooms = createRooms();
    const first = compile(rooms);
    const changed = compile(
      rooms.map((room) =>
        room.id === "room-a"
          ? {
              ...room,
              name: "01 Ruined Threshold",
              role: "threshold",
              shape: "ruined",
              visibleFeatures: [
                {
                  id: "fresh-bone",
                  title: "Fresh Bone",
                  text: "A fresh bone interrupts the wall.",
                },
              ],
            }
          : room,
      ),
    );

    ["room-b", "room-c"].forEach((roomId) => {
      expect(
        changed.rooms.find((room) => room.id === roomId).readAloud,
      ).toEqual(first.rooms.find((room) => room.id === roomId).readAloud);
    });
    expect(changed.rooms[0].readAloud.standard).not.toBe(
      first.rooms[0].readAloud.standard,
    );
  });

  it("is byte-stable across reordered input and leaves source data untouched", () => {
    const rooms = createRooms();
    const before = JSON.stringify({ rooms, component: READ_ALOUD_COMPONENT });
    const forward = compile(rooms);
    const reversed = compile([...rooms].reverse());

    expect(reversed).toEqual(forward);
    expect(JSON.stringify({ rooms, component: READ_ALOUD_COMPONENT })).toBe(
      before,
    );
    expect(Object.isFrozen(forward.rooms[0].readAloud)).toBe(true);
  });
});
