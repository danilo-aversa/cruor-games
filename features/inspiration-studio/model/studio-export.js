import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeComponentV2,
  normalizeContentPackV0_2,
  normalizeInspirationModuleV2,
  serializeCanonicalSemanticContent,
} from "../../../shared/content/content.index.js";
import {
  asArray,
  clone,
  normalizeMonsterConstraintData,
  normalizeMonsterGrantData,
  slugify,
} from "./studio-component-normalizers.js";
import { normalizeModuleForDraft } from "./studio-draft.js";
import { getStudioComponentFamily } from "./studio-editor-registry.js";

const SPECIALIZED_SEMANTIC_TYPES = new Set([
  "place-identity",
  "site-atmosphere",
  "global-rule",
  "recurring-sign",
  "sensory-profile",
  "read-aloud-profile",
  "session-guide",
]);

function cleanObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? clone(value)
    : {};
}

function getMechanicsText(value) {
  if (typeof value === "string") return value;
  return value && typeof value === "object" ? String(value.text || "") : "";
}

function updateGenericSemantic(component) {
  const semantic = cleanObject(component.semantic);
  semantic.summary = String(component.summary ?? semantic.summary ?? "");
  semantic.tableText = String(component.tableText ?? semantic.tableText ?? "");
  semantic.narrative = String(component.narrative ?? semantic.narrative ?? "");

  const originalMechanicsText = getMechanicsText(semantic.mechanics);
  if (String(component.mechanics || "") !== originalMechanicsText) {
    semantic.mechanics = {
      ...cleanObject(semantic.mechanics),
      ...(component.mechanics ? { text: String(component.mechanics) } : {}),
    };
  }

  const details = cleanObject(semantic.details);
  const family = getStudioComponentFamily(component);
  if (family === "monster-graft") {
    const monster = cleanObject(component.monster);
    const constraints = normalizeMonsterConstraintData(component);
    const anatomyGrants = normalizeMonsterGrantData(component);
    details.monster = {
      ...monster,
      ...(constraints ? { constraints } : {}),
      ...(anatomyGrants ? { anatomyGrants } : {}),
    };
    if (component.counterplay)
      details.counterplay = String(component.counterplay);
    else delete details.counterplay;
  } else if (family === "location-region") {
    details.locationRegion = cleanObject(component.locationRegion);
  } else {
    details.location = cleanObject(component.location);
  }
  semantic.details = details;
  return semantic;
}

function updateGeneration(component) {
  const generation = cleanObject(component.generation);
  const family = getStudioComponentFamily(component);
  const location =
    family === "location-region"
      ? component.locationRegion
      : component.location;
  if (location?.mapInfluence) {
    generation.mapInfluence = clone(location.mapInfluence);
  }
  if (location?.roomDesign) {
    generation.roomDesign = clone(location.roomDesign);
  }
  return generation;
}

export function normalizeExportComponent(component = {}, moduleDraft = {}) {
  const sourceAnchorId = moduleDraft.sourceAnchor?.id || moduleDraft.id;
  const semanticType =
    component.semanticType ||
    (component.contentType === "monster-graft"
      ? "monster-graft"
      : component.contentType === "location-region"
        ? "location-region"
        : "interaction");
  const semantic = SPECIALIZED_SEMANTIC_TYPES.has(semanticType)
    ? cleanObject(component.semantic)
    : updateGenericSemantic({ ...component, semanticType });

  return normalizeComponentV2({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id:
      component.id ||
      slugify(component.title || component.label || "component"),
    title: component.title || component.label || "Untitled Component",
    status: component.status || "draft",
    contentType: component.contentType || "semantic-component",
    semanticType,
    workflows: asArray(component.workflows),
    slots: asArray(component.slots),
    sourceAnchors: asArray(component.sourceAnchors).length
      ? component.sourceAnchors
      : [sourceAnchorId],
    sourceTypes: asArray(component.sourceTypes).length
      ? component.sourceTypes
      : moduleDraft.inspiration?.sourceTypes,
    themes: asArray(component.themes).length
      ? component.themes
      : moduleDraft.inspiration?.themes,
    motifs: asArray(component.motifs).length
      ? component.motifs
      : moduleDraft.inspiration?.motifs,
    horror: asArray(component.horror).length
      ? component.horror
      : moduleDraft.inspiration?.horror,
    contexts: asArray(component.contexts).length
      ? component.contexts
      : moduleDraft.inspiration?.contexts,
    compatibility: cleanObject(component.compatibility),
    generation: updateGeneration(component),
    semantic,
    provenance: component.provenance,
  });
}

function getModuleCapabilities(draft, components) {
  const capabilities = new Set(asArray(draft.capabilities));
  capabilities.add("inspiration-archive");
  if (
    components.some(
      (component) => getStudioComponentFamily(component) === "monster-graft",
    )
  ) {
    capabilities.add("monster-composer");
  }
  if (
    components.some(
      (component) => getStudioComponentFamily(component) !== "monster-graft",
    )
  ) {
    capabilities.add("dark-places");
  }
  return [...capabilities];
}

export function buildModuleExport(draft) {
  const normalized = normalizeModuleForDraft(draft);
  const components = normalized.components.map((component) =>
    normalizeExportComponent(component, normalized),
  );

  return normalizeInspirationModuleV2({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    id: normalized.id,
    title: normalized.title,
    packId: normalized.packId,
    status: normalized.status,
    locale: normalized.locale,
    capabilities: getModuleCapabilities(normalized, components),
    sourceAnchor: normalized.sourceAnchor,
    inspiration: normalized.inspiration,
    components,
    metadata: normalized.metadata,
    provenance: normalized.provenance,
  });
}

function replacePackModule(pack, moduleExport) {
  const modules = asArray(pack.modules);
  const index = modules.findIndex((module) => module.id === moduleExport.id);
  if (index < 0) return [...modules, moduleExport];
  return modules.map((module, moduleIndex) =>
    moduleIndex === index ? moduleExport : module,
  );
}

export function buildContentPackExport(draft) {
  const normalized = normalizeModuleForDraft(draft);
  const moduleExport = buildModuleExport(normalized);
  const importedPack = normalized.__studio?.pack;
  const canPreserveImportedPack =
    importedPack?.schemaVersion === SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK &&
    importedPack.id === moduleExport.packId;

  if (canPreserveImportedPack) {
    return normalizeContentPackV0_2({
      ...importedPack,
      modules: replacePackModule(importedPack, moduleExport),
    });
  }

  return normalizeContentPackV0_2({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.CONTENT_PACK,
    id: moduleExport.packId || `${moduleExport.id}-content-pack`,
    title: `${moduleExport.title} Content Pack`,
    version: "0.2.0",
    status: moduleExport.status === "published" ? "published" : "draft",
    locale: moduleExport.locale,
    author: moduleExport.metadata.author,
    license: "internal-prototype",
    tags: [],
    modules: [moduleExport],
    metadata: {
      exportedFrom: "inspiration-studio-v2",
      sourceModuleId: moduleExport.id,
    },
  });
}

export function serializeStudioExport(payload) {
  return serializeCanonicalSemanticContent(payload);
}

function downloadTextFile(filename, text, type) {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadSemanticJsonFile(filename, payload) {
  downloadTextFile(
    filename,
    serializeStudioExport(payload),
    "application/json;charset=utf-8",
  );
}

export function downloadJsonFile(filename, payload) {
  downloadTextFile(
    filename,
    `${JSON.stringify(payload, null, 2)}\n`,
    "application/json;charset=utf-8",
  );
}
