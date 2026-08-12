import { projectMonsterAbilitiesForCr } from "./monster-attack-pattern-progression.js";
export const MONSTER_ATTACK_ROUTINE_VERSION = "monster-attack-routine-v1.2-cr-scaled-patterns";

const PREFERRED_SINGLE_HIT_CAPS = Object.freeze([
  { maxCr: 1, value: 7 },
  { maxCr: 2, value: 12 },
  { maxCr: 4, value: 15 },
  { maxCr: 6, value: 18 },
  { maxCr: 8, value: 22 },
  { maxCr: 10, value: 27 },
  { maxCr: 12, value: 28 },
  { maxCr: 16, value: 29 },
  { maxCr: 20, value: 30 },
  { maxCr: 30, value: 30 },
]);

const ATTACK_ROLE_WEIGHTS = Object.freeze({
  mainAttack: 1,
  secondaryAttack: 0.82,
  minorAttack: 0.65,
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cleanString(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function numberWord(value) {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
  ];
  const numeric = Number(value || 0);
  return words[numeric] || String(numeric);
}

function formatList(values = [], conjunction = "and") {
  const entries = values.map(cleanString).filter(Boolean);
  if (!entries.length) return "";
  if (entries.length === 1) return entries[0];
  if (entries.length === 2) return `${entries[0]} ${conjunction} ${entries[1]}`;
  return `${entries.slice(0, -1).join(", ")}, ${conjunction} ${entries[entries.length - 1]}`;
}

function attackPhrase(label, count) {
  const normalizedLabel = cleanString(label) || "Attack";
  const numeric = Math.max(1, Number(count || 1));
  return numeric === 1
    ? `one ${normalizedLabel} attack`
    : `${numberWord(numeric)} ${normalizedLabel} attacks`;
}

function getSubject(computed = {}) {
  return (
    cleanString(
      computed.subject ||
        computed.categoryNoun ||
        computed.rulesContext?.categoryNoun ||
        computed.category,
    ).toLowerCase() || "monster"
  );
}

function getPreferredSingleHitCap(targetCr = 0) {
  const cr = Math.max(0, Number(targetCr || 0));
  return (
    PREFERRED_SINGLE_HIT_CAPS.find((entry) => cr <= entry.maxCr)?.value || 30
  );
}

function getMinimumAttackCount(targetCr = 0) {
  const cr = Number(targetCr || 0);
  if (cr >= 11) return 3;
  if (cr >= 3) return 2;
  return 1;
}

function getMaximumAttackCount(monsterTier = {}) {
  const tierId = cleanString(monsterTier?.id || monsterTier).toLowerCase();
  return ["boss", "legendary", "setpiece"].includes(tierId) ? 5 : 4;
}

function hasDirectDamage(ability = {}) {
  return (ability.damage?.entries || []).some((entry) =>
    ["damage", "damage_part"].includes(entry.source || entry.kind || "damage"),
  );
}

function isScalableDamageAbility(ability = {}) {
  const directEntries = (ability.damage?.entries || []).filter((entry) =>
    ["damage", "damage_part"].includes(entry.source || entry.kind || "damage"),
  );
  return Boolean(
    directEntries.length &&
    directEntries.every((entry) =>
      ["budget", "computed"].includes(
        cleanString(entry.mode || entry.damage?.mode).toLowerCase(),
      ),
    ),
  );
}

function getPrimaryBudgetRole(ability = {}) {
  const directEntry = (ability.damage?.entries || []).find((entry) =>
    ["damage", "damage_part"].includes(entry.source || entry.kind || "damage"),
  );
  return (
    directEntry?.budgetRole || directEntry?.damage?.budgetRole || "mainAttack"
  );
}

function getAbilityParticipation(ability = {}) {
  const explicit =
    ability.multiattackParticipation ||
    ability.rules?.multiattackParticipation ||
    null;
  const attackResolution = Boolean(ability.resolution?.attack);
  const actionEconomy = ability.actionEconomy || ability.rules?.actionEconomy;
  const usageType =
    ability.usage?.type || ability.rules?.usage?.type || "atWill";
  const budgetRole = getPrimaryBudgetRole(ability);
  const inferredEnabled = Boolean(
    actionEconomy === "action" &&
    usageType === "atWill" &&
    attackResolution &&
    hasDirectDamage(ability) &&
    isScalableDamageAbility(ability) &&
    ["mainAttack", "secondaryAttack", "minorAttack"].includes(budgetRole),
  );
  const severeRider = (ability.conditions || []).some((condition) =>
    ["major", "severe"].includes(cleanString(condition.severity).toLowerCase()),
  );

  return {
    explicit: Boolean(explicit),
    enabled:
      explicit && Object.prototype.hasOwnProperty.call(explicit, "enabled")
        ? Boolean(explicit.enabled)
        : inferredEnabled,
    role: cleanString(explicit?.role) || "primary",
    maxUses: Math.max(1, Number(explicit?.maxUses || (severeRider ? 1 : 4))),
    replacementScope: cleanString(explicit?.replacementScope) || "oneAttack",
    timing: cleanString(explicit?.timing) || "beforeAttacks",
    availability: cleanString(explicit?.availability) || "always",
    group: cleanString(explicit?.group) || "primary",
    budgetRole,
    severeRider,
    inferredEnabled,
  };
}

function isRoutineAction(
  ability = {},
  participation = getAbilityParticipation(ability),
) {
  if (!participation.enabled || participation.role === "excluded") return false;
  if ((ability.actionEconomy || ability.rules?.actionEconomy) !== "action")
    return false;
  if (["primary", "choice"].includes(participation.role)) {
    return hasDirectDamage(ability) && Boolean(ability.resolution?.attack);
  }
  return ["replacement", "additionalAbility"].includes(participation.role);
}

function buildCandidate(ability = {}) {
  const participation = getAbilityParticipation(ability);
  return {
    abilityId: ability.id,
    featureId: ability.sourceGraftId || ability.id,
    sourceGraftId: ability.sourceGraftId || ability.id,
    label: cleanString(ability.title) || "Attack",
    ref:
      cleanString(ability.id || ability.sourceGraftId) ||
      slugify(ability.title),
    role: participation.role,
    group: participation.group,
    maxUses: participation.maxUses,
    replacementScope: participation.replacementScope,
    timing: participation.timing,
    availability: participation.availability,
    severeRider: participation.severeRider,
    scalable: isScalableDamageAbility(ability),
    budgetRole: participation.budgetRole,
    weight: ATTACK_ROLE_WEIGHTS[participation.budgetRole] || 1,
    explicitParticipation: participation.explicit,
  };
}

function shouldGenerateAutomaticRoutine({ candidates, targetCr, targetDpr }) {
  if (!candidates.length) return false;
  const choiceMode = candidates.some(
    (candidate) => candidate.role === "choice",
  );
  const capacity = choiceMode
    ? Math.max(
        0,
        ...candidates.map((candidate) => Number(candidate.maxUses || 0)),
      )
    : candidates.reduce(
        (sum, candidate) => sum + Number(candidate.maxUses || 0),
        0,
      );
  if (capacity < 2) return false;
  if (candidates.some((candidate) => candidate.explicitParticipation))
    return true;
  const hitCap = getPreferredSingleHitCap(targetCr);
  const cr = Number(targetCr || 0);
  const dpr = Number(targetDpr || 0);
  if (cr <= 1) return dpr > hitCap * 1.75;
  if (cr === 2) return dpr > hitCap * 1.25;
  return dpr > hitCap * 1.05;
}

function getDesiredAttackCount({
  targetCr,
  targetDpr,
  monsterTier,
  candidates,
}) {
  const hitCap = getPreferredSingleHitCap(targetCr);
  const minimum = getMinimumAttackCount(targetCr);
  const maximum = getMaximumAttackCount(monsterTier);
  const rawCount = Math.ceil(
    Math.max(1, Number(targetDpr || 1)) / Math.max(1, hitCap),
  );
  const capacity = candidates.reduce(
    (sum, candidate) => sum + Math.max(1, candidate.maxUses),
    0,
  );
  return clamp(
    Math.max(minimum, rawCount),
    2,
    Math.max(2, Math.min(maximum, capacity)),
  );
}

function allocateFixedAttackCounts(candidates = [], desiredCount = 2) {
  const attacks = candidates.map((candidate) => ({ ...candidate, count: 0 }));
  let remaining = desiredCount;

  attacks.forEach((attack) => {
    if (remaining <= 0) return;
    attack.count = 1;
    remaining -= 1;
  });

  while (remaining > 0) {
    const target = attacks.find((attack) => attack.count < attack.maxUses);
    if (!target) break;
    target.count += 1;
    remaining -= 1;
  }

  return attacks.filter((attack) => attack.count > 0);
}

function buildAllocations(
  attacks = [],
  targetDpr = 1,
  { choice = false } = {},
) {
  const allocations = {};
  if (!attacks.length) return allocations;

  if (choice) {
    const perUse = Math.max(
      1,
      Number(
        (
          Number(targetDpr || 1) / Math.max(1, attacks[0].routineCount || 1)
        ).toFixed(2),
      ),
    );
    attacks.forEach((attack) => {
      allocations[attack.abilityId || attack.featureId] = {
        abilityId: attack.abilityId,
        featureId: attack.featureId,
        sourceGraftId: attack.sourceGraftId || attack.featureId,
        uses: attack.routineCount || 1,
        averagePerUse: perUse,
        totalAverage: Number(targetDpr || 1),
        choice: true,
        scalable: attack.scalable,
      };
    });
    return allocations;
  }

  const weightedUses = attacks.reduce(
    (sum, attack) =>
      sum + Number(attack.count || 0) * Number(attack.weight || 1),
    0,
  );
  const base = Number(targetDpr || 1) / Math.max(1, weightedUses);
  attacks.forEach((attack) => {
    const averagePerUse = Math.max(
      1,
      Number((base * Number(attack.weight || 1)).toFixed(2)),
    );
    allocations[attack.abilityId || attack.featureId] = {
      abilityId: attack.abilityId,
      featureId: attack.featureId,
      sourceGraftId: attack.sourceGraftId || attack.featureId,
      uses: attack.count,
      averagePerUse,
      totalAverage: Number((averagePerUse * attack.count).toFixed(2)),
      choice: false,
      scalable: attack.scalable,
    };
  });
  return allocations;
}

function findReferencedAbility(abilities = [], reference = {}) {
  const rawRef = cleanString(reference.ref);
  const rawLabel = cleanString(reference.label);
  const localRef = rawRef.includes(":") ? rawRef.split(":").pop() : rawRef;

  if (rawRef) {
    const exactRuntimeId = abilities.find(
      (ability) => cleanString(ability.id) === rawRef,
    );
    if (exactRuntimeId) return exactRuntimeId;

    const exactLocalId = abilities.find((ability) => {
      const localAbilityId = cleanString(ability.localAbilityId);
      return localAbilityId && [rawRef, localRef].includes(localAbilityId);
    });
    if (exactLocalId) return exactLocalId;
  }

  if (rawLabel) {
    const exactTitle = abilities.find(
      (ability) => cleanString(ability.title).toLowerCase() === rawLabel.toLowerCase(),
    );
    if (exactTitle) return exactTitle;
  }

  const keys = [rawRef, localRef, rawLabel].map(slugify).filter(Boolean);
  return abilities.find((ability) => {
    if (ability.synthetic) return false;
    const abilityKeys = [ability.id, ability.localAbilityId, ability.title]
      .map(slugify)
      .filter(Boolean);
    return keys.some((key) => abilityKeys.includes(key));
  }) || abilities.find((ability) => {
    if (ability.synthetic) return false;
    return keys.includes(slugify(ability.sourceGraftId));
  });
}

function resolvePatternSequence(abilities = [], sequence = []) {
  return (Array.isArray(sequence) ? sequence : [])
    .map((localAbilityId) => {
      const ability = findReferencedAbility(abilities, { ref: localAbilityId });
      return ability
        ? {
            localAbilityId: cleanString(localAbilityId),
            abilityId: ability.id,
            title: ability.title,
          }
        : {
            localAbilityId: cleanString(localAbilityId),
            abilityId: null,
            title: cleanString(localAbilityId),
          };
    })
    .filter((entry) => entry.localAbilityId);
}

function buildAuthoredPatternPlan(abilities = [], multiattackAbility = {}) {
  const routine = multiattackAbility.patternRoutine || null;
  if (!routine) return null;
  return {
    defaultPlan: cleanString(routine.defaultPlan),
    targetSelection: cleanString(routine.targetSelection),
    defaultSequence: resolvePatternSequence(abilities, routine.defaultSequence),
    opener: resolvePatternSequence(abilities, routine.opener),
    alternatives: (Array.isArray(routine.alternatives) ? routine.alternatives : []).map(
      (alternative) => ({
        id: cleanString(alternative.id),
        when: cleanString(alternative.when),
        purpose: cleanString(alternative.purpose),
        targetSelection: cleanString(alternative.targetSelection),
        sequence: resolvePatternSequence(abilities, alternative.sequence),
      }),
    ),
    intentionalRepetition: Boolean(routine.intentionalRepetition),
    repetitionReason: cleanString(routine.repetitionReason),
    identity: multiattackAbility.patternIdentity || null,
    counterplay: multiattackAbility.patternCounterplay || null,
  };
}

function buildManualRoutine({
  abilities,
  multiattackAbility,
  targetDpr,
  computed,
}) {
  const multiattack =
    multiattackAbility.multiattack ||
    multiattackAbility.rules?.multiattack ||
    {};
  const referenced = (multiattack.attacks || [])
    .map((reference) => {
      const ability = findReferencedAbility(abilities, reference);
      if (!ability) return null;
      const candidate = buildCandidate(ability);
      return {
        ...candidate,
        count: Math.max(1, Number(reference.count || 1)),
        routineCount: Math.max(
          1,
          Number(multiattack.count || reference.count || 1),
        ),
      };
    })
    .filter(Boolean);
  const count = Math.max(
    1,
    Number(
      multiattack.count ||
        referenced.reduce(
          (sum, attack) => sum + Number(attack.count || 0),
          0,
        ) ||
        1,
    ),
  );
  const choice = multiattack.mode === "choice";
  const allocations = buildAllocations(
    choice
      ? referenced.map((attack) => ({ ...attack, routineCount: count }))
      : referenced,
    targetDpr,
    { choice },
  );

  return {
    version: MONSTER_ATTACK_ROUTINE_VERSION,
    enabled: referenced.length > 0,
    source: "manual",
    authority: multiattackAbility.patternRoutine ? "authored-pattern" : "manual-rules",
    mode: multiattack.mode || "fixed",
    subject: getSubject(computed),
    count,
    attacks: referenced,
    additions: [],
    replacements: multiattack.replacements || [],
    allocations,
    expectedDpr: Number(targetDpr || 0),
    manualFeatureId: multiattackAbility.sourceGraftId || multiattackAbility.id,
    authoredPlan: buildAuthoredPatternPlan(abilities, multiattackAbility),
    diagnostics: referenced.length
      ? []
      : [
          {
            severity: "warning",
            code: "multiattack-reference-missing",
            message:
              "Manual Multiattack references could not be resolved to active actions.",
          },
        ],
  };
}

export function buildMonsterAttackRoutine({
  abilities = [],
  targetDpr = 1,
  targetCr = 0,
  monsterTier = {},
  computed = {},
} = {}) {
  const abilityList = projectMonsterAbilitiesForCr(
    Array.isArray(abilities) ? abilities.filter(Boolean) : [],
    targetCr,
  );
  const manualMultiattack = abilityList.find(
    (ability) =>
      ability.multiattack?.enabled || ability.rules?.multiattack?.enabled,
  );
  if (manualMultiattack) {
    return buildManualRoutine({
      abilities: abilityList,
      multiattackAbility: manualMultiattack,
      targetDpr,
      computed,
    });
  }

  const projectedAttackPattern = abilityList.find(
    (ability) => ability.patternProgression?.bands?.length,
  );
  if (projectedAttackPattern) {
    return {
      version: MONSTER_ATTACK_ROUTINE_VERSION,
      enabled: false,
      source: "authored-pattern",
      authority: "cr-progression",
      mode: "fixed",
      subject: getSubject(computed),
      count: 1,
      attacks: [],
      additions: [],
      replacements: [],
      allocations: {},
      expectedDpr: Number(targetDpr || 0),
      authoredPlan: null,
      diagnostics: [],
    };
  }

  const candidates = abilityList
    .map((ability) => ({
      ability,
      participation: getAbilityParticipation(ability),
    }))
    .filter(({ ability, participation }) =>
      isRoutineAction(ability, participation),
    )
    .map(({ ability }) => buildCandidate(ability));
  const baseCandidates = candidates.filter((candidate) =>
    ["primary", "choice"].includes(candidate.role),
  );
  const choiceSeed = baseCandidates.find(
    (candidate) => candidate.role === "choice",
  );
  const routineCandidates = choiceSeed
    ? baseCandidates.filter(
        (candidate) =>
          candidate.role === "choice" && candidate.group === choiceSeed.group,
      )
    : baseCandidates;
  const replacements = candidates
    .filter((candidate) => candidate.role === "replacement")
    .map((candidate) => ({
      abilityId: candidate.abilityId,
      featureId: candidate.featureId,
      sourceGraftId: candidate.sourceGraftId,
      label: candidate.label,
      replace: candidate.replacementScope,
      availability: candidate.availability,
    }));
  const additions = candidates
    .filter((candidate) => candidate.role === "additionalAbility")
    .map((candidate) => ({
      abilityId: candidate.abilityId,
      featureId: candidate.featureId,
      sourceGraftId: candidate.sourceGraftId,
      label: candidate.label,
      timing: candidate.timing,
      availability: candidate.availability,
    }));

  const enabled = shouldGenerateAutomaticRoutine({
    candidates: routineCandidates,
    targetCr,
    targetDpr,
  });
  if (!enabled) {
    return {
      version: MONSTER_ATTACK_ROUTINE_VERSION,
      enabled: false,
      source: "none",
      mode: "fixed",
      subject: getSubject(computed),
      count: 1,
      attacks: [],
      additions,
      replacements,
      allocations: {},
      expectedDpr: Number(targetDpr || 0),
      diagnostics: [],
    };
  }

  const plannedCount = getDesiredAttackCount({
    targetCr,
    targetDpr,
    monsterTier,
    candidates: routineCandidates,
  });
  const choiceMode = routineCandidates.some(
    (candidate) => candidate.role === "choice",
  );
  const choiceCapacity = Math.max(
    1,
    ...routineCandidates.map((candidate) => Number(candidate.maxUses || 1)),
  );
  const desiredCount = choiceMode
    ? Math.min(plannedCount, choiceCapacity)
    : plannedCount;
  const attacks = choiceMode
    ? routineCandidates.map((candidate) => ({
        ...candidate,
        count: 1,
        routineCount: desiredCount,
      }))
    : allocateFixedAttackCounts(routineCandidates, desiredCount);
  const actualCount = choiceMode
    ? desiredCount
    : attacks.reduce((sum, attack) => sum + Number(attack.count || 0), 0);
  const allocations = buildAllocations(attacks, targetDpr, {
    choice: choiceMode,
  });

  return {
    version: MONSTER_ATTACK_ROUTINE_VERSION,
    enabled: attacks.length > 0,
    source: "auto",
    mode: choiceMode ? "choice" : "fixed",
    subject: getSubject(computed),
    count: actualCount,
    attacks,
    additions,
    replacements,
    allocations,
    expectedDpr: Number(targetDpr || 0),
    preferredSingleHitCap: getPreferredSingleHitCap(targetCr),
    diagnostics: [],
  };
}

export function getAttackRoutineAllocation(computed = {}, featureId = "") {
  const id = cleanString(featureId);
  if (!id) return null;
  return (
    computed?.attackRoutine?.allocations?.[id] ||
    computed?.dprProfile?.attackRoutine?.allocations?.[id] ||
    null
  );
}

export function renderMonsterAttackRoutineText(routine = {}, computed = {}) {
  if (!routine?.enabled) return "";
  const subject = getSubject({ ...computed, subject: routine.subject });
  const attacks = Array.isArray(routine.attacks) ? routine.attacks : [];
  const additions = Array.isArray(routine.additions) ? routine.additions : [];
  const replacements = Array.isArray(routine.replacements)
    ? routine.replacements
    : [];
  const sentences = [];

  if (additions.length) {
    const before = additions.filter(
      (addition) => addition.timing !== "afterAttacks",
    );
    if (before.length) {
      const labels = formatList(
        before.map((addition) => addition.label),
        "or",
      );
      const choicePrefix = before.length > 1 ? "either " : "";
      const availability = before.some(
        (addition) => addition.availability === "ifAvailable",
      )
        ? " if available"
        : "";
      sentences.push(
        `The ${subject} uses ${choicePrefix}${labels}${availability}`,
      );
    }
  }

  if (routine.mode === "choice" && attacks.length > 1) {
    sentences.push(
      `makes ${numberWord(routine.count)} attacks, using ${formatList(
        attacks.map((attack) => attack.label),
        "or",
      )} in any combination`,
    );
  } else if (attacks.length === 1) {
    sentences.push(
      `makes ${attackPhrase(attacks[0].label, attacks[0].count || routine.count)}`,
    );
  } else if (attacks.length > 1) {
    sentences.push(
      `makes ${formatList(
        attacks.map((attack) => attackPhrase(attack.label, attack.count)),
        "and",
      )}`,
    );
  }

  let base = sentences.length
    ? `${sentences[0].startsWith("The ") ? sentences.join(" and ") : `The ${subject} ${sentences.join(" and ")}`}.`
    : `The ${subject} makes ${numberWord(routine.count)} attacks.`;

  const replacementText = replacements
    .map((replacement) => {
      const scope =
        replacement.replace === "anyAttack"
          ? "any attack"
          : replacement.replace === "oneOrMoreAttacks"
            ? "one or more attacks"
            : "one attack";
      const availability =
        replacement.availability === "ifAvailable" ? " if available" : "";
      return `It can replace ${scope} with a use of ${cleanString(replacement.label)}${availability}.`;
    })
    .join(" ");

  const afterAdditions = additions.filter(
    (addition) => addition.timing === "afterAttacks",
  );
  const afterText = afterAdditions
    .map((addition) => {
      const availability =
        addition.availability === "ifAvailable" ? " if available" : "";
      return `It then uses ${addition.label}${availability}.`;
    })
    .join(" ");

  return [base, replacementText, afterText].filter(Boolean).join(" ");
}

export function buildGeneratedMultiattackFeature(routine = {}, computed = {}) {
  if (!routine?.enabled) return null;
  return {
    id: "generated-multiattack",
    title: "Multiattack",
    section: "action",
    slot: "attack",
    synthetic: true,
    generatedBy: MONSTER_ATTACK_ROUTINE_VERSION,
    mechanics: renderMonsterAttackRoutineText(routine, computed),
  };
}
