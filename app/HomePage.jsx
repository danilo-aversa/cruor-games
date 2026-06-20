import "./home-page.css";

export default function HomePage({ onOpenCrucibleTool, onOpenInspirations }) {
  return (
    <section className="cruor-home" aria-labelledby="cruorHomeTitle">
      <section className="cruor-home__hero" aria-label="Cruor Games homepage hero">
        <div className="cruor-home__hero-copy">
          <h1 id="cruorHomeTitle">
            Build the <span>Place.</span>
            <br />
            Forge the Threat.
          </h1>

          <p>
            Cruor is a dark fantasy workbench for 5E Dungeon Masters: choose a source of dread,
            shape a haunted location or monster, and turn it into structured material for play.
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
                alt="Cruor workbench interface preview with dark fantasy creation tools."
                decoding="async"
                fetchPriority="high"
              />
            </figure>
          </div>
        </aside>
      </section>

      <section className="cruor-home__statement" aria-label="Project statement">
        <div>
          <h2>Not Random Tables. A Structured Horror Workbench.</h2>
          <p>
            Cruor turns folklore, history, anatomy, ritual practice, and material culture into
            controlled systems: source anchors, motifs, components, map-aware regions, monster grafts,
            mechanics, and table-facing notes.
          </p>
        </div>
      </section>

      <section className="cruor-home__section cruor-home__section--tools" aria-labelledby="featuredToolsTitle">
        <div className="cruor-home__section-head">
          <h2 id="featuredToolsTitle">Start With a Place or a Threat</h2>
          <p>
            Cruor begins with the two pillars of horror play: the place the characters enter,
            and the thing that should not be there.
          </p>
        </div>

        <div className="cruor-home__tool-grid">
          <article className="cruor-home__tool-card">
            <figure className="cruor-home__tool-image cruor-home__media-card cruor-home__media-card--map">
              <img
                src="/assets/landing-page/hero-mapcrop.webp"
                alt="Dark fantasy map crop generated from a structured horror location."
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div className="cruor-home__tool-content">
              <div className="cruor-home__tool-copy">
                <span className="cruor-home__tool-kicker">The Place</span>
                <h3>Darken a Location</h3>
                <p className="cruor-home__tool-summary">
                  Build a haunted site from context, source anchors, horror direction,
                  regions, clues, hazards, and map intent.
                </p>
              </div>

              <div className="cruor-home__tool-feature-block">
                <span>What it helps you build</span>
                <ul className="cruor-home__tool-features">
                  <li>Source-inspired atmosphere, sensory cues, and visual signs.</li>
                  <li>Structured location regions with roles, pressure, clues, and hazards.</li>
                  <li>Map-aware material that can feed a playable layout when needed.</li>
                  <li>Read-aloud text and table-use notes for immediate play.</li>
                </ul>
              </div>

              <p className="cruor-home__tool-output">
                <strong>Final output.</strong> A structured horror location with regions,
                atmosphere, clues, hazards, map intent, and table notes.
              </p>

              <details className="cruor-home__engine-note">
                <summary>How Darken a Location works under the hood</summary>
                <div className="cruor-home__engine-body">
                  <h4>More Than a Random Map Prompt</h4>
                  <p>
                    Darken a Location does not just pick a gloomy room name and draw a rectangle.
                    It builds a structured location brief from context, source anchors, horror direction,
                    intrusion level, and selected components.
                  </p>
                  <div className="cruor-home__engine-grid">
                    <p><strong>Context.</strong> The site type: crypt, chapel, cave, ruin, noble house, or other location.</p>
                    <p><strong>Sources.</strong> Real inspirations that provide motifs, sensory cues, and horror logic.</p>
                    <p><strong>Regions.</strong> Rooms or areas with roles, pressure, clues, hazards, and setpiece intent.</p>
                    <p><strong>Map Intent.</strong> Connections, entrances, routes, and layout needs the map generator can read.</p>
                    <p><strong>Table Output.</strong> Read-aloud text, operational notes, and drop-in details for play.</p>
                  </div>
                </div>
              </details>
            </div>

            <button
              className="cruor-home__text-link"
              type="button"
              onClick={() => onOpenCrucibleTool?.("darken", "composer")}
            >
              Open Darken a Location
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </article>

          <article className="cruor-home__tool-card">
            <div className="cruor-home__tool-image cruor-home__placeholder cruor-home__tool-image--placeholder">
              <div>
                <span>Image Placeholder</span>
                <strong>Monster Composer Visual</strong>
                <p>Use a monster silhouette, anatomy stage, stat preview, or composer crop.</p>
              </div>
            </div>

            <div className="cruor-home__tool-content">
              <div className="cruor-home__tool-copy">
                <span className="cruor-home__tool-kicker">The Threat</span>
                <h3>Forge a Monster</h3>
                <p className="cruor-home__tool-summary">
                  Build a creature through anatomy, behavior, pressure, weakness, and encounter role,
                  instead of starting from a blank stat block.
                </p>
              </div>

              <div className="cruor-home__tool-feature-block">
                <span>What it helps you build</span>
                <ul className="cruor-home__tool-features">
                  <li>Body, mind, movement, attack pattern, and horror hook.</li>
                  <li>Weaknesses, tells, pressure tools, lair presence, and death effects.</li>
                  <li>Role and threat profile for how the creature behaves at the table.</li>
                  <li>A table-ready monster draft with structure, mechanics, and counterplay.</li>
                </ul>
              </div>

              <p className="cruor-home__tool-output">
                <strong>Final output.</strong> A rules-aware monster draft with identity,
                pressure, player-facing answers, and export direction.
              </p>

              <details className="cruor-home__engine-note">
                <summary>How the Monster Composer works under the hood</summary>
                <div className="cruor-home__engine-body">
                  <h4>More Than a Random Monster Generator</h4>
                  <p>
                    Cruor’s Monster Composer does not simply roll on a table and stitch together
                    dark-sounding text. Each creature is built through a structured monster engine:
                    a base frame, a tactical role, a threat profile, and a set of horror grafts.
                  </p>
                  <p>
                    Behind every generated monster, the system estimates how the creature is expected
                    to fight at the table: damage output, survivability, action pressure, control effects,
                    counterplay, and overall complexity.
                  </p>
                  <div className="cruor-home__engine-grid">
                    <p><strong>Frame.</strong> Type, size, role, tier, tempo, and danger level.</p>
                    <p><strong>Grafts.</strong> Modular horror parts for anatomy, attacks, movement, weakness, and scene presence.</p>
                    <p><strong>Combat Profile.</strong> Damage, durability, attack bonus, save DC, action pressure, and special effects.</p>
                    <p><strong>Counterplay.</strong> Tells and player-facing answers, so horror remains tense without becoming arbitrary.</p>
                    <p><strong>Validation.</strong> Parser and publish checks before the monster is treated as table-ready.</p>
                  </div>
                </div>
              </details>
            </div>

            <button
              className="cruor-home__text-link"
              type="button"
              onClick={() => onOpenCrucibleTool?.("monster")}
            >
              Open Monster Composer
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </article>
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
    </section>
  );
}
