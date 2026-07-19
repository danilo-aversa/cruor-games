// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocationMapToolbar } from "./LocationMapToolbar.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const ROOM_ENTRIES = [
  { id: "room-1", name: "Test Room", status: "ready", roleLabel: "Entry" },
  { id: "room-2", name: "Second Room", status: "partial", roleLabel: "Core" },
];

function renderToolbar(props = {}) {
  return renderToStaticMarkup(
    <LocationMapToolbar
      activeRegion={{ id: "room-1", name: "Test Room" }}
      generatedMapPreview={{ regions: [] }}
      onGenerateThemeRooms={() => {}}
      onNewMapSeed={() => {}}
      onSelectNextRoom={() => {}}
      onSelectPreviousRoom={() => {}}
      onSelectRoom={() => {}}
      onToggleImmersiveMode={() => {}}
      roomEntries={ROOM_ENTRIES}
      {...props}
    />,
  );
}

describe("LocationMapToolbar immersive mode", () => {
  it.each(["theme", "scratch", "export"])(
    "renders the immersive toggle in %s mode",
    (builderMode) => {
      const html = renderToolbar({ builderMode });

      expect(html).toContain('data-testid="dark-places-immersive-mode"');
      expect(html).toContain('aria-label="Enter immersive mode"');
      expect(html).toContain('aria-pressed="false"');
      expect(html).toContain("fa-expand");
    },
  );

  it("renders the active exit state", () => {
    const html = renderToolbar({ immersiveMode: true });

    expect(html).toContain('aria-label="Exit immersive mode"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("fa-compress");
    expect(html).toContain("is-active");
  });

  it("calls the immersive toggle handler", () => {
    const onToggleImmersiveMode = vi.fn();
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => {
      root.render(
        <LocationMapToolbar
          builderMode="theme"
          onToggleImmersiveMode={onToggleImmersiveMode}
        />,
      );
    });

    act(() => {
      container
        .querySelector('[data-testid="dark-places-immersive-mode"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onToggleImmersiveMode).toHaveBeenCalledTimes(1);

    act(() => root.unmount());
  });
});

describe("LocationMapToolbar room target", () => {
  it("shows Select Room when no room is actually selected", () => {
    const html = renderToolbar({
      builderMode: "scratch",
      canGoNextRoom: false,
      canGoPreviousRoom: false,
    });

    expect(html).toContain("Select Room");
    expect(html).not.toContain(">Test Room</strong>");
  });

  it("shows the selected room when navigation confirms an active index", () => {
    const html = renderToolbar({
      builderMode: "scratch",
      canGoNextRoom: true,
      canGoPreviousRoom: false,
    });

    expect(html).toContain(">Test Room</strong>");
  });

  it("uses the canonical dropdown family for the room list", () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => {
      root.render(
        <LocationMapToolbar
          activeRegion={{ id: "room-1", name: "Test Room" }}
          builderMode="scratch"
          canGoNextRoom
          roomEntries={ROOM_ENTRIES}
          onSelectRoom={() => {}}
          onToggleImmersiveMode={() => {}}
        />,
      );
    });

    act(() => {
      container
        .querySelector('.location-map-toolbar__target-button')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const menu = document.body.querySelector(
      ".location-map-toolbar__room-menu-panel.cruor-dropdown-menu",
    );

    expect(menu).toBeTruthy();
    expect(menu?.parentElement).toBe(document.body);
    expect(menu?.classList.contains("cruor-dropdown-menu--context")).toBe(true);
    expect(menu?.classList.contains("cruor-dropdown-menu--listbox")).toBe(false);
    expect(menu?.getAttribute("data-style-floating")).toBe("portal");
    expect(menu?.querySelectorAll(".location-map-toolbar__room-menu-item.cruor-dropdown-option")).toHaveLength(2);
    expect(menu?.querySelector(".location-map-toolbar__room-menu-item")?.children).toHaveLength(3);
    expect(menu?.querySelector(".location-map-toolbar__room-menu-number.cruor-dropdown-option__icon")).toBeFalsy();
    expect(menu?.querySelector(".location-map-toolbar__room-menu-copy .cruor-dropdown-option__label")).toBeFalsy();
    expect(menu?.querySelector(".location-map-toolbar__room-menu-status.cruor-dropdown-option__meta")).toBeFalsy();
    expect(menu?.querySelector(".cruor-dropdown-header")).toBeFalsy();
    expect(menu?.textContent).not.toContain("Rooms");
    expect(menu?.textContent).not.toContain("2 rooms");

    act(() => root.unmount());
  });
});
