const DARK_PLACES_VIDEO_SRC = "/assets/video/dark-places-video.mp4";
const DARK_PLACES_POSTER_SRC = "/assets/landing-page/hero-mapcrop.webp";

const DARK_PLACES_VIDEO_CAPTIONS = [
  {
    from: 0,
    to: 6,
    text: "Start with a dark place and generate its first playable map.",
  },
  {
    from: 6,
    to: 11,
    text: "Shape the dungeon by editing rooms, corridors, and layout.",
  },
  {
    from: 11,
    to: 17,
    text: "Layer in traps, encounters, clues, and other session features.",
  },
  {
    from: 17,
    to: 25,
    text: "Tune the map’s visual style to match the horror tone.",
  },
  {
    from: 25,
    to: Number.POSITIVE_INFINITY,
    text: "Export a finished location ready for the table.",
  },
];

function getCaptionForTime(currentTime) {
  return (
    DARK_PLACES_VIDEO_CAPTIONS.find(
      (caption) => currentTime >= caption.from && currentTime < caption.to,
    ) || DARK_PLACES_VIDEO_CAPTIONS[0]
  );
}

function findDarkPlacesCard(root = document) {
  return Array.from(root.querySelectorAll(".cruor-home__tool-card")).find((card) => {
    const title = card.querySelector(".cruor-home__tool-copy h3")?.textContent?.trim();
    return title === "Dark Places";
  });
}

function createVideoCaption() {
  const caption = document.createElement("p");
  caption.className = "cruor-home__tool-video-caption";
  caption.setAttribute("aria-live", "polite");
  return caption;
}

function updateVideoCaption(video, caption) {
  if (!caption) return;
  const nextText = getCaptionForTime(video.currentTime || 0).text;
  if (caption.textContent !== nextText) {
    caption.textContent = nextText;
  }
}

function createDarkPlacesVideo(poster, caption) {
  const video = document.createElement("video");
  video.className = "cruor-home__tool-preview-video";
  video.src = DARK_PLACES_VIDEO_SRC;
  video.poster = poster || DARK_PLACES_POSTER_SRC;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", "Dark Places generator preview");
  video.setAttribute("disablepictureinpicture", "");

  const sync = () => updateVideoCaption(video, caption);
  video.addEventListener("timeupdate", sync);
  video.addEventListener("loadedmetadata", sync);
  video.addEventListener("play", sync);
  video.addEventListener("seeked", sync);
  video.addEventListener("ended", sync);
  video.addEventListener("error", sync);

  sync();
  return video;
}

function tryPlay(video) {
  const playAttempt = video.play?.();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {});
  }
}

function enhanceDarkPlacesVideoPreview() {
  const card = findDarkPlacesCard();
  if (!card || card.dataset.mode !== "overview") return;

  const preview = card.querySelector(".cruor-home__tool-main-preview");
  if (!preview) return;

  if (card.dataset.cruorVideoEnhanced !== "true") {
    card.dataset.cruorVideoEnhanced = "true";
  }

  if (!preview.classList.contains("cruor-home__tool-main-preview--video")) {
    preview.classList.add("cruor-home__tool-main-preview--video");
  }

  const image = preview.querySelector("img");
  const poster = image?.currentSrc || image?.src || DARK_PLACES_POSTER_SRC;

  let caption = preview.querySelector(".cruor-home__tool-video-caption");
  if (!caption) {
    caption = createVideoCaption();
    preview.append(caption);
  }

  let video = preview.querySelector("video.cruor-home__tool-preview-video");
  if (!video) {
    video = createDarkPlacesVideo(poster, caption);
    preview.append(video);
  }

  if (video.parentElement !== preview) {
    preview.append(video);
  }

  if (caption.parentElement !== preview) {
    preview.append(caption);
  }

  updateVideoCaption(video, caption);
  tryPlay(video);
}

export function initializeHomePagePreviewVideos() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  let frameId = 0;
  const run = () => {
    if (frameId) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      enhanceDarkPlacesVideoPreview();
    });
  };

  run();

  const observer = new MutationObserver(run);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-mode", "class", "src"],
  });

  const blockDarkPlacesPreviewControls = (event) => {
    const target = event.target?.closest?.(
      ".cruor-home__tool-preview-nav, .cruor-home__zoom-button",
    );
    if (!target) return;

    const card = target.closest?.(".cruor-home__tool-card");
    const title = card?.querySelector(".cruor-home__tool-copy h3")?.textContent?.trim();
    if (title !== "Dark Places") return;

    event.preventDefault();
    event.stopPropagation();
  };

  window.addEventListener("focus", run);
  window.addEventListener("pageshow", run);
  document.addEventListener("click", blockDarkPlacesPreviewControls, true);

  return () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    observer.disconnect();
    window.removeEventListener("focus", run);
    window.removeEventListener("pageshow", run);
    document.removeEventListener("click", blockDarkPlacesPreviewControls, true);
  };
}
