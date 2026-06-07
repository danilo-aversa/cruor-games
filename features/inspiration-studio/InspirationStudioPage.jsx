import { useEffect, useMemo, useState } from "react";
import {
  SPELLS_5E24,
  SPELLS_5E24_LEVEL_OPTIONS,
  SPELLS_5E24_SCHOOL_OPTIONS,
  getSpell5e24Name,
  normalizeSpell5e24Ref,
  loadContentPackSummaries,
  loadInspirationModules,
} from "../../shared/content/content.index.js";
import { renderStructuredRulesTemplate } from "../monster-composer/model/monster-graft-rules.render.js";
import { normalizeMonsterGraftRules } from "../monster-composer/model/monster-graft-rules.schema.js";

const EMPTY_DRAFT = {
  id: "new-inspiration",
  title: "New Inspiration",
  status: "draft",
  packId: "new-content-pack",
  sourceAnchor: {
    id: "new-inspiration",
    label: "New Inspiration",
    type: "Source Anchor",
    status: "draft",
    workflows: [],
    sourceTypes: [],
    themes: [],
    motifs: [],
    horror: [],
    summary: "",
  },
  inspiration: {
    id: "inspiration-new-inspiration",
    title: "New Inspiration",
    label: "New Inspiration",
    contentType: "source-inspiration-card",
    status: "draft",
    workflows: ["inspiration-archive"],
    sourceAnchors: ["new-inspiration"],
    sourceTypes: [],
    themes: [],
    motifs: [],
    horror: [],
    summary: "",
    narrative: "",
    caption: "",
    media: {
      imageKey: "",
      imageUrl: "",
      imageNote: "",
    },
  },
  components: [],
  monsterGrafts: [],
  locationComponents: [],
  locationRegions: [],
  metadata: {
    moduleRole: "studio-draft",
  },
};

const COMPONENT_TYPE_LABELS = {
  "monster-graft": "Monster Graft",
  "location-component": "Location Component",
  "location-region": "Location Region",
};

const COMPONENT_TYPE_ICONS = {
  "monster-graft": "fa-skull",
  "location-component": "fa-map-location-dot",
  "location-region": "fa-dungeon",
};

const STUDIO_SECTIONS = [
  {
    id: "identity",
    label: "Identity",
    icon: "fa-id-card-clip",
    hint: "Name, collection, public card, source tags, and image.",
  },
  {
    id: "components",
    label: "Components",
    icon: "fa-diagram-project",
    hint: "Monster grafts, location content, and map regions linked to this source.",
  },
  {
    id: "export",
    label: "Export",
    icon: "fa-code",
    hint: "Copy the current local draft as module JSON.",
  },
];

const STATUS_OPTIONS = [
  {
    id: "draft",
    label: "Draft",
    icon: "fa-pen-ruler",
    description: "Use while the module is being structured, reviewed, or playtested.",
  },
  {
    id: "published",
    label: "Published",
    icon: "fa-circle-check",
    description: "Use when the module is approved for the public archive and live generators.",
  },
  {
    id: "archived",
    label: "Archived",
    icon: "fa-box-archive",
    description: "Use when the module should remain available for reference but no longer be treated as active content.",
  },
];

const STATUS_TOOLTIP_ITEMS = STATUS_OPTIONS
  .map((option) => `**${option.label}**. ${option.description}`)
  .join("\n");

const MONSTER_RULE_SECTION_OPTIONS = [
  ["trait", "Trait"],
  ["action", "Action"],
  ["bonusAction", "Bonus Action"],
  ["reaction", "Reaction"],
  ["legendaryAction", "Legendary Action"],
  ["lairAction", "Lair Action"],
  ["death", "Death Effect"],
];

const MONSTER_ACTION_ECONOMY_OPTIONS = [
  ["passive", "Passive"],
  ["action", "Action"],
  ["bonusAction", "Bonus Action"],
  ["reaction", "Reaction"],
  ["legendaryAction", "Legendary Action"],
  ["lairAction", "Lair Action"],
  ["deathTrigger", "Death Trigger"],
  ["freeTrigger", "Free Trigger"],
];

const MONSTER_USAGE_OPTIONS = [
  ["passive", "Passive"],
  ["atWill", "At Will"],
  ["recharge", "Recharge"],
  ["limited", "Limited"],
  ["triggered", "Triggered"],
  ["lair", "Lair"],
  ["legendary", "Legendary"],
  ["death", "Death"],
];

const MONSTER_RESOLUTION_OPTIONS = [
  ["none", "None"],
  ["attackRoll", "Attack Roll"],
  ["savingThrow", "Saving Throw"],
  ["attackRollSavingThrow", "Attack Roll + Saving Throw"],
  ["automatic", "Automatic"],
  ["check", "Check"],
];

const MONSTER_TARGETING_TYPE_OPTIONS = [
  ["self", "Self"],
  ["single", "Single Target"],
  ["area", "Area"],
  ["custom", "Custom Text"],
];

const MONSTER_TARGETING_SHAPE_OPTIONS = [
  ["radius", "Radius"],
  ["cone", "Cone"],
  ["sphere", "Sphere"],
  ["cube", "Cube"],
  ["line", "Line"],
  ["cylinder", "Cylinder"],
  ["emanation", "Emanation"],
];

const MONSTER_MULTIATTACK_MODE_OPTIONS = [
  ["fixed", "Fixed Attacks"],
  ["choice", "Attack Choice"],
  ["attackPlusAbility", "Attack + Ability"],
  ["replaceOne", "Replace One Attack"],
  ["replaceAny", "Replace Any Attack"],
  ["custom", "Custom Template"],
];

const MONSTER_MULTIATTACK_REPLACEMENT_OPTIONS = [
  ["none", "None"],
  ["oneAttack", "One Attack"],
  ["anyAttack", "Any Attack"],
  ["oneOrMoreAttacks", "One or More Attacks"],
];

const MONSTER_SAVE_OPTIONS = [
  ["strength", "Strength"],
  ["dexterity", "Dexterity"],
  ["constitution", "Constitution"],
  ["intelligence", "Intelligence"],
  ["wisdom", "Wisdom"],
  ["charisma", "Charisma"],
];

const MONSTER_ATTACK_OPTIONS = [
  ["melee", "Melee"],
  ["ranged", "Ranged"],
  ["meleeOrRanged", "Melee or Ranged"],
];

const MONSTER_ATTACK_BASIS_OPTIONS = [
  ["strength", "Strength"],
  ["dexterity", "Dexterity"],
  ["constitution", "Constitution"],
  ["intelligence", "Intelligence"],
  ["wisdom", "Wisdom"],
  ["charisma", "Charisma"],
  ["spellcasting", "Spellcasting"],
  ["monster", "Monster Baseline"],
  ["custom", "Custom"],
];

const MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS = [
  ["none", "None"],
  ["mainAttack", "Main Attack"],
  ["secondaryAttack", "Secondary Attack"],
  ["minorAttack", "Minor Attack"],
  ["bonusAction", "Bonus Action"],
  ["reactionPunish", "Reaction Punish"],
  ["rechargeBurst", "Recharge Burst"],
  ["rechargeControl", "Recharge Control"],
  ["deathBurst", "Death Burst"],
  ["lairPulse", "Lair Pulse"],
  ["legendaryStrike", "Legendary Strike"],
  ["ongoing", "Ongoing"],
];

const MONSTER_DAMAGE_MODE_OPTIONS = [
  ["none", "None"],
  ["budget", "Budget"],
  ["parts", "Damage Parts"],
  ["computed", "Computed"],
  ["fixed", "Fixed"],
  ["custom", "Custom"],
];

const MONSTER_DAMAGE_SCALE_OPTIONS = [
  ["minor", "Minor"],
  ["medium", "Medium"],
  ["standard", "Standard"],
  ["high", "High"],
  ["heavy", "Heavy"],
];

const MONSTER_CONDITION_SEVERITY_OPTIONS = [
  ["minor", "Minor"],
  ["moderate", "Moderate"],
  ["major", "Major"],
  ["severe", "Severe"],
];

const MONSTER_CONDITION_REPEAT_TIMING_OPTIONS = [
  ["startOfTurn", "Start of Target Turn"],
  ["endOfTurn", "End of Target Turn"],
  ["endOfEachTurn", "End of Each Turn"],
  ["whenDamaged", "When Damaged"],
  ["whenTriggered", "When Triggered"],
];

const MONSTER_ONGOING_TIMING_OPTIONS = [
  ["startOfTargetTurn", "Start of Target Turn"],
  ["endOfTargetTurn", "End of Target Turn"],
  ["startOfMonsterTurn", "Start of Monster Turn"],
  ["endOfMonsterTurn", "End of Monster Turn"],
  ["onEnterArea", "On Enter Area"],
  ["whileInArea", "While in Area"],
  ["whenTriggered", "When Triggered"],
];

const MONSTER_AREA_EFFECT_TYPE_OPTIONS = [
  ["aura", "Aura"],
  ["emanation", "Emanation"],
  ["hazard", "Hazard"],
  ["zone", "Zone"],
  ["regional", "Regional Effect"],
  ["custom", "Custom"],
];

const MONSTER_AREA_EFFECT_ORIGIN_OPTIONS = [
  ["self", "Self"],
  ["point", "Point"],
  ["target", "Target"],
  ["location", "Location"],
  ["custom", "Custom"],
];

const MONSTER_AREA_EFFECT_TIMING_OPTIONS = [
  ["passive", "Passive / Always On"],
  ["startsTurnInArea", "Starts Turn in Area"],
  ["endsTurnInArea", "Ends Turn in Area"],
  ["entersArea", "Enters Area"],
  ["whileInArea", "While in Area"],
  ["leavesArea", "Leaves Area"],
  ["initiativeCount20", "Initiative Count 20"],
  ["lairAction", "Lair Action"],
  ["regional", "Regional"],
  ["custom", "Custom"],
];

const MONSTER_SPELLCASTING_SOURCE_OPTIONS = [
  ["monster", "Monster Baseline"],
  ["fixed", "Fixed"],
  ["custom", "Custom"],
  ["none", "None"],
];

const MONSTER_SPELLCASTING_LIST_OPTIONS = [
  ["atWill", "At Will"],
  ["daily1", "1/Day Each"],
  ["daily2", "2/Day Each"],
  ["daily3", "3/Day Each"],
  ["custom", "Custom"],
];

const MONSTER_SPELLCASTING_DEFAULT_LISTS = [
  { id: "atWill", usage: "atWill", label: "At will", spellRefs: [], spells: [] },
  { id: "daily1", usage: "daily1", label: "1/day each", spellRefs: [], spells: [] },
  { id: "daily2", usage: "daily2", label: "2/day each", spellRefs: [], spells: [] },
  { id: "daily3", usage: "daily3", label: "3/day each", spellRefs: [], spells: [] },
];

const MONSTER_DEFENSE_TYPE_OPTIONS = [
  ["legendaryResistance", "Legendary Resistance"],
  ["magicResistance", "Magic Resistance"],
  ["regeneration", "Regeneration"],
  ["parry", "Parry"],
  ["damageReduction", "Damage Reduction"],
  ["evasion", "Evasion"],
  ["avoidance", "Avoidance"],
  ["turnResistance", "Turn Resistance"],
  ["defensiveReaction", "Defensive Reaction"],
  ["custom", "Custom"],
];

const MONSTER_DEFENSE_TIMING_OPTIONS = [
  ["passive", "Passive"],
  ["onFailedSave", "On Failed Save"],
  ["startOfTurn", "Start of Turn"],
  ["whenHit", "When Hit"],
  ["whenDamaged", "When Damaged"],
  ["onSavingThrow", "On Saving Throw"],
  ["reaction", "Reaction"],
  ["custom", "Custom"],
];

const MONSTER_SUMMON_TYPE_OPTIONS = [
  ["summon", "Summon"],
  ["create", "Create"],
  ["animate", "Animate"],
  ["transform", "Transform"],
  ["spawn", "Spawn"],
  ["custom", "Custom"],
];

const MONSTER_SUMMON_INITIATIVE_OPTIONS = [
  ["immediatelyAfterSummoner", "Immediately After Monster"],
  ["rollInitiative", "Roll Initiative"],
  ["sameInitiative", "Same Initiative"],
  ["startOfNextRound", "Start of Next Round"],
  ["custom", "Custom"],
];

const MONSTER_SUMMON_CONTROL_OPTIONS = [
  ["underSummonerControl", "Under Monster Control"],
  ["hostileToAll", "Hostile to All"],
  ["alliedToSummoner", "Allied to Monster"],
  ["uncontrolled", "Uncontrolled"],
  ["custom", "Custom"],
];

const MONSTER_PROCEDURE_TYPE_OPTIONS = [
  ["swallow", "Swallow"],
  ["engulf", "Engulf"],
  ["possession", "Possession"],
  ["shapechange", "Shapechange"],
  ["objectAnimation", "Object Animation"],
  ["corpseDetonation", "Corpse Detonation"],
  ["burrowReturn", "Burrow and Return"],
  ["gazeLock", "Gaze Lock"],
  ["custom", "Custom"],
];

const MONSTER_PROCEDURE_TIMING_OPTIONS = [
  ["startOfTargetTurn", "Start of Target Turn"],
  ["endOfTargetTurn", "End of Target Turn"],
  ["startOfMonsterTurn", "Start of Monster Turn"],
  ["endOfMonsterTurn", "End of Monster Turn"],
  ["whenTriggered", "When Triggered"],
  ["whileContained", "While Contained"],
  ["custom", "Custom"],
];

const MONSTER_REFERENCE_TYPE_OPTIONS = [
  ["action", "Action"],
  ["attack", "Attack"],
  ["spellcasting", "Spellcasting"],
  ["bonusAction", "Bonus Action"],
  ["reaction", "Reaction"],
  ["legendaryAction", "Legendary Action"],
  ["lairAction", "Lair Action"],
  ["procedure", "Procedure"],
  ["feature", "Feature"],
  ["custom", "Custom"],
];

const MONSTER_REFERENCE_RELATIONSHIP_OPTIONS = [
  ["uses", "Uses"],
  ["makes", "Makes"],
  ["requires", "Requires"],
  ["replaceOneAttack", "Replace One Attack"],
  ["replaceAnyAttack", "Replace Any Attack"],
  ["replaceOneOrMoreAttacks", "Replace One or More Attacks"],
  ["adds", "Adds"],
  ["triggers", "Triggers"],
  ["follows", "Follows"],
  ["custom", "Custom"],
];

const FIELD_HELP = {
  currentInspiration: "Select the Inspiration Module loaded into the editor. Switching modules resets the local draft preview to that module data.",
  inspirationName: "Public name shown in the archive and used as the human-readable source label across creators tools.",
  packId: "Editorial collection or content pack that owns this module. Use a stable pack id, not a display title.",
  status: "Editorial lifecycle state for this module.",
  sourceAnchorId: "Stable slug used by components and generators to link back to this source. Change carefully because linked components reference it.",
  sourceTypes: "Comma-separated source categories such as historical practice, folklore, animal behavior, disease, artifact, or location.",
  themes: "Broad conceptual themes this inspiration supports. These help filtering and content discovery.",
  motifs: "Concrete recurring signs, images, props, or sensory cues creators can reuse in generated content.",
  horrorTags: "Horror design tags that describe the emotional or genre effect this source supports.",
  publicSummary: "Short archive-facing summary. This should explain what the inspiration is and why creators might use it.",
  narrative: "Longer editorial note explaining why the source is disturbing, useful, or thematically important.",
  uploadPreview: "Local preview only. The MVP does not write the image file into the repository.",
  imageKey: "Filename or asset key that the published card should resolve to when assets are wired.",
  imageUrl: "Optional direct URL for previewing or referencing an external image source during editing.",
  imageNote: "Internal note about the image choice, source, crop, usage, or replacement status.",
  componentTitle: "Creator-facing component name shown in editor lists and generator pickers.",
  contentType: "Generator-facing component family. This determines which tool can consume the component.",
  slots: "Comma-separated slots where this component can appear, such as body, attack, visibleAnomaly, hazard, or locationRegion.",
  workflows: "Comma-separated tools that can use this component, such as monster-composer or darken-location.",
  sourceAnchors: "Source anchor ids linked to this component. Usually this should include the current Inspiration Module source anchor.",
  tags: "Additional implementation tags used for filtering, compatibility, or future search.",
  componentSummary: "Short internal/editor summary of what this component adds.",
  tableText: "Table-ready prose or output text that could be shown to a DM.",
  mechanics: "Rules, constraints, effects, or implementation notes used when this component becomes playable content.",
  monsterSlot: "Monster Composer slot where this graft belongs, such as body, mind, movement, attack, horror, twist, weakness, death, or lair.",
  monsterSection: "Monster stat block section or editorial bucket, such as trait, action, reaction, bonus, aura, or lair.",
  monsterCost: "Relative budget cost. Higher values should represent stronger or more disruptive grafts.",
  monsterComplexity: "Relative handling complexity. Use higher values for grafts that add decisions, tracking, or multi-step effects.",
  counterplay: "How players can recognize, avoid, resist, exploit, or disable this monster graft.",
  rulesSection: "The stat block section where this graft is printed. This is separate from the Monster Composer slot.",
  actionEconomy: "How the ability consumes or modifies action economy: passive, action, bonus action, reaction, lair action, death trigger, and so on.",
  usageType: "How often the ability can be used: passive, at will, recharge, limited, triggered, lair, legendary, or death.",
  usageValue: "Optional usage detail, such as 5-6 for Recharge, 1/Day for limited use, or 3 uses for legendary actions.",
  trigger: "Required for reactions, death triggers, free triggers, and conditional traits. Write the game event that allows the graft to happen.",
  resolutionType: "How the ability resolves mechanically: attack roll, saving throw, automatic effect, check, or no roll.",
  targetingType: "Who or what the ability affects: the monster itself, a single target, an area, or custom targeting text.",
  targetingShape: "Area geometry used in 2024-style rules text, such as Radius, Cone, Sphere, Cube, Line, Cylinder, or Emanation.",
  targetingSize: "Numeric size of the target area or reach expression, usually in feet.",
  targetingTargets: "Target phrase printed after the save or effect, such as creatures in the area or each creature in the radius.",
  targetingText: "Custom targeting phrase used instead of generated targeting text.",
  areaEffect: "Structured area timing for auras, emanations, zones, hazards, lair effects, and regional effects.",
  areaEffectType: "What kind of area effect this is: aura, emanation, hazard, zone, regional effect, or custom.",
  areaEffectOrigin: "Where the area comes from: the monster, a target, a point, the location, or custom text.",
  areaEffectTiming: "When creatures are affected by the area, such as entering it, starting a turn there, or while remaining inside.",
  areaEffectExcludes: "Comma-separated creatures or groups excluded from the area, such as self, allies, or undead.",
  areaEffectText: "Optional exact generated text for unusual area effects. Leave empty to use standard wording.",
  attackType: "For Attack Roll abilities, choose whether the attack is melee, ranged, or can be either.",
  attackBasis: "Editorial basis for the attack. Melee usually uses Strength, ranged usually uses Dexterity, but the printed attack bonus still comes from the monster baseline unless set otherwise.",
  saveAbility: "For Saving Throw abilities, choose the ability used by the target.",
  damageMode: "How damage is produced. Budget means the renderer scales damage from the monster CR/DPR profile.",
  damageBudgetRole: "The combat budget bucket for this damage: main attack, bonus action, recharge burst, reaction punish, death burst, and so on.",
  damageBudgetShare: "Decimal share of the monster printed DPR used by this ability before converting to dice. Example: 0.85 for 85% of DPR.",
  damageExpectedTargets: "Expected number of targets for effective DPR calculations, especially for area abilities.",
  damageRoundWeight: "Comma-separated three-round usage weights, such as 1, 0.35, 0.35 for a recharge ability.",
  damageScale: "Legacy relative share of the monster damage budget. Used as fallback when no budget share is set.",
  damageTypes: "Comma-separated damage types, such as acid, poison, bludgeoning, necrotic, or psychic.",
  conditionNames: "Comma-separated conditions or special condition-like effects caused by this graft.",
  conditionSeverity: "How disruptive the condition is for balance and counterplay warnings.",
  conditionDuration: "How long the condition lasts, including repeat saves or cleanup/removal conditions.",
  conditionSizeLimit: "Optional target size limit for the condition, such as Large or smaller.",
  conditionEscape: "Adds an escape DC clause, usually for Grappled or Restrained effects.",
  conditionEscapeAbility: "Ability basis for the escape attempt. Strength is the usual default.",
  conditionRepeatSave: "Adds a repeat saving throw clause to end or resist the ongoing condition.",
  conditionRepeatTiming: "When the target repeats the save, such as at the end of each of its turns.",
  ongoingEffect: "Adds an ongoing effect that happens on a turn timing, usually ongoing damage while a condition or area persists.",
  ongoingTiming: "When the ongoing effect happens.",
  ongoingEndCondition: "How long the ongoing effect continues, such as until the grapple ends or until cleaned away.",
  failureText: "Text generated after Failure: for a structured saving throw or secondary save.",
  successText: "Text generated after Success: for a structured saving throw or secondary save.",
  effectText: "Structured effect text for traits, triggers, reactions, or additional generated rules text.",
  missText: "Text generated after Miss: for structured attack roll abilities.",
  hitOrMissText: "Text generated after Hit or Miss: for attack abilities with a shared outcome.",
  failureOrSuccessText: "Text generated after Failure or Success: for saving throws with a shared outcome.",
  manualRulesText: "Manual override for this graft's final stat block text. Token formulas such as {attack-bonus}, {save-dc}, {damage:standard}, and {damage-part:venom} are resolved during export.",
  generatedRulesPreview: "Read-only generated stat block text preview. This is built from the structured Monster Graft Data fields.",
  damageParts: "Structured damage parts. Use separate parts for mixed damage such as weapon damage plus poison, lightning, necrotic, or another rider.",
  multiattack: "Structured Multiattack text for action entries that combine several attacks or allow replacements.",
  multiattackMode: "How the Multiattack line is built: fixed attacks, attack choice, attack plus ability, replacement, or custom template.",
  multiattackCount: "Total expected number of attacks made by this Multiattack. Used by future DPR allocation and complexity checks.",
  multiattackTemplate: "Optional custom generated template. It can use tokens such as {attack:Slam}, {multiattack-count}, or normal stat block tokens.",
  multiattackReplacement: "Optional replacement rule, such as replacing one attack with Spellcasting or another ability.",
  spellcasting: "Structured spellcasting block backed by the 5E 2024 spell registry. Use this instead of hand-typing spell lists when possible.",
  spellcastingAbility: "Ability used by the monster for spellcasting. The printed DC and attack bonus can still come from the monster baseline.",
  spellcastingSource: "Whether the spell save DC or spell attack bonus comes from the monster baseline, a fixed value, a custom value, or is omitted.",
  spellcastingMaterials: "Most monster spellcasting entries say the monster requires no Material components. Turn this on only when Material components should remain required.",
  spellPicker: "Search the 5E 2024 spell database by name, level, or school, then add matching spells to one of the spellcasting lists.",
  defenseFeature: "Structured defensive feature. Use this for Legendary Resistance, Magic Resistance, Regeneration, Parry, Evasion, and similar defensive traits or reactions.",
  defenseType: "The defensive mechanic this graft represents. This drives generated text and balance tags.",
  defenseValue: "Numeric value used by defensive mechanics, such as regeneration HP, Parry AC bonus, or damage reduction amount.",
  defenseUses: "Limited uses for defensive mechanics such as Legendary Resistance.",
  defenseTiming: "When the defensive feature applies or can be used.",
  defenseDamageTypes: "Damage types affected by the defense, such as fire, necrotic, or nonmagical bludgeoning/piercing/slashing.",
  defenseBreakCondition: "Condition that disables or bypasses the defense, such as takes Fire damage or is in sunlight.",
  defenseText: "Manual generated-text body for unusual defensive features. Leave empty for standard generated wording.",
  summon: "Summon/Create/Animate defines abilities that introduce another creature, entity, duplicate, or minion into the encounter.",
  summonType: "The kind of creation effect: summon, create, animate, transform, spawn, or custom.",
  summonCreature: "Creature or entity name/reference produced by the ability, such as Shadow, Zombie, Spectral Duplicate, or Swarm.",
  summonCount: "How many creatures or entities appear. Can be a number or dice expression, such as 1, 2, or 1d4.",
  summonPlacement: "Where the created creatures appear, such as unoccupied spaces within 30 feet.",
  summonDuration: "How long the summoned creatures remain, such as until destroyed or for 1 minute.",
  summonInitiative: "When the summoned creatures act in initiative.",
  summonControl: "Who controls the summoned creatures or how they behave.",
  summonLimit: "Optional usage or population cap for the summon, such as once per day or maximum three at a time.",
  summonText: "Custom summon text. Leave empty to use generated wording.",
  procedure: "Special procedures model multi-step abilities such as Swallow, Engulf, Possession, Shapechange, object animation, and other bespoke rules.",
  procedureType: "The kind of special procedure this graft creates.",
  procedureTargetLimit: "Optional target restriction for the procedure, such as Large or smaller, a Grappled creature, or one corpse.",
  procedurePrerequisite: "Requirement that must be true before the procedure can happen.",
  procedureEntryEffect: "What happens when the procedure starts, such as the target is swallowed or possessed.",
  procedureInternalState: "Ongoing state while the procedure persists, such as Total Cover, Blinded, Restrained, controlled, or transformed.",
  procedureOngoingDamage: "Optional ongoing damage attached to the procedure.",
  procedureEscapeCondition: "How the target can escape, resist, or force the procedure to end.",
  procedureReleaseCondition: "How the procedure releases the target or ends naturally, such as when the monster dies.",
  procedureText: "Custom procedure text. Leave empty to use generated wording.",
  references: "Ability Links connect this graft to other named actions, attacks, spellcasting entries, reactions, or special procedures so Multiattack, Legendary Actions, replacements, and prerequisites can refer to structured abilities instead of only text.",
  referenceType: "The kind of ability being linked, such as Action, Attack, Spellcasting, Reaction, Procedure, or Feature.",
  referenceRelationship: "How this graft relates to the linked ability: uses it, makes an attack, requires it, replaces one attack with it, triggers it, or follows it.",
  referenceRef: "Stable internal id of the referenced ability, such as bite, claw, spellcasting, or frightful-presence.",
  referenceLabel: "Readable label printed in generated text, such as Bite, Claw, Spellcasting, or Frightful Presence.",
  referenceCount: "Optional number of times the referenced attack or ability is used.",
  referenceText: "Optional exact generated sentence for this reference. Leave empty to use standard wording.",
  spellList: "Comma-separated spell names or ids. Known spells are stored as spell references; unknown entries are preserved as manual spell names.",
  regionRole: "Map role for this region, such as core, side, threshold, connector, secret, or climax.",
  regionSize: "Expected map footprint. Use practical labels such as Small, Medium, Large, or Huge.",
  regionShape: "Preferred room geometry or layout cue for the map generator.",
  regionConnectors: "Expected number of entrances/exits or links to other regions.",
  componentSearch: "Filter the current component family by title, id, slot, tag, summary, or mechanics.",
};

const SECTION_HELP = {
  identity: "Use this area to define what the inspiration is, where it belongs editorially, how it appears in the archive, and which tags downstream tools inherit.",
  media: "Use this area to inspect the public card preview and track the image asset fields needed for publication.",
  components: "Use this area to manage the generator content linked to the current inspiration. Monster grafts feed Monster Composer; location components and regions feed Darken/Map.",
  export: "Use this area to copy the current local draft. This MVP does not write directly to files.",
  taxonomy: "Taxonomy fields describe the source itself. Components can inherit these tags so search and generator filters remain coherent.",
  publicCopy: "Public copy should be understandable outside the generator. It explains the source and why it matters creatively.",
  playableText: "Playable text is the material that can appear in DM-facing output, not just editorial notes.",
};

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function splitList(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value) {
  return asArray(value).join(", ");
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getExplicitMonsterRules(component = {}) {
  const monsterRules = component.monster?.rules;
  if (isPlainObject(monsterRules) && Object.keys(monsterRules).length) return monsterRules;
  if (isPlainObject(component.rules) && Object.keys(component.rules).length) return component.rules;
  return null;
}

function buildMonsterRulesFeature(component = {}, explicitRules = null) {
  const monster = component.monster || {};
  const feature = {
    id: monster.graftId || component.id,
    title: component.title || component.label || monster.graftId || component.id,
    slot: monster.slot || asArray(component.slots)[0],
    section: monster.section || explicitRules?.section || "trait",
    source: asArray(component.sourceAnchors)[0],
    sourceAnchors: asArray(component.sourceAnchors),
    typeBias: asArray(monster.typeBias),
    roleBias: asArray(monster.roleBias),
    cost: Number(monster.cost || 0),
    complexity: Number(monster.complexity || 0),
    stats: monster.stats || {},
    summary: component.summary || "",
    mechanics: component.mechanics || component.tableText || "",
    counterplay: component.counterplay || "",
  };
  if (explicitRules) feature.rules = explicitRules;
  return feature;
}

function splitSpellListInput(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatSpellListInput(list = {}) {
  return [
    ...asArray(list.spellRefs).map(getSpell5e24Name),
    ...asArray(list.spells),
  ].filter(Boolean).join(", ");
}

function parseSpellListInput(value) {
  return splitSpellListInput(value).reduce((acc, entry) => {
    const ref = normalizeSpell5e24Ref(entry);
    if (ref && ref !== entry) {
      acc.spellRefs.push(ref);
    } else if (SPELLS_5E24.some((spell) => spell.id === ref)) {
      acc.spellRefs.push(ref);
    } else {
      acc.spells.push(entry);
    }
    return acc;
  }, { spellRefs: [], spells: [] });
}

function spellListLabelForUsage(usage) {
  const labels = {
    atWill: "At will",
    daily1: "1/day each",
    daily2: "2/day each",
    daily3: "3/day each",
    custom: "Custom",
  };
  return labels[usage] || "Spells";
}

function normalizeTooltipLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function HelpTooltip({ title = "Info", text, items = "" }) {
  const tooltipText = [text, items].filter(Boolean).join("\n");
  if (!tooltipText) return null;
  const ariaText = normalizeTooltipLine(tooltipText);

  return (
    <span
      className="studio-help"
      tabIndex="0"
      role="button"
      aria-label={`${title}: ${ariaText}`}
      data-key="tooltip-generic"
      data-tooltip={title}
      data-tooltip-description={tooltipText}
    >
      <span aria-hidden="true">?</span>
    </span>
  );
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-inspiration";
}

function getModuleComponentGroups(draft) {
  const components = asArray(draft.components);
  return {
    all: components,
    "monster-graft": components.filter((component) => component.contentType === "monster-graft"),
    "location-component": components.filter((component) => component.contentType === "location-component"),
    "location-region": components.filter((component) => component.contentType === "location-region"),
  };
}

function normalizeModuleForDraft(module) {
  const draft = clone(module || EMPTY_DRAFT);
  const sourceAnchorId = draft.sourceAnchor?.id || draft.id || slugify(draft.title);

  draft.id = draft.id || sourceAnchorId;
  draft.title = draft.title || draft.sourceAnchor?.label || draft.inspiration?.title || sourceAnchorId;
  draft.status = draft.status || draft.sourceAnchor?.status || draft.inspiration?.status || "draft";
  draft.packId = draft.packId || "core-cruor";
  draft.sourceAnchor = {
    ...EMPTY_DRAFT.sourceAnchor,
    ...(draft.sourceAnchor || {}),
    id: sourceAnchorId,
  };
  draft.inspiration = {
    ...EMPTY_DRAFT.inspiration,
    ...(draft.inspiration || {}),
    sourceAnchors: asArray(draft.inspiration?.sourceAnchors).length
      ? asArray(draft.inspiration?.sourceAnchors)
      : [sourceAnchorId],
    media: {
      ...EMPTY_DRAFT.inspiration.media,
      ...(draft.inspiration?.media || {}),
    },
  };
  draft.components = asArray(draft.components);
  draft.monsterGrafts = draft.components.filter((component) => component.contentType === "monster-graft");
  draft.locationComponents = draft.components.filter((component) => component.contentType === "location-component");
  draft.locationRegions = draft.components.filter((component) => component.contentType === "location-region");
  draft.metadata = { ...(draft.metadata || {}) };

  return draft;
}

function buildModuleExport(draft, imagePreviewUrl) {
  const normalized = normalizeModuleForDraft(draft);
  return {
    id: normalized.id,
    title: normalized.title,
    status: normalized.status,
    packId: normalized.packId,
    sourceAnchor: normalized.sourceAnchor,
    inspiration: {
      ...normalized.inspiration,
      media: {
        ...(normalized.inspiration.media || {}),
        previewOnlyImageDataUrl: imagePreviewUrl || undefined,
      },
    },
    components: normalized.components,
    metadata: {
      ...normalized.metadata,
      exportedFrom: "inspiration-studio-mvp",
    },
  };
}

function buildComponentTemplate(type, draft) {
  const sourceAnchorId = draft.sourceAnchor?.id || draft.id || "new-inspiration";
  const baseId = `${sourceAnchorId}-${type}-${draft.components.length + 1}`;
  const title =
    type === "monster-graft"
      ? "New Monster Graft"
      : type === "location-region"
        ? "New Location Region"
        : "New Location Component";

  const component = {
    id: baseId,
    title,
    label: title,
    type: COMPONENT_TYPE_LABELS[type] || "Component",
    contentType: type,
    status: "draft",
    workflows: type === "monster-graft" ? ["monster-composer"] : ["darken-location"],
    slots: type === "monster-graft" ? ["body"] : type === "location-region" ? ["locationRegion"] : ["visibleAnomaly"],
    sourceAnchors: [sourceAnchorId],
    sourceTypes: asArray(draft.sourceAnchor?.sourceTypes),
    themes: asArray(draft.sourceAnchor?.themes),
    motifs: asArray(draft.sourceAnchor?.motifs),
    horror: asArray(draft.sourceAnchor?.horror),
    summary: "",
    tableText: "",
    mechanics: "",
    tags: [],
  };

  if (type === "monster-graft") {
    component.monster = {
      slot: "body",
      section: "trait",
      typeBias: [],
      roleBias: [],
      cost: 1,
      complexity: 1,
      stats: {},
      rules: {
        section: "trait",
        actionEconomy: "passive",
        usage: { type: "passive" },
        resolution: { type: "none" },
        targeting: { type: "self", targets: "the creature" },
        damage: { mode: "none", types: [] },
        condition: null,
        counterplay: {},
        text: {},
      },
    };
    component.counterplay = "";
  }

  if (type === "location-region") {
    component.locationRegion = {
      role: "side",
      size: "Medium",
      shape: "standard",
      connectors: 2,
      density: "medium",
      readAloud: { compact: "", extended: "" },
    };
  }

  return component;
}

function matchesComponentSearch(component, query) {
  if (!query) return true;
  const haystack = [
    component.title,
    component.label,
    component.id,
    component.summary,
    component.tableText,
    component.mechanics,
    joinList(component.slots),
    joinList(component.tags),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function Icon({ name }) {
  return <i className={`fa-solid ${name}`} aria-hidden="true" />;
}

function FormRow({ children, className = "", label, icon, hint, helpItems }) {
  return (
    <div className={`studio-form-row ${className}`.trim()}>
      <span className="studio-field-head">
        <span className="studio-field-label">
          {icon ? <Icon name={icon} /> : null}
          {label}
        </span>
        <HelpTooltip title={label} text={hint} items={helpItems} />
      </span>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, ...props }) {
  return <input {...props} value={value || ""} onChange={(event) => onChange(event.target.value)} />;
}

function TextArea({ value, onChange, ...props }) {
  return <textarea {...props} value={value || ""} onChange={(event) => onChange?.(event.target.value)} />;
}

function SelectInput({ options, value, onChange }) {
  return (
    <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>{label}</option>
      ))}
    </select>
  );
}

function StudioTabButton({ icon, isActive, label, count, hint, onClick }) {
  return (
    <button
      className={`studio-tab-button ${isActive ? "is-active" : ""}`.trim()}
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
    >
      <span className="studio-tab-button__label">
        <Icon name={icon} />
        <span>{label}</span>
        {typeof count === "number" ? <strong>{count}</strong> : null}
      </span>
      {hint ? <em>{hint}</em> : null}
    </button>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <span className="studio-stat-pill">
      <Icon name={icon} />
      <strong>{value}</strong>
      <em>{label}</em>
    </span>
  );
}

function PanelTitle({ eyebrow, title, icon, help, children }) {
  return (
    <div className="studio-panel__heading">
      <div className="studio-panel__title">
        <span>
          {icon ? <Icon name={icon} /> : null}
          {eyebrow}
        </span>
        <h3>{title}</h3>
      </div>
      <div className="studio-panel__actions">
        <HelpTooltip title={title} text={help} />
        {children}
      </div>
    </div>
  );
}

function DividerLabel({ icon, title, help }) {
  return (
    <div className="studio-divider-label">
      <span className="studio-divider-label__title">
        {icon ? <Icon name={icon} /> : null}
        {title}
      </span>
      <HelpTooltip title={title} text={help} />
    </div>
  );
}

function RulesGroup({ actions = null, icon, title, help, children }) {
  return (
    <section className="studio-rules-group">
      <header className="studio-rules-group__heading">
        <span className="studio-rules-group__title">
          {icon ? <Icon name={icon} /> : null}
          {title}
        </span>
        <span className="studio-rules-group__tools">
          <HelpTooltip title={title} text={help} />
          {actions}
        </span>
      </header>
      <div className="studio-rules-group__body">{children}</div>
    </section>
  );
}

function IconOnlyRemoveButton({ label, onClick, disabled = false }) {
  return (
    <button
      className="studio-icon-button studio-rules-block-remove"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Remove ${label}`}
      title={`Remove ${label}`}
    >
      <Icon name="fa-trash" />
    </button>
  );
}

function RemoveRulesBlockButton({ label, onClick }) {
  return <IconOnlyRemoveButton label={label} onClick={onClick} />;
}

export default function InspirationStudioPage() {
  const [modules, setModules] = useState([]);
  const [packSummaries, setPackSummaries] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [draft, setDraft] = useState(() => normalizeModuleForDraft(EMPTY_DRAFT));
  const [activeSection, setActiveSection] = useState("identity");
  const [componentMode, setComponentMode] = useState("monsters");
  const [locationFilter, setLocationFilter] = useState("all");
  const [componentSearch, setComponentSearch] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [copyState, setCopyState] = useState("idle");

  useEffect(() => {
    let cancelled = false;

    async function loadStudioData() {
      const [loadedModules, loadedPacks] = await Promise.all([
        loadInspirationModules(),
        loadContentPackSummaries(),
      ]);

      if (cancelled) return;

      const normalizedModules = asArray(loadedModules).map(normalizeModuleForDraft);
      setModules(normalizedModules);
      setPackSummaries(asArray(loadedPacks));

      const firstModule = normalizedModules[0] || normalizeModuleForDraft(EMPTY_DRAFT);
      setSelectedModuleId(firstModule.id);
      setDraft(firstModule);
      setSelectedComponentId(firstModule.components[0]?.id || null);
    }

    loadStudioData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const componentGroups = useMemo(() => getModuleComponentGroups(draft), [draft]);
  const monsterComponents = componentGroups["monster-graft"] || [];
  const locationComponents = useMemo(() => {
    const items = [
      ...(componentGroups["location-component"] || []),
      ...(componentGroups["location-region"] || []),
    ];
    if (locationFilter === "location-component") return items.filter((component) => component.contentType === "location-component");
    if (locationFilter === "location-region") return items.filter((component) => component.contentType === "location-region");
    return items;
  }, [componentGroups, locationFilter]);
  const activeComponentPool = componentMode === "monsters" ? monsterComponents : locationComponents;
  const visibleComponents = activeComponentPool.filter((component) => matchesComponentSearch(component, componentSearch));
  const selectedComponent = draft.components.find((component) => component.id === selectedComponentId) || visibleComponents[0] || null;
  const exportObject = useMemo(() => buildModuleExport(draft, imagePreviewUrl), [draft, imagePreviewUrl]);
  const exportJson = useMemo(() => JSON.stringify(exportObject, null, 2), [exportObject]);

  function updateDraft(updater) {
    setDraft((currentDraft) => {
      const nextDraft = clone(currentDraft);
      updater(nextDraft);
      nextDraft.monsterGrafts = nextDraft.components.filter((component) => component.contentType === "monster-graft");
      nextDraft.locationComponents = nextDraft.components.filter((component) => component.contentType === "location-component");
      nextDraft.locationRegions = nextDraft.components.filter((component) => component.contentType === "location-region");
      return nextDraft;
    });
  }

  function updateDraftField(path, value) {
    updateDraft((nextDraft) => {
      let target = nextDraft;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function updateArrayField(path, value) {
    updateDraftField(path, splitList(value));
  }

  function updateComponent(componentId, updater) {
    updateDraft((nextDraft) => {
      const component = nextDraft.components.find((item) => item.id === componentId);
      if (component) updater(component);
    });
  }

  function selectModule(moduleId) {
    const module = modules.find((item) => item.id === moduleId);
    if (!module) return;
    const nextDraft = normalizeModuleForDraft(module);
    setSelectedModuleId(moduleId);
    setDraft(nextDraft);
    setComponentMode("monsters");
    setLocationFilter("all");
    setComponentSearch("");
    setSelectedComponentId(nextDraft.components[0]?.id || null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl("");
  }

  function handleTitleChange(value) {
    updateDraft((nextDraft) => {
      const nextId = slugify(value);
      nextDraft.title = value;
      nextDraft.sourceAnchor.label = value;
      nextDraft.inspiration.title = value;
      nextDraft.inspiration.label = value;
      if (!nextDraft.id || nextDraft.id === selectedModuleId) {
        nextDraft.id = nextDraft.sourceAnchor.id || nextId;
      }
    });
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    updateDraft((nextDraft) => {
      nextDraft.inspiration.media = nextDraft.inspiration.media || {};
      nextDraft.inspiration.media.imageKey = file.name;
      nextDraft.inspiration.media.imageNote = nextDraft.inspiration.media.imageNote || `${nextDraft.title} inspiration image.`;
    });
  }

  function addComponent(type) {
    const component = buildComponentTemplate(type, draft);
    setActiveSection("components");
    setComponentMode(type === "monster-graft" ? "monsters" : "locations");
    setLocationFilter(type === "location-region" ? "location-region" : type === "location-component" ? "location-component" : "all");
    setComponentSearch("");
    setSelectedComponentId(component.id);
    updateDraft((nextDraft) => {
      nextDraft.components.unshift(component);
    });
  }

  function removeComponent(componentId) {
    const remainingComponents = draft.components.filter((component) => component.id !== componentId);
    if (selectedComponentId === componentId) {
      setSelectedComponentId(remainingComponents[0]?.id || null);
    }

    updateDraft((nextDraft) => {
      nextDraft.components = nextDraft.components.filter((component) => component.id !== componentId);
    });
  }

  function selectComponentWorkspace(mode) {
    setComponentMode(mode);
    setComponentSearch("");
    const nextPool = mode === "monsters" ? monsterComponents : locationComponents;
    setSelectedComponentId(nextPool[0]?.id || null);
  }

  async function copyExportJson() {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1400);
    }
  }

  const packTitle = packSummaries.find((pack) => pack.id === draft.packId)?.title || draft.packId;
  const imageSource = imagePreviewUrl || draft.inspiration?.media?.imageUrl || "";

  return (
    <section className="inspiration-studio" aria-label="Inspiration Studio" data-studio-ready="true">
      <header className="inspiration-studio__header">
        <div className="inspiration-studio__headline">
          <span className="inspiration-studio__eyebrow">
            <Icon name="fa-screwdriver-wrench" /> Creator Tool
          </span>
          <h1>Inspiration Studio</h1>
          <p>Inspect and reshape the Inspiration Module model before converting the full archive.</p>
        </div>

        <div className="inspiration-studio__module-picker" aria-label="Current inspiration module">
          <FormRow label="Current Inspiration" icon="fa-book-open" hint={FIELD_HELP.currentInspiration}>
            <select value={selectedModuleId || ""} onChange={(event) => selectModule(event.target.value)}>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>{module.title}</option>
              ))}
            </select>
          </FormRow>
          <div className="inspiration-studio__quick-meta">
            <span>{packTitle}</span>
            <span>{draft.status}</span>
            <span>{draft.id}</span>
          </div>
        </div>
      </header>

      <div className="inspiration-studio__summary-bar" aria-label="Module summary">
        <StatPill icon="fa-puzzle-piece" label="Components" value={draft.components.length} />
        <StatPill icon="fa-skull" label="Grafts" value={monsterComponents.length} />
        <StatPill icon="fa-map-location-dot" label="Locations" value={componentGroups["location-component"].length} />
        <StatPill icon="fa-dungeon" label="Regions" value={componentGroups["location-region"].length} />
      </div>

      <div className="inspiration-studio__sheet">
        <nav className="inspiration-studio__section-tabs" aria-label="Studio editor sections">
          {STUDIO_SECTIONS.map((section) => (
            <StudioTabButton
              key={section.id}
              icon={section.icon}
              isActive={activeSection === section.id}
              label={section.label}
              hint={section.hint}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </nav>

        <main className="inspiration-studio__main" aria-label="Inspiration module editor">
          {activeSection === "identity" ? (
            <IdentityWorkspace
              draft={draft}
              imageSource={imageSource}
              onTitleChange={handleTitleChange}
              onImageUpload={handleImageUpload}
              updateArrayField={updateArrayField}
              updateDraft={updateDraft}
              updateDraftField={updateDraftField}
            />
          ) : null}

          {activeSection === "components" ? (
            <ComponentsWorkspace
              componentMode={componentMode}
              componentSearch={componentSearch}
              locationComponentsCount={componentGroups["location-component"].length}
              locationFilter={locationFilter}
              locationRegionsCount={componentGroups["location-region"].length}
              monsterComponentsCount={monsterComponents.length}
              selectedComponent={selectedComponent}
              selectedComponentId={selectedComponentId}
              visibleComponents={visibleComponents}
              onAddComponent={addComponent}
              onComponentModeChange={selectComponentWorkspace}
              onComponentSearchChange={setComponentSearch}
              onLocationFilterChange={(filter) => {
                setLocationFilter(filter);
                setSelectedComponentId(null);
              }}
              onRemoveComponent={() => selectedComponent ? removeComponent(selectedComponent.id) : null}
              onSelectComponent={setSelectedComponentId}
              onUpdateComponent={updateComponent}
            />
          ) : null}

          {activeSection === "export" ? (
            <ExportWorkspace copyState={copyState} exportJson={exportJson} onCopy={copyExportJson} />
          ) : null}
        </main>
      </div>
    </section>
  );
}

function IdentityWorkspace({ draft, imageSource, onImageUpload, onTitleChange, updateArrayField, updateDraft, updateDraftField }) {
  return (
    <div className="inspiration-studio__workspace inspiration-studio__workspace--identity">
      <section className="studio-panel studio-panel--identity" aria-label="Identity and public card">
        <PanelTitle eyebrow="Identity" icon="fa-id-card-clip" title="Source & Public Card" help={SECTION_HELP.identity} />

        <div className="studio-form-grid studio-form-grid--primary">
          <FormRow label="Inspiration Name" icon="fa-signature" hint={FIELD_HELP.inspirationName}>
            <TextInput value={draft.title} onChange={onTitleChange} />
          </FormRow>
          <FormRow label="Collection / Pack" icon="fa-layer-group" hint={FIELD_HELP.packId}>
            <TextInput list="studio-pack-options" value={draft.packId} onChange={(value) => updateDraftField(["packId"], value)} />
          </FormRow>
          <FormRow className="studio-form-row--wide" label="Status" icon="fa-circle-check" hint={FIELD_HELP.status} helpItems={STATUS_TOOLTIP_ITEMS}>
            <select value={draft.status} onChange={(event) => updateDraftField(["status"], event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </FormRow>
          <FormRow label="Source Anchor ID" icon="fa-fingerprint" hint={FIELD_HELP.sourceAnchorId}>
            <TextInput value={draft.sourceAnchor.id} onChange={(value) => updateDraftField(["sourceAnchor", "id"], value)} />
          </FormRow>
        </div>

        <datalist id="studio-pack-options">
          <option value="core-cruor" />
          <option value="existing-inspirations" />
          <option value="decomposition-inspiration-module" />
          <option value="sedlec-ossuary-inspiration-module" />
        </datalist>

        <DividerLabel icon="fa-tags" title="Taxonomy" help={SECTION_HELP.taxonomy} />
        <div className="studio-form-grid">
          <FormRow label="Source Types" icon="fa-folder-tree" hint={FIELD_HELP.sourceTypes}>
            <TextInput value={joinList(draft.sourceAnchor.sourceTypes)} onChange={(value) => updateArrayField(["sourceAnchor", "sourceTypes"], value)} />
          </FormRow>
          <FormRow label="Themes" icon="fa-moon" hint={FIELD_HELP.themes}>
            <TextInput value={joinList(draft.sourceAnchor.themes)} onChange={(value) => updateArrayField(["sourceAnchor", "themes"], value)} />
          </FormRow>
          <FormRow label="Motifs" icon="fa-eye" hint={FIELD_HELP.motifs}>
            <TextInput value={joinList(draft.sourceAnchor.motifs)} onChange={(value) => updateArrayField(["sourceAnchor", "motifs"], value)} />
          </FormRow>
          <FormRow label="Horror Tags" icon="fa-droplet" hint={FIELD_HELP.horrorTags}>
            <TextInput value={joinList(draft.sourceAnchor.horror)} onChange={(value) => updateArrayField(["sourceAnchor", "horror"], value)} />
          </FormRow>
        </div>

        <DividerLabel icon="fa-align-left" title="Public Copy" help={SECTION_HELP.publicCopy} />
        <FormRow label="Public Summary" icon="fa-quote-left" hint={FIELD_HELP.publicSummary}>
          <TextArea rows={4} value={draft.inspiration.summary || draft.sourceAnchor.summary} onChange={(value) => {
            updateDraft((nextDraft) => {
              nextDraft.inspiration.summary = value;
              nextDraft.sourceAnchor.summary = value;
            });
          }} />
        </FormRow>

        <FormRow label="Why It Disturbs / Narrative" icon="fa-book-skull" hint={FIELD_HELP.narrative}>
          <TextArea rows={5} value={draft.inspiration.narrative} onChange={(value) => updateDraftField(["inspiration", "narrative"], value)} />
        </FormRow>
      </section>

      <section className="studio-panel studio-panel--media" aria-label="Card image">
        <PanelTitle eyebrow="Card Image" icon="fa-image" title="Preview & Asset" help={SECTION_HELP.media} />

        <div className="studio-card-preview">
          {imageSource ? (
            <img src={imageSource} alt={`${draft.title} preview`} />
          ) : (
            <div className="studio-card-preview__empty">
              <Icon name="fa-image" />
              <span>No Image Preview</span>
            </div>
          )}
          <div>
            <strong>{draft.title}</strong>
            <span>{draft.sourceAnchor.sourceTypes?.[0] || "Source Anchor"}</span>
          </div>
        </div>

        <FormRow label="Upload Preview Image" icon="fa-upload" hint={FIELD_HELP.uploadPreview}>
          <input type="file" accept="image/*" onChange={onImageUpload} />
        </FormRow>
        <FormRow label="Image Key / Filename" icon="fa-file-image" hint={FIELD_HELP.imageKey}>
          <TextInput value={draft.inspiration.media?.imageKey} onChange={(value) => updateDraftField(["inspiration", "media", "imageKey"], value)} />
        </FormRow>
        <FormRow label="Image URL" icon="fa-link" hint={FIELD_HELP.imageUrl}>
          <TextInput value={draft.inspiration.media?.imageUrl} onChange={(value) => updateDraftField(["inspiration", "media", "imageUrl"], value)} />
        </FormRow>
        <FormRow label="Image Note" icon="fa-note-sticky" hint={FIELD_HELP.imageNote}>
          <TextArea rows={3} value={draft.inspiration.media?.imageNote} onChange={(value) => updateDraftField(["inspiration", "media", "imageNote"], value)} />
        </FormRow>
      </section>
    </div>
  );
}

function ComponentsWorkspace({
  componentMode,
  componentSearch,
  locationComponentsCount,
  locationFilter,
  locationRegionsCount,
  monsterComponentsCount,
  onAddComponent,
  onComponentModeChange,
  onComponentSearchChange,
  onLocationFilterChange,
  onRemoveComponent,
  onSelectComponent,
  onUpdateComponent,
  selectedComponent,
  selectedComponentId,
  visibleComponents,
}) {
  return (
    <section className="studio-panel studio-panel--components" aria-label="Linked components">
      <PanelTitle eyebrow="Linked Components" icon="fa-diagram-project" title="Generator Content" help={SECTION_HELP.components}>
        <button type="button" onClick={() => onAddComponent("monster-graft")}><Icon name="fa-plus" /> Graft</button>
        <button type="button" onClick={() => onAddComponent("location-component")}><Icon name="fa-plus" /> Location</button>
        <button type="button" onClick={() => onAddComponent("location-region")}><Icon name="fa-plus" /> Region</button>
      </PanelTitle>

      <div className="studio-component-sheet">
        <div className="studio-component-tabs" role="tablist" aria-label="Component families">
          <StudioTabButton
            icon="fa-skull"
            isActive={componentMode === "monsters"}
            label="Monsters"
            count={monsterComponentsCount}
            hint="Grafts consumed by Monster Composer."
            onClick={() => onComponentModeChange("monsters")}
          />
          <StudioTabButton
            icon="fa-map-location-dot"
            isActive={componentMode === "locations"}
            label="Locations"
            count={locationComponentsCount + locationRegionsCount}
            hint="Components and regions consumed by Darken/Map."
            onClick={() => onComponentModeChange("locations")}
          />
        </div>

        <div className="studio-component-toolbar">
          <label className="studio-search-field">
            <Icon name="fa-magnifying-glass" />
            <input value={componentSearch} onChange={(event) => onComponentSearchChange(event.target.value)} placeholder="Search components…" />
            <HelpTooltip title="Search Components" text={FIELD_HELP.componentSearch} />
          </label>

          {componentMode === "locations" ? (
            <div className="studio-filter-tabs" role="tablist" aria-label="Location component filters">
              <button type="button" aria-selected={locationFilter === "all"} onClick={() => onLocationFilterChange("all")}>All <span>{locationComponentsCount + locationRegionsCount}</span></button>
              <button type="button" aria-selected={locationFilter === "location-component"} onClick={() => onLocationFilterChange("location-component")}>Components <span>{locationComponentsCount}</span></button>
              <button type="button" aria-selected={locationFilter === "location-region"} onClick={() => onLocationFilterChange("location-region")}>Regions <span>{locationRegionsCount}</span></button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="studio-component-workspace">
        <div className="studio-component-list" aria-label="Component list">
          {visibleComponents.map((component) => {
            const typeLabel = COMPONENT_TYPE_LABELS[component.contentType] || component.contentType;
            const slotLabel = joinList(component.slots);

            return (
              <button
                className={component.id === selectedComponentId || component.id === selectedComponent?.id ? "is-active" : ""}
                key={component.id}
                type="button"
                onClick={() => onSelectComponent(component.id)}
              >
                <span className="studio-component-list__meta">
                  <Icon name={COMPONENT_TYPE_ICONS[component.contentType] || "fa-puzzle-piece"} />
                  {typeLabel}{slotLabel ? ` • ${slotLabel}` : ""}
                </span>
                <strong>{component.title || component.label}</strong>
              </button>
            );
          })}
          {!visibleComponents.length ? <div className="studio-empty-state">No matching components.</div> : null}
        </div>

        {selectedComponent ? (
          <ComponentEditor
            component={selectedComponent}
            onChange={(updater) => onUpdateComponent(selectedComponent.id, updater)}
            onRemove={onRemoveComponent}
          />
        ) : (
          <div className="studio-empty-state">No component selected.</div>
        )}
      </div>
    </section>
  );
}

function ExportWorkspace({ copyState, exportJson, onCopy }) {
  return (
    <section className="studio-panel studio-panel--export" aria-label="Export module draft">
      <PanelTitle eyebrow="Export" icon="fa-code" title="Module Draft JSON" help={SECTION_HELP.export}>
        <button type="button" onClick={onCopy}>
          <Icon name={copyState === "copied" ? "fa-check" : copyState === "failed" ? "fa-triangle-exclamation" : "fa-copy"} />
          {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy JSON"}
        </button>
      </PanelTitle>
      <p className="studio-export-note">This is a local editor preview. Copy this JSON only after the module organization feels right.</p>
      <textarea className="studio-export-textarea" readOnly value={exportJson} aria-label="Exported Inspiration Module JSON" />
    </section>
  );
}

function ComponentEditor({ component, onChange, onRemove }) {
  const isMonsterGraft = component.contentType === "monster-graft";
  const isLocationRegion = component.contentType === "location-region";
  const [spellPickerQuery, setSpellPickerQuery] = useState("");
  const [spellPickerLevel, setSpellPickerLevel] = useState("all");
  const [spellPickerSchool, setSpellPickerSchool] = useState("all");
  const [spellPickerListId, setSpellPickerListId] = useState("atWill");
  const [activeRulesBlocks, setActiveRulesBlocks] = useState({});

  useEffect(() => {
    setActiveRulesBlocks({});
  }, [component.id]);

  function setField(path, value) {
    onChange((nextComponent) => {
      let target = nextComponent;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function setArray(path, value) {
    setField(path, splitList(value));
  }

  function setRulesField(path, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      if (!isPlainObject(monster.rules) || !Object.keys(monster.rules).length) {
        const hydratedRules = normalizeMonsterGraftRules(buildMonsterRulesFeature(nextComponent, null));
        monster.rules = {
          ...hydratedRules,
          migration: {
            ...(hydratedRules.migration || {}),
            source: "studio-hydrated-legacy",
            isStructured: true,
          },
        };
      }
      let target = monster.rules;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function setRulesArray(path, value) {
    setRulesField(path, splitList(value));
  }

  function setMonsterSlot(value) {
    setField(["monster", "slot"], value);
    setField(["slots"], splitList(value));
  }

  function setResolutionChoice(value) {
    if (value === "attackRollSavingThrow") {
      setRulesField(["resolution", "type"], "attackRoll");
      setRulesField(["secondaryResolution", "type"], "savingThrow");
      setRulesField(["secondaryResolution", "ability"], monsterRules.secondaryResolution?.ability || "strength");
      setRulesField(["secondaryResolution", "dc"], monsterRules.secondaryResolution?.dc || "monster");
      return;
    }
    setRulesField(["resolution", "type"], value);
    if (value !== "attackRoll") {
      setRulesField(["secondaryResolution"], null);
    }
  }

  function setDamagePartField(index, path, value) {
    onChange((nextComponent) => {
      const rules = nextComponent.monster = nextComponent.monster || {};
      rules.rules = rules.rules || {};
      rules.rules.damage = rules.rules.damage || { mode: "parts", parts: [] };
      rules.rules.damage.mode = "parts";
      rules.rules.damage.parts = Array.isArray(rules.rules.damage.parts) ? rules.rules.damage.parts : [];
      rules.rules.damage.parts[index] = rules.rules.damage.parts[index] || { id: `part-${index + 1}`, mode: "budget", scale: "standard", budgetRole: "secondaryAttack", types: [] };
      let target = rules.rules.damage.parts[index];
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function addDamagePart() {
    const parts = asArray(monsterRules.damage?.parts);
    const nextIndex = parts.length;
    setDamagePartField(nextIndex, ["id"], `part-${nextIndex + 1}`);
  }

  function removeDamagePart(index) {
    const parts = asArray(monsterRules.damage?.parts).filter((_, partIndex) => partIndex !== index);
    setRulesField(["damage", "parts"], parts);
  }

  function setMultiattackAttackField(index, path, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.rules = monster.rules || {};
      monster.rules.multiattack = monster.rules.multiattack || { enabled: true, mode: "fixed", count: 2, attacks: [] };
      monster.rules.multiattack.enabled = true;
      monster.rules.multiattack.attacks = Array.isArray(monster.rules.multiattack.attacks) ? monster.rules.multiattack.attacks : [];
      monster.rules.multiattack.attacks[index] = monster.rules.multiattack.attacks[index] || { ref: `attack-${index + 1}`, label: `Attack ${index + 1}`, count: 1 };
      let target = monster.rules.multiattack.attacks[index];
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function addMultiattackAttack() {
    const attacks = asArray(monsterRules.multiattack?.attacks);
    const nextIndex = attacks.length;
    setMultiattackAttackField(nextIndex, ["ref"], `attack-${nextIndex + 1}`);
    setMultiattackAttackField(nextIndex, ["label"], `Attack ${nextIndex + 1}`);
  }

  function removeMultiattackAttack(index) {
    const attacks = asArray(monsterRules.multiattack?.attacks).filter((_, attackIndex) => attackIndex !== index);
    setRulesField(["multiattack", "attacks"], attacks);
  }

  function setMultiattackReplacementField(index, path, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.rules = monster.rules || {};
      monster.rules.multiattack = monster.rules.multiattack || { enabled: true, mode: "fixed", count: 2, replacements: [] };
      monster.rules.multiattack.enabled = true;
      monster.rules.multiattack.replacements = Array.isArray(monster.rules.multiattack.replacements) ? monster.rules.multiattack.replacements : [];
      monster.rules.multiattack.replacements[index] = monster.rules.multiattack.replacements[index] || { replace: "oneAttack", label: "Spellcasting" };
      let target = monster.rules.multiattack.replacements[index];
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function addMultiattackReplacement() {
    const replacements = asArray(monsterRules.multiattack?.replacements);
    const nextIndex = replacements.length;
    setMultiattackReplacementField(nextIndex, ["replace"], "oneAttack");
  }

  function removeMultiattackReplacement(index) {
    const replacements = asArray(monsterRules.multiattack?.replacements).filter((_, replacementIndex) => replacementIndex !== index);
    setRulesField(["multiattack", "replacements"], replacements);
  }

  function setAbilityReferenceField(index, path, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      if (!isPlainObject(monster.rules) || !Object.keys(monster.rules).length) {
        const hydratedRules = normalizeMonsterGraftRules(buildMonsterRulesFeature(nextComponent, null));
        monster.rules = {
          ...hydratedRules,
          migration: {
            ...(hydratedRules.migration || {}),
            source: "studio-hydrated-legacy",
            isStructured: true,
          },
        };
      }
      monster.rules.references = Array.isArray(monster.rules.references) ? monster.rules.references : [];
      monster.rules.references[index] = monster.rules.references[index] || { type: "action", relationship: "uses", ref: `ability-${index + 1}`, label: `Ability ${index + 1}` };
      let target = monster.rules.references[index];
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function addAbilityReference() {
    const references = asArray(monsterRules.references);
    const nextIndex = references.length;
    setAbilityReferenceField(nextIndex, ["type"], "action");
    setAbilityReferenceField(nextIndex, ["relationship"], "uses");
    setAbilityReferenceField(nextIndex, ["ref"], `ability-${nextIndex + 1}`);
    setAbilityReferenceField(nextIndex, ["label"], `Ability ${nextIndex + 1}`);
  }

  function removeAbilityReference(index) {
    const references = asArray(monsterRules.references).filter((_, referenceIndex) => referenceIndex !== index);
    setRulesField(["references"], references);
  }


  function getSpellcastingListsForEdit() {
    const existing = asArray(monsterRules.spellcasting?.lists);
    const byId = new Map(existing.map((list) => [list.id || list.usage, list]));
    return MONSTER_SPELLCASTING_DEFAULT_LISTS.map((list) => ({ ...list, ...(byId.get(list.id) || {}) }));
  }

  function setSpellcastingListById(listId, patch) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.rules = monster.rules || {};
      monster.rules.spellcasting = monster.rules.spellcasting || { enabled: true, ability: "wisdom", lists: [] };
      monster.rules.spellcasting.enabled = true;
      const existing = Array.isArray(monster.rules.spellcasting.lists) ? monster.rules.spellcasting.lists : [];
      const defaults = MONSTER_SPELLCASTING_DEFAULT_LISTS.map((list) => ({ ...list }));
      const byId = new Map([...defaults, ...existing].map((list) => [list.id || list.usage, { ...list }]));
      const current = byId.get(listId) || { id: listId, usage: listId, label: spellListLabelForUsage(listId), spellRefs: [], spells: [] };
      byId.set(listId, { ...current, ...patch });
      monster.rules.spellcasting.lists = Array.from(byId.values()).filter((list) => asArray(list.spellRefs).length || asArray(list.spells).length || list.id === listId);
    });
  }

  function setSpellcastingListInput(listId, value) {
    const parsed = parseSpellListInput(value);
    setSpellcastingListById(listId, parsed);
  }

  function addSpellToSpellcastingList(listId, spellId) {
    if (!spellId) return;
    const lists = getSpellcastingListsForEdit();
    const current = lists.find((list) => list.id === listId) || { id: listId, usage: listId, label: spellListLabelForUsage(listId), spellRefs: [], spells: [] };
    const spellRefs = [...new Set([...asArray(current.spellRefs), spellId])];
    setSpellcastingListById(listId, { spellRefs });
  }

  function addRulesBlock(blockId) {
    setActiveRulesBlocks((current) => ({ ...current, [blockId]: true }));
    if (blockId === "targeting") {
      setRulesField(["targeting", "type"], monsterRules.targeting?.type || "area");
      setRulesField(["targeting", "shape"], monsterRules.targeting?.shape || "radius");
      setRulesField(["targeting", "unit"], monsterRules.targeting?.unit || "ft");
      setRulesField(["targeting", "targets"], monsterRules.targeting?.targets || "creatures");
      return;
    }
    if (blockId === "areaEffect") {
      setRulesField(["areaEffect", "enabled"], true);
      setRulesField(["areaEffect", "type"], monsterRules.areaEffect?.type || "aura");
      setRulesField(["areaEffect", "shape"], monsterRules.areaEffect?.shape || "emanation");
      setRulesField(["areaEffect", "unit"], monsterRules.areaEffect?.unit || "ft");
      setRulesField(["areaEffect", "origin"], monsterRules.areaEffect?.origin || "self");
      setRulesField(["areaEffect", "timing"], monsterRules.areaEffect?.timing || "passive");
      setRulesField(["areaEffect", "targets"], monsterRules.areaEffect?.targets || "creatures");
      return;
    }
    if (blockId === "damage") {
      setRulesField(["damage", "mode"], monsterRules.damage?.mode && monsterRules.damage.mode !== "none" ? monsterRules.damage.mode : "budget");
      setRulesField(["damage", "budgetRole"], monsterRules.damage?.budgetRole || "mainAttack");
      setRulesField(["damage", "scale"], monsterRules.damage?.scale || "standard");
      return;
    }
    if (blockId === "condition") {
      setRulesField(["condition", "names"], asArray(monsterRules.condition?.names));
      setRulesField(["condition", "severity"], monsterRules.condition?.severity || "moderate");
      return;
    }
    if (blockId === "ongoing") {
      setRulesField(["ongoing", "enabled"], true);
      setRulesField(["ongoing", "timing"], monsterRules.ongoing?.timing || "startOfTargetTurn");
      setRulesField(["ongoing", "damage", "mode"], monsterRules.ongoing?.damage?.mode || "budget");
      setRulesField(["ongoing", "damage", "budgetRole"], monsterRules.ongoing?.damage?.budgetRole || "ongoing");
      return;
    }
    if (blockId === "multiattack") {
      setRulesField(["multiattack", "enabled"], true);
      setRulesField(["multiattack", "mode"], monsterRules.multiattack?.mode || "fixed");
      setRulesField(["multiattack", "count"], monsterRules.multiattack?.count || 2);
      if (!asArray(monsterRules.multiattack?.attacks).length) {
        setRulesField(["multiattack", "attacks"], [{ ref: "primary", label: "Primary", count: monsterRules.multiattack?.count || 2 }]);
      }
      return;
    }
    if (blockId === "spellcasting") {
      setRulesField(["spellcasting", "enabled"], true);
      setRulesField(["spellcasting", "ability"], monsterRules.spellcasting?.ability || "wisdom");
      setRulesField(["spellcasting", "saveDc"], monsterRules.spellcasting?.saveDc || "monster");
      setRulesField(["spellcasting", "attackBonus"], monsterRules.spellcasting?.attackBonus || "monster");
      return;
    }
    if (blockId === "summon") {
      setRulesField(["summon", "enabled"], true);
      setRulesField(["summon", "type"], monsterRules.summon?.type || "summon");
      setRulesField(["summon", "count"], monsterRules.summon?.count || "1");
      setRulesField(["summon", "initiative"], monsterRules.summon?.initiative || "immediatelyAfterSummoner");
      setRulesField(["summon", "control"], monsterRules.summon?.control || "underSummonerControl");
      return;
    }
    if (blockId === "procedure") {
      setRulesField(["procedure", "enabled"], true);
      setRulesField(["procedure", "type"], monsterRules.procedure?.type || "swallow");
      setRulesField(["procedure", "ongoingDamage", "timing"], monsterRules.procedure?.ongoingDamage?.timing || "startOfMonsterTurn");
      setRulesField(["procedure", "ongoingDamage", "damage", "mode"], monsterRules.procedure?.ongoingDamage?.damage?.mode || "none");
      return;
    }
    if (blockId === "defense") {
      setRulesField(["defense", "enabled"], true);
      setRulesField(["defense", "type"], monsterRules.defense?.type || "magicResistance");
      setRulesField(["defense", "timing"], monsterRules.defense?.timing || "passive");
      return;
    }

    if (blockId === "references") {
      if (!asArray(monsterRules.references).length) {
        setRulesField(["references"], [{ type: "action", relationship: "uses", ref: "ability-1", label: "Ability 1" }]);
      }
      return;
    }
    if (blockId === "outputText") {
      setRulesField(outputTextPath, outputTextValue || "");
      return;
    }
    if (blockId === "counterplay") {
      setField(["counterplay"], component.counterplay || "");
      return;
    }
  }

  function removeRulesBlock(blockId) {
    setActiveRulesBlocks((current) => ({ ...current, [blockId]: false }));
    if (blockId === "targeting") {
      setRulesField(["targeting"], null);
      return;
    }
    if (blockId === "areaEffect") {
      setRulesField(["areaEffect"], { enabled: false });
      return;
    }
    if (blockId === "damage") {
      setRulesField(["damage"], { mode: "none", parts: [] });
      return;
    }
    if (blockId === "condition") {
      setRulesField(["condition"], { names: [] });
      return;
    }
    if (blockId === "ongoing") {
      setRulesField(["ongoing"], { enabled: false });
      return;
    }
    if (blockId === "multiattack") {
      setRulesField(["multiattack"], { enabled: false, attacks: [], replacements: [] });
      return;
    }
    if (blockId === "spellcasting") {
      setRulesField(["spellcasting"], { enabled: false, lists: [] });
      return;
    }
    if (blockId === "summon") {
      setRulesField(["summon"], { enabled: false });
      return;
    }
    if (blockId === "procedure") {
      setRulesField(["procedure"], { enabled: false });
      return;
    }
    if (blockId === "defense") {
      setRulesField(["defense"], { enabled: false });
      return;
    }

    if (blockId === "references") {
      setRulesField(["references"], []);
      return;
    }
    if (blockId === "outputText") {
      setRulesField(["text", "hit"], "");
      setRulesField(["text", "miss"], "");
      setRulesField(["text", "hitOrMiss"], "");
      setRulesField(["text", "failure"], "");
      setRulesField(["text", "success"], "");
      setRulesField(["text", "failureOrSuccess"], "");
      setRulesField(["text", "response"], "");
      setRulesField(["text", "effect"], "");
      return;
    }
    if (blockId === "counterplay") {
      setField(["counterplay"], "");
    }
  }

  const explicitMonsterRules = isMonsterGraft ? getExplicitMonsterRules(component) : null;
  const monsterRulesFeature = isMonsterGraft ? buildMonsterRulesFeature(component, explicitMonsterRules) : null;
  const monsterRules = isMonsterGraft ? normalizeMonsterGraftRules(monsterRulesFeature) : {};
  const usesInferredRules = Boolean(isMonsterGraft && !explicitMonsterRules && (component.mechanics || component.tableText));
  const ruleSection = component.monster?.section || monsterRules.section || "trait";
  const actionEconomy = monsterRules.actionEconomy || "passive";
  const usageType = monsterRules.usage?.type || "passive";
  const resolutionType = monsterRules.resolution?.type || "none";
  const hasSecondarySave = monsterRules.secondaryResolution?.type === "savingThrow";
  const resolutionChoice = resolutionType === "attackRoll" && hasSecondarySave ? "attackRollSavingThrow" : resolutionType;
  const targeting = monsterRules.targeting || {};
  const areaEffect = monsterRules.areaEffect || {};
  const areaEffectEnabled = Boolean(areaEffect?.enabled);
  const hasAreaEffectDetails = Boolean(areaEffectEnabled || areaEffect?.type || areaEffect?.shape || areaEffect?.size || areaEffect?.timing || areaEffect?.targets || areaEffect?.text);
  const hasTargetingDetails = Boolean(targeting?.text || targeting?.shape || targeting?.size || targeting?.targets || (targeting?.type && targeting.type !== "self"));
  const multiattackEnabled = Boolean(monsterRules.multiattack?.enabled);
  const multiattackAttacks = asArray(monsterRules.multiattack?.attacks);
  const visibleMultiattackAttacks = multiattackEnabled ? (multiattackAttacks.length ? multiattackAttacks : [{ ref: "primary", label: "Primary", count: monsterRules.multiattack?.count || 2 }]) : [];
  const multiattackReplacements = asArray(monsterRules.multiattack?.replacements);
  const spellcastingEnabled = Boolean(monsterRules.spellcasting?.enabled);
  const spellcastingLists = getSpellcastingListsForEdit();
  const filteredSpellOptions = useMemo(() => {
    const query = spellPickerQuery.trim().toLowerCase();
    return SPELLS_5E24.filter((spell) => {
      if (spellPickerLevel !== "all" && String(spell.level) !== String(spellPickerLevel)) return false;
      if (spellPickerSchool !== "all" && spell.school !== spellPickerSchool) return false;
      if (!query) return true;
      return [spell.name, spell.school, spell.levelLabel, ...(spell.classes || [])].join(" ").toLowerCase().includes(query);
    }).slice(0, 50);
  }, [spellPickerQuery, spellPickerLevel, spellPickerSchool]);
  const damageMode = monsterRules.damage?.mode || "none";
  const damageParts = asArray(monsterRules.damage?.parts);
  const visibleDamageParts = damageMode === "parts" ? (damageParts.length ? damageParts : [{ id: "part-1", mode: "budget", scale: "standard", budgetRole: "mainAttack", types: [] }]) : [];
  const conditionNames = joinList(monsterRules.condition?.names);
  const hasAttackResolution = resolutionType === "attackRoll" || resolutionChoice === "attackRollSavingThrow";
  const hasPrimarySave = resolutionType === "savingThrow";
  const hasAnySaveResolution = hasPrimarySave || hasSecondarySave || resolutionChoice === "attackRollSavingThrow";
  const hasSaveOutcomeText = Boolean(monsterRules.text?.failure || monsterRules.text?.success || monsterRules.text?.failureOrSuccess);
  const hasAttackEventText = Boolean(monsterRules.text?.miss || monsterRules.text?.hitOrMiss);
  const showUsageValue = ["recharge", "limited", "legendary"].includes(usageType) || Boolean(monsterRules.usage?.value);
  const showTrigger = ["reaction", "deathTrigger", "freeTrigger"].includes(actionEconomy) || ["triggered", "death"].includes(usageType) || Boolean(monsterRules.trigger);
  const showSaveOutcome = hasAnySaveResolution || hasSaveOutcomeText;
  const saveFieldRoot = hasPrimarySave ? "resolution" : "secondaryResolution";
  const saveAbilityValue = hasPrimarySave ? monsterRules.resolution?.ability : monsterRules.secondaryResolution?.ability;
  const generatedFailureDefault = !monsterRules.text?.failure && hasAnySaveResolution
    ? [
        monsterRules.damage && monsterRules.damage.mode !== "none" ? "Damage block" : null,
        monsterRules.condition?.names?.length ? "Conditions block" : null,
        monsterRules.ongoing?.enabled ? "Ongoing Effect block" : null,
      ].filter(Boolean).join(" + ")
    : "";
  const generatedSuccessDefault = !monsterRules.text?.success && hasAnySaveResolution
    ? (monsterRules.damage && monsterRules.damage.mode !== "none" ? "Generated default: Half damage only." : "Generated default: No effect.")
    : "";
  const showDamageDetails = damageMode !== "none" || Boolean(monsterRules.damage?.budgetRole && monsterRules.damage.budgetRole !== "none") || Boolean(monsterRules.damage?.budgetShare) || Boolean(monsterRules.damage?.expectedTargets) || Boolean(asArray(monsterRules.damage?.types).length) || damageParts.length;
  const conditionEscapeEnabled = Boolean(monsterRules.condition?.escape?.enabled);
  const conditionRepeatSaveEnabled = Boolean(monsterRules.condition?.repeatSave?.enabled);
  const ongoingEnabled = Boolean(monsterRules.ongoing?.enabled);
  const defenseEnabled = Boolean(monsterRules.defense?.enabled);
  const defenseType = monsterRules.defense?.type || "magicResistance";
  const summonEnabled = Boolean(monsterRules.summon?.enabled);
  const summonType = monsterRules.summon?.type || "summon";
  const procedureEnabled = Boolean(monsterRules.procedure?.enabled);
  const procedureType = monsterRules.procedure?.type || "swallow";
  const procedureOngoingEnabled = Boolean(monsterRules.procedure?.ongoingDamage?.enabled);
  const procedureOngoingDamageMode = monsterRules.procedure?.ongoingDamage?.damage?.mode || "none";
  const showProcedureOngoingDamageDetails = procedureOngoingDamageMode !== "none" || Boolean(monsterRules.procedure?.ongoingDamage?.damage?.budgetRole && monsterRules.procedure.ongoingDamage.damage.budgetRole !== "none") || Boolean(monsterRules.procedure?.ongoingDamage?.damage?.budgetShare) || Boolean(asArray(monsterRules.procedure?.ongoingDamage?.damage?.types).length);
  const showDefenseUses = defenseType === "legendaryResistance" || Boolean(monsterRules.defense?.uses);
  const showDefenseValue = ["regeneration", "parry", "damageReduction"].includes(defenseType) || Boolean(monsterRules.defense?.value);
  const showDefenseDamageTypes = defenseType === "damageReduction" || Boolean(asArray(monsterRules.defense?.damageTypes).length);
  const showDefenseBreakCondition = defenseType === "regeneration" || Boolean(monsterRules.defense?.breakCondition);
  const showConditionDetails = Boolean(
    conditionNames ||
    monsterRules.condition?.duration ||
    monsterRules.condition?.severity ||
    monsterRules.condition?.sizeLimit ||
    conditionEscapeEnabled ||
    conditionRepeatSaveEnabled
  );
  const ongoingDamageMode = monsterRules.ongoing?.damage?.mode || "none";
  const showOngoingDamageDetails = ongoingDamageMode !== "none" || Boolean(monsterRules.ongoing?.damage?.budgetRole && monsterRules.ongoing.damage.budgetRole !== "none") || Boolean(monsterRules.ongoing?.damage?.budgetShare) || Boolean(asArray(monsterRules.ongoing?.damage?.types).length);
  const textSource = monsterRules.text?.source || "generated";
  const outputTextLabel = hasAttackResolution ? "Hit Rider" : actionEconomy === "reaction" ? "Response Text" : ruleSection === "trait" ? "Trait Text" : "Effect Text";
  const outputTextIcon = hasAttackResolution ? "fa-crosshairs" : actionEconomy === "reaction" ? "fa-reply" : "fa-wand-magic-sparkles";
  const outputTextHelp = hasAttackResolution ? "Text generated after Hit: for a structured attack roll. Use this for riders after damage." : actionEconomy === "reaction" ? "Text generated as the reaction response after the trigger." : FIELD_HELP.effectText;
  const outputTextPath = hasAttackResolution ? ["text", "hit"] : actionEconomy === "reaction" ? ["text", "response"] : ["text", "effect"];
  const outputTextValue = hasAttackResolution ? monsterRules.text?.hit : actionEconomy === "reaction" ? monsterRules.text?.response : monsterRules.text?.effect;
  const previewRules = isMonsterGraft ? {
    ...monsterRules,
    migration: {
      ...(monsterRules.migration || {}),
      isStructured: true,
    },
  } : null;
  const generatedRulesPreview = isMonsterGraft ? renderStructuredRulesTemplate({ ...monsterRulesFeature, rules: previewRules }) : "";
  const finalRulesPreview = textSource === "manual" ? monsterRules.text?.manual || "" : generatedRulesPreview;
  const hasTargetingBlock = Boolean(activeRulesBlocks.targeting) || hasTargetingDetails;
  const hasAreaEffectBlock = Boolean(activeRulesBlocks.areaEffect) || hasAreaEffectDetails;
  const hasDamageBlock = Boolean(activeRulesBlocks.damage) || damageMode !== "none" || showDamageDetails;
  const hasConditionBlock = Boolean(activeRulesBlocks.condition) || showConditionDetails;
  const hasOngoingBlock = Boolean(activeRulesBlocks.ongoing) || ongoingEnabled;
  const hasMultiattackBlock = Boolean(activeRulesBlocks.multiattack) || multiattackEnabled;
  const hasSpellcastingBlock = Boolean(activeRulesBlocks.spellcasting) || spellcastingEnabled;
  const hasDefenseBlock = Boolean(activeRulesBlocks.defense) || defenseEnabled;
  const hasReferencesBlock = Boolean(activeRulesBlocks.references) || hasReferenceDetails;
  const hasSummonBlock = Boolean(activeRulesBlocks.summon) || summonEnabled;
  const hasProcedureBlock = Boolean(activeRulesBlocks.procedure) || procedureEnabled;
  const hasOutputTextBlock = Boolean(activeRulesBlocks.outputText) || Boolean(outputTextValue || hasAttackEventText || hasSaveOutcomeText || monsterRules.text?.response || monsterRules.text?.effect);
  const hasCounterplayBlock = Boolean(activeRulesBlocks.counterplay) || Boolean(component.counterplay);
  const addableRulesBlocks = [
    { id: "targeting", label: "Targeting", icon: "fa-crosshairs", active: hasTargetingBlock },
    { id: "areaEffect", label: "Area Timing", icon: "fa-circle-nodes", active: hasAreaEffectBlock },
    { id: "damage", label: "Damage", icon: "fa-burst", active: hasDamageBlock },
    { id: "condition", label: "Condition", icon: "fa-person-rays", active: hasConditionBlock },
    { id: "ongoing", label: "Ongoing Effect", icon: "fa-clock-rotate-left", active: hasOngoingBlock },
    { id: "multiattack", label: "Multiattack", icon: "fa-clone", active: hasMultiattackBlock },
    { id: "spellcasting", label: "Spellcasting", icon: "fa-book-open", active: hasSpellcastingBlock },
    { id: "summon", label: "Summon / Create", icon: "fa-people-pulling", active: hasSummonBlock },
    { id: "procedure", label: "Special Procedure", icon: "fa-diagram-project", active: hasProcedureBlock },
    { id: "defense", label: "Defense", icon: "fa-shield-halved", active: hasDefenseBlock },
    { id: "references", label: "Ability Links", icon: "fa-link", active: hasReferencesBlock },
    { id: "outputText", label: "Output Text", icon: outputTextIcon, active: hasOutputTextBlock },
    { id: "counterplay", label: "Counterplay", icon: "fa-shield-halved", active: hasCounterplayBlock },
  ];
  const visibleAddableRulesBlocks = addableRulesBlocks.filter((block) => !block.active);

  return (
    <div className="studio-component-editor" aria-label="Selected component editor">
      <div className="studio-component-editor__topline">
        <div>
          <span><Icon name={COMPONENT_TYPE_ICONS[component.contentType] || "fa-puzzle-piece"} /> {COMPONENT_TYPE_LABELS[component.contentType] || component.contentType}</span>
          <strong>{component.title}</strong>
        </div>
        <button type="button" onClick={onRemove}><Icon name="fa-trash" /> Remove</button>
      </div>

      <div className="studio-form-grid studio-form-grid--compact">
        <FormRow label="Component Title" icon="fa-heading" hint={FIELD_HELP.componentTitle}>
          <TextInput value={component.title} onChange={(value) => {
            setField(["title"], value);
            setField(["label"], value);
          }} />
        </FormRow>
        <FormRow label="Content Type" icon="fa-shapes" hint={FIELD_HELP.contentType}>
          <select value={component.contentType} onChange={(event) => setField(["contentType"], event.target.value)}>
            <option value="monster-graft">Monster Graft</option>
            <option value="location-component">Location Component</option>
            <option value="location-region">Location Region</option>
          </select>
        </FormRow>
        {!isMonsterGraft ? (
          <FormRow label="Slots" icon="fa-table-cells-large" hint={FIELD_HELP.slots}>
            <TextInput value={joinList(component.slots)} onChange={(value) => setArray(["slots"], value)} />
          </FormRow>
        ) : null}
        <FormRow label="Workflows" icon="fa-route" hint={FIELD_HELP.workflows}>
          <TextInput value={joinList(component.workflows)} onChange={(value) => setArray(["workflows"], value)} />
        </FormRow>
        <FormRow label="Source Anchors" icon="fa-anchor" hint={FIELD_HELP.sourceAnchors}>
          <TextInput value={joinList(component.sourceAnchors)} onChange={(value) => setArray(["sourceAnchors"], value)} />
        </FormRow>
        <FormRow label="Tags" icon="fa-tags" hint={FIELD_HELP.tags}>
          <TextInput value={joinList(component.tags)} onChange={(value) => setArray(["tags"], value)} />
        </FormRow>
      </div>

      <DividerLabel icon="fa-pen-nib" title="Playable Text" help={SECTION_HELP.playableText} />
      <FormRow label="Summary" icon="fa-align-left" hint={FIELD_HELP.componentSummary}>
        <TextArea rows={4} value={component.summary} onChange={(value) => setField(["summary"], value)} />
      </FormRow>
      {!isMonsterGraft ? (
        <>
          <FormRow label="Table Text" icon="fa-dice-d20" hint={FIELD_HELP.tableText}>
            <TextArea rows={4} value={component.tableText} onChange={(value) => setField(["tableText"], value)} />
          </FormRow>
          <FormRow label="Mechanics" icon="fa-gears" hint={FIELD_HELP.mechanics}>
            <TextArea rows={5} value={component.mechanics} onChange={(value) => setField(["mechanics"], value)} />
          </FormRow>
        </>
      ) : null}

      {isMonsterGraft ? (
        <div className="studio-component-editor__subpanel studio-component-editor__subpanel--monster">
          <h4><Icon name="fa-skull" /> Monster Graft Data</h4>

          <RulesGroup icon="fa-id-card" title="Frame" help="Frame fields define where the graft belongs in the Monster Composer, where it prints in the stat block, and how much budget it consumes.">
            <div className="studio-form-grid studio-form-grid--compact">
              <FormRow label="Monster Slot" icon="fa-table-cells-large" hint={FIELD_HELP.monsterSlot}>
                <TextInput value={component.monster?.slot || joinList(component.slots)} onChange={setMonsterSlot} />
              </FormRow>
              <FormRow label="Rules Section" icon="fa-file-lines" hint={FIELD_HELP.rulesSection}>
                <SelectInput options={MONSTER_RULE_SECTION_OPTIONS} value={ruleSection} onChange={(value) => {
                  setField(["monster", "section"], value);
                  setRulesField(["section"], value);
                }} />
              </FormRow>
              <FormRow label="Cost" icon="fa-gauge-high" hint={FIELD_HELP.monsterCost}>
                <input type="number" value={component.monster?.cost ?? 0} onChange={(event) => setField(["monster", "cost"], Number(event.target.value))} />
              </FormRow>
              <FormRow label="Complexity" icon="fa-layer-group" hint={FIELD_HELP.monsterComplexity}>
                <input type="number" value={component.monster?.complexity ?? 0} onChange={(event) => setField(["monster", "complexity"], Number(event.target.value))} />
              </FormRow>
            </div>
          </RulesGroup>

          <DividerLabel icon="fa-scale-balanced" title="Rules" help="Structured rules tell the exporter whether this graft is an attack, saving throw, reaction, recharge power, trait, or other ability." />
          {usesInferredRules ? (
            <div className="studio-inferred-rules-note">
              <Icon name="fa-wand-magic-sparkles" />
              <span>Inferred from legacy Mechanics. Editing any rule field will convert this graft to explicit structured rules.</span>
            </div>
          ) : null}

          <div className="studio-rules-layout">
            <RulesGroup icon="fa-bolt" title="Use" help="Use fields define when the ability exists and how often it can be used.">
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Action Economy" icon="fa-bolt" hint={FIELD_HELP.actionEconomy}>
                  <SelectInput options={MONSTER_ACTION_ECONOMY_OPTIONS} value={actionEconomy} onChange={(value) => setRulesField(["actionEconomy"], value)} />
                </FormRow>
                <FormRow label="Usage" icon="fa-repeat" hint={FIELD_HELP.usageType}>
                  <SelectInput options={MONSTER_USAGE_OPTIONS} value={usageType} onChange={(value) => setRulesField(["usage", "type"], value)} />
                </FormRow>
                {showUsageValue ? (
                  <FormRow label="Usage Value" icon="fa-dice-six" hint={FIELD_HELP.usageValue}>
                    <TextInput value={monsterRules.usage?.value} onChange={(value) => setRulesField(["usage", "value"], value)} placeholder="5-6, 1/Day, 3 uses..." />
                  </FormRow>
                ) : null}
                <FormRow label="Resolution" icon="fa-dice-d20" hint={FIELD_HELP.resolutionType}>
                  <SelectInput options={MONSTER_RESOLUTION_OPTIONS} value={resolutionChoice} onChange={setResolutionChoice} />
                </FormRow>
              </div>
            </RulesGroup>


            <RulesGroup icon="fa-plus" title="Add Rule Block" help="Add only the optional rule blocks this graft actually needs. Blocks already containing data stay visible until removed.">
              {visibleAddableRulesBlocks.length ? (
                <div className="studio-rules-add-menu" aria-label="Add optional monster rule block">
                  {visibleAddableRulesBlocks.map((block) => (
                    <button key={block.id} type="button" onClick={() => addRulesBlock(block.id)}>
                      <Icon name={block.icon} />
                      Add {block.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="studio-rules-add-menu__empty">All optional rule blocks are active.</p>
              )}
            </RulesGroup>

            {hasMultiattackBlock ? (
              <RulesGroup icon="fa-clone" title="Multiattack" help={FIELD_HELP.multiattack} actions={<RemoveRulesBlockButton label="Multiattack" onClick={() => removeRulesBlock("multiattack")} />}>
                <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Multiattack enabled">
                  <button type="button" aria-pressed={!multiattackEnabled} onClick={() => setRulesField(["multiattack", "enabled"], false)}>Off</button>
                  <button type="button" aria-pressed={multiattackEnabled} onClick={() => {
                    setRulesField(["multiattack", "enabled"], true);
                    setRulesField(["multiattack", "mode"], monsterRules.multiattack?.mode || "fixed");
                    setRulesField(["multiattack", "count"], monsterRules.multiattack?.count || 2);
                    if (!asArray(monsterRules.multiattack?.attacks).length) {
                      setRulesField(["multiattack", "attacks"], [{ ref: "primary", label: "Primary", count: monsterRules.multiattack?.count || 2 }]);
                    }
                  }}>On</button>
                </div>
                {multiattackEnabled ? (
                  <>
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Pattern" icon="fa-diagram-project" hint={FIELD_HELP.multiattackMode}>
                        <SelectInput options={MONSTER_MULTIATTACK_MODE_OPTIONS} value={monsterRules.multiattack?.mode || "fixed"} onChange={(value) => setRulesField(["multiattack", "mode"], value)} />
                      </FormRow>
                      <FormRow label="Attack Count" icon="fa-hashtag" hint={FIELD_HELP.multiattackCount}>
                        <input type="number" min="1" step="1" value={monsterRules.multiattack?.count ?? 2} onChange={(event) => setRulesField(["multiattack", "count"], Number(event.target.value))} />
                      </FormRow>
                    </div>
                    <div className="studio-damage-parts studio-multiattack-attacks" aria-label="Multiattack attacks editor">
                      {visibleMultiattackAttacks.map((attack, index) => (
                        <div className="studio-damage-part studio-multiattack-attack" key={attack.ref || index}>
                          <div className="studio-damage-part__head">
                            <strong><Icon name="fa-hand-fist" /> Attack Reference {index + 1}</strong>
                            <IconOnlyRemoveButton label={`Attack Reference ${index + 1}`} onClick={() => removeMultiattackAttack(index)} disabled={!multiattackAttacks.length} />
                          </div>
                          <div className="studio-form-grid studio-form-grid--compact">
                            <FormRow label="Ref" icon="fa-fingerprint" hint="Stable internal id for this referenced attack, such as slam, claw, bite, or primary.">
                              <TextInput value={attack.ref} onChange={(value) => setMultiattackAttackField(index, ["ref"], value)} placeholder={`attack-${index + 1}`} />
                            </FormRow>
                            <FormRow label="Label" icon="fa-tag" hint="Printed attack name used in the generated Multiattack sentence.">
                              <TextInput value={attack.label} onChange={(value) => setMultiattackAttackField(index, ["label"], value)} placeholder="Slam" />
                            </FormRow>
                            <FormRow label="Count" icon="fa-hashtag" hint="How many times this referenced attack is made.">
                              <input type="number" min="1" step="1" value={attack.count ?? 1} onChange={(event) => setMultiattackAttackField(index, ["count"], Number(event.target.value))} />
                            </FormRow>
                            <FormRow label="Template Token" icon="fa-code" hint="Use this token inside the custom Multiattack template.">
                              <input readOnly value={`{attack:${attack.label || attack.ref || `Attack ${index + 1}`}}`} />
                            </FormRow>
                          </div>
                        </div>
                      ))}
                      <button className="studio-inline-action" type="button" onClick={addMultiattackAttack}>
                        <Icon name="fa-plus" /> Add Attack Reference
                      </button>
                    </div>
                    <div className="studio-damage-parts studio-multiattack-replacements" aria-label="Multiattack replacements editor">
                      {multiattackReplacements.map((replacement, index) => (
                        <div className="studio-damage-part studio-multiattack-replacement" key={`${replacement.replace || "replacement"}-${index}`}>
                          <div className="studio-damage-part__head">
                            <strong><Icon name="fa-repeat" /> Replacement {index + 1}</strong>
                            <IconOnlyRemoveButton label={`Replacement ${index + 1}`} onClick={() => removeMultiattackReplacement(index)} />
                          </div>
                          <div className="studio-form-grid studio-form-grid--compact">
                            <FormRow label="Replace" icon="fa-repeat" hint={FIELD_HELP.multiattackReplacement}>
                              <SelectInput options={MONSTER_MULTIATTACK_REPLACEMENT_OPTIONS} value={replacement.replace || "oneAttack"} onChange={(value) => setMultiattackReplacementField(index, ["replace"], value)} />
                            </FormRow>
                            <FormRow label="Ability Label" icon="fa-wand-magic-sparkles" hint="Printed label for the replacing ability, such as Spellcasting, Chilling Gaze, or Web Burst.">
                              <TextInput value={replacement.label || replacement.with} onChange={(value) => {
                                setMultiattackReplacementField(index, ["label"], value);
                                setMultiattackReplacementField(index, ["with"], value);
                              }} placeholder="Spellcasting" />
                            </FormRow>
                          </div>
                        </div>
                      ))}
                      <button className="studio-inline-action" type="button" onClick={addMultiattackReplacement}>
                        <Icon name="fa-plus" /> Add Replacement
                      </button>
                    </div>
                    <FormRow label="Multiattack Template" icon="fa-code" hint={FIELD_HELP.multiattackTemplate}>
                      <TextArea rows={3} value={monsterRules.multiattack?.template} onChange={(value) => setRulesField(["multiattack", "template"], value)} placeholder="The monster makes two {attack:Slam} attacks. It can replace one attack with Spellcasting." />
                    </FormRow>
                  </>
                ) : null}
              </RulesGroup>
            ) : null}

            {hasSpellcastingBlock ? (
              <RulesGroup icon="fa-book-open" title="Spellcasting" help={FIELD_HELP.spellcasting} actions={<RemoveRulesBlockButton label="Spellcasting" onClick={() => removeRulesBlock("spellcasting")} />}>
                <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Spellcasting enabled">
                  <button type="button" aria-pressed={!spellcastingEnabled} onClick={() => setRulesField(["spellcasting", "enabled"], false)}>Off</button>
                  <button type="button" aria-pressed={spellcastingEnabled} onClick={() => {
                    setRulesField(["spellcasting", "enabled"], true);
                    setRulesField(["spellcasting", "ability"], monsterRules.spellcasting?.ability || "wisdom");
                    setRulesField(["spellcasting", "saveDc"], monsterRules.spellcasting?.saveDc || "monster");
                    setRulesField(["spellcasting", "attackBonus"], monsterRules.spellcasting?.attackBonus || "monster");
                  }}>On</button>
                </div>
                {spellcastingEnabled ? (
                  <>
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Spellcasting Ability" icon="fa-hat-wizard" hint={FIELD_HELP.spellcastingAbility}>
                        <SelectInput options={MONSTER_SAVE_OPTIONS} value={monsterRules.spellcasting?.ability || "wisdom"} onChange={(value) => setRulesField(["spellcasting", "ability"], value)} />
                      </FormRow>
                      <FormRow label="Spell Save DC" icon="fa-shield" hint={FIELD_HELP.spellcastingSource}>
                        <SelectInput options={MONSTER_SPELLCASTING_SOURCE_OPTIONS} value={monsterRules.spellcasting?.saveDc || "monster"} onChange={(value) => setRulesField(["spellcasting", "saveDc"], value)} />
                      </FormRow>
                      <FormRow label="Spell Attack Bonus" icon="fa-wand-magic-sparkles" hint={FIELD_HELP.spellcastingSource}>
                        <SelectInput options={MONSTER_SPELLCASTING_SOURCE_OPTIONS} value={monsterRules.spellcasting?.attackBonus || "monster"} onChange={(value) => setRulesField(["spellcasting", "attackBonus"], value)} />
                      </FormRow>
                      <FormRow label="Material Components" icon="fa-gem" hint={FIELD_HELP.spellcastingMaterials}>
                        <select value={monsterRules.spellcasting?.requiresMaterialComponents ? "true" : "false"} onChange={(event) => setRulesField(["spellcasting", "requiresMaterialComponents"], event.target.value === "true")}>
                          <option value="false">Requires no Material components</option>
                          <option value="true">Requires Material components</option>
                        </select>
                      </FormRow>
                    </div>

                    <div className="studio-spell-picker" aria-label="Spell picker">
                      <div className="studio-form-grid studio-form-grid--compact">
                        <FormRow label="Find Spell" icon="fa-magnifying-glass" hint={FIELD_HELP.spellPicker}>
                          <TextInput value={spellPickerQuery} onChange={setSpellPickerQuery} placeholder="Search by name, class, school..." />
                        </FormRow>
                        <FormRow label="Level" icon="fa-signal" hint="Filter the spell database by spell level.">
                          <SelectInput options={[["all", "All Levels"], ...SPELLS_5E24_LEVEL_OPTIONS.map((option) => [String(option.value), option.label])]} value={spellPickerLevel} onChange={setSpellPickerLevel} />
                        </FormRow>
                        <FormRow label="School" icon="fa-graduation-cap" hint="Filter the spell database by school.">
                          <SelectInput options={[["all", "All Schools"], ...SPELLS_5E24_SCHOOL_OPTIONS.map((school) => [school, school])]} value={spellPickerSchool} onChange={setSpellPickerSchool} />
                        </FormRow>
                        <FormRow label="Add To" icon="fa-list" hint="Choose which spellcasting list receives selected spells.">
                          <SelectInput options={MONSTER_SPELLCASTING_LIST_OPTIONS} value={spellPickerListId} onChange={setSpellPickerListId} />
                        </FormRow>
                      </div>
                      <div className="studio-spell-picker__results" aria-label="Filtered spells">
                        {filteredSpellOptions.slice(0, 12).map((spell) => (
                          <button type="button" key={spell.id} onClick={() => addSpellToSpellcastingList(spellPickerListId, spell.id)}>
                            <strong>{spell.name}</strong>
                            <span>{spell.levelLabel} • {spell.school}</span>
                          </button>
                        ))}
                        {!filteredSpellOptions.length ? <div className="studio-empty-state">No spells match these filters.</div> : null}
                      </div>
                    </div>

                    <div className="studio-damage-parts studio-spellcasting-lists" aria-label="Spellcasting lists editor">
                      {spellcastingLists.map((list) => (
                        <div className="studio-damage-part studio-spellcasting-list" key={list.id}>
                          <div className="studio-damage-part__head">
                            <strong><Icon name="fa-scroll" /> {list.label || spellListLabelForUsage(list.usage)}</strong>
                            <span>{asArray(list.spellRefs).length + asArray(list.spells).length} spells</span>
                          </div>
                          <div className="studio-form-grid studio-form-grid--compact">
                            <FormRow label="Label" icon="fa-tag" hint="Printed label for this list, such as At will or 1/day each.">
                              <TextInput value={list.label} onChange={(value) => setSpellcastingListById(list.id, { label: value })} />
                            </FormRow>
                            <FormRow label="Usage" icon="fa-repeat" hint="Internal usage bucket for this spell list.">
                              <SelectInput options={MONSTER_SPELLCASTING_LIST_OPTIONS} value={list.usage || list.id} onChange={(value) => setSpellcastingListById(list.id, { usage: value, label: list.label || spellListLabelForUsage(value) })} />
                            </FormRow>
                          </div>
                          <FormRow label="Spells" icon="fa-wand-magic-sparkles" hint={FIELD_HELP.spellList}>
                            <TextArea rows={3} value={formatSpellListInput(list)} onChange={(value) => setSpellcastingListInput(list.id, value)} placeholder="Detect Magic, Minor Illusion" />
                          </FormRow>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </RulesGroup>
            ) : null}

            {showTrigger ? (
              <RulesGroup icon="fa-code-branch" title="Trigger" help="Trigger fields are only needed for reactions, death triggers, free triggers, or conditional abilities.">
                <FormRow label="Trigger" icon="fa-code-branch" hint={FIELD_HELP.trigger}>
                  <TextArea rows={2} value={monsterRules.trigger} onChange={(value) => setRulesField(["trigger"], value)} />
                </FormRow>
              </RulesGroup>
            ) : null}

            {hasTargetingBlock ? (
              <RulesGroup icon="fa-crosshairs" title="Targeting" help={FIELD_HELP.targetingType} actions={<RemoveRulesBlockButton label="Targeting" onClick={() => removeRulesBlock("targeting")} />}>
                <div className="studio-form-grid studio-form-grid--compact">
                  <FormRow label="Targeting Type" icon="fa-crosshairs" hint={FIELD_HELP.targetingType}>
                    <SelectInput options={MONSTER_TARGETING_TYPE_OPTIONS} value={targeting.type || "area"} onChange={(value) => setRulesField(["targeting", "type"], value)} />
                  </FormRow>
                  {targeting.type === "area" || !targeting.type ? (
                    <>
                      <FormRow label="Shape" icon="fa-draw-polygon" hint={FIELD_HELP.targetingShape}>
                        <SelectInput options={MONSTER_TARGETING_SHAPE_OPTIONS} value={targeting.shape || "radius"} onChange={(value) => setRulesField(["targeting", "shape"], value)} />
                      </FormRow>
                      <FormRow label="Size" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.targetingSize}>
                        <input type="number" min="0" step="5" value={targeting.size ?? ""} onChange={(event) => setRulesField(["targeting", "size"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="5" />
                      </FormRow>
                      <FormRow label="Unit" icon="fa-ruler" hint="Usually ft for 5E stat block targeting.">
                        <TextInput value={targeting.unit || "ft"} onChange={(value) => setRulesField(["targeting", "unit"], value)} placeholder="ft" />
                      </FormRow>
                    </>
                  ) : null}
                  <FormRow label="Targets" icon="fa-users" hint={FIELD_HELP.targetingTargets}>
                    <TextInput value={targeting.targets} onChange={(value) => setRulesField(["targeting", "targets"], value)} placeholder="creatures" />
                  </FormRow>
                </div>
                <FormRow label="Targeting Text" icon="fa-quote-left" hint={FIELD_HELP.targetingText}>
                  <TextArea rows={2} value={targeting.text} onChange={(value) => setRulesField(["targeting", "text"], value)} placeholder="Optional exact targeting phrase." />
                </FormRow>
              </RulesGroup>
            ) : null}

            {hasAreaEffectBlock ? (
              <RulesGroup icon="fa-circle-nodes" title="Area Timing" help={FIELD_HELP.areaEffect} actions={<RemoveRulesBlockButton label="Area Timing" onClick={() => removeRulesBlock("areaEffect")} />}>
                <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Area effect enabled">
                  <button type="button" aria-pressed={!areaEffectEnabled} onClick={() => setRulesField(["areaEffect", "enabled"], false)}>Off</button>
                  <button type="button" aria-pressed={areaEffectEnabled} onClick={() => {
                    setRulesField(["areaEffect", "enabled"], true);
                    setRulesField(["areaEffect", "type"], areaEffect.type || "aura");
                    setRulesField(["areaEffect", "shape"], areaEffect.shape || "emanation");
                    setRulesField(["areaEffect", "unit"], areaEffect.unit || "ft");
                    setRulesField(["areaEffect", "origin"], areaEffect.origin || "self");
                    setRulesField(["areaEffect", "timing"], areaEffect.timing || "passive");
                    setRulesField(["areaEffect", "targets"], areaEffect.targets || "creatures");
                  }}>On</button>
                </div>
                {areaEffectEnabled ? (
                  <>
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Area Type" icon="fa-circle-nodes" hint={FIELD_HELP.areaEffectType}>
                        <SelectInput options={MONSTER_AREA_EFFECT_TYPE_OPTIONS} value={areaEffect.type || "aura"} onChange={(value) => setRulesField(["areaEffect", "type"], value)} />
                      </FormRow>
                      <FormRow label="Shape" icon="fa-draw-polygon" hint={FIELD_HELP.targetingShape}>
                        <SelectInput options={MONSTER_TARGETING_SHAPE_OPTIONS} value={areaEffect.shape || "emanation"} onChange={(value) => setRulesField(["areaEffect", "shape"], value)} />
                      </FormRow>
                      <FormRow label="Size" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.targetingSize}>
                        <input type="number" min="0" step="5" value={areaEffect.size ?? ""} onChange={(event) => setRulesField(["areaEffect", "size"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="10" />
                      </FormRow>
                      <FormRow label="Unit" icon="fa-ruler" hint="Usually ft for 5E stat block area effects.">
                        <TextInput value={areaEffect.unit || "ft"} onChange={(value) => setRulesField(["areaEffect", "unit"], value)} placeholder="ft" />
                      </FormRow>
                      <FormRow label="Origin" icon="fa-location-crosshairs" hint={FIELD_HELP.areaEffectOrigin}>
                        <SelectInput options={MONSTER_AREA_EFFECT_ORIGIN_OPTIONS} value={areaEffect.origin || "self"} onChange={(value) => setRulesField(["areaEffect", "origin"], value)} />
                      </FormRow>
                      <FormRow label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.areaEffectTiming}>
                        <SelectInput options={MONSTER_AREA_EFFECT_TIMING_OPTIONS} value={areaEffect.timing || "passive"} onChange={(value) => setRulesField(["areaEffect", "timing"], value)} />
                      </FormRow>
                      <FormRow label="Targets" icon="fa-users" hint={FIELD_HELP.targetingTargets}>
                        <TextInput value={areaEffect.targets} onChange={(value) => setRulesField(["areaEffect", "targets"], value)} placeholder="creatures" />
                      </FormRow>
                      <FormRow label="Excludes" icon="fa-user-slash" hint={FIELD_HELP.areaEffectExcludes}>
                        <TextInput value={joinList(areaEffect.excludes)} onChange={(value) => setRulesArray(["areaEffect", "excludes"], value)} placeholder="self, allies" />
                      </FormRow>
                    </div>
                    <FormRow label="Area Effect Text" icon="fa-quote-left" hint={FIELD_HELP.areaEffectText}>
                      <TextArea rows={3} value={areaEffect.text} onChange={(value) => setRulesField(["areaEffect", "text"], value)} placeholder="Optional exact area effect text. Supports tokens like {area-size}, {area-shape}, {save-dc}, {damage}." />
                    </FormRow>
                  </>
                ) : null}
              </RulesGroup>
            ) : null}

            {hasAttackResolution ? (
              <RulesGroup icon="fa-hand-fist" title="Attack Roll" help="Attack fields appear only when Resolution is Attack Roll.">
                <div className="studio-form-grid studio-form-grid--compact">
                  <FormRow label="Attack Type" icon="fa-hand-fist" hint={FIELD_HELP.attackType}>
                    <SelectInput options={MONSTER_ATTACK_OPTIONS} value={monsterRules.resolution?.attackType || "melee"} onChange={(value) => setRulesField(["resolution", "attackType"], value)} />
                  </FormRow>
                  <FormRow label="Attack Basis" icon="fa-dumbbell" hint={FIELD_HELP.attackBasis}>
                    <SelectInput options={MONSTER_ATTACK_BASIS_OPTIONS} value={monsterRules.resolution?.abilityBasis || "monster"} onChange={(value) => setRulesField(["resolution", "abilityBasis"], value)} />
                  </FormRow>
                  <FormRow label="Reach" icon="fa-ruler-horizontal" hint="Attack reach printed after the attack bonus, such as 5 ft. or 10 ft.">
                    <TextInput value={monsterRules.resolution?.reach} onChange={(value) => setRulesField(["resolution", "reach"], value)} placeholder="5 ft." />
                  </FormRow>
                  <FormRow label="Range" icon="fa-bullseye" hint="Attack range printed after the attack bonus, such as 30/120 ft. Leave empty for melee-only attacks.">
                    <TextInput value={monsterRules.resolution?.range} onChange={(value) => setRulesField(["resolution", "range"], value)} placeholder="30/120 ft." />
                  </FormRow>
                </div>
              </RulesGroup>
            ) : null}

            {showSaveOutcome ? (
              <RulesGroup icon="fa-shield" title="Save & Outcome" help="Save fields appear only when the ability has a primary saving throw, a secondary save rider, or saved Failure/Success text.">
                <div className="studio-form-grid studio-form-grid--compact">
                  <FormRow label={hasPrimarySave ? "Save Ability" : "Rider Save Ability"} icon="fa-shield" hint={FIELD_HELP.saveAbility}>
                    <SelectInput options={MONSTER_SAVE_OPTIONS} value={saveAbilityValue || "dexterity"} onChange={(value) => {
                      setRulesField([saveFieldRoot, "type"], "savingThrow");
                      setRulesField([saveFieldRoot, "ability"], value);
                      setRulesField([saveFieldRoot, "dc"], hasPrimarySave ? monsterRules.resolution?.dc || "monster" : monsterRules.secondaryResolution?.dc || "monster");
                    }} />
                  </FormRow>
                </div>
                <div className="studio-form-grid">
                  <FormRow label="Failure Text" icon="fa-circle-xmark" hint={FIELD_HELP.failureText}>
                    <TextArea rows={3} value={monsterRules.text?.failure} onChange={(value) => setRulesField(["text", "failure"], value)} />
                    {generatedFailureDefault ? <p className="studio-generated-field-note">Generated default from: {generatedFailureDefault}.</p> : null}
                  </FormRow>
                  <FormRow label="Success Text" icon="fa-circle-check" hint={FIELD_HELP.successText}>
                    <TextArea rows={3} value={monsterRules.text?.success} onChange={(value) => setRulesField(["text", "success"], value)} />
                    {generatedSuccessDefault ? <p className="studio-generated-field-note">{generatedSuccessDefault}</p> : null}
                  </FormRow>
                  <FormRow label="Failure or Success Text" icon="fa-circle-dot" hint={FIELD_HELP.failureOrSuccessText}>
                    <TextArea rows={3} value={monsterRules.text?.failureOrSuccess} onChange={(value) => setRulesField(["text", "failureOrSuccess"], value)} />
                  </FormRow>
                </div>
              </RulesGroup>
            ) : null}

            {hasDamageBlock ? (
              <RulesGroup icon="fa-burst" title="Damage" help="Damage fields define whether the ability deals damage and how that damage consumes the monster DPR budget." actions={<RemoveRulesBlockButton label="Damage" onClick={() => removeRulesBlock("damage")} />}>
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Damage Mode" icon="fa-burst" hint={FIELD_HELP.damageMode}>
                  <SelectInput options={MONSTER_DAMAGE_MODE_OPTIONS} value={damageMode} onChange={(value) => setRulesField(["damage", "mode"], value)} />
                </FormRow>
              </div>

              {damageMode === "parts" ? (
                <div className="studio-damage-parts" aria-label="Damage parts editor">
                  {visibleDamageParts.map((part, index) => (
                    <div className="studio-damage-part" key={part.id || index}>
                      <div className="studio-damage-part__head">
                        <strong><Icon name="fa-droplet" /> Damage Part {index + 1}</strong>
                        <IconOnlyRemoveButton label={`Damage Part ${index + 1}`} onClick={() => removeDamagePart(index)} disabled={!damageParts.length} />
                      </div>
                      <div className="studio-form-grid studio-form-grid--compact">
                        <FormRow label="Part ID" icon="fa-fingerprint" hint="Stable token id used by templates, for example weapon, venom, fire-rider, or necrotic-rider.">
                          <TextInput value={part.id} onChange={(value) => setDamagePartField(index, ["id"], value)} placeholder={`part-${index + 1}`} />
                        </FormRow>
                        <FormRow label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                          <TextInput value={joinList(part.types)} onChange={(value) => setDamagePartField(index, ["types"], splitList(value))} placeholder="bludgeoning, lightning" />
                        </FormRow>
                        <FormRow label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                          <SelectInput options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={part.budgetRole || "secondaryAttack"} onChange={(value) => setDamagePartField(index, ["budgetRole"], value)} />
                        </FormRow>
                        <FormRow label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                          <input type="number" step="0.05" min="0" value={part.budgetShare ?? ""} onChange={(event) => setDamagePartField(index, ["budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.35" />
                        </FormRow>
                        <FormRow label="Damage Scale" icon="fa-chart-simple" hint={FIELD_HELP.damageScale}>
                          <SelectInput options={MONSTER_DAMAGE_SCALE_OPTIONS} value={part.scale || "standard"} onChange={(value) => setDamagePartField(index, ["scale"], value)} />
                        </FormRow>
                        <FormRow label="Template Token" icon="fa-code" hint="Use this token in generated or manual text to place this part's calculated damage.">
                          <input readOnly value={`{damage-part:${part.id || `part-${index + 1}`}}`} />
                        </FormRow>
                      </div>
                    </div>
                  ))}
                  <button className="studio-inline-action" type="button" onClick={addDamagePart}>
                    <Icon name="fa-plus" /> Add Damage Part
                  </button>
                </div>
              ) : showDamageDetails ? (
                <div className="studio-form-grid studio-form-grid--compact">
                  <FormRow label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                    <SelectInput options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={monsterRules.damage?.budgetRole || "none"} onChange={(value) => setRulesField(["damage", "budgetRole"], value)} />
                  </FormRow>
                  <FormRow label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                    <input type="number" step="0.05" min="0" value={monsterRules.damage?.budgetShare ?? ""} onChange={(event) => setRulesField(["damage", "budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.85" />
                  </FormRow>
                  <FormRow label="Damage Scale" icon="fa-chart-simple" hint={FIELD_HELP.damageScale}>
                    <SelectInput options={MONSTER_DAMAGE_SCALE_OPTIONS} value={monsterRules.damage?.scale || "standard"} onChange={(value) => setRulesField(["damage", "scale"], value)} />
                  </FormRow>
                  <FormRow label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                    <TextInput value={joinList(monsterRules.damage?.types)} onChange={(value) => setRulesArray(["damage", "types"], value)} />
                  </FormRow>
                  <FormRow label="Expected Targets" icon="fa-users" hint={FIELD_HELP.damageExpectedTargets}>
                    <input type="number" step="0.25" min="0" value={monsterRules.damage?.expectedTargets ?? ""} onChange={(event) => setRulesField(["damage", "expectedTargets"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="1" />
                  </FormRow>
                  <FormRow label="Round Weight" icon="fa-timeline" hint={FIELD_HELP.damageRoundWeight}>
                    <TextInput value={joinList(monsterRules.damage?.roundWeight)} onChange={(value) => setRulesArray(["damage", "roundWeight"], value)} placeholder="1, 0.35, 0.35" />
                  </FormRow>
                </div>
              ) : null}
              </RulesGroup>
            ) : null}

            {hasConditionBlock ? (
              <RulesGroup icon="fa-person-rays" title="Conditions" help="Condition fields define ongoing, disabling, or special condition-like effects caused by the ability." actions={<RemoveRulesBlockButton label="Conditions" onClick={() => removeRulesBlock("condition")} />}>
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Condition Names" icon="fa-person-rays" hint={FIELD_HELP.conditionNames}>
                  <TextInput value={conditionNames} onChange={(value) => setRulesArray(["condition", "names"], value)} placeholder="grappled, restrained" />
                </FormRow>
                {showConditionDetails ? (
                  <>
                    <FormRow label="Condition Severity" icon="fa-triangle-exclamation" hint={FIELD_HELP.conditionSeverity}>
                      <SelectInput options={MONSTER_CONDITION_SEVERITY_OPTIONS} value={monsterRules.condition?.severity || "moderate"} onChange={(value) => setRulesField(["condition", "severity"], value)} />
                    </FormRow>
                    <FormRow label="Condition Duration" icon="fa-hourglass-half" hint={FIELD_HELP.conditionDuration}>
                      <TextInput value={monsterRules.condition?.duration} onChange={(value) => setRulesField(["condition", "duration"], value)} placeholder="until the grapple ends" />
                    </FormRow>
                    <FormRow label="Size Limit" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.conditionSizeLimit}>
                      <TextInput value={monsterRules.condition?.sizeLimit} onChange={(value) => setRulesField(["condition", "sizeLimit"], value)} placeholder="Large or smaller" />
                    </FormRow>
                  </>
                ) : null}
              </div>
              {showConditionDetails ? (
                <>
                  <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Escape DC enabled">
                    <span>Escape DC</span>
                    <button type="button" aria-pressed={!conditionEscapeEnabled} onClick={() => setRulesField(["condition", "escape", "enabled"], false)}>Off</button>
                    <button type="button" aria-pressed={conditionEscapeEnabled} onClick={() => {
                      setRulesField(["condition", "escape", "enabled"], true);
                      setRulesField(["condition", "escape", "dc"], monsterRules.condition?.escape?.dc || "monster");
                      setRulesField(["condition", "escape", "ability"], monsterRules.condition?.escape?.ability || "strength");
                    }}>On</button>
                  </div>
                  {conditionEscapeEnabled ? (
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Escape Ability" icon="fa-person-running" hint={FIELD_HELP.conditionEscapeAbility}>
                        <SelectInput options={MONSTER_SAVE_OPTIONS} value={monsterRules.condition?.escape?.ability || "strength"} onChange={(value) => setRulesField(["condition", "escape", "ability"], value)} />
                      </FormRow>
                      <FormRow label="Escape DC Source" icon="fa-shield" hint={FIELD_HELP.conditionEscape}>
                        <TextInput value={monsterRules.condition?.escape?.dc || "monster"} onChange={(value) => setRulesField(["condition", "escape", "dc"], value)} placeholder="monster" />
                      </FormRow>
                    </div>
                  ) : null}
                  <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Repeat save enabled">
                    <span>Repeat Save</span>
                    <button type="button" aria-pressed={!conditionRepeatSaveEnabled} onClick={() => setRulesField(["condition", "repeatSave", "enabled"], false)}>Off</button>
                    <button type="button" aria-pressed={conditionRepeatSaveEnabled} onClick={() => {
                      setRulesField(["condition", "repeatSave", "enabled"], true);
                      setRulesField(["condition", "repeatSave", "ability"], monsterRules.condition?.repeatSave?.ability || monsterRules.resolution?.ability || "constitution");
                      setRulesField(["condition", "repeatSave", "timing"], monsterRules.condition?.repeatSave?.timing || "endOfTurn");
                      setRulesField(["condition", "repeatSave", "endsOnSuccess"], monsterRules.condition?.repeatSave?.endsOnSuccess ?? true);
                    }}>On</button>
                  </div>
                  {conditionRepeatSaveEnabled ? (
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Repeat Save Ability" icon="fa-shield" hint={FIELD_HELP.conditionRepeatSave}>
                        <SelectInput options={MONSTER_SAVE_OPTIONS} value={monsterRules.condition?.repeatSave?.ability || "constitution"} onChange={(value) => setRulesField(["condition", "repeatSave", "ability"], value)} />
                      </FormRow>
                      <FormRow label="Repeat Timing" icon="fa-hourglass-half" hint={FIELD_HELP.conditionRepeatTiming}>
                        <SelectInput options={MONSTER_CONDITION_REPEAT_TIMING_OPTIONS} value={monsterRules.condition?.repeatSave?.timing || "endOfTurn"} onChange={(value) => setRulesField(["condition", "repeatSave", "timing"], value)} />
                      </FormRow>
                      <FormRow label="Ends on Success" icon="fa-circle-check" hint="Whether a successful repeat save ends the condition or effect on the target.">
                        <select value={monsterRules.condition?.repeatSave?.endsOnSuccess === false ? "false" : "true"} onChange={(event) => setRulesField(["condition", "repeatSave", "endsOnSuccess"], event.target.value === "true")}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </FormRow>
                    </div>
                  ) : null}
                </>
              ) : null}
              </RulesGroup>
            ) : null}

            {hasOngoingBlock ? (
              <RulesGroup icon="fa-clock-rotate-left" title="Ongoing Effect" help={FIELD_HELP.ongoingEffect} actions={<RemoveRulesBlockButton label="Ongoing" onClick={() => removeRulesBlock("ongoing")} />}>
              <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Ongoing effect enabled">
                <button type="button" aria-pressed={!ongoingEnabled} onClick={() => setRulesField(["ongoing", "enabled"], false)}>Off</button>
                <button type="button" aria-pressed={ongoingEnabled} onClick={() => {
                  setRulesField(["ongoing", "enabled"], true);
                  setRulesField(["ongoing", "timing"], monsterRules.ongoing?.timing || "startOfTargetTurn");
                  setRulesField(["ongoing", "damage", "mode"], monsterRules.ongoing?.damage?.mode || "budget");
                  setRulesField(["ongoing", "damage", "budgetRole"], monsterRules.ongoing?.damage?.budgetRole || "ongoing");
                }}>On</button>
              </div>
              {ongoingEnabled ? (
                <>
                  <div className="studio-form-grid studio-form-grid--compact">
                    <FormRow label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.ongoingTiming}>
                      <SelectInput options={MONSTER_ONGOING_TIMING_OPTIONS} value={monsterRules.ongoing?.timing || "startOfTargetTurn"} onChange={(value) => setRulesField(["ongoing", "timing"], value)} />
                    </FormRow>
                    <FormRow label="End Condition" icon="fa-flag-checkered" hint={FIELD_HELP.ongoingEndCondition}>
                      <TextInput value={monsterRules.ongoing?.endCondition} onChange={(value) => setRulesField(["ongoing", "endCondition"], value)} placeholder="until the grapple ends" />
                    </FormRow>
                    <FormRow label="Ongoing Damage Mode" icon="fa-burst" hint={FIELD_HELP.damageMode}>
                      <SelectInput options={MONSTER_DAMAGE_MODE_OPTIONS.filter(([value]) => value !== "parts")} value={ongoingDamageMode} onChange={(value) => setRulesField(["ongoing", "damage", "mode"], value)} />
                    </FormRow>
                  </div>
                  {showOngoingDamageDetails ? (
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                        <SelectInput options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={monsterRules.ongoing?.damage?.budgetRole || "ongoing"} onChange={(value) => setRulesField(["ongoing", "damage", "budgetRole"], value)} />
                      </FormRow>
                      <FormRow label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                        <input type="number" step="0.05" min="0" value={monsterRules.ongoing?.damage?.budgetShare ?? ""} onChange={(event) => setRulesField(["ongoing", "damage", "budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.2" />
                      </FormRow>
                      <FormRow label="Damage Scale" icon="fa-chart-simple" hint={FIELD_HELP.damageScale}>
                        <SelectInput options={MONSTER_DAMAGE_SCALE_OPTIONS} value={monsterRules.ongoing?.damage?.scale || "minor"} onChange={(value) => setRulesField(["ongoing", "damage", "scale"], value)} />
                      </FormRow>
                      <FormRow label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                        <TextInput value={joinList(monsterRules.ongoing?.damage?.types)} onChange={(value) => setRulesArray(["ongoing", "damage", "types"], value)} placeholder="acid" />
                      </FormRow>
                    </div>
                  ) : null}
                </>
              ) : null}
              </RulesGroup>
            ) : null}

            {hasSummonBlock ? (
              <RulesGroup icon="fa-people-pulling" title="Summon / Create" help={FIELD_HELP.summon} actions={<RemoveRulesBlockButton label="Summon / Create" onClick={() => removeRulesBlock("summon")} />}>
                <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Summon enabled">
                  <button type="button" aria-pressed={!summonEnabled} onClick={() => setRulesField(["summon", "enabled"], false)}>Off</button>
                  <button type="button" aria-pressed={summonEnabled} onClick={() => {
                    setRulesField(["summon", "enabled"], true);
                    setRulesField(["summon", "type"], monsterRules.summon?.type || "summon");
                    setRulesField(["summon", "count"], monsterRules.summon?.count || "1");
                    setRulesField(["summon", "initiative"], monsterRules.summon?.initiative || "immediatelyAfterSummoner");
                    setRulesField(["summon", "control"], monsterRules.summon?.control || "underSummonerControl");
                  }}>On</button>
                </div>
                {summonEnabled ? (
                  <>
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Summon Type" icon="fa-people-pulling" hint={FIELD_HELP.summonType}>
                        <SelectInput options={MONSTER_SUMMON_TYPE_OPTIONS} value={summonType} onChange={(value) => setRulesField(["summon", "type"], value)} />
                      </FormRow>
                      <FormRow label="Creature Name" icon="fa-skull" hint={FIELD_HELP.summonCreature}>
                        <TextInput value={monsterRules.summon?.creatureName} onChange={(value) => setRulesField(["summon", "creatureName"], value)} placeholder="Shadow" />
                      </FormRow>
                      <FormRow label="Creature Ref" icon="fa-link" hint="Optional stable creature id/reference for future monster database lookup.">
                        <TextInput value={monsterRules.summon?.creatureRef} onChange={(value) => setRulesField(["summon", "creatureRef"], value)} placeholder="shadow" />
                      </FormRow>
                      <FormRow label="Count" icon="fa-dice" hint={FIELD_HELP.summonCount}>
                        <TextInput value={monsterRules.summon?.count} onChange={(value) => setRulesField(["summon", "count"], value)} placeholder="1d4" />
                      </FormRow>
                      <FormRow label="Placement" icon="fa-location-dot" hint={FIELD_HELP.summonPlacement}>
                        <TextInput value={monsterRules.summon?.placement} onChange={(value) => setRulesField(["summon", "placement"], value)} placeholder="unoccupied spaces within 30 feet" />
                      </FormRow>
                      <FormRow label="Duration" icon="fa-hourglass-half" hint={FIELD_HELP.summonDuration}>
                        <TextInput value={monsterRules.summon?.duration} onChange={(value) => setRulesField(["summon", "duration"], value)} placeholder="until destroyed" />
                      </FormRow>
                      <FormRow label="Initiative" icon="fa-timeline" hint={FIELD_HELP.summonInitiative}>
                        <SelectInput options={MONSTER_SUMMON_INITIATIVE_OPTIONS} value={monsterRules.summon?.initiative || "immediatelyAfterSummoner"} onChange={(value) => setRulesField(["summon", "initiative"], value)} />
                      </FormRow>
                      <FormRow label="Control" icon="fa-hand" hint={FIELD_HELP.summonControl}>
                        <SelectInput options={MONSTER_SUMMON_CONTROL_OPTIONS} value={monsterRules.summon?.control || "underSummonerControl"} onChange={(value) => setRulesField(["summon", "control"], value)} />
                      </FormRow>
                      <FormRow label="Limit" icon="fa-gauge-high" hint={FIELD_HELP.summonLimit}>
                        <TextInput value={monsterRules.summon?.limit} onChange={(value) => setRulesField(["summon", "limit"], value)} placeholder="1/Day or maximum three at a time" />
                      </FormRow>
                      <FormRow label="Summon Trigger" icon="fa-code-branch" hint="Optional event that causes this summon, if different from the main Trigger block.">
                        <TextInput value={monsterRules.summon?.trigger} onChange={(value) => setRulesField(["summon", "trigger"], value)} placeholder="When a humanoid dies within 30 feet" />
                      </FormRow>
                    </div>
                    <FormRow label="Summon Text" icon="fa-pen-to-square" hint={FIELD_HELP.summonText}>
                      <TextArea rows={3} value={monsterRules.summon?.text} onChange={(value) => setRulesField(["summon", "text"], value)} placeholder="Leave empty to use generated wording. Tokens: {summon-creature}, {summon-placement}, {summon-duration}." />
                    </FormRow>
                  </>
                ) : null}
              </RulesGroup>
            ) : null}

            {hasProcedureBlock ? (
              <RulesGroup icon="fa-diagram-project" title="Special Procedure" help={FIELD_HELP.procedure} actions={<RemoveRulesBlockButton label="Special Procedure" onClick={() => removeRulesBlock("procedure")} />}>
                <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Special procedure enabled">
                  <button type="button" aria-pressed={!procedureEnabled} onClick={() => setRulesField(["procedure", "enabled"], false)}>Off</button>
                  <button type="button" aria-pressed={procedureEnabled} onClick={() => {
                    setRulesField(["procedure", "enabled"], true);
                    setRulesField(["procedure", "type"], monsterRules.procedure?.type || "swallow");
                  }}>On</button>
                </div>
                {procedureEnabled ? (
                  <>
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Procedure Type" icon="fa-diagram-project" hint={FIELD_HELP.procedureType}>
                        <SelectInput options={MONSTER_PROCEDURE_TYPE_OPTIONS} value={procedureType} onChange={(value) => setRulesField(["procedure", "type"], value)} />
                      </FormRow>
                      <FormRow label="Target Limit" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.procedureTargetLimit}>
                        <TextInput value={monsterRules.procedure?.targetLimit} onChange={(value) => setRulesField(["procedure", "targetLimit"], value)} placeholder="Large or smaller" />
                      </FormRow>
                    </div>
                    <div className="studio-form-grid">
                      <FormRow label="Prerequisite" icon="fa-list-check" hint={FIELD_HELP.procedurePrerequisite}>
                        <TextArea rows={2} value={monsterRules.procedure?.prerequisite} onChange={(value) => setRulesField(["procedure", "prerequisite"], value)} placeholder="The target must be Grappled." />
                      </FormRow>
                      <FormRow label="Entry Effect" icon="fa-door-open" hint={FIELD_HELP.procedureEntryEffect}>
                        <TextArea rows={2} value={monsterRules.procedure?.entryEffect} onChange={(value) => setRulesField(["procedure", "entryEffect"], value)} placeholder="The target is swallowed." />
                      </FormRow>
                      <FormRow label="Internal State" icon="fa-circle-nodes" hint={FIELD_HELP.procedureInternalState}>
                        <TextArea rows={2} value={monsterRules.procedure?.internalState} onChange={(value) => setRulesField(["procedure", "internalState"], value)} placeholder="The swallowed target has Total Cover and the Blinded and Restrained conditions." />
                      </FormRow>
                    </div>
                    <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Procedure ongoing damage enabled">
                      <span>Ongoing Damage</span>
                      <button type="button" aria-pressed={!procedureOngoingEnabled} onClick={() => setRulesField(["procedure", "ongoingDamage", "enabled"], false)}>Off</button>
                      <button type="button" aria-pressed={procedureOngoingEnabled} onClick={() => {
                        setRulesField(["procedure", "ongoingDamage", "enabled"], true);
                        setRulesField(["procedure", "ongoingDamage", "timing"], monsterRules.procedure?.ongoingDamage?.timing || "startOfMonsterTurn");
                        setRulesField(["procedure", "ongoingDamage", "damage", "mode"], monsterRules.procedure?.ongoingDamage?.damage?.mode || "budget");
                        setRulesField(["procedure", "ongoingDamage", "damage", "budgetRole"], monsterRules.procedure?.ongoingDamage?.damage?.budgetRole || "ongoing");
                      }}>On</button>
                    </div>
                    {procedureOngoingEnabled ? (
                      <>
                        <div className="studio-form-grid studio-form-grid--compact">
                          <FormRow label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.ongoingTiming}>
                            <SelectInput options={MONSTER_PROCEDURE_TIMING_OPTIONS} value={monsterRules.procedure?.ongoingDamage?.timing || "startOfMonsterTurn"} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "timing"], value)} />
                          </FormRow>
                          <FormRow label="Damage Mode" icon="fa-burst" hint={FIELD_HELP.procedureOngoingDamage}>
                            <SelectInput options={MONSTER_DAMAGE_MODE_OPTIONS.filter(([value]) => value !== "parts")} value={procedureOngoingDamageMode} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "damage", "mode"], value)} />
                          </FormRow>
                          {showProcedureOngoingDamageDetails ? (
                            <>
                              <FormRow label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                                <SelectInput options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={monsterRules.procedure?.ongoingDamage?.damage?.budgetRole || "ongoing"} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "damage", "budgetRole"], value)} />
                              </FormRow>
                              <FormRow label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                                <input type="number" step="0.05" min="0" value={monsterRules.procedure?.ongoingDamage?.damage?.budgetShare ?? ""} onChange={(event) => setRulesField(["procedure", "ongoingDamage", "damage", "budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.25" />
                              </FormRow>
                              <FormRow label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                                <TextInput value={joinList(monsterRules.procedure?.ongoingDamage?.damage?.types)} onChange={(value) => setRulesArray(["procedure", "ongoingDamage", "damage", "types"], value)} placeholder="acid" />
                              </FormRow>
                            </>
                          ) : null}
                        </div>
                        <FormRow label="Ongoing End Condition" icon="fa-hourglass-end" hint={FIELD_HELP.ongoingEndCondition}>
                          <TextInput value={monsterRules.procedure?.ongoingDamage?.endCondition} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "endCondition"], value)} placeholder="until the target escapes" />
                        </FormRow>
                      </>
                    ) : null}
                    <div className="studio-form-grid">
                      <FormRow label="Escape Condition" icon="fa-person-running" hint={FIELD_HELP.procedureEscapeCondition}>
                        <TextArea rows={2} value={monsterRules.procedure?.escapeCondition} onChange={(value) => setRulesField(["procedure", "escapeCondition"], value)} placeholder="If the monster takes 20 damage or more on a single turn from inside it..." />
                      </FormRow>
                      <FormRow label="Release Condition" icon="fa-door-open" hint={FIELD_HELP.procedureReleaseCondition}>
                        <TextArea rows={2} value={monsterRules.procedure?.releaseCondition} onChange={(value) => setRulesField(["procedure", "releaseCondition"], value)} placeholder="If the monster dies, the target is no longer Restrained and can escape." />
                      </FormRow>
                    </div>
                    <FormRow label="Procedure Text" icon="fa-pen-to-square" hint={FIELD_HELP.procedureText}>
                      <TextArea rows={3} value={monsterRules.procedure?.text} onChange={(value) => setRulesField(["procedure", "text"], value)} placeholder="Leave empty to use generated wording. Tokens: {procedure-ongoing-damage}, {procedure-release-condition}." />
                    </FormRow>
                  </>
                ) : null}
              </RulesGroup>
            ) : null}

            {hasDefenseBlock ? (
              <RulesGroup icon="fa-shield-halved" title="Defense" help={FIELD_HELP.defenseFeature} actions={<RemoveRulesBlockButton label="Defense" onClick={() => removeRulesBlock("defense")} />}>
                <div className="studio-text-source-toggle studio-text-source-toggle--compact" role="group" aria-label="Defense feature enabled">
                  <button type="button" aria-pressed={!defenseEnabled} onClick={() => setRulesField(["defense", "enabled"], false)}>Off</button>
                  <button type="button" aria-pressed={defenseEnabled} onClick={() => {
                    setRulesField(["defense", "enabled"], true);
                    setRulesField(["defense", "type"], monsterRules.defense?.type || "magicResistance");
                    setRulesField(["defense", "timing"], monsterRules.defense?.timing || "passive");
                  }}>On</button>
                </div>
                {defenseEnabled ? (
                  <>
                    <div className="studio-form-grid studio-form-grid--compact">
                      <FormRow label="Defense Type" icon="fa-shield-halved" hint={FIELD_HELP.defenseType}>
                        <SelectInput options={MONSTER_DEFENSE_TYPE_OPTIONS} value={defenseType} onChange={(value) => setRulesField(["defense", "type"], value)} />
                      </FormRow>
                      <FormRow label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.defenseTiming}>
                        <SelectInput options={MONSTER_DEFENSE_TIMING_OPTIONS} value={monsterRules.defense?.timing || "passive"} onChange={(value) => setRulesField(["defense", "timing"], value)} />
                      </FormRow>
                      {showDefenseUses ? (
                        <FormRow label="Uses" icon="fa-dice-six" hint={FIELD_HELP.defenseUses}>
                          <input type="number" min="0" step="1" value={monsterRules.defense?.uses ?? ""} onChange={(event) => setRulesField(["defense", "uses"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="3" />
                        </FormRow>
                      ) : null}
                      {showDefenseValue ? (
                        <FormRow label="Value" icon="fa-plus" hint={FIELD_HELP.defenseValue}>
                          <input type="number" min="0" step="1" value={monsterRules.defense?.value ?? ""} onChange={(event) => setRulesField(["defense", "value"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="10" />
                        </FormRow>
                      ) : null}
                      {showDefenseDamageTypes ? (
                        <FormRow label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.defenseDamageTypes}>
                          <TextInput value={joinList(monsterRules.defense?.damageTypes)} onChange={(value) => setRulesArray(["defense", "damageTypes"], value)} placeholder="fire, necrotic" />
                        </FormRow>
                      ) : null}
                      {showDefenseBreakCondition ? (
                        <FormRow label="Break Condition" icon="fa-ban" hint={FIELD_HELP.defenseBreakCondition}>
                          <TextInput value={monsterRules.defense?.breakCondition} onChange={(value) => setRulesField(["defense", "breakCondition"], value)} placeholder="takes Fire damage" />
                        </FormRow>
                      ) : null}
                    </div>
                    <FormRow label="Defense Text" icon="fa-pen-to-square" hint={FIELD_HELP.defenseText}>
                      <TextArea rows={3} value={monsterRules.defense?.text} onChange={(value) => setRulesField(["defense", "text"], value)} placeholder="Leave empty to use standard generated wording." />
                    </FormRow>
                  </>
                ) : null}
              </RulesGroup>
            ) : null}



            {hasReferencesBlock ? (
              <RulesGroup icon="fa-link" title="Ability Links" help={FIELD_HELP.references} actions={<RemoveRulesBlockButton label="Ability Links" onClick={() => removeRulesBlock("references")} />}>
                <div className="studio-damage-parts" aria-label="Ability links editor">
                  {visibleAbilityReferences.map((reference, index) => (
                    <div className="studio-damage-part" key={reference.id || reference.ref || index}>
                      <div className="studio-damage-part__head">
                        <strong><Icon name="fa-link" /> Ability Link {index + 1}</strong>
                        <IconOnlyRemoveButton label={`Ability Link ${index + 1}`} onClick={() => removeAbilityReference(index)} disabled={!abilityReferences.length} />
                      </div>
                      <div className="studio-form-grid studio-form-grid--compact">
                        <FormRow label="Reference Type" icon="fa-diagram-project" hint={FIELD_HELP.referenceType}>
                          <SelectInput options={MONSTER_REFERENCE_TYPE_OPTIONS} value={reference.type || "action"} onChange={(value) => setAbilityReferenceField(index, ["type"], value)} />
                        </FormRow>
                        <FormRow label="Relationship" icon="fa-code-branch" hint={FIELD_HELP.referenceRelationship}>
                          <SelectInput options={MONSTER_REFERENCE_RELATIONSHIP_OPTIONS} value={reference.relationship || "uses"} onChange={(value) => setAbilityReferenceField(index, ["relationship"], value)} />
                        </FormRow>
                        <FormRow label="Reference ID" icon="fa-fingerprint" hint={FIELD_HELP.referenceRef}>
                          <TextInput value={reference.ref} onChange={(value) => setAbilityReferenceField(index, ["ref"], value)} placeholder="bite" />
                        </FormRow>
                        <FormRow label="Label" icon="fa-tag" hint={FIELD_HELP.referenceLabel}>
                          <TextInput value={reference.label} onChange={(value) => setAbilityReferenceField(index, ["label"], value)} placeholder="Bite" />
                        </FormRow>
                        <FormRow label="Count" icon="fa-hashtag" hint={FIELD_HELP.referenceCount}>
                          <TextInput value={reference.count ?? ""} onChange={(value) => setAbilityReferenceField(index, ["count"], value)} placeholder="1, 2, one, any" />
                        </FormRow>
                        <FormRow label="Template Token" icon="fa-code" hint="Use this token in generated or manual text to place this reference sentence.">
                          <input readOnly value={`{reference:${reference.ref || reference.label || `ability-${index + 1}`}}`} />
                        </FormRow>
                      </div>
                      <FormRow label="Custom Reference Text" icon="fa-quote-left" hint={FIELD_HELP.referenceText}>
                        <TextArea rows={2} value={reference.text} onChange={(value) => setAbilityReferenceField(index, ["text"], value)} placeholder="Optional exact sentence for this linked ability." />
                      </FormRow>
                    </div>
                  ))}
                  <button className="studio-inline-action" type="button" onClick={addAbilityReference}>
                    <Icon name="fa-plus" /> Add Ability Link
                  </button>
                </div>
              </RulesGroup>
            ) : null}

            {hasOutputTextBlock ? (
              <RulesGroup icon={outputTextIcon} title="Output Text" help="Output text is the generated rules prose attached to the selected resolution type." actions={<RemoveRulesBlockButton label="Output Text" onClick={() => removeRulesBlock("outputText")} />}>
                <FormRow label={outputTextLabel} icon={outputTextIcon} hint={outputTextHelp}>
                  <TextArea rows={3} value={outputTextValue} onChange={(value) => setRulesField(outputTextPath, value)} />
                </FormRow>
                {hasAttackResolution ? (
                  <div className="studio-form-grid">
                    <FormRow label="Miss Text" icon="fa-circle-xmark" hint={FIELD_HELP.missText}>
                      <TextArea rows={3} value={monsterRules.text?.miss} onChange={(value) => setRulesField(["text", "miss"], value)} />
                    </FormRow>
                    <FormRow label="Hit or Miss Text" icon="fa-circle-dot" hint={FIELD_HELP.hitOrMissText}>
                      <TextArea rows={3} value={monsterRules.text?.hitOrMiss} onChange={(value) => setRulesField(["text", "hitOrMiss"], value)} />
                    </FormRow>
                  </div>
                ) : null}
              </RulesGroup>
            ) : null}
          </div>

          {hasCounterplayBlock ? (
            <RulesGroup icon="fa-shield-halved" title="Counterplay" help="Counterplay explains what players can notice, prevent, avoid, exploit, or clean up." actions={<RemoveRulesBlockButton label="Counterplay" onClick={() => removeRulesBlock("counterplay")} />}>
              <FormRow label="Counterplay" icon="fa-shield-halved" hint={FIELD_HELP.counterplay}>
                <TextArea rows={3} value={component.counterplay} onChange={(value) => setField(["counterplay"], value)} />
              </FormRow>
            </RulesGroup>
          ) : null}

          <DividerLabel icon="fa-scroll" title="Stat Block Text" help="This final text is what the Monster Composer exports for this graft. Generated mode is built from the fields above; Manual Override can still use formula tokens." />
          <RulesGroup icon="fa-scroll" title="Text Source" help="Choose whether this graft exports generated text or a manual override.">
            <div className="studio-text-source-toggle" role="group" aria-label="Stat block text source">
              <button type="button" aria-pressed={textSource !== "manual"} onClick={() => setRulesField(["text", "source"], "generated")}>Generated</button>
              <button type="button" aria-pressed={textSource === "manual"} onClick={() => setRulesField(["text", "source"], "manual")}>Manual Override</button>
            </div>
            {textSource === "manual" ? (
              <FormRow label="Manual Stat Block Text" icon="fa-pen-to-square" hint={FIELD_HELP.manualRulesText}>
                <TextArea rows={5} value={monsterRules.text?.manual} onChange={(value) => setRulesField(["text", "manual"], value)} placeholder="Use tokens like {attack-bonus}, {save-dc}, {damage:standard}, {damage-part:venom}." />
              </FormRow>
            ) : null}
            <FormRow label="Generated Stat Block Preview" icon="fa-eye" hint={FIELD_HELP.generatedRulesPreview}>
              <TextArea className="studio-generated-preview" rows={6} readOnly value={finalRulesPreview || "No generated rules text yet."} />
            </FormRow>
          </RulesGroup>
        </div>
      ) : null}


      {isLocationRegion ? (
        <div className="studio-component-editor__subpanel">
          <h4><Icon name="fa-dungeon" /> Location Region Data</h4>
          <div className="studio-form-grid studio-form-grid--compact">
            <FormRow label="Role" icon="fa-compass" hint={FIELD_HELP.regionRole}>
              <TextInput value={component.locationRegion?.role} onChange={(value) => setField(["locationRegion", "role"], value)} />
            </FormRow>
            <FormRow label="Size" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.regionSize}>
              <TextInput value={component.locationRegion?.size} onChange={(value) => setField(["locationRegion", "size"], value)} />
            </FormRow>
            <FormRow label="Shape" icon="fa-draw-polygon" hint={FIELD_HELP.regionShape}>
              <TextInput value={component.locationRegion?.shape} onChange={(value) => setField(["locationRegion", "shape"], value)} />
            </FormRow>
            <FormRow label="Connectors" icon="fa-code-branch" hint={FIELD_HELP.regionConnectors}>
              <input type="number" value={component.locationRegion?.connectors ?? 0} onChange={(event) => setField(["locationRegion", "connectors"], Number(event.target.value))} />
            </FormRow>
          </div>
        </div>
      ) : null}
    </div>
  );
}
