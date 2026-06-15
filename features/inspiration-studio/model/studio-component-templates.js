import {
  COMPONENT_TYPE_LABELS,
  asArray,
  clone,
  slugify,
} from "./studio-component-normalizers.js";

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
      "location-description",
      "location-hazard",
      "location-region",
      "location-sensory-detail",
      "location-visual-sign",
    ],
  },
]);

export const STUDIO_COMPONENT_TEMPLATES = Object.freeze({
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
      connectors: 2,
      density: "medium",
      readAloud: { compact: "", extended: "" },
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
      templateId: template.id,
      templateLabel: template.label,
      createdBy: "inspiration-studio-template",
    },
  };
}

function buildMonsterComponent(template, draft = {}) {
  const component = buildBaseComponent(template, draft);
  const rules = {
    section: template.section,
    actionEconomy: template.actionEconomy,
    usage: clone(template.usage || { type: "passive" }),
    resolution: clone(template.resolution || { type: "none" }),
    targeting: clone(template.targeting || { type: "self", targets: "the creature" }),
    damage: clone(template.damage || { mode: "none", types: [] }),
    condition: null,
    counterplay: {
      text: template.counterplay || "",
    },
    text: {},
  };

  if (template.trigger) rules.trigger = template.trigger;

  component.monster = {
    slot: template.slot,
    section: template.section,
    typeBias: [],
    roleBias: [],
    cost: template.cost ?? 1,
    complexity: template.complexity ?? 1,
    stats: {},
    rules,
  };
  component.counterplay = template.counterplay || "";
  return component;
}

function buildLocationComponent(template, draft = {}) {
  const component = buildBaseComponent(template, draft);
  if (template.contentType === "location-region") {
    component.locationRegion = clone(template.locationRegion || {
      role: "side",
      size: "Medium",
      shape: "standard",
      connectors: 2,
      density: "medium",
      readAloud: { compact: "", extended: "" },
    });
  }
  return component;
}

export function buildStudioComponentFromTemplate(templateId, draft = {}) {
  const template = getStudioComponentTemplate(templateId);
  if (template.contentType === "monster-graft") return buildMonsterComponent(template, draft);
  return buildLocationComponent(template, draft);
}
