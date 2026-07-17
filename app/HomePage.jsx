import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Accordion, AccordionItem } from "../components/ui/accordion.jsx";
import AmbientBand from "../components/ui/ambient-band.jsx";
import {
  INSPIRATION_CARDS,
  SOURCE_DETAILS,
} from "../features/crucible/crucible.sources-data.js";
import InspirationCardFront from "../features/inspirations/components/InspirationCardFront.jsx";
import { getInspirationCardMeta } from "../features/inspirations/inspirations.card-config.js";
import SiteLink from "./navigation/SiteLink.jsx";
import { notifyHomeMounted } from "./boot-screen.js";
import "./home-page.css";
import "./home-page-video.css";

const CRUOR_CONTACT_EMAIL = "info@cruorgames.com";
const CRUOR_PATREON_URL = "https://www.patreon.com/c/CruorGames";
const HOME_HERO_VIDEO_SRC = `${import.meta.env.BASE_URL || "/"}assets/video/hero-video.mp4`;
const HOME_HERO_POSTER_SRC = `${import.meta.env.BASE_URL || "/"}assets/video/hero-video-poster.webp`;

const LANDING_IMAGES = {
  workbench: {
    src: "/assets/landing-page/hero-workbench.webp",
    alt: "Cruor workbench interface preview with advanced dark fantasy creation tools.",
    label: "Workbench",
    caption:
      "Workbench view showing how Cruor organizes sources, components, and generator controls before output.",
  },
  map: {
    src: "/assets/landing-page/hero-mapcrop.webp",
    alt: "Dark fantasy map crop generated from a structured horror location.",
    label: "Map Output",
    caption:
      "Procedural map output shaped by location logic, keyed regions, routes, hazards, and table-ready notes.",
  },
  inspiration: {
    src: "/assets/landing-page/hero-inspiration.webp",
    alt: "Cruor inspiration archive preview showing real sources transformed into playable horror material.",
    label: "Source Archive",
    caption:
      "Source archive preview showing real inspirations transformed into usable dark fantasy components.",
  },
};

const TOOL_CARDS = [
  {
    id: "darken",
    title: "Dark Places",
    descriptor: "01 / Location & Map Generator",
    openLabel: "Open Generator",
    summary:
      "Turn a dark fantasy premise into a playable location: a plague chapel, cursed ossuary, flooded crypt, or ruined manor with mapped regions, hazards, clues, sensory details, and table-ready notes.",
    features: [
      {
        icon: "fa-sliders",
        text: "Choose place, source, tone, and horror.",
      },
      {
        icon: "fa-dungeon",
        text: "Shape regions, routes, and pressure.",
      },
      {
        icon: "fa-map-location-dot",
        text: "Generate a map from the site logic.",
      },
      {
        icon: "fa-scroll",
        text: "Add hazards, clues, and table text.",
      },
    ],
    output:
      "A procedural playable map with keyed regions, routes, hazards, clues, read-aloud text, and table-ready notes.",
    actionLabel: "Open Generator",
    actionArgs: ["darken", "composer"],
    href: "/darkplaces",
    art: LANDING_IMAGES.map.src,
    previews: [LANDING_IMAGES.map, LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration],
    videoPreview: {
      src: "/assets/video/dark-places-video.mp4",
      type: "video/mp4",
      ariaLabel: "Dark Places generator preview video",
      captions: [
        {
          from: 0,
          to: 6,
          text: "Generate a playable horror map from your session premise.",
        },
        {
          from: 6,
          to: 11,
          text: "Reshape the dungeon without losing the generated structure.",
        },
        {
          from: 11,
          to: 17,
          text: "Add traps, encounters, clues, and keyed table content.",
        },
        {
          from: 17,
          to: 25,
          text: "Tune the visual style before bringing it to the table.",
        },
        {
          from: 25,
          to: Number.POSITIVE_INFINITY,
          text: "Export the finished location.",
        },
      ],
    },
    engineTitle: "A Location Engine, Not a Room Name Table",
    engineIntro:
      "Dark Places turns a source, a context, and a horror direction into a structured site brief. It does not only generate mood text: it decides what the place is, what pressure it creates, what the players can notice, and what the map generator should understand.",
    engineSupport:
      "The system works by separating tone, source logic, playable regions, table text, and map intent. Each layer can be changed, replaced, or reused without collapsing the whole build into a single random prompt.",
    engineHighlights: [
      {
        icon: "fa-layer-group",
        text: "Separates atmosphere, signs, hazards, clues, and regions into usable components.",
      },
      {
        icon: "fa-route",
        text: "Turns location regions into entrances, routes, setpieces, pressure points, and map intent.",
      },
      {
        icon: "fa-clipboard-check",
        text: "Keeps the output practical: read-aloud text, operational notes, and table-facing hooks.",
      },
      {
        icon: "fa-rotate",
        text: "Lets individual pieces be swapped without rewriting the entire location concept.",
      },
    ],
    engineFlow: [
      {
        icon: "fa-compass-drafting",
        label: "Frame",
        text: "Set the site frame, tone, scale, intrusion level, and table purpose for play.",
      },
      {
        icon: "fa-book-skull",
        label: "Source Logic",
        text: "Real inspirations provide motifs, sensory cues, taboos, and horror behavior.",
      },
      {
        icon: "fa-dungeon",
        label: "Region Model",
        text: "Shape the site into regions with roles, pressure, clues, hazards, and setpieces.",
      },
      {
        icon: "fa-route",
        label: "Map Intent",
        text: "Prepare entrances, routes, connections, and layout needs for map generation.",
      },
    ],
    engineItems: [
      {
        icon: "fa-eye",
        label: "Signs",
        text: "Create visual and sensory cues the DM can describe immediately at the table.",
      },
      {
        icon: "fa-triangle-exclamation",
        label: "Hazards",
        text: "Add playable pressure, danger, and environmental consequences to the location.",
      },
      {
        icon: "fa-magnifying-glass",
        label: "Clues",
        text: "Place evidence, corpses, traces, inscriptions, and revelations for discovery.",
      },
      {
        icon: "fa-scroll",
        label: "Output",
        text: "Compile read-aloud text, keyed notes, and drop-in material for actual play.",
      },
    ],
  },
  {
    id: "monster",
    title: "Terrifying Monsters",
    descriptor: "02 / Monster & Stat Block Generator",
    openLabel: "Open Generator",
    summary:
      "Build a 5E horror monster from concept to stat block: a corpse-fed ghoul, bone saint, plague beast, or cursed knight with role, grafts, attacks, weaknesses, tactics, and encounter support.",
    features: [
      {
        icon: "fa-id-card-clip",
        text: "Set concept, role, tier, and danger.",
      },
      {
        icon: "fa-dna",
        text: "Add movement, attacks, defenses, and horror.",
      },
      {
        icon: "fa-chart-line",
        text: "Check damage, durability, and counterplay.",
      },
      {
        icon: "fa-file-lines",
        text: "Export stat block, tactics, and notes.",
      },
    ],
    output:
      "A complete 5E monster stat block with combat actions, traits, tactics, counterplay, and table-ready support notes.",
    actionLabel: "Open Generator",
    actionArgs: ["monster"],
    href: "/terrifyingmonsters",
    art: LANDING_IMAGES.workbench.src,
    previews: [LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration, LANDING_IMAGES.map],
    videoPreview: {
      src: "/assets/video/terrifying-monsters-video.mp4",
      type: "video/mp4",
      ariaLabel: "Terrifying Monsters generator preview video",
      captions: [
        { from: 0, to: 5, text: "Start from the creature your session needs." },
        {
          from: 5,
          to: 13,
          text: "Set CR, role, tier, danger, and encounter pressure.",
        },
        {
          from: 13,
          to: 27,
          text: "Add grafts that become attacks, traits, movement, and horror mechanics.",
        },
        {
          from: 27,
          to: Number.POSITIVE_INFINITY,
          text: "Export a complete 5E stat block.",
        },
      ],
    },
    engineTitle: "More Than a Random Monster Generator",
    engineIntro:
      "Terrifying Monsters builds each creature through a structured monster engine: a base frame, a tactical role, a threat profile, and modular horror grafts that shape anatomy, attacks, movement, weakness, death effects, and scene presence.",
    engineSupport:
      "Behind every monster, the system estimates expected damage, survivability, action pressure, control effects, counterplay, complexity, and readiness before export. The goal is a rules-aware draft that feels authored rather than stitched together.",
    engineHighlights: [
      {
        icon: "fa-crosshairs",
        text: "Starts from frame, role, tier, tempo, and danger instead of isolated flavor text.",
      },
      {
        icon: "fa-hand-fist",
        text: "Uses grafts to define anatomy, attacks, movement, weakness, death effects, and scene pressure.",
      },
      {
        icon: "fa-chart-simple",
        text: "Tracks damage, durability, action pressure, control effects, and overall complexity.",
      },
      {
        icon: "fa-shield-halved",
        text: "Preserves counterplay with readable tells and player-facing answers.",
      },
    ],
    engineFlow: [
      {
        icon: "fa-id-card-clip",
        label: "Frame",
        text: "Set creature type, size, role, tier, tempo, danger, and encounter purpose.",
      },
      {
        icon: "fa-dna",
        label: "Grafts",
        text: "Choose modular horror grafts for body, movement, attacks, weakness, and death.",
      },
      {
        icon: "fa-chart-line",
        label: "Combat Profile",
        text: "Check expected damage, durability, attack bonus, save DC, pressure, and control.",
      },
      {
        icon: "fa-clipboard-check",
        label: "Validation",
        text: "Run parser, readiness, and publish checks before exporting the monster.",
      },
    ],
    engineItems: [
      {
        icon: "fa-bolt",
        label: "Pressure",
        text: "Define how strongly the creature pressures the table round after round.",
      },
      {
        icon: "fa-diagram-project",
        label: "Complexity",
        text: "Measure rule load, tracking, and decision weight added by the monster.",
      },
      {
        icon: "fa-shield-halved",
        label: "Counterplay",
        text: "Preserve tells, weaknesses, and player answers that keep the horror fair.",
      },
      {
        icon: "fa-file-export",
        label: "Export",
        text: "Compile a structured draft for stat block export, QA, and table-ready use.",
      },
    ],
  },
];

const SOURCE_CAROUSEL_CARDS = INSPIRATION_CARDS.map((card, index) => {
  const sourceType = SOURCE_DETAILS?.[card.anchor]?.sourceType || "";
  const inspiration = {
    id: `home-source-${String(card.anchor || index)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    title: card.anchor,
    caption: card.caption,
    sourceTypes: sourceType ? [sourceType] : [],
    inspiration: sourceType ? { sourceType } : {},
    media: {
      imageUrl: card.imageUrl,
      icon: card.icon || "fa-book-open",
    },
  };

  return {
    inspiration,
    meta: getInspirationCardMeta(inspiration, { fallbackNumber: index + 1 }),
  };
});

const FAQ_ITEMS = [
  {
    id: "cruor-games",
    question: "What is Cruor Games?",
    answer:
      "Cruor Games creates dark fantasy tools and content for 5E Dungeon Masters. Its core product is the Crucible, a growing collection of semi-procedural engines that turn creative direction into balanced, table-ready material.",
  },
  {
    id: "the-crucible",
    question: "What is the Crucible?",
    answer:
      "The Crucible is a content-generation workbench that combines authored material, user choices, and procedural game-design systems. You define what the result should feel like and how it should be used; the engine handles much of the technical construction.",
  },
  {
    id: "semi-procedural-generation",
    question: "How does semi-procedural generation work?",
    answer:
      "You control the flavor, themes, horror style, visual identity, Inspirations, difficulty, intended party, play time, and other relevant parameters. The engine then balances the mechanics, selects compatible abilities, creates elements such as hazards or traps, and assembles a coherent result.",
  },
  {
    id: "existing-preparation",
    question: "Does the Crucible replace my existing preparation?",
    answer:
      "No. The Crucible is designed for drop-in use. It can expand material already present in your campaign without requiring you to replace your plot, setting, objectives, or existing preparation.",
  },
  {
    id: "ai-policy",
    question: "Is any Cruor content generated by AI?",
    answer:
      "No. Neither Cruor’s authored content nor the outputs delivered by the Crucible are generated by AI. AI-assisted tools may support website development, engine testing, and the implementation or verification of deterministic balancing rules.",
  },
  {
    id: "future-engines",
    question: "Will more Crucible engines be added?",
    answer:
      "Yes. Dark Places and Terrifying Monster are the first engines in a broader workbench. Planned future engines include tools for quests, NPCs and villains, magic items, and other kinds of table-ready dark fantasy content.",
  },
  {
    id: "subscription",
    question: "Do I need a subscription?",
    answer:
      "During the initial public testing phase, the Crucible will be available without a paid subscription. Later, a limited selection of tools and Inspirations will remain free, while premium users will gain access to additional functionality, content, and a broader Inspiration library.",
  },
];

const HOME_SECTIONS = [
  { id: "homeHero", label: "Hero" },
  { id: "workbenchFlow", label: "How the Workbench Works" },
  { id: "featuredTools", label: "Featured Tools" },
  { id: "sources", label: "Inspirations" },
  { id: "faq", label: "FAQ" },
  { id: "support", label: "Support" },
];

function getCaptionIndex(captions, currentTime) {
  const index = captions.findIndex(
    (caption) => currentTime >= caption.from && currentTime < caption.to
  );
  return index >= 0 ? index : 0;
}

function ToolVideoPreview({ tool, activePreview, onStepPreview, onZoom }) {
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(0);
  const video = tool.videoPreview;

  useEffect(() => {
    setVideoFailed(false);
    setCaptionIndex(0);
  }, [video?.src]);

  const syncCaption = () => {
    const element = videoRef.current;
    if (!element || !video?.captions?.length) return;
    const nextIndex = getCaptionIndex(video.captions, element.currentTime || 0);
    setCaptionIndex((current) => (current === nextIndex ? current : nextIndex));
  };

  if (!video || videoFailed) {
    return (
      <>
        <div className="cruor-home__tool-main-preview">
          <img
            key={activePreview.src}
            src={activePreview.src}
            alt={activePreview.alt}
            loading="lazy"
            decoding="async"
          />

          <button
            className="cruor-home__tool-preview-nav cruor-home__tool-preview-nav--prev"
            type="button"
            onClick={() => onStepPreview(-1)}
            aria-label={`Previous ${tool.title} preview`}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>

          <button
            className="cruor-home__tool-preview-nav cruor-home__tool-preview-nav--next"
            type="button"
            onClick={() => onStepPreview(1)}
            aria-label={`Next ${tool.title} preview`}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>

          <button
            className="cruor-home__zoom-button"
            type="button"
            onClick={() => onZoom(activePreview)}
            aria-label={`Zoom in ${activePreview.label} preview`}
          >
            <i className="fa-solid fa-magnifying-glass-plus" aria-hidden="true" />
          </button>

          <figcaption className="cruor-home__tool-preview-caption">
            <strong>{activePreview.label}.</strong> {activePreview.caption}
          </figcaption>
        </div>
      </>
    );
  }

  const caption = video.captions[captionIndex] ?? video.captions[0];

  return (
    <div className="cruor-home__tool-main-preview cruor-home__tool-main-preview--video">
      <video
        ref={videoRef}
        className="cruor-home__tool-preview-video"
        poster={activePreview.src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={video.ariaLabel}
        disablePictureInPicture
        onTimeUpdate={syncCaption}
        onLoadedMetadata={syncCaption}
        onPlay={syncCaption}
        onSeeked={syncCaption}
        onError={() => setVideoFailed(true)}
      >
        <source src={video.src} type={video.type || "video/mp4"} />
      </video>

      <p className="cruor-home__tool-video-caption" aria-live="polite">
        {caption.text}
      </p>
    </div>
  );
}

function ToolVisual({ tool, activeIndex, mode, onStepPreview, onZoom }) {
  const activePreview = tool.previews[activeIndex] ?? tool.previews[0];
  const pipelineSteps = [...tool.engineFlow, ...(tool.engineItems ?? [])];
  const pipelinePoints = pipelineSteps.map((_, index) => {
    const row = Math.floor(index / 2);
    const isEvenRow = row % 2 === 0;
    const isFirstInRow = index % 2 === 0;
    const side = isFirstInRow === isEvenRow ? "left" : "right";

    return {
      side,
      row,
      gridColumn: side === "left" ? 1 : 2,
      gridRow: row + 1,
    };
  });

  const getConnector = (index) => {
    const point = pipelinePoints[index];
    const nextPoint = pipelinePoints[index + 1];

    if (!point || !nextPoint) return null;
    if (point.row === nextPoint.row) {
      return nextPoint.side === "right"
        ? { className: "cruor-home__engine-connector--right" }
        : { className: "cruor-home__engine-connector--left" };
    }

    return point.side === "right"
      ? { className: "cruor-home__engine-connector--down-right" }
      : { className: "cruor-home__engine-connector--down-left" };
  };

  if (mode === "details") {
    return (
      <figure
        className="cruor-home__tool-image cruor-home__tool-engine-figure cruor-home__media-card"
        aria-label={`${tool.title} engine details`}
      >
        <div className="cruor-home__tool-engine-panel">
          <div className="cruor-home__tool-engine-panel-head">
            <h4>Engine Pipeline</h4>
            <p>
              The tool breaks a dark fantasy idea into controlled parts, evaluates what each part
              contributes, then compiles the result into material the DM can actually use.
            </p>
          </div>

          <div className="cruor-home__engine-grid" aria-label={`${tool.title} engine pipeline`}>
            {pipelineSteps.map((item, index) => {
              const point = pipelinePoints[index] ?? pipelinePoints[pipelinePoints.length - 1];
              const connector = getConnector(index);

              return (
                <p
                  key={`${tool.id}-pipeline-${item.label}`}
                  className={`cruor-home__engine-node cruor-home__engine-node--${point.side}`}
                  data-step={index + 1}
                  style={{
                    "--engine-col": point.gridColumn,
                    "--engine-row": point.gridRow,
                  }}
                >
                  <span className="cruor-home__engine-node-mark">
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                    <small>{index + 1}</small>
                  </span>
                  <span className="cruor-home__engine-node-copy">
                    <strong>{item.label}</strong>
                    {item.text}
                  </span>
                  {connector ? (
                    <span
                      className={`cruor-home__engine-connector ${connector.className}`}
                      aria-hidden="true"
                    />
                  ) : null}
                </p>
              );
            })}
          </div>
        </div>
      </figure>
    );
  }

  return (
    <figure
      className="cruor-home__tool-image cruor-home__media-card"
      aria-label={`${tool.title} previews`}
    >
      <ToolVideoPreview
        tool={tool}
        activePreview={activePreview}
        onStepPreview={onStepPreview}
        onZoom={onZoom}
      />
    </figure>
  );
}

function ToolCard({ tool, onOpenCrucibleTool, onZoom }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState("overview");
  const cardRef = useRef(null);
  const previousCardHeightRef = useRef(null);

  const prepareCardHeightTransition = () => {
    previousCardHeightRef.current = cardRef.current?.offsetHeight ?? null;
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    prepareCardHeightTransition();
    setMode(nextMode);
  };

  useLayoutEffect(() => {
    const card = cardRef.current;
    const previousHeight = previousCardHeightRef.current;

    if (!card || previousHeight === null) return undefined;

    previousCardHeightRef.current = null;
    const nextHeight = card.offsetHeight;

    if (Math.abs(nextHeight - previousHeight) < 2) return undefined;

    card.style.height = `${previousHeight}px`;
    card.classList.add("cruor-home__tool-card--resizing");

    const frame = window.requestAnimationFrame(() => {
      card.style.height = `${nextHeight}px`;
    });

    const cleanup = () => {
      window.cancelAnimationFrame(frame);
      card.style.height = "";
      card.classList.remove("cruor-home__tool-card--resizing");
    };

    const timer = window.setTimeout(cleanup, 320);
    card.addEventListener("transitionend", cleanup, { once: true });

    return () => {
      window.clearTimeout(timer);
      card.removeEventListener("transitionend", cleanup);
      cleanup();
    };
  }, [mode]);

  useEffect(() => {
    if (tool.videoPreview || mode !== "overview" || tool.previews.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % tool.previews.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [mode, tool.previews.length, tool.videoPreview]);

  const handleStepPreview = (direction) => {
    prepareCardHeightTransition();
    setActiveIndex((current) => {
      const total = tool.previews.length;
      return (current + direction + total) % total;
    });
    setMode("overview");
  };

  return (
    <article
      ref={cardRef}
      className="cruor-home__tool-card cruor-home__tool-card--image-backed"
      data-mode={mode}
      style={{ "--tool-art": `url('${tool.art}')` }}
    >
      <div className="cruor-home__tool-content">
        <div
          key={mode}
          className={`cruor-home__tool-content-inner cruor-home__tool-content-inner--${mode}`}
        >
          {mode === "details" ? (
            <>
              <div className="cruor-home__tool-copy">
                <h3>{tool.engineTitle}</h3>
                <p className="cruor-home__tool-summary">{tool.engineIntro}</p>
                <p className="cruor-home__tool-summary">{tool.engineSupport}</p>
              </div>

              <div className="cruor-home__tool-feature-block">
                <span>Why it matters</span>
                <ul className="cruor-home__tool-features">
                  {tool.engineHighlights.map((feature) => (
                    <li key={`${tool.id}-highlight-${feature.text}`}>
                      <i className={`fa-solid ${feature.icon}`} aria-hidden="true" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="cruor-home__tool-output">
                <strong>Workbench Logic.</strong> {tool.title} is designed to make the output feel
                authored: fast enough for prep, structured enough for validation, and specific
                enough to support table-facing play instead of generic dark fantasy text.
              </p>
            </>
          ) : (
            <>
              <div className="cruor-home__tool-copy">
                <span>{tool.descriptor}</span>
                <h3>{tool.title}</h3>
                <p className="cruor-home__tool-summary">{tool.summary}</p>
              </div>

              <div className="cruor-home__tool-feature-block">
                <span>How It Works</span>
                <ul className="cruor-home__tool-features">
                  {tool.features.map((feature) => (
                    <li key={`${tool.id}-overview-${feature.text}`}>
                      <i className={`fa-solid ${feature.icon}`} aria-hidden="true" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <div className="cruor-home__tool-actions" aria-label={`${tool.title} actions`}>
            <SiteLink
              className="cruor-home__button cruor-home__button--primary"
              href={tool.href}
              onNavigate={() => onOpenCrucibleTool?.(...tool.actionArgs)}
              aria-label={`Open ${tool.title} generator`}
            >
              {tool.openLabel}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </SiteLink>
            <button
              className="cruor-home__button"
              type="button"
              onClick={() => handleModeChange(mode === "details" ? "overview" : "details")}
            >
              {mode === "details" ? "See Overview" : "More Info"}
              <i
                className={`fa-solid ${mode === "details" ? "fa-layer-group" : "fa-circle-info"}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <ToolVisual
        tool={tool}
        activeIndex={activeIndex}
        mode={mode}
        onStepPreview={handleStepPreview}
        onZoom={onZoom}
      />
    </article>
  );
}

function HomeScrollProgress({ activeSectionId, sectionProgress, onNavigate }) {
  const activeIndex = HOME_SECTIONS.findIndex((section) => section.id === activeSectionId);

  return (
    <nav
      className={`cruor-home__scroll-progress${activeSectionId === HOME_SECTIONS[0].id ? " cruor-home__scroll-progress--hidden" : ""}`}
      aria-label="Homepage section progress"
    >
      {HOME_SECTIONS.map((section, index) => {
        const isActive = section.id === activeSectionId;
        const isComplete = activeIndex > index;
        const fill = isActive ? Math.max(0.18, sectionProgress) : isComplete ? 1 : 0;

        return (
          <button
            key={section.id}
            className="cruor-home__scroll-progress-dot"
            type="button"
            style={{ "--diamond-fill": fill }}
            aria-label={`Jump to ${section.label}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onNavigate(section.id)}
          >
            <span aria-hidden="true" />
            <span className="cruor-home__scroll-progress-label" aria-hidden="true">
              {section.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function InspirationSourceCarousel() {
  const carouselSets = useMemo(() => [0, 1, 2], []);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const inertiaFrameRef = useRef(null);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    x: 0,
    time: 0,
    offset: 0,
    velocity: 0,
    cycleWidth: 0,
  });

  const getCycleWidth = () => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(1, track.scrollWidth / carouselSets.length);
  };

  const normalizeOffset = (offset, cycleWidth = getCycleWidth()) => {
    if (!cycleWidth) return offset;
    let nextOffset = offset;

    while (nextOffset <= -cycleWidth) nextOffset += cycleWidth;
    while (nextOffset > 0) nextOffset -= cycleWidth;

    return nextOffset;
  };

  const getRenderedOffset = () => {
    const track = trackRef.current;
    if (!track || typeof window === "undefined") return 0;

    const matrix = window.getComputedStyle(track).transform;
    if (!matrix || matrix === "none") return 0;

    try {
      return new DOMMatrixReadOnly(matrix).m41 || 0;
    } catch {
      const values = matrix.match(/matrix.*\((.+)\)/)?.[1]?.split(",") ?? [];
      return Number.parseFloat(values[4]) || 0;
    }
  };

  const setManualOffset = (offset) => {
    const track = trackRef.current;
    if (!track) return;

    const cycleWidth = dragRef.current.cycleWidth || getCycleWidth();
    const normalizedOffset = normalizeOffset(offset, cycleWidth);
    dragRef.current.offset = normalizedOffset;
    track.style.transform = `translate3d(${normalizedOffset}px, 0, 0)`;
  };

  const syncMarqueePhase = () => {
    const track = trackRef.current;
    const cycleWidth = dragRef.current.cycleWidth || getCycleWidth();
    if (!track || !cycleWidth) return;

    const duration =
      Number.parseFloat(
        getComputedStyle(track).getPropertyValue("--sources-carousel-duration-ms")
      ) || 98800;
    const progress = Math.max(
      0,
      Math.min(1, -normalizeOffset(dragRef.current.offset, cycleWidth) / cycleWidth)
    );

    track.style.setProperty("--sources-carousel-delay", `${-(progress * duration)}ms`);
    track.style.transform = "";
  };

  const stopInertia = () => {
    if (!inertiaFrameRef.current) return;
    window.cancelAnimationFrame(inertiaFrameRef.current);
    inertiaFrameRef.current = null;
  };

  const startInertia = () => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let lastTime = performance.now();

    const step = (time) => {
      const elapsed = Math.min(32, time - lastTime);
      lastTime = time;
      dragRef.current.velocity *= 0.94;
      setManualOffset(dragRef.current.offset + dragRef.current.velocity * (elapsed / 16));

      if (Math.abs(dragRef.current.velocity) > 0.035) {
        inertiaFrameRef.current = window.requestAnimationFrame(step);
        return;
      }

      inertiaFrameRef.current = null;
      syncMarqueePhase();
      viewport.classList.remove("is-dragging", "is-inertia");
    };

    viewport.classList.add("is-inertia");
    inertiaFrameRef.current = window.requestAnimationFrame(step);
  };

  useEffect(() => () => stopInertia(), []);

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    event.preventDefault();
    stopInertia();

    const cycleWidth = getCycleWidth();
    const offset = normalizeOffset(getRenderedOffset(), cycleWidth);

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      x: event.clientX,
      time: performance.now(),
      offset,
      velocity: 0,
      cycleWidth,
    };

    viewport.classList.add("is-dragging");
    setManualOffset(offset);
    viewport.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const now = performance.now();
    const dx = event.clientX - drag.x;
    const dt = Math.max(1, now - drag.time);

    drag.velocity = (dx / dt) * 16;
    drag.x = event.clientX;
    drag.time = now;
    setManualOffset(drag.offset + dx);
  };

  const stopDragging = (event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    viewportRef.current?.releasePointerCapture?.(event.pointerId);
    drag.active = false;

    if (Math.abs(drag.velocity) > 0.25) {
      startInertia();
      return;
    }

    syncMarqueePhase();
    viewportRef.current?.classList.remove("is-dragging", "is-inertia");
  };

  return (
    <div
      ref={viewportRef}
      className="cruor-home__sources-carousel"
      aria-label="Cruor inspiration source carousel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div ref={trackRef} className="cruor-home__sources-carousel-track">
        {carouselSets.map((setIndex) => (
          <div
            className="cruor-home__sources-carousel-set"
            key={`sources-set-${setIndex}`}
            aria-hidden={setIndex > 0 ? "true" : undefined}
          >
            {SOURCE_CAROUSEL_CARDS.map((card) => (
              <InspirationCardFront
                key={`${setIndex}-${card.inspiration.id}`}
                className="cruor-home__source-card"
                inspiration={card.inspiration}
                meta={card.meta}
                ariaHidden={setIndex > 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ onOpenCrucibleTool, onOpenInspirations }) {
  const workbenchFlowRef = useRef(null);
  const revealedWorkbenchStepRef = useRef(0);
  const workbenchCompletedRef = useRef(false);
  const workbenchWheelAccumulatorRef = useRef(0);
  const workbenchRevealLockUntilRef = useRef(0);
  const workbenchGateActiveRef = useRef(false);
  const [zoomPreview, setZoomPreview] = useState(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactFormStatus, setContactFormStatus] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(HOME_SECTIONS[0].id);
  const [sectionProgress, setSectionProgress] = useState(0);
  const [revealedWorkbenchStep, setRevealedWorkbenchStep] = useState(0);
  const [workbenchCompleted, setWorkbenchCompleted] = useState(false);
  const [workbenchGateActive, setWorkbenchGateActive] = useState(false);
  const [isHeroVideoReady, setIsHeroVideoReady] = useState(false);
  const tools = useMemo(() => TOOL_CARDS, []);

  useLayoutEffect(() => {
    notifyHomeMounted();
  }, []);

  useEffect(() => {
    let animationFrame = null;

    const updateSectionProgress = () => {
      const sections = HOME_SECTIONS.map((section) => ({
        ...section,
        element: document.getElementById(section.id),
      })).filter((section) => section.element);

      if (!sections.length) return;

      const probe = window.scrollY + window.innerHeight * 0.46;
      let activeIndex = 0;

      for (let index = 0; index < sections.length; index += 1) {
        if (probe >= sections[index].element.offsetTop) activeIndex = index;
      }

      const active = sections[activeIndex];
      const next = sections[activeIndex + 1];
      const start = active.element.offsetTop;
      const end =
        next?.element.offsetTop ?? document.documentElement.scrollHeight - window.innerHeight;
      const progressRange = Math.max(1, end - start);
      const progress = Math.max(0, Math.min(1, (probe - start) / progressRange));

      setActiveSectionId(active.id);
      setSectionProgress(progress);
      animationFrame = null;
    };

    const requestUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(updateSectionProgress);
    };

    updateSectionProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const staticLayoutQuery = window.matchMedia("(max-width: 900px)");
    const wheelStepThreshold = 120;
    const flipLockMs = 880;
    let completionTimer = null;
    let lastGateScrollY = window.scrollY;

    const markWorkbenchCompleted = () => {
      if (workbenchCompletedRef.current) return;
      workbenchCompletedRef.current = true;
      setWorkbenchCompleted(true);
      workbenchWheelAccumulatorRef.current = 0;
      workbenchRevealLockUntilRef.current = 0;
      workbenchGateActiveRef.current = false;
      setWorkbenchGateActive(false);
    };

    const setWorkbenchStep = (nextStep) => {
      const boundedStep = Math.max(0, Math.min(3, nextStep));
      if (boundedStep <= revealedWorkbenchStepRef.current) return;

      revealedWorkbenchStepRef.current = boundedStep;
      setRevealedWorkbenchStep(boundedStep);
      workbenchWheelAccumulatorRef.current = 0;
      workbenchRevealLockUntilRef.current = performance.now() + flipLockMs;

      if (boundedStep >= 3) {
        window.clearTimeout(completionTimer);
        completionTimer = window.setTimeout(markWorkbenchCompleted, flipLockMs);
      }
    };

    const revealAllSteps = () => {
      revealedWorkbenchStepRef.current = 3;
      setRevealedWorkbenchStep(3);
      markWorkbenchCompleted();
    };

    const normalizeWheelDelta = (event) => {
      const baseDelta = Math.abs(event.deltaY || 0);
      if (event.deltaMode === 1) return baseDelta * 16;
      if (event.deltaMode === 2) return baseDelta * (window.innerHeight || 1);
      return baseDelta;
    };

    const getWorkbenchGateScrollY = () => {
      const section = workbenchFlowRef.current;
      if (!section) return window.scrollY;

      const rect = section.getBoundingClientRect();
      return Math.max(0, Math.round(window.scrollY + rect.top));
    };

    const pinWorkbenchGate = () => {
      const nextScrollY = getWorkbenchGateScrollY();

      if (Math.abs(window.scrollY - nextScrollY) > 2) {
        window.scrollTo({ top: nextScrollY, behavior: "auto" });
      }

      if (!workbenchGateActiveRef.current) {
        workbenchGateActiveRef.current = true;
        setWorkbenchGateActive(true);
      }
    };

    const releaseWorkbenchGate = () => {
      if (!workbenchGateActiveRef.current) return;
      workbenchGateActiveRef.current = false;
      setWorkbenchGateActive(false);
    };

    const shouldCaptureWorkbenchDownScroll = (event) => {
      if (workbenchCompletedRef.current) return false;
      if (reduceMotionQuery.matches || staticLayoutQuery.matches) return false;
      if (workbenchGateActiveRef.current) return true;

      const section = workbenchFlowRef.current;
      if (!section) return false;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const rect = section.getBoundingClientRect();
      const normalizedDelta = normalizeWheelDelta(event);
      const reachesNaturalPinPoint = rect.top > 0 && normalizedDelta >= rect.top;
      const alreadyAtPinPoint = rect.top <= 2 && rect.bottom >= viewportHeight * 0.62;

      return rect.bottom >= viewportHeight * 0.62 && (alreadyAtPinPoint || reachesNaturalPinPoint);
    };

    const handleWorkbenchWheel = (event) => {
      if (event.deltaY <= 0) {
        releaseWorkbenchGate();
        return;
      }

      if (!shouldCaptureWorkbenchDownScroll(event)) {
        releaseWorkbenchGate();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      pinWorkbenchGate();
      lastGateScrollY = window.scrollY;

      if (revealedWorkbenchStepRef.current >= 3) return;

      const now = performance.now();
      if (now < workbenchRevealLockUntilRef.current) return;

      const normalizedDelta = Math.min(120, normalizeWheelDelta(event));
      workbenchWheelAccumulatorRef.current += normalizedDelta;

      if (workbenchWheelAccumulatorRef.current < wheelStepThreshold) return;

      setWorkbenchStep(revealedWorkbenchStepRef.current + 1);
    };

    const handleWorkbenchScrollRescue = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastGateScrollY;
      lastGateScrollY = currentScrollY;

      if (!isScrollingDown) return;
      if (workbenchCompletedRef.current) return;
      if (reduceMotionQuery.matches || staticLayoutQuery.matches) return;

      const section = workbenchFlowRef.current;
      if (!section) return;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const rect = section.getBoundingClientRect();
      const hasPassedNaturalPinPoint = rect.top < -2 && rect.bottom >= viewportHeight * 0.62;

      if (hasPassedNaturalPinPoint) {
        pinWorkbenchGate();

        const now = performance.now();
        if (revealedWorkbenchStepRef.current < 3 && now >= workbenchRevealLockUntilRef.current) {
          setWorkbenchStep(revealedWorkbenchStepRef.current + 1);
        }
      }
    };

    const handleWorkbenchStaticLayout = () => {
      if (reduceMotionQuery.matches || staticLayoutQuery.matches) revealAllSteps();
    };

    handleWorkbenchStaticLayout();
    window.addEventListener("wheel", handleWorkbenchWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("scroll", handleWorkbenchScrollRescue, {
      passive: true,
    });
    reduceMotionQuery.addEventListener?.("change", handleWorkbenchStaticLayout);
    staticLayoutQuery.addEventListener?.("change", handleWorkbenchStaticLayout);

    return () => {
      window.clearTimeout(completionTimer);
      window.removeEventListener("wheel", handleWorkbenchWheel, {
        capture: true,
      });
      window.removeEventListener("scroll", handleWorkbenchScrollRescue);
      reduceMotionQuery.removeEventListener?.("change", handleWorkbenchStaticLayout);
      staticLayoutQuery.removeEventListener?.("change", handleWorkbenchStaticLayout);
    };
  }, []);

  const handleSectionNavigate = (sectionId) => {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!zoomPreview && !isContactFormOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    const preventPageScroll = (event) => {
      event.preventDefault();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setZoomPreview(null);
        setIsContactFormOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", preventPageScroll, { passive: false });
    window.addEventListener("touchmove", preventPageScroll, { passive: false });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", preventPageScroll);
      window.removeEventListener("touchmove", preventPageScroll);
    };
  }, [zoomPreview, isContactFormOpen]);

  const handleContactFormSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = name ? `Cruor Games contact — ${name}` : "Cruor Games contact";
    const body = [
      name ? `Name: ${name}` : null,
      email ? `Email: ${email}` : null,
      message ? `Message:\n${message}` : "Message:",
    ]
      .filter(Boolean)
      .join("\n\n");

    window.location.href = `mailto:${CRUOR_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setContactFormStatus(`Opening your email client to contact ${CRUOR_CONTACT_EMAIL}.`);
  };

  const handleContactFormOpen = () => {
    setContactFormStatus("");
    setIsContactFormOpen(true);
  };

  const workbenchFlowStyle = {
    "--workbench-collapse-progress": "0",
  };

  return (
    <main className="cruor-home" aria-labelledby="cruorHomeTitle">
      <section
        id="homeHero"
        className="cruor-home__hero cruor-home__hero--video"
        aria-label="Cruor Games homepage hero"
      >
        <div
          className={`cruor-home__hero-media${isHeroVideoReady ? " is-video-ready" : ""}`}
          aria-hidden="true"
        >
          <img
            className="cruor-home__hero-poster"
            src={HOME_HERO_POSTER_SRC}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
          <video
            className="cruor-home__hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HOME_HERO_POSTER_SRC}
            onLoadedData={() => setIsHeroVideoReady(true)}
            onCanPlay={() => setIsHeroVideoReady(true)}
          >
            <source src={HOME_HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        </div>

        <div className="cruor-home__hero-copy">
          <h1 id="cruorHomeTitle">The Dark Fantasy Workbench for 5E</h1>

          <p>
            Cruor Games builds advanced dark fantasy generators: source-inspired tools for creating
            locations, monsters, maps, mechanics, content packs, and table-ready horror material.
          </p>

          <div className="cruor-home__hero-actions" aria-label="Cruor workbench entry points">
            <a className="cruor-home__button cruor-home__button--primary" href="#featuredTools">
              Explore the Workbench
              <i className="fa-solid fa-arrow-down" aria-hidden="true" />
            </a>
            <SiteLink
              className="cruor-home__text-link"
              href="/inspirations"
              onNavigate={onOpenInspirations}
            >
              Browse Inspirations
              <i className="fa-solid fa-book-skull" aria-hidden="true" />
            </SiteLink>
          </div>
        </div>
      </section>

      <section
        ref={workbenchFlowRef}
        id="workbenchFlow"
        className={[
          "cruor-home__statement",
          "cruor-home__statement--sticky",
          `is-step-${revealedWorkbenchStep}`,
          workbenchGateActive ? "is-gating" : "",
          workbenchCompleted ? "is-completed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-labelledby="workbenchStepsTitle"
        data-revealed-step={revealedWorkbenchStep}
        data-workbench-released={workbenchCompleted ? "true" : "false"}
        data-workbench-completed={workbenchCompleted ? "true" : "false"}
        data-workbench-gating={workbenchGateActive ? "true" : "false"}
        style={workbenchFlowStyle}
      >
        <div className="cruor-home__statement-sticky">
          <div className="cruor-home__statement-inner">
            <div className="cruor-home__statement-head">
              <span>How the Workbench Works</span>
              <h2 id="workbenchStepsTitle">From Source to Table Output</h2>
              <p>
                Pick a generator, define the creative logic, and turn it into playable 5E material.
              </p>
            </div>

            <ol className="cruor-home__process-strip" aria-label="Cruor workbench process">
              <li className="cruor-home__process-step" tabIndex={0} data-step="1">
                <div className="cruor-home__process-card">
                  <div className="cruor-home__process-card-inner">
                    <div className="cruor-home__process-card-face cruor-home__process-card-face--back">
                      <i className="fa-solid fa-inbox" aria-hidden="true"></i>
                    </div>
                    <div className="cruor-home__process-card-face cruor-home__process-card-face--front">
                      <i className="fa-solid fa-inbox" aria-hidden="true"></i>
                      <strong>Input</strong>
                      <span className="cruor-home__process-subtitle">Define the Need</span>
                      <div className="cruor-home__process-lines">
                        <span>Choose the generator you want to use.</span>
                        <span>Select the sources that inspire the result.</span>
                        <span>Set tone, scope, and creative limits.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li className="cruor-home__process-connector" aria-hidden="true" data-connector="1">
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </li>
              <li className="cruor-home__process-step" tabIndex={0} data-step="2">
                <div className="cruor-home__process-card">
                  <div className="cruor-home__process-card-inner">
                    <div className="cruor-home__process-card-face cruor-home__process-card-face--back">
                      <i className="fa-solid fa-gears" aria-hidden="true"></i>
                    </div>
                    <div className="cruor-home__process-card-face cruor-home__process-card-face--front">
                      <i className="fa-solid fa-gears" aria-hidden="true"></i>
                      <strong>Engine</strong>
                      <span className="cruor-home__process-subtitle">Shape the Result</span>
                      <div className="cruor-home__process-lines">
                        <span>Choose how the material should behave.</span>
                        <span>Anchor each choice to 5E structure.</span>
                        <span>Translate loose inspiration into playable design.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li className="cruor-home__process-connector" aria-hidden="true" data-connector="2">
                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              </li>
              <li className="cruor-home__process-step" tabIndex={0} data-step="3">
                <div className="cruor-home__process-card">
                  <div className="cruor-home__process-card-inner">
                    <div className="cruor-home__process-card-face cruor-home__process-card-face--back">
                      <i className="fa-solid fa-scroll" aria-hidden="true"></i>
                    </div>
                    <div className="cruor-home__process-card-face cruor-home__process-card-face--front">
                      <i className="fa-solid fa-scroll" aria-hidden="true"></i>
                      <strong>Output</strong>
                      <span className="cruor-home__process-subtitle">Use It at the Table</span>
                      <div className="cruor-home__process-lines">
                        <span>Review the generated material.</span>
                        <span>Adjust details without starting over.</span>
                        <span>Export or copy it into your session.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section
        id="featuredTools"
        className="cruor-home__section cruor-home__section--tools"
        aria-labelledby="featuredToolsTitle"
      >
        <div className="cruor-home__section-head cruor-home__section-head--tools">
          <span className="cruor-home__section-kicker">Available Now</span>
          <h2 id="featuredToolsTitle">Workbench Tools</h2>
          <p>
            Use the first production tools of Cruor’s dark fantasy workbench: generate playable
            locations, procedural maps, and complete 5E monster stat blocks from source-driven
            components.
          </p>
        </div>

        <div className="cruor-home__tool-grid">
          {tools.map((tool) => (
            <AmbientBand
              key={tool.id}
              className="cruor-home__tool-band"
              backdropClassName="cruor-home__tool-band-backdrop"
              data-tool-band={tool.id}
            >
              <ToolCard
                tool={tool}
                onOpenCrucibleTool={onOpenCrucibleTool}
                onZoom={setZoomPreview}
              />
            </AmbientBand>
          ))}
        </div>
      </section>

      <section
        id="sources"
        className="cruor-home__section cruor-home__section--sources"
        aria-labelledby="sourcesTitle"
      >
        <div className="cruor-home__sources-copy">
          <div className="cruor-home__section-head">
            <h2 id="sourcesTitle">Real Sources, Playable Horror</h2>
            <p>
              Cruor keeps its inspirations visible. An ossuary can become room logic, a ritual
              practice can become a hazard, and anatomy can become monster grafts. Folklore,
              historical sites, disease, architecture, and material culture become source anchors
              the tools can actually use.
            </p>
          </div>

          <SiteLink
            className="cruor-home__button cruor-home__button--primary"
            href="/inspirations"
            onNavigate={onOpenInspirations}
          >
            Browse Our Inspirations
          </SiteLink>
        </div>

        <InspirationSourceCarousel />
      </section>

      <section
        id="faq"
        className="cruor-home__section cruor-home__section--faq"
        aria-labelledby="faqTitle"
      >
        <div className="cruor-home__faq-layout">
          <div className="cruor-home__faq-intro">
            <span className="cruor-home__section-kicker">The Crucible, Explained</span>
            <h2 id="faqTitle">Frequently Asked Questions</h2>
            <p>
              A concise guide to Cruor Games, the Crucible, its semi-procedural engines, and how
              access will work during and after public testing.
            </p>
          </div>

          <Accordion
            className="cruor-home__faq-accordion"
            role="group"
            aria-label="Frequently asked questions"
          >
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.id} value={item.id} title={item.question}>
                <p>{item.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section
        id="support"
        className="cruor-home__section cruor-home__section--support"
        aria-labelledby="supportTitle"
      >
        <div className="cruor-home__support-band">
          <div>
            <h2 id="supportTitle">Help Expand the Workbench</h2>
            <p>
              Patreon support funds the next layers of Cruor: deeper source packs, more generators,
              better exports, and a larger library of playable dark fantasy material for 5E.
            </p>

            <a
              className="cruor-home__button cruor-home__button--primary"
              href={CRUOR_PATREON_URL}
              target="_blank"
              rel="noreferrer"
            >
              Join the Patreon
            </a>
          </div>

          <ul
            className="cruor-home__support-visual cruor-home__support-list"
            aria-label="What Patreon support expands"
          >
            <li>
              <i className="fa-solid fa-book-skull" aria-hidden="true" />
              <strong>More Source Packs</strong>
              <span>
                New folklore, history, ritual, anatomy, architecture, and horror references.
              </span>
            </li>
            <li>
              <i className="fa-solid fa-gears" aria-hidden="true" />
              <strong>More Generators</strong>
              <span>
                Additional workbench tools for encounters, items, factions, dungeons, and scenes.
              </span>
            </li>
            <li>
              <i className="fa-solid fa-file-export" aria-hidden="true" />
              <strong>Better Exports</strong>
              <span>
                Cleaner outputs for table use, VTT prep, stat blocks, maps, and publishing
                workflows.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <footer className="cruor-home__footer" aria-label="Cruor Games footer">
        <div className="cruor-home__footer-brand">
          <span className="cruor-home__footer-logo-mark" aria-hidden="true">
            <img src="/assets/icons/cruor-logo-small.png" alt="" />
          </span>
          <span className="cruor-home__footer-brand-copy">
            <strong>Cruor Games</strong>
            <span>Dark fantasy workbench for 5E.</span>
          </span>
        </div>

        <div className="cruor-home__footer-meta">
          <nav className="cruor-home__footer-nav" aria-label="Footer navigation">
            <a href="#homeHero">Home</a>
            <a href="#featuredTools">Tools</a>
            <SiteLink href="/inspirations" onNavigate={onOpenInspirations}>
              Inspirations
            </SiteLink>
            <a href="#faq">FAQ</a>
            <a href={CRUOR_PATREON_URL} target="_blank" rel="noreferrer">
              Patreon
            </a>
            <button type="button" onClick={handleContactFormOpen}>
              Contacts
            </button>
          </nav>
          <p className="cruor-home__footer-copy">
            © {new Date().getFullYear()} Cruor Games. All rights reserved.
          </p>
        </div>
      </footer>

      <HomeScrollProgress
        activeSectionId={activeSectionId}
        sectionProgress={sectionProgress}
        onNavigate={handleSectionNavigate}
      />

      {isContactFormOpen ? (
        <div
          className="cruor-home__contact-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cruorContactTitle"
        >
          <button
            className="cruor-home__contact-backdrop"
            type="button"
            aria-label="Close contact form"
            onClick={() => setIsContactFormOpen(false)}
          />
          <form className="cruor-home__contact-form" onSubmit={handleContactFormSubmit}>
            <div className="cruor-home__contact-head">
              <span>Contact</span>
              <h2 id="cruorContactTitle">Get in touch with Cruor Games</h2>
              <p>
                Use this form for publishing, collaboration, licensing, support, or general
                questions. It opens your email client and sends the message to{" "}
                <a href={`mailto:${CRUOR_CONTACT_EMAIL}`}>{CRUOR_CONTACT_EMAIL}</a>.
              </p>
            </div>

            <label>
              <span>Name</span>
              <input name="name" type="text" autoComplete="name" />
            </label>

            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" />
            </label>

            <label>
              <span>Message</span>
              <textarea name="message" rows="5" />
            </label>

            {contactFormStatus ? (
              <p className="cruor-home__contact-status">{contactFormStatus}</p>
            ) : null}

            <div className="cruor-home__contact-actions">
              <button className="cruor-home__button cruor-home__button--primary" type="submit">
                Send Message
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              </button>
              <button
                className="cruor-home__button cruor-home__button--ghost"
                type="button"
                onClick={() => setIsContactFormOpen(false)}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {zoomPreview ? (
        <div
          className="cruor-home__zoom-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomPreview.label} preview`}
        >
          <button
            className="cruor-home__zoom-backdrop"
            type="button"
            aria-label="Close image preview"
            onClick={() => setZoomPreview(null)}
          />
          <figure className="cruor-home__zoom-frame">
            <button
              className="cruor-home__zoom-close"
              type="button"
              onClick={() => setZoomPreview(null)}
              aria-label="Close image preview"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            <img src={zoomPreview.src} alt={zoomPreview.alt} />
            <figcaption>
              <strong>{zoomPreview.label}</strong>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </main>
  );
}
