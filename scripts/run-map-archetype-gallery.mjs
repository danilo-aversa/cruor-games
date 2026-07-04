import { mkdir, writeFile } from "node:fs/promises";
import { DEFAULT_CONFIG } from "../features/darken-location/map-generator/map-generator.input.js";
import { generateMap } from "../features/darken-location/map-generator/map-generator.pipeline.js";
import {
  ROOM_ARCHETYPE_SCHEMA_VERSION,
  getRoomArchetypeDefinition,
} from "../features/darken-location/map-generator/map-generator.profile.js";

const OUTPUT_DIR = new URL("../dist/qa/", import.meta.url);
const HTML_OUTPUT = new URL("map-archetype-gallery.html", OUTPUT_DIR);
const MD_OUTPUT = new URL("map-archetype-gallery.md", OUTPUT_DIR);
const JSON_OUTPUT = new URL("map-archetype-gallery-report.json", OUTPUT_DIR);

const EXPECTED_ARCHETYPES = Object.freeze({
  "crypt-burial-cell": Object.freeze({
    label: "Burial Cell",
    maskProfile: "burial-cell",
    detailProfile: "burial-cell",
    signatureProp: "burial-slab",
    role: "Side Burial Cell",
    tags: ["burial", "side"],
    size: "Small",
  }),
  "ossuary-gallery": Object.freeze({
    label: "Ossuary Gallery",
    maskProfile: "ossuary-gallery",
    detailProfile: "ossuary-gallery",
    signatureProp: "ossuary-niche-row",
    role: "Connector / Ossuary Gallery",
    tags: ["connector", "ossuary", "gallery"],
    size: "Medium",
  }),
  "reliquary-niche": Object.freeze({
    label: "Reliquary Niche",
    maskProfile: "reliquary-niche",
    detailProfile: "reliquary-niche",
    signatureProp: "reliquary-shrine",
    role: "Clue Room / Reliquary Niche",
    tags: ["clue", "reliquary"],
    size: "Small",
  }),
  "charnel-vault": Object.freeze({
    label: "Charnel Vault",
    maskProfile: "charnel-vault",
    detailProfile: "charnel-vault",
    signatureProp: "charnel-heap",
    role: "Hazard Room / Charnel Vault",
    tags: ["hazard", "charnel"],
    size: "Large",
  }),
  "sealed-family-tomb": Object.freeze({
    label: "Sealed Family Tomb",
    maskProfile: "sealed-family-tomb",
    detailProfile: "sealed-family-tomb",
    signatureProp: "sealed-tomb-slab",
    role: "Side Tomb / Family Tomb",
    tags: ["tomb", "side"],
    size: "Medium",
  }),
  "processional-crypt-hall": Object.freeze({
    label: "Processional Crypt Hall",
    maskProfile: "processional-crypt-hall",
    detailProfile: "processional-crypt-hall",
    signatureProp: "processional-axis",
    role: "Entrance / Threshold / Processional Hall",
    tags: ["entrance", "threshold", "connector"],
    size: "Medium",
  }),
  "bone-well": Object.freeze({
    label: "Bone Well",
    maskProfile: "bone-well",
    detailProfile: "bone-well",
    signatureProp: "bone-well-rim",
    role: "Hazard / Setpiece / Vertical Room",
    tags: ["hazard", "vertical", "well"],
    size: "Large",
  }),
  "hidden-reliquary": Object.freeze({
    label: "Hidden Reliquary",
    maskProfile: "hidden-reliquary",
    detailProfile: "hidden-reliquary",
    signatureProp: "hidden-relic-cache",
    role: "Secret / Lore Room",
    tags: ["secret", "lore", "archive"],
    size: "Small",
  }),
});

const ARCHETYPE_ORDER = Object.freeze([
  "crypt-burial-cell",
  "ossuary-gallery",
  "reliquary-niche",
  "charnel-vault",
  "sealed-family-tomb",
  "processional-crypt-hall",
  "bone-well",
  "hidden-reliquary",
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

function createRegion(archetypeId, { entrance = false, id = archetypeId } = {}) {
  const archetype = EXPECTED_ARCHETYPES[archetypeId] || EXPECTED_ARCHETYPES["crypt-burial-cell"];
  return {
    id,
    name: archetype.label,
    role: archetype.role,
    size: archetype.size,
    preferredShape: "rect",
    connectors: entrance || archetypeId === "processional-crypt-hall" ? 2 : 1,
    tags: archetype.tags,
    sourceAnchors: ["Sedlec Ossuary"],
    roomArchetype: archetypeId,
    isEntrance: entrance,
    secret: archetypeId === "hidden-reliquary",
  };
}

function createGalleryConfig(archetypeId) {
  const target = createRegion(archetypeId, { entrance: archetypeId === "processional-crypt-hall" });
  const needsEntrance = archetypeId !== "processional-crypt-hall";
  const entrance = createRegion("processional-crypt-hall", {
    id: "gallery-entry",
    entrance: true,
  });
  return {
    ...DEFAULT_CONFIG,
    seed: `map-archetype-gallery-${archetypeId}`,
    context: "Crypt",
    biome: "Crypt",
    contextGraphAdapterMode: "safe",
    roomCount: needsEntrance ? 2 : 1,
    showGrid: true,
    regions: needsEntrance ? [entrance, target] : [target],
  };
}

function getRegion(map, regionId) {
  return asArray(map?.regions).find((region) => region.id === regionId) || null;
}

function getRegionProps(map, regionId) {
  return asArray(map?.props).filter((prop) => prop.regionId === regionId);
}

function getRegionEdges(map, regionId) {
  return asArray(map?.graph).filter((edge) => edge.from === regionId || edge.to === regionId);
}

function cellToRect(cell, gridSize) {
  return {
    x: cell.x * gridSize,
    y: cell.y * gridSize,
    width: gridSize,
    height: gridSize,
  };
}

function getCropBox(region, props, gridSize) {
  const rects = asArray(region?.floorCells).map((cell) => cellToRect(cell, gridSize));
  const propRects = props.map((prop) => {
    const radius = Math.max(8, Number(prop.size) || gridSize);
    return {
      x: prop.x - radius,
      y: prop.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
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

function renderGenericProp(prop) {
  const size = Math.max(5, Number(prop.size) || 10);
  return `<circle class="prop-generic" cx="${prop.x}" cy="${prop.y}" r="${Math.round(size * 0.24)}" />`;
}

function renderSignatureProp(prop) {
  const size = Math.max(12, Number(prop.size) || 18);
  const half = size / 2;
  const q = size / 4;
  const x = Number(prop.x) || 0;
  const y = Number(prop.y) || 0;
  switch (prop.kind) {
    case "bone-well-rim":
      return [
        `<circle class="signature signature-ring" cx="${x}" cy="${y}" r="${half}" />`,
        `<circle class="signature signature-inner" cx="${x}" cy="${y}" r="${q}" />`,
      ].join("\n");
    case "ossuary-niche-row":
      return [-2, -1, 0, 1, 2]
        .map((index) => `<rect class="signature signature-niche" x="${x + index * q - q / 2}" y="${y - q}" width="${q}" height="${q * 2}" rx="1" />`)
        .join("\n");
    case "reliquary-shrine":
      return [
        `<rect class="signature signature-slab" x="${x - half}" y="${y - q}" width="${size}" height="${q * 1.4}" />`,
        `<path class="signature signature-icon" d="M ${x} ${y - half} L ${x + q} ${y - q} L ${x + q * 0.5} ${y + q} L ${x - q * 0.5} ${y + q} L ${x - q} ${y - q} Z" />`,
      ].join("\n");
    case "hidden-relic-cache":
      return [
        `<rect class="signature signature-cache" x="${x - half}" y="${y - q}" width="${size}" height="${half}" />`,
        `<path class="signature signature-mark" d="M ${x - half} ${y - q} L ${x} ${y - half} L ${x + half} ${y - q}" />`,
      ].join("\n");
    case "charnel-heap":
      return [-0.4, 0, 0.35, 0.7]
        .map((offset, index) => `<circle class="signature signature-heap" cx="${x + offset * size}" cy="${y + (index % 2 ? 0.18 : -0.16) * size}" r="${q}" />`)
        .join("\n");
    case "sealed-tomb-slab":
      return [
        `<rect class="signature signature-tomb" x="${x - half}" y="${y - q}" width="${size}" height="${half}" />`,
        `<path class="signature signature-mark" d="M ${x - q} ${y} L ${x + q} ${y} M ${x} ${y - q} L ${x} ${y + q}" />`,
      ].join("\n");
    case "burial-slab":
      return [
        `<rect class="signature signature-burial" x="${x - half}" y="${y - q}" width="${size}" height="${half}" />`,
        `<path class="signature signature-mark" d="M ${x - half * 0.72} ${y} L ${x + half * 0.72} ${y}" />`,
      ].join("\n");
    case "processional-axis":
      return [
        `<path class="signature signature-axis" d="M ${x - size * 1.15} ${y} L ${x + size * 1.15} ${y}" />`,
        `<circle class="signature signature-axis-dot" cx="${x}" cy="${y}" r="${q * 0.55}" />`,
      ].join("\n");
    default:
      return renderGenericProp(prop);
  }
}

function renderProps(props) {
  return props
    .map((prop) => {
      const title = `${prop.kind}${prop.archetypeSignature ? " · signature" : ""}`;
      const content = prop.archetypeSignature ? renderSignatureProp(prop) : renderGenericProp(prop);
      return `<g class="prop${prop.archetypeSignature ? " prop-signature" : ""}" data-prop-kind="${escapeHtml(prop.kind)}" data-archetype-cue="${escapeHtml(prop.archetypeCue || "")}"><title>${escapeHtml(title)}</title>${content}</g>`;
    })
    .join("\n");
}

function renderThumbnail(sample) {
  const { archetypeId, expected, map, region, props } = sample;
  const gridSize = Math.max(1, map?.config?.gridSize || DEFAULT_CONFIG.gridSize);
  const crop = getCropBox(region, props, gridSize);
  return `<svg class="archetype-thumb" viewBox="${crop.x} ${crop.y} ${crop.width} ${crop.height}" role="img" aria-labelledby="title-${archetypeId}" data-archetype-id="${archetypeId}" data-mask-profile="${escapeHtml(region?.shapeOptions?.maskProfile || "")}" data-detail-profile="${escapeHtml(region?.shapeOptions?.detailProfile || "")}">
<title id="title-${archetypeId}">${escapeHtml(expected.label)} map archetype thumbnail</title>
<rect class="thumb-bg" x="${crop.x}" y="${crop.y}" width="${crop.width}" height="${crop.height}" />
<g class="room-floor">${renderCells(region, gridSize)}</g>
<g class="room-props">${renderProps(props)}</g>
</svg>`;
}

function summarizeSample(archetypeId, map) {
  const expected = EXPECTED_ARCHETYPES[archetypeId];
  const region = getRegion(map, archetypeId);
  const props = getRegionProps(map, archetypeId);
  const signatureProps = props.filter((prop) => prop.archetypeSignature).map((prop) => prop.kind);
  const edges = getRegionEdges(map, archetypeId).map((edge) => ({
    from: edge.from,
    to: edge.to,
    kind: edge.kind || "",
    secret: Boolean(edge.secret),
    reason: edge.reason || "",
  }));
  return {
    archetypeId,
    expected,
    map,
    region,
    props,
    report: {
      id: archetypeId,
      label: expected.label,
      resolvedRoomArchetype: region?.roomArchetype || "",
      roomArchetypeSource: region?.roomArchetypeSource || "",
      shape: region?.shape || "",
      maskProfile: region?.shapeOptions?.maskProfile || "",
      detailProfile: region?.shapeOptions?.detailProfile || "",
      signatureProp: expected.signatureProp,
      signatureProps,
      graphEdges: edges,
      floorCellCount: asArray(region?.floorCells).length,
    },
  };
}

function validateSample(sample, issues) {
  const { archetypeId, expected, region } = sample;
  if (!region) {
    issues.push(createIssue("error", "gallery", "missing-region", `${archetypeId} did not generate a target region.`, { archetypeId }));
    return;
  }
  if (region.roomArchetype !== archetypeId) {
    issues.push(createIssue("error", "gallery", "resolved-archetype", `${archetypeId} resolved as ${region.roomArchetype || "empty"}.`, { archetypeId, actual: region.roomArchetype }));
  }
  if (region.shapeOptions?.maskProfile !== expected.maskProfile) {
    issues.push(createIssue("error", "gallery", "mask-profile", `${archetypeId} has wrong maskProfile.`, { expected: expected.maskProfile, actual: region.shapeOptions?.maskProfile }));
  }
  if (region.shapeOptions?.detailProfile !== expected.detailProfile) {
    issues.push(createIssue("error", "gallery", "detail-profile", `${archetypeId} has wrong detailProfile.`, { expected: expected.detailProfile, actual: region.shapeOptions?.detailProfile }));
  }
  if (!asArray(region.floorCells).length) {
    issues.push(createIssue("error", "gallery", "floor-cells", `${archetypeId} has no floor cells.`, { archetypeId }));
  }
  if (!sample.props.some((prop) => prop.kind === expected.signatureProp && prop.archetypeSignature)) {
    issues.push(createIssue("error", "gallery", "signature-prop", `${archetypeId} is missing signature prop ${expected.signatureProp}.`, {
      expected: expected.signatureProp,
      actual: sample.props.map((prop) => prop.kind),
    }));
  }
}

function buildSamples() {
  return ARCHETYPE_ORDER.map((archetypeId) => {
    const config = createGalleryConfig(archetypeId);
    const map = generateMap(config);
    return summarizeSample(archetypeId, map);
  });
}

function buildHtml(samples, issues) {
  const generatedAt = new Date().toISOString();
  const cards = samples
    .map((sample) => {
      const { archetypeId, expected, report } = sample;
      const issueCount = issues.filter((issue) => issue.data?.archetypeId === archetypeId).length;
      const edgeSummary = report.graphEdges
        .map((edge) => `${edge.kind || "edge"}${edge.secret ? " secret" : ""}`)
        .filter(Boolean)
        .join(", ") || "none";
      return `<article class="card" data-archetype-id="${archetypeId}">
<header>
<p class="eyebrow">${escapeHtml(archetypeId)}</p>
<h2>${escapeHtml(expected.label)}</h2>
</header>
${renderThumbnail(sample)}
<dl>
<div><dt>Shape</dt><dd>${escapeHtml(report.shape)}</dd></div>
<div><dt>Mask</dt><dd>${escapeHtml(report.maskProfile)}</dd></div>
<div><dt>Details</dt><dd>${escapeHtml(report.detailProfile)}</dd></div>
<div><dt>Signature</dt><dd>${escapeHtml(report.signatureProps.join(", ") || "missing")}</dd></div>
<div><dt>Edges</dt><dd>${escapeHtml(edgeSummary)}</dd></div>
</dl>
${issueCount ? `<p class="issue">${issueCount} issue${issueCount === 1 ? "" : "s"}</p>` : `<p class="clean">Visual fixture clean</p>`}
</article>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Cruor Map Archetype Gallery</title>
<style>
:root { color-scheme: dark; --bg:#120f0f; --panel:#1b1717; --ink:#e9dfcc; --muted:#a89c8c; --line:#433737; --floor:#d8c7aa; --floor-line:#4b3d31; --accent:#8f1d2c; --ok:#8aa36f; --warn:#d6a24a; }
body { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:var(--bg); color:var(--ink); }
main { max-width:1440px; margin:0 auto; padding:32px; }
h1 { font-size:28px; margin:0 0 8px; letter-spacing:.02em; text-transform:uppercase; }
.summary { color:var(--muted); margin:0 0 28px; }
.grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:18px; }
.card { background:var(--panel); border:1px solid var(--line); padding:16px; }
.card header { min-height:70px; }
.eyebrow { color:var(--muted); font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin:0 0 6px; }
h2 { font-size:18px; margin:0; }
.archetype-thumb { width:100%; aspect-ratio:4/3; background:#efe2ca; border:1px solid #554637; display:block; margin:12px 0; }
.thumb-bg { fill:#efe2ca; }
.floor-cell { fill:var(--floor); stroke:var(--floor-line); stroke-width:1; vector-effect:non-scaling-stroke; }
.prop-generic { fill:none; stroke:#2d251f; stroke-width:1.3; vector-effect:non-scaling-stroke; }
.signature { fill:none; stroke:#1d1915; stroke-width:2.2; vector-effect:non-scaling-stroke; }
.signature-inner, .signature-axis-dot, .signature-heap { fill:#1d1915; }
.signature-niche, .signature-cache, .signature-tomb, .signature-burial, .signature-slab { fill:rgba(29,25,21,.12); }
dl { display:grid; gap:6px; margin:0; }
dl div { display:grid; grid-template-columns:76px 1fr; gap:8px; font-size:13px; }
dt { color:var(--muted); }
dd { margin:0; }
.clean, .issue { margin:12px 0 0; font-size:12px; }
.clean { color:var(--ok); }
.issue { color:var(--warn); }
</style>
</head>
<body>
<main>
<h1>Cruor Map Archetype Gallery</h1>
<p class="summary">Generated ${escapeHtml(generatedAt)} · schema ${escapeHtml(ROOM_ARCHETYPE_SCHEMA_VERSION)} · ${samples.length} archetypes · ${issues.length} issues.</p>
<section class="grid">${cards}</section>
</main>
</body>
</html>
`;
}

function buildMarkdown(samples, issues) {
  const rows = samples
    .map((sample) => {
      const report = sample.report;
      return `| ${report.id} | ${report.label} | ${report.shape} | ${report.maskProfile} | ${report.detailProfile} | ${report.signatureProps.join(", ") || "missing"} |`;
    })
    .join("\n");
  return `# Cruor Map Archetype Gallery

Generated: ${new Date().toISOString()}  
Schema: ${ROOM_ARCHETYPE_SCHEMA_VERSION}  
Issues: ${issues.length}

Open \`dist/qa/map-archetype-gallery.html\` for visual inspection.

| Archetype | Label | Shape | Mask | Details | Signature Props |
|---|---|---|---|---|---|
${rows}
`;
}

function buildReport(samples, issues) {
  return {
    reportType: "cruor-map-archetype-gallery-report",
    version: "map-archetype-gallery-v0.1.0",
    generatedAt: new Date().toISOString(),
    schemaVersion: ROOM_ARCHETYPE_SCHEMA_VERSION,
    summary: {
      archetypes: samples.length,
      issues: issues.length,
      errors: issues.filter((issue) => issue.severity === "error").length,
      warnings: issues.filter((issue) => issue.severity === "warning").length,
      info: issues.filter((issue) => issue.severity === "info").length,
    },
    archetypes: samples.map((sample) => sample.report),
    issues,
  };
}

async function main() {
  const issues = [];
  ARCHETYPE_ORDER.forEach((archetypeId) => {
    if (!getRoomArchetypeDefinition(archetypeId)) {
      issues.push(createIssue("error", "schema", "missing-definition", `Missing archetype definition: ${archetypeId}`, { archetypeId }));
    }
  });
  const samples = buildSamples();
  samples.forEach((sample) => validateSample(sample, issues));

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(HTML_OUTPUT, buildHtml(samples, issues), "utf8");
  await writeFile(MD_OUTPUT, buildMarkdown(samples, issues), "utf8");
  await writeFile(JSON_OUTPUT, `${JSON.stringify(buildReport(samples, issues), null, 2)}\n`, "utf8");

  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  const info = issues.filter((issue) => issue.severity === "info").length;
  console.log(`Map Archetype Gallery: ${issues.length} issues (${errors} errors, ${warnings} warnings, ${info} info).`);
  console.log("Wrote dist/qa/map-archetype-gallery.html");
  issues.slice(0, 25).forEach((issue) => {
    console.log(`[${issue.severity}] ${issue.area}/${issue.check}: ${issue.message}`);
  });
  if (errors) process.exitCode = 1;
}

await main();
