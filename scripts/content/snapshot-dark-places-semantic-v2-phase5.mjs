#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  adaptLocationDocumentV2ToV1,
  compileDarkPlacesSemanticLocation,
  createSessionStateFromLocationDocumentV1,
} from "../../features/darken-location/compiler/index.js";
import { createLocationSessionDashboardState } from "../../features/darken-location/output/model/location-session-dashboard-state.js";
import {
  SEDLEC_OSSUARY_SEMANTIC_V2_PACK,
  serializeCanonicalSemanticContent,
} from "../../shared/content/content.index.js";

const fixtureDirectory = path.join(
  process.cwd(),
  "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary",
);
const legacyDocumentPath = path.join(
  fixtureDirectory,
  "location-document-v1.json",
);
const hashManifestPath = path.join(
  fixtureDirectory,
  "v2-phase5-fixture-files.sha256",
);

const GENERATED_FILENAMES = Object.freeze([
  "v2-phase5-location-document.json",
  "v2-phase5-session-guide.json",
  "v2-phase5-table-session-state.json",
  "v2-phase5-output-view.json",
  "v2-phase5-at-the-table.md",
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

function createSessionGuideSnapshot(document) {
  return {
    schemaVersion: "cruor-dark-places-phase5-session-guide-snapshot-v1",
    buildId: document.id,
    documentVersion: document.schemaVersion,
    guide: document.sessionGuide,
  };
}

function createOutputSnapshot(document) {
  const output = adaptLocationDocumentV2ToV1(document);
  return {
    schemaVersion: "cruor-dark-places-phase5-output-snapshot-v1",
    buildId: output.source.documentId,
    documentVersion: output.source.documentSchemaVersion,
    title: output.meta.title,
    sessionGuide: output.sessionGuide,
  };
}

function createAtTheTableMarkdown(document) {
  const guide = document.sessionGuide;
  return [
    `# ${document.meta.title} — At the Table`,
    "",
    "## Start Here",
    "",
    `- **Situation:** ${guide.openingBeat.situation}`,
    `- **Immediate signal:** ${guide.openingBeat.immediateSignal}`,
    `- **Player decision:** ${guide.openingBeat.playerDecision}`,
    "",
    "### Immediate Objectives",
    "",
    ...guide.objectives.map((objective, index) => `${index + 1}. ${objective}`),
    "",
    "## Active Pressure",
    "",
    ...guide.pressureTracks.flatMap((track) => [
      `### ${track.metadata.dashboard.label} ${track.metadata.dashboard.minimum}–${track.metadata.dashboard.maximum}`,
      "",
      track.text,
      "",
      ...track.metadata.dashboard.thresholds.map(
        (threshold) => `- **${threshold.at}:** ${threshold.effect}`,
      ),
      "",
      `**Reduce or reset:** ${track.counterplay}`,
      "",
    ]),
    "## Clue Flow",
    "",
    ...guide.clueFlow.nodes.flatMap((node) => [
      `### ${node.title}${node.required ? " — Required" : ""}`,
      "",
      node.summary,
      "",
      ...node.evidence
        .filter(
          (entry, index, values) =>
            values.findIndex(
              (candidate) => candidate.roomId === entry.roomId,
            ) === index,
        )
        .map(
          (entry) =>
            `- Room ${String(entry.roomNumber).padStart(2, "0")} — ${entry.roomName}`,
        ),
      "",
    ]),
    "## When They Stall",
    "",
    ...guide.stallMoves.map((move) => `- **${move.trigger}** ${move.action}`),
    "",
    "## Room Shortcuts",
    "",
    ...guide.roomShortcuts.map(
      (shortcut) =>
        `- **${String(shortcut.number).padStart(2, "0")} ${shortcut.name}:** ${shortcut.role}${shortcut.escalation ? " · escalation" : ""}${shortcut.signal ? ` — ${shortcut.signal}` : ""}`,
    ),
    "",
  ].join("\n");
}

function buildArtifacts() {
  const legacyDocument = JSON.parse(readFileSync(legacyDocumentPath, "utf8"));
  const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
  const module = pack.modules[0];
  const session = createSessionStateFromLocationDocumentV1(legacyDocument, {
    id: "sedlec-ossuary-phase5",
    seed: "semantic-v2-sedlec-phase4-001",
    moduleId: module.id,
    selectedComponentIds: module.components.map((component) => component.id),
    preserveLegacySemanticOverview: false,
  });
  const result = compileDarkPlacesSemanticLocation({ pack, module, session });
  const document = result.document;
  const guide = document.sessionGuide;
  const tableSessionState = createLocationSessionDashboardState({
    buildId: document.id,
    documentVersion: document.schemaVersion,
    guide,
  });

  assert.equal(result.valid, true, "Phase 5 compiler result must be valid.");
  assert.deepEqual(result.diagnostics, [], "Phase 5 must emit no diagnostics.");
  assert.ok(
    result.stages.includes("build-clue-graph-and-session-guide"),
    "Stage 7 must be present.",
  );
  assert.equal(
    guide.pressureTracks.length,
    1,
    "Sedlec needs one pressure track.",
  );
  assert.equal(
    guide.alwaysOnRules.length,
    1,
    "Sedlec needs one rule reference.",
  );
  assert.equal(guide.stallMoves.length, 3, "Sedlec needs three stall moves.");
  assert.equal(guide.roomShortcuts.length, 5, "Sedlec needs five shortcuts.");
  guide.clueFlow.requiredRevelations.forEach((id) => {
    const node = guide.clueFlow.nodes.find((candidate) => candidate.id === id);
    assert.ok(node?.available, `${id} must be available.`);
    assert.ok(node.roomIds.length, `${id} must have room evidence.`);
  });
  assert.deepEqual(
    tableSessionState.pressureValues,
    { "ossuary-litany": 0 },
    "Runtime state must start from the authored track value.",
  );
  assert.deepEqual(
    tableSessionState.discoveredClueIds,
    [],
    "Runtime clue state must start undiscovered.",
  );
  assert.equal(module.status, "in-review", "Human approval remains required.");

  return {
    "v2-phase5-location-document.json": jsonText(document),
    "v2-phase5-session-guide.json": jsonText(
      createSessionGuideSnapshot(document),
    ),
    "v2-phase5-table-session-state.json": jsonText(tableSessionState),
    "v2-phase5-output-view.json": jsonText(createOutputSnapshot(document)),
    "v2-phase5-at-the-table.md": createAtTheTableMarkdown(document),
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
    failures.push("v2-phase5-fixture-files.sha256: missing");
  } else if (
    readFileSync(hashManifestPath, "utf8") !== createManifest(artifacts)
  ) {
    failures.push(
      "v2-phase5-fixture-files.sha256: differs from deterministic build",
    );
  }
  assert.deepEqual(failures, [], failures.join("\n"));
}

const mode = process.argv.includes("--write") ? "write" : "check";
const first = buildArtifacts();
const second = buildArtifacts();
assert.deepEqual(second, first, "Two independent Phase 5 builds must match.");

if (mode === "write") {
  writeArtifacts(first);
  console.log(
    `Dark Places semantic v2 Phase 5 fixtures written: ${GENERATED_FILENAMES.length} files.`,
  );
} else {
  checkArtifacts(first);
  console.log(
    `Dark Places semantic v2 Phase 5 fixtures verified: ${GENERATED_FILENAMES.length} deterministic files.`,
  );
}
