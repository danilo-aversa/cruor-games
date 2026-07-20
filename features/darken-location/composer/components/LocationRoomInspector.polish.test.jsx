// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { LocationRoomInspector } from "./LocationRoomInspector.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createState() {
  return {
    activeRegionId: "room-1",
    activeSlot: "hazard",
    locationRegions: [
      {
        id: "room-1",
        name: "Reliquary Threshold",
        role: "entrance",
        roomType: "small hall",
        size: "Small",
        level: 0,
      },
    ],
    slotAssignments: {},
    selectedComponentIds: new Set(),
  };
}

describe("LocationRoomInspector polish", () => {
  it("uses the same hero and fact-card layout as the right information rail", () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => {
      root.render(<LocationRoomInspector state={createState()} />);
    });

    expect(container.querySelector('[data-composer-rail-variant="info"]')).toBeTruthy();
    expect(container.querySelector(".cruor-composer-rail-card--hero")?.textContent)
      .toContain("Selected Room");
    expect(container.querySelector('[aria-label="Selected room facts"] .cruor-composer-fact-grid'))
      .toBeTruthy();

    act(() => root.unmount());
  });

  it("does not attach redundant tooltips to the three self-explanatory room slots", () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => {
      root.render(
        <LocationRoomInspector
          activeSlot={{ id: "hazard" }}
          state={createState()}
        />,
      );
    });

    for (const slotId of ["hazard", "clue", "encounterTwist"]) {
      const slot = container.querySelector(`[data-room-slot-id="${slotId}"]`);
      expect(slot).toBeTruthy();
      expect(slot?.hasAttribute("data-tooltip")).toBe(false);
      expect(slot?.hasAttribute("data-key")).toBe(false);
    }

    act(() => root.unmount());
  });
});
