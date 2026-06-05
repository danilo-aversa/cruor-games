import { useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Gauge, Plus, ShieldAlert, ShieldCheck, SlidersHorizontal, X } from "lucide-react";

import { ALL_MONSTER_SOURCES as SOURCES } from "../data/monster-content-pack-feed.js";
import { SLOTS } from "../monster-composer.workflow.js";
import { getSelectedIdsForSlot } from "../model/monster-composer.selection.js";
import {
  formatToken,
  getCompatibilityStatus,
  getFeatureCompatibility,
} from "../model/monster-composer.compatibility.js";
import {
  getFeatureMechanicProfile,
  getFeatureSection,
} from "../model/monster-composer.balance.js";
import {
  getSectionLabel,
  normalizeMonsterReferences,
} from "../model/monster-composer.export.js";

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getContentPackId(entry) {
  return entry?.contentPack?.id || "core-cruor";
}

function getContentPackTitle(entry) {
  return entry?.contentPack?.title || "Core Monster Composer";
}

function getSourcePackTitle(source) {
  return source?.contentPack?.title || "Core Monster Composer";
}

function EmptyState({ text }) {
  return <div className="empty">{text}</div>;
}

function signedDelta(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function hasDelta(value) {
  return Number(value || 0) !== 0;
}

function getCounterplayTone(counterplay) {
  if (counterplay === "Improves") return "positive";
  if (counterplay === "Worsens" || counterplay === "Needs Tell") return "negative";
  return "";
}

function getDeltaTone(value) {
  const number = Number(value || 0);
  if (number <= 0) return "good";
  if (number <= 1) return "low";
  if (number <= 2) return "medium";
  return "high";
}

function ImpactMetricDock({ impact, compact = false }) {
  const pressureTone = getDeltaTone(impact?.pressureDelta);
  const complexityTone = getDeltaTone(impact?.complexityDelta);
  const counterplayTone = getCounterplayTone(impact?.counterplay);
  const CounterplayIcon = counterplayTone === "positive" ? ShieldCheck : ShieldAlert;

  return (
    <div className={`component-impact-dock ${compact ? "is-compact" : ""}`} aria-label="Component impact">
      <span
        className={`component-impact-metric component-impact-metric--pressure is-${pressureTone}`}
        aria-label={`Pressure ${signedDelta(impact?.pressureDelta)}`}
      >
        <Gauge aria-hidden="true" />
        <strong>{signedDelta(impact?.pressureDelta)}</strong>
      </span>
      <span
        className={`component-impact-metric component-impact-metric--complexity is-${complexityTone}`}
        aria-label={`Complexity ${signedDelta(impact?.complexityDelta)}`}
      >
        <SlidersHorizontal aria-hidden="true" />
        <strong>{signedDelta(impact?.complexityDelta)}</strong>
      </span>
      {counterplayTone && (
        <span
          className={`component-impact-metric component-impact-metric--counterplay is-${counterplayTone}`}
          aria-label={`Counterplay ${impact.counterplay}`}
        >
          <CounterplayIcon aria-hidden="true" />
        </span>
      )}
    </div>
  );
}


function ImpactMetaRows({ impact }) {
  return (
    <>
      {hasDelta(impact?.dprDelta) && (
        <div className="meta-row">
          <span className="meta-label">DPR</span>
          <span className="meta-values">
            <span className="meta-value strong-chip">{signedDelta(impact.dprDelta)}</span>
          </span>
        </div>
      )}
      {hasDelta(impact?.hpDelta) && (
        <div className="meta-row">
          <span className="meta-label">HP</span>
          <span className="meta-values">
            <span className="meta-value strong-chip">{signedDelta(impact.hpDelta)}</span>
          </span>
        </div>
      )}
      {hasDelta(impact?.acDelta) && (
        <div className="meta-row">
          <span className="meta-label">AC</span>
          <span className="meta-values">
            <span className="meta-value strong-chip">{signedDelta(impact.acDelta)}</span>
          </span>
        </div>
      )}
      {(impact?.warningsCleared > 0 || impact?.warningsAdded > 0) && (
        <div className="meta-row">
          <span className="meta-label">Warnings</span>
          <span className="meta-values">
            {impact.warningsCleared > 0 && (
              <span className="meta-value strong-chip">Clears {impact.warningsCleared}</span>
            )}
            {impact.warningsAdded > 0 && (
              <span className="meta-value danger-chip">
                Adds {impact.warningsAdded} warning{impact.warningsAdded === 1 ? "" : "s"}
              </span>
            )}
          </span>
        </div>
      )}
    </>
  );
}


function ComponentNavigatorPanel({
  surface = "modal",
  mode,
  activeSlot,
  navigatorSlotFilter,
  setNavigatorSlotFilter,
  navigatorPackFilter = "all",
  setNavigatorPackFilter,
  navigatorSourceFilters,
  setNavigatorSourceFilters,
  contentPackOptions = [],
  setActiveSlot,
  onClose,
  visibleFeatures,
  selected,
  selectedFeatures,
  typeId,
  category,
  roleId,
  computed,
  sourceId,
  setSourceId,
  setActivePresetId,
  navigatorSearch,
  setNavigatorSearch,
  navigatorFiltersOpen,
  setNavigatorFiltersOpen,
  advancedMode,
  slotCaps,
  addFeature,
  setDraggedFeatureId,
  getSlotCap,
  buildSmartSlotPicks,
  buildFeatureDecisionProfile,
  buildFeatureImpactPreview,
}) {
  const [navigatorBestPickFilter, setNavigatorBestPickFilter] = useState("all");
  const slotData = SLOTS.find((slot) => slot.id === activeSlot) || SLOTS[0];
  const filteredSlotData = SLOTS.find((slot) => slot.id === navigatorSlotFilter);
  const modalTitle =
    mode === "global"
      ? navigatorSlotFilter === "all"
        ? "Global Component Navigator"
        : `${filteredSlotData?.label || "Filtered"} Components`
      : `Choose ${slotData.label} Graft`;
  const smartPickSlotId = mode === "global" ? navigatorSlotFilter : activeSlot;
  const smartPicks = buildSmartSlotPicks({
    slotId: smartPickSlotId,
    candidates: visibleFeatures,
    selected,
    selectedFeatures,
    typeId,
    category,
    roleId,
    tacticalRoleId: computed.tacticalRole.id,
    monsterTierId: computed.monsterTier.id,
  });
  const activeBestPickIds = new Set(
    navigatorBestPickFilter === "best"
      ? smartPicks.map((pick) => pick.feature.id)
      : smartPicks
          .filter((pick) => pick.id === navigatorBestPickFilter)
          .map((pick) => pick.feature.id)
  );
  const bestPickFilterActive = navigatorBestPickFilter !== "all" && activeBestPickIds.size > 0;
  const displayedFeatures = bestPickFilterActive
    ? visibleFeatures.filter((feature) => activeBestPickIds.has(feature.id))
    : visibleFeatures;
  const packOptions = [
    { id: "all", title: "All Content Packs" },
    ...contentPackOptions.filter((pack) => pack.id !== "all"),
  ];
  const sourceFilterOptions =
    navigatorPackFilter === "all"
      ? SOURCES
      : SOURCES.filter((source) => getContentPackId(source) === navigatorPackFilter);
  const activeSourceFilters =
    Array.isArray(navigatorSourceFilters) && navigatorSourceFilters.length > 0
      ? navigatorSourceFilters
      : [sourceId].filter(Boolean);
  const sourceFilterActive =
    activeSourceFilters.length !== 1 || activeSourceFilters[0] !== sourceId;
  const hasActiveNavigatorFilters = Boolean(
    navigatorSearch.trim() ||
      sourceFilterActive ||
      navigatorPackFilter !== "all" ||
      bestPickFilterActive ||
      (mode === "global" && navigatorSlotFilter !== "all")
  );
  const showRail = surface !== "drawer" || navigatorFiltersOpen;

  function toggleFilters() {
    setNavigatorFiltersOpen((current) => !current);
  }

  function selectContentPackFilter(packId) {
    setNavigatorPackFilter?.(packId);
    if (packId === "all") return;

    const sourcesInPack = SOURCES.filter((source) => getContentPackId(source) === packId);
    if (!sourcesInPack.length) return;

    const currentSourcesInPack = activeSourceFilters.filter((id) =>
      sourcesInPack.some((source) => source.id === id)
    );
    if (currentSourcesInPack.length) return;

    const nextSource = sourcesInPack[0];
    setNavigatorSourceFilters?.([nextSource.id]);
    setSourceId(nextSource.id);
    setActivePresetId("");
  }

  function toggleSourceFilter(nextSourceId) {
    if (!nextSourceId) return;

    setNavigatorSourceFilters?.((current) => {
      const currentIds =
        Array.isArray(current) && current.length > 0 ? current : [sourceId].filter(Boolean);
      const nextIds = currentIds.includes(nextSourceId)
        ? currentIds.filter((id) => id !== nextSourceId)
        : [...currentIds, nextSourceId];
      return nextIds.length ? nextIds : [nextSourceId];
    });
    setSourceId(nextSourceId);
    setActivePresetId("");
  }

  return (
    <div
      className={`component-navigator-modal component-navigator-modal--${surface}`}
      data-navigator-mode={mode}
      data-filters-open={navigatorFiltersOpen ? "true" : "false"}
      data-has-smart-picks={smartPicks.length > 0 ? "true" : "false"}
      role={surface === "modal" ? "dialog" : "region"}
      aria-modal={surface === "modal" ? "true" : undefined}
      aria-label={modalTitle}
    >
      {surface === "modal" && (
        <button
          className="component-navigator-modal__scrim"
          type="button"
          aria-label="Close Component Navigator"
          onClick={onClose}
        />
      )}
      <aside
        className="panel navigator monster-navigator component-navigator-modal__panel"
        aria-label="Component Navigator"
      >
        <div className="component-navigator-modal__head">
          <div className="component-navigator-modal__head-copy">
            <h2>{modalTitle}</h2>
          </div>
          <div className="component-navigator-modal__head-actions">
            {surface === "drawer" && (
              <button
                className={`icon-btn navigator-filter-btn ${navigatorFiltersOpen ? "active" : ""}`}
                type="button"
                aria-label="Filter components"
                aria-expanded={navigatorFiltersOpen}
                data-active-count={hasActiveNavigatorFilters ? 1 : 0}
                onClick={toggleFilters}
              >
                <SlidersHorizontal aria-hidden="true" />
              </button>
            )}
            <button
              className="icon-btn"
              type="button"
              aria-label="Close Component Navigator"
              onClick={onClose}
            >
              <X aria-hidden="true" />
            </button>
          </div>
        </div>

        {showRail && (
          <div className="navigator-tools monster-navigator-tools component-navigator-modal__rail">
            <div className="navigator-search-row">
              <div className="search-wrap monster-search-wrap">
                <input
                  type="search"
                  value={navigatorSearch}
                  placeholder="Search components…"
                  aria-label="Search components"
                  onChange={(event) => setNavigatorSearch(event.target.value)}
                />
              </div>
              {surface === "modal" && (
                <button
                  className={`icon-btn navigator-filter-btn ${navigatorFiltersOpen ? "active" : ""}`}
                  type="button"
                  aria-label="Filter components"
                  aria-expanded={navigatorFiltersOpen}
                  data-active-count={hasActiveNavigatorFilters ? 1 : 0}
                  onClick={toggleFilters}
                >
                  <SlidersHorizontal aria-hidden="true" />
                </button>
              )}
              <div className="navigator-count" aria-label="Visible component count">
                {displayedFeatures.length}
              </div>
            </div>

            {(surface === "drawer" || navigatorFiltersOpen) && (
              <div className="tag-filter-row monster-source-grid-open" aria-label="Filter components">
                <div className="tag-filter-row__head">
                  <span>Component Filters</span>
                  <button
                    className="tag-clear-btn"
                    type="button"
                    onClick={() => {
                      setNavigatorSearch("");
                      setNavigatorSlotFilter(mode === "global" ? "all" : activeSlot);
                      setNavigatorPackFilter?.("all");
                      setNavigatorSourceFilters?.([sourceId]);
                      setNavigatorBestPickFilter("all");
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="navigator-filter-panel">
                  <section className="navigator-filter-section">
                    <strong>Inspiration</strong>
                    <div className="filter-chip-grid source-filter">
                      {sourceFilterOptions.map((item) => {
                        const isActive = activeSourceFilters.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`navigator-filter-chip navigator-filter-chip--stacked ${isActive ? "active" : ""}`}
                            aria-pressed={isActive}
                            onClick={() => toggleSourceFilter(item.id)}
                          >
                            <span className="navigator-filter-chip__main">{item.label}</span>
                            <span className="navigator-filter-chip__meta">{getSourcePackTitle(item)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                  <section className="navigator-filter-section">
                    <strong>Content Pack</strong>
                    <div className="filter-chip-grid source-filter">
                      {packOptions.map((pack) => (
                        <button
                          key={pack.id}
                          type="button"
                          className={`navigator-filter-chip ${pack.id === navigatorPackFilter ? "active" : ""}`}
                          aria-pressed={pack.id === navigatorPackFilter}
                          onClick={() => selectContentPackFilter(pack.id)}
                        >
                          {pack.title}
                        </button>
                      ))}
                    </div>
                  </section>
                  {smartPicks.length > 0 && (
                    <section className="navigator-filter-section">
                      <strong>Best Picks</strong>
                      <div className="filter-chip-grid source-filter">
                        <button
                          type="button"
                          className={`navigator-filter-chip ${navigatorBestPickFilter === "all" ? "active" : ""}`}
                          aria-pressed={navigatorBestPickFilter === "all"}
                          onClick={() => setNavigatorBestPickFilter("all")}
                        >
                          All Components
                        </button>
                        <button
                          type="button"
                          className={`navigator-filter-chip ${navigatorBestPickFilter === "best" ? "active" : ""}`}
                          aria-pressed={navigatorBestPickFilter === "best"}
                          onClick={() => setNavigatorBestPickFilter("best")}
                        >
                          Best Picks
                        </button>
                        {smartPicks.map((pick) => (
                          <button
                            key={pick.id}
                            type="button"
                            className={`navigator-filter-chip ${navigatorBestPickFilter === pick.id ? "active" : ""}`}
                            aria-pressed={navigatorBestPickFilter === pick.id}
                            onClick={() => setNavigatorBestPickFilter(pick.id)}
                          >
                            {pick.label}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "global" && (
          <div className="source-modal__tools monster-slot-tabs component-navigator-modal__slot-tabs">
            <button
              type="button"
              className={`navigator-filter-chip ${navigatorSlotFilter === "all" ? "active" : ""}`}
              onClick={() => setNavigatorSlotFilter("all")}
            >
              All
            </button>
            {SLOTS.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={`navigator-filter-chip ${slot.id === navigatorSlotFilter ? "active" : ""}`}
                onClick={() => {
                  setNavigatorSlotFilter(slot.id);
                  setActiveSlot(slot.id);
                }}
              >
                {slot.label}
              </button>
            ))}
          </div>
        )}

        <div className="component-list monster-component-list component-navigator-modal__list cruor-scroll-surface">
          {displayedFeatures.length === 0 ? (
            <EmptyState text="No compatible components for this source/type/role/filter combination in the MVP dataset." />
          ) : (
            displayedFeatures.map((feature) => {
              const featureSlotIds = getSelectedIdsForSlot(selected, feature.slot);
              const featureSlotCap = advancedMode ? getSlotCap(slotCaps, feature.slot) : 1;
              const selectedInSlot = featureSlotIds.includes(feature.id);
              const slotFull =
                featureSlotCap > 1 && featureSlotIds.length >= featureSlotCap && !selectedInSlot;
              const compatibility = getCompatibilityStatus(
                feature,
                selectedFeatures,
                typeId,
                category
              );
              const decisionProfile = buildFeatureDecisionProfile(feature, {
                status: compatibility,
                selected,
                selectedFeatures,
                typeId,
                category,
                roleId,
                tacticalRoleId: computed.tacticalRole.id,
                monsterTierId: computed.monsterTier.id,
                currentSlot: mode === "global" ? navigatorSlotFilter : activeSlot,
                selectedInSlot,
              });
              return (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  selected={selectedInSlot}
                  slotFull={slotFull}
                  compatibility={compatibility}
                  decisionProfile={decisionProfile}
                  selectedBuild={selected}
                  selectedFeatures={selectedFeatures}
                  typeId={typeId}
                  category={category}
                  computed={computed}
                  onAdd={() => addFeature(feature)}
                  onDragStart={() => setDraggedFeatureId(feature.id)}
                  onDragEnd={() => setDraggedFeatureId(null)}
                  buildFeatureImpactPreview={buildFeatureImpactPreview}
                />
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}

export function ComponentNavigatorDrawer({ open, ...props }) {
  if (!open) return null;

  return (
    <div
      className={`component-navigator-drawer ${props.navigatorFiltersOpen ? "is-filters-open" : ""}`}
      data-filters-open={props.navigatorFiltersOpen ? "true" : "false"}
      data-navigator-mode={props.mode}
    >
      <ComponentNavigatorPanel surface="drawer" {...props} />
    </div>
  );
}

export function ComponentNavigatorModal({ open, ...props }) {
  if (!open) return null;

  const modal = <ComponentNavigatorPanel surface="modal" {...props} />;

  if (typeof document === "undefined" || !document.body) {
    return modal;
  }

  return createPortal(
    <div
      className="monster-shell component-navigator-modal-portal"
      data-component-navigator-portal=""
    >
      {modal}
    </div>,
    document.body
  );
}

function FeatureCard({
  feature,
  selected,
  slotFull,
  compatibility,
  decisionProfile,
  selectedBuild,
  selectedFeatures,
  typeId,
  category,
  computed,
  onAdd,
  onDragStart,
  onDragEnd,
  buildFeatureImpactPreview,
}) {
  const source = SOURCES.find((item) => item.id === feature.source);
  const packTitle = getContentPackTitle(feature);
  const sourcePackTitle = getSourcePackTitle(source);
  const rules = getFeatureCompatibility(feature);
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const hasCompatibilityBadge = compatibility?.kind && compatibility.kind !== "compatible";
  const profile = decisionProfile || { tier: "safe" };
  const actionLabel = selected ? "Added" : slotFull ? "Full" : "Add";
  const impact = buildFeatureImpactPreview({
    feature,
    selected: selectedBuild || {},
    selectedFeatures: selectedFeatures || [],
    typeId,
    category,
    computed,
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <motion.article
      layout
      draggable={!selected && !slotFull}
      onDragStart={(event) => {
        if (selected || slotFull) {
          event.preventDefault();
          return;
        }
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      className={`component-card ${selected ? "in-build" : ""} ${slotFull ? "slot-full" : ""} ${detailsOpen ? "details-open" : ""} ${hasCompatibilityBadge ? `compatibility-${compatibility.kind}` : ""}`}
      data-decision-tier={profile.tier}
    >
      <button
        className="component-toggle-btn"
        type="button"
        onClick={onAdd}
        aria-label={
          selected
            ? `${feature.title} already installed`
            : slotFull
              ? `${titleCase(feature.slot)} slot is full`
              : `Add ${feature.title}`
        }
        disabled={selected || slotFull}
      >
        <Plus aria-hidden="true" />
        <span>{actionLabel}</span>
      </button>

      <div className="card-top">
        <div className="component-title-stack">
          <h3>{feature.title}</h3>
        </div>
        {hasCompatibilityBadge && (
          <span className={`compatibility-badge ${compatibility.kind}`}>{compatibility.label}</span>
        )}
      </div>

      <p className="summary">{normalizeMonsterReferences(feature.summary, computed)}</p>
      <ImpactMetricDock impact={impact} />

      {hasCompatibilityBadge && <p className="compatibility-note">{compatibility.message}</p>}
      {slotFull && (
        <p className="compatibility-note">
          This slot is full. Raise its cap or remove a graft first.
        </p>
      )}
      <div
        className="component-details"
        onPointerEnter={() => setDetailsOpen(true)}
        onPointerLeave={() => setDetailsOpen(false)}
        onFocus={() => setDetailsOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDetailsOpen(false);
          }
        }}
      >
        <button
          className="component-details__trigger"
          type="button"
          aria-expanded={detailsOpen}
          aria-haspopup="dialog"
        >
          Details
        </button>
        <div className="meta-list component-details__panel" aria-label="Component metadata">
          <div className="meta-row">
            <span className="meta-label">Inspiration</span>
            <span className="meta-values">
              <span className="meta-value source-chip">{source?.label}</span>
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Content Pack</span>
            <span className="meta-values">
              <span className="meta-value pack-chip">{packTitle}</span>
              {sourcePackTitle !== packTitle && (
                <span className="meta-value">Source: {sourcePackTitle}</span>
              )}
            </span>
          </div>
          <ImpactMetaRows impact={impact} />
          <div className="meta-row">
            <span className="meta-label">Slot</span>
            <span className="meta-values">
              <span className="meta-value strong-chip">{titleCase(feature.slot)}</span>
              <span className="meta-value">{getSectionLabel(getFeatureSection(feature))}</span>
            </span>
          </div>
          {mechanicProfile.mechanicTags.length > 0 && (
            <div className="meta-row">
              <span className="meta-label">Tags</span>
              <span className="meta-values">
                {mechanicProfile.mechanicTags.slice(0, 5).map((tag) => (
                  <span key={tag} className="meta-value">
                    {formatToken(tag)}
                  </span>
                ))}
              </span>
            </div>
          )}
          {rules.grants.length > 0 && (
            <div className="meta-row">
              <span className="meta-label">Grants</span>
              <span className="meta-values">
                {rules.grants.map((token) => (
                  <span key={token} className="meta-value">
                    {formatToken(token)}
                  </span>
                ))}
              </span>
            </div>
          )}
          {(rules.requires.length > 0 ||
            rules.softRequires.length > 0 ||
            rules.incompatibleWith.length > 0) && (
            <div className="meta-row">
              <span className="meta-label">Locks</span>
              <span className="meta-values">
                {rules.requires.map((token) => (
                  <span key={`requires-${token}`} className="meta-value strong-chip">
                    Requires {formatToken(token)}
                  </span>
                ))}
                {rules.softRequires.map((token) => (
                  <span key={`soft-${token}`} className="meta-value">
                    Wants {formatToken(token)}
                  </span>
                ))}
                {rules.incompatibleWith.map((token) => (
                  <span key={`blocks-${token}`} className="meta-value danger-chip">
                    Blocks {formatToken(token)}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

