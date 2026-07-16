import { flushSync } from "react-dom";

const FALLBACK_CLASS = "is-site-page-transitioning";
const FALLBACK_DURATION_MS = 280;
let fallbackCleanupTimer = null;

function prefersReducedMotion() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return true;
  }

  const motionPreference = document.documentElement.dataset.a11yMotion;

  if (motionPreference === "reduced") return true;
  if (motionPreference === "full") return false;

  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
}

function commitUpdate(update) {
  flushSync(() => {
    update();
  });
}

function triggerFallbackAnimation() {
  const root = document.documentElement;
  root.classList.remove(FALLBACK_CLASS);
  void root.offsetWidth;
  root.classList.add(FALLBACK_CLASS);

  if (fallbackCleanupTimer) {
    window.clearTimeout(fallbackCleanupTimer);
  }

  fallbackCleanupTimer = window.setTimeout(() => {
    root.classList.remove(FALLBACK_CLASS);
    fallbackCleanupTimer = null;
  }, FALLBACK_DURATION_MS);
}

function runFallbackTransition(update) {
  commitUpdate(update);
  triggerFallbackAnimation();
}

export function runSitePageTransition(update) {
  if (typeof update !== "function") return null;

  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    prefersReducedMotion()
  ) {
    commitUpdate(update);
    return null;
  }

  if (typeof document.startViewTransition !== "function") {
    runFallbackTransition(update);
    return null;
  }

  let committed = false;
  const commitOnce = () => {
    if (committed) return;
    committed = true;
    commitUpdate(update);
  };

  try {
    return document.startViewTransition(commitOnce);
  } catch {
    commitOnce();
    triggerFallbackAnimation();
    return null;
  }
}
