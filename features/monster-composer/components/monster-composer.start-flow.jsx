import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";
import "./monster-composer.start-flow.css";

const FLOW_DOCK_STORAGE_KEY = "cruor.monsterComposer.flowDockOpen";

function readStoredDockState() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FLOW_DOCK_STORAGE_KEY) === "true";
  } catch {
    return false;
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

function getActiveStep(steps, guidedFlow) {
  return guidedFlow.activeStep || steps.find((step) => step.active) || steps[0] || null;
}


function getActiveScreenLabel(activeStep, stageMode) {
  if (stageMode === "frame") return "Monster Frame";
  if (stageMode === "grafts") return "Graft Composer";
  if (activeStep?.id === "review") return "Balance Review";
  if (activeStep?.id === "export") return "Export";
  if (activeStep?.id === "start") return "Start Screen";
  return "Monster Composer";
}

function getWarningSeverity(warning) {
  const text = String(warning || "").toLowerCase();
  if (
    text.includes("critical") ||
    text.includes("missing") ||
    text.includes("unsafe") ||
    text.includes("no weakness") ||
    text.includes("counterplay")
  ) {
    return "critical";
  }
  if (text.includes("above") || text.includes("over") || text.includes("high")) return "major";
  return "minor";
}

export function GuidedFlowPanel({
  guidedFlow,
  onOpenStart,
  onFocusSlot,
  onOpenBalance,
  onOpenExport,
}) {
  const [dockOpen, setDockOpen] = useState(readStoredDockState);
  const dockRef = useRef(null);
  const [stageMode, setStageMode] = useState("");
  const steps = guidedFlow.steps || [];
  const activeStep = getActiveStep(steps, guidedFlow);
  const progressPercent = Math.round((guidedFlow.progress || 0) * 100);
  const warnings = guidedFlow.prioritizedWarnings || [];
  const readiness = guidedFlow.readiness || [];
  const nextAction = guidedFlow.nextAction || null;
  const screenLabel = getActiveScreenLabel(activeStep, stageMode);
  const drawerPanelId = "monsterFlowDrawerPanel";

  const activeStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.active)
  );
  const flowStepCount = Math.max(steps.length, 1);
  const flowActiveProgress =
    flowStepCount > 1 ? Math.max(activeStepIndex, 0) / (flowStepCount - 1) : 0;
  const previousStep = useMemo(
    () =>
      [...steps]
        .slice(0, activeStepIndex)
        .reverse()
        .find((step) => !step.disabled),
    [activeStepIndex, steps]
  );
  const nextStep = useMemo(
    () => steps.slice(activeStepIndex + 1).find((step) => !step.disabled),
    [activeStepIndex, steps]
  );

  useEffect(() => {
    writeStoredDockState(dockOpen);
  }, [dockOpen]);

  useEffect(() => {
    const stage = dockRef.current?.closest?.(".monster-silhouette-stage");
    const nextStageMode = stage?.getAttribute?.("data-stage-mode") || "";
    setStageMode(nextStageMode);
  });

  function handleStepClick(step) {
    if (step.disabled) return;
    if (step.action === "start") {
      onOpenStart?.();
      return;
    }
    if (step.action === "slot" && step.slotId) {
      onFocusSlot?.(step.slotId);
      return;
    }
    if (step.action === "review") {
      onOpenBalance?.();
      return;
    }
    if (step.action === "export") {
      if (guidedFlow.exportReady) onOpenExport?.();
      else onOpenBalance?.();
    }
  }

  function handleNextAction() {
    const action = guidedFlow.nextAction;
    if (!action) return;
    if (action.kind === "start") onOpenStart?.();
    if (action.kind === "slot" && action.slotId) onFocusSlot?.(action.slotId);
    if (action.kind === "review") onOpenBalance?.();
    if (action.kind === "export") onOpenExport?.();
  }

  return (
    <section
      ref={dockRef}
      className={`guided-flow-panel guided-flow-drawer ${dockOpen ? "is-open" : "is-collapsed"}`}
      data-flow-dock-state={dockOpen ? "open" : "collapsed"}
      aria-label="Build flow"
    >
      <div
        id={drawerPanelId}
        className="guided-flow-drawer__panel"
        aria-hidden={!dockOpen}
      >
        <div className="guided-flow-drawer__next">
          <div className="guided-flow-drawer__next-copy">
            <span>Next Best Action</span>
            <strong>{nextAction?.title || "Choose how to begin"}</strong>
            <p>{nextAction?.detail || "Start from a template or an empty frame."}</p>
          </div>
          <button type="button" onClick={handleNextAction}>
            {nextAction?.cta || "Start"}
          </button>
        </div>

        <div className="guided-flow-drawer__timeline">
          <button
            className="monster-flow-nav-btn monster-flow-nav-btn--previous"
            type="button"
            aria-label="Previous build step"
            disabled={!previousStep}
            onClick={() => previousStep && handleStepClick(previousStep)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>

          <nav
            className="brief-wizard__progress monster-flow-progress"
            aria-label="Monster build progress"
            style={{
              "--brief-progress": String(guidedFlow.progress),
              "--flow-step-count": String(flowStepCount),
              "--flow-active-step": String(Math.max(activeStepIndex, 0)),
              "--flow-active-progress": String(flowActiveProgress),
            }}
          >
            {steps.map((step) => (
              <button
                key={step.id}
                className={`brief-step-btn ${step.reached ? "reached" : ""} ${step.active ? "active" : ""}`}
                type="button"
                data-brief-step={step.number - 1}
                disabled={step.disabled}
                aria-current={step.active ? "step" : "false"}
                title={step.detail}
                onClick={() => handleStepClick(step)}
              >
                <span className="brief-step-number">{step.number}</span>
                <span className="brief-step-label">{step.label}</span>
              </button>
            ))}
          </nav>

          <button
            className="monster-flow-nav-btn monster-flow-nav-btn--next"
            type="button"
            aria-label="Next build step"
            disabled={!nextStep}
            onClick={() => nextStep && handleStepClick(nextStep)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="guided-flow-drawer__status-row">
          <div className="guided-flow-drawer__readiness" aria-label="Build readiness">
            {readiness.map((item) => {
              const BadgeIcon = item.reached ? CheckCircle2 : Circle;
              const tooltip = [item.label, item.detail].filter(Boolean).join(": ");
              return (
                <span
                  key={item.id}
                  className={`guided-flow-drawer__badge ${item.reached ? "is-ready" : ""}`}
                  title={tooltip}
                  aria-label={tooltip}
                  data-key="tooltip-generic"
                  data-tooltip={item.label}
                  data-tooltip-description={item.detail}
                >
                  <BadgeIcon aria-hidden="true" />
                  <span className="guided-flow-drawer__badge-text">{item.label}</span>
                </span>
              );
            })}
          </div>

          <div className="guided-flow-drawer__warnings" aria-label="Build warnings">
            {warnings.length ? (
              warnings.map((warning) => (
                <span
                  key={warning}
                  className={`guided-flow-drawer__warning is-${getWarningSeverity(warning)}`}
                  title={warning}
                  aria-label={warning}
                  data-key="tooltip-generic"
                  data-tooltip={`${getWarningSeverity(warning)} warning`}
                  data-tooltip-description={warning}
                >
                  <AlertTriangle aria-hidden="true" />
                  <span className="guided-flow-drawer__warning-text">{warning}</span>
                </span>
              ))
            ) : (
              <span className="guided-flow-drawer__clean">
                <CheckCircle2 aria-hidden="true" />
                No priority warnings
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        className="guided-flow-drawer__toggle"
        type="button"
        aria-expanded={dockOpen}
        aria-controls={drawerPanelId}
        onClick={() => setDockOpen((current) => !current)}
      >
        <span className="guided-flow-drawer__toggle-main">
          <strong>{screenLabel}</strong>
          <em>{nextAction?.label || nextAction?.title || "Next Action"}</em>
        </span>
        <span className="guided-flow-drawer__toggle-meta">
          <span>{progressPercent}%</span>
          <span>{warnings.length} warnings</span>
        </span>
        {dockOpen ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
      </button>
    </section>
  );
}

export function MonsterStartScreen({ onPickTemplate, onBuildFromScratch }) {
  return (
    <div className="monster-start-screen" aria-label="Choose how to begin">
      <div className="monster-start-screen__intro">
        <h3>Choose how to begin</h3>
        <p>Start from a ready horror family or build an empty anatomy frame slot by slot.</p>
      </div>

      <div className="monster-start-grid">
        <button
          type="button"
          className="monster-start-card monster-start-card--template"
          onClick={onPickTemplate}
        >
          <span className="monster-start-card__icon">
            <BookOpen aria-hidden="true" />
          </span>
          <span className="monster-start-card__body">
            <strong>Pick a Template</strong>
            <em>Load a complete horror monster family, then customize its anatomy.</em>
          </span>
        </button>

        <button
          type="button"
          className="monster-start-card monster-start-card--scratch"
          onClick={onBuildFromScratch}
        >
          <span className="monster-start-card__icon">
            <Plus aria-hidden="true" />
          </span>
          <span className="monster-start-card__body">
            <strong>Build from Scratch</strong>
            <em>Start empty and install grafts slot by slot.</em>
          </span>
        </button>
      </div>
    </div>
  );
}

export function TemplatePickerModal({ open, presets, activePresetId, onApply, onClose }) {
  if (!open) return null;

  return (
    <div
      className="template-picker-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Pick a monster template"
    >
      <button
        className="template-picker-modal__scrim"
        type="button"
        aria-label="Close Template Picker"
        onClick={onClose}
      />
      <aside className="panel template-picker-modal__panel" aria-label="Monster templates">
        <div className="template-picker-modal__head">
          <div>
            <h2>Pick a Template</h2>
          </div>
          <button
            className="icon-btn"
            type="button"
            aria-label="Close Template Picker"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="template-picker-grid">
          {presets.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <article key={preset.id} className={`template-choice-card ${active ? "active" : ""}`}>
                <button
                  type="button"
                  className="template-choice-card__button"
                  onClick={() => onApply(preset)}
                >
                  <span className="template-choice-card__title-row">
                    <strong>{preset.label}</strong>
                    <em>{active ? "Loaded" : "Load Template"}</em>
                  </span>
                  <span className="template-choice-card__summary">{preset.summary}</span>
                </button>
              </article>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
