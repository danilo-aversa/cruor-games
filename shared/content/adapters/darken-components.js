import { COMPONENTS as LEGACY_DARKEN_COMPONENTS } from "../../../features/crucible/crucible.components-data.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "../source-anchors.js";

export const DARKEN_LOCATION_WORKFLOW_ID = "darken-location";
export const LEGACY_LOCATION_WORKFLOW_ID = "location";
export const LOCATION_COMPONENT_CONTENT_TYPE = "location-component";

export const DARKEN_LOCATION_SLOT_IDS = Object.freeze([
  "horrorPremise",
  "sensoryLayer",
  "visibleAnomaly",
  "hazard",
  "clue",
  "encounterTwist",
  "reward",
]);

const DARKEN_SLOT_ID_SET = new Set(DARKEN_LOCATION_SLOT_IDS);

const SOURCE_ANCHOR_BY_ID = new Map(
  SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]),
);
const KNOWN_SOURCE_ANCHOR_IDS = new Set(SHARED_SOURCE_ANCHORS.map((sourceAnchor) => sourceAnchor.id));
const ARCHIVED_PROTOTYPE_SOURCE_ANCHOR_IDS = new Set(["gashadokuro", "jack-the-ripper"]);

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function normalizeStringArray(value) {
  return asArray(value)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueArray(values) {
  return [...new Set(normalizeStringArray(values))];
}

function referencesKnownActiveSourceAnchor(sourceAnchors = []) {
  const sourceAnchorIds = normalizeSourceAnchorIds(sourceAnchors);
  if (!sourceAnchorIds.length) return true;

  return sourceAnchorIds.every(
    (sourceAnchorId) =>
      KNOWN_SOURCE_ANCHOR_IDS.has(sourceAnchorId) &&
      !ARCHIVED_PROTOTYPE_SOURCE_ANCHOR_IDS.has(sourceAnchorId),
  );
}

function getSourceAnchorMetadata(sourceAnchorIds = []) {
  const anchors = normalizeSourceAnchorIds(sourceAnchorIds)
    .map((sourceAnchorId) => SOURCE_ANCHOR_BY_ID.get(sourceAnchorId))
    .filter(Boolean);

  return {
    sourceTypes: uniqueArray(anchors.flatMap((sourceAnchor) => sourceAnchor.sourceTypes || sourceAnchor.type || [])),
    themes: uniqueArray(anchors.flatMap((sourceAnchor) => sourceAnchor.themes || [])),
    motifs: uniqueArray(anchors.flatMap((sourceAnchor) => sourceAnchor.motifs || [])),
    horror: uniqueArray(anchors.flatMap((sourceAnchor) => sourceAnchor.horror || [])),
  };
}

function normalizeLegacyWorkflowIds(workflows = []) {
  return uniqueArray(workflows).map((workflowId) =>
    workflowId === LEGACY_LOCATION_WORKFLOW_ID ? DARKEN_LOCATION_WORKFLOW_ID : workflowId,
  );
}

function normalizeDarkenSlots(slots = []) {
  return uniqueArray(slots).filter((slotId) => DARKEN_SLOT_ID_SET.has(slotId));
}

function getPrimaryLocationSlot(component) {
  return normalizeDarkenSlots(component?.slots)[0] || "";
}

function getLocationContentSubtype(component) {
  return slugify(component?.type || getPrimaryLocationSlot(component) || LOCATION_COMPONENT_CONTENT_TYPE);
}

function buildLocationComponentTags(component, sourceAnchors = []) {
  return uniqueArray([
    ...(component.tags || []),
    component.type ? `type:${slugify(component.type)}` : null,
    component.intrusion ? `intrusion:${slugify(component.intrusion)}` : null,
    component.prep ? `prep:${slugify(component.prep)}` : null,
    component.sensoryKind ? `sensory:${slugify(component.sensoryKind)}` : null,
    ...normalizeDarkenSlots(component.slots).map((slotId) => `slot:${slotId}`),
    ...sourceAnchors.map((sourceAnchorId) => `source:${sourceAnchorId}`),
  ]);
}

export function legacyDarkenComponentToSharedComponent(component) {
  if (!component?.id) return null;
  const workflows = normalizeLegacyWorkflowIds(component.workflows);
  if (!workflows.includes(DARKEN_LOCATION_WORKFLOW_ID)) return null;

  const slots = normalizeDarkenSlots(component.slots);
  if (!slots.length) return null;

  const sourceAnchors = normalizeSourceAnchorIds(component.sourceAnchors);
  const sourceMetadata = getSourceAnchorMetadata(sourceAnchors);
  const contentSubtype = getLocationContentSubtype(component);

  return {
    id: component.id,
    legacyId: component.id,
    title: component.title || component.id,
    label: component.title || component.id,
    type: component.type || "Location Component",
    contentType: LOCATION_COMPONENT_CONTENT_TYPE,
    status: component.status || "published",
    workflows: [DARKEN_LOCATION_WORKFLOW_ID],
    slots,
    sensoryKind: component.sensoryKind || "",
    contexts: normalizeStringArray(component.contexts),
    horror: uniqueArray([...(component.horror || []), ...sourceMetadata.horror]),
    intrusion: component.intrusion || "",
    prep: component.prep || "",
    sourceAnchors,
    sourceTypes: normalizeStringArray(component.sourceTypes).length
      ? normalizeStringArray(component.sourceTypes)
      : sourceMetadata.sourceTypes,
    themes: normalizeStringArray(component.themes).length
      ? normalizeStringArray(component.themes)
      : sourceMetadata.themes,
    motifs: uniqueArray([...(component.motifs || []), ...sourceMetadata.motifs]),
    summary: component.summary || "",
    tableText: component.tableText || "",
    mechanics: component.mechanics || "",
    narrative: component.narrative || "",
    location: {
      componentType: contentSubtype,
      legacyType: component.type || "",
      sensoryKind: component.sensoryKind || "",
      intrusion: component.intrusion || "",
      prep: component.prep || "",
      outputSection: slots[0] || "",
      gmFacingOnly: false,
    },
    tags: buildLocationComponentTags(component, sourceAnchors),
  };
}

export function buildSharedDarkenLocationComponents(components = LEGACY_DARKEN_COMPONENTS) {
  return components
    .filter((component) => referencesKnownActiveSourceAnchor(component.sourceAnchors))
    .map(legacyDarkenComponentToSharedComponent)
    .filter(Boolean);
}

export const SHARED_DARKEN_LOCATION_COMPONENTS = buildSharedDarkenLocationComponents();
