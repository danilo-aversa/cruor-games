import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { INSPIRATION_CARDS } from "../features/crucible/crucible.sources-data.js";
import "./home-page.css";
import "./home-page-video.css";

const CRUOR_CONTACT_EMAIL = "info@cruorgames.com";
const CRUOR_PATREON_URL = "https://www.patreon.com/c/CruorGames";

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
      "Turn a dark fantasy premise into a playable location: mapped regions, hazards, clues, sensory details, and table-ready text shaped by your chosen horror logic.",
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
    art: LANDING_IMAGES.map.src,
    previews: [LANDING_IMAGES.map, LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration],
    videoPreview: {
      src: "/assets/video/dark-places-video.mp4",
      type: "video/mp4",
      ariaLabel: "Dark Places generator preview video",
      captions: [
        { from: 0, to: 6, text: "Generate a playable horror map from your session premise." },
        { from: 6, to: 11, text: "Reshape the dungeon without losing the generated structure." },
        { from: 11, to: 17, text: "Add traps, encounters, clues, and keyed table content." },
        { from: 17, to: 25, text: "Tune the visual style before bringing it to the table." },
        { from: 25, to: Number.POSITIVE_INFINITY, text: "Export the finished location." },
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
    title: "Terrifying Monster",
    descriptor: "02 / Monster & Stat Block Generator",
    openLabel: "Open Generator",
    summary:
      "Build a 5E horror monster from concept to stat block: role, grafts, attacks, weaknesses, tactics, and encounter support in one workflow.",
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
    art: LANDING_IMAGES.workbench.src,
    previews: [LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration, LANDING_IMAGES.map],
    videoPreview: {
      src: "/assets/video/terrifying-monsters-video.mp4",
      type: "video/mp4",
      ariaLabel: "Terrifying Monster generator preview video",
      captions: [
        { from: 0, to: 5, text: "Start from the creature your session needs." },
        { from: 5, to: 13, text: "Set CR, role, tier, danger, and encounter pressure." },
        {
          from: 13,
          to: 27,
          text: "Add grafts that become attacks, traits, movement, and horror mechanics.",
        },
        { from: 27, to: Number.POSITIVE_INFINITY, text: "Export a complete 5E stat block." },
      ],
    },
    engineTitle: "More Than a Random Monster Generator",
    engineIntro:
      "Terrifying Monster builds each creature through a structured monster engine: a base frame, a tactical role, a threat profile, and modular horror grafts that shape anatomy, attacks, movement, weakness, death effects, and scene presence.",
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


const ROADMAP_TOOL_CARDS = [
  {
    id: "encounter",
    title: "Twist an Encounter",
    descriptor: "Encounter Pressure",
    icon: "fa-person-rays",
    summary: "Turn a standard combat scene into a horror-driven tactical situation with pressure, reveals, terrain, and consequences.",
  },
  {
    id: "item",
    title: "Curse an Item",
    descriptor: "Cursed Objects",
    icon: "fa-gem",
    summary: "Create magic items with drawbacks, rituals, obsessions, costs, and consequences that matter in play.",
  },
  {
    id: "cult",
    title: "Build a Cult",
    descriptor: "Factions & Rites",
    icon: "fa-people-roof",
    summary: "Generate beliefs, rites, leaders, taboos, victims, secrets, and escalation clocks for dark fantasy cults.",
  },
  {
    id: "faction",
    title: "Darken a Faction",
    descriptor: "Political Horror",
    icon: "fa-chess-rook",
    summary: "Corrupt factions with internal rot, hidden motives, public masks, forbidden methods, and pressure on the campaign world.",
  },
  {
    id: "region",
    title: "Shape a Region",
    descriptor: "Regional Dread",
    icon: "fa-map",
    summary: "Build a wider horror region with landmarks, routes, rumors, factions, recurring threats, and travel pressure.",
  },
  {
    id: "scene",
    title: "Darken a Scene",
    descriptor: "Session Moments",
    icon: "fa-masks-theater",
    summary: "Add dread, sensory pressure, moral tension, and table-facing complications to a scene already in your prep.",
  },
];

const SOURCE_CAROUSEL_CARDS = INSPIRATION_CARDS.map((card) => ({
  title: card.anchor,
  description: card.caption,
  imageUrl: card.imageUrl,
  imageAlt: card.imageNote || `${card.anchor} inspiration image.`,
}));

const OUTPUT_EXAMPLES = [
  {
    id: "location-map",
    eyebrow: "Map Output",
    title: "Generated Location",
    size: "1600 × 1000 px",
    icon: "fa-map-location-dot",
    description: "A mapped dark place with keyed rooms, routes, hazards, clues, and table-ready location notes.",
  },
  {
    id: "monster-stat-block",
    eyebrow: "Rules Output",
    title: "Monster Sheet",
    size: "1600 × 1000 px",
    icon: "fa-dragon",
    description: "A complete 5E horror creature with frame, role, grafts, combat actions, and counterplay support.",
  },
  {
    id: "source-to-output",
    eyebrow: "Design Output",
    title: "Source Chain",
    size: "1600 × 1000 px",
    icon: "fa-book-skull",
    description: "A visible path from real inspiration to motifs, constraints, components, and playable 5E material.",
  },
];

const HOME_SECTIONS = [
  { id: "homeHero", label: "Hero" },
  { id: "workbenchFlow", label: "How the Workbench Works" },
  { id: "featuredTools", label: "Featured Tools" },
  { id: "outputExamples", label: "Output Examples" },
  { id: "sources", label: "Inspirations" },
  { id: "support", label: "Support" },
];

function getCaptionIndex(captions, currentTime) {
  const index = captions.findIndex((caption) => currentTime >= caption.from && currentTime < caption.to);
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
                  style={{ "--engine-col": point.gridColumn, "--engine-row": point.gridRow }}
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
                    <span className={`cruor-home__engine-connector ${connector.className}`} aria-hidden="true" />
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
    <figure className="cruor-home__tool-image cruor-home__media-card" aria-label={`${tool.title} previews`}>
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
        <div key={mode} className={`cruor-home__tool-content-inner cruor-home__tool-content-inner--${mode}`}>
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
                <strong>Workbench Logic.</strong> {tool.title} is designed to make the output feel authored:
                fast enough for prep, structured enough for validation, and specific enough to support
                table-facing play instead of generic dark fantasy text.
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
            <button
              className="cruor-home__button cruor-home__button--primary"
              type="button"
              onClick={() => onOpenCrucibleTool?.(...tool.actionArgs)}
              aria-label={`Open ${tool.title} generator`}
            >
              {tool.openLabel}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
            <button
              className="cruor-home__button"
              type="button"
              onClick={() => handleModeChange(mode === "details" ? "overview" : "details")}
            >
              {mode === "details" ? "See Overview" : "More Info"}
              <i className={`fa-solid ${mode === "details" ? "fa-layer-group" : "fa-circle-info"}`} aria-hidden="true" />
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


function RoadmapToolCard({ tool }) {
  return (
    <article className="cruor-home__roadmap-card" aria-label={`${tool.title} is in development`}>
      <span className="cruor-home__roadmap-card-status">In Development</span>
      <i className={`fa-solid ${tool.icon}`} aria-hidden="true" />
      <div>
        <span>{tool.descriptor}</span>
        <h3>{tool.title}</h3>
        <p>{tool.summary}</p>
      </div>
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
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const frameRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const dragRef = useRef({ active: false, pointerId: null, x: 0, time: 0 });
  const carouselCards = useMemo(
    () => [...SOURCE_CAROUSEL_CARDS, ...SOURCE_CAROUSEL_CARDS, ...SOURCE_CAROUSEL_CARDS],
    [],
  );

  const applyOffset = () => {
    const track = trackRef.current;
    if (!track) return;

    const cycleWidth = track.scrollWidth / 3;

    if (cycleWidth > 0) {
      while (offsetRef.current <= -cycleWidth) offsetRef.current += cycleWidth;
      while (offsetRef.current > 0) offsetRef.current -= cycleWidth;
    }

    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  };

  useEffect(() => {
    const tick = () => {
      if (!dragRef.current.active) {
        if (Math.abs(velocityRef.current) > 0.04) {
          offsetRef.current += velocityRef.current;
          velocityRef.current *= 0.94;
        } else {
          offsetRef.current -= 0.22;
        }

        applyOffset();
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handlePointerDown = (event) => {
    event.preventDefault();
    const viewport = viewportRef.current;
    if (!viewport) return;

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      x: event.clientX,
      time: performance.now(),
    };
    velocityRef.current = 0;
    viewport.classList.add("cruor-home__sources-carousel--grabbing");
    viewport.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;

    const now = performance.now();
    const dx = event.clientX - dragRef.current.x;
    const dt = Math.max(1, now - dragRef.current.time);

    offsetRef.current += dx;
    velocityRef.current = (dx / dt) * 16;
    dragRef.current.x = event.clientX;
    dragRef.current.time = now;
    applyOffset();
  };

  const stopDragging = (event) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;

    viewportRef.current?.classList.remove("cruor-home__sources-carousel--grabbing");
    viewportRef.current?.releasePointerCapture?.(event.pointerId);
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
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
        {carouselCards.map((card, index) => (
          <article className="cruor-home__source-card" key={`${card.title}-${index}`}>
            <img
              src={card.imageUrl}
              alt={card.imageAlt}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
            <div className="cruor-home__source-card-copy">
              <strong>{card.title}</strong>
              <p>{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ onOpenCrucibleTool, onOpenInspirations }) {
  const [zoomPreview, setZoomPreview] = useState(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [contactFormStatus, setContactFormStatus] = useState("");
  const [activeSectionId, setActiveSectionId] = useState(HOME_SECTIONS[0].id);
  const [sectionProgress, setSectionProgress] = useState(0);
  const tools = useMemo(() => TOOL_CARDS, []);

  useEffect(() => {
    let animationFrame = null;

    const updateSectionProgress = () => {
      const sections = HOME_SECTIONS
        .map((section) => ({ ...section, element: document.getElementById(section.id) }))
        .filter((section) => section.element);

      if (!sections.length) return;

      const probe = window.scrollY + window.innerHeight * 0.46;
      let activeIndex = 0;

      for (let index = 0; index < sections.length; index += 1) {
        if (probe >= sections[index].element.offsetTop) activeIndex = index;
      }

      const active = sections[activeIndex];
      const next = sections[activeIndex + 1];
      const start = active.element.offsetTop;
      const end = next?.element.offsetTop ?? document.documentElement.scrollHeight - window.innerHeight;
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

  return (
    <main className="cruor-home" aria-labelledby="cruorHomeTitle">
      <section id="homeHero" className="cruor-home__hero cruor-home__hero--video" aria-label="Cruor Games homepage hero">
        <div className="cruor-home__hero-media" aria-hidden="true">
          <video className="cruor-home__hero-video" autoPlay muted loop playsInline preload="metadata">
            <source src="/assets/video/hero-video.mp4" type="video/mp4" />
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
            <button className="cruor-home__text-link" type="button" onClick={onOpenInspirations}>
              Browse Inspirations
              <i className="fa-solid fa-book-skull" aria-hidden="true" />
            </button>
          </div>

        </div>
      </section>

      <section id="workbenchFlow" className="cruor-home__statement" aria-labelledby="workbenchStepsTitle">
        <div>
          <div className="cruor-home__statement-head">
            <span>How the Workbench Works</span>
            <h2 id="workbenchStepsTitle">From Source to Table Output.</h2>
            <p>Pick a generator, define the creative logic, and turn it into playable 5E material.</p>
          </div>

          <ol className="cruor-home__process-strip" aria-label="Cruor workbench process">
            <li className="cruor-home__process-step" tabIndex={0}>
              <strong>Input</strong>
              <p>Choose the generator and define source, tone, and scope.</p>
            </li>
            <li className="cruor-home__process-step" tabIndex={0}>
              <strong>Logic</strong>
              <p>Set constraints, options, and rules that shape the result.</p>
            </li>
            <li className="cruor-home__process-step" tabIndex={0}>
              <strong>Output</strong>
              <p>Review, adjust, export, or bring the result into play.</p>
            </li>
          </ol>
        </div>
      </section>

      <section id="featuredTools" className="cruor-home__section cruor-home__section--tools" aria-labelledby="featuredToolsTitle">
        <div className="cruor-home__section-head cruor-home__section-head--tools">
          <span className="cruor-home__section-kicker">Available Now</span>
          <h2 id="featuredToolsTitle">Workbench Tools.</h2>
          <p>
            Use the first production tools of Cruor’s dark fantasy workbench: generate playable
            locations, procedural maps, and complete 5E monster stat blocks from source-driven components.
          </p>
        </div>

        <div className="cruor-home__tool-grid">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onOpenCrucibleTool={onOpenCrucibleTool}
              onZoom={setZoomPreview}
            />
          ))}
        </div>

        <div className="cruor-home__roadmap" aria-labelledby="roadmapToolsTitle">
          <div className="cruor-home__roadmap-head">
            <span className="cruor-home__section-kicker">In Development</span>
            <h3 id="roadmapToolsTitle">More generators are being forged.</h3>
            <p>
              Cruor is expanding beyond places and monsters into encounters, cursed items, cults,
              factions, regions, and scene-level horror tools.
            </p>
          </div>

          <div className="cruor-home__roadmap-grid">
            {ROADMAP_TOOL_CARDS.map((tool) => (
              <RoadmapToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section id="outputExamples" className="cruor-home__section cruor-home__section--output" aria-labelledby="outputExamplesTitle">
        <div className="cruor-home__output-board">
          <div className="cruor-home__output-board-head">
            <div className="cruor-home__section-head cruor-home__section-head--output">
              <span className="cruor-home__section-kicker">Output Examples</span>
              <h2 id="outputExamplesTitle">From Tool to Table.</h2>
              <p>
                A compact preview board for final product screenshots: location output, monster output,
                and the visible source logic that turns inspiration into usable 5E material.
              </p>
            </div>

            <div className="cruor-home__output-board-meta" aria-label="Recommended screenshot dimensions">
              <span>Recommended Image Size</span>
              <strong>1600 × 1000 px</strong>
              <small>Use the same ratio for all three slots.</small>
            </div>
          </div>

          <div className="cruor-home__output-rail" aria-label="Cruor workbench output examples">
            {OUTPUT_EXAMPLES.map((example, index) => (
              <article className="cruor-home__output-panel" key={example.id}>
                <button
                  className="cruor-home__output-panel-frame"
                  type="button"
                  onClick={() => setZoomPreview({ ...example, label: example.title, kind: "output-example", slot: index + 1 })}
                  aria-label={`Enlarge ${example.title} output example`}
                >
                  <div className="cruor-home__output-placeholder">
                    <i className={`fa-solid ${example.icon}`} aria-hidden="true" />
                    <span>Screenshot Slot {index + 1}</span>
                    <small>{example.size}</small>
                  </div>

                  <span className="cruor-home__output-enlarge" aria-hidden="true">
                    <i className="fa-solid fa-magnifying-glass-plus" aria-hidden="true" />
                    Enlarge
                  </span>

                  <div className="cruor-home__output-panel-caption">
                    <span>{example.eyebrow}</span>
                    <strong>{example.title}</strong>
                  </div>
                </button>

                <p>{example.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sources" className="cruor-home__section cruor-home__section--sources" aria-labelledby="sourcesTitle">
        <div className="cruor-home__sources-copy">
          <div className="cruor-home__section-head">
            <h2 id="sourcesTitle">Real Sources, Playable Horror.</h2>
            <p>
              Cruor keeps its inspirations visible. Folklore, historical sites, ritual practice,
              disease, anatomy, architecture, and material culture become source anchors, motifs,
              and components the tools can actually use.
            </p>
          </div>

          <button className="cruor-home__button cruor-home__button--primary" type="button" onClick={onOpenInspirations}>
            Browse Our Inspirations
          </button>
        </div>

        <InspirationSourceCarousel />
      </section>

      <section id="support" className="cruor-home__section cruor-home__section--support" aria-labelledby="supportTitle">
        <div className="cruor-home__support-band">
          <div>
            <h2 id="supportTitle">Help Expand the Workbench</h2>
            <p>
              Patreon support funds the next layers of Cruor: deeper source packs, more generators,
              better exports, and a larger library of playable dark fantasy material for 5E.
            </p>

            <a className="cruor-home__button cruor-home__button--primary" href={CRUOR_PATREON_URL} target="_blank" rel="noreferrer">
              Join the Patreon
            </a>
          </div>

          <ul className="cruor-home__support-visual cruor-home__support-list" aria-label="What Patreon support expands">
            <li>
              <i className="fa-solid fa-book-skull" aria-hidden="true" />
              <strong>More Source Packs</strong>
              <span>New folklore, history, ritual, anatomy, architecture, and horror references.</span>
            </li>
            <li>
              <i className="fa-solid fa-gears" aria-hidden="true" />
              <strong>More Generators</strong>
              <span>Additional workbench tools for encounters, items, factions, dungeons, and scenes.</span>
            </li>
            <li>
              <i className="fa-solid fa-file-export" aria-hidden="true" />
              <strong>Better Exports</strong>
              <span>Cleaner outputs for table use, VTT prep, stat blocks, maps, and publishing workflows.</span>
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
            <a href="#outputExamples">Examples</a>
            <button type="button" onClick={onOpenInspirations}>Inspirations</button>
            <a href={CRUOR_PATREON_URL} target="_blank" rel="noreferrer">Patreon</a>
            <button type="button" onClick={handleContactFormOpen}>Contacts</button>
          </nav>
          <p className="cruor-home__footer-copy">© {new Date().getFullYear()} Cruor Games. All rights reserved.</p>
        </div>
      </footer>

      <HomeScrollProgress
        activeSectionId={activeSectionId}
        sectionProgress={sectionProgress}
        onNavigate={handleSectionNavigate}
      />


      {isContactFormOpen ? (
        <div className="cruor-home__contact-modal" role="dialog" aria-modal="true" aria-labelledby="cruorContactTitle">
          <button
            className="cruor-home__contact-backdrop"
            type="button"
            aria-label="Close contact form"
            onClick={() => setIsContactFormOpen(false)}
          />
          <form className="cruor-home__contact-form" onSubmit={handleContactFormSubmit}>
            <div className="cruor-home__contact-head">
              <span>Contact</span>
              <h2 id="cruorContactTitle">Get in touch with Cruor Games.</h2>
              <p>
                Use this form for publishing, collaboration, licensing, support, or general questions.
                It opens your email client and sends the message to{" "}
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

            {contactFormStatus ? <p className="cruor-home__contact-status">{contactFormStatus}</p> : null}

            <div className="cruor-home__contact-actions">
              <button className="cruor-home__button cruor-home__button--primary" type="submit">
                Send Message
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              </button>
              <button className="cruor-home__button cruor-home__button--ghost" type="button" onClick={() => setIsContactFormOpen(false)}>
                Close
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {zoomPreview ? (
        <div className="cruor-home__zoom-modal" role="dialog" aria-modal="true" aria-label={`${zoomPreview.label} preview`}>
          <button
            className="cruor-home__zoom-backdrop"
            type="button"
            aria-label="Close image preview"
            onClick={() => setZoomPreview(null)}
          />
          <figure className={`cruor-home__zoom-frame${zoomPreview.kind === "output-example" ? " cruor-home__zoom-frame--output" : ""}`}>
            <button
              className="cruor-home__zoom-close"
              type="button"
              onClick={() => setZoomPreview(null)}
              aria-label="Close image preview"
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
            {zoomPreview.kind === "output-example" ? (
              <div className="cruor-home__zoom-output-placeholder">
                <i className={`fa-solid ${zoomPreview.icon}`} aria-hidden="true" />
                <span>Screenshot Slot {zoomPreview.slot}</span>
                <small>{zoomPreview.size}</small>
              </div>
            ) : (
              <img src={zoomPreview.src} alt={zoomPreview.alt} />
            )}
            <figcaption>
              <strong>{zoomPreview.label}</strong>
              {zoomPreview.kind === "output-example" ? <span>{zoomPreview.description}</span> : null}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </main>
  );
}
