import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocationComponentPickerModal } from "./LocationComponentPickerModal.jsx";

function component(id, roomDesign = null) {
  return {
    id,
    title: id,
    summary: `${id} summary`,
    slots: ["hazard"],
    ...(roomDesign ? { roomDesign } : {}),
  };
}

function renderPicker({
  assignedComponents = [],
  candidate,
  roomAssignedComponents = [],
}) {
  return renderToStaticMarkup(
    <LocationComponentPickerModal
      activeRegion={{
        id: "room-1",
        name: "Test Room",
        shape: "rect",
        size: "Medium",
      }}
      assignedComponents={assignedComponents}
      components={[candidate]}
      generatedRoom={{
        id: "room-1",
        sourceRegionId: "room-1",
        shape: "rect",
        size: "Medium",
      }}
      isSlotFull={false}
      onAddComponent={() => {}}
      onClose={() => {}}
      onRemoveComponent={() => {}}
      onReplaceComponent={() => {}}
      open
      roomAssignedComponents={roomAssignedComponents}
      selectedComponents={[]}
      slot={{ id: "hazard", label: "Hazard", max: 2, scope: "region" }}
      slotScope="region"
      state={{}}
    />,
  );
}

describe("LocationComponentPickerModal room compatibility", () => {
  it("disables an incompatible candidate and renders the concrete reason", () => {
    const html = renderPicker({
      roomAssignedComponents: [
        component("round-sanctum", {
          strength: "required",
          shape: { required: "circle" },
        }),
      ],
      candidate: component("cross-vault", {
        strength: "required",
        shape: { required: "cross" },
      }),
    });

    expect(html).toContain("Incompatible");
    expect(html).toContain("Required room shapes conflict");
    expect(html).toMatch(/dark-places-component-add[^>]*disabled/);
  });

  it("previews room transformations without disabling the Add action", () => {
    const html = renderPicker({
      candidate: component("burial-rotunda", {
        strength: "required",
        shape: { required: "circle" },
      }),
    });

    expect(html).toContain("Transforms Room");
    expect(html).toContain("Will change this room:");
    expect(html).not.toMatch(/dark-places-component-add[^>]*disabled/);
  });

  it("marks legacy fallback content with authoritative pack provenance", () => {
    const candidate = {
      ...component("legacy-hazard"),
      contentProvenance: {
        primaryPackId: "legacy-darken-location",
        primaryPackTitle: "Legacy Darken Location Content",
        hasCollision: true,
        isLegacy: false,
        isLegacyDerived: true,
      },
    };
    const html = renderPicker({ candidate });

    expect(html).toContain("Migrated legacy");
    expect(html).toContain('data-content-origin="legacy-migrated"');
    expect(html).toContain("Legacy Darken Location Content");
    expect(html).toContain("First pack wins");
  });

  it("exposes assigned components as an active Remove action", () => {
    const assigned = component("assigned-hazard");
    const html = renderPicker({
      assignedComponents: [assigned],
      candidate: assigned,
      roomAssignedComponents: [assigned],
    });

    expect(html).toContain("Remove assigned-hazard");
    expect(html).toContain("dark-places-component-remove");
    expect(html).not.toMatch(/dark-places-component-remove[^>]*disabled/);
  });
});
