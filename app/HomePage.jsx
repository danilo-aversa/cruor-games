import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./home-page.css";

const LANDING_IMAGES = {
  workbench: {
    src: "/assets/landing-page/hero-workbench.webp",
    alt: "Cruor workbench interface preview with advanced dark fantasy creation tools.",
    label: "Workbench",
  },
  map: {
    src: "/assets/landing-page/hero-mapcrop.webp",
    alt: "Dark fantasy map crop generated from a structured horror location.",
    label: "Map Output",
  },
  inspiration: {
    src: "/assets/landing-page/hero-inspiration.webp",
    alt: "Cruor inspiration archive preview showing real sources transformed into playable horror material.",
    label: "Source Archive",
  },
};

const TOOL_CARDS = [
  {
    id: "darken",
    title: "Darken a Location",
    summary:
      "Build structured horror sites from context, source anchors, horror direction, location regions, clues, hazards, atmosphere, and map intent.",
    features: [
      {
        icon: "fa-book-skull",
        text: "Source-inspired atmosphere, sensory cues, and visual signs.",
      },
      {
        icon: "fa-location-dot",
        text: "Location regions with roles, pressure, clues, hazards, and setpiece intent.",
      },
      {
        icon: "fa-map-location-dot",
        text: "Map-aware material that can feed a deterministic playable layout.",
      },
      {
        icon: "fa-scroll",
        text: "Read-aloud text and table-use notes for immediate play.",
      },
    ],
    output:
      "A structured horror location with regions, atmosphere, clues, hazards, map intent, and table notes.",
    actionLabel: "Open Darken a Location",
    actionArgs: ["darken", "composer"],
    art: LANDING_IMAGES.map.src,
    previews: [LANDING_IMAGES.map, LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration],
    engineTitle: "A Location Engine, Not a Room Name Table",
    engineIntro:
      "Darken a Location turns a source, a context, and a horror direction into a structured site brief. It does not only generate mood text: it decides what the place is, what pressure it creates, what the players can notice, and what the map generator should understand.",
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
        text: "Context, site type, tone, scale, intrusion level, and intended table use.",
      },
      {
        icon: "fa-book-skull",
        label: "Source Logic",
        text: "Real inspirations provide motifs, sensory cues, images, taboos, and horror behavior.",
      },
      {
        icon: "fa-dungeon",
        label: "Region Model",
        text: "The site becomes regions with roles, pressure, clues, hazards, and setpiece intent.",
      },
      {
        icon: "fa-route",
        label: "Map Intent",
        text: "Connections, entrances, routes, and layout needs are prepared for the map generator.",
      },
    ],
    engineItems: [
      {
        icon: "fa-eye",
        label: "Signs",
        text: "Immediate visual and sensory cues the DM can describe.",
      },
      {
        icon: "fa-triangle-exclamation",
        label: "Hazards",
        text: "Playable pressure, danger, or environmental consequence.",
      },
      {
        icon: "fa-magnifying-glass",
        label: "Clues",
        text: "Evidence, corpses, traces, inscriptions, and revelations.",
      },
      {
        icon: "fa-scroll",
        label: "Output",
        text: "Read-aloud text, notes, and drop-in material for play.",
      },
    ],
  },
  {
    id: "monster",
    title: "Monster Composer",
    summary:
      "Create dark fantasy creatures through frames, tactical roles, horror grafts, pressure, weaknesses, encounter behavior, validation, and export direction.",
    features: [
      {
        icon: "fa-dna",
        text: "Body, mind, movement, attack pattern, and horror hook.",
      },
      {
        icon: "fa-skull",
        text: "Weaknesses, tells, pressure tools, lair presence, and death effects.",
      },
      {
        icon: "fa-chess-knight",
        text: "Role and threat profile for how the creature behaves at the table.",
      },
      {
        icon: "fa-circle-check",
        text: "A table-ready monster draft with structure, mechanics, and counterplay.",
      },
    ],
    output:
      "A rules-aware monster draft with identity, pressure, player-facing answers, readiness checks, and export direction.",
    actionLabel: "Open Monster Composer",
    actionArgs: ["monster"],
    art: LANDING_IMAGES.workbench.src,
    previews: [LANDING_IMAGES.workbench, LANDING_IMAGES.inspiration, LANDING_IMAGES.map],
    engineTitle: "More Than a Random Monster Generator",
    engineIntro:
      "The Monster Composer builds each creature through a structured monster engine: a base frame, a tactical role, a threat profile, and modular horror grafts that shape anatomy, attacks, movement, weakness, death effects, and scene presence.",
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
        text: "Creature type, size, role, tier, tempo, danger level, and encounter purpose.",
      },
      {
        icon: "fa-dna",
        label: "Grafts",
        text: "Modular horror parts define body, movement, attacks, weakness, and death effect.",
      },
      {
        icon: "fa-chart-line",
        label: "Combat Profile",
        text: "Expected damage, durability, attack bonus, save DC, pressure, and control output.",
      },
      {
        icon: "fa-clipboard-check",
        label: "Validation",
        text: "Parser, readiness, and publish gates check the monster before export.",
      },
    ],
    engineItems: [
      {
        icon: "fa-bolt",
        label: "Pressure",
        text: "How strongly the creature pushes the table each round.",
      },
      {
        icon: "fa-diagram-project",
        label: "Complexity",
        text: "How much rule load, tracking, and decision weight the monster adds.",
      },
      {
        icon: "fa-shield-halved",
        label: "Counterplay",
        text: "Tells, weaknesses, and player answers that keep horror fair.",
      },
      {
        icon: "fa-file-export",
        label: "Export",
        text: "A structured draft prepared for stat block, QA, and table use.",
      },
    ],
  },
];

function ToolVisual({ tool, activeIndex, mode, onSelectPreview, onZoom }) {
  const activePreview = tool.previews[activeIndex] ?? tool.previews[0];
  const pipelineSteps = [...tool.engineFlow, ...(tool.engineItems ?? [])];
  const pipelineRows = Math.max(1, Math.ceil(pipelineSteps.length / 2));
  const pipelineNodeWidth = 34;
  const pipelineSideOffset = pipelineNodeWidth / 2 + 2;
  const pipelinePoints = pipelineSteps.map((_, index) => {
    const row = Math.floor(index / 2);
    const evenRow = row % 2 === 0;
    const firstInRow = index % 2 === 0;
    const x = firstInRow === evenRow ? 24 : 76;
    const y = pipelineRows === 1 ? 50 : 12 + row * (66 / (pipelineRows - 1));

    return { x, y };
  });
  const pipelineConnectors = pipelinePoints.slice(0, -1).map((point, index) => {
    const nextPoint = pipelinePoints[index + 1];
    const movingRight = nextPoint.x > point.x;
    const sameRow = Math.abs(nextPoint.y - point.y) < 0.01;

    if (sameRow) {
      const x1 = point.x + (movingRight ? pipelineSideOffset : -pipelineSideOffset);
      const x2 = nextPoint.x + (movingRight ? -pipelineSideOffset : pipelineSideOffset);

      return {
        path: `M ${x1} ${point.y} L ${x2} ${nextPoint.y}`,
        icon: movingRight ? "fa-arrow-right" : "fa-arrow-left",
        x: (x1 + x2) / 2,
        y: point.y,
      };
    }

    const onRight = point.x > 50;
    const sideX = point.x + (onRight ? pipelineSideOffset : -pipelineSideOffset);
    const outerX = onRight ? 98 : 2;

    return {
      path: `M ${sideX} ${point.y} L ${outerX} ${point.y} L ${outerX} ${nextPoint.y} L ${sideX} ${nextPoint.y}`,
      icon: "fa-arrow-down",
      x: outerX,
      y: (point.y + nextPoint.y) / 2,
    };
  });

  if (mode === "details") {
    return (
      <figure className="cruor-home__tool-image cruor-home__media-card" aria-label={`${tool.title} engine details`}>
        <div className="cruor-home__tool-engine-panel">
          <div className="cruor-home__tool-engine-panel-head">
            <h4>Engine Pipeline</h4>
            <p>
              The tool breaks a dark fantasy idea into controlled parts, evaluates what each part
              contributes, then compiles the result into material the DM can actually use.
            </p>
          </div>

          <div className="cruor-home__engine-grid" aria-label={`${tool.title} engine pipeline`}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              {pipelineConnectors.map((connector, index) => (
                <path key={`${tool.id}-pipeline-line-${index}`} d={connector.path} />
              ))}
            </svg>
            {pipelineConnectors.map((connector, index) => (
              <i
                key={`${tool.id}-pipeline-arrow-${index}`}
                className={`cruor-home__engine-arrow fa-solid ${connector.icon}`}
                aria-hidden="true"
                style={{ "--arrow-x": connector.x, "--arrow-y": connector.y }}
              />
            ))}
            {pipelineSteps.map((item, index) => {
              const point = pipelinePoints[index] ?? pipelinePoints[pipelinePoints.length - 1];

              return (
                <p
                  key={`${tool.id}-pipeline-${item.label}`}
                  style={{ "--engine-x": point.x, "--engine-y": point.y }}
                >
                  <span className="cruor-home__engine-node-mark">
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                    <small>{String(index + 1).padStart(2, "0")}</small>
                  </span>
                  <span className="cruor-home__engine-node-copy">
                    <strong>{item.label}</strong>
                    {item.text}
                  </span>
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
          className="cruor-home__zoom-button"
          type="button"
          onClick={() => onZoom(activePreview)}
          aria-label={`Zoom in ${activePreview.label} preview`}
        >
          <i className="fa-solid fa-magnifying-glass-plus" aria-hidden="true" />
        </button>
      </div>

      <div className="cruor-home__tool-preview-gallery" aria-label={`${tool.title} preview gallery`}>
        {tool.previews.map((preview, index) => (
          <button
            key={`${tool.id}-${preview.label}`}
            className="cruor-home__tool-preview-thumb"
            type="button"
            aria-pressed={index === activeIndex}
            onClick={() => onSelectPreview(index)}
          >
            <img
              src={preview.src}
              alt={preview.alt}
              loading="lazy"
              decoding="async"
            />
            <span>{preview.label}</span>
          </button>
        ))}
      </div>
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

  const handleSelectPreview = (index) => {
    prepareCardHeightTransition();
    setActiveIndex(index);
    setMode("overview");
  };

  return (
    <article
      ref={cardRef}
      className="cruor-home__tool-card cruor-home__tool-card--image-backed"
      style={{ "--tool-art": `url('${tool.art}')` }}
    >
      <div className="cruor-home__tool-tabs" role="tablist" aria-label={`${tool.title} information view`}>
        <button
          className="cruor-home__tool-tab"
          type="button"
          role="tab"
          aria-selected={mode === "overview"}
          aria-pressed={mode === "overview"}
          onClick={() => handleModeChange("overview")}
        >
          <i className="fa-solid fa-layer-group" aria-hidden="true" />
          <span>Overview</span>
        </button>
        <button
          className="cruor-home__tool-tab"
          type="button"
          role="tab"
          aria-selected={mode === "details"}
          aria-pressed={mode === "details"}
          onClick={() => handleModeChange("details")}
        >
          <i className="fa-solid fa-gears" aria-hidden="true" />
          <span>Details</span>
        </button>
      </div>

      <div className="cruor-home__tool-content">
        <div key={mode} className="cruor-home__tool-content-inner">
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
              <strong>Workbench logic.</strong> {tool.title} is designed to make the output feel authored:
              fast enough for prep, structured enough for validation, and specific enough to support
              table-facing play instead of generic dark fantasy text.
            </p>
          </>
        ) : (
          <>
            <div className="cruor-home__tool-copy">
              <h3>{tool.title}</h3>
              <p className="cruor-home__tool-summary">{tool.summary}</p>
            </div>

            <div className="cruor-home__tool-feature-block">
              <span>What it helps you build</span>
              <ul className="cruor-home__tool-features">
                {tool.features.map((feature) => (
                  <li key={`${tool.id}-${feature.text}`}>
                    <i className={`fa-solid ${feature.icon}`} aria-hidden="true" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="cruor-home__tool-output">
              <strong>Final output.</strong> {tool.output}
            </p>
          </>
        )}
        </div>
      </div>

      <ToolVisual
        tool={tool}
        activeIndex={activeIndex}
        mode={mode}
        onSelectPreview={handleSelectPreview}
        onZoom={onZoom}
      />

      {mode === "overview" ? (
        <button
          className="cruor-home__button cruor-home__button--primary"
          type="button"
          onClick={() => onOpenCrucibleTool?.(...tool.actionArgs)}
        >
          {tool.actionLabel}
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      ) : null}
    </article>
  );
}

export default function HomePage({ onOpenCrucibleTool, onOpenInspirations }) {
  const [zoomPreview, setZoomPreview] = useState(null);
  const tools = useMemo(() => TOOL_CARDS, []);

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
    <section className="cruor-home" aria-labelledby="cruorHomeTitle">
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
            <figure className="cruor-home__image-frame cruor-home__image-frame--hero">
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

      <section className="cruor-home__statement" aria-label="Project statement">
        <div>
          <h2>Not a Random Generator Archive.</h2>
          <p>
            Cruor is a modular content engine: real sources become anchors, motifs become components,
            and components become playable 5E material through structured, rules-aware generators.
          </p>
        </div>
      </section>

      <section className="cruor-home__section cruor-home__section--tools" aria-labelledby="featuredToolsTitle">
        <div className="cruor-home__section-head">
          <h2 id="featuredToolsTitle">Current Workbench Tools</h2>
          <p>
            These are the first production surfaces of a wider system for building dark fantasy 5E
            content: locations, monsters, maps, source packs, mechanics, exports, and future generators.
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

        <figure className="cruor-home__sources-visual cruor-home__media-card cruor-home__media-card--inspiration">
          <img
            src="/assets/landing-page/hero-inspiration.webp"
            alt="Cruor inspiration archive preview showing real sources transformed into playable horror material."
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      <section className="cruor-home__section cruor-home__section--support" aria-labelledby="supportTitle">
        <div className="cruor-home__support-band">
          <div>
            <h2 id="supportTitle">Support the Workbench</h2>
            <p>
              Patreon support keeps Cruor growing: more source-inspired components, deeper generator
              options, better exports, and a larger library of playable horror material for 5E.
            </p>

            <a className="cruor-home__button cruor-home__button--primary" href="#support">
              Join the Patreon
            </a>
          </div>

          <div className="cruor-home__support-visual cruor-home__placeholder">
            <div>
              <span>Image Placeholder</span>
              <strong>Support Visual</strong>
              <p>Use a soft collage of source cards, location output, monster output, or Patreon pack previews.</p>
            </div>
          </div>
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
    </section>
  );
}
