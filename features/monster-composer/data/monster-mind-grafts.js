export const MONSTER_MIND_GRAFT_EDITORIAL_VERSION =
  "monster-mind-graft-editorial-v1.1-simple-names";

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

function baseRules({
  section = "trait",
  actionEconomy = "passive",
  usage = { type: "passive" },
  trigger = null,
  resolution = { type: "none" },
  targeting = { type: "self", targets: "the creature" },
  condition = noCondition(),
  text = {},
  counterplay = {},
  defense = null,
  procedure = null,
  effects = [],
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
    areaEffect: disabledStructure(),
    damage: noDamage(),
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
    defense: defense || disabledStructure(),
    summon: disabledStructure(),
    procedure: procedure || disabledStructure(),
    references: [],
    ongoing: disabledStructure(),
    effects,
  };
}

function passiveRules(options = {}) {
  return baseRules(options);
}

function bonusActionRules({ text, targeting, trigger = null, usage, counterplay = {} }) {
  return baseRules({
    section: "bonusAction",
    actionEconomy: "bonusAction",
    usage: usage || { type: "atWill" },
    trigger,
    resolution: { type: "automatic" },
    targeting: targeting || { type: "self", targets: "the creature" },
    text: { effect: text },
    procedure: {
      enabled: true,
      type: "custom",
      prerequisite: trigger || "",
      text,
    },
    counterplay,
  });
}

function reactionRules({ text, trigger, targeting, counterplay = {} }) {
  return baseRules({
    section: "reaction",
    actionEconomy: "reaction",
    usage: { type: "reaction" },
    trigger,
    resolution: { type: "automatic" },
    targeting: targeting || { type: "self", targets: "the creature" },
    text: { effect: text },
    procedure: {
      enabled: true,
      type: "custom",
      prerequisite: trigger,
      text,
    },
    counterplay,
  });
}

function behaviorRoutine(defaultPlan, targetSelection, sequence = [], alternatives = []) {
  return {
    mode: "procedure",
    defaultPlan,
    targetSelection,
    defaultSequence: sequence,
    opener: [],
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives,
    nonMultiattackReason:
      "This Mind Graft defines priorities and decision logic rather than replacing the Attack Pattern routine.",
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
    phase: "phase6r-mind-editorial-review",
    version: MONSTER_MIND_GRAFT_EDITORIAL_VERSION,
    decision,
    rationale,
    reviewedAt: "2026-07-26",
  };
}

const MIND_GRAFTS = {
  "mindless-command": {
    title: "Single Command",
    cost: 1,
    complexity: 1,
    stats: { fairness: 2 },
    summary:
      "A single literal order occupies the creature's remaining mind and overrides self-preservation or tactical judgment.",
    mechanics:
      "At the start of combat, define one short directive containing a verb and a subject, such as Guard the Bell or Kill the Torch-Bearer. While the directive can be obeyed, the creature prioritizes it over every other objective and interprets it literally. If the directive becomes impossible, it attacks the nearest creature until a new path to the directive appears.",
    counterplay:
      "Listen for the repeated order, move or disguise its subject, imitate the issuing authority, or create a literal interpretation that draws the creature away.",
    tags: ["command_compulsion", "literal_order", "predictable_behavior", "authority_exploit"],
    identity: {
      fantasy:
        "A corpse or construct whose entire mind has collapsed into one repeated instruction.",
      tacticalRole:
        "Highly predictable objective fixation that players can redirect through positioning, disguise, and literal wording.",
      signature:
        "The monster repeats and obeys a short directive even when doing so is obviously harmful.",
      recognitionTags: [
        "command-bound",
        "literal-obedience",
        "repeated-order",
        "predictable-husk",
      ],
    },
    abilities: [
      {
        id: "command-loop",
        title: "Command Loop",
        section: "trait",
        summary:
          "The creature follows one literal directive with no tactical interpretation.",
        mechanics:
          "At the start of combat, define one short directive containing a verb and a subject. While that directive can be obeyed, the creature prioritizes it over every other objective and interprets it literally. If it becomes impossible, the creature attacks the nearest creature until a path to the directive reappears.",
        counterplay:
          "Redirect the directive's subject, imitate the authority that issued it, or exploit a literal reading of the command.",
        rules: passiveRules({
          text: {
            effect:
              "At the start of combat, define one short directive containing a verb and a subject. While that directive can be obeyed, the monster prioritizes it over every other objective and interprets it literally. If the directive becomes impossible, the monster attacks the nearest creature until a path to the directive reappears.",
          },
        }),
        tags: ["behavior", "directive", "target-priority", "player-bait"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Repeat the directive, take the most literal available route toward fulfilling it, and ignore tactically superior options that do not advance it.",
      "The named subject or location in the directive; otherwise the nearest creature.",
      ["command-loop"],
      [
        {
          id: "directive-impossible",
          label: "Directive impossible",
          when: "The directive has no legal or reachable subject.",
          sequence: ["command-loop"],
          notes: "Attack the nearest creature until the directive becomes actionable again.",
        },
      ],
    ),
    complexityProfile: {
      decisionLoad: 1,
      sequencing: 1,
      conditionalBranches: 1,
      tracking: 1,
      authoredComplexity: 1,
    },
    counterplayProfile: {
      telegraphs: [
        "The creature repeats the same words, gesture, or route before combat and at the start of each turn.",
      ],
      positioningAnswers: [
        "Move, hide, disguise, or place the command's subject where the literal route becomes disadvantageous.",
      ],
      breakConditions: [
        "Make the directive temporarily impossible or present a more literal interpretation of its wording.",
      ],
      nonDamageAnswers: [
        "Impersonate the issuing authority, alter a sign or uniform, or use an illusion to redirect the command.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 0,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_REWRITE",
      "The original concept was useful but underspecified. It now gives the GM a concrete directive format and gives players multiple ways to exploit literal obedience rather than merely describing poor tactics.",
    ),
  },

  "pressure-agony": {
    title: "Pain Fixation",
    cost: 2,
    complexity: 2,
    stats: { mobility: 1, fairness: 1 },
    summary:
      "Once injured, the creature's pain collapses every thought into pursuit of the person it blames.",
    mechanics:
      "The first time the creature becomes bloodied, it fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move toward the quarry without provoking Opportunity Attacks, then it must include the quarry among the targets of its attacks if able. The pursuit distance scales with CR.",
    counterplay:
      "Choose who deals the bloodied hit, break line of sight, rotate defenders, or lure the creature through hazards once its quarry is obvious.",
    tags: ["bloodied_fixation", "pain_quarry", "compelled_pursuit", "predictable_targeting"],
    identity: {
      fantasy:
        "A swollen nervous system that converts injury into a single accusatory obsession.",
      tacticalRole:
        "Bloodied-phase pursuit rule that transfers control over the monster's route to the party member who triggers it.",
      signature:
        "The bloodied creature locks onto the person it blames and surges toward that quarry every turn.",
      recognitionTags: [
        "pain-fixation",
        "bloodied-quarry",
        "compelled-pursuit",
        "blame-response",
      ],
    },
    abilities: [
      {
        id: "agony-fixation",
        title: "Agony Fixation",
        section: "trait",
        summary:
          "The bloodied creature chooses a quarry and pursues it with involuntary movement.",
        mechanics:
          "The first time the creature becomes bloodied, it fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 10 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among the targets of its attacks if able.",
        counterplay:
          "Control who deals the bloodied hit, then break sight or lead the fixation through prepared terrain.",
        rules: passiveRules({
          trigger: "The first time the creature becomes bloodied.",
          text: {
            effect:
              "The monster fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 10 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among the targets of its attacks if able.",
          },
          procedure: {
            enabled: true,
            type: "custom",
            prerequisite: "The monster is bloodied and can see its quarry.",
            text:
              "At the start of its turn, the monster moves up to 10 feet toward its quarry without provoking Opportunity Attacks and must include that quarry among its attack targets if able.",
          },
        }),
        tags: ["bloodied", "quarry", "free-movement", "target-priority"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Once bloodied, close on the agony quarry and attack it whenever legally possible.",
      "The nearest creature that caused the bloodied threshold; if sight is broken, seek the shortest route to reacquire it.",
      ["agony-fixation"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-4-stumbling-pursuit",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["agony-fixation"],
          defaultSequence: ["agony-fixation"],
          abilityPatches: {
            "agony-fixation": {
              mechanics:
                "The first time the creature becomes bloodied, it fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 10 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among its attack targets if able.",
              rules: {
                text: {
                  effect:
                    "The monster fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 10 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among its attack targets if able.",
                },
                procedure: {
                  enabled: true,
                  type: "custom",
                  prerequisite: "The monster is bloodied and can see its quarry.",
                  text:
                    "At the start of its turn, the monster moves up to 10 feet toward its quarry without provoking Opportunity Attacks.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-5-12-agonized-rush",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["agony-fixation"],
          defaultSequence: ["agony-fixation"],
          abilityPatches: {
            "agony-fixation": {
              mechanics:
                "The first time the creature becomes bloodied, it fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 15 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among its attack targets if able.",
              rules: {
                text: {
                  effect:
                    "The monster fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 15 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among its attack targets if able.",
                },
                procedure: {
                  enabled: true,
                  type: "custom",
                  prerequisite: "The monster is bloodied and can see its quarry.",
                  text:
                    "At the start of its turn, the monster moves up to 15 feet toward its quarry without provoking Opportunity Attacks.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-13-30-unignorable-agony",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["agony-fixation"],
          defaultSequence: ["agony-fixation"],
          abilityPatches: {
            "agony-fixation": {
              mechanics:
                "The first time the creature becomes bloodied, it fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 20 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among its attack targets if able.",
              rules: {
                text: {
                  effect:
                    "The monster fixates on the nearest creature that damaged it since the end of its previous turn. At the start of each of its turns while it can see that quarry, it can move up to 20 feet toward the quarry without provoking Opportunity Attacks, then it must include the quarry among its attack targets if able.",
                },
                procedure: {
                  enabled: true,
                  type: "custom",
                  prerequisite: "The monster is bloodied and can see its quarry.",
                  text:
                    "At the start of its turn, the monster moves up to 20 feet toward its quarry without provoking Opportunity Attacks.",
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
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "When bloodied, the creature cries out at one attacker and turns every sensory organ toward that quarry.",
      ],
      positioningAnswers: [
        "Choose a durable character to deal the bloodied hit, then kite the creature through hazards or defensive zones.",
      ],
      breakConditions: [
        "Break line of sight or make the quarry unreachable so the compulsory movement does not trigger.",
      ],
      nonDamageAnswers: [
        "Illusions, invisibility, forced movement, and rotating the front line can redirect or suspend the pursuit.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "The previous trait was a generic bloodied movement bonus. It now creates a party-controlled quarry, a predictable route, and CR-scaled pursuit without increasing direct damage.",
    ),
  },

  "shame-hunger": {
    title: "Funeral Hunger",
    cost: 3,
    complexity: 2,
    stats: { hp: 5, control: 1, fairness: 1 },
    summary:
      "The spirit recognizes signs of burial, sanctity, and fresh injury as accusations, then feeds on the person carrying them.",
    mechanics:
      "At the start of combat, the creature marks one visible creature carrying a holy symbol, funerary object, grave soil, or open wound as its Bearer of Shame. It prioritizes that target. Once per encounter, after it damages the Bearer, it regains hit points based on its CR. A visible funerary offering can be presented to transfer the mark to the bearer of that offering.",
    counterplay:
      "Choose who carries the bait, pass or discard funerary objects, present an offering to transfer the mark, or keep the marked character behind protection.",
    tags: ["funerary_mark", "shame_quarry", "ritual_bait", "once_per_encounter_feeding"],
    identity: {
      fantasy:
        "A condemned eater of the dead that mistakes funerary symbols and open wounds for public accusations.",
      tacticalRole:
        "Ritually transferable quarry system with a once-per-encounter sustain payoff.",
      signature:
        "The monster marks a Bearer of Shame and can be redirected by deliberately presenting funerary bait.",
      recognitionTags: [
        "funerary-shame",
        "marked-bearer",
        "ritual-bait",
        "profane-feeding",
      ],
    },
    abilities: [
      {
        id: "bearer-of-shame",
        title: "Bearer of Shame",
        section: "trait",
        summary:
          "The spirit chooses a target associated with burial, sanctity, or exposed flesh.",
        mechanics:
          "At the start of combat, the monster marks one visible creature carrying a holy symbol, funerary object, grave soil, or open wound as its Bearer of Shame. It prioritizes that creature. A different creature can visibly present a funerary offering to become the new Bearer.",
        counterplay:
          "Transfer the mark deliberately, conceal qualifying objects, or force the monster to route toward a protected bearer.",
        rules: passiveRules({
          text: {
            effect:
              "At the start of combat, the monster marks one visible creature carrying a holy symbol, funerary object, grave soil, or open wound as its Bearer of Shame. It prioritizes that creature. A different creature can visibly present a funerary offering to become the new Bearer.",
          },
        }),
        tags: ["quarry", "ritual", "target-priority", "transferable-mark"],
        authored: true,
      },
      {
        id: "profane-feeding",
        title: "Profane Feeding",
        section: "trait",
        summary:
          "The spirit restores itself the first time it wounds its marked bearer.",
        mechanics:
          "Once per encounter, immediately after the monster damages its Bearer of Shame, the monster regains hit points equal to twice its Proficiency Bonus.",
        counterplay:
          "Transfer the mark to a protected or distant creature before the spirit lands its first hit.",
        rules: passiveRules({
          trigger:
            "Immediately after the monster damages its Bearer of Shame, once per encounter.",
          text: {
            effect:
              "The monster regains Hit Points equal to twice its Proficiency Bonus.",
          },
          defense: {
            enabled: true,
            type: "healing",
            timing: "triggered",
            breakCondition:
              "Transfer the mark or prevent the monster from damaging the Bearer of Shame.",
            text:
              "Once per encounter, immediately after the monster damages its Bearer of Shame, it regains Hit Points equal to twice its Proficiency Bonus.",
          },
        }),
        tags: ["healing", "once-per-encounter", "marked-target", "sustain"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Pursue the Bearer of Shame until the feeding trigger resolves, then continue harassing that target unless a new offering transfers the mark.",
      "The current Bearer of Shame.",
      ["bearer-of-shame", "profane-feeding"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-4-gnawing-shame",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["bearer-of-shame", "profane-feeding"],
          defaultSequence: ["bearer-of-shame", "profane-feeding"],
          abilityPatches: {
            "profane-feeding": {
              mechanics:
                "Once per encounter, immediately after the monster damages its Bearer of Shame, the monster regains hit points equal to twice its Proficiency Bonus.",
              rules: {
                text: {
                  effect:
                    "The monster regains Hit Points equal to twice its Proficiency Bonus.",
                },
                defense: {
                  enabled: true,
                  type: "healing",
                  timing: "triggered",
                  breakCondition:
                    "Transfer the mark or prevent the monster from damaging the Bearer of Shame.",
                  text:
                    "The monster regains Hit Points equal to twice its Proficiency Bonus.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-5-12-devouring-shame",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["bearer-of-shame", "profane-feeding"],
          defaultSequence: ["bearer-of-shame", "profane-feeding"],
          abilityPatches: {
            "profane-feeding": {
              mechanics:
                "Once per encounter, immediately after the monster damages its Bearer of Shame, the monster regains hit points equal to three times its Proficiency Bonus.",
              rules: {
                text: {
                  effect:
                    "The monster regains Hit Points equal to three times its Proficiency Bonus.",
                },
                defense: {
                  enabled: true,
                  type: "healing",
                  timing: "triggered",
                  breakCondition:
                    "Transfer the mark or prevent the monster from damaging the Bearer of Shame.",
                  text:
                    "The monster regains Hit Points equal to three times its Proficiency Bonus.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-13-30-insatiable-shame",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["bearer-of-shame", "profane-feeding"],
          defaultSequence: ["bearer-of-shame", "profane-feeding"],
          abilityPatches: {
            "profane-feeding": {
              mechanics:
                "Once per encounter, immediately after the monster damages its Bearer of Shame, the monster regains hit points equal to four times its Proficiency Bonus.",
              rules: {
                text: {
                  effect:
                    "The monster regains Hit Points equal to four times its Proficiency Bonus.",
                },
                defense: {
                  enabled: true,
                  type: "healing",
                  timing: "triggered",
                  breakCondition:
                    "Transfer the mark or prevent the monster from damaging the Bearer of Shame.",
                  text:
                    "The monster regains Hit Points equal to four times its Proficiency Bonus.",
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
      tracking: 2,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The spirit recoils from holy symbols and funerary objects, then stares at one bearer with visible shame and hunger.",
      ],
      positioningAnswers: [
        "Keep the marked bearer protected, elevated, behind cover, or outside the monster's direct route.",
      ],
      breakConditions: [
        "A visible funerary offering transfers the mark before the feeding trigger resolves.",
      ],
      nonDamageAnswers: [
        "Pass, conceal, discard, or ceremonially present qualifying objects to control who becomes the Bearer of Shame.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 1,
    },
    editorial: editorial(
      "EXPAND_INTO_BUNDLE_AND_SCALE",
      "The previous feature mixed target priority and healing in one paragraph. It now separates the transferable quarry from the bounded feeding payoff and scales only the healing amount.",
    ),
  },

  "corpse-craving": {
    title: "Corpse Hunger",
    cost: 1,
    complexity: 2,
    stats: { hp: 3, fairness: 2 },
    summary:
      "An exposed corpse can interrupt the creature's violence and draw it into a vulnerable feeding posture.",
    mechanics:
      "If the creature starts its turn able to see an unattended corpse within 30 feet, it must move toward the nearest such corpse if able. When adjacent to a corpse, it can use a bonus action to feed, gaining temporary hit points equal to twice its Proficiency Bonus; until the start of its next turn, it cannot take reactions and has disadvantage on attack rolls against living creatures.",
    counterplay:
      "Place, move, contaminate, or disguise a corpse to control its route, then punish the reactionless feeding window.",
    tags: ["corpse_bait", "feeding_posture", "temporary_hit_points", "self_distraction"],
    identity: {
      fantasy:
        "A shameful corpse-eater whose appetite can override immediate danger and expose it while feeding.",
      tacticalRole:
        "Player-created bait route with a small sustain reward and a clear vulnerability window.",
      signature:
        "A nearby corpse pulls the monster out of position and invites it to feed instead of reacting.",
      recognitionTags: [
        "corpse-compulsion",
        "feeding-window",
        "movable-bait",
        "reactionless-feeding",
      ],
    },
    abilities: [
      {
        id: "corpse-compulsion",
        title: "Corpse Compulsion",
        section: "trait",
        summary:
          "The creature routes toward the nearest visible unattended corpse.",
        mechanics:
          "If the monster starts its turn able to see an unattended corpse within 30 feet, it must move toward the nearest such corpse if able.",
        counterplay:
          "Move or create a corpse-shaped decoy to determine the monster's route.",
        rules: passiveRules({
          trigger:
            "The monster starts its turn able to see an unattended corpse within 30 feet.",
          text: {
            effect:
              "The monster must move toward the nearest visible unattended corpse if able.",
          },
          procedure: {
            enabled: true,
            type: "custom",
            prerequisite:
              "The monster can see an unattended corpse within 30 feet.",
            text:
              "The monster moves toward the nearest visible unattended corpse before pursuing other objectives.",
          },
        }),
        tags: ["compulsion", "corpse", "forced-priority", "bait-route"],
        authored: true,
      },
      {
        id: "feed-on-the-dead",
        title: "Feed on the Dead",
        section: "bonusAction",
        summary:
          "The creature consumes a corpse for temporary vitality but becomes exposed to retaliation.",
        mechanics:
          "While adjacent to a corpse, the monster can use a bonus action to consume part of it and gain temporary hit points equal to twice its Proficiency Bonus. Until the start of its next turn, it cannot take reactions and has disadvantage on attack rolls against living creatures.",
        counterplay:
          "Bait the feeding action, then disengage, reposition, or attack during the reactionless window.",
        rules: bonusActionRules({
          trigger: "The monster is adjacent to an unattended corpse.",
          targeting: { type: "object", targets: "one adjacent corpse" },
          text:
            "The monster consumes part of the corpse and gains Temporary Hit Points equal to twice its Proficiency Bonus. Until the start of its next turn, it cannot take Reactions and has disadvantage on attack rolls against living creatures.",
        }),
        tags: ["feeding", "temporary-hit-points", "bonus-action", "vulnerability-window"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Route toward visible corpse bait; when adjacent, feed if the temporary vitality is useful, accepting the exposed posture.",
      "The nearest visible unattended corpse, then the nearest living creature after feeding.",
      ["corpse-compulsion", "feed-on-the-dead"],
    ),
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The monster repeatedly turns toward exposed bodies and salivates or whispers over them.",
      ],
      positioningAnswers: [
        "Place or move a corpse so the compulsory route crosses hazards, zones, or defensive lines.",
      ],
      breakConditions: [
        "Remove, conceal, sanctify, or destroy the corpse before the monster starts its turn.",
      ],
      nonDamageAnswers: [
        "Illusions, bundled clothing, funerary decoys, and forced movement can create or relocate convincing bait.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 1,
    },
    editorial: editorial(
      "EXPAND_INTO_BUNDLE",
      "The original self-save was awkward and its feeding state had no defined action. The new bundle creates deterministic bait movement, a bounded bonus-action reward, and a player-facing vulnerability window.",
    ),
  },

  "nocturnal-haunting": {
    title: "Night Hunter",
    cost: 2,
    complexity: 2,
    stats: { mobility: 1, fairness: 1 },
    summary:
      "The creature treats direct light as exposure and darkness as permission to stalk isolated witnesses.",
    mechanics:
      "In bright light, the creature cannot willingly end its turn farther from dim light or darkness if a safe route exists. While in dim light or darkness, it has advantage on Dexterity (Stealth) checks and can Hide as a bonus action if no hostile creature is within 10 feet of it.",
    counterplay:
      "Create overlapping bright-light zones, stay close enough to deny the Hide condition, and herd it away from dark routes.",
    tags: ["light_aversion", "night_stalker", "dark_route", "witness_hunter"],
    identity: {
      fantasy:
        "A haunting intelligence that understands daylight as public exposure and darkness as concealment for sacrilege.",
      tacticalRole:
        "Light-dependent route preference paired with a conditional stalking action.",
      signature:
        "The monster retreats from bright exposure and disappears only when isolated in darkness.",
      recognitionTags: [
        "nightbound-haunter",
        "light-aversion",
        "isolated-stalker",
        "darkness-route",
      ],
    },
    abilities: [
      {
        id: "daylight-withdrawal",
        title: "Daylight Withdrawal",
        section: "trait",
        summary:
          "Bright exposure forces the creature to route toward concealment.",
        mechanics:
          "While in bright light, the monster cannot willingly end its turn farther from dim light or darkness if a safe route toward either exists.",
        counterplay:
          "Shape bright-light zones so every retreat path leads through controlled terrain.",
        rules: passiveRules({
          text: {
            effect:
              "While in Bright Light, the monster cannot willingly end its turn farther from Dim Light or Darkness if a safe route toward either exists.",
          },
        }),
        tags: ["bright-light", "route-constraint", "withdrawal", "behavior"],
        authored: true,
      },
      {
        id: "grave-night-stalker",
        title: "Grave-Night Stalker",
        section: "bonusAction",
        summary:
          "In darkness and outside immediate reach, the creature can vanish into a stalking route.",
        mechanics:
          "While in dim light or darkness, the monster has advantage on Dexterity (Stealth) checks and can take the Hide action as a bonus action if no hostile creature is within 10 feet of it.",
        counterplay:
          "Stay within 10 feet, illuminate its route, or use senses that do not depend on sight.",
        rules: bonusActionRules({
          trigger:
            "The monster is in dim light or darkness and no hostile creature is within 10 feet of it.",
          text:
            "The monster takes the Hide action. While in Dim Light or Darkness, it has advantage on Dexterity (Stealth) checks.",
        }),
        tags: ["hide", "darkness", "isolation", "bonus-action"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Avoid ending turns in public bright exposure; seek darkness, isolate a witness, then Hide before approaching again.",
      "The most isolated visible creature near a dark route.",
      ["daylight-withdrawal", "grave-night-stalker"],
    ),
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The creature shields its face, retreats from lanterns, and circles toward alleys, graves, or covered passages.",
      ],
      positioningAnswers: [
        "Maintain overlapping light and keep at least one hostile creature within 10 feet to deny the stalking Hide.",
      ],
      breakConditions: [
        "Remove all reachable dim-light and darkness routes or pin the monster in bright exposure.",
      ],
      nonDamageAnswers: [
        "Torches, mirrors, movable lanterns, daylight magic, and nonvisual senses dismantle the hunting pattern.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 1,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_EXPAND_INTO_BUNDLE",
      "The original was mostly an adventure note. It now creates a combat-readable light aversion and a distinct conditional stalking action without duplicating Umbral Skin's invisibility progression.",
    ),
  },

  "deceitful-apparition": {
    title: "Dead Impostor",
    cost: 2,
    complexity: 2,
    stats: { fairness: 2 },
    summary:
      "The apparition reconstructs a social identity from a consumed corpse but cannot improvise memories it never stole.",
    mechanics:
      "The creature can appear and sound like a mundane person whose corpse it has consumed. It reproduces habitual phrases and visible mannerisms but does not know private facts learned after the victim's death. A creature that spends an action testing the disguise with a specific memory, funerary record, or physical evidence makes an Insight or Investigation check contested by the monster's Deception; on a success, the disguise is exposed to every witness who can hear or see the evidence.",
    counterplay:
      "Ask about private memories, compare records, produce the victim's remains, or force the apparition to improvise outside its stolen script.",
    tags: ["corpse_disguise", "stolen_identity", "memory_gap", "social_detection"],
    identity: {
      fantasy:
        "A spirit wearing a dead person's voice and manners as a rehearsed social costume.",
      tacticalRole:
        "Investigation-facing infiltration trait with explicit evidence-based exposure rules.",
      signature:
        "The disguise is convincing until someone tests a memory the corpse could not provide.",
      recognitionTags: [
        "corpse-worn-guise",
        "stolen-mannerisms",
        "memory-gap",
        "evidence-exposure",
      ],
    },
    abilities: [
      {
        id: "corpse-worn-guise",
        title: "Corpse-Worn Guise",
        section: "trait",
        summary:
          "The apparition mimics a consumed victim but remains vulnerable to evidence and memory tests.",
        mechanics:
          "The monster can appear and sound like a mundane person whose corpse it has consumed. A creature that spends an action testing the disguise with a specific memory, funerary record, or physical evidence makes an Insight or Investigation check contested by the monster's Deception. On a success, the disguise is exposed to every witness who can perceive the evidence.",
        counterplay:
          "Use victim-specific questions, records, remains, or contradictions rather than relying only on passive observation.",
        rules: passiveRules({
          text: {
            effect:
              "The monster can appear and sound like a mundane person whose corpse it has consumed. A creature can spend an Action testing the disguise with a specific memory, funerary record, or physical evidence, making an Insight or Investigation check contested by the monster's Deception. On a success, the disguise is exposed to every witness who can perceive the evidence.",
          },
        }),
        tags: ["disguise", "investigation", "corpse-memory", "social"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Maintain the stolen identity, repeat familiar phrases, and avoid claims that require private knowledge; flee or escalate when concrete evidence is presented.",
      "The witness most likely to accept or publicly validate the disguise.",
      ["corpse-worn-guise"],
    ),
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 1,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The disguise repeats certain phrases perfectly but hesitates around private memories and recent events.",
      ],
      positioningAnswers: [
        "Separate the apparition from sympathetic witnesses and confront it where records or remains can be displayed.",
      ],
      breakConditions: [
        "A successful evidence-based test exposes the disguise to all witnesses who perceive it.",
      ],
      nonDamageAnswers: [
        "Questioning, documents, divination, the victim's remains, and contradictory testimony can defeat the feature without combat.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 1,
      controlSpike: 0,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_REWRITE",
      "The original disguise had no clear table procedure. It now defines what the apparition knows, how a character actively tests it, and how successful evidence changes the whole scene.",
    ),
  },

  "mortal-afterlife": {
    title: "Stolen Life",
    cost: 1,
    complexity: 2,
    stats: { fairness: 2 },
    summary:
      "The creature has built an imaginary mortal life around one person, home, profession, or community and cannot tolerate public contradiction.",
    mechanics:
      "At the start of the encounter, define the creature's Identity Anchor: a person, place, role, or possession that proves its stolen life is real. The first time at least two witnesses clearly expose the lie with records, remains, or testimony, the creature suffers Identity Collapse until the end of its next turn: it cannot take reactions, and on its turn it must move toward its Identity Anchor or a corpse it can use to rebuild the persona before taking other movement.",
    counterplay:
      "Identify the anchor during investigation, gather credible evidence, and expose the lie where multiple witnesses can confirm it.",
    tags: ["identity_anchor", "public_exposure", "delusion", "social_control"],
    identity: {
      fantasy:
        "An undead impostor that is not merely disguised but psychologically dependent on the mortal life it invented.",
      tacticalRole:
        "Investigation-earned control window tied to public exposure and a defined identity anchor.",
      signature:
        "Two witnesses and concrete evidence can collapse the persona and force the monster back toward its anchor.",
      recognitionTags: [
        "stolen-life",
        "identity-anchor",
        "public-exposure",
        "delusion-collapse",
      ],
    },
    abilities: [
      {
        id: "identity-collapse",
        title: "Identity Collapse",
        section: "trait",
        summary:
          "Public proof of the stolen identity creates a short, predictable control window.",
        mechanics:
          "The first time at least two witnesses clearly expose the monster's stolen life with records, remains, or testimony, it cannot take reactions until the end of its next turn. On its next turn, it must move toward its Identity Anchor or a corpse it can use to rebuild the persona before taking other movement.",
        counterplay:
          "Prepare credible evidence and arrange multiple witnesses before confronting the creature.",
        rules: passiveRules({
          trigger:
            "The first time at least two witnesses clearly expose the monster's stolen identity with records, remains, or testimony.",
          text: {
            effect:
              "The monster cannot take Reactions until the end of its next turn. On its next turn, it must move toward its Identity Anchor or a corpse it can use to rebuild the persona before taking other movement.",
          },
          procedure: {
            enabled: true,
            type: "custom",
            prerequisite:
              "At least two witnesses perceive credible evidence that exposes the stolen identity.",
            text:
              "The monster loses its Reactions and must route toward its Identity Anchor or a usable corpse on its next turn.",
          },
        }),
        tags: ["exposure", "identity", "reaction-denial", "forced-route"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Protect the Identity Anchor and preserve public belief in the stolen life; after exposure, retreat toward the anchor or a usable corpse.",
      "The witness with the strongest evidence, unless protecting or reaching the Identity Anchor is more urgent.",
      ["identity-collapse"],
    ),
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The creature compulsively protects one name, home, relationship, office, or personal possession.",
      ],
      positioningAnswers: [
        "Confront it away from the Identity Anchor so the collapse forces a predictable retreat route.",
      ],
      breakConditions: [
        "Two witnesses must perceive credible evidence that publicly contradicts the stolen life.",
      ],
      nonDamageAnswers: [
        "Investigation, testimony, records, remains, and social staging create the control window without dealing damage.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 0,
    },
    editorial: editorial(
      "RENAME_AND_REWRITE",
      "The original self-save and vague community exposure were difficult to adjudicate. The new feature defines an Identity Anchor, evidence threshold, witnesses, and a bounded once-per-encounter consequence.",
    ),
  },

  "maternal-swarm-instinct": {
    title: "Brood Guard",
    cost: 2,
    complexity: 2,
    stats: { mobility: 1, control: 1, fairness: 1 },
    summary:
      "The creature designates a visible brood, egg cluster, small ally, or webbed nursery and treats every threat to it as more urgent than its own safety.",
    mechanics:
      "At the start of combat, designate one visible allied creature, egg cluster, webbed object, or occupied nursery space as the Brood. The creature prioritizes enemies within 10 feet of the Brood. When a hostile creature damages or enters the Brood's space, the monster can use its reaction to move up to half its speed toward that hostile creature without provoking Opportunity Attacks.",
    counterplay:
      "Threaten the Brood to pull the guardian out of position, then disengage, relocate the Brood, or attack from multiple angles to exhaust its reaction.",
    tags: ["brood_anchor", "guardian_behavior", "reaction_pursuit", "baitable_instinct"],
    identity: {
      fantasy:
        "A predatory parent whose intelligence narrows into violent guardianship around a chosen brood anchor.",
      tacticalRole:
        "Anchor-centered target priority plus baitable reaction movement.",
      signature:
        "Threatening the Brood immediately pulls the guardian toward the intruder, even into a trap.",
      recognitionTags: [
        "brood-guardian",
        "nursery-anchor",
        "protective-rush",
        "baitable-parent",
      ],
    },
    abilities: [
      {
        id: "brood-priority",
        title: "Brood Priority",
        section: "trait",
        summary:
          "The creature defines a brood anchor and prioritizes intruders near it.",
        mechanics:
          "At the start of combat, designate one visible allied creature, egg cluster, webbed object, or occupied nursery space as the Brood. The monster prioritizes enemies within 10 feet of the Brood.",
        counterplay:
          "Approach from multiple sides or deliberately threaten the Brood to control target selection.",
        rules: passiveRules({
          text: {
            effect:
              "At the start of combat, designate one visible allied creature, egg cluster, webbed object, or occupied nursery space as the Brood. The monster prioritizes enemies within 10 feet of the Brood.",
          },
        }),
        tags: ["anchor", "brood", "target-priority", "guardian"],
        authored: true,
      },
      {
        id: "protective-rush",
        title: "Protective Rush",
        section: "reaction",
        summary:
          "A threat to the Brood pulls the guardian toward the intruder.",
        mechanics:
          "When a hostile creature damages the Brood or enters its space, the monster moves up to half its speed toward that hostile creature without provoking Opportunity Attacks.",
        counterplay:
          "Trigger the rush with a mobile character, then draw the monster away or exhaust its reaction before the real approach.",
        rules: reactionRules({
          trigger:
            "A hostile creature damages the Brood or enters the Brood's space.",
          targeting: { type: "single", targets: "the triggering hostile creature" },
          text:
            "The monster moves up to half its Speed toward the triggering creature without provoking Opportunity Attacks.",
        }),
        tags: ["reaction", "movement", "brood-defense", "bait"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Remain close enough to defend the Brood, prioritize intruders near it, and use Protective Rush to punish or chase the first direct threat.",
      "A hostile creature within 10 feet of the Brood; otherwise the nearest creature with a clear route to it.",
      ["brood-priority", "protective-rush"],
    ),
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The monster constantly places its body between the party and one visible brood anchor.",
      ],
      positioningAnswers: [
        "Threaten the Brood from one direction while the main group approaches from another.",
      ],
      breakConditions: [
        "Move, rescue, destroy, or otherwise remove the designated Brood anchor from the battlefield.",
      ],
      nonDamageAnswers: [
        "Illusions, object interaction, forced movement, and a fast decoy can trigger the protective rush on unfavorable terms.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 0,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_EXPAND_INTO_BUNDLE",
      "The original spawned a swarm and granted flat damage, duplicating Body and summon mechanics. It now focuses purely on maternal decision logic: an explicit Brood anchor, target priority, and baitable reaction movement.",
    ),
  },

  "hundred-eyed": {
    title: "Many Eyes",
    cost: 3,
    complexity: 2,
    stats: { control: 1, fairness: 1 },
    summary:
      "Its many eyes do not merely see more; they divide attention so no single feint can occupy the whole mind.",
    mechanics:
      "The creature cannot be surprised while conscious and gains a bonus to passive Perception equal to its Proficiency Bonus. As a bonus action, it can Fix one creature it can see until the start of its next turn; that creature gains no benefit from being unseen by this monster unless its sight is disabled, every eye is covered, or line of sight is denied.",
    counterplay:
      "Use smoke, total cover, darkness, eye-targeting effects, or simultaneous threats from multiple directions to overload its distributed attention.",
    tags: ["distributed_attention", "many_eyes", "anti_ambush", "fixed_target"],
    identity: {
      fantasy:
        "A malformed mind distributed across dozens of eyes, each maintaining a separate thread of attention.",
      tacticalRole:
        "Anti-ambush perception plus a temporary answer to one unseen target.",
      signature:
        "The monster deliberately assigns several eyes to Fix one creature and deny its unseen advantage.",
      recognitionTags: [
        "distributed-vigil",
        "many-eyed-mind",
        "fixed-target",
        "anti-ambush",
      ],
    },
    abilities: [
      {
        id: "hundredfold-attention",
        title: "Hundredfold Attention",
        section: "trait",
        summary:
          "Distributed attention prevents ordinary surprise and sharpens passive observation.",
        mechanics:
          "The monster cannot be surprised while conscious and gains a bonus to passive Perception equal to its Proficiency Bonus.",
        counterplay:
          "Blind or cover the eyes, use total cover, or attack from beyond every available line of sight.",
        rules: passiveRules({
          text: {
            effect:
              "The monster cannot be Surprised while conscious and gains a bonus to Passive Perception equal to its Proficiency Bonus.",
          },
        }),
        tags: ["perception", "surprise", "passive", "many-eyes"],
        authored: true,
      },
      {
        id: "fix-the-unseen",
        title: "Fix the Unseen",
        section: "bonusAction",
        summary:
          "The monster dedicates a cluster of eyes to one visible creature.",
        mechanics:
          "The monster chooses one creature it can see. Until the start of the monster's next turn, that creature gains no benefit from being unseen by the monster unless its sight is disabled, every eye is covered, or line of sight is denied.",
        counterplay:
          "Use total cover, smoke, darkness, or effects that blind or obstruct the eyes after the target is fixed.",
        rules: bonusActionRules({
          targeting: { type: "single", targets: "one creature the monster can see" },
          text:
            "Until the start of the monster's next turn, the target gains no benefit from being unseen by the monster unless its sight is disabled, every eye is covered, or Line of Sight is denied.",
        }),
        tags: ["bonus-action", "unseen", "focus", "counter-stealth"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Keep broad awareness, then Fix the most dangerous hidden, invisible, or mobile threat before committing attacks.",
      "The creature most likely to become unseen or attack from an unexpected angle.",
      ["hundredfold-attention", "fix-the-unseen"],
    ),
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 1,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "A cluster of eyes rotates and locks onto one character while the remaining eyes continue scanning elsewhere.",
      ],
      positioningAnswers: [
        "Use total cover or divide threats across angles so no fixed target remains continuously visible.",
      ],
      breakConditions: [
        "Blind, cover, obscure, or deny line of sight to every eye tracking the fixed target.",
      ],
      nonDamageAnswers: [
        "Smoke, darkness, mirrors, curtains, doors, and visual illusions overload or interrupt the distributed vigil.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 1,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_EXPAND_INTO_BUNDLE",
      "The original was a generic perception bonus and was conceptually close to Body. The new version makes the many eyes a cognitive system with a visible target-fixing decision and explicit overload counters.",
    ),
  },

  "hunter-spider": {
    title: "Patient Hunter",
    cost: 2,
    complexity: 2,
    stats: { mobility: 1, fairness: 1 },
    summary:
      "The predator chooses one isolated quarry and refuses to reveal itself until the battlefield gives it a clean approach.",
    mechanics:
      "At the start of combat, the creature marks one visible creature that is isolated, restrained, wounded, or farthest from its allies as its Quarry. It prioritizes remaining unseen from that Quarry. While in cover, dim light, darkness, or webbing, it can Hide as a bonus action, but only if it ends its turn no closer to a different enemy than to its Quarry. It can choose a new Quarry when the current one becomes unreachable or ends its turn adjacent to an ally.",
    counterplay:
      "Stay grouped, deliberately escort the Quarry, clear cover and webs, and make the marked target end beside an ally to break the hunt.",
    tags: ["quarry_selection", "patient_predator", "conditional_hide", "isolation_counterplay"],
    identity: {
      fantasy:
        "A wolf-spider intelligence that hunts by waiting for social separation rather than charging the nearest body.",
      tacticalRole:
        "Isolation-sensitive quarry pattern with conditional bonus-action hiding.",
      signature:
        "The spider marks the most isolated creature and loses its preferred hunt when that target rejoins an ally.",
      recognitionTags: [
        "patient-quarry",
        "isolation-hunter",
        "conditional-hide",
        "grouping-counterplay",
      ],
    },
    abilities: [
      {
        id: "choose-quarry",
        title: "Choose Quarry",
        section: "trait",
        summary:
          "The predator marks a socially or tactically isolated creature.",
        mechanics:
          "At the start of combat, the monster marks one visible creature that is isolated, restrained, wounded, or farthest from its allies as its Quarry. It can choose a new Quarry when the current one becomes unreachable or ends its turn adjacent to an ally.",
        counterplay:
          "Have the marked target end beside an ally or become unreachable to force a retarget.",
        rules: passiveRules({
          text: {
            effect:
              "At the start of combat, the monster marks one visible creature that is isolated, Restrained, wounded, or farthest from its allies as its Quarry. It can choose a new Quarry when the current one becomes unreachable or ends its turn adjacent to an ally.",
          },
        }),
        tags: ["quarry", "isolation", "target-priority", "retarget"],
        authored: true,
      },
      {
        id: "stalkers-patience",
        title: "Stalker's Patience",
        section: "bonusAction",
        summary:
          "The predator hides only while preserving a clean line toward its chosen quarry.",
        mechanics:
          "While in cover, dim light, darkness, or webbing, the monster can take the Hide action as a bonus action, but only if it ends its turn no closer to a different enemy than to its Quarry.",
        counterplay:
          "Close from multiple angles, remove cover and webs, or keep another character nearer than the Quarry.",
        rules: bonusActionRules({
          trigger:
            "The monster is in cover, dim light, darkness, or webbing and is no closer to another enemy than to its Quarry.",
          text: "The monster takes the Hide action.",
        }),
        tags: ["hide", "quarry", "terrain", "bonus-action"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Mark an isolated Quarry, preserve concealment, circle until the Quarry separates, and abandon the hunt when the target rejoins an ally.",
      "The current Quarry; prefer isolated, restrained, wounded, or distant creatures.",
      ["choose-quarry", "stalkers-patience"],
    ),
    complexityProfile: {
      decisionLoad: 2,
      sequencing: 1,
      conditionalBranches: 2,
      tracking: 1,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The spider continually circles one character and ignores easier targets that remain inside the group.",
      ],
      positioningAnswers: [
        "End the Quarry's turn adjacent to an ally and approach the spider from multiple directions.",
      ],
      breakConditions: [
        "The Quarry becomes unreachable or ends its turn adjacent to an ally, forcing the spider to choose again.",
      ],
      nonDamageAnswers: [
        "Light, fire, cleared webbing, readied movement, and escort tactics dismantle the patient hunt.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 1,
      controlSpike: 1,
      damageSpike: 0,
      repeatability: 2,
    },
    editorial: editorial(
      "RENAME_AND_EXPAND_INTO_PATTERN_BUNDLE",
      "The original was only advantage on Stealth plus bonus-action Hide. It now defines quarry selection, retarget conditions, spatial constraints, and a complete stalking procedure.",
    ),
  },

  "borrowed-face": {
    title: "Borrowed Face",
    cost: 3,
    complexity: 2,
    stats: { control: 1, fairness: 1 },
    summary:
      "The wax face does not merely resemble the dead; it forces witnesses to remember a final expression that was never theirs to see.",
    mechanics:
      "When a creature first sees the mask clearly, it makes a Wisdom saving throw. On a failure, it cannot take reactions against the monster and cannot willingly move closer to it until the start of its next turn. Covering, breaking, removing, or melting the mask suppresses this ability. At higher CR, the first clear view can affect more witnesses.",
    counterplay:
      "Avoid a clear view, use mirrors or indirect sight, cover or melt the mask, or let resistant characters expose it before others look directly.",
    tags: ["recognition_shock", "wax_mask", "reaction_denial", "approach_denial"],
    identity: {
      fantasy:
        "A funerary mask that implants an intimate false memory of the deceased's final expression.",
      tacticalRole:
        "First-sight control pulse tied to a destructible and coverable facial object.",
      signature:
        "A clear view of the borrowed face briefly removes reactions and prevents approach.",
      recognitionTags: [
        "borrowed-memory",
        "mourner-shock",
        "wax-mask",
        "first-sight-control",
      ],
    },
    abilities: [
      {
        id: "recognition-shock",
        title: "Recognition Shock",
        section: "trait",
        summary:
          "The first clear view of the mask implants a false memory and arrests the witness.",
        mechanics:
          "When one creature first sees the mask clearly, it makes a Wisdom saving throw. On a failure, it cannot take reactions against the monster and cannot willingly move closer to it until the start of its next turn.",
        counterplay:
          "Use indirect sight, obscure the face, or destroy or melt the mask before multiple characters look directly.",
        rules: passiveRules({
          trigger: "A creature first sees the mask clearly.",
          resolution: {
            type: "savingThrow",
            ability: "wisdom",
            dc: "monster",
          },
          targeting: { type: "single", targets: "one creature" },
          text: {
            failure:
              "The target cannot take Reactions against the monster and cannot willingly move closer to it until the start of its next turn.",
            success: "No effect.",
          },
        }),
        tags: ["saving-throw", "first-sight", "mask", "control"],
        authored: true,
      },
    ],
    routine: behaviorRoutine(
      "Present the mask to unexposed witnesses before closing distance; protect the mask from covering, heat, and direct attacks.",
      "A creature that has not yet clearly seen the mask.",
      ["recognition-shock"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-7-single-memory",
          minCr: 0,
          maxCr: 7,
          abilityIds: ["recognition-shock"],
          defaultSequence: ["recognition-shock"],
          abilityPatches: {
            "recognition-shock": {
              mechanics:
                "When one creature first sees the mask clearly, it makes a Wisdom saving throw. On a failure, it cannot take reactions against the monster and cannot willingly move closer to it until the start of its next turn.",
              rules: {
                targeting: { type: "single", targets: "one creature" },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-8-15-shared-memory",
          minCr: 8,
          maxCr: 15,
          abilityIds: ["recognition-shock"],
          defaultSequence: ["recognition-shock"],
          abilityPatches: {
            "recognition-shock": {
              mechanics:
                "When up to two creatures first see the mask clearly, each makes a Wisdom saving throw. On a failure, a target cannot take reactions against the monster and cannot willingly move closer to it until the start of its next turn.",
              rules: {
                targeting: { type: "multiple", targets: "up to two creatures" },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-16-30-funeral-memory",
          minCr: 16,
          maxCr: 30,
          abilityIds: ["recognition-shock"],
          defaultSequence: ["recognition-shock"],
          abilityPatches: {
            "recognition-shock": {
              mechanics:
                "When up to three creatures first see the mask clearly, each makes a Wisdom saving throw. On a failure, a target cannot take reactions against the monster and cannot willingly move closer to it until the start of its next turn.",
              rules: {
                targeting: { type: "multiple", targets: "up to three creatures" },
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
      tracking: 2,
      authoredComplexity: 2,
    },
    counterplayProfile: {
      telegraphs: [
        "The mask resembles a familiar dead face and turns deliberately toward witnesses who have not yet looked at it.",
      ],
      positioningAnswers: [
        "Use cover, indirect sight, or a resistant character to block the mask from unexposed allies.",
      ],
      breakConditions: [
        "Covering, breaking, removing, or melting the wax mask suppresses Recognition Shock.",
      ],
      nonDamageAnswers: [
        "Mirrors, veils, darkness, averting the eyes, and coordinated exposure prevent the first-sight trigger.",
      ],
    },
    spikeRiskProfile: {
      openingBurst: 2,
      controlSpike: 2,
      damageSpike: 0,
      repeatability: 0,
    },
    editorial: editorial(
      "RENAME_REWRITE_AND_SCALE",
      "The original only denied reactions and overlapped the disguise graft. It now represents a funerary memory shock, adds approach denial, ties the effect to a breakable mask, and scales only the number of first-time witnesses.",
    ),
  },
};

export const MONSTER_MIND_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(MIND_GRAFTS),
);

export const MONSTER_MIND_GRAFT_SCALED_IDS = Object.freeze([
  "pressure-agony",
  "shame-hunger",
  "borrowed-face",
]);

export function getMonsterMindGraftEditorialOverride(graftId = "") {
  return MIND_GRAFTS[String(graftId || "").trim()] || null;
}
