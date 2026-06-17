import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getStaticContentRegistry } from "../../../../shared/content/content.index.js";

const CONTEXT_OPTIONS = ["Crypt", "Chapel", "Cave", "Mine", "Ruins", "Noble House", "Village", "Forest"];
const HORROR_OPTIONS = ["Religious Horror", "Body Horror", "Gothic", "Folk Horror", "Psychological Horror", "Cosmic Horror", "Disease Horror"];
const CONTENT_REGISTRY = getStaticContentRegistry();
const SOURCE_OPTIONS = CONTENT_REGISTRY.getSourceAnchors({ workflow: "darken-location" })
  .map((sourceAnchor) => sourceAnchor.label || sourceAnchor.id)
  .sort((a, b) => a.localeCompare(b));

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function toChoiceArray(value) {
  if (value instanceof Set) return Array.from(value);
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
}

function getOptionValue(option) {
  return typeof option === "string" ? option : option.value;
}

function getOptionLabel(option) {
  return typeof option === "string" ? option : option.label || option.value;
}

function LocationChoiceField({ icon = "fa-circle-dot", label, meta, onChange, options, placeholder = "Choose option", value }) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const fieldRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selectedOption = useMemo(
    () => options.find((option) => String(getOptionValue(option)) === String(value)),
    [options, value],
  );
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  function updateMenuPosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuPosition({
      left: rect.left,
      top: rect.bottom + 6,
      width: rect.width,
    });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (fieldRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const menu = open && menuPosition
    ? createPortal(
        <div
          className="location-choice-menu location-choice-menu--portal"
          ref={menuRef}
          role="listbox"
          aria-label={label}
          style={{
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
            width: `${menuPosition.width}px`,
          }}
        >
          {options.map((option) => {
            const optionValue = getOptionValue(option);
            const optionLabel = getOptionLabel(option);
            const active = String(optionValue) === String(value);
            return (
              <button
                className={cx("location-choice-option", active && "is-active")}
                key={optionValue}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(optionValue);
                  setOpen(false);
                }}
              >
                <i className={`fa-solid ${icon}`} aria-hidden="true" />
                <span>
                  <strong>{optionLabel}</strong>
                  {typeof option !== "string" && option.description ? <small>{option.description}</small> : null}
                </span>
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="location-field location-choice-field" ref={fieldRef}>
      <span>{label}</span>
      <button
        className="cruor-composer-control location-choice-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        ref={triggerRef}
        onClick={() => setOpen((current) => !current)}
      >
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
        <strong>{selectedLabel}</strong>
        {meta ? <small>{meta}</small> : null}
      </button>
      {menu}
    </div>
  );
}

export function LocationBriefPanel({ state, setState, mapRequest, draftControls, modeControls }) {
  const sourceOptions = SOURCE_OPTIONS.slice(0, 16);
  const selectedSource = toChoiceArray(state.sourceAnchors)[0] || "";
  const selectedHorror = toChoiceArray(state.horrors)[0] || state.horror || "";

  return (
    <aside className="cruor-composer-rail location-composer__rail location-composer__rail--left location-map-frame-rail" aria-label="Location frame">
      {modeControls ? modeControls : null}
      <section className="cruor-composer-panel location-panel location-brief-panel">
        <div className="location-panel-head location-panel-head--compact location-brief-panel__head">
          <div>
            <p className="location-kicker">Frame</p>
            <h2>Location</h2>
          </div>
          <strong className="location-brief-panel__meta">{mapRequest.requiredRegions.length || 0} regions</strong>
        </div>

        {draftControls ? (
          <div className="location-brief-panel__draft">
            {draftControls}
          </div>
        ) : null}

        <div className="location-brief-panel__fields">
          <LocationChoiceField
            icon="fa-dungeon"
            label="Context"
            value={state.context || ""}
            options={CONTEXT_OPTIONS}
            onChange={(context) => setState((current) => ({ ...current, context }))}
          />

          <LocationChoiceField
            icon="fa-skull"
            label="Horror"
            value={selectedHorror}
            placeholder="Choose horror direction"
            options={HORROR_OPTIONS}
            onChange={(horror) =>
              setState((current) => ({
                ...current,
                horror,
                horrors: horror ? [horror] : [],
              }))
            }
          />

          <LocationChoiceField
            icon="fa-book-dead"
            label="Source"
            value={selectedSource}
            placeholder="Choose source anchor"
            options={sourceOptions}
            onChange={(source) =>
              setState((current) => ({
                ...current,
                sourceAnchors: source ? [source] : [],
              }))
            }
          />
        </div>
      </section>
    </aside>
  );
}
