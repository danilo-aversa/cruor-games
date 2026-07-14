import { useEffect, useMemo, useRef, useState } from "react";
import { ComposerCollapsibleSection, ComposerRail } from "../../../components/ui/composer-rail.jsx";
import { MapSvg } from "../map-generator/map-generator.render.jsx";
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
import "./location-output.styles.css";

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
    <section className={cx("location-output-section", className)}>
      <header className="location-output-section__head">
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
        <h3 className="cruor-composer-collapsible-section__title">{title}</h3>
      </header>
      <div className="location-output-prose-list">
        {entries.map((block) => (
          <OutputBlock block={block} key={block.id} />
        ))}
      </div>
    </section>
  );
}

function LocationOutputMap({
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
      className="location-output-map cruor-composer-panel"
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

function LocationOutputOverview({ documentModel }) {
  const overview = documentModel?.overview || {};
  const meta = documentModel?.meta || {};
  const globalEffects = [
    ...asArray(overview.sensory),
    ...asArray(overview.visibleAnomalies),
    ...asArray(overview.rewardConsequences),
  ];

  return (
    <div className="location-output-document-view" data-testid="dark-places-output-overview">
      <header className="location-output-document-hero">
        <span className="cruor-composer-collapsible-section__title">Final Output</span>
        <h2>{meta.title || "Cursed Location"}</h2>
        <p>
          {[meta.context, ...asArray(meta.horror), ...asArray(meta.sourceAnchors)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      <OutputBlockSection
        blocks={overview.premise}
        title="Location Premise"
        icon="fa-scroll"
        className="location-output-section--premise"
      />
      <OutputBlockSection
        blocks={globalEffects}
        title="Global Effects"
        icon="fa-eye"
      />
      <OutputBlockSection
        blocks={overview.atTheTable}
        title="At the Table"
        icon="fa-dice-d20"
      />
    </div>
  );
}

function LocationOutputAtTheTable({ documentModel }) {
  return (
    <div className="location-output-document-view" data-testid="dark-places-output-table">
      <header className="location-output-document-heading">
        <span className="cruor-composer-collapsible-section__title">Operational Summary</span>
        <h2>At the Table</h2>
      </header>
      <OutputBlockSection
        blocks={documentModel?.overview?.atTheTable}
        title="Run This Location"
        icon="fa-dice-d20"
      />
    </div>
  );
}

function LocationOutputMapSummary({ documentModel }) {
  const map = documentModel?.map || {};
  return (
    <div className="location-output-document-view" data-testid="dark-places-output-map-summary">
      <header className="location-output-document-heading">
        <span className="cruor-composer-collapsible-section__title">Map</span>
        <h2>{documentModel?.meta?.title || "Location Map"}</h2>
      </header>
      <dl className="location-output-map-summary">
        <div><dt>Rooms</dt><dd>{map.counts?.rooms || 0}</dd></div>
        <div><dt>Connections</dt><dd>{map.counts?.connections || 0}</dd></div>
        <div><dt>Levels</dt><dd>{map.counts?.levels || 0}</dd></div>
      </dl>
      {asArray(map.legend).length ? (
        <section className="location-output-section">
          <header className="location-output-section__head">
            <i className="fa-solid fa-map-signs" aria-hidden="true" />
            <h3 className="cruor-composer-collapsible-section__title">Legend</h3>
          </header>
          <ul className="location-output-plain-list">
            {map.legend.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function LocationOutputOutline({
  activeSectionId,
  documentModel,
  onBackToFrame,
  onBackToRooms,
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

      <section className="location-output-outline__actions cruor-composer-sidebar-block" aria-label="Output navigation">
        <button className="cruor-composer-control" type="button" onClick={onBackToRooms}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          <span>Rooms</span>
        </button>
        <button className="cruor-composer-control" type="button" onClick={onBackToFrame}>
          <i className="fa-solid fa-sliders" aria-hidden="true" />
          <span>Frame</span>
        </button>
      </section>
    </ComposerRail>
  );
}

function LocationOutputActions({
  copyStatus,
  documentModel,
  mapExportOpen,
  onCopyFormat,
  onDownloadFormat,
  onOpenMapExport,
  onReviewMissing,
  uiMode,
}) {
  const incompleteCount = asArray(documentModel?.readiness?.incompleteRooms).length;
  const showAdvancedFormats = uiMode !== "simple";
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRootRef = useRef(null);
  const menuTriggerRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return undefined;

    function handlePointerDown(event) {
      if (!menuRootRef.current?.contains(event.target)) setMoreOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMoreOpen(false);
      menuTriggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  function focusMenuItem(position = "first") {
    requestAnimationFrame(() => {
      const items = Array.from(menuRootRef.current?.querySelectorAll('[role="menuitem"]') || []);
      const target = position === "last" ? items.at(-1) : items[0];
      target?.focus();
    });
  }

  function openMoreMenu(position = "first") {
    setMoreOpen(true);
    focusMenuItem(position);
  }

  function runMenuAction(action) {
    setMoreOpen(false);
    action?.();
    menuTriggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openMoreMenu(event.key === "ArrowUp" ? "last" : "first");
  }

  function handleMenuKeyDown(event) {
    const items = Array.from(menuRootRef.current?.querySelectorAll('[role="menuitem"]') || []);
    const currentIndex = items.indexOf(document.activeElement);
    if (!items.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = currentIndex < 0
        ? 0
        : (currentIndex + delta + items.length) % items.length;
      items[nextIndex]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setMoreOpen(false);
    }
  }

  return (
    <div className="location-output-actions">
      {incompleteCount ? (
        <button
          className="location-output-review-action cruor-composer-control"
          type="button"
          onClick={onReviewMissing}
        >
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>Review Missing</span>
        </button>
      ) : null}
      <button
        className={cx("location-output-download-trigger", "cruor-composer-control", mapExportOpen && "is-active")}
        type="button"
        aria-pressed={mapExportOpen}
        onClick={onOpenMapExport}
        data-testid="dark-places-open-map-export"
      >
        <i className="fa-solid fa-download" aria-hidden="true" />
        <span>Download Map</span>
      </button>
      <div className="location-output-more-menu" ref={menuRootRef}>
        <button
          ref={menuTriggerRef}
          className="location-output-more-menu__trigger cruor-dropdown-trigger"
          type="button"
          aria-label="More export formats"
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          aria-controls="dark-places-output-more-menu"
          onClick={() => setMoreOpen((current) => !current)}
          onKeyDown={handleTriggerKeyDown}
        >
          <i className="fa-solid fa-ellipsis cruor-dropdown-trigger__icon" aria-hidden="true" />
          <span className="cruor-dropdown-trigger__label">More</span>
          <i className="fa-solid fa-chevron-down cruor-dropdown-trigger__chevron" aria-hidden="true" />
        </button>
        <div
          id="dark-places-output-more-menu"
          className="location-output-more-menu__panel cruor-dropdown-menu cruor-dropdown-menu--context"
          role="menu"
          aria-label="More export formats"
          hidden={!moreOpen}
          onKeyDown={handleMenuKeyDown}
        >
            <div className="cruor-dropdown-options" role="none">
              <button
                className="cruor-dropdown-option"
                type="button"
                role="menuitem"
                onClick={() => runMenuAction(() => onDownloadFormat?.("roomKey"))}
              >
                <i className="fa-solid fa-file-lines cruor-dropdown-option__icon" aria-hidden="true" />
                <span className="cruor-dropdown-option__label">Room Key</span>
                <span className="cruor-dropdown-option__meta">.md</span>
              </button>
              <button
                className="cruor-dropdown-option"
                type="button"
                role="menuitem"
                onClick={() => runMenuAction(() => onCopyFormat?.("tableText"))}
              >
                <i className="fa-solid fa-copy cruor-dropdown-option__icon" aria-hidden="true" />
                <span className="cruor-dropdown-option__label">Copy Table Text</span>
              </button>
              {showAdvancedFormats ? (
                <>
                  <div className="cruor-dropdown-separator" role="separator" />
                  <button
                    className="cruor-dropdown-option"
                    type="button"
                    role="menuitem"
                    onClick={() => runMenuAction(() => onDownloadFormat?.("sessionInsert"))}
                  >
                    <i className="fa-solid fa-file-arrow-down cruor-dropdown-option__icon" aria-hidden="true" />
                    <span className="cruor-dropdown-option__label">Session Insert</span>
                    <span className="cruor-dropdown-option__meta">.txt</span>
                  </button>
                  <button
                    className="cruor-dropdown-option"
                    type="button"
                    role="menuitem"
                    onClick={() => runMenuAction(() => onDownloadFormat?.("json"))}
                  >
                    <i className="fa-solid fa-code cruor-dropdown-option__icon" aria-hidden="true" />
                    <span className="cruor-dropdown-option__label">Data</span>
                    <span className="cruor-dropdown-option__meta">.json</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      <span className={cx("location-output-copy-status", copyStatus && "is-visible")} aria-live="polite">
        {copyStatus}
      </span>
    </div>
  );
}

export function LocationOutputWorkspace({
  copyStatus = "",
  documentModel,
  exportBundle,
  generatedMapPreview,
  initialMapExportOpen = false,
  initialSectionId = "overview",
  onBackToFrame,
  onBackToRooms,
  onCopyFormat,
  onCopyText,
  onDownloadFormat,
  onEditRoom,
  onReviewMissing,
  uiMode = "simple",
}) {
  const rooms = asArray(documentModel?.rooms);
  const validRoomIds = useMemo(() => new Set(rooms.map((room) => room.id)), [rooms]);
  const [activeSectionId, setActiveSectionId] = useState(initialMapExportOpen ? "map" : initialSectionId);
  const [mapExportOpen, setMapExportOpen] = useState(Boolean(initialMapExportOpen));
  const [mapExportSettings, setMapExportSettings] = useState(() =>
    createDefaultLocationMapExportSettings(generatedMapPreview),
  );
  const [mapExportBusy, setMapExportBusy] = useState(false);
  const [mapExportStatus, setMapExportStatus] = useState("");
  const mapContainerRef = useRef(null);
  const runMapSettings = useMemo(() => {
    const defaults = createDefaultLocationMapExportSettings(generatedMapPreview);
    return normalizeLocationMapExportSettings(
      { ...defaults, showStairArrows: false },
      generatedMapPreview,
    );
  }, [generatedMapPreview]);
  const displayedMapSettings = mapExportOpen ? mapExportSettings : runMapSettings;

  useEffect(() => {
    if (!activeSectionId.startsWith("room:")) return;
    const roomId = activeSectionId.slice(5);
    if (!validRoomIds.has(roomId)) setActiveSectionId("overview");
  }, [activeSectionId, validRoomIds]);

  useEffect(() => {
    setMapExportSettings((current) =>
      normalizeLocationMapExportSettings(current, generatedMapPreview),
    );
  }, [generatedMapPreview]);

  const activeRoomId = activeSectionId.startsWith("room:")
    ? activeSectionId.slice(5)
    : "";
  const activeRoom = rooms.find((room) => room.id === activeRoomId) || null;

  function selectRoom(roomId) {
    if (!roomId || !validRoomIds.has(roomId)) return;
    setActiveSectionId(`room:${roomId}`);
  }

  function openMapExport() {
    setActiveSectionId("map");
    setMapExportOpen(true);
    setMapExportStatus("");
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

  return (
    <main
      className="location-output-workspace cruor-composer-frame"
      aria-label="Final location output"
      data-map-export-open={mapExportOpen ? "true" : "false"}
      data-testid="dark-places-final-output"
    >
      <LocationOutputOutline
        activeSectionId={activeSectionId}
        documentModel={documentModel}
        onBackToFrame={onBackToFrame}
        onBackToRooms={onBackToRooms}
        onSelectSection={setActiveSectionId}
      />

      <section className="location-output-main cruor-composer-stage">
        <header className="location-output-main__toolbar cruor-composer-panel">
          <div>
            <span>{mapExportOpen ? "Map Export" : "Run at Table"}</span>
            <strong>{documentModel?.meta?.title || exportBundle?.title || "Cursed Location"}</strong>
          </div>
          <LocationOutputActions
            copyStatus={copyStatus}
            documentModel={documentModel}
            mapExportOpen={mapExportOpen}
            onCopyFormat={onCopyFormat}
            onDownloadFormat={onDownloadFormat}
            onOpenMapExport={openMapExport}
            onReviewMissing={onReviewMissing}
            uiMode={uiMode}
          />
        </header>

        <div className="location-output-run-grid">
          <section className="location-output-map-panel" aria-label="Location map">
            <LocationOutputMap
              documentModel={documentModel}
              exportSettings={displayedMapSettings}
              generatedMapPreview={generatedMapPreview}
              interactive={!mapExportOpen}
              mapContainerRef={mapContainerRef}
              selectedRoomId={activeRoomId}
              onSelectRoom={selectRoom}
            />
            {activeRoom && !mapExportOpen ? (
              <button
                className="location-output-map-selection cruor-composer-control"
                type="button"
                onClick={() => setActiveSectionId(`room:${activeRoom.id}`)}
              >
                <b>{formatRoomNumber(activeRoom.number)}</b>
                <span>{activeRoom.name}</span>
              </button>
            ) : null}
          </section>

          <section className="location-output-content cruor-composer-panel cruor-scroll-surface" aria-live="polite">
            {activeSectionId === "overview" ? (
              <LocationOutputOverview documentModel={documentModel} />
            ) : activeSectionId === "map" ? (
              <LocationOutputMapSummary documentModel={documentModel} />
            ) : activeSectionId === "table" ? (
              <LocationOutputAtTheTable documentModel={documentModel} />
            ) : (
              <LocationRoomOutput
                room={activeRoom}
                onCopyText={onCopyText}
                onEditRoom={onEditRoom}
                onSelectRoom={selectRoom}
              />
            )}
          </section>
        </div>
      </section>

      {mapExportOpen ? (
        <LocationMapExportStudio
          busy={mapExportBusy}
          generatedMap={generatedMapPreview}
          settings={mapExportSettings}
          status={mapExportStatus}
          onChange={updateMapExportSettings}
          onClose={() => setMapExportOpen(false)}
          onDownload={downloadMapExport}
          onPreset={selectMapExportPreset}
        />
      ) : null}
    </main>
  );
}
