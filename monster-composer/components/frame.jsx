import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  AlertTriangle,
  Gauge,
  Skull,
  Sparkles,
  Sword,
  X,
} from "lucide-react";

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function PanelGroup({ title, description, icon: Icon, className = "", children }) {
  return (
    <section className={`monster-panel-group game-frame-section ${className}`.trim()}>
      <div className="monster-panel-group__head">
        <span className="game-frame-section__icon">
          <Icon aria-hidden="true" />
        </span>
        <span className="game-frame-section__copy">
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </span>
      </div>
      <div className="game-frame-section__body">{children}</div>
    </section>
  );
}

function NumberField({ label, value, min, max, onChange }) {
  return (
    <label className="monster-field game-frame-number-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value || min), min, max))}
      />
    </label>
  );
}

function HudStat({ icon: Icon, label, value, tone = "" }) {
  return (
    <span className={`game-frame__hud-stat ${tone ? `is-${tone}` : ""}`.trim()}>
      <Icon aria-hidden="true" />
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </span>
  );
}

function LoadoutChip({ icon: Icon, label, value }) {
  return (
    <span className="game-frame__loadout-chip">
      <Icon aria-hidden="true" />
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </span>
  );
}

function MeterTile({ label, value, max, percent, over }) {
  return (
    <div className={`game-frame__meter ${over ? "is-over" : ""}`}>
      <span>
        <small>{label}</small>
        <strong>
          {value} / {max}
        </strong>
      </span>
      <i>
        <b className={over ? "is-over" : ""} style={{ width: `${Math.min(percent, 100)}%` }} />
      </i>
    </div>
  );
}

export function MonsterFrameModal({
  open,
  onClose,
  computed,
  creatureType,
  category,
  role,
  targetCr,
  tacticalRole,
  monsterTier,
  tempoProfile,
  typeId,
  roleId,
  tacticalRoleId,
  monsterTierId,
  tempoProfileId,
  dangerId,
  pressurePercent,
  complexityPercent,
  selectType,
  setCategory,
  setActivePresetId,
  setRoleId,
  setTargetCr,
  setTacticalRoleId,
  setMonsterTierId,
  setTempoProfileId,
  setDangerId,
}) {
  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const pressureOverBudget = computed.pressure > computed.budget;
  const complexityOverBudget = computed.complexity > computed.complexityCap;

  const modal = (
    <div
      className="monster-shell monster-frame-modal-portal"
      data-monster-frame-modal-portal=""
    >
      <div
        className="monster-frame-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Monster Frame"
      >
        <button
          className="monster-frame-modal__scrim monster-frame-scrim is-open"
          type="button"
          aria-label="Close Monster Frame"
          onClick={onClose}
        />

        <aside
          className="panel navigator monster-frame-drawer game-frame-drawer game-frame-drawer--fullscreen is-open"
          aria-label="Monster Frame"
          aria-hidden="false"
        >
          <header className="game-frame__hero">
            <div className="game-frame__topline">
              <span className="game-frame__status">
                <span /> Live Frame
              </span>
              <p className="eyebrow">Monster Frame</p>
              <button
                className="icon-btn game-frame-modal__close"
                type="button"
                aria-label="Close Monster Frame"
                onClick={onClose}
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <div className="game-frame__title-row">
              <div className="game-frame__title-copy">
                <h2>{computed.name}</h2>
                <p>Define the creature chassis before choosing grafts.</p>
              </div>
              <div className="game-frame__hud-stats" aria-label="Current frame budget">
                <HudStat icon={Gauge} label="CR" value={targetCr} />
                <HudStat
                  icon={AlertTriangle}
                  label="Pressure"
                  value={`${computed.pressure}/${computed.budget}`}
                  tone={pressureOverBudget ? "danger" : "stable"}
                />
                <HudStat
                  icon={Activity}
                  label="Complexity"
                  value={`${computed.complexity}/${computed.complexityCap}`}
                  tone={complexityOverBudget ? "danger" : "stable"}
                />
              </div>
            </div>

            <div className="game-frame__loadout" aria-label="Current frame summary">
              <LoadoutChip icon={Skull} label="Type" value={creatureType.label} />
              <LoadoutChip icon={Activity} label="Variant" value={category} />
              <LoadoutChip icon={Sword} label="Role" value={role.label} />
              <LoadoutChip icon={Activity} label="Tactic" value={tacticalRole.label} />
              <LoadoutChip icon={Sparkles} label="Tier" value={monsterTier.label} />
              <LoadoutChip icon={AlertTriangle} label="Tempo" value={tempoProfile.label} />
            </div>
          </header>

          <div className="game-frame__body">
            <PanelGroup
              title="Creature Foundation"
              description="Choose the monster family and its base body language."
              icon={Skull}
              className="game-frame-section--type"
            >
              <div className="game-type-grid">
                {CREATURE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const active = type.id === typeId;
                  const unavailable = isCreatureTypeUnavailable(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      disabled={unavailable}
                      aria-disabled={unavailable}
                      className={`game-type-card ${active ? "active" : ""} ${unavailable ? "is-disabled" : ""}`}
                      onClick={() => selectType(type.id)}
                    >
                      <span className="game-type-card__icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="game-type-card__text">
                        <strong>{type.label}</strong>
                        <small>{unavailable ? "Unavailable" : `${type.categories.length} variants`}</small>
                      </span>
                      <span className="game-type-card__mark">
                        {active ? "Active" : unavailable ? "Later" : "Select"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="game-category-panel game-frame-control-block">
                <div className="game-frame__minihead">
                  <span>Variant</span>
                  <strong>{category}</strong>
                </div>
                <div
                  className="game-category-grid"
                  role="radiogroup"
                  aria-label="Creature category"
                >
                  {creatureType.categories.map((item) => {
                    const unavailable = isCreatureCategoryUnavailable(typeId, item);
                    return (
                      <button
                        key={item}
                        type="button"
                        role="radio"
                        disabled={unavailable}
                        aria-disabled={unavailable}
                        aria-checked={item === category}
                        className={`game-category-chip ${item === category ? "active" : ""} ${unavailable ? "is-disabled" : ""}`}
                        onClick={() => {
                          if (unavailable) return;
                          setCategory(item);
                          setActivePresetId("");
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </PanelGroup>

            <PanelGroup
              title="Combat Identity"
              description="Set the encounter footprint and battlefield job."
              icon={Sword}
              className="game-frame-section--role"
            >
              <div className="game-role-grid">
                {ROLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`game-role-card ${item.id === roleId ? "active" : ""}`}
                    onClick={() => {
                      setRoleId(item.id);
                      setActivePresetId("");
                    }}
                  >
                    <span className="game-role-card__top">
                      <strong>{item.label}</strong>
                      <small>{item.id === roleId ? "Equipped" : "Loadout"}</small>
                    </span>
                    <span className="game-role-card__summary">{item.summary}</span>
                    <span className="game-role-card__stats">
                      <span>HP {Math.round(item.hpMult * 100)}%</span>
                      <span>DPR {Math.round(item.dprMult * 100)}%</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="game-category-panel game-frame-control-block">
                <div className="game-frame__minihead">
                  <span>Tactical Role</span>
                  <strong>{tacticalRole.label}</strong>
                </div>
                <div className="game-category-grid" role="radiogroup" aria-label="Tactical role">
                  {TACTICAL_ROLES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={item.id === tacticalRoleId}
                      className={`game-category-chip ${item.id === tacticalRoleId ? "active" : ""}`}
                      onClick={() => {
                        setTacticalRoleId(item.id);
                        setActivePresetId("");
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </PanelGroup>

            <PanelGroup
              title="Design Profile"
              description="Tune challenge rating, monster tier, and tempo."
              icon={Gauge}
              className="game-frame-section--profile"
            >
              <div className="game-frame-tuning-grid">
                <div className="game-category-panel game-frame-control-block game-frame-cr-block">
                  <div className="game-frame__minihead">
                    <span>Target CR</span>
                    <strong>{targetCr}</strong>
                  </div>
                  <NumberField
                    label="Target CR"
                    value={targetCr}
                    min={0}
                    max={30}
                    onChange={(value) => {
                      setTargetCr(value);
                      setActivePresetId("");
                    }}
                  />
                </div>

                <div className="game-category-panel game-frame-control-block">
                  <div className="game-frame__minihead">
                    <span>Tier</span>
                    <strong>{monsterTier.label}</strong>
                  </div>
                  <div className="game-category-grid" role="radiogroup" aria-label="Monster tier">
                    {MONSTER_TIERS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={item.id === monsterTierId}
                        className={`game-category-chip ${item.id === monsterTierId ? "active" : ""}`}
                        onClick={() => {
                          setMonsterTierId(item.id);
                          setActivePresetId("");
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="game-category-panel game-frame-control-block">
                  <div className="game-frame__minihead">
                    <span>Tempo</span>
                    <strong>{tempoProfile.label}</strong>
                  </div>
                  <div className="game-category-grid" role="radiogroup" aria-label="Tempo profile">
                    {TEMPO_PROFILES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={item.id === tempoProfileId}
                        className={`game-category-chip ${item.id === tempoProfileId ? "active" : ""}`}
                        onClick={() => {
                          setTempoProfileId(item.id);
                          setActivePresetId("");
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PanelGroup>

            <PanelGroup
              title="Danger & Budget"
              description="Set encounter danger and watch current pressure limits."
              icon={AlertTriangle}
              className="game-frame-section--danger"
            >
              <div className="game-threat-panel">
                <div className="game-threat-scale" role="radiogroup" aria-label="Monster danger">
                  {DANGERS.map((item, index) => (
                    <button
                      key={item.id}
                      className={`game-threat-chip ${item.id === dangerId ? "active" : ""}`}
                      type="button"
                      role="radio"
                      aria-checked={item.id === dangerId}
                      onClick={() => {
                        setDangerId(item.id);
                        setActivePresetId("");
                      }}
                    >
                      <span>0{index + 1}</span>
                      <strong>{item.label}</strong>
                    </button>
                  ))}
                </div>

                <div className="game-frame__meters" aria-label="Current pressure readout">
                  <MeterTile
                    label="Pressure"
                    value={computed.pressure}
                    max={computed.budget}
                    percent={pressurePercent}
                    over={pressureOverBudget}
                  />
                  <MeterTile
                    label="Complexity"
                    value={computed.complexity}
                    max={computed.complexityCap}
                    percent={complexityPercent}
                    over={complexityOverBudget}
                  />
                </div>
              </div>
            </PanelGroup>
          </div>
        </aside>
      </div>
    </div>
  );

  if (typeof document === "undefined" || !document.body) {
    return modal;
  }

  return createPortal(modal, document.body);
}
