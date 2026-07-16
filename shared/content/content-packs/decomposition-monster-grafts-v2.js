export const DECOMPOSITION_MONSTER_GRAFT_V2_DEFINITIONS = Object.freeze(
  [
    {
      id: "swollen-corpse",
      title: "Swollen Corpse Vessel",
      slot: "body",
      summary:
        "The body is stretched tight with grave gas, purge fluid, and unstable pressure.",
      mechanics:
        "When the creature is first bloodied, each creature within 5 feet makes a Constitution save. On a failure, the target has the Poisoned condition until the end of its next turn.",
      counterplay:
        "The skin shines, creaks, and bulges before the pressure releases.",
      monster: {
        graftId: "swollen-corpse",
        slot: "body",
        section: "trait",
        typeBias: ["undead", "aberration"],
        roleBias: ["minion", "standard", "boss"],
        cost: 3,
        complexity: 1,
        stats: {
          hp: 12,
          dpr: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["minion", "standard"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tacticalRoles: {
            recommended: ["brute", "support", "controller"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: "When the creature is first bloodied.",
          resolution: {
            type: "savingThrow",
            ability: "constitution",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "radius",
            size: 5,
            unit: "ft",
            targets: "creatures",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: {
            names: ["poisoned"],
            severity: "moderate",
            duration: "until the end of its next turn",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          counterplay: {
            telegraph: true,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {
            failure:
              "The target has the Poisoned condition until the end of its next turn.",
            success: "No effect.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "fresh-bloat-hide",
      title: "Fresh Bloat Hide",
      slot: "body",
      summary:
        "The cadaver has only recently entered the bloating stage and still moves with heavy resilience.",
      mechanics:
        "The creature gains a +2 bonus to AC while it has more than half its hit points. When bloodied, reduce its AC by 2 and increase its walking speed by 10 feet.",
      counterplay:
        "The tight outer layer tears away as the corpse takes damage.",
      monster: {
        graftId: "fresh-bloat-hide",
        slot: "body",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["standard", "boss"],
        cost: 4,
        complexity: 1,
        stats: {
          ac: 2,
          hp: 18,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard", "fast", "ambusher"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tacticalRoles: {
            recommended: ["brute", "support", "skirmisher", "lurker"],
          },
          tiers: {
            recommended: ["elite", "boss", "setpiece"],
          },
          cr: {
            recommendedMin: 5,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: "When bloodied.",
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: false,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "volatile-immobile-mass",
      title: "Volatile Immobile Mass",
      slot: "body",
      summary:
        "The corpse is too swollen to walk and functions like a living explosive hazard.",
      mechanics:
        "The creature's speed becomes 0. It gains reach 10 ft. with body, bite, or grab attacks. Effects that push, pull, or drag it move it only half the normal distance.",
      counterplay:
        "Players can reposition around it, attack from range, or use forced movement to aim the eventual rupture.",
      monster: {
        graftId: "volatile-immobile-mass",
        slot: "body",
        section: "trait",
        typeBias: ["undead", "aberration"],
        roleBias: ["boss", "standard"],
        cost: 5,
        complexity: 2,
        stats: {
          hp: 28,
          ac: -1,
          control: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["boss", "standard"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tacticalRoles: {
            recommended: ["brute", "support", "controller"],
          },
          tiers: {
            recommended: ["elite", "boss", "setpiece"],
          },
          cr: {
            recommendedMin: 5,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: null,
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: false,
            positioningAnswer: true,
            nonDamageAnswer: true,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "skin-slippage",
      title: "Skin Slippage",
      slot: "body",
      summary:
        "Outer layers detach in wet sheets when the corpse is grabbed or struck.",
      mechanics:
        "The creature has advantage on checks and saves made to escape a grapple. A creature that grapples it must succeed on a Constitution save or have disadvantage on the next attack roll it makes before the end of its turn.",
      counterplay:
        "Characters see the loose skin sliding before they commit to a grapple.",
      monster: {
        graftId: "skin-slippage",
        slot: "body",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: 2,
        complexity: 1,
        stats: {
          fairness: 1,
          control: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["minion", "standard"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tacticalRoles: {
            recommended: ["brute", "support", "controller"],
          },
          tiers: {
            recommended: ["normal", "elite"],
          },
          cr: {
            recommendedMax: 10,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: null,
          resolution: {
            type: "savingThrow",
            ability: "constitution",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "single",
            targets: "one creature that grapples it",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
          },
          condition: null,
          counterplay: {
            telegraph: true,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {
            failure:
              "The target has disadvantage on the next attack roll it makes before the end of its turn.",
            success: "No additional effect.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "mindless-command",
      title: "Mindless Command Loop",
      slot: "mind",
      summary: "It follows a single order and lacks tactical awareness.",
      mechanics:
        "At the start of combat, define one simple command. The creature prioritizes that command even when doing so is tactically poor. If no command applies, it attacks the nearest living creature.",
      counterplay:
        "Players can exploit the command by luring or blocking the creature.",
      monster: {
        graftId: "mindless-command",
        slot: "mind",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: 1,
        complexity: 1,
        stats: {
          fairness: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tacticalRoles: {
            recommended: ["support", "controller"],
          },
          tiers: {
            recommended: ["elite", "boss", "setpiece", "normal"],
          },
          cr: {
            recommendedMax: 10,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: null,
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: false,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "pressure-agony",
      title: "Pressure Agony",
      slot: "mind",
      summary:
        "The corpse is driven forward by swelling pain rather than hunger or thought.",
      mechanics:
        "When the creature starts its turn bloodied, it can move up to 10 feet toward the nearest enemy without provoking opportunity attacks, then it must attack that enemy if able.",
      counterplay: "It becomes easier to predict once damaged.",
      monster: {
        graftId: "pressure-agony",
        slot: "mind",
        section: "trait",
        typeBias: ["undead", "aberration"],
        roleBias: ["standard", "boss"],
        cost: 3,
        complexity: 2,
        stats: {
          dpr: 2,
          mobility: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: "When the creature starts its turn bloodied.",
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: {
            enabled: false,
          },
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: false,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {
            effect:
              "When the creature starts its turn bloodied, it can move up to 10 feet toward the nearest enemy without provoking Opportunity Attacks, then it must attack that enemy if able.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "stumbling-mass",
      title: "Stumbling Mass",
      slot: "movement",
      summary:
        "The corpse moves directly and poorly, ignoring obstacles and danger.",
      mechanics:
        "The creature ignores nonmagical difficult terrain created by rubble, corpses, or mud, but it has disadvantage on Dexterity saving throws.",
      counterplay: "Its path is obvious and can be shaped with hazards.",
      monster: {
        graftId: "stumbling-mass",
        slot: "movement",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: 1,
        complexity: 1,
        stats: {
          fairness: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tacticalRoles: {
            recommended: ["controller", "support", "brute"],
          },
          tiers: {
            recommended: ["normal", "elite"],
          },
          cr: {
            recommendedMax: 10,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: null,
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: true,
            breakCondition: false,
            positioningAnswer: true,
            nonDamageAnswer: false,
          },
          text: {
            effect:
              "The creature ignores nonmagical difficult terrain created by rubble, corpses, or mud, but it has disadvantage on Dexterity Saving Throws.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "rupture-charge",
      title: "Rupture Charge",
      slot: "movement",
      summary: "It rushes forward with enough force to split itself open.",
      mechanics:
        "The creature moves up to half its speed in a straight line toward a creature it can see. Its next Slam before the end of the turn deals extra bludgeoning damage equal to its proficiency bonus. After moving this way, roll a d6; on a 6, trigger one selected Unstable reaction without spending the reaction.",
      counterplay:
        "The charge requires a straight path and is obvious before it begins.",
      monster: {
        graftId: "rupture-charge",
        slot: "movement",
        section: "bonusAction",
        typeBias: ["undead"],
        roleBias: ["standard", "boss"],
        cost: 4,
        complexity: 2,
        stats: {
          mobility: 2,
          dpr: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard", "fast", "ambusher"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tacticalRoles: {
            recommended: ["skirmisher", "lurker", "brute"],
          },
          tiers: {
            recommended: ["elite", "boss", "setpiece"],
          },
          cr: {
            recommendedMin: 5,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "bonusAction",
          actionEconomy: "bonusAction",
          usage: {
            type: "atWill",
          },
          trigger: null,
          resolution: {
            type: "automatic",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "budget",
            scale: "minor",
            budgetRole: "bonusAction",
            types: ["bludgeoning"],
            budgetShare: 0.15,
            expectedTargets: 1,
            parts: [],
            roundWeight: [1, 1, 1],
          },
          condition: null,
          counterplay: {
            telegraph: true,
            breakCondition: true,
            positioningAnswer: true,
            nonDamageAnswer: false,
          },
          text: {
            effect:
              "The creature moves up to half its speed in a straight line toward a creature it can see. Its next Slam before the end of the turn deals {damage} Bludgeoning damage. After moving this way, roll a d6; on a 6, trigger one selected Unstable reaction without spending the reaction.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "collapsed-crawler",
      title: "Collapsed Crawler",
      slot: "movement",
      summary:
        "A damaged bloated corpse continues dragging itself forward after losing a limb.",
      mechanics:
        "The creature is immune to the Prone condition while its speed is 10 feet or lower. If an effect would knock it prone, reduce its speed by 5 feet until the end of combat instead.",
      counterplay:
        "Players can slow it by targeting legs, but cannot simply disable it with prone loops.",
      monster: {
        graftId: "collapsed-crawler",
        slot: "movement",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard"],
        cost: 2,
        complexity: 1,
        stats: {
          hp: 4,
          fairness: 1,
        },
        fit: {
          rules: {
            condition: {
              names: [],
              severity: "minor",
              duration: "",
              special: [],
            },
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: null,
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: {
            names: [],
            severity: "minor",
            duration: "",
            special: [],
          },
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "slam-decomposition",
      title: "Heavy Slam",
      slot: "attack",
      summary: "A simple blunt attack from a swollen corpse.",
      mechanics:
        "Melee Attack Roll. On hit, the target takes bludgeoning damage. If the creature moved at least 10 feet straight toward the target this turn, add one extra damage die.",
      counterplay: "Denying charge lanes keeps the attack ordinary.",
      monster: {
        graftId: "slam-decomposition",
        slot: "attack",
        section: "action",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: 2,
        complexity: 1,
        stats: {
          dpr: 4,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["minion", "standard"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tacticalRoles: {
            recommended: ["brute", "lurker"],
          },
          tiers: {
            recommended: ["normal", "elite"],
          },
          cr: {
            recommendedMax: 10,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "action",
          actionEconomy: "action",
          usage: {
            type: "atWill",
          },
          trigger: null,
          resolution: {
            type: "attackRoll",
            attackType: "melee",
            bonus: "monster",
            abilityBasis: "strength",
            reach: "5 ft.",
            range: null,
          },
          secondaryResolution: null,
          targeting: {
            type: "single",
            targets: "one target",
          },
          areaEffect: null,
          damage: {
            mode: "budget",
            scale: "standard",
            budgetRole: "mainAttack",
            types: ["bludgeoning"],
            budgetShare: 0.85,
            expectedTargets: 1,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: false,
            positioningAnswer: true,
            nonDamageAnswer: false,
          },
          text: {
            hit: "the target takes {damage} Bludgeoning damage. If the creature moved at least 10 feet straight toward the target this turn, add one extra damage die.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "empowered-slam",
      title: "Empowered Slam",
      slot: "attack",
      summary: "The corpse hits with enough mass to stagger a front line.",
      mechanics:
        "Melee Attack Roll. On hit, the target takes bludgeoning damage and must succeed on a Strength save or be pushed 5 feet. If the target collides with a creature or object, both take bludgeoning damage equal to the proficiency bonus.",
      counterplay:
        "The corpse visibly winds up before the slam; it is strongest near walls, allies, and cluttered terrain.",
      monster: {
        graftId: "empowered-slam",
        slot: "attack",
        section: "action",
        typeBias: ["undead"],
        roleBias: ["standard", "boss"],
        cost: 4,
        complexity: 1,
        stats: {
          dpr: 7,
        },
        fit: {
          rules: {
            condition: {
              names: [],
              severity: "minor",
              duration: "",
              special: [],
            },
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "action",
          actionEconomy: "action",
          usage: {
            type: "atWill",
          },
          trigger: null,
          resolution: {
            type: "attackRoll",
            attackType: "melee",
            abilityBasis: "strength",
            bonus: "monster",
            reach: "5 ft.",
          },
          secondaryResolution: {
            type: "savingThrow",
            ability: "strength",
            dc: "monster",
          },
          targeting: {
            type: "single",
            targets: "one target",
          },
          areaEffect: null,
          damage: {
            mode: "budget",
            budgetRole: "mainAttack",
            budgetShare: 0.85,
            scale: "standard",
            types: ["bludgeoning"],
            expectedTargets: 1,
            parts: [],
          },
          condition: {
            names: [],
            severity: "minor",
            duration: "",
            special: [],
          },
          counterplay: {
            telegraph: true,
            breakCondition: true,
            positioningAnswer: true,
            nonDamageAnswer: false,
          },
          text: {
            hit: "the target takes {damage} Bludgeoning damage and must make a Strength Saving Throw.",
            failure:
              "The target is pushed 5 feet. If it collides with a creature or object, both take {pb} Bludgeoning damage.",
            success: "The target is not pushed.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "existing-structured-rules",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "acid-vomit",
      title: "Acid Vomit",
      slot: "attack",
      summary:
        "It emits purge fluid in a pressurized cone that keeps burning after impact.",
      mechanics:
        "Recharge 5-6. Creatures in a 30-foot cone make a Dexterity save. On a failure, a target takes acid damage and is covered in purge fluid. While covered, the target cannot regain hit points and takes acid damage at the start of each of its turns. A creature can use an action to clean the fluid with a suitable approach.",
      counterplay:
        "The throat distends and leaks dark fluid before the recharge attack.",
      monster: {
        graftId: "acid-vomit",
        slot: "attack",
        section: "action",
        typeBias: ["undead", "aberration"],
        roleBias: ["boss", "standard"],
        cost: 6,
        complexity: 3,
        stats: {
          dpr: 7,
          control: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["boss", "standard"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
            min: "hard",
          },
          tacticalRoles: {
            recommended: ["controller", "support", "artillery", "brute"],
          },
          tiers: {
            recommended: ["elite", "boss", "setpiece", "legendary"],
            min: "elite",
          },
          cr: {
            recommendedMin: 7,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "action",
          actionEconomy: "action",
          usage: {
            type: "recharge",
            value: "5-6",
          },
          trigger: null,
          resolution: {
            type: "savingThrow",
            ability: "dexterity",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "cone",
            size: 30,
            unit: "ft",
            targets: "each creature",
          },
          areaEffect: null,
          damage: {
            mode: "budget",
            budgetRole: "rechargeControl",
            budgetShare: 0.85,
            expectedTargets: 1.5,
            roundWeight: [1, 0.35, 0.35],
            scale: "standard",
            types: ["acid"],
            parts: [],
          },
          condition: {
            names: [],
            special: ["healing-denial"],
            severity: "major",
            duration: "until cleaned",
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          counterplay: {
            telegraph: true,
            breakCondition: true,
            positioningAnswer: true,
            nonDamageAnswer: true,
          },
          text: {
            failure:
              "The target takes {damage} Acid damage and is covered in purge fluid. While covered, it can't regain Hit Points and takes {pb} Acid damage at the start of each of its turns. A creature can take an action to clean the fluid with a suitable approach.",
            success: "Half damage only.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "existing-structured-rules",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "corpse-grab",
      title: "Corpse Grab",
      slot: "attack",
      summary: "The corpse pins a victim against its swollen body.",
      mechanics:
        "One Large or smaller creature within reach makes a Dexterity save. On a failure, the target has the Grappled condition and is Restrained while the grapple lasts. The target can escape with an Athletics or Acrobatics check against the monster DC.",
      counterplay: "The creature can usually hold only one target this way.",
      monster: {
        graftId: "corpse-grab",
        slot: "attack",
        section: "action",
        typeBias: ["undead"],
        roleBias: ["standard", "boss"],
        cost: 4,
        complexity: 2,
        stats: {
          control: 2,
          dpr: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
          tiers: {
            recommended: ["elite", "boss", "setpiece"],
          },
          cr: {
            recommendedMin: 5,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "action",
          actionEconomy: "action",
          usage: {
            type: "atWill",
          },
          trigger: null,
          resolution: {
            type: "savingThrow",
            ability: "dexterity",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "single",
            targets: "one Large or smaller creature within reach",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: {
            names: ["grappled", "restrained"],
            severity: "major",
            duration: "until the grapple ends",
            sizeLimit: "",
            special: [],
            escape: null,
            repeatSave: null,
          },
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: true,
            nonDamageAnswer: false,
          },
          text: {
            failure:
              "The target has the Grappled condition and has the Restrained condition while the grapple lasts. The target can escape with an Athletics or Acrobatics check against DC {dc}.",
            success: "The target is not grappled.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "existing-structured-rules",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "gas-buildup",
      title: "Gas Buildup",
      slot: "twist",
      summary: "Dropping the corpse can trigger the thing everyone feared.",
      mechanics:
        "When the creature drops to 0 hit points, roll a d6. On a 4 or higher, trigger one selected Unstable reaction before the creature dies.",
      counterplay:
        "Radiant damage, careful positioning, or distance can reduce the danger of the final hit.",
      monster: {
        graftId: "gas-buildup",
        slot: "twist",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: 3,
        complexity: 2,
        stats: {
          dpr: 2,
          control: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tiers: {
            recommended: ["elite", "boss", "legendary", "setpiece"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: "When the creature drops to 0 hit points.",
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: true,
            nonDamageAnswer: true,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "unstable-rupture",
      title: "Unstable Rupture",
      slot: "twist",
      summary: "Piercing or slashing damage can make the battlefield worse.",
      mechanics:
        "Trigger: the creature takes piercing or slashing damage. Response: roll a d6. On a 6, the creature releases a toxic rupture. Dexterity Saving Throw: creatures within 10 feet. Failure: the target takes poison and slashing damage. Success: half damage only.",
      counterplay:
        "Bludgeoning, cold, radiant, and many spell attacks avoid the trigger.",
      monster: {
        graftId: "unstable-rupture",
        slot: "twist",
        section: "reaction",
        typeBias: ["undead", "aberration"],
        roleBias: ["minion", "standard", "boss"],
        cost: 4,
        complexity: 2,
        stats: {
          dpr: 3,
          control: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard", "fast", "ambusher", "legendary"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tiers: {
            recommended: ["elite", "boss", "legendary", "setpiece"],
          },
          tacticalRoles: {
            recommended: ["controller", "support", "artillery"],
          },
          cr: {
            recommendedMin: 5,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "reaction",
          actionEconomy: "reaction",
          usage: {
            type: "triggered",
          },
          trigger: "the creature takes piercing or slashing damage.",
          resolution: {
            type: "savingThrow",
            ability: "dexterity",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "radius",
            size: 10,
            unit: "ft",
            targets: "creatures",
          },
          areaEffect: null,
          damage: {
            mode: "budget",
            scale: "minor",
            budgetRole: "reactionPunish",
            types: ["poison", "slashing"],
            budgetShare: 0.25,
            expectedTargets: 1.25,
            parts: [],
            roundWeight: [0.1, 0.1, 0.1],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: true,
          },
          text: {
            failure: "The target takes {damage} Poison and Slashing damage.",
            success: "Half damage only.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "dangerously-unstable",
      title: "Dangerously Unstable",
      slot: "twist",
      summary:
        "The creature is an encounter-scale bomb waiting for a puncture.",
      mechanics:
        "Trigger: the creature takes piercing or slashing damage. Response: roll a d6. On a 2 or higher, it detonates and destroys itself. Creatures in a 40-foot sphere make a Dexterity save, taking heavy poison damage and falling Prone on a failure, or taking half damage on a success. Creatures out to 80 feet take minor thunder damage and may be Deafened for 1 minute.",
      counterplay:
        "Its immobility, swelling, and audible pressure make the blast radius readable before combat.",
      monster: {
        graftId: "dangerously-unstable",
        slot: "twist",
        section: "reaction",
        typeBias: ["undead", "aberration"],
        roleBias: ["boss"],
        cost: 8,
        complexity: 3,
        stats: {
          dpr: 8,
          control: 3,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["boss"],
            recommended: ["boss"],
          },
          tempo: {
            recommended: ["slow", "standard", "fast", "ambusher", "legendary"],
          },
          danger: {
            recommended: ["hard", "horror"],
            min: "horror",
          },
          tiers: {
            recommended: ["elite", "boss", "legendary", "setpiece"],
            min: "boss",
          },
          cr: {
            recommendedMin: 7,
          },
          tacticalRoles: {
            recommended: ["controller", "support", "artillery"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "reaction",
          actionEconomy: "reaction",
          usage: {
            type: "triggered",
          },
          trigger: "The creature takes Piercing or Slashing damage.",
          resolution: {
            type: "savingThrow",
            ability: "dexterity",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "sphere",
            size: 40,
            unit: "ft",
            targets: "each creature",
          },
          areaEffect: null,
          damage: {
            mode: "budget",
            budgetRole: "deathBurst",
            budgetShare: 1.35,
            expectedTargets: 1.75,
            roundWeight: [0, 0, 0.25],
            scale: "heavy",
            types: ["poison"],
            parts: [],
          },
          condition: {
            names: ["prone", "deafened"],
            severity: "major",
            duration: "Prone is instant; Deafened lasts 1 minute",
            sizeLimit: "",
            special: [],
            escape: null,
            repeatSave: null,
          },
          counterplay: {
            telegraph: true,
            breakCondition: false,
            positioningAnswer: true,
            nonDamageAnswer: true,
          },
          text: {
            failure:
              "The target takes {damage} Poison damage and has the Prone condition. Creatures out to 80 feet take Thunder damage equal to the monster's Proficiency Bonus and may have the Deafened condition for 1 minute.",
            success: "Half damage only.",
            response:
              "Roll a d6. On a 2 or higher, the creature detonates and destroys itself. {save} Failure: The target takes {damage} Poison damage and has the Prone condition. Success: Half damage only. Creatures out to 80 feet take Thunder damage equal to the monster's Proficiency Bonus and may have the Deafened condition for 1 minute.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "existing-structured-rules",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "undead-fortitude",
      title: "Undead Fortitude",
      slot: "twist",
      summary: "The corpse refuses to stop unless destroyed correctly.",
      mechanics:
        "If damage reduces the creature to 0 hit points, it makes a Constitution save with a DC equal to 5 plus the damage taken, unless the damage is radiant, from a critical hit, or caused it to explode. On a success, it drops to 1 hit point instead.",
      counterplay: "Radiant damage and critical hits bypass the feature.",
      monster: {
        graftId: "undead-fortitude",
        slot: "twist",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: 3,
        complexity: 2,
        stats: {
          hp: 10,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tiers: {
            recommended: ["elite", "boss", "legendary", "setpiece"],
          },
          tacticalRoles: {
            recommended: ["brute", "support", "controller"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "freeTrigger",
          usage: {
            type: "triggered",
          },
          trigger: "Damage reduces the creature to 0 Hit Points.",
          resolution: {
            type: "savingThrow",
            ability: "constitution",
            dc: "special",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: true,
          },
          text: {
            effect:
              "If damage reduces the creature to 0 Hit Points, it makes a Constitution Saving Throw with a DC equal to 5 plus the damage taken, unless the damage is Radiant, from a Critical Hit, or caused it to explode. Success: The creature drops to 1 Hit Point instead.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "existing-structured-rules",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "siege-corpse",
      title: "Siege Corpse",
      slot: "twist",
      summary:
        "The bloated mass crushes doors, barricades, and structures by accident.",
      mechanics: "The creature deals double damage to objects and structures.",
      counterplay:
        "Barricades buy time but should not be trusted as permanent safety.",
      monster: {
        graftId: "siege-corpse",
        slot: "twist",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["standard", "boss"],
        cost: 2,
        complexity: 1,
        stats: {
          dpr: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tiers: {
            recommended: ["elite", "boss", "legendary", "setpiece", "normal"],
          },
          tacticalRoles: {
            recommended: ["brute", "lurker"],
          },
          cr: {
            recommendedMax: 10,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: null,
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: false,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "head-weak-spot",
      title: "Head Weak Spot",
      slot: "weakness",
      summary: "The head remains the most reliable way to end the corpse.",
      mechanics:
        "A character can target the head with a called shot. The attack takes a -5 penalty. On a hit, the attack becomes a critical hit.",
      counterplay:
        "This gives precision-focused players a clear high-risk answer.",
      monster: {
        graftId: "head-weak-spot",
        slot: "weakness",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: -2,
        complexity: 1,
        stats: {
          fairness: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["minion", "standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tiers: {
            recommended: ["normal", "elite", "boss", "legendary", "setpiece"],
          },
          cr: {
            recommendedMax: 10,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: null,
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: true,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "mechanical-stress",
      title: "Mechanical Stress",
      slot: "weakness",
      summary:
        "Massive hits tear off parts without always detonating the whole corpse.",
      mechanics:
        "When the creature takes more than half its maximum hit points in one hit, the attacker chooses head, arms, or leg. Head: the creature has the Blinded condition but dies in 2 rounds without triggering Gas Buildup. Arms: it has disadvantage on attacks requiring arms. Leg: it has the Prone condition and its speed becomes 5 feet.",
      counterplay:
        "Large wounds are visible stress points before rupture; big single hits can solve the encounter in a controlled way.",
      monster: {
        graftId: "mechanical-stress",
        slot: "weakness",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["standard", "boss"],
        cost: -2,
        complexity: 2,
        stats: {
          fairness: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tiers: {
            recommended: ["normal", "elite", "boss", "legendary", "setpiece"],
          },
          cr: {
            recommendedMax: 30,
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger:
            "When the creature takes more than half its maximum hit points in one hit.",
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: {
            names: ["blinded", "prone"],
            severity: "moderate",
            direction: "referenceOnly",
            duration: "unspecified",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          counterplay: {
            telegraph: false,
            breakCondition: false,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {
            effect:
              "When the monster takes more than half its maximum Hit Points in one hit, the attacker chooses head, arms, or leg. Head: the monster has the Blinded condition but dies in 2 rounds without triggering Gas Buildup. Arms: the monster has Disadvantage on attacks requiring arms. Leg: the monster has the Prone condition, and its Speed becomes 5 feet.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "radiant-preservation-failure",
      title: "Radiant Preservation Failure",
      slot: "weakness",
      summary:
        "Holy light collapses the necromancy before the gases can weaponize the corpse.",
      mechanics:
        "When the creature takes radiant damage, it cannot use Unstable reactions until the start of its next turn.",
      counterplay:
        "Radiant damage becomes a safety tool, not just a damage type.",
      monster: {
        graftId: "radiant-preservation-failure",
        slot: "weakness",
        section: "trait",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: -1,
        complexity: 1,
        stats: {
          fairness: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["minion", "standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror", "standard"],
          },
          tiers: {
            recommended: ["normal", "elite", "boss", "legendary", "setpiece"],
          },
          cr: {
            recommendedMax: 10,
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "trait",
          actionEconomy: "passive",
          usage: {
            type: "passive",
          },
          trigger: "When the creature takes radiant damage.",
          resolution: {
            type: "none",
          },
          secondaryResolution: null,
          targeting: {
            type: "self",
            targets: "the creature",
          },
          areaEffect: null,
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: true,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: true,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "corpse-bloom-death",
      title: "Corpse Bloom Death",
      slot: "death",
      summary:
        "When it dies, the body becomes terrain and clue at the same time.",
      mechanics:
        "On death, the corpse creates a 10-foot patch of slick rot. The area is difficult terrain. A character who examines it can find one clue tied to the Source Anchor.",
      counterplay:
        "Players can drag or burn the body before the bloom spreads.",
      monster: {
        graftId: "corpse-bloom-death",
        slot: "death",
        section: "death",
        typeBias: ["undead", "aberration", "beast"],
        roleBias: ["minion", "standard", "boss"],
        cost: 3,
        complexity: 2,
        stats: {
          dpr: 2,
          control: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tiers: {
            recommended: ["normal", "elite", "boss", "setpiece"],
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "death",
          actionEconomy: "deathTrigger",
          usage: {
            type: "death",
          },
          trigger: "The creature dies or drops to 0 hit points.",
          resolution: {
            type: "automatic",
          },
          secondaryResolution: null,
          targeting: {
            type: "custom",
            targets: "the death trigger area or named target",
          },
          areaEffect: {
            enabled: true,
            type: "aura",
            shape: "radius",
            size: 10,
            unit: "ft",
            origin: "self",
            timing: "passive",
            targets: "creatures",
            excludes: [],
            repeatTiming: "passive",
            text: "When the creature dies or drops to 0 Hit Points, its corpse creates a 10-foot Radius patch of slick rot. The area is difficult terrain. A creature that examines the patch can find one clue tied to the Source Anchor.",
          },
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: true,
            breakCondition: false,
            positioningAnswer: true,
            nonDamageAnswer: false,
          },
          text: {},
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "toxic-detonation",
      title: "Toxic Detonation",
      slot: "death",
      summary: "The corpse finally ruptures when destroyed.",
      mechanics:
        "When the creature dies or drops to 0 Hit Points, it releases a toxic burst. Dexterity Saving Throw: each creature in a 10-foot Radius. Failure: the target takes poison damage and has the Poisoned condition until the end of its next turn. Success: half damage only.",
      counterplay:
        "The corpse visibly distends before death; the safest play is to finish it from range or with radiant damage.",
      monster: {
        graftId: "toxic-detonation",
        slot: "death",
        section: "death",
        typeBias: ["undead"],
        roleBias: ["minion", "standard", "boss"],
        cost: 5,
        complexity: 2,
        stats: {
          dpr: 1,
          control: 1,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["minion", "standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tiers: {
            recommended: ["normal", "elite", "boss", "setpiece"],
          },
          tacticalRoles: {
            recommended: ["controller", "support", "artillery"],
          },
          cr: {
            recommendedMin: 5,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "death",
          actionEconomy: "deathTrigger",
          usage: {
            type: "death",
          },
          trigger: "The creature dies or drops to 0 hit points.",
          resolution: {
            type: "savingThrow",
            ability: "dexterity",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "radius",
            size: 10,
            unit: "ft",
            targets: "creatures",
          },
          areaEffect: null,
          damage: {
            mode: "budget",
            scale: "minor",
            budgetRole: "deathBurst",
            types: ["poison"],
            budgetShare: 0.45,
            expectedTargets: 1.25,
            parts: [],
            roundWeight: [0, 0, 0.25],
          },
          condition: {
            names: ["poisoned"],
            severity: "moderate",
            duration: "until the end of its next turn",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: true,
            nonDamageAnswer: true,
          },
          text: {
            failure:
              "The target takes {damage} Poison damage and has the Poisoned condition until the end of its next turn.",
            success: "Half damage only.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "purge-fluid-flood",
      title: "Purge Fluid Flood",
      slot: "death",
      summary:
        "Dark fluid spills from the body and turns the floor into a disgusting hazard.",
      mechanics:
        "On death, a 15-foot area becomes slick and foul until cleaned or burned away. It is difficult terrain. A creature that enters it for the first time on a turn or starts there makes a Dexterity save or falls Prone.",
      counterplay:
        "The leaking fluid is visible before it spreads; fire, sand, holy water, or clever cleaning can neutralize the area.",
      monster: {
        graftId: "purge-fluid-flood",
        slot: "death",
        section: "death",
        typeBias: ["undead", "aberration"],
        roleBias: ["standard", "boss"],
        cost: 4,
        complexity: 2,
        stats: {
          control: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["standard", "boss"],
            recommended: ["standard", "boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
          },
          tiers: {
            recommended: ["normal", "elite", "boss", "setpiece"],
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
          cr: {
            recommendedMin: 5,
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "death",
          actionEconomy: "deathTrigger",
          usage: {
            type: "death",
          },
          trigger: "The creature dies or drops to 0 hit points.",
          resolution: {
            type: "savingThrow",
            ability: "dexterity",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "radius",
            size: 15,
            unit: "ft",
            targets: "creatures",
          },
          areaEffect: {
            enabled: true,
            type: "aura",
            shape: "radius",
            size: 15,
            unit: "ft",
            origin: "self",
            targetingText:
              "each creature in a 15-foot Radius centered on the corpse",
            timing: "passive",
            targets: "creatures",
            excludes: [],
            repeatTiming: "passive",
            text: "",
          },
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: {
            names: ["prone"],
            severity: "moderate",
            duration: "until cleaned or burned away",
            special: [],
            sizeLimit: "",
            escape: null,
            repeatSave: null,
          },
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: true,
            nonDamageAnswer: true,
          },
          text: {
            failure:
              "The target has the {condition-list}. The condition lasts until cleaned or burned away.",
            success: "No effect.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "choking-air",
      title: "Choking Air",
      slot: "lair",
      summary: "The room itself becomes a failing lung.",
      mechanics:
        "At initiative count 20, choose one 10-foot area. Until the next count 20, the area is lightly obscured, and creatures that start there make a Constitution save or cannot take reactions until their next turn.",
      counterplay:
        "The air visibly thickens before the initiative count resolves.",
      monster: {
        graftId: "choking-air",
        slot: "lair",
        section: "lairAction",
        typeBias: ["undead", "aberration"],
        roleBias: ["boss"],
        cost: 5,
        complexity: 3,
        stats: {
          control: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["boss"],
            recommended: ["boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
            min: "horror",
          },
          tiers: {
            min: "boss",
            recommended: ["boss", "legendary", "setpiece", "elite"],
          },
          cr: {
            recommendedMin: 5,
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "lairAction",
          actionEconomy: "lairAction",
          usage: {
            type: "lair",
          },
          trigger: null,
          resolution: {
            type: "savingThrow",
            ability: "constitution",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "radius",
            size: 10,
            unit: "ft",
            targets: "creatures",
          },
          areaEffect: {
            enabled: true,
            type: "aura",
            shape: "radius",
            size: 10,
            unit: "ft",
            origin: "point",
            targetingText:
              "each creature in a 10-foot Radius at a point the monster can see",
            timing: "initiativeCount20",
            targets: "creatures",
            excludes: [],
            repeatTiming: "initiativeCount20",
            text: "",
          },
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: true,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: false,
          },
          text: {
            failure:
              "The target cannot take reactions until the start of its next turn while it remains in the choking area.",
            success: "No effect.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
    {
      id: "corpse-pressure-room",
      title: "Corpse Pressure Room",
      slot: "lair",
      summary:
        "Nearby corpses swell and begin acting as secondary pressure hazards.",
      mechanics:
        "At initiative count 20, one corpse or body part in the lair swells. Until the next count 20, the first creature that moves within 5 feet of it triggers a small toxic burst requiring a Constitution save.",
      counterplay:
        "The swelling corpses are visible warnings before they burst; players can identify them and avoid, move, or destroy them safely.",
      monster: {
        graftId: "corpse-pressure-room",
        slot: "lair",
        section: "lairAction",
        typeBias: ["undead"],
        roleBias: ["boss"],
        cost: 6,
        complexity: 3,
        stats: {
          control: 2,
          dpr: 2,
        },
        fit: {
          schemaVersion: "monster-frame-fit-v1.0",
          encounterRoles: {
            allowed: ["boss"],
            recommended: ["boss"],
          },
          tempo: {
            recommended: ["slow", "standard"],
          },
          danger: {
            recommended: ["hard", "horror"],
            min: "horror",
          },
          tiers: {
            min: "boss",
            recommended: ["boss", "legendary", "setpiece"],
          },
          cr: {
            recommendedMin: 7,
          },
          tacticalRoles: {
            recommended: ["controller", "support"],
          },
        },
        rules: {
          schemaVersion: "monster-graft-rules-v1.12",
          section: "lairAction",
          actionEconomy: "lairAction",
          usage: {
            type: "lair",
          },
          trigger: null,
          resolution: {
            type: "savingThrow",
            ability: "constitution",
            dc: "monster",
          },
          secondaryResolution: null,
          targeting: {
            type: "area",
            shape: "radius",
            size: 5,
            unit: "ft",
            targets: "creatures",
          },
          areaEffect: {
            enabled: true,
            type: "aura",
            shape: "radius",
            size: 5,
            unit: "ft",
            origin: "point",
            targetingText:
              "each creature within 5 feet of the swelling corpse or body part",
            timing: "initiativeCount20",
            targets: "creatures",
            excludes: [],
            repeatTiming: "initiativeCount20",
            text: "",
          },
          damage: {
            mode: "none",
            budgetRole: "none",
            types: [],
            scale: "standard",
            budgetShare: null,
            expectedTargets: null,
            parts: [],
          },
          condition: null,
          counterplay: {
            telegraph: false,
            breakCondition: true,
            positioningAnswer: false,
            nonDamageAnswer: true,
          },
          text: {
            failure:
              "The target triggers the toxic burst and suffers its listed effect.",
            success: "The target avoids the burst.",
          },
          multiattack: null,
          spellcasting: null,
          defense: null,
          summon: null,
          procedure: null,
          references: [],
          ongoing: null,
          migration: {
            source: "content-conversion-v1.1",
            isStructured: true,
            convertedFrom: "legacy-mechanics",
          },
        },
        constraints: null,
        anatomyGrants: null,
      },
    },
  ].map((definition) => Object.freeze(definition)),
);
