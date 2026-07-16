import { ToolButton, ToolContentPanel, ToolFeatureBlock } from "../../../../components/ui/tool-content-panel.jsx";
import { MapSvg } from "../../map-generator/map-generator.render.jsx";
import { getLocationMapExportRenderOptions } from "../model/location-map-export.js";

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

function formatLevel(value) {
  const level = Number(value);
  if (!Number.isFinite(level) || level === 0) return "Ground level";
  return `Level ${level > 0 ? `+${level}` : level}`;
}

function formatFieldKey(value = "") {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatInlineLabel(value = "") {
  const label = cleanText(value);
  if (!label) return "";
  return /[.!?:]$/.test(label) ? label : `${label}.`;
}

function normalizeFacetEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value)
    .map(([key, nestedValue]) => {
      const text = Array.isArray(nestedValue)
        ? nestedValue.map((entry) => cleanText(entry)).filter(Boolean).join(", ")
        : typeof nestedValue === "object" && nestedValue !== null
          ? JSON.stringify(nestedValue)
          : cleanText(nestedValue);
      return text ? { key, label: formatFieldKey(key), value: text } : null;
    })
    .filter(Boolean);
}

function createFallbackFacet(id, value, audience = "gm") {
  if (!value) return null;
  if (typeof value === "string") {
    const text = cleanText(value);
    return text ? { id, audience, text, entries: [], items: [] } : null;
  }
  if (Array.isArray(value)) {
    const items = value.map((entry) => cleanText(entry)).filter(Boolean);
    return items.length ? { id, audience, text: "", entries: [], items } : null;
  }
  if (typeof value === "object") {
    const entries = normalizeFacetEntries(value);
    return entries.length ? { id, audience, text: "", entries, items: [] } : null;
  }
  return null;
}

const FACET_ORDER_BY_KIND = Object.freeze({
  sensory: ["impression", "guidance"],
  feature: ["description", "resolution", "counterplay", "guidance"],
  interaction: ["interaction", "resolution", "counterplay", "guidance"],
  hazard: ["description", "trigger", "detection", "resolution", "effect", "counterplay", "guidance"],
  clue: ["observation", "revelation", "discovery", "counterplay", "guidance"],
  encounterTwist: ["openingSign", "change", "escalation", "counterplay", "guidance"],
  secret: ["revelation", "discovery", "consequence", "counterplay", "guidance"],
  reward: ["discovery", "effect", "cost", "consequence", "counterplay", "guidance"],
});

const FACET_LABEL_BY_KIND = Object.freeze({
  sensory: {
    impression: "Immediate Impression",
    guidance: "GM Guidance",
  },
  feature: {
    description: "Visible Feature",
    resolution: "Interaction",
    counterplay: "Counterplay",
    guidance: "GM Guidance",
  },
  interaction: {
    interaction: "Interaction",
    resolution: "Resolution",
    counterplay: "Counterplay",
    guidance: "GM Guidance",
  },
  hazard: {
    description: "What They Notice",
    trigger: "Trigger",
    detection: "Detection",
    resolution: "Resolution",
    effect: "Effect",
    counterplay: "Avoid or Disable",
    guidance: "GM Guidance",
  },
  clue: {
    observation: "What They Notice",
    revelation: "What It Reveals",
    discovery: "How It Is Discovered",
    counterplay: "Counterplay",
    guidance: "How to Use It",
  },
  encounterTwist: {
    openingSign: "Opening Sign",
    change: "What Changes",
    escalation: "Escalation",
    counterplay: "Counterplay",
    guidance: "GM Guidance",
  },
  secret: {
    revelation: "Revelation",
    discovery: "Discovery",
    consequence: "Connection or Consequence",
    counterplay: "Counterplay",
    guidance: "GM Guidance",
  },
  reward: {
    discovery: "What They Find",
    effect: "Effect",
    cost: "Cost",
    consequence: "Future Consequence",
    counterplay: "Counterplay",
    guidance: "GM Guidance",
  },
});

const SECTION_CONFIG = Object.freeze({
  hazard: { title: "Hazards & Traps", icon: "fa-triangle-exclamation" },
  clue: { title: "Disturbing Clues", icon: "fa-magnifying-glass" },
  encounterTwist: { title: "Encounter Twists", icon: "fa-shuffle" },
  secret: { title: "Secrets — GM Only", icon: "fa-user-secret", className: "location-output-section--secret" },
  reward: { title: "Reward / Consequence", icon: "fa-gem" },
});

function getFallbackFacets(block, kind) {
  const audience = block?.audience || "gm";
  const values = {
    sensory: [
      createFallbackFacet("impression", block?.text, audience),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
    feature: [
      createFallbackFacet("description", block?.text, audience),
      createFallbackFacet("resolution", block?.mechanics, "gm"),
      createFallbackFacet("counterplay", block?.counterplay, "gm"),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
    interaction: [
      createFallbackFacet("interaction", block?.text, audience),
      createFallbackFacet("resolution", block?.mechanics, "gm"),
      createFallbackFacet("counterplay", block?.counterplay, "gm"),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
    hazard: [
      createFallbackFacet("description", block?.text, audience),
      createFallbackFacet("resolution", block?.mechanics, "gm"),
      createFallbackFacet("counterplay", block?.counterplay, "gm"),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
    clue: [
      createFallbackFacet("observation", block?.text, audience),
      createFallbackFacet("revelation", block?.mechanics, "gm"),
      createFallbackFacet("counterplay", block?.counterplay, "gm"),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
    encounterTwist: [
      createFallbackFacet("openingSign", block?.text, audience),
      createFallbackFacet("change", block?.mechanics, "gm"),
      createFallbackFacet("counterplay", block?.counterplay, "gm"),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
    secret: [
      createFallbackFacet("revelation", block?.text, "gm"),
      createFallbackFacet("discovery", block?.mechanics, "gm"),
      createFallbackFacet("counterplay", block?.counterplay, "gm"),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
    reward: [
      createFallbackFacet("discovery", block?.text, audience),
      createFallbackFacet("effect", block?.mechanics, "gm"),
      createFallbackFacet("counterplay", block?.counterplay, "gm"),
      createFallbackFacet("guidance", block?.narrative, "gm"),
    ],
  };
  return (values[kind] || []).filter(Boolean);
}

function getSemanticFacets(block, kind) {
  const source = asArray(block?.facets).length
    ? asArray(block.facets)
    : getFallbackFacets(block, kind);
  const order = FACET_ORDER_BY_KIND[kind] || [];
  return source
    .filter((facet) => facet?.id)
    .sort((left, right) => {
      const leftIndex = order.indexOf(left.id);
      const rightIndex = order.indexOf(right.id);
      return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex)
        - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
    });
}

function FacetValue({ facet }) {
  if (facet?.text) return <span>{facet.text}</span>;
  if (asArray(facet?.items).length) {
    return (
      <ul>
        {facet.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  if (asArray(facet?.entries).length) {
    return (
      <dl>
        {facet.entries.map((entry) => (
          <div key={entry.key || entry.label}>
            <dt>{formatInlineLabel(entry.label || formatFieldKey(entry.key))}</dt>
            <dd>{entry.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return null;
}

function SemanticBlockCard({ block, kind, compact = false }) {
  const facets = getSemanticFacets(block, kind);
  if (!facets.length) return null;
  const subtype = cleanText(block?.subtype || block?.metadata?.subtype || kind);

  return (
    <article
      className={cx(
        "location-output-semantic-card",
        `location-output-semantic-card--${kind}`,
        compact && "is-compact",
      )}
      data-output-kind={kind}
    >
      <header className="location-output-semantic-card__head">
        {!compact ? <span>{formatFieldKey(subtype)}</span> : null}
        {block?.title ? <h4>{formatInlineLabel(block.title)}</h4> : null}
      </header>
      <div className="location-output-semantic-fields">
        {facets.map((facet) => (
          <div className="location-output-semantic-field" key={`${block.id}-${facet.id}`}>
            <strong>{formatInlineLabel(FACET_LABEL_BY_KIND[kind]?.[facet.id] || formatFieldKey(facet.id))}</strong>
            <FacetValue facet={facet} />
          </div>
        ))}
      </div>
    </article>
  );
}

function SemanticBlockSection({ blocks, kind }) {
  const entries = asArray(blocks);
  if (!entries.length) return null;
  const config = SECTION_CONFIG[kind];

  return (
    <ToolFeatureBlock
      label={config?.title || formatFieldKey(kind)}
      className={cx("location-output-section", `location-output-section--${kind}`, config?.className)}
      data-section-icon={config?.icon || "fa-diamond"}
    >
      <div className="location-output-semantic-list">
        {entries.map((block) => (
          <SemanticBlockCard block={block} kind={kind} key={block.id} />
        ))}
      </div>
    </ToolFeatureBlock>
  );
}

function ImmediateImpressions({ room }) {
  const groups = [
    {
      id: "sensory",
      title: "Sensory",
      icon: "fa-ear-listen",
      blocks: room?.immediateImpressions?.sensory,
    },
    {
      id: "feature",
      title: "Feature",
      icon: "fa-eye",
      blocks: room?.immediateImpressions?.features,
    },
    {
      id: "interaction",
      title: "Interaction",
      icon: "fa-hand",
      blocks: room?.immediateImpressions?.interactions,
    },
  ].filter((group) => asArray(group.blocks).length);

  if (!groups.length) return null;

  return (
    <ToolFeatureBlock label="Immediate Impressions" className="location-output-section location-output-section--impressions">
      <div className="location-output-impression-grid">
        {groups.map((group) => (
          <section className="location-output-impression-group" key={group.id}>
            <header>
              <i className={`fa-solid ${group.icon}`} aria-hidden="true" />
              <h4>{group.title}</h4>
            </header>
            {asArray(group.blocks).map((block) => (
              <SemanticBlockCard block={block} kind={group.id} compact key={block.id} />
            ))}
          </section>
        ))}
      </div>
    </ToolFeatureBlock>
  );
}

function ReadAloudSection({ room, onCopyText }) {
  const entries = asArray(room?.readAloud);
  if (!entries.length) return null;

  return (
    <ToolFeatureBlock label="Read Aloud" className="location-output-section location-output-section--readaloud">
      <blockquote className="location-output-readaloud">
        <button
          className="location-output-icon-action cruor-square-icon-button cruor-square-icon-button--compact"
          type="button"
          aria-label={`Copy read-aloud for ${room.name}`}
          onClick={() => onCopyText?.(
            `${room.name} read-aloud`,
            entries.map((block) => block.text).join("\n\n"),
          )}
        >
          <i className="fa-solid fa-copy" aria-hidden="true" />
        </button>
        {entries.map((block) => <p key={block.id}>{block.text}</p>)}
      </blockquote>
    </ToolFeatureBlock>
  );
}

function getConnectionTransition(connection) {
  if (!connection?.crossLevel) return "";
  const delta = Number(connection.levelDelta || 0);
  const direction = delta > 0 ? "Up" : delta < 0 ? "Down" : "Level change";
  const distance = Math.max(1, Math.abs(delta || 1));
  return `${direction} ${distance} level${distance === 1 ? "" : "s"}`;
}


function getRoomMapIdentitySet(room = {}) {
  return new Set(
    [room.id, room.sourceRegionId, room.generatedRoomId]
      .map((value) => cleanText(value))
      .filter(Boolean),
  );
}

function getRegionPreviewCells(region = {}) {
  if (Array.isArray(region.floorCells) && region.floorCells.length) return region.floorCells;
  if (Array.isArray(region.cells) && region.cells.length) return region.cells;
  return [];
}

function findGeneratedRoomRegion(generatedMap, room) {
  if (!generatedMap || !room) return null;
  const identities = getRoomMapIdentitySet(room);
  return asArray(generatedMap.regions).find((region) => {
    const candidates = [
      region?.id,
      region?.sourceRegionId,
      region?.previewTargetId,
      region?.requestMetadata?.sourceRegionId,
      region?.metadata?.sourceRegionId,
    ]
      .map((value) => cleanText(value))
      .filter(Boolean);
    return candidates.some((candidate) => identities.has(candidate));
  }) || null;
}

function createRoomPreviewViewBox(region, generatedMap) {
  const cells = getRegionPreviewCells(region);
  const gridSize = Number(generatedMap?.config?.gridSize) || 34;
  if (!cells.length) return null;
  const minX = Math.min(...cells.map((cell) => Number(cell?.x) || 0));
  const minY = Math.min(...cells.map((cell) => Number(cell?.y) || 0));
  const maxX = Math.max(...cells.map((cell) => (Number(cell?.x) || 0) + 1));
  const maxY = Math.max(...cells.map((cell) => (Number(cell?.y) || 0) + 1));
  const padding = Math.max(12, Math.round(gridSize * 0.9));
  const x = (minX * gridSize) - padding;
  const y = (minY * gridSize) - padding;
  const width = Math.max(gridSize * 2, ((maxX - minX) * gridSize) + (padding * 2));
  const height = Math.max(gridSize * 2, ((maxY - minY) * gridSize) + (padding * 2));
  return { x, y, width, height, value: `${x} ${y} ${width} ${height}` };
}

function createRoomPreviewMap(generatedMap, region) {
  if (!generatedMap || !region) return null;
  return {
    ...generatedMap,
    regions: [region],
    corridors: [],
    manualCorridors: [],
    manualCorridorTypes: {},
    roomLinks: [],
    mapAccesses: [],
    connections: [],
  };
}

function LocationRoomPreview({ room, region, generatedMap, exportSettings }) {
  const previewMap = createRoomPreviewMap(generatedMap, region);
  const viewBox = createRoomPreviewViewBox(region, generatedMap);
  const renderOptions = getLocationMapExportRenderOptions(generatedMap, exportSettings || {});

  if (!previewMap || !viewBox) return null;

  return (
    <section className="location-output-room-preview" aria-label={`${room?.name || "Selected room"} render`}>
      <div className="location-output-room-preview__frame">
        <MapSvg
          generatedMap={previewMap}
          showGrid={false}
          crosshatchStyle={renderOptions.crosshatchStyle}
          crosshatchOpacity={renderOptions.crosshatchOpacity}
          wallDrawingStyle={renderOptions.wallDrawingStyle}
          hatchShadowColor={renderOptions.hatchShadowColor}
          showEditor={false}
          showNames={false}
          showRoomNumbers={false}
          showRoomBadges={false}
          hideSecretRoutes
          showProps={false}
          showStairArrows={false}
          fadeOtherLevels={false}
          levelView="all"
          viewportViewBox={viewBox.value}
        />
      </div>
    </section>
  );
}

function RoomConnectionList({ connections, onSelectRoom }) {
  const entries = asArray(connections);
  if (!entries.length) return null;

  return (
    <ToolFeatureBlock label="Exits" className="location-output-section location-output-section--connections">
      <div className="location-output-connection-list">
        {entries.map((connection) => {
          const transition = getConnectionTransition(connection);
          const kind = connection.secret ? "Secret Passage" : formatFieldKey(cleanText(connection.kind, "Passage"));
          const interactive = Boolean(connection.targetRoomId && onSelectRoom);
          const Tag = interactive ? "button" : "div";
          return (
            <Tag
              className={cx("location-output-connection", interactive && "cruor-composer-control")}
              key={connection.connectionId}
              {...(interactive
                ? {
                    type: "button",
                    onClick: () => onSelectRoom(connection.targetRoomId),
                    "aria-label": `Open Room ${formatRoomNumber(connection.targetRoomNumber)} ${connection.targetRoomName || ""}`.trim(),
                  }
                : {})}
            >
              <b>{formatRoomNumber(connection.targetRoomNumber)}</b>
              <span className="location-output-connection__destination">
                <strong>{connection.targetRoomName || "Connected room"}</strong>
                <small>{kind}</small>
              </span>
              <span className="location-output-connection__flags">
                {connection.locked ? <em><i className="fa-solid fa-lock" aria-hidden="true" /> Locked</em> : null}
                {transition ? <em><i className="fa-solid fa-stairs" aria-hidden="true" /> {transition}</em> : null}
                {interactive ? <i className="fa-solid fa-arrow-right" aria-hidden="true" /> : null}
              </span>
            </Tag>
          );
        })}
      </div>
    </ToolFeatureBlock>
  );
}

export function LocationRoomOutput({
  room,
  generatedMap,
  exportSettings,
  onCopyText,
  onEditRoom,
  onSelectRoom,
}) {
  if (!room) return null;
  const roomPreviewRegion = findGeneratedRoomRegion(generatedMap, room);

  return (
    <ToolContentPanel
      className="location-output-room"
      data-testid="dark-places-output-room"
      eyebrow={`Room ${formatRoomNumber(room.number)}`}
      title={room.name}
      summary={[room.role, formatLevel(room.level), room.shape].filter(Boolean).join(" · ")}
      headerClassName="location-output-room__header"
      headerSupplement={roomPreviewRegion ? (
        <LocationRoomPreview
          room={room}
          region={roomPreviewRegion}
          generatedMap={generatedMap}
          exportSettings={exportSettings}
        />
      ) : null}
      actionsLabel={`${room.name} actions`}
      actions={(
        <ToolButton icon="fa-pen" onClick={() => onEditRoom?.(room.id)}>
          Edit Room
        </ToolButton>
      )}
    >
      <ReadAloudSection room={room} onCopyText={onCopyText} />
      <ImmediateImpressions room={room} />
      <SemanticBlockSection blocks={room.hazards} kind="hazard" />
      <SemanticBlockSection blocks={room.clues} kind="clue" />
      <SemanticBlockSection blocks={room.encounterTwists} kind="encounterTwist" />
      <SemanticBlockSection blocks={room.secrets} kind="secret" />
      <SemanticBlockSection blocks={room.rewards} kind="reward" />
      <RoomConnectionList connections={room.connections} onSelectRoom={onSelectRoom} />
    </ToolContentPanel>
  );
}
