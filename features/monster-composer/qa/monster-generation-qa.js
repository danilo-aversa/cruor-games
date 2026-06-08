import { getCompatibilityStatus } from "../model/monster-composer.compatibility.js";
import { hasSelectedSlot } from "../model/monster-composer.selection.js";
import { asArray, makeQaIssue, summarizeQaIssues } from "./monster-qa-report.js";
import {
  REQUIRED_PLAYABLE_SLOTS,
  buildCoreScratchFrames,
  buildExportArtifacts,
  buildMonsterFrameContext,
  forgeMonsterSelection,
} from "./monster-frame-builders.js";

const BAD_OUTPUT_PATTERNS = [/\bundefined\b/i, /\bnull\b/i, /\[object Object\]/i, /\{\{[^}]+\}\}/, /\{[a-z0-9_.:-]+\}/i];

function addBadOutputIssues(frame, text, issues, path) {
  BAD_OUTPUT_PATTERNS.forEach((pattern) => {
    const match = String(text || "").match(pattern);
    if (match) {
      issues.push(makeQaIssue({
        severity: "error",
        area: "forge-export",
        check: "unresolved-output",
        id: frame.id,
        title: frame.id,
        path,
        message: `Generated export contains unresolved or invalid token: ${match[0]}`,
      }));
    }
  });
}

export function runMonsterGenerationQa({ frames = buildCoreScratchFrames() } = {}) {
  const issues = [];
  const frameResults = [];

  asArray(frames).forEach((frame) => {
    const selection = forgeMonsterSelection(frame);
    const context = buildMonsterFrameContext({ ...frame, selection });
    frameResults.push({ frameId: frame.id, selected: selection, selectedFeatureIds: context.selectedFeatures.map((feature) => feature.id) });

    REQUIRED_PLAYABLE_SLOTS.forEach((slotId) => {
      if (!hasSelectedSlot(context.selected, slotId)) {
        issues.push(makeQaIssue({ severity: "error", area: "forge", check: "required-slot", id: frame.id, title: frame.id, path: `selection.${slotId}`, message: `Forge did not select required ${slotId} slot.` }));
      }
    });

    context.selectedFeatures.forEach((feature) => {
      const status = getCompatibilityStatus(feature, context.selectedFeatures, context.typeId, context.category, { activePreset: null });
      if (["missing", "incompatible"].includes(status.kind)) {
        issues.push(makeQaIssue({ severity: "error", area: "forge-compatibility", check: status.kind, id: frame.id, title: frame.id, path: `selection.${feature.slot}`, message: `${feature.title}: ${status.message}`, details: status }));
      }
    });

    let artifacts = null;
    try {
      artifacts = buildExportArtifacts(context);
    } catch (error) {
      issues.push(makeQaIssue({ severity: "error", area: "forge-export", check: "crash", id: frame.id, title: frame.id, message: `Forge export crashed: ${error.message}`, details: { stack: error.stack } }));
      return;
    }

    const blockers = artifacts.exportReadiness?.blockers || [];
    blockers.forEach((blocker) => {
      issues.push(makeQaIssue({ severity: "error", area: "forge-readiness", check: blocker.id, id: frame.id, title: frame.id, path: "exportReadiness", message: `Forge readiness blocker: ${blocker.label}. ${blocker.detail}` }));
    });

    if (!artifacts.runModeSheet?.turnLoop?.length) {
      issues.push(makeQaIssue({ severity: "error", area: "forge-run-mode", check: "turn-loop", id: frame.id, title: frame.id, message: "Forged monster has no Run Mode turn loop." }));
    }

    try {
      JSON.parse(artifacts.exportJson);
    } catch (error) {
      issues.push(makeQaIssue({ severity: "error", area: "forge-export", check: "json-parse", id: frame.id, title: frame.id, message: `Forged monster export JSON is invalid: ${error.message}` }));
    }

    addBadOutputIssues(frame, artifacts.exportText, issues, "exportText");
    addBadOutputIssues(frame, JSON.stringify(artifacts.runModeSheet), issues, "runModeSheet");
  });

  return {
    id: "monster-generation",
    label: "Monster Generation QA",
    summary: summarizeQaIssues(issues),
    issues,
    metrics: {
      frames: asArray(frames).length,
      frameResults,
    },
  };
}
