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
import CreatorStudioPage from "../features/creator-studio/creator-studio.index.js";
import LoginPage, {
  AUTH_PATHS,
  authenticateCredentials,
  canAccessContentStudio,
  canAccessCreatorStudio,
  canUseDebugMode,
  clearAuthSession,
  normalizeAuthReturnPath,
  readAuthSession,
  saveAuthSession,
} from "../features/auth/auth.index.js";
import MonsterComposerPage from "../features/monster-composer/monster-composer.index.js";
import { createMapRequestFromDarkenLocationState } from "../features/darken-location/darken-location.map-request.js";
import { getCurrentLocale, setCurrentLocale, t } from "../shared/i18n/index.js";
import { runSitePageTransition } from "./site-page-transition.js";

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
  login: AUTH_PATHS.LOGIN,
  creatorStudio: AUTH_PATHS.CREATOR_STUDIO,
  contentStudio: AUTH_PATHS.CONTENT_STUDIO,
  creatorOperations: AUTH_PATHS.OPERATIONS,
  creatorPublishing: AUTH_PATHS.PUBLISHING,
  legacyContentStudio: AUTH_PATHS.LEGACY_CONTENT_STUDIO,
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

  if (pathname === CRUOR_ROUTES.login) {
    return {
      section: "login",
      crucibleGenerator: "darken",
      darkenTab: "composer",
      returnTo: normalizeAuthReturnPath(params.get("returnTo")),
    };
  }

  if (pathname === CRUOR_ROUTES.creatorStudio) {
    return {
      section: "creator-studio",
      creatorStudioView: "home",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (pathname === CRUOR_ROUTES.creatorOperations) {
    return {
      section: "creator-studio",
      creatorStudioView: "operations",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (pathname === CRUOR_ROUTES.creatorPublishing) {
    return {
      section: "creator-studio",
      creatorStudioView: "publishing",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (
    pathname === CRUOR_ROUTES.contentStudio ||
    pathname === CRUOR_ROUTES.legacyContentStudio
  ) {
    return {
      section: "creator-studio",
      creatorStudioView: "content",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    };
  }

  if (params.get("studio") === "1" || params.get("admin") === "studio") {
    return {
      section: "creator-studio",
      creatorStudioView: "content",
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

function getAuthorizedRoute(route, session) {
  if (route.section === "creator-studio") {
    const requestedView =
      route.creatorStudioView === "content"
        ? "content"
        : route.creatorStudioView === "operations"
          ? "operations"
          : route.creatorStudioView === "publishing"
            ? "publishing"
            : "home";
    const canAccessRequestedView =
      requestedView === "content"
        ? canAccessContentStudio(session)
        : canAccessCreatorStudio(session);

    if (!canAccessRequestedView) {
      return {
        section: "login",
        creatorStudioView: requestedView,
        crucibleGenerator: route.crucibleGenerator || "darken",
        darkenTab: route.darkenTab || "composer",
        returnTo:
          requestedView === "content"
            ? CRUOR_ROUTES.contentStudio
            : requestedView === "operations"
              ? CRUOR_ROUTES.creatorOperations
              : requestedView === "publishing"
                ? CRUOR_ROUTES.creatorPublishing
                : CRUOR_ROUTES.creatorStudio,
      };
    }
  }

  if (route.section === "login") {
    const returnTo = normalizeAuthReturnPath(route.returnTo);
    const canOpenContent =
      returnTo === CRUOR_ROUTES.contentStudio && canAccessContentStudio(session);
    const canOpenOperations =
      returnTo === CRUOR_ROUTES.creatorOperations && canAccessCreatorStudio(session);
    const canOpenPublishing =
      returnTo === CRUOR_ROUTES.creatorPublishing && canAccessCreatorStudio(session);
    const canOpenCreatorHome =
      returnTo !== CRUOR_ROUTES.contentStudio &&
      returnTo !== CRUOR_ROUTES.creatorOperations &&
      returnTo !== CRUOR_ROUTES.creatorPublishing &&
      canAccessCreatorStudio(session);

    if (canOpenContent || canOpenOperations || canOpenPublishing || canOpenCreatorHome) {
      return {
        section: "creator-studio",
        creatorStudioView: canOpenContent
          ? "content"
          : canOpenOperations
            ? "operations"
            : canOpenPublishing
              ? "publishing"
              : "home",
        crucibleGenerator: route.crucibleGenerator || "darken",
        darkenTab: route.darkenTab || "composer",
      };
    }
  }

  return route;
}

function readInitialRouterState() {
  const authSession = readAuthSession();
  const route = getAuthorizedRoute(
    getCruorRouteFromLocation(),
    authSession,
  );

  return { authSession, route };
}

function getRoutePath(route) {
  if (route.section === "login") {
    const returnTo = normalizeAuthReturnPath(route.returnTo);
    return returnTo
      ? `${CRUOR_ROUTES.login}?returnTo=${encodeURIComponent(returnTo)}`
      : CRUOR_ROUTES.login;
  }

  if (route.section === "inspirations") return CRUOR_ROUTES.inspirations;
  if (route.section === "creator-studio") {
    return route.creatorStudioView === "content"
      ? CRUOR_ROUTES.contentStudio
      : route.creatorStudioView === "operations"
        ? CRUOR_ROUTES.creatorOperations
        : route.creatorStudioView === "publishing"
          ? CRUOR_ROUTES.creatorPublishing
          : CRUOR_ROUTES.creatorStudio;
  }

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
  const initialRouterStateRef = useRef(null);

  if (!initialRouterStateRef.current) {
    initialRouterStateRef.current = readInitialRouterState();
  }

  const initialRoute = initialRouterStateRef.current.route;
  const [authSession, setAuthSession] = useState(
    initialRouterStateRef.current.authSession,
  );
  const [activeSection, setActiveSection] = useState(initialRoute.section);
  const [activeUiMode, setActiveUiMode] = useState("simple");
  const [activeLocale, setActiveLocaleState] = useState(getCurrentLocale);
  const [activeCrucibleGenerator, setActiveCrucibleGenerator] = useState(
    initialRoute.crucibleGenerator,
  );
  const [activeDarkenTab, setActiveDarkenTab] = useState(
    initialRoute.darkenTab,
  );
  const [loginReturnTo, setLoginReturnTo] = useState(
    initialRoute.returnTo || "",
  );
  const [activeCreatorStudioView, setActiveCreatorStudioView] = useState(
    initialRoute.creatorStudioView === "content"
      ? "content"
      : initialRoute.creatorStudioView === "operations"
        ? "operations"
        : initialRoute.creatorStudioView === "publishing"
          ? "publishing"
          : "home",
  );
  const [hasOpenedMapGenerator, setHasOpenedMapGenerator] = useState(() => {
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
  const userCanAccessStudio = canAccessCreatorStudio(authSession);
  const userCanUseDebug = canUseDebugMode(authSession);

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
    setActiveCreatorStudioView(
      route.creatorStudioView === "content"
        ? "content"
        : route.creatorStudioView === "operations"
          ? "operations"
          : route.creatorStudioView === "publishing"
            ? "publishing"
            : "home",
    );
    setLoginReturnTo(route.returnTo || "");

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
      const { sessionOverride = authSession, ...historyOptions } = options;
      const authorizedRoute = getAuthorizedRoute(route, sessionOverride);
      const nextPath = getRoutePath(authorizedRoute);
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (currentPath === nextPath) {
        syncStateFromRoute(authorizedRoute);
        return;
      }

      runSitePageTransition(() => {
        writeRouteToHistory(authorizedRoute, historyOptions);
        syncStateFromRoute(authorizedRoute);
      });
    },
    [authSession, syncStateFromRoute],
  );

  const activateSection = useCallback(
    (sectionId) => {
      const nextSection =
        sectionId === "inspirations" ||
        sectionId === "creator-studio" ||
        sectionId === "login"
          ? sectionId
          : "home";

      navigateToRoute({
        section: nextSection,
        creatorStudioView: nextSection === "creator-studio" ? "home" : undefined,
        crucibleGenerator: activeCrucibleGenerator,
        darkenTab: activeDarkenTab,
      });
    },
    [activeCrucibleGenerator, activeDarkenTab, navigateToRoute],
  );

  useEffect(() => {
    function handlePopState() {
      const route = getAuthorizedRoute(
        getCruorRouteFromLocation(),
        authSession,
      );
      const expectedPath = getRoutePath(route);
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      runSitePageTransition(() => {
        if (currentPath !== expectedPath) {
          writeRouteToHistory(route, { replace: true });
        }
        syncStateFromRoute(route);
      });
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [authSession, syncStateFromRoute]);

  useEffect(() => {
    const initialAuthorizedRoute = initialRouterStateRef.current.route;
    writeRouteToHistory(initialAuthorizedRoute, { replace: true });
  }, []);

  useEffect(() => {
    if (activeUiMode === "debug" && !userCanUseDebug) {
      setActiveUiMode("simple");
    }
  }, [activeUiMode, userCanUseDebug]);

  const createMapRequestFromSnapshot = useCallback(
    (snapshot) => createMapRequestFromDarkenLocationState(snapshot),
    [],
  );

  const initializeMapRequest = useCallback(
    (snapshot) => {
      try {
        const nextRequest = createMapRequestFromSnapshot(snapshot);
        setMapRequest((currentRequest) => currentRequest || nextRequest);
        return true;
      } catch (error) {
        window.alert(error instanceof Error ? error.message : String(error));
        return false;
      }
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
    let nextRequest;
    try {
      nextRequest = createMapRequestFromSnapshot(snapshot);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : String(error));
      return;
    }
    setMapRequest(nextRequest);
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
      if (!initializeMapRequest(snapshot)) return;
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
        if (!initializeMapRequest(snapshot)) return;
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

  const openDarkPlacesFromInspiration = useCallback(() => {
    navigateToRoute({
      section: "crucible",
      crucibleGenerator: "darken",
      darkenTab: "composer",
    });
  }, [navigateToRoute]);

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

  const openCreatorStudioView = useCallback(
    (viewId) => {
      navigateToRoute({
        section: "creator-studio",
        creatorStudioView:
          viewId === "content"
            ? "content"
            : viewId === "operations"
              ? "operations"
              : viewId === "publishing"
                ? "publishing"
                : "home",
        crucibleGenerator: activeCrucibleGenerator,
        darkenTab: activeDarkenTab,
      });
    },
    [activeCrucibleGenerator, activeDarkenTab, navigateToRoute],
  );

  const exitCreatorStudio = useCallback(() => {
    navigateToRoute({
      section: "home",
      crucibleGenerator: activeCrucibleGenerator,
      darkenTab: activeDarkenTab,
    });
  }, [activeCrucibleGenerator, activeDarkenTab, navigateToRoute]);

  const handleUiModeChange = useCallback(
    (modeId) => {
      if (modeId === "debug" && !userCanUseDebug) return;
      setActiveUiMode(
        modeId === "advanced" || modeId === "debug" ? modeId : "simple",
      );
    },
    [userCanUseDebug],
  );

  const openLogin = useCallback(() => {
    navigateToRoute({
      section: "login",
      crucibleGenerator: activeCrucibleGenerator,
      darkenTab: activeDarkenTab,
      returnTo: "",
    });
  }, [activeCrucibleGenerator, activeDarkenTab, navigateToRoute]);

  const login = useCallback(
    async (credentials) => {
      const result = await authenticateCredentials(credentials);
      if (!result.ok) return result;

      saveAuthSession(result.session);
      setAuthSession(result.session);

      const returnTo = normalizeAuthReturnPath(loginReturnTo);
      const destination = {
        section: "creator-studio",
        creatorStudioView:
          returnTo === CRUOR_ROUTES.contentStudio
            ? "content"
            : returnTo === CRUOR_ROUTES.creatorOperations
              ? "operations"
              : returnTo === CRUOR_ROUTES.creatorPublishing
                ? "publishing"
                : "home",
        crucibleGenerator: activeCrucibleGenerator,
        darkenTab: activeDarkenTab,
      };

      navigateToRoute(destination, {
        replace: true,
        sessionOverride: result.session,
      });

      return result;
    },
    [
      activeCrucibleGenerator,
      activeDarkenTab,
      loginReturnTo,
      navigateToRoute,
    ],
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthSession(null);
    setActiveUiMode("simple");

    if (activeSection === "creator-studio") {
      navigateToRoute(
        {
          section: "home",
          crucibleGenerator: activeCrucibleGenerator,
          darkenTab: activeDarkenTab,
        },
        { replace: true, sessionOverride: null },
      );
    }
  }, [
    activeCrucibleGenerator,
    activeDarkenTab,
    activeSection,
    navigateToRoute,
  ]);

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
                  initialManualOverrides={mapRequest?.manualOverrides || null}
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
      onUiModeChange={handleUiModeChange}
      onOpenCrucibleTool={openCrucibleTool}
      authSession={authSession}
      canAccessStudio={userCanAccessStudio}
      canUseDebug={userCanUseDebug}
      onLoginRequest={openLogin}
      onLogout={logout}
      homeContent={homeContent}
      crucibleContent={crucibleContent}
      inspirationsContent={
        <InspirationsPage
          locale={activeLocale}
          onOpenDarkPlaces={openDarkPlacesFromInspiration}
          onOpenMonsterComposer={openMonsterFromInspiration}
        />
      }
      creatorStudioContent={
        <CreatorStudioPage
          activeView={activeCreatorStudioView}
          authSession={authSession}
          onExit={exitCreatorStudio}
          onLogout={logout}
          onViewChange={openCreatorStudioView}
        />
      }
      loginContent={
        <LoginPage
          locale={activeLocale}
          onLogin={login}
          onCancel={() => activateSection("home")}
        />
      }
    />
  );
}
