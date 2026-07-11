import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ComposerRail } from "../../../components/ui/composer-rail.jsx";
import {
  SLOTS,
  SILHOUETTE_SLOT_CARDS,
  ANATOMY_LEFT_SLOT_IDS,
  ANATOMY_RIGHT_SLOT_IDS,
  ANATOMY_BOTTOM_SLOT_IDS,
} from "../monster-composer.workflow.js";
import { getSelectedIdsForSlot, hasSelectedSlot } from "../model/monster-composer.selection.js";
import { normalizeMonsterReferences } from "../model/monster-composer.export.js";
import { getSilhouetteAnchor, getSilhouetteDecorations, getSilhouetteId, getSilhouetteProfile } from "../model/anatomy.js";
import {
  CREATURE_TYPES,
  DANGERS,
  MONSTER_TIERS,
  ROLES,
  TACTICAL_ROLES,
  TEMPO_PROFILES,
  isCreatureCategoryUnavailable,
  isCreatureTypeUnavailable,
} from "../monster-composer.taxonomies.js";
import {
  Activity,
  ChevronRight,
  FileText,
  Flame,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { MonsterStartScreen } from "./monster-composer.start-flow.jsx";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function createFaIcon(iconName) {
  function FaIcon({ className = "", ...props } = {}) {
    return (
      <i
        {...props}
        className={classNames("fa-solid", `fa-${iconName}`, className)}
      />
    );
  }

  return FaIcon;
}

const FRAME_TYPE_ICON_MAP = {
  undead: createFaIcon("skull"),
  beast: createFaIcon("paw"),
  aberration: createFaIcon("bacterium"),
};

const VARIANT_ICON = createFaIcon("dna");

function parseSvgViewBox(value) {
  const parts = String(value || "0 0 100 100")
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  const [x, y, width, height] = parts;
  return { x, y, width: width || 100, height: height || 100 };
}

function parseInlineSilhouetteAsset(svgText) {
  const source = String(svgText || "");
  const viewBoxMatch = source.match(/\bviewBox\s*=\s*["']([^"']+)["']/i);
  const layers = [...source.matchAll(/<path\b[^>]*\sd\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)]
    .map((match, index) => ({
      id: index === 0 ? "body" : `body-${index + 1}`,
      d: String(match[1] || match[2] || "").trim(),
    }))
    .filter((layer) => layer.d);

  if (!viewBoxMatch?.[1] || layers.length === 0) {
    return null;
  }

  return {
    viewBox: viewBoxMatch[1],
    layers,
  };
}

const FRAME_NODE_ANCHORS = [
  { id: "family", label: "Family", x: 0.5, y: 0.17, icon: createFaIcon("dna") },
  { id: "variant", label: "Variant", x: 0.55, y: 0.31, icon: createFaIcon("vials") },
  { id: "role", label: "Footprint", x: 0.37, y: 0.43, icon: createFaIcon("people-group") },
  { id: "tactic", label: "Job", x: 0.63, y: 0.52, icon: createFaIcon("crosshairs") },
  { id: "challenge", label: "CR", x: 0.43, y: 0.68, icon: createFaIcon("diamond") },
  { id: "danger", label: "Threat", x: 0.57, y: 0.79, icon: createFaIcon("triangle-exclamation") },
];

const FRAME_TYPE_COPY = {
  undead: "Corpse, bone, spirit, rot, hunger.",
  beast: "Predator body, instinct, mobility.",
  aberration: "Alien anatomy. Future pack.",
};

const ROLE_ICON_MAP = {
  minion: createFaIcon("people-group"),
  standard: createFaIcon("circle"),
  boss: createFaIcon("crown"),
};

const TACTICAL_ROLE_ICON_MAP = {
  brute: createFaIcon("hand-fist"),
  skirmisher: createFaIcon("person-running"),
  controller: createFaIcon("wand-magic-sparkles"),
  lurker: createFaIcon("eye-slash"),
  artillery: createFaIcon("bullseye"),
  support: createFaIcon("hand-holding-heart"),
};

const MONSTER_TIER_ICON_MAP = {
  normal: createFaIcon("circle-dot"),
  elite: createFaIcon("medal"),
  boss: createFaIcon("chess-king"),
  legendary: createFaIcon("dragon"),
  setpiece: createFaIcon("landmark"),
};

const TEMPO_ICON_MAP = {
  slow: createFaIcon("hourglass-half"),
  standard: createFaIcon("clock"),
  fast: createFaIcon("bolt"),
  ambusher: createFaIcon("masks-theater"),
  legendary: createFaIcon("stopwatch"),
};

const DANGER_ICON_MAP = {
  standard: createFaIcon("shield-halved"),
  hard: createFaIcon("fire-flame-curved"),
  horror: createFaIcon("skull-crossbones"),
};

const DEFAULT_SLOT_NODE_ANCHORS = {
  body: { x: 0.5, y: 0.27 },
  mind: { x: 0.5, y: 0.07 },
  attack: { x: 0.29, y: 0.52 },
  twist: { x: 0.7, y: 0.64 },
  horror: { x: 0.31, y: 0.24 },
  weakness: { x: 0.7, y: 0.52 },
  movement: { x: 0.4, y: 0.76 },
  death: { x: 0.7, y: 0.69 },
  lair: { x: 0.7, y: 0.74 },
};

const SLOT_NODE_ANCHORS_BY_CHASSIS = {
  zombie: {
    body: { x: 0.5, y: 0.27 },
    mind: { x: 0.5, y: 0.07 },
    attack: { x: 0.29, y: 0.52 },
    twist: { x: 0.7, y: 0.64 },
    horror: { x: 0.31, y: 0.24 },
    weakness: { x: 0.7, y: 0.52 },
    movement: { x: 0.4, y: 0.76 },
    death: { x: 0.7, y: 0.69 },
    lair: { x: 0.7, y: 0.74 },
  },
  skeleton: {
    body: { x: 0.5, y: 0.27 },
    mind: { x: 0.5, y: 0.07 },
    attack: { x: 0.29, y: 0.52 },
    twist: { x: 0.7, y: 0.64 },
    horror: { x: 0.31, y: 0.24 },
    weakness: { x: 0.7, y: 0.52 },
    movement: { x: 0.4, y: 0.76 },
    death: { x: 0.7, y: 0.69 },
    lair: { x: 0.7, y: 0.74 },
  },
  spirit: {
    body: { x: 0.5, y: 0.27 },
    mind: { x: 0.5, y: 0.07 },
    attack: { x: 0.29, y: 0.52 },
    twist: { x: 0.7, y: 0.64 },
    horror: { x: 0.31, y: 0.24 },
    weakness: { x: 0.7, y: 0.52 },
    movement: { x: 0.4, y: 0.76 },
    death: { x: 0.7, y: 0.69 },
    lair: { x: 0.7, y: 0.74 },
  },
  spider: {
    mind: { x: 0.5, y: 0.38 },
    body: { x: 0.5, y: 0.53 },
    movement: { x: 0.34, y: 0.66 },
    attack: { x: 0.66, y: 0.39 },
    horror: { x: 0.43, y: 0.49 },
    twist: { x: 0.66, y: 0.61 },
    weakness: { x: 0.5, y: 0.67 },
    death: { x: 0.5, y: 0.78 },
    lair: { x: 0.5, y: 0.91 },
  },
  wolf: {
    mind: { x: 0.42, y: 0.36 },
    body: { x: 0.52, y: 0.5 },
    movement: { x: 0.68, y: 0.69 },
    attack: { x: 0.29, y: 0.43 },
    horror: { x: 0.46, y: 0.57 },
    twist: { x: 0.61, y: 0.47 },
    weakness: { x: 0.54, y: 0.66 },
    death: { x: 0.74, y: 0.77 },
    lair: { x: 0.5, y: 0.91 },
  },
};

const FRAME_NODE_ANCHOR_OVERRIDES_BY_CHASSIS = {
  spider: {
    family: { x: 0.5, y: 0.27 },
    variant: { x: 0.64, y: 0.38 },
    role: { x: 0.35, y: 0.5 },
    tactic: { x: 0.66, y: 0.58 },
    challenge: { x: 0.42, y: 0.69 },
    danger: { x: 0.58, y: 0.8 },
  },
  wolf: {
    family: { x: 0.36, y: 0.34 },
    variant: { x: 0.48, y: 0.43 },
    role: { x: 0.29, y: 0.5 },
    tactic: { x: 0.6, y: 0.55 },
    challenge: { x: 0.66, y: 0.69 },
    danger: { x: 0.78, y: 0.78 },
  },
};

function normalizeChassisKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getChassisCoordinateKeys({ silhouetteId, typeId, category }) {
  return [silhouetteId, category, typeId, "default"]
    .map(normalizeChassisKey)
    .filter(Boolean);
}

function getSlotNodeAnchors({ silhouetteId, typeId, category, profile }) {
  const anchors = { ...DEFAULT_SLOT_NODE_ANCHORS };
  for (const key of getChassisCoordinateKeys({ silhouetteId, typeId, category })) {
    Object.assign(anchors, SLOT_NODE_ANCHORS_BY_CHASSIS[key] || {});
  }

  for (const slot of SLOTS) {
    anchors[slot.id] = anchors[slot.id] || getSilhouetteAnchor(profile, slot.id);
  }

  return anchors;
}

function getFrameNodeAnchors({ silhouetteId, typeId, category }) {
  const overrides = {};
  for (const key of getChassisCoordinateKeys({ silhouetteId, typeId, category })) {
    Object.assign(overrides, FRAME_NODE_ANCHOR_OVERRIDES_BY_CHASSIS[key] || {});
  }

  return FRAME_NODE_ANCHORS.map((node) => ({ ...node, ...(overrides[node.id] || {}) }));
}

function setRefMap(mapRef, key, element) {
  if (!mapRef?.current) return;
  if (element) {
    mapRef.current.set(key, element);
  } else {
    mapRef.current.delete(key);
  }
}

function getElementCenter(element, rootRect) {
  const rect = element.getBoundingClientRect();
  const localRect = {
    left: rect.left - rootRect.left,
    right: rect.right - rootRect.left,
    top: rect.top - rootRect.top,
    bottom: rect.bottom - rootRect.top,
    width: rect.width,
    height: rect.height,
  };

  return {
    x: localRect.left + rect.width / 2,
    y: localRect.top + rect.height / 2,
    rect,
    localRect,
  };
}

const NODE_PORT_CLUSTER_THRESHOLD = 10;
const NODE_PORT_EXIT_DISTANCE = 14;
const NODE_PORT_GROUP_SEQUENCE = ["left", "right", "top", "bottom"];
const NODE_PORT_SIDE_BY_SLOT = {
  body: "left",
  mind: "right",
  attack: "left",
  horror: "right",
  movement: "bottom",
  weakness: "right",
  twist: "left",
  death: "right",
  lair: "bottom",
};

function getNaturalNodePort(node, end) {
  const horizontalDistance = Math.abs(end.x - node.x);
  const verticalDistance = Math.abs(end.y - node.y);

  if (verticalDistance > horizontalDistance * 1.35) {
    return end.y < node.y ? "top" : "bottom";
  }

  return end.x < node.x ? "left" : "right";
}

function assignNodePorts(items) {
  const groups = [];

  for (const item of items) {
    const group = groups.find((candidate) => Math.abs(candidate.x - item.node.x) <= NODE_PORT_CLUSTER_THRESHOLD);
    if (group) {
      group.items.push(item);
      group.x = group.items.reduce((total, next) => total + next.node.x, 0) / group.items.length;
    } else {
      groups.push({ x: item.node.x, items: [item] });
    }
  }

  for (const group of groups) {
    const sorted = [...group.items].sort((a, b) => a.node.y - b.node.y);
    const usedPorts = new Map();

    for (let index = 0; index < sorted.length; index += 1) {
      const item = sorted[index];
      const preferredPort = group.items.length > 1
        ? NODE_PORT_SIDE_BY_SLOT[item.id] || NODE_PORT_GROUP_SEQUENCE[index % NODE_PORT_GROUP_SEQUENCE.length]
        : getNaturalNodePort(item.node, item.end);
      const portUseCount = usedPorts.get(preferredPort) || 0;

      item.port = preferredPort;
      item.exitDistance = NODE_PORT_EXIT_DISTANCE + portUseCount * 8;
      item.crossOffset = preferredPort === "top" || preferredPort === "bottom"
        ? portUseCount === 0
          ? 0
          : (portUseCount % 2 === 1 ? 1 : -1) * (12 + Math.floor(portUseCount / 2) * 8)
        : 0;
      usedPorts.set(preferredPort, portUseCount + 1);
    }
  }

  return items;
}

function getNodePortPoint(node, port) {
  const rect = node.localRect;

  switch (port) {
    case "left":
      return { x: rect.left, y: node.y };
    case "right":
      return { x: rect.right, y: node.y };
    case "top":
      return { x: node.x, y: rect.top };
    case "bottom":
      return { x: node.x, y: rect.bottom };
    default:
      return { x: node.x, y: node.y };
  }
}

function getNodeExitPoint(start, port, exitDistance) {
  switch (port) {
    case "left":
      return { x: start.x - exitDistance, y: start.y };
    case "right":
      return { x: start.x + exitDistance, y: start.y };
    case "top":
      return { x: start.x, y: start.y - exitDistance };
    case "bottom":
      return { x: start.x, y: start.y + exitDistance };
    default:
      return start;
  }
}

function buildConnectorPath({ node, end, port, exitDistance, crossOffset = 0 }) {
  const start = getNodePortPoint(node, port);
  const exit = getNodeExitPoint(start, port, exitDistance);

  if ((port === "top" || port === "bottom") && crossOffset !== 0) {
    const lane = { x: exit.x + crossOffset, y: exit.y };
    return [
      `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
      `L ${exit.x.toFixed(2)} ${exit.y.toFixed(2)}`,
      `L ${lane.x.toFixed(2)} ${lane.y.toFixed(2)}`,
      `L ${lane.x.toFixed(2)} ${end.y.toFixed(2)}`,
      `L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    ].join(" ");
  }

  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `L ${exit.x.toFixed(2)} ${exit.y.toFixed(2)}`,
    `L ${exit.x.toFixed(2)} ${end.y.toFixed(2)}`,
    `L ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
  ].join(" ");
}

function AnatomyConnectionLayer({
  enabled,
  gridRef,
  nodeRefs,
  slotCardRefs,
  slotStates,
  dependencyKey,
  hoverSlotId,
  onHoverSlot,
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0, paths: [] });

  useEffect(() => {
    if (!enabled || !gridRef?.current) {
      setLayout({ width: 0, height: 0, paths: [] });
      return undefined;
    }

    let frameId = 0;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;

    function readLayout() {
      const root = gridRef.current;
      if (!root) return;

      const rootRect = root.getBoundingClientRect();
      const routeItems = slotStates
        .map((state) => {
          const nodeElement = nodeRefs.current.get(state.id);
          const cardElement = slotCardRefs.current.get(state.id);
          if (!nodeElement || !cardElement) return null;

          const node = getElementCenter(nodeElement, rootRect);
          const card = getElementCenter(cardElement, rootRect);
          const cardEdgeX = node.x >= card.x
            ? card.localRect.right
            : card.localRect.left;
          const end = { x: cardEdgeX, y: card.y };

          return {
            ...state,
            node,
            end,
          };
        })
        .filter(Boolean);

      const nextPaths = assignNodePorts(routeItems).map((item) => {
        const { node, end, port, exitDistance, crossOffset, ...state } = item;
        return {
          ...state,
          d: buildConnectorPath({ node, end, port, exitDistance, crossOffset }),
        };
      });

      setLayout({
        width: Math.max(1, rootRect.width),
        height: Math.max(1, rootRect.height),
        paths: nextPaths,
      });
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(readLayout);
    }

    const observedElements = [
      gridRef.current,
      ...Array.from(nodeRefs.current.values()),
      ...Array.from(slotCardRefs.current.values()),
    ].filter(Boolean);

    observedElements.forEach((element) => observer?.observe(element));
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [enabled, gridRef, nodeRefs, slotCardRefs, dependencyKey]);

  if (!enabled || layout.paths.length === 0) return null;

  return (
    <svg
      className="anatomy-stage__connection-layer"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {layout.paths.map((path, index) => (
        <path
          key={`${dependencyKey}:${path.id}:${path.d}`}
          className={classNames(
            "monster-dynamic-connector",
            path.filled ? "is-filled" : "is-empty",
            path.active && "is-active",
            path.guided && "is-guided",
            hoverSlotId === path.id && "is-linked-hover",
          )}
          style={{ "--monster-connector-delay": `${180 + index * 55}ms` }}
          d={path.d}
          pathLength="1"
          onPointerEnter={() => onHoverSlot?.(path.id)}
          onPointerLeave={() => onHoverSlot?.(null)}
        />
      ))}
    </svg>
  );
}

function SilhouetteChassisMenu({
  open,
  typeId,
  category,
  stageMode,
  onChooseChassis,
  onSetStageMode,
  menuRef,
}) {
  if (!open) return null;

  return (
    <div ref={menuRef} className="monster-chassis-menu" role="menu" aria-label="Silhouette chassis menu">
      <div className="monster-chassis-menu__head">
        <span>Chassis</span>
        <strong>{category}</strong>
      </div>
      <div className="monster-chassis-menu__families">
        {CREATURE_TYPES.map((type) => {
          const TypeIcon = FRAME_TYPE_ICON_MAP[type.id] || type.icon || Activity;
          const familyDisabled = isCreatureTypeUnavailable(type.id);
          return (
            <section key={type.id} className="monster-chassis-family" aria-label={type.label}>
              <button
                className={`monster-chassis-family__trigger ${type.id === typeId ? "is-active" : ""}`}
                type="button"
                role="menuitem"
                disabled={familyDisabled}
                aria-disabled={familyDisabled}
                onClick={() => {
                  if (!familyDisabled) onChooseChassis?.(type.id, type.categories[0]);
                }}
              >
                <TypeIcon aria-hidden="true" />
                <span>{type.label}</span>
                <ChevronRight aria-hidden="true" />
              </button>
              <div className="monster-chassis-family__variants" role="group" aria-label={`${type.label} variants`}>
                {type.categories.map((variant) => {
                  const disabled = familyDisabled || isCreatureCategoryUnavailable(type.id, variant);
                  const active = type.id === typeId && variant === category;
                  return (
                    <button
                      key={`${type.id}:${variant}`}
                      className={`monster-chassis-variant ${active ? "is-active" : ""}`}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      disabled={disabled}
                      aria-disabled={disabled}
                      onClick={() => {
                        if (!disabled) onChooseChassis?.(type.id, variant);
                      }}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <div className="monster-chassis-menu__views" role="group" aria-label="Silhouette view">
        <button
          className={stageMode === "frame" ? "is-active" : ""}
          type="button"
          role="menuitemradio"
          aria-checked={stageMode === "frame"}
          onClick={() => onSetStageMode?.("frame")}
        >
          Chassis View
        </button>
        <button
          className={stageMode === "grafts" ? "is-active" : ""}
          type="button"
          role="menuitemradio"
          aria-checked={stageMode === "grafts"}
          onClick={() => onSetStageMode?.("grafts")}
        >
          Grafts View
        </button>
      </div>
    </div>
  );
}


function AnatomyMeter({ label, value, max, percent }) {
  const over = value > max;
  const tooltip =
    label === "Pressure"
      ? "Pressure measures how hard the monster pushes the party through damage, control, action load, and encounter danger."
      : label === "Complexity"
        ? "Complexity measures how much the DM must track at the table: reactions, recharge effects, delayed triggers, and conditional rules."
        : "This meter summarizes the current monster build.";
  return (
    <div className="monster-meter">
      <div className="monster-meter__head">
        <span>{label}</span>
        <span className="monster-meter__value">
          <strong className={over ? "is-over" : ""}>
            {value} / {max}
          </strong>
          <button
            className="tooltip-btn"
            type="button"
            aria-label={`${label} explanation`}
            data-key="tooltip-generic"
            data-tooltip={label}
            data-tooltip-description={tooltip}
          >
            ?
          </button>
        </span>
      </div>
      <div className="monster-meter__track">
        <div className={over ? "is-over" : ""} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}

function FrameMeter({ label, value, max }) {
  const percent = max > 0 ? clamp((value / max) * 100, 0, 160) : 0;
  return <AnatomyMeter label={label} value={value} max={max} percent={percent} />;
}

function FrameSummaryRow({ label, value }) {
  return (
    <span className="cruor-composer-fact-row monster-frame-info-row">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

function MonsterNameEditor({ value, onChange }) {
  return (
    <label className="monster-frame-name-editor">
      <span className="sr-only">Monster name</span>
      <input
        type="text"
        value={value}
        aria-label="Monster name"
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  );
}

function GraftActionPanel({ composerStarted, onForgeMonster, onOpenExport, onStartOver }) {
  return (
    <section className="cruor-composer-rail-card monster-frame-info-card monster-graft-action-card" aria-label="Build actions">
      <button
        className="monster-graft-action-btn is-primary tooltip-btn"
        type="button"
        aria-label="Forge Monster"
        data-key="tooltip-generic"
        data-tooltip="Auto-build a playable first draft from the current Monster Frame. You can customize every anatomy slot afterward."
        data-tooltip-description="Fills the anatomy slots with compatible grafts based on the current chassis, role, danger, and CR."
        onClick={onForgeMonster}
      >
        <Flame aria-hidden="true" />
        <span>Forge Monster</span>
      </button>
      <button
        className={`monster-graft-action-btn tooltip-btn ${composerStarted ? "" : "is-disabled"}`}
        type="button"
        aria-label="Export Monster"
        aria-disabled={!composerStarted}
        data-key="tooltip-generic"
        data-tooltip={
          composerStarted
            ? "Open the complete monster export sheet."
            : "Start or forge a monster before opening Export."
        }
        data-tooltip-description="Moves to the export-ready stat block and table handoff view."
        onClick={composerStarted ? onOpenExport : undefined}
      >
        <FileText aria-hidden="true" />
        <span>Export Monster</span>
      </button>
      <button
        className={`monster-graft-action-btn tooltip-btn ${composerStarted ? "" : "is-disabled"}`}
        type="button"
        aria-label="Start Over"
        aria-disabled={!composerStarted}
        data-key="tooltip-generic"
        data-tooltip={
          composerStarted
            ? "Return to the initial Template / Scratch choice and clear the current build."
            : "Start a build before using Start Over."
        }
        data-tooltip-description="Clears the current build and returns to the first start screen."
        onClick={composerStarted ? onStartOver : undefined}
      >
        <RotateCcw aria-hidden="true" />
        <span>Start Over</span>
      </button>
    </section>
  );
}

function ChassisFlowActionPanel({ onPickTemplate, onSetStageMode }) {
  return (
    <section className="cruor-composer-rail-card monster-frame-info-card monster-graft-action-card" aria-label="Chassis flow actions">
      <button
        className="monster-graft-action-btn tooltip-btn"
        type="button"
        aria-label="Open Templates"
        data-key="tooltip-generic"
        data-tooltip="Open monster templates"
        data-tooltip-description="Return to the template picker and choose a ready-made monster frame."
        onClick={onPickTemplate}
      >
        <Sparkles aria-hidden="true" />
        <span>Templates</span>
      </button>
      <button
        className="monster-graft-action-btn is-primary tooltip-btn"
        type="button"
        aria-label="Grafts"
        data-key="tooltip-generic"
        data-tooltip="Grafts"
        data-tooltip-description="Keep this chassis and move to the graft slots."
        onClick={() => onSetStageMode?.("grafts")}
      >
        <ChevronRight aria-hidden="true" />
        <span>Grafts</span>
      </button>
    </section>
  );
}

function GraftFlowActionPanel({ onSetStageMode, onOpenExport }) {
  return (
    <section className="cruor-composer-rail-card monster-frame-info-card monster-graft-action-card" aria-label="Graft flow actions">
      <button
        className="monster-graft-action-btn tooltip-btn"
        type="button"
        aria-label="Chassis"
        data-key="tooltip-generic"
        data-tooltip="Chassis"
        data-tooltip-description="Return to the chassis controls without clearing the current grafts."
        onClick={() => onSetStageMode?.("frame")}
      >
        <SlidersHorizontal aria-hidden="true" />
        <span>Chassis</span>
      </button>
      <button
        className="monster-graft-action-btn is-primary tooltip-btn"
        type="button"
        aria-label="Export"
        data-key="tooltip-generic"
        data-tooltip="Export"
        data-tooltip-description="Open the export-ready stat block."
        onClick={onOpenExport}
      >
        <FileText aria-hidden="true" />
        <span>Export</span>
      </button>
    </section>
  );
}

function FrameOptionCard({
  active,
  disabled = false,
  icon: Icon,
  title,
  meta,
  summary,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      aria-pressed={active}
      className={`monster-frame-option ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      onClick={disabled ? undefined : onClick}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span>
        <strong>{title}</strong>
        {summary ? <em>{summary}</em> : null}
      </span>
      {meta ? <small>{meta}</small> : null}
    </button>
  );
}

function FramePill({ active, disabled = false, children, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      disabled={disabled}
      aria-disabled={disabled}
      aria-checked={active}
      className={`monster-frame-pill ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}

function normalizeTooltipLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function buildFrameTooltipList(options, getLabel, getDescription, getMeta, isDisabled) {
  return options
    .map((option) => {
      const label = normalizeTooltipLine(getLabel?.(option));
      const description = normalizeTooltipLine(getDescription?.(option));
      const meta = normalizeTooltipLine(getMeta?.(option));
      const disabled = Boolean(isDisabled?.(option));
      const details = [description, meta, disabled ? "Unavailable / future pack" : ""]
        .filter(Boolean)
        .join(" · ");
      return details ? `**${label}**. ${details}` : `**${label}**.`;
    })
    .join("\n");
}

function FrameTooltip({ title = "Info", text, items = "" }) {
  const tooltipText = [text, items].filter(Boolean).join("\n");
  if (!tooltipText) return null;
  const ariaText = normalizeTooltipLine(tooltipText);
  return (
    <span
      className="monster-frame-help"
      tabIndex="0"
      role="button"
      aria-label={`${title}: ${ariaText}`}
      data-key="tooltip-generic"
      data-tooltip={title}
      data-tooltip-description={tooltipText}
    >
      <span aria-hidden="true">?</span>
    </span>
  );
}

function FrameCrControl({ value, setTargetCr, setActivePresetId }) {
  const [draftValue, setDraftValue] = useState(value);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  function normalize(nextValue) {
    return clamp(Number(nextValue || 0), 0, 30);
  }

  function preview(nextValue) {
    setDraftValue(normalize(nextValue));
  }

  function commit(nextValue) {
    const normalizedValue = normalize(nextValue);
    setDraftValue(normalizedValue);
    setTargetCr(normalizedValue);
    setActivePresetId("");
  }

  return (
    <div className="monster-frame-cr-control" aria-label="Target CR">
      <div className="monster-frame-field-head">
        <span>Target CR</span>
        <FrameTooltip
          title="Target CR"
          text="Sets the monster's expected challenge rating. You can drag the slider or type the exact number."
          items="• **0–30**. Type a precise CR or drag the slider."
        />
      </div>
      <div className="monster-frame-cr-slider-row">
        <input
          className="monster-frame-cr-slider"
          type="range"
          min="0"
          max="30"
          step="1"
          value={draftValue}
          aria-label="Target CR slider"
          onPointerDown={() => {
            isDraggingRef.current = true;
          }}
          onInput={(event) => preview(event.currentTarget.value)}
          onChange={(event) => {
            if (!isDraggingRef.current) commit(event.currentTarget.value);
          }}
          onPointerUp={(event) => {
            isDraggingRef.current = false;
            commit(event.currentTarget.value);
          }}
          onPointerCancel={(event) => {
            isDraggingRef.current = false;
            commit(event.currentTarget.value);
          }}
          onBlur={(event) => commit(event.currentTarget.value)}
        />
        <input
          className="monster-frame-cr-number"
          type="number"
          min="0"
          max="30"
          value={draftValue}
          aria-label="Target CR number"
          onChange={(event) => commit(event.target.value)}
        />
      </div>
    </div>
  );
}

function MonsterSilhouetteCore({
  profile,
  silhouetteId,
  typeId,
  category,
  selected,
  activeSlot,
  guidedSlotId,
  stageMode,
  frameNodeValues,
  nodeRefs,
  hoverSlotId,
  onHoverSlot,
  onOpenFrame,
  onFocusSlot,
  onSetStageMode,
  selectType,
  setCategory,
  setActivePresetId,
  stageTransition = "",
}) {
  const [chassisMenuOpen, setChassisMenuOpen] = useState(false);
  const [silhouetteHovered, setSilhouetteHovered] = useState(false);
  const [hoveredDecorationId, setHoveredDecorationId] = useState(null);
  const silhouetteLayerRef = useRef(null);
  const chassisMenuRef = useRef(null);
  const isFrameMode = stageMode === "frame";
  const frameNodes = getFrameNodeAnchors({ silhouetteId, typeId, category });
  const slotNodeAnchors = getSlotNodeAnchors({ silhouetteId, typeId, category, profile });
  const [showAnatomyDecorations, setShowAnatomyDecorations] = useState(() => {
    if (isFrameMode) {
      return stageTransition !== "grafts-to-frame-enter";
    }

    return stageTransition === "frame-to-grafts-enter" || stageTransition === "frame-to-grafts-exit";
  });
  const anatomyDecorations = getSilhouetteDecorations(typeId, category);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setShowAnatomyDecorations(isFrameMode);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isFrameMode, stageTransition]);
  const ariaLabel = `${profile.label}. Open chassis menu.`;
  const [inlineAssetProfile, setInlineAssetProfile] = useState(null);
  const silhouetteRenderProfile = inlineAssetProfile || profile;
  const scanId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const scanClipId = `monster-silhouette-scan-clip-${scanId}`;
  const scanGradientId = `monster-silhouette-scan-gradient-${scanId}`;
  const scanGridPatternId = `monster-silhouette-scan-grid-${scanId}`;
  const scanGridMaskId = `monster-silhouette-scan-grid-mask-${scanId}`;
  const bodyLayers = (silhouetteRenderProfile.layers || []).filter((layer) => layer.id !== "aura");
  const scanViewBox = parseSvgViewBox(silhouetteRenderProfile.viewBox);
  const scanTravelDurationSeconds = 0.72;
  const scanFadeDurationSeconds = 0.18;
  const scanCycleDurationSeconds = scanTravelDurationSeconds + scanFadeDurationSeconds;
  const scanPulseDurationMs = Math.ceil(scanCycleDurationSeconds * 1000);
  const scanActiveRatio = scanTravelDurationSeconds / scanCycleDurationSeconds;
  const scanBandHeight = Math.max(scanViewBox.height * 0.021, 2.1);
  const scanGridBandHeight = Math.max(scanViewBox.height * 0.1755, 24);
  const scanGridOffset = (scanGridBandHeight - scanBandHeight) / 2;
  const scanStartY = scanViewBox.y - scanGridBandHeight;
  const scanEndY = scanViewBox.y + scanViewBox.height + scanGridBandHeight;
  const scanGridStartY = scanStartY - scanGridOffset;
  const scanGridEndY = scanEndY - scanGridOffset;
  const scanCycleDuration = `${scanCycleDurationSeconds}s`;
  const scanActiveRatioLabel = String(scanActiveRatio);
  const isTransitionScanRequested = Boolean(stageTransition && stageTransition !== "idle");
  const [scanPulseActive, setScanPulseActive] = useState(false);
  const [scanPulseId, setScanPulseId] = useState(0);
  const scanPulseTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isTransitionScanRequested) return undefined;

    if (scanPulseTimeoutRef.current) {
      window.clearTimeout(scanPulseTimeoutRef.current);
    }

    setScanPulseActive(true);
    setScanPulseId((current) => current + 1);

    scanPulseTimeoutRef.current = window.setTimeout(() => {
      setScanPulseActive(false);
      scanPulseTimeoutRef.current = null;
    }, scanPulseDurationMs);

    return undefined;
  }, [isTransitionScanRequested, scanPulseDurationMs, stageTransition]);

  useEffect(() => {
    return () => {
      if (scanPulseTimeoutRef.current) {
        window.clearTimeout(scanPulseTimeoutRef.current);
      }
    };
  }, []);

  const isScanActive = scanPulseActive;

  useEffect(() => {
    if (!chassisMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (chassisMenuRef.current?.contains(event.target)) return;
      setChassisMenuOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setChassisMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [chassisMenuOpen]);

  useEffect(() => {
    setChassisMenuOpen(false);
    setSilhouetteHovered(false);
  }, [typeId, category, stageMode]);

  useEffect(() => {
    let cancelled = false;

    if (!profile.assetUrl) {
      setInlineAssetProfile(null);
      return undefined;
    }

    setInlineAssetProfile(null);

    fetch(profile.assetUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load silhouette asset: ${response.status}`);
        }
        return response.text();
      })
      .then((svgText) => {
        if (cancelled) return;
        const parsed = parseInlineSilhouetteAsset(svgText);
        setInlineAssetProfile(
          parsed
            ? {
                ...profile,
                assetUrl: "",
                viewBox: parsed.viewBox,
                layers: parsed.layers,
              }
            : null,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setInlineAssetProfile(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profile.assetUrl, profile.label, profile.viewBox]);

  function openChassisMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    setChassisMenuOpen(true);
  }

  function handleSilhouetteKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setChassisMenuOpen(true);
    }
  }

  function chooseChassis(nextTypeId, nextCategory) {
    if (isCreatureTypeUnavailable(nextTypeId)) return;
    if (isCreatureCategoryUnavailable(nextTypeId, nextCategory)) return;

    if (nextTypeId !== typeId) {
      selectType?.(nextTypeId);
    }

    setCategory?.(nextCategory);
    setActivePresetId?.("");
    setChassisMenuOpen(false);
  }

  function switchStageMode(nextStageMode) {
    if (nextStageMode === "frame") {
      onOpenFrame?.();
    } else {
      onSetStageMode?.(nextStageMode);
    }
    setChassisMenuOpen(false);
  }

  return (
    <div className="anatomy-stage__center" aria-label="Interactive monster silhouette">
      <div
        className={classNames(
          "anatomy-stage__silhouette-layer",
          chassisMenuOpen && "has-chassis-menu-open",
          silhouetteHovered && "is-silhouette-hovered",
          showAnatomyDecorations ? "is-anatomy-decorations-visible" : "is-anatomy-decorations-hidden",
        )}
        ref={silhouetteLayerRef}
      >
        {anatomyDecorations.map((decoration) => (
          <div
            key={decoration.id}
            className={classNames(
              "monster-anatomy-decoration",
              `monster-anatomy-decoration--${decoration.id}`,
              hoveredDecorationId === decoration.id && "is-decoration-hovered",
            )}
            aria-hidden="true"
          >
            <svg className="monster-anatomy-decoration__plate" viewBox={decoration.viewBox} focusable="false">
              <g className="monster-anatomy-decoration__body">
                {(decoration.layers || []).map((layer) => (
                  <path
                    key={layer.id}
                    d={layer.d}
                    onPointerEnter={() => setHoveredDecorationId(decoration.id)}
                    onPointerLeave={() => setHoveredDecorationId(null)}
                  />
                ))}
              </g>
            </svg>
            {decoration.note ? (
              <p className="monster-anatomy-decoration__caption">
                <span>{decoration.note}</span>
              </p>
            ) : null}
          </div>
        ))}

        {isFrameMode ? (
          <svg
            className="monster-silhouette-connectors"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {frameNodes.map((node) => (
              <line
                key={node.id}
                className="monster-silhouette-connector is-frame"
                x1={node.x * 100}
                y1={node.y * 100}
                x2="50"
                y2="50"
              />
            ))}
          </svg>
        ) : null}

        {profile.assetUrl && !inlineAssetProfile ? (
          <button
            className={`monster-silhouette-svg monster-silhouette-asset monster-silhouette-svg--${silhouetteId}`}
            type="button"
            aria-label={ariaLabel}
            aria-haspopup="menu"
            aria-expanded={chassisMenuOpen}
            onContextMenu={openChassisMenu}
            onKeyDown={handleSilhouetteKeyDown}
            onPointerEnter={() => setSilhouetteHovered(true)}
            onPointerLeave={() => setSilhouetteHovered(false)}
            onFocus={() => setSilhouetteHovered(true)}
            onBlur={() => setSilhouetteHovered(false)}
          >
            <img
              className="monster-silhouette-asset__image"
              src={profile.assetUrl}
              alt=""
              aria-hidden="true"
              draggable="false"
            />
            {isScanActive ? (
              <span
                className="monster-silhouette-asset__scan"
                aria-hidden="true"
                style={{ "--monster-silhouette-mask": `url(${profile.assetUrl})` }}
              />
            ) : null}
          </button>
        ) : (
          <svg
            className={`monster-silhouette-svg monster-silhouette-svg--${silhouetteId}`}
            viewBox={silhouetteRenderProfile.viewBox}
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
            aria-haspopup="menu"
            aria-expanded={chassisMenuOpen}
            onKeyDown={handleSilhouetteKeyDown}
            onFocus={() => setSilhouetteHovered(true)}
            onBlur={() => setSilhouetteHovered(false)}
          >
            {isScanActive ? (
              <defs>
                <clipPath id={scanClipId}>
                  {bodyLayers.map((layer) => (
                    <path key={`scan-clip-${layer.id}`} d={layer.d} />
                  ))}
                </clipPath>
                <linearGradient id={scanGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(240, 185, 194, 0)" />
                <stop offset="28%" stopColor="rgba(190, 64, 82, 0.1)" />
                <stop offset="44%" stopColor="rgba(240, 185, 194, 0.32)" />
                <stop offset="49.2%" stopColor="rgba(255, 238, 242, 0.96)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
                <stop offset="50.8%" stopColor="rgba(255, 238, 242, 0.96)" />
                <stop offset="56%" stopColor="rgba(240, 185, 194, 0.32)" />
                <stop offset="72%" stopColor="rgba(190, 64, 82, 0.1)" />
                <stop offset="100%" stopColor="rgba(240, 185, 194, 0)" />
              </linearGradient>
              <pattern
                id={scanGridPatternId}
                x={scanViewBox.x}
                y={scanViewBox.y}
                width={Math.max(scanViewBox.width / 18, 8)}
                height={Math.max(scanViewBox.height / 26, 8)}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${Math.max(scanViewBox.width / 18, 8)} 0 L 0 0 0 ${Math.max(scanViewBox.height / 26, 8)}`}
                  fill="none"
                  stroke="rgba(255, 244, 246, 0.9)"
                  strokeWidth="1.05"
                  vectorEffect="non-scaling-stroke"
                />
              </pattern>
              <mask id={scanGridMaskId} maskUnits="userSpaceOnUse">
                <linearGradient id={`${scanGridMaskId}-gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="10%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="24%" stopColor="rgba(255,255,255,0.26)" />
                  <stop offset="38%" stopColor="rgba(255,255,255,0.58)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,1)" />
                  <stop offset="62%" stopColor="rgba(255,255,255,0.58)" />
                  <stop offset="76%" stopColor="rgba(255,255,255,0.26)" />
                  <stop offset="90%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <rect
                  x={scanViewBox.x - scanViewBox.width * 0.15}
                  y={scanGridStartY}
                  width={scanViewBox.width * 1.3}
                  height={scanGridBandHeight}
                  fill={`url(#${scanGridMaskId}-gradient)`}
                >
                  <animate
                    attributeName="y"
                    values={`${scanGridStartY};${scanGridEndY};${scanGridEndY}`}
                    keyTimes={`0;${scanActiveRatioLabel};1`}
                    dur={scanCycleDuration}
                    repeatCount="1"
                  fill="freeze"
                  />
                  <animate
                    attributeName="opacity"
                    values={`0;0.68;1;1;0`}
                    keyTimes={`0;0.05;${scanActiveRatioLabel * 0.46};${scanActiveRatioLabel};1`}
                    dur={scanCycleDuration}
                    repeatCount="1"
                  fill="freeze"
                  />
                </rect>
                </mask>
              </defs>
            ) : null}
            <g className="monster-silhouette-aura">
              {(silhouetteRenderProfile.layers || [])
                .filter((layer) => layer.id === "aura")
                .map((layer) => (
                  <path key={layer.id} d={layer.d} />
                ))}
            </g>
            <g
              className="monster-silhouette-body"
              onContextMenu={openChassisMenu}
              onPointerEnter={() => setSilhouetteHovered(true)}
              onPointerLeave={() => setSilhouetteHovered(false)}
            >
              {bodyLayers.map((layer) => (
                <path
                  key={layer.id}
                  className={`silhouette-layer silhouette-layer--${layer.id}`}
                  d={layer.d}
                />
              ))}
            </g>
            {isScanActive ? (
              <g key={scanPulseId} className="monster-silhouette-scan" clipPath={`url(#${scanClipId})`} aria-hidden="true">
              <rect
                className="monster-silhouette-scan__band"
                x={scanViewBox.x - scanViewBox.width * 0.15}
                y={scanGridStartY}
                width={scanViewBox.width * 1.3}
                height={scanGridBandHeight}
                fill={`url(#${scanGridPatternId})`}
                mask={`url(#${scanGridMaskId})`}
                opacity="0.98"
              >
                <animate
                  attributeName="y"
                  values={`${scanGridStartY};${scanGridEndY};${scanGridEndY}`}
                  keyTimes={`0;${scanActiveRatioLabel};1`}
                  dur={scanCycleDuration}
                  repeatCount="1"
                  fill="freeze"
                />
                <animate
                  attributeName="opacity"
                  values={`0;0.68;1;1;0`}
                  keyTimes={`0;0.05;${scanActiveRatioLabel * 0.46};${scanActiveRatioLabel};1`}
                  dur={scanCycleDuration}
                  repeatCount="1"
                  fill="freeze"
                />
              </rect>
              <rect
                className="monster-silhouette-scan__band"
                x={scanViewBox.x - scanViewBox.width * 0.15}
                y={scanStartY}
                width={scanViewBox.width * 1.3}
                height={scanBandHeight}
                fill={`url(#${scanGradientId})`}
              >
                <animate
                  attributeName="y"
                  values={`${scanStartY};${scanEndY};${scanEndY}`}
                  keyTimes={`0;${scanActiveRatioLabel};1`}
                  dur={scanCycleDuration}
                  repeatCount="1"
                  fill="freeze"
                />
                <animate
                  attributeName="opacity"
                  values={`0;0.68;1;1;0`}
                  keyTimes={`0;0.05;${scanActiveRatioLabel * 0.46};${scanActiveRatioLabel};1`}
                  dur={scanCycleDuration}
                  repeatCount="1"
                  fill="freeze"
                />
              </rect>
              </g>
            ) : null}
          </svg>
        )}

        <SilhouetteChassisMenu
          open={chassisMenuOpen}
          typeId={typeId}
          category={category}
          stageMode={stageMode}
          onChooseChassis={chooseChassis}
          onSetStageMode={switchStageMode}
          menuRef={chassisMenuRef}
        />

        {isFrameMode
          ? frameNodes.map((node) => {
              const Icon = node.icon;
              return (
                <span
                  key={node.id}
                  className="monster-frame-node"
                  style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                >
                  <Icon aria-hidden="true" />
                  <small>{node.label}</small>
                  <strong>{frameNodeValues[node.id]}</strong>
                </span>
              );
            })
          : SLOTS.map((slot) => {
              const Icon = slot.icon;
              const anchor = slotNodeAnchors[slot.id] || getSilhouetteAnchor(profile, slot.id);
              const filled = hasSelectedSlot(selected, slot.id);
              const active = activeSlot === slot.id;
              const guided = guidedSlotId === slot.id;
              return (
                <button
                  key={slot.id}
                  ref={(element) => setRefMap(nodeRefs, slot.id, element)}
                  type="button"
                  className={classNames(
                    "monster-silhouette-node",
                    filled ? "is-filled" : "is-empty",
                    active && "is-active",
                    guided && "is-guided",
                    hoverSlotId === slot.id && "is-linked-hover",
                  )}
                  style={{ left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%` }}
                  aria-label={`Focus ${slot.label}`}
                  aria-pressed={active}
                  onClick={(event) => {
                    event.stopPropagation();
                    onFocusSlot(slot.id);
                  }}
                  onPointerEnter={() => onHoverSlot?.(slot.id)}
                  onPointerLeave={() => onHoverSlot?.(null)}
                >
                  <Icon aria-hidden="true" />
                </button>
              );
            })}
      </div>
    </div>
  );
}


function FrameSelectField({ label, value, options, onChange, getValue, getLabel, getMeta, getDescription, getIcon, isDisabled }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const fieldRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selectedOption =
    options.find((option) => String(getValue(option)) === String(value)) || options[0];
  const selectedLabel = selectedOption ? getLabel(selectedOption) : "—";
  const description = selectedOption ? getDescription?.(selectedOption) : "";
  const meta = selectedOption ? getMeta?.(selectedOption) : "";
  const SelectedIcon = selectedOption ? getIcon?.(selectedOption) : null;
  const tooltipText = [description, meta].filter(Boolean).join(" · ");
  const tooltipItems = buildFrameTooltipList(
    options,
    getLabel,
    getDescription,
    getMeta,
    isDisabled,
  );

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (fieldRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return undefined;
    }

    let frameId = 0;

    function updateMenuPosition() {
      const trigger = triggerRef.current;
      const field = fieldRef.current;
      if (!trigger || !field) return;

      const rect = trigger.getBoundingClientRect();
      const fieldRect = field.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const gap = 8;
      const maxHeight = Math.min(320, Math.max(220, viewportHeight * 0.58));
      const preferredWidth = Math.min(260, Math.max(220, viewportWidth * 0.32));
      const hasRightSpace = viewportWidth - rect.right - gap >= preferredWidth;

      if (hasRightSpace) {
        const top = clamp(fieldRect.top, gap, Math.max(gap, viewportHeight - maxHeight - gap));
        setMenuStyle({
          top: `${Math.round(top)}px`,
          left: `${Math.round(rect.right + gap)}px`,
          width: `${Math.round(preferredWidth)}px`,
          maxHeight: `${Math.round(maxHeight)}px`,
        });
        return;
      }

      const fallbackWidth = Math.min(
        Math.max(rect.width, 220),
        Math.max(220, viewportWidth - gap * 2),
      );
      const left = clamp(rect.left, gap, Math.max(gap, viewportWidth - fallbackWidth - gap));
      const belowTop = rect.bottom + 6;
      const top = belowTop + maxHeight <= viewportHeight - gap
        ? belowTop
        : Math.max(gap, rect.top - maxHeight - 6);

      setMenuStyle({
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        width: `${Math.round(fallbackWidth)}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
      });
    }

    function scheduleUpdate() {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateMenuPosition);
    }

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [open, value, options]);

  const menuPortalTarget = typeof document !== "undefined"
    ? document.querySelector(".monster-shell") || document.body
    : null;

  return (
    <div className="monster-frame-select-field" ref={fieldRef}>
      <div className="monster-frame-field-head">
        <span>{label}</span>
        <FrameTooltip title={label} text={tooltipText} items={tooltipItems} />
      </div>
      <button
        className="monster-frame-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        ref={triggerRef}
        onClick={() => setOpen((current) => !current)}
      >
        {SelectedIcon ? <SelectedIcon aria-hidden="true" /> : null}
        <strong>{selectedLabel}</strong>
        {meta ? <small>{meta}</small> : null}
      </button>
      {open && menuPortalTarget
        ? createPortal(
            <div
              className="monster-frame-select-menu"
              role="listbox"
              aria-label={label}
              ref={menuRef}
              style={menuStyle || undefined}
            >
              {options.map((option) => {
                const optionValue = getValue(option);
                const disabled = Boolean(isDisabled?.(option));
                const active = String(optionValue) === String(value);
                const OptionIcon = getIcon?.(option);
                return (
                  <button
                    key={optionValue}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={disabled}
                    className={`monster-frame-select-option ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
                    onClick={() => {
                      if (disabled) return;
                      onChange(optionValue);
                      setOpen(false);
                    }}
                  >
                    {OptionIcon ? <OptionIcon aria-hidden="true" /> : null}
                    <span>
                      <strong>{getLabel(option)}</strong>
                      {getDescription?.(option) ? <small>{getDescription(option)}</small> : null}
                    </span>
                  </button>
                );
              })}
            </div>,
            menuPortalTarget,
          )
        : null}
    </div>
  );
}

function FrameIconToggleGroup({ label, value, options, onChange, getValue, getLabel, getMeta, getDescription, getIcon, isDisabled }) {
  const selectedOption =
    options.find((option) => String(getValue(option)) === String(value)) || options[0];
  const selectedLabel = selectedOption ? getLabel(selectedOption) : "—";
  const description = selectedOption ? getDescription?.(selectedOption) : "";
  const meta = selectedOption ? getMeta?.(selectedOption) : "";
  const tooltipText = [description, meta].filter(Boolean).join(" · ");
  const tooltipItems = buildFrameTooltipList(
    options,
    getLabel,
    getDescription,
    getMeta,
    isDisabled,
  );

  return (
    <div className="monster-frame-select-field monster-frame-icon-field">
      <div className="monster-frame-field-head">
        <span>{label}</span>
        <strong>{selectedLabel}</strong>
        <FrameTooltip title={label} text={tooltipText} items={tooltipItems} />
      </div>
      <div className="monster-frame-icon-toggle-row" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const optionValue = getValue(option);
          const disabled = Boolean(isDisabled?.(option));
          const active = String(optionValue) === String(value);
          const OptionIcon = getIcon?.(option) || Activity;
          return (
            <button
              key={optionValue}
              className={`monster-frame-icon-toggle ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
              type="button"
              role="radio"
              aria-label={getLabel(option)}
              aria-checked={active}
              aria-disabled={disabled}
              disabled={disabled}
              data-key="tooltip-generic"
              data-tooltip={getLabel(option)}
              data-tooltip-description={[getDescription?.(option), getMeta?.(option)].filter(Boolean).join(" · ")}
              onClick={() => {
                if (!disabled) onChange(optionValue);
              }}
            >
              <OptionIcon aria-hidden="true" />
              <span className="sr-only">{getLabel(option)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FrameControls({
  typeId,
  category,
  creatureType,
  role,
  roleId,
  targetCr,
  tacticalRole,
  tacticalRoleId,
  monsterTierId,
  tempoProfileId,
  danger,
  dangerId,
  selectType,
  setCategory,
  setRoleId,
  setTargetCr,
  setTacticalRoleId,
  setMonsterTierId,
  setTempoProfileId,
  setDangerId,
  setActivePresetId,
}) {
  const setFrameValue = (setter, value) => {
    setter(value);
    setActivePresetId("");
  };

  return (
    <ComposerRail
      side="left"
      variant="controls"
      scrollable
      className="anatomy-stage__column anatomy-stage__column--left monster-frame-controls"
      aria-label="Monster Frame controls"
    >
      <section className="monster-frame-control-block">
        <div className="monster-frame-control-block__head">
          <span>Chassis</span>
        </div>
        <div className="monster-frame-selector-stack">
          <FrameSelectField
            label="Family"
            value={typeId}
            options={CREATURE_TYPES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => FRAME_TYPE_ICON_MAP[item.id] || item.icon}
            getDescription={(item) => FRAME_TYPE_COPY[item.id]}
            getMeta={(item) => `${item.categories.length} variants`}
            isDisabled={(item) => isCreatureTypeUnavailable(item.id)}
            onChange={(nextTypeId) => selectType(nextTypeId)}
          />
          <FrameSelectField
            label="Variant"
            value={category}
            options={creatureType.categories}
            getValue={(item) => item}
            getLabel={(item) => item}
            getIcon={() => VARIANT_ICON}
            getDescription={() => "Creature body variant."}
            isDisabled={(item) => isCreatureCategoryUnavailable(typeId, item)}
            onChange={(nextCategory) => setFrameValue(setCategory, nextCategory)}
          />
        </div>
      </section>

      <section className="monster-frame-control-block">
        <div className="monster-frame-control-block__head">
          <span>Combat Identity</span>
        </div>
        <div className="monster-frame-selector-stack">
          <FrameIconToggleGroup
            label="Encounter Footprint"
            value={roleId}
            options={ROLES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => ROLE_ICON_MAP[item.id] || createFaIcon("chess-knight")}
            getDescription={(item) => item.summary}
            getMeta={(item) => `HP ${Math.round(item.hpMult * 100)} · DPR ${Math.round(item.dprMult * 100)}`}
            onChange={(nextRoleId) => setFrameValue(setRoleId, nextRoleId)}
          />
          <FrameIconToggleGroup
            label="Role"
            value={tacticalRoleId}
            options={TACTICAL_ROLES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => TACTICAL_ROLE_ICON_MAP[item.id] || createFaIcon("diagram-project")}
            getDescription={(item) => item.summary || "Primary tactical behavior."}
            onChange={(nextTacticalRoleId) => setFrameValue(setTacticalRoleId, nextTacticalRoleId)}
          />
        </div>
      </section>

      <section className="monster-frame-control-block">
        <div className="monster-frame-control-block__head">
          <span>Threat Profile</span>
        </div>
        <div className="monster-frame-selector-stack">
          <FrameCrControl
            value={targetCr}
            setTargetCr={setTargetCr}
            setActivePresetId={setActivePresetId}
          />
          <FrameIconToggleGroup
            label="Tier"
            value={monsterTierId}
            options={MONSTER_TIERS}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => MONSTER_TIER_ICON_MAP[item.id] || createFaIcon("gem")}
            getDescription={(item) => item.summary || "Encounter weight and durability."}
            onChange={(nextMonsterTierId) => setFrameValue(setMonsterTierId, nextMonsterTierId)}
          />
          <FrameIconToggleGroup
            label="Tempo"
            value={tempoProfileId}
            options={TEMPO_PROFILES}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => TEMPO_ICON_MAP[item.id] || createFaIcon("gauge-high")}
            getDescription={(item) => item.summary || "How quickly the monster applies pressure."}
            onChange={(nextTempoProfileId) => setFrameValue(setTempoProfileId, nextTempoProfileId)}
          />
          <FrameIconToggleGroup
            label="Danger"
            value={dangerId}
            options={DANGERS}
            getValue={(item) => item.id}
            getLabel={(item) => item.label}
            getIcon={(item) => DANGER_ICON_MAP[item.id] || createFaIcon("triangle-exclamation")}
            getDescription={(item) => item.summary || "How punishing the final build should feel."}
            onChange={(nextDangerId) => setFrameValue(setDangerId, nextDangerId)}
          />
        </div>
      </section>

    </ComposerRail>
  );
}

function FrameInfoPanel({
  computed,
  monsterName,
  onMonsterNameChange,
  creatureType,
  category,
  role,
  targetCr,
  tacticalRole,
  monsterTier,
  tempoProfile,
  danger,
}) {
  return (
    <ComposerRail
      side="right"
      variant="info"
      scrollable
      className="anatomy-stage__column anatomy-stage__column--right monster-frame-info"
      aria-label="Current Monster Frame"
    >
      <section className="cruor-composer-rail-card cruor-composer-rail-card--hero monster-frame-info-card monster-frame-info-card--hero">
        <span>Current Frame</span>
        <MonsterNameEditor value={monsterName || computed.name} onChange={onMonsterNameChange} />
        <em>{creatureType.label} · {category} · {role.label}</em>
      </section>
      <section className="cruor-composer-rail-card monster-frame-info-card">
        <div className="cruor-composer-fact-grid monster-frame-info-grid">
          <FrameSummaryRow label="Family" value={creatureType.label} />
          <FrameSummaryRow label="Variant" value={category} />
          <FrameSummaryRow label="Footprint" value={role.label} />
          <FrameSummaryRow label="Job" value={tacticalRole.label} />
          <FrameSummaryRow label="CR" value={targetCr} />
          <FrameSummaryRow label="Tier" value={monsterTier.label} />
          <FrameSummaryRow label="Tempo" value={tempoProfile.label} />
          <FrameSummaryRow label="Danger" value={danger.label} />
        </div>
      </section>
      <section className="cruor-composer-rail-card monster-frame-info-card">
        <FrameMeter label="Pressure" value={computed.pressure} max={computed.budget} />
        <FrameMeter label="Complexity" value={computed.complexity} max={computed.complexityCap} />
      </section>
    </ComposerRail>
  );
}

function GraftInfoPanel({
  computed,
  monsterName,
  onMonsterNameChange,
  composerStarted,
  onForgeMonster,
  onOpenExport,
  onStartOver,
  creatureType,
  category,
  role,
  targetCr,
  tacticalRole,
  monsterTier,
  tempoProfile,
  danger,
  selected,
  activeSlot,
  features = [],
}) {
  const slot = SLOTS.find((item) => item.id === activeSlot) || null;
  const availableFeatures = Array.isArray(features) ? features : [];
  const slotFeatures = slot
    ? getSelectedIdsForSlot(selected, slot.id)
        .map((id) => availableFeatures.find((feature) => feature.id === id))
        .filter(Boolean)
    : [];
  const candidates = slot
    ? availableFeatures.filter((feature) => feature.slot === slot.id).length
    : SLOTS.reduce((total, item) => total + availableFeatures.filter((feature) => feature.slot === item.id).length, 0);

  return (
    <ComposerRail
      side="right"
      variant="info"
      scrollable
      className="anatomy-stage__column anatomy-stage__column--right monster-frame-info monster-graft-info"
      aria-label="Current monster information"
    >
      <section className="cruor-composer-rail-card cruor-composer-rail-card--hero monster-frame-info-card monster-frame-info-card--hero">
        <span>Info</span>
        <MonsterNameEditor value={monsterName || computed.name} onChange={onMonsterNameChange} />
        <em>{creatureType.label} · {category} · CR {targetCr}</em>
      </section>

      <section className="cruor-composer-rail-card monster-frame-info-card">
        <div className="cruor-composer-fact-grid monster-frame-info-grid">
          <FrameSummaryRow label="Role" value={role.label} />
          <FrameSummaryRow label="Tactic" value={tacticalRole.label} />
          <FrameSummaryRow label="Tier" value={monsterTier.label} />
          <FrameSummaryRow label="Tempo" value={tempoProfile.label} />
          <FrameSummaryRow label="Danger" value={danger.label} />
          <FrameSummaryRow label="Slots" value={`${SLOTS.filter((item) => hasSelectedSlot(selected, item.id)).length}/${SLOTS.length}`} />
        </div>
      </section>

      <section className="cruor-composer-rail-card monster-frame-info-card">
        <div className="monster-graft-focus">
          <span>Focused Slot</span>
          <strong>{slot ? slot.label : "No Slot Selected"}</strong>
          <p>{slot ? slotFeatures[0]?.title || slot.hint : "Choose a graft slot to inspect its installed feature and compatible alternatives."}</p>
          <em>{slot ? slotFeatures.length ? `${slotFeatures.length} installed` : `${candidates} compatible grafts` : `${candidates} compatible grafts available`}</em>
        </div>
      </section>

      <section className="cruor-composer-rail-card monster-frame-info-card">
        <FrameMeter label="Pressure" value={computed.pressure} max={computed.budget} />
        <FrameMeter label="Complexity" value={computed.complexity} max={computed.complexityCap} />
      </section>
      <GraftActionPanel
        composerStarted={composerStarted}
        onForgeMonster={onForgeMonster}
        onOpenExport={onOpenExport}
        onStartOver={onStartOver}
      />
    </ComposerRail>
  );
}

export function MonsterSilhouetteMap({
  typeId,
  category,
  activePreset,
  selected,
  activeSlot,
  guidedSlotId,
  computed,
  started,
  startMode,
  presetsCount,
  stageMode = "grafts",
  stageTransition = "",
  onSetStageMode,
  monsterName,
  onMonsterNameChange,
  onForgeMonster,
  onOpenComponents,
  onOpenExport,
  onStartOver,
  composerStarted,
  creatureType,
  role,
  roleId,
  targetCr,
  tacticalRole,
  tacticalRoleId,
  monsterTier,
  monsterTierId,
  tempoProfile,
  tempoProfileId,
  danger,
  dangerId,
  onPickTemplate,
  onBuildFromScratch,
  onOpenFrame,
  onFocusSlot,
  selectType,
  setCategory,
  setActivePresetId,
  setRoleId,
  setTargetCr,
  setTacticalRoleId,
  setMonsterTierId,
  setTempoProfileId,
  setDangerId,
  componentNavigatorPanel,
  guidedFlowPanel,
  features = [],
}) {
  const silhouetteId = getSilhouetteId(typeId, category, activePreset);
  const profile = getSilhouetteProfile(typeId, category, activePreset);
  const filledCount = SLOTS.filter((slot) => hasSelectedSlot(selected, slot.id)).length;
  const safeCreatureType = creatureType || CREATURE_TYPES.find((type) => type.id === typeId) || CREATURE_TYPES[0];
  const safeRole = role || ROLES.find((item) => item.id === roleId) || ROLES[1];
  const safeTacticalRole = tacticalRole || TACTICAL_ROLES.find((item) => item.id === tacticalRoleId) || TACTICAL_ROLES[0];
  const safeMonsterTier = monsterTier || MONSTER_TIERS.find((item) => item.id === monsterTierId) || MONSTER_TIERS[0];
  const safeTempoProfile = tempoProfile || TEMPO_PROFILES.find((item) => item.id === tempoProfileId) || TEMPO_PROFILES[1];
  const safeDanger = danger || DANGERS.find((item) => item.id === dangerId) || DANGERS[0];
  const isFrameMode = stageMode === "frame";
  const availableFeatures = Array.isArray(features) ? features : [];
  const hasComponentNavigator = Boolean(componentNavigatorPanel);
  const graftGridRef = useRef(null);
  const slotCardRefs = useRef(new Map());
  const nodeRefs = useRef(new Map());
  const [hoverSlotId, setHoverSlotId] = useState(null);
  const slotConnectionStates = SLOTS.map((slot) => ({
    id: slot.id,
    filled: hasSelectedSlot(selected, slot.id),
    active: activeSlot === slot.id,
    guided: guidedSlotId === slot.id,
  }));
  const slotConnectionKey = [
    silhouetteId,
    stageMode,
    activeSlot,
    guidedSlotId || "",
    hasComponentNavigator ? "navigator" : "no-navigator",
    ...slotConnectionStates.map((state) => `${state.id}:${state.filled ? 1 : 0}:${state.active ? 1 : 0}:${state.guided ? 1 : 0}`),
  ].join("|");

  const frameNodeValues = {
    family: safeCreatureType.label,
    variant: category,
    role: safeRole.label,
    tactic: safeTacticalRole.label,
    challenge: `CR ${targetCr}`,
    danger: safeDanger.label,
  };

  function getSlotCardData(slotId) {
    const slot = SLOTS.find((item) => item.id === slotId) || SLOTS[0];
    const Icon = slot.icon;
    const card = SILHOUETTE_SLOT_CARDS[slot.id] || { side: "center" };
    const slotFeatures = getSelectedIdsForSlot(selected, slot.id)
      .map((id) => availableFeatures.find((feature) => feature.id === id))
      .filter(Boolean);
    const feature = slotFeatures[0] || null;
    const filled = slotFeatures.length > 0;
    const active = activeSlot === slot.id;
    const guided = guidedSlotId === slot.id;
    const linkedHover = hoverSlotId === slot.id;

    return { slot, Icon, card, slotFeatures, feature, filled, active, guided, linkedHover };
  }

  function renderSlotCard(slotId) {
    const { slot, Icon, card, slotFeatures, feature, filled, active, guided, linkedHover } =
      getSlotCardData(slotId);

    return (
      <button
        key={slot.id}
        ref={(element) => setRefMap(slotCardRefs, slot.id, element)}
        type="button"
        className={classNames(
          "monster-silhouette-slot-card",
          card.side === "bottom" && "is-bottom",
          filled ? "is-filled" : "is-empty",
          active && "is-active",
          guided && "is-guided",
          linkedHover && "is-linked-hover",
        )}
        aria-label={`Focus ${slot.label}`}
        aria-pressed={active}
        onClick={(event) => {
          event.stopPropagation();
          onFocusSlot(slot.id);
        }}
        onPointerEnter={() => setHoverSlotId(slot.id)}
        onPointerLeave={() => setHoverSlotId(null)}
      >
        <span className="monster-silhouette-slot-card__head">
          <span>
            <Icon aria-hidden="true" /> {slot.label}
          </span>
          <strong>{slotFeatures.length || "—"}</strong>
        </span>
        <span className="monster-silhouette-slot-card__body">
          {feature ? (
            <>
              <strong>{feature.title}</strong>
              <em>{normalizeMonsterReferences(feature.summary, computed)}</em>
            </>
          ) : (
            <>
              <strong>Empty Slot</strong>
              <em>{slot.hint}</em>
            </>
          )}
        </span>
      </button>
    );
  }

  function renderStageCenter() {
    return (
      <MonsterSilhouetteCore
        profile={profile}
        silhouetteId={silhouetteId}
        typeId={typeId}
        category={category}
        selected={selected}
        activeSlot={activeSlot}
        guidedSlotId={guidedSlotId}
        stageMode={stageMode}
        frameNodeValues={frameNodeValues}
        nodeRefs={nodeRefs}
        hoverSlotId={hoverSlotId}
        onHoverSlot={setHoverSlotId}
        onOpenFrame={onOpenFrame}
        onFocusSlot={onFocusSlot}
        onSetStageMode={onSetStageMode}
        selectType={selectType}
        setCategory={setCategory}
        setActivePresetId={setActivePresetId}
        stageTransition={stageTransition}
      />
    );
  }

  return (
    <section className="monster-anatomy-composer" aria-label="Monster anatomy composer">
      {!started ? (
        <div
          className="monster-start-screen-transition"
          data-stage-transition={stageTransition || "idle"}
        >
          <MonsterStartScreen
            onPickTemplate={onPickTemplate}
            onBuildFromScratch={onBuildFromScratch}
            presetsCount={presetsCount}
          />
        </div>
      ) : (
        <>
          <div
            className={`monster-silhouette-stage anatomy-stage ${isFrameMode ? "is-frame-mode" : "is-grafts-mode"}`}
            data-active-slot={activeSlot}
            data-start-mode={startMode || "manual"}
            data-stage-mode={stageMode}
            data-stage-transition={stageTransition || "idle"}
          >
            {isFrameMode ? (
              <div className="anatomy-stage__grid anatomy-stage__grid--frame">
                <FrameControls
                  typeId={typeId}
                  category={category}
                  creatureType={safeCreatureType}
                  role={safeRole}
                  roleId={roleId}
                  targetCr={targetCr}
                  tacticalRole={safeTacticalRole}
                  tacticalRoleId={tacticalRoleId}
                  monsterTierId={monsterTierId}
                  tempoProfileId={tempoProfileId}
                  danger={safeDanger}
                  dangerId={dangerId}
                  selectType={selectType}
                  setCategory={setCategory}
                  setRoleId={setRoleId}
                  setTargetCr={setTargetCr}
                  setTacticalRoleId={setTacticalRoleId}
                  setMonsterTierId={setMonsterTierId}
                  setTempoProfileId={setTempoProfileId}
                  setDangerId={setDangerId}
                  setActivePresetId={setActivePresetId}
                />
                {renderStageCenter()}
                <FrameInfoPanel
                  computed={computed}
                  monsterName={monsterName}
                  onMonsterNameChange={onMonsterNameChange}
                  creatureType={safeCreatureType}
                  category={category}
                  role={safeRole}
                  targetCr={targetCr}
                  tacticalRole={safeTacticalRole}
                  monsterTier={safeMonsterTier}
                  tempoProfile={safeTempoProfile}
                  danger={safeDanger}
                  onPickTemplate={onPickTemplate}
                  onSetStageMode={onSetStageMode}
                />
              </div>
            ) : (
              <div
                ref={graftGridRef}
                className={`anatomy-stage__grid anatomy-stage__grid--grafts ${hasComponentNavigator ? "has-navigator" : ""}`}
                data-navigator-open={hasComponentNavigator ? "true" : "false"}
              >
                <AnatomyConnectionLayer
                  enabled={!isFrameMode}
                  gridRef={graftGridRef}
                  nodeRefs={nodeRefs}
                  slotCardRefs={slotCardRefs}
                  slotStates={slotConnectionStates}
                  dependencyKey={slotConnectionKey}
                  hoverSlotId={hoverSlotId}
                  onHoverSlot={setHoverSlotId}
                />

                {hasComponentNavigator ? (
                  <div
                    className="anatomy-stage__navigator-focus-overlay"
                    aria-hidden="true"
                  />
                ) : null}

                <ComposerRail
                  side="left"
                  variant="slots"
                  scrollable
                  className="anatomy-stage__column anatomy-stage__column--left"
                  aria-label="Anatomy graft slots"
                >
                  <div className="anatomy-stage__slot-stack">
                    {["body", "attack", "mind", "twist", "movement", "horror", "weakness", "death", ...ANATOMY_BOTTOM_SLOT_IDS].map(renderSlotCard)}
                  </div>
                </ComposerRail>

                {hasComponentNavigator ? (
                  <div
                    className="anatomy-stage__navigator-column"
                    aria-label="Graft navigator drawer"
                  >
                    {componentNavigatorPanel}
                  </div>
                ) : null}

                {renderStageCenter()}

                <GraftInfoPanel
                  computed={computed}
                  monsterName={monsterName}
                  onMonsterNameChange={onMonsterNameChange}
                  composerStarted={composerStarted}
                  onForgeMonster={onForgeMonster}
                  onOpenExport={onOpenExport}
                  onStartOver={onStartOver}
                  onSetStageMode={onSetStageMode}
                  creatureType={safeCreatureType}
                  category={category}
                  role={safeRole}
                  targetCr={targetCr}
                  tacticalRole={safeTacticalRole}
                  monsterTier={safeMonsterTier}
                  tempoProfile={safeTempoProfile}
                  danger={safeDanger}
                  selected={selected}
                  activeSlot={activeSlot}
                  features={availableFeatures}
                />
              </div>
            )}
            {guidedFlowPanel ? (
              <div
                className={`monster-stage-progress-dock ${isFrameMode ? "monster-stage-progress-dock--frame" : "monster-stage-progress-dock--grafts"} ${hasComponentNavigator ? "is-under-navigator-focus" : ""}`}
              >
                {guidedFlowPanel}
                {hasComponentNavigator ? (
                  <div className="monster-stage-progress-focus-overlay" aria-hidden="true" />
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
