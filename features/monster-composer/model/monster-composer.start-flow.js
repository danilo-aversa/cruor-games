import { SLOTS } from "../monster-composer.workflow.js";
import { hasSelectedSlot } from "./monster-composer.selection.js";

const CORE_SLOT_IDS = ["body", "weakness"];
const OPTIONAL_SLOT_PRIORITY = ["attack", "movement", "mind", "horror", "twist", "death", "lair"];

const SLOT_COPY = {
  body: {
    title: "Body",
    actionTitle: "Add Body",
    detail: "Define what the creature physically is before choosing attacks.",
    cta: "Add Body",
  },
  attack: {
    title: "Attack Pattern",
    actionTitle: "Add Attack Pattern",
    detail: "Optional. Replace the compiled Basic Attack with a distinctive offensive loop.",
    cta: "Add Attack",
  },
  weakness: {
    title: "Weakness / Tell",
    actionTitle: "Add Weakness / Tell",
    detail: "Give the players visible, actionable counterplay.",
    cta: "Add Weakness",
  },
  movement: {
    title: "Movement",
    actionTitle: "Add Movement",
    detail: "Decide how the monster reaches or pressures the characters.",
    cta: "Add Movement",
  },
  mind: {
    title: "Mind",
    actionTitle: "Add Mind",
    detail: "Give the DM a clear behavior rule to follow.",
    cta: "Add Mind",
  },
  horror: {
    title: "Horror Feature",
    actionTitle: "Add Horror Feature",
    detail: "Install the disturbing element players will remember.",
    cta: "Add Horror",
  },
  twist: {
    title: "Combat Twist",
    actionTitle: "Add Combat Twist",
    detail: "Add one fight-changing rule for a stronger table presence.",
    cta: "Add Twist",
  },
  death: {
    title: "Death Effect",
    actionTitle: "Add Death Effect",
    detail: "Decide what changes when the creature dies.",
    cta: "Add Death Effect",
  },
  lair: {
    title: "Lair / Scene Effect",
    actionTitle: "Add Lair / Scene Effect",
    detail: "Add scene pressure when the battlefield should matter.",
    cta: "Add Lair Effect",
  },
};

function slotLabel(slotId) {
  return SLOTS.find((slot) => slot.id === slotId)?.label || SLOT_COPY[slotId]?.title || slotId;
}

function createSlotTask(slotId, selected, { required = false, current = false } = {}) {
  const complete = hasSelectedSlot(selected, slotId);
  const copy = SLOT_COPY[slotId] || {};

  return {
    id: slotId,
    title: copy.title || slotLabel(slotId),
    detail: complete ? `${slotLabel(slotId)} graft installed.` : copy.detail || "Install this graft.",
    required,
    status: complete ? "complete" : current ? "current" : "open",
    action: complete ? null : { kind: "slot", slotId },
  };
}

function buildReviewChecks(computed) {
  const pressureReady = Number(computed.pressure || 0) <= Number(computed.pressureLimit ?? 0);
  const complexityReady = Number(computed.complexity || 0) <= Number(computed.complexityCap || 0);
  const counterplayReady = ["Strong", "Playable"].includes(computed.counterplayAudit?.rating);
  const advisories = [
    !pressureReady
      ? {
          id: "pressure-over-limit",
          title: "Pressure is above the CR guidance",
          detail: `${computed.pressure || 0} of ${computed.pressureLimit ?? 0}. The build remains usable.`,
        }
      : null,
    !complexityReady
      ? {
          id: "complexity-over-limit",
          title: "Complexity is above the DM guidance",
          detail: `${computed.complexity || 0} of ${computed.complexityCap || 0}. The build remains usable.`,
        }
      : null,
  ].filter(Boolean);

  return {
    pressureReady,
    complexityReady,
    counterplayReady,
    guidanceReady: pressureReady && complexityReady && counterplayReady,
    balanceReady: counterplayReady,
    handoffReady: counterplayReady,
    advisories,
    tasks: [
      {
        id: "pressure",
        title: "Pressure",
        detail: `${computed.pressure || 0} of ${computed.pressureLimit ?? 0} CR-scaled guidance`,
        required: false,
        advisory: !pressureReady,
        status: pressureReady ? "complete" : "open",
        action: pressureReady ? null : { kind: "review" },
      },
      {
        id: "complexity",
        title: "Complexity",
        detail: `${computed.complexity || 0} of ${computed.complexityCap || 0} DM handling guidance`,
        required: false,
        advisory: !complexityReady,
        status: complexityReady ? "complete" : "open",
        action: complexityReady ? null : { kind: "review" },
      },
      {
        id: "counterplay",
        title: "Counterplay",
        detail: computed.counterplayAudit?.rating || "Not evaluated",
        required: true,
        status: counterplayReady ? "complete" : "current",
        action: counterplayReady ? null : { kind: "review" },
      },
    ],
  };
}

function getStructuredBlocker({ coreReady, missingCoreSlotId, review }) {
  if (!coreReady && missingCoreSlotId) {
    return {
      id: `missing-${missingCoreSlotId}`,
      title: `${slotLabel(missingCoreSlotId)} is still missing`,
      detail: "The monster needs Body and Weakness / Tell. A baseline attack is compiled automatically when no Attack Pattern is selected.",
      action: { kind: "slot", slotId: missingCoreSlotId, label: SLOT_COPY[missingCoreSlotId]?.cta || "Add Graft" },
    };
  }


  if (!review.counterplayReady) {
    return {
      id: "counterplay-needs-review",
      title: "Counterplay is not yet reliable",
      detail: "The build needs a visible tell, break condition, or repeatable player response.",
      action: { kind: "review", label: "Review Counterplay" },
    };
  }

  return null;
}


export function buildGuidedFlow({
  activePreset,
  composerStarted,
  computed,
  context = {},
  selected,
  stageMode = "frame",
  startMode,
  viewMode = "composer",
}) {
  const safeSelected = selected || {};
  const safeComputed = computed || {};
  const review = buildReviewChecks(safeComputed);
  review.values = {
    pressure: `${safeComputed.pressure || 0}/${safeComputed.pressureLimit || 0}`,
    complexity: `${safeComputed.complexity || 0}/${safeComputed.complexityCap || 0}`,
  };

  const missingCoreSlotId = CORE_SLOT_IDS.find((slotId) => !hasSelectedSlot(safeSelected, slotId)) || "";
  const recommendedOptionalSlotId = OPTIONAL_SLOT_PRIORITY.find((slotId) => !hasSelectedSlot(safeSelected, slotId)) || "";
  const recommendedSlotId = missingCoreSlotId || recommendedOptionalSlotId || null;
  const coreReady = !missingCoreSlotId;
  const completedSlots = SLOTS.filter((slot) => hasSelectedSlot(safeSelected, slot.id)).length;
  const hasSetpieceSlot = ["twist", "death", "lair"].some((slotId) => hasSelectedSlot(safeSelected, slotId));
  const exportReady = Boolean(composerStarted && coreReady && review.handoffReady);
  const activeStageId = !composerStarted
    ? "chassis"
    : viewMode === "balance"
      ? "review"
      : viewMode === "export"
        ? "stat-block"
        : stageMode === "grafts"
          ? "grafts"
          : "chassis";

  const frameTasks = [
    {
      id: "family",
      title: "Creature Family",
      detail: context.category || "Choose the creature family and anatomy.",
      required: true,
      status: composerStarted ? "complete" : "current",
      action: composerStarted ? null : { kind: "start" },
    },
    {
      id: "role",
      title: "Combat Footprint",
      detail: context.role || "Set the encounter footprint.",
      required: true,
      status: composerStarted ? "complete" : "open",
      action: composerStarted ? null : { kind: "start" },
    },
    {
      id: "challenge",
      title: "Challenge",
      detail: context.targetCr ? `CR ${context.targetCr}` : "Set the target CR.",
      required: true,
      status: composerStarted ? "complete" : "open",
      action: composerStarted ? null : { kind: "start" },
    },
  ];

  const graftTasks = [
    ...CORE_SLOT_IDS.map((slotId) => createSlotTask(slotId, safeSelected, {
      required: true,
      current: slotId === missingCoreSlotId,
    })),
  ];

  if (recommendedOptionalSlotId) {
    graftTasks.push(createSlotTask(recommendedOptionalSlotId, safeSelected, {
      required: false,
      current: coreReady,
    }));
  }

  const blocker = activeStageId === "grafts" || activeStageId === "review"
    ? getStructuredBlocker({ coreReady, missingCoreSlotId, review })
    : null;
  const stages = [
    {
      id: "chassis",
      label: "Chassis",
      detail: "Creature family, role, challenge, and threat profile.",
      status: composerStarted ? "complete" : activeStageId === "chassis" ? "current" : "open",
      action: { kind: "chassis" },
    },
    {
      id: "grafts",
      label: "Grafts",
      detail: "Build the playable anatomy and core combat loop.",
      status: coreReady ? "complete" : activeStageId === "grafts" ? "current" : "open",
      disabled: !composerStarted,
      action: { kind: "grafts" },
    },
    {
      id: "review",
      label: "Review",
      detail: "Check player Pressure, DM Complexity, and counterplay. Load limits are advisory.",
      status: review.handoffReady ? "complete" : coreReady ? "open" : "blocked",
      disabled: !composerStarted,
      action: { kind: "review" },
    },
    {
      id: "stat-block",
      label: "Stat Block",
      detail: "Review and copy the final monster output.",
      status: exportReady ? "complete" : "open",
      disabled: !composerStarted,
      action: { kind: "export" },
    },
  ];

  const activePresetText = activePreset
    ? `${activePreset.label} loaded.`
    : startMode === "scratch"
      ? "Scratch build selected."
      : "Choose a template or start from scratch.";

  let objective;
  let tasks;
  let primaryAction;
  let previousAction = null;
  let nextAction;

  if (!composerStarted) {
    objective = {
      title: "Choose how to begin",
      detail: activePresetText,
    };
    tasks = frameTasks;
    primaryAction = {
      kind: "start",
      label: "Pick Template",
      title: "Start a Monster",
      detail: activePresetText,
    };
    nextAction = {
      kind: "grafts",
      label: "Grafts",
      detail: "Start the Composer before entering graft work.",
      disabled: true,
    };
  } else if (activeStageId === "chassis") {
    objective = {
      title: "Confirm the combat frame",
      detail: "The frame is live. Continue to Grafts when the family, role, challenge, and threat profile are correct.",
    };
    tasks = frameTasks;
    primaryAction = {
      kind: "grafts",
      label: "Continue to Grafts",
      title: "Chassis ready",
      detail: "Move to the anatomy slots without clearing the current frame.",
    };
    previousAction = {
      kind: "start",
      label: "Templates",
      detail: "Choose another ready-made monster frame.",
    };
    nextAction = {
      kind: "grafts",
      label: "Grafts",
      detail: "Build the monster anatomy.",
    };
  } else if (activeStageId === "grafts") {
    objective = {
      title: missingCoreSlotId ? `Complete the ${slotLabel(missingCoreSlotId)} slot` : "Review the playable anatomy",
      detail: missingCoreSlotId
        ? "Install the next required graft. The guide opens the correct component pipeline directly."
        : "The core combat loop is present. Add an optional signature graft or continue to Review.",
    };
    tasks = graftTasks;

    if (missingCoreSlotId) {
      primaryAction = {
        kind: "slot",
        slotId: missingCoreSlotId,
        label: SLOT_COPY[missingCoreSlotId]?.cta || "Add Graft",
        title: SLOT_COPY[missingCoreSlotId]?.actionTitle || `Add ${slotLabel(missingCoreSlotId)}`,
        detail: SLOT_COPY[missingCoreSlotId]?.detail || "Install the next required graft.",
      };
    } else if (!review.balanceReady) {
      primaryAction = {
        kind: "review",
        label: "Review Build",
        title: blocker?.title || "Review balance",
        detail: blocker?.detail || "Review pressure, complexity, and counterplay.",
      };
    } else {
      primaryAction = {
        kind: "export",
        label: "Open Stat Block",
        title: exportReady ? "Monster ready" : "Review the draft stat block",
        detail: exportReady
          ? "The core anatomy and build checks are ready for handoff."
          : "The monster is usable, but non-blocking warnings remain.",
      };
    }

    previousAction = {
      kind: "chassis",
      label: "Chassis",
      detail: "Return to the combat frame without clearing grafts.",
    };
    nextAction = {
      kind: "review",
      label: "Review",
      detail: coreReady
        ? "Review pressure, complexity, and counterplay."
        : "Core grafts are still missing, but the draft can still be reviewed.",
    };
  } else if (activeStageId === "review") {
    objective = {
      title: review.handoffReady
        ? review.advisories.length
          ? "Review the load advisory"
          : "Confirm the playable profile"
        : "Resolve the counterplay check",
      detail: review.handoffReady
        ? review.advisories.length
          ? "Pressure or Complexity is above its recommendation. This is guidance, not a lock; continue when the additional load is intentional."
          : "Pressure, Complexity, and counterplay are within the selected guidance."
        : "Counterplay still needs a visible tell, break condition, or repeatable player response.",
    };
    tasks = review.tasks;
    primaryAction = review.handoffReady
      ? {
          kind: "export",
          label: "Open Stat Block",
          title: "Review complete",
          detail: "Move to the final stat block without changing the current build.",
        }
      : {
          kind: "review",
          label: blocker?.action?.label || "Review Build",
          title: blocker?.title || "Review the build",
          detail: blocker?.detail || "Resolve pressure, complexity, or counterplay.",
        };
    previousAction = {
      kind: "grafts",
      label: "Grafts",
      detail: "Return to anatomy authoring.",
    };
    nextAction = {
      kind: "export",
      label: "Stat Block",
      detail: "Open the current final output.",
    };
  } else {
    objective = {
      title: exportReady ? "Use the finished monster" : "Review the draft stat block",
      detail: exportReady
        ? "The stat block is ready to copy or export."
        : "The current stat block remains usable while non-blocking warnings are reviewed.",
    };
    tasks = [
      {
        id: "core-anatomy",
        title: "Core Anatomy",
        detail: coreReady ? "Body and Weakness / Tell are present; the engine guarantees a damaging Action." : "A core graft is missing.",
        required: true,
        status: coreReady ? "complete" : "current",
        action: coreReady ? null : { kind: "grafts" },
      },
      ...review.tasks,
    ];
    primaryAction = exportReady
      ? {
          kind: "export",
          label: "Stat Block Ready",
          title: "Monster ready",
          detail: "The final output is already open.",
        }
      : {
          kind: "review",
          label: "Review Build",
          title: "Review remaining warnings",
          detail: "Return to Review without changing the current stat block.",
        };
    previousAction = {
      kind: "review",
      label: "Review",
      detail: "Return to pressure, complexity, and counterplay checks.",
    };
    nextAction = null;
  }

  const contextItems = [
    context.name,
    context.category,
    context.role,
    context.targetCr ? `CR ${context.targetCr}` : "",
    ["grafts", "review", "stat-block"].includes(activeStageId) ? `${completedSlots} graft${completedSlots === 1 ? "" : "s"}` : "",
    ["grafts", "review", "stat-block"].includes(activeStageId) && context.source ? context.source : "",
  ].filter(Boolean).slice(0, 4);

  return {
    activeStageId,
    blocker,
    context: contextItems,
    coreReady,
    exportReady,
    hasSetpieceSlot,
    objective,
    primaryAction,
    previousAction,
    nextAction,
    recommendedSlotId,
    review,
    stages,
    tasks,
  };
}
