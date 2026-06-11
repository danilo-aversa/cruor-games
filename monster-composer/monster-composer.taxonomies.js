import { Skull, Bug, Eye } from "lucide-react";

export const CREATURE_TYPES = [
  {
    id: "undead",
    label: "Undead",
    icon: Skull,
    categories: ["Zombie", "Skeleton", "Spirit"],
    defaults: { ac: 12, hp: 22, dpr: 7, speed: "30 ft.", senses: "darkvision 60 ft." },
  },
  {
    id: "beast",
    label: "Beast",
    icon: Bug,
    categories: ["Spider", "Wolf", "Bird"],
    defaults: { ac: 13, hp: 18, dpr: 6, speed: "40 ft.", senses: "passive Perception 12" },
  },
  {
    id: "aberration",
    label: "Aberration",
    icon: Eye,
    categories: ["Flesh Mass", "Eye Horror", "Parasite", "Psychic Predator"],
    defaults: { ac: 13, hp: 24, dpr: 8, speed: "30 ft.", senses: "darkvision 90 ft." },
  },
];

export const ROLES = [
  {
    id: "minion",
    label: "Minion",
    summary: "Low HP, simple damage, useful in groups.",
    hpMult: 0.45,
    dprMult: 0.75,
    budget: 7,
    complexityCap: 5,
    actionNote: "Use 3–6 of these. Keep turns fast.",
  },
  {
    id: "standard",
    label: "Standard",
    summary: "A full creature for one encounter slot.",
    hpMult: 1,
    dprMult: 1,
    budget: 12,
    complexityCap: 8,
    actionNote: "Works as one threat among several creatures.",
  },
  {
    id: "boss",
    label: "Boss",
    summary: "A setpiece monster with reactions, phases, or lair pressure.",
    hpMult: 2.3,
    dprMult: 1.25,
    budget: 18,
    complexityCap: 12,
    actionNote: "Needs action economy support or minions.",
  },
];

export const DANGERS = [
  { id: "standard", label: "Standard", budgetOffset: 0, dprMod: 1 },
  { id: "hard", label: "Hard", budgetOffset: 3, dprMod: 1.15 },
  { id: "horror", label: "Horror Setpiece", budgetOffset: 5, dprMod: 1.25 },
];

export const TACTICAL_ROLES = [
  {
    id: "brute",
    label: "Brute",
    summary: "High durability and direct damage. Low tactical trickery.",
    hpMult: 1.18,
    dprMult: 1.08,
    acMod: 0,
    attackMod: 1,
    dcMod: 0,
    budgetMod: 1,
    complexityMod: 0,
  },
  {
    id: "skirmisher",
    label: "Skirmisher",
    summary: "Mobile threat that pressures weak positions and retreats.",
    hpMult: 0.92,
    dprMult: 1,
    acMod: 1,
    attackMod: 0,
    dcMod: 0,
    budgetMod: 1,
    complexityMod: 1,
  },
  {
    id: "controller",
    label: "Controller",
    summary: "Shapes space with saves, movement denial, terrain, and conditions.",
    hpMult: 0.96,
    dprMult: 0.86,
    acMod: 0,
    attackMod: 0,
    dcMod: 1,
    budgetMod: 2,
    complexityMod: 2,
  },
  {
    id: "lurker",
    label: "Lurker",
    summary: "Ambush predator with stealth, burst, and readable counterplay.",
    hpMult: 0.86,
    dprMult: 1.15,
    acMod: 1,
    attackMod: 1,
    dcMod: 0,
    budgetMod: 1,
    complexityMod: 1,
  },
  {
    id: "artillery",
    label: "Artillery",
    summary: "Ranged or area pressure that must be protected by space or minions.",
    hpMult: 0.82,
    dprMult: 1.2,
    acMod: -1,
    attackMod: 1,
    dcMod: 1,
    budgetMod: 2,
    complexityMod: 1,
  },
  {
    id: "support",
    label: "Support",
    summary: "Makes other threats worse through buffs, healing, summons, or scene pressure.",
    hpMult: 0.9,
    dprMult: 0.72,
    acMod: 0,
    attackMod: 0,
    dcMod: 1,
    budgetMod: 1,
    complexityMod: 2,
  },
];

export const MONSTER_TIERS = [
  {
    id: "normal",
    label: "Normal",
    summary: "Baseline monster for its CR.",
    hpMult: 1,
    dprMult: 1,
    acMod: 0,
    budgetOffset: 0,
    complexityCapOffset: 0,
    pressureMod: 0,
  },
  {
    id: "elite",
    label: "Elite",
    summary: "Stronger single threat without full legendary action economy.",
    hpMult: 1.32,
    dprMult: 1.12,
    acMod: 0,
    budgetOffset: 3,
    complexityCapOffset: 2,
    pressureMod: 2,
  },
  {
    id: "boss",
    label: "Boss",
    summary: "Setpiece creature with phases, reactions, or lair pressure.",
    hpMult: 1.75,
    dprMult: 1.22,
    acMod: 1,
    budgetOffset: 6,
    complexityCapOffset: 4,
    pressureMod: 4,
  },
  {
    id: "legendary",
    label: "Legendary",
    summary: "Solo-grade monster with alternative action economy.",
    hpMult: 1.95,
    dprMult: 1.35,
    acMod: 1,
    budgetOffset: 8,
    complexityCapOffset: 5,
    pressureMod: 6,
  },
  {
    id: "setpiece",
    label: "Setpiece",
    summary: "Encounter-defining horror object, ritual beast, or scene monster.",
    hpMult: 1.55,
    dprMult: 1.05,
    acMod: 0,
    budgetOffset: 7,
    complexityCapOffset: 6,
    pressureMod: 5,
  },
];

export const TEMPO_PROFILES = [
  {
    id: "slow",
    label: "Slow",
    summary: "Predictable, heavy, and easier to kite.",
    initiativeMod: -2,
    dprMult: 0.9,
    attackMod: 0,
    budgetMod: -1,
    complexityMod: 0,
    pressureMod: -1,
  },
  {
    id: "standard",
    label: "Standard",
    summary: "Uses ordinary initiative and turn rhythm.",
    initiativeMod: 0,
    dprMult: 1,
    attackMod: 0,
    budgetMod: 0,
    complexityMod: 0,
    pressureMod: 0,
  },
  {
    id: "fast",
    label: "Fast",
    summary: "Acts early and can punish exposed characters.",
    initiativeMod: 2,
    dprMult: 1.06,
    attackMod: 0,
    budgetMod: 1,
    complexityMod: 1,
    pressureMod: 1,
  },
  {
    id: "ambusher",
    label: "Ambusher",
    summary: "Front-loaded pressure before the party fully stabilizes.",
    initiativeMod: 3,
    dprMult: 1.12,
    attackMod: 1,
    budgetMod: 2,
    complexityMod: 1,
    pressureMod: 2,
  },
  {
    id: "legendary",
    label: "Legendary",
    summary: "Boss tempo through initiative, reactions, lair pressure, or off-turn actions.",
    initiativeMod: 4,
    dprMult: 1.18,
    attackMod: 1,
    budgetMod: 3,
    complexityMod: 2,
    pressureMod: 3,
  },
];

export const UNAVAILABLE_CREATURE_TYPE_IDS = ["aberration"];

export const UNAVAILABLE_CREATURE_CATEGORIES = {
  beast: ["Wolf", "Bird"],
};

export function isCreatureTypeUnavailable(typeId) {
  return UNAVAILABLE_CREATURE_TYPE_IDS.includes(typeId);
}

export function isCreatureCategoryUnavailable(typeId, category) {
  return (UNAVAILABLE_CREATURE_CATEGORIES[typeId] || []).includes(category);
}

export function getAvailableCreatureCategories(type) {
  if (!type) return [];
  return type.categories.filter((category) => !isCreatureCategoryUnavailable(type.id, category));
}

export function getDefaultCreatureCategory(type) {
  return getAvailableCreatureCategories(type)[0] || type?.categories?.[0] || "Zombie";
}
