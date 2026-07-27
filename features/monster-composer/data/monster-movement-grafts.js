export const MONSTER_MOVEMENT_GRAFT_EDITORIAL_VERSION =
  "monster-movement-graft-editorial-v1.0";

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

function movementRules({
  section = "trait",
  actionEconomy = "passive",
  usage = { type: "passive" },
  trigger = null,
  targeting = { type: "self", targets: "the creature" },
  text,
  procedure = null,
  effects = [],
  condition = noCondition(),
  counterplay = {},
} = {}) {
  return {
    schemaVersion: RULES_VERSION,
    section,
    actionEconomy,
    usage,
    trigger,
    resolution: { type: "automatic" },
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
    text: { effect: text },
    multiattack: disabledStructure(),
    spellcasting: disabledStructure(),
    defense: disabledStructure(),
    summon: disabledStructure(),
    procedure: procedure
      ? {
          enabled: true,
          type: "custom",
          prerequisite: procedure.prerequisite || "",
          text,
          ...procedure,
        }
      : disabledStructure(),
    references: [],
    ongoing: disabledStructure(),
    effects: [],
  };
}

function traitRules(options = {}) {
  return movementRules(options);
}

function bonusActionRules({ text, trigger = null, usage, procedure, effects = [], condition = noCondition() }) {
  return movementRules({
    section: "bonusAction",
    actionEconomy: "bonusAction",
    usage: usage || { type: "atWill" },
    trigger,
    text,
    procedure: {
      prerequisite: trigger || procedure?.prerequisite || "",
      ...procedure,
    },
    effects,
    condition,
  });
}

function movementEffect(text, weight = 1) {
  return {
    id: "movement-state",
    type: "movement",
    subject: "self",
    trigger: "",
    appliesTo: "the creature",
    duration: "",
    text,
    simulation: {
      policy: "proxy",
      model: "feature.stats.mobility",
      axis: "mobility",
      weight,
    },
  };
}

function movementRoutine(
  defaultPlan,
  targetSelection,
  sequence = [],
  alternatives = [],
  opener = [],
) {
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
      "This Movement Graft defines routes, approach, and disengagement rather than the monster's attack routine.",
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
    phase: "phase6r-movement-editorial-review",
    version: MONSTER_MOVEMENT_GRAFT_EDITORIAL_VERSION,
    decision,
    rationale,
    reviewedAt: "2026-07-26",
  };
}

function profile({ decision = 1, sequencing = 1, branches = 1, tracking = 0 }) {
  return {
    decisionLoad: decision,
    sequencing,
    conditionalBranches: branches,
    tracking,
    authoredComplexity: Math.max(decision, sequencing, branches, tracking),
  };
}

function spike({ control = 0, repeatability = 2 }) {
  return {
    openingBurst: 0,
    controlSpike: control,
    damageSpike: 0,
    repeatability,
  };
}

const MOVEMENT_GRAFTS = {
  "stumbling-mass": {
    title: "Dead March",
    cost: 2,
    complexity: 1,
    stats: { mobility: 1, fairness: 2 },
    summary:
      "The corpse commits to one visible destination and tramples through debris without adjusting its route.",
    mechanics:
      "At the start of its turn, the creature chooses a destination it can see. Until the end of the turn, it follows the shortest passable route toward that destination and cannot willingly change destinations. It ignores nonmagical difficult terrain created by rubble, corpses, mud, or loose bones while moving along that route.",
    counterplay:
      "Its destination and route are obvious; bait the march through hazards, block the shortest lane, or move the destination after it commits.",
    tags: ["committed_route", "terrain_ignore", "predictable_path", "corpse_march"],
    identity: {
      fantasy:
        "A dead mass that advances by momentum rather than awareness, walking through ruin toward one fixed point.",
      tacticalRole:
        "Predictable approach pattern that ignores common terrain but gives players control over its route.",
      signature:
        "It commits to one destination each turn and cannot correct the route after movement begins.",
      recognitionTags: ["dead-march", "fixed-route", "terrain-trample", "baitable-path"],
    },
    abilities: [
      {
        id: "dead-march",
        title: "Dead March",
        section: "trait",
        summary: "The creature commits to a visible destination and ignores debris on the route.",
        mechanics:
          "At the start of its turn, the creature chooses a destination it can see. Until the end of the turn, it follows the shortest passable route toward that destination and cannot willingly change destinations. It ignores nonmagical difficult terrain created by rubble, corpses, mud, or loose bones while moving along that route.",
        counterplay:
          "Move the destination, obstruct the shortest route, or place a hazard in the lane after the creature commits.",
        rules: traitRules({
          text:
            "At the start of its turn, the monster chooses a destination it can see. Until the end of the turn, it follows the shortest passable route toward that destination and cannot willingly change destinations. It ignores nonmagical difficult terrain created by rubble, corpses, mud, or loose bones while moving along that route.",
          procedure: {
            prerequisite: "At the start of the monster's turn.",
          },
          effects: [
            movementEffect(
              "The monster ignores specified nonmagical difficult terrain while following its committed route.",
            ),
          ],
        }),
        tags: ["movement-pattern", "committed-route", "difficult-terrain", "telegraphed"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Choose one visible destination, announce the shortest route, and spend movement following it even when a safer path exists.",
      "A visible enemy, doorway, corpse, or objective that creates the clearest committed lane.",
      ["dead-march"],
    ),
    complexityProfile: profile({ decision: 1, branches: 1 }),
    counterplayProfile: {
      telegraphs: ["The corpse turns its whole body toward one destination before it starts moving."],
      positioningAnswers: ["Stand where the shortest route crosses hazards, chokepoints, or prepared reactions."],
      breakConditions: ["Block the shortest passable route or remove the chosen destination from sight."],
      nonDamageAnswers: ["Use illusions, moving objects, doors, or bait to redirect the next committed march."],
    },
    spikeRiskProfile: spike({}),
    editorial: editorial(
      "REWRITE_INTO_PATTERN",
      "The original terrain immunity was mechanically thin. Dead March now produces a predictable route decision that the GM can run instantly and the players can manipulate.",
    ),
  },

  "rupture-charge": {
    title: "Rupture Charge",
    cost: 3,
    complexity: 2,
    stats: { mobility: 2, control: 1, fairness: 1 },
    summary:
      "The corpse builds momentum in a straight lane, then crashes into its target while leaving itself exposed.",
    mechanics:
      "As a bonus action, the creature moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 5 feet. After using this movement, the creature cannot take reactions until the start of its next turn.",
    counterplay:
      "Break or occupy the straight lane, force an early collision, or exploit the reactionless window after the charge.",
    tags: ["straight_charge", "momentum", "push", "self_exposure"],
    identity: {
      fantasy: "A swollen corpse that throws its entire failing body into one violent forward rush.",
      tacticalRole:
        "Telegraphed lane attack that converts distance into forced movement while opening a retaliation window.",
      signature: "A straight charge pushes the next target but suppresses the monster's reactions.",
      recognitionTags: ["rupture-charge", "straight-lane", "momentum-push", "reaction-window"],
    },
    abilities: [
      {
        id: "rupture-charge",
        title: "Rupture Charge",
        section: "bonusAction",
        summary: "The creature rushes in a straight line and carries momentum into its next melee hit.",
        mechanics:
          "The creature moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 5 feet. The creature cannot take reactions until the start of its next turn.",
        counterplay:
          "Deny a fifteen-foot lane or punish the creature after it loses its reactions.",
        rules: bonusActionRules({
          text:
            "The monster moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 5 feet. The monster cannot take reactions until the start of its next turn.",
          procedure: {
            prerequisite: "The monster has a straight, passable lane.",
          },
          effects: [
            movementEffect(
              "The monster moves up to half its speed in a straight line without provoking Opportunity Attacks.",
              2,
            ),
          ],
        }),
        tags: ["bonus-action", "charge", "forced-movement", "self-exposure"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Use the charge only when a clear lane reaches a valuable melee target or can push that target out of position.",
      "A target at least 15 feet away along a straight passable lane.",
      ["rupture-charge"],
      [
        {
          id: "lane-denied",
          label: "Lane denied",
          when: "No straight lane of at least 15 feet reaches a useful target.",
          sequence: [],
          notes: "Move normally and preserve the bonus action rather than charging for no positional gain.",
        },
      ],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-7-shove",
          minCr: 0,
          maxCr: 7,
          abilityIds: ["rupture-charge"],
          defaultSequence: ["rupture-charge"],
          abilityPatches: {
            "rupture-charge": {
              mechanics:
                "The creature moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 5 feet. The creature cannot take reactions until the start of its next turn.",
              rules: {
                text: {
                  effect:
                    "The monster moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 5 feet. The monster cannot take reactions until the start of its next turn.",
                },
                procedure: {
                  enabled: true,
                  type: "custom",
                  prerequisite: "The monster has a straight, passable lane.",
                  text:
                    "The monster moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 5 feet. The monster cannot take reactions until the start of its next turn.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-8-30-crash",
          minCr: 8,
          maxCr: 30,
          abilityIds: ["rupture-charge"],
          defaultSequence: ["rupture-charge"],
          abilityPatches: {
            "rupture-charge": {
              mechanics:
                "The creature moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 10 feet. The creature cannot take reactions until the start of its next turn.",
              rules: {
                text: {
                  effect:
                    "The monster moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 10 feet. The monster cannot take reactions until the start of its next turn.",
                },
                procedure: {
                  enabled: true,
                  type: "custom",
                  prerequisite: "The monster has a straight, passable lane.",
                  text:
                    "The monster moves up to half its speed in a straight line without provoking Opportunity Attacks. If it moves at least 15 feet and then hits with a melee attack before the end of the turn, it pushes the target 10 feet. The monster cannot take reactions until the start of its next turn.",
                },
              },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    complexityProfile: profile({ decision: 2, branches: 1 }),
    counterplayProfile: {
      telegraphs: ["The body lowers, swells, and aligns itself with a straight lane before charging."],
      positioningAnswers: ["Stand behind corners, obstacles, allies, or terrain that prevents a fifteen-foot run."],
      breakConditions: ["Interrupt or block the straight lane before the creature completes fifteen feet of movement."],
      nonDamageAnswers: ["Bait the charge into a bad position, then exploit the turn in which it cannot react."],
    },
    spikeRiskProfile: spike({ control: 1 }),
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "The old version depended on an unrelated Unstable reaction and added opaque damage. The revision is self-contained, telegraphed, spatially interactive, and scales only the forced movement.",
    ),
  },

  "collapsed-crawler": {
    title: "Crawling Ruin",
    cost: 2,
    complexity: 1,
    stats: { mobility: 1, fairness: 2 },
    summary:
      "The ruined corpse stays low, squeezes through narrow routes, and cannot be disabled by knocking it down again.",
    mechanics:
      "The creature can move through openings as though it were one size smaller and can move through the spaces of prone or dead creatures, treating those spaces as difficult terrain. It is immune to the Prone condition, but it cannot climb or jump farther than 5 feet.",
    counterplay:
      "Use elevation, gaps, intact doors, or obstacles it cannot crawl beneath instead of relying on repeated prone effects.",
    tags: ["low_crawl", "narrow_route", "prone_immunity", "limited_verticality"],
    identity: {
      fantasy: "A broken corpse that has become a low, dragging shape built for gaps and corpse-choked floors.",
      tacticalRole:
        "Low-route infiltrator that bypasses bodies and narrow openings but loses access to vertical paths.",
      signature: "It crawls through narrow and occupied ground routes but cannot meaningfully climb or jump.",
      recognitionTags: ["crawling-ruin", "low-profile", "narrow-route", "vertical-limit"],
    },
    abilities: [
      {
        id: "low-crawl",
        title: "Low Crawl",
        section: "trait",
        summary: "The creature uses gaps, prone bodies, and corpse piles as movement routes.",
        mechanics:
          "The creature can move through openings as though it were one size smaller and can move through the spaces of prone or dead creatures, treating those spaces as difficult terrain. It is immune to the Prone condition, but it cannot climb or jump farther than 5 feet.",
        counterplay: "Deny low routes with elevation, sealed barriers, and gaps wider than it can cross.",
        rules: traitRules({
          text:
            "The monster can move through openings as though it were one size smaller and can move through the spaces of prone or dead creatures, treating those spaces as difficult terrain. It is immune to the Prone condition, but it cannot climb or jump farther than 5 feet.",
          effects: [movementEffect("The monster can use narrow, corpse-choked ground routes unavailable to ordinary creatures.")],
        }),
        tags: ["crawl", "squeeze", "corpse-terrain", "route-limit"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Approach through the lowest available route, using bodies and narrow gaps as cover from ordinary lines of movement.",
      "A ground-level opening or corpse-choked lane that bypasses the party's front line.",
      ["low-crawl"],
    ),
    complexityProfile: profile({ decision: 1, branches: 1 }),
    counterplayProfile: {
      telegraphs: ["The creature drags itself flat and tests gaps with its hands before entering them."],
      positioningAnswers: ["Use stairs, ledges, pits, or open vertical space to force it onto a worse route."],
      breakConditions: ["Seal or elevate the low route so the creature must climb or jump more than 5 feet."],
      nonDamageAnswers: ["Close doors, move corpses, erect barriers, or create a gap it cannot crawl across."],
    },
    spikeRiskProfile: spike({}),
    editorial: editorial(
      "REWRITE_INTO_ROUTE_PATTERN",
      "The original permanent speed loss created bookkeeping without an interesting decision. Crawling Ruin now gains distinctive low routes and an explicit vertical weakness.",
    ),
  },

  "incorporeal-movement": {
    title: "Ghost Passage",
    cost: 3,
    complexity: 2,
    stats: { mobility: 2, fairness: 1 },
    summary:
      "The spirit passes through a solid barrier, but its cold outline reveals where it intends to emerge.",
    mechanics:
      "The creature can move through creatures and objects as if they were difficult terrain, but it cannot end its turn inside an object. The first time each turn it enters a solid object, a visible frost outline appears on the surface nearest its intended exit and remains until it emerges or the turn ends.",
    counterplay:
      "Watch the frost outline, hold attacks at the exit, force it to change course, or use force effects that punish passage through solid matter.",
    tags: ["incorporeal_route", "wall_passage", "visible_exit", "readied_counterplay"],
    identity: {
      fantasy: "A hungry spirit that crosses solid matter while its cold shape bleeds through the exit surface.",
      tacticalRole:
        "Barrier bypass pattern with a readable exit point that supports held actions and route denial.",
      signature: "Its intended exit becomes visible before it emerges from solid matter.",
      recognitionTags: ["ghost-passage", "wall-route", "frost-outline", "readied-exit"],
    },
    abilities: [
      {
        id: "ghost-passage",
        title: "Ghost Passage",
        section: "trait",
        summary: "The spirit crosses solid barriers while revealing its intended exit.",
        mechanics:
          "The creature can move through creatures and objects as if they were difficult terrain, but it cannot end its turn inside an object. The first time each turn it enters a solid object, a visible frost outline appears on the surface nearest its intended exit and remains until it emerges or the turn ends.",
        counterplay: "Ready an action at the outlined exit or force the spirit to abandon that route.",
        rules: traitRules({
          text:
            "The monster can move through creatures and objects as if they were difficult terrain, but it cannot end its turn inside an object. The first time each turn it enters a solid object, a visible frost outline appears on the surface nearest its intended exit and remains until it emerges or the turn ends.",
          procedure: {
            prerequisite: "The monster enters a creature or solid object during movement.",
          },
          effects: [movementEffect("The monster can cross creatures and solid objects as difficult terrain.", 2)],
        }),
        tags: ["incorporeal", "barrier-bypass", "exit-telegraph", "force-counter"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Use solid barriers to bypass ordinary engagement only when the revealed exit creates a better position than a normal route.",
      "A visible exit surface behind cover, a front line, or a closed barrier.",
      ["ghost-passage"],
    ),
    complexityProfile: profile({ decision: 2, branches: 1, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["A frost-white silhouette appears on the exit surface before the spirit emerges."],
      positioningAnswers: ["Cover the outlined exit, spread readied attacks between likely surfaces, or retreat from the emergence point."],
      breakConditions: ["Force the spirit to change destination or prevent it from ending movement outside the barrier."],
      nonDamageAnswers: ["Use force wards, sealed chambers, readied grapples, or movable barriers to punish the passage."],
    },
    spikeRiskProfile: spike({ control: 1 }),
    editorial: editorial(
      "EXPAND_STANDARD_TRAIT_INTO_PATTERN",
      "Standard incorporeal movement lacked table interaction. The visible exit preserves the ghost fantasy while making wall passage readable and answerable.",
    ),
  },

  "vanish-spirit": {
    title: "Vanish",
    cost: 3,
    complexity: 2,
    stats: { mobility: 2, fairness: 1 },
    summary:
      "The spirit disappears for a brief reposition, leaving breath, dust, and disturbed objects along its path.",
    mechanics:
      "As a bonus action, the creature has the Invisible condition and moves up to half its speed without provoking Opportunity Attacks. The Invisible condition ends when this movement ends, if the creature enters bright light, or immediately after it makes an attack roll. The number of uses scales with CR.",
    counterplay:
      "Flood likely routes with bright light, watch disturbed dust and loose objects, or cover the limited spaces it can reach with half its speed.",
    tags: ["brief_invisibility", "reposition", "bright_light", "limited_route"],
    identity: {
      fantasy: "A shameful spirit that erases itself only long enough to cross the space between hiding places.",
      tacticalRole:
        "Limited reposition tool that breaks engagement but exposes a bounded destination and light-based counterplay.",
      signature: "It becomes invisible only for an immediate half-speed reposition.",
      recognitionTags: ["vanish", "brief-invisibility", "half-speed", "light-counter"],
    },
    abilities: [
      {
        id: "vanish",
        title: "Vanish",
        section: "bonusAction",
        summary: "The spirit gains the Invisible condition for one immediate reposition.",
        mechanics:
          "The creature has the Invisible condition and moves up to half its speed without provoking Opportunity Attacks. The Invisible condition ends when this movement ends, if the creature enters bright light, or immediately after it makes an attack roll.",
        counterplay: "Illuminate likely paths and cover every destination within half the creature's speed.",
        rules: bonusActionRules({
          text:
            "The monster has the Invisible condition and moves up to half its speed without provoking Opportunity Attacks. The Invisible condition ends when this movement ends, if the monster enters bright light, or immediately after it makes an attack roll.",
          usage: { type: "limited", uses: 1, period: "day" },
          condition: {
            names: ["invisible"],
            severity: "moderate",
            direction: "self",
            duration: "until the movement ends, the monster enters bright light, or it makes an attack roll",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          procedure: {
            prerequisite: "The monster is not in bright light.",
          },
          effects: [movementEffect("The monster moves up to half its speed without provoking Opportunity Attacks.", 2)],
        }),
        tags: ["bonus-action", "invisible-movement", "limited-use", "bright-light"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Vanish only to cross an exposed lane, escape engagement, or reach a prepared hiding place within half speed.",
      "A destination outside bright light that changes line of sight or engagement.",
      ["vanish"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        {
          id: "cr-0-4-single-vanish",
          minCr: 0,
          maxCr: 4,
          abilityIds: ["vanish"],
          defaultSequence: ["vanish"],
          abilityPatches: {
            vanish: {
              rules: { usage: { type: "limited", uses: 1, period: "day" } },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-5-12-three-vanishes",
          minCr: 5,
          maxCr: 12,
          abilityIds: ["vanish"],
          defaultSequence: ["vanish"],
          abilityPatches: {
            vanish: {
              rules: { usage: { type: "limited", uses: 3, period: "day" } },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
        {
          id: "cr-13-30-recharging-vanish",
          minCr: 13,
          maxCr: 30,
          abilityIds: ["vanish"],
          defaultSequence: ["vanish"],
          abilityPatches: {
            vanish: {
              rules: { usage: { type: "recharge", recharge: "5-6" } },
            },
          },
          multiattack: { enabled: false, mode: "fixed", count: 0 },
        },
      ],
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["Breath, dust, hanging cloth, and loose objects move along the spirit's invisible route."],
      positioningAnswers: ["Cover every destination within half its speed or remain in overlapping lines of sight."],
      breakConditions: ["Bright light ends the invisibility and prevents the initial use."],
      nonDamageAnswers: ["Scatter powder, water, bells, smoke, or loose debris to reveal the route."],
    },
    spikeRiskProfile: spike({ repeatability: 1 }),
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "The old long-duration invisibility was not a movement pattern and competed with stealth Body/Mind effects. Vanish is now a bounded reposition with visible environmental tells.",
    ),
  },

  "cunning-action-spirit": {
    title: "Cunning Hunt",
    cost: 3,
    complexity: 3,
    stats: { mobility: 2, fairness: 1 },
    summary:
      "The spirit chooses one of three readable movement modes: rush, slip away, or disappear into cover.",
    mechanics:
      "As a bonus action, the creature chooses one option: Rush, moving up to half its speed toward a visible enemy; Slip, moving up to 10 feet without provoking Opportunity Attacks; or Stalk, taking the Hide action if it is obscured or behind cover.",
    counterplay:
      "Deny cover to prevent Stalk, maintain tight formation to reduce Rush, and occupy escape lanes to limit Slip.",
    tags: ["movement_modes", "rush", "disengage", "hide"],
    identity: {
      fantasy: "A calculating spirit that changes footwork according to whether it must close, escape, or disappear.",
      tacticalRole:
        "Three-mode movement pattern that gives the GM a clear positional choice without granting unrestricted Cunning Action.",
      signature: "It chooses Rush, Slip, or Stalk according to the current battlefield state.",
      recognitionTags: ["cunning-hunt", "three-modes", "rush-slip-stalk", "state-choice"],
    },
    abilities: [
      {
        id: "cunning-hunt",
        title: "Cunning Hunt",
        section: "bonusAction",
        summary: "The spirit selects a movement mode suited to approach, escape, or concealment.",
        mechanics:
          "The creature chooses one option: Rush, moving up to half its speed toward a visible enemy; Slip, moving up to 10 feet without provoking Opportunity Attacks; or Stalk, taking the Hide action if it is obscured or behind cover.",
        counterplay: "Remove cover, overlap engagement zones, and keep vulnerable characters close to allies.",
        rules: bonusActionRules({
          text:
            "The monster chooses one option: Rush, moving up to half its speed toward a visible enemy; Slip, moving up to 10 feet without provoking Opportunity Attacks; or Stalk, taking the Hide action if it is obscured or behind cover.",
          procedure: {
            prerequisite: "Choose Rush, Slip, or Stalk when the bonus action is used.",
          },
          effects: [movementEffect("The monster chooses a state-dependent approach, escape, or concealment move.", 2)],
        }),
        tags: ["bonus-action", "choice", "approach", "escape"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Rush when separated from a target, Slip when engaged by multiple enemies, and Stalk only when cover can meaningfully conceal the creature.",
      "The positional state that gives one of the three modes a clear tactical purpose.",
      ["cunning-hunt"],
      [
        { id: "rush", label: "Rush", when: "A useful target is outside melee reach.", sequence: ["cunning-hunt"], notes: "Move toward that target." },
        { id: "slip", label: "Slip", when: "The creature is engaged or threatened by reactions.", sequence: ["cunning-hunt"], notes: "Move through the safest escape lane." },
        { id: "stalk", label: "Stalk", when: "Cover or obscurity can support a legal Hide action.", sequence: ["cunning-hunt"], notes: "Hide and preserve distance." },
      ],
    ),
    complexityProfile: profile({ decision: 3, branches: 3 }),
    counterplayProfile: {
      telegraphs: ["The spirit lowers to rush, turns side-on to slip, or draws darkness around itself to stalk."],
      positioningAnswers: ["Stay in formation, overlap threat zones, and leave no isolated cover routes."],
      breakConditions: ["Remove the cover, destination, or escape lane required by the chosen mode."],
      nonDamageAnswers: ["Use light, readied movement, closed doors, and coordinated spacing to make each mode less valuable."],
    },
    spikeRiskProfile: spike({}),
    editorial: editorial(
      "REWRITE_STANDARD_FEATURE_INTO_PATTERN",
      "Generic Cunning Action was a borrowed class feature. The new three-mode pattern is readable, bounded, and directly tied to encounter positioning.",
    ),
  },

  "wall-crawler": {
    title: "Wall Stalker",
    cost: 3,
    complexity: 2,
    stats: { mobility: 2, fairness: 1 },
    summary:
      "The creature treats connected walls and ceilings as a hunting route, then drops into a new engagement lane.",
    mechanics:
      "The creature has a climb speed equal to its walking speed and can move across walls and ceilings without making an ability check. Once on each of its turns after descending at least 10 feet from a wall or ceiling, it can move up to 10 additional feet on the ground without provoking Opportunity Attacks.",
    counterplay:
      "Pull it into open ground, break or grease the supporting surface, or stand where a drop cannot create a safe landing lane.",
    tags: ["vertical_route", "wall_descent", "landing_lane", "surface_counterplay"],
    identity: {
      fantasy: "A hunter that uses walls and ceilings as approach lanes before dropping into ground combat.",
      tacticalRole:
        "Vertical route pattern that rewards descending approaches but depends on intact surfaces and landing spaces.",
      signature: "A ten-foot descent creates a short reaction-free ground advance.",
      recognitionTags: ["wall-stalker", "vertical-route", "drop-approach", "surface-break"],
    },
    abilities: [
      {
        id: "wall-route",
        title: "Wall Route",
        section: "trait",
        summary: "The creature traverses connected walls and ceilings as normal movement routes.",
        mechanics:
          "The creature has a climb speed equal to its walking speed and can move across walls and ceilings without making an ability check.",
        counterplay: "Deny connected surfaces or force the creature into open ground.",
        rules: traitRules({
          text:
            "The monster has a climb speed equal to its walking speed and can move across walls and ceilings without making an ability check.",
          effects: [movementEffect("The monster gains a climb speed equal to its walking speed.")],
        }),
        tags: ["climb-speed", "wall-route", "ceiling-route", "surface-dependent"],
        authored: true,
      },
      {
        id: "drop-route",
        title: "Drop Route",
        section: "trait",
        summary: "A deliberate descent carries the creature through the landing zone without opening it to reactions.",
        mechanics:
          "Once on each of its turns after descending at least 10 feet from a wall or ceiling, the creature can move up to 10 additional feet on the ground without provoking Opportunity Attacks.",
        counterplay: "Occupy or hazard the landing spaces beneath its surface route.",
        rules: traitRules({
          trigger: "The monster descends at least 10 feet from a wall or ceiling during its turn.",
          text:
            "Once on each of its turns after descending at least 10 feet from a wall or ceiling, the monster can move up to 10 additional feet on the ground without provoking Opportunity Attacks.",
          procedure: {
            prerequisite: "The monster descended at least 10 feet from a wall or ceiling this turn.",
          },
          effects: [movementEffect("The monster moves up to 10 additional feet after a vertical descent.")],
        }),
        tags: ["descent", "landing", "extra-movement", "no-reactions"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Approach along a wall or ceiling, descend at least 10 feet, then use the landing movement to cross the front line or reach cover.",
      "A wall or ceiling route with a safe landing space and a useful ten-foot ground lane.",
      ["wall-route", "drop-route"],
    ),
    complexityProfile: profile({ decision: 2, sequencing: 2, branches: 1 }),
    counterplayProfile: {
      telegraphs: ["The creature chooses and follows a visible overhead route before dropping."],
      positioningAnswers: ["Stand away from walls, deny landing spaces, or hold attacks beneath the chosen route."],
      breakConditions: ["Break, grease, collapse, or separate the surface before the creature completes the descent."],
      nonDamageAnswers: ["Use movable cover, nets, forced movement, or terrain changes to deny the vertical route."],
    },
    spikeRiskProfile: spike({ control: 1 }),
    editorial: editorial(
      "RENAME_AND_EXPAND_INTO_BUNDLE",
      "The original climb speed duplicated a Body chassis. Wall Stalker now describes an approach cycle: traverse vertically, descend, and exploit a landing lane.",
    ),
  },

  "web-dancer": {
    title: "Web Swing",
    cost: 4,
    complexity: 2,
    stats: { mobility: 3, fairness: 1 },
    summary:
      "The creature creates visible web routes between surfaces and swings along them until the strands are cut or burned.",
    mechanics:
      "As a bonus action, the creature creates a web line between itself and a surface within range, then moves along the line up to its remaining speed without provoking Opportunity Attacks. The line remains as a visible fragile object until destroyed, allowing the creature to reuse it as a movement route.",
    counterplay:
      "Cut or burn existing lines, deny anchor surfaces, and cover the visible landing points before the creature swings.",
    tags: ["web_route", "persistent_line", "swing", "destroyable_anchor"],
    identity: {
      fantasy: "A web hunter that builds its own suspended roads across the encounter space.",
      tacticalRole:
        "Persistent route-builder whose mobility grows with intact web lines and collapses when the network is destroyed.",
      signature: "Every swing leaves behind a visible reusable strand that players can sever.",
      recognitionTags: ["web-swing", "persistent-route", "fragile-line", "fire-counter"],
    },
    abilities: [
      {
        id: "cast-line",
        title: "Cast Line",
        section: "bonusAction",
        summary: "The creature creates and immediately travels along a visible web route.",
        mechanics:
          "The creature creates a web line between itself and a surface within 30 feet it can see, then moves along the line up to its remaining speed without provoking Opportunity Attacks. The line remains as a visible fragile object vulnerable to fire until destroyed.",
        counterplay: "Destroy the line before it can become part of a larger route network.",
        rules: bonusActionRules({
          text:
            "The monster creates a web line between itself and a surface within 30 feet it can see, then moves along the line up to its remaining speed without provoking Opportunity Attacks. The line remains as a visible fragile object vulnerable to fire until destroyed.",
          procedure: {
            prerequisite: "A visible surface is within range and can anchor the line.",
          },
          effects: [movementEffect("The monster moves along a newly created web line without provoking Opportunity Attacks.", 3)],
        }),
        tags: ["bonus-action", "web-line", "route-creation", "fragile-object"],
        authored: true,
      },
      {
        id: "web-route",
        title: "Web Route",
        section: "trait",
        summary: "The creature treats its surviving web lines as reusable movement paths.",
        mechanics:
          "The creature can move along any intact web line it created as though the line were a climbable surface. It ignores movement restrictions caused by its own web lines.",
        counterplay: "Sever the connected lines and force the creature back onto ordinary surfaces.",
        rules: traitRules({
          text:
            "The monster can move along any intact web line it created as though the line were a climbable surface. It ignores movement restrictions caused by its own web lines.",
          effects: [movementEffect("The monster can reuse its intact web lines as movement routes.", 2)],
        }),
        tags: ["persistent-route", "web-network", "climbable-line", "destroyable"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Create a line only when it opens a new angle, then reuse surviving lines until players destroy the network.",
      "A visible anchor surface that creates a useful landing point, escape route, or elevation change.",
      ["cast-line", "web-route"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-short-line", minCr: 0, maxCr: 4, range: 30 },
        { id: "cr-5-12-long-line", minCr: 5, maxCr: 12, range: 60 },
        { id: "cr-13-30-vault-line", minCr: 13, maxCr: 30, range: 90 },
      ].map((band) => ({
        ...band,
        abilityIds: ["cast-line", "web-route"],
        defaultSequence: ["cast-line", "web-route"],
        abilityPatches: {
          "cast-line": {
            mechanics: `The creature creates a web line between itself and a surface within ${band.range} feet it can see, then moves along the line up to its remaining speed without provoking Opportunity Attacks. The line remains as a visible fragile object vulnerable to fire until destroyed.`,
            rules: {
              text: {
                effect: `The monster creates a web line between itself and a surface within ${band.range} feet it can see, then moves along the line up to its remaining speed without provoking Opportunity Attacks. The line remains as a visible fragile object vulnerable to fire until destroyed.`,
              },
              procedure: {
                enabled: true,
                type: "custom",
                prerequisite: "A visible surface is within range and can anchor the line.",
                text: `The monster creates a web line between itself and a surface within ${band.range} feet it can see, then moves along the line up to its remaining speed without provoking Opportunity Attacks. The line remains as a visible fragile object vulnerable to fire until destroyed.`,
              },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    complexityProfile: profile({ decision: 2, sequencing: 2, branches: 1, tracking: 2 }),
    counterplayProfile: {
      telegraphs: ["Every route is a visible strand connecting two known surfaces."],
      positioningAnswers: ["Cover the landing points and stand where no useful anchor surface lies beyond the front line."],
      breakConditions: ["Cut or burn the active strand or remove its anchor surface."],
      nonDamageAnswers: ["Use fire, tools, movable cover, or collapsing terrain to dismantle the web network."],
    },
    spikeRiskProfile: spike({ control: 1 }),
    editorial: editorial(
      "RENAME_AND_EXPAND_INTO_BUNDLE",
      "Web Dancer was a single free movement button. Web Swing now creates a persistent, visible route network whose growth and destruction shape the encounter.",
    ),
  },

  "shadow-jump": {
    title: "Shadow Step",
    cost: 4,
    complexity: 2,
    stats: { mobility: 3, control: 1, fairness: 1 },
    summary:
      "Two patches of darkness stretch toward one another before the creature crosses between them.",
    mechanics:
      "As a bonus action, the creature chooses an unoccupied space in darkness within range that it can see. The source and destination shadows visibly stretch toward each other, then the creature teleports to the destination. Bright light on either space before the teleport resolves prevents the movement without expending the use.",
    counterplay:
      "Illuminate either shadow, occupy the destination, or hold actions against the visibly marked arrival point.",
    tags: ["shadow_teleport", "marked_destination", "bright_light", "limited_use"],
    identity: {
      fantasy: "A creature that crosses the gap between two connected shadows after both endpoints visibly distort.",
      tacticalRole:
        "Telegraphed teleport whose range and cadence scale with CR but whose destination can always be denied.",
      signature: "Both endpoint shadows visibly stretch before the teleport occurs.",
      recognitionTags: ["shadow-step", "marked-destination", "light-denial", "teleport-route"],
    },
    abilities: [
      {
        id: "shadow-step",
        title: "Shadow Step",
        section: "bonusAction",
        summary: "The creature teleports between two visible patches of darkness.",
        mechanics:
          "The creature chooses an unoccupied space in darkness within 20 feet that it can see. The source and destination shadows visibly stretch toward each other, then the creature teleports to the destination. Bright light on either space before the teleport resolves prevents the movement without expending the use.",
        counterplay: "Illuminate or occupy the marked destination before the teleport resolves.",
        rules: bonusActionRules({
          text:
            "The monster chooses an unoccupied space in darkness within 20 feet that it can see. The source and destination shadows visibly stretch toward each other, then the monster teleports to the destination. Bright light on either space before the teleport resolves prevents the movement without expending the use.",
          usage: { type: "limited", uses: 1, period: "day" },
          procedure: {
            prerequisite: "Both the source and destination are in darkness.",
          },
          effects: [movementEffect("The monster teleports between two visible patches of darkness.", 3)],
        }),
        tags: ["bonus-action", "teleport", "darkness", "destination-telegraph"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Choose a destination that changes engagement or line of sight, reveal it, and teleport only if the party cannot illuminate or occupy it.",
      "An unoccupied dark space that creates escape, flanking, elevation, or cover.",
      ["shadow-step"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-short-step", minCr: 0, maxCr: 4, distance: 20, usage: { type: "limited", uses: 1, period: "day" } },
        { id: "cr-5-12-shadow-step", minCr: 5, maxCr: 12, distance: 40, usage: { type: "limited", uses: 3, period: "day" } },
        { id: "cr-13-30-deep-step", minCr: 13, maxCr: 30, distance: 60, usage: { type: "atWill" } },
      ].map((band) => ({
        ...band,
        abilityIds: ["shadow-step"],
        defaultSequence: ["shadow-step"],
        abilityPatches: {
          "shadow-step": {
            mechanics: `The creature chooses an unoccupied space in darkness within ${band.distance} feet that it can see. The source and destination shadows visibly stretch toward each other, then the creature teleports to the destination. Bright light on either space before the teleport resolves prevents the movement without expending the use.`,
            rules: {
              usage: band.usage,
              text: {
                effect: `The monster chooses an unoccupied space in darkness within ${band.distance} feet that it can see. The source and destination shadows visibly stretch toward each other, then the monster teleports to the destination. Bright light on either space before the teleport resolves prevents the movement without expending the use.`,
              },
              procedure: {
                enabled: true,
                type: "custom",
                prerequisite: "Both the source and destination are in darkness.",
                text: `The monster chooses an unoccupied space in darkness within ${band.distance} feet that it can see. The source and destination shadows visibly stretch toward each other, then the monster teleports to the destination. Bright light on either space before the teleport resolves prevents the movement without expending the use.`,
              },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    complexityProfile: profile({ decision: 2, branches: 2, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The source and destination shadows stretch toward each other before the creature vanishes."],
      positioningAnswers: ["Occupy the destination, maintain overlapping light, or stand where the marked arrival gives no advantage."],
      breakConditions: ["Bright light on either endpoint prevents the teleport."],
      nonDamageAnswers: ["Use torches, magical light, movable mirrors, doors, or smoke-clearing effects to remove valid endpoints."],
    },
    spikeRiskProfile: spike({ control: 1, repeatability: 1 }),
    editorial: editorial(
      "RENAME_AND_REWRITE_AND_SCALE",
      "The teleport already had a strong core, but no telegraph beyond darkness. Shadow Step preserves scaling while exposing a preventable destination.",
    ),
  },

  "predatory-jump": {
    title: "Predatory Leap",
    cost: 3,
    complexity: 1,
    stats: { mobility: 1, fairness: 1 },
    summary:
      "The creature crouches toward a visible landing space, then leaps there without crossing the intervening threat zones.",
    mechanics:
      "As a bonus action, the creature chooses an unoccupied landing space within range that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks. At CR 5 or higher, landing beside an isolated enemy grants advantage on the next attack roll against that enemy before the end of the turn.",
    counterplay:
      "Occupy or hazard the landing space, stay adjacent to allies, or ready an action against the announced leap.",
    tags: ["leap", "marked_landing", "isolated_target", "formation_counterplay"],
    identity: {
      fantasy: "A predator that announces its landing with a low crouch, then crosses the battlefield in one jump.",
      tacticalRole:
        "Long approach pattern with a visible landing point; stronger creatures also punish characters who separate from the group.",
      signature: "The landing space is declared before the leap, and from CR 5 onward isolated targets grant attack advantage.",
      recognitionTags: ["predatory-leap", "marked-landing", "isolated-prey", "formation-answer"],
    },
    abilities: [
      {
        id: "predatory-leap",
        title: "Predatory Leap",
        section: "bonusAction",
        summary: "The creature leaps to a declared landing space; stronger versions punish isolated prey.",
        mechanics:
          "The creature chooses an unoccupied landing space within 20 feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks.",
        counterplay: "Stay adjacent to an ally or deny the announced landing space.",
        rules: bonusActionRules({
          text:
            "The monster chooses an unoccupied landing space within 20 feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks.",
          procedure: {
            prerequisite: "The monster can see an unoccupied landing space within range.",
          },
          effects: [movementEffect("The monster jumps to a declared landing space without provoking Opportunity Attacks.", 2)],
        }),
        tags: ["bonus-action", "jump", "isolated-target", "landing-space"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Declare a landing space that crosses a hazard or changes elevation; at CR 5 or higher, prefer isolated prey when the party breaks formation.",
      "An unoccupied landing space beside an enemy with no ally within 5 feet.",
      ["predatory-leap"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-4-short-leap", minCr: 0, maxCr: 4, distance: 20 },
        { id: "cr-5-12-hunting-leap", minCr: 5, maxCr: 12, distance: 30 },
        { id: "cr-13-30-great-leap", minCr: 13, maxCr: 30, distance: 45 },
      ].map((band) => ({
        ...band,
        abilityIds: ["predatory-leap"],
        defaultSequence: ["predatory-leap"],
        abilityPatches: {
          "predatory-leap": {
            mechanics: band.minCr >= 5
              ? `The creature chooses an unoccupied landing space within ${band.distance} feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks. If it lands within 5 feet of an isolated enemy, it has advantage on the next attack roll it makes against that enemy before the end of the turn.`
              : `The creature chooses an unoccupied landing space within ${band.distance} feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks.`,
            rules: {
              text: {
                effect: band.minCr >= 5
                  ? `The monster chooses an unoccupied landing space within ${band.distance} feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks. If it lands within 5 feet of an isolated enemy, it has advantage on the next attack roll it makes against that enemy before the end of the turn.`
                  : `The monster chooses an unoccupied landing space within ${band.distance} feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks.`,
              },
              procedure: {
                enabled: true,
                type: "custom",
                prerequisite: "The monster can see an unoccupied landing space within range.",
                text: band.minCr >= 5
                  ? `The monster chooses an unoccupied landing space within ${band.distance} feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks. If it lands within 5 feet of an isolated enemy, it has advantage on the next attack roll it makes against that enemy before the end of the turn.`
                  : `The monster chooses an unoccupied landing space within ${band.distance} feet that it can see, visibly crouches toward it, and jumps there without provoking Opportunity Attacks.`,
              },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    complexityProfile: profile({ decision: 1, branches: 1 }),
    counterplayProfile: {
      telegraphs: ["The creature crouches and turns its whole body toward the chosen landing space."],
      positioningAnswers: ["Stay within 5 feet of an ally and occupy likely landing spaces."],
      breakConditions: ["Remove, occupy, or make the announced landing space hazardous before the leap."],
      nonDamageAnswers: ["Use readied movement, caltrops, difficult terrain, illusions, or movable cover to spoil the landing."],
    },
    spikeRiskProfile: spike({}),
    editorial: editorial(
      "REWRITE_AND_SCALE",
      "The original leap was functional but automatic. The announced landing creates immediate counterplay, while the isolated-prey reward appears only from CR 5 onward so low-CR builds do not gain hidden offensive reliability.",
    ),
  },

  "shadow-stillness": {
    title: "Unseen Advance",
    cost: 4,
    complexity: 3,
    stats: { mobility: 2, control: 1, fairness: 2 },
    summary:
      "The creature advances only during moments when every hostile observer loses sight of it.",
    mechanics:
      "Once per round, when no conscious hostile creature has line of sight to it, the creature can move up to half its speed without provoking Opportunity Attacks. This movement ends immediately if a conscious hostile creature regains line of sight to it. The distance scales with CR.",
    counterplay:
      "Maintain overlapping sight lines, keep it illuminated, and coordinate observers so at least one conscious character can always see it.",
    tags: ["unwatched_movement", "line_of_sight", "observer_network", "free_move"],
    identity: {
      fantasy: "A statue-like horror that changes position only in the gaps between observation.",
      tacticalRole:
        "Sight-line movement puzzle that turns group awareness and illumination into direct positional control.",
      signature: "It moves only while every conscious hostile observer has lost line of sight.",
      recognitionTags: ["unseen-advance", "observer-gap", "sight-lock", "light-control"],
    },
    abilities: [
      {
        id: "unseen-advance",
        title: "Unseen Advance",
        section: "bonusAction",
        summary: "The creature moves during a complete break in hostile observation.",
        mechanics:
          "Once per round, when no conscious hostile creature has line of sight to it, the creature can move up to half its speed without provoking Opportunity Attacks. This movement ends immediately if a conscious hostile creature regains line of sight to it.",
        counterplay: "Maintain at least one conscious observer with line of sight throughout the movement.",
        rules: bonusActionRules({
          text:
            "Once per round, when no conscious hostile creature has line of sight to it, the monster can move up to half its speed without provoking Opportunity Attacks. This movement ends immediately if a conscious hostile creature regains line of sight to it.",
          trigger: "No conscious hostile creature has line of sight to the monster.",
          procedure: {
            prerequisite: "No conscious hostile creature has line of sight to the monster.",
          },
          effects: [movementEffect("The monster moves while no conscious hostile creature can see it.", 2)],
        }),
        tags: ["bonus-action", "line-of-sight", "unwatched", "observer-counterplay"],
        authored: true,
      },
    ],
    routine: movementRoutine(
      "Create or wait for a complete sight-line break, then advance only until an observer can see the creature again.",
      "A destination reachable through darkness, cover, distraction, blindness, or unconscious observers.",
      ["unseen-advance"],
    ),
    progression: {
      schemaVersion: PROGRESSION_VERSION,
      basis: "targetCr",
      scalingPolicy: "authored-rule-patches",
      bands: [
        { id: "cr-0-7-half-step", minCr: 0, maxCr: 7, movement: "half its speed" },
        { id: "cr-8-30-full-step", minCr: 8, maxCr: 30, movement: "its speed" },
      ].map((band) => ({
        ...band,
        abilityIds: ["unseen-advance"],
        defaultSequence: ["unseen-advance"],
        abilityPatches: {
          "unseen-advance": {
            mechanics: `Once per round, when no conscious hostile creature has line of sight to it, the creature can move up to ${band.movement} without provoking Opportunity Attacks. This movement ends immediately if a conscious hostile creature regains line of sight to it.`,
            rules: {
              text: {
                effect: `Once per round, when no conscious hostile creature has line of sight to it, the monster can move up to ${band.movement} without provoking Opportunity Attacks. This movement ends immediately if a conscious hostile creature regains line of sight to it.`,
              },
              procedure: {
                enabled: true,
                type: "custom",
                prerequisite: "No conscious hostile creature has line of sight to the monster.",
                text: `Once per round, when no conscious hostile creature has line of sight to it, the monster can move up to ${band.movement} without provoking Opportunity Attacks. This movement ends immediately if a conscious hostile creature regains line of sight to it.`,
              },
            },
          },
        },
        multiattack: { enabled: false, mode: "fixed", count: 0 },
      })),
    },
    complexityProfile: profile({ decision: 3, branches: 2, tracking: 1 }),
    counterplayProfile: {
      telegraphs: ["The creature remains perfectly still whenever any conscious hostile observer can see it."],
      positioningAnswers: ["Maintain overlapping sight lines and avoid every observer turning away at once."],
      breakConditions: ["Any conscious hostile creature regaining line of sight immediately ends the movement."],
      nonDamageAnswers: ["Use light, mirrors, familiars, alarms, open doors, or coordinated callouts to preserve observation."],
    },
    spikeRiskProfile: spike({ control: 1 }),
    editorial: editorial(
      "RENAME_AND_REFINE_AND_SCALE",
      "The existing concept was already a genuine Movement Pattern. The revision simplifies its name, clarifies interruption during movement, and strengthens the observer-based counterplay.",
    ),
  },
};

export const MONSTER_MOVEMENT_GRAFT_EDITORIAL_IDS = Object.freeze(
  Object.keys(MOVEMENT_GRAFTS),
);

export const MONSTER_MOVEMENT_GRAFT_SCALED_IDS = Object.freeze([
  "rupture-charge",
  "vanish-spirit",
  "web-dancer",
  "shadow-jump",
  "predatory-jump",
  "shadow-stillness",
]);

export function getMonsterMovementGraftEditorialOverride(graftId = "") {
  return MOVEMENT_GRAFTS[String(graftId || "").trim()] || null;
}
