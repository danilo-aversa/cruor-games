import { useMemo, useState } from "react";
import { Plus, Repeat, SlidersHorizontal, X } from "lucide-react";
import { LOCATION_SLOT_SCOPE_REGION, normalizeLocationSlotScope } from "../model/location-composer-state.js";
import {
  getLocationRoomSlotContext,
  getLocationRoomSlotMatchProfile,
  scoreComponentForLocationRoomSlot,
} from "../model/location-room-slot-matching.js";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getComponentKey(component) {
  return component?.id || component?.title || component?.name || "component";
}

function getComponentTitle(component) {
  return component?.title || component?.name || "Untitled Component";
}

function getComponentSummary(component) {
  return component?.summary || component?.description || component?.text || component?.effect || "";
}

function getComponentMapInfluence(component = {}) {
  return component?.mapInfluence || component?.location?.mapInfluence || component?.locationRegion?.mapInfluence || component?.map?.mapInfluence || null;
}

function getMapInfluenceArchetypes(influence = null) {
  if (!influence || typeof influence !== "object") return [];
  return [
    influence.roomArchetype,
    influence.roomArchetypeId,
    influence.forcedRoomArchetype,
    influence.forcedRoomArchetypeId,
    ...toArray(influence.preferredRoomArchetypes),
    ...toArray(influence.preferredRoomArchetypeIds),
  ].filter(Boolean);
}

function getMapInfluenceForbiddenArchetypes(influence = null) {
  if (!influence || typeof influence !== "object") return [];
  return [
    influence.forbiddenRoomArchetype,
    influence.forbiddenRoomArchetypeId,
    ...toArray(influence.forbiddenRoomArchetypes),
    ...toArray(influence.forbiddenRoomArchetypeIds),
  ].filter(Boolean);
}

function getMapInfluenceLabel(influence = null) {
  const archetype = getMapInfluenceArchetypes(influence)[0];
  if (!archetype) return "";
  const forced = isForcedMapInfluence(influence);
  return `${forced ? "Forces" : "Suggests"} ${formatLocationMetaToken(archetype)}`;
}

function isForcedMapInfluence(influence = null) {
  return Boolean(
    influence?.forceRoomArchetype ||
      influence?.force ||
      influence?.required ||
      influence?.forcedRoomArchetype ||
      influence?.forcedRoomArchetypeId,
  );
}

function getMapInfluencePrimaryArchetype(influence = null) {
  return getMapInfluenceArchetypes(influence)[0] || "";
}

function getMapInfluencePreviewText(influence = null, regionScoped = false) {
  const archetype = getMapInfluencePrimaryArchetype(influence);
  if (!archetype) return "";
  const verb = isForcedMapInfluence(influence) ? "will force" : "can suggest";
  const target = regionScoped ? "this room" : "a room";
  return `Map preview: adding this ${verb} ${formatLocationMetaToken(archetype)} for ${target}.`;
}

function getTargetRoomLabel(activeRegion = null, generatedRoom = null) {
  return activeRegion?.name || activeRegion?.label || generatedRoom?.name || generatedRoom?.label || "Selected room";
}

function getTargetRoomArchetypeLabel(activeRegion = null, generatedRoom = null) {
  const resolution = generatedRoom?.roomArchetypeResolution || {};
  const label =
    resolution.resolvedRoomArchetypeLabel ||
    generatedRoom?.roomArchetypeLabel ||
    activeRegion?.roomArchetypeLabel ||
    activeRegion?.locationRegion?.roomArchetypeLabel ||
    "";
  const id =
    resolution.resolvedRoomArchetype ||
    generatedRoom?.roomArchetype ||
    activeRegion?.roomArchetype ||
    activeRegion?.roomArchetypeId ||
    activeRegion?.locationRegion?.roomArchetype ||
    activeRegion?.map?.roomArchetype ||
    "";
  return label || (id ? formatLocationMetaToken(id) : "Auto");
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeTokens(values) {
  return new Set(
    toArray(values)
      .map(normalizeToken)
      .filter(Boolean)
      .filter((value) => value !== "any" && value !== "any source"),
  );
}

function intersects(a, b) {
  if (!a?.size || !b?.size) return false;
  for (const value of a) {
    if (b.has(value)) return true;
  }
  return false;
}

function countIntersections(a, b) {
  if (!a?.size || !b?.size) return 0;
  let count = 0;
  for (const value of a) {
    if (b.has(value)) count += 1;
  }
  return count;
}

function addReason(reasons, label) {
  if (!label || reasons.includes(label)) return;
  reasons.push(label);
}

function getComponentTextTokens(component) {
  return normalizeTokens([
    component?.id,
    component?.title,
    component?.name,
    component?.type,
    component?.summary,
    component?.description,
    component?.text,
    component?.effect,
    component?.tableText,
    component?.mechanics,
    component?.narrative,
    ...(Array.isArray(component?.tags) ? component.tags : []),
    ...(Array.isArray(component?.motifs) ? component.motifs : []),
    ...getMapInfluenceArchetypes(getComponentMapInfluence(component)),
    ...getMapInfluenceForbiddenArchetypes(getComponentMapInfluence(component)),
  ]);
}

function getRegionDecisionTokens(activeRegion, generatedRoom) {
  return normalizeTokens([
    activeRegion?.id,
    activeRegion?.name,
    activeRegion?.label,
    activeRegion?.role,
    activeRegion?.type,
    activeRegion?.roomType,
    activeRegion?.size,
    activeRegion?.shape,
    activeRegion?.feature,
    activeRegion?.danger,
    activeRegion?.secret,
    generatedRoom?.id,
    generatedRoom?.name,
    generatedRoom?.label,
    generatedRoom?.role,
    generatedRoom?.type,
    generatedRoom?.roomType,
    activeRegion?.roomArchetype,
    activeRegion?.roomArchetypeId,
    activeRegion?.locationRegion?.roomArchetype,
    activeRegion?.map?.roomArchetype,
    generatedRoom?.roomArchetype,
    generatedRoom?.roomArchetypeLabel,
    generatedRoom?.roomArchetypeResolution?.resolvedRoomArchetype,
    generatedRoom?.roomArchetypeResolution?.resolvedRoomArchetypeLabel,
    ...(Array.isArray(activeRegion?.tags) ? activeRegion.tags : []),
    ...(Array.isArray(activeRegion?.links) ? activeRegion.links : []),
    ...(Array.isArray(generatedRoom?.tags) ? generatedRoom.tags : []),
  ]);
}

function getSelectedBuildTokens(selectedComponents) {
  return normalizeTokens(
    toArray(selectedComponents).flatMap((component) => [
      component?.id,
      component?.title,
      component?.name,
      component?.type,
      ...(Array.isArray(component?.sourceAnchors) ? component.sourceAnchors : []),
      ...(Array.isArray(component?.horror) ? component.horror : []),
      ...(Array.isArray(component?.motifs) ? component.motifs : []),
      ...(Array.isArray(component?.tags) ? component.tags : []),
    ]),
  );
}

function getStateDecisionProfile({ activeRegion, generatedRoom, selectedComponents, slot, state }) {
  const contextTokens = normalizeTokens([
    state?.context,
    state?.mapType,
    activeRegion?.context,
    activeRegion?.type,
    generatedRoom?.context,
    generatedRoom?.type,
    ...(Array.isArray(activeRegion?.contexts) ? activeRegion.contexts : []),
    ...(Array.isArray(generatedRoom?.contexts) ? generatedRoom.contexts : []),
  ]);
  const horrorTokens = normalizeTokens([
    state?.horror,
    ...(Array.isArray(state?.horrors) ? state.horrors : []),
    ...(Array.isArray(activeRegion?.horror) ? activeRegion.horror : []),
    ...(Array.isArray(generatedRoom?.horror) ? generatedRoom.horror : []),
  ]);
  const sourceTokens = normalizeTokens([
    ...(Array.isArray(state?.sourceAnchors) ? state.sourceAnchors : []),
    ...(Array.isArray(activeRegion?.sourceAnchors) ? activeRegion.sourceAnchors : []),
    ...(Array.isArray(generatedRoom?.sourceAnchors) ? generatedRoom.sourceAnchors : []),
  ]);
  const roomArchetypeTokens = normalizeTokens([
    activeRegion?.roomArchetype,
    activeRegion?.roomArchetypeId,
    activeRegion?.locationRegion?.roomArchetype,
    activeRegion?.map?.roomArchetype,
    generatedRoom?.roomArchetype,
    generatedRoom?.roomArchetypeLabel,
    generatedRoom?.roomArchetypeResolution?.resolvedRoomArchetype,
    generatedRoom?.roomArchetypeResolution?.resolvedRoomArchetypeLabel,
  ]);

  return {
    buildTokens: getSelectedBuildTokens(selectedComponents),
    contextTokens,
    horrorTokens,
    regionTokens: getRegionDecisionTokens(activeRegion, generatedRoom),
    roomArchetypeTokens,
    slotId: slot?.id || "",
    slotLabel: slot?.label || "",
    sourceTokens,
  };
}

function scoreLocationComponentDecision(component, profile, options = {}) {
  const reasons = [];
  let score = 0;

  const componentSlots = normalizeTokens(component?.slots);
  const componentContexts = normalizeTokens(component?.contexts);
  const componentHorror = normalizeTokens(component?.horror);
  const componentSources = normalizeTokens(component?.sourceAnchors);
  const componentMotifs = normalizeTokens(component?.motifs);
  const componentTags = normalizeTokens(component?.tags);
  const componentPairs = normalizeTokens([
    ...(Array.isArray(component?.pairsWellWith) ? component.pairsWellWith : []),
    ...(Array.isArray(component?.pairWith) ? component.pairWith : []),
  ]);
  const componentTextTokens = getComponentTextTokens(component);
  const slotTokens = normalizeTokens([profile.slotId, profile.slotLabel]);
  const slotMatch = options.slotMatchProfile
    ? scoreComponentForLocationRoomSlot(component, {
        id: options.slotMatchProfile.id,
        label: options.slotMatchProfile.label,
      })
    : { reasons: [], score: 0 };

  if (slotMatch.score) {
    score += slotMatch.score;
    slotMatch.reasons.forEach((reason) => addReason(reasons, reason));
  }

  if (intersects(componentSlots, slotTokens)) {
    score += 34;
    addReason(reasons, `Fits ${profile.slotLabel || "slot"}`);
  }

  const sourceMatches = countIntersections(componentSources, profile.sourceTokens);
  if (sourceMatches) {
    score += 28 + sourceMatches * 4;
    addReason(reasons, "Matches source");
  }

  const horrorMatches = countIntersections(componentHorror, profile.horrorTokens);
  if (horrorMatches) {
    score += 22 + horrorMatches * 3;
    addReason(reasons, "Supports horror");
  }

  const contextMatches = countIntersections(componentContexts, profile.contextTokens);
  if (contextMatches) {
    score += 20 + contextMatches * 3;
    addReason(reasons, "Fits context");
  }

  const regionMatches =
    countIntersections(componentContexts, profile.regionTokens) +
    countIntersections(componentMotifs, profile.regionTokens) +
    countIntersections(componentTags, profile.regionTokens) +
    countIntersections(componentTextTokens, profile.regionTokens);
  if (options.regionScoped && regionMatches) {
    score += 18 + Math.min(18, regionMatches * 3);
    addReason(reasons, "Fits selected room");
  }

  const mapInfluence = getComponentMapInfluence(component);
  const mapInfluenceArchetypeTokens = normalizeTokens(getMapInfluenceArchetypes(mapInfluence));
  const mapInfluenceMatches = countIntersections(mapInfluenceArchetypeTokens, profile.roomArchetypeTokens);
  if (options.regionScoped && mapInfluenceMatches) {
    score += 24 + Math.min(18, mapInfluenceMatches * 6);
    addReason(reasons, "Shapes selected room");
  } else if (options.regionScoped && mapInfluenceArchetypeTokens.size) {
    score += 8;
    addReason(reasons, "Guides map shape");
  }

  if (!options.activeSlotFilled) {
    score += 12;
    addReason(reasons, "Fills empty slot");
  }

  const buildMatches =
    countIntersections(componentPairs, profile.buildTokens) +
    countIntersections(componentMotifs, profile.buildTokens) +
    countIntersections(componentTags, profile.buildTokens) +
    countIntersections(componentSources, profile.buildTokens);
  if (buildMatches) {
    score += 10 + Math.min(12, buildMatches * 3);
    addReason(reasons, "Pairs with build");
  }

  if (options.selected) {
    score += 1000;
    addReason(reasons, "Assigned");
  }

  if (!reasons.length) {
    score += 1;
    addReason(reasons, "Compatible");
  }

  return {
    component,
    reasons: reasons.slice(0, 4),
    score,
  };
}


function formatLocationMetaToken(value) {
  return String(value || "")
    .replace(/^source:/, "")
    .replace(/^context:/, "")
    .replace(/^slot:/, "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getContentPackTitle(component) {
  return component?.contentPack?.title || component?.registry?.packTitle || "Location Content";
}

function getPrimarySourceId(component) {
  return toArray(component?.sourceAnchors)[0] || toArray(component?.sources)[0] || component?.source || "";
}

function getPrimarySourceLabel(component) {
  const source = getPrimarySourceId(component) || "Unassigned";
  return formatLocationMetaToken(source);
}

function getLocationMetaValues(component, field, fallback = []) {
  const values = toArray(component?.[field]);
  return values.length ? values : toArray(fallback);
}

function getDecisionReasonLabels(decision, slot, regionScoped) {
  const labels = Array.isArray(decision?.reasons) ? decision.reasons.filter(Boolean) : [];
  if (labels.length) return labels.slice(0, 4);

  const fallback = [];
  if (slot?.label) fallback.push(slot.label);
  fallback.push(regionScoped ? "Region" : "Map");
  return fallback.slice(0, 3);
}


function titleCaseLocation(value) {
  return formatLocationMetaToken(value);
}

function signedDelta(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function hasDelta(value) {
  return Number(value || 0) !== 0;
}

function scoreTextScale(value, fallback = 1) {
  const token = normalizeToken(value);
  if (!token) return fallback;
  if (["none", "no", "low", "minor", "quiet"].includes(token)) return token === "none" || token === "no" ? 0 : 1;
  if (["medium", "moderate", "standard"].includes(token)) return 2;
  if (["high", "major", "severe", "extreme"].includes(token)) return 4;
  return fallback;
}

function getLocationComponentImpact(component, decision) {
  const slot = normalizeToken(component?.location?.slot || toArray(component?.slots)[0] || component?.type);
  const intrusion = scoreTextScale(component?.location?.intrusion || component?.intrusion, 1);
  const prep = scoreTextScale(component?.location?.prep || component?.prep, 1);
  const isHazard = slot.includes("hazard") || normalizeToken(component?.type).includes("hazard");
  const isTwist = slot.includes("twist") || slot.includes("anomaly") || normalizeToken(component?.type).includes("trap");
  const hasMechanics = Boolean(component?.mechanics || component?.rules || component?.location?.rules);
  const pressureDelta = Math.min(4, Math.max(0, intrusion + (isHazard ? 1 : 0) + (isTwist ? 1 : 0)));
  const complexityDelta = Math.min(4, Math.max(0, prep + (hasMechanics ? 1 : 0) + (component?.location?.gmFacingOnly ? 1 : 0)));
  const warningsAdded = pressureDelta >= 4 || complexityDelta >= 4 ? 1 : 0;
  let counterplay = "";
  if (component?.mechanics || component?.location?.rules || isHazard) counterplay = "Needs Tell";
  if (component?.location?.tableRole === "read-aloud" && !isHazard) counterplay = "Improves";
  if (component?.location?.gmFacingOnly) counterplay = "Worsens";

  return {
    pressureDelta,
    complexityDelta,
    counterplay,
    warningsAdded,
    matchScore: Math.round(decision?.score || 0),
  };
}

function getLocationCompatibility(component, impact, decision, selected) {
  if (selected) return null;
  if (impact?.pressureDelta >= 4 || impact?.complexityDelta >= 4 || component?.location?.gmFacingOnly) {
    return {
      kind: "soft",
      label: "Soft Warning",
      message: "Use when the selected room can carry the added pressure or prep.",
    };
  }
  if ((decision?.score || 0) > 0 && (decision?.score || 0) < 42) {
    return {
      kind: "soft",
      label: "Soft Warning",
      message: "Compatible, but not one of the strongest matches for this slot.",
    };
  }
  return null;
}

function ImpactMetaRows({ impact }) {
  return (
    <>
      {hasDelta(impact?.pressureDelta) ? (
        <div className="meta-row">
          <span className="meta-label">Pressure</span>
          <span className="meta-values">
            <span className="meta-value strong-chip">{signedDelta(impact.pressureDelta)}</span>
          </span>
        </div>
      ) : null}
      {hasDelta(impact?.complexityDelta) ? (
        <div className="meta-row">
          <span className="meta-label">Complexity</span>
          <span className="meta-values">
            <span className="meta-value strong-chip">{signedDelta(impact.complexityDelta)}</span>
          </span>
        </div>
      ) : null}
      {impact?.warningsAdded > 0 ? (
        <div className="meta-row">
          <span className="meta-label">Warnings</span>
          <span className="meta-values">
            <span className="meta-value danger-chip">
              Adds {impact.warningsAdded} warning{impact.warningsAdded === 1 ? "" : "s"}
            </span>
          </span>
        </div>
      ) : null}
    </>
  );
}

function MetaValues({ values, chipClass = "", formatter = titleCaseLocation }) {
  const list = toArray(values).filter(Boolean);
  if (!list.length) return null;
  return (
    <span className="meta-values">
      {list.map((value, index) => (
        <span className={cx("meta-value", chipClass)} key={`${String(value)}-${index}`}>
          {formatter(value)}
        </span>
      ))}
    </span>
  );
}

function LocationComponentCard({
  component,
  decision,
  isSlotFull,
  onAddComponent,
  onRemoveComponent,
  regionScoped,
  selected,
  slot,
  tier = "matching",
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const impact = getLocationComponentImpact(component, decision);
  const compatibility = getLocationCompatibility(component, impact, decision, selected);
  const replaceAction = isSlotFull && !selected;
  const actionLabel = selected ? "Added" : replaceAction ? "Replace" : "Add";
  const ActionIcon = selected ? X : replaceAction ? Repeat : Plus;
  const decisionTier = selected ? "assigned" : "risky";
  const mechanicText = component?.mechanics || component?.rules || component?.location?.rules || "";
  const narrativeText = component?.narrative || component?.gmNote || component?.location?.note || "";
  const tableText = component?.tableText || component?.text || "";
  const slotValues = toArray(component?.location?.slots || component?.slots || component?.location?.slot || slot?.id);
  const tagValues = toArray(component?.tags);
  const motifValues = toArray(component?.motifs);
  const contextValues = toArray(component?.contexts);
  const horrorValues = toArray(component?.horror);
  const sourceTypeValues = toArray(component?.sourceTypes || component?.sourceType);
  const mapInfluence = getComponentMapInfluence(component);
  const mapInfluenceLabel = getMapInfluenceLabel(mapInfluence);
  const mapInfluenceArchetypes = getMapInfluenceArchetypes(mapInfluence);
  const forbiddenArchetypes = getMapInfluenceForbiddenArchetypes(mapInfluence);
  const mapInfluencePrimaryArchetype = getMapInfluencePrimaryArchetype(mapInfluence);
  const mapInfluencePreviewText = getMapInfluencePreviewText(mapInfluence, regionScoped);
  const mapInfluenceMode = mapInfluenceLabel ? (isForcedMapInfluence(mapInfluence) ? "forced" : "suggested") : "none";
  const compatibilityReasons = getDecisionReasonLabels(decision, slot, regionScoped);

  return (
    <article
      className={cx(
        "component-card",
        selected && "in-build",
        selected && "is-active",
        replaceAction && "slot-full",
        detailsOpen && "details-open",
        compatibility?.kind && `compatibility-${compatibility.kind}`,
      )}
      data-decision-tier={decisionTier}
      data-map-influence={mapInfluenceLabel ? "true" : "false"}
      data-map-influence-mode={mapInfluenceMode}
      data-map-influence-target={mapInfluencePrimaryArchetype}
      data-testid="dark-places-component-card"
      draggable={!selected}
      key={getComponentKey(component)}
    >
      <button
        className="component-toggle-btn"
        type="button"
        aria-label={selected ? `${getComponentTitle(component)} already assigned` : `${actionLabel} ${getComponentTitle(component)}`}
        data-testid={selected ? "dark-places-component-remove" : "dark-places-component-add"}
        disabled={selected}
        onClick={() => (selected ? onRemoveComponent?.(component.id) : onAddComponent?.(component))}
      >
        <ActionIcon aria-hidden="true" />
        <span>{actionLabel}</span>
      </button>

      <div className="card-top">
        <div className="component-title-stack">
          <h3>{getComponentTitle(component)}</h3>
        </div>
        {compatibility ? <span className={`compatibility-badge ${compatibility.kind}`}>{compatibility.label}</span> : null}
      </div>

      {getComponentSummary(component) ? <p className="summary">{getComponentSummary(component)}</p> : null}
      {mapInfluencePreviewText ? <p className="compatibility-note" data-map-influence-preview="true">{mapInfluencePreviewText}</p> : null}
      {replaceAction ? <p className="compatibility-note">This slot is full. Remove a component first.</p> : null}

      <div
        className="component-details"
        onPointerEnter={() => setDetailsOpen(true)}
        onPointerLeave={() => setDetailsOpen(false)}
        onFocus={() => setDetailsOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setDetailsOpen(false);
          }
        }}
      >
        <button
          className="component-details__trigger"
          type="button"
          aria-expanded={detailsOpen}
          aria-haspopup="dialog"
        >
          Details
        </button>
        <div className="meta-list component-details__panel" aria-label="Component metadata">
          <div className="meta-row">
            <span className="meta-label">Inspiration</span>
            <span className="meta-values">
              <span className="meta-value source-chip">{getPrimarySourceLabel(component)}</span>
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Content Pack</span>
            <span className="meta-values">
              <span className="meta-value pack-chip">{getContentPackTitle(component)}</span>
              {component?.contentPack?.id ? <span className="meta-value">Source: {titleCaseLocation(component.contentPack.id)}</span> : null}
            </span>
          </div>
          <ImpactMetaRows impact={impact} />
          {mapInfluenceLabel || mapInfluenceArchetypes.length || forbiddenArchetypes.length ? (
            <div className="meta-row">
              <span className="meta-label">Map Influence</span>
              <span className="meta-values">
                {mapInfluenceLabel ? <span className="meta-value strong-chip">{mapInfluenceLabel}</span> : null}
                {mapInfluence?.weight ? <span className="meta-value">Weight {mapInfluence.weight}</span> : null}
                {forbiddenArchetypes.length ? <span className="meta-value danger-chip">Avoids {forbiddenArchetypes.map(formatLocationMetaToken).join(", ")}</span> : null}
              </span>
            </div>
          ) : null}
          {compatibility || compatibilityReasons.length ? (
            <div className="meta-row">
              <span className="meta-label">Compatibility</span>
              <span className="meta-values">
                {compatibility ? (
                  <span className="meta-value danger-chip">
                    {compatibility.label}: {compatibility.message}
                  </span>
                ) : null}
                {compatibilityReasons.map((reason) => (
                  <span className="meta-value" key={`reason-${reason}`}>{reason}</span>
                ))}
              </span>
            </div>
          ) : null}
          <div className="meta-row">
            <span className="meta-label">Slot</span>
            <span className="meta-values">
              <span className="meta-value strong-chip">{titleCaseLocation(component?.location?.slot || slot?.label || slot?.id)}</span>
              {component?.location?.outputSection ? <span className="meta-value">{component.location.outputSection}</span> : null}
            </span>
          </div>
          {tagValues.length ? (
            <div className="meta-row">
              <span className="meta-label">Tags</span>
              <MetaValues values={tagValues} />
            </div>
          ) : null}
          {contextValues.length ? (
            <div className="meta-row">
              <span className="meta-label">Contexts</span>
              <MetaValues values={contextValues} />
            </div>
          ) : null}
          {horrorValues.length ? (
            <div className="meta-row">
              <span className="meta-label">Horror</span>
              <MetaValues values={horrorValues} />
            </div>
          ) : null}
          {motifValues.length ? (
            <div className="meta-row">
              <span className="meta-label">Motifs</span>
              <MetaValues values={motifValues} />
            </div>
          ) : null}
          {sourceTypeValues.length ? (
            <div className="meta-row">
              <span className="meta-label">Sources</span>
              <MetaValues values={sourceTypeValues} />
            </div>
          ) : null}
          {slotValues.length > 1 ? (
            <div className="meta-row">
              <span className="meta-label">Locks</span>
              <MetaValues values={slotValues.map((value) => `Wants ${titleCaseLocation(value)}`)} />
            </div>
          ) : null}
          {mechanicText ? (
            <div className="meta-row">
              <span className="meta-label">Rules</span>
              <span className="meta-values"><span className="meta-value danger-chip">{mechanicText}</span></span>
            </div>
          ) : null}
          {tableText ? (
            <div className="meta-row">
              <span className="meta-label">Table</span>
              <span className="meta-values"><span className="meta-value">{tableText}</span></span>
            </div>
          ) : null}
          {narrativeText ? (
            <div className="meta-row">
              <span className="meta-label">Notes</span>
              <span className="meta-values"><span className="meta-value">{narrativeText}</span></span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function LocationComponentPickerModal({
  activeRegion,
  assignedComponents = [],
  components = [],
  generatedRoom,
  isSlotFull,
  onAddComponent,
  onClose,
  onRemoveComponent,
  open,
  selectedComponents = [],
  slot,
  slotScope = "map",
  state,
}) {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sourceFilterIds, setSourceFilterIds] = useState([]);
  const [packFilter, setPackFilter] = useState("all");
  const [pickFilter, setPickFilter] = useState("all");
  const normalizedScope = normalizeLocationSlotScope(slotScope);
  const regionScoped = normalizedScope === LOCATION_SLOT_SCOPE_REGION;
  const slotMatchProfile = regionScoped ? getLocationRoomSlotMatchProfile(slot?.id) : null;
  const slotContext = useMemo(
    () => getLocationRoomSlotContext({ activeRegion, generatedRoom, slot, state }),
    [activeRegion, generatedRoom, slot, state],
  );

  const assignedIds = useMemo(
    () => new Set(assignedComponents.map((component) => component.id).filter(Boolean)),
    [assignedComponents],
  );

  const sourceOptions = useMemo(() => {
    const options = new Map();
    components.forEach((component) => {
      const packTitle = getContentPackTitle(component);
      toArray(component?.sourceAnchors || component?.sources).forEach((sourceId) => {
        if (!sourceId) return;
        if (!options.has(sourceId)) {
          options.set(sourceId, {
            count: 0,
            id: sourceId,
            label: formatLocationMetaToken(sourceId),
            packTitles: new Set(),
          });
        }
        const entry = options.get(sourceId);
        entry.count += 1;
        if (packTitle) entry.packTitles.add(packTitle);
      });
    });
    return [...options.values()]
      .map((entry) => ({
        ...entry,
        meta: entry.packTitles.size
          ? [...entry.packTitles].slice(0, 2).join(", ")
          : `${entry.count} component${entry.count === 1 ? "" : "s"}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [components]);

  const packOptions = useMemo(() => {
    const options = new Map();
    components.forEach((component) => {
      const id = component?.contentPack?.id || component?.registry?.packId || component?.packId || "";
      if (!id || options.has(id)) return;
      options.set(id, { id, title: getContentPackTitle(component) });
    });
    return [
      { id: "all", title: "All Content Packs" },
      ...[...options.values()].sort((a, b) => a.title.localeCompare(b.title)),
    ];
  }, [components]);

  const activeSourceFilterSet = useMemo(() => new Set(sourceFilterIds), [sourceFilterIds]);
  const hasSearch = Boolean(search.trim());
  const hasSourceFilter = sourceFilterIds.length > 0;
  const hasActiveFilters = hasSearch || packFilter !== "all" || pickFilter !== "all" || hasSourceFilter;

  const visibleComponents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return components.filter((component) => {
      if (packFilter !== "all") {
        const componentPackId = component?.contentPack?.id || component?.registry?.packId || component?.packId || "";
        if (componentPackId !== packFilter) return false;
      }

      if (activeSourceFilterSet.has("__none__")) return false;
      if (activeSourceFilterSet.size) {
        const componentSources = toArray(component?.sourceAnchors || component?.sources);
        if (!componentSources.some((sourceId) => activeSourceFilterSet.has(sourceId))) return false;
      }

      if (!query) return true;

      const haystack = [
        component.title,
        component.name,
        component.type,
        component.summary,
        component.description,
        component.text,
        component.tableText,
        component.mechanics,
        ...(Array.isArray(component.contexts) ? component.contexts : []),
        ...(Array.isArray(component.horror) ? component.horror : []),
        ...(Array.isArray(component.sourceAnchors) ? component.sourceAnchors : []),
        ...(Array.isArray(component.motifs) ? component.motifs : []),
        ...getMapInfluenceArchetypes(getComponentMapInfluence(component)),
        ...getMapInfluenceForbiddenArchetypes(getComponentMapInfluence(component)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [activeSourceFilterSet, components, packFilter, search]);

  const decisionProfile = useMemo(
    () => getStateDecisionProfile({ activeRegion, generatedRoom, selectedComponents, slot, state }),
    [activeRegion, generatedRoom, selectedComponents, slot, state],
  );

  const rankedDecisions = useMemo(() => {
    return visibleComponents
      .map((component) =>
        scoreLocationComponentDecision(component, decisionProfile, {
          activeSlotFilled: assignedComponents.length > 0,
          regionScoped,
          selected: assignedIds.has(component.id),
          slotMatchProfile,
        }),
      )
      .sort((a, b) => {
        if (assignedIds.has(a.component.id) !== assignedIds.has(b.component.id)) {
          return assignedIds.has(a.component.id) ? -1 : 1;
        }
        if (b.score !== a.score) return b.score - a.score;
        return getComponentTitle(a.component).localeCompare(getComponentTitle(b.component));
      });
  }, [assignedComponents.length, assignedIds, decisionProfile, regionScoped, slotMatchProfile, visibleComponents]);

  const mapShapingCount = useMemo(
    () => rankedDecisions.filter((decision) => Boolean(getComponentMapInfluence(decision.component))).length,
    [rankedDecisions],
  );

  const recommendedDecisions = useMemo(() => {
    return rankedDecisions
      .filter((decision) => !assignedIds.has(decision.component.id))
      .filter((decision) => decision.score >= 42 || !hasSearch)
      .slice(0, hasSearch ? 2 : 3);
  }, [assignedIds, hasSearch, rankedDecisions]);

  const recommendedIds = useMemo(
    () => new Set(recommendedDecisions.map((decision) => decision.component.id).filter(Boolean)),
    [recommendedDecisions],
  );

  const bestFitDecisions = useMemo(() => {
    return rankedDecisions
      .filter((decision) => !recommendedIds.has(decision.component.id))
      .filter((decision) => !assignedIds.has(decision.component.id))
      .filter((decision) => decision.score >= 54)
      .slice(0, 6);
  }, [assignedIds, rankedDecisions, recommendedIds]);

  const bestFitIds = useMemo(
    () => new Set(bestFitDecisions.map((decision) => decision.component.id).filter(Boolean)),
    [bestFitDecisions],
  );

  const allMatchingDecisions = useMemo(
    () => rankedDecisions.filter((decision) => !recommendedIds.has(decision.component.id) && !bestFitIds.has(decision.component.id)),
    [bestFitIds, rankedDecisions, recommendedIds],
  );

  const displayedDecisionRows = useMemo(() => {
    const rowsFor = (decisions, tier) => decisions.map((decision) => ({
      decision,
      key: `${tier}-${getComponentKey(decision.component)}`,
      tier,
    }));
    const allRows = [
      ...rowsFor(recommendedDecisions, "recommended"),
      ...rowsFor(bestFitDecisions, "best-picks"),
      ...rowsFor(allMatchingDecisions, "matching"),
    ];

    if (pickFilter === "recommended") return rowsFor(recommendedDecisions, "recommended");
    if (pickFilter === "best-picks") {
      return [
        ...rowsFor(recommendedDecisions, "recommended"),
        ...rowsFor(bestFitDecisions, "best-picks"),
      ];
    }
    if (pickFilter === "map-shaping") {
      return allRows.filter(({ decision }) => Boolean(getComponentMapInfluence(decision.component)));
    }
    if (pickFilter === "safe") {
      return allRows.filter(({ decision }) => {
        const impact = getLocationComponentImpact(decision.component, decision);
        return impact.pressureDelta <= 2 && impact.complexityDelta <= 2 && impact.counterplay !== "Needs Tell" && impact.counterplay !== "Worsens";
      });
    }
    if (pickFilter === "spicy") {
      return allRows.filter(({ decision }) => {
        const impact = getLocationComponentImpact(decision.component, decision);
        return impact.pressureDelta >= 3 || impact.complexityDelta >= 3 || impact.counterplay === "Needs Tell" || impact.counterplay === "Worsens";
      });
    }

    return allRows;
  }, [allMatchingDecisions, bestFitDecisions, pickFilter, recommendedDecisions]);

  function toggleSourceFilter(sourceId) {
    setSourceFilterIds((current) => {
      const next = new Set(current.filter((id) => id !== "__none__"));
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      return [...next];
    });
  }

  function selectAllSourceFilters() {
    setSourceFilterIds([]);
  }

  function clearSourceFilters() {
    setSourceFilterIds(["__none__"]);
  }

  function clearFilters() {
    setSearch("");
    setSourceFilterIds([]);
    setPackFilter("all");
    setPickFilter("all");
  }

  if (!open || !slot) return null;

  const drawerTitle = regionScoped
    ? slotContext.slotActionLabel
    : `Choose Map ${slot.label}`;
  const targetRoomLabel = regionScoped ? getTargetRoomLabel(activeRegion, generatedRoom) : "Map-wide build";
  const targetRoomArchetypeLabel = regionScoped ? getTargetRoomArchetypeLabel(activeRegion, generatedRoom) : "Any room";
  const targetPreviewText = regionScoped
    ? `${targetRoomLabel} · current archetype: ${targetRoomArchetypeLabel} · ${mapShapingCount} map-shaping pick${mapShapingCount === 1 ? "" : "s"}`
    : `${mapShapingCount} component${mapShapingCount === 1 ? "" : "s"} can influence room shape when assigned to a room.`;
  function renderComponentCard(decision, tier = "matching", itemKey = null) {
    const component = decision?.component || decision;
    const selected = assignedIds.has(component.id);

    return (
      <LocationComponentCard
        component={component}
        decision={decision}
        isSlotFull={isSlotFull}
        key={itemKey || getComponentKey(component)}
        onAddComponent={onAddComponent}
        onRemoveComponent={onRemoveComponent}
        regionScoped={regionScoped}
        selected={selected}
        slot={slot}
        tier={tier}
      />
    );
  }


  return (
    <div
      className={cx("component-navigator-drawer", filtersOpen && "is-filters-open")}
      data-filters-open={filtersOpen ? "true" : "false"}
      data-navigator-mode="slot"
      data-slot-scope={normalizedScope}
      data-room-slot-kind={slotMatchProfile?.id || ""}
      data-testid="dark-places-component-picker"
    >
      <div
        className="component-navigator-modal component-navigator-modal--drawer"
        data-navigator-mode="slot"
        data-has-smart-picks="true"
        data-filters-open={filtersOpen ? "true" : "false"}
        role="region"
        aria-label={drawerTitle}
      >
        <aside
          className="panel navigator component-navigator-modal__panel"
          aria-label="Location Component Navigator"
        >
          <div className="component-navigator-modal__head">
            <div className="component-navigator-modal__head-copy">
              <h2>{drawerTitle}</h2>
              {regionScoped ? <p>{slotContext.slotDescription}</p> : null}
              <p data-map-influence-target-preview="true">{targetPreviewText}</p>
            </div>
            <div className="component-navigator-modal__head-actions">
              <button
                className={cx("icon-btn navigator-filter-btn", filtersOpen && "active")}
                type="button"
                aria-label="Filter components"
                aria-expanded={filtersOpen}
                data-active-count={hasActiveFilters ? 1 : 0}
                onClick={() => setFiltersOpen((current) => !current)}
              >
                <SlidersHorizontal aria-hidden="true" />
              </button>
              <button
                className="icon-btn"
                type="button"
                aria-label="Close Component Navigator"
                onClick={onClose}
              >
                <X aria-hidden="true" />
              </button>
            </div>
          </div>


          {filtersOpen ? (
            <div className="navigator-tools component-navigator-modal__rail">
              <div className="navigator-search-row">
                <div className="search-wrap">
                  <input
                    type="search"
                    value={search}
                    placeholder="Search components…"
                    aria-label="Search location components"
                    data-testid="dark-places-component-search"
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="navigator-count" aria-label="Visible component count">
                  {displayedDecisionRows.length}
                </div>
              </div>

              <div className="tag-filter-row monster-source-grid-open location-source-grid-open" aria-label="Filter location components">
                <div className="tag-filter-row__head">
                  <span>Component Filters</span>
                  <button
                    className="tag-clear-btn"
                    type="button"
                    disabled={!hasActiveFilters}
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                </div>
                <div className="navigator-filter-panel">
                  {sourceOptions.length ? (
                    <section className="navigator-filter-section">
                      <div className="tag-filter-row__head">
                        <strong>Inspiration</strong>
                        <span>
                          <button className="tag-clear-btn" type="button" onClick={selectAllSourceFilters}>
                            All
                          </button>
                          <button className="tag-clear-btn" type="button" onClick={clearSourceFilters}>
                            None
                          </button>
                        </span>
                      </div>
                      <div className="filter-chip-grid source-filter">
                        {sourceOptions.map((item) => {
                          const isActive = !activeSourceFilterSet.size || activeSourceFilterSet.has(item.id);
                          return (
                            <button
                              className={cx("navigator-filter-chip navigator-filter-chip--stacked", isActive && "active")}
                              key={item.id}
                              type="button"
                              aria-pressed={isActive}
                              onClick={() => toggleSourceFilter(item.id)}
                            >
                              <span className="navigator-filter-chip__main">{item.label}</span>
                              <span className="navigator-filter-chip__meta">{item.meta}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  {packOptions.length ? (
                    <section className="navigator-filter-section">
                      <strong>Content Pack</strong>
                      <div className="filter-chip-grid source-filter">
                        {packOptions.map((pack) => (
                          <button
                            className={cx("navigator-filter-chip", packFilter === pack.id && "active")}
                            key={pack.id}
                            type="button"
                            aria-pressed={packFilter === pack.id}
                            onClick={() => setPackFilter(pack.id)}
                          >
                            {pack.title}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <section className="navigator-filter-section">
                    <strong>Best Picks</strong>
                    <div className="filter-chip-grid source-filter">
                      {[
                        ["all", "All Components"],
                        ["best-picks", "Best Picks"],
                        ["recommended", "Recommended"],
                        ["map-shaping", "Map Shaping"],
                        ["safe", "Safe"],
                        ["spicy", "Spicy"],
                      ].map(([value, label]) => (
                        <button
                          className={cx("navigator-filter-chip", pickFilter === value && "active")}
                          key={value}
                          type="button"
                          aria-pressed={pickFilter === value}
                          onClick={() => setPickFilter(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </section>

                </div>
              </div>
            </div>
          ) : null}

          <div className="component-list component-navigator-modal__list cruor-scroll-surface">
            {displayedDecisionRows.length ? (
              displayedDecisionRows.map(({ decision, key, tier }) => renderComponentCard(decision, tier, key))
            ) : (
              <p className="location-empty location-empty--quiet">No compatible options.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
