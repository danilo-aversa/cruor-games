import { mkdir, writeFile } from "node:fs/promises";
import { DEFAULT_CONFIG } from "../features/darken-location/map-generator/map-generator.input.js";
import { generateMap } from "../features/darken-location/map-generator/map-generator.pipeline.js";
import {
  ROOM_ARCHETYPES_BY_ID,
  ROOM_ARCHETYPE_SCHEMA_VERSION,
  getRoomArchetypeDefinition,
  resolveRoomArchetype,
} from "../features/darken-location/map-generator/map-generator.profile.js";

const OUTPUT_DIR = new URL("../dist/qa/", import.meta.url);
const failOnWarnings = process.argv.includes("--fail-on-warnings");
const writeReport = !process.argv.includes("--no-report");

const EXPECTED_ARCHETYPES = Object.freeze({
  "crypt-burial-cell": Object.freeze({
    label: "Burial Cell",
    maskProfile: "burial-cell",
    detailProfile: "burial-cell",
    signatureProp: "burial-slab",
    topology: "side",
  }),
  "ossuary-gallery": Object.freeze({
    label: "Ossuary Gallery",
    maskProfile: "ossuary-gallery",
    detailProfile: "ossuary-gallery",
    signatureProp: "ossuary-niche-row",
    topology: "main",
  }),
  "reliquary-niche": Object.freeze({
    label: "Reliquary Niche",
    maskProfile: "reliquary-niche",
    detailProfile: "reliquary-niche",
    signatureProp: "reliquary-shrine",
    topology: "side",
  }),
  "charnel-vault": Object.freeze({
    label: "Charnel Vault",
    maskProfile: "charnel-vault",
    detailProfile: "charnel-vault",
    signatureProp: "charnel-heap",
    topology: "main-or-side",
  }),
  "sealed-family-tomb": Object.freeze({
    label: "Sealed Family Tomb",
    maskProfile: "sealed-family-tomb",
    detailProfile: "sealed-family-tomb",
    signatureProp: "sealed-tomb-slab",
    topology: "side",
  }),
  "processional-crypt-hall": Object.freeze({
    label: "Processional Crypt Hall",
    maskProfile: "processional-crypt-hall",
    detailProfile: "processional-crypt-hall",
    signatureProp: "processional-axis",
    topology: "main",
  }),
  "bone-well": Object.freeze({
    label: "Bone Well",
    maskProfile: "bone-well",
    detailProfile: "bone-well",
    signatureProp: "bone-well-rim",
    topology: "main",
  }),
  "hidden-reliquary": Object.freeze({
    label: "Hidden Reliquary",
    maskProfile: "hidden-reliquary",
    detailProfile: "hidden-reliquary",
    signatureProp: "hidden-relic-cache",
    topology: "secret",
  }),
});

function createIssue(severity, area, check, message, data = {}) {
  return { severity, area, check, message, data };
}

function addIssue(issues, severity, area, check, message, data = {}) {
  issues.push(createIssue(severity, area, check, message, data));
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function createArchetypeRegion(archetypeId, index) {
  const archetype = EXPECTED_ARCHETYPES[archetypeId];
  const isEntrance = archetypeId === "processional-crypt-hall";
  const roleByArchetype = {
    "crypt-burial-cell": "Side Burial Cell",
    "ossuary-gallery": "Connector / Ossuary Gallery",
    "reliquary-niche": "Clue Room / Reliquary Niche",
    "charnel-vault": "Hazard Room / Charnel Vault",
    "sealed-family-tomb": "Side Tomb / Family Tomb",
    "processional-crypt-hall": "Entrance / Threshold / Processional Hall",
    "bone-well": "Hazard / Setpiece / Vertical Room",
    "hidden-reliquary": "Secret / Lore Room",
  };
  const tagsByArchetype = {
    "crypt-burial-cell": ["burial", "side"],
    "ossuary-gallery": ["connector", "ossuary", "gallery"],
    "reliquary-niche": ["clue", "reliquary"],
    "charnel-vault": ["hazard", "charnel"],
    "sealed-family-tomb": ["tomb", "side"],
    "processional-crypt-hall": ["entrance", "threshold", "connector"],
    "bone-well": ["hazard", "vertical", "well"],
    "hidden-reliquary": ["secret", "lore", "archive"],
  };
  const sizeByArchetype = {
    "crypt-burial-cell": "Small",
    "ossuary-gallery": "Medium",
    "reliquary-niche": "Small",
    "charnel-vault": "Large",
    "sealed-family-tomb": "Medium",
    "processional-crypt-hall": "Medium",
    "bone-well": "Large",
    "hidden-reliquary": "Small",
  };
  return {
    id: archetypeId,
    name: archetype.label,
    role: roleByArchetype[archetypeId] || "Location Region",
    size: sizeByArchetype[archetypeId] || "Medium",
    preferredShape: "rect",
    connectors: isEntrance ? 2 : 1,
    tags: tagsByArchetype[archetypeId] || [],
    sourceAnchors: ["Sedlec Ossuary"],
    roomArchetype: archetypeId,
    isEntrance: isEntrance || index === 0,
    secret: archetypeId === "hidden-reliquary",
  };
}

function createExplicitArchetypeConfig() {
  const archetypeIds = Object.keys(EXPECTED_ARCHETYPES);
  const orderedIds = [
    "processional-crypt-hall",
    ...archetypeIds.filter((id) => id !== "processional-crypt-hall"),
  ];
  return {
    ...DEFAULT_CONFIG,
    seed: "map-archetype-qa-explicit-suite",
    context: "Crypt",
    biome: "Crypt",
    contextGraphAdapterMode: "safe",
    roomCount: orderedIds.length,
    regions: orderedIds.map(createArchetypeRegion),
  };
}

function createMapInfluenceConfig(targetRegion) {
  const entrance = createArchetypeRegion("processional-crypt-hall", 0);
  return {
    ...DEFAULT_CONFIG,
    seed: `map-archetype-qa-${targetRegion.id}`,
    context: "Crypt",
    biome: "Crypt",
    contextGraphAdapterMode: "safe",
    roomCount: 2,
    regions: [entrance, targetRegion],
  };
}

function getRegion(map, regionId) {
  return asArray(map?.regions).find((region) => region.id === regionId) || null;
}

function getRegionProps(map, regionId) {
  return asArray(map?.props).filter((prop) => prop.regionId === regionId);
}

function hasEdgeTouching(map, regionId, predicate = () => true) {
  return asArray(map?.graph).some(
    (edge) => (edge.from === regionId || edge.to === regionId) && predicate(edge),
  );
}

function validateStructuralMap(map, config, issues, sampleId) {
  const expectedRegionIds = new Set(asArray(config?.regions).map((region) => region.id));
  const generatedRegionIds = new Set(asArray(map?.regions).map((region) => region.id));
  [...expectedRegionIds].forEach((regionId) => {
    if (!generatedRegionIds.has(regionId)) {
      addIssue(issues, "error", "structure", "missing-region", `Generated map is missing expected region ${regionId}.`, { sampleId, regionId });
    }
  });
  if (!asArray(map?.regions).length) {
    addIssue(issues, "error", "structure", "empty-map", "Generated map has no regions.", { sampleId });
  }
  if (!asArray(map?.dungeonMask?.floorCells).length) {
    addIssue(issues, "error", "structure", "empty-floor-mask", "Generated map has no floor cells.", { sampleId });
  }
  asArray(map?.regions).forEach((region) => {
    if (!asArray(region.floorCells).length) {
      addIssue(issues, "error", "structure", "empty-room-floor", `${region.id} has no floor cells.`, { sampleId, regionId: region.id });
    }
  });
}

function validateArchetypeSchema(issues) {
  const actualIds = Object.keys(ROOM_ARCHETYPES_BY_ID).sort();
  const expectedIds = Object.keys(EXPECTED_ARCHETYPES).sort();
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    addIssue(
      issues,
      "error",
      "schema",
      "archetype-id-set",
      "The registered crypt room archetype IDs do not match the QA harness expectation.",
      { expectedIds, actualIds },
    );
  }

  expectedIds.forEach((archetypeId) => {
    const definition = getRoomArchetypeDefinition(archetypeId);
    const expected = EXPECTED_ARCHETYPES[archetypeId];
    if (!definition) {
      addIssue(issues, "error", "schema", "missing-definition", `Missing archetype definition: ${archetypeId}`, { archetypeId });
      return;
    }
    ["shape", "roomType", "maskProfile", "detailProfile", "sizeByPreset"].forEach((field) => {
      if (!definition[field]) {
        addIssue(issues, "error", "schema", "missing-field", `${archetypeId} is missing ${field}.`, { archetypeId, field });
      }
    });
    if (definition.label !== expected.label) {
      addIssue(issues, "warning", "schema", "label-drift", `${archetypeId} label changed.`, {
        archetypeId,
        expected: expected.label,
        actual: definition.label,
      });
    }
    if (definition.maskProfile !== expected.maskProfile) {
      addIssue(issues, "error", "schema", "mask-profile-drift", `${archetypeId} maskProfile changed.`, {
        archetypeId,
        expected: expected.maskProfile,
        actual: definition.maskProfile,
      });
    }
    if (definition.detailProfile !== expected.detailProfile) {
      addIssue(issues, "error", "schema", "detail-profile-drift", `${archetypeId} detailProfile changed.`, {
        archetypeId,
        expected: expected.detailProfile,
        actual: definition.detailProfile,
      });
    }
  });
}

function validateResolverRegression(issues) {
  const soft = resolveRoomArchetype(
    {
      id: "resolver-soft-bone-well",
      role: "Hazard Room",
      tags: ["hazard"],
      mapInfluence: {
        preferredRoomArchetypes: ["bone-well"],
        source: "map-archetype-qa",
      },
    },
    "crypt",
  );
  if (soft?.id !== "bone-well" || soft?.source !== "map-influence") {
    addIssue(issues, "error", "resolver", "soft-map-influence", "Soft mapInfluence should resolve to bone-well from map-influence.", { actual: soft });
  }

  const fallback = resolveRoomArchetype(
    {
      id: "resolver-forbidden-fallback",
      role: "Clue Room",
      tags: ["clue"],
      mapInfluence: {
        preferredRoomArchetypes: ["bone-well", "reliquary-niche"],
        forbiddenRoomArchetypes: ["bone-well"],
        source: "map-archetype-qa",
      },
    },
    "crypt",
  );
  if (fallback?.id !== "reliquary-niche" || fallback?.source !== "map-influence") {
    addIssue(issues, "error", "resolver", "forbidden-fallback", "Forbidden fallback should resolve to reliquary-niche from map-influence.", { actual: fallback });
  }

  const forced = resolveRoomArchetype(
    {
      id: "resolver-forced-hidden-reliquary",
      role: "Secret Room",
      tags: ["secret"],
      mapInfluence: {
        roomArchetype: "hidden-reliquary",
        preferredRoomArchetypes: ["hidden-reliquary"],
        forbiddenRoomArchetypes: ["hidden-reliquary"],
        forceRoomArchetype: true,
        source: "map-archetype-qa",
      },
    },
    "crypt",
  );
  if (forced?.id !== "hidden-reliquary" || forced?.source !== "map-influence") {
    addIssue(issues, "error", "resolver", "forced-beats-forbidden", "Forced mapInfluence should resolve to hidden-reliquary even when forbidden.", { actual: forced });
  }
}

function validateGeneratedArchetypeRegion(map, archetypeId, issues) {
  const expected = EXPECTED_ARCHETYPES[archetypeId];
  const region = getRegion(map, archetypeId);
  if (!region) {
    addIssue(issues, "error", "generated-map", "missing-region", `Generated map is missing ${archetypeId}.`, { archetypeId });
    return;
  }

  if (region.roomArchetype !== archetypeId) {
    addIssue(issues, "error", "generated-map", "resolved-archetype", `${archetypeId} resolved as ${region.roomArchetype || "empty"}.`, {
      archetypeId,
      actual: region.roomArchetype,
    });
  }
  if (region.roomArchetypeSource !== "explicit") {
    addIssue(issues, "error", "generated-map", "explicit-source", `${archetypeId} should keep roomArchetypeSource explicit.`, {
      archetypeId,
      actual: region.roomArchetypeSource,
    });
  }
  if (region.roomArchetypeResolution?.resolvedRoomArchetype !== archetypeId) {
    addIssue(issues, "error", "debug", "resolution-id", `${archetypeId} resolution summary is not aligned.`, {
      archetypeId,
      resolution: region.roomArchetypeResolution,
    });
  }
  if (region.roomArchetypeResolution?.resolvedRoomArchetypeSource !== "explicit") {
    addIssue(issues, "error", "debug", "resolution-source", `${archetypeId} resolution source should be explicit.`, {
      archetypeId,
      resolution: region.roomArchetypeResolution,
    });
  }
  if (region.shapeOptions?.maskProfile !== expected.maskProfile) {
    addIssue(issues, "error", "geometry", "mask-profile", `${archetypeId} has wrong maskProfile.`, {
      archetypeId,
      expected: expected.maskProfile,
      actual: region.shapeOptions?.maskProfile,
    });
  }
  if (region.shapeOptions?.detailProfile !== expected.detailProfile) {
    addIssue(issues, "error", "details", "detail-profile", `${archetypeId} has wrong detailProfile.`, {
      archetypeId,
      expected: expected.detailProfile,
      actual: region.shapeOptions?.detailProfile,
    });
  }
  if (!asArray(region.floorCells).length) {
    addIssue(issues, "error", "geometry", "floor-cells", `${archetypeId} has no floor cells.`, { archetypeId });
  }

  const props = getRegionProps(map, archetypeId);
  const signatureProp = props.find((prop) => prop.kind === expected.signatureProp);
  if (!signatureProp) {
    addIssue(issues, "error", "details", "signature-prop", `${archetypeId} is missing signature prop ${expected.signatureProp}.`, {
      archetypeId,
      expected: expected.signatureProp,
      actualProps: props.map((prop) => prop.kind),
    });
  } else {
    if (!signatureProp.archetypeSignature) {
      addIssue(issues, "error", "details", "signature-prop-flag", `${archetypeId} signature prop is not marked archetypeSignature.`, {
        archetypeId,
        prop: signatureProp,
      });
    }
    if (signatureProp.detailProfile !== expected.detailProfile || signatureProp.archetypeCue !== expected.detailProfile) {
      addIssue(issues, "error", "details", "signature-prop-profile", `${archetypeId} signature prop has wrong profile metadata.`, {
        archetypeId,
        expected: expected.detailProfile,
        prop: signatureProp,
      });
    }
  }
}

function validateTopologyBias(map, issues) {
  if (!hasEdgeTouching(map, "hidden-reliquary", (edge) => edge.secret || edge.kind === "secret")) {
    addIssue(issues, "error", "topology", "hidden-reliquary-secret", "hidden-reliquary should be connected as a secret branch.", {
      edges: asArray(map?.graph).filter((edge) => edge.from === "hidden-reliquary" || edge.to === "hidden-reliquary"),
    });
  }

  ["processional-crypt-hall", "ossuary-gallery", "bone-well"].forEach((archetypeId) => {
    if (!hasEdgeTouching(map, archetypeId, (edge) => edge.kind === "critical" || edge.kind === "main")) {
      addIssue(issues, "warning", "topology", "main-path-bias", `${archetypeId} is not touching a main/critical edge in the explicit suite.`, {
        archetypeId,
        edges: asArray(map?.graph).filter((edge) => edge.from === archetypeId || edge.to === archetypeId),
      });
    }
  });
}

function validateMapInfluenceGeneratedCase(issues, sample) {
  const map = generateMap(createMapInfluenceConfig(sample.region));
  validateStructuralMap(map, map.config || createMapInfluenceConfig(sample.region), issues, sample.id);
  const region = getRegion(map, sample.region.id);
  if (!region) {
    addIssue(issues, "error", "map-influence", "missing-region", `${sample.id} region was not generated.`, { sample });
    return;
  }
  if (region.roomArchetype !== sample.expectedArchetype) {
    addIssue(issues, "error", "map-influence", "resolved-archetype", `${sample.id} resolved to the wrong archetype.`, {
      expected: sample.expectedArchetype,
      actual: region.roomArchetype,
      resolution: region.roomArchetypeResolution,
    });
  }
  if (region.roomArchetypeSource !== "map-influence") {
    addIssue(issues, "error", "map-influence", "source", `${sample.id} should resolve from map-influence.`, {
      actual: region.roomArchetypeSource,
      resolution: region.roomArchetypeResolution,
    });
  }
  if (region.roomArchetypeResolution?.resolvedRoomArchetypeSource !== "map-influence") {
    addIssue(issues, "error", "map-influence", "debug-source", `${sample.id} debug source should be map-influence.`, {
      resolution: region.roomArchetypeResolution,
    });
  }
  if (sample.expectedForce && !region.roomArchetypeResolution?.hasForce) {
    addIssue(issues, "error", "map-influence", "forced-flag", `${sample.id} should expose hasForce in debug resolution.`, {
      resolution: region.roomArchetypeResolution,
    });
  }
  if (sample.expectedForbidden?.length) {
    const forbidden = region.roomArchetypeResolution?.forbiddenRoomArchetypes || [];
    sample.expectedForbidden.forEach((id) => {
      if (!forbidden.includes(id)) {
        addIssue(issues, "error", "map-influence", "forbidden-debug", `${sample.id} should preserve forbidden ${id}.`, {
          expected: sample.expectedForbidden,
          actual: forbidden,
        });
      }
    });
  }

  const expected = EXPECTED_ARCHETYPES[sample.expectedArchetype];
  const props = getRegionProps(map, sample.region.id);
  if (!props.some((prop) => prop.kind === expected.signatureProp && prop.archetypeSignature)) {
    addIssue(issues, "error", "map-influence", "signature-prop", `${sample.id} should render signature prop for ${sample.expectedArchetype}.`, {
      expectedProp: expected.signatureProp,
      actualProps: props.map((prop) => prop.kind),
    });
  }
}

function validateExplicitGeneratedSuite(issues) {
  const config = createExplicitArchetypeConfig();
  const map = generateMap(config);
  validateStructuralMap(map, config, issues, "explicit-archetype-suite");
  Object.keys(EXPECTED_ARCHETYPES).forEach((archetypeId) =>
    validateGeneratedArchetypeRegion(map, archetypeId, issues),
  );
  validateTopologyBias(map, issues);
  return map;
}

function validateMapInfluenceCases(issues) {
  const samples = [
    {
      id: "soft-bone-well",
      expectedArchetype: "bone-well",
      region: {
        id: "soft-bone-well",
        name: "Soft Bone Well Influence",
        role: "Hazard Room",
        tags: ["hazard"],
        size: "Medium",
        mapInfluence: {
          preferredRoomArchetypes: ["bone-well"],
          source: "map-archetype-qa",
        },
      },
    },
    {
      id: "forbidden-fallback-reliquary",
      expectedArchetype: "reliquary-niche",
      expectedForbidden: ["bone-well"],
      region: {
        id: "forbidden-fallback-reliquary",
        name: "Forbidden Fallback Influence",
        role: "Clue Room",
        tags: ["clue"],
        size: "Small",
        mapInfluence: {
          preferredRoomArchetypes: ["bone-well", "reliquary-niche"],
          forbiddenRoomArchetypes: ["bone-well"],
          source: "map-archetype-qa",
        },
      },
    },
    {
      id: "forced-hidden-reliquary",
      expectedArchetype: "hidden-reliquary",
      expectedForce: true,
      expectedForbidden: ["hidden-reliquary"],
      region: {
        id: "forced-hidden-reliquary",
        name: "Forced Hidden Reliquary Influence",
        role: "Secret Room",
        tags: ["secret"],
        secret: true,
        size: "Small",
        mapInfluence: {
          roomArchetype: "hidden-reliquary",
          preferredRoomArchetypes: ["hidden-reliquary"],
          forbiddenRoomArchetypes: ["hidden-reliquary"],
          forceRoomArchetype: true,
          source: "map-archetype-qa",
        },
      },
    },
  ];
  samples.forEach((sample) => validateMapInfluenceGeneratedCase(issues, sample));
}

function buildReport(issues, explicitMap) {
  const summary = {
    total: issues.length,
    error: issues.filter((issue) => issue.severity === "error").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    info: issues.filter((issue) => issue.severity === "info").length,
  };
  return {
    reportType: "cruor-map-archetype-qa-report",
    version: "map-archetype-qa-v0.1.0",
    generatedAt: new Date().toISOString(),
    schemaVersion: ROOM_ARCHETYPE_SCHEMA_VERSION,
    summary,
    archetypes: Object.keys(EXPECTED_ARCHETYPES).map((id) => ({
      id,
      ...EXPECTED_ARCHETYPES[id],
      generated: explicitMap
        ? {
            roomArchetypeSource: getRegion(explicitMap, id)?.roomArchetypeSource || "",
            maskProfile: getRegion(explicitMap, id)?.shapeOptions?.maskProfile || "",
            detailProfile: getRegion(explicitMap, id)?.shapeOptions?.detailProfile || "",
            signatureProps: getRegionProps(explicitMap, id)
              .filter((prop) => prop.archetypeSignature)
              .map((prop) => prop.kind),
          }
        : null,
    })),
    issues,
  };
}

async function main() {
  const issues = [];
  validateArchetypeSchema(issues);
  validateResolverRegression(issues);
  const explicitMap = validateExplicitGeneratedSuite(issues);
  validateMapInfluenceCases(issues);

  const report = buildReport(issues, explicitMap);
  if (writeReport) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(new URL("map-archetype-qa-report.json", OUTPUT_DIR), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  const { total, error, warning, info } = report.summary;
  console.log(`Map Archetype QA: ${total} issues (${error} errors, ${warning} warnings, ${info} info).`);
  issues.slice(0, 25).forEach((issue) => {
    console.log(`[${issue.severity}] ${issue.area}/${issue.check}: ${issue.message}`);
  });
  if (error || (failOnWarnings && warning)) process.exitCode = 1;
}

await main();
