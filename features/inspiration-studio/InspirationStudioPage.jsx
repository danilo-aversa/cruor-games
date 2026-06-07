import { useEffect, useMemo, useState } from "react";
import { loadContentPackSummaries, loadInspirationModules } from "../../shared/content/content.index.js";

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
        <FormRow label="Slots" icon="fa-table-cells-large" hint={FIELD_HELP.slots}>
          <TextInput value={joinList(component.slots)} onChange={(value) => setArray(["slots"], value)} />
        </FormRow>
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
      <FormRow label="Table Text" icon="fa-dice-d20" hint={FIELD_HELP.tableText}>
        <TextArea rows={4} value={component.tableText} onChange={(value) => setField(["tableText"], value)} />
      </FormRow>
      <FormRow label="Mechanics" icon="fa-gears" hint={FIELD_HELP.mechanics}>
        <TextArea rows={5} value={component.mechanics} onChange={(value) => setField(["mechanics"], value)} />
      </FormRow>

      {isMonsterGraft ? (
        <div className="studio-component-editor__subpanel">
          <h4><Icon name="fa-skull" /> Monster Graft Data</h4>
          <div className="studio-form-grid studio-form-grid--compact">
            <FormRow label="Monster Slot" icon="fa-table-cells-large" hint={FIELD_HELP.monsterSlot}>
              <TextInput value={component.monster?.slot} onChange={(value) => setField(["monster", "slot"], value)} />
            </FormRow>
            <FormRow label="Section" icon="fa-file-lines" hint={FIELD_HELP.monsterSection}>
              <TextInput value={component.monster?.section} onChange={(value) => setField(["monster", "section"], value)} />
            </FormRow>
            <FormRow label="Cost" icon="fa-gauge-high" hint={FIELD_HELP.monsterCost}>
              <input type="number" value={component.monster?.cost ?? 0} onChange={(event) => setField(["monster", "cost"], Number(event.target.value))} />
            </FormRow>
            <FormRow label="Complexity" icon="fa-layer-group" hint={FIELD_HELP.monsterComplexity}>
              <input type="number" value={component.monster?.complexity ?? 0} onChange={(event) => setField(["monster", "complexity"], Number(event.target.value))} />
            </FormRow>
          </div>
          <FormRow label="Counterplay" icon="fa-shield-halved" hint={FIELD_HELP.counterplay}>
            <TextArea rows={3} value={component.counterplay} onChange={(value) => setField(["counterplay"], value)} />
          </FormRow>
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
