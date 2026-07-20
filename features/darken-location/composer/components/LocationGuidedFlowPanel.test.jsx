// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocationGuidedFlowPanel } from "./LocationGuidedFlowPanel.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const roomEntries = [
  {
    id: "room-1",
    numberLabel: "01",
    name: "Ossuary Threshold",
    completedSlots: ["hazard"],
    missingSlots: ["clue", "encounterTwist"],
    complete: false,
  },
];

describe("LocationGuidedFlowPanel", () => {
  let container;
  let root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.clear();
  });

  it("opens the exact missing slot through the page callback", () => {
    const onOpenRoomSlot = vi.fn();

    act(() => {
      root.render(
        <LocationGuidedFlowPanel
          activeRegion={{ id: "room-1", name: "Ossuary Threshold" }}
          builderMode="scratch"
          exportIncompleteCount={1}
          generatedMapPreview={{ regions: [] }}
          roomEntries={roomEntries}
          onOpenRoomSlot={onOpenRoomSlot}
        />,
      );
    });

    act(() => document.body.querySelector(".cruor-composer-build-guide__primary").click());

    expect(onOpenRoomSlot).toHaveBeenCalledWith("clue");
  });

  it("uses the existing generation callback while Frame is empty", () => {
    const onGenerateThemeRooms = vi.fn();

    act(() => {
      root.render(
        <LocationGuidedFlowPanel
          builderMode="theme"
          generatedMapPreview={null}
          roomEntries={[]}
          onGenerateThemeRooms={onGenerateThemeRooms}
        />,
      );
    });

    act(() => document.body.querySelector(".cruor-composer-build-guide__primary").click());

    expect(onGenerateThemeRooms).toHaveBeenCalledTimes(1);
  });
});
