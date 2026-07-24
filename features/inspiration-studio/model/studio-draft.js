import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeComponentV2,
  normalizeInspirationModuleV2,
  normalizeSemanticProvenance,
} from "../../../shared/content/content.index.js";
import { asArray, clone, slugify } from "./studio-component-normalizers.js";
import {
  buildStudioComponentFromTemplate,
  buildStudioComponentsFromTemplate,
} from "./studio-component-templates.js";
import { getStudioComponentFamily } from "./studio-editor-registry.js";
import { importStudioSemanticContent } from "./studio-v2-io.js";
import {
  createStudioSemanticDefault,
  getStudioSemanticEditorDefinition,
} from "../schema/studio-semantic-editor-registry.js";

export const STUDIO_DRAFT_SCHEMA_VERSION = "cruor-inspiration-studio-draft-v2";

const GENERIC_TEMPLATE_SEMANTIC_TYPES = Object.freeze({
  horrorPremise: "location-stake",
  visibleAnomaly: "visible-feature",
  hazard: "hazard",
  clue: "clue",
  encounterTwist: "encounter-twist",
  secret: "secret",
  reward: "reward",
  roomDesign: "room-design",
  locationRegion: "location-region",
});

function createAuthoredProvenance(sourceAnchorId) {
  return normalizeSemanticProvenance({
    sources: sourceAnchorId
      ? [
          {
            sourceAnchorId,
            relation: "direct",
            note: "Authored in Inspiration Studio v2.",
          },
        ]
      : [],
    legacyIds: [],
    migration: {
      method: "authored-v2",
      editorialDecision: "needs-revision",
      reviewVersion: "studio-v2-draft",
      note: "Human editorial review is required before publication.",
    },
  });
}

function createEmptyModule() {
  const sourceAnchorId = "new-inspiration";
  const provenance = createAuthoredProvenance(sourceAnchorId);
  return normalizeInspirationModuleV2({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    id: sourceAnchorId,
    title: "New Inspiration",
    packId: "new-content-pack",
    status: "draft",
    locale: "en",
    capabilities: ["inspiration-archive"],
    sourceAnchor: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SOURCE_ANCHOR,
      id: sourceAnchorId,
      title: "New Inspiration",
      kind: "other",
      status: "draft",
      citation: { label: "New Inspiration" },
      summary: "Editorial source summary required.",
      reliability: "uncertain",
      editorialNotes: [],
      tags: [],
    },
    inspiration: {
      schemaVersion: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION,
      id: `inspiration-${sourceAnchorId}`,
      slug: sourceAnchorId,
      title: "New Inspiration",
      status: "draft",
      sourceAnchors: [sourceAnchorId],
      sourceTypes: [],
      themes: [],
      motifs: [],
      horror: [],
      contexts: [],
      card: {
        domain: "",
        obscurity: "uncommon",
        collectionId: "new-content-pack",
        collectionLabel: "New Content Pack",
        number: null,
        description: "",
      },
      editorial: {
        deck: "New Inspiration",
        whatItIs: "",
        cruorLens: "",
        triggerWarnings: [],
        tableSafety: [],
        lowIntensityAlternative: "",
        sources: [],
        furtherReading: [],
        relatedDossiers: [],
        whyItDisturbs: "",
        creativeUses: [],
        cautions: [],
      },
      media: {
        imageTitle: "",
        imageKey: "",
        imageProvider: "",
        imageAlt: "",
        imageCredit: "",
        imageCreator: "",
        imageSourceTitle: "",
        imageSourceUrl: "",
        imageLicense: "",
        imageLicenseUrl: "",
        imageRightsStatus: "unverified",
        imageRightsVerifiedAt: "",
        imageModifications: "",
        icon: "",
      },
      tags: [],
      provenance,
    },
    components: [],
    metadata: {
      author: "Cruor Games",
      revision: 1,
      reviewedAt: "",
      sourceFile: "",
      capabilityWaivers: [],
    },
    provenance,
  });
}

function getEditorText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return String(value.text || "");
  return "";
}

export function hydrateStudioComponentDraft(component = {}) {
  const hydrated = clone(component);
  const details = component.semantic?.details || {};
  hydrated.label = component.title;
  hydrated.summary =
    component.semantic?.summary || component.semantic?.signature || "";
  hydrated.tableText = component.semantic?.tableText || "";
  hydrated.mechanics = getEditorText(component.semantic?.mechanics);
  hydrated.narrative = component.semantic?.narrative || "";

  if (component.semanticType === "monster-graft") {
    hydrated.monster = clone(
      details.monster || component.generation?.monster || {},
    );
    hydrated.counterplay =
      details.counterplay || hydrated.monster?.rules?.counterplay?.text || "";
  }
  if (getStudioComponentFamily(component) === "location-component") {
    hydrated.location = clone(details.location || {});
    if (component.generation?.mapInfluence) {
      hydrated.location.mapInfluence = clone(component.generation.mapInfluence);
    }
    if (component.generation?.roomDesign) {
      hydrated.location.roomDesign = clone(component.generation.roomDesign);
    }
  }
  if (getStudioComponentFamily(component) === "location-region") {
    hydrated.locationRegion = clone(details.locationRegion || {});
    if (component.generation?.mapInfluence) {
      hydrated.locationRegion.mapInfluence = clone(
        component.generation.mapInfluence,
      );
    }
    if (component.generation?.roomDesign) {
      hydrated.locationRegion.roomDesign = clone(
        component.generation.roomDesign,
      );
    }
  }

  return hydrated;
}

function finalizeDraft(module, context = {}) {
  const draft = clone(module);
  draft.components = asArray(module.components).map(
    hydrateStudioComponentDraft,
  );
  return refreshDerivedDraft(draft, {
    schemaVersion: STUDIO_DRAFT_SCHEMA_VERSION,
    sourceMode: context.mode || context.sourceMode || "v2",
    sourceSchema: context.sourceSchema || module.schemaVersion,
    targetSchema: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    diagnostics: clone(context.diagnostics || []),
    pack: context.pack ? clone(context.pack) : null,
  });
}

function refreshDerivedDraft(module, studioContext = module.__studio || {}) {
  const draft = clone(module);
  draft.monsterGrafts = draft.components.filter(
    (component) => getStudioComponentFamily(component) === "monster-graft",
  );
  draft.locationComponents = draft.components.filter(
    (component) => getStudioComponentFamily(component) === "location-component",
  );
  draft.locationRegions = draft.components.filter(
    (component) => getStudioComponentFamily(component) === "location-region",
  );
  draft.__studio = {
    schemaVersion: STUDIO_DRAFT_SCHEMA_VERSION,
    sourceMode: studioContext.mode || studioContext.sourceMode || "v2",
    sourceSchema: studioContext.sourceSchema || module.schemaVersion,
    targetSchema: SEMANTIC_SCHEMA_VERSIONS.INSPIRATION_MODULE,
    diagnostics: clone(studioContext.diagnostics || []),
    pack: studioContext.pack ? clone(studioContext.pack) : null,
  };
  return draft;
}

export const EMPTY_DRAFT = Object.freeze(finalizeDraft(createEmptyModule()));

export function getAutogeneratedIdentityIds(title) {
  const sourceAnchorId = slugify(title);
  return {
    moduleId: sourceAnchorId,
    sourceAnchorId,
    inspirationId: `inspiration-${sourceAnchorId}`,
  };
}

function updateProvenanceSourceAnchor(provenance, previousId, nextId) {
  if (!provenance?.sources) return;
  provenance.sources = provenance.sources.map((source) => ({
    ...source,
    sourceAnchorId:
      source.sourceAnchorId === previousId ? nextId : source.sourceAnchorId,
  }));
}

export function syncDraftIdentityIds(nextDraft, title = nextDraft.title) {
  const ids = getAutogeneratedIdentityIds(title);
  const previousSourceAnchorId = nextDraft.sourceAnchor?.id;
  nextDraft.id = ids.moduleId;
  nextDraft.sourceAnchor = nextDraft.sourceAnchor || {};
  nextDraft.sourceAnchor.id = ids.sourceAnchorId;
  nextDraft.inspiration = nextDraft.inspiration || {};
  nextDraft.inspiration.id = ids.inspirationId;
  nextDraft.inspiration.slug = ids.sourceAnchorId;
  nextDraft.inspiration.sourceAnchors = [ids.sourceAnchorId];
  updateProvenanceSourceAnchor(
    nextDraft.provenance,
    previousSourceAnchorId,
    ids.sourceAnchorId,
  );
  updateProvenanceSourceAnchor(
    nextDraft.inspiration.provenance,
    previousSourceAnchorId,
    ids.sourceAnchorId,
  );
  nextDraft.components = asArray(nextDraft.components).map((component) => {
    const nextComponent = {
      ...component,
      sourceAnchors:
        asArray(component.sourceAnchors).length && previousSourceAnchorId
          ? asArray(component.sourceAnchors).map((sourceAnchorId) =>
              sourceAnchorId === previousSourceAnchorId
                ? ids.sourceAnchorId
                : sourceAnchorId,
            )
          : [ids.sourceAnchorId],
    };
    updateProvenanceSourceAnchor(
      nextComponent.provenance,
      previousSourceAnchorId,
      ids.sourceAnchorId,
    );
    updateProvenanceSourceAnchor(
      nextComponent.semantic?.provenance,
      previousSourceAnchorId,
      ids.sourceAnchorId,
    );
    return nextComponent;
  });
}

export function getModuleComponentGroups(draft) {
  const components = asArray(draft.components);
  return {
    all: components,
    "monster-graft": components.filter(
      (component) => getStudioComponentFamily(component) === "monster-graft",
    ),
    "location-component": components.filter(
      (component) =>
        getStudioComponentFamily(component) === "location-component",
    ),
    "location-region": components.filter(
      (component) => getStudioComponentFamily(component) === "location-region",
    ),
  };
}

export function normalizeModuleForDraft(module, { importResult = null } = {}) {
  if (
    module?.__studio?.schemaVersion === STUDIO_DRAFT_SCHEMA_VERSION &&
    !importResult
  ) {
    return refreshDerivedDraft(module);
  }

  const result =
    importResult || importStudioSemanticContent(module || createEmptyModule());
  const canonical = importResult?.selectedModule || result.selectedModule;
  if (!canonical) return finalizeDraft(createEmptyModule(), result);
  return finalizeDraft(canonical, result);
}

function inferTemplateSemanticType(component = {}) {
  if (component.semanticType) return component.semanticType;
  if (component.contentType === "monster-graft") return "monster-graft";
  if (component.contentType === "location-region") return "location-region";
  const slot = asArray(component.slots)[0] || component.slot;
  return GENERIC_TEMPLATE_SEMANTIC_TYPES[slot] || "interaction";
}

function buildTemplateComponentDraft(component, draft) {
  const sourceAnchorId = draft.sourceAnchor?.id || draft.id;
  const semanticType = inferTemplateSemanticType(component);
  const provenance = createAuthoredProvenance(sourceAnchorId);
  const mechanics =
    typeof component.mechanics === "object"
      ? clone(component.mechanics)
      : component.mechanics
        ? { text: String(component.mechanics) }
        : {};
  const details = {};
  if (component.monster) details.monster = clone(component.monster);
  if (component.counterplay)
    details.counterplay = String(component.counterplay);
  if (component.location) details.location = clone(component.location);
  if (component.locationRegion) {
    details.locationRegion = clone(component.locationRegion);
  }
  const specializedDefinition = getStudioSemanticEditorDefinition(semanticType);
  const specializedSemantic = specializedDefinition
    ? {
        ...clone(createStudioSemanticDefault(semanticType, provenance)),
        ...clone(component.semantic || {}),
        provenance,
      }
    : null;
  if (
    specializedSemantic &&
    "id" in specializedSemantic &&
    !specializedSemantic.id
  ) {
    specializedSemantic.id = component.id;
  }
  if (
    specializedSemantic &&
    "title" in specializedSemantic &&
    !specializedSemantic.title
  ) {
    specializedSemantic.title = component.title || component.label;
  }

  const canonical = normalizeComponentV2({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.COMPONENT,
    id: component.id,
    title: component.title || component.label,
    status: component.status || "draft",
    contentType: component.contentType || "semantic-component",
    semanticType,
    workflows: component.workflows,
    slots: component.slots,
    sourceAnchors: asArray(component.sourceAnchors).length
      ? component.sourceAnchors
      : [sourceAnchorId],
    sourceTypes: asArray(component.sourceTypes).length
      ? component.sourceTypes
      : draft.inspiration?.sourceTypes,
    themes: asArray(component.themes).length
      ? component.themes
      : draft.inspiration?.themes,
    motifs: asArray(component.motifs).length
      ? component.motifs
      : draft.inspiration?.motifs,
    horror: asArray(component.horror).length
      ? component.horror
      : draft.inspiration?.horror,
    contexts: asArray(component.contexts).length
      ? component.contexts
      : draft.inspiration?.contexts,
    compatibility: component.compatibility || {},
    generation: {
      ...(component.generation || {}),
      ...(component.location?.mapInfluence
        ? { mapInfluence: clone(component.location.mapInfluence) }
        : {}),
      ...(component.location?.roomDesign
        ? { roomDesign: clone(component.location.roomDesign) }
        : {}),
      ...(component.locationRegion?.mapInfluence
        ? { mapInfluence: clone(component.locationRegion.mapInfluence) }
        : {}),
      ...(component.locationRegion?.roomDesign
        ? { roomDesign: clone(component.locationRegion.roomDesign) }
        : {}),
    },
    semantic: specializedDefinition
      ? specializedDefinition.normalizer(specializedSemantic)
      : {
          summary: component.summary || "",
          tableText: component.tableText || "",
          mechanics,
          narrative: component.narrative || "",
          details,
        },
    provenance,
  });
  return hydrateStudioComponentDraft(canonical);
}

export function buildComponentTemplate(templateId, draft) {
  const normalizedDraft = normalizeModuleForDraft(draft);
  const component = buildStudioComponentFromTemplate(
    templateId,
    normalizedDraft,
  );
  return buildTemplateComponentDraft(component, normalizedDraft);
}

export function buildComponentTemplates(templateId, draft) {
  const normalizedDraft = normalizeModuleForDraft(draft);
  return buildStudioComponentsFromTemplate(templateId, normalizedDraft).map(
    (component) => buildTemplateComponentDraft(component, normalizedDraft),
  );
}
