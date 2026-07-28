import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCheck,
  Eraser,
  HeartPulse,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Swords,
  TriangleAlert,
  X,
} from "lucide-react";

import { ComposerCollapsibleSection } from "../../../components/ui/composer-rail.jsx";
import { ALL_MONSTER_SOURCES as SOURCES } from "../data/monster-content-pack-feed.js";
import { CREATURE_TYPES, DANGERS, ROLES } from "../monster-composer.taxonomies.js";
import { SLOTS } from "../monster-composer.workflow.js";
import { getSelectedIdsForSlot } from "../model/monster-composer.selection.js";
import {
  formatToken,
  getCompatibilityStatus,
  getFeatureAnatomyConstraintSummary,
  getFeatureAnatomyGrantSummary,
  getFeatureCompatibility,
} from "../model/monster-composer.compatibility.js";
import {
  getFeatureMechanicProfile,
  getFeatureSection,
  summarizeMechanicProfiles,
} from "../model/monster-composer.balance.js";
import {
  buildRenderableStatBlock,
  getSectionLabel,
  groupFeaturesBySection,
  normalizeMonsterReferences,
} from "../model/monster-composer.export.js";
import {
  buildMonsterAbilitiesFromFeatures,
  expandMonsterFeaturesForStatBlock,
} from "../model/monster-ability-model.js";
import { ensureMonsterBasicAttackFeature } from "../model/monster-basic-attack.js";
import { normalizeMonsterGraftRules } from "../model/monster-graft-rules.schema.js";
import { sumFeatureBalanceStats } from "../model/monster-graft-balance-profile.js";
import { buildClosedLoopCrFit } from "../model/monster-cr-fitting.js";
import { getMonsterRuleset } from "../rulesets/index.js";

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function useCruorReducedMotion() {
  const systemPrefersReducedMotion = useReducedMotion();
  const [siteMotionMode, setSiteMotionMode] = useState(() =>
    typeof document === "undefined"
      ? "system"
      : document.documentElement.dataset.a11yMotion || "system",
  );

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const syncMotionMode = () => setSiteMotionMode(root.dataset.a11yMotion || "system");
    syncMotionMode();
    const MotionObserver = window.MutationObserver;
    if (!MotionObserver) return undefined;
    const observer = new MotionObserver(syncMotionMode);
    observer.observe(root, { attributes: true, attributeFilter: ["data-a11y-motion"] });
    return () => observer.disconnect();
  }, []);

  if (siteMotionMode === "reduced") return true;
  if (siteMotionMode === "full") return false;
  return Boolean(systemPrefersReducedMotion);
}


function PressureMetricIcon({ className = "", ...props } = {}) {
  return (
    <svg
      {...props}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 17.5a8 8 0 1 1 16 0" />
      <path d="M7.2 14.4 5.7 13M16.8 14.4l1.5-1.4M12 9V6.8" />
      <path d="m12 17.5 3.7-4.1" />
      <circle cx="12" cy="17.5" r="1.15" />
    </svg>
  );
}

function ComplexityMetricIcon({ className = "", ...props } = {}) {
  return (
    <svg
      {...props}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="5" height="5" rx="0.7" />
      <rect x="15" y="4" width="5" height="5" rx="0.7" />
      <rect x="9.5" y="15" width="5" height="5" rx="0.7" />
      <path d="M9 6.5h6M6.5 9v2.2L12 15M17.5 9v2.2L12 15" />
    </svg>
  );
}

const FONT_AWESOME_SIGNATURE_ICONS = Object.freeze({
  clock: Object.freeze({ width: 512, height: 512, unicode: "f017", path: "M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z" }),
  bolt: Object.freeze({ width: 448, height: 512, unicode: "f0e7", path: "M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z" }),
  arrowsRotate: Object.freeze({ width: 512, height: 512, unicode: "f021", path: "M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" }),
  infinity: Object.freeze({ width: 640, height: 512, unicode: "f534", path: "M0 241.1C0 161 65 96 145.1 96c38.5 0 75.4 15.3 102.6 42.5L320 210.7l72.2-72.2C419.5 111.3 456.4 96 494.9 96C575 96 640 161 640 241.1l0 29.7C640 351 575 416 494.9 416c-38.5 0-75.4-15.3-102.6-42.5L320 301.3l-72.2 72.2C220.5 400.7 183.6 416 145.1 416C65 416 0 351 0 270.9l0-29.7zM274.7 256l-72.2-72.2c-15.2-15.2-35.9-23.8-57.4-23.8C100.3 160 64 196.3 64 241.1l0 29.7c0 44.8 36.3 81.1 81.1 81.1c21.5 0 42.2-8.5 57.4-23.8L274.7 256zm90.5 0l72.2 72.2c15.2 15.2 35.9 23.8 57.4 23.8c44.8 0 81.1-36.3 81.1-81.1l0-29.7c0-44.8-36.3-81.1-81.1-81.1c-21.5 0-42.2 8.5-57.4 23.8L365.3 256z" }),
  hourglassHalf: Object.freeze({ width: 384, height: 512, unicode: "f252", path: "M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64l0 11c0 42.4 16.9 83.1 46.9 113.1L146.7 256 78.9 323.9C48.9 353.9 32 394.6 32 437l0 11c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 256 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-11c0-42.4-16.9-83.1-46.9-113.1L237.3 256l67.9-67.9c30-30 46.9-70.7 46.9-113.1l0-11c17.7 0 32-14.3 32-32s-14.3-32-32-32L320 0 64 0 32 0zM96 75l0-11 192 0 0 11c0 19-5.6 37.4-16 53L112 128c-10.3-15.6-16-34-16-53zm16 309c3.5-5.3 7.6-10.3 12.1-14.9L192 301.3l67.9 67.9c4.6 4.6 8.6 9.6 12.1 14.9L112 384z" }),
  bullseye: Object.freeze({ width: 512, height: 512, unicode: "f140", path: "M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" }),
  diceD20: Object.freeze({ width: 512, height: 512, unicode: "f6cf", path: "M48.7 125.8l53.2 31.9c7.8 4.7 17.8 2 22.2-5.9L201.6 12.1c3-5.4-.9-12.1-7.1-12.1c-1.6 0-3.2 .5-4.6 1.4L47.9 98.8c-9.6 6.6-9.2 20.9 .8 26.9zM16 171.7l0 123.5c0 8 10.4 11 14.7 4.4l60-92c5-7.6 2.6-17.8-5.2-22.5L40.2 158C29.6 151.6 16 159.3 16 171.7zM310.4 12.1l77.6 139.6c4.4 7.9 14.5 10.6 22.2 5.9l53.2-31.9c10-6 10.4-20.3 .8-26.9L322.1 1.4c-1.4-.9-3-1.4-4.6-1.4c-6.2 0-10.1 6.7-7.1 12.1zM496 171.7c0-12.4-13.6-20.1-24.2-13.7l-45.3 27.2c-7.8 4.7-10.1 14.9-5.2 22.5l60 92c4.3 6.7 14.7 3.6 14.7-4.4l0-123.5zm-49.3 246L286.1 436.6c-8.1 .9-14.1 7.8-14.1 15.9l0 52.8c0 3.7 3 6.8 6.8 6.8c.8 0 1.6-.1 2.4-.4l172.7-64c6.1-2.2 10.1-8 10.1-14.5c0-9.3-8.1-16.5-17.3-15.4zM233.2 512c3.7 0 6.8-3 6.8-6.8l0-52.6c0-8.1-6.1-14.9-14.1-15.9l-160.6-19c-9.2-1.1-17.3 6.1-17.3 15.4c0 6.5 4 12.3 10.1 14.5l172.7 64c.8 .3 1.6 .4 2.4 .4zM41.7 382.9l170.9 20.2c7.8 .9 13.4-7.5 9.5-14.3l-85.7-150c-5.9-10.4-20.7-10.8-27.3-.8L30.2 358.2c-6.5 9.9-.3 23.3 11.5 24.7zm439.6-24.8L402.9 238.1c-6.5-10-21.4-9.6-27.3 .8L290.2 388.5c-3.9 6.8 1.6 15.2 9.5 14.3l170.1-20c11.8-1.4 18-14.7 11.5-24.6zm-216.9 11l78.4-137.2c6.1-10.7-1.6-23.9-13.9-23.9l-145.7 0c-12.3 0-20 13.3-13.9 23.9l78.4 137.2c3.7 6.4 13 6.4 16.7 0zM174.4 176l163.2 0c12.2 0 19.9-13.1 14-23.8l-80-144c-2.8-5.1-8.2-8.2-14-8.2l-3.2 0c-5.8 0-11.2 3.2-14 8.2l-80 144c-5.9 10.7 1.8 23.8 14 23.8z" }),
  crosshairs: Object.freeze({ width: 512, height: 512, unicode: "f05b", path: "M256 0c17.7 0 32 14.3 32 32l0 10.4c93.7 13.9 167.7 88 181.6 181.6l10.4 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-10.4 0c-13.9 93.7-88 167.7-181.6 181.6l0 10.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-10.4C130.3 455.7 56.3 381.7 42.4 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l10.4 0C56.3 130.3 130.3 56.3 224 42.4L224 32c0-17.7 14.3-32 32-32zM107.4 288c12.5 58.3 58.4 104.1 116.6 116.6l0-20.6c0-17.7 14.3-32 32-32s32 14.3 32 32l0 20.6c58.3-12.5 104.1-58.4 116.6-116.6L384 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l20.6 0C392.1 165.7 346.3 119.9 288 107.4l0 20.6c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-20.6C165.7 119.9 119.9 165.7 107.4 224l20.6 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-20.6 0zM256 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" }),
  shieldHalved: Object.freeze({ width: 512, height: 512, unicode: "f3ed", path: "M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z" }),
  heartPulse: Object.freeze({ width: 512, height: 512, unicode: "f21e", path: "M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z" }),
  personRunning: Object.freeze({ width: 448, height: 512, unicode: "f70c", path: "M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z" }),
  khanda: Object.freeze({ width: 512, height: 512, unicode: "f66d", path: "M245.8 3.7c5.9-4.9 14.6-4.9 20.5 0l48 40c5.9 4.9 7.5 13.2 3.8 19.9c0 0 0 0 0 0s0 0 0 0s0 0 0 0s0 0 0 0l-.1 .1-.3 .6c-.3 .5-.7 1.3-1.2 2.3c-1 2-2.6 5-4.4 8.6c-.5 .9-.9 1.9-1.4 2.9C344.9 97.4 368 134 368 176s-23.1 78.6-57.3 97.8c.5 1 1 2 1.4 2.9c1.8 3.7 3.3 6.6 4.4 8.6c.5 1 .9 1.8 1.2 2.3l.3 .6 .1 .1s0 0 0 0s0 0 0 0c3.6 6.7 2 15-3.8 19.9L272 343.5l0 19.8 35.6-24.5 41.1-28.2c42.8-29.4 68.4-78 68.4-130c0-31.1-9.2-61.6-26.5-87.5l-2.8-4.2c-4-6-3.5-14 1.3-19.5s12.7-7 19.2-3.7L401.1 80c7.2-14.3 7.2-14.3 7.2-14.3s0 0 0 0s0 0 0 0l.1 0 .3 .2 1 .5c.8 .4 2 1.1 3.5 1.9c2.9 1.7 7 4.1 11.8 7.3c9.6 6.4 22.5 16.1 35.4 29c25.7 25.7 52.7 65.6 52.7 119.3c0 53.1-26.4 100.5-51.2 133.6c-12.6 16.7-25.1 30.3-34.5 39.7c-4.7 4.7-8.7 8.4-11.5 10.9c-1.4 1.3-2.5 2.2-3.3 2.9l-.9 .8-.3 .2-.1 .1c0 0 0 0 0 0s0 0 0 0L401.1 400l10.2 12.3c-5.1 4.3-12.4 4.9-18.2 1.6l-75.6-43-32.7 22.5 45.5 31.3c1.8-.4 3.7-.7 5.7-.7c13.3 0 24 10.7 24 24s-10.7 24-24 24c-12.2 0-22.3-9.1-23.8-21L272 423.4l0 28.9c9.6 5.5 16 15.9 16 27.7c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-11.8 6.4-22.2 16-27.7l0-28.1-40.3 27.7C197.8 463.3 187.9 472 176 472c-13.3 0-24-10.7-24-24s10.7-24 24-24c2.2 0 4.4 .3 6.5 .9l45.8-31.5-32.7-22.5-75.6 43c-5.8 3.3-13 2.7-18.2-1.6L112 400c-10.2 12.3-10.2 12.3-10.3 12.3s0 0 0 0s0 0 0 0l-.1-.1-.3-.2-.9-.8c-.8-.7-1.9-1.7-3.3-2.9c-2.8-2.5-6.7-6.2-11.5-10.9c-9.4-9.4-21.9-23-34.5-39.7C26.4 324.5 0 277.1 0 224c0-53.7 26.9-93.6 52.7-119.3c12.9-12.9 25.8-22.6 35.4-29C93 72.5 97 70 99.9 68.4c1.5-.8 2.6-1.5 3.5-1.9l1-.5 .3-.2 .1 0c0 0 0 0 0 0s0 0 0 0L112 80l-7.2-14.3c6.5-3.2 14.3-1.7 19.2 3.7s5.3 13.4 1.3 19.5l-2.8 4.2C105.2 119 96 149.5 96 180.6c0 51.9 25.6 100.6 68.4 130l41.1 28.2L240 362.6l0-19.1-42.2-35.2c-5.9-4.9-7.5-13.2-3.8-19.9c0 0 0 0 0 0s0 0 0 0s0 0 0 0l.1-.1 .3-.6c.3-.5 .7-1.3 1.2-2.3c1-2 2.6-5 4.4-8.6c.5-.9 .9-1.9 1.4-2.9C167.1 254.6 144 218 144 176s23.1-78.6 57.3-97.8c-.5-1-1-2-1.4-2.9c-1.8-3.7-3.3-6.6-4.4-8.6c-.5-1-.9-1.8-1.2-2.3l-.3-.6-.1-.1s0 0 0 0s0 0 0 0s0 0 0 0c-3.6-6.7-2-15 3.8-19.9l48-40zM220.2 122.9c-17 11.5-28.2 31-28.2 53.1s11.2 41.6 28.2 53.1C227 210.2 232 190.9 232 176s-5-34.2-11.8-53.1zm71.5 106.2c17-11.5 28.2-31 28.2-53.1s-11.2-41.6-28.2-53.1C285 141.8 280 161.1 280 176s5 34.2 11.8 53.1z" }),
  link: Object.freeze({ width: 640, height: 512, unicode: "f0c1", path: "M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z" }),
  wandMagicSparkles: Object.freeze({ width: 576, height: 512, unicode: "e2ca", path: "M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z" }),
});

function FontAwesomeSignatureIcon({ icon, className = "", ...props }) {
  if (!icon) return null;
  const paths = Array.isArray(icon.path) ? icon.path : [icon.path];

  return (
    <svg
      {...props}
      className={className}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      fill="currentColor"
      focusable="false"
      aria-hidden="true"
      data-icon-source="font-awesome-free-solid"
    >
      {paths.map((path, index) => (
        <path key={`${icon.unicode}-${index}`} d={path} />
      ))}
    </svg>
  );
}

function formatUsageProfile(profile) {
  if (!profile || typeof profile !== "object") return "";
  const frequency = titleCase(profile.frequency || "");
  if (profile.frequency === "recharge") {
    return profile.recharge ? `Recharge ${profile.recharge}` : "Recharge";
  }
  if (profile.pattern === "multiattack") {
    const count = Number(profile.count || 0);
    return `${frequency || "At Will"}${count ? ` · ${count} attacks` : " · Multiattack"}`;
  }
  if (profile.pattern === "spellcasting") {
    return `${frequency || "At Will"} · Spellcasting`;
  }
  if (profile.pattern === "summon") {
    return `${frequency || "At Will"} · Summon`;
  }
  if (profile.pattern === "procedure") {
    return `${frequency || "At Will"} · ${titleCase(profile.procedureType || "Procedure")}`;
  }
  return frequency;
}

function formatDamageProfile(profile) {
  if (!profile || typeof profile !== "object") return "";
  const average = Number(profile.baseDamage || 0);
  const damageType = String(profile.damageType || "").trim();
  if (average > 0 && damageType && damageType !== "Variable") {
    return `${average} average · ${damageType}`;
  }
  if (average > 0) return `${average} average`;
  if (damageType && damageType !== "Variable") return damageType;
  return "";
}

function formatConditionProfile(profile) {
  if (!profile || typeof profile !== "object") return "";
  const conditions = Array.isArray(profile.conditions) ? profile.conditions.filter(Boolean) : [];
  const special = Array.isArray(profile.special) ? profile.special.filter(Boolean) : [];
  return [...conditions, ...special].map(titleCase).join(" · ");
}

const ACTION_ECONOMY_LABELS = Object.freeze({
  passive: "Passive",
  action: "Action",
  bonusAction: "Bonus Action",
  reaction: "Reaction",
  legendaryAction: "Legendary Action",
  lairAction: "Lair Action",
  deathTrigger: "Death Trigger",
  freeTrigger: "Free Trigger",
});

const USAGE_LABELS = Object.freeze({
  passive: "Always On",
  atWill: "At Will",
  at_will: "At Will",
  recharge: "Recharge",
  limited: "Limited Use",
  triggered: "Triggered",
  reaction: "Triggered",
  lair: "Lair Cycle",
  lair_action: "Lair Cycle",
  legendary: "Legendary Use",
  death: "On Death",
});

const DEFENSE_LABELS = Object.freeze({
  legendaryResistance: "Legendary Resistance",
  magicResistance: "Magic Resistance",
  regeneration: "Regeneration",
  parry: "Parry",
  damageReduction: "Damage Reduction",
  evasion: "Evasion",
  avoidance: "Avoidance",
  turnResistance: "Turn Resistance",
  defensiveReaction: "Defensive Reaction",
  custom: "Defense",
});

const PROCEDURE_LABELS = Object.freeze({
  swallow: "Swallow",
  engulf: "Engulf",
  possession: "Possession",
  shapechange: "Shapechange",
  objectAnimation: "Object Animation",
  corpseDetonation: "Corpse Detonation",
  burrowReturn: "Burrow Return",
  gazeLock: "Gaze Lock",
  custom: "Special Procedure",
});

const AREA_LABELS = Object.freeze({
  aura: "Aura",
  emanation: "Emanation",
  hazard: "Hazard",
  zone: "Zone",
  regional: "Regional Effect",
  custom: "Area Effect",
});

const MOVEMENT_MODE_PATTERNS = Object.freeze([
  [/teleport|blink|phase\b/i, "Teleport"],
  [/burrow|tunnel/i, "Burrow"],
  [/\bfly|flight|airborne/i, "Flight"],
  [/climb|wall[- ]?crawl/i, "Climb"],
  [/swim|aquatic/i, "Swim"],
  [/leap|jump|pounce/i, "Leap"],
  [/dash|charge|rush/i, "Charge"],
  [/forced movement|push|pull|drag/i, "Forced Movement"],
  [/reposition|shift|disengage/i, "Reposition"],
]);

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function getExpandedSignatureEntries(feature) {
  const expanded = expandMonsterFeaturesForStatBlock([feature])
    .filter(Boolean)
    .filter((entry) => String(entry?.title || "").trim().toLowerCase() !== "multiattack");
  return expanded.length ? expanded : [feature];
}

function getActionEconomySignature(entries) {
  const values = entries.map((entry) => normalizeMonsterGraftRules(entry).actionEconomy).filter(Boolean);
  if (!values.length) return null;
  const unique = uniqueValues(values);

  if (unique.length === 1) {
    const value = unique[0];
    const count = values.length;
    if (count > 1) {
      if (value === "action") return `${count} Actions`;
      if (value === "reaction") return `${count} Reactions`;
      if (value === "bonusAction") return `${count} Bonus Actions`;
      if (value === "passive") return `${count} Traits`;
    }
    return ACTION_ECONOMY_LABELS[value] || titleCase(value);
  }

  return unique
    .map((value) => ACTION_ECONOMY_LABELS[value] || titleCase(value))
    .join(" + ");
}

function getUsageSignature(feature, entries, slotId) {
  const rootRules = normalizeMonsterGraftRules(feature);
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const usageProfile = mechanicProfile?.usageProfile || {};
  const usageType = rootRules.usage?.type || usageProfile.frequency || "";

  if (usageType === "recharge" || usageProfile.frequency === "recharge") {
    const recharge = rootRules.usage?.value || usageProfile.recharge;
    return recharge ? `Recharge ${recharge}` : "Recharge";
  }

  if (usageType === "limited") {
    const value = rootRules.usage?.value || rootRules.usage?.uses || rootRules.usage?.limit;
    if (typeof value === "number") return `${value}/Day`;
    if (value) return String(value);
    return "Limited Use";
  }

  const entryUsageTypes = uniqueValues(
    entries.map((entry) => normalizeMonsterGraftRules(entry).usage?.type).filter(Boolean),
  );
  const resolvedType = usageType || entryUsageTypes[0] || "";

  if (slotId === "death" && ["death", "triggered"].includes(resolvedType)) return null;
  if (slotId === "lair" && ["lair", "lair_action"].includes(resolvedType)) return null;
  return USAGE_LABELS[resolvedType] || (resolvedType ? titleCase(resolvedType) : null);
}

function getResolutionSignature(entries) {
  const rulesEntries = entries.map((entry) => normalizeMonsterGraftRules(entry));
  const hasArea = rulesEntries.some((rules) => rules.targeting?.type === "area" || rules.areaEffect?.enabled);
  const resolutions = uniqueValues(rulesEntries.map((rules) => rules.resolution?.type).filter(Boolean));
  const attackTypes = uniqueValues(
    rulesEntries.map((rules) => rules.resolution?.attackType).filter(Boolean),
  );

  if (hasArea && resolutions.includes("savingThrow")) return "Area Save";
  if (hasArea && resolutions.some((value) => value === "attackRoll" || value === "attackRollSavingThrow")) {
    return "Area Attack";
  }
  if (resolutions.includes("attackRollSavingThrow") || (resolutions.includes("attackRoll") && resolutions.includes("savingThrow"))) {
    return "Attack + Save";
  }
  if (resolutions.length === 1 && resolutions[0] === "attackRoll") {
    if (attackTypes.length === 1) {
      if (attackTypes[0] === "melee") return "Melee Attack";
      if (attackTypes[0] === "ranged") return "Ranged Attack";
      if (attackTypes[0] === "meleeOrRanged") return "Melee or Ranged";
    }
    return "Attack Roll";
  }
  if (resolutions.length === 1 && resolutions[0] === "savingThrow") return "Saving Throw";
  if (resolutions.length === 1 && resolutions[0] === "automatic") return "Automatic";
  if (resolutions.length === 1 && resolutions[0] === "check") return "Ability Check";
  if (resolutions.length > 1) return "Mixed Resolution";
  return null;
}

function getTargetingSignature(entries) {
  const rulesEntries = entries.map((entry) => normalizeMonsterGraftRules(entry));
  const areaRule = rulesEntries.find((rules) => rules.areaEffect?.enabled || rules.targeting?.type === "area");
  if (areaRule?.areaEffect?.type) return AREA_LABELS[areaRule.areaEffect.type] || titleCase(areaRule.areaEffect.type);
  if (areaRule) return "Area Effect";
  const targetCounts = rulesEntries
    .map((rules) => Number(rules.targeting?.count || rules.targeting?.expectedTargets || 0))
    .filter(Number.isFinite);
  const expectedTargets = Math.max(0, ...targetCounts);
  if (expectedTargets > 1) return `${expectedTargets} Targets`;
  return null;
}

function getMovementSignature(feature, entries) {
  const source = [
    feature.title,
    feature.summary,
    feature.mechanics,
    ...toArray(feature.tags),
    ...entries.flatMap((entry) => [entry.title, entry.summary, entry.mechanics, ...toArray(entry.tags)]),
  ].filter(Boolean).join(" ");
  const match = MOVEMENT_MODE_PATTERNS.find(([pattern]) => pattern.test(source));
  return match?.[1] || null;
}

function getFunctionSignature(feature, entries, slotId) {
  const rulesEntries = entries.map((entry) => normalizeMonsterGraftRules(entry));
  const mechanicProfile = getFeatureMechanicProfile(feature);

  const defense = rulesEntries.find((rules) => rules.defense?.enabled)?.defense;
  if (defense) return DEFENSE_LABELS[defense.type] || titleCase(defense.type || "Defense");

  const summon = rulesEntries.find((rules) => rules.summon?.enabled)?.summon;
  if (summon) {
    if (summon.type === "transform") return "Transformation";
    if (summon.type === "animate") return "Animation";
    if (summon.type === "spawn") return "Spawn";
    return "Summon";
  }

  const procedure = rulesEntries.find((rules) => rules.procedure?.enabled)?.procedure;
  if (procedure) return PROCEDURE_LABELS[procedure.type] || titleCase(procedure.type || "Special Procedure");

  const areaRule = rulesEntries.find((rules) => rules.areaEffect?.enabled);
  if (areaRule?.areaEffect?.type) return AREA_LABELS[areaRule.areaEffect.type] || titleCase(areaRule.areaEffect.type);

  if (slotId === "movement") {
    const movement = getMovementSignature(feature, entries);
    if (movement) return movement;
  }

  const effectTypes = uniqueValues(
    rulesEntries.flatMap((rules) => (rules.effects || []).map((effect) => effect?.type).filter(Boolean)),
  );
  if (effectTypes.includes("forcedMovement")) return "Forced Movement";
  if (effectTypes.includes("movement")) return "Movement";
  if (effectTypes.includes("defense")) return "Defense";
  if (effectTypes.includes("resource")) return "Resource Pressure";

  const conditions = uniqueValues(
    rulesEntries.flatMap((rules) => rules.condition?.names || []),
  );
  const hasDamage = rulesEntries.some((rules) => rules.damage && rules.damage.mode !== "none");
  if (conditions.length && hasDamage) return "Damage + Control";
  if (conditions.length === 1) return titleCase(conditions[0]);
  if (conditions.length > 1) return "Control";

  if (effectTypes.includes("control")) return "Control";

  const damageTypes = uniqueValues(
    rulesEntries.flatMap((rules) => {
      const direct = rules.damage?.types || [];
      const parts = Array.isArray(rules.damage?.parts)
        ? rules.damage.parts.flatMap((part) => part?.types || [])
        : [];
      return [...direct, ...parts];
    }),
  );
  if (hasDamage && damageTypes.length === 1) return `${titleCase(damageTypes[0])} Damage`;
  if (hasDamage) return "Damage";

  const tags = mechanicProfile?.mechanicTags || [];
  if (tags.includes("spellcasting")) return "Spellcasting";
  if (tags.includes("ongoing_effect")) return "Ongoing Effect";
  if (tags.includes("area_effect")) return "Area Effect";
  if (tags.includes("condition")) return "Control";
  if (tags.includes("defense_feature")) return "Defense";

  const fallbackText = [
    feature.title,
    feature.summary,
    feature.mechanics,
    ...toArray(feature.tags),
  ].filter(Boolean).join(" ");
  if (/magic resistance|resistance to magic/i.test(fallbackText)) return "Magic Resistance";
  if (/damage resistance|resistant to|resistance to/i.test(fallbackText)) return "Resistance";
  if (/damage immunity|immune to|immunity to/i.test(fallbackText)) return "Immunity";
  if (/regenerat|heals? .* hit points/i.test(fallbackText)) return "Regeneration";
  if (/damage reduction|reduces? .* damage/i.test(fallbackText)) return "Damage Reduction";
  if (/aura|emanation/i.test(fallbackText)) return "Aura";
  if (/summon|spawn|animate/i.test(fallbackText)) return "Summon";
  if (/teleport|burrow|flight|climb|swim|forced movement/i.test(fallbackText)) {
    return getMovementSignature(feature, entries) || "Movement";
  }
  if (/grapple|restrain|stun|frighten|charm|paraly/i.test(fallbackText)) return "Control";
  return null;
}

function getSignatureIcon(kind, label) {
  if (kind === "economy") return FONT_AWESOME_SIGNATURE_ICONS.clock;
  if (kind === "usage") {
    if (/trigger/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.bolt;
    if (/recharge/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.arrowsRotate;
    if (/at will|always on/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.infinity;
    if (/limited|\/day/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.hourglassHalf;
    return FONT_AWESOME_SIGNATURE_ICONS.clock;
  }
  if (kind === "targeting") return FONT_AWESOME_SIGNATURE_ICONS.bullseye;
  if (kind === "resolution") {
    if (/save|check/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.diceD20;
    if (/area/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.bullseye;
    return FONT_AWESOME_SIGNATURE_ICONS.crosshairs;
  }
  if (/resistance|defense|parry|evasion|avoidance|reduction/i.test(label)) {
    return FONT_AWESOME_SIGNATURE_ICONS.shieldHalved;
  }
  if (/regeneration|healing/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.heartPulse;
  if (/movement|teleport|burrow|flight|climb|swim|leap|charge|reposition/i.test(label)) {
    return FONT_AWESOME_SIGNATURE_ICONS.personRunning;
  }
  if (/damage|attack|slam|strike/i.test(label)) return FONT_AWESOME_SIGNATURE_ICONS.khanda;
  if (/control|grapple|restrain|stun|prone|frighten|charm|possess|engulf|swallow/i.test(label)) {
    return FONT_AWESOME_SIGNATURE_ICONS.link;
  }
  return FONT_AWESOME_SIGNATURE_ICONS.wandMagicSparkles;
}

function buildCandidateSignature(feature) {
  const entries = getExpandedSignatureEntries(feature);
  const slotId = feature.slot;
  const economy = getActionEconomySignature(entries);
  const resolution = getResolutionSignature(entries);
  const usage = getUsageSignature(feature, entries, slotId);
  const targeting = getTargetingSignature(entries);
  const functionLabel = getFunctionSignature(feature, entries, slotId);

  const priorities = {
    attack: [
      ["economy", economy],
      ["resolution", resolution],
      ["usage", usage],
      ["function", functionLabel],
    ],
    body: [
      ["function", functionLabel],
      ["economy", economy === "Passive" ? null : economy],
      ["usage", usage],
      ["resolution", resolution],
    ],
    mind: [
      ["function", functionLabel],
      ["resolution", resolution],
      ["usage", usage],
      ["economy", economy === "Passive" ? null : economy],
    ],
    movement: [
      ["function", functionLabel],
      ["economy", economy],
      ["usage", usage],
      ["resolution", resolution],
    ],
    horror: [
      ["function", functionLabel],
      ["resolution", resolution],
      ["usage", usage],
      ["economy", economy === "Passive" ? null : economy],
    ],
    twist: [
      ["function", functionLabel],
      ["economy", economy],
      ["usage", usage],
      ["resolution", resolution],
    ],
    weakness: [
      ["function", functionLabel],
      ["resolution", resolution],
      ["usage", usage],
      ["economy", economy === "Passive" ? null : economy],
    ],
    death: [
      ["function", functionLabel],
      ["targeting", targeting],
      ["resolution", resolution],
    ],
    lair: [
      ["economy", economy],
      ["function", functionLabel],
      ["resolution", resolution],
      ["targeting", targeting],
      ["usage", usage],
    ],
  };

  const redundantBySlot = {
    attack: new Set(["attack", "attack pattern"]),
    body: new Set(["body"]),
    mind: new Set(["mind"]),
    movement: new Set(["movement"]),
    horror: new Set(["horror", "horror feature"]),
    twist: new Set(["combat twist", "twist"]),
    weakness: new Set(["weakness", "weakness / tell"]),
    death: new Set(["death", "death effect", "death trigger", "on death"]),
    lair: new Set(["lair", "lair / scene effect", "lair cycle"]),
  };
  const redundant = redundantBySlot[slotId] || new Set();
  const seen = new Set();

  return (priorities[slotId] || [
    ["function", functionLabel],
    ["economy", economy],
    ["usage", usage],
  ])
    .filter(([, label]) => label)
    .filter(([, label]) => !redundant.has(String(label).toLowerCase()))
    .filter(([, label]) => {
      const key = String(label).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3)
    .map(([kind, label], index) => ({
      id: `${kind}-${index}-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      kind,
      label,
      icon: getSignatureIcon(kind, label),
    }));
}

function CandidateMechanicalSignature({ feature }) {
  const signature = buildCandidateSignature(feature);
  if (!signature.length) return null;

  return (
    <div
      className="monster-graft-selector-candidate__signature"
      aria-label={`Mechanical profile: ${signature.map((item) => item.label).join(", ")}`}
    >
      {signature.map((item) => (
        <span key={item.id} className="monster-graft-selector-candidate__signature-item">
          <FontAwesomeSignatureIcon icon={item.icon} />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}


const STAT_BLOCK_INLINE_LABELS = new Set([
  "Melee Attack Roll:",
  "Ranged Attack Roll:",
  "Melee or Ranged Attack Roll:",
  "Hit:",
  "Miss:",
  "Trigger:",
  "Response:",
  "Failed Save:",
  "Successful Save:",
  "Failure:",
  "Success:",
  "Effect:",
]);

function renderStatBlockRuleText(text) {
  const source = String(text || "").trim();
  if (!source) return null;

  const pattern = /(Melee or Ranged Attack Roll:|Melee Attack Roll:|Ranged Attack Roll:|Successful Save:|Failed Save:|Trigger:|Response:|Failure:|Success:|Effect:|Hit:|Miss:)/g;
  return source.split(pattern).filter(Boolean).map((part, index) =>
    STAT_BLOCK_INLINE_LABELS.has(part)
      ? <em key={`${part}-${index}`}>{part}</em>
      : <span key={`${part.slice(0, 12)}-${index}`}>{part}</span>,
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getProjectedSelectedFeatures({
  feature,
  selectedFeatures = [],
  advancedMode = false,
  slotCaps = {},
  getSlotCap,
}) {
  if (!feature) return selectedFeatures;
  if (selectedFeatures.some((item) => item.id === feature.id)) return selectedFeatures;

  const slotCap = advancedMode
    ? getSlotCap?.(slotCaps, feature.slot) || 1
    : 1;
  const withoutCandidate = selectedFeatures.filter((item) => item.id !== feature.id);

  if (slotCap <= 1) {
    return [
      ...withoutCandidate.filter((item) => item.slot !== feature.slot),
      feature,
    ];
  }

  const slotFeatures = withoutCandidate.filter((item) => item.slot === feature.slot);
  if (slotFeatures.length >= slotCap) return withoutCandidate;
  return [...withoutCandidate, feature];
}

function buildProjectedComputed({
  computed,
  selectedFeatures,
  typeId,
  category,
  roleId,
  sourceId,
}) {
  if (!computed || !Array.isArray(selectedFeatures)) return computed;

  const creatureType =
    CREATURE_TYPES.find((entry) => entry.id === typeId) || CREATURE_TYPES[0];
  const framePowerProfile = computed.framePowerProfile || {};
  const baseline = computed.baseline || {};
  const tempoProfile = computed.tempoProfile || {};
  const monsterTier = computed.monsterTier || {};
  const targetCr = Number(computed.targetCr || 0);
  const engineFeatures = ensureMonsterBasicAttackFeature(selectedFeatures, {
    targetCr,
    category,
    typeId,
    sourceId,
  }).features;
  const statMods = sumFeatureBalanceStats(selectedFeatures);
  const featureMechanics = selectedFeatures.map((feature) => ({
    id: feature.id,
    title: feature.title,
    ...getFeatureMechanicProfile(feature),
  }));
  const mechanicsSummary = summarizeMechanicProfiles(featureMechanics);
  const abilityModel = buildMonsterAbilitiesFromFeatures(engineFeatures);
  const activeRuleset = getMonsterRuleset(computed.rulesetId);

  const baseHp = Math.round(Number(baseline.hp || 1) * Number(framePowerProfile.hpMult || 1));
  const baseDpr = Math.round(Number(baseline.dpr || 1) * Number(framePowerProfile.dprMult || 1));
  const baseAc = Number(baseline.ac || 10) + Number(framePowerProfile.acMod || 0);
  const baseAttack =
    Number(baseline.attackBonus || computed.attack || 0) +
    Number(framePowerProfile.attackMod || 0);
  const baseDc =
    Number(baseline.saveDc || computed.dc || 10) +
    Number(framePowerProfile.dcMod || 0);

  const crFit = buildClosedLoopCrFit({
    activeRuleset,
    targetCr,
    typeId,
    category,
    roleId,
    selectedFeatures: engineFeatures,
    baseline,
    abilityModel,
    statMods,
    tempoProfile,
    monsterTier,
    mechanicsSummary,
    speed: creatureType.defaults.speed,
    targetHp: Math.max(1, Math.round(baseHp + Number(statMods.hp || 0))),
    targetAc: clamp(baseAc + Number(statMods.ac || 0), 10, 28),
    targetDpr: Math.max(1, Math.round(baseDpr + Number(statMods.dpr || 0))),
    targetAttackBonus: clamp(baseAttack, 2, 18),
    targetSaveDc: clamp(baseDc + Math.floor(Number(statMods.control || 0) / 3), 10, 30),
    maxPasses: 4,
    tolerance: 1,
  });
  const dndRules = crFit.dndRules;
  const printedStats = crFit.printedStats;

  return {
    ...computed,
    selectedFeatures,
    abilityModel,
    featureMechanics,
    mechanicsSummary,
    statMods,
    printedStats,
    dprProfile: crFit.dprProfile,
    attackRoutine: crFit.dprProfile?.attackRoutine || null,
    effectiveProfile: crFit.effectiveProfile,
    crValidation: crFit.crValidation,
    rulesProfile: dndRules.rulesProfile,
    rulesValidation: dndRules.validation,
    abilityProfile: dndRules.abilityProfile,
    hpFormula: dndRules.rulesProfile?.hp?.formula,
    hp: printedStats.hp,
    ac: printedStats.ac,
    dpr: printedStats.dpr,
    dc: printedStats.saveDc,
    attack: printedStats.attackBonus,
    damageText: dndRules.damage?.defaultAttack?.text || computed.damageText,
  };
}

function buildRenderablePreviewStatBlock({
  selectedFeatures,
  computed,
  typeId,
  category,
  roleId,
  dangerId,
  sourceId,
}) {
  const creatureType =
    CREATURE_TYPES.find((entry) => entry.id === typeId) || CREATURE_TYPES[0];
  const role = ROLES.find((entry) => entry.id === roleId) || ROLES[0];
  const danger = DANGERS.find((entry) => entry.id === dangerId) || DANGERS[0];
  const engineFeatures = ensureMonsterBasicAttackFeature(selectedFeatures, {
    targetCr: computed.targetCr,
    category,
    typeId,
    sourceId,
  }).features;
  const sectionGroups = groupFeaturesBySection(engineFeatures);

  return buildRenderableStatBlock({
    name: computed.name || "Monster",
    creatureType,
    category,
    role,
    danger,
    computed,
    abilityProfile: computed.abilityProfile || { physical: [], mental: [] },
    traits: sectionGroups.trait || [],
    actions: sectionGroups.action || [],
    bonusActions: sectionGroups.bonusAction || [],
    reactions: sectionGroups.reaction || [],
    legendaryActions: sectionGroups.legendaryAction || [],
    lairActions: sectionGroups.lairAction || [],
    deathEffects: sectionGroups.death || [],
    selectedFeatures,
    hasLegendaryActions: roleId === "boss",
    xp: "",
    lairXp: "",
  });
}

function normalizePreviewItem(item) {
  return {
    id: item.id || item.title,
    title: item.title || "Feature",
    text: String(item.text || "").trim(),
  };
}

function buildStatBlockPreviewGroups({
  feature,
  computed,
  selectedFeatures,
  typeId,
  category,
  roleId,
  dangerId,
  sourceId,
  advancedMode,
  slotCaps,
  getSlotCap,
}) {
  if (!feature || !computed) return [];

  const candidateIsInstalled = selectedFeatures.some((item) => item.id === feature.id);
  const projectedSelectedFeatures = getProjectedSelectedFeatures({
    feature,
    selectedFeatures,
    advancedMode,
    slotCaps,
    getSlotCap,
  });
  const projectedComputed = candidateIsInstalled
    ? computed
    : buildProjectedComputed({
        computed,
        selectedFeatures: projectedSelectedFeatures,
        typeId,
        category,
        roleId,
        sourceId,
      });
  const currentStatBlock = buildRenderablePreviewStatBlock({
    selectedFeatures,
    computed,
    typeId,
    category,
    roleId,
    dangerId,
    sourceId,
  });
  const projectedStatBlock = candidateIsInstalled
    ? currentStatBlock
    : buildRenderablePreviewStatBlock({
        selectedFeatures: projectedSelectedFeatures,
        computed: projectedComputed,
        typeId,
        category,
        roleId,
        dangerId,
        sourceId,
      });

  const currentItems = new Map();
  currentStatBlock.sections.forEach((section) => {
    section.items.forEach((item) => {
      const normalized = normalizePreviewItem(item);
      currentItems.set(`${section.id}:${normalized.id}`, normalized);
    });
  });

  const candidateExpanded = expandMonsterFeaturesForStatBlock([feature]);
  const candidateIds = new Set(candidateExpanded.map((item) => item.id).filter(Boolean));
  const candidateTitles = new Set(
    candidateExpanded.map((item) => String(item.title || "").trim()).filter(Boolean),
  );

  return projectedStatBlock.sections
    .map((section) => {
      const items = section.items
        .map(normalizePreviewItem)
        .filter((item) => {
          const belongsToCandidate =
            candidateIds.has(item.id) || candidateTitles.has(item.title);
          if (!belongsToCandidate) return false;
          if (candidateIsInstalled) return true;

          const current = currentItems.get(`${section.id}:${item.id}`);
          return !current || current.title !== item.title || current.text !== item.text;
        });
      return { id: section.id, label: section.title, items };
    })
    .filter((section) => section.items.length > 0);
}

function StatBlockEffectPreview({ groups }) {
  if (!groups.length) return null;

  return (
    <div className="monster-graft-selector-detail__stat-block-preview">
      {groups.map((group) => (
        <section key={group.id} className="cruor-stat-block__section">
          <h2>{group.label}</h2>
          {group.items.map((entry) => (
            <p key={entry.id}>
              <strong><em>{entry.title}.</em></strong>{" "}
              {renderStatBlockRuleText(entry.text)}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

function MetricChangeCard({
  icon: Icon,
  label,
  result,
  current,
  projected,
  tone,
  ariaLabel,
  warning = null,
}) {
  const resolvedAriaLabel = ariaLabel ||
    `${label}: ${result}; changes from ${current} to ${projected}`;
  const warningProps = warning
    ? {
        tabIndex: 0,
        "data-key": "tooltip-generic",
        "data-tooltip": warning.title,
        "data-tooltip-description": warning.description,
      }
    : {};

  return (
    <div
      className={`monster-graft-selector-detail__change-card is-${tone}${warning ? " is-over-limit" : ""}`}
      aria-label={warning ? `${resolvedAriaLabel}. ${warning.title}.` : resolvedAriaLabel}
      {...warningProps}
    >
      <span className="monster-graft-selector-detail__change-title">
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </span>

      <strong className="monster-graft-selector-detail__change-result">
        {result}
      </strong>

      <div className="monster-graft-selector-detail__change-values">
        <span>{current}</span>
        <ArrowRight aria-hidden="true" />
        <strong>{projected}</strong>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  className = "",
  defaultExpanded = true,
  children,
}) {
  return (
    <ComposerCollapsibleSection
      title={title}
      defaultExpanded={defaultExpanded}
      className={`monster-graft-selector__filter-section monster-graft-selector-detail__section ${className}`.trim()}
      bodyClassName="monster-graft-selector-detail__section-body"
    >
      {children}
    </ComposerCollapsibleSection>
  );
}

function DetailFactRow({ label, value, className = "", emphasized = true }) {
  if (!value) return null;
  const ValueTag = emphasized ? "strong" : "span";
  return (
    <div
      className={`monster-graft-selector-detail__rules-row ${className}`.trim()}
    >
      <span className="monster-graft-selector-detail__rules-label">{label}</span>
      <ValueTag className="monster-graft-selector-detail__rules-value">{value}</ValueTag>
    </div>
  );
}

const FILTER_STATE_NEUTRAL = "neutral";
const FILTER_STATE_INCLUDE = "include";
const FILTER_STATE_EXCLUDE = "exclude";

function getFilterState(states, id) {
  return states?.[id] || FILTER_STATE_NEUTRAL;
}

function getNextFilterState(state) {
  if (state === FILTER_STATE_NEUTRAL) return FILTER_STATE_INCLUDE;
  if (state === FILTER_STATE_INCLUDE) return FILTER_STATE_EXCLUDE;
  return FILTER_STATE_NEUTRAL;
}

function updateTriStateFilter(setStates, id) {
  setStates((current) => {
    const nextState = getNextFilterState(getFilterState(current, id));
    if (nextState === FILTER_STATE_NEUTRAL) {
      const next = { ...current };
      delete next[id];
      return next;
    }
    return { ...current, [id]: nextState };
  });
}

function hasTriStateFilters(states) {
  return Object.values(states || {}).some((state) => state !== FILTER_STATE_NEUTRAL);
}

function matchesTriStateGroup(item, options, states) {
  const included = options.filter(
    (option) => getFilterState(states, option.id) === FILTER_STATE_INCLUDE,
  );
  const excluded = options.filter(
    (option) => getFilterState(states, option.id) === FILTER_STATE_EXCLUDE,
  );

  if (excluded.some((option) => option.matches(item))) return false;
  if (included.length > 0 && !included.some((option) => option.matches(item))) return false;
  return true;
}

function TriStateFilterRow({ label, state, onCycle, leading = null }) {
  const stateDescription =
    state === FILTER_STATE_INCLUDE
      ? "included"
      : state === FILTER_STATE_EXCLUDE
        ? "excluded"
        : "not filtered";

  return (
    <button
      type="button"
      className={`monster-graft-selector__filter-row is-${state}`}
      data-filter-state={state}
      aria-label={`${label}: ${stateDescription}`}
      aria-pressed={
        state === FILTER_STATE_INCLUDE
          ? true
          : state === FILTER_STATE_EXCLUDE
            ? "mixed"
            : false
      }
      onClick={onCycle}
    >
      {leading ? (
        <span className="monster-graft-selector__filter-row-leading" aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span className="monster-graft-selector__filter-row-label">{label}</span>
    </button>
  );
}

function getContentPackId(entry) {
  return entry?.contentPack?.id || "core-cruor";
}

function getContentPackTitle(entry) {
  return entry?.contentPack?.title || "Core Monster Composer";
}

function getSourcePackTitle(source) {
  return source?.contentPack?.title || "Core Monster Composer";
}

function getReadableText(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string" || typeof item === "number")
      .map(String)
      .join(" · ")
      .trim();
  }
  return "";
}

function EmptyState({ text }) {
  return <div className="empty">{text}</div>;
}

function signedDelta(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function hasDelta(value) {
  return Number(value || 0) !== 0;
}

function getCounterplayTone(counterplay) {
  if (counterplay === "Improves") return "positive";
  if (counterplay === "Worsens" || counterplay === "Needs Tell") return "negative";
  return "";
}

function getDeltaTone(value) {
  const number = Number(value || 0);
  if (number <= 0) return "good";
  if (number <= 1) return "low";
  if (number <= 2) return "medium";
  return "high";
}

function ImpactMetricDock({ impact, compact = false }) {
  const pressureDelta = Number(impact?.pressureDelta || 0);
  const complexityDelta = Number(impact?.complexityDelta || 0);
  const hpDelta = Number(impact?.hpDelta || 0);
  const acDelta = Number(impact?.acDelta || 0);
  const dprDelta = Number(impact?.dprDelta || 0);
  const warningDelta =
    Number(impact?.warningsAdded || 0) - Number(impact?.warningsCleared || 0);
  const counterplayTone = getCounterplayTone(impact?.counterplay);
  const CounterplayIcon = counterplayTone === "positive" ? ShieldCheck : ShieldAlert;
  const metrics = [
    {
      id: "pressure",
      icon: PressureMetricIcon,
      value: pressureDelta,
      title: "Pressure",
      description: `Changes the build's Pressure by ${signedDelta(pressureDelta)}. Pressure measures the tactical load placed on the players.`,
      visible: true,
    },
    {
      id: "complexity",
      icon: ComplexityMetricIcon,
      value: complexityDelta,
      title: "Complexity",
      description: `Changes the build's Complexity by ${signedDelta(complexityDelta)}. Complexity measures the operational load placed on the DM.`,
      visible: true,
    },
    {
      id: "dpr",
      icon: Swords,
      value: dprDelta,
      title: "DPR",
      description: `Changes the monster's projected damage per round by ${signedDelta(dprDelta)}.`,
      visible: hasDelta(dprDelta),
    },
    {
      id: "hp",
      icon: HeartPulse,
      value: hpDelta,
      title: "HP",
      description: `Changes the monster's projected hit points by ${signedDelta(hpDelta)}.`,
      visible: hasDelta(hpDelta),
    },
    {
      id: "ac",
      icon: Shield,
      value: acDelta,
      title: "AC",
      description: `Changes the monster's projected Armor Class by ${signedDelta(acDelta)}.`,
      visible: hasDelta(acDelta),
    },
    {
      id: "warnings",
      icon: TriangleAlert,
      value: warningDelta,
      title: "Warnings",
      description: `Changes the number of build warnings by ${signedDelta(warningDelta)}.`,
      visible: hasDelta(warningDelta),
    },
  ].filter((metric) => metric.visible);

  return (
    <div
      className={`monster-graft-selector-impact ${compact ? "is-compact" : ""}`}
      aria-label="Component impact"
    >
      {metrics.map((metric) => {
        const MetricIcon = metric.icon;
        return (
          <button
            key={metric.id}
            className={`tooltip-btn monster-graft-selector-impact__metric monster-graft-selector-impact__metric--${metric.id} is-${getDeltaTone(metric.value)}`}
            type="button"
            aria-label={`${metric.title} explanation`}
            data-key="tooltip-generic"
            data-tooltip={metric.title}
            data-tooltip-description={metric.description}
          >
            <span className="monster-graft-selector-impact__icon" aria-hidden="true">
              <MetricIcon />
            </span>
            <strong>{signedDelta(metric.value)}</strong>
          </button>
        );
      })}
      {counterplayTone && (
        <button
          className={`tooltip-btn monster-graft-selector-impact__metric monster-graft-selector-impact__metric--counterplay is-${counterplayTone}`}
          type="button"
          aria-label="Counterplay explanation"
          data-key="tooltip-generic"
          data-tooltip="Counterplay"
          data-tooltip-description={`Counterplay ${String(impact.counterplay || "").toLowerCase()} with this graft installed.`}
        >
          <span className="monster-graft-selector-impact__icon" aria-hidden="true">
            <CounterplayIcon />
          </span>
        </button>
      )}
    </div>
  );
}

function ComponentMetaRow({ label, children }) {
  return (
    <div className="meta-row cruor-composer-meta-row">
      <span className="meta-label cruor-composer-meta-label">{label}</span>
      <span className="meta-values cruor-composer-meta-values">{children}</span>
    </div>
  );
}

function FeatureCandidateCard({ item, inspected, onInspect, onDragStart, onDragEnd, computed, showImpact = false, reducedMotion = false }) {
  const { feature, selected, slotFull, compatibility, decisionProfile, impact } = item;
  const slot = SLOTS.find((entry) => entry.id === feature.slot) || SLOTS[0];
  const SlotIcon = slot.icon;
  const hasCompatibilityBadge = compatibility?.kind && compatibility.kind !== "compatible";
  const hasDecisionWarning = decisionProfile?.tier === "risky" || decisionProfile?.tier === "warning";

  return (
    <motion.article
      layout={!reducedMotion}
      transition={reducedMotion ? { duration: 0 } : { layout: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      draggable={!selected && !slotFull}
      onDragStart={(event) => {
        if (selected || slotFull) {
          event.preventDefault();
          return;
        }
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      className={`cruor-composer-slot-card monster-graft-selector-candidate ${
        selected ? "is-filled in-build" : "is-empty"
      } ${slotFull ? "slot-full" : ""} ${
        inspected ? "is-active" : ""
      } ${hasCompatibilityBadge ? `compatibility-${compatibility.kind}` : ""}`}
      data-decision-tier={decisionProfile?.tier || "standard"}
    >
      <button
        className="monster-graft-selector-candidate__select"
        type="button"
        aria-pressed={inspected}
        aria-label={`Inspect ${feature.title}`}
        onClick={onInspect}
      >
        <span className="monster-graft-selector-candidate__icon-stack">
          <span className="monster-graft-selector-candidate__icon" aria-hidden="true">
            <SlotIcon />
          </span>
          {!hasCompatibilityBadge && hasDecisionWarning && (
            <span
              className="monster-graft-selector-candidate__status-icon monster-graft-selector-candidate__build-warning is-warning"
              tabIndex={0}
              role="img"
              aria-label="Build warning"
              data-key="tooltip-generic"
              data-tooltip="Build warning"
              data-tooltip-description={decisionProfile?.riskLabel || decisionProfile?.badges?.join(". ") || "This graft may need review in the current frame."}
            >
              <TriangleAlert aria-hidden="true" />
            </span>
          )}
        </span>

        <span className="monster-graft-selector-candidate__copy">
          <span className="monster-graft-selector-candidate__title-row">
            <strong>{feature.title}</strong>
            <span className="monster-graft-selector-candidate__title-status">
              {hasCompatibilityBadge && (
                <span
                  className={`monster-graft-selector-candidate__status-icon is-${compatibility.kind}`}
                  tabIndex={0}
                  role="img"
                  aria-label={compatibility.label}
                  data-key="tooltip-generic"
                  data-tooltip={compatibility.label}
                  data-tooltip-description={compatibility.detail || compatibility.description || `Compatibility status: ${compatibility.label}.`}
                >
                  <TriangleAlert aria-hidden="true" />
                </span>
              )}
              {slotFull && (
                <span
                  className="monster-graft-selector-candidate__status-icon is-danger"
                  tabIndex={0}
                  role="img"
                  aria-label={`${slot.label} slot full`}
                  data-key="tooltip-generic"
                  data-tooltip="Slot full"
                  data-tooltip-description={`The ${slot.label} slot has reached its current capacity.`}
                >
                  <X aria-hidden="true" />
                </span>
              )}
              {selected && (
                <span className="monster-graft-selector-candidate__installed">
                  <Check aria-hidden="true" /> Installed
                </span>
              )}
            </span>
          </span>
          <span className="monster-graft-selector-candidate__summary">
            {normalizeMonsterReferences(feature.summary, computed)}
          </span>
        </span>
      </button>

      <div className="monster-graft-selector-candidate__meta-row">
        <CandidateMechanicalSignature feature={feature} />
        {showImpact ? <ImpactMetricDock impact={impact} compact /> : null}
      </div>
    </motion.article>
  );
}

function FeatureDetailPanel({
  item,
  computed,
  selectedFeatures = [],
  typeId,
  category,
  roleId,
  dangerId,
  sourceId,
  advancedMode,
  slotCaps,
  getSlotCap,
  onAdd,
}) {
  const statBlockPreviewGroups = useMemo(
    () =>
      buildStatBlockPreviewGroups({
        feature: item?.feature,
        computed,
        selectedFeatures,
        typeId,
        category,
        roleId,
        dangerId,
        sourceId,
        advancedMode,
        slotCaps,
        getSlotCap,
      }),
    [
      advancedMode,
      category,
      computed,
      dangerId,
      getSlotCap,
      item?.feature,
      roleId,
      selectedFeatures,
      slotCaps,
      sourceId,
      typeId,
    ],
  );

  if (!item) {
    return (
      <div className="monster-graft-selector-detail__empty">
        <strong>No graft selected</strong>
        <span>Select a graft from the list to inspect its complete profile.</span>
      </div>
    );
  }

  const {
    feature,
    selected,
    slotFull,
    compatibility,
    decisionProfile,
    impact,
  } = item;
  const slot = SLOTS.find((entry) => entry.id === feature.slot) || SLOTS[0];
  const SlotIcon = slot.icon;
  const source = SOURCES.find((entry) => entry.id === feature.source);
  const sourceLabel = source?.label || titleCase(feature.source) || "Unknown Inspiration";
  const packTitle = getContentPackTitle(feature);
  const sourcePackTitle = getSourcePackTitle(source);
  const rules = getFeatureCompatibility(feature);
  const mechanicProfile = getFeatureMechanicProfile(feature);
  const sectionLabel = getSectionLabel(getFeatureSection(feature));
  const usageLabel = formatUsageProfile(mechanicProfile.usageProfile);
  const damageLabel = formatDamageProfile(mechanicProfile.damageProfile);
  const conditionLabel = formatConditionProfile(mechanicProfile.conditionProfile);
  const rulesProfileRows = [
    { label: "Rules section", value: sectionLabel },
    { label: "Action economy", value: titleCase(mechanicProfile.abilityType || "") },
    { label: "Usage", value: usageLabel },
    { label: "Damage profile", value: damageLabel },
    { label: "Conditions", value: conditionLabel },
  ].filter((row) => row.value);
  const currentPressure = Number(computed?.pressure || 0);
  const currentComplexity = Number(computed?.complexity || 0);
  const currentHp = Number(computed?.hp || 0);
  const currentAc = Number(computed?.ac || 0);
  const currentDpr = Number(computed?.dpr || 0);
  const currentWarnings = Array.isArray(computed?.warnings) ? computed.warnings.length : 0;
  const pressureDelta = Number(impact?.pressureDelta || 0);
  const complexityDelta = Number(impact?.complexityDelta || 0);
  const hpDelta = Number(impact?.hpDelta || 0);
  const acDelta = Number(impact?.acDelta || 0);
  const dprDelta = Number(impact?.dprDelta || 0);
  const warningDelta = Number(impact?.warningsAdded || 0) - Number(impact?.warningsCleared || 0);
  const projectedPressure = currentPressure + pressureDelta;
  const projectedComplexity = currentComplexity + complexityDelta;
  const projectedHp = currentHp + hpDelta;
  const projectedAc = currentAc + acDelta;
  const projectedDpr = currentDpr + dprDelta;
  const projectedWarnings = Math.max(0, currentWarnings + warningDelta);
  const anatomyConstraintSummary = getFeatureAnatomyConstraintSummary(feature);
  const anatomyGrantSummary = getFeatureAnatomyGrantSummary(feature);
  const counterplayText = getReadableText(feature.counterplay);
  const hasCompatibilityWarning = compatibility?.kind && compatibility.kind !== "compatible";
  const frameFit = decisionProfile?.frameFit;
  const actionBlocked = selected || slotFull;
  const counterplayResult =
    impact?.counterplay === "Improves" || impact?.counterplay === "Worsens"
      ? impact.counterplay
      : "";
  const pressureLimit = Number(computed?.pressureLimit);
  const complexityLimit = Number(computed?.complexityCap);
  const pressureExcess = Number.isFinite(pressureLimit)
    ? Math.max(0, projectedPressure - pressureLimit)
    : 0;
  const complexityExcess = Number.isFinite(complexityLimit)
    ? Math.max(0, projectedComplexity - complexityLimit)
    : 0;
  const projectedImpactCards = [
    {
      id: "pressure",
      icon: PressureMetricIcon,
      label: "Pressure",
      result: signedDelta(pressureDelta),
      current: currentPressure,
      projected: projectedPressure,
      tone: "pressure",
      warning: pressureExcess > 0
        ? {
            title: "Pressure limit exceeded",
            description: `Adding ${feature.title} would raise Pressure to ${projectedPressure}, exceeding the recommended limit of ${pressureLimit} by ${pressureExcess}. This is advisory and does not block the build.`,
          }
        : null,
    },
    {
      id: "complexity",
      icon: ComplexityMetricIcon,
      label: "Complexity",
      result: signedDelta(complexityDelta),
      current: currentComplexity,
      projected: projectedComplexity,
      tone: "complexity",
      warning: complexityExcess > 0
        ? {
            title: "Complexity limit exceeded",
            description: `Adding ${feature.title} would raise Complexity to ${projectedComplexity}, exceeding the recommended limit of ${complexityLimit} by ${complexityExcess}. This is advisory and does not block the build.`,
          }
        : null,
    },
    ...(hasDelta(hpDelta)
      ? [{
          id: "hp",
          icon: HeartPulse,
          label: "HP",
          result: signedDelta(hpDelta),
          current: currentHp,
          projected: projectedHp,
          tone: "hp",
        }]
      : []),
    ...(hasDelta(acDelta)
      ? [{
          id: "ac",
          icon: Shield,
          label: "AC",
          result: signedDelta(acDelta),
          current: currentAc,
          projected: projectedAc,
          tone: "ac",
        }]
      : []),
    ...(hasDelta(dprDelta)
      ? [{
          id: "dpr",
          icon: Swords,
          label: "DPR",
          result: signedDelta(dprDelta),
          current: currentDpr,
          projected: projectedDpr,
          tone: "dpr",
        }]
      : []),
    ...(warningDelta !== 0
      ? [{
          id: "warnings",
          icon: TriangleAlert,
          label: "Warnings",
          result: signedDelta(warningDelta),
          current: currentWarnings,
          projected: projectedWarnings,
          tone: "warnings",
        }]
      : []),
  ];

  return (
    <div className="monster-graft-selector-detail__content">
      <header className="monster-graft-selector-detail__hero">
        <span className="monster-graft-selector-detail__icon" aria-hidden="true">
          <SlotIcon />
        </span>
        <div className="monster-graft-selector-detail__hero-copy">
          <h3>{feature.title}</h3>
          <p>{normalizeMonsterReferences(feature.summary, computed)}</p>
          {(decisionProfile?.badges?.length > 0 || hasCompatibilityWarning) && (
            <div className="monster-graft-selector-detail__badges" aria-label="Graft assessment">
              {decisionProfile.badges.map((badge) => (
                <span key={badge} className="meta-value cruor-composer-meta-chip monster-graft-selector-chip">
                  {badge}
                </span>
              ))}
              {hasCompatibilityWarning && (
                <span
                  className={`compatibility-badge cruor-composer-compatibility-badge monster-graft-selector-chip ${compatibility.kind}`}
                >
                  {compatibility.label}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="monster-graft-selector-detail__scroll cruor-scroll-surface">
        {statBlockPreviewGroups.length > 0 && (
          <DetailSection
            key="table-effect"
            title="Table Effect"
            className="monster-graft-selector-detail__table-effect"
          >
            <StatBlockEffectPreview groups={statBlockPreviewGroups} />
          </DetailSection>
        )}

        {rulesProfileRows.length > 0 && (
          <DetailSection
            key="rules-profile"
            title="Rules Profile"
            className="monster-graft-selector-detail__rules-profile"
          >
            <div className="monster-graft-selector-detail__rules-grid">
              {rulesProfileRows.map((row) => (
                <DetailFactRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          </DetailSection>
        )}

        <DetailSection
          key="projected-impact"
          title="Projected Impact"
          className="monster-graft-selector-detail__projected"
        >
          <div className="monster-graft-selector-detail__impact-grid">
            {projectedImpactCards.map((card) => (
              <MetricChangeCard key={card.id} {...card} />
            ))}
          </div>
        </DetailSection>

        {counterplayText && (
          <DetailSection
            key="counterplay"
            title="Counterplay"
            className="monster-graft-selector-detail__prose"
          >
            <p>
              {counterplayResult ? (
                <>
                  <span className="monster-graft-selector-detail__counterplay-result">
                    {counterplayResult}.
                  </span>{" "}
                </>
              ) : null}
              {normalizeMonsterReferences(counterplayText, computed)}
            </p>
          </DetailSection>
        )}

        <DetailSection key="build-fit" title="Build Fit" defaultExpanded={false}>
          <div className="monster-graft-selector-detail__rules-grid">
            <DetailFactRow
              label={compatibility?.label || "Compatibility"}
              value={compatibility?.message || "All requirements satisfied."}
              className={`is-${compatibility?.kind || "compatible"}`}
              emphasized={false}
            />
            {frameFit && frameFit.kind !== "neutral" && (
              <DetailFactRow
                label={frameFit.label}
                value={frameFit.message}
                className={`is-${frameFit.kind}`}
                emphasized={false}
              />
            )}
            <DetailFactRow
              label="Best for"
              value={decisionProfile?.bestFor}
              emphasized={false}
            />
            <DetailFactRow
              label="Run risk"
              value={decisionProfile?.riskLabel}
              emphasized={false}
            />
          </div>
        </DetailSection>

        <DetailSection key="source" title="Source" defaultExpanded={false}>
          <div className="monster-graft-selector-detail__rules-grid monster-graft-selector-detail__rules-grid--single">
            <DetailFactRow label="Inspiration" value={sourceLabel} emphasized={false} />
            <DetailFactRow label="Content pack" value={packTitle} emphasized={false} />
            {sourcePackTitle !== packTitle && (
              <DetailFactRow label="Source pack" value={sourcePackTitle} emphasized={false} />
            )}
          </div>
        </DetailSection>

        {(mechanicProfile.mechanicTags.length > 0 ||
          rules.grants.length > 0 ||
          rules.requires.length > 0 ||
          rules.softRequires.length > 0 ||
          rules.incompatibleWith.length > 0 ||
          anatomyGrantSummary.length > 0 ||
          anatomyConstraintSummary.length > 0) && (
          <DetailSection key="rules-metadata" title="Rules Metadata" defaultExpanded={false}>
            <div className="monster-graft-selector-detail__meta-list cruor-composer-meta-list">
              {mechanicProfile.mechanicTags.length > 0 && (
                <ComponentMetaRow label="Tags">
                  {mechanicProfile.mechanicTags.slice(0, 8).map((tag) => (
                    <span key={tag} className="meta-value cruor-composer-meta-chip monster-graft-selector-chip">
                      {formatToken(tag)}
                    </span>
                  ))}
                </ComponentMetaRow>
              )}

              {rules.grants.length > 0 && (
                <ComponentMetaRow label="Grants">
                  {rules.grants.map((token) => (
                    <span key={token} className="meta-value cruor-composer-meta-chip monster-graft-selector-chip strong-chip">
                      {formatToken(token)}
                    </span>
                  ))}
                </ComponentMetaRow>
              )}

              {(rules.requires.length > 0 ||
                rules.softRequires.length > 0 ||
                rules.incompatibleWith.length > 0) && (
                <ComponentMetaRow label="Locks">
                  {rules.requires.map((token) => (
                    <span
                      key={`requires-${token}`}
                      className="meta-value cruor-composer-meta-chip monster-graft-selector-chip strong-chip"
                    >
                      Requires {formatToken(token)}
                    </span>
                  ))}
                  {rules.softRequires.map((token) => (
                    <span key={`soft-${token}`} className="meta-value cruor-composer-meta-chip monster-graft-selector-chip">
                      Wants {formatToken(token)}
                    </span>
                  ))}
                  {rules.incompatibleWith.map((token) => (
                    <span
                      key={`blocks-${token}`}
                      className="meta-value cruor-composer-meta-chip monster-graft-selector-chip danger-chip"
                    >
                      Blocks {formatToken(token)}
                    </span>
                  ))}
                </ComponentMetaRow>
              )}

              {anatomyGrantSummary.length > 0 && (
                <ComponentMetaRow label="Grants anatomy">
                  {anatomyGrantSummary.slice(0, 8).map((row) => (
                    <span
                      key={`${row.label}-${row.values.join("-")}`}
                      className="meta-value cruor-composer-meta-chip monster-graft-selector-chip strong-chip"
                    >
                      {row.label}: {row.values.join(", ")}
                    </span>
                  ))}
                </ComponentMetaRow>
              )}

              {anatomyConstraintSummary.length > 0 && (
                <ComponentMetaRow label="Requires anatomy">
                  {anatomyConstraintSummary.slice(0, 8).map((row) => (
                    <span
                      key={`${row.label}-${row.values.join("-")}`}
                      className="meta-value cruor-composer-meta-chip monster-graft-selector-chip strong-chip"
                    >
                      {row.label}: {row.values.join(", ")}
                    </span>
                  ))}
                </ComponentMetaRow>
              )}
            </div>
          </DetailSection>
        )}
      </div>

      <button
        className={`tooltip-btn monster-graft-selector-detail__install ${actionBlocked ? "is-disabled" : ""}`}
        type="button"
        aria-label={`Add ${feature.title}`}
        aria-disabled={actionBlocked}
        data-key="tooltip-generic"
        data-tooltip={`Add ${feature.title}`}
        data-tooltip-description={
          selected
            ? `${feature.title} is already installed.`
            : slotFull
              ? `The ${slot.label} slot is full.`
              : `Add ${feature.title} to the current monster.`
        }
        onClick={() => {
          if (!actionBlocked) onAdd?.();
        }}
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}

function ComponentNavigatorPanel({
  surface = "modal",
  mode,
  activeSlot,
  navigatorSlotFilter,
  setNavigatorSlotFilter,
  setNavigatorPackFilter,
  setNavigatorSourceFilters,
  contentPackOptions = [],
  onClose,
  visibleFeatures,
  selected,
  selectedFeatures,
  typeId,
  category,
  activePreset = null,
  roleId,
  tempoProfileId,
  dangerId,
  targetCr,
  computed,
  sourceId,
  navigatorSearch,
  setNavigatorSearch,
  navigatorFiltersOpen,
  setNavigatorFiltersOpen,
  advancedMode,
  slotCaps,
  addFeature,
  setDraggedFeatureId,
  getSlotCap,
  buildSmartSlotPicks,
  buildFeatureDecisionProfile,
  buildFeatureImpactPreview,
}) {
  const reducedMotion = useCruorReducedMotion();
  const [sourceFilterStates, setSourceFilterStates] = useState({});
  const [packFilterStates, setPackFilterStates] = useState({});
  const [slotFilterStates, setSlotFilterStates] = useState({});
  const [bestPickFilterStates, setBestPickFilterStates] = useState({});
  const [attackTypeFilterStates, setAttackTypeFilterStates] = useState({});
  const [actionEconomyFilterStates, setActionEconomyFilterStates] = useState({});
  const [impactFilterStates, setImpactFilterStates] = useState({});
  const [inspectedFeatureId, setInspectedFeatureId] = useState("");
  const defaultFiltersAppliedRef = useRef(false);

  useEffect(() => {
    if (defaultFiltersAppliedRef.current) return;
    defaultFiltersAppliedRef.current = true;

    setNavigatorFiltersOpen?.(false);
    setNavigatorSearch?.("");
    setNavigatorPackFilter?.("all");
    setNavigatorSourceFilters?.(SOURCES.map((source) => source.id).filter(Boolean));
    setSourceFilterStates({});
    setPackFilterStates({});
    setSlotFilterStates({});
    setBestPickFilterStates({});
    setAttackTypeFilterStates({});
    setActionEconomyFilterStates({});
    setImpactFilterStates({});
    if (mode === "global") setNavigatorSlotFilter?.("all");
  }, [
    mode,
    setNavigatorFiltersOpen,
    setNavigatorPackFilter,
    setNavigatorSearch,
    setNavigatorSlotFilter,
    setNavigatorSourceFilters,
  ]);
  const slotData = SLOTS.find((slot) => slot.id === activeSlot) || SLOTS[0];
  const filteredSlotData = SLOTS.find((slot) => slot.id === navigatorSlotFilter);
  const modalTitle =
    mode === "global"
      ? navigatorSlotFilter === "all"
        ? "Global Component Navigator"
        : `${filteredSlotData?.label || "Filtered"} Components`
      : `Choose ${slotData.label} Graft`;
  const includedSlotIds = Object.entries(slotFilterStates)
    .filter(([, state]) => state === FILTER_STATE_INCLUDE)
    .map(([id]) => id);
  const smartPickSlotId =
    mode === "global"
      ? includedSlotIds.length === 1
        ? includedSlotIds[0]
        : "all"
      : activeSlot;
  const smartPicks = buildSmartSlotPicks({
    slotId: smartPickSlotId,
    candidates: visibleFeatures,
    selected,
    selectedFeatures,
    typeId,
    category,
    activePreset,
    roleId,
    tacticalRoleId: computed?.tacticalRole?.id,
    monsterTierId: computed?.monsterTier?.id,
    tempoProfileId: tempoProfileId || computed?.tempoProfile?.id,
    dangerId,
    targetCr: targetCr || computed?.targetCr,
  });
  const packOptions = contentPackOptions.filter((pack) => pack.id !== "all");
  const sourceFilterOptions = SOURCES;
  const slotFilterOptions = SLOTS.map((slot) => ({
    id: slot.id,
    label: slot.label,
    matches: (item) => item.feature.slot === slot.id,
  }));
  const sourceTriStateOptions = sourceFilterOptions.map((source) => ({
    id: source.id,
    label: source.label,
    matches: (item) => item.feature.source === source.id,
  }));
  const packTriStateOptions = packOptions.map((pack) => ({
    id: pack.id,
    label: pack.title,
    matches: (item) => getContentPackId(item.feature) === pack.id,
  }));
  const bestPickTriStateOptions = smartPicks.map((pick) => ({
    id: pick.id,
    label: pick.label,
    matches: (item) => item.feature.id === pick.feature.id,
  }));
  const hasActiveNavigatorFilters = Boolean(
    navigatorSearch.trim() ||
      hasTriStateFilters(sourceFilterStates) ||
      hasTriStateFilters(packFilterStates) ||
      hasTriStateFilters(slotFilterStates) ||
      hasTriStateFilters(bestPickFilterStates) ||
      hasTriStateFilters(attackTypeFilterStates) ||
      hasTriStateFilters(actionEconomyFilterStates) ||
      hasTriStateFilters(impactFilterStates)
  );

  const featureRows = useMemo(
    () =>
      visibleFeatures.map((feature) => {
        const featureSlotIds = getSelectedIdsForSlot(selected, feature.slot);
        const featureSlotCap = advancedMode
          ? getSlotCap?.(slotCaps, feature.slot) || 1
          : 1;
        const selectedInSlot = featureSlotIds.includes(feature.id);
        const slotFull =
          featureSlotCap > 1 &&
          featureSlotIds.length >= featureSlotCap &&
          !selectedInSlot;
        const compatibility = getCompatibilityStatus(
          feature,
          selectedFeatures,
          typeId,
          category,
          { activePreset },
        );
        const decisionProfile = buildFeatureDecisionProfile(feature, {
          status: compatibility,
          selected,
          selectedFeatures,
          typeId,
          category,
          activePreset,
          roleId,
          tacticalRoleId: computed?.tacticalRole?.id,
          monsterTierId: computed?.monsterTier?.id,
          tempoProfileId: tempoProfileId || computed?.tempoProfile?.id,
          dangerId,
          targetCr: targetCr || computed?.targetCr,
          currentSlot: smartPickSlotId,
          selectedInSlot,
        });
        const impact = buildFeatureImpactPreview({
          feature,
          selected: selected || {},
          selectedFeatures: selectedFeatures || [],
          typeId,
          category,
          activePreset,
          computed,
        });
        const mechanicProfile = getFeatureMechanicProfile(feature);

        return {
          feature,
          selected: selectedInSlot,
          slotFull,
          compatibility,
          decisionProfile,
          impact,
          mechanicProfile,
        };
      }),
    [
      activePreset,
      activeSlot,
      advancedMode,
      buildFeatureDecisionProfile,
      buildFeatureImpactPreview,
      category,
      computed,
      dangerId,
      visibleFeatures,
      getSlotCap,
      mode,
      smartPickSlotId,
      roleId,
      selected,
      selectedFeatures,
      slotCaps,
      targetCr,
      tempoProfileId,
      typeId,
    ],
  );

  const isAttackContext = smartPickSlotId === "attack";
  const attackTypeFilterOptions = useMemo(() => {
    if (!isAttackContext) return [];
    const options = [
      {
        id: "melee",
        label: "Melee",
        matches: (item) => /melee/i.test(String(item.feature.rules?.resolution?.attackType || "")),
      },
      {
        id: "ranged",
        label: "Ranged",
        matches: (item) => /ranged/i.test(String(item.feature.rules?.resolution?.attackType || "")),
      },
      {
        id: "area",
        label: "Area",
        matches: (item) =>
          item.feature.rules?.targeting?.type === "area" ||
          item.mechanicProfile?.mechanicTags?.includes("area_effect"),
      },
      {
        id: "saving-throw",
        label: "Saving Throw",
        matches: (item) => item.mechanicProfile?.mechanicTags?.includes("saving_throw"),
      },
      {
        id: "multiattack",
        label: "Multiattack",
        matches: (item) => item.mechanicProfile?.mechanicTags?.includes("multiattack"),
      },
    ];
    return options.filter((option) => featureRows.some(option.matches));
  }, [featureRows, isAttackContext]);

  const actionEconomyFilterOptions = useMemo(() => {
    if (!isAttackContext) return [];
    const values = new Map();
    featureRows.forEach((item) => {
      const value = String(item.mechanicProfile?.abilityType || "").trim();
      if (value) values.set(value, titleCase(value));
    });
    return [...values.entries()].map(([id, label]) => ({
      id,
      label,
      matches: (item) => String(item.mechanicProfile?.abilityType || "") === id,
    }));
  }, [featureRows, isAttackContext]);

  const projectedImpactFilterOptions = useMemo(() => {
    if (!isAttackContext) return [];
    const options = [
      { id: "pressure-up", label: "Raises Pressure", direction: "up", icon: PressureMetricIcon, matches: (item) => Number(item.impact?.pressureDelta || 0) > 0 },
      { id: "pressure-down", label: "Lowers Pressure", direction: "down", icon: PressureMetricIcon, matches: (item) => Number(item.impact?.pressureDelta || 0) < 0 },
      { id: "complexity-up", label: "Raises Complexity", direction: "up", icon: ComplexityMetricIcon, matches: (item) => Number(item.impact?.complexityDelta || 0) > 0 },
      { id: "complexity-down", label: "Lowers Complexity", direction: "down", icon: ComplexityMetricIcon, matches: (item) => Number(item.impact?.complexityDelta || 0) < 0 },
      { id: "dpr-up", label: "Raises DPR", direction: "up", icon: Swords, matches: (item) => Number(item.impact?.dprDelta || 0) > 0 },
      { id: "dpr-down", label: "Lowers DPR", direction: "down", icon: Swords, matches: (item) => Number(item.impact?.dprDelta || 0) < 0 },
      { id: "hp-up", label: "Raises HP", direction: "up", icon: HeartPulse, matches: (item) => Number(item.impact?.hpDelta || 0) > 0 },
      { id: "hp-down", label: "Lowers HP", direction: "down", icon: HeartPulse, matches: (item) => Number(item.impact?.hpDelta || 0) < 0 },
      { id: "ac-up", label: "Raises AC", direction: "up", icon: Shield, matches: (item) => Number(item.impact?.acDelta || 0) > 0 },
      { id: "ac-down", label: "Lowers AC", direction: "down", icon: Shield, matches: (item) => Number(item.impact?.acDelta || 0) < 0 },
      { id: "counterplay-improves", label: "Improves Counterplay", direction: "up", icon: ShieldCheck, matches: (item) => item.impact?.counterplay === "Improves" },
      { id: "counterplay-worsens", label: "Worsens Counterplay", direction: "down", icon: ShieldAlert, matches: (item) => item.impact?.counterplay === "Worsens" },
      { id: "warnings-up", label: "Adds Warning", direction: "up", icon: TriangleAlert, matches: (item) => Number(item.impact?.warningsAdded || 0) > Number(item.impact?.warningsCleared || 0) },
      { id: "warnings-down", label: "Clears Warning", direction: "down", icon: TriangleAlert, matches: (item) => Number(item.impact?.warningsCleared || 0) > Number(item.impact?.warningsAdded || 0) },
    ];
    return options.filter((option) => featureRows.some(option.matches));
  }, [featureRows, isAttackContext]);

  const filteredFeatureRows = useMemo(
    () =>
      featureRows.filter(
        (item) =>
          matchesTriStateGroup(item, sourceTriStateOptions, sourceFilterStates) &&
          matchesTriStateGroup(item, packTriStateOptions, packFilterStates) &&
          (mode !== "global" ||
            matchesTriStateGroup(item, slotFilterOptions, slotFilterStates)) &&
          matchesTriStateGroup(item, bestPickTriStateOptions, bestPickFilterStates) &&
          matchesTriStateGroup(item, attackTypeFilterOptions, attackTypeFilterStates) &&
          matchesTriStateGroup(item, actionEconomyFilterOptions, actionEconomyFilterStates) &&
          matchesTriStateGroup(item, projectedImpactFilterOptions, impactFilterStates),
      ),
    [
      actionEconomyFilterOptions,
      actionEconomyFilterStates,
      attackTypeFilterOptions,
      attackTypeFilterStates,
      bestPickFilterStates,
      bestPickTriStateOptions,
      featureRows,
      impactFilterStates,
      mode,
      packFilterStates,
      packTriStateOptions,
      projectedImpactFilterOptions,
      slotFilterOptions,
      slotFilterStates,
      sourceFilterStates,
      sourceTriStateOptions,
    ],
  );

  useEffect(() => {
    if (filteredFeatureRows.some((item) => item.feature.id === inspectedFeatureId)) return;
    const nextItem =
      filteredFeatureRows.find((item) => item.selected) || filteredFeatureRows[0] || null;
    setInspectedFeatureId(nextItem?.feature.id || "");
  }, [filteredFeatureRows, inspectedFeatureId]);

  const inspectedItem =
    filteredFeatureRows.find((item) => item.feature.id === inspectedFeatureId) || null;

  function toggleFilters() {
    setNavigatorFiltersOpen((current) => !current);
  }

  function includeAllSourceFilters() {
    setSourceFilterStates(
      Object.fromEntries(
        sourceFilterOptions.map((item) => [item.id, FILTER_STATE_INCLUDE]),
      ),
    );
  }

  function clearSourceFilters() {
    setSourceFilterStates({});
  }

  function clearFilters() {
    setNavigatorSearch("");
    setNavigatorSlotFilter?.(mode === "global" ? "all" : activeSlot);
    setNavigatorPackFilter?.("all");
    setNavigatorSourceFilters?.(SOURCES.map((source) => source.id).filter(Boolean));
    setSourceFilterStates({});
    setPackFilterStates({});
    setSlotFilterStates({});
    setBestPickFilterStates({});
    setAttackTypeFilterStates({});
    setActionEconomyFilterStates({});
    setImpactFilterStates({});
  }

  return (
    <div
      className={`component-navigator-modal component-navigator-modal--${surface} monster-graft-selector`}
      data-navigator-mode={mode}
      data-filters-open={navigatorFiltersOpen ? "true" : "false"}
      data-has-smart-picks={smartPicks.length > 0 ? "true" : "false"}
      role={surface === "modal" ? "dialog" : "region"}
      aria-modal={surface === "modal" ? "true" : undefined}
      aria-label={modalTitle}
    >
      {surface === "modal" && (
        <motion.button
          className="monster-graft-selector__scrim"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          type="button"
          aria-label="Close Component Navigator"
          onClick={onClose}
        />
      )}

      <motion.aside
        className="component-navigator-modal__panel monster-graft-selector__panel"
        initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.992 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Component Navigator"
      >
        <div className="monster-graft-selector__header">
          <div className="monster-graft-selector__header-copy">
            <h2>{modalTitle}</h2>
            <span>{filteredFeatureRows.length} visible graft{filteredFeatureRows.length === 1 ? "" : "s"}</span>
          </div>
          <div className="monster-graft-selector__header-actions cruor-composer-navigator-head-actions">
            <button
              className={`cruor-composer-icon-button cruor-composer-icon-button--filter ${
                navigatorFiltersOpen ? "active" : ""
              }`}
              type="button"
              aria-label="Toggle graft filters"
              aria-expanded={navigatorFiltersOpen}
              data-active-count={hasActiveNavigatorFilters ? 1 : 0}
              onClick={toggleFilters}
            >
              <SlidersHorizontal aria-hidden="true" />
            </button>
            <button
              className="cruor-composer-icon-button"
              type="button"
              aria-label="Close Component Navigator"
              onClick={onClose}
            >
              <X aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="monster-graft-selector__workspace">
          <section
            className="monster-graft-selector__filters cruor-scroll-surface"
            aria-label="Graft filters"
          >
            <div className="monster-graft-selector__filter-toolbar">
              <div className="monster-graft-selector__search-field">
                <input
                  type="search"
                  className="cruor-composer-navigator-search-input"
                  value={navigatorSearch}
                  placeholder="Search grafts…"
                  aria-label="Search grafts"
                  onChange={(event) => setNavigatorSearch(event.target.value)}
                />
              </div>
              <div className="monster-graft-selector__filter-toolbar-actions">
                <button
                  className="tooltip-btn cruor-composer-icon-button monster-graft-selector__filter-bulk-action"
                  type="button"
                  aria-label="Include all inspirations"
                  data-key="tooltip-generic"
                  data-tooltip="All"
                  data-tooltip-description="Mark every Inspiration as included."
                  onClick={includeAllSourceFilters}
                >
                  <CheckCheck aria-hidden="true" />
                </button>
                <button
                  className="tooltip-btn cruor-composer-icon-button monster-graft-selector__filter-bulk-action"
                  type="button"
                  aria-label="Clear inspiration filters"
                  data-key="tooltip-generic"
                  data-tooltip="None"
                  data-tooltip-description="Return every Inspiration filter to its neutral state."
                  onClick={clearSourceFilters}
                >
                  <Eraser aria-hidden="true" />
                </button>
                {hasActiveNavigatorFilters && (
                  <button
                    className="tooltip-btn cruor-composer-icon-button monster-graft-selector__filter-bulk-action"
                    type="button"
                    aria-label="Reset all filters"
                    data-key="tooltip-generic"
                    data-tooltip="Reset Filters"
                    data-tooltip-description="Return every filter to its neutral state and clear the search."
                    onClick={clearFilters}
                  >
                    <RotateCcw aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="monster-graft-selector__filter-groups cruor-scroll-surface">
              {mode === "global" && (
                <ComposerCollapsibleSection
                  title="Slot"
                  defaultExpanded
                  className="monster-graft-selector__filter-section"
                >
                  <div className="monster-graft-selector__filter-options">
                    {slotFilterOptions.map((option) => (
                      <TriStateFilterRow
                        key={option.id}
                        label={option.label}
                        state={getFilterState(slotFilterStates, option.id)}
                        onCycle={() => updateTriStateFilter(setSlotFilterStates, option.id)}
                      />
                    ))}
                  </div>
                </ComposerCollapsibleSection>
              )}

              <ComposerCollapsibleSection
                title="Inspiration"
                defaultExpanded
                className="monster-graft-selector__filter-section"
              >
                <div className="monster-graft-selector__filter-options">
                  {sourceTriStateOptions.map((option) => (
                    <TriStateFilterRow
                      key={option.id}
                      label={option.label}
                      state={getFilterState(sourceFilterStates, option.id)}
                      onCycle={() => updateTriStateFilter(setSourceFilterStates, option.id)}
                    />
                  ))}
                </div>
              </ComposerCollapsibleSection>

              <ComposerCollapsibleSection
                title="Content Pack"
                defaultExpanded
                className="monster-graft-selector__filter-section"
              >
                <div className="monster-graft-selector__filter-options">
                  {packTriStateOptions.map((option) => (
                    <TriStateFilterRow
                      key={option.id}
                      label={option.label}
                      state={getFilterState(packFilterStates, option.id)}
                      onCycle={() => updateTriStateFilter(setPackFilterStates, option.id)}
                    />
                  ))}
                </div>
              </ComposerCollapsibleSection>

              {bestPickTriStateOptions.length > 0 && (
                <ComposerCollapsibleSection
                  title="Best Picks"
                  defaultExpanded
                  className="monster-graft-selector__filter-section"
                >
                  <div className="monster-graft-selector__filter-options">
                    {bestPickTriStateOptions.map((option) => (
                      <TriStateFilterRow
                        key={option.id}
                        label={option.label}
                        state={getFilterState(bestPickFilterStates, option.id)}
                        onCycle={() => updateTriStateFilter(setBestPickFilterStates, option.id)}
                      />
                    ))}
                  </div>
                </ComposerCollapsibleSection>
              )}

              {isAttackContext && attackTypeFilterOptions.length > 0 && (
                <ComposerCollapsibleSection
                  title="Attack Type"
                  defaultExpanded
                  className="monster-graft-selector__filter-section"
                >
                  <div className="monster-graft-selector__filter-options">
                    {attackTypeFilterOptions.map((option) => (
                      <TriStateFilterRow
                        key={option.id}
                        label={option.label}
                        state={getFilterState(attackTypeFilterStates, option.id)}
                        onCycle={() => updateTriStateFilter(setAttackTypeFilterStates, option.id)}
                      />
                    ))}
                  </div>
                </ComposerCollapsibleSection>
              )}

              {isAttackContext && actionEconomyFilterOptions.length > 0 && (
                <ComposerCollapsibleSection
                  title="Action Economy"
                  defaultExpanded={false}
                  className="monster-graft-selector__filter-section"
                >
                  <div className="monster-graft-selector__filter-options">
                    {actionEconomyFilterOptions.map((option) => (
                      <TriStateFilterRow
                        key={option.id}
                        label={option.label}
                        state={getFilterState(actionEconomyFilterStates, option.id)}
                        onCycle={() => updateTriStateFilter(setActionEconomyFilterStates, option.id)}
                      />
                    ))}
                  </div>
                </ComposerCollapsibleSection>
              )}

              {isAttackContext && projectedImpactFilterOptions.length > 0 && (
                <ComposerCollapsibleSection
                  title="Projected Impact"
                  defaultExpanded={false}
                  className="monster-graft-selector__filter-section"
                >
                  <div className="monster-graft-selector__filter-options">
                    {projectedImpactFilterOptions.map((option) => {
                      const DirectionIcon = option.direction === "down" ? ArrowDown : ArrowUp;
                      const MetricIcon = option.icon;
                      return (
                        <TriStateFilterRow
                          key={option.id}
                          label={option.label}
                          state={getFilterState(impactFilterStates, option.id)}
                          leading={
                            <>
                              <DirectionIcon className="monster-graft-selector__filter-direction-icon" />
                              <MetricIcon className="monster-graft-selector__filter-metric-icon" />
                            </>
                          }
                          onCycle={() => updateTriStateFilter(setImpactFilterStates, option.id)}
                        />
                      );
                    })}
                  </div>
                </ComposerCollapsibleSection>
              )}
            </div>
          </section>

          <section className="monster-graft-selector__results" aria-label="Available grafts">
            <div className="monster-graft-selector__list cruor-composer-component-list cruor-scroll-surface">
              {filteredFeatureRows.length === 0 ? (
                <EmptyState text="No compatible grafts match the current source, frame and filter combination." />
              ) : (
                filteredFeatureRows.map((item) => (
                  <FeatureCandidateCard
                    key={item.feature.id}
                    item={item}
                    inspected={item.feature.id === inspectedFeatureId}
                    computed={computed}
                    showImpact={navigatorFiltersOpen}
                    reducedMotion={reducedMotion}
                    onInspect={() => setInspectedFeatureId(item.feature.id)}
                    onDragStart={() => setDraggedFeatureId(item.feature.id)}
                    onDragEnd={() => setDraggedFeatureId(null)}
                  />
                ))
              )}
            </div>
          </section>

          <aside className="monster-graft-selector__detail" aria-label="Selected graft details">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={inspectedItem?.feature?.id || "empty-detail"}
                className="monster-graft-selector__detail-transition"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.14, ease: "easeOut" }}
              >
                <FeatureDetailPanel
                  item={inspectedItem}
                  computed={computed}
                  selectedFeatures={selectedFeatures}
                  typeId={typeId}
                  category={category}
                  roleId={roleId}
                  dangerId={dangerId}
                  sourceId={sourceId}
                  advancedMode={advancedMode}
                  slotCaps={slotCaps}
                  getSlotCap={getSlotCap}
                  onAdd={() => inspectedItem && addFeature(inspectedItem.feature)}
                />
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>
      </motion.aside>
    </div>
  );
}

export function ComponentNavigatorDrawer({ open, ...props }) {
  if (!open) return null;

  const selector = <ComponentNavigatorPanel surface="modal" {...props} />;
  const mountMarker = (
    <span className="monster-graft-selector__mount" hidden aria-hidden="true" />
  );

  if (typeof document === "undefined" || !document.body) {
    return (
      <>
        {mountMarker}
        {selector}
      </>
    );
  }

  return (
    <>
      {mountMarker}
      {createPortal(
        <div
          className="cruor-composer-shell monster-graft-selector-portal"
          data-component-navigator-portal=""
        >
          {selector}
        </div>,
        document.body,
      )}
    </>
  );
}

export function ComponentNavigatorModal({ open, ...props }) {
  if (!open) return null;

  const modal = <ComponentNavigatorPanel surface="modal" {...props} />;

  if (typeof document === "undefined" || !document.body) {
    return modal;
  }

  return createPortal(
    <div
      className="cruor-composer-shell monster-graft-selector-portal"
      data-component-navigator-portal=""
    >
      {modal}
    </div>,
    document.body,
  );
}
