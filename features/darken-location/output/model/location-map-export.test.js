import { describe, expect, it } from "vitest";
import { LEVEL_VIEW_ALL } from "../../map-generator/map-generator.state.js";
import {
  applyLocationMapExportPreset,
  createDefaultLocationMapExportSettings,
  createLocationMapExportFilename,
  getLocationMapExportRenderOptions,
  getLocationMapExportViewBox,
  getLocationMapSerializationOptions,
  updateLocationMapExportSettings,
} from "./location-map-export.js";

const GENERATED_MAP = {
  config: {
    mapWidth: 1000,
    mapHeight: 640,
    gridSize: 20,
    showGrid: true,
    gridStyle: "solid",
  },
  contentBounds: { x: 100, y: 80, width: 600, height: 400 },
  regions: [
    {
      id: "room-ground",
      level: 0,
      cellRect: { x: 5, y: 4, w: 8, h: 6 },
      floorCells: [{ x: 5, y: 4 }, { x: 12, y: 9 }],
    },
    {
      id: "room-below",
      level: -1,
      cellRect: { x: 20, y: 15, w: 5, h: 4 },
      floorCells: [{ x: 20, y: 15 }, { x: 24, y: 18 }],
    },
  ],
  corridors: [],
};

describe("location map export model", () => {
  it("creates a GM default with content crop and authored layers", () => {
    const settings = createDefaultLocationMapExportSettings(GENERATED_MAP);
    expect(settings).toMatchObject({
      preset: "gm",
      format: "svg",
      crop: "content",
      levelView: LEVEL_VIEW_ALL,
      showGrid: true,
      showRoomNumbers: true,
      showProps: true,
      hideSecrets: false,
    });
    expect(getLocationMapExportViewBox(GENERATED_MAP, settings)).toEqual({
      x: 52,
      y: 32,
      width: 696,
      height: 496,
    });
  });

  it("applies player-safe and print presets without losing the selected file format", () => {
    const current = updateLocationMapExportSettings(
      createDefaultLocationMapExportSettings(GENERATED_MAP),
      { format: "png", pngScale: 4 },
      GENERATED_MAP,
    );
    const player = applyLocationMapExportPreset(current, "player", GENERATED_MAP);
    expect(player).toMatchObject({
      preset: "player",
      format: "png",
      pngScale: 4,
      hideSecrets: true,
      showRoomNumbers: false,
      showProps: false,
    });

    const print = applyLocationMapExportPreset(player, "print", GENERATED_MAP);
    expect(print).toMatchObject({
      preset: "print",
      format: "png",
      background: "white",
      palette: "print",
      showTexture: false,
      showGrid: false,
    });
  });

  it("uses full-canvas and level-specific content bounds deterministically", () => {
    const defaultSettings = createDefaultLocationMapExportSettings(GENERATED_MAP);
    expect(getLocationMapExportViewBox(GENERATED_MAP, { ...defaultSettings, crop: "canvas" })).toEqual({
      x: 0,
      y: 0,
      width: 1000,
      height: 640,
    });

    const levelOptions = getLocationMapExportRenderOptions(GENERATED_MAP, {
      ...defaultSettings,
      levelView: -1,
      padding: 24,
    });
    expect(levelOptions.levelView).toBe(-1);
    expect(levelOptions.viewBoxBounds).toEqual({
      x: 376,
      y: 276,
      width: 148,
      height: 128,
    });
  });

  it("maps visible settings to one serialization contract", () => {
    const options = getLocationMapSerializationOptions(GENERATED_MAP, {
      ...createDefaultLocationMapExportSettings(GENERATED_MAP),
      preset: "custom",
      showGrid: false,
      showRoomNumbers: false,
      showRoomNames: true,
      showProps: false,
      showHatching: false,
      showTexture: false,
      showStairArrows: false,
      hideSecrets: true,
      background: "transparent",
    });

    expect(options).toMatchObject({
      mode: "custom",
      removeGrid: true,
      removeRoomNumbers: true,
      removeRoomNames: false,
      removeProps: true,
      removeHatching: true,
      removeTexture: true,
      removeStairArrows: true,
      hideSecretDoors: true,
      hideSecretCorridorHints: true,
      backgroundMode: "transparent",
    });
  });

  it("creates stable filenames for preset and selected level", () => {
    expect(createLocationMapExportFilename("The Breathing Crypt", {
      preset: "player",
      format: "png",
      levelView: -2,
    })).toBe("the-breathing-crypt-player-map-level-minus-2.png");
  });
});
