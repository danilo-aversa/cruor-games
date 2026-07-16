import {
  normalizeGlobalRuleV1,
  normalizePlaceIdentityV1,
  normalizeReadAloudProfileV1,
  normalizeRecurringSignV1,
  normalizeSensoryProfileV1,
  normalizeSessionGuideV1,
  normalizeSiteAtmosphereV1,
  validateGlobalRuleV1,
  validatePlaceIdentityV1,
  validateReadAloudProfileV1,
  validateRecurringSignV1,
  validateSensoryProfileV1,
  validateSessionGuideV1,
  validateSiteAtmosphereV1,
} from "../../../shared/content/contracts/semantic/index.js";

export const STUDIO_SPECIALIZED_SEMANTIC_TYPES = Object.freeze([
  "place-identity",
  "site-atmosphere",
  "global-rule",
  "recurring-sign",
  "sensory-profile",
  "read-aloud-profile",
  "session-guide",
]);

const DEFINITIONS = {
  "place-identity": {
    label: "Place Identity",
    icon: "fa-landmark",
    navigationGroup: "Place Identity",
    normalizer: normalizePlaceIdentityV1,
    validator: validatePlaceIdentityV1,
    defaultValue: {
      originalPurpose: "",
      originalUsers: [],
      historicalChange: "",
      horrorTruth: "",
      currentFunction: "",
      currentConflict: "",
      playerEntryPoints: [],
      stakes: [],
      toneKeywords: [],
    },
    coverage: {
      minimumComponents: 1,
      requiredPaths: [
        "originalPurpose",
        "historicalChange",
        "horrorTruth",
        "currentFunction",
        "playerEntryPoints",
        "stakes",
      ],
    },
  },
  "site-atmosphere": {
    label: "Site Atmosphere",
    icon: "fa-cloud-moon",
    navigationGroup: "Site-Wide",
    normalizer: normalizeSiteAtmosphereV1,
    validator: validateSiteAtmosphereV1,
    defaultValue: {
      signature: "",
      manifestations: [],
      exclusions: [],
      escalationLinks: [],
    },
    coverage: {
      minimumComponents: 1,
      requiredPaths: ["signature", "manifestations"],
      targetItems: { path: "manifestations", count: 3 },
    },
  },
  "global-rule": {
    label: "Global Rule",
    icon: "fa-scale-balanced",
    navigationGroup: "Site-Wide",
    normalizer: normalizeGlobalRuleV1,
    validator: validateGlobalRuleV1,
    defaultValue: {
      id: "",
      title: "",
      scope: "location",
      category: "pressure",
      trigger: { events: [], timing: "", frequencyLimit: "" },
      state: { label: "Pressure", minimum: 0, maximum: 6, initial: 0 },
      resolution: {
        timing: "",
        threshold: null,
        savingThrow: null,
        check: null,
        attackRoll: null,
        effect: {
          damage: "",
          damageType: "",
          healing: "",
          conditions: [],
          additionalText: "",
        },
        duration: "",
        range: "",
        area: "",
        frequency: "",
        actionEconomy: "",
      },
      counterplay: [],
      reset: { condition: "", value: null },
      escalation: [],
      gmSummary: "",
      playerFacingSigns: [],
    },
    coverage: {
      minimumComponents: 1,
      requiredPaths: [
        "title",
        "trigger.events",
        "resolution.effect.additionalText",
        "counterplay",
      ],
      targetItems: { path: "escalation", count: 2 },
    },
  },
  "recurring-sign": {
    label: "Recurring Sign",
    icon: "fa-repeat",
    navigationGroup: "Site-Wide",
    normalizer: normalizeRecurringSignV1,
    validator: validateRecurringSignV1,
    defaultValue: {
      id: "",
      description: "",
      placement: {
        frequency: "recurring",
        minimumRooms: 1,
        maximumRooms: 3,
        allowedRoomRoles: [],
        forbiddenRoomRoles: [],
        preferredFeatures: [],
      },
      variations: [],
      interaction: null,
      revelationLink: "",
    },
    coverage: {
      minimumComponents: 1,
      targetComponents: 4,
      requiredPaths: ["description", "placement", "variations"],
      targetItems: { path: "variations", count: 3 },
    },
  },
  "sensory-profile": {
    label: "Sensory Profile",
    icon: "fa-ear-listen",
    navigationGroup: "Sensory",
    normalizer: normalizeSensoryProfileV1,
    validator: validateSensoryProfileV1,
    defaultValue: {
      signature: "",
      variants: {},
      intensityTiers: {},
      roomRoleBias: {},
      geometryBias: {},
      exclusions: [],
      repetitionPolicy: {
        exactTextCooldown: "all-rooms",
        senseCooldown: 1,
        allowSignatureRepeat: false,
      },
    },
    coverage: {
      minimumComponents: 1,
      requiredPaths: ["signature", "variants", "intensityTiers"],
      targetItems: { path: "variants", count: 12, deep: true },
    },
  },
  "read-aloud-profile": {
    label: "Read-Aloud Profile",
    icon: "fa-quote-left",
    navigationGroup: "Read-Aloud",
    normalizer: normalizeReadAloudProfileV1,
    validator: validateReadAloudProfileV1,
    defaultValue: {
      fragments: {},
      constraints: {
        forbiddenSpoilerTags: ["gm-only", "hidden", "solution"],
        maximumSentences: { compact: 2, standard: 4, extended: 6 },
        wordRanges: {
          compact: [20, 35],
          standard: [45, 75],
          extended: [80, 120],
        },
      },
      grammar: {
        openingOrder: ["spatialAnchors", "sensoryBeats", "visibleFeatures"],
        allowSecondPerson: false,
        tense: "present",
      },
    },
    coverage: {
      minimumComponents: 1,
      requiredPaths: ["fragments", "constraints.wordRanges.standard"],
      targetItems: { path: "fragments", count: 6, deep: true },
    },
  },
  "session-guide": {
    label: "Session Guide",
    icon: "fa-compass",
    navigationGroup: "At the Table",
    normalizer: normalizeSessionGuideV1,
    validator: validateSessionGuideV1,
    defaultValue: {
      openingBeat: {
        situation: "",
        immediateSignal: "",
        playerDecision: "",
      },
      objectives: [],
      alwaysOnRuleIds: [],
      pressureTrackId: "",
      clueFlow: {
        requiredRevelations: [],
        links: [],
        fallbackClues: [],
      },
      stallMoves: [],
      pacing: {
        defaultRoute: [],
        escalationRooms: [],
        climaxGuidance: "",
      },
    },
    coverage: {
      minimumComponents: 1,
      requiredPaths: ["openingBeat", "objectives", "clueFlow", "stallMoves"],
      targetItems: { path: "stallMoves", count: 3 },
    },
  },
};

function countNestedItems(value) {
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== "object") return 0;
  return Object.values(value).reduce(
    (total, entry) => total + (Array.isArray(entry) ? entry.length : 0),
    0,
  );
}

function getPathValue(value, path) {
  return String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((current, key) => current?.[key], value);
}

function hasAuthoredValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    return Object.values(value).some(hasAuthoredValue);
  }
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function buildCoverageEvaluator(definition) {
  return (semantic = {}) => {
    const missingPaths = definition.coverage.requiredPaths.filter(
      (path) => !hasAuthoredValue(getPathValue(semantic, path)),
    );
    const target = definition.coverage.targetItems;
    const targetValue = target ? getPathValue(semantic, target.path) : null;
    const itemCount = target
      ? target.deep
        ? countNestedItems(targetValue)
        : Array.isArray(targetValue)
          ? targetValue.length
          : 0
      : 0;
    return {
      complete:
        missingPaths.length === 0 && (!target || itemCount >= target.count),
      missingPaths,
      itemCount,
      targetCount: target?.count || 0,
      targetPath: target?.path || "",
    };
  };
}

function buildPreviewRenderer(semanticType) {
  return (semantic = {}) => {
    if (semanticType === "place-identity") {
      return {
        headline: semantic.currentFunction || semantic.originalPurpose,
        detail: semantic.currentConflict || semantic.horrorTruth,
        metrics: [
          semantic.playerEntryPoints?.length || 0,
          semantic.stakes?.length || 0,
        ],
      };
    }
    if (semanticType === "site-atmosphere") {
      return {
        headline: semantic.signature,
        detail: semantic.manifestations?.[0]?.text || "",
        metrics: [semantic.manifestations?.length || 0],
      };
    }
    if (semanticType === "global-rule") {
      return {
        headline: semantic.title,
        detail:
          semantic.gmSummary || semantic.resolution?.effect?.additionalText,
        metrics: [
          semantic.counterplay?.length || 0,
          semantic.escalation?.length || 0,
        ],
      };
    }
    if (semanticType === "recurring-sign") {
      return {
        headline: semantic.description,
        detail: semantic.variations?.[0] || "",
        metrics: [semantic.variations?.length || 0],
      };
    }
    if (semanticType === "sensory-profile") {
      return {
        headline: semantic.signature,
        detail: Object.values(semantic.variants || {}).flat()[0] || "",
        metrics: [countNestedItems(semantic.variants)],
      };
    }
    if (semanticType === "read-aloud-profile") {
      const fragments = Object.values(semantic.fragments || {}).flat();
      return {
        headline: fragments[0]?.text || "Read-Aloud fragment pool",
        detail: semantic.grammar?.tense || "present",
        metrics: [fragments.length],
      };
    }
    return {
      headline: semantic.openingBeat?.situation || "Session Guide",
      detail: semantic.openingBeat?.playerDecision || "",
      metrics: [
        semantic.objectives?.length || 0,
        semantic.stallMoves?.length || 0,
      ],
    };
  };
}

export const STUDIO_SEMANTIC_EDITOR_REGISTRY = Object.freeze(
  Object.fromEntries(
    Object.entries(DEFINITIONS).map(([semanticType, definition]) => [
      semanticType,
      Object.freeze({
        semanticType,
        editorId: `semantic-${semanticType}`,
        templateId: `semantic-${semanticType}`,
        contentType: "semantic-component",
        availability: "active",
        ...definition,
        evaluateCoverage: buildCoverageEvaluator(definition),
        previewRenderer: buildPreviewRenderer(semanticType),
      }),
    ]),
  ),
);

export function getStudioSemanticEditorDefinition(semanticType = "") {
  return STUDIO_SEMANTIC_EDITOR_REGISTRY[semanticType] || null;
}

export function isStudioSpecializedSemanticType(semanticType = "") {
  return Boolean(getStudioSemanticEditorDefinition(semanticType));
}

export function createStudioSemanticDefault(semanticType, provenance = {}) {
  const definition = getStudioSemanticEditorDefinition(semanticType);
  if (!definition) return null;
  return definition.normalizer({
    ...definition.defaultValue,
    provenance,
  });
}

export function listStudioSemanticEditorDefinitions() {
  return Object.values(STUDIO_SEMANTIC_EDITOR_REGISTRY);
}
