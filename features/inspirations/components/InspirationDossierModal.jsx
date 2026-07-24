import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { t } from "../../../shared/i18n/index.js";
import { getTriggerWarningDefinitions } from "../../../shared/content/trigger-warnings.js";
import InspirationCardFront from "./InspirationCardFront.jsx";

const DOSSIER_TABS = Object.freeze(["dossier", "workbench"]);
const DOSSIER_TRANSITION_MS = 220;

const COMPONENT_GROUP_LABEL_KEYS = Object.freeze({
  locations: "inspirations.dossier.locationContent",
  monsters: "inspirations.dossier.monsterContent",
  other: "inspirations.dossier.otherContent",
});

function getFocusableElements(container) {
  if (!container) return [];
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter(
    (element) =>
      !element.hasAttribute("hidden") &&
      element.getAttribute("aria-hidden") !== "true" &&
      !element.closest("[hidden]"),
  );
}

function asTextList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function asObjectList(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function getComponentGroupId(component = {}) {
  const workflows = Array.isArray(component.workflows)
    ? component.workflows
    : [];
  const contentType = String(component.contentType || "").toLowerCase();

  if (
    contentType === "monster-graft" ||
    workflows.includes("monster-composer")
  ) {
    return "monsters";
  }

  if (
    contentType.includes("location") ||
    workflows.some((workflow) =>
      ["dark-places", "darken-location", "location-composer"].includes(
        workflow,
      ),
    )
  ) {
    return "locations";
  }

  return "other";
}

function groupComponents(components) {
  return components.reduce(
    (groups, component) => {
      groups[getComponentGroupId(component)].push(component);
      return groups;
    },
    { locations: [], monsters: [], other: [] },
  );
}

function formatComponentMeta(component) {
  const details = [];

  if (component.contentType) details.push(component.contentType);
  if (component.semanticType) details.push(component.semanticType);

  const slot = component.monster?.slot || component.slots?.[0];
  if (slot) details.push(slot);

  if (component.contentType === "monster-graft") {
    const cost = Number(component.monster?.cost || 0);
    const costLabel = cost > 0 ? `+${cost}` : String(cost);
    details.push(`Pressure ${costLabel}`);
    details.push(`Complexity ${component.monster?.complexity ?? 0}`);
  }

  return details.join(" · ");
}

function getArticleBlocks(value) {
  const source = String(value || "").trim();
  if (!source) return [];

  return source
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (/^#{2,4}\s+/.test(block)) {
        return {
          id: `heading-${index}`,
          type: "heading",
          text: block.replace(/^#{2,4}\s+/, "").trim(),
        };
      }

      if (block.split("\n").every((line) => /^\s*[-*]\s+/.test(line))) {
        return {
          id: `list-${index}`,
          type: "list",
          items: block
            .split("\n")
            .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
            .filter(Boolean),
        };
      }

      return {
        id: `paragraph-${index}`,
        type: "paragraph",
        text: block.replace(/\n+/g, " ").trim(),
      };
    });
}

function ArticleCopy({ value, emphasizeLead = true }) {
  const blocks = getArticleBlocks(value);
  if (!blocks.length) return null;

  let paragraphIndex = 0;

  return (
    <div className="inspiration-dossier__article-copy">
      {blocks.map((block) => {
        if (block.type === "heading") {
          return <h4 key={block.id}>{block.text}</h4>;
        }

        if (block.type === "list") {
          return (
            <ul key={block.id}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        const className =
          emphasizeLead && paragraphIndex++ === 0
            ? "inspiration-dossier__article-lead"
            : undefined;
        if (!emphasizeLead) paragraphIndex += 1;
        return (
          <p key={block.id} className={className}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function SectionHeading({ number, title }) {
  return (
    <div className="inspiration-dossier__section-heading">
      <span>{String(number).padStart(2, "0")}</span>
      <h3>{title}</h3>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
  );
}

function ResearchLink({ entry }) {
  if (!entry?.title) return null;

  const content = (
    <>
      <span>
        <strong>{entry.title}</strong>
        {entry.description ? <span>{entry.description}</span> : null}
        {entry.meta ? <em>{entry.meta}</em> : null}
      </span>
      {entry.url ? <ExternalLinkIcon /> : null}
    </>
  );

  return entry.url ? (
    <a
      className="inspiration-dossier__research-link"
      href={entry.url}
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </a>
  ) : (
    <div className="inspiration-dossier__research-link">{content}</div>
  );
}

export default function InspirationDossierModal({
  card,
  linkedComponents = [],
  canOpenDarkPlaces = false,
  canOpenMonsterComposer = false,
  onUseDarkPlaces,
  onUseMonsterComposer,
  relatedCards = [],
  onOpenRelatedDossier,
  onClose,
  locale = "en",
}) {
  const stageRef = useRef(null);
  const bodyRef = useRef(null);
  const scrollbarTrackRef = useRef(null);
  const scrollbarThumbRef = useRef(null);
  const scrollbarDragRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const tabRefs = useRef({});
  const closingRef = useRef(false);
  const closeTimerRef = useRef(null);
  const openingFrameRef = useRef(null);
  const [activeTab, setActiveTab] = useState("dossier");
  const [motionState, setMotionState] = useState("entering");
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false);

  const groupedComponents = useMemo(
    () => groupComponents(linkedComponents),
    [linkedComponents],
  );

  const syncScrollbar = useCallback(() => {
    const body = bodyRef.current;
    const track = scrollbarTrackRef.current;
    const thumb = scrollbarThumbRef.current;
    if (!body || !track || !thumb) return;

    const scrollRange = Math.max(0, body.scrollHeight - body.clientHeight);
    const trackHeight = Math.max(0, track.clientHeight);
    const isScrollable = scrollRange > 1 && trackHeight > 0;
    const thumbHeight = isScrollable
      ? Math.max(
          36,
          Math.round(trackHeight * (body.clientHeight / body.scrollHeight)),
        )
      : trackHeight;
    const thumbRange = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = isScrollable
      ? Math.round((body.scrollTop / scrollRange) * thumbRange)
      : 0;

    track.dataset.scrollable = isScrollable ? "true" : "false";
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbTop}px)`;
  }, []);

  const handleScrollbarPointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;

      const body = bodyRef.current;
      const track = scrollbarTrackRef.current;
      const thumb = scrollbarThumbRef.current;
      if (!body || !track || !thumb || track.dataset.scrollable !== "true") {
        return;
      }

      event.preventDefault();
      const trackRect = track.getBoundingClientRect();
      const thumbHeight = thumb.getBoundingClientRect().height;
      const scrollRange = Math.max(0, body.scrollHeight - body.clientHeight);
      const thumbRange = Math.max(1, track.clientHeight - thumbHeight);

      if (event.target !== thumb) {
        const nextThumbTop = Math.max(
          0,
          Math.min(
            thumbRange,
            event.clientY - trackRect.top - thumbHeight / 2,
          ),
        );
        body.scrollTop = (nextThumbTop / thumbRange) * scrollRange;
        syncScrollbar();
      }

      scrollbarDragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startScrollTop: body.scrollTop,
        scrollRange,
        thumbRange,
      };
      track.setPointerCapture?.(event.pointerId);
      setIsScrollbarDragging(true);
    },
    [syncScrollbar],
  );

  const handleScrollbarPointerMove = useCallback(
    (event) => {
      const drag = scrollbarDragRef.current;
      const body = bodyRef.current;
      if (!drag || !body || drag.pointerId !== event.pointerId) return;

      event.preventDefault();
      const deltaY = event.clientY - drag.startY;
      body.scrollTop =
        drag.startScrollTop + (deltaY / drag.thumbRange) * drag.scrollRange;
      syncScrollbar();
    },
    [syncScrollbar],
  );

  const finishScrollbarDrag = useCallback((event) => {
    const drag = scrollbarDragRef.current;
    const track = scrollbarTrackRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    track?.releasePointerCapture?.(event.pointerId);
    scrollbarDragRef.current = null;
    setIsScrollbarDragging(false);
  }, []);

  const finishClose = useCallback(() => {
    if (!closingRef.current) return;
    closingRef.current = false;

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    onClose();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    const motionPreference = document.documentElement.dataset.a11yMotion;
    const reduceMotion =
      motionPreference === "reduced" ||
      (motionPreference !== "full" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

    if (reduceMotion) {
      finishClose();
      return;
    }

    setMotionState("closing");
    closeTimerRef.current = window.setTimeout(
      finishClose,
      DOSSIER_TRANSITION_MS + 80,
    );
  }, [finishClose]);

  useEffect(() => {
    const useAnimationFrame =
      typeof window.requestAnimationFrame === "function";
    const open = () => setMotionState("open");

    openingFrameRef.current = useAnimationFrame
      ? window.requestAnimationFrame(open)
      : window.setTimeout(open, 16);

    return () => {
      if (openingFrameRef.current !== null) {
        if (useAnimationFrame) {
          window.cancelAnimationFrame(openingFrameRef.current);
        } else {
          window.clearTimeout(openingFrameRef.current);
        }
      }

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setActiveTab("dossier");
  }, [card?.inspiration?.id]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const body = bodyRef.current;
    if (!stage || !body) return undefined;

    const updateTabOffset = () => {
      const stageRect = stage.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();
      const offset = Math.max(0, Math.round(bodyRect.top - stageRect.top));
      stage.style.setProperty("--dossier-tabs-top", `${offset}px`);
    };

    updateTabOffset();
    window.addEventListener("resize", updateTabOffset);

    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(updateTabOffset)
        : null;
    observer?.observe(stage);
    observer?.observe(body);

    return () => {
      window.removeEventListener("resize", updateTabOffset);
      observer?.disconnect();
    };
  }, [card?.inspiration?.id]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;

    const update = () => syncScrollbar();
    const useAnimationFrame =
      typeof window.requestAnimationFrame === "function";
    const frame = useAnimationFrame
      ? window.requestAnimationFrame(update)
      : window.setTimeout(update, 0);
    body.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    observer?.observe(body);
    const activePanel = body.querySelector(
      ".inspiration-dossier__tab-panel:not([hidden])",
    );
    if (activePanel) observer?.observe(activePanel);

    return () => {
      if (useAnimationFrame) {
        window.cancelAnimationFrame(frame);
      } else {
        window.clearTimeout(frame);
      }
      body.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [
    activeTab,
    card?.inspiration?.id,
    linkedComponents.length,
    relatedCards.length,
    syncScrollbar,
  ]);

  useEffect(() => {
    previousActiveElementRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(stageRef.current);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElementRef.current?.focus?.();
    };
  }, [requestClose]);

  if (!card || typeof document === "undefined") return null;

  const { inspiration, meta, sourceType, sourceAnchor, horror } = card;
  const title = inspiration.title || inspiration.label;
  const domainLabel = t(meta.domain.labelKey, {}, locale);
  const obscurityLabel = t(meta.obscurity.labelKey, {}, locale);
  const editorial = inspiration.editorial || {};
  const media = inspiration.media || {};
  const imageUrl = media.imageUrl || "";
  const imageTitle = media.imageTitle || title;
  const imageCredit = media.imageCredit || "";
  const deck =
    editorial.deck ||
    inspiration.summary ||
    inspiration.caption ||
    meta.description ||
    "";
  const whatItIs =
    editorial.whatItIs ||
    meta.description ||
    sourceAnchor?.summary ||
    inspiration.narrative ||
    inspiration.caption;
  const cruorLens =
    editorial.cruorLens ||
    editorial.whyItDisturbs ||
    inspiration.inspiration?.logic ||
    sourceAnchor?.summary ||
    "";
  const triggerWarnings = getTriggerWarningDefinitions(
    asTextList(
      editorial.triggerWarnings?.length
        ? editorial.triggerWarnings
        : editorial.cautions,
    ),
  );
  const tableSafety = asTextList(editorial.tableSafety);
  const lowIntensityAlternative = String(
    editorial.lowIntensityAlternative || "",
  ).trim();
  const sources = asObjectList(editorial.sources);
  const furtherReading = asObjectList(editorial.furtherReading);
  const sourceAnchorLabel = sourceAnchor?.label || sourceAnchor?.title || title;
  const hasSafety =
    triggerWarnings.length ||
    tableSafety.length ||
    Boolean(lowIntensityAlternative);
  const hasResearch = sources.length || furtherReading.length;
  const hasActions = canOpenDarkPlaces || canOpenMonsterComposer;

  function selectTab(tabId, { focus = false } = {}) {
    setActiveTab(tabId);
    if (focus) {
      window.requestAnimationFrame(() => tabRefs.current[tabId]?.focus());
    }
  }

  function handleTabKeyDown(event, currentTab) {
    const currentIndex = DOSSIER_TABS.indexOf(currentTab);
    let nextIndex;

    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      nextIndex = currentIndex + 1;
    } else if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      nextIndex = currentIndex - 1;
    } else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = DOSSIER_TABS.length - 1;
    else return;

    event.preventDefault();
    const normalizedIndex =
      (nextIndex + DOSSIER_TABS.length) % DOSSIER_TABS.length;
    selectTab(DOSSIER_TABS[normalizedIndex], { focus: true });
  }

  let dossierSectionNumber = 0;

  return createPortal(
    <div
      className={`inspiration-dossier is-${motionState}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      onTransitionEnd={(event) => {
        if (
          motionState === "closing" &&
          event.target === event.currentTarget
        ) {
          finishClose();
        }
      }}
    >
      <div ref={stageRef} className="inspiration-dossier__stage">
        <section
          className="inspiration-dossier__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspiration-dossier-title"
        >
          <button
            ref={closeButtonRef}
            className="inspiration-dossier__close cruor-square-icon-button"
            type="button"
            aria-label={t("inspirations.dossier.close", {}, locale)}
            onClick={requestClose}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>

          <figure className="inspiration-dossier__media">
            <div className="inspiration-dossier__media-image">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={media.imageAlt || ""}
                  decoding="async"
                />
              ) : (
                <i
                  className={`fa-solid ${media.icon || "fa-book-open"}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <figcaption>
              <strong>{imageTitle}</strong>
              {imageCredit ? <span>{imageCredit}</span> : null}
            </figcaption>
          </figure>

          <div className="inspiration-dossier__content">
            <header className="inspiration-dossier__header">
              <p className="inspiration-dossier__eyebrow">
                {t("inspirations.dossier.eyebrow", {}, locale)}
              </p>
              <h2 id="inspiration-dossier-title">{title}</h2>
              {deck ? (
                <p className="inspiration-dossier__deck">{deck}</p>
              ) : null}
              <div className="inspiration-dossier__meta">
                <span>
                  <strong>
                    {t("inspirations.dossier.domain", {}, locale)}
                  </strong>
                  <i
                    className={`fa-solid ${meta.domain.icon}`}
                    aria-hidden="true"
                  />
                  {domainLabel}
                </span>
                <span>
                  <strong>
                    {t("inspirations.dossier.sourceType", {}, locale)}
                  </strong>
                  {sourceType}
                </span>
                <span>
                  <strong>
                    {t("inspirations.dossier.obscurity", {}, locale)}
                  </strong>
                  {meta.obscurity.symbol} {obscurityLabel}
                </span>
                <span>
                  <strong>
                    {t("inspirations.dossier.collection", {}, locale)}
                  </strong>
                  {meta.collectionLabel} · {meta.numberLabel}
                </span>
              </div>
            </header>

            <div className="inspiration-dossier__scroll-region">
              <div ref={bodyRef} className="inspiration-dossier__body">
                <div
                id="inspiration-dossier-panel-dossier"
                className="inspiration-dossier__tab-panel"
                role="tabpanel"
                aria-labelledby="inspiration-dossier-tab-dossier"
                hidden={activeTab !== "dossier"}
              >

                <section className="inspiration-dossier__section inspiration-dossier__section--article">
                  <SectionHeading
                    number={++dossierSectionNumber}
                    title={t("inspirations.dossier.whatItIs", {}, locale)}
                  />
                  <ArticleCopy value={whatItIs} />
                </section>

                {cruorLens ? (
                  <section className="inspiration-dossier__section inspiration-dossier__section--article">
                    <SectionHeading
                      number={++dossierSectionNumber}
                      title={t("inspirations.dossier.cruorLens", {}, locale)}
                    />
                    <ArticleCopy value={cruorLens} emphasizeLead={false} />
                  </section>
                ) : null}



                {hasSafety ? (
                  <section className="inspiration-dossier__section">
                    <SectionHeading
                      number={++dossierSectionNumber}
                      title={t("inspirations.dossier.tableSafety", {}, locale)}
                    />
                    <div className="inspiration-dossier__safety-stack">
                      {triggerWarnings.length ? (
                        <article className="inspiration-dossier__trigger-warning-panel">
                          <header>
                            <span className="inspiration-dossier__trigger-warning-icon" aria-hidden="true">
                              <i className="fa-solid fa-triangle-exclamation" />
                            </span>
                            <div>
                              <h4>
                                {t(
                                  "inspirations.dossier.triggerWarnings",
                                  {},
                                  locale,
                                )}
                              </h4>
                              <p>
                                {t(
                                  "inspirations.dossier.triggerWarningsHint",
                                  { count: triggerWarnings.length },
                                  locale,
                                )}
                              </p>
                            </div>
                          </header>
                          <div className="inspiration-dossier__warning-tags">
                            {triggerWarnings.map((warning) => (
                              <span
                                key={warning.id || warning.label}
                                tabIndex={0}
                                data-key="tooltip-generic"
                                data-tooltip={warning.label}
                                data-tooltip-description={warning.description}
                              >
                                <i className={`fa-solid ${warning.icon || "fa-triangle-exclamation"}`} aria-hidden="true" />
                                <strong>{warning.label}</strong>
                              </span>
                            ))}
                          </div>
                        </article>
                      ) : null}
                      {tableSafety.length ? (
                        <article className="inspiration-dossier__safety-practice">
                          <h4>
                            {t(
                              "inspirations.dossier.runningThisMaterial",
                              {},
                              locale,
                            )}
                          </h4>
                          <ol className="inspiration-dossier__practice-list">
                            {tableSafety.map((practice, index) => (
                              <li key={practice}>
                                <b>{String(index + 1).padStart(2, "0")}</b>
                                <span>{practice}</span>
                              </li>
                            ))}
                          </ol>
                        </article>
                      ) : null}
                    </div>
                    {lowIntensityAlternative ? (
                      <p className="inspiration-dossier__safety-note">
                        <strong>
                          {t(
                            "inspirations.dossier.lowIntensityAlternative",
                            {},
                            locale,
                          )}
                        </strong>{" "}
                        {lowIntensityAlternative}
                      </p>
                    ) : null}
                  </section>
                ) : null}

                {hasResearch ? (
                  <section className="inspiration-dossier__section">
                    <SectionHeading
                      number={++dossierSectionNumber}
                      title={t(
                        "inspirations.dossier.sourcesAndReading",
                        {},
                        locale,
                      )}
                    />
                    <div className="inspiration-dossier__research-grid">
                      {sources.length ? (
                        <section className="inspiration-dossier__research-group">
                          <header>
                            <span className="inspiration-dossier__research-icon" aria-hidden="true">
                              <i className="fa-solid fa-book-bookmark" />
                            </span>
                            <div>
                              <h4>
                                {t(
                                  "inspirations.dossier.sourcesUsed",
                                  {},
                                  locale,
                                )}
                              </h4>
                              <p>
                                {t(
                                  "inspirations.dossier.sourcesUsedDeck",
                                  {},
                                  locale,
                                )}
                              </p>
                            </div>
                          </header>
                          {sources.map((entry, index) => (
                            <ResearchLink
                              key={`${entry.title}-${index}`}
                              entry={entry}
                            />
                          ))}
                        </section>
                      ) : null}
                      {furtherReading.length ? (
                        <section className="inspiration-dossier__research-group">
                          <header>
                            <span className="inspiration-dossier__research-icon" aria-hidden="true">
                              <i className="fa-solid fa-compass" />
                            </span>
                            <div>
                              <h4>
                                {t(
                                  "inspirations.dossier.furtherReading",
                                  {},
                                  locale,
                                )}
                              </h4>
                              <p>
                                {t(
                                  "inspirations.dossier.furtherReadingDeck",
                                  {},
                                  locale,
                                )}
                              </p>
                            </div>
                          </header>
                          {furtherReading.map((entry, index) => (
                            <ResearchLink
                              key={`${entry.title}-${index}`}
                              entry={entry}
                            />
                          ))}
                        </section>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {relatedCards.length ? (
                  <section className="inspiration-dossier__section">
                    <SectionHeading
                      number={dossierSectionNumber + 1}
                      title={t(
                        "inspirations.dossier.relatedDossiers",
                        {},
                        locale,
                      )}
                    />
                    <div className="inspiration-dossier__related-grid">
                      {relatedCards.map((relatedCard) => {
                        const relatedTitle =
                          relatedCard.inspiration?.title ||
                          relatedCard.inspiration?.label ||
                          "Related Inspiration";
                        const openRelated = () =>
                          onOpenRelatedDossier?.(relatedCard.sourceAnchorId);
                        return (
                          <div
                            key={relatedCard.inspiration.id}
                            className="inspiration-dossier__related-card-shell"
                            role="button"
                            tabIndex={0}
                            aria-label={`${t(
                              "inspirations.card.openDossier",
                              {},
                              locale,
                            )}: ${relatedTitle}`}
                            onClick={openRelated}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openRelated();
                              }
                            }}
                          >
                            <InspirationCardFront
                              inspiration={relatedCard.inspiration}
                              meta={relatedCard.meta}
                              ariaHidden
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : null}
              </div>

              <div
                id="inspiration-dossier-panel-workbench"
                className="inspiration-dossier__tab-panel"
                role="tabpanel"
                aria-labelledby="inspiration-dossier-tab-workbench"
                hidden={activeTab !== "workbench"}
              >
                <header className="inspiration-dossier__workbench-intro">
                  <div>
                    <h3>
                      {t("inspirations.dossier.workbenchTitle", {}, locale)}
                    </h3>
                    <p>{t("inspirations.dossier.workbenchDeck", {}, locale)}</p>
                  </div>
                  <span>
                    {linkedComponents.length}{" "}
                    {t("inspirations.dossier.linkedComponents", {}, locale)}
                  </span>
                </header>



                {horror.length ? (
                  <section className="inspiration-dossier__section">
                    <SectionHeading
                      number={1}
                      title={t(
                        "inspirations.dossier.horrorTexture",
                        {},
                        locale,
                      )}
                    />
                    <div className="inspiration-dossier__chips">
                      {horror.map((texture) => (
                        <span key={texture}>{texture}</span>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="inspiration-dossier__section">
                  <div className="inspiration-dossier__section-head">
                    <h3>
                      {t("inspirations.dossier.linkedContent", {}, locale)}
                    </h3>
                    <span>{linkedComponents.length}</span>
                  </div>

                  {linkedComponents.length ? (
                    <>
                      <div className="inspiration-dossier__component-groups">
                        {Object.entries(groupedComponents)
                          .filter(([, components]) => components.length)
                          .map(([groupId, components]) => (
                            <article
                              key={groupId}
                              className="inspiration-dossier__component-group"
                            >
                              <header>
                                <strong>
                                  {t(
                                    COMPONENT_GROUP_LABEL_KEYS[groupId],
                                    {},
                                    locale,
                                  )}
                                </strong>
                                <span>{components.length}</span>
                              </header>
                              <div>
                                {components.map((component) => (
                                  <article key={component.id}>
                                    <small>
                                      {formatComponentMeta(component)}
                                    </small>
                                    <strong>{component.title}</strong>
                                    {component.summary ? (
                                      <p>{component.summary}</p>
                                    ) : null}
                                  </article>
                                ))}
                              </div>
                            </article>
                          ))}
                      </div>

                      <details className="inspiration-dossier__technical-details">
                        <summary>
                          <i className="fa-solid fa-code" aria-hidden="true" />
                          {t(
                            "inspirations.dossier.technicalDetails",
                            {},
                            locale,
                          )}
                        </summary>
                        <div>
                          {linkedComponents.map((component) => (
                            <article key={component.id}>
                              <strong>{component.title}</strong>
                              <small>{formatComponentMeta(component)}</small>
                            </article>
                          ))}
                        </div>
                      </details>
                    </>
                  ) : (
                    <p>
                      {t("inspirations.dossier.noLinkedContent", {}, locale)}
                    </p>
                  )}
                </section>

                <section className="inspiration-dossier__section">
                  <h3>{t("inspirations.dossier.sourceAnchor", {}, locale)}</h3>
                  <p>{sourceAnchorLabel}</p>
                </section>
              </div>
              </div>

              <div
                ref={scrollbarTrackRef}
                className={`inspiration-dossier__scrollbar${
                  isScrollbarDragging ? " is-dragging" : ""
                }`}
                data-scrollable="false"
                aria-hidden="true"
                onPointerDown={handleScrollbarPointerDown}
                onPointerMove={handleScrollbarPointerMove}
                onPointerUp={finishScrollbarDrag}
                onPointerCancel={finishScrollbarDrag}
              >
                <span
                  ref={scrollbarThumbRef}
                  className="inspiration-dossier__scrollbar-thumb"
                />
              </div>
            </div>

            {activeTab === "workbench" && hasActions ? (
              <footer className="inspiration-dossier__actions">
                {canOpenDarkPlaces ? (
                  <button type="button" onClick={onUseDarkPlaces}>
                    <i
                      className="fa-solid fa-location-dot"
                      aria-hidden="true"
                    />
                    <span>
                      {t("inspirations.dossier.useDarkPlaces", {}, locale)}
                    </span>
                  </button>
                ) : null}
                {canOpenMonsterComposer ? (
                  <button type="button" onClick={onUseMonsterComposer}>
                    <i className="fa-solid fa-skull" aria-hidden="true" />
                    <span>
                      {t("inspirations.dossier.useMonsterComposer", {}, locale)}
                    </span>
                  </button>
                ) : null}
              </footer>
            ) : null}
          </div>
        </section>

        <div
          className="inspiration-dossier__tabs"
          role="tablist"
          aria-label={t("inspirations.dossier.tabsAria", {}, locale)}
          aria-orientation="vertical"
        >
          {DOSSIER_TABS.map((tabId) => {
            const selected = activeTab === tabId;
            const tabLabel = t(
              `inspirations.dossier.tabs.${tabId}`,
              {},
              locale,
            );
            return (
              <button
                key={tabId}
                ref={(node) => {
                  tabRefs.current[tabId] = node;
                }}
                id={`inspiration-dossier-tab-${tabId}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`inspiration-dossier-panel-${tabId}`}
                tabIndex={selected ? 0 : -1}
                className={`tooltip-btn${selected ? " is-active" : ""}`}
                aria-label={tabLabel}
                data-key="tooltip-generic"
                data-tooltip={tabLabel}
                onClick={() => selectTab(tabId)}
                onKeyDown={(event) => handleTabKeyDown(event, tabId)}
              >
                <i
                  className={`fa-solid ${
                    tabId === "dossier" ? "fa-book-open" : "fa-gears"
                  }`}
                  aria-hidden="true"
                />
                <span className="sr-only">{tabLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
