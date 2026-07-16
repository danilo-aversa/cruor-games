import { describe, expect, it } from "vitest";
import {
  LOCATION_MAP_SELECTION_ACTION,
  resolveLocationMapSelectionAction,
} from "./location-composer-map-interaction.js";

describe("resolveLocationMapSelectionAction", () => {
  it("ignores empty map clicks while Frame is active", () => {
    expect(resolveLocationMapSelectionAction("theme", "")).toEqual({
      type: LOCATION_MAP_SELECTION_ACTION.IGNORE,
      regionId: "",
    });
  });

  it("clears the active room on empty map clicks while Rooms is active", () => {
    expect(resolveLocationMapSelectionAction("scratch", "")).toEqual({
      type: LOCATION_MAP_SELECTION_ACTION.CLEAR_ROOM,
      regionId: "",
    });
  });

  it("opens Rooms when an actual room is selected from the map", () => {
    expect(resolveLocationMapSelectionAction("theme", " room-a ")).toEqual({
      type: LOCATION_MAP_SELECTION_ACTION.OPEN_ROOM,
      regionId: "room-a",
    });
  });
});
