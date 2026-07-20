import { useEffect, useMemo, useRef, useState } from "react";
import {
  ComposerCollapsibleSection,
  ComposerFactRow,
  ComposerRail,
} from "../../../components/ui/composer-rail.jsx";
import { ToolButton, ToolContentPanel, ToolFeatureBlock } from "../../../components/ui/tool-content-panel.jsx";
import { MapSvg } from "../map-generator/map-generator.render.jsx";
import { LocationAtTheTableDashboard } from "./components/LocationAtTheTableDashboard.jsx";
import { LocationRoomOutput } from "./components/LocationRoomOutput.jsx";
import { LocationMapExportStudio } from "./components/LocationMapExportStudio.jsx";
import {
  applyLocationMapExportPreset,
  createDefaultLocationMapExportSettings,
  createLocationMapExportFilename,
  getLocationMapExportRenderOptions,
  getLocationMapSerializationOptions,
  normalizeLocationMapExportSettings,
  updateLocationMapExportSettings,
} from "./model/location-map-export.js";
import {
  createSvgBlob,
  downloadBlobFile,
  rasterizeSvgToPngBlob,
  serializeSvg,
} from "../map-generator/map-generator.export.js";
import {
  clearLocationSessionDashboardState,
  createLocationSessionDashboardState,
  loadLocationSessionDashboardState,
  resetLocationSessionDashboardState,
  saveLocationSessionDashboardState,
  toggleLocationSessionClue,
  updateLocationSessionPressure,
} from "./model/location-session-dashboard-state.js";
import { createLocationOutputProjection } from "./model/location-document-output-v2.js";
import "./location-output.styles.css";

const EMPTY_SESSION_GUIDE = Object.freeze({});

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function cleanText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function resolveSessionStateStorage(explicitStorage) {
  if (explicitStorage) return explicitStorage;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function formatRoomNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? String(number).padStart(2, "0") : "—";
}

function formatMechanicsEntries(mechanics) {
  if (!mechanics) return [];
  if (typeof mechanics === "string") {
    return mechanics.trim() ? [{ label: "Mechanics", value: mechanics.trim() }] : [];
  }
  if (typeof mechanics !== "object" || Array.isArray(mechanics)) return [];

  return Object.entries(mechanics)
    .map(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/[-_]+/g, " ")
        .replace(/^./, (letter) => letter.toUpperCase());
      const normalizedValue = Array.isArray(value)
        ? value.join(", ")
        : typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : cleanText(value);
      return normalizedValue ? { label, value: normalizedValue } : null;
    })
    .filter(Boolean);
}

function getRoomMapTargetId(region = {}) {
  return cleanText(
    region.previewTargetId ||
      region.sourceRegionId ||
      region.requestMetadata?.sourceRegionId ||
      region.metadata?.sourceRegionId ||
      region.id,
  );
}

function formatInlineLabel(value = "") {
  const label = cleanText(value);
  if (!label) return "";
  return /[.!?:]$/.test(label) ? label : `${label}.`;
}

function OutputBlock({ block, className = "" }) {
  const mechanics = formatMechanicsEntries(block?.mechanics);
  if (!block?.text) return null;

  return (
    <div className={cx("location-output-entry", className)} data-output-kind={block.kind || "note"}>
      <p className="location-output-entry__line">
        {block.title ? <strong>{formatInlineLabel(block.title)}</strong> : null}
        <span>{block.text}</span>
      </p>
      {mechanics.map((entry) => (
        <p className="location-output-entry__line location-output-entry__line--secondary" key={`${block.id}-${entry.label}`}>
          <strong>{formatInlineLabel(entry.label)}</strong>
          <span>{entry.value}</span>
        </p>
      ))}
      {block.counterplay ? (
        <p className="location-output-entry__line location-output-entry__line--secondary">
          <strong>Counterplay.</strong>
          <span>{block.counterplay}</span>
        </p>
      ) : null}
    </div>
  );
}

function OutputBlockSection({ blocks, title, icon = "fa-diamond", className = "" }) {
  const entries = asArray(blocks);
  if (!entries.length) return null;

  return (
    <ToolFeatureBlock
      label={title}
      className={cx("location-output-section", className)}
      data-section-icon={icon}
    >
      <div className="location-output-prose-list">
        {entries.map((block) => (
          <OutputBlock block={block} key={block.id} />
        ))}
      </div>
    </ToolFeatureBlock>
  );
}

function LocationOutputMap({
  className = "",
  documentModel,
  exportSettings,
  generatedMapPreview,
  interactive = true,
  mapContainerRef,
  selectedRoomId,
  onSelectRoom,
}) {
  const [hoveredRoomId, setHoveredRoomId] = useState("");
  const mapOptions = useMemo(
    () => getLocationMapExportRenderOptions(generatedMapPreview, exportSettings),
    [exportSettings, generatedMapPreview],
  );
  const roomIdByMapId = useMemo(() => {
    const entries = new Map();
    asArray(documentModel?.rooms).forEach((room) => {
      [room.id, room.sourceRegionId, room.generatedRoomId]
        .map((value) => cleanText(value))
        .filter(Boolean)
        .forEach((value) => entries.set(value, room.id));
    });
    return entries;
  }, [documentModel?.rooms]);
  const regionStatuses = useMemo(
    () => Object.fromEntries(
      asArray(documentModel?.rooms).flatMap((room) =>
        [room.id, room.sourceRegionId, room.generatedRoomId]
          .map((value) => cleanText(value))
          .filter(Boolean)
          .map((value) => [value, room.readiness?.status || "empty"]),
      ),
    ),
    [documentModel?.rooms],
  );

  if (!generatedMapPreview) {
    return (
      <div className="location-output-map__empty">
        <i className="fa-solid fa-map" aria-hidden="true" />
        <span>Generate the map to include it in the final output.</span>
      </div>
    );
  }

  return (
    <div
      className={cx("location-output-map", "cruor-composer-panel", className)}
      data-testid="dark-places-output-map"
      data-export-hide-secrets={mapOptions.hideSecrets ? "true" : "false"}
      data-export-texture={mapOptions.showTexture ? "visible" : "hidden"}
      data-export-background={mapOptions.background}
      data-export-preset={mapOptions.preset}
      data-export-palette={mapOptions.palette}
      ref={mapContainerRef}
      style={{ aspectRatio: `${mapOptions.viewBoxBounds.width} / ${mapOptions.viewBoxBounds.height}` }}
    >
      <MapSvg
        generatedMap={generatedMapPreview}
        showGrid={mapOptions.showGrid}
        gridStyle={mapOptions.gridStyle}
        gridOpacity={mapOptions.gridOpacity}
        gridColor={mapOptions.gridColor}
        gridWeight={mapOptions.gridWeight}
        crosshatchStyle={mapOptions.crosshatchStyle}
        crosshatchOpacity={mapOptions.crosshatchOpacity}
        wallDrawingStyle={mapOptions.wallDrawingStyle}
        hatchShadowColor={mapOptions.hatchShadowColor}
        showEditor={false}
        showNames={mapOptions.showRoomNames}
        showRoomNumbers={mapOptions.showRoomNumbers}
        showRoomBadges={false}
        hideSecretRoutes={mapOptions.hideSecrets}
        showProps={mapOptions.showProps}
        showStairArrows={mapOptions.showStairArrows}
        levelView={mapOptions.levelView}
        fadeOtherLevels={false}
        viewportViewBox={mapOptions.viewBox}
        previewRoomHotspots={interactive ? {
          enabled: true,
          selectedRegionId: selectedRoomId,
          hoveredRegionId: hoveredRoomId,
          regionStatuses,
          onSelect: (region) => {
            const targetId = getRoomMapTargetId(region);
            onSelectRoom?.(roomIdByMapId.get(targetId) || targetId);
          },
          onHoverChange: (region) => setHoveredRoomId(getRoomMapTargetId(region)),
        } : null}
      />
    </div>
  );
}

function LocationOutputMapPreview({
  activeRoom,
  busy,
  documentModel,
  exportSettings,
  generatedMapPreview,
  mapContainerRef,
  onDownload,
  onOpen,
  status,
  triggerRef,
}) {
  const format = EXPORT_FORMAT_LABELS[exportSettings?.format] || "SVG";

  return (
    <ComposerCollapsibleSection
      title="Map Preview"
      defaultExpanded
      className="location-output-export-section location-output-map-preview"
      bodyClassName="location-output-export-section__body"
      aria-label="Location map preview"
    >
      <div className="location-output-map-preview__frame">
        <div className="location-output-map-preview__canvas" aria-hidden="true">
          <LocationOutputMap
            className="location-output-map--preview"
            documentModel={documentModel}
            exportSettings={exportSettings}
            generatedMapPreview={generatedMapPreview}
            interactive={false}
            mapContainerRef={mapContainerRef}
            selectedRoomId={activeRoom?.id || ""}
          />
        </div>
        <button
          ref={triggerRef}
          className="location-output-map-preview__open cruor-composer-control"
          type="button"
          onClick={onOpen}
          disabled={!generatedMapPreview}
          aria-label="Open enlarged location map"
          data-testid="dark-places-open-map-preview"
        >
          <i className="fa-solid fa-expand" aria-hidden="true" />
          <span>{generatedMapPreview ? "Open full map" : "Map unavailable"}</span>
        </button>
      </div>
      <ToolButton
        primary
        icon={busy ? "fa-spinner fa-spin" : "fa-download"}
        iconPosition="start"
        className="location-output-map-preview__download"
        disabled={busy || !generatedMapPreview}
        onClick={onDownload}
        data-testid="dark-places-map-export-download"
      >
        {busy ? "Preparing" : `Download ${format}`}
      </ToolButton>
      <p
        className={cx("location-map-export-status", status && "is-visible")}
        aria-live="polite"
      >
        {status}
      </p>
      {activeRoom ? (
        <p className="location-output-map-preview__selection">
          <strong>{formatRoomNumber(activeRoom.number)}.</strong>
          <span>{activeRoom.name}</span>
        </p>
      ) : (
        <p className="location-output-map-preview__hint">
          Select a room from the outline or open the enlarged map to inspect the site.
        </p>
      )}
    </ComposerCollapsibleSection>
  );
}

const EXPORT_PRESET_LABELS = Object.freeze({
  gm: "GM",
  player: "Player",
  print: "Print",
  custom: "Custom",
});

const EXPORT_FORMAT_LABELS = Object.freeze({
  svg: "SVG",
  png: "PNG",
});

const EXPORT_CROP_LABELS = Object.freeze({
  content: "Content Bounds",
  canvas: "Full Canvas",
});

const EXPORT_PADDING_LABELS = Object.freeze({
  0: "None",
  24: "Tight",
  48: "Standard",
  96: "Wide",
});

const EXPORT_BACKGROUND_LABELS = Object.freeze({
  style: "Map Style",
  white: "White",
  transparent: "Transparent",
});

const EXPORT_PALETTE_LABELS = Object.freeze({
  style: "Map Style",
  print: "Print",
});

function formatExportLevel(value) {
  if (value === null || value === undefined || value === "all") return "All Levels";
  const level = Number(value);
  if (!Number.isFinite(level)) return "All Levels";
  if (level === 0) return "Ground · 0";
  return level > 0 ? `Above · +${level}` : `Below · ${level}`;
}

function formatExportToken(value, fallback = "Default") {
  const text = cleanText(value, fallback);
  return text
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LocationOutputExportSummary({
  exportTitle,
  generatedMapPreview,
  settings,
}) {
  const normalizedSettings = useMemo(
    () => normalizeLocationMapExportSettings(settings, generatedMapPreview),
    [generatedMapPreview, settings],
  );
  const renderOptions = useMemo(
    () => getLocationMapExportRenderOptions(generatedMapPreview, normalizedSettings),
    [generatedMapPreview, normalizedSettings],
  );
  const format = EXPORT_FORMAT_LABELS[normalizedSettings.format] || "SVG";
  const profile = EXPORT_PRESET_LABELS[normalizedSettings.preset] || "Custom";
  const fileName = createLocationMapExportFilename(exportTitle, normalizedSettings);
  const roomLabels = normalizedSettings.showRoomNumbers && normalizedSettings.showRoomNames
    ? "Numbers + Names"
    : normalizedSettings.showRoomNumbers
      ? "Numbers"
      : normalizedSettings.showRoomNames
        ? "Names"
        : "Hidden";

  return (
    <>
      <ComposerCollapsibleSection
        title="File & Framing"
        defaultExpanded={false}
        className="location-output-export-section"
        bodyClassName="location-output-export-section__body"
        aria-label="Export file and framing summary"
      >
        <div className="cruor-composer-fact-grid location-frame-info-grid">
          <ComposerFactRow
            className="location-frame-info-row location-output-export-filename-row"
            label="File Name"
            value={fileName}
          />
          <ComposerFactRow className="location-frame-info-row" label="Profile" value={profile} />
          <ComposerFactRow className="location-frame-info-row" label="Format" value={format} />
          {normalizedSettings.format === "png" ? (
            <ComposerFactRow className="location-frame-info-row" label="Resolution" value={`${normalizedSettings.pngScale || 2}×`} />
          ) : null}
          <ComposerFactRow
            className="location-frame-info-row"
            label="Crop"
            value={EXPORT_CROP_LABELS[normalizedSettings.crop] || "Content Bounds"}
          />
          {normalizedSettings.crop !== "canvas" ? (
            <ComposerFactRow
              className="location-frame-info-row"
              label="Padding"
              value={EXPORT_PADDING_LABELS[normalizedSettings.padding] || "Standard"}
            />
          ) : null}
          <ComposerFactRow className="location-frame-info-row" label="Level" value={formatExportLevel(normalizedSettings.levelView)} />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Bounds"
            value={`${Math.round(renderOptions.viewBoxBounds.width)} × ${Math.round(renderOptions.viewBoxBounds.height)}`}
          />
        </div>
      </ComposerCollapsibleSection>

      <ComposerCollapsibleSection
        title="Map Style"
        defaultExpanded={false}
        className="location-output-export-section"
        bodyClassName="location-output-export-section__body"
        aria-label="Export map style summary"
      >
        <div className="cruor-composer-fact-grid location-frame-info-grid">
          <ComposerFactRow
            className="location-frame-info-row"
            label="Background"
            value={EXPORT_BACKGROUND_LABELS[normalizedSettings.background] || "Map Style"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Palette"
            value={EXPORT_PALETTE_LABELS[normalizedSettings.palette] || "Map Style"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Grid Style"
            value={normalizedSettings.showGrid ? formatExportToken(renderOptions.gridStyle) : "Hidden"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Grid Color"
            value={normalizedSettings.showGrid ? formatExportToken(renderOptions.gridColor) : "—"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Grid Weight"
            value={normalizedSettings.showGrid ? formatExportToken(renderOptions.gridWeight) : "—"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Grid Opacity"
            value={normalizedSettings.showGrid ? `${Math.round(renderOptions.gridOpacity * 100)}%` : "—"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Walls"
            value={formatExportToken(renderOptions.wallDrawingStyle)}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Hatching Style"
            value={normalizedSettings.showHatching ? formatExportToken(renderOptions.crosshatchStyle) : "Hidden"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Hatching Opacity"
            value={normalizedSettings.showHatching ? `${Math.round(renderOptions.crosshatchOpacity * 100)}%` : "—"}
          />
          <ComposerFactRow
            className="location-frame-info-row"
            label="Hatch Shadow"
            value={normalizedSettings.showHatching ? formatExportToken(renderOptions.hatchShadowColor) : "—"}
          />
        </div>
      </ComposerCollapsibleSection>

      <ComposerCollapsibleSection
        title="Layers"
        defaultExpanded={false}
        className="location-output-export-section"
        bodyClassName="location-output-export-section__body"
        aria-label="Export layer summary"
      >
        <div className="cruor-composer-fact-grid location-frame-info-grid">
          <ComposerFactRow className="location-frame-info-row" label="Room Labels" value={roomLabels} />
          <ComposerFactRow className="location-frame-info-row" label="Props" value={normalizedSettings.showProps ? "Visible" : "Hidden"} />
          <ComposerFactRow className="location-frame-info-row" label="Stair Arrows" value={normalizedSettings.showStairArrows ? "Visible" : "Hidden"} />
          <ComposerFactRow className="location-frame-info-row" label="Hatching" value={normalizedSettings.showHatching ? "Visible" : "Hidden"} />
          <ComposerFactRow className="location-frame-info-row" label="Texture" value={normalizedSettings.showTexture ? "Visible" : "Hidden"} />
          <ComposerFactRow className="location-frame-info-row" label="Secret Routes" value={normalizedSettings.hideSecrets ? "Hidden" : "Included"} />
        </div>
      </ComposerCollapsibleSection>

    </>
  );
}

function LocationOutputMapModal({
  documentModel,
  exportSettings,
  generatedMapPreview,
  onClose,
  onSelectRoom,
  open,
  selectedRoomId,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeButtonRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="location-output-map-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dark-places-map-preview-title"
      data-testid="dark-places-map-preview-modal"
    >
      <button
        className="location-output-map-modal__backdrop"
        type="button"
        aria-label="Close enlarged location map"
        onClick={onClose}
      />
      <figure className="location-output-map-modal__frame">
        <header className="location-output-map-modal__header">
          <div>
            <span>Location Map</span>
            <h2 id="dark-places-map-preview-title">{documentModel?.meta?.title || "Cursed Location"}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="cruor-square-icon-button"
            type="button"
            aria-label="Close enlarged location map"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>
        <div className="location-output-map-modal__canvas">
          <LocationOutputMap
            className="location-output-map--modal"
            documentModel={documentModel}
            exportSettings={exportSettings}
            generatedMapPreview={generatedMapPreview}
            interactive
            selectedRoomId={selectedRoomId}
            onSelectRoom={(roomId) => {
              onSelectRoom?.(roomId);
              onClose?.();
            }}
          />
        </div>
        <figcaption>Click a mapped room to open its table-ready entry.</figcaption>
      </figure>
    </div>
  );
}

function getLocationMetaSummary(documentModel) {
  const meta = documentModel?.meta || {};
  return [meta.context, ...asArray(meta.horror), ...asArray(meta.sourceAnchors)]
    .filter(Boolean)
    .join(" · ");
}

function LocationOutputOverview({ documentModel, outputProjection }) {
  const overview = outputProjection?.overview || {};
  const meta = documentModel?.meta || {};

  return (
    <ToolContentPanel
      className="location-output-document-view"
      data-testid="dark-places-output-overview"
      eyebrow="Final Output"
      title={meta.title || "Cursed Location"}
      summary={getLocationMetaSummary(documentModel)}
    >
      <OutputBlockSection
        blocks={overview.premise}
        title="Location Premise"
        icon="fa-scroll"
        className="location-output-section--premise"
      />
      <OutputBlockSection
        blocks={overview.atmosphere}
        title="Site Atmosphere"
        icon="fa-eye"
      />
      <OutputBlockSection
        blocks={overview.globalRules}
        title="Global Rules"
        icon="fa-dice-d20"
      />
      <OutputBlockSection
        blocks={overview.recurringSigns}
        title="Recurring Signs"
        icon="fa-repeat"
      />
      <OutputBlockSection
        blocks={overview.stakesAndConsequences}
        title="Stakes & Consequences"
        icon="fa-scale-balanced"
      />
    </ToolContentPanel>
  );
}

function LocationOutputAtTheTable({
  documentModel,
  persistenceEnabled,
  sessionState,
  onChangePressure,
  onResetSession,
  onSelectRoom,
  onToggleClue,
  onTogglePersistence,
}) {
  const guide = documentModel?.sessionGuide || {};
  const operational =
    cleanText(guide.openingBeat?.situation) &&
    (asArray(guide.pressureTracks).length ||
      asArray(guide.clueFlow?.nodes).length ||
      asArray(guide.stallMoves).length ||
      asArray(guide.roomShortcuts).length);
  if (operational) {
    return (
      <LocationAtTheTableDashboard
        guide={guide}
        sessionState={sessionState}
        persistenceEnabled={persistenceEnabled}
        onChangePressure={onChangePressure}
        onResetSession={onResetSession}
        onSelectRoom={onSelectRoom}
        onToggleClue={onToggleClue}
        onTogglePersistence={onTogglePersistence}
      />
    );
  }
  return (
    <ToolContentPanel
      className="location-output-document-view"
      data-testid="dark-places-output-table"
      eyebrow="Final Output"
      title="At the Table"
      summary="Run order, pressure, clues, and encounter guidance for the current location."
    >
      <OutputBlockSection
        blocks={guide.alwaysOnRules}
        title="Run This Location"
        icon="fa-dice-d20"
      />
    </ToolContentPanel>
  );
}

function LocationOutputMapSummary({ documentModel }) {
  const map = documentModel?.map || {};
  const counts = map.counts || {};
  const summaryEntries = [
    { id: "rooms", title: "Rooms", text: String(counts.rooms || 0), kind: "note" },
    { id: "connections", title: "Connections", text: String(counts.connections || 0), kind: "note" },
    { id: "levels", title: "Levels", text: String(counts.levels || 0), kind: "note" },
  ];

  return (
    <ToolContentPanel
      className="location-output-document-view"
      data-testid="dark-places-output-map-summary"
      eyebrow="Final Output"
      title="Map"
      summary={documentModel?.meta?.title || "Location Map"}
    >
      <OutputBlockSection blocks={summaryEntries} title="Map Structure" icon="fa-map" />
      {asArray(map.legend).length ? (
        <ToolFeatureBlock label="Legend" className="location-output-section">
          <ul className="location-output-plain-list">
            {map.legend.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
        </ToolFeatureBlock>
      ) : null}
    </ToolContentPanel>
  );
}

function LocationOutputOutline({
  activeSectionId,
  documentModel,
  onSelectSection,
}) {
  const rooms = asArray(documentModel?.rooms);

  function renderOutlineItem({
    id,
    icon,
    label,
    number = "",
    incomplete = false,
  }) {
    const active = activeSectionId === id;
    return (
      <button
        className={cx(
          "location-output-outline__item",
          number && "location-output-outline__room",
          "cruor-composer-control",
          active && "is-active",
        )}
        type="button"
        key={id}
        aria-current={active ? "page" : undefined}
        onClick={() => onSelectSection(id)}
      >
        {number ? <b>{number}</b> : <i className={`fa-solid ${icon}`} aria-hidden="true" />}
        <span>{label}</span>
        {incomplete ? <i className="fa-solid fa-circle" aria-label="Incomplete room" /> : null}
      </button>
    );
  }

  return (
    <ComposerRail
      side="left"
      variant="controls"
      surface
      scrollable
      className="location-output-outline location-composer__rail location-composer__rail--left"
      aria-label="Final output contents"
    >
      <ComposerCollapsibleSection
        title="Output"
        className="location-output-outline__section"
        bodyClassName="location-output-outline__section-body"
        aria-label="Final output sections"
      >
        <nav className="location-output-outline__nav" aria-label="Output contents">
          {renderOutlineItem({ id: "overview", icon: "fa-scroll", label: "Overview" })}
          {renderOutlineItem({ id: "map", icon: "fa-map", label: "Map" })}
          {renderOutlineItem({ id: "table", icon: "fa-dice-d20", label: "At the Table" })}
          {renderOutlineItem({ id: "export", icon: "fa-download", label: "Export Settings" })}
        </nav>
      </ComposerCollapsibleSection>

      {rooms.length ? (
        <ComposerCollapsibleSection
          title="Rooms"
          className="location-output-outline__section location-output-outline__section--rooms"
          bodyClassName="location-output-outline__section-body"
          aria-label="Room key"
        >
          <nav className="location-output-outline__nav location-output-outline__nav--rooms" aria-label="Rooms">
            {rooms.map((room) => renderOutlineItem({
              id: `room:${room.id}`,
              label: room.name,
              number: formatRoomNumber(room.number),
              incomplete: asArray(room.readiness?.missingSlotIds).length > 0,
            }))}
          </nav>
        </ComposerCollapsibleSection>
      ) : null}

    </ComposerRail>
  );
}

export function LocationOutputWorkspace({
  documentModel: sourceDocumentModel,
  exportBundle,
  generatedMapPreview,
  initialMapPreviewOpen = false,
  initialSectionId = "overview",
  initialSessionPersistence = false,
  onCopyText,
  onEditRoom,
  sessionStateStorage = null,
  workflowFooter = null,
}) {
  const outputProjection = useMemo(
    () => createLocationOutputProjection(sourceDocumentModel),
    [sourceDocumentModel],
  );
  const documentModel = outputProjection.document;
  const rooms = asArray(documentModel?.rooms);
  const sessionGuide = documentModel?.sessionGuide ?? EMPTY_SESSION_GUIDE;
  const sessionIdentity = useMemo(
    () => ({
      buildId: cleanText(
        documentModel?.id || exportBundle?.id || documentModel?.meta?.title,
        "unknown-build",
      ),
      documentVersion: cleanText(documentModel?.schemaVersion, "unknown-document"),
    }),
    [
      documentModel?.meta?.title,
      documentModel?.id,
      documentModel?.schemaVersion,
      exportBundle?.id,
    ],
  );
  const [sessionPersistenceEnabled, setSessionPersistenceEnabled] = useState(
    Boolean(initialSessionPersistence),
  );
  const [locationSessionState, setLocationSessionState] = useState(() => {
    const storage = resolveSessionStateStorage(sessionStateStorage);
    return initialSessionPersistence
      ? loadLocationSessionDashboardState(storage, sessionIdentity, sessionGuide)
      : createLocationSessionDashboardState({
          ...sessionIdentity,
          guide: sessionGuide,
        });
  });
  const validRoomIds = useMemo(() => new Set(rooms.map((room) => room.id)), [rooms]);
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [mapPreviewOpen, setMapPreviewOpen] = useState(initialMapPreviewOpen);
  const mapExportOpen = activeSectionId === "export";
  const contentSectionId = activeSectionId;
  const [mapExportSettings, setMapExportSettings] = useState(() =>
    createDefaultLocationMapExportSettings(generatedMapPreview),
  );
  const [mapExportBusy, setMapExportBusy] = useState(false);
  const [mapExportStatus, setMapExportStatus] = useState("");
  const mapContainerRef = useRef(null);
  const mapPreviewTriggerRef = useRef(null);

  useEffect(() => {
    if (!activeSectionId.startsWith("room:")) return;
    const roomId = activeSectionId.slice(5);
    if (validRoomIds.has(roomId)) return;
    setActiveSectionId("overview");
  }, [activeSectionId, validRoomIds]);

  useEffect(() => {
    setMapExportSettings((current) =>
      normalizeLocationMapExportSettings(current, generatedMapPreview),
    );
  }, [generatedMapPreview]);

  useEffect(() => {
    const storage = resolveSessionStateStorage(sessionStateStorage);
    setLocationSessionState(
      sessionPersistenceEnabled
        ? loadLocationSessionDashboardState(storage, sessionIdentity, sessionGuide)
        : createLocationSessionDashboardState({
            ...sessionIdentity,
            guide: sessionGuide,
          }),
    );
  }, [sessionGuide, sessionIdentity, sessionStateStorage]);

  useEffect(() => {
    if (!sessionPersistenceEnabled) return;
    saveLocationSessionDashboardState(
      resolveSessionStateStorage(sessionStateStorage),
      locationSessionState,
    );
  }, [locationSessionState, sessionPersistenceEnabled, sessionStateStorage]);

  const activeRoomId = contentSectionId.startsWith("room:")
    ? contentSectionId.slice(5)
    : "";
  const activeRoom = rooms.find((room) => room.id === activeRoomId) || null;

  function selectSection(sectionId) {
    setActiveSectionId(sectionId);
  }

  function selectRoom(roomId) {
    if (!roomId || !validRoomIds.has(roomId)) return;
    setActiveSectionId(`room:${roomId}`);
  }

  function changeSessionPressure(trackId, delta) {
    setLocationSessionState((current) =>
      updateLocationSessionPressure(current, sessionGuide, trackId, delta),
    );
  }

  function toggleSessionClue(clueId) {
    setLocationSessionState((current) =>
      toggleLocationSessionClue(current, sessionGuide, clueId),
    );
  }

  function resetSession() {
    setLocationSessionState((current) =>
      resetLocationSessionDashboardState(current, sessionGuide),
    );
  }

  function toggleSessionPersistence(enabled) {
    const storage = resolveSessionStateStorage(sessionStateStorage);
    if (enabled) {
      saveLocationSessionDashboardState(storage, locationSessionState);
    } else {
      clearLocationSessionDashboardState(storage, sessionIdentity);
    }
    setSessionPersistenceEnabled(Boolean(enabled));
  }

  function openMapPreview() {
    if (!generatedMapPreview) return;
    setMapPreviewOpen(true);
  }

  function closeMapPreview() {
    setMapPreviewOpen(false);
    requestAnimationFrame(() => mapPreviewTriggerRef.current?.focus());
  }

  function updateMapExportSettings(patch) {
    setMapExportSettings((current) =>
      updateLocationMapExportSettings(current, patch, generatedMapPreview),
    );
    setMapExportStatus("");
  }

  function selectMapExportPreset(presetId) {
    setMapExportSettings((current) =>
      applyLocationMapExportPreset(current, presetId, generatedMapPreview),
    );
    setMapExportStatus("");
  }

  async function downloadMapExport() {
    const svg = mapContainerRef.current?.querySelector("svg.cruor-map-svg");
    if (!svg || !generatedMapPreview) {
      setMapExportStatus("Map export unavailable");
      return;
    }

    const normalizedSettings = normalizeLocationMapExportSettings(
      mapExportSettings,
      generatedMapPreview,
    );
    const renderOptions = getLocationMapExportRenderOptions(
      generatedMapPreview,
      normalizedSettings,
    );
    const serializedSvg = serializeSvg(
      svg,
      getLocationMapSerializationOptions(generatedMapPreview, normalizedSettings),
    );
    if (!serializedSvg) {
      setMapExportStatus("Map export unavailable");
      return;
    }

    setMapExportBusy(true);
    setMapExportStatus("");
    try {
      const filename = createLocationMapExportFilename(
        documentModel?.meta?.title || exportBundle?.title,
        normalizedSettings,
      );
      let blob = null;
      if (normalizedSettings.format === "png") {
        blob = await rasterizeSvgToPngBlob(serializedSvg, {
          width: renderOptions.viewBoxBounds.width,
          height: renderOptions.viewBoxBounds.height,
          scale: normalizedSettings.pngScale,
          background: normalizedSettings.background === "transparent" ? "transparent" : null,
        });
      } else {
        blob = createSvgBlob(serializedSvg);
      }

      const downloaded = downloadBlobFile(filename, blob);
      setMapExportStatus(downloaded ? `${filename} downloaded` : "Map export unavailable");
    } catch (error) {
      setMapExportStatus(error instanceof Error ? error.message : "Map export failed");
    } finally {
      setMapExportBusy(false);
    }
  }

  function renderContent() {
    if (contentSectionId === "export") {
      return (
        <LocationMapExportStudio
          generatedMap={generatedMapPreview}
          settings={mapExportSettings}
          onChange={updateMapExportSettings}
          onPreset={selectMapExportPreset}
        />
      );
    }
    if (contentSectionId === "map") {
      return <LocationOutputMapSummary documentModel={documentModel} />;
    }
    if (contentSectionId === "table") {
      return (
        <LocationOutputAtTheTable
          documentModel={documentModel}
          persistenceEnabled={sessionPersistenceEnabled}
          sessionState={locationSessionState}
          onChangePressure={changeSessionPressure}
          onResetSession={resetSession}
          onSelectRoom={selectRoom}
          onToggleClue={toggleSessionClue}
          onTogglePersistence={toggleSessionPersistence}
        />
      );
    }
    if (contentSectionId.startsWith("room:")) {
      return (
        <LocationRoomOutput
          documentModel={documentModel}
          room={activeRoom}
          generatedMap={generatedMapPreview}
          exportSettings={mapExportSettings}
          onCopyText={onCopyText}
          onEditRoom={onEditRoom}
          onSelectRoom={selectRoom}
        />
      );
    }
    return (
      <LocationOutputOverview
        documentModel={documentModel}
        outputProjection={outputProjection}
      />
    );
  }

  return (
    <main
      className="cruor-composer-stage location-composer__stage location-output-stage"
      aria-label="Final location output"
    >
      <section
        className="location-map-stage has-live-preview is-simple-surface is-map-synced location-map-stage--preview location-output-workspace"
        data-location-map-surface="preview"
        data-location-document-schema={documentModel.schemaVersion}
        data-location-output-schema={outputProjection.schemaVersion}
        data-map-grid-visible="true"
        data-map-export-open={mapExportOpen ? "true" : "false"}
        data-testid="dark-places-final-output"
      >
        <LocationOutputOutline
          activeSectionId={activeSectionId}
          documentModel={documentModel}
          onSelectSection={selectSection}
        />

        <section className="location-output-main location-map-stage__center">
          <section
            className="location-output-document-stage cruor-composer-panel cruor-scroll-surface"
            aria-live="polite"
            aria-label="Final output document"
          >
            <div className="location-output-document-stage__inner">
              {renderContent()}
            </div>
          </section>
        </section>

        <ComposerRail
          side="right"
          variant="info"
          scrollable
          className="location-output-details-rail location-composer__rail location-composer__rail--right location-frame-info"
          aria-label="Map preview and export summary"
          footer={workflowFooter}
        >
          <LocationOutputMapPreview
            activeRoom={activeRoom}
            busy={mapExportBusy}
            documentModel={documentModel}
            exportSettings={mapExportSettings}
            generatedMapPreview={generatedMapPreview}
            mapContainerRef={mapContainerRef}
            onDownload={downloadMapExport}
            onOpen={openMapPreview}
            status={mapExportStatus}
            triggerRef={mapPreviewTriggerRef}
          />
          <LocationOutputExportSummary
            exportTitle={documentModel?.meta?.title || exportBundle?.title}
            generatedMapPreview={generatedMapPreview}
            settings={mapExportSettings}
          />
        </ComposerRail>
      </section>

      <LocationOutputMapModal
        documentModel={documentModel}
        exportSettings={mapExportSettings}
        generatedMapPreview={generatedMapPreview}
        onClose={closeMapPreview}
        onSelectRoom={selectRoom}
        open={mapPreviewOpen}
        selectedRoomId={activeRoomId}
      />
    </main>
  );
}
