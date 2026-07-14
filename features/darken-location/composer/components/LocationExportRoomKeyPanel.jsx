import { useMemo, useState } from "react";

const EXPORT_VIEWS = Object.freeze([
  Object.freeze({ id: "roomKey", label: "Room Key", icon: "fa-list", formatId: "roomKey" }),
  Object.freeze({ id: "sessionInsert", label: "Session Insert", icon: "fa-scroll", formatId: "sessionInsert" }),
  Object.freeze({ id: "tableText", label: "Table Text", icon: "fa-table-list", formatId: "tableText" }),
  Object.freeze({ id: "markdown", label: "Markdown", icon: "fa-file-lines", formatId: "markdown" }),
  Object.freeze({ id: "json", label: "JSON", icon: "fa-code", formatId: "json" }),
  Object.freeze({ id: "svg", label: "SVG", icon: "fa-map", formatId: "svg" }),
]);

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ExportRoomKeyMetric({ label, value }) {
  return (
    <span className="location-export-room-key-metric">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function ExportRoomKeySlot({ slotRow }) {
  const filled = Boolean(slotRow?.filled);
  const components = Array.isArray(slotRow?.components) ? slotRow.components : [];

  return (
    <div className={cx("location-export-room-key-slot", filled ? "is-filled" : "is-missing")}>
      <span>{slotRow?.heading || slotRow?.label || "Room Detail"}</span>
      {filled ? (
        <div className="location-export-room-key-slot__components">
          {components.map((component) => (
            <p key={component.id || component.title}>
              <b>{component.title}</b>
              <span>{component.text || component.summary || "No table text yet."}</span>
            </p>
          ))}
        </div>
      ) : (
        <em>Missing</em>
      )}
    </div>
  );
}

function ExportRoomKeyCard({ section, onSelectRoom }) {
  const missing = Array.isArray(section?.missingSlotLabels) ? section.missingSlotLabels : [];
  const slotRows = Array.isArray(section?.roomKeySlotRows) ? section.roomKeySlotRows : [];

  return (
    <article
      className={cx(
        "location-export-room-key-card",
        `is-${section?.readinessStatus || "empty"}`,
        missing.length && "has-missing-content",
      )}
      data-testid="dark-places-room-key-card"
    >
      <header className="location-export-room-key-card__head">
        <span>Room {String(section?.roomNumber || "—").padStart(2, "0")}</span>
        <strong>{section?.region?.name || "Unnamed Room"}</strong>
        <button
          className="location-export-room-key-card__jump"
          type="button"
          onClick={() => onSelectRoom?.(section?.region?.id)}
          data-key="tooltip-generic"
          data-tooltip="Review room"
          data-tooltip-description="Return to Rooms and select this room."
        >
          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </button>
      </header>

      <div className="location-export-room-key-card__meta">
        <span>{section?.role || "Room"}</span>
        <span>{section?.readinessLabel || "Empty"} · {section?.readySlotCount || 0}/{section?.readySlotTotal || 0}</span>
      </div>

      {missing.length ? (
        <div className="location-export-room-key-card__missing">
          <small>Missing</small>
          <span>{missing.join(", ")}</span>
        </div>
      ) : null}

      {section?.readAloud ? (
        <div className="location-export-room-key-readaloud">
          <span>Read-Aloud</span>
          <p>{section.readAloud}</p>
        </div>
      ) : null}

      <div className="location-export-room-key-slot-grid">
        {slotRows.map((slotRow) => (
          <ExportRoomKeySlot key={slotRow.slotId} slotRow={slotRow} />
        ))}
      </div>
    </article>
  );
}

function ExportTextPreview({ format }) {
  return (
    <div className="location-export-format-preview" data-testid={`dark-places-export-preview-${format?.id || "text"}`}>
      <header>
        <span>{format?.label || "Export"}</span>
        <small>{format?.filename || ""}</small>
      </header>
      <pre>{format?.text || "Nothing to export yet."}</pre>
    </div>
  );
}

function ExportSvgPreview({ generatedMapPreview }) {
  const regionCount = generatedMapPreview?.regions?.length || 0;
  const corridorCount = generatedMapPreview?.corridors?.length || 0;
  const seed = generatedMapPreview?.seed || "—";

  return (
    <div className="location-export-svg-preview" data-testid="dark-places-export-preview-svg">
      <i className="fa-solid fa-map" aria-hidden="true" />
      <strong>{generatedMapPreview ? "Current map SVG ready" : "Generate a map before exporting SVG"}</strong>
      <p>
        The SVG is serialized directly from the current Composer map, including its visible room layout,
        corridors, doors, props, labels, and manual edits.
      </p>
      <div>
        <span><small>Seed</small><b>{seed}</b></span>
        <span><small>Rooms</small><b>{regionCount}</b></span>
        <span><small>Corridors</small><b>{corridorCount}</b></span>
      </div>
    </div>
  );
}

export function LocationExportRoomKeyPanel({
  compilePreview,
  copyStatus = "",
  exportBundle,
  generatedMapPreview,
  onCopyFormat,
  onDownloadFormat,
  onReviewMissing,
  onSelectRoom,
}) {
  const [activeViewId, setActiveViewId] = useState("roomKey");
  const roomSections = Array.isArray(compilePreview?.roomSections) ? compilePreview.roomSections : [];
  const readyRoomCount = Number(compilePreview?.readyRoomCount || 0);
  const incompleteRoomCount = Number(compilePreview?.incompleteRoomCount || 0);
  const statusLabel = incompleteRoomCount > 0
    ? `${incompleteRoomCount} incomplete`
    : roomSections.length
      ? "Ready to Export"
      : "No rooms";
  const activeView = useMemo(
    () => EXPORT_VIEWS.find((view) => view.id === activeViewId) || EXPORT_VIEWS[0],
    [activeViewId],
  );
  const activeFormat = exportBundle?.formats?.[activeView.formatId] || null;
  const activeAvailable = activeView.id === "svg" ? Boolean(generatedMapPreview) : Boolean(activeFormat?.text?.trim());
  const activeActionLabel = activeView.id === "roomKey" ? "Room Key" : activeView.label;

  return (
    <section className="location-export-room-key-panel" aria-label="Unified location export" data-testid="dark-places-room-key">
      <header className="location-export-room-key-panel__head">
        <div className="location-export-room-key-panel__title">
          <p className="location-kicker">Export Room Key</p>
          <h2>{compilePreview?.title || "Cursed Location Build"}</h2>
          <small>{compilePreview?.contextLine || "Location export"}</small>
        </div>

        <div className="location-export-room-key-actions" aria-label="Active export actions">
          <button
            className="location-export-room-key-action"
            type="button"
            disabled={!activeAvailable}
            onClick={() => onCopyFormat?.(activeView.formatId)}
            data-testid="dark-places-export-copy-active"
          >
            <i className="fa-solid fa-copy" aria-hidden="true" />
            <span>Copy {activeActionLabel}</span>
          </button>
          <button
            className="location-export-room-key-action"
            type="button"
            disabled={!activeAvailable}
            onClick={() => onDownloadFormat?.(activeView.formatId)}
            data-testid="dark-places-export-download-active"
          >
            <i className="fa-solid fa-download" aria-hidden="true" />
            <span>Download</span>
          </button>
          <button
            className="location-export-room-key-action"
            type="button"
            disabled={!incompleteRoomCount}
            onClick={onReviewMissing}
            data-testid="dark-places-review-missing-panel"
          >
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            <span>Review Missing</span>
          </button>
        </div>
      </header>

      <nav className="location-export-format-tabs" aria-label="Export format" role="tablist">
        {EXPORT_VIEWS.map((view) => (
          <button
            className={cx("location-export-format-tab", activeView.id === view.id && "is-active")}
            type="button"
            role="tab"
            aria-selected={activeView.id === view.id}
            key={view.id}
            onClick={() => setActiveViewId(view.id)}
            data-testid={`dark-places-export-tab-${view.id}`}
          >
            <i className={`fa-solid ${view.icon}`} aria-hidden="true" />
            <span>{view.label}</span>
          </button>
        ))}
      </nav>

      <div className="location-export-room-key-summary" aria-label="Export readiness summary">
        <ExportRoomKeyMetric label="Status" value={statusLabel} />
        <ExportRoomKeyMetric label="Ready Rooms" value={`${readyRoomCount}/${roomSections.length || 0}`} />
        <ExportRoomKeyMetric label="Format" value={activeView.label} />
      </div>

      <span className={cx("location-export-room-key-copy-status", copyStatus && "is-visible")} aria-live="polite" data-testid="dark-places-copy-status">
        {copyStatus || `${activeActionLabel} export ready`}
      </span>

      <div className="location-export-room-key-content" role="tabpanel" aria-label={`${activeView.label} preview`}>
        {activeView.id === "roomKey" ? (
          <div className="location-export-room-key-list" data-testid="dark-places-room-key-list">
            {roomSections.map((section) => (
              <ExportRoomKeyCard key={section.region.id} section={section} onSelectRoom={onSelectRoom} />
            ))}
            {!roomSections.length ? (
              <div className="location-export-room-key-empty">Generate a place map before exporting a room key.</div>
            ) : null}
          </div>
        ) : activeView.id === "svg" ? (
          <ExportSvgPreview generatedMapPreview={generatedMapPreview} />
        ) : (
          <ExportTextPreview format={activeFormat} />
        )}
      </div>
    </section>
  );
}
