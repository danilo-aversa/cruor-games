import {
  COMPONENT_TYPE_LABELS,
  asArray,
  clone,
  slugify,
} from "./studio-component-normalizers.js";
import { listStudioSemanticEditorDefinitions } from "../schema/studio-semantic-editor-registry.js";
import { buildStudioGraftPayloadFromTemplate } from "./studio-monster-graft-authoring.js";


const CRYPT_ROOM_ARCHETYPE_TEMPLATE_IDS = Object.freeze([
  "location-region-crypt-burial-cell",
  "location-region-ossuary-gallery",
  "location-region-reliquary-niche",
  "location-region-charnel-vault",
  "location-region-sealed-family-tomb",
  "location-region-processional-crypt-hall",
  "location-region-bone-well",
  "location-region-hidden-reliquary",
  "location-influence-crypt-burial-cell",
  "location-influence-ossuary-gallery",
  "location-influence-reliquary-niche",
  "location-influence-charnel-vault",
  "location-influence-sealed-family-tomb",
  "location-influence-processional-crypt-hall",
  "location-influence-bone-well",
  "location-influence-hidden-reliquary",
]);

const CRYPT_ROOM_ARCHETYPE_TEMPLATE_BLUEPRINTS = Object.freeze([
  Object.freeze({
    archetypeId: "crypt-burial-cell",
    label: "Crypt Burial Cell",
    shortLabel: "Burial Cell",
    icon: "fa-box-archive",
    title: "New Crypt Burial Cell",
    role: "side burial chamber",
    size: "Small",
    shape: "rect",
    connectors: 1,
    density: "low",
    summary: "A compact burial cell, sealed tomb bay, or quiet chamber for one or a few dead.",
    tableText: "A narrow burial cell waits in stale silence, its dead arranged with deliberate care.",
  }),
  Object.freeze({
    archetypeId: "ossuary-gallery",
    label: "Ossuary Gallery",
    shortLabel: "Ossuary",
    icon: "fa-bone",
    title: "New Ossuary Gallery",
    role: "side ossuary gallery",
    size: "Medium",
    shape: "alcove",
    connectors: 2,
    density: "high",
    summary: "A bone-lined gallery, ossuary wall, or display passage for arranged remains.",
    tableText: "Stacked bones form a pale gallery along the walls, arranged like devotional architecture.",
  }),
  Object.freeze({
    archetypeId: "reliquary-niche",
    label: "Reliquary Niche",
    shortLabel: "Reliquary",
    icon: "fa-gem",
    title: "New Reliquary Niche",
    role: "secret reliquary niche",
    size: "Small",
    shape: "alcove",
    connectors: 1,
    density: "medium",
    summary: "A small devotional niche, relic recess, or side shrine built around a preserved object.",
    tableText: "A recessed niche frames a relic-like object, set apart from the rest of the chamber.",
  }),
  Object.freeze({
    archetypeId: "charnel-vault",
    label: "Charnel Vault",
    shortLabel: "Charnel",
    icon: "fa-skull",
    title: "New Charnel Vault",
    role: "hazardous charnel chamber",
    size: "Large",
    shape: "notched",
    connectors: 2,
    density: "high",
    summary: "A crowded vault of mixed remains, disturbed burials, and dangerous funerary refuse.",
    tableText: "The chamber has become a vault of mingled remains, its floor broken by heaps and hollows.",
  }),
  Object.freeze({
    archetypeId: "sealed-family-tomb",
    label: "Sealed Family Tomb",
    shortLabel: "Family Tomb",
    icon: "fa-door-closed",
    title: "New Sealed Family Tomb",
    role: "sealed family tomb",
    size: "Medium",
    shape: "notched",
    connectors: 1,
    density: "medium",
    summary: "A lineage tomb, sealed burial room, or noble crypt chamber with controlled access.",
    tableText: "A sealed family tomb marks its threshold with names, crests, or damaged funerary signs.",
  }),
  Object.freeze({
    archetypeId: "processional-crypt-hall",
    label: "Processional Crypt Hall",
    shortLabel: "Crypt Hall",
    icon: "fa-road",
    title: "New Processional Crypt Hall",
    role: "main processional hall",
    size: "Large",
    shape: "hall",
    connectors: 3,
    density: "medium",
    summary: "A long crypt hall, ritual passage, or threshold axis used to organize the map flow.",
    tableText: "A processional hall draws the eye forward, its route framed by repeated funerary markers.",
  }),
  Object.freeze({
    archetypeId: "bone-well",
    label: "Bone Well",
    shortLabel: "Bone Well",
    icon: "fa-circle-down",
    title: "New Bone Well",
    role: "vertical bone well",
    size: "Medium",
    shape: "shaft",
    connectors: 1,
    density: "high",
    summary: "A vertical shaft, bone pit, ossuary drop, or hazardous well of remains.",
    tableText: "A dark vertical hollow opens in the chamber, its sides crowded with pale fragments.",
  }),
  Object.freeze({
    archetypeId: "hidden-reliquary",
    label: "Hidden Reliquary",
    shortLabel: "Hidden Relic",
    icon: "fa-vault",
    title: "New Hidden Reliquary",
    role: "hidden reliquary room",
    size: "Medium",
    shape: "archive",
    connectors: 1,
    density: "medium",
    summary: "A concealed relic room, sacred store, or hidden archive attached to the crypt.",
    tableText: "A hidden reliquary chamber preserves its contents behind a controlled, secretive threshold.",
  }),
]);

function buildRoomArchetypeRegionTemplate(blueprint) {
  return {
    id: `location-region-${blueprint.archetypeId}`,
    label: `${blueprint.label} Region`,
    shortLabel: blueprint.shortLabel,
    icon: blueprint.icon,
    contentType: "location-region",
    title: blueprint.title,
    slot: "locationRegion",
    summary: blueprint.summary,
    tableText: blueprint.tableText,
    mechanics: "",
    locationRegion: {
      role: blueprint.role,
      size: blueprint.size,
      shape: blueprint.shape,
      roomArchetype: blueprint.archetypeId,
      mapInfluence: {
        preferredRoomArchetypes: [blueprint.archetypeId],
        forbiddenRoomArchetypes: [],
        forceRoomArchetype: true,
        weight: 3,
        source: `studio-template:${blueprint.archetypeId}`,
      },
      connectors: blueprint.connectors,
      density: blueprint.density,
      readAloud: { compact: blueprint.tableText, extended: blueprint.tableText },
    },
    metadata: {
      roomArchetypeTemplate: true,
      roomArchetypeId: blueprint.archetypeId,
    },
  };
}

function buildRoomArchetypeInfluenceTemplate(blueprint) {
  return {
    id: `location-influence-${blueprint.archetypeId}`,
    label: `${blueprint.label} Influence`,
    shortLabel: `${blueprint.shortLabel} Bias`,
    icon: blueprint.icon,
    contentType: "location-component",
    title: `New ${blueprint.label} Influence`,
    slot: "clue",
    summary: `A Dark Places component that biases the assigned room toward the ${blueprint.label} archetype without becoming a full region template.`,
    tableText: blueprint.tableText,
    mechanics: "Assign this component to a room when the clue, hazard, sign, or reward should determine that room's spatial archetype.",
    location: {
      mapInfluence: {
        preferredRoomArchetypes: [blueprint.archetypeId],
        forbiddenRoomArchetypes: [],
        forceRoomArchetype: false,
        weight: 2,
        source: `studio-template:${blueprint.archetypeId}`,
      },
    },
    metadata: {
      mapInfluenceTemplate: true,
      roomArchetypeId: blueprint.archetypeId,
    },
  };
}

const CRYPT_ROOM_ARCHETYPE_STUDIO_TEMPLATES = Object.freeze(
  CRYPT_ROOM_ARCHETYPE_TEMPLATE_BLUEPRINTS.reduce((templates, blueprint) => {
    const regionTemplate = buildRoomArchetypeRegionTemplate(blueprint);
    const influenceTemplate = buildRoomArchetypeInfluenceTemplate(blueprint);
    templates[regionTemplate.id] = regionTemplate;
    templates[influenceTemplate.id] = influenceTemplate;
    return templates;
  }, {}),
);

const SEMANTIC_COMPONENT_TEMPLATES = Object.freeze(
  Object.fromEntries(
    listStudioSemanticEditorDefinitions().map((definition) => [
      definition.templateId,
      {
        id: definition.templateId,
        label: definition.label,
        shortLabel: definition.label,
        icon: definition.icon,
        contentType: definition.contentType,
        semanticType: definition.semanticType,
        title: `New ${definition.label}`,
        slot: "",
        summary: "",
        tableText: "",
        mechanics: "",
        semantic: clone(definition.defaultValue),
      },
    ]),
  ),
);

export const STUDIO_COMPONENT_TEMPLATE_GROUPS = Object.freeze([
  {
    id: "monster",
    label: "Monster Grafts",
    icon: "fa-skull",
    templates: [
      "monster-trait",
      "monster-action",
      "monster-bonus-action",
      "monster-reaction",
      "monster-weakness",
      "monster-death-effect",
      "monster-lair-effect",
    ],
  },
  {
    id: "location",
    label: "Location Content",
    icon: "fa-map-location-dot",
    templates: [
      ...Object.keys(SEMANTIC_COMPONENT_TEMPLATES),
      "location-description",
      "location-hazard",
      "location-region",
      "location-map-influence-e2e-fixture",
      ...CRYPT_ROOM_ARCHETYPE_TEMPLATE_IDS,
      "location-sensory-detail",
      "location-visual-sign",
    ],
  },
]);

export const STUDIO_COMPONENT_TEMPLATES = Object.freeze({
  ...SEMANTIC_COMPONENT_TEMPLATES,
  "monster-trait": {
    id: "monster-trait",
    label: "Monster Trait",
    shortLabel: "Trait",
    icon: "fa-dna",
    contentType: "monster-graft",
    title: "New Monster Trait",
    slot: "body",
    section: "trait",
    actionEconomy: "passive",
    usage: { type: "passive" },
    resolution: { type: "none" },
    targeting: { type: "self", targets: "the creature" },
    damage: { mode: "none", types: [] },
    cost: 1,
    complexity: 1,
    summary: "Describe what this trait changes about the creature at the table.",
    counterplay: "Telegraph the trait before it matters, or give players a clear way to work around it.",
  },
  "monster-action": {
    id: "monster-action",
    label: "Monster Action",
    shortLabel: "Action",
    icon: "fa-hand-fist",
    contentType: "monster-graft",
    title: "New Monster Action",
    slot: "attack",
    section: "action",
    actionEconomy: "action",
    usage: { type: "atWill" },
    resolution: { type: "attackRoll", attackType: "melee", basis: "monsterAttack" },
    targeting: { type: "single", targets: "one target", range: 5, unit: "ft" },
    damage: { mode: "budgeted", types: [] },
    cost: 2,
    complexity: 2,
    summary: "Describe the action's core threat and what makes it horrifying.",
    counterplay: "Give the action a readable tell, positioning limit, or exploitable timing window.",
  },
  "monster-bonus-action": {
    id: "monster-bonus-action",
    label: "Monster Bonus Action",
    shortLabel: "Bonus",
    icon: "fa-bolt",
    contentType: "monster-graft",
    title: "New Monster Bonus Action",
    slot: "movement",
    section: "bonusAction",
    actionEconomy: "bonusAction",
    usage: { type: "atWill" },
    resolution: { type: "none" },
    targeting: { type: "self", targets: "the creature" },
    damage: { mode: "none", types: [] },
    cost: 1,
    complexity: 2,
    summary: "Describe the quick reposition, setup, or pressure move.",
    counterplay: "Make the bonus action dependent on visible setup, terrain, or a creature state.",
  },
  "monster-reaction": {
    id: "monster-reaction",
    label: "Monster Reaction",
    shortLabel: "Reaction",
    icon: "fa-reply",
    contentType: "monster-graft",
    title: "New Monster Reaction",
    slot: "twist",
    section: "reaction",
    actionEconomy: "reaction",
    usage: { type: "reaction" },
    resolution: { type: "none" },
    targeting: { type: "triggeringCreature", targets: "the triggering creature" },
    damage: { mode: "none", types: [] },
    trigger: "When a creature the monster can see triggers this reaction.",
    cost: 2,
    complexity: 2,
    summary: "Describe the reaction and the behavior it punishes or redirects.",
    counterplay: "The trigger should be predictable enough that players can choose whether to risk it.",
  },
  "monster-weakness": {
    id: "monster-weakness",
    label: "Monster Weakness",
    shortLabel: "Weakness",
    icon: "fa-eye",
    contentType: "monster-graft",
    title: "New Monster Weakness",
    slot: "weakness",
    section: "trait",
    actionEconomy: "passive",
    usage: { type: "passive" },
    resolution: { type: "none" },
    targeting: { type: "self", targets: "the creature" },
    damage: { mode: "none", types: [] },
    cost: -1,
    complexity: 1,
    summary: "Describe the readable tell, taboo, frailty, or exploitable pattern.",
    counterplay: "State exactly how players can notice and exploit the weakness.",
  },
  "monster-death-effect": {
    id: "monster-death-effect",
    label: "Monster Death Effect",
    shortLabel: "Death",
    icon: "fa-skull-crossbones",
    contentType: "monster-graft",
    title: "New Monster Death Effect",
    slot: "death",
    section: "death",
    actionEconomy: "freeTrigger",
    usage: { type: "once" },
    resolution: { type: "savingThrow", ability: "constitution" },
    targeting: { type: "area", shape: "radius", size: 10, unit: "ft", targets: "creatures in the area" },
    damage: { mode: "budgeted", types: [] },
    trigger: "When the monster is reduced to 0 Hit Points.",
    cost: 1,
    complexity: 2,
    summary: "Describe what makes the monster's death dangerous, revealing, or contaminating.",
    counterplay: "Foreshadow the death effect so players can choose distance, timing, or finishing method.",
  },
  "monster-lair-effect": {
    id: "monster-lair-effect",
    label: "Monster Lair Effect",
    shortLabel: "Lair",
    icon: "fa-dungeon",
    contentType: "monster-graft",
    title: "New Monster Lair Effect",
    slot: "lair",
    section: "lairAction",
    actionEconomy: "lairAction",
    usage: { type: "initiativeCount", value: "20" },
    resolution: { type: "savingThrow", ability: "wisdom" },
    targeting: { type: "area", shape: "scene", targets: "creatures in the lair" },
    damage: { mode: "none", types: [] },
    cost: 2,
    complexity: 3,
    summary: "Describe the scene pressure the creature brings into the battlefield.",
    counterplay: "Give the lair effect a source, rhythm, or object that players can identify and disrupt.",
  },
  "location-description": {
    id: "location-description",
    label: "Location Description",
    shortLabel: "Description",
    icon: "fa-align-left",
    contentType: "location-component",
    title: "New Location Description",
    slot: "horrorPremise",
    summary: "Describe the main horror transformation of the location.",
    tableText: "Read or paraphrase this when the location first changes at the table.",
    mechanics: "",
  },
  "location-hazard": {
    id: "location-hazard",
    label: "Location Hazard",
    shortLabel: "Hazard",
    icon: "fa-triangle-exclamation",
    contentType: "location-component",
    title: "New Location Hazard",
    slot: "hazard",
    summary: "Describe the visible danger or pressure in the location.",
    tableText: "Describe what the characters notice before the hazard triggers.",
    mechanics: "Trigger. Add the trigger here.\nSave. Add the DC and ability here.\nEffect. Add the consequence here.",
    location: {
      mapInfluence: {
        preferredRoomArchetypes: [],
        forbiddenRoomArchetypes: [],
        forceRoomArchetype: false,
        weight: 1,
      },
    },
  },
  "location-region": {
    id: "location-region",
    label: "Location Region",
    shortLabel: "Region",
    icon: "fa-dungeon",
    contentType: "location-region",
    title: "New Location Region",
    slot: "locationRegion",
    summary: "Describe the region's role in the map and the horror it carries.",
    tableText: "Compact read-aloud for the room or region.",
    mechanics: "",
    locationRegion: {
      role: "side",
      size: "Medium",
      shape: "standard",
      roomArchetype: "",
      mapInfluence: {
        preferredRoomArchetypes: [],
        forbiddenRoomArchetypes: [],
        forceRoomArchetype: false,
        weight: 1,
      },
      connectors: 2,
      density: "medium",
      readAloud: { compact: "", extended: "" },
    },
  },
  ...CRYPT_ROOM_ARCHETYPE_STUDIO_TEMPLATES,
  "location-map-influence-e2e-fixture": {
    id: "location-map-influence-e2e-fixture",
    label: "Map Influence E2E Fixture",
    shortLabel: "E2E Fixture",
    icon: "fa-route",
    contentType: "location-component",
    title: "Map Influence E2E Fixture",
    slot: "hazard",
    summary: "Creates a minimal Studio authoring fixture for testing component mapInfluence through export, Composer assignment, and Map Generator debug.",
    tableText: "Use this fixture only for authoring QA: assign each fixture component to its matching target room and verify the generated map resolves the expected archetype.",
    mechanics: "Fixture. Creates two neutral target rooms and three region-scoped components: a suggested Bone Well, a forced Hidden Reliquary, and a forbidden fallback that should resolve to Reliquary Niche.",
    fixtureComponents: [
      {
        id: "location-fixture-neutral-target-room",
        label: "Fixture Target Room",
        shortLabel: "Target Room",
        icon: "fa-dungeon",
        contentType: "location-region",
        title: "Fixture Target Room",
        slot: "locationRegion",
        summary: "A neutral test room with no direct room archetype, used to verify component-driven map influence.",
        tableText: "A plain chamber waits for the assigned component to define its generated shape.",
        mechanics: "Assign a fixture component to this room in the Composer, then inspect the generated room archetype/debug output.",
        locationRegion: {
          role: "side test chamber",
          size: "Medium",
          shape: "standard",
          roomArchetype: "",
          mapInfluence: {
            preferredRoomArchetypes: [],
            forbiddenRoomArchetypes: [],
            forceRoomArchetype: false,
            weight: 1,
          },
          connectors: 2,
          density: "medium",
          readAloud: {
            compact: "A plain chamber waits for the assigned component to define its generated shape.",
            extended: "A plain chamber waits for the assigned component to define its generated shape.",
          },
        },
        metadata: {
          mapInfluenceE2eFixture: true,
          fixtureRole: "neutral-target-room",
        },
      },
      {
        id: "location-fixture-secret-target-room",
        label: "Fixture Secret Target",
        shortLabel: "Secret Target",
        icon: "fa-door-closed",
        contentType: "location-region",
        title: "Fixture Secret Target Room",
        slot: "locationRegion",
        summary: "A neutral side room used to verify that forced Hidden Reliquary influence controls both archetype and topology bias.",
        tableText: "A quiet side chamber has no obvious identity until a component marks what it hides.",
        mechanics: "Assign the forced Hidden Reliquary fixture component to this room and verify the generated room resolves as Hidden Reliquary.",
        locationRegion: {
          role: "side test chamber",
          size: "Small",
          shape: "standard",
          roomArchetype: "",
          mapInfluence: {
            preferredRoomArchetypes: [],
            forbiddenRoomArchetypes: [],
            forceRoomArchetype: false,
            weight: 1,
          },
          connectors: 1,
          density: "medium",
          readAloud: {
            compact: "A quiet side chamber has no obvious identity until a component marks what it hides.",
            extended: "A quiet side chamber has no obvious identity until a component marks what it hides.",
          },
        },
        metadata: {
          mapInfluenceE2eFixture: true,
          fixtureRole: "secret-target-room",
        },
      },
      {
        id: "location-fixture-bone-well-cue",
        label: "Fixture Bone Well Cue",
        shortLabel: "Bone Well Cue",
        icon: "fa-circle-dot",
        contentType: "location-component",
        title: "Fixture Bone Well Cue",
        slot: "hazard",
        summary: "A region-scoped hazard fixture that should suggest Bone Well when assigned to a room.",
        tableText: "The floor mark sinks inward like the room remembers a vertical drop beneath it.",
        mechanics: "Expected result. Assign to a neutral target room; the generated room should resolve to Bone Well with source map-influence.",
        location: {
          mapInfluence: {
            preferredRoomArchetypes: ["bone-well"],
            forbiddenRoomArchetypes: [],
            forceRoomArchetype: false,
            weight: 2,
            source: "studio-fixture:bone-well-cue",
            note: "End-to-end fixture: component suggestion should survive Studio export, registry normalization, Composer assignment, and map generation.",
          },
        },
        metadata: {
          mapInfluenceE2eFixture: true,
          fixtureRole: "suggested-bone-well",
          expectedRoomArchetype: "bone-well",
          expectedRoomArchetypeSource: "map-influence",
        },
      },
      {
        id: "location-fixture-hidden-reliquary-force",
        label: "Fixture Hidden Reliquary Force",
        shortLabel: "Hidden Force",
        icon: "fa-lock",
        contentType: "location-component",
        title: "Fixture Hidden Reliquary Force",
        slot: "clue",
        summary: "A region-scoped clue fixture that should force Hidden Reliquary when assigned to a room.",
        tableText: "A seam in the wall refuses to align with the rest of the chamber, as if a relic has been hidden behind the plan itself.",
        mechanics: "Expected result. Assign to a neutral or secret target room; the generated room should resolve to Hidden Reliquary with source map-influence.",
        location: {
          mapInfluence: {
            roomArchetype: "hidden-reliquary",
            preferredRoomArchetypes: ["hidden-reliquary"],
            forbiddenRoomArchetypes: [],
            forceRoomArchetype: true,
            weight: 3,
            source: "studio-fixture:hidden-reliquary-force",
            note: "End-to-end fixture: forced influence should override softer/default archetype choices and mark the room as map-influenced.",
          },
        },
        metadata: {
          mapInfluenceE2eFixture: true,
          fixtureRole: "forced-hidden-reliquary",
          expectedRoomArchetype: "hidden-reliquary",
          expectedRoomArchetypeSource: "map-influence",
        },
      },
      {
        id: "location-fixture-forbidden-fallback-cue",
        label: "Fixture Forbidden Fallback",
        shortLabel: "Fallback Cue",
        icon: "fa-ban",
        contentType: "location-component",
        title: "Fixture Forbidden Fallback Cue",
        slot: "clue",
        summary: "A region-scoped clue fixture that prefers Bone Well first, forbids Bone Well, and should fall back to Reliquary Niche.",
        tableText: "A small reliquary mark sits where a shaft should have opened, refusing the vertical descent implied by the surrounding bones.",
        mechanics: "Expected result. Assign to a neutral target room; the generated room should resolve to Reliquary Niche because Bone Well is forbidden.",
        location: {
          mapInfluence: {
            preferredRoomArchetypes: ["bone-well", "reliquary-niche"],
            forbiddenRoomArchetypes: ["bone-well"],
            forceRoomArchetype: false,
            weight: 3,
            source: "studio-fixture:forbidden-fallback-cue",
            note: "End-to-end fixture: forbidden preferred archetype should be skipped in favor of the next allowed preference.",
          },
        },
        metadata: {
          mapInfluenceE2eFixture: true,
          fixtureRole: "forbidden-fallback",
          expectedRoomArchetype: "reliquary-niche",
          expectedRoomArchetypeSource: "map-influence",
        },
      },
    ],
    metadata: {
      mapInfluenceE2eFixture: true,
      fixtureRole: "template-set",
    },
  },
  "location-sensory-detail": {
    id: "location-sensory-detail",
    label: "Sensory Detail",
    shortLabel: "Sensory",
    icon: "fa-ear-listen",
    contentType: "location-component",
    title: "New Sensory Detail",
    slot: "sensoryLayer",
    summary: "Describe one sound, smell, texture, temperature, or light behavior.",
    tableText: "A short table-ready sensory line.",
    mechanics: "",
  },
  "location-visual-sign": {
    id: "location-visual-sign",
    label: "Visual Sign",
    shortLabel: "Sign",
    icon: "fa-eye",
    contentType: "location-component",
    title: "New Visual Sign",
    slot: "visibleAnomaly",
    summary: "Describe one immediate disturbing image or clue-like sign.",
    tableText: "A short table-ready visual line.",
    mechanics: "",
  },
});

export const LEGACY_TEMPLATE_ALIASES = Object.freeze({
  "monster-graft": "monster-trait",
  "location-component": "location-description",
  "location-region": "location-region",
});

export function getStudioComponentTemplate(templateId) {
  const resolvedTemplateId = LEGACY_TEMPLATE_ALIASES[templateId] || templateId;
  return STUDIO_COMPONENT_TEMPLATES[resolvedTemplateId] || STUDIO_COMPONENT_TEMPLATES["monster-trait"];
}

export function getStudioComponentTemplates() {
  return Object.values(STUDIO_COMPONENT_TEMPLATES);
}

export function getStudioComponentTemplateGroups() {
  return STUDIO_COMPONENT_TEMPLATE_GROUPS.map((group) => ({
    ...group,
    templates: group.templates.map(getStudioComponentTemplate),
  }));
}

function getDraftSourceAnchorId(draft = {}) {
  return draft.sourceAnchor?.id || draft.id || slugify(draft.title || "new-inspiration");
}

function getTemplateInstanceId(template, draft = {}) {
  const sourceAnchorId = getDraftSourceAnchorId(draft);
  const components = asArray(draft.components);
  const baseId = `${sourceAnchorId}-${template.id}`;
  let index = components.length + 1;
  let id = `${baseId}-${index}`;
  const existingIds = new Set(components.map((component) => component.id));

  while (existingIds.has(id)) {
    index += 1;
    id = `${baseId}-${index}`;
  }

  return id;
}

function buildBaseComponent(template, draft = {}) {
  const sourceAnchorId = getDraftSourceAnchorId(draft);
  const inheritedSource = draft.sourceAnchor || {};
  const contentType = template.contentType;
  const slot = template.slot;

  return {
    id: getTemplateInstanceId(template, draft),
    title: template.title,
    label: template.title,
    type: COMPONENT_TYPE_LABELS[contentType] || "Component",
    contentType,
    semanticType: template.semanticType || "",
    semantic: template.semantic ? clone(template.semantic) : undefined,
    status: "draft",
    workflows: contentType === "monster-graft" ? ["monster-composer"] : ["darken-location"],
    slots: [slot],
    sourceAnchors: [sourceAnchorId],
    sourceTypes: asArray(inheritedSource.sourceTypes),
    themes: asArray(inheritedSource.themes),
    motifs: asArray(inheritedSource.motifs),
    horror: asArray(inheritedSource.horror),
    summary: template.summary || "",
    tableText: template.tableText || "",
    mechanics: template.mechanics || "",
    tags: [`template:${template.id}`],
    metadata: {
      ...(template.metadata || {}),
      templateId: template.id,
      templateLabel: template.label,
      createdBy: "inspiration-studio-template",
    },
  };
}

function buildMonsterComponent(template, draft = {}) {
  const component = buildBaseComponent(template, draft);
  component.monster = {
    ...buildStudioGraftPayloadFromTemplate(template),
    graftId: component.id,
  };
  component.slots = [component.monster.slot];
  component.counterplay = template.counterplay || "";
  return component;
}

function buildLocationComponent(template, draft = {}) {
  const component = buildBaseComponent(template, draft);
  if (template.location) component.location = clone(template.location);
  if (template.contentType === "location-region") {
    component.locationRegion = clone(template.locationRegion || {
      role: "side",
      size: "Medium",
      shape: "standard",
      roomArchetype: "",
      mapInfluence: {
        preferredRoomArchetypes: [],
        forbiddenRoomArchetypes: [],
        forceRoomArchetype: false,
        weight: 1,
      },
      connectors: 2,
      density: "medium",
      readAloud: { compact: "", extended: "" },
    });
  }
  return component;
}

function buildComponentFromResolvedTemplate(template, draft = {}) {
  if (template.contentType === "monster-graft") return buildMonsterComponent(template, draft);
  return buildLocationComponent(template, draft);
}

export function buildStudioComponentsFromTemplate(templateId, draft = {}) {
  const template = getStudioComponentTemplate(templateId);
  const fixtureComponents = asArray(template.fixtureComponents);
  if (fixtureComponents.length) {
    return fixtureComponents.map((fixtureTemplate) => buildComponentFromResolvedTemplate({
      ...fixtureTemplate,
      metadata: {
        ...(template.metadata || {}),
        ...(fixtureTemplate.metadata || {}),
        fixtureTemplateId: template.id,
        fixtureTemplateLabel: template.label,
      },
    }, draft));
  }
  return [buildComponentFromResolvedTemplate(template, draft)];
}

export function buildStudioComponentFromTemplate(templateId, draft = {}) {
  return buildStudioComponentsFromTemplate(templateId, draft)[0];
}
