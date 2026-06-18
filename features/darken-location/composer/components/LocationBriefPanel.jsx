import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getDungeonThemes } from "../../dungeon/dungeon.index.js";
import {
  SCRATCH_ROOM_ROLE_OPTIONS,
  SCRATCH_ROOM_SIZE_OPTIONS,
  SCRATCH_ROOM_TYPE_OPTIONS,
  normalizeScratchRoomCount,
} from "../model/location-composer-state.js";

const CONTEXT_OPTIONS = ["Crypt", "Chapel", "Cave", "Mine", "Ruins", "Noble House", "Village", "Forest"];
const HORROR_OPTIONS = ["Religious Horror", "Body Horror", "Gothic", "Folk Horror", "Psychological Horror", "Cosmic Horror", "Disease Horror"];
const DUNGEON_THEME_OPTIONS = getDungeonThemes()
  .map((theme) => ({
    value: theme.id,
    label: theme.name,
    description: theme.defaultArchetype?.replace(/_/g, " ") || "Theme profile",
    theme,
  }));
const DUNGEON_SCALE_OPTIONS = [
  { value: "small", label: "Small", description: "4–6 rooms" },
  { value: "medium", label: "Medium", description: "7–10 rooms" },
  { value: "large", label: "Large", description: "11–16 rooms" },
];
const DUNGEON_COMPLEXITY_OPTIONS = [
  { value: "simple", label: "Simple", description: "Fewer branches" },
  { value: "standard", label: "Standard", description: "Balanced structure" },
  { value: "complex", label: "Complex", description: "More rooms and branches" },
];
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

function LocationBuildModeField({ mode, onChange }) {
  return (
    <div className="location-field location-theme-mode-field">
      <span>Build Mode</span>
      <div className="location-map-mode-switch location-theme-mode-switch" role="group" aria-label="Dungeon build mode">
        {[
          { value: "theme", label: "Theme" },
          { value: "scratch", label: "Scratch" },
        ].map((option) => {
          const active = mode === option.value;
          return (
            <button
              className={cx("location-map-mode-button", active && "is-active")}
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocationThemeRoomProgram({ regions = [] }) {
  const visibleRegions = Array.isArray(regions) ? regions.slice(0, 8) : [];
  if (!visibleRegions.length) return null;

  return (
    <section className="location-theme-room-program" aria-label="Generated room program">
      <div className="location-theme-room-program__head">
        <span>Room Program</span>
        <strong>{regions.length}</strong>
      </div>
      <div className="location-theme-room-program__list">
        {visibleRegions.map((region, index) => (
          <article className="location-theme-room-row" key={region.id || index}>
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span>
              <em>{region.name || `Room ${index + 1}`}</em>
              <small>{region.role || region.roomType || region.shape || "Location Region"}</small>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function normalizeRoomFieldValue(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createChoiceOptions(values = []) {
  return values.map((value) => ({
    value,
    label: String(value)
      .replace(/[-_]+/g, " ")
      .replace(/(^|\s)(\S)/g, (_, spacer, letter) => `${spacer}${letter.toUpperCase()}`),
  }));
}

function LocationScratchRoomCountField({ count, onChange }) {
  return (
    <label className="location-field location-scratch-room-count-field">
      <span>Room Count</span>
      <input
        className="location-scratch-input"
        type="number"
        min="1"
        max="16"
        value={count || 1}
        onChange={(event) => onChange(normalizeScratchRoomCount(event.target.value, count || 1))}
      />
    </label>
  );
}

function LocationScratchRoomList({ activeRegionId, onAddRoom, onRegenerateRoom, onRemoveRoom, onSelectRoom, regions = [] }) {
  const visibleRegions = Array.isArray(regions) ? regions : [];

  return (
    <section className="location-scratch-room-list" aria-label="Scratch room list">
      <div className="location-scratch-room-list__head">
        <span>Room List</span>
        <button
          className="cruor-composer-control location-scratch-icon-button"
          type="button"
          onClick={onAddRoom}
          disabled={visibleRegions.length >= 16}
          aria-label="Add room"
        >
          <i className="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>
      <div className="location-scratch-room-list__items">
        {visibleRegions.map((region, index) => {
          const active = region.id === activeRegionId;
          return (
            <article className={cx("location-scratch-room-row", active && "is-active")} key={region.id || index}>
              <button
                className="location-scratch-room-row__main"
                type="button"
                aria-pressed={active}
                onClick={() => onSelectRoom(region.id)}
              >
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span>
                  <em>{region.name || `Room ${index + 1}`}</em>
                  <small>{region.role || region.roomType || region.shape || "Room"}</small>
                </span>
              </button>
              <div className="location-scratch-room-row__actions" aria-label={`Room ${index + 1} actions`}>
                <button
                  className="cruor-composer-control location-scratch-icon-button"
                  type="button"
                  onClick={() => onRegenerateRoom(region.id)}
                  aria-label={`Regenerate ${region.name || `room ${index + 1}`}`}
                >
                  <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
                </button>
                <button
                  className="cruor-composer-control location-scratch-icon-button"
                  type="button"
                  onClick={() => onRemoveRoom(region.id)}
                  disabled={visibleRegions.length <= 1}
                  aria-label={`Remove ${region.name || `room ${index + 1}`}`}
                >
                  <i className="fa-solid fa-trash-can" aria-hidden="true"></i>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LocationScratchRoomEditor({ onUpdateRoom, region }) {
  if (!region) {
    return (
      <section className="location-scratch-room-editor" aria-label="Selected room">
        <div className="location-scratch-room-editor__empty">Select a room.</div>
      </section>
    );
  }

  const roleOptions = createChoiceOptions(SCRATCH_ROOM_ROLE_OPTIONS);
  const sizeOptions = createChoiceOptions(SCRATCH_ROOM_SIZE_OPTIONS);
  const typeOptions = createChoiceOptions(SCRATCH_ROOM_TYPE_OPTIONS);
  const levelOptions = createChoiceOptions(["-1", "0", "1"]);

  return (
    <section className="location-scratch-room-editor" aria-label="Selected room editor">
      <div className="location-scratch-room-editor__head">
        <span>Selected Room</span>
        <strong>{region.name || "Room"}</strong>
      </div>
      <label className="location-field location-scratch-text-field">
        <span>Name</span>
        <input
          className="location-scratch-input"
          type="text"
          value={region.name || ""}
          onChange={(event) => onUpdateRoom(region.id, { name: event.target.value })}
        />
      </label>
      <LocationChoiceField
        icon="fa-signs-post"
        label="Role"
        value={normalizeRoomFieldValue(region.role, "transition")}
        options={roleOptions}
        onChange={(role) => onUpdateRoom(region.id, { role, tags: [role, region.roomType || region.shape].filter(Boolean) })}
      />
      <LocationChoiceField
        icon="fa-vector-square"
        label="Room Type"
        value={normalizeRoomFieldValue(region.roomType || region.shape, "corridor")}
        options={typeOptions}
        onChange={(roomType) => onUpdateRoom(region.id, { roomType, shape: roomType, preferredShape: roomType, tags: [region.role, roomType].filter(Boolean) })}
      />
      <div className="location-scratch-room-editor__grid">
        <LocationChoiceField
          icon="fa-expand"
          label="Size"
          value={normalizeRoomFieldValue(region.size, "Medium")}
          options={sizeOptions}
          onChange={(size) => onUpdateRoom(region.id, { size })}
        />
        <LocationChoiceField
          icon="fa-layer-group"
          label="Level"
          value={String(region.level ?? 0)}
          options={levelOptions}
          onChange={(level) => onUpdateRoom(region.id, { level: Number(level) })}
        />
      </div>
      <label className="location-field location-scratch-text-field">
        <span>Sensory Detail</span>
        <input
          className="location-scratch-input"
          type="text"
          value={region.sensoryLayer || ""}
          onChange={(event) => onUpdateRoom(region.id, { sensoryLayer: event.target.value })}
        />
      </label>
      <label className="location-field location-scratch-text-field">
        <span>Hazard / Danger</span>
        <input
          className="location-scratch-input"
          type="text"
          value={region.danger || ""}
          onChange={(event) => onUpdateRoom(region.id, { danger: event.target.value })}
        />
      </label>
      <label className="location-field location-scratch-text-field">
        <span>Reward / Clue</span>
        <input
          className="location-scratch-input"
          type="text"
          value={region.reward || region.secret || ""}
          onChange={(event) => onUpdateRoom(region.id, { reward: event.target.value })}
        />
      </label>
    </section>
  );
}

export function LocationBriefPanel({
  state,
  setState,
  mapRequest,
  draftControls,
  modeControls,
  onAddScratchRoom,
  onGenerateThemeRooms,
  onRegenerateScratchRoom,
  onRemoveScratchRoom,
  onSelectScratchRoom,
  onSetScratchRoomCount,
  onUpdateScratchRoom,
}) {
  const selectedHorror = toChoiceArray(state.horrors)[0] || state.horror || "";
  const dungeonMode = state.dungeonMode === "scratch" ? "scratch" : "theme";
  const selectedThemeId = state.dungeonThemeId || "generic-dark-location";
  const regions = Array.isArray(state.locationRegions) ? state.locationRegions : [];
  const activeScratchRegion = regions.find((region) => region.id === state.activeRegionId) || regions[0] || null;

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
          <LocationBuildModeField
            mode={dungeonMode}
            onChange={(dungeonMode) =>
              setState((current) => ({
                ...current,
                dungeonMode,
              }))
            }
          />

          {dungeonMode === "theme" ? (
            <LocationChoiceField
              icon="fa-book-dead"
              label="Theme"
              value={selectedThemeId}
              placeholder="Choose dungeon theme"
              options={DUNGEON_THEME_OPTIONS}
              onChange={(themeId) => {
                const selectedTheme = DUNGEON_THEME_OPTIONS.find((option) => option.value === themeId)?.theme;
                setState((current) => ({
                  ...current,
                  dungeonThemeId: themeId,
                  sourceAnchors: selectedTheme?.sourceAnchorIds?.length && selectedTheme?.name ? [selectedTheme.name] : current.sourceAnchors,
                  context: selectedTheme?.mapTypeBias?.[0] || current.context,
                }));
              }}
            />
          ) : (
            <LocationChoiceField
              icon="fa-book-dead"
              label="Theme Assist"
              value={selectedThemeId}
              placeholder="Choose optional theme"
              options={DUNGEON_THEME_OPTIONS}
              onChange={(themeId) => {
                const selectedTheme = DUNGEON_THEME_OPTIONS.find((option) => option.value === themeId)?.theme;
                setState((current) => ({
                  ...current,
                  dungeonThemeId: themeId,
                  sourceAnchors: selectedTheme?.sourceAnchorIds?.length && selectedTheme?.name ? [selectedTheme.name] : current.sourceAnchors,
                  context: selectedTheme?.mapTypeBias?.[0] || current.context,
                }));
              }}
            />
          )}

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

          {dungeonMode === "theme" ? (
            <>
              <LocationChoiceField
                icon="fa-ruler-combined"
                label="Scale"
                value={state.dungeonScale || "medium"}
                options={DUNGEON_SCALE_OPTIONS}
                onChange={(dungeonScale) => setState((current) => ({ ...current, dungeonScale }))}
              />

              <LocationChoiceField
                icon="fa-code-branch"
                label="Complexity"
                value={state.dungeonComplexity || "standard"}
                options={DUNGEON_COMPLEXITY_OPTIONS}
                onChange={(dungeonComplexity) => setState((current) => ({ ...current, dungeonComplexity }))}
              />

              <button
                className="cruor-composer-control location-primary-action location-theme-generate-button"
                type="button"
                onClick={onGenerateThemeRooms}
              >
                Generate Theme Rooms
              </button>

              <LocationThemeRoomProgram regions={state.locationRegions || []} />
            </>
          ) : (
            <>
              <LocationScratchRoomCountField
                count={regions.length || 1}
                onChange={onSetScratchRoomCount}
              />
              <LocationScratchRoomList
                activeRegionId={state.activeRegionId}
                regions={regions}
                onAddRoom={onAddScratchRoom}
                onRegenerateRoom={onRegenerateScratchRoom}
                onRemoveRoom={onRemoveScratchRoom}
                onSelectRoom={onSelectScratchRoom}
              />
              <LocationScratchRoomEditor
                region={activeScratchRegion}
                onUpdateRoom={onUpdateScratchRoom}
              />
            </>
          )}
        </div>
      </section>
    </aside>
  );
}
