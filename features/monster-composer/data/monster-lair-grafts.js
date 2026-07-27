export const MONSTER_LAIR_GRAFT_EDITORIAL_VERSION =
  "monster-lair-graft-editorial-v1.0";

const RULES_VERSION = "monster-graft-rules-v1.16";
const PROGRESSION_VERSION = "monster-graft-progression-v1.0";
const LAIR_TRIGGER = "On initiative count 20 (losing initiative ties).";

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

function lairPulseDamage({
  types,
  budgetShare = 0.35,
  expectedTargets = 1.25,
  scale = "minor",
} = {}) {
  return {
    mode: "budget",
    budgetRole: "lairPulse",
    types,
    scale,
    budgetShare,
    expectedTargets,
    roundWeight: [1, 1, 1],
    parts: [],
  };
}

function lairRules({
  resolution = { type: "automatic" },
  targeting = { type: "area", shape: "custom", targets: "creatures in the selected area" },
  areaEffect = disabledStructure(),
  damage = noDamage(),
  condition = noCondition(),
  text = {},
  procedure = disabledStructure(),
  effects = [],
} = {}) {
  return {
    schemaVersion: RULES_VERSION,
    section: "lairAction",
    actionEconomy: "lairAction",
    usage: { type: "lair" },
    trigger: LAIR_TRIGGER,
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
    summon: disabledStructure(),
    procedure,
    references: [],
    ongoing: disabledStructure(),
    effects,
  };
}

function lairRoutine(abilityId) {
  return {
    mode: "procedure",
    defaultPlan:
      "Resolve this Lair Effect on initiative count 20 only when its anchor, area, and player answers are present in the encounter.",
    targetSelection:
      "Choose the authored terrain anchor or area that changes the most meaningful route without removing every safe position.",
    defaultSequence: [abilityId],
    opener: [abilityId],
    intentionalRepetition: false,
    repetitionReason: "",
    alternatives: [],
    nonMultiattackReason:
      "A Lair Effect resolves on initiative count 20 and never participates in the monster's Multiattack.",
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

function profile({ decision = 2, branches = 2, tracking = 1 } = {}) {
  return {
    decisionLoad: decision,
    sequencing: 1,
    conditionalBranches: branches,
    tracking,
    authoredComplexity: Math.max(decision, branches, tracking),
  };
}

function spike({ control = 2, damage = 0, repeatability = 2 } = {}) {
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
    phase: "phase6r-lair-editorial-review",
    version: MONSTER_LAIR_GRAFT_EDITORIAL_VERSION,
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
    danger: { recommended: ["hard", "horror"] },
    tiers: { recommended: ["boss", "setpiece"] },
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
    slot: "lair",
    section: "lairAction",
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
    routine: lairRoutine(ability.id),
    progression,
    fit: fit({ encounterRoles: roleBias, tacticalRoles }),
    complexityProfile,
    counterplayProfile,
    spikeRiskProfile,
    editorial: editorial(decision, rationale),
  };
}

function radiusProgression({ idPrefix, abilityId, bands, textBuilder, patchBuilder = null }) {
  return {
    schemaVersion: PROGRESSION_VERSION,
    basis: "targetCr",
    scalingPolicy: "authored-rule-patches",
    bands: bands.map(({ id, minCr, maxCr, radius }) => {
      const mechanics = textBuilder(radius);
      const extraRules = patchBuilder ? patchBuilder(radius) : {};
      return {
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
              areaEffect: { size: radius, text: mechanics },
              text: { effect: mechanics },
              procedure: {
                enabled: true,
                type: "custom",
                prerequisite: LAIR_TRIGGER,
                text: mechanics,
              },
              ...extraRules,
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      };
    }),
  };
}

const chokingAirText = (radius) =>
  `On initiative count 20, the monster chooses a point on the floor within 60 feet that contains a corpse, drain, vent, or standing fluid. A ${radius}-foot-radius cloud of low, visibly thick air fills that area until initiative count 20 on the next round. The area is Lightly Obscured. A breathing creature that starts its turn in the cloud makes a Constitution saving throw. On a failed save, its Speed is reduced by 10 feet and it can't take Reactions until the start of its next turn. A creature at least 5 feet above the floor automatically succeeds. A creature that doesn't need to breathe is unaffected. Opening or destroying an exterior door, window, or vent connected to the cloud ends the effect.`;

const funeralSilenceText = (radius) =>
  `On initiative count 20, the monster chooses one visible funerary object, grave marker, shroud, or corpse within 60 feet. Until initiative count 20 on the next round, a ${radius}-foot-radius Sphere centered on that anchor is silent. No sound can be created within or pass through the area. A creature entirely inside it has the Deafened condition and can't cast a spell with a Verbal component. Moving the anchor at least 10 feet, covering it completely, or dealing Radiant damage to it ends the effect.`;

const broodmotherWebText = (size) =>
  `On initiative count 20, the monster creates a mass of webbing in a ${size}-foot Cube at a point it can see within 60 feet. Each creature in the Cube that lacks Web Walker makes a Dexterity saving throw. On a failed save, a creature has the Restrained condition until it escapes or its section of web is destroyed. A restrained creature can take an action to make a Strength (Athletics) check against the monster's save DC, ending the condition on itself on a success. A 5-foot section of web has AC 10, 5 Hit Points, vulnerability to Fire damage, and immunity to Poison and Psychic damage. The monster can maintain only one Broodmother Web; creating another destroys the previous one, and it can't use another Lair Effect while this web remains.`;

const LAIR_GRAFTS = {
  "choking-air": graftBase({
    title: "Choking Air",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["boss"],
    cost: 5,
    complexity: 2,
    stats: { control: 2, fairness: 3 },
    summary:
      "Rotten air pools around a visible low anchor, suppressing movement and reactions until the chamber is ventilated.",
    mechanics: chokingAirText(15),
    counterplay:
      "The cloud hugs the floor and bubbles from a visible vent, corpse, drain, or pool; climb, leave, ventilate the room, or use a creature that does not breathe.",
    tags: ["low-cloud", "breathing-hazard", "ventilation", "reaction-pressure"],
    identity: {
      fantasy: "The chamber exhales decomposition through drains, bodies, and wet stone like a failing lung.",
      tacticalRole:
        "Temporary low-ground denial that taxes speed and reactions without affecting elevated or nonbreathing creatures.",
      signature:
        "A floor-hugging cloud can be escaped vertically or ended by opening the room to outside air.",
      recognitionTags: ["failing-lung", "floor-cloud", "visible-vent", "vertical-answer"],
    },
    ability: {
      id: "choking-air",
      title: "Choking Air",
      section: "lairAction",
      summary: "A low cloud of rotten air forms around a visible anchor.",
      mechanics: chokingAirText(15),
      counterplay: "Climb above the cloud, leave it, open the chamber, or rely on a creature that does not breathe.",
      rules: lairRules({
        resolution: { type: "savingThrow", ability: "constitution", dc: "monster" },
        targeting: {
          type: "area",
          shape: "radius",
          size: 15,
          unit: "ft",
          range: 60,
          targets: "breathing creatures that start their turns in the cloud",
        },
        areaEffect: {
          enabled: true,
          type: "hazard",
          shape: "radius",
          size: 15,
          unit: "ft",
          origin: "point",
          timing: "initiativeCount20",
          repeatTiming: "startsTurnInArea",
          targets: "breathing creatures",
          excludes: ["creatures at least 5 feet above the floor", "creatures that do not need to breathe"],
          text: chokingAirText(15),
        },
        text: {
          failure: "The target's Speed is reduced by 10 feet, and it can't take Reactions until the start of its next turn.",
          success: "No effect.",
          effect: chokingAirText(15),
        },
        procedure: {
          enabled: true,
          type: "custom",
          prerequisite: LAIR_TRIGGER,
          escapeCondition: "Leave the cloud or move at least 5 feet above the floor.",
          releaseCondition: "Open or destroy a connected exterior door, window, or vent.",
          text: chokingAirText(15),
        },
      }),
      tags: ["constitution-save", "low-ground", "lightly-obscured", "ventilation"],
      authored: true,
    },
    progression: radiusProgression({
      idPrefix: "choking-air",
      abilityId: "choking-air",
      bands: [
        { id: "cr-0-7-stale-pocket", minCr: 0, maxCr: 7, radius: 10 },
        { id: "cr-8-14-choking-room", minCr: 8, maxCr: 14, radius: 15 },
        { id: "cr-15-30-dead-atmosphere", minCr: 15, maxCr: 30, radius: 20 },
      ],
      textBuilder: chokingAirText,
    }),
    counterplayProfile: {
      telegraphs: ["The selected floor anchor bubbles, exhales, and gathers a visible layer of dense air before the pulse resolves."],
      positioningAnswers: ["Climb at least five feet above the floor or leave the selected radius before starting a turn there."],
      breakConditions: ["Opening or destroying a connected exterior door, window, or vent disperses the cloud immediately."],
      nonDamageAnswers: ["Elevation, ventilation, forced movement, sealed breathing, and creatures that do not breathe all answer the effect."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 2 }),
    decision: "REWRITE_AND_SCALE_LOW_GROUND_HAZARD",
    rationale:
      "The legacy area only removed reactions and offered almost no spatial answer. The rewrite makes the air visibly floor-bound, adds vertical and ventilation answers, and scales only the radius.",
    tacticalRoles: ["controller", "brute", "support"],
  }),

  "corpse-pressure-room": graftBase({
    title: "Pressure Corpses",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["boss"],
    cost: 6,
    complexity: 3,
    stats: { control: 2, dpr: 2, fairness: 3 },
    summary:
      "Visible corpses inflate into short-lived poison mines that can be avoided, vented, or destroyed with the correct damage before they burst.",
    mechanics:
      "On initiative count 20, the monster chooses up to two intact corpses or substantial body parts it can see within 60 feet. Each chosen corpse visibly swells until initiative count 20 on the next round. The first creature other than the monster that enters or starts its turn within 5 feet of a pressure corpse triggers it and makes a Constitution saving throw. On a failed save, the creature takes {damage} Poison damage and has the Poisoned condition until the start of its next turn. On a successful save, it takes half as much damage only. Fire or Radiant damage destroys a pressure corpse harmlessly; any other damage triggers it immediately. A creature adjacent to one can take an action and succeed on a Medicine check against the monster's save DC to vent it harmlessly.",
    counterplay:
      "Each selected corpse swells and whistles before becoming dangerous; route around it, vent it with Medicine, or burn or consecrate it from range.",
    tags: ["corpse-mine", "poison-burst", "medicine-interaction", "safe-damage-types"],
    identity: {
      fantasy: "The lair pumps grave gas into its dead until the remains become biological pressure mines.",
      tacticalRole:
        "Short-lived anchored hazards that threaten routes but reward target selection, damage-type choice, and object interaction.",
      signature:
        "Marked corpses whistle and swell; Fire, Radiant damage, or Medicine can neutralize them without a burst.",
      recognitionTags: ["swelling-corpse", "whistling-gas", "poison-mine", "safe-venting"],
    },
    ability: {
      id: "pressure-corpses",
      title: "Pressure Corpses",
      section: "lairAction",
      summary: "The lair arms visible remains as temporary poison mines.",
      mechanics:
        "On initiative count 20, the monster chooses up to two intact corpses or substantial body parts it can see within 60 feet. Each chosen corpse visibly swells until initiative count 20 on the next round. The first creature other than the monster that enters or starts its turn within 5 feet of a pressure corpse triggers it and makes a Constitution saving throw. On a failed save, the creature takes {damage} Poison damage and has the Poisoned condition until the start of its next turn. On a successful save, it takes half as much damage only. Fire or Radiant damage destroys a pressure corpse harmlessly; any other damage triggers it immediately. A creature adjacent to one can take an action and succeed on a Medicine check against the monster's save DC to vent it harmlessly.",
      counterplay: "Avoid marked corpses, vent them with Medicine, or use Fire or Radiant damage to destroy them safely.",
      rules: lairRules({
        resolution: { type: "savingThrow", ability: "constitution", dc: "monster" },
        targeting: {
          type: "area",
          shape: "radius",
          size: 5,
          unit: "ft",
          range: 60,
          targets: "the first creature other than the monster to enter or start within 5 feet of each selected corpse",
        },
        areaEffect: {
          enabled: true,
          type: "hazard",
          shape: "radius",
          size: 5,
          unit: "ft",
          origin: "location",
          timing: "initiativeCount20",
          repeatTiming: "entersArea",
          targets: "one creature per pressure corpse",
          excludes: ["the monster"],
          text:
            "Up to two selected corpses remain armed until initiative count 20 on the next round or until triggered or neutralized.",
        },
        damage: lairPulseDamage({ types: ["poison"], budgetShare: 0.4, expectedTargets: 1.25 }),
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
          failure: "The target takes {damage} Poison damage and has the Poisoned condition until the start of its next turn.",
          success: "The target takes half as much damage only.",
          effect:
            "Fire or Radiant damage destroys a pressure corpse harmlessly. Other damage triggers it. An adjacent creature can take an action and succeed on a Medicine check against the monster's save DC to vent it harmlessly.",
        },
        procedure: {
          enabled: true,
          type: "custom",
          targetLimit: "up to two intact corpses or substantial body parts",
          prerequisite: LAIR_TRIGGER,
          entryEffect: "Each selected corpse visibly swells and becomes a 5-foot-radius triggered hazard.",
          escapeCondition: "Avoid the corpse until the next initiative count 20.",
          releaseCondition: "Vent it with Medicine or destroy it with Fire or Radiant damage.",
          text:
            "Select the corpses, mark their 5-foot hazard areas, and remove each marker when it bursts, is vented, or is safely destroyed.",
        },
      }),
      tags: ["constitution-save", "lair-pulse-damage", "object-hazard", "poisoned"],
      authored: true,
    },
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "pressure-corpses-cr-0-7-single-mine",
          minCr: 0,
          maxCr: 7,
          abilityIds: ["pressure-corpses"],
          defaultSequence: ["pressure-corpses"],
          abilityPatches: {
            "pressure-corpses": {
              mechanics:
                "On initiative count 20, the monster arms one visible intact corpse or substantial body part within 60 feet as a pressure corpse until the next initiative count 20. The first creature other than the monster that enters or starts within 5 feet triggers it and makes a Constitution saving throw. On a failure, it takes {damage} Poison damage and is Poisoned until the start of its next turn; on a success, it takes half damage only. Fire or Radiant damage and a successful Medicine action neutralize it harmlessly.",
              rules: {
                targeting: { targets: "the first creature other than the monster to enter or start within 5 feet of the selected corpse" },
                areaEffect: { targets: "one creature from one pressure corpse" },
                procedure: { targetLimit: "one intact corpse or substantial body part" },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "pressure-corpses-cr-8-14-paired-mines",
          minCr: 8,
          maxCr: 14,
          abilityIds: ["pressure-corpses"],
          defaultSequence: ["pressure-corpses"],
          abilityPatches: {
            "pressure-corpses": {
              mechanics:
                "On initiative count 20, the monster arms up to two visible intact corpses or substantial body parts within 60 feet as pressure corpses until the next initiative count 20. The first creature other than the monster that enters or starts within 5 feet of each triggers it and makes a Constitution saving throw. On a failure, it takes {damage} Poison damage and is Poisoned until the start of its next turn; on a success, it takes half damage only. Fire or Radiant damage and a successful Medicine action neutralize a corpse harmlessly.",
              rules: {
                targeting: { targets: "the first creature other than the monster to enter or start within 5 feet of each selected corpse" },
                areaEffect: { targets: "one creature from each of up to two pressure corpses" },
                procedure: { targetLimit: "up to two intact corpses or substantial body parts" },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "pressure-corpses-cr-15-30-corpse-field",
          minCr: 15,
          maxCr: 30,
          abilityIds: ["pressure-corpses"],
          defaultSequence: ["pressure-corpses"],
          abilityPatches: {
            "pressure-corpses": {
              mechanics:
                "On initiative count 20, the monster arms up to three visible intact corpses or substantial body parts within 60 feet as pressure corpses until the next initiative count 20. The first creature other than the monster that enters or starts within 5 feet of each triggers it and makes a Constitution saving throw. On a failure, it takes {damage} Poison damage and is Poisoned until the start of its next turn; on a success, it takes half damage only. Fire or Radiant damage and a successful Medicine action neutralize a corpse harmlessly.",
              rules: {
                targeting: { targets: "the first creature other than the monster to enter or start within 5 feet of each selected corpse" },
                areaEffect: { targets: "one creature from each of up to three pressure corpses" },
                procedure: { targetLimit: "up to three intact corpses or substantial body parts" },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    counterplayProfile: {
      telegraphs: ["Each selected corpse visibly inflates, whistles, and leaks colored vapor before it can trigger."],
      positioningAnswers: ["Route around the marked five-foot areas or use forced movement to place enemies beside them instead."],
      breakConditions: ["A pressure corpse disappears after one trigger, at the next initiative count 20, or when safely neutralized."],
      nonDamageAnswers: ["An adjacent Medicine action vents the corpse; Fire or Radiant damage destroys it without a burst."],
    },
    complexityProfile: profile({ decision: 3, branches: 3, tracking: 2 }),
    spikeRiskProfile: spike({ control: 2, damage: 2, repeatability: 2 }),
    decision: "REWRITE_AND_SCALE_CORPSE_MINEFIELD",
    rationale:
      "The legacy effect described a small burst but never defined damage, telegraph, safe destruction, or a target cap. The rewrite creates finite corpse mines and scales only how many can be armed.",
    tacticalRoles: ["controller", "artillery", "support"],
  }),

  "funeral-silence-lair": graftBase({
    title: "Funeral Silence",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 3, fairness: 3 },
    summary:
      "A visible funerary anchor swallows sound in a bounded area until it is moved, covered, or consecrated.",
    mechanics: funeralSilenceText(20),
    counterplay:
      "The chosen object darkens and nearby echoes collapse toward it; leave the radius, move or cover the anchor, or strike it with Radiant damage.",
    tags: ["silence-zone", "funerary-anchor", "verbal-components", "movable-object"],
    identity: {
      fantasy: "The lair turns a grave object into a mouth that consumes prayer, warning, and the names of the dead.",
      tacticalRole:
        "Anchored anti-communication zone that pressures verbal spellcasting but leaves clear movement and object answers.",
      signature:
        "Silence radiates from one movable funerary anchor rather than blanketing the entire encounter.",
      recognitionTags: ["swallowed-echo", "darkened-marker", "silent-sphere", "movable-anchor"],
    },
    ability: {
      id: "funeral-silence",
      title: "Funeral Silence",
      section: "lairAction",
      summary: "A funerary anchor creates a temporary sphere of absolute silence.",
      mechanics: funeralSilenceText(20),
      counterplay: "Leave the sphere, move or cover its anchor, or deal Radiant damage to the anchor.",
      rules: lairRules({
        targeting: {
          type: "area",
          shape: "radius",
          size: 20,
          unit: "ft",
          range: 60,
          targets: "creatures entirely inside the silent sphere",
        },
        areaEffect: {
          enabled: true,
          type: "zone",
          shape: "radius",
          size: 20,
          unit: "ft",
          origin: "location",
          timing: "initiativeCount20",
          repeatTiming: "whileInArea",
          targets: "creatures entirely inside the sphere",
          excludes: [],
          text: funeralSilenceText(20),
        },
        condition: {
          names: ["deafened"],
          severity: "moderate",
          direction: "enemy",
          duration: "while entirely inside the silent sphere",
          special: ["A creature entirely inside the sphere can't cast a spell with a Verbal component."],
          sizeLimit: "",
          escape: null,
          repeatSave: null,
        },
        text: { effect: funeralSilenceText(20) },
        procedure: {
          enabled: true,
          type: "custom",
          prerequisite: LAIR_TRIGGER,
          escapeCondition: "Leave the sphere.",
          releaseCondition: "Move the anchor 10 feet, cover it completely, or deal Radiant damage to it.",
          text: funeralSilenceText(20),
        },
      }),
      tags: ["deafened", "spellcasting-pressure", "object-anchor", "radiant-answer"],
      authored: true,
    },
    progression: radiusProgression({
      idPrefix: "funeral-silence",
      abilityId: "funeral-silence",
      bands: [
        { id: "cr-0-7-hushed-grave", minCr: 0, maxCr: 7, radius: 10 },
        { id: "cr-8-14-funeral-sphere", minCr: 8, maxCr: 14, radius: 20 },
        { id: "cr-15-30-silenced-sanctuary", minCr: 15, maxCr: 30, radius: 30 },
      ],
      textBuilder: funeralSilenceText,
    }),
    counterplayProfile: {
      telegraphs: ["The selected grave object darkens, loose cloth turns toward it, and every echo bends inward before sound vanishes."],
      positioningAnswers: ["Leave the sphere before casting or communicate and cast from opposite sides of its boundary."],
      breakConditions: ["Moving the anchor ten feet, covering it completely, or dealing Radiant damage to it ends the silence."],
      nonDamageAnswers: ["Carry, overturn, wrap, obscure, or otherwise manipulate the funerary anchor instead of attacking the monster."],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 2 }),
    decision: "REWRITE_AND_SCALE_ANCHORED_SILENCE",
    rationale:
      "The legacy spellcasting ability check was noncanonical and made the zone hard to adjudicate. The rewrite uses a clear silence effect, a visible movable anchor, and radius-only scaling.",
    tacticalRoles: ["controller", "support", "lurker"],
  }),

  "graveyard-offerings-lair": graftBase({
    title: "Graveyard Offerings",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["boss", "standard"],
    cost: 4,
    complexity: 2,
    stats: { control: 2, fairness: 3 },
    summary:
      "One disturbed corpse or grave offering becomes a spectral lure that drags nearby creatures until the dead are acknowledged.",
    mechanics:
      "On initiative count 20, the monster chooses one visible corpse, grave good, offering bowl, or funerary object within 60 feet. Until initiative count 20 on the next round, spectral mourners circle it in a 10-foot-radius area. A creature that starts its turn in the area makes a Wisdom saving throw. On a failed save, it is pulled up to 10 feet toward the anchor and can't take Reactions until the start of its next turn. The effect ends if the anchor is moved out of the area, returned to its grave, or joined by a respectful offering placed with an action.",
    counterplay:
      "The selected object is surrounded by visible kneeling shades; leave the radius, move or return the anchor, or spend an action placing food, coin, flowers, or another grave offering.",
    tags: ["spectral-lure", "forced-movement", "funerary-ritual", "respectful-offering"],
    identity: {
      fantasy: "The neglected dead use grave goods and stolen remains to demand recognition from anyone nearby.",
      tacticalRole:
        "Short-lived pull zone with an explicit ritual answer that rewards interacting with the fiction rather than only dealing damage.",
      signature:
        "A respectful offering or restoration of the disturbed grave ends the spectral pull immediately.",
      recognitionTags: ["kneeling-shades", "grave-good", "ritual-lure", "respectful-answer"],
    },
    ability: {
      id: "graveyard-offerings",
      title: "Graveyard Offerings",
      section: "lairAction",
      summary: "A disturbed funerary anchor becomes a spectral pull zone.",
      mechanics:
        "On initiative count 20, the monster chooses one visible corpse, grave good, offering bowl, or funerary object within 60 feet. Until initiative count 20 on the next round, spectral mourners circle it in a 10-foot-radius area. A creature that starts its turn in the area makes a Wisdom saving throw. On a failed save, it is pulled up to 10 feet toward the anchor and can't take Reactions until the start of its next turn. The effect ends if the anchor is moved out of the area, returned to its grave, or joined by a respectful offering placed with an action.",
      counterplay: "Leave the area, move or restore the anchor, or place a respectful offering with an action.",
      rules: lairRules({
        resolution: { type: "savingThrow", ability: "wisdom", dc: "monster" },
        targeting: {
          type: "area",
          shape: "radius",
          size: 10,
          unit: "ft",
          range: 60,
          targets: "creatures that start their turns in the mourners' area",
        },
        areaEffect: {
          enabled: true,
          type: "zone",
          shape: "radius",
          size: 10,
          unit: "ft",
          origin: "location",
          timing: "initiativeCount20",
          repeatTiming: "startsTurnInArea",
          targets: "creatures",
          excludes: [],
          text:
            "Spectral mourners fill a 10-foot-radius area around one selected funerary anchor until initiative count 20 on the next round.",
        },
        text: {
          failure: "The target is pulled up to 10 feet toward the anchor and can't take Reactions until the start of its next turn.",
          success: "No effect.",
          effect:
            "Moving or restoring the anchor, or placing a respectful offering beside it with an action, ends the effect.",
        },
        procedure: {
          enabled: true,
          type: "custom",
          prerequisite: LAIR_TRIGGER,
          entryEffect: "Spectral mourners circle the selected funerary anchor.",
          escapeCondition: "Leave the 10-foot-radius area.",
          releaseCondition: "Move or restore the anchor, or place a respectful offering beside it with an action.",
          text:
            "A respectful offering can be food, coin, flowers, incense, a grave good, or another culturally appropriate funerary object.",
        },
      }),
      tags: ["wisdom-save", "pull", "reaction-loss", "ritual-interaction"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["Visible shades kneel around the chosen object and reach toward nearby living creatures before the pull begins."],
      positioningAnswers: ["Leave the ten-foot radius or stand where being pulled toward the anchor does not expose a dangerous route."],
      breakConditions: ["Moving or restoring the anchor, or placing a respectful offering beside it, ends the effect immediately."],
      nonDamageAnswers: ["Food, coin, flowers, incense, grave goods, burial rites, and careful relocation all satisfy the dead."],
    },
    complexityProfile: profile({ decision: 3, branches: 2, tracking: 1 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 2 }),
    decision: "REWRITE_AS_RITUAL_LURE",
    rationale:
      "The legacy lure prescribed movement but offered only vague object handling. The rewrite defines forced movement, a visible anchor, and a culturally flexible offering procedure that ends the effect.",
    tacticalRoles: ["controller", "support", "brute"],
  }),

  "sticky-surroundings": graftBase({
    title: "Snapping Webs",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 5,
    complexity: 2,
    stats: { control: 3, fairness: 3 },
    summary:
      "Two visible patches of taut web become one-use restraint traps instead of imposing a blanket Dexterity penalty across the entire lair.",
    mechanics:
      "On initiative count 20, the monster chooses up to two visible 10-foot Squares of existing web within 60 feet. Each square tightens until initiative count 20 on the next round. The first creature without Web Walker that enters or starts its turn in each square makes a Dexterity saving throw. On a failed save, the creature has the Restrained condition until the start of its next turn. After a square triggers, it loses its tension and can't trigger again. Before it triggers, a creature adjacent to the square can use an action and a blade to cut it, or any Fire damage dealt to the square disables it.",
    counterplay:
      "The chosen squares pull visibly taut; use cleared stone, fly or climb around them, cut a square with an action, or burn it before entering.",
    tags: ["one-use-trap", "web-square", "restrained", "cut-or-burn"],
    identity: {
      fantasy: "The nest plucks two prepared sheets of silk tight like sprung animal snares.",
      tacticalRole:
        "Telegraphed one-use route traps that punish careless movement without applying a global penalty.",
      signature:
        "Each marked square can restrain only its first victim and can be visibly cut or burned before it fires.",
      recognitionTags: ["taut-square", "snapping-silk", "one-use-snare", "visible-trap"],
    },
    ability: {
      id: "snapping-webs",
      title: "Snapping Webs",
      section: "lairAction",
      summary: "Two existing web patches become temporary one-use snares.",
      mechanics:
        "On initiative count 20, the monster chooses up to two visible 10-foot Squares of existing web within 60 feet. Each square tightens until initiative count 20 on the next round. The first creature without Web Walker that enters or starts its turn in each square makes a Dexterity saving throw. On a failed save, the creature has the Restrained condition until the start of its next turn. After a square triggers, it loses its tension and can't trigger again. Before it triggers, a creature adjacent to the square can use an action and a blade to cut it, or any Fire damage dealt to the square disables it.",
      counterplay: "Avoid the marked squares, cut one with a blade and an action, or disable it with Fire damage.",
      rules: lairRules({
        resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
        targeting: {
          type: "area",
          shape: "square",
          size: 10,
          unit: "ft",
          range: 60,
          targets: "the first creature without Web Walker to enter or start in each selected square",
        },
        areaEffect: {
          enabled: true,
          type: "hazard",
          shape: "square",
          size: 10,
          unit: "ft",
          origin: "location",
          timing: "initiativeCount20",
          repeatTiming: "entersArea",
          targets: "one creature per selected square",
          excludes: ["creatures with Web Walker"],
          text:
            "Up to two visible squares of existing web remain armed until the next initiative count 20 or until each triggers or is disabled.",
        },
        condition: {
          names: ["restrained"],
          severity: "major",
          direction: "enemy",
          duration: "until the start of its next turn",
          special: ["Each selected square can trigger only once."],
          sizeLimit: "",
          escape: null,
          repeatSave: null,
        },
        text: {
          failure: "The target has the Restrained condition until the start of its next turn.",
          success: "No effect; the square still loses its tension after triggering.",
          effect: "A blade and an action, or any Fire damage, disables an armed square before it triggers.",
        },
        procedure: {
          enabled: true,
          type: "custom",
          targetLimit: "up to two visible 10-foot Squares of existing web",
          prerequisite: LAIR_TRIGGER,
          releaseCondition: "The square triggers once, is cut with an action, takes Fire damage, or reaches the next initiative count 20.",
          text: "Mark each armed square and remove its marker after its first trigger or when it is disabled.",
        },
      }),
      tags: ["dexterity-save", "restrained", "one-use", "web-walker-exclusion"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["The chosen web squares become glossy, straight, and visibly taut before anything enters them."],
      positioningAnswers: ["Use unwebbed routes, elevation, flight, forced movement, or a creature with Web Walker to avoid the snares."],
      breakConditions: ["Each square ends after one trigger, at the next initiative count 20, when cut with an action, or when burned."],
      nonDamageAnswers: ["A creature adjacent to an armed square can use an action and a blade to cut it without entering."],
    },
    complexityProfile: profile({ decision: 3, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 3, repeatability: 1 }),
    decision: "REWRITE_AS_ONE_SHOT_WEB_TRAPS",
    rationale:
      "The legacy version imposed blanket disadvantage throughout the lair. The rewrite creates two visible, finite, one-use traps with route, action, and damage-type answers.",
    tacticalRoles: ["controller", "ambusher", "lurker"],
  }),

  "broodmother-web-lair": graftBase({
    title: "Broodmother Web",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss"],
    cost: 4,
    complexity: 3,
    stats: { control: 3, fairness: 2 },
    summary:
      "The broodmother commits the whole lair to one maintained prison whose sections can be escaped, cut, or burned.",
    mechanics: broodmotherWebText(20),
    counterplay:
      "The broodmother raises its forelimbs and draws visible anchor lines toward the chosen Cube; leave before the pulse, cut a restrained creature free, or burn the web.",
    tags: ["maintained-prison", "restrained", "destructible-web", "lair-commitment"],
    identity: {
      fantasy: "The broodmother pulls every load-bearing strand in the nest into one enormous silken prison.",
      tacticalRole:
        "Large-area restraint that locks the monster out of other Lair Effects until players escape or destroy the prison.",
      signature:
        "Only one prison can exist, and maintaining it consumes the nest's entire lair-action pressure.",
      recognitionTags: ["raised-forelimbs", "anchor-lines", "single-prison", "burnable-sections"],
    },
    ability: {
      id: "broodmother-web",
      title: "Broodmother Web",
      section: "lairAction",
      summary: "The broodmother creates one maintained restraining web prison.",
      mechanics: broodmotherWebText(20),
      counterplay: "Leave the selected Cube before the pulse, escape with Athletics, or destroy the relevant web section.",
      rules: lairRules({
        resolution: { type: "savingThrow", ability: "dexterity", dc: "monster" },
        targeting: {
          type: "area",
          shape: "cube",
          size: 20,
          unit: "ft",
          range: 60,
          targets: "creatures in the selected Cube that lack Web Walker",
        },
        areaEffect: {
          enabled: true,
          type: "zone",
          shape: "cube",
          size: 20,
          unit: "ft",
          origin: "point",
          timing: "initiativeCount20",
          repeatTiming: "whileInArea",
          targets: "creatures without Web Walker",
          excludes: ["creatures with Web Walker"],
          text: broodmotherWebText(20),
        },
        condition: {
          names: ["restrained"],
          severity: "major",
          direction: "enemy",
          duration: "until the creature escapes or its section of web is destroyed",
          special: ["The monster can maintain only one Broodmother Web and can't use another Lair Effect while it remains."],
          sizeLimit: "",
          escape: {
            enabled: true,
            dc: "monster",
            ability: "strength",
            check: "Athletics",
            actionCost: "action",
            text: "A restrained creature can take an action to make a Strength (Athletics) check against the monster's save DC, ending the condition on itself on a success.",
          },
          repeatSave: null,
        },
        text: {
          failure: "The target has the Restrained condition until it escapes or its section of web is destroyed.",
          success: "No effect.",
          effect:
            "A 5-foot section of web has AC 10, 5 Hit Points, vulnerability to Fire damage, and immunity to Poison and Psychic damage. The monster can't use another Lair Effect while this web remains.",
        },
        procedure: {
          enabled: true,
          type: "custom",
          prerequisite: LAIR_TRIGGER,
          escapeCondition: "Succeed on the Athletics escape check or destroy the creature's 5-foot section of web.",
          releaseCondition: "Destroy all relevant sections, create a new Broodmother Web, or end the encounter.",
          text: broodmotherWebText(20),
        },
      }),
      tags: ["dexterity-save", "restrained", "escape-check", "destructible-section"],
      authored: true,
    },
    progression: radiusProgression({
      idPrefix: "broodmother-web",
      abilityId: "broodmother-web",
      bands: [
        { id: "cr-0-7-hunting-net", minCr: 0, maxCr: 7, radius: 10 },
        { id: "cr-8-14-brood-prison", minCr: 8, maxCr: 14, radius: 20 },
        { id: "cr-15-30-nest-collapse", minCr: 15, maxCr: 30, radius: 30 },
      ],
      textBuilder: broodmotherWebText,
    }),
    counterplayProfile: {
      telegraphs: ["The broodmother raises its forelimbs while thick anchor lines pull toward the selected Cube."],
      positioningAnswers: ["Leave the Cube before initiative count 20, spread beyond one Cube, or use a creature with Web Walker."],
      breakConditions: ["Escape with an action, destroy the relevant five-foot web section, or force the monster to abandon the prison."],
      nonDamageAnswers: ["Athletics, cutting tools, fire, forced movement before the pulse, and Web Walker all provide answers."],
    },
    complexityProfile: profile({ decision: 3, branches: 3, tracking: 2 }),
    spikeRiskProfile: spike({ control: 4, repeatability: 1 }),
    decision: "REWRITE_AND_SCALE_MAINTAINED_PRISON",
    rationale:
      "The legacy version referenced Web, mixed maintenance with 24-hour immunity, and did not define section statistics. The rewrite is self-contained, commits the monster to one prison, and scales only Cube size.",
    tacticalRoles: ["controller", "boss", "support"],
  }),

  "dense-web-region": graftBase({
    title: "Dense Webs",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 3,
    complexity: 2,
    stats: { control: 2, fairness: 3 },
    summary:
      "The nest permanently layers selected surfaces with vibration-carrying silk that slows intruders and prevents them from hiding from web-walkers.",
    mechanics:
      "On initiative count 20, the monster chooses one visible 15-foot Square of floor, wall, or ceiling within 60 feet. It becomes a Dense Web region until cleared or burned. The region is Difficult Terrain for creatures without Web Walker. While touching the region, such a creature can't take the Hide action against a creature with Web Walker, which knows its location. The lair can contain no more than two Dense Web regions; creating a third removes the oldest. A creature adjacent to a region can take an action with a blade to clear one 5-foot Square, and Fire damage clears every affected 5-foot Square it touches.",
    counterplay:
      "Fresh layers are visibly thick and connected to the nest's anchor lines; take another route, clear a lane with an action and blade, or burn selected squares.",
    tags: ["persistent-terrain", "vibration-sense", "hide-denial", "clearable-lanes"],
    identity: {
      fantasy: "The lair lays down thick listening silk that turns surfaces into both terrain and a sensory organ.",
      tacticalRole:
        "Persistent but capped battlefield infrastructure that slows routes and exposes hidden movement to web-walkers.",
      signature:
        "Dense regions carry vibration, but players can carve or burn safe five-foot lanes through them.",
      recognitionTags: ["listening-silk", "thick-layer", "known-location", "cut-lane"],
    },
    ability: {
      id: "dense-webs",
      title: "Dense Webs",
      section: "lairAction",
      summary: "The nest creates a persistent vibration-carrying terrain region.",
      mechanics:
        "On initiative count 20, the monster chooses one visible 15-foot Square of floor, wall, or ceiling within 60 feet. It becomes a Dense Web region until cleared or burned. The region is Difficult Terrain for creatures without Web Walker. While touching the region, such a creature can't take the Hide action against a creature with Web Walker, which knows its location. The lair can contain no more than two Dense Web regions; creating a third removes the oldest. A creature adjacent to a region can take an action with a blade to clear one 5-foot Square, and Fire damage clears every affected 5-foot Square it touches.",
      counterplay: "Use another surface, cut a five-foot lane with an action and blade, or clear affected squares with Fire damage.",
      rules: lairRules({
        targeting: {
          type: "area",
          shape: "square",
          size: 15,
          unit: "ft",
          range: 60,
          targets: "creatures touching the selected surface",
        },
        areaEffect: {
          enabled: true,
          type: "regional",
          shape: "square",
          size: 15,
          unit: "ft",
          origin: "location",
          timing: "initiativeCount20",
          repeatTiming: "whileInArea",
          targets: "creatures without Web Walker",
          excludes: ["creatures with Web Walker"],
          text:
            "The selected surface is Difficult Terrain and carries vibrations until its squares are cleared or burned. No more than two Dense Web regions can exist.",
        },
        text: {
          effect:
            "A creature without Web Walker treats the region as Difficult Terrain and can't Hide from a creature with Web Walker while touching it; that creature knows its location. An adjacent creature can clear one 5-foot Square with an action and a blade, and Fire damage clears affected squares it touches.",
        },
        procedure: {
          enabled: true,
          type: "custom",
          targetLimit: "one visible 15-foot Square; no more than two active regions",
          prerequisite: LAIR_TRIGGER,
          releaseCondition: "Clear individual five-foot squares with a blade and an action or with Fire damage.",
          text:
            "Mark no more than two persistent regions. Creating a third removes the oldest region from play.",
        },
      }),
      tags: ["difficult-terrain", "hide-denial", "web-walker", "persistent-region"],
      authored: true,
    },
    counterplayProfile: {
      telegraphs: ["Fresh silk visibly thickens over the selected surface and connects to vibrating anchor threads."],
      positioningAnswers: ["Choose unwebbed floors, walls, ceilings, flight paths, or previously cleared five-foot lanes."],
      breakConditions: ["Individual squares stop functioning when cut or burned; only two complete regions can exist at once."],
      nonDamageAnswers: ["A creature with a blade can spend an action to clear one five-foot Square and create a reusable safe lane."],
    },
    complexityProfile: profile({ decision: 3, branches: 2, tracking: 2 }),
    spikeRiskProfile: spike({ control: 2, repeatability: 3 }),
    decision: "REWRITE_AS_PERSISTENT_VIBRATION_TERRAIN",
    rationale:
      "The legacy terrain was indefinite but underspecified and included an unrelated advantage clause against surprised targets. The rewrite caps active regions and defines route, Hide, blade, and Fire interactions.",
    tacticalRoles: ["controller", "ambusher", "lurker"],
  }),
};

export const MONSTER_LAIR_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(LAIR_GRAFTS),
);

export const MONSTER_LAIR_GRAFT_SCALED_IDS = Object.freeze([
  "choking-air",
  "corpse-pressure-room",
  "funeral-silence-lair",
  "broodmother-web-lair",
]);

export function getMonsterLairGraftEditorialOverride(graftId = "") {
  return LAIR_GRAFTS[String(graftId || "").trim()] || null;
}
