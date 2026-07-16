import {
  SEMANTIC_SCHEMA_VERSIONS,
  canonicalizeJsonValue,
  normalizeContentPackV0_2,
  normalizeInspirationModuleV2,
  normalizeLocationDocumentV2,
  normalizeSessionStateV1,
  serializeCanonicalSemanticContent,
  validateContentPackV0_2,
  validateInspirationModuleV2,
  validateLocationDocumentV2,
  validateSessionStateV1,
} from "../../../shared/content/content.index.js";
import {
  adaptDarkPlacesMapIntentToMapRequest,
  createDarkPlacesMapIntent,
} from "./dark-places-map-intent.adapter.js";
import { compileLocationIdentity } from "./location-identity.compiler.js";
import { composeRoomReadAloud } from "./location-read-aloud.compiler.js";
import { allocateRecurringSigns } from "./location-recurring-signs.compiler.js";
import { compileLocationSessionGuide } from "./location-session-guide.compiler.js";
import { allocateSensoryImpressions } from "./location-sensory.compiler.js";
import {
  compileLocationSiteWideSystems,
  mergeLocationBlocks,
} from "./location-site-wide.compiler.js";

export const DARK_PLACES_SEMANTIC_COMPILER_RESULT_SCHEMA_VERSION =
  "cruor-dark-places-semantic-compiler-result-v1";

export const DARK_PLACES_SEMANTIC_COMPILER_STAGES = Object.freeze([
  "normalize-inputs",
  "resolve-components",
  "build-place-identity",
  "build-site-wide-systems",
  "allocate-recurring-signs",
  "allocate-sensory-impressions",
  "compose-room-read-aloud",
  "build-clue-graph-and-session-guide",
  "build-document-skeleton",
  "build-map-intent",
  "validate-document",
  "emit-location-document-v2",
]);

const COMPONENT_GROUPS = Object.freeze([
  "place-identity",
  "site-atmosphere",
  "global-rule",
  "recurring-sign",
  "sensory-profile",
  "read-aloud-profile",
  "session-guide",
  "location-stake",
  "visible-feature",
  "interaction",
  "hazard",
  "clue",
  "encounter-twist",
  "secret",
  "reward",
  "room-design",
  "location-region",
  "monster-graft",
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function getErrors(issues = []) {
  return issues.filter((issue) => issue.severity === "error");
}

function assertSchema(value, expected, label) {
  if (value?.schemaVersion === expected) return;
  throw new Error(
    `${label} requires ${expected}; received ${cleanText(value?.schemaVersion, "unversioned")}.`,
  );
}

function assertNoInputErrors(issues) {
  const errors = getErrors(issues);
  if (!errors.length) return;
  throw new Error(
    `Dark Places semantic compiler input validation failed: ${errors
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join(" | ")}`,
  );
}

export function normalizeDarkPlacesCompilerInputs({
  pack,
  module,
  session,
} = {}) {
  assertSchema(pack, SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK, "Compiler pack");
  assertSchema(
    module,
    SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    "Compiler module",
  );
  assertSchema(
    session,
    SEMANTIC_SCHEMA_VERSIONS.SESSION_STATE,
    "Compiler session",
  );

  const diagnostics = [
    ...validateContentPackV0_2(pack, { path: "compiler.pack" }),
    ...validateInspirationModuleV2(module, { path: "compiler.module" }),
    ...validateSessionStateV1(session, { path: "compiler.session" }),
  ];
  assertNoInputErrors(diagnostics);

  const normalizedPack = normalizeContentPackV0_2(pack);
  const normalizedModule = normalizeInspirationModuleV2(module);
  const normalizedSession = normalizeSessionStateV1(session);
  const ownedModule = normalizedPack.modules.find(
    (entry) => entry.id === normalizedModule.id,
  );
  if (!ownedModule) {
    throw new Error(
      `Compiler module ${normalizedModule.id} is not owned by pack ${normalizedPack.id}.`,
    );
  }
  if (
    serializeCanonicalSemanticContent(ownedModule) !==
    serializeCanonicalSemanticContent(normalizedModule)
  ) {
    throw new Error(
      `Compiler module ${normalizedModule.id} differs from the module owned by pack ${normalizedPack.id}.`,
    );
  }
  if (normalizedModule.packId !== normalizedPack.id) {
    throw new Error(
      `Compiler module packId ${normalizedModule.packId} does not match pack ${normalizedPack.id}.`,
    );
  }
  if (normalizedSession.moduleId !== normalizedModule.id) {
    throw new Error(
      `Compiler session moduleId ${normalizedSession.moduleId} does not match module ${normalizedModule.id}.`,
    );
  }

  return deepFreeze({
    pack: normalizedPack,
    module: normalizedModule,
    session: normalizedSession,
    diagnostics: [...diagnostics],
  });
}

export function resolveDarkPlacesSemanticComponents(context = {}) {
  const selectedIds = new Set(
    context.session.selectedComponentIds.length
      ? context.session.selectedComponentIds
      : context.module.components.map((component) => component.id),
  );
  const selected = context.module.components
    .filter((component) => selectedIds.has(component.id))
    .sort((left, right) => left.id.localeCompare(right.id));
  const missingComponentIds = [...selectedIds]
    .filter((componentId) =>
      context.module.components.every(
        (component) => component.id !== componentId,
      ),
    )
    .sort();
  if (missingComponentIds.length) {
    throw new Error(
      `Compiler session selects unknown components: ${missingComponentIds.join(", ")}.`,
    );
  }

  const bySemanticType = Object.fromEntries(
    COMPONENT_GROUPS.map((semanticType) => [semanticType, []]),
  );
  selected.forEach((component) => {
    bySemanticType[component.semanticType] ||= [];
    bySemanticType[component.semanticType].push(component);
  });

  return deepFreeze({ selected, bySemanticType });
}

export function buildDarkPlacesLocationDocumentSkeleton(
  context = {},
  components = {},
  systems = {},
) {
  const seed = context.session.locationSeed;
  return normalizeLocationDocumentV2({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.LOCATION_DOCUMENT,
    id: context.session.id,
    seed: context.session.seed,
    meta: seed.meta,
    identity: systems.identity || seed.identity,
    siteWide: systems.siteWide || seed.siteWide,
    sessionGuide: systems.sessionGuide || seed.sessionGuide,
    map: seed.map,
    rooms: systems.rooms || seed.rooms,
    validation: {
      status: "draft",
      issues: [],
      coverage: seed.coverage,
    },
    provenance: context.session.provenance,
  });
}

function finalizeDocument(document, compilerIssues = []) {
  const initialIssues = [
    ...validateLocationDocumentV2(document),
    ...compilerIssues,
  ];
  const status = getErrors(initialIssues).length ? "invalid" : "valid";
  const finalized = normalizeLocationDocumentV2({
    ...document,
    validation: {
      ...document.validation,
      status,
      issues: initialIssues,
    },
  });
  const finalIssues = validateLocationDocumentV2(finalized);
  return {
    document: finalized,
    diagnostics: [...initialIssues, ...finalIssues].filter(
      (issue, index, values) =>
        values.findIndex(
          (candidate) =>
            candidate.code === issue.code &&
            candidate.path === issue.path &&
            candidate.message === issue.message,
        ) === index,
    ),
  };
}

export function compileDarkPlacesSemanticLocation(input = {}) {
  const context = normalizeDarkPlacesCompilerInputs(input);
  const components = resolveDarkPlacesSemanticComponents(context);
  const identity = compileLocationIdentity({
    seedIdentity: context.session.locationSeed.identity,
    components: components.bySemanticType["place-identity"],
    fallbackProvenance: context.session.provenance,
  });
  const siteWideSystems = compileLocationSiteWideSystems({
    seedSiteWide: context.session.locationSeed.siteWide,
    components,
    identity,
    intrusion: context.session.locationSeed.meta.intrusion,
    fallbackProvenance: context.session.provenance,
  });
  const recurringSigns = allocateRecurringSigns({
    rooms: context.session.locationSeed.rooms,
    components: components.bySemanticType["recurring-sign"],
    seed: context.session.seed,
  });
  const sensory = allocateSensoryImpressions({
    rooms: recurringSigns.rooms,
    components: components.bySemanticType["sensory-profile"],
    seed: context.session.seed,
  });
  const readAloud = composeRoomReadAloud({
    rooms: sensory.rooms,
    components: components.bySemanticType["read-aloud-profile"],
    seed: context.session.seed,
  });
  const sessionGuide = compileLocationSessionGuide({
    seedGuide: context.session.locationSeed.sessionGuide,
    components: components.bySemanticType["session-guide"],
    identity,
    globalRuleBlocks: siteWideSystems.globalRuleBlocks,
    rooms: readAloud.rooms,
    fallbackProvenance: context.session.provenance,
  });
  const siteWide = {
    ...siteWideSystems.siteWide,
    recurringSigns: mergeLocationBlocks([
      ...siteWideSystems.siteWide.recurringSigns,
      ...recurringSigns.summaries,
    ]),
  };
  const skeleton = buildDarkPlacesLocationDocumentSkeleton(
    context,
    components,
    {
      identity,
      siteWide,
      globalRuleBlocks: siteWideSystems.globalRuleBlocks,
      rooms: readAloud.rooms,
      sessionGuide: sessionGuide.sessionGuide,
    },
  );
  const mapIntent = createDarkPlacesMapIntent({
    module: context.module,
    session: context.session,
  });
  const mapRequest = adaptDarkPlacesMapIntentToMapRequest(mapIntent);
  const finalized = finalizeDocument(skeleton, sessionGuide.diagnostics);
  const diagnostics = [
    ...context.diagnostics,
    ...recurringSigns.diagnostics,
    ...sensory.diagnostics,
    ...readAloud.diagnostics,
    ...finalized.diagnostics,
  ];

  return deepFreeze(
    canonicalizeJsonValue({
      schemaVersion: DARK_PLACES_SEMANTIC_COMPILER_RESULT_SCHEMA_VERSION,
      stages: [...DARK_PLACES_SEMANTIC_COMPILER_STAGES],
      document: finalized.document,
      mapIntent,
      mapRequest,
      diagnostics,
      valid: getErrors(diagnostics).length === 0,
    }),
  );
}

export function serializeCompiledLocationDocument(document = {}) {
  return serializeCanonicalSemanticContent(
    normalizeLocationDocumentV2(document),
  );
}
