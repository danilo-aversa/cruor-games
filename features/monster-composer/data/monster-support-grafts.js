import {
  MONSTER_BODY_GRAFT_EDITORIAL_VERSION,
  MONSTER_BODY_GRAFT_SCALED_IDS,
  getMonsterBodyGraftEditorialOverride,
} from "./monster-body-grafts.js";
import {
  MONSTER_MIND_GRAFT_EDITORIAL_VERSION,
  MONSTER_MIND_GRAFT_SCALED_IDS,
  getMonsterMindGraftEditorialOverride,
} from "./monster-mind-grafts.js";
import {
  MONSTER_MOVEMENT_GRAFT_EDITORIAL_VERSION,
  MONSTER_MOVEMENT_GRAFT_SCALED_IDS,
  getMonsterMovementGraftEditorialOverride,
} from "./monster-movement-grafts.js";
import {
  MONSTER_HORROR_GRAFT_EDITORIAL_VERSION,
  MONSTER_HORROR_GRAFT_SCALED_IDS,
  getMonsterHorrorGraftEditorialOverride,
} from "./monster-horror-grafts.js";
import {
  MONSTER_TWIST_GRAFT_EDITORIAL_VERSION,
  MONSTER_TWIST_GRAFT_SCALED_IDS,
  getMonsterTwistGraftEditorialOverride,
} from "./monster-twist-grafts.js";


export const MONSTER_SUPPORT_GRAFT_MIGRATION_VERSION =
  "monster-support-graft-migration-v1.0";
export const MONSTER_SUPPORT_GRAFT_PROGRESSION_SCHEMA_VERSION =
  "monster-graft-progression-v1.0";

const SUPPORT_KINDS_BY_SLOT = Object.freeze({
  body: "traitBundle",
  mind: "traitBundle",
  movement: "movementPattern",
  horror: "horrorFeature",
  twist: "combatTwist",
  weakness: "weakness",
  death: "deathEffect",
  lair: "lairEffect",
});

const SLOT_TACTICAL_ROLES = Object.freeze({
  body: "chassis-defining durability, posture, or anatomy rule",
  mind: "behavioral priority that changes target choice and encounter logic",
  movement: "positioning pattern that changes routes, engagement, or escape",
  horror: "high-visibility horror reveal that changes the encounter state",
  twist: "conditional escalation or state change that alters the normal combat loop",
  weakness: "telegraphed player-facing exploit with a non-damage or precision answer",
  death: "death-triggered aftermath that changes terrain, clues, or action economy",
  lair: "initiative-count terrain pressure with a readable spatial answer",
});

const SLOT_COUNTERPLAY_FALLBACKS = Object.freeze({
  body: {
    positioningAnswers: [
      "Change the angle of engagement or force the creature into terrain that makes its body plan a liability.",
    ],
    nonDamageAnswers: [
      "Use forced movement, restraint, environmental tools, or targeted disruption instead of relying only on damage.",
    ],
  },
  mind: {
    breakConditions: [
      "Deny the behavior's preferred trigger, bait, witness, corpse, or target priority.",
    ],
    nonDamageAnswers: [
      "Use deception, ritual action, environmental preparation, or controlled exposure to redirect the compulsion.",
    ],
  },
  movement: {
    positioningAnswers: [
      "Control the surfaces, sight lines, light, elevation, and landing spaces the movement pattern requires.",
    ],
    breakConditions: [
      "Destroy or deny the route, anchor, shadow, web, or open lane that enables the movement.",
    ],
  },
  horror: {
    positioningAnswers: [
      "Break line of sight, spread the group, or leave the threatened area before the reveal resolves.",
    ],
    nonDamageAnswers: [
      "Use preparation, immunity windows, restoration, or protective rituals to blunt the horror effect.",
    ],
  },
  twist: {
    breakConditions: [
      "Deny or deliberately control the trigger that causes the escalation.",
    ],
    nonDamageAnswers: [
      "Use positioning, damage-type choice, object interaction, corpse removal, or phase control to prevent the state change.",
    ],
  },
  weakness: {
    breakConditions: [
      "Create the required setup, called shot, terrain state, ritual condition, or damage type before exploiting the weakness.",
    ],
    nonDamageAnswers: [
      "The weakness is intentionally solvable through preparation, positioning, observation, or environmental interaction.",
    ],
  },
  death: {
    positioningAnswers: [
      "Plan the killing blow from outside the threatened space or move the creature before finishing it.",
    ],
    nonDamageAnswers: [
      "Burn, cleanse, restrain, cover, relocate, or otherwise prepare the body or anchor before the death trigger.",
    ],
  },
  lair: {
    positioningAnswers: [
      "Move out of the marked area, clear a safe lane, or deny the selected terrain anchor before initiative count 20.",
    ],
    nonDamageAnswers: [
      "Interact with, burn, move, cleanse, illuminate, or respectfully handle the lair object that sustains the effect.",
    ],
  },
});

const SCALING_OVERRIDES = Object.freeze({
  "egg-carrier": {
    bands: [
      {
        id: "cr-0-4-dormant-clutch",
        minCr: 0,
        maxCr: 4,
        summonCount: "1 egg",
        mechanics:
          "At the start of each of the creature's turns, roll a d20 for one visible egg. On a 16 or higher, the egg hatches into one spider minion in an adjacent space. An egg is a fragile object and can be destroyed before it hatches.",
      },
      {
        id: "cr-5-12-active-clutch",
        minCr: 5,
        maxCr: 12,
        summonCount: "1d2 eggs",
        mechanics:
          "At the start of each of the creature's turns, roll a d20 for up to 1d2 visible eggs. On a 13 or higher, each selected egg hatches into one spider minion in an adjacent space. Eggs are fragile objects and can be destroyed before they hatch.",
      },
      {
        id: "cr-13-30-brood-cascade",
        minCr: 13,
        maxCr: 30,
        summonCount: "1d3 eggs",
        mechanics:
          "At the start of each of the creature's turns, choose up to 1d3 visible eggs. Each chosen egg hatches into one spider minion in an adjacent space unless it was destroyed or burned before the turn began.",
      },
    ],
  },
  "horrific-apparition": {
    bands: [
      { id: "cr-0-4-glimpse", minCr: 0, maxCr: 4, areaSize: 30 },
      { id: "cr-5-12-revelation", minCr: 5, maxCr: 12, areaSize: 45 },
      { id: "cr-13-30-apparition", minCr: 13, maxCr: 30, areaSize: 60 },
    ],
  },
  "dangerously-unstable": {
    bands: [
      {
        id: "cr-0-4-contained-burst",
        minCr: 0,
        maxCr: 4,
        areaSize: 10,
        outerAreaSize: 20,
        triggerText: "On a 6",
      },
      {
        id: "cr-5-12-violent-burst",
        minCr: 5,
        maxCr: 12,
        areaSize: 20,
        outerAreaSize: 40,
        triggerText: "On a 4 or higher",
      },
      {
        id: "cr-13-30-catastrophic-burst",
        minCr: 13,
        maxCr: 30,
        areaSize: 40,
        outerAreaSize: 80,
        triggerText: "On a 2 or higher",
      },
    ],
  },
  "shadow-jump": {
    bands: [
      { id: "cr-0-4-short-step", minCr: 0, maxCr: 4, distance: 20, usage: "1/day" },
      { id: "cr-5-12-shadow-jump", minCr: 5, maxCr: 12, distance: 40, usage: "3/day" },
      { id: "cr-13-30-umbral-transit", minCr: 13, maxCr: 30, distance: 60, usage: "at will" },
    ],
  },
  "underbelly-weak-spot": {
    bands: [
      { id: "cr-0-4-soft-seam", minCr: 0, maxCr: 4, extraDamage: "1d6" },
      { id: "cr-5-12-open-underbelly", minCr: 5, maxCr: 12, extraDamage: "2d6" },
      { id: "cr-13-30-ruptured-underbelly", minCr: 13, maxCr: 30, extraDamage: "3d6" },
    ],
  },
  "toxic-detonation": {
    bands: [
      { id: "cr-0-4-small-burst", minCr: 0, maxCr: 4, areaSize: 5 },
      { id: "cr-5-12-toxic-burst", minCr: 5, maxCr: 12, areaSize: 10 },
      { id: "cr-13-30-toxic-wave", minCr: 13, maxCr: 30, areaSize: 15 },
    ],
  },
  "purge-fluid-flood": {
    bands: [
      { id: "cr-0-4-spill", minCr: 0, maxCr: 4, areaSize: 10 },
      { id: "cr-5-12-flood", minCr: 5, maxCr: 12, areaSize: 15 },
      { id: "cr-13-30-inundation", minCr: 13, maxCr: 30, areaSize: 25 },
    ],
  },
  "face-curse": {
    bands: [
      { id: "cr-0-7-last-glance", minCr: 0, maxCr: 7, targetCount: "one creature" },
      { id: "cr-8-30-room-of-faces", minCr: 8, maxCr: 30, targetCount: "up to two creatures" },
    ],
  },
  "choking-air": {
    bands: [
      { id: "cr-0-4-pocket", minCr: 0, maxCr: 4, areaSize: 5 },
      { id: "cr-5-12-cloud", minCr: 5, maxCr: 12, areaSize: 10 },
      { id: "cr-13-30-failing-lung", minCr: 13, maxCr: 30, areaSize: 20 },
    ],
  },
  "corpse-pressure-room": {
    bands: [
      { id: "cr-0-4-single-hazard", minCr: 0, maxCr: 4, anchorCount: "one corpse" },
      { id: "cr-5-12-pressure-network", minCr: 5, maxCr: 12, anchorCount: "up to two corpses" },
      { id: "cr-13-30-chain-reaction", minCr: 13, maxCr: 30, anchorCount: "up to three corpses" },
    ],
  },
  "web-dancer": {
    bands: [
      { id: "cr-0-4-short-line", minCr: 0, maxCr: 4, distance: 30 },
      { id: "cr-5-12-lair-swing", minCr: 5, maxCr: 12, distance: 60 },
      { id: "cr-13-30-vaulting-line", minCr: 13, maxCr: 30, distance: 90 },
    ],
  },
  "shadow-stillness": {
    bands: [
      { id: "cr-0-7-half-step", minCr: 0, maxCr: 7, movement: "half its speed" },
      { id: "cr-8-30-unwatched-advance", minCr: 8, maxCr: 30, movement: "its speed" },
    ],
  },
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function cleanString(value) {
  return String(value || "").trim();
}

function lower(value) {
  return cleanString(value).toLowerCase();
}

function uniqueArray(values = []) {
  return [...new Set(asArray(values).map(cleanString).filter(Boolean))];
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function deepMerge(base, patch) {
  if (!isPlainObject(base)) return isPlainObject(patch) ? { ...patch } : patch;
  if (!isPlainObject(patch)) return patch === undefined ? { ...base } : patch;
  const result = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
      return;
    }
    result[key] = Array.isArray(value) ? [...value] : value;
  });
  return result;
}

function getPrimaryAbilityId(slot) {
  return {
    body: "body-trait",
    mind: "mind-trait",
    movement: "movement-pattern",
    horror: "horror-reveal",
    twist: "combat-twist",
    weakness: "weakness",
    death: "death-effect",
    lair: "lair-effect",
  }[slot] || "feature";
}

function getRoutineMode(slot) {
  if (["movement", "horror", "twist", "death", "lair"].includes(slot)) {
    return "procedure";
  }
  return "none";
}

function getIdentity(graft) {
  const explicit = isPlainObject(graft.identity) ? graft.identity : {};
  const idTags = cleanString(graft.id)
    .split("-")
    .filter((tag) => tag.length > 2);
  const authoredTags = asArray(graft.tags).map((tag) =>
    cleanString(tag).replace(/_/g, "-"),
  );
  return {
    fantasy:
      cleanString(explicit.fantasy) ||
      cleanString(graft.summary) ||
      cleanString(graft.title),
    tacticalRole:
      cleanString(explicit.tacticalRole) ||
      SLOT_TACTICAL_ROLES[graft.slot] ||
      "encounter-defining support feature",
    signature:
      cleanString(explicit.signature) ||
      cleanString(graft.mechanics).split(/[.!?]/)[0] ||
      cleanString(graft.title),
    recognitionTags: uniqueArray([
      ...asArray(explicit.recognitionTags),
      ...authoredTags,
      ...idTags,
      `slot-${graft.slot}`,
      `source-${graft.source}`,
    ]).slice(0, 10),
  };
}

function getCounterplayProfile(graft) {
  const fallback = SLOT_COUNTERPLAY_FALLBACKS[graft.slot] || {};
  const authored = cleanString(graft.counterplay);
  const telegraphs =
    /visible|visibly|telegraph|readable|shines|creaks|bulges|coils|cracks|distends|posture|moves before|thickens/i.test(
      `${graft.summary} ${graft.counterplay}`,
    )
      ? [authored || `The ${graft.title} state is visible before it resolves.`]
      : [
          `The creature's ${cleanString(graft.title).toLowerCase()} behavior is observable before its decisive effect resolves.`,
        ];
  return {
    telegraphs,
    positioningAnswers: uniqueArray(fallback.positioningAnswers),
    breakConditions: uniqueArray(fallback.breakConditions),
    nonDamageAnswers: uniqueArray([
      authored,
      ...(fallback.nonDamageAnswers || []),
    ]),
  };
}

function splitRuleSentences(value) {
  const text = cleanString(value);
  if (!text) return [];
  return text
    .split(/(?:(?<=[.!?])\s+(?=[A-Z])|;\s*)/)
    .map(cleanString)
    .filter(Boolean);
}

function selectEffectClauseText(
  graft,
  rules,
  patterns = [],
  sourcePolicy = "rules-first",
) {
  const authoredRuleText = Object.values(rules?.text || {})
    .filter((value) => typeof value === "string")
    .flatMap(splitRuleSentences);
  const mechanicsText = splitRuleSentences(graft.mechanics);
  const sentences =
    sourcePolicy === "mechanics"
      ? mechanicsText
      : [...authoredRuleText, ...mechanicsText];
  const match = sentences.find((sentence) =>
    patterns.some((pattern) => pattern.test(sentence)),
  );
  return match || cleanString(graft.mechanics);
}

function buildStructuredEffects(graft, rules) {
  const mechanics = lower(graft.mechanics);
  const effects = [...asArray(rules.effects)];
  const add = (
    id,
    type,
    subject,
    policy,
    model,
    axis,
    textPatterns = [],
    sourcePolicy = type === "custom" ? "mechanics" : "rules-first",
  ) => {
    if (
      effects.some(
        (effect) => effect.id === id || cleanString(effect.type) === type,
      )
    ) {
      return;
    }
    effects.push({
      id,
      type,
      subject,
      trigger: cleanString(rules.trigger),
      appliesTo: cleanString(rules.targeting?.targets),
      duration: cleanString(rules.condition?.duration),
      text: selectEffectClauseText(
        graft,
        rules,
        textPatterns,
        sourcePolicy,
      ),
      simulation: {
        policy,
        model,
        axis,
        weight: 1,
      },
    });
  };

  if (/\badvantage\b/.test(mechanics)) {
    add(
      "advantage-state",
      "advantage",
      graft.slot === "weakness" ? "triggeringCreature" : "self",
      "proxy",
      graft.slot === "movement"
        ? "feature.stats.mobility"
        : "feature.stats.control",
      graft.slot === "movement" ? "mobility" : "control",
      [/\badvantage\b/i],
    );
  }
  if (/\bdisadvantage\b/.test(mechanics)) {
    add(
      "disadvantage-state",
      "disadvantage",
      /against it|against the creature/.test(mechanics)
        ? "triggeringCreature"
        : "self",
      "proxy",
      "feature.stats.control",
      "control",
      [/\bdisadvantage\b/i],
    );
  }
  if (
    /\bspeed\b|walking speed|climb speed|teleport|moves? up to|jump(?:s|ing)? up to/.test(
      mechanics,
    )
  ) {
    add(
      "movement-state",
      "movement",
      "self",
      "proxy",
      "feature.stats.mobility",
      "mobility",
      [/\bspeed\b/i, /teleport/i, /moves? up to/i, /jump/i],
    );
  }
  if (/\bpush(?:ed|es)?\b|\bpull(?:ed|s)?\b|forced movement/.test(mechanics)) {
    add(
      "forced-movement-state",
      "forcedMovement",
      "self",
      "proxy",
      "feature.stats.control",
      "control",
      [/\bpush/i, /\bpull/i, /forced movement/i],
    );
  }
  if (
    /\barmor class\b|\bac\b|resistan(?:ce|t)|immun(?:ity|e)|vulnerab(?:ility|le)/.test(
      mechanics,
    )
  ) {
    add(
      "defense-state",
      "defense",
      "self",
      "proxy",
      "feature.stats.ac",
      "defense",
      [/armor class/i, /\bac\b/i, /resistan/i, /immun/i, /vulnerab/i],
    );
  }
  if (
    /regain(?:s|ed)? hit points|heal(?:s|ing|ed)?|temporary hit points|magically healed/.test(
      mechanics,
    )
  ) {
    add(
      "healing-state",
      "resource",
      "self",
      "proxy",
      "feature.stats.hp",
      "survival",
      [/regain/i, /heal/i, /temporary hit points/i],
      "mechanics",
    );
  }
  if (
    /extra damage|additional damage|critical hit|proficiency bonus|\breach\b/.test(
      mechanics,
    )
  ) {
    add(
      "special-resolution-state",
      "custom",
      graft.slot === "weakness" ? "triggeringCreature" : "self",
      "nonNumeric",
      "",
      "special",
      [/extra damage/i, /additional damage/i, /critical hit/i, /proficiency bonus/i, /\breach\b/i],
    );
  }
  if (/summon|spawn|hatch(?:es|ed)?|spider minion/.test(mechanics)) {
    add(
      "spawn-state",
      "resource",
      "area",
      "proxy",
      "feature.stats.control",
      "action-economy",
      [/summon/i, /spawn/i, /hatch/i, /spider minion/i],
    );
  }

  return effects;
}

function buildStructuredRuleEnhancements(graft, rules) {
  const mechanics = lower(graft.mechanics);
  const patch = {};
  const hasPrimaryResolution = [
    "attackRoll",
    "savingThrow",
    "attackRollSavingThrow",
  ].includes(cleanString(rules.resolution?.type));
  const text = { ...(rules.text || {}) };
  if (!Object.values(text).some((value) => cleanString(value))) {
    text.effect = cleanString(graft.mechanics);
  }
  patch.text = text;

  if (
    !hasPrimaryResolution &&
    /\bspeed\b|walking speed|climb speed|teleport|moves? up to|jump(?:s|ing)? up to|start of (?:its|the target's|each) turn|end of (?:its|the target's|each) turn/.test(
      mechanics,
    )
  ) {
    patch.procedure = {
      ...(rules.procedure || {}),
      enabled: true,
      type: rules.procedure?.type || "custom",
      prerequisite:
        cleanString(rules.procedure?.prerequisite) ||
        cleanString(rules.trigger),
      text:
        cleanString(rules.procedure?.text) ||
        cleanString(graft.mechanics),
    };
  }

  if (
    /\barmor class\b|\bac\b|resistan(?:ce|t)|immun(?:ity|e)|vulnerab(?:ility|le)|regain(?:s|ed)? hit points|heal(?:s|ing|ed)?|temporary hit points|magically healed/.test(
      mechanics,
    )
  ) {
    patch.defense = {
      ...(rules.defense || {}),
      enabled: true,
      type: rules.defense?.type || "custom",
      timing: rules.defense?.timing || "passive",
      breakCondition:
        cleanString(rules.defense?.breakCondition) ||
        cleanString(graft.counterplay),
      text:
        cleanString(rules.defense?.text) ||
        cleanString(graft.mechanics),
    };
  }

  if (/summon|spawn|hatch(?:es|ed)?|spider minion/.test(mechanics)) {
    patch.summon = {
      ...(rules.summon || {}),
      enabled: true,
      type: rules.summon?.type || "spawn",
      creatureName:
        cleanString(rules.summon?.creatureName) || "spider minion",
      count: cleanString(rules.summon?.count) || "1",
      placement:
        cleanString(rules.summon?.placement) || "an adjacent unoccupied space",
      duration: cleanString(rules.summon?.duration) || "until destroyed",
      initiative:
        rules.summon?.initiative || "immediatelyAfterSummoner",
      control: rules.summon?.control || "alliedToSummoner",
      trigger:
        cleanString(rules.summon?.trigger) ||
        cleanString(rules.trigger) ||
        "the listed egg or death trigger resolves",
      text:
        cleanString(rules.summon?.text) ||
        cleanString(graft.mechanics),
    };
  }

  if (/\breach\b/.test(mechanics) && !rules.resolution?.reach) {
    const match = cleanString(graft.mechanics).match(/reach\s+(\d+\s*ft\.?)/i);
    patch.resolution = {
      ...(rules.resolution || {}),
      reach: match?.[1] || "10 ft.",
    };
  }

  patch.effects = buildStructuredEffects(graft, deepMerge(rules, patch));
  const authoredEffectText = cleanString(patch.text?.effect);
  const missingEffectTexts = patch.effects
    .map((effect) => cleanString(effect.text))
    .filter(
      (effectText) =>
        effectText &&
        !lower(authoredEffectText).includes(lower(effectText)),
    );
  if (missingEffectTexts.length) {
    patch.text = {
      ...(patch.text || {}),
      effect: [authoredEffectText, ...missingEffectTexts]
        .filter(Boolean)
        .join(" "),
    };
  }
  return patch;
}

function buildRules(graft) {
  const baseRules = isPlainObject(graft.rules) ? graft.rules : {};
  const isBodyEditorialReview =
    graft.editorial?.phase === "phase6r-body-editorial-review";
  const isMindEditorialReview =
    graft.editorial?.phase === "phase6r-mind-editorial-review";
  const isMovementEditorialReview =
    graft.editorial?.phase === "phase6r-movement-editorial-review";
  const isHorrorEditorialReview =
    graft.editorial?.phase === "phase6r-horror-editorial-review";
  const isTwistEditorialReview =
    graft.editorial?.phase === "phase6r-twist-editorial-review";
  const isEditorialReview =
    isBodyEditorialReview ||
    isMindEditorialReview ||
    isMovementEditorialReview ||
    isHorrorEditorialReview ||
    isTwistEditorialReview;
  const reviewSource = isBodyEditorialReview
    ? "phase6r-body-editorial-review"
    : isMindEditorialReview
      ? "phase6r-mind-editorial-review"
      : isMovementEditorialReview
        ? "phase6r-movement-editorial-review"
        : isHorrorEditorialReview
          ? "phase6r-horror-editorial-review"
          : isTwistEditorialReview
            ? "phase6r-twist-editorial-review"
            : "phase6-support-graft-migration";
  const enhancedRules = isEditorialReview
    ? {
        ...baseRules,
        schemaVersion: "monster-graft-rules-v1.16",
      }
    : deepMerge(
        {
          ...baseRules,
          schemaVersion: "monster-graft-rules-v1.16",
        },
        buildStructuredRuleEnhancements(graft, baseRules),
      );
  return {
    ...enhancedRules,
    parity: {
      ...(enhancedRules.parity || {}),
      status: "verified",
      reviewedBy: reviewSource,
      reviewedAt: "2026-07-26",
      notes: isBodyEditorialReview
        ? "The structured rule was authorially reviewed against its chassis fantasy, counterplay, and renderer output during the Phase 6R Body catalog review."
        : isMindEditorialReview
          ? "The structured rule was authorially reviewed against its behavioral fantasy, decision logic, counterplay, and renderer output during the Phase 6R Mind catalog review."
          : isMovementEditorialReview
            ? "The structured rule was authorially reviewed against its route fantasy, movement procedure, counterplay, and renderer output during the Phase 6R Movement catalog review."
            : isHorrorEditorialReview
              ? "The structured rule was authorially reviewed against its sensory horror fantasy, encounter reveal, counterplay, and renderer output during the Phase 6R Horror catalog review."
              : isTwistEditorialReview
                ? "The structured rule was authorially reviewed against its encounter reversal, state transition, counterplay, and renderer output during the Phase 6R Twist catalog review."
                : "The legacy rule was reconciled with its structured representation and renderer output during the Phase 6 catalog audit.",
    },
    migration: {
      ...(enhancedRules.migration || {}),
      source: reviewSource,
      isStructured: true,
      convertedFrom:
        enhancedRules.migration?.convertedFrom || "legacy-mechanics",
    },
  };
}

function getAuthoredIntent(graft) {
  const stats = isPlainObject(graft.stats) ? graft.stats : {};
  const rules = graft.rules || {};
  const hasArea =
    rules.targeting?.type === "area" ||
    Boolean(rules.areaEffect?.enabled);
  const usageType = cleanString(rules.usage?.type);
  return {
    attrition: Math.max(0, Number(stats.dpr || 0)),
    spike:
      ["recharge", "death", "triggered"].includes(usageType) ||
      ["reaction", "death", "horror"].includes(graft.slot)
        ? Math.max(1, Number(stats.dpr || 0))
        : 0,
    reliability:
      usageType === "passive" || usageType === "atWill" ? 2 : 1,
    control: Math.max(0, Number(stats.control || 0)),
    area: hasArea ? 1 : 0,
    tempo: ["movement", "twist", "lair"].includes(graft.slot) ? 1 : 0,
    offTurn:
      ["reaction", "lairAction", "deathTrigger"].includes(
        rules.actionEconomy,
      )
        ? 1
        : 0,
    survival: Math.max(
      0,
      Number(stats.hp || 0) + Number(stats.ac || 0) * 5,
    ),
    fairness: Math.max(0, Number(stats.fairness || 0)),
  };
}

function getComplexityProfile(graft, rules) {
  const base = Math.max(0, Number(graft.complexity || 0));
  const conditionalBranches = [
    rules.trigger,
    rules.secondaryResolution,
    rules.condition,
    rules.defense?.enabled,
    rules.summon?.enabled,
    rules.procedure?.enabled,
  ].filter(Boolean).length;
  const tracking = [
    rules.ongoing?.enabled,
    rules.summon?.enabled,
    rules.areaEffect?.enabled,
    rules.condition,
    rules.usage?.type === "recharge",
    rules.usage?.type === "limited",
  ].filter(Boolean).length;
  return {
    decisionLoad: Math.min(4, Math.max(1, base)),
    sequencing: getRoutineMode(graft.slot) === "none" ? 0 : 1,
    conditionalBranches: Math.min(4, conditionalBranches),
    tracking: Math.min(4, tracking),
    authoredComplexity: base,
  };
}

function getSpikeRiskProfile(graft, rules) {
  const stats = isPlainObject(graft.stats) ? graft.stats : {};
  const usage = cleanString(rules.usage?.type);
  return {
    openingBurst:
      graft.slot === "horror" || /first turn|opening|surprised/i.test(graft.mechanics)
        ? 2
        : 0,
    controlSpike: Math.min(4, Math.max(0, Number(stats.control || 0))),
    damageSpike:
      ["recharge", "death", "triggered"].includes(usage)
        ? Math.min(4, Math.max(1, Number(stats.dpr || 0)))
        : Math.min(2, Math.max(0, Number(stats.dpr || 0))),
    repeatability:
      usage === "passive" || usage === "atWill" ? 2 : usage ? 1 : 0,
  };
}

function buildRoutine(graft, abilityId) {
  const mode = getRoutineMode(graft.slot);
  if (mode === "none") {
    return {
      mode: "none",
      defaultPlan: "",
      targetSelection: "",
      defaultSequence: [],
      opener: [],
      intentionalRepetition: false,
      alternatives: [],
      multiattack: {
        enabled: false,
        mode: "fixed",
        count: 0,
        attacks: [],
        choices: [],
        replacements: [],
      },
    };
  }
  return {
    mode,
    defaultPlan: cleanString(graft.mechanics),
    targetSelection:
      graft.slot === "movement"
        ? "Use the feature when it changes engagement, escape, elevation, or line of sight rather than as automatic movement every turn."
        : graft.slot === "lair"
          ? "Choose the terrain anchor or area that creates the clearest next-turn decision for the players."
          : graft.slot === "death"
            ? "Resolve the effect only after checking its telegraph, spatial answer, and prevention condition."
            : "Use the feature when its authored trigger or encounter-state condition is satisfied.",
    defaultSequence: [abilityId],
    opener: graft.slot === "horror" ? [abilityId] : [],
    intentionalRepetition: false,
    alternatives: [],
    nonMultiattackReason:
      "This support graft changes state, movement, terrain, or counterplay and is not an attack routine.",
    multiattack: {
      enabled: false,
      mode: "fixed",
      count: 0,
      attacks: [],
      choices: [],
      replacements: [],
    },
  };
}

function replaceNumberedPhrase(text, pattern, replacement) {
  return cleanString(text).replace(pattern, replacement);
}

function buildScalingPatch(graft, band, abilityId) {
  const baseRules = buildRules(graft);
  const rulesPatch = {};
  let mechanics = cleanString(graft.mechanics);

  if (Number.isFinite(Number(band.areaSize))) {
    rulesPatch.targeting = {
      ...(baseRules.targeting || {}),
      size: Number(band.areaSize),
    };
  }

  if (graft.id === "egg-carrier") {
    rulesPatch.summon = {
      ...(baseRules.summon || {}),
      enabled: true,
      count: band.summonCount,
      text: band.mechanics,
    };
    rulesPatch.text = {
      ...(baseRules.text || {}),
      effect: band.mechanics,
    };
    mechanics = band.mechanics;
  }

  if (graft.id === "horrific-apparition") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\b60-foot cone\b/i,
      `${band.areaSize}-foot cone`,
    );
  }

  if (graft.id === "dangerously-unstable") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\b40-foot sphere\b/i,
      `${band.areaSize}-foot sphere`,
    );
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\bout to 80 feet\b/i,
      `out to ${band.outerAreaSize} feet`,
    );
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\bOn a 2 or higher\b/i,
      band.triggerText,
    );
    rulesPatch.text = {
      ...(baseRules.text || {}),
      failure: replaceNumberedPhrase(
        replaceNumberedPhrase(
          cleanString(baseRules.text?.failure),
          /\bout to 80 feet\b/i,
          `out to ${band.outerAreaSize} feet`,
        ),
        /\bOn a 2 or higher\b/i,
        band.triggerText,
      ),
      response: replaceNumberedPhrase(
        replaceNumberedPhrase(
          cleanString(baseRules.text?.response),
          /\bout to 80 feet\b/i,
          `out to ${band.outerAreaSize} feet`,
        ),
        /\bOn a 2 or higher\b/i,
        band.triggerText,
      ),
    };
  }

  if (graft.id === "shadow-jump") {
    mechanics = `The creature can use this feature ${band.usage}. It teleports up to ${band.distance} feet to an unoccupied space in darkness it can see.`;
    rulesPatch.text = {
      ...(baseRules.text || {}),
      effect: mechanics,
    };
    rulesPatch.usage =
      band.usage === "at will"
        ? { type: "atWill" }
        : {
            type: "limited",
            uses: Number.parseInt(band.usage, 10) || 1,
            period: "day",
          };
  }

  if (graft.id === "underbelly-weak-spot") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\b2d6\b/i,
      band.extraDamage,
    );
    rulesPatch.text = {
      ...(baseRules.text || {}),
      effect: mechanics,
    };
  }

  if (["toxic-detonation", "purge-fluid-flood"].includes(graft.id)) {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\b(?:10|15)-foot (?:Radius|area)\b/i,
      `${band.areaSize}-foot area`,
    );
  }

  if (graft.id === "face-curse") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\bone creature\b/i,
      band.targetCount,
    );
    rulesPatch.targeting = {
      ...(baseRules.targeting || {}),
      type: band.targetCount.startsWith("up to") ? "custom" : "single",
      targets: band.targetCount,
    };
  }

  if (graft.id === "choking-air") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\b10-foot area\b/i,
      `${band.areaSize}-foot area`,
    );
  }

  if (graft.id === "corpse-pressure-room") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\bone corpse or body part\b/i,
      band.anchorCount,
    );
    rulesPatch.text = {
      ...(baseRules.text || {}),
      effect: mechanics,
    };
  }

  if (graft.id === "web-dancer") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\bwithin 60 feet\b/i,
      `within ${band.distance} feet`,
    );
    rulesPatch.targeting = {
      ...(baseRules.targeting || {}),
      size: band.distance,
    };
    rulesPatch.text = {
      ...(baseRules.text || {}),
      effect: mechanics,
    };
  }

  if (graft.id === "shadow-stillness") {
    mechanics = replaceNumberedPhrase(
      mechanics,
      /\bhalf its speed\b/i,
      band.movement,
    );
    rulesPatch.text = {
      ...(baseRules.text || {}),
      effect: mechanics,
    };
  }

  rulesPatch.text = {
    ...(baseRules.text || {}),
    ...(rulesPatch.text || {}),
    effect: mechanics,
  };
  if (baseRules.procedure?.enabled) {
    rulesPatch.procedure = {
      ...(baseRules.procedure || {}),
      ...(rulesPatch.procedure || {}),
      text: mechanics,
    };
  }
  if (baseRules.defense?.enabled) {
    rulesPatch.defense = {
      ...(baseRules.defense || {}),
      ...(rulesPatch.defense || {}),
      text: mechanics,
    };
  }
  if (baseRules.summon?.enabled) {
    rulesPatch.summon = {
      ...(baseRules.summon || {}),
      ...(rulesPatch.summon || {}),
      text: mechanics,
    };
  }
  if (asArray(baseRules.effects).length) {
    rulesPatch.effects = asArray(baseRules.effects).map((effect) => ({
      ...effect,
      text: mechanics,
    }));
  }

  return {
    abilityIds: [abilityId],
    defaultSequence: [abilityId],
    abilityPatches: {
      [abilityId]: {
        mechanics,
        rules: rulesPatch,
      },
    },
  };
}

function buildProgression(graft, abilityId) {
  const override = SCALING_OVERRIDES[graft.id];
  if (!override) return null;
  return {
    schemaVersion: MONSTER_SUPPORT_GRAFT_PROGRESSION_SCHEMA_VERSION,
    basis: "targetCr",
    scalingPolicy: "authored-rule-patches",
    bands: override.bands.map((band) => ({
      ...band,
      ...buildScalingPatch(graft, band, abilityId),
      multiattack: {
        enabled: false,
        mode: "fixed",
        count: 0,
      },
    })),
  };
}

export function isMonsterSupportGraftCandidate(graft = {}) {
  return Boolean(
    SUPPORT_KINDS_BY_SLOT[graft.slot] &&
      cleanString(graft.slot) !== "attack",
  );
}

export function buildMonsterSupportGraftMigration(graft = {}) {
  if (!isMonsterSupportGraftCandidate(graft)) return null;

  const editorialOverride =
    getMonsterBodyGraftEditorialOverride(graft.id) ||
    getMonsterMindGraftEditorialOverride(graft.id) ||
    getMonsterMovementGraftEditorialOverride(graft.id) ||
    getMonsterHorrorGraftEditorialOverride(graft.id) ||
    getMonsterTwistGraftEditorialOverride(graft.id);
  const authoredGraft = editorialOverride
    ? { ...graft, ...editorialOverride }
    : graft;
  const primaryAbilityId = getPrimaryAbilityId(authoredGraft.slot);
  const authoredAbilities = asArray(authoredGraft.abilities);
  const abilities = authoredAbilities.length
    ? authoredAbilities.map((ability, index) => {
        const localId = cleanString(ability.id) || `${primaryAbilityId}-${index + 1}`;
        const abilityFeature = {
          ...authoredGraft,
          ...ability,
          id: authoredGraft.id,
          title: ability.title || authoredGraft.title,
          summary: ability.summary || authoredGraft.summary,
          mechanics: ability.mechanics || authoredGraft.mechanics,
          counterplay: ability.counterplay || authoredGraft.counterplay,
          section: ability.section || ability.rules?.section || authoredGraft.section,
          rules: ability.rules || {},
        };
        return {
          ...ability,
          id: localId,
          title: cleanString(ability.title) || authoredGraft.title,
          section:
            cleanString(ability.section || ability.rules?.section) ||
            authoredGraft.section,
          summary: cleanString(ability.summary) || authoredGraft.summary,
          mechanics: cleanString(ability.mechanics) || authoredGraft.mechanics,
          counterplay:
            cleanString(ability.counterplay) || authoredGraft.counterplay,
          rules: buildRules(abilityFeature),
          tags: uniqueArray([
            ...asArray(ability.tags),
            ...asArray(authoredGraft.tags),
            `support-kind:${authoredGraft.kind || SUPPORT_KINDS_BY_SLOT[authoredGraft.slot]}`,
            `legacy-graft:${authoredGraft.id}`,
          ]),
          authored: ability.authored !== false,
        };
      })
    : (() => {
        const rules = buildRules(authoredGraft);
        return [
          {
            id: primaryAbilityId,
            title: authoredGraft.title,
            section: rules.section || authoredGraft.section,
            summary: authoredGraft.summary,
            mechanics: authoredGraft.mechanics,
            counterplay: authoredGraft.counterplay,
            rules,
            tags: uniqueArray([
              ...asArray(authoredGraft.tags),
              `support-kind:${SUPPORT_KINDS_BY_SLOT[authoredGraft.slot]}`,
              `legacy-graft:${authoredGraft.id}`,
            ]),
            authored: true,
          },
        ];
      })();
  const abilityId = abilities[0]?.id || primaryAbilityId;
  const progression =
    authoredGraft.progression || buildProgression(authoredGraft, abilityId);
  const kind = authoredGraft.kind || SUPPORT_KINDS_BY_SLOT[authoredGraft.slot];
  const isBodyEditorialReview =
    authoredGraft.editorial?.phase === "phase6r-body-editorial-review";
  const isMindEditorialReview =
    authoredGraft.editorial?.phase === "phase6r-mind-editorial-review";
  const isMovementEditorialReview =
    authoredGraft.editorial?.phase === "phase6r-movement-editorial-review";
  const isHorrorEditorialReview =
    authoredGraft.editorial?.phase === "phase6r-horror-editorial-review";
  const isTwistEditorialReview =
    authoredGraft.editorial?.phase === "phase6r-twist-editorial-review";
  const isEditorialReview =
    isBodyEditorialReview ||
    isMindEditorialReview ||
    isMovementEditorialReview ||
    isHorrorEditorialReview ||
    isTwistEditorialReview;
  const editorialVersion =
    authoredGraft.editorial?.version ||
    (isBodyEditorialReview
      ? MONSTER_BODY_GRAFT_EDITORIAL_VERSION
      : isMindEditorialReview
        ? MONSTER_MIND_GRAFT_EDITORIAL_VERSION
        : isMovementEditorialReview
          ? MONSTER_MOVEMENT_GRAFT_EDITORIAL_VERSION
          : isHorrorEditorialReview
            ? MONSTER_HORROR_GRAFT_EDITORIAL_VERSION
            : isTwistEditorialReview
              ? MONSTER_TWIST_GRAFT_EDITORIAL_VERSION
              : "");

  return {
    ...authoredGraft,
    graftSchemaVersion: "monster-graft-v2.0",
    kind,
    identity: getIdentity(authoredGraft),
    abilities,
    rules: isEditorialReview
      ? abilities[0]?.rules || buildRules(authoredGraft)
      : authoredGraft.rules,
    routine: authoredGraft.routine || buildRoutine(authoredGraft, abilityId),
    progression,
    balanceProfile:
      authoredGraft.balanceProfile || {
        schemaVersion: "monster-graft-balance-v2.0",
        stats: {
          ...(isPlainObject(authoredGraft.stats) ? authoredGraft.stats : {}),
        },
        authoredIntent: getAuthoredIntent(authoredGraft),
      },
    complexityProfile:
      authoredGraft.complexityProfile ||
      getComplexityProfile(authoredGraft, abilities[0]?.rules || {}),
    counterplayProfile:
      authoredGraft.counterplayProfile || getCounterplayProfile(authoredGraft),
    spikeRiskProfile:
      authoredGraft.spikeRiskProfile ||
      getSpikeRiskProfile(authoredGraft, abilities[0]?.rules || {}),
    migration: {
      legacyGraftIds: uniqueArray([
        authoredGraft.id,
        ...asArray(authoredGraft.migration?.legacyGraftIds),
      ]),
      status: "active-native-transition",
      phase: isBodyEditorialReview
        ? "phase6r-body-editorial-review"
        : isMindEditorialReview
          ? "phase6r-mind-editorial-review"
          : isMovementEditorialReview
            ? "phase6r-movement-editorial-review"
            : isHorrorEditorialReview
              ? "phase6r-horror-editorial-review"
              : isTwistEditorialReview
                ? "phase6r-twist-editorial-review"
                : "phase6-support-grafts",
      version: editorialVersion || MONSTER_SUPPORT_GRAFT_MIGRATION_VERSION,
    },
    authoring: {
      ...(authoredGraft.authoring || {}),
      origin: isBodyEditorialReview
        ? "phase6r-body-editorial-review"
        : isMindEditorialReview
          ? "phase6r-mind-editorial-review"
          : isMovementEditorialReview
            ? "phase6r-movement-editorial-review"
            : isHorrorEditorialReview
              ? "phase6r-horror-editorial-review"
              : isTwistEditorialReview
                ? "phase6r-twist-editorial-review"
                : "phase6-support-graft-migration",
      migrationVersion:
        editorialVersion || MONSTER_SUPPORT_GRAFT_MIGRATION_VERSION,
      editorialStatus: authoredGraft.editorial?.status || "technical-migration",
    },
  };
}

export const MONSTER_SUPPORT_GRAFT_SCALED_IDS = Object.freeze(
  uniqueArray([
    ...Object.keys(SCALING_OVERRIDES),
    ...MONSTER_BODY_GRAFT_SCALED_IDS,
    ...MONSTER_MIND_GRAFT_SCALED_IDS,
    ...MONSTER_MOVEMENT_GRAFT_SCALED_IDS,
    ...MONSTER_HORROR_GRAFT_SCALED_IDS,
    ...MONSTER_TWIST_GRAFT_SCALED_IDS,
  ]),
);
