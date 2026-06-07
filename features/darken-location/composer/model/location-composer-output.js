import { toArray } from "./location-composer-state.js";
import {
  getAssignedComponentsForRegion,
  getAssignedComponentsForSlot,
  getLocationSlots,
  getRegionDetailRows,
} from "./location-composer-selectors.js";
import { getGeneratedRoomForRegionIndex } from "./location-composer-map-preview.js";

export function getComponentRulesText(component) {
  return (
    component?.text ||
    component?.description ||
    component?.rule ||
    component?.summary ||
    "No table text yet."
  );
}

function getRegionReadAloud(region) {
  if (!region?.readAloud) return "";
  if (typeof region.readAloud === "string") return region.readAloud;
  return region.readAloud.compact || region.readAloud.extended || "";
}

function cleanText(value, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function formatCompileLine(label, value) {
  return `${label}: ${cleanText(value)}`;
}

function formatComponentReference(component) {
  const slotLabel = component.slot?.label || component.assignment?.slotId || component.type || "Component";
  return `${slotLabel}: ${component.title}`;
}

function getRowValue(detailRows, label) {
  return detailRows.find((row) => row.label === label)?.value || "";
}

function getComponentOutput(component) {
  return {
    id: component.id,
    title: component.title,
    type: component.type,
    slotId: component.assignment?.slotId || "",
    slotLabel: component.slot?.label || component.assignment?.slotId || "Component",
    regionId: component.assignment?.regionId || "",
    summary: component.summary || "",
    text: getComponentRulesText(component),
  };
}

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
  Object.freeze({ slotId: "hazard", label: "HAZ", fullLabel: "Hazard", icon: "fa-triangle-exclamation" }),
  Object.freeze({ slotId: "clue", label: "CLUE", fullLabel: "Clue", icon: "fa-magnifying-glass" }),
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

export function getMapPreviewQuality(state, mapRequest, generatedMapPreview, regions = []) {
  const syncStatus = getMapSyncStatus(mapRequest, generatedMapPreview, regions);
  const safeRegions = Array.isArray(regions) ? regions : [];
  const markerDefinitions = REGION_PREVIEW_MARKER_DEFINITIONS;
  const markerCounts = Object.fromEntries(
    markerDefinitions.map((definition) => [definition.slotId, 0]),
  );
  let filledRegions = 0;
  let secretRegions = 0;

  const regionRows = safeRegions.map((region, index) => {
    const markers = getRegionPreviewMarkers(state, region.id);
    const markerSlotIds = new Set(markers.map((marker) => marker.slotId));
    markerDefinitions.forEach((definition) => {
      if (markerSlotIds.has(definition.slotId)) markerCounts[definition.slotId] += 1;
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

function getMapNotes(mapRequest, generatedMapPreview, regions = []) {
  const syncStatus = getMapSyncStatus(mapRequest, generatedMapPreview, regions);
  return [
    formatCompileLine("Map Type", mapRequest.mapType),
    formatCompileLine("Seed", mapRequest.seed),
    formatCompileLine("Sync Status", syncStatus.label),
    formatCompileLine("Requested Rooms", syncStatus.requested),
    formatCompileLine("Generated Rooms", syncStatus.generated || syncStatus.requested),
    formatCompileLine("Synced Rooms", syncStatus.synced),
    formatCompileLine("Corridors", generatedMapPreview ? syncStatus.corridors : "Preview unavailable"),
  ];
}

function createRoomSection(region, index, generatedMapPreview, state) {
  const room = getGeneratedRoomForRegionIndex(generatedMapPreview, region.id, index);
  const attached = getAssignedComponentsForRegion(state, region.id);
  const detailRows = getRegionDetailRows(region);
  const readAloud = getRegionReadAloud(region);
  const components = attached.map(getComponentOutput);
  const roomNumber = room?.number || index + 1;
  const roomRole = room?.graphRole || room?.role || region.role || "Room";
  const syncLabel = room
    ? `Generated Room ${roomNumber} synced`
    : `Region ${index + 1} using request metadata only`;
  const heading = `Room ${roomNumber}: ${region.name}`;
  const feature = region.feature || getRowValue(detailRows, "Feature");
  const danger = region.danger || getRowValue(detailRows, "Danger");
  const secret = region.secret || getRowValue(detailRows, "Secret");
  const reward = region.reward || getRowValue(detailRows, "Reward");
  const componentLine = components.length
    ? components.map((component) => `${component.slotLabel}: ${component.title}`).join("; ")
    : "—";

  return {
    id: region.id,
    region,
    room,
    attached,
    components,
    detailRows,
    readAloud,
    heading,
    roomNumber,
    role: roomRole,
    feature,
    danger,
    secret,
    reward,
    syncLabel,
    tableLine: [
      formatCompileLine("Room", roomNumber),
      formatCompileLine("Name", region.name),
      formatCompileLine("Map Sync", syncLabel),
      formatCompileLine("Role", roomRole),
      formatCompileLine("Read-Aloud", readAloud),
      formatCompileLine("Feature", feature),
      formatCompileLine("Danger", danger),
      formatCompileLine("Secret", secret),
      formatCompileLine("Reward", reward),
      formatCompileLine("Components", componentLine),
    ].join(" | "),
    summaryText: [
      heading,
      formatCompileLine("Map Sync", syncLabel),
      formatCompileLine("Role", roomRole),
      readAloud ? formatCompileLine("Read-Aloud", readAloud) : "",
      formatCompileLine("Feature", feature),
      formatCompileLine("Danger", danger),
      formatCompileLine("Secret", secret),
      formatCompileLine("Reward", reward),
      formatCompileLine("Components", componentLine),
    ].filter(Boolean).join("\n"),
  };
}

function createComponentSections(slotSections) {
  return slotSections.flatMap((section) =>
    section.assigned.map((component) => ({
      ...getComponentOutput(component),
      slot: section.slot,
      reference: formatComponentReference(component),
    })),
  );
}

export function getCompilePreview(state, digest, mapRequest, generatedMapPreview) {
  const slots = getLocationSlots();
  const selectedSources = toArray(state.sourceAnchors);
  const selectedHorrors = toArray(state.horrors);
  const title = state.title || "Cursed Location Build";
  const context = state.context || "Location";
  const horrorLine = selectedHorrors.length ? selectedHorrors.join(", ") : "Unspecified horror";
  const sourceLine = selectedSources.length ? selectedSources.join(", ") : "No source anchor selected";
  const premiseSection = {
    title,
    context,
    horrorLine,
    sourceLine,
    intrusion: state.intrusion || "Medium",
    text: [
      title,
      formatCompileLine("Context", context),
      formatCompileLine("Horror", horrorLine),
      formatCompileLine("Source", sourceLine),
      formatCompileLine("Intrusion", state.intrusion || "Medium"),
    ].join("\n"),
  };

  const slotSections = slots.map((slot) => {
    const assigned = getAssignedComponentsForSlot(state, slot.id);
    const text = assigned.length
      ? assigned.map((component) => `${slot.label}: ${component.title} — ${getComponentRulesText(component)}`).join("\n")
      : `${slot.label}: —`;
    return { slot, assigned, text };
  });

  const regionSections = (state.locationRegions || []).map((region, index) =>
    createRoomSection(region, index, generatedMapPreview, state),
  );
  const componentSections = createComponentSections(slotSections);
  const mapSyncStatus = getMapSyncStatus(mapRequest, generatedMapPreview, state.locationRegions || []);
  const mapNotes = getMapNotes(mapRequest, generatedMapPreview, state.locationRegions || []);

  const roomText = regionSections.map((section) => section.summaryText).join("\n\n");
  const componentText = componentSections.length
    ? componentSections.map((component) => `${component.reference}\n${component.text}`).join("\n\n")
    : "No components assigned yet.";
  const mapNotesText = mapNotes.join("\n");

  const sessionInsertText = [
    "SESSION INSERT",
    premiseSection.text,
    "",
    "ROOMS",
    roomText || "No rooms generated yet.",
    "",
    "COMPONENTS",
    componentText,
    "",
    "MAP NOTES",
    mapNotesText,
  ].join("\n");

  const tableReadyText = [
    "PREMISE",
    premiseSection.text,
    "",
    "ROOM TABLE",
    ...regionSections.map((section) => section.tableLine),
    "",
    "COMPONENT TABLE",
    ...slotSections.map((section) => section.text),
    "",
    "MAP NOTES",
    mapNotesText,
  ].join("\n");

  return {
    title,
    contextLine: `${context} · ${horrorLine} · ${selectedSources[0] || "No source selected"}`,
    filledSlots: digest.filledSlots,
    totalSlots: digest.totalSlots,
    regionCount: regionSections.length,
    premiseSection,
    slotSections,
    regionSections,
    roomSections: regionSections,
    componentSections,
    mapSyncStatus,
    mapNotes,
    mapNotesText,
    sessionInsertText,
    tableReadyText,
  };
}

export function getRegionSummaryText(compilePreview) {
  return [
    "REGION SUMMARY",
    ...compilePreview.regionSections.map((section) => section.summaryText),
  ].join("\n\n");
}

export function createJsonExportPayload(state, digest, mapRequest, generatedMapPreview, compilePreview) {
  return {
    exportedAt: new Date().toISOString(),
    title: compilePreview.title,
    premise: compilePreview.premiseSection,
    context: state.context,
    horror: toArray(state.horrors),
    sourceAnchors: toArray(state.sourceAnchors),
    intrusion: state.intrusion,
    activeSlot: state.activeSlot,
    activeRegionId: state.activeRegionId,
    filledSlots: digest.filledSlots,
    totalSlots: digest.totalSlots,
    mapRequest,
    mapSyncStatus: compilePreview.mapSyncStatus,
    mapNotes: compilePreview.mapNotes,
    sessionInsertText: compilePreview.sessionInsertText,
    tableReadyText: compilePreview.tableReadyText,
    slotAssignments: state.slotAssignments,
    components: compilePreview.componentSections,
    regions: compilePreview.regionSections.map((section) => ({
      id: section.region.id,
      name: section.region.name,
      role: section.role,
      generatedRoomNumber: section.room?.number || null,
      generatedRoomShape: section.room?.shape || null,
      syncLabel: section.syncLabel,
      readAloud: section.readAloud,
      feature: section.feature,
      danger: section.danger,
      secret: section.secret,
      reward: section.reward,
      details: Object.fromEntries(section.detailRows.map((row) => [row.label, row.value])),
      components: section.components,
    })),
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
