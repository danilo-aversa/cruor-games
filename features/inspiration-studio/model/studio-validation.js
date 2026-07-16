import {
  COMPONENT_SEMANTIC_TYPES,
  validateContentPackV0_2,
} from "../../../shared/content/contracts/semantic/index.js";
import {
  SHARED_DARKEN_LOCATION_SLOTS,
  SHARED_MONSTER_SLOTS,
  SHARED_WORKFLOWS,
} from "../../../shared/content/workflows.js";
import {
  KNOWN_MONSTER_ANATOMY_TAGS,
  KNOWN_MONSTER_BODY_PLAN_IDS,
  KNOWN_MONSTER_CREATURE_TAGS,
  KNOWN_MONSTER_FAMILY_IDS,
  MONSTER_ANATOMY_CONSTRAINT_FIELDS,
  MONSTER_ANATOMY_GRANT_FIELDS,
  normalizeMonsterAnatomyConstraints,
  normalizeMonsterAnatomyGrants,
} from "../../monster-composer/model/anatomy.js";
import { validateMonsterFrameFit } from "../../monster-composer/model/monster-frame-fit.js";
import {
  ROOM_ARCHETYPES_BY_ID,
  normalizeRoomArchetypeId,
} from "../../../shared/content/contracts/room-archetypes.js";
import {
  normalizeRoomDesignShapeKind,
  normalizeRoomDesignPropKind,
} from "../../../shared/content/contracts/room-design.js";
import {
  STATUS_OPTIONS,
  asArray,
  getDuplicateIds,
  getExplicitMonsterRules,
  getMonsterConstraintSource,
  getMonsterFrameFitSource,
  getMonsterGrantSource,
  hasText,
  isPlainObject,
} from "./studio-component-normalizers.js";
import { normalizeModuleForDraft } from "./studio-draft.js";
import { getStudioComponentFamily } from "./studio-editor-registry.js";
import { buildStudioSemanticCoverage } from "./studio-semantic-coverage.js";

const CANONICAL_WORKFLOW_MAP = new Map(SHARED_WORKFLOWS.map((workflow) => [workflow.id, workflow]));
const CANONICAL_MONSTER_SLOT_MAP = new Map(SHARED_MONSTER_SLOTS.map((slot) => [slot.id, slot]));
const CANONICAL_DARKEN_SLOT_MAP = new Map(SHARED_DARKEN_LOCATION_SLOTS.map((slot) => [slot.id, slot]));
const CANONICAL_SLOT_MAP = new Map([
  ...SHARED_MONSTER_SLOTS.map((slot) => [slot.id, slot]),
  ...SHARED_DARKEN_LOCATION_SLOTS.map((slot) => [slot.id, slot]),
]);

export function makeIssue(severity, path, message, id = "") {
  return { severity, path, message, id };
}

export function getIssueSummary(issues = []) {
  return asArray(issues).reduce((summary, issue) => {
    const severity = issue?.severity || "warning";
    summary.total += 1;
    summary[severity] = (summary[severity] || 0) + 1;
    return summary;
  }, { total: 0, error: 0, warning: 0, info: 0 });
}

export function getIssueSeverityRank(severity = "warning") {
  if (severity === "error") return 0;
  if (severity === "warning") return 1;
  return 2;
}

export function getGroupedValidationIssues(issues = [], { includeInfo = true } = {}) {
  const groups = new Map();

  asArray(issues).forEach((issue) => {
    const severity = issue?.severity || "warning";
    if (!includeInfo && severity === "info") return;

    const message = issue?.message || "Validation issue.";
    const key = `${severity}::${message}`;
    const current = groups.get(key) || {
      key,
      severity,
      message,
      count: 0,
      ids: [],
      paths: [],
    };

    current.count += 1;
    if (issue?.id && !current.ids.includes(issue.id)) current.ids.push(issue.id);
    if (issue?.path && !current.paths.includes(issue.path)) current.paths.push(issue.path);
    groups.set(key, current);
  });

  return [...groups.values()].sort((a, b) => {
    const severityDelta = getIssueSeverityRank(a.severity) - getIssueSeverityRank(b.severity);
    if (severityDelta) return severityDelta;
    return b.count - a.count;
  });
}

export function getIssueGroupMeta(group) {
  const ids = asArray(group?.ids);
  const paths = asArray(group?.paths);
  const visibleIds = ids.slice(0, 2).join(", ");
  const hiddenIdCount = Math.max(0, ids.length - 2);
  if (visibleIds) return hiddenIdCount ? `${visibleIds} +${hiddenIdCount}` : visibleIds;
  if (paths.length === 1) return paths[0];
  if (paths.length > 1) return `${paths.length} affected fields`;
  return "Current draft";
}

export function getIssuesForEntry(issues = [], entryId = "") {
  if (!entryId) return [];
  return asArray(issues).filter((issue) => issue?.id === entryId || String(issue?.path || "").includes(entryId));
}

export function getEntryIssueState(issues = []) {
  const summary = getIssueSummary(issues);
  if (summary.error) return "error";
  if (summary.warning) return "warning";
  return "clean";
}

function validateConstraintTerms(values = [], knownValues = [], path, issues, id, label) {
  const known = new Set(knownValues);
  asArray(values).forEach((value) => {
    if (!known.has(String(value))) {
      issues.push(makeIssue("warning", path, `Unknown ${label}: ${value}. Add it to the anatomy model if this is intentional.`, id));
    }
  });
}

function validateMonsterAnatomyConstraintsForStudio(component = {}, index, issues) {
  const id = component.id || component.monster?.graftId || `component-${index}`;
  const constraints = normalizeMonsterAnatomyConstraints(getMonsterConstraintSource(component));
  if (!constraints) return;

  validateConstraintTerms(constraints.allowedBodyPlans, KNOWN_MONSTER_BODY_PLAN_IDS, `components[${index}].monster.constraints.allowedBodyPlans`, issues, id, "body plan");
  validateConstraintTerms(constraints.forbiddenBodyPlans, KNOWN_MONSTER_BODY_PLAN_IDS, `components[${index}].monster.constraints.forbiddenBodyPlans`, issues, id, "body plan");
  validateConstraintTerms([...constraints.exclusiveToFamilies, ...constraints.allowedFamilies], KNOWN_MONSTER_FAMILY_IDS, `components[${index}].monster.constraints.allowedFamilies`, issues, id, "monster family");
  validateConstraintTerms(constraints.forbiddenFamilies, KNOWN_MONSTER_FAMILY_IDS, `components[${index}].monster.constraints.forbiddenFamilies`, issues, id, "monster family");
  validateConstraintTerms([...constraints.requiredAnatomy, ...constraints.requiresAnyAnatomy, ...constraints.forbiddenAnatomy], KNOWN_MONSTER_ANATOMY_TAGS, `components[${index}].monster.constraints.anatomy`, issues, id, "anatomy tag");
  validateConstraintTerms([...constraints.requiredTags, ...constraints.requiresAnyTags, ...constraints.forbiddenTags], KNOWN_MONSTER_CREATURE_TAGS, `components[${index}].monster.constraints.tags`, issues, id, "creature tag");

  if (!MONSTER_ANATOMY_CONSTRAINT_FIELDS.some((field) => asArray(constraints[field]).length)) {
    issues.push(makeIssue("info", `components[${index}].monster.constraints`, "Anatomy constraints contain only a note and do not restrict compatibility.", id));
  }
}

function validateMonsterAnatomyGrantsForStudio(component = {}, index, issues) {
  const id = component.id || component.monster?.graftId || `component-${index}`;
  const grants = normalizeMonsterAnatomyGrants(getMonsterGrantSource(component));
  if (!grants) return;

  validateConstraintTerms(grants.grantsBodyPlans, KNOWN_MONSTER_BODY_PLAN_IDS, `components[${index}].monster.anatomyGrants.grantsBodyPlans`, issues, id, "body plan");
  validateConstraintTerms(grants.grantsAnatomy, KNOWN_MONSTER_ANATOMY_TAGS, `components[${index}].monster.anatomyGrants.grantsAnatomy`, issues, id, "anatomy tag");
  validateConstraintTerms(grants.grantsTags, KNOWN_MONSTER_CREATURE_TAGS, `components[${index}].monster.anatomyGrants.grantsTags`, issues, id, "creature tag");

  if (!MONSTER_ANATOMY_GRANT_FIELDS.some((field) => asArray(grants[field]).length)) {
    issues.push(makeIssue("info", `components[${index}].monster.anatomyGrants`, "Anatomy grants contain only a note and do not change the effective build.", id));
  }
}


function validateRoomArchetypeRefs(values = [], path, issues, id, label = "room archetype") {
  asArray(values).forEach((value) => {
    const normalized = normalizeRoomArchetypeId(value);
    if (!normalized || !ROOM_ARCHETYPES_BY_ID[normalized]) {
      issues.push(makeIssue("warning", path, `Unknown ${label}: ${value}. Add it to the room archetype registry if intentional.`, id));
    }
  });
}

function getRoomArchetypeRefSet(values = []) {
  return new Set(asArray(values).map(normalizeRoomArchetypeId).filter(Boolean));
}


function validateRoomDesignForStudio(roomDesign, path, issues, id) {
  if (!roomDesign) return;
  if (!isPlainObject(roomDesign)) {
    issues.push(makeIssue("error", path, "roomDesign must be an object.", id));
    return;
  }
  const shape = isPlainObject(roomDesign.shape) ? roomDesign.shape : { kind: roomDesign.shape || roomDesign.shapeKind || roomDesign.kind };
  const shapeKind = normalizeRoomDesignShapeKind(shape.kind || shape.type || "");
  if (hasText(shape.kind || shape.type) && !shapeKind) {
    issues.push(makeIssue("error", `${path}.shape.kind`, `Unknown roomDesign shape kind: ${shape.kind || shape.type}.`, id));
  }
  if (!hasText(shape.kind || shape.type) && !isPlainObject(roomDesign.size) && !isPlainObject(roomDesign.props)) {
    issues.push(makeIssue("info", path, "roomDesign has no shape, size, or props yet.", id));
  }
  const size = isPlainObject(roomDesign.size) ? roomDesign.size : {};
  ["minWidthCells", "minHeightCells", "maxWidthCells", "maxHeightCells", "minAreaCells", "maxAreaCells", "minDiameterCells"].forEach((field) => {
    if (size[field] === undefined || size[field] === "") return;
    const parsed = Number(size[field]);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      issues.push(makeIssue("error", `${path}.size.${field}`, `${field} must be a positive number.`, id));
    }
  });
  if (Number(size.maxWidthCells) > 0 && Number(size.minWidthCells) > Number(size.maxWidthCells)) {
    issues.push(makeIssue("error", `${path}.size`, "minWidthCells cannot exceed maxWidthCells.", id));
  }
  if (Number(size.maxHeightCells) > 0 && Number(size.minHeightCells) > Number(size.maxHeightCells)) {
    issues.push(makeIssue("error", `${path}.size`, "minHeightCells cannot exceed maxHeightCells.", id));
  }
  const requiredProps = asArray(roomDesign.props?.required || roomDesign.requiredProps);
  requiredProps.forEach((prop, propIndex) => {
    const kind = typeof prop === "string" ? prop : prop?.kind || prop?.type || "";
    if (!normalizeRoomDesignPropKind(kind)) {
      issues.push(makeIssue("error", `${path}.props.required[${propIndex}].kind`, "Required roomDesign prop is missing a kind.", id));
    }
  });
}

function hasMapInfluenceEditorialData(mapInfluence = {}) {
  return Object.values(mapInfluence).some((value) => Array.isArray(value) ? value.length : hasText(value));
}

function validateMapInfluenceForStudio(mapInfluence, path, issues, id) {
  if (!isPlainObject(mapInfluence)) return;
  const preferred = asArray([
    mapInfluence.roomArchetype,
    mapInfluence.roomArchetypeId,
    mapInfluence.forcedRoomArchetype,
    mapInfluence.forcedRoomArchetypeId,
    mapInfluence.preferredRoomArchetype,
    mapInfluence.preferredRoomArchetypeId,
    ...asArray(mapInfluence.preferredRoomArchetypes),
    ...asArray(mapInfluence.preferredRoomArchetypeIds),
  ]);
  const forbidden = asArray([
    mapInfluence.forbiddenRoomArchetype,
    mapInfluence.forbiddenRoomArchetypeId,
    ...asArray(mapInfluence.forbiddenRoomArchetypes),
    ...asArray(mapInfluence.forbiddenRoomArchetypeIds),
  ]);
  const direct = mapInfluence.roomArchetype || mapInfluence.roomArchetypeId || mapInfluence.forcedRoomArchetype || mapInfluence.forcedRoomArchetypeId;
  const hasTarget = Boolean(direct || preferred.length || forbidden.length);

  if (!hasTarget) {
    if (mapInfluence.forceRoomArchetype) {
      issues.push(makeIssue("warning", path, "forceRoomArchetype is enabled but no room archetype is defined.", id));
    } else if (hasMapInfluenceEditorialData(mapInfluence)) {
      issues.push(makeIssue("info", path, "Map influence contains only source, note, weight, or empty fields and will not be exported as an active map influence.", id));
    }
    return;
  }

  validateRoomArchetypeRefs(preferred, `${path}.preferredRoomArchetypes`, issues, id);
  validateRoomArchetypeRefs(forbidden, `${path}.forbiddenRoomArchetypes`, issues, id);

  const preferredSet = getRoomArchetypeRefSet(preferred);
  const forbiddenSet = getRoomArchetypeRefSet(forbidden);
  const conflicts = [...preferredSet].filter((item) => forbiddenSet.has(item));
  if (conflicts.length) {
    issues.push(makeIssue("warning", path, `Map influence both prefers and forbids: ${conflicts.join(", ")}. Forced values still win; otherwise the resolver will skip conflicts.`, id));
  }

  if (mapInfluence.forceRoomArchetype && !direct && !preferred.length) {
    issues.push(makeIssue("warning", path, "forceRoomArchetype is enabled but no room archetype is defined.", id));
  }

  if (mapInfluence.forceRoomArchetype && !direct && preferred.length > 1) {
    issues.push(makeIssue("warning", path, "forceRoomArchetype is enabled with multiple preferred archetypes and no direct Influence Archetype. Set one direct archetype to make the forced target unambiguous.", id));
  }

  if (mapInfluence.weight !== undefined && mapInfluence.weight !== "") {
    const weight = Number(mapInfluence.weight);
    if (!Number.isFinite(weight) || weight < 0) {
      issues.push(makeIssue("warning", `${path}.weight`, "Map influence weight should be a non-negative number.", id));
    }
  }

  if (!hasText(mapInfluence.source)) {
    issues.push(makeIssue("info", `${path}.source`, "Map influence has no explicit source label; preview/debug will fall back to the component id.", id));
  }
}

function validateMonsterFrameFitForStudio(component = {}, index, issues) {
  const id = component.id || component.monster?.graftId || `component-${index}`;
  const report = validateMonsterFrameFit(getMonsterFrameFitSource(component), {
    id,
    title: component.title || component.label,
  });

  report.issues.forEach((issue) => {
    issues.push(makeIssue(
      issue.severity || "error",
      `components[${index}].${issue.path || "monster.fit"}`,
      issue.message,
      id,
    ));
  });
}

export function validateStudioDraft(draft, contentPackExport) {
  const normalized = normalizeModuleForDraft(draft);
  const issues = [];
  const sourceAnchorId = normalized.sourceAnchor?.id || normalized.id;
  const inspiration = normalized.inspiration || {};
  const components = asArray(normalized.components);

  if (!hasText(normalized.id)) issues.push(makeIssue("error", "module.id", "Module is missing a stable id."));
  if (!hasText(normalized.title)) issues.push(makeIssue("error", "module.title", "Module is missing a public title."));
  if (!hasText(normalized.packId)) issues.push(makeIssue("error", "module.packId", "Module is missing a target content pack id."));
  if (!STATUS_OPTIONS.some((option) => option.id === normalized.status)) {
    issues.push(makeIssue("error", "module.status", `Unsupported module status: ${normalized.status || "empty"}.`));
  }

  if (!hasText(normalized.sourceAnchor?.id)) issues.push(makeIssue("error", "sourceAnchor.id", "Source Anchor is missing an id."));
  if (!hasText(normalized.sourceAnchor?.title)) issues.push(makeIssue("error", "sourceAnchor.title", "Source Anchor is missing a title."));
  if (!hasText(normalized.sourceAnchor?.citation?.label)) {
    issues.push(makeIssue("warning", "sourceAnchor.citation.label", "Source Anchor has no citation label."));
  }
  if (!asArray(inspiration.sourceTypes).length) {
    issues.push(makeIssue("warning", "inspiration.sourceTypes", "Inspiration has no source type tags."));
  }
  if (!asArray(inspiration.themes).length && !asArray(inspiration.horror).length) {
    issues.push(makeIssue("warning", "inspiration.taxonomy", "Inspiration has no theme or horror tags."));
  }

  if (!hasText(inspiration.id)) issues.push(makeIssue("error", "inspiration.id", "Public Inspiration card is missing an id."));
  if (!hasText(inspiration.title)) issues.push(makeIssue("error", "inspiration.title", "Public Inspiration card is missing a title."));
  if (!asArray(inspiration.sourceAnchors).includes(sourceAnchorId)) {
    issues.push(makeIssue("error", "inspiration.sourceAnchors", `Public Inspiration card does not reference Source Anchor ${sourceAnchorId}.`, inspiration.id));
  }
  if (!hasText(inspiration.editorial?.deck) && !hasText(inspiration.editorial?.whatItIs)) {
    issues.push(makeIssue("warning", "inspiration.editorial", "Public Inspiration has no editorial deck or factual framing.", inspiration.id));
  }
  if (!hasText(inspiration.media?.imageKey)) {
    issues.push(makeIssue("warning", "inspiration.media.imageKey", "Public Inspiration has no imageKey.", inspiration.id));
  }

  getDuplicateIds(components).forEach((id) => {
    issues.push(makeIssue("error", "components", `Duplicate component id: ${id}.`, id));
  });

  components.forEach((component, index) => {
    const id = component.id || `component-${index + 1}`;
    const family = getStudioComponentFamily(component);
    const workflows = asArray(component.workflows);
    const slots = asArray(component.slots);

    if (!hasText(component.id)) issues.push(makeIssue("error", `components[${index}].id`, "Component is missing an id.", id));
    if (!hasText(component.title || component.label)) issues.push(makeIssue("error", `components[${index}].title`, "Component is missing a title or label.", id));
    if (!COMPONENT_SEMANTIC_TYPES.includes(component.semanticType)) issues.push(makeIssue("error", `components[${index}].semanticType`, `Unknown component semanticType: ${component.semanticType || "empty"}.`, id));
    if (!asArray(component.sourceAnchors).length) {
      issues.push(makeIssue("warning", `components[${index}].sourceAnchors`, "Component has no Source Anchor; export will attach the current one.", id));
    } else if (!asArray(component.sourceAnchors).includes(sourceAnchorId)) {
      issues.push(makeIssue("warning", `components[${index}].sourceAnchors`, `Component is not linked to current Source Anchor ${sourceAnchorId}.`, id));
    }
    if (!workflows.length) issues.push(makeIssue("error", `components[${index}].workflows`, "Component has no workflow.", id));
    workflows.forEach((workflowId) => {
      if (!CANONICAL_WORKFLOW_MAP.has(workflowId)) {
        issues.push(makeIssue("error", `components[${index}].workflows`, `Unknown workflow: ${workflowId}.`, id));
      }
    });
    slots.forEach((slotId) => {
      if (!CANONICAL_SLOT_MAP.has(slotId)) {
        issues.push(makeIssue("error", `components[${index}].slots`, `Unknown slot: ${slotId}.`, id));
      }
    });

    if (family === "monster-graft") {
      const monsterRules = getExplicitMonsterRules(component);
      const monsterSlot = component.monster?.slot || slots[0];
      if (!workflows.includes("monster-composer")) {
        issues.push(makeIssue("error", `components[${index}].workflows`, "Monster graft must include monster-composer workflow.", id));
      }
      if (!monsterSlot || !CANONICAL_MONSTER_SLOT_MAP.has(monsterSlot)) {
        issues.push(makeIssue("error", `components[${index}].monster.slot`, `Monster graft uses an unknown Monster Composer slot: ${monsterSlot || "empty"}.`, id));
      }
      slots.forEach((slotId) => {
        if (!CANONICAL_MONSTER_SLOT_MAP.has(slotId)) {
          issues.push(makeIssue("error", `components[${index}].slots`, `Monster graft references non-monster slot: ${slotId}.`, id));
        }
      });
      if (monsterSlot && slots.length && !slots.includes(monsterSlot)) {
        issues.push(makeIssue("warning", `components[${index}].monster.slot`, `monster.slot (${monsterSlot}) is not present in component slots.`, id));
      }
      if (!monsterRules) {
        issues.push(makeIssue("error", `components[${index}].monster.rules`, "Monster graft has no structured monster.rules object.", id));
      } else {
        if (!hasText(monsterRules.section)) issues.push(makeIssue("warning", `components[${index}].monster.rules.section`, "Structured rules have no stat block section.", id));
        if (!hasText(monsterRules.actionEconomy)) issues.push(makeIssue("warning", `components[${index}].monster.rules.actionEconomy`, "Structured rules have no action economy.", id));
        if (!isPlainObject(monsterRules.usage)) issues.push(makeIssue("warning", `components[${index}].monster.rules.usage`, "Structured rules have no usage object.", id));
        if (!isPlainObject(monsterRules.resolution)) issues.push(makeIssue("warning", `components[${index}].monster.rules.resolution`, "Structured rules have no resolution object.", id));
        if (!isPlainObject(monsterRules.targeting)) issues.push(makeIssue("warning", `components[${index}].monster.rules.targeting`, "Structured rules have no targeting object.", id));
        if (!isPlainObject(monsterRules.damage)) issues.push(makeIssue("warning", `components[${index}].monster.rules.damage`, "Structured rules have no damage object.", id));
        if (monsterRules.resolution?.type === "savingThrow" && !hasText(monsterRules.resolution?.ability)) {
          issues.push(makeIssue("warning", `components[${index}].monster.rules.resolution.ability`, "Saving throw resolution has no ability.", id));
        }
        if (monsterRules.usage?.type === "recharge" && !hasText(monsterRules.usage?.value || monsterRules.usage?.recharge)) {
          issues.push(makeIssue("warning", `components[${index}].monster.rules.usage.recharge`, "Recharge usage has no recharge value.", id));
        }
      }
      if (!hasText(component.counterplay) && !hasText(component.monster?.rules?.counterplay?.text)) {
        issues.push(makeIssue("warning", `components[${index}].counterplay`, "Monster graft has no explicit counterplay text.", id));
      }
      validateMonsterAnatomyConstraintsForStudio(component, index, issues);
      validateMonsterAnatomyGrantsForStudio(component, index, issues);
      validateMonsterFrameFitForStudio(component, index, issues);
    }

    if (family === "location-component") {
      if (!workflows.includes("darken-location")) {
        issues.push(makeIssue("error", `components[${index}].workflows`, "Location component must include darken-location workflow.", id));
      }
      slots.forEach((slotId) => {
        if (!CANONICAL_DARKEN_SLOT_MAP.has(slotId) || slotId === "locationRegion") {
          issues.push(makeIssue("error", `components[${index}].slots`, `Location component uses an invalid Darken slot: ${slotId}.`, id));
        }
      });
      if (!hasText(component.summary) && !hasText(component.tableText) && !hasText(component.mechanics) && !hasText(component.semantic?.signature)) {
        issues.push(makeIssue("warning", `components[${index}].playableText`, "Location component has no summary, table text, or mechanics.", id));
      }
      validateMapInfluenceForStudio(
        component.location?.mapInfluence || component.generation?.mapInfluence || component.mapInfluence,
        `components[${index}].location.mapInfluence`,
        issues,
        id,
      );
      validateRoomDesignForStudio(
        component.location?.roomDesign || component.generation?.roomDesign || component.map?.roomDesign || component.roomDesign,
        `components[${index}].location.roomDesign`,
        issues,
        id,
      );
    }

    if (family === "location-region") {
      if (!slots.includes("locationRegion")) {
        issues.push(makeIssue("error", `components[${index}].slots`, "Location region must use the locationRegion slot.", id));
      }
      const regionMetadata = isPlainObject(component.locationRegion) ? component.locationRegion : component.map;
      if (!isPlainObject(regionMetadata)) {
        issues.push(makeIssue("warning", `components[${index}].locationRegion`, "Location region has no locationRegion metadata object.", id));
      } else {
        ["role", "size", "shape"].forEach((field) => {
          if (!hasText(regionMetadata?.[field])) {
            issues.push(makeIssue("warning", `components[${index}].locationRegion.${field}`, `Location region has no ${field}.`, id));
          }
        });
        validateRoomArchetypeRefs(
          [regionMetadata.roomArchetype || regionMetadata.roomArchetypeId],
          `components[${index}].locationRegion.roomArchetype`,
          issues,
          id,
        );
        validateMapInfluenceForStudio(
          regionMetadata.mapInfluence,
          `components[${index}].locationRegion.mapInfluence`,
          issues,
          id,
        );
        validateRoomDesignForStudio(
          regionMetadata.roomDesign,
          `components[${index}].locationRegion.roomDesign`,
          issues,
          id,
        );
      }
    }
  });

  const semanticCoverage = buildStudioSemanticCoverage(normalized);
  issues.push(...semanticCoverage.issues);

  validateContentPackV0_2(contentPackExport).forEach((issue) => {
    const componentMatch = String(issue.path || "").match(
      /modules\[\d+\]\.components\[(\d+)\](?:\.(.+))?$/,
    );
    const componentIndex = componentMatch ? Number(componentMatch[1]) : -1;
    const componentId = components[componentIndex]?.id || issue.id || "";
    const localPath = componentMatch
      ? `components[${componentIndex}]${componentMatch[2] ? `.${componentMatch[2]}` : ""}`
      : `contentPack.${issue.path || "pack"}`;
    issues.push({
      ...issue,
      id: componentId,
      componentId,
      path: localPath,
      severity: issue.severity || "warning",
    });
  });

  return {
    issues,
    summary: getIssueSummary(issues),
  };
}
