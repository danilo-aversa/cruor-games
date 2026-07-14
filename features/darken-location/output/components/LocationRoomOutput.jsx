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
    <section className={cx("location-output-section", `location-output-section--${kind}`, config?.className)}>
      <header className="location-output-section__head">
        <i className={`fa-solid ${config?.icon || "fa-diamond"}`} aria-hidden="true" />
        <h3 className="cruor-composer-collapsible-section__title">{config?.title || formatFieldKey(kind)}</h3>
      </header>
      <div className="location-output-semantic-list">
        {entries.map((block) => (
          <SemanticBlockCard block={block} kind={kind} key={block.id} />
        ))}
      </div>
    </section>
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
    <section className="location-output-section location-output-section--impressions">
      <header className="location-output-section__head">
        <i className="fa-solid fa-location-dot" aria-hidden="true" />
        <h3 className="cruor-composer-collapsible-section__title">Immediate Impressions</h3>
      </header>
      <div className="location-output-impression-grid">
        {groups.map((group) => (
          <section className="location-output-impression-group" key={group.id}>
            <header>
              <i className={`fa-solid ${group.icon}`} aria-hidden="true" />
              <h4 className="cruor-composer-collapsible-section__title">{group.title}</h4>
            </header>
            {asArray(group.blocks).map((block) => (
              <SemanticBlockCard block={block} kind={group.id} compact key={block.id} />
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

function ReadAloudSection({ room, onCopyText }) {
  const entries = asArray(room?.readAloud);
  if (!entries.length) return null;

  return (
    <blockquote className="location-output-readaloud">
      <header>
        <div>
          <i className="fa-solid fa-quote-left" aria-hidden="true" />
          <h3 className="cruor-composer-collapsible-section__title">Read Aloud</h3>
        </div>
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
      </header>
      {entries.map((block) => <p key={block.id}>{block.text}</p>)}
    </blockquote>
  );
}

function getConnectionTransition(connection) {
  if (!connection?.crossLevel) return "";
  const delta = Number(connection.levelDelta || 0);
  const direction = delta > 0 ? "Up" : delta < 0 ? "Down" : "Level change";
  const distance = Math.max(1, Math.abs(delta || 1));
  return `${direction} ${distance} level${distance === 1 ? "" : "s"}`;
}

function RoomConnectionList({ connections, onSelectRoom }) {
  const entries = asArray(connections);
  if (!entries.length) return null;

  return (
    <section className="location-output-section location-output-section--connections">
      <header className="location-output-section__head">
        <i className="fa-solid fa-route" aria-hidden="true" />
        <h3 className="cruor-composer-collapsible-section__title">Exits</h3>
      </header>
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
    </section>
  );
}

export function LocationRoomOutput({
  room,
  onCopyText,
  onEditRoom,
  onSelectRoom,
}) {
  if (!room) return null;

  return (
    <article className="location-output-room" data-testid="dark-places-output-room">
      <header className="location-output-room__head">
        <div className="location-output-room__number">{formatRoomNumber(room.number)}</div>
        <div>
          <span className="cruor-composer-collapsible-section__title">Room {formatRoomNumber(room.number)}</span>
          <h2>{room.name}</h2>
          <p>{[room.role, formatLevel(room.level), room.shape].filter(Boolean).join(" · ")}</p>
        </div>
        <button
          className="location-output-quiet-action cruor-composer-control"
          type="button"
          onClick={() => onEditRoom?.(room.id)}
        >
          <i className="fa-solid fa-pen" aria-hidden="true" />
          <span>Edit Room</span>
        </button>
      </header>

      {room.readiness?.missingSlotLabels?.length ? (
        <button
          className="location-output-room__missing cruor-composer-control"
          type="button"
          onClick={() => onEditRoom?.(room.id)}
        >
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>Missing {room.readiness.missingSlotLabels.join(", ")}</span>
        </button>
      ) : null}

      <ReadAloudSection room={room} onCopyText={onCopyText} />
      <ImmediateImpressions room={room} />
      <SemanticBlockSection blocks={room.hazards} kind="hazard" />
      <SemanticBlockSection blocks={room.clues} kind="clue" />
      <SemanticBlockSection blocks={room.encounterTwists} kind="encounterTwist" />
      <SemanticBlockSection blocks={room.secrets} kind="secret" />
      <SemanticBlockSection blocks={room.rewards} kind="reward" />
      <RoomConnectionList connections={room.connections} onSelectRoom={onSelectRoom} />
    </article>
  );
}
