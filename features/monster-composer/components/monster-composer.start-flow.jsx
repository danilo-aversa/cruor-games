import { X } from "lucide-react";
import {
  ComposerStartScreen,
  ComposerWorkflowFooter,
} from "../../../components/ui/composer-command-bar.jsx";

function runMonsterFlowAction(action, handlers) {
  if (!action || action.disabled) return;

  if (action.kind === "start") handlers.onOpenTemplates?.();
  if (action.kind === "chassis") handlers.onOpenChassis?.();
  if (action.kind === "grafts") handlers.onOpenGrafts?.();
  if (action.kind === "slot" && action.slotId) handlers.onFocusSlot?.(action.slotId);
  if (action.kind === "review") handlers.onOpenBalance?.();
  if (action.kind === "export") handlers.onOpenExport?.();
}

export function GuidedFlowPanel({
  guidedFlow,
  onOpenBalance,
  onOpenChassis,
  onOpenExport,
  onOpenGrafts,
  onOpenStart,
  onOpenTemplates,
  onFocusSlot,
  onShowBuildGuideChange,
  showBuildGuide = true,
}) {
  const handlers = {
    onFocusSlot,
    onOpenBalance,
    onOpenChassis,
    onOpenExport,
    onOpenGrafts,
    onOpenTemplates: onOpenTemplates || onOpenStart,
  };

  const bindAction = (action) => action
    ? {
        ...action,
        destinationLabel: action.label,
        onClick: () => runMonsterFlowAction(action, handlers),
      }
    : null;

  const tasks = (guidedFlow.tasks || []).map((task) => ({
    ...task,
    onClick: task.action
      ? () => runMonsterFlowAction(task.action, handlers)
      : null,
  }));

  const blocker = guidedFlow.blocker
    ? {
        ...guidedFlow.blocker,
        action: guidedFlow.blocker.action
          ? {
              ...guidedFlow.blocker.action,
              onClick: () => runMonsterFlowAction(guidedFlow.blocker.action, handlers),
            }
          : null,
      }
    : null;

  return (
    <ComposerWorkflowFooter
      blocker={blocker}
      centerAnchorSelector=".anatomy-stage__center, .balance-workbench, .export-stat-preview"
      context={guidedFlow.context || []}
      currentStageId={guidedFlow.activeStageId}
      navigationAnchorSelector=".anatomy-stage__column--right, .monster-balance-details-rail, .monster-export-details-rail"
      nextAction={bindAction(guidedFlow.nextAction)}
      objective={guidedFlow.objective}
      previousAction={bindAction(guidedFlow.previousAction)}
      primaryAction={bindAction(guidedFlow.primaryAction)}
      productLabel="Terrifying Monsters"
      showBuildGuide={showBuildGuide}
      stages={guidedFlow.stages || []}
      tasks={tasks}
      onShowBuildGuideChange={onShowBuildGuideChange}
    />
  );
}

export function MonsterStartScreen({
  onBuildFromScratch,
  onPickTemplate,
  onShowBuildGuideChange,
  showBuildGuide = true,
}) {
  return (
    <ComposerStartScreen
      description="Start from a ready horror family or define the monster frame yourself."
      onBuildFromScratch={onBuildFromScratch}
      onPickTemplate={onPickTemplate}
      onShowBuildGuideChange={onShowBuildGuideChange}
      scratchDescription="Define the chassis first, then install grafts slot by slot."
      showBuildGuide={showBuildGuide}
      templateDescription="Load a complete horror monster family, then customize its anatomy."
    />
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
