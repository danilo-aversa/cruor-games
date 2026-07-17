import { mkdir, writeFile } from "node:fs/promises";
import { DEFAULT_CONFIG } from "../features/darken-location/map-generator/map-generator.input.js";
import { generateMap } from "../features/darken-location/map-generator/map-generator.pipeline.js";
import {
  ROOM_DESIGN_SCHEMA_VERSION,
  getEngineShapeFromRoomDesignKind,
  normalizeRoomDesign,
} from "../features/darken-location/map-generator/map-generator.room-design.js";

const OUTPUT_DIR = new URL("../dist/qa/", import.meta.url);
const HTML_OUTPUT = new URL("room-design-gallery.html", OUTPUT_DIR);
const MD_OUTPUT = new URL("room-design-gallery.md", OUTPUT_DIR);
const JSON_OUTPUT = new URL("room-design-gallery-report.json", OUTPUT_DIR);

const ROOM_DESIGN_CASES = Object.freeze([
  {
    id: "rect-basic",
    title: "Rect Room",
    group: "Base Shapes",
    summary: "Plain rectangular room with minimum area constraint.",
    role: "Side Room",
    size: "Small",
    roomDesign: {
      shape: { kind: "rect" },
      size: { minAreaCells: 12 },
    },
  },
  {
    id: "square-basic",
    title: "Square Room",
    group: "Base Shapes",
    summary: "Dedicated square footprint with equal width and height.",
    role: "Side Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "square" },
      size: { minWidthCells: 6, minHeightCells: 6, aspectRatio: "square" },
    },
  },
  {
    id: "circle-well",
    title: "Circular Room + Well",
    group: "Base Shapes",
    summary: "Circular room with a required central well/pit prop.",
    role: "Clue Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "circle" },
      size: { minDiameterCells: 7, aspectRatio: "square" },
      props: { required: [{ kind: "well", placement: "center", minRadiusCells: 2 }] },
    },
    expectedRequiredProps: ["pit"],
  },
  {
    id: "oval-room",
    title: "Oval Room",
    group: "Base Shapes",
    summary: "Oval/rounded chamber with wide proportions.",
    role: "Setpiece Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "oval" },
      size: { minWidthCells: 9, minHeightCells: 5, aspectRatio: "wide" },
    },
  },
  {
    id: "shaft-shrine",
    title: "Shaft Room + Altar",
    group: "Base Shapes",
    summary: "Shaft/vertical room with a required far-wall altar.",
    role: "Setpiece Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "shaft" },
      size: { minDiameterCells: 6, aspectRatio: "square" },
      props: { required: [{ kind: "altar", placement: "far-wall" }] },
    },
    expectedRequiredProps: ["altar"],
  },
  {
    id: "l-shape-workroom",
    title: "L-Shaped Room",
    group: "Base Shapes",
    summary: "L-shaped room using the existing L-shape mask primitive.",
    role: "Hazard Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "l-shape" },
      size: { minWidthCells: 8, minHeightCells: 6, minAreaCells: 28 },
    },
  },
  {
    id: "hall-wide",
    title: "Hall / Corridor",
    group: "Linear Shapes",
    summary: "Wide hall constrained by minimum width and wide aspect ratio.",
    role: "Connector",
    size: "Medium",
    roomDesign: {
      shape: { kind: "hall" },
      size: { minWidthCells: 10, aspectRatio: "wide" },
    },
  },
  {
    id: "gallery-alcoves",
    title: "Gallery + Side Alcoves",
    group: "Linear Shapes",
    summary: "Dedicated long gallery footprint with alternating wall bays and side alcoves.",
    role: "Connector",
    size: "Medium",
    roomDesign: {
      shape: { kind: "gallery", modifiers: ["side-alcoves"] },
      size: { minWidthCells: 10, aspectRatio: "wide" },
    },
    expectedModifiers: ["side-alcoves"],
  },
  {
    id: "niche-reliquary",
    title: "Niche + Reliquary",
    group: "Small Rooms",
    summary: "Dedicated recessed niche footprint with a narrow entrance and reliquary prop.",
    role: "Clue Room",
    size: "Small",
    roomDesign: {
      shape: { kind: "niche" },
      size: { minWidthCells: 4, minHeightCells: 4, minAreaCells: 14 },
      props: { required: [{ kind: "reliquary", placement: "center" }] },
    },
    expectedRequiredProps: ["altar"],
  },
  {
    id: "t-shape-junction",
    title: "T-Shaped Junction",
    group: "Composite Shapes",
    summary: "True T-shaped footprint with a full cap and centered stem.",
    role: "Connector",
    size: "Large",
    roomDesign: {
      shape: { kind: "t-shape" },
      size: { minWidthCells: 7, minHeightCells: 7, minAreaCells: 28 },
    },
  },
  {
    id: "cross-sanctum",
    title: "Cross-Shaped Sanctum",
    group: "Composite Shapes",
    summary: "True cross footprint with four distinct arms around a central core.",
    role: "Setpiece Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "cross" },
      size: { minWidthCells: 7, minHeightCells: 7, minAreaCells: 30 },
    },
  },
  {
    id: "apse-shrine",
    title: "Apse Shrine",
    group: "Special Shapes",
    summary: "Dedicated apse footprint with a tapered sacred end.",
    role: "Clue Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "apse" },
      size: { minWidthCells: 7, minHeightCells: 6, minAreaCells: 24 },
      props: { required: [{ kind: "altar", placement: "far-wall" }] },
    },
    expectedRequiredProps: ["altar"],
  },
  {
    id: "ritual-octagon",
    title: "Ritual Chamber",
    group: "Special Shapes",
    summary: "Dedicated square-constrained ritual footprint with clipped corners.",
    role: "Setpiece Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "ritual" },
      size: { minDiameterCells: 7, aspectRatio: "square", minAreaCells: 36 },
    },
  },
  {
    id: "alcove-altar",
    title: "Alcove + Altar",
    group: "Small Rooms",
    summary: "Direct alcove primitive with a required far-wall altar.",
    role: "Clue Room",
    size: "Small",
    roomDesign: {
      shape: { kind: "alcove" },
      size: { minWidthCells: 5, minHeightCells: 4 },
      props: { required: [{ kind: "altar", placement: "far-wall" }] },
    },
    expectedRequiredProps: ["altar"],
  },
  {
    id: "archive-shelves",
    title: "Archive + Shelves",
    group: "Special Shapes",
    summary: "Archive primitive with required shelf props.",
    role: "Archive / Lore Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "archive" },
      size: { minWidthCells: 6, minHeightCells: 5, minAreaCells: 24 },
      props: { required: [{ kind: "shelf", placement: "near-wall" }] },
    },
    expectedRequiredProps: ["shelf"],
  },
  {
    id: "irregular-vault",
    title: "Irregular Room",
    group: "Organic / Broken Shapes",
    summary: "Structured irregular footprint assembled from connected orthogonal wings.",
    role: "Hazard Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "irregular" },
      size: { minAreaCells: 22 },
    },
  },
  {
    id: "cave-room",
    title: "Cave / Organic Room",
    group: "Organic / Broken Shapes",
    summary: "Cave primitive for organic room silhouettes.",
    role: "Hazard Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "cave" },
      size: { minAreaCells: 22 },
    },
  },
  {
    id: "broken-room",
    title: "Broken Room",
    group: "Organic / Broken Shapes",
    summary: "Broken shape primitive for damaged structured rooms.",
    role: "Hazard Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "broken" },
      size: { minAreaCells: 16 },
    },
  },
  {
    id: "central-void-room",
    title: "Central Void Modifier",
    group: "Modifiers",
    summary: "Rect room with central-void modifier generating a central pit/void.",
    role: "Setpiece Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "rect", modifiers: ["central-void"] },
      size: { minWidthCells: 7, minHeightCells: 6, minAreaCells: 30 },
    },
    expectedModifiers: ["central-void"],
  },
  {
    id: "pillared-chamber",
    title: "Pillared Chamber",
    group: "Modifiers",
    summary: "Rect room with pillared modifier generating four pillar props.",
    role: "Setpiece Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "rect", modifiers: ["pillared"] },
      size: { minWidthCells: 7, minHeightCells: 6, minAreaCells: 30 },
    },
    expectedModifiers: ["pillared"],
  },
  {
    id: "partitioned-chamber",
    title: "Partitioned Chamber",
    group: "Modifiers",
    summary: "Rect room with partitioned modifier generating an internal broken-wall marker.",
    role: "Setpiece Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "rect", modifiers: ["partitioned"] },
      size: { minWidthCells: 7, minHeightCells: 6, minAreaCells: 30 },
    },
    expectedModifiers: ["partitioned"],
  },
  {
    id: "chamfered-room",
    title: "Chamfered Corners",
    group: "Modifiers",
    summary: "Rect room with chamfered-corners modifier affecting the mask corners.",
    role: "Side Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "rect", modifiers: ["chamfered-corners"] },
      size: { minWidthCells: 6, minHeightCells: 5, minAreaCells: 24 },
    },
    expectedModifiers: ["chamfered-corners"],
  },
  {
    id: "secret-recess-room",
    title: "Secret Recess",
    group: "Modifiers",
    summary: "Room with secret-recess modifier and required chest/cache prop.",
    role: "Secret Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "rect", modifiers: ["secret-recess"] },
      size: { minWidthCells: 6, minHeightCells: 5, minAreaCells: 24 },
      props: { required: [{ kind: "chest", placement: "corner" }] },
      topology: { secret: true, branchBias: "side" },
    },
    expectedModifiers: ["secret-recess"],
    expectedRequiredProps: ["chest"],
  },
  {
    id: "collapsed-edge-room",
    title: "Collapsed Edge",
    group: "Modifiers",
    summary: "Room with collapsed-edge modifier generating rubble and crack markers.",
    role: "Hazard Room",
    size: "Medium",
    roomDesign: {
      shape: { kind: "rect", modifiers: ["collapsed-edge"] },
      size: { minWidthCells: 6, minHeightCells: 5, minAreaCells: 24 },
    },
    expectedModifiers: ["collapsed-edge"],
  },
  {
    id: "multi-prop-tomb",
    title: "Multiple Required Props",
    group: "Required Props",
    summary: "A plain room that requires tomb, statue, and bones props without using an archetype.",
    role: "Side Tomb",
    size: "Medium",
    roomDesign: {
      shape: { kind: "rect" },
      size: { minWidthCells: 6, minHeightCells: 5, minAreaCells: 24 },
      props: {
        required: [
          { kind: "sarcophagus", placement: "center" },
          { kind: "statue", placement: "near-wall" },
          { kind: "bones", placement: "corner" },
        ],
      },
    },
    expectedRequiredProps: ["tomb", "statue", "bones"],
  },
  {
    id: "combo-room",
    title: "Combined Room Design",
    group: "Combined Cases",
    summary: "L-shape with central void, pillars, side alcoves, and a required altar.",
    role: "Setpiece Room",
    size: "Large",
    roomDesign: {
      shape: { kind: "l-shape", modifiers: ["central-pit", "pillars", "side-alcoves"] },
      size: { minWidthCells: 8, minHeightCells: 6, minAreaCells: 30 },
      props: { required: [{ kind: "altar", placement: "far-wall" }] },
    },
    expectedModifiers: ["central-void", "pillared", "side-alcoves"],
    expectedRequiredProps: ["altar"],
  },
]);

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createIssue(severity, area, check, message, data = {}) {
  return { severity, area, check, message, data };
}

function summarizeIssues(issues) {
  return issues.reduce(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] = (summary[issue.severity] || 0) + 1;
      return summary;
    },
    { total: 0, error: 0, warning: 0, info: 0 },
  );
}

function area(region) {
  return region?.floorCells?.length || (region?.cellRect?.w || 0) * (region?.cellRect?.h || 0);
}

function createGalleryConfig(testCase) {
  return {
    ...DEFAULT_CONFIG,
    seed: `room-design-gallery-${testCase.id}`,
    context: "Crypt",
    biome: "Crypt",
    contextGraphAdapterMode: "safe",
    roomCount: 1,
    showGrid: true,
    regions: [
      {
        id: testCase.id,
        name: testCase.title,
        role: testCase.role || "Side Room",
        size: testCase.size || "Medium",
        preferredShape: "rect",
        tags: ["room-design-gallery"],
        sourceAnchors: ["Sedlec Ossuary"],
        secret: Boolean(testCase.roomDesign?.topology?.secret),
        roomDesign: testCase.roomDesign,
      },
    ],
  };
}

function getRegion(map, regionId) {
  return asArray(map?.regions).find((region) => region.id === regionId || region.sourceRegionId === regionId) || null;
}

function getRegionProps(map, regionId) {
  return asArray(map?.props).filter((prop) => prop.regionId === regionId);
}

function cellToRect(cell, gridSize) {
  return { x: cell.x * gridSize, y: cell.y * gridSize, width: gridSize, height: gridSize };
}

function getCropBox(region, props, gridSize) {
  const rects = asArray(region?.floorCells).map((cell) => cellToRect(cell, gridSize));
  const propRects = props.map((prop) => {
    const radius = Math.max(8, Number(prop.size) || gridSize);
    return { x: prop.x - radius, y: prop.y - radius, width: radius * 2, height: radius * 2 };
  });
  const all = [...rects, ...propRects];
  if (!all.length) return { x: 0, y: 0, width: gridSize * 8, height: gridSize * 8 };
  const minX = Math.min(...all.map((rect) => rect.x));
  const minY = Math.min(...all.map((rect) => rect.y));
  const maxX = Math.max(...all.map((rect) => rect.x + rect.width));
  const maxY = Math.max(...all.map((rect) => rect.y + rect.height));
  const padding = gridSize * 1.4;
  return {
    x: Math.floor(minX - padding),
    y: Math.floor(minY - padding),
    width: Math.ceil(maxX - minX + padding * 2),
    height: Math.ceil(maxY - minY + padding * 2),
  };
}

function renderCells(region, gridSize) {
  return asArray(region?.floorCells)
    .map((cell) => {
      const rect = cellToRect(cell, gridSize);
      return `<rect class="floor-cell" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" />`;
    })
    .join("\n");
}

function renderProp(prop) {
  const size = Math.max(8, Number(prop.size) || 16);
  const half = size / 2;
  const q = size / 4;
  const x = Number(prop.x) || 0;
  const y = Number(prop.y) || 0;
  const classes = ["prop"];
  if (prop.roomDesignRequired) classes.push("prop-required");
  if (prop.roomDesignModifier) classes.push("prop-modifier");
  const attrs = [
    `data-prop-kind="${escapeHtml(prop.kind)}"`,
    `data-room-design-required="${prop.roomDesignRequired ? "true" : "false"}"`,
    `data-room-design-modifier="${escapeHtml(prop.roomDesignModifier || "")}"`,
  ].join(" ");
  let shape;
  switch (prop.kind) {
    case "pit":
      shape = `<circle class="prop-ring" cx="${x}" cy="${y}" r="${half}" /><circle class="prop-inner" cx="${x}" cy="${y}" r="${q}" />`;
      break;
    case "altar":
      shape = `<rect class="prop-block" x="${x - half}" y="${y - q}" width="${size}" height="${q * 1.6}" /><path class="prop-line" d="M ${x} ${y - half} L ${x + q} ${y} L ${x} ${y + half} L ${x - q} ${y} Z" />`;
      break;
    case "tomb":
      shape = `<rect class="prop-block" x="${x - half}" y="${y - q}" width="${size}" height="${half}" /><path class="prop-line" d="M ${x - q} ${y} L ${x + q} ${y} M ${x} ${y - q} L ${x} ${y + q}" />`;
      break;
    case "pillar":
      shape = `<circle class="prop-dot" cx="${x}" cy="${y}" r="${q}" />`;
      break;
    case "statue":
      shape = `<path class="prop-block" d="M ${x} ${y - half} L ${x + q} ${y} L ${x} ${y + half} L ${x - q} ${y} Z" />`;
      break;
    case "shelf":
      shape = `<rect class="prop-block" x="${x - half}" y="${y - q}" width="${size}" height="${q}" /><rect class="prop-block" x="${x - half}" y="${y + q * 0.6}" width="${size}" height="${q}" />`;
      break;
    case "chest":
      shape = `<rect class="prop-block" x="${x - half}" y="${y - q}" width="${size}" height="${half}" /><path class="prop-line" d="M ${x - half} ${y - q} L ${x} ${y - half} L ${x + half} ${y - q}" />`;
      break;
    case "bones":
      shape = [-0.45, 0, 0.42]
        .map((offset, index) => `<circle class="prop-dot" cx="${x + offset * size}" cy="${y + (index % 2 ? 0.12 : -0.12) * size}" r="${q * 0.65}" />`)
        .join("\n");
      break;
    case "rubble":
      shape = [-0.42, 0.08, 0.44]
        .map((offset, index) => `<path class="prop-block" d="M ${x + offset * size} ${y - q} L ${x + offset * size + q} ${y + q} L ${x + offset * size - q} ${y + q} Z" />`)
        .join("\n");
      break;
    case "crack":
      shape = `<path class="prop-line prop-crack" d="M ${x - half} ${y - q} L ${x - q} ${y + q} L ${x + q * 0.2} ${y - q * 0.4} L ${x + half} ${y + q}" />`;
      break;
    case "broken-wall":
      shape = `<path class="prop-line prop-wall" d="M ${x - half} ${y} L ${x - q} ${y} M ${x} ${y} L ${x + half} ${y}" />`;
      break;
    case "fog":
      shape = `<path class="prop-line" d="M ${x - half} ${y - q} C ${x - q} ${y - half}, ${x + q} ${y + q}, ${x + half} ${y - q} M ${x - half} ${y + q} C ${x - q} ${y - q}, ${x + q} ${y + half}, ${x + half} ${y + q}" />`;
      break;
    default:
      shape = `<circle class="prop-dot" cx="${x}" cy="${y}" r="${q}" />`;
  }
  const label = `${prop.kind}${prop.roomDesignRequired ? " · required" : ""}${prop.roomDesignModifier ? ` · ${prop.roomDesignModifier}` : ""}`;
  return `<g class="${classes.join(" ")}" ${attrs}><title>${escapeHtml(label)}</title>${shape}</g>`;
}

function renderProps(props) {
  return props.map(renderProp).join("\n");
}

function renderThumbnail(sample) {
  const { map, region, props, testCase } = sample;
  const gridSize = Math.max(1, map?.config?.gridSize || DEFAULT_CONFIG.gridSize || 20);
  const crop = getCropBox(region, props, gridSize);
  return `<svg class="thumb" viewBox="${crop.x} ${crop.y} ${crop.width} ${crop.height}" role="img" aria-label="${escapeHtml(testCase.title)} room design preview">
    <rect class="thumb-bg" x="${crop.x}" y="${crop.y}" width="${crop.width}" height="${crop.height}" />
    <g class="cells">${renderCells(region, gridSize)}</g>
    <g class="props">${renderProps(props)}</g>
  </svg>`;
}

function getExpectedShape(testCase) {
  const normalized = normalizeRoomDesign(testCase.roomDesign);
  return getEngineShapeFromRoomDesignKind(normalized?.shape?.kind) || "rect";
}

function createSample(testCase, issues) {
  const normalized = normalizeRoomDesign(testCase.roomDesign);
  const expectedShape = getExpectedShape(testCase);
  const map = generateMap(createGalleryConfig(testCase));
  const region = getRegion(map, testCase.id);
  const props = getRegionProps(map, region?.id || testCase.id);

  if (!region) {
    issues.push(createIssue("error", testCase.id, "missing-region", `${testCase.title} did not generate a region.`));
    return { testCase, normalized, expectedShape, map, region: null, props: [], thumbnail: "" };
  }

  if (region.shape !== expectedShape) {
    issues.push(createIssue("error", testCase.id, "shape", `${testCase.title} expected engine shape ${expectedShape}, got ${region.shape}.`, { region }));
  }
  if (region.roomDesign?.schemaVersion !== ROOM_DESIGN_SCHEMA_VERSION) {
    issues.push(createIssue("error", testCase.id, "schema", `${testCase.title} did not retain normalized roomDesign schema.`, { roomDesign: region.roomDesign }));
  }
  const minWidth = normalized?.size?.minWidthCells || normalized?.size?.minDiameterCells;
  const minHeight = normalized?.size?.minHeightCells || normalized?.size?.minDiameterCells;
  if (minWidth && region.cellRect?.w < minWidth) {
    issues.push(createIssue("error", testCase.id, "min-width", `${testCase.title} width ${region.cellRect?.w} is below ${minWidth}.`, { cellRect: region.cellRect }));
  }
  if (minHeight && region.cellRect?.h < minHeight) {
    issues.push(createIssue("error", testCase.id, "min-height", `${testCase.title} height ${region.cellRect?.h} is below ${minHeight}.`, { cellRect: region.cellRect }));
  }
  if (normalized?.size?.minAreaCells && area(region) < normalized.size.minAreaCells) {
    issues.push(createIssue("error", testCase.id, "min-area", `${testCase.title} area ${area(region)} is below ${normalized.size.minAreaCells}.`, { cellRect: region.cellRect }));
  }
  for (const expectedKind of asArray(testCase.expectedRequiredProps)) {
    const found = props.find((prop) => prop.kind === expectedKind && prop.roomDesignRequired);
    if (!found) {
      issues.push(createIssue("error", testCase.id, "required-prop", `${testCase.title} is missing required roomDesign prop ${expectedKind}.`, { props }));
    }
  }
  for (const expectedModifier of asArray(testCase.expectedModifiers)) {
    const found = props.find((prop) => prop.roomDesignModifier === expectedModifier);
    if (!found) {
      issues.push(createIssue("error", testCase.id, "modifier-prop", `${testCase.title} is missing roomDesign modifier prop ${expectedModifier}.`, { props }));
    }
  }

  return {
    testCase,
    normalized,
    expectedShape,
    map,
    region,
    props,
    roomDesignProps: props.filter((prop) => prop.roomDesignRequired || prop.roomDesignModifier),
    thumbnail: renderThumbnail({ map, region, props, testCase }),
  };
}

function groupSamples(samples) {
  const groups = new Map();
  for (const sample of samples) {
    const group = sample.testCase.group || "Other";
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(sample);
  }
  return groups;
}

function renderJsonBlock(value) {
  return `<pre><code>${escapeHtml(JSON.stringify(value, null, 2))}</code></pre>`;
}

function renderSampleCard(sample) {
  const { testCase, region, normalized, expectedShape, props, roomDesignProps } = sample;
  const propSummary = roomDesignProps.length
    ? roomDesignProps
        .map((prop) => `${prop.kind}${prop.roomDesignRequired ? " required" : ""}${prop.roomDesignModifier ? ` · ${prop.roomDesignModifier}` : ""}`)
        .join(", ")
    : "none";
  return `<article class="card" data-case-id="${escapeHtml(testCase.id)}" data-engine-shape="${escapeHtml(region?.shape || "missing")}">
    <header>
      <span class="eyebrow">${escapeHtml(testCase.group)}</span>
      <h2>${escapeHtml(testCase.title)}</h2>
      <p>${escapeHtml(testCase.summary)}</p>
    </header>
    ${sample.thumbnail}
    <dl class="facts">
      <div><dt>Design Shape</dt><dd>${escapeHtml(normalized?.shape?.kind || "none")}</dd></div>
      <div><dt>Engine Shape</dt><dd>${escapeHtml(region?.shape || "missing")} <span class="muted">expected ${escapeHtml(expectedShape)}</span></dd></div>
      <div><dt>Cells</dt><dd>${escapeHtml(region?.cellRect ? `${region.cellRect.w}×${region.cellRect.h}` : "missing")} · ${area(region)} floor cells</dd></div>
      <div><dt>Modifiers</dt><dd>${escapeHtml(asArray(normalized?.shape?.modifiers).join(", ") || "none")}</dd></div>
      <div><dt>RoomDesign Props</dt><dd>${escapeHtml(propSummary)}</dd></div>
    </dl>
    <details>
      <summary>roomDesign</summary>
      ${renderJsonBlock(testCase.roomDesign)}
    </details>
  </article>`;
}

function renderHtml(samples, summary) {
  const groups = groupSamples(samples);
  const sections = [...groups.entries()]
    .map(
      ([group, groupSamples]) => `<section class="group">
        <h1>${escapeHtml(group)}</h1>
        <div class="grid">${groupSamples.map(renderSampleCard).join("\n")}</div>
      </section>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Room Design QA Gallery</title>
<style>
  :root { color-scheme: dark; --bg:#15120f; --panel:#211d18; --line:#5f5144; --text:#efe6da; --muted:#ad9d8e; --accent:#d7b56d; --bad:#d87a66; }
  * { box-sizing: border-box; }
  body { margin:0; padding:32px; background:var(--bg); color:var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .page-header { max-width:1160px; margin:0 auto 28px; border-bottom:1px solid var(--line); padding-bottom:18px; }
  .page-header h1 { margin:0 0 8px; font-size:32px; letter-spacing:.02em; }
  .page-header p { margin:0; color:var(--muted); line-height:1.5; }
  .summary { display:flex; gap:12px; flex-wrap:wrap; margin-top:16px; }
  .pill { border:1px solid var(--line); padding:6px 10px; font-size:13px; color:var(--muted); }
  .pill strong { color:var(--text); }
  .group { max-width:1160px; margin:0 auto 34px; }
  .group h1 { font-size:19px; letter-spacing:.08em; text-transform:uppercase; color:var(--accent); margin:0 0 14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:18px; }
  .card { background:var(--panel); border:1px solid var(--line); padding:16px; }
  .card h2 { margin:4px 0 6px; font-size:20px; }
  .card p { margin:0 0 14px; color:var(--muted); line-height:1.45; }
  .eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:var(--accent); }
  .thumb { display:block; width:100%; height:240px; border:1px solid var(--line); background:#120f0c; margin:12px 0; }
  .thumb-bg { fill:#15120f; }
  .floor-cell { fill:#d8c8b4; stroke:#2b241d; stroke-width:1.1; vector-effect:non-scaling-stroke; }
  .prop { color:#120f0c; }
  .prop-block, .prop-dot, .prop-ring, .prop-inner { fill:#211d18; stroke:#120f0c; stroke-width:1.4; vector-effect:non-scaling-stroke; }
  .prop-required .prop-block, .prop-required .prop-dot, .prop-required .prop-ring { fill:#6d5630; stroke:#120f0c; }
  .prop-modifier .prop-block, .prop-modifier .prop-dot, .prop-modifier .prop-ring { fill:#493f34; stroke:#120f0c; }
  .prop-ring { fill:none; stroke-width:2; }
  .prop-inner { fill:#120f0c; }
  .prop-line { fill:none; stroke:#120f0c; stroke-width:2; vector-effect:non-scaling-stroke; }
  .prop-crack { stroke-width:2.4; }
  .prop-wall { stroke-width:3; stroke-linecap:round; }
  .facts { display:grid; gap:6px; margin:0 0 12px; }
  .facts div { display:grid; grid-template-columns:120px 1fr; gap:10px; border-top:1px solid rgba(255,255,255,.08); padding-top:6px; }
  dt { color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.06em; }
  dd { margin:0; font-size:13px; }
  .muted { color:var(--muted); }
  details { border-top:1px solid rgba(255,255,255,.08); padding-top:10px; }
  summary { cursor:pointer; color:var(--accent); font-size:13px; }
  pre { overflow:auto; padding:12px; background:#120f0c; border:1px solid rgba(255,255,255,.08); color:var(--muted); font-size:12px; }
</style>
</head>
<body>
  <header class="page-header">
    <h1>Room Design QA Gallery</h1>
    <p>Visual smoke gallery for generic <code>roomDesign</code> primitives, modifiers, constraints, and required props. This is not an archetype gallery: it checks whether modular room grammar is producing readable room forms.</p>
    <div class="summary">
      <span class="pill"><strong>${samples.length}</strong> cases</span>
      <span class="pill"><strong>${summary.error}</strong> errors</span>
      <span class="pill"><strong>${summary.warning}</strong> warnings</span>
      <span class="pill"><strong>${summary.info}</strong> info</span>
    </div>
  </header>
  ${sections}
</body>
</html>`;
}

function renderMarkdown(samples, summary) {
  const lines = [
    "# Room Design QA Gallery",
    "",
    `Cases: ${samples.length}`,
    `Issues: ${summary.total} (${summary.error} errors, ${summary.warning} warnings, ${summary.info} info)`,
    "",
  ];
  for (const sample of samples) {
    const { testCase, region, normalized, roomDesignProps, expectedShape } = sample;
    lines.push(`## ${testCase.title}`);
    lines.push("");
    lines.push(`- Group: ${testCase.group}`);
    lines.push(`- Design shape: ${normalized?.shape?.kind || "none"}`);
    lines.push(`- Engine shape: ${region?.shape || "missing"} (expected ${expectedShape})`);
    lines.push(`- Cells: ${region?.cellRect ? `${region.cellRect.w}×${region.cellRect.h}` : "missing"}; ${area(region)} floor cells`);
    lines.push(`- Modifiers: ${asArray(normalized?.shape?.modifiers).join(", ") || "none"}`);
    lines.push(`- RoomDesign props: ${roomDesignProps.map((prop) => `${prop.kind}${prop.roomDesignRequired ? " required" : ""}${prop.roomDesignModifier ? ` · ${prop.roomDesignModifier}` : ""}`).join(", ") || "none"}`);
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function createReport(samples, issues, summary) {
  return {
    summary,
    cases: samples.map((sample) => ({
      id: sample.testCase.id,
      title: sample.testCase.title,
      group: sample.testCase.group,
      expectedShape: sample.expectedShape,
      generatedShape: sample.region?.shape || "",
      cellRect: sample.region?.cellRect || null,
      floorCellCount: area(sample.region),
      normalizedRoomDesign: sample.normalized,
      roomDesignProps: sample.roomDesignProps.map((prop) => ({
        id: prop.id,
        kind: prop.kind,
        roomDesignRequired: Boolean(prop.roomDesignRequired),
        roomDesignModifier: prop.roomDesignModifier || "",
        x: prop.x,
        y: prop.y,
        size: prop.size,
      })),
    })),
    issues,
  };
}

async function main() {
  const issues = [];
  const samples = ROOM_DESIGN_CASES.map((testCase) => createSample(testCase, issues));
  const summary = summarizeIssues(issues);
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(HTML_OUTPUT, renderHtml(samples, summary), "utf8");
  await writeFile(MD_OUTPUT, renderMarkdown(samples, summary), "utf8");
  await writeFile(JSON_OUTPUT, JSON.stringify(createReport(samples, issues, summary), null, 2), "utf8");
  console.log(`Room Design Gallery: ${summary.total} issues (${summary.error} errors, ${summary.warning} warnings, ${summary.info} info).`);
  console.log(`Wrote ${HTML_OUTPUT.pathname}`);
  if (summary.error || summary.warning) process.exit(1);
}

await main();
