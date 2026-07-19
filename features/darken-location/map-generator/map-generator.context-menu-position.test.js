import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveContextMenuCompoundSubmenuWidth,
  resolveContextMenuViewportLayout,
  resolveContextSubmenuMeasuredHeight,
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


  it("reserves horizontal space for two nested shape flyouts", () => {
    const layout = resolveContextMenuViewportLayout({
      anchorX: 740,
      anchorY: 120,
      menuWidth: 210,
      menuHeight: 320,
      submenuWidth: 428,
      viewportWidth: 900,
      viewportHeight: 800,
    });

    expect(layout.submenuSide).toBe("left");
    expect(layout.left).toBe(530);
  });

  it("reserves the nested shape column before the third flyout is mounted", () => {
    expect(
      resolveContextMenuCompoundSubmenuWidth({
        firstFlyoutWidth: 210,
        nestedFlyoutWidth: 0,
        reserveNestedFlyout: true,
      })
    ).toBe(428);
  });

  it("ignores nested overflow when measuring the shape-group flyout", () => {
    expect(
      resolveContextSubmenuMeasuredHeight({
        offsetHeight: 92,
        scrollHeight: 548,
        containsNestedFlyout: true,
      })
    ).toBe(92);
  });

  it("keeps scroll height for ordinary flyouts", () => {
    expect(
      resolveContextSubmenuMeasuredHeight({
        offsetHeight: 220,
        scrollHeight: 420,
      })
    ).toBe(420);
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

describe("shared map dropdown migration", () => {
  const root = process.cwd();
  const pageSource = readFileSync(
    resolve(root, "features/darken-location/map-generator/map-generator.page.jsx"),
    "utf8",
  );
  const stylesSource = readFileSync(
    resolve(root, "features/darken-location/map-generator/map-generator.styles.css"),
    "utf8",
  );
  const dropdownSource = readFileSync(
    resolve(root, "shared/styles/dropdowns.css"),
    "utf8",
  );

  it("renders Map Actions through the canonical context-menu family", () => {
    expect(pageSource).toContain(
      'className="location-map-toolbar__style-panel cruor-ui-panel-surface map-action-menu cruor-dropdown-menu cruor-dropdown-menu--context"',
    );
    expect(pageSource).not.toContain('className="room-context-menu map-action-menu"');
    expect(pageSource).toContain('aria-label="Map actions"');
  });

  it("uses the canonical dropdown family for room, wall, corridor, stair, and door menus", () => {
    [
      "wall-access-context-menu",
      "add-waypoint-context-menu",
      "waypoint-context-menu",
      "corridor-junction-context-menu",
      "stair-marker-context-menu",
      "door-context-menu",
    ].forEach((featureClass) => {
      expect(pageSource).toContain(
        `${featureClass} cruor-dropdown-menu cruor-dropdown-menu--context`,
      );
    });
    expect(pageSource).toContain('data-style-floating="portal"');
    expect(pageSource).toContain(
      "room-context-menu__trigger cruor-dropdown-option cruor-dropdown-option--legacy-text",
    );
    expect(stylesSource).toContain(
      ".room-context-menu:not(.cruor-dropdown-menu) button",
    );
    expect(stylesSource).toContain(
      ".room-context-menu.cruor-dropdown-menu",
    );
  });

  it("keeps generic portaled context menus at the canonical 210px root width", () => {
    expect(stylesSource).toContain("width: min(210px, calc(100vw - 24px))");
    expect(stylesSource).toContain("min-width: min(210px, calc(100vw - 24px))");
    expect(stylesSource).toContain("max-width: min(210px, calc(100vw - 24px))");
    expect(pageSource).not.toContain("getFixedContextMenuPosition(event, 270");
    expect(pageSource).not.toContain("getFixedContextMenuPosition(event, 250");
  });

  it("reserves chevrons for submenu triggers and checks for active selections", () => {
    expect(pageSource).toContain(
      '!active && "cruor-dropdown-option--no-trailing"',
    );
    expect(pageSource).toContain(
      '<i className="fa-solid fa-check cruor-dropdown-option__chevron" aria-hidden="true" />',
    );
    expect(pageSource).not.toContain(
      'active ? "fa-solid fa-check" : "fa-solid fa-chevron-right"',
    );
    expect(dropdownSource).toContain(
      '.cruor-dropdown-option:not([aria-haspopup="menu"]) > .cruor-dropdown-option__chevron.fa-chevron-right',
    );
  });

  it("renders More Map Tools through shared menu and option rows", () => {
    expect(pageSource).toContain(
      'className="location-map-toolbar__map-menu-panel cruor-ui-panel-surface cruor-dropdown-menu cruor-dropdown-menu--context"',
    );
    expect(pageSource).toContain(
      '"location-map-toolbar__map-menu-action cruor-dropdown-option"',
    );
    expect(stylesSource).toContain(
      ".location-map-toolbar__map-menu-panel:not(.cruor-dropdown-menu)",
    );
    expect(stylesSource).toContain(
      ".location-map-toolbar__map-menu-action:not(.cruor-dropdown-option)",
    );
  });
});
