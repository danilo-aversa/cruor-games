import {
  ALL_MONSTER_GRAFTS,
  ALL_MONSTER_SOURCES,
  MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT,
} from "../data/monster-content-pack-feed.js";
import { MONSTER_GRAFT_SOURCE_AUTHORITY_MODES } from "../data/monster-graft-source-authority.js";
import { SLOTS } from "../monster-composer.workflow.js";
import { validateMonsterGraftRules } from "../model/monster-graft-rules.schema.js";
import {
  isMonsterGraftV2,
  validateMonsterGraftV2,
} from "../model/monster-graft-v2.schema.js";
import {
  KNOWN_MONSTER_ANATOMY_TAGS,
  KNOWN_MONSTER_BODY_PLAN_IDS,
  KNOWN_MONSTER_CREATURE_TAGS,
  KNOWN_MONSTER_FAMILY_IDS,
  MONSTER_ANATOMY_CONSTRAINT_FIELDS,
  MONSTER_ANATOMY_GRANT_FIELDS,
  normalizeMonsterAnatomyConstraints,
  normalizeMonsterAnatomyGrants,
} from "../model/anatomy.js";
import {
  MONSTER_FRAME_FIT_VALUES,
  normalizeMonsterFrameFit,
  validateMonsterFrameFit,
} from "../model/monster-frame-fit.js";
import { asArray, makeQaIssue, summarizeQaIssues } from "./monster-qa-report.js";

const ARCHIVED_PROTOTYPE_SOURCE_IDS = new Set(["gashadokuro", "jack-the-ripper"]);
const KNOWN_RULE_SECTIONS = new Set(["trait", "action", "bonusAction", "reaction", "legendaryAction", "lairAction", "death"]);
const KNOWN_ACTION_ECONOMY = new Set(["passive", "action", "bonusAction", "reaction", "legendaryAction", "lairAction", "deathTrigger", "freeTrigger"]);
const KNOWN_RESOLUTION_TYPES = new Set(["none", "attackRoll", "savingThrow", "automatic", "special"]);

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getDuplicates(values = []) {
  const seen = new Set();
  const duplicates = new Set();
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });
  return [...duplicates];
}

function hasAnyText(...values) {
  return values.some(hasText);
}

function getKnownAnatomyTerms() {
  return new Set([
    ...KNOWN_MONSTER_ANATOMY_TAGS,
    ...KNOWN_MONSTER_CREATURE_TAGS,
    ...KNOWN_MONSTER_BODY_PLAN_IDS,
    ...KNOWN_MONSTER_FAMILY_IDS,
  ]);
}

function validateAnatomyTerms({ graft, issues }) {
  const knownTerms = getKnownAnatomyTerms();
  const constraints = normalizeMonsterAnatomyConstraints(graft.constraints || graft.anatomyConstraints);
  const grants = normalizeMonsterAnatomyGrants(graft.anatomyGrants);

  MONSTER_ANATOMY_CONSTRAINT_FIELDS.forEach((field) => {
    asArray(constraints?.[field]).forEach((term) => {
      if (term.startsWith("type:") || term.startsWith("family:") || term.startsWith("body:")) return;
      if (!knownTerms.has(term)) {
        issues.push(makeQaIssue({
          severity: "warning",
          area: "anatomy",
          check: "known-constraint-term",
          id: graft.id,
          title: graft.title,
          path: `constraints.${field}`,
          message: `Unknown anatomy constraint term: ${term}`,
          recommendation: "Add the term to the anatomy vocabulary or correct the graft constraint.",
        }));
      }
    });
  });

  MONSTER_ANATOMY_GRANT_FIELDS.forEach((field) => {
    asArray(grants?.[field]).forEach((term) => {
      if (field === "grantsTokens") return;
      if (!knownTerms.has(term)) {
        issues.push(makeQaIssue({
          severity: "warning",
          area: "anatomy",
          check: "known-grant-term",
          id: graft.id,
          title: graft.title,
          path: `anatomyGrants.${field}`,
          message: `Unknown anatomy grant term: ${term}`,
          recommendation: "Add the term to the anatomy vocabulary or correct the graft grant.",
        }));
      }
    });
  });
}


function validateGraftV2Semantics(graft, issues) {
  const report = validateMonsterGraftV2(graft);
  if (!report.applicable) return report;
  report.issues.forEach((issue) => {
    issues.push(
      makeQaIssue({
        severity: issue.severity,
        area: "graft-v2",
        check: issue.code || "schema",
        id: graft.id,
        title: graft.title,
        path: issue.path || "graft",
        message: issue.message,
        recommendation:
          "Fix the Graft v2 bundle contract before enabling registry-canonical authority.",
        details: issue,
      }),
    );
  });
  return report;
}

function validateRulesSemantics(graft, issues) {
  const report = validateMonsterGraftRules(graft);
  report.issues.forEach((issue) => {
    issues.push(makeQaIssue({
      severity: issue.severity,
      area: "rules",
      check: issue.code || "schema",
      id: graft.id,
      title: graft.title,
      path: issue.path || "rules",
      message: issue.message,
      recommendation: "Fix the structured monster.rules object before publishing or exporting this graft.",
      details: issue,
    }));
  });

  const rules = graft.rules;
  if (!rules) return;

  if (!KNOWN_RULE_SECTIONS.has(rules.section)) {
    issues.push(makeQaIssue({ severity: "error", area: "rules", check: "section", id: graft.id, title: graft.title, path: "rules.section", message: `Unknown rules section: ${rules.section}` }));
  }
  if (!KNOWN_ACTION_ECONOMY.has(rules.actionEconomy)) {
    issues.push(makeQaIssue({ severity: "error", area: "rules", check: "action-economy", id: graft.id, title: graft.title, path: "rules.actionEconomy", message: `Unknown action economy: ${rules.actionEconomy}` }));
  }
  if (rules.resolution?.type && !KNOWN_RESOLUTION_TYPES.has(rules.resolution.type)) {
    issues.push(makeQaIssue({ severity: "error", area: "rules", check: "resolution", id: graft.id, title: graft.title, path: "rules.resolution.type", message: `Unknown resolution type: ${rules.resolution.type}` }));
  }
  if (rules.actionEconomy === "reaction" && !hasAnyText(rules.trigger, rules.reaction?.trigger, rules.counterplay?.telegraph)) {
    issues.push(makeQaIssue({ severity: "warning", area: "rules", check: "reaction-trigger", id: graft.id, title: graft.title, path: "rules.trigger", message: "Reaction graft has no clear trigger text.", recommendation: "Add a trigger, reaction.trigger, or explicit telegraph/counterplay text." }));
  }
  if (rules.usage?.type === "recharge" && !hasText(rules.usage?.value)) {
    issues.push(makeQaIssue({ severity: "error", area: "rules", check: "recharge-value", id: graft.id, title: graft.title, path: "rules.usage.value", message: "Recharge graft has no recharge value." }));
  }
  if (rules.resolution?.type === "savingThrow" && !hasText(rules.resolution?.ability)) {
    issues.push(makeQaIssue({ severity: "error", area: "rules", check: "save-ability", id: graft.id, title: graft.title, path: "rules.resolution.ability", message: "Saving Throw rule has no save ability." }));
  }
  if (rules.damage?.mode && rules.damage.mode !== "none" && !hasAnyText(rules.damage.type, rules.damage.damageType) && !asArray(rules.damage.types).length) {
    issues.push(makeQaIssue({ severity: "warning", area: "rules", check: "damage-type", id: graft.id, title: graft.title, path: "rules.damage.type", message: "Damaging rule has no explicit damage type." }));
  }
  if (["major", "severe"].includes(rules.condition?.severity) && !rules.condition?.duration && !rules.condition?.escape?.enabled && !rules.condition?.repeatSave?.enabled) {
    issues.push(makeQaIssue({ severity: "warning", area: "counterplay", check: "hard-condition-exit", id: graft.id, title: graft.title, path: "rules.condition", message: "Major/severe condition has no duration, escape, or repeat save.", recommendation: "Add a duration, escape check, repeat save, or clear break condition." }));
  }
}


function validateSourceAuthorityBoundary(audit, issues) {
  asArray(audit?.rows).forEach((row) => {
    if (row.sourceMismatch) {
      issues.push(
        makeQaIssue({
          severity: "error",
          area: "source-authority",
          check: "source-anchor-mismatch",
          id: row.id,
          path: "sourceAnchors",
          message: `Native and registry representations disagree on the Source Anchor for ${row.id}: ${row.nativeSourceId} vs ${row.registrySourceId}.`,
          recommendation:
            "Correct the registry component provenance before continuing the source migration.",
          details: row,
        }),
      );
    }

    if (
      row.authorityMode ===
        MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.REGISTRY_CANONICAL &&
      (row.selectedOrigin !== "registry" || row.fallbackUsed)
    ) {
      issues.push(
        makeQaIssue({
          severity: "error",
          area: "source-authority",
          check: "canonical-source-fallback",
          id: row.id,
          path: "authoring",
          message: `Canonical registry source ${row.sourceId} did not resolve ${row.id} from an explicitly canonical component.`,
          recommendation:
            "Complete and mark the registry component canonical before switching the source authority manifest.",
          details: row,
        }),
      );
    }

    if (
      row.authorityMode ===
        MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.REGISTRY_SHADOW &&
      !row.registryAvailable
    ) {
      issues.push(
        makeQaIssue({
          severity: "warning",
          area: "source-authority",
          check: "shadow-coverage",
          id: row.id,
          path: "registry",
          message: `Shadow-migration source ${row.sourceId} has no registry representation for ${row.id}.`,
          recommendation:
            "Add the canonical shared component before requesting a source cutover.",
          details: row,
        }),
      );
    }

    if (
      row.authorityMode ===
        MONSTER_GRAFT_SOURCE_AUTHORITY_MODES.NATIVE_LEGACY &&
      !row.nativeAvailable
    ) {
      issues.push(
        makeQaIssue({
          severity: "warning",
          area: "source-authority",
          check: "native-coverage",
          id: row.id,
          path: "native",
          message: `Native-authoritative source ${row.sourceId} resolved registry-only graft ${row.id}.`,
          recommendation:
            "Register the source for shadow/canonical migration or restore the native compatibility entry.",
          details: row,
        }),
      );
    }
  });
}

function validateFrameFit(graft, issues) {
  const report = validateMonsterFrameFit(graft.fit || graft.monster?.fit || null, {
    id: graft.id,
    title: graft.title,
  });
  report.issues.forEach((issue) => {
    issues.push(makeQaIssue({
      severity: issue.severity || "error",
      area: issue.area || "frame-fit",
      check: issue.check || "frame-fit",
      id: graft.id,
      title: graft.title,
      path: issue.path || "fit",
      message: issue.message,
      recommendation: issue.recommendation || "Fix the graft Frame Fit block before publishing.",
    }));
  });

  const fit = normalizeMonsterFrameFit(graft.fit || graft.monster?.fit || null);
  if (!fit) return;

  Object.entries(MONSTER_FRAME_FIT_VALUES).forEach(([dimension, knownValues]) => {
    const value = fit[dimension];
    if (!value) return;
    ["allowed", "recommended", "forbidden"].forEach((field) => {
      asArray(value[field]).forEach((entry) => {
        if (!knownValues.includes(entry)) {
          issues.push(makeQaIssue({
            severity: "error",
            area: "frame-fit",
            check: "unknown-frame-value",
            id: graft.id,
            title: graft.title,
            path: `fit.${dimension}.${field}`,
            message: `Unknown Frame Fit value: ${entry}`,
            recommendation: "Use a known Monster Composer selector value.",
          }));
        }
      });
    });
  });
}

export function runMonsterContentQa({ grafts = ALL_MONSTER_GRAFTS, sources = ALL_MONSTER_SOURCES, slots = SLOTS } = {}) {
  const issues = [];
  const sourceIds = new Set(sources.map((source) => source.id));
  const slotIds = new Set(slots.map((slot) => slot.id));

  getDuplicates(grafts.map((graft) => graft.id)).forEach((id) => {
    issues.push(makeQaIssue({ severity: "error", area: "content", check: "duplicate-graft-id", id, message: `Duplicate monster graft id: ${id}` }));
  });

  getDuplicates(sources.map((source) => source.id)).forEach((id) => {
    issues.push(makeQaIssue({ severity: "error", area: "content", check: "duplicate-source-id", id, message: `Duplicate monster source id: ${id}` }));
  });

  sources.forEach((source) => {
    if (ARCHIVED_PROTOTYPE_SOURCE_IDS.has(source.id)) {
      issues.push(makeQaIssue({ severity: "error", area: "content", check: "archived-source", id: source.id, title: source.label, message: `Archived prototype source is still active: ${source.id}` }));
    }
  });

  validateSourceAuthorityBoundary(MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT, issues);

  grafts.forEach((graft) => {
    if (!hasText(graft.id)) issues.push(makeQaIssue({ severity: "error", area: "content", check: "id", title: graft.title, message: "Monster graft has no id." }));
    if (!hasText(graft.title)) issues.push(makeQaIssue({ severity: "error", area: "content", check: "title", id: graft.id, message: "Monster graft has no title." }));
    if (!slotIds.has(graft.slot)) {
      issues.push(makeQaIssue({ severity: "error", area: "content", check: "slot", id: graft.id, title: graft.title, path: "slot", message: `Unknown graft slot: ${graft.slot}` }));
    }
    if (!sourceIds.has(graft.source)) {
      issues.push(makeQaIssue({ severity: "error", area: "content", check: "source", id: graft.id, title: graft.title, path: "source", message: `Unknown graft source: ${graft.source}` }));
    }
    if (ARCHIVED_PROTOTYPE_SOURCE_IDS.has(graft.source)) {
      issues.push(makeQaIssue({ severity: "error", area: "content", check: "archived-graft-source", id: graft.id, title: graft.title, path: "source", message: `Graft uses archived prototype source: ${graft.source}` }));
    }
    if (!hasAnyText(graft.summary, graft.mechanics, graft.counterplay)) {
      issues.push(makeQaIssue({ severity: "warning", area: "content", check: "playable-text", id: graft.id, title: graft.title, message: "Monster graft has no summary, mechanics, or counterplay text." }));
    }
    const graftV2 = isMonsterGraftV2(graft);
    if (!graftV2 && (!graft.rules || graft.rules?.migration?.isStructured !== true)) {
      issues.push(makeQaIssue({ severity: "error", area: "rules", check: "structured-rules", id: graft.id, title: graft.title, path: "rules", message: "Monster graft is not authored as explicit structured rules." }));
    }
    if (!normalizeMonsterFrameFit(graft.fit || graft.monster?.fit || null)) {
      issues.push(makeQaIssue({
        severity: "error",
        area: "frame-fit",
        check: "explicit-frame-fit",
        id: graft.id,
        title: graft.title,
        path: "fit",
        message: "Monster graft has no explicit Frame Fit block.",
        recommendation: "Author encounter footprint, tactical role, CR, tier, tempo, and danger guidance for this graft.",
      }));
    }

    if (graftV2) {
      validateGraftV2Semantics(graft, issues);
    } else {
      validateRulesSemantics(graft, issues);
    }
    validateFrameFit(graft, issues);
    validateAnatomyTerms({ graft, issues });
  });

  return {
    id: "monster-content",
    label: "Monster Content QA",
    summary: summarizeQaIssues(issues),
    issues,
    metrics: {
      sources: sources.length,
      grafts: grafts.length,
      slots: slots.length,
      graftSchema: {
        legacy: grafts.filter((graft) => !isMonsterGraftV2(graft)).length,
        v2: grafts.filter((graft) => isMonsterGraftV2(graft)).length,
      },
      sourceBoundary: {
        selectedNative: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.selectedNative,
        selectedRegistry: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.selectedRegistry,
        fallbacks: MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.fallbacks,
        canonicalRegistryEntries:
          MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.canonicalRegistryEntries,
        sourceMismatches:
          MONSTER_GRAFT_SOURCE_BOUNDARY_AUDIT.sourceMismatches,
      },
    },
  };
}
