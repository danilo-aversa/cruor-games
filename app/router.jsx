import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "./AppShell.jsx";
import HomePage from "./HomePage.jsx";
import CrucibleTopbar from "../features/crucible/components/CrucibleTopbar.jsx";
import DarkenLocationComposerPage from "../features/darken-location/composer/darken-location-composer.index.js";
import InspirationsPage from "../features/inspirations/inspirations.index.js";
import InspirationStudioPage from "../features/inspiration-studio/inspiration-studio.index.js";
import MonsterComposerPage from "../features/monster-composer/monster-composer.index.js";
import { createMapRequestFromDarkenLocationState } from "../features/darken-location/darken-location.map-request.js";
import { getCurrentLocale, setCurrentLocale, t } from "../shared/i18n/index.js";

const CruorMapGeneratorMvp = lazy(
  () => import("../features/darken-location/map-generator/map-generator.index.js"),
);

function buildCrucibleGenerators(locale) {
  return [
    {
      id: "darken",
      label: t("crucible.generators.darken", {}, locale),
      icon: "fa-solid fa-location-dot",
      tooltip: t("crucible.generators.darken", {}, locale),
    },
    {
      id: "monster",
      label: t("crucible.generators.monster", {}, locale),
      icon: "fa-solid fa-skull",
      tooltip: t("crucible.generators.monster", {}, locale),
    },
  ];
}

function buildDarkenViews(locale) {
  return [
    {
      id: "composer",
      label: t("crucible.views.composer", {}, locale),
      icon: "fa-solid fa-wand-magic-sparkles",
      tooltip: t("crucible.views.composer", {}, locale),
      panelId: "darkenComposerPanel",
    },
    {
      id: "map-generator",
      label: t("crucible.views.map", {}, locale),
      icon: "fa-solid fa-map",
      tooltip: t("crucible.views.map", {}, locale),
      panelId: "darkenMapGeneratorPanel",
    },
  ];
}

function buildMonsterViews(locale) {
  return [
    {
      id: "composer",
      label: t("crucible.views.monsterComposer", {}, locale),
      icon: "fa-solid fa-dna",
      tooltip: t("crucible.views.monsterComposer", {}, locale),
      panelId: "monsterComposerPanel",
    },
  ];
}


function getInitialSearchParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function isDarkPlacesTestHarness(params = getInitialSearchParams()) {
  return (
    params.get("cruorTest") === "dark-places" ||
    params.get("testHarness") === "dark-places" ||
    params.get("section") === "crucible" ||
    params.get("tool") === "darken"
  );
}

function getInitialSection() {
  const params = getInitialSearchParams();
  if (params.get("studio") === "1" || params.get("admin") === "studio") return "inspiration-studio";
  if (isDarkPlacesTestHarness(params)) return "crucible";
  return "home";
}

function getInitialCrucibleGenerator() {
  const params = getInitialSearchParams();
  const generator = params.get("generator") || params.get("tool");
  return generator === "monster" ? "monster" : "darken";
}

function getInitialDarkenTab() {
  const params = getInitialSearchParams();
  const view = params.get("view") || params.get("darkenView");
  return view === "map" || view === "map-generator" ? "map-generator" : "composer";
}

function getInitialMapGeneratorOpened() {
  return getInitialSection() === "crucible" && getInitialCrucibleGenerator() === "darken" && getInitialDarkenTab() === "map-generator";
}

export default function AppRouter() {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [activeUiMode, setActiveUiMode] = useState("simple");
  const [activeLocale, setActiveLocaleState] = useState(getCurrentLocale);
  const [activeCrucibleGenerator, setActiveCrucibleGenerator] = useState(getInitialCrucibleGenerator);
  const [activeDarkenTab, setActiveDarkenTab] = useState(getInitialDarkenTab);
  const [hasOpenedMapGenerator, setHasOpenedMapGenerator] = useState(getInitialMapGeneratorOpened);
  const [mapRequest, setMapRequest] = useState(null);
  const [mapRequestRevision, setMapRequestRevision] = useState(0);
  const [monsterInspirationSeed, setMonsterInspirationSeed] = useState(null);
  const darkenSnapshotProviderRef = useRef(null);

  const crucibleGenerators = useMemo(() => buildCrucibleGenerators(activeLocale), [activeLocale]);
  const darkenViews = useMemo(() => buildDarkenViews(activeLocale), [activeLocale]);
  const monsterViews = useMemo(() => buildMonsterViews(activeLocale), [activeLocale]);

  const handleLocaleChange = useCallback((locale) => {
    const normalizedLocale = setCurrentLocale(locale);
    setActiveLocaleState(normalizedLocale);
  }, []);

  useEffect(() => {
    setCurrentLocale(activeLocale);
  }, [activeLocale]);


  const createMapRequestFromSnapshot = useCallback(
    (snapshot) => createMapRequestFromDarkenLocationState(snapshot),
    [],
  );

  const initializeMapRequest = useCallback(
    (snapshot) => {
      setMapRequest((currentRequest) => currentRequest || createMapRequestFromSnapshot(snapshot));
    },
    [createMapRequestFromSnapshot],
  );

  const refreshMapFromComposer = useCallback(() => {
    if (hasOpenedMapGenerator) {
      const confirmed = window.confirm(t("crucible.messages.refreshMapConfirm", {}, activeLocale));
      if (!confirmed) return;
    }

    const snapshot = darkenSnapshotProviderRef.current?.();
    setMapRequest(createMapRequestFromSnapshot(snapshot));
    setMapRequestRevision((value) => value + 1);
    setHasOpenedMapGenerator(true);
    setActiveCrucibleGenerator("darken");
    setActiveDarkenTab("map-generator");
    setActiveSection("crucible");
  }, [activeLocale, createMapRequestFromSnapshot, hasOpenedMapGenerator]);

  const openMapGenerator = useCallback(
    (snapshot) => {
      initializeMapRequest(snapshot);
      setHasOpenedMapGenerator(true);
      setActiveCrucibleGenerator("darken");
      setActiveDarkenTab("map-generator");
      setActiveSection("crucible");
    },
    [initializeMapRequest],
  );

  const setDarkenSnapshotProvider = useCallback((provider) => {
    darkenSnapshotProviderRef.current = provider;
  }, []);

  const activateDarkenTab = useCallback(
    (tabId) => {
      if (tabId === "map-generator" && !hasOpenedMapGenerator) {
        const snapshot = darkenSnapshotProviderRef.current?.();
        initializeMapRequest(snapshot);
        setHasOpenedMapGenerator(true);
      }

      setActiveSection("crucible");
      setActiveCrucibleGenerator("darken");
      setActiveDarkenTab(tabId);
    },
    [hasOpenedMapGenerator, initializeMapRequest],
  );

  const activateCrucibleGenerator = useCallback((generatorId) => {
    setActiveSection("crucible");
    setActiveCrucibleGenerator(generatorId);

    if (generatorId === "darken") {
      setActiveDarkenTab("composer");
    }
  }, []);

  const openCrucibleTool = useCallback(
    (generatorId, viewId) => {
      if (generatorId === "darken" && viewId) {
        activateDarkenTab(viewId);
        return;
      }

      activateCrucibleGenerator(generatorId);
    },
    [activateCrucibleGenerator, activateDarkenTab],
  );

  const openMonsterFromInspiration = useCallback((seed = {}) => {
    setMonsterInspirationSeed({
      ...seed,
      revision: Date.now(),
    });
    setActiveSection("crucible");
    setActiveCrucibleGenerator("monster");
  }, []);

  const homeContent = (
    <HomePage
      onOpenCrucibleTool={openCrucibleTool}
      onOpenInspirations={() => setActiveSection("inspirations")}
    />
  );

  const crucibleContent = (
    <section
      className={
        activeCrucibleGenerator === "darken" && activeDarkenTab === "map-generator"
          ? "darken-workspace crucible-workspace is-map-tab"
          : activeCrucibleGenerator === "darken"
            ? "darken-workspace crucible-workspace"
            : "monster-crucible-workspace crucible-workspace"
      }
      aria-label={t("app.aria.crucibleWorkspace", {}, activeLocale)}
      data-active-generator={activeCrucibleGenerator}
    >
      <CrucibleTopbar
        activeGeneratorId={activeCrucibleGenerator}
        activeViewId={activeCrucibleGenerator === "darken" ? activeDarkenTab : "composer"}
        generators={crucibleGenerators}
        onGeneratorChange={activateCrucibleGenerator}
        onViewChange={activeCrucibleGenerator === "darken" ? activateDarkenTab : undefined}
        views={activeCrucibleGenerator === "darken" ? darkenViews : monsterViews}
      />

      {activeCrucibleGenerator === "darken" ? (
        <>
          <div
            id="darkenComposerPanel"
            role="tabpanel"
            aria-labelledby="crucibleViewTab-darken-composer"
            hidden={activeDarkenTab !== "composer"}
          >
            <DarkenLocationComposerPage
              uiMode={activeUiMode}
              onOpenMapGenerator={openMapGenerator}
              onSnapshotProviderReady={setDarkenSnapshotProvider}
            />
          </div>

          {hasOpenedMapGenerator ? (
            <section
              id="darkenMapGeneratorPanel"
              className="map-generator-view"
              role="tabpanel"
              aria-labelledby="crucibleViewTab-darken-map-generator"
              hidden={activeDarkenTab !== "map-generator"}
            >
              <Suspense fallback={<div className="status">{t("app.labels.loadingMapGenerator", {}, activeLocale)}</div>}>
                <CruorMapGeneratorMvp
                  key={mapRequestRevision}
                  initialRequest={mapRequest}
                  onRefreshFromComposer={refreshMapFromComposer}
                />
              </Suspense>
            </section>
          ) : null}
        </>
      ) : (
        <section
          id="monsterComposerPanel"
          role="tabpanel"
          aria-labelledby="crucibleViewTab-monster-composer"
        >
          <MonsterComposerPage uiMode={activeUiMode} inspirationSeed={monsterInspirationSeed} locale={activeLocale} />
        </section>
      )}
    </section>
  );

  return (
    <AppShell
      activeSection={activeSection}
      activeUiMode={activeUiMode}
      activeCrucibleGenerator={activeCrucibleGenerator}
      activeLocale={activeLocale}
      onLocaleChange={handleLocaleChange}
      onSectionChange={setActiveSection}
      onUiModeChange={setActiveUiMode}
      onOpenCrucibleTool={openCrucibleTool}
      homeContent={homeContent}
      crucibleContent={crucibleContent}
      inspirationsContent={<InspirationsPage onOpenMonsterComposer={openMonsterFromInspiration} />}
      inspirationStudioContent={<InspirationStudioPage />}
    />
  );
}
