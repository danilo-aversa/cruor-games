function normalizeText(value) {
  if (value == null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).replace(/\s+/g, " ").trim();
  }
  if (typeof value === "boolean") return value ? "Yes" : "";
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }
  if (typeof value === "object") {
    const preferredKeys = [
      "compact",
      "short",
      "extended",
      "long",
      "text",
      "summary",
      "description",
      "read",
      "readAloud",
      "label",
      "name",
      "value",
    ];
    for (const key of preferredKeys) {
      const normalized = normalizeText(value[key]);
      if (normalized) return normalized;
    }
    return Object.values(value).map(normalizeText).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }
  return "";
}

function pickText(...values) {
  return values.map(normalizeText).find(Boolean) || "";
}

function getAssignedSlotText(components, slotId) {
  const component = components.find(
    (item) => item.assignment?.slotId === slotId,
  );
  return pickText(component?.summary, component?.description, component?.text, component?.effect, component?.title, component?.name);
}

function getRoomIcon(region, generatedRoom) {
  const text = [region?.role, generatedRoom?.role, generatedRoom?.kind, generatedRoom?.type, generatedRoom?.shape, region?.name, generatedRoom?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("corridor") || text.includes("connector")) return "fa-route";
  if (text.includes("entrance") || text.includes("threshold")) return "fa-door-open";
  if (text.includes("clue")) return "fa-magnifying-glass";
  if (text.includes("hazard") || text.includes("danger")) return "fa-triangle-exclamation";
  if (text.includes("shaft") || text.includes("vertical")) return "fa-arrow-down-up-across-line";
  return "fa-dungeon";
}

function Fact({ label, value }) {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue) return null;

  return (
    <div className="region-fact-list__item">
      <dt>{label}</dt>
      <dd>{normalizedValue}</dd>
    </div>
  );
}

export function LocationRoomRecapCard({ activeRegion, assignedComponents = [], generatedRoom, surfaceLabel }) {
  if (!activeRegion && !generatedRoom) return null;

  const title = pickText(generatedRoom?.name, activeRegion?.name, "Selected Region");
  const meta = [
    activeRegion?.role || generatedRoom?.role || "Region",
    generatedRoom ? "generated room" : "location region",
    activeRegion?.size || generatedRoom?.size || "",
    surfaceLabel || "",
  ].filter(Boolean).join(" · ");

  const read = pickText(
    generatedRoom?.readAloud,
    generatedRoom?.read,
    generatedRoom?.description,
    activeRegion?.readAloud,
    activeRegion?.summary,
    activeRegion?.description,
    assignedComponents[0]?.summary,
    assignedComponents[0]?.description,
    assignedComponents[0]?.title,
    "Select a slot option to define what the party notices here.",
  );

  const hazard = getAssignedSlotText(assignedComponents, "hazard");
  const clue = getAssignedSlotText(assignedComponents, "clue");
  const encounterTwist = getAssignedSlotText(
    assignedComponents,
    "encounterTwist",
  );

  return (
    <article className="cruor-tooltip cruor-tooltip--room region-card cruor-tooltip-region-card location-room-recap-card" aria-label="Selected room recap">
      <div className="region-card__top">
        <div className="region-card__title">
          <i className={`fa-solid ${getRoomIcon(activeRegion, generatedRoom)}`} aria-hidden="true" />
          <div>
            <h3>{title}</h3>
            <div className="region-card__meta">{meta}</div>
          </div>
        </div>
      </div>

      {read ? <p className="region-card__read">{read}</p> : null}

      {(hazard || clue || encounterTwist) ? (
        <dl className="region-fact-list">
          <Fact label="Environmental Hazard" value={hazard} />
          <Fact label="Disturbing Clue" value={clue} />
          <Fact label="Encounter Twist" value={encounterTwist} />
        </dl>
      ) : null}
    </article>
  );
}
