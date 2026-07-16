import { describe, expect, it } from "vitest";

import { SEDLEC_OSSUARY_SEMANTIC_V2_PACK } from "../../../shared/content/content.index.js";
import { allocateSensoryImpressions } from "./location-sensory.compiler.js";

const SENSORY_COMPONENT =
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK.modules[0].components.find(
    (component) => component.semanticType === "sensory-profile",
  );

function createRooms() {
  return [
    {
      id: "room-entrance",
      number: 1,
      name: "01 Rib Corridor",
      role: "entrance",
      shape: "corridor",
      level: 0,
      sourceComponentIds: ["bone-chandelier"],
      sourceAnchorIds: ["sedlec-ossuary"],
      immediateImpressions: [],
      visibleFeatures: [
        { id: "chandelier", text: "A bone chandelier marks the route." },
      ],
      recurringSigns: [],
      connections: [
        {
          id: "edge-a-b",
          fromRoomId: "room-entrance",
          toRoomId: "room-ritual",
        },
      ],
    },
    {
      id: "room-ritual",
      number: 2,
      name: "02 Counting Rotunda",
      role: "ritual",
      shape: "circle",
      level: 0,
      sourceComponentIds: ["skull-garland"],
      sourceAnchorIds: ["sedlec-ossuary"],
      immediateImpressions: [],
      visibleFeatures: [
        { id: "garland", text: "Skull garlands ring the rotunda." },
      ],
      recurringSigns: [],
      connections: [
        {
          id: "edge-a-b",
          fromRoomId: "room-entrance",
          toRoomId: "room-ritual",
        },
        {
          id: "edge-b-c",
          fromRoomId: "room-ritual",
          toRoomId: "room-secret",
        },
      ],
    },
    {
      id: "room-secret",
      number: 3,
      name: "03 Reliquary Shaft",
      role: "secret",
      shape: "vertical",
      level: -1,
      sourceComponentIds: ["prayer-slip"],
      sourceAnchorIds: ["sedlec-ossuary"],
      immediateImpressions: [],
      visibleFeatures: [
        { id: "slips", text: "Prayer slips line the descending shaft." },
      ],
      recurringSigns: [],
      connections: [
        {
          id: "edge-b-c",
          fromRoomId: "room-ritual",
          toRoomId: "room-secret",
        },
      ],
    },
  ];
}

function compile(rooms = createRooms()) {
  return allocateSensoryImpressions({
    rooms,
    components: [SENSORY_COMPONENT],
    seed: "phase4-sensory-test-seed",
  });
}

describe("location sensory compiler", () => {
  it("allocates three unique impressions per room across roles and shapes", () => {
    const result = compile();
    const texts = result.rooms.flatMap((room) =>
      room.immediateImpressions.map((block) => block.text),
    );

    expect(result.diagnostics).toEqual([]);
    expect(new Set(texts).size).toBe(texts.length);
    result.rooms.forEach((room) => {
      expect(room.immediateImpressions).toHaveLength(3);
      expect(
        new Set(
          room.immediateImpressions
            .map((block) => block.metadata.sense)
            .filter(Boolean),
        ).size,
      ).toBe(2);
      room.immediateImpressions.forEach((block) => {
        expect(block.audience).toBe("both");
        expect(block.metadata.compilerStage).toBe(
          "allocate-sensory-impressions",
        );
        expect(block.metadata.sourceFragmentId).toBeTruthy();
      });
    });
  });

  it("matches contextual impressions to narrow, circular, and vertical geometry", () => {
    const result = compile();
    const contextual = Object.fromEntries(
      result.rooms.map((room) => [
        room.id,
        room.immediateImpressions.find(
          (block) => block.metadata.contextKind === "geometry",
        ),
      ]),
    );

    expect(contextual["room-entrance"].metadata.contextMatch).toBe("narrow");
    expect(contextual["room-ritual"].metadata.contextMatch).toBe("circular");
    expect(contextual["room-secret"].metadata.contextMatch).toBe("vertical");
    expect(contextual["room-entrance"].text).toContain("Rib Corridor");
    expect(contextual["room-ritual"].text).toContain("Counting Rotunda");
    expect(contextual["room-secret"].text).toContain("Reliquary Shaft");
  });

  it("keeps unrelated room allocations stable when one room changes", () => {
    const rooms = createRooms();
    const first = compile(rooms);
    const changed = compile(
      rooms.map((room) =>
        room.id === "room-entrance"
          ? {
              ...room,
              name: "01 Ruined Vestibule",
              role: "threshold",
              shape: "ruined",
              visibleFeatures: [
                { id: "broken-count", text: "The count breaks at the wall." },
              ],
            }
          : room,
      ),
    );

    ["room-ritual", "room-secret"].forEach((roomId) => {
      expect(changed.allocations[roomId]).toEqual(first.allocations[roomId]);
      expect(
        changed.rooms.find((room) => room.id === roomId).immediateImpressions,
      ).toEqual(
        first.rooms.find((room) => room.id === roomId).immediateImpressions,
      );
    });
    expect(changed.allocations["room-entrance"]).not.toEqual(
      first.allocations["room-entrance"],
    );
  });

  it("is order-independent and does not mutate rooms or profiles", () => {
    const rooms = createRooms();
    const before = JSON.stringify({ rooms, component: SENSORY_COMPONENT });
    const forward = compile(rooms);
    const reversed = compile([...rooms].reverse());

    expect(reversed).toEqual(forward);
    expect(JSON.stringify({ rooms, component: SENSORY_COMPONENT })).toBe(
      before,
    );
    expect(Object.isFrozen(forward.rooms[0])).toBe(true);
  });
});
