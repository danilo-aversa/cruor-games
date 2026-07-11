import { describe, expect, it } from "vitest";
import { resolveRoomConstraints } from "./room-constraint-resolver.js";
import {
  ROOM_SHAPE_DEFINITIONS,
  ROOM_SHAPE_KIND_OPTIONS,
  getRoomShapeDefinition,
  getRoomShapeSupport,
  getSupportedRoomModifiersByShape,
  getSupportedRoomShapeKinds,
} from "./room-shapes.js";

const ENGINE_CAPABILITIES = {
  capabilities: [
    "supports-chamfered-corners",
    "supports-shape-circle",
    "supports-shape-rect",
  ],
  supportedShapes: getSupportedRoomShapeKinds(),
  supportedModifiers: ["chamfered-corners"],
  supportedModifiersByShape: getSupportedRoomModifiersByShape(),
};

describe("room shape capabilities", () => {
  it("registers every authored shape as a distinct supported engine shape", () => {
    expect(ROOM_SHAPE_DEFINITIONS).toHaveLength(18);
    expect(getSupportedRoomShapeKinds()).toEqual(ROOM_SHAPE_KIND_OPTIONS);
    ROOM_SHAPE_KIND_OPTIONS.forEach((kind) => {
      expect(getRoomShapeDefinition(kind)).toMatchObject({
        id: kind,
        support: "supported",
      });
      expect(getRoomShapeSupport(kind).status).toBe("supported");
    });
  });

  it("keeps Cave as the only temporarily disabled editor shape", () => {
    expect(
      ROOM_SHAPE_DEFINITIONS.filter(
        (definition) => definition.editorSelectable === false,
      ).map((definition) => definition.id),
    ).toEqual(["cave"]);
  });

  it("reports unknown shapes explicitly instead of degrading them", () => {
    expect(getRoomShapeSupport("impossible-star")).toEqual({
      kind: "impossible-star",
      status: "unsupported",
      reason: "The room shape is not registered by the shared contract.",
    });
  });

  it("reports unregistered authored shapes as unsupported constraints", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        {
          id: "impossible-room",
          roomDesign: { shape: { kind: "impossible-star" } },
        },
      ],
      engineCapabilities: ENGINE_CAPABILITIES,
    });

    expect(result.status).toBe("unsupported");
    expect(result.effectiveRoomDesign?.shape?.kind).toBeUndefined();
    expect(result.conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "ROOM_SHAPE_UNREGISTERED",
          shape: "impossible-star",
          unsupported: true,
        }),
      ]),
    );
  });

  it("rejects modifiers that the selected shape cannot render", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        {
          id: "circular-chamfer",
          roomDesign: {
            shape: {
              kind: "circle",
              modifiers: ["chamfered-corners"],
            },
          },
        },
      ],
      engineCapabilities: ENGINE_CAPABILITIES,
    });

    expect(result.status).toBe("unsupported");
    expect(result.conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "ROOM_SHAPE_MODIFIER_UNSUPPORTED",
          shape: "circle",
          modifier: "chamfered-corners",
          unsupported: true,
        }),
      ]),
    );
  });

  it("accepts the same modifier on a compatible shape", () => {
    const result = resolveRoomConstraints({
      assignedComponents: [
        {
          id: "rectangular-chamfer",
          roomDesign: {
            shape: {
              kind: "rect",
              modifiers: ["chamfered-corners"],
            },
          },
        },
      ],
      engineCapabilities: ENGINE_CAPABILITIES,
    });

    expect(result.status).not.toBe("unsupported");
    expect(result.conflicts).toEqual([]);
    expect(result.effectiveRoomDesign.shape).toEqual({
      kind: "rect",
      modifiers: ["chamfered-corners"],
    });
  });
});
