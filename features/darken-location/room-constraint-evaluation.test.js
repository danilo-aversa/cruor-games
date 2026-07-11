import { describe, expect, it } from "vitest";
import {
  evaluateDarkPlacesRoomCandidate,
  evaluateDarkPlacesRoomManualOverride,
} from "./room-constraint-evaluation.js";

function component(id, roomDesign = null, extra = {}) {
  return {
    id,
    title: id,
    ...(roomDesign ? { roomDesign } : {}),
    ...extra,
  };
}

describe("Dark Places room constraint evaluation", () => {
  it("keeps candidates without room constraints compatible", () => {
    const evaluation = evaluateDarkPlacesRoomCandidate({
      activeRegion: { id: "room-1", shape: "rect", size: "Medium" },
      candidateComponent: component("narrative-only"),
    });

    expect(evaluation).toMatchObject({
      status: "compatible",
      blocking: false,
      replaceable: false,
      changes: [],
    });
  });

  it("blocks a candidate that introduces an incompatible hard shape", () => {
    const evaluation = evaluateDarkPlacesRoomCandidate({
      activeRegion: { id: "room-1", shape: "rect", size: "Medium" },
      assignedComponents: [
        component("round-sanctum", {
          strength: "required",
          shape: { required: "circle" },
        }),
      ],
      candidateComponent: component("cross-vault", {
        strength: "required",
        shape: { required: "cross" },
      }),
    });

    expect(evaluation.status).toBe("incompatible");
    expect(evaluation.blocking).toBe(true);
    expect(evaluation.reason).toContain("Required room shapes conflict");
    expect(evaluation.reason).toContain("round-sanctum");
    expect(evaluation.reason).toContain("cross-vault");
  });

  it("previews deterministic room transformations", () => {
    const evaluation = evaluateDarkPlacesRoomCandidate({
      activeRegion: { id: "room-1", shape: "rect", size: "Medium" },
      candidateComponent: component("burial-rotunda", {
        strength: "required",
        shape: { required: "circle" },
        size: { minScale: "Large", maxScale: "Large" },
      }),
    });

    expect(evaluation.status).toBe("transforms-room");
    expect(evaluation.changeSummaries).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Shape"),
        expect.stringContaining("Size"),
      ]),
    );
    expect(evaluation.effectiveRoomDesign).toMatchObject({
      shape: { kind: "circle" },
      size: { scale: "Large" },
    });
  });

  it("offers an explicit replacement for replace-policy conflicts", () => {
    const evaluation = evaluateDarkPlacesRoomCandidate({
      activeRegion: { id: "room-1", shape: "rect" },
      assignedComponents: [
        component("existing-focus", null, {
          roomCompatibility: {
            exclusiveGroups: ["room-focus"],
            conflictPolicy: "block",
          },
        }),
      ],
      candidateComponent: component("candidate-focus", null, {
        roomCompatibility: {
          exclusiveGroups: ["room-focus"],
          conflictPolicy: "replace",
        },
      }),
    });

    expect(evaluation).toMatchObject({
      status: "incompatible",
      blocking: false,
      replaceable: true,
      replacementComponentIds: ["existing-focus"],
    });
  });

  it("does not let a replaceable conflict hide a second non-replaceable conflict", () => {
    const evaluation = evaluateDarkPlacesRoomCandidate({
      activeRegion: { id: "room-1", shape: "rect" },
      assignedComponents: [
        component(
          "existing-focus",
          {
            strength: "required",
            shape: { required: "circle" },
          },
          {
            roomCompatibility: {
              exclusiveGroups: ["room-focus"],
              conflictPolicy: "block",
            },
          },
        ),
      ],
      candidateComponent: component(
        "candidate-focus",
        {
          strength: "required",
          shape: { required: "cross" },
        },
        {
          roomCompatibility: {
            exclusiveGroups: ["room-focus"],
            conflictPolicy: "replace",
          },
        },
      ),
    });

    expect(evaluation.status).toBe("incompatible");
    expect(evaluation.blocking).toBe(true);
    expect(evaluation.replaceable).toBe(false);
    expect(evaluation.replacementComponentIds).toEqual([]);
    expect(evaluation.conflicts.map((conflict) => conflict.code)).toEqual(
      expect.arrayContaining([
        "ROOM_EXCLUSIVE_GROUP_CONFLICT",
        "ROOM_SHAPE_REQUIRED_CONFLICT",
      ]),
    );
  });

  it("does not blame a candidate for a pre-existing room conflict", () => {
    const assignedComponents = [
      component("circle", {
        strength: "required",
        shape: { required: "circle" },
      }),
      component("cross", {
        strength: "required",
        shape: { required: "cross" },
      }),
    ];
    const evaluation = evaluateDarkPlacesRoomCandidate({
      activeRegion: { id: "room-1", shape: "rect" },
      assignedComponents,
      candidateComponent: component("narrative-only"),
    });

    expect(evaluation.status).toBe("compatible");
    expect(evaluation.blocking).toBe(false);
  });

  it("blocks manual shape overrides that violate hard content requirements", () => {
    const evaluation = evaluateDarkPlacesRoomManualOverride({
      region: { id: "room-1", shape: "circle", size: "Medium" },
      assignedComponents: [
        component("round-sanctum", {
          strength: "required",
          shape: { required: "circle" },
        }),
      ],
      manualOverrides: {
        roomStyles: {
          "room-1": { shape: "circle", sizePreset: "Medium" },
        },
      },
      proposedPatch: { shape: "rect" },
    });

    expect(evaluation.allowed).toBe(false);
    expect(evaluation.reason).toContain("Manual room style");
  });

  it("lets manual edits replace the generated room archetype baseline", () => {
    const evaluation = evaluateDarkPlacesRoomManualOverride({
      region: {
        id: "room-1",
        shape: "shaft",
        size: "Medium",
        mapInfluence: {
          preferredRoomArchetypes: ["bone-well"],
          forceRoomArchetype: true,
        },
      },
      assignedComponents: [],
      proposedPatch: { shape: "rect" },
    });

    expect(evaluation.allowed).toBe(true);
    expect(evaluation.conflicts).toEqual([]);
    expect(evaluation.resolution.effectiveRoomDesign.shape.kind).toBe("rect");
  });

  it("is independent from the order of existing room components", () => {
    const assignedComponents = [
      component("large", {
        strength: "preferred",
        size: { minScale: "Large" },
      }),
      component("round", {
        strength: "preferred",
        shape: { preferred: ["circle"] },
      }),
    ];
    const input = {
      activeRegion: { id: "room-1", shape: "rect", size: "Medium" },
      candidateComponent: component("pillars", {
        strength: "preferred",
        modifiers: { preferred: ["pillared"] },
      }),
    };

    const forward = evaluateDarkPlacesRoomCandidate({
      ...input,
      assignedComponents,
    });
    const reverse = evaluateDarkPlacesRoomCandidate({
      ...input,
      assignedComponents: [...assignedComponents].reverse(),
    });

    expect(forward).toEqual(reverse);
  });
});
