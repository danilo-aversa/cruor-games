import { SLOTS } from "../monster-composer.workflow.js";
import { hasSelectedSlot } from "./monster-composer.selection.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function classifyWarning(warning) {
  const text = String(warning || "").toLowerCase();
  if (
    text.includes("no weakness") ||
    text.includes("missing") ||
    text.includes("critical") ||
    text.includes("unsafe") ||
    text.includes("counterplay audit")
  )
    return "critical";
  if (
    text.includes("above") ||
    text.includes("over") ||
    text.includes("too many") ||
    text.includes("high")
  )
    return "major";
  return "minor";
}

const GUIDED_SLOT_PRIORITY = [
  "body",
  "attack",
  "weakness",
  "movement",
  "mind",
  "horror",
  "twist",
  "death",
  "lair",
];

export function buildGuidedFlow({ composerStarted, startMode, selected, computed, activePreset }) {
  const slotDetails = {
    body: {
      title: "Add Body",
      detail: "Define what the creature physically is before choosing attacks.",
      cta: "Open Body Slot",
    },
    attack: {
      title: "Add Attack Pattern",
      detail: "Give the monster a main offensive loop the DM can run every round.",
      cta: "Open Attack Slot",
    },
    weakness: {
      title: "Add Weakness / Tell",
      detail: "Add visible counterplay so the horror feels fair instead of arbitrary.",
      cta: "Open Weakness Slot",
    },
    movement: {
      title: "Add Movement",
      detail: "Decide how the monster reaches, pressures, or fails to reach the characters.",
      cta: "Open Movement Slot",
    },
    mind: {
      title: "Add Mind",
      detail: "Give the creature a behavior rule the DM can follow without guessing.",
      cta: "Open Mind Slot",
    },
    horror: {
      title: "Add Horror Feature",
      detail: "Install the memorable disturbing element that players will remember.",
      cta: "Open Horror Slot",
    },
    twist: {
      title: "Add Combat Twist",
      detail: "Add one fight-changing rule if this monster needs a stronger table presence.",
      cta: "Open Twist Slot",
    },
    death: {
      title: "Add Death Effect",
      detail: "Decide whether death creates a clue, risk, terrain change, or final beat.",
      cta: "Open Death Slot",
    },
    lair: {
      title: "Add Lair / Scene Effect",
      detail: "Use scene pressure only when the battlefield should matter as much as the body.",
      cta: "Open Lair Slot",
    },
  };

  const slotRoadmap = GUIDED_SLOT_PRIORITY.map((slotId, index) => {
    const slot = SLOTS.find((item) => item.id === slotId) || SLOTS[0];
    const filled = hasSelectedSlot(selected, slotId);
    return {
      id: slotId,
      label: slot.label,
      number: index + 1,
      filled,
      detail: slotDetails[slotId]?.detail || slot.hint,
    };
  });

  const bodyReady = hasSelectedSlot(selected, "body");
  const attackReady = hasSelectedSlot(selected, "attack");
  const weaknessReady = hasSelectedSlot(selected, "weakness");
  const coreReady = bodyReady && attackReady && weaknessReady;
  const completedSlots = SLOTS.filter((slot) => hasSelectedSlot(selected, slot.id)).length;
  const filledRecommendedCount = slotRoadmap.filter((step) => step.filled).length;
  const hasSetpieceSlot = ["twist", "death", "lair"].some((slotId) =>
    hasSelectedSlot(selected, slotId)
  );
  const pressureOk = computed.pressure <= computed.budget;
  const complexityOk = computed.complexity <= computed.complexityCap;
  const counterplayOk = ["Strong", "Playable"].includes(computed.counterplayAudit.rating);
  const balanceReady = pressureOk && complexityOk && counterplayOk;
  const exportReady = composerStarted && coreReady && balanceReady && !computed.warnings.length;
  const prioritizedWarnings = [...computed.warnings]
    .sort((a, b) => {
      const rank = { critical: 0, major: 1, minor: 2 };
      return rank[classifyWarning(a)] - rank[classifyWarning(b)];
    })
    .slice(0, 3);

  const recommendedSlotId = composerStarted
    ? GUIDED_SLOT_PRIORITY.find((slotId) => !hasSelectedSlot(selected, slotId)) || null
    : null;
  const recommendedSlot = recommendedSlotId
    ? SLOTS.find((slot) => slot.id === recommendedSlotId)
    : null;
  const recommendedDetail = recommendedSlotId ? slotDetails[recommendedSlotId] : null;
  const activePresetText = activePreset
    ? `${activePreset.label} loaded.`
    : startMode === "scratch"
      ? "Scratch build selected."
      : "Choose Template or Scratch.";

  let nextAction = {
    kind: "start",
    label: "Choose Start",
    title: "Start a Monster",
    detail: activePresetText,
    cta: "Pick Template",
  };

  if (composerStarted && recommendedSlotId) {
    nextAction = {
      kind: "slot",
      slotId: recommendedSlotId,
      label: recommendedSlot?.label || "Next Slot",
      title: recommendedDetail?.title || `Add ${recommendedSlot?.label || "Slot"}`,
      detail:
        recommendedDetail?.detail || recommendedSlot?.hint || "Install the next useful graft.",
      cta: recommendedDetail?.cta || "Open Slot",
    };
  } else if (composerStarted && !balanceReady) {
    nextAction = {
      kind: "review",
      label: "Review Balance",
      title: "Review Balance",
      detail: "Pressure, Complexity, or Counterplay still need attention before export.",
      cta: "Open Balance",
    };
  } else if (composerStarted) {
    nextAction = {
      kind: "export",
      label: "Export Ready",
      title: exportReady ? "Ready to Export" : "Export Draft",
      detail: exportReady
        ? "The monster has core anatomy, counterplay, and clean balance checks."
        : "The monster is usable, but warnings remain in the balance review.",
      cta: "Open Export",
    };
  }

  const readiness = [
    {
      id: "playable",
      label: "Playable Draft",
      reached: composerStarted && coreReady,
      detail: "Body + Attack + Weakness",
    },
    {
      id: "complete",
      label: "Complete Monster",
      reached: composerStarted && completedSlots >= 6,
      detail: "At least 6 anatomy slots",
    },
    {
      id: "setpiece",
      label: "Setpiece Ready",
      reached: composerStarted && coreReady && hasSetpieceSlot,
      detail: "Twist, Death, or Lair present",
    },
    {
      id: "export",
      label: "Export Ready",
      reached: exportReady,
      detail: "Balance and counterplay passed",
    },
  ];

  const activeStepId = !composerStarted
    ? "start"
    : !bodyReady
      ? "body"
      : !attackReady
        ? "attack"
        : !weaknessReady
          ? "weakness"
          : filledRecommendedCount < 6
            ? "complete"
            : !balanceReady || prioritizedWarnings.length
              ? "review"
              : "export";

  const steps = [
    {
      id: "start",
      label: "Start",
      action: "start",
      reached: composerStarted,
      active: activeStepId === "start",
      disabled: false,
      detail: activePresetText,
    },
    {
      id: "body",
      label: "Body",
      action: "slot",
      slotId: "body",
      reached: bodyReady,
      active: activeStepId === "body",
      disabled: !composerStarted,
      detail: bodyReady ? "Body graft installed." : slotDetails.body.detail,
    },
    {
      id: "attack",
      label: "Attack",
      action: "slot",
      slotId: "attack",
      reached: attackReady,
      active: activeStepId === "attack",
      disabled: !composerStarted,
      detail: attackReady ? "Attack pattern installed." : slotDetails.attack.detail,
    },
    {
      id: "weakness",
      label: "Tell",
      action: "slot",
      slotId: "weakness",
      reached: weaknessReady,
      active: activeStepId === "weakness",
      disabled: !composerStarted,
      detail: weaknessReady ? "Counterplay installed." : slotDetails.weakness.detail,
    },
    {
      id: "complete",
      label: "Complete",
      action: recommendedSlotId ? "slot" : "review",
      slotId: recommendedSlotId,
      reached: composerStarted && completedSlots >= 6,
      active: activeStepId === "complete",
      disabled: !composerStarted,
      detail: recommendedSlotId
        ? `Next useful slot: ${recommendedSlot?.label || "slot"}.`
        : "The anatomy has enough installed grafts for a complete monster.",
    },
    {
      id: "review",
      label: "Review",
      action: "review",
      reached: composerStarted && balanceReady,
      active: activeStepId === "review",
      disabled: !composerStarted,
      detail: balanceReady
        ? "Balance and counterplay look playable."
        : "Review pressure, complexity, warnings, and counterplay.",
    },
    {
      id: "export",
      label: "Export",
      action: "export",
      reached: exportReady,
      active: activeStepId === "export",
      disabled: !composerStarted,
      detail: exportReady ? "Ready for handoff." : "Export after balance review.",
    },
  ].map((step, index) => ({ ...step, number: index + 1 }));

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.active)
  );
  const highestReachedIndex = steps.reduce(
    (highest, step, index) => (step.reached ? Math.max(highest, index) : highest),
    0
  );
  const progressIndex = exportReady ? steps.length - 1 : Math.max(activeIndex, highestReachedIndex);

  return {
    steps,
    slotRoadmap,
    readiness,
    nextSlot: recommendedSlot,
    recommendedSlotId,
    nextAction,
    exportReady,
    prioritizedWarnings,
    progress: clamp(progressIndex / Math.max(1, steps.length - 1), 0, 1),
    activeStep: steps.find((step) => step.active) || steps[0],
  };
}
