import { toArray } from "./location-composer-state.js";
import {
  getAssignedComponentsForRegion,
  getAssignedComponentsForSlot,
  getLocationSlots,
  getRegionDetailRows,
} from "./location-composer-selectors.js";
import { getGeneratedRoomForRegionIndex } from "./location-composer-map-preview.js";
import { createLocationDocument } from "../../output/model/location-document.js";

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

const ROOM_KEY_SLOT_DEFINITIONS = Object.freeze([
  Object.freeze({ slotId: "hazard", label: "Environmental Hazard", heading: "Environmental Hazard" }),
  Object.freeze({ slotId: "clue", label: "Disturbing Clue", heading: "Disturbing Clue" }),
  Object.freeze({ slotId: "encounterTwist", label: "Encounter Twist", heading: "Encounter Twist" }),
]);

const LOCATION_EFFECT_SLOT_LABELS = Object.freeze({
  horrorPremise: "Location Premise",
  sensoryLayer: "Sensory Layer",
  visibleAnomaly: "Visible Anomaly",
  hazard: "Environmental Hazard",
  clue: "Disturbing Clue",
  encounterTwist: "Encounter Twist",
  reward: "Reward / Consequence",
});

function getLocationEffectSlotLabel(slotId = "") {
  return LOCATION_EFFECT_SLOT_LABELS[slotId] || cleanText(slotId, "Component");
}

function mergeOutputText(currentValue, nextValue) {
  const current = cleanText(currentValue, "");
  const next = cleanText(nextValue, "");
  if (!next) return current || "—";
  if (!current) return next;
  const currentLower = current.toLowerCase();
  const nextLower = next.toLowerCase();
  if (currentLower === nextLower || currentLower.includes(nextLower)) return current;
  return `${current} · ${next}`;
}

function mergeComponentOutputs(components = []) {
  const seen = new Set();
  return components.filter((component) => {
    const key = `${component.slotId || ""}:${component.id || component.placementId || component.title || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getRoomKeySlotDefinition(slotId = "") {
  return ROOM_KEY_SLOT_DEFINITIONS.find((definition) => definition.slotId === slotId) || {
    slotId,
    label: cleanText(slotId, "Component"),
    heading: cleanText(slotId, "Component"),
  };
}

function getRoomStatusFromMissingSlots(missingSlots = [], components = []) {
  if (!missingSlots.length) return { status: "ready", label: "Ready" };
  if (components.length) return { status: "partial", label: "Partial" };
  return { status: "empty", label: "Empty" };
}

function createRoomKeySlotRows(components = []) {
  return ROOM_KEY_SLOT_DEFINITIONS.map((definition) => {
    const slotComponents = components.filter((component) => component.slotId === definition.slotId);
    return {
      ...definition,
      components: slotComponents,
      filled: slotComponents.length > 0,
    };
  });
}

function getRoomKeySlotText(slotRow) {
  if (!slotRow?.components?.length) return "_Missing._";
  return slotRow.components
    .map((component) => {
      const title = component.title ? `**${component.title}.** ` : "";
      return `${title}${component.text || component.summary || "No table text yet."}`;
    })
    .join("\n\n");
}

function getMissingRoomSlotLabels(missingSlotIds = []) {
  return missingSlotIds.map((slotId) => getRoomKeySlotDefinition(slotId).label);
}

function getRowValue(detailRows, label) {
  return detailRows.find((row) => row.label === label)?.value || "";
}

function getPlacedComponentOutput(placement) {
  const slotId = placement.slotId || "";
  const slotLabel = getLocationEffectSlotLabel(slotId);
  return {
    id: placement.componentId || placement.id,
    placementId: placement.id,
    title: placement.componentTitle || slotLabel,
    type: "location-effect",
    slotId,
    slotLabel,
    regionId: placement.sourceRegionId || placement.regionId || "",
    summary: placement.summary || "",
    text: placement.text || placement.summary || placement.componentTitle || "No table text yet.",
    strategy: placement.strategy || "none",
    visualCue: placement.visualCue || "",
    sourceAnchors: placement.sourceAnchors || placement.effect?.provenance?.sourceAnchors || [],
    effect: placement.effect || null,
    subtype: placement.subtype || placement.location?.subtype || placement.location?.hazardType || "",
    tableRole: placement.tableRole || placement.location?.tableRole || placement.effect?.output?.tableRole || "",
    mechanics: placement.mechanics || null,
    counterplay: placement.counterplay || "",
    narrative: placement.narrative || "",
    provenance: placement.provenance || {},
  };
}

function getComponentPlacementsForRegion(mapRequest, regionId) {
  return (Array.isArray(mapRequest?.componentPlacements) ? mapRequest.componentPlacements : [])
    .filter((placement) =>
      placement?.sourceRegionId === regionId || placement?.regionId === regionId,
    )
    .map(getPlacedComponentOutput);
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
    sourceAnchors: component.sourceAnchors || [],
    effect: component.effect || component.location?.effect || null,
    subtype: component.subtype || component.location?.subtype || component.location?.hazardType || "",
    tableRole: component.tableRole || component.location?.tableRole || "",
    mechanics: component.mechanics || null,
    counterplay: component.counterplay || "",
    narrative: component.narrative || "",
    provenance: component.provenance || {},
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
  const roomCount = syncStatus.generated || syncStatus.requested || regions.length || 0;
  const corridorCount = generatedMapPreview ? syncStatus.corridors : 0;
  const notes = [
    roomCount
      ? `Use the numbered map as the running order for ${roomCount} room${roomCount === 1 ? "" : "s"}.`
      : "Use the current location frame as the map reference.",
    corridorCount
      ? `${corridorCount} corridor${corridorCount === 1 ? "" : "s"} connect the main route and side areas.`
      : "Treat transitions between regions as close, immediate movement unless the map shows otherwise.",
  ];

  if (mapRequest?.mapType) {
    notes.push(`Map tone: ${mapRequest.mapType}.`);
  }

  return notes;
}

function createRoomSection(region, index, generatedMapPreview, state, mapRequest) {
  const room = getGeneratedRoomForRegionIndex(generatedMapPreview, region.id, index);
  const attached = getAssignedComponentsForRegion(state, region.id);
  const detailRows = getRegionDetailRows(region);
  const readAloud = getRegionReadAloud(region);
  const components = attached.map(getComponentOutput);
  const placedComponents = getComponentPlacementsForRegion(mapRequest, region.id);
  const roomNumber = room?.number || index + 1;
  const roomRole = room?.graphRole || room?.role || region.role || "Room";
  const mapLabel = room
    ? `Map Room ${roomNumber}`
    : `Region ${index + 1}`;
  const heading = `Room ${roomNumber}: ${region.name}`;
  const baseFeature = region.feature || getRowValue(detailRows, "Feature");
  const anomalyFeature = placedComponents
    .filter((component) => component.slotId === "visibleAnomaly")
    .map((component) => `${component.slotLabel} — ${component.title}: ${component.text}`)
    .join(" · ");
  const feature = [baseFeature, anomalyFeature]
    .filter((value) => value && value !== "—")
    .join(" · ") || "—";
  const placedPremise = placedComponents
    .filter((component) => component.slotId === "horrorPremise")
    .map((component) => component.text)
    .join(" · ");
  const placedSensory = placedComponents
    .filter((component) => component.slotId === "sensoryLayer")
    .map((component) => component.text)
    .join(" · ");
  const placedHazard = placedComponents
    .filter((component) => component.slotId === "hazard")
    .map((component) => component.text)
    .join(" · ");
  const placedReward = placedComponents
    .filter((component) => component.slotId === "reward")
    .map((component) => component.text)
    .join(" · ");
  const premise = mergeOutputText(region.premise, placedPremise);
  const sensory = mergeOutputText(region.sensoryLayer, placedSensory);
  const danger = mergeOutputText(region.danger || getRowValue(detailRows, "Danger"), placedHazard);
  const secret = region.secret || getRowValue(detailRows, "Secret");
  const reward = mergeOutputText(region.reward || getRowValue(detailRows, "Reward"), placedReward);
  const allComponents = mergeComponentOutputs([...components, ...placedComponents]);
  const componentLine = allComponents.length
    ? allComponents.map((component) => `${component.slotLabel}: ${component.title}`).join("; ")
    : "—";
  const roomKeySlotRows = createRoomKeySlotRows(allComponents);
  const missingSlotIds = roomKeySlotRows.filter((slotRow) => !slotRow.filled).map((slotRow) => slotRow.slotId);
  const completedSlotIds = roomKeySlotRows.filter((slotRow) => slotRow.filled).map((slotRow) => slotRow.slotId);
  const readiness = getRoomStatusFromMissingSlots(missingSlotIds, components);
  const missingSlotLabels = getMissingRoomSlotLabels(missingSlotIds);

  return {
    id: region.id,
    region,
    room,
    attached,
    components,
    placedComponents,
    detailRows,
    readAloud,
    heading,
    roomNumber,
    role: roomRole,
    premise,
    sensory,
    feature,
    danger,
    secret,
    reward,
    mapLabel,
    roomKeySlotRows,
    missingSlotIds,
    missingSlotLabels,
    completedSlotIds,
    readinessStatus: readiness.status,
    readinessLabel: readiness.label,
    readySlotCount: completedSlotIds.length,
    readySlotTotal: ROOM_KEY_SLOT_DEFINITIONS.length,
    tableLine: [
      `${mapLabel} — ${region.name}`,
      formatCompileLine("Role", roomRole),
      readAloud ? formatCompileLine("Read-Aloud", readAloud) : "",
      premise && premise !== "—" ? formatCompileLine("Premise", premise) : "",
      sensory && sensory !== "—" ? formatCompileLine("Sensory", sensory) : "",
      formatCompileLine("Feature", feature),
      danger && danger !== "—" ? formatCompileLine("Danger", danger) : "",
      secret && secret !== "—" ? formatCompileLine("Secret", secret) : "",
      reward && reward !== "—" ? formatCompileLine("Reward", reward) : "",
      allComponents.length ? formatCompileLine("Components", componentLine) : "",
    ].filter(Boolean).join(" | "),
    summaryText: [
      `${mapLabel} — ${region.name}`,
      formatCompileLine("Role", roomRole),
      readAloud ? formatCompileLine("Read-Aloud", readAloud) : "",
      premise && premise !== "—" ? formatCompileLine("Premise", premise) : "",
      sensory && sensory !== "—" ? formatCompileLine("Sensory", sensory) : "",
      formatCompileLine("Feature", feature),
      danger && danger !== "—" ? formatCompileLine("Danger", danger) : "",
      secret && secret !== "—" ? formatCompileLine("Secret", secret) : "",
      reward && reward !== "—" ? formatCompileLine("Reward", reward) : "",
      allComponents.length ? formatCompileLine("Components", componentLine) : "",
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
function getComponentsForTableView(componentSections, slotId) {
  return componentSections.filter((component) => component.slotId === slotId);
}

function getReadAloudText(regionSections) {
  const lines = regionSections
    .filter((section) => section.readAloud)
    .map((section) => `${section.heading}\n${section.readAloud}`);

  return lines.length ? lines.join("\n\n") : "No read-aloud text assigned yet.";
}

function createAtTheTableRows({ context, horrorLine, sourceLine, regionSections, hazardSections, clueSections, twistSections }) {
  return [
    { label: "Use This When", value: `You need a ${context} horror insert shaped by ${horrorLine}.` },
    { label: "Primary Source", value: sourceLine },
    { label: "Run Order", value: `${regionSections.length || 0} mapped region${regionSections.length === 1 ? "" : "s"}. Follow the room numbers unless the table needs a faster route.` },
    { label: "Pressure", value: hazardSections.length ? `${hazardSections.length} hazard hook${hazardSections.length === 1 ? "" : "s"} ready.` : "No hard hazard assigned yet; lean on atmosphere and clues." },
    { label: "Clue Flow", value: clueSections.length ? `${clueSections.length} clue hook${clueSections.length === 1 ? "" : "s"} ready.` : "Add or improvise one clue before running this as an investigation site." },
    { label: "Encounter Twist", value: twistSections.length ? `${twistSections.length} twist hook${twistSections.length === 1 ? "" : "s"} ready.` : "No encounter twist assigned." },
  ];
}

function createRoomKeyMarkdown({ title, context, horrorLine, sourceLine, regionSections, atTheTableRows }) {
  const readyCount = regionSections.filter((section) => section.readinessStatus === "ready").length;
  const incompleteSections = regionSections.filter((section) => section.missingSlotIds.length);
  const lines = [
    `# ${title}`,
    "",
    `**Context:** ${context}`,
    `**Horror:** ${horrorLine}`,
    `**Source:** ${sourceLine}`,
    `**Rooms Ready:** ${readyCount}/${regionSections.length || 0}`,
    "",
  ];

  if (incompleteSections.length) {
    lines.push("## Missing Content", "");
    incompleteSections.forEach((section) => {
      lines.push(`- **Room ${String(section.roomNumber).padStart(2, "0")} — ${section.region.name}:** ${section.missingSlotLabels.join(", ")}`);
    });
    lines.push("");
  }

  lines.push("## Room Key", "");

  regionSections.forEach((section) => {
    lines.push(`### Room ${String(section.roomNumber).padStart(2, "0")} — ${section.region.name}`);
    lines.push("");
    lines.push(`**Role:** ${cleanText(section.role)}`);
    lines.push(`**Status:** ${section.readinessLabel} (${section.readySlotCount}/${section.readySlotTotal})`);
    if (section.missingSlotLabels.length) {
      lines.push(`**Missing:** ${section.missingSlotLabels.join(", ")}`);
    }
    if (section.readAloud) {
      lines.push("", "#### Read-Aloud", section.readAloud);
    }
    if (section.premise && section.premise !== "—") {
      lines.push("", `**Premise:** ${section.premise}`);
    }
    if (section.sensory && section.sensory !== "—") {
      lines.push("", `**Sensory:** ${section.sensory}`);
    }
    if (section.feature && section.feature !== "—") {
      lines.push("", `**Feature:** ${section.feature}`);
    }

    section.roomKeySlotRows.forEach((slotRow) => {
      lines.push("", `#### ${slotRow.heading}`, getRoomKeySlotText(slotRow));
    });

    const tableNotes = [
      section.danger && section.danger !== "—" ? `**Danger:** ${section.danger}` : "",
      section.secret && section.secret !== "—" ? `**Secret:** ${section.secret}` : "",
      section.reward && section.reward !== "—" ? `**Reward:** ${section.reward}` : "",
    ].filter(Boolean);

    if (tableNotes.length) {
      lines.push("", "#### At the Table", ...tableNotes);
    }

    lines.push("");
  });

  if (atTheTableRows.length) {
    lines.push("## At the Table", "");
    atTheTableRows.forEach((row) => {
      lines.push(`- **${row.label}:** ${row.value}`);
    });
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}


export function getCompilePreview(state, digest, mapRequest, generatedMapPreview) {
  const slots = getLocationSlots();
  const selectedSources = toArray(state.sourceAnchors);
  const selectedHorrors = toArray(state.horrors);
  const title = state.title || "Cursed Location Build";
  const context = state.context || "Location";
  const horrorLine = selectedHorrors.length ? selectedHorrors.join(", ") : "Unspecified horror";
  const sourceLine = selectedSources.length ? selectedSources.join(", ") : "No source anchor selected";
  const premiseComponents = getAssignedComponentsForSlot(state, "horrorPremise");
  const locationPremiseText =
    mapRequest?.premise ||
    premiseComponents
      .map((component) => getComponentRulesText(component))
      .filter(Boolean)
      .join(" · ") ||
    "No location premise assigned yet.";
  const premiseSection = {
    title,
    context,
    horrorLine,
    sourceLine,
    premise: locationPremiseText,
    intrusion: state.intrusion || "Medium",
    text: [
      title,
      formatCompileLine("Context", context),
      formatCompileLine("Horror", horrorLine),
      formatCompileLine("Source", sourceLine),
      formatCompileLine("Premise", locationPremiseText),
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
    createRoomSection(region, index, generatedMapPreview, state, mapRequest),
  );
  const componentSections = createComponentSections(slotSections);
  const hazardSections = getComponentsForTableView(componentSections, "hazard");
  const clueSections = getComponentsForTableView(componentSections, "clue");
  const twistSections = getComponentsForTableView(componentSections, "encounterTwist");
  const readAloudText = getReadAloudText(regionSections);
  const atTheTableRows = createAtTheTableRows({
    context,
    horrorLine,
    sourceLine,
    regionSections,
    hazardSections,
    clueSections,
    twistSections,
  });
  const mapSyncStatus = getMapSyncStatus(mapRequest, generatedMapPreview, state.locationRegions || []);
  const mapNotes = getMapNotes(mapRequest, generatedMapPreview, state.locationRegions || []);

  const readyRoomCount = regionSections.filter((section) => section.readinessStatus === "ready").length;
  const incompleteRoomCount = Math.max(0, regionSections.length - readyRoomCount);
  const missingRoomSections = regionSections.filter((section) => section.missingSlotIds.length);

  const roomText = regionSections.map((section) => section.summaryText).join("\n\n");
  const componentText = componentSections.length
    ? componentSections.map((component) => `${component.reference}\n${component.text}`).join("\n\n")
    : "No components assigned yet.";
  const mapNotesText = mapNotes.map((note) => `- ${note}`).join("\n");
  const hazardText = hazardSections.length
    ? hazardSections.map((component) => `${component.reference}\n${component.text}`).join("\n\n")
    : "No hazards assigned yet.";
  const clueText = clueSections.length
    ? clueSections.map((component) => `${component.reference}\n${component.text}`).join("\n\n")
    : "No clues assigned yet.";
  const twistText = twistSections.length
    ? twistSections.map((component) => `${component.reference}\n${component.text}`).join("\n\n")
    : "No encounter twists assigned yet.";
  const atTheTableText = atTheTableRows
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");
  const roomKeyMarkdown = createRoomKeyMarkdown({
    title,
    context,
    horrorLine,
    sourceLine,
    regionSections,
    atTheTableRows,
  });

  const sessionInsertText = [
    title.toUpperCase(),
    "",
    "USE THIS WHEN",
    `You need a ${context} horror insert shaped by ${horrorLine}.`,
    "",
    "FRAME",
    formatCompileLine("Context", context),
    formatCompileLine("Horror", horrorLine),
    formatCompileLine("Source", sourceLine),
    "",
    "PREMISE",
    locationPremiseText,
    "",
    "READ-ALOUD",
    readAloudText,
    "",
    "ROOM PROGRAM",
    roomText || "No rooms generated yet.",
    "",
    "HAZARDS",
    hazardText,
    "",
    "CLUES",
    clueText,
    "",
    "TWISTS",
    twistText,
    "",
    "MAP NOTES",
    mapNotesText,
    "",
    "AT THE TABLE",
    atTheTableText,
  ].join("\n");

  const tableReadyText = [
    title.toUpperCase(),
    `${context} · ${horrorLine} · ${sourceLine}`,
    "",
    "PREMISE",
    locationPremiseText,
    "",
    "READ-ALOUD",
    readAloudText,
    "",
    "ROOM KEY",
    ...regionSections.map((section) => section.tableLine),
    "",
    "HAZARDS",
    hazardText,
    "",
    "CLUES",
    clueText,
    "",
    "TWISTS",
    twistText,
    "",
    "AT THE TABLE",
    atTheTableText,
  ].join("\n");

  return {
    title,
    contextLine: `${context} · ${horrorLine} · ${selectedSources[0] || "No source selected"}`,
    filledSlots: digest.filledSlots,
    totalSlots: digest.totalSlots,
    regionCount: regionSections.length,
    readyRoomCount,
    incompleteRoomCount,
    missingRoomSections,
    premiseSection,
    locationPremiseText,
    slotSections,
    regionSections,
    roomSections: regionSections,
    componentSections,
    hazardSections,
    clueSections,
    twistSections,
    readAloudText,
    atTheTableRows,
    mapSyncStatus,
    mapNotes,
    mapNotesText,
    hazardText,
    clueText,
    twistText,
    atTheTableText,
    roomKeyMarkdown,
    sessionInsertText,
    tableReadyText,
  };
}

export function getRegionSummaryText(compilePreview) {
  return [
    "ROOM PROGRAM SUMMARY",
    ...compilePreview.regionSections.map((section) => section.summaryText),
  ].join("\n\n");
}

export function createJsonExportPayload(
  state,
  digest,
  mapRequest,
  generatedMapPreview,
  compilePreview,
  { exportedAt = new Date().toISOString(), locationDocument = null } = {},
) {
  const document = locationDocument || createLocationDocument({
    state,
    digest,
    mapRequest,
    generatedMapPreview,
    compilePreview,
  });

  return {
    schemaVersion: "dark-places-export-v1",
    exportedAt,
    title: compilePreview.title,
    document,
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
    componentPlacements: mapRequest?.componentPlacements || [],
    mapSyncStatus: compilePreview.mapSyncStatus,
    mapNotes: compilePreview.mapNotes,
    sessionInsertText: compilePreview.sessionInsertText,
    tableReadyText: compilePreview.tableReadyText,
    roomKeyMarkdown: compilePreview.roomKeyMarkdown,
    slotAssignments: state.slotAssignments,
    components: compilePreview.componentSections,
    tableView: {
      readAloudText: compilePreview.readAloudText,
      hazards: compilePreview.hazardSections,
      clues: compilePreview.clueSections,
      twists: compilePreview.twistSections,
      atTheTable: compilePreview.atTheTableRows,
    },
    regions: compilePreview.regionSections.map((section) => ({
      id: section.region.id,
      name: section.region.name,
      role: section.role,
      generatedRoomNumber: section.room?.number || null,
      generatedRoomShape: section.room?.shape || null,
      mapLabel: section.mapLabel,
      readAloud: section.readAloud,
      premise: section.premise,
      sensory: section.sensory,
      feature: section.feature,
      danger: section.danger,
      secret: section.secret,
      reward: section.reward,
      details: Object.fromEntries(section.detailRows.map((row) => [row.label, row.value])),
      components: section.components,
      placedComponents: section.placedComponents,
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

export function createLocationExportFilename(value) {
  return String(value || "cruor-location")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "cruor-location";
}

function createExportFormat({ id, label, filename, mimeType, text, available = true, dynamic = false }) {
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

export function createLocationExportBundle(
  state,
  digest,
  mapRequest,
  generatedMapPreview,
  compilePreview,
  { exportedAt = new Date().toISOString() } = {},
) {
  const baseFilename = createLocationExportFilename(compilePreview?.title);
  const document = createLocationDocument({
    state,
    digest,
    mapRequest,
    generatedMapPreview,
    compilePreview,
  });
  const jsonPayload = createJsonExportPayload(
    state,
    digest,
    mapRequest,
    generatedMapPreview,
    compilePreview,
    { exportedAt, locationDocument: document },
  );

  const formats = Object.freeze({
    roomKey: createExportFormat({
      id: "roomKey",
      label: "Room Key Markdown",
      filename: `${baseFilename}-room-key.md`,
      mimeType: "text/markdown;charset=utf-8",
      text: compilePreview?.roomKeyMarkdown,
    }),
    sessionInsert: createExportFormat({
      id: "sessionInsert",
      label: "Session Insert",
      filename: `${baseFilename}-session-insert.txt`,
      mimeType: "text/plain;charset=utf-8",
      text: compilePreview?.sessionInsertText,
    }),
    tableText: createExportFormat({
      id: "tableText",
      label: "Table Text",
      filename: `${baseFilename}-table-text.txt`,
      mimeType: "text/plain;charset=utf-8",
      text: compilePreview?.tableReadyText,
    }),
    markdown: createExportFormat({
      id: "markdown",
      label: "Markdown",
      filename: `${baseFilename}.md`,
      mimeType: "text/markdown;charset=utf-8",
      text: compilePreview?.roomKeyMarkdown,
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
    schemaVersion: "dark-places-export-bundle-v1",
    exportedAt,
    title: compilePreview?.title || "Cursed Location Build",
    contextLine: compilePreview?.contextLine || "Location export",
    baseFilename,
    document,
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
