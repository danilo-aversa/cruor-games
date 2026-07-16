import {
  cleanText,
  collectUnknownFields,
  createParseResult,
  deepFreeze,
  findDuplicates,
  normalizeId,
  normalizeStringList,
  pushIssue,
  requireArray,
  requireId,
  requirePlainObject,
  requireSchemaVersion,
  requireText,
} from "./contract-utils.js";
import {
  normalizeSemanticProvenance,
  validateSemanticProvenance,
} from "./provenance-v1.js";
import { SEMANTIC_SCHEMA_VERSIONS } from "./schema-versions.js";

const FIELDS = Object.freeze([
  "schemaVersion",
  "openingBeat",
  "objectives",
  "alwaysOnRuleIds",
  "pressureTrackId",
  "clueFlow",
  "stallMoves",
  "pacing",
  "provenance",
]);
const OPENING_FIELDS = Object.freeze([
  "situation",
  "immediateSignal",
  "playerDecision",
]);
const CLUE_FLOW_FIELDS = Object.freeze([
  "requiredRevelations",
  "links",
  "fallbackClues",
]);
const CLUE_LINK_FIELDS = Object.freeze(["from", "to", "condition"]);
const STALL_MOVE_FIELDS = Object.freeze(["id", "trigger", "action"]);
const PACING_FIELDS = Object.freeze([
  "defaultRoute",
  "escalationRooms",
  "climaxGuidance",
]);

export function normalizeSessionGuideV1(value = {}) {
  const openingBeat = value.openingBeat || {};
  const clueFlow = value.clueFlow || {};
  const pacing = value.pacing || {};
  return deepFreeze({
    schemaVersion: SEMANTIC_SCHEMA_VERSIONS.SESSION_GUIDE,
    openingBeat: {
      situation: cleanText(openingBeat.situation),
      immediateSignal: cleanText(openingBeat.immediateSignal),
      playerDecision: cleanText(openingBeat.playerDecision),
    },
    objectives: normalizeStringList(value.objectives),
    alwaysOnRuleIds: normalizeStringList(value.alwaysOnRuleIds, { ids: true }),
    pressureTrackId: normalizeId(value.pressureTrackId),
    clueFlow: {
      requiredRevelations: normalizeStringList(clueFlow.requiredRevelations, {
        ids: true,
      }),
      links: (Array.isArray(clueFlow.links) ? clueFlow.links : []).map(
        (link) => ({
          from: normalizeId(link?.from),
          to: normalizeId(link?.to),
          condition: cleanText(link?.condition),
        }),
      ),
      fallbackClues: normalizeStringList(clueFlow.fallbackClues),
    },
    stallMoves: (Array.isArray(value.stallMoves) ? value.stallMoves : []).map(
      (move) => ({
        id: normalizeId(move?.id),
        trigger: cleanText(move?.trigger),
        action: cleanText(move?.action),
      }),
    ),
    pacing: {
      defaultRoute: normalizeStringList(pacing.defaultRoute, { ids: true }),
      escalationRooms: normalizeStringList(pacing.escalationRooms, {
        ids: true,
      }),
      climaxGuidance: cleanText(pacing.climaxGuidance),
    },
    provenance: normalizeSemanticProvenance(value.provenance),
  });
}

export function validateSessionGuideV1(
  value = {},
  { path = "semantic", published = false } = {},
) {
  const issues = [];
  if (!requirePlainObject(value, path, issues)) return issues;
  collectUnknownFields(value, FIELDS, path, issues);
  requireSchemaVersion(
    value.schemaVersion,
    SEMANTIC_SCHEMA_VERSIONS.SESSION_GUIDE,
    `${path}.schemaVersion`,
    issues,
  );

  if (requirePlainObject(value.openingBeat, `${path}.openingBeat`, issues)) {
    collectUnknownFields(
      value.openingBeat,
      OPENING_FIELDS,
      `${path}.openingBeat`,
      issues,
    );
    if (published) {
      OPENING_FIELDS.forEach((field) =>
        requireText(
          value.openingBeat[field],
          `${path}.openingBeat.${field}`,
          issues,
        ),
      );
    }
  }

  requireArray(value.objectives, `${path}.objectives`, issues);
  requireArray(value.alwaysOnRuleIds, `${path}.alwaysOnRuleIds`, issues);

  if (requirePlainObject(value.clueFlow, `${path}.clueFlow`, issues)) {
    collectUnknownFields(
      value.clueFlow,
      CLUE_FLOW_FIELDS,
      `${path}.clueFlow`,
      issues,
    );
    requireArray(
      value.clueFlow.requiredRevelations,
      `${path}.clueFlow.requiredRevelations`,
      issues,
    );
    requireArray(
      value.clueFlow.fallbackClues,
      `${path}.clueFlow.fallbackClues`,
      issues,
    );
    if (requireArray(value.clueFlow.links, `${path}.clueFlow.links`, issues)) {
      value.clueFlow.links.forEach((link, index) => {
        const linkPath = `${path}.clueFlow.links[${index}]`;
        if (!requirePlainObject(link, linkPath, issues)) return;
        collectUnknownFields(link, CLUE_LINK_FIELDS, linkPath, issues);
        requireId(link.from, `${linkPath}.from`, issues);
        requireId(link.to, `${linkPath}.to`, issues);
      });
    }
  }

  if (requireArray(value.stallMoves, `${path}.stallMoves`, issues)) {
    value.stallMoves.forEach((move, index) => {
      const movePath = `${path}.stallMoves[${index}]`;
      if (!requirePlainObject(move, movePath, issues)) return;
      collectUnknownFields(move, STALL_MOVE_FIELDS, movePath, issues);
      requireId(move.id, `${movePath}.id`, issues);
      requireText(move.trigger, `${movePath}.trigger`, issues);
      requireText(move.action, `${movePath}.action`, issues);
    });
    findDuplicates(value.stallMoves, (move) => move.id).forEach((id) => {
      pushIssue(
        issues,
        "session-guide.duplicate-stall-move",
        `${path}.stallMoves`,
        `Duplicate stall move id: ${id}.`,
      );
    });
    if (published && value.stallMoves.length < 3) {
      pushIssue(
        issues,
        "session-guide.stall-move-coverage",
        `${path}.stallMoves`,
        "Published Session Guide target is at least three stall moves.",
        "warning",
      );
    }
  }

  if (requirePlainObject(value.pacing, `${path}.pacing`, issues)) {
    collectUnknownFields(value.pacing, PACING_FIELDS, `${path}.pacing`, issues);
    requireArray(
      value.pacing.defaultRoute,
      `${path}.pacing.defaultRoute`,
      issues,
    );
    requireArray(
      value.pacing.escalationRooms,
      `${path}.pacing.escalationRooms`,
      issues,
    );
  }

  if (published && !value.objectives?.length) {
    pushIssue(
      issues,
      "session-guide.objective-required",
      `${path}.objectives`,
      "Published Session Guides require at least one objective.",
    );
  }

  issues.push(
    ...validateSemanticProvenance(value.provenance, {
      path: `${path}.provenance`,
    }),
  );
  return issues;
}

export function parseSessionGuideV1(value = {}, options = {}) {
  const normalized = normalizeSessionGuideV1(value);
  return createParseResult(normalized, validateSessionGuideV1(value, options));
}
