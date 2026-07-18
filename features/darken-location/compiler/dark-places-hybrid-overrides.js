import {
  DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
  canonicalizeJsonValue,
  createCompatibilityProvenance,
  normalizeLocationDocumentV2,
  validateDarkPlacesHybridOverride,
  validateLocationDocumentV2,
} from "../../../shared/content/content.index.js";

export const DARK_PLACES_HYBRID_OVERRIDE_RESULT_SCHEMA_VERSION =
  "cruor-dark-places-hybrid-override-result-v1";

const SLOT_TARGETS = Object.freeze({
  horrorPremise: {
    scope: "map",
    owner: "siteWide",
    field: "stakesAndConsequences",
    kind: "stake",
  },
  sensoryLayer: {
    scope: "map",
    owner: "siteWide",
    field: "atmosphere",
    kind: "atmosphere",
  },
  visibleAnomaly: {
    scope: "map",
    owner: "room",
    field: "visibleFeatures",
    kind: "visible-feature",
  },
  reward: {
    scope: "map",
    owner: "room",
    field: "rewards",
    kind: "reward",
  },
  hazard: {
    scope: "region",
    owner: "room",
    field: "hazards",
    kind: "hazard",
  },
  clue: {
    scope: "region",
    owner: "room",
    field: "clues",
    kind: "clue",
  },
  encounterTwist: {
    scope: "region",
    owner: "room",
    field: "encounterTwists",
    kind: "encounter-twist",
  },
});

const STRATEGY_ORDER = Object.freeze({
  lock: 0,
  exclude: 1,
  suppress: 2,
  replace: 3,
  prefer: 4,
  append: 5,
  force: 6,
});

const SITE_WIDE_COLLECTIONS = Object.freeze([
  ["atmosphere", "atmosphere"],
  ["globalRules", "global-rule"],
  ["recurringSigns", "recurring-sign"],
  ["stakesAndConsequences", "stake"],
]);

const ROOM_COLLECTIONS = Object.freeze([
  ["immediateImpressions", "sensory"],
  ["visibleFeatures", "visible-feature"],
  ["interactions", "interaction"],
  ["hazards", "hazard"],
  ["clues", "clue"],
  ["encounterTwists", "encounter-twist"],
  ["secrets", "secret"],
  ["rewards", "reward"],
  ["recurringSigns", "recurring-sign"],
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function slugify(value, fallback = "entry") {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

function createIssue(code, path, message, severity = "error", details) {
  return {
    code,
    severity,
    path,
    message,
    ...(details === undefined ? {} : { details }),
  };
}

function uniqueIssues(values = []) {
  return values.filter(
    (issue, index) =>
      values.findIndex(
        (candidate) =>
          candidate.code === issue.code &&
          candidate.path === issue.path &&
          candidate.message === issue.message,
      ) === index,
  );
}

function hasErrors(issues = []) {
  return issues.some((issue) => issue.severity === "error");
}

function getAllCollections(document) {
  const siteWide = SITE_WIDE_COLLECTIONS.map(([field, kind]) => ({
    path: `siteWide.${field}`,
    owner: document.siteWide,
    field,
    kind,
    room: null,
  }));
  const rooms = document.rooms.flatMap((room) =>
    ROOM_COLLECTIONS.map(([field, kind]) => ({
      path: `rooms.${room.id}.${field}`,
      owner: room,
      field,
      kind,
      room,
    })),
  );
  return [...siteWide, ...rooms];
}

function blockMatchesTargets(block, override) {
  const blockIds = new Set(override.targetBlockIds || []);
  const componentIds = new Set([
    override.componentId,
    ...(override.targetComponentIds || []),
  ]);
  return (
    blockIds.has(block.id) ||
    componentIds.has(block.sourceComponentId)
  );
}

function isLockedBlock(block) {
  return Boolean(block.metadata?.hybridOverride?.locked);
}

function getRoomForRegion(document, regionId) {
  return (
    document.rooms.find((room) => room.id === regionId) ||
    document.rooms.find((room) => room.sourceRegionId === regionId) ||
    null
  );
}

function getPreferredMapRoom(document, component, slotId) {
  const effect = component.location?.effect;
  const placement =
    effect?.scope === "map" && effect?.provenance?.slotId === slotId
      ? effect.placement || {}
      : {};
  const preferred = new Set(
    (placement.preferredRoles || []).map((role) => slugify(role)),
  );
  const forbidden = new Set(
    (placement.forbiddenRoles || []).map((role) => slugify(role)),
  );
  const ordered = [...document.rooms].sort(
    (left, right) =>
      Number(left.number || 0) - Number(right.number || 0) ||
      left.id.localeCompare(right.id),
  );
  return (
    ordered.find(
      (room) =>
        preferred.has(slugify(room.role)) &&
        !forbidden.has(slugify(room.role)),
    ) ||
    ordered.find((room) => !forbidden.has(slugify(room.role))) ||
    ordered[0] ||
    null
  );
}

function getDefaultCollection(document, entry, diagnostics) {
  const { override, component } = entry;
  const target = SLOT_TARGETS[override.slotId];
  if (!target) return null;
  if (target.owner === "siteWide") {
    return {
      path: `siteWide.${target.field}`,
      owner: document.siteWide,
      field: target.field,
      kind: target.kind,
      room: null,
    };
  }

  const room =
    override.scope === "region"
      ? getRoomForRegion(document, override.regionId)
      : getPreferredMapRoom(document, component, override.slotId);
  if (!room) {
    diagnostics.push(
      createIssue(
        override.scope === "region"
          ? "hybrid-override.region-not-found"
          : "hybrid-override.map-room-unavailable",
        `hybridOverridePlan.${override.id}.regionId`,
        override.scope === "region"
          ? `Override ${override.id} targets an unknown region: ${override.regionId}.`
          : `Override ${override.id} requires a room but the location has none.`,
      ),
    );
    return null;
  }
  return {
    path: `rooms.${room.id}.${target.field}`,
    owner: room,
    field: target.field,
    kind: target.kind,
    room,
  };
}

function getTargetCollections(document, entry, diagnostics) {
  const { override } = entry;
  const eligibleCollections = getAllCollections(document).filter(
    (collection) =>
      override.scope === "map" ||
      (collection.room &&
        [collection.room.id, collection.room.sourceRegionId].includes(
          override.regionId,
        )),
  );
  const mappedCollections = eligibleCollections.filter((collection) =>
    collection.owner[collection.field].some((block) =>
      blockMatchesTargets(block, override),
    ),
  );
  if (
    mappedCollections.length &&
    ["lock", "exclude", "suppress", "replace"].includes(override.strategy)
  ) {
    return mappedCollections;
  }
  const fallback = getDefaultCollection(document, entry, diagnostics);
  return fallback ? [fallback] : [];
}

function createBlockProvenance(component, document) {
  const sourceAnchorIds = component.sourceAnchors?.length
    ? component.sourceAnchors
    : document.meta.sourceAnchors;
  return createCompatibilityProvenance({
    sourceAnchorIds,
    legacyIds: [component.id],
    fromSchema: "location-component-v1",
    reviewVersion: "hybrid-override-v1",
    note: `Granular component ${component.id} applied through the explicit hybrid override boundary.`,
  });
}

function createGranularBlock(document, entry, collection, metadata = {}) {
  const { override, component } = entry;
  const targetToken = slugify(collection.path);
  return {
    id: slugify(`hybrid-block-${override.id}-${targetToken}`),
    kind: collection.kind,
    subtype: override.slotId,
    title: component.title || component.label || component.id,
    text:
      component.tableText ||
      component.summary ||
      component.narrative ||
      component.title ||
      component.id,
    summary: component.summary || "",
    audience: component.location?.effect?.output?.playerFacing ? "player" : "gm",
    facets: [],
    sourceComponentId: component.id,
    sourceAnchorIds: component.sourceAnchors || document.meta.sourceAnchors,
    mechanics: component.mechanics || null,
    counterplay: "",
    narrative: component.narrative || "",
    provenance: createBlockProvenance(component, document),
    metadata: {
      hybridOverride: {
        schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
        overrideId: override.id,
        strategy: override.strategy,
        scope: override.scope,
        regionId: override.regionId,
        targetPath: collection.path,
        locked: Boolean(metadata.locked),
        forced: Boolean(metadata.forced),
        preferred: Boolean(metadata.preferred),
      },
    },
  };
}

function setCollectionBlocks(collection, blocks) {
  collection.owner[collection.field] = blocks;
}

function addRoomSourceComponent(collection, componentId) {
  if (!collection.room) return;
  collection.room.sourceComponentIds = [
    ...new Set([...(collection.room.sourceComponentIds || []), componentId]),
  ].sort();
}

function applyDirective(document, entry, collection) {
  const { override } = entry;
  const current = [...collection.owner[collection.field]];
  let next = current;
  let action = override.strategy;
  let affectedBlockIds = [];

  if (override.strategy === "lock") {
    const matches = current.filter((block) => blockMatchesTargets(block, override));
    if (matches.length) {
      affectedBlockIds = matches.map((block) => block.id);
      next = current.map((block) =>
        blockMatchesTargets(block, override)
          ? {
              ...block,
              metadata: {
                ...(block.metadata || {}),
                hybridOverride: {
                  schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
                  overrideId: override.id,
                  strategy: "lock",
                  scope: override.scope,
                  regionId: override.regionId,
                  targetPath: collection.path,
                  locked: true,
                  forced: false,
                  preferred: false,
                },
              },
            }
          : block,
      );
    } else {
      const block = createGranularBlock(document, entry, collection, {
        locked: true,
      });
      next = [...current, block];
      affectedBlockIds = [block.id];
      addRoomSourceComponent(collection, override.componentId);
    }
  } else if (override.strategy === "exclude") {
    const removed = current.filter(
      (block) => blockMatchesTargets(block, override) && !isLockedBlock(block),
    );
    affectedBlockIds = removed.map((block) => block.id);
    next = current.filter(
      (block) => !blockMatchesTargets(block, override) || isLockedBlock(block),
    );
  } else if (override.strategy === "suppress") {
    const removed = current.filter((block) => !isLockedBlock(block));
    affectedBlockIds = removed.map((block) => block.id);
    next = current.filter(isLockedBlock);
  } else if (override.strategy === "replace") {
    const removed = current.filter((block) => !isLockedBlock(block));
    const block = createGranularBlock(document, entry, collection);
    affectedBlockIds = [...removed.map((entryBlock) => entryBlock.id), block.id];
    next = [...current.filter(isLockedBlock), block];
    addRoomSourceComponent(collection, override.componentId);
  } else if (override.strategy === "prefer") {
    const hasGranularOverride = current.some(
      (block) => block.metadata?.hybridOverride,
    );
    if (hasGranularOverride) {
      action = "prefer-skipped";
    } else {
      const block = createGranularBlock(document, entry, collection, {
        preferred: true,
      });
      next = [...current, block];
      affectedBlockIds = [block.id];
      addRoomSourceComponent(collection, override.componentId);
    }
  } else if (override.strategy === "force") {
    const block = createGranularBlock(document, entry, collection, {
      forced: true,
    });
    next = [...current.filter((entryBlock) => entryBlock.id !== block.id), block];
    affectedBlockIds = [block.id];
    addRoomSourceComponent(collection, override.componentId);
  } else {
    const block = createGranularBlock(document, entry, collection);
    next = [...current.filter((entryBlock) => entryBlock.id !== block.id), block];
    affectedBlockIds = [block.id];
    addRoomSourceComponent(collection, override.componentId);
  }

  setCollectionBlocks(collection, next);
  return {
    overrideId: override.id,
    componentId: override.componentId,
    slotId: override.slotId,
    strategy: override.strategy,
    scope: override.scope,
    regionId: override.regionId,
    targetPath: collection.path,
    action,
    affectedBlockIds: [...new Set(affectedBlockIds)].sort(),
  };
}

function sortEntries(entries = []) {
  return [...entries].sort((left, right) => {
    const strategyDelta =
      (STRATEGY_ORDER[left.override.strategy] ?? 99) -
      (STRATEGY_ORDER[right.override.strategy] ?? 99);
    return strategyDelta || left.override.id.localeCompare(right.override.id);
  });
}

export function applyDarkPlacesHybridOverrides({
  compileResult = null,
  overridePlan = null,
} = {}) {
  const diagnostics = [];
  const entries = sortEntries(overridePlan?.all || []);
  entries.forEach((entry, index) =>
    diagnostics.push(
      ...validateDarkPlacesHybridOverride(entry.override, {
        path: `hybridOverridePlan.all[${index}].override`,
      }),
    ),
  );

  if (!compileResult?.document) {
    diagnostics.push(
      createIssue(
        "hybrid-override.document-required",
        "compileResult.document",
        "Hybrid overrides require a compiled Location Document v2 baseline.",
      ),
    );
    return deepFreeze({
      schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_RESULT_SCHEMA_VERSION,
      document: null,
      compileResult,
      mapScoped: [],
      regionScoped: {},
      operations: [],
      diagnostics,
      valid: false,
    });
  }

  const document = JSON.parse(JSON.stringify(compileResult.document));
  const operations = [];
  if (!hasErrors(diagnostics)) {
    entries.forEach((entry) => {
      getTargetCollections(document, entry, diagnostics).forEach((collection) =>
        operations.push(applyDirective(document, entry, collection)),
      );
    });
  }

  const normalizedDocument = normalizeLocationDocumentV2(document);
  const documentIssues = validateLocationDocumentV2(normalizedDocument);
  const overrideIssues = uniqueIssues([...diagnostics, ...documentIssues]);
  const finalDocument = normalizeLocationDocumentV2({
    ...normalizedDocument,
    validation: {
      ...normalizedDocument.validation,
      status: hasErrors(overrideIssues) ? "invalid" : "valid",
      issues: uniqueIssues([
        ...(normalizedDocument.validation?.issues || []),
        ...overrideIssues,
      ]),
    },
  });
  const combinedDiagnostics = uniqueIssues([
    ...(compileResult.diagnostics || []),
    ...overrideIssues,
  ]);
  const valid = Boolean(compileResult.valid) && !hasErrors(combinedDiagnostics);
  const finalCompileResult = {
    ...compileResult,
    document: finalDocument,
    diagnostics: combinedDiagnostics,
    valid,
  };
  const mapScoped = operations.filter((operation) => operation.scope === "map");
  const regionOperations = operations.filter(
    (operation) => operation.scope === "region",
  );
  const regionScoped = Object.fromEntries(
    [...new Set(regionOperations.map((operation) => operation.regionId))]
      .filter(Boolean)
      .sort()
      .map((regionId) => [
        regionId,
        regionOperations.filter(
          (operation) => operation.regionId === regionId,
        ),
      ]),
  );

  return deepFreeze(
    canonicalizeJsonValue({
      schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_RESULT_SCHEMA_VERSION,
      document: finalDocument,
      compileResult: finalCompileResult,
      mapScoped,
      regionScoped,
      operations,
      diagnostics: overrideIssues,
      valid,
    }),
  );
}
