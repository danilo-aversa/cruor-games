import {
  SEMANTIC_SCHEMA_VERSIONS,
  normalizeLocationDocumentV2,
} from "../../../../shared/content/content.index.js";
import {
  LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION,
  adaptLocationDocumentV1ToV2,
} from "../../compiler/index.js";

export const LOCATION_OUTPUT_PROJECTION_SCHEMA_VERSION =
  "cruor-location-output-projection-v2";

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cleanText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function createIdentityBlocks(document) {
  return [
    document.identity.historyParagraph
      ? {
          id: "location-history",
          kind: "note",
          title: "Location History",
          text: document.identity.historyParagraph,
        }
      : null,
    document.identity.currentSituationParagraph
      ? {
          id: "location-situation",
          kind: "note",
          title: "Current Situation",
          text: document.identity.currentSituationParagraph,
        }
      : null,
    document.identity.playerEntryPoint
      ? {
          id: "location-entry-point",
          kind: "note",
          title: "Why the Characters Enter",
          text: document.identity.playerEntryPoint,
        }
      : null,
  ].filter(Boolean);
}

export function resolveCanonicalLocationOutputDocument(value = {}) {
  if (value.schemaVersion === SEMANTIC_SCHEMA_VERSIONS.LOCATION_DOCUMENT) {
    return normalizeLocationDocumentV2(value);
  }
  if (value.schemaVersion === LEGACY_LOCATION_DOCUMENT_SCHEMA_VERSION) {
    return adaptLocationDocumentV1ToV2(value);
  }
  throw new Error(
    `Unsupported Location Document schema for Final Output: ${cleanText(value.schemaVersion, "unversioned")}.`,
  );
}

export function createLocationOutputProjection(value = {}) {
  const document = resolveCanonicalLocationOutputDocument(value);
  return Object.freeze({
    schemaVersion: LOCATION_OUTPUT_PROJECTION_SCHEMA_VERSION,
    documentSchemaVersion: document.schemaVersion,
    documentId: document.id,
    title: document.meta.title || "Cursed Location Build",
    contextLine: [
      document.meta.context,
      ...document.meta.horror,
      ...document.meta.sourceAnchors,
    ]
      .filter(Boolean)
      .join(" · "),
    overview: Object.freeze({
      premise: createIdentityBlocks(document),
      atmosphere: document.siteWide.atmosphere,
      globalRules: document.siteWide.globalRules,
      recurringSigns: document.siteWide.recurringSigns,
      stakesAndConsequences: document.siteWide.stakesAndConsequences,
    }),
    sessionGuide: document.sessionGuide,
    map: document.map,
    rooms: document.rooms,
    readiness: Object.freeze({
      status: document.validation.status,
      issues: document.validation.issues,
      coverage: document.validation.coverage,
      complete:
        document.rooms.length > 0 &&
        document.validation.coverage.incompleteRooms.length === 0,
    }),
    document,
  });
}

function blockText(block = {}) {
  const lines = [];
  const lead = [cleanText(block.title), cleanText(block.text)]
    .filter(Boolean)
    .join(": ");
  if (lead) lines.push(lead);
  if (block.mechanics) {
    lines.push(
      `Mechanics: ${
        typeof block.mechanics === "string"
          ? block.mechanics
          : JSON.stringify(block.mechanics)
      }`,
    );
  }
  if (block.counterplay) lines.push(`Counterplay: ${block.counterplay}`);
  if (block.narrative) lines.push(`GM guidance: ${block.narrative}`);
  return lines.join("\n");
}

function markdownBlockSection(title, blocks) {
  const entries = asArray(blocks).map(blockText).filter(Boolean);
  if (!entries.length) return "";
  return [`## ${title}`, ...entries.map((entry) => `- ${entry.replace(/\n/g, "\n  ")}`)].join("\n\n");
}

function roomConnectionText(document, room, connection) {
  const targetId =
    connection.fromRoomId === room.id
      ? connection.toRoomId
      : connection.fromRoomId;
  const target = document.rooms.find((candidate) => candidate.id === targetId);
  const flags = [
    connection.secret ? "secret" : "",
    connection.locked ? "locked" : "",
    connection.crossLevel
      ? `${connection.levelDelta > 0 ? "up" : "down"} ${Math.max(1, Math.abs(connection.levelDelta || 1))} level`
      : "",
  ].filter(Boolean);
  return `${target ? `Room ${target.number}: ${target.name}` : targetId} — ${connection.kind || "passage"}${flags.length ? ` (${flags.join(", ")})` : ""}`;
}

function roomMarkdown(document, room) {
  const sections = [
    `## Room ${room.number}: ${room.name}`,
    [room.role, room.level ? `Level ${room.level}` : "Ground level", room.shape]
      .filter(Boolean)
      .join(" · "),
    room.readAloud.standard
      ? `### Read Aloud\n\n> ${room.readAloud.standard.replace(/\n/g, "\n> ")}`
      : "",
    markdownBlockSection("Immediate Impressions", room.immediateImpressions),
    markdownBlockSection("Visible Features", room.visibleFeatures),
    markdownBlockSection("Interactions", room.interactions),
    markdownBlockSection("Hazards & Traps", room.hazards),
    markdownBlockSection("Disturbing Clues", room.clues),
    markdownBlockSection("Encounter Twists", room.encounterTwists),
    markdownBlockSection("Secrets — GM Only", room.secrets),
    markdownBlockSection("Rewards & Consequences", room.rewards),
    asArray(room.connections).length
      ? [
          "### Exits",
          ...room.connections.map(
            (connection) => `- ${roomConnectionText(document, room, connection)}`,
          ),
        ].join("\n")
      : "",
    `Readiness: ${room.readiness.label || room.readiness.status}`,
  ];
  return sections.filter(Boolean).join("\n\n");
}

export function serializeLocationDocumentV2Markdown(value = {}) {
  const projection = createLocationOutputProjection(value);
  const document = projection.document;
  const premise = projection.overview.premise
    .map((block) => `- **${block.title}.** ${block.text}`)
    .join("\n");
  return [
    `# ${projection.title}`,
    `Schema: \`${document.schemaVersion}\``,
    premise ? `## Location Premise\n\n${premise}` : "",
    markdownBlockSection("Site Atmosphere", projection.overview.atmosphere),
    markdownBlockSection("Global Rules", projection.overview.globalRules),
    markdownBlockSection("Recurring Signs", projection.overview.recurringSigns),
    markdownBlockSection(
      "Stakes & Consequences",
      projection.overview.stakesAndConsequences,
    ),
    "# Room Key",
    ...document.rooms.map((room) => roomMarkdown(document, room)),
  ]
    .filter(Boolean)
    .join("\n\n");
}

function plainList(title, values) {
  const entries = asArray(values)
    .map((value) => {
      if (typeof value === "string") return value;
      const semanticText = blockText(value);
      if (semanticText) return semanticText;
      if (value.trigger || value.action) {
        return [value.trigger, value.action].filter(Boolean).join(" → ");
      }
      if (value.roomName || value.signal) {
        return [
          value.roomNumber ? `${value.roomNumber}. ${value.roomName}` : value.roomName,
          value.signal,
        ]
          .filter(Boolean)
          .join(": ");
      }
      return "";
    })
    .filter(Boolean);
  return entries.length
    ? [title.toUpperCase(), ...entries.map((entry) => `- ${entry}`)].join("\n")
    : "";
}

export function serializeLocationDocumentV2SessionInsert(value = {}) {
  const projection = createLocationOutputProjection(value);
  const guide = projection.sessionGuide;
  return [
    projection.title.toUpperCase(),
    `Schema: ${projection.documentSchemaVersion}`,
    cleanText(guide.openingBeat?.situation)
      ? `START HERE\n${guide.openingBeat.situation}`
      : "",
    plainList("Immediate objectives", guide.objectives),
    plainList("Active pressure", guide.pressureTracks),
    plainList("Always on", guide.alwaysOnRules),
    plainList("Clue flow", guide.clueFlow?.nodes),
    plainList("When they stall", guide.stallMoves),
    plainList("Room shortcuts", guide.roomShortcuts),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function serializeLocationDocumentV2TableText(value = {}) {
  const projection = createLocationOutputProjection(value);
  return [
    serializeLocationDocumentV2SessionInsert(projection.document),
    "ROOMS",
    ...projection.rooms.map((room) =>
      [
        `${String(room.number).padStart(2, "0")} ${room.name} — ${room.role}`,
        room.readAloud.standard,
        ...room.hazards.map(blockText),
        ...room.clues.map(blockText),
        ...room.encounterTwists.map(blockText),
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  ].join("\n\n");
}
