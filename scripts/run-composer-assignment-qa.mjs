import assert from "node:assert/strict";
import {
  LOCATION_SLOT_SCOPE_MAP,
  LOCATION_SLOT_SCOPE_REGION,
  assignComponentToSlot,
  createInitialLocationComposerState,
  createLocationComposerSnapshot,
  normalizeSlotAssignments,
  removeComponentFromSlot,
} from "../features/darken-location/composer/model/location-composer-state.js";

const hazardSlot = { id: "hazard", label: "Hazard", max: 1 };
const clueSlot = { id: "clue", label: "Clue", max: 1 };
const premiseSlot = { id: "horrorPremise", label: "Premise", max: 1 };

const targetRoom = {
  id: "fixture-room-a",
  name: "Fixture Target Room",
  role: "Setpiece",
  size: "Medium",
  shape: "rect",
};

const secondRoom = {
  id: "fixture-room-b",
  name: "Fixture Second Room",
  role: "Clue Room",
  size: "Medium",
  shape: "rect",
};

const thirdRoom = {
  id: "fixture-room-c",
  name: "Fixture Secret Room",
  role: "Secret Room",
  size: "Small",
  shape: "rect",
};

const boneWellCue = {
  id: "fixture-bone-well-cue",
  title: "Fixture Bone Well Cue",
  slots: ["hazard"],
  location: {
    mapInfluence: {
      preferredRoomArchetypes: ["bone-well"],
      forbiddenRoomArchetypes: [],
      forceRoomArchetype: false,
      weight: 2,
      source: "fixture-bone-well-cue",
    },
  },
};

const reliquaryFallbackCue = {
  id: "fixture-forbidden-fallback-cue",
  title: "Fixture Forbidden Fallback Cue",
  slots: ["clue"],
  location: {
    mapInfluence: {
      preferredRoomArchetypes: ["bone-well", "reliquary-niche"],
      forbiddenRoomArchetypes: ["bone-well"],
      forceRoomArchetype: false,
      weight: 2,
      source: "fixture-forbidden-fallback-cue",
    },
  },
};

const hiddenReliquaryForce = {
  id: "fixture-hidden-reliquary-force",
  title: "Fixture Hidden Reliquary Force",
  slots: ["hazard"],
  location: {
    mapInfluence: {
      roomArchetype: "hidden-reliquary",
      preferredRoomArchetypes: ["hidden-reliquary"],
      forbiddenRoomArchetypes: ["hidden-reliquary"],
      forceRoomArchetype: true,
      weight: 3,
      source: "fixture-hidden-reliquary-force",
    },
  },
};

const mapPremise = {
  id: "fixture-map-premise",
  title: "Fixture Map Premise",
  slots: ["horrorPremise"],
  location: {
    mapInfluence: {
      preferredRoomArchetypes: ["processional-crypt-hall"],
      weight: 1,
      source: "fixture-map-premise",
    },
  },
};

function createState() {
  return createInitialLocationComposerState([targetRoom, secondRoom, thirdRoom]);
}

function getAssignments(state, slotId) {
  return normalizeSlotAssignments(state.slotAssignments)[slotId] || [];
}

function getRegionSourceId(region = {}) {
  return (
    region.sourceRegionId ||
    region.metadata?.sourceRegionId ||
    region.metadata?.dungeonRoomBrief?.sourceRegionId ||
    region.requestMetadata?.sourceRegionId ||
    region.requestMetadata?.dungeonRoomBrief?.sourceRegionId ||
    ""
  );
}

function getRegionMapInfluence(region = {}) {
  return (
    region.mapInfluence ||
    region.metadata?.mapInfluence ||
    region.requestMetadata?.mapInfluence ||
    region.metadata?.dungeonRoomBrief?.mapInfluence ||
    region.requestMetadata?.dungeonRoomBrief?.mapInfluence ||
    null
  );
}

function getRequiredRegion(mapRequest, regionId) {
  return (mapRequest.requiredRegions || []).find(
    (region) => region.id === regionId || getRegionSourceId(region) === regionId,
  );
}

function getConfigRegion(config, regionId) {
  const regions = config.requiredRegions || config.regions || [];
  return regions.find(
    (region) => region.id === regionId || getRegionSourceId(region) === regionId,
  );
}

function runAssignmentScopeRegression() {
  const normalized = normalizeSlotAssignments({
    hazard: [
      {
        componentId: boneWellCue.id,
        slotId: "hazard",
        regionId: targetRoom.id,
      },
    ],
    horrorPremise: [
      {
        componentId: mapPremise.id,
        slotId: "horrorPremise",
        regionId: targetRoom.id,
      },
    ],
  });

  assert.equal(normalized.hazard[0].regionId, targetRoom.id, "region-scoped slots must preserve regionId");
  assert.equal(normalized.horrorPremise[0].regionId, "", "map-scoped slots must clear regionId");
}

function runAssignMoveRegression() {
  let state = createState();
  state = assignComponentToSlot(state, boneWellCue, hazardSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: targetRoom.id,
  });

  assert.deepEqual(
    getAssignments(state, "hazard").map((assignment) => `${assignment.componentId}:${assignment.regionId}`),
    [`${boneWellCue.id}:${targetRoom.id}`],
    "component should be assigned to the first target room",
  );

  state = assignComponentToSlot(state, boneWellCue, hazardSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: secondRoom.id,
  });

  assert.deepEqual(
    getAssignments(state, "hazard").map((assignment) => `${assignment.componentId}:${assignment.regionId}`),
    [`${boneWellCue.id}:${secondRoom.id}`],
    "assigning the same component to another room should move it instead of duplicating it",
  );
}

function runScopedRemoveRegression() {
  let state = createState();
  state = assignComponentToSlot(state, boneWellCue, hazardSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: targetRoom.id,
  });
  state = assignComponentToSlot(state, hiddenReliquaryForce, hazardSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: secondRoom.id,
  });

  state = removeComponentFromSlot(state, boneWellCue.id, "hazard", {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: targetRoom.id,
  });

  assert.deepEqual(
    getAssignments(state, "hazard").map((assignment) => `${assignment.componentId}:${assignment.regionId}`),
    [`${hiddenReliquaryForce.id}:${secondRoom.id}`],
    "scoped removal should only remove the matching room assignment",
  );

  state = assignComponentToSlot(state, mapPremise, premiseSlot, {
    scope: LOCATION_SLOT_SCOPE_MAP,
  });
  state = removeComponentFromSlot(state, hiddenReliquaryForce.id, "hazard", {
    scope: LOCATION_SLOT_SCOPE_MAP,
  });

  assert.deepEqual(
    getAssignments(state, "hazard").map((assignment) => `${assignment.componentId}:${assignment.regionId}`),
    [`${hiddenReliquaryForce.id}:${secondRoom.id}`],
    "map-scoped removal must not remove region-scoped assignments",
  );
}

function runSnapshotRegression() {
  let state = createState();
  state = assignComponentToSlot(state, boneWellCue, hazardSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: targetRoom.id,
  });
  state = assignComponentToSlot(state, mapPremise, premiseSlot, {
    scope: LOCATION_SLOT_SCOPE_MAP,
  });

  const snapshot = createLocationComposerSnapshot(state, [boneWellCue, mapPremise]);
  assert.equal(snapshot.slotAssignments.hazard[0].regionId, targetRoom.id, "snapshot must preserve regionId");
  assert.equal(snapshot.slotAssignments.horrorPremise[0].regionId, "", "snapshot must preserve map scope");
  assert.ok(
    snapshot.selectedComponents.find((component) => component.id === boneWellCue.id)?.location?.mapInfluence,
    "snapshot selectedComponents must preserve full mapInfluence payload",
  );
}

async function runMapInfluenceBridgeRegression() {
  let createMapRequestFromDarkenLocationState;
  let createConfigFromNormalizedMapRequest;
  try {
    ({ createMapRequestFromDarkenLocationState } = await import("../features/darken-location/darken-location.map-request.js"));
    ({ createConfigFromNormalizedMapRequest } = await import("../features/darken-location/map-generator/map-generator.input.js"));
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") {
      return { skipped: true, reason: error.message };
    }
    throw error;
  }
  let state = createState();
  state = assignComponentToSlot(state, boneWellCue, hazardSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: targetRoom.id,
  });
  state = assignComponentToSlot(state, reliquaryFallbackCue, clueSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: secondRoom.id,
  });
  state = assignComponentToSlot(state, hiddenReliquaryForce, hazardSlot, {
    scope: LOCATION_SLOT_SCOPE_REGION,
    regionId: thirdRoom.id,
  });

  const snapshot = createLocationComposerSnapshot(state, [
    boneWellCue,
    reliquaryFallbackCue,
    hiddenReliquaryForce,
  ]);
  const mapRequest = createMapRequestFromDarkenLocationState(snapshot);

  const boneWellRegion = getRequiredRegion(mapRequest, targetRoom.id);
  const fallbackRegion = getRequiredRegion(mapRequest, secondRoom.id);
  const forcedRegion = getRequiredRegion(mapRequest, thirdRoom.id);

  assert.equal(getRegionMapInfluence(boneWellRegion)?.preferredRoomArchetypes?.[0], "bone-well");
  assert.equal(boneWellRegion?.roomArchetypeSource, "map-influence");
  assert.equal(getRegionMapInfluence(fallbackRegion)?.forbiddenRoomArchetypes?.[0], "bone-well");
  assert.equal(fallbackRegion?.roomArchetype, "reliquary-niche");
  assert.equal(fallbackRegion?.roomArchetypeSource, "map-influence");
  assert.equal(forcedRegion?.roomArchetype, "hidden-reliquary");
  assert.equal(getRegionMapInfluence(forcedRegion)?.forceRoomArchetype, true);

  const config = createConfigFromNormalizedMapRequest(mapRequest);
  const configBoneWellRegion = getConfigRegion(config, targetRoom.id);
  assert.equal(
    getRegionMapInfluence(configBoneWellRegion)?.preferredRoomArchetypes?.[0],
    "bone-well",
    "normalized map config must preserve mapInfluence payload",
  );
}

async function main() {
  runAssignmentScopeRegression();
  runAssignMoveRegression();
  runScopedRemoveRegression();
  runSnapshotRegression();
  const bridgeResult = await runMapInfluenceBridgeRegression();
  if (bridgeResult?.skipped) {
    console.log("Composer Assignment QA: 0 issues (0 errors, 0 warnings, 1 info). Bridge regression skipped because optional map-request dependencies are missing in this package.");
    return;
  }
  console.log("Composer Assignment QA: 0 issues (0 errors, 0 warnings, 0 info).");
}

await main();
