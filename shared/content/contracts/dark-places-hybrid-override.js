import {
  cleanText,
  createIssue,
  createParseResult,
  deepFreeze,
  isPlainObject,
  slugifyLegacyId,
} from "./semantic/contract-utils.js";

export const DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION =
  "cruor-dark-places-hybrid-override-v1";

export const DARK_PLACES_HYBRID_OVERRIDE_STRATEGIES = Object.freeze([
  "append",
  "replace",
  "suppress",
  "force",
  "lock",
  "prefer",
  "exclude",
]);

export const DARK_PLACES_HYBRID_OVERRIDE_SCOPES = Object.freeze([
  "map",
  "region",
]);

export const DARK_PLACES_MAP_OVERRIDE_SLOT_IDS = Object.freeze([
  "horrorPremise",
  "sensoryLayer",
  "visibleAnomaly",
  "reward",
]);

export const DARK_PLACES_REGION_OVERRIDE_SLOT_IDS = Object.freeze([
  "hazard",
  "clue",
  "encounterTwist",
]);

const STRATEGY_SET = new Set(DARK_PLACES_HYBRID_OVERRIDE_STRATEGIES);
const SCOPE_SET = new Set(DARK_PLACES_HYBRID_OVERRIDE_SCOPES);
const MAP_SLOT_SET = new Set(DARK_PLACES_MAP_OVERRIDE_SLOT_IDS);
const REGION_SLOT_SET = new Set(DARK_PLACES_REGION_OVERRIDE_SLOT_IDS);
const OVERRIDE_FIELDS = Object.freeze([
  "schemaVersion",
  "id",
  "componentId",
  "slotId",
  "strategy",
  "scope",
  "regionId",
  "targetComponentIds",
  "targetBlockIds",
]);

function toArray(value) {
  if (value instanceof Set) return [...value];
  if (Array.isArray(value)) return value;
  return value === undefined || value === null || value === "" ? [] : [value];
}

function normalizeIds(value) {
  return [...new Set(toArray(value).map(slugifyLegacyId).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function normalizeStrategy(value) {
  const strategy = cleanText(value).toLowerCase();
  return strategy || "append";
}

function getDefaultScope(slotId) {
  return REGION_SLOT_SET.has(slotId) ? "region" : "map";
}

export function createDarkPlacesHybridOverrideId({
  componentId = "",
  slotId = "",
  strategy = "append",
  scope = "map",
  regionId = "",
} = {}) {
  return slugifyLegacyId(
    [
      "hybrid-override",
      scope,
      scope === "region" ? regionId : "location",
      slotId,
      componentId,
      strategy,
    ].join("-"),
  );
}

export function normalizeDarkPlacesHybridOverride(value = {}) {
  const componentId = slugifyLegacyId(value.componentId || value.id);
  const slotId = cleanText(value.slotId);
  const strategy = normalizeStrategy(value.strategy);
  const requestedScope = cleanText(value.scope).toLowerCase();
  const scope = requestedScope || getDefaultScope(slotId);
  const regionId = scope === "region" ? slugifyLegacyId(value.regionId) : "";
  const normalized = {
    schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
    id: slugifyLegacyId(value.overrideId) ||
      createDarkPlacesHybridOverrideId({
        componentId,
        slotId,
        strategy,
        scope,
        regionId,
      }),
    componentId,
    slotId,
    strategy,
    scope,
    regionId,
    targetComponentIds: normalizeIds(value.targetComponentIds),
    targetBlockIds: normalizeIds(value.targetBlockIds),
  };
  return deepFreeze(normalized);
}

export function validateDarkPlacesHybridOverride(
  value = {},
  { path = "hybridOverride" } = {},
) {
  const issues = [];
  if (!isPlainObject(value)) {
    return [
      createIssue({
        code: "contract.object-required",
        path,
        message: "Expected an object.",
      }),
    ];
  }

  Object.keys(value)
    .filter((field) => !OVERRIDE_FIELDS.includes(field))
    .sort()
    .forEach((field) =>
      issues.push(
        createIssue({
          code: "contract.unknown-field",
          path: `${path}.${field}`,
          message: `Unknown hybrid override field: ${field}.`,
        }),
      ),
    );
  if (value.schemaVersion !== DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION) {
    issues.push(
      createIssue({
        code: "contract.schema-version",
        path: `${path}.schemaVersion`,
        message: `Expected ${DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION}.`,
      }),
    );
  }
  if (!slugifyLegacyId(value.id)) {
    issues.push(
      createIssue({
        code: "hybrid-override.id-required",
        path: `${path}.id`,
        message: "A deterministic hybrid override id is required.",
      }),
    );
  }
  if (!slugifyLegacyId(value.componentId)) {
    issues.push(
      createIssue({
        code: "hybrid-override.component-required",
        path: `${path}.componentId`,
        message: "A granular component id is required.",
      }),
    );
  }
  if (!MAP_SLOT_SET.has(value.slotId) && !REGION_SLOT_SET.has(value.slotId)) {
    issues.push(
      createIssue({
        code: "hybrid-override.slot-invalid",
        path: `${path}.slotId`,
        message: `Unsupported Dark Places override slot: ${cleanText(value.slotId) || "(missing)"}.`,
      }),
    );
  }
  if (!STRATEGY_SET.has(value.strategy)) {
    issues.push(
      createIssue({
        code: "hybrid-override.strategy-invalid",
        path: `${path}.strategy`,
        message: `Unsupported hybrid override strategy: ${cleanText(value.strategy) || "(missing)"}.`,
      }),
    );
  }
  if (!SCOPE_SET.has(value.scope)) {
    issues.push(
      createIssue({
        code: "hybrid-override.scope-invalid",
        path: `${path}.scope`,
        message: `Unsupported hybrid override scope: ${cleanText(value.scope) || "(missing)"}.`,
      }),
    );
  }
  if (MAP_SLOT_SET.has(value.slotId) && value.scope !== "map") {
    issues.push(
      createIssue({
        code: "hybrid-override.map-scope-required",
        path: `${path}.scope`,
        message: `Slot ${value.slotId} is map-scoped.`,
      }),
    );
  }
  if (REGION_SLOT_SET.has(value.slotId) && value.scope !== "region") {
    issues.push(
      createIssue({
        code: "hybrid-override.region-scope-required",
        path: `${path}.scope`,
        message: `Slot ${value.slotId} is region-scoped.`,
      }),
    );
  }
  if (value.scope === "region" && !slugifyLegacyId(value.regionId)) {
    issues.push(
      createIssue({
        code: "hybrid-override.region-required",
        path: `${path}.regionId`,
        message: "Region-scoped overrides require a region id.",
      }),
    );
  }
  if (value.scope === "map" && cleanText(value.regionId)) {
    issues.push(
      createIssue({
        code: "hybrid-override.map-region-forbidden",
        path: `${path}.regionId`,
        message: "Map-scoped overrides cannot carry a region id.",
      }),
    );
  }
  ["targetComponentIds", "targetBlockIds"].forEach((field) => {
    if (Array.isArray(value[field])) return;
    issues.push(
      createIssue({
        code: "contract.array-required",
        path: `${path}.${field}`,
        message: "Expected an array.",
      }),
    );
  });
  return issues;
}

export function parseDarkPlacesHybridOverride(value = {}, options = {}) {
  const normalized = normalizeDarkPlacesHybridOverride(value);
  return createParseResult(
    normalized,
    validateDarkPlacesHybridOverride(normalized, options),
  );
}
