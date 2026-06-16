export const MONSTER_CR_FITTING_VERSION = "control-aware-cr-fitting-v1.28";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(Number(value || 0));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function buildDiagnostic(severity, code, message, detail = "", data = {}) {
  return { severity, code, message, detail, data };
}

function isMinionRole(roleId) {
  return String(roleId || "standard") === "minion";
}

function getLowerBoundAuthority({ roleId, targetCr = 0, baseline = {}, initialHpTarget = 0, initialDprTarget = 0 } = {}) {
  const cr = Number(targetCr || 0);
  const minion = isMinionRole(roleId);
  const suppressedHp = Number(baseline?.hp || 0) > 0 && Number(initialHpTarget || 0) < Number(baseline.hp || 0) * 0.8;
  const suppressedDpr = Number(baseline?.dpr || 0) > 0 && Number(initialDprTarget || 0) < Number(baseline.dpr || 0) * 0.9;
  return Boolean((minion && cr >= 5) || (cr >= 8 && (suppressedHp || suppressedDpr)));
}

function buildTargetCeilings({ baseline = {}, initialHpTarget = 1, initialDprTarget = 1, lowerBoundAuthority = false } = {}) {
  const baselineHp = Math.max(1, round(baseline?.hp || initialHpTarget || 1));
  const baselineDpr = Math.max(1, round(baseline?.dpr || initialDprTarget || 1));
  const hpMultiplierCeiling = lowerBoundAuthority ? 2.4 : 1.4;
  const dprMultiplierCeiling = lowerBoundAuthority ? 2.05 : 1.35;
  const hpBaselineCeiling = lowerBoundAuthority ? baselineHp * 1.15 : 0;
  const dprBaselineCeiling = lowerBoundAuthority ? baselineDpr * 1.15 : 0;
  return {
    maxHpTarget: Math.max(1, round(Math.max(initialHpTarget * hpMultiplierCeiling, hpBaselineCeiling))),
    maxDprTarget: Math.max(1, round(Math.max(initialDprTarget * dprMultiplierCeiling, dprBaselineCeiling))),
  };
}

function getCrDelta(validation = {}, targetCr = 0) {
  const estimatedCr = Number(validation.estimatedCr ?? targetCr ?? 0);
  return estimatedCr - Number(targetCr || 0);
}

function getOffensiveDelta(validation = {}, targetCr = 0) {
  return Number(validation.offensive?.cr ?? validation.estimatedCr ?? targetCr ?? 0) - Number(targetCr || 0);
}

function getDefensiveDelta(validation = {}, targetCr = 0) {
  return Number(validation.defensive?.cr ?? validation.estimatedCr ?? targetCr ?? 0) - Number(targetCr || 0);
}

function buildScaleForDelta(delta, {
  downStep = 0.1,
  downMax = 0.42,
  downFloor = 0.5,
  upStep = 0.05,
  upMax = 0.22,
  upCeiling = 1.28,
} = {}) {
  const numeric = Number(delta || 0);
  if (numeric >= 2) return clamp(1 - Math.min(downMax, numeric * downStep), downFloor, 1);
  if (numeric <= -2) return clamp(1 + Math.min(upMax, Math.abs(numeric) * upStep), 1, upCeiling);
  return 1;
}

function hasMeaningfulTargetChange(current, next) {
  return Math.abs(Number(current || 0) - Number(next || 0)) >= 1;
}

function summarizePass({ index, hpTarget, dprTarget, saveDcTarget = null, result }) {
  const validation = result?.crValidation || {};
  return {
    pass: index,
    hpTarget: round(hpTarget),
    dprTarget: round(dprTarget),
    saveDcTarget: saveDcTarget == null ? undefined : round(saveDcTarget),
    printedHp: result?.printedStats?.hp,
    printedDpr: result?.printedStats?.dpr,
    printedSaveDc: result?.printedStats?.saveDc,
    effectiveHp: result?.effectiveProfile?.effectiveHp,
    effectiveDpr3Round: result?.effectiveProfile?.effectiveDpr3Round,
    defensiveCr: validation.defensive?.cr,
    offensiveCr: validation.offensive?.cr,
    estimatedCr: validation.estimatedCr,
    deltaFromTarget: validation.deltaFromTarget,
    status: validation.status,
  };
}

function classifyAdjustment({ hpScale, dprScale, saveDcDelta = 0 }) {
  const parts = [];
  if (hpScale < 1) parts.push("reduced-hp");
  if (hpScale > 1) parts.push("raised-hp");
  if (dprScale < 1) parts.push("reduced-dpr");
  if (dprScale > 1) parts.push("raised-dpr");
  if (saveDcDelta < 0) parts.push("reduced-save-dc");
  if (saveDcDelta > 0) parts.push("raised-save-dc");
  return parts.length ? parts.join("-") : "none";
}

function getConditionProfile(result = {}) {
  return result?.effectiveProfile?.conditionProfile || {};
}

function isLowCrHardControlProfile(result = {}, targetCr = 0) {
  const profile = getConditionProfile(result);
  const cr = Number(targetCr || 0);
  if (cr > 3) return false;
  return Boolean(
    Number(profile.repeatedHardControlCount || 0) >= 1 ||
      Number(profile.majorCount || 0) >= 2 ||
      Number(profile.crAdjustment || 0) >= 1 ||
      Number(profile.controlPressure || 0) >= 2.5
  );
}

function getHardControlResponsibleSources(result = {}) {
  return asArray(getConditionProfile(result).sources)
    .filter((source) => ["major", "severe"].includes(String(source.severity || "").toLowerCase()))
    .map((source) => ({
      title: source.title,
      condition: source.condition,
      pressure: source.pressure,
      frequencyMultiplier: source.frequencyMultiplier,
      expectedTargets: source.expectedTargets,
    }));
}

function buildSingleCrProfile({
  activeRuleset,
  targetCr,
  typeId,
  category,
  roleId,
  selectedFeatures = [],
  baseline,
  abilityModel,
  statMods,
  tempoProfile,
  monsterTier,
  mechanicsSummary,
  speed,
  targetHp,
  targetAc,
  targetDpr,
  targetAttackBonus,
  targetSaveDc,
}) {
  const dndRules = activeRuleset.buildRulesProfile({
    targetCr,
    typeId,
    category,
    roleId,
    selectedFeatures,
    baseline,
    targetHp,
    targetAc,
    targetDpr,
    targetAttackBonus,
    targetSaveDc,
    tempoProfile,
  });
  const hp = dndRules.printedStats.hp;
  const ac = dndRules.printedStats.ac;
  const dpr = dndRules.printedStats.dpr;
  const dc = dndRules.printedStats.saveDc;
  const attack = dndRules.printedStats.attackBonus;
  const printedStats = {
    ...dndRules.printedStats,
    initiativeMod: Number(tempoProfile?.initiativeMod || 0),
    speed,
  };
  const dprProfile = activeRuleset.simulateDpr({
    selectedFeatures,
    abilities: abilityModel?.abilities || [],
    targetDpr: dpr,
    computed: {
      dpr,
      attack,
      dc,
      targetCr,
      rulesProfile: dndRules.rulesProfile,
      tempoProfile,
      monsterTier,
    },
  });
  const effectiveProfile = activeRuleset.buildEffectiveProfile({
    printedStats,
    dprProfile,
    abilityModel,
    statMods,
    tempoProfile,
    monsterTier,
    mechanicsSummary,
    typeId,
    selectedFeatures,
  });
  const crValidation = activeRuleset.validateChallenge({
    targetCr,
    printedStats,
    effectiveProfile,
    monsterTier,
    mechanicsSummary,
  });

  return {
    dndRules,
    printedStats,
    dprProfile,
    effectiveProfile,
    crValidation,
  };
}

export function buildClosedLoopCrFit({
  activeRuleset,
  targetCr = 0,
  typeId,
  category,
  roleId,
  selectedFeatures = [],
  baseline,
  abilityModel,
  statMods = {},
  tempoProfile = {},
  monsterTier = {},
  mechanicsSummary = {},
  speed = 30,
  targetHp,
  targetAc,
  targetDpr,
  targetAttackBonus,
  targetSaveDc,
  maxPasses = 4,
  tolerance = 1,
} = {}) {
  const diagnostics = [];
  const passes = [];
  const initialHpTarget = Math.max(1, round(targetHp || 1));
  const initialDprTarget = Math.max(1, round(targetDpr || 1));
  const initialSaveDcTarget = clamp(round(targetSaveDc || baseline?.saveDc || 10), 10, 30);
  const lowerBoundAuthority = getLowerBoundAuthority({ roleId, targetCr, baseline, initialHpTarget, initialDprTarget });
  const minHpTarget = Math.max(1, round(initialHpTarget * 0.3));
  const { maxHpTarget, maxDprTarget } = buildTargetCeilings({ baseline, initialHpTarget, initialDprTarget, lowerBoundAuthority });
  const minDprTarget = Math.max(1, round(initialDprTarget * 0.25));
  const baselineSaveDc = clamp(round(baseline?.saveDc || initialSaveDcTarget), 10, 30);
  const minSaveDcTarget = clamp(Math.min(initialSaveDcTarget, baselineSaveDc - (Number(targetCr || 0) <= 3 ? 1 : 0)), 10, 30);
  const maxSaveDcTarget = initialSaveDcTarget;

  if (lowerBoundAuthority) {
    diagnostics.push(buildDiagnostic(
      "info",
      "lower-bound-authority-enabled",
      "Closed-loop CR fitting may override low-power frame suppression to preserve the target CR.",
      `Target CR ${targetCr}; role ${roleId}; HP ceiling ${maxHpTarget}; DPR ceiling ${maxDprTarget}.`,
      { roleId, targetCr, baseline, initialHpTarget, initialDprTarget, maxHpTarget, maxDprTarget },
    ));
  }

  let hpTarget = initialHpTarget;
  let dprTarget = initialDprTarget;
  let saveDcTarget = initialSaveDcTarget;
  let bestResult = null;
  let bestScore = Infinity;
  let currentResult = null;

  const safeMaxPasses = clamp(round(maxPasses || 3), 1, 6);

  for (let passIndex = 0; passIndex < safeMaxPasses; passIndex += 1) {
    currentResult = buildSingleCrProfile({
      activeRuleset,
      targetCr,
      typeId,
      category,
      roleId,
      selectedFeatures,
      baseline,
      abilityModel,
      statMods,
      tempoProfile,
      monsterTier,
      mechanicsSummary,
      speed,
      targetHp: hpTarget,
      targetAc,
      targetDpr: dprTarget,
      targetAttackBonus,
      targetSaveDc: saveDcTarget,
    });

    const currentPass = summarizePass({ index: passIndex, hpTarget, dprTarget, saveDcTarget, result: currentResult });
    passes.push(currentPass);

    const crDelta = getCrDelta(currentResult.crValidation, targetCr);
    const offensiveDelta = getOffensiveDelta(currentResult.crValidation, targetCr);
    const defensiveDelta = getDefensiveDelta(currentResult.crValidation, targetCr);
    const splitPenalty = Math.abs(offensiveDelta - defensiveDelta) * 0.18;
    const score = Math.abs(crDelta) + splitPenalty;

    if (score < bestScore) {
      bestScore = score;
      bestResult = currentResult;
    }

    if (Math.abs(crDelta) <= tolerance) break;

    const lowerBoundPass = lowerBoundAuthority && crDelta <= -2;
    let hpScale = buildScaleForDelta(defensiveDelta, lowerBoundPass ? {
      upStep: 0.12,
      upMax: 0.65,
      upCeiling: 1.7,
      downStep: 0.08,
      downMax: 0.35,
      downFloor: 0.62,
    } : undefined);
    let dprScale = buildScaleForDelta(offensiveDelta, lowerBoundPass ? {
      upStep: 0.11,
      upMax: 0.55,
      upCeiling: 1.58,
      downStep: 0.08,
      downMax: 0.35,
      downFloor: 0.62,
    } : undefined);

    const controlAwarePass = crDelta >= 2 && offensiveDelta >= 2 && isLowCrHardControlProfile(currentResult, targetCr);
    let nextSaveDcTarget = saveDcTarget;

    if (controlAwarePass) {
      const conditionProfile = getConditionProfile(currentResult);
      const dcStep = Number(conditionProfile.repeatedHardControlCount || 0) >= 2 ? 2 : 1;
      nextSaveDcTarget = clamp(saveDcTarget - dcStep, minSaveDcTarget, maxSaveDcTarget);
      dprScale = Math.min(dprScale, 0.72);
      if (defensiveDelta >= 1) hpScale = Math.min(hpScale, 0.88);
      diagnostics.push(buildDiagnostic(
        "info",
        `pass-${passIndex + 1}-control-aware-hardening`,
        "Control-aware CR fitting reduced low-CR hard-control reliability.",
        `Save DC ${saveDcTarget} → ${nextSaveDcTarget}; condition adjustment +${conditionProfile.crAdjustment || 0}.`,
        {
          passIndex,
          crDelta,
          offensiveDelta,
          defensiveDelta,
          saveDcTarget,
          nextSaveDcTarget,
          conditionProfile,
          responsibleSources: getHardControlResponsibleSources(currentResult),
        },
      ));
    }

    if (crDelta >= 2 && defensiveDelta < 2 && offensiveDelta < 2) {
      hpScale = Math.min(hpScale, 0.92);
      dprScale = Math.min(dprScale, 0.92);
    }

    if (crDelta <= -2 && defensiveDelta > -2 && offensiveDelta > -2) {
      hpScale = Math.max(hpScale, lowerBoundPass ? 1.18 : 1.08);
      dprScale = Math.max(dprScale, lowerBoundPass ? 1.16 : 1.08);
    }

    if (lowerBoundPass) {
      diagnostics.push(buildDiagnostic(
        "info",
        `pass-${passIndex + 1}-lower-bound-hardening`,
        "Lower-bound CR fitting used stronger upward scaling because the monster remained below target.",
        `Estimated CR ${currentResult.crValidation?.estimatedCr}; target CR ${targetCr}.`,
        { passIndex, crDelta, offensiveDelta, defensiveDelta, hpScale, dprScale },
      ));
    }

    const nextHpTarget = clamp(round(hpTarget * hpScale), minHpTarget, maxHpTarget);
    const nextDprTarget = clamp(round(dprTarget * dprScale), minDprTarget, maxDprTarget);
    const saveDcDelta = nextSaveDcTarget - saveDcTarget;
    const adjustment = classifyAdjustment({ hpScale, dprScale, saveDcDelta });

    if (
      !hasMeaningfulTargetChange(hpTarget, nextHpTarget) &&
      !hasMeaningfulTargetChange(dprTarget, nextDprTarget) &&
      !hasMeaningfulTargetChange(saveDcTarget, nextSaveDcTarget)
    ) {
      diagnostics.push(buildDiagnostic(
        lowerBoundAuthority && crDelta <= -2 ? "error" : "warning",
        "no-meaningful-adjustment-available",
        "CR fitting could not find a meaningful HP/DPR adjustment.",
        `Pass ${passIndex}; estimated CR ${currentResult.crValidation?.estimatedCr}; target CR ${targetCr}.`,
        { passIndex, crDelta, offensiveDelta, defensiveDelta, hpTarget, dprTarget, saveDcTarget },
      ));
      break;
    }

    diagnostics.push(buildDiagnostic(
      "info",
      `pass-${passIndex + 1}-${adjustment}`,
      "Closed-loop CR fitting adjusted the monster math target.",
      `HP ${hpTarget} → ${nextHpTarget}; DPR ${dprTarget} → ${nextDprTarget}; Save DC ${saveDcTarget} → ${nextSaveDcTarget}.`,
      { passIndex, crDelta, offensiveDelta, defensiveDelta, hpScale, dprScale, saveDcTarget, nextSaveDcTarget },
    ));

    hpTarget = nextHpTarget;
    dprTarget = nextDprTarget;
    saveDcTarget = nextSaveDcTarget;
  }

  const initial = passes[0] || null;
  const final = summarizePass({
    index: passes.length,
    hpTarget,
    dprTarget,
    saveDcTarget,
    result: bestResult || currentResult,
  });
  const finalDelta = Number(final?.deltaFromTarget ?? 0);
  const initialDelta = Number(initial?.deltaFromTarget ?? finalDelta);
  const applied = Boolean(
    initial &&
      (hasMeaningfulTargetChange(initial.hpTarget, final.hpTarget) ||
        hasMeaningfulTargetChange(initial.dprTarget, final.dprTarget) ||
        hasMeaningfulTargetChange(initial.saveDcTarget, final.saveDcTarget))
  );

  if (applied) {
    diagnostics.push(buildDiagnostic(
      "info",
      "closed-loop-applied",
      "Closed-loop CR fitting was applied.",
      `Estimated CR ${initial.estimatedCr} → ${final.estimatedCr}; target CR ${targetCr}.`,
      { initial, final },
    ));
  }

  if (Math.abs(finalDelta) > Math.abs(initialDelta) && bestResult !== currentResult) {
    diagnostics.push(buildDiagnostic(
      "warning",
      "best-pass-selected",
      "Closed-loop CR fitting selected the best pass instead of the last pass.",
      `Initial delta ${initialDelta}; final delta ${finalDelta}.`,
      { initial, final, passes },
    ));
  }

  if (finalDelta >= 2) {
    diagnostics.push(buildDiagnostic(
      finalDelta >= 4 ? "error" : "warning",
      "remaining-cr-above-target",
      "Estimated CR remains above target after closed-loop fitting.",
      `Estimated CR ${final.estimatedCr}; target CR ${targetCr}.`,
      { initial, final, passes },
    ));
  } else if (finalDelta <= -2) {
    diagnostics.push(buildDiagnostic(
      Math.abs(finalDelta) >= 3 ? "error" : "warning",
      "remaining-cr-below-target",
      "Estimated CR remains below target after closed-loop fitting.",
      `Estimated CR ${final.estimatedCr}; target CR ${targetCr}.`,
      { initial, final, passes },
    ));
  }

  const result = bestResult || currentResult || buildSingleCrProfile({
    activeRuleset,
    targetCr,
    typeId,
    category,
    roleId,
    selectedFeatures,
    baseline,
    abilityModel,
    statMods,
    tempoProfile,
    monsterTier,
    mechanicsSummary,
    speed,
    targetHp: hpTarget,
    targetAc,
    targetDpr: dprTarget,
    targetAttackBonus,
    targetSaveDc: saveDcTarget,
  });

  return {
    ...result,
    fitProfile: {
      version: MONSTER_CR_FITTING_VERSION,
      policy: "closed-loop-hp-dpr-target-fitting",
      maxPasses: safeMaxPasses,
      tolerance,
      applied,
      initial,
      final: summarizePass({ index: passes.length, hpTarget: final.hpTarget, dprTarget: final.dprTarget, saveDcTarget: final.saveDcTarget, result }),
      passes,
      diagnostics,
      targetBounds: {
        initialHpTarget,
        initialDprTarget,
        minHpTarget,
        maxHpTarget,
        minDprTarget,
        maxDprTarget,
        initialSaveDcTarget,
        minSaveDcTarget,
        maxSaveDcTarget,
        lowerBoundAuthority,
      },
      selectedFeaturesWithFixedDamage: asArray(selectedFeatures)
        .filter((feature) => JSON.stringify(feature.rules || feature.abilityModel || {}).includes('"mode":"fixed"'))
        .map((feature) => ({ id: feature.id, title: feature.title })),
    },
  };
}
