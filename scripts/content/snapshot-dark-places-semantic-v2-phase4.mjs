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
  "v2-phase4-fixture-files.sha256",
);

const GENERATED_FILENAMES = Object.freeze([
  "v2-phase4-location-document.json",
  "v2-phase4-sensory-allocation.json",
  "v2-phase4-export-view.json",
  "v2-phase4-rooms.md",
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

function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function createSensorySnapshot(document) {
  return {
    schemaVersion: "cruor-dark-places-phase4-sensory-snapshot-v1",
    seed: document.seed,
    rooms: document.rooms.map((room) => ({
      id: room.id,
      number: room.number,
      name: room.name,
      role: room.role,
      shape: room.shape,
      impressions: room.immediateImpressions.map((block) => ({
        id: block.id,
        text: block.text,
        sourceComponentId: block.sourceComponentId,
        sourceFragmentId: block.metadata.sourceFragmentId,
        sense: block.metadata.sense,
        intensity: block.metadata.intensity,
        contextKind: block.metadata.contextKind,
        contextMatch: block.metadata.contextMatch,
      })),
    })),
  };
}

function createExportSnapshot(document) {
  const view = adaptLocationDocumentV2ToV1(document);
  return {
    schemaVersion: "cruor-dark-places-phase4-export-snapshot-v1",
    title: view.meta.title,
    rooms: view.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      readAloud: room.readAloud,
    })),
  };
}

function createRoomMarkdown(document) {
  return [
    `# ${document.meta.title} — Phase 4 Rooms`,
    "",
    ...document.rooms.flatMap((room) => [
      `## ${String(room.number).padStart(2, "0")} ${room.name.replace(/^\d+\s+/, "")}`,
      "",
      `Role: ${room.role} · Shape: ${room.shape} · Level: ${room.level}`,
      "",
      "### Read-Aloud — Standard",
      "",
      room.readAloud.standard,
      "",
      "### Immediate Impressions",
      "",
      ...room.immediateImpressions.map(
        (block) =>
          `- **${block.title}:** ${block.text} _(${block.metadata.intensity}${block.metadata.sense ? `, ${block.metadata.sense}` : ""})_`,
      ),
      "",
      `Compact: ${countWords(room.readAloud.compact)} words · Standard: ${countWords(room.readAloud.standard)} words · Extended: ${countWords(room.readAloud.extended)} words`,
      "",
    ]),
  ].join("\n");
}

function buildArtifacts() {
  const legacyDocument = JSON.parse(readFileSync(legacyDocumentPath, "utf8"));
  const pack = SEDLEC_OSSUARY_SEMANTIC_V2_PACK;
  const module = pack.modules[0];
  const phase4Components = module.components.filter(
    (component) => component.semanticType !== "session-guide",
  );
  const session = createSessionStateFromLocationDocumentV1(legacyDocument, {
    id: "sedlec-ossuary-phase4",
    seed: "semantic-v2-sedlec-phase4-001",
    moduleId: module.id,
    selectedComponentIds: phase4Components.map((component) => component.id),
    preserveLegacySemanticOverview: false,
  });
  const result = compileDarkPlacesSemanticLocation({ pack, module, session });
  const document = result.document;
  const impressionTexts = document.rooms.flatMap((room) =>
    room.immediateImpressions.map((block) => block.text),
  );

  assert.equal(result.valid, true, "Phase 4 compiler result must be valid.");
  assert.deepEqual(result.diagnostics, [], "Phase 4 must emit no diagnostics.");
  assert.equal(document.rooms.length, 5, "Sedlec must retain five rooms.");
  assert.equal(
    new Set(impressionTexts).size,
    impressionTexts.length,
    "Immediate Impressions must be exact-unique.",
  );
  document.rooms.forEach((room) => {
    assert.equal(
      room.immediateImpressions.length,
      3,
      `${room.name} must receive three impressions.`,
    );
    assert.ok(
      countWords(room.readAloud.standard) >= 45 &&
        countWords(room.readAloud.standard) <= 75,
      `${room.name} standard Read-Aloud must contain 45-75 words.`,
    );
    assert.equal(
      room.readAloud.fragments.some((fragment) =>
        (fragment.metadata.tags || []).some((tag) =>
          ["secret", "solution", "gm-only", "future-reveal"].includes(tag),
        ),
      ),
      false,
      `${room.name} must not expose spoiler-tagged fragments.`,
    );
  });
  assert.equal(module.status, "in-review", "Human approval remains required.");

  return {
    "v2-phase4-location-document.json": jsonText(document),
    "v2-phase4-sensory-allocation.json": jsonText(
      createSensorySnapshot(document),
    ),
    "v2-phase4-export-view.json": jsonText(createExportSnapshot(document)),
    "v2-phase4-rooms.md": createRoomMarkdown(document),
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
    failures.push("v2-phase4-fixture-files.sha256: missing");
  } else if (
    readFileSync(hashManifestPath, "utf8") !== createManifest(artifacts)
  ) {
    failures.push(
      "v2-phase4-fixture-files.sha256: differs from deterministic build",
    );
  }
  assert.deepEqual(failures, [], failures.join("\n"));
}

const mode = process.argv.includes("--write") ? "write" : "check";
const first = buildArtifacts();
const second = buildArtifacts();
assert.deepEqual(second, first, "Two independent Phase 4 builds must match.");

if (mode === "write") {
  writeArtifacts(first);
  console.log(
    `Dark Places semantic v2 Phase 4 fixtures written: ${GENERATED_FILENAMES.length} files.`,
  );
} else {
  checkArtifacts(first);
  console.log(
    `Dark Places semantic v2 Phase 4 fixtures verified: ${GENERATED_FILENAMES.length} deterministic files.`,
  );
}
