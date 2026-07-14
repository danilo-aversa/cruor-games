import { normalizeRoomCompatibility } from "./room-compatibility.js";
import { normalizeRoomDesign } from "./room-design.js";

export const LOCATION_COMPONENT_EFFECT_SCHEMA_VERSION = "location-component-effect-v0.1";

export const LOCATION_COMPONENT_EFFECT_SCOPES = Object.freeze(["map", "region"]);
export const LOCATION_COMPONENT_EFFECT_PLACEMENT_STRATEGIES = Object.freeze([
  "none",
  "assigned-region",
  "best-fit-room",
  "every-room",
  "map-wide",
]);
export const LOCATION_COMPONENT_EFFECT_UNSUPPORTED_POLICIES = Object.freeze([
  "output-only",
  "warn",
  "block",
]);

const REGION_SCOPED_SLOT_IDS = new Set(["hazard", "clue", "encounterTwist"]);
const EFFECT_SCOPE_SET = new Set(LOCATION_COMPONENT_EFFECT_SCOPES);
const PLACEMENT_STRATEGY_SET = new Set(LOCATION_COMPONENT_EFFECT_PLACEMENT_STRATEGIES);
const UNSUPPORTED_POLICY_SET = new Set(LOCATION_COMPONENT_EFFECT_UNSUPPORTED_POLICIES);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function uniqueStrings(values = []) {
  return [
    ...new Set(
      asArray(values)
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeToken(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeInteger(value, fallback = 0, { min = 0, max = 99 } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function clonePlainObject(value) {
  return isPlainObject(value) ? JSON.parse(JSON.stringify(value)) : null;
}

function getNestedObject(source = {}, field) {
  const candidates = [
    [source?.[field], field],
    [source?.location?.[field], `location.${field}`],
    [source?.locationRegion?.[field], `locationRegion.${field}`],
    [source?.map?.[field], `map.${field}`],
    [source?.metadata?.[field], `metadata.${field}`],
    [source?.requestMetadata?.[field], `requestMetadata.${field}`],
  ];
  const match = candidates.find(([value]) => isPlainObject(value));
  return match ? { value: match[0], path: match[1] } : { value: null, path: "" };
}

function getAuthoredEffect(source = {}) {
  if (source?.schemaVersion === LOCATION_COMPONENT_EFFECT_SCHEMA_VERSION) {
    return { value: source, path: "", normalized: true };
  }

  const candidates = [
    [source?.location?.effect, "location.effect"],
    [source?.effect, "effect"],
    [source?.locationEffect, "locationEffect"],
    [source?.map?.effect, "map.effect"],
  ];
  const match = candidates.find(([value]) => isPlainObject(value));
  return match
    ? {
        value: match[0],
        path: match[1],
        normalized: match[0].schemaVersion === LOCATION_COMPONENT_EFFECT_SCHEMA_VERSION,
      }
    : { value: {}, path: "", normalized: false };
}

function normalizeScope(value, fallback = "map") {
  const token = normalizeToken(value);
  if (["region", "room", "local", "assigned-region"].includes(token)) return "region";
  if (["map", "global", "location", "map-wide"].includes(token)) return "map";
  return EFFECT_SCOPE_SET.has(token) ? token : fallback;
}

function normalizePlacementStrategy(value, fallback = "none") {
  const token = normalizeToken(value);
  const aliases = {
    room: "assigned-region",
    region: "assigned-region",
    assigned: "assigned-region",
    "best-fit": "best-fit-room",
    best: "best-fit-room",
    all: "every-room",
    global: "map-wide",
    map: "map-wide",
  };
  const normalized = aliases[token] || token;
  return PLACEMENT_STRATEGY_SET.has(normalized) ? normalized : fallback;
}

function normalizeUnsupportedPolicy(value) {
  const token = normalizeToken(value);
  return UNSUPPORTED_POLICY_SET.has(token) ? token : "output-only";
}

function normalizeOutput(rawEffect = {}, source = {}, slotId = "") {
  const rawOutput = isPlainObject(rawEffect.output) ? rawEffect.output : {};
  const location = isPlainObject(source.location) ? source.location : {};
  const sections = uniqueStrings([
    ...asArray(rawOutput.sections),
    rawOutput.section,
    rawEffect.outputSection,
    location.outputSection,
    slotId,
  ]);
  const gmFacingOnly = Boolean(
    rawOutput.gmFacingOnly ?? rawEffect.gmFacingOnly ?? location.gmFacingOnly,
  );
  const playerFacing = Boolean(rawOutput.playerFacing ?? rawEffect.playerFacing ?? false);
  const readAloud = Boolean(
    rawOutput.readAloud ??
      rawEffect.readAloud ??
      location.tableRole === "read-aloud",
  );

  return {
    sections,
    playerFacing,
    gmFacingOnly,
    readAloud,
  };
}

function normalizePlacement(
  rawEffect = {},
  scope = "map",
  hasRoomContracts = false,
  defaults = {},
) {
  const rawPlacement = isPlainObject(rawEffect.placement) ? rawEffect.placement : {};
  const defaultStrategy =
    defaults.strategy ||
    (scope === "region" && hasRoomContracts ? "assigned-region" : "none");
  const strategy = normalizePlacementStrategy(
    rawPlacement.strategy || rawEffect.placementStrategy,
    defaultStrategy,
  );
  const defaultCardinality = Number.isFinite(Number(defaults.cardinality))
    ? Number(defaults.cardinality)
    : strategy === "none"
      ? 0
      : strategy === "every-room"
        ? 99
        : 1;
  const authoredPreferredRoles = [
    ...asArray(rawPlacement.preferredRoles),
    ...asArray(rawEffect.preferredRoles),
  ];
  const authoredForbiddenRoles = [
    ...asArray(rawPlacement.forbiddenRoles),
    ...asArray(rawEffect.forbiddenRoles),
  ];

  return {
    strategy,
    cardinality: normalizeInteger(
      rawPlacement.cardinality ?? rawEffect.cardinality,
      defaultCardinality,
      { min: 0, max: 99 },
    ),
    preferredRoles: uniqueStrings(
      authoredPreferredRoles.length ? authoredPreferredRoles : defaults.preferredRoles,
    ),
    forbiddenRoles: uniqueStrings(
      authoredForbiddenRoles.length ? authoredForbiddenRoles : defaults.forbiddenRoles,
    ),
    fallback: normalizeUnsupportedPolicy(
      rawPlacement.fallback ||
        rawEffect.fallback ||
        rawEffect.unsupportedPolicy ||
        defaults.fallback,
    ),
  };
}

function normalizeTopology(rawEffect = {}, roomDesign = null) {
  const rawTopology = isPlainObject(rawEffect.topology) ? rawEffect.topology : {};
  const roomTopology = isPlainObject(roomDesign?.topology) ? roomDesign.topology : {};

  return {
    isSecretRoom: Boolean(
      rawTopology.isSecretRoom === true ||
        rawTopology.secret === true ||
        roomTopology.isSecretRoom === true ||
        roomTopology.secret === true,
    ),
    branchBias: String(rawTopology.branchBias || roomTopology.branchBias || "").trim(),
    depthBias: String(rawTopology.depthBias || roomTopology.depthBias || "").trim(),
    connectionKind: String(rawTopology.connectionKind || "").trim(),
  };
}

function normalizeRender(rawEffect = {}, defaults = {}) {
  const rawRender = isPlainObject(rawEffect.render) ? rawEffect.render : {};
  return {
    markerKind: normalizeToken(
      rawRender.markerKind || rawEffect.markerKind || defaults.markerKind,
    ),
    propKind: normalizeToken(
      rawRender.propKind || rawEffect.propKind || defaults.propKind,
    ),
    visualCue: String(
      rawRender.visualCue || rawEffect.visualCue || defaults.visualCue || "",
    ).trim(),
    distribution:
      normalizeToken(
        rawRender.distribution ||
          rawEffect.distribution ||
          defaults.distribution ||
          "none",
      ) || "none",
  };
}

function hasTopologyEffect(topology = {}) {
  return Boolean(
    topology.isSecretRoom ||
      topology.branchBias ||
      topology.depthBias ||
      topology.connectionKind,
  );
}

function hasRenderEffect(render = {}) {
  return Boolean(
    render.markerKind ||
      render.propKind ||
      render.visualCue ||
      (render.distribution && render.distribution !== "none"),
  );
}

function getSlotId(source = {}, options = {}) {
  return String(
    options.slotId ||
      source.slotId ||
      source.slot ||
      source.location?.slot ||
      source.location?.slots?.[0] ||
      source.slots?.[0] ||
      source.provenance?.slotId ||
      "",
  ).trim();
}

function getAssignmentMode(source = {}, options = {}, slotId = "") {
  return String(
    options.assignmentMode ||
      source.assignmentMode ||
      source.location?.assignmentMode ||
      (REGION_SCOPED_SLOT_IDS.has(slotId) ? "region" : "map"),
  ).trim();
}

function getSlotEffectDefaults(slotId = "", source = {}) {
  const sourceAnchors = uniqueStrings(
    source.sourceAnchors || source.provenance?.sourceAnchors,
  );
  const componentTitle = String(
    source.title ||
      source.label ||
      source.provenance?.componentTitle ||
      slotId,
  ).trim();
  const visualCue = String(sourceAnchors[0] || componentTitle).trim();
  const shared = {
    unsupportedPolicy: "output-only",
  };

  if (slotId === "horrorPremise") {
    return {
      ...shared,
      scope: "map",
      placement: {
        strategy: "best-fit-room",
        cardinality: 1,
        preferredRoles: ["entrance", "threshold", "landmark", "ritual"],
        forbiddenRoles: ["service", "connector"],
        fallback: "output-only",
      },
      render: {
        visualCue,
        distribution: "single-room",
      },
    };
  }

  if (slotId === "sensoryLayer") {
    return {
      ...shared,
      scope: "map",
      placement: {
        strategy: "every-room",
        cardinality: 99,
        preferredRoles: [],
        forbiddenRoles: [],
        fallback: "output-only",
      },
      render: {
        visualCue,
        distribution: "every-room",
      },
    };
  }

  if (slotId === "visibleAnomaly") {
    return {
      ...shared,
      scope: "map",
      placement: {
        strategy: "best-fit-room",
        cardinality: 1,
        preferredRoles: [
          "landmark",
          "climax",
          "discovery",
          "outcome",
          "reward",
          "ritual",
        ],
        forbiddenRoles: ["service", "connector"],
        fallback: "output-only",
      },
      render: {
        markerKind: "clue-marker",
        visualCue,
        distribution: "single-room",
      },
    };
  }

  if (slotId === "reward") {
    return {
      ...shared,
      scope: "map",
      placement: {
        strategy: "best-fit-room",
        cardinality: 1,
        preferredRoles: [
          "outcome",
          "reward",
          "climax",
          "secret",
          "reliquary",
          "treasury",
        ],
        forbiddenRoles: ["entrance", "service", "connector"],
        fallback: "output-only",
      },
      render: {
        propKind: "chest",
        visualCue,
        distribution: "single-room",
      },
    };
  }

  if (slotId === "hazard") {
    return {
      ...shared,
      scope: "region",
      placement: {
        strategy: "assigned-region",
        cardinality: 1,
        preferredRoles: ["hazard", "ambush", "ritual"],
        forbiddenRoles: [],
        fallback: "output-only",
      },
      render: {
        visualCue,
        distribution: "single-room",
      },
    };
  }

  if (slotId === "clue") {
    return {
      ...shared,
      scope: "region",
      placement: {
        strategy: "assigned-region",
        cardinality: 1,
        preferredRoles: ["clue", "discovery", "archive", "secret"],
        forbiddenRoles: [],
        fallback: "output-only",
      },
      render: {
        markerKind: "clue-marker",
        visualCue,
        distribution: "single-room",
      },
    };
  }

  if (slotId === "encounterTwist") {
    return {
      ...shared,
      scope: "region",
      placement: {
        strategy: "assigned-region",
        cardinality: 1,
        preferredRoles: ["ambush", "climax", "hazard", "ritual"],
        forbiddenRoles: [],
        fallback: "output-only",
      },
      render: {
        visualCue,
        distribution: "single-room",
      },
    };
  }

  return {};
}

export function normalizeLocationComponentEffect(source = {}, options = {}) {
  if (!isPlainObject(source)) return null;

  const authoredEffect = getAuthoredEffect(source);
  const rawEffect = authoredEffect.value;
  const isNormalizedEffect = Boolean(authoredEffect.normalized);
  const mapInfluenceSource = getNestedObject(source, "mapInfluence");
  const roomDesignSource = getNestedObject(source, "roomDesign");
  const roomCompatibilitySource = getNestedObject(source, "roomCompatibility");
  const mapInfluence = clonePlainObject(
    rawEffect.mapInfluence || mapInfluenceSource.value,
  );
  const roomDesign = normalizeRoomDesign(
    rawEffect.roomDesign || roomDesignSource.value || {},
  );
  const roomCompatibility = normalizeRoomCompatibility(
    rawEffect.roomCompatibility || roomCompatibilitySource.value || {},
  );
  const slotId = getSlotId(source, options);
  const slotDefaults = getSlotEffectDefaults(slotId, source);
  const assignmentMode = getAssignmentMode(source, options, slotId);
  const requestedScope =
    rawEffect.scope || options.scope || slotDefaults.scope || assignmentMode;
  const scope = normalizeScope(
    requestedScope,
    REGION_SCOPED_SLOT_IDS.has(slotId) ? "region" : "map",
  );
  const hasRoomContracts = Boolean(mapInfluence || roomDesign || roomCompatibility);
  const output = normalizeOutput(rawEffect, source, slotId);
  const placement = normalizePlacement(
    rawEffect,
    scope,
    hasRoomContracts,
    slotDefaults.placement,
  );
  const topology = normalizeTopology(rawEffect, roomDesign);
  const render = normalizeRender(rawEffect, slotDefaults.render);
  const unsupportedPolicy = normalizeUnsupportedPolicy(
    rawEffect.unsupportedPolicy ||
      placement.fallback ||
      slotDefaults.unsupportedPolicy,
  );
  const liftedContracts = [
    mapInfluence ? "mapInfluence" : "",
    roomDesign ? "roomDesign" : "",
    roomCompatibility ? "roomCompatibility" : "",
  ].filter(Boolean);
  const hasProceduralEffect = Boolean(
    placement.strategy !== "none" ||
      hasTopologyEffect(topology) ||
      hasRenderEffect(render) ||
      liftedContracts.length,
  );
  const warnings = [];
  if (requestedScope && normalizeScope(requestedScope, "") === "") {
    warnings.push(`Unknown effect scope: ${requestedScope}.`);
  }
  if (
    (rawEffect.placement?.strategy || rawEffect.placementStrategy) &&
    normalizePlacementStrategy(
      rawEffect.placement?.strategy || rawEffect.placementStrategy,
      "",
    ) === ""
  ) {
    warnings.push(
      `Unknown placement strategy: ${rawEffect.placement?.strategy || rawEffect.placementStrategy}.`,
    );
  }
  if (
    rawEffect.unsupportedPolicy &&
    !UNSUPPORTED_POLICY_SET.has(normalizeToken(rawEffect.unsupportedPolicy))
  ) {
    warnings.push(`Unknown unsupported policy: ${rawEffect.unsupportedPolicy}.`);
  }

  return {
    schemaVersion: LOCATION_COMPONENT_EFFECT_SCHEMA_VERSION,
    scope,
    output,
    placement,
    topology,
    render,
    ...(mapInfluence ? { mapInfluence } : {}),
    ...(roomDesign ? { roomDesign } : {}),
    ...(roomCompatibility ? { roomCompatibility } : {}),
    unsupportedPolicy,
    provenance: {
      componentId: String(
        options.componentId ||
          source.id ||
          source.componentId ||
          rawEffect.provenance?.componentId ||
          source.provenance?.componentId ||
          "",
      ).trim(),
      componentTitle: String(
        options.componentTitle ||
          source.title ||
          source.label ||
          rawEffect.provenance?.componentTitle ||
          source.provenance?.componentTitle ||
          "",
      ).trim(),
      slotId,
      sourceAnchors: uniqueStrings(
        source.sourceAnchors || source.provenance?.sourceAnchors,
      ),
      authoredPaths: uniqueStrings(
        isNormalizedEffect
          ? rawEffect.provenance?.authoredPaths || source.provenance?.authoredPaths
          : [
              authoredEffect.path,
              mapInfluenceSource.path,
              roomDesignSource.path,
              roomCompatibilitySource.path,
            ],
      ),
    },
    diagnostics: {
      mode: hasProceduralEffect ? "procedural" : "output-only",
      authoredEffect: isNormalizedEffect
        ? Boolean(rawEffect.diagnostics?.authoredEffect ?? source.diagnostics?.authoredEffect)
        : Boolean(authoredEffect.path),
      liftedContracts,
      warnings: uniqueStrings([
        ...asArray(rawEffect.diagnostics?.warnings),
        ...asArray(source.diagnostics?.warnings),
        ...warnings,
      ]),
    },
  };
}
