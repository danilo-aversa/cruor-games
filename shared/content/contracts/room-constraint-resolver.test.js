import { describe, expect, it } from "vitest";
import {
  collectRoomContributions,
  evaluateRoomComponentCandidate,
  formatRoomConflictReason,
  normalizeRoomContribution,
  resolveEffectiveRoomProgram,
  resolveRoomConstraints,
} from "./room-constraint-resolver.js";

function component(id, roomDesign, extra = {}) {
  return { id, title: id, roomDesign, ...extra };
}

function conflictCodes(result) {
  return result.conflicts.map((conflict) => conflict.code);
}

function warningCodes(result) {
  return result.warnings.map((warning) => warning.code);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value))
    return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

describe("room constraint resolver", () => {
  it("returns an empty compatible program when no source contributes room metadata", () => {
    expect(resolveRoomConstraints({})).toMatchObject({
      status: "compatible",
      effectiveRoomDesign: null,
      conflicts: [],
      warnings: [],
      changes: [],
      provenance: {},
    });
  });

  it("normalizes legacy and v1 contribution syntax into the same atomic vocabulary", () => {
    const legacy = normalizeRoomContribution(
      component("legacy", {
        strength: "required",
        shape: { kind: "Round", modifiers: ["columns"] },
        size: { scale: "Large", minW: 6 },
      }),
      { sourceType: "assigned-component" },
    );
    const current = normalizeRoomContribution(
      component("current", {
        strength: "required",
        shape: { required: "circle" },
        size: { minScale: "Large", maxScale: "Large", minWidthCells: 6 },
        modifiers: { required: ["pillared"] },
      }),
      { sourceType: "assigned-component" },
    );

    expect(legacy.shape.required).toEqual(["circle"]);
    expect(legacy.size).toMatchObject({
      minScale: "Large",
      maxScale: "Large",
      minWidthCells: 6,
    });
    expect(legacy.modifiers.required).toEqual(["pillared"]);
    expect(current.shape.required).toEqual(legacy.shape.required);
    expect(current.size).toMatchObject({
      minScale: "Large",
      maxScale: "Large",
      minWidthCells: 6,
    });
    expect(current.modifiers.required).toEqual(["pillared"]);
  });

  it("is deterministic and independent from assigned component order", () => {
    const assignedComponents = [
      component("circle-a", {
        strength: "preferred",
        shape: { preferred: ["circle", "oval"] },
        weight: 4,
      }),
      component("circle-b", {
        strength: "preferred",
        shape: { preferred: ["circle"] },
        weight: 5,
      }),
      component("oval", {
        strength: "preferred",
        shape: { preferred: ["oval"] },
        weight: 2,
      }),
    ];

    const forward = resolveRoomConstraints({ assignedComponents });
    const reverse = resolveRoomConstraints({
      assignedComponents: [...assignedComponents].reverse(),
    });

    expect(forward).toEqual(reverse);
    expect(forward.effectiveRoomDesign.shape.kind).toBe("circle");
  });

  it("reports incompatible forced shapes with a stable reason code", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        component("circle", {
          strength: "required",
          shape: { required: "circle" },
        }),
        component("cross", {
          strength: "required",
          shape: { required: "cross" },
        }),
      ],
    });

    expect(result.status).toBe("incompatible");
    expect(conflictCodes(result)).toContain("ROOM_SHAPE_REQUIRED_CONFLICT");
    expect(result.conflicts[0].sources).toEqual(["circle", "cross"]);
  });

  it("reports a forbidden-shape conflict when every allowed shape is removed", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        component("allowed", {
          strength: "required",
          shape: { allowed: ["circle"] },
        }),
        component("forbidden", {
          strength: "required",
          shape: { forbidden: ["circle"] },
        }),
      ],
    });

    expect(result.status).toBe("incompatible");
    expect(conflictCodes(result)).toContain("ROOM_SHAPE_FORBIDDEN");
  });

  it("intersects scale, dimension, and area ranges", () => {
    const scale = resolveRoomConstraints({
      assignedComponents: [
        component("large", {
          strength: "required",
          size: { minScale: "Large" },
        }),
        component("small", {
          strength: "required",
          size: { maxScale: "Small" },
        }),
      ],
    });
    const width = resolveRoomConstraints({
      assignedComponents: [
        component("wide", {
          strength: "required",
          size: { minWidthCells: 9 },
        }),
        component("narrow", {
          strength: "required",
          size: { maxWidthCells: 6 },
        }),
      ],
    });
    const area = resolveRoomConstraints({
      assignedComponents: [
        component("large-area", {
          strength: "required",
          size: { minAreaCells: 50 },
        }),
        component("small-area", {
          strength: "required",
          size: { maxAreaCells: 30 },
        }),
      ],
    });

    expect(conflictCodes(scale)).toContain("ROOM_SIZE_RANGE_EMPTY");
    expect(conflictCodes(width)).toContain("ROOM_SIZE_RANGE_EMPTY");
    expect(conflictCodes(area)).toContain("ROOM_AREA_RANGE_EMPTY");
  });

  it("unions compatible modifiers and blocks required-versus-forbidden modifiers", () => {
    const compatible = resolveRoomConstraints({
      assignedComponents: [
        component("void", {
          strength: "required",
          modifiers: { required: ["central-void"] },
        }),
        component("pillars", {
          strength: "preferred",
          modifiers: { preferred: ["pillared"] },
        }),
      ],
    });
    const conflict = resolveRoomConstraints({
      assignedComponents: [
        component("partition", {
          strength: "required",
          modifiers: { required: ["partitioned"] },
        }),
        component("open", {
          strength: "required",
          modifiers: { forbidden: ["partitioned"] },
        }),
      ],
    });

    expect(compatible.effectiveRoomDesign.shape.modifiers).toEqual([
      "central-void",
      "pillared",
    ]);
    expect(conflictCodes(conflict)).toContain("ROOM_MODIFIER_CONFLICT");
  });

  it("chooses one soft modifier from an exclusive modifier group deterministically", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        component("symmetry", {
          strength: "preferred",
          modifiers: { preferred: ["symmetrical"] },
          weight: 2,
        }),
        component("asymmetry", {
          strength: "preferred",
          modifiers: { preferred: ["asymmetrical"] },
          weight: 5,
        }),
      ],
    });

    expect(result.effectiveRoomDesign.shape.modifiers).toEqual([
      "asymmetrical",
    ]);
  });

  it("reports topology conflicts for connector ranges and required booleans", () => {
    const connectors = resolveRoomConstraints({
      assignedComponents: [
        component("hub", {
          strength: "required",
          topology: { connectors: { min: 4 } },
        }),
        component("terminal", {
          strength: "required",
          topology: { connectors: { max: 1 } },
        }),
      ],
    });
    const secret = resolveRoomConstraints({
      assignedComponents: [
        component("secret", {
          strength: "required",
          topology: { secret: { required: true } },
        }),
        component("public", {
          strength: "required",
          topology: { secret: { required: false } },
        }),
      ],
    });

    expect(conflictCodes(connectors)).toContain("ROOM_TOPOLOGY_CONFLICT");
    expect(conflictCodes(secret)).toContain("ROOM_TOPOLOGY_CONFLICT");
  });

  it("reports exclusive groups and exposes replace candidates without removing them", () => {
    const result = evaluateRoomComponentCandidate({
      assignedComponents: [
        component(
          "existing-hazard",
          {},
          {
            roomCompatibility: {
              exclusiveGroups: ["central-hazard"],
              conflictPolicy: "block",
            },
          },
        ),
      ],
      candidateComponent: component(
        "candidate-hazard",
        {},
        {
          roomCompatibility: {
            exclusiveGroups: ["central-hazard"],
            conflictPolicy: "replace",
          },
        },
      ),
    });

    const conflict = result.conflicts.find(
      (item) => item.code === "ROOM_EXCLUSIVE_GROUP_CONFLICT",
    );
    expect(result.status).toBe("incompatible");
    expect(conflict).toMatchObject({
      conflictPolicy: "replace",
      replacementSources: ["existing-hazard"],
    });
  });

  it("enforces required and forbidden component tags", () => {
    const missing = resolveRoomConstraints({
      assignedComponents: [
        component(
          "needs-water",
          {},
          {
            roomCompatibility: {
              requiresComponentTags: ["room:flooded"],
            },
          },
        ),
      ],
    });
    const forbidden = resolveRoomConstraints({
      assignedComponents: [
        component("archive", {}, { tags: ["room:sealed-archive"] }),
        component(
          "hazard",
          {},
          {
            roomCompatibility: {
              forbidsComponentTags: ["room:sealed-archive"],
            },
          },
        ),
      ],
    });

    expect(conflictCodes(missing)).toContain(
      "ROOM_REQUIRED_COMPONENT_TAG_MISSING",
    );
    expect(conflictCodes(forbidden)).toContain(
      "ROOM_FORBIDDEN_COMPONENT_TAG_PRESENT",
    );
  });

  it("returns unsupported when engine capabilities cannot realize the solution", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        component(
          "void",
          {
            strength: "required",
            shape: { required: "circle" },
            modifiers: { required: ["central-void"] },
          },
          {
            roomCompatibility: {
              requiresCapabilities: ["supports-central-void"],
            },
          },
        ),
      ],
      engineCapabilities: {
        capabilities: [],
        supportedShapes: ["rect"],
        supportedModifiers: [],
      },
    });

    expect(result.status).toBe("unsupported");
    expect(conflictCodes(result)).toContain("ROOM_REQUIRED_CAPABILITY_MISSING");
  });

  it("reports forbidden engine capabilities through compatibility policy", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        component(
          "dry-room",
          {},
          {
            roomCompatibility: {
              forbidsCapabilities: ["supports-flooding"],
            },
          },
        ),
      ],
      engineCapabilities: { capabilities: ["supports-flooding"] },
    });

    expect(conflictCodes(result)).toContain(
      "ROOM_FORBIDDEN_CAPABILITY_PRESENT",
    );
  });

  it("detects forced archetype conflicts and compiles a valid forced archetype", () => {
    const conflict = resolveRoomConstraints({
      assignedComponents: [
        component(
          "well",
          {},
          {
            mapInfluence: {
              preferredRoomArchetypes: ["bone-well"],
              forceRoomArchetype: true,
            },
          },
        ),
        component(
          "archive",
          {},
          {
            mapInfluence: {
              preferredRoomArchetypes: ["hidden-reliquary"],
              forceRoomArchetype: true,
            },
          },
        ),
      ],
    });
    const valid = resolveRoomConstraints({
      assignedComponents: [
        component(
          "well",
          {},
          {
            mapInfluence: {
              preferredRoomArchetypes: ["bone-well"],
              forceRoomArchetype: true,
            },
          },
        ),
      ],
    });

    expect(conflictCodes(conflict)).toContain("ROOM_ARCHETYPE_CONFLICT");
    expect(valid.effectiveRoomDesign).toMatchObject({
      presetId: "bone-well",
      shape: { kind: "shaft" },
      maskProfile: "bone-well",
      detailProfile: "bone-well",
    });
  });

  it("lets hard content beat an incompatible manual override and records the warning", () => {
    const result = resolveRoomConstraints({
      baseRegion: component("room", {
        shape: { kind: "rect" },
        size: { scale: "Medium" },
      }),
      assignedComponents: [
        component("required", {
          strength: "required",
          shape: { required: "circle" },
          size: { minScale: "Large" },
        }),
      ],
      manualOverrides: component("manual", {
        shape: { kind: "l-shape" },
        size: { scale: "Small" },
      }),
    });

    expect(result.status).toBe("warning");
    expect(result.effectiveRoomDesign).toMatchObject({
      shape: { kind: "circle" },
      size: { scale: "Large" },
    });
    expect(warningCodes(result)).toEqual([
      "ROOM_MANUAL_OVERRIDE_CONFLICT",
      "ROOM_MANUAL_OVERRIDE_CONFLICT",
    ]);
    expect(result.changes.map((change) => change.field)).toEqual([
      "shape.kind",
      "size.scale",
    ]);
  });

  it("deduplicates required props and reports declared prop capacity", () => {
    const sharedProp = {
      kind: "pit",
      placement: "center",
      exclusivePlacementGroup: "room-center",
    };
    const result = resolveRoomConstraints({
      assignedComponents: [
        component("pit-a", { props: { required: [sharedProp] } }),
        component("pit-b", { props: { required: [sharedProp] } }),
        component("altar", {
          props: {
            required: [
              {
                kind: "altar",
                placement: "center",
                exclusivePlacementGroup: "room-center",
              },
            ],
          },
        }),
      ],
      engineCapabilities: {
        maxRequiredProps: 1,
        maxPropsByExclusiveGroup: { "room-center": 1 },
      },
    });

    expect(result.effectiveRoomDesign.props.required).toHaveLength(2);
    expect(conflictCodes(result)).toContain("ROOM_PROP_CAPACITY_EXCEEDED");
  });

  it("records field-level provenance for selected values", () => {
    const result = resolveEffectiveRoomProgram({
      assignedComponents: [
        component("hazard", {
          strength: "required",
          shape: { required: "circle" },
          size: { minScale: "Large" },
          modifiers: { required: ["central-void"] },
        }),
      ],
    });

    expect(result.provenance["shape.kind"][0]).toMatchObject({
      sourceId: "hazard",
      sourceType: "assigned-component",
      strength: "hard",
      value: "circle",
    });
    expect(result.provenance["size.scale"][0].sourceId).toBe("hazard");
    expect(result.provenance["modifiers.central-void"][0].sourceId).toBe(
      "hazard",
    );
  });

  it("does not mutate frozen inputs", () => {
    const input = deepFreeze({
      baseRegion: component("room", { shape: { kind: "rect" } }),
      assignedComponents: [
        component("hazard", {
          strength: "required",
          shape: { required: "circle" },
        }),
      ],
    });

    expect(() => resolveRoomConstraints(input)).not.toThrow();
    expect(input.baseRegion.roomDesign.shape.kind).toBe("rect");
  });

  it("collects source types in documented precedence order and formats reasons", () => {
    const contributions = collectRoomContributions({
      baseRegion: component("base", { shape: { kind: "rect" } }),
      roomTemplate: component("template", { shape: { required: "circle" } }),
      assignedComponents: [
        component("component", { modifiers: { required: ["pillared"] } }),
      ],
      manualOverrides: component("manual", { shape: { kind: "circle" } }),
    });

    expect(contributions.map((item) => item.sourceType)).toEqual([
      "manual-override",
      "assigned-component",
      "room-template",
      "base-region",
    ]);
    expect(
      formatRoomConflictReason({ code: "ROOM_SIZE_RANGE_EMPTY" }),
    ).toContain("size constraints");
  });
});
