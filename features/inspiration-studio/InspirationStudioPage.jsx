import { useEffect, useMemo, useRef, useState } from "react";
import {
  SPELLS_5E24,
  SHARED_TAXONOMIES,
  SHARED_DARKEN_LOCATION_SLOTS,
  SHARED_MONSTER_SLOTS,
  SPELLS_5E24_LEVEL_OPTIONS,
  SPELLS_5E24_SCHOOL_OPTIONS,
  ROOM_ARCHETYPE_OPTIONS,
  ROOM_DESIGN_MODIFIER_OPTIONS,
  ROOM_DESIGN_SHAPE_KIND_OPTIONS,
  buildInspirationAssetUrl,
  compileRoomArchetypeToRoomDesign,
  getSpell5e24Name,
  loadContentPackSummaries,
  loadInspirationModules,
  normalizeRoomDesign,
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
  formatPlainLabel,
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
  buildComponentTemplates,
  getModuleComponentGroups,
  normalizeModuleForDraft,
  syncDraftIdentityIds,
} from "./model/studio-draft.js";
import {
  buildContentPackExport,
  buildModuleExport,
  downloadJsonFile,
  downloadSemanticJsonFile,
  serializeStudioExport,
} from "./model/studio-export.js";
import {
  getStudioComponentFamily,
  getStudioEditorDefinition,
} from "./model/studio-editor-registry.js";
import { isStudioSpecializedSemanticType } from "./schema/studio-semantic-editor-registry.js";
import { StudioSemanticComponentEditor } from "./editors/StudioSemanticComponentEditor.jsx";
import InspirationCardFront from "../inspirations/components/InspirationCardFront.jsx";
import { getInspirationCardMeta } from "../inspirations/inspirations.card-config.js";
import {
  StudioArmedDeleteButton,
  StudioCollapsibleSection,
  StudioDividerLabel,
  StudioField,
  StudioHelp,
  StudioIcon,
  StudioIconButton,
  StudioInput,
  StudioPanelTitle,
  StudioSelect,
  StudioTab,
  StudioTextarea,
  StudioWarningSummary,
  openStudioDisclosuresForField,
} from "./ui/index.js";
import { importStudioSemanticContent } from "./model/studio-v2-io.js";
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
import { StudioDarkPlacesPreview } from "./preview/StudioDarkPlacesPreview.jsx";
import { DarkPlacesSemanticQaModal } from "./qa/DarkPlacesSemanticQaModal.jsx";
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


function resolveStudioInspirationImageSource(media = {}) {
  const directUrl = String(media?.imageUrl || "").trim();
  if (directUrl) return directUrl;

  const imageKey = String(media?.imageKey || "").trim();
  if (!imageKey) return "";

  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(imageKey)) {
    return imageKey;
  }

  const provider = String(media?.imageProvider || "local")
    .trim()
    .toLowerCase();
  if (provider && provider !== "local") return "";

  return buildInspirationAssetUrl(imageKey);
}

const ROOM_DESIGN_SHAPE_LABELS = Object.freeze({
  rect: "Rectangular Room",
  square: "Square Room",
  hall: "Hall / Corridor",
  gallery: "Gallery",
  circle: "Circular Room",
  oval: "Oval Room",
  shaft: "Shaft / Well Room",
  "l-shape": "L-Shaped Room",
  "t-shape": "T-Shaped Room",
  cross: "Cross / Cruciform Room",
  alcove: "Alcove",
  niche: "Niche",
  archive: "Archive / Library",
  apse: "Apse",
  ritual: "Ritual Chamber",
  irregular: "Irregular Room",
  broken: "Broken / Ruined Room",
  cave: "Cave / Organic Room",
});

const ROOM_DESIGN_SHAPE_SELECT_OPTIONS = [
  ["", "Automatic Shape"],
  ...ROOM_DESIGN_SHAPE_KIND_OPTIONS.map((kind) => [kind, ROOM_DESIGN_SHAPE_LABELS[kind] || kind]),
];

const ROOM_DESIGN_PRESET_SELECT_OPTIONS = [
  ["", "No preset"],
  ...ROOM_ARCHETYPE_OPTIONS.map((option) => [option.id, option.label || option.id]),
];

const ROOM_DESIGN_SIZE_SCALE_OPTIONS = [
  ["", "Automatic"],
  ["Tiny", "Tiny"],
  ["Small", "Small"],
  ["Medium", "Medium"],
  ["Large", "Large"],
  ["Huge", "Huge"],
];

const ROOM_DESIGN_ASPECT_OPTIONS = [
  ["", "Automatic"],
  ["compact", "Compact"],
  ["square", "Square"],
  ["wide", "Wide"],
  ["tall", "Tall"],
  ["long", "Long"],
];

const ROOM_DESIGN_PROP_KIND_OPTIONS = [
  ["", "No required prop"],
  ["pit", "Well / Pit"],
  ["well", "Well / Pit (semantic)"],
  ["altar", "Altar"],
  ["reliquary", "Reliquary / Shrine (semantic)"],
  ["tomb", "Sarcophagus / Tomb"],
  ["sarcophagus", "Sarcophagus / Tomb (semantic)"],
  ["pillar", "Pillar"],
  ["statue", "Statue"],
  ["shelf", "Shelf"],
  ["chest", "Chest"],
  ["bones", "Bones"],
  ["rubble", "Rubble"],
  ["crack", "Crack"],
  ["fog", "Fog"],
  ["desk", "Desk"],
  ["table", "Table"],
  ["fireplace", "Fireplace"],
  ["bed", "Bed"],
  ["pew", "Pew"],
];

const ROOM_DESIGN_PROP_KIND_LABEL_BY_ID = Object.freeze(
  ROOM_DESIGN_PROP_KIND_OPTIONS.reduce((labels, [id, label]) => {
    if (id) labels[id] = label;
    return labels;
  }, {}),
);

const ROOM_DESIGN_PLACEMENT_OPTIONS = [
  ["center", "Center"],
  ["near-center", "Near Center"],
  ["far-wall", "Far Wall"],
  ["near-wall", "Near Wall"],
  ["north-wall", "North Wall"],
  ["south-wall", "South Wall"],
  ["east-wall", "East Wall"],
  ["west-wall", "West Wall"],
  ["corner", "Corner"],
  ["random", "Random"],
];

const ROOM_DESIGN_BRANCH_BIAS_OPTIONS = [
  ["", "Automatic"],
  ["main", "Prefer Main Path"],
  ["side", "Prefer Side Branch"],
  ["secret", "Prefer Secret Branch"],
  ["terminal", "Prefer Terminal Branch"],
];

const ROOM_DESIGN_DEPTH_BIAS_OPTIONS = [
  ["", "Automatic"],
  ["early", "Early"],
  ["mid", "Middle"],
  ["deep", "Deep"],
];

const ROOM_DESIGN_SECRET_OPTIONS = [
  ["", "Automatic"],
  ["true", "Secret"],
  ["false", "Not Secret"],
];

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
    id: "preview",
    label: "Preview",
    icon: "fa-eye",
    hint: "Deterministic compiled Dark Places Overview, At the Table, and room output.",
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
    label: "Content Pack v0.2",
    icon: "fa-box-open",
    description: "Canonical semantic v2 pack. Studio never emits the legacy collections shape.",
  },
  {
    id: "module",
    label: "Inspiration Module v2",
    icon: "fa-file-code",
    description: "Canonical v2 module with schema discriminants and semantic payloads.",
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
  ["in-review", "In Review"],
  ["retired", "Retired"],
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

const MONSTER_MULTIATTACK_PARTICIPATION_ROLE_OPTIONS = [
  ["primary", "Primary Attack"],
  ["choice", "Any-Combination Choice"],
  ["replacement", "Replacement Ability"],
  ["additionalAbility", "Additional Ability"],
  ["excluded", "Excluded"],
];

const MONSTER_MULTIATTACK_PARTICIPATION_AVAILABILITY_OPTIONS = [
  ["always", "Always"],
  ["ifAvailable", "If Available"],
];

const MONSTER_MULTIATTACK_PARTICIPATION_TIMING_OPTIONS = [
  ["beforeAttacks", "Before Attacks"],
  ["afterAttacks", "After Attacks"],
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
  multiattack: "Advanced manual override for exceptional Multiattack routines. Normal attack actions should use Automatic Multiattack Participation instead, so the composer can assemble the final routine across different grafts.",
  multiattackParticipation: "Controls whether this individual action can be selected by the automatic build-level Multiattack planner.",
  multiattackParticipationRole: "Primary attacks are assigned fixed uses; Choice attacks can be used in any combination; Replacement and Additional abilities are referenced without being repeated as ordinary attacks.",
  multiattackParticipationMaxUses: "Maximum times this action can appear in one routine. Use 1 for attacks with major or severe riders.",
  multiattackParticipationGroup: "Stable semantic group used when several grafts form one choice or attack family.",
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
  roomDesignShape: "Structured roomDesign shape primitive. Prefer this over text-only shape notes when the map needs a specific geometry.",
  roomDesignSize: "Optional hard constraints for the generated room footprint, in grid cells.",
  roomDesignProps: "Required map props that should always be placed in this room, independent of the archetype preset.",
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

const ROOM_ARCHETYPE_LABEL_BY_ID = Object.freeze(
  ROOM_ARCHETYPE_OPTIONS.reduce((labels, option) => {
    labels[option.id] = option.label || option.id;
    return labels;
  }, {}),
);

function uniqueStrings(values = []) {
  return [...new Set(asArray(values).map((value) => String(value || "").trim()).filter(Boolean))];
}

function getRoomArchetypeLabel(value) {
  const id = String(value || "").trim();
  if (!id) return "Auto / Inferred";
  return ROOM_ARCHETYPE_LABEL_BY_ID[id] || id;
}

function getMapInfluenceEditorModel(mapInfluence = {}, { regionRoomArchetype = "" } = {}) {
  const directRoomArchetype = String(
    mapInfluence.roomArchetype ||
      mapInfluence.roomArchetypeId ||
      mapInfluence.forcedRoomArchetype ||
      mapInfluence.forcedRoomArchetypeId ||
      "",
  ).trim();
  const preferredRoomArchetypes = uniqueStrings([
    directRoomArchetype,
    mapInfluence.preferredRoomArchetype,
    mapInfluence.preferredRoomArchetypeId,
    ...asArray(mapInfluence.preferredRoomArchetypes),
    ...asArray(mapInfluence.preferredRoomArchetypeIds),
  ]);
  const forbiddenRoomArchetypes = uniqueStrings([
    mapInfluence.forbiddenRoomArchetype,
    mapInfluence.forbiddenRoomArchetypeId,
    ...asArray(mapInfluence.forbiddenRoomArchetypes),
    ...asArray(mapInfluence.forbiddenRoomArchetypeIds),
  ]);
  const forced = Boolean(
    mapInfluence.forceRoomArchetype ||
      mapInfluence.force ||
      mapInfluence.required ||
      mapInfluence.forcedRoomArchetype ||
      mapInfluence.forcedRoomArchetypeId,
  );
  const conflicts = preferredRoomArchetypes.filter((id) => forbiddenRoomArchetypes.includes(id));
  const hasTarget = Boolean(directRoomArchetype || preferredRoomArchetypes.length || forbiddenRoomArchetypes.length);
  const targetId = directRoomArchetype || preferredRoomArchetypes[0] || regionRoomArchetype || "";
  const targetLabel = getRoomArchetypeLabel(targetId);
  const preferredLabels = preferredRoomArchetypes.map(getRoomArchetypeLabel);
  const forbiddenLabels = forbiddenRoomArchetypes.map(getRoomArchetypeLabel);
  const mode = forced && targetId ? "Forced" : preferredRoomArchetypes.length || directRoomArchetype ? "Suggested" : forbiddenRoomArchetypes.length ? "Forbid only" : "Inactive";
  const summary = mode === "Inactive"
    ? "No map influence is set. This component will not shape a generated room."
    : mode === "Forbid only"
      ? `Forbids ${forbiddenLabels.join(", ")}.`
      : `${mode} ${targetLabel}${preferredLabels.length > 1 ? `; alternatives: ${preferredLabels.slice(1).join(", ")}` : ""}${forbiddenLabels.length ? `; forbids ${forbiddenLabels.join(", ")}` : ""}.`;

  return {
    conflicts,
    directRoomArchetype,
    forbiddenLabels,
    forbiddenRoomArchetypes,
    forced,
    hasTarget,
    mode,
    preferredLabels,
    preferredRoomArchetypes,
    summary,
    targetId,
    targetLabel,
  };
}


function getRoomDesignShapeLabel(kind = "") {
  const id = String(kind || "").trim();
  return ROOM_DESIGN_SHAPE_LABELS[id] || id || "Automatic";
}

function getRoomDesignPropLabel(kind = "") {
  const id = String(kind || "").trim();
  return ROOM_DESIGN_PROP_KIND_LABEL_BY_ID[id] || id || "No prop";
}

function formatRoomDesignNumber(value) {
  return Number.isFinite(Number(value)) ? String(value) : "";
}

function getRoomDesignEditorModel(roomDesign = {}) {
  const normalized = normalizeRoomDesign(roomDesign) || {};
  const shape = normalized.shape || {};
  const size = normalized.size || {};
  const props = normalized.props || {};
  const requiredProps = asArray(props.required);
  const modifiers = uniqueStrings([
    ...asArray(normalized.modifiers),
    ...asArray(shape.modifiers),
  ]);
  const topology = normalized.topology || {};
  const summaryParts = [];
  if (shape.kind) summaryParts.push(getRoomDesignShapeLabel(shape.kind));
  if (size.scale) summaryParts.push(`${size.scale} scale`);
  if (size.aspectRatio) summaryParts.push(`${size.aspectRatio} proportion`);
  if (Number.isFinite(Number(size.minDiameterCells))) summaryParts.push(`min diameter ${size.minDiameterCells}`);
  else if (Number.isFinite(Number(size.minWidthCells)) || Number.isFinite(Number(size.minHeightCells))) {
    summaryParts.push(`min ${size.minWidthCells || "?"}×${size.minHeightCells || "?"}`);
  }
  if (Number.isFinite(Number(size.minAreaCells))) summaryParts.push(`min area ${size.minAreaCells}`);
  if (modifiers.length) summaryParts.push(`modifiers: ${modifiers.join(", ")}`);
  if (requiredProps.length) {
    summaryParts.push(`requires: ${requiredProps.map((prop) => `${getRoomDesignPropLabel(prop.kind)}${prop.placement ? ` @ ${prop.placement}` : ""}`).join(", ")}`);
  }
  if (topology.branchBias || topology.depthBias || topology.secret !== undefined) {
    summaryParts.push(`topology: ${[topology.branchBias, topology.depthBias, topology.secret === true ? "secret" : topology.secret === false ? "not secret" : ""].filter(Boolean).join(" / ")}`);
  }
  return {
    normalized,
    shape,
    size,
    requiredProps,
    modifiers,
    topology,
    hasDesign: Boolean(summaryParts.length),
    summary: summaryParts.length ? summaryParts.join(" · ") : "No roomDesign set. Shape, size, props, and topology will be inferred.",
  };
}

function getMapInfluenceSourceFallback(component = {}) {
  return component.id ? `studio:${component.id}` : "studio:component";
}

function getComponentEditorTabs(component = {}) {
  if (getStudioComponentFamily(component) === "monster-graft") return COMPONENT_EDITOR_TABS;
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

function getInspirationStatusForModuleStatus(status = "draft") {
  if (status === "published") return "approved";
  if (status === "retired") return "rejected";
  return status === "in-review" ? "in-review" : "draft";
}

function getStatusIconName(status = "draft") {
  if (status === "published") return "fa-circle-check";
  if (status === "in-review") return "fa-magnifying-glass";
  if (status === "retired") return "fa-box-archive";
  return "fa-pen-ruler";
}

function getLibraryStatusFilterIcon(filterId = "all") {
  if (filterId === "published") return "fa-circle-check";
  if (filterId === "draft") return "fa-pen-ruler";
  if (filterId === "in-review") return "fa-magnifying-glass";
  if (filterId === "retired") return "fa-box-archive";
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
            <StudioIcon name={icon} />
            <span>{tag}</span>
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
              <StudioIcon name="fa-xmark" />
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
          <StudioIcon name={icon} />
        </button>
      ))}
    </div>
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
          <StudioIcon name="fa-pen" /> Edit
        </button>
      </div>
    );
  }

  return (
    <div className="studio-editable-textbox is-editing">
      {onApplyToken ? <MarkdownToolbar onApply={onApplyToken} /> : null}
      {isMultiline ? (
        <StudioTextarea rows={rows} value={displayValue} onChange={onChange} />
      ) : (
        <StudioInput value={displayValue} onChange={onChange} />
      )}
      <div className="studio-editable-textbox__actions">
        <button type="button" className="studio-inline-action studio-inline-action--compact" onClick={() => setIsEditing(false)}>
          <StudioIcon name="fa-check" /> Done
        </button>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <span className="studio-stat-pill">
      <StudioIcon name={icon} />
      <em>{label}</em>
      <strong>{value}</strong>
    </span>
  );
}

function getSectionCount(sectionId, draft, componentGroups, validationReport) {
  if (sectionId === "components") return asArray(draft.components).length;
  if (sectionId === "preview") {
    return asArray(draft.components).filter((component) =>
      asArray(component.workflows).includes("darken-location"),
    ).length;
  }
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
  const sourceType = draft.inspiration.sourceTypes?.[0] || "Source Anchor";

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
          <StudioIcon name={readinessIcon} />
          <span>{(summary.error || 0) + (summary.warning || 0)}</span>
        </div>
        <span className="studio-collapsed-rail-label" aria-hidden="true">Inspiration Preview</span>
      </aside>
    );
  }

  return (
    <aside className="studio-right-rail" aria-label="Inspiration preview and readiness">
      <div className="studio-right-rail__topline">
        <span><StudioIcon name="fa-eye" /> Preview Rail</span>
        <button
          className="studio-right-rail__collapse"
          type="button"
          aria-label="Collapse preview and publish readiness"
          title="Collapse preview and publish readiness"
          aria-pressed="false"
          onClick={onToggleCollapsed}
        >
          <StudioIcon name="fa-chevron-right" />
        </button>
      </div>

      <section className="studio-rail-card studio-rail-card--preview">
        <span className="studio-rail-card__eyebrow"><StudioIcon name="fa-book-skull" /> Public Preview</span>
        <div className="studio-card-preview studio-card-preview--rail" aria-label="Public 4:5 inspiration card preview">
          {imageSource ? (
            <img src={imageSource} alt={draft.inspiration.media?.imageAlt || `${draft.title} preview`} />
          ) : (
            <div className="studio-card-preview__empty">
              <StudioIcon name="fa-image" />
              <span>No Image Preview</span>
            </div>
          )}
          <div className="studio-card-preview__caption">
            <strong>{draft.title}</strong>
            <em>{sourceType}</em>
          </div>
        </div>
        <p>{draft.inspiration.editorial?.deck || draft.sourceAnchor.summary || "No public summary yet."}</p>
      </section>

      <section className="studio-rail-card studio-rail-card--status" data-readiness-state={readinessState}>
        <span className="studio-rail-card__eyebrow"><StudioIcon name="fa-shield-halved" /> Publish Readiness</span>
        <div className="studio-rail-readiness-line">
          <StudioIcon name={readinessIcon} />
          <strong>{readinessLabel}</strong>
          <span>{summary.error || 0} errors · {summary.warning || 0} warnings</span>
        </div>
        <button className="studio-rail-download-report" type="button" onClick={onDownloadReadinessReport}>
          <StudioIcon name="fa-file-arrow-down" /> Download Readiness JSON
        </button>
        {groupedIssues.length ? (
          <div className="studio-rail-issues studio-rail-issues--grouped">
            {groupedIssues.map((group) => {
              const meta = VALIDATION_SEVERITY_META[group.severity] || VALIDATION_SEVERITY_META.warning;
              return (
                <span className={`studio-rail-issue-group studio-rail-issue-group--${group.severity}`} key={group.key}>
                  <em><StudioIcon name={meta.icon} /> {group.count > 1 ? `${group.count}×` : meta.label}</em>
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
        <span className="studio-rail-card__eyebrow"><StudioIcon name="fa-diagram-project" /> Linked Content</span>
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

function IconOnlyRemoveButton({ label, onClick, disabled = false }) {
  return (
    <StudioIconButton
      className="studio-rules-block-remove"
      disabled={disabled}
      icon="fa-trash"
      label={`Remove ${label}`}
      onClick={onClick}
    />
  );
}

function RemoveRulesBlockButton({ label, onClick }) {
  return <IconOnlyRemoveButton label={label} onClick={onClick} />;
}

function getInitialComponentWorkspaceState(draft = {}) {
  const groups = getModuleComponentGroups(draft);
  const monsterComponents = groups["monster-graft"] || [];
  const locationComponents = [
    ...(groups["location-component"] || []),
    ...(groups["location-region"] || []),
  ];
  const mode = monsterComponents.length ? "monsters" : "locations";
  const components = mode === "monsters" ? monsterComponents : locationComponents;

  return {
    mode,
    selectedComponentId: components[0]?.id || null,
  };
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
  const [importState, setImportState] = useState({ state: "idle", message: "" });
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
  const [isSemanticQaOpen, setSemanticQaOpen] = useState(false);
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
      const initialWorkspace = getInitialComponentWorkspaceState(firstModule);
      setSelectedModuleId(firstModule.id);
      setDraft(firstModule);
      setComponentMode(initialWorkspace.mode);
      setSelectedComponentId(initialWorkspace.selectedComponentId);
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
    if (locationFilter === "location-component") return items.filter((component) => getStudioComponentFamily(component) === "location-component");
    if (locationFilter === "location-region") return items.filter((component) => getStudioComponentFamily(component) === "location-region");
    return items;
  }, [componentGroups, locationFilter]);
  const activeComponentPool = componentMode === "monsters" ? monsterComponents : locationComponents;
  const visibleComponents = activeComponentPool.filter((component) => matchesComponentSearch(component, componentSearch));
  const selectedComponent =
    activeComponentPool.find((component) => component.id === selectedComponentId) ||
    visibleComponents[0] ||
    null;
  const moduleExportObject = useMemo(() => buildModuleExport(draft, imagePreviewUrl), [draft, imagePreviewUrl]);
  const contentPackExportObject = useMemo(() => buildContentPackExport(draft, imagePreviewUrl), [draft, imagePreviewUrl]);
  const validationReport = useMemo(() => validateStudioDraft(draft, contentPackExportObject), [draft, contentPackExportObject]);
  const studioWarnings = useMemo(() => buildStudioWarningsFromValidation(validationReport, draft), [validationReport, draft]);
  const monsterQaReport = useMemo(() => runMonsterQaSuite({ mode: "admin-studio" }), []);
  const moduleExportJson = useMemo(() => serializeStudioExport(moduleExportObject), [moduleExportObject]);
  const contentPackExportJson = useMemo(() => serializeStudioExport(contentPackExportObject), [contentPackExportObject]);
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
      nextDraft.monsterGrafts = nextDraft.components.filter((component) => getStudioComponentFamily(component) === "monster-graft");
      nextDraft.locationComponents = nextDraft.components.filter((component) => getStudioComponentFamily(component) === "location-component");
      nextDraft.locationRegions = nextDraft.components.filter((component) => getStudioComponentFamily(component) === "location-region");
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
    const initialWorkspace = getInitialComponentWorkspaceState(nextDraft);
    setSelectedModuleId(moduleId);
    setDraft(nextDraft);
    setComponentMode(initialWorkspace.mode);
    setLocationFilter("all");
    setComponentSearch("");
    setSelectedComponentId(initialWorkspace.selectedComponentId);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl("");
  }

  function handleTitleChange(value) {
    updateDraft((nextDraft) => {
      nextDraft.title = value;
      nextDraft.sourceAnchor.title = value;
      nextDraft.sourceAnchor.citation = nextDraft.sourceAnchor.citation || {};
      nextDraft.sourceAnchor.citation.label = value;
      nextDraft.inspiration.title = value;
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
      nextDraft.inspiration.media.imageAlt = nextDraft.inspiration.media.imageAlt || `${nextDraft.title} inspiration image.`;
    });
  }

  function addComponent(templateId) {
    const componentsToAdd = buildComponentTemplates(templateId, draft);
    const primaryComponent = componentsToAdd[0];
    if (!primaryComponent) return;
    const componentFamily = getStudioComponentFamily(primaryComponent);
    const addedComponentFamilies = new Set(componentsToAdd.map(getStudioComponentFamily));
    setActiveSection("components");
    setComponentMode(componentFamily === "monster-graft" ? "monsters" : "locations");
    setLocationFilter(
      addedComponentFamilies.has("location-region") && addedComponentFamilies.has("location-component")
        ? "all"
        : componentFamily === "location-region"
          ? "location-region"
          : componentFamily === "location-component"
            ? "location-component"
            : "all",
    );
    setComponentSearch("");
    setSelectedComponentId(primaryComponent.id);
    updateDraft((nextDraft) => {
      nextDraft.components.unshift(...componentsToAdd);
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

  async function importStudioJson(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = importStudioSemanticContent(await file.text());
    if (!result.selectedModule) {
      setImportState({
        state: "error",
        message: result.diagnostics[0]?.message || "The selected file is not a supported Studio module or pack.",
      });
      return;
    }

    const importedModules = result.modules.map((module) =>
      normalizeModuleForDraft(module, {
        importResult: { ...result, selectedModule: module },
      }),
    );
    const selectedDraft = importedModules.find(
      (module) => module.id === result.selectedModule.id,
    ) || importedModules[0];
    setModules((currentModules) => {
      const importedIds = new Set(importedModules.map((module) => module.id));
      return [
        ...importedModules,
        ...currentModules.filter((module) => !importedIds.has(module.id)),
      ];
    });
    const initialWorkspace = getInitialComponentWorkspaceState(selectedDraft);
    setSelectedModuleId(selectedDraft.id);
    setDraft(selectedDraft);
    setComponentMode(initialWorkspace.mode);
    setLocationFilter("all");
    setComponentSearch("");
    setSelectedComponentId(initialWorkspace.selectedComponentId);
    setImportState({
      state: result.mode === "v1-compatibility" ? "transitional" : "success",
      message: result.mode === "v1-compatibility"
        ? "Legacy module loaded as a v2 transitional draft. Export remains v2-only."
        : `${result.kind === "content-pack" ? "Content Pack" : "Inspiration Module"} v2 imported.`,
    });
  }

  function downloadCurrentSemanticExport() {
    const payload = exportMode === "module"
      ? moduleExportObject
      : contentPackExportObject;
    const suffix = exportMode === "module" ? "module-v2" : "content-pack-v0.2";
    downloadSemanticJsonFile(`${slugify(draft.title)}-${suffix}.json`, payload);
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
  const imageSource =
    imagePreviewUrl ||
    resolveStudioInspirationImageSource(draft.inspiration?.media);

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
            <StudioIcon name="fa-screwdriver-wrench" /> Admin Content Studio
          </span>
          <h1>Editing: {draft.title}</h1>
        </div>
        <div className="inspiration-studio__quick-meta inspiration-studio__quick-meta--header" aria-label="Current module status and studio tools">
          <span><StudioIcon name="fa-box-open" /> {packTitle}</span>
          <span><StudioIcon name="fa-circle-check" /> {draft.status || "draft"}</span>
          <span><StudioIcon name="fa-diagram-project" /> {asArray(draft.components).length} components</span>
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
            semanticQaOpen={isSemanticQaOpen}
            presets={testPresets}
            onOpenMonsterBatchQa={() => setMonsterBatchQaOpen(true)}
            onOpenMonsterPerGraftQa={() => setMonsterPerGraftQaOpen(true)}
            onOpenMapBatchQa={() => setMapBatchQaOpen(true)}
            onOpenSemanticQa={() => setSemanticQaOpen(true)}
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
              <StudioIcon name="fa-book-open" />
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
                <StudioIcon name="fa-chevron-left" />
              </button>
            ) : null}
          </div>

          {!libraryCollapsed ? (
            <>
              <div className="studio-library-controls" aria-label="Library filters">
                <label className="studio-search-field studio-search-field--library">
                  <StudioIcon name="fa-magnifying-glass" />
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
                      <StudioIcon name={getLibraryStatusFilterIcon(filterId)} />
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
                          <StudioIcon name={hasReviewIssue ? getReadinessIconFromSummary(summary) : getStatusIconName(status)} />
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
              <StudioIcon name="fa-book-skull" />
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
              <StudioTab
                key={section.id}
                icon={section.icon}
                active={activeSection === section.id}
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

            {activeSection === "preview" ? (
              <div className="inspiration-studio__workspace inspiration-studio__workspace--preview">
                <section
                  className="studio-panel studio-panel--semantic-preview"
                  aria-label="Compiled Dark Places preview"
                >
                  <StudioPanelTitle
                    eyebrow="Compiler Preview"
                    icon="fa-wand-magic-sparkles"
                    title="Deterministic Dark Places Sample"
                    help="Compiles the current canonical v2 Studio export through the real Dark Places compiler using a deterministic sample room program."
                  />
                  <StudioDarkPlacesPreview
                    module={moduleExportObject}
                    pack={contentPackExportObject}
                  />
                </section>
              </div>
            ) : null}

            {activeSection === "review" ? (
              <ExportWorkspace
                contentPackExportJson={contentPackExportJson}
                copyState={copyState}
                exportJson={exportJson}
                exportMode={exportMode}
                moduleExportJson={moduleExportJson}
                onCopy={copyExportJson}
                onDownloadExport={downloadCurrentSemanticExport}
                onDownloadReadinessReport={downloadReadinessReport}
                onImport={importStudioJson}
                onExportModeChange={setExportMode}
                importState={importState}
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
      <DarkPlacesSemanticQaModal
        isOpen={isSemanticQaOpen}
        module={moduleExportObject}
        pack={contentPackExportObject}
        onClose={() => setSemanticQaOpen(false)}
      />
    </section>
  );
}

function IdentityWorkspace({ draft, identityIdsUnlocked = false, imageSource, mode = "source", modules = [], onIdentityIdsRelock, onIdentityIdsUnlock, onImageUpload, onTitleChange, updateArrayField, updateDraft, updateDraftField }) {
  const [mediaPreviewMode, setMediaPreviewMode] = useState("card");
  const previewInspiration = useMemo(
    () => ({
      ...draft.inspiration,
      title: draft.title || draft.inspiration?.title,
      label: draft.title || draft.inspiration?.label,
      media: {
        ...draft.inspiration?.media,
        imageUrl: imageSource,
      },
    }),
    [draft.inspiration, draft.title, imageSource],
  );
  const previewCardMeta = useMemo(
    () =>
      getInspirationCardMeta(previewInspiration, {
        collectionLabel:
          previewInspiration.card?.collectionLabel ||
          draft.packId ||
          "Existing Inspirations",
      }),
    [draft.packId, previewInspiration],
  );
  const taxonomyOptions = buildTaxonomyOptions(modules);

  function updateTaxonomyField(field, values) {
    updateDraft((nextDraft) => {
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
      nextDraft.inspiration.editorial = nextDraft.inspiration.editorial || {};
      const currentValue = nextDraft.inspiration.editorial.deck || nextDraft.sourceAnchor.summary || "";
      const nextValue = `${currentValue}${currentValue ? "\n" : ""}${token}`;
      nextDraft.inspiration.editorial.deck = nextValue;
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
          <StudioPanelTitle eyebrow="Step 1" icon="fa-id-card-clip" title="Source Setup" help="Set the editorial identity first: name, pack, and publication status. Technical IDs stay under Advanced unless you need them." />

          <div className="studio-form-grid studio-form-grid--primary">
            <StudioField label="Inspiration Name" icon="fa-signature" hint={FIELD_HELP.inspirationName}>
              <EditableTextBox value={draft.title} placeholder="Untitled inspiration" onChange={onTitleChange} />
            </StudioField>
            <StudioField label="Collection / Pack" icon="fa-layer-group" hint={FIELD_HELP.packId}>
              <StudioInput list="studio-pack-options" value={draft.packId} onChange={(value) => updateDraftField(["packId"], value)} />
            </StudioField>
            <StudioField label="Status" icon="fa-circle-check" hint={FIELD_HELP.status} helpItems={STATUS_TOOLTIP_ITEMS}>
              <select value={draft.status} onChange={(event) => {
                const value = event.target.value;
                updateDraft((nextDraft) => {
                  nextDraft.status = value;
                  nextDraft.sourceAnchor.status = value;
                  nextDraft.inspiration.status = getInspirationStatusForModuleStatus(value);
                });
              }}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </StudioField>
          </div>

          <datalist id="studio-pack-options">
            <option value="core-cruor" />
            <option value="existing-inspirations" />
            <option value="decomposition-inspiration-module" />
            <option value="sedlec-ossuary-inspiration-module" />
          </datalist>

          <details className="studio-advanced-details">
            <summary><StudioIcon name="fa-gear" /> Advanced identity fields</summary>
            <div className="studio-lockable-fields">
              <div className="studio-lockable-fields__status">
                <span><StudioIcon name={identityIdsUnlocked ? "fa-lock-open" : "fa-lock"} /> {identityIdsUnlocked ? "Manual ID override enabled" : "IDs generated from Inspiration Name"}</span>
                <button type="button" onClick={identityIdsUnlocked ? onIdentityIdsRelock : onIdentityIdsUnlock}>
                  <StudioIcon name={identityIdsUnlocked ? "fa-wand-magic-sparkles" : "fa-lock-open"} />
                  {identityIdsUnlocked ? "Regenerate & Lock" : "Unlock Override"}
                </button>
              </div>
              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Source Anchor ID" icon="fa-fingerprint" hint={FIELD_HELP.sourceAnchorId}>
                  <StudioInput readOnly={!identityIdsUnlocked} value={draft.sourceAnchor.id} onChange={updateManualSourceAnchorId} />
                </StudioField>
                <StudioField label="Inspiration Card ID" icon="fa-fingerprint" hint="Stable ID for the public inspiration card object.">
                  <StudioInput readOnly={!identityIdsUnlocked} value={draft.inspiration.id} onChange={(value) => updateDraftField(["inspiration", "id"], value)} />
                </StudioField>
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
          <StudioPanelTitle eyebrow="Step 2" icon="fa-align-left" title="Public Card" help={SECTION_HELP.publicCopy} />

          <StudioField label="Public Summary" icon="fa-quote-left" hint={FIELD_HELP.publicSummary}>
            <EditableTextBox
              rows={5}
              value={draft.inspiration.editorial?.deck || draft.sourceAnchor.summary}
              placeholder="No public summary set."
              onApplyToken={appendPublicSummaryMarkdown}
              onChange={(value) => {
                updateDraft((nextDraft) => {
                  nextDraft.inspiration.editorial = nextDraft.inspiration.editorial || {};
                  nextDraft.inspiration.editorial.deck = value;
                  nextDraft.sourceAnchor.summary = value;
                });
              }}
            />
          </StudioField>

          <StudioField label="Why It Disturbs / Narrative" icon="fa-book-skull" hint={FIELD_HELP.narrative}>
            <EditableTextBox
              rows={7}
              value={draft.inspiration.editorial?.whyItDisturbs}
              placeholder="No narrative text set."
              onApplyToken={(token) => appendMarkdown(["inspiration", "editorial", "whyItDisturbs"], token)}
              onChange={(value) => updateDraftField(["inspiration", "editorial", "whyItDisturbs"], value)}
            />
          </StudioField>
        </section>

        <section className="studio-panel studio-panel--media" aria-label="Card image">
          <StudioPanelTitle eyebrow="Archive Image" icon="fa-image" title="Preview & Asset" help={SECTION_HELP.media} />

          <div className="studio-media-preview">
            <div
              className="studio-media-preview__tabs"
              role="tablist"
              aria-label="Archive image preview mode"
            >
              <StudioTab
                icon="fa-image"
                active={mediaPreviewMode === "image"}
                label="Original Image"
                hint="Inspect the resolved 4:5 image without card framing."
                onClick={() => setMediaPreviewMode("image")}
              />
              <StudioTab
                icon="fa-id-card"
                active={mediaPreviewMode === "card"}
                label="Card Preview"
                hint="Inspect the exact public Inspirations card front."
                onClick={() => setMediaPreviewMode("card")}
              />
            </div>

            <div
              className="studio-media-preview__stage"
              data-preview-mode={mediaPreviewMode}
              role="tabpanel"
              aria-label={
                mediaPreviewMode === "card"
                  ? "Public inspiration card preview"
                  : "Original inspiration image preview"
              }
            >
              {mediaPreviewMode === "card" ? (
                <InspirationCardFront
                  inspiration={previewInspiration}
                  meta={previewCardMeta}
                  className="studio-media-preview__public-card"
                />
              ) : (
                <div className="studio-media-preview__image">
                  {imageSource ? (
                    <img
                      src={imageSource}
                      alt={
                        draft.inspiration.media?.imageAlt ||
                        `${draft.title} preview`
                      }
                    />
                  ) : (
                    <div className="studio-card-preview__empty">
                      <StudioIcon name="fa-image" />
                      <span>No Image Preview</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <StudioField label="Upload Preview Image" icon="fa-upload" hint={FIELD_HELP.uploadPreview}>
            <input type="file" accept="image/*" onChange={onImageUpload} />
          </StudioField>

          <details className="studio-advanced-details">
            <summary><StudioIcon name="fa-gear" /> Advanced asset fields</summary>
            <StudioField label="Image Key / Filename" icon="fa-file-image" hint={FIELD_HELP.imageKey}>
              <StudioInput value={draft.inspiration.media?.imageKey} onChange={(value) => updateDraftField(["inspiration", "media", "imageKey"], value)} />
            </StudioField>
            <StudioField label="Image Provider" icon="fa-link" hint="Stable provider or asset-library identifier; preview URLs are never serialized.">
              <StudioInput value={draft.inspiration.media?.imageProvider} onChange={(value) => updateDraftField(["inspiration", "media", "imageProvider"], value)} />
            </StudioField>
            <StudioField label="Image Credit" icon="fa-heading" hint="Required editorial credit or rights attribution when applicable.">
              <StudioInput value={draft.inspiration.media?.imageCredit} onChange={(value) => updateDraftField(["inspiration", "media", "imageCredit"], value)} />
            </StudioField>
            <StudioField label="Image Alt" icon="fa-closed-captioning" hint="Accessible alt text for the archive image preview and published card.">
              <StudioInput value={draft.inspiration.media?.imageAlt} onChange={(value) => updateDraftField(["inspiration", "media", "imageAlt"], value)} />
            </StudioField>
            <StudioField label="Icon" icon="fa-icons" hint="Optional semantic icon identifier used by Archive views.">
              <StudioInput value={draft.inspiration.media?.icon} onChange={(value) => updateDraftField(["inspiration", "media", "icon"], value)} />
            </StudioField>
          </details>
        </section>
      </div>
    );
  }

  return (
    <div className="inspiration-studio__workspace inspiration-studio__workspace--taxonomy">
      <section className="studio-panel studio-panel--identity" aria-label="Taxonomy">
        <StudioPanelTitle eyebrow="Step 3" icon="fa-tags" title="Taxonomy" help={SECTION_HELP.taxonomy} />
        <p className="studio-panel-note">Use comma-separated chips. These drive filtering, inspiration discovery, and default component inheritance.</p>

        <div className="studio-form-grid studio-form-grid--taxonomy">
          <StudioField label="Source Types" icon="fa-folder-tree" hint={FIELD_HELP.sourceTypes}>
            <TagPillInput
              allowCustom={false}
              fieldId="source-types"
              icon={TAXONOMY_PILL_ICONS.sourceTypes}
              suggestions={taxonomyOptions.sourceTypes}
              value={draft.inspiration.sourceTypes}
              onChange={(values) => updateTaxonomyField("sourceTypes", values)}
              placeholder="Add allowed source type…"
            />
          </StudioField>
          <StudioField label="Themes" icon="fa-moon" hint={FIELD_HELP.themes}>
            <TagPillInput
              fieldId="themes"
              icon={TAXONOMY_PILL_ICONS.themes}
              suggestions={taxonomyOptions.themes}
              value={draft.inspiration.themes}
              onChange={(values) => updateTaxonomyField("themes", values)}
              placeholder="Add theme…"
            />
          </StudioField>
          <StudioField label="Motifs" icon="fa-eye" hint={FIELD_HELP.motifs}>
            <TagPillInput
              fieldId="motifs"
              icon={TAXONOMY_PILL_ICONS.motifs}
              suggestions={taxonomyOptions.motifs}
              value={draft.inspiration.motifs}
              onChange={(values) => updateTaxonomyField("motifs", values)}
              placeholder="Add motif…"
            />
          </StudioField>
          <StudioField label="Horror Tags" icon="fa-droplet" hint={FIELD_HELP.horrorTags}>
            <TagPillInput
              allowCustom={false}
              fieldId="horror-tags"
              icon={TAXONOMY_PILL_ICONS.horror}
              suggestions={taxonomyOptions.horror}
              value={draft.inspiration.horror}
              onChange={(values) => updateTaxonomyField("horror", values)}
              placeholder="Add allowed horror tag…"
            />
          </StudioField>
        </div>
      </section>
    </div>
  );
}

function getComponentGroupMeta(component = {}) {
  const type = getStudioComponentFamily(component);
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
      <StudioPanelTitle eyebrow="Linked Components" icon="fa-diagram-project" title="Generator Content" help={SECTION_HELP.components} />

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
                <StudioIcon name="fa-diagram-project" />
                <span>{visibleComponents.length}</span>
                <em>Component Index</em>
              </button>
            ) : (
              <>
                <div className="studio-component-list__topline-main">
                  <span><StudioIcon name="fa-list" /> Component Index</span>
                  <button
                    type="button"
                    aria-label="Collapse component list"
                    title="Collapse component list"
                    aria-pressed={componentListCollapsed}
                    onClick={() => setComponentListCollapsed(true)}
                  >
                    <StudioIcon name="fa-chevron-left" />
                  </button>
                </div>

                <div className="studio-component-toolbar">
                  <label className="studio-search-field">
                    <StudioIcon name="fa-magnifying-glass" />
                    <input value={componentSearch} onChange={(event) => onComponentSearchChange(event.target.value)} placeholder="Search components…" />
                    <StudioHelp title="Search Components" text={FIELD_HELP.componentSearch} />
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
                    <summary><StudioIcon name={activeTemplateGroup.icon} /> Create {activeTemplateGroup.label}</summary>
                    <div className="studio-component-template-group__items">
                      {activeTemplateGroup.templates.map((template) => (
                        <button key={template.id} type="button" onClick={() => confirmAddComponent(template)} title={`Create ${template.label}`}>
                          <StudioIcon name={template.icon} />
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
                <span><StudioIcon name={group.icon} /> {group.eyebrow}</span>
                <strong>{group.label}</strong>
                <em>{group.items.length}</em>
              </summary>
              <div className="studio-component-group__items">
                {group.items.map((component) => {
                  const editorDefinition = getStudioEditorDefinition(component);
                  const typeLabel = COMPONENT_TYPE_LABELS[component.contentType] || editorDefinition.label;
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
                        <StudioIcon name={COMPONENT_TYPE_ICONS[component.contentType] || "fa-puzzle-piece"} />
                        {typeLabel}{slotLabel ? ` • ${slotLabel}` : ""}
                      </span>
                      <span className="studio-list-button__topline">
                        <strong>{component.title || component.label}</strong>
                        <span className="studio-list-button__review-tools">
                          <StudioWarningBadge compact warnings={getStudioWarningsForEntry(studioWarnings, component.id)} />
                          <em aria-label={hasReviewIssue ? `${getReadinessLabelFromSummary(getIssueSummary(componentIssues))} review issue` : `${status} status`}>
                            <StudioIcon name={hasReviewIssue ? getReadinessIconFromSummary(getIssueSummary(componentIssues)) : getStatusIconName(status)} />
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
            editorDefinition={getStudioEditorDefinition(selectedComponent)}
            selectionKey={`${componentMode}:${visibleComponents.indexOf(selectedComponent)}`}
            warnings={getStudioWarningsForEntry(studioWarnings, selectedComponent.id)}
            onChange={(updater) => onUpdateComponent(selectedComponent.id, updater)}
            onRemove={() => onRemoveComponent(selectedComponent.id)}
          />
        ) : (
          <div className="studio-empty-state">No component selected.</div>
        )}

        <div className="studio-component-tabs studio-component-tabs--vertical" role="tablist" aria-label="Component families">
          <StudioTab
            icon="fa-skull"
            active={componentMode === "monsters"}
            label="Monsters"
            count={monsterComponentsCount}
            hint="Grafts consumed by Monster Composer."
            onClick={() => onComponentModeChange("monsters")}
          />
          <StudioTab
            icon="fa-map-location-dot"
            active={componentMode === "locations"}
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
  onDownloadExport,
  onDownloadReadinessReport,
  onImport,
  onExportModeChange,
  importState,
  draft,
  studioWarnings,
  validationReport,
  monsterQaReport,
}) {
  const selectedOption = EXPORT_MODE_OPTIONS.find((option) => option.id === exportMode) || EXPORT_MODE_OPTIONS[0];

  return (
    <div className="inspiration-studio__workspace inspiration-studio__workspace--export">
      <section className="studio-panel studio-panel--validation" aria-label="Validation report">
        <StudioPanelTitle eyebrow="Validation" icon="fa-shield-halved" title="Module Readiness" help="Checks whether the current Inspiration Module can safely become a registry-ready content pack.">
          <button type="button" onClick={onDownloadReadinessReport}>
            <StudioIcon name="fa-file-arrow-down" /> Report JSON
          </button>
        </StudioPanelTitle>
        <ValidationPanel draft={draft} report={validationReport} studioWarnings={studioWarnings} />
      </section>

      <section className="studio-panel studio-panel--validation" aria-label="Monster QA report">
        <StudioPanelTitle eyebrow="Monster QA" icon="fa-vial-circle-check" title="Generator Readiness" help="Runs the shared Monster Composer QA suite used by npm run monster:qa. This checks content, templates, forge generation, run mode, and export output.">
          <span>{monsterQaReport?.summary?.error || 0} errors · {monsterQaReport?.summary?.warning || 0} warnings</span>
        </StudioPanelTitle>
        <MonsterQaPanel report={monsterQaReport} />
      </section>

      <section className="studio-panel studio-panel--export" aria-label="Export content pack">
        <StudioPanelTitle eyebrow="Export" icon="fa-code" title={selectedOption.label} help={SECTION_HELP.export}>
          <button type="button" onClick={onCopy}>
            <StudioIcon name={copyState === "copied" ? "fa-check" : copyState === "failed" ? "fa-triangle-exclamation" : "fa-copy"} />
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy JSON"}
          </button>
          <button type="button" onClick={onDownloadExport}>
            <StudioIcon name="fa-file-arrow-down" /> Download v2
          </button>
        </StudioPanelTitle>

        <div className="studio-v2-transfer" data-import-state={importState?.state || "idle"}>
          <label className="studio-v2-transfer__import">
            <StudioIcon name="fa-file-import" /> Import v1/v2 JSON
            <input type="file" accept="application/json,.json" onChange={onImport} />
          </label>
          <span>
            <StudioIcon name={importState?.state === "error" ? "fa-circle-xmark" : "fa-code-branch"} />
            {importState?.message || "v1 is read transitionally; every Studio download and copy is canonical v2."}
          </span>
        </div>

        <div className="studio-export-mode" role="tablist" aria-label="Export format">
          {EXPORT_MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={exportMode === option.id}
              onClick={() => onExportModeChange(option.id)}
            >
              <span><StudioIcon name={option.icon} /> {option.label}</span>
              <em>{option.description}</em>
            </button>
          ))}
        </div>

        <p className="studio-export-note">
          {exportMode === "contentPack"
            ? "Canonical cruor-content-pack-v0.2 output for registry integration."
            : "Canonical cruor-inspiration-module-v2 output; no v1 serializer is available."}
        </p>
        <textarea
          className="studio-export-textarea"
          readOnly
          value={exportJson}
          aria-label={exportMode === "contentPack" ? "Exported Content Pack JSON" : "Exported Inspiration Module JSON"}
        />

        <details className="studio-export-compare">
          <summary><StudioIcon name="fa-code-compare" /> Inspect both export payloads</summary>
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
          <StudioIcon name="fa-circle-check" />
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
                  <StudioIcon name={meta.icon} />
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
          <StudioIcon name="fa-circle-check" />
          <strong>Ready for Content Pack export.</strong>
          <span>No validation issues detected for the current module.</span>
        </div>
      ) : (
        <StudioWarningList draft={draft} warnings={studioWarnings} />
      )}
    </div>
  );
}

function ComponentEditor({
  component,
  editorDefinition,
  onChange,
  onRemove,
  selectionKey,
  warnings = [],
}) {
  const editorRootRef = useRef(null);
  const isSpecialized = isStudioSpecializedSemanticType(component.semanticType);
  const warningFieldIds = warnings
    .map((warning) => warning.fieldId)
    .filter(Boolean)
    .sort()
    .join("|");

  useEffect(() => {
    if (!editorRootRef.current || !warningFieldIds) return;
    warningFieldIds
      .split("|")
      .forEach((fieldId) =>
        openStudioDisclosuresForField(editorRootRef.current, fieldId),
      );
  }, [selectionKey, warningFieldIds]);

  return (
    <div
      ref={editorRootRef}
      className="studio-component-editor-shell"
      aria-label="Selected component workspace"
      data-studio-editor={
        editorDefinition?.editorId || "location-component"
      }
    >
      <StudioWarningSummary
        key={`warnings-${selectionKey}`}
        warnings={warnings}
      />
      {isSpecialized ? (
        <StudioSemanticComponentEditor
          key={`semantic-${selectionKey}`}
          component={component}
          onChange={onChange}
          onRemove={onRemove}
        />
      ) : (
        <ComponentAdvancedEditor
          key={`advanced-${selectionKey}`}
          component={component}
          onChange={onChange}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

function ComponentAdvancedEditor({ component, onChange, onRemove }) {
  const isMonsterGraft = getStudioComponentFamily(component) === "monster-graft";
  const isLocationRegion = getStudioComponentFamily(component) === "location-region";
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

  function syncRegionArchetypeToMapInfluence() {
    if (!regionRoomArchetype) return;
    onChange((nextComponent) => {
      const locationRegion = nextComponent.locationRegion = nextComponent.locationRegion || {};
      locationRegion.mapInfluence = {
        ...(locationRegion.mapInfluence || {}),
        roomArchetype: regionRoomArchetype,
        preferredRoomArchetypes: [regionRoomArchetype],
        forbiddenRoomArchetypes: [],
        forceRoomArchetype: true,
        weight: Number(locationRegion.mapInfluence?.weight) || 3,
        source: locationRegion.mapInfluence?.source || getMapInfluenceSourceFallback(nextComponent),
      };
    });
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

  function getRoomDesignHolder(nextComponent) {
    if (isLocationRegion) return nextComponent.locationRegion = nextComponent.locationRegion || {};
    if (isLocationComponent) return nextComponent.location = nextComponent.location || {};
    return nextComponent;
  }

  function setLocationRegionRoomDesignField(path, value) {
    onChange((nextComponent) => {
      const holder = getRoomDesignHolder(nextComponent);
      holder.roomDesign = holder.roomDesign || {};
      let target = holder.roomDesign;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      const finalKey = path[path.length - 1];
      if (value === "" || value === null || value === undefined) delete target[finalKey];
      else target[finalKey] = value;
    });
  }

  function setLocationRegionRoomDesignNumber(path, value) {
    const parsed = value === "" ? "" : Number(value);
    setLocationRegionRoomDesignField(path, Number.isFinite(parsed) ? parsed : "");
  }

  function setLocationRegionRoomDesignArray(path, value) {
    onChange((nextComponent) => {
      const holder = getRoomDesignHolder(nextComponent);
      holder.roomDesign = holder.roomDesign || {};
      let target = holder.roomDesign;
      for (const key of path.slice(0, -1)) {
        target[key] = target[key] || {};
        target = target[key];
      }
      const finalKey = path[path.length - 1];
      const values = uniqueStrings(value);
      if (values.length) target[finalKey] = values;
      else delete target[finalKey];
    });
  }

  function setLocationRegionRequiredPropField(index, path, value) {
    onChange((nextComponent) => {
      const holder = getRoomDesignHolder(nextComponent);
      holder.roomDesign = holder.roomDesign || {};
      holder.roomDesign.props = holder.roomDesign.props || {};
      const required = Array.isArray(holder.roomDesign.props.required)
        ? [...holder.roomDesign.props.required]
        : [];
      required[index] = { ...(required[index] || {}) };
      const finalKey = path[path.length - 1];
      if (value === "" || value === null || value === undefined) delete required[index][finalKey];
      else required[index][finalKey] = value;
      holder.roomDesign.props.required = required.filter((prop) => Object.keys(prop || {}).length);
      if (!holder.roomDesign.props.required.length) delete holder.roomDesign.props.required;
      if (!Object.keys(holder.roomDesign.props).length) delete holder.roomDesign.props;
    });
  }

  function addLocationRegionRequiredProp() {
    onChange((nextComponent) => {
      const holder = getRoomDesignHolder(nextComponent);
      holder.roomDesign = holder.roomDesign || {};
      holder.roomDesign.props = holder.roomDesign.props || {};
      const required = Array.isArray(holder.roomDesign.props.required)
        ? [...holder.roomDesign.props.required]
        : [];
      required.push({ kind: "altar", placement: "center" });
      holder.roomDesign.props.required = required;
    });
  }

  function removeLocationRegionRequiredProp(index) {
    onChange((nextComponent) => {
      const holder = getRoomDesignHolder(nextComponent);
      if (!holder.roomDesign?.props?.required) return;
      const required = holder.roomDesign.props.required.filter((_, propIndex) => propIndex !== index);
      if (required.length) holder.roomDesign.props.required = required;
      else delete holder.roomDesign.props.required;
      if (!Object.keys(holder.roomDesign.props).length) delete holder.roomDesign.props;
    });
  }

  function applyRoomDesignPreset(presetId) {
    if (!presetId) {
      setLocationRegionRoomDesignField(["presetId"], "");
      return;
    }
    const presetDesign = compileRoomArchetypeToRoomDesign(presetId);
    if (!presetDesign) return;
    onChange((nextComponent) => {
      const holder = getRoomDesignHolder(nextComponent);
      holder.roomDesign = clone(presetDesign);
    });
  }

  function clearLocationRegionRoomDesign() {
    onChange((nextComponent) => {
      if (nextComponent.locationRegion?.roomDesign) delete nextComponent.locationRegion.roomDesign;
      if (nextComponent.location?.roomDesign) delete nextComponent.location.roomDesign;
      if (nextComponent.map?.roomDesign) delete nextComponent.map.roomDesign;
      if (nextComponent.roomDesign) delete nextComponent.roomDesign;
    });
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
  const hasScalableMultiattackDamage = ["budget", "computed"].includes(damageMode) || Boolean(
    damageMode === "parts" &&
      visibleDamageParts.length &&
      visibleDamageParts.every((part) => ["budget", "computed"].includes(part.mode || "budget")),
  );
  const inferredMultiattackParticipation = Boolean(
    actionEconomy === "action" &&
      usageType === "atWill" &&
      hasAttackResolution &&
      hasScalableMultiattackDamage,
  );
  const multiattackParticipation = monsterRules.multiattackParticipation || {};
  const multiattackParticipationEnabled = Object.prototype.hasOwnProperty.call(multiattackParticipation, "enabled")
    ? Boolean(multiattackParticipation.enabled)
    : inferredMultiattackParticipation;
  const multiattackParticipationRole = multiattackParticipation.role || "primary";
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
  const isLocationComponent = getStudioComponentFamily(component) === "location-component";
  const editableMapInfluence = isLocationRegion
    ? (component.locationRegion?.mapInfluence || {})
    : (component.location?.mapInfluence || component.mapInfluence || {});
  const regionRoomArchetype = component.locationRegion?.roomArchetype || component.locationRegion?.roomArchetypeId || "";
  const regionRoomDesign = isLocationRegion
    ? (component.locationRegion?.roomDesign || component.map?.roomDesign || component.roomDesign || {})
    : isLocationComponent
      ? (component.location?.roomDesign || component.map?.roomDesign || component.roomDesign || {})
      : {};
  const roomDesignEditorModel = getRoomDesignEditorModel(regionRoomDesign);
  const regionRoomDesignShape = roomDesignEditorModel.shape;
  const regionRoomDesignSize = roomDesignEditorModel.size;
  const regionRoomDesignRequiredProps = asArray(regionRoomDesign.props?.required).length
    ? asArray(regionRoomDesign.props.required)
    : [{}];
  const regionRoomDesignTopology = roomDesignEditorModel.topology;
  const hasRoomDesignData = roomDesignEditorModel.hasDesign;
  const mapInfluenceRoomArchetype = editableMapInfluence.roomArchetype
    || editableMapInfluence.roomArchetypeId
    || editableMapInfluence.forcedRoomArchetype
    || editableMapInfluence.forcedRoomArchetypeId
    || "";
  const mapInfluenceEditorModel = getMapInfluenceEditorModel(editableMapInfluence, { regionRoomArchetype });
  const hasMapInfluenceData = Boolean(
    mapInfluenceEditorModel.hasTarget
      || editableMapInfluence.forceRoomArchetype
      || editableMapInfluence.weight
      || editableMapInfluence.source
      || editableMapInfluence.note,
  );
  const canSyncRegionArchetypeInfluence = isLocationRegion && regionRoomArchetype && !mapInfluenceEditorModel.hasTarget;

  const addableRulesBlocks = [
    { id: "targeting", label: "Targeting", icon: "fa-crosshairs", active: hasTargetingBlock },
    { id: "areaEffect", label: "Area Timing", icon: "fa-circle-nodes", active: hasAreaEffectBlock },
    { id: "damage", label: "Damage", icon: "fa-burst", active: hasDamageBlock },
    { id: "condition", label: "Condition", icon: "fa-person-rays", active: hasConditionBlock },
    { id: "ongoing", label: "Ongoing Effect", icon: "fa-clock-rotate-left", active: hasOngoingBlock },
    { id: "multiattack", label: "Manual Multiattack Override", icon: "fa-clone", active: hasMultiattackBlock },
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
          <span><StudioIcon name={COMPONENT_TYPE_ICONS[component.contentType] || "fa-puzzle-piece"} /> {COMPONENT_TYPE_LABELS[component.contentType] || component.contentType}</span>
          <strong>{component.title}</strong>
        </div>
      </div>

      <nav className="studio-component-editor-tabs" role="tablist" aria-label="Component editor sections">
        {componentEditorTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeComponentEditorTab}
            onClick={() => setActiveEditorTab(tab.id)}
          >
            <StudioIcon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>


      {activeComponentEditorTab === "overview" ? (
        <div className="studio-component-zone" data-editor-zone="overview">
          <StudioCollapsibleSection icon="fa-id-card" title="Identity" help="Core component identity, source links, workflows, and implementation tags.">
            <div className="studio-form-grid studio-form-grid--compact">
              <StudioField label="Component Title" icon="fa-heading" hint={FIELD_HELP.componentTitle}>
                <StudioInput value={component.title} onChange={(value) => {
                  setField(["title"], value);
                  setField(["label"], value);
                }} />
              </StudioField>
              <StudioField label="Content Type" icon="fa-shapes" hint={FIELD_HELP.contentType}>
                <select value={component.contentType} onChange={(event) => setField(["contentType"], event.target.value)}>
                  <option value="monster-graft">Monster Graft</option>
                  <option value="location-component">Location Component</option>
                  <option value="location-region">Location Region</option>
                </select>
              </StudioField>
              {!isMonsterGraft ? (
                <StudioField label="Slots" icon="fa-table-cells-large" hint={FIELD_HELP.slots}>
                  <KeywordPillInput fieldId={`${component.id}-slots`} icon="fa-table-cells-large" value={component.slots} onChange={(value) => setField(["slots"], value)} placeholder="body, attack, region" />
                </StudioField>
              ) : null}
              <StudioField label="Workflows" icon="fa-route" hint={FIELD_HELP.workflows}>
                <KeywordPillInput fieldId={`${component.id}-workflows`} icon="fa-route" value={component.workflows} onChange={(value) => setField(["workflows"], value)} placeholder="monster-composer" />
              </StudioField>
              <StudioField label="Source Anchors" icon="fa-anchor" hint={FIELD_HELP.sourceAnchors}>
                <KeywordPillInput fieldId={`${component.id}-source-anchors`} icon="fa-anchor" value={component.sourceAnchors} onChange={(value) => setField(["sourceAnchors"], value)} placeholder="decomposition" />
              </StudioField>
              <StudioField label="Tags" icon="fa-tags" hint={FIELD_HELP.tags}>
                <KeywordPillInput fieldId={`${component.id}-tags`} icon="fa-tag" value={component.tags} onChange={(value) => setField(["tags"], value)} placeholder="slot:body, role:boss" />
              </StudioField>
            </div>
          </StudioCollapsibleSection>

          <StudioCollapsibleSection icon="fa-pen-nib" title="Playable Text" help={SECTION_HELP.playableText}>
            <StudioField label="Summary" icon="fa-align-left" hint={FIELD_HELP.componentSummary}>
              <StudioTextarea rows={4} value={component.summary} onChange={(value) => setField(["summary"], value)} />
            </StudioField>
            {!isMonsterGraft ? (
              <>
                <StudioField label="Table Text" icon="fa-dice-d20" hint={FIELD_HELP.tableText}>
                  <StudioTextarea rows={4} value={component.tableText} onChange={(value) => setField(["tableText"], value)} />
                </StudioField>
                <StudioField label="Mechanics" icon="fa-gears" hint={FIELD_HELP.mechanics}>
                  <StudioTextarea rows={5} value={component.mechanics} onChange={(value) => setField(["mechanics"], value)} />
                </StudioField>
              </>
            ) : null}
          </StudioCollapsibleSection>
        </div>
      ) : null}

      {isMonsterGraft ? (
        <div className="studio-component-editor__subpanel studio-component-editor__subpanel--monster" hidden={activeComponentEditorTab === "overview"}>
          <StudioCollapsibleSection zone="fit" defaultOpen icon="fa-id-card" title="Frame" help="Frame fields define where the graft belongs in the Monster Composer, where it prints in the stat block, and how much budget it consumes.">
            <div className="studio-form-grid studio-form-grid--compact">
              <StudioField label="Monster Slot" icon="fa-table-cells-large" hint={FIELD_HELP.monsterSlot}>
                <StudioInput value={component.monster?.slot || joinList(component.slots)} onChange={setMonsterSlot} />
              </StudioField>
              <StudioField label="Rules Section" icon="fa-file-lines" hint={FIELD_HELP.rulesSection}>
                <StudioSelect options={MONSTER_RULE_SECTION_OPTIONS} value={ruleSection} onChange={(value) => {
                  setField(["monster", "section"], value);
                  setRulesField(["section"], value);
                }} />
              </StudioField>
              <StudioField label="Cost" icon="fa-gauge-high" hint={FIELD_HELP.monsterCost}>
                <input type="number" value={component.monster?.cost ?? 0} onChange={(event) => setField(["monster", "cost"], Number(event.target.value))} />
              </StudioField>
              <StudioField label="Complexity" icon="fa-layer-group" hint={FIELD_HELP.monsterComplexity}>
                <input type="number" value={component.monster?.complexity ?? 0} onChange={(event) => setField(["monster", "complexity"], Number(event.target.value))} />
              </StudioField>
            </div>
          </StudioCollapsibleSection>

          <StudioCollapsibleSection
            zone="anatomy"
            icon="fa-seedling"
            title="Effective Anatomy Grants"
            help="Optional build changes this graft adds after installation. Use this for mutation/body grafts that unlock later abilities, such as web organs, tendrils, wax mask, brood carrier, or spectral body."
            actions={monsterGrantSummary.length ? <RemoveRulesBlockButton label="Effective Anatomy Grants" onClick={clearMonsterGrants} /> : null}
          >
            <div className="studio-form-grid studio-form-grid--compact">
              <StudioField label={ANATOMY_GRANT_FIELD_LABELS.grantsBodyPlans} icon="fa-person-rays" hint={ANATOMY_GRANT_FIELD_HINTS.grantsBodyPlans}>
                <KeywordPillInput fieldId={`${component.id}-grants-body-plans`} icon="fa-person-rays" value={monsterAnatomyGrants.grantsBodyPlans} onChange={(value) => setMonsterGrantArray("grantsBodyPlans", value)} placeholder="arachnid, incorporeal" />
              </StudioField>
              <StudioField label={ANATOMY_GRANT_FIELD_LABELS.grantsAnatomy} icon="fa-dna" hint={ANATOMY_GRANT_FIELD_HINTS.grantsAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-grants-anatomy`} icon="fa-dna" value={monsterAnatomyGrants.grantsAnatomy} onChange={(value) => setMonsterGrantArray("grantsAnatomy", value)} placeholder="web_glands, spinnerets, tendrils" />
              </StudioField>
              <StudioField label={ANATOMY_GRANT_FIELD_LABELS.grantsTags} icon="fa-tags" hint={ANATOMY_GRANT_FIELD_HINTS.grantsTags}>
                <KeywordPillInput fieldId={`${component.id}-grants-tags`} icon="fa-tags" value={monsterAnatomyGrants.grantsTags} onChange={(value) => setMonsterGrantArray("grantsTags", value)} placeholder="web_bearing, spider_infested" />
              </StudioField>
              <StudioField label={ANATOMY_GRANT_FIELD_LABELS.grantsTokens} icon="fa-link" hint={ANATOMY_GRANT_FIELD_HINTS.grantsTokens}>
                <KeywordPillInput fieldId={`${component.id}-grants-tokens`} icon="fa-link" value={monsterAnatomyGrants.grantsTokens} onChange={(value) => setMonsterGrantArray("grantsTokens", value)} placeholder="web_maker, egg_carrier" />
              </StudioField>
            </div>
            <StudioField label="Grant Note" icon="fa-note-sticky" hint="Optional internal note explaining what anatomy or build state this graft unlocks.">
              <StudioTextarea rows={2} value={monsterAnatomyGrants.note || ""} onChange={setMonsterGrantNote} placeholder="Example: this body graft grows spinnerets, so later web attacks become legal." />
            </StudioField>
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
          </StudioCollapsibleSection>

          <StudioCollapsibleSection
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
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.allowedFamilies} icon="fa-skull" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.allowedFamilies}>
                <KeywordPillInput fieldId={`${component.id}-allowed-families`} icon="fa-skull" value={asArray(monsterConstraints.allowedFamilies).length ? monsterConstraints.allowedFamilies : monsterConstraints.exclusiveToFamilies} onChange={(value) => setMonsterConstraintArray("allowedFamilies", value)} placeholder="spider, skeleton" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenFamilies} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenFamilies}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-families`} icon="fa-ban" value={monsterConstraints.forbiddenFamilies} onChange={(value) => setMonsterConstraintArray("forbiddenFamilies", value)} placeholder="spider, spirit" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.allowedBodyPlans} icon="fa-person" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.allowedBodyPlans}>
                <KeywordPillInput fieldId={`${component.id}-allowed-body-plans`} icon="fa-person" value={monsterConstraints.allowedBodyPlans} onChange={(value) => setMonsterConstraintArray("allowedBodyPlans", value)} placeholder="humanoid, arachnid" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenBodyPlans} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenBodyPlans}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-body-plans`} icon="fa-ban" value={monsterConstraints.forbiddenBodyPlans} onChange={(value) => setMonsterConstraintArray("forbiddenBodyPlans", value)} placeholder="incorporeal" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiredAnatomy} icon="fa-hand" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiredAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-required-anatomy`} icon="fa-hand" value={monsterConstraints.requiredAnatomy} onChange={(value) => setMonsterConstraintArray("requiredAnatomy", value)} placeholder="hands, fangs, web_glands" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiresAnyAnatomy} icon="fa-code-branch" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiresAnyAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-requires-any-anatomy`} icon="fa-code-branch" value={monsterConstraints.requiresAnyAnatomy} onChange={(value) => setMonsterConstraintArray("requiresAnyAnatomy", value)} placeholder="hands, tendrils" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenAnatomy} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenAnatomy}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-anatomy`} icon="fa-ban" value={monsterConstraints.forbiddenAnatomy} onChange={(value) => setMonsterConstraintArray("forbiddenAnatomy", value)} placeholder="beak, no_stable_limbs" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiredTags} icon="fa-tags" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiredTags}>
                <KeywordPillInput fieldId={`${component.id}-required-tags`} icon="fa-tags" value={monsterConstraints.requiredTags} onChange={(value) => setMonsterConstraintArray("requiredTags", value)} placeholder="corpse, physical" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenTags} icon="fa-ban" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenTags}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-tags`} icon="fa-ban" value={monsterConstraints.forbiddenTags} onChange={(value) => setMonsterConstraintArray("forbiddenTags", value)} placeholder="no_flesh, no_hands" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiredTokens} icon="fa-link" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiredTokens}>
                <KeywordPillInput fieldId={`${component.id}-required-tokens`} icon="fa-link" value={monsterConstraints.requiredTokens} onChange={(value) => setMonsterConstraintArray("requiredTokens", value)} placeholder="web_maker, bone_body" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.requiresAnyTokens} icon="fa-link" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.requiresAnyTokens}>
                <KeywordPillInput fieldId={`${component.id}-requires-any-tokens`} icon="fa-link" value={monsterConstraints.requiresAnyTokens} onChange={(value) => setMonsterConstraintArray("requiresAnyTokens", value)} placeholder="spider_body, web_maker" />
              </StudioField>
              <StudioField label={ANATOMY_CONSTRAINT_FIELD_LABELS.forbiddenTokens} icon="fa-link-slash" hint={ANATOMY_CONSTRAINT_FIELD_HINTS.forbiddenTokens}>
                <KeywordPillInput fieldId={`${component.id}-forbidden-tokens`} icon="fa-link-slash" value={monsterConstraints.forbiddenTokens} onChange={(value) => setMonsterConstraintArray("forbiddenTokens", value)} placeholder="spirit_body, no_body" />
              </StudioField>
            </div>
            <StudioField label="Constraint Note" icon="fa-note-sticky" hint="Optional internal note explaining why the constraint exists. This is useful for review and future content authors.">
              <StudioTextarea rows={2} value={monsterConstraints.note || ""} onChange={setMonsterConstraintNote} placeholder="Example: requires spinnerets because the graft creates web terrain directly." />
            </StudioField>
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
          </StudioCollapsibleSection>

          <StudioCollapsibleSection
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
              <StudioField label="Encounter Allowed" icon="fa-user-group" hint={MONSTER_FRAME_FIT_FIELD_HELP.allowed}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-encounter-allowed`} icon="fa-user-group" value={monsterFrameFit.encounterRoles?.allowed} onChange={(value) => setMonsterFrameFitArray("encounterRoles", "allowed", value)} placeholder="standard, boss" suggestions={MONSTER_FRAME_FIT_VALUES.encounterRoles} />
              </StudioField>
              <StudioField label="Encounter Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-encounter-recommended`} icon="fa-star" value={monsterFrameFit.encounterRoles?.recommended} onChange={(value) => setMonsterFrameFitArray("encounterRoles", "recommended", value)} placeholder="boss" suggestions={MONSTER_FRAME_FIT_VALUES.encounterRoles} />
              </StudioField>
              <StudioField label="Encounter Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-encounter-forbidden`} icon="fa-ban" value={monsterFrameFit.encounterRoles?.forbidden} onChange={(value) => setMonsterFrameFitArray("encounterRoles", "forbidden", value)} placeholder="minion" suggestions={MONSTER_FRAME_FIT_VALUES.encounterRoles} />
              </StudioField>

              <StudioField label="Tactical Allowed" icon="fa-chess-knight" hint={MONSTER_FRAME_FIT_FIELD_HELP.allowed}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tactical-allowed`} icon="fa-chess-knight" value={monsterFrameFit.tacticalRoles?.allowed} onChange={(value) => setMonsterFrameFitArray("tacticalRoles", "allowed", value)} placeholder="controller, support" suggestions={MONSTER_FRAME_FIT_VALUES.tacticalRoles} />
              </StudioField>
              <StudioField label="Tactical Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tactical-recommended`} icon="fa-star" value={monsterFrameFit.tacticalRoles?.recommended} onChange={(value) => setMonsterFrameFitArray("tacticalRoles", "recommended", value)} placeholder="controller" suggestions={MONSTER_FRAME_FIT_VALUES.tacticalRoles} />
              </StudioField>
              <StudioField label="Tactical Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tactical-forbidden`} icon="fa-ban" value={monsterFrameFit.tacticalRoles?.forbidden} onChange={(value) => setMonsterFrameFitArray("tacticalRoles", "forbidden", value)} placeholder="brute" suggestions={MONSTER_FRAME_FIT_VALUES.tacticalRoles} />
              </StudioField>

              <StudioField label="Tier Min" icon="fa-layer-group" hint="Hard minimum tier. Leave empty for no hard gate.">
                <StudioSelect options={[["", "No minimum"], ...MONSTER_FRAME_FIT_VALUES.tiers.map((id) => [id, MONSTER_FRAME_FIT_OPTION_LABELS.tiers[id] || id])]} value={monsterFrameFit.tiers?.min || ""} onChange={(value) => setMonsterFrameFitField(["tiers", "min"], value)} />
              </StudioField>
              <StudioField label="Tier Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tier-recommended`} icon="fa-star" value={monsterFrameFit.tiers?.recommended} onChange={(value) => setMonsterFrameFitArray("tiers", "recommended", value)} placeholder="elite, boss, setpiece" suggestions={MONSTER_FRAME_FIT_VALUES.tiers} />
              </StudioField>
              <StudioField label="Tier Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tier-forbidden`} icon="fa-ban" value={monsterFrameFit.tiers?.forbidden} onChange={(value) => setMonsterFrameFitArray("tiers", "forbidden", value)} placeholder="normal" suggestions={MONSTER_FRAME_FIT_VALUES.tiers} />
              </StudioField>

              <StudioField label="CR Min" icon="fa-signal" hint={MONSTER_FRAME_FIT_FIELD_HELP.cr}>
                <input type="number" min="0" max="30" value={monsterFrameFit.cr?.min ?? ""} onChange={(event) => setMonsterFrameFitField(["cr", "min"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="5" />
              </StudioField>
              <StudioField label="CR Max" icon="fa-signal" hint={MONSTER_FRAME_FIT_FIELD_HELP.cr}>
                <input type="number" min="0" max="30" value={monsterFrameFit.cr?.max ?? ""} onChange={(event) => setMonsterFrameFitField(["cr", "max"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="20" />
              </StudioField>
              <StudioField label="Recommended CR Min" icon="fa-star" hint="Soft minimum CR used for QA and ranking, but not as a hard block.">
                <input type="number" min="0" max="30" value={monsterFrameFit.cr?.recommendedMin ?? ""} onChange={(event) => setMonsterFrameFitField(["cr", "recommendedMin"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="8" />
              </StudioField>

              <StudioField label="Tempo Allowed" icon="fa-forward-fast" hint={MONSTER_FRAME_FIT_FIELD_HELP.allowed}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tempo-allowed`} icon="fa-forward-fast" value={monsterFrameFit.tempo?.allowed} onChange={(value) => setMonsterFrameFitArray("tempo", "allowed", value)} placeholder="slow, standard" suggestions={MONSTER_FRAME_FIT_VALUES.tempo} />
              </StudioField>
              <StudioField label="Tempo Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tempo-recommended`} icon="fa-star" value={monsterFrameFit.tempo?.recommended} onChange={(value) => setMonsterFrameFitArray("tempo", "recommended", value)} placeholder="fast, ambusher" suggestions={MONSTER_FRAME_FIT_VALUES.tempo} />
              </StudioField>
              <StudioField label="Tempo Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-tempo-forbidden`} icon="fa-ban" value={monsterFrameFit.tempo?.forbidden} onChange={(value) => setMonsterFrameFitArray("tempo", "forbidden", value)} placeholder="ambusher" suggestions={MONSTER_FRAME_FIT_VALUES.tempo} />
              </StudioField>

              <StudioField label="Danger Min" icon="fa-skull-crossbones" hint="Hard minimum danger profile. Leave empty for no hard gate.">
                <StudioSelect options={[["", "No minimum"], ...MONSTER_FRAME_FIT_VALUES.danger.map((id) => [id, MONSTER_FRAME_FIT_OPTION_LABELS.danger[id] || id])]} value={monsterFrameFit.danger?.min || ""} onChange={(value) => setMonsterFrameFitField(["danger", "min"], value)} />
              </StudioField>
              <StudioField label="Danger Recommended" icon="fa-star" hint={MONSTER_FRAME_FIT_FIELD_HELP.recommended}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-danger-recommended`} icon="fa-star" value={monsterFrameFit.danger?.recommended} onChange={(value) => setMonsterFrameFitArray("danger", "recommended", value)} placeholder="hard, horror" suggestions={MONSTER_FRAME_FIT_VALUES.danger} />
              </StudioField>
              <StudioField label="Danger Forbidden" icon="fa-ban" hint={MONSTER_FRAME_FIT_FIELD_HELP.forbidden}>
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-fit-danger-forbidden`} icon="fa-ban" value={monsterFrameFit.danger?.forbidden} onChange={(value) => setMonsterFrameFitArray("danger", "forbidden", value)} placeholder="standard" suggestions={MONSTER_FRAME_FIT_VALUES.danger} />
              </StudioField>
            </div>

            <StudioField label="Fit Note" icon="fa-note-sticky" hint="Optional internal note explaining why this graft fits or does not fit certain monster frames.">
              <StudioTextarea rows={2} value={monsterFrameFit.note || ""} onChange={(value) => setMonsterFrameFitField(["note"], value)} placeholder="Example: intended for elite controller spiders; too much tracking for minions." />
            </StudioField>

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
          </StudioCollapsibleSection>

          <StudioCollapsibleSection
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
          </StudioCollapsibleSection>

          <StudioCollapsibleSection zone="qa" icon="fa-code" title="Raw Component JSON" help="Read-only component payload for debugging saved data and future Supabase migration checks.">
            <StudioField label="Raw JSON" icon="fa-code" hint="Read-only JSON for the selected component. Use this only for debugging.">
              <StudioTextarea className="studio-generated-preview studio-raw-json-preview" rows={16} readOnly value={JSON.stringify(component, null, 2)} />
            </StudioField>
          </StudioCollapsibleSection>

          <StudioCollapsibleSection zone="qa" icon="fa-trash" title="Danger Zone" help="Remove this component from the current Inspiration Module.">
            <StudioArmedDeleteButton onConfirm={onRemove} />
          </StudioCollapsibleSection>

          {usesInferredRules ? (
            <div className="studio-inferred-rules-note" data-editor-zone="rules">
              <StudioIcon name="fa-wand-magic-sparkles" />
              <span>Inferred from legacy Mechanics. Editing any rule field will convert this graft to explicit structured rules.</span>
            </div>
          ) : null}

          <div className="studio-rules-layout" data-editor-zone="rules">
            <StudioCollapsibleSection defaultOpen icon="fa-bolt" title="Use" help="Use fields define when the ability exists and how often it can be used.">
              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Action Economy" icon="fa-bolt" hint={FIELD_HELP.actionEconomy}>
                  <StudioSelect options={MONSTER_ACTION_ECONOMY_OPTIONS} value={actionEconomy} onChange={(value) => setRulesField(["actionEconomy"], value)} />
                </StudioField>
                <StudioField label="Usage" icon="fa-repeat" hint={FIELD_HELP.usageType}>
                  <StudioSelect options={MONSTER_USAGE_OPTIONS} value={usageType} onChange={(value) => setRulesField(["usage", "type"], value)} />
                </StudioField>
                {showUsageValue ? (
                  <StudioField label="Usage Value" icon="fa-dice-six" hint={FIELD_HELP.usageValue}>
                    <StudioInput value={monsterRules.usage?.value} onChange={(value) => setRulesField(["usage", "value"], value)} placeholder="5-6, 1/Day, 3 uses..." />
                  </StudioField>
                ) : null}
                <StudioField label="Resolution" icon="fa-dice-d20" hint={FIELD_HELP.resolutionType}>
                  <StudioSelect options={MONSTER_RESOLUTION_OPTIONS} value={resolutionChoice} onChange={setResolutionChoice} />
                </StudioField>
              </div>
            </StudioCollapsibleSection>

            {actionEconomy === "action" ? (
              <StudioCollapsibleSection icon="fa-layer-group" title="Automatic Multiattack Participation" help={FIELD_HELP.multiattackParticipation}>
                <StudioField label="Multiattack Action" icon="fa-check-double" hint={FIELD_HELP.multiattackParticipation}>
                  <label className="studio-multiattack-participation-toggle">
                    <input
                      type="checkbox"
                      checked={multiattackParticipationEnabled}
                      onChange={(event) => {
                        const enabled = event.target.checked;
                        setRulesField(["multiattackParticipation", "enabled"], enabled);
                        if (enabled) {
                          setRulesField(["multiattackParticipation", "role"], multiattackParticipation.role || "primary");
                          setRulesField(["multiattackParticipation", "maxUses"], multiattackParticipation.maxUses || 4);
                          setRulesField(["multiattackParticipation", "group"], multiattackParticipation.group || "primary");
                        }
                      }}
                    />
                    <span>Allow the build-level planner to include this action in Multiattack.</span>
                  </label>
                </StudioField>
                {multiattackParticipationEnabled ? (
                  <>
                    <div className="studio-form-grid studio-form-grid--compact">
                      <StudioField label="Routine Role" icon="fa-diagram-project" hint={FIELD_HELP.multiattackParticipationRole}>
                        <StudioSelect
                          options={MONSTER_MULTIATTACK_PARTICIPATION_ROLE_OPTIONS}
                          value={multiattackParticipationRole}
                          onChange={(value) => setRulesField(["multiattackParticipation", "role"], value)}
                        />
                      </StudioField>
                      <StudioField label="Maximum Uses" icon="fa-hashtag" hint={FIELD_HELP.multiattackParticipationMaxUses}>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          step="1"
                          value={multiattackParticipation.maxUses ?? 4}
                          onChange={(event) => setRulesField(["multiattackParticipation", "maxUses"], Number(event.target.value))}
                        />
                      </StudioField>
                      <StudioField label="Combination Group" icon="fa-object-group" hint={FIELD_HELP.multiattackParticipationGroup}>
                        <StudioInput
                          value={multiattackParticipation.group || "primary"}
                          onChange={(value) => setRulesField(["multiattackParticipation", "group"], value)}
                          placeholder="primary"
                        />
                      </StudioField>
                      <StudioField label="Availability" icon="fa-clock" hint="Use If Available for recharge, limited-use, or mutually exclusive additions and replacements.">
                        <StudioSelect
                          options={MONSTER_MULTIATTACK_PARTICIPATION_AVAILABILITY_OPTIONS}
                          value={multiattackParticipation.availability || "always"}
                          onChange={(value) => setRulesField(["multiattackParticipation", "availability"], value)}
                        />
                      </StudioField>
                    </div>
                    {multiattackParticipationRole === "replacement" ? (
                      <StudioField label="Replacement Scope" icon="fa-repeat" hint={FIELD_HELP.multiattackReplacement}>
                        <StudioSelect
                          options={MONSTER_MULTIATTACK_REPLACEMENT_OPTIONS}
                          value={multiattackParticipation.replacementScope || "oneAttack"}
                          onChange={(value) => setRulesField(["multiattackParticipation", "replacementScope"], value)}
                        />
                      </StudioField>
                    ) : null}
                    {multiattackParticipationRole === "additionalAbility" ? (
                      <StudioField label="Timing" icon="fa-arrow-right-arrow-left" hint="Whether the additional ability is used before or after the routine's attacks.">
                        <StudioSelect
                          options={MONSTER_MULTIATTACK_PARTICIPATION_TIMING_OPTIONS}
                          value={multiattackParticipation.timing || "beforeAttacks"}
                          onChange={(value) => setRulesField(["multiattackParticipation", "timing"], value)}
                        />
                      </StudioField>
                    ) : null}
                  </>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}

            <StudioCollapsibleSection defaultOpen icon="fa-plus" title="Add Rule Block" help="Add only the optional rule blocks this graft actually needs. Blocks already containing data stay visible until removed.">
              {visibleAddableRulesBlocks.length ? (
                <div className="studio-rules-add-menu" aria-label="Add optional monster rule block">
                  {visibleAddableRulesBlocks.map((block) => (
                    <button key={block.id} type="button" onClick={() => addRulesBlock(block.id)}>
                      <StudioIcon name={block.icon} />
                      Add {block.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="studio-rules-add-menu__empty">All optional rule blocks are active.</p>
              )}
            </StudioCollapsibleSection>

            {hasMultiattackBlock ? (
              <StudioCollapsibleSection icon="fa-clone" title="Manual Multiattack Override" help={FIELD_HELP.multiattack} actions={<RemoveRulesBlockButton label="Multiattack" onClick={() => removeRulesBlock("multiattack")} />}>
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
                      <StudioField label="Pattern" icon="fa-diagram-project" hint={FIELD_HELP.multiattackMode}>
                        <StudioSelect options={MONSTER_MULTIATTACK_MODE_OPTIONS} value={monsterRules.multiattack?.mode || "fixed"} onChange={(value) => setRulesField(["multiattack", "mode"], value)} />
                      </StudioField>
                      <StudioField label="Attack Count" icon="fa-hashtag" hint={FIELD_HELP.multiattackCount}>
                        <input type="number" min="1" step="1" value={monsterRules.multiattack?.count ?? 2} onChange={(event) => setRulesField(["multiattack", "count"], Number(event.target.value))} />
                      </StudioField>
                    </div>
                    <div className="studio-damage-parts studio-multiattack-attacks" aria-label="Multiattack attacks editor">
                      {visibleMultiattackAttacks.map((attack, index) => (
                        <div className="studio-damage-part studio-multiattack-attack" key={attack.ref || index}>
                          <div className="studio-damage-part__head">
                            <strong><StudioIcon name="fa-hand-fist" /> Attack Reference {index + 1}</strong>
                            <IconOnlyRemoveButton label={`Attack Reference ${index + 1}`} onClick={() => removeMultiattackAttack(index)} disabled={!multiattackAttacks.length} />
                          </div>
                          <div className="studio-form-grid studio-form-grid--compact">
                            <StudioField label="Ref" icon="fa-fingerprint" hint="Stable internal id for this referenced attack, such as slam, claw, bite, or primary.">
                              <StudioInput value={attack.ref} onChange={(value) => setMultiattackAttackField(index, ["ref"], value)} placeholder={`attack-${index + 1}`} />
                            </StudioField>
                            <StudioField label="Label" icon="fa-tag" hint="Printed attack name used in the generated Multiattack sentence.">
                              <StudioInput value={attack.label} onChange={(value) => setMultiattackAttackField(index, ["label"], value)} placeholder="Slam" />
                            </StudioField>
                            <StudioField label="Count" icon="fa-hashtag" hint="How many times this referenced attack is made.">
                              <input type="number" min="1" step="1" value={attack.count ?? 1} onChange={(event) => setMultiattackAttackField(index, ["count"], Number(event.target.value))} />
                            </StudioField>
                            <StudioField label="Template Token" icon="fa-code" hint="Use this token inside the custom Multiattack template.">
                              <input readOnly value={`{attack:${attack.label || attack.ref || `Attack ${index + 1}`}}`} />
                            </StudioField>
                          </div>
                        </div>
                      ))}
                      <button className="studio-inline-action" type="button" onClick={addMultiattackAttack}>
                        <StudioIcon name="fa-plus" /> Add Attack Reference
                      </button>
                    </div>
                    <div className="studio-damage-parts studio-multiattack-replacements" aria-label="Multiattack replacements editor">
                      {multiattackReplacements.map((replacement, index) => (
                        <div className="studio-damage-part studio-multiattack-replacement" key={`${replacement.replace || "replacement"}-${index}`}>
                          <div className="studio-damage-part__head">
                            <strong><StudioIcon name="fa-repeat" /> Replacement {index + 1}</strong>
                            <IconOnlyRemoveButton label={`Replacement ${index + 1}`} onClick={() => removeMultiattackReplacement(index)} />
                          </div>
                          <div className="studio-form-grid studio-form-grid--compact">
                            <StudioField label="Replace" icon="fa-repeat" hint={FIELD_HELP.multiattackReplacement}>
                              <StudioSelect options={MONSTER_MULTIATTACK_REPLACEMENT_OPTIONS} value={replacement.replace || "oneAttack"} onChange={(value) => setMultiattackReplacementField(index, ["replace"], value)} />
                            </StudioField>
                            <StudioField label="Ability Label" icon="fa-wand-magic-sparkles" hint="Printed label for the replacing ability, such as Spellcasting, Chilling Gaze, or Web Burst.">
                              <StudioInput value={replacement.label || replacement.with} onChange={(value) => {
                                setMultiattackReplacementField(index, ["label"], value);
                                setMultiattackReplacementField(index, ["with"], value);
                              }} placeholder="Spellcasting" />
                            </StudioField>
                          </div>
                        </div>
                      ))}
                      <button className="studio-inline-action" type="button" onClick={addMultiattackReplacement}>
                        <StudioIcon name="fa-plus" /> Add Replacement
                      </button>
                    </div>
                    <StudioField label="Multiattack Template" icon="fa-code" hint={FIELD_HELP.multiattackTemplate}>
                      <StudioTextarea rows={3} value={monsterRules.multiattack?.template} onChange={(value) => setRulesField(["multiattack", "template"], value)} placeholder="The monster makes two {attack:Slam} attacks. It can replace one attack with Spellcasting." />
                    </StudioField>
                  </>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {hasSpellcastingBlock ? (
              <StudioCollapsibleSection icon="fa-book-open" title="Spellcasting" help={FIELD_HELP.spellcasting} actions={<RemoveRulesBlockButton label="Spellcasting" onClick={() => removeRulesBlock("spellcasting")} />}>
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
                      <StudioField label="Spellcasting Ability" icon="fa-hat-wizard" hint={FIELD_HELP.spellcastingAbility}>
                        <StudioSelect options={MONSTER_SAVE_OPTIONS} value={monsterRules.spellcasting?.ability || "wisdom"} onChange={(value) => setRulesField(["spellcasting", "ability"], value)} />
                      </StudioField>
                      <StudioField label="Spell Save DC" icon="fa-shield" hint={FIELD_HELP.spellcastingSource}>
                        <StudioSelect options={MONSTER_SPELLCASTING_SOURCE_OPTIONS} value={monsterRules.spellcasting?.saveDc || "monster"} onChange={(value) => setRulesField(["spellcasting", "saveDc"], value)} />
                      </StudioField>
                      <StudioField label="Spell Attack Bonus" icon="fa-wand-magic-sparkles" hint={FIELD_HELP.spellcastingSource}>
                        <StudioSelect options={MONSTER_SPELLCASTING_SOURCE_OPTIONS} value={monsterRules.spellcasting?.attackBonus || "monster"} onChange={(value) => setRulesField(["spellcasting", "attackBonus"], value)} />
                      </StudioField>
                      <StudioField label="Material Components" icon="fa-gem" hint={FIELD_HELP.spellcastingMaterials}>
                        <select value={monsterRules.spellcasting?.requiresMaterialComponents ? "true" : "false"} onChange={(event) => setRulesField(["spellcasting", "requiresMaterialComponents"], event.target.value === "true")}>
                          <option value="false">Requires no Material components</option>
                          <option value="true">Requires Material components</option>
                        </select>
                      </StudioField>
                    </div>

                    <div className="studio-spell-picker" aria-label="Spell picker">
                      <div className="studio-form-grid studio-form-grid--compact">
                        <StudioField label="Find Spell" icon="fa-magnifying-glass" hint={FIELD_HELP.spellPicker}>
                          <StudioInput value={spellPickerQuery} onChange={setSpellPickerQuery} placeholder="Search by name, class, school..." />
                        </StudioField>
                        <StudioField label="Level" icon="fa-signal" hint="Filter the spell database by spell level.">
                          <StudioSelect options={[["all", "All Levels"], ...SPELLS_5E24_LEVEL_OPTIONS.map((option) => [String(option.value), option.label])]} value={spellPickerLevel} onChange={setSpellPickerLevel} />
                        </StudioField>
                        <StudioField label="School" icon="fa-graduation-cap" hint="Filter the spell database by school.">
                          <StudioSelect options={[["all", "All Schools"], ...SPELLS_5E24_SCHOOL_OPTIONS.map((school) => [school, school])]} value={spellPickerSchool} onChange={setSpellPickerSchool} />
                        </StudioField>
                        <StudioField label="Add To" icon="fa-list" hint="Choose which spellcasting list receives selected spells.">
                          <StudioSelect options={MONSTER_SPELLCASTING_LIST_OPTIONS} value={spellPickerListId} onChange={setSpellPickerListId} />
                        </StudioField>
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
                            <strong><StudioIcon name="fa-scroll" /> {list.label || spellListLabelForUsage(list.usage)}</strong>
                            <span>{asArray(list.spellRefs).length + asArray(list.spells).length} spells</span>
                          </div>
                          <div className="studio-form-grid studio-form-grid--compact">
                            <StudioField label="Label" icon="fa-tag" hint="Printed label for this list, such as At will or 1/day each.">
                              <StudioInput value={list.label} onChange={(value) => setSpellcastingListById(list.id, { label: value })} />
                            </StudioField>
                            <StudioField label="Usage" icon="fa-repeat" hint="Internal usage bucket for this spell list.">
                              <StudioSelect options={MONSTER_SPELLCASTING_LIST_OPTIONS} value={list.usage || list.id} onChange={(value) => setSpellcastingListById(list.id, { usage: value, label: list.label || spellListLabelForUsage(value) })} />
                            </StudioField>
                          </div>
                          <StudioField label="Spells" icon="fa-wand-magic-sparkles" hint={FIELD_HELP.spellList}>
                            <StudioTextarea rows={3} value={formatSpellListInput(list)} onChange={(value) => setSpellcastingListInput(list.id, value)} placeholder="Detect Magic, Minor Illusion" />
                          </StudioField>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {showTrigger ? (
              <StudioCollapsibleSection icon="fa-code-branch" title="Trigger" help="Trigger fields are only needed for reactions, death triggers, free triggers, or conditional abilities.">
                <StudioField label="Trigger" icon="fa-code-branch" hint={FIELD_HELP.trigger}>
                  <StudioTextarea rows={2} value={monsterRules.trigger} onChange={(value) => setRulesField(["trigger"], value)} />
                </StudioField>
              </StudioCollapsibleSection>
            ) : null}

            {hasTargetingBlock ? (
              <StudioCollapsibleSection icon="fa-crosshairs" title="Targeting" help={FIELD_HELP.targetingType} actions={<RemoveRulesBlockButton label="Targeting" onClick={() => removeRulesBlock("targeting")} />}>
                <div className="studio-form-grid studio-form-grid--compact">
                  <StudioField label="Targeting Type" icon="fa-crosshairs" hint={FIELD_HELP.targetingType}>
                    <StudioSelect options={MONSTER_TARGETING_TYPE_OPTIONS} value={targeting.type || "area"} onChange={(value) => setRulesField(["targeting", "type"], value)} />
                  </StudioField>
                  {targeting.type === "area" || !targeting.type ? (
                    <>
                      <StudioField label="Shape" icon="fa-draw-polygon" hint={FIELD_HELP.targetingShape}>
                        <StudioSelect options={MONSTER_TARGETING_SHAPE_OPTIONS} value={targeting.shape || "radius"} onChange={(value) => setRulesField(["targeting", "shape"], value)} />
                      </StudioField>
                      <StudioField label="Size" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.targetingSize}>
                        <input type="number" min="0" step="5" value={targeting.size ?? ""} onChange={(event) => setRulesField(["targeting", "size"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="5" />
                      </StudioField>
                      <StudioField label="Unit" icon="fa-ruler" hint="Usually ft for 5E stat block targeting.">
                        <StudioInput value={targeting.unit || "ft"} onChange={(value) => setRulesField(["targeting", "unit"], value)} placeholder="ft" />
                      </StudioField>
                      <StudioField label="Origin" icon="fa-location-crosshairs" hint={FIELD_HELP.targetingOrigin}>
                        <StudioSelect options={MONSTER_TARGETING_ORIGIN_OPTIONS} value={targeting.origin || ""} onChange={(value) => setRulesField(["targeting", "origin"], value || undefined)} />
                      </StudioField>
                      <StudioField label="Origin Text" icon="fa-quote-left" hint={FIELD_HELP.targetingOriginText}>
                        <StudioInput value={targeting.originText} onChange={(value) => setRulesField(["targeting", "originText"], value)} placeholder="centered on the corpse" />
                      </StudioField>
                    </>
                  ) : null}
                  <StudioField label="Targets" icon="fa-users" hint={FIELD_HELP.targetingTargets}>
                    <StudioInput value={targeting.targets} onChange={(value) => setRulesField(["targeting", "targets"], value)} placeholder="creatures" />
                  </StudioField>
                </div>
                <StudioField label="Targeting Text" icon="fa-quote-left" hint={FIELD_HELP.targetingText}>
                  <StudioTextarea rows={2} value={targeting.text} onChange={(value) => setRulesField(["targeting", "text"], value)} placeholder="Optional exact targeting phrase." />
                </StudioField>
              </StudioCollapsibleSection>
            ) : null}

            {hasAreaEffectBlock ? (
              <StudioCollapsibleSection icon="fa-circle-nodes" title="Area Timing" help={FIELD_HELP.areaEffect} actions={<RemoveRulesBlockButton label="Area Timing" onClick={() => removeRulesBlock("areaEffect")} />}>
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
                      <StudioField label="Area Type" icon="fa-circle-nodes" hint={FIELD_HELP.areaEffectType}>
                        <StudioSelect options={MONSTER_AREA_EFFECT_TYPE_OPTIONS} value={areaEffect.type || "aura"} onChange={(value) => setRulesField(["areaEffect", "type"], value)} />
                      </StudioField>
                      <StudioField label="Shape" icon="fa-draw-polygon" hint={FIELD_HELP.targetingShape}>
                        <StudioSelect options={MONSTER_TARGETING_SHAPE_OPTIONS} value={areaEffect.shape || "emanation"} onChange={(value) => setRulesField(["areaEffect", "shape"], value)} />
                      </StudioField>
                      <StudioField label="Size" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.targetingSize}>
                        <input type="number" min="0" step="5" value={areaEffect.size ?? ""} onChange={(event) => setRulesField(["areaEffect", "size"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="10" />
                      </StudioField>
                      <StudioField label="Unit" icon="fa-ruler" hint="Usually ft for 5E stat block area effects.">
                        <StudioInput value={areaEffect.unit || "ft"} onChange={(value) => setRulesField(["areaEffect", "unit"], value)} placeholder="ft" />
                      </StudioField>
                      <StudioField label="Origin" icon="fa-location-crosshairs" hint={FIELD_HELP.areaEffectOrigin}>
                        <StudioSelect options={MONSTER_AREA_EFFECT_ORIGIN_OPTIONS} value={areaEffect.origin || "self"} onChange={(value) => setRulesField(["areaEffect", "origin"], value)} />
                      </StudioField>
                      <StudioField label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.areaEffectTiming}>
                        <StudioSelect options={MONSTER_AREA_EFFECT_TIMING_OPTIONS} value={areaEffect.timing || "passive"} onChange={(value) => setRulesField(["areaEffect", "timing"], value)} />
                      </StudioField>
                      <StudioField label="Targets" icon="fa-users" hint={FIELD_HELP.targetingTargets}>
                        <StudioInput value={areaEffect.targets} onChange={(value) => setRulesField(["areaEffect", "targets"], value)} placeholder="creatures" />
                      </StudioField>
                      <StudioField label="Excludes" icon="fa-user-slash" hint={FIELD_HELP.areaEffectExcludes}>
                        <KeywordPillInput fieldId={`${component.id}-area-excludes`} icon="fa-ban" value={areaEffect.excludes} onChange={(value) => setRulesArray(["areaEffect", "excludes"], value)} placeholder="self, allies" />
                      </StudioField>
                    </div>
                    <StudioField label="Area Effect Text" icon="fa-quote-left" hint={FIELD_HELP.areaEffectText}>
                      <StudioTextarea rows={3} value={areaEffect.text} onChange={(value) => setRulesField(["areaEffect", "text"], value)} placeholder="Optional exact area effect text. Supports tokens like {area-size}, {area-shape}, {save-dc}, {damage}." />
                    </StudioField>
                  </>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {hasAttackResolution ? (
              <StudioCollapsibleSection icon="fa-hand-fist" title="Attack Roll" help="Attack fields appear only when Resolution is Attack Roll.">
                <div className="studio-form-grid studio-form-grid--compact">
                  <StudioField label="Attack Type" icon="fa-hand-fist" hint={FIELD_HELP.attackType}>
                    <StudioSelect options={MONSTER_ATTACK_OPTIONS} value={monsterRules.resolution?.attackType || "melee"} onChange={(value) => setRulesField(["resolution", "attackType"], value)} />
                  </StudioField>
                  <StudioField label="Attack Basis" icon="fa-dumbbell" hint={FIELD_HELP.attackBasis}>
                    <StudioSelect options={MONSTER_ATTACK_BASIS_OPTIONS} value={monsterRules.resolution?.abilityBasis || "monster"} onChange={(value) => setRulesField(["resolution", "abilityBasis"], value)} />
                  </StudioField>
                  <StudioField label="Reach" icon="fa-ruler-horizontal" hint="Attack reach printed after the attack bonus, such as 5 ft. or 10 ft.">
                    <StudioInput value={monsterRules.resolution?.reach} onChange={(value) => setRulesField(["resolution", "reach"], value)} placeholder="5 ft." />
                  </StudioField>
                  <StudioField label="Range" icon="fa-bullseye" hint="Attack range printed after the attack bonus, such as 30/120 ft. Leave empty for melee-only attacks.">
                    <StudioInput value={monsterRules.resolution?.range} onChange={(value) => setRulesField(["resolution", "range"], value)} placeholder="30/120 ft." />
                  </StudioField>
                </div>
              </StudioCollapsibleSection>
            ) : null}

            {showSaveOutcome ? (
              <StudioCollapsibleSection icon="fa-shield" title="Save & Outcome" help="Save fields appear only when the ability has a primary saving throw, a secondary save rider, or saved Failure/Success text.">
                <div className="studio-form-grid studio-form-grid--compact">
                  <StudioField label={hasPrimarySave ? "Save Ability" : "Rider Save Ability"} icon="fa-shield" hint={FIELD_HELP.saveAbility}>
                    <StudioSelect options={MONSTER_SAVE_OPTIONS} value={saveAbilityValue || "dexterity"} onChange={(value) => {
                      setRulesField([saveFieldRoot, "type"], "savingThrow");
                      setRulesField([saveFieldRoot, "ability"], value);
                      setRulesField([saveFieldRoot, "dc"], hasPrimarySave ? monsterRules.resolution?.dc || "monster" : monsterRules.secondaryResolution?.dc || "monster");
                    }} />
                  </StudioField>
                </div>
                <div className="studio-form-grid">
                  <StudioField label="Failure Text" icon="fa-circle-xmark" hint={FIELD_HELP.failureText}>
                    <StudioTextarea rows={3} value={monsterRules.text?.failure} onChange={(value) => setRulesField(["text", "failure"], value)} />
                    {generatedFailureDefault ? <p className="studio-generated-field-note">Generated default from: {generatedFailureDefault}.</p> : null}
                  </StudioField>
                  <StudioField label="Success Text" icon="fa-circle-check" hint={FIELD_HELP.successText}>
                    <StudioTextarea rows={3} value={monsterRules.text?.success} onChange={(value) => setRulesField(["text", "success"], value)} />
                    {generatedSuccessDefault ? <p className="studio-generated-field-note">{generatedSuccessDefault}</p> : null}
                  </StudioField>
                  <StudioField label="Failure or Success Text" icon="fa-circle-dot" hint={FIELD_HELP.failureOrSuccessText}>
                    <StudioTextarea rows={3} value={monsterRules.text?.failureOrSuccess} onChange={(value) => setRulesField(["text", "failureOrSuccess"], value)} />
                  </StudioField>
                </div>
              </StudioCollapsibleSection>
            ) : null}

            {hasDamageBlock ? (
              <StudioCollapsibleSection icon="fa-burst" title="Damage" help="Damage fields define whether the ability deals damage and how that damage consumes the monster DPR budget." actions={<RemoveRulesBlockButton label="Damage" onClick={() => removeRulesBlock("damage")} />}>
              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Damage Mode" icon="fa-burst" hint={FIELD_HELP.damageMode}>
                  <StudioSelect options={MONSTER_DAMAGE_MODE_OPTIONS} value={damageMode} onChange={(value) => setRulesField(["damage", "mode"], value)} />
                </StudioField>
              </div>

              {damageMode === "parts" ? (
                <div className="studio-damage-parts" aria-label="Damage parts editor">
                  {visibleDamageParts.map((part, index) => (
                    <div className="studio-damage-part" key={part.id || index}>
                      <div className="studio-damage-part__head">
                        <strong><StudioIcon name="fa-droplet" /> Damage Part {index + 1}</strong>
                        <IconOnlyRemoveButton label={`Damage Part ${index + 1}`} onClick={() => removeDamagePart(index)} disabled={!damageParts.length} />
                      </div>
                      <div className="studio-form-grid studio-form-grid--compact">
                        <StudioField label="Part ID" icon="fa-fingerprint" hint="Stable token id used by templates, for example weapon, venom, fire-rider, or necrotic-rider.">
                          <StudioInput value={part.id} onChange={(value) => setDamagePartField(index, ["id"], value)} placeholder={`part-${index + 1}`} />
                        </StudioField>
                        <StudioField label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                          <KeywordPillInput fieldId={`${component.id}-damage-part-${index}-types`} icon="fa-burst" value={part.types} onChange={(value) => setDamagePartField(index, ["types"], value)} placeholder="bludgeoning, lightning" />
                        </StudioField>
                        <StudioField label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                          <StudioSelect options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={part.budgetRole || "secondaryAttack"} onChange={(value) => setDamagePartField(index, ["budgetRole"], value)} />
                        </StudioField>
                        <StudioField label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                          <input type="number" step="0.05" min="0" value={part.budgetShare ?? ""} onChange={(event) => setDamagePartField(index, ["budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.35" />
                        </StudioField>
                        <StudioField label="Damage Scale" icon="fa-chart-simple" hint={FIELD_HELP.damageScale}>
                          <StudioSelect options={MONSTER_DAMAGE_SCALE_OPTIONS} value={part.scale || "standard"} onChange={(value) => setDamagePartField(index, ["scale"], value)} />
                        </StudioField>
                        <StudioField label="Template Token" icon="fa-code" hint="Use this token in generated or manual text to place this part's calculated damage.">
                          <input readOnly value={`{damage-part:${part.id || `part-${index + 1}`}}`} />
                        </StudioField>
                      </div>
                    </div>
                  ))}
                  <button className="studio-inline-action" type="button" onClick={addDamagePart}>
                    <StudioIcon name="fa-plus" /> Add Damage Part
                  </button>
                </div>
              ) : showDamageDetails ? (
                <div className="studio-form-grid studio-form-grid--compact">
                  <StudioField label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                    <StudioSelect options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={monsterRules.damage?.budgetRole || "none"} onChange={(value) => setRulesField(["damage", "budgetRole"], value)} />
                  </StudioField>
                  <StudioField label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                    <input type="number" step="0.05" min="0" value={monsterRules.damage?.budgetShare ?? ""} onChange={(event) => setRulesField(["damage", "budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.85" />
                  </StudioField>
                  <StudioField label="Damage Scale" icon="fa-chart-simple" hint={FIELD_HELP.damageScale}>
                    <StudioSelect options={MONSTER_DAMAGE_SCALE_OPTIONS} value={monsterRules.damage?.scale || "standard"} onChange={(value) => setRulesField(["damage", "scale"], value)} />
                  </StudioField>
                  <StudioField label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                    <KeywordPillInput fieldId={`${component.id}-damage-types`} icon="fa-burst" value={monsterRules.damage?.types} onChange={(value) => setRulesArray(["damage", "types"], value)} placeholder="bludgeoning, poison" />
                  </StudioField>
                  <StudioField label="Expected Targets" icon="fa-users" hint={FIELD_HELP.damageExpectedTargets}>
                    <input type="number" step="0.25" min="0" value={monsterRules.damage?.expectedTargets ?? ""} onChange={(event) => setRulesField(["damage", "expectedTargets"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="1" />
                  </StudioField>
                  <StudioField label="Round Weight" icon="fa-timeline" hint={FIELD_HELP.damageRoundWeight}>
                    <StudioInput value={joinList(monsterRules.damage?.roundWeight)} onChange={(value) => setRulesArray(["damage", "roundWeight"], value)} placeholder="1, 0.35, 0.35" />
                  </StudioField>
                </div>
              ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {hasConditionBlock ? (
              <StudioCollapsibleSection icon="fa-person-rays" title="Conditions" help="Condition fields define ongoing, disabling, or special condition-like effects caused by the ability." actions={<RemoveRulesBlockButton label="Conditions" onClick={() => removeRulesBlock("condition")} />}>
              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Condition Names" icon="fa-person-rays" hint={FIELD_HELP.conditionNames}>
                  <StudioInput value={conditionNames} onChange={(value) => setRulesArray(["condition", "names"], value)} placeholder="grappled, restrained" />
                </StudioField>
                {showConditionDetails ? (
                  <>
                    <StudioField label="Condition Severity" icon="fa-triangle-exclamation" hint={FIELD_HELP.conditionSeverity}>
                      <StudioSelect options={MONSTER_CONDITION_SEVERITY_OPTIONS} value={monsterRules.condition?.severity || "moderate"} onChange={(value) => setRulesField(["condition", "severity"], value)} />
                    </StudioField>
                    <StudioField label="Condition Direction" icon="fa-arrows-turn-to-dots" hint={FIELD_HELP.conditionDirection}>
                      <StudioSelect options={MONSTER_CONDITION_DIRECTION_OPTIONS} value={monsterRules.condition?.direction || "enemy"} onChange={(value) => setRulesField(["condition", "direction"], value)} />
                    </StudioField>
                    <StudioField label="Condition Duration" icon="fa-hourglass-half" hint={FIELD_HELP.conditionDuration}>
                      <StudioInput value={monsterRules.condition?.duration} onChange={(value) => setRulesField(["condition", "duration"], value)} placeholder="until the grapple ends" />
                    </StudioField>
                    <StudioField label="Size Limit" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.conditionSizeLimit}>
                      <StudioInput value={monsterRules.condition?.sizeLimit} onChange={(value) => setRulesField(["condition", "sizeLimit"], value)} placeholder="Large or smaller" />
                    </StudioField>
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
                      <StudioField label="Escape Ability" icon="fa-person-running" hint={FIELD_HELP.conditionEscapeAbility}>
                        <StudioSelect options={MONSTER_SAVE_OPTIONS} value={monsterRules.condition?.escape?.ability || "strength"} onChange={(value) => setRulesField(["condition", "escape", "ability"], value)} />
                      </StudioField>
                      <StudioField label="Escape DC Source" icon="fa-shield" hint={FIELD_HELP.conditionEscape}>
                        <StudioInput value={monsterRules.condition?.escape?.dc || "monster"} onChange={(value) => setRulesField(["condition", "escape", "dc"], value)} placeholder="monster" />
                      </StudioField>
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
                      <StudioField label="Repeat Save Ability" icon="fa-shield" hint={FIELD_HELP.conditionRepeatSave}>
                        <StudioSelect options={MONSTER_SAVE_OPTIONS} value={monsterRules.condition?.repeatSave?.ability || "constitution"} onChange={(value) => setRulesField(["condition", "repeatSave", "ability"], value)} />
                      </StudioField>
                      <StudioField label="Repeat Timing" icon="fa-hourglass-half" hint={FIELD_HELP.conditionRepeatTiming}>
                        <StudioSelect options={MONSTER_CONDITION_REPEAT_TIMING_OPTIONS} value={monsterRules.condition?.repeatSave?.timing || "endOfTurn"} onChange={(value) => setRulesField(["condition", "repeatSave", "timing"], value)} />
                      </StudioField>
                      <StudioField label="Ends on Success" icon="fa-circle-check" hint="Whether a successful repeat save ends the condition or effect on the target.">
                        <select value={monsterRules.condition?.repeatSave?.endsOnSuccess === false ? "false" : "true"} onChange={(event) => setRulesField(["condition", "repeatSave", "endsOnSuccess"], event.target.value === "true")}>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </StudioField>
                    </div>
                  ) : null}
                </>
              ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {hasOngoingBlock ? (
              <StudioCollapsibleSection icon="fa-clock-rotate-left" title="Ongoing Effect" help={FIELD_HELP.ongoingEffect} actions={<RemoveRulesBlockButton label="Ongoing" onClick={() => removeRulesBlock("ongoing")} />}>
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
                    <StudioField label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.ongoingTiming}>
                      <StudioSelect options={MONSTER_ONGOING_TIMING_OPTIONS} value={monsterRules.ongoing?.timing || "startOfTargetTurn"} onChange={(value) => setRulesField(["ongoing", "timing"], value)} />
                    </StudioField>
                    <StudioField label="End Condition" icon="fa-flag-checkered" hint={FIELD_HELP.ongoingEndCondition}>
                      <StudioInput value={monsterRules.ongoing?.endCondition} onChange={(value) => setRulesField(["ongoing", "endCondition"], value)} placeholder="until the grapple ends" />
                    </StudioField>
                    <StudioField label="Ongoing Damage Mode" icon="fa-burst" hint={FIELD_HELP.damageMode}>
                      <StudioSelect options={MONSTER_DAMAGE_MODE_OPTIONS.filter(([value]) => value !== "parts")} value={ongoingDamageMode} onChange={(value) => setRulesField(["ongoing", "damage", "mode"], value)} />
                    </StudioField>
                  </div>
                  {showOngoingDamageDetails ? (
                    <div className="studio-form-grid studio-form-grid--compact">
                      <StudioField label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                        <StudioSelect options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={monsterRules.ongoing?.damage?.budgetRole || "ongoing"} onChange={(value) => setRulesField(["ongoing", "damage", "budgetRole"], value)} />
                      </StudioField>
                      <StudioField label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                        <input type="number" step="0.05" min="0" value={monsterRules.ongoing?.damage?.budgetShare ?? ""} onChange={(event) => setRulesField(["ongoing", "damage", "budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.2" />
                      </StudioField>
                      <StudioField label="Damage Scale" icon="fa-chart-simple" hint={FIELD_HELP.damageScale}>
                        <StudioSelect options={MONSTER_DAMAGE_SCALE_OPTIONS} value={monsterRules.ongoing?.damage?.scale || "minor"} onChange={(value) => setRulesField(["ongoing", "damage", "scale"], value)} />
                      </StudioField>
                      <StudioField label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                        <KeywordPillInput fieldId={`${component.id}-ongoing-damage-types`} icon="fa-burst" value={monsterRules.ongoing?.damage?.types} onChange={(value) => setRulesArray(["ongoing", "damage", "types"], value)} placeholder="acid" />
                      </StudioField>
                    </div>
                  ) : null}
                </>
              ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {hasSummonBlock ? (
              <StudioCollapsibleSection icon="fa-people-pulling" title="Summon / Create" help={FIELD_HELP.summon} actions={<RemoveRulesBlockButton label="Summon / Create" onClick={() => removeRulesBlock("summon")} />}>
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
                      <StudioField label="Summon Type" icon="fa-people-pulling" hint={FIELD_HELP.summonType}>
                        <StudioSelect options={MONSTER_SUMMON_TYPE_OPTIONS} value={summonType} onChange={(value) => setRulesField(["summon", "type"], value)} />
                      </StudioField>
                      <StudioField label="Creature Name" icon="fa-skull" hint={FIELD_HELP.summonCreature}>
                        <StudioInput value={monsterRules.summon?.creatureName} onChange={(value) => setRulesField(["summon", "creatureName"], value)} placeholder="Shadow" />
                      </StudioField>
                      <StudioField label="Creature Ref" icon="fa-link" hint="Optional stable creature id/reference for future monster database lookup.">
                        <StudioInput value={monsterRules.summon?.creatureRef} onChange={(value) => setRulesField(["summon", "creatureRef"], value)} placeholder="shadow" />
                      </StudioField>
                      <StudioField label="Count" icon="fa-dice" hint={FIELD_HELP.summonCount}>
                        <StudioInput value={monsterRules.summon?.count} onChange={(value) => setRulesField(["summon", "count"], value)} placeholder="1d4" />
                      </StudioField>
                      <StudioField label="Placement" icon="fa-location-dot" hint={FIELD_HELP.summonPlacement}>
                        <StudioInput value={monsterRules.summon?.placement} onChange={(value) => setRulesField(["summon", "placement"], value)} placeholder="unoccupied spaces within 30 feet" />
                      </StudioField>
                      <StudioField label="Duration" icon="fa-hourglass-half" hint={FIELD_HELP.summonDuration}>
                        <StudioInput value={monsterRules.summon?.duration} onChange={(value) => setRulesField(["summon", "duration"], value)} placeholder="until destroyed" />
                      </StudioField>
                      <StudioField label="Initiative" icon="fa-timeline" hint={FIELD_HELP.summonInitiative}>
                        <StudioSelect options={MONSTER_SUMMON_INITIATIVE_OPTIONS} value={monsterRules.summon?.initiative || "immediatelyAfterSummoner"} onChange={(value) => setRulesField(["summon", "initiative"], value)} />
                      </StudioField>
                      <StudioField label="Control" icon="fa-hand" hint={FIELD_HELP.summonControl}>
                        <StudioSelect options={MONSTER_SUMMON_CONTROL_OPTIONS} value={monsterRules.summon?.control || "underSummonerControl"} onChange={(value) => setRulesField(["summon", "control"], value)} />
                      </StudioField>
                      <StudioField label="Limit" icon="fa-gauge-high" hint={FIELD_HELP.summonLimit}>
                        <StudioInput value={monsterRules.summon?.limit} onChange={(value) => setRulesField(["summon", "limit"], value)} placeholder="1/Day or maximum three at a time" />
                      </StudioField>
                      <StudioField label="Summon Trigger" icon="fa-code-branch" hint="Optional event that causes this summon, if different from the main Trigger block.">
                        <StudioInput value={monsterRules.summon?.trigger} onChange={(value) => setRulesField(["summon", "trigger"], value)} placeholder="When a humanoid dies within 30 feet" />
                      </StudioField>
                    </div>
                    <StudioField label="Summon Text" icon="fa-pen-to-square" hint={FIELD_HELP.summonText}>
                      <StudioTextarea rows={3} value={monsterRules.summon?.text} onChange={(value) => setRulesField(["summon", "text"], value)} placeholder="Leave empty to use generated wording. Tokens: {summon-creature}, {summon-placement}, {summon-duration}." />
                    </StudioField>
                  </>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {hasProcedureBlock ? (
              <StudioCollapsibleSection icon="fa-diagram-project" title="Special Procedure" help={FIELD_HELP.procedure} actions={<RemoveRulesBlockButton label="Special Procedure" onClick={() => removeRulesBlock("procedure")} />}>
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
                      <StudioField label="Procedure Type" icon="fa-diagram-project" hint={FIELD_HELP.procedureType}>
                        <StudioSelect options={MONSTER_PROCEDURE_TYPE_OPTIONS} value={procedureType} onChange={(value) => setRulesField(["procedure", "type"], value)} />
                      </StudioField>
                      <StudioField label="Target Limit" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.procedureTargetLimit}>
                        <StudioInput value={monsterRules.procedure?.targetLimit} onChange={(value) => setRulesField(["procedure", "targetLimit"], value)} placeholder="Large or smaller" />
                      </StudioField>
                    </div>
                    <div className="studio-form-grid">
                      <StudioField label="Prerequisite" icon="fa-list-check" hint={FIELD_HELP.procedurePrerequisite}>
                        <StudioTextarea rows={2} value={monsterRules.procedure?.prerequisite} onChange={(value) => setRulesField(["procedure", "prerequisite"], value)} placeholder="The target must be Grappled." />
                      </StudioField>
                      <StudioField label="Entry Effect" icon="fa-door-open" hint={FIELD_HELP.procedureEntryEffect}>
                        <StudioTextarea rows={2} value={monsterRules.procedure?.entryEffect} onChange={(value) => setRulesField(["procedure", "entryEffect"], value)} placeholder="The target is swallowed." />
                      </StudioField>
                      <StudioField label="Internal State" icon="fa-circle-nodes" hint={FIELD_HELP.procedureInternalState}>
                        <StudioTextarea rows={2} value={monsterRules.procedure?.internalState} onChange={(value) => setRulesField(["procedure", "internalState"], value)} placeholder="The swallowed target has Total Cover and the Blinded and Restrained conditions." />
                      </StudioField>
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
                          <StudioField label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.ongoingTiming}>
                            <StudioSelect options={MONSTER_PROCEDURE_TIMING_OPTIONS} value={monsterRules.procedure?.ongoingDamage?.timing || "startOfMonsterTurn"} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "timing"], value)} />
                          </StudioField>
                          <StudioField label="Damage Mode" icon="fa-burst" hint={FIELD_HELP.procedureOngoingDamage}>
                            <StudioSelect options={MONSTER_DAMAGE_MODE_OPTIONS.filter(([value]) => value !== "parts")} value={procedureOngoingDamageMode} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "damage", "mode"], value)} />
                          </StudioField>
                          {showProcedureOngoingDamageDetails ? (
                            <>
                              <StudioField label="Budget Role" icon="fa-chart-pie" hint={FIELD_HELP.damageBudgetRole}>
                                <StudioSelect options={MONSTER_DAMAGE_BUDGET_ROLE_OPTIONS} value={monsterRules.procedure?.ongoingDamage?.damage?.budgetRole || "ongoing"} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "damage", "budgetRole"], value)} />
                              </StudioField>
                              <StudioField label="Budget Share" icon="fa-percent" hint={FIELD_HELP.damageBudgetShare}>
                                <input type="number" step="0.05" min="0" value={monsterRules.procedure?.ongoingDamage?.damage?.budgetShare ?? ""} onChange={(event) => setRulesField(["procedure", "ongoingDamage", "damage", "budgetShare"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="0.25" />
                              </StudioField>
                              <StudioField label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.damageTypes}>
                                <KeywordPillInput fieldId={`${component.id}-procedure-ongoing-damage-types`} icon="fa-burst" value={monsterRules.procedure?.ongoingDamage?.damage?.types} onChange={(value) => setRulesArray(["procedure", "ongoingDamage", "damage", "types"], value)} placeholder="acid" />
                              </StudioField>
                            </>
                          ) : null}
                        </div>
                        <StudioField label="Ongoing End Condition" icon="fa-hourglass-end" hint={FIELD_HELP.ongoingEndCondition}>
                          <StudioInput value={monsterRules.procedure?.ongoingDamage?.endCondition} onChange={(value) => setRulesField(["procedure", "ongoingDamage", "endCondition"], value)} placeholder="until the target escapes" />
                        </StudioField>
                      </>
                    ) : null}
                    <div className="studio-form-grid">
                      <StudioField label="Escape Condition" icon="fa-person-running" hint={FIELD_HELP.procedureEscapeCondition}>
                        <StudioTextarea rows={2} value={monsterRules.procedure?.escapeCondition} onChange={(value) => setRulesField(["procedure", "escapeCondition"], value)} placeholder="If the monster takes 20 damage or more on a single turn from inside it..." />
                      </StudioField>
                      <StudioField label="Release Condition" icon="fa-door-open" hint={FIELD_HELP.procedureReleaseCondition}>
                        <StudioTextarea rows={2} value={monsterRules.procedure?.releaseCondition} onChange={(value) => setRulesField(["procedure", "releaseCondition"], value)} placeholder="If the monster dies, the target is no longer Restrained and can escape." />
                      </StudioField>
                    </div>
                    <StudioField label="Procedure Text" icon="fa-pen-to-square" hint={FIELD_HELP.procedureText}>
                      <StudioTextarea rows={3} value={monsterRules.procedure?.text} onChange={(value) => setRulesField(["procedure", "text"], value)} placeholder="Leave empty to use generated wording. Tokens: {procedure-ongoing-damage}, {procedure-release-condition}." />
                    </StudioField>
                  </>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}

            {hasDefenseBlock ? (
              <StudioCollapsibleSection icon="fa-shield-halved" title="Defense" help={FIELD_HELP.defenseFeature} actions={<RemoveRulesBlockButton label="Defense" onClick={() => removeRulesBlock("defense")} />}>
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
                      <StudioField label="Defense Type" icon="fa-shield-halved" hint={FIELD_HELP.defenseType}>
                        <StudioSelect options={MONSTER_DEFENSE_TYPE_OPTIONS} value={defenseType} onChange={(value) => setRulesField(["defense", "type"], value)} />
                      </StudioField>
                      <StudioField label="Timing" icon="fa-hourglass-half" hint={FIELD_HELP.defenseTiming}>
                        <StudioSelect options={MONSTER_DEFENSE_TIMING_OPTIONS} value={monsterRules.defense?.timing || "passive"} onChange={(value) => setRulesField(["defense", "timing"], value)} />
                      </StudioField>
                      {showDefenseUses ? (
                        <StudioField label="Uses" icon="fa-dice-six" hint={FIELD_HELP.defenseUses}>
                          <input type="number" min="0" step="1" value={monsterRules.defense?.uses ?? ""} onChange={(event) => setRulesField(["defense", "uses"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="3" />
                        </StudioField>
                      ) : null}
                      {showDefenseValue ? (
                        <StudioField label="Value" icon="fa-plus" hint={FIELD_HELP.defenseValue}>
                          <input type="number" min="0" step="1" value={monsterRules.defense?.value ?? ""} onChange={(event) => setRulesField(["defense", "value"], event.target.value === "" ? undefined : Number(event.target.value))} placeholder="10" />
                        </StudioField>
                      ) : null}
                      {showDefenseDamageTypes ? (
                        <StudioField label="Damage Types" icon="fa-droplet" hint={FIELD_HELP.defenseDamageTypes}>
                          <KeywordPillInput fieldId={`${component.id}-defense-damage-types`} icon="fa-shield-halved" value={monsterRules.defense?.damageTypes} onChange={(value) => setRulesArray(["defense", "damageTypes"], value)} placeholder="fire, necrotic" />
                        </StudioField>
                      ) : null}
                      {showDefenseBreakCondition ? (
                        <StudioField label="Break Condition" icon="fa-ban" hint={FIELD_HELP.defenseBreakCondition}>
                          <StudioInput value={monsterRules.defense?.breakCondition} onChange={(value) => setRulesField(["defense", "breakCondition"], value)} placeholder="takes Fire damage" />
                        </StudioField>
                      ) : null}
                    </div>
                    <StudioField label="Defense Text" icon="fa-pen-to-square" hint={FIELD_HELP.defenseText}>
                      <StudioTextarea rows={3} value={monsterRules.defense?.text} onChange={(value) => setRulesField(["defense", "text"], value)} placeholder="Leave empty to use standard generated wording." />
                    </StudioField>
                  </>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}



            {hasReferencesBlock ? (
              <StudioCollapsibleSection icon="fa-link" title="Ability Links" help={FIELD_HELP.references} actions={<RemoveRulesBlockButton label="Ability Links" onClick={() => removeRulesBlock("references")} />}>
                <div className="studio-damage-parts" aria-label="Ability links editor">
                  {visibleAbilityReferences.map((reference, index) => (
                    <div className="studio-damage-part" key={reference.id || reference.ref || index}>
                      <div className="studio-damage-part__head">
                        <strong><StudioIcon name="fa-link" /> Ability Link {index + 1}</strong>
                        <IconOnlyRemoveButton label={`Ability Link ${index + 1}`} onClick={() => removeAbilityReference(index)} disabled={!abilityReferences.length} />
                      </div>
                      <div className="studio-form-grid studio-form-grid--compact">
                        <StudioField label="Reference Type" icon="fa-diagram-project" hint={FIELD_HELP.referenceType}>
                          <StudioSelect options={MONSTER_REFERENCE_TYPE_OPTIONS} value={reference.type || "action"} onChange={(value) => setAbilityReferenceField(index, ["type"], value)} />
                        </StudioField>
                        <StudioField label="Relationship" icon="fa-code-branch" hint={FIELD_HELP.referenceRelationship}>
                          <StudioSelect options={MONSTER_REFERENCE_RELATIONSHIP_OPTIONS} value={reference.relationship || "uses"} onChange={(value) => setAbilityReferenceField(index, ["relationship"], value)} />
                        </StudioField>
                        <StudioField label="Reference ID" icon="fa-fingerprint" hint={FIELD_HELP.referenceRef}>
                          <StudioInput value={reference.ref} onChange={(value) => setAbilityReferenceField(index, ["ref"], value)} placeholder="bite" />
                        </StudioField>
                        <StudioField label="Label" icon="fa-tag" hint={FIELD_HELP.referenceLabel}>
                          <StudioInput value={reference.label} onChange={(value) => setAbilityReferenceField(index, ["label"], value)} placeholder="Bite" />
                        </StudioField>
                        <StudioField label="Count" icon="fa-hashtag" hint={FIELD_HELP.referenceCount}>
                          <StudioInput value={reference.count ?? ""} onChange={(value) => setAbilityReferenceField(index, ["count"], value)} placeholder="1, 2, one, any" />
                        </StudioField>
                        <StudioField label="Template Token" icon="fa-code" hint="Use this token in generated or manual text to place this reference sentence.">
                          <input readOnly value={`{reference:${reference.ref || reference.label || `ability-${index + 1}`}}`} />
                        </StudioField>
                      </div>
                      <StudioField label="Custom Reference Text" icon="fa-quote-left" hint={FIELD_HELP.referenceText}>
                        <StudioTextarea rows={2} value={reference.text} onChange={(value) => setAbilityReferenceField(index, ["text"], value)} placeholder="Optional exact sentence for this linked ability." />
                      </StudioField>
                    </div>
                  ))}
                  <button className="studio-inline-action" type="button" onClick={addAbilityReference}>
                    <StudioIcon name="fa-plus" /> Add Ability Link
                  </button>
                </div>
              </StudioCollapsibleSection>
            ) : null}

            {hasOutputTextBlock ? (
              <StudioCollapsibleSection icon={outputTextIcon} title="Output Text" help="Output text is the generated rules prose attached to the selected resolution type." actions={<RemoveRulesBlockButton label="Output Text" onClick={() => removeRulesBlock("outputText")} />}>
                <StudioField label={outputTextLabel} icon={outputTextIcon} hint={outputTextHelp}>
                  <StudioTextarea rows={3} value={outputTextValue} onChange={(value) => setRulesField(outputTextPath, value)} />
                </StudioField>
                {hasAttackResolution ? (
                  <div className="studio-form-grid">
                    <StudioField label="Miss Text" icon="fa-circle-xmark" hint={FIELD_HELP.missText}>
                      <StudioTextarea rows={3} value={monsterRules.text?.miss} onChange={(value) => setRulesField(["text", "miss"], value)} />
                    </StudioField>
                    <StudioField label="Hit or Miss Text" icon="fa-circle-dot" hint={FIELD_HELP.hitOrMissText}>
                      <StudioTextarea rows={3} value={monsterRules.text?.hitOrMiss} onChange={(value) => setRulesField(["text", "hitOrMiss"], value)} />
                    </StudioField>
                  </div>
                ) : null}
              </StudioCollapsibleSection>
            ) : null}
          </div>

          {hasCounterplayBlock ? (
            <StudioCollapsibleSection zone="output" icon="fa-shield-halved" title="Counterplay" help="Counterplay explains what players can notice, prevent, avoid, exploit, or clean up." actions={<RemoveRulesBlockButton label="Counterplay" onClick={() => removeRulesBlock("counterplay")} />}>
              <StudioField label="Counterplay" icon="fa-shield-halved" hint={FIELD_HELP.counterplay}>
                <StudioTextarea rows={3} value={component.counterplay} onChange={(value) => setField(["counterplay"], value)} />
              </StudioField>
            </StudioCollapsibleSection>
          ) : null}

          <StudioDividerLabel zone="output" icon="fa-scroll" title="Stat Block Text" help="This final text is what the Monster Composer exports for this graft. Generated mode is built from the fields above; Manual Override can still use formula tokens." />
          <StudioCollapsibleSection zone="output" defaultOpen icon="fa-scroll" title="Text Source" help="Choose whether this graft exports generated text or a manual override.">
            <div className="studio-text-source-toggle" role="group" aria-label="Stat block text source">
              <button type="button" aria-pressed={textSource !== "manual"} onClick={() => setRulesField(["text", "source"], "generated")}>Generated</button>
              <button type="button" aria-pressed={textSource === "manual"} onClick={() => setRulesField(["text", "source"], "manual")}>Manual Override</button>
            </div>
            {textSource === "manual" ? (
              <StudioField label="Manual Stat Block Text" icon="fa-pen-to-square" hint={FIELD_HELP.manualRulesText}>
                <StudioTextarea rows={5} value={monsterRules.text?.manual} onChange={(value) => setRulesField(["text", "manual"], value)} placeholder="Use tokens like {attack-bonus}, {save-dc}, {damage:standard}, {damage-part:venom}." />
              </StudioField>
            ) : null}
            <StudioField label="Generated Stat Block Preview" icon="fa-eye" hint={FIELD_HELP.generatedRulesPreview}>
              <StudioTextarea className="studio-generated-preview" rows={6} readOnly value={finalRulesPreview || "No generated rules text yet."} />
            </StudioField>
          </StudioCollapsibleSection>
        </div>
      ) : null}


      {!isMonsterGraft && activeComponentEditorTab === "output" ? (
        <div className="studio-component-editor__subpanel" data-editor-zone="output">
          {isLocationRegion ? (
            <StudioCollapsibleSection defaultOpen icon="fa-dungeon" title="Location Region Data" help="Map-region fields consumed by Dark Places and the Map Generator.">
              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Role" icon="fa-compass" hint={FIELD_HELP.regionRole}>
                  <StudioInput value={component.locationRegion?.role} onChange={(value) => setField(["locationRegion", "role"], value)} />
                </StudioField>
                <StudioField label="Size" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.regionSize}>
                  <StudioSelect options={[["Small", "Small"], ["Medium", "Medium"], ["Large", "Large"]]} value={component.locationRegion?.size || "Medium"} onChange={setLocationRegionSize} />
                </StudioField>
                <StudioField label="Shape" icon="fa-draw-polygon" hint={FIELD_HELP.regionShape}>
                  <StudioInput value={component.locationRegion?.shape} onChange={setLocationRegionShape} />
                </StudioField>
                <StudioField label="Connectors" icon="fa-code-branch" hint={FIELD_HELP.regionConnectors}>
                  <input type="number" min="0" max="8" value={component.locationRegion?.connectors ?? 0} onChange={(event) => setField(["locationRegion", "connectors"], Number(event.target.value))} />
                </StudioField>
                <StudioField label="Room Archetype" icon="fa-dungeon" hint={FIELD_HELP.regionRoomArchetype}>
                  <StudioSelect options={ROOM_ARCHETYPE_SELECT_OPTIONS} value={regionRoomArchetype} onChange={setLocationRegionRoomArchetype} />
                </StudioField>
              </div>
            </StudioCollapsibleSection>
          ) : null}

          {(isLocationRegion || isLocationComponent) ? (
            <StudioCollapsibleSection
              defaultOpen={hasRoomDesignData}
              icon="fa-shapes"
              title="Room Design"
              help="Structured room shape, size constraints, required props, and topology hints. Presets only fill fields; they do not lock editing."
              actions={hasRoomDesignData ? <RemoveRulesBlockButton label="Room Design" onClick={clearLocationRegionRoomDesign} /> : null}
            >
              <div className="studio-inferred-rules-note" data-room-design-active={hasRoomDesignData ? "true" : "false"}>
                <StudioIcon name={hasRoomDesignData ? "fa-shapes" : "fa-circle-info"} />
                <span>
                  <strong>{hasRoomDesignData ? "Room Design" : "No Room Design"}</strong>
                  {` ${roomDesignEditorModel.summary}`}
                </span>
              </div>

              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Apply Preset" icon="fa-wand-magic-sparkles" hint="Optional shortcut. Applying a preset fills modular roomDesign fields; every field remains editable afterward.">
                  <StudioSelect options={ROOM_DESIGN_PRESET_SELECT_OPTIONS} value={regionRoomDesign.presetId || ""} onChange={applyRoomDesignPreset} />
                </StudioField>
                <StudioField label="Shape Kind" icon="fa-draw-polygon" hint={FIELD_HELP.roomDesignShape}>
                  <StudioSelect options={ROOM_DESIGN_SHAPE_SELECT_OPTIONS} value={regionRoomDesignShape.kind || ""} onChange={(value) => setLocationRegionRoomDesignField(["shape", "kind"], value)} />
                </StudioField>
                <StudioField label="Size Scale" icon="fa-up-right-and-down-left-from-center" hint={FIELD_HELP.roomDesignSize}>
                  <StudioSelect options={ROOM_DESIGN_SIZE_SCALE_OPTIONS} value={regionRoomDesignSize.scale || ""} onChange={(value) => setLocationRegionRoomDesignField(["size", "scale"], value)} />
                </StudioField>
                <StudioField label="Proportion" icon="fa-expand" hint={FIELD_HELP.roomDesignSize}>
                  <StudioSelect options={ROOM_DESIGN_ASPECT_OPTIONS} value={regionRoomDesignSize.aspectRatio || ""} onChange={(value) => setLocationRegionRoomDesignField(["size", "aspectRatio"], value)} />
                </StudioField>
                <StudioField label="Min Diameter" icon="fa-circle" hint={FIELD_HELP.roomDesignSize}>
                  <input type="number" min="1" max="40" value={formatRoomDesignNumber(regionRoomDesignSize.minDiameterCells)} onChange={(event) => setLocationRegionRoomDesignNumber(["size", "minDiameterCells"], event.target.value)} />
                </StudioField>
                <StudioField label="Min Width" icon="fa-arrows-left-right" hint={FIELD_HELP.roomDesignSize}>
                  <input type="number" min="1" max="40" value={formatRoomDesignNumber(regionRoomDesignSize.minWidthCells)} onChange={(event) => setLocationRegionRoomDesignNumber(["size", "minWidthCells"], event.target.value)} />
                </StudioField>
                <StudioField label="Min Height" icon="fa-arrows-up-down" hint={FIELD_HELP.roomDesignSize}>
                  <input type="number" min="1" max="40" value={formatRoomDesignNumber(regionRoomDesignSize.minHeightCells)} onChange={(event) => setLocationRegionRoomDesignNumber(["size", "minHeightCells"], event.target.value)} />
                </StudioField>
                <StudioField label="Max Width" icon="fa-compress" hint={FIELD_HELP.roomDesignSize}>
                  <input type="number" min="1" max="40" value={formatRoomDesignNumber(regionRoomDesignSize.maxWidthCells)} onChange={(event) => setLocationRegionRoomDesignNumber(["size", "maxWidthCells"], event.target.value)} />
                </StudioField>
                <StudioField label="Max Height" icon="fa-compress" hint={FIELD_HELP.roomDesignSize}>
                  <input type="number" min="1" max="40" value={formatRoomDesignNumber(regionRoomDesignSize.maxHeightCells)} onChange={(event) => setLocationRegionRoomDesignNumber(["size", "maxHeightCells"], event.target.value)} />
                </StudioField>
                <StudioField label="Min Area" icon="fa-border-all" hint={FIELD_HELP.roomDesignSize}>
                  <input type="number" min="1" max="400" value={formatRoomDesignNumber(regionRoomDesignSize.minAreaCells)} onChange={(event) => setLocationRegionRoomDesignNumber(["size", "minAreaCells"], event.target.value)} />
                </StudioField>
                <StudioField label="Max Area" icon="fa-border-none" hint={FIELD_HELP.roomDesignSize}>
                  <input type="number" min="1" max="400" value={formatRoomDesignNumber(regionRoomDesignSize.maxAreaCells)} onChange={(event) => setLocationRegionRoomDesignNumber(["size", "maxAreaCells"], event.target.value)} />
                </StudioField>
              </div>

              <StudioField label="Shape Modifiers" icon="fa-sliders" hint="Optional geometry modifiers that the engine can progressively support without creating one-off archetypes.">
                <KeywordPillInput allowCustom={false} fieldId={`${component.id}-room-design-modifiers`} icon="fa-sliders" value={roomDesignEditorModel.modifiers} onChange={(value) => setLocationRegionRoomDesignArray(["shape", "modifiers"], value)} placeholder="notch, ruined, side-alcoves" suggestions={ROOM_DESIGN_MODIFIER_OPTIONS} />
              </StudioField>

              <StudioDividerLabel zone="output" icon="fa-location-dot" title="Required Props" help="Props listed here should always be placed when possible. Use them to build presets like a circular room with a center well without hardcoding a one-off archetype." />
              <div className="studio-rules-list" data-room-design-props={regionRoomDesignRequiredProps.length}>
                {regionRoomDesignRequiredProps.map((prop, propIndex) => (
                  <div className="studio-form-grid studio-form-grid--compact" key={`room-design-prop-${propIndex}`}>
                    <StudioField label={`Prop ${propIndex + 1}`} icon="fa-location-dot" hint={FIELD_HELP.roomDesignProps}>
                      <StudioSelect options={ROOM_DESIGN_PROP_KIND_OPTIONS} value={prop.kind || ""} onChange={(value) => setLocationRegionRequiredPropField(propIndex, ["kind"], value)} />
                    </StudioField>
                    <StudioField label="Placement" icon="fa-crosshairs" hint={FIELD_HELP.roomDesignProps}>
                      <StudioSelect options={ROOM_DESIGN_PLACEMENT_OPTIONS} value={prop.placement || "center"} onChange={(value) => setLocationRegionRequiredPropField(propIndex, ["placement"], value)} />
                    </StudioField>
                    <StudioField label="Radius" icon="fa-circle-dot" hint="Optional minimum radius in cells for circular props such as wells, pits, or voids.">
                      <input type="number" min="0" max="12" step="0.25" value={formatRoomDesignNumber(prop.minRadiusCells)} onChange={(event) => setLocationRegionRequiredPropField(propIndex, ["minRadiusCells"], event.target.value === "" ? "" : Number(event.target.value))} />
                    </StudioField>
                    <StudioField label="Scale" icon="fa-up-right-and-down-left-from-center" hint="Optional visual scale multiplier for this required prop.">
                      <input type="number" min="0.25" max="3" step="0.05" value={formatRoomDesignNumber(prop.sizeScale)} onChange={(event) => setLocationRegionRequiredPropField(propIndex, ["sizeScale"], event.target.value === "" ? "" : Number(event.target.value))} />
                    </StudioField>
                    {regionRoomDesignRequiredProps.length > 1 || prop.kind ? (
                      <StudioField label="Remove Prop" icon="fa-trash" hint="Remove this required prop from the roomDesign payload.">
                        <button type="button" className="studio-inline-action studio-inline-action--compact" onClick={() => removeLocationRegionRequiredProp(propIndex)}>
                          <StudioIcon name="fa-trash" /> Remove Prop
                        </button>
                      </StudioField>
                    ) : null}
                  </div>
                ))}
              </div>
              <button type="button" className="studio-inline-action studio-inline-action--compact" onClick={addLocationRegionRequiredProp}>
                <StudioIcon name="fa-plus" /> Add Required Prop
              </button>

              <StudioDividerLabel zone="output" icon="fa-diagram-project" title="Topology Hints" help="Optional placement hints. These should guide the graph without replacing mapInfluence or manual map editing." />
              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Branch Bias" icon="fa-code-branch" hint="Optional graph preference for where this room should sit in the generated map.">
                  <StudioSelect options={ROOM_DESIGN_BRANCH_BIAS_OPTIONS} value={regionRoomDesignTopology.branchBias || ""} onChange={(value) => setLocationRegionRoomDesignField(["topology", "branchBias"], value)} />
                </StudioField>
                <StudioField label="Depth Bias" icon="fa-route" hint="Optional preference for early, middle, or deep placement.">
                  <StudioSelect options={ROOM_DESIGN_DEPTH_BIAS_OPTIONS} value={regionRoomDesignTopology.depthBias || ""} onChange={(value) => setLocationRegionRoomDesignField(["topology", "depthBias"], value)} />
                </StudioField>
                <StudioField label="Secret" icon="fa-user-secret" hint="Optional secret-room hint. Leave automatic unless the room must be treated as hidden.">
                  <StudioSelect options={ROOM_DESIGN_SECRET_OPTIONS} value={regionRoomDesignTopology.secret === true ? "true" : regionRoomDesignTopology.secret === false ? "false" : ""} onChange={(value) => setLocationRegionRoomDesignField(["topology", "secret"], value === "" ? "" : value === "true")} />
                </StudioField>
              </div>
            </StudioCollapsibleSection>
          ) : null}

          {(isLocationRegion || isLocationComponent) ? (
            <StudioCollapsibleSection
              defaultOpen
              icon="fa-map-location-dot"
              title="Map Influence"
              help="Optional map-generation influence. Use this when a component assigned to a room should prefer, forbid, or force a room archetype."
              actions={hasMapInfluenceData ? <RemoveRulesBlockButton label="Map Influence" onClick={clearMapInfluence} /> : null}
            >
              <div className="studio-inferred-rules-note" data-map-influence-mode={mapInfluenceEditorModel.mode.toLowerCase().replaceAll(" ", "-")}>
                <StudioIcon name={mapInfluenceEditorModel.mode === "Forced" ? "fa-lock" : mapInfluenceEditorModel.mode === "Forbid only" ? "fa-ban" : mapInfluenceEditorModel.mode === "Suggested" ? "fa-map-location-dot" : "fa-circle-info"} />
                <span>
                  <strong>{mapInfluenceEditorModel.mode === "Inactive" ? "No map influence" : `Map Influence · ${mapInfluenceEditorModel.mode}`}</strong>
                  {` ${mapInfluenceEditorModel.summary}`}
                  {mapInfluenceEditorModel.conflicts.length ? ` Conflict: ${mapInfluenceEditorModel.conflicts.map(getRoomArchetypeLabel).join(", ")} is both preferred and forbidden.` : ""}
                </span>
                {canSyncRegionArchetypeInfluence ? (
                  <button type="button" className="studio-icon-button" onClick={syncRegionArchetypeToMapInfluence} title="Use this region archetype as forced map influence">
                    <StudioIcon name="fa-link" />
                  </button>
                ) : null}
              </div>
              <div className="studio-form-grid studio-form-grid--compact">
                <StudioField label="Influence Archetype" icon="fa-dungeon" hint="Optional direct archetype target used when Force is enabled, or as a strong preference when combined with preferred archetypes.">
                  <StudioSelect options={ROOM_ARCHETYPE_SELECT_OPTIONS} value={mapInfluenceRoomArchetype} onChange={(value) => setMapInfluenceField(["roomArchetype"], value)} />
                </StudioField>
                <StudioField label="Preferred Archetypes" icon="fa-star" hint={FIELD_HELP.mapInfluencePreferredArchetypes}>
                  <KeywordPillInput allowCustom={false} fieldId={`${component.id}-preferred-room-archetypes`} icon="fa-star" value={editableMapInfluence.preferredRoomArchetypes} onChange={(value) => setMapInfluenceArray("preferredRoomArchetypes", value)} placeholder="bone-well, reliquary-niche" suggestions={ROOM_ARCHETYPE_SUGGESTIONS} />
                </StudioField>
                <StudioField label="Forbidden Archetypes" icon="fa-ban" hint={FIELD_HELP.mapInfluenceForbiddenArchetypes}>
                  <KeywordPillInput allowCustom={false} fieldId={`${component.id}-forbidden-room-archetypes`} icon="fa-ban" value={editableMapInfluence.forbiddenRoomArchetypes} onChange={(value) => setMapInfluenceArray("forbiddenRoomArchetypes", value)} placeholder="bone-well" suggestions={ROOM_ARCHETYPE_SUGGESTIONS} />
                </StudioField>
                <StudioField label="Force Archetype" icon="fa-lock" hint={FIELD_HELP.mapInfluenceForce}>
                  <select value={editableMapInfluence.forceRoomArchetype ? "true" : "false"} onChange={(event) => setMapInfluenceField(["forceRoomArchetype"], event.target.value === "true")}>
                    <option value="false">Recommend only</option>
                    <option value="true">Force selected archetype</option>
                  </select>
                </StudioField>
                <StudioField label="Weight" icon="fa-scale-balanced" hint={FIELD_HELP.mapInfluenceWeight}>
                  <input type="number" min="0" step="0.25" value={editableMapInfluence.weight ?? ""} onChange={(event) => setMapInfluenceField(["weight"], event.target.value === "" ? "" : Number(event.target.value))} placeholder="2" />
                </StudioField>
                <StudioField label="Influence Source" icon="fa-fingerprint" hint={FIELD_HELP.mapInfluenceSource}>
                  <StudioInput value={editableMapInfluence.source} onChange={(value) => setMapInfluenceField(["source"], value)} placeholder={getMapInfluenceSourceFallback(component)} />
                </StudioField>
              </div>
              <StudioField label="Influence Note" icon="fa-note-sticky" hint={FIELD_HELP.mapInfluenceNote}>
                <StudioTextarea rows={2} value={editableMapInfluence.note} onChange={(value) => setMapInfluenceField(["note"], value)} placeholder="Explain why this component should change the generated room archetype." />
              </StudioField>
            </StudioCollapsibleSection>
          ) : null}
        </div>
      ) : null}

      {!isMonsterGraft ? (
        <>
          <StudioCollapsibleSection zone="qa" icon="fa-code" title="Raw Component JSON" help="Read-only component payload for debugging saved data and future Supabase migration checks.">
            <StudioField label="Raw JSON" icon="fa-code" hint="Read-only JSON for the selected component. Use this only for debugging.">
              <StudioTextarea className="studio-generated-preview studio-raw-json-preview" rows={16} readOnly value={JSON.stringify(component, null, 2)} />
            </StudioField>
          </StudioCollapsibleSection>
          <StudioCollapsibleSection zone="qa" icon="fa-trash" title="Danger Zone" help="Remove this component from the current Inspiration Module.">
            <StudioArmedDeleteButton onConfirm={onRemove} />
          </StudioCollapsibleSection>
        </>
      ) : null}
    </div>
  );
}
