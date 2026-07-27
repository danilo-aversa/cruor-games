export const MONSTER_BODY_GRAFT_EDITORIAL_VERSION =
  "monster-body-graft-editorial-v1.1-simple-names";

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

function disabledStructure() {
  return { enabled: false };
}

function passiveRules({
  trigger = null,
  resolution = { type: "none" },
  targeting = { type: "self", targets: "the creature" },
  damage = noDamage(),
  condition = noCondition(),
  text = {},
  counterplay = {},
  defense = null,
  summon = null,
  procedure = null,
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
    damage,
    condition,
    counterplay: {
      telegraph: true,
      breakCondition: false,
      positioningAnswer: true,
      nonDamageAnswer: true,
      ...counterplay,
    },
    text,
    multiattack: disabledStructure(),
    spellcasting: disabledStructure(),
    defense: defense || disabledStructure(),
    summon: summon || disabledStructure(),
    procedure: procedure || disabledStructure(),
    references: [],
    ongoing: disabledStructure(),
    effects,
  };
}

function bonusActionRules({ text, procedure, counterplay = {} }) {
  return {
    schemaVersion: RULES_VERSION,
    section: "bonusAction",
    actionEconomy: "bonusAction",
    usage: { type: "atWill" },
    trigger: null,
    resolution: { type: "automatic" },
    secondaryResolution: null,
    targeting: { type: "self", targets: "the creature" },
    areaEffect: disabledStructure(),
    damage: noDamage(),
    condition: noCondition(),
    counterplay: {
      telegraph: true,
      breakCondition: true,
      positioningAnswer: true,
      nonDamageAnswer: true,
      ...counterplay,
    },
    text: { effect: text },
    multiattack: disabledStructure(),
    spellcasting: disabledStructure(),
    defense: disabledStructure(),
    summon: disabledStructure(),
    procedure: {
      enabled: true,
      type: "custom",
      prerequisite: procedure?.prerequisite || "",
      text,
      ...procedure,
    },
    references: [],
    ongoing: disabledStructure(),
    effects: [],
  };
}

function noRoutine(reason) {
  return {
    mode: "none",
    defaultPlan: "",
    targetSelection: "",
    defaultSequence: [],
    opener: [],
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives: [],
    nonMultiattackReason: reason,
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

function procedureRoutine(defaultPlan, targetSelection, sequence = []) {
  return {
    mode: "procedure",
    defaultPlan,
    targetSelection,
    defaultSequence: sequence,
    opener: [],
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives: [],
    nonMultiattackReason:
      "This Body Graft defines the monster's chassis and phase logic rather than its attack routine.",
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

function editorial(decision, rationale) {
  return {
    status: "reviewed",
    phase: "phase6r-body-editorial-review",
    version: MONSTER_BODY_GRAFT_EDITORIAL_VERSION,
    decision,
    rationale,
    reviewedAt: "2026-07-26",
  };
}

const BODY_GRAFTS = {
  "swollen-corpse": {
    title: "Swollen Corpse",
    cost: 3,
    complexity: 1,
    stats: { hp: 10, control: 1, fairness: 1 },
    summary:
      "Grave gas stretches the corpse into a visible pressure vessel that vents when its outer tissues finally split.",
    mechanics:
      "The first time the creature becomes bloodied, it vents grave gas around itself. Each other creature in the affected area makes a Constitution saving throw. On a failure, the target has the Poisoned condition until the end of its next turn.",
    counterplay:
      "The body becomes glossy, taut, and audibly pressurized before it is bloodied; spread out or force it away before breaking the skin.",
    tags: ["bloated_body", "pressure_vessel", "bloodied_phase", "visible_telegraph"],
    identity: {
      fantasy:
        "A gas-swollen corpse whose body becomes a timed positional hazard as it approaches half health.",
      tacticalRole:
        "Bloodied-phase proximity hazard that makes the party choose where the creature ruptures.",
      signature:
        "The first bloodied threshold releases a telegraphed poisonous pressure wave.",
      recognitionTags: [
        "pressure-vessel",
        "bloated-corpse",
        "bloodied-burst",
        "poison-zone",
      ],
    },
    abilities: [
      {
        id: "pressure-vent",
        title: "Pressure Vent",
        section: "trait",
        summary:
          "The corpse vents grave gas the first time its pressurized body is bloodied.",
        mechanics:
          "The first time the creature becomes bloodied, each other creature within 5 feet of it makes a Constitution saving throw. On a failure, the target has the Poisoned condition until the end of its next turn.",
        counterplay:
          "Keep distance from the visibly swollen body or move it away before dealing the bloodied hit.",
        rules: passiveRules({
          trigger: "The first time the creature becomes bloodied.",
          resolution: {
            type: "savingThrow",
            ability: "constitution",
            dc: "monster",
          },
          targeting: {
            type: "area",
            shape: "radius",
            size: 5,
            unit: "ft",
            targets: "other creatures",
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
              "The target has the Poisoned condition until the end of its next turn.",
            success: "No effect.",
          },
          counterplay: {
            telegraph: true,
            positioningAnswer: true,
            nonDamageAnswer: true,
          },
        }),
        tags: ["body-phase", "poison", "bloodied-trigger", "area-control"],
        authored: true,
      },
    ],
    routine: noRoutine(
      "Pressure Vent is a once-per-encounter bloodied threshold, not a turn option.",
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-4-tight-corpse",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["pressure-vent"],
          defaultSequence: [],
          abilityPatches: {
            "pressure-vent": {
              mechanics:
                "The first time the creature becomes bloodied, each other creature within 5 feet of it makes a Constitution saving throw. On a failure, the target has the Poisoned condition until the end of its next turn.",
              rules: {
                targeting: { size: 5 },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-5-12-swollen-vessel",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["pressure-vent"],
          defaultSequence: [],
          abilityPatches: {
            "pressure-vent": {
              mechanics:
                "The first time the creature becomes bloodied, each other creature within 10 feet of it makes a Constitution saving throw. On a failure, the target has the Poisoned condition until the end of its next turn.",
              rules: {
                targeting: { size: 10 },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-13-30-pressure-carcass",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["pressure-vent"],
          defaultSequence: [],
          abilityPatches: {
            "pressure-vent": {
              mechanics:
                "The first time the creature becomes bloodied, each other creature within 15 feet of it makes a Constitution saving throw. On a failure, the target has the Poisoned condition and cannot take reactions until the end of its next turn.",
              rules: {
                targeting: { size: 15 },
                text: {
                  failure:
                    "The target has the Poisoned condition and cannot take reactions until the end of its next turn.",
                  success: "No effect.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 1,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "The corpse becomes taut, glossy, and audibly pressurized before it is bloodied.",
      ],
      positioningAnswers: [
        "Spread out or force the creature away before dealing the hit that bloodies it.",
      ],
      breakConditions: [
        "The vent happens only once, when the creature first crosses the bloodied threshold.",
      ],
      nonDamageAnswers: [
        "Forced movement and restraint can determine where the pressure wave is released.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 2,
      damageSpike: 0,
      repeatability: 0,
    },
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "The original poison pulse was usable but too small and generic. It is now a clearly telegraphed bloodied-phase positioning event with authored CR scaling.",
    ),
  },

  "fresh-bloat-hide": {
    title: "Bloat Hide",
    cost: 4,
    complexity: 1,
    stats: { ac: 1, hp: 10, fairness: 2 },
    summary:
      "A newly bloated shell protects the corpse until accumulated damage tears it open and releases a faster second phase.",
    mechanics:
      "While the creature has more than half its hit points, it gains a +2 bonus to Armor Class. When it first becomes bloodied, this bonus ends and its walking speed increases by 10 feet until the end of the encounter.",
    counterplay:
      "The tight outer layer visibly tears as it approaches half health; restrain it or block escape routes before breaking the shell.",
    tags: ["bloated_body", "defensive_body", "bloodied_phase", "speed_shift"],
    identity: {
      fantasy:
        "A taut cadaver that begins as a sealed defensive shell and becomes a loose, faster predator after the hide tears.",
      tacticalRole:
        "Two-phase chassis that trades early defense for late mobility.",
      signature:
        "Breaking the bloat hide removes its Armor Class bonus but accelerates the corpse.",
      recognitionTags: [
        "taut-hide",
        "bloodied-phase",
        "defense-to-speed",
        "bloated-corpse",
      ],
    },
    rules: passiveRules({
      trigger: "The first time the creature becomes bloodied.",
      text: {
        effect:
          "While the monster has more than half its Hit Points, it gains a +2 bonus to Armor Class. When it first becomes Bloodied, this bonus ends and its walking speed increases by 10 feet until the end of the encounter.",
      },
    }),
    routine: noRoutine(
      "Taut Bloat Hide is an automatic bloodied phase transition.",
    ),
    identityOverride: true,
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 1,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "Cracks spread through the tight hide as the creature approaches half health.",
      ],
      positioningAnswers: [
        "Block lanes or restrain the creature before the faster second phase begins.",
      ],
      breakConditions: [
        "The defensive bonus ends permanently when the creature first becomes bloodied.",
      ],
      nonDamageAnswers: [
        "Readied restraint, difficult terrain, and closed routes limit the speed gained after the shell tears.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 0,
      damageSpike: 0,
      repeatability: 0,
    },
    editorial: editorial(
      "REWRITE",
      "The original phase switch was strong but imprecise. The revised version makes the defensive and mobile phases explicit and gives players a preparation window.",
    ),
  },

  "volatile-immobile-mass": {
    title: "Corpse Mass",
    cost: 5,
    complexity: 1,
    stats: { hp: 24, ac: -1, control: 2, fairness: 1 },
    summary:
      "The corpse has collapsed into a rooted mass that controls nearby space through reach rather than movement.",
    mechanics:
      "The creature's speed is 0, it is immune to the Prone condition, and the reach of its melee attacks increases by 5 feet. Forced movement moves it only half the normal distance.",
    counterplay:
      "The mass cannot pursue targets; use range, cover, and forced movement to choose which part of the battlefield it can threaten.",
    tags: ["immobile_mass", "rooted_body", "reach_chassis", "zone_controller"],
    identity: {
      fantasy:
        "A collapsed, rooted carcass that behaves like a living emplacement rather than a mobile creature.",
      tacticalRole:
        "Immobile zone-control chassis with extended reach and resistance to displacement.",
      signature:
        "It cannot move or fall prone, but its body attacks reach beyond the space it occupies.",
      recognitionTags: [
        "rooted-mass",
        "immobile-chassis",
        "extended-reach",
        "forced-movement-target",
      ],
    },
    rules: passiveRules({
      resolution: { type: "none", reach: "+5 ft." },
      text: {
        effect:
          "The monster's speed is 0, it is immune to the Prone condition, and the reach of its melee attacks increases by 5 feet. Forced movement moves it only half the normal distance.",
      },
    }),
    routine: noRoutine(
      "Rooted Corpse Mass changes the geometry of every melee ability but adds no separate turn option.",
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 0,
      tracking: 0,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "The creature is visibly fused to the ground and cannot pursue creatures outside its reach.",
      ],
      positioningAnswers: [
        "Fight from range, use cover, or attack from directions its extended reach cannot efficiently protect.",
      ],
      breakConditions: [
        "Its zone changes only when the body is displaced; it has no voluntary movement.",
      ],
      nonDamageAnswers: [
        "Forced movement still works at half distance and can rotate the encounter around a different threat zone.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 2,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_REWRITE",
      "The old name promised an explosion supplied by another slot. The new chassis is self-contained: immobile, hard to displace, and defined by reach-based zone control.",
    ),
  },

  "skin-slippage": {
    title: "Shedding Skin",
    cost: 2,
    complexity: 1,
    stats: { mobility: 1, fairness: 1 },
    summary:
      "Loose sheets of skin tear free whenever the corpse is pinned, allowing it to leave restraints behind.",
    mechanics:
      "The creature has advantage on ability checks and saving throws made to end the Grappled or Restrained condition. Immediately after it ends either condition, it can move up to 10 feet without provoking opportunity attacks.",
    counterplay:
      "The loose skin is obvious; use distance, terrain, or restraints that do not depend on gripping its outer tissues.",
    tags: ["sloughing_skin", "escape_body", "grapple_counter", "short_reposition"],
    identity: {
      fantasy:
        "A corpse that escapes confinement by leaving its own outer layers in the captor's hands.",
      tacticalRole:
        "Anti-restraint chassis that turns a successful escape into a short reposition.",
      signature:
        "When a grapple or restraint ends, the creature leaves skin behind and slips ten feet away.",
      recognitionTags: [
        "sloughing-escape",
        "loose-skin",
        "anti-grapple",
        "escape-movement",
      ],
    },
    rules: passiveRules({
      trigger:
        "Immediately after the creature ends the Grappled or Restrained condition on itself.",
      text: {
        effect:
          "The monster has Advantage on ability checks and saving throws made to end the Grappled or Restrained condition. Immediately after it ends either condition, it can move up to 10 feet without provoking Opportunity Attacks.",
      },
    }),
    routine: noRoutine(
      "Sloughing Escape is a conditional chassis response to restraint.",
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 0,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "Its skin already hangs loose enough that a captor can see it will tear away.",
      ],
      positioningAnswers: [
        "Do not rely on a single adjacent grappler to hold it in place.",
      ],
      breakConditions: [
        "The free movement occurs only after the creature actually ends Grappled or Restrained.",
      ],
      nonDamageAnswers: [
        "Walls, pits, zones, magical barriers, and restraints anchored to the environment still limit its escape route.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 0,
      damageSpike: 0,
      repeatability: 1,
    },
    editorial: editorial(
      "REWRITE",
      "The original secondary saving throw added friction without creating a useful decision. The rewrite makes the body fantasy directly produce an escape-and-reposition rule.",
    ),
  },

  "ethereal-sight": {
    title: "Anchored Spirit",
    cost: 4,
    complexity: 2,
    stats: { ac: 1, control: 1, fairness: 2 },
    summary:
      "The spirit sees across the grave boundary and can fold its half-real body into an abandoned corpse for protection.",
    mechanics:
      "The creature sees 60 feet into the Ethereal Plane. As a bonus action, it can enter an unattended Medium or larger corpse within 5 feet. While anchored, its speed is 0, it has half cover, and it cannot be moved against its will. It can leave as a bonus action and is expelled if the corpse is destroyed, burned, or moved more than 10 feet.",
    counterplay:
      "The occupied corpse visibly moves and breathes; drag it, burn it, destroy it, or deny suitable remains before the spirit anchors.",
    tags: ["spirit_body", "corpse_anchor", "ethereal_sight", "interactive_object"],
    identity: {
      fantasy:
        "A hungry spirit that borrows the dead as temporary flesh while keeping its senses fixed on both worlds.",
      tacticalRole:
        "Corpse-dependent defensive posture with a destructible environmental anchor.",
      signature:
        "It enters a corpse to gain half cover and immovability until the body is disturbed.",
      recognitionTags: [
        "corpse-anchor",
        "half-manifested-spirit",
        "ethereal-sight",
        "destructible-shelter",
      ],
    },
    abilities: [
      {
        id: "grave-sight",
        title: "Grave Sight",
        section: "trait",
        summary:
          "The spirit observes the Material and Ethereal planes at the same time.",
        mechanics:
          "The creature can see 60 feet into the Ethereal Plane while it is on the Material Plane. It also knows whether an unattended corpse it can see is inhabited, animated, or spiritually anchored.",
        counterplay:
          "Walls, cover, and ordinary line of sight still block what the spirit can perceive on its current plane.",
        rules: passiveRules({
          text: {
            effect:
              "The monster can see 60 feet into the Ethereal Plane while it is on the Material Plane. It also knows whether an unattended corpse it can see is inhabited, animated, or spiritually anchored.",
          },
        }),
        tags: ["sense", "ethereal-plane", "corpse-reading"],
        authored: true,
      },
      {
        id: "corpse-anchor",
        title: "Corpse Anchor",
        section: "bonusAction",
        summary:
          "The spirit folds itself into an unattended corpse and uses the remains as temporary armor.",
        mechanics:
          "As a bonus action, the creature enters an unattended Medium or larger corpse within 5 feet. While anchored, its speed is 0, it has half cover, and it cannot be moved against its will. It can leave the corpse as a bonus action. It is expelled into an adjacent space if the corpse is destroyed, burned, or moved more than 10 feet at once.",
        counterplay:
          "Move, burn, or destroy the visibly inhabited corpse, or deny the spirit a suitable body before it anchors.",
        rules: bonusActionRules({
          text:
            "The monster enters an unattended Medium or larger corpse within 5 feet. While anchored, its speed is 0, it has Half Cover, and it cannot be moved against its will. It can leave the corpse as a Bonus Action. It is expelled into an adjacent space if the corpse is destroyed, burned, or moved more than 10 feet at once.",
          procedure: {
            prerequisite:
              "An unattended Medium or larger corpse is within 5 feet.",
          },
        }),
        tags: ["corpse", "defensive-posture", "half-cover", "object-counterplay"],
        authored: true,
      },
    ],
    routine: procedureRoutine(
      "Use Corpse Anchor when a visible body can create a defensible feeding or ambush position; leave it when the corpse becomes a liability.",
      "Prefer a corpse near the intended victim but exposed enough that players can interact with it.",
      ["corpse-anchor"],
    ),
    progression: null,
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "An anchored corpse visibly moves, tightens, and exhales around the spirit inside it.",
      ],
      positioningAnswers: [
        "Deny access to unattended corpses or fight where no suitable anchor is available.",
      ],
      breakConditions: [
        "Destroying, burning, or sharply moving the corpse expels the spirit.",
      ],
      nonDamageAnswers: [
        "Drag, consecrate, cover, or relocate corpses before the spirit can use them.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 1,
    },
    editorial: editorial(
      "RENAME_AND_EXPAND_INTO_BUNDLE",
      "Ethereal Sight alone was a minor sense, not a publishable Body Graft. It now remains as one ability inside a corpse-dependent defensive chassis with explicit object counterplay.",
    ),
  },

  "egg-carrier": {
    title: "Egg Carrier",
    cost: 6,
    complexity: 3,
    stats: { hp: 10, control: 3, mobility: -1, fairness: 2 },
    summary:
      "A visible clutch of eggs covers the monster's abdomen, burdening its movement while threatening to hatch into reinforcements.",
    mechanics:
      "The creature begins combat carrying a visible clutch of fragile eggs. While any eggs remain, its speed is reduced by 10 feet. At the start of each of its turns, one or more eggs hatch into spider minions according to the creature's CR. Each egg can be targeted and destroyed, but removing the final egg ends the speed penalty.",
    counterplay:
      "The eggs are distinct objects on the body: destroying them prevents reinforcements but also frees the carrier to move faster.",
    tags: ["egg_carrier", "brood", "destroyable_objects", "risk_tradeoff"],
    identity: {
      fantasy:
        "A brood carrier whose body is both a visible resource pool and a burden that changes as the clutch is destroyed.",
      tacticalRole:
        "Escalating summon chassis with destructible counters and a mobility tradeoff.",
      signature:
        "Players can destroy the eggs to stop hatching, but the last destroyed egg releases the carrier from its burden.",
      recognitionTags: [
        "living-clutch",
        "visible-eggs",
        "brood-escalation",
        "mobility-tradeoff",
      ],
    },
    abilities: [
      {
        id: "exposed-clutch",
        title: "Exposed Clutch",
        section: "trait",
        summary:
          "The carrier's eggs are visible, targetable objects that weigh down its body.",
        mechanics:
          "The creature begins combat carrying three visible eggs. Each egg is a Tiny object with AC 10, 1 hit point, immunity to poison and psychic damage, and vulnerability to fire damage. While any eggs remain, the creature's speed is reduced by 10 feet. The final egg's destruction ends this penalty.",
        counterplay:
          "Attacks and fire can remove eggs before they hatch, at the cost of making the carrier faster once the clutch is gone.",
        rules: passiveRules({
          text: {
            effect:
              "The monster begins combat carrying three visible eggs. Each egg is a Tiny object with AC 10, 1 Hit Point, immunity to Poison and Psychic damage, and vulnerability to Fire damage. While any eggs remain, the monster's speed is reduced by 10 feet. The final egg's destruction ends this penalty.",
          },
        }),
        tags: ["objects", "eggs", "speed-penalty", "fire-counterplay"],
        authored: true,
      },
      {
        id: "hatching-cycle",
        title: "Hatching Cycle",
        section: "trait",
        summary:
          "At the start of the carrier's turn, surviving eggs split open into spider minions.",
        mechanics:
          "At the start of each of the creature's turns, one surviving egg hatches into one spider minion in an adjacent unoccupied space. The minion acts immediately after the creature. A destroyed or burned egg cannot hatch.",
        counterplay:
          "Destroy the visible eggs before the carrier's turn or move into positions where adjacent minions cannot be placed effectively.",
        rules: passiveRules({
          trigger: "At the start of each of the creature's turns.",
          text: {
            effect:
              "One surviving egg hatches into one spider minion in an adjacent unoccupied space. The minion acts immediately after the monster. A destroyed or burned egg cannot hatch.",
          },
          summon: {
            enabled: true,
            type: "spawn",
            creatureName: "spider minion",
            count: "1",
            placement: "an adjacent unoccupied space",
            duration: "until destroyed",
            initiative: "immediatelyAfterSummoner",
            control: "alliedToSummoner",
            trigger: "At the start of each of the monster's turns.",
            text:
              "One surviving egg hatches into one spider minion in an adjacent unoccupied space.",
          },
        }),
        tags: ["summon", "start-of-turn", "brood", "destroyable-source"],
        authored: true,
      },
    ],
    routine: procedureRoutine(
      "Resolve Hatching Cycle at the start of the carrier's turn, then use the carrier normally. Keep Exposed Clutch visible as a shared resource for both sides.",
      "Place hatchlings in adjacent spaces that create pressure without hiding the eggs' counterplay.",
      ["hatching-cycle"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-4-small-clutch",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["exposed-clutch", "hatching-cycle"],
          defaultSequence: ["hatching-cycle"],
          abilityPatches: {
            "exposed-clutch": {
              mechanics:
                "The creature begins combat carrying two visible eggs. Each egg is a Tiny object with AC 10, 1 hit point, immunity to poison and psychic damage, and vulnerability to fire damage. While any eggs remain, the creature's speed is reduced by 10 feet.",
              rules: {
                text: {
                  effect:
                    "The monster begins combat carrying two visible eggs. Each egg is a Tiny object with AC 10, 1 Hit Point, immunity to Poison and Psychic damage, and vulnerability to Fire damage. While any eggs remain, the monster's speed is reduced by 10 feet.",
                },
              },
            },
            "hatching-cycle": {
              mechanics:
                "At the start of each of the creature's turns, roll a d6 if an egg remains. On a 5 or 6, one surviving egg hatches into one spider minion in an adjacent unoccupied space.",
              rules: {
                summon: {
                  count: "1 on a 5–6",
                  text:
                    "Roll a d6. On a 5 or 6, one surviving egg hatches into one spider minion in an adjacent unoccupied space.",
                },
                text: {
                  effect:
                    "Roll a d6. On a 5 or 6, one surviving egg hatches into one spider minion in an adjacent unoccupied space.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-5-12-living-clutch",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["exposed-clutch", "hatching-cycle"],
          defaultSequence: ["hatching-cycle"],
          abilityPatches: {
            "exposed-clutch": {
              mechanics:
                "The creature begins combat carrying four visible eggs. Each egg is a Tiny object with AC 10, 1 hit point, immunity to poison and psychic damage, and vulnerability to fire damage. While any eggs remain, the creature's speed is reduced by 10 feet.",
              rules: {
                text: {
                  effect:
                    "The monster begins combat carrying four visible eggs. Each egg is a Tiny object with AC 10, 1 Hit Point, immunity to Poison and Psychic damage, and vulnerability to Fire damage. While any eggs remain, the monster's speed is reduced by 10 feet.",
                },
              },
            },
            "hatching-cycle": {
              mechanics:
                "At the start of each of the creature's turns, one surviving egg hatches into one spider minion in an adjacent unoccupied space.",
              rules: {
                summon: {
                  count: "1",
                  text:
                    "One surviving egg hatches into one spider minion in an adjacent unoccupied space.",
                },
                text: {
                  effect:
                    "One surviving egg hatches into one spider minion in an adjacent unoccupied space.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-13-30-brood-cascade",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["exposed-clutch", "hatching-cycle"],
          defaultSequence: ["hatching-cycle"],
          abilityPatches: {
            "exposed-clutch": {
              mechanics:
                "The creature begins combat carrying six visible eggs. Each egg is a Tiny object with AC 12, 1 hit point, immunity to poison and psychic damage, and vulnerability to fire damage. While any eggs remain, the creature's speed is reduced by 10 feet.",
              rules: {
                text: {
                  effect:
                    "The monster begins combat carrying six visible eggs. Each egg is a Tiny object with AC 12, 1 Hit Point, immunity to Poison and Psychic damage, and vulnerability to Fire damage. While any eggs remain, the monster's speed is reduced by 10 feet.",
                },
              },
            },
            "hatching-cycle": {
              mechanics:
                "At the start of each of the creature's turns, up to two surviving eggs hatch, each creating one spider minion in an adjacent unoccupied space.",
              rules: {
                summon: {
                  count: "up to 2",
                  text:
                    "Up to two surviving eggs hatch, each creating one spider minion in an adjacent unoccupied space.",
                },
                text: {
                  effect:
                    "Up to two surviving eggs hatch, each creating one spider minion in an adjacent unoccupied space.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 3,
      authoredComplexity: 3,
    },
    counterplayProfile: {
      telegraphs: [
        "Every egg is visibly attached to the abdomen and can be targeted before it hatches.",
      ],
      positioningAnswers: [
        "Control adjacent spaces so hatchlings cannot appear in the most dangerous positions.",
      ],
      breakConditions: [
        "Destroyed or burned eggs are removed from the clutch and cannot hatch.",
      ],
      nonDamageAnswers: [
        "Destroying the final egg stops all future hatching but also removes the carrier's speed penalty.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 3,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "EXPAND_INTO_BUNDLE_AND_SCALE",
      "The previous random table was slow and opaque. The revised clutch is a visible object economy with deterministic turn timing, explicit CR scaling, and a meaningful destroy-eggs-versus-release-speed tradeoff.",
    ),
  },

  "spider-climb": {
    title: "Clinging Body",
    cost: 3,
    complexity: 1,
    stats: { mobility: 1, fairness: 2 },
    summary:
      "Hooked limbs and adhesive pads let the creature treat walls and ceilings as stable fighting surfaces.",
    mechanics:
      "The creature has a climb speed equal to its walking speed and can move across difficult surfaces and ceilings without making an ability check. While touching a wall or ceiling, it is immune to the Prone condition while attached. Forced movement that pulls it away from the surface causes it to fall normally.",
    counterplay:
      "Force it into open ground, break the supporting surface, or use forced movement that detaches it rather than trying to knock it prone in place.",
    tags: ["climbing_limbs", "surface_anchor", "ceiling_posture", "fall_counterplay"],
    identity: {
      fantasy:
        "A body built to cling under its own weight, turning vertical surfaces into stable combat ground.",
      tacticalRole:
        "Vertical chassis that resists prone while attached but remains vulnerable to detachment and falling.",
      signature:
        "It cannot be knocked prone while clinging, but forced detachment makes it fall.",
      recognitionTags: [
        "clinging-anatomy",
        "ceiling-stalker",
        "surface-anchor",
        "forced-fall",
      ],
    },
    rules: passiveRules({
      text: {
        effect:
          "The monster has a climb speed equal to its walking speed and can move across difficult surfaces and ceilings without making an ability check. While touching a wall or ceiling, it is immune to the Prone condition while attached. Forced movement that pulls it away from the surface causes it to fall normally.",
      },
    }),
    routine: noRoutine(
      "Clinging Anatomy changes which surfaces the monster can treat as stable ground.",
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 0,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "The creature's hooked limbs visibly dig into the supporting surface.",
      ],
      positioningAnswers: [
        "Draw it into open ground or stand where it must cross a gap to approach.",
      ],
      breakConditions: [
        "Forced movement that pulls it away from the surface ends the attached posture and causes a fall.",
      ],
      nonDamageAnswers: [
        "Break, grease, collapse, or otherwise alter the surface supporting the creature.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "EXPAND",
      "Plain Spider Climb was a baseline species trait. Clinging Anatomy adds a posture rule and an explicit detachment counter, making it worth selecting as a Body Graft.",
    ),
  },

  "web-walker": {
    title: "Web Sense",
    cost: 3,
    complexity: 1,
    stats: { control: 2, mobility: 1, fairness: 1 },
    summary:
      "Sensory hairs across the carapace turn every connected web strand into an extension of the creature's body.",
    mechanics:
      "The creature ignores movement restrictions caused by webs. While touching a web, it knows the location of every other creature touching the same connected web and cannot be surprised by any of them.",
    counterplay:
      "Cut, burn, or leave the connected web network to remove both its movement advantage and its vibration sense.",
    tags: ["web_walker", "web_sense", "connected_network", "anti_surprise"],
    identity: {
      fantasy:
        "A carapace that reads web vibration as touch, making the whole network part of the monster's sensory body.",
      tacticalRole:
        "Web-network awareness chassis that denies hiding and surprise only while the connection remains intact.",
      signature:
        "Every creature touching the same connected web is located through vibration.",
      recognitionTags: [
        "web-sense",
        "vibration-carapace",
        "connected-web",
        "network-counterplay",
      ],
    },
    rules: passiveRules({
      text: {
        effect:
          "The monster ignores movement restrictions caused by webs. While touching a web, it knows the location of every other creature touching the same connected web and cannot be surprised by any of them.",
      },
    }),
    routine: noRoutine(
      "Web-Sense Carapace is a conditional sensory and terrain chassis.",
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 1,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "The creature constantly touches and tests nearby web strands with its limbs and carapace.",
      ],
      positioningAnswers: [
        "Step off the connected web or approach from a surface that does not share the network.",
      ],
      breakConditions: [
        "Cutting or burning the connecting strands breaks the sensory link.",
      ],
      nonDamageAnswers: [
        "Create false vibrations, sever routes, or move through spaces without web contact.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 2,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_EXPAND",
      "Web Walker was mechanically correct but too generic. It now defines a connected sensory network with an explicit break condition and a stronger identity than simple terrain immunity.",
    ),
  },

  "barbed-chitin": {
    title: "Barbed Chitin",
    cost: 3,
    complexity: 1,
    stats: { dpr: 1, control: 1, fairness: 1 },
    summary:
      "Backward-facing hooks make close restraint painful for both captor and prey.",
    mechanics:
      "The first time on a turn that another creature grapples this creature, or starts its turn grappling it or grappled by it, that creature takes minor piercing damage.",
    counterplay:
      "Use weapons, reach, forced movement, or restraint that does not require remaining in bodily contact.",
    tags: ["barbed_chitin", "contact_punish", "grapple_tax", "physical_chitin"],
    identity: {
      fantasy:
        "A hooked carapace that turns every sustained grapple into a slow tearing injury.",
      tacticalRole:
        "Contact-punishing chassis that taxes grapple control without invalidating it.",
      signature:
        "A creature in sustained bodily contact takes piercing damage once each turn.",
      recognitionTags: [
        "barbed-chitin",
        "contact-punish",
        "grapple-tax",
        "hooked-carapace",
      ],
    },
    rules: passiveRules({
      trigger:
        "The first time on a turn that another creature grapples the monster, or starts its turn grappling it or grappled by it.",
      targeting: {
        type: "single",
        targets: "the triggering creature",
      },
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "reactionPunish",
        types: ["piercing"],
        budgetShare: 0.25,
        expectedTargets: 1,
        roundWeight: [0.35, 0.35, 0.35],
        parts: [],
      },
      text: {
        effect:
          "The triggering creature takes {damage} Piercing damage. A creature can take this damage only once per turn.",
      },
      counterplay: {
        telegraph: true,
        positioningAnswer: true,
        nonDamageAnswer: true,
      },
    }),
    routine: noRoutine(
      "Barbed Chitin is a once-per-turn contact trigger, not an attack choice.",
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 0,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "The backward-facing hooks are obvious before a creature commits to bodily contact.",
      ],
      positioningAnswers: [
        "Use reach, ranged control, or forced movement instead of remaining adjacent in a grapple.",
      ],
      breakConditions: [
        "The damage is limited to once per turn for each affected creature.",
      ],
      nonDamageAnswers: [
        "Nets, environmental restraints, and effects that do not require bodily contact avoid the hooks.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 1,
      repeatability: 1,
    },
    editorial: editorial(
      "REWRITE",
      "The original timing was ambiguous. The new once-per-turn trigger preserves grapple counterplay while preventing repeated damage exploits.",
    ),
  },

  "umbral-skin": {
    title: "Shadow Skin",
    cost: 5,
    complexity: 2,
    stats: { control: 2, mobility: 1, fairness: 2 },
    summary:
      "The creature's outline absorbs darkness in increasingly complete layers as its threat level rises.",
    mechanics:
      "Its concealment in darkness scales with CR, from supernatural stealth to temporary invisibility. Bright light and fire or radiant damage always interrupt the effect.",
    counterplay:
      "Carry light, create bright areas, or use fire and radiant damage to suppress the skin's concealment.",
    tags: ["shadow_body", "darkness", "light_counterplay", "cr_scaled_concealment"],
    identity: {
      fantasy:
        "A body whose surface consumes shadow, becoming harder to distinguish as the monster grows stronger.",
      tacticalRole:
        "Darkness-dependent concealment chassis with direct light and damage-type counters.",
      signature:
        "Its body disappears only while darkness remains unbroken by light, fire, or radiance.",
      recognitionTags: [
        "umbral-skin",
        "darkness-concealment",
        "light-counterplay",
        "shadow-body",
      ],
    },
    abilities: [
      {
        id: "umbral-skin",
        title: "Umbral Skin",
        section: "trait",
        summary:
          "Darkness clings to the creature's body and conceals it according to its CR.",
        mechanics:
          "In dim light or darkness, the creature has advantage on Dexterity (Stealth) checks. Bright light or fire or radiant damage suppresses this benefit until the end of its next turn.",
        counterplay:
          "Bright light and fire or radiant damage suppress the concealment until the end of the creature's next turn.",
        rules: passiveRules({
          text: {
            effect:
              "In Dim Light or Darkness, the monster has Advantage on Dexterity (Stealth) checks. Bright Light or Fire or Radiant damage suppresses this benefit until the end of its next turn.",
          },
        }),
        tags: ["darkness", "stealth", "light-break", "self-concealment"],
        authored: true,
      },
    ],
    routine: noRoutine(
      "Umbral Skin is an environmental concealment state rather than a turn option.",
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-4-shadowed-hide",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["umbral-skin"],
          defaultSequence: [],
          abilityPatches: {
            "umbral-skin": {
              mechanics:
                "In dim light or darkness, the creature has advantage on Dexterity (Stealth) checks. Bright light or fire or radiant damage suppresses this benefit until the end of its next turn.",
              rules: {
                condition: null,
                text: {
                  effect:
                    "In Dim Light or Darkness, the monster has Advantage on Dexterity (Stealth) checks. Bright Light or Fire or Radiant damage suppresses this benefit until the end of its next turn.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-5-12-motionless-shadow",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["umbral-skin"],
          defaultSequence: [],
          abilityPatches: {
            "umbral-skin": {
              mechanics:
                "If the creature ends its turn in darkness after moving no more than half its speed, it has the Invisible condition until it moves, makes an attack roll, enters bright light, or takes fire or radiant damage.",
              rules: {
                condition: {
                  names: ["invisible"],
                  severity: "moderate",
                  direction: "self",
                  duration:
                    "until it moves, attacks, enters bright light, or takes fire or radiant damage",
                  special: [],
                  sizeLimit: "",
                  escape: null,
                  repeatSave: null,
                },
                text: {
                  effect:
                    "If the monster ends its turn in Darkness after moving no more than half its speed, it has the Invisible condition until it moves, makes an attack roll, enters Bright Light, or takes Fire or Radiant damage.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-13-30-living-absence",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["umbral-skin"],
          defaultSequence: [],
          abilityPatches: {
            "umbral-skin": {
              mechanics:
                "While in darkness, the creature has the Invisible condition. Immediately after it makes an attack roll, it becomes visible until the end of the current turn. Bright light or fire or radiant damage suppresses this trait until the end of its next turn.",
              rules: {
                condition: {
                  names: ["invisible"],
                  severity: "major",
                  direction: "self",
                  duration: "while in darkness, except after attacking",
                  special: [],
                  sizeLimit: "",
                  escape: null,
                  repeatSave: null,
                },
                text: {
                  effect:
                    "While in Darkness, the monster has the Invisible condition. Immediately after it makes an attack roll, it becomes visible until the end of the current turn. Bright Light or Fire or Radiant damage suppresses this trait until the end of its next turn.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 0,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The creature's outline visibly thins and absorbs the darkness around it.",
      ],
      positioningAnswers: [
        "Fight in bright areas or prevent the creature from ending its turn in darkness.",
      ],
      breakConditions: [
        "Bright light and fire or radiant damage interrupt the concealment at every CR.",
      ],
      nonDamageAnswers: [
        "Torches, magical light, reflective surfaces, and control of shadowed routes deny the required environment.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 1,
      controlSpike: 2,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "Permanent invisibility in darkness was too binary. The new progression begins with stealth, advances to conditional invisibility, and reserves sustained combat invisibility for high CR while preserving clear counters.",
    ),
  },

  "malformed-broodling": {
    title: "Broodling",
    cost: 1,
    complexity: 1,
    stats: { hp: -8, control: 1, fairness: 2 },
    summary:
      "A fragile offspring is built as expendable living food rather than a durable combatant.",
    mechanics:
      "The creature has 1 hit point. An allied spider within 5 feet can use a bonus action to devour it, destroying it and gaining temporary hit points equal to twice the allied spider's proficiency bonus. A creature can move the broodling with a successful grapple or forced-movement effect before it is consumed.",
    counterplay:
      "Destroy, move, or isolate the broodling before an allied spider can spend a bonus action to consume it.",
    tags: ["brood_minion", "one_hit_point", "living_resource", "devourable_ally"],
    identity: {
      fantasy:
        "A wet, malformed offspring whose main battlefield purpose is to become emergency food for a larger spider.",
      tacticalRole:
        "One-hit-point minion chassis that functions as a movable healing resource.",
      signature:
        "An allied spider can devour the broodling for temporary hit points if players fail to remove or reposition it.",
      recognitionTags: [
        "malformed-broodling",
        "living-resource",
        "one-hit-point-minion",
        "devour-healing",
      ],
    },
    rules: passiveRules({
      targeting: {
        type: "area",
        shape: "radius",
        size: 5,
        unit: "ft",
        targets: "allied spiders",
      },
      text: {
        effect:
          "The monster has 1 Hit Point. An allied spider within 5 feet can use a Bonus Action to devour it, destroying it and gaining Temporary Hit Points equal to twice that spider's Proficiency Bonus.",
      },
    }),
    routine: noRoutine(
      "The broodling is a minion chassis and resource for allied spiders, not a separate action routine.",
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 0,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "Larger spiders repeatedly turn toward the broodling when injured.",
      ],
      positioningAnswers: [
        "Push, pull, grapple, or isolate the broodling outside the allied spider's reach.",
      ],
      breakConditions: [
        "Destroying or moving the broodling prevents it from being consumed.",
      ],
      nonDamageAnswers: [
        "Forced movement and battlefield separation deny the healing resource without requiring an attack.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 0,
    },
    editorial: editorial(
      "REWRITE",
      "The original healing amount was swingy and the counterplay was only implicit. It is now a bounded temporary-hit-point resource that players can destroy or reposition.",
    ),
  },

  "waxen-mask-body": {
    title: "Waxen Flesh",
    cost: 4,
    complexity: 1,
    stats: { hp: 10, ac: 1, fairness: 2 },
    summary:
      "Ceremonial wax preserves the body against cold and decay but prevents ordinary healing and softens under heat.",
    mechanics:
      "The creature has resistance to cold and necrotic damage, but it cannot regain hit points. After it takes fire damage, these resistances are suppressed until the start of its next turn.",
    counterplay:
      "Heat visibly softens the wax; use fire before committing cold or necrotic damage, and exploit the creature's inability to heal.",
    tags: ["wax_body", "wax_mask", "preserved_flesh", "fire_suppression"],
    identity: {
      fantasy:
        "A corpse sealed in funerary wax: preserved against cold and rot, but unable to repair itself and vulnerable to heat.",
      tacticalRole:
        "Persistent resistance chassis with a fire-based suppression window and a built-in no-healing cost.",
      signature:
        "Fire temporarily melts away its resistances, while the wax body can never regain hit points.",
      recognitionTags: [
        "waxen-flesh",
        "funeral-preservation",
        "fire-suppression",
        "no-healing",
      ],
    },
    rules: passiveRules({
      text: {
        effect:
          "The monster has Resistance to Cold and Necrotic damage, but it cannot regain Hit Points. After it takes Fire damage, these resistances are suppressed until the start of its next turn.",
      },
    }),
    routine: noRoutine(
      "Waxen Funeral Flesh is a persistent defensive chassis with a fire suppression window.",
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 0,
      conditionalBranches: 1,
      tracking: 1,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "Heat makes the ceremonial wax shine, sag, and expose the darker body beneath it.",
      ],
      positioningAnswers: [
        "Coordinate attacks so fire damage opens the resistance window before cold or necrotic damage is applied.",
      ],
      breakConditions: [
        "Fire damage suppresses the resistances until the start of the creature's next turn.",
      ],
      nonDamageAnswers: [
        "The creature cannot regain hit points, so denying escape and extending the encounter steadily exhausts it.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 0,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "REWRITE",
      "The previous fire vulnerability duplicated the dedicated Weakness slot. The new body supplies durable preservation, a no-healing cost, and a temporary fire suppression window that complements rather than replaces the Weakness Graft.",
    ),
  },
};

export const MONSTER_BODY_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(BODY_GRAFTS),
);

export const MONSTER_BODY_GRAFT_SCALED_IDS = Object.freeze([
  "swollen-corpse",
  "egg-carrier",
  "umbral-skin",
]);

export function getMonsterBodyGraftEditorialOverride(graftId = "") {
  return BODY_GRAFTS[String(graftId || "").trim()] || null;
}
