export const MONSTER_WEAKNESS_GRAFT_EDITORIAL_VERSION =
  "monster-weakness-graft-editorial-v1.0";

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

function weaknessEffect(id, text, {
  type = "custom",
  subject = "self",
  trigger = "",
  duration = "",
  appliesTo = "the monster",
} = {}) {
  return {
    id,
    type,
    subject,
    trigger,
    appliesTo,
    duration,
    text,
    simulation: {
      policy: "nonNumeric",
      model: "player-facing weakness procedure",
      axis: "fairness",
      weight: 1,
    },
  };
}

function weaknessRules({
  trigger = null,
  resolution = { type: "none" },
  targeting = { type: "self", targets: "the monster" },
  condition = noCondition(),
  effect = "",
  failure = "",
  success = "",
  effects = [],
} = {}) {
  return {
    schemaVersion: RULES_VERSION,
    section: "trait",
    actionEconomy: "passive",
    usage: { type: "passive" },
    trigger,
    resolution,
    secondaryResolution: null,
    targeting,
    areaEffect: disabledStructure(),
    damage: noDamage(),
    condition,
    counterplay: {
      telegraph: true,
      breakCondition: true,
      positioningAnswer: true,
      nonDamageAnswer: true,
    },
    text: {
      ...(effect ? { effect } : {}),
      ...(failure ? { failure } : {}),
      ...(success ? { success } : {}),
    },
    multiattack: disabledStructure(),
    spellcasting: disabledStructure(),
    defense: disabledStructure(),
    summon: disabledStructure(),
    procedure: disabledStructure(),
    references: [],
    ongoing: disabledStructure(),
    effects,
  };
}

function weaknessRoutine() {
  return {
    mode: "none",
    defaultPlan: "",
    targetSelection: "",
    defaultSequence: [],
    opener: [],
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives: [],
    nonMultiattackReason:
      "A Weakness is a player-facing exploit and never participates in the monster's Multiattack.",
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

function spike({ control = 1, repeatability = 1 } = {}) {
  return {
    openingBurst: 0,
    controlSpike: control,
    damageSpike: 0,
    repeatability,
  };
}

function editorial(decision, rationale) {
  return {
    status: "reviewed",
    phase: "phase6r-weakness-editorial-review",
    version: MONSTER_WEAKNESS_GRAFT_EDITORIAL_VERSION,
    decision,
    rationale,
    reviewedAt: "2026-07-27",
  };
}

function fit({ encounterRoles = ["minion", "standard", "boss"], tacticalRoles }) {
  return {
    schemaVersion: "monster-frame-fit-v1.0",
    encounterRoles: {
      allowed: encounterRoles,
      recommended: encounterRoles,
    },
    tempo: { recommended: ["slow", "standard", "fast", "ambusher"] },
    danger: { recommended: ["standard", "hard", "horror"] },
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
  ability,
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
    slot: "weakness",
    section: "trait",
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
    abilities: [ability],
    routine: weaknessRoutine(),
    progression,
    fit: fit({ encounterRoles: roleBias, tacticalRoles }),
    complexityProfile,
    counterplayProfile,
    spikeRiskProfile,
    editorial: editorial(decision, rationale),
  };
}

const WEAKNESS_GRAFTS = {
  "head-weak-spot": graftBase({
    title: "Exposed Skull",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 2 },
    summary:
      "Once the corpse is pinned or toppled, its stretched skull becomes a deliberate finishing target instead of an arbitrary called shot.",
    mechanics:
      "If the monster has the Prone, Restrained, or Incapacitated condition, a creature within 5 feet of it can take an action to make one melee attack against its head. On a hit, the attack becomes a Critical Hit, and the monster can't take Reactions until the start of its next turn.",
    counterplay:
      "The scalp splits and the skull shifts beneath it; knock the corpse down or restrain it before attempting the finishing strike.",
    tags: ["exposed-skull", "precision", "setup", "critical-hit"],
    identity: {
      fantasy: "A decomposing skull held together only while the corpse remains upright and uncontrolled.",
      tacticalRole: "Setup-based precision exploit that converts control into a high-value melee strike.",
      signature: "A prone or restrained corpse exposes its skull to a deliberate critical hit.",
      recognitionTags: ["split-scalp", "loose-skull", "prone-setup", "critical-finish"],
    },
    ability: {
      id: "exposed-skull",
      title: "Exposed Skull",
      section: "trait",
      summary: "Control the corpse, then strike the skull at close range.",
      mechanics:
        "If the monster has the Prone, Restrained, or Incapacitated condition, a creature within 5 feet of it can take an action to make one melee attack against its head. On a hit, the attack becomes a Critical Hit, and the monster can't take Reactions until the start of its next turn.",
      counterplay: "Knock the monster Prone, restrain it, or incapacitate it before committing an action to the head strike.",
      rules: weaknessRules({
        trigger: "The monster is Prone, Restrained, or Incapacitated.",
        effect:
          "If the monster has the Prone, Restrained, or Incapacitated condition, a creature within 5 feet of it can take an action to make one melee attack against its head. On a hit, the attack becomes a Critical Hit, and the monster can't take Reactions until the start of its next turn.",
        effects: [
          weaknessEffect(
            "exposed-skull-critical",
            "On a hit, the attack becomes a Critical Hit.",
            { subject: "triggeringCreature", appliesTo: "the qualifying melee attack" },
          ),
          weaknessEffect(
            "exposed-skull-reaction-lock",
            "The monster can't take Reactions until the start of its next turn.",
            { type: "control", duration: "until the start of its next turn" },
          ),
        ],
      }),
      tags: ["precision", "critical-hit", "reaction-lock"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["The scalp is split and the skull visibly shifts whenever the corpse is knocked off balance."],
      positioningAnswers: ["A character must be within 5 feet of the controlled corpse to attempt the strike."],
      breakConditions: ["The exploit is unavailable unless the monster is Prone, Restrained, or Incapacitated."],
      nonDamageAnswers: ["Shove, grapple, restrain, or incapacitate the monster before using the attack action on its skull."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 1 }),
    decision: "REWRITE_SETUP_PRECISION",
    rationale:
      "The legacy -5 called shot was an unsupported subsystem. The rewrite uses standard conditions as setup, preserves a precision payoff, and makes the exploit deliberate and table-readable.",
    tacticalRoles: ["brute", "controller", "soldier"],
  }),

  "mechanical-stress": graftBase({
    title: "Dismemberment",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 3 },
    summary:
      "Heavy slashing blows tear the bloodied corpse apart one limb at a time, turning focused damage into accumulating impairment.",
    mechanics:
      "At the end of a turn, if the Bloodied monster took at least 8 Slashing damage during that turn, one of its limbs is severed and it gains 1 Exhaustion level. The monster can suffer this effect no more than once per round and regrows its missing limbs and removes all Exhaustion levels gained from this trait the next time it regains Hit Points. The damage threshold scales with CR.",
    counterplay:
      "Its joints separate and tendons pull taut after it becomes Bloodied; concentrate meaningful Slashing damage before the turn ends.",
    tags: ["dismemberment", "bloodied", "slashing", "exhaustion"],
    identity: {
      fantasy: "A corpse whose softened joints can no longer hold together under concentrated cutting blows.",
      tacticalRole: "Bloodied-phase attrition weakness that rewards coordinated slashing damage.",
      signature: "A qualifying round of Slashing damage severs one limb and adds Exhaustion.",
      recognitionTags: ["loose-joints", "severed-limb", "bloodied-window", "slashing-threshold"],
    },
    ability: {
      id: "dismemberment",
      title: "Dismemberment",
      section: "trait",
      summary: "Concentrated slashing damage severs limbs from the Bloodied corpse.",
      mechanics:
        "At the end of a turn, if the Bloodied monster took at least 8 Slashing damage during that turn, one of its limbs is severed and it gains 1 Exhaustion level. The monster can suffer this effect no more than once per round and regrows its missing limbs and removes all Exhaustion levels gained from this trait the next time it regains Hit Points.",
      counterplay: "Wait until the monster is Bloodied, then coordinate Slashing damage within the same turn.",
      rules: weaknessRules({
        trigger: "At the end of a turn, the Bloodied monster took at least 8 Slashing damage during that turn.",
        effect:
          "At the end of a turn, if the Bloodied monster took at least 8 Slashing damage during that turn, one of its limbs is severed and it gains 1 Exhaustion level. The monster can suffer this effect no more than once per round and regrows its missing limbs and removes all Exhaustion levels gained from this trait the next time it regains Hit Points.",
        effects: [
          weaknessEffect(
            "dismemberment-exhaustion",
            "One of its limbs is severed and it gains 1 Exhaustion level.",
            { type: "control", duration: "until the monster regains Hit Points" },
          ),
        ],
      }),
      tags: ["bloodied", "slashing", "exhaustion", "once-per-round"],
      authored: true,
    },
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-fragile-joints", minCr: 0, maxCr: 4, threshold: 8 },
        { id: "cr-5-12-softened-joints", minCr: 5, maxCr: 12, threshold: 15 },
        { id: "cr-13-30-massive-joints", minCr: 13, maxCr: 30, threshold: 25 },
      ].map((band) => ({
        ...band,
        abilityIds: ["dismemberment"],
        defaultSequence: ["dismemberment"],
        abilityPatches: {
          dismemberment: {
            mechanics: `At the end of a turn, if the Bloodied monster took at least ${band.threshold} Slashing damage during that turn, one of its limbs is severed and it gains 1 Exhaustion level. The monster can suffer this effect no more than once per round and regrows its missing limbs and removes all Exhaustion levels gained from this trait the next time it regains Hit Points.`,
            rules: {
              trigger: `At the end of a turn, the Bloodied monster took at least ${band.threshold} Slashing damage during that turn.`,
              text: {
                effect: `At the end of a turn, if the Bloodied monster took at least ${band.threshold} Slashing damage during that turn, one of its limbs is severed and it gains 1 Exhaustion level. The monster can suffer this effect no more than once per round and regrows its missing limbs and removes all Exhaustion levels gained from this trait the next time it regains Hit Points.`,
              },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    counterplayProfile: {
      telegraphs: ["Once Bloodied, its joints gape and strands of tendon stretch between loosely connected limbs."],
      positioningAnswers: ["Stay close enough to coordinate several Slashing attacks before the same turn ends."],
      breakConditions: ["Only a Bloodied monster can be dismembered, and the threshold can trigger at most once per round."],
      nonDamageAnswers: ["Effects that grant allies attacks, expose the monster, or hold it in place make the damage threshold easier to reach."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 2 }),
    decision: "REWRITE_AND_SCALE",
    rationale:
      "The legacy half-maximum-HP trigger was practically unreachable and produced three unrelated bespoke injuries. Dismemberment adopts a Bloodied slashing threshold and one accumulating, recoverable consequence.",
    tacticalRoles: ["brute", "soldier", "boss"],
  }),

  "radiant-preservation-failure": graftBase({
    title: "Radiant Disruption",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    summary:
      "Radiant energy briefly collapses the preserving necromancy, opening a safe window in which the corpse cannot retaliate or burst at death.",
    mechanics:
      "After the monster takes Radiant damage, it can't take Reactions or benefit from a trait that would prevent it from dropping to 0 Hit Points until the start of its next turn. If it drops to 0 Hit Points during that time, its Death features don't activate.",
    counterplay:
      "Holy light visibly drains the pressure from its veins; apply Radiant damage immediately before committing to the killing blow.",
    tags: ["radiant", "suppression", "reaction-lock", "safe-kill"],
    identity: {
      fantasy: "A preserved corpse whose necromantic pressure collapses under holy light.",
      tacticalRole: "Damage-type setup that suppresses retaliation, death prevention, and death-trigger hazards.",
      signature: "Radiant damage creates one round in which the corpse can be finished safely.",
      recognitionTags: ["radiant-collapse", "dark-veins", "safe-kill", "death-suppression"],
    },
    ability: {
      id: "radiant-disruption",
      title: "Radiant Disruption",
      section: "trait",
      summary: "Radiant damage suppresses the corpse's last defenses and death burst.",
      mechanics:
        "After the monster takes Radiant damage, it can't take Reactions or benefit from a trait that would prevent it from dropping to 0 Hit Points until the start of its next turn. If it drops to 0 Hit Points during that time, its Death features don't activate.",
      counterplay: "Deal Radiant damage before the finishing sequence rather than after the corpse has already ruptured.",
      rules: weaknessRules({
        trigger: "The monster takes Radiant damage.",
        effect:
          "After the monster takes Radiant damage, it can't take Reactions or benefit from a trait that would prevent it from dropping to 0 Hit Points until the start of its next turn. If it drops to 0 Hit Points during that time, its Death features don't activate.",
        effects: [
          weaknessEffect(
            "radiant-reaction-lock",
            "It can't take Reactions until the start of its next turn.",
            { type: "control", duration: "until the start of its next turn" },
          ),
          weaknessEffect(
            "radiant-death-suppression",
            "If it drops to 0 Hit Points during that time, its Death features don't activate.",
            { type: "defense", duration: "until the start of its next turn" },
          ),
        ],
      }),
      tags: ["radiant", "reaction-lock", "death-suppression"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["Radiant damage makes the corpse's black veins fade and its swollen body visibly deflate."],
      positioningAnswers: ["Coordinate the Radiant hit with allies already positioned to deliver the finishing attacks."],
      breakConditions: ["The suppression lasts only until the start of the monster's next turn."],
      nonDamageAnswers: ["Holy water, consecrated hazards, and other effects that deal Radiant damage can open the same safe-kill window."],
    },
    complexityProfile: profile({ decision: 1, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 2 }),
    decision: "REWRITE_SUPPRESSION_WINDOW",
    rationale:
      "The legacy version referred only to undefined Unstable reactions. The rewrite is self-contained and makes Radiant damage a recognizable sequencing tool against both death prevention and death-trigger grafts.",
    tacticalRoles: ["brute", "soldier", "boss"],
  }),

  "daytime-weakness": graftBase({
    title: "Sunlight Weakness",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -3,
    complexity: 1,
    stats: { fairness: 3 },
    summary:
      "Sunlight pins the corpse-eating spirit into a slow, uncertain shape and strips away its nocturnal certainty.",
    mechanics:
      "While in sunlight, the monster has Disadvantage on D20 Tests, and its Speed is halved. Magical light counts as sunlight only if the effect creating it says that it is sunlight.",
    counterplay:
      "Lure the spirit into dawn, tear open the roof, or use an effect that explicitly creates sunlight.",
    tags: ["sunlight", "d20-tests", "speed", "spirit-binding"],
    identity: {
      fantasy: "A night-bound hungry spirit made heavy and uncertain by direct sunlight.",
      tacticalRole: "Environmental weakness that reduces reliability and mobility while the monster remains exposed.",
      signature: "Sunlight imposes Disadvantage on D20 Tests and halves Speed.",
      recognitionTags: ["sunlight", "fading-spirit", "slow-shadow", "day-bound"],
    },
    ability: {
      id: "sunlight-weakness",
      title: "Sunlight Weakness",
      section: "trait",
      summary: "Sunlight weakens every test the spirit makes and slows its escape.",
      mechanics:
        "While in sunlight, the monster has Disadvantage on D20 Tests, and its Speed is halved. Magical light counts as sunlight only if the effect creating it says that it is sunlight.",
      counterplay: "Open the battlefield to natural sunlight or use magic that explicitly produces sunlight.",
      rules: weaknessRules({
        trigger: "The monster is in sunlight.",
        effect:
          "While in sunlight, the monster has Disadvantage on D20 Tests, and its Speed is halved. Magical light counts as sunlight only if the effect creating it says that it is sunlight.",
        effects: [
          weaknessEffect(
            "sunlight-disadvantage",
            "While in sunlight, the monster has Disadvantage on D20 Tests.",
            { type: "disadvantage", duration: "while in sunlight" },
          ),
          weaknessEffect(
            "sunlight-slow",
            "Its Speed is halved.",
            { type: "movement", duration: "while in sunlight" },
          ),
        ],
      }),
      tags: ["canonical-name", "sunlight", "disadvantage", "speed"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["Its outline thins and drags behind it wherever direct sunlight touches the spirit."],
      positioningAnswers: ["Force the monster to remain in an exposed courtyard, broken roof, or daylight lane."],
      breakConditions: ["Ordinary Bright Light is insufficient unless the effect explicitly counts as sunlight."],
      nonDamageAnswers: ["Open shutters, collapse cover, break a roof, or time the confrontation for dawn."],
    },
    complexityProfile: profile({ decision: 1, branches: 1, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 2 }),
    decision: "RENAME_CANONICAL_AND_REWRITE",
    rationale:
      "The legacy trigger depended on being forced to remain on the Material Plane during daytime, a state the game did not define. The rewrite uses the canonical Sunlight Weakness name and a direct battlefield condition.",
    tacticalRoles: ["lurker", "skirmisher", "controller"],
  }),

  "shameful-feeding": graftBase({
    title: "Shame",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 2 },
    summary:
      "A witness who names the hunger for what it is can rupture the spirit's predatory composure whenever it approaches a corpse.",
    mechanics:
      "When the monster starts its turn within 5 feet of a corpse and a creature within 30 feet can see it, one witness can use its Reaction to denounce its hunger or speak the monster's mortal name. The monster makes a Wisdom saving throw. On a failure, it can't take Reactions, its Speed is halved, and it has Disadvantage on attack rolls until the end of its next turn. On a success, it is immune to this witness's Shame for 24 hours.",
    counterplay:
      "Keep a corpse in view and preserve a Reaction; the weakness exists only when the spirit begins its turn close enough to feed.",
    tags: ["shame", "corpse-proximity", "witness", "reaction"],
    identity: {
      fantasy: "A corpse-eater that can endure violence but not recognition of the human shame beneath its hunger.",
      tacticalRole: "Witness-triggered interruption that punishes corpse fixation and opens a brief retaliation window.",
      signature: "A witness spends a Reaction to name the hunger and break the spirit's composure near a corpse.",
      recognitionTags: ["witness", "mortal-name", "corpse-fixation", "broken-composure"],
    },
    ability: {
      id: "shame",
      title: "Shame",
      section: "trait",
      summary: "A witness can break the spirit's composure when it approaches a corpse.",
      mechanics:
        "When the monster starts its turn within 5 feet of a corpse and a creature within 30 feet can see it, one witness can use its Reaction to denounce its hunger or speak the monster's mortal name. The monster makes a Wisdom saving throw. On a failure, it can't take Reactions, its Speed is halved, and it has Disadvantage on attack rolls until the end of its next turn. On a success, it is immune to this witness's Shame for 24 hours.",
      counterplay: "Keep sight of the corpse and save a Reaction for the start of the monster's turn.",
      rules: weaknessRules({
        trigger: "When the monster starts its turn within 5 feet of a corpse while a creature within 30 feet can see it, one witness can use its Reaction to denounce its hunger or speak the monster's mortal name.",
        resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
        targeting: { type: "single", targets: "" },
        failure:
          "The monster can't take Reactions, its Speed is halved, and it has Disadvantage on attack rolls until the end of its next turn.",
        success:
          "The monster is immune to this witness's Shame for 24 hours.",
        effects: [
          weaknessEffect(
            "shame-interruption",
            "The monster can't take Reactions, its Speed is halved, and it has Disadvantage on attack rolls until the end of its next turn.",
            { type: "control", duration: "until the end of its next turn" },
          ),
        ],
      }),
      tags: ["corpse-proximity", "reaction", "wisdom-save", "disadvantage"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["The spirit becomes solid, lowers its head, and fixes on a nearby corpse as though the rest of the room has vanished."],
      positioningAnswers: ["A witness must remain within 30 feet with an unobstructed view when the monster starts its turn near a corpse."],
      breakConditions: ["The response can be attempted only at the start of a turn spent within 5 feet of a corpse, and a successful save grants 24-hour immunity against that witness."],
      nonDamageAnswers: ["Learn the mortal name, place or protect a corpse, maintain surveillance, and preserve a Reaction."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 1 }),
    decision: "REWRITE_REACTION_ANSWER",
    rationale:
      "The legacy trait imposed Frightened while overriding immunity and depended on an undefined feeding event. The rewrite makes corpse proximity, witness Reaction, saving throw, bounded impairment, and per-witness immunity explicit.",
    tacticalRoles: ["lurker", "controller", "boss"],
  }),

  "dangerous-hunger": graftBase({
    title: "Consecrated Bait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 3 },
    summary:
      "The spirit's hunger can be weaponized by preparing a corpse with salt, holy water, and funeral bindings before the encounter.",
    mechanics:
      "A creature can spend 1 minute and expend a flask of Holy Water or 10 GP of ritual salt and incense to prepare a corpse as bait. The first time the monster enters a space within 5 feet of that corpse or starts its turn there, the bindings erupt: the monster takes 2d6 Radiant damage and has the Restrained condition until the end of its next turn. The damage scales with CR.",
    counterplay:
      "Prepare the bait before combat, place it where the spirit must approach or pass it, and attack while the bindings hold.",
    tags: ["consecrated-bait", "preparation", "radiant", "restrained"],
    identity: {
      fantasy: "A starving spirit unable to recognize funeral wards hidden inside the meal it craves.",
      tacticalRole: "Pre-combat trap that converts investigation and resources into a bounded control window.",
      signature: "A prepared corpse erupts in consecrated bindings when the monster comes close enough to claim it.",
      recognitionTags: ["salted-corpse", "holy-water", "funeral-bindings", "bait-trap"],
    },
    ability: {
      id: "consecrated-bait",
      title: "Consecrated Bait",
      section: "trait",
      summary: "A ritually prepared corpse traps the spirit when it comes within reach.",
      mechanics:
        "A creature can spend 1 minute and expend a flask of Holy Water or 10 GP of ritual salt and incense to prepare a corpse as bait. The first time the monster enters a space within 5 feet of that corpse or starts its turn there, it takes 2d6 Radiant damage and has the Restrained condition until the end of its next turn.",
      counterplay: "Spend the preparation time and resource before the monster reaches the corpse, then use its approach to trigger the Restrained window.",
      rules: weaknessRules({
        trigger: "The monster enters a space within 5 feet of a corpse prepared as Consecrated Bait or starts its turn there.",
        condition: {
          names: ["restrained"],
          severity: "major",
          direction: "weakness",
          duration: "until the end of its next turn",
          special: [],
          sizeLimit: "",
          escape: null,
          repeatSave: null,
        },
        effect:
          "A creature can spend 1 minute and expend a flask of Holy Water or 10 GP of ritual salt and incense to prepare a corpse as bait. The first time the monster enters a space within 5 feet of that corpse or starts its turn there, it takes 2d6 Radiant damage and has the Restrained condition until the end of its next turn.",
        effects: [
          weaknessEffect(
            "consecrated-bait-radiant",
            "The first time the monster enters a space within 5 feet of that corpse or starts its turn there, it takes 2d6 Radiant damage.",
            { type: "custom", duration: "instantaneous" },
          ),
          weaknessEffect(
            "consecrated-bait-restraint",
            "It has the Restrained condition until the end of its next turn.",
            { type: "control", duration: "until the end of its next turn" },
          ),
        ],
      }),
      tags: ["preparation", "resource", "radiant", "restrained"],
      authored: true,
    },
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-consecrated-bait", minCr: 0, maxCr: 4, damage: "2d6" },
        { id: "cr-5-12-consecrated-bait", minCr: 5, maxCr: 12, damage: "4d6" },
        { id: "cr-13-30-consecrated-bait", minCr: 13, maxCr: 30, damage: "6d6" },
      ].map((band) => ({
        ...band,
        abilityIds: ["consecrated-bait"],
        defaultSequence: ["consecrated-bait"],
        abilityPatches: {
          "consecrated-bait": {
            mechanics: `A creature can spend 1 minute and expend a flask of Holy Water or 10 GP of ritual salt and incense to prepare a corpse as bait. The first time the monster enters a space within 5 feet of that corpse or starts its turn there, it takes ${band.damage} Radiant damage and has the Restrained condition until the end of its next turn.`,
            rules: {
              text: {
                effect: `A creature can spend 1 minute and expend a flask of Holy Water or 10 GP of ritual salt and incense to prepare a corpse as bait. The first time the monster enters a space within 5 feet of that corpse or starts its turn there, it takes ${band.damage} Radiant damage and has the Restrained condition until the end of its next turn.`,
              },
              effects: [
                weaknessEffect(
                  "consecrated-bait-radiant",
                  `The first time the monster enters a space within 5 feet of that corpse or starts its turn there, it takes ${band.damage} Radiant damage.`,
                  { type: "custom", duration: "instantaneous" },
                ),
                weaknessEffect(
                  "consecrated-bait-restraint",
                  "It has the Restrained condition until the end of its next turn.",
                  { type: "control", duration: "until the end of its next turn" },
                ),
              ],
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    counterplayProfile: {
      telegraphs: ["The spirit leans toward untouched corpses, and consecrated salt glints through the prepared bait's seams."],
      positioningAnswers: ["Place the bait where approaching it exposes the monster to the party rather than behind cover or inside a wall."],
      breakConditions: ["The trap requires one minute of preparation, a corpse, and the listed consumable resource."],
      nonDamageAnswers: ["Investigation, ritual knowledge, holy water, salt, and corpse placement create the opening before initiative begins."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 0 }),
    decision: "REWRITE_AND_SCALE",
    rationale:
      "The legacy bait had undefined preparation and referenced Incorporeal Movement even when that graft was absent. The rewrite defines time, cost, a proximity trigger, damage, and a self-contained Restrained payoff.",
    tacticalRoles: ["lurker", "controller", "boss"],
  }),

  "salt-and-names": graftBase({
    title: "Salt and True Names",
    source: "jikininki",
    typeBias: ["undead", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 3 },
    summary:
      "Burial salt and the name the spirit carried in life form a temporary boundary it cannot cross without confronting what it became.",
    mechanics:
      "A creature within 30 feet of the monster can take a Magic action to present burial salt, perform a funeral invocation, or speak the monster's true name. The monster makes a Wisdom saving throw. On a failure, until the end of its next turn it can't willingly move closer to that creature, enter that creature's space, or move through creatures or objects. On a success, it is immune to that creature's Salt and True Names for 24 hours.",
    counterplay:
      "Research the mortal identity or carry burial materials, then use the rite to hold a line or force the spirit away from a corpse.",
    tags: ["salt", "true-name", "ritual", "space-control"],
    identity: {
      fantasy: "A hungry ghost still bound by the burial customs and mortal name it abandoned.",
      tacticalRole: "Non-damage action that creates a short personal ward and blocks incorporeal approach.",
      signature: "A true name or burial rite forces the spirit to respect one creature's boundary.",
      recognitionTags: ["burial-salt", "true-name", "funeral-rite", "personal-ward"],
    },
    ability: {
      id: "salt-and-true-names",
      title: "Salt and True Names",
      section: "trait",
      summary: "A funeral rite creates a temporary boundary against the spirit.",
      mechanics:
        "A creature within 30 feet of the monster can take a Magic action to present burial salt, perform a funeral invocation, or speak the monster's true name. The monster makes a Wisdom saving throw. On a failure, until the end of its next turn it can't willingly move closer to that creature, enter that creature's space, or move through creatures or objects. On a success, it is immune to that creature's Salt and True Names for 24 hours.",
      counterplay: "Use a Magic action, burial materials, or discovered identity to deny the spirit a route for one round.",
      rules: weaknessRules({
        trigger: "A creature within 30 feet of the monster can take a Magic action to present burial salt, perform a funeral invocation, or speak the monster's true name.",
        resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
        targeting: { type: "single", targets: "" },
        failure:
          "Until the end of its next turn, the monster can't willingly move closer to that creature, enter that creature's space, or move through creatures or objects.",
        success:
          "The monster is immune to that creature's Salt and True Names for 24 hours.",
        effects: [
          weaknessEffect(
            "salt-boundary",
            "Until the end of its next turn, the monster can't willingly move closer to that creature, enter that creature's space, or move through creatures or objects.",
            { type: "movement", duration: "until the end of its next turn" },
          ),
        ],
      }),
      tags: ["magic-action", "wisdom-save", "ward", "movement-denial"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["The spirit hesitates at old grave lines and reacts violently when fragments of its mortal name are spoken."],
      positioningAnswers: ["Use the ward from a position that blocks the route to a corpse, victim, or escape surface."],
      breakConditions: ["The boundary lasts only through the end of the monster's next turn and grants per-creature immunity on a successful save."],
      nonDamageAnswers: ["Research records, question mourners, recover funeral tokens, or carry burial salt."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 1 }),
    decision: "REWRITE_RITUAL_CONTROL",
    rationale:
      "The core concept was strong but its one-line effect did not define action type, full movement restriction, or immunity cadence. The rewrite turns it into a complete ritual control procedure.",
    tacticalRoles: ["lurker", "controller", "skirmisher"],
  }),

  "thin-legs": graftBase({
    title: "Unsteady Legs",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -1,
    complexity: 1,
    stats: { fairness: 2 },
    summary:
      "The spider's long legs dominate stable surfaces but buckle when enemies redirect it across loose or slippery ground.",
    mechanics:
      "When the monster is moved at least 5 feet against its will while touching the ground, or when it enters a space covered in grease, ice, loose rubble, or a similar unstable surface, it makes a Dexterity saving throw. On a failure, it has the Prone condition, and its Speed becomes 0 until the end of the current turn.",
    counterplay:
      "Create unstable terrain or combine forced movement with a grounded position instead of contesting the spider on its web.",
    tags: ["unsteady-legs", "forced-movement", "terrain", "prone"],
    identity: {
      fantasy: "A tall spider whose delicate legs lose leverage when the ground moves beneath them.",
      tacticalRole: "Forced-movement and terrain weakness that converts environmental play into Prone.",
      signature: "A shove across unstable ground can collapse the spider's stance and end its movement.",
      recognitionTags: ["thin-legs", "slipping-feet", "forced-movement", "unstable-ground"],
    },
    ability: {
      id: "unsteady-legs",
      title: "Unsteady Legs",
      section: "trait",
      summary: "Forced movement and unstable ground can collapse the spider's stance.",
      mechanics:
        "When the monster is moved at least 5 feet against its will while touching the ground, or when it enters a space covered in grease, ice, loose rubble, or a similar unstable surface, it makes a Dexterity saving throw. On a failure, it has the Prone condition, and its Speed becomes 0 until the end of the current turn.",
      counterplay: "Shove, pull, or lure the grounded spider onto an unstable surface.",
      rules: weaknessRules({
        trigger: "The grounded monster is moved at least 5 feet against its will or enters an unstable surface.",
        resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
        targeting: { type: "single", targets: "" },
        condition: {
          names: ["prone"],
          severity: "moderate",
          direction: "weakness",
          duration: "until it stands",
          special: [],
          sizeLimit: "",
          escape: null,
          repeatSave: null,
        },
        failure:
          "The monster has the Prone condition, and its Speed becomes 0 until the end of the current turn.",
        success: "No effect.",
        effects: [
          weaknessEffect(
            "unsteady-legs-collapse",
            "The monster has the Prone condition, and its Speed becomes 0 until the end of the current turn.",
            { type: "movement", duration: "until the end of the current turn" },
          ),
        ],
      }),
      tags: ["forced-movement", "dexterity-save", "prone", "speed-zero"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["Its feet skid outward on polished stone, loose bones, and any surface not reinforced by webbing."],
      positioningAnswers: ["Keep it grounded and align forced movement with an unstable patch of terrain."],
      breakConditions: ["The weakness does not trigger while the monster is airborne or securely attached to webbing."],
      nonDamageAnswers: ["Use Shove, pulls, grease, ice, ball bearings, loose rubble, or collapsing terrain."],
    },
    complexityProfile: profile({ decision: 1, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 2 }),
    decision: "REWRITE_POSITIONAL_ANSWER",
    rationale:
      "The legacy rule only made the spider fail undefined balance checks. The rewrite uses explicit forced movement, terrain, a Dexterity save, Prone, and a bounded Speed consequence.",
    tacticalRoles: ["skirmisher", "lurker", "controller"],
  }),

  "fear-of-fire": graftBase({
    title: "Fear of Fire",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    summary:
      "Even a small burn breaks the spider's predatory focus and makes it recoil from the source of the flame.",
    mechanics:
      "After the monster takes Fire damage, it has Disadvantage on attack rolls and ability checks until the end of its next turn. During that time, it can't willingly move closer to the source of the Fire damage.",
    counterplay:
      "Fire damage is the trigger; a torch alone is only a warning unless it actually burns the spider.",
    tags: ["fear-of-fire", "fire-damage", "disadvantage", "aversion"],
    identity: {
      fantasy: "A giant spider whose hunting instinct collapses into animal panic when its hairs ignite.",
      tacticalRole: "Canonical damage-type aversion that reduces accuracy and controls approach for one round.",
      signature: "Fire damage imposes Disadvantage and prevents approach toward its source.",
      recognitionTags: ["singed-hairs", "fire-aversion", "recoil", "predatory-panic"],
    },
    ability: {
      id: "fear-of-fire",
      title: "Fear of Fire",
      section: "trait",
      summary: "Fire damage breaks the spider's focus and drives it away from the flame.",
      mechanics:
        "After the monster takes Fire damage, it has Disadvantage on attack rolls and ability checks until the end of its next turn. During that time, it can't willingly move closer to the source of the Fire damage.",
      counterplay: "Deal Fire damage before closing or use the source of the damage to hold a lane.",
      rules: weaknessRules({
        trigger: "The monster takes Fire damage.",
        effect:
          "After the monster takes Fire damage, it has Disadvantage on attack rolls and ability checks until the end of its next turn. During that time, it can't willingly move closer to the source of the Fire damage.",
        effects: [
          weaknessEffect(
            "fire-aversion-disadvantage",
            "It has Disadvantage on attack rolls and ability checks until the end of its next turn.",
            { type: "disadvantage", duration: "until the end of its next turn" },
          ),
          weaknessEffect(
            "fire-aversion-movement",
            "During that time, it can't willingly move closer to the source of the Fire damage.",
            { type: "movement", duration: "until the end of its next turn" },
          ),
        ],
      }),
      tags: ["canonical-feature", "fire", "disadvantage", "movement-denial"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["The spider recoils from sparks and pulls singed legs tightly beneath its body."],
      positioningAnswers: ["Place the source of Fire damage on the side from which the spider must approach."],
      breakConditions: ["The aversion lasts only until the end of the monster's next turn and requires actual Fire damage."],
      nonDamageAnswers: ["Use burning terrain, oil, torches as improvised weapons, or environmental flame rather than spending a high-damage spell."],
    },
    complexityProfile: profile({ decision: 1, branches: 1, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 2 }),
    decision: "REWRITE_CANONICAL",
    rationale:
      "The legacy version required an enormous ten-foot-radius blaze and applied Frightened without a save. The rewrite follows the recognizable 2024 Fear of Fire pattern and adds a bounded positional aversion.",
    tacticalRoles: ["skirmisher", "lurker", "brute"],
  }),

  "underbelly-weak-spot": graftBase({
    title: "Exposed Underbelly",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    summary:
      "Leaps, wall transitions, and knockdowns expose the pale abdomen for one brief burst of coordinated violence.",
    mechanics:
      "When the monster jumps, changes between a wall, ceiling, and floor, or gains the Prone condition, its underbelly is exposed until the start of its next turn. Attack rolls against it have Advantage during that time, and the first hit deals an extra 1d6 damage of the attack's type. The extra damage scales with CR.",
    counterplay:
      "Force a transition or knock the spider down, then concentrate attacks before it rights itself.",
    tags: ["underbelly", "movement-transition", "advantage", "extra-damage"],
    identity: {
      fantasy: "A spider armored above but pale and nearly translucent across the abdomen.",
      tacticalRole: "Movement-transition weakness that creates a short group focus-fire window.",
      signature: "Jumping, changing surfaces, or falling Prone exposes the underbelly to Advantage and bonus damage.",
      recognitionTags: ["pale-abdomen", "surface-transition", "prone-window", "focus-fire"],
    },
    ability: {
      id: "exposed-underbelly",
      title: "Exposed Underbelly",
      section: "trait",
      summary: "Movement transitions expose the spider's unarmored abdomen.",
      mechanics:
        "When the monster jumps, changes between a wall, ceiling, and floor, or gains the Prone condition, its underbelly is exposed until the start of its next turn. Attack rolls against it have Advantage during that time, and the first hit deals an extra 1d6 damage of the attack's type.",
      counterplay: "Force a jump, surface transition, or Prone condition, then attack before the next turn.",
      rules: weaknessRules({
        trigger: "The monster jumps, moves from a ceiling to a wall or floor, or gains the Prone condition.",
        effect:
          "When the monster jumps, changes between a wall, ceiling, and floor, or gains the Prone condition, its underbelly is exposed until the start of its next turn. Attack rolls against it have Advantage during that time, and the first hit deals an extra 1d6 damage of the attack's type.",
        effects: [
          weaknessEffect(
            "underbelly-advantage",
            "Attack rolls against it have Advantage during that time.",
            { type: "advantage", subject: "triggeringCreature", duration: "until the start of its next turn", appliesTo: "attack rolls against the monster" },
          ),
          weaknessEffect(
            "underbelly-extra-damage",
            "The first hit deals an extra 1d6 damage of the attack's type.",
            { type: "custom", subject: "triggeringCreature", duration: "the first hit during the exposure", appliesTo: "the first qualifying hit" },
          ),
        ],
      }),
      tags: ["advantage", "extra-damage", "movement-transition", "prone"],
      authored: true,
    },
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-soft-underbelly", minCr: 0, maxCr: 4, damage: "1d6" },
        { id: "cr-5-12-open-underbelly", minCr: 5, maxCr: 12, damage: "2d6" },
        { id: "cr-13-30-ruptured-underbelly", minCr: 13, maxCr: 30, damage: "3d6" },
      ].map((band) => ({
        ...band,
        abilityIds: ["exposed-underbelly"],
        defaultSequence: ["exposed-underbelly"],
        abilityPatches: {
          "exposed-underbelly": {
            mechanics: `When the monster jumps, changes between a wall, ceiling, and floor, or gains the Prone condition, its underbelly is exposed until the start of its next turn. Attack rolls against it have Advantage during that time, and the first hit deals an extra ${band.damage} damage of the attack's type.`,
            rules: {
              text: {
                effect: `When the monster jumps, changes between a wall, ceiling, and floor, or gains the Prone condition, its underbelly is exposed until the start of its next turn. Attack rolls against it have Advantage during that time, and the first hit deals an extra ${band.damage} damage of the attack's type.`,
              },
              effects: [
                weaknessEffect(
                  "underbelly-advantage",
                  "Attack rolls against it have Advantage during that time.",
                  { type: "advantage", subject: "triggeringCreature", duration: "until the start of its next turn", appliesTo: "attack rolls against the monster" },
                ),
                weaknessEffect(
                  "underbelly-extra-damage",
                  `The first hit deals an extra ${band.damage} damage of the attack's type.`,
                  { type: "custom", subject: "triggeringCreature", duration: "the first hit during the exposure", appliesTo: "the first qualifying hit" },
                ),
              ],
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    counterplayProfile: {
      telegraphs: ["Its armored plates stop at the edge of a pale, pulsing abdomen visible during every leap."],
      positioningAnswers: ["Hold attacks for the landing space or force the monster to change surfaces within the party's reach."],
      breakConditions: ["The exposure ends at the start of the monster's next turn and the extra damage applies only to the first hit."],
      nonDamageAnswers: ["Shove it Prone, remove its ceiling route, destroy web anchors, or bait its jump."],
    },
    complexityProfile: profile({ decision: 1, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 2 }),
    decision: "REWRITE_AND_SCALE",
    rationale:
      "The original idea was sound but granted only bonus damage and used incomplete structured rules. The rewrite creates a visible transition window, team-wide Advantage, and one bounded CR-scaled damage rider.",
    tacticalRoles: ["skirmisher", "lurker", "boss"],
  }),

  "eyes-weak-spot": graftBase({
    title: "Eye Cluster",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    summary:
      "A ranged attacker can sacrifice damage to strike the crowded eye cluster and temporarily break the spider's spatial control.",
    mechanics:
      "When a creature hits the monster with a ranged weapon attack, it can forgo all damage from that attack to strike the eye cluster. The monster then has the Blinded condition until the end of its next turn. After this blindness ends, the monster is immune to Eye Cluster until the start of its following turn.",
    counterplay:
      "Choose between damage and control; the shot requires no custom penalty but cannot keep the monster permanently blinded.",
    tags: ["eye-cluster", "ranged", "damage-tradeoff", "blinded"],
    identity: {
      fantasy: "A spider whose many crowded eyes provide perfect awareness but create one obvious precision target.",
      tacticalRole: "Ranged damage tradeoff that buys a bounded Blinded window.",
      signature: "A successful ranged hit can deal no damage and blind the spider for one turn.",
      recognitionTags: ["many-eyes", "ranged-precision", "damage-tradeoff", "blind-window"],
    },
    ability: {
      id: "eye-cluster",
      title: "Eye Cluster",
      section: "trait",
      summary: "A ranged attacker can trade damage for a temporary blind.",
      mechanics:
        "When a creature hits the monster with a ranged weapon attack, it can forgo all damage from that attack to strike the eye cluster. The monster then has the Blinded condition until the end of its next turn. After this blindness ends, the monster is immune to Eye Cluster until the start of its following turn.",
      counterplay: "Land a ranged weapon hit, then decide whether the party values damage or the Blinded window more.",
      rules: weaknessRules({
        trigger: "A creature hits the monster with a ranged weapon attack and forgoes all damage from that attack.",
        condition: {
          names: ["blinded"],
          severity: "major",
          direction: "playerApplied",
          duration: "until the end of its next turn",
          special: [],
          sizeLimit: "",
          escape: null,
          repeatSave: null,
        },
        effect:
          "When a creature hits the monster with a ranged weapon attack, it can forgo all damage from that attack to strike the eye cluster. The monster has the Blinded condition until the end of its next turn. After this blindness ends, the monster is immune to Eye Cluster until the start of its following turn.",
        effects: [
          weaknessEffect(
            "eye-cluster-blind",
            "The monster has the Blinded condition until the end of its next turn.",
            { type: "control", duration: "until the end of its next turn" },
          ),
        ],
      }),
      tags: ["ranged-weapon", "forgo-damage", "blinded", "immunity-window"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["Its crowded eye cluster tracks every moving creature independently and remains unarmored."],
      positioningAnswers: ["Maintain a clear ranged line to the front of the monster rather than firing through full cover."],
      breakConditions: ["The attacker must forgo all damage, and the immunity window prevents continuous blindness."],
      nonDamageAnswers: ["Use the blind to disengage, hide, rescue a restrained ally, or reposition instead of treating it as bonus damage."],
    },
    complexityProfile: profile({ decision: 2, branches: 1, tracking: 1 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 1 }),
    decision: "REWRITE_PRECISION_TRADEOFF",
    rationale:
      "The legacy -5 called shot and 30-damage permanent injury were unsupported and scaled poorly. The rewrite uses a normal ranged hit, an explicit damage sacrifice, a one-turn Blinded condition, and an immunity cadence.",
    tacticalRoles: ["controller", "skirmisher", "boss"],
  }),

  "brood-tell": graftBase({
    title: "Brood Sac",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -1,
    complexity: 2,
    stats: { fairness: 3 },
    summary:
      "A visible sac of moving young becomes a destroyable secondary target whose loss disrupts the parent without spawning additional creatures.",
    mechanics:
      "The monster carries a visible Brood Sac. The sac has AC 12, Hit Points equal to 5 + twice the monster's Proficiency Bonus, and immunity to Poison and Psychic damage. A creature can target the sac as though it were an object carried by the monster. When the sac is destroyed, the monster can't take Reactions and has Disadvantage on attack rolls until the end of its next turn.",
    counterplay:
      "The sac moves before the monster commits to an attack; target it directly to create a brief opening instead of attacking the parent.",
    tags: ["brood-sac", "destroyable-object", "secondary-target", "disruption"],
    identity: {
      fantasy: "A predator carrying a translucent mass of young that flinch before every violent movement.",
      tacticalRole: "Destroyable weak object that exchanges party damage for a predictable debuff window.",
      signature: "Destroying the visible brood sac removes Reactions and imposes Disadvantage for one turn.",
      recognitionTags: ["moving-sac", "visible-brood", "secondary-target", "parent-panic"],
    },
    ability: {
      id: "brood-sac",
      title: "Brood Sac",
      section: "trait",
      summary: "The carried brood is a visible and destroyable secondary target.",
      mechanics:
        "The monster carries a visible Brood Sac. The sac has AC 12, Hit Points equal to 5 + twice the monster's Proficiency Bonus, and immunity to Poison and Psychic damage. A creature can target the sac as though it were an object carried by the monster. When the sac is destroyed, the monster can't take Reactions and has Disadvantage on attack rolls until the end of its next turn.",
      counterplay: "Attack the sac rather than the monster to buy a one-turn disruption window.",
      rules: weaknessRules({
        trigger: "The monster's visible Brood Sac is destroyed.",
        effect:
          "The monster carries a visible Brood Sac. The sac has AC 12, Hit Points equal to 5 + twice the monster's Proficiency Bonus, and immunity to Poison and Psychic damage. A creature can target the sac as though it were an object carried by the monster. When the sac is destroyed, the monster can't take Reactions and has Disadvantage on attack rolls until the end of its next turn.",
        effects: [
          weaknessEffect(
            "brood-sac-disruption",
            "When the sac is destroyed, the monster can't take Reactions and has Disadvantage on attack rolls until the end of its next turn.",
            { type: "control", duration: "until the end of its next turn" },
          ),
        ],
      }),
      tags: ["object-ac", "object-hp", "reaction-lock", "disadvantage"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["The translucent sac visibly ripples toward the monster's intended target before the parent moves."],
      positioningAnswers: ["Move to a line from which the sac is visible rather than protected by the monster's body or terrain."],
      breakConditions: ["The Brood Sac is a separate finite object; destroying it spends attacks that would otherwise damage the monster."],
      nonDamageAnswers: ["Use object damage, environmental hazards, precise ranged attacks, or forced positioning to expose the sac."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 0 }),
    decision: "REPLACE_WITH_DESTROYABLE_WEAKNESS",
    rationale:
      "Brood Tell only warned players about an attack and did not create an exploit. Brood Sac converts the same visual idea into a self-contained secondary target without duplicating Egg Carrier or spawning creatures.",
    tacticalRoles: ["controller", "support", "boss"],
  }),

  "fire-softens-it": graftBase({
    title: "Softened Wax",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    summary:
      "Fire softens the preserved face into a brief vulnerability window in which attacks can tear through wax and interrupt its identity tricks.",
    mechanics:
      "After the monster takes Fire damage, the wax remains softened until the start of its next turn. Attack rolls against it have Advantage during that time. The first hit during the window tears the mask, and the monster can't take Reactions until the end of its next turn.",
    counterplay:
      "Apply Fire damage first, then follow with a weapon attack before the wax hardens again.",
    tags: ["softened-wax", "fire", "advantage", "mask-tear"],
    identity: {
      fantasy: "A false face that becomes glossy, translucent, and easy to tear when heated.",
      tacticalRole: "Two-step damage-type combo that opens Advantage and suppresses identity-based escape.",
      signature: "Fire softens the wax; the next hit tears the mask and locks out Reactions.",
      recognitionTags: ["melting-mask", "fingerprints", "wax-seams", "two-step-combo"],
    },
    ability: {
      id: "softened-wax",
      title: "Softened Wax",
      section: "trait",
      summary: "Fire opens the wax to a follow-up attack that tears the mask.",
      mechanics:
        "After the monster takes Fire damage, the wax remains softened until the start of its next turn. Attack rolls against it have Advantage during that time. The first hit during the window tears the mask, and the monster can't take Reactions until the end of its next turn.",
      counterplay: "Sequence Fire damage before the follow-up hit and use the suppression window to prevent escape or retaliation.",
      rules: weaknessRules({
        trigger: "The monster takes Fire damage.",
        effect:
          "After the monster takes Fire damage, the wax remains softened until the start of the monster's next turn. Attack rolls against it have Advantage during that time. The first hit during the window tears the mask, and the monster can't take Reactions until the end of its next turn.",
        effects: [
          weaknessEffect(
            "softened-wax-advantage",
            "Attack rolls against it have Advantage during that time.",
            { type: "advantage", subject: "triggeringCreature", duration: "until the start of the monster's next turn", appliesTo: "attack rolls against the monster" },
          ),
          weaknessEffect(
            "softened-wax-mask-tear",
            "The first hit during the window tears the mask, and the monster can't take Reactions until the end of its next turn.",
            { type: "control", duration: "until the end of its next turn" },
          ),
        ],
      }),
      tags: ["fire", "advantage", "reaction-lock", "mask-tear"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["Heat reveals fingerprints, seams, and the borrowed face suspended beneath the glossy wax."],
      positioningAnswers: ["Keep an ally ready to attack immediately after the Fire damage lands."],
      breakConditions: ["The Advantage window ends at the start of the monster's next turn, and only the first hit tears the mask."],
      nonDamageAnswers: ["Use an environmental flame, heated object, or low-damage fire effect to create the opening efficiently."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 2 }),
    decision: "REWRITE_COMBO_WINDOW",
    rationale:
      "The legacy version granted Advantage to only one attack and did not deliver the stronger dedicated fire exploit reserved by Waxen Flesh. The rewrite creates a clear two-step window and a bounded retaliation lock without changing the Waxen Flesh resistance package.",
    tacticalRoles: ["lurker", "controller", "boss"],
  }),
};

export const MONSTER_WEAKNESS_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(WEAKNESS_GRAFTS),
);

export const MONSTER_WEAKNESS_GRAFT_SCALED_IDS = Object.freeze([
  "mechanical-stress",
  "dangerous-hunger",
  "underbelly-weak-spot",
]);

export function getMonsterWeaknessGraftEditorialOverride(graftId = "") {
  return WEAKNESS_GRAFTS[String(graftId || "").trim()] || null;
}
