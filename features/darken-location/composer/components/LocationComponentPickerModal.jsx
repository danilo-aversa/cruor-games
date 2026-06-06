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
  slot,
  slotScope = "map",
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

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== "all";

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
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [assignedIds, components, search, statusFilter]);

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

                  <section className="navigator-filter-section location-component-filter-section">
                    <strong>{regionScoped ? "Target Room" : "Target Map"}</strong>
                    <div className="location-component-drawer__target">
                      <div className="location-component-drawer__target-copy">
                        <span>Target</span>
                        <strong>{targetTitle}</strong>
                        <small>{targetMeta}</small>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : null}

          <div className="component-list location-component-list component-navigator-modal__list cruor-scroll-surface">
            {visibleComponents.length ? visibleComponents.map((component) => {
              const componentKey = getComponentKey(component);
              const selected = assignedIds.has(component.id);
              const slotFull = isSlotFull && !selected;
              const actionLabel = selected ? "Added" : slotFull ? "Full" : "Add";
              return (
                <article
                  className={cx(
                    "component-card cruor-composer-card location-component-option",
                    selected && "in-build is-active",
                    slotFull && "slot-full",
                  )}
                  data-decision-tier={selected ? "recommended" : slotFull ? "blocked" : "recommended"}
                  draggable={!selected && !slotFull}
                  key={componentKey}
                >
                  <button
                    className="component-toggle-btn location-component-toggle-btn"
                    type="button"
                    aria-label={selected ? `Remove ${getComponentTitle(component)}` : `${actionLabel} ${getComponentTitle(component)}`}
                    disabled={slotFull}
                    onClick={() => (selected ? onRemoveComponent?.(component.id) : onAddComponent?.(component))}
                  >
                    <i className={cx("fa-solid", selected ? "fa-check" : "fa-plus")} aria-hidden="true" />
                    <span>{actionLabel}</span>
                  </button>

                  <div className="card-top location-component-card-top">
                    <div className="component-title-stack location-component-title-stack">
                      <h3>{getComponentTitle(component)}</h3>
                    </div>
                  </div>

                  {getComponentSummary(component) ? (
                    <p className="summary location-component-summary">{getComponentSummary(component)}</p>
                  ) : null}
                </article>
              );
            }) : (
              <p className="location-empty location-empty--quiet">No compatible options.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
