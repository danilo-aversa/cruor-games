import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getSourceAnchorId,
  getStaticContentPackProvenance,
  getStaticContentRegistry,
} from "../../shared/content/content.index.js";
import { t } from "../../shared/i18n/index.js";
import InspirationCardGrid from "./components/InspirationCardGrid.jsx";
import InspirationDossierModal from "./components/InspirationDossierModal.jsx";
import InspirationFilters from "./components/InspirationFilters.jsx";
import {
  INSPIRATION_DOMAIN_ORDER,
  INSPIRATION_OBSCURITY_ORDER,
  INSPIRATION_OBSCURITY,
  getInspirationCardMeta,
} from "./inspirations.card-config.js";
import "./inspirations.styles.css";

const ANY_VALUE = "all";
const INSPIRATION_WORKFLOW_ID = "inspiration-archive";
const FILTER_PANEL_TRANSITION_MS = 220;
const STATIC_CONTENT_REGISTRY = getStaticContentRegistry();
const STATIC_CONTENT_PACK_PROVENANCE = getStaticContentPackProvenance();

function uniqueArray(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function getPrimarySourceAnchorId(inspiration) {
  return getSourceAnchorId(
    inspiration?.sourceAnchors?.[0] ||
      inspiration?.inspiration?.anchor ||
      inspiration?.title,
  );
}

function getSourceAnchorMeta(inspiration) {
  const sourceAnchorId = getPrimarySourceAnchorId(inspiration);
  return STATIC_CONTENT_REGISTRY.getSourceAnchor(sourceAnchorId);
}

function getSourceType(inspiration, sourceAnchor = null) {
  return (
    inspiration?.inspiration?.sourceType ||
    inspiration?.sourceTypes?.[0] ||
    sourceAnchor?.type ||
    sourceAnchor?.sourceTypes?.[0] ||
    "Inspiration"
  );
}

function isDossierPendingReview(inspiration = {}) {
  return inspiration.status === "pending-review";
}

function getInspirationTitle(inspiration) {
  return (
    inspiration?.title ||
    inspiration?.label ||
    inspiration?.legacyId ||
    "Untitled Inspiration"
  );
}

function getContentPackLabel(inspiration) {
  return STATIC_CONTENT_PACK_PROVENANCE.getPackLabelForEntry(
    "inspirations",
    inspiration,
  );
}

function getLinkedSystemComponents(inspiration) {
  const sourceAnchorId = getPrimarySourceAnchorId(inspiration);
  if (!sourceAnchorId) return [];
  return STATIC_CONTENT_REGISTRY.getLinkedComponents(sourceAnchorId).sort(
    (left, right) => left.title.localeCompare(right.title),
  );
}

function buildSearchText(card) {
  const {
    inspiration,
    sourceAnchor,
    sourceType,
    meta,
    linkedComponents,
    horror,
  } = card;
  return [
    inspiration.id,
    inspiration.legacyId,
    inspiration.title,
    inspiration.label,
    inspiration.summary,
    inspiration.caption,
    inspiration.narrative,
    inspiration.inspiration?.logic,
    inspiration.editorial?.deck,
    inspiration.editorial?.whatItIs,
    inspiration.editorial?.cruorLens,
    ...(inspiration.editorial?.triggerWarnings || []),
    ...(inspiration.editorial?.tableSafety || []),
    inspiration.editorial?.lowIntensityAlternative,
    ...(inspiration.editorial?.sources || []).flatMap((entry) => [
      entry.title,
      entry.description,
      entry.meta,
    ]),
    ...(inspiration.editorial?.furtherReading || []).flatMap((entry) => [
      entry.title,
      entry.description,
      entry.meta,
    ]),
    ...(inspiration.editorial?.relatedDossiers || []).flatMap((entry) => [
      entry.title,
      entry.relationship,
      entry.description,
    ]),
    inspiration.media?.imageTitle,
    inspiration.media?.imageCredit,
    sourceAnchor?.label,
    sourceAnchor?.summary,
    sourceType,
    meta.domainId,
    meta.obscurityId,
    meta.collectionLabel,
    meta.description,
    ...(inspiration.sourceTypes || []),
    ...(inspiration.themes || []),
    ...(inspiration.motifs || []),
    ...horror,
    ...linkedComponents.map((component) => component.title),
    ...linkedComponents.map((component) => component.summary),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function compareCards(left, right, sortMode) {
  const titleOrder = getInspirationTitle(left.inspiration).localeCompare(
    getInspirationTitle(right.inspiration),
  );

  switch (sortMode) {
    case "az":
      return titleOrder;
    case "za":
      return -titleOrder;
    case "source-type":
      return left.sourceType.localeCompare(right.sourceType) || titleOrder;
    case "components-desc":
      return (
        right.linkedComponents.length - left.linkedComponents.length ||
        titleOrder
      );
    case "collection":
    default:
      return left.meta.number - right.meta.number || titleOrder;
  }
}

export default function InspirationsPage({
  onOpenDarkPlaces,
  onOpenMonsterComposer,
  locale = "en",
} = {}) {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState(ANY_VALUE);
  const [sourceTypeFilter, setSourceTypeFilter] = useState(ANY_VALUE);
  const [obscurityFilter, setObscurityFilter] = useState(ANY_VALUE);
  const [collectionFilter, setCollectionFilter] = useState(ANY_VALUE);
  const [sortMode, setSortMode] = useState("collection");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersMounted, setFiltersMounted] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const filterTriggerRef = useRef(null);
  const [flippedCardId, setFlippedCardId] = useState("");
  const [dossierCardId, setDossierCardId] = useState("");

  const allInspirations = useMemo(
    () =>
      STATIC_CONTENT_REGISTRY.getInspirations({
        workflow: INSPIRATION_WORKFLOW_ID,
        locale,
      }),
    [locale],
  );

  const allCards = useMemo(
    () =>
      allInspirations.map((inspiration, index) => {
        const sourceAnchor = getSourceAnchorMeta(inspiration);
        const sourceType = getSourceType(inspiration, sourceAnchor);
        const linkedComponents = getLinkedSystemComponents(inspiration);
        const horror = uniqueArray([
          ...(inspiration.horror || []),
          ...(sourceAnchor?.horror || []),
        ]);
        const collectionLabel = getContentPackLabel(inspiration);
        const meta = getInspirationCardMeta(inspiration, {
          fallbackNumber: index + 1,
          collectionLabel,
        });
        const card = {
          inspiration,
          sourceAnchor,
          sourceType,
          linkedComponents,
          horror,
          meta,
        };

        return {
          ...card,
          searchText: buildSearchText(card),
        };
      }),
    [allInspirations],
  );

  const domainCounts = useMemo(() => {
    const counts = Object.fromEntries(
      INSPIRATION_DOMAIN_ORDER.map((id) => [id, 0]),
    );
    allCards.forEach((card) => {
      counts[card.meta.domainId] = (counts[card.meta.domainId] || 0) + 1;
    });
    return { ...counts, all: allCards.length };
  }, [allCards]);

  const sourceTypeOptions = useMemo(
    () => [
      {
        value: ANY_VALUE,
        label: t("inspirations.filters.anySourceType", {}, locale),
      },
      ...uniqueArray(allCards.map((card) => card.sourceType))
        .sort((left, right) => left.localeCompare(right))
        .map((sourceType) => ({ value: sourceType, label: sourceType })),
    ],
    [allCards, locale],
  );

  const obscurityOptions = useMemo(
    () => [
      {
        value: ANY_VALUE,
        label: t("inspirations.filters.anyObscurity", {}, locale),
      },
      ...INSPIRATION_OBSCURITY_ORDER.map((obscurityId) => ({
        value: obscurityId,
        label: `${INSPIRATION_OBSCURITY[obscurityId].symbol} ${t(
          INSPIRATION_OBSCURITY[obscurityId].labelKey,
          {},
          locale,
        )}`,
      })),
    ],
    [locale],
  );

  const collectionOptions = useMemo(() => {
    const collections = new Map();
    allCards.forEach((card) => {
      collections.set(card.meta.collectionId, card.meta.collectionLabel);
    });
    return [
      {
        value: ANY_VALUE,
        label: t("inspirations.filters.anyCollection", {}, locale),
      },
      ...[...collections.entries()]
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  }, [allCards, locale]);

  const sortOptions = useMemo(
    () => [
      {
        value: "collection",
        label: t("inspirations.sort.collection", {}, locale),
      },
      { value: "az", label: t("inspirations.sort.az", {}, locale) },
      { value: "za", label: t("inspirations.sort.za", {}, locale) },
      {
        value: "source-type",
        label: t("inspirations.sort.sourceType", {}, locale),
      },
      {
        value: "components-desc",
        label: t("inspirations.sort.components", {}, locale),
      },
    ],
    [locale],
  );

  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allCards
      .filter((card) => {
        if (domainFilter !== ANY_VALUE && card.meta.domainId !== domainFilter)
          return false;
        if (
          sourceTypeFilter !== ANY_VALUE &&
          card.sourceType !== sourceTypeFilter
        )
          return false;
        if (
          obscurityFilter !== ANY_VALUE &&
          card.meta.obscurityId !== obscurityFilter
        )
          return false;
        if (
          collectionFilter !== ANY_VALUE &&
          card.meta.collectionId !== collectionFilter
        )
          return false;
        return !query || card.searchText.includes(query);
      })
      .sort((left, right) => compareCards(left, right, sortMode));
  }, [
    allCards,
    collectionFilter,
    domainFilter,
    obscurityFilter,
    search,
    sortMode,
    sourceTypeFilter,
  ]);

  useEffect(() => {
    if (
      flippedCardId &&
      !filteredCards.some((card) => card.inspiration.id === flippedCardId)
    ) {
      setFlippedCardId("");
    }
  }, [filteredCards, flippedCardId]);

  useEffect(() => {
    let firstFrameId;
    let secondFrameId;

    if (filtersOpen) {
      setFiltersMounted(true);
      firstFrameId = window.requestAnimationFrame(() => {
        secondFrameId = window.requestAnimationFrame(() => {
          setFiltersVisible(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(firstFrameId);
        window.cancelAnimationFrame(secondFrameId);
      };
    }

    setFiltersVisible(false);
    const timeoutId = window.setTimeout(() => {
      setFiltersMounted(false);
    }, FILTER_PANEL_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [filtersOpen]);

  useEffect(() => {
    if (dossierCardId) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") setFlippedCardId("");
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [dossierCardId]);

  const dossierCard = useMemo(
    () =>
      allCards.find((card) => card.inspiration.id === dossierCardId) || null,
    [allCards, dossierCardId],
  );
  const dossierComponents = useMemo(
    () => dossierCard?.linkedComponents || [],
    [dossierCard],
  );
  const dossierRelatedCards = useMemo(() => {
    const references = Array.isArray(
      dossierCard?.inspiration?.editorial?.relatedDossiers,
    )
      ? dossierCard.inspiration.editorial.relatedDossiers
      : [];

    return references
      .map((reference) => {
        const sourceAnchorId = String(reference?.sourceAnchorId || "").trim();
        if (!sourceAnchorId) return null;
        const relatedCard = allCards.find(
          (candidate) =>
            getPrimarySourceAnchorId(candidate.inspiration) === sourceAnchorId,
        );
        if (
          !relatedCard ||
          isDossierPendingReview(relatedCard.inspiration)
        ) {
          return null;
        }
        return { ...relatedCard, sourceAnchorId };
      })
      .filter(Boolean);
  }, [allCards, dossierCard]);
  const canOpenDarkPlaces = Boolean(
    dossierCard?.sourceAnchor && typeof onOpenDarkPlaces === "function",
  );
  const canOpenMonsterComposer = Boolean(
    dossierCard?.sourceAnchor && typeof onOpenMonsterComposer === "function",
  );

  const activeFilterCount = [
    domainFilter !== ANY_VALUE,
    sourceTypeFilter !== ANY_VALUE,
    obscurityFilter !== ANY_VALUE,
    collectionFilter !== ANY_VALUE,
  ].filter(Boolean).length;
  const activeConstraintCount = activeFilterCount + (search.trim() ? 1 : 0);
  const filterPanelLabel = t("inspirations.filters.more", {}, locale);

  const closeFilters = useCallback(() => {
    setFiltersOpen(false);
    filterTriggerRef.current?.focus();
  }, []);
  const closeDossier = useCallback(() => setDossierCardId(""), []);

  const buildDossierSeed = useCallback(() => {
    if (!dossierCard) return null;
    const sourceAnchorId = getPrimarySourceAnchorId(dossierCard.inspiration);
    return {
      sourceAnchorId,
      sourceAnchorIds: uniqueArray([
        sourceAnchorId,
        ...(dossierCard.inspiration.sourceAnchors || []),
      ]),
      sourceAnchorLabel:
        dossierCard.sourceAnchor?.label ||
        getInspirationTitle(dossierCard.inspiration),
      inspirationId: dossierCard.inspiration.id,
      inspirationTitle: getInspirationTitle(dossierCard.inspiration),
    };
  }, [dossierCard]);

  const useInDarkPlaces = useCallback(() => {
    if (!canOpenDarkPlaces) return;
    const seed = buildDossierSeed();
    if (seed) onOpenDarkPlaces(seed);
  }, [buildDossierSeed, canOpenDarkPlaces, onOpenDarkPlaces]);

  const useInMonsterComposer = useCallback(() => {
    if (!canOpenMonsterComposer) return;
    const seed = buildDossierSeed();
    if (seed) onOpenMonsterComposer(seed);
  }, [buildDossierSeed, canOpenMonsterComposer, onOpenMonsterComposer]);

  const openRelatedDossier = useCallback(
    (sourceAnchorId) => {
      const relatedCard = allCards.find(
        (candidate) =>
          getPrimarySourceAnchorId(candidate.inspiration) === sourceAnchorId,
      );
      if (relatedCard && !isDossierPendingReview(relatedCard.inspiration)) {
        setDossierCardId(relatedCard.inspiration.id);
      }
    },
    [allCards],
  );

  function clearFilters() {
    setSearch("");
    setDomainFilter(ANY_VALUE);
    setSourceTypeFilter(ANY_VALUE);
    setObscurityFilter(ANY_VALUE);
    setCollectionFilter(ANY_VALUE);
    setFlippedCardId("");
  }

  return (
    <section
      className="inspirations-page"
      aria-label={t("inspirations.aria", {}, locale)}
    >
      <header className="inspirations-page__masthead">
        <div>
          <p className="inspirations-page__eyebrow">
            {t("inspirations.hero.eyebrow", {}, locale)}
          </p>
          <h1>{t("inspirations.hero.title", {}, locale)}</h1>
          <p className="inspirations-page__intro">
            {t("inspirations.hero.body", {}, locale)}
          </p>
        </div>
        <div className="inspirations-page__archive-summary">
          <strong>{allCards.length}</strong>
          <span>{t("inspirations.hero.cards", {}, locale)}</span>
          <i aria-hidden="true" />
          <strong>{INSPIRATION_DOMAIN_ORDER.length}</strong>
          <span>{t("inspirations.hero.domains", {}, locale)}</span>
          <button
            ref={filterTriggerRef}
            className="inspirations-page__filter-trigger cruor-square-icon-button"
            type="button"
            aria-pressed={filtersOpen}
            aria-expanded={filtersOpen}
            aria-controls="inspirations-filter-panel"
            aria-label={
              activeConstraintCount
                ? `${filterPanelLabel} (${activeConstraintCount})`
                : filterPanelLabel
            }
            title={filterPanelLabel}
            data-key="tooltip-generic"
            data-tooltip={filterPanelLabel}
            onClick={() => {
              if (filtersOpen) {
                closeFilters();
              } else {
                setFiltersOpen(true);
              }
            }}
          >
            <i className="fa-solid fa-sliders" aria-hidden="true" />
            <span className="sr-only">{filterPanelLabel}</span>
            {activeConstraintCount ? (
              <small
                className="inspirations-page__filter-count"
                aria-hidden="true"
              >
                {activeConstraintCount}
              </small>
            ) : null}
          </button>
        </div>
      </header>

      {filtersMounted ? (
        <div
          className={`inspirations-page__filter-disclosure${
            filtersVisible ? " is-visible" : ""
          }`}
          aria-hidden={filtersVisible ? undefined : true}
          inert={filtersVisible ? undefined : ""}
        >
          <div className="inspirations-page__filter-disclosure-inner">
            <InspirationFilters
              active={filtersVisible}
              locale={locale}
              search={search}
              onSearchChange={setSearch}
              domainFilter={domainFilter}
              onDomainChange={setDomainFilter}
              domainCounts={domainCounts}
              sortMode={sortMode}
              onSortChange={setSortMode}
              sortOptions={sortOptions}
              sourceTypeFilter={sourceTypeFilter}
              onSourceTypeChange={setSourceTypeFilter}
              sourceTypeOptions={sourceTypeOptions}
              obscurityFilter={obscurityFilter}
              onObscurityChange={setObscurityFilter}
              obscurityOptions={obscurityOptions}
              collectionFilter={collectionFilter}
              onCollectionChange={setCollectionFilter}
              collectionOptions={collectionOptions}
              activeFilterCount={activeFilterCount}
              onClearFilters={clearFilters}
              onClose={closeFilters}
            />
          </div>
        </div>
      ) : null}

      {filteredCards.length ? (
        <InspirationCardGrid
          cards={filteredCards}
          flippedCardId={flippedCardId}
          onToggleCard={(cardId) =>
            setFlippedCardId((current) => (current === cardId ? "" : cardId))
          }
          onOpenDossier={(cardId) => {
            const card = allCards.find(
              (candidate) => candidate.inspiration.id === cardId,
            );
            if (!card || isDossierPendingReview(card.inspiration)) return;
            setDossierCardId(cardId);
          }}
          locale={locale}
        />
      ) : (
        <div className="inspirations-page__empty">
          <i className="fa-solid fa-layer-group" aria-hidden="true" />
          <h2>{t("inspirations.empty.title", {}, locale)}</h2>
          <p>{t("inspirations.empty.body", {}, locale)}</p>
          <button type="button" onClick={clearFilters}>
            {t("inspirations.filters.clear", {}, locale)}
          </button>
        </div>
      )}

      {dossierCard ? (
        <InspirationDossierModal
          card={dossierCard}
          linkedComponents={dossierComponents}
          relatedCards={dossierRelatedCards}
          canOpenDarkPlaces={canOpenDarkPlaces}
          canOpenMonsterComposer={canOpenMonsterComposer}
          onUseDarkPlaces={useInDarkPlaces}
          onUseMonsterComposer={useInMonsterComposer}
          onOpenRelatedDossier={openRelatedDossier}
          onClose={closeDossier}
          locale={locale}
        />
      ) : null}
    </section>
  );
}
