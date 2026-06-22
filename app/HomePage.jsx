import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { INSPIRATION_CARDS } from "../features/crucible/crucible.sources-data.js";
import "./home-page.css";

const LANDING_IMAGES = {
  workbench: {
    src: "/assets/landing-page/hero-workbench.webp",
    alt: "Cruor workbench interface preview with advanced dark fantasy creation tools.",
    label: "Workbench",
    caption: "Workbench view showing how Cruor organizes sources, components, and generator controls before output.",
  },
  map: {
    src: "/assets/landing-page/hero-mapcrop.webp",
    alt: "Dark fantasy map crop generated from a structured horror location.",
    label: "Map Output",
    caption: "Procedural map output shaped by location logic, keyed regions, routes, hazards, and table-ready notes.",
  },
  inspiration: {
    src: "/assets/landing-page/hero-inspiration.webp",
    alt: "Cruor inspiration archive preview showing real sources transformed into playable horror material.",
    label: "Source Archive",
    caption: "Source archive preview showing real inspirations transformed into usable dark fantasy components.",
  },
};

const TOOL_CARDS = [
  {
    id: "darken",
    title: "Dark Places",
    descriptor: "01 / Location & Map Generator",
    openLabel: "Open Generator",
    summary:
      "Define a dark fantasy location, choose the horror logic that shapes it, and generate a playable map with keyed regions, hazards, clues, and table text. The tool keeps creative choices connected to the final layout, so the map reflects the site you described instead of a generic dungeon.",
    features: [
      {
        icon: "fa-sliders",
        text: "Set the location type, scale, tone, source inspiration, and horror direction.",
      },
      {
        icon: "fa-dungeon",
        text: "Build the site as playable regions with roles, entrances, routes, and pressure points.",
      },
      {
        icon: "fa-map-location-dot",
        text: "Generate a procedural game map from those choices instead of starting from a blank layout.",
      },
      {
        icon: "fa-scroll",
        text: "Fill the map with hazards, clues, sensory details, read-aloud text, and DM notes.",
      },
    ],
    output:
      "A procedural playable map with keyed regions, routes, hazards, clues, read-aloud text, and table-ready notes.",
    actionLabel: "Open Generator",
    actionArgs: ["darken", "composer"],
    art: LANDING_IMAGES.map.src,
    previews: [LANDING_IMAGES.map, LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration],
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
      "Choose a monster concept and role, assemble its horror mechanics, validate its combat profile, and export a complete 5E stat block for play. The tool turns narrative ideas into rules-facing traits, actions, weaknesses, tactics, and encounter support.",
    features: [
      {
        icon: "fa-id-card-clip",
        text: "Set the creature concept, size, role, tier, encounter purpose, and danger level.",
      },
      {
        icon: "fa-dna",
        text: "Add modular horror parts that define movement, attacks, defenses, weaknesses, and scene presence.",
      },
      {
        icon: "fa-chart-line",
        text: "Check damage, durability, action pressure, complexity, and counterplay before export.",
      },
      {
        icon: "fa-file-lines",
        text: "Generate a complete monster stat block with tactics, tells, and table-use notes.",
      },
    ],
    output:
      "A complete 5E monster stat block with combat actions, traits, tactics, counterplay, and table-ready support notes.",
    actionLabel: "Open Generator",
    actionArgs: ["monster"],
    art: LANDING_IMAGES.workbench.src,
    previews: [LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration, LANDING_IMAGES.map],
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

const SOURCE_CAROUSEL_CARDS = INSPIRATION_CARDS.map((card) => ({
  title: card.anchor,
  description: card.caption,
  imageUrl: card.imageUrl,
  imageAlt: card.imageNote || `${card.anchor} inspiration image.`,
}));
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
      <figure className="cruor-home__tool-image cruor-home__tool-engine-figure cruor-home__media-card" aria-label={`${tool.title} engine details`}>
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
      </div>

      <figcaption className="cruor-home__tool-preview-caption">
        <strong>{activePreview.label}.</strong> {activePreview.caption}
      </figcaption>
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
    if (mode !== "overview" || tool.previews.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % tool.previews.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [activeIndex, mode, tool.previews.length]);

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

            <p className="cruor-home__tool-output">
              <strong>Workbench Output.</strong> {tool.output}
            </p>
          </>
        )}
        </div>

      </div>

      <ToolVisual
        tool={tool}
        activeIndex={activeIndex}
        mode={mode}
        onStepPreview={handleStepPreview}
        onZoom={onZoom}
      />

      <div className="cruor-home__tool-actions" aria-label={`${tool.title} actions`}>
        <button
          className="cruor-home__button cruor-home__button--primary"
          type="button"
          onClick={() => handleModeChange(mode === "details" ? "overview" : "details")}
        >
          {mode === "details" ? "See Overview" : "More Info"}
          <i className={`fa-solid ${mode === "details" ? "fa-layer-group" : "fa-circle-info"}`} aria-hidden="true" />
        </button>
        <button
          className="cruor-home__button cruor-home__button--primary"
          type="button"
          onClick={() => onOpenCrucibleTool?.(...tool.actionArgs)}
          aria-label={`Open ${tool.title} generator`}
        >
          {tool.openLabel}
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </div>

    </article>
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
    []
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
  const tools = useMemo(() => TOOL_CARDS, []);


  const heroZoomFrameRef = useRef(null);
  const heroZoomAnimationRef = useRef(null);
  const heroZoomPositionRef = useRef({ x: 0, y: 0 });

  const applyHeroZoomPosition = () => {
    const frame = heroZoomFrameRef.current;
    if (!frame) return;

    frame.style.setProperty("--hero-pan-x", `${heroZoomPositionRef.current.x.toFixed(2)}%`);
    frame.style.setProperty("--hero-pan-y", `${heroZoomPositionRef.current.y.toFixed(2)}%`);
    heroZoomAnimationRef.current = null;
  };

  const scheduleHeroZoomUpdate = () => {
    if (heroZoomAnimationRef.current) return;
    heroZoomAnimationRef.current = window.requestAnimationFrame(applyHeroZoomPosition);
  };

  const handleHeroImagePointerMove = (event) => {
    const frame = event.currentTarget;
    const bounds = frame.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));

    heroZoomPositionRef.current = {
      x: (0.5 - x) * 20,
      y: (0.5 - y) * 16,
    };
    scheduleHeroZoomUpdate();
  };

  const handleHeroImagePointerLeave = () => {
    heroZoomPositionRef.current = { x: 0, y: 0 };
    scheduleHeroZoomUpdate();
  };

  useEffect(() => {
    if (!zoomPreview) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    const preventPageScroll = (event) => {
      event.preventDefault();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setZoomPreview(null);
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
  }, [zoomPreview]);

  return (
    <main className="cruor-home" aria-labelledby="cruorHomeTitle">
      <section className="cruor-home__hero" aria-label="Cruor Games homepage hero">
        <div className="cruor-home__hero-copy">
          <h1 id="cruorHomeTitle">The Dark Fantasy Workbench for 5E.</h1>

          <p>
            Cruor Games builds advanced dark fantasy generators: source-inspired tools for creating
            locations, monsters, maps, mechanics, content packs, and table-ready horror material.
          </p>

          <div className="cruor-home__hero-actions" aria-label="Primary home actions">
            <button
              className="cruor-home__button cruor-home__button--primary"
              type="button"
              onClick={() => onOpenCrucibleTool?.("darken", "composer")}
            >
              Open the Workbench
            </button>

            <button
              className="cruor-home__text-link"
              type="button"
              onClick={onOpenInspirations}
            >
              Browse Inspirations
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>

        <aside className="cruor-home__hero-visual" aria-label="Cruor workbench preview">
          <div className="cruor-home__visual-board">
            <figure
              ref={heroZoomFrameRef}
              className="cruor-home__image-frame cruor-home__image-frame--hero"
              onPointerMove={handleHeroImagePointerMove}
              onPointerLeave={handleHeroImagePointerLeave}
              onPointerCancel={handleHeroImagePointerLeave}
            >
              <img
                src="/assets/landing-page/hero-workbench.webp"
                alt="Cruor workbench interface preview with advanced dark fantasy creation tools."
                decoding="async"
                fetchPriority="high"
              />
            </figure>
          </div>
        </aside>
      </section>

      <section className="cruor-home__statement" aria-labelledby="workbenchStepsTitle">
        <div>
          <div className="cruor-home__statement-head">
            <span>How the Workbench Works</span>
            <h2 id="workbenchStepsTitle">From Source to Table Output.</h2>
            <p>
              Pick a generator, define the creative logic, and turn it into playable 5E material.
            </p>
          </div>

          <ol className="cruor-home__workbench-flow" aria-label="Cruor workbench process">
            <li>
              <span>01</span>
              <i className="fa-solid fa-toolbox" aria-hidden="true" />
              <strong>Pick a Tool</strong>
              <p>Choose whether you need a location map, a monster stat block, or another workbench surface.</p>
            </li>
            <li>
              <span>02</span>
              <i className="fa-solid fa-sliders" aria-hidden="true" />
              <strong>Set the Logic</strong>
              <p>Select sources, tone, scale, constraints, and the rules-aware pieces that shape the build.</p>
            </li>
            <li>
              <span>03</span>
              <i className="fa-solid fa-file-export" aria-hidden="true" />
              <strong>Generate the Output</strong>
              <p>Review the result, adjust what matters, and bring table-ready material directly into play.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="cruor-home__section cruor-home__section--tools" aria-label="Featured Workbench Tools">
        <div className="cruor-home__section-head" hidden>
          <h2 id="featuredToolsTitle">Featured Workbench Tools</h2>
          <p>
            Start with the first production tools of Cruor’s dark fantasy workbench: generate
            playable locations, procedural maps, and complete 5E monster stat blocks from
            source-driven components.
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
      </section>

      <section className="cruor-home__section cruor-home__section--sources" aria-labelledby="sourcesTitle">
        <div className="cruor-home__sources-copy">
          <div className="cruor-home__section-head">
            <h2 id="sourcesTitle">Real Sources, Playable Horror.</h2>
            <p>
              Cruor keeps its inspirations visible. Folklore, historical sites, ritual practice,
              disease, anatomy, architecture, and material culture become source anchors, motifs,
              and components the tools can actually use.
            </p>
          </div>

          <button
            className="cruor-home__button cruor-home__button--primary"
            type="button"
            onClick={onOpenInspirations}
          >
            Browse Our Inspirations
          </button>
        </div>

        <InspirationSourceCarousel />
      </section>

      <section className="cruor-home__section cruor-home__section--support" aria-labelledby="supportTitle">
        <div className="cruor-home__support-band">
          <div>
            <h2 id="supportTitle">Help Expand the Workbench</h2>
            <p>
              Patreon support funds the next layers of Cruor: deeper source packs, more generators,
              better exports, and a larger library of playable dark fantasy material for 5E.
            </p>

            <a className="cruor-home__button cruor-home__button--primary" href="#support">
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

      {zoomPreview ? (
        <div className="cruor-home__zoom-modal" role="dialog" aria-modal="true" aria-label={`${zoomPreview.label} preview`}>
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
            <figcaption>{zoomPreview.label}</figcaption>
          </figure>
        </div>
      ) : null}
    </main>
  );
}
