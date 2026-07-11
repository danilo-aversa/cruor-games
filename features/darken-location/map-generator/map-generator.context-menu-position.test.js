import { describe, expect, it } from "vitest";
import {
  resolveContextMenuViewportLayout,
  resolveContextSubmenuViewportLayout,
} from "./map-generator.context-menu-position.js";

describe("context menu viewport positioning", () => {
  it("opens below the pointer when the menu fits", () => {
    expect(
      resolveContextMenuViewportLayout({
        anchorX: 120,
        anchorY: 100,
        menuWidth: 260,
        menuHeight: 360,
        submenuWidth: 224,
        viewportWidth: 1280,
        viewportHeight: 900,
      }),
    ).toMatchObject({
      left: 120,
      top: 100,
      verticalPlacement: "below",
      submenuSide: "right",
      maxHeight: null,
      overflowY: "visible",
    });
  });

  it("opens above the pointer when the lower viewport is too short", () => {
    const layout = resolveContextMenuViewportLayout({
      anchorX: 200,
      anchorY: 780,
      menuWidth: 260,
      menuHeight: 360,
      submenuWidth: 224,
      viewportWidth: 1280,
      viewportHeight: 900,
    });

    expect(layout.verticalPlacement).toBe("above");
    expect(layout.top).toBe(420);
    expect(layout.top + 360).toBeLessThanOrEqual(780);
  });

  it("constrains and scrolls a menu taller than the viewport", () => {
    const layout = resolveContextMenuViewportLayout({
      anchorX: 200,
      anchorY: 300,
      menuWidth: 260,
      menuHeight: 900,
      submenuWidth: 224,
      viewportWidth: 1000,
      viewportHeight: 600,
    });

    expect(layout.verticalPlacement).toBe("constrained");
    expect(layout.top).toBe(8);
    expect(layout.maxHeight).toBe(584);
    expect(layout.overflowY).toBe("auto");
  });

  it("moves the compound menu to the left near the right viewport edge", () => {
    const layout = resolveContextMenuViewportLayout({
      anchorX: 1180,
      anchorY: 120,
      menuWidth: 260,
      menuHeight: 360,
      submenuWidth: 224,
      viewportWidth: 1280,
      viewportHeight: 900,
    });

    expect(layout.submenuSide).toBe("left");
    expect(layout.left).toBe(920);
  });

  it("shifts a tall submenu upward and enables internal scrolling", () => {
    const layout = resolveContextSubmenuViewportLayout({
      triggerTop: 720,
      submenuHeight: 640,
      viewportHeight: 900,
    });

    expect(layout.topOffset).toBe(-288);
    expect(layout.maxHeight).toBe(460);
    expect(layout.overflowY).toBe("auto");
  });
});
