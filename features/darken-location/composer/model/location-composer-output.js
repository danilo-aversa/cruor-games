import { getAssignedComponentsForRegion } from "./location-composer-selectors.js";
import {
  createLocationOutputProjection,
  resolveCanonicalLocationOutputDocument,
  serializeLocationDocumentV2Markdown,
  serializeLocationDocumentV2SessionInsert,
  serializeLocationDocumentV2TableText,
} from "../../output/model/location-document-output-v2.js";

export function getMapSyncStatus(mapRequest, generatedMapPreview, regions = []) {
  const requested = mapRequest.requiredRegions?.length || regions.length || 0;
  const generated = generatedMapPreview?.regions?.length || 0;
  const corridors = generatedMapPreview?.corridors?.length || 0;
  const synced = generatedMapPreview ? Math.min(requested, generated) : 0;

  if (!generatedMapPreview) {
    return {
      mode: "fallback",
      label: "Fallback Preview",
      requested,
      generated,
      synced,
      corridors,
      description: requested
        ? `${requested} requested rooms waiting for generated geometry`
        : "No generated map geometry available yet",
    };
  }

  const complete = requested > 0 && synced >= requested;
  return {
    mode: complete ? "synced" : "partial",
    label: complete ? "Generated Map Synced" : "Partial Map Sync",
    requested,
    generated,
    synced,
    corridors,
    description: `${synced}/${requested || generated} requested rooms synced · ${generated} generated rooms · ${corridors} corridors`,
  };
}

export const REGION_PREVIEW_MARKER_DEFINITIONS = Object.freeze([
  Object.freeze({ slotId: "sensoryLayer", label: "SENS", fullLabel: "Sensory Layer", icon: "fa-eye" }),
  Object.freeze({ slotId: "hazard", label: "HAZ", fullLabel: "Hazard", icon: "fa-triangle-exclamation" }),
  Object.freeze({ slotId: "clue", label: "CLUE", fullLabel: "Clue", icon: "fa-magnifying-glass" }),
  Object.freeze({ slotId: "reward", label: "REW", fullLabel: "Reward", icon: "fa-gem" }),
  Object.freeze({ slotId: "encounterTwist", label: "TWIST", fullLabel: "Encounter Twist", icon: "fa-shuffle" }),
]);

export function getRegionPreviewMarkers(state, regionId) {
  if (!regionId) return [];
  const assigned = getAssignedComponentsForRegion(state, regionId);

  return REGION_PREVIEW_MARKER_DEFINITIONS.map((definition) => {
    const components = assigned.filter(
      (component) => component.assignment?.slotId === definition.slotId,
    );
    if (!components.length) return null;

    return {
      ...definition,
      count: components.length,
      components,
      title: components[0]?.title || components[0]?.name || definition.fullLabel,
    };
  }).filter(Boolean);
}

export function getMapPreviewQuality(
  state,
  mapRequest,
  generatedMapPreview,
  regions = [],
) {
  const syncStatus = getMapSyncStatus(
    mapRequest,
    generatedMapPreview,
    regions,
  );
  const safeRegions = Array.isArray(regions) ? regions : [];
  const markerCounts = Object.fromEntries(
    REGION_PREVIEW_MARKER_DEFINITIONS.map((definition) => [
      definition.slotId,
      0,
    ]),
  );
  let filledRegions = 0;
  let secretRegions = 0;

  const regionRows = safeRegions.map((region, index) => {
    const markers = getRegionPreviewMarkers(state, region.id);
    const markerSlotIds = new Set(markers.map((marker) => marker.slotId));
    REGION_PREVIEW_MARKER_DEFINITIONS.forEach((definition) => {
      if (markerSlotIds.has(definition.slotId)) {
        markerCounts[definition.slotId] += 1;
      }
    });
    if (markers.length) filledRegions += 1;
    if (region.secret) secretRegions += 1;

    return {
      id: region.id,
      index,
      name: region.name || `Region ${index + 1}`,
      markers,
      filled: markers.length > 0,
    };
  });

  const emptyRegions = Math.max(0, safeRegions.length - filledRegions);
  const syncValue = `${syncStatus.synced}/${syncStatus.requested || safeRegions.length || syncStatus.generated || 0}`;
  const statusLabel = !generatedMapPreview
    ? "Preview unavailable"
    : syncStatus.mode === "synced"
      ? "Ready"
      : "Partial";

  return {
    statusLabel,
    syncStatus,
    regionRows,
    markerCounts,
    filledRegions,
    emptyRegions,
    secretRegions,
    rows: [
      { key: "sync", label: "Synced", value: syncValue },
      { key: "corridors", label: "Corridors", value: String(syncStatus.corridors || 0) },
      { key: "hazards", label: "Hazards", value: String(markerCounts.hazard || 0) },
      { key: "clues", label: "Clues", value: String(markerCounts.clue || 0) },
      { key: "twists", label: "Twists", value: String(markerCounts.encounterTwist || 0) },
      { key: "empty", label: "Empty", value: String(emptyRegions) },
    ],
    note: emptyRegions > 0
      ? `${emptyRegions} room${emptyRegions === 1 ? "" : "s"} still need regional content.`
      : "Every room has at least one regional hook.",
  };
}

export function createJsonExportPayload({
  locationDocument,
  generatedMapPreview = null,
  exportedAt = new Date().toISOString(),
} = {}) {
  const document = resolveCanonicalLocationOutputDocument(locationDocument);
  const projection = createLocationOutputProjection(document);

  return {
    schemaVersion: "cruor-dark-places-export-v2",
    exportedAt,
    documentSchemaVersion: document.schemaVersion,
    documentId: document.id,
    title: projection.title,
    contextLine: projection.contextLine,
    readiness: projection.readiness,
    document,
    generatedMap: generatedMapPreview
      ? {
          seed: generatedMapPreview.seed,
          regionCount: generatedMapPreview.regions?.length || 0,
          corridorCount: generatedMapPreview.corridors?.length || 0,
          bounds: generatedMapPreview.bounds,
          contentBounds: generatedMapPreview.contentBounds,
        }
      : null,
  };
}

export function createLocationExportFilename(value) {
  return (
    String(value || "cruor-location")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cruor-location"
  );
}

function createExportFormat({
  id,
  label,
  filename,
  mimeType,
  text,
  available = true,
  dynamic = false,
}) {
  return Object.freeze({
    id,
    label,
    filename,
    mimeType,
    text: String(text || ""),
    available: Boolean(available),
    dynamic: Boolean(dynamic),
  });
}

export function createLocationExportBundle({
  locationDocument,
  generatedMapPreview = null,
  exportedAt = new Date().toISOString(),
} = {}) {
  const document = resolveCanonicalLocationOutputDocument(locationDocument);
  const projection = createLocationOutputProjection(document);
  const baseFilename = createLocationExportFilename(projection.title);
  const markdown = serializeLocationDocumentV2Markdown(document);
  const sessionInsert = serializeLocationDocumentV2SessionInsert(document);
  const tableText = serializeLocationDocumentV2TableText(document);
  const jsonPayload = createJsonExportPayload({
    exportedAt,
    generatedMapPreview,
    locationDocument: document,
  });

  const formats = Object.freeze({
    roomKey: createExportFormat({
      id: "roomKey",
      label: "Room Key Markdown",
      filename: `${baseFilename}-room-key.md`,
      mimeType: "text/markdown;charset=utf-8",
      text: markdown,
    }),
    sessionInsert: createExportFormat({
      id: "sessionInsert",
      label: "Session Insert",
      filename: `${baseFilename}-session-insert.txt`,
      mimeType: "text/plain;charset=utf-8",
      text: sessionInsert,
    }),
    tableText: createExportFormat({
      id: "tableText",
      label: "Table Text",
      filename: `${baseFilename}-table-text.txt`,
      mimeType: "text/plain;charset=utf-8",
      text: tableText,
    }),
    markdown: createExportFormat({
      id: "markdown",
      label: "Markdown",
      filename: `${baseFilename}.md`,
      mimeType: "text/markdown;charset=utf-8",
      text: markdown,
    }),
    json: createExportFormat({
      id: "json",
      label: "JSON",
      filename: `${baseFilename}.json`,
      mimeType: "application/json;charset=utf-8",
      text: JSON.stringify(jsonPayload, null, 2),
    }),
    svg: createExportFormat({
      id: "svg",
      label: "Map SVG",
      filename: `${baseFilename}-map.svg`,
      mimeType: "image/svg+xml;charset=utf-8",
      text: "",
      available: Boolean(generatedMapPreview),
      dynamic: true,
    }),
  });

  return Object.freeze({
    schemaVersion: "cruor-dark-places-export-bundle-v2",
    exportedAt,
    title: projection.title,
    contextLine: projection.contextLine || "Location export",
    baseFilename,
    document,
    readiness: projection.readiness,
    outputProjection: projection,
    jsonPayload,
    formats,
  });
}

export async function copyTextToClipboard(text) {
  const value = String(text || "");
  if (!value.trim()) {
    return { ok: false, method: "none", reason: "Nothing to copy" };
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return { ok: true, method: "clipboard", reason: "" };
    } catch (error) {
      // Fall through to the textarea fallback below.
    }
  }

  if (typeof document === "undefined" || !document.body) {
    return { ok: false, method: "none", reason: "Clipboard unavailable" };
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    return copied
      ? { ok: true, method: "textarea", reason: "" }
      : { ok: false, method: "textarea", reason: "Copy command rejected" };
  } finally {
    document.body.removeChild(textarea);
  }
}

export function getClipboardStatusMessage(label, result) {
  if (result?.ok) {
    return result.method === "textarea"
      ? `${label} copied with fallback`
      : `${label} copied`;
  }

  return `${label}: ${result?.reason || "copy unavailable"}`;
}
