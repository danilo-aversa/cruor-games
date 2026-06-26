import { toArray } from "./location-composer-state.js";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeTokens(values = []) {
  return new Set(
    toArray(values)
      .flatMap((value) => String(value || "").split(/[\s,;/|]+/g))
      .map(normalizeText)
      .filter(Boolean)
      .filter((value) => value !== "any" && value !== "any source"),
  );
}

function titleCase(value, fallback = "Room") {
  const text = String(value || fallback)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`);
}

function countTokenMatches(componentTokens, matchTokens) {
  if (!componentTokens?.size || !matchTokens?.size) return 0;
  let count = 0;
  for (const token of matchTokens) {
    if (componentTokens.has(token)) count += 1;
  }
  return count;
}

function addReason(reasons, label) {
  if (!label || reasons.includes(label)) return;
  reasons.push(label);
}

export const LOCATION_ROOM_SLOT_MATCH_PROFILES = Object.freeze({
  hazard: Object.freeze({
    id: "hazard",
    label: "Environmental Hazard",
    actionLabel: "Add Environmental Hazard",
    shortLabel: "Hazard",
    icon: "fa-triangle-exclamation",
    description: "A concrete pressure, danger, obstacle, or room-scale threat the DM can run at the table.",
    preferredTypes: ["hazard", "lair effect", "environmental pressure", "danger", "obstacle", "trap"],
    preferredTokens: ["hazard", "danger", "trap", "pressure", "threat", "damage", "saving", "save", "lair", "environment", "environmental", "obstacle", "risk"],
    reason: "Room hazard",
  }),
  clue: Object.freeze({
    id: "clue",
    label: "Disturbing Clue",
    actionLabel: "Add Disturbing Clue",
    shortLabel: "Clue",
    icon: "fa-magnifying-glass",
    description: "A readable sign, sensory reveal, trace, or lore clue that tells players what is wrong here.",
    preferredTypes: ["clue", "visual sign", "sensory layer", "lore clue", "revelation", "sign", "detail"],
    preferredTokens: ["clue", "sign", "visual", "sensory", "reveal", "revelation", "trace", "evidence", "lore", "detail", "hint", "omen", "symbol"],
    reason: "Room clue",
  }),
  encounterTwist: Object.freeze({
    id: "encounterTwist",
    label: "Encounter Twist",
    actionLabel: "Add Encounter Twist",
    shortLabel: "Twist",
    icon: "fa-shuffle",
    description: "A complication, reveal, creature pressure, or setpiece turn that changes how the room plays.",
    preferredTypes: ["encounter twist", "twist", "creature corruption", "revelation", "setpiece", "complication"],
    preferredTokens: ["twist", "encounter", "complication", "creature", "corruption", "reveal", "revelation", "setpiece", "turn", "trigger", "escalation"],
    reason: "Room twist",
  }),
});

export function getLocationRoomSlotMatchProfile(slotId = "") {
  return LOCATION_ROOM_SLOT_MATCH_PROFILES[slotId] || null;
}

export function getLocationRoomSlotLabel(slot = null) {
  const profile = getLocationRoomSlotMatchProfile(slot?.id || slot);
  return profile?.label || slot?.label || titleCase(slot?.id || slot || "Component", "Component");
}

export function getLocationRoomSlotContext({ activeRegion = null, generatedRoom = null, slot = null, state = {} } = {}) {
  const profile = getLocationRoomSlotMatchProfile(slot?.id);
  const roomNumber = generatedRoom?.number || activeRegion?.number || "—";
  const roomName = activeRegion?.name || generatedRoom?.name || `Room ${roomNumber}`;
  const context = state?.context || activeRegion?.context || generatedRoom?.context || "Location";
  const horror = toArray(state?.horrors)[0] || state?.horror || "Horror";
  const source = toArray(state?.sourceAnchors).filter((item) => item !== "Any Source")[0] || "Any Source";
  const role = activeRegion?.role || generatedRoom?.role || generatedRoom?.graphRole || "room";
  const roomType = activeRegion?.roomType || activeRegion?.type || generatedRoom?.roomType || generatedRoom?.type || "room";

  return {
    bestFitLine: `${horror} · ${context} · ${source}`,
    generatedRoom,
    profile,
    roomLabel: generatedRoom ? `Room ${roomNumber}` : "Program Room",
    roomName,
    roomNumber,
    roomRoleLabel: titleCase(role, "Room"),
    roomTypeLabel: titleCase(roomType, "Room"),
    slotActionLabel: profile?.actionLabel || `Add ${slot?.label || "Component"}`,
    slotDescription: profile?.description || slot?.description || slot?.summary || "Choose a component for the active slot.",
    slotLabel: profile?.label || slot?.label || "Component",
  };
}

function getComponentMatchTokens(component = {}) {
  return normalizeTokens([
    component.id,
    component.title,
    component.name,
    component.type,
    component.summary,
    component.description,
    component.text,
    component.effect,
    component.tableText,
    component.mechanics,
    component.narrative,
    ...(Array.isArray(component.slots) ? component.slots : []),
    ...(Array.isArray(component.tags) ? component.tags : []),
    ...(Array.isArray(component.motifs) ? component.motifs : []),
    ...(Array.isArray(component.contexts) ? component.contexts : []),
    ...(Array.isArray(component.horror) ? component.horror : []),
    ...(Array.isArray(component.sourceAnchors) ? component.sourceAnchors : []),
  ]);
}

export function scoreComponentForLocationRoomSlot(component = {}, slot = null) {
  const profile = getLocationRoomSlotMatchProfile(slot?.id);
  if (!profile) {
    return {
      reasons: [],
      score: 0,
    };
  }

  const reasons = [];
  let score = 0;
  const componentTokens = getComponentMatchTokens(component);
  const preferredTypeTokens = normalizeTokens(profile.preferredTypes);
  const preferredKeywordTokens = normalizeTokens(profile.preferredTokens);
  const slotTokens = normalizeTokens([profile.id, profile.label, profile.shortLabel, slot?.label]);

  const directSlotMatches = countTokenMatches(componentTokens, slotTokens);
  if (directSlotMatches) {
    score += 36 + directSlotMatches * 5;
    addReason(reasons, profile.reason);
  }

  const typeMatches = countTokenMatches(componentTokens, preferredTypeTokens);
  if (typeMatches) {
    score += 24 + Math.min(18, typeMatches * 4);
    addReason(reasons, "Slot type fit");
  }

  const keywordMatches = countTokenMatches(componentTokens, preferredKeywordTokens);
  if (keywordMatches) {
    score += 12 + Math.min(18, keywordMatches * 2);
    addReason(reasons, profile.shortLabel);
  }

  return {
    reasons: reasons.slice(0, 3),
    score,
  };
}
