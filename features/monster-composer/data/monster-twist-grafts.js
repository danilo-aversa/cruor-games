export const MONSTER_TWIST_GRAFT_EDITORIAL_VERSION =
  "monster-twist-graft-editorial-v1.0";

const RULES_VERSION = "monster-graft-rules-v1.16";
const PROGRESSION_VERSION = "monster-graft-progression-v1.0";

function disabledStructure() {
  return { enabled: false };
}

function noDamage() {
  return {
    mode: "none",
    budgetRole: "none",
    types: [],
    scale: "standard",
    budgetShare: null,
    expectedTargets: null,
    parts: [],
  };
}

function budgetDamage({
  types = ["poison"],
  scale = "minor",
  role = "reactionPunish",
  share = 0.35,
  expectedTargets = 1.5,
} = {}) {
  return {
    mode: "budget",
    budgetRole: role,
    types,
    scale,
    budgetShare: share,
    expectedTargets,
    parts: [],
  };
}

function noCondition() {
  return {
    names: [],
    severity: "minor",
    direction: "referenceOnly",
    duration: "",
    special: [],
    sizeLimit: "",
    escape: null,
    repeatSave: null,
  };
}

function condition(names, {
  severity = "moderate",
  direction = "enemy",
  duration = "until the end of its next turn",
  special = [],
} = {}) {
  return {
    names: Array.isArray(names) ? names : [names],
    severity,
    direction,
    duration,
    special,
    sizeLimit: "",
    escape: null,
    repeatSave: null,
  };
}

function twistRules({
  section = "trait",
  actionEconomy = "passive",
  usage = { type: "passive" },
  trigger = null,
  resolution = { type: "automatic" },
  targeting = { type: "self", targets: "the creature" },
  areaEffect = null,
  damage = noDamage(),
  condition: conditionProfile = noCondition(),
  text = {},
  procedure = null,
  effects = [],
  counterplay = {},
} = {}) {
  return {
    schemaVersion: RULES_VERSION,
    section,
    actionEconomy,
    usage,
    trigger,
    resolution,
    secondaryResolution: null,
    targeting,
    areaEffect: areaEffect || disabledStructure(),
    damage,
    condition: conditionProfile,
    counterplay: {
      telegraph: true,
      breakCondition: true,
      positioningAnswer: true,
      nonDamageAnswer: true,
      ...counterplay,
    },
    text,
    multiattack: disabledStructure(),
    spellcasting: disabledStructure(),
    defense: disabledStructure(),
    summon: disabledStructure(),
    procedure: procedure
      ? {
          enabled: true,
          type: "custom",
          prerequisite: procedure.prerequisite || trigger || "",
          text: procedure.text || text.effect || "",
          ...procedure,
        }
      : disabledStructure(),
    references: [],
    ongoing: disabledStructure(),
    effects,
  };
}

function twistRoutine(defaultPlan, targetSelection, sequence, alternatives = [], opener = []) {
  return {
    mode: "procedure",
    defaultPlan,
    targetSelection,
    defaultSequence: sequence,
    opener,
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives,
    nonMultiattackReason:
      "This Twist Graft changes the encounter state or premise and is not part of the monster's normal attack routine.",
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

function profile({ decision = 2, sequencing = 2, branches = 2, tracking = 1 } = {}) {
  return {
    decisionLoad: decision,
    sequencing,
    conditionalBranches: branches,
    tracking,
    authoredComplexity: Math.max(decision, sequencing, branches, tracking),
  };
}

function spike({ opening = 0, control = 1, damage = 1, repeatability = 1 } = {}) {
  return {
    openingBurst: opening,
    controlSpike: control,
    damageSpike: damage,
    repeatability,
  };
}

function editorial(decision, rationale) {
  return {
    status: "reviewed",
    phase: "phase6r-twist-editorial-review",
    version: MONSTER_TWIST_GRAFT_EDITORIAL_VERSION,
    decision,
    rationale,
    reviewedAt: "2026-07-27",
  };
}

function fit({ encounterRoles, tempo, tacticalRoles }) {
  return {
    schemaVersion: "monster-frame-fit-v1.0",
    encounterRoles: {
      allowed: encounterRoles,
      recommended: encounterRoles,
    },
    tempo: { recommended: tempo },
    danger: { recommended: ["hard", "horror"] },
    tacticalRoles: { recommended: tacticalRoles },
  };
}

function balance(stats, authoredIntent) {
  return {
    schemaVersion: "monster-graft-balance-v2.0",
    stats,
    authoredIntent,
  };
}

function band({ id, minCr, maxCr, abilityIds, patches }) {
  return {
    id,
    minCr,
    maxCr,
    abilityIds,
    defaultSequence: abilityIds,
    abilityPatches: patches,
    multiattack: { enabled: false, mode: "fixed", count: 0 },
  };
}

const TWIST_GRAFTS = {
  "gas-buildup": {
    title: "Gas Buildup",
    cost: 4,
    complexity: 3,
    stats: { control: 2, dpr: 1, fairness: 3 },
    summary:
      "Activity inflates visible gas blisters until the corpse must vent, creating a pressure clock the players can redirect.",
    mechanics:
      "At the end of a turn in which the creature moved at least 15 feet or made two or more attacks, it gains 1 Pressure, to a maximum of 3. At 3 Pressure, it must use Pressure Vent at the start of its next turn. Before the vent, an adjacent creature can use an action to puncture a visible blister and choose the direction of the release.",
    counterplay:
      "Track the visible blisters, slow the creature's activity, spread before the third Pressure, or puncture a blister to redirect the vent.",
    tags: ["pressure-clock", "gas", "redirectable", "decomposition"],
    identity: {
      fantasy:
        "A corpse that audibly inflates as exertion churns the grave gas trapped inside it.",
      tacticalRole:
        "Recurring pressure clock that converts an active turn into a predictable positional hazard.",
      signature:
        "Three visible Pressure markers force a vent that nearby characters can redirect before it resolves.",
      recognitionTags: ["swelling-blisters", "pressure-count", "audible-creaks", "directed-vent"],
    },
    abilities: [
      {
        id: "pressure-clock",
        title: "Gas Buildup",
        section: "trait",
        summary: "Movement and repeated attacks add visible Pressure until the corpse must vent.",
        mechanics:
          "At the end of a turn in which the creature moved at least 15 feet or made two or more attacks, it gains 1 Pressure, to a maximum of 3. The number of Pressure markers is visible. At 3 Pressure, it must use Pressure Vent at the start of its next turn.",
        counterplay:
          "Reduce how far it moves, deny repeated attacks, or prepare to spread before the third marker appears.",
        rules: twistRules({
          trigger:
            "At the end of a turn in which the monster moved at least 15 feet or made two or more attacks.",
          text: {
            effect:
              "The monster gains 1 Pressure, to a maximum of 3. The number of Pressure markers is visible. At 3 Pressure, it must use Pressure Vent at the start of its next turn.",
          },
          procedure: {
            prerequisite:
              "The monster moved at least 15 feet or made two or more attacks during the turn.",
          },
        }),
        tags: ["twist", "pressure-clock", "visible-state"],
        authored: true,
      },
      {
        id: "pressure-vent",
        title: "Pressure Vent",
        section: "trait",
        summary: "At maximum Pressure, grave gas erupts in a predictable area and resets the clock.",
        mechanics:
          "At the start of its turn while it has 3 Pressure, the creature vents in a 10-foot Emanation and loses all Pressure. Each other creature in the area makes a Constitution saving throw, taking minor Poison and Thunder damage and being pushed 5 feet on a failure, or taking half damage only on a success. Before the vent, an adjacent creature can use an action to puncture a visible blister; if it does, that creature chooses a 15-foot Cone for the vent instead of the Emanation.",
        counterplay:
          "Leave the area or puncture a blister before the turn begins to direct the gas into a safer cone.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "triggered" },
          trigger: "At the start of the monster's turn while it has 3 Pressure.",
          resolution: { type: "savingThrow", ability: "constitution", dc: "monster" },
          targeting: {
            type: "area",
            shape: "radius",
            size: 10,
            unit: "ft",
            targets: "other creatures",
          },
          areaEffect: {
            enabled: true,
            type: "burst",
            shape: "emanation",
            size: 10,
            unit: "ft",
            origin: "self",
            timing: "startOfTurn",
            repeatTiming: "none",
            targets: "other creatures",
            excludes: ["the monster"],
            text: "The monster vents grave gas and loses all Pressure.",
          },
          damage: budgetDamage({
            types: ["poison", "thunder"],
            scale: "minor",
            role: "reactionPunish",
            share: 0.35,
            expectedTargets: 1.5,
          }),
          text: {
            failure:
              "The target takes {damage} Poison and Thunder damage and is pushed 5 feet away from the monster.",
            success: "Half damage only.",
            effect:
              "The monster loses all Pressure. Before the vent, an adjacent creature can use an action to puncture a blister and choose a 15-foot Cone instead.",
          },
        }),
        tags: ["twist", "save", "push", "redirectable"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Add Pressure only after visibly active turns. At 3 Pressure, announce the impending vent and resolve it at the start of the next turn unless a character redirects it.",
      "The normal vent affects nearby creatures; a successful puncture lets the acting character choose the cone.",
      ["pressure-clock", "pressure-vent"],
      [
        {
          id: "redirected-vent",
          label: "Redirected vent",
          when: "An adjacent creature punctures a visible blister before Pressure Vent resolves.",
          sequence: ["pressure-vent"],
          notes: "Use a 15-foot Cone chosen by that creature instead of the normal Emanation.",
        },
      ],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        band({
          id: "cr-0-4-small-vent",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["pressure-clock", "pressure-vent"],
          patches: {
            "pressure-vent": {
              mechanics:
                "At the start of its turn while it has 3 Pressure, the creature vents in a 10-foot Emanation and loses all Pressure. Each other creature in the area makes a Constitution saving throw, taking minor Poison and Thunder damage and being pushed 5 feet on a failure, or taking half damage only on a success. Before the vent, an adjacent creature can use an action to puncture a visible blister; if it does, that creature chooses a 15-foot Cone for the vent instead of the Emanation.",
              rules: {
                targeting: { size: 10 },
                areaEffect: { size: 10 },
                text: {
                  failure:
                    "The target takes {damage} Poison and Thunder damage and is pushed 5 feet away from the monster.",
                  success: "Half damage only.",
                  effect:
                    "The monster loses all Pressure. Before the vent, an adjacent creature can use an action to puncture a blister and choose a 15-foot Cone instead.",
                },
              },
            },
          },
        }),
        band({
          id: "cr-5-12-full-vent",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["pressure-clock", "pressure-vent"],
          patches: {
            "pressure-vent": {
              mechanics:
                "At the start of its turn while it has 3 Pressure, the creature vents in a 15-foot Emanation and loses all Pressure. Each other creature in the area makes a Constitution saving throw, taking minor Poison and Thunder damage and being pushed 10 feet on a failure, or taking half damage only on a success. Before the vent, an adjacent creature can use an action to puncture a visible blister; if it does, that creature chooses a 20-foot Cone for the vent instead of the Emanation.",
              rules: {
                targeting: { size: 15 },
                areaEffect: { size: 15 },
                text: {
                  failure:
                    "The target takes {damage} Poison and Thunder damage and is pushed 10 feet away from the monster.",
                  success: "Half damage only.",
                  effect:
                    "The monster loses all Pressure. Before the vent, an adjacent creature can use an action to puncture a blister and choose a 20-foot Cone instead.",
                },
              },
            },
          },
        }),
        band({
          id: "cr-13-30-pressure-wave",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["pressure-clock", "pressure-vent"],
          patches: {
            "pressure-vent": {
              mechanics:
                "At the start of its turn while it has 3 Pressure, the creature vents in a 20-foot Emanation and loses all Pressure. Each other creature in the area makes a Constitution saving throw, taking minor Poison and Thunder damage and being pushed 15 feet on a failure, or taking half damage only on a success. Before the vent, an adjacent creature can use an action to puncture a visible blister; if it does, that creature chooses a 30-foot Cone for the vent instead of the Emanation.",
              rules: {
                targeting: { size: 20 },
                areaEffect: { size: 20 },
                text: {
                  failure:
                    "The target takes {damage} Poison and Thunder damage and is pushed 15 feet away from the monster.",
                  success: "Half damage only.",
                  effect:
                    "The monster loses all Pressure. Before the vent, an adjacent creature can use an action to puncture a blister and choose a 30-foot Cone instead.",
                },
              },
            },
          },
        }),
      ],
    },
    balanceProfile: balance(
      { control: 2, dpr: 1, fairness: 3 },
      { attrition: 1, spike: 1, reliability: 1, control: 2, area: 1, tempo: 2, offTurn: 0, survival: 0, fairness: 3 },
    ),
    complexityProfile: profile({ decision: 2, sequencing: 3, branches: 2, tracking: 3 }),
    counterplayProfile: {
      telegraphs: ["Each Pressure marker is represented by a larger visible blister and louder internal creaking."],
      positioningAnswers: ["Spread before the third marker or stand where a redirected cone will miss allies."],
      breakConditions: ["An adjacent creature can puncture a visible blister before the vent resolves and choose its direction."],
      nonDamageAnswers: ["Slow the monster's movement, deny repeated attacks, or spend an action to control the release."],
    },
    spikeRiskProfile: spike({ control: 2, damage: 1, repeatability: 2 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "fast"],
      tacticalRoles: ["brute", "controller"],
    }),
    editorial: editorial(
      "REWRITE_INTO_PRESSURE_PATTERN",
      "The old death-roll dependency overlapped the Death slot and required another Unstable feature. The new pressure clock is self-contained, visible, repeatable, and redirectable by player action.",
    ),
  },

  "unstable-rupture": {
    title: "Unstable Rupture",
    cost: 4,
    complexity: 2,
    stats: { dpr: 2, control: 1, fairness: 2 },
    summary:
      "Cutting the swollen body opens a visible seam that sprays nearby creatures instead of relying on a hidden random roll.",
    mechanics:
      "When the creature takes piercing or slashing damage, it can use its reaction to rupture a seam. Each other creature within 5 feet makes a Dexterity saving throw, taking minor Poison and Slashing damage on a failure, or half damage on a success. The radius scales with CR.",
    counterplay:
      "The seams are visible before the spray; use other damage types, attack from outside the radius, or force it to spend its reaction first.",
    tags: ["rupture", "reaction", "damage-choice", "decomposition"],
    identity: {
      fantasy: "A corpse whose overfilled tissues split into weaponized seams when cut.",
      tacticalRole:
        "Reaction hazard that makes damage type, spacing, and reaction denial matter.",
      signature:
        "Piercing or slashing damage can trigger a localized spray only while the monster still has its reaction.",
      recognitionTags: ["visible-seams", "cut-trigger", "toxic-spray", "reaction-window"],
    },
    abilities: [
      {
        id: "unstable-rupture",
        title: "Unstable Rupture",
        section: "reaction",
        summary: "A cut seam sprays poison and tissue fragments into the nearby area.",
        mechanics:
          "When the creature takes piercing or slashing damage, it can use its reaction. Each other creature within 5 feet makes a Dexterity saving throw, taking minor Poison and Slashing damage on a failure, or half damage on a success.",
        counterplay:
          "Use bludgeoning, cold, radiant, or ranged attacks, or make the monster spend its reaction before cutting it.",
        rules: twistRules({
          section: "reaction",
          actionEconomy: "reaction",
          usage: { type: "triggered" },
          trigger: "The monster takes Piercing or Slashing damage.",
          resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
          targeting: {
            type: "area",
            shape: "radius",
            size: 5,
            unit: "ft",
            targets: "other creatures",
          },
          areaEffect: {
            enabled: true,
            type: "burst",
            shape: "emanation",
            size: 5,
            unit: "ft",
            origin: "self",
            timing: "reaction",
            repeatTiming: "oncePerRound",
            targets: "other creatures",
            excludes: ["the monster"],
            text: "A cut seam sprays creatures near the monster.",
          },
          damage: budgetDamage({
            types: ["poison", "slashing"],
            scale: "minor",
            role: "reactionPunish",
            share: 0.4,
            expectedTargets: 1.5,
          }),
          text: {
            failure: "The target takes {damage} Poison and Slashing damage.",
            success: "Half damage only.",
          },
        }),
        tags: ["reaction", "save", "area", "damage-type-counterplay"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Use the reaction only when the spray can affect a meaningful target; preserve it when spacing or damage type already denies the rupture.",
      "Every other creature within the current rupture radius.",
      ["unstable-rupture"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        band({
          id: "cr-0-4-split-seam",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["unstable-rupture"],
          patches: {
            "unstable-rupture": {
              mechanics:
                "When the creature takes piercing or slashing damage, it can use its reaction. Each other creature within 5 feet makes a Dexterity saving throw, taking minor Poison and Slashing damage on a failure, or half damage on a success.",
              rules: { targeting: { size: 5 }, areaEffect: { size: 5 } },
            },
          },
        }),
        band({
          id: "cr-5-12-open-rupture",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["unstable-rupture"],
          patches: {
            "unstable-rupture": {
              mechanics:
                "When the creature takes piercing or slashing damage, it can use its reaction. Each other creature within 10 feet makes a Dexterity saving throw, taking minor Poison and Slashing damage on a failure, or half damage on a success.",
              rules: { targeting: { size: 10 }, areaEffect: { size: 10 } },
            },
          },
        }),
        band({
          id: "cr-13-30-body-spray",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["unstable-rupture"],
          patches: {
            "unstable-rupture": {
              mechanics:
                "When the creature takes piercing or slashing damage, it can use its reaction. Each other creature within 15 feet makes a Dexterity saving throw, taking minor Poison and Slashing damage on a failure, or half damage on a success.",
              rules: { targeting: { size: 15 }, areaEffect: { size: 15 } },
            },
          },
        }),
      ],
    },
    balanceProfile: balance(
      { dpr: 2, control: 1, fairness: 2 },
      { attrition: 1, spike: 1, reliability: 1, control: 1, area: 1, tempo: 1, offTurn: 1, survival: 0, fairness: 2 },
    ),
    complexityProfile: profile({ decision: 2, sequencing: 1, branches: 1, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The corpse's skin shows wet seams that widen when a blade enters them."],
      positioningAnswers: ["Attack from outside the rupture radius or keep allies spread around the target."],
      breakConditions: ["The rupture cannot occur after the monster has spent its reaction."],
      nonDamageAnswers: ["Use a different damage type or bait another reaction before using piercing or slashing attacks."],
    },
    spikeRiskProfile: spike({ control: 1, damage: 1, repeatability: 2 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "fast"],
      tacticalRoles: ["brute", "controller"],
    }),
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "The random one-in-six trigger obscured player agency. The reaction is now deterministic, bounded by action economy, and countered by spacing or damage-type choice.",
    ),
  },

  "dangerously-unstable": {
    title: "Dangerously Unstable",
    cost: 7,
    complexity: 3,
    stats: { dpr: 4, control: 3, fairness: 3 },
    summary:
      "When bloodied, the corpse enters a visible one-turn countdown toward a catastrophic but preventable detonation.",
    mechanics:
      "The first time the creature becomes bloodied, it begins a Critical Pressure countdown. At the end of its next turn, it detonates and drops to 0 hit points. Creatures in the affected area make a Dexterity saving throw, taking Poison and Thunder damage and falling Prone on a failure, or taking half damage only on a success. Before the detonation, an adjacent creature can use an action to vent the marked seam with a successful Dexterity or Intelligence check against the monster's save DC.",
    counterplay:
      "The body glows, whistles, and displays the seam that must be vented; evacuate, move the monster, apply cold, or spend an action to disarm the countdown.",
    tags: ["countdown", "detonation", "disarmable", "decomposition"],
    identity: {
      fantasy: "A corpse whose internal pressure becomes a visible bomb once its body is badly damaged.",
      tacticalRole:
        "One-turn evacuation and disarm challenge that changes the immediate objective of the encounter.",
      signature:
        "Bloodied starts a public countdown; the blast is large, but characters have a full turn to move or vent it.",
      recognitionTags: ["glowing-seam", "one-turn-fuse", "evacuation", "manual-vent"],
    },
    abilities: [
      {
        id: "critical-pressure",
        title: "Dangerously Unstable",
        section: "trait",
        summary: "Bloodied begins a one-turn countdown toward a preventable detonation.",
        mechanics:
          "The first time the creature becomes bloodied, it begins a Critical Pressure countdown. At the end of its next turn, it detonates and drops to 0 hit points. Each other creature within 10 feet makes a Dexterity saving throw, taking standard Poison and Thunder damage and falling Prone on a failure, or taking half damage only on a success. Before the detonation, an adjacent creature can use an action to make a Dexterity (Sleight of Hand) or Intelligence (Investigation) check against the monster's save DC. On a success, the countdown ends, the creature loses its reactions until the start of its next turn, and no detonation occurs.",
        counterplay:
          "Move away, move the monster, use cold to stabilize the seam, or spend an action to vent it before the deadline.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger: "The first time the monster becomes bloodied.",
          resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
          targeting: {
            type: "area",
            shape: "radius",
            size: 10,
            unit: "ft",
            targets: "other creatures",
          },
          areaEffect: {
            enabled: true,
            type: "delayedBurst",
            shape: "emanation",
            size: 10,
            unit: "ft",
            origin: "self",
            timing: "endOfNextTurn",
            repeatTiming: "none",
            targets: "other creatures",
            excludes: ["the monster"],
            text: "The visible countdown detonates at the end of the monster's next turn.",
          },
          damage: budgetDamage({
            types: ["poison", "thunder"],
            scale: "standard",
            role: "rechargeBurst",
            share: 0.8,
            expectedTargets: 2,
          }),
          condition: condition("prone", { severity: "moderate" }),
          text: {
            failure:
              "The target takes {damage} Poison and Thunder damage and has the Prone condition.",
            success: "Half damage only.",
            effect:
              "The monster drops to 0 Hit Points. Before the blast, an adjacent creature can use an action and pass Sleight of Hand or Investigation against the save DC to cancel it; the monster loses Reactions until its next turn.",
          },
        }),
        tags: ["countdown", "save", "disarm", "bloodied"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "When the monster first becomes bloodied, announce the end-of-next-turn detonation and show the vent seam. Resolve it only if the players do not evacuate or disarm it.",
      "Every other creature inside the current detonation radius when the countdown expires.",
      ["critical-pressure"],
      [
        {
          id: "vented",
          label: "Vented",
          when: "An adjacent creature succeeds on the authored disarm check before the countdown expires.",
          sequence: [],
          notes: "Cancel the detonation and remove the monster's reactions until its next turn.",
        },
      ],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        band({
          id: "cr-0-4-contained-fuse",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["critical-pressure"],
          patches: {
            "critical-pressure": {
              mechanics:
                "The first time the creature becomes bloodied, it begins a Critical Pressure countdown. At the end of its next turn, it detonates and drops to 0 hit points. Each other creature within 10 feet makes a Dexterity saving throw, taking standard Poison and Thunder damage and falling Prone on a failure, or taking half damage only on a success. Before the detonation, an adjacent creature can use an action to vent the marked seam with a successful Dexterity or Intelligence check against the monster's save DC.",
              rules: { targeting: { size: 10 }, areaEffect: { size: 10 } },
            },
          },
        }),
        band({
          id: "cr-5-12-violent-fuse",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["critical-pressure"],
          patches: {
            "critical-pressure": {
              mechanics:
                "The first time the creature becomes bloodied, it begins a Critical Pressure countdown. At the end of its next turn, it detonates and drops to 0 hit points. Each other creature within 15 feet makes a Dexterity saving throw, taking standard Poison and Thunder damage and falling Prone on a failure, or taking half damage only on a success. Before the detonation, an adjacent creature can use an action to vent the marked seam with a successful Dexterity or Intelligence check against the monster's save DC.",
              rules: { targeting: { size: 15 }, areaEffect: { size: 15 } },
            },
          },
        }),
        band({
          id: "cr-13-30-catastrophic-fuse",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["critical-pressure"],
          patches: {
            "critical-pressure": {
              mechanics:
                "The first time the creature becomes bloodied, it begins a Critical Pressure countdown. At the end of its next turn, it detonates and drops to 0 hit points. Each other creature within 20 feet makes a Dexterity saving throw, taking standard Poison and Thunder damage and falling Prone on a failure, or taking half damage only on a success. Before the detonation, an adjacent creature can use an action to vent the marked seam with a successful Dexterity or Intelligence check against the monster's save DC.",
              rules: { targeting: { size: 20 }, areaEffect: { size: 20 } },
            },
          },
        }),
      ],
    },
    balanceProfile: balance(
      { dpr: 4, control: 3, fairness: 3 },
      { attrition: 0, spike: 4, reliability: 1, control: 3, area: 1, tempo: 3, offTurn: 0, survival: -1, fairness: 3 },
    ),
    complexityProfile: profile({ decision: 3, sequencing: 3, branches: 2, tracking: 2 }),
    counterplayProfile: {
      telegraphs: ["Bloodied makes the corpse glow from within, whistle through one marked seam, and begin a public one-turn countdown."],
      positioningAnswers: ["Evacuate the radius or force the monster into an isolated position before the deadline."],
      breakConditions: ["A successful adjacent disarm check ends the countdown before detonation."],
      nonDamageAnswers: ["Move the monster, apply cold to stabilize it, or use an action to vent the marked seam."],
    },
    spikeRiskProfile: spike({ control: 3, damage: 4, repeatability: 0 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["slow", "standard"],
      tacticalRoles: ["brute", "controller"],
    }),
    editorial: editorial(
      "REWRITE_AS_COUNTDOWN",
      "The old hidden d6 could destroy the monster and punish an eighty-foot area without a meaningful response. The new version is a one-turn public fuse with evacuation and disarm play.",
    ),
  },

  "undead-fortitude": {
    title: "Undead Fortitude",
    cost: 4,
    complexity: 1,
    stats: { hp: 12, fairness: 3 },
    summary:
      "The canonical false-death trait keeps the corpse standing unless the killing blow uses the known answer.",
    mechanics:
      "If damage reduces the creature to 0 hit points, it makes a Constitution saving throw with a DC equal to 5 plus the damage taken, unless the damage is radiant or from a critical hit. On a success, it drops to 1 hit point instead.",
    counterplay:
      "Radiant damage, critical hits, and sufficiently large finishing blows bypass or overwhelm the trait.",
    tags: ["canonical", "false-death", "undead", "finisher-counterplay"],
    identity: {
      fantasy: "A corpse that falls, twitches, and stands again unless destroyed in the correct way.",
      tacticalRole:
        "Canonical finishing-blow check that rewards radiant damage, critical hits, and concentrated damage.",
      signature:
        "Dropping to 0 Hit Points can become a false death, but radiant damage and critical hits prevent the save.",
      recognitionTags: ["false-collapse", "one-hit-point", "radiant-answer", "critical-answer"],
    },
    abilities: [
      {
        id: "undead-fortitude",
        title: "Undead Fortitude",
        section: "trait",
        summary: "A non-radiant, noncritical killing blow may leave the corpse at 1 hit point.",
        mechanics:
          "If damage reduces the creature to 0 hit points, it makes a Constitution saving throw with a DC equal to 5 plus the damage taken, unless the damage is radiant or from a critical hit. On a success, it drops to 1 hit point instead.",
        counterplay:
          "Use radiant damage, seek a critical hit, or deliver a larger finishing blow that raises the save DC.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "triggered" },
          trigger: "Damage reduces the monster to 0 Hit Points.",
          resolution: { type: "savingThrow", ability: "constitution", dc: "special" },
          text: {
            source: "manual",
            manual:
              "If damage reduces the monster to 0 Hit Points, unless the damage is Radiant or from a Critical Hit, the monster makes a Constitution Saving Throw with a DC equal to 5 plus the damage taken. On a success, it drops to 1 Hit Point instead.",
            failure: "The monster remains at 0 Hit Points.",
            success: "The monster drops to 1 Hit Point instead.",
          },
        }),
        tags: ["canonical", "triggered", "survival", "false-death"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Apply the canonical save whenever an eligible hit reduces the monster to 0 Hit Points; describe the false collapse before revealing the result.",
      "The monster itself makes the Constitution save against 5 plus the triggering damage.",
      ["undead-fortitude"],
    ),
    balanceProfile: balance(
      { hp: 12, fairness: 3 },
      { attrition: 0, spike: 0, reliability: 1, control: 0, area: 0, tempo: 2, offTurn: 0, survival: 12, fairness: 3 },
    ),
    complexityProfile: profile({ decision: 1, sequencing: 1, branches: 1, tracking: 0 }),
    counterplayProfile: {
      telegraphs: ["The corpse falls with residual movement still visible in its limbs and jaw."],
      positioningAnswers: ["Coordinate the finishing blow so the party can immediately follow up if the corpse rises at 1 Hit Point."],
      breakConditions: ["Radiant damage or a Critical Hit prevents the saving throw."],
      nonDamageAnswers: ["Prepare advantage, paralysis, or another setup that increases the chance of a Critical Hit before the finisher."],
    },
    spikeRiskProfile: spike({ damage: 0, control: 0, repeatability: 2 }),
    fit: fit({
      encounterRoles: ["minion", "standard", "boss"],
      tempo: ["slow", "standard"],
      tacticalRoles: ["brute", "controller"],
    }),
    editorial: editorial(
      "KEEP_CANONICAL",
      "Undead Fortitude is a recognizable Bestiary trait with built-in counterplay. The revision preserves its canonical name and core wording while documenting its encounter function and fairness requirements.",
    ),
  },

  "siege-corpse": {
    title: "Siege Monster",
    cost: 3,
    complexity: 2,
    stats: { control: 2, fairness: 2 },
    summary:
      "The canonical siege trait turns doors, barricades, and fragile architecture into temporary terrain rather than reliable protection.",
    mechanics:
      "The creature deals double damage to objects and structures. The first time each encounter it destroys a Large or larger object or section of structure, the destroyed space becomes difficult terrain and grants Half Cover until cleared.",
    counterplay:
      "Do not rely on one barricade; lure it away from load-bearing terrain, reinforce key structures, or use the breach as cover against the monster.",
    tags: ["canonical", "siege", "terrain-change", "breach"],
    identity: {
      fantasy: "A corpse massive enough to turn architecture into part of the fight.",
      tacticalRole:
        "Canonical object destruction that creates a one-time terrain shift when a major barrier falls.",
      signature:
        "It deals double damage to objects and structures, then leaves the first major breach as difficult terrain and cover.",
      recognitionTags: ["double-object-damage", "broken-wall", "falling-debris", "new-cover"],
    },
    abilities: [
      {
        id: "siege-monster",
        title: "Siege Monster",
        section: "trait",
        summary: "The monster deals double damage to objects and structures.",
        mechanics: "The creature deals double damage to objects and structures.",
        counterplay:
          "Use open ground, reinforce critical objects, or preserve distance from structures the monster can collapse.",
        rules: twistRules({
          text: { effect: "The monster deals double damage to objects and structures." },
        }),
        tags: ["canonical", "trait", "object-damage"],
        authored: true,
      },
      {
        id: "breach",
        title: "Breach",
        section: "trait",
        summary: "The first major structure destroyed becomes new difficult terrain and cover.",
        mechanics:
          "The first time each encounter the creature destroys a Large or larger object or section of structure, the destroyed space becomes difficult terrain and grants Half Cover until a creature clears it using an action or sufficient movement of debris.",
        counterplay:
          "Choose where the breach occurs, clear it, or use the debris as cover against the monster.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger:
            "The monster destroys a Large or larger object or section of structure.",
          targeting: { type: "area", shape: "space", size: 10, unit: "ft", targets: "the destroyed space" },
          areaEffect: {
            enabled: true,
            type: "terrain",
            shape: "space",
            size: 10,
            unit: "ft",
            origin: "destroyed structure",
            timing: "immediate",
            repeatTiming: "none",
            targets: "the destroyed space",
            excludes: [],
            text:
              "The first time each encounter the monster destroys a Large or larger object or section of structure, the resulting 10-foot space becomes difficult terrain and grants Half Cover until cleared.",
          },
          text: {
            effect:
              "The destroyed space becomes difficult terrain and grants Half Cover until a creature clears it using an action or sufficient movement of debris.",
          },
        }),
        tags: ["terrain", "cover", "one-per-encounter"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Use Siege Monster to pressure meaningful terrain, then resolve Breach only for the first major destruction so the scene changes once without constant debris tracking.",
      "A door, barricade, wall, pillar, bridge, or other structure whose destruction creates a decision rather than only cosmetic damage.",
      ["siege-monster", "breach"],
    ),
    balanceProfile: balance(
      { control: 2, fairness: 2 },
      { attrition: 0, spike: 0, reliability: 2, control: 2, area: 1, tempo: 2, offTurn: 0, survival: 0, fairness: 2 },
    ),
    complexityProfile: profile({ decision: 2, sequencing: 2, branches: 1, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The monster strikes doors, columns, and barricades with enough force to crack them before the final blow."],
      positioningAnswers: ["Fight in open ground or stand where a collapse will create useful cover rather than trap the party."],
      breakConditions: ["Clearing or moving the debris removes the difficult terrain and Half Cover."],
      nonDamageAnswers: ["Reinforce structures, open doors before impact, lure the monster away, or exploit the breach it creates."],
    },
    spikeRiskProfile: spike({ control: 2, damage: 0, repeatability: 1 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["slow", "standard"],
      tacticalRoles: ["brute", "controller"],
    }),
    editorial: editorial(
      "EXPAND_CANONICAL_SCENE_TWIST",
      "The exact Siege Monster name and double-damage rule are preserved. A bounded first breach makes the Graft change encounter geometry rather than remain a passive ribbon.",
    ),
  },

  "flesh-harvest": {
    title: "Flesh Harvest",
    cost: 5,
    complexity: 3,
    stats: { hp: 12, mobility: 1, fairness: 2 },
    summary:
      "Consuming one corpse creates a bounded Sated phase instead of an unlimited permanent stack of attack, damage, and Armor Class bonuses.",
    mechanics:
      "Once per encounter as an action, the creature consumes a Medium or smaller corpse within 5 feet. It ends one condition affecting it and gains temporary hit points. While any of those temporary hit points remain, its speed increases by 10 feet and it cannot benefit from being Invisible or disguised. The temporary hit points scale with CR.",
    counterplay:
      "Remove, burn, consecrate, or guard corpses; if the harvest occurs, strip the temporary hit points to end the faster Sated phase.",
    tags: ["corpse-resource", "phase-change", "temporary-hit-points", "jikininki"],
    identity: {
      fantasy: "A starving spirit that becomes visibly solid and swollen after devouring a body.",
      tacticalRole:
        "Corpse-powered recovery phase whose temporary durability also exposes the monster and changes its movement.",
      signature:
        "One corpse grants temporary hit points and speed, but removes invisibility and disguise until the borrowed flesh is stripped away.",
      recognitionTags: ["corpse-consumption", "sated-form", "borrowed-flesh", "visible-phase"],
    },
    abilities: [
      {
        id: "flesh-harvest",
        title: "Flesh Harvest",
        section: "action",
        summary: "The spirit consumes one corpse to enter a visible Sated phase.",
        mechanics:
          "Once per encounter, the creature consumes a Medium or smaller corpse within 5 feet. It ends one condition affecting it and gains 5 temporary hit points.",
        counterplay:
          "Remove or protect corpses before the action can be used, or interrupt access to the chosen body.",
        rules: twistRules({
          section: "action",
          actionEconomy: "action",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger: "A Medium or smaller corpse is within 5 feet.",
          targeting: { type: "object", targets: "one Medium or smaller corpse within 5 feet" },
          text: {
            effect:
              "The monster consumes the corpse, ends one condition affecting it, and gains 5 temporary Hit Points.",
          },
          procedure: {
            prerequisite: "A valid corpse is within 5 feet and can be consumed.",
          },
        }),
        tags: ["action", "corpse", "recovery", "once-per-encounter"],
        authored: true,
      },
      {
        id: "sated-form",
        title: "Sated Form",
        section: "trait",
        summary: "Borrowed flesh makes the spirit faster but prevents invisibility and disguise.",
        mechanics:
          "While the creature has temporary hit points granted by Flesh Harvest, its speed increases by 10 feet and it cannot benefit from being Invisible or disguised.",
        counterplay:
          "Remove the temporary hit points to end the speed increase and restore the creature's normal phase.",
        rules: twistRules({
          trigger: "The monster has temporary Hit Points granted by Flesh Harvest.",
          text: {
            effect:
              "The monster's speed increases by 10 feet, and it cannot benefit from being Invisible or disguised. This state ends when those temporary Hit Points are gone.",
          },
          procedure: {
            prerequisite:
              "The monster has temporary Hit Points granted by Flesh Harvest.",
          },
        }),
        tags: ["phase", "speed", "visibility-cost"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Use Flesh Harvest only when a corpse is available and the action cost creates a meaningful pause. Afterward, run Sated Form until its temporary hit points are removed.",
      "A Medium or smaller corpse that players could have removed, protected, burned, or consecrated.",
      ["flesh-harvest", "sated-form"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        band({
          id: "cr-0-4-small-meal",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["flesh-harvest", "sated-form"],
          patches: {
            "flesh-harvest": {
              mechanics:
                "Once per encounter, the creature consumes a Medium or smaller corpse within 5 feet. It ends one condition affecting it and gains 5 temporary hit points.",
              rules: { text: { effect: "The monster consumes the corpse, ends one condition affecting it, and gains 5 temporary Hit Points." } },
            },
          },
        }),
        band({
          id: "cr-5-12-full-meal",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["flesh-harvest", "sated-form"],
          patches: {
            "flesh-harvest": {
              mechanics:
                "Once per encounter, the creature consumes a Medium or smaller corpse within 5 feet. It ends one condition affecting it and gains 15 temporary hit points.",
              rules: { text: { effect: "The monster consumes the corpse, ends one condition affecting it, and gains 15 temporary Hit Points." } },
            },
          },
        }),
        band({
          id: "cr-13-30-gorged-form",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["flesh-harvest", "sated-form"],
          patches: {
            "flesh-harvest": {
              mechanics:
                "Once per encounter, the creature consumes a Medium or smaller corpse within 5 feet. It ends one condition affecting it and gains 30 temporary hit points.",
              rules: { text: { effect: "The monster consumes the corpse, ends one condition affecting it, and gains 30 temporary Hit Points." } },
            },
          },
        }),
      ],
    },
    balanceProfile: balance(
      { hp: 12, mobility: 1, fairness: 2 },
      { attrition: 0, spike: 0, reliability: 1, control: 0, area: 0, tempo: 2, offTurn: 0, survival: 12, fairness: 2 },
    ),
    complexityProfile: profile({ decision: 2, sequencing: 3, branches: 2, tracking: 2 }),
    counterplayProfile: {
      telegraphs: ["The spirit repeatedly looks toward nearby corpses and its hollow torso opens before it feeds."],
      positioningAnswers: ["Control the route between the spirit and usable corpses or force it to spend movement before the action."],
      breakConditions: ["Removing the temporary Hit Points ends Sated Form."],
      nonDamageAnswers: ["Move, burn, consecrate, disguise, or guard corpses before Flesh Harvest can target them."],
    },
    spikeRiskProfile: spike({ control: 0, damage: 0, repeatability: 0 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "fast"],
      tacticalRoles: ["brute", "skirmisher", "lurker"],
    }),
    editorial: editorial(
      "EXPAND_INTO_PHASE",
      "The old stacking bonus could grow without a practical bound and lasted until dawn. The revision creates one readable corpse-powered phase with a clear action cost, finite temporary durability, and an exposure tradeoff.",
    ),
  },

  "horrific-assault": {
    title: "Horrific Assault",
    cost: 4,
    complexity: 3,
    stats: { mobility: 1, control: 2, fairness: 3 },
    summary:
      "A seemingly ordinary corpse becomes the attacker, but inspection and readied play can expose the ambush before it begins.",
    mechanics:
      "Until it moves, acts, or is identified, the creature is indistinguishable from an ordinary corpse. A creature within 5 feet can use an action to identify it with a successful Wisdom (Medicine) or Intelligence (Investigation) check against the monster's save DC. When the disguise ends, the creature can move up to half its speed without provoking Opportunity Attacks, and creatures that did not identify it cannot take reactions until the start of their next turns.",
    counterplay:
      "Inspect suspicious corpses, keep distance, use light or magic that detects undead, and ready actions instead of approaching carelessly.",
    tags: ["false-corpse", "ambush-reveal", "inspection", "jikininki"],
    identity: {
      fantasy: "A corpse among corpses that becomes the predator only after someone accepts the scene as safe.",
      tacticalRole:
        "Ambush premise reversal with an inspection procedure and a bounded reaction-denial window.",
      signature:
        "The false corpse can be identified before it rises; otherwise its reveal grants one half-speed reposition without Opportunity Attacks.",
      recognitionTags: ["false-corpse", "inspection-check", "sudden-rise", "reaction-denial"],
    },
    abilities: [
      {
        id: "false-corpse",
        title: "False Corpse",
        section: "trait",
        summary: "The monster remains indistinguishable from an ordinary corpse until revealed or inspected.",
        mechanics:
          "Until it moves, acts, or is identified, the creature is indistinguishable from an ordinary corpse. A creature within 5 feet can use an action to make a Wisdom (Medicine) or Intelligence (Investigation) check against the monster's save DC, identifying it on a success.",
        counterplay:
          "Inspect the body from a controlled position or use magic and senses that reveal undead or disguised creatures.",
        rules: twistRules({
          trigger: "The monster has not moved, acted, or been identified.",
          resolution: { type: "check", ability: "wisdom", dc: "monster" },
          targeting: { type: "self", targets: "the monster while motionless" },
          text: {
            effect:
              "The monster is indistinguishable from an ordinary corpse. A creature within 5 feet can use an action to make a Wisdom (Medicine) or Intelligence (Investigation) check against the monster's save DC, identifying it on a success.",
          },
          procedure: {
            prerequisite: "The monster has not moved or acted.",
          },
        }),
        tags: ["disguise", "check", "ambush"],
        authored: true,
      },
      {
        id: "horrific-assault",
        title: "Horrific Assault",
        section: "trait",
        summary: "The reveal grants one reposition and briefly denies reactions from creatures that missed the signs.",
        mechanics:
          "When False Corpse ends, the creature can move up to half its speed without provoking Opportunity Attacks. A creature that did not identify it cannot take reactions until the start of that creature's next turn.",
        counterplay:
          "Identifying the false corpse prevents the reaction denial; keeping distance limits the value of the free reposition.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger: "False Corpse ends because the monster moves, acts, or is revealed.",
          text: {
            effect:
              "The monster can move up to half its speed without provoking Opportunity Attacks. A creature that did not identify it cannot take reactions until the start of that creature's next turn.",
          },
          procedure: {
            prerequisite: "False Corpse has just ended.",
          },
        }),
        tags: ["reveal", "movement", "reaction-denial"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Begin as a false corpse only when the scene supports the disguise. Give characters a fair inspection opportunity, then resolve the reveal once.",
      "Characters who approach, inspect, or pass the false corpse before the reveal.",
      ["false-corpse", "horrific-assault"],
    ),
    balanceProfile: balance(
      { mobility: 1, control: 2, fairness: 3 },
      { attrition: 0, spike: 1, reliability: 1, control: 2, area: 0, tempo: 3, offTurn: 0, survival: 0, fairness: 3 },
    ),
    complexityProfile: profile({ decision: 2, sequencing: 3, branches: 2, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The corpse has subtle warmth, fresh tension in the fingers, and disturbed dust beneath it."],
      positioningAnswers: ["Remain beyond half the monster's speed while inspecting or keep a clear retreat lane."],
      breakConditions: ["A successful Medicine or Investigation check identifies the monster before the reveal."],
      nonDamageAnswers: ["Use detection magic, familiars, poles, mirrors, or readied actions to test the corpse from safety."],
    },
    spikeRiskProfile: spike({ opening: 2, control: 2, damage: 0, repeatability: 0 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["ambusher", "fast"],
      tacticalRoles: ["lurker", "skirmisher"],
    }),
    editorial: editorial(
      "REWRITE_AS_AMBUSH_REVEAL",
      "Automatic critical hits against surprised targets created excessive opening variance. The new ambush is inspectable and grants only a bounded reposition and reaction-denial window.",
    ),
  },

  "no-witnesses-rage": {
    title: "Witness Rage",
    cost: 4,
    complexity: 2,
    stats: { dpr: 1, mobility: 1, fairness: 2 },
    summary:
      "Being seen feeding turns shame into a pursuit state that can be broken by denying the witness relationship.",
    mechanics:
      "When a hostile creature sees the monster consume a corpse or repugnant meal, the monster can use its reaction to move up to its speed toward that witness without provoking Opportunity Attacks. For 1 minute, the first time each turn it hits a visible witness, it deals extra Necrotic damage equal to its proficiency bonus, and it cannot willingly end its turn farther from every visible witness. The rage ends early if it starts a turn unable to see a witness.",
    counterplay:
      "Break line of sight, use decoys or illusions, control who witnesses the feeding, or force the monster to pursue a bad target.",
    tags: ["witness", "rage", "pursuit-state", "jikininki"],
    identity: {
      fantasy: "A corpse eater whose shame becomes immediate violence against anyone who sees the act.",
      tacticalRole:
        "Witness-marked pursuit phase that creates a manipulable target and ends when the relationship is broken.",
      signature:
        "The witness determines the monster's movement and bonus damage until line of sight is fully denied.",
      recognitionTags: ["feeding-witness", "shame-rage", "forced-pursuit", "line-of-sight-break"],
    },
    abilities: [
      {
        id: "witness-rage",
        title: "Witness Rage",
        section: "reaction",
        summary: "A witnessed feeding triggers a pursuit state against the observers.",
        mechanics:
          "When a hostile creature sees the monster consume a corpse or repugnant meal, the monster can use its reaction to move up to its speed toward that witness without provoking Opportunity Attacks. For 1 minute, the first time each turn it hits a visible witness, it deals extra Necrotic damage equal to its proficiency bonus, and it cannot willingly end its turn farther from every visible witness. The rage ends early if it starts a turn unable to see a witness.",
        counterplay:
          "Break line of sight, create a false witness, or use the marked character to pull the monster into a prepared position.",
        rules: twistRules({
          section: "reaction",
          actionEconomy: "reaction",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger:
            "A hostile creature sees the monster consume a corpse or repugnant meal.",
          targeting: { type: "creature", targets: "one visible witness" },
          damage: {
            mode: "computed",
            budgetRole: "minorAttack",
            types: ["necrotic"],
            scale: "minor",
            budgetShare: 0.2,
            expectedTargets: 1,
            formula: "proficiency bonus",
            parts: [],
          },
          text: {
            effect:
              "The monster moves up to its speed toward the witness without provoking Opportunity Attacks. For 1 minute, the first time each turn it hits a visible witness, it deals extra Necrotic damage equal to its Proficiency Bonus, and it cannot willingly end its turn farther from every visible witness. The rage ends early if it starts a turn unable to see a witness.",
          },
          procedure: {
            prerequisite: "A hostile witness sees the feeding occur.",
          },
        }),
        tags: ["reaction", "pursuit", "computed-damage", "line-of-sight"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Mark every hostile creature that sees the feeding, use the reaction toward one of them, and pursue visible witnesses until all sight lines are broken.",
      "A visible hostile witness, prioritizing the one whose position creates the clearest pursuit lane.",
      ["witness-rage"],
    ),
    balanceProfile: balance(
      { dpr: 1, mobility: 1, fairness: 2 },
      { attrition: 1, spike: 1, reliability: 1, control: 1, area: 0, tempo: 3, offTurn: 1, survival: 0, fairness: 2 },
    ),
    complexityProfile: profile({ decision: 2, sequencing: 2, branches: 2, tracking: 2 }),
    counterplayProfile: {
      telegraphs: ["The monster freezes when observed feeding, then fixes every witness with immediate violent attention."],
      positioningAnswers: ["Let a durable or well-positioned character become the witness and drag the monster into a prepared lane."],
      breakConditions: ["The rage ends early when the monster starts a turn unable to see any witness."],
      nonDamageAnswers: ["Break line of sight, use darkness or illusions, avert observation of the feeding, or create a decoy witness."],
    },
    spikeRiskProfile: spike({ opening: 1, control: 1, damage: 1, repeatability: 1 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["fast", "ambusher"],
      tacticalRoles: ["brute", "lurker", "skirmisher"],
    }),
    editorial: editorial(
      "RENAME_AND_REWRITE",
      "The old minute-long stat buff included an irrelevant Intelligence advantage and no practical break condition. Witness Rage now creates a readable pursuit state that players can manipulate or end through line of sight.",
    ),
  },

  "enrage-broodmother": {
    title: "Enrage",
    cost: 4,
    complexity: 2,
    stats: { mobility: 2, fairness: 3 },
    summary:
      "Destroying an egg triggers one deterministic retaliatory surge whose target and timing the players choose.",
    mechanics:
      "Once per encounter, when a creature destroys an egg carried or guarded by the monster, the monster can use its reaction to move up to half its speed toward that creature without provoking Opportunity Attacks. Until the end of its next turn, its speed increases by 10 feet and it cannot willingly move farther from that creature.",
    counterplay:
      "Choose which character destroys the egg, do it from range or behind a barrier, and prepare control effects before triggering the surge.",
    tags: ["egg-trigger", "retaliation", "deterministic", "wolf-spiders"],
    identity: {
      fantasy: "A brood carrier that reacts to a destroyed egg with one violent, immediate surge.",
      tacticalRole:
        "Player-triggered retaliation whose target and timing can be deliberately manipulated.",
      signature:
        "Destroying an egg grants one reaction move and a one-turn pursuit state, with no hidden die roll.",
      recognitionTags: ["broken-egg", "brood-rage", "reaction-rush", "chosen-trigger"],
    },
    abilities: [
      {
        id: "enrage",
        title: "Enrage",
        section: "reaction",
        summary: "A destroyed egg triggers one brief retaliatory rush.",
        mechanics:
          "Once per encounter, when a creature destroys an egg carried or guarded by the monster, the monster can use its reaction to move up to half its speed toward that creature without provoking Opportunity Attacks. Until the end of its next turn, its speed increases by 10 feet and it cannot willingly move farther from that creature.",
        counterplay:
          "Trigger the rage from a prepared position, behind a barrier, or with a durable character who can absorb the retaliation.",
        rules: twistRules({
          section: "reaction",
          actionEconomy: "reaction",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger: "A creature destroys an egg carried or guarded by the monster.",
          targeting: { type: "creature", targets: "the creature that destroyed the egg" },
          damage: noDamage(),
          text: {
            effect:
              "The monster moves up to half its speed toward the triggering creature without provoking Opportunity Attacks. Until the end of its next turn, its speed increases by 10 feet and it cannot willingly move farther from that creature.",
          },
          procedure: {
            prerequisite: "A carried or guarded egg has just been destroyed.",
          },
        }),
        tags: ["reaction", "egg", "movement", "pursuit"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Resolve Enrage immediately when the players choose to destroy an egg, then remove the state at the end of the monster's next turn.",
      "The creature that destroyed the egg.",
      ["enrage"],
    ),
    balanceProfile: balance(
      { mobility: 2, fairness: 3 },
      { attrition: 0, spike: 0, reliability: 1, control: 1, area: 0, tempo: 3, offTurn: 1, survival: 0, fairness: 3 },
    ),
    complexityProfile: profile({ decision: 1, sequencing: 2, branches: 1, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The monster's limbs tense around each egg and its attention snaps toward any threat to the brood."],
      positioningAnswers: ["Destroy the egg from range, behind cover, or from a position that forces a bad pursuit route."],
      breakConditions: ["The speed and damage increase end at the end of the monster's next turn."],
      nonDamageAnswers: ["Restrain, block, distract, or bait the monster before deliberately triggering the rage."],
    },
    spikeRiskProfile: spike({ opening: 1, control: 1, damage: 0, repeatability: 0 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["fast", "ambusher"],
      tacticalRoles: ["brute", "skirmisher"],
    }),
    editorial: editorial(
      "REWRITE_AS_DETERMINISTIC_TRIGGER",
      "The old d6 made destroying an egg unpredictably safe or punishing and granted an encounter-long stat package. The revision makes the player-chosen trigger deterministic and the retaliation brief.",
    ),
  },

  "web-architect": {
    title: "Web Architect",
    cost: 5,
    complexity: 3,
    stats: { control: 3, fairness: 3 },
    summary:
      "A visible web network is prepared before combat, then reconfigured once at bloodied to change the arena.",
    mechanics:
      "At the start of the encounter, the monster marks two visible web anchors. The first time it becomes bloodied, it connects surviving anchors with one opaque wall of web. The wall is difficult terrain, grants Half Cover through it, and lasts until either anchor is destroyed or the web is burned or cut. Anchor count and wall count scale with CR.",
    counterplay:
      "Destroy or occupy anchors before bloodied, spread away from likely connections, or burn and cut the new web walls after they appear.",
    tags: ["web-network", "bloodied-phase", "terrain-wall", "wolf-spiders"],
    identity: {
      fantasy: "A spider that has planned the room as an engineered web system rather than a collection of loose strands.",
      tacticalRole:
        "One-time bloodied terrain reconfiguration built from visible, destructible anchors.",
      signature:
        "Prepared anchors reveal the future lanes; bloodied connects them into cover and difficult terrain.",
      recognitionTags: ["web-anchors", "planned-lines", "bloodied-wall", "destructible-network"],
    },
    abilities: [
      {
        id: "web-network",
        title: "Web Network",
        section: "trait",
        summary: "The monster prepares visible anchors that define its later terrain shift.",
        mechanics:
          "At the start of the encounter, the monster marks two visible web anchors on surfaces it can reach. An anchor is a fragile object that can be cut, burned, occupied, or destroyed.",
        counterplay:
          "Destroy, occupy, or separate the anchors before the monster becomes bloodied.",
        rules: twistRules({
          trigger: "At the start of the encounter.",
          targeting: { type: "object", targets: "two visible web anchors on reachable surfaces" },
          text: {
            effect:
              "The monster marks two visible web anchors. Each anchor is a fragile object that can be cut, burned, occupied, or destroyed.",
          },
          procedure: { prerequisite: "The encounter area contains reachable surfaces." },
        }),
        tags: ["setup", "objects", "anchors"],
        authored: true,
      },
      {
        id: "reconfigure-webs",
        title: "Reconfigure Webs",
        section: "trait",
        summary: "Bloodied connects surviving anchors into new web walls that change the arena.",
        mechanics:
          "The first time the monster becomes bloodied, it connects two surviving anchors with one opaque wall of web. The wall is difficult terrain, grants Half Cover through it, and lasts until either anchor is destroyed or the web is burned or cut.",
        counterplay:
          "Break an anchor before bloodied or destroy one after the wall appears to collapse the whole connection.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger: "The first time the monster becomes bloodied.",
          targeting: { type: "area", shape: "line", size: 30, unit: "ft", targets: "the space between two surviving anchors" },
          areaEffect: {
            enabled: true,
            type: "terrain",
            shape: "line",
            size: 30,
            unit: "ft",
            origin: "web anchors",
            timing: "immediate",
            repeatTiming: "none",
            targets: "the space between two surviving anchors",
            excludes: [],
            text:
              "The first time the monster becomes bloodied, each new wall occupies a 30-foot-long, 5-foot-wide Line between two surviving anchors. The wall is difficult terrain and grants Half Cover through it until an anchor is destroyed or the wall is burned or cut.",
          },
          text: {
            effect:
              "The monster connects two surviving anchors with one opaque wall of web. The wall is difficult terrain, grants Half Cover through it, and lasts until either anchor is destroyed or the wall is burned or cut.",
          },
        }),
        tags: ["bloodied", "terrain", "cover", "destructible"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Place anchors where their future connections are obvious. When first bloodied, connect only surviving anchors and announce the new movement and cover lines.",
      "Anchor pairs whose connection creates a meaningful but answerable change to movement or sight lines.",
      ["web-network", "reconfigure-webs"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        band({
          id: "cr-0-4-small-network",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["web-network", "reconfigure-webs"],
          patches: {
            "web-network": {
              mechanics:
                "At the start of the encounter, the monster marks two visible web anchors on surfaces it can reach. An anchor is a fragile object that can be cut, burned, occupied, or destroyed.",
              rules: { text: { effect: "The monster marks two visible web anchors. Each anchor is a fragile object that can be cut, burned, occupied, or destroyed." } },
            },
            "reconfigure-webs": {
              mechanics:
                "The first time the monster becomes bloodied, it connects two surviving anchors with one opaque wall of web. The wall is difficult terrain, grants Half Cover through it, and lasts until either anchor is destroyed or the web is burned or cut.",
            },
          },
        }),
        band({
          id: "cr-5-12-web-plan",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["web-network", "reconfigure-webs"],
          patches: {
            "web-network": {
              mechanics:
                "At the start of the encounter, the monster marks three visible web anchors on surfaces it can reach. An anchor is a fragile object that can be cut, burned, occupied, or destroyed.",
              rules: { text: { effect: "The monster marks three visible web anchors. Each anchor is a fragile object that can be cut, burned, occupied, or destroyed." } },
            },
            "reconfigure-webs": {
              mechanics:
                "The first time the monster becomes bloodied, it connects surviving anchors with up to two opaque walls of web. Each wall is difficult terrain, grants Half Cover through it, and lasts until one of its anchors is destroyed or the web is burned or cut.",
              rules: { text: { effect: "The monster connects surviving anchors with up to two opaque walls of web. Each wall is difficult terrain, grants Half Cover through it, and lasts until one of its anchors is destroyed or the web is burned or cut." } },
            },
          },
        }),
        band({
          id: "cr-13-30-master-network",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["web-network", "reconfigure-webs"],
          patches: {
            "web-network": {
              mechanics:
                "At the start of the encounter, the monster marks four visible web anchors on surfaces it can reach. An anchor is a fragile object that can be cut, burned, occupied, or destroyed.",
              rules: { text: { effect: "The monster marks four visible web anchors. Each anchor is a fragile object that can be cut, burned, occupied, or destroyed." } },
            },
            "reconfigure-webs": {
              mechanics:
                "The first time the monster becomes bloodied, it connects surviving anchors with up to three opaque walls of web. Each wall is difficult terrain, grants Half Cover through it, and lasts until one of its anchors is destroyed or the web is burned or cut.",
              rules: { text: { effect: "The monster connects surviving anchors with up to three opaque walls of web. Each wall is difficult terrain, grants Half Cover through it, and lasts until one of its anchors is destroyed or the web is burned or cut." } },
            },
          },
        }),
      ],
    },
    balanceProfile: balance(
      { control: 3, fairness: 3 },
      { attrition: 0, spike: 0, reliability: 1, control: 3, area: 1, tempo: 3, offTurn: 0, survival: 0, fairness: 3 },
    ),
    complexityProfile: profile({ decision: 3, sequencing: 3, branches: 2, tracking: 3 }),
    counterplayProfile: {
      telegraphs: ["The monster visibly marks every web anchor before combat and the future connection lines can be inferred."],
      positioningAnswers: ["Stand away from likely anchor lines or use the future wall placement to plan cover of your own."],
      breakConditions: ["Destroying either anchor collapses the wall connected to it."],
      nonDamageAnswers: ["Occupy, cut, burn, move, or block anchors before the bloodied trigger occurs."],
    },
    spikeRiskProfile: spike({ control: 3, damage: 0, repeatability: 0 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "slow"],
      tacticalRoles: ["controller", "support", "artillery"],
    }),
    editorial: editorial(
      "EXPAND_INTO_TERRAIN_PHASE",
      "The old static AC and hit point bonuses made webs tougher without changing play. The new network creates visible setup objects and a one-time bloodied geometry shift with multiple non-damage answers.",
    ),
  },

  "corrosive-web": {
    title: "Corrosive Web",
    cost: 4,
    complexity: 2,
    stats: { dpr: 2, control: 2, fairness: 2 },
    summary:
      "Destroying a marked web releases its acid reservoir, making the obvious answer briefly dangerous but still controllable.",
    mechanics:
      "The first time each round a web created by the monster is destroyed, acid sprays from that web. Creatures within 5 feet make a Dexterity saving throw, taking minor Acid damage on a failure, or half damage on a success. The affected space is difficult terrain until the end of the monster's next turn. The radius scales with CR.",
    counterplay:
      "Destroy webs from range, clear allies first, neutralize the reservoir with water or alkali, or accept the brief hazard after choosing the safest web.",
    tags: ["web-destruction", "acid", "reversal", "wolf-spiders"],
    identity: {
      fantasy: "Web strands with visible green reservoirs that burst when the silk is cut or burned.",
      tacticalRole:
        "Destruction reversal that complicates web removal for one round without making the webs permanent.",
      signature:
        "The first web destroyed each round sprays acid and leaves a short-lived caustic patch.",
      recognitionTags: ["green-reservoir", "web-burst", "caustic-ground", "ranged-removal"],
    },
    abilities: [
      {
        id: "corrosive-web",
        title: "Corrosive Web",
        section: "trait",
        summary: "The first destroyed web each round releases acid and creates brief difficult terrain.",
        mechanics:
          "The first time each round a web created by the monster is destroyed, each creature within 5 feet of that web makes a Dexterity saving throw, taking minor Acid damage on a failure, or half damage on a success. The affected space is difficult terrain until the end of the monster's next turn.",
        counterplay:
          "Destroy the web from outside the radius, move allies first, or neutralize the acid reservoir before cutting it.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "triggered" },
          trigger:
            "The first time each round a web created by the monster is destroyed.",
          resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
          targeting: {
            type: "area",
            shape: "radius",
            size: 5,
            unit: "ft",
            targets: "creatures near the destroyed web",
          },
          areaEffect: {
            enabled: true,
            type: "terrain",
            shape: "radius",
            size: 5,
            unit: "ft",
            origin: "destroyed web",
            timing: "immediate",
            repeatTiming: "oncePerRound",
            targets: "the affected space",
            excludes: [],
            text:
              "The affected space is difficult terrain until the end of the monster's next turn.",
          },
          damage: budgetDamage({
            types: ["acid"],
            scale: "minor",
            role: "reactionPunish",
            share: 0.35,
            expectedTargets: 1.5,
          }),
          text: {
            failure: "The target takes {damage} Acid damage.",
            success: "Half damage only.",
            effect:
              "The affected space is difficult terrain until the end of the monster's next turn.",
          },
        }),
        tags: ["save", "acid", "terrain", "once-per-round"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "Resolve the acid spray only for the first web destroyed each round, then mark the brief caustic terrain until the monster's next turn ends.",
      "Creatures within the current radius of the destroyed web.",
      ["corrosive-web"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        band({
          id: "cr-0-7-acid-pocket",
          minCr: 0,
          maxCr: 7,
          abilityIds: ["corrosive-web"],
          patches: {
            "corrosive-web": {
              mechanics:
                "The first time each round a web created by the monster is destroyed, each creature within 5 feet of that web makes a Dexterity saving throw, taking minor Acid damage on a failure, or half damage on a success. The affected space is difficult terrain until the end of the monster's next turn.",
              rules: { targeting: { size: 5 }, areaEffect: { size: 5 } },
            },
          },
        }),
        band({
          id: "cr-8-30-acid-spill",
          minCr: 8,
          maxCr: 30,
          abilityIds: ["corrosive-web"],
          patches: {
            "corrosive-web": {
              mechanics:
                "The first time each round a web created by the monster is destroyed, each creature within 10 feet of that web makes a Dexterity saving throw, taking minor Acid damage on a failure, or half damage on a success. The affected space is difficult terrain until the end of the monster's next turn.",
              rules: { targeting: { size: 10 }, areaEffect: { size: 10 } },
            },
          },
        }),
      ],
    },
    balanceProfile: balance(
      { dpr: 2, control: 2, fairness: 2 },
      { attrition: 1, spike: 1, reliability: 1, control: 2, area: 1, tempo: 1, offTurn: 0, survival: 0, fairness: 2 },
    ),
    complexityProfile: profile({ decision: 1, sequencing: 2, branches: 1, tracking: 2 }),
    counterplayProfile: {
      telegraphs: ["Green reservoirs bead along each strand and swell when the web is damaged."],
      positioningAnswers: ["Clear creatures from the web before destroying it or attack it from outside the spray radius."],
      breakConditions: ["Only the first web destroyed each round releases acid; later web destruction that round is safe."],
      nonDamageAnswers: ["Use water, alkali, tools, or controlled remote destruction to neutralize or avoid the reservoir."],
    },
    spikeRiskProfile: spike({ control: 2, damage: 1, repeatability: 2 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "slow"],
      tacticalRoles: ["controller", "artillery", "support"],
    }),
    editorial: editorial(
      "REWRITE_AS_DESTRUCTION_REVERSAL",
      "The old passive acid tax duplicated the web attack's damage and offered no new decision. The revision makes destruction briefly dangerous, bounded to once per round, and answerable through timing and remote interaction.",
    ),
  },

  "mask-phase": {
    title: "Changing Mask",
    cost: 5,
    complexity: 3,
    stats: { control: 2, dpr: 1, mobility: 1, fairness: 3 },
    summary:
      "Bloodied cracks the funeral mask into one visibly announced role that changes the second half of the encounter.",
    mechanics:
      "The first time the creature becomes bloodied, choose one mask and announce it visibly. Mourner increases its speed by 10 feet and imposes disadvantage on Opportunity Attacks against it. Accuser makes the first hit it scores each turn against a Frightened creature deal extra Psychic damage equal to its proficiency bonus. Saint immediately ends one condition affecting it and grants advantage on its next saving throw before end of its next turn. The chosen mask lasts until the encounter ends or the mask is removed.",
    counterplay:
      "Read the new face, adapt to its declared role, soften the wax with fire, or restrain the creature and tear the mask away using an action.",
    tags: ["bloodied-phase", "mask-choice", "visible-role", "wax-death-masks"],
    identity: {
      fantasy: "A funeral mask that cracks at bloodied and reforms into a new public identity for the second phase.",
      tacticalRole:
        "Visible bloodied choice between escape, accusation, or recovery, each with a different player response.",
      signature:
        "The changed face announces exactly which second-phase benefit is active and can be removed through interaction.",
      recognitionTags: ["cracked-wax", "three-faces", "bloodied-choice", "removable-mask"],
    },
    abilities: [
      {
        id: "changing-mask",
        title: "Changing Mask",
        section: "trait",
        summary: "Bloodied selects one visible mask role for the remainder of the encounter.",
        mechanics:
          "The first time the creature becomes bloodied, choose one mask and announce it visibly. Mourner increases its speed by 10 feet and imposes disadvantage on Opportunity Attacks against it. Accuser makes the first hit it scores each turn against a Frightened creature deal extra Psychic damage equal to its proficiency bonus. Saint immediately ends one condition affecting it and grants advantage on its next saving throw before the end of its next turn. The chosen mask lasts until the encounter ends or the mask is removed. Fire damage suppresses the chosen benefit until the start of the creature's next turn. While the creature is Grappled or Restrained, an adjacent creature can use an action to remove the mask with a successful Strength (Athletics) or Dexterity (Sleight of Hand) check against the monster's save DC.",
        counterplay:
          "Respond to the announced face, use fire for a suppression window, or grapple and remove the mask.",
        rules: twistRules({
          actionEconomy: "freeTrigger",
          usage: { type: "limited", uses: 1, period: "encounter" },
          trigger: "The first time the monster becomes bloodied.",
          targeting: { type: "self", targets: "the monster" },
          condition: condition(["grappled", "restrained"], { direction: "referenceOnly" }),
          text: {
            effect:
              "Choose a mask until removed. Mourner grants +10 Speed and imposes Disadvantage on Opportunity Attacks against it. Accuser adds its Proficiency Bonus as Psychic damage to its first hit each turn against a Frightened creature. Saint ends one condition and grants Advantage on its next saving throw before the end of its next turn. Fire suppresses the benefit until its next turn. While Grappled or Restrained, an adjacent creature can use an action and pass an Athletics or Sleight of Hand check against the save DC to remove the mask.",
          },
          procedure: {
            prerequisite: "The monster becomes bloodied for the first time.",
          },
        }),
        tags: ["bloodied", "choice", "phase", "object-interaction"],
        authored: true,
      },
    ],
    routine: twistRoutine(
      "At first bloodied, choose the mask whose visible role best changes the current encounter, state the choice aloud, and maintain it until removal or encounter end.",
      "The monster itself; Accuser additionally prioritizes Frightened targets while its mask remains active.",
      ["changing-mask"],
      [
        {
          id: "mourner",
          label: "Mourner",
          when: "The monster needs to escape engagement or reposition.",
          sequence: ["changing-mask"],
          notes: "Use the speed and Opportunity Attack protection.",
        },
        {
          id: "accuser",
          label: "Accuser",
          when: "At least one Frightened creature is a meaningful target.",
          sequence: ["changing-mask"],
          notes: "Apply the extra Psychic damage only to the first qualifying hit each turn.",
        },
        {
          id: "saint",
          label: "Saint",
          when: "The monster is affected by a condition or expects an important saving throw.",
          sequence: ["changing-mask"],
          notes: "End one condition immediately, then track one advantaged saving throw until the deadline.",
        },
      ],
    ),
    balanceProfile: balance(
      { control: 2, dpr: 1, mobility: 1, fairness: 3 },
      { attrition: 1, spike: 1, reliability: 1, control: 2, area: 0, tempo: 3, offTurn: 0, survival: 2, fairness: 3 },
    ),
    complexityProfile: profile({ decision: 3, sequencing: 2, branches: 3, tracking: 2 }),
    counterplayProfile: {
      telegraphs: ["At bloodied, the old mask cracks and visibly reforms as Mourner, Accuser, or Saint before the benefit begins."],
      positioningAnswers: ["Spread from Frightened allies against Accuser, block escape lanes against Mourner, or delay control effects until after Saint is spent."],
      breakConditions: ["Removing the mask ends the chosen benefit; fire suppresses it until the start of the monster's next turn."],
      nonDamageAnswers: ["Grapple or restrain the monster, then use an action and the authored check to tear away the mask."],
    },
    spikeRiskProfile: spike({ control: 2, damage: 1, repeatability: 1 }),
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "fast"],
      tacticalRoles: ["controller", "lurker", "support"],
    }),
    editorial: editorial(
      "REWRITE_AS_VISIBLE_PHASE_CHOICE",
      "The existing three-mask idea was strong but under-specified. The revision makes the choice visible, bounds each benefit, and provides fire and physical removal as direct player answers.",
    ),
  },
};

export const MONSTER_TWIST_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(TWIST_GRAFTS),
);

export const MONSTER_TWIST_GRAFT_SCALED_IDS = Object.freeze([
  "gas-buildup",
  "unstable-rupture",
  "dangerously-unstable",
  "flesh-harvest",
  "web-architect",
  "corrosive-web",
]);

export function getMonsterTwistGraftEditorialOverride(graftId = "") {
  return TWIST_GRAFTS[String(graftId || "").trim()] || null;
}
