import { getCompatibilityStatus } from "../model/monster-composer.compatibility.js";
import { evaluateMonsterFrameFit } from "../model/monster-frame-fit.js";
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


function addScalingIssue(issues, { id, leftLabel, rightLabel, metric, left, right, relation = ">", path = `computed.${metric}` }) {
  const passed = relation === ">=" ? left >= right : left > right;
  if (passed) return;
  issues.push(makeQaIssue({
    severity: "error",
    area: "frame-scaling",
    check: metric,
    id,
    title: id,
    path,
    message: `${leftLabel} ${metric} should be ${relation} ${rightLabel} ${metric}, but got ${left} vs ${right}.`,
    recommendation: "Check Monster Frame multipliers, baseline scaling, or selector wiring.",
    details: { leftLabel, rightLabel, metric, left, right, relation },
  }));
}

function buildScalingContext(overrides = {}) {
  return buildMonsterFrameContext({
    typeId: "undead",
    category: "Zombie",
    sourceId: "decomposition",
    roleId: "standard",
    targetCr: 5,
    tacticalRoleId: "brute",
    monsterTierId: "normal",
    tempoProfileId: "standard",
    dangerId: "standard",
    selection: {},
    ...overrides,
  });
}


function getSelectedAttackId(selection = {}) {
  const value = selection.attack;
  return Array.isArray(value) ? value[0] : value;
}

export function runMonsterFrameFitDiversityQa() {
  const issues = [];
  const groups = [
    {
      id: "decomposition-tactical-diversity",
      frames: [
        { typeId: "undead", category: "Zombie", roleId: "standard", sourceId: "decomposition", targetCr: 5, tacticalRoleId: "brute", monsterTierId: "normal", tempoProfileId: "slow", dangerId: "hard" },
        { typeId: "undead", category: "Zombie", roleId: "standard", sourceId: "decomposition", targetCr: 5, tacticalRoleId: "controller", monsterTierId: "elite", tempoProfileId: "standard", dangerId: "horror" },
      ],
    },
    {
      id: "wolf-spiders-footprint-diversity",
      frames: [
        { typeId: "beast", category: "Spider", roleId: "standard", sourceId: "wolf-spiders", targetCr: 5, tacticalRoleId: "lurker", monsterTierId: "normal", tempoProfileId: "ambusher", dangerId: "hard" },
        { typeId: "beast", category: "Spider", roleId: "boss", sourceId: "wolf-spiders", targetCr: 7, tacticalRoleId: "controller", monsterTierId: "boss", tempoProfileId: "fast", dangerId: "horror" },
      ],
    },
    {
      id: "jikininki-tactical-diversity",
      frames: [
        { typeId: "undead", category: "Spirit", roleId: "standard", sourceId: "jikininki", targetCr: 6, tacticalRoleId: "lurker", monsterTierId: "normal", tempoProfileId: "ambusher", dangerId: "hard" },
        { typeId: "undead", category: "Spirit", roleId: "boss", sourceId: "jikininki", targetCr: 9, tacticalRoleId: "controller", monsterTierId: "boss", tempoProfileId: "fast", dangerId: "horror" },
      ],
    },
  ];

  const results = groups.map((group) => {
    const frames = group.frames.map((frame, index) => {
      const selection = forgeMonsterSelection(frame);
      return {
        id: `${group.id}-${index + 1}`,
        frame,
        selection,
        attackId: getSelectedAttackId(selection),
      };
    });
    const uniqueAttacks = new Set(frames.map((frame) => frame.attackId).filter(Boolean));
    if (uniqueAttacks.size < 2) {
      issues.push(makeQaIssue({
        severity: "error",
        area: "frame-fit-diversity",
        check: "attack-selection-diversity",
        id: group.id,
        title: group.id,
        path: "selection.attack",
        message: "Frame Fit did not produce different Attack grafts across distinct tactical frames.",
        recommendation: "Adjust graft Frame Fit recommendations or Forge ranking so selector changes produce meaningful graft differences.",
        details: { frames },
      }));
    }
    return { groupId: group.id, frames, uniqueAttackCount: uniqueAttacks.size };
  });

  return {
    id: "monster-frame-fit-diversity",
    label: "Monster Frame Fit Diversity QA",
    summary: summarizeQaIssues(issues),
    issues,
    metrics: {
      groups: groups.length,
      results,
    },
  };
}

export function runMonsterFrameScalingQa() {
  const issues = [];
  const roleMinion = buildScalingContext({ roleId: "minion" });
  const roleStandard = buildScalingContext({ roleId: "standard" });
  const roleBoss = buildScalingContext({ roleId: "boss" });

  addScalingIssue(issues, { id: "encounter-footprint-scaling", leftLabel: "Standard", rightLabel: "Minion", metric: "hpMult", left: roleStandard.computed.framePowerProfile.hpMult, right: roleMinion.computed.framePowerProfile.hpMult, path: "computed.framePowerProfile.hpMult" });
  addScalingIssue(issues, { id: "encounter-footprint-scaling", leftLabel: "Boss", rightLabel: "Standard", metric: "hpMult", left: roleBoss.computed.framePowerProfile.hpMult, right: roleStandard.computed.framePowerProfile.hpMult, path: "computed.framePowerProfile.hpMult" });
  addScalingIssue(issues, { id: "encounter-footprint-scaling", leftLabel: "Standard", rightLabel: "Minion", metric: "dprMult", left: roleStandard.computed.framePowerProfile.dprMult, right: roleMinion.computed.framePowerProfile.dprMult, path: "computed.framePowerProfile.dprMult" });
  addScalingIssue(issues, { id: "encounter-footprint-scaling", leftLabel: "Boss", rightLabel: "Standard", metric: "dprMult", left: roleBoss.computed.framePowerProfile.dprMult, right: roleStandard.computed.framePowerProfile.dprMult, path: "computed.framePowerProfile.dprMult" });
  addScalingIssue(issues, { id: "encounter-footprint-scaling", leftLabel: "Boss", rightLabel: "Standard", metric: "budget", left: roleBoss.computed.budget, right: roleStandard.computed.budget });

  const cr3 = buildScalingContext({ targetCr: 3 });
  const cr8 = buildScalingContext({ targetCr: 8 });
  addScalingIssue(issues, { id: "target-cr-scaling", leftLabel: "CR 8", rightLabel: "CR 3", metric: "hp", left: cr8.computed.hp, right: cr3.computed.hp });
  addScalingIssue(issues, { id: "target-cr-scaling", leftLabel: "CR 8", rightLabel: "CR 3", metric: "dpr", left: cr8.computed.dpr, right: cr3.computed.dpr });
  addScalingIssue(issues, { id: "target-cr-scaling", leftLabel: "CR 8", rightLabel: "CR 3", metric: "attack", left: cr8.computed.attack, right: cr3.computed.attack });
  addScalingIssue(issues, { id: "target-cr-scaling", leftLabel: "CR 8", rightLabel: "CR 3", metric: "dc", left: cr8.computed.dc, right: cr3.computed.dc });

  const brute = buildScalingContext({ tacticalRoleId: "brute" });
  const controller = buildScalingContext({ tacticalRoleId: "controller" });
  const support = buildScalingContext({ tacticalRoleId: "support" });
  const artillery = buildScalingContext({ tacticalRoleId: "artillery" });
  const lurker = buildScalingContext({ tacticalRoleId: "lurker" });
  addScalingIssue(issues, { id: "tactical-role-scaling", leftLabel: "Brute", rightLabel: "Lurker", metric: "hpMult", left: brute.computed.framePowerProfile.hpMult, right: lurker.computed.framePowerProfile.hpMult, path: "computed.framePowerProfile.hpMult" });
  addScalingIssue(issues, { id: "tactical-role-scaling", leftLabel: "Controller", rightLabel: "Brute", metric: "dcMod", left: controller.computed.framePowerProfile.dcMod, right: brute.computed.framePowerProfile.dcMod, path: "computed.framePowerProfile.dcMod" });
  addScalingIssue(issues, { id: "tactical-role-scaling", leftLabel: "Artillery", rightLabel: "Support", metric: "dprMult", left: artillery.computed.framePowerProfile.dprMult, right: support.computed.framePowerProfile.dprMult, path: "computed.framePowerProfile.dprMult" });

  const normalTier = buildScalingContext({ monsterTierId: "normal" });
  const bossTier = buildScalingContext({ monsterTierId: "boss" });
  addScalingIssue(issues, { id: "monster-tier-scaling", leftLabel: "Boss Tier", rightLabel: "Normal Tier", metric: "hpMult", left: bossTier.computed.framePowerProfile.hpMult, right: normalTier.computed.framePowerProfile.hpMult, path: "computed.framePowerProfile.hpMult" });
  addScalingIssue(issues, { id: "monster-tier-scaling", leftLabel: "Boss Tier", rightLabel: "Normal Tier", metric: "budget", left: bossTier.computed.budget, right: normalTier.computed.budget });
  addScalingIssue(issues, { id: "monster-tier-scaling", leftLabel: "Boss Tier", rightLabel: "Normal Tier", metric: "complexityCap", left: bossTier.computed.complexityCap, right: normalTier.computed.complexityCap });

  const slow = buildScalingContext({ tempoProfileId: "slow" });
  const ambusher = buildScalingContext({ tempoProfileId: "ambusher" });
  addScalingIssue(issues, { id: "tempo-scaling", leftLabel: "Ambusher", rightLabel: "Slow", metric: "dprMult", left: ambusher.computed.framePowerProfile.dprMult, right: slow.computed.framePowerProfile.dprMult, path: "computed.framePowerProfile.dprMult" });
  addScalingIssue(issues, { id: "tempo-scaling", leftLabel: "Ambusher", rightLabel: "Slow", metric: "attackMod", left: ambusher.computed.framePowerProfile.attackMod, right: slow.computed.framePowerProfile.attackMod, path: "computed.framePowerProfile.attackMod" });
  addScalingIssue(issues, { id: "tempo-scaling", leftLabel: "Ambusher", rightLabel: "Slow", metric: "budget", left: ambusher.computed.budget, right: slow.computed.budget });
  addScalingIssue(issues, { id: "tempo-scaling", leftLabel: "Ambusher", rightLabel: "Slow", metric: "initiativeMod", left: ambusher.computed.printedStats.initiativeMod, right: slow.computed.printedStats.initiativeMod });

  const standardDanger = buildScalingContext({ dangerId: "standard" });
  const horrorDanger = buildScalingContext({ dangerId: "horror" });
  addScalingIssue(issues, { id: "danger-scaling", leftLabel: "Horror", rightLabel: "Standard Danger", metric: "dprMult", left: horrorDanger.computed.framePowerProfile.dprMult, right: standardDanger.computed.framePowerProfile.dprMult, path: "computed.framePowerProfile.dprMult" });
  addScalingIssue(issues, { id: "danger-scaling", leftLabel: "Horror", rightLabel: "Standard Danger", metric: "budget", left: horrorDanger.computed.budget, right: standardDanger.computed.budget });

  return {
    id: "monster-frame-scaling",
    label: "Monster Frame Scaling QA",
    summary: summarizeQaIssues(issues),
    issues,
    metrics: {
      checks: 21,
      sampleFrames: {
        minion: roleMinion.computed.printedStats,
        standard: roleStandard.computed.printedStats,
        boss: roleBoss.computed.printedStats,
        cr3: cr3.computed.printedStats,
        cr8: cr8.computed.printedStats,
        slow: slow.computed.printedStats,
        ambusher: ambusher.computed.printedStats,
      },
    },
  };
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

      const frameFit = evaluateMonsterFrameFit(feature, {
        roleId: context.roleId,
        tacticalRoleId: context.tacticalRoleId,
        monsterTierId: context.monsterTierId,
        tempoProfileId: context.tempoProfileId,
        dangerId: context.dangerId,
        targetCr: context.targetCr,
      });
      if (frameFit.hardBlock) {
        issues.push(makeQaIssue({
          severity: "error",
          area: "forge-frame-fit",
          check: "frame-fit",
          id: frame.id,
          title: frame.id,
          path: `selection.${feature.slot}`,
          message: `${feature.title} does not fit forged frame: ${frameFit.message}`,
        }));
      }
    });

    let artifacts;
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
