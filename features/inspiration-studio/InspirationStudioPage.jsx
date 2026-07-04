import { useEffect, useMemo, useState } from "react";
import {
  SPELLS_5E24,
  SHARED_TAXONOMIES,
  SHARED_DARKEN_LOCATION_SLOTS,
  SHARED_MONSTER_SLOTS,
  SPELLS_5E24_LEVEL_OPTIONS,
  SPELLS_5E24_SCHOOL_OPTIONS,
  getSpell5e24Name,
  loadContentPackSummaries,
  loadInspirationModules,
  normalizeSpell5e24Ref,
} from "../../shared/content/content.index.js";

import {
  COMPONENT_TYPE_ICONS,
  COMPONENT_TYPE_LABELS,
  STATUS_OPTIONS,
  asArray,
  buildMonsterRulesFeature,
  buildStudioCompatibilityMatrix,
  clone,
  getExplicitMonsterRules,
  getMonsterConstraintSource,
  getMonsterConstraintSummary,
  getMonsterFrameFitSource,
  getMonsterFrameFitSummary,
  getMonsterGrantSource,
  getMonsterGrantSummary,
  isPlainObject,
  joinList,
  normalizeStatus,
  slugify,
  splitList,
} from "./model/studio-component-normalizers.js";
import {
  EMPTY_DRAFT,
  buildComponentTemplate,
  getModuleComponentGroups,
  normalizeModuleForDraft,
  syncDraftIdentityIds,
} from "./model/studio-draft.js";
import {
  buildContentPackExport,
  buildModuleExport,
  downloadJsonFile,
} from "./model/studio-export.js";
import {
  getEntryIssueState,
  getGroupedValidationIssues,
  getIssueGroupMeta,
  getIssueSummary,
  getIssuesForEntry,
  validateStudioDraft,
} from "./model/studio-validation.js";
import {
  buildPublishReadinessReport,
  getReadinessIconFromSummary,
  getReadinessLabelFromSummary,
  getReadinessStateFromSummary,
} from "./model/studio-readiness.js";
import { getStudioComponentTemplateGroups } from "./model/studio-component-templates.js";
import {
  buildStudioWarningsFromValidation,
  getStudioWarningsForEntry,
} from "./model/studio-warning-model.js";
import { StudioWarningBadge } from "./components/StudioWarningBadge.jsx";
import { StudioWarningList } from "./components/StudioWarningList.jsx";
import { renderStructuredRulesTemplate } from "../monster-composer/model/monster-graft-rules.render.js";
import { ALL_MONSTER_GRAFTS } from "../monster-composer/data/monster-content-pack-feed.js";
import { StudioToolsMenu } from "./components/StudioToolsMenu.jsx";
import { StudioTestsMenu } from "./components/StudioTestsMenu.jsx";
import { GraftLedgerModal } from "./ledger/GraftLedgerModal.jsx";
import { ContentHealthModal } from "./health/ContentHealthModal.jsx";
import { CoverageMatrixModal } from "./coverage/CoverageMatrixModal.jsx";
import { MonsterBatchQaModal } from "./qa/MonsterBatchQaModal.jsx";
import { MonsterPerGraftQaModal } from "./qa/MonsterPerGraftQaModal.jsx";
import { MapBatchQaModal } from "./qa/MapBatchQaModal.jsx";
import {
  STUDIO_TEST_IDS,
  deleteStudioTestPreset,
  readStudioTestPresets,
  saveStudioTestPreset,
} from "./qa/studio-test-presets.js";
import { downloadStudioAuditBundle } from "./reports/studio-audit-bundle.report.js";
import { normalizeMonsterGraftRules } from "../monster-composer/model/monster-graft-rules.schema.js";
import { groupQaIssues, runMonsterQaSuite } from "../monster-composer/qa/monster-qa-suite.js";
import {
  MONSTER_BODY_PLAN_OPTIONS,
  MONSTER_FAMILY_PROFILE_OPTIONS,
  formatAnatomyTerm,
  normalizeMonsterAnatomyConstraints,
  normalizeMonsterAnatomyGrants,
} from "../monster-composer/model/anatomy.js";
import {
  MONSTER_FRAME_FIT_VALUES,
  normalizeMonsterFrameFit,
} from "../monster-composer/model/monster-frame-fit.js";
import {
  ROOM_ARCHETYPE_OPTIONS,
} from "../darken-location/map-generator/map-generator.profile.js";


const STUDIO_SECTIONS = [
  {
    id: "source",
    label: "Source",
    icon: "fa-id-card-clip",
    hint: "Name, pack, status, and source anchor identity.",
  },
  {
    id: "card",
    label: "Card",
    icon: "fa-image",
    hint: "Public summary, disturbing hook, and archive image.",
  },
  {
    id: "taxonomy",
    label: "Taxonomy",
    icon: "fa-tags",
    hint: "Source types, themes, motifs, and horror tags.",
  },
  {
    id: "components",
    label: "Components",
    icon: "fa-diagram-project",
    hint: "Monster grafts, location content, and map regions linked to this source.",
  },
  {
    id: "review",
    label: "Review",
    icon: "fa-shield-halved",
    hint: "Validation, publishing readiness, and JSON export.",
  },
];

const EXPORT_MODE_OPTIONS = [
  {
    id: "contentPack",
    label: "Content Pack",
    icon: "fa-box-open",
    description: "Registry-ready pack with source anchor, public inspiration, linked components, workflows, and slots.",
  },
  {
    id: "module",
    label: "Module Draft",
    icon: "fa-file-code",
    description: "Raw Inspiration Module draft used by the Studio editor.",
  },
];

const VALIDATION_SEVERITY_META = {
  error: { label: "Errors", icon: "fa-circle-xmark" },
  warning: { label: "Warnings", icon: "fa-triangle-exclamation" },
  info: { label: "Info", icon: "fa-circle-info" },
};


const STATUS_TOOLTIP_ITEMS = STATUS_OPTIONS
  .map((option) => `**${option.label}**. ${option.description}`)
  .join("\n");

const TAXONOMY_VALUES_BY_ID = Object.freeze(
  SHARED_TAXONOMIES.reduce((map, taxonomy) => {
    map[taxonomy.id] = asArray(taxonomy.values);
    return map;
  }, {}),
);

const SOURCE_TYPE_OPTIONS = TAXONOMY_VALUES_BY_ID["source-types"] || [];
const HORROR_TAG_OPTIONS = TAXONOMY_VALUES_BY_ID["horror-modes"] || [];

const CANONICAL_MONSTER_SLOT_MAP = new Map(SHARED_MONSTER_SLOTS.map((slot) => [slot.id, slot]));
const CANONICAL_DARKEN_SLOT_MAP = new Map(SHARED_DARKEN_LOCATION_SLOTS.map((slot) => [slot.id, slot]));
const CANONICAL_SLOT_MAP = new Map([
  ...SHARED_MONSTER_SLOTS.map((slot) => [slot.id, slot]),
  ...SHARED_DARKEN_LOCATION_SLOTS.map((slot) => [slot.id, slot]),
]);

const STUDIO_LIBRARY_RAIL_SIZE_KEY = "cruor-studio-library-rail-size";
const STUDIO_RIGHT_RAIL_SIZE_KEY = "cruor-studio-right-rail-size";
const STUDIO_RAIL_MIN_SIZE = 240;
const STUDIO_RAIL_MAX_SIZE = 520;

function clampStudioRailSize(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return STUDIO_RAIL_MIN_SIZE;
  return Math.max(STUDIO_RAIL_MIN_SIZE, Math.min(STUDIO_RAIL_MAX_SIZE, Math.round(numericValue)));
}

function readStoredStudioRailSize(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const storedValue = window.localStorage?.getItem(key);
  return storedValue ? clampStudioRailSize(storedValue) : fallback;
}

function writeStoredStudioRailSize(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem(key, String(clampStudioRailSize(value)));
}

const TAXONOMY_PILL_ICONS = Object.freeze({
  sourceTypes: "fa-folder-tree",
  themes: "fa-moon",
  motifs: "fa-eye",
  horror: "fa-droplet",
});

const LIBRARY_STATUS_FILTERS = [
  ["all", "All"],
  ["published", "Published"],
  ["draft", "Draft"],
  ["archived", "Archived"],
  ["needs-review", "Needs Review"],
];

const MONSTER_RULE_SECTION_OPTIONS = [
  ["trait", "Trait"],
  ["action", "Action"],
  ["bonusAction", "Bonus Action"],
  ["reaction", "Reaction"],
  ["legendaryAction", "Legendary Action"],
  ["lairAction", "Lair Action"],
  ["death", "Death Effect"],
];

const MONSTER_FRAME_FIT_OPTION_LABELS = Object.freeze({
  encounterRoles: {
    minion: "Minion",
    standard: "Standard",
    boss: "Boss",
  },
  tacticalRoles: {
    brute: "Brute",
    skirmisher: "Skirmisher",
    controller: "Controller",
    lurker: "Lurker",
    artillery: "Artillery",
    support: "Support",
  },
  tiers: {
    normal: "Normal",
    elite: "Elite",
    boss: "Boss",
    legendary: "Legendary",
    setpiece: "Setpiece",
  },
  tempo: {
    slow: "Slow",
    standard: "Standard",
    fast: "Fast",
    ambusher: "Ambusher",
    legendary: "Legendary",
  },
  danger: {
    standard: "Standard",
    hard: "Hard",
    horror: "Horror Setpiece",
  },
});

const MONSTER_FRAME_FIT_FIELD_HELP = Object.freeze({
  allowed: "Hard allow list. In Guided Mode, the graft is hidden if the current frame is outside this list.",
  recommended: "Soft recommendation. This improves Navigator and Forge ranking when the current frame matches.",
  forbidden: "Hard deny list. In Guided Mode, the graft is hidden when the current frame matches this value.",
  cr: "Hard min/max gates block invalid CRs. Recommended min/max are soft ranking and QA hints.",
});


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

const MONSTER_TARGETING_ORIGIN_OPTIONS = [
  ["", "Default Fallback"],
  ["self", "Self / Creature"],
  ["target", "Target"],
  ["point", "Point the Monster Can See"],
  ["corpse", "Corpse / Body"],
  ["location", "Location"],
  ["custom", "Custom Text"],
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

const MONSTER_CONDITION_DIRECTION_OPTIONS = [
  ["enemy", "Enemy / Target"],
  ["self", "Self / Monster"],
  ["playerApplied", "Player-Applied"],
  ["weakness", "Weakness / Tell"],
  ["referenceOnly", "Reference Only"],
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
  targetingTargets: "Target noun or phrase printed after the save or effect. Use simple nouns like creatures, enemies, allies, or an already quantified phrase like each creature.",
  targetingOrigin: "Optional area origin metadata. Use this when an area needs a clear source, such as an Emanation originating from the creature, a Sphere centered on a corpse, or a Cube at a point.",
  targetingOriginText: "Optional exact origin phrase. Use only when the origin selector is not precise enough, such as centered on the corpse or originating from the ruptured body.",
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
  conditionDirection: "Who receives or applies the condition in generated text: enemy target, the monster itself, a player-applied weakness, a weakness/tell, or reference-only metadata.",
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
  regionRoomArchetype: "Optional semantic room archetype used by the Map Generator before it falls back to inference.",
  mapInfluencePreferredArchetypes: "Room archetypes this component should make more likely when it is assigned to a room.",
  mapInfluenceForbiddenArchetypes: "Room archetypes this component should block unless a forced archetype explicitly overrides the block.",
  mapInfluenceForce: "When enabled, this component forces the selected influence archetype instead of only recommending it.",
  mapInfluenceWeight: "Relative influence strength used when several components affect the same room.",
  mapInfluenceSource: "Optional source label for debugging why this component influenced the generated map.",
  mapInfluenceNote: "Optional editorial note explaining the intended map behavior.",
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

const COMPONENT_EDITOR_TABS = Object.freeze([
  { id: "overview", label: "Overview", icon: "fa-id-card", hint: "Identity, status, source anchors, tags, and short playable copy." },
  { id: "fit", label: "Generator Fit", icon: "fa-sliders", hint: "Slot, stat-block section, budget, complexity, and frame fit." },
  { id: "anatomy", label: "Anatomy", icon: "fa-dna", hint: "Anatomy grants and hard body/creature compatibility constraints." },
  { id: "rules", label: "Rules", icon: "fa-scale-balanced", hint: "Structured rule blocks used by the stat-block renderer." },
  { id: "output", label: "Output", icon: "fa-scroll", hint: "Counterplay and final generated or manual stat-block text." },
  { id: "qa", label: "QA / Debug", icon: "fa-shield-halved", hint: "Compatibility matrix and raw JSON inspection." },
]);

const BASIC_COMPONENT_EDITOR_TABS = Object.freeze([
  { id: "overview", label: "Overview", icon: "fa-id-card", hint: "Identity, status, source anchors, tags, and generator copy." },
  { id: "output", label: "Output", icon: "fa-scroll", hint: "Playable mechanics and region output fields." },
  { id: "qa", label: "QA / Debug", icon: "fa-shield-halved", hint: "Raw JSON inspection." },
]);

const ROOM_ARCHETYPE_SELECT_OPTIONS = Object.freeze([
  ["", "Auto / Inferred"],
  ...ROOM_ARCHETYPE_OPTIONS.map((option) => [option.id, option.label || option.id]),
]);

const ROOM_ARCHETYPE_SUGGESTIONS = Object.freeze(
  ROOM_ARCHETYPE_OPTIONS.map((option) => option.id),
);

function getComponentEditorTabs(component = {}) {
  if (component.contentType === "monster-graft") return COMPONENT_EDITOR_TABS;
  return BASIC_COMPONENT_EDITOR_TABS;
}

function getComponentEditorTabSummary(component = {}, tabId = "overview") {
  if (tabId === "overview") return "Edit only the high-level identity and readable summary for this component.";
  if (tabId === "fit") return "Control where this graft appears, how costly it is, and which monster frames should prefer or reject it.";
  if (tabId === "anatomy") return "Use hard anatomy gates only when the graft would be incoherent on the wrong body.";
  if (tabId === "rules") return "Expose only the structured rule blocks that this graft actually needs.";
  if (tabId === "output") return "Review the player-facing counterplay and final stat-block text before export.";
  if (tabId === "qa") return "Debug compatibility, validation context, and raw component data without cluttering normal editing.";
  return "";
}

function getStatusClassName(status = "draft") {
  return `is-status-${normalizeStatus(status)}`;
}

function getStatusIconName(status = "draft") {
  if (status === "published") return "fa-circle-check";
  if (status === "archived") return "fa-box-archive";
  return "fa-pen-ruler";
}

function getLibraryStatusFilterIcon(filterId = "all") {
  if (filterId === "published") return "fa-circle-check";
  if (filterId === "draft") return "fa-pen-ruler";
  if (filterId === "archived") return "fa-box-archive";
  if (filterId === "needs-review") return "fa-triangle-exclamation";
  return "fa-layer-group";
}


function normalizeSuggestionValue(value, suggestions = []) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";
  const match = asArray(suggestions).find((item) => item.toLowerCase() === cleanValue.toLowerCase());
  return match || cleanValue;
}

function getModuleTaxonomyTerms(modules = [], field) {
  const values = [];
  asArray(modules).forEach((module) => {
    values.push(...asArray(module.sourceAnchor?.[field]));
    values.push(...asArray(module.inspiration?.[field]));
  });
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function buildTaxonomyOptions(modules = []) {
  return {
    sourceTypes: [...new Set([...SOURCE_TYPE_OPTIONS, ...getModuleTaxonomyTerms(modules, "sourceTypes")])].sort((a, b) => a.localeCompare(b)),
    themes: getModuleTaxonomyTerms(modules, "themes"),
    motifs: getModuleTaxonomyTerms(modules, "motifs"),
    horror: HORROR_TAG_OPTIONS,
  };
}


const ANATOMY_CONSTRAINT_FIELD_LABELS = Object.freeze({
  allowedCreatureTypes: "Allowed Creature Types",
  forbiddenCreatureTypes: "Forbidden Creature Types",
  exclusiveToFamilies: "Exclusive Families",
  allowedFamilies: "Allowed Families",
  forbiddenFamilies: "Forbidden Families",
  allowedBodyPlans: "Allowed Body Plans",
  forbiddenBodyPlans: "Forbidden Body Plans",
  requiredAnatomy: "Required Anatomy",
  requiresAnyAnatomy: "Requires Any Anatomy",
  forbiddenAnatomy: "Forbidden Anatomy",
  requiredTags: "Required Creature Tags",
  requiresAnyTags: "Requires Any Creature Tag",
  forbiddenTags: "Forbidden Creature Tags",
  requiredTokens: "Required Build Tokens",
  requiresAnyTokens: "Requires Any Build Token",
  forbiddenTokens: "Forbidden Build Tokens",
});

const ANATOMY_GRANT_FIELD_LABELS = Object.freeze({
  grantsBodyPlans: "Grants Body Plans",
  grantsAnatomy: "Grants Anatomy",
  grantsTags: "Grants Creature Tags",
  grantsTokens: "Grants Build Tokens",
});

const ANATOMY_GRANT_FIELD_HINTS = Object.freeze({
  grantsBodyPlans: "Optional. Adds a body plan to the current build after this graft is installed; use rarely for major transformations.",
  grantsAnatomy: "Optional. Adds anatomy tags such as web_glands, spinnerets, tendrils, wings, or spectral_body to the build.",
  grantsTags: "Optional. Adds effective creature tags such as web_bearing, spider_infested, wax_mask, or bone_body.",
  grantsTokens: "Optional. Adds build tokens used by other grafts as prerequisites, such as web_maker or egg_carrier.",
});

const ANATOMY_CONSTRAINT_FIELD_HINTS = Object.freeze({
  allowedFamilies: "Hard allowlist. Use this for creature-family exclusive grafts, such as spider-only or skeleton-only features.",
  forbiddenFamilies: "Hard denylist for specific creature families.",
  allowedBodyPlans: "Hard allowlist for body shape, such as humanoid, arachnid, quadruped, incorporeal, or amorphous.",
  forbiddenBodyPlans: "Hard denylist for body shapes that make this graft incoherent.",
  requiredAnatomy: "All listed anatomy tags must exist on the monster, such as hands, fangs, web_glands, bones, or spectral_body.",
  requiresAnyAnatomy: "At least one listed anatomy tag must exist on the monster.",
  forbiddenAnatomy: "The graft is blocked if the monster has any listed anatomy tag.",
  requiredTags: "All listed creature tags must exist on the monster profile, such as corpse, physical, organic, web_bearing, no_flesh.",
  requiresAnyTags: "At least one listed creature tag must exist on the monster profile.",
  forbiddenTags: "The graft is blocked if the monster has any listed creature tag.",
  requiredTokens: "Requires compatibility tokens granted by the current build, useful for mutation chains and prerequisite body grafts.",
  requiresAnyTokens: "Requires at least one compatibility token granted by the current build.",
  forbiddenTokens: "Blocks the graft if the current build has one of these compatibility tokens.",
});


function getFrameFitOptionLabels(dimension) {
  const labels = MONSTER_FRAME_FIT_OPTION_LABELS[dimension] || {};
  return (MONSTER_FRAME_FIT_VALUES[dimension] || []).map((id) => labels[id] || id).join(", ");
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

function TagPillInput({ allowCustom = true, fieldId, icon = "fa-tag", onChange, placeholder = "Add tag…", suggestions = [], value = [] }) {
  const [draftTag, setDraftTag] = useState("");
  const values = asArray(value);
  const normalizedSuggestions = asArray(suggestions);
  const datalistId = `studio-taxonomy-options-${fieldId}`;
  const normalizedDraft = normalizeSuggestionValue(draftTag, normalizedSuggestions);
  const canAdd = Boolean(normalizedDraft) && !values.includes(normalizedDraft) && (allowCustom || normalizedSuggestions.includes(normalizedDraft));

  function commitTag(rawValue = draftTag) {
    const nextValue = normalizeSuggestionValue(rawValue, normalizedSuggestions);
    if (!nextValue) return;
    if (!allowCustom && !normalizedSuggestions.includes(nextValue)) return;
    if (values.includes(nextValue)) {
      setDraftTag("");
      return;
    }
    onChange([...values, nextValue]);
    setDraftTag("");
  }

  function removeTag(tag) {
    onChange(values.filter((item) => item !== tag));
  }

  function handleKeyDown(event) {
    if (["Enter", ","].includes(event.key)) {
      event.preventDefault();
      commitTag();
    }
    if (event.key === "Backspace" && !draftTag && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  const isEmpty = values.length === 0;

  return (
    <div className="studio-tag-input" data-empty={isEmpty ? "true" : "false"} data-restricted={!allowCustom || undefined}>
      <div className="studio-tag-input__pills" aria-label={`${fieldId} tags`}>
        {values.map((tag) => (
          <span className="studio-tag-pill" key={tag}>
            <Icon name={icon} />
            <span>{tag}</span>
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
              <Icon name="fa-xmark" />
            </button>
          </span>
        ))}
        <input
          list={datalistId}
          value={draftTag}
          onBlur={() => commitTag()}
          onChange={(event) => setDraftTag(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={values.length ? "" : placeholder}
        />
      </div>
      <datalist id={datalistId}>
        {normalizedSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      {!allowCustom && draftTag && !canAdd ? (
        <small className="studio-tag-input__hint">Choose one of the allowed taxonomy values.</small>
      ) : null}
    </div>
  );
}

function KeywordPillInput({ allowCustom = true, fieldId, icon = "fa-circle-check", onChange, placeholder, suggestions = [], value = [] }) {
  return (
    <TagPillInput
      allowCustom={allowCustom}
      fieldId={fieldId}
      icon={icon}
      onChange={onChange}
      placeholder={placeholder}
      suggestions={suggestions}
      value={asArray(value)}
    />
  );
}

function MarkdownToolbar({ onApply }) {
  const tools = [
    ["fa-bold", "Bold", "**text**"],
    ["fa-italic", "Italic", "_text_"],
    ["fa-underline", "Underline", "<u>text</u>"],
    ["fa-list-ul", "Bullet List", "\n- item"],
    ["fa-list-ol", "Numbered List", "\n1. item"],
    ["fa-heading", "Heading", "\n## Heading"],
  ];

  return (
    <div className="studio-markdown-toolbar" aria-label="Markdown formatting toolbar">
      {tools.map(([icon, label, token]) => (
        <button key={label} type="button" title={label} aria-label={label} onClick={() => onApply(token)}>
          <Icon name={icon} />
        </button>
      ))}
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

function EditableTextBox({ value, placeholder = "No text set.", rows = 4, onChange, onApplyToken = null }) {
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = value || "";
  const isMultiline = rows > 1;

  if (!isEditing) {
    return (
      <div className="studio-editable-textbox">
        <div className={`studio-editable-textbox__preview ${displayValue ? "" : "is-placeholder"}`.trim()}>
          {displayValue || placeholder}
        </div>
        <button type="button" className="studio-inline-action studio-inline-action--compact" onClick={() => setIsEditing(true)}>
          <Icon name="fa-pen" /> Edit
        </button>
      </div>
    );
  }

  return (
    <div className="studio-editable-textbox is-editing">
      {onApplyToken ? <MarkdownToolbar onApply={onApplyToken} /> : null}
      {isMultiline ? (
        <TextArea rows={rows} value={displayValue} onChange={onChange} />
      ) : (
        <TextInput value={displayValue} onChange={onChange} />
      )}
      <div className="studio-editable-textbox__actions">
        <button type="button" className="studio-inline-action studio-inline-action--compact" onClick={() => setIsEditing(false)}>
          <Icon name="fa-check" /> Done
        </button>
      </div>
    </div>
  );
}

function StudioTabButton({ icon, isActive, label, count, hint, onClick }) {
  const tooltip = hint ? `${label}: ${hint}` : label;

  return (
    <button
      className={`studio-tab-button ${isActive ? "is-active" : ""}`.trim()}
      type="button"
      aria-label={tooltip}
      aria-pressed={isActive}
      title={tooltip}
      onClick={onClick}
    >
      <span className="studio-tab-button__label">
        <Icon name={icon} />
        <span>{label}</span>
        {typeof count === "number" ? <strong>{count}</strong> : null}
      </span>
    </button>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <span className="studio-stat-pill">
      <Icon name={icon} />
      <em>{label}</em>
      <strong>{value}</strong>
    </span>
  );
}

function getSectionCount(sectionId, draft, componentGroups, validationReport) {
  if (sectionId === "components") return asArray(draft.components).length;
  if (sectionId === "review") {
    const summary = validationReport?.summary || getIssueSummary(validationReport?.issues);
    return (summary.error || 0) + (summary.warning || 0);
  }
  return undefined;
}

function StudioRightRail({ collapsed = false, componentGroups, draft, imageSource, onDownloadReadinessReport, onResizeStart, onToggleCollapsed, packTitle, validationReport }) {
  const issues = asArray(validationReport?.issues);
  const summary = validationReport?.summary || getIssueSummary(issues);
  const groupedIssues = getGroupedValidationIssues(issues, { includeInfo: false }).slice(0, 4);
  const readinessState = getReadinessStateFromSummary(summary);
  const readinessLabel = getReadinessLabelFromSummary(summary);
  const readinessIcon = getReadinessIconFromSummary(summary);
  const graftCount = componentGroups["monster-graft"].length;
  const locationCount = componentGroups["location-component"].length;
  const regionCount = componentGroups["location-region"].length;
  const linkedTotal = graftCount + locationCount + regionCount;
  const sourceType = draft.sourceAnchor.sourceTypes?.[0] || "Source Anchor";

  if (collapsed) {
    return (
      <aside
        className="studio-right-rail is-collapsed"
        aria-label={`Collapsed inspiration preview and readiness. Publish Readiness: ${readinessLabel}`}
        role="button"
        tabIndex={0}
        onClick={onToggleCollapsed}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggleCollapsed();
          }
        }}
      >
        <div
          className={`studio-rail-collapsed-recap studio-rail-collapsed-recap--${readinessState}`}
          aria-hidden="true"
          title={`Publish Readiness: ${readinessLabel}`}
        >
          <Icon name={readinessIcon} />
          <span>{(summary.error || 0) + (summary.warning || 0)}</span>
        </div>
        <span className="studio-collapsed-rail-label" aria-hidden="true">Inspiration Preview</span>
      </aside>
    );
  }

  return (
    <aside className="studio-right-rail" aria-label="Inspiration preview and readiness">
      <div className="studio-right-rail__topline">
        <span><Icon name="fa-eye" /> Preview Rail</span>
        <button
          className="studio-right-rail__collapse"
          type="button"
          aria-label="Collapse preview and publish readiness"
          title="Collapse preview and publish readiness"
          aria-pressed="false"
          onClick={onToggleCollapsed}
        >
          <Icon name="fa-chevron-right" />
        </button>
      </div>

      <section className="studio-rail-card studio-rail-card--preview">
        <span className="studio-rail-card__eyebrow"><Icon name="fa-book-skull" /> Public Preview</span>
        <div className="studio-card-preview studio-card-preview--rail" aria-label="Public 4:5 inspiration card preview">
          {imageSource ? (
            <img src={imageSource} alt={draft.inspiration.media?.alt || `${draft.title} preview`} title={draft.inspiration.media?.title || undefined} />
          ) : (
            <div className="studio-card-preview__empty">
              <Icon name="fa-image" />
              <span>No Image Preview</span>
            </div>
          )}
          <div className="studio-card-preview__caption">
            <strong>{draft.title}</strong>
            <em>{sourceType}</em>
          </div>
        </div>
        <p>{draft.inspiration.summary || draft.sourceAnchor.summary || "No public summary yet."}</p>
      </section>

      <section className="studio-rail-card studio-rail-card--status" data-readiness-state={readinessState}>
        <span className="studio-rail-card__eyebrow"><Icon name="fa-shield-halved" /> Publish Readiness</span>
        <div className="studio-rail-readiness-line">
          <Icon name={readinessIcon} />
          <strong>{readinessLabel}</strong>
          <span>{summary.error || 0} errors · {summary.warning || 0} warnings</span>
        </div>
        <button className="studio-rail-download-report" type="button" onClick={onDownloadReadinessReport}>
          <Icon name="fa-file-arrow-down" /> Download Readiness JSON
        </button>
        {groupedIssues.length ? (
          <div className="studio-rail-issues studio-rail-issues--grouped">
            {groupedIssues.map((group) => {
              const meta = VALIDATION_SEVERITY_META[group.severity] || VALIDATION_SEVERITY_META.warning;
              return (
                <span className={`studio-rail-issue-group studio-rail-issue-group--${group.severity}`} key={group.key}>
                  <em><Icon name={meta.icon} /> {group.count > 1 ? `${group.count}×` : meta.label}</em>
                  <strong>{group.message}</strong>
                  <small>{getIssueGroupMeta(group)}</small>
                </span>
              );
            })}
          </div>
        ) : (
          <p>No blocking issues detected.</p>
        )}
      </section>

      <section className="studio-rail-card studio-rail-card--counts">
        <span className="studio-rail-card__eyebrow"><Icon name="fa-diagram-project" /> Linked Content</span>
        <div className="studio-rail-content-line">
          <strong>{linkedTotal}</strong>
          <span>{graftCount} grafts · {locationCount} locations · {regionCount} regions</span>
        </div>
        <small>{packTitle}</small>
      </section>
      <button
        type="button"
        className="studio-sidebar-resize-handle studio-sidebar-resize-handle--right"
        aria-label="Resize preview rail"
        title="Resize preview rail"
        onMouseDown={onResizeStart}
      />
    </aside>
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

function DividerLabel({ icon, title, help, zone = null }) {
  return (
    <div className="studio-divider-label" data-editor-zone={zone || undefined}>
      <span className="studio-divider-label__title">
        {icon ? <Icon name={icon} /> : null}
        {title}
      </span>
      <HelpTooltip title={title} text={help} />
    </div>
  );
}

function RulesGroup({ actions = null, icon, title, help, children, zone = null, defaultOpen = false }) {
  return (
    <details
      className="studio-rules-group studio-rules-group--collapsible"
      data-editor-zone={zone || undefined}
      defaultOpen={defaultOpen}
    >
      <summary className="studio-collapsible-group__heading">
        <span className="studio-rules-group__title">
          {icon ? <Icon name={icon} /> : null}
          {title}
        </span>
        <span className="studio-rules-group__tools">
          <HelpTooltip title={title} text={help} />
          {actions}
          <Icon name="fa-chevron-down" />
        </span>
      </summary>
      <div className="studio-rules-group__body">{children}</div>
    </details>
  );
}

function ArmedDeleteButton({ onConfirm }) {
  const [armedAt, setArmedAt] = useState(0);
  const isArmed = Boolean(armedAt);

  function handleClick() {
    const now = Date.now();
    if (!isArmed) {
      setArmedAt(now);
      window.setTimeout(() => setArmedAt((current) => current === now ? 0 : current), 5000);
      return;
    }
    if (now - armedAt < 800) return;
    setArmedAt(0);
    onConfirm?.();
  }

  return (
    <button
      className={`studio-inline-action studio-inline-action--danger ${isArmed ? "is-armed" : ""}`.trim()}
      type="button"
      onClick={handleClick}
      aria-live="polite"
    >
      <Icon name={isArmed ? "fa-triangle-exclamation" : "fa-trash"} />
      {isArmed ? "Confirm Delete?" : "Remove Component"}
    </button>
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
  const [activeSection, setActiveSection] = useState("source");
  const [componentMode, setComponentMode] = useState("monsters");
  const [locationFilter, setLocationFilter] = useState("all");
  const [componentSearch, setComponentSearch] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [exportMode, setExportMode] = useState("contentPack");
  const [libraryCollapsed, setLibraryCollapsed] = useState(true);
  const [rightRailCollapsed, setRightRailCollapsed] = useState(true);
  const [libraryColumnSize, setLibraryColumnSize] = useState(() => readStoredStudioRailSize(STUDIO_LIBRARY_RAIL_SIZE_KEY, 280));
  const [rightColumnSize, setRightColumnSize] = useState(() => readStoredStudioRailSize(STUDIO_RIGHT_RAIL_SIZE_KEY, 320));
  const [isGraftLedgerOpen, setGraftLedgerOpen] = useState(false);
  const [isContentHealthOpen, setContentHealthOpen] = useState(false);
  const [isCoverageMatrixOpen, setCoverageMatrixOpen] = useState(false);
  const [isMonsterBatchQaOpen, setMonsterBatchQaOpen] = useState(false);
  const [isMonsterPerGraftQaOpen, setMonsterPerGraftQaOpen] = useState(false);
  const [isMapBatchQaOpen, setMapBatchQaOpen] = useState(false);
  const [testPresets, setTestPresets] = useState(() => readStudioTestPresets());
  const [pendingTestPresetRun, setPendingTestPresetRun] = useState(null);
  const [identityIdsUnlocked, setIdentityIdsUnlocked] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryStatusFilter, setLibraryStatusFilter] = useState("all");

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
  const moduleExportObject = useMemo(() => buildModuleExport(draft, imagePreviewUrl), [draft, imagePreviewUrl]);
  const contentPackExportObject = useMemo(() => buildContentPackExport(draft, imagePreviewUrl), [draft, imagePreviewUrl]);
  const validationReport = useMemo(() => validateStudioDraft(draft, contentPackExportObject), [draft, contentPackExportObject]);
  const studioWarnings = useMemo(() => buildStudioWarningsFromValidation(validationReport, draft), [validationReport, draft]);
  const monsterQaReport = useMemo(() => runMonsterQaSuite({ mode: "admin-studio" }), []);
  const moduleExportJson = useMemo(() => JSON.stringify(moduleExportObject, null, 2), [moduleExportObject]);
  const contentPackExportJson = useMemo(() => JSON.stringify(contentPackExportObject, null, 2), [contentPackExportObject]);
  const exportJson = exportMode === "module" ? moduleExportJson : contentPackExportJson;
  const readinessReportObject = useMemo(
    () => buildPublishReadinessReport(draft, validationReport, contentPackExportObject, moduleExportObject),
    [contentPackExportObject, draft, moduleExportObject, validationReport],
  );
  const libraryReviewMap = useMemo(() => {
    const map = new Map();
    modules.forEach((module) => {
      const packExport = buildContentPackExport(module, "");
      const report = validateStudioDraft(module, packExport);
      map.set(module.id, report);
    });
    return map;
  }, [modules]);
  const visibleModules = useMemo(() => modules.filter((module) => {
    const haystack = [module.title, module.id, module.packId, module.status].join(" ").toLowerCase();
    const matchesSearch = !librarySearch || haystack.includes(librarySearch.toLowerCase());
    const report = libraryReviewMap.get(module.id);
    const summary = report?.summary || getIssueSummary(report?.issues);
    const needsReview = Boolean(summary.error || summary.warning);
    const matchesStatus = libraryStatusFilter === "all"
      || (libraryStatusFilter === "needs-review" ? needsReview : normalizeStatus(module.status) === libraryStatusFilter);
    return matchesSearch && matchesStatus;
  }), [libraryReviewMap, librarySearch, libraryStatusFilter, modules]);

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
      nextDraft.title = value;
      nextDraft.sourceAnchor.label = value;
      nextDraft.inspiration.title = value;
      nextDraft.inspiration.label = value;
      if (!identityIdsUnlocked) {
        syncDraftIdentityIds(nextDraft, value);
      } else if (!nextDraft.id || nextDraft.id === selectedModuleId) {
        nextDraft.id = nextDraft.sourceAnchor.id || slugify(value);
      }
    });
  }

  function relockIdentityIds() {
    updateDraft((nextDraft) => syncDraftIdentityIds(nextDraft));
    setIdentityIdsUnlocked(false);
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

  function addComponent(templateId) {
    const component = buildComponentTemplate(templateId, draft);
    const contentType = component.contentType;
    setActiveSection("components");
    setComponentMode(contentType === "monster-graft" ? "monsters" : "locations");
    setLocationFilter(contentType === "location-region" ? "location-region" : contentType === "location-component" ? "location-component" : "all");
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

  function downloadReadinessReport() {
    downloadJsonFile(`${slugify(draft.title)}-publish-readiness-report.json`, readinessReportObject);
  }

  function downloadAuditBundle() {
    downloadStudioAuditBundle({
      draft,
      imagePreviewUrl,
      modules,
      libraryGrafts: ALL_MONSTER_GRAFTS,
    });
  }

  function beginRailResize(side, event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startSize = side === "library" ? libraryColumnSize : rightColumnSize;

    function handlePointerMove(moveEvent) {
      const delta = moveEvent.clientX - startX;
      const nextSize = side === "library"
        ? clampStudioRailSize(startSize + delta)
        : clampStudioRailSize(startSize - delta);

      if (side === "library") {
        setLibraryColumnSize(nextSize);
        writeStoredStudioRailSize(STUDIO_LIBRARY_RAIL_SIZE_KEY, nextSize);
      } else {
        setRightColumnSize(nextSize);
        writeStoredStudioRailSize(STUDIO_RIGHT_RAIL_SIZE_KEY, nextSize);
      }
    }

    function handlePointerUp() {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", handlePointerUp);
      document.body.classList.remove("is-resizing-studio-rail");
    }

    document.body.classList.add("is-resizing-studio-rail");
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
  }

  const packTitle = packSummaries.find((pack) => pack.id === draft.packId)?.title || draft.packId;
  const imageSource = imagePreviewUrl || draft.inspiration?.media?.imageUrl || "";

  function handleSaveTestPreset(presetDefinition) {
    const savedPreset = saveStudioTestPreset(presetDefinition);
    setTestPresets(readStudioTestPresets());
    return savedPreset;
  }

  function handleDeleteTestPreset(presetId) {
    deleteStudioTestPreset(presetId);
    setTestPresets(readStudioTestPresets());
  }

  function handleRunTestPreset(preset) {
    if (!preset?.testId) return;
    setPendingTestPresetRun({ ...preset, runToken: `${preset.id}:${Date.now()}` });

    if (preset.testId === STUDIO_TEST_IDS.monsterBatch) {
      setMonsterBatchQaOpen(true);
      return;
    }

    if (preset.testId === STUDIO_TEST_IDS.mapBatch) {
      setMapBatchQaOpen(true);
      return;
    }

    if (preset.testId === STUDIO_TEST_IDS.monsterPerGraft) {
      setMonsterPerGraftQaOpen(true);
    }
  }

  function handlePresetRunConsumed() {
    setPendingTestPresetRun(null);
  }

  return (
    <section className="inspiration-studio" aria-label="Inspiration Studio" data-studio-ready="true">
      <header className="inspiration-studio__header inspiration-studio__header--compact inspiration-studio__header--editing">
        <div className="inspiration-studio__headline">
          <span className="inspiration-studio__eyebrow">
            <Icon name="fa-screwdriver-wrench" /> Admin Content Studio
          </span>
          <h1>Editing: {draft.title}</h1>
        </div>
        <div className="inspiration-studio__quick-meta inspiration-studio__quick-meta--header" aria-label="Current module status and studio tools">
          <span><Icon name="fa-box-open" /> {packTitle}</span>
          <span><Icon name="fa-circle-check" /> {draft.status || "draft"}</span>
          <span><Icon name="fa-diagram-project" /> {asArray(draft.components).length} components</span>
          <StudioToolsMenu
            coverageOpen={isCoverageMatrixOpen}
            graftCount={ALL_MONSTER_GRAFTS.length + monsterComponents.length}
            healthOpen={isContentHealthOpen}
            isGraftLedgerOpen={isGraftLedgerOpen}
            onDownloadAuditBundle={downloadAuditBundle}
            onOpenContentHealth={() => setContentHealthOpen(true)}
            onOpenCoverageMatrix={() => setCoverageMatrixOpen(true)}
            onOpenGraftLedger={() => setGraftLedgerOpen(true)}
          />
          <StudioTestsMenu
            batchQaOpen={isMonsterBatchQaOpen}
            perGraftQaOpen={isMonsterPerGraftQaOpen}
            mapBatchQaOpen={isMapBatchQaOpen}
            presets={testPresets}
            onOpenMonsterBatchQa={() => setMonsterBatchQaOpen(true)}
            onOpenMonsterPerGraftQa={() => setMonsterPerGraftQaOpen(true)}
            onOpenMapBatchQa={() => setMapBatchQaOpen(true)}
            onRunPreset={handleRunTestPreset}
            onDeletePreset={handleDeleteTestPreset}
          />
        </div>
      </header>

      <div
        className={[
          "inspiration-studio__layout",
          libraryCollapsed ? "is-library-collapsed" : "",
          rightRailCollapsed ? "is-right-rail-collapsed" : "",
        ].filter(Boolean).join(" ")}
        style={{
          "--studio-expanded-library-column": `${libraryColumnSize}px`,
          "--studio-expanded-right-column": `${rightColumnSize}px`,
        }}
      >
        <aside
          className={`studio-library-panel ${libraryCollapsed ? "is-collapsed" : ""}`.trim()}
          aria-label="Inspiration library"
          aria-expanded={!libraryCollapsed}
          role={libraryCollapsed ? "button" : undefined}
          tabIndex={libraryCollapsed ? 0 : undefined}
          onClick={libraryCollapsed ? () => setLibraryCollapsed(false) : undefined}
          onKeyDown={libraryCollapsed ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setLibraryCollapsed(false);
            }
          } : undefined}
        >
          <div className="studio-library-panel__topline">
            <span className="studio-library-panel__title">
              <Icon name="fa-book-open" />
              <span>Inspiration Library</span>
            </span>
            {!libraryCollapsed ? (
              <button
                className="studio-library-panel__collapse"
                type="button"
                aria-label="Collapse inspiration library"
                title="Collapse inspiration library"
                aria-pressed="false"
                onClick={() => setLibraryCollapsed(true)}
              >
                <Icon name="fa-chevron-left" />
              </button>
            ) : null}
          </div>

          {!libraryCollapsed ? (
            <>
              <div className="studio-library-controls" aria-label="Library filters">
                <label className="studio-search-field studio-search-field--library">
                  <Icon name="fa-magnifying-glass" />
                  <input value={librarySearch} onChange={(event) => setLibrarySearch(event.target.value)} placeholder="Search inspirations…" />
                </label>
                <div className="studio-library-filter-row" role="tablist" aria-label="Library status filters">
                  {LIBRARY_STATUS_FILTERS.map(([filterId, label]) => (
                    <button
                      key={filterId}
                      type="button"
                      aria-label={label}
                      aria-selected={libraryStatusFilter === filterId}
                      title={label}
                      onClick={() => setLibraryStatusFilter(filterId)}
                    >
                      <Icon name={getLibraryStatusFilterIcon(filterId)} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="studio-library-list" role="list" aria-label="Available inspirations">
                {visibleModules.map((module) => {
                  const report = libraryReviewMap.get(module.id);
                  const summary = report?.summary || getIssueSummary(report?.issues);
                  const issueState = getReadinessStateFromSummary(summary);
                  const status = normalizeStatus(module.status);
                  const hasReviewIssue = issueState !== "clean";

                  return (
                    <button
                      key={module.id}
                      className={[
                        module.id === selectedModuleId ? "is-active" : "",
                        getStatusClassName(status),
                        hasReviewIssue ? `has-review-${issueState}` : "",
                      ].filter(Boolean).join(" ")}
                      type="button"
                      onClick={() => selectModule(module.id)}
                    >
                      <span className="studio-list-button__topline">
                        <strong>{module.title}</strong>
                        <em aria-label={`${getReadinessLabelFromSummary(summary)} readiness`}>
                          <Icon name={hasReviewIssue ? getReadinessIconFromSummary(summary) : getStatusIconName(status)} />
                        </em>
                      </span>
                      <span>{module.packId || "core-cruor"} · {status}</span>
                    </button>
                  );
                })}
                {!visibleModules.length ? <div className="studio-empty-state">No matching inspirations.</div> : null}
              </div>
            </>
          ) : (
            <div className="studio-library-panel__collapsed" aria-hidden="true">
              <Icon name="fa-book-skull" />
              <span>{modules.length}</span>
            </div>
          )}
          {libraryCollapsed ? (
            <span className="studio-collapsed-rail-label" aria-hidden="true">Inspiration Library</span>
          ) : null}
          {!libraryCollapsed ? (
            <button
              type="button"
              className="studio-sidebar-resize-handle studio-sidebar-resize-handle--library"
              aria-label="Resize inspiration library"
              title="Resize inspiration library"
              onMouseDown={(event) => beginRailResize("library", event)}
            />
          ) : null}
        </aside>

        <div className="inspiration-studio__sheet">
          <nav className="inspiration-studio__section-tabs" aria-label="Studio editor steps">
            {STUDIO_SECTIONS.map((section, index) => (
              <StudioTabButton
                key={section.id}
                icon={section.icon}
                isActive={activeSection === section.id}
                label={`${index + 1}. ${section.label}`}
                count={getSectionCount(section.id, draft, componentGroups, validationReport)}
                hint={section.hint}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </nav>

          <main className="inspiration-studio__main" aria-label="Inspiration module editor">
            {activeSection === "source" ? (
              <IdentityWorkspace
                mode="source"
                draft={draft}
                imageSource={imageSource}
                onTitleChange={handleTitleChange}
                onImageUpload={handleImageUpload}
                identityIdsUnlocked={identityIdsUnlocked}
                modules={modules}
                onIdentityIdsUnlock={() => setIdentityIdsUnlocked(true)}
                onIdentityIdsRelock={relockIdentityIds}
                updateArrayField={updateArrayField}
                updateDraft={updateDraft}
                updateDraftField={updateDraftField}
              />
            ) : null}

            {activeSection === "card" ? (
              <IdentityWorkspace
                mode="card"
                draft={draft}
                imageSource={imageSource}
                onTitleChange={handleTitleChange}
                onImageUpload={handleImageUpload}
                identityIdsUnlocked={identityIdsUnlocked}
                modules={modules}
                onIdentityIdsUnlock={() => setIdentityIdsUnlocked(true)}
                onIdentityIdsRelock={relockIdentityIds}
                updateArrayField={updateArrayField}
                updateDraft={updateDraft}
                updateDraftField={updateDraftField}
              />
            ) : null}

            {activeSection === "taxonomy" ? (
              <IdentityWorkspace
                mode="taxonomy"
                draft={draft}
                imageSource={imageSource}
                onTitleChange={handleTitleChange}
                onImageUpload={handleImageUpload}
                identityIdsUnlocked={identityIdsUnlocked}
                modules={modules}
                onIdentityIdsUnlock={() => setIdentityIdsUnlocked(true)}
                onIdentityIdsRelock={relockIdentityIds}
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
                studioWarnings={studioWarnings}
                validationReport={validationReport}
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

            {activeSection === "review" ? (
              <ExportWorkspace
                contentPackExportJson={contentPackExportJson}
                copyState={copyState}
                exportJson={exportJson}
                exportMode={exportMode}
                moduleExportJson={moduleExportJson}
                onCopy={copyExportJson}
                onDownloadReadinessReport={downloadReadinessReport}
                onExportModeChange={setExportMode}
                draft={draft}
                studioWarnings={studioWarnings}
                validationReport={validationReport}
                monsterQaReport={monsterQaReport}
              />
            ) : null}
          </main>
        </div>

        <StudioRightRail
          collapsed={rightRailCollapsed}
          componentGroups={componentGroups}
          draft={draft}
          imageSource={imageSource}
          onDownloadReadinessReport={downloadReadinessReport}
          onToggleCollapsed={() => setRightRailCollapsed((value) => !value)}
          onResizeStart={(event) => beginRailResize("right", event)}
          packTitle={packTitle}
          validationReport={validationReport}
        />
      </div>

      <GraftLedgerModal
        isOpen={isGraftLedgerOpen}
        onClose={() => setGraftLedgerOpen(false)}
        draftGrafts={monsterComponents}
        libraryGrafts={ALL_MONSTER_GRAFTS}
      />
      <ContentHealthModal
        isOpen={isContentHealthOpen}
        onClose={() => setContentHealthOpen(false)}
        modules={modules}
      />
      <CoverageMatrixModal
        isOpen={isCoverageMatrixOpen}
        onClose={() => setCoverageMatrixOpen(false)}
        modules={modules}
      />
      <MonsterBatchQaModal
        isOpen={isMonsterBatchQaOpen}
        presetRun={pendingTestPresetRun}
        onClose={() => setMonsterBatchQaOpen(false)}
        onPresetRunConsumed={handlePresetRunConsumed}
        onSavePreset={handleSaveTestPreset}
      />
      <MonsterPerGraftQaModal
        isOpen={isMonsterPerGraftQaOpen}
        presetRun={pendingTestPresetRun}
        onClose={() => setMonsterPerGraftQaOpen(false)}
        onPresetRunConsumed={handlePresetRunConsumed}
        onSavePreset={handleSaveTestPreset}
      />
      <MapBatchQaModal
        isOpen={isMapBatchQaOpen}
        presetRun={pendingTestPresetRun}
        onClose={() => setMapBatchQaOpen(false)}
        onPresetRunConsumed={handlePresetRunConsumed}
        onSavePreset={handleSaveTestPreset}
      />
    </section>
  );
}

function IdentityWorkspace({ draft, identityIdsUnlocked = false, imageSource, mode = "source", modules = [], onIdentityIdsRelock, onIdentityIdsUnlock, onImageUpload, onTitleChange, updateArrayField, updateDraft, updateDraftField }) {
  const taxonomyOptions = buildTaxonomyOptions(modules);

  function updateTaxonomyField(field, values) {
    updateDraft((nextDraft) => {
      nextDraft.sourceAnchor[field] = values;
      nextDraft.inspiration[field] = values;
    });
  }

  function appendMarkdown(path, token) {
    updateDraft((nextDraft) => {
      let target = nextDraft;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      const field = path[path.length - 1];
      target[field] = `${target[field] || ""}${target[field] ? "\n" : ""}${token}`;
    });
  }

  function appendPublicSummaryMarkdown(token) {
    updateDraft((nextDraft) => {
      const currentValue = nextDraft.inspiration.summary || nextDraft.sourceAnchor.summary || "";
      const nextValue = `${currentValue}${currentValue ? "\n" : ""}${token}`;
      nextDraft.inspiration.summary = nextValue;
      nextDraft.sourceAnchor.summary = nextValue;
    });
  }

  function updateManualSourceAnchorId(value) {
    updateDraft((nextDraft) => {
      const previousSourceAnchorId = nextDraft.sourceAnchor?.id;
      const nextSourceAnchorId = slugify(value);
      nextDraft.id = nextSourceAnchorId;
      nextDraft.sourceAnchor.id = nextSourceAnchorId;
      nextDraft.inspiration.sourceAnchors = [nextSourceAnchorId];
      nextDraft.components = asArray(nextDraft.components).map((component) => ({
        ...component,
        sourceAnchors: asArray(component.sourceAnchors).length && previousSourceAnchorId
          ? asArray(component.sourceAnchors).map((sourceAnchorId) => sourceAnchorId === previousSourceAnchorId ? nextSourceAnchorId : sourceAnchorId)
          : [nextSourceAnchorId],
      }));
    });
  }

  if (mode === "source") {
    return (
      <div className="inspiration-studio__workspace inspiration-studio__workspace--source">
        <section className="studio-panel studio-panel--identity" aria-label="Source setup">
          <PanelTitle eyebrow="Step 1" icon="fa-id-card-clip" title="Source Setup" help="Set the editorial identity first: name, pack, and publication status. Technical IDs stay under Advanced unless you need them." />

          <div className="studio-form-grid studio-form-grid--primary">
            <FormRow label="Inspiration Name" icon="fa-signature" hint={FIELD_HELP.inspirationName}>
              <EditableTextBox value={draft.title} placeholder="Untitled inspiration" onChange={onTitleChange} />
            </FormRow>
            <FormRow label="Collection / Pack" icon="fa-layer-group" hint={FIELD_HELP.packId}>
              <TextInput list="studio-pack-options" value={draft.packId} onChange={(value) => updateDraftField(["packId"], value)} />
            </FormRow>
            <FormRow label="Status" icon="fa-circle-check" hint={FIELD_HELP.status} helpItems={STATUS_TOOLTIP_ITEMS}>
              <select value={draft.status} onChange={(event) => {
                const value = event.target.value;
                updateDraft((nextDraft) => {
                  nextDraft.status = value;
                  nextDraft.sourceAnchor.status = value;
                  nextDraft.inspiration.status = value;
                });
              }}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </FormRow>
          </div>

          <datalist id="studio-pack-options">
            <option value="core-cruor" />
            <option value="existing-inspirations" />
            <option value="decomposition-inspiration-module" />
            <option value="sedlec-ossuary-inspiration-module" />
          </datalist>

          <details className="studio-advanced-details">
            <summary><Icon name="fa-gear" /> Advanced identity fields</summary>
            <div className="studio-lockable-fields">
              <div className="studio-lockable-fields__status">
                <span><Icon name={identityIdsUnlocked ? "fa-lock-open" : "fa-lock"} /> {identityIdsUnlocked ? "Manual ID override enabled" : "IDs generated from Inspiration Name"}</span>
                <button type="button" onClick={identityIdsUnlocked ? onIdentityIdsRelock : onIdentityIdsUnlock}>
                  <Icon name={identityIdsUnlocked ? "fa-wand-magic-sparkles" : "fa-lock-open"} />
                  {identityIdsUnlocked ? "Regenerate & Lock" : "Unlock Override"}
                </button>
              </div>
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Source Anchor ID" icon="fa-fingerprint" hint={FIELD_HELP.sourceAnchorId}>
                  <TextInput readOnly={!identityIdsUnlocked} value={draft.sourceAnchor.id} onChange={updateManualSourceAnchorId} />
                </FormRow>
                <FormRow label="Inspiration Card ID" icon="fa-fingerprint" hint="Stable ID for the public inspiration card object.">
                  <TextInput readOnly={!identityIdsUnlocked} value={draft.inspiration.id} onChange={(value) => updateDraftField(["inspiration", "id"], value)} />
                </FormRow>
              </div>
            </div>
          </details>
        </section>
      </div>
    );
  }

  if (mode === "card") {
    return (
      <div className="inspiration-studio__workspace inspiration-studio__workspace--card">
        <section className="studio-panel studio-panel--identity" aria-label="Public inspiration card copy">
          <PanelTitle eyebrow="Step 2" icon="fa-align-left" title="Public Card" help={SECTION_HELP.publicCopy} />

          <FormRow label="Public Summary" icon="fa-quote-left" hint={FIELD_HELP.publicSummary}>
            <EditableTextBox
              rows={5}
              value={draft.inspiration.summary || draft.sourceAnchor.summary}
              placeholder="No public summary set."
              onApplyToken={appendPublicSummaryMarkdown}
              onChange={(value) => {
                updateDraft((nextDraft) => {
                  nextDraft.inspiration.summary = value;
                  nextDraft.sourceAnchor.summary = value;
                });
              }}
            />
          </FormRow>

          <FormRow label="Why It Disturbs / Narrative" icon="fa-book-skull" hint={FIELD_HELP.narrative}>
            <EditableTextBox
              rows={7}
              value={draft.inspiration.narrative}
              placeholder="No narrative text set."
              onApplyToken={(token) => appendMarkdown(["inspiration", "narrative"], token)}
              onChange={(value) => updateDraftField(["inspiration", "narrative"], value)}
            />
          </FormRow>
        </section>

        <section className="studio-panel studio-panel--media" aria-label="Card image">
          <PanelTitle eyebrow="Archive Image" icon="fa-image" title="Preview & Asset" help={SECTION_HELP.media} />

          <div className="studio-card-preview">
            {imageSource ? (
              <img src={imageSource} alt={draft.inspiration.media?.alt || `${draft.title} preview`} title={draft.inspiration.media?.title || undefined} />
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

          <details className="studio-advanced-details">
            <summary><Icon name="fa-gear" /> Advanced asset fields</summary>
            <FormRow label="Image Key / Filename" icon="fa-file-image" hint={FIELD_HELP.imageKey}>
              <TextInput value={draft.inspiration.media?.imageKey} onChange={(value) => updateDraftField(["inspiration", "media", "imageKey"], value)} />
            </FormRow>
            <FormRow label="Image URL" icon="fa-link" hint={FIELD_HELP.imageUrl}>
              <TextInput value={draft.inspiration.media?.imageUrl} onChange={(value) => updateDraftField(["inspiration", "media", "imageUrl"], value)} />
            </FormRow>
            <FormRow label="Image Title" icon="fa-heading" hint="Optional image title metadata for the archive card asset.">
              <TextInput value={draft.inspiration.media?.title} onChange={(value) => updateDraftField(["inspiration", "media", "title"], value)} />
            </FormRow>
            <FormRow label="Image Alt" icon="fa-closed-captioning" hint="Accessible alt text for the archive image preview and published card.">
              <TextInput value={draft.inspiration.media?.alt} onChange={(value) => updateDraftField(["inspiration", "media", "alt"], value)} />
            </FormRow>
            <FormRow label="Image Note" icon="fa-note-sticky" hint={FIELD_HELP.imageNote}>
              <TextArea rows={3} value={draft.inspiration.media?.imageNote} onChange={(value) => updateDraftField(["inspiration", "media", "imageNote"], value)} />
            </FormRow>
          </details>
        </section>
      </div>
    );
  }

  return (
    <div className="inspiration-studio__workspace inspiration-studio__workspace--taxonomy">
      <section className="studio-panel studio-panel--identity" aria-label="Taxonomy">
        <PanelTitle eyebrow="Step 3" icon="fa-tags" title="Taxonomy" help={SECTION_HELP.taxonomy} />
        <p className="studio-panel-note">Use comma-separated chips. These drive filtering, inspiration discovery, and default component inheritance.</p>

        <div className="studio-form-grid studio-form-grid--taxonomy">
          <FormRow label="Source Types" icon="fa-folder-tree" hint={FIELD_HELP.sourceTypes}>
            <TagPillInput
              allowCustom={false}
              fieldId="source-types"
              icon={TAXONOMY_PILL_ICONS.sourceTypes}
              suggestions={taxonomyOptions.sourceTypes}
              value={draft.sourceAnchor.sourceTypes}
              onChange={(values) => updateTaxonomyField("sourceTypes", values)}
              placeholder="Add allowed source type…"
            />
          </FormRow>
          <FormRow label="Themes" icon="fa-moon" hint={FIELD_HELP.themes}>
            <TagPillInput
              fieldId="themes"
              icon={TAXONOMY_PILL_ICONS.themes}
              suggestions={taxonomyOptions.themes}
              value={draft.sourceAnchor.themes}
              onChange={(values) => updateTaxonomyField("themes", values)}
              placeholder="Add theme…"
            />
          </FormRow>
          <FormRow label="Motifs" icon="fa-eye" hint={FIELD_HELP.motifs}>
            <TagPillInput
              fieldId="motifs"
              icon={TAXONOMY_PILL_ICONS.motifs}
              suggestions={taxonomyOptions.motifs}
              value={draft.sourceAnchor.motifs}
              onChange={(values) => updateTaxonomyField("motifs", values)}
              placeholder="Add motif…"
            />
          </FormRow>
          <FormRow label="Horror Tags" icon="fa-droplet" hint={FIELD_HELP.horrorTags}>
            <TagPillInput
              allowCustom={false}
              fieldId="horror-tags"
              icon={TAXONOMY_PILL_ICONS.horror}
              suggestions={taxonomyOptions.horror}
              value={draft.sourceAnchor.horror}
              onChange={(values) => updateTaxonomyField("horror", values)}
              placeholder="Add allowed horror tag…"
            />
          </FormRow>
        </div>
      </section>
    </div>
  );
}

function getComponentGroupMeta(component = {}) {
  const type = component.contentType;
  const slots = asArray(component.slots);
  const primarySlot = type === "monster-graft" ? (component.monster?.slot || slots[0] || "unslotted") : (slots[0] || "unslotted");
  const canonicalSlot = CANONICAL_SLOT_MAP.get(primarySlot) || CANONICAL_MONSTER_SLOT_MAP.get(primarySlot) || CANONICAL_DARKEN_SLOT_MAP.get(primarySlot);
  const slotLabel = canonicalSlot?.label || canonicalSlot?.title || formatPlainLabel(primarySlot || "Unslotted");

  if (type === "monster-graft") {
    return {
      key: `monster:${primarySlot}`,
      label: slotLabel,
      eyebrow: "Monster Slot",
      icon: "fa-skull",
    };
  }

  if (type === "location-region") {
    return {
      key: "location:region",
      label: "Location Regions",
      eyebrow: "Map Regions",
      icon: "fa-dungeon",
    };
  }

  return {
    key: `location:${primarySlot}`,
    label: slotLabel,
    eyebrow: "Location Slot",
    icon: "fa-map-location-dot",
  };
}

function groupComponentsForList(components = []) {
  const groups = new Map();

  asArray(components).forEach((component) => {
    const meta = getComponentGroupMeta(component);
    const current = groups.get(meta.key) || { ...meta, items: [] };
    current.items.push(component);
    groups.set(meta.key, current);
  });

  return [...groups.values()];
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
  studioWarnings,
  validationReport,
  visibleComponents,
}) {
  const [componentListCollapsed, setComponentListCollapsed] = useState(true);
  const groupedComponents = groupComponentsForList(visibleComponents);
  const validationIssues = asArray(validationReport?.issues);
  const templateGroups = getStudioComponentTemplateGroups();
  const activeTemplateGroup = templateGroups.find((group) => group.id === (componentMode === "monsters" ? "monster" : "location"));

  function confirmAddComponent(template) {
    const shouldCreate = typeof window === "undefined"
      ? true
      : window.confirm(`Create ${template.label}?`);
    if (shouldCreate) onAddComponent(template.id);
  }

  return (
    <section className="studio-panel studio-panel--components" aria-label="Linked components">
      <PanelTitle eyebrow="Linked Components" icon="fa-diagram-project" title="Generator Content" help={SECTION_HELP.components} />

      <div className={`studio-component-workspace ${componentListCollapsed ? "is-component-list-collapsed" : ""}`.trim()}>
        <div className="studio-component-list studio-component-list--grouped" aria-label="Component list">
          <div className="studio-component-list__topline">
            {componentListCollapsed ? (
              <button
                className="studio-component-list__collapsed-button"
                type="button"
                onClick={() => setComponentListCollapsed(false)}
                aria-label="Expand component list"
                title="Expand component list"
              >
                <Icon name="fa-diagram-project" />
                <span>{visibleComponents.length}</span>
                <em>Component Index</em>
              </button>
            ) : (
              <>
                <div className="studio-component-list__topline-main">
                  <span><Icon name="fa-list" /> Component Index</span>
                  <button
                    type="button"
                    aria-label="Collapse component list"
                    title="Collapse component list"
                    aria-pressed={componentListCollapsed}
                    onClick={() => setComponentListCollapsed(true)}
                  >
                    <Icon name="fa-chevron-left" />
                  </button>
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

                {activeTemplateGroup ? (
                  <details className="studio-component-template-group" key={activeTemplateGroup.id}>
                    <summary><Icon name={activeTemplateGroup.icon} /> Create {activeTemplateGroup.label}</summary>
                    <div className="studio-component-template-group__items">
                      {activeTemplateGroup.templates.map((template) => (
                        <button key={template.id} type="button" onClick={() => confirmAddComponent(template)} title={`Create ${template.label}`}>
                          <Icon name={template.icon} />
                          <span>{template.shortLabel || template.label}</span>
                        </button>
                      ))}
                    </div>
                  </details>
                ) : null}
              </>
            )}
          </div>
          {!componentListCollapsed ? groupedComponents.map((group) => (
            <details className="studio-component-group" key={group.key}>
              <summary>
                <span><Icon name={group.icon} /> {group.eyebrow}</span>
                <strong>{group.label}</strong>
                <em>{group.items.length}</em>
              </summary>
              <div className="studio-component-group__items">
                {group.items.map((component) => {
                  const typeLabel = COMPONENT_TYPE_LABELS[component.contentType] || component.contentType;
                  const slotLabel = joinList(component.slots);
                  const status = normalizeStatus(component.status);
                  const componentIssues = getIssuesForEntry(validationIssues, component.id);
                  const issueState = getEntryIssueState(componentIssues);
                  const hasReviewIssue = issueState !== "clean";

                  return (
                    <button
                      className={[
                        component.id === selectedComponentId || component.id === selectedComponent?.id ? "is-active" : "",
                        getStatusClassName(status),
                        hasReviewIssue ? `has-review-${issueState}` : "",
                      ].filter(Boolean).join(" ")}
                      key={component.id}
                      type="button"
                      onClick={() => onSelectComponent(component.id)}
                    >
                      <span className="studio-component-list__meta">
                        <Icon name={COMPONENT_TYPE_ICONS[component.contentType] || "fa-puzzle-piece"} />
                        {typeLabel}{slotLabel ? ` • ${slotLabel}` : ""}
                      </span>
                      <span className="studio-list-button__topline">
                        <strong>{component.title || component.label}</strong>
                        <span className="studio-list-button__review-tools">
                          <StudioWarningBadge compact warnings={getStudioWarningsForEntry(studioWarnings, component.id)} />
                          <em aria-label={hasReviewIssue ? `${getReadinessLabelFromSummary(getIssueSummary(componentIssues))} review issue` : `${status} status`}>
                            <Icon name={hasReviewIssue ? getReadinessIconFromSummary(getIssueSummary(componentIssues)) : getStatusIconName(status)} />
                          </em>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </details>
          )) : null}
          {!componentListCollapsed && !visibleComponents.length ? <div className="studio-empty-state">No matching components.</div> : null}
        </div>

        {selectedComponent ? (
          <ComponentEditor
            component={selectedComponent}
            warnings={getStudioWarningsForEntry(studioWarnings, selectedComponent.id)}
            onChange={(updater) => onUpdateComponent(selectedComponent.id, updater)}
            onRemove={() => onRemoveComponent(selectedComponent.id)}
          />
        ) : (
          <div className="studio-empty-state">No component selected.</div>
        )}

        <div className="studio-component-tabs studio-component-tabs--vertical" role="tablist" aria-label="Component families">
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
      </div>
    </section>
  );
}


function ExportWorkspace({
  contentPackExportJson,
  copyState,
  exportJson,
  exportMode,
  moduleExportJson,
  onCopy,
  onDownloadReadinessReport,
  onExportModeChange,
  draft,
  studioWarnings,
  validationReport,
  monsterQaReport,
}) {
  const selectedOption = EXPORT_MODE_OPTIONS.find((option) => option.id === exportMode) || EXPORT_MODE_OPTIONS[0];

  return (
    <div className="inspiration-studio__workspace inspiration-studio__workspace--export">
      <section className="studio-panel studio-panel--validation" aria-label="Validation report">
        <PanelTitle eyebrow="Validation" icon="fa-shield-halved" title="Module Readiness" help="Checks whether the current Inspiration Module can safely become a registry-ready content pack.">
          <button type="button" onClick={onDownloadReadinessReport}>
            <Icon name="fa-file-arrow-down" /> Report JSON
          </button>
        </PanelTitle>
        <ValidationPanel draft={draft} report={validationReport} studioWarnings={studioWarnings} />
      </section>

      <section className="studio-panel studio-panel--validation" aria-label="Monster QA report">
        <PanelTitle eyebrow="Monster QA" icon="fa-vial-circle-check" title="Generator Readiness" help="Runs the shared Monster Composer QA suite used by npm run monster:qa. This checks content, templates, forge generation, run mode, and export output.">
          <span>{monsterQaReport?.summary?.error || 0} errors · {monsterQaReport?.summary?.warning || 0} warnings</span>
        </PanelTitle>
        <MonsterQaPanel report={monsterQaReport} />
      </section>

      <section className="studio-panel studio-panel--export" aria-label="Export content pack">
        <PanelTitle eyebrow="Export" icon="fa-code" title={selectedOption.label} help={SECTION_HELP.export}>
          <button type="button" onClick={onCopy}>
            <Icon name={copyState === "copied" ? "fa-check" : copyState === "failed" ? "fa-triangle-exclamation" : "fa-copy"} />
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy JSON"}
          </button>
        </PanelTitle>

        <div className="studio-export-mode" role="tablist" aria-label="Export format">
          {EXPORT_MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={exportMode === option.id}
              onClick={() => onExportModeChange(option.id)}
            >
              <span><Icon name={option.icon} /> {option.label}</span>
              <em>{option.description}</em>
            </button>
          ))}
        </div>

        <p className="studio-export-note">
          {exportMode === "contentPack"
            ? "Copy this JSON into a content pack file when validation is clean enough for the registry."
            : "Use the raw module draft only for Studio/import debugging; the registry should consume the Content Pack export."}
        </p>
        <textarea
          className="studio-export-textarea"
          readOnly
          value={exportJson}
          aria-label={exportMode === "contentPack" ? "Exported Content Pack JSON" : "Exported Inspiration Module JSON"}
        />

        <details className="studio-export-compare">
          <summary><Icon name="fa-code-compare" /> Inspect both export payloads</summary>
          <div className="studio-export-compare__grid">
            <label>
              <span>Content Pack</span>
              <textarea readOnly value={contentPackExportJson} aria-label="Content Pack export preview" />
            </label>
            <label>
              <span>Module Draft</span>
              <textarea readOnly value={moduleExportJson} aria-label="Module Draft export preview" />
            </label>
          </div>
        </details>
      </section>
    </div>
  );
}


function MonsterQaPanel({ report }) {
  const summary = report?.summary || getIssueSummary(report?.issues);
  const groupedIssues = groupQaIssues(report?.issues || []).slice(0, 8);
  const isClean = !summary.error && !summary.warning;

  return (
    <div className="studio-validation-panel" data-validation-state={summary.error ? "error" : summary.warning ? "warning" : "clean"}>
      <div className="studio-validation-panel__summary" aria-label="Monster QA summary">
        <StatPill icon="fa-circle-xmark" label="Errors" value={summary.error || 0} />
        <StatPill icon="fa-triangle-exclamation" label="Warnings" value={summary.warning || 0} />
        <StatPill icon="fa-circle-info" label="Info" value={summary.info || 0} />
      </div>

      {isClean ? (
        <div className="studio-validation-clean">
          <Icon name="fa-circle-check" />
          <strong>Monster QA is clean.</strong>
          <span>Templates, core forge frames, run mode, and export output passed the shared QA suite.</span>
        </div>
      ) : (
        <div className="studio-validation-list studio-validation-list--grouped" role="list">
          {groupedIssues.map((group) => {
            const severity = group.severity || "warning";
            const meta = VALIDATION_SEVERITY_META[severity] || VALIDATION_SEVERITY_META.warning;
            return (
              <article className={`studio-validation-issue studio-validation-issue--${severity}`} key={group.key} role="listitem">
                <span className="studio-validation-issue__badge">
                  <Icon name={meta.icon} />
                  {group.count > 1 ? `${group.count}×` : severity}
                </span>
                <div>
                  <strong>{group.area} / {group.check}</strong>
                  <p>{group.message}</p>
                  {group.ids.length ? <em>{group.ids.join(", ")}</em> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ValidationPanel({ draft = {}, report, studioWarnings = [] }) {
  const issues = asArray(report?.issues);
  const summary = report?.summary || getIssueSummary(issues);
  const isClean = !summary.error && !summary.warning;

  return (
    <div className="studio-validation-panel" data-validation-state={summary.error ? "error" : summary.warning ? "warning" : "clean"}>
      <div className="studio-validation-panel__summary" aria-label="Validation summary">
        <StatPill icon="fa-circle-xmark" label="Errors" value={summary.error || 0} />
        <StatPill icon="fa-triangle-exclamation" label="Warnings" value={summary.warning || 0} />
        <StatPill icon="fa-circle-info" label="Info" value={summary.info || 0} />
      </div>

      {isClean ? (
        <div className="studio-validation-clean">
          <Icon name="fa-circle-check" />
          <strong>Ready for Content Pack export.</strong>
          <span>No validation issues detected for the current module.</span>
        </div>
      ) : (
        <StudioWarningList draft={draft} warnings={studioWarnings} />
      )}
    </div>
  );
}

function ComponentEditor({ component, onChange, onRemove, warnings = [] }) {
  const isMonsterGraft = component.contentType === "monster-graft";
  const isLocationRegion = component.contentType === "location-region";

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

  function setComponentTitle(value) {
    onChange((nextComponent) => {
      nextComponent.title = value;
      nextComponent.label = value;
    });
  }

  function setMonsterSlot(value) {
    setField(["monster", "slot"], value);
    setArray(["slots"], value);
  }

  const typeLabel = COMPONENT_TYPE_LABELS[component.contentType] || component.contentType || "Component";
  const slotValue = isMonsterGraft ? (component.monster?.slot || asArray(component.slots)[0] || "body") : joinList(component.slots);

  return (
    <div className="studio-component-editor-shell" aria-label="Selected component workspace">
      {warnings.length ? (
        <div className="studio-component-editor-warning-panel">
          <StudioWarningList grouped={false} warnings={warnings} />
        </div>
      ) : null}
      <ComponentAdvancedEditor component={component} onChange={onChange} onRemove={onRemove} />
    </div>
  );

}

function ComponentAdvancedEditor({ component, onChange, onRemove }) {
  const isMonsterGraft = component.contentType === "monster-graft";
  const isLocationRegion = component.contentType === "location-region";
  const [spellPickerQuery, setSpellPickerQuery] = useState("");
  const [spellPickerLevel, setSpellPickerLevel] = useState("all");
  const [spellPickerSchool, setSpellPickerSchool] = useState("all");
  const [spellPickerListId, setSpellPickerListId] = useState("atWill");
  const [activeRulesBlocks, setActiveRulesBlocks] = useState({});
  const [activeEditorTab, setActiveEditorTab] = useState("overview");

  useEffect(() => {
    setActiveRulesBlocks({});
    setActiveEditorTab("overview");
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

  function setMapInfluenceField(path, value) {
    onChange((nextComponent) => {
      const holder = isLocationRegion
        ? (nextComponent.locationRegion = nextComponent.locationRegion || {})
        : (nextComponent.location = nextComponent.location || {});
      holder.mapInfluence = holder.mapInfluence || {};
      let target = holder.mapInfluence;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      target[path[path.length - 1]] = value;
    });
  }

  function setMapInfluenceArray(field, value) {
    setMapInfluenceField([field], value);
  }

  function clearMapInfluence() {
    onChange((nextComponent) => {
      if (nextComponent.location?.mapInfluence) delete nextComponent.location.mapInfluence;
      if (nextComponent.locationRegion?.mapInfluence) delete nextComponent.locationRegion.mapInfluence;
      if (nextComponent.mapInfluence) delete nextComponent.mapInfluence;
    });
  }

  function setLocationRegionRoomArchetype(value) {
    setField(["locationRegion", "roomArchetype"], value);
  }

  function setLocationRegionSize(value) {
    setField(["locationRegion", "size"], value);
    setField(["map", "size"], value);
  }

  function setLocationRegionShape(value) {
    setField(["locationRegion", "shape"], value);
    setField(["map", "shape"], value);
    setField(["map", "preferredShape"], value);
  }

  function setMonsterConstraintArray(field, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.constraints = monster.constraints || {};
      monster.constraints[field] = splitList(value);
      if (!Object.values(monster.constraints).some((entry) => Array.isArray(entry) ? entry.length : Boolean(entry))) {
        delete monster.constraints;
      }
    });
  }

  function setMonsterConstraintNote(value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.constraints = monster.constraints || {};
      monster.constraints.note = value;
      if (!Object.values(monster.constraints).some((entry) => Array.isArray(entry) ? entry.length : Boolean(entry))) {
        delete monster.constraints;
      }
    });
  }

  function clearMonsterConstraints() {
    onChange((nextComponent) => {
      if (nextComponent.monster?.constraints) delete nextComponent.monster.constraints;
      if (nextComponent.anatomyConstraints) delete nextComponent.anatomyConstraints;
      if (nextComponent.constraints) delete nextComponent.constraints;
    });
  }

  function setMonsterGrantArray(field, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.anatomyGrants = monster.anatomyGrants || {};
      monster.anatomyGrants[field] = splitList(value);
      if (!Object.values(monster.anatomyGrants).some((entry) => Array.isArray(entry) ? entry.length : Boolean(entry))) {
        delete monster.anatomyGrants;
      }
    });
  }

  function setMonsterGrantNote(value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.anatomyGrants = monster.anatomyGrants || {};
      monster.anatomyGrants.note = value;
      if (!Object.values(monster.anatomyGrants).some((entry) => Array.isArray(entry) ? entry.length : Boolean(entry))) {
        delete monster.anatomyGrants;
      }
    });
  }

  function clearMonsterGrants() {
    onChange((nextComponent) => {
      if (nextComponent.monster?.anatomyGrants) delete nextComponent.monster.anatomyGrants;
      if (nextComponent.monster?.grants && isPlainObject(nextComponent.monster.grants)) delete nextComponent.monster.grants;
      if (nextComponent.anatomyGrants) delete nextComponent.anatomyGrants;
    });
  }

  function setMonsterFrameFitArray(dimension, field, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.fit = monster.fit || {};
      monster.fit.schemaVersion = monster.fit.schemaVersion || "monster-frame-fit-v1.0";
      monster.fit[dimension] = monster.fit[dimension] || {};
      monster.fit[dimension][field] = splitList(value);
      if (!asArray(monster.fit[dimension][field]).length) delete monster.fit[dimension][field];
      if (!Object.keys(monster.fit[dimension]).length) delete monster.fit[dimension];
      if (!Object.keys(monster.fit).some((key) => key !== "schemaVersion")) delete monster.fit;
    });
  }

  function setMonsterFrameFitField(path, value) {
    onChange((nextComponent) => {
      const monster = nextComponent.monster = nextComponent.monster || {};
      monster.fit = monster.fit || {};
      monster.fit.schemaVersion = monster.fit.schemaVersion || "monster-frame-fit-v1.0";
      let target = monster.fit;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      const finalKey = path[path.length - 1];
      if (value === "" || value === null || value === undefined) delete target[finalKey];
      else target[finalKey] = value;
      const normalized = normalizeMonsterFrameFit(monster.fit);
      if (normalized) monster.fit = normalized;
      else delete monster.fit;
    });
  }

  function clearMonsterFrameFit() {
    onChange((nextComponent) => {
      if (nextComponent.monster?.fit) delete nextComponent.monster.fit;
      if (nextComponent.fit) delete nextComponent.fit;
      if (nextComponent.frameFit) delete nextComponent.frameFit;
    });
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
      setRulesField(["targeting", "origin"], monsterRules.targeting?.origin || "");
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
  const monsterConstraints = isMonsterGraft ? (normalizeMonsterAnatomyConstraints(getMonsterConstraintSource(component)) || {}) : {};
  const monsterConstraintSummary = isMonsterGraft ? getMonsterConstraintSummary(component) : [];
  const monsterAnatomyGrants = isMonsterGraft ? (normalizeMonsterAnatomyGrants(getMonsterGrantSource(component)) || {}) : {};
  const monsterGrantSummary = isMonsterGraft ? getMonsterGrantSummary(component) : [];
  const monsterFrameFit = isMonsterGraft ? (normalizeMonsterFrameFit(getMonsterFrameFitSource(component)) || {}) : {};
  const monsterFrameFitSummary = isMonsterGraft ? getMonsterFrameFitSummary(component) : [];
  const compatibilityMatrix = isMonsterGraft ? buildStudioCompatibilityMatrix(component) : [];
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
  const hasTargetingDetails = Boolean(targeting?.text || targeting?.shape || targeting?.size || targeting?.targets || targeting?.origin || targeting?.originText || (targeting?.type && targeting.type !== "self"));
  const multiattackEnabled = Boolean(monsterRules.multiattack?.enabled);
  const multiattackAttacks = asArray(monsterRules.multiattack?.attacks);
  const visibleMultiattackAttacks = multiattackEnabled ? (multiattackAttacks.length ? multiattackAttacks : [{ ref: "primary", label: "Primary", count: monsterRules.multiattack?.count || 2 }]) : [];
  const multiattackReplacements = asArray(monsterRules.multiattack?.replacements);
  const spellcastingEnabled = Boolean(monsterRules.spellcasting?.enabled);
  const abilityReferences = asArray(monsterRules.references);
  const hasReferenceDetails = abilityReferences.some((reference) => Boolean(
    reference?.type ||
    reference?.relationship ||
    reference?.ref ||
    reference?.label ||
    reference?.count ||
    reference?.text
  ));
  const visibleAbilityReferences = abilityReferences.length
    ? abilityReferences
    : [{ type: "action", relationship: "uses", ref: "ability-1", label: "Ability 1" }];
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
  const isLocationComponent = component.contentType === "location-component";
  const editableMapInfluence = isLocationRegion
    ? (component.locationRegion?.mapInfluence || {})
    : (component.location?.mapInfluence || component.mapInfluence || {});
  const regionRoomArchetype = component.locationRegion?.roomArchetype || component.locationRegion?.roomArchetypeId || "";
  const mapInfluenceRoomArchetype = editableMapInfluence.roomArchetype
    || editableMapInfluence.roomArchetypeId
    || editableMapInfluence.forcedRoomArchetype
    || editableMapInfluence.forcedRoomArchetypeId
    || "";
  const hasMapInfluenceData = Boolean(
    mapInfluenceRoomArchetype
      || editableMapInfluence.forceRoomArchetype
      || editableMapInfluence.weight
      || editableMapInfluence.source
      || editableMapInfluence.note
      || asArray(editableMapInfluence.preferredRoomArchetypes).length
      || asArray(editableMapInfluence.forbiddenRoomArchetypes).length,
  );

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
  const componentEditorTabs = getComponentEditorTabs(component);
  const activeComponentEditorTab = componentEditorTabs.some((tab) => tab.id === activeEditorTab) ? activeEditorTab : "overview";

  return (
    <div className="studio-component-editor studio-component-editor--tabbed" data-active-zone={activeComponentEditorTab} aria-label="Selected component editor">
      <div className="studio-component-editor__topline studio-component-editor__topline--sticky">
        <div>
          <span><Icon name={COMPONENT_TYPE_ICONS[component.contentType] || "fa-puzzle-piece"} /> {COMPONENT_TYPE_LABELS[component.contentType] || component.contentType}</span>
          <strong>{component.title}</strong>
        </div>
      </div>

      <nav className="studio-component-editor-tabs" aria-label="Component editor sections">
        {componentEditorTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeComponentEditorTab ? "is-active" : ""}
            aria-pressed={tab.id === activeComponentEditorTab}
            onClick={() => setActiveEditorTab(tab.id)}
          >
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>


      {activeComponentEditorTab === "overview" ? (
        <div className="studio-component-zone" data-editor-zone="overview">
          <RulesGroup icon="fa-id-card" title="Identity" help="Core component identity, source links, workflows, and implementation tags.">
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
                  <KeywordPillInput fieldId={`${component.id}-slots`} icon="fa-table-cells-large" value={component.slots} onChange={(value) => setField(["slots"], value)} placeholder="body, attack, region" />
                </FormRow>
              ) : null}
              <FormRow label="Workflows" icon="fa-route" hint={FIELD_HELP.workflows}>
                <KeywordPillInput fieldId={`${component.id}-workflows`} icon="fa-route" value={component.workflows} onChange={(value) => setField(["workflows"], value)} placeholder="monster-composer" />
              </FormRow>
              <FormRow label="Source Anchors" icon="fa-anchor" hint={FIELD_HELP.sourceAnchors}>
                <KeywordPillInput fieldId={`${component.id}-source-anchors`} icon="fa-anchor" value={component.sourceAnchors} onChange={(value) => setField(["sourceAnchors"], value)} placeholder="decomposition" />
              </FormRow>
              <FormRow label="Tags" icon="fa-tags" hint={FIELD_HELP.tags}>
                <KeywordPillInput fieldId={`${component.id}-tags`} icon="fa-tag" value={component.tags} onChange={(value) => setField(["tags"], value)} placeholder="slot:body, role:boss" />
              </FormRow>
            </div>
          </RulesGroup>

          <RulesGroup icon="fa-pen-nib" title="Playable Text" help={SECTION_HELP.playableText}>
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
          </RulesGroup>
        </div>
      ) : null}

      {isMonsterGraft ? (
        <div className="studio-component-editor__subpanel studio-component-editor__subpanel--monster" hidden={activeComponentEditorTab === "overview"}>
          <RulesGroup zone="fit" defaultOpen icon="fa-id-card" title="Frame" help="Frame fields define where the graft belongs in the Monster Composer, where it prints in the stat block, and how much budget it consumes.">
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

          <RulesGroup
            zone="anatomy"
            icon="fa-seedling"
            title="Effective Anatomy Grants"
            help="Optional build changes this graft adds after installation. Use this for mutation/body grafts that unlock later abilities, such as web organs, tendrils, wax mask, brood carrier, or spectral body."
            actions={monsterGrantSummary.length ? <RemoveRulesBlockButton label="Effective Anatomy Grants" onClick={clearMonsterGrants} /> : null}
          >
            <div className="studio-form-grid studio-form-grid--compact">
              <FormRow label={ANATOMY_GRANT_FIELD_LABELS.grantsBodyPlans} icon="fa-person-rays" hint={ANATOMY_GRANT_FIELD_HINTS.grantsBodyPlans}>
                <KeywordPillInput fieldId={`${component.id}-grants-body-plans`} icon="fa-person-rays" value={monsterAnatomyGrants.grantsBodyPlans} onChange={(value) => setMonsterGrantArray("grantsBodyPlans", value)} placeholder="arachnid, incorporeal" />
              </FormRow>
              <FormRow label={ANATOMY_GRANT_FIELD_LABELS.grantsAnatomy} icon="fa-dna" hint={ANATOMY_GRANT_FIELD_HINTS.grantsAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-grants-anatomy`} icon="fa-dna" value={monsterAnatomyGrants.grantsAnatomy} onChange={(value) => setMonsterGrantArray("grantsAnatomy", value)} placeholder="web_glands, spinnerets, tendrils" />
              </FormRow>
              <FormRow label={ANATOMY_GRANT_FIELD_LABELS.grantsTags} icon="fa-tags" hint={ANATOMY_GRANT_FIELD_HINTS.grantsTags}>
                <KeywordPillInput fieldId={`${component.id}-grants-tags`} icon="fa-tags" value={monsterAnatomyGrants.grantsTags} onChange={(value) => setMonsterGrantArray("grantsTags", value)} placeholder="web_bearing, spider_infested" />
              </FormRow>
              <FormRow label={ANATOMY_GRANT_FIELD_LABELS.grantsTokens} icon="fa-link" hint={ANATOMY_GRANT_FIELD_HINTS.grantsTokens}>
                <KeywordPillInput fieldId={`${component.id}-grants-tokens`} icon="fa-link" value={monsterAnatomyGrants.grantsTokens} onChange={(value) => setMonsterGrantArray("grantsTokens", value)} placeholder="web_maker, egg_carrier" />
              </FormRow>
            </div>
            <FormRow label="Grant Note" icon="fa-note-sticky" hint="Optional internal note explaining what anatomy or build state this graft unlocks.">
              <TextArea rows={2} value={monsterAnatomyGrants.note || ""} onChange={setMonsterGrantNote} placeholder="Example: this body graft grows spinnerets, so later web attacks become legal." />
            </FormRow>
            {monsterGrantSummary.length ? (
              <div className="studio-constraint-summary" aria-label="Current anatomy grants">
                {monsterGrantSummary.map((row) => (
                  <span key={`${row.label}-${row.values.join("-")}`}>
                    <strong>{row.label}:</strong> {row.values.join(", ")}
                  </span>
                ))}
              </div>
            ) : (
              <div className="studio-empty-state studio-empty-state--inline">No anatomy grants. This graft does not change the effective body/anatomy of the build.</div>
            )}
          </RulesGroup>

          <RulesGroup
            zone="anatomy"
            icon="fa-dna"
            title="Anatomy Constraints"
            help="Optional hard compatibility gates. Leave empty for generic grafts; fill only when the feature needs a specific family, body plan, organ, limb, or build prerequisite."
            actions={monsterConstraintSummary.length ? <RemoveRulesBlockButton label="Anatomy Constraints" onClick={clearMonsterConstraints} /> : null}
          >
            <div className="studio-constraint-reference">
              <div>
                <strong>Known body plans</strong>
                <span>{MONSTER_BODY_PLAN_OPTIONS.map((option) => option.id).join(", ")}</span>
              </div>
              <div>
                <strong>Known families</strong>
                <span>{MONSTER_FAMILY_PROFILE_OPTIONS.map((option) => option.id).join(", ")}</span>
              </div>
            </div>
            <div className="studio-form-grid studio-form-grid--compact">
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.allowedFamilies} icon="fa-skull" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.allowedFamilies}>
                <KeywordPillInput fieldId={`${component.id}-allowed-families`} icon="fa-skull" value={asArray(monsterConstraints.allowedFamilies).length ? monsterConstraints.allowedFamilies : monsterConstraints.exclusiveToFamilies} onChange={(value) => setMonsterConstraintArray("allowedFamilies", value)} placeholder="spider, skeleton" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenFamilies} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenFamilies}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-families`} icon="fa-ban" value={monsterConstraints.forbiddenFamilies} onChange={(value) => setMonsterConstraintArray("forbiddenFamilies", value)} placeholder="spider, spirit" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.allowedBodyPlans} icon="fa-person" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.allowedBodyPlans}>
                <KeywordPillInput fieldId={`${component.id}-allowed-body-plans`} icon="fa-person" value={monsterConstraints.allowedBodyPlans} onChange={(value) => setMonsterConstraintArray("allowedBodyPlans", value)} placeholder="humanoid, arachnid" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenBodyPlans} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenBodyPlans}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-body-plans`} icon="fa-ban" value={monsterConstraints.forbiddenBodyPlans} onChange={(value) => setMonsterConstraintArray("forbiddenBodyPlans", value)} placeholder="incorporeal" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiredAnatomy} icon="fa-hand" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiredAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-required-anatomy`} icon="fa-hand" value={monsterConstraints.requiredAnatomy} onChange={(value) => setMonsterConstraintArray("requiredAnatomy", value)} placeholder="hands, fangs, web_glands" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiresAnyAnatomy} icon="fa-code-branch" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiresAnyAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-requires-any-anatomy`} icon="fa-code-branch" value={monsterConstraints.requiresAnyAnatomy} onChange={(value) => setMonsterConstraintArray("requiresAnyAnatomy", value)} placeholder="hands, tendrils" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenAnatomy} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-anatomy`} icon="fa-ban" value={monsterConstraints.forbiddenAnatomy} onChange={(value) => setMonsterConstraintArray("forbiddenAnatomy", value)} placeholder="beak, no_stable_limbs" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiredTags} icon="fa-tags" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiredTags}>
                <KeywordPillInput fieldId={`${component.id}-required-tags`} icon="fa-tags" value={monsterConstraints.requiredTags} onChange={(value) => setMonsterConstraintArray("requiredTags", value)} placeholder="corpse, physical" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenTags} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenTags}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-tags`} icon="fa-ban" value={monsterConstraints.forbiddenTags} onChange={(value) => setMonsterConstraintArray("forbiddenTags", value)} placeholder="no_flesh, no_hands" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiredTokens} icon="fa-link" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiredTokens}>
                <KeywordPillInput fieldId={`${component.id}-required-tokens`} icon="fa-link" value={monsterConstraints.requiredTokens} onChange={(value) => setMonsterConstraintArray("requiredTokens", value)} placeholder="web_maker, bone_body" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiresAnyTokens} icon="fa-link" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiresAnyTokens}>
                <KeywordPillInput fieldId={`${component.id}-requires-any-tokens`} icon="fa-link" value={monsterConstraints.requiresAnyTokens} onChange={(value) => setMonsterConstraintArray("requiresAnyTokens", value)} placeholder="spider_body, web_maker" />
              </FormRow>
              <FormRow label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenTokens} icon="fa-link-slash" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenTokens}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-tokens`} icon="fa-link-slash" value={monsterConstraints.forbiddenTokens} onChange={(value) => setMonsterConstraintArray("forbiddenTokens", value)} placeholder="spirit_body, no_body" />
              </FormRow>
            </div>
            <FormRow label="Constraint Note" icon="fa-note-sticky" hint="Optional internal note explaining why the constraint exists. This is useful for review and future content authors.">
              <TextArea rows={2} value={monsterConstraints.note || ""} onChange={setMonsterConstraintNote} placeholder="Example: requires spinnerets because the graft creates web terrain directly." />
            </FormRow>
            {monsterConstraintSummary.length ? (
              <div className="studio-constraint-summary" aria-label="Current anatomy constraints">
                {monsterConstraintSummary.map((row) => (
                  <span key={`${row.label}-${row.values.join("-")}`}>
                    <strong>{row.label}:</strong> {row.values.join(", ")}
                  </span>
                ))}
              </div>
            ) : (
              <div className="studio-empty-state studio-empty-state--inline">No anatomy constraints. This graft remains generic and can be used by any compatible monster frame.</div>
            )}
          </RulesGroup>

          <RulesGroup
            zone="fit"
            defaultOpen
            icon="fa-sliders"
            title="Frame Fit"
            help="Optional frame-level gates and recommendations. Use this to make a graft boss-only, controller-friendly, CR-gated, slow-tempo, horror-only, or otherwise tied to the monster frame selectors."
            actions={monsterFrameFitSummary.length ? <RemoveRulesBlockButton label="Frame Fit" onClick={clearMonsterFrameFit} /> : null}
          >
            <div className="studio-constraint-reference">
              <div>
                <strong>Encounter</strong>
                <span>{getFrameFitOptionLabels("encounterRoles")}</span>
              </div>
              <div>
                <strong>Tactical</strong>
                <span>{getFrameFitOptionLabels("tacticalRoles")}</span>
              </div>
              <div>
                <strong>Tier</strong>
                <span>{getFrameFitOptionLabels("tiers")}</span>
              </div>
              <div>
                <strong>Tempo</strong>
                <span>{getFrameFitOptionLabels("tempo")}</span>
              </div>
              <div>
                <strong>Danger</strong>
                <span>{getFrameFitOptionLabels("danger")}</span>
              </div>
            </div>

            <div className="studio-form-grid studio-form-grid--compact">
              <FormRow label="Encounter Allowed" icon="fa-user-group" hint={MONSTER_FRAME_FIT_FIELD_HELP.allowed}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-encounter-allowed`} icon="fa-user-group" value={monsterFrameFit.encounterRoles?.allowed} onChange={(value) => setMonsterFrameFitArray("encounterRoles", "allowed", value)} placeholder="standard, boss" suggestions={MONSTER_FRAME_FIT_VALUES.encounterRoles} />
              </FormRow>
              <FormRow label="Encounter Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-encounter-recommended`} icon="fa-star" value={monsterFrameFit.encounterRoles?.recommended} onChange={(value) => setMonsterFrameFitArray("encounterRoles", "recommended", value)} placeholder="boss" suggestions={MONSTER_FRAME_FIT_VALUES.encounterRoles} />
              </FormRow>
              <FormRow label="Encounter Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-encounter-forbidden`} icon="fa-ban" value={monsterFrameFit.encounterRoles?.forbidden} onChange={(value) => setMonsterFrameFitArray("encounterRoles", "forbidden", value)} placeholder="minion" suggestions={MONSTER_FRAME_FIT_VALUES.encounterRoles} />
              </FormRow>

              <FormRow label="Tactical Allowed" icon="fa-chess-knight" hint={MONSTER_FRAME_FIT_FIELD_HELP.allowed}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tactical-allowed`} icon="fa-chess-knight" value={monsterFrameFit.tacticalRoles?.allowed} onChange={(value) => setMonsterFrameFitArray("tacticalRoles", "allowed", value)} placeholder="controller, support" suggestions={MONSTER_FRAME_FIT_VALUES.tacticalRoles} />
              </FormRow>
              <FormRow label="Tactical Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tactical-recommended`} icon="fa-star" value={monsterFrameFit.tacticalRoles?.recommended} onChange={(value) => setMonsterFrameFitArray("tacticalRoles", "recommended", value)} placeholder="controller" suggestions={MONSTER_FRAME_FIT_VALUES.tacticalRoles} />
              </FormRow>
              <FormRow label="Tactical Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tactical-forbidden`} icon="fa-ban" value={monsterFrameFit.tacticalRoles?.forbidden} onChange={(value) => setMonsterFrameFitArray("tacticalRoles", "forbidden", value)} placeholder="brute" suggestions={MONSTER_FRAME_FIT_VALUES.tacticalRoles} />
              </FormRow>

              <FormRow label="Tier Min" icon="fa-layer-group" hint="Hard minimum tier. Leave empty for no hard gate.">
                <SelectInput options={[["", "No minimum"], ...MONSTER_FRAME_FIT_VALUES.tiers.map((id) => [id, MONSTER_FRAME_FIT_OPTION_LABELS.tiers[id] || id])]} value={monsterFrameFit.tiers?.min || ""} onChange={(value) => setMonsterFrameFitField(["tiers", "min"], value)} />
              </FormRow>
              <FormRow label="Tier Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tier-recommended`} icon="fa-star" value={monsterFrameFit.tiers?.recommended} onChange={(value) => setMonsterFrameFitArray("tiers", "recommended", value)} placeholder="elite, boss, setpiece" suggestions={MONSTER_FRAME_FIT_VALUES.tiers} />
              </FormRow>
              <FormRow label="Tier Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tier-forbidden`} icon="fa-ban" value={monsterFrameFit.tiers?.forbidden} onChange={(value) => setMonsterFrameFitArray("tiers", "forbidden", value)} placeholder="normal" suggestions={MONSTER_FRAME_FIT_VALUES.tiers} />
              </FormRow>

              <FormRow label="CR Min" icon="fa-signal" hint={MONSTER_FRAME_FIT_FIELD_HELP.cr}>
                <input type="number" min="0" max="30" value={monsterFrameFit.cr?.min ?? ""} onChange={(event) => setMonsterFrameFitField(["cr", "min"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="5" />
              </FormRow>
              <FormRow label="CR Max" icon="fa-signal" hint={MONSTER_FRAME_FIT_FIELD_HELP.cr}>
                <input type="number" min="0" max="30" value={monsterFrameFit.cr?.max ?? ""} onChange={(event) => setMonsterFrameFitField(["cr", "max"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="20" />
              </FormRow>
              <FormRow label="Recommended CR Min" icon="fa-star" hint="Soft minimum CR used for QA and ranking, but not as a hard block.">
                <input type="number" min="0" max="30" value={monsterFrameFit.cr?.recommendedMin ?? ""} onChange={(event) => setMonsterFrameFitField(["cr", "recommendedMin"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="8" />
              </FormRow>

              <FormRow label="Tempo Allowed" icon="fa-forward-fast" hint={MONSTER_FRAME_FIT_FIELD_HELP.allowed}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tempo-allowed`} icon="fa-forward-fast" value={monsterFrameFit.tempo?.allowed} onChange={(value) => setMonsterFrameFitArray("tempo", "allowed", value)} placeholder="slow, standard" suggestions={MONSTER_FRAME_FIT_VALUES.tempo} />
              </FormRow>
              <FormRow label="Tempo Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tempo-recommended`} icon="fa-star" value={monsterFrameFit.tempo?.recommended} onChange={(value) => setMonsterFrameFitArray("tempo", "recommended", value)} placeholder="fast, ambusher" suggestions={MONSTER_FRAME_FIT_VALUES.tempo} />
              </FormRow>
              <FormRow label="Tempo Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tempo-forbidden`} icon="fa-ban" value={monsterFrameFit.tempo?.forbidden} onChange={(value) => setMonsterFrameFitArray("tempo", "forbidden", value)} placeholder="ambusher" suggestions={MONSTER_FRAME_FIT_VALUES.tempo} />
              </FormRow>

              <FormRow label="Danger Min" icon="fa-skull-crossbones" hint="Hard minimum danger profile. Leave empty for no hard gate.">
                <SelectInput options={[["", "No minimum"], ...MONSTER_FRAME_FIT_VALUES.danger.map((id) => [id, MONSTER_FRAME_FIT_OPTION_LABELS.danger[id] || id])]} value={monsterFrameFit.danger?.min || ""} onChange={(value) => setMonsterFrameFitField(["danger", "min"], value)} />
              </FormRow>
              <FormRow label="Danger Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-danger-recommended`} icon="fa-star" value={monsterFrameFit.danger?.recommended} onChange={(value) => setMonsterFrameFitArray("danger", "recommended", value)} placeholder="hard, horror" suggestions={MONSTER_FRAME_FIT_VALUES.danger} />
              </FormRow>
              <FormRow label="Danger Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-danger-forbidden`} icon="fa-ban" value={monsterFrameFit.danger?.forbidden} onChange={(value) => setMonsterFrameFitArray("danger", "forbidden", value)} placeholder="standard" suggestions={MONSTER_FRAME_FIT_VALUES.danger} />
              </FormRow>
            </div>

            <FormRow label="Fit Note" icon="fa-note-sticky" hint="Optional internal note explaining why this graft fits or does not fit certain monster frames.">
              <TextArea rows={2} value={monsterFrameFit.note || ""} onChange={(value) => setMonsterFrameFitField(["note"], value)} placeholder="Example: intended for elite controller spiders; too much tracking for minions." />
            </FormRow>

            {monsterFrameFitSummary.length ? (
              <div className="studio-constraint-summary" aria-label="Current frame fit">
                {monsterFrameFitSummary.map((row) => (
                  <span key={`${row.label}-${row.values.join("-")}`}>
                    <strong>{row.label}:</strong> {row.values.join(", ")}
                  </span>
                ))}
              </div>
            ) : (
              <div className="studio-empty-state studio-empty-state--inline">No explicit Frame Fit. The Composer will infer soft recommendations from stats, rules, pressure, and anatomy, but this graft has no hard frame gates.</div>
            )}
          </RulesGroup>

          <RulesGroup
            zone="qa"
            icon="fa-table-cells"
            title="Compatibility Matrix"
            help="Preview how this graft behaves on each base creature family before other build grants are installed. Body/mutation grants selected in the Composer can turn blocked follow-up grafts into valid ones."
          >
            <div className="studio-compatibility-matrix" role="table" aria-label="Monster family compatibility matrix">
              {compatibilityMatrix.map((entry) => (
                <div
                  className={`studio-compatibility-matrix__row studio-compatibility-matrix__row--${entry.status.kind}`}
                  key={entry.id}
                  role="row"
                >
                  <strong role="cell">{entry.label}</strong>
                  <span role="cell">{formatAnatomyTerm(entry.typeId)}</span>
                  <em role="cell">{entry.status.label}</em>
                  <small role="cell">{entry.status.message}</small>
                </div>
              ))}
            </div>
          </RulesGroup>

          <RulesGroup zone="qa" icon="fa-code" title="Raw Component JSON" help="Read-only component payload for debugging saved data and future Supabase migration checks.">
            <FormRow label="Raw JSON" icon="fa-code" hint="Read-only JSON for the selected component. Use this only for debugging.">
              <TextArea className="studio-generated-preview studio-raw-json-preview" rows={16} readOnly value={JSON.stringify(component, null, 2)} />
            </FormRow>
          </RulesGroup>

          <RulesGroup zone="qa" icon="fa-trash" title="Danger Zone" help="Remove this component from the current Inspiration Module.">
            <ArmedDeleteButton onConfirm={onRemove} />
          </RulesGroup>

          {usesInferredRules ? (
            <div className="studio-inferred-rules-note" data-editor-zone="rules">
              <Icon name="fa-wand-magic-sparkles" />
              <span>Inferred from legacy Mechanics. Editing any rule field will convert this graft to explicit structured rules.</span>
            </div>
          ) : null}

          <div className="studio-rules-layout" data-editor-zone="rules">
            <RulesGroup defaultOpen icon="fa-bolt" title="Use" help="Use fields define when the ability exists and how often it can be used.">
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


            <RulesGroup defaultOpen icon="fa-plus" title="Add Rule Block" help="Add only the optional rule blocks this graft actually needs. Blocks already containing data stay visible until removed.">
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
                      <FormRow label="Origin" icon="fa-location-crosshairs" hint={FIELD_HELP.targetingOrigin}>
                        <SelectInput options={MONSTER_TARGETING_ORIGIN_OPTIONS} value={targeting.origin || ""} onChange={(value) => setRulesField(["targeting", "origin"], value || undefined)} />
                      </FormRow>
                      <FormRow label="Origin Text" icon="fa-quote-left" hint={FIELD_HELP.targetingOriginText}>
                        <TextInput value={targeting.originText} onChange={(value) => setRulesField(["targeting", "originText"], value)} placeholder="centered on the corpse" />
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
                        <KeywordPillInput fieldId={`${component.id}-area-excludes`} icon="fa-ban" value={areaEffect.excludes} onChange={(value) => setRulesArray(["areaEffect", "excludes"], value)} placeholder="self, allies" />
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
                          <KeywordPillInput fieldId={`${component.id}-damage-part-${index}-types`} icon="fa-burst" value={part.types} onChange={(value) => setDamagePartField(index, ["types"], value)} placeholder="bludgeoning, lightning" />
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
                    <KeywordPillInput fieldId={`${component.id}-damage-types`} icon="fa-burst" value={monsterRules.damage?.types} onChange={(value) => setRulesArray(["damage", "types"], value)} placeholder="bludgeoning, poison" />
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
                    <FormRow label="Condition Direction" icon="fa-arrows-turn-to-dots" hint={FIELD_HELP.conditionDirection}>
                      <SelectInput options={MONSTER_CONDITION_DIRECTION_OPTIONS} value={monsterRules.condition?.direction || "enemy"} onChange={(value) => setRulesField(["condition", "direction"], value)} />
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
                        <KeywordPillInput fieldId={`${component.id}-ongoing-damage-types`} icon="fa-burst" value={monsterRules.ongoing?.damage?.types} onChange={(value) => setRulesArray(["ongoing", "damage", "types"], value)} placeholder="acid" />
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
                                <KeywordPillInput fieldId={`${component.id}-procedure-ongoing-damage-types`} icon="fa-burst" value={monsterRules.procedure?.ongoingDamage?.damage?.types} onChange={(value) => setRulesArray(["procedure", "ongoingDamage", "damage", "types"], value)} placeholder="acid" />
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
                          <KeywordPillInput fieldId={`${component.id}-defense-damage-types`} icon="fa-shield-halved" value={monsterRules.defense?.damageTypes} onChange={(value) => setRulesArray(["defense", "damageTypes"], value)} placeholder="fire, necrotic" />
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
            <RulesGroup zone="output" icon="fa-shield-halved" title="Counterplay" help="Counterplay explains what players can notice, prevent, avoid, exploit, or clean up." actions={<RemoveRulesBlockButton label="Counterplay" onClick={() => removeRulesBlock("counterplay")} />}>
              <FormRow label="Counterplay" icon="fa-shield-halved" hint={FIELD_HELP.counterplay}>
                <TextArea rows={3} value={component.counterplay} onChange={(value) => setField(["counterplay"], value)} />
              </FormRow>
            </RulesGroup>
          ) : null}

          <DividerLabel zone="output" icon="fa-scroll" title="Stat Block Text" help="This final text is what the Monster Composer exports for this graft. Generated mode is built from the fields above; Manual Override can still use formula tokens." />
          <RulesGroup zone="output" defaultOpen icon="fa-scroll" title="Text Source" help="Choose whether this graft exports generated text or a manual override.">
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


      {!isMonsterGraft && activeComponentEditorTab === "output" ? (
        <div className="studio-component-editor__subpanel" data-editor-zone="output">
          {isLocationRegion ? (
            <RulesGroup defaultOpen icon="fa-dungeon" title="Location Region Data" help="Map-region fields consumed by Dark Places and the Map Generator.">
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Role" icon="fa-compass" hint={FIELD_HELP.regionRole}>
                  <TextInput value={component.locationRegion?.role} onChange={(value) => setField(["locationRegion", "role"], value)} />
                </FormRow>
                <FormRow label="Size" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.regionSize}>
                  <SelectInput options={[["Small", "Small"], ["Medium", "Medium"], ["Large", "Large"]]} value={component.locationRegion?.size || "Medium"} onChange={setLocationRegionSize} />
                </FormRow>
                <FormRow label="Shape" icon="fa-draw-polygon" hint={FIELD_HELP.regionShape}>
                  <TextInput value={component.locationRegion?.shape} onChange={setLocationRegionShape} />
                </FormRow>
                <FormRow label="Connectors" icon="fa-code-branch" hint={FIELD_HELP.regionConnectors}>
                  <input type="number" min="0" max="8" value={component.locationRegion?.connectors ?? 0} onChange={(event) => setField(["locationRegion", "connectors"], Number(event.target.value))} />
                </FormRow>
                <FormRow label="Room Archetype" icon="fa-dungeon" hint={FIELD_HELP.regionRoomArchetype}>
                  <SelectInput options={ROOM_ARCHETYPE_SELECT_OPTIONS} value={regionRoomArchetype} onChange={setLocationRegionRoomArchetype} />
                </FormRow>
              </div>
            </RulesGroup>
          ) : null}

          {(isLocationRegion || isLocationComponent) ? (
            <RulesGroup
              defaultOpen
              icon="fa-map-location-dot"
              title="Map Influence"
              help="Optional map-generation influence. Use this when a component assigned to a room should prefer, forbid, or force a room archetype."
              actions={hasMapInfluenceData ? <RemoveRulesBlockButton label="Map Influence" onClick={clearMapInfluence} /> : null}
            >
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Influence Archetype" icon="fa-dungeon" hint="Optional direct archetype target used when Force is enabled, or as a strong preference when combined with preferred archetypes.">
                  <SelectInput options={ROOM_ARCHETYPE_SELECT_OPTIONS} value={mapInfluenceRoomArchetype} onChange={(value) => setMapInfluenceField(["roomArchetype"], value)} />
                </FormRow>
                <FormRow label="Preferred Archetypes" icon="fa-star" hint={FIELD_HELP.mapInfluencePreferredArchetypes}>
                  <KeywordPillInput allowCustom={false} fieldId={`${component.id}-preferred-room-archetypes`} icon="fa-star" value={editableMapInfluence.preferredRoomArchetypes} onChange={(value) => setMapInfluenceArray("preferredRoomArchetypes", value)} placeholder="bone-well, reliquary-niche" suggestions={ROOM_ARCHETYPE_SUGGESTIONS} />
                </FormRow>
                <FormRow label="Forbidden Archetypes" icon="fa-ban" hint={FIELD_HELP.mapInfluenceForbiddenArchetypes}>
                  <KeywordPillInput allowCustom={false} fieldId={`${component.id}-forbidden-room-archetypes`} icon="fa-ban" value={editableMapInfluence.forbiddenRoomArchetypes} onChange={(value) => setMapInfluenceArray("forbiddenRoomArchetypes", value)} placeholder="bone-well" suggestions={ROOM_ARCHETYPE_SUGGESTIONS} />
                </FormRow>
                <FormRow label="Force Archetype" icon="fa-lock" hint={FIELD_HELP.mapInfluenceForce}>
                  <select value={editableMapInfluence.forceRoomArchetype ? "true" : "false"} onChange={(event) => setMapInfluenceField(["forceRoomArchetype"], event.target.value === "true")}>
                    <option value="false">Recommend only</option>
                    <option value="true">Force selected archetype</option>
                  </select>
                </FormRow>
                <FormRow label="Weight" icon="fa-scale-balanced" hint={FIELD_HELP.mapInfluenceWeight}>
                  <input type="number" min="0" step="0.25" value={editableMapInfluence.weight ?? ""} onChange={(event) => setMapInfluenceField(["weight"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="2" />
                </FormRow>
                <FormRow label="Influence Source" icon="fa-fingerprint" hint={FIELD_HELP.mapInfluenceSource}>
                  <TextInput value={editableMapInfluence.source} onChange={(value) => setMapInfluenceField(["source"], value)} placeholder={component.id} />
                </FormRow>
              </div>
              <FormRow label="Influence Note" icon="fa-note-sticky" hint={FIELD_HELP.mapInfluenceNote}>
                <TextArea rows={2} value={editableMapInfluence.note} onChange={(value) => setMapInfluenceField(["note"], value)} placeholder="Explain why this component should change the generated room archetype." />
              </FormRow>
            </RulesGroup>
          ) : null}
        </div>
      ) : null}

      {!isMonsterGraft ? (
        <>
          <RulesGroup zone="qa" icon="fa-code" title="Raw Component JSON" help="Read-only component payload for debugging saved data and future Supabase migration checks.">
            <FormRow label="Raw JSON" icon="fa-code" hint="Read-only JSON for the selected component. Use this only for debugging.">
              <TextArea className="studio-generated-preview studio-raw-json-preview" rows={16} readOnly value={JSON.stringify(component, null, 2)} />
            </FormRow>
          </RulesGroup>
          <RulesGroup zone="qa" icon="fa-trash" title="Danger Zone" help="Remove this component from the current Inspiration Module.">
            <ArmedDeleteButton onConfirm={onRemove} />
          </RulesGroup>
        </>
      ) : null}
    </div>
  );
}
