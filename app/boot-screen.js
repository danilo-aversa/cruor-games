const HOME_MOUNTED_EVENT = "cruor:home-mounted";
const BOOT_SCREEN_ID = "cruor-boot-screen";
const HERO_POSTER_PRELOAD_ID = "cruor-hero-poster-preload";
const BOOT_MIN_VISIBLE_MS = 240;
const BOOT_ASSET_TIMEOUT_MS = 2800;
const BOOT_MAX_WAIT_MS = 4200;
const BOOT_FADE_MS = 360;

const bootStartedAt =
  typeof performance !== "undefined" ? performance.now() : Date.now();

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function withTimeout(promise, milliseconds) {
  return Promise.race([promise, wait(milliseconds)]);
}

function waitForNextPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

function waitForHomeMount() {
  if (document.getElementById("homeHero")) return Promise.resolve();

  return new Promise((resolve) => {
    let observer = null;

    const finish = () => {
      window.removeEventListener(HOME_MOUNTED_EVENT, finish);
      observer?.disconnect();
      resolve();
    };

    window.addEventListener(HOME_MOUNTED_EVENT, finish, { once: true });

    observer = new MutationObserver(() => {
      if (document.getElementById("homeHero")) finish();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
}

async function waitForCriticalFonts() {
  if (!document.fonts?.load) return;

  await Promise.allSettled([
    document.fonts.load('900 64px "Lovato-Black"'),
    document.fonts.load("400 16px Inter"),
    document.fonts.load("700 16px Inter"),
  ]);
}

async function waitForHeroPoster() {
  const preload = document.getElementById(HERO_POSTER_PRELOAD_ID);
  const posterUrl = preload?.href;
  if (!posterUrl) return;

  const image = new Image();
  image.decoding = "async";
  image.src = posterUrl;

  if (!image.complete) {
    await new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }

  if (image.decode) {
    await image.decode().catch(() => undefined);
  }
}

function clearFallbackTimer() {
  if (!window.__cruorBootFallbackTimer) return;
  window.clearTimeout(window.__cruorBootFallbackTimer);
  window.__cruorBootFallbackTimer = null;
}

async function removeBootScreen() {
  const root = document.documentElement;
  const bootScreen = document.getElementById(BOOT_SCREEN_ID);

  clearFallbackTimer();

  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const remainingMinimum = Math.max(0, BOOT_MIN_VISIBLE_MS - (now - bootStartedAt));
  if (remainingMinimum) await wait(remainingMinimum);

  await waitForNextPaint();

  root.classList.remove("cruor-is-booting");
  root.classList.add("cruor-boot-revealing");
  bootScreen?.setAttribute("aria-hidden", "true");

  await wait(BOOT_FADE_MS);

  bootScreen?.remove();
  root.classList.remove("cruor-boot-revealing");
  root.classList.add("cruor-boot-complete");
  window.dispatchEvent(new CustomEvent("cruor:boot-complete"));
}

export function initializeHomeBootScreen() {
  const root = document.documentElement;
  const bootScreen = document.getElementById(BOOT_SCREEN_ID);
  const shouldBootHome = root.dataset.cruorInitialRoute === "home";

  if (!shouldBootHome || !bootScreen) {
    clearFallbackTimer();
    bootScreen?.remove();
    root.classList.remove("cruor-is-booting", "cruor-boot-revealing");
    root.classList.add("cruor-boot-complete");
    return Promise.resolve();
  }

  const readiness = Promise.allSettled([
    withTimeout(waitForHomeMount(), BOOT_ASSET_TIMEOUT_MS),
    withTimeout(waitForCriticalFonts(), BOOT_ASSET_TIMEOUT_MS),
    withTimeout(waitForHeroPoster(), BOOT_ASSET_TIMEOUT_MS),
  ]);

  return Promise.race([readiness, wait(BOOT_MAX_WAIT_MS)]).then(removeBootScreen);
}

export function notifyHomeMounted() {
  window.dispatchEvent(new CustomEvent(HOME_MOUNTED_EVENT));
}
