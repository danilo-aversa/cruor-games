import {
  CONTENT_PACK_SCHEMA_VERSION,
  createContentPack,
} from "../../../shared/content/content-pack-schema.js";
import { SHARED_SOURCE_ANCHORS } from "../../../shared/content/source-anchors.js";
import {
  SHARED_DARKEN_LOCATION_SLOTS,
  SHARED_MONSTER_SLOTS,
  SHARED_WORKFLOWS,
} from "../../../shared/content/workflows.js";
import {
  asArray,
  formatPlainLabel,
  hasText,
  normalizeStatus,
  slugify,
  uniqueById,
  normalizeMonsterConstraintData,
  normalizeMonsterGrantData,
} from "./studio-component-normalizers.js";
import { normalizeModuleForDraft } from "./studio-draft.js";

const SHARED_SOURCE_ANCHOR_BY_ID = new Map(SHARED_SOURCE_ANCHORS.map((sourceAnchor) => [sourceAnchor.id, sourceAnchor]));


function normalizeRoomDesignExport(roomDesign = {}) {
  if (!roomDesign || typeof roomDesign !== "object" || Array.isArray(roomDesign)) return null;
  const shapeSource = typeof roomDesign.shape === "object" && roomDesign.shape !== null
    ? roomDesign.shape
    : { kind: roomDesign.shape || roomDesign.shapeKind || roomDesign.kind };
  const shapeKind = String(shapeSource.kind || shapeSource.type || "").trim();
  const shapeModifiers = asArray(shapeSource.modifiers || roomDesign.shapeModifiers || roomDesign.modifiers)
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const shape = {
    ...(shapeKind ? { kind: shapeKind } : {}),
    ...(shapeSource.variant ? { variant: shapeSource.variant } : {}),
    ...(shapeModifiers.length ? { modifiers: shapeModifiers } : {}),
  };

  const sizeSource = typeof roomDesign.size === "object" && roomDesign.size !== null
    ? roomDesign.size
    : { scale: roomDesign.size };
  const numericSizeFields = [
    "minWidthCells",
    "minHeightCells",
    "maxWidthCells",
    "maxHeightCells",
    "minAreaCells",
    "maxAreaCells",
    "minDiameterCells",
  ];
  const size = {
    ...(sizeSource.scale ? { scale: sizeSource.scale } : {}),
    ...(sizeSource.aspectRatio ? { aspectRatio: sizeSource.aspectRatio } : {}),
  };
  numericSizeFields.forEach((field) => {
    const parsed = Number(sizeSource[field]);
    if (Number.isFinite(parsed) && parsed > 0) size[field] = Math.round(parsed);
  });

  const normalizeProp = (prop) => {
    if (!prop || (typeof prop !== "object" && typeof prop !== "string")) return null;
    const source = typeof prop === "object" ? prop : { kind: prop };
    const kind = String(source.kind || source.type || "").trim();
    if (!kind) return null;
    const normalized = {
      kind,
      ...(source.placement ? { placement: source.placement } : {}),
    };
    ["minRadiusCells", "sizeScale", "rotation"].forEach((field) => {
      const parsed = Number(source[field]);
      if (Number.isFinite(parsed)) normalized[field] = parsed;
    });
    return normalized;
  };
  const required = asArray(roomDesign.props?.required || roomDesign.requiredProps).map(normalizeProp).filter(Boolean);
  const optional = asArray(roomDesign.props?.optional || roomDesign.optionalProps).map(normalizeProp).filter(Boolean);
  const props = {
    ...(required.length ? { required } : {}),
    ...(optional.length ? { optional } : {}),
  };

  const topologySource = roomDesign.topology || {};
  const topology = {
    ...(topologySource.branchBias ? { branchBias: topologySource.branchBias } : {}),
    ...(topologySource.depthBias ? { depthBias: topologySource.depthBias } : {}),
    ...(typeof topologySource.secret === "boolean" ? { secret: topologySource.secret } : {}),
  };

  const normalized = {
    ...(roomDesign.presetId ? { presetId: roomDesign.presetId } : {}),
    ...(Object.keys(shape).length ? { shape } : {}),
    ...(Object.keys(size).length ? { size } : {}),
    ...(Object.keys(props).length ? { props } : {}),
    ...(Object.keys(topology).length ? { topology } : {}),
    ...(roomDesign.maskProfile ? { maskProfile: roomDesign.maskProfile } : {}),
    ...(roomDesign.detailProfile ? { detailProfile: roomDesign.detailProfile } : {}),
  };
  return Object.keys(normalized).length ? normalized : null;
}

function normalizeMapInfluenceExport(mapInfluence = {}) {
  if (!mapInfluence || typeof mapInfluence !== "object" || Array.isArray(mapInfluence)) return null;
  const preferredRoomArchetypes = asArray([
    mapInfluence.preferredRoomArchetype,
    mapInfluence.preferredRoomArchetypeId,
    ...asArray(mapInfluence.preferredRoomArchetypes),
    ...asArray(mapInfluence.preferredRoomArchetypeIds),
  ]).map((value) => String(value || "").trim()).filter(Boolean);
  const forbiddenRoomArchetypes = asArray([
    mapInfluence.forbiddenRoomArchetype,
    mapInfluence.forbiddenRoomArchetypeId,
    ...asArray(mapInfluence.forbiddenRoomArchetypes),
    ...asArray(mapInfluence.forbiddenRoomArchetypeIds),
  ]).map((value) => String(value || "").trim()).filter(Boolean);
  const roomArchetype = String(
    mapInfluence.roomArchetype ||
      mapInfluence.roomArchetypeId ||
      mapInfluence.forcedRoomArchetype ||
      mapInfluence.forcedRoomArchetypeId ||
      "",
  ).trim();
  const forceRoomArchetype = Boolean(
    roomArchetype &&
      (mapInfluence.forceRoomArchetype || mapInfluence.force || mapInfluence.required || mapInfluence.forcedRoomArchetype || mapInfluence.forcedRoomArchetypeId),
  );
  const hasInfluence = Boolean(roomArchetype || preferredRoomArchetypes.length || forbiddenRoomArchetypes.length);
  if (!hasInfluence) return null;

  const weight = Number(mapInfluence.weight);
  return {
    ...(roomArchetype ? { roomArchetype } : {}),
    ...(preferredRoomArchetypes.length ? { preferredRoomArchetypes } : {}),
    ...(forbiddenRoomArchetypes.length ? { forbiddenRoomArchetypes } : {}),
    ...(forceRoomArchetype ? { forceRoomArchetype } : {}),
    ...(Number.isFinite(weight) && weight > 0 ? { weight } : {}),
    ...(hasText(mapInfluence.source) ? { source: mapInfluence.source } : {}),
    ...(hasText(mapInfluence.note) ? { note: mapInfluence.note } : {}),
  };
}

function getReferencedSourceAnchorIds(sourceAnchor, inspiration, components = []) {
  return [
    sourceAnchor?.id,
    ...asArray(inspiration?.sourceAnchors),
    ...asArray(components).flatMap((component) => asArray(component.sourceAnchors)),
  ].filter(Boolean);
}

export function buildExportSourceAnchors(sourceAnchor, inspiration, components = []) {
  return uniqueById(getReferencedSourceAnchorIds(sourceAnchor, inspiration, components).map((sourceAnchorId) => {
    if (sourceAnchorId === sourceAnchor?.id) return sourceAnchor;
    return SHARED_SOURCE_ANCHOR_BY_ID.get(sourceAnchorId) || {
      id: sourceAnchorId,
      label: formatPlainLabel(sourceAnchorId),
      type: "Referenced Source Anchor",
      status: "draft",
      workflows: [],
      sourceTypes: [],
      themes: [],
      motifs: [],
      horror: [],
      summary: "Auto-included because a component in this exported pack references this source anchor.",
      metadata: { generatedFrom: "inspiration-studio-export-reference" },
    };
  }));
}

export function buildModuleExport(draft, imagePreviewUrl) {
  const normalized = normalizeModuleForDraft(draft);
  return {
    id: normalized.id,
    title: normalized.title,
    status: normalized.status,
    packId: normalized.packId,
    sourceAnchor: normalized.sourceAnchor,
    inspiration: {
      ...normalized.inspiration,
      media: {
        ...(normalized.inspiration.media || {}),
        previewOnlyImageDataUrl: imagePreviewUrl || undefined,
      },
    },
    components: normalized.components,
    metadata: {
      ...normalized.metadata,
      exportedFrom: "inspiration-studio-mvp",
    },
  };
}

export function normalizeExportComponent(component = {}, sourceAnchor = {}) {
  const sourceAnchorId = sourceAnchor.id || asArray(component.sourceAnchors)[0] || "source-anchor";
  const workflows = asArray(component.workflows);
  const slots = asArray(component.slots);

  const normalizedComponent = {
    ...component,
    id: component.id || slugify(component.title || component.label || "component"),
    title: component.title || component.label || component.id || "Untitled Component",
    label: component.label || component.title || component.id || "Untitled Component",
    status: normalizeStatus(component.status),
    sourceAnchors: asArray(component.sourceAnchors).length ? asArray(component.sourceAnchors) : [sourceAnchorId],
    sourceTypes: asArray(component.sourceTypes).length ? asArray(component.sourceTypes) : asArray(sourceAnchor.sourceTypes),
    themes: asArray(component.themes).length ? asArray(component.themes) : asArray(sourceAnchor.themes),
    motifs: asArray(component.motifs).length ? asArray(component.motifs) : asArray(sourceAnchor.motifs),
    horror: asArray(component.horror).length ? asArray(component.horror) : asArray(sourceAnchor.horror),
    workflows: workflows.length
      ? workflows
      : component.contentType === "monster-graft"
        ? ["monster-composer"]
        : ["darken-location"],
    slots: slots.length
      ? slots
      : component.contentType === "monster-graft"
        ? [component.monster?.slot || "body"]
        : component.contentType === "location-region"
          ? ["locationRegion"]
          : ["visibleAnomaly"],
  };

  if (normalizedComponent.contentType === "location-component") {
    const roomDesign = normalizeRoomDesignExport(normalizedComponent.location?.roomDesign || normalizedComponent.map?.roomDesign || normalizedComponent.roomDesign);
    if (roomDesign) {
      normalizedComponent.location = {
        ...(normalizedComponent.location || {}),
        roomDesign,
      };
    } else if (normalizedComponent.location?.roomDesign) {
      normalizedComponent.location = { ...(normalizedComponent.location || {}) };
      delete normalizedComponent.location.roomDesign;
    }
    if (normalizedComponent.roomDesign) delete normalizedComponent.roomDesign;
    const mapInfluence = normalizeMapInfluenceExport(
      normalizedComponent.location?.mapInfluence || normalizedComponent.mapInfluence,
    );
    if (mapInfluence) {
      normalizedComponent.location = {
        ...(normalizedComponent.location || {}),
        mapInfluence,
      };
    } else if (normalizedComponent.location?.mapInfluence) {
      normalizedComponent.location = { ...(normalizedComponent.location || {}) };
      delete normalizedComponent.location.mapInfluence;
      if (!Object.keys(normalizedComponent.location).length) delete normalizedComponent.location;
    }
    if (normalizedComponent.mapInfluence) delete normalizedComponent.mapInfluence;
  }

  if (normalizedComponent.contentType === "location-region") {
    const roomDesign = normalizeRoomDesignExport(normalizedComponent.locationRegion?.roomDesign || normalizedComponent.map?.roomDesign || normalizedComponent.roomDesign);
    if (roomDesign) {
      normalizedComponent.locationRegion = {
        ...(normalizedComponent.locationRegion || {}),
        roomDesign,
      };
    } else if (normalizedComponent.locationRegion?.roomDesign) {
      normalizedComponent.locationRegion = { ...(normalizedComponent.locationRegion || {}) };
      delete normalizedComponent.locationRegion.roomDesign;
    }
    if (normalizedComponent.roomDesign) delete normalizedComponent.roomDesign;
    if (normalizedComponent.locationRegion?.mapInfluence) {
      const mapInfluence = normalizeMapInfluenceExport(normalizedComponent.locationRegion.mapInfluence);
      if (mapInfluence) normalizedComponent.locationRegion.mapInfluence = mapInfluence;
      else delete normalizedComponent.locationRegion.mapInfluence;
    }
  }

  if (normalizedComponent.contentType === "monster-graft") {
    const constraints = normalizeMonsterConstraintData(component);
    const anatomyGrants = normalizeMonsterGrantData(component);
    normalizedComponent.monster = {
      ...(normalizedComponent.monster || {}),
      constraints: constraints || undefined,
      anatomyGrants: anatomyGrants || undefined,
    };
    if (!constraints && normalizedComponent.monster?.constraints === undefined) {
      delete normalizedComponent.monster.constraints;
    }
    if (!anatomyGrants && normalizedComponent.monster?.anatomyGrants === undefined) {
      delete normalizedComponent.monster.anatomyGrants;
    }
  }

  if (normalizedComponent.contentType === "location-region" && !normalizedComponent.locationRegion && normalizedComponent.map) {
    normalizedComponent.locationRegion = {
      role: normalizedComponent.map.role || "side",
      size: normalizedComponent.map.size || "Medium",
      shape: normalizedComponent.map.shape || normalizedComponent.map.preferredShape || "standard",
      roomArchetype:
        normalizedComponent.map.roomArchetype ||
        normalizedComponent.map.roomArchetypeId ||
        normalizedComponent.map.archetype ||
        "",
      mapInfluence: normalizeMapInfluenceExport(normalizedComponent.map.mapInfluence || normalizedComponent.map.influence) || undefined,
      roomDesign: normalizeRoomDesignExport(normalizedComponent.map.roomDesign) || undefined,
      connectors: normalizedComponent.map.connectors ?? 1,
      density: normalizedComponent.map.density || "interactive",
      readAloud: normalizedComponent.map.readAloud || { compact: normalizedComponent.tableText || "", extended: normalizedComponent.tableText || "" },
    };
  }

  return normalizedComponent;
}

function getReferencedWorkflowIds(moduleExport, components) {
  return [
    ...asArray(moduleExport.sourceAnchor?.workflows),
    ...asArray(moduleExport.inspiration?.workflows),
    ...components.flatMap((component) => asArray(component.workflows)),
  ].filter(Boolean);
}

function getReferencedSlotIds(components) {
  return components.flatMap((component) => asArray(component.slots)).filter(Boolean);
}

export function buildContentPackExport(draft, imagePreviewUrl) {
  const moduleExport = buildModuleExport(draft, imagePreviewUrl);
  const sourceAnchorId = moduleExport.sourceAnchor?.id || moduleExport.id;
  const sourceAnchor = {
    ...moduleExport.sourceAnchor,
    id: sourceAnchorId,
    label: moduleExport.sourceAnchor?.label || moduleExport.title,
    status: normalizeStatus(moduleExport.sourceAnchor?.status || moduleExport.status),
  };
  const inspiration = {
    ...moduleExport.inspiration,
    id: moduleExport.inspiration?.id || `inspiration-${sourceAnchorId}`,
    title: moduleExport.inspiration?.title || moduleExport.title,
    label: moduleExport.inspiration?.label || moduleExport.inspiration?.title || moduleExport.title,
    status: normalizeStatus(moduleExport.inspiration?.status || moduleExport.status),
    contentType: moduleExport.inspiration?.contentType || "source-inspiration-card",
    sourceAnchors: asArray(moduleExport.inspiration?.sourceAnchors).length
      ? asArray(moduleExport.inspiration.sourceAnchors)
      : [sourceAnchorId],
    workflows: asArray(moduleExport.inspiration?.workflows).length
      ? asArray(moduleExport.inspiration.workflows)
      : ["inspiration-archive"],
  };
  const components = moduleExport.components.map((component) => normalizeExportComponent(component, sourceAnchor));
  const sourceAnchors = buildExportSourceAnchors(sourceAnchor, inspiration, components);
  const workflowIds = new Set(getReferencedWorkflowIds({ sourceAnchor, inspiration }, components));
  const slotIds = new Set(getReferencedSlotIds(components));
  const workflows = SHARED_WORKFLOWS.filter((workflow) => workflowIds.has(workflow.id));
  const slots = [
    ...SHARED_MONSTER_SLOTS.filter((slot) => slotIds.has(slot.id)),
    ...SHARED_DARKEN_LOCATION_SLOTS.filter((slot) => slotIds.has(slot.id)),
  ];

  return createContentPack({
    schemaVersion: CONTENT_PACK_SCHEMA_VERSION,
    id: moduleExport.packId || `${sourceAnchorId}-content-pack`,
    title: `${moduleExport.title} Content Pack`,
    summary: `Registry-ready content pack generated from the ${moduleExport.title} Inspiration Module.`,
    version: moduleExport.metadata?.version || "0.1.0",
    status: normalizeStatus(moduleExport.status),
    locale: moduleExport.metadata?.locale || "en",
    author: moduleExport.metadata?.author || "Cruor Games",
    license: moduleExport.metadata?.license || "internal-prototype",
    tags: uniqueById(asArray(moduleExport.metadata?.tags).map((tag) => ({ id: tag }))).map((tag) => tag.id),
    metadata: {
      ...moduleExport.metadata,
      exportedFrom: "inspiration-studio-content-pack-export",
      sourceModuleId: moduleExport.id,
      sourceAnchorId,
    },
    collections: {
      workflows,
      slots,
      sourceAnchors,
      inspirations: [inspiration],
      components,
      taxonomies: [],
    },
  });
}

export function downloadJsonFile(filename, payload) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
