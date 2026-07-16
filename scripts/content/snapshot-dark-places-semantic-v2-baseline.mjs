#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

import { getCompilePreview } from "../../features/darken-location/composer/model/location-composer-output.js";
import {
  createDungeonBriefFromDarkenLocationSnapshot,
  createLocationRegionsFromDungeonBrief,
  createThemeDungeonBriefFromDarkenLocationSnapshot,
} from "../../features/darken-location/dungeon/dungeon-brief-generator.js";
import { createMapRequestFromDungeonBrief } from "../../features/darken-location/dungeon/dungeon-brief.js";
import { createConfigFromNormalizedMapRequest } from "../../features/darken-location/map-generator/map-generator.input.js";
import { generateMap } from "../../features/darken-location/map-generator/map-generator.pipeline.js";
import { createLocationDocument } from "../../features/darken-location/output/model/location-document.js";
import { SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK } from "../../shared/content/content-packs/sedlec-ossuary-inspiration-module-pack.js";
import { SEDLEC_OSSUARY_INSPIRATION_MODULE } from "../../shared/content/inspiration-modules/sedlec-ossuary.js";

const rootDir = process.cwd();
const fixtureDir = path.join(
  rootDir,
  "tests/fixtures/dark-places-semantic-v2/sedlec-ossuary",
);
const inputPath = path.join(fixtureDir, "baseline-input-v1.json");
const hashManifestPath = path.join(fixtureDir, "fixture-files.sha256");

const GENERATED_FILENAMES = Object.freeze([
  "current-inspiration-module-v1.json",
  "current-content-pack-v1.json",
  "composer-snapshot-v1.json",
  "dungeon-brief-summary-v1.json",
  "compiler-map-request-v1.json",
  "generated-map-preview-v1.json",
  "compile-preview-summary-v1.json",
  "location-document-v1.json",
  "room-key-v1.md",
  "table-ready-v1.txt",
]);

const OBSOLETE_FILENAMES = Object.freeze([
  "dungeon-brief-v1.json",
  "map-request-v1.json",
  "compile-preview-v1.json",
]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function jsonText(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function requireComponent(module, componentId) {
  const component = module.components.find((entry) => entry.id === componentId);
  assert.ok(component, `Missing Sedlec component: ${componentId}`);
  return component;
}

function createAssignment(componentId, slotId, regionId = "") {
  return {
    componentId,
    slotId,
    regionId,
    addedAt: 0,
  };
}

function createRoomAssignments(componentIds, slotId, regions) {
  assert.ok(componentIds.length, `No component ids configured for ${slotId}`);
  return regions.map((region, index) =>
    createAssignment(
      componentIds[index % componentIds.length],
      slotId,
      region.id,
    ),
  );
}

function selectComponentPlacement(placement = {}) {
  return {
    id: placement.id,
    componentId: placement.componentId,
    componentTitle: placement.componentTitle,
    slotId: placement.slotId,
    sourceRegionId: placement.sourceRegionId,
    regionId: placement.regionId,
    summary: placement.summary,
    text: placement.text,
    strategy: placement.strategy,
    visualCue: placement.visualCue,
    markerKind: placement.markerKind,
    propKind: placement.propKind,
    sourceAnchors: placement.sourceAnchors,
    subtype: placement.subtype,
    tableRole: placement.tableRole,
    mechanics: placement.mechanics,
    counterplay: placement.counterplay,
    narrative: placement.narrative,
    effect: placement.effect,
    provenance: placement.provenance,
  };
}

function selectDungeonBriefSummary(dungeonBrief = {}) {
  return {
    schemaVersion: dungeonBrief.schemaVersion,
    id: dungeonBrief.id,
    mode: dungeonBrief.mode,
    title: dungeonBrief.title,
    seed: dungeonBrief.seed,
    workflow: dungeonBrief.workflow,
    themeId: dungeonBrief.themeId,
    themeName: dungeonBrief.themeName,
    archetype: dungeonBrief.archetype,
    context: dungeonBrief.context,
    mapType: dungeonBrief.mapType,
    roomCount: dungeonBrief.roomCount,
    levelCount: dungeonBrief.levelCount,
    density: dungeonBrief.density,
    connectionStyle: dungeonBrief.connectionStyle,
    verticality: dungeonBrief.verticality,
    sourceAnchors: dungeonBrief.sourceAnchors,
    horror: dungeonBrief.horror,
    premise: dungeonBrief.premise,
    globalPalette: dungeonBrief.globalPalette,
    roomBriefs: (dungeonBrief.roomBriefs || []).map((room) => ({
      id: room.id,
      index: room.index,
      name: room.name,
      role: room.role,
      type: room.type,
      size: room.size,
      level: room.level,
      connectors: room.connectors,
      density: room.density,
      shape: room.shape,
      roomArchetype: room.roomArchetype,
      sourceRegionId: room.sourceRegionId,
      sourceAnchors: room.sourceAnchors,
      premise: room.premise,
      sensoryLayer: room.sensoryLayer,
      visualSigns: room.visualSigns,
      hazard: room.hazard,
      reward: room.reward,
      encounter: room.encounter,
      clue: room.clue,
      interaction: room.interaction,
      readAloud: room.readAloud,
      isSecretRoom: room.isSecretRoom,
      assignedSlotIds: room.assignedSlotIds,
      assignedComponentIds: (room.assignedComponents || []).map(
        (component) => component.id,
      ),
      componentPlacements: (room.componentPlacements || []).map(
        selectComponentPlacement,
      ),
    })),
    connections: dungeonBrief.connections,
    metadata: {
      createdFrom: dungeonBrief.metadata?.createdFrom,
      scale: dungeonBrief.metadata?.scale,
      complexity: dungeonBrief.metadata?.complexity,
      activeSlot: dungeonBrief.metadata?.activeSlot,
      activeSlotScope: dungeonBrief.metadata?.activeSlotScope,
      activeRegionId: dungeonBrief.metadata?.activeRegionId,
      slotAssignments: dungeonBrief.metadata?.slotAssignments,
      selectedComponentIds: (
        dungeonBrief.metadata?.selectedComponents || []
      ).map((component) => component.id),
      componentPlacements: (
        dungeonBrief.metadata?.componentPlacements || []
      ).map(selectComponentPlacement),
      connectionCount: dungeonBrief.metadata?.connectionCount,
    },
  };
}

function selectCompilerMapRequest(mapRequest = {}) {
  return {
    schemaVersion: "dark-places-compiler-map-request-v1-fixture",
    source: mapRequest.source,
    workflow: mapRequest.workflow,
    title: mapRequest.title,
    seed: mapRequest.seed,
    context: mapRequest.context,
    mapType: mapRequest.mapType,
    roomCount: mapRequest.roomCount,
    premise: mapRequest.premise,
    globalPalette: mapRequest.globalPalette,
    requiredRegions: (mapRequest.requiredRegions || []).map((region) => ({
      id: region.id,
      label: region.label,
      role: region.role,
      size: region.size,
      shape: region.shape,
      roomArchetype: region.roomArchetype,
      connectors: region.connectors,
      density: region.density,
      sourceRegionId: region.sourceRegionId,
      isSecretRoom: region.isSecretRoom,
    })),
    connections: mapRequest.connections || [],
    componentPlacements: (mapRequest.componentPlacements || []).map(
      selectComponentPlacement,
    ),
    manualOverrides: mapRequest.manualOverrides,
    metadata: {
      source: mapRequest.metadata?.source,
      dungeonBriefId: mapRequest.dungeonBrief?.id,
      dungeonBriefSchemaVersion: mapRequest.dungeonBrief?.schemaVersion,
      componentPlacementCount: mapRequest.componentPlacements?.length || 0,
    },
  };
}

function selectGeneratedMapPreview(generatedMap) {
  const locationEffectProps = (generatedMap.props || []).filter(
    (prop) => prop.locationEffect,
  );

  return {
    schemaVersion: "dark-places-generated-map-preview-v1-fixture",
    seed: generatedMap.seed,
    bounds: generatedMap.bounds,
    contentBounds: generatedMap.contentBounds,
    regions: (generatedMap.regions || []).map((region) => ({
      id: region.id,
      sourceRegionId: region.sourceRegionId,
      name: region.name,
      number: region.number,
      level: region.level,
      role: region.role,
      graphRole: region.graphRole,
      shape: region.shape,
      cellRect: region.cellRect,
      labelPoint: region.labelPoint,
    })),
    corridors: (generatedMap.corridors || []).map((corridor) => ({
      id: corridor.id,
      from: corridor.from,
      to: corridor.to,
      kind: corridor.kind,
      corridorType: corridor.corridorType,
      secret: corridor.secret,
      locked: corridor.locked,
      fromLevel: corridor.fromLevel,
      toLevel: corridor.toLevel,
      levelDelta: corridor.levelDelta,
      crossLevel: corridor.crossLevel,
      stairTransition: corridor.stairTransition,
    })),
    accesses: (generatedMap.accesses || []).map((access) => ({
      id: access.id,
      regionId: access.regionId,
      kind: access.kind,
      secret: access.secret,
      locked: access.locked,
    })),
    locationEffectProps: locationEffectProps.map((prop) => ({
      id: prop.id,
      kind: prop.kind,
      regionId: prop.regionId,
      locationEffectComponentId: prop.locationEffectComponentId,
      locationEffectSlotId: prop.locationEffectSlotId,
    })),
    summary: {
      regionCount: generatedMap.regions?.length || 0,
      corridorCount: generatedMap.corridors?.length || 0,
      accessCount: generatedMap.accesses?.length || 0,
      propCount: generatedMap.props?.length || 0,
      locationEffectPropCount: locationEffectProps.length,
    },
  };
}

function selectCompilePreviewSummary(compilePreview = {}) {
  return {
    schemaVersion: "dark-places-compile-preview-v1-fixture",
    title: compilePreview.title,
    contextLine: compilePreview.contextLine,
    filledSlots: compilePreview.filledSlots,
    totalSlots: compilePreview.totalSlots,
    regionCount: compilePreview.regionCount,
    readyRoomCount: compilePreview.readyRoomCount,
    incompleteRoomCount: compilePreview.incompleteRoomCount,
    premiseSection: compilePreview.premiseSection,
    locationPremiseText: compilePreview.locationPremiseText,
    components: (compilePreview.componentSections || []).map((component) => ({
      id: component.id,
      title: component.title,
      slotId: component.slotId,
      regionId: component.regionId,
      text: component.text,
      sourceAnchors: component.sourceAnchors,
    })),
    rooms: (compilePreview.roomSections || []).map((room) => ({
      id: room.id,
      heading: room.heading,
      roomNumber: room.roomNumber,
      role: room.role,
      readAloud: room.readAloud,
      premise: room.premise,
      sensory: room.sensory,
      feature: room.feature,
      danger: room.danger,
      secret: room.secret,
      reward: room.reward,
      componentIds: (room.components || []).map((component) => component.id),
      placedComponentIds: (room.placedComponents || []).map(
        (component) => component.id,
      ),
      completedSlotIds: room.completedSlotIds,
      missingSlotIds: room.missingSlotIds,
      readinessStatus: room.readinessStatus,
    })),
    atTheTableRows: compilePreview.atTheTableRows,
    mapSyncStatus: compilePreview.mapSyncStatus,
    mapNotes: compilePreview.mapNotes,
  };
}

function buildArtifacts(input) {
  const module = SEDLEC_OSSUARY_INSPIRATION_MODULE;
  assert.ok(module, `Missing Inspiration Module: ${input.moduleId}`);
  assert.equal(
    module.id,
    input.moduleId,
    "Sedlec legacy baseline module changed",
  );

  const composer = {
    workflow: "darken-location",
    title: input.composer.title,
    context: input.composer.context,
    horrors: input.composer.horrors,
    sourceAnchors: input.composer.sourceAnchors,
    intrusion: input.composer.intrusion,
    seed: input.seed,
    dungeonMode: "theme",
    dungeonThemeId: input.moduleId,
    dungeonScale: input.composer.dungeonScale,
    dungeonCustomRoomCount: input.roomCount,
    dungeonComplexity: input.composer.dungeonComplexity,
    activeSlot: "horrorPremise",
    activeSlotScope: "map",
    activeRegionId: "",
  };

  const themeBrief =
    createThemeDungeonBriefFromDarkenLocationSnapshot(composer);
  const locationRegions = createLocationRegionsFromDungeonBrief(
    themeBrief,
  ).slice(0, input.roomCount);
  assert.equal(
    locationRegions.length,
    input.roomCount,
    "Theme baseline did not produce the requested room count",
  );

  const slotAssignments = {
    horrorPremise: [
      createAssignment(input.components.premise, "horrorPremise"),
    ],
    sensoryLayer: input.components.sensory.map((componentId) =>
      createAssignment(componentId, "sensoryLayer"),
    ),
    visibleAnomaly: [
      createAssignment(input.components.visibleAnomaly, "visibleAnomaly"),
    ],
    reward: [createAssignment(input.components.reward, "reward")],
    hazard: createRoomAssignments(
      input.components.hazards,
      "hazard",
      locationRegions,
    ),
    clue: createRoomAssignments(
      input.components.clues,
      "clue",
      locationRegions,
    ),
    encounterTwist: createRoomAssignments(
      input.components.encounterTwists,
      "encounterTwist",
      locationRegions,
    ),
  };

  const selectedComponentIds = [
    input.components.premise,
    ...input.components.sensory,
    input.components.visibleAnomaly,
    input.components.reward,
    ...input.components.hazards,
    ...input.components.clues,
    ...input.components.encounterTwists,
  ].filter(
    (componentId, index, values) => values.indexOf(componentId) === index,
  );
  const selectedComponents = selectedComponentIds.map((componentId) =>
    requireComponent(module, componentId),
  );

  const composerSnapshot = {
    schemaVersion: "dark-places-composer-snapshot-v1-fixture",
    baselineCommit: input.baselineCommit,
    ...composer,
    activeRegionId: locationRegions[0]?.id || "",
    locationRegions,
    slotAssignments,
    selectedComponents,
  };
  const dungeonBrief =
    createDungeonBriefFromDarkenLocationSnapshot(composerSnapshot);
  const fullMapRequest = createMapRequestFromDungeonBrief(dungeonBrief, {
    snapshot: composerSnapshot,
  });
  const generatedMap = generateMap(
    createConfigFromNormalizedMapRequest(fullMapRequest),
  );
  const mapRequest = selectCompilerMapRequest(fullMapRequest);
  const generatedMapPreview = selectGeneratedMapPreview(generatedMap);
  const state = {
    ...composerSnapshot,
    sourceAnchors: new Set(composerSnapshot.sourceAnchors),
    horrors: new Set(composerSnapshot.horrors),
  };
  const digest = {
    filledSlots: Object.values(slotAssignments).filter(
      (assignments) => assignments.length,
    ).length,
    totalSlots: 7,
  };
  const compilePreview = getCompilePreview(
    state,
    digest,
    mapRequest,
    generatedMapPreview,
  );
  const locationDocument = createLocationDocument({
    state,
    digest,
    mapRequest,
    generatedMapPreview,
    compilePreview,
  });

  assert.equal(module.components.length, 28, "Sedlec component count changed");
  assert.equal(generatedMapPreview.regions.length, input.roomCount);
  assert.equal(compilePreview.readyRoomCount, input.roomCount);
  assert.equal(compilePreview.incompleteRoomCount, 0);
  assert.equal(locationDocument.schemaVersion, "dark-places-document-v1");
  assert.equal(locationDocument.rooms.length, input.roomCount);

  return {
    "current-inspiration-module-v1.json": jsonText(module),
    "current-content-pack-v1.json": jsonText(
      SEDLEC_OSSUARY_INSPIRATION_MODULE_CONTENT_PACK,
    ),
    "composer-snapshot-v1.json": jsonText(composerSnapshot),
    "dungeon-brief-summary-v1.json": jsonText(
      selectDungeonBriefSummary(dungeonBrief),
    ),
    "compiler-map-request-v1.json": jsonText(mapRequest),
    "generated-map-preview-v1.json": jsonText(generatedMapPreview),
    "compile-preview-summary-v1.json": jsonText(
      selectCompilePreviewSummary(compilePreview),
    ),
    "location-document-v1.json": jsonText(locationDocument),
    "room-key-v1.md": `${compilePreview.roomKeyMarkdown}\n`,
    "table-ready-v1.txt": `${compilePreview.tableReadyText}\n`,
  };
}

function buildHashManifest(artifacts) {
  const rows = [
    {
      filename: "baseline-input-v1.json",
      content: readFileSync(inputPath),
    },
    ...GENERATED_FILENAMES.map((filename) => ({
      filename,
      content: Buffer.from(artifacts[filename], "utf8"),
    })),
  ];

  return `${rows
    .map(({ filename, content }) => `${sha256(content)}  ${filename}`)
    .join("\n")}\n`;
}

function writeArtifacts(artifacts) {
  mkdirSync(fixtureDir, { recursive: true });
  for (const filename of OBSOLETE_FILENAMES) {
    rmSync(path.join(fixtureDir, filename), { force: true });
  }
  for (const filename of GENERATED_FILENAMES) {
    writeFileSync(path.join(fixtureDir, filename), artifacts[filename], "utf8");
  }
  writeFileSync(hashManifestPath, buildHashManifest(artifacts), "utf8");
}

function checkArtifacts(artifacts) {
  const issues = [];
  for (const filename of GENERATED_FILENAMES) {
    const filePath = path.join(fixtureDir, filename);
    if (!existsSync(filePath)) {
      issues.push(`Missing fixture: ${filename}`);
      continue;
    }
    const actual = readFileSync(filePath, "utf8");
    if (actual !== artifacts[filename]) {
      issues.push(`Fixture drift: ${filename}`);
    }
  }

  if (!existsSync(hashManifestPath)) {
    issues.push("Missing fixture hash manifest: fixture-files.sha256");
  } else {
    const expectedHashes = buildHashManifest(artifacts);
    const actualHashes = readFileSync(hashManifestPath, "utf8");
    if (actualHashes !== expectedHashes) {
      issues.push("Fixture hash manifest drift: fixture-files.sha256");
    }
  }

  if (issues.length) {
    throw new Error(issues.join("\n"));
  }
}

function main() {
  assert.ok(existsSync(inputPath), `Missing fixture input: ${inputPath}`);
  const input = readJson(inputPath);
  const first = buildArtifacts(input);
  const second = buildArtifacts(input);
  assert.deepEqual(second, first, "Baseline generation is not deterministic");

  if (process.argv.includes("--write")) {
    writeArtifacts(first);
    console.log(
      `Dark Places semantic v2 baseline written: ${GENERATED_FILENAMES.length} generated files.`,
    );
    return;
  }

  checkArtifacts(first);
  console.log(
    `Dark Places semantic v2 baseline verified: ${GENERATED_FILENAMES.length} generated files, deterministic output.`,
  );
}

main();
