import { useEffect, useMemo, useState } from "react";
import { loadContentPackSummaries, loadInspirationModules } from "../../shared/content/content.index.js";
import { renderStructuredRulesTemplate } from "../monster-composer/model/monster-graft-rules.render.js";

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
  ["attackRollSavingThrow", "Attack Roll + Saving Throw"],
  ["savingThrow", "Saving Throw"],
  ["automatic", "Automatic"],
  ["check", "Check"],
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

const MONSTER_TEXT_MODE_OPTIONS = [
  ["generated", "Generated"],
  ["manual", "Manual Override"],
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
  attackType: "For Attack Roll abilities, choose whether the attack is melee, ranged, or can be either.",
  attackBasis: "Editorial basis for the attack. Melee usually uses Strength, ranged usually uses Dexterity, but the printed attack bonus still comes from the monster baseline unless set otherwise.",
  attackReach: "Reach printed for melee or melee/ranged attacks, such as 5 ft., 10 ft., or 15 ft.",
  attackRange: "Range printed for ranged or melee/ranged attacks, such as 30/120 ft.",
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
  failureText: "Text generated after Failure: for a structured saving throw or secondary save.",
  successText: "Text generated after Success: for a structured saving throw or secondary save.",
  effectText: "Structured effect text for traits, triggers, reactions, or additional generated rules text. Supports tokens such as {attack-bonus}, {save-dc}, {damage}, {average-damage}, and {damage-scale:standard}.",
  textMode: "Choose whether this graft uses generated stat block text from the structured fields or a manual override template.",
  manualText: "Manual stat block template. It may still use tokens such as {attack-bonus}, {save-dc}, {damage}, {average-damage}, and {damage-scale:standard}.",
  statBlockPreview: "Read-only preview of the stat block text this graft will contribute. Token placeholders are resolved during monster export.",
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
  return <textarea {...props} value={value || ""} onChange={(event) => onChange(event.target.value)} />;
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

function RulesGroup({ icon, title, help, children }) {
  return (
    <section className="studio-rules-group">
      <header className="studio-rules-group__heading">
        <span className="studio-rules-group__title">
          {icon ? <Icon name={icon} /> : null}
          {title}
        </span>
        <HelpTooltip title={title} text={help} />
      </header>
      <div className="studio-rules-group__body">{children}</div>
    </section>
  );
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
    setField(["monster", "rules", ...path], value);
  }

  function setRulesArray(path, value) {
    setRulesField(path, splitList(value));
  }

  function setMonsterSlot(value) {
    onChange((nextComponent) => {
      nextComponent.monster = nextComponent.monster || {};
      nextComponent.monster.slot = value;
      nextComponent.slots = value ? [value] : [];
    });
  }

  function updateRules(mutator) {
    onChange((nextComponent) => {
      nextComponent.monster = nextComponent.monster || {};
      nextComponent.monster.rules = nextComponent.monster.rules || {};
      mutator(nextComponent.monster.rules, nextComponent);
    });
  }

  function setResolutionChoice(value) {
    updateRules((rules) => {
      rules.resolution = rules.resolution || {};
      if (value === "attackRollSavingThrow") {
        rules.resolution.type = "attackRoll";
        rules.resolution.attackType = rules.resolution.attackType || "melee";
        rules.resolution.abilityBasis = rules.resolution.abilityBasis || "strength";
        rules.resolution.bonus = rules.resolution.bonus || "monster";
        rules.resolution.reach = rules.resolution.reach || "5 ft.";
        rules.secondaryResolution = rules.secondaryResolution || {};
        rules.secondaryResolution.type = "savingThrow";
        rules.secondaryResolution.ability = rules.secondaryResolution.ability || "strength";
        rules.secondaryResolution.dc = rules.secondaryResolution.dc || "monster";
        return;
      }

      rules.resolution.type = value;
      if (value === "attackRoll") {
        rules.resolution.attackType = rules.resolution.attackType || "melee";
        rules.resolution.abilityBasis = rules.resolution.abilityBasis || "strength";
        rules.resolution.bonus = rules.resolution.bonus || "monster";
        rules.resolution.reach = rules.resolution.reach || "5 ft.";
      }
      if (value === "savingThrow") {
        rules.resolution.ability = rules.resolution.ability || "dexterity";
        rules.resolution.dc = rules.resolution.dc || "monster";
      }
      if (value !== "attackRollSavingThrow") {
        delete rules.secondaryResolution;
      }
    });
  }

  const monsterRules = component.monster?.rules || component.rules || {};
  const ruleSection = component.monster?.section || monsterRules.section || "trait";
  const actionEconomy = monsterRules.actionEconomy || "passive";
  const usageType = monsterRules.usage?.type || "passive";
  const resolutionType = monsterRules.resolution?.type || "none";
  const damageMode = monsterRules.damage?.mode || "none";
  const conditionNames = joinList(monsterRules.condition?.names);
  const hasAttackResolution = resolutionType === "attackRoll";
  const hasPrimarySave = resolutionType === "savingThrow";
  const hasSecondarySave = monsterRules.secondaryResolution?.type === "savingThrow";
  const hasSaveOutcomeText = Boolean(monsterRules.text?.failure || monsterRules.text?.success);
  const resolutionChoice = hasAttackResolution && hasSecondarySave ? "attackRollSavingThrow" : resolutionType;
  const textMode = monsterRules.text?.mode || (monsterRules.text?.manual ? "manual" : "generated");
  const isManualText = textMode === "manual";
  const showUsageValue = ["recharge", "limited", "legendary"].includes(usageType) || Boolean(monsterRules.usage?.value);
  const showTrigger = ["reaction", "deathTrigger", "freeTrigger"].includes(actionEconomy) || ["triggered", "death"].includes(usageType) || Boolean(monsterRules.trigger);
  const showSaveOutcome = hasPrimarySave || hasSecondarySave || hasSaveOutcomeText;
  const saveFieldRoot = hasPrimarySave ? "resolution" : "secondaryResolution";
  const saveAbilityValue = hasPrimarySave ? monsterRules.resolution?.ability : monsterRules.secondaryResolution?.ability;
  const showDamageDetails = damageMode !== "none" || Boolean(monsterRules.damage?.budgetRole && monsterRules.damage.budgetRole !== "none") || Boolean(monsterRules.damage?.budgetShare) || Boolean(monsterRules.damage?.expectedTargets) || Boolean(asArray(monsterRules.damage?.types).length);
  const showConditionDetails = Boolean(conditionNames || monsterRules.condition?.duration || monsterRules.condition?.severity);
  const outputTextLabel = hasAttackResolution
    ? "Hit Text Template"
    : actionEconomy === "reaction"
      ? "Response Text Template"
      : ruleSection === "death"
        ? "Death Effect Template"
        : ruleSection === "trait"
          ? "Trait Text Template"
          : "Effect Text Template";
  const outputTextIcon = hasAttackResolution ? "fa-crosshairs" : actionEconomy === "reaction" ? "fa-reply" : "fa-wand-magic-sparkles";
  const outputTextHelp = hasAttackResolution
    ? "Text generated after Hit:. Use tokens such as {damage}, {average-damage}, {damage-scale:standard}, {save-dc}, and {pb}."
    : actionEconomy === "reaction"
      ? "Text generated as the reaction response after the trigger. Token placeholders are resolved during export."
      : FIELD_HELP.effectText;
  const outputTextPath = hasAttackResolution ? ["text", "hit"] : actionEconomy === "reaction" ? ["text", "response"] : ["text", "effect"];
  const outputTextValue = hasAttackResolution ? monsterRules.text?.hit : actionEconomy === "reaction" ? monsterRules.text?.response : monsterRules.text?.effect;
  const previewFeature = {
    ...component,
    slot: component.monster?.slot || component.slot,
    section: ruleSection,
    rules: monsterRules,
    mechanics: component.mechanics,
  };
  const statBlockPreview = isMonsterGraft
    ? renderStructuredRulesTemplate(previewFeature) || component.mechanics || "No stat block text generated yet."
    : "";

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
                <TextInput value={component.monster?.slot} onChange={setMonsterSlot} />
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

            {showTrigger ? (
              <RulesGroup icon="fa-code-branch" title="Trigger" help="Trigger fields are only needed for reactions, death triggers, free triggers, or conditional abilities.">
                <FormRow label="Trigger" icon="fa-code-branch" hint={FIELD_HELP.trigger}>
                  <TextArea rows={2} value={monsterRules.trigger} onChange={(value) => setRulesField(["trigger"], value)} />
                </FormRow>
              </RulesGroup>
            ) : null}

            {hasAttackResolution ? (
              <RulesGroup icon="fa-hand-fist" title="Attack Roll" help="Attack fields appear only when Resolution is Attack Roll or Attack Roll + Saving Throw.">
                <div className="studio-form-grid studio-form-grid--compact">
                  <FormRow label="Attack Type" icon="fa-hand-fist" hint={FIELD_HELP.attackType}>
                    <SelectInput options={MONSTER_ATTACK_OPTIONS} value={monsterRules.resolution?.attackType || "melee"} onChange={(value) => setRulesField(["resolution", "attackType"], value)} />
                  </FormRow>
                  <FormRow label="Attack Basis" icon="fa-dumbbell" hint={FIELD_HELP.attackBasis}>
                    <SelectInput options={MONSTER_ATTACK_BASIS_OPTIONS} value={monsterRules.resolution?.abilityBasis || "monster"} onChange={(value) => setRulesField(["resolution", "abilityBasis"], value)} />
                  </FormRow>
                  <FormRow label="Reach" icon="fa-ruler-horizontal" hint={FIELD_HELP.attackReach}>
                    <TextInput value={monsterRules.resolution?.reach} onChange={(value) => setRulesField(["resolution", "reach"], value)} placeholder="5 ft." />
                  </FormRow>
                  <FormRow label="Range" icon="fa-bullseye" hint={FIELD_HELP.attackRange}>
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
                {!isManualText ? (
                  <div className="studio-form-grid">
                    <FormRow label="Failure Text" icon="fa-circle-xmark" hint={FIELD_HELP.failureText}>
                      <TextArea rows={3} value={monsterRules.text?.failure} onChange={(value) => setRulesField(["text", "failure"], value)} />
                    </FormRow>
                    <FormRow label="Success Text" icon="fa-circle-check" hint={FIELD_HELP.successText}>
                      <TextArea rows={3} value={monsterRules.text?.success} onChange={(value) => setRulesField(["text", "success"], value)} />
                    </FormRow>
                  </div>
                ) : null}
              </RulesGroup>
            ) : null}

            <RulesGroup icon="fa-burst" title="Damage" help="Damage fields define whether the ability deals damage and how that damage consumes the monster DPR budget.">
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Damage Mode" icon="fa-burst" hint={FIELD_HELP.damageMode}>
                  <SelectInput options={MONSTER_DAMAGE_MODE_OPTIONS} value={damageMode} onChange={(value) => setRulesField(["damage", "mode"], value)} />
                </FormRow>
                {showDamageDetails ? (
                  <>
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
                  </>
                ) : null}
              </div>
            </RulesGroup>

            <RulesGroup icon="fa-person-rays" title="Conditions" help="Condition fields define ongoing, disabling, or special condition-like effects caused by the ability.">
              <div className="studio-form-grid studio-form-grid--compact">
                <FormRow label="Condition Names" icon="fa-person-rays" hint={FIELD_HELP.conditionNames}>
                  <TextInput value={conditionNames} onChange={(value) => setRulesArray(["condition", "names"], value)} />
                </FormRow>
                {showConditionDetails ? (
                  <>
                    <FormRow label="Condition Severity" icon="fa-triangle-exclamation" hint={FIELD_HELP.conditionSeverity}>
                      <SelectInput options={MONSTER_CONDITION_SEVERITY_OPTIONS} value={monsterRules.condition?.severity || "moderate"} onChange={(value) => setRulesField(["condition", "severity"], value)} />
                    </FormRow>
                    <FormRow label="Condition Duration" icon="fa-hourglass-half" hint={FIELD_HELP.conditionDuration}>
                      <TextInput value={monsterRules.condition?.duration} onChange={(value) => setRulesField(["condition", "duration"], value)} />
                    </FormRow>
                  </>
                ) : null}
              </div>
            </RulesGroup>

            {!isManualText && (!showSaveOutcome || hasAttackResolution || outputTextValue) ? (
              <RulesGroup icon={outputTextIcon} title="Generated Text Fragment" help="This optional generated fragment is composed into the final stat block preview. Use manual override only for unusual cases.">
                <FormRow label={outputTextLabel} icon={outputTextIcon} hint={outputTextHelp}>
                  <TextArea rows={3} value={outputTextValue} onChange={(value) => setRulesField(outputTextPath, value)} />
                </FormRow>
              </RulesGroup>
            ) : null}
          </div>

          <DividerLabel icon="fa-shield-halved" title="Counterplay" help="Counterplay explains what players can notice, prevent, avoid, exploit, or clean up." />
          <FormRow label="Counterplay" icon="fa-shield-halved" hint={FIELD_HELP.counterplay}>
            <TextArea rows={3} value={component.counterplay} onChange={(value) => setField(["counterplay"], value)} />
          </FormRow>

          <RulesGroup icon="fa-file-lines" title="Stat Block Text" help="This final section shows what the graft contributes to the monster sheet. Generated mode builds it from the fields above; manual mode overrides the final template.">
            <div className="studio-form-grid studio-form-grid--compact">
              <FormRow label="Text Source" icon="fa-toggle-on" hint={FIELD_HELP.textMode}>
                <SelectInput options={MONSTER_TEXT_MODE_OPTIONS} value={textMode} onChange={(value) => setRulesField(["text", "mode"], value)} />
              </FormRow>
            </div>
            {isManualText ? (
              <FormRow label="Manual Override" icon="fa-pen-to-square" hint={FIELD_HELP.manualText}>
                <TextArea rows={5} value={monsterRules.text?.manual} onChange={(value) => setRulesField(["text", "manual"], value)} placeholder="{title}. Melee Attack Roll: {attack-bonus}, reach 5 ft. Hit: {average-damage} ({damage-scale:standard}) Bludgeoning damage." />
              </FormRow>
            ) : null}
            <FormRow label="Generated Stat Block Preview" icon="fa-eye" hint={FIELD_HELP.statBlockPreview}>
              <textarea className="studio-statblock-preview" readOnly rows={6} value={statBlockPreview} />
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

