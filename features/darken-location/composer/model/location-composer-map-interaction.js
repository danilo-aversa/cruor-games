export const LOCATION_MAP_SELECTION_ACTION = Object.freeze({
  IGNORE: "ignore",
  CLEAR_ROOM: "clear-room",
  OPEN_ROOM: "open-room",
});

export function resolveLocationMapSelectionAction(builderMode, regionId = "") {
  const normalizedRegionId = String(regionId || "").trim();

  if (normalizedRegionId) {
    return {
      type: LOCATION_MAP_SELECTION_ACTION.OPEN_ROOM,
      regionId: normalizedRegionId,
    };
  }

  if (builderMode === "scratch") {
    return {
      type: LOCATION_MAP_SELECTION_ACTION.CLEAR_ROOM,
      regionId: "",
    };
  }

  return {
    type: LOCATION_MAP_SELECTION_ACTION.IGNORE,
    regionId: "",
  };
}
