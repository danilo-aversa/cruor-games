import { useEffect, useRef, useState } from "react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationMapToolbarButton({
  active = false,
  children,
  disabled = false,
  icon = "",
  onClick,
  title = "",
  toggle = false,
  variant = "secondary",
  testId = "",
}) {
  const label = title || (typeof children === "string" ? children : "Map action");

  return (
    <button
      className={cx(
        "location-map-toolbar__button",
        "location-icon-toggle-button",
        "cruor-frame-icon-toggle",
        `location-map-toolbar__button--${variant}`,
        active && "is-active",
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={toggle ? active : undefined}
      aria-label={label}
      title={undefined}
      data-key="tooltip-generic"
      data-tooltip={label}
      data-tooltip-description={label}
      data-testid={testId || undefined}
    >
      {icon ? <i className={`fa-solid ${icon}`} aria-hidden="true" /> : null}
    </button>
  );
}

function LocationMapInlineEditorToolsHost() {
  return (
    <span
      className="location-map-toolbar__inline-editor-tools"
      data-location-map-tools-host="true"
      aria-label="Map editing tools"
    />
  );
}

function getRoomStatusLabel(status = "empty") {
  if (status === "ready") return "Ready";
  if (status === "partial") return "Used";
  return "Empty";
}

function getRoomNumberLabel(room, index) {
  return room?.numberLabel || String((room?.index ?? index) + 1).padStart(2, "0");
}

function LocationRoomTargetDropdown({
  activeRegionId = "",
  onSelectRoom,
  roomEntries = [],
  roomName = "Selected Room",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const hasRooms = roomEntries.length > 0;

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current?.contains(event.target)) return;
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

  return (
    <span className="location-map-toolbar__target-menu" ref={rootRef}>
      <button
        className="location-map-toolbar__target location-map-toolbar__target-button"
        type="button"
        title={roomName}
        aria-label="Choose room"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={!hasRooms}
        onClick={() => setOpen((current) => !current)}
        data-key="tooltip-generic"
        data-tooltip="Room Work"
        data-tooltip-description="Choose a room to edit."
      >
        <small>Room Work</small>
        <strong>{roomName}</strong>
      </button>
      {open && hasRooms ? (
        <div
          className="location-map-toolbar__room-menu-panel cruor-ui-panel-surface"
          role="menu"
          aria-label="Room work queue"
          onMouseDown={(event) => event.preventDefault()}
        >
          {roomEntries.map((room, index) => {
            const active = activeRegionId === room.id;
            const numberLabel = getRoomNumberLabel(room, index);
            const status = room.status || "empty";
            return (
              <button
                className={cx(
                  "location-map-toolbar__room-menu-item",
                  `is-${status}`,
                  active && "is-active",
                )}
                key={room.id || `${numberLabel}-${room.name}`}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onSelectRoom?.(room.id);
                  setOpen(false);
                }}
                data-room-id={room.id || undefined}
                data-room-status={status}
              >
                <span className="location-map-toolbar__room-menu-number">{numberLabel}</span>
                <span className="location-map-toolbar__room-menu-copy">
                  <strong>{room.name || `Room ${numberLabel}`}</strong>
                  <small>{room.roleLabel || room.mapLabel || "Room"}</small>
                </span>
                <span className="location-map-toolbar__room-menu-status">{getRoomStatusLabel(status)}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </span>
  );
}

export function LocationMapToolbar({
  activeRegion = null,
  builderMode = "theme",
  canGoNextRoom = false,
  canGoPreviousRoom = false,
  generatedMapPreview = null,
  onGenerateThemeRooms,
  onNewMapSeed,
  onSelectNextRoom,
  onSelectPreviousRoom,
  onSelectRoom,
  onToggleImmersiveMode,
  roomEntries = [],
  immersiveMode = false,
}) {
  const mode = builderMode === "map" ? "theme" : builderMode;
  const hasMap = Boolean(generatedMapPreview);
  const roomName = activeRegion?.name || "Selected Room";
  const immersiveControl = (
    <div className="location-map-toolbar__group location-map-toolbar__group--view">
      <LocationMapToolbarButton
        active={immersiveMode}
        icon={immersiveMode ? "fa-compress" : "fa-expand"}
        onClick={onToggleImmersiveMode}
        title={immersiveMode ? "Exit immersive mode" : "Enter immersive mode"}
        testId="dark-places-immersive-mode"
        toggle
      >
        Immersive Mode
      </LocationMapToolbarButton>
    </div>
  );

  if (mode === "export") {
    return (
      <nav className="location-map-toolbar location-map-toolbar--export" aria-label="Location export toolbar" data-testid="dark-places-toolbar-export">
        <div className="location-map-toolbar__group location-map-toolbar__group--actions">
          <LocationMapInlineEditorToolsHost />
        </div>
        {immersiveControl}
      </nav>
    );
  }

  if (mode === "scratch") {
    return (
      <nav className="location-map-toolbar location-map-toolbar--rooms" aria-label="Selected room toolbar" data-testid="dark-places-toolbar-rooms">
        <div className="location-map-toolbar__group location-map-toolbar__group--room-nav">
          <LocationMapToolbarButton
            disabled={!canGoPreviousRoom}
            icon="fa-chevron-left"
            onClick={onSelectPreviousRoom}
            title="Select previous room"
            testId="dark-places-previous-room"
          >
            Previous
          </LocationMapToolbarButton>
          <LocationRoomTargetDropdown
            activeRegionId={activeRegion?.id || ""}
            onSelectRoom={onSelectRoom}
            roomEntries={roomEntries}
            roomName={roomName}
          />
          <LocationMapToolbarButton
            disabled={!canGoNextRoom}
            icon="fa-chevron-right"
            onClick={onSelectNextRoom}
            title="Select next room"
            testId="dark-places-next-room"
          >
            Next
          </LocationMapToolbarButton>
        </div>
        <div className="location-map-toolbar__group location-map-toolbar__group--actions">
          <LocationMapInlineEditorToolsHost />
        </div>
        {immersiveControl}
      </nav>
    );
  }

  return (
    <nav className="location-map-toolbar location-map-toolbar--frame" aria-label="Map workbench toolbar" data-testid="dark-places-toolbar-frame">
      <div className="location-map-toolbar__group location-map-toolbar__group--actions">
        <LocationMapToolbarButton
          icon="fa-wand-magic-sparkles"
          onClick={onGenerateThemeRooms}
          title={hasMap ? "Regenerate the place map" : "Generate the place map"}
          variant="primary"
          testId="dark-places-generate"
        >
          {hasMap ? "Regenerate Place" : "Generate Place"}
        </LocationMapToolbarButton>
        <LocationMapToolbarButton icon="fa-dice" onClick={onNewMapSeed} title="Refresh the map seed" testId="dark-places-new-seed">
          New Seed
        </LocationMapToolbarButton>
        <LocationMapInlineEditorToolsHost />
      </div>
      {immersiveControl}
    </nav>
  );
}
