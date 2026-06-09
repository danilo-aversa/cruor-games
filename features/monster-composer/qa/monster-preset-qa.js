import { MONSTER_FAMILY_PRESETS } from "../data/monster-presets.js";
import { MONSTER_GRAFTS } from "../data/monster-grafts.js";
import { MONSTER_SOURCES } from "../data/monster-sources.js";
import { getCompatibilityStatus } from "../model/monster-composer.compatibility.js";
import { evaluateMonsterFrameFit } from "../model/monster-frame-fit.js";
import { validateMonsterGraftRules } from "../model/monster-graft-rules.schema.js";
import { hasSelectedSlot } from "../model/monster-composer.selection.js";
import { asArray, makeQaIssue, summarizeQaIssues } from "./monster-qa-report.js";
import { REQUIRED_PLAYABLE_SLOTS, buildExportArtifacts, buildPresetFrameContext } from "./monster-frame-builders.js";

const ARCHIVED_PROTOTYPE_SOURCE_IDS = new Set(["gashadokuro", "jack-the-ripper"]);
const BAD_EXPORT_PATTERNS = [/\bundefined\b/i, /\bnull\b/i, /\[object Object\]/i, /\{\{[^}]+\}\}/, /\{[a-z0-9_.:-]+\}/i];

function getPresetSelectionEntries(preset) {
  return Object.entries(preset.selection || {}).flatMap(([slotId, value]) =>
    asArray(value).map((graftId) => ({ slotId, graftId })),
  );
}


function validatePresetFrameFit({ preset, context, issues }) {
  context.selectedFeatures.forEach((feature) => {
    const frameFit = evaluateMonsterFrameFit(feature, {
      roleId: context.roleId,
      tacticalRoleId: context.tacticalRoleId,
      monsterTierId: context.monsterTierId,
      tempoProfileId: context.tempoProfileId,
      dangerId: context.dangerId,
      targetCr: context.targetCr,
    });
    if (!frameFit.hardBlock) return;
    issues.push(makeQaIssue({
      severity: "error",
      area: "frame-fit",
      check: "preset-frame-fit",
      id: preset.id,
      title: preset.label,
      path: `selection.${feature.slot}`,
      message: `${feature.title} does not fit this preset frame: ${frameFit.message}`,
      recommendation: "Change the preset frame, replace the graft, or relax the graft's explicit Frame Fit block.",
    }));
  });
}

function addExportPatternIssues({ preset, text, issues, path }) {
  BAD_EXPORT_PATTERNS.forEach((pattern) => {
    const match = String(text || "").match(pattern);
    if (match) {
      issues.push(makeQaIssue({
        severity: "error",
        area: "export",
        check: "unresolved-output",
        id: preset.id,
        title: preset.label,
        path,
        message: `Export output contains unresolved or invalid token: ${match[0]}`,
        recommendation: "Fix structured rules rendering or missing computed values before publishing this template.",
      }));
    }
  });
}

function validatePresetExport(preset, context, issues) {
  let artifacts;
  try {
    artifacts = buildExportArtifacts(context);
  } catch (error) {
    issues.push(makeQaIssue({
      severity: "error",
      area: "export",
      check: "build-export",
      id: preset.id,
      title: preset.label,
      message: `Preset export crashed: ${error.message}`,
      details: { stack: error.stack },
    }));
    return;
  }

  if (!artifacts.exportText?.trim()) {
    issues.push(makeQaIssue({ severity: "error", area: "export", check: "text", id: preset.id, title: preset.label, message: "Preset export text is empty." }));
  }
  addExportPatternIssues({ preset, text: artifacts.exportText, issues, path: "exportText" });

  try {
    const parsed = JSON.parse(artifacts.exportJson);
    if (!parsed.exportMeta?.schemaVersion) {
      issues.push(makeQaIssue({ severity: "error", area: "export", check: "json-schema", id: preset.id, title: preset.label, path: "exportJson.exportMeta.schemaVersion", message: "Export JSON has no schema version." }));
    }
    if (!parsed.sections?.actions?.length) {
      issues.push(makeQaIssue({ severity: "error", area: "export", check: "json-actions", id: preset.id, title: preset.label, path: "exportJson.sections.actions", message: "Export JSON has no action items." }));
    }
  } catch (error) {
    issues.push(makeQaIssue({ severity: "error", area: "export", check: "json-parse", id: preset.id, title: preset.label, message: `Export JSON is not parseable: ${error.message}` }));
  }

  const blockers = artifacts.exportReadiness?.blockers || [];
  blockers.forEach((blocker) => {
    issues.push(makeQaIssue({ severity: "error", area: "export-readiness", check: blocker.id, id: preset.id, title: preset.label, path: "exportReadiness", message: `Export readiness blocker: ${blocker.label}. ${blocker.detail}` }));
  });

  const reviews = artifacts.exportReadiness?.reviews || [];
  reviews.forEach((review) => {
    issues.push(makeQaIssue({ severity: "info", area: "export-readiness", check: review.id, id: preset.id, title: preset.label, path: "exportReadiness", message: `Export readiness review: ${review.label}. ${review.detail}` }));
  });

  if (!Array.isArray(artifacts.exportRunSheet) || artifacts.exportRunSheet.length < 3) {
    issues.push(makeQaIssue({ severity: "error", area: "run-mode", check: "export-run-sheet", id: preset.id, title: preset.label, message: "Export run sheet did not produce enough rows." }));
  }
  if (!artifacts.runModeSheet?.turnLoop?.length) {
    issues.push(makeQaIssue({ severity: "error", area: "run-mode", check: "turn-loop", id: preset.id, title: preset.label, message: "Run Mode turn loop is empty." }));
  }
  addExportPatternIssues({ preset, text: JSON.stringify(artifacts.runModeSheet), issues, path: "runModeSheet" });
}

export function runMonsterPresetQa({ presets = MONSTER_FAMILY_PRESETS, grafts = MONSTER_GRAFTS, sources = MONSTER_SOURCES } = {}) {
  const issues = [];
  const activeSourceIds = new Set(sources.map((source) => source.id));
  const graftById = new Map(grafts.map((graft) => [graft.id, graft]));

  presets.forEach((preset) => {
    if (!activeSourceIds.has(preset.source)) {
      issues.push(makeQaIssue({ severity: "error", area: "preset", check: "source", id: preset.id, title: preset.label, path: "source", message: `Preset references unknown source: ${preset.source}` }));
    }
    if (ARCHIVED_PROTOTYPE_SOURCE_IDS.has(preset.source)) {
      issues.push(makeQaIssue({ severity: "error", area: "preset", check: "archived-source", id: preset.id, title: preset.label, path: "source", message: `Preset uses archived source: ${preset.source}` }));
    }

    REQUIRED_PLAYABLE_SLOTS.forEach((slotId) => {
      if (!preset.selection?.[slotId]) {
        issues.push(makeQaIssue({ severity: "error", area: "preset", check: "required-slot", id: preset.id, title: preset.label, path: `selection.${slotId}`, message: `Preset is missing required ${slotId} slot.` }));
      }
    });

    getPresetSelectionEntries(preset).forEach(({ slotId, graftId }) => {
      const graft = graftById.get(graftId);
      if (!graft) {
        issues.push(makeQaIssue({ severity: "error", area: "preset", check: "missing-graft", id: preset.id, title: preset.label, path: `selection.${slotId}`, message: `Preset references missing graft: ${graftId}` }));
        return;
      }
      if (graft.slot !== slotId) {
        issues.push(makeQaIssue({ severity: "error", area: "preset", check: "slot-mismatch", id: preset.id, title: preset.label, path: `selection.${slotId}`, message: `Preset uses ${graftId} from slot ${graft.slot} in ${slotId}.` }));
      }
      if (graft.source !== preset.source) {
        issues.push(makeQaIssue({ severity: "warning", area: "preset", check: "cross-source-graft", id: preset.id, title: preset.label, path: `selection.${slotId}`, message: `Preset uses ${graftId} from source ${graft.source}, not ${preset.source}.` }));
      }
      if (graft.typeBias?.length && !graft.typeBias.includes(preset.typeId)) {
        issues.push(makeQaIssue({
          severity: "error",
          area: "preset",
          check: "type-bias",
          id: preset.id,
          title: preset.label,
          path: `selection.${slotId}`,
          message: `Preset uses ${graftId}, but its typeBias does not include ${preset.typeId}.`,
          recommendation: "Replace the graft, update the preset type, or correct the graft typeBias.",
        }));
      }
      if (graft.roleBias?.length && !graft.roleBias.includes(preset.roleId)) {
        issues.push(makeQaIssue({
          severity: "error",
          area: "preset",
          check: "role-bias",
          id: preset.id,
          title: preset.label,
          path: `selection.${slotId}`,
          message: `Preset uses ${graftId}, but its roleBias does not include ${preset.roleId}.`,
          recommendation: "Replace the graft, update the preset footprint, or correct the graft roleBias.",
        }));
      }
      validateMonsterGraftRules(graft).issues
        .filter((issue) => issue.severity === "error")
        .forEach((issue) => {
          issues.push(makeQaIssue({ severity: "error", area: "preset-rules", check: issue.code || "rules", id: preset.id, title: preset.label, path: `selection.${slotId}.${graftId}`, message: `${graft.title}: ${issue.message}` }));
        });
    });

    const context = buildPresetFrameContext(preset);
    context.selectedFeatures.forEach((feature) => {
      const status = getCompatibilityStatus(feature, context.selectedFeatures, context.typeId, context.category, { activePreset: preset });
      if (["missing", "incompatible"].includes(status.kind)) {
        issues.push(makeQaIssue({ severity: "error", area: "compatibility", check: status.kind, id: preset.id, title: preset.label, path: `selection.${feature.slot}`, message: `${feature.title}: ${status.message}`, details: status }));
      }
    });
    validatePresetFrameFit({ preset, context, issues });

    if (!hasSelectedSlot(context.selected, "attack") || !context.actions.length) {
      issues.push(makeQaIssue({ severity: "error", area: "preset", check: "export-action", id: preset.id, title: preset.label, message: "Preset has no exported action even though Attack is required." }));
    }

    validatePresetExport(preset, context, issues);
  });

  return {
    id: "monster-presets",
    label: "Monster Preset QA",
    summary: summarizeQaIssues(issues),
    issues,
    metrics: {
      presets: presets.length,
      sources: sources.length,
      grafts: grafts.length,
    },
  };
}
