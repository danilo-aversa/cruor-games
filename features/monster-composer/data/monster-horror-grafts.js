export const MONSTER_HORROR_GRAFT_EDITORIAL_VERSION =
  "monster-horror-graft-editorial-v1.0";

const RULES_VERSION = "monster-graft-rules-v1.16";
const PROGRESSION_VERSION = "monster-graft-progression-v1.0";

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

function budgetDamage({ scale = "minor", share = 0.45, expectedTargets = 2 } = {}) {
  return {
    mode: "budget",
    budgetRole: "rechargeControl",
    types: ["psychic"],
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

function frightened(duration = "until the end of its next turn") {
  return {
    names: ["frightened"],
    severity: "major",
    direction: "enemy",
    duration,
    special: [],
    sizeLimit: "",
    escape: null,
    repeatSave: null,
  };
}

function disabledStructure() {
  return { enabled: false };
}

function horrorRules({
  section = "action",
  actionEconomy = "action",
  usage = { type: "recharge", value: "5-6" },
  trigger = null,
  resolution = { type: "savingThrow", ability: "wisdom", dc: "monster" },
  targeting,
  areaEffect = null,
  damage = noDamage(),
  condition = noCondition(),
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
    condition,
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

function horrorRoutine(defaultPlan, targetSelection, abilityId, { opener = true } = {}) {
  return {
    mode: "procedure",
    defaultPlan,
    targetSelection,
    defaultSequence: [abilityId],
    opener: opener ? [abilityId] : [],
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives: [],
    nonMultiattackReason:
      "This Horror Graft is an encounter reveal or sensory pressure event, not part of the monster's attack routine.",
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

function profile({ decision = 2, sequencing = 1, branches = 2, tracking = 1 } = {}) {
  return {
    decisionLoad: decision,
    sequencing,
    conditionalBranches: branches,
    tracking,
    authoredComplexity: Math.max(decision, sequencing, branches, tracking),
  };
}

function spike({ opening = 2, control = 2, damage = 1, repeatability = 1 } = {}) {
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
    phase: "phase6r-horror-editorial-review",
    version: MONSTER_HORROR_GRAFT_EDITORIAL_VERSION,
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

const HORROR_GRAFTS = {
  stench: {
    title: "Stench",
    slot: "horror",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { control: 2, fairness: 2 },
    summary:
      "The corpse carries a canonical choking stench whose visible vapor turns proximity into a choice rather than an unavoidable tax.",
    mechanics:
      "A creature other than the monster that starts its turn within 5 feet of it and can breathe must make a Constitution saving throw. On a failure, the target has the Poisoned condition until the start of its next turn. On a success, it is immune to this monster's Stench for 24 hours. The aura radius scales with CR.",
    counterplay:
      "The air discolors and insects die near the corpse; keep distance, create wind, seal the face, or use creatures that do not breathe.",
    tags: ["stench", "decomposition", "breathing_hazard", "proximity_horror"],
    identity: {
      fantasy:
        "A corpse surrounded by a visible layer of grave vapor that makes every approach physically revolting.",
      tacticalRole:
        "Breathing-based proximity pressure that separates melee attackers from safer positions.",
      signature:
        "Creatures that begin their turn inside the visible vapor risk being poisoned, then become immune after resisting it.",
      recognitionTags: ["stench", "grave-vapor", "dead-insects", "breathing-hazard"],
    },
    abilities: [
      {
        id: "stench",
        title: "Stench",
        section: "trait",
        summary: "Visible grave vapor poisons breathing creatures that remain close.",
        mechanics:
          "A creature other than the monster that starts its turn within 5 feet of it and can breathe must make a Constitution saving throw. On a failure, the target has the Poisoned condition until the start of its next turn. On a success, it is immune to this monster's Stench for 24 hours.",
        counterplay:
          "Leave the aura before the start of the turn, disperse it with wind, or use sealed breathing protection.",
        rules: horrorRules({
          section: "trait",
          actionEconomy: "passive",
          usage: { type: "passive" },
          trigger: "A breathing creature other than the monster starts its turn in the aura.",
          resolution: { type: "savingThrow", ability: "constitution", dc: "monster" },
          targeting: {
            type: "area",
            shape: "radius",
            size: 5,
            unit: "ft",
            targets: "other creatures that can breathe",
          },
          areaEffect: {
            enabled: true,
            type: "aura",
            shape: "emanation",
            size: 5,
            unit: "ft",
            origin: "self",
            timing: "startsTurnInArea",
            repeatTiming: "startsTurnInArea",
            targets: "other creatures that can breathe",
            excludes: ["the monster", "creatures that do not breathe"],
            text:
              "A breathing creature that starts its turn in the aura makes the listed Constitution saving throw.",
          },
          condition: {
            names: ["poisoned"],
            severity: "moderate",
            direction: "enemy",
            duration: "until the start of its next turn",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          text: {
            failure:
              "The target has the Poisoned condition until the start of its next turn.",
            success:
              "The target is immune to this monster's Stench for 24 hours.",
          },
        }),
        tags: ["canonical-feature", "aura", "poisoned", "breathing"],
        authored: true,
      },
    ],
    routine: horrorRoutine(
      "Use the visible vapor to make close engagement costly, but preserve open routes that let prepared characters leave the aura.",
      "Breathing creatures that choose to remain close enough to begin their turn inside the vapor.",
      "stench",
      { opener: false },
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-stench", minCr: 0, maxCr: 4, radius: 5 },
        { id: "cr-5-12-stench", minCr: 5, maxCr: 12, radius: 10 },
        { id: "cr-13-30-stench", minCr: 13, maxCr: 30, radius: 15 },
      ].map((band) => ({
        ...band,
        abilityIds: ["stench"],
        defaultSequence: ["stench"],
        abilityPatches: {
          stench: {
            mechanics: `A creature other than the monster that starts its turn within ${band.radius} feet of it and can breathe must make a Constitution saving throw. On a failure, the target has the Poisoned condition until the start of its next turn. On a success, it is immune to this monster's Stench for 24 hours.`,
            rules: {
              targeting: { size: band.radius },
              areaEffect: { size: band.radius },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["slow", "standard"],
      tacticalRoles: ["brute", "controller"],
    }),
    complexityProfile: profile({ decision: 1, branches: 1, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The air around the corpse turns yellow-gray and small insects die before reaching it."],
      positioningAnswers: ["End turns outside the aura so the next turn does not begin inside it."],
      breakConditions: ["Strong wind or an equivalent air-clearing effect suppresses the aura until the start of the monster's next turn."],
      nonDamageAnswers: ["Sealed masks, magical air, and creatures that do not breathe bypass the hazard."],
    },
    spikeRiskProfile: spike({ opening: 0, control: 2, damage: 0, repeatability: 2 }),
    editorial: editorial(
      "ADD_CANONICAL_SOURCE_HORROR",
      "The Decomposition source had no Horror option. Stench preserves a familiar D&D name while turning its aura into visible, avoidable breathing pressure with immunity after a successful save.",
    ),
  },

  "horrific-apparition": {
    title: "Horrific Apparition",
    slot: "horror",
    section: "action",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { control: 3, dpr: 2, fairness: 2 },
    summary:
      "The spirit reveals the corpse-eater hidden inside its human outline, frightening witnesses without imposing permanent campaign harm.",
    mechanics:
      "Recharge 5-6. Each non-undead creature in a 30-foot cone that can see the spirit makes a Wisdom saving throw. On a failure, the target takes psychic damage and has the Frightened condition until the end of its next turn. On a success, it takes half damage and is immune to this spirit's Horrific Apparition for 24 hours. The cone scales with CR.",
    counterplay:
      "The borrowed face loosens before the reveal; break line of sight, take cover, or avert the eyes before the cone resolves.",
    tags: ["apparition", "visual_horror", "frightened", "jikininki"],
    identity: {
      fantasy:
        "A hungry spirit peels its human outline open and exposes a grave-fed shape that should not fit inside it.",
      tacticalRole:
        "Recharge visual reveal that opens space and creates a brief fear window without permanent aging effects.",
      signature:
        "A cone of witnesses sees the true corpse-eater and becomes immune after resisting the revelation.",
      recognitionTags: ["unmasking", "corpse-eater", "visual-reveal", "fear-cone"],
    },
    abilities: [
      {
        id: "horrific-apparition",
        title: "Horrific Apparition",
        section: "action",
        summary: "The spirit exposes its true grave-fed form in a cone of sight.",
        mechanics:
          "Recharge 5-6. Each non-undead creature in a 30-foot cone that can see the spirit makes a Wisdom saving throw. On a failure, the target takes psychic damage and has the Frightened condition until the end of its next turn. On a success, it takes half damage and is immune to this spirit's Horrific Apparition for 24 hours.",
        counterplay: "Break line of sight or leave the telegraphed cone before the reveal.",
        rules: horrorRules({
          usage: { type: "recharge", value: "5-6" },
          resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
          targeting: {
            type: "area",
            shape: "cone",
            size: 30,
            unit: "ft",
            targets: "non-undead creatures that can see the spirit",
          },
          damage: budgetDamage({ scale: "minor", share: 0.45, expectedTargets: 2 }),
          condition: frightened(),
          text: {
            failure:
              "The target takes {damage} Psychic damage and has the Frightened condition until the end of its next turn.",
            success:
              "The target takes half damage and is immune to this spirit's Horrific Apparition for 24 hours.",
          },
        }),
        tags: ["recharge", "psychic", "frightened", "visual"],
        authored: true,
      },
    ],
    routine: horrorRoutine(
      "Use the apparition early when several witnesses share a visible cone, then wait for the recharge instead of repeating fear every turn.",
      "The largest readable group of non-undead witnesses that can still escape the telegraphed cone.",
      "horrific-apparition",
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-apparition", minCr: 0, maxCr: 4, size: 30, scale: "minor" },
        { id: "cr-5-12-apparition", minCr: 5, maxCr: 12, size: 45, scale: "minor" },
        { id: "cr-13-30-apparition", minCr: 13, maxCr: 30, size: 60, scale: "medium" },
      ].map((band) => ({
        ...band,
        abilityIds: ["horrific-apparition"],
        defaultSequence: ["horrific-apparition"],
        abilityPatches: {
          "horrific-apparition": {
            mechanics: `Recharge 5-6. Each non-undead creature in a ${band.size}-foot cone that can see the spirit makes a Wisdom saving throw. On a failure, the target takes psychic damage and has the Frightened condition until the end of its next turn. On a success, it takes half damage and is immune to this spirit's Horrific Apparition for 24 hours.`,
            rules: {
              targeting: { size: band.size },
              damage: { scale: band.scale },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "fast", "ambusher"],
      tacticalRoles: ["controller", "lurker"],
    }),
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The spirit's borrowed face loosens and the grave-fed outline presses visibly against it."],
      positioningAnswers: ["Break line of sight, spread beyond the cone, or force the spirit to reveal from a poor angle."],
      breakConditions: ["A creature that succeeds becomes immune to that spirit's apparition for 24 hours."],
      nonDamageAnswers: ["Cover, darkness, blindness, veils, and deliberately averted sight prevent exposure."],
    },
    spikeRiskProfile: spike({ opening: 2, control: 3, damage: 1, repeatability: 1 }),
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "The original permanent aging rider was disproportionate and difficult to resolve. The revised feature preserves the iconic visual reveal, adds success immunity and clear sight-line counterplay, and scales only cone size and damage intensity.",
    ),
  },

  "crawling-dread": {
    title: "Crawling Dread",
    slot: "horror",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 3, fairness: 2 },
    summary:
      "When the spider is bloodied, its body opens and reveals a living carpet of young that witnesses can deliberately refuse to watch.",
    mechanics:
      "The first time the creature becomes bloodied, each hostile creature within 15 feet that can see it makes a Wisdom saving throw. A creature can use its reaction to avert its eyes and automatically succeed, but it cannot see the monster until the start of its next turn. On a failure, the target has the Frightened condition and cannot take reactions until the end of its next turn. The radius scales with CR.",
    counterplay:
      "The abdomen splits before the brood becomes visible; use cover, avert the eyes, or force the bloodied trigger while allies are outside the radius.",
    tags: ["brood_reveal", "bloodied_horror", "avert_eyes", "spider_horror"],
    identity: {
      fantasy:
        "A spider whose apparent body is only a shell around hundreds of moving young.",
      tacticalRole:
        "Once-per-encounter bloodied reveal that creates a short fear window but offers an explicit reaction-based escape.",
      signature:
        "Witnesses can choose not to look, sacrificing sight of the monster to avoid the brood revelation.",
      recognitionTags: ["brood-reveal", "splitting-abdomen", "avert-eyes", "bloodied-horror"],
    },
    abilities: [
      {
        id: "crawling-dread",
        title: "Crawling Dread",
        section: "trait",
        summary: "The bloodied body opens and exposes the brood moving beneath it.",
        mechanics:
          "The first time the creature becomes bloodied, each hostile creature within 15 feet that can see it makes a Wisdom saving throw. A creature can use its reaction to avert its eyes and automatically succeed, but it cannot see the monster until the start of its next turn. On a failure, the target has the Frightened condition and cannot take reactions until the end of its next turn.",
        counterplay: "Stand outside the radius, use cover, or spend the reaction to avert the eyes.",
        rules: horrorRules({
          section: "trait",
          actionEconomy: "freeTrigger",
          usage: { type: "triggered" },
          trigger: "The first time the monster becomes bloodied.",
          resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
          targeting: {
            type: "area",
            shape: "radius",
            size: 15,
            unit: "ft",
            targets: "hostile creatures that can see the monster",
          },
          condition: frightened(),
          text: {
            response:
              "A creature can use its reaction to avert its eyes and automatically succeed, but it cannot see the monster until the start of its next turn.",
            failure:
              "The target has the Frightened condition and cannot take reactions until the end of its next turn.",
            success:
              "A creature can use its reaction to avert its eyes and automatically succeed, but it cannot see the monster until the start of its next turn. Otherwise, no effect.",
          },
        }),
        tags: ["bloodied-trigger", "frightened", "reaction-denial", "avert-eyes"],
        authored: true,
      },
    ],
    routine: horrorRoutine(
      "Position the spider so the first bloodied hit creates a visible but avoidable reveal, then resolve it only once.",
      "Witnesses close enough to see the split body when the spider first becomes bloodied.",
      "crawling-dread",
      { opener: false },
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-brood-glimpse", minCr: 0, maxCr: 4, radius: 15 },
        { id: "cr-5-12-brood-reveal", minCr: 5, maxCr: 12, radius: 30 },
        { id: "cr-13-30-brood-wave", minCr: 13, maxCr: 30, radius: 45 },
      ].map((band) => ({
        ...band,
        abilityIds: ["crawling-dread"],
        defaultSequence: ["crawling-dread"],
        abilityPatches: {
          "crawling-dread": {
            mechanics: `The first time the creature becomes bloodied, each hostile creature within ${band.radius} feet that can see it makes a Wisdom saving throw. A creature can use its reaction to avert its eyes and automatically succeed, but it cannot see the monster until the start of its next turn. On a failure, the target has the Frightened condition and cannot take reactions until the end of its next turn.`,
            rules: { targeting: { size: band.radius } },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["standard", "fast", "ambusher"],
      tacticalRoles: ["controller", "lurker"],
    }),
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The abdomen swells, seams split, and tiny legs press against the translucent tissue before the bloodied threshold."],
      positioningAnswers: ["Trigger the bloodied phase while allies are outside the radius or behind full cover."],
      breakConditions: ["The reveal occurs only once, when the spider first becomes bloodied."],
      nonDamageAnswers: ["A witness can spend its reaction to avert its eyes, automatically succeeding at the cost of losing sight of the monster."],
    },
    spikeRiskProfile: spike({ opening: 0, control: 3, damage: 0, repeatability: 0 }),
    editorial: editorial(
      "ADD_SOURCE_HORROR",
      "Wolf Spiders had brood mechanics in Body, Mind, Twist, and Death but no sensory Horror option. Crawling Dread adds a once-only visible reveal without spawning creatures or duplicating Egg Carrier, and gives every witness an explicit choice to avert its eyes.",
    ),
  },

  wail: {
    title: "Wail",
    slot: "horror",
    section: "action",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { control: 3, dpr: 2, fairness: 2 },
    summary:
      "The death mask releases the voices preserved inside it, turning hearing into a brief but avoidable fear hazard.",
    mechanics:
      "Recharge 6. Each creature within 20 feet that can hear the monster makes a Wisdom saving throw. On a failure, the target takes psychic damage and has the Frightened condition until the end of its next turn. On a success, it takes half damage. A creature that cannot hear the monster automatically succeeds. The radius scales with CR.",
    counterplay:
      "The wax mouth opens and inhales before the voices erupt; move behind a sealed barrier, create magical silence, or deafen yourself temporarily.",
    tags: ["wail", "auditory_horror", "death_mask", "frightened"],
    identity: {
      fantasy:
        "A funeral mask holding many unfinished voices that escape together through one wax mouth.",
      tacticalRole:
        "Recharge auditory burst that pressures clustered creatures while rewarding silence and sealed cover.",
      signature:
        "The mouth visibly opens before a chorus of dead voices floods the nearby space.",
      recognitionTags: ["wail", "wax-mouth", "dead-voices", "auditory-burst"],
    },
    abilities: [
      {
        id: "wail",
        title: "Wail",
        section: "action",
        summary: "The mask releases a chorus of preserved dead voices.",
        mechanics:
          "Recharge 6. Each creature within 20 feet that can hear the monster makes a Wisdom saving throw. On a failure, the target takes psychic damage and has the Frightened condition until the end of its next turn. On a success, it takes half damage. A creature that cannot hear the monster automatically succeeds.",
        counterplay: "Use silence, deafness, sealed cover, or distance before the wax mouth finishes opening.",
        rules: horrorRules({
          usage: { type: "recharge", value: "6" },
          resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
          targeting: {
            type: "area",
            shape: "radius",
            size: 20,
            unit: "ft",
            targets: "creatures that can hear the monster",
          },
          damage: budgetDamage({ scale: "minor", share: 0.45, expectedTargets: 2 }),
          condition: frightened(),
          text: {
            failure:
              "The target takes {damage} Psychic damage and has the Frightened condition until the end of its next turn.",
            success:
              "The target takes half damage. A creature that cannot hear the monster automatically succeeds.",
          },
        }),
        tags: ["canonical-feature", "recharge", "psychic", "auditory"],
        authored: true,
      },
    ],
    routine: horrorRoutine(
      "Use the Wail when several hearing creatures have clustered near the mask, but allow the inhaling wax mouth to announce the burst.",
      "The largest nearby group that can hear the monster and still has access to silence, distance, or sealed cover.",
      "wail",
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-wail", minCr: 0, maxCr: 4, radius: 20, scale: "minor" },
        { id: "cr-5-12-wail", minCr: 5, maxCr: 12, radius: 30, scale: "minor" },
        { id: "cr-13-30-wail", minCr: 13, maxCr: 30, radius: 45, scale: "medium" },
      ].map((band) => ({
        ...band,
        abilityIds: ["wail"],
        defaultSequence: ["wail"],
        abilityPatches: {
          wail: {
            mechanics: `Recharge 6. Each creature within ${band.radius} feet that can hear the monster makes a Wisdom saving throw. On a failure, the target takes psychic damage and has the Frightened condition until the end of its next turn. On a success, it takes half damage. A creature that cannot hear the monster automatically succeeds.`,
            rules: {
              targeting: { size: band.radius },
              damage: { scale: band.scale },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    fit: fit({
      encounterRoles: ["standard", "boss"],
      tempo: ["slow", "standard", "fast"],
      tacticalRoles: ["controller", "support", "lurker"],
    }),
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The wax mouth opens too widely and draws a long breath in several dead voices."],
      positioningAnswers: ["Spread beyond the radius or place a sealed door, wall, or chamber between the mask and the group."],
      breakConditions: ["Magical silence or an equivalent sound-blocking effect prevents the Wail from affecting creatures inside it."],
      nonDamageAnswers: ["Temporary deafness, covered ears with sufficient protection, and creatures that cannot hear automatically avoid the effect."],
    },
    spikeRiskProfile: spike({ opening: 2, control: 3, damage: 1, repeatability: 1 }),
    editorial: editorial(
      "ADD_CANONICAL_SOURCE_HORROR",
      "Wax Death Masks had identity and recognition mechanics but no dedicated sensory Horror Graft. Wail uses a familiar D&D title, remains much less lethal than the banshee feature, and creates clear auditory counterplay.",
    ),
  },
};

export const MONSTER_HORROR_GRAFT_ADDITIONS = Object.freeze([
  {
    id: "stench",
    title: "Stench",
    slot: "horror",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { control: 2, fairness: 2 },
    summary: HORROR_GRAFTS.stench.summary,
    mechanics: HORROR_GRAFTS.stench.mechanics,
    counterplay: HORROR_GRAFTS.stench.counterplay,
  },
  {
    id: "crawling-dread",
    title: "Crawling Dread",
    slot: "horror",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 3, fairness: 2 },
    summary: HORROR_GRAFTS["crawling-dread"].summary,
    mechanics: HORROR_GRAFTS["crawling-dread"].mechanics,
    counterplay: HORROR_GRAFTS["crawling-dread"].counterplay,
  },
  {
    id: "wail",
    title: "Wail",
    slot: "horror",
    section: "action",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { control: 3, dpr: 2, fairness: 2 },
    summary: HORROR_GRAFTS.wail.summary,
    mechanics: HORROR_GRAFTS.wail.mechanics,
    counterplay: HORROR_GRAFTS.wail.counterplay,
  },
]);

export const MONSTER_HORROR_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(HORROR_GRAFTS),
);

export const MONSTER_HORROR_GRAFT_SCALED_IDS = Object.freeze([
  "stench",
  "horrific-apparition",
  "crawling-dread",
  "wail",
]);

export function getMonsterHorrorGraftEditorialOverride(graftId = "") {
  return HORROR_GRAFTS[String(graftId || "").trim()] || null;
}
