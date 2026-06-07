// Generated from Spells (1).csv. Keep this file system-specific so future spell datasets can live beside it.
export const SPELLS_5E24_DATASET_ID = "spells.5e24";
export const SPELLS_5E24 = Object.freeze([
  {
    "id": "acid-splash",
    "name": "Acid Splash",
    "source": "PHB'24",
    "page": 239,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Tropical Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "You create an acidic bubble at a point within range, where it explodes in a 5-foot-radius Sphere. Each creature in that Sphere must succeed on a Dexterity saving throw or take 1d6 Acid damage.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
  },
  {
    "id": "aid",
    "name": "Aid",
    "source": "PHB'24",
    "page": 239,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a strip of white cloth",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'24) Cleric, Devotion (PHB'24) Paladin, Peace (TCE) Cleric, Peace (TCE) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "Choose up to three creatures within range. Each target's Hit Point maximum and current Hit Points increase by 5 for the duration.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Each target's Hit Points increase by 5 for each spell slot level above 2."
  },
  {
    "id": "alarm",
    "name": "Alarm",
    "source": "PHB'24",
    "page": 239,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "8 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bell and silver wire",
    "classes": [
      "Artificer",
      "Ranger",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Watchers (TCE) Paladin, Watchers (TCE) Paladin",
    "text": "You set an alarm against intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot Cube. Until the spell ends, an alarm alerts you whenever a creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm. You also choose whether the alarm is audible or mental:\n\nAudible Alarm. The alarm produces the sound of a handbell for 10 seconds within 60 feet of the warded area.\n\nMental Alarm. You are alerted by a mental ping if you are within 1 mile of the warded area. This ping awakens you if you're asleep.",
    "atHigherLevels": ""
  },
  {
    "id": "alter-self",
    "name": "Alter Self",
    "source": "PHB'24",
    "page": 239,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Moon (PHB'14) Druid, Lore (PHB'24) Bard, Draconic (PHB'24) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer",
    "text": "You alter your physical form. Choose one of the following options. Its effects last for the duration, during which you can take a Magic action to replace the option you chose with a different one.\n\nAquatic Adaptation. You sprout gills and grow webs between your fingers. You can breathe underwater and gain a Swim Speed equal to your Speed.\n\nChange Appearance. You alter your appearance. You decide what you look like, including your height, weight, facial features, sound of your voice, hair length, coloration, and other distinguishing characteristics. You can make yourself appear as a member of another species, though none of your statistics change. You can't appear as a creature of a different size, and your basic shape stays the same; if you're bipedal, you can't use this spell to become quadrupedal, for instance. For the duration, you can take a Magic action to change your appearance in this way again.\n\nNatural Weapons. You grow claws (Slashing), fangs (Piercing), horns (Piercing), or hooves (Bludgeoning). When you use your Unarmed Strike to deal damage with that new growth, it deals 1d6 damage of the type in parentheses instead of dealing the normal damage for your Unarmed Strike, and you use your spellcasting ability modifier for the attack and damage rolls rather than using Strength.",
    "atHigherLevels": ""
  },
  {
    "id": "animal-friendship",
    "name": "Animal Friendship",
    "source": "PHB'24",
    "page": 239,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a morsel of food",
    "classes": [
      "Bard",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric",
    "text": "Target a Beast that you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. If you or one of your allies deals damage to the target, the spells ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional Beast for each spell slot level above 1."
  },
  {
    "id": "animal-messenger",
    "name": "Animal Messenger",
    "source": "PHB'24",
    "page": 240,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Enchantment",
    "ritual": true,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a morsel of food",
    "classes": [
      "Bard",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard",
    "text": "A Tiny Beast of your choice that you can see within range must succeed on a Charisma saving throw, or it attempts to deliver a message for you (if the target's Challenge Rating isn't 0, it automatically succeeds). You specify a location you have visited and a recipient who matches a general description, such as \"a person dressed in the uniform of the town guard\" or \"a red-haired dwarf wearing a pointed hat.\" You also communicate a message of up to twenty-five words. The Beast travels for the duration toward the specified location, covering about 25 miles per 24 hours or 50 miles if the Beast can fly.\n\nWhen the Beast arrives, it delivers your message to the creature that you described, mimicking your communication. If the Beast doesn't reach its destination before the spell ends, the message is lost, and the Beast returns to where you cast the spell.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The spell's duration increases by 48 hours for each spell slot level above 2."
  },
  {
    "id": "animal-shapes",
    "name": "Animal Shapes",
    "source": "PHB'24",
    "page": 240,
    "level": 8,
    "levelLabel": "8th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "Choose any number of willing creatures that you can see within range. Each target shape-shifts into a Large or smaller Beast of your choice that has a Challenge Rating of 4 or lower. You can choose a different form for each target. On later turns, you can take a Magic action to transform the targets again.\n\nA target's game statistics are replaced by the chosen Beast's statistics, but the target retains its creature type; Hit Points; Hit Point Dice; alignment; ability to communicate; and Intelligence, Wisdom, and Charisma scores. The target's actions are limited by the Beast form's anatomy, and it can't cast spells. The target's equipment melds into the new form, and the target can't use any of that equipment while in that form.\n\nThe target gains a number of Temporary Hit Points equal to the Hit Points of the first form into which it shape-shifts. These Temporary Hit Points vanish if any remain when the spell ends. The transformation lasts for the duration or until the target ends it as a Bonus Action.",
    "atHigherLevels": ""
  },
  {
    "id": "animate-dead",
    "name": "Animate Dead",
    "source": "PHB'24",
    "page": 240,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Instantaneous",
    "range": "10 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of blood, a piece of flesh, and a pinch of bone dust",
    "classes": [
      "Cleric",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Spores (TCE) Druid, Spores (TCE) Druid, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin",
    "text": "Choose a pile of bones or a corpse of a Medium or Small Humanoid within range. The target becomes an Undead creature: a Skeleton if you chose bones or a Zombie if you chose a corpse.\n\nOn each of your turns, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 60 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a chamber or corridor. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow it until its task is complete.\n\nThe creature is under your control for 24 hours, after which it stops obeying any command you've given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature again before the current 24-hour period ends. This use of the spell reasserts your control over up to four creatures you have animated with this spell rather than animating a new creature.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You animate or reassert control over two additional Undead creatures for each spell slot level above 3. Each of the creatures must come from a different corpse or pile of bones."
  },
  {
    "id": "animate-objects",
    "name": "Animate Objects",
    "source": "PHB'24",
    "page": 240,
    "level": 5,
    "levelLabel": "5th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Forge (XGE) Cleric, Forge (XGE) Cleric",
    "text": "Objects animate at your command. Choose a number of nonmagical objects within range that aren't being worn or carried, aren't fixed to a surface, and aren't Gargantuan. The maximum number of objects is equal to your spellcasting ability modifier; for this number, a Medium or smaller target counts as one object, a Large target counts as two, and a Huge target counts as three.\n\nEach target animates, sprouts legs, and becomes a Construct that uses the Animated Object stat block; this creature is under your control until the spell ends or until it is reduced to 0 Hit Points. Each creature you make with this spell is an ally to you and your allies. In combat, it shares your Initiative count and takes its turn immediately after yours.\n\nUntil the spell ends, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 500 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to each one). If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. When the creature drops to 0 Hit Points, it reverts to its object form, and any remaining damage carries over to that form.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The creature's Slam damage increases by 1d4 (Medium or smaller), 1d6 (Large), or 1d12 (Huge) for each spell slot level above 5."
  },
  {
    "id": "antilife-shell",
    "name": "Antilife Shell",
    "source": "PHB'24",
    "page": 241,
    "level": 5,
    "levelLabel": "5th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Death (DMG'14) Cleric, Death (DMG'14) Cleric, Grave (XGE) Cleric, Grave (XGE) Cleric, Undead (VRGR) Warlock, Undead (VRGR) Warlock",
    "text": "An aura extends from you in a 10-foot Emanation for the duration. The aura prevents creatures other than Constructs and Undead from passing or reaching through it. An affected creature can cast spells or make attacks with Ranged or Reach weapons through the barrier.\n\nIf you move so that an affected creature is forced to pass through the barrier, the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "antimagic-field",
    "name": "Antimagic Field",
    "source": "PHB'24",
    "page": 241,
    "level": 8,
    "levelLabel": "8th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "iron filings",
    "classes": [
      "Cleric",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "An aura of antimagic surrounds you in a 10-foot Emanation. No one can cast spells, take Magic actions, or create other magical effects inside the aura, and those things can't target or otherwise affect anything inside it. Magical properties of magic items don't work inside the aura or on anything inside it.\n\nAreas of effect created by spells or other magic can't extend into the aura, and no one can teleport into or out of it or use planar travel there. Portals close temporarily while in the aura.\n\nOngoing spells, except those cast by an Artifact or a deity, are suppressed in the area. While an effect is suppressed, it doesn't function, but the time it spends suppressed counts against its duration.\n\nDispel Magic has no effect on the aura, and the auras created by different Antimagic Field spells don't nullify each other.",
    "atHigherLevels": ""
  },
  {
    "id": "antipathy-sympathy",
    "name": "Antipathy/Sympathy",
    "source": "PHB'24",
    "page": 242,
    "level": 8,
    "levelLabel": "8th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "10 days",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a mix of vinegar and honey",
    "classes": [
      "Bard",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "As you cast the spell, choose whether it creates antipathy or sympathy, and target one creature or object that is Huge or smaller. Then specify a kind of creature, such as red dragons, goblins, or vampires. A creature of the chosen kind makes a Wisdom saving throw when it comes within 120 feet of the target. Your choice of antipathy or sympathy determines what happens to a creature when it fails that save:\n\nAntipathy. The creature has the Frightened condition. The Frightened creature must use its movement on its turns to get as far away as possible from the target, moving by the safest route.\n\nSympathy. The creature has the Charmed condition. The Charmed creature must use its movement on its turns to get as close as possible to the target, moving by the safest route. If the creature is within 5 feet of the target, the creature can't willingly move away. If the target damages the Charmed creature, that creature can make a Wisdom saving throw to end the effect, as described below.\n\nEnding the Effect. If the Frightened or Charmed creature ends its turn more than 120 feet away from the target, the creature makes a Wisdom saving throw. On a successful save, the creature is no longer affected by the target. A creature that successfully saves against this effect is immune to it for 1 minute, after which it can be affected again.",
    "atHigherLevels": ""
  },
  {
    "id": "arcane-eye",
    "name": "Arcane Eye",
    "source": "PHB'24",
    "page": 242,
    "level": 4,
    "levelLabel": "4th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of bat fur",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Diviner (PHB'24) Wizard, Draconic (PHB'24) Sorcerer, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Knowledge (PHB'14) Cleric, Knowledge (FRHoF) Cleric, Light (PHB'24) Cleric, Swarmkeeper (TCE) Ranger, Swarmkeeper (TCE) Ranger",
    "text": "You create an Invisible, invulnerable eye within range that hovers for the duration. You mentally receive visual information from the eye, which can see in every direction. It also has Darkvision with a range of 30 feet.\n\nAs a Bonus Action, you can move the eye up to 30 feet in any direction. A solid barrier blocks the eye's movement, but the eye can pass through an opening as small as 1 inch in diameter.",
    "atHigherLevels": ""
  },
  {
    "id": "arcane-gate",
    "name": "Arcane Gate",
    "source": "PHB'24",
    "page": 242,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "500 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You create linked teleportation portals. Choose two Large, unoccupied spaces on the ground that you can see, one space within range and the other one within 10 feet of you. A circular portal opens in each of those spaces and remains for the duration.\n\nThe portals are two-dimensional glowing rings filled with mist that blocks sight. They hover inches from the ground and are perpendicular to it.\n\nA portal is open on only one side (you choose which). Anything entering the open side of a portal exits from the open side of the other portal as if the two were adjacent to each other. As a Bonus Action, you can change the facing of the open sides.",
    "atHigherLevels": ""
  },
  {
    "id": "arcane-lock",
    "name": "Arcane Lock",
    "source": "PHB'24",
    "page": 242,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Until dispelled",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "gold dust worth 25+ GP, which the spell consumes",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You touch a closed door, window, gate, container, or hatch and magically lock it for the duration. This lock can't be unlocked by any nonmagical means. You and any creatures you designate when you cast the spell can open and close the object despite the lock. You can also set a password that, when spoken within 5 feet of the object, unlocks it for 1 minute.",
    "atHigherLevels": ""
  },
  {
    "id": "arcane-vigor",
    "name": "Arcane Vigor",
    "source": "PHB'24",
    "page": 242,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You tap into your life force to heal yourself. Roll one or two of your unexpended Hit Point Dice, and regain a number of Hit Points equal to the roll's total plus your spellcasting ability modifier. Those dice are then expended.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The number of unexpended Hit Dice you can roll increases by one for each spell slot level above 2."
  },
  {
    "id": "armor-of-agathys",
    "name": "Armor of Agathys",
    "source": "PHB'24",
    "page": 243,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 hour",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a shard of blue glass",
    "classes": [
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Conquest (XGE) Paladin, Conquest (XGE) Paladin",
    "text": "Protective magical frost surrounds you. You gain 5 Temporary Hit Points. If a creature hits you with a melee attack roll before the spell ends, the creature takes 5 Cold damage. The spell ends early if you have no Temporary Hit Points.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Temporary Hit Points and the Cold damage both increase by 5 for each spell slot level above 1."
  },
  {
    "id": "arms-of-hadar",
    "name": "Arms of Hadar",
    "source": "PHB'24",
    "page": 243,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer",
    "text": "Invoking Hadar, you cause tendrils to erupt from yourself. Each creature in a 10-foot Emanation originating from you makes a Strength saving throw. On a failed save, a target takes 2d6 Necrotic damage and can't take Reactions until the start of its next turn. On a successful save, a target takes half as much damage only.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "astral-projection",
    "name": "Astral Projection",
    "source": "PHB'24",
    "page": 243,
    "level": 9,
    "levelLabel": "9th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "Until dispelled",
    "range": "10 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "for each of the spell's targets, one jacinth worth 1,000+ GP and one silver bar worth 100+ GP, all of which the spell consumes",
    "classes": [
      "Cleric",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell ends instantly if you are already on that plane). Each target's body is left behind in a state of suspended animation; it has the Unconscious condition, doesn't need food or air, and doesn't age.\n\nA target's astral form resembles its body in almost every way, replicating its game statistics and possessions. The principal difference is the addition of a silvery cord that trails from between the shoulder blades of the astral form. The cord fades from view after 1 foot. If the cord is cut—which happens only when an effect states that it does so—the target's body and astral form both die.\n\nA target's astral form can travel through the Astral Plane. The moment an astral form leaves that plane, the target's body and possessions travel along the silver cord, causing the target to re-enter its body on the new plane.\n\nAny damage or other effects that apply to an astral form have no effect on the target's body and vice versa. If a target's body or astral form drops to 0 Hit Points, the spell ends for that target. The spell ends for all the targets if you take a Magic action to dismiss it.\n\nWhen the spell ends for a target who isn't dead, the target reappears in its body and exits the state of suspended animation.",
    "atHigherLevels": ""
  },
  {
    "id": "augury",
    "name": "Augury",
    "source": "PHB'24",
    "page": 244,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "specially marked sticks, bones, cards, or other divinatory tokens worth 25+ GP",
    "classes": [
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Knowledge (PHB'14) Cleric, Ancestral Guardian (XGE) Barbarian, Ancestral Guardian (XGE) Barbarian",
    "text": "You receive an omen from an otherworldly entity about the results of a course of action that you plan to take within the next 30 minutes. The DM chooses the omen from the Omens table.\n\nOmensOmenFor Results That Will Be...WealGoodWoeBadWeal and woeGood and badIndifferenceNeither good nor badThe spell doesn't account for circumstances, such as other spells, that might change the results.\n\nIf you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer.",
    "atHigherLevels": ""
  },
  {
    "id": "aura-of-life",
    "name": "Aura of Life",
    "source": "PHB'24",
    "page": 244,
    "level": 4,
    "levelLabel": "4th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Wildfire (TCE) Druid, Wildfire (TCE) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'24) Cleric, Undying (SCAG) Warlock, Undying (SCAG) Warlock, Twilight (TCE) Cleric, Twilight (TCE) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have Resistance to Necrotic damage, and your Hit Point maximums can't be reduced. If an ally with 0 Hit Points starts its turn in the aura, that ally regains 1 Hit Point.",
    "atHigherLevels": ""
  },
  {
    "id": "aura-of-purity",
    "name": "Aura of Purity",
    "source": "PHB'24",
    "page": 244,
    "level": 4,
    "levelLabel": "4th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Watchers (TCE) Paladin, Watchers (TCE) Paladin, Peace (TCE) Cleric, Peace (TCE) Cleric",
    "text": "An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have Resistance to Poison damage and Advantage on saving throws to avoid or end effects that include the Blinded, Charmed, Deafened, Frightened, Paralyzed, Poisoned, or Stunned condition.",
    "atHigherLevels": ""
  },
  {
    "id": "aura-of-vitality",
    "name": "Aura of Vitality",
    "source": "PHB'24",
    "page": 244,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Druid",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Crown (SCAG) Paladin, Crown (SCAG) Paladin, Spellfire (FRHoF) Sorcerer, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "An aura radiates from you in a 30-foot Emanation for the duration. When you create the aura and at the start of each of your turns while it persists, you can restore 2d6 Hit Points to one creature in it.",
    "atHigherLevels": ""
  },
  {
    "id": "awaken",
    "name": "Awaken",
    "source": "PHB'24",
    "page": 244,
    "level": 5,
    "levelLabel": "5th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "8 Hr.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "an agate worth 1,000+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You spend the casting time tracing magical pathways within a precious gemstone, and then touch the target. The target must be either a Beast or Plant creature with an Intelligence of 3 or less or a natural plant that isn't a creature. The target gains an Intelligence of 10 and the ability to speak one language you know. If the target is a natural plant, it becomes a Plant creature and gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human's. The DM chooses statistics appropriate for the awakened Plant, such as the statistics for the Awakened Shrub or Awakened Tree in the Monster Manual.\n\nThe awakened target has the Charmed condition for 30 days or until you or your allies deal damage to it. When that condition ends, the awakened creature chooses its attitude toward you.",
    "atHigherLevels": ""
  },
  {
    "id": "bane",
    "name": "Bane",
    "source": "PHB'24",
    "page": 245,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of blood",
    "classes": [
      "Bard",
      "Cleric",
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Grave (XGE) Cleric, Grave (XGE) Cleric, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Undead (VRGR) Warlock, Undead (VRGR) Warlock, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "Up to three creatures of your choice that you can see within range must each make a Charisma saving throw. Whenever a target that fails this save makes an attack roll or a saving throw before the spell ends, the target must subtract 1d4 from the attack roll or save.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
  },
  {
    "id": "banishing-smite",
    "name": "Banishing Smite",
    "source": "PHB'24",
    "page": 245,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Noble Genies (FRHoF) Paladin, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "The target hit by the attack roll takes an extra 5d10 Force damage from the attack. If the attack reduces the target to 50 Hit Points or fewer, the target must succeed on a Charisma saving throw or be transported to a harmless demiplane for the duration. While there, the target has the Incapacitated condition. When the spell ends, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.",
    "atHigherLevels": ""
  },
  {
    "id": "banishment",
    "name": "Banishment",
    "source": "PHB'24",
    "page": 245,
    "level": 4,
    "levelLabel": "4th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pentacle",
    "classes": [
      "Cleric",
      "Paladin",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Cartographer (EFA) Artificer, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Horizon Walker (XGE) Ranger, Horizon Walker (XGE) Ranger, Knowledge (FRHoF) Cleric, Monster Slayer (XGE) Ranger, Monster Slayer (XGE) Ranger, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Crown (SCAG) Paladin, Crown (SCAG) Paladin, Watchers (TCE) Paladin, Watchers (TCE) Paladin",
    "text": "One creature that you can see within range must succeed on a Charisma saving throw or be transported to a harmless demiplane for the duration. While there, the target has the Incapacitated condition. When the spell ends, the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.\n\nIf the target is an Aberration, a Celestial, an Elemental, a Fey, or a Fiend, the target doesn't return if the spell lasts for 1 minute. The target is instead transported to a random location on a plane (DM's choice) associated with its creature type.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4."
  },
  {
    "id": "barkskin",
    "name": "Barkskin",
    "source": "PHB'24",
    "page": 245,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a handful of oak bark",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Forest) (PHB'14) Druid, Lore (PHB'24) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric",
    "text": "You touch a willing creature. Until the spell ends, the target's skin assumes a bark-like appearance, and the target has an Armor Class of 17 if its AC is lower than that.",
    "atHigherLevels": ""
  },
  {
    "id": "beacon-of-hope",
    "name": "Beacon of Hope",
    "source": "PHB'24",
    "page": 245,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'14) Cleric, Devotion (PHB'24) Paladin, Devotion (PHB'14) Paladin, Peace (TCE) Cleric, Peace (TCE) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "Choose any number of creatures within range. For the duration, each target has Advantage on Wisdom saving throws and Death Saving Throws and regains the maximum number of Hit Points possible from any healing.",
    "atHigherLevels": ""
  },
  {
    "id": "beast-sense",
    "name": "Beast Sense",
    "source": "PHB'24",
    "page": 245,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Totem Warrior (PHB'14) Barbarian, Wild Heart (PHB'24) Barbarian",
    "text": "You touch a willing Beast. For the duration, you can perceive through the Beast's senses as well as your own. When perceiving through the Beast's senses, you benefit from any special senses it has.",
    "atHigherLevels": ""
  },
  {
    "id": "befuddlement",
    "name": "Befuddlement",
    "source": "PHB'24",
    "page": 245,
    "level": 8,
    "levelLabel": "8th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a key ring with no keys",
    "classes": [
      "Bard",
      "Druid",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You blast the mind of a creature that you can see within range. The target makes an Intelligence saving throw.\n\nOn a failed save, the target takes 10d12 Psychic damage and can't cast spells or take the Magic action. At the end of every 30 days, the target repeats the save, ending the effect on a success. The effect can also be ended by the Greater Restoration, Heal, or Wish spell.\n\nOn a successful save, the target takes half as much damage only.",
    "atHigherLevels": ""
  },
  {
    "id": "bestow-curse",
    "name": "Bestow Curse",
    "source": "PHB'24",
    "page": 246,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Conquest (XGE) Paladin, Conquest (XGE) Paladin, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "You touch a creature, which must succeed on a Wisdom saving throw or become cursed for the duration. Until the curse ends, the target suffers one of the following effects of your choice:\n\nChoose one ability. The target has Disadvantage on ability checks and saving throws made with that ability.The target has Disadvantage on attack rolls against you.In combat, the target must succeed on a Wisdom saving throw at the start of each of its turns or be forced to take the Dodge action on that turn.If you deal damage to the target with an attack roll or a spell, the target takes an extra 1d8 Necrotic damage.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. If you cast this spell using a level 4 spell slot, you can maintain Concentration on it for up to 10 minutes. If you use a level 5+ spell slot, the spell doesn't require Concentration, and the duration becomes 8 hours (level 5-6 slot) or 24 hours (level 7-8 slot). If you use a level 9 spell slot, the spell lasts until dispelled."
  },
  {
    "id": "bigbys-hand",
    "name": "Bigby's Hand",
    "source": "PHB'24",
    "page": 246,
    "level": 5,
    "levelLabel": "5th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "an eggshell and a glove",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Evoker (PHB'24) Wizard, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock",
    "text": "You create a Large hand of shimmering magical energy in an unoccupied space that you can see within range. The hand lasts for the duration, and it moves at your command, mimicking the movements of your own hand.\n\nThe hand is an object that has AC 20 and Hit Points equal to your Hit Point maximum. If it drops to 0 Hit Points, the spell ends. The hand doesn't occupy its space.\n\nWhen you cast the spell and as a Bonus Action on your later turns, you can move the hand up to 60 feet and then cause one of the following effects:\n\nClenched Fist. The hand strikes a target within 5 feet of it. Make a melee spell attack. On a hit, the target takes 5d8 Force damage.\n\nForceful Hand. The hand attempts to push a Huge or smaller creature within 5 feet of it. The target must succeed on a Strength saving throw, or the hand pushes the target up to 5 feet plus a number of feet equal to five times your spellcasting ability modifier. The hand moves with the target, remaining within 5 feet of it.\n\nGrasping Hand. The hand attempts to grapple a Huge or smaller creature within 5 feet of it. The target must succeed on a Dexterity saving throw, or the target has the Grappled condition, with an escape DC equal to your spell save DC. While the hand grapples the target, you can take a Bonus Action to cause the hand to crush it, dealing Bludgeoning damage to the target equal to 4d6 plus your spellcasting ability modifier.\n\nInterposing Hand. The hand grants you Half Cover against attacks and other effects that originate from its space or that pass through it. In addition, its space counts as Difficult Terrain for your enemies.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage of the Clenched Fist increases by 2d8 and the damage of the Grasping Hand increases by 2d6 for each spell slot level above 5."
  },
  {
    "id": "blade-barrier",
    "name": "Blade Barrier",
    "source": "PHB'24",
    "page": 247,
    "level": 6,
    "levelLabel": "6th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "90 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You create a wall of whirling blades made of magical energy. The wall appears within range and lasts for the duration. You make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides Three-Quarters Cover, and its space is Difficult Terrain.\n\nAny creature in the wall's space makes a Dexterity saving throw, taking 6d10 Force damage on a failed save or half as much damage on a successful one. A creature also makes that save if it enters the wall's space or ends it turn there. A creature makes that save only once per turn.",
    "atHigherLevels": ""
  },
  {
    "id": "blade-ward",
    "name": "Blade Ward",
    "source": "PHB'24",
    "page": 247,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Scion of the Three (FRHoF) Rogue",
    "text": "Whenever a creature makes an attack roll against you before the spell ends, the attacker subtracts 1d4 from the attack roll.",
    "atHigherLevels": ""
  },
  {
    "id": "bless",
    "name": "Bless",
    "source": "PHB'24",
    "page": 247,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a Holy Symbol worth 5+ GP",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'24) Cleric, Life (PHB'14) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "You bless up to three creatures within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target adds 1d4 to the attack roll or save.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
  },
  {
    "id": "blight",
    "name": "Blight",
    "source": "PHB'24",
    "page": 247,
    "level": 4,
    "levelLabel": "4th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Spores (TCE) Druid, Spores (TCE) Druid, Land (Desert) (PHB'14) Druid, Land (Arid Land) (PHB'24) Druid, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Grave (XGE) Cleric, Grave (XGE) Cleric, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin",
    "text": "A creature that you can see within range makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save or half as much damage on a successful one. A Plant creature automatically fails the save.\n\nAlternatively, target a nonmagical plant that isn't a creature, such as a tree or shrub. It doesn't make a save; it simply withers and dies.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
  },
  {
    "id": "blinding-smite",
    "name": "Blinding Smite",
    "source": "PHB'24",
    "page": 247,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "The target hit by the strike takes an extra 3d8 Radiant damage from the attack, and the target has the Blinded condition until the spell ends. At the end of each of its turns, the Blinded target makes a Constitution saving throw, ending the spell on itself on a success.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The extra damage increases by 1d8 for each spell slot level above 3."
  },
  {
    "id": "blindness-deafness",
    "name": "Blindness/Deafness",
    "source": "PHB'24",
    "page": 248,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "120 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Spores (TCE) Druid, Spores (TCE) Druid, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Fiend (PHB'14) Warlock, Undead (VRGR) Warlock, Undead (VRGR) Warlock, Undying (SCAG) Warlock, Undying (SCAG) Warlock",
    "text": "One creature that you can see within range must succeed on a Constitution saving throw, or it has the Blinded or Deafened condition (your choice) for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2."
  },
  {
    "id": "blink",
    "name": "Blink",
    "source": "PHB'24",
    "page": 248,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Archfey (PHB'24) Warlock, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Archfey (PHB'14) Warlock, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock, Trickery (PHB'14) Cleric",
    "text": "Roll 1d6 at the end of each of your turns for the duration. On a roll of 4-6, you vanish from your current plane of existence and appear in the Ethereal Plane (the spell ends instantly if you are already on that plane). While on the Ethereal Plane, you can perceive the plane you left, which is cast in shades of gray, but you can't see anything there more than 60 feet away. You can affect and be affected only by other creatures on the Ethereal Plane, and creatures on the other plane can't perceive you unless they have a special ability that lets them perceive things on the Ethereal Plane.\n\nYou return to the other plane at the start of your next turn and when the spell ends if you are on the Ethereal Plane. You return to an unoccupied space of your choice that you can see within 10 feet of the space you left. If no unoccupied space is available within that range, you appear in the nearest unoccupied space.",
    "atHigherLevels": ""
  },
  {
    "id": "blur",
    "name": "Blur",
    "source": "PHB'24",
    "page": 248,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Arid Land) (PHB'24) Druid, Land (Desert) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Genie (Marid) (TCE) Warlock, Genie (Marid) (TCE) Warlock, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "Your body becomes blurred. For the duration, any creature has Disadvantage on attack rolls against you. An attacker is immune to this effect if it perceives you with Blindsight or Truesight.",
    "atHigherLevels": ""
  },
  {
    "id": "burning-hands",
    "name": "Burning Hands",
    "source": "PHB'24",
    "page": 248,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock, Sun Soul (XGE) Monk, Sun Soul (XGE) Monk",
    "text": "A thin sheet of flames shoots forth from you. Each creature in a 15-foot Cone makes a Dexterity saving throw, taking 3d6 Fire damage on a failed save or half as much damage on a successful one.\n\nFlammable objects in the Cone that aren't being worn or carried start burning.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "call-lightning",
    "name": "Call Lightning",
    "source": "PHB'24",
    "page": 248,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Cartographer (EFA) Artificer, Land (Forest) (PHB'14) Druid, Lore (PHB'24) Bard, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric",
    "text": "A storm cloud appears at a point within range that you can see above yourself. It takes the shape of a Cylinder that is 10 feet tall with a 60-foot radius.\n\nWhen you cast the spell, choose a point you can see under the cloud. A lightning bolt shoots from the cloud to that point. Each creature within 5 feet of that point makes a Dexterity saving throw, taking 3d10 Lightning damage on a failed save or half as much damage on a successful one.\n\nUntil the spell ends, you can take a Magic action to call down lightning in that way again, targeting the same point or a different one.\n\nIf you're outdoors in a storm when you cast this spell, the spell gives you control over that storm instead of creating a new one. Under such conditions, the spell's damage increases by 1d10.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 3."
  },
  {
    "id": "calm-emotions",
    "name": "Calm Emotions",
    "source": "PHB'24",
    "page": 249,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Archfey (PHB'24) Warlock, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Archfey (PHB'14) Warlock",
    "text": "Each Humanoid in a 20-foot-radius Sphere centered on a point you choose within range must succeed on a Charisma saving throw or be affected by one of the following effects (choose for each creature):\n\nThe creature has Immunity to the Charmed and Frightened conditions until the spell ends. If the creature was already Charmed or Frightened, those conditions are suppressed for the duration.The creature becomes Indifferent about creatures of your choice that it's Hostile toward. This indifference ends if the target takes damage or witnesses its allies taking damage. When the spell ends, the creature's attitude returns to normal.",
    "atHigherLevels": ""
  },
  {
    "id": "chain-lightning",
    "name": "Chain Lightning",
    "source": "PHB'24",
    "page": 249,
    "level": 6,
    "levelLabel": "6th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "three silver pins",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "You launch a lightning bolt toward a target you can see within range. Three bolts then leap from that target to as many as three other targets of your choice, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts.\n\nEach target makes a Dexterity saving throw, taking 10d8 Lightning damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. One additional bolt leaps from the first target to another target for each spell slot level above 6."
  },
  {
    "id": "charm-monster",
    "name": "Charm Monster",
    "source": "PHB'24",
    "page": 249,
    "level": 4,
    "levelLabel": "4th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Draconic (PHB'24) Sorcerer, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter",
    "text": "One creature you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4."
  },
  {
    "id": "charm-person",
    "name": "Charm Person",
    "source": "PHB'24",
    "page": 249,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Glamour (PHB'24) Bard, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fey Wanderer (PHB'24) Ranger, Fey Wanderer (TCE) Ranger, Trickery (PHB'24) Cleric, Trickery (PHB'14) Cleric",
    "text": "One Humanoid you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
  },
  {
    "id": "chill-touch",
    "name": "Chill Touch",
    "source": "PHB'24",
    "page": 249,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Spores (TCE) Druid, Spores (TCE) Druid, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Scion of the Three (FRHoF) Rogue",
    "text": "Channeling the chill of the grave, make a melee spell attack against a target within reach. On a hit, the target takes 1d10 Necrotic damage, and it can't regain Hit Points until the end of your next turn.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
  },
  {
    "id": "chromatic-orb",
    "name": "Chromatic Orb",
    "source": "PHB'24",
    "page": 249,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a diamond worth 50+ GP",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Draconic (PHB'24) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Noble Genies (FRHoF) Paladin",
    "text": "You hurl an orb of energy at a target within range. Choose Acid, Cold, Fire, Lightning, Poison, or Thunder for the type of orb you create, and then make a ranged spell attack against the target. On a hit, the target takes 3d8 damage of the chosen type.\n\nIf you roll the same number on two or more of the d8s, the orb leaps to a different target of your choice within 30 feet of the target. Make an attack roll against the new target, and make a new damage roll. The orb can't leap again unless you cast the spell with a level 2+ spell slot.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1. The orb can leap a maximum number of times equal to the level of the slot expended, and a creature can be targeted only once by each casting of this spell."
  },
  {
    "id": "circle-of-death",
    "name": "Circle of Death",
    "source": "PHB'24",
    "page": 250,
    "level": 6,
    "levelLabel": "6th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "the powder of a crushed black pearl worth 500+ GP",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "Negative energy ripples out in a 60-foot-radius Sphere from a point you choose within range. Each creature in that area makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 2d8 for each spell slot level above 6."
  },
  {
    "id": "circle-of-power",
    "name": "Circle of Power",
    "source": "PHB'24",
    "page": 250,
    "level": 5,
    "levelLabel": "5th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Paladin",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Crown (SCAG) Paladin, Crown (SCAG) Paladin, Twilight (TCE) Cleric, Twilight (TCE) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have Advantage on saving throws against spells and other magical effects. When an affected creature makes a saving throw against a spell or magical effect that allows a save to take only half damage, it takes no damage if it succeeds on the save.",
    "atHigherLevels": ""
  },
  {
    "id": "clairvoyance",
    "name": "Clairvoyance",
    "source": "PHB'24",
    "page": 250,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Concentration, up to 10 minutes",
    "range": "1 mile",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a focus worth 100+ GP, either a jeweled horn for hearing or a glass eye for seeing",
    "classes": [
      "Bard",
      "Cleric",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Cartographer (EFA) Artificer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Great Old One (PHB'24) Warlock, Ancestral Guardian (XGE) Barbarian, Ancestral Guardian (XGE) Barbarian, Great Old One (PHB'14) Warlock",
    "text": "You create an Invisible sensor within range in a location familiar to you (a place you have visited or seen before) or in an obvious location that is unfamiliar to you (such as behind a door, around a corner, or in a grove of trees). The intangible, invulnerable sensor remains in place for the duration.\n\nWhen you cast the spell, choose seeing or hearing. You can use the chosen sense through the sensor as if you were in its space. As a Bonus Action, you can switch between seeing and hearing.\n\nA creature that sees the sensor (such as a creature benefiting from See Invisibility or Truesight) sees a luminous orb about the size of your fist.",
    "atHigherLevels": ""
  },
  {
    "id": "clone",
    "name": "Clone",
    "source": "PHB'24",
    "page": 251,
    "level": 8,
    "levelLabel": "8th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a diamond worth 1,000+ GP, which the spell consumes, and a sealable vessel worth 2,000+ GP that is large enough to hold the creature being cloned",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You touch a creature or at least 1 cubic inch of its flesh. An inert duplicate of that creature forms inside the vessel used in the spell's casting and finishes growing after 120 days; you choose whether the finished clone is the same age as the creature or younger. The clone remains inert and endures indefinitely while its vessel remains undisturbed.\n\nIf the original creature dies after the clone finishes forming, the creature's soul transfers to the clone if the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original's equipment. The creature's original remains, if any, become inert and can't be revived, since the creature's soul is elsewhere.",
    "atHigherLevels": ""
  },
  {
    "id": "cloud-of-daggers",
    "name": "Cloud of Daggers",
    "source": "PHB'24",
    "page": 251,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a sliver of glass",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You conjure spinning daggers in a 5-foot Cube centered on a point within range. Each creature in that area takes 4d4 Slashing damage. A creature also takes this damage if it enters the Cube or ends its turn there or if the Cube moves into its space. A creature takes this damage only once per turn.\n\nOn your later turns, you can take a Magic action to teleport the Cube up to 30 feet.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 2d4 for each spell slot level above 2."
  },
  {
    "id": "cloudkill",
    "name": "Cloudkill",
    "source": "PHB'24",
    "page": 251,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Spores (TCE) Druid, Spores (TCE) Druid, Land (Underdark) (PHB'14) Druid, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Conquest (XGE) Paladin, Conquest (XGE) Paladin, Undead (VRGR) Warlock, Undead (VRGR) Warlock",
    "text": "You create a 20-foot-radius Sphere of yellow-green fog centered on a point within range. The fog lasts for the duration or until strong wind (such as the one created by Gust of Wind) disperses it, ending the spell. Its area is Heavily Obscured.\n\nEach creature in the Sphere makes a Constitution saving throw, taking 5d8 Poison damage on a failed save or half as much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when it enters the Sphere or ends its turn there. A creature makes this save only once per turn.\n\nThe Sphere moves 10 feet away from you at the start of each of your turns.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 5."
  },
  {
    "id": "color-spray",
    "name": "Color Spray",
    "source": "PHB'24",
    "page": 251,
    "level": 1,
    "levelLabel": "1st",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of colorful sand",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer",
    "text": "You launch a dazzling array of flashing, colorful light. Each creature in a 15-foot Cone originating from you must succeed on a Constitution saving throw or have the Blinded condition until the end of your next turn.",
    "atHigherLevels": ""
  },
  {
    "id": "command",
    "name": "Command",
    "source": "PHB'24",
    "page": 251,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Glamour (XGE) Bard, Glamour (PHB'24) Bard, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Draconic (PHB'24) Sorcerer, Fiend (PHB'24) Warlock, Knowledge (PHB'14) Cleric, Knowledge (FRHoF) Cleric, Conquest (XGE) Paladin, Conquest (XGE) Paladin, Crown (SCAG) Paladin, Crown (SCAG) Paladin, Order (TCE) Cleric, Order (TCE) Cleric, Fiend (PHB'14) Warlock",
    "text": "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. Choose the command from these options:\n\nApproach. The target moves toward you by the shortest and most direct route, ending its turn if it moves within 5 feet of you.\n\nDrop. The target drops whatever it is holding and then ends its turn.\n\nFlee. The target spends its turn moving away from you by the fastest available means.\n\nGrovel. The target has the Prone condition and then ends its turn.\n\nHalt. On its turn, the target doesn't move and takes no action or Bonus Action.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can affect one additional creature for each spell slot level above 1."
  },
  {
    "id": "commune",
    "name": "Commune",
    "source": "PHB'24",
    "page": 251,
    "level": 5,
    "levelLabel": "5th",
    "school": "Divination",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "incense",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Devotion (PHB'14) Paladin, Devotion (PHB'24) Paladin, Glory (TCE) Paladin, Order (TCE) Cleric, Order (TCE) Cleric",
    "text": "You contact a deity or a divine proxy and ask up to three questions that can be answered with yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question.\n\nDivine beings aren't necessarily omniscient, so you might receive \"unclear\" as an answer if a question pertains to information that lies beyond the deity's knowledge. In a case where a one-word answer could be misleading or contrary to the deity's interests, the DM might offer a short phrase as an answer instead.\n\nIf you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer.",
    "atHigherLevels": ""
  },
  {
    "id": "commune-with-nature",
    "name": "Commune with Nature",
    "source": "PHB'24",
    "page": 252,
    "level": 5,
    "levelLabel": "5th",
    "school": "Divination",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Arctic) (PHB'14) Druid, Land (Forest) (PHB'14) Druid, Ancients (PHB'14) Paladin, Ancients (PHB'24) Paladin, Totem Warrior (PHB'14) Barbarian, Wild Heart (PHB'24) Barbarian",
    "text": "You commune with nature spirits and gain knowledge of the surrounding area. In the outdoors, the spell gives you knowledge of the area within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. The spell doesn't function where nature has been replaced by construction, such as in castles and settlements.\n\nChoose three of the following facts; you learn those facts as they pertain to the spell's area:\n\nLocations of settlementsLocations of portals to other planes of existenceLocation of one Challenge Rating 10+ creature (DM's choice) that is a Celestial, an Elemental, a Fey, a Fiend, or an UndeadThe most prevalent kind of plant, mineral, or Beast (you choose which to learn)Locations of bodies of waterFor example, you could determine the location of a powerful monster in the area, the locations of bodies of water, and the locations of any towns.",
    "atHigherLevels": ""
  },
  {
    "id": "compelled-duel",
    "name": "Compelled Duel",
    "source": "PHB'24",
    "page": 252,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Crown (SCAG) Paladin, Crown (SCAG) Paladin",
    "text": "You try to compel a creature into a duel. One creature that you can see within range makes a Wisdom saving throw. On a failed save, the target has Disadvantage on attack rolls against creatures other than you, and it can't willingly move to a space that is more than 30 feet away from you.\n\nThe spell ends if you make an attack roll against a creature other than the target, if you cast a spell on an enemy other than the target, if an ally of yours damages the target, or if you end your turn more than 30 feet away from the target.",
    "atHigherLevels": ""
  },
  {
    "id": "comprehend-languages",
    "name": "Comprehend Languages",
    "source": "PHB'24",
    "page": 252,
    "level": 1,
    "levelLabel": "1st",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of soot and salt",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Banneret (FRHoF) Fighter, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric",
    "text": "For the duration, you understand the literal meaning of any language that you hear or see signed. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn't decode symbols or secret messages.",
    "atHigherLevels": ""
  },
  {
    "id": "compulsion",
    "name": "Compulsion",
    "source": "PHB'24",
    "page": 252,
    "level": 4,
    "levelLabel": "4th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Glory (TCE) Paladin, Glory (PHB'24) Paladin, Order (TCE) Cleric, Order (TCE) Cleric",
    "text": "Each creature of your choice that you can see within range must succeed on a Wisdom saving throw or have the Charmed condition until the spell ends.\n\nFor the duration, you can take a Bonus Action to designate a direction that is horizontal to you. Each Charmed target must use as much of its movement as possible to move in that direction on its next turn, taking the safest route. After moving in this way, a target repeats the save, ending the spell on itself on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "cone-of-cold",
    "name": "Cone of Cold",
    "source": "PHB'24",
    "page": 253,
    "level": 5,
    "levelLabel": "5th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a small crystal or glass cone",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Land (Arctic) (PHB'14) Druid, Land (Polar Land) (PHB'24) Druid, Evoker (PHB'24) Wizard, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock, Genie (Marid) (TCE) Warlock, Genie (Marid) (TCE) Warlock, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock, Winter Walker (FRHoF) Ranger",
    "text": "You unleash a blast of cold air. Each creature in a 60-foot Cone originating from you makes a Constitution saving throw, taking 8d8 Cold damage on a failed save or half as much damage on a successful one. A creature killed by this spell becomes a frozen statue until it thaws.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 5."
  },
  {
    "id": "confusion",
    "name": "Confusion",
    "source": "PHB'24",
    "page": 253,
    "level": 4,
    "levelLabel": "4th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "three nut shells",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Spores (TCE) Druid, Spores (TCE) Druid, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Great Old One (PHB'24) Warlock, Knowledge (PHB'14) Cleric, Knowledge (FRHoF) Cleric, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin, Trickery (PHB'24) Cleric",
    "text": "Each creature in a 10-foot-radius Sphere centered on a point you choose within range must succeed on a Wisdom saving throw, or that target can't take Bonus Actions or Reactions and must roll 1d10 at the start of each of its turns to determine its behavior for that turn, consulting the table below.\n\n1d10Behavior for the Turn1The target doesn't take an action, and it uses all its movement to move. Roll 1d4 for the direction: 1, north; 2, east; 3, south; or 4, west.2-6The target doesn't move or take actions.7-8The target doesn't move, and it takes the Attack action to make one melee attack against a random creature within reach. If none are within reach, the target takes no action.9-10The target chooses its behavior.At the end of each of its turns, an affected target repeats the save, ending the spell on itself on a success.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Sphere's radius increases by 5 feet for each spell slot level above 4."
  },
  {
    "id": "conjure-animals",
    "name": "Conjure Animals",
    "source": "PHB'24",
    "page": 254,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Moon (PHB'24) Druid, Lore (PHB'24) Bard",
    "text": "You conjure nature spirits that appear as a Large pack of spectral, intangible animals in an unoccupied space you can see within range. The pack lasts for the duration, and you choose the spirits' animal form, such as wolves, serpents, or birds.\n\nYou have Advantage on Strength saving throws while you're within 5 feet of the pack, and when you move on your turn, you can also move the pack up to 30 feet to an unoccupied space you can see.\n\nWhenever the pack moves within 10 feet of a creature you can see and whenever a creature you can see enters a space within 10 feet of the pack or ends its turn there, you can force that creature to make a Dexterity saving throw. On a failed save, the creature takes 3d10 Slashing damage. A creature makes this save only once per turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 3."
  },
  {
    "id": "conjure-barrage",
    "name": "Conjure Barrage",
    "source": "PHB'24",
    "page": 254,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a Melee or Ranged weapon worth at least 1 CP",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer",
    "text": "You brandish the weapon used to cast the spell and conjure similar spectral weapons (or ammunition appropriate to the weapon) that launch forward and then disappear. Each creature of your choice that you can see in a 60-foot Cone makes a Dexterity saving throw, taking 5d8 Force damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 3."
  },
  {
    "id": "conjure-celestial",
    "name": "Conjure Celestial",
    "source": "PHB'24",
    "page": 254,
    "level": 7,
    "levelLabel": "7th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "90 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You conjure a spirit from the Upper Planes, which manifests as a pillar of light in a 10-foot-radius, 40-foot-high Cylinder centered on a point within range. For each creature you can see in the Cylinder, choose which of these lights shines on it:\n\nHealing Light. The target regains Hit Points equal to 4d12 plus your spellcasting ability modifier.\n\nSearing Light. The target makes a Dexterity saving throw, taking 6d12 Radiant damage on a failed save or half as much damage on a successful one.\n\nUntil the spell ends, Bright Light fills the Cylinder, and when you move on your turn, you can also move the Cylinder up to 30 feet.\n\nWhenever the Cylinder moves into the space of a creature you can see and whenever a creature you can see enters the Cylinder or ends its turn there, you can bathe it in one of the lights. A creature can be affected by this spell only once per turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The healing and damage increase by 1d12 for each spell slot level above 7."
  },
  {
    "id": "conjure-elemental",
    "name": "Conjure Elemental",
    "source": "PHB'24",
    "page": 254,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Coast) (PHB'14) Druid, Sea (PHB'24) Druid",
    "text": "You conjure a Large, intangible spirit from the Elemental Planes that appears in an unoccupied space within range. Choose the spirit's element, which determines its damage type: air (Lightning), earth (Thunder), fire (Fire), or water (Cold). The spirit lasts for the duration.\n\nWhenever a creature you can see enters the spirit's space or starts its turn within 5 feet of the spirit, you can force that creature to make a Dexterity saving throw if the spirit has no creature Restrained. On failed save, the target takes 8d8 damage of the spirit's type, and the target has the Restrained condition until the spell ends. At the start of each of its turns, the Restrained target repeats the save. On a failed save, the target takes 4d8 damage of the spirit's type. On a successful save, the target isn't Restrained by the spirit.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 5."
  },
  {
    "id": "conjure-fey",
    "name": "Conjure Fey",
    "source": "PHB'24",
    "page": 255,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You conjure a Medium spirit from the Feywild in an unoccupied space you can see within range. The spirit lasts for the duration, and it looks like a Fey creature of your choice. When the spirit appears, you can make one melee spell attack against a creature within 5 feet of it. On a hit, the target takes Psychic damage equal to 3d12 plus your spellcasting ability modifier, and the target has the Frightened condition until the start of your next turn, with both you and the spirit as the source of the fear.\n\nAs a Bonus Action on your later turns, you can teleport the spirit to an unoccupied space you can see within 30 feet of the space it left and make the attack against a creature within 5 feet of it.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d12 for each spell slot level above 6."
  },
  {
    "id": "conjure-minor-elementals",
    "name": "Conjure Minor Elementals",
    "source": "PHB'24",
    "page": 255,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Noble Genies (FRHoF) Paladin",
    "text": "You conjure spirits from the Elemental Planes that flit around you in a 15-foot Emanation for the duration. Until the spell ends, any attack you make deals an extra 2d8 damage when you hit a creature in the Emanation. This damage is Acid, Cold, Fire, or Lightning (your choice when you make the attack).\n\nIn addition, the ground in the Emanation is Difficult Terrain for your enemies.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
  },
  {
    "id": "conjure-volley",
    "name": "Conjure Volley",
    "source": "PHB'24",
    "page": 255,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a Melee or Ranged weapon worth at least 1 CP",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You brandish the weapon used to cast the spell and choose a point within range. Hundreds of similar spectral weapons (or ammunition appropriate to the weapon) fall in a volley and then disappear. Each creature of your choice that you can see in a 40-foot-radius, 20-foot-high Cylinder centered on that point makes a Dexterity saving throw. A creature takes 8d8 Force damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": ""
  },
  {
    "id": "conjure-woodland-beings",
    "name": "Conjure Woodland Beings",
    "source": "PHB'24",
    "page": 255,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You conjure nature spirits that flit around you in a 10-foot Emanation for the duration. Whenever the Emanation enters the space of a creature you can see and whenever a creature you can see enters the Emanation or ends its turn there, you can force that creature to make a Wisdom saving throw. The creature takes 5d8 Force damage on a failed save or half as much damage on a successful one. A creature makes this save only once per turn.\n\nIn addition, you can take the Disengage action as a Bonus Action for the spell's duration.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
  },
  {
    "id": "contact-other-plane",
    "name": "Contact Other Plane",
    "source": "PHB'24",
    "page": 255,
    "level": 5,
    "levelLabel": "5th",
    "school": "Divination",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Diviner (PHB'24) Wizard, Noble Genies (FRHoF) Paladin",
    "text": "You mentally contact a demigod, the spirit of a long-dead sage, or some other knowledgeable entity from another plane. Contacting this otherworldly intelligence can break your mind. When you cast this spell, make a DC 15 Intelligence saving throw. On a successful save, you can ask the entity up to five questions. You must ask your questions before the spell ends. The DM answers each question with one word, such as \"yes,\" \"no,\" \"maybe,\" \"never,\" \"irrelevant,\" or \"unclear\" (if the entity doesn't know the answer to the question). If a one-word answer would be misleading, the DM might instead offer a short phrase as an answer.\n\nOn a failed save, you take 6d6 Psychic damage and have the Incapacitated condition until you finish a Long Rest. A Greater Restoration spell cast on you ends this effect.",
    "atHigherLevels": ""
  },
  {
    "id": "contagion",
    "name": "Contagion",
    "source": "PHB'24",
    "page": 256,
    "level": 5,
    "levelLabel": "5th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "7 days",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Spores (TCE) Druid, Spores (TCE) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin, Undying (SCAG) Warlock, Undying (SCAG) Warlock",
    "text": "Your touch inflicts a magical contagion. The target must succeed on a Constitution saving throw or take 11d8 Necrotic damage and have the Poisoned condition. Also, choose one ability when you cast the spell. While Poisoned, the target has Disadvantage on saving throws made with the chosen ability.\n\nThe target must repeat the saving throw at the end of each of its turns until it gets three successes or failures. If the target succeeds on three of these saves, the spell ends on the target. If the target fails three of the saves, the spell lasts for 7 days on it.\n\nWhenever the Poisoned target receives an effect that would end the Poisoned condition, the target must succeed on a Constitution saving throw, or the Poisoned condition doesn't end on it.",
    "atHigherLevels": ""
  },
  {
    "id": "contingency",
    "name": "Contingency",
    "source": "PHB'24",
    "page": 256,
    "level": 6,
    "levelLabel": "6th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "10 days",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a gem-encrusted statuette of yourself worth 1,500+ GP",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "Choose a spell of level 5 or lower that you can cast, that has a casting time of an action, and that can target you. You cast that spell—called the contingent spell—as part of casting Contingency, expending spell slots for both, but the contingent spell doesn't come into effect. Instead, it takes effect when a certain trigger occurs. You describe that trigger when you cast the two spells. For example, a Contingency cast with Water Breathing might stipulate that Water Breathing comes into effect when you are engulfed in water or a similar liquid.\n\nThe contingent spell takes effect immediately after the trigger occurs for the first time, whether or not you want it to, and then Contingency ends.\n\nThe contingent spell takes effect only on you, even if it can normally target others. You can use only one Contingency spell at a time. If you cast this spell again, the effect of another Contingency spell on you ends. Also, Contingency ends on you if its material component is ever not on your person.",
    "atHigherLevels": ""
  },
  {
    "id": "continual-flame",
    "name": "Continual Flame",
    "source": "PHB'24",
    "page": 256,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Until dispelled",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "ruby dust worth 50+ GP, which the spell consumes",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "A flame springs from an object that you touch. The effect casts Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. It looks like a regular flame, but it creates no heat and consumes no fuel. The flame can be covered or hidden but not smothered or quenched.",
    "atHigherLevels": ""
  },
  {
    "id": "control-water",
    "name": "Control Water",
    "source": "PHB'24",
    "page": 256,
    "level": 4,
    "levelLabel": "4th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "300 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a mixture of water and dust",
    "classes": [
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Land (Coast) (PHB'14) Druid, Sea (PHB'24) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock, Genie (Marid) (TCE) Warlock, Genie (Marid) (TCE) Warlock",
    "text": "Until the spell ends, you control any water inside an area you choose that is a Cube up to 100 feet on a side, using one of the following effects. As a Magic action on your later turns, you can repeat the same effect or choose a different one.\n\nFlood. You cause the water level of all standing water in the area to rise by as much as 20 feet. If you choose an area in a large body of water, you instead create a 20-foot tall wave that travels from one side of the area to the other and then crashes. Any Huge or smaller vehicles in the wave's path are carried with it to the other side. Any Huge or smaller vehicles struck by the wave have a 25 percent chance of capsizing.\n\nThe water level remains elevated until the spell ends or you choose a different effect. If this effect produced a wave, the wave repeats on the start of your next turn while the flood effect lasts.\n\nPart Water. You part water in the area and create a trench. The trench extends across the spell's area, and the separated water forms a wall to either side. The trench remains until the spell ends or you choose a different effect. The water then slowly fills in the trench over the course of the next round until the normal water level is restored.\n\nRedirect Flow. You cause flowing water in the area to move in a direction you choose, even if the water has to flow over obstacles, up walls, or in other unlikely directions. The water in the area moves as you direct it, but once it moves beyond the spell's area, it resumes its flow based on the terrain. The water continues to move in the direction you chose until the spell ends or you choose a different effect.\n\nWhirlpool. You cause a whirlpool to form in the center of the area, which must be at least 50 feet square and 25 feet deep. The whirlpool lasts until you choose a different effect or the spell ends. The whirlpool is 5 feet wide at the base, up to 50 feet wide at the top, and 25 feet tall. Any creature in the water and within 25 feet of the whirlpool is pulled 10 feet toward it. When a creature enters the whirlpool for the first time on a turn or ends its turn there, it makes a Strength saving throw. On a failed save, the creature takes 2d8 Bludgeoning damage. On a successful save, the creature takes half as much damage. A creature can swim away from the whirlpool only if it first takes an action to pull away and succeeds on a Strength (Athletics) check against your spell save DC.",
    "atHigherLevels": ""
  },
  {
    "id": "control-weather",
    "name": "Control Weather",
    "source": "PHB'24",
    "page": 257,
    "level": 8,
    "levelLabel": "8th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Concentration, up to 8 hours",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "burning incense",
    "classes": [
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell, and it ends early if you go indoors.\n\nWhen you cast the spell, you change the current weather conditions, which are determined by the DM. You can change precipitation, temperature, and wind. It takes 1d4 × 10 minutes for the new conditions to take effect. Once they do so, you can change the conditions again. When the spell ends, the weather gradually returns to normal.\n\nWhen you change the weather conditions, find a current condition on the following tables and change its stage by one, up or down. When changing the wind, you can change its direction.\n\nPrecipitationStageCondition1Clear2Light clouds3Overcast or ground fog4Rain, hail, or snow5Torrential rain, driving hail, or blizzardTemperatureStageCondition1Heat wave2Hot3Warm4Cool5Cold6FreezingWindStageCondition1Calm2Moderate wind3Strong wind4Gale5Storm",
    "atHigherLevels": ""
  },
  {
    "id": "cordon-of-arrows",
    "name": "Cordon of Arrows",
    "source": "PHB'24",
    "page": 258,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "four or more arrows or bolts",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You touch up to four nonmagical Arrows or Bolts and plant them in the ground in your space. Until the spell ends, the ammunition can't be physically uprooted, and whenever a creature other than you enters a space within 30 feet of the ammunition for the first time on a turn or ends its turn there, one piece of ammunition flies up to strike it. The creature must succeed on a Dexterity saving throw or take 2d4 Piercing damage. The piece of ammunition is then destroyed. The spell ends when none of the ammunition remains planted in the ground.\n\nWhen you cast this spell, you can designate any creatures you choose, and the spell ignores them.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The amount of ammunition that can be affected increases by two for each spell slot level above 2."
  },
  {
    "id": "counterspell",
    "name": "Counterspell",
    "source": "PHB'24",
    "page": 258,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Reaction",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Watchers (TCE) Paladin, Watchers (TCE) Paladin, Spellfire (FRHoF) Sorcerer",
    "text": "You attempt to interrupt a creature in the process of casting a spell. The creature makes a Constitution saving throw. On a failed save, the spell dissipates with no effect, and the action, Bonus Action, or Reaction used to cast it is wasted. If that spell was cast with a spell slot, the slot isn't expended.",
    "atHigherLevels": ""
  },
  {
    "id": "create-food-and-water",
    "name": "Create Food and Water",
    "source": "PHB'24",
    "page": 258,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Desert) (PHB'14) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Genie (TCE) Warlock, Genie (TCE) Warlock",
    "text": "You create 45 pounds of food and 30 gallons of fresh water on the ground or in containers within range—both useful in fending off the hazards of malnutrition and dehydration. The food is bland but nourishing and looks like a food of your choice, and the water is clean. The food spoils after 24 hours if uneaten.",
    "atHigherLevels": ""
  },
  {
    "id": "create-undead",
    "name": "Create Undead",
    "source": "PHB'24",
    "page": 258,
    "level": 6,
    "levelLabel": "6th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Instantaneous",
    "range": "10 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "one 150+ GP black onyx stone for each corpse",
    "classes": [
      "Cleric",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You can cast this spell only at night. Choose up to three corpses of Medium or Small Humanoids within range. Each one becomes a Ghoul under your control (see the Monster Manual for its stat block).\n\nAs a Bonus Action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to them). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a particular place. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow the order until its task is complete.\n\nThe creature is under your control for 24 hours, after which it stops obeying any command you've given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell rather than animating new ones.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. If you use a level 7 spell slot, you can animate or reassert control over four Ghouls. If you use a level 8 spell slot, you can animate or reassert control over five Ghouls or two Ghasts or Wights. If you use a level 9 spell slot, you can animate or reassert control over six Ghouls, three Ghasts or Wights, or two Mummies. See the Monster Manual for these stat blocks."
  },
  {
    "id": "create-or-destroy-water",
    "name": "Create or Destroy Water",
    "source": "PHB'24",
    "page": 258,
    "level": 1,
    "levelLabel": "1st",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a mix of water and sand",
    "classes": [
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock",
    "text": "You do one of the following:\n\nCreate Water. You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot Cube within range, extinguishing exposed flames there.\n\nDestroy Water. You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot Cube within range.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You create or destroy 10 additional gallons of water, or the size of the Cube increases by 5 feet, for each spell slot level above 1."
  },
  {
    "id": "creation",
    "name": "Creation",
    "source": "PHB'24",
    "page": 259,
    "level": 5,
    "levelLabel": "5th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Special",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a paintbrush",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Forge (XGE) Cleric, Forge (XGE) Cleric, Illusionist (PHB'24) Wizard, Genie (TCE) Warlock, Genie (TCE) Warlock",
    "text": "You pull wisps of shadow material from the Shadowfell to create an object within range. It is either an object of vegetable matter (soft goods, rope, wood, and the like) or mineral matter (stone, crystal, metal, and the like). The object must be no larger than a 5-foot Cube, and the object must be of a form and material that you have seen.\n\nThe spell's duration depends on the object's material, as shown in the Materials table. If the object is composed of multiple materials, use the shortest duration. Using any object created by this spell as another spell's Material component causes the other spell to fail.\n\nMaterialsMaterialDurationVegetable matter24 hoursStone or crystal12 hoursPrecious metals1 hourGems10 minutesAdamantine or mithral1 minute",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Cube increases by 5 feet for each spell slot level above 5."
  },
  {
    "id": "crown-of-madness",
    "name": "Crown of Madness",
    "source": "PHB'24",
    "page": 259,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin",
    "text": "One creature that you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The creature succeeds automatically if it isn't Humanoid.\n\nA spectral crown appears on the Charmed target's head, and it must use its action before moving on each of its turns to make a melee attack against a creature other than itself that you mentally choose. The target can act normally on its turn if you choose no creature or if no creature is within its reach. The target repeats the save at the end of each of its turns, ending the spell on itself on a success.\n\nOn your later turns, you must take the Magic action to maintain control of the target, or the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "crusaders-mantle",
    "name": "Crusader's Mantle",
    "source": "PHB'24",
    "page": 259,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "War (PHB'14) Cleric, War (PHB'24) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "You radiate a magical aura in a 30-foot Emanation. While in the aura, you and your allies each deal an extra 1d4 Radiant damage when hitting with a weapon or an Unarmed Strike.",
    "atHigherLevels": ""
  },
  {
    "id": "cure-wounds",
    "name": "Cure Wounds",
    "source": "PHB'24",
    "page": 259,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Moon (PHB'24) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'24) Cleric, Life (PHB'14) Cleric, Spellfire (FRHoF) Sorcerer, Celestial (XGE) Warlock",
    "text": "A creature you touch regains a number of Hit Points equal to 2d8 plus your spellcasting ability modifier.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The healing increases by 2d8 for each spell slot level above 1."
  },
  {
    "id": "dancing-lights",
    "name": "Dancing Lights",
    "source": "PHB'24",
    "page": 259,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of phosphorus",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard",
    "text": "You create up to four torch-size lights within range, making them appear as torches, lanterns, or glowing orbs that hover for the duration. Alternatively, you combine the four lights into one glowing Medium form that is vaguely humanlike. Whichever form you choose, each light sheds Dim Light in a 10-foot radius.\n\nAs a Bonus Action, you can move the lights up to 60 feet to a space within range. A light must be within 20 feet of another light created by this spell, and a light vanishes if it exceeds the spell's range.",
    "atHigherLevels": ""
  },
  {
    "id": "darkness",
    "name": "Darkness",
    "source": "PHB'24",
    "page": 260,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "M"
    ],
    "material": "bat fur and a piece of coal",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Swamp) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin, Shadow (XGE) Sorcerer, Shadow (XGE) Sorcerer, Shadow (PHB'24) Monk, Shadow (PHB'14) Monk",
    "text": "For the duration, magical Darkness spreads from a point within range and fills a 15-foot-radius Sphere. Darkvision can't see through it, and nonmagical light can't illuminate it.\n\nAlternatively, you cast the spell on an object that isn't being worn or carried, causing the Darkness to fill a 15-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the Darkness.\n\nIf any of this spell's area overlaps with an area of Bright Light or Dim Light created by a spell of level 2 or lower, that other spell is dispelled.",
    "atHigherLevels": ""
  },
  {
    "id": "darkvision",
    "name": "Darkvision",
    "source": "PHB'24",
    "page": 260,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a dried carrot",
    "classes": [
      "Artificer",
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Shadow (PHB'14) Monk",
    "text": "For the duration, a willing creature you touch has Darkvision with a range of 150 feet.",
    "atHigherLevels": ""
  },
  {
    "id": "daylight",
    "name": "Daylight",
    "source": "PHB'24",
    "page": 260,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Land (Grassland) (PHB'14) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Celestial (XGE) Warlock",
    "text": "For the duration, sunlight spreads from a point within range and fills a 60-foot-radius Sphere. The sunlight's area is Bright Light and sheds Dim Light for an additional 60 feet.\n\nAlternatively, you cast the spell on an object that isn't being worn or carried, causing the sunlight to fill a 60-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the sunlight.\n\nIf any of this spell's area overlaps with an area of Darkness created by a spell of level 3 or lower, that other spell is dispelled.",
    "atHigherLevels": ""
  },
  {
    "id": "death-ward",
    "name": "Death Ward",
    "source": "PHB'24",
    "page": 261,
    "level": 4,
    "levelLabel": "4th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Grave (XGE) Cleric, Grave (XGE) Cleric, Life (PHB'14) Cleric, Life (PHB'24) Cleric, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Undead (VRGR) Warlock, Undead (VRGR) Warlock, Undying (SCAG) Warlock, Undying (SCAG) Warlock, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points before the spell ends, the target instead drops to 1 Hit Point, and the spell ends.\n\nIf the spell is still in effect when the target is subjected to an effect that would kill it instantly without dealing damage, that effect is negated against the target, and the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "delayed-blast-fireball",
    "name": "Delayed Blast Fireball",
    "source": "PHB'24",
    "page": 261,
    "level": 7,
    "levelLabel": "7th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a ball of bat guano and sulfur",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "A beam of yellow light flashes from you, then condenses at a chosen point within range as a glowing bead for the duration. When the spell ends, the bead explodes, and each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw. A creature takes Fire damage equal to the total accumulated damage on a failed save or half as much damage on a successful one.\n\nThe spell's base damage is 12d6, and the damage increases by 1d6 whenever your turn ends and the spell hasn't ended.\n\nIf a creature touches the glowing bead before the spell ends, that creature makes a Dexterity saving throw. On a failed save, the spell ends, causing the bead to explode. On a successful save, the creature can throw the bead up to 40 feet. If the thrown bead enters a creature's space or collides with a solid object, the spell ends, and the bead explodes.\n\nWhen the bead explodes, flammable objects in the explosion that aren't being worn or carried start burning.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The base damage increases by 1d6 for each spell slot level above 7."
  },
  {
    "id": "demiplane",
    "name": "Demiplane",
    "source": "PHB'24",
    "page": 261,
    "level": 8,
    "levelLabel": "8th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "60 feet",
    "components": [
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You create a shadowy Medium door on a flat solid surface that you can see within range. This door can be opened and closed, and it leads to a demiplane that is an empty room 30 feet in each dimension, made of wood or stone (your choice).\n\nWhen the spell ends, the door vanishes, and any objects inside the demiplane remain there. Any creatures inside also remain unless they opt to be shunted through the door as it vanishes, landing with the Prone condition in the unoccupied spaces closest to the door's former space.\n\nEach time you cast this spell, you can create a new demiplane or connect the shadowy door to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can connect the shadowy door to that demiplane instead.",
    "atHigherLevels": ""
  },
  {
    "id": "destructive-wave",
    "name": "Destructive Wave",
    "source": "PHB'24",
    "page": 261,
    "level": 5,
    "levelLabel": "5th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "Destructive energy ripples outward from you in a 30-foot Emanation. Each creature you choose in the Emanation makes a Constitution saving throw. On a failed save, a target takes 5d6 Thunder damage and 5d6 Radiant or Necrotic damage (your choice) and has the Prone condition. On a successful save, a target takes half as much damage only.",
    "atHigherLevels": ""
  },
  {
    "id": "detect-evil-and-good",
    "name": "Detect Evil and Good",
    "source": "PHB'24",
    "page": 261,
    "level": 1,
    "levelLabel": "1st",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Genie (TCE) Warlock, Genie (TCE) Warlock",
    "text": "For the duration, you sense the location of any Aberration, Celestial, Elemental, Fey, Fiend, or Undead within 30 feet of yourself. You also sense whether the Hallow spell is active there and, if so, where.\n\nThe spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead.",
    "atHigherLevels": ""
  },
  {
    "id": "detect-magic",
    "name": "Detect Magic",
    "source": "PHB'24",
    "page": 262,
    "level": 1,
    "levelLabel": "1st",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric, Watchers (TCE) Paladin, Watchers (TCE) Paladin",
    "text": "For the duration, you sense the presence of magical effects within 30 feet of yourself. If you sense such effects, you can take the Magic action to see a faint aura around any visible creature or object in the area that bears the magic, and if an effect was created by a spell, you learn the spell's school of magic.\n\nThe spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead.",
    "atHigherLevels": ""
  },
  {
    "id": "detect-poison-and-disease",
    "name": "Detect Poison and Disease",
    "source": "PHB'24",
    "page": 262,
    "level": 1,
    "levelLabel": "1st",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a yew leaf",
    "classes": [
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "For the duration, you sense the location of poisons, poisonous or venomous creatures, and magical contagions within 30 feet of yourself. You sense the kind of poison, creature, or contagion in each case.\n\nThe spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead.",
    "atHigherLevels": ""
  },
  {
    "id": "detect-thoughts",
    "name": "Detect Thoughts",
    "source": "PHB'24",
    "page": 262,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "1 Copper Piece",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Great Old One (PHB'24) Warlock, Knowledge (FRHoF) Cleric, Great Old One (PHB'14) Warlock",
    "text": "You activate one of the effects below. Until the spell ends, you can activate either effect as a Magic action on your later turns.\n\nSense Thoughts. You sense the presence of thoughts within 30 feet of yourself that belong to creatures that know languages or are telepathic. You don't read the thoughts, but you know that a thinking creature is present.\n\nThe spell is blocked by 1 foot of stone, dirt, or wood; 1 inch of metal; or a thin sheet of lead.\n\nRead Thoughts. Target one creature you can see within 30 feet of yourself or one creature within 30 feet of yourself that you detected with the Sense Thoughts option. You learn what is most on the target's mind right now. If the target doesn't know any languages and isn't telepathic, you learn nothing.\n\nAs a Magic action on your next turn, you can try to probe deeper into the target's mind. If you probe deeper, the target makes a Wisdom saving throw. On a failed save, you discern the target's reasoning, emotions, and something that looms large in its mind (such as a worry, love, or hate). On a successful save, the spell ends. Either way, the target knows that you are probing into its mind, and until you shift your attention away from the target's mind, the target can take an action on its turn to make an Intelligence (Arcana) check against your spell save DC, ending the spell on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "dimension-door",
    "name": "Dimension Door",
    "source": "PHB'24",
    "page": 262,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "500 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Fey Wanderer (TCE) Ranger, Fey Wanderer (PHB'24) Ranger, Vengeance (PHB'14) Paladin, Vengeance (PHB'24) Paladin, Trickery (PHB'14) Cleric, Trickery (PHB'24) Cleric, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "You teleport to a location within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as \"200 feet straight downward\" or \"300 feet upward to the northwest at a 45-degree angle.\"\n\nYou can also teleport one willing creature. The creature must be within 5 feet of you when you teleport, and it teleports to a space within 5 feet of your destination space.\n\nIf you, the other creature, or both would arrive in a space occupied by a creature or completely filled by one or more objects, you and any creature traveling with you each take 4d6 Force damage, and the teleportation fails.",
    "atHigherLevels": ""
  },
  {
    "id": "disguise-self",
    "name": "Disguise Self",
    "source": "PHB'24",
    "page": 262,
    "level": 1,
    "levelLabel": "1st",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Gloom Stalker (PHB'24) Ranger, Gloom Stalker (XGE) Ranger, Illusionist (PHB'24) Wizard, Trickery (PHB'24) Cleric, Trickery (PHB'14) Cleric, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends. You can seem 1 foot shorter or taller and can appear heavier or lighter. You must adopt a form that has the same basic arrangement of limbs as you have. Otherwise, the extent of the illusion is up to you.\n\nThe changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing.\n\nTo discern that you are disguised, a creature must take the Study action to inspect your appearance and succeed on an Intelligence (Investigation) check against your spell save DC.",
    "atHigherLevels": ""
  },
  {
    "id": "disintegrate",
    "name": "Disintegrate",
    "source": "PHB'24",
    "page": 263,
    "level": 6,
    "levelLabel": "6th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a lodestone and dust",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You launch a green ray at a target you can see within range. The target can be a creature, a nonmagical object, or a creation of magical force, such as the wall created by Wall of Force.\n\nA creature targeted by this spell makes a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 Force damage. If this damage reduces it to 0 Hit Points, it and everything nonmagical it is wearing and carrying are disintegrated into gray dust. The target can be revived only by a True Resurrection or a Wish spell.\n\nThis spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If such a target is Huge or larger, this spell disintegrates a 10-foot-Cube portion of it.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 3d6 for each spell slot level above 6."
  },
  {
    "id": "dispel-evil-and-good",
    "name": "Dispel Evil and Good",
    "source": "PHB'24",
    "page": 263,
    "level": 5,
    "levelLabel": "5th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "powdered silver and iron",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "For the duration, Celestials, Elementals, Fey, Fiends, and Undead have Disadvantage on attack rolls against you. You can end the spell early by using either of the following special functions.\n\nBreak Enchantment. As a Magic action, you touch a creature that is possessed by or has the Charmed or Frightened condition from one or more creatures of the types above. The target is no longer possessed, Charmed, or Frightened by such creatures.\n\nDismissal. As a Magic action, you target one creature you can see within 5 feet of you that has one of the creature types above. The target must succeed on a Charisma saving throw or be sent back to its home plane if it isn't there already. If they aren't on their home plane, Undead are sent to the Shadowfell, and Fey are sent to the Feywild.",
    "atHigherLevels": ""
  },
  {
    "id": "dispel-magic",
    "name": "Dispel Magic",
    "source": "PHB'24",
    "page": 264,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fey Wanderer (TCE) Ranger, Knowledge (FRHoF) Cleric, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Devotion (PHB'24) Paladin, Devotion (PHB'14) Paladin, Spellfire (FRHoF) Sorcerer, Trickery (PHB'14) Cleric",
    "text": "Choose one creature, object, or magical effect within range. Any ongoing spell of level 3 or lower on the target ends. For each ongoing spell of level 4 or higher on the target, make an ability check using your spellcasting ability (DC 10 plus that spell's level). On a successful check, the spell ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You automatically end a spell on the target if the spell's level is equal to or less than the level of the spell slot you use."
  },
  {
    "id": "dissonant-whispers",
    "name": "Dissonant Whispers",
    "source": "PHB'24",
    "page": 264,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Great Old One (PHB'24) Warlock, Great Old One (PHB'14) Warlock",
    "text": "One creature of your choice that you can see within range hears a discordant melody in its mind. The target makes a Wisdom saving throw. On a failed save, it takes 3d6 Psychic damage and must immediately use its Reaction, if available, to move as far away from you as it can, using the safest route. On a successful save, the target takes half as much damage only.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "divination",
    "name": "Divination",
    "source": "PHB'24",
    "page": 264,
    "level": 4,
    "levelLabel": "4th",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "incense worth 25+ GP, which the spell consumes",
    "classes": [
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Land (Forest) (PHB'14) Druid, Land (Grassland) (PHB'14) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter",
    "text": "This spell puts you in contact with a god or a god's servants. You ask one question about a specific goal, event, or activity to occur within 7 days. The DM offers a truthful reply, which might be a short phrase or cryptic rhyme. The spell doesn't account for circumstances that might change the answer, such as the casting of other spells.\n\nIf you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer.",
    "atHigherLevels": ""
  },
  {
    "id": "divine-favor",
    "name": "Divine Favor",
    "source": "PHB'24",
    "page": 265,
    "level": 1,
    "levelLabel": "1st",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "War (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "Until the spell ends, your attacks with weapons deal an extra 1d4 Radiant damage on a hit.",
    "atHigherLevels": ""
  },
  {
    "id": "divine-smite",
    "name": "Divine Smite",
    "source": "PHB'24",
    "page": 265,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "The target takes an extra 2d8 Radiant damage from the attack. The damage increases by 1d8 if the target is a Fiend or an Undead.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
  },
  {
    "id": "divine-word",
    "name": "Divine Word",
    "source": "PHB'24",
    "page": 265,
    "level": 7,
    "levelLabel": "7th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You utter a word imbued with power from the Upper Planes. Each creature of your choice in range makes a Charisma saving throw. On a failed save, a target that has 50 Hit Points or fewer suffers an effect based on its current Hit Points, as shown in the Divine Word Effects table. Regardless of its Hit Points, a Celestial, an Elemental, a Fey, or a Fiend target that fails its save is forced back to its plane of origin (if it isn't there already) and can't return to the current plane for 24 hours by any means short of a Wish spell.\n\nDivine Word EffectsHit PointsEffect0-20The target dies.21-30The target has the Blinded, Deafened, and Stunned conditions for 1 hour.31-40The target has the Blinded and Deafened conditions for 10 minutes.41-50The target has the Deafened condition for 1 minute.",
    "atHigherLevels": ""
  },
  {
    "id": "dominate-beast",
    "name": "Dominate Beast",
    "source": "PHB'24",
    "page": 265,
    "level": 4,
    "levelLabel": "4th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger",
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Archfey (PHB'24) Warlock, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Conquest (XGE) Paladin, Conquest (XGE) Paladin, Archfey (PHB'14) Warlock, Great Old One (PHB'14) Warlock, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "One Beast you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success.\n\nYou have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as \"Attack that creature,\" \"Move over there,\" or \"Fetch that object.\" The target does its best to obey on its turn. If it completes an order and doesn't receive further direction from you, it acts and moves as it likes, focusing on protecting itself.\n\nYou can command the target to take a Reaction but must take your own Reaction to do so.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 5 (up to 10 minutes), 6 (up to 1 hour), or 7+ (up to 8 hours)."
  },
  {
    "id": "dominate-monster",
    "name": "Dominate Monster",
    "source": "PHB'24",
    "page": 265,
    "level": 8,
    "levelLabel": "8th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "One creature you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success.\n\nYou have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as \"Attack that creature,\" \"Move over there,\" or \"Fetch that object.\" The target does its best to obey on its turn. If it completes an order and doesn't receive further direction from you, it acts and moves as it likes, focusing on protecting itself.\n\nYou can command the target to take a Reaction but must take your own Reaction to do so.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a level 9 spell slot (up to 8 hours)."
  },
  {
    "id": "dominate-person",
    "name": "Dominate Person",
    "source": "PHB'24",
    "page": 266,
    "level": 5,
    "levelLabel": "5th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Archfey (PHB'24) Warlock, Conquest (XGE) Paladin, Conquest (XGE) Paladin, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin, Order (TCE) Cleric, Order (TCE) Cleric, Archfey (PHB'14) Warlock, Great Old One (PHB'14) Warlock, Trickery (PHB'14) Cleric, Trickery (PHB'24) Cleric, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "One Humanoid you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target has Advantage on the save if you or your allies are fighting it. Whenever the target takes damage, it repeats the save, ending the spell on itself on a success.\n\nYou have a telepathic link with the Charmed target while the two of you are on the same plane of existence. On your turn, you can use this link to issue commands to the target (no action required), such as \"Attack that creature,\" \"Move over there,\" or \"Fetch that object.\" The target does its best to obey on its turn. If it completes an order and doesn't receive further direction from you, it acts and moves as it likes, focusing on protecting itself.\n\nYou can command the target to take a Reaction but must take your own Reaction to do so.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 6 (up to 10 minutes), 7 (up to 1 hour), or 8+ (up to 8 hours)."
  },
  {
    "id": "dragons-breath",
    "name": "Dragon's Breath",
    "source": "PHB'24",
    "page": 266,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a hot pepper",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Draconic (PHB'24) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You touch one willing creature, and choose Acid, Cold, Fire, Lightning, or Poison. Until the spell ends, the target can take a Magic action to exhale a 15-foot Cone. Each creature in that area makes a Dexterity saving throw, taking 3d6 damage of the chosen type on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
  },
  {
    "id": "drawmijs-instant-summons",
    "name": "Drawmij's Instant Summons",
    "source": "PHB'24",
    "page": 266,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "Until dispelled",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a sapphire worth 1,000+ GP",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You touch the sapphire used in the casting and an object weighing 10 pounds or less whose longest dimension is 6 feet or less. The spell leaves an Invisible mark on that object and invisibly inscribes the object's name on the sapphire. Each time you cast this spell, you must use a different sapphire.\n\nThereafter, you can take a Magic action to speak the object's name and crush the sapphire. The object instantly appears in your hand regardless of physical or planar distances, and the spell ends.\n\nIf another creature is holding or carrying the object, crushing the sapphire doesn't transport it, but instead you learn who that creature is and where that creature is currently located.",
    "atHigherLevels": ""
  },
  {
    "id": "dream",
    "name": "Dream",
    "source": "PHB'24",
    "page": 266,
    "level": 5,
    "levelLabel": "5th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "8 hours",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a handful of sand",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Grassland) (PHB'14) Druid, Illusionist (PHB'24) Wizard",
    "text": "You target a creature you know on the same plane of existence. You or a willing creature you touch enters a trance state to act as a dream messenger. While in the trance, the messenger is Incapacitated and has a Speed of 0.\n\nIf the target is asleep, the messenger appears in the target's dreams and can converse with the target as long as it remains asleep, through the spell's duration. The messenger can also shape the dream's environment, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the spell. The target recalls the dream perfectly upon waking.\n\nIf the target is awake when you cast the spell, the messenger knows it and can either end the trance (and the spell) or wait for the target to sleep, at which point the messenger enters its dreams.\n\nYou can make the messenger terrifying to the target. If you do so, the messenger can deliver a message of no more than ten words, and then the target makes a Wisdom saving throw. On a failed save, the target gains no benefit from its rest, and it takes 3d6 Psychic damage when it wakes up.",
    "atHigherLevels": ""
  },
  {
    "id": "druidcraft",
    "name": "Druidcraft",
    "source": "PHB'24",
    "page": 266,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Archer (XGE) Fighter, Arcane Archer (XGE) Fighter, Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Giant (BGG) Barbarian, Giant (BGG) Barbarian, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "Whispering to the spirits of nature, you create one of the following effects within range.\n\nWeather Sensor. You create a Tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours. The effect might manifest as a golden orb for clear skies, a cloud for rain, falling snowflakes for snow, and so on. This effect persists for 1 round.\n\nBloom. You instantly make a flower blossom, a seed pod open, or a leaf bud bloom.\n\nSensory Effect. You create a harmless sensory effect, such as falling leaves, spectral dancing fairies, a gentle breeze, the sound of an animal, or the faint odor of skunk. The effect must fit in a 5-foot Cube.\n\nFire Play. You light or snuff out a candle, a torch, or a campfire.",
    "atHigherLevels": ""
  },
  {
    "id": "earthquake",
    "name": "Earthquake",
    "source": "PHB'24",
    "page": 267,
    "level": 8,
    "levelLabel": "8th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "500 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a fractured rock",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "Choose a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point. The ground there is Difficult Terrain.\n\nWhen you cast this spell and at the end of each of your turns for the duration, each creature on the ground in the area makes a Dexterity saving throw. On a failed save, a creature has the Prone condition, and its Concentration is broken.\n\nYou can also cause the effects below.\n\nFissures. A total of 1d6 fissures open in the spell's area at the end of the turn you cast it. You choose the fissures' locations, which can't be under structures. Each fissure is 1d10 × 10 feet deep and 10 feet wide, and it extends from one edge of the spell's area to another edge. A creature in the same space as a fissure must succeed on a Dexterity saving throw or fall in. A creature that successfully saves moves with the fissure's edge as it opens.\n\nStructures. The tremor deals 50 Bludgeoning damage to any structure in contact with the ground in the area when you cast the spell and at the end of each of your turns until the spell ends. If a structure drops to 0 Hit Points, it collapses.\n\nA creature within a distance from a collapsing structure equal to half the structure's height makes a Dexterity saving throw. On a failed save, the creature takes 12d6 Bludgeoning damage, has the Prone condition, and is buried in the rubble, requiring a DC 20 Strength (Athletics) check as an action to escape. On a successful save, the creature takes half as much damage only.",
    "atHigherLevels": ""
  },
  {
    "id": "eldritch-blast",
    "name": "Eldritch Blast",
    "source": "PHB'24",
    "page": 267,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You hurl a beam of crackling energy. Make a ranged spell attack against one creature or object in range. On a hit, the target takes 1d10 Force damage.",
    "atHigherLevels": "Cantrip Upgrade. The spell creates two beams at level 5, three beams at level 11, and four beams at level 17. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam."
  },
  {
    "id": "elemental-weapon",
    "name": "Elemental Weapon",
    "source": "PHB'24",
    "page": 267,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Forge (XGE) Cleric, Forge (XGE) Cleric, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "A nonmagical weapon you touch becomes a magic weapon. Choose one of the following damage types: Acid, Cold, Fire, Lightning, or Thunder. For the duration, the weapon has a +1 bonus to attack rolls and deals an extra 1d4 damage of the chosen type when it hits.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. If you use a level 5-6 spell slot, the bonus to attack rolls increases to +2, and the extra damage increases to 2d4. If you use a level 7+ spell slot, the bonus increases to +3, and the extra damage increases to 3d4."
  },
  {
    "id": "elementalism",
    "name": "Elementalism",
    "source": "PHB'24",
    "page": 267,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Noble Genies (FRHoF) Paladin, Elements (PHB'24) Monk, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You exert control over the elements, creating one of the following effects within range.\n\nBeckon Air. You create a breeze strong enough to ripple cloth, stir dust, rustle leaves, and close open doors and shutters, all in a 5-foot Cube. Doors and shutters being held open by someone or something aren't affected.\n\nBeckon Earth. You create a thin shroud of dust or sand that covers surfaces in a 5-foot-square area, or you cause a single word to appear in your handwriting in a patch of dirt or sand.\n\nBeckon Fire. You create a thin cloud of harmless embers and colored, scented smoke in a 5-foot Cube. You choose the color and scent, and the embers can light candles, torches, or lamps in that area. The smoke's scent lingers for 1 minute.\n\nBeckon Water. You create a spray of cool mist that lightly dampens creatures and objects in a 5-foot Cube. Alternatively, you create 1 cup of clean water either in an open container or on a surface, and the water evaporates in 1 minute.\n\nSculpt Element. You cause dirt, sand, fire, smoke, mist, or water that can fit in a 1-foot Cube to assume a crude shape (such as that of a creature) for 1 hour.",
    "atHigherLevels": ""
  },
  {
    "id": "enhance-ability",
    "name": "Enhance Ability",
    "source": "PHB'24",
    "page": 268,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "fur or a feather",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Glory (PHB'24) Paladin, Glory (TCE) Paladin, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You touch a creature and choose Strength, Dexterity, Intelligence, Wisdom, or Charisma. For the duration, the target has Advantage on ability checks using the chosen ability.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2. You can choose a different ability for each target."
  },
  {
    "id": "enlarge-reduce",
    "name": "Enlarge/Reduce",
    "source": "PHB'24",
    "page": 268,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of powdered iron",
    "classes": [
      "Artificer",
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "For the duration, the spell enlarges or reduces a creature or an object you can see within range (see the chosen effect below). A targeted object must be neither worn nor carried. If the target is an unwilling creature, it can make a Constitution saving throw. On a successful save, the spell has no effect.\n\nEverything that a targeted creature is wearing and carrying changes size with it. Any item it drops returns to normal size at once. A thrown weapon or piece of ammunition returns to normal size immediately after it hits or misses a target.\n\nEnlarge. The target's size increases by one category—from Medium to Large, for example. The target also has Advantage on Strength checks and Strength saving throws. The target's attacks with its enlarged weapons or Unarmed Strikes deal an extra 1d4 damage on a hit.\n\nReduce. The target's size decreases by one category—from Medium to Small, for example. The target also has Disadvantage on Strength checks and Strength saving throws. The target's attacks with its reduced weapons or Unarmed Strikes deal 1d4 less damage on a hit (this can't reduce the damage below 1).",
    "atHigherLevels": ""
  },
  {
    "id": "ensnaring-strike",
    "name": "Ensnaring Strike",
    "source": "PHB'24",
    "page": 268,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Ancients (PHB'14) Paladin, Ancients (PHB'24) Paladin",
    "text": "As you hit the target, grasping vines appear on it, and it makes a Strength saving throw. A Large or larger creature has Advantage on this save. On a failed save, the target has the Restrained condition until the spell ends. On a successful save, the vines shrivel away, and the spell ends.\n\nWhile Restrained, the target takes 1d6 Piercing damage at the start of each of its turns. The target or a creature within reach of it can take an action to make a Strength (Athletics) check against your spell save DC. On a success, the spell ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "entangle",
    "name": "Entangle",
    "source": "PHB'24",
    "page": 268,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "90 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard",
    "text": "Grasping plants sprout from the ground in a 20-foot square within range. For the duration, these plants turn the ground in the area into Difficult Terrain. They disappear when the spell ends.\n\nEach creature (other than you) in the area when you cast the spell must succeed on a Strength saving throw or have the Restrained condition until the spell ends. A Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC. On a success, it frees itself from the grasping plants and is no longer Restrained by them.",
    "atHigherLevels": ""
  },
  {
    "id": "enthrall",
    "name": "Enthrall",
    "source": "PHB'24",
    "page": 269,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You weave a distracting string of words, causing creatures of your choice that you can see within range to make a Wisdom saving throw. Any creature you or your companions are fighting automatically succeeds on this save. On a failed save, a target has a -10 penalty to Wisdom (Perception) checks and Passive Perception until the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "etherealness",
    "name": "Etherealness",
    "source": "PHB'24",
    "page": 269,
    "level": 7,
    "levelLabel": "7th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You step into the border regions of the Ethereal Plane, where it overlaps with your current plane. You remain in the Border Ethereal for the duration. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can perceive the plane you left, which looks gray, and you can't see anything there more than 60 feet away.\n\nWhile on the Ethereal Plane, you can affect and be affected only by creatures, objects, and effects on that plane. Creatures that aren't on the Ethereal Plane can't perceive or interact with you unless a feature gives them the ability to do so.\n\nWhen the spell ends, you return to the plane you left in the spot that corresponds to your space in the Border Ethereal. If you appear in an occupied space, you are shunted to the nearest unoccupied space and take Force damage equal to twice the number of feet you are moved.\n\nThis spell ends instantly if you cast it while you are on the Ethereal Plane or a plane that doesn't border it, such as one of the Outer Planes.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target up to three willing creatures (including yourself) for each spell slot level above 7. The creatures must be within 10 feet of you when you cast the spell."
  },
  {
    "id": "evards-black-tentacles",
    "name": "Evard's Black Tentacles",
    "source": "PHB'24",
    "page": 270,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a tentacle",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock, Great Old One (PHB'14) Warlock",
    "text": "Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in that area into Difficult Terrain.\n\nEach creature in that area makes a Strength saving throw. On a failed save, it takes 3d6 Bludgeoning damage, and it has the Restrained condition until the spell ends. A creature also makes that save if it enters the area or ends it turn there. A creature makes that save only once per turn.\n\nA Restrained creature can take an action to make a Strength (Athletics) check against your spell save DC, ending the condition on itself on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "expeditious-retreat",
    "name": "Expeditious Retreat",
    "source": "PHB'24",
    "page": 270,
    "level": 1,
    "levelLabel": "1st",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You take the Dash action, and until the spell ends, you can take that action again as a Bonus Action.",
    "atHigherLevels": ""
  },
  {
    "id": "eyebite",
    "name": "Eyebite",
    "source": "PHB'24",
    "page": 270,
    "level": 6,
    "levelLabel": "6th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "For the duration, your eyes become an inky void. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected by one of the following effects of your choice for the duration.\n\nOn each of your turns until the spell ends, you can take a Magic action to target another creature but can't target a creature again if it has succeeded on a save against this casting of the spell.\n\nAsleep. The target has the Unconscious condition. It wakes up if it takes any damage or if another creature takes an action to shake it awake.\n\nPanicked. The target has the Frightened condition. On each of its turns, the Frightened target must take the Dash action and move away from you by the safest and shortest route available. If the target moves to a space at least 60 feet away from you where it can't see you, this effect ends.\n\nSickened. The target has the Poisoned condition.",
    "atHigherLevels": ""
  },
  {
    "id": "fabricate",
    "name": "Fabricate",
    "source": "PHB'24",
    "page": 271,
    "level": 4,
    "levelLabel": "4th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Forge (XGE) Cleric, Forge (XGE) Cleric",
    "text": "You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, or clothes from flax or wool.\n\nChoose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot Cube or eight connected 5-foot Cubes) given a sufficient quantity of material. If you're working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium (contained within a 5-foot Cube). The quality of any fabricated objects is based on the quality of the raw materials.\n\nCreatures and magic items can't be created by this spell. You also can't use it to create items that require a high degree of skill—such as weapons and armor—unless you have proficiency with the type of Artisan's Tools used to craft such objects.",
    "atHigherLevels": ""
  },
  {
    "id": "faerie-fire",
    "name": "Faerie Fire",
    "source": "PHB'24",
    "page": 271,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Archfey (PHB'24) Warlock, Cartographer (EFA) Artificer, Lore (PHB'24) Bard, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Swarmkeeper (TCE) Ranger, Swarmkeeper (TCE) Ranger, Archfey (PHB'14) Warlock, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "Objects in a 20-foot Cube within range are outlined in blue, green, or violet light (your choice). Each creature in the Cube is also outlined if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed Dim Light in a 10-foot radius and can't benefit from the Invisible condition.\n\nAttack rolls against an affected creature or object have Advantage if the attacker can see it.",
    "atHigherLevels": ""
  },
  {
    "id": "false-life",
    "name": "False Life",
    "source": "PHB'24",
    "page": 271,
    "level": 1,
    "levelLabel": "1st",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of alcohol",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Grave (XGE) Cleric, Grave (XGE) Cleric, Undead (VRGR) Warlock, Undead (VRGR) Warlock, Undying (SCAG) Warlock, Undying (SCAG) Warlock",
    "text": "You gain 2d4 + 4 Temporary Hit Points.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You gain 5 additional Temporary Hit Points for each spell slot level above 1."
  },
  {
    "id": "fear",
    "name": "Fear",
    "source": "PHB'24",
    "page": 271,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a white feather",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Draconic (PHB'24) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Gloom Stalker (PHB'24) Ranger, Gloom Stalker (XGE) Ranger, Illusionist (PHB'24) Wizard, Conquest (XGE) Paladin, Conquest (XGE) Paladin",
    "text": "Each creature in a 30-foot Cone must succeed on a Wisdom saving throw or drop whatever it is holding and have the Frightened condition for the duration.\n\nA Frightened creature takes the Dash action and moves away from you by the safest route on each of its turns unless there is nowhere to move. If the creature ends its turn in a space where it doesn't have line of sight to you, the creature makes a Wisdom saving throw. On a successful save, the spell ends on that creature.",
    "atHigherLevels": ""
  },
  {
    "id": "feather-fall",
    "name": "Feather Fall",
    "source": "PHB'24",
    "page": 271,
    "level": 1,
    "levelLabel": "1st",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Reaction",
    "duration": "1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "M"
    ],
    "material": "a small feather or piece of down",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature.",
    "atHigherLevels": ""
  },
  {
    "id": "feign-death",
    "name": "Feign Death",
    "source": "PHB'24",
    "page": 271,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Necromancy",
    "ritual": true,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of graveyard dirt",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Undying (SCAG) Warlock, Undying (SCAG) Warlock",
    "text": "You touch a willing creature and put it into a cataleptic state that is indistinguishable from death.\n\nFor the duration, the target appears dead to outward inspection and to spells used to determine the target's status. The target has the Blinded and Incapacitated conditions, and its Speed is 0.\n\nThe target also has Resistance to all damage except Psychic damage, and it has Immunity to the Poisoned condition.",
    "atHigherLevels": ""
  },
  {
    "id": "find-familiar",
    "name": "Find Familiar",
    "source": "PHB'24",
    "page": 272,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": true,
    "castingTime": "1 Hr.",
    "duration": "Instantaneous",
    "range": "10 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "burning incense worth 10+ GP, which the spell consumes",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You gain the service of a familiar, a spirit that takes an animal form you choose: Bat, Cat, Frog, Hawk, Lizard, Octopus, Owl, Rat, Raven, Spider, Weasel, or another Beast that has a Challenge Rating of 0. Appearing in an unoccupied space within range, the familiar has the statistics of the chosen form, though it is a Celestial, Fey, or Fiend (your choice) instead of a Beast. Your familiar acts independently of you, but it obeys your commands.\n\nTelepathic Connection. While your familiar is within 100 feet of you, you can communicate with it telepathically. Additionally, as a Bonus Action, you can see through the familiar's eyes and hear what it hears until the start of your next turn, gaining the benefits of any special senses it has.\n\nFinally, when you cast a spell with a range of touch, your familiar can deliver the touch. Your familiar must be within 100 feet of you, and it must take a Reaction to deliver the touch when you cast the spell.\n\nCombat. The familiar is an ally to you and your allies. It rolls its own Initiative and acts on its own turn. A familiar can't attack, but it can take other actions as normal.\n\nDisappearance of the Familiar. When the familiar drops to 0 Hit Points, it disappears. It reappears after you cast this spell again. As a Magic action, you can temporarily dismiss the familiar to a pocket dimension. Alternatively, you can dismiss it forever. As a Magic action while it is temporarily dismissed, you can cause it to reappear in an unoccupied space within 30 feet of you. Whenever the familiar drops to 0 Hit Points or disappears into the pocket dimension, it leaves behind in its space anything it was wearing or carrying.\n\nOne Familiar Only. You can't have more than one familiar at a time. If you cast this spell while you have a familiar, you instead cause it to adopt a new eligible form.",
    "atHigherLevels": ""
  },
  {
    "id": "find-steed",
    "name": "Find Steed",
    "source": "PHB'24",
    "page": 272,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You summon an otherworldly being that appears as a loyal steed in an unoccupied space of your choice within range. This creature uses the Otherworldly Steed stat block. If you already have a steed from this spell, the steed is replaced by the new one.\n\nThe steed resembles a Large, rideable animal of your choice, such as a horse, a camel, a dire wolf, or an elk. Whenever you cast the spell, choose the steed's creature type—Celestial, Fey, or Fiend—which determines certain traits in the stat block.\n\nCombat. The steed is an ally to you and your allies. In combat, it shares your Initiative count, and it functions as a controlled mount while you ride it (as defined in the rules on mounted combat). If you have the Incapacitated condition, the steed takes its turn immediately after yours and acts independently, focusing on protecting you.\n\nDisappearance of the Steed. The steed disappears if it drops to 0 Hit Points or if you die. When it disappears, it leaves behind anything it was wearing or carrying. If you cast this spell again, you decide whether you summon the steed that disappeared or a different one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "find-traps",
    "name": "Find Traps",
    "source": "PHB'24",
    "page": 273,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You sense any trap within range that is within line of sight. A trap, for the purpose of this spell, includes any object or mechanism that was created to cause damage or other danger. Thus, the spell would sense the Alarm or Glyph of Warding spell or a mechanical pit trap, but it wouldn't reveal a natural weakness in the floor, an unstable ceiling, or a hidden sinkhole.\n\nThis spell reveals that a trap is present but not its location. You do learn the general nature of the danger posed by a trap you sense.",
    "atHigherLevels": ""
  },
  {
    "id": "find-the-path",
    "name": "Find the Path",
    "source": "PHB'24",
    "page": 273,
    "level": 6,
    "levelLabel": "6th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Concentration, up to 1 day",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a set of divination tools—such as cards or runes—worth 100+ GP",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You magically sense the most direct physical route to a location you name. You must be familiar with the location, and the spell fails if you name a destination on another plane of existence, a moving destination (such as a mobile fortress), or an unspecific destination (such as \"a green dragon's lair\").\n\nFor the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies. Whenever you face a choice of paths along the way there, you know which path is the most direct.",
    "atHigherLevels": ""
  },
  {
    "id": "finger-of-death",
    "name": "Finger of Death",
    "source": "PHB'24",
    "page": 273,
    "level": 7,
    "levelLabel": "7th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You unleash negative energy toward a creature you can see within range. The target makes a Constitution saving throw, taking 7d8 + 30 Necrotic damage on a failed save or half as much damage on a successful one.\n\nA Humanoid killed by this spell rises at the start of your next turn as a Zombie that follows your verbal orders.",
    "atHigherLevels": ""
  },
  {
    "id": "fire-bolt",
    "name": "Fire Bolt",
    "source": "PHB'24",
    "page": 274,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn't being worn or carried.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
  },
  {
    "id": "fire-shield",
    "name": "Fire Shield",
    "source": "PHB'24",
    "page": 274,
    "level": 4,
    "levelLabel": "4th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of phosphorus or a firefly",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Spellfire (FRHoF) Sorcerer, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock, War (PHB'24) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "Wispy flames wreathe your body for the duration, shedding Bright Light in a 10-foot radius and Dim Light for an additional 10 feet.\n\nThe flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you Resistance to Cold damage, and the chill shield grants you Resistance to Fire damage.\n\nIn addition, whenever a creature within 5 feet of you hits you with a melee attack roll, the shield erupts with flame. The attacker takes 2d8 Fire damage from a warm shield or 2d8 Cold damage from a chill shield.",
    "atHigherLevels": ""
  },
  {
    "id": "fire-storm",
    "name": "Fire Storm",
    "source": "PHB'24",
    "page": 275,
    "level": 7,
    "levelLabel": "7th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "A storm of fire appears within range. The area of the storm consists of up to ten 10-foot Cubes, which you arrange as you like. Each Cube must be contiguous with at least one other Cube. Each creature in the area makes a Dexterity saving throw, taking 7d10 Fire damage on a failed save or half as much damage on a successful one.\n\nFlammable objects in the area that aren't being worn or carried start burning.",
    "atHigherLevels": ""
  },
  {
    "id": "fireball",
    "name": "Fireball",
    "source": "PHB'24",
    "page": 274,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a ball of bat guano and sulfur",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Land (Arid Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\n\nFlammable objects in the area that aren't being worn or carried start burning.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
  },
  {
    "id": "flame-blade",
    "name": "Flame Blade",
    "source": "PHB'24",
    "page": 275,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a sumac leaf",
    "classes": [
      "Druid",
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard",
    "text": "You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. If you let go of the blade, it disappears, but you can evoke it again as a Bonus Action.\n\nAs a Magic action, you can make a melee spell attack with the fiery blade. On a hit, the target takes Fire damage equal to 3d6 plus your spellcasting ability modifier.\n\nThe flaming blade sheds Bright Light in a 10-foot radius and Dim Light for an additional 10 feet.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
  },
  {
    "id": "flame-strike",
    "name": "Flame Strike",
    "source": "PHB'24",
    "page": 275,
    "level": 5,
    "levelLabel": "5th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of sulfur",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Wildfire (TCE) Druid, Wildfire (TCE) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Light (PHB'14) Cleric, Light (PHB'24) Cleric, Devotion (PHB'14) Paladin, Devotion (PHB'24) Paladin, Glory (TCE) Paladin, Spellfire (FRHoF) Sorcerer, Celestial (XGE) Warlock, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock, War (PHB'14) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "A vertical column of brilliant fire roars down from above. Each creature in a 10-foot-radius, 40-foot-high Cylinder centered on a point within range makes a Dexterity saving throw, taking 5d6 Fire damage and 5d6 Radiant damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Fire damage and the Radiant damage increase by 1d6 for each spell slot level above 5."
  },
  {
    "id": "flaming-sphere",
    "name": "Flaming Sphere",
    "source": "PHB'24",
    "page": 275,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a ball of wax",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Light (PHB'14) Cleric, Celestial (XGE) Warlock",
    "text": "You create a 5-foot-diameter sphere of fire in an unoccupied space on the ground within range. It lasts for the duration. Any creature that ends its turn within 5 feet of the sphere makes a Dexterity saving throw, taking 2d6 Fire damage on a failed save or half as much damage on a successful one.\n\nAs a Bonus Action, you can move the sphere up to 30 feet, rolling it along the ground. If you move the sphere into a creature's space, that creature makes the save against the sphere, and the sphere stops moving for the turn.\n\nWhen you move the sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet wide. Flammable objects that aren't being worn or carried start burning if touched by the sphere, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
  },
  {
    "id": "flesh-to-stone",
    "name": "Flesh to Stone",
    "source": "PHB'24",
    "page": 275,
    "level": 6,
    "levelLabel": "6th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a cockatrice feather",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You attempt to turn one creature that you can see within range into stone. The target makes a Constitution saving throw. On a failed save, it has the Restrained condition for the duration. On a successful save, its Speed is 0 until the start of your next turn. Constructs automatically succeed on the save.\n\nA Restrained target makes another Constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails its saves three times, it is turned to stone and has the Petrified condition for the duration. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind.\n\nIf you maintain your Concentration on this spell for the entire possible duration, the target is Petrified until the condition is ended by Greater Restoration or similar magic.",
    "atHigherLevels": ""
  },
  {
    "id": "fly",
    "name": "Fly",
    "source": "PHB'24",
    "page": 276,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a feather",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Draconic (PHB'24) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Noble Genies (FRHoF) Paladin",
    "text": "You touch a willing creature. For the duration, the target gains a Fly Speed of 60 feet and can hover. When the spell ends, the target falls if it is still aloft unless it can stop the fall.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 3."
  },
  {
    "id": "fog-cloud",
    "name": "Fog Cloud",
    "source": "PHB'24",
    "page": 276,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Polar Land) (PHB'24) Druid, Sea (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Genie (Marid) (TCE) Warlock, Genie (Marid) (TCE) Warlock",
    "text": "You create a 20-foot-radius Sphere of fog centered on a point within range. The Sphere is Heavily Obscured. It lasts for the duration or until a strong wind (such as one created by Gust of Wind) disperses it.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The fog's radius increases by 20 feet for each spell slot level above 1."
  },
  {
    "id": "forbiddance",
    "name": "Forbiddance",
    "source": "PHB'24",
    "page": 276,
    "level": 6,
    "levelLabel": "6th",
    "school": "Abjuration",
    "ritual": true,
    "castingTime": "10 Min.",
    "duration": "1 day",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "ruby dust worth 1,000+ GP",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. For the duration, creatures can't teleport into the area or use portals, such as those created by the Gate spell, to enter the area. The spell proofs the area against planar travel, and therefore prevents creatures from accessing the area by way of the Astral Plane, the Ethereal Plane, the Feywild, the Shadowfell, or the Plane Shift spell.\n\nIn addition, the spell damages types of creatures that you choose when you cast it. Choose one or more of the following: Aberrations, Celestials, Elementals, Fey, Fiends, and Undead. When a creature of a chosen type enters the spell's area for the first time on a turn or ends its turn there, the creature takes 5d10 Radiant or Necrotic damage (your choice when you cast this spell).\n\nYou can designate a password when you cast the spell. A creature that speaks the password as it enters the area takes no damage from the spell.\n\nThe spell's area can't overlap with the area of another Forbiddance spell. If you cast Forbiddance every day for 30 days in the same location, the spell lasts until it is dispelled, and the Material components are consumed on the last casting.",
    "atHigherLevels": ""
  },
  {
    "id": "forcecage",
    "name": "Forcecage",
    "source": "PHB'24",
    "page": 276,
    "level": 7,
    "levelLabel": "7th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "100 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "ruby dust worth 1,500+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "An immobile, Invisible, Cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage or a solid box, as you choose.\n\nA prison in the shape of a cage can be up to 20 feet on a side and is made from 1/2-inch diameter bars spaced 1/2 inch apart. A prison in the shape of a box can be up to 10 feet on a side, creating a solid barrier that prevents any matter from passing through it and blocking any spells cast into or out from the area.\n\nWhen you cast the spell, any creature that is completely inside the cage's area is trapped. Creatures only partially within the area, or those too large to fit inside it, are pushed away from the center of the area until they are completely outside it.\n\nA creature inside the cage can't leave it by nonmagical means. If the creature tries to use teleportation or interplanar travel to leave, it must first make a Charisma saving throw. On a successful save, the creature can use that magic to exit the cage. On a failed save, the creature doesn't exit the cage and wastes the spell or effect. The cage also extends into the Ethereal Plane, blocking ethereal travel.\n\nThis spell can't be dispelled by Dispel Magic.",
    "atHigherLevels": ""
  },
  {
    "id": "foresight",
    "name": "Foresight",
    "source": "PHB'24",
    "page": 276,
    "level": 9,
    "levelLabel": "9th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "8 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a hummingbird feather",
    "classes": [
      "Bard",
      "Druid",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Diviner (PHB'24) Wizard",
    "text": "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target has Advantage on D20 Tests, and other creatures have Disadvantage on attack rolls against it. The spell ends early if you cast it again.",
    "atHigherLevels": ""
  },
  {
    "id": "fount-of-moonlight",
    "name": "Fount of Moonlight",
    "source": "PHB'24",
    "page": 277,
    "level": 4,
    "levelLabel": "4th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Moon (PHB'24) Druid",
    "text": "A cool light wreathes your body for the duration, emitting Bright Light in a 20-foot radius and Dim Light for an additional 20 feet.\n\nUntil the spell ends, you have Resistance to Radiant damage, and your melee attacks deal an extra 2d6 Radiant damage on a hit.\n\nIn addition, immediately after you take damage from a creature you can see within 60 feet of yourself, you can take a Reaction to force the creature to make a Constitution saving throw. On a failed save, the creature has the Blinded condition until the end of your next turn.",
    "atHigherLevels": ""
  },
  {
    "id": "freedom-of-movement",
    "name": "Freedom of Movement",
    "source": "PHB'24",
    "page": 277,
    "level": 4,
    "levelLabel": "4th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a leather strap",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Arctic) (PHB'14) Druid, Land (Coast) (PHB'14) Druid, Land (Forest) (PHB'14) Druid, Land (Grassland) (PHB'14) Druid, Land (Swamp) (PHB'14) Druid, Land (Temperate Land) (PHB'24) Druid, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Devotion (PHB'14) Paladin, Devotion (PHB'24) Paladin, Glory (TCE) Paladin, Glory (PHB'24) Paladin, War (PHB'14) Cleric, War (PHB'24) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "You touch a willing creature. For the duration, the target's movement is unaffected by Difficult Terrain, and spells and other magical effects can neither reduce the target's Speed nor cause the target to have the Paralyzed or Restrained conditions. The target also has a Swim Speed equal to its Speed.\n\nIn addition, the target can spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature imposing the Grappled condition on it.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4."
  },
  {
    "id": "friends",
    "name": "Friends",
    "source": "PHB'24",
    "page": 277,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "10 feet",
    "components": [
      "S",
      "M"
    ],
    "material": "some makeup",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You magically emanate a sense of friendship toward one creature you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target succeeds automatically if it isn't a Humanoid, if you're fighting it, or if you have cast this spell on it within the past 24 hours.\n\nThe spell ends early if the target takes damage or if you make an attack roll, deal damage, or force anyone to make a saving throw. When the spell ends, the target knows it was Charmed by you.",
    "atHigherLevels": ""
  },
  {
    "id": "gaseous-form",
    "name": "Gaseous Form",
    "source": "PHB'24",
    "page": 277,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of gauze",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Spores (TCE) Druid, Spores (TCE) Druid, Land (Underdark) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Noble Genies (FRHoF) Paladin, Swarmkeeper (TCE) Ranger, Swarmkeeper (TCE) Ranger",
    "text": "A willing creature you touch shape-shifts, along with everything it's wearing and carrying, into a misty cloud for the duration. The spell ends on the target if it drops to 0 Hit Points or if it takes a Magic action to end the spell on itself.\n\nWhile in this form, the target's only method of movement is a Fly Speed of 10 feet, and it can hover. The target can enter and occupy the space of another creature. The target has Resistance to Bludgeoning, Piercing, and Slashing damage; it has Immunity to the Prone condition; and it has Advantage on Strength, Dexterity, and Constitution saving throws. The target can pass through narrow openings, but it treats liquids as though they were solid surfaces.\n\nThe target can't talk or manipulate objects, and any objects it was carrying or holding can't be dropped, used, or otherwise interacted with. Finally, the target can't attack or cast spells.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 3."
  },
  {
    "id": "gate",
    "name": "Gate",
    "source": "PHB'24",
    "page": 277,
    "level": 9,
    "levelLabel": "9th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a diamond worth 5,000+ GP",
    "classes": [
      "Cleric",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. You can orient the portal in any direction you choose. The portal lasts for the duration, and the portal's destination is visible through it.\n\nThe portal has a front and a back on each plane where it appears. Travel through the portal is possible only by moving through its front. Anything that does so is instantly transported to the other plane, appearing in the unoccupied space nearest to the portal.\n\nDeities and other planar rulers can prevent portals created by this spell from opening in their presence or anywhere within their domains.\n\nWhen you cast this spell, you can speak the name of a specific creature (a pseudonym, title, or nickname doesn't work). If that creature is on a plane other than the one you are on, the portal opens next to the named creature and transports it to the nearest unoccupied space on your side of the portal. You gain no special power over the creature, and it is free to act as the DM deems appropriate. It might leave, attack you, or help you.",
    "atHigherLevels": ""
  },
  {
    "id": "geas",
    "name": "Geas",
    "source": "PHB'24",
    "page": 278,
    "level": 5,
    "levelLabel": "5th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "30 days",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Fiend (PHB'24) Warlock, Crown (SCAG) Paladin, Crown (SCAG) Paladin",
    "text": "You give a verbal command to a creature that you can see within range, ordering it to carry out some service or refrain from an action or a course of activity as you decide. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target automatically succeeds if it can't understand your command.\n\nWhile Charmed, the creature takes 5d10 Psychic damage if it acts in a manner directly counter to your command. It takes this damage no more than once each day.\n\nYou can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends.\n\nA Remove Curse, Greater Restoration, or Wish spell ends this spell.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. If you use a level 7 or 8 spell slot, the duration is 365 days. If you use a level 9 spell slot, the spell lasts until it is ended by one of the spells mentioned above."
  },
  {
    "id": "gentle-repose",
    "name": "Gentle Repose",
    "source": "PHB'24",
    "page": 278,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Necromancy",
    "ritual": true,
    "castingTime": "Action",
    "duration": "10 days",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "2 Copper Pieces, which the spell consumes",
    "classes": [
      "Cleric",
      "Paladin",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Spores (TCE) Druid, Spores (TCE) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Grave (XGE) Cleric, Grave (XGE) Cleric",
    "text": "You touch a corpse or other remains. For the duration, the target is protected from decay and can't become Undead.\n\nThe spell also effectively extends the time limit on raising the target from the dead, since days spent under the influence of this spell don't count against the time limit of spells such as Raise Dead.",
    "atHigherLevels": ""
  },
  {
    "id": "giant-insect",
    "name": "Giant Insect",
    "source": "PHB'24",
    "page": 279,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You summon a giant centipede, spider, or wasp (chosen when you cast the spell). It manifests in an unoccupied space you can see within range and uses the Giant Insect stat block. The form you choose determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "glibness",
    "name": "Glibness",
    "source": "PHB'24",
    "page": 279,
    "level": 8,
    "levelLabel": "8th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful.",
    "atHigherLevels": ""
  },
  {
    "id": "globe-of-invulnerability",
    "name": "Globe of Invulnerability",
    "source": "PHB'24",
    "page": 279,
    "level": 6,
    "levelLabel": "6th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a glass bead",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "An immobile, shimmering barrier appears in a 10-foot Emanation around you and remains for the duration.\n\nAny spell of level 5 or lower cast from outside the barrier can't affect anything within it. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them. Similarly, the area within the barrier is excluded from areas of effect created by such spells.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The barrier blocks spells of 1 level higher for each spell slot level above 6."
  },
  {
    "id": "glyph-of-warding",
    "name": "Glyph of Warding",
    "source": "PHB'24",
    "page": 279,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "Until dispelled or triggered",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "powdered diamond worth 200+ GP, which the spell consumes",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You inscribe a glyph that later unleashes a magical effect. You inscribe it either on a surface (such as a table or a section of floor) or within an object that can be closed (such as a book or chest) to conceal the glyph. The glyph can cover an area no larger than 10 feet in diameter. If the surface or object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered.\n\nThe glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice.\n\nWhen you inscribe the glyph, you set its trigger and choose whether it's an explosive rune or a spell glyph, as explained below.\n\nSet the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph. Once a glyph is triggered, this spell ends.\n\nYou can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don't trigger the glyph, such as those who say a certain password.\n\nExplosive Rune. When triggered, the glyph erupts with magical energy in a 20-foot-radius Sphere centered on the glyph. Each creature in the area makes a Dexterity saving throw. A creature takes 5d8 Acid, Cold, Fire, Lightning, or Thunder damage (your choice when you create the glyph) on a failed save or half as much damage on a successful one.\n\nSpell Glyph. You can store a prepared spell of level 3 or lower in the glyph by casting it as part of creating the glyph. The spell must target a single creature or an area. The spell being stored has no immediate effect when cast in this way.\n\nWhen the glyph is triggered, the stored spell takes effect. If the spell has a target, it targets the creature that triggered the glyph. If the spell affects an area, the area is centered on that creature. If the spell summons Hostile creatures or creates harmful objects or traps, they appear as close as possible to the intruder and attack it. If the spell requires Concentration, it lasts until the end of its full duration.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage of an explosive rune increases by 1d8 for each spell slot level above 3. If you create a spell glyph, you can store any spell of up to the same level as the spell slot you use for the Glyph of Warding."
  },
  {
    "id": "goodberry",
    "name": "Goodberry",
    "source": "PHB'24",
    "page": 280,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a sprig of mistletoe",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard",
    "text": "Ten berries appear in your hand and are infused with magic for the duration. A creature can take a Bonus Action to eat one berry. Eating a berry restores 1 Hit Point, and the berry provides enough nourishment to sustain a creature for one day.\n\nUneaten berries disappear when the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "grasping-vine",
    "name": "Grasping Vine",
    "source": "PHB'24",
    "page": 280,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Nature (PHB'14) Cleric, Nature (PHB'14) Cleric",
    "text": "You conjure a vine that sprouts from a surface in an unoccupied space that you can see within range. The vine lasts for the duration.\n\nMake a melee spell attack against a creature within 30 feet of the vine. On a hit, the target takes 4d8 Bludgeoning damage and is pulled up to 30 feet toward the vine; if the target is Huge or smaller, it has the Grappled condition (escape DC equal to your spell save DC). The vine can grapple only one creature at a time, and you can cause the vine to release a Grappled creature (no action required).\n\nAs a Bonus Action on your later turns, you can repeat the attack against a creature within 30 feet of the vine.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The number of creatures the vine can grapple increases by one for each spell slot level above 4."
  },
  {
    "id": "grease",
    "name": "Grease",
    "source": "PHB'24",
    "page": 280,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of pork rind or butter",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "Nonflammable grease covers the ground in a 10-foot square centered on a point within range and turns it into Difficult Terrain for the duration.\n\nWhen the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or have the Prone condition. A creature that enters the area or ends its turn there must also succeed on that save or fall Prone.",
    "atHigherLevels": ""
  },
  {
    "id": "greater-invisibility",
    "name": "Greater Invisibility",
    "source": "PHB'24",
    "page": 281,
    "level": 4,
    "levelLabel": "4th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Archfey (PHB'24) Warlock, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Land (Underdark) (PHB'14) Druid, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Gloom Stalker (XGE) Ranger, Gloom Stalker (PHB'24) Ranger, Illusionist (PHB'24) Wizard, Archfey (PHB'14) Warlock, Genie (Djinni) (TCE) Warlock, Genie (Djinni) (TCE) Warlock, Undead (VRGR) Warlock, Undead (VRGR) Warlock, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "A creature you touch has the Invisible condition until the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "greater-restoration",
    "name": "Greater Restoration",
    "source": "PHB'24",
    "page": 281,
    "level": 5,
    "levelLabel": "5th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "diamond dust worth 100+ GP, which the spell consumes",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'24) Cleric, Peace (TCE) Cleric, Peace (TCE) Cleric, Spellfire (FRHoF) Sorcerer, Celestial (XGE) Warlock",
    "text": "You touch a creature and magically remove one of the following effects from it:\n\n1 Exhaustion levelThe Charmed or Petrified conditionA curse, including the target's Attunement to a cursed magic itemAny reduction to one of the target's ability scoresAny reduction to the target's Hit Point maximum",
    "atHigherLevels": ""
  },
  {
    "id": "guardian-of-faith",
    "name": "Guardian of Faith",
    "source": "PHB'24",
    "page": 281,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "30 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'14) Cleric, Light (PHB'14) Cleric, Devotion (PHB'14) Paladin, Devotion (PHB'24) Paladin, Crown (SCAG) Paladin, Crown (SCAG) Paladin, Celestial (XGE) Warlock, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "A Large spectral guardian appears and hovers for the duration in an unoccupied space that you can see within range. The guardian occupies that space and is invulnerable, and it appears in a form appropriate for your deity or pantheon.\n\nAny enemy that moves to a space within 10 feet of the guardian for the first time on a turn or starts its turn there makes a Dexterity saving throw, taking 20 Radiant damage on a failed save or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage.",
    "atHigherLevels": ""
  },
  {
    "id": "guards-and-wards",
    "name": "Guards and Wards",
    "source": "PHB'24",
    "page": 282,
    "level": 6,
    "levelLabel": "6th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "24 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a silver rod worth 10+ GP",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You create a ward that protects up to 2,500 square feet of floor space. The warded area can be up to 20 feet tall, and you shape it as one 50-foot square, one hundred 5-foot squares that are contiguous, or twenty-five 10-foot squares that are contiguous.\n\nWhen you cast this spell, you can specify individuals that are unaffected by the spell's effects. You can also specify a password that, when spoken aloud within 5 feet of the warded area, makes the speaker immune to its effects.\n\nThe spell creates the effects below within the warded area. Dispel Magic has no effect on Guards and Wards itself, but each of the following effects can be dispelled. If all four are dispelled, Guards and Wards ends. If you cast the spell every day for 365 days on the same area, the spell thereafter lasts until all its effects are dispelled.\n\nCorridors. Fog fills all the warded corridors, making them Heavily Obscured. In addition, at each intersection or branching passage offering a choice of direction, there is a 50 percent chance that a creature other than you believes it is going in the opposite direction from the one it chooses.\n\nDoors. All doors in the warded area are magically locked, as if sealed by the Arcane Lock spell. In addition, you can cover up to ten doors with an illusion to make them appear as plain sections of wall.\n\nStairs. Webs fill all stairs in the warded area from top to bottom, as in the Web spell. These strands regrow in 10 minutes if they are destroyed while Guards and Wards lasts.\n\nOther Spell Effect. Place one of the following magical effects within the warded area:\n\nDancing Lights in four corridors, with a simple program that the lights repeat as long as Guards and Wards lastsMagic Mouth in two locationsStinking Cloud in two locations (the vapors return within 10 minutes if dispersed while Guards and Wards lasts)Gust of Wind in one corridor or room (the wind blows continuously while the spell lasts)Suggestion in one 5-foot square; any creature that enters that square receives the suggestion mentally",
    "atHigherLevels": ""
  },
  {
    "id": "guidance",
    "name": "Guidance",
    "source": "PHB'24",
    "page": 282,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Stars (TCE) Druid, Land (PHB'14) Druid, Stars (PHB'24) Druid, Lore (PHB'24) Bard, Spirits (VRGR) Bard, Spirits (VRGR) Bard, Moon (FRHoF) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You touch a willing creature and choose a skill. Until the spell ends, the creature adds 1d4 to any ability check using the chosen skill.",
    "atHigherLevels": ""
  },
  {
    "id": "guiding-bolt",
    "name": "Guiding Bolt",
    "source": "PHB'24",
    "page": 282,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 round",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Cartographer (EFA) Artificer, Celestial (PHB'24) Warlock, Stars (TCE) Druid, Stars (PHB'24) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Glory (PHB'24) Paladin, Glory (TCE) Paladin, Spellfire (FRHoF) Sorcerer, Celestial (XGE) Warlock, War (PHB'24) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "You hurl a bolt of light toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 4d6 Radiant damage, and the next attack roll made against it before the end of your next turn has Advantage.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "gust-of-wind",
    "name": "Gust of Wind",
    "source": "PHB'24",
    "page": 282,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a legume seed",
    "classes": [
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Sea (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock, Genie (Djinni) (TCE) Warlock, Genie (Djinni) (TCE) Warlock",
    "text": "A Line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the duration. Each creature in the Line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction following the Line. A creature that ends its turn in the Line must make the same save.\n\nAny creature in the Line must spend 2 feet of movement for every 1 foot it moves when moving closer to you.\n\nThe gust disperses gas or vapor, and it extinguishes candles and similar unprotected flames in the area. It causes protected flames, such as those of lanterns, to dance wildly and has a 50 percent chance to extinguish them.\n\nAs a Bonus Action on your later turns, you can change the direction in which the Line blasts from you.",
    "atHigherLevels": ""
  },
  {
    "id": "hail-of-thorns",
    "name": "Hail of Thorns",
    "source": "PHB'24",
    "page": 283,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "As you hit the creature, this spell creates a rain of thorns that sprouts from your Ranged weapon or ammunition. The target of the attack and each creature within 5 feet of it make a Dexterity saving throw, taking 1d10 Piercing damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1."
  },
  {
    "id": "hallow",
    "name": "Hallow",
    "source": "PHB'24",
    "page": 283,
    "level": 5,
    "levelLabel": "5th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "24 Hr.",
    "duration": "Until dispelled",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "incense worth 1,000+ GP, which the spell consumes",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Fiend (PHB'14) Warlock",
    "text": "You touch a point and infuse an area around it with holy or unholy power. The area can have a radius up to 60 feet, and the spell fails if the radius includes an area already under the effect of Hallow. The affected area has the following effects.\n\nHallowed Ward. Choose any of these creature types: Aberration, Celestial, Elemental, Fey, Fiend, or Undead. Creatures of the chosen types can't willingly enter the area, and any creature that is possessed by or that has the Charmed or Frightened condition from such creatures isn't possessed, Charmed, or Frightened by them while in the area.\n\nExtra Effect. You bind an extra effect to the area from the list below:\n\nCourage. Creatures of any types you choose can't gain the Frightened condition while in the area.\n\nDarkness. Darkness fills the area. Normal light, as well as magical light created by spells of a level lower than this spell, can't illuminate the area.\n\nDaylight. Bright light fills the area. Magical Darkness created by spells of a level lower than this spell can't extinguish the light.\n\nPeaceful Rest. Dead bodies interred in the area can't be turned into Undead.\n\nExtradimensional Interference. Creatures of any types you choose can't enter or exit the area using teleportation or interplanar travel.\n\nFear. Creatures of any types you choose have the Frightened condition while in the area.\n\nResistance. Creatures of any types you choose have Resistance to one damage type of your choice while in the area.\n\nSilence. No sound can emanate from within the area, and no sound can reach into it.\n\nTongues. Creatures of any types you choose can communicate with any other creature in the area even if they don't share a common language.\n\nVulnerability. Creatures of any types you choose have Vulnerability to one damage type of your choice while in the area.",
    "atHigherLevels": ""
  },
  {
    "id": "hallucinatory-terrain",
    "name": "Hallucinatory Terrain",
    "source": "PHB'24",
    "page": 283,
    "level": 4,
    "levelLabel": "4th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "24 hours",
    "range": "300 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a mushroom",
    "classes": [
      "Bard",
      "Druid",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Land (Desert) (PHB'14) Druid, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Illusionist (PHB'24) Wizard, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer",
    "text": "You make natural terrain in a 150-foot Cube in range look, sound, and smell like another sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren't changed.\n\nThe tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to notice the illusion. If the difference isn't obvious by touch, a creature examining the illusion can take the Study action to make an Intelligence (Investigation) check against your spell save DC to disbelieve it. If a creature discerns that the terrain is illusory, the creature sees a vague image superimposed on the real terrain.",
    "atHigherLevels": ""
  },
  {
    "id": "harm",
    "name": "Harm",
    "source": "PHB'24",
    "page": 283,
    "level": 6,
    "levelLabel": "6th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You unleash virulent magic on a creature you can see within range. The target makes a Constitution saving throw. On a failed save, it takes 14d6 Necrotic damage, and its Hit Point maximum is reduced by an amount equal to the Necrotic damage it took. On a successful save, it takes half as much damage only. This spell can't reduce a target's Hit Point maximum below 1.",
    "atHigherLevels": ""
  },
  {
    "id": "haste",
    "name": "Haste",
    "source": "PHB'24",
    "page": 284,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a shaving of licorice root",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Grassland) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Horizon Walker (XGE) Ranger, Horizon Walker (XGE) Ranger, Glory (PHB'24) Paladin, Glory (TCE) Paladin, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "Choose a willing creature that you can see within range. Until the spell ends, the target's Speed is doubled, it gains a +2 bonus to Armor Class, it has Advantage on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used to take only the Attack (one attack only), Dash, Disengage, Hide, or Utilize action.\n\nWhen the spell ends, the target is Incapacitated and has a Speed of 0 until the end of its next turn, as a wave of lethargy washes over it.",
    "atHigherLevels": ""
  },
  {
    "id": "heal",
    "name": "Heal",
    "source": "PHB'24",
    "page": 284,
    "level": 6,
    "levelLabel": "6th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "Choose a creature that you can see within range. Positive energy washes through the target, restoring 70 Hit Points. This spell also ends the Blinded, Deafened, and Poisoned conditions on the target.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The healing increases by 10 for each spell slot level above 6."
  },
  {
    "id": "healing-word",
    "name": "Healing Word",
    "source": "PHB'24",
    "page": 284,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Cartographer (EFA) Artificer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "A creature of your choice that you can see within range regains Hit Points equal to 2d4 plus your spellcasting ability modifier.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The healing increases by 2d4 for each spell slot level above 1."
  },
  {
    "id": "heat-metal",
    "name": "Heat Metal",
    "source": "PHB'24",
    "page": 284,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a piece of iron and a flame",
    "classes": [
      "Artificer",
      "Bard",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Forge (XGE) Cleric, Forge (XGE) Cleric",
    "text": "Choose a manufactured metal object, such as a metal weapon or a suit of Heavy or Medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 Fire damage when you cast the spell. Until the spell ends, you can take a Bonus Action on each of your later turns to deal this damage again if the object is within range.\n\nIf a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a Constitution saving throw or drop the object if it can. If it doesn't drop the object, it has Disadvantage on attack rolls and ability checks until the start of your next turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."
  },
  {
    "id": "hellish-rebuke",
    "name": "Hellish Rebuke",
    "source": "PHB'24",
    "page": 284,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Reaction",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin",
    "text": "The creature that damaged you is momentarily surrounded by green flames. It makes a Dexterity saving throw, taking 2d10 Fire damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1."
  },
  {
    "id": "heroes-feast",
    "name": "Heroes' Feast",
    "source": "PHB'24",
    "page": 284,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a gem-encrusted bowl worth 1,000+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You conjure a feast that appears on a surface in an unoccupied 10-foot Cube next to you. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve creatures can partake of the feast.\n\nA creature that partakes gains several benefits, which last for 24 hours. The creature has Resistance to Poison damage, and it has Immunity to the Frightened and Poisoned conditions. Its Hit Point maximum also increases by 2d10, and it gains the same number of Hit Points.",
    "atHigherLevels": ""
  },
  {
    "id": "heroism",
    "name": "Heroism",
    "source": "PHB'24",
    "page": 285,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Glory (TCE) Paladin, Glory (PHB'24) Paladin, Order (TCE) Cleric, Order (TCE) Cleric, Peace (TCE) Cleric, Peace (TCE) Cleric",
    "text": "A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to the Frightened condition and gains Temporary Hit Points equal to your spellcasting ability modifier at the start of each of its turns.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
  },
  {
    "id": "hex",
    "name": "Hex",
    "source": "PHB'24",
    "page": 285,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "the petrified eye of a newt",
    "classes": [
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Great Old One (PHB'24) Warlock",
    "text": "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack roll. Also, choose one ability when you cast the spell. The target has Disadvantage on ability checks made with the chosen ability.\n\nIf the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action on a later turn to curse a new creature.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 2 (up to 4 hours), 3-4 (up to 8 hours), or 5+ (24 hours)."
  },
  {
    "id": "hold-monster",
    "name": "Hold Monster",
    "source": "PHB'24",
    "page": 285,
    "level": 5,
    "levelLabel": "5th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a straight piece of iron",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Sea (PHB'24) Druid, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Monster Slayer (XGE) Ranger, Monster Slayer (XGE) Ranger, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Vengeance (PHB'14) Paladin, Vengeance (PHB'24) Paladin, Watchers (TCE) Paladin, Watchers (TCE) Paladin, War (PHB'14) Cleric, War (PHB'24) Cleric",
    "text": "Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 5."
  },
  {
    "id": "hold-person",
    "name": "Hold Person",
    "source": "PHB'24",
    "page": 286,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a straight piece of iron",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Polar Land) (PHB'24) Druid, Land (Arctic) (PHB'14) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Conquest (XGE) Paladin, Conquest (XGE) Paladin, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Order (TCE) Cleric, Order (TCE) Cleric, Winter Walker (FRHoF) Ranger",
    "text": "Choose a Humanoid that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional Humanoid for each spell slot level above 2."
  },
  {
    "id": "holy-aura",
    "name": "Holy Aura",
    "source": "PHB'24",
    "page": 286,
    "level": 8,
    "levelLabel": "8th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a reliquary worth 1,000+ GP",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "For the duration, you emit an aura in a 30-foot Emanation. While in the aura, creatures of your choice have Advantage on all saving throws, and other creatures have Disadvantage on attack rolls against them. In addition, when a Fiend or an Undead hits an affected creature with a melee attack roll, the attacker must succeed on a Constitution saving throw or have the Blinded condition until the end of its next turn.",
    "atHigherLevels": ""
  },
  {
    "id": "hunger-of-hadar",
    "name": "Hunger of Hadar",
    "source": "PHB'24",
    "page": 286,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pickled tentacle",
    "classes": [
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Great Old One (PHB'24) Warlock",
    "text": "You open a gateway to the Far Realm, a region infested with unspeakable horrors. A 20-foot-radius Sphere of Darkness appears, centered on a point within range and lasting for the duration. The Sphere is Difficult Terrain, and it is filled with strange whispers and slurping noises, which can be heard up to 30 feet away. No light, magical or otherwise, can illuminate the area, and creatures fully within it have the Blinded condition.\n\nAny creature that starts its turn in the area takes 2d6 Cold damage. Any creature that ends its turn there must succeed on a Dexterity saving throw or take 2d6 Acid damage from otherworldly tentacles.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Cold or Acid damage (your choice) increases by 1d6 for each spell slot level above 3."
  },
  {
    "id": "hunters-mark",
    "name": "Hunter's Mark",
    "source": "PHB'24",
    "page": 287,
    "level": 1,
    "levelLabel": "1st",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Vengeance (PHB'14) Paladin, Vengeance (PHB'24) Paladin",
    "text": "You magically mark one creature you can see within range as your quarry. Until the spell ends, you deal an extra 1d6 Force damage to the target whenever you hit it with an attack roll. You also have Advantage on any Wisdom (Perception or Survival) check you make to find it.\n\nIf the target drops to 0 Hit Points before this spell ends, you can take a Bonus Action to move the mark to a new creature you can see within range.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Your Concentration can last longer with a spell slot of level 3-4 (up to 8 hours) or 5+ (up to 24 hours)."
  },
  {
    "id": "hypnotic-pattern",
    "name": "Hypnotic Pattern",
    "source": "PHB'24",
    "page": 287,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "S",
      "M"
    ],
    "material": "a pinch of confetti",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Trickery (PHB'24) Cleric",
    "text": "You create a twisting pattern of colors in a 30-foot Cube within range. The pattern appears for a moment and vanishes. Each creature in the area who can see the pattern must succeed on a Wisdom saving throw or have the Charmed condition for the duration. While Charmed, the creature has the Incapacitated condition and a Speed of 0.\n\nThe spell ends for an affected creature if it takes any damage or if someone else uses an action to shake the creature out of its stupor.",
    "atHigherLevels": ""
  },
  {
    "id": "ice-knife",
    "name": "Ice Knife",
    "source": "PHB'24",
    "page": 287,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "S",
      "M"
    ],
    "material": "a drop of water or a piece of ice",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Winter Walker (FRHoF) Ranger",
    "text": "You create a shard of ice and fling it at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Piercing damage. Hit or miss, the shard then explodes. The target and each creature within 5 feet of it must succeed on a Dexterity saving throw or take 2d6 Cold damage.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Cold damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "ice-storm",
    "name": "Ice Storm",
    "source": "PHB'24",
    "page": 287,
    "level": 4,
    "levelLabel": "4th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "300 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a mitten",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Land (Arctic) (PHB'14) Druid, Land (Polar Land) (PHB'24) Druid, Sea (PHB'24) Druid, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Evoker (PHB'24) Wizard, Ancients (PHB'14) Paladin, Ancients (PHB'24) Paladin, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Winter Walker (FRHoF) Ranger",
    "text": "Hail falls in a 20-foot-radius, 40-foot-high Cylinder centered on a point within range. Each creature in the Cylinder makes a Dexterity saving throw. A creature takes 2d10 Bludgeoning damage and 4d6 Cold damage on a failed save or half as much damage on a successful one.\n\nHailstones turn ground in the Cylinder into Difficult Terrain until the end of your next turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Bludgeoning damage increases by 1d10 for each spell slot level above 4."
  },
  {
    "id": "identify",
    "name": "Identify",
    "source": "PHB'24",
    "page": 287,
    "level": 1,
    "levelLabel": "1st",
    "school": "Divination",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pearl worth 100+ GP",
    "classes": [
      "Artificer",
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Forge (XGE) Cleric, Forge (XGE) Cleric, Knowledge (FRHoF) Cleric, Knowledge (PHB'14) Cleric",
    "text": "You touch an object throughout the spell's casting. If the object is a magic item or some other magical object, you learn its properties and how to use them, whether it requires Attunement, and how many charges it has, if any. You learn whether any ongoing spells are affecting the item and what they are. If the item was created by a spell, you learn that spell's name.\n\nIf you instead touch a creature throughout the casting, you learn which ongoing spells, if any, are currently affecting it.",
    "atHigherLevels": ""
  },
  {
    "id": "illusory-script",
    "name": "Illusory Script",
    "source": "PHB'24",
    "page": 288,
    "level": 1,
    "levelLabel": "1st",
    "school": "Illusion",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "10 days",
    "range": "Touch",
    "components": [
      "S",
      "M"
    ],
    "material": "ink worth 10+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard",
    "text": "You write on parchment, paper, or another suitable material and imbue it with an illusion that lasts for the duration. To you and any creatures you designate when you cast the spell, the writing appears normal, seems to be written in your hand, and conveys whatever meaning you intended when you wrote the text. To all others, the writing appears as if it were written in an unknown or magical script that is unintelligible. Alternatively, the illusion can alter the meaning, handwriting, and language of the text, though the language must be one you know.\n\nIf the spell is dispelled, the original script and the illusion both disappear.\n\nA creature that has Truesight can read the hidden message.",
    "atHigherLevels": ""
  },
  {
    "id": "imprisonment",
    "name": "Imprisonment",
    "source": "PHB'24",
    "page": 288,
    "level": 9,
    "levelLabel": "9th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Until dispelled",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a statuette of the target worth 5,000+ GP",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You create a magical restraint to hold a creature that you can see within range. The target must make a Wisdom saving throw. On a successful save, the target is unaffected, and it is immune to this spell for the next 24 hours. On a failed save, the target is imprisoned. While imprisoned, the target doesn't need to breathe, eat, or drink, and it doesn't age. Divination spells can't locate or perceive the imprisoned target, and the target can't teleport.\n\nUntil the spell ends, the target is also affected by one of the following effects of your choice:\n\nBurial. The target is entombed beneath the earth in a hollow globe of magical force that is just large enough to contain the target. Nothing can pass into or out of the globe.\n\nChaining. Chains firmly rooted in the ground hold the target in place. The target has the Restrained condition and can't be moved by any means.\n\nHedged Prison. The target is trapped in a demiplane that is warded against teleportation and planar travel. The demiplane is your choice of a labyrinth, a cage, a tower, or the like.\n\nMinimus Containment. The target becomes 1 inch tall and is trapped inside an indestructible gemstone or a similar object. Light can pass through the gemstone (allowing the target to see out and other creatures to see in), but nothing else can pass through by any means.\n\nSlumber. The target has the Unconscious condition and can't be awoken.\n\nEnding the Spell. When you cast the spell, specify a trigger that will end it. The trigger can be as simple or as elaborate as you choose, but the DM must agree that it has a high likelihood of happening within the next decade. The trigger must be an observable action, such as someone making a particular offering at the temple of your god, saving your true love, or defeating a specific monster.\n\nA Dispel Magic spell can end the spell only if it is cast with a level 9 spell slot, targeting either the prison or the component used to create it.",
    "atHigherLevels": ""
  },
  {
    "id": "incendiary-cloud",
    "name": "Incendiary Cloud",
    "source": "PHB'24",
    "page": 288,
    "level": 8,
    "levelLabel": "8th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "150 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "A swirling cloud of embers and smoke fills a 20-foot-radius Sphere centered on a point within range. The cloud's area is Heavily Obscured. It lasts for the duration or until a strong wind (like that created by Gust of Wind) disperses it.\n\nWhen the cloud appears, each creature in it makes a Dexterity saving throw, taking 10d8 Fire damage on a failed save or half as much damage on a successful one. A creature must also make this save when the Sphere moves into its space and when it enters the Sphere or ends its turn there. A creature makes this save only once per turn.\n\nThe cloud moves 10 feet away from you in a direction you choose at the start of each of your turns.",
    "atHigherLevels": ""
  },
  {
    "id": "inflict-wounds",
    "name": "Inflict Wounds",
    "source": "PHB'24",
    "page": 288,
    "level": 1,
    "levelLabel": "1st",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Oathbreaker (DMG'14) Paladin, Oathbreaker (DMG'14) Paladin",
    "text": "A creature you touch makes a Constitution saving throw, taking 2d10 Necrotic damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1."
  },
  {
    "id": "insect-plague",
    "name": "Insect Plague",
    "source": "PHB'24",
    "page": 289,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "300 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a locust",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Desert) (PHB'14) Druid, Land (Grassland) (PHB'14) Druid, Land (Swamp) (PHB'14) Druid, Land (Underdark) (PHB'14) Druid, Land (Tropical Land) (PHB'24) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Fiend (PHB'24) Warlock, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Swarmkeeper (TCE) Ranger, Swarmkeeper (TCE) Ranger, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "Swarming locusts fill a 20-foot-radius Sphere centered on a point you choose within range. The Sphere remains for the duration, and its area is Lightly Obscured and Difficult Terrain.\n\nWhen the swarm appears, each creature in it makes a Constitution saving throw, taking 4d10 Piercing damage on a failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell's area for the first time on a turn or ends its turn there. A creature makes this save only once per turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 5."
  },
  {
    "id": "invisibility",
    "name": "Invisibility",
    "source": "PHB'24",
    "page": 289,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "an eyelash in gum arabic",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Grassland) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Trickery (PHB'24) Cleric",
    "text": "A creature you touch has the Invisible condition until the spell ends. The spell ends early immediately after the target makes an attack roll, deals damage, or casts a spell.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2."
  },
  {
    "id": "jallarzis-storm-of-radiance",
    "name": "Jallarzi's Storm of Radiance",
    "source": "PHB'24",
    "page": 289,
    "level": 5,
    "levelLabel": "5th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of phosphorus",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Evoker (PHB'24) Wizard",
    "text": "You unleash a storm of flashing light and raging thunder in a 10-foot-radius, 40-foot-high Cylinder centered on a point you can see within range. While in this area, creatures have the Blinded and Deafened conditions, and they can't cast spells with a Verbal component.\n\nWhen the storm appears, each creature in it makes a Constitution saving throw, taking 2d10 Radiant damage and 2d10 Thunder damage on a failed save or half as much damage on a successful one. A creature also makes this save when it enters the spell's area for the first time on a turn or ends its turn there. A creature makes this save only once per turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The Radiant and Thunder damage increase by 1d10 for each spell slot level above 5."
  },
  {
    "id": "jump",
    "name": "Jump",
    "source": "PHB'24",
    "page": 290,
    "level": 1,
    "levelLabel": "1st",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 minute",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a grasshopper's hind leg",
    "classes": [
      "Artificer",
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You touch a willing creature. Once on each of its turns until the spell ends, that creature can jump up to 30 feet by spending 10 feet of movement.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
  },
  {
    "id": "knock",
    "name": "Knock",
    "source": "PHB'24",
    "page": 290,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access.\n\nA target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred. If the object has multiple locks, only one of them is unlocked.\n\nIf the target is held shut by Arcane Lock, that spell is suppressed for 10 minutes, during which time the target can be opened and closed.\n\nWhen you cast the spell, a loud knock, audible up to 300 feet away, emanates from the target.",
    "atHigherLevels": ""
  },
  {
    "id": "legend-lore",
    "name": "Legend Lore",
    "source": "PHB'24",
    "page": 290,
    "level": 5,
    "levelLabel": "5th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "incense worth 250+ GP, which the spell consumes, and four ivory strips worth 50+ GP each",
    "classes": [
      "Bard",
      "Cleric",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Draconic (PHB'24) Sorcerer, Knowledge (PHB'14) Cleric, Knowledge (FRHoF) Cleric, Glory (PHB'24) Paladin, Undying (SCAG) Warlock, Undying (SCAG) Warlock",
    "text": "Name or describe a famous person, place, or object. The spell brings to your mind a brief summary of the significant lore about that famous thing, as described by the DM.\n\nThe lore might consist of important details, amusing revelations, or even secret lore that has never been widely known. The more information you already know about the thing, the more precise and detailed the information you receive is. That information is accurate but might be couched in figurative language or poetry, as determined by the DM.\n\nIf the famous thing you chose isn't actually famous, you hear sad musical notes played on a trombone, and the spell fails.",
    "atHigherLevels": ""
  },
  {
    "id": "leomunds-secret-chest",
    "name": "Leomund's Secret Chest",
    "source": "PHB'24",
    "page": 290,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Until dispelled",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth 5,000+ GP, and a Tiny replica of the chest made from the same materials worth 50+ GP",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter",
    "text": "You hide a chest and all its contents on the Ethereal Plane. You must touch the chest and the miniature replica that serve as Material components for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet).\n\nWhile the chest remains on the Ethereal Plane, you can take a Magic action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by taking a Magic action to touch the chest and the replica.\n\nAfter 60 days, there is a cumulative 5 percent chance at the end of each day that the spell ends. The spell also ends if you cast this spell again or if the Tiny replica chest is destroyed. If the spell ends and the larger chest is on the Ethereal Plane, the chest remains there for you or someone else to find.",
    "atHigherLevels": ""
  },
  {
    "id": "leomunds-tiny-hut",
    "name": "Leomund's Tiny Hut",
    "source": "PHB'24",
    "page": 291,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Evocation",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "8 hours",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a crystal bead",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "A 10-foot Emanation springs into existence around you and remains stationary for the duration. The spell fails when you cast it if the Emanation isn't big enough to fully encapsulate all creatures in its area.\n\nCreatures and objects within the Emanation when you cast the spell can move through it freely. All other creatures and objects are barred from passing through it. Spells of level 3 or lower can't be cast through it, and the effects of such spells can't extend into it.\n\nThe atmosphere inside the Emanation is comfortable and dry, regardless of the weather outside. Until the spell ends, you can command the interior to have Dim Light or Darkness (no action required). The Emanation is opaque from the outside and of any color you choose, but it's transparent from the inside.\n\nThe spell ends early if you leave the Emanation or if you cast it again.",
    "atHigherLevels": ""
  },
  {
    "id": "lesser-restoration",
    "name": "Lesser Restoration",
    "source": "PHB'24",
    "page": 291,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (EFA) Artificer, Celestial (PHB'24) Warlock, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'24) Cleric, Life (PHB'14) Cleric, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Devotion (PHB'14) Paladin, Spellfire (FRHoF) Sorcerer, Celestial (XGE) Warlock",
    "text": "You touch a creature and end one condition on it: Blinded, Deafened, Paralyzed, or Poisoned.",
    "atHigherLevels": ""
  },
  {
    "id": "levitate",
    "name": "Levitate",
    "source": "PHB'24",
    "page": 291,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a metal spring",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "One creature or loose object of your choice that you can see within range rises vertically up to 20 feet and remains suspended there for the duration. The spell can levitate an object that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected.\n\nThe target can move only by pushing or pulling against a fixed object or surface within reach (such as a wall or a ceiling), which allows it to move as if it were climbing. You can change the target's altitude by up to 20 feet in either direction on your turn. If you are the target, you can move up or down as part of your move. Otherwise, you can take a Magic action to move the target, which must remain within the spell's range.\n\nWhen the spell ends, the target floats gently to the ground if it is still aloft.",
    "atHigherLevels": ""
  },
  {
    "id": "light",
    "name": "Light",
    "source": "PHB'24",
    "page": 292,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "M"
    ],
    "material": "a firefly or phosphorescent moss",
    "classes": [
      "Artificer",
      "Bard",
      "Cleric",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Celestial (PHB'24) Warlock, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Light (PHB'14) Cleric, Celestial (XGE) Warlock",
    "text": "You touch one Large or smaller object that isn't being worn or carried by someone else. Until the spell ends, the object sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The light can be colored as you like.\n\nCovering the object with something opaque blocks the light. The spell ends if you cast it again.",
    "atHigherLevels": ""
  },
  {
    "id": "lightning-arrow",
    "name": "Lightning Arrow",
    "source": "PHB'24",
    "page": 292,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "As your attack hits or misses the target, the weapon or ammunition you're using transforms into a lightning bolt. Instead of taking any damage or other effects from the attack, the target takes 4d8 Lightning damage on a hit or half as much damage on a miss. Each creature within 10 feet of the target then makes a Dexterity saving throw, taking 2d8 Lightning damage on a failed save or half as much damage on a successful one.\n\nThe weapon or ammunition then returns to its normal form.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage for both effects of the spell increases by 1d8 for each spell slot level above 3."
  },
  {
    "id": "lightning-bolt",
    "name": "Lightning Bolt",
    "source": "PHB'24",
    "page": 292,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of fur and a crystal rod",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Land (Temperate Land) (PHB'24) Druid, Land (Mountain) (PHB'14) Druid, Sea (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock",
    "text": "A stroke of lightning forming a 100-foot-long, 5-foot-wide Line blasts out from you in a direction you choose. Each creature in the Line makes a Dexterity saving throw, taking 8d6 Lightning damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
  },
  {
    "id": "locate-animals-or-plants",
    "name": "Locate Animals or Plants",
    "source": "PHB'24",
    "page": 292,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "fur from a bloodhound",
    "classes": [
      "Bard",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard",
    "text": "Describe or name a specific kind of Beast, Plant creature, or nonmagical plant. You learn the direction and distance to the closest creature or plant of that kind within 5 miles, if any are present.",
    "atHigherLevels": ""
  },
  {
    "id": "locate-creature",
    "name": "Locate Creature",
    "source": "PHB'24",
    "page": 292,
    "level": 4,
    "levelLabel": "4th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "fur from a bloodhound",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Cartographer (EFA) Artificer, Land (Swamp) (PHB'14) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Order (TCE) Cleric, Order (TCE) Cleric",
    "text": "Describe or name a creature that is familiar to you. You sense the direction to the creature's location if that creature is within 1,000 feet of you. If the creature is moving, you know the direction of its movement.\n\nThe spell can locate a specific creature known to you or the nearest creature of a specific kind (such as a human or a unicorn) if you have seen such a creature up close—within 30 feet—at least once. If the creature you described or named is in a different form, such as under the effects of a Flesh to Stone or Polymorph spell, this spell doesn't locate the creature.\n\nThis spell can't locate a creature if any thickness of lead blocks a direct path between you and the creature.",
    "atHigherLevels": ""
  },
  {
    "id": "locate-object",
    "name": "Locate Object",
    "source": "PHB'24",
    "page": 293,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a forked twig",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Cartographer (EFA) Artificer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "Describe or name an object that is familiar to you. You sense the direction to the object's location if that object is within 1,000 feet of you. If the object is in motion, you know the direction of its movement.\n\nThe spell can locate a specific object known to you if you have seen it up close—within 30 feet—at least once. Alternatively, the spell can locate the nearest object of a particular kind, such as a certain kind of apparel, jewelry, furniture, tool, or weapon.\n\nThis spell can't locate an object if any thickness of lead blocks a direct path between you and the object.",
    "atHigherLevels": ""
  },
  {
    "id": "longstrider",
    "name": "Longstrider",
    "source": "PHB'24",
    "page": 293,
    "level": 1,
    "levelLabel": "1st",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of dirt",
    "classes": [
      "Artificer",
      "Bard",
      "Druid",
      "Ranger",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You touch a creature. The target's Speed increases by 10 feet until the spell ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
  },
  {
    "id": "mage-armor",
    "name": "Mage Armor",
    "source": "PHB'24",
    "page": 293,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a piece of cured leather",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You touch a willing creature who isn't wearing armor. Until the spell ends, the target's base AC becomes 13 plus its Dexterity modifier. The spell ends early if the target dons armor.",
    "atHigherLevels": ""
  },
  {
    "id": "mage-hand",
    "name": "Mage Hand",
    "source": "PHB'24",
    "page": 293,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Swarmkeeper (TCE) Ranger, Swarmkeeper (TCE) Ranger",
    "text": "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.\n\nWhen you cast the spell, you can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.\n\nAs a Magic action on your later turns, you can control the hand thus again. As part of that action, you can move the hand up to 30 feet.\n\nThe hand can't attack, activate magic items, or carry more than 10 pounds.",
    "atHigherLevels": ""
  },
  {
    "id": "magic-circle",
    "name": "Magic Circle",
    "source": "PHB'24",
    "page": 293,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "1 hour",
    "range": "10 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "salt and powdered silver worth 100+ GP, which the spell consumes",
    "classes": [
      "Cleric",
      "Paladin",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Monster Slayer (XGE) Ranger, Monster Slayer (XGE) Ranger",
    "text": "You create a 10-foot-radius, 20-foot-tall Cylinder of magical energy centered on a point on the ground that you can see within range. Glowing runes appear wherever the Cylinder intersects with the floor or other surface.\n\nChoose one or more of the following types of creatures: Celestials, Elementals, Fey, Fiends, or Undead. The circle affects a creature of the chosen type in the following ways:\n\nThe creature can't willingly enter the Cylinder by nonmagical means. If the creature tries to use teleportation or interplanar travel to do so, it must first succeed on a Charisma saving throw.The creature has Disadvantage on attack rolls against targets within the Cylinder.Targets within the Cylinder can't be possessed by or gain the Charmed or Frightened condition from the creature.Each time you cast this spell, you can cause its magic to operate in the reverse direction, preventing a creature of the specified type from leaving the Cylinder and protecting targets outside it.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The duration increases by 1 hour for each spell slot level above 3."
  },
  {
    "id": "magic-jar",
    "name": "Magic Jar",
    "source": "PHB'24",
    "page": 294,
    "level": 6,
    "levelLabel": "6th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Until dispelled",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a gem, crystal, or reliquary worth 500+ GP",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell's Material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container's space. You can't move or take Reactions. The only action you can take is to project your soul up to 100 feet out of the container, either returning to your living body (and ending the spell) or attempting to possess a Humanoid's body.\n\nYou can attempt to possess any Humanoid within 100 feet of you that you can see (creatures warded by a Protection from Evil and Good or Magic Circle spell can't be possessed). The target makes a Charisma saving throw. On a failed save, your soul enters the target's body, and the target's soul becomes trapped in the container. On a successful save, the target resists your efforts to possess it, and you can't attempt to possess it again for 24 hours.\n\nOnce you possess a creature's body, you control it. Your Hit Points, Hit Point Dice, Strength, Dexterity, Constitution, Speed, and senses are replaced by the creature's. You otherwise keep your game statistics.\n\nMeanwhile, the possessed creature's soul can perceive from the container using its own senses, but it can't move and it is Incapacitated.\n\nWhile possessing a body, you can take a Magic action to return from the host body to the container if it is within 100 feet of you, returning the host creature's soul to its body. If the host body dies while you're in it, the creature dies, and you make a Charisma saving throw against your own spellcasting DC. On a success, you return to the container if it is within 100 feet of you. Otherwise, you die.\n\nIf the container is destroyed or the spell ends, your soul returns to your body. If your body is more than 100 feet away from you or if your body is dead, you die. If another creature's soul is in the container when it is destroyed, the creature's soul returns to its body if the body is alive and within 100 feet. Otherwise, that creature dies.\n\nWhen the spell ends, the container is destroyed.",
    "atHigherLevels": ""
  },
  {
    "id": "magic-missile",
    "name": "Magic Missile",
    "source": "PHB'24",
    "page": 295,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "You create three glowing darts of magical force. Each dart strikes a creature of your choice that you can see within range. A dart deals 1d4 + 1 Force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The spell creates one more dart for each spell slot level above 1."
  },
  {
    "id": "magic-mouth",
    "name": "Magic Mouth",
    "source": "PHB'24",
    "page": 295,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Illusion",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "Until dispelled",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "jade dust worth 10+ GP, which the spell consumes",
    "classes": [
      "Artificer",
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard",
    "text": "You implant a message within an object in range—a message that is uttered when a trigger condition is met. Choose an object that you can see and that isn't being worn or carried by another creature. Then speak the message, which must be 25 words or fewer, though it can be delivered over as long as 10 minutes. Finally, determine the circumstance that will trigger the spell to deliver your message.\n\nWhen that trigger occurs, a magical mouth appears on the object and recites the message in your voice and at the same volume you spoke. If the object you chose has a mouth or something that looks like a mouth (for example, the mouth of a statue), the magical mouth appears there, so the words appear to come from the object's mouth. When you cast this spell, you can have the spell end after it delivers its message, or it can remain and repeat its message whenever the trigger occurs.\n\nThe trigger can be as general or as detailed as you like, though it must be based on visual or audible conditions that occur within 30 feet of the object. For example, you could instruct the mouth to speak when any creature moves within 30 feet of the object or when a silver bell rings within 30 feet of it.",
    "atHigherLevels": ""
  },
  {
    "id": "magic-weapon",
    "name": "Magic Weapon",
    "source": "PHB'24",
    "page": 295,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Paladin",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Forge (XGE) Cleric, Forge (XGE) Cleric, Glory (PHB'24) Paladin, Glory (TCE) Paladin, War (PHB'24) Cleric, War (PHB'14) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. The spell ends early if you cast it again.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The bonus increases to +2 with a level 3-5 spell slot. The bonus increases to +3 with a level 6+ spell slot."
  },
  {
    "id": "major-image",
    "name": "Major Image",
    "source": "PHB'24",
    "page": 295,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of fleece",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard",
    "text": "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot Cube. The image appears at a spot that you can see within range and lasts for the duration. It seems real, including sounds, smells, and temperature appropriate to the thing depicted, but it can't deal damage or cause conditions.\n\nIf you are within range of the illusion, you can take a Magic action to cause the image to move to any other spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Similarly, you can cause the illusion to make different sounds at different times, even making it carry on a conversation, for example.\n\nPhysical interaction with the image reveals it to be an illusion, for things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and its other sensory qualities become faint to the creature.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The spell lasts until dispelled, without requiring Concentration, if cast with a level 4+ spell slot."
  },
  {
    "id": "mass-cure-wounds",
    "name": "Mass Cure Wounds",
    "source": "PHB'24",
    "page": 296,
    "level": 5,
    "levelLabel": "5th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Moon (PHB'24) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'14) Cleric, Life (PHB'24) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "A wave of healing energy washes out from a point you can see within range. Choose up to six creatures in a 30-foot-radius Sphere centered on that point. Each target regains Hit Points equal to 5d8 plus your spellcasting ability modifier.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The healing increases by 1d8 for each spell slot level above 5."
  },
  {
    "id": "mass-heal",
    "name": "Mass Heal",
    "source": "PHB'24",
    "page": 296,
    "level": 9,
    "levelLabel": "9th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "A flood of healing energy flows from you into creatures around you. You restore up to 700 Hit Points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell also have the Blinded, Deafened, and Poisoned conditions removed from them.",
    "atHigherLevels": ""
  },
  {
    "id": "mass-healing-word",
    "name": "Mass Healing Word",
    "source": "PHB'24",
    "page": 296,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'24) Cleric, Order (TCE) Cleric, Order (TCE) Cleric",
    "text": "Up to six creatures of your choice that you can see within range regain Hit Points equal to 2d4 plus your spellcasting ability modifier.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The healing increases by 1d4 for each spell slot level above 3."
  },
  {
    "id": "mass-suggestion",
    "name": "Mass Suggestion",
    "source": "PHB'24",
    "page": 296,
    "level": 6,
    "levelLabel": "6th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "60 feet",
    "components": [
      "V",
      "M"
    ],
    "material": "a snake's tongue",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You suggest a course of activity—described in no more than 25 words—to twelve or fewer creatures you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to any of the targets or their allies. For example, you could say, \"Walk to the village down that road, and help the villagers there harvest crops until sunset.\" Or you could say, \"Now is not the time for violence. Drop your weapons, and dance! Stop in an hour.\"\n\nEach target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. Each Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for a target upon completing it.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The duration is longer with a spell slot of level 7 (10 days), 8 (30 days), or 9 (366 days)."
  },
  {
    "id": "maze",
    "name": "Maze",
    "source": "PHB'24",
    "page": 296,
    "level": 8,
    "levelLabel": "8th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze.\n\nThe target can take a Study action to try to escape. When it does so, it makes a DC 20 Intelligence (Investigation) check. If it succeeds, it escapes, and the spell ends.\n\nWhen the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space.",
    "atHigherLevels": ""
  },
  {
    "id": "meld-into-stone",
    "name": "Meld into Stone",
    "source": "PHB'24",
    "page": 296,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": true,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Mountain) (PHB'14) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Genie (Dao) (TCE) Warlock, Genie (Dao) (TCE) Warlock",
    "text": "You step into a stone object or surface large enough to fully contain your body, merging yourself and your equipment with the stone for the duration. You must touch the stone to do so. Nothing of your presence remains visible or otherwise detectable by nonmagical senses.\n\nWhile merged with the stone, you can't see what occurs outside it, and any Wisdom (Perception) checks you make to hear sounds outside it are made with Disadvantage. You remain aware of the passage of time and can cast spells on yourself while merged in the stone. You can use 5 feet of movement to leave the stone where you entered it, which ends the spell. You otherwise can't move.\n\nMinor physical damage to the stone doesn't harm you, but its partial destruction or a change in its shape (to the extent that you no longer fit within it) expels you and deals 6d6 Force damage to you. The stone's complete destruction (or transmutation into a different substance) expels you and deals 50 Force damage to you. If expelled, you move into an unoccupied space closest to where you first entered and have the Prone condition.",
    "atHigherLevels": ""
  },
  {
    "id": "melfs-acid-arrow",
    "name": "Melf's Acid Arrow",
    "source": "PHB'24",
    "page": 297,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "powdered rhubarb leaf",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Swamp) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2."
  },
  {
    "id": "mending",
    "name": "Mending",
    "source": "PHB'24",
    "page": 297,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "two lodestones",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no larger than 1 foot in any dimension, you mend it, leaving no trace of the former damage.\n\nThis spell can physically repair a magic item, but it can't restore magic to such an object.",
    "atHigherLevels": ""
  },
  {
    "id": "message",
    "name": "Message",
    "source": "PHB'24",
    "page": 298,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 round",
    "range": "120 feet",
    "components": [
      "S",
      "M"
    ],
    "material": "a copper wire",
    "classes": [
      "Artificer",
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You point toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear.\n\nYou can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence; 1 foot of stone, metal, or wood; or a thin sheet of lead blocks the spell.",
    "atHigherLevels": ""
  },
  {
    "id": "meteor-swarm",
    "name": "Meteor Swarm",
    "source": "PHB'24",
    "page": 298,
    "level": 9,
    "levelLabel": "9th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "1 mile",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius Sphere centered on each of those points makes a Dexterity saving throw. A creature takes 20d6 Fire damage and 20d6 Bludgeoning damage on a failed save or half as much damage on a successful one. A creature in the area of more than one fiery Sphere is affected only once.\n\nA nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area, and the object starts burning if it's flammable.",
    "atHigherLevels": ""
  },
  {
    "id": "mind-blank",
    "name": "Mind Blank",
    "source": "PHB'24",
    "page": 298,
    "level": 8,
    "levelLabel": "8th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "Until the spell ends, one willing creature you touch has Immunity to Psychic damage and the Charmed condition. The target is also unaffected by anything that would sense its emotions or alignment, read its thoughts, or magically detect its location, and no spell—not even Wish—can gather information about the target, observe it remotely, or control its mind.",
    "atHigherLevels": ""
  },
  {
    "id": "mind-sliver",
    "name": "Mind Sliver",
    "source": "PHB'24",
    "page": 298,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You try to temporarily sliver the mind of one creature you can see within range. The target must succeed on an Intelligence saving throw or take 1d6 Psychic damage and subtract 1d4 from the next saving throw it makes before the end of your next turn.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
  },
  {
    "id": "mind-spike",
    "name": "Mind Spike",
    "source": "PHB'24",
    "page": 298,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "120 feet",
    "components": [
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Cartographer (EFA) Artificer, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric",
    "text": "You drive a spike of psionic energy into the mind of one creature you can see within range. The target makes a Wisdom saving throw, taking 3d8 Psychic damage on a failed save or half as much damage on a successful one. On a failed save, you also always know the target's location until the spell ends, but only while the two of you are on the same plane of existence. While you have this knowledge, the target can't become hidden from you, and if it has the Invisible condition, it gains no benefit from that condition against you.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."
  },
  {
    "id": "minor-illusion",
    "name": "Minor Illusion",
    "source": "PHB'24",
    "page": 298,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "30 feet",
    "components": [
      "S",
      "M"
    ],
    "material": "a bit of fleece",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Illusion (PHB'14) Wizard, Scion of the Three (FRHoF) Rogue, Shadow (PHB'24) Monk, Shadow (PHB'14) Monk",
    "text": "You create a sound or an image of an object within range that lasts for the duration. See the descriptions below for the effects of each. The illusion ends if you cast this spell again.\n\nIf a creature takes a Study action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion becomes faint to the creature.\n\nSound. If you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else's voice, a lion's roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before the spell ends.\n\nImage. If you create an image of an object—such as a chair, muddy footprints, or a small chest—it must be no larger than a 5-foot Cube. The image can't create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, since things can pass through it.",
    "atHigherLevels": ""
  },
  {
    "id": "mirage-arcane",
    "name": "Mirage Arcane",
    "source": "PHB'24",
    "page": 299,
    "level": 7,
    "levelLabel": "7th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "10 days",
    "range": "Sight",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Illusionist (PHB'24) Wizard",
    "text": "You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. Open fields or a road could be made to resemble a swamp, hill, crevasse, or some other rough or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road.\n\nSimilarly, you can alter the appearance of structures or add them where none are present. The spell doesn't disguise, conceal, or add creatures.\n\nThe illusion includes audible, visual, tactile, and olfactory elements, so it can turn clear ground into Difficult Terrain (or vice versa) or otherwise impede movement through the area. Any piece of the illusory terrain (such as a rock or stick) that is removed from the spell's area disappears immediately.\n\nCreatures with Truesight can see through the illusion to the terrain's true form; however, all other elements of the illusion remain, so while the creature is aware of the illusion's presence, the creature can still physically interact with the illusion.",
    "atHigherLevels": ""
  },
  {
    "id": "mirror-image",
    "name": "Mirror Image",
    "source": "PHB'24",
    "page": 299,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Land (Coast) (PHB'14) Druid, Glamour (PHB'24) Bard, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Noble Genies (FRHoF) Paladin, Trickery (PHB'14) Cleric, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it's impossible to track which image is real.\n\nEach time a creature hits you with an attack roll during the spell's duration, roll a d6 for each of your remaining duplicates. If any of the d6s rolls a 3 or higher, one of the duplicates is hit instead of you, and the duplicate is destroyed. The duplicates otherwise ignore all other damage and effects. The spell ends when all three duplicates are destroyed.\n\nA creature is unaffected by this spell if it has the Blinded condition, Blindsight, or Truesight.",
    "atHigherLevels": ""
  },
  {
    "id": "mislead",
    "name": "Mislead",
    "source": "PHB'24",
    "page": 299,
    "level": 5,
    "levelLabel": "5th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Self",
    "components": [
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Fey Wanderer (TCE) Ranger, Fey Wanderer (PHB'24) Ranger, Illusionist (PHB'24) Wizard, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "You gain the Invisible condition at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends immediately after you make an attack roll, deal damage, or cast a spell.\n\nAs a Magic action, you can move the illusory double up to twice your Speed and make it gesture, speak, and behave in whatever way you choose. It is intangible and invulnerable.\n\nYou can see through its eyes and hear through its ears as if you were located where it is.",
    "atHigherLevels": ""
  },
  {
    "id": "misty-step",
    "name": "Misty Step",
    "source": "PHB'24",
    "page": 299,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Archfey (PHB'24) Warlock, Land (Temperate Land) (PHB'24) Druid, Land (Coast) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fey Wanderer (PHB'24) Ranger, Fey Wanderer (TCE) Ranger, Horizon Walker (XGE) Ranger, Horizon Walker (XGE) Ranger, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Ancients (PHB'24) Paladin, Ancients (PHB'14) Paladin",
    "text": "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see.",
    "atHigherLevels": ""
  },
  {
    "id": "modify-memory",
    "name": "Modify Memory",
    "source": "PHB'24",
    "page": 299,
    "level": 5,
    "levelLabel": "5th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Great Old One (PHB'24) Warlock, Trickery (PHB'14) Cleric, Trickery (PHB'24) Cleric, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "You attempt to reshape another creature's memories. One creature that you can see within range makes a Wisdom saving throw. If you are fighting the creature, it has Advantage on the save. On a failed save, the target has the Charmed condition for the duration. While Charmed in this way, the target also has the Incapacitated condition and is unaware of its surroundings, though it can hear you. If it takes any damage or is targeted by another spell, this spell ends, and no memories are modified.\n\nWhile this charm lasts, you can affect the target's memory of an event that it experienced within the last 24 hours and that lasted no more than 10 minutes. You can permanently eliminate all memory of the event, allow the target to recall the event with perfect clarity, change its memory of the event's details, or create a memory of some other event.\n\nYou must speak to the target to describe how its memories are affected, and it must be able to understand your language for the modified memories to take root. Its mind fills in any gaps in the details of your description. If the spell ends before you finish describing the modified memories, the creature's memory isn't altered. Otherwise, the modified memories take hold when the spell ends.\n\nA modified memory doesn't necessarily affect how a creature behaves, particularly if the memory contradicts the creature's natural inclinations, alignment, or beliefs. An illogical modified memory, such as a false memory of how much the creature enjoyed swimming in acid, is dismissed as a bad dream. The DM might deem a modified memory too nonsensical to affect a creature.\n\nA Remove Curse or Greater Restoration spell cast on the target restores the creature's true memory.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can alter the target's memories of an event that took place up to 7 days ago (level 6 spell slot), 30 days ago (level 7 spell slot), 365 days ago (level 8 spell slot), or any time in the creature's past (level 9 spell slot)."
  },
  {
    "id": "moonbeam",
    "name": "Moonbeam",
    "source": "PHB'24",
    "page": 300,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a moonseed leaf",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Moon (PHB'24) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Ancients (PHB'24) Paladin, Ancients (PHB'14) Paladin, Watchers (TCE) Paladin, Watchers (TCE) Paladin, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high Cylinder centered on a point within range. Until the spell ends, Dim Light fills the Cylinder, and you can take a Magic action on later turns to move the Cylinder up to 60 feet.\n\nWhen the Cylinder appears, each creature in it makes a Constitution saving throw. On a failed save, a creature takes 2d10 Radiant damage, and if the creature is shape-shifted (as a result of the Polymorph spell, for example), it reverts to its true form and can't shape-shift until it leaves the Cylinder. On a successful save, a creature takes half as much damage only. A creature also makes this save when the spell's area moves into its space and when it enters the spell's area or ends its turn there. A creature makes this save only once per turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 2."
  },
  {
    "id": "mordenkainens-faithful-hound",
    "name": "Mordenkainen's Faithful Hound",
    "source": "PHB'24",
    "page": 300,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a silver whistle",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter",
    "text": "You conjure a phantom watchdog in an unoccupied space that you can see within range. The hound remains for the duration or until the two of you are more than 300 feet apart from each other.\n\nNo one but you can see the hound, and it is intangible and invulnerable. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound has Truesight with a range of 30 feet.\n\nAt the start of each of your turns, the hound attempts to bite one enemy within 5 feet of it. That enemy must succeed on a Dexterity saving throw or take 4d8 Force damage.\n\nOn your later turns, you can take a Magic action to move the hound up to 30 feet.",
    "atHigherLevels": ""
  },
  {
    "id": "mordenkainens-magnificent-mansion",
    "name": "Mordenkainen's Magnificent Mansion",
    "source": "PHB'24",
    "page": 300,
    "level": 7,
    "levelLabel": "7th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "24 hours",
    "range": "300 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a miniature door worth 15+ GP",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You conjure a shimmering door in range that lasts for the duration. The door leads to an extradimensional dwelling and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the door remains open. You can open or close it (no action required) if you are within 30 feet of it. While closed, the door is imperceptible.\n\nBeyond the door is a magnificent foyer with numerous chambers beyond. The dwelling's atmosphere is clean, fresh, and warm.\n\nYou can create any floor plan you like for the dwelling, but it can't exceed 50 contiguous 10-foot Cubes. The place is furnished and decorated as you choose. It contains sufficient food to serve a nine-course banquet for up to 100 people. Furnishings and other objects created by this spell dissipate into smoke if removed from it.\n\nA staff of 100 near-transparent servants attends all who enter. You determine the appearance of these servants and their attire. They are invulnerable and obey your commands. Each servant can perform tasks that a human could perform, but they can't attack or take any action that would directly harm another creature. Thus the servants can fetch things, clean, mend, fold clothes, light fires, serve food, pour wine, and so on. The servants can't leave the dwelling.\n\nWhen the spell ends, any creatures or objects left inside the extradimensional space are expelled into the unoccupied spaces nearest to the entrance.",
    "atHigherLevels": ""
  },
  {
    "id": "mordenkainens-private-sanctum",
    "name": "Mordenkainen's Private Sanctum",
    "source": "PHB'24",
    "page": 301,
    "level": 4,
    "levelLabel": "4th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "24 hours",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a thin sheet of lead",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter",
    "text": "You make an area within range magically secure. The area is a Cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration.\n\nWhen you cast the spell, you decide what sort of security the spell provides, choosing any of the following properties:\n\nSound can't pass through the barrier at the edge of the warded area.The barrier of the warded area appears dark and foggy, preventing vision (including Darkvision) through it.Sensors created by Divination spells can't appear inside the protected area or pass through the barrier at its perimeter.Creatures in the area can't be targeted by Divination spells.Nothing can teleport into or out of the warded area.Planar travel is blocked within the warded area.Casting this spell on the same spot every day for 365 days makes the spell last until dispelled.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can increase the size of the Cube by 100 feet for each spell slot level above 4."
  },
  {
    "id": "mordenkainens-sword",
    "name": "Mordenkainen's Sword",
    "source": "PHB'24",
    "page": 302,
    "level": 7,
    "levelLabel": "7th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a miniature sword worth 250+ GP",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "You create a spectral sword that hovers within range. It lasts for the duration.\n\nWhen the sword appears, you make a melee spell attack against a target within 5 feet of the sword. On a hit, the target takes Force damage equal to 4d12 plus your spellcasting ability modifier.\n\nOn your later turns, you can take a Bonus Action to move the sword up to 30 feet to a spot you can see and repeat the attack against the same target or a different one.",
    "atHigherLevels": ""
  },
  {
    "id": "move-earth",
    "name": "Move Earth",
    "source": "PHB'24",
    "page": 302,
    "level": 6,
    "levelLabel": "6th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 2 hours",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a miniature shovel",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area's elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. The extent of any such changes can't exceed half the area's largest dimension. For example, if you affect a 40-foot square, you can create a pillar up to 20 feet high, raise or lower the square's elevation by up to 20 feet, dig a trench up to 20 feet deep, and so on. It takes 10 minutes for these changes to complete. Because the terrain's transformation occurs slowly, creatures in the area can't usually be trapped or injured by the ground's movement.\n\nAt the end of every 10 minutes you spend Concentrating on the spell, you can choose a new area of terrain to affect within range.\n\nThis spell can't manipulate natural stone or stone construction. Rocks and structures shift to accommodate the new terrain. If the way you shape the terrain would make a structure unstable, it might collapse.\n\nSimilarly, this spell doesn't directly affect plant growth. The moved earth carries any plants along with it.",
    "atHigherLevels": ""
  },
  {
    "id": "nondetection",
    "name": "Nondetection",
    "source": "PHB'24",
    "page": 302,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of diamond dust worth 25+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Ranger",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric, Knowledge (PHB'14) Cleric, Watchers (TCE) Paladin, Watchers (TCE) Paladin, Trickery (PHB'24) Cleric",
    "text": "For the duration, you hide a target that you touch from Divination spells. The target can be a willing creature, or it can be a place or an object no larger than 10 feet in any dimension. The target can't be targeted by any Divination spell or perceived through magical scrying sensors.",
    "atHigherLevels": ""
  },
  {
    "id": "nystuls-magic-aura",
    "name": "Nystul's Magic Aura",
    "source": "PHB'24",
    "page": 302,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a small square of silk",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard",
    "text": "With a touch, you place an illusion on a willing creature or an object that isn't being worn or carried. A creature gains the Mask effect below, and an object gains the False Aura effect below. The effect lasts for the duration. If you cast the spell on the same target every day for 30 days, the illusion lasts until dispelled.\n\nMask (Creature). Choose a creature type other than the target's actual type. Spells and other magical effects treat the target as if it were a creature of the chosen type.\n\nFalse Aura (Object). You change the way the target appears to spells and magical effects that detect magical auras, such as Detect Magic. You can make a nonmagical object appear magical, make a magic item appear nonmagical, or change the object's aura so that it appears to belong to a school of magic you choose.",
    "atHigherLevels": ""
  },
  {
    "id": "otilukes-freezing-sphere",
    "name": "Otiluke's Freezing Sphere",
    "source": "PHB'24",
    "page": 302,
    "level": 6,
    "levelLabel": "6th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "300 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a miniature crystal sphere",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "A frigid globe streaks from you to a point of your choice within range, where it explodes in a 60-foot-radius Sphere. Each creature in that area makes a Constitution saving throw, taking 10d6 Cold damage on failed save or half as much damage on a successful one.\n\nIf the globe strikes a body of water, it freezes the water to a depth of 6 inches over an area 30 feet square. This ice lasts for 1 minute. Creatures that were swimming on the surface of frozen water are trapped in the ice and have the Restrained condition. A trapped creature can take an action to make a Strength (Athletics) check against your spell save DC to break free.\n\nYou can refrain from firing the globe after completing the spell's casting. If you do so, a globe about the size of a sling bullet, cool to the touch, appears in your hand. At any time, you or a creature you give the globe to can throw the globe (to a range of 40 feet) or hurl it with a sling (to the sling's normal range). It shatters on impact, with the same effect as a normal casting of the spell. You can also set the globe down without shattering it. After 1 minute, if the globe hasn't already shattered, it explodes.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 6."
  },
  {
    "id": "otilukes-resilient-sphere",
    "name": "Otiluke's Resilient Sphere",
    "source": "PHB'24",
    "page": 303,
    "level": 4,
    "levelLabel": "4th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a glass sphere",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Peace (TCE) Cleric, Peace (TCE) Cleric",
    "text": "A shimmering sphere encloses a Large or smaller creature or object within range. An unwilling creature must succeed on a Dexterity saving throw or be enclosed for the duration.\n\nNothing—not physical objects, energy, or other spell effects—can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can't be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it.\n\nThe sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can take an action to push against the sphere's walls and thus roll the sphere at up to half the creature's Speed. Similarly, the globe can be picked up and moved by other creatures.\n\nA Disintegrate spell targeting the globe destroys it without harming anything inside.",
    "atHigherLevels": ""
  },
  {
    "id": "ottos-irresistible-dance",
    "name": "Otto's Irresistible Dance",
    "source": "PHB'24",
    "page": 303,
    "level": 6,
    "levelLabel": "6th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "One creature that you can see within range must make a Wisdom saving throw. On a successful save, the target dances comically until the end of its next turn, during which it must spend all its movement to dance in place.\n\nOn a failed save, the target has the Charmed condition for the duration. While Charmed, the target dances comically, must use all its movement to dance in place, and has Disadvantage on Dexterity saving throws and attack rolls, and other creatures have Advantage on attack rolls against it. On each of its turns, the target can take an action to collect itself and repeat the save, ending the spell on itself on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "pass-without-trace",
    "name": "Pass without Trace",
    "source": "PHB'24",
    "page": 303,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "ashes from burned mistletoe",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Grassland) (PHB'14) Druid, Lore (PHB'24) Bard, Trickery (PHB'24) Cleric, Trickery (PHB'14) Cleric, Shadow (PHB'14) Monk",
    "text": "You radiate a concealing aura in a 30-foot Emanation for the duration. While in the aura, you and each creature you choose have a +10 bonus to Dexterity (Stealth) checks and leave no tracks.",
    "atHigherLevels": ""
  },
  {
    "id": "passwall",
    "name": "Passwall",
    "source": "PHB'24",
    "page": 304,
    "level": 5,
    "levelLabel": "5th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of sesame seeds",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Armorer (TCE) Artificer, Armorer (EFA) Artificer, Land (Mountain) (PHB'14) Druid",
    "text": "A passage appears at a point that you can see on a wooden, plaster, or stone surface (such as a wall, ceiling, or floor) within range and lasts for the duration. You choose the opening's dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it.\n\nWhen the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell.",
    "atHigherLevels": ""
  },
  {
    "id": "phantasmal-force",
    "name": "Phantasmal Force",
    "source": "PHB'24",
    "page": 304,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of fleece",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Archfey (PHB'24) Warlock, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Great Old One (PHB'24) Warlock, Illusionist (PHB'24) Wizard, Noble Genies (FRHoF) Paladin, Archfey (PHB'14) Warlock, Genie (TCE) Warlock, Genie (TCE) Warlock, Great Old One (PHB'14) Warlock, Undead (VRGR) Warlock, Undead (VRGR) Warlock",
    "text": "You attempt to craft an illusion in the mind of a creature you can see within range. The target makes an Intelligence saving throw. On a failed save, you create a phantasmal object, creature, or other phenomenon that is no larger than a 10-foot Cube and that is perceivable only to the target for the duration. The phantasm includes sound, temperature, and other stimuli.\n\nThe target can take a Study action to examine the phantasm with an Intelligence (Investigation) check against your spell save DC. If the check succeeds, the target realizes that the phantasm is an illusion, and the spell ends.\n\nWhile affected by the spell, the target treats the phantasm as if it were real and rationalizes any illogical outcomes from interacting with it. For example, if the target steps through a phantasmal bridge and survives the fall, it believes the bridge exists and something else caused it to fall.\n\nAn affected target can even take damage from the illusion if the phantasm represents a dangerous creature or hazard. On each of your turns, such a phantasm can deal 2d8 Psychic damage to the target if it is in the phantasm's area or within 5 feet of the phantasm. The target perceives the damage as a type appropriate to the illusion.",
    "atHigherLevels": ""
  },
  {
    "id": "phantasmal-killer",
    "name": "Phantasmal Killer",
    "source": "PHB'24",
    "page": 304,
    "level": 4,
    "levelLabel": "4th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Illusionist (PHB'24) Wizard, Genie (TCE) Warlock, Genie (TCE) Warlock, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "You tap into the nightmares of a creature you can see within range and create an illusion of its deepest fears, visible only to that creature. The target makes a Wisdom saving throw. On a failed save, the target takes 4d10 Psychic damage and has Disadvantage on ability checks and attack rolls for the duration. On a successful save, the target takes half as much damage, and the spell ends.\n\nFor the duration, the target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes the Psychic damage again. On a successful save, the spell ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 4."
  },
  {
    "id": "phantom-steed",
    "name": "Phantom Steed",
    "source": "PHB'24",
    "page": 304,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Illusion",
    "ritual": true,
    "castingTime": "1 Min.",
    "duration": "1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Undead (VRGR) Warlock, Undead (VRGR) Warlock",
    "text": "A Large, quasi-real, horselike creature appears on the ground in an unoccupied space of your choice within range. You decide the creature's appearance, and it is equipped with a saddle, bit, and bridle. Any of the equipment created by the spell vanishes in a puff of smoke if it is carried more than 10 feet away from the steed.\n\nFor the duration, you or a creature you choose can ride the steed. The steed uses the Riding Horse stat block, except it has a Speed of 100 feet and can travel 13 miles in an hour. When the spell ends, the steed gradually fades, giving the rider 1 minute to dismount. The spell ends early if the steed takes any damage.",
    "atHigherLevels": ""
  },
  {
    "id": "planar-ally",
    "name": "Planar Ally",
    "source": "PHB'24",
    "page": 304,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You beseech an otherworldly entity for aid. The being must be known to you: a god, a demon prince, or some other being of cosmic power. That entity sends a Celestial, an Elemental, or a Fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature's name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway (DM's choice).\n\nWhen the creature appears, it is under no compulsion to behave a particular way. You can ask it to perform a service in exchange for payment, but it isn't obliged to do so. The requested task could range from simple (fly us across the chasm, or help us fight a battle) to complex (spy on our enemies, or protect us during our foray into the dungeon). You must be able to communicate with the creature to bargain for its services.\n\nPayment can take a variety of forms. A Celestial might require a sizable donation of gold or magic items to an allied temple, while a Fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you.\n\nA task that can be measured in minutes requires a payment worth 100 GP per minute. A task measured in hours requires 1,000 GP per hour. And a task measured in days (up to 10 days) requires 10,000 GP per day. The DM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature's ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal.\n\nAfter the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you if possible. If you are unable to agree on a price for the creature's service, the creature immediately returns to its home plane.",
    "atHigherLevels": ""
  },
  {
    "id": "planar-binding",
    "name": "Planar Binding",
    "source": "PHB'24",
    "page": 305,
    "level": 5,
    "levelLabel": "5th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "24 hours",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a jewel worth 1,000+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You attempt to bind a Celestial, an Elemental, a Fey, or a Fiend to your service. The creature must be within range for the entire casting of the spell. (Typically, the creature is first summoned into the center of the inverted version of the Magic Circle spell to trap it while this spell is cast.) At the completion of the casting, the target must succeed on a Charisma saving throw or be bound to serve you for the duration. If the creature was summoned or created by another spell, that spell's duration is extended to match the duration of this spell.\n\nA bound creature must follow your commands to the best of its ability. You might command the creature to accompany you on an adventure, to guard a location, or to deliver a message. If the creature is Hostile, it strives to twist your commands to achieve its own objectives. If the creature carries out your commands completely before the spell ends, it travels to you to report this fact if you are on the same plane of existence. If you are on a different plane, it returns to the place where you bound it and remains there until the spell ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The duration increases with a spell slot of level 6 (10 days), 7 (30 days), 8 (180 days), and 9 (366 days)."
  },
  {
    "id": "plane-shift",
    "name": "Plane Shift",
    "source": "PHB'24",
    "page": 305,
    "level": 7,
    "levelLabel": "7th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a forked, metal rod worth 250+ GP and attuned to a plane of existence",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as the City of Brass on the Elemental Plane of Fire or the palace of Dispater on the second level of the Nine Hells, and you appear in or near that destination, as determined by the DM.\n\nAlternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. If the teleportation circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle.",
    "atHigherLevels": ""
  },
  {
    "id": "plant-growth",
    "name": "Plant Growth",
    "source": "PHB'24",
    "page": 305,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Archfey (PHB'24) Warlock, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Land (Forest) (PHB'14) Druid, Lore (PHB'24) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Ancients (PHB'24) Paladin, Ancients (PHB'14) Paladin, Archfey (PHB'14) Warlock",
    "text": "This spell channels vitality into plants. The casting time you use determines whether the spell has the Overgrowth or the Enrichment effect below.\n\nOvergrowth. Choose a point within range. All normal plants in a 100-foot-radius Sphere centered on that point become thick and overgrown. A creature moving through that area must spend 4 feet of movement for every 1 foot it moves. You can exclude one or more areas of any size within the spell's area from being affected.\n\nEnrichment. All plants in a half-mile radius centered on a point within range become enriched for 365 days. The plants yield twice the normal amount of food when harvested. They can benefit from only one Plant Growth per year.",
    "atHigherLevels": ""
  },
  {
    "id": "poison-spray",
    "name": "Poison Spray",
    "source": "PHB'24",
    "page": 306,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You spray toxic mist at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d12 Poison damage.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d12 when you reach levels 5 (2d12), 11 (3d12), and 17 (4d12)."
  },
  {
    "id": "polymorph",
    "name": "Polymorph",
    "source": "PHB'24",
    "page": 306,
    "level": 4,
    "levelLabel": "4th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a caterpillar cocoon",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Land (Tropical Land) (PHB'24) Druid, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Trickery (PHB'14) Cleric",
    "text": "You attempt to transform a creature that you can see within range into a Beast. The target must succeed on a Wisdom saving throw or shape-shift into Beast form for the duration. That form can be any Beast you choose that has a Challenge Rating equal to or less than the target's (or the target's level if it doesn't have a Challenge Rating). The target's game statistics are replaced by the stat block of the chosen Beast, but the target retains its alignment, personality, creature type, Hit Points, and Hit Point Dice.\n\nThe target gains a number of Temporary Hit Points equal to the Hit Points of the Beast form. These Temporary Hit Points vanish if any remain when the spell ends. The spell ends early on the target if it has no Temporary Hit Points left.\n\nThe target is limited in the actions it can perform by the anatomy of its new form, and it can't speak or cast spells.\n\nThe target's gear melds into the new form. The creature can't use or otherwise benefit from any of that equipment.",
    "atHigherLevels": ""
  },
  {
    "id": "power-word-fortify",
    "name": "Power Word Fortify",
    "source": "PHB'24",
    "page": 306,
    "level": 7,
    "levelLabel": "7th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You fortify up to six creatures you can see within range. The spell bestows 120 Temporary Hit Points, which you divide among the spell's recipients.",
    "atHigherLevels": ""
  },
  {
    "id": "power-word-heal",
    "name": "Power Word Heal",
    "source": "PHB'24",
    "page": 306,
    "level": 9,
    "levelLabel": "9th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "A wave of healing energy washes over one creature you can see within range. The target regains all its Hit Points. If the creature has the Charmed, Frightened, Paralyzed, Poisoned, or Stunned condition, the condition ends. If the creature has the Prone condition, it can use its Reaction to stand up.",
    "atHigherLevels": ""
  },
  {
    "id": "power-word-kill",
    "name": "Power Word Kill",
    "source": "PHB'24",
    "page": 306,
    "level": 9,
    "levelLabel": "9th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You compel one creature you can see within range to die. If the target has 100 Hit Points or fewer, it dies. Otherwise, it takes 12d12 Psychic damage.",
    "atHigherLevels": ""
  },
  {
    "id": "power-word-stun",
    "name": "Power Word Stun",
    "source": "PHB'24",
    "page": 306,
    "level": 8,
    "levelLabel": "8th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You overwhelm the mind of one creature you can see within range. If the target has 150 Hit Points or fewer, it has the Stunned condition. Otherwise, its Speed is 0 until the start of your next turn.\n\nThe Stunned target makes a Constitution saving throw at the end of each of its turns, ending the condition on itself on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "prayer-of-healing",
    "name": "Prayer of Healing",
    "source": "PHB'24",
    "page": 307,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "Up to five creatures of your choice who remain within range for the spell's entire casting gain the benefits of a Short Rest and also regain 2d8 Hit Points. A creature can't be affected by this spell again until that creature finishes a Long Rest.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The healing increases by 1d8 for each spell slot level above 2."
  },
  {
    "id": "prestidigitation",
    "name": "Prestidigitation",
    "source": "PHB'24",
    "page": 307,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "10 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Archer (XGE) Fighter, Arcane Archer (XGE) Fighter, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You create a magical effect within range. Choose the effect from the options below. If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time.\n\nSensory Effect. You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor.\n\nFire Play. You instantaneously light or snuff out a candle, a torch, or a small campfire.\n\nClean or Soil. You instantaneously clean or soil an object no larger than 1 cubic foot.\n\nMinor Sensation. You chill, warm, or flavor up to 1 cubic foot of nonliving material for 1 hour.\n\nMagic Mark. You make a color, a small mark, or a symbol appear on an object or a surface for 1 hour.\n\nMinor Creation. You create a nonmagical trinket or an illusory image that can fit in your hand. It lasts until the end of your next turn. A trinket can deal no damage and has no monetary worth.",
    "atHigherLevels": ""
  },
  {
    "id": "prismatic-spray",
    "name": "Prismatic Spray",
    "source": "PHB'24",
    "page": 307,
    "level": 7,
    "levelLabel": "7th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "Eight rays of light flash from you in a 60-foot Cone. Each creature in the Cone makes a Dexterity saving throw. For each target, roll 1d8 to determine which color ray affects it, consulting the Prismatic Rays table.\n\nPrismatic Rays1d8Ray1Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage.2Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage.3Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage.4Green. Failed Save: 12d6 Poison damage. Successful Save: Half as much damage.5Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage.6Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind.7Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (DM's choice).8Special. The target is struck by two rays. Roll twice, rerolling any 8.",
    "atHigherLevels": ""
  },
  {
    "id": "prismatic-wall",
    "name": "Prismatic Wall",
    "source": "PHB'24",
    "page": 308,
    "level": 9,
    "levelLabel": "9th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "A shimmering, multicolored plane of light forms a vertical opaque wall—up to 90 feet long, 30 feet high, and 1 inch thick—centered on a point within range. Alternatively, you shape the wall into a globe up to 30 feet in diameter centered on a point within range. The wall lasts for the duration. If you position the wall in a space occupied by a creature, the spell ends instantly without effect.\n\nThe wall sheds Bright Light within 100 feet and Dim Light for an additional 100 feet. You and creatures you designate when you cast the spell can pass through and be near the wall without harm. If another creature that can see the wall moves within 20 feet of it or starts its turn there, the creature must succeed on a Constitution saving throw or have the Blinded condition for 1 minute.\n\nThe wall consists of seven layers, each with a different color. When a creature reaches into or passes through the wall, it does so one layer at a time through all the layers. Each layer forces the creature to make a Dexterity saving throw or be affected by that layer's properties as described in the Prismatic Layers table.\n\nThe wall, which has AC 10, can be destroyed one layer at a time, in order from red to violet, by means specific to each layer. If a layer is destroyed, it is gone for the duration. Antimagic Field has no effect on the wall, and Dispel Magic can affect only the violet layer.\n\nPrismatic LayersOrderEffects1Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage. Additional Effects: Nonmagical ranged attacks can't pass through this layer, which is destroyed if it takes at least 25 Cold damage.2Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage. Additional Effects: Magical ranged attacks can't pass through this layer, which is destroyed by a strong wind (such as the one created by Gust of Wind).3Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage. Additional Effects: The layer is destroyed if it takes at least 60 Force damage.4Green. Failed Save: 12d6 Poison damage. Successful Save: Half as much damage. Additional Effects: A Passwall spell, or another spell of equal or greater level that can open a portal on a solid surface, destroys this layer.5Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage. Additional Effects: The layer is destroyed if it takes at least 25 Fire damage.6Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind. Additional Effects: Spells can't be cast through this layer, which is destroyed by Bright Light shed by the Daylight spell.7Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (DM's choice). Additional Effects: This layer is destroyed by Dispel Magic.",
    "atHigherLevels": ""
  },
  {
    "id": "produce-flame",
    "name": "Produce Flame",
    "source": "PHB'24",
    "page": 308,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "A flickering flame appears in your hand and remains there for the duration. While there, the flame emits no heat and ignites nothing, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The spell ends if you cast it again.\n\nUntil the spell ends, you can take a Magic action to hurl fire at a creature or an object within 60 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 Fire damage.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
  },
  {
    "id": "programmed-illusion",
    "name": "Programmed Illusion",
    "source": "PHB'24",
    "page": 309,
    "level": 6,
    "levelLabel": "6th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Until dispelled",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "jade dust worth 25+ GP",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Illusionist (PHB'24) Wizard",
    "text": "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific trigger occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot Cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes.\n\nWhen the trigger you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes, after which the illusion can be activated again.\n\nThe trigger can be as general or as detailed as you like, though it must be based on visual or audible phenomena that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door.\n\nPhysical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature.",
    "atHigherLevels": ""
  },
  {
    "id": "project-image",
    "name": "Project Image",
    "source": "PHB'24",
    "page": 309,
    "level": 7,
    "levelLabel": "7th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 day",
    "range": "500 miles",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a statuette of yourself worth 5+ GP",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Illusionist (PHB'24) Wizard",
    "text": "You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you, but it is intangible. If the illusion takes any damage, it disappears, and the spell ends.\n\nYou can see through the illusion's eyes and hear through its ears as if you were in its space. As a Magic action, you can move it up to 60 feet and make it gesture, speak, and behave in whatever way you choose. It mimics your mannerisms perfectly.\n\nPhysical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature.",
    "atHigherLevels": ""
  },
  {
    "id": "protection-from-energy",
    "name": "Protection from Energy",
    "source": "PHB'24",
    "page": 309,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Desert) (PHB'14) Druid, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Forge (XGE) Cleric, Forge (XGE) Cleric, Glory (PHB'24) Paladin, Glory (TCE) Paladin, Vengeance (PHB'24) Paladin, Vengeance (PHB'14) Paladin, Ancients (PHB'24) Paladin, Ancients (PHB'14) Paladin, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "For the duration, the willing creature you touch has Resistance to one damage type of your choice: Acid, Cold, Fire, Lightning, or Thunder.",
    "atHigherLevels": ""
  },
  {
    "id": "protection-from-evil-and-good",
    "name": "Protection from Evil and Good",
    "source": "PHB'24",
    "page": 309,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a flask of Holy Water worth 25+ GP, which the spell consumes",
    "classes": [
      "Cleric",
      "Druid",
      "Paladin",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Horizon Walker (XGE) Ranger, Horizon Walker (XGE) Ranger, Monster Slayer (XGE) Ranger, Monster Slayer (XGE) Ranger, Devotion (PHB'24) Paladin, Devotion (PHB'14) Paladin",
    "text": "Until the spell ends, one willing creature you touch is protected against creatures that are Aberrations, Celestials, Elementals, Fey, Fiends, or Undead. The protection grants several benefits. Creatures of those types have Disadvantage on attack rolls against the target. The target also can't be possessed by or gain the Charmed or Frightened conditions from them. If the target is already possessed, Charmed, or Frightened by such a creature, the target has Advantage on any new saving throw against the relevant effect.",
    "atHigherLevels": ""
  },
  {
    "id": "protection-from-poison",
    "name": "Protection from Poison",
    "source": "PHB'24",
    "page": 310,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You touch a creature and end the Poisoned condition on it. For the duration, the target has Advantage on saving throws to avoid or end the Poisoned condition, and it has Resistance to Poison damage.",
    "atHigherLevels": ""
  },
  {
    "id": "purify-food-and-drink",
    "name": "Purify Food and Drink",
    "source": "PHB'24",
    "page": 310,
    "level": 1,
    "levelLabel": "1st",
    "school": "Transmutation",
    "ritual": true,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "10 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You remove poison and rot from nonmagical food and drink in a 5-foot-radius Sphere centered on a point within range.",
    "atHigherLevels": ""
  },
  {
    "id": "raise-dead",
    "name": "Raise Dead",
    "source": "PHB'24",
    "page": 310,
    "level": 5,
    "levelLabel": "5th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a diamond worth 500+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Grave (XGE) Cleric, Grave (XGE) Cleric, Life (PHB'14) Cleric",
    "text": "With a touch, you revive a dead creature if it has been dead no longer than 10 days and it wasn't Undead when it died.\n\nThe creature returns to life with 1 Hit Point. This spell also neutralizes any poisons that affected the creature at the time of death.\n\nThis spell closes all mortal wounds, but it doesn't restore missing body parts. If the creature is lacking body parts or organs integral for its survival—its head, for instance—the spell automatically fails.\n\nComing back from the dead is an ordeal. The target takes a -4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0.",
    "atHigherLevels": ""
  },
  {
    "id": "rarys-telepathic-bond",
    "name": "Rary's Telepathic Bond",
    "source": "PHB'24",
    "page": 311,
    "level": 5,
    "levelLabel": "5th",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "two eggs",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Diviner (PHB'24) Wizard, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Peace (TCE) Cleric, Peace (TCE) Cleric",
    "text": "You forge a telepathic link among up to eight willing creatures of your choice within range, psychically linking each creature to all the others for the duration. Creatures that can't communicate in any languages aren't affected by this spell.\n\nUntil the spell ends, the targets can communicate telepathically through the bond whether or not they share a language. The communication is possible over any distance, though it can't extend to other planes of existence.",
    "atHigherLevels": ""
  },
  {
    "id": "ray-of-enfeeblement",
    "name": "Ray of Enfeeblement",
    "source": "PHB'24",
    "page": 311,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Grave (XGE) Cleric, Grave (XGE) Cleric, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "A beam of enervating energy shoots from you toward a creature within range. The target must make a Constitution saving throw. On a successful save, the target has Disadvantage on the next attack roll it makes until the start of your next turn.\n\nOn a failed save, the target has Disadvantage on Strength-based D20 Tests for the duration. During that time, it also subtracts 1d8 from all its damage rolls. The target repeats the save at the end of each of its turns, ending the spell on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "ray-of-frost",
    "name": "Ray of Frost",
    "source": "PHB'24",
    "page": 311,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Polar Land) (PHB'24) Druid, Sea (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 Cold damage, and its Speed is reduced by 10 feet until the start of your next turn.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
  },
  {
    "id": "ray-of-sickness",
    "name": "Ray of Sickness",
    "source": "PHB'24",
    "page": 311,
    "level": 1,
    "levelLabel": "1st",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (TCE) Artificer, Alchemist (EFA) Artificer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Tropical Land) (PHB'24) Druid, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Undying (SCAG) Warlock, Undying (SCAG) Warlock",
    "text": "You shoot a greenish ray at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 Poison damage and has the Poisoned condition until the end of your next turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
  },
  {
    "id": "regenerate",
    "name": "Regenerate",
    "source": "PHB'24",
    "page": 311,
    "level": 7,
    "levelLabel": "7th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a prayer wheel",
    "classes": [
      "Bard",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "A creature you touch regains 4d8 + 15 Hit Points. For the duration, the target regains 1 Hit Point at the start of each of its turns, and any severed body parts regrow after 2 minutes.",
    "atHigherLevels": ""
  },
  {
    "id": "reincarnate",
    "name": "Reincarnate",
    "source": "PHB'24",
    "page": 311,
    "level": 5,
    "levelLabel": "5th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "rare oils worth 1,000+ GP, which the spell consumes",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You touch a dead Humanoid or a piece of one. If the creature has been dead no longer than 10 days, the spell forms a new body for it and calls the soul to enter that body. Roll 1d10 and consult the table below to determine the body's species, or the DM chooses another playable species.\n\n1d10Species1Aasimar2Dragonborn3Dwarf4Elf5Gnome6Goliath7Halfling8Human9Orc10TieflingThe reincarnated creature makes any choices that a species' description offers, and the creature recalls its former life. It retains the capabilities it had in its original form, except it loses the traits of its previous species and gains the traits of its new one.",
    "atHigherLevels": ""
  },
  {
    "id": "remove-curse",
    "name": "Remove Curse",
    "source": "PHB'24",
    "page": 312,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Paladin",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Winter Walker (FRHoF) Ranger",
    "text": "At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner's Attunement to the object so it can be removed or discarded.",
    "atHigherLevels": ""
  },
  {
    "id": "resistance",
    "name": "Resistance",
    "source": "PHB'24",
    "page": 312,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You touch a willing creature and choose a damage type: Acid, Bludgeoning, Cold, Fire, Lightning, Necrotic, Piercing, Poison, Radiant, Slashing, or Thunder. When the creature takes damage of the chosen type before the spell ends, the creature reduces the total damage taken by 1d4. A creature can benefit from this spell only once per turn.",
    "atHigherLevels": ""
  },
  {
    "id": "resurrection",
    "name": "Resurrection",
    "source": "PHB'24",
    "page": 312,
    "level": 7,
    "levelLabel": "7th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a diamond worth 1,000+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "With a touch, you revive a dead creature that has been dead for no more than a century, didn't die of old age, and wasn't Undead when it died.\n\nThe creature returns to life with all its Hit Points. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds and restores any missing body parts.\n\nComing back from the dead is an ordeal. The target takes a -4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0.\n\nCasting this spell to revive a creature that has been dead for 365 days or longer taxes you. Until you finish a Long Rest, you can't cast spells again, and you have Disadvantage on D20 Tests.",
    "atHigherLevels": ""
  },
  {
    "id": "reverse-gravity",
    "name": "Reverse Gravity",
    "source": "PHB'24",
    "page": 312,
    "level": 7,
    "levelLabel": "7th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "100 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a lodestone and iron filings",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "This spell reverses gravity in a 50-foot-radius, 100-foot high Cylinder centered on a point within range. All creatures and objects in that area that aren't anchored to the ground fall upward and reach the top of the Cylinder. A creature can make a Dexterity saving throw to grab a fixed object it can reach, thus avoiding the fall upward.\n\nIf a ceiling or an anchored object is encountered in this upward fall, creatures and objects strike it just as they would during a downward fall. If an affected creature or object reaches the Cylinder's top without striking anything, it hovers there for the duration. When the spell ends, affected objects and creatures fall downward.",
    "atHigherLevels": ""
  },
  {
    "id": "revivify",
    "name": "Revivify",
    "source": "PHB'24",
    "page": 312,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a diamond worth 300+ GP, which the spell consumes",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Grave (XGE) Cleric, Grave (XGE) Cleric, Life (PHB'24) Cleric, Life (PHB'14) Cleric, Celestial (XGE) Warlock",
    "text": "You touch a creature that has died within the last minute. That creature revives with 1 Hit Point. This spell can't revive a creature that has died of old age, nor does it restore any missing body parts.",
    "atHigherLevels": ""
  },
  {
    "id": "rope-trick",
    "name": "Rope Trick",
    "source": "PHB'24",
    "page": 312,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a segment of rope",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Gloom Stalker (PHB'24) Ranger, Gloom Stalker (XGE) Ranger",
    "text": "You touch a rope. One end of it hovers upward until the rope hangs perpendicular to the ground or the rope reaches a ceiling. At the rope's upper end, an Invisible 3-foot-by-5-foot portal opens to an extradimensional space that lasts until the spell ends. That space can be reached by climbing the rope, which can be pulled into or dropped out of it.\n\nThe space can hold up to eight Medium or smaller creatures. Attacks, spells, and other effects can't pass into or out of the space, but creatures inside it can see through the portal. Anything inside the space drops out when the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "sacred-flame",
    "name": "Sacred Flame",
    "source": "PHB'24",
    "page": 313,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Celestial (XGE) Warlock",
    "text": "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 Radiant damage. The target gains no benefit from Half Cover or Three-Quarters Cover for this save.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
  },
  {
    "id": "sanctuary",
    "name": "Sanctuary",
    "source": "PHB'24",
    "page": 313,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a shard of glass from a mirror",
    "classes": [
      "Artificer",
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Devotion (PHB'14) Paladin, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Peace (TCE) Cleric, Peace (TCE) Cleric, Genie (Dao) (TCE) Warlock, Genie (Dao) (TCE) Warlock, Open Hand (PHB'14) Monk",
    "text": "You ward a creature within range. Until the spell ends, any creature who targets the warded creature with an attack roll or a damaging spell must succeed on a Wisdom saving throw or either choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from areas of effect.\n\nThe spell ends if the warded creature makes an attack roll, casts a spell, or deals damage.",
    "atHigherLevels": ""
  },
  {
    "id": "scorching-ray",
    "name": "Scorching Ray",
    "source": "PHB'24",
    "page": 313,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Wildfire (TCE) Druid, Wildfire (TCE) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Light (PHB'24) Cleric, Light (PHB'14) Cleric, Spellfire (FRHoF) Sorcerer, Fiend (PHB'14) Warlock, Genie (Efreeti) (TCE) Warlock, Genie (Efreeti) (TCE) Warlock",
    "text": "You hurl three fiery rays. You can hurl them at one target within range or at several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 Fire damage.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You create one additional ray for each spell slot level above 2."
  },
  {
    "id": "scrying",
    "name": "Scrying",
    "source": "PHB'24",
    "page": 313,
    "level": 5,
    "levelLabel": "5th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "10 Min.",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a focus worth 1,000+ GP, such as a crystal ball, mirror, or water-filled font",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Cartographer (EFA) Artificer, Land (Coast) (PHB'14) Druid, Land (Swamp) (PHB'14) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Knowledge (PHB'14) Cleric, Knowledge (FRHoF) Cleric, Light (PHB'14) Cleric, Light (PHB'24) Cleric, Vengeance (PHB'14) Paladin, Vengeance (PHB'24) Paladin, Watchers (TCE) Paladin, Watchers (TCE) Paladin",
    "text": "You can see and hear a creature you choose that is on the same plane of existence as you. The target makes a Wisdom saving throw, which is modified (see the tables below) by how well you know the target and the sort of physical connection you have to it. The target doesn't know what it is making the save against, only that it feels uneasy.\n\nYour Knowledge of the Target Is...Save ModifierSecondhand (heard of the target)+5Firsthand (met the target)+0Extensive (know the target well)-5You Have the Target's...Save ModifierPicture or other likeness-2Garment or other possession-4Body part, lock of hair, or bit of nail-10On a successful save, the target isn't affected, and you can't use this spell on it again for 24 hours.\n\nOn a failed save, the spell creates an Invisible, intangible sensor within 10 feet of the target. You can see and hear through the sensor as if you were there. The sensor moves with the target, remaining within 10 feet of it for the duration. If something can see the sensor, it appears as a luminous orb about the size of your fist.\n\nInstead of targeting a creature, you can target a location you have seen. When you do so, the sensor appears at that location and doesn't move.",
    "atHigherLevels": ""
  },
  {
    "id": "searing-smite",
    "name": "Searing Smite",
    "source": "PHB'24",
    "page": 314,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Forge (XGE) Cleric, Forge (XGE) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "As you hit the target, it takes an extra 1d6 Fire damage from the attack. At the start of each of its turns until the spell ends, the target takes 1d6 Fire damage and then makes a Constitution saving throw. On a failed save, the spell continues. On a successful save, the spell ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. All the damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "see-invisibility",
    "name": "See Invisibility",
    "source": "PHB'24",
    "page": 314,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of talc",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Light (PHB'24) Cleric, Watchers (TCE) Paladin, Watchers (TCE) Paladin, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "For the duration, you see creatures and objects that have the Invisible condition as if they were visible, and you can see into the Ethereal Plane. Creatures and objects there appear ghostly.",
    "atHigherLevels": ""
  },
  {
    "id": "seeming",
    "name": "Seeming",
    "source": "PHB'24",
    "page": 314,
    "level": 5,
    "levelLabel": "5th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "8 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Archfey (PHB'24) Warlock, Gloom Stalker (XGE) Ranger, Gloom Stalker (PHB'24) Ranger, Illusionist (PHB'24) Wizard, Archfey (PHB'14) Warlock, Genie (Djinni) (TCE) Warlock, Genie (Djinni) (TCE) Warlock",
    "text": "You give an illusory appearance to each creature of your choice that you can see within range. An unwilling target can make a Charisma saving throw, and if it succeeds, it is unaffected by this spell.\n\nYou can give the same appearance or different ones to the targets. The spell can change the appearance of the targets' bodies and equipment. You can make each creature seem 1 foot shorter or taller and appear heavier or lighter. A target's new appearance must have the same basic arrangement of limbs as the target, but the extent of the illusion is otherwise up to you. The spell lasts for the duration.\n\nThe changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to a creature's outfit, objects pass through the hat.\n\nA creature that takes the Study action to examine a target can make an Intelligence (Investigation) check against your spell save DC. If it succeeds, it becomes aware that the target is disguised.",
    "atHigherLevels": ""
  },
  {
    "id": "sending",
    "name": "Sending",
    "source": "PHB'24",
    "page": 314,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Unlimited",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a copper wire",
    "classes": [
      "Bard",
      "Cleric",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Peace (TCE) Cleric, Peace (TCE) Cleric, Great Old One (PHB'14) Warlock",
    "text": "You send a short message of 25 words or fewer to a creature you have met or a creature described to you by someone who has met it. The target hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. The spell enables targets to understand the meaning of your message.\n\nYou can send the message across any distance and even to other planes of existence, but if the target is on a different plane than you, there is a 5 percent chance that the message doesn't arrive. You know if the delivery fails.\n\nUpon receiving your message, a creature can block your ability to reach it again with this spell for 8 hours. If you try to send another message during that time, you learn that you are blocked, and the spell fails.",
    "atHigherLevels": ""
  },
  {
    "id": "sequester",
    "name": "Sequester",
    "source": "PHB'24",
    "page": 315,
    "level": 7,
    "levelLabel": "7th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Until dispelled",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "gem dust worth 5,000+ GP, which the spell consumes",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "With a touch, you magically sequester an object or a willing creature. For the duration, the target has the Invisible condition and can't be targeted by Divination spells, detected by magic, or viewed remotely with magic.\n\nIf the target is a creature, it enters a state of suspended animation; it has the Unconscious condition, doesn't age, and doesn't need food, water, or air.\n\nYou can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include \"after 1,000 years\" or \"when the tarrasque awakens.\" This spell also ends if the target takes any damage.",
    "atHigherLevels": ""
  },
  {
    "id": "shapechange",
    "name": "Shapechange",
    "source": "PHB'24",
    "page": 315,
    "level": 9,
    "levelLabel": "9th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a jade circlet worth 1,500+ GP",
    "classes": [
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You shape-shift into another creature for the duration or until you take a Magic action to shape-shift into a different eligible form. The new form must be of a creature that has a Challenge Rating no higher than your level or Challenge Rating. You must have seen the sort of creature before, and it can't be a Construct or an Undead.\n\nWhen you cast the spell, you gain a number of Temporary Hit Points equal to the Hit Points of the first form into which you shape-shift. These Temporary Hit Points vanish if any remain when the spell ends.\n\nYour game statistics are replaced by the stat block of the chosen form, but you retain your creature type; alignment; personality; Intelligence, Wisdom, and Charisma scores; Hit Points; Hit Point Dice; proficiencies; and ability to communicate. If you have the Spellcasting feature, you retain it too.\n\nUpon shape-shifting, you determine whether your equipment drops to the ground or changes in size and shape to fit the new form while you're in it.",
    "atHigherLevels": ""
  },
  {
    "id": "shatter",
    "name": "Shatter",
    "source": "PHB'24",
    "page": 316,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a chip of mica",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Sea (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "A loud noise erupts from a point of your choice within range. Each creature in a 10-foot-radius Sphere centered there makes a Constitution saving throw, taking 3d8 Thunder damage on a failed save or half as much damage on a successful one. A Construct has Disadvantage on the save.\n\nA nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2."
  },
  {
    "id": "shield",
    "name": "Shield",
    "source": "PHB'24",
    "page": 316,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Reaction",
    "duration": "1 round",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from Magic Missile.",
    "atHigherLevels": ""
  },
  {
    "id": "shield-of-faith",
    "name": "Shield of Faith",
    "source": "PHB'24",
    "page": 316,
    "level": 1,
    "levelLabel": "1st",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a prayer scroll",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Devotion (PHB'24) Paladin, War (PHB'24) Cleric, War (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "A shimmering field surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.",
    "atHigherLevels": ""
  },
  {
    "id": "shillelagh",
    "name": "Shillelagh",
    "source": "PHB'24",
    "page": 316,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "mistletoe",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "A Club or Quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon's damage die becomes a d8. If the attack deals damage, it can be Force damage or the weapon's normal damage type (your choice).\n\nThe spell ends early if you cast it again or if you let go of the weapon.",
    "atHigherLevels": "Cantrip Upgrade. The damage die changes when you reach levels 5 (d10), 11 (d12), and 17 (2d6)."
  },
  {
    "id": "shining-smite",
    "name": "Shining Smite",
    "source": "PHB'24",
    "page": 316,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "The target hit by the strike takes an extra 2d6 Radiant damage from the attack. Until the spell ends, the target sheds Bright Light in a 5-foot radius, attack rolls against it have Advantage, and it can't benefit from the Invisible condition.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 2."
  },
  {
    "id": "shocking-grasp",
    "name": "Shocking Grasp",
    "source": "PHB'24",
    "page": 316,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Temperate Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "Lightning springs from you to a creature that you try to touch. Make a melee spell attack against the target. On a hit, the target takes 1d8 Lightning damage, and it can't make Opportunity Attacks until the start of its next turn.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
  },
  {
    "id": "silence",
    "name": "Silence",
    "source": "PHB'24",
    "page": 316,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Illusion",
    "ritual": true,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Desert) (PHB'14) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock, Undying (SCAG) Warlock, Undying (SCAG) Warlock, Shadow (PHB'14) Monk",
    "text": "For the duration, no sound can be created within or pass through a 20-foot-radius Sphere centered on a point you choose within range. Any creature or object entirely inside the Sphere has Immunity to Thunder damage, and creatures have the Deafened condition while entirely inside it. Casting a spell that includes a Verbal component is impossible there.",
    "atHigherLevels": ""
  },
  {
    "id": "silent-image",
    "name": "Silent Image",
    "source": "PHB'24",
    "page": 317,
    "level": 1,
    "levelLabel": "1st",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of fleece",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Illusionist (PHB'24) Wizard",
    "text": "You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot Cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn't accompanied by sound, smell, or other sensory effects.\n\nAs a Magic action, you can cause the image to move to any spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking.\n\nPhysical interaction with the image reveals it to be an illusion, since things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image.",
    "atHigherLevels": ""
  },
  {
    "id": "simulacrum",
    "name": "Simulacrum",
    "source": "PHB'24",
    "page": 317,
    "level": 7,
    "levelLabel": "7th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "12 Hr.",
    "duration": "Until dispelled",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "powdered ruby worth 1,500+ GP, which the spell consumes",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Illusionist (PHB'24) Wizard",
    "text": "You create a simulacrum of one Beast or Humanoid that is within 10 feet of you for the entire casting of the spell. You finish the casting by touching both the creature and a pile of ice or snow that is the same size as that creature, and the pile turns into the simulacrum, which is a creature. It uses the game statistics of the original creature at the time of casting, except it is a Construct, its Hit Point maximum is half as much, and it can't cast this spell.\n\nThe simulacrum is Friendly to you and creatures you designate. It obeys your commands and acts on your turn in combat. The simulacrum can't gain levels, and it can't take Short or Long Rests.\n\nIf the simulacrum takes damage, the only way to restore its Hit Points is to repair it as you take a Long Rest, during which you expend components worth 100 GP per Hit Point restored. The simulacrum must stay within 5 feet of you for the repair.\n\nThe simulacrum lasts until it drops to 0 Hit Points, at which point it reverts to snow and melts away. If you cast this spell again, any simulacrum you created with this spell is instantly destroyed.",
    "atHigherLevels": ""
  },
  {
    "id": "sleep",
    "name": "Sleep",
    "source": "PHB'24",
    "page": 317,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pinch of sand or rose petals",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Archfey (PHB'24) Warlock, Land (Temperate Land) (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Archfey (PHB'14) Warlock, Twilight (TCE) Cleric, Twilight (TCE) Cleric",
    "text": "Each creature of your choice in a 5-foot-radius Sphere centered on a point within range must succeed on a Wisdom saving throw or have the Incapacitated condition until the end of its next turn, at which point it must repeat the save. If the target fails the second save, the target has the Unconscious condition for the duration. The spell ends on a target if it takes damage or someone within 5 feet of it takes an action to shake it out of the spell's effect.\n\nCreatures that don't sleep, such as elves, or that have Immunity to the Exhaustion condition automatically succeed on saves against this spell.",
    "atHigherLevels": ""
  },
  {
    "id": "sleet-storm",
    "name": "Sleet Storm",
    "source": "PHB'24",
    "page": 317,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a miniature umbrella",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Polar Land) (PHB'24) Druid, Land (Arctic) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock, Genie (Marid) (TCE) Warlock, Genie (Marid) (TCE) Warlock",
    "text": "Until the spell ends, sleet falls in a 40-foot-tall, 20-foot-radius Cylinder centered on a point you choose within range. The area is Heavily Obscured, and exposed flames in the area are doused.\n\nGround in the Cylinder is Difficult Terrain. When a creature enters the Cylinder for the first time on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the Prone condition and lose Concentration.",
    "atHigherLevels": ""
  },
  {
    "id": "slow",
    "name": "Slow",
    "source": "PHB'24",
    "page": 318,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of molasses",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Arctic) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Order (TCE) Cleric, Order (TCE) Cleric",
    "text": "You alter time around up to six creatures of your choice in a 40-foot Cube within range. Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration.\n\nAn affected target's Speed is halved, it takes a -2 penalty to AC and Dexterity saving throws, and it can't take Reactions. On its turns, it can take either an action or a Bonus Action, not both, and it can make only one attack if it takes the Attack action. If it casts a spell with a Somatic component, there is a 25 percent chance the spell fails as a result of the target making the spell's gestures too slowly.\n\nAn affected target repeats the save at the end of each of its turns, ending the spell on itself on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "sorcerous-burst",
    "name": "Sorcerous Burst",
    "source": "PHB'24",
    "page": 318,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You cast sorcerous energy at one creature or object within range. Make a ranged attack roll against the target. On a hit, the target takes 1d8 damage of a type you choose: Acid, Cold, Fire, Lightning, Poison, Psychic, or Thunder.\n\nIf you roll an 8 on a d8 for this spell, you can roll another d8, and add it to the damage. When you cast this spell, the maximum number of these d8s you can add to the spell's damage equals your spellcasting ability modifier.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
  },
  {
    "id": "spare-the-dying",
    "name": "Spare the Dying",
    "source": "PHB'24",
    "page": 318,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "15 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Grave (XGE) Cleric, Grave (XGE) Cleric, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Undying (SCAG) Warlock, Undying (SCAG) Warlock, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "Choose a creature within range that has 0 Hit Points and isn't dead. The creature becomes Stable.",
    "atHigherLevels": "Cantrip Upgrade. The range doubles when you reach levels 5 (30 feet), 11 (60 feet), and 17 (120 feet)."
  },
  {
    "id": "speak-with-animals",
    "name": "Speak with Animals",
    "source": "PHB'24",
    "page": 318,
    "level": 1,
    "levelLabel": "1st",
    "school": "Divination",
    "ritual": true,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid",
      "Ranger",
      "Warlock"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Ancients (PHB'14) Paladin, Ancients (PHB'24) Paladin, Totem Warrior (PHB'14) Barbarian, Wild Heart (PHB'24) Barbarian",
    "text": "For the duration, you can comprehend and verbally communicate with Beasts, and you can use any of the Influence action's skill options with them.\n\nMost Beasts have little to say about topics that don't pertain to survival or companionship, but at minimum, a Beast can give you information about nearby locations and monsters, including whatever it has perceived within the past day.",
    "atHigherLevels": ""
  },
  {
    "id": "speak-with-dead",
    "name": "Speak with Dead",
    "source": "PHB'24",
    "page": 318,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "10 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "burning incense",
    "classes": [
      "Bard",
      "Cleric",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (PHB'14) Cleric, Undead (VRGR) Warlock, Undead (VRGR) Warlock, Undying (SCAG) Warlock, Undying (SCAG) Warlock",
    "text": "You grant the semblance of life to a corpse of your choice within range, allowing it to answer questions you pose. The corpse must have a mouth, and this spell fails if the deceased creature was Undead when it died. The spell also fails if the corpse was the target of this spell within the past 10 days.\n\nUntil the spell ends, you can ask the corpse up to five questions. The corpse knows only what it knew in life, including the languages it knew. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are antagonistic toward it or it recognizes you as an enemy. This spell doesn't return the creature's soul to its body, only its animating spirit. Thus, the corpse can't learn new information, doesn't comprehend anything that has happened since it died, and can't speculate about future events.",
    "atHigherLevels": ""
  },
  {
    "id": "speak-with-plants",
    "name": "Speak with Plants",
    "source": "PHB'24",
    "page": 319,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard",
    "text": "You imbue plants in an immobile 30-foot Emanation with limited sentience and animation, giving them the ability to communicate with you and follow your simple commands. You can question plants about events in the spell's area within the past day, gaining information about creatures that have passed, weather, and other circumstances.\n\nYou can also turn Difficult Terrain caused by plant growth (such as thickets and undergrowth) into ordinary terrain that lasts for the duration. Or you can turn ordinary terrain where plants are present into Difficult Terrain that lasts for the duration.\n\nThe spell doesn't enable plants to uproot themselves and move about, but they can move their branches, tendrils, and stalks for you.\n\nIf a Plant creature is in the area, you can communicate with it as if you shared a common language.",
    "atHigherLevels": ""
  },
  {
    "id": "spider-climb",
    "name": "Spider Climb",
    "source": "PHB'24",
    "page": 319,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of bitumen and a spider",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Forest) (PHB'14) Druid, Land (Mountain) (PHB'14) Druid, Land (Underdark) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and along ceilings, while leaving its hands free. The target also gains a Climb Speed equal to its Speed.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2."
  },
  {
    "id": "spike-growth",
    "name": "Spike Growth",
    "source": "PHB'24",
    "page": 319,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "seven thorns",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Arctic) (PHB'14) Druid, Land (Mountain) (PHB'14) Druid, Lore (PHB'24) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Genie (Dao) (TCE) Warlock, Genie (Dao) (TCE) Warlock",
    "text": "The ground in a 20-foot-radius Sphere centered on a point within range sprouts hard spikes and thorns. The area becomes Difficult Terrain for the duration. When a creature moves into or within the area, it takes 2d4 Piercing damage for every 5 feet it travels.\n\nThe transformation of the ground is camouflaged to look natural. Any creature that can't see the area when the spell is cast must take a Search action and succeed on a Wisdom (Perception or Survival) check against your spell save DC to recognize the terrain as hazardous before entering it.",
    "atHigherLevels": ""
  },
  {
    "id": "spirit-guardians",
    "name": "Spirit Guardians",
    "source": "PHB'24",
    "page": 319,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a prayer scroll",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Crown (SCAG) Paladin, Crown (SCAG) Paladin, War (PHB'24) Cleric, War (PHB'14) Cleric",
    "text": "Protective spirits flit around you in a 15-foot Emanation for the duration. If you are good or neutral, their spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish.\n\nWhen you cast this spell, you can designate creatures to be unaffected by it. Any other creature's Speed is halved in the Emanation, and whenever the Emanation enters a creature's space and whenever a creature enters the Emanation or ends its turn there, the creature must make a Wisdom saving throw. On a failed save, the creature takes 3d8 Radiant damage (if you are good or neutral) or 3d8 Necrotic damage (if you are evil). On a successful save, the creature takes half as much damage. A creature makes this save only once per turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 3."
  },
  {
    "id": "spiritual-weapon",
    "name": "Spiritual Weapon",
    "source": "PHB'24",
    "page": 319,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Life (PHB'14) Cleric, Conquest (XGE) Paladin, Conquest (XGE) Paladin, War (PHB'24) Cleric, War (PHB'14) Cleric",
    "text": "You create a floating, spectral force that resembles a weapon of your choice and lasts for the duration. The force appears within range in a space of your choice, and you can immediately make one melee spell attack against one creature within 5 feet of the force. On a hit, the target takes Force damage equal to 1d8 plus your spellcasting ability modifier.\n\nAs a Bonus Action on your later turns, you can move the force up to 20 feet and repeat the attack against a creature within 5 feet of it.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for every slot level above 2."
  },
  {
    "id": "staggering-smite",
    "name": "Staggering Smite",
    "source": "PHB'24",
    "page": 320,
    "level": 4,
    "levelLabel": "4th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "The target takes an extra 4d6 Psychic damage from the attack, and the target must succeed on a Wisdom saving throw or have the Stunned condition until the end of your next turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The extra damage increases by 1d6 for each spell slot level above 4."
  },
  {
    "id": "starry-wisp",
    "name": "Starry Wisp",
    "source": "PHB'24",
    "page": 320,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (PHB'14) Druid, Moon (PHB'24) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You launch a mote of light at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 Radiant damage, and until the end of your next turn, it emits Dim Light in a 10-foot radius and can't benefit from the Invisible condition.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
  },
  {
    "id": "steel-wind-strike",
    "name": "Steel Wind Strike",
    "source": "PHB'24",
    "page": 320,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "S",
      "M"
    ],
    "material": "a Melee weapon worth 1+ SP",
    "classes": [
      "Ranger",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "War (PHB'24) Cleric",
    "text": "You flourish the weapon used in the casting and then vanish to strike like the wind. Choose up to five creatures you can see within range. Make a melee spell attack against each target. On a hit, a target takes 6d10 Force damage.\n\nYou then teleport to an unoccupied space you can see within 5 feet of one of the targets.",
    "atHigherLevels": ""
  },
  {
    "id": "stinking-cloud",
    "name": "Stinking Cloud",
    "source": "PHB'24",
    "page": 321,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a rotten egg",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Tropical Land) (PHB'24) Druid, Land (Swamp) (PHB'14) Druid, Land (Underdark) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fiend (PHB'24) Warlock, Fiend (PHB'14) Warlock",
    "text": "You create a 20-foot-radius Sphere of yellow, nauseating gas centered on a point within range. The cloud is Heavily Obscured. The cloud lingers in the air for the duration or until a strong wind (such as the one created by Gust of Wind) disperses it.\n\nEach creature that starts its turn in the Sphere must succeed on a Constitution saving throw or have the Poisoned condition until the end of the current turn. While Poisoned in this way, the creature can't take an action or a Bonus Action.",
    "atHigherLevels": ""
  },
  {
    "id": "stone-shape",
    "name": "Stone Shape",
    "source": "PHB'24",
    "page": 321,
    "level": 4,
    "levelLabel": "4th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "soft clay",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Land (Mountain) (PHB'14) Druid, Land (Underdark) (PHB'14) Druid, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Genie (Dao) (TCE) Warlock, Genie (Dao) (TCE) Warlock",
    "text": "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape you like. For example, you could shape a large rock into a weapon, statue, or coffer, or you could make a small passage through a wall that is 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn't possible.",
    "atHigherLevels": ""
  },
  {
    "id": "stoneskin",
    "name": "Stoneskin",
    "source": "PHB'24",
    "page": 321,
    "level": 4,
    "levelLabel": "4th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "diamond dust worth 100+ GP, which the spell consumes",
    "classes": [
      "Artificer",
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Land (Mountain) (PHB'14) Druid, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Conquest (XGE) Paladin, Conquest (XGE) Paladin, Redemption (XGE) Paladin, Redemption (XGE) Paladin, Ancients (PHB'14) Paladin, Ancients (PHB'24) Paladin, War (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "Until the spell ends, one willing creature you touch has Resistance to Bludgeoning, Piercing, and Slashing damage.",
    "atHigherLevels": ""
  },
  {
    "id": "storm-of-vengeance",
    "name": "Storm of Vengeance",
    "source": "PHB'24",
    "page": 321,
    "level": 9,
    "levelLabel": "9th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "1 mile",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "A churning storm cloud forms for the duration, centered on a point within range and spreading to a radius of 300 feet. Each creature under the cloud when it appears must succeed on a Constitution saving throw or take 2d6 Thunder damage and have the Deafened condition for the duration.\n\nAt the start of each of your later turns, the storm produces different effects, as detailed below.\n\nTurn 2. Acidic rain falls. Each creature and object under the cloud takes 4d6 Acid damage.\n\nTurn 3. You call six bolts of lightning from the cloud to strike six different creatures or objects beneath it. Each target makes a Dexterity saving throw, taking 10d6 Lightning damage on a failed save or half as much damage on a successful one.\n\nTurn 4. Hailstones rain down. Each creature under the cloud takes 2d6 Bludgeoning damage.\n\nTurns 5-10. Gusts and freezing rain assail the area under the cloud. Each creature there takes 1d6 Cold damage. Until the spell ends, the area is Difficult Terrain and Heavily Obscured, ranged attacks with weapons are impossible there, and strong wind blows through the area.",
    "atHigherLevels": ""
  },
  {
    "id": "suggestion",
    "name": "Suggestion",
    "source": "PHB'24",
    "page": 321,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 8 hours",
    "range": "30 feet",
    "components": [
      "V",
      "M"
    ],
    "material": "a drop of honey",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fiend (PHB'24) Warlock, Knowledge (PHB'14) Cleric",
    "text": "You suggest a course of activity—described in no more than 25 words—to one creature you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to the target or its allies. For example, you could say, \"Fetch the key to the cult's treasure vault, and give the key to me.\" Or you could say, \"Stop fighting, leave this library peacefully, and don't return.\"\n\nThe target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. The Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for the target upon completing it.",
    "atHigherLevels": ""
  },
  {
    "id": "summon-aberration",
    "name": "Summon Aberration",
    "source": "PHB'24",
    "page": 322,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pickled tentacle and an eyeball in a platinum-inlaid vial worth 400+ GP",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Great Old One (PHB'24) Warlock",
    "text": "You call forth an aberrant spirit. It manifests in an unoccupied space that you can see within range and uses the Aberrant Spirit stat block. When you cast the spell, choose Beholderkin, Mind Flayer, or Slaad. The creature resembles an Aberration of that kind, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, it shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-beast",
    "name": "Summon Beast",
    "source": "PHB'24",
    "page": 322,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a feather, tuft of fur, and fish tail inside a gilded acorn worth 200+ GP",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Illusionist (PHB'24) Wizard",
    "text": "You call forth a bestial spirit. It manifests in an unoccupied space that you can see within range and uses the Bestial Spirit stat block. When you cast the spell, choose an environment: Air, Land, or Water. The creature resembles an animal of your choice that is native to the chosen environment, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-celestial",
    "name": "Summon Celestial",
    "source": "PHB'24",
    "page": 323,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a reliquary worth 500+ GP",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Celestial (PHB'24) Warlock, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You call forth a Celestial spirit. It manifests in an angelic form in an unoccupied space that you can see within range and uses the Celestial Spirit stat block. When you cast the spell, choose Avenger or Defender. Your choice determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-construct",
    "name": "Summon Construct",
    "source": "PHB'24",
    "page": 324,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a lockbox worth 400+ GP",
    "classes": [
      "Artificer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter",
    "text": "You call forth the spirit of a Construct. It manifests in an unoccupied space that you can see within range and uses the Construct Spirit stat block. When you cast the spell, choose a material: Clay, Metal, or Stone. The creature resembles an animate statue (you determine the appearance) made of the chosen material, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-dragon",
    "name": "Summon Dragon",
    "source": "PHB'24",
    "page": 324,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "an object with the image of a dragon engraved on it worth 500+ GP",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Draconic (PHB'24) Sorcerer",
    "text": "You call forth a Dragon spirit. It manifests in an unoccupied space that you can see within range and uses the Draconic Spirit stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-elemental",
    "name": "Summon Elemental",
    "source": "PHB'24",
    "page": 325,
    "level": 4,
    "levelLabel": "4th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "air, a pebble, ash, and water inside a gold-inlaid vial worth 400+ GP",
    "classes": [
      "Druid",
      "Ranger",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Noble Genies (FRHoF) Paladin, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock",
    "text": "You call forth an Elemental spirit. It manifests in an unoccupied space that you can see within range and uses the Elemental Spirit stat block. When you cast the spell, choose an element: Air, Earth, Fire, or Water. The creature resembles a bipedal form wreathed in the chosen element, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-fey",
    "name": "Summon Fey",
    "source": "PHB'24",
    "page": 326,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a gilded flower worth 300+ GP",
    "classes": [
      "Druid",
      "Ranger",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Fey Wanderer (PHB'24) Ranger, Illusionist (PHB'24) Wizard",
    "text": "You call forth a Fey spirit. It manifests in an unoccupied space that you can see within range and uses the Fey Spirit stat block. When you cast the spell, choose a mood: Fuming, Mirthful, or Tricksy. The creature resembles a Fey creature of your choice marked by the chosen mood, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-fiend",
    "name": "Summon Fiend",
    "source": "PHB'24",
    "page": 326,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bloody vial worth 600+ GP",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You call forth a fiendish spirit. It manifests in an unoccupied space that you can see within range and uses the Fiendish Spirit stat block. When you cast the spell, choose Demon, Devil, or Yugoloth. The creature resembles a Fiend of the chosen type, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "summon-undead",
    "name": "Summon Undead",
    "source": "PHB'24",
    "page": 328,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "90 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a gilded skull worth 300+ GP",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You call forth an Undead spirit. It manifests in an unoccupied space that you can see within range and uses the Undead Spirit stat block. When you cast the spell, choose the creature's form: Ghostly, Putrid, or Skeletal. The spirit resembles an Undead creature with the chosen form, which determines certain details in its stat block. The creature disappears when it drops to 0 Hit Points or when the spell ends.\n\nThe creature is an ally to you and your allies. In combat, the creature shares your Initiative count, but it takes its turn immediately after yours. It obeys your verbal commands (no action required by you). If you don't issue any, it takes the Dodge action and uses its movement to avoid danger.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block."
  },
  {
    "id": "sunbeam",
    "name": "Sunbeam",
    "source": "PHB'24",
    "page": 329,
    "level": 6,
    "levelLabel": "6th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a magnifying glass",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Evoker (PHB'24) Wizard",
    "text": "You launch a sunbeam in a 5-foot-wide, 60-foot-long Line. Each creature in the Line makes a Constitution saving throw. On a failed save, a creature takes 6d8 Radiant damage and has the Blinded condition until the start of your next turn. On a successful save, it takes half as much damage only.\n\nUntil the spell ends, you can take a Magic action to create a new Line of radiance.\n\nFor the duration, a mote of brilliant radiance shines above you. It sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet. This light is sunlight.",
    "atHigherLevels": ""
  },
  {
    "id": "sunburst",
    "name": "Sunburst",
    "source": "PHB'24",
    "page": 329,
    "level": 8,
    "levelLabel": "8th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a piece of sunstone",
    "classes": [
      "Cleric",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Evoker (PHB'24) Wizard",
    "text": "Brilliant sunlight flashes in a 60-foot-radius Sphere centered on a point you choose within range. Each creature in the Sphere makes a Constitution saving throw. On a failed save, a creature takes 12d6 Radiant damage and has the Blinded condition for 1 minute. On a successful save, it takes half as much damage only.\n\nA creature Blinded by this spell makes another Constitution saving throw at the end of each of its turns, ending the effect on itself on a success.\n\nThis spell dispels Darkness in its area that was created by any spell.",
    "atHigherLevels": ""
  },
  {
    "id": "swift-quiver",
    "name": "Swift Quiver",
    "source": "PHB'24",
    "page": 329,
    "level": 5,
    "levelLabel": "5th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a Quiver worth 1+ GP",
    "classes": [
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "When you cast the spell and as a Bonus Action until it ends, you can make two attacks with a weapon that fires Arrows or Bolts, such as a Longbow or a Light Crossbow. The spell magically creates the ammunition needed for each attack. Each Arrow or Bolt created by the spell deals damage like a nonmagical piece of ammunition of its kind and disintegrates immediately after it hits or misses.",
    "atHigherLevels": ""
  },
  {
    "id": "symbol",
    "name": "Symbol",
    "source": "PHB'24",
    "page": 329,
    "level": 7,
    "levelLabel": "7th",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Until dispelled or triggered",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "powdered diamond worth 1,000+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Cleric",
      "Druid",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Abjurer (PHB'24) Wizard, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You inscribe a harmful glyph either on a surface (such as a section of floor or wall) or within an object that can be closed (such as a book or chest). The glyph can cover an area no larger than 10 feet in diameter. If you choose an object, it must remain in place; if it is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered.\n\nThe glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice.\n\nWhen you inscribe the glyph, you set its trigger and choose which effect the symbol bears: Death, Discord, Fear, Pain, Sleep, or Stunning. Each one is explained below.\n\nSet the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph.\n\nYou can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don't trigger the glyph, such as those who say a certain password.\n\nOnce triggered, the glyph glows, filling a 60-foot-radius Sphere with Dim Light for 10 minutes, after which time the spell ends. Each creature in the Sphere when the glyph activates is targeted by its effect, as is a creature that enters the Sphere for the first time on a turn or ends its turn there. A creature is targeted only once per turn.\n\nDeath. Each target makes a Constitution saving throw, taking 10d10 Necrotic damage on a failed save or half as much damage on a successful save.\n\nDiscord. Each target makes a Wisdom saving throw. On a failed save, a target argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has Disadvantage on attack rolls and ability checks.\n\nFear. Each target must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute. While Frightened, the target must move at least 30 feet away from the glyph on each of its turns, if able.\n\nPain. Each target must succeed on a Constitution saving throw or have the Incapacitated condition for 1 minute.\n\nSleep. Each target must succeed on a Wisdom saving throw or have the Unconscious condition for 10 minutes. A creature awakens if it takes damage or if someone takes an action to shake it awake.\n\nStunning. Each target must succeed on a Wisdom saving throw or have the Stunned condition for 1 minute.",
    "atHigherLevels": ""
  },
  {
    "id": "synaptic-static",
    "name": "Synaptic Static",
    "source": "PHB'24",
    "page": 330,
    "level": 5,
    "levelLabel": "5th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Knowledge (FRHoF) Cleric",
    "text": "You cause psychic energy to erupt at a point within range. Each creature in a 20-foot-radius Sphere centered on that point makes an Intelligence saving throw, taking 8d6 Psychic damage on a failed save or half as much damage on a successful one.\n\nOn a failed save, a target also has muddled thoughts for 1 minute. During that time, it subtracts 1d6 from all its attack rolls and ability checks, as well as any Constitution saving throws to maintain Concentration. The target makes an Intelligence saving throw at the end of each of its turns, ending the effect on itself on a success.",
    "atHigherLevels": ""
  },
  {
    "id": "tashas-bubbling-cauldron",
    "name": "Tasha's Bubbling Cauldron",
    "source": "PHB'24",
    "page": 330,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "5 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a gilded ladle worth 500 + GP",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (EFA) Artificer, Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You conjure a claw-footed cauldron filled with bubbling liquid. The cauldron appears in an unoccupied space on the ground within 5 feet of you and lasts for the duration. The cauldron can't be moved and disappears when the spell ends, along with the bubbling liquid inside it.\n\nThe liquid in the cauldron duplicates the properties of a Common or an Uncommon potion of your choice (such as a Potion of Healing). As a Bonus Action, you or an ally can reach into the cauldron and withdraw one potion of that kind. The potion is contained in a vial that disappears when the potion is consumed. The cauldron can produce a number of these potions equal to your spellcasting ability modifier (minimum 1). When the last of these potions is withdrawn from the cauldron, the cauldron disappears, and the spell ends.\n\nPotions obtained from the cauldron that aren't consumed disappear when you cast this spell again.",
    "atHigherLevels": ""
  },
  {
    "id": "tashas-hideous-laughter",
    "name": "Tasha's Hideous Laughter",
    "source": "PHB'24",
    "page": 331,
    "level": 1,
    "levelLabel": "1st",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a tart and a feather",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Great Old One (PHB'24) Warlock, Great Old One (PHB'14) Warlock",
    "text": "One creature of your choice that you can see within range makes a Wisdom saving throw. On a failed save, it has the Prone and Incapacitated conditions for the duration. During that time, it laughs uncontrollably if it's capable of laughter, and it can't end the Prone condition on itself.\n\nAt the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has Advantage on the save if the save is triggered by damage. On a successful save, the spell ends.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
  },
  {
    "id": "telekinesis",
    "name": "Telekinesis",
    "source": "PHB'24",
    "page": 331,
    "level": 5,
    "levelLabel": "5th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Aberrant Mind (TCE) Sorcerer, Aberrant (PHB'24) Sorcerer, Great Old One (PHB'24) Warlock, Psi Warrior (TCE) Fighter, Psi Warrior (PHB'24) Fighter, Great Old One (PHB'14) Warlock",
    "text": "You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell and as a Magic action on your later turns before the spell ends, you can exert your will on one creature or object that you can see within range, causing the appropriate effect below. You can affect the same target round after round or choose a new one at any time. If you switch targets, the prior target is no longer affected by the spell.\n\nCreature. You can try to move a Huge or smaller creature. The target must succeed on a Strength saving throw, or you move it up to 30 feet in any direction within the spell's range. Until the end of your next turn, the creature has the Restrained condition, and if you lift it into the air, it is suspended there. It falls at the end of your next turn unless you use this option on it again and it fails the save.\n\nObject. You can try to move a Huge or smaller object. If the object isn't being worn or carried, you automatically move it up to 30 feet in any direction within the spell's range.\n\nIf the object is worn or carried by a creature, that creature must succeed on a Strength saving throw, or you pull the object away and move it up to 30 feet in any direction within the spell's range.\n\nYou can exert fine control on objects with your telekinetic grip, such as manipulating a simple tool, opening a door or a container, stowing or retrieving an item from an open container, or pouring the contents from a vial.",
    "atHigherLevels": ""
  },
  {
    "id": "telepathy",
    "name": "Telepathy",
    "source": "PHB'24",
    "page": 331,
    "level": 8,
    "levelLabel": "8th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "Unlimited",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pair of linked silver rings",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Diviner (PHB'24) Wizard",
    "text": "You create a telepathic link between yourself and a willing creature with which you are familiar. The creature can be anywhere on the same plane of existence as you. The spell ends if you or the target are no longer on the same plane.\n\nUntil the spell ends, you and the target can instantly share words, images, sounds, and other sensory messages with each other through the link, and the target recognizes you as the creature it is communicating with. The spell enables a creature to understand the meaning of your words and any sensory messages you send to it.",
    "atHigherLevels": ""
  },
  {
    "id": "teleport",
    "name": "Teleport",
    "source": "PHB'24",
    "page": 331,
    "level": 7,
    "levelLabel": "7th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "10 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "This spell instantly transports you and up to eight willing creatures that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be Large or smaller, and it can't be held or carried by an unwilling creature.\n\nThe destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The DM rolls 1d100 and consults the Teleportation Outcome table and the explanations after it.\n\nTeleportation OutcomeFamiliarityMishapSimilar AreaOff TargetOn TargetPermanent circle———01-00Linked object———01-00Very familiar01-0506-1314-2425-00Seen casually01-3334-4344-5354-00Viewed once or described01-4344-5354-7374-00False destination01-5051-00—— Familiarity. Here are the meanings of the terms in the table's Familiarity column:\n\n\"Permanent circle\" means a permanent teleportation circle whose sigil sequence you know.\"Linked object\" means you possess an object taken from the desired destination within the last six months, such as a book from a wizard's library.\"Very familiar\" is a place you have visited often, a place you have carefully studied, or a place you can see when you cast the spell.\"Seen casually\" is a place you have seen more than once but with which you aren't very familiar.\"Viewed once or described\" is a place you have seen once, possibly using magic, or a place you know through someone else's description, perhaps from a map.\"False destination\" is a place that doesn't exist. Perhaps you tried to scry an enemy's sanctum but instead viewed an illusion, or you are attempting to teleport to a location that no longer exists. Mishap. The spell's unpredictable magic results in a difficult journey. Each teleporting creature (or the target object) takes 3d10 Force damage, and the DM rerolls on the table to see where you wind up (multiple mishaps can occur, dealing damage each time).\n\nSimilar Area. You and your group (or the target object) appear in a different area that's visually or thematically similar to the target area. You appear in the closest similar place. If you are heading for your home laboratory, for example, you might appear in another person's laboratory in the same city.\n\nOff Target. You and your group (or the target object) appear 2d12 miles away from the destination in a random direction. Roll 1d8 for the direction: 1, east; 2, southeast; 3, south; 4, southwest; 5, west; 6, northwest; 7, north; or 8, northeast.\n\nOn Target. You and your group (or the target object) appear where you intended.",
    "atHigherLevels": ""
  },
  {
    "id": "teleportation-circle",
    "name": "Teleportation Circle",
    "source": "PHB'24",
    "page": 332,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "1 round",
    "range": "10 feet",
    "components": [
      "V",
      "M"
    ],
    "material": "rare inks worth 50+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Cartographer (EFA) Artificer, Horizon Walker (XGE) Ranger, Horizon Walker (XGE) Ranger",
    "text": "As you cast the spell, you draw a 5-foot-radius circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space if that space is occupied.\n\nMany major temples, guildhalls, and other important places have permanent teleportation circles. Each circle includes a unique sigil sequence—a string of runes arranged in a particular pattern.\n\nWhen you first gain the ability to cast this spell, you learn the sigil sequences for two destinations on the Material Plane, determined by the DM. You might learn additional sigil sequences during your adventures. You can commit a new sigil sequence to memory after studying it for 1 minute.\n\nYou can create a permanent teleportation circle by casting this spell in the same location every day for 365 days.",
    "atHigherLevels": ""
  },
  {
    "id": "tensers-floating-disk",
    "name": "Tenser's Floating Disk",
    "source": "PHB'24",
    "page": 332,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": true,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of mercury",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "This spell creates a circular, horizontal plane of force, 3 feet in diameter and 1 inch thick, that floats 3 feet above the ground in an unoccupied space of your choice that you can see within range. The disk remains for the duration and can hold up to 500 pounds. If more weight is placed on it, the spell ends, and everything on the disk falls to the ground.\n\nThe disk is immobile while you are within 20 feet of it. If you move more than 20 feet away from it, the disk follows you so that it remains within 20 feet of you. It can move across uneven terrain, up or down stairs, slopes and the like, but it can't cross an elevation change of 10 feet or more. For example, the disk can't move across a 10-foot-deep pit, nor could it leave such a pit if it was created at the bottom.\n\nIf you move more than 100 feet from the disk (typically because it can't move around an obstacle to follow you), the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "thaumaturgy",
    "name": "Thaumaturgy",
    "source": "PHB'24",
    "page": 333,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 minute",
    "range": "30 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Drakewarden (FTD) Ranger, Drakewarden (FTD) Ranger, Giant (BGG) Barbarian, Giant (BGG) Barbarian",
    "text": "You manifest a minor wonder within range. You create one of the effects below within range. If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time.\n\nAltered Eyes. You alter the appearance of your eyes for 1 minute.\n\nBooming Voice. Your voice booms up to three times as loud as normal for 1 minute. For the duration, you have Advantage on Charisma (Intimidation) checks.\n\nFire Play. You cause flames to flicker, brighten, dim, or change color for 1 minute.\n\nInvisible Hand. You instantaneously cause an unlocked door or window to fly open or slam shut.\n\nPhantom Sound. You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers.\n\nTremors. You cause harmless tremors in the ground for 1 minute.",
    "atHigherLevels": ""
  },
  {
    "id": "thorn-whip",
    "name": "Thorn Whip",
    "source": "PHB'24",
    "page": 333,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "the stem of a plant with thorns",
    "classes": [
      "Artificer",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "You create a vine-like whip covered in thorns that lashes out at your command toward a creature in range. Make a melee spell attack against the target. On a hit, the target takes 1d6 Piercing damage, and if it is Large or smaller, you can pull it up to 10 feet closer to you.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
  },
  {
    "id": "thunderclap",
    "name": "Thunderclap",
    "source": "PHB'24",
    "page": 333,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "S"
    ],
    "material": "",
    "classes": [
      "Artificer",
      "Bard",
      "Druid",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (PHB'14) Druid, Lore (PHB'24) Bard, Moon (FRHoF) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Strength (PSA) (PSA) Cleric, Strength (PSA) (PSA) Cleric",
    "text": "Each creature in a 5-foot Emanation originating from you must succeed on a Constitution saving throw or take 1d6 Thunder damage. The spell's thunderous sound can be heard up to 100 feet away.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
  },
  {
    "id": "thunderous-smite",
    "name": "Thunderous Smite",
    "source": "PHB'24",
    "page": 334,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Noble Genies (FRHoF) Paladin, Zeal (PSA) (PSA) Cleric, Zeal (PSA) (PSA) Cleric",
    "text": "Your strike rings with thunder that is audible within 300 feet of you, and the target takes an extra 2d6 Thunder damage from the attack. Additionally, if the target is a creature, it must succeed on a Strength saving throw or be pushed 10 feet away from you and have the Prone condition.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "thunderwave",
    "name": "Thunderwave",
    "source": "PHB'24",
    "page": 334,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Armorer (TCE) Artificer, Armorer (EFA) Artificer, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Sea (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard, Tempest (PHB'14) Cleric, Tempest (PHB'14) Cleric, Fathomless (TCE) Warlock, Fathomless (TCE) Warlock, Genie (Djinni) (TCE) Warlock, Genie (Djinni) (TCE) Warlock",
    "text": "You unleash a wave of thunderous energy. Each creature in a 15-foot Cube originating from you makes a Constitution saving throw. On a failed save, a creature takes 2d8 Thunder damage and is pushed 10 feet away from you. On a successful save, a creature takes half as much damage only.\n\nIn addition, unsecured objects that are entirely within the Cube are pushed 10 feet away from you, and a thunderous boom is audible within 300 feet.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
  },
  {
    "id": "time-stop",
    "name": "Time Stop",
    "source": "PHB'24",
    "page": 334,
    "level": 9,
    "levelLabel": "9th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal.\n\nThis spell ends if one of the actions you use during this period, or any effects that you create during it, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it.",
    "atHigherLevels": ""
  },
  {
    "id": "toll-the-dead",
    "name": "Toll the Dead",
    "source": "PHB'24",
    "page": 334,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Cleric",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "You point at one creature you can see within range, and the single chime of a dolorous bell is audible within 10 feet of the target. The target must succeed on a Wisdom saving throw or take 1d8 Necrotic damage. If the target is missing any of its Hit Points, it instead takes 1d12 Necrotic damage.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by one die when you reach levels 5 (2d8 or 2d12), 11 (3d8 or 3d12), and 17 (4d8 or 4d12)."
  },
  {
    "id": "tongues",
    "name": "Tongues",
    "source": "PHB'24",
    "page": 334,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "M"
    ],
    "material": "a miniature ziggurat",
    "classes": [
      "Bard",
      "Cleric",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Knowledge (FRHoF) Cleric",
    "text": "This spell grants the creature you touch the ability to understand any spoken or signed language that it hears or sees. Moreover, when the target communicates by speaking or signing, any creature that knows at least one language can understand it if that creature can hear the speech or see the signing.",
    "atHigherLevels": ""
  },
  {
    "id": "transport-via-plants",
    "name": "Transport via Plants",
    "source": "PHB'24",
    "page": 334,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "10 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement.",
    "atHigherLevels": ""
  },
  {
    "id": "tree-stride",
    "name": "Tree Stride",
    "source": "PHB'24",
    "page": 335,
    "level": 5,
    "levelLabel": "5th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Forest) (PHB'14) Druid, Land (Temperate Land) (PHB'24) Druid, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Ancients (PHB'14) Paladin, Ancients (PHB'24) Paladin",
    "text": "You gain the ability to enter a tree and move from inside it to inside another tree of the same kind within 500 feet. Both trees must be living and at least the same size as you. You must use 5 feet of movement to enter a tree. You instantly know the location of all other trees of the same kind within 500 feet and, as part of the move used to enter the tree, can either pass into one of those trees or step out of the tree you're in. You appear in a spot of your choice within 5 feet of the destination tree, using another 5 feet of movement. If you have no movement left, you appear within 5 feet of the tree you entered.\n\nYou can use this transportation ability only once on each of your turns. You must end each turn outside a tree.",
    "atHigherLevels": ""
  },
  {
    "id": "true-polymorph",
    "name": "True Polymorph",
    "source": "PHB'24",
    "page": 335,
    "level": 9,
    "levelLabel": "9th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of mercury, a dollop of gum arabic, and a wisp of smoke",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric",
    "text": "Choose one creature or nonmagical object that you can see within range. The creature shape-shifts into a different creature or a nonmagical object, or the object shape-shifts into a creature (the object must be neither worn nor carried). The transformation lasts for the duration or until the target dies or is destroyed, but if you maintain Concentration on this spell for the full duration, the spell lasts until dispelled.\n\nAn unwilling creature can make a Wisdom saving throw, and if it succeeds, it isn't affected by this spell.\n\nCreature into Creature. If you turn a creature into another kind of creature, the new form can be any kind you choose that has a Challenge Rating equal to or less than the target's Challenge Rating or level. The target's game statistics are replaced by the stat block of the new form, but it retains its Hit Points, Hit Point Dice, alignment, and personality.\n\nThe target gains a number of Temporary Hit Points equal to the Hit Points of the new form. These Temporary Hit Points vanish if any remain when the spell ends.\n\nThe target is limited in the actions it can perform by the anatomy of its new form, and it can't speak or cast spells.\n\nThe target's gear melds into the new form. The creature can't use or otherwise benefit from any of that equipment.\n\nObject into Creature. You can turn an object into any kind of creature, as long as the creature's size is no larger than the object's size and the creature has a Challenge Rating of 9 or lower. The creature is Friendly to you and your allies. In combat, it takes its turns immediately after yours, and it obeys your commands.\n\nIf the spell lasts more than an hour, you no longer control the creature. It might remain Friendly to you, depending on how you have treated it.\n\nCreature into Object. If you turn a creature into an object, it transforms along with whatever it is wearing and carrying into that form, as long as the object's size is no larger than the creature's size. The creature's statistics become those of the object, and the creature has no memory of time spent in this form after the spell ends and it returns to normal.",
    "atHigherLevels": ""
  },
  {
    "id": "true-resurrection",
    "name": "True Resurrection",
    "source": "PHB'24",
    "page": 336,
    "level": 9,
    "levelLabel": "9th",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "1 Hr.",
    "duration": "Instantaneous",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "diamonds worth 25,000+ GP, which the spell consumes",
    "classes": [
      "Cleric",
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. The creature is revived with all its Hit Points.\n\nThis spell closes all wounds, neutralizes any poison, cures all magical contagions, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs. If the creature was Undead, it is restored to its non-Undead form.\n\nThe spell can provide a new body if the original no longer exists, in which case you must speak the creature's name. The creature then appears in an unoccupied space you choose within 10 feet of you.",
    "atHigherLevels": ""
  },
  {
    "id": "true-seeing",
    "name": "True Seeing",
    "source": "PHB'24",
    "page": 336,
    "level": 6,
    "levelLabel": "6th",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "mushroom powder worth 25+ GP, which the spell consumes",
    "classes": [
      "Bard",
      "Cleric",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Diviner (PHB'24) Wizard",
    "text": "For the duration, the willing creature you touch has Truesight with a range of 120 feet.",
    "atHigherLevels": ""
  },
  {
    "id": "true-strike",
    "name": "True Strike",
    "source": "PHB'24",
    "page": 336,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Divination",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "S",
      "M"
    ],
    "material": "a weapon with which you have proficiency and that is worth 1+ CP",
    "classes": [
      "Artificer",
      "Bard",
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Diviner (PHB'24) Wizard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "Guided by a flash of magical insight, you make one attack with the weapon used in the spell's casting. The attack uses your spellcasting ability for the attack and damage rolls instead of using Strength or Dexterity. If the attack deals damage, it can be Radiant damage or the weapon's normal damage type (your choice).",
    "atHigherLevels": "Cantrip Upgrade. Whether you deal Radiant damage or the weapon's normal damage type, the attack deals extra Radiant damage when you reach levels 5 (1d6), 11 (2d6), and 17 (3d6)."
  },
  {
    "id": "tsunami",
    "name": "Tsunami",
    "source": "PHB'24",
    "page": 336,
    "level": 8,
    "levelLabel": "8th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "Concentration, up to 6 rounds",
    "range": "1 mile",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "A wall of water springs into existence at a point you choose within range. You can make the wall up to 300 feet long, 300 feet high, and 50 feet thick. The wall lasts for the duration.\n\nWhen the wall appears, each creature in its area makes a Strength saving throw, taking 6d10 Bludgeoning damage on a failed save or half as much damage on a successful one.\n\nAt the start of each of your turns after the wall appears, the wall, along with any creatures in it, moves 50 feet away from you. Any Huge or smaller creature inside the wall or whose space the wall enters when it moves must succeed on a Strength saving throw or take 5d10 Bludgeoning damage. A creature can take this damage only once per round. At the end of the turn, the wall's height is reduced by 50 feet, and the damage the wall deals on later rounds is reduced by 1d10. When the wall reaches 0 feet in height, the spell ends.\n\nA creature caught in the wall can move by swimming. Because of the wave's force, though, the creature must succeed on a Strength (Athletics) check against your spell save DC to move at all. If it fails the check, it can't move. A creature that moves out of the wall falls to the ground.",
    "atHigherLevels": ""
  },
  {
    "id": "unseen-servant",
    "name": "Unseen Servant",
    "source": "PHB'24",
    "page": 336,
    "level": 1,
    "levelLabel": "1st",
    "school": "Conjuration",
    "ritual": true,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of string and of wood",
    "classes": [
      "Bard",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "This spell creates an Invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 Hit Point, and a Strength of 2, and it can't attack. If it drops to 0 Hit Points, the spell ends.\n\nOnce on each of your turns as a Bonus Action, you can mentally command the servant to move up to 15 feet and interact with an object. The servant can perform simple tasks that a human could do, such as fetching things, cleaning, mending, folding clothes, lighting fires, serving food, and pouring drinks. Once you give the command, the servant performs the task to the best of its ability until it completes the task, then waits for your next command.\n\nIf you command the servant to perform a task that would move it more than 60 feet away from you, the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "vampiric-touch",
    "name": "Vampiric Touch",
    "source": "PHB'24",
    "page": 337,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Death (DMG'14) Cleric, Death (DMG'14) Cleric, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Grave (XGE) Cleric, Grave (XGE) Cleric, Lunar (DSotDQ) Sorcerer, Lunar (DSotDQ) Sorcerer, Ambition (PSA) (PSA) Cleric, Ambition (PSA) (PSA) Cleric",
    "text": "The touch of your shadow-wreathed hand can siphon life force from others to heal your wounds. Make a melee spell attack against one creature within reach. On a hit, the target takes 3d6 Necrotic damage, and you regain Hit Points equal to half the amount of Necrotic damage dealt.\n\nUntil the spell ends, you can make the attack again on each of your turns as a Magic action, targeting the same creature or a different one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3."
  },
  {
    "id": "vicious-mockery",
    "name": "Vicious Mockery",
    "source": "PHB'24",
    "page": 337,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "60 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Bard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You unleash a string of insults laced with subtle enchantments at one creature you can see or hear within range. The target must succeed on a Wisdom saving throw or take 1d6 Psychic damage and have Disadvantage on the next attack roll it makes before the end of its next turn.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
  },
  {
    "id": "vitriolic-sphere",
    "name": "Vitriolic Sphere",
    "source": "PHB'24",
    "page": 337,
    "level": 4,
    "levelLabel": "4th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "150 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a drop of bile",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Alchemist (EFA) Artificer, Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Evoker (PHB'24) Wizard",
    "text": "You point at a location within range, and a glowing, 1-foot-diameter ball of acid streaks there and explodes in a 20-foot-radius Sphere. Each creature in that area makes a Dexterity saving throw. On a failed save, a creature takes 10d4 Acid damage and another 5d4 Acid damage at the end of its next turn. On a successful save, a creature takes half the initial damage only.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The initial damage increases by 2d4 for each spell slot level above 4."
  },
  {
    "id": "wall-of-fire",
    "name": "Wall of Fire",
    "source": "PHB'24",
    "page": 338,
    "level": 4,
    "levelLabel": "4th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a piece of charcoal",
    "classes": [
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'14) Rogue, Arcane Trickster (PHB'24) Rogue, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Celestial (PHB'24) Warlock, Eldritch Knight (PHB'14) Fighter, Eldritch Knight (PHB'24) Fighter, Evoker (PHB'24) Wizard, Fiend (PHB'24) Warlock, Forge (XGE) Cleric, Forge (XGE) Cleric, Light (PHB'14) Cleric, Light (PHB'24) Cleric, Spellfire (FRHoF) Sorcerer, Celestial (XGE) Warlock, Fiend (PHB'14) Warlock",
    "text": "You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration.\n\nWhen the wall appears, each creature in its area makes a Dexterity saving throw, taking 5d8 Fire damage on a failed save or half as much damage on a successful one.\n\nOne side of the wall, selected by you when you cast this spell, deals 5d8 Fire damage to each creature that ends its turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there. The other side of the wall deals no damage.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
  },
  {
    "id": "wall-of-force",
    "name": "Wall of Force",
    "source": "PHB'24",
    "page": 338,
    "level": 5,
    "levelLabel": "5th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a shard of glass",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Armorer (TCE) Artificer, Armorer (EFA) Artificer, Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Clockwork (PHB'24) Sorcerer, Clockwork Soul (TCE) Sorcerer, Evoker (PHB'24) Wizard, Redemption (XGE) Paladin, Redemption (XGE) Paladin",
    "text": "An Invisible wall of force springs into existence at a point you choose within range. The wall appears in any orientation you choose, as a horizontal or vertical barrier or at an angle. It can be free floating or resting on a solid surface. You can form it into a hemispherical dome or a globe with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-by-10-foot panels. Each panel must be contiguous with another panel. In any form, the wall is 1/4 inch thick and lasts for the duration. If the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall (you choose which side).\n\nNothing can physically pass through the wall. It is immune to all damage and can't be dispelled by Dispel Magic. A Disintegrate spell destroys the wall instantly, however. The wall also extends into the Ethereal Plane and blocks ethereal travel through the wall.",
    "atHigherLevels": ""
  },
  {
    "id": "wall-of-ice",
    "name": "Wall of Ice",
    "source": "PHB'24",
    "page": 339,
    "level": 6,
    "levelLabel": "6th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a piece of quartz",
    "classes": [
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Evoker (PHB'24) Wizard",
    "text": "You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a globe with a radius of up to 10 feet, or you can shape a flat surface made up of ten 10-foot-square panels. Each panel must be contiguous with another panel. In any form, the wall is 1 foot thick and lasts for the duration.\n\nIf the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall (you choose which side) and makes a Dexterity saving throw, taking 10d6 Cold damage on a failed save or half as much damage on a successful one.\n\nThe wall is an object that can be damaged and thus breached. It has AC 12 and 30 Hit Points per 10-foot section, and it has Immunity to Cold, Poison, and Psychic damage and Vulnerability to Fire damage. Reducing a 10-foot section of wall to 0 Hit Points destroys it and leaves behind a sheet of frigid air in the space the wall occupied.\n\nA creature moving through the sheet of frigid air for the first time on a turn makes a Constitution saving throw, taking 5d6 Cold damage on a failed save or half as much damage on a successful one.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage the wall deals when it appears increases by 2d6 and the damage from passing through the sheet of frigid air increases by 1d6 for each spell slot level above 6."
  },
  {
    "id": "wall-of-stone",
    "name": "Wall of Stone",
    "source": "PHB'24",
    "page": 339,
    "level": 5,
    "levelLabel": "5th",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a cube of granite",
    "classes": [
      "Artificer",
      "Druid",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Desert) (PHB'14) Druid, Land (Mountain) (PHB'14) Druid, Land (Arid Land) (PHB'24) Druid, Evoker (PHB'24) Wizard, Genie (Dao) (TCE) Warlock, Genie (Dao) (TCE) Warlock",
    "text": "A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by-10-foot panels. Each panel must be contiguous with another panel. Alternatively, you can create 10-foot-by-20-foot panels that are only 3 inches thick.\n\nIf the wall cuts through a creature's space when it appears, the creature is pushed to one side of the wall (you choose which side). If a creature would be surrounded on all sides by the wall (or the wall and another solid surface), that creature can make a Dexterity saving throw. On a success, it can use its Reaction to move up to its Speed so that it is no longer enclosed by the wall.\n\nThe wall can have any shape you desire, though it can't occupy the same space as a creature or object. The wall doesn't need to be vertical or rest on a firm foundation. It must, however, merge with and be solidly supported by existing stone. Thus, you can use this spell to bridge a chasm or create a ramp.\n\nIf you create a span greater than 20 feet in length, you must halve the size of each panel to create supports. You can crudely shape the wall to create battlements and the like.\n\nThe wall is an object made of stone that can be damaged and thus breached. Each panel has AC 15 and 30 Hit Points per inch of thickness, and it has Immunity to Poison and Psychic damage. Reducing a panel to 0 Hit Points destroys it and might cause connected panels to collapse at the DM's discretion.\n\nIf you maintain your Concentration on this spell for its full duration, the wall becomes permanent and can't be dispelled. Otherwise, the wall disappears when the spell ends.",
    "atHigherLevels": ""
  },
  {
    "id": "wall-of-thorns",
    "name": "Wall of Thorns",
    "source": "PHB'24",
    "page": 339,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 10 minutes",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a handful of thorns",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You create a wall of tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. The wall blocks line of sight.\n\nWhen the wall appears, each creature in its area makes a Dexterity saving throw, taking 7d8 Piercing damage on a failed save or half as much damage on a successful one.\n\nA creature can move through the wall, albeit slowly and painfully. For every 1 foot a creature moves through the wall, it must spend 4 feet of movement. Furthermore, the first time a creature enters a space in the wall on a turn or ends its turn there, the creature makes a Dexterity saving throw, taking 7d8 Slashing damage on a failed save or half as much damage on a successful one. A creature makes this save only once per turn.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. Both types of damage increase by 1d8 for each spell slot level above 6."
  },
  {
    "id": "warding-bond",
    "name": "Warding Bond",
    "source": "PHB'24",
    "page": 340,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Abjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "Touch",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a pair of platinum rings worth 50+ GP each, which you and the target must wear for the duration",
    "classes": [
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Battle Smith (TCE) Artificer, Battle Smith (EFA) Artificer, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Crown (SCAG) Paladin, Crown (SCAG) Paladin, Peace (TCE) Cleric, Peace (TCE) Cleric, Solidarity (PSA) (PSA) Cleric, Solidarity (PSA) (PSA) Cleric",
    "text": "You touch another creature that is willing and create a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has Resistance to all damage. Also, each time it takes damage, you take the same amount of damage.\n\nThe spell ends if you drop to 0 Hit Points or if you and the target become separated by more than 60 feet. It also ends if the spell is cast again on either of the connected creatures.",
    "atHigherLevels": ""
  },
  {
    "id": "water-breathing",
    "name": "Water Breathing",
    "source": "PHB'24",
    "page": 340,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": true,
    "castingTime": "Action",
    "duration": "24 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a short reed",
    "classes": [
      "Artificer",
      "Druid",
      "Ranger",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Coast) (PHB'14) Druid, Sea (PHB'24) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter",
    "text": "This spell grants up to ten willing creatures of your choice within range the ability to breathe underwater until the spell ends. Affected creatures also retain their normal mode of respiration.",
    "atHigherLevels": ""
  },
  {
    "id": "water-walk",
    "name": "Water Walk",
    "source": "PHB'24",
    "page": 340,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Transmutation",
    "ritual": true,
    "castingTime": "Action",
    "duration": "1 hour",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a piece of cork",
    "classes": [
      "Artificer",
      "Cleric",
      "Druid",
      "Ranger",
      "Sorcerer"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Land (Coast) (PHB'14) Druid, Land (Swamp) (PHB'14) Druid, Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "This spell grants the ability to move across any liquid surface—such as water, acid, mud, snow, quicksand, or lava—as if it were harmless solid ground (creatures crossing molten lava can still take damage from the heat). Up to ten willing creatures of your choice within range gain this ability for the duration.\n\nAn affected target must take a Bonus Action to pass from the liquid's surface into the liquid itself and vice versa, but if the target falls into the liquid, the target passes through the surface into the liquid below.",
    "atHigherLevels": ""
  },
  {
    "id": "web",
    "name": "Web",
    "source": "PHB'24",
    "page": 340,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 hour",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a bit of spiderweb",
    "classes": [
      "Artificer",
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Land (Tropical Land) (PHB'24) Druid, Land (Underdark) (PHB'14) Druid, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Swarmkeeper (TCE) Ranger, Swarmkeeper (TCE) Ranger",
    "text": "You conjure a mass of sticky webbing at a point within range. The webs fill a 20-foot Cube there for the duration. The webs are Difficult Terrain, and the area within them is Lightly Obscured.\n\nIf the webs aren't anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet.\n\nThe first time a creature enters the webs on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the Restrained condition while in the webs or until it breaks free.\n\nA creature Restrained by the webs can take an action to make a Strength (Athletics) check against your spell save DC. If it succeeds, it is no longer Restrained.\n\nThe webs are flammable. Any 5-foot Cube of webs exposed to fire burns away in 1 round, dealing 2d4 Fire damage to any creature that starts its turn in the fire.",
    "atHigherLevels": ""
  },
  {
    "id": "weird",
    "name": "Weird",
    "source": "PHB'24",
    "page": 341,
    "level": 9,
    "levelLabel": "9th",
    "school": "Illusion",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Illusionist (PHB'24) Wizard",
    "text": "You try to create illusory terrors in others' minds. Each creature of your choice in a 30-foot-radius Sphere centered on a point within range makes a Wisdom saving throw. On a failed save, a target takes 10d10 Psychic damage and has the Frightened condition for the duration. On a successful save, a target takes half as much damage only.\n\nA Frightened target makes a Wisdom saving throw at the end of each of its turns. On a failed save, it takes 5d10 Psychic damage. On a successful save, the spell ends on that target.",
    "atHigherLevels": ""
  },
  {
    "id": "wind-walk",
    "name": "Wind Walk",
    "source": "PHB'24",
    "page": 341,
    "level": 6,
    "levelLabel": "6th",
    "school": "Transmutation",
    "ritual": false,
    "castingTime": "1 Min.",
    "duration": "8 hours",
    "range": "30 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a candle",
    "classes": [
      "Druid"
    ],
    "optionalVariantClasses": [],
    "subclasses": "",
    "text": "You and up to ten willing creatures of your choice within range assume gaseous forms for the duration, appearing as wisps of cloud. While in this cloud form, a target has a Fly Speed of 300 feet and can hover; it has Immunity to the Prone condition; and it has Resistance to Bludgeoning, Piercing, and Slashing damage. The only actions a target can take in this form are the Dash action or a Magic action to begin reverting to its normal form. Reverting takes 1 minute, during which the target has the Stunned condition. Until the spell ends, the target can revert to cloud form, which also requires a Magic action followed by a 1-minute transformation.\n\nIf a target is in cloud form and flying when the effect ends, the target descends 60 feet per round for 1 minute until it lands, which it does safely. If it can't land after 1 minute, it falls the remaining distance.",
    "atHigherLevels": ""
  },
  {
    "id": "wind-wall",
    "name": "Wind Wall",
    "source": "PHB'24",
    "page": 341,
    "level": 3,
    "levelLabel": "3rd",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "120 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a fan and a feather",
    "classes": [
      "Druid",
      "Ranger"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Artillerist (TCE) Artificer, Artillerist (EFA) Artificer, Lore (PHB'24) Bard, Nature (PHB'14) Cleric, Nature (PHB'14) Cleric, Genie (Djinni) (TCE) Warlock, Genie (Djinni) (TCE) Warlock",
    "text": "A wall of strong wind rises from the ground at a point you choose within range. You can make the wall up to 50 feet long, 15 feet high, and 1 foot thick. You can shape the wall in any way you choose so long as it makes one continuous path along the ground. The wall lasts for the duration.\n\nWhen the wall appears, each creature in its area makes a Strength saving throw, taking 4d8 Bludgeoning damage on a failed save or half as much damage on a successful one.\n\nThe strong wind keeps fog, smoke, and other gases at bay. Small or smaller flying creatures or objects can't pass through the wall. Loose, lightweight materials brought into the wall fly upward. Arrows, bolts, and other ordinary projectiles launched at targets behind the wall are deflected upward and miss automatically. Boulders hurled by Giants or siege engines, and similar projectiles, are unaffected. Creatures in gaseous form can't pass through it.",
    "atHigherLevels": ""
  },
  {
    "id": "wish",
    "name": "Wish",
    "source": "PHB'24",
    "page": 341,
    "level": 9,
    "levelLabel": "9th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Sorcerer",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcana (SCAG) Cleric, Arcana (SCAG) Cleric, Genie (TCE) Warlock, Genie (TCE) Warlock",
    "text": "Wish is the mightiest spell a mortal can cast. By simply speaking aloud, you can alter reality itself.\n\nThe basic use of this spell is to duplicate any other spell of level 8 or lower. If you use it this way, you don't need to meet any requirements to cast that spell, including costly components. The spell simply takes effect.\n\nAlternatively, you can create one of the following effects of your choice:\n\nObject Creation. You create one object of up to 25,000 GP in value that isn't a magic item. The object can be no more than 300 feet in any dimension, and it appears in an unoccupied space that you can see on the ground.\n\nInstant Health. You allow yourself and up to twenty creatures that you can see to regain all Hit Points, and you end all effects on them listed in the Greater Restoration spell.\n\nResistance. You grant up to ten creatures that you can see Resistance to one damage type that you choose. This Resistance is permanent.\n\nSpell Immunity. You grant up to ten creatures you can see immunity to a single spell or other magical effect for 8 hours.\n\nSudden Learning. You replace one of your feats with another feat for which you are eligible. You lose all the benefits of the old feat and gain the benefits of the new one. You can't replace a feat that is a prerequisite for any of your other feats or features.\n\nRoll Redo. You undo a single recent event by forcing a reroll of any die roll made within the last round (including your last turn). Reality reshapes itself to accommodate the new result. For example, a Wish spell could undo an ally's failed saving throw or a foe's Critical Hit. You can force the reroll to be made with Advantage or Disadvantage, and you choose whether to use the reroll or the original roll.\n\nReshape Reality. You may wish for something not included in any of the other effects. To do so, state your wish to the DM as precisely as possible. The DM has great latitude in ruling what occurs in such an instance; the greater the wish, the greater the likelihood that something goes wrong. This spell might simply fail, the effect you desire might be achieved only in part, or you might suffer an unforeseen consequence as a result of how you worded the wish. For example, wishing that a villain were dead might propel you forward in time to a period when that villain is no longer alive, effectively removing you from the game. Similarly, wishing for a Legendary magic item or an Artifact might instantly transport you to the presence of the item's current owner. If your wish is granted and its effects have consequences for a whole community, region, or world, you are likely to attract powerful foes. If your wish would affect a god, the god's divine servants might instantly intervene to prevent it or to encourage you to craft the wish in a particular way. If your wish would undo the multiverse itself, threaten the City of Sigil, or affect the Lady of Pain in any way, you see an image of her in your mind for a moment; she shakes her head, and your wish fails.\n\nThe stress of casting Wish to produce any effect other than duplicating another spell weakens you. After enduring that stress, each time you cast a spell until you finish a Long Rest, you take 1d10 Necrotic damage per level of that spell. This damage can't be reduced or prevented in any way. In addition, your Strength score becomes 3 for 2d4 days. For each of those days that you spend resting and doing nothing more than light activity, your remaining recovery time decreases by 2 days. Finally, there is a 33 percent chance that you are unable to cast Wish ever again if you suffer this stress.",
    "atHigherLevels": ""
  },
  {
    "id": "witch-bolt",
    "name": "Witch Bolt",
    "source": "PHB'24",
    "page": 343,
    "level": 1,
    "levelLabel": "1st",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "60 feet",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a twig struck by lightning",
    "classes": [
      "Sorcerer",
      "Warlock",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Arcane Trickster (PHB'24) Rogue, Arcane Trickster (PHB'14) Rogue, Lore (PHB'24) Bard, Eldritch Knight (PHB'24) Fighter, Eldritch Knight (PHB'14) Fighter, Evoker (PHB'24) Wizard",
    "text": "A beam of crackling energy lances toward a creature within range, forming a sustained arc of lightning between you and the target. Make a ranged spell attack against it. On a hit, the target takes 2d12 Lightning damage.\n\nOn each of your subsequent turns, you can take a Bonus Action to deal 1d12 Lightning damage to the target automatically, even if the first attack missed.\n\nThe spell ends if the target is ever outside the spell's range or if it has Total Cover from you.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The initial damage increases by 1d12 for each spell slot level above 1."
  },
  {
    "id": "word-of-radiance",
    "name": "Word of Radiance",
    "source": "PHB'24",
    "page": 343,
    "level": 0,
    "levelLabel": "Cantrip",
    "school": "Evocation",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "Self",
    "components": [
      "V",
      "M"
    ],
    "material": "a sunburst token",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "Burning radiance erupts from you in a 5-foot Emanation. Each creature of your choice that you can see in it must succeed on a Constitution saving throw or take 1d6 Radiant damage.",
    "atHigherLevels": "Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
  },
  {
    "id": "word-of-recall",
    "name": "Word of Recall",
    "source": "PHB'24",
    "page": 343,
    "level": 6,
    "levelLabel": "6th",
    "school": "Conjuration",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Instantaneous",
    "range": "5 feet",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Cleric"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer",
    "text": "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary (see below). If you cast this spell without first preparing a sanctuary, the spell has no effect.\n\nYou must designate a location, such as a temple, as a sanctuary by casting this spell there.",
    "atHigherLevels": ""
  },
  {
    "id": "wrathful-smite",
    "name": "Wrathful Smite",
    "source": "PHB'24",
    "page": 343,
    "level": 1,
    "levelLabel": "1st",
    "school": "Necromancy",
    "ritual": false,
    "castingTime": "Bonus",
    "duration": "1 minute",
    "range": "Self",
    "components": [
      "V"
    ],
    "material": "",
    "classes": [
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Hexblade (XGE) Warlock, Hexblade (XGE) Warlock",
    "text": "The target takes an extra 1d6 Necrotic damage from the attack, and it must succeed on a Wisdom saving throw or have the Frightened condition until the spell ends. At the end of each of its turns, the Frightened target repeats the save, ending the spell on itself on a success.",
    "atHigherLevels": "Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
  },
  {
    "id": "yolandes-regal-presence",
    "name": "Yolande's Regal Presence",
    "source": "PHB'24",
    "page": 343,
    "level": 5,
    "levelLabel": "5th",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "Concentration, up to 1 minute",
    "range": "Self",
    "components": [
      "V",
      "S",
      "M"
    ],
    "material": "a miniature tiara",
    "classes": [
      "Bard",
      "Wizard"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Glory (PHB'24) Paladin",
    "text": "You surround yourself with unearthly majesty in a 10-foot Emanation. Whenever the Emanation enters the space of a creature you can see and whenever a creature you can see enters the Emanation or ends its turn there, you can force that creature to make a Wisdom saving throw. On a failed save, the target takes 4d6 Psychic damage and has the Prone condition, and you can push it up to 10 feet away. On a successful save, the target takes half as much damage only. A creature makes this save only once per turn.",
    "atHigherLevels": ""
  },
  {
    "id": "zone-of-truth",
    "name": "Zone of Truth",
    "source": "PHB'24",
    "page": 343,
    "level": 2,
    "levelLabel": "2nd",
    "school": "Enchantment",
    "ritual": false,
    "castingTime": "Action",
    "duration": "10 minutes",
    "range": "60 feet",
    "components": [
      "V",
      "S"
    ],
    "material": "",
    "classes": [
      "Bard",
      "Cleric",
      "Paladin"
    ],
    "optionalVariantClasses": [],
    "subclasses": "Lore (PHB'24) Bard, Divine Soul (XGE) Sorcerer, Divine Soul (XGE) Sorcerer, Monster Slayer (XGE) Ranger, Monster Slayer (XGE) Ranger, Devotion (PHB'24) Paladin, Devotion (PHB'14) Paladin, Crown (SCAG) Paladin, Crown (SCAG) Paladin, Order (TCE) Cleric, Order (TCE) Cleric",
    "text": "You create a magical zone that guards against deception in a 15-foot-radius Sphere centered on a point within range. Until the spell ends, a creature that enters the spell's area for the first time on a turn or starts its turn there makes a Charisma saving throw. On a failed save, a creature can't speak a deliberate lie while in the radius. You know whether a creature succeeds or fails on this save.\n\nAn affected creature is aware of the spell and can avoid answering questions to which it would normally respond with a lie. Such a creature can be evasive yet must be truthful.",
    "atHigherLevels": ""
  }
]);
export const SPELLS_5E24_LEVEL_OPTIONS = Object.freeze([
  {
    "value": 0,
    "label": "Cantrip"
  },
  {
    "value": 1,
    "label": "1st"
  },
  {
    "value": 2,
    "label": "2nd"
  },
  {
    "value": 3,
    "label": "3rd"
  },
  {
    "value": 4,
    "label": "4th"
  },
  {
    "value": 5,
    "label": "5th"
  },
  {
    "value": 6,
    "label": "6th"
  },
  {
    "value": 7,
    "label": "7th"
  },
  {
    "value": 8,
    "label": "8th"
  },
  {
    "value": 9,
    "label": "9th"
  }
]);
export const SPELLS_5E24_SCHOOL_OPTIONS = Object.freeze([
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation"
]);
export const SPELLS_5E24_BY_ID = Object.freeze(Object.fromEntries(SPELLS_5E24.map((spell) => [spell.id, spell])));
export const SPELLS_5E24_BY_NAME = Object.freeze(Object.fromEntries(SPELLS_5E24.map((spell) => [spell.name.toLowerCase(), spell])));
export function findSpell5e24(ref) {
  const key = String(ref || "").trim();
  if (!key) return null;
  return SPELLS_5E24_BY_ID[key] || SPELLS_5E24_BY_NAME[key.toLowerCase()] || null;
}
export function getSpell5e24Name(ref) {
  const spell = findSpell5e24(ref);
  return spell?.name || String(ref || "").trim();
}
export function normalizeSpell5e24Ref(value) {
  const spell = findSpell5e24(value);
  return spell?.id || String(value || "").trim();
}
