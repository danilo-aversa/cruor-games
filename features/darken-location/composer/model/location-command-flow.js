import { REGION_READY_SLOT_IDS, REGION_READY_SLOT_LABELS } from "./location-workflow.constants.js";

const SLOT_LABELS = REGION_READY_SLOT_LABELS;

function normalizeBuilderMode(builderMode) {
  return builderMode === "map" ? "theme" : builderMode;
}

function getNextIncompleteRoom(roomEntries, activeRoomId) {
  const entries = Array.isArray(roomEntries) ? roomEntries : [];
  if (!entries.length) return null;

  const activeIndex = entries.findIndex((entry) => entry.id === activeRoomId);
  const afterActive = entries.slice(Math.max(0, activeIndex + 1)).find((entry) => !entry.complete);
  return afterActive || entries.find((entry) => !entry.complete) || null;
}

function createRoomTasks(activeRoomEntry) {
  const completed = new Set(activeRoomEntry?.completedSlots || []);
  const missing = new Set(activeRoomEntry?.missingSlots || REGION_READY_SLOT_IDS);
  const currentMissing = REGION_READY_SLOT_IDS.find((slotId) => missing.has(slotId)) || "";

  return REGION_READY_SLOT_IDS.map((slotId) => ({
    id: slotId,
    title: SLOT_LABELS[slotId] || slotId,
    detail: completed.has(slotId)
      ? `${SLOT_LABELS[slotId] || slotId} assigned.`
      : `Add the room's ${String(SLOT_LABELS[slotId] || slotId).toLowerCase()}.`,
    required: true,
    status: completed.has(slotId)
      ? "complete"
      : slotId === currentMissing
        ? "current"
        : "open",
    action: completed.has(slotId) ? null : { kind: "open-slot", slotId },
  }));
}

export function buildLocationCommandFlow({
  activeRegion = null,
  builderMode = "theme",
  exportIncompleteCount = 0,
  frameContext = {},
  generatedMapPreview = null,
  hasMapManualOverrides = false,
  roomEntries = [],
  selectedComponents = [],
}) {
  const normalizedMode = normalizeBuilderMode(builderMode);
  const roomCount = Array.isArray(roomEntries) ? roomEntries.length : 0;
  const componentCount = Array.isArray(selectedComponents) ? selectedComponents.length : 0;
  const activeRoomEntry = roomEntries.find((entry) => entry.id === activeRegion?.id) || null;
  const nextIncompleteRoom = getNextIncompleteRoom(roomEntries, activeRegion?.id);
  const mapReady = Boolean(generatedMapPreview);
  const frameReady = roomCount > 0 && mapReady;
  const roomsReady = roomCount > 0 && exportIncompleteCount === 0;
  const activeStageId = normalizedMode === "scratch"
    ? "rooms"
    : normalizedMode === "export"
      ? "output"
      : "frame";

  const stages = [
    {
      id: "frame",
      label: "Frame",
      detail: "Set place identity, room program, and map structure.",
      status: frameReady ? "complete" : activeStageId === "frame" ? "current" : "open",
      action: { kind: "open-frame" },
    },
    {
      id: "rooms",
      label: "Rooms",
      detail: "Complete the required table-facing slots room by room.",
      status: roomsReady ? "complete" : activeStageId === "rooms" ? "current" : "open",
      disabled: !roomCount,
      action: { kind: "open-rooms" },
    },
    {
      id: "output",
      label: "Final Output",
      detail: "Review and use the compiled Location Document v2.",
      status: roomsReady && mapReady ? "complete" : "open",
      disabled: !roomCount,
      action: { kind: "open-output" },
    },
  ];

  let objective;
  let context;
  let tasks;
  let blocker = null;
  let primaryAction;
  let previousAction = null;
  let nextAction = null;

  if (activeStageId === "frame") {
    objective = {
      title: frameReady ? "Confirm the place frame" : "Generate the location structure",
      detail: frameReady
        ? "The room program and map are ready. Continue to Rooms to add explicit table-facing content."
        : "Generate the room program and semantic map from the selected Theme, Context, and Horror.",
    };
    context = [
      frameContext.title,
      frameContext.context,
      frameContext.horror,
      frameContext.source,
    ].filter(Boolean).slice(0, 4);
    tasks = [
      {
        id: "identity",
        title: "Place Identity",
        detail: [frameContext.source, frameContext.context, frameContext.horror].filter(Boolean).join(" · ") || "Choose Theme, Context, and Horror.",
        required: true,
        status: frameContext.context ? "complete" : "current",
        action: null,
      },
      {
        id: "room-program",
        title: "Room Program",
        detail: roomCount ? `${roomCount} room${roomCount === 1 ? "" : "s"} generated.` : "Generate the structural room program.",
        required: true,
        status: roomCount ? "complete" : "current",
        action: roomCount ? null : { kind: "generate-theme" },
      },
      {
        id: "map",
        title: "Generated Map",
        detail: mapReady ? "Semantic map handoff available." : "Build the editable map preview.",
        required: true,
        status: mapReady ? "complete" : roomCount ? "current" : "open",
        action: mapReady ? null : { kind: roomCount ? "generate-scratch" : "generate-theme" },
      },
    ];

    primaryAction = frameReady
      ? {
          kind: "open-rooms",
          label: "Continue to Rooms",
          title: "Place frame ready",
          detail: "Enter the room workflow without regenerating the current map.",
        }
      : {
          kind: roomCount ? "generate-scratch" : "generate-theme",
          label: "Generate Place",
          title: roomCount ? "Generate the map" : "Generate the place",
          detail: "Run the existing Dark Places generation pipeline from the current frame.",
        };

    nextAction = {
      kind: "open-rooms",
      label: "Rooms",
      detail: frameReady ? "Start room-by-room authoring." : "Generate the place before entering Rooms.",
      disabled: !frameReady,
    };
  } else if (activeStageId === "rooms") {
    const activeRoomReady = Boolean(activeRoomEntry?.complete);
    const roomTasks = activeRoomEntry ? createRoomTasks(activeRoomEntry) : [];
    const currentTask = roomTasks.find((task) => task.status === "current") || null;

    objective = {
      title: !activeRoomEntry
        ? "Select a room"
        : activeRoomReady
          ? nextIncompleteRoom
            ? "Move to the next incomplete room"
            : "All rooms are ready"
          : `Complete ${activeRoomEntry.name}`,
      detail: !activeRoomEntry
        ? "Select a room on the map before assigning its table-facing details."
        : activeRoomReady
          ? nextIncompleteRoom
            ? `${activeRoomEntry.name} is ready. Continue with ${nextIncompleteRoom.name}.`
            : "Every room has its required Hazard, Disturbing Clue, and Encounter Twist."
          : "The bar opens the exact missing slot and keeps the active room selected.",
    };
    context = activeRoomEntry
      ? [
          `Room ${activeRoomEntry.numberLabel}`,
          activeRoomEntry.name,
          `${activeRoomEntry.completedSlots.length} of ${REGION_READY_SLOT_IDS.length} required`,
          `${roomEntries.filter((entry) => entry.complete).length}/${roomCount} rooms ready`,
        ]
      : [`${roomCount} rooms`, `${exportIncompleteCount} incomplete`];
    tasks = roomTasks.length
      ? roomTasks
      : [{
          id: "select-room",
          title: "Select Room",
          detail: "Choose the room to author next.",
          required: true,
          status: "current",
          action: nextIncompleteRoom ? { kind: "select-room", regionId: nextIncompleteRoom.id } : { kind: "open-components" },
        }];

    if (!mapReady) {
      blocker = {
        id: "missing-map",
        title: "The generated map is unavailable",
        detail: "Return to Frame and regenerate the structural map before final output.",
        action: { kind: "open-frame", label: "Return to Frame" },
      };
    }

    if (!activeRoomEntry) {
      primaryAction = {
        kind: nextIncompleteRoom ? "select-room" : "open-components",
        regionId: nextIncompleteRoom?.id,
        label: "Select Room",
        title: "Choose a room",
        detail: "Select the first incomplete room and continue its required slots.",
      };
    } else if (currentTask) {
      primaryAction = {
        ...currentTask.action,
        label: `Add ${currentTask.title}`,
        title: `Add ${currentTask.title}`,
        detail: `Open the ${currentTask.title} picker for ${activeRoomEntry.name}.`,
      };
    } else if (nextIncompleteRoom) {
      primaryAction = {
        kind: "select-room",
        regionId: nextIncompleteRoom.id,
        label: "Next Incomplete Room",
        title: `${activeRoomEntry.name} ready`,
        detail: `Continue with ${nextIncompleteRoom.name}.`,
      };
    } else {
      primaryAction = {
        kind: "open-output",
        label: "Open Final Output",
        title: "All rooms ready",
        detail: "Open the compiled table-ready location document.",
      };
    }

    previousAction = {
      kind: "open-frame",
      label: "Frame",
      detail: "Return to place identity and structural generation.",
    };
    nextAction = {
      kind: "open-output",
      label: "Final Output",
      detail: exportIncompleteCount
        ? `Open the current draft with ${exportIncompleteCount} incomplete room${exportIncompleteCount === 1 ? "" : "s"}.`
        : "Open the complete Location Document v2.",
    };
  } else {
    objective = {
      title: exportIncompleteCount ? "Review missing room content" : "Use the finished location",
      detail: exportIncompleteCount
        ? "Return to the first incomplete room before copying the final room key."
        : "The semantic document, room key, and map package are ready for use.",
    };
    context = [
      `${roomCount} rooms`,
      `${roomEntries.filter((entry) => entry.complete).length} ready`,
      hasMapManualOverrides ? "Map edits retained" : "Generated map",
      componentCount ? `${componentCount} assigned components` : "No components",
    ];
    tasks = [
      {
        id: "rooms-ready",
        title: "Room Coverage",
        detail: exportIncompleteCount ? `${exportIncompleteCount} incomplete room${exportIncompleteCount === 1 ? "" : "s"}.` : "All required room slots are complete.",
        required: true,
        status: exportIncompleteCount ? "current" : "complete",
        action: exportIncompleteCount ? { kind: "review-missing" } : null,
      },
      {
        id: "map-ready",
        title: "Map",
        detail: mapReady ? "Map export source available." : "No generated map available.",
        required: true,
        status: mapReady ? "complete" : "current",
        action: mapReady ? null : { kind: "open-frame" },
      },
    ];
    primaryAction = exportIncompleteCount
      ? {
          kind: "review-missing",
          label: "Review Missing",
          title: `${exportIncompleteCount} incomplete room${exportIncompleteCount === 1 ? "" : "s"}`,
          detail: "Return to the first room with a missing required slot.",
        }
      : {
          kind: "copy-markdown",
          label: "Copy Markdown",
          title: "Location ready",
          detail: "Copy the compiled room key as Markdown.",
        };
    previousAction = {
      kind: "open-rooms",
      label: "Rooms",
      detail: "Return to room authoring.",
    };
  }

  return {
    activeStageId,
    blocker,
    context,
    frameReady,
    nextIncompleteRoom,
    objective,
    primaryAction,
    previousAction,
    nextAction,
    roomsReady,
    stages,
    tasks,
  };
}
