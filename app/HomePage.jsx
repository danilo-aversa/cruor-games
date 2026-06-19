import { t } from "../shared/i18n/index.js";
import "./home-page.css";

export default function HomePage({ onOpenCrucibleTool, onOpenInspirations }) {
  return (
    <section className="cruor-home" aria-labelledby="cruorHomeTitle">
      <section className="cruor-home__hero" aria-label={t("home.hero.aria")}>
        <div className="cruor-home__hero-copy">
          <h1 id="cruorHomeTitle">
            {t("home.hero.titleBefore")} <span>{t("home.hero.titleHighlight")}</span>
            <br />
            {t("home.hero.titleAfter")}
          </h1>

          <p>{t("home.hero.body")}</p>

          <div className="cruor-home__hero-actions" aria-label={t("home.hero.actionsAria")}>
            <button
              className="cruor-home__button cruor-home__button--primary"
              type="button"
              onClick={() => onOpenCrucibleTool?.("darken", "composer")}
            >
              {t("home.hero.openWorkbench")}
            </button>

            <button
              className="cruor-home__text-link"
              type="button"
              onClick={onOpenInspirations}
            >
              {t("home.hero.browseInspirations")}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>

        <aside className="cruor-home__hero-visual" aria-label={t("home.hero.visualAria")}>
          <div className="cruor-home__visual-board">
            <div className="cruor-home__image-frame cruor-home__image-frame--main">
              <img
                src="/assets/landing-page/hero-workbench.webp"
                alt={t("home.hero.workbenchAlt")}
                decoding="async"
                fetchPriority="high"
              />
            </div>

            <div className="cruor-home__image-frame cruor-home__image-frame--map">
              <img
                src="/assets/landing-page/hero-mapcrop.webp"
                alt={t("home.hero.mapAlt")}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="cruor-home__image-frame cruor-home__image-frame--inspiration">
              <img
                src="/assets/landing-page/hero-inspiration.webp"
                alt={t("home.hero.inspirationAlt")}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </aside>
      </section>

      <section className="cruor-home__statement" aria-label={t("home.statement.aria")}>
        <div>
          <h2>{t("home.statement.title")}</h2>
          <p>{t("home.statement.body")}</p>
        </div>
      </section>

      <section className="cruor-home__section cruor-home__section--tools" aria-labelledby="featuredToolsTitle">
        <div className="cruor-home__section-head">
          <h2 id="featuredToolsTitle">{t("home.tools.ariaTitle")}</h2>
          <p>{t("home.tools.intro")}</p>
        </div>

        <div className="cruor-home__tool-grid">
          <article className="cruor-home__tool-card">
            <div className="cruor-home__tool-image cruor-home__placeholder">
              <div>
                <span>{t("home.tools.imagePlaceholder")}</span>
                <strong>{t("home.tools.dungeonVisual")}</strong>
                <p>{t("home.tools.dungeonVisualNote")}</p>
              </div>
            </div>

            <div className="cruor-home__tool-content">
              <div className="cruor-home__tool-copy">
                <span className="cruor-home__tool-kicker">The Place</span>
                <h3>{t("home.tools.dungeonTitle")}</h3>
                <p className="cruor-home__tool-summary">
                  Turn a dungeon, cave, chapel, ruin, or noble house into a playable horror site
                  without replacing the session you already prepared.
                </p>
              </div>

              <div className="cruor-home__tool-feature-block">
                <span>What it helps you build</span>
                <ul className="cruor-home__tool-features">
                  <li>Source-inspired atmosphere, sensory cues, and visual signs.</li>
                  <li>Location regions with roles, pressure, clues, and hazards.</li>
                  <li>Map-ready structure for rooms, routes, entrances, and setpieces.</li>
                  <li>Read-aloud text and table-use notes for immediate play.</li>
                </ul>
              </div>

              <p className="cruor-home__tool-output">
                <strong>Final output.</strong> A haunted location insert with regions, atmosphere,
                hazards, clues, and a structure you can move into the map generator.
              </p>
            </div>

            <button
              className="cruor-home__text-link"
              type="button"
              onClick={() => onOpenCrucibleTool?.("darken", "composer")}
            >
              {t("home.tools.dungeonAction")}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </article>

          <article className="cruor-home__tool-card">
            <div className="cruor-home__tool-image cruor-home__placeholder">
              <div>
                <span>{t("home.tools.imagePlaceholder")}</span>
                <strong>{t("home.tools.monsterVisual")}</strong>
                <p>{t("home.tools.monsterVisualNote")}</p>
              </div>
            </div>

            <div className="cruor-home__tool-content">
              <div className="cruor-home__tool-copy">
                <span className="cruor-home__tool-kicker">The Threat</span>
                <h3>{t("home.tools.monsterTitle")}</h3>
                <p className="cruor-home__tool-summary">
                  Compose a creature through anatomy, pressure, weakness, role, and encounter
                  impact instead of starting from a blank stat block.
                </p>
              </div>

              <div className="cruor-home__tool-feature-block">
                <span>What it helps you build</span>
                <ul className="cruor-home__tool-features">
                  <li>Body, mind, movement, attack pattern, and horror hook.</li>
                  <li>Weaknesses, tells, pressure tools, lair presence, and death effects.</li>
                  <li>Role and threat profile for how the creature behaves at the table.</li>
                  <li>A structured monster concept ready for balancing and export passes.</li>
                </ul>
              </div>

              <p className="cruor-home__tool-output">
                <strong>Final output.</strong> A source-inspired monster build with identity,
                behavior, pressure, counterplay, and table-facing direction.
              </p>
            </div>

            <button
              className="cruor-home__text-link"
              type="button"
              onClick={() => onOpenCrucibleTool?.("monster")}
            >
              {t("home.tools.monsterAction")}
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </article>
        </div>
      </section>

      <section className="cruor-home__section cruor-home__section--sources" aria-labelledby="sourcesTitle">
        <div className="cruor-home__sources-copy">
          <div className="cruor-home__section-head">
            <h2 id="sourcesTitle">{t("home.sources.title")}</h2>
            <p>{t("home.sources.body")}</p>
          </div>

          <button
            className="cruor-home__button cruor-home__button--primary"
            type="button"
            onClick={onOpenInspirations}
          >
            {t("home.sources.action")}
          </button>
        </div>

        <div className="cruor-home__inspiration-stack" aria-label={t("home.sources.stackAria")}>
          <article className="cruor-home__stack-card cruor-home__stack-card--low">
            <div className="cruor-home__stack-meta">
              <span>{t("home.sources.inspiration")}</span>
              <span>{t("home.sources.historicalObject")}</span>
            </div>
            <h3>{t("home.sources.waxDeathMasks")}</h3>
            <p>{t("home.sources.waxDeathMasksBody")}</p>
          </article>

          <article className="cruor-home__stack-card cruor-home__stack-card--mid">
            <div className="cruor-home__stack-meta">
              <span>{t("home.sources.inspiration")}</span>
              <span>{t("home.sources.biologicalProcess")}</span>
            </div>
            <h3>{t("home.sources.decomposition")}</h3>
            <p>{t("home.sources.decompositionBody")}</p>
          </article>

          <article className="cruor-home__stack-card cruor-home__stack-card--top">
            <div className="cruor-home__stack-meta">
              <span>{t("home.tools.imagePlaceholder")}</span>
              <span>{t("home.sources.hoverStack")}</span>
            </div>
            <h3>{t("home.sources.sedlecOssuary")}</h3>
            <p>{t("home.sources.sedlecOssuaryBody")}</p>
          </article>
        </div>
      </section>

      <section className="cruor-home__section cruor-home__section--support" aria-labelledby="supportTitle">
        <div className="cruor-home__support-band">
          <div>
            <h2 id="supportTitle">{t("home.support.title")}</h2>
            <p>{t("home.support.body")}</p>

            <a className="cruor-home__button cruor-home__button--primary" href="#support">
              {t("home.support.action")}
            </a>
          </div>

          <div className="cruor-home__support-visual cruor-home__placeholder">
            <div>
              <span>{t("home.tools.imagePlaceholder")}</span>
              <strong>{t("home.support.visual")}</strong>
              <p>{t("home.support.visualNote")}</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
