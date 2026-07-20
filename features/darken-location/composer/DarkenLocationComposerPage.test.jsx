// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DarkenLocationComposerPage, {
  createGeneratedThemeProgramState,
  createInitialGeneratedLocationComposerState,
  createLocationWorkflowModeState,
} from "./DarkenLocationComposerPage.jsx";
import { createInitialLocationComposerState } from "./model/location-composer-state.js";
import { getRegionTemplatesForState } from "./model/location-composer-selectors.js";

describe("Dark Places live semantic map integration", () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      disconnect() {}
    };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    delete globalThis.ResizeObserver;
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  it("mounts the default Composer with the semantic request as the live map source", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warningSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      await act(async () => {
        root.render(<DarkenLocationComposerPage uiMode="simple" />);
      });
      const html = container.innerHTML;

      expect(html).toContain('data-location-map-handoff="semantic"');
      expect(html).toContain(
        'data-location-map-handoff-schema="cruor-dark-places-semantic-map-handoff-v1"',
      );
      expect(html).not.toContain("Semantic Handoff");
      expect(errorSpy).not.toHaveBeenCalled();
      expect(warningSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      warningSpy.mockRestore();
    }
  }, 10000);

  it("uses the generated default frame for the first visible map", () => {
    const initial = createInitialGeneratedLocationComposerState();
    const regenerated = createGeneratedThemeProgramState(initial);
    const projectRooms = (value) => value.locationRegions.map((region) => ({
      id: region.id,
      name: region.name,
      role: region.role,
      roomType: region.roomType,
      level: region.level,
    }));

    expect(projectRooms(initial)).toEqual(projectRooms(regenerated));
    expect(initial.activeRegionId).toBe("");
    expect(initial.activeSlotScope).toBe("map");
  });

  it("clears room selection in Frame and selects room 1 when entering Rooms", () => {
    const generated = createInitialGeneratedLocationComposerState();
    const selected = {
      ...generated,
      activeRegionId: generated.locationRegions[1]?.id || generated.locationRegions[0]?.id,
      activeSlotScope: "region",
      activeSlot: "hazard",
    };

    const frame = createLocationWorkflowModeState(selected, "theme");
    expect(frame.activeRegionId).toBe("");
    expect(frame.activeSlotScope).toBe("map");

    const rooms = createLocationWorkflowModeState(frame, "scratch");
    expect(rooms.activeRegionId).toBe(generated.locationRegions[0]?.id);
    expect(rooms.activeSlotScope).toBe("region");
  });

  it("regenerates the room program and clears stale assignments when the theme changes", () => {
    const initialRegions = getRegionTemplatesForState({
      context: "Crypt",
      sourceAnchors: ["Sedlec Ossuary"],
      horrors: ["Religious Horror"],
    });
    const initial = {
      ...createInitialLocationComposerState(initialRegions),
      selectedComponentIds: new Set(["places-clue-miscounted-skull-row"]),
      slotAssignments: {
        clue: [
          {
            componentId: "places-clue-miscounted-skull-row",
            slotId: "clue",
            scope: "region",
            regionId: "bone-lit-vestibule",
          },
        ],
      },
      lockedSlots: new Set(["clue"]),
    };

    const next = createGeneratedThemeProgramState(initial, {
      dungeonThemeId: "decomposition",
      sourceAnchors: ["Decomposition"],
      context: "Crypt",
    });

    expect(next.dungeonThemeId).toBe("decomposition");
    const roomNames = next.locationRegions.map((region) => region.name);
    expect(
      roomNames.some((name) =>
        [
          "Soft Floored Tunnel",
          "Gas Pocket",
          "Wet Archive",
          "Bloated Chamber",
          "Drainage Crypt",
        ].some((signature) => name.includes(signature)),
      ),
    ).toBe(true);
    expect(roomNames.every((name) => !/^\d+\s/.test(name))).toBe(true);
    expect(roomNames).not.toEqual(
      expect.arrayContaining([
        "Bone-Lit Vestibule",
        "Reliquary Threshold",
        "Bone Chandelier Nave",
      ]),
    );
    expect(next.slotAssignments).toEqual({});
    expect([...next.selectedComponentIds]).toEqual([]);
    expect([...next.lockedSlots]).toEqual([]);
    expect(next.activeRegionId).toBe("");
    expect(next.activeSlotScope).toBe("map");
    next.locationRegions.forEach((region) => {
      expect(region.sensoryLayer).toBe("");
      expect(region.feature).toBe("");
      expect(region.danger).toBe("");
      expect(region.clue).toBe("");
      expect(region.reward).toBe("");
      expect(region.encounter).toBe("");
    });
  });

  it("applies a Theme picker change to the live room program", async () => {
    let getSnapshot = null;
    await act(async () => {
      root.render(
        <DarkenLocationComposerPage
          uiMode="simple"
          onSnapshotProviderReady={(provider) => {
            getSnapshot = provider;
          }}
        />,
      );
    });
    const initialRoomNames = getSnapshot().locationRegions.map((region) => region.name);
    expect(initialRoomNames.length).toBeGreaterThan(0);
    expect(initialRoomNames).not.toContain("Bone-Lit Vestibule");

    expect(container.querySelector('[data-testid="dark-places-composer"]')?.dataset.locationMapRegenerationRevision)
      .toBe("0");

    const themeField = [...container.querySelectorAll(".location-choice-field")]
      .find((field) => field.textContent.includes("Theme"));
    const themeTrigger = themeField?.querySelector(".cruor-dropdown-trigger");
    await act(async () => themeTrigger.click());
    const decompositionOption = [...document.body.querySelectorAll('[role="option"]')]
      .find((option) => option.textContent.includes("Decomposition"));
    await act(async () => decompositionOption.click());

    expect(container.querySelector('[data-testid="dark-places-composer"]')?.dataset.locationMapRegenerationRevision)
      .toBe("1");
    expect(container.querySelector(".location-map-stage__center")?.dataset.mapTransitionPhase)
      .toBe("fade-out");

    const roomNames = getSnapshot().locationRegions.map((region) => region.name);
    expect(roomNames).not.toEqual(initialRoomNames);
    expect(roomNames.every((name) => !/^\d+\s/.test(name))).toBe(true);
    expect(
      [
        "Soft Floored Tunnel",
        "Gas Pocket",
        "Wet Archive",
        "Bloated Chamber",
        "Drainage Crypt",
      ].some((signature) => roomNames.some((name) => name.includes(signature))),
    ).toBe(true);
  }, 10000);
});
