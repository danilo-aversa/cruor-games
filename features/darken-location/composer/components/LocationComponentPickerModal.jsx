import { useMemo, useState } from "react";
import { LOCATION_SLOT_SCOPE_REGION, normalizeLocationSlotScope } from "../model/location-composer-state.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getComponentKey(component) {
  return component?.id || component?.title || component?.name || "component";
}

function getComponentTitle(component) {
  return component?.title || component?.name || "Untitled Component";
}

function getComponentSummary(component) {
  return component?.summary || component?.description || component?.text || component?.effect || "";
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeTokens(values) {
  return new Set(
    toArray(values)
      .map(normalizeToken)
      .filter(Boolean)
      .filter((value) => value !== "any" && value !== "any source"),
  );
}

function intersects(a, b) {
  if (!a?.size || !b?.size) return false;
  for (const value of a) {
    if (b.has(value)) return true;
  }
  return false;
}

function countIntersections(a, b) {
  if (!a?.size || !b?.size) return 0;
  let count = 0;
  for (const value of a) {
    if (b.has(value)) count += 1;
  }
  return count;
}

function addReason(reasons, label) {
  if (!label || reasons.includes(label)) return;
  reasons.push(label);
}

function getComponentTextTokens(component) {
  return normalizeTokens([
    component?.id,
    component?.title,
    component?.name,
    component?.type,
    component?.summary,
    component?.description,
    component?.text,
    component?.effect,
    component?.tableText,
    component?.mechanics,
    component?.narrative,
    ...(Array.isArray(component?.tags) ? component.tags : []),
    ...(Array.isArray(component?.motifs) ? component.motifs : []),
  ]);
}

function getRegionDecisionTokens(activeRegion, generatedRoom) {
  return normalizeTokens([
    activeRegion?.id,
    activeRegion?.name,
    activeRegion?.label,
    activeRegion?.role,
    activeRegion?.type,
    activeRegion?.roomType,
    activeRegion?.size,
    activeRegion?.shape,
    activeRegion?.feature,
    activeRegion?.danger,
    activeRegion?.secret,
    generatedRoom?.id,
    generatedRoom?.name,
    generatedRoom?.label,
    generatedRoom?.role,
    generatedRoom?.type,
    generatedRoom?.roomType,
    ...(Array.isArray(activeRegion?.tags) ? activeRegion.tags : []),
    ...(Array.isArray(activeRegion?.links) ? activeRegion.links : []),
    ...(Array.isArray(generatedRoom?.tags) ? generatedRoom.tags : []),
  ]);
}

function getSelectedBuildTokens(selectedComponents) {
  return normalizeTokens(
    toArray(selectedComponents).flatMap((component) => [
      component?.id,
      component?.title,
      component?.name,
      component?.type,
      ...(Array.isArray(component?.sourceAnchors) ? component.sourceAnchors : []),
      ...(Array.isArray(component?.horror) ? component.horror : []),
      ...(Array.isArray(component?.motifs) ? component.motifs : []),
      ...(Array.isArray(component?.tags) ? component.tags : []),
    ]),
  );
}

function getStateDecisionProfile({ activeRegion, generatedRoom, selectedComponents, slot, state }) {
  const contextTokens = normalizeTokens([
    state?.context,
    state?.mapType,
    activeRegion?.context,
    activeRegion?.type,
    generatedRoom?.context,
    generatedRoom?.type,
    ...(Array.isArray(activeRegion?.contexts) ? activeRegion.contexts : []),
    ...(Array.isArray(generatedRoom?.contexts) ? generatedRoom.contexts : []),
  ]);
  const horrorTokens = normalizeTokens([
    state?.horror,
    ...(Array.isArray(state?.horrors) ? state.horrors : []),
    ...(Array.isArray(activeRegion?.horror) ? activeRegion.horror : []),
    ...(Array.isArray(generatedRoom?.horror) ? generatedRoom.horror : []),
  ]);
  const sourceTokens = normalizeTokens([
    ...(Array.isArray(state?.sourceAnchors) ? state.sourceAnchors : []),
    ...(Array.isArray(activeRegion?.sourceAnchors) ? activeRegion.sourceAnchors : []),
    ...(Array.isArray(generatedRoom?.sourceAnchors) ? generatedRoom.sourceAnchors : []),
  ]);

  return {
    buildTokens: getSelectedBuildTokens(selectedComponents),
    contextTokens,
    horrorTokens,
    regionTokens: getRegionDecisionTokens(activeRegion, generatedRoom),
    slotId: slot?.id || "",
    slotLabel: slot?.label || "",
    sourceTokens,
  };
}

function scoreLocationComponentDecision(component, profile, options = {}) {
  const reasons = [];
  let score = 0;

  const componentSlots = normalizeTokens(component?.slots);
  const componentContexts = normalizeTokens(component?.contexts);
  const componentHorror = normalizeTokens(component?.horror);
  const componentSources = normalizeTokens(component?.sourceAnchors);
  const componentMotifs = normalizeTokens(component?.motifs);
  const componentTags = normalizeTokens(component?.tags);
  const componentPairs = normalizeTokens([
    ...(Array.isArray(component?.pairsWellWith) ? component.pairsWellWith : []),
    ...(Array.isArray(component?.pairWith) ? component.pairWith : []),
  ]);
  const componentTextTokens = getComponentTextTokens(component);
  const slotTokens = normalizeTokens([profile.slotId, profile.slotLabel]);

  if (intersects(componentSlots, slotTokens)) {
    score += 34;
    addReason(reasons, `Fits ${profile.slotLabel || "slot"}`);
  }

  const sourceMatches = countIntersections(componentSources, profile.sourceTokens);
  if (sourceMatches) {
    score += 28 + sourceMatches * 4;
    addReason(reasons, "Matches source");
  }

  const horrorMatches = countIntersections(componentHorror, profile.horrorTokens);
  if (horrorMatches) {
    score += 22 + horrorMatches * 3;
    addReason(reasons, "Supports horror");
  }

  const contextMatches = countIntersections(componentContexts, profile.contextTokens);
  if (contextMatches) {
    score += 20 + contextMatches * 3;
    addReason(reasons, "Fits context");
  }

  const regionMatches =
    countIntersections(componentContexts, profile.regionTokens) +
    countIntersections(componentMotifs, profile.regionTokens) +
    countIntersections(componentTags, profile.regionTokens) +
    countIntersections(componentTextTokens, profile.regionTokens);
  if (options.regionScoped && regionMatches) {
    score += 18 + Math.min(18, regionMatches * 3);
    addReason(reasons, "Fits selected room");
  }

  if (!options.activeSlotFilled) {
    score += 12;
    addReason(reasons, "Fills empty slot");
  }

  const buildMatches =
    countIntersections(componentPairs, profile.buildTokens) +
    countIntersections(componentMotifs, profile.buildTokens) +
    countIntersections(componentTags, profile.buildTokens) +
    countIntersections(componentSources, profile.buildTokens);
  if (buildMatches) {
    score += 10 + Math.min(12, buildMatches * 3);
    addReason(reasons, "Pairs with build");
  }

  if (options.selected) {
    score += 1000;
    addReason(reasons, "Assigned");
  }

  if (!reasons.length) {
    score += 1;
    addReason(reasons, "Compatible");
  }

  return {
    component,
    reasons: reasons.slice(0, 4),
    score,
  };
}

function getDecisionReasonLabels(decision, slot, regionScoped) {
  const labels = Array.isArray(decision?.reasons) ? decision.reasons.filter(Boolean) : [];
  if (labels.length) return labels.slice(0, 4);

  const fallback = [];
  if (slot?.label) fallback.push(slot.label);
  fallback.push(regionScoped ? "Region" : "Map");
  return fallback.slice(0, 3);
}

export function LocationComponentPickerModal({
  activeRegion,
  assignedComponents = [],
  components = [],
  generatedRoom,
  isSlotFull,
  onAddComponent,
  onClose,
  onRemoveComponent,
  open,
  selectedComponents = [],
  slot,
  slotScope = "map",
  state,
}) {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const normalizedScope = normalizeLocationSlotScope(slotScope);
  const regionScoped = normalizedScope === LOCATION_SLOT_SCOPE_REGION;

  const assignedIds = useMemo(
    () => new Set(assignedComponents.map((component) => component.id).filter(Boolean)),
    [assignedComponents],
  );

  const hasSearch = Boolean(search.trim());
  const hasActiveFilters = hasSearch || statusFilter !== "all";

  const visibleComponents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return components.filter((component) => {
      const selected = assignedIds.has(component.id);
      if (statusFilter === "available" && selected) return false;
      if (statusFilter === "assigned" && !selected) return false;

      if (!query) return true;

      const haystack = [
        component.title,
        component.name,
        component.type,
        component.summary,
        component.description,
        component.text,
        component.tableText,
        component.mechanics,
        ...(Array.isArray(component.contexts) ? component.contexts : []),
        ...(Array.isArray(component.horror) ? component.horror : []),
        ...(Array.isArray(component.sourceAnchors) ? component.sourceAnchors : []),
        ...(Array.isArray(component.motifs) ? component.motifs : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [assignedIds, components, search, statusFilter]);

  const decisionProfile = useMemo(
    () => getStateDecisionProfile({ activeRegion, generatedRoom, selectedComponents, slot, state }),
    [activeRegion, generatedRoom, selectedComponents, slot, state],
  );

  const rankedDecisions = useMemo(() => {
    return visibleComponents
      .map((component) =>
        scoreLocationComponentDecision(component, decisionProfile, {
          activeSlotFilled: assignedComponents.length > 0,
          regionScoped,
          selected: assignedIds.has(component.id),
        }),
      )
      .sort((a, b) => {
        if (assignedIds.has(a.component.id) !== assignedIds.has(b.component.id)) {
          return assignedIds.has(a.component.id) ? -1 : 1;
        }
        if (b.score !== a.score) return b.score - a.score;
        return getComponentTitle(a.component).localeCompare(getComponentTitle(b.component));
      });
  }, [assignedComponents.length, assignedIds, decisionProfile, regionScoped, visibleComponents]);

  const recommendedDecisions = useMemo(() => {
    if (statusFilter === "assigned") return [];
    return rankedDecisions
      .filter((decision) => !assignedIds.has(decision.component.id))
      .filter((decision) => decision.score >= 42 || !hasSearch)
      .slice(0, hasSearch ? 2 : 3);
  }, [assignedIds, hasSearch, rankedDecisions, statusFilter]);

  const recommendedIds = useMemo(
    () => new Set(recommendedDecisions.map((decision) => decision.component.id).filter(Boolean)),
    [recommendedDecisions],
  );

  const bestFitDecisions = useMemo(() => {
    if (statusFilter === "assigned") return [];
    return rankedDecisions
      .filter((decision) => !recommendedIds.has(decision.component.id))
      .filter((decision) => !assignedIds.has(decision.component.id))
      .filter((decision) => decision.score >= 54)
      .slice(0, 6);
  }, [assignedIds, rankedDecisions, recommendedIds, statusFilter]);

  const bestFitIds = useMemo(
    () => new Set(bestFitDecisions.map((decision) => decision.component.id).filter(Boolean)),
    [bestFitDecisions],
  );

  const allMatchingDecisions = useMemo(
    () => rankedDecisions.filter((decision) => !recommendedIds.has(decision.component.id) && !bestFitIds.has(decision.component.id)),
    [bestFitIds, rankedDecisions, recommendedIds],
  );

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  if (!open || !slot) return null;

  const drawerTitle = regionScoped
    ? `Choose Room ${slot.label}`
    : `Choose Map ${slot.label}`;
  const targetTitle = regionScoped
    ? activeRegion?.name || "No room selected"
    : "Whole Map";
  const targetMeta = regionScoped
    ? generatedRoom
      ? `Room ${generatedRoom.number || "—"}`
      : "Click a room on the map to change target"
    : "Dungeon-wide slot";

  function renderComponentCard(decision, tier = "matching") {
    const component = decision?.component || decision;
    const componentKey = getComponentKey(component);
    const selected = assignedIds.has(component.id);
    const replaceAction = isSlotFull && !selected;
    const actionLabel = selected ? "Remove" : replaceAction ? "Replace" : "Add";
    const matchLabels = getDecisionReasonLabels(decision, slot, regionScoped);

    return (
      <article
        className={cx(
          "component-card cruor-composer-card location-component-option",
          selected && "in-build is-active",
        )}
        data-decision-score={Math.round(decision?.score || 0)}
        data-decision-tier={selected ? "assigned" : tier}
        draggable={!selected}
        key={componentKey}
      >
        <button
          className="component-toggle-btn location-component-toggle-btn"
          type="button"
          aria-label={selected ? `Remove ${getComponentTitle(component)}` : `${actionLabel} ${getComponentTitle(component)}`}
          onClick={() => (selected ? onRemoveComponent?.(component.id) : onAddComponent?.(component))}
        >
          <i className={cx("fa-solid", selected ? "fa-xmark" : replaceAction ? "fa-repeat" : "fa-plus")} aria-hidden="true" />
          <span>{actionLabel}</span>
        </button>

        <div className="card-top location-component-card-top">
          <div className="component-title-stack location-component-title-stack">
            <h3>{getComponentTitle(component)}</h3>
          </div>
        </div>

        {matchLabels.length ? (
          <div className="location-component-option__meta location-component-decision-row" aria-label="Recommendation reasons">
            {matchLabels.map((label) => (
              <span className="location-component-decision-chip" key={label}>{label}</span>
            ))}
          </div>
        ) : null}

        {getComponentSummary(component) ? (
          <p className="summary location-component-summary">{getComponentSummary(component)}</p>
        ) : null}
      </article>
    );
  }

  function renderDecisionGroup(title, decisions, tier) {
    if (!decisions.length) return null;
    return (
      <section className="location-component-decision-group" data-decision-tier={tier}>
        <div className="tag-filter-row__head location-component-filter-row__head location-component-decision-group__head">
          <span>{title}</span>
        </div>
        {decisions.map((decision) => renderComponentCard(decision, tier))}
      </section>
    );
  }

  return (
    <div
      className={cx("component-navigator-drawer location-component-drawer", filtersOpen && "is-filters-open")}
      data-filters-open={filtersOpen ? "true" : "false"}
      data-navigator-mode="slot"
      data-slot-scope={normalizedScope}
    >
      <div
        className="component-navigator-modal component-navigator-modal--drawer location-component-modal"
        data-navigator-mode="slot"
        data-filters-open={filtersOpen ? "true" : "false"}
        role="region"
        aria-label={drawerTitle}
      >
        <aside
          className="panel navigator location-navigator component-navigator-modal__panel location-component-drawer__panel"
          aria-label="Location Component Navigator"
        >
          <div className="component-navigator-modal__head location-component-drawer__head">
            <div className="component-navigator-modal__head-copy location-component-drawer__head-copy">
              <h2>{drawerTitle}</h2>
            </div>
            <div className="component-navigator-modal__head-actions location-component-drawer__head-actions">
              <button
                className={cx("icon-btn navigator-filter-btn location-navigator-filter-btn", filtersOpen && "active")}
                type="button"
                aria-label="Filter components"
                aria-expanded={filtersOpen}
                data-active-count={hasActiveFilters ? 1 : 0}
                onClick={() => setFiltersOpen((current) => !current)}
              >
                <i className="fa-solid fa-sliders" aria-hidden="true" />
              </button>
              <button
                className="icon-btn location-component-drawer__close"
                type="button"
                aria-label="Close Component Navigator"
                onClick={onClose}
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="location-component-drawer__target">
            <div className="location-component-drawer__target-copy">
              <span>{regionScoped ? "Target Region" : "Target Map"}</span>
              <strong>{targetTitle}</strong>
              <small>{targetMeta}</small>
            </div>
          </div>

          {filtersOpen ? (
            <div className="navigator-tools location-navigator-tools component-navigator-modal__rail">
              <div className="navigator-search-row location-component-search-row">
                <div className="search-wrap location-component-search">
                  <input
                    type="search"
                    value={search}
                    placeholder="Search components…"
                    aria-label="Search location components"
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="navigator-count location-component-count" aria-label="Visible component count">
                  {visibleComponents.length}
                </div>
              </div>

              <div className="tag-filter-row location-component-filter-row" aria-label="Filter location components">
                <div className="tag-filter-row__head location-component-filter-row__head">
                  <span>Component Filters</span>
                  <button
                    className="tag-clear-btn location-component-filter-clear"
                    type="button"
                    disabled={!hasActiveFilters}
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>
                <div className="navigator-filter-panel location-component-filter-panel">
                  <section className="navigator-filter-section location-component-filter-section">
                    <strong>Status</strong>
                    <div className="filter-chip-grid location-component-filter-chip-grid">
                      {[
                        ["all", "All"],
                        ["available", "Available"],
                        ["assigned", "Assigned"],
                      ].map(([value, label]) => (
                        <button
                          className={cx("navigator-filter-chip location-component-filter-chip", statusFilter === value && "active is-active")}
                          key={value}
                          type="button"
                          aria-pressed={statusFilter === value}
                          onClick={() => setStatusFilter(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : null}

          <div className="component-list location-component-list component-navigator-modal__list cruor-scroll-surface">
            {visibleComponents.length ? (
              <>
                {renderDecisionGroup("Recommended", recommendedDecisions, "recommended")}
                {renderDecisionGroup("Best Fits", bestFitDecisions, "best-fit")}
                {renderDecisionGroup(
                  recommendedDecisions.length || bestFitDecisions.length ? "All Matching" : "Matching Components",
                  allMatchingDecisions,
                  "matching",
                )}
              </>
            ) : (
              <p className="location-empty location-empty--quiet">No compatible options.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
