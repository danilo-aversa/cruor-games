import {
  Activity,
  BookOpen,
  Eye,
  Flame,
  Gauge,
  Shield,
  Skull,
  Sword,
  Wand2,
} from "lucide-react";

export const SLOTS = [
  { id: "body", label: "Body", icon: Activity, hint: "What the creature physically is." },
  { id: "mind", label: "Mind", icon: Eye, hint: "What drives its behavior." },
  { id: "movement", label: "Movement", icon: Gauge, hint: "How it reaches the characters." },
  { id: "attack", label: "Attack Pattern", icon: Sword, hint: "Its main offensive loop." },
  { id: "horror", label: "Horror Feature", icon: Flame, hint: "The memorable disturbing element." },
  { id: "twist", label: "Combat Twist", icon: Wand2, hint: "The rule that changes the fight." },
  { id: "weakness", label: "Weakness / Tell", icon: Shield, hint: "Counterplay and readability." },
  { id: "death", label: "Death Effect", icon: Skull, hint: "What happens when it dies." },
  {
    id: "lair",
    label: "Lair / Scene Effect",
    icon: BookOpen,
    hint: "Optional pressure from the environment.",
  },
];

export const MONSTER_COMPOSER_WORKFLOW = {
  id: "monster",
  label: "Monster Composer",
  description: "Build readable dark fantasy monsters from anatomy slots, horror grafts, pressure, complexity, counterplay, and export-ready stat block notes.",
  defaultTitle: "Cruor Monster",
  slots: SLOTS,
};

export const DEFAULT_SLOT_CAPS = Object.fromEntries(SLOTS.map((slot) => [slot.id, 1]));

export const SILHOUETTE_SLOT_CARDS = {
  mind: { x: 0.16, y: 0.24, side: "left" },
  horror: { x: 0.16, y: 0.41, side: "left" },
  weakness: { x: 0.16, y: 0.58, side: "left" },
  death: { x: 0.16, y: 0.75, side: "left" },
  body: { x: 0.84, y: 0.24, side: "right" },
  attack: { x: 0.84, y: 0.41, side: "right" },
  movement: { x: 0.84, y: 0.58, side: "right" },
  twist: { x: 0.84, y: 0.75, side: "right" },
  lair: { x: 0.5, y: 0.92, side: "bottom" },
};

export const ANATOMY_LEFT_SLOT_IDS = ["mind", "horror", "weakness", "death"];
export const ANATOMY_RIGHT_SLOT_IDS = ["body", "attack", "movement", "twist"];
export const ANATOMY_BOTTOM_SLOT_IDS = ["lair"];

