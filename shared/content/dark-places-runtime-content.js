import {
  canonicalizeJsonValue,
  cloneJson,
  createIssue,
  deepFreeze,
} from "./contracts/semantic/contract-utils.js";
import {
  validateContentPackV0_2,
  validateInspirationModuleV2,
} from "./contracts/semantic/index.js";
import {
  DARK_PLACES_GRANULAR_SLOT_IDS,
  parseDarkPlacesComposerInput,
} from "./contracts/dark-places-composer-input.js";
import {
  DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
  normalizeDarkPlacesHybridOverride,
  validateDarkPlacesHybridOverride,
} from "./contracts/dark-places-hybrid-override.js";

export const DARK_PLACES_RUNTIME_CONTENT_SCHEMA_VERSION =
  "cruor-dark-places-runtime-content-v1";

const DARK_PLACES_WORKFLOW_ID = "darken-location";
const LOCATION_COMPONENT_CONTENT_TYPE = "location-component";
const LOCATION_REGION_CONTENT_TYPE = "location-region";
const ANY_TOKENS = new Set(["any", "any-source"]);

function cloneCanonical(value, fallback) {
  return canonicalizeJsonValue(cloneJson(value, fallback));
}

function sortById(values = []) {
  return [...values].sort((left, right) =>
    `${left?.id || ""}:${JSON.stringify(canonicalizeJsonValue(left || {}))}`.localeCompare(
      `${right?.id || ""}:${JSON.stringify(canonicalizeJsonValue(right || {}))}`,
    ),
  );
}

function normalizeTokens(value) {
  const values = value instanceof Set
    ? [...value]
    : Array.isArray(value)
      ? value
      : value
        ? [value]
        : [];
  return values
    .map((entry) =>
      String(
        entry?.sourceAnchorId ||
          entry?.id ||
          entry?.value ||
          entry?.slug ||
          entry?.label ||
          entry ||
          "",
      )
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
}

function matchesSelection(componentValues, selectedValues) {
  const selected = normalizeTokens(selectedValues);
  if (!selected.length || selected.some((value) => ANY_TOKENS.has(value))) {
    return true;
  }
  const available = normalizeTokens(componentValues);
  if (available.some((value) => ANY_TOKENS.has(value))) return true;
  return selected.some((value) => available.includes(value));
}

function matchesGranularCriteria(component, input) {
  return (
    matchesSelection(component.contexts, input.context) &&
    matchesSelection(component.intrusion, input.intrusion) &&
    matchesSelection(component.sourceAnchors, input.sourceAnchors) &&
    matchesSelection(component.horror, input.horror)
  );
}

function matchesRegionCriteria(component, input) {
  return (
    matchesSelection(component.contexts, input.context) &&
    matchesSelection(component.sourceAnchors, input.sourceAnchors) &&
    matchesSelection(component.horror, input.horror)
  );
}

function groupSemanticComponents(components = []) {
  const groups = {};
  sortById(components).forEach((component) => {
    groups[component.semanticType] ||= [];
    groups[component.semanticType].push(component);
  });
  return Object.fromEntries(
    Object.keys(groups)
      .sort()
      .map((semanticType) => [semanticType, groups[semanticType]]),
  );
}

function collectModuleRecords(packs = []) {
  return packs.flatMap((pack) =>
    (pack.modules || []).map((module) => ({ module, pack })),
  );
}

export function createDarkPlacesSemanticModuleReferenceResolver({
  getSemanticPacks,
}) {
  return function getDarkPlacesSemanticModuleReference({
    moduleId = "",
    sourceAnchors = [],
  } = {}) {
    const requestedModuleIds = normalizeTokens(moduleId);
    const requestedSourceAnchors = normalizeTokens(sourceAnchors);
    const records = collectModuleRecords(getSemanticPacks()).sort((left, right) =>
      `${left.module.id}:${left.pack.id}`.localeCompare(
        `${right.module.id}:${right.pack.id}`,
      ),
    );
    const record =
      records.find(({ module }) => requestedModuleIds.includes(module.id)) ||
      records.find(({ module }) =>
        requestedSourceAnchors.includes(module.sourceAnchor?.id || module.id),
      );
    if (!record) return null;

    return deepFreeze(
      cloneCanonical(
        {
          moduleId: record.module.id,
          moduleVersion: record.pack.version,
          packId: record.pack.id,
          sourceAnchorId: record.module.sourceAnchor?.id || record.module.id,
          title: record.module.title,
          capabilities: record.module.capabilities || [],
          provenance: record.module.provenance || {},
        },
        {},
      ),
    );
  };
}

function normalizeExternalCapabilityLink(link = {}) {
  return {
    capability: String(link.capability || "").trim(),
    expectedEntries: Number.isFinite(Number(link.expectedEntries))
      ? Math.max(0, Math.trunc(Number(link.expectedEntries)))
      : 0,
    ownership: String(link.ownership || "").trim(),
    sourceAnchorId: String(link.sourceAnchorId || "").trim(),
    sourceFile: String(link.sourceFile || "").trim(),
    verification: String(link.verification || "").trim(),
  };
}

function collectExternalCapabilityLinks(pack, module) {
  const links = [
    ...(module?.metadata?.modernCapabilityLinks || []),
    ...(pack?.metadata?.modernCapabilityLinks || []),
  ]
    .map(normalizeExternalCapabilityLink)
    .filter((link) => link.capability && link.ownership);
  return links
    .filter(
      (link, index) =>
        links.findIndex(
          (candidate) =>
            JSON.stringify(candidate) === JSON.stringify(link),
        ) === index,
    )
    .sort((left, right) =>
      `${left.capability}:${left.sourceAnchorId}:${left.sourceFile}`.localeCompare(
        `${right.capability}:${right.sourceAnchorId}:${right.sourceFile}`,
      ),
    );
}

function getComponentProvenance(component) {
  return {
    componentId: component.id,
    contentProvenance: cloneCanonical(component.contentProvenance || {}, {}),
  };
}

function resolveSelectedGranularComponents(registry, input, diagnostics) {
  const assignmentSelections = Object.values(input.slotAssignments).flat();
  const assignedComponentIds = new Set(
    assignmentSelections.map((selection) => selection.componentId),
  );
  const standaloneSelections = input.selectedGranularComponents.filter(
    (selection) => !assignedComponentIds.has(selection.componentId),
  );
  const selections = [...assignmentSelections, ...standaloneSelections]
    .filter(
      (selection, index, values) =>
        values.findIndex(
          (candidate) =>
            candidate.componentId === selection.componentId &&
            candidate.slotId === selection.slotId &&
            candidate.regionId === selection.regionId &&
            candidate.strategy === selection.strategy,
        ) === index,
    )
    .sort((left, right) =>
      `${left.scope}:${left.regionId}:${left.slotId}:${left.componentId}:${left.strategy}`.localeCompare(
        `${right.scope}:${right.regionId}:${right.slotId}:${right.componentId}:${right.strategy}`,
      ),
    );

  return selections.flatMap((selection, index) => {
    const component = registry.getComponent(selection.componentId);
    if (!component || component.contentType !== LOCATION_COMPONENT_CONTENT_TYPE) {
      diagnostics.push(
        createIssue({
          code: "runtime.granular-component-not-found",
          path: `composerInput.granularSelection[${index}].componentId`,
          message: `Unknown granular Dark Places component: ${selection.componentId}.`,
          details: selection,
        }),
      );
      return [];
    }
    return [{ selection, component }];
  });
}

function getMappedBaselineComponentIds(module, granularComponentId) {
  return sortById(module?.components || [])
    .filter((component) =>
      (component.provenance?.legacyIds || []).includes(granularComponentId),
    )
    .map((component) => component.id);
}

function buildHybridOverridePlan(
  resolvedGranularSelection,
  module,
  input,
  diagnostics,
) {
  const entries = resolvedGranularSelection
    .map(({ selection, component }, index) => {
      const locked =
        input.locks.componentIds.includes(component.id) ||
        input.locks.slotIds.includes(selection.slotId) ||
        (selection.regionId && input.locks.roomIds.includes(selection.regionId));
      const override = normalizeDarkPlacesHybridOverride({
        ...selection,
        strategy: locked ? "lock" : selection.strategy,
        targetComponentIds: [
          ...(selection.targetComponentIds || []),
          ...getMappedBaselineComponentIds(module, component.id),
        ],
      });
      diagnostics.push(
        ...validateDarkPlacesHybridOverride(override, {
          path: `hybridOverridePlan.all[${index}].override`,
        }),
      );

      return { override, component };
    })
    .sort((left, right) =>
      left.override.id.localeCompare(right.override.id),
    );
  const mapScoped = entries.filter(
    (entry) => entry.override.scope === "map",
  );
  const regionEntries = entries.filter(
    (entry) => entry.override.scope === "region",
  );
  const regionScoped = Object.fromEntries(
    [...new Set(regionEntries.map((entry) => entry.override.regionId))]
      .filter(Boolean)
      .sort()
      .map((regionId) => [
        regionId,
        regionEntries.filter(
          (entry) => entry.override.regionId === regionId,
        ),
      ]),
  );

  return {
    schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
    all: entries,
    mapScoped,
    regionScoped,
  };
}

function buildEmptyResult(input, diagnostics) {
  return {
    schemaVersion: DARK_PLACES_RUNTIME_CONTENT_SCHEMA_VERSION,
    input,
    semanticBaseline: null,
    granularCandidatePools: Object.fromEntries(
      DARK_PLACES_GRANULAR_SLOT_IDS.map((slotId) => [slotId, []]),
    ),
    resolvedGranularSelection: [],
    hybridOverridePlan: {
      schemaVersion: DARK_PLACES_HYBRID_OVERRIDE_SCHEMA_VERSION,
      all: [],
      mapScoped: [],
      regionScoped: {},
    },
    locationRegions: [],
    externalCapabilityLinks: [],
    provenance: {
      input: input.provenance,
      semanticPack: null,
      semanticModule: null,
      granularComponents: [],
      locationRegions: [],
    },
    diagnostics,
    valid: false,
  };
}

export function createDarkPlacesRuntimeContentResolver({
  getRegistry,
  getSemanticPacks,
}) {
  return function resolveDarkPlacesRuntimeContent(value = {}) {
    const parsed = parseDarkPlacesComposerInput(value);
    const input = parsed.value;
    const diagnostics = [...parsed.issues];
    const registry = getRegistry();
    const moduleRecords = collectModuleRecords(getSemanticPacks());
    const matches = moduleRecords.filter(
      ({ module }) => module.id === input.moduleId,
    );

    if (!matches.length) {
      diagnostics.push(
        createIssue({
          code: "runtime.semantic-module-not-found",
          path: "composerInput.moduleId",
          message: `Semantic Inspiration Module not found: ${input.moduleId || "(missing)"}.`,
        }),
      );
      return deepFreeze(cloneCanonical(buildEmptyResult(input, diagnostics), {}));
    }
    if (matches.length > 1) {
      diagnostics.push(
        createIssue({
          code: "runtime.semantic-module-ambiguous",
          path: "composerInput.moduleId",
          message: `Semantic Inspiration Module is owned by multiple packs: ${input.moduleId}.`,
          details: matches.map(({ pack }) => pack.id).sort(),
        }),
      );
      return deepFreeze(cloneCanonical(buildEmptyResult(input, diagnostics), {}));
    }

    const { module, pack } = matches[0];
    diagnostics.push(
      ...validateContentPackV0_2(pack, { path: "runtime.semanticPack" }),
      ...validateInspirationModuleV2(module, {
        path: "runtime.semanticModule",
      }),
    );
    if (pack.version !== input.moduleVersion) {
      diagnostics.push(
        createIssue({
          code: "runtime.semantic-module-version-mismatch",
          path: "composerInput.moduleVersion",
          message: `Expected semantic pack version ${pack.version}; received ${input.moduleVersion || "(missing)"}.`,
          details: { actual: input.moduleVersion, expected: pack.version },
        }),
      );
    }
    if (!module.capabilities?.includes("dark-places")) {
      diagnostics.push(
        createIssue({
          code: "runtime.dark-places-capability-required",
          path: "runtime.semanticModule.capabilities",
          message: `Module ${module.id} does not declare the dark-places capability.`,
        }),
      );
    }

    const granularCandidatePools = Object.fromEntries(
      DARK_PLACES_GRANULAR_SLOT_IDS.map((slotId) => {
        const candidates = sortById(
          registry
            .getComponents({
              workflow: DARK_PLACES_WORKFLOW_ID,
              contentType: LOCATION_COMPONENT_CONTENT_TYPE,
              slot: slotId,
            })
            .filter((component) => matchesGranularCriteria(component, input)),
        );
        if (!candidates.length) {
          diagnostics.push(
            createIssue({
              code: "runtime.granular-pool-empty",
              path: `granularCandidatePools.${slotId}`,
              message: `No granular candidates match slot ${slotId}.`,
              severity: "warning",
            }),
          );
        }
        return [slotId, candidates];
      }),
    );
    const locationRegions = sortById(
      registry
        .getComponents({
          workflow: DARK_PLACES_WORKFLOW_ID,
          contentType: LOCATION_REGION_CONTENT_TYPE,
        })
        .filter((component) => matchesRegionCriteria(component, input)),
    );
    if (!locationRegions.length) {
      diagnostics.push(
        createIssue({
          code: "runtime.location-regions-empty",
          path: "locationRegions",
          message: "No location regions match the Composer criteria.",
          severity: "warning",
        }),
      );
    }

    const resolvedGranularSelection = resolveSelectedGranularComponents(
      registry,
      input,
      diagnostics,
    );
    const hybridOverridePlan = buildHybridOverridePlan(
      resolvedGranularSelection,
      module,
      input,
      diagnostics,
    );
    const granularComponents = sortById([
      ...Object.values(granularCandidatePools).flat(),
      ...resolvedGranularSelection.map(({ component }) => component),
    ]).filter(
      (component, index, values) =>
        values.findIndex((candidate) => candidate.id === component.id) === index,
    );
    const result = {
      schemaVersion: DARK_PLACES_RUNTIME_CONTENT_SCHEMA_VERSION,
      input,
      semanticBaseline: {
        pack,
        module,
        components: sortById(module.components || []),
        componentsBySemanticType: groupSemanticComponents(
          module.components || [],
        ),
      },
      granularCandidatePools,
      resolvedGranularSelection,
      hybridOverridePlan,
      locationRegions,
      externalCapabilityLinks: collectExternalCapabilityLinks(pack, module),
      provenance: {
        input: input.provenance,
        semanticPack: {
          packId: pack.id,
          packVersion: pack.version,
          registryRole: pack.metadata?.registryRole || "",
        },
        semanticModule: module.provenance,
        granularComponents: granularComponents.map(getComponentProvenance),
        locationRegions: locationRegions.map(getComponentProvenance),
      },
      diagnostics,
      valid: diagnostics.every((issue) => issue.severity !== "error"),
    };

    return deepFreeze(cloneCanonical(result, {}));
  };
}
