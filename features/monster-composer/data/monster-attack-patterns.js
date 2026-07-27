export const MONSTER_ATTACK_PATTERN_MIGRATION_VERSION = "monster-attack-pattern-migration-v1.4-evocative-pattern-names";
export const MONSTER_ATTACK_PATTERN_PROGRESSION_SCHEMA_VERSION = "monster-attack-pattern-progression-v1.0";

function freezePattern(pattern) {
  return Object.freeze({
    ...pattern,
    identity: Object.freeze({ ...pattern.identity }),
    abilities: Object.freeze(pattern.abilities.map((ability) => Object.freeze({ ...ability }))),
    progression: pattern.progression
      ? Object.freeze({
          ...pattern.progression,
          bands: Object.freeze(
            (pattern.progression.bands || []).map((band) =>
              Object.freeze({
                ...band,
                abilityIds: Object.freeze([...(band.abilityIds || [])]),
                defaultSequence: Object.freeze([...(band.defaultSequence || [])]),
                opener: Object.freeze([...(band.opener || [])]),
                multiattack: Object.freeze({ ...(band.multiattack || {}) }),
              }),
            ),
          ),
        })
      : null,
    routine: Object.freeze({
      ...pattern.routine,
      defaultSequence: Object.freeze([...(pattern.routine.defaultSequence || [])]),
      opener: Object.freeze([...(pattern.routine.opener || [])]),
      alternatives: Object.freeze(
        (pattern.routine.alternatives || []).map((alternative) =>
          Object.freeze({
            ...alternative,
            sequence: Object.freeze([...(alternative.sequence || [])]),
          }),
        ),
      ),
      multiattack: Object.freeze({
        ...(pattern.routine.multiattack || {}),
        attacks: Object.freeze([...(pattern.routine.multiattack?.attacks || [])]),
        choices: Object.freeze([...(pattern.routine.multiattack?.choices || [])]),
        replacements: Object.freeze([...(pattern.routine.multiattack?.replacements || [])]),
      }),
    }),
    counterplayProfile: Object.freeze({
      ...pattern.counterplayProfile,
      telegraphs: Object.freeze([...(pattern.counterplayProfile?.telegraphs || [])]),
      positioningAnswers: Object.freeze([...(pattern.counterplayProfile?.positioningAnswers || [])]),
      breakConditions: Object.freeze([...(pattern.counterplayProfile?.breakConditions || [])]),
      nonDamageAnswers: Object.freeze([...(pattern.counterplayProfile?.nonDamageAnswers || [])]),
    }),
  });
}

const PATTERNS = {
  "slam-decomposition": {
    title: "Crusher",
    summary: "A swollen corpse advances through open lanes, crashes into prey, and turns the impact into a crushing hold.",
    mechanics: "Attack Pattern. The monster repeatedly uses Heavy Slam. It can replace one attack with Corpse Grab when pinning a vulnerable target is more valuable than raw damage.",
    counterplay: "Break charge lanes, spread away from walls, and help a grabbed creature before the corpse can exploit the hold.",
    identity: {
      fantasy: "A gas-swollen corpse weaponizes its weight, first as a charge and then as a pinning mass.",
      tacticalRole: "lane-dependent bruiser with single-target lockdown",
      signature: "advance, impact, pin",
      recognitionTags: ["swollen-corpse", "charge-lane", "body-weight", "grapple"],
    },
    abilities: [
      { id: "heavy-slam", from: "slam-decomposition", role: "primary", maxUses: 2 },
      { id: "corpse-grab", from: "corpse-grab", role: "replacement", availability: "always" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Close through the clearest lane and batter one target until a safe grab becomes available.",
      targetSelection: "Prefer isolated targets standing near walls, allies, or terrain that limits retreat.",
      defaultSequence: ["heavy-slam", "heavy-slam"],
      opener: [],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "pin-isolated-prey",
          when: "A target is isolated or has already spent its escape tools.",
          purpose: "Convert damage pressure into a visible rescue problem.",
          sequence: ["corpse-grab", "heavy-slam"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "heavy-slam", count: 2 }],
        replacements: [
          { id: "replace-with-grab", with: "corpse-grab", replace: "oneAttack", label: "Corpse Grab", availability: "always" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The corpse lowers its center of mass before committing to a charge lane."],
      positioningAnswers: ["Deny straight approaches and avoid clustering against walls or heavy objects."],
      breakConditions: ["Forced movement and difficult terrain interrupt the preferred approach."],
      nonDamageAnswers: ["Escape assistance and movement effects release a pinned ally."],
    },
    complexityProfile: { decisionLoad: 1, sequencing: 1, conditionalBranches: 1, tracking: 1 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 1, repeatability: 2 },
  },

  "empowered-slam": {
    title: "Juggernaut",
    summary: "A pressure-bloated corpse alternates wall-breaking impacts, body pins, and a telegraphed purge of internal fluid.",
    mechanics: "Attack Pattern. The monster makes two Empowered Slam attacks. It can replace one attack with Corpse Grab or, when available, Acid Vomit.",
    counterplay: "Stay away from collision surfaces, interrupt the purge telegraph, and avoid leaving one ally alone inside the corpse's reach.",
    identity: {
      fantasy: "A corpse at the edge of rupture turns internal pressure into impacts, holds, and corrosive release.",
      tacticalRole: "displacement brute with a telegraphed area-pressure deviation",
      signature: "wind up, collide, restrain, purge",
      recognitionTags: ["swollen-corpse", "collision", "purge-fluid", "pressure-release"],
    },
    abilities: [
      { id: "empowered-slam", from: "empowered-slam", role: "primary", maxUses: 2 },
      { id: "corpse-grab", from: "corpse-grab", role: "replacement", availability: "always" },
      { id: "acid-vomit", from: "acid-vomit", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Use repeated impacts to herd targets toward collision surfaces, then deviate into a grab or purge when the board state rewards it.",
      targetSelection: "Prefer targets near allies, walls, or constrained routes; use the purge against clustered enemies.",
      defaultSequence: ["empowered-slam", "empowered-slam"],
      opener: ["acid-vomit"],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "lock-frontliner",
          when: "A durable target is isolated inside reach.",
          purpose: "Create a rescue tax instead of spending the whole turn on damage.",
          sequence: ["corpse-grab", "empowered-slam"],
        },
        {
          id: "purge-cluster",
          when: "Acid Vomit is available and at least two targets can be caught without abandoning a better collision line.",
          purpose: "Trade focused pressure for area denial and healing suppression.",
          sequence: ["acid-vomit"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "empowered-slam", count: 2 }],
        replacements: [
          { id: "replace-with-grab", with: "corpse-grab", replace: "oneAttack", label: "Corpse Grab", availability: "always" },
          { id: "replace-with-purge", with: "acid-vomit", replace: "oneAttack", label: "Acid Vomit", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The corpse winds up before a collision and its throat distends before the purge."],
      positioningAnswers: ["Fight away from walls, clutter, and clustered allies."],
      breakConditions: ["Forced movement and line denial spoil the collision setup."],
      nonDamageAnswers: ["Cleaning purge fluid and freeing a grabbed ally reduce the pattern's follow-through."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 2, tracking: 2 },
    spikeRiskProfile: { openingBurst: 2, controlSpike: 2, repeatability: 2 },
  },

  "acid-vomit": {
    title: "Acid Brute",
    summary: "The corpse opens with a corrosive purge, then advances behind the contamination and batters survivors with its full weight.",
    mechanics: "Attack Pattern. The monster makes two Heavy Slam attacks and can replace one attack with Acid Vomit when the recharge is available.",
    counterplay: "Spread before the purge, clean the fluid promptly, and deny straight approaches after the cone has broken formation.",
    identity: {
      fantasy: "A pressurized corpse empties itself across the battlefield and follows the purge with blunt-force pursuit.",
      tacticalRole: "telegraphed area opener into lane-dependent cleanup",
      signature: "distend, purge, advance, crush",
      recognitionTags: ["purge-fluid", "acid-cone", "swollen-corpse", "charge-lane"],
    },
    abilities: [
      { id: "heavy-slam", from: "slam-decomposition", role: "primary", maxUses: 2 },
      { id: "acid-vomit", from: "acid-vomit", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Open with the purge when it catches a meaningful cluster, then pressure separated targets with repeated slams.",
      targetSelection: "Aim the purge at clustered targets and the slams at creatures cut off from support by the contamination.",
      defaultSequence: ["heavy-slam", "heavy-slam"],
      opener: ["acid-vomit"],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "hold-purge",
          when: "The recharge is available but the cone would catch only one low-value target.",
          purpose: "Preserve the visible threat and use reliable impact damage instead.",
          sequence: ["heavy-slam", "heavy-slam"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "heavy-slam", count: 2 }],
        replacements: [
          { id: "replace-with-purge", with: "acid-vomit", replace: "oneAttack", label: "Acid Vomit", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["Dark fluid leaks from the distending throat before the purge."],
      positioningAnswers: ["Spread out, use cover, and deny a straight follow-up lane."],
      breakConditions: ["Cleaning the purge fluid ends the healing-denial follow-through."],
      nonDamageAnswers: ["A suitable cleaning action removes the persistent fluid."],
    },
    complexityProfile: { decisionLoad: 1, sequencing: 2, conditionalBranches: 1, tracking: 2 },
    spikeRiskProfile: { openingBurst: 3, controlSpike: 1, repeatability: 1 },
  },

  "corpse-grab": {
    title: "Grappler",
    summary: "The corpse batters a target into a bad position and then folds its swollen mass around the victim.",
    mechanics: "Attack Pattern. The monster makes two Heavy Slam attacks and can replace one attack with Corpse Grab.",
    counterplay: "Maintain escape routes, prevent isolation, and use forced movement to separate the corpse from its chosen victim.",
    identity: {
      fantasy: "A bloated corpse uses impact not to kill immediately, but to place a victim where its body can engulf them.",
      tacticalRole: "single-target captor with readable setup",
      signature: "batter, isolate, engulf",
      recognitionTags: ["swollen-corpse", "body-pin", "isolation", "rescue-pressure"],
    },
    abilities: [
      { id: "heavy-slam", from: "slam-decomposition", role: "primary", maxUses: 2 },
      { id: "corpse-grab", from: "corpse-grab", role: "replacement", availability: "always" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Use impacts until one target is separated, then trade one attack for the hold.",
      targetSelection: "Prefer a target without adjacent allies or one already limited by terrain.",
      defaultSequence: ["heavy-slam", "heavy-slam"],
      opener: [],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "secure-hold",
          when: "A target is isolated and the party cannot immediately force the corpse away.",
          purpose: "Create a rescue decision and deny movement.",
          sequence: ["corpse-grab", "heavy-slam"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "heavy-slam", count: 2 }],
        replacements: [
          { id: "replace-with-grab", with: "corpse-grab", replace: "oneAttack", label: "Corpse Grab", availability: "always" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The corpse spreads its arms and turns its torso toward one isolated creature."],
      positioningAnswers: ["Stay within rescue distance and avoid narrow dead ends."],
      breakConditions: ["Forced movement breaks the corpse's preferred hold geometry."],
      nonDamageAnswers: ["Escape checks and ally movement effects release the target."],
    },
    complexityProfile: { decisionLoad: 1, sequencing: 1, conditionalBranches: 1, tracking: 1 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 2, repeatability: 2 },
  },

  "grave-bite": {
    title: "Grave Eater",
    summary: "A corpse-eating spirit restrains prey around the dead, then feeds twice before the victim can escape its hunger.",
    mechanics: "Attack Pattern. The monster makes two Grave Bite attacks and can replace one attack with Corpse Tendrils when a corpse is available.",
    counterplay: "Keep wounded allies away from corpses, remove corpse anchors, and deny the spirit an isolated feeding target.",
    identity: {
      fantasy: "A hungry spirit turns the dead into hunting ground and every bite into a feeding rite.",
      tacticalRole: "wounded-target predator with corpse-anchored control",
      signature: "anchor corpse, restrain, feed",
      recognitionTags: ["corpse-hunger", "grave-bite", "corpse-anchor", "feeding-rite"],
    },
    abilities: [
      { id: "grave-bite", from: "grave-bite", role: "primary", maxUses: 2 },
      { id: "corpse-tendrils", from: "corpse-tendrils", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Bite the most wounded reachable creature; use a nearby corpse to restrain prey before committing to the feed.",
      targetSelection: "Prefer creatures below half Hit Points and targets standing close to a usable corpse.",
      defaultSequence: ["grave-bite", "grave-bite"],
      opener: ["corpse-tendrils"],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "anchor-living-prey",
          when: "A corpse can restrain multiple creatures or deny the party's route to a wounded ally.",
          purpose: "Turn the corpse into a tactical anchor before feeding.",
          sequence: ["corpse-tendrils", "grave-bite"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "grave-bite", count: 2 }],
        replacements: [
          { id: "replace-with-tendrils", with: "corpse-tendrils", replace: "oneAttack", label: "Corpse Tendrils", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The spirit's attention fixes on bloodied creatures and nearby corpses."],
      positioningAnswers: ["Move wounded creatures away from corpse anchors."],
      breakConditions: ["Destroying, burning, or abandoning the corpse removes the tendril option."],
      nonDamageAnswers: ["Healing above the bloodied threshold denies the bite's preferred payoff."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 1, conditionalBranches: 1, tracking: 1 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 2, repeatability: 2 },
  },

  "infected-bite": {
    title: "Plague Eater",
    summary: "The spirit marks one victim with delayed spiritual infection while continuing to feed through a second, more immediate bite.",
    mechanics: "Attack Pattern. The monster makes one Infected Bite and one Grave Bite attack. It can replace one attack with Corpse Tendrils when a corpse is available.",
    counterplay: "Protect the marked target, cleanse the infection before the next Long Rest, and remove corpse anchors from the fight.",
    identity: {
      fantasy: "A corpse-eating spirit plants a slow spiritual sickness and uses ordinary feeding to keep pressure immediate.",
      tacticalRole: "delayed-attrition striker with corpse control",
      signature: "mark, feed, haunt the next rest",
      recognitionTags: ["spiritual-infection", "corpse-hunger", "delayed-exhaustion", "grave-bite"],
    },
    abilities: [
      { id: "infected-bite", from: "infected-bite", role: "primary", maxUses: 1 },
      { id: "grave-bite", from: "grave-bite", role: "primary", maxUses: 1 },
      { id: "corpse-tendrils", from: "corpse-tendrils", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Mark one meaningful target with infection, then use the feeding bite to maintain immediate threat.",
      targetSelection: "Apply infection to a creature likely to survive the scene; feed on the most wounded reachable target.",
      defaultSequence: ["infected-bite", "grave-bite"],
      opener: [],
      intentionalRepetition: false,
      alternatives: [
        {
          id: "corpse-lock",
          when: "A corpse anchor can restrain the marked target or split its rescuers.",
          purpose: "Protect the delayed threat by controlling access.",
          sequence: ["corpse-tendrils", "grave-bite"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [
          { ref: "infected-bite", count: 1 },
          { ref: "grave-bite", count: 1 },
        ],
        replacements: [
          { id: "replace-with-tendrils", with: "corpse-tendrils", replace: "oneAttack", label: "Corpse Tendrils", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The infected wound darkens and behaves unlike an ordinary injury."],
      positioningAnswers: ["Keep likely infection targets away from corpses and the spirit's reach."],
      breakConditions: ["Consecrated rest, disease removal, or curse removal ends the delayed consequence."],
      nonDamageAnswers: ["Investigation and cleansing before the next Long Rest prevent the Exhaustion."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 1, tracking: 2 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 1, repeatability: 1 },
  },

  "purulent-bite": {
    title: "Rot Eater",
    summary: "The spirit delivers one catastrophic disease-bearing bite, then feeds normally while the delayed corruption takes hold.",
    mechanics: "Attack Pattern. The monster makes one Purulent Bite and one Grave Bite attack. It can replace one attack with Corpse Tendrils when a corpse is available.",
    counterplay: "Recognize the diseased wound, seek cleansing before the next Long Rest, and destroy the corpse anchors that let the spirit isolate victims.",
    identity: {
      fantasy: "A mature corpse-eater turns a single bite into a long-term curse while continuing its immediate feeding ritual.",
      tacticalRole: "high-stakes delayed-attrition striker with corpse control",
      signature: "infect deeply, feed once, retreat behind the dead",
      recognitionTags: ["purulent-bite", "delayed-exhaustion", "disease", "corpse-hunger"],
    },
    abilities: [
      { id: "purulent-bite", from: "purulent-bite", role: "primary", maxUses: 1 },
      { id: "grave-bite", from: "grave-bite", role: "primary", maxUses: 1 },
      { id: "corpse-tendrils", from: "corpse-tendrils", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Use the purulent bite once against a durable target, then feed normally or spend the second attack controlling the corpse field.",
      targetSelection: "Choose a target whose survival makes the delayed disease meaningful rather than a nearly defeated creature.",
      defaultSequence: ["purulent-bite", "grave-bite"],
      opener: [],
      intentionalRepetition: false,
      alternatives: [
        {
          id: "protect-disease",
          when: "A corpse can restrain a healer or block access to the infected target.",
          purpose: "Make immediate rescue compete with the delayed disease problem.",
          sequence: ["purulent-bite", "corpse-tendrils"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [
          { ref: "purulent-bite", count: 1 },
          { ref: "grave-bite", count: 1 },
        ],
        replacements: [
          { id: "replace-with-tendrils", with: "corpse-tendrils", replace: "oneAttack", label: "Corpse Tendrils", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The spirit's mouth and the wound carry visible purulence and funerary corruption."],
      positioningAnswers: ["Separate healers and vulnerable targets from corpse anchors."],
      breakConditions: ["Consecrated treatment or appropriate magic stops the delayed Exhaustion and disease."],
      nonDamageAnswers: ["Investigation before the next Long Rest reveals the need for cleansing."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 1, tracking: 3 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 2, repeatability: 1 },
  },

  "corpse-tendrils": {
    title: "Corpse Binder",
    summary: "The spirit animates a corpse as a restraining anchor, then crosses the trapped space to feed on whoever cannot escape.",
    mechanics: "Attack Pattern. The monster makes two Grave Bite attacks and can replace one attack with Corpse Tendrils when a corpse is available.",
    counterplay: "Remove or avoid corpses, break the restraint quickly, and prevent the spirit from reaching bloodied creatures inside the tendril field.",
    identity: {
      fantasy: "The dead become extensions of the spirit's hunger, holding the living in place for the feeding bite.",
      tacticalRole: "corpse-anchored controller with focused follow-through",
      signature: "animate corpse, restrain, cross the field, feed",
      recognitionTags: ["corpse-tendrils", "corpse-anchor", "restrained-prey", "grave-hunger"],
    },
    abilities: [
      { id: "grave-bite", from: "grave-bite", role: "primary", maxUses: 2 },
      { id: "corpse-tendrils", from: "corpse-tendrils", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Create a restraint zone from a useful corpse, then feed on the most vulnerable trapped target.",
      targetSelection: "Prioritize groups near corpses and bloodied targets inside the tendril emanation.",
      defaultSequence: ["grave-bite", "grave-bite"],
      opener: ["corpse-tendrils"],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "no-corpse",
          when: "No corpse is available or the party has destroyed every useful anchor.",
          purpose: "Fall back to direct feeding without inventing an anchor.",
          sequence: ["grave-bite", "grave-bite"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "grave-bite", count: 2 }],
        replacements: [
          { id: "replace-with-tendrils", with: "corpse-tendrils", replace: "oneAttack", label: "Corpse Tendrils", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The spirit circles a corpse and the dead flesh begins to pull itself open."],
      positioningAnswers: ["Do not fight in reach of usable corpses."],
      breakConditions: ["Destroying or burning the corpse removes the anchor."],
      nonDamageAnswers: ["Forced movement and successful repeat saves release trapped targets."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 1, tracking: 2 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 3, repeatability: 2 },
  },

  "venomous-bite": {
    title: "Venom Hunter",
    summary: "A hunting spider alternates close venom strikes and ranged spit while preserving its web for the moment prey tries to escape.",
    mechanics: "Attack Pattern. The monster makes two attacks using Venomous Bite or Venomous Spit in any combination. It can replace one attack with Web when available.",
    counterplay: "Use cover against the spit, maintain distance from the fangs, and burn or destroy the web before the spider closes.",
    identity: {
      fantasy: "A patient spider changes range without changing purpose: poison prey, restrict escape, and close for the finishing bite.",
      tacticalRole: "range-flexible predator with a restraining deviation",
      signature: "spit, close, bite, web the escape",
      recognitionTags: ["venom-fangs", "poison-spit", "web-shot", "hunting-spider"],
    },
    abilities: [
      { id: "venomous-bite", from: "venomous-bite", role: "choice", group: "venom-hunt", maxUses: 2 },
      { id: "venomous-spit", from: "venomous-spit", role: "choice", group: "venom-hunt", maxUses: 2 },
      { id: "web", from: "web-recharge", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Use the attack that preserves the spider's preferred range, then close only when a poisoned or restrained target can be finished safely.",
      targetSelection: "Prefer isolated targets and creatures already weakened by poison; web the creature most capable of escaping or protecting others.",
      defaultSequence: ["venomous-spit", "venomous-bite"],
      opener: ["web"],
      intentionalRepetition: false,
      alternatives: [
        {
          id: "finish-poisoned-prey",
          when: "A poisoned or badly wounded creature is within melee reach.",
          purpose: "Commit to the bite's drop-to-zero payoff.",
          sequence: ["venomous-bite", "venomous-bite"],
        },
        {
          id: "kite-fire-user",
          when: "A dangerous melee target or fire user cannot be safely approached.",
          purpose: "Maintain pressure without surrendering positioning.",
          sequence: ["venomous-spit", "venomous-spit"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "choice",
        count: 2,
        choices: ["venomous-bite", "venomous-spit"],
        replacements: [
          { id: "replace-with-web", with: "web", replace: "oneAttack", label: "Web", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The fangs drip before a bite and the spinnerets draw taut before a web shot."],
      positioningAnswers: ["Use cover at range and deny an isolated melee target."],
      breakConditions: ["Fire and direct attacks destroy the web."],
      nonDamageAnswers: ["Antitoxin and poison resistance blunt the finishing pattern."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 2, tracking: 2 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 2, repeatability: 2 },
  },

  "perforate": {
    title: "Impaler",
    summary: "The spider opens a wound with barbed fangs, follows with venom, and webs anyone who tries to disengage before the bleeding is treated.",
    mechanics: "Attack Pattern. The monster makes one Perforate and one Venomous Bite attack. It can replace one attack with Web when available.",
    counterplay: "Close the wound with healing or Medicine, destroy the web, and prevent the spider from focusing the same unsupported target.",
    identity: {
      fantasy: "A barbed-fang predator creates a wound that demands treatment while a second bite punishes delay.",
      tacticalRole: "single-target attrition striker with rescue-tax control",
      signature: "open wound, poison, web the retreat",
      recognitionTags: ["barbed-fangs", "bleeding-wound", "venom", "web-shot"],
    },
    abilities: [
      { id: "perforate", from: "perforate", role: "primary", maxUses: 1 },
      { id: "venomous-bite", from: "venomous-bite", role: "primary", maxUses: 1 },
      { id: "web", from: "web-recharge", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Apply the persistent wound once, then use venom or web pressure to make treatment costly.",
      targetSelection: "Focus a creature without immediate healing support or one already separated from the group.",
      defaultSequence: ["perforate", "venomous-bite"],
      opener: [],
      intentionalRepetition: false,
      alternatives: [
        {
          id: "web-the-healer",
          when: "Another creature is positioned to treat the wound immediately.",
          purpose: "Make the party choose between freeing the helper and stopping the bleeding.",
          sequence: ["perforate", "web"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [
          { ref: "perforate", count: 1 },
          { ref: "venomous-bite", count: 1 },
        ],
        replacements: [
          { id: "replace-with-web", with: "web", replace: "oneAttack", label: "Web", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The barbs remain lodged and the wound visibly tears with movement."],
      positioningAnswers: ["Keep wounded creatures within support range and use cover against the web."],
      breakConditions: ["Healing or a successful Medicine check closes the wound; fire destroys the web."],
      nonDamageAnswers: ["Medicine ends the ongoing damage without defeating the spider."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 1, tracking: 2 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 2, repeatability: 2 },
  },

  "web-recharge": {
    title: "Web Hunter",
    summary: "The spider opens by fixing prey in place, then crosses the webbed distance and bites repeatedly while escape remains costly.",
    mechanics: "Attack Pattern. The monster makes two Venomous Bite attacks and can replace one attack with Web when available.",
    counterplay: "Use cover before the shot, destroy the web with fire or attacks, and avoid leaving the restrained creature alone with the spider.",
    identity: {
      fantasy: "A classic web hunter immobilizes one creature and immediately turns restraint into feeding access.",
      tacticalRole: "single-target controller into focused melee pressure",
      signature: "web, close, bite twice",
      recognitionTags: ["web-shot", "restrained-prey", "venom-fangs", "spider-hunt"],
    },
    abilities: [
      { id: "venomous-bite", from: "venomous-bite", role: "primary", maxUses: 2 },
      { id: "web", from: "web-recharge", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Web the target most capable of escaping or protecting others, then bite the restrained or isolated prey.",
      targetSelection: "Prefer mobile skirmishers, healers, or a creature already separated from support.",
      defaultSequence: ["venomous-bite", "venomous-bite"],
      opener: ["web"],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "save-web",
          when: "The web would be immediately burned or the target already lacks a route of escape.",
          purpose: "Use reliable venom pressure and preserve the recharge threat.",
          sequence: ["venomous-bite", "venomous-bite"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "venomous-bite", count: 2 }],
        replacements: [
          { id: "replace-with-web", with: "web", replace: "oneAttack", label: "Web", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The spinnerets align and tighten before the web shot."],
      positioningAnswers: ["Use cover and remain close enough to free a restrained ally."],
      breakConditions: ["Fire and direct damage destroy the web."],
      nonDamageAnswers: ["Movement assistance and rescue actions prevent the feeding follow-through."],
    },
    complexityProfile: { decisionLoad: 1, sequencing: 2, conditionalBranches: 1, tracking: 2 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 3, repeatability: 2 },
  },

  "shadow-web": {
    title: "Shadow Weaver",
    summary: "The spider alternates venom at either range while holding a darker, cutting web for prey that exposes itself.",
    mechanics: "Attack Pattern. The monster makes two attacks using Venomous Bite or Venomous Spit in any combination. It can replace one attack with Shadow Web when available.",
    counterplay: "Use bright, open routes, destroy the shadow web with fire, and avoid feeding the spider an isolated restrained target.",
    identity: {
      fantasy: "A darkness-adapted spider hunts across ranges and turns restraint itself into a cutting wound.",
      tacticalRole: "range-flexible controller with persistent web damage",
      signature: "harry, shadow-web, cut restrained prey",
      recognitionTags: ["shadow-web", "cutting-silk", "venom", "darkness-hunter"],
    },
    abilities: [
      { id: "venomous-bite", from: "venomous-bite", role: "choice", group: "shadow-hunt", maxUses: 2 },
      { id: "venomous-spit", from: "venomous-spit", role: "choice", group: "shadow-hunt", maxUses: 2 },
      { id: "shadow-web", from: "shadow-web", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Attack from the safest range until the cutting web can trap a target the party cannot immediately free.",
      targetSelection: "Web the creature furthest from fire or rescue; otherwise pressure the most isolated target at the appropriate range.",
      defaultSequence: ["venomous-spit", "venomous-bite"],
      opener: ["shadow-web"],
      intentionalRepetition: false,
      alternatives: [
        {
          id: "remain-at-range",
          when: "Bright light, fire, or a dangerous melee defender controls the approach.",
          purpose: "Preserve the spider while maintaining pressure.",
          sequence: ["venomous-spit", "venomous-spit"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "choice",
        count: 2,
        choices: ["venomous-bite", "venomous-spit"],
        replacements: [
          { id: "replace-with-shadow-web", with: "shadow-web", replace: "oneAttack", label: "Shadow Web", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["Dark silk gathers around the spinnerets before the web is released."],
      positioningAnswers: ["Fight in bright open space and keep fire near likely web targets."],
      breakConditions: ["Fire destroys the web and ends its persistent cutting pressure."],
      nonDamageAnswers: ["Rescue actions and light control deny the preferred isolated target."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 2, tracking: 3 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 3, repeatability: 2 },
  },

  "venomous-spit": {
    title: "Venom Spitter",
    summary: "The spider shifts freely between ranged venom and a closing bite, using the same poison pressure at whichever distance the party permits.",
    mechanics: "Attack Pattern. The monster makes two attacks using Venomous Spit or Venomous Bite in any combination.",
    counterplay: "Use cover against the spit, punish the approach, and prevent the spider from isolating a target at either range.",
    identity: {
      fantasy: "A venom hunter refuses to become harmless at range and uses spit to create the approach for its fangs.",
      tacticalRole: "range-flexible striker",
      signature: "spit while closing, bite when safe",
      recognitionTags: ["venom-spit", "venom-fangs", "range-switch", "hunting-spider"],
    },
    abilities: [
      { id: "venomous-spit", from: "venomous-spit", role: "choice", group: "venom-range", maxUses: 2 },
      { id: "venomous-bite", from: "venomous-bite", role: "choice", group: "venom-range", maxUses: 2 },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Choose the attack that maintains pressure without conceding the spider's safest distance.",
      targetSelection: "Focus isolated targets and creatures already vulnerable to poison.",
      defaultSequence: ["venomous-spit", "venomous-bite"],
      opener: [],
      intentionalRepetition: false,
      alternatives: [
        {
          id: "kite",
          when: "Melee is unsafe or cover is incomplete.",
          purpose: "Maintain poison pressure while refusing engagement.",
          sequence: ["venomous-spit", "venomous-spit"],
        },
        {
          id: "finish",
          when: "A weakened target is within reach and lacks immediate support.",
          purpose: "Use the bite's stronger finishing threat.",
          sequence: ["venomous-bite", "venomous-bite"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "choice",
        count: 2,
        choices: ["venomous-spit", "venomous-bite"],
        replacements: [],
      },
    },
    counterplayProfile: {
      telegraphs: ["Venom gathers visibly in the mouth before either delivery method."],
      positioningAnswers: ["Use cover at range and protected formations in melee."],
      breakConditions: ["Hard cover breaks the ranged line; forced movement spoils the bite follow-through."],
      nonDamageAnswers: ["Antitoxin and poison resistance reduce both options."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 1, conditionalBranches: 2, tracking: 1 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 1, repeatability: 2 },
  },

  "brood-injection": {
    title: "Broodmaker",
    summary: "The spider bites repeatedly until one target is vulnerable, then replaces an attack with a visible implantation or a restraining web.",
    mechanics: "Attack Pattern. The monster makes two Venomous Bite attacks. It can replace one attack with Brood Injection or, when available, Web.",
    counterplay: "Treat the moving wound immediately, destroy the web, and avoid letting one isolated target absorb the whole brood sequence.",
    identity: {
      fantasy: "A brood-bearing spider creates a host rather than simply killing prey, using venom and webbing to secure the implantation.",
      tacticalRole: "single-target horror striker with delayed treatment pressure",
      signature: "restrain, bite, implant, protect the host",
      recognitionTags: ["brood-injection", "moving-wound", "venom-fangs", "host-making"],
    },
    abilities: [
      { id: "venomous-bite", from: "venomous-bite", role: "primary", maxUses: 2 },
      { id: "brood-injection", from: "brood-injection", role: "replacement", availability: "always" },
      { id: "web", from: "web-recharge", role: "replacement", availability: "ifAvailable" },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Use venom until a target is isolated or restrained, then replace one bite with implantation and pressure anyone trying to treat it.",
      targetSelection: "Implant a durable target whose allies must spend actions on treatment rather than a creature likely to fall immediately.",
      defaultSequence: ["venomous-bite", "venomous-bite"],
      opener: ["web"],
      intentionalRepetition: true,
      alternatives: [
        {
          id: "implant-host",
          when: "A target is restrained, isolated, or unable to receive immediate Medicine support.",
          purpose: "Create the delayed body-horror objective.",
          sequence: ["venomous-bite", "brood-injection"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "venomous-bite", count: 2 }],
        replacements: [
          { id: "replace-with-injection", with: "brood-injection", replace: "oneAttack", label: "Brood Injection", availability: "always" },
          { id: "replace-with-web", with: "web", replace: "oneAttack", label: "Web", availability: "ifAvailable" },
        ],
      },
    },
    counterplayProfile: {
      telegraphs: ["The implantation wound visibly ripples before delayed damage occurs."],
      positioningAnswers: ["Keep likely hosts within reach of allies trained in Medicine."],
      breakConditions: ["A successful Medicine check ends the implantation effect; fire destroys the web."],
      nonDamageAnswers: ["Treatment and rescue actions directly dismantle the pattern."],
    },
    complexityProfile: { decisionLoad: 2, sequencing: 2, conditionalBranches: 2, tracking: 3 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 2, repeatability: 2 },
  },

  "cold-funeral-touch": {
    title: "Cold Touch",
    summary: "A wax-faced stalker touches twice, stealing warmth and slipping past the victim under the cover of a borrowed identity.",
    mechanics: "Attack Pattern. The monster makes two Cold Funeral Touch attacks. Repetition is intentional: each hit supports the stalker's strike-and-reposition identity.",
    counterplay: "Expose the wax to fire, deny the monster recognizable faces, and hold formation so its post-hit movement cannot isolate another target.",
    identity: {
      fantasy: "A stolen face approaches like a mourner, drains warmth with repeated touches, and glides away before the victim can answer.",
      tacticalRole: "mobile melee lurker with intentional repeated strikes",
      signature: "present face, touch twice, slip away",
      recognitionTags: ["wax-mask", "borrowed-face", "cold-touch", "unpunished-reposition"],
    },
    abilities: [
      { id: "cold-funeral-touch", from: "cold-funeral-touch", role: "primary", maxUses: 2 },
    ],
    routine: {
      mode: "authored",
      defaultPlan: "Approach under a recognizable face, touch twice, and use the post-hit movement to leave the target's immediate retaliation zone.",
      targetSelection: "Prefer an isolated creature that recognizes the displayed face or one whose position opens a route through the formation.",
      defaultSequence: ["cold-funeral-touch", "cold-funeral-touch"],
      opener: [],
      intentionalRepetition: true,
      repetitionReason: "The pattern is defined by a paired touch-and-slip cadence rather than a wider weapon repertoire.",
      alternatives: [
        {
          id: "fire-exposed",
          when: "The wax has been softened by fire or the route out is controlled.",
          purpose: "Retreat or change targets instead of repeating the exposed cadence blindly.",
          sequence: ["cold-funeral-touch"],
        },
      ],
      multiattack: {
        enabled: true,
        mode: "fixed",
        count: 2,
        attacks: [{ ref: "cold-funeral-touch", count: 2 }],
        replacements: [],
      },
    },
    counterplayProfile: {
      telegraphs: ["The wax face turns toward a creature that recognizes it before the approach."],
      positioningAnswers: ["Maintain overlapping threat zones and deny a clean route through the formation."],
      breakConditions: ["Fire softens the wax and makes the attack sequence easier to punish."],
      nonDamageAnswers: ["Rejecting or obscuring the borrowed identity denies the safest approach."],
    },
    complexityProfile: { decisionLoad: 1, sequencing: 1, conditionalBranches: 1, tracking: 1 },
    spikeRiskProfile: { openingBurst: 1, controlSpike: 1, repeatability: 2 },
  },
};

const EARLY_SECOND_ABILITY_AT_CR_1 = new Set([
  "venomous-bite",
  "venomous-spit",
  "grave-bite",
  "infected-bite",
]);

const MULTIATTACK_AT_CR_1 = new Set([
  "venomous-bite",
  "venomous-spit",
]);

const SECOND_ABILITY_AT_CR_5 = new Set([
  "empowered-slam",
  "acid-vomit",
  "corpse-grab",
]);


const MULTIATTACK_AT_CR_2 = new Set([
  "venomous-bite",
  "venomous-spit",
  "grave-bite",
  "infected-bite",
  "purulent-bite",
  "perforate",
  "web-recharge",
  "shadow-web",
  "brood-injection",
  "slam-decomposition",
]);

const MULTIATTACK_AT_CR_5 = new Set([
  ...MULTIATTACK_AT_CR_2,
  "empowered-slam",
  "acid-vomit",
  "corpse-grab",
  "corpse-tendrils",
]);

const THIRD_ABILITY_AT_CR_8 = new Set([
  "venomous-bite",
  "infected-bite",
  "perforate",
]);

const THREE_ATTACKS_FROM_CR_8 = new Set([
  "grave-bite",
  "infected-bite",
  "purulent-bite",
  "venomous-bite",
  "perforate",
  "web-recharge",
  "shadow-web",
  "venomous-spit",
  "brood-injection",
]);

function uniqueIds(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function takeAbilityIds(allAbilityIds, count) {
  return allAbilityIds.slice(0, Math.max(1, Math.min(allAbilityIds.length, count)));
}

function buildPatternProgression(id, pattern) {
  const allAbilityIds = pattern.abilities.map((ability) => ability.id);
  const mode = pattern.routine?.multiattack?.mode || "fixed";
  const lowAbilityCount = EARLY_SECOND_ABILITY_AT_CR_1.has(id) ? 2 : 1;
  const developedAbilityCount =
    id === "cold-funeral-touch" || SECOND_ABILITY_AT_CR_5.has(id) ? 1 : 2;
  const veteranAbilityCount = id === "cold-funeral-touch" ? 1 : 2;
  const matureAbilityCount = THIRD_ABILITY_AT_CR_8.has(id) ? 3 : veteranAbilityCount;
  const lowMultiattack = MULTIATTACK_AT_CR_1.has(id);
  const developedMultiattack = MULTIATTACK_AT_CR_2.has(id);
  const veteranMultiattack = MULTIATTACK_AT_CR_5.has(id);
  const rapidCadence = THREE_ATTACKS_FROM_CR_8.has(id);
  return {
    schemaVersion: MONSTER_ATTACK_PATTERN_PROGRESSION_SCHEMA_VERSION,
    basis: "targetCr",
    calibration: "Bestiary.csv-503-monsters",
    calibrationTargets: {
      cr0To1: { meanOptions: 1.33, multiattackRate: 0.1371, medianAttacks: 2 },
      cr2To4: { meanOptions: 1.72, multiattackRate: 0.7008, medianAttacks: 2 },
      cr5To8: { meanOptions: 1.91, multiattackRate: 0.9388, medianAttacks: 2 },
      cr9To12: { meanOptions: 1.98, multiattackRate: 0.9787, medianAttacks: 3 },
      cr13Plus: { meanOptions: 2.6, multiattackRate: 0.9615, medianAttacks: 3 },
    },
    bands: [
      {
        id: "cr-0-1-nascent",
        minCr: 0,
        maxCr: 1,
        abilityIds: takeAbilityIds(allAbilityIds, lowAbilityCount),
        multiattack: { enabled: lowMultiattack, mode, count: lowMultiattack ? 2 : 0 },
      },
      {
        id: "cr-2-4-developed",
        minCr: 2,
        maxCr: 4,
        abilityIds: takeAbilityIds(allAbilityIds, developedAbilityCount),
        multiattack: { enabled: developedMultiattack, mode, count: developedMultiattack ? 2 : 0 },
      },
      {
        id: "cr-5-7-veteran",
        minCr: 5,
        maxCr: 7,
        abilityIds: takeAbilityIds(allAbilityIds, veteranAbilityCount),
        multiattack: { enabled: veteranMultiattack, mode, count: veteranMultiattack ? 2 : 0 },
      },
      {
        id: "cr-8-12-mature",
        minCr: 8,
        maxCr: 12,
        abilityIds: takeAbilityIds(allAbilityIds, matureAbilityCount),
        multiattack: { enabled: true, mode, count: rapidCadence ? 3 : 2 },
      },
      {
        id: "cr-13-30-apex",
        minCr: 13,
        maxCr: 30,
        abilityIds: allAbilityIds,
        multiattack: { enabled: true, mode, count: 3 },
      },
    ],
  };
}

function withCrProgression(id, pattern) {
  return {
    ...pattern,
    progression: buildPatternProgression(id, pattern),
  };
}

export const MONSTER_ATTACK_PATTERN_MIGRATIONS = Object.freeze(
  Object.fromEntries(
    Object.entries(PATTERNS).map(([id, pattern]) => [
      id,
      freezePattern(withCrProgression(id, pattern)),
    ]),
  ),
);

export const MONSTER_ATTACK_PATTERN_IDS = Object.freeze(
  Object.keys(MONSTER_ATTACK_PATTERN_MIGRATIONS),
);

export function getMonsterAttackPatternMigration(id) {
  return MONSTER_ATTACK_PATTERN_MIGRATIONS[String(id || "").trim()] || null;
}
