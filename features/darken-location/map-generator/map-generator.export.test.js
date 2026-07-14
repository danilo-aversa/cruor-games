// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { serializeSvg } from "./map-generator.export.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function append(parent, tagName, className = "") {
  const node = document.createElementNS(SVG_NS, tagName);
  if (className) node.setAttribute("class", className);
  parent.appendChild(node);
  return node;
}

function createFixtureSvg() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 1000 640");
  append(svg, "defs");
  append(svg, "rect", "paper");
  append(svg, "rect", "paper-texture");
  append(svg, "g", "map-grid");
  append(svg, "g", "floor-grid");
  append(svg, "g", "props");
  append(svg, "g", "external-hatching");
  append(svg, "g", "external-hatching-underlay");
  append(svg, "g", "stair-mark__arrow");
  const labels = append(svg, "g", "labels");
  append(labels, "rect", "room-number-badge");
  append(labels, "text", "room-number");
  append(labels, "text", "room-name");
  append(svg, "path", "secret-door-opening");
  append(svg, "g", "corridor-type-secret");
  append(svg, "g", "room-preview-hotspots");
  return svg;
}

describe("serializeSvg map export profiles", () => {
  it("removes transient and disabled layers through the unified serializer", () => {
    const serialized = serializeSvg(createFixtureSvg(), {
      mode: "player",
      viewBox: "10 20 300 200",
      hideSecretDoors: true,
      hideSecretCorridorHints: true,
      removeGrid: true,
      removeTexture: true,
      removeProps: true,
      removeRoomNumbers: true,
      removeRoomNames: false,
      removeHatching: true,
      removeStairArrows: true,
      backgroundMode: "transparent",
    });

    expect(serialized).toContain('viewBox="10 20 300 200"');
    expect(serialized).toContain('data-export-mode="player"');
    expect(serialized).toContain('data-export-player-safe="true"');
    expect(serialized).not.toContain("room-preview-hotspots");
    expect(serialized).not.toContain("map-grid");
    expect(serialized).not.toContain("floor-grid");
    expect(serialized).not.toContain("paper-texture");
    expect(serialized).not.toContain('class="paper"');
    expect(serialized).not.toContain('class="props"');
    expect(serialized).not.toContain("room-number-badge");
    expect(serialized).not.toContain('class="room-number"');
    expect(serialized).toContain('class="room-name"');
    expect(serialized).not.toContain("secret-door-opening");
    expect(serialized).not.toContain("corridor-type-secret");
  });

  it("embeds a printer-friendly palette in print exports", () => {
    const serialized = serializeSvg(createFixtureSvg(), {
      mode: "print",
      backgroundMode: "white",
      removeTexture: true,
    });

    expect(serialized).toContain('data-export-background="white"');
    expect(serialized).toContain('data-export-print-palette="true"');
    expect(serialized).toContain("fill:#fff!important");
  });
});
