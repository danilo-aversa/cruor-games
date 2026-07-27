export const MONSTER_DEATH_GRAFT_EDITORIAL_VERSION =
  "monster-death-graft-editorial-v1.0";

const RULES_VERSION = "monster-graft-rules-v1.16";
const PROGRESSION_VERSION = "monster-graft-progression-v1.0";
const DEATH_TRIGGER = "The monster dies or drops to 0 Hit Points.";

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

function deathRules({
  resolution = { type: "automatic" },
  targeting = { type: "self", targets: "the monster's space" },
  areaEffect = disabledStructure(),
  damage = noDamage(),
  condition = noCondition(),
  text = {},
  summon = disabledStructure(),
  procedure = disabledStructure(),
  effects = [],
} = {}) {
  return {
    schemaVersion: RULES_VERSION,
    section: "death",
    actionEconomy: "deathTrigger",
    usage: { type: "death" },
    trigger: DEATH_TRIGGER,
    resolution,
    secondaryResolution: null,
    targeting,
    areaEffect,
    damage,
    condition,
    counterplay: {
      telegraph: true,
      breakCondition: true,
      positioningAnswer: true,
      nonDamageAnswer: true,
    },
    text,
    multiattack: disabledStructure(),
    spellcasting: disabledStructure(),
    defense: disabledStructure(),
    summon,
    procedure,
    references: [],
    ongoing: disabledStructure(),
    effects,
  };
}

function deathRoutine(abilities = []) {
  const sequence = abilities.map((ability) => ability.id).filter(Boolean);
  return {
    mode: "procedure",
    defaultPlan: "Resolve the listed aftermath abilities once, in order, when the monster dies.",
    targetSelection: "Use each ability's authored target, area, object, or investigation procedure.",
    defaultSequence: sequence,
    opener: sequence,
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives: [],
    nonMultiattackReason:
      "A Death Effect resolves only when the monster dies and never participates in Multiattack.",
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

function profile({ decision = 1, branches = 1, tracking = 1 } = {}) {
  return {
    decisionLoad: decision,
    sequencing: 0,
    conditionalBranches: branches,
    tracking,
    authoredComplexity: Math.max(decision, branches, tracking),
  };
}

function spike({ damage = 0, control = 1, repeatability = 0 } = {}) {
  return {
    openingBurst: 0,
    controlSpike: control,
    damageSpike: damage,
    repeatability,
  };
}

function editorial(decision, rationale) {
  return {
    status: "reviewed",
    phase: "phase6r-death-editorial-review",
    version: MONSTER_DEATH_GRAFT_EDITORIAL_VERSION,
    decision,
    rationale,
    reviewedAt: "2026-07-27",
  };
}

function fit({ encounterRoles, tacticalRoles }) {
  return {
    schemaVersion: "monster-frame-fit-v1.0",
    encounterRoles: {
      allowed: encounterRoles,
      recommended: encounterRoles,
    },
    tempo: { recommended: ["slow", "standard", "fast", "ambusher"] },
    danger: { recommended: ["standard", "hard", "horror"] },
    tiers: { recommended: ["normal", "elite", "boss", "setpiece"] },
    tacticalRoles: { recommended: tacticalRoles },
  };
}

function graftBase({
  title,
  source,
  typeBias,
  roleBias,
  cost,
  complexity,
  stats,
  summary,
  mechanics,
  counterplay,
  tags,
  identity,
  abilities,
  progression = null,
  counterplayProfile,
  complexityProfile,
  spikeRiskProfile,
  decision,
  rationale,
  tacticalRoles,
}) {
  return {
    title,
    slot: "death",
    section: "death",
    source,
    typeBias,
    roleBias,
    cost,
    complexity,
    stats,
    summary,
    mechanics,
    counterplay,
    tags,
    identity,
    abilities,
    routine: deathRoutine(abilities),
    progression,
    fit: fit({ encounterRoles: roleBias, tacticalRoles }),
    complexityProfile,
    counterplayProfile,
    spikeRiskProfile,
    editorial: editorial(decision, rationale),
  };
}

function radiusProgression(idPrefix, abilityId, bands) {
  return {
    schemaVersion: PROGRESSION_VERSION,
    basis: "targetCr",
    scalingPolicy: "authored-rule-patches",
    bands: bands.map(({ id, minCr, maxCr, radius, mechanics, rulesPatch = {} }) => ({
      id: `${idPrefix}-${id}`,
      minCr,
      maxCr,
      abilityIds: [abilityId],
      defaultSequence: [abilityId],
      abilityPatches: {
        [abilityId]: {
          mechanics,
          rules: {
            targeting: { size: radius },
            ...(rulesPatch.areaEffect
              ? { areaEffect: { size: radius, ...rulesPatch.areaEffect } }
              : {}),
            ...(rulesPatch.text ? { text: rulesPatch.text } : {}),
            ...(rulesPatch.summon ? { summon: rulesPatch.summon } : {}),
          },
        },
      },
      multiattack: { enabled: false, mode: "fixed", count: 0 },
    })),
  };
}

const DEATH_GRAFTS = {
  "corpse-bloom-death": graftBase({
    title: "Corpse Bloom",
    source: "decomposition",
    typeBias: ["undead", "aberration", "beast"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { control: 2, fairness: 2 },
    summary:
      "The dead body flowers into a wet bed of carrion growth that blocks movement and suppresses healing until the remains are cleared.",
    mechanics:
      "When the monster dies, a 10-foot-radius bloom spreads from its space. The area is Difficult Terrain. A creature that starts its turn in the bloom can't regain Hit Points until the start of its next turn. Fire or Radiant damage dealt to the corpse destroys the bloom, and a creature adjacent to the corpse can use an action to clear one 5-foot square.",
    counterplay:
      "Pale nodules open across the body as it nears death; relocate it before the final blow, then burn, consecrate, or clear the remains.",
    tags: ["corpse-bloom", "difficult-terrain", "healing-suppression", "destructible-remains"],
    identity: {
      fantasy: "A dead organism that continues decomposing fast enough to colonize the battlefield in seconds.",
      tacticalRole: "Persistent death zone that denies healing and movement until players spend position, damage type, or actions to remove it.",
      signature: "The corpse becomes a destroyable patch of carrion growth that prevents healing inside it.",
      recognitionTags: ["pale-nodules", "wet-bloom", "healing-denial", "burnable-remains"],
    },
    abilities: [
      {
        id: "corpse-bloom",
        title: "Corpse Bloom",
        section: "death",
        summary: "The corpse becomes a persistent rot zone that blocks healing.",
        mechanics:
          "When the monster dies, a 10-foot-radius bloom spreads from its space. The area is Difficult Terrain. A creature that starts its turn in the bloom can't regain Hit Points until the start of its next turn. Fire or Radiant damage dealt to the corpse destroys the bloom, and a creature adjacent to the corpse can use an action to clear one 5-foot square.",
        counterplay: "Move the monster before killing it, then burn or consecrate the corpse or clear a route through the bloom.",
        rules: deathRules({
          targeting: { type: "area", shape: "radius", size: 10, unit: "ft", targets: "creatures in the bloom" },
          areaEffect: {
            enabled: true,
            type: "hazard",
            shape: "radius",
            size: 10,
            unit: "ft",
            origin: "self",
            timing: "startsTurnInArea",
            targets: "creatures",
            excludes: [],
            repeatTiming: "startsTurnInArea",
            text:
              "The area is Difficult Terrain. A creature that starts its turn in the bloom can't regain Hit Points until the start of its next turn.",
          },
          text: {
            effect:
              "When the monster dies, a 10-foot-radius bloom spreads from its space. The area is Difficult Terrain. A creature that starts its turn in the bloom can't regain Hit Points until the start of its next turn. Fire or Radiant damage dealt to the corpse destroys the bloom, and a creature adjacent to the corpse can use an action to clear one 5-foot square.",
          },
          procedure: {
            enabled: true,
            type: "custom",
            prerequisite: "A creature is adjacent to the corpse or can damage it with Fire or Radiant damage.",
            text:
              "When the monster dies, a 10-foot-radius bloom spreads from its space. The area is Difficult Terrain. A creature that starts its turn in the bloom can't regain Hit Points until the start of its next turn. Fire or Radiant damage dealt to the corpse destroys the bloom. A creature adjacent to the corpse can use an action to clear one 5-foot square.",
          },
        }),
        tags: ["death-zone", "healing-suppression", "difficult-terrain", "cleansable"],
        authored: true,
      },
    ],
    counterplayProfile: {
      telegraphs: ["Pale nodules split open and rootlets push beneath the corpse's skin as it nears death."],
      positioningAnswers: ["Move or lure the monster away from wounded allies and objectives before dealing the killing blow."],
      breakConditions: ["Fire or Radiant damage to the corpse destroys the whole bloom; actions can clear individual squares."],
      nonDamageAnswers: ["Forced movement, corpse relocation, consecration, shovels, salt, or improvised absorbent material can keep routes open."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 1 }),
    decision: "REWRITE_PERSISTENT_HEALING_ZONE",
    rationale:
      "The legacy version was mostly a vague clue patch. Corpse Bloom is now a recognizable persistent aftermath with a combat consequence, a destroyable anchor, and multiple explicit cleanup answers.",
    tacticalRoles: ["controller", "support"],
  }),

  "toxic-detonation": graftBase({
    title: "Toxic Detonation",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { dpr: 5, control: 1, fairness: 2 },
    summary:
      "The distended corpse ruptures at death, throwing poisonous fluid through a radius that grows with the monster's CR.",
    mechanics:
      "When the monster dies, each other creature within 5 feet makes a Dexterity saving throw. On a failed save, a creature takes Poison damage and has the Poisoned condition until the end of its next turn. On a successful save, it takes half damage only. The radius scales with CR.",
    counterplay:
      "The body becomes translucent and pressure lines spread beneath the skin; finish it from range, behind cover, or after moving it away.",
    tags: ["toxic-detonation", "death-burst", "poison", "telegraphed-radius"],
    identity: {
      fantasy: "A corpse whose trapped decay pressure turns the final wound into a poisonous detonation.",
      tacticalRole: "Telegraphed death burst that punishes clustering without creating a persistent second hazard.",
      signature: "Death releases a scaled Poison burst that briefly Poisons creatures that fail the save.",
      recognitionTags: ["translucent-skin", "pressure-lines", "poison-spray", "scaled-burst"],
    },
    abilities: [
      {
        id: "toxic-detonation",
        title: "Toxic Detonation",
        section: "death",
        summary: "The corpse explodes in a burst of poison when destroyed.",
        mechanics:
          "When the monster dies, each other creature within 5 feet makes a Dexterity saving throw. On a failed save, a creature takes Poison damage and has the Poisoned condition until the end of its next turn. On a successful save, it takes half damage only.",
        counterplay: "Spread out, use cover, or move the monster before killing it.",
        rules: deathRules({
          resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
          targeting: { type: "area", shape: "radius", size: 5, unit: "ft", targets: "other creatures" },
          damage: {
            mode: "budget",
            budgetRole: "deathBurst",
            types: ["poison"],
            scale: "standard",
            budgetShare: 1,
            expectedTargets: 2,
            parts: [],
          },
          condition: {
            names: ["poisoned"],
            severity: "moderate",
            direction: "enemy",
            duration: "until the end of its next turn",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          text: {
            failure:
              "The target takes {damage} Poison damage and has the Poisoned condition until the end of its next turn.",
            success: "The target takes half damage only.",
          },
        }),
        tags: ["death-burst", "dexterity-save", "poison-damage", "poisoned"],
        authored: true,
      },
    ],
    progression: radiusProgression("toxic-detonation", "toxic-detonation", [
      {
        id: "cr-0-4-small-burst",
        minCr: 0,
        maxCr: 4,
        radius: 5,
        mechanics:
          "When the monster dies, each other creature within 5 feet makes a Dexterity saving throw. On a failed save, a creature takes Poison damage and has the Poisoned condition until the end of its next turn. On a successful save, it takes half damage only.",
      },
      {
        id: "cr-5-12-toxic-burst",
        minCr: 5,
        maxCr: 12,
        radius: 10,
        mechanics:
          "When the monster dies, each other creature within 10 feet makes a Dexterity saving throw. On a failed save, a creature takes Poison damage and has the Poisoned condition until the end of its next turn. On a successful save, it takes half damage only.",
      },
      {
        id: "cr-13-30-toxic-wave",
        minCr: 13,
        maxCr: 30,
        radius: 15,
        mechanics:
          "When the monster dies, each other creature within 15 feet makes a Dexterity saving throw. On a failed save, a creature takes Poison damage and has the Poisoned condition until the end of its next turn. On a successful save, it takes half damage only.",
      },
    ]),
    counterplayProfile: {
      telegraphs: ["The corpse becomes translucent, fluid pressure lines spread beneath its skin, and every wound hisses."],
      positioningAnswers: ["Spread out or move beyond the visible rupture radius before dealing the final damage."],
      breakConditions: ["The detonation resolves only once, when the monster dies; distance and cover reduce who is exposed."],
      nonDamageAnswers: ["Forced movement, restraint, doors, walls, or killing it from range can place the burst where it harms no one."],
    },
    complexityProfile: profile({ decision: 2, branches: 1, tracking: 1 }),
    spikeRiskProfile: spike({ damage: 3, control: 2, repeatability: 0 }),
    decision: "REWRITE_AND_SCALE_DEATH_BURST",
    rationale:
      "The original burst lacked a reliable telegraph and used generic attack-budget language. The rewrite uses an explicit death-burst budget, canonical save outcomes, and authored radius scaling.",
    tacticalRoles: ["controller", "artillery", "support"],
  }),

  "purge-fluid-flood": graftBase({
    title: "Purge Flood",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 3, fairness: 2 },
    summary:
      "The corpse empties across the floor at death, creating a wide slick that repeatedly topples creatures until players clear safe paths.",
    mechanics:
      "When the monster dies, a 10-foot-radius slick spreads from its space and lasts until cleared. The area is Difficult Terrain. A creature that enters the slick for the first time on a turn or starts its turn there makes a Dexterity saving throw, falling Prone on a failed save. A creature can use an action to clear one 5-foot square with fire, sand, cloth, water, or another suitable method. The radius scales with CR.",
    counterplay:
      "Dark fluid streams from the corpse before death; relocate it, keep clear of low ground, or prepare material to absorb and burn the spill.",
    tags: ["purge-flood", "persistent-hazard", "prone", "clearable-terrain"],
    identity: {
      fantasy: "A bloated body that empties into a spreading lake of purge fluid when its tissues finally fail.",
      tacticalRole: "Persistent movement-control aftermath that can be dismantled square by square.",
      signature: "Death creates a scaled slick that repeatedly knocks creatures Prone until cleared.",
      recognitionTags: ["dark-leak", "low-ground", "slick-floor", "clearable-path"],
    },
    abilities: [
      {
        id: "purge-flood",
        title: "Purge Flood",
        section: "death",
        summary: "Death creates a persistent slick that can knock creatures Prone.",
        mechanics:
          "When the monster dies, a 10-foot-radius slick spreads from its space and lasts until cleared. The area is Difficult Terrain. A creature that enters the slick for the first time on a turn or starts its turn there makes a Dexterity saving throw, falling Prone on a failed save. A creature can use an action to clear one 5-foot square with fire, sand, cloth, water, or another suitable method.",
        counterplay: "Avoid the low ground, move the monster before death, or spend actions and materials clearing a route.",
        rules: deathRules({
          resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
          targeting: { type: "area", shape: "radius", size: 10, unit: "ft", targets: "creatures in the slick" },
          areaEffect: {
            enabled: true,
            type: "hazard",
            shape: "radius",
            size: 10,
            unit: "ft",
            origin: "self",
            timing: "custom",
            targets: "creatures",
            excludes: [],
            repeatTiming: "custom",
            text:
              "The area is Difficult Terrain. A creature that enters it for the first time on a turn or starts its turn there makes the save, falling Prone on a failure.",
          },
          condition: {
            names: ["prone"],
            severity: "moderate",
            direction: "enemy",
            duration: "instantaneous",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          text: {
            failure: "The target has the Prone condition.",
            success: "No effect.",
            effect:
              "A creature can use an action to clear one 5-foot square with fire, sand, cloth, water, or another suitable method.",
          },
          procedure: {
            enabled: true,
            type: "custom",
            prerequisite: "A creature is adjacent to a square of the slick and has a suitable method of clearing it.",
            text:
              "When the monster dies, a 10-foot-radius slick spreads from its space and lasts until cleared. The area is Difficult Terrain. A creature that enters the slick for the first time on a turn or starts its turn there makes a Dexterity saving throw, falling Prone on a failed save. A creature can use an action to clear one 5-foot square with fire, sand, cloth, water, or another suitable method.",
          },
        }),
        tags: ["death-zone", "difficult-terrain", "prone", "repeat-entry-save"],
        authored: true,
      },
    ],
    progression: radiusProgression("purge-flood", "purge-flood", [
      {
        id: "cr-0-4-spill",
        minCr: 0,
        maxCr: 4,
        radius: 10,
        mechanics:
          "When the monster dies, a 10-foot-radius slick spreads from its space and lasts until cleared. The area is Difficult Terrain. A creature that enters the slick for the first time on a turn or starts its turn there makes a Dexterity saving throw, falling Prone on a failed save. A creature can use an action to clear one 5-foot square.",
        rulesPatch: { areaEffect: {} },
      },
      {
        id: "cr-5-12-flood",
        minCr: 5,
        maxCr: 12,
        radius: 15,
        mechanics:
          "When the monster dies, a 15-foot-radius slick spreads from its space and lasts until cleared. The area is Difficult Terrain. A creature that enters the slick for the first time on a turn or starts its turn there makes a Dexterity saving throw, falling Prone on a failed save. A creature can use an action to clear one 5-foot square.",
        rulesPatch: { areaEffect: {} },
      },
      {
        id: "cr-13-30-inundation",
        minCr: 13,
        maxCr: 30,
        radius: 25,
        mechanics:
          "When the monster dies, a 25-foot-radius slick spreads from its space and lasts until cleared. The area is Difficult Terrain. A creature that enters the slick for the first time on a turn or starts its turn there makes a Dexterity saving throw, falling Prone on a failed save. A creature can use an action to clear one 5-foot square.",
        rulesPatch: { areaEffect: {} },
      },
    ]),
    counterplayProfile: {
      telegraphs: ["Dark purge fluid leaks continuously and runs toward the lowest spaces around the monster."],
      positioningAnswers: ["Keep the killing point away from chokepoints, stairs, wounded allies, and other low ground."],
      breakConditions: ["Each cleared 5-foot square remains safe; the hazard does not regrow after the corpse is dead."],
      nonDamageAnswers: ["Use sand, cloth, water, fire, tools, magic, or improvised barriers to absorb or redirect the fluid."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 2 }),
    decision: "REWRITE_AND_SCALE_PERSISTENT_HAZARD",
    rationale:
      "The legacy condition duration confused Prone with the lifetime of the terrain. The rewrite separates the instantaneous condition from a persistent, square-by-square clearable hazard and retains authored radius scaling.",
    tacticalRoles: ["controller", "support"],
  }),

  "spectral-dust-death": graftBase({
    title: "Spectral Dust",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 2,
    stats: { control: 1, fairness: 3 },
    summary:
      "The destroyed spirit collapses into grave dust that briefly outlines hidden beings and then settles into a readable trail toward its last feeding place.",
    mechanics:
      "When the monster dies, spectral dust fills a 10-foot-radius area until the end of the next round. Invisible creatures and objects in the dust are visibly outlined and gain no benefit from being Invisible, and creatures in the dust can't take the Hide action. After the dust settles, a creature can use an action to study it and learn the direction of the monster's last feeding place or the identity of its last victim.",
    counterplay:
      "The spirit frays into drifting ash before death; leave the radius, cover the remains, or disperse the dust with strong wind.",
    tags: ["spectral-dust", "reveal", "anti-hide", "investigative-trace"],
    identity: {
      fantasy: "A corpse-eating spirit whose stolen grave matter persists as a revealing residue after the soul collapses.",
      tacticalRole: "Brief reveal zone followed by a concrete investigation reward rather than a generic treasure clue.",
      signature: "Death exposes hidden creatures for one round and leaves a trace to the spirit's last meal.",
      recognitionTags: ["grave-ash", "outlined-shapes", "victim-trace", "wind-dispersal"],
    },
    abilities: [
      {
        id: "revealing-dust",
        title: "Revealing Dust",
        section: "death",
        summary: "The death plume outlines Invisible creatures and prevents hiding.",
        mechanics:
          "When the monster dies, spectral dust fills a 10-foot-radius area until the end of the next round. Invisible creatures and objects in the dust are visibly outlined and gain no benefit from being Invisible, and creatures in the dust can't take the Hide action. Strong wind disperses the dust.",
        counterplay: "Leave the radius, use cover outside it, or disperse the plume with strong wind.",
        rules: deathRules({
          targeting: { type: "area", shape: "radius", size: 10, unit: "ft", targets: "creatures and objects in the dust" },
          areaEffect: {
            enabled: true,
            type: "zone",
            shape: "radius",
            size: 10,
            unit: "ft",
            origin: "self",
            timing: "passive",
            targets: "creatures and objects",
            excludes: [],
            repeatTiming: "passive",
            text:
              "When the monster dies, spectral dust fills a 10-foot-radius area until the end of the next round. Invisible creatures and objects in the dust are visibly outlined and gain no benefit from being Invisible, and creatures in the dust can't take the Hide action. Strong wind disperses the dust.",
          },
          text: {
            effect:
              "When the monster dies, spectral dust fills a 10-foot-radius area until the end of the next round. Invisible creatures and objects in the dust are visibly outlined and gain no benefit from being Invisible, and creatures in the dust can't take the Hide action. Strong wind disperses the dust.",
          },
        }),
        tags: ["death-cloud", "invisibility-reveal", "hide-denial", "wind"],
        authored: true,
      },
      {
        id: "grave-trace",
        title: "Grave Trace",
        section: "death",
        summary: "The settled dust reveals a specific fact about the spirit's last feeding.",
        mechanics:
          "After the dust settles, a creature can use an action to study it and learn either the direction of the monster's last feeding place or the identity of its last victim.",
        counterplay: "The trace is lost if the remains are scattered, washed away, or deliberately contaminated before they are studied.",
        rules: deathRules({
          targeting: { type: "custom", targets: "one creature studying the settled dust" },
          text: {
            effect:
              "After the dust settles, a creature can use an action to study it and learn either the direction of the monster's last feeding place or the identity of its last victim.",
          },
          procedure: {
            enabled: true,
            type: "custom",
            prerequisite: "The spectral dust has settled and has not been scattered, washed away, or contaminated.",
            text:
              "A creature uses an action to study the dust and learns either the direction of the monster's last feeding place or the identity of its last victim.",
          },
        }),
        tags: ["investigation", "source-clue", "last-victim", "feeding-route"],
        authored: true,
      },
    ],
    counterplayProfile: {
      telegraphs: ["The spirit's outline frays into gray grains that drift toward every hidden shape nearby."],
      positioningAnswers: ["Leave the ten-foot plume before it forms or remain behind cover outside the dust."],
      breakConditions: ["Strong wind disperses the active cloud; scattering or washing the settled dust destroys the later trace."],
      nonDamageAnswers: ["Wind, water, cloth, containers, or deliberate collection can disperse, preserve, or deny the residue."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 1, repeatability: 0 }),
    decision: "REWRITE_AS_REVEAL_AND_TRACE_BUNDLE",
    rationale:
      "The legacy feature provided only a vague post-combat clue. The rewrite gives the death effect an immediate tactical identity and a separate bounded investigation procedure, making the two outcomes explicit abilities.",
    tacticalRoles: ["controller", "support", "lurker"],
  }),

  "last-meal-memory": graftBase({
    title: "Last Meal Memory",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 3,
    stats: { control: 2, fairness: 3 },
    summary:
      "The spirit's final victim speaks through its death, forcing one witness to choose between shutting out the horror and receiving a useful stolen memory.",
    mechanics:
      "When the monster dies, the creature that dealt the killing damage, or the nearest creature within 30 feet that can hear it, receives a stolen memory. The target can use its Reaction to reject the memory, learning nothing and automatically succeeding on the save. Otherwise, it makes a Wisdom saving throw. On a failed save, it has the Frightened condition until the end of its next turn. Whether the save succeeds or fails, the target learns one precise image from the monster's last consumed victim.",
    counterplay:
      "The voice of a victim begins replacing the monster's own sounds as it nears death; reserve a Reaction, move beyond hearing, or complete a brief funeral rite over the remains.",
    tags: ["stolen-memory", "reaction-choice", "frightened", "victim-clue"],
    identity: {
      fantasy: "A corpse-eating spirit that cannot die without returning one stolen memory to the living.",
      tacticalRole: "Death-triggered information bargain: accept exposure to fear for a guaranteed clue or spend a Reaction to refuse both.",
      signature: "One witness chooses whether to receive the last victim's memory and risk brief fear.",
      recognitionTags: ["victim-voice", "reaction-choice", "memory-image", "funeral-answer"],
    },
    abilities: [
      {
        id: "last-meal-memory",
        title: "Last Meal Memory",
        section: "death",
        summary: "One witness must accept or reject the final stolen memory.",
        mechanics:
          "When the monster dies, the creature that dealt the killing damage, or the nearest creature within 30 feet that can hear it, receives a stolen memory. The target can use its Reaction to reject the memory, learning nothing and automatically succeeding on the save. Otherwise, it makes a Wisdom saving throw. On a failed save, it has the Frightened condition until the end of its next turn. Whether the save succeeds or fails, the target learns one precise image from the monster's last consumed victim.",
        counterplay: "Keep a Reaction available to reject the memory, move outside hearing, or use a funeral rite to remove the fear while preserving the clue.",
        rules: deathRules({
          resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
          targeting: { type: "single", range: 30, unit: "ft", targets: "the killer, or the nearest creature that can hear it" },
          condition: {
            names: ["frightened"],
            severity: "major",
            direction: "enemy",
            duration: "until the end of its next turn",
            special: ["The target can use its Reaction to reject the memory and automatically succeed, but learns nothing."],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          text: {
            failure:
              "The target has the Frightened condition until the end of its next turn and sees one memory from the monster's last victim.",
            success:
              "The target sees that memory. A target that used its Reaction to reject it learns nothing.",
          },
        }),
        tags: ["wisdom-save", "frightened", "reaction", "investigation"],
        authored: true,
      },
    ],
    counterplayProfile: {
      telegraphs: ["A victim's voice begins replacing the spirit's own noises, repeating one unfinished sentence before death."],
      positioningAnswers: ["Move beyond thirty feet, become unable to hear the spirit, or let another creature deliver the killing damage."],
      breakConditions: ["A target can spend its Reaction to reject both the fear and the clue; a brief funeral rite removes only the fear component."],
      nonDamageAnswers: ["Silence, deafness, distance, ear protection, or funeral observance changes how the memory resolves."],
    },
    complexityProfile: profile({ decision: 3, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 0 }),
    decision: "REWRITE_AS_INFORMATION_BARGAIN",
    rationale:
      "The original effect mixed fear and an undefined clue without a meaningful choice. The rewrite fixes target selection, guarantees a precise memory, and lets the target deliberately reject both outcomes with a Reaction.",
    tacticalRoles: ["controller", "support"],
  }),

  "egg-hatch-death": graftBase({
    title: "Brood Burst",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 3, fairness: 2 },
    summary:
      "The parent's death signal ruptures a bounded number of intact eggs, replacing a random mass hatch with a visible and preventable final escalation.",
    mechanics:
      "When the monster dies, up to one intact egg it carries hatches immediately into a spider minion in an adjacent unoccupied space. The minion rolls Initiative. Destroyed eggs and eggs exposed to Fire damage since the end of the monster's previous turn can't hatch. The number of eggs that hatch scales with CR.",
    counterplay:
      "The remaining eggs pulse in unison as the parent nears death; destroy or burn them before dealing the final blow.",
    tags: ["brood-burst", "death-summon", "intact-eggs", "preventable-escalation"],
    identity: {
      fantasy: "A mother spider whose dying contractions become the final signal for the surviving clutch to tear free.",
      tacticalRole: "Bounded death summon that converts neglected destroyable eggs into a predictable final wave.",
      signature: "A CR-scaled number of intact, unburned eggs hatch immediately when the parent dies.",
      recognitionTags: ["synchronized-pulse", "rupturing-eggs", "burn-prevention", "final-wave"],
    },
    abilities: [
      {
        id: "brood-burst",
        title: "Brood Burst",
        section: "death",
        summary: "A bounded number of intact eggs hatch when the parent dies.",
        mechanics:
          "When the monster dies, up to one intact egg it carries hatches immediately into a spider minion in an adjacent unoccupied space. The minion rolls Initiative. Destroyed eggs and eggs exposed to Fire damage since the end of the monster's previous turn can't hatch.",
        counterplay: "Destroy or burn the visible eggs before killing the parent.",
        rules: deathRules({
          targeting: { type: "custom", targets: "up to one intact egg carried by the monster" },
          text: {
            effect:
              "When the monster dies, up to one intact egg it carries hatches immediately. Destroyed eggs and eggs exposed to Fire damage since the end of the monster's previous turn can't hatch.",
          },
          summon: {
            enabled: true,
            type: "spawn",
            creatureName: "spider minion",
            count: "up to one",
            placement: "an adjacent unoccupied space",
            duration: "until destroyed",
            initiative: "rollInitiative",
            control: "alliedToSummoner",
            limit: "Only intact eggs not exposed to Fire damage since the end of the monster's previous turn can hatch.",
            trigger: DEATH_TRIGGER,
            text:
              "When the monster dies, up to one intact egg it carries hatches immediately into one spider minion in an adjacent unoccupied space. The minion rolls Initiative. Destroyed eggs and eggs exposed to Fire damage since the end of the monster's previous turn can't hatch.",
          },
        }),
        tags: ["death-summon", "spider-minion", "egg-object", "fire-answer"],
        authored: true,
      },
    ],
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "brood-burst-cr-0-4-single-egg",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["brood-burst"],
          defaultSequence: ["brood-burst"],
          abilityPatches: {
            "brood-burst": {
              mechanics:
                "When the monster dies, up to one intact egg it carries hatches immediately into a spider minion in an adjacent unoccupied space. The minion rolls Initiative. Destroyed or recently burned eggs can't hatch.",
              rules: {
                targeting: { type: "custom", targets: "up to one intact egg carried by the monster" },
                summon: {
                  count: "up to one",
                  text:
                    "When the monster dies, up to one intact egg it carries hatches immediately into one spider minion in an adjacent unoccupied space. The minion rolls Initiative. Destroyed or recently burned eggs can't hatch.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "brood-burst-cr-5-12-pair",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["brood-burst"],
          defaultSequence: ["brood-burst"],
          abilityPatches: {
            "brood-burst": {
              mechanics:
                "When the monster dies, up to two intact eggs it carries hatch immediately into spider minions in adjacent unoccupied spaces. The minions roll Initiative. Destroyed or recently burned eggs can't hatch.",
              rules: {
                targeting: { type: "custom", targets: "up to two intact eggs carried by the monster" },
                summon: {
                  count: "up to two",
                  text:
                    "When the monster dies, up to two intact eggs it carries hatch immediately into spider minions in adjacent unoccupied spaces. The minions roll Initiative. Destroyed or recently burned eggs can't hatch.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "brood-burst-cr-13-30-clutch",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["brood-burst"],
          defaultSequence: ["brood-burst"],
          abilityPatches: {
            "brood-burst": {
              mechanics:
                "When the monster dies, up to three intact eggs it carries hatch immediately into spider minions in adjacent unoccupied spaces. The minions roll Initiative. Destroyed or recently burned eggs can't hatch.",
              rules: {
                targeting: { type: "custom", targets: "up to three intact eggs carried by the monster" },
                summon: {
                  count: "up to three",
                  text:
                    "When the monster dies, up to three intact eggs it carries hatch immediately into spider minions in adjacent unoccupied spaces. The minions roll Initiative. Destroyed or recently burned eggs can't hatch.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    counterplayProfile: {
      telegraphs: ["Every surviving egg begins pulsing in time with the parent's failing heartbeat."],
      positioningAnswers: ["Keep open spaces around the parent occupied or controlled, and do not kill it beside vulnerable allies."],
      breakConditions: ["Only intact, unburned eggs can hatch, and the CR band limits how many are selected."],
      nonDamageAnswers: ["Burn, remove, smother, freeze, or otherwise neutralize visible eggs before the parent dies."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 0 }),
    decision: "REWRITE_AND_SCALE_BOUNDED_SUMMON",
    rationale:
      "The legacy d20 roll could hatch every remaining egg and create unbounded action-economy spikes. Brood Burst uses an authored CR cap and preserves the existing destroy-or-burn counterplay.",
    tacticalRoles: ["controller", "support", "boss"],
  }),

  "silk-cocoon-remains": graftBase({
    title: "Death Cocoon",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { control: 2, fairness: 2 },
    summary:
      "The spinnerets contract at death, lashing one nearby creature in silk while sealing the corpse and its trophies inside a cuttable cocoon.",
    mechanics:
      "When the monster dies, the nearest creature within 10 feet makes a Dexterity saving throw. On a failed save, it has the Restrained condition in silk. A Restrained creature can use its action to make a Strength (Athletics) check against the monster's save DC, ending the condition on a success. The silk can also be destroyed (AC 10; Hit Points equal to 5 + the monster's Proficiency Bonus; Vulnerability to Fire damage). The corpse becomes a cocoon with the same statistics; opening it reveals one carried trophy, clue, or sign of a missing victim.",
    counterplay:
      "The spinnerets draw tight and point toward the nearest body; step away before the killing blow or prepare fire and cutting tools.",
    tags: ["death-cocoon", "restrained", "destroyable-silk", "victim-clue"],
    identity: {
      fantasy: "A spider whose final muscular contraction turns its own silk system into a death snare and sealed evidence cache.",
      tacticalRole: "Single-target death restraint plus a finite interactable corpse object that pays off investigation.",
      signature: "Death lashes the nearest creature in cuttable silk and seals the remains into a cocoon.",
      recognitionTags: ["tight-spinnerets", "silk-lash", "sealed-corpse", "fire-vulnerability"],
    },
    abilities: [
      {
        id: "death-snare",
        title: "Death Snare",
        section: "death",
        summary: "The final spinneret contraction restrains the nearest creature.",
        mechanics:
          "When the monster dies, the nearest creature within 10 feet makes a Dexterity saving throw. On a failed save, it has the Restrained condition in silk. A Restrained creature can use its action to make a Strength (Athletics) check against the monster's save DC, ending the condition on a success. The silk can also be destroyed (AC 10; Hit Points equal to 5 + the monster's Proficiency Bonus; Vulnerability to Fire damage).",
        counterplay: "Stay beyond ten feet, succeed on the save, escape with an action, or cut or burn the silk.",
        rules: deathRules({
          resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
          targeting: { type: "single", range: 10, unit: "ft", targets: "the nearest creature" },
          condition: {
            names: ["restrained"],
            severity: "major",
            direction: "enemy",
            duration: "until the target escapes or the silk is destroyed",
            special: ["The silk has AC 10, Hit Points equal to 5 + the monster's Proficiency Bonus, and Vulnerability to Fire damage."],
            sizeLimit: "",
            escape: {
              enabled: true,
              dc: "monster",
              dcSource: "monster",
              ability: "strength",
              text: "The restrained creature uses its action to make a Strength (Athletics) check, ending the condition on a success.",
            },
            repeatSave: null,
          },
          text: {
            failure: "The target has the Restrained condition in silk until it escapes or the silk is destroyed.",
            success: "No effect.",
            effect:
              "The silk has AC 10, Hit Points equal to 5 + the monster's Proficiency Bonus, and Vulnerability to Fire damage.",
          },
        }),
        tags: ["dexterity-save", "restrained", "object-ac", "fire-vulnerability"],
        authored: true,
      },
      {
        id: "cocooned-remains",
        title: "Cocooned Remains",
        section: "death",
        summary: "The body seals itself into a finite object containing evidence of prior victims.",
        mechanics:
          "The corpse becomes a silk cocoon with AC 10, Hit Points equal to 5 + the monster's Proficiency Bonus, and Vulnerability to Fire damage. A creature can use an action to cut open an adjacent cocoon without damaging its contents, revealing one carried trophy, clue, or sign of a missing victim.",
        counterplay: "Cut the cocoon carefully to preserve its contents or burn it to remove the obstruction immediately.",
        rules: deathRules({
          targeting: { type: "custom", targets: "the monster's cocooned corpse" },
          text: {
            effect:
              "The corpse becomes a silk cocoon with AC 10, Hit Points equal to 5 + the monster's Proficiency Bonus, and Vulnerability to Fire damage. A creature can use an action to cut open an adjacent cocoon without damaging its contents, revealing one carried trophy, clue, or sign of a missing victim.",
          },
          procedure: {
            enabled: true,
            type: "custom",
            prerequisite: "A creature is adjacent to the cocoon and has a cutting tool or another suitable method.",
            text:
              "A creature uses an action to cut open the cocoon without damaging its contents, revealing one carried trophy, clue, or sign of a missing victim.",
          },
        }),
        tags: ["corpse-object", "investigation", "trophy", "missing-victim"],
        authored: true,
      },
    ],
    counterplayProfile: {
      telegraphs: ["The spinnerets lock straight and the final silk line tracks the nearest creature before the spider dies."],
      positioningAnswers: ["Move more than ten feet from the spider or ensure a less vulnerable creature is nearest when it dies."],
      breakConditions: ["The restraint ends when the target escapes or the finite silk object is destroyed."],
      nonDamageAnswers: ["Cutting tools, fire, Athletics, forced movement before death, and careful object interaction all answer the effect."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 0 }),
    decision: "REWRITE_AS_SNARE_AND_REMAINS_BUNDLE",
    rationale:
      "The legacy effect was only a vague clue drop. Death Cocoon turns the same imagery into a bounded restraint procedure and a separate finite evidence object, both with explicit interaction rules.",
    tacticalRoles: ["controller", "support", "lurker"],
  }),

  "face-curse": graftBase({
    title: "Last Face Curse",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 3,
    stats: { control: 3, fairness: 3 },
    summary:
      "The dying mask copies its final witnesses and turns their own expressions against them, unless they avert their gaze or destroy the face first.",
    mechanics:
      "When the monster dies, it targets one creature within 30 feet that can see the mask. A target can use its Reaction to avert its gaze, automatically succeeding on the save but becoming unable to see the corpse's space until the start of its next turn. Otherwise, the target makes a Wisdom saving throw. On a failed save, it has the Frightened condition and can't take Reactions until the end of its next turn. This effect doesn't trigger if the mask was destroyed before the monster died. The number of targets scales with CR.",
    counterplay:
      "The wax face turns toward selected witnesses as the body fails; break or cover the mask, move out of sight, or reserve a Reaction to avert your gaze.",
    tags: ["last-face-curse", "gaze", "frightened", "reaction-choice"],
    identity: {
      fantasy: "A preserved face that refuses to die anonymously and copies its final witnesses into the last expression.",
      tacticalRole: "Sight-based death control with a deliberate reaction trade and a destructible pre-death anchor.",
      signature: "The dying mask selects witnesses, who can avert their gaze or risk fear and reaction loss.",
      recognitionTags: ["turning-mask", "copied-expression", "averted-gaze", "breakable-face"],
    },
    abilities: [
      {
        id: "last-face-curse",
        title: "Last Face Curse",
        section: "death",
        summary: "The mask curses visible witnesses when the monster dies.",
        mechanics:
          "When the monster dies, it targets one creature within 30 feet that can see the mask. A target can use its Reaction to avert its gaze, automatically succeeding on the save but becoming unable to see the corpse's space until the start of its next turn. Otherwise, the target makes a Wisdom saving throw. On a failed save, it has the Frightened condition and can't take Reactions until the end of its next turn. This effect doesn't trigger if the mask was destroyed before the monster died.",
        counterplay: "Break or cover the mask, leave its sight, or spend a Reaction to avert your gaze.",
        rules: deathRules({
          resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
          targeting: { type: "single", range: 30, unit: "ft", targets: "one creature that can see the mask" },
          condition: {
            names: ["frightened"],
            severity: "major",
            direction: "enemy",
            duration: "until the end of its next turn",
            special: ["A target can use its Reaction to avert its gaze and automatically succeed, but can't see the corpse's space until the start of its next turn."],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          text: {
            failure:
              "The target has the Frightened condition and can't take Reactions until the end of its next turn.",
            success: "No effect. A target that averted its gaze can't see the corpse's space until the start of its next turn.",
            effect: "This effect doesn't trigger if the mask was destroyed before the monster died.",
          },
        }),
        tags: ["wisdom-save", "frightened", "reaction-lock", "avert-gaze"],
        authored: true,
      },
    ],
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "last-face-curse-cr-0-7-last-witness",
          minCr: 0,
          maxCr: 7,
          abilityIds: ["last-face-curse"],
          defaultSequence: ["last-face-curse"],
          abilityPatches: {
            "last-face-curse": {
              mechanics:
                "When the monster dies, it targets one creature within 30 feet that can see the mask. The target can avert its gaze with a Reaction or make a Wisdom saving throw. On a failed save, it is Frightened and can't take Reactions until the end of its next turn.",
              rules: { targeting: { type: "single", range: 30, unit: "ft", targets: "one creature that can see the mask" } },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "last-face-curse-cr-8-30-room-of-faces",
          minCr: 8,
          maxCr: 30,
          abilityIds: ["last-face-curse"],
          defaultSequence: ["last-face-curse"],
          abilityPatches: {
            "last-face-curse": {
              mechanics:
                "When the monster dies, it targets up to two creatures within 30 feet that can see the mask. Each target can avert its gaze with a Reaction or make a Wisdom saving throw. On a failed save, it is Frightened and can't take Reactions until the end of its next turn.",
              rules: { targeting: { type: "custom", range: 30, unit: "ft", targets: "up to two creatures that can see the mask" } },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    counterplayProfile: {
      telegraphs: ["The mask stops imitating the monster and slowly turns toward each creature it intends to curse."],
      positioningAnswers: ["Move behind total cover, beyond thirty feet, or anywhere the mask can't see before the killing blow lands."],
      breakConditions: ["Destroying or covering the mask prevents the trigger; each target can also spend its Reaction to avert its gaze."],
      nonDamageAnswers: ["Blindness, darkness, cloth, paint, a turned body, total cover, or deliberate gaze aversion all answer the curse."],
    },
    complexityProfile: profile({ decision: 3, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 0 }),
    decision: "REWRITE_AND_SCALE_GAZE_CURSE",
    rationale:
      "The legacy curse was a generic Frightened save without a telegraph or active player choice. The rewrite anchors it to sight, keeps the destructible mask answer, adds a reaction trade, and scales only target count.",
    tacticalRoles: ["controller", "support", "lurker"],
  }),
};

export const MONSTER_DEATH_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(DEATH_GRAFTS),
);

export const MONSTER_DEATH_GRAFT_SCALED_IDS = Object.freeze([
  "toxic-detonation",
  "purge-fluid-flood",
  "egg-hatch-death",
  "face-curse",
]);

export function getMonsterDeathGraftEditorialOverride(graftId = "") {
  return DEATH_GRAFTS[String(graftId || "").trim()] || null;
}
