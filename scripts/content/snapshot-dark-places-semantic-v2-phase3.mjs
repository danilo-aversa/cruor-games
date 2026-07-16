#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  compileDarkPlacesSemanticLocation,
  createSessionStateFromLocationDocumentV1,
} from "../../features/darken-location/compiler/index.js";
import {
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
  serializeCanonicalSemanticContent,
} from "../../shared/content/content.index.js";

const rootDirectory = process.cwd();
const fixtureDirectory = path.join(
  rootDirectory,
  "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary",
);
const legacyDocumentPath = path.join(
  fixtureDirectory,
  "location-document-v1.json",
);
const hashManifestPath = path.join(fixtureDirectory, "v2-fixture-files.sha256");

const GENERATED_FILENAMES = Object.freeze([
  "v2-content-pack.json",
  "v2-session-state.json",
  "v2-location-document.json",
  "v2-map-intent.json",
  "v2-overview.md",
  "v2-quick-reference.txt",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function jsonText(value) {
  return `${JSON.stringify(
    JSON.parse(serializeCanonicalSemanticContent(value)),
    null,
    2,
  )}\n`;
}

function formatMechanics(mechanics = {}) {
  return Object.entries(mechanics)
    .filter(([, value]) => String(value || "").trim())
    .map(
      ([label, value]) =>
        `- ${label.replace(/([A-Z])/g, " $1").toLowerCase()}: ${value}`,
    )
    .join("\n");
}

function createOverviewMarkdown(document) {
  const lines = [
    `# ${document.meta.title}`,
    "",
    "## Location Premise",
    "",
    document.identity.historyParagraph,
    "",
    document.identity.currentSituationParagraph,
    "",
    `**Why the characters enter:** ${document.identity.playerEntryPoint}`,
    "",
    "## Site Atmosphere",
    "",
    ...document.siteWide.atmosphere.flatMap((block) => [
      `### ${block.title}`,
      "",
      block.text,
      "",
    ]),
    "## Global Rules",
    "",
    ...document.siteWide.globalRules.flatMap((block) => [
      `### ${block.title}`,
      "",
      block.text,
      "",
      formatMechanics(block.mechanics),
      "",
      `**Counterplay:** ${block.counterplay}`,
      "",
    ]),
    "## Recurring Signs",
    "",
    ...document.siteWide.recurringSigns.map(
      (block) => `- **${block.title}:** ${block.text}`,
    ),
    "",
    "## Stakes & Consequences",
    "",
    ...document.siteWide.stakesAndConsequences.map(
      (block) => `- ${block.text}`,
    ),
    "",
  ];
  return lines.join("\n");
}

function createQuickReference(document) {
  const ruleLines = document.siteWide.globalRules.flatMap((block) => [
    block.title.toUpperCase(),
    block.text,
    ...Object.entries(block.mechanics)
      .filter(([, value]) => String(value || "").trim())
      .map(
        ([label, value]) =>
          `${label.replace(/([A-Z])/g, " $1").toLowerCase()}: ${value}`,
      ),
    `counterplay: ${block.counterplay}`,
    "",
  ]);
  const roomLines = document.rooms.flatMap((room) => [
    `${String(room.number).padStart(2, "0")} ${room.name.replace(
      /^\d+\s+/,
      "",
    )}`,
    ...(room.recurringSigns.length
      ? room.recurringSigns.map((sign) => `- ${sign.title}: ${sign.text}`)
      : ["- No recurring sign allocated."]),
    "",
  ]);
  return [
    `${document.meta.title.toUpperCase()} — PHASE 3 QUICK REFERENCE`,
    "",
    ...ruleLines,
    "ROOM SIGNS",
    "",
    ...roomLines,
  ].join("\n");
}

function buildArtifacts() {
  const legacyDocument = JSON.parse(readFileSync(legacyDocumentPath, "utf8"));
  const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
  const module = pack.modules[0];
  const phase3Components = module.components.filter(
    (component) =>
      !["sensory-profile", "read-aloud-profile", "session-guide"].includes(
        component.semanticType,
      ),
  );
  const session = createSessionStateFromLocationDocumentV1(legacyDocument, {
    id: "sedlec-ossuary-phase3",
    seed: "semantic-v2-sedlec-phase3-001",
    moduleId: module.id,
    selectedComponentIds: phase3Components.map((component) => component.id),
    preserveLegacySemanticOverview: false,
  });
  const result = compileDarkPlacesSemanticLocation({ pack, module, session });

  assert.equal(result.valid, true, "Phase 3 compiler result must be valid.");
  assert.equal(
    result.document.rooms.length,
    5,
    "Sedlec must retain five rooms.",
  );
  assert.equal(
    result.document.siteWide.globalRules.length,
    1,
    "Sedlec requires one Global Rule.",
  );
  assert.equal(
    result.document.siteWide.recurringSigns.length,
    4,
    "Sedlec requires four Recurring Signs.",
  );
  assert.ok(
    result.document.rooms.some((room) => room.recurringSigns.length),
    "Recurring Signs must be allocated to rooms.",
  );
  assert.equal(module.status, "in-review", "Human approval remains required.");

  return {
    "v2-content-pack.json": jsonText(pack),
    "v2-session-state.json": jsonText(session),
    "v2-location-document.json": jsonText(result.document),
    "v2-map-intent.json": jsonText(result.mapIntent),
    "v2-overview.md": createOverviewMarkdown(result.document),
    "v2-quick-reference.txt": createQuickReference(result.document),
  };
}

function createManifest(artifacts) {
  return `${GENERATED_FILENAMES.map(
    (filename) => `${sha256(artifacts[filename])}  ${filename}`,
  ).join("\n")}\n`;
}

function writeArtifacts(artifacts) {
  GENERATED_FILENAMES.forEach((filename) => {
    writeFileSync(path.join(fixtureDirectory, filename), artifacts[filename]);
  });
  writeFileSync(hashManifestPath, createManifest(artifacts));
}

function checkArtifacts(artifacts) {
  const failures = [];
  GENERATED_FILENAMES.forEach((filename) => {
    const filePath = path.join(fixtureDirectory, filename);
    if (!existsSync(filePath)) {
      failures.push(`${filename}: missing`);
      return;
    }
    if (readFileSync(filePath, "utf8") !== artifacts[filename]) {
      failures.push(`${filename}: differs from deterministic build`);
    }
  });
  if (!existsSync(hashManifestPath)) {
    failures.push("v2-fixture-files.sha256: missing");
  } else if (
    readFileSync(hashManifestPath, "utf8") !== createManifest(artifacts)
  ) {
    failures.push("v2-fixture-files.sha256: differs from deterministic build");
  }
  assert.deepEqual(failures, [], failures.join("\n"));
}

const mode = process.argv.includes("--write") ? "write" : "check";
const first = buildArtifacts();
const second = buildArtifacts();
assert.deepEqual(second, first, "Two independent Phase 3 builds must match.");

if (mode === "write") {
  writeArtifacts(first);
  console.log(
    `Dark Places semantic v2 Phase 3 fixtures written: ${GENERATED_FILENAMES.length} files.`,
  );
} else {
  checkArtifacts(first);
  console.log(
    `Dark Places semantic v2 Phase 3 fixtures verified: ${GENERATED_FILENAMES.length} deterministic files.`,
  );
}
