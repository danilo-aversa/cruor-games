import { describe, expect, it } from "vitest";
import {
  ROOM_ARCHETYPE_OPTIONS as SHARED_ROOM_ARCHETYPE_OPTIONS,
  normalizeRoomArchetypeId as normalizeSharedRoomArchetypeId,
} from "./room-archetypes.js";
import {
  ROOM_DESIGN_MODIFIER_OPTIONS as SHARED_ROOM_DESIGN_MODIFIER_OPTIONS,
  ROOM_DESIGN_SHAPE_KIND_OPTIONS as SHARED_ROOM_DESIGN_SHAPE_KIND_OPTIONS,
  compileRoomArchetypeToRoomDesign as compileSharedRoomArchetypeToRoomDesign,
  normalizeRoomDesign as normalizeSharedRoomDesign,
} from "./room-design.js";
import { normalizeRoomCompatibility } from "./room-compatibility.js";
import {
  ROOM_ARCHETYPE_OPTIONS as LEGACY_ROOM_ARCHETYPE_OPTIONS,
  normalizeRoomArchetypeId as normalizeLegacyRoomArchetypeId,
} from "../../../features/darken-location/map-generator/map-generator.profile.js";
import {
  ROOM_DESIGN_MODIFIER_OPTIONS as LEGACY_ROOM_DESIGN_MODIFIER_OPTIONS,
  ROOM_DESIGN_SHAPE_KIND_OPTIONS as LEGACY_ROOM_DESIGN_SHAPE_KIND_OPTIONS,
  compileRoomArchetypeToRoomDesign as compileLegacyRoomArchetypeToRoomDesign,
  normalizeRoomDesign as normalizeLegacyRoomDesign,
} from "../../../features/darken-location/map-generator/map-generator.room-design.js";

describe("shared room contracts", () => {
  it("keeps the map-generator compatibility exports bound to the shared contracts", () => {
    expect(LEGACY_ROOM_ARCHETYPE_OPTIONS).toBe(SHARED_ROOM_ARCHETYPE_OPTIONS);
    expect(LEGACY_ROOM_DESIGN_SHAPE_KIND_OPTIONS).toBe(
      SHARED_ROOM_DESIGN_SHAPE_KIND_OPTIONS,
    );
    expect(LEGACY_ROOM_DESIGN_MODIFIER_OPTIONS).toBe(
      SHARED_ROOM_DESIGN_MODIFIER_OPTIONS,
    );
    expect(normalizeLegacyRoomArchetypeId).toBe(normalizeSharedRoomArchetypeId);
    expect(normalizeLegacyRoomDesign).toBe(normalizeSharedRoomDesign);
    expect(compileLegacyRoomArchetypeToRoomDesign).toBe(
      compileSharedRoomArchetypeToRoomDesign,
    );
  });

  it("preserves legacy room-design normalization", () => {
    expect(
      normalizeSharedRoomDesign({
        shape: {
          kind: "Round",
          modifiers: ["columns", "central pit"],
        },
        size: {
          scale: "Large",
          minW: 6,
          minH: 5,
        },
        requiredProps: ["well"],
        topology: {
          branchBias: "terminal",
          secret: true,
        },
        source: "contract-test",
      }),
    ).toEqual({
      schemaVersion: "room-design-v0.1",
      shape: {
        kind: "circle",
        modifiers: ["pillared", "central-void"],
      },
      size: {
        scale: "Large",
        minWidthCells: 6,
        minHeightCells: 5,
      },
      props: {
        required: [
          {
            kind: "pit",
            placement: "center",
          },
        ],
      },
      topology: {
        branchBias: "terminal",
        secret: true,
      },
      source: "contract-test",
    });
  });

  it("normalizes the compatibility metadata reserved for the resolver pass", () => {
    expect(
      normalizeRoomCompatibility({
        exclusiveGroups: ["Central Hazard", "central-hazard"],
        requiresComponentTags: ["room:hazard"],
        forbidsComponentTags: ["room:sealed archive"],
        requiresCapabilities: ["Supports Central Void"],
        conflictPolicy: "replace",
      }),
    ).toEqual({
      schemaVersion: "room-compatibility-v1",
      exclusiveGroups: ["central-hazard"],
      requiresComponentTags: ["room:hazard"],
      forbidsComponentTags: ["room:sealed-archive"],
      requiresCapabilities: ["supports-central-void"],
      conflictPolicy: "replace",
    });
  });
});
