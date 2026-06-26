function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LocationMapToolbarButton({
  children,
  disabled = false,
  icon = "",
  onClick,
  title = "",
  variant = "secondary",
}) {
  const label = title || (typeof children === "string" ? children : "Map action");

  return (
    <button
      className={cx(
        "location-map-toolbar__button",
        "location-icon-toggle-button",
        "cruor-frame-icon-toggle",
        `location-map-toolbar__button--${variant}`,
      )}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={undefined}
      data-key="tooltip-generic"
      data-tooltip={label}
      data-tooltip-description={label}
    >
      {icon ? <i className={`fa-solid ${icon}`} aria-hidden="true" /> : null}
    </button>
  );
}

function LocationMapToolbarDivider() {
  return <span className="location-map-toolbar__divider" aria-hidden="true" />;
}

export function LocationMapToolbar({
  activeRegion = null,
  builderMode = "theme",
  canGoNextRoom = false,
  canGoPreviousRoom = false,
  generatedMapPreview = null,
  hasRooms = false,
  nextRoomSlot = null,
  onAddMissingRoomSlot,
  onGenerateThemeRooms,
  onNewMapSeed,
  onOpenComponents,
  onSelectExport,
  onSelectFrame,
  onSelectNextRoom,
  onSelectPreviousRoom,
  onSelectRooms,
  onStartMapEditing,
}) {
  const mode = builderMode === "map" ? "theme" : builderMode;
  const hasMap = Boolean(generatedMapPreview);
  const roomName = activeRegion?.name || "Selected Room";
  const nextRoomSlotLabel = nextRoomSlot?.slot?.label || nextRoomSlot?.label || "Missing Detail";

  if (mode === "export") {
    return (
      <nav className="location-map-toolbar location-map-toolbar--export" aria-label="Location export toolbar">
        <div className="location-map-toolbar__group">
          <LocationMapToolbarButton icon="fa-arrow-left" onClick={onSelectRooms} title="Return to room work">
            Rooms
          </LocationMapToolbarButton>
          <LocationMapToolbarButton icon="fa-map" onClick={onSelectFrame} title="Return to the place frame">
            Frame
          </LocationMapToolbarButton>
        </div>
      </nav>
    );
  }

  if (mode === "scratch") {
    return (
      <nav className="location-map-toolbar location-map-toolbar--rooms" aria-label="Selected room toolbar">
        <div className="location-map-toolbar__group location-map-toolbar__group--room-nav">
          <LocationMapToolbarButton
            disabled={!canGoPreviousRoom}
            icon="fa-chevron-left"
            onClick={onSelectPreviousRoom}
            title="Select previous room"
          >
            Previous
          </LocationMapToolbarButton>
          <span className="location-map-toolbar__target" title={roomName}>
            <small>Room Work</small>
            <strong>{roomName}</strong>
          </span>
          <LocationMapToolbarButton
            disabled={!canGoNextRoom}
            icon="fa-chevron-right"
            onClick={onSelectNextRoom}
            title="Select next room"
          >
            Next
          </LocationMapToolbarButton>
        </div>
        <LocationMapToolbarDivider />
        <div className="location-map-toolbar__group location-map-toolbar__group--actions">
          <LocationMapToolbarButton
            disabled={!activeRegion || !nextRoomSlot}
            icon="fa-plus"
            onClick={onAddMissingRoomSlot}
            title={nextRoomSlot ? `Add ${nextRoomSlotLabel}` : "Room required slots are filled"}
            variant="primary"
          >
            Add Missing Slot
          </LocationMapToolbarButton>
          <LocationMapToolbarButton
            disabled={!activeRegion}
            icon="fa-puzzle-piece"
            onClick={onOpenComponents}
            title="Open components for the active room slot"
          >
            Components
          </LocationMapToolbarButton>
          <LocationMapToolbarButton icon="fa-map" onClick={onSelectFrame} title="Edit the place frame">
            Frame
          </LocationMapToolbarButton>
          <LocationMapToolbarButton icon="fa-file-lines" onClick={onSelectExport} title="Review the location insert">
            Export
          </LocationMapToolbarButton>
        </div>
      </nav>
    );
  }

  return (
    <nav className="location-map-toolbar location-map-toolbar--frame" aria-label="Map workbench toolbar">
      <div className="location-map-toolbar__group location-map-toolbar__group--actions">
        <LocationMapToolbarButton
          icon="fa-wand-magic-sparkles"
          onClick={onGenerateThemeRooms}
          title={hasMap ? "Regenerate the place map" : "Generate the place map"}
          variant="primary"
        >
          {hasMap ? "Regenerate Place" : "Generate Place"}
        </LocationMapToolbarButton>
        <LocationMapToolbarButton icon="fa-dice" onClick={onNewMapSeed} title="Refresh the map seed">
          New Seed
        </LocationMapToolbarButton>
        <LocationMapToolbarButton disabled={!hasMap} icon="fa-pen-ruler" onClick={onStartMapEditing} title="Open the map editor">
          Edit Map
        </LocationMapToolbarButton>
        <LocationMapToolbarButton disabled={!hasRooms} icon="fa-list-check" onClick={onSelectRooms} title="Move to room-by-room work">
          Rooms
        </LocationMapToolbarButton>
      </div>
    </nav>
  );
}
