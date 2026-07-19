import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readProjectFile(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function getFunctionSource(source, functionName, nextFunctionName) {
  const start = source.indexOf(`function ${functionName}(`);
  const end = source.indexOf(`\nfunction ${nextFunctionName}(`, start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("Map editor contextual actions", () => {
  const source = readProjectFile(
    "features/darken-location/map-generator/map-generator.page.jsx",
  );

  it("limits an existing waypoint menu to deletion", () => {
    const waypointMenu = getFunctionSource(
      source,
      "WaypointContextMenu",
      "CorridorTypeMenuSection",
    );

    expect(waypointMenu).toContain("Delete Waypoint");
    expect(waypointMenu).not.toContain("CorridorTypeMenuSection");
    expect(waypointMenu).not.toContain("JUNCTION_TYPE_OPTIONS");
    expect(waypointMenu).not.toContain(">Close<");
  });


  it("keeps useful titles while removing low-value technical metadata", () => {
    const roomMenu = getFunctionSource(
      source,
      "RoomStyleContextMenu",
      "WallAccessContextMenu",
    );
    const passageMenu = getFunctionSource(
      source,
      "WallAccessContextMenu",
      "AddWaypointContextMenu",
    );
    const addWaypointMenu = getFunctionSource(
      source,
      "AddWaypointContextMenu",
      "WaypointContextMenu",
    );
    const waypointMenu = getFunctionSource(
      source,
      "WaypointContextMenu",
      "CorridorTypeMenuSection",
    );

    expect(roomMenu).toContain('className="cruor-dropdown-header"');
    expect(roomMenu).toContain("{region.name}");
    expect(roomMenu).not.toContain("Content:");
    expect(roomMenu).not.toContain("requirementSummary");
    expect(passageMenu).not.toContain("cruor-dropdown-header__meta");
    expect(addWaypointMenu).not.toContain("cruor-dropdown-header__meta");
    expect(waypointMenu).not.toContain("cruor-dropdown-header__meta");
  });

  it("separates Add Waypoint from the Corridor Type subtitle", () => {
    const styles = readProjectFile(
      "features/darken-location/map-generator/map-generator.styles.css",
    );

    expect(styles).toContain(
      ".add-waypoint-context-menu .room-context-menu__body > .room-context-menu__trigger:first-child",
    );
    expect(styles).toContain("margin-bottom: 7px");
  });

  it("does not render Close actions in right-click menus", () => {
    const contextMenuSource = source.slice(
      source.indexOf("function RoomStyleContextMenu("),
      source.indexOf("function MapTestsModal("),
    );

    expect(contextMenuSource).not.toContain('label="Close"');
    expect(contextMenuSource).not.toMatch(/>\s*Close\s*</);
  });
});

describe("Map editor manual history", () => {
  const source = readProjectFile(
    "features/darken-location/map-generator/map-generator.page.jsx",
  );

  it("keeps Undo and Redo side effects outside React state updaters", () => {
    const undoSource = getFunctionSource(source, "undoManualEdit", "redoManualEdit");
    const redoSource = getFunctionSource(source, "redoManualEdit", "randomizeSeed");

    expect(undoSource).not.toContain("setManualHistory((history)");
    expect(redoSource).not.toContain("setManualHistory((history)");
    expect(undoSource).toContain("manualHistoryRef.current");
    expect(redoSource).toContain("manualHistoryRef.current");
    expect(undoSource).toContain("manualOverridesRef.current = previous");
    expect(redoSource).toContain("manualOverridesRef.current = next");
    expect(undoSource).toContain("pendingInlineManualCommitRef.current");
    expect(redoSource).toContain("pendingInlineManualCommitRef.current");
  });
});
