import {
  canonicalizeJsonValue,
  cleanText,
  cloneJson,
  createIssue,
  createParseResult,
  deepFreeze,
  isPlainObject,
  slugifyLegacyId,
} from "./semantic/contract-utils.js";
import { normalizeDarkPlacesHybridOverride } from "./dark-places-hybrid-override.js";

export const DARK_PLACES_COMPOSER_INPUT_SCHEMA_VERSION =
  "cruor-dark-places-composer-input-v1";

export const DARK_PLACES_GRANULAR_SLOT_IDS = Object.freeze([
  "horrorPremise",
  "sensoryLayer",
  "visibleAnomaly",
  "hazard",
  "clue",
  "encounterTwist",
  "reward",
]);

const INPUT_FIELDS = Object.freeze([
  "schemaVersion",
  "moduleId",
  "moduleVersion",
  "sourceAnchors",
  "context",
  "horror",
  "horrors",
  "intrusion",
  "seed",
  "rooms",
  "mapState",
  "selectedGranularComponents",
  "slotAssignments",
  "locks",
  "userOverrides",
  "provenance",
]);

function toArray(value) {
  if (value instanceof Set) return [...value];
  if (Array.isArray(value)) return value;
  return value === undefined || value === null || value === "" ? [] : [value];
}

function getReferenceValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return (
    value.sourceAnchorId ||
    value.componentId ||
    value.id ||
    value.value ||
    value.slug ||
    value.label ||
    value.name ||
    value.title ||
    ""
  );
}

function normalizeTokenSet(value) {
  return [
    ...new Set(
      toArray(value)
        .map(getReferenceValue)
        .map(slugifyLegacyId)
        .filter(Boolean),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

function normalizeTextSet(value) {
  return [...new Set(toArray(value).map(cleanText).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function cloneCanonicalObject(value, fallback = {}) {
  const cloned = cloneJson(value, fallback);
  return canonicalizeJsonValue(isPlainObject(cloned) ? cloned : fallback);
}

function normalizeComponentReference(value, fallbackSlotId = "") {
  const componentId = slugifyLegacyId(getReferenceValue(value));
  if (!componentId) return null;
  const objectValue = isPlainObject(value) ? value : {};
  const slots = toArray(objectValue.slots);
  const override = normalizeDarkPlacesHybridOverride({
    componentId,
    slotId: cleanText(objectValue.slotId || slots[0] || fallbackSlotId),
    regionId: cleanText(objectValue.regionId),
    strategy: objectValue.strategy,
    scope: objectValue.scope,
    targetComponentIds: objectValue.targetComponentIds,
    targetBlockIds: objectValue.targetBlockIds,
  });
  return {
    componentId: override.componentId,
    slotId: override.slotId,
    strategy: override.strategy,
    scope: override.scope,
    regionId: override.regionId,
    targetComponentIds: override.targetComponentIds,
    targetBlockIds: override.targetBlockIds,
  };
}

function sortComponentReferences(values = []) {
  return [...values].sort((left, right) =>
    `${left.scope}:${left.regionId}:${left.slotId}:${left.componentId}:${left.strategy}`.localeCompare(
      `${right.scope}:${right.regionId}:${right.slotId}:${right.componentId}:${right.strategy}`,
    ),
  );
}

function normalizeSelectedComponents(value) {
  const references = toArray(value)
    .map((entry) => normalizeComponentReference(entry))
    .filter(Boolean);
  return sortComponentReferences(
    references.filter(
      (entry, index) =>
        references.findIndex(
          (candidate) =>
            candidate.componentId === entry.componentId &&
            candidate.slotId === entry.slotId &&
            candidate.regionId === entry.regionId &&
            candidate.strategy === entry.strategy,
        ) === index,
    ),
  );
}

function normalizeSlotAssignments(value) {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((slotId) => [
        slotId,
        sortComponentReferences(
          toArray(value[slotId])
            .map((entry) => normalizeComponentReference(entry, slotId))
            .filter(Boolean),
        ),
      ]),
  );
}

function normalizeLocks(value) {
  const locks = isPlainObject(value) ? value : {};
  return {
    componentIds: normalizeTokenSet(locks.componentIds),
    roomIds: normalizeTokenSet(locks.roomIds),
    slotIds: normalizeTextSet(locks.slotIds),
    paths: normalizeTextSet(locks.paths),
  };
}

export function normalizeDarkPlacesComposerInput(value = {}) {
  const rooms = Array.isArray(value.rooms)
    ? canonicalizeJsonValue(cloneJson(value.rooms, [])).filter(
        (room) => room && typeof room === "object",
      )
    : [];
  return deepFreeze({
    schemaVersion: DARK_PLACES_COMPOSER_INPUT_SCHEMA_VERSION,
    moduleId: slugifyLegacyId(getReferenceValue(value.moduleId)),
    moduleVersion: cleanText(value.moduleVersion),
    sourceAnchors: normalizeTokenSet(value.sourceAnchors),
    context: normalizeTokenSet(value.context),
    horror: normalizeTokenSet(value.horrors ?? value.horror),
    intrusion: normalizeTokenSet(value.intrusion),
    seed: cleanText(value.seed),
    rooms,
    mapState: cloneCanonicalObject(value.mapState),
    selectedGranularComponents: normalizeSelectedComponents(
      value.selectedGranularComponents,
    ),
    slotAssignments: normalizeSlotAssignments(value.slotAssignments),
    locks: normalizeLocks(value.locks),
    userOverrides: cloneCanonicalObject(value.userOverrides),
    provenance: cloneCanonicalObject(value.provenance),
  });
}

export function validateDarkPlacesComposerInput(
  value = {},
  { path = "composerInput" } = {},
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
    .filter((field) => !INPUT_FIELDS.includes(field))
    .sort()
    .forEach((field) =>
      issues.push(
        createIssue({
          code: "contract.unknown-field",
          path: `${path}.${field}`,
          message: `Unknown contract field: ${field}.`,
        }),
      ),
    );

  if (value.schemaVersion !== DARK_PLACES_COMPOSER_INPUT_SCHEMA_VERSION) {
    issues.push(
      createIssue({
        code: "contract.schema-version",
        path: `${path}.schemaVersion`,
        message: `Expected ${DARK_PLACES_COMPOSER_INPUT_SCHEMA_VERSION}.`,
      }),
    );
  }
  if (!slugifyLegacyId(value.moduleId)) {
    issues.push(
      createIssue({
        code: "runtime.module-id-required",
        path: `${path}.moduleId`,
        message: "A semantic Inspiration Module id is required.",
      }),
    );
  }
  if (!cleanText(value.moduleVersion)) {
    issues.push(
      createIssue({
        code: "runtime.module-version-required",
        path: `${path}.moduleVersion`,
        message: "The selected semantic module pack version is required.",
      }),
    );
  }

  ["sourceAnchors", "context", "horror", "intrusion", "rooms", "selectedGranularComponents"].forEach(
    (field) => {
      if (Array.isArray(value[field])) return;
      issues.push(
        createIssue({
          code: "contract.array-required",
          path: `${path}.${field}`,
          message: "Expected an array.",
        }),
      );
    },
  );
  ["mapState", "slotAssignments", "locks", "userOverrides", "provenance"].forEach(
    (field) => {
      if (isPlainObject(value[field])) return;
      issues.push(
        createIssue({
          code: "contract.object-required",
          path: `${path}.${field}`,
          message: "Expected an object.",
        }),
      );
    },
  );

  return issues;
}

export function parseDarkPlacesComposerInput(value = {}, options = {}) {
  const normalized = normalizeDarkPlacesComposerInput(value);
  return createParseResult(
    normalized,
    validateDarkPlacesComposerInput(normalized, options),
  );
}
