import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeComponentV2,
  normalizeLegacyComponentV2,
  normalizeContentPackV0_2,
  normalizeInspirationModuleV2,
  normalizeSemanticContent,
} from "../../../shared/content/content.index.js";
import { getStudioMonsterPayload } from "./studio-component-normalizers.js";

function cloneJson(value, fallback = {}) {
  if (value === undefined) return fallback;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeLookupId(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSourceAnchorIds(component = {}) {
  return asArray(component.sourceAnchors || component.sourceAnchorIds).map(
    normalizeLookupId,
  );
}

function findLegacyComponent(component, legacyComponents = []) {
  const ids = new Set([
    normalizeLookupId(component.id),
    ...asArray(component.provenance?.legacyIds).map(normalizeLookupId),
  ]);
  return legacyComponents.find((legacyComponent) =>
    [legacyComponent.id, legacyComponent.legacyId, legacyComponent.title]
      .map(normalizeLookupId)
      .some((id) => id && ids.has(id)),
  );
}

function buildLegacyMonsterPayload(component = {}) {
  const monster = cloneJson(getStudioMonsterPayload(component), {});
  const graftId = monster.graftId || component.id || component.legacyId || "";
  const slot =
    monster.slot || component.slot || asArray(component.slots)[0] || "";

  return {
    ...monster,
    ...(graftId ? { graftId } : {}),
    ...(slot ? { slot } : {}),
    ...(monster.section || component.section
      ? { section: monster.section || component.section }
      : {}),
    ...(monster.rules || component.rules
      ? { rules: cloneJson(monster.rules || component.rules, {}) }
      : {}),
    ...(monster.constraints ||
    component.anatomyConstraints ||
    component.constraints
      ? {
          constraints: cloneJson(
            monster.constraints ||
              component.anatomyConstraints ||
              component.constraints,
            {},
          ),
        }
      : {}),
    ...(monster.anatomyGrants || component.anatomyGrants
      ? {
          anatomyGrants: cloneJson(
            monster.anatomyGrants || component.anatomyGrants,
            {},
          ),
        }
      : {}),
    ...(monster.fit || component.fit || component.frameFit
      ? {
          fit: cloneJson(
            monster.fit || component.fit || component.frameFit,
            {},
          ),
        }
      : {}),
  };
}

function enrichCompatibilityComponent(component, legacyComponent) {
  if (!legacyComponent) return component;
  const details = cloneJson(component.semantic?.details, {});

  if (component.semanticType === "monster-graft") {
    details.monster = buildLegacyMonsterPayload(legacyComponent);
    if (legacyComponent.counterplay) {
      details.counterplay = String(legacyComponent.counterplay);
    }
  } else if (legacyComponent.contentType === "location-region") {
    details.locationRegion = cloneJson(
      legacyComponent.locationRegion || legacyComponent.map,
      {},
    );
  } else if (
    legacyComponent.contentType === "location-component" ||
    legacyComponent.location
  ) {
    details.location = cloneJson(legacyComponent.location, {});
  }

  return normalizeComponentV2({
    ...component,
    semantic: {
      ...component.semantic,
      details,
    },
  });
}

function enrichCompatibilityModule(module, legacyComponents = []) {
  return normalizeInspirationModuleV2({
    ...module,
    components: module.components.map((component) =>
      enrichCompatibilityComponent(
        component,
        findLegacyComponent(component, legacyComponents),
      ),
    ),
  });
}

function getLegacyComponentsForModule(input, module) {
  if (Array.isArray(input?.components)) return input.components;
  const components = asArray(input?.collections?.components);
  const sourceAnchorId = normalizeLookupId(module.sourceAnchor?.id);
  return components.filter((component) => {
    const ids = getSourceAnchorIds(component);
    return !ids.length || ids.includes(sourceAnchorId);
  });
}

function prepareMixedV2Module(module = {}) {
  const {
    monsterGrafts: _monsterGrafts,
    locationComponents: _locationComponents,
    locationRegions: _locationRegions,
    ...canonicalModule
  } = module;
  const sourceAnchorId = normalizeLookupId(
    canonicalModule.sourceAnchor?.id || canonicalModule.id,
  );
  return {
    ...canonicalModule,
    components: asArray(canonicalModule.components).map((component) => {
      if (component?.schemaVersion === SEMANTIC_SCHEMA_VERSIONS.COMPONENT) {
        return component;
      }
      const normalized = normalizeLegacyComponentV2(component, [sourceAnchorId]);
      return enrichCompatibilityComponent(normalized, component);
    }),
  };
}

function prepareMixedV2Input(value) {
  if (value?.schemaVersion === SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE) {
    return prepareMixedV2Module(value);
  }
  if (value?.schemaVersion === SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK) {
    return {
      ...value,
      modules: asArray(value.modules).map(prepareMixedV2Module),
    };
  }
  return value;
}

function createImportFailure(message, code = "studio.import-invalid-json") {
  return {
    ok: false,
    kind: "unknown",
    mode: "unsupported",
    sourceSchema: "unknown",
    targetSchema: "",
    value: null,
    pack: null,
    modules: [],
    selectedModule: null,
    diagnostics: [
      {
        code,
        severity: "error",
        path: "input",
        message,
      },
    ],
  };
}

function parseInput(input) {
  if (typeof input !== "string") return { value: input, error: null };
  try {
    return { value: JSON.parse(input), error: null };
  } catch (error) {
    return {
      value: null,
      error: createImportFailure(
        `Studio could not parse the selected JSON: ${error.message}`,
      ),
    };
  }
}

export function importStudioSemanticContent(input, { moduleId = "" } = {}) {
  const parsed = parseInput(input);
  if (parsed.error) return parsed.error;

  const preparedValue = prepareMixedV2Input(parsed.value);
  const normalized = normalizeSemanticContent(preparedValue);
  if (!normalized.value) {
    return {
      ok: false,
      kind: normalized.kind,
      mode: normalized.mode,
      sourceSchema: normalized.sourceSchema,
      targetSchema: normalized.targetSchema,
      value: null,
      pack: null,
      modules: [],
      selectedModule: null,
      diagnostics: cloneJson(normalized.diagnostics, []),
    };
  }

  const rawModules =
    normalized.kind === "content-pack"
      ? normalized.value.modules
      : [normalized.value];
  const modules =
    normalized.mode === "v1-compatibility"
      ? rawModules.map((module) =>
          enrichCompatibilityModule(
            module,
            getLegacyComponentsForModule(parsed.value, module),
          ),
        )
      : rawModules.map(normalizeInspirationModuleV2);
  const value =
    normalized.kind === "content-pack"
      ? normalizeContentPackV0_2({ ...normalized.value, modules })
      : modules[0];
  const selectedModule =
    modules.find((module) => module.id === moduleId) || modules[0] || null;

  return {
    ok:
      Boolean(selectedModule) &&
      !normalized.diagnostics.some(
        (diagnostic) => diagnostic.severity === "error",
      ),
    kind: normalized.kind,
    mode: normalized.mode,
    sourceSchema: normalized.sourceSchema,
    targetSchema: normalized.targetSchema,
    value,
    pack: normalized.kind === "content-pack" ? value : null,
    modules,
    selectedModule,
    diagnostics: cloneJson(normalized.diagnostics, []),
  };
}

export function isStudioV2Write(value) {
  return [
    SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
  ].includes(value?.schemaVersion);
}
