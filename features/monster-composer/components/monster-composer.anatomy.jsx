import { useEffect, useRef, useState } from "react";
import {
  SLOTS,
  SILHOUETTE_SLOT_CARDS,
  ANATOMY_LEFT_SLOT_IDS,
  ANATOMY_RIGHT_SLOT_IDS,
  ANATOMY_BOTTOM_SLOT_IDS,
} from "../monster-composer.workflow.js";
import { MONSTER_GRAFTS as FEATURES } from "../data/monster-grafts.js";
import { getSelectedIdsForSlot, hasSelectedSlot } from "../model/monster-composer.selection.js";
import { normalizeMonsterReferences } from "../model/monster-composer.export.js";
import { getSilhouetteAnchor, getSilhouetteId, getSilhouetteProfile } from "../model/anatomy.js";
import {
  CREATURE_TYPES,
  DANGERS,
  MONSTER_TIERS,
  ROLES,
  TACTICAL_ROLES,
  TEMPO_PROFILES,
  isCreatureCategoryUnavailable,
  isCreatureTypeUnavailable,
} from "../monster-composer.taxonomies.js";
import { Activity, AlertTriangle, Crown, Crosshair, Eye, Flame, Gauge, HeartPulse, RotateCcw, Shield, SlidersHorizontal, Sparkles, Sword, Timer, Zap } from "lucide-react";
import { MonsterStartScreen } from "./monster-composer.start-flow.jsx";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const FRAME_NODE_ANCHORS = [
  { id: "family", label: "Family", x: 0.5, y: 0.17, icon: Activity },
  { id: "variant", label: "Variant", x: 0.55, y: 0.31, icon: Sparkles },
  { id: "role", label: "Footprint", x: 0.37, y: 0.43, icon: Sword },
  { id: "tactic", label: "Job", x: 0.63, y: 0.52, icon: Activity },
  { id: "challenge", label: "CR", x: 0.43, y: 0.68, icon: Gauge },
  { id: "danger", label: "Threat", x: 0.57, y: 0.79, icon: AlertTriangle },
];

const FRAME_TYPE_COPY = {
  undead: "Corpse, bone, spirit, rot, hunger.",
  beast: "Predator body, instinct, mobility.",
  aberration: "Alien anatomy. Future pack.",
};

const ROLE_ICON_MAP = {
  minion: Sword,
  standard: Shield,
  boss: Crown,
};

const TACTICAL_ROLE_ICON_MAP = {
  brute: Sword,
  skirmisher: Zap,
  controller: SlidersHorizontal,
  lurker: Eye,
  artillery: Crosshair,
  support: HeartPulse,
};

const MONSTER_TIER_ICON_MAP = {
  normal: Shield,
  elite: Sword,
  boss: Crown,
  legendary: Sparkles,
  setpiece: AlertTriangle,
};

const TEMPO_ICON_MAP = {
  slow: Timer,
  standard: Activity,
  fast: Zap,
  ambusher: Eye,
  legendary: Sparkles,
};

const DANGER_ICON_MAP = {
  standard: Shield,
  hard: Flame,
  horror: AlertTriangle,
};


function AnatomyMeter({ label, value, max, percent }) {
  const over = value > max;
  return (
    <div className="monster-meter">
      <div className="monster-meter__head">
        <span>{label}</span>
        <strong className={over ? "is-over" : ""}>
          {value} / {max}
        </strong>
      </div>
      <div className="monster-meter__track">
        <div className={over ? "is-over" : ""} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}

function FrameMeter({ label, value, max }) {
  const percent = max > 0 ? clamp((value / max) * 100, 0, 160) : 0;
  return <AnatomyMeter label={label} value={value} max={max} percent={percent} />;
}

function FrameSummaryRow({ label, value }) {
  return (
    <span className="monster-frame-info-row">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function MonsterNameEditor({ value, onChange }) {
  return (
    <label className="monster-frame-name-editor">
      <span className="sr-only">Monster name</span>
      <input
        type="text"
        value={value}
        aria-label="Monster name"
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function GraftActionPanel({ composerStarted, onForgeMonster, onStartOver }) {
  return (
    <section className="monster-frame-info-card monster-graft-action-card" aria-label="Build actions">
      <button
        className="monster-graft-action-btn is-primary tooltip-btn"
        type="button"
        aria-label="Forge Monster"
        data-tooltip="Auto-build a playable first draft from the current Monster Frame. You can customize every anatomy slot afterward."
        onClick={onForgeMonster}
      >
        <Flame aria-hidden="true" />
      </button>
      <button
        className={`monster-graft-action-btn tooltip-btn ${composerStarted ? "" : "is-disabled"}`}
        type="button"
        aria-label="Start Over"
        aria-disabled={!composerStarted}
        data-tooltip={
          composerStarted
            ? "Return to the initial Template / Scratch choice and clear the current build."
            : "Start a build before using Start Over."
        }
        onClick={composerStarted ? onStartOver : undefined}
      >
        <RotateCcw aria-hidden="true" />
      </button>
    </section>
  );
}

function FrameOptionCard({
  active,
  disabled = false,
  icon: Icon,
  title,
  meta,
  summary,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      aria-pressed={active}
      className={`monster-frame-option ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      onClick={disabled ? undefined : onClick}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span>
        <strong>{title}</strong>
        {summary ? <em>{summary}</em> : null}
      </span>
      {meta ? <small>{meta}</small> : null}
    </button>
  );
}

function FramePill({ active, disabled = false, children, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      disabled={disabled}
      aria-disabled={disabled}
      aria-checked={active}
      className={`monster-frame-pill ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}

function normalizeTooltipLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function buildFrameTooltipList(options, getLabel, getDescription, getMeta, isDisabled) {
  return options
    .map((option) => {
      const label = normalizeTooltipLine(getLabel?.(option));
      const description = normalizeTooltipLine(getDescription?.(option));
      const meta = normalizeTooltipLine(getMeta?.(option));
      const disabled = Boolean(isDisabled?.(option));
      const details = [description, meta, disabled ? "Unavailable / future pack" : ""]
        .filter(Boolean)
        .join(" · ");
      return details ? `**${label}**. ${details}` : `**${label}**.`;
    })
    .join("\n");
}

function FrameTooltip({ title = "Info", text, items = "" }) {
  const tooltipText = [text, items].filter(Boolean).join("\n");
  if (!tooltipText) return null;
  const ariaText = normalizeTooltipLine(tooltipText);
  return (
    <span
      className="monster-frame-help"
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

function FrameCrControl({ value, setTargetCr, setActivePresetId }) {
  function commit(nextValue) {
    setTargetCr(clamp(Number(nextValue || 0), 0, 30));
    setActivePresetId("");
  }

  return (
    <div className="monster-frame-cr-control" aria-label="Target CR">
      <div className="monster-frame-field-head">
        <span>Target CR</span>
        <FrameTooltip
          title="Target CR"
          text="Sets the monster's expected challenge rating. You can drag the slider or type the exact number."
          items="• **0–30**. Type a precise CR or drag the slider."
        />
      </div>
      <div className="monster-frame-cr-slider-row">
        <input
          className="monster-frame-cr-slider"
          type="range"
          min="0"
          max="30"
          step="1"
          value={value}
          aria-label="Target CR slider"
          onChange={(event) => commit(event.target.value)}
        />
        <input
          className="monster-frame-cr-number"
          type="number"
          min="0"
          max="30"
          value={value}
          aria-label="Target CR number"
          onChange={(event) => commit(event.target.value)}
        />
      </div>
    </div>
  );
}

function MonsterSilhouetteCore({
  profile,
  silhouetteId,
  selected,
  activeSlot,
  guidedSlotId,
  stageMode,
  frameNodeValues,
  onOpenFrame,
  onFocusSlot,
}) {
  function openFrameFromSilhouette(event) {
    event.stopPropagation();
    onOpenFrame?.();
  }

  function handleSilhouetteKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenFrame?.();
    }
  }

  const isFrameMode = stageMode === "frame";
  const ariaLabel = isFrameMode
    ? `${profile.label}. Frame setup active.`
    : `${profile.label}. Open Monster Frame`;

  return (
    <div className="anatomy-stage__center" aria-label="Interactive monster silhouette">
      <div className="anatomy-stage__silhouette-layer">
        <svg
          className="monster-silhouette-connectors"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {isFrameMode
            ? FRAME_NODE_ANCHORS.map((node) => (
                <line
                  key={node.id}
                  className="monster-silhouette-connector is-frame"
                  x1={node.x * 100}
                  y1={node.y * 100}
                  x2="50"
                  y2="50"
                />
              ))
            : SLOTS.map((slot) => {
                const anchor = getSilhouetteAnchor(profile, slot.id);
                const card = SILHOUETTE_SLOT_CARDS[slot.id] || { x: anchor.x, y: anchor.y };
                const filled = hasSelectedSlot(selected, slot.id);
                const active = activeSlot === slot.id;
                const guided = guidedSlotId === slot.id;
                return (
                  <line
                    key={slot.id}
                    className={`monster-silhouette-connector ${filled ? "is-filled" : ""} ${active ? "is-active" : ""} ${guided ? "is-guided" : ""}`}
                    x1={card.x * 100}
                    y1={card.y * 100}
                    x2={anchor.x * 100}
                    y2={anchor.y * 100}
                  />
                );
              })}
        </svg>

        {profile.assetUrl ? (
          <button
            className={`monster-silhouette-svg monster-silhouette-asset monster-silhouette-svg--${silhouetteId}`}
            type="button"
            aria-label={ariaLabel}
            onClick={openFrameFromSilhouette}
            onKeyDown={handleSilhouetteKeyDown}
          >
            <img
              className="monster-silhouette-asset__image"
              src={profile.assetUrl}
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </button>
        ) : (
          <svg
            className={`monster-silhouette-svg monster-silhouette-svg--${silhouetteId}`}
            viewBox={profile.viewBox}
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
            onClick={openFrameFromSilhouette}
            onKeyDown={handleSilhouetteKeyDown}
          >
            <g className="monster-silhouette-aura">
              {profile.layers
                .filter((layer) => layer.id === "aura")
                .map((layer) => (
                  <path key={layer.id} d={layer.d} />
                ))}
            </g>
            <g className="monster-silhouette-body">
              {profile.layers
                .filter((layer) => layer.id !== "aura")
                .map((layer) => (
                  <path
                    key={layer.id}
                    className={`silhouette-layer silhouette-layer--${layer.id}`}
                    d={layer.d}
                  />
                ))}
            </g>
          </svg>
        )}

        {isFrameMode
          ? FRAME_NODE_ANCHORS.map((node) => {
              const Icon = node.icon;
              return (
                <span
                  key={node.id}
                  className="monster-frame-node"
                  style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                >
                  <Icon aria-hidden="true" />
                  <small>{node.label}</small>
                  <strong>{frameNodeValues[node.id]}</strong>
                </span>
              );
            })
          : SLOTS.map((slot) => {
              const Icon = slot.icon;
              const anchor = getSilhouetteAnchor(profile, slot.id);
              const filled = hasSelectedSlot(selected, slot.id);
              const active = activeSlot === slot.id;
              const guided = guidedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={`monster-silhouette-node ${filled ? "is-filled" : ""} ${active ? "is-active" : ""} ${guided ? "is-guided" : ""}`}
                  style={{ left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%` }}
                  aria-label={`Focus ${slot.label}`}
                  aria-pressed={active}
                  onClick={(event) => {
                    event.stopPropagation();
                    onFocusSlot(slot.id);
                  }}
                >
                  <Icon aria-hidden="true" />
                </button>
              );
            })}
      </div>
    </div>
  );
}


function FrameSelectField({ label, value, options, onChange, getValue, getLabel, getMeta, getDescription, getIcon, isDisabled }) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef(null);
  const selectedOption =
    options.find((option) => String(getValue(option)) === String(value)) || options[0];
  const selectedLabel = selectedOption ? getLabel(selectedOption) : "—";
  const description = selectedOption ? getDescription?.(selectedOption) : "";
  const meta = selectedOption ? getMeta?.(selectedOption) : "";
  const SelectedIcon = selectedOption ? getIcon?.(selectedOption) : null;
  const tooltipText = [description, meta].filter(Boolean).join(" · ");
  const tooltipItems = buildFrameTooltipList(
    options,
    getLabel,
    getDescription,
    getMeta,
    isDisabled,
  );

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (!fieldRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="monster-frame-select-field" ref={fieldRef}>
      <div className="monster-frame-field-head">
        <span>{label}</span>
        <FrameTooltip title={label} text={tooltipText} items={tooltipItems} />
      </div>
      <button
        className="monster-frame-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {SelectedIcon ? <SelectedIcon aria-hidden="true" /> : null}
        <strong>{selectedLabel}</strong>
        {meta ? <small>{meta}</small> : null}
      </button>
      {open ? (
        <div className="monster-frame-select-menu" role="listbox" aria-label={label}>
          {options.map((option) => {
            const optionValue = getValue(option);
            const disabled = Boolean(isDisabled?.(option));
            const active = String(optionValue) === String(value);
            const OptionIcon = getIcon?.(option);
            return (
              <button
                key={optionValue}
                type="button"
                role="option"
                aria-selected={active}
                disabled={disabled}
                className={`monster-frame-select-option ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
                onClick={() => {
                  if (disabled) return;
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                {OptionIcon ? <OptionIcon aria-hidden="true" /> : null}
                <span>
                  <strong>{getLabel(option)}</strong>
                  {getDescription?.(option) ? <small>{getDescription(option)}</small> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FrameIconToggleGroup({ label, value, options, onChange, getValue, getLabel, getMeta, getDescription, getIcon, isDisabled }) {
  const selectedOption =
    options.find((option) => String(getValue(option)) === String(value)) || options[0];
  const selectedLabel = selectedOption ? getLabel(selectedOption) : "—";
  const description = selectedOption ? getDescription?.(selectedOption) : "";
  const meta = selectedOption ? getMeta?.(selectedOption) : "";
  const tooltipText = [description, meta].filter(Boolean).join(" · ");
  const tooltipItems = buildFrameTooltipList(
    options,
    getLabel,
    getDescription,
    getMeta,
    isDisabled,
  );

  return (
    <div className="monster-frame-select-field monster-frame-icon-field">
      <div className="monster-frame-field-head">
        <span>{label}</span>
        <strong>{selectedLabel}</strong>
        <FrameTooltip title={label} text={tooltipText} items={tooltipItems} />
      </div>
      <div className="monster-frame-icon-toggle-row" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const optionValue = getValue(option);
          const disabled = Boolean(isDisabled?.(option));
          const active = String(optionValue) === String(value);
          const OptionIcon = getIcon?.(option) || Activity;
          return (
            <button
              key={optionValue}
              className={`monster-frame-icon-toggle ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
              type="button"
              role="radio"
              aria-label={getLabel(option)}
              aria-checked={active}
              aria-disabled={disabled}
              disabled={disabled}
              data-key="tooltip-generic"
              data-tooltip={getLabel(option)}
              data-tooltip-description={[getDescription?.(option), getMeta?.(option)].filter(Boolean).join(" · ")}
              onClick={() => {
                if (!disabled) onChange(optionValue);
              }}
            >
              <OptionIcon aria-hidden="true" />
              <span className="sr-only">{getLabel(option)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FrameControls({
  typeId,
  category,
  creatureType,
  role,
  roleId,
  targetCr,
  tacticalRole,
  tacticalRoleId,
  monsterTierId,
  tempoProfileId,
  danger,
  dangerId,
  selectType,
  setCategory,
  setRoleId,
  setTargetCr,
  setTacticalRoleId,
  setMonsterTierId,
  setTempoProfileId,
  setDangerId,
  setActivePresetId,
}) {
  const setFrameValue = (setter, value) => {
    setter(value);
    setActivePresetId("");
  };

  return (
    <aside className="anatomy-stage__column anatomy-stage__column--left monster-frame-controls" aria-label="Monster Frame controls">
      <section className="monster-frame-control-block">
        <div className="monster-frame-control-block__head">
          <span>Chassis</span>
        </div>
        <div className="monster-frame-selector-stack">
          <FrameSelectField
            label="Family"
            value={typeId}
            options={CREATURE_TYPES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => item.icon}
            getDescription={(item) => FRAME_TYPE_COPY[item.id]}
            getMeta={(item) => `${item.categories.length} variants`}
            isDisabled={(item) => isCreatureTypeUnavailable(item.id)}
            onChange={(nextTypeId) => selectType(nextTypeId)}
          />
          <FrameSelectField
            label="Variant"
            value={category}
            options={creatureType.categories}
            getValue={(item) => item}
            getLabel={(item) => item}
            getIcon={() => Sparkles}
            getDescription={() => "Creature body variant."}
            isDisabled={(item) => isCreatureCategoryUnavailable(typeId, item)}
            onChange={(nextCategory) => setFrameValue(setCategory, nextCategory)}
          />
        </div>
      </section>

      <section className="monster-frame-control-block">
        <div className="monster-frame-control-block__head">
          <span>Combat Identity</span>
        </div>
        <div className="monster-frame-selector-stack">
          <FrameIconToggleGroup
            label="Encounter Footprint"
            value={roleId}
            options={ROLES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => ROLE_ICON_MAP[item.id] || Sword}
            getDescription={(item) => item.summary}
            getMeta={(item) => `HP ${Math.round(item.hpMult * 100)} · DPR ${Math.round(item.dprMult * 100)}`}
            onChange={(nextRoleId) => setFrameValue(setRoleId, nextRoleId)}
          />
          <FrameIconToggleGroup
            label="Role"
            value={tacticalRoleId}
            options={TACTICAL_ROLES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => TACTICAL_ROLE_ICON_MAP[item.id] || Activity}
            getDescription={(item) => item.summary || "Primary tactical behavior."}
            onChange={(nextTacticalRoleId) => setFrameValue(setTacticalRoleId, nextTacticalRoleId)}
          />
        </div>
      </section>

      <section className="monster-frame-control-block">
        <div className="monster-frame-control-block__head">
          <span>Threat Profile</span>
        </div>
        <div className="monster-frame-selector-stack">
          <FrameCrControl
            value={targetCr}
            setTargetCr={setTargetCr}
            setActivePresetId={setActivePresetId}
          />
          <FrameIconToggleGroup
            label="Tier"
            value={monsterTierId}
            options={MONSTER_TIERS}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => MONSTER_TIER_ICON_MAP[item.id] || Shield}
            getDescription={(item) => item.summary || "Encounter weight and durability."}
            onChange={(nextMonsterTierId) => setFrameValue(setMonsterTierId, nextMonsterTierId)}
          />
          <FrameIconToggleGroup
            label="Tempo"
            value={tempoProfileId}
            options={TEMPO_PROFILES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => TEMPO_ICON_MAP[item.id] || Activity}
            getDescription={(item) => item.summary || "How quickly the monster applies pressure."}
            onChange={(nextTempoProfileId) => setFrameValue(setTempoProfileId, nextTempoProfileId)}
          />
          <FrameIconToggleGroup
            label="Danger"
            value={dangerId}
            options={DANGERS}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => DANGER_ICON_MAP[item.id] || AlertTriangle}
            getDescription={(item) => item.summary || "How punishing the final build should feel."}
            onChange={(nextDangerId) => setFrameValue(setDangerId, nextDangerId)}
          />
        </div>
      </section>
    </aside>
  );
}

function FrameInfoPanel({
  computed,
  monsterName,
  onMonsterNameChange,
  creatureType,
  category,
  role,
  targetCr,
  tacticalRole,
  monsterTier,
  tempoProfile,
  danger,
}) {
  return (
    <aside className="anatomy-stage__column anatomy-stage__column--right monster-frame-info" aria-label="Current Monster Frame">
      <section className="monster-frame-info-card monster-frame-info-card--hero">
        <span>Current Frame</span>
        <MonsterNameEditor value={monsterName || computed.name} onChange={onMonsterNameChange} />
        <em>{creatureType.label} · {category} · {role.label}</em>
      </section>
      <section className="monster-frame-info-card">
        <div className="monster-frame-info-grid">
          <FrameSummaryRow label="Family" value={creatureType.label} />
          <FrameSummaryRow label="Variant" value={category} />
          <FrameSummaryRow label="Footprint" value={role.label} />
          <FrameSummaryRow label="Job" value={tacticalRole.label} />
          <FrameSummaryRow label="CR" value={targetCr} />
          <FrameSummaryRow label="Tier" value={monsterTier.label} />
          <FrameSummaryRow label="Tempo" value={tempoProfile.label} />
          <FrameSummaryRow label="Danger" value={danger.label} />
        </div>
      </section>
      <section className="monster-frame-info-card">
        <FrameMeter label="Pressure" value={computed.pressure} max={computed.budget} />
        <FrameMeter label="Complexity" value={computed.complexity} max={computed.complexityCap} />
      </section>
    </aside>
  );
}

function GraftInfoPanel({
  computed,
  monsterName,
  onMonsterNameChange,
  composerStarted,
  onForgeMonster,
  onOpenComponents,
  onStartOver,
  creatureType,
  category,
  role,
  targetCr,
  tacticalRole,
  monsterTier,
  tempoProfile,
  danger,
  selected,
  activeSlot,
}) {
  const slot = SLOTS.find((item) => item.id === activeSlot) || SLOTS[0];
  const slotFeatures = getSelectedIdsForSlot(selected, slot.id)
    .map((id) => FEATURES.find((feature) => feature.id === id))
    .filter(Boolean);
  const candidates = FEATURES.filter((feature) => feature.slot === slot.id).length;

  return (
    <aside className="anatomy-stage__column anatomy-stage__column--right monster-frame-info monster-graft-info" aria-label="Current monster information">
      <section className="monster-frame-info-card monster-frame-info-card--hero">
        <span>Info</span>
        <MonsterNameEditor value={monsterName || computed.name} onChange={onMonsterNameChange} />
        <em>{creatureType.label} · {category} · CR {targetCr}</em>
      </section>

      <GraftActionPanel
        composerStarted={composerStarted}
        onForgeMonster={onForgeMonster}
        onOpenComponents={onOpenComponents}
        onStartOver={onStartOver}
      />

      <section className="monster-frame-info-card">
        <div className="monster-frame-info-grid">
          <FrameSummaryRow label="Role" value={role.label} />
          <FrameSummaryRow label="Tactic" value={tacticalRole.label} />
          <FrameSummaryRow label="Tier" value={monsterTier.label} />
          <FrameSummaryRow label="Tempo" value={tempoProfile.label} />
          <FrameSummaryRow label="Danger" value={danger.label} />
          <FrameSummaryRow label="Slots" value={`${SLOTS.filter((item) => hasSelectedSlot(selected, item.id)).length}/${SLOTS.length}`} />
        </div>
      </section>

      <section className="monster-frame-info-card">
        <div className="monster-graft-focus">
          <span>Focused Slot</span>
          <strong>{slot.label}</strong>
          <p>{slotFeatures[0]?.title || slot.hint}</p>
          <em>{slotFeatures.length ? `${slotFeatures.length} installed` : `${candidates} compatible grafts`}</em>
        </div>
      </section>

      <section className="monster-frame-info-card">
        <FrameMeter label="Pressure" value={computed.pressure} max={computed.budget} />
        <FrameMeter label="Complexity" value={computed.complexity} max={computed.complexityCap} />
      </section>
    </aside>
  );
}

export function MonsterSilhouetteMap({
  typeId,
  category,
  activePreset,
  selected,
  activeSlot,
  guidedSlotId,
  computed,
  started,
  startMode,
  presetsCount,
  stageMode = "grafts",
  monsterName,
  onMonsterNameChange,
  onForgeMonster,
  onOpenComponents,
  onStartOver,
  composerStarted,
  creatureType,
  role,
  roleId,
  targetCr,
  tacticalRole,
  tacticalRoleId,
  monsterTier,
  monsterTierId,
  tempoProfile,
  tempoProfileId,
  danger,
  dangerId,
  onPickTemplate,
  onBuildFromScratch,
  onOpenFrame,
  onFocusSlot,
  selectType,
  setCategory,
  setActivePresetId,
  setRoleId,
  setTargetCr,
  setTacticalRoleId,
  setMonsterTierId,
  setTempoProfileId,
  setDangerId,
  componentNavigatorPanel,
  guidedFlowPanel,
}) {
  const silhouetteId = getSilhouetteId(typeId, category, activePreset);
  const profile = getSilhouetteProfile(typeId, category, activePreset);
  const filledCount = SLOTS.filter((slot) => hasSelectedSlot(selected, slot.id)).length;
  const safeCreatureType = creatureType || CREATURE_TYPES.find((type) => type.id === typeId) || CREATURE_TYPES[0];
  const safeRole = role || ROLES.find((item) => item.id === roleId) || ROLES[1];
  const safeTacticalRole = tacticalRole || TACTICAL_ROLES.find((item) => item.id === tacticalRoleId) || TACTICAL_ROLES[0];
  const safeMonsterTier = monsterTier || MONSTER_TIERS.find((item) => item.id === monsterTierId) || MONSTER_TIERS[0];
  const safeTempoProfile = tempoProfile || TEMPO_PROFILES.find((item) => item.id === tempoProfileId) || TEMPO_PROFILES[1];
  const safeDanger = danger || DANGERS.find((item) => item.id === dangerId) || DANGERS[0];
  const isFrameMode = stageMode === "frame";

  const frameNodeValues = {
    family: safeCreatureType.label,
    variant: category,
    role: safeRole.label,
    tactic: safeTacticalRole.label,
    challenge: `CR ${targetCr}`,
    danger: safeDanger.label,
  };

  function getSlotCardData(slotId) {
    const slot = SLOTS.find((item) => item.id === slotId) || SLOTS[0];
    const Icon = slot.icon;
    const card = SILHOUETTE_SLOT_CARDS[slot.id] || { side: "center" };
    const slotFeatures = getSelectedIdsForSlot(selected, slot.id)
      .map((id) => FEATURES.find((feature) => feature.id === id))
      .filter(Boolean);
    const feature = slotFeatures[0] || null;
    const filled = slotFeatures.length > 0;
    const active = activeSlot === slot.id;
    const guided = guidedSlotId === slot.id;

    return { slot, Icon, card, slotFeatures, feature, filled, active, guided };
  }

  function renderSlotCard(slotId) {
    const { slot, Icon, card, slotFeatures, feature, filled, active, guided } =
      getSlotCardData(slotId);

    return (
      <button
        key={slot.id}
        type="button"
        className={`monster-silhouette-slot-card is-${card.side} ${filled ? "is-filled" : "is-empty"} ${active ? "is-active" : ""} ${guided ? "is-guided" : ""}`}
        aria-label={`Focus ${slot.label}`}
        aria-pressed={active}
        onClick={(event) => {
          event.stopPropagation();
          onFocusSlot(slot.id);
        }}
      >
        <span className="monster-silhouette-slot-card__head">
          <span>
            <Icon aria-hidden="true" /> {slot.label}
          </span>
          <strong>{slotFeatures.length || "—"}</strong>
        </span>
        <span className="monster-silhouette-slot-card__body">
          {feature ? (
            <>
              <strong>{feature.title}</strong>
              <em>{normalizeMonsterReferences(feature.summary, computed)}</em>
            </>
          ) : (
            <>
              <strong>Empty Slot</strong>
              <em>{slot.hint}</em>
            </>
          )}
        </span>
      </button>
    );
  }

  function renderStageCenter() {
    return (
      <MonsterSilhouetteCore
        profile={profile}
        silhouetteId={silhouetteId}
        selected={selected}
        activeSlot={activeSlot}
        guidedSlotId={guidedSlotId}
        stageMode={stageMode}
        frameNodeValues={frameNodeValues}
        onOpenFrame={onOpenFrame}
        onFocusSlot={onFocusSlot}
      />
    );
  }

  return (
    <section className="monster-anatomy-composer" aria-label="Monster anatomy composer">
      {!started ? (
        <MonsterStartScreen
          onPickTemplate={onPickTemplate}
          onBuildFromScratch={onBuildFromScratch}
          presetsCount={presetsCount}
        />
      ) : (
        <>
          <div
            className={`monster-silhouette-stage anatomy-stage ${isFrameMode ? "is-frame-mode" : "is-grafts-mode"}`}
            data-active-slot={activeSlot}
            data-start-mode={startMode || "manual"}
            data-stage-mode={stageMode}
          >
            {isFrameMode ? (
              <div className="anatomy-stage__grid anatomy-stage__grid--frame">
                <FrameControls
                  typeId={typeId}
                  category={category}
                  creatureType={safeCreatureType}
                  role={safeRole}
                  roleId={roleId}
                  targetCr={targetCr}
                  tacticalRole={safeTacticalRole}
                  tacticalRoleId={tacticalRoleId}
                  monsterTierId={monsterTierId}
                  tempoProfileId={tempoProfileId}
                  danger={safeDanger}
                  dangerId={dangerId}
                  selectType={selectType}
                  setCategory={setCategory}
                  setRoleId={setRoleId}
                  setTargetCr={setTargetCr}
                  setTacticalRoleId={setTacticalRoleId}
                  setMonsterTierId={setMonsterTierId}
                  setTempoProfileId={setTempoProfileId}
                  setDangerId={setDangerId}
                  setActivePresetId={setActivePresetId}
                />
                {renderStageCenter()}
                <FrameInfoPanel
                  computed={computed}
                  monsterName={monsterName}
                  onMonsterNameChange={onMonsterNameChange}
                  creatureType={safeCreatureType}
                  category={category}
                  role={safeRole}
                  targetCr={targetCr}
                  tacticalRole={safeTacticalRole}
                  monsterTier={safeMonsterTier}
                  tempoProfile={safeTempoProfile}
                  danger={safeDanger}
                />
              </div>
            ) : (
              <div className="anatomy-stage__grid anatomy-stage__grid--grafts">
                <aside
                  className="anatomy-stage__column anatomy-stage__column--left"
                  aria-label="Anatomy graft slots"
                >
                  <div className="anatomy-stage__slot-stack">
                    {[...ANATOMY_RIGHT_SLOT_IDS, ...ANATOMY_LEFT_SLOT_IDS, ...ANATOMY_BOTTOM_SLOT_IDS].map(renderSlotCard)}
                  </div>
                </aside>

                {componentNavigatorPanel ? (
                  <div
                    className="anatomy-stage__navigator-overlay"
                    aria-label="Graft navigator drawer"
                  >
                    {componentNavigatorPanel}
                  </div>
                ) : null}

                {renderStageCenter()}

                <GraftInfoPanel
                  computed={computed}
                  monsterName={monsterName}
                  onMonsterNameChange={onMonsterNameChange}
                  composerStarted={composerStarted}
                  onForgeMonster={onForgeMonster}
                  onOpenComponents={onOpenComponents}
                  onStartOver={onStartOver}
                  creatureType={safeCreatureType}
                  category={category}
                  role={safeRole}
                  targetCr={targetCr}
                  tacticalRole={safeTacticalRole}
                  monsterTier={safeMonsterTier}
                  tempoProfile={safeTempoProfile}
                  danger={safeDanger}
                  selected={selected}
                  activeSlot={activeSlot}
                />
              </div>
            )}
            {guidedFlowPanel ? (
              <div
                className={`monster-stage-progress-dock ${isFrameMode ? "monster-stage-progress-dock--frame" : "monster-stage-progress-dock--grafts"}`}
              >
                {guidedFlowPanel}
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
