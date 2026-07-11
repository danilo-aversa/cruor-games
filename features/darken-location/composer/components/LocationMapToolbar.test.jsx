// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocationMapToolbar } from "./LocationMapToolbar.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
      roomEntries={[{ id: "room-1", name: "Test Room", status: "ready" }]}
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
