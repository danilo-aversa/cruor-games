// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../map-generator/map-generator.page.jsx", () => ({
  CruorMapGeneratorMvp: ({ initialRequest, onComposerRegionHoverChange }) => (
    <button
      data-testid="mock-map-room"
      data-map-seed={initialRequest?.seed || ""}
      type="button"
      onMouseEnter={() => onComposerRegionHoverChange?.("room-1")}
      onMouseLeave={() => onComposerRegionHoverChange?.("")}
    >
      Room
    </button>
  ),
}));

import {
  LOCATION_MAP_FADE_IN_MS,
  LOCATION_MAP_FADE_OUT_MS,
  LOCATION_MAP_LOADING_HOLD_MS,
  LOCATION_ROOM_TOOLTIP_DELAY_MS,
  LocationMapStage,
} from "./LocationMapStage.jsx";
import { LocationRoomRecapCard } from "./LocationRoomRecapCard.jsx";

describe("LocationMapStage room tooltip", () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  it("waits before showing the room recap and hides it immediately on leave", () => {
    act(() => {
      root.render(
        <LocationMapStage
          state={{
            activeRegionId: "",
            activeSlot: "horrorPremise",
            activeSlotScope: "map",
            locationRegions: [
              {
                id: "room-1",
                name: "Wet Archive",
                role: "clue",
                size: "Medium",
              },
            ],
            slotAssignments: {},
          }}
          setState={() => {}}
          mapRequest={{
            source: "darken-location",
            requiredRegions: [],
            connections: [],
          }}
          generatedMapPreview={null}
        />,
      );
    });

    const room = container.querySelector('[data-testid="mock-map-room"]');
    act(() => {
      room.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });
    expect(container.querySelector(".location-room-recap-card")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(LOCATION_ROOM_TOOLTIP_DELAY_MS - 1);
    });
    expect(container.querySelector(".location-room-recap-card")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector(".location-room-recap-card")).not.toBeNull();

    act(() => {
      room.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
    });
    expect(container.querySelector(".location-room-recap-card")).toBeNull();
  });

  it("shows only explicitly assigned regional slots", () => {
    const html = renderToStaticMarkup(
      <LocationRoomRecapCard
        activeRegion={{
          id: "room-1",
          name: "Wet Archive",
          feature: "Random theme feature",
          danger: "Random theme danger",
        }}
        assignedComponents={[
          {
            title: "Unstable Rot Floor",
            summary: "The softened floor collapses under sudden weight.",
            assignment: { slotId: "hazard", regionId: "room-1" },
          },
        ]}
      />,
    );

    expect(html).toContain("Environmental Hazard");
    expect(html).toContain("The softened floor collapses under sudden weight.");
    expect(html).not.toContain("Random theme feature");
    expect(html).not.toContain("Random theme danger");
    expect(html).not.toContain("<dt>Feature</dt>");
    expect(html).not.toContain("<dt>Danger</dt>");
  });

  it("keeps the previous map through fade-out, then loads and fades in the replacement", () => {
    expect(LOCATION_MAP_LOADING_HOLD_MS).toBeGreaterThanOrEqual(1000);

    const state = {
      activeRegionId: "",
      activeSlot: "horrorPremise",
      activeSlotScope: "map",
      locationRegions: [],
      slotAssignments: {},
    };

    act(() => {
      root.render(
        <LocationMapStage
          state={state}
          setState={() => {}}
          mapRequest={{ seed: "old-seed", requiredRegions: [], connections: [] }}
          mapTransitionKey="topology-old"
          generatedMapPreview={null}
        />,
      );
    });

    act(() => {
      root.render(
        <LocationMapStage
          state={state}
          setState={() => {}}
          mapRequest={{ seed: "new-seed", requiredRegions: [], connections: [] }}
          mapTransitionKey="topology-new"
          generatedMapPreview={null}
        />,
      );
    });

    expect(container.querySelector(".location-map-stage__center").dataset.mapTransitionPhase)
      .toBe("fade-out");
    expect(container.querySelector('[data-testid="mock-map-room"]').dataset.mapSeed)
      .toBe("old-seed");

    act(() => {
      vi.advanceTimersByTime(LOCATION_MAP_FADE_OUT_MS);
    });
    expect(container.querySelector(".location-map-stage__center").dataset.mapTransitionPhase)
      .toBe("loading");
    expect(container.querySelector(".location-map-loading-screen.is-visible"))
      .not.toBeNull();
    expect(container.querySelector('[data-testid="mock-map-room"]').dataset.mapSeed)
      .toBe("old-seed");

    act(() => {
      vi.advanceTimersByTime(LOCATION_MAP_LOADING_HOLD_MS);
    });
    expect(container.querySelector(".location-map-stage__center").dataset.mapTransitionPhase)
      .toBe("fade-in");
    expect(container.querySelector('[data-testid="mock-map-room"]').dataset.mapSeed)
      .toBe("new-seed");

    act(() => {
      vi.advanceTimersByTime(LOCATION_MAP_FADE_IN_MS);
    });
    expect(container.querySelector(".location-map-stage__center").dataset.mapTransitionPhase)
      .toBe("idle");
    expect(container.querySelector(".location-map-loading-screen")).toBeNull();
  });
});
