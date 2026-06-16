const RAW_MONSTER_GRAFTS = [
  // Decomposition / Bloated
  {
    id: "swollen-corpse",
    title: "Swollen Corpse Vessel",
    slot: "body",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { hp: 12, dpr: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When the creature is first bloodied.",
        "resolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 5,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "poisoned"
            ],
            "severity": "moderate",
            "duration": "until the end of its next turn",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The target has the Poisoned condition until the end of its next turn.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The body is stretched tight with grave gas, purge fluid, and unstable pressure.",
    mechanics:
      "When the creature is first bloodied, each creature within 5 feet makes a Constitution save. On a failure, the target has the Poisoned condition until the end of its next turn.",
    counterplay: "The skin shines, creaks, and bulges before the pressure releases.",
  },
  {
    id: "fresh-bloat-hide",
    title: "Fresh Bloat Hide",
    slot: "body",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 1,
    stats: { ac: 2, hp: 18 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When bloodied.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary:
      "The cadaver has only recently entered the bloating stage and still moves with heavy resilience.",
    tags: ["bloated_body", "defensive_body"],
    mechanics:
      "The creature gains a +2 bonus to AC while it has more than half its hit points. When bloodied, reduce its AC by 2 and increase its walking speed by 10 feet.",
    counterplay: "The tight outer layer tears away as the corpse takes damage.",
    i18n: {
      it: {
        title: "Pelle da Gonfiore Fresco",
        summary: "Il cadavere è entrato da poco nella fase di gonfiore e si muove ancora con pesante resilienza.",
        mechanics: "La creatura ottiene un bonus di +2 alla CA mentre ha più della metà dei suoi punti ferita. Quando è sanguinante, riduci la sua CA di 2 e aumenta la sua velocità di camminata di 10 piedi.",
        counterplay: "Lo strato esterno teso si lacera man mano che il cadavere subisce danni.",
      },
    },
  },
  {
    id: "volatile-immobile-mass",
    title: "Volatile Immobile Mass",
    slot: "body",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 5,
    complexity: 2,
    stats: { hp: 28, ac: -1, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The corpse is too swollen to walk and functions like a living explosive hazard.",
    mechanics:
      "The creature's speed becomes 0. It gains reach 10 ft. with body, bite, or grab attacks. Effects that push, pull, or drag it move it only half the normal distance.",
    counterplay:
      "Players can reposition around it, attack from range, or use forced movement to aim the eventual rupture.",
  },
  {
    id: "skin-slippage",
    title: "Skin Slippage",
    slot: "body",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { fairness: 1, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one creature that grapples it"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The target has disadvantage on the next attack roll it makes before the end of its turn.",
            "success": "No additional effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Outer layers detach in wet sheets when the corpse is grabbed or struck.",
    mechanics:
      "The creature has advantage on checks and saves made to escape a grapple. A creature that grapples it must succeed on a Constitution save or have disadvantage on the next attack roll it makes before the end of its turn.",
    counterplay: "Characters see the loose skin sliding before they commit to a grapple.",
  },
  {
    id: "mindless-command",
    title: "Mindless Command Loop",
    slot: "mind",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 1,
    complexity: 1,
    stats: { fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It follows a single order and lacks tactical awareness.",
    mechanics:
      "At the start of combat, define one simple command. The creature prioritizes that command even when doing so is tactically poor. If no command applies, it attacks the nearest living creature.",
    counterplay: "Players can exploit the command by luring or blocking the creature.",
  },
  {
    id: "pressure-agony",
    title: "Pressure Agony",
    slot: "mind",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { dpr: 2, mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When the creature starts its turn bloodied.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "startsTurnInArea",
            "targets": "enemies",
            "excludes": [],
            "repeatTiming": "startsTurnInArea",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The corpse is driven forward by swelling pain rather than hunger or thought.",
    mechanics:
      "When the creature starts its turn bloodied, it can move up to 10 feet toward the nearest enemy without provoking opportunity attacks, then it must attack that enemy if able.",
    counterplay: "It becomes easier to predict once damaged.",
    i18n: {
      it: {
        title: "Agonia da Pressione",
        summary: "Il cadavere è spinto in avanti dal dolore del gonfiore, non dalla fame o dal pensiero.",
        mechanics: "Quando la creatura inizia il suo turno mentre è sanguinante, può muoversi fino a 10 piedi verso il nemico più vicino senza provocare attacchi di opportunità, poi deve attaccare quel nemico se può farlo.",
        counterplay: "Diventa più facile da prevedere dopo essere stata ferita.",
      },
    },
  },
  {
    id: "stumbling-mass",
    title: "Stumbling Mass",
    slot: "movement",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 1,
    complexity: 1,
    stats: { fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {
            "effect": "The creature ignores nonmagical difficult terrain created by rubble, corpses, or mud, but it has disadvantage on Dexterity Saving Throws."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The corpse moves directly and poorly, ignoring obstacles and danger.",
    mechanics:
      "The creature ignores nonmagical difficult terrain created by rubble, corpses, or mud, but it has disadvantage on Dexterity saving throws.",
    counterplay: "Its path is obvious and can be shaped with hazards.",
    i18n: {
      it: {
        title: "Massa Barcollante",
        summary: "Il cadavere si muove in modo diretto e maldestro, ignorando ostacoli e pericolo.",
        mechanics: "La creatura ignora il terreno difficile non magico creato da macerie, cadaveri o fango, ma ha svantaggio ai Tiri Salvezza su Destrezza.",
        counterplay: "La sua traiettoria è evidente e può essere manipolata con pericoli ambientali.",
      },
    },
  },
  {
    id: "rupture-charge",
    title: "Rupture Charge",
    slot: "movement",
    section: "bonusAction",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { mobility: 2, dpr: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "bonusAction",
        "actionEconomy": "bonusAction",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "bludgeoning"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It rushes forward with enough force to split itself open.",
    mechanics:
      "The creature moves up to half its speed in a straight line toward a creature it can see. Its next Slam before the end of the turn deals extra bludgeoning damage equal to its proficiency bonus. After moving this way, roll a d6; on a 6, trigger one selected Unstable reaction without spending the reaction.",
    counterplay: "The charge requires a straight path and is obvious before it begins.",
  },
  {
    id: "collapsed-crawler",
    title: "Collapsed Crawler",
    slot: "movement",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard"],
    cost: 2,
    complexity: 1,
    stats: { hp: 4, fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "prone"
            ],
            "severity": "moderate",
            "duration": "until the end of combat instead",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "A damaged bloated corpse continues dragging itself forward after losing a limb.",
    mechanics:
      "The creature is immune to the Prone condition while its speed is 10 feet or lower. If an effect would knock it prone, reduce its speed by 5 feet until the end of combat instead.",
    counterplay:
      "Players can slow it by targeting legs, but cannot simply disable it with prone loops.",
  },
  {
    id: "slam-decomposition",
    title: "Heavy Slam",
    slot: "attack",
    section: "action",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { dpr: 4 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "bludgeoning"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "A simple blunt attack from a swollen corpse.",
    mechanics:
      "Melee Attack Roll. On hit, the target takes bludgeoning damage. If the creature moved at least 10 feet straight toward the target this turn, add one extra damage die.",
    counterplay: "Denying charge lanes keeps the attack ordinary.",
  },
  {
    id: "empowered-slam",
    title: "Empowered Slam",
    slot: "attack",
    section: "action",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 1,
    stats: { dpr: 7 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "abilityBasis": "strength",
            "bonus": "monster",
            "reach": "5 ft."
        },
        "secondaryResolution": {
            "type": "savingThrow",
            "ability": "strength",
            "dc": "monster"
        },
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "budgetRole": "mainAttack",
            "budgetShare": 0.85,
            "scale": "standard",
            "types": [
                "bludgeoning"
            ],
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "forced-movement"
            ],
            "severity": "moderate",
            "duration": "instant",
            "sizeLimit": "",
            "special": [],
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {
            "hit": "the target takes {damage} Bludgeoning damage and must make a Strength Saving Throw.",
            "failure": "The target is pushed 5 feet. If it collides with a creature or object, both take {pb} Bludgeoning damage.",
            "success": "The target is not pushed."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "existing-structured-rules"
        }
    },
    summary: "The corpse hits with enough mass to stagger a front line.",
    mechanics:
      "Melee Attack Roll. On hit, the target takes bludgeoning damage and must succeed on a Strength save or be pushed 5 feet. If the target collides with a creature or object, both take bludgeoning damage equal to the proficiency bonus.",
    counterplay: "The corpse visibly winds up before the slam; it is strongest near walls, allies, and cluttered terrain.",
    i18n: {
      it: {
        title: "Schianto Potenziato",
        summary: "Il cadavere colpisce con massa sufficiente a spezzare una linea frontale.",
        mechanics: "Melee Attack Roll. A segno, il bersaglio subisce danni contundenti e deve superare un Tiro Salvezza su Forza o essere spinto di 5 piedi. Se il bersaglio collide con una creatura o un oggetto, entrambi subiscono danni contundenti pari al bonus di competenza.",
        counterplay: "Il cadavere carica visibilmente il colpo; è più pericoloso vicino a muri, alleati e terreno affollato.",
      },
    },
  },
  {
    id: "acid-vomit",
    title: "Acid Vomit",
    slot: "attack",
    section: "action",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 6,
    complexity: 3,
    stats: { dpr: 7, control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "recharge",
            "value": "5-6"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "cone",
            "size": 30,
            "unit": "ft",
            "targets": "each creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "budgetRole": "rechargeControl",
            "budgetShare": 0.85,
            "expectedTargets": 1.5,
            "roundWeight": [
                1,
                0.35,
                0.35
            ],
            "scale": "standard",
            "types": [
                "acid"
            ],
            "parts": []
        },
        "condition": {
            "names": [],
            "special": [
                "healing-denial"
            ],
            "severity": "major",
            "duration": "until cleaned",
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "The target takes {damage} Acid damage and is covered in purge fluid. While covered, it can't regain Hit Points and takes {pb} Acid damage at the start of each of its turns. A creature can take an action to clean the fluid with a suitable approach.",
            "success": "Half damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "existing-structured-rules"
        }
    },
    summary: "It emits purge fluid in a pressurized cone that keeps burning after impact.",
    mechanics:
      "Recharge 5-6. Creatures in a 30-foot cone make a Dexterity save. On a failure, a target takes acid damage and is covered in purge fluid. While covered, the target cannot regain hit points and takes acid damage at the start of each of its turns. A creature can use an action to clean the fluid with a suitable approach.",
    counterplay: "The throat distends and leaks dark fluid before the recharge attack.",
  },
  {
    id: "corpse-grab",
    title: "Corpse Grab",
    slot: "attack",
    section: "action",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 2, dpr: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one Large or smaller creature within reach"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "grappled",
                "restrained"
            ],
            "severity": "major",
            "duration": "until the grapple ends",
            "sizeLimit": "",
            "special": [],
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The target has the Grappled condition and has the Restrained condition while the grapple lasts. The target can escape with an Athletics or Acrobatics check against DC {dc}.",
            "success": "The target is not grappled."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "existing-structured-rules"
        }
    },
    summary: "The corpse pins a victim against its swollen body.",
    mechanics:
      "One Large or smaller creature within reach makes a Dexterity save. On a failure, the target has the Grappled condition and is Restrained while the grapple lasts. The target can escape with an Athletics or Acrobatics check against the monster DC.",
    counterplay: "The creature can usually hold only one target this way.",
  },
  {
    id: "gas-buildup",
    title: "Gas Buildup",
    slot: "twist",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { dpr: 2, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When the creature drops to 0 hit points.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Dropping the corpse can trigger the thing everyone feared.",
    mechanics:
      "When the creature drops to 0 hit points, roll a d6. On a 4 or higher, trigger one selected Unstable reaction before the creature dies.",
    counterplay:
      "Radiant damage, careful positioning, or distance can reduce the danger of the final hit.",
    i18n: {
      it: {
        title: "Accumulo di Gas",
        summary: "Abbattere il cadavere può innescare proprio ciò che tutti temevano.",
        mechanics: "Quando la creatura scende a 0 punti ferita, tira un d6. Con 4 o più, innesca una reazione Instabile selezionata prima che la creatura muoia.",
        counterplay: "Danni radianti, posizionamento attento o distanza possono ridurre il pericolo del colpo finale.",
      },
    },
  },
  {
    id: "unstable-rupture",
    title: "Unstable Rupture",
    slot: "twist",
    section: "reaction",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { dpr: 3, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "reaction",
        "actionEconomy": "reaction",
        "usage": {
            "type": "triggered"
        },
        "trigger": "the creature takes piercing or slashing damage.",
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 10,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "poison",
                "slashing"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "or half as much on a success.",
            "success": "Half damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Piercing or slashing damage can make the battlefield worse.",
    mechanics:
      "Trigger: the creature takes piercing or slashing damage. Response: roll a d6. On a 6, the creature explodes or releases a toxic burst. Each creature within 10 feet makes a Dexterity save, taking poison damage on a failure or half as much on a success.",
    counterplay: "Bludgeoning, cold, radiant, and many spell attacks avoid the trigger.",
  },
  {
    id: "dangerously-unstable",
    title: "Dangerously Unstable",
    slot: "twist",
    section: "reaction",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["boss"],
    cost: 8,
    complexity: 3,
    stats: { dpr: 8, control: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "reaction",
        "actionEconomy": "reaction",
        "usage": {
            "type": "triggered"
        },
        "trigger": "The creature takes Piercing or Slashing damage.",
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "sphere",
            "size": 40,
            "unit": "ft",
            "targets": "each creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "budgetRole": "deathBurst",
            "budgetShare": 1.35,
            "expectedTargets": 1.75,
            "roundWeight": [
                0,
                0,
                0.35
            ],
            "scale": "heavy",
            "types": [
                "poison"
            ],
            "parts": []
        },
        "condition": {
            "names": [
                "prone",
                "deafened"
            ],
            "severity": "major",
            "duration": "Prone is instant; Deafened lasts 1 minute",
            "sizeLimit": "",
            "special": [],
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": true,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "or taking half damage on a success. Creatures out to 80 feet take minor thunder damage and may be Deafened for 1 minute.",
            "success": "Half damage only.",
            "response": "Roll a d6. On a 2 or higher, the creature detonates and destroys itself. {save} Failure: The target takes {damage} Poison damage and has the Prone condition. Success: Half damage only. Creatures out to 80 feet take {pb} Thunder damage and may have the Deafened condition for 1 minute."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "existing-structured-rules"
        }
    },
    summary: "The creature is an encounter-scale bomb waiting for a puncture.",
    mechanics:
      "Trigger: the creature takes piercing or slashing damage. Response: roll a d6. On a 2 or higher, it detonates and destroys itself. Creatures in a 40-foot sphere make a Dexterity save, taking heavy poison damage and falling Prone on a failure, or taking half damage on a success. Creatures out to 80 feet take minor thunder damage and may be Deafened for 1 minute.",
    counterplay:
      "Its immobility, swelling, and audible pressure make the blast radius readable before combat.",
  },
  {
    id: "undead-fortitude",
    title: "Undead Fortitude",
    slot: "twist",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { hp: 10 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "freeTrigger",
        "usage": {
            "type": "triggered"
        },
        "trigger": "Damage reduces the creature to 0 Hit Points.",
        "resolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "special"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "effect": "If damage reduces the creature to 0 Hit Points, it makes a Constitution Saving Throw with a DC equal to 5 plus the damage taken, unless the damage is Radiant, from a Critical Hit, or caused it to explode. Success: The creature drops to 1 Hit Point instead."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "existing-structured-rules"
        }
    },
    summary: "The corpse refuses to stop unless destroyed correctly.",
    mechanics:
      "If damage reduces the creature to 0 hit points, it makes a Constitution save with a DC equal to 5 plus the damage taken, unless the damage is radiant, from a critical hit, or caused it to explode. On a success, it drops to 1 hit point instead.",
    counterplay: "Radiant damage and critical hits bypass the feature.",
  },
  {
    id: "siege-corpse",
    title: "Siege Corpse",
    slot: "twist",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { dpr: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The bloated mass crushes doors, barricades, and structures by accident.",
    mechanics: "The creature deals double damage to objects and structures.",
    counterplay: "Barricades buy time but should not be trusted as permanent safety.",
  },
  {
    id: "head-weak-spot",
    title: "Head Weak Spot",
    slot: "weakness",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The head remains the most reliable way to end the corpse.",
    mechanics:
      "A character can target the head with a called shot. The attack takes a -5 penalty. On a hit, the attack becomes a critical hit.",
    counterplay: "This gives precision-focused players a clear high-risk answer.",
  },
  {
    id: "mechanical-stress",
    title: "Mechanical Stress",
    slot: "weakness",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When the creature takes more than half its maximum hit points in one hit.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "blinded",
                "prone"
            ],
            "severity": "moderate",
            "duration": "unspecified",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Massive hits tear off parts without always detonating the whole corpse.",
    mechanics:
      "When the creature takes more than half its maximum hit points in one hit, the attacker chooses head, arms, or leg. Head: the creature is Blinded but dies in 2 rounds without triggering Gas Buildup. Arms: it has disadvantage on attacks requiring arms. Leg: it falls prone and its speed becomes 5 feet.",
    counterplay: "Large wounds are visible stress points before rupture; big single hits can solve the encounter in a controlled way.",
  },
  {
    id: "radiant-preservation-failure",
    title: "Radiant Preservation Failure",
    slot: "weakness",
    section: "trait",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -1,
    complexity: 1,
    stats: { fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When the creature takes radiant damage.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "radiant"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Holy light collapses the necromancy before the gases can weaponize the corpse.",
    mechanics:
      "When the creature takes radiant damage, it cannot use Unstable reactions until the start of its next turn.",
    counterplay: "Radiant damage becomes a safety tool, not just a damage type.",
    i18n: {
      it: {
        title: "Cedimento da Preservazione Radiante",
        summary: "La luce sacra fa collassare la necromanzia prima che i gas possano trasformare il cadavere in un’arma.",
        mechanics: "Quando la creatura subisce danni radianti, non può usare reazioni Instabili fino all’inizio del suo prossimo turno.",
        counterplay: "Il danno radiante diventa uno strumento di sicurezza, non solo un tipo di danno.",
      },
    },
  },
  {
    id: "corpse-bloom-death",
    title: "Corpse Bloom Death",
    slot: "death",
    section: "death",
    source: "decomposition",
    typeBias: ["undead", "aberration", "beast"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { dpr: 2, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "custom",
            "targets": "the death trigger area or named target"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "passive",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "passive",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "When it dies, the body becomes terrain and clue at the same time.",
    mechanics:
      "On death, the corpse creates a 10-foot patch of slick rot. The area is difficult terrain. A character who examines it can find one clue tied to the Source Anchor.",
    counterplay: "Players can drag or burn the body before the bloom spreads.",
  },
  {
    id: "toxic-detonation",
    title: "Toxic Detonation",
    slot: "death",
    section: "death",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { dpr: 5, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 10,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "poison"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "poisoned"
            ],
            "severity": "moderate",
            "duration": "until the end of its next turn",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "The target takes poison damage and has the Poisoned condition until the end of its next turn. On a success, the target takes half damage only.",
            "success": "Half damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The corpse finally ruptures when destroyed.",
    mechanics:
      "On death, each creature within 10 feet makes a Dexterity save. On a failure, the target takes poison damage and has the Poisoned condition until the end of its next turn. On a success, the target takes half damage only.",
    counterplay: "The corpse visibly distends before death; the safest play is to finish it from range or with radiant damage.",
    i18n: {
      it: {
        title: "Detonazione Tossica",
        summary: "Il cadavere si rompe definitivamente quando viene distrutto.",
        mechanics: "Alla morte, ogni creatura entro 10 piedi effettua un Tiro Salvezza su Destrezza. Fallimento: il bersaglio subisce danni da veleno e ha la condizione Poisoned fino alla fine del suo prossimo turno. Successo: il bersaglio subisce solo metà danni.",
        counterplay: "Il cadavere si distende visibilmente prima della morte; la scelta più sicura è finirlo a distanza o con danni radianti.",
      },
    },
  },
  {
    id: "purge-fluid-flood",
    title: "Purge Fluid Flood",
    slot: "death",
    section: "death",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "custom",
            "targets": "the death trigger area or named target"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "passive",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "passive",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "prone"
            ],
            "severity": "moderate",
            "duration": "until cleaned or burned away",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "The target has the {condition-list}. The condition lasts until cleaned or burned away.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Dark fluid spills from the body and turns the floor into a disgusting hazard.",
    mechanics:
      "On death, a 15-foot area becomes slick and foul until cleaned or burned away. It is difficult terrain. A creature that enters it for the first time on a turn or starts there makes a Dexterity save or falls Prone.",
    counterplay: "The leaking fluid is visible before it spreads; fire, sand, holy water, or clever cleaning can neutralize the area.",
  },
  {
    id: "choking-air",
    title: "Choking Air",
    slot: "lair",
    section: "lairAction",
    source: "decomposition",
    typeBias: ["undead", "aberration"],
    roleBias: ["boss"],
    cost: 5,
    complexity: 3,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "lairAction",
        "actionEconomy": "lairAction",
        "usage": {
            "type": "lair"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "custom",
            "targets": "creatures in the affected area"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "initiativeCount20",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "initiativeCount20",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The target cannot take reactions until the start of its next turn while it remains in the choking area.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The room itself becomes a failing lung.",
    mechanics:
      "At initiative count 20, choose one 10-foot area. Until the next count 20, the area is lightly obscured, and creatures that start there make a Constitution save or cannot take reactions until their next turn.",
    counterplay: "The air visibly thickens before the initiative count resolves.",
  },
  {
    id: "corpse-pressure-room",
    title: "Corpse Pressure Room",
    slot: "lair",
    section: "lairAction",
    source: "decomposition",
    typeBias: ["undead"],
    roleBias: ["boss"],
    cost: 6,
    complexity: 3,
    stats: { control: 2, dpr: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "lairAction",
        "actionEconomy": "lairAction",
        "usage": {
            "type": "lair"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 5,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "self",
            "timing": "initiativeCount20",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "initiativeCount20",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "The target triggers the toxic burst and suffers its listed effect.",
            "success": "The target avoids the burst."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Nearby corpses swell and begin acting as secondary pressure hazards.",
    mechanics:
      "At initiative count 20, one corpse or body part in the lair swells. Until the next count 20, the first creature that moves within 5 feet of it triggers a small toxic burst requiring a Constitution save.",
    counterplay: "The swelling corpses are visible warnings before they burst; players can identify them and avoid, move, or destroy them safely.",
  },

  // Jikininki / Ravenous Spirit
  {
    id: "shame-hunger",
    title: "Shame-Hunger",
    slot: "mind",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { dpr: 2, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It feeds because it remembers being judged, buried, and left wanting.",
    mechanics:
      "It prioritizes creatures carrying holy symbols, funerary items, or fresh wounds. Once per fight, after it damages such a target, it regains hit points equal to the target's proficiency bonus + level tier.",
    counterplay: "It can be baited with funerary offerings or distracted by rites for the dead.",
  },
  {
    id: "corpse-craving",
    title: "Corpse Craving",
    slot: "mind",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { fairness: 1, dpr: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The creature moves toward the unattended corpse and feeds; while feeding, its attacks against creatures have disadvantage.",
            "success": "The creature acts normally."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Its hunger is specific, shameful, and easy to lure.",
    mechanics:
      "If the creature can see an unattended corpse, it must succeed on a Wisdom save at the start of its turn or move toward the corpse and feed. While feeding, its attacks against creatures have disadvantage.",
    counterplay:
      "A prepared corpse, contaminated meal, or funerary decoy can redirect the monster.",
  },
  {
    id: "nocturnal-haunting",
    title: "Nocturnal Haunting",
    slot: "mind",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { fairness: 1, mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It hides its sacrilege from daylight and witnesses.",
    mechanics:
      "During the day, the creature retreats to the Ethereal Plane or a hidden refuge if able. During the night, it gains advantage on Dexterity (Stealth) checks made near graveyards, temples, alleys, or corpse sites.",
    counterplay:
      "Daylight investigations and forced exposure weaken the encounter before combat begins.",
  },
  {
    id: "ethereal-sight",
    title: "Ethereal Sight",
    slot: "body",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "invisible"
            ],
            "severity": "moderate",
            "duration": "unspecified",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spirit sees both the living world and the thin place beside it.",
    mechanics:
      "The creature can see 60 feet into the Ethereal Plane while it is on the Material Plane, and it has advantage on checks made to locate invisible or ethereal undead.",
    counterplay:
      "Its gaze is visible before it fixes on a target; it is still limited by walls, line of sight, cover, and mundane concealment on its current plane.",
  },
  {
    id: "incorporeal-movement",
    title: "Incorporeal Movement",
    slot: "movement",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { mobility: 2, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "force"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It passes through creatures and objects like a hungry draft.",
    mechanics:
      "The creature can move through other creatures and objects as if they were difficult terrain. It takes force damage if it ends its turn inside an object.",
    counterplay:
      "Readied actions, force effects, and keeping it out of walls punish careless movement.",
  },
  {
    id: "grave-bite",
    title: "Grave Bite",
    slot: "attack",
    section: "action",
    source: "jikininki",
    typeBias: ["undead", "beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { dpr: 4 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "necrotic",
                "piercing"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Its bite is a feeding rite, not only an attack.",
    mechanics:
      "Melee Attack Roll. On hit, the target takes piercing damage plus necrotic damage. If the target is below half hit points, the monster gains temporary hit points equal to the necrotic damage dealt.",
    counterplay: "It becomes predictable around wounded characters and corpses.",
  },
  {
    id: "infected-bite",
    title: "Infected Bite",
    slot: "attack",
    section: "action",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { dpr: 5, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "necrotic"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spirit's bite leaves a spiritual infection that worsens after rest.",
    mechanics:
      "Melee Attack Roll. On hit, the target takes poison or necrotic damage. If the target is not undead, it makes a Constitution save. On a failure, it gains 1 level of Exhaustion at the end of its next Long Rest, to a maximum of 3 levels from this feature.",
    counterplay:
      "Magic that cures disease, consecrated rest, or removing the curse before the next Long Rest stops the delayed harm.",
  },
  {
    id: "purulent-bite",
    title: "Purulent Bite",
    slot: "attack",
    section: "action",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 6,
    complexity: 3,
    stats: { dpr: 6, control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "budgetRole": "mainAttack",
            "budgetShare": 0.65,
            "scale": "medium",
            "types": [
                "piercing"
            ]
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "At the end of its next Long Rest, the target gains 2 Exhaustion levels, to a maximum of 4 levels from this feature. If it fails by 5 or more, it also contracts the disease for 1d4 weeks.",
            "success": "No disease effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The bite carries a disease that clings to exhaustion and refuses easy recovery.",
    mechanics:
      "Melee Attack Roll. On hit, a non-undead target makes a Constitution save. On a failure, it gains 2 Exhaustion levels at the end of its next Long Rest, to a maximum of 4 levels from this feature. If it fails by 5 or more, the target also contracts a disease for 1d4 weeks that prevents Exhaustion levels from this feature from being removed by ordinary Long Rests.",
    counterplay:
      "The delayed effect gives time for investigation, cleansing, or magical treatment.",
  },
  {
    id: "horrific-apparition",
    title: "Horrific Apparition",
    slot: "horror",
    section: "action",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 3,
    stats: { control: 3, dpr: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "cone",
            "size": 60,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "psychic"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "frightened"
            ],
            "severity": "major",
            "duration": "until the start of the spirit's next turn",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "psychic damage and the Frightened condition until the start of the spirit's next turn. If the target fails by 5 or more, it also suffers a supernatural aging or wasting mark that can be reversed by powerful restoration magic within 24 hours.",
            "success": "Half damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spirit reveals the obscene contradiction of ghostly flesh and grave hunger.",
    mechanics:
      "Wisdom Saving Throw, each non-undead creature in a 60-foot cone that can see the spirit. Failure: psychic damage and the Frightened condition until the start of the spirit's next turn. If the target fails by 5 or more, it also suffers a supernatural aging or wasting mark that can be reversed by powerful restoration magic within 24 hours.",
    counterplay: "A creature that succeeds is immune to this spirit's apparition for 24 hours.",
  },
  {
    id: "corpse-tendrils",
    title: "Corpse Tendrils",
    slot: "attack",
    section: "action",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["boss", "standard"],
    cost: 5,
    complexity: 3,
    stats: { control: 3, dpr: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 30,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "emanation",
            "size": 10,
            "unit": "ft",
            "origin": "self",
            "timing": "passive",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "passive",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "restrained"
            ],
            "severity": "major",
            "duration": "1 minute",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": {
                "enabled": true,
                "ability": "dexterity",
                "timing": "endOfTurn",
                "endsOnSuccess": true
            }
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "a target has the Restrained condition for 1 minute. It repeats the save at the end of each of its turns, ending the effect on a success.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It enters a corpse and makes the entrails hunt nearby living bodies.",
    mechanics:
      "Choose a corpse within 30 feet. Creatures in a 10-foot emanation from that corpse make a Dexterity save. On a failure, a target has the Restrained condition for 1 minute. It repeats the save at the end of each of its turns, ending the effect on a success.",
    counterplay: "Destroying, burning, or avoiding corpses limits this action.",
  },
  {
    id: "flesh-harvest",
    title: "Flesh Harvest",
    slot: "twist",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 3,
    stats: { dpr: 2, ac: 1, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Each corpse devoured makes the spirit more certain, more violent, and more complete.",
    mechanics:
      "The creature can consume a Medium or smaller corpse using an action. For each corpse consumed this way, it gains a +1 bonus to attack rolls, damage rolls, and AC until dawn, to a maximum bonus equal to its proficiency bonus.",
    counterplay: "Removing corpses from the scene denies the escalation.",
  },
  {
    id: "deceitful-apparition",
    title: "Deceitful Apparition",
    slot: "mind",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary:
      "The spirit wears clothes, mannerisms, and fragments of identity stolen from the corpses it devoured.",
    mechanics:
      "The creature can appear as a mundane person whose corpse it has consumed. A creature can identify the deception with a successful Insight or Investigation check contested by the monster's Deception, or by magical means.",
    counterplay:
      "Suspicious details, funerary records, and body evidence can expose it without combat.",
  },
  {
    id: "mortal-afterlife",
    title: "Mortal Afterlife",
    slot: "mind",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { fairness: 1, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The creature spends its next turn fleeing toward its lair, refuge, or a corpse it can use to rebuild its identity.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It is trying to belong by stealing a life rather than merely haunting a place.",
    mechanics:
      "If publicly exposed by its community, the creature must succeed on a Wisdom save or spend its next turn fleeing toward its lair, refuge, or a corpse it can use to rebuild its identity.",
    counterplay: "Social exposure can function as battlefield control.",
  },
  {
    id: "vanish-spirit",
    title: "Vanish",
    slot: "movement",
    section: "bonusAction",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { mobility: 2, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "bonusAction",
        "actionEconomy": "bonusAction",
        "usage": {
            "type": "limited",
            "value": "3/day"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "invisible"
            ],
            "severity": "moderate",
            "duration": "until its concentration ends",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "effect": "The creature has the Invisible condition until its concentration ends. The effect ends early immediately after the creature makes an attack roll."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spirit disappears behind shame, darkness, and stolen breath.",
    mechanics:
      "3/day. The creature has the Invisible condition until its concentration ends. The effect ends early immediately after the creature makes an attack roll.",
    counterplay: "Area effects, held actions, and forcing concentration checks can reveal it.",
  },
  {
    id: "cunning-action-spirit",
    title: "Cunning Action",
    slot: "movement",
    section: "bonusAction",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { mobility: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "bonusAction",
        "actionEconomy": "bonusAction",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It hunts like a murderer rather than a wandering ghost.",
    mechanics: "The creature takes the Dash, Disengage, or Hide action.",
    counterplay: "Tight formation and readied actions reduce the value of its mobility.",
  },
  {
    id: "horrific-assault",
    title: "Horrific Assault",
    slot: "twist",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { dpr: 5, mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "effect": "During its first turn, the creature has advantage on attack rolls against any creature that has not taken a turn. Any hit it scores against a surprised creature is a critical hit."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary:
      "The spirit is most dangerous before the victims realize the dead thing is already among them.",
    mechanics:
      "During its first turn, the creature has advantage on attack rolls against any creature that has not taken a turn. Any hit it scores against a surprised creature is a critical hit.",
    counterplay: "Scouting, watches, light, and suspicion reduce or eliminate the opening ambush.",
  },
  {
    id: "no-witnesses-rage",
    title: "No Witnesses Rage",
    slot: "twist",
    section: "reaction",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["boss", "standard"],
    cost: 5,
    complexity: 3,
    stats: { dpr: 4, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "reaction",
        "actionEconomy": "reaction",
        "usage": {
            "type": "triggered"
        },
        "trigger": "a hostile creature sees the spirit feeding on a corpse or repugnant meal.",
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "When caught feeding, shame becomes violence instead of fear.",
    mechanics:
      "Trigger: a hostile creature sees the spirit feeding on a corpse or repugnant meal. Response: the spirit becomes enraged for 1 minute. While enraged, it gains bonus damage on bite attacks and advantage on Intelligence checks and saves, but it must attack a witness each turn if able.",
    counterplay: "Witnesses can lure the rage, but doing so makes them the focus.",
  },
  {
    id: "daytime-weakness",
    title: "Daytime Weakness",
    slot: "weakness",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -3,
    complexity: 1,
    stats: { fairness: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {
            "effect": "While forced to remain on the Material Plane during daytime, the creature has disadvantage on attack rolls, ability checks, and saving throws."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Held in the world during daylight, the spirit loses the confidence of night.",
    mechanics:
      "While forced to remain on the Material Plane during daytime, the creature has disadvantage on attack rolls, ability checks, and saving throws.",
    counterplay:
      "Ritual anchors, daylight pursuit, or binding circles can create a decisive advantage.",
  },
  {
    id: "shameful-feeding",
    title: "Shameful Feeding",
    slot: "weakness",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "frightened"
            ],
            "severity": "major",
            "duration": "until it succeeds on a Wisdom save at the start of one of its turns",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The target has the {condition-list}. The condition lasts until it succeeds on a Wisdom save at the start of one of its turns.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Being witnessed during its meal wounds the spirit's identity.",
    mechanics:
      "If caught eating a corpse or other repugnant meal, the creature has the Frightened condition until it succeeds on a Wisdom save at the start of one of its turns. This overrides immunity to the Frightened condition.",
    counterplay: "Players can set surveillance, bait, and public exposure as a trap.",
  },
  {
    id: "dangerous-hunger",
    title: "Dangerous Hunger",
    slot: "weakness",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "radiant"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spirit cannot distinguish a safe meal from a prepared trap.",
    mechanics:
      "A corpse soaked in holy water, packed with salt, or otherwise prepared against ghosts counts as bait. If the spirit feeds from it, it takes radiant damage and cannot use Incorporeal Movement until the end of its next turn.",
    counterplay:
      "The players can defeat or weaken the monster through preparation instead of raw damage.",
  },
  {
    id: "salt-and-names",
    title: "Salt and True Names",
    slot: "weakness",
    section: "trait",
    source: "jikininki",
    typeBias: ["undead", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "the monster cannot willingly move closer to that character until the end of its next turn.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary:
      "The creature recoils from burial rites, salt, and being named as the dead person it was.",
    mechanics:
      "A character who spends an action invoking a true name, funeral rite, or line of salt can force a Wisdom save. On a failure, the monster cannot willingly move closer to that character until the end of its next turn.",
    counterplay: "This gives players a non-damage way to control space.",
  },
  {
    id: "spectral-dust-death",
    title: "Spectral Dust",
    slot: "death",
    section: "death",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "custom",
            "targets": "the death trigger area or named target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "When the spirit collapses, grave dust reveals what it devoured.",
    mechanics:
      "On death, the creature leaves spectral dust and small grave goods from its meals. A character who studies them learns one useful fact about the spirit's feeding route, victim, or lair.",
    counterplay: "This death effect rewards investigation after violence.",
  },
  {
    id: "last-meal-memory",
    title: "Last Meal Memory",
    slot: "death",
    section: "death",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { control: 1, fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 30,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "frightened"
            ],
            "severity": "major",
            "duration": "until the end of its next turn",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "it is Frightened until the end of its next turn. Success or failure, it learns one clue from the consumed victim.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The final corpse it consumed speaks through the fading spirit.",
    mechanics:
      "On death, one creature within 30 feet hears a stolen memory. That creature makes a Wisdom save. On a failure, it is Frightened until the end of its next turn. Success or failure, it learns one clue from the consumed victim.",
    counterplay:
      "Covering the corpse's face or completing a funeral rite before the killing blow prevents the fear effect but preserves the clue.",
  },
  {
    id: "funeral-silence-lair",
    title: "Funeral Silence",
    slot: "lair",
    section: "lairAction",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["boss"],
    cost: 4,
    complexity: 3,
    stats: { control: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "lairAction",
        "actionEconomy": "lairAction",
        "usage": {
            "type": "lair"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "custom",
            "targets": "creatures in the affected area"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "initiativeCount20",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "initiativeCount20",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The lair swallows prayer, witness, and warning.",
    mechanics:
      "At initiative count 20, choose a 20-foot area. Until the next count 20, sound in that area is muffled. Creatures inside have disadvantage on checks relying on hearing, and verbal spell components require a successful spellcasting ability check against the monster DC.",
    counterplay: "Leaving the area or using nonverbal magic avoids the worst pressure.",
  },
  {
    id: "graveyard-offerings-lair",
    title: "Graveyard Offerings",
    slot: "lair",
    section: "lairAction",
    source: "jikininki",
    typeBias: ["undead"],
    roleBias: ["boss", "standard"],
    cost: 4,
    complexity: 2,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "lairAction",
        "actionEconomy": "lairAction",
        "usage": {
            "type": "lair"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 60,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "self",
            "timing": "initiativeCount20",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "initiativeCount20",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The target must spend 10 feet of movement moving toward the luring funerary object or corpse.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Offerings, bones, and old names shift around the battlefield.",
    mechanics:
      "At initiative count 20, one funerary object or corpse within 60 feet becomes a lure. Until the next count 20, a creature that starts within 10 feet of it makes a Wisdom save or must spend 10 feet of movement moving toward it.",
    counterplay: "Destroying or respectfully moving the offering ends the lure.",
  },

  // Wolf Spiders / Broodmother
  {
    id: "maternal-swarm-instinct",
    title: "Maternal Swarm Instinct",
    slot: "mind",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { hp: 6, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary:
      "It protects a brood carried on its body and becomes more violent when the young are threatened.",
    mechanics:
      "The first time it is bloodied, a brood swarm appears in an adjacent space. Until the brood is destroyed, the creature gains +2 damage on melee attacks.",
    counterplay: "The brood is visible before combat as a shifting texture across its back.",
  },
  {
    id: "egg-carrier",
    title: "Egg Carrier",
    slot: "body",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 6,
    complexity: 4,
    stats: { hp: 16, control: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spider carries a living clutch on its back, turning damage into a hatching risk.",
    mechanics:
      "The creature carries eggs on its back. At the start of each combatant's turn while eggs remain, roll a d20. On a 1, one egg breaks. On a 13-19, one egg hatches into a spider minion. On a 20, 1d4+1 eggs hatch. The eggs can be attacked and destroyed as fragile objects.",
    counterplay: "The eggs are visible, vulnerable, and dangerous to ignore.",
  },
  {
    id: "spider-climb",
    title: "Spider Climb",
    slot: "body",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration", "undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spider treats ceilings and vertical surfaces as ordinary ground.",
    mechanics:
      "The creature can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.",
    counterplay: "Destroying surfaces, burning webs, and forcing falls remain valid answers.",
  },
  {
    id: "web-walker",
    title: "Web Walker",
    slot: "body",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration", "undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { mobility: 1, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spider feels the battlefield through every web strand.",
    mechanics:
      "The creature ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web.",
    counterplay: "Cutting, burning, or avoiding web networks removes its awareness.",
  },
  {
    id: "barbed-chitin",
    title: "Barbed Chitin",
    slot: "body",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { ac: 1, dpr: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "piercing"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [],
            "severity": "minor",
            "duration": "",
            "special": []
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": {
            "enabled": true,
            "timing": "startOfMonsterTurn",
            "damage": {
                "mode": "budget",
                "budgetRole": "ongoing",
                "budgetShare": 0.2,
                "scale": "minor",
                "types": [
                    "piercing"
                ]
            },
            "text": "At the start of each of its turns, the creature deals piercing damage to any creature grappling it or being grappled by it."
        },
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Jagged protrusions make grappling or holding the spider painful.",
    mechanics:
      "At the start of each of its turns, the creature deals piercing damage to any creature grappling it or being grappled by it.",
    counterplay: "Ranged control, weapons, and forced movement avoid direct contact.",
  },
  {
    id: "umbral-skin",
    title: "Umbral Skin",
    slot: "body",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { control: 2, mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "radiant"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "invisible"
            ],
            "severity": "moderate",
            "duration": "unspecified",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Darkness folds into the spider's body until it nearly disappears.",
    mechanics:
      "While in darkness, the creature has the Invisible condition. The condition ends immediately when the creature enters bright light or takes fire or radiant damage.",
    counterplay: "Light management becomes the key countermeasure.",
  },
  {
    id: "malformed-broodling",
    title: "Malformed Broodling",
    slot: "body",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion"],
    cost: 1,
    complexity: 1,
    stats: { hp: -8, control: 1, fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 5,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary:
      "The offspring is fragile, wet, misshapen, and useful mainly as a horrible battlefield resource.",
    mechanics:
      "The creature has 1 hit point. A Broodmother or allied spider within 5 feet can use a bonus action to devour it and regain hit points equal to 2d6 plus proficiency bonus.",
    counterplay: "Players can destroy the broodling before it becomes healing.",
  },
  {
    id: "hundred-eyed",
    title: "Hundred-Eyed",
    slot: "mind",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { control: 1, fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Dozens of eyes cover the malformed head, many blind, some always watching.",
    mechanics:
      "The creature cannot be surprised while conscious and gains a bonus to passive Perception equal to twice its proficiency bonus.",
    counterplay: "Blinding, darkness, smoke, or attacking from beyond sight still works.",
  },
  {
    id: "wall-crawler",
    title: "Wall-Crawling Approach",
    slot: "movement",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration", "undead"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It treats walls and ceilings as normal hunting ground.",
    mechanics:
      "The creature gains a climb speed equal to its walking speed and ignores difficult terrain caused by webs, rubble, or bones.",
    counterplay:
      "Characters can force it down by breaking surfaces, burning webbing, or using thunderous effects.",
  },
  {
    id: "web-dancer",
    title: "Web Dancer",
    slot: "movement",
    section: "bonusAction",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { mobility: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "bonusAction",
        "actionEconomy": "bonusAction",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 60,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary:
      "It shoots a strand of web and swings across the lair without opening itself to retaliation.",
    mechanics:
      "The creature shoots a strand of web at a surface within 60 feet it can see. As part of this bonus action, it moves along the web up to its remaining speed without provoking opportunity attacks. The web can be attacked and destroyed as a fragile object vulnerable to fire.",
    counterplay: "Destroying the strand interrupts future movement routes.",
  },
  {
    id: "shadow-jump",
    title: "Shadow Jump",
    slot: "movement",
    section: "bonusAction",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 2,
    stats: { mobility: 3, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "bonusAction",
        "actionEconomy": "bonusAction",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spider teleports through pockets of darkness instead of crawling.",
    mechanics:
      "3/day. The creature teleports up to 40 feet to an unoccupied space in darkness it can see.",
    counterplay: "Bright light and removing dark corners limit its escape routes.",
  },
  {
    id: "predatory-jump",
    title: "Predatory Jump",
    slot: "movement",
    section: "bonusAction",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { mobility: 2, dpr: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "bonusAction",
        "actionEconomy": "bonusAction",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 5,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It leaps across the battlefield and lands already striking.",
    mechanics:
      "The creature jumps up to 30 feet in any direction without provoking opportunity attacks. If it lands within 5 feet of an enemy, it has advantage on the next attack against that enemy before the end of the turn.",
    counterplay: "Open spacing and readied attacks reduce the leap's value.",
  },
  {
    id: "venomous-bite",
    title: "Venomous Bite",
    slot: "attack",
    section: "action",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { dpr: 5, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "piercing",
                "poison"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "paralyzed",
                "poisoned"
            ],
            "severity": "severe",
            "duration": "1 hour",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "The target takes the poison damage. If this damage reduces it to 0 Hit Points, it has the Paralyzed and Poisoned conditions for 1 hour.",
            "success": "The target takes half poison damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The bite injects venom that becomes terrifying when it drops a victim.",
    mechanics:
      "Melee Attack Roll. On hit, the target takes piercing damage and makes a Constitution save. Failure: poison damage. If this damage reduces the target to 0 hit points, the target has the Paralyzed and Poisoned conditions for 1 hour. Success: half poison damage only.",
    counterplay: "The fangs visibly drip before the bite; poison resistance, distance, and antitoxin reduce the bite's threat.",
  },
  {
    id: "perforate",
    title: "Perforate",
    slot: "attack",
    section: "action",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard"],
    cost: 3,
    complexity: 2,
    stats: { dpr: 4, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "piercing"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Barbed fangs leave wounds that keep tearing until treated.",
    mechanics:
      "Melee Attack Roll. On hit, the target takes piercing damage and makes a Constitution save. On a failure, it takes extra piercing damage at the start of each of its turns until it receives healing or a creature succeeds on a Medicine check to close the wound.",
    counterplay: "Healing and Medicine stop the ongoing damage.",
  },
  {
    id: "web-recharge",
    title: "Web",
    slot: "attack",
    section: "action",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "recharge",
            "value": "5-6"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 60,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "psychic"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "restrained"
            ],
            "severity": "major",
            "duration": "until the web is destroyed",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "the target has the Restrained condition until the web is destroyed. The web has low AC and hit points, vulnerability to fire, and immunity to poison and psychic damage.",
            "success": "Half damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "A classic restraining web shot that turns positioning into danger.",
    mechanics:
      "Recharge 5-6. Dexterity Saving Throw, one creature the monster can see within 60 feet. Failure: the target has the Restrained condition until the web is destroyed. The web has low AC and hit points, vulnerability to fire, and immunity to poison and psychic damage.",
    counterplay: "The web can be attacked, burned, or avoided with cover.",
  },
  {
    id: "shadow-web",
    title: "Shadow Web",
    slot: "attack",
    section: "action",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 3,
    stats: { control: 3, dpr: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "recharge",
            "value": "5-6"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "dexterity",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 60,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "slashing"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "restrained"
            ],
            "severity": "major",
            "duration": "until the web is destroyed",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "the target has the Restrained condition until the web is destroyed. A restrained target takes slashing damage at the start of each of its turns. Shadow webs have higher AC and hit points than ordinary webs.",
            "success": "Half damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The web is darker, tougher, and cuts into prey while holding them.",
    mechanics:
      "Recharge 5-6. Dexterity Saving Throw, one creature within 60 feet. Failure: the target has the Restrained condition until the web is destroyed. A restrained target takes slashing damage at the start of each of its turns. Shadow webs have higher AC and hit points than ordinary webs.",
    counterplay: "Fire remains effective, but the web takes more effort to destroy.",
  },
  {
    id: "venomous-spit",
    title: "Venomous Spit",
    slot: "attack",
    section: "action",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard"],
    cost: 3,
    complexity: 1,
    stats: { dpr: 4 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "ranged",
            "bonus": "monster",
            "abilityBasis": "dexterity",
            "reach": null,
            "range": "30/120 ft."
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "poison"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spider has a ranged pressure option when prey refuses the web.",
    mechanics: "Ranged Attack Roll, range 30 feet. On hit, the target takes poison damage.",
    counterplay: "Cover and poison resistance keep the attack modest.",
  },
  {
    id: "brood-injection",
    title: "Brood Injection",
    slot: "attack",
    section: "action",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 5,
    complexity: 3,
    stats: { dpr: 3, control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "savingThrow",
            "ability": "constitution",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "piercing"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "failure": "its speed is reduced by 10 feet and it takes piercing damage at the start of its next turn. An action and a successful Medicine check ends the effect.",
            "success": "Half damage only."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "A hit leaves something moving under the skin.",
    mechanics:
      "On a hit, the target makes a Constitution save. On a failure, its speed is reduced by 10 feet and it takes piercing damage at the start of its next turn. An action and a successful Medicine check ends the effect.",
    counterplay: "The wound visibly ripples before the delayed damage happens.",
  },
  {
    id: "enrage-broodmother",
    title: "Enrage",
    slot: "twist",
    section: "reaction",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 4,
    complexity: 2,
    stats: { dpr: 4, mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "reaction",
        "actionEconomy": "reaction",
        "usage": {
            "type": "triggered"
        },
        "trigger": "a creature destroys an egg the monster is carrying.",
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "strength",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Destroying an egg risks making the mother faster and more lethal.",
    mechanics:
      "Trigger: a creature destroys an egg the monster is carrying. Response: roll a d6. On a 4 or higher, the monster enrages until the combat ends, gaining a bonus to attack rolls, damage rolls, speed, and jump distance.",
    counterplay: "The mother visibly coils before the enrage response; attacking eggs is effective but not free.",
  },
  {
    id: "web-architect",
    title: "Web Architect",
    slot: "twist",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Its webs are engineered defenses rather than simple strands.",
    mechanics:
      "All webs created by the creature have a bonus to AC and hit points, and they lose vulnerability to fire while the creature is not bloodied.",
    counterplay: "The reinforced web anchors are visible before they matter; bloodying the spider or burning exposed anchor strands weakens the web network.",
  },
  {
    id: "corrosive-web",
    title: "Corrosive Web",
    slot: "twist",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { dpr: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "startsTurnInArea",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "startsTurnInArea",
            "text": ""
        },
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "acid"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "restrained"
            ],
            "severity": "major",
            "duration": "while restrained by the web",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "effect": "Whenever a creature is hit by one of the monster\u2019s web abilities or starts its turn restrained by its web, it takes Acid damage equal to the monster\u2019s Proficiency Bonus."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Webbing burns skin and armor with acidic residue.",
    mechanics:
      "Whenever a creature is hit by one of the monster's web abilities or starts its turn restrained by its web, it takes acid damage equal to the monster's proficiency bonus.",
    counterplay: "Escaping or burning the web quickly prevents repeated damage.",
  },
  {
    id: "hunter-spider",
    title: "Hunter",
    slot: "mind",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { mobility: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spider stalks prey patiently and uses cover like a predator.",
    mechanics:
      "The creature has advantage on Dexterity (Stealth) checks, and it can take the Hide action as a bonus action on each of its turns.",
    counterplay: "Light, fire, tremorsense, and clearing webs make hiding harder.",
  },
  {
    id: "thin-legs",
    title: "Thin Legs",
    slot: "weakness",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -1,
    complexity: 1,
    stats: { fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When the creature moves at least 5 feet on a slippery surface such as ice.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The spider is terrifying on webbing, but unstable on slick ground.",
    mechanics:
      "When the creature moves at least 5 feet on a slippery surface such as ice, oil, grease, or polished wet stone, it automatically fails checks made to keep its balance.",
    counterplay: "Players can create slick terrain as a meaningful answer.",
  },
  {
    id: "fear-of-fire",
    title: "Fear of Fire",
    slot: "weakness",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 30,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "frightened"
            ],
            "severity": "major",
            "duration": "while within 30 feet of the blaze",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {
            "effect": "While within 30 feet of a fire with a radius greater than 10 feet, wildfire, or a similar blaze, the creature has the Frightened condition."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Large flame turns predatory confidence into animal panic.",
    mechanics:
      "While within 30 feet of a fire with a radius greater than 10 feet, wildfire, or a similar blaze, the creature has the Frightened condition.",
    counterplay: "Its posture makes the fear visibly readable before it flees; torches are not enough, and players need meaningful fire.",
  },
  {
    id: "underbelly-weak-spot",
    title: "Underbelly Weak Spot",
    slot: "weakness",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When the creature jumps.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "prone"
            ],
            "severity": "moderate",
            "duration": "unspecified",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": true,
            "breakCondition": false,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The underside is pale, soft, and visible during leaps or climbing transitions.",
    mechanics:
      "When the creature jumps, climbs from ceiling to wall, or is knocked prone, the next hit against it before the start of its next turn deals extra damage of the same type equal to 2d6.",
    counterplay: "Forcing movement transitions opens the weak spot.",
  },
  {
    id: "eyes-weak-spot",
    title: "Eyes Weak Spot",
    slot: "weakness",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 2,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "blinded"
            ],
            "severity": "moderate",
            "duration": "until the end of its next turn",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The cluster of eyes can be damaged to break the monster's battlefield control.",
    mechanics:
      "A character can target the eyes with a called shot at a -5 penalty. On a hit, the creature has the Blinded condition until the end of its next turn. If the attack deals at least 30 damage, the blindness lasts until magically healed or until the creature finishes a short rest.",
    counterplay: "This weak spot rewards precision without trivializing the monster.",
  },
  {
    id: "brood-tell",
    title: "Brood Tell",
    slot: "weakness",
    section: "trait",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: -1,
    complexity: 1,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The brood moves before the parent attacks.",
    mechanics:
      "Before using its strongest attack, the brood shifts toward the target. A character who notices this can use a reaction to move 5 feet without provoking from the monster.",
    counterplay: "The scary feature becomes readable instead of arbitrary.",
  },
  {
    id: "egg-hatch-death",
    title: "Egg Hatch Death",
    slot: "death",
    section: "death",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "custom",
            "targets": "the death trigger area or named target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Killing the mother can turn the clutch into the next immediate problem.",
    mechanics:
      "On death, each remaining egg hatches on a 13 or higher on a d20. Hatched eggs create spider minions in adjacent spaces. If the body was burned before death, this effect does not trigger.",
    counterplay: "Destroying or burning eggs before the final blow prevents the swarm.",
  },
  {
    id: "silk-cocoon-remains",
    title: "Silk Cocoon Remains",
    slot: "death",
    section: "death",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["minion", "standard", "boss"],
    cost: 2,
    complexity: 1,
    stats: { fairness: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "custom",
            "targets": "the death trigger area or named target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The corpse collapses into webbed remains that reveal previous victims.",
    mechanics:
      "On death, the body tears open nearby cocoons or drops its own silk-wrapped trophies. Searching the silk reveals one clue, treasure roll, or sign of a missing NPC.",
    counterplay: "The death effect is investigative rather than punitive.",
  },
  {
    id: "sticky-surroundings",
    title: "Sticky Surroundings",
    slot: "lair",
    section: "lairAction",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 5,
    complexity: 2,
    stats: { control: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "lairAction",
        "actionEconomy": "lairAction",
        "usage": {
            "type": "lair"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "custom",
            "targets": "creatures in the affected area"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "initiativeCount20",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "initiativeCount20",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": true
        },
        "text": {
            "effect": "At initiative count 20, creatures without Web Walker have disadvantage on Dexterity Saving Throws and Dexterity (Acrobatics) checks until initiative count 20 on the next round."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The entire nest makes agile movement unreliable.",
    mechanics:
      "At initiative count 20, creatures without Web Walker have disadvantage on Dexterity saving throws and Dexterity (Acrobatics) checks until initiative count 20 on the next round.",
    counterplay: "Burning lanes through the web or staying off webbed surfaces avoids the penalty.",
  },
  {
    id: "broodmother-web-lair",
    title: "Broodmother Web",
    slot: "lair",
    section: "lairAction",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss"],
    cost: 4,
    complexity: 3,
    stats: { control: 3 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "lairAction",
        "actionEconomy": "lairAction",
        "usage": {
            "type": "lair"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "radius",
            "size": 60,
            "unit": "ft",
            "targets": "creatures"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "self",
            "timing": "initiativeCount20",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "initiativeCount20",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The mother turns any visible point in the nest into a restraining web trap.",
    mechanics:
      "At initiative count 20, the creature casts or creates Web at a point it can see within 60 feet. While maintaining this effect, it cannot take other lair actions. A target that succeeds on the saving throw or escapes becomes immune to this lair action for 24 hours.",
    counterplay: "The single maintained web forces the monster to commit.",
  },
  {
    id: "dense-web-region",
    title: "Dense Webs",
    slot: "lair",
    section: "lairAction",
    source: "wolf-spiders",
    typeBias: ["beast", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 3,
    complexity: 1,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "lairAction",
        "actionEconomy": "lairAction",
        "usage": {
            "type": "lair"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "area",
            "shape": "custom",
            "targets": "creatures in the affected area"
        },
        "areaEffect": {
            "enabled": true,
            "type": "aura",
            "shape": "radius",
            "size": null,
            "unit": "ft",
            "origin": "point",
            "timing": "initiativeCount20",
            "targets": "creatures",
            "excludes": [],
            "repeatTiming": "initiativeCount20",
            "text": ""
        },
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": true,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Surfaces throughout the nest are layered with old silk.",
    mechanics:
      "At initiative count 20, choose a visible surface. Until cleared or burned, it becomes difficult terrain for creatures without Web Walker. Spiders attacking surprised targets on the surface have advantage.",
    counterplay: "Fire, blades, and careful routes create safe lanes.",
  },

  // Wax Death Masks support kept for source coverage
  {
    id: "waxen-mask-body",
    title: "Waxen Funeral Flesh",
    slot: "body",
    section: "trait",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { ac: 1, hp: 8 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "cold",
                "fire"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Its face and skin look preserved, smooth, and almost ceremonial.",
    mechanics:
      "The creature has resistance to cold damage but vulnerability to fire damage until it is bloodied.",
    counterplay: "Heat softens the wax and exposes the moving thing underneath.",
  },
  {
    id: "borrowed-face",
    title: "Borrowed Face Memory",
    slot: "mind",
    section: "trait",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 2,
    stats: { control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When a creature first sees its face clearly.",
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "The target cannot take reactions against this monster until the start of its next turn.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "It acts through the copied expressions of the dead.",
    mechanics:
      "When a creature first sees its face clearly, it makes a Wisdom save or cannot take reactions against this monster until the start of its next turn.",
    counterplay: "Covering, breaking, or melting the mask ends this feature.",
  },
  {
    id: "shadow-stillness",
    title: "Moves Only When Unwatched",
    slot: "movement",
    section: "bonusAction",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["boss", "standard"],
    cost: 5,
    complexity: 3,
    stats: { mobility: 2, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "bonusAction",
        "actionEconomy": "bonusAction",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "automatic"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The creature advances during blinks, darkness, panic, and distraction.",
    mechanics:
      "Once per round, when no conscious hostile creature has line of sight to it, it can move up to half its speed without provoking opportunity attacks.",
    counterplay: "Keeping light and sight lines on it prevents the free movement.",
  },
  {
    id: "mask-phase",
    title: "Changing Funeral Mask",
    slot: "twist",
    section: "trait",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 6,
    complexity: 4,
    stats: { dpr: 2, control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": "When bloodied.",
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "minor",
            "budgetRole": "mainAttack",
            "types": [
                "variable"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [],
            "severity": "minor",
            "duration": "",
            "special": []
        },
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": true
        },
        "text": {
            "effect": "When bloodied, choose one mask: Mourner Mask imposes disadvantage on opportunity attacks against it; Accuser Mask gives it +2 damage against frightened creatures; Saint Mask lets it end one condition on itself."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "At bloodied, the mask changes identity and the fight changes tone.",
    mechanics:
      "When bloodied, choose one: Mourner Mask imposes disadvantage on opportunity attacks against it; Accuser Mask gives it +2 damage against frightened creatures; Saint Mask lets it end one condition on itself.",
    counterplay: "The mask visibly cracks before bloodied; destroying or burning the mask before that point prevents the phase change.",
  },
  {
    id: "fire-softens-it",
    title: "Fire Softens It",
    slot: "weakness",
    section: "trait",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: -2,
    complexity: 1,
    stats: { fairness: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "trait",
        "actionEconomy": "passive",
        "usage": {
            "type": "passive"
        },
        "trigger": null,
        "resolution": {
            "type": "none"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "self",
            "targets": "the creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "custom",
            "scale": "minor",
            "budgetRole": "none",
            "types": [
                "fire"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": false,
            "breakCondition": false,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "Heat reveals seams, fingerprints, and the false face beneath the wax.",
    mechanics:
      "After the monster takes fire damage, the next attack against it before the start of its next turn has advantage.",
    counterplay: "Useful even when fire is not the best damage type.",
  },
  {
    id: "cold-funeral-touch",
    title: "Cold Funeral Touch",
    slot: "attack",
    section: "action",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 3,
    complexity: 1,
    stats: { dpr: 4, control: 1 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "action",
        "actionEconomy": "action",
        "usage": {
            "type": "atWill"
        },
        "trigger": null,
        "resolution": {
            "type": "attackRoll",
            "attackType": "melee",
            "bonus": "monster",
            "abilityBasis": "charisma",
            "reach": "5 ft.",
            "range": null
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one target"
        },
        "areaEffect": null,
        "damage": {
            "mode": "budget",
            "scale": "standard",
            "budgetRole": "mainAttack",
            "types": [
                "necrotic",
                "cold"
            ],
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": null,
        "counterplay": {
            "telegraph": true,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {},
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.2-template-readiness",
            "isStructured": true,
            "convertedFrom": "template-readiness-gap"
        }
    },
    summary: "The creature presses a wax-cold hand or mask against the target and steals warmth from the living face beneath.",
    mechanics:
      "Melee Attack Roll. On hit, the target takes cold damage plus necrotic damage. If the monster is wearing or presenting a recognizable face, it can move 10 feet after the hit without provoking opportunity attacks from that target.",
    counterplay: "Fire damage softens the wax and makes this attack easier to punish before the monster's next turn.",
  },
  {
    id: "face-curse",
    title: "Last Face Curse",
    slot: "death",
    section: "death",
    source: "wax-death-masks",
    typeBias: ["undead", "aberration"],
    roleBias: ["standard", "boss"],
    cost: 4,
    complexity: 2,
    stats: { control: 2 },
    rules: {
        "schemaVersion": "monster-graft-rules-v1.12",
        "section": "death",
        "actionEconomy": "deathTrigger",
        "usage": {
            "type": "death"
        },
        "trigger": "The creature dies or drops to 0 hit points.",
        "resolution": {
            "type": "savingThrow",
            "ability": "wisdom",
            "dc": "monster"
        },
        "secondaryResolution": null,
        "targeting": {
            "type": "single",
            "targets": "one creature"
        },
        "areaEffect": null,
        "damage": {
            "mode": "none",
            "budgetRole": "none",
            "types": [],
            "scale": "standard",
            "budgetShare": null,
            "expectedTargets": null,
            "parts": []
        },
        "condition": {
            "names": [
                "frightened"
            ],
            "severity": "major",
            "duration": "until the end of its next turn",
            "special": [],
            "sizeLimit": "",
            "escape": null,
            "repeatSave": null
        },
        "counterplay": {
            "telegraph": false,
            "breakCondition": true,
            "positioningAnswer": false,
            "nonDamageAnswer": false
        },
        "text": {
            "failure": "it is Frightened until the end of its next turn. If the mask was broken before death, this does not trigger.",
            "success": "No effect."
        },
        "multiattack": null,
        "spellcasting": null,
        "defense": null,
        "summon": null,
        "procedure": null,
        "references": [],
        "ongoing": null,
        "migration": {
            "source": "content-conversion-v1.1",
            "isStructured": true,
            "convertedFrom": "legacy-mechanics"
        }
    },
    summary: "The final expression remains in the room after the body falls.",
    mechanics:
      "On death, one creature that can see the mask makes a Wisdom save. On a failure, it is Frightened until the end of its next turn. If the mask was broken before death, this does not trigger.",
    counterplay: "Destroying the mask prevents the effect.",
  },
];

export const FEATURE_FRAME_FIT_OVERRIDES = {
  "swollen-corpse": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "support",
        "controller"
      ]
    }
  },
  "fresh-bloat-hide": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard",
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "support",
        "skirmisher",
        "lurker"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "volatile-immobile-mass": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "support",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "skin-slippage": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "support",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "mindless-command": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "support",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece",
        "normal"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "pressure-agony": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "stumbling-mass": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "brute"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "rupture-charge": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard",
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "collapsed-crawler": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard"
      ],
      "recommended": [
        "standard",
        "minion"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard",
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "slam-decomposition": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "lurker"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "empowered-slam": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard",
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "acid-vomit": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "hard"
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "artillery",
        "brute"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece",
        "legendary"
      ],
      "min": "elite"
    },
    "cr": {
      "recommendedMin": 7
    }
  },
  "corpse-grab": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "gas-buildup": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    }
  },
  "unstable-rupture": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard",
        "fast",
        "ambusher",
        "legendary"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "artillery"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "dangerously-unstable": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss"
      ],
      "recommended": [
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard",
        "fast",
        "ambusher",
        "legendary"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "horror"
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ],
      "min": "boss"
    },
    "cr": {
      "recommendedMin": 7
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "artillery"
      ]
    }
  },
  "undead-fortitude": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "support",
        "controller"
      ]
    }
  },
  "siege-corpse": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece",
        "normal"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "lurker"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "head-weak-spot": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "mechanical-stress": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 30
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "radiant-preservation-failure": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "corpse-bloom-death": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "toxic-detonation": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "artillery"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "purge-fluid-flood": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "choking-air": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss"
      ],
      "recommended": [
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "horror"
    },
    "tiers": {
      "min": "boss",
      "recommended": [
        "boss",
        "legendary",
        "setpiece",
        "elite"
      ]
    },
    "cr": {
      "recommendedMin": 5
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "corpse-pressure-room": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss"
      ],
      "recommended": [
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "horror"
    },
    "tiers": {
      "min": "boss",
      "recommended": [
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 7
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "shame-hunger": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "lurker",
        "support",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    }
  },
  "corpse-craving": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "nocturnal-haunting": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "ethereal-sight": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "support",
        "skirmisher",
        "lurker",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "incorporeal-movement": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "grave-bite": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher",
        "slow",
        "standard"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "lurker",
        "controller"
      ]
    }
  },
  "infected-bite": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "lurker"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "purulent-bite": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "hard"
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "brute",
        "lurker"
      ]
    },
    "tiers": {
      "min": "elite",
      "recommended": [
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 7
    }
  },
  "horrific-apparition": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "artillery"
      ]
    }
  },
  "corpse-tendrils": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "flesh-harvest": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "support",
        "lurker"
      ]
    }
  },
  "deceitful-apparition": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "mortal-afterlife": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "vanish-spirit": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "cunning-action-spirit": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker"
      ]
    }
  },
  "horrific-assault": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute"
      ]
    }
  },
  "no-witnesses-rage": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher",
        "legendary"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    },
    "tacticalRoles": {
      "recommended": [
        "brute",
        "lurker"
      ]
    }
  },
  "daytime-weakness": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "shameful-feeding": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 30
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "dangerous-hunger": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    }
  },
  "salt-and-names": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "spectral-dust-death": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "last-meal-memory": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support"
      ]
    }
  },
  "funeral-silence-lair": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss"
      ],
      "recommended": [
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "horror"
    },
    "tiers": {
      "min": "boss",
      "recommended": [
        "boss",
        "legendary",
        "setpiece",
        "elite"
      ]
    },
    "cr": {
      "recommendedMin": 5
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    }
  },
  "graveyard-offerings-lair": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "hard"
    },
    "tiers": {
      "recommended": [
        "boss",
        "legendary",
        "setpiece",
        "elite"
      ]
    },
    "cr": {
      "recommendedMin": 5
    },
    "tacticalRoles": {
      "recommended": [
        "controller",
        "support",
        "brute"
      ]
    }
  },
  "maternal-swarm-instinct": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "support",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "egg-carrier": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute",
        "support",
        "controller"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ],
      "min": "horror"
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece",
        "legendary"
      ],
      "min": "boss"
    },
    "cr": {
      "recommendedMin": 7
    }
  },
  "spider-climb": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute",
        "support",
        "controller"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "web-walker": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute",
        "support",
        "controller"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "barbed-chitin": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute",
        "support",
        "controller",
        "artillery"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    }
  },
  "umbral-skin": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute",
        "support",
        "controller"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "malformed-broodling": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion"
      ],
      "recommended": [
        "minion"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute",
        "support",
        "controller"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece",
        "normal"
      ]
    },
    "cr": {
      "recommendedMax": 4
    }
  },
  "hundred-eyed": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    }
  },
  "wall-crawler": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "web-dancer": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "shadow-jump": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "predatory-jump": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    }
  },
  "venomous-bite": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "perforate": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard"
      ],
      "recommended": [
        "standard",
        "minion"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "web-recharge": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "shadow-web": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "artillery",
        "brute"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "flesh-harvest": {
    rules: {
      resolution: { type: "none" },
      text: {
        effect:
          "The creature can consume a Medium or smaller corpse using an action. For each corpse consumed this way, it gains a +1 bonus to attack rolls, damage rolls, and AC until dawn, to a maximum bonus equal to its Proficiency Bonus.",
      },
    },
  },
  "enrage-broodmother": {
    rules: {
      resolution: { type: "none" },
      text: {
        response:
          "Roll a d6. On a 4 or higher, the monster enrages until the combat ends, gaining a bonus to attack rolls, damage rolls, speed, and jump distance.",
      },
    },
  },
  "venomous-spit": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard"
      ],
      "recommended": [
        "minion",
        "standard"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "artillery"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "brood-injection": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "enrage-broodmother": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher",
        "legendary"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "brute",
        "support",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "web-architect": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    }
  },
  "corrosive-web": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support",
        "artillery"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    }
  },
  "hunter-spider": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "thin-legs": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "standard",
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "fear-of-fire": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "standard",
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "underbelly-weak-spot": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "standard",
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "eyes-weak-spot": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "danger": {
      "recommended": [
        "standard",
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 30
    }
  },
  "brood-tell": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "minion",
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "support",
        "controller"
      ]
    },
    "danger": {
      "recommended": [
        "standard",
        "hard",
        "horror"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "egg-hatch-death": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "silk-cocoon-remains": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "minion",
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror",
        "standard"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "sticky-surroundings": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "boss",
        "legendary",
        "setpiece",
        "elite"
      ]
    },
    "danger": {
      "min": "hard",
      "recommended": [
        "horror",
        "hard"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "broodmother-web-lair": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss"
      ],
      "recommended": [
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "min": "boss",
      "recommended": [
        "boss",
        "legendary",
        "setpiece",
        "elite"
      ]
    },
    "danger": {
      "min": "horror",
      "recommended": [
        "horror",
        "hard"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "dense-web-region": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "fast",
        "ambusher"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "skirmisher",
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "danger": {
      "min": "hard",
      "recommended": [
        "horror",
        "hard"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "waxen-mask-body": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "standard",
        "fast"
      ]
    },
    "danger": {
      "recommended": [
        "hard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "lurker",
        "controller",
        "brute",
        "support"
      ]
    }
  },
  "borrowed-face": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "standard",
        "fast"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "lurker",
        "controller",
        "support"
      ]
    }
  },
  "shadow-stillness": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "boss",
        "standard"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "standard",
        "fast",
        "ambusher"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "lurker",
        "controller",
        "skirmisher"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  },
  "mask-phase": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "standard",
        "fast"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "lurker",
        "controller",
        "support",
        "brute"
      ]
    },
    "tiers": {
      "recommended": [
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 6
    }
  },
  "fire-softens-it": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "standard",
        "fast"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "standard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "lurker",
        "controller"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "legendary",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMax": 10
    }
  },
  "cold-funeral-touch": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "standard",
        "fast"
      ]
    },
    "danger": {
      "recommended": [
        "hard"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "lurker",
        "controller",
        "brute"
      ]
    }
  },
  "face-curse": {
    "schemaVersion": "monster-frame-fit-v1.0",
    "encounterRoles": {
      "allowed": [
        "standard",
        "boss"
      ],
      "recommended": [
        "standard",
        "boss"
      ]
    },
    "tempo": {
      "recommended": [
        "standard",
        "fast"
      ]
    },
    "danger": {
      "recommended": [
        "hard",
        "horror"
      ]
    },
    "tacticalRoles": {
      "recommended": [
        "lurker",
        "controller",
        "support"
      ]
    },
    "tiers": {
      "recommended": [
        "normal",
        "elite",
        "boss",
        "setpiece"
      ]
    },
    "cr": {
      "recommendedMin": 5
    }
  }
};



const DAMAGE_NONE_RULE = Object.freeze({
  mode: "none",
  budgetRole: "none",
  types: [],
  scale: "standard",
  budgetShare: null,
  expectedTargets: null,
  parts: [],
});

const DAMAGE_RULES_CONTENT_CLEANUP_OVERRIDES = {
  "slam-decomposition": {
    rules: {
      text: {
        hit: "the target takes {damage} Bludgeoning damage. If the creature moved at least 10 feet straight toward the target this turn, add one extra damage die.",
      },
    },
  },
  "grave-bite": {
    rules: {
      text: {
        hit: "the target takes {damage} Piercing and Necrotic damage. If the target is below half Hit Points, the monster gains Temporary Hit Points equal to the Necrotic damage dealt.",
      },
    },
  },
  "infected-bite": {
    rules: {
      text: {
        hit: "the target takes {damage} Necrotic damage. If the target is not Undead, it makes a Constitution Saving Throw.",
        failure: "At the end of its next Long Rest, the target gains 1 Exhaustion level, to a maximum of 3 levels from this feature.",
        success: "No disease effect.",
      },
    },
  },
  "horrific-apparition": {
    rules: {
      text: {
        failure: "The target takes {damage} Psychic damage and has the Frightened condition until the start of the spirit's next turn. If the target fails by 5 or more, it also suffers a supernatural aging or wasting mark that can be reversed by powerful restoration magic within 24 hours.",
        success: "Half damage only.",
      },
    },
  },
  "venomous-bite": {
    rules: {
      text: {
        hit: "the target takes {damage} Piercing and Poison damage and must make a Constitution Saving Throw.",
        failure: "If this damage reduces the target to 0 Hit Points, it has the Paralyzed and Poisoned conditions for 1 hour.",
        success: "No additional effect.",
      },
    },
  },
  "perforate": {
    rules: {
      text: {
        hit: "the target takes {damage} Piercing damage and must make a Constitution Saving Throw.",
        failure: "The wound keeps bleeding. The target takes Piercing damage equal to the monster's Proficiency Bonus at the start of each of its turns until it receives healing or a creature succeeds on a Medicine check to close the wound.",
        success: "No ongoing wound.",
      },
    },
  },
  "flesh-harvest": {
    rules: {
      resolution: { type: "none" },
      text: {
        effect:
          "The creature can consume a Medium or smaller corpse using an action. For each corpse consumed this way, it gains a +1 bonus to attack rolls, damage rolls, and AC until dawn, to a maximum bonus equal to its Proficiency Bonus.",
      },
    },
  },
  "enrage-broodmother": {
    rules: {
      resolution: { type: "none" },
      text: {
        response:
          "Roll a d6. On a 4 or higher, the monster enrages until the combat ends, gaining a bonus to attack rolls, damage rolls, speed, and jump distance.",
      },
    },
  },
  "venomous-spit": {
    rules: {
      text: {
        hit: "the target takes {damage} Poison damage.",
      },
    },
  },
  "cold-funeral-touch": {
    rules: {
      text: {
        hit: "the target takes {damage} Cold and Necrotic damage. If the monster is wearing or presenting a recognizable face, it can move 10 feet after the hit without provoking opportunity attacks from that target.",
      },
    },
  },
  "rupture-charge": {
    rules: {
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "bonusAction",
        budgetShare: 0.15,
        expectedTargets: 1,
        roundWeight: [1, 1, 1],
        types: ["bludgeoning"],
        parts: [],
      },
      text: {
        effect: "The creature moves up to half its speed in a straight line toward a creature it can see. Its next Slam before the end of the turn deals extra Bludgeoning damage equal to its Proficiency Bonus. After moving this way, roll a d6; on a 6, trigger one selected Unstable reaction without spending the reaction.",
      },
    },
  },
  "unstable-rupture": {
    rules: {
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "reactionPunish",
        budgetShare: 0.25,
        expectedTargets: 1.25,
        roundWeight: [0.1, 0.1, 0.1],
        types: ["poison", "slashing"],
        parts: [],
      },
      text: {
        failure: "The target takes {damage} Poison and Slashing damage.",
        success: "Half damage only.",
      },
    },
    mechanics:
      "Trigger: the creature takes piercing or slashing damage. Response: roll a d6. On a 6, the creature releases a toxic rupture. Dexterity Saving Throw: creatures within 10 feet. Failure: the target takes poison and slashing damage. Success: half damage only.",
  },
  "dangerously-unstable": {
    rules: {
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
      text: {
        failure: "The target takes {damage} Poison damage and has the Prone condition. Creatures out to 80 feet take Thunder damage equal to the monster's Proficiency Bonus and may have the Deafened condition for 1 minute.",
        success: "Half damage only.",
        response:
          "Roll a d6. On a 2 or higher, the creature detonates and destroys itself. {save} Failure: The target takes {damage} Poison damage and has the Prone condition. Success: Half damage only. Creatures out to 80 feet take Thunder damage equal to the monster's Proficiency Bonus and may have the Deafened condition for 1 minute.",
      },
    },
  },
  "toxic-detonation": {
    stats: { dpr: 1, control: 1 },
    rules: {
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "deathBurst",
        budgetShare: 0.45,
        expectedTargets: 1.25,
        roundWeight: [0, 0, 0.25],
        types: ["poison"],
        parts: [],
      },
      text: {
        failure: "The target takes {damage} Poison damage and has the Poisoned condition until the end of its next turn.",
        success: "Half damage only.",
      },
    },
    mechanics:
      "When the creature dies or drops to 0 Hit Points, it releases a toxic burst. Dexterity Saving Throw: each creature in a 10-foot Radius. Failure: the target takes poison damage and has the Poisoned condition until the end of its next turn. Success: half damage only.",
    i18n: {
      it: {
        mechanics:
          "Quando la creatura muore o scende a 0 Punti Ferita, rilascia una detonazione tossica. Tiro Salvezza su Destrezza: ogni creatura in un Raggio di 10 piedi. Fallimento: il bersaglio subisce danni da veleno e ha la condizione Poisoned fino alla fine del suo prossimo turno. Successo: solo metà danni.",
      },
    },
  },
  "web-recharge": {
    rules: {
      damage: { ...DAMAGE_NONE_RULE },
      text: {
        failure:
          "The target has the Restrained condition until the web is destroyed. The web has low AC and Hit Points, vulnerability to Fire damage, and immunity to Poison and Psychic damage.",
        success: "No effect.",
      },
    },
  },
  "shadow-web": {
    rules: {
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "ongoing",
        budgetShare: 0.2,
        expectedTargets: 1,
        roundWeight: [0, 0.65, 0.65],
        types: ["slashing"],
        parts: [],
      },
      text: {
        failure:
          "The target has the Restrained condition until the web is destroyed. While restrained by the web, the target takes {damage} Slashing damage at the start of each of its turns. Shadow webs have higher AC and Hit Points than ordinary webs.",
        success: "No effect.",
      },
    },
  },
  "barbed-chitin": {
    rules: {
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "reactionPunish",
        budgetShare: 0.25,
        expectedTargets: 1,
        roundWeight: [0.35, 0.35, 0.35],
        types: ["piercing"],
        parts: [],
      },
      text: {
        effect:
          "At the start of each of its turns, the creature deals {damage} Piercing damage to one creature grappling it or grappled by it.",
      },
    },
  },
  "brood-injection": {
    rules: {
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "ongoing",
        budgetShare: 0.2,
        expectedTargets: 1,
        roundWeight: [0, 0.65, 0],
        types: ["piercing"],
        parts: [],
      },
      text: {
        failure:
          "The target's speed is reduced by 10 feet, and it takes {damage} Piercing damage at the start of its next turn. An action and a successful Medicine check ends the effect.",
        success: "No effect.",
      },
    },
  },
  "corrosive-web": {
    rules: {
      damage: {
        mode: "budget",
        scale: "minor",
        budgetRole: "ongoing",
        budgetShare: 0.2,
        expectedTargets: 1,
        roundWeight: [0, 0.65, 0.65],
        types: ["acid"],
        parts: [],
      },
      text: {
        effect:
          "Whenever a creature is hit by one of the monster's web abilities or starts its turn restrained by its web, it takes Acid damage equal to the monster's Proficiency Bonus.",
      },
    },
  },
};

const NON_DAMAGE_RULE_CLEANUP_IDS = new Set([
  "siege-corpse",
  "radiant-preservation-failure",
  "shame-hunger",
  "incorporeal-movement",
  "flesh-harvest",
  "no-witnesses-rage",
  "dangerous-hunger",
  "maternal-swarm-instinct",
  "umbral-skin",
  "underbelly-weak-spot",
  "eyes-weak-spot",
  "waxen-mask-body",
  "mask-phase",
  "fire-softens-it",
  "enrage-broodmother",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function mergeCleanup(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) return override === undefined ? base : override;
  const output = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    output[key] = isPlainObject(value) && isPlainObject(output[key]) ? mergeCleanup(output[key], value) : value;
  });
  return output;
}

function getCleanupDamageDefaults(graft, damage = {}, rules = {}) {
  if (!damage || damage.mode !== "budget") return damage;
  const actionEconomy = rules.actionEconomy || graft.section || "passive";
  const usage = rules.usage?.type || "passive";
  let budgetRole = damage.budgetRole;
  let budgetShare = damage.budgetShare;
  let expectedTargets = damage.expectedTargets;
  let roundWeight = damage.roundWeight;

  if (!budgetRole || budgetRole === "none" || (actionEconomy === "deathTrigger" && budgetRole !== "deathBurst") || (actionEconomy === "reaction" && budgetRole === "mainAttack") || (usage === "recharge" && budgetRole === "mainAttack")) {
    if (actionEconomy === "deathTrigger") budgetRole = "deathBurst";
    else if (actionEconomy === "reaction") budgetRole = "reactionPunish";
    else if (actionEconomy === "bonusAction") budgetRole = "bonusAction";
    else if (usage === "recharge") budgetRole = rules.condition?.severity && ["major", "severe"].includes(rules.condition.severity) ? "rechargeControl" : "rechargeBurst";
    else budgetRole = "mainAttack";
  }

  if (budgetShare == null) {
    if (budgetRole === "mainAttack") budgetShare = 0.85;
    else if (budgetRole === "secondaryAttack") budgetShare = 0.5;
    else if (budgetRole === "minorAttack") budgetShare = 0.35;
    else if (budgetRole === "bonusAction") budgetShare = 0.3;
    else if (budgetRole === "reactionPunish") budgetShare = 0.45;
    else if (budgetRole === "rechargeBurst") budgetShare = 1.25;
    else if (budgetRole === "rechargeControl") budgetShare = 0.85;
    else if (budgetRole === "deathBurst") budgetShare = 0.45;
    else if (budgetRole === "ongoing") budgetShare = 0.2;
  }

  if (expectedTargets == null) {
    if (rules.targeting?.type === "area") {
      if (budgetRole === "deathBurst") expectedTargets = 1.25;
      else if (budgetRole === "rechargeBurst" || budgetRole === "rechargeControl") expectedTargets = 1.5;
      else expectedTargets = 1.25;
    } else {
      expectedTargets = 1;
    }
  }

  if (!Array.isArray(roundWeight)) {
    if (budgetRole === "deathBurst") roundWeight = [0, 0, 0.25];
    else if (budgetRole === "reactionPunish") roundWeight = [0.65, 0.65, 0.65];
    else if (budgetRole === "rechargeBurst" || budgetRole === "rechargeControl") roundWeight = [1, 0.35, 0.35];
    else if (budgetRole === "ongoing") roundWeight = [0, 0.65, 0.65];
  }

  return { ...damage, budgetRole, budgetShare, expectedTargets, roundWeight };
}

function cleanupRulesDamage(graft) {
  if (NON_DAMAGE_RULE_CLEANUP_IDS.has(graft.id)) {
    return {
      ...graft,
      rules: {
        ...(graft.rules || {}),
        damage: { ...DAMAGE_NONE_RULE },
      },
    };
  }

  const rules = graft.rules || null;
  const damage = rules?.damage || null;
  if (!rules || !damage || damage.mode !== "budget") return graft;
  if (Array.isArray(damage.parts) && damage.parts.length) {
    return {
      ...graft,
      rules: {
        ...rules,
        damage: {
          ...damage,
          parts: damage.parts.map((part) => getCleanupDamageDefaults(graft, part, rules)),
        },
      },
    };
  }
  return {
    ...graft,
    rules: {
      ...rules,
      damage: getCleanupDamageDefaults(graft, damage, rules),
    },
  };
}

function applyRulesContentCleanup(graft) {
  const override = DAMAGE_RULES_CONTENT_CLEANUP_OVERRIDES[graft.id] || null;
  const merged = override ? mergeCleanup(graft, override) : graft;
  return cleanupRulesDamage(merged);
}

function normalizeArrayField(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSourceAnchors(graft) {
  if (Array.isArray(graft.sourceAnchors)) return graft.sourceAnchors;
  return graft.source ? [graft.source] : [];
}

function normalizeMonsterGraft(graft) {
  const cleaned = applyRulesContentCleanup(graft);
  const fit = cleaned.fit || FEATURE_FRAME_FIT_OVERRIDES[cleaned.id] || null;
  return {
    ...cleaned,
    fit,
    sourceAnchors: normalizeSourceAnchors(cleaned),
    sourceTypes: normalizeArrayField(cleaned.sourceTypes),
    themes: normalizeArrayField(cleaned.themes),
    motifs: normalizeArrayField(cleaned.motifs),
  };
}

export const MONSTER_GRAFTS = RAW_MONSTER_GRAFTS.map(normalizeMonsterGraft);

export const FEATURE_COMPATIBILITY_OVERRIDES = {
  "swollen-corpse": { grants: ["undead_body", "corpse_body", "bloated_body", "corpse_presence"] },
  "fresh-bloat-hide": { grants: ["undead_body", "corpse_body", "bloated_body", "corpse_presence"] },
  "volatile-immobile-mass": {
    grants: ["corpse_body", "bloated_body", "corpse_presence", "immobile_mass"],
    incompatibleWith: ["high_mobility", "web_dancer", "predatory_jump", "shadow_jump"],
  },
  "skin-slippage": { grants: ["corpse_body"] },
  "mindless-command": { grants: ["mindless"] },
  "pressure-agony": { softRequires: ["bloated_body"] },
  "gas-buildup": { grants: ["unstable_body", "bloated_body"] },
  "unstable-rupture": { softRequires: ["unstable_body", "bloated_body"] },
  "dangerously-unstable": {
    requires: ["bloated_body"],
    grants: ["unstable_body"],
    avoidWith: ["high_mobility", "stealth_predator"],
  },
  "undead-fortitude": { requires: ["undead_body"] },
  "corpse-bloom-death": { softRequires: ["corpse_body"] },
  "toxic-detonation": { softRequires: ["bloated_body"] },
  "purge-fluid-flood": { softRequires: ["bloated_body"] },
  "corpse-pressure-room": { softRequires: ["corpse_presence"] },

  "corpse-craving": { grants: ["corpse_feeding", "corpse_presence"] },
  "shame-hunger": { grants: ["corpse_feeding"] },
  "grave-bite": { grants: ["corpse_feeding"] },
  "ethereal-sight": { grants: ["spirit_body"] },
  "incorporeal-movement": {
    grants: ["spirit_body"],
    incompatibleWith: ["egg_carrier", "barbed_chitin", "physical_chitin"],
  },
  "corpse-tendrils": { requires: ["corpse_presence"] },
  "flesh-harvest": { softRequires: ["corpse_presence"], grants: ["corpse_feeding"] },
  "deceitful-apparition": { incompatibleWith: ["mindless"] },
  "mortal-afterlife": { incompatibleWith: ["mindless"] },
  "no-witnesses-rage": { requires: ["corpse_feeding"] },
  "dangerous-hunger": { softRequires: ["corpse_feeding"] },
  "last-meal-memory": { softRequires: ["corpse_feeding"] },
  "graveyard-offerings-lair": { softRequires: ["corpse_presence", "graveyard_context"] },

  "maternal-swarm-instinct": { grants: ["brood"] },
  "egg-carrier": { grants: ["egg_carrier", "brood"] },
  "spider-climb": { grants: ["climber", "spider_body"] },
  "web-walker": { grants: ["web_walker", "web_terrain"] },
  "barbed-chitin": {
    grants: ["barbed_chitin", "physical_chitin"],
    incompatibleWith: ["spirit_body", "no_body"],
  },
  "umbral-skin": { grants: ["shadow_body"] },
  "malformed-broodling": { requires: ["brood"] },
  "hunter-spider": { grants: ["stealth_predator"] },
  "wall-crawler": { grants: ["climber", "spider_body"] },
  "web-dancer": { requires: ["web_maker"], grants: ["high_mobility", "web_dancer"] },
  "shadow-jump": { grants: ["high_mobility", "shadow_jump", "shadow_movement"] },
  "predatory-jump": { grants: ["high_mobility", "predatory_jump"] },
  "web-recharge": { grants: ["web_maker", "web_terrain"] },
  "shadow-web": { grants: ["web_maker", "web_terrain"] },
  "enrage-broodmother": { requires: ["egg_carrier"] },
  "web-architect": { requires: ["web_maker"] },
  "corrosive-web": { requires: ["web_maker"] },
  "brood-tell": { softRequires: ["brood"] },
  "egg-hatch-death": { requires: ["egg_carrier"] },
  "sticky-surroundings": { softRequires: ["web_terrain"] },
  "broodmother-web-lair": { requires: ["web_maker"] },
  "dense-web-region": { grants: ["web_terrain"] },  "bone-reassembly": { requires: ["bone_body"] },
  "waxen-mask-body": { grants: ["wax_body", "wax_mask"] },
  "borrowed-face": { requires: ["wax_mask"], incompatibleWith: ["mindless"] },
  "shadow-stillness": { grants: ["high_mobility"] },
  "mask-phase": { requires: ["wax_mask"] },
  "fire-softens-it": { requires: ["wax_body"] },
  "face-curse": { requires: ["wax_mask"] },
};


export const FEATURE_ANATOMY_CONSTRAINT_OVERRIDES = {
  "acid-vomit": {
    allowedBodyPlans: ["humanoid", "amorphous"],
    requiredAnatomy: ["mouth", "flesh"],
    forbiddenBodyPlans: ["incorporeal", "arachnid"],
    note: "A vomit attack needs a wet organic body with a mouth or rupturing mass.",
  },
  "corpse-grab": {
    allowedBodyPlans: ["humanoid", "amorphous"],
    requiresAnyAnatomy: ["hands", "grasping_limbs", "tendrils"],
    forbiddenBodyPlans: ["arachnid", "incorporeal"],
  },
  "rupture-charge": {
    allowedBodyPlans: ["humanoid", "amorphous"],
    requiredTags: ["physical"],
    forbiddenBodyPlans: ["incorporeal"],
  },
  "collapsed-crawler": {
    allowedBodyPlans: ["humanoid", "amorphous"],
    requiredTags: ["corpse"],
    forbiddenBodyPlans: ["incorporeal", "arachnid"],
  },
  "skin-slippage": {
    requiredAnatomy: ["flesh"],
    forbiddenTags: ["no_flesh"],
  },
  "fresh-bloat-hide": {
    requiredAnatomy: ["flesh", "corpse"],
    forbiddenTags: ["no_flesh"],
  },
  "swollen-corpse": {
    requiredTags: ["corpse", "physical"],
    forbiddenBodyPlans: ["incorporeal"],
  },
  "volatile-immobile-mass": {
    allowedBodyPlans: ["humanoid", "amorphous"],
    requiredTags: ["corpse", "physical"],
    forbiddenBodyPlans: ["incorporeal", "arachnid"],
  },

  "incorporeal-movement": {
    allowedBodyPlans: ["incorporeal"],
    requiredAnatomy: ["spectral_body"],
  },
  "vanish-spirit": {
    allowedBodyPlans: ["incorporeal"],
    requiredAnatomy: ["spectral_body"],
  },
  "ethereal-sight": {
    allowedBodyPlans: ["incorporeal"],
    requiredTags: ["spirit"],
  },
  "grave-bite": {
    requiresAnyAnatomy: ["jaw", "mouth", "fangs"],
    forbiddenAnatomy: ["beak"],
  },
  "infected-bite": {
    requiresAnyAnatomy: ["jaw", "mouth", "fangs"],
    forbiddenAnatomy: ["beak"],
  },
  "purulent-bite": {
    requiresAnyAnatomy: ["jaw", "mouth", "fangs"],
  },
  "corpse-tendrils": {
    allowedBodyPlans: ["amorphous", "humanoid"],
    requiresAnyAnatomy: ["tendrils", "flesh", "corpse"],
    forbiddenBodyPlans: ["arachnid", "incorporeal"],
  },  "bone-reassembly": {
    exclusiveToFamilies: ["skeleton"],
    requiredAnatomy: ["bones"],
  },
  "maternal-swarm-instinct": {
    allowedFamilies: ["spider"],
    allowedBodyPlans: ["arachnid"],
  },
  "egg-carrier": {
    allowedFamilies: ["spider"],
    allowedBodyPlans: ["arachnid"],
    requiredAnatomy: ["abdomen"],
  },
  "spider-climb": {
    allowedBodyPlans: ["arachnid"],
    requiredAnatomy: ["climbing_limbs"],
  },
  "web-walker": {
    allowedBodyPlans: ["arachnid"],
    requiredTags: ["web_bearing"],
  },
  "barbed-chitin": {
    allowedBodyPlans: ["arachnid"],
    requiredAnatomy: ["carapace"],
  },
  "malformed-broodling": {
    allowedFamilies: ["spider"],
    allowedBodyPlans: ["arachnid"],
  },
  "hundred-eyed": {
    requiresAnyAnatomy: ["multiple_eyes", "eyes", "central_eye"],
  },
  "wall-crawler": {
    requiresAnyAnatomy: ["climbing_limbs", "legs"],
    forbiddenBodyPlans: ["incorporeal"],
  },
  "web-dancer": {
    allowedBodyPlans: ["arachnid"],
    requiredAnatomy: ["web_glands", "spinnerets"],
  },
  "predatory-jump": {
    requiresAnyAnatomy: ["legs", "many_legs", "climbing_limbs"],
    forbiddenBodyPlans: ["incorporeal"],
  },
  "venomous-bite": {
    requiredAnatomy: ["fangs", "venom_glands"],
    allowedBodyPlans: ["arachnid"],
  },
  "perforate": {
    requiresAnyAnatomy: ["fangs", "stinger", "mandibles"],
    forbiddenBodyPlans: ["humanoid", "incorporeal"],
  },
  "web-recharge": {
    requiredAnatomy: ["web_glands", "spinnerets"],
    allowedBodyPlans: ["arachnid"],
  },
  "shadow-web": {
    requiredAnatomy: ["web_glands", "spinnerets"],
    allowedBodyPlans: ["arachnid"],
  },
  "flesh-harvest": {
    rules: {
      resolution: { type: "none" },
      text: {
        effect:
          "The creature can consume a Medium or smaller corpse using an action. For each corpse consumed this way, it gains a +1 bonus to attack rolls, damage rolls, and AC until dawn, to a maximum bonus equal to its Proficiency Bonus.",
      },
    },
  },
  "enrage-broodmother": {
    rules: {
      resolution: { type: "none" },
      text: {
        response:
          "Roll a d6. On a 4 or higher, the monster enrages until the combat ends, gaining a bonus to attack rolls, damage rolls, speed, and jump distance.",
      },
    },
  },
  "venomous-spit": {
    requiredAnatomy: ["venom_glands", "mouth"],
    allowedBodyPlans: ["arachnid"],
  },
  "brood-injection": {
    allowedBodyPlans: ["arachnid"],
    requiresAnyAnatomy: ["fangs", "stinger", "venom_glands"],
  },
  "enrage-broodmother": {
    allowedFamilies: ["spider"],
    requiredAnatomy: ["abdomen"],
  },
  "web-architect": {
    requiredAnatomy: ["web_glands", "spinnerets"],
    allowedBodyPlans: ["arachnid"],
  },
  "corrosive-web": {
    requiredAnatomy: ["web_glands", "spinnerets"],
    allowedBodyPlans: ["arachnid"],
  },
  "hunter-spider": {
    allowedBodyPlans: ["arachnid"],
    requiredAnatomy: ["legs", "fangs"],
  },
  "thin-legs": {
    allowedBodyPlans: ["arachnid", "quadruped", "avian"],
    requiredAnatomy: ["legs"],
  },
  "underbelly-weak-spot": {
    allowedBodyPlans: ["arachnid", "quadruped", "amorphous"],
    forbiddenBodyPlans: ["incorporeal"],
  },
  "eyes-weak-spot": {
    requiresAnyAnatomy: ["eyes", "multiple_eyes", "central_eye"],
  },
  "brood-tell": {
    allowedFamilies: ["spider"],
  },
  "egg-hatch-death": {
    allowedFamilies: ["spider"],
    requiredAnatomy: ["abdomen"],
  },
  "broodmother-web-lair": {
    requiredAnatomy: ["web_glands", "spinnerets"],
    allowedFamilies: ["spider"],
  },

  "waxen-mask-body": {
    allowedBodyPlans: ["humanoid"],
    requiredAnatomy: ["face"],
  },
  "borrowed-face": {
    allowedBodyPlans: ["humanoid", "incorporeal"],
    requiredAnatomy: ["face"],
  },
  "mask-phase": {
    allowedBodyPlans: ["humanoid", "incorporeal"],
    requiredAnatomy: ["face"],
  },
  "fire-softens-it": {
    requiredAnatomy: ["face"],
  },
};

export const FEATURE_ANATOMY_GRANT_OVERRIDES = {
  "spider-climb": {
    grantsAnatomy: ["climbing_limbs"],
    grantsTags: ["climber"],
    grantsTokens: ["climber", "spider_body"],
    note: "Confirms the build has surface-gripping limbs suitable for spider movement chains.",
  },
  "web-walker": {
    grantsTags: ["web_walker"],
    grantsTokens: ["web_walker", "web_terrain"],
  },
  "egg-carrier": {
    grantsAnatomy: ["abdomen"],
    grantsTags: ["brood", "egg_carrier"],
    grantsTokens: ["egg_carrier", "brood"],
  },
  "barbed-chitin": {
    grantsAnatomy: ["carapace"],
    grantsTags: ["physical_chitin"],
    grantsTokens: ["barbed_chitin", "physical_chitin"],
  },
  "wall-crawler": {
    grantsAnatomy: ["climbing_limbs"],
    grantsTags: ["climber"],
    grantsTokens: ["climber", "spider_body"],
  },
  "web-recharge": {
    grantsTokens: ["web_maker", "web_terrain"],
  },
  "shadow-web": {
    grantsTokens: ["web_maker", "web_terrain"],
  },
  "dense-web-region": {
    grantsTokens: ["web_terrain"],
  },  "waxen-mask-body": {
    grantsAnatomy: ["face"],
    grantsTags: ["wax_body", "wax_mask"],
    grantsTokens: ["wax_body", "wax_mask"],
  },
};

export const FEATURE_MECHANIC_OVERRIDES = {
  "acid-vomit": {
    mechanicTags: [
      "damage",
      "aoe",
      "ongoing_damage",
      "healing_denial",
      "recharge",
      "cleanup_action",
    ],
    pressureTags: ["area", "control", "sustain"],
    complexityTags: ["recharge", "ongoing_tracking", "cleanup_action"],
    damageProfile: {
      baseDamage: 7,
      damageType: "Acid",
      expectedTargets: 2,
      roundWeight: [1, 0.35, 0.35],
    },
    usageProfile: { frequency: "recharge", recharge: "5-6" },
    conditionProfile: {
      condition: "Healing Denial",
      severity: "Major",
      duration: "until_cleaned",
      repeatSave: false,
    },
  },
  "corpse-grab": {
    mechanicTags: ["save", "grapple", "restrained", "escape_check"],
    pressureTags: ["control", "single_target_lockdown"],
    complexityTags: ["condition_tracking", "escape_check"],
    conditionProfile: {
      condition: "Restrained",
      severity: "Major",
      duration: "until_escape",
      repeatSave: true,
    },
  },
  "unstable-rupture": {
    mechanicTags: ["reaction", "triggered_damage", "aoe", "save"],
    pressureTags: ["reaction_burst", "area", "punish_damage_type"],
    complexityTags: ["reaction_trigger", "random_trigger"],
    damageProfile: {
      baseDamage: 3,
      damageType: "Poison",
      expectedTargets: 2,
      roundWeight: [0.25, 0.25, 0.25],
    },
    usageProfile: { frequency: "reaction", trigger: "piercing_or_slashing_damage" },
  },
  "dangerously-unstable": {
    mechanicTags: ["reaction", "death_burst", "large_aoe", "save", "condition"],
    pressureTags: ["burst", "area", "control", "self_destruct"],
    complexityTags: ["reaction_trigger", "large_area", "random_trigger"],
    damageProfile: {
      baseDamage: 8,
      damageType: "Poison",
      expectedTargets: 3,
      roundWeight: [0.25, 0.25, 0.25],
    },
    usageProfile: { frequency: "reaction", trigger: "piercing_or_slashing_damage" },
    conditionProfile: {
      condition: "Prone",
      severity: "Moderate",
      duration: "instant",
      repeatSave: false,
    },
  },
  "toxic-detonation": {
    mechanicTags: ["death_effect", "aoe", "condition", "save"],
    pressureTags: ["death_burst", "area"],
    complexityTags: ["death_trigger"],
    damageProfile: {
      baseDamage: 5,
      damageType: "Poison",
      expectedTargets: 2,
      roundWeight: [0, 0, 0],
    },
    usageProfile: { frequency: "death" },
    conditionProfile: {
      condition: "Poisoned",
      severity: "Minor",
      duration: "until_end_next_turn",
      repeatSave: false,
    },
  },
  "grave-bite": {
    mechanicTags: ["attack", "damage", "healing"],
    pressureTags: ["sustain", "single_target"],
    complexityTags: ["conditional_healing"],
    damageProfile: {
      baseDamage: 4,
      damageType: "Piercing/Necrotic",
      expectedTargets: 1,
      roundWeight: [1, 1, 1],
    },
    usageProfile: { frequency: "at_will" },
  },
  "infected-bite": {
    mechanicTags: ["attack", "damage", "delayed_effect", "exhaustion", "save"],
    pressureTags: ["sustain", "campaign_pressure"],
    complexityTags: ["delayed_tracking", "rest_trigger"],
    damageProfile: {
      baseDamage: 5,
      damageType: "Poison/Necrotic",
      expectedTargets: 1,
      roundWeight: [1, 1, 1],
    },
    conditionProfile: {
      condition: "Exhaustion",
      severity: "Major",
      duration: "after_long_rest",
      repeatSave: false,
    },
  },
  "purulent-bite": {
    mechanicTags: ["attack", "damage", "delayed_effect", "exhaustion", "disease", "save"],
    pressureTags: ["campaign_pressure", "sustain"],
    complexityTags: ["delayed_tracking", "disease_tracking", "rest_trigger"],
    damageProfile: {
      baseDamage: 6,
      damageType: "Poison/Necrotic",
      expectedTargets: 1,
      roundWeight: [1, 1, 1],
    },
    conditionProfile: {
      condition: "Exhaustion/Disease",
      severity: "Severe",
      duration: "weeks_or_until_cured",
      repeatSave: false,
    },
  },
  "horrific-apparition": {
    mechanicTags: ["aoe", "condition", "psychic_damage", "save", "immunity_after_success"],
    pressureTags: ["area", "fear", "control"],
    complexityTags: ["immunity_tracking", "condition_tracking"],
    damageProfile: {
      baseDamage: 2,
      damageType: "Psychic",
      expectedTargets: 3,
      roundWeight: [1, 0, 0],
    },
    conditionProfile: {
      condition: "Frightened",
      severity: "Moderate",
      duration: "until_start_next_turn",
      repeatSave: false,
    },
    usageProfile: { frequency: "encounter_opener" },
  },
  "corpse-tendrils": {
    mechanicTags: ["corpse_requirement", "aoe", "restrained", "repeat_save"],
    pressureTags: ["area", "control", "terrain_anchor"],
    complexityTags: ["corpse_anchor", "repeat_save", "condition_tracking"],
    conditionProfile: {
      condition: "Restrained",
      severity: "Major",
      duration: "1_minute",
      repeatSave: true,
    },
  },
  "flesh-harvest": {
    mechanicTags: ["corpse_requirement", "scaling_buff", "action_cost"],
    pressureTags: ["sustain", "escalation"],
    complexityTags: ["stack_tracking", "corpse_tracking"],
    usageProfile: { frequency: "action", trigger: "consume_corpse" },
  },
  "web-recharge": {
    mechanicTags: ["recharge", "save", "restrained", "destroyable_anchor"],
    pressureTags: ["control", "ranged_lockdown"],
    complexityTags: ["recharge", "object_hp", "condition_tracking"],
    usageProfile: { frequency: "recharge", recharge: "5-6" },
    conditionProfile: {
      condition: "Restrained",
      severity: "Major",
      duration: "until_web_destroyed",
      repeatSave: false,
    },
  },
  "shadow-web": {
    mechanicTags: ["recharge", "save", "restrained", "ongoing_damage", "destroyable_anchor"],
    pressureTags: ["control", "sustain", "ranged_lockdown"],
    complexityTags: ["recharge", "object_hp", "ongoing_tracking", "condition_tracking"],
    damageProfile: {
      baseDamage: 2,
      damageType: "Slashing",
      expectedTargets: 1,
      roundWeight: [1, 0.5, 0.5],
    },
    usageProfile: { frequency: "recharge", recharge: "5-6" },
    conditionProfile: {
      condition: "Restrained",
      severity: "Major",
      duration: "until_web_destroyed",
      repeatSave: false,
    },
  },
  "corrosive-web": {
    mechanicTags: ["web_modifier", "ongoing_damage"],
    pressureTags: ["sustain", "control_synergy"],
    complexityTags: ["trigger_tracking"],
    damageProfile: {
      baseDamage: 2,
      damageType: "Acid",
      expectedTargets: 1,
      roundWeight: [0.4, 0.4, 0.4],
    },
  },
  "egg-carrier": {
    mechanicTags: ["summon", "random_table", "destroyable_anchor"],
    pressureTags: ["action_economy", "escalation"],
    complexityTags: ["round_tracking", "summon_tracking", "object_tracking"],
    usageProfile: { frequency: "start_of_turn_random" },
  },
  "enrage-broodmother": {
    mechanicTags: ["reaction", "rage", "random_trigger", "egg_requirement"],
    pressureTags: ["retaliation", "tempo"],
    complexityTags: ["reaction_trigger", "state_change"],
    usageProfile: { frequency: "reaction", trigger: "egg_destroyed" },
  },
  "egg-hatch-death": {
    mechanicTags: ["death_effect", "summon", "random_table", "egg_requirement"],
    pressureTags: ["death_escalation", "action_economy"],
    complexityTags: ["death_trigger", "summon_tracking"],
    usageProfile: { frequency: "death" },
  },
};
