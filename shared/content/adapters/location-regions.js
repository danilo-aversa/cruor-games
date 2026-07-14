import { LOCATION_REGION_TEMPLATES as LEGACY_LOCATION_REGION_TEMPLATES } from "../../../features/crucible/crucible.location-regions.js";
import { createLegacyContentMigration, resolveLegacyFieldCandidates } from "../legacy-content-migration.js";
import { normalizeSourceAnchorIds, SHARED_SOURCE_ANCHORS } from "../source-anchors.js";

export const LOCATION_REGION_CONTENT_TYPE = "location-region";
export const LOCATION_REGION_SLOT_ID = "locationRegion";
export const MAP_GENERATOR_WORKFLOW_ID = "map-generator";
export const DARKEN_LOCATION_WORKFLOW_ID = "darken-location";

const ARCHIVED_PROTOTYPE_SOURCE_ANCHOR_IDS = new Set(["gashadokuro", "jack-the-ripper"]);

const SOURCE_ANCHOR_BY_ID = new Map(
  SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]),
);

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

function referencesArchivedPrototypeSource(sourceAnchors = []) {
  return normalizeSourceAnchorIds(sourceAnchors).some((sourceAnchorId) =>
    ARCHIVED_PROTOTYPE_SOURCE_ANCHOR_IDS.has(sourceAnchorId),
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

function normalizeReadAloud(readAloud) {
  if (!readAloud) return { compact: "", extended: "" };
  if (typeof readAloud === "string") return { compact: readAloud, extended: readAloud };
  return {
    compact: readAloud.compact || "",
    extended: readAloud.extended || readAloud.compact || "",
  };
}

function buildRegionTags(region, sourceAnchors = []) {
  return uniqueArray([
    ...(region.tags || []),
    region.role ? `role:${slugify(region.role)}` : null,
    region.shape ? `shape:${slugify(region.shape)}` : null,
    region.size ? `size:${slugify(region.size)}` : null,
    region.density ? `density:${slugify(region.density)}` : null,
    ...normalizeStringArray(region.contexts).map((context) => `context:${slugify(context)}`),
    ...sourceAnchors.map((sourceAnchorId) => `source:${sourceAnchorId}`),
  ]);
}

export function legacyLocationRegionToSharedComponent(region) {
  if (!region?.templateId && !region?.id) return null;

  const id = region.templateId || region.id;
  const sourceAnchors = normalizeSourceAnchorIds(region.sourceAnchors);
  const sourceMetadata = getSourceAnchorMetadata(sourceAnchors);
  const readAloud = normalizeReadAloud(region.readAloud);
  const summary = region.feature || readAloud.compact || region.role || "";
  const roomArchetypeResolution = resolveLegacyFieldCandidates([
    { path: "roomArchetype", value: region.roomArchetype },
    { path: "roomArchetypeId", value: region.roomArchetypeId },
  ]);
  const mapInfluenceResolution = resolveLegacyFieldCandidates(
    [
      { path: "mapInfluence", value: region.mapInfluence },
      { path: "influence", value: region.influence },
    ],
    { objectOnly: true },
  );
  const interactionResolution = resolveLegacyFieldCandidates([
    { path: "interaction", value: region.interaction },
    { path: "interact", value: region.interact },
  ]);
  const migration = createLegacyContentMigration({
    sourceSchema: "crucible-location-region-v0",
    targetSchema: "location-region-v1",
    fieldResolutions: {
      roomArchetype: roomArchetypeResolution,
      mapInfluence: mapInfluenceResolution,
      interaction: interactionResolution,
    },
  });
  const roomArchetype = roomArchetypeResolution.value || "";
  const mapInfluence = mapInfluenceResolution.value;
  const interaction = interactionResolution.value || "";

  return {
    id: `location-region-${id}`,
    legacyId: id,
    title: region.name || region.label || id,
    label: region.name || region.label || id,
    type: "Location Region",
    contentType: LOCATION_REGION_CONTENT_TYPE,
    status: region.status || "published",
    workflows: [DARKEN_LOCATION_WORKFLOW_ID, MAP_GENERATOR_WORKFLOW_ID],
    slots: [LOCATION_REGION_SLOT_ID],
    sourceAnchors,
    sourceTypes: sourceMetadata.sourceTypes,
    themes: sourceMetadata.themes,
    motifs: sourceMetadata.motifs,
    contexts: normalizeStringArray(region.contexts),
    horror: uniqueArray([...(region.horror || []), ...sourceMetadata.horror]),
    summary,
    tableText: readAloud.compact,
    mechanics: region.danger || "",
    narrative: interaction || region.secret || "",
    migration,
    locationRegion: {
      role: region.role || "Location Region",
      size: region.size || "Medium",
      shape: region.shape || "room",
      roomArchetype,
      mapInfluence,
      connectors: Number(region.connectors || 1),
      density: region.density || "interactive",
      readAloud,
    },
    map: {
      templateId: id,
      role: region.role || "Location Region",
      shape: region.shape || "room",
      preferredShape: region.preferredShape || region.shape || "room",
      roomArchetype,
      mapInfluence,
      size: region.size || "Medium",
      connectors: Number(region.connectors || 1),
      density: region.density || "interactive",
      contexts: normalizeStringArray(region.contexts),
      horror: normalizeStringArray(region.horror),
      sourceAnchors,
      readAloud,
      feature: region.feature || "",
      interaction,
      danger: region.danger || "",
      secret: region.secret || "",
      reward: region.reward || "",
      links: normalizeStringArray(region.links),
      surfaceKind: region.surfaceKind || "",
      tags: buildRegionTags(region, sourceAnchors),
    },
    tags: buildRegionTags(region, sourceAnchors),
  };
}

export function sharedLocationRegionToLegacyTemplate(component) {
  const map = component?.map || {};
  const templateId = map.templateId || component?.legacyId || component?.id?.replace(/^location-region-/, "") || component?.id;

  return {
    templateId,
    id: templateId,
    name: component?.title || component?.label || map.name || templateId,
    role: map.role || component?.type || "Location Region",
    shape: map.shape || map.preferredShape || "room",
    preferredShape: map.preferredShape || map.shape || "room",
    roomArchetype: map.roomArchetype || map.roomArchetypeId || component?.locationRegion?.roomArchetype || "",
    mapInfluence: map.mapInfluence || component?.locationRegion?.mapInfluence || undefined,
    size: map.size || "Medium",
    connectors: Number(map.connectors || 1),
    density: map.density || "interactive",
    contexts: normalizeStringArray(map.contexts || component?.contexts),
    horror: normalizeStringArray(map.horror || component?.horror),
    sourceAnchors: normalizeStringArray(map.sourceAnchors || component?.sourceAnchors),
    readAloud: normalizeReadAloud(map.readAloud || component?.tableText),
    feature: map.feature || component?.summary || "",
    interaction: map.interaction || "",
    interact: map.interaction || "",
    danger: map.danger || component?.mechanics || "",
    secret: map.secret || "",
    reward: map.reward || "",
    links: normalizeStringArray(map.links),
    surfaceKind: map.surfaceKind || "",
    tags: normalizeStringArray(map.tags || component?.tags),
    registry: {
      componentId: component?.id || "",
      contentType: component?.contentType || LOCATION_REGION_CONTENT_TYPE,
    },
  };
}

export function buildSharedLocationRegionComponents(regions = LEGACY_LOCATION_REGION_TEMPLATES) {
  return regions
    .filter((region) => !referencesArchivedPrototypeSource(region.sourceAnchors))
    .map(legacyLocationRegionToSharedComponent)
    .filter(Boolean);
}

export function buildLegacyLocationRegionTemplatesFromComponents(components = []) {
  return asArray(components)
    .filter((component) => component?.contentType === LOCATION_REGION_CONTENT_TYPE)
    .map(sharedLocationRegionToLegacyTemplate);
}

export const SHARED_LOCATION_REGION_COMPONENTS = buildSharedLocationRegionComponents();
