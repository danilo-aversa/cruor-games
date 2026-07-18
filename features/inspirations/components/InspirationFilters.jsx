import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { t } from "../../../shared/i18n/index.js";
import {
  INSPIRATION_DOMAIN_ORDER,
  INSPIRATION_DOMAINS,
} from "../inspirations.card-config.js";

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function FilterListbox({
  id,
  label,
  value,
  options,
  onChange,
  icon = "fa-filter",
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const optionRefs = useRef([]);
  const pendingFocusIndexRef = useRef(null);

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value);
    return index >= 0 ? index : 0;
  }, [options, value]);
  const selectedOption = options[selectedIndex] ||
    options[0] || {
      value: "",
      label: "—",
    };

  function closeMenu({ restoreFocus = false } = {}) {
    setOpen(false);
    setMenuStyle(null);
    pendingFocusIndexRef.current = null;
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  function openMenu(focusIndex = selectedIndex) {
    pendingFocusIndexRef.current = focusIndex;
    setOpen(true);
  }

  function focusOption(index) {
    if (!options.length) return;
    const normalizedIndex = (index + options.length) % options.length;
    optionRefs.current[normalizedIndex]?.focus();
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(selectedIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(selectedIndex);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  }

  function handleOptionKeyDown(event, index) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusOption(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusOption(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusOption(0);
        break;
      case "End":
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        break;
      case "Tab":
        closeMenu();
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (!open) return undefined;

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;
      const width = Math.min(
        Math.max(rect.width, 220),
        Math.max(220, viewportWidth - gap * 2),
      );
      const maxHeight = Math.min(360, Math.max(180, viewportHeight - gap * 2));
      const left = clamp(
        rect.left,
        gap,
        Math.max(gap, viewportWidth - width - gap),
      );
      const spaceBelow = viewportHeight - rect.bottom - gap;
      const estimatedHeight = Math.min(maxHeight, options.length * 48 + 12);
      const top =
        spaceBelow >= estimatedHeight
          ? rect.bottom + 6
          : Math.max(gap, rect.top - estimatedHeight - 6);

      setMenuStyle({
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        width: `${Math.round(width)}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
      });
    }

    let frameId = window.requestAnimationFrame(updateMenuPosition);

    function scheduleUpdate() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMenuPosition);
    }

    function handlePointerDown(event) {
      if (
        rootRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      closeMenu();
    }

    function handleDocumentKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
      }
    }

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open || menuStyle == null) return;
    const focusIndex = pendingFocusIndexRef.current ?? selectedIndex;
    pendingFocusIndexRef.current = null;
    window.requestAnimationFrame(() => focusOption(focusIndex));
  }, [menuStyle, open, selectedIndex]);

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            id={`${id}-menu`}
            className="inspirations-filters__listbox-menu cruor-dropdown-menu cruor-dropdown-menu--listbox"
            role="listbox"
            aria-labelledby={`${id}-label`}
            ref={menuRef}
            style={menuStyle || undefined}
          >
            {options.map((option, index) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  className={`cruor-dropdown-option${active ? " is-active" : ""}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  onClick={() => {
                    onChange(option.value);
                    closeMenu({ restoreFocus: true });
                  }}
                >
                  <i
                    className={`fa-solid ${active ? "fa-check" : icon} cruor-dropdown-option__icon`}
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="cruor-dropdown-option__label">
                      {option.label}
                    </strong>
                  </span>
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="inspirations-filters__listbox" ref={rootRef}>
      <span id={`${id}-label`}>{label}</span>
      <button
        id={`${id}-trigger`}
        className="inspirations-filters__listbox-trigger cruor-dropdown-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        ref={triggerRef}
        onKeyDown={handleTriggerKeyDown}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            openMenu();
          }
        }}
      >
        <i
          className={`fa-solid ${icon} cruor-dropdown-trigger__icon`}
          aria-hidden="true"
        />
        <strong className="cruor-dropdown-trigger__label">
          {selectedOption.label}
        </strong>
        <i
          className="fa-solid fa-chevron-down cruor-dropdown-trigger__chevron"
          aria-hidden="true"
        />
      </button>
      {menu}
    </div>
  );
}

export default function InspirationFilters({
  locale = "en",
  search,
  onSearchChange,
  domainFilter,
  onDomainChange,
  domainCounts,
  sortMode,
  onSortChange,
  sortOptions,
  sourceTypeFilter,
  onSourceTypeChange,
  sourceTypeOptions,
  obscurityFilter,
  onObscurityChange,
  obscurityOptions,
  collectionFilter,
  onCollectionChange,
  collectionOptions,
  activeFilterCount,
  onClearFilters,
  onClose,
  active = false,
}) {
  const searchInputRef = useRef(null);
  const clearLabel = t("inspirations.filters.clear", {}, locale);

  useEffect(() => {
    if (!active) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    function handleEscape(event) {
      if (
        event.key !== "Escape" ||
        document.querySelector(".inspirations-filters__listbox-menu")
      ) {
        return;
      }
      event.preventDefault();
      onClose?.();
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [active, onClose]);

  return (
    <section
      id="inspirations-filter-panel"
      className="inspirations-filters cruor-ui-panel-surface"
      aria-label={t("inspirations.filters.aria", {}, locale)}
    >
      <div className="inspirations-filters__primary">
        <label className="inspirations-filters__search">
          <span>{t("inspirations.filters.searchLabel", {}, locale)}</span>
          <span className="inspirations-filters__search-field">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t(
                "inspirations.filters.searchPlaceholder",
                {},
                locale,
              )}
              aria-label={t("inspirations.filters.searchLabel", {}, locale)}
            />
          </span>
        </label>

        <FilterListbox
          id="inspirations-sort"
          label={t("inspirations.filters.sort", {}, locale)}
          value={sortMode}
          options={sortOptions}
          onChange={onSortChange}
          icon="fa-arrow-down-wide-short"
        />

        <button
          className="inspirations-filters__utility cruor-square-icon-button"
          type="button"
          disabled={!activeFilterCount && !search.trim()}
          aria-label={clearLabel}
          title={clearLabel}
          data-key="tooltip-generic"
          data-tooltip={clearLabel}
          onClick={onClearFilters}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
          <span className="sr-only">{clearLabel}</span>
        </button>
      </div>

      <div
        className="inspirations-filters__domains"
        role="group"
        aria-label={t("inspirations.filters.domain", {}, locale)}
      >
        <button
          type="button"
          className={domainFilter === "all" ? "is-active" : ""}
          aria-pressed={domainFilter === "all"}
          onClick={() => onDomainChange("all")}
        >
          <span
            className="inspirations-filters__domain-symbol"
            aria-hidden="true"
          >
            <i className="fa-solid fa-layer-group" />
          </span>
          <span>{t("inspirations.domains.all", {}, locale)}</span>
          <small>{domainCounts.all || 0}</small>
        </button>

        {INSPIRATION_DOMAIN_ORDER.map((domainId) => {
          const domain = INSPIRATION_DOMAINS[domainId];
          const active = domainFilter === domainId;
          return (
            <button
              key={domainId}
              type="button"
              className={active ? "is-active" : ""}
              aria-pressed={active}
              onClick={() => onDomainChange(domainId)}
            >
              <span
                className="inspirations-filters__domain-symbol"
                aria-hidden="true"
              >
                <i className={`fa-solid ${domain.icon}`} />
              </span>
              <span>{t(domain.labelKey, {}, locale)}</span>
              <small>{domainCounts[domainId] || 0}</small>
            </button>
          );
        })}
      </div>

      <div className="inspirations-filters__secondary">
        <FilterListbox
          id="inspirations-source-type"
          label={t("inspirations.filters.sourceType", {}, locale)}
          value={sourceTypeFilter}
          options={sourceTypeOptions}
          onChange={onSourceTypeChange}
          icon="fa-tags"
        />
        <FilterListbox
          id="inspirations-obscurity"
          label={t("inspirations.filters.obscurity", {}, locale)}
          value={obscurityFilter}
          options={obscurityOptions}
          onChange={onObscurityChange}
          icon="fa-eye"
        />
        <FilterListbox
          id="inspirations-collection"
          label={t("inspirations.filters.collection", {}, locale)}
          value={collectionFilter}
          options={collectionOptions}
          onChange={onCollectionChange}
          icon="fa-layer-group"
        />
      </div>
    </section>
  );
}
