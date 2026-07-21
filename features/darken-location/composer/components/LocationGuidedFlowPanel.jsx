import { ComposerWorkflowFooter } from "../../../../components/ui/composer-command-bar.jsx";
import { buildLocationCommandFlow } from "../model/location-command-flow.js";

function runLocationFlowAction(action, handlers) {
  if (!action || action.disabled) return;

  if (action.kind === "generate-theme") handlers.onGenerateThemeRooms?.();
  if (action.kind === "generate-scratch") handlers.onGenerateScratchMap?.();
  if (action.kind === "open-components") handlers.onOpenComponents?.();
  if (action.kind === "open-slot" && action.slotId) handlers.onOpenRoomSlot?.(action.slotId);
  if (action.kind === "select-room" && action.regionId) handlers.onSelectRoom?.(action.regionId);
  if (action.kind === "open-frame") handlers.onSelectMode?.("theme");
  if (action.kind === "open-rooms") handlers.onSelectMode?.("scratch");
  if (action.kind === "open-output") handlers.onSelectMode?.("export");
  if (action.kind === "review-missing") handlers.onReviewMissing?.();
  if (action.kind === "copy-markdown") handlers.onCopyMarkdown?.();
}

export function LocationGuidedFlowPanel({
  activeRegion,
  builderMode = "theme",
  exportIncompleteCount = 0,
  frameContext = {},
  generatedMapPreview,
  hasMapManualOverrides = false,
  onCopyMarkdown,
  onGenerateScratchMap,
  onGenerateThemeRooms,
  onOpenComponents,
  onOpenRoomSlot,
  onReviewMissing,
  onSelectMode,
  onSelectRoom,
  onShowBuildGuideChange,
  roomEntries = [],
  selectedComponents = [],
  showBuildGuide = true,
}) {
  const flow = buildLocationCommandFlow({
    activeRegion,
    builderMode,
    exportIncompleteCount,
    frameContext,
    generatedMapPreview,
    hasMapManualOverrides,
    roomEntries,
    selectedComponents,
  });

  const handlers = {
    onCopyMarkdown,
    onGenerateScratchMap,
    onGenerateThemeRooms,
    onOpenComponents,
    onOpenRoomSlot,
    onReviewMissing,
    onSelectMode,
    onSelectRoom,
  };

  const bindAction = (action) => action
    ? {
        ...action,
        destinationLabel: action.label,
        onClick: () => runLocationFlowAction(action, handlers),
      }
    : null;

  const tasks = flow.tasks.map((task) => ({
    ...task,
    onClick: task.action
      ? () => runLocationFlowAction(task.action, handlers)
      : null,
  }));

  const blocker = flow.blocker
    ? {
        ...flow.blocker,
        action: flow.blocker.action
          ? {
              ...flow.blocker.action,
              onClick: () => runLocationFlowAction(flow.blocker.action, handlers),
            }
          : null,
      }
    : null;

  return (
    <ComposerWorkflowFooter
      blocker={blocker}
      centerAnchorSelector=".location-map-stage__center"
      context={flow.context}
      currentStageId={flow.activeStageId}
      navigationAnchorSelector=".location-map-details-rail, .location-output-details-rail"
      nextAction={bindAction(flow.nextAction)}
      objective={flow.objective}
      previousAction={bindAction(flow.previousAction)}
      primaryAction={bindAction(flow.primaryAction)}
      productLabel="Dark Places"
      showBuildGuide={showBuildGuide}
      showHiddenTrigger={false}
      stages={flow.stages}
      tasks={tasks}
      onShowBuildGuideChange={onShowBuildGuideChange}
    />
  );
}
