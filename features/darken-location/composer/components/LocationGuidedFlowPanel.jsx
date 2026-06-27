import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
} from "lucide-react";

const FLOW_DOCK_STORAGE_KEY = "cruor.locationComposer.flowDockOpen";

function readStoredDockState() {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem(FLOW_DOCK_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function writeStoredDockState(open) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FLOW_DOCK_STORAGE_KEY, open ? "true" : "false");
  } catch {
    // Ignore storage failures; the dock remains fully usable in-memory.
  }
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MODE_LABELS = {
  theme: "Place Frame",
  scratch: "Rooms",
  export: "Export",
};

const FLOW_STEPS = [
  {
    id: "frame",
    number: 1,
    label: "Frame",
    detail: "Set the place identity and global map structure.",
    mode: "theme",
  },
  {
    id: "rooms",
    number: 2,
    label: "Rooms",
    detail: "Select one room and add table-facing details.",
    mode: "scratch",
  },
  {
    id: "export",
    number: 3,
    label: "Export",
    detail: "Compile the table-ready location insert.",
    mode: "export",
  },
];

const MODE_STAGE_NAV = {
  theme: {
    previous: null,
    next: {
      label: "Rooms",
      tooltip: "Next step: Rooms",
      description: "Keep this place frame and start working one room at a time.",
      mode: "scratch",
    },
  },
  scratch: {
    previous: {
      label: "Frame",
      tooltip: "Previous step: Frame",
      description: "Return to place identity and global map structure.",
      mode: "theme",
    },
    next: {
      label: "Export",
      tooltip: "Next step: Export",
      description: "Review the compiled table-ready location insert.",
      mode: "export",
    },
  },
  export: {
    previous: {
      label: "Rooms",
      tooltip: "Previous step: Rooms",
      description: "Return to selected room details and components.",
      mode: "scratch",
    },
    next: null,
  },
};

function normalizeBuilderMode(builderMode) {
  return builderMode === "map" ? "theme" : builderMode;
}

function getActiveStepIndex(builderMode) {
  const normalizedMode = normalizeBuilderMode(builderMode);
  if (normalizedMode === "scratch") return 1;
  if (normalizedMode === "export") return 2;
  return 0;
}

function getNextAction({
  builderMode,
  generatedMapPreview,
  regions,
  activeRegion,
  activeSlot,
  selectedComponents,
  nextRoomSlot,
  exportIncompleteCount = 0,
}) {
  const normalizedMode = normalizeBuilderMode(builderMode);
  const roomCount = Array.isArray(regions) ? regions.length : 0;
  const componentCount = Array.isArray(selectedComponents) ? selectedComponents.length : 0;

  if (normalizedMode === "theme") {
    if (!roomCount || !generatedMapPreview) {
      return {
        title: "Generate Place",
        detail: "Create the room program and map structure from the current frame.",
        cta: "Generate Place",
        label: "Generate Place",
        kind: roomCount ? "generate-scratch" : "generate-theme",
      };
    }

    return {
      title: "Enter Rooms",
      detail: "The macro structure is ready. Move to individual rooms and add table-facing details.",
      cta: "Rooms",
      label: "Enter Rooms",
      kind: "open-rooms",
    };
  }

  if (normalizedMode === "scratch") {
    if (!activeRegion) {
      return {
        title: "Select Room",
        detail: "Select a room on the map before assigning table-facing details.",
        cta: "Select Room",
        label: "Select Room",
        kind: "open-components",
        disabled: !roomCount,
      };
    }

    if (nextRoomSlot?.slot?.label) {
      return {
        title: `Add ${nextRoomSlot.slot.label}`,
        detail: `Complete the next missing slot for ${activeRegion.name || "the selected room"}.`,
        cta: "Add Slot",
        label: "Add Missing Slot",
        kind: "open-components",
        disabled: !roomCount,
      };
    }

    return {
      title: "Room Ready",
      detail: `${activeRegion.name || "Selected room"} has its required room work slots. Move to another room or review export.`,
      cta: "Open Components",
      label: componentCount ? "Detail Rooms" : "Open Components",
      kind: "open-components",
      disabled: !roomCount,
    };
  }

  if (exportIncompleteCount > 0) {
    return {
      title: `${exportIncompleteCount} room${exportIncompleteCount === 1 ? "" : "s"} incomplete`,
      detail: "Review missing hazards, clues, and encounter twists before copying the room key.",
      cta: "Review Missing",
      label: "Review Missing Content",
      kind: "review-missing",
      disabled: false,
    };
  }

  return {
    title: "Ready to Export",
    detail: "The room key has the required room work slots and can be copied as Markdown.",
    cta: "Copy Markdown",
    label: "Copy Markdown",
    kind: "copy-markdown",
    disabled: false,
  };
}

function getWarningSeverity(warning) {
  const text = String(warning || "").toLowerCase();
  if (text.includes("no rooms") || text.includes("no map")) return "critical";
  if (text.includes("no components") || text.includes("unassigned")) return "major";
  return "minor";
}

function getWarnings({ generatedMapPreview, regions, selectedComponents, builderMode }) {
  const warnings = [];
  const normalizedMode = normalizeBuilderMode(builderMode);
  const roomCount = Array.isArray(regions) ? regions.length : 0;
  const componentCount = Array.isArray(selectedComponents) ? selectedComponents.length : 0;

  if (!roomCount) {
    warnings.push("No rooms in the current place. Generate the place frame before room work.");
  }

  if (normalizedMode === "export" && !generatedMapPreview) {
    warnings.push("No map generated. Generate a location map before export.");
  }

  if ((normalizedMode === "scratch" || normalizedMode === "export") && componentCount === 0) {
    warnings.push("No components assigned. Add at least one table-facing detail, hazard, clue, or consequence.");
  }

  return warnings.slice(0, 3);
}

function getReadiness({ generatedMapPreview, regions, selectedComponents, hasMapManualOverrides }) {
  const roomCount = Array.isArray(regions) ? regions.length : 0;
  const componentCount = Array.isArray(selectedComponents) ? selectedComponents.length : 0;

  return [
    {
      id: "place-draft",
      label: "Place Draft",
      detail: "At least one location room exists.",
      reached: roomCount > 0,
    },
    {
      id: "Mapped Location",
      label: "Mapped Location",
      detail: "A generated map preview is available.",
      reached: Boolean(generatedMapPreview),
    },
    {
      id: "Table Detail",
      label: "Table Detail",
      detail: "At least one playable component has been assigned.",
      reached: componentCount > 0,
    },
    {
      id: "Export Ready",
      label: "Export Ready",
      detail: hasMapManualOverrides ? "Map edits saved and export can be reviewed." : "Location has rooms, map, and table detail.",
      reached: roomCount > 0 && Boolean(generatedMapPreview) && componentCount > 0,
    },
  ];
}

export function LocationGuidedFlowPanel({
  activeRegion,
  activeSlot,
  builderMode = "theme",
  generatedMapPreview,
  hasMapManualOverrides = false,
  nextRoomSlot = null,
  exportIncompleteCount = 0,
  onCopyMarkdown,
  onGenerateScratchMap,
  onGenerateThemeRooms,
  onOpenComponents,
  onReviewMissing,
  onSelectMode,
  regions = [],
  selectedComponents = [],
}) {
  const [dockOpen, setDockOpen] = useState(readStoredDockState);
  const activeStepIndex = getActiveStepIndex(builderMode);
  const flowStepCount = FLOW_STEPS.length;
  const progress = flowStepCount > 1 ? activeStepIndex / (flowStepCount - 1) : 0;
  const activeStep = FLOW_STEPS[activeStepIndex] || FLOW_STEPS[0];
  const nextAction = getNextAction({
    builderMode,
    generatedMapPreview,
    regions,
    activeRegion,
    activeSlot,
    selectedComponents,
    nextRoomSlot,
    exportIncompleteCount,
  });
  const warnings = getWarnings({ generatedMapPreview, regions, selectedComponents, builderMode });
  const readiness = getReadiness({ generatedMapPreview, regions, selectedComponents, hasMapManualOverrides });
  const normalizedMode = normalizeBuilderMode(builderMode);
  const currentStage = MODE_STAGE_NAV[normalizedMode] || MODE_STAGE_NAV.theme;
  const previousStageAction = currentStage.previous;
  const nextStageAction = currentStage.next;
  const screenLabel = MODE_LABELS[normalizedMode] || "Dark Places";
  const progressPercent = Math.round(progress * 100);
  const drawerPanelId = "locationFlowDrawerPanel";

  const previousStep = useMemo(
    () => FLOW_STEPS.slice(0, activeStepIndex).reverse().find((step) => !step.disabled),
    [activeStepIndex],
  );
  const nextStep = useMemo(
    () => FLOW_STEPS.slice(activeStepIndex + 1).find((step) => !step.disabled),
    [activeStepIndex],
  );

  useEffect(() => {
    writeStoredDockState(dockOpen);
  }, [dockOpen]);

  function openMode(mode) {
    if (!mode) return;
    onSelectMode?.(mode);
  }

  function handleStepClick(step) {
    if (!step || step.disabled) return;
    openMode(step.mode);
  }

  function runNextAction() {
    if (nextAction.disabled) return;
    if (nextAction.kind === "generate-theme") onGenerateThemeRooms?.();
    if (nextAction.kind === "generate-scratch") onGenerateScratchMap?.();
    if (nextAction.kind === "open-components") onOpenComponents?.();
    if (nextAction.kind === "open-rooms") openMode("scratch");
    if (nextAction.kind === "open-theme") openMode("theme");
    if (nextAction.kind === "review-missing") onReviewMissing?.();
    if (nextAction.kind === "copy-markdown") onCopyMarkdown?.();
  }

  return (
    <div
      className={cx(
        "location-stage-progress-dock",
        `location-stage-progress-dock--${normalizedMode || "theme"}`,
      )}
    >
      <section
        className={cx("location-flow-panel", "location-flow-drawer", dockOpen ? "is-open" : "is-collapsed")}
        data-location-flow-dock-state={dockOpen ? "open" : "collapsed"}
        aria-label="Build flow"
      >
        <div
          id={drawerPanelId}
          className="location-flow-drawer__panel"
          aria-hidden={!dockOpen}
        >
          <div className="location-flow-drawer__next">
            <div className="location-flow-drawer__next-copy">
              <span>Next Best Action</span>
              <strong>{nextAction.title}</strong>
              <p>{nextAction.detail}</p>
            </div>
            <button type="button" disabled={nextAction.disabled} onClick={runNextAction}>
              {nextAction.cta}
            </button>
          </div>

          <div className="location-flow-drawer__timeline">
            <button
              className="location-flow-nav-btn location-flow-nav-btn--previous"
              type="button"
              aria-label="Previous build step"
              disabled={!previousStep}
              onClick={() => previousStep && handleStepClick(previousStep)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>

            <nav
              className="location-flow-progress"
              aria-label="Dark Places build progress"
              style={{
                "--location-flow-progress": String(progress),
                "--location-flow-step-count": String(flowStepCount),
                "--location-flow-active-step": String(activeStepIndex),
                "--location-flow-active-progress": String(progress),
              }}
            >
              {FLOW_STEPS.map((step, index) => {
                const active = index === activeStepIndex;
                const reached = index < activeStepIndex;
                return (
                  <button
                    key={step.id}
                    className={cx("location-flow-step-btn", reached && "reached", active && "active")}
                    type="button"
                    data-location-flow-step={step.number - 1}
                    aria-current={active ? "step" : "false"}
                    title={step.detail}
                    onClick={() => handleStepClick(step)}
                  >
                    <span className="location-flow-step-number">{step.number}</span>
                    <span className="location-flow-step-label">{step.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              className="location-flow-nav-btn location-flow-nav-btn--next"
              type="button"
              aria-label="Next build step"
              disabled={!nextStep}
              onClick={() => nextStep && handleStepClick(nextStep)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>

          <div className="location-flow-drawer__status-row">
            <div className="location-flow-drawer__readiness" aria-label="Build readiness">
              {readiness.map((item) => {
                const BadgeIcon = item.reached ? CheckCircle2 : Circle;
                const tooltip = [item.label, item.detail].filter(Boolean).join(": ");
                return (
                  <span
                    key={item.id}
                    className={cx("location-flow-drawer__badge", item.reached && "is-ready")}
                    title={tooltip}
                    aria-label={tooltip}
                    data-key="tooltip-generic"
                    data-tooltip={item.label}
                    data-tooltip-description={item.detail}
                  >
                    <BadgeIcon aria-hidden="true" />
                    <span className="location-flow-drawer__badge-text">{item.label}</span>
                  </span>
                );
              })}
            </div>

            <div className="location-flow-drawer__warnings" aria-label="Build warnings">
              {warnings.length ? (
                warnings.map((warning) => {
                  const severity = getWarningSeverity(warning);
                  return (
                    <span
                      key={warning}
                      className={cx("location-flow-drawer__warning", `is-${severity}`)}
                      title={warning}
                      aria-label={warning}
                      data-key="tooltip-generic"
                      data-tooltip={`${severity} warning`}
                      data-tooltip-description={warning}
                    >
                      <AlertTriangle aria-hidden="true" />
                      <span className="location-flow-drawer__warning-text">{warning}</span>
                    </span>
                  );
                })
              ) : (
                <span className="location-flow-drawer__clean">
                  <CheckCircle2 aria-hidden="true" />
                  No priority warnings
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="location-flow-drawer__toggle-row" data-stage-navigation="true">
          <button
            className="location-flow-drawer__stage-btn location-flow-drawer__stage-btn--previous tooltip-btn"
            type="button"
            aria-label={previousStageAction?.label || "Previous step"}
            disabled={!previousStageAction}
            data-key="tooltip-generic"
            data-tooltip={previousStageAction?.tooltip || "Previous step"}
            data-tooltip-description={previousStageAction?.description || "No previous stage available."}
            onClick={() => openMode(previousStageAction?.mode)}
          >
            <ChevronLeft aria-hidden="true" />
            <span>{previousStageAction?.label || "Previous"}</span>
          </button>

          <button
            className="location-flow-drawer__toggle"
            type="button"
            aria-expanded={dockOpen}
            aria-controls={drawerPanelId}
            onClick={() => setDockOpen((current) => !current)}
          >
            <span className="location-flow-drawer__toggle-main">
              <strong>{screenLabel}</strong>
              <em>{activeStep?.label || nextAction.label}</em>
            </span>
            <span className="location-flow-drawer__toggle-meta">
              <span>{progressPercent}%</span>
              <span>{warnings.length} warnings</span>
            </span>
            {dockOpen ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
          </button>

          <button
            className="location-flow-drawer__stage-btn location-flow-drawer__stage-btn--next tooltip-btn"
            type="button"
            aria-label={nextStageAction?.label || "Next step"}
            disabled={!nextStageAction}
            data-key="tooltip-generic"
            data-tooltip={nextStageAction?.tooltip || "Next step"}
            data-tooltip-description={nextStageAction?.description || "No next stage available."}
            onClick={() => openMode(nextStageAction?.mode)}
          >
            <span>{nextStageAction?.label || "Next"}</span>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  );
}
