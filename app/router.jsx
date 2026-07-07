import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  () =>
    import("../features/darken-location/map-generator/map-generator.index.js"),
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

const CRUOR_ROUTES = {
  home: "/",
  darkPlaces: "/darkplaces",
  darkPlacesMap: "/darkplaces/map",
  terrifyingMonsters: "/terrifyingmonsters",
  inspirations: "/inspirations",
  inspirationStudio: "/inspiration-studio",
};

function normalizeRoutePath(pathname = "/") {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return normalizedPath.toLowerCase();
}

function getCruorRouteFromLocation(
  location = typeof window !== "undefined" ? window.location : undefined,
) {
  const pathname = normalizeRoutePath(location?.pathname || "/");
  const params = new URLSearchParams(location?.search || "");

  if (pathname === CRUOR_ROUTES.darkPlacesMap) {
    return {
      section: "crucible",
      crucibleGenerator: "darken",
      darkenTab: "map-generator",
    };
  }

  if (pathname === CRUOR_ROUTES.darkPlaces) {
    return {
      section: "crucible",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (pathname === CRUOR_ROUTES.terrifyingMonsters) {
    return {
      section: "crucible",
      crucibleGenerator: "monster",
      darkenTab: "composer",
    };
  }

  if (pathname === CRUOR_ROUTES.inspirations) {
    return {
      section: "inspirations",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (pathname === CRUOR_ROUTES.inspirationStudio) {
    return {
      section: "inspiration-studio",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (params.get("studio") === "1" || params.get("admin") === "studio") {
    return {
      section: "inspiration-studio",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (params.get("section") === "inspirations") {
    return {
      section: "inspirations",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (
    params.get("section") === "crucible" ||
    params.get("tool") ||
    params.get("generator")
  ) {
    const generator = params.get("generator") || params.get("tool");
    const view = params.get("view") || params.get("darkenView");

    return {
      section: "crucible",
      crucibleGenerator: generator === "monster" ? "monster" : "darken",
      darkenTab:
        view === "map" || view === "map-generator"
          ? "map-generator"
          : "composer",
    };
  }

  if (
    params.get("cruorTest") === "dark-places" ||
    params.get("testHarness") === "dark-places"
  ) {
    return {
      section: "crucible",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  return {
    section: "home",
    crucibleGenerator: "darken",
    darkenTab: "composer",
  };
}

function getRoutePath(route) {
  if (route.section === "inspirations") return CRUOR_ROUTES.inspirations;
  if (route.section === "inspiration-studio")
    return CRUOR_ROUTES.inspirationStudio;

  if (route.section === "crucible") {
    if (route.crucibleGenerator === "monster")
      return CRUOR_ROUTES.terrifyingMonsters;
    if (route.darkenTab === "map-generator") return CRUOR_ROUTES.darkPlacesMap;
    return CRUOR_ROUTES.darkPlaces;
  }

  return CRUOR_ROUTES.home;
}

function writeRouteToHistory(route, { replace = false } = {}) {
  if (typeof window === "undefined") return;

  const nextPath = getRoutePath(route);
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (currentPath === nextPath) return;

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ cruorRoute: route }, "", nextPath);
}

export default function AppRouter() {
  const [activeSection, setActiveSection] = useState(
    () => getCruorRouteFromLocation().section,
  );
  const [activeUiMode, setActiveUiMode] = useState("simple");
  const [activeLocale, setActiveLocaleState] = useState(getCurrentLocale);
  const [activeCrucibleGenerator, setActiveCrucibleGenerator] = useState(
    () => getCruorRouteFromLocation().crucibleGenerator,
  );
  const [activeDarkenTab, setActiveDarkenTab] = useState(
    () => getCruorRouteFromLocation().darkenTab,
  );
  const [hasOpenedMapGenerator, setHasOpenedMapGenerator] = useState(() => {
    const initialRoute = getCruorRouteFromLocation();
    return (
      initialRoute.section === "crucible" &&
      initialRoute.crucibleGenerator === "darken" &&
      initialRoute.darkenTab === "map-generator"
    );
  });
  const [mapRequest, setMapRequest] = useState(null);
  const [mapRequestRevision, setMapRequestRevision] = useState(0);
  const [monsterInspirationSeed, setMonsterInspirationSeed] = useState(null);
  const darkenSnapshotProviderRef = useRef(null);

  const crucibleGenerators = useMemo(
    () => buildCrucibleGenerators(activeLocale),
    [activeLocale],
  );
  const darkenViews = useMemo(
    () => buildDarkenViews(activeLocale),
    [activeLocale],
  );
  const monsterViews = useMemo(
    () => buildMonsterViews(activeLocale),
    [activeLocale],
  );

  const handleLocaleChange = useCallback((locale) => {
    const normalizedLocale = setCurrentLocale(locale);
    setActiveLocaleState(normalizedLocale);
  }, []);

  useEffect(() => {
    setCurrentLocale(activeLocale);
  }, [activeLocale]);

  const syncStateFromRoute = useCallback((route) => {
    setActiveSection(route.section);
    setActiveCrucibleGenerator(route.crucibleGenerator);
    setActiveDarkenTab(route.darkenTab);

    if (
      route.section === "crucible" &&
      route.crucibleGenerator === "darken" &&
      route.darkenTab === "map-generator"
    ) {
      setHasOpenedMapGenerator(true);
    }
  }, []);

  const navigateToRoute = useCallback(
    (route, options = {}) => {
      writeRouteToHistory(route, options);
      syncStateFromRoute(route);
    },
    [syncStateFromRoute],
  );

  const activateSection = useCallback(
    (sectionId) => {
      const nextSection =
        sectionId === "inspirations" || sectionId === "inspiration-studio"
          ? sectionId
          : "home";

      navigateToRoute({
        section: nextSection,
        crucibleGenerator: activeCrucibleGenerator,
        darkenTab: activeDarkenTab,
      });
    },
    [activeCrucibleGenerator, activeDarkenTab, navigateToRoute],
  );

  useEffect(() => {
    function handlePopState() {
      syncStateFromRoute(getCruorRouteFromLocation());
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [syncStateFromRoute]);

  const createMapRequestFromSnapshot = useCallback(
    (snapshot) => createMapRequestFromDarkenLocationState(snapshot),
    [],
  );

  const initializeMapRequest = useCallback(
    (snapshot) => {
      setMapRequest(
        (currentRequest) =>
          currentRequest || createMapRequestFromSnapshot(snapshot),
      );
    },
    [createMapRequestFromSnapshot],
  );

  const refreshMapFromComposer = useCallback(() => {
    if (hasOpenedMapGenerator) {
      const confirmed = window.confirm(
        t("crucible.messages.refreshMapConfirm", {}, activeLocale),
      );
      if (!confirmed) return;
    }

    const snapshot = darkenSnapshotProviderRef.current?.();
    setMapRequest(createMapRequestFromSnapshot(snapshot));
    setMapRequestRevision((value) => value + 1);
    navigateToRoute({
      section: "crucible",
      crucibleGenerator: "darken",
      darkenTab: "map-generator",
    });
  }, [
    activeLocale,
    createMapRequestFromSnapshot,
    hasOpenedMapGenerator,
    navigateToRoute,
  ]);

  const openMapGenerator = useCallback(
    (snapshot) => {
      initializeMapRequest(snapshot);
      navigateToRoute({
        section: "crucible",
        crucibleGenerator: "darken",
        darkenTab: "map-generator",
      });
    },
    [initializeMapRequest, navigateToRoute],
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

      navigateToRoute({
        section: "crucible",
        crucibleGenerator: "darken",
        darkenTab: tabId === "map-generator" ? "map-generator" : "composer",
      });
    },
    [hasOpenedMapGenerator, initializeMapRequest, navigateToRoute],
  );

  const activateCrucibleGenerator = useCallback(
    (generatorId) => {
      navigateToRoute({
        section: "crucible",
        crucibleGenerator: generatorId === "monster" ? "monster" : "darken",
        darkenTab: "composer",
      });
    },
    [navigateToRoute],
  );

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

  const openMonsterFromInspiration = useCallback(
    (seed = {}) => {
      setMonsterInspirationSeed({
        ...seed,
        revision: Date.now(),
      });
      navigateToRoute({
        section: "crucible",
        crucibleGenerator: "monster",
        darkenTab: "composer",
      });
    },
    [navigateToRoute],
  );

  const homeContent = (
    <HomePage
      onOpenCrucibleTool={openCrucibleTool}
      onOpenInspirations={() => activateSection("inspirations")}
    />
  );

  const crucibleContent = (
    <section
      className={
        activeCrucibleGenerator === "darken" &&
        activeDarkenTab === "map-generator"
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
        activeViewId={
          activeCrucibleGenerator === "darken" ? activeDarkenTab : "composer"
        }
        generators={crucibleGenerators}
        onGeneratorChange={activateCrucibleGenerator}
        onViewChange={
          activeCrucibleGenerator === "darken" ? activateDarkenTab : undefined
        }
        views={
          activeCrucibleGenerator === "darken" ? darkenViews : monsterViews
        }
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
              debugMode={activeUiMode === "debug"}
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
              <Suspense
                fallback={
                  <div className="status">
                    {t("app.labels.loadingMapGenerator", {}, activeLocale)}
                  </div>
                }
              >
                <CruorMapGeneratorMvp
                  key={mapRequestRevision}
                  initialRequest={mapRequest}
                  onRefreshFromComposer={refreshMapFromComposer}
                  debugMode={activeUiMode === "debug"}
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
          <MonsterComposerPage
            uiMode={activeUiMode}
            inspirationSeed={monsterInspirationSeed}
            locale={activeLocale}
          />
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
      onSectionChange={activateSection}
      onUiModeChange={setActiveUiMode}
      onOpenCrucibleTool={openCrucibleTool}
      homeContent={homeContent}
      crucibleContent={crucibleContent}
      inspirationsContent={
        <InspirationsPage onOpenMonsterComposer={openMonsterFromInspiration} />
      }
      inspirationStudioContent={<InspirationStudioPage />}
    />
  );
}
