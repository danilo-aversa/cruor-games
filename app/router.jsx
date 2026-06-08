import { lazy, Suspense, useCallback, useRef, useState } from "react";
import AppShell from "./AppShell.jsx";
import HomePage from "./HomePage.jsx";
import CrucibleTopbar from "../features/crucible/components/CrucibleTopbar.jsx";
import DarkenLocationComposerPage from "../features/darken-location/composer/darken-location-composer.index.js";
import InspirationsPage from "../features/inspirations/inspirations.index.js";
import InspirationStudioPage from "../features/inspiration-studio/inspiration-studio.index.js";
import MonsterComposerPage from "../features/monster-composer/monster-composer.index.js";
import { createMapRequestFromDarkenLocationState } from "../features/darken-location/darken-location.map-request.js";

const CruorMapGeneratorMvp = lazy(
  () => import("../features/darken-location/map-generator/map-generator.index.js")
);

const CRUCIBLE_GENERATORS = [
  {
    id: "darken",
    label: "Darken a Location",
    icon: "fa-solid fa-location-dot",
    tooltip: "Darken a Location",
  },
  {
    id: "monster",
    label: "Build a Monster",
    icon: "fa-solid fa-skull",
    tooltip: "Build a Monster",
  },
];

const DARKEN_VIEWS = [
  {
    id: "composer",
    label: "Composer",
    icon: "fa-solid fa-wand-magic-sparkles",
    tooltip: "Composer",
    panelId: "darkenComposerPanel",
  },
  {
    id: "map-generator",
    label: "Map",
    icon: "fa-solid fa-map",
    tooltip: "Map",
    panelId: "darkenMapGeneratorPanel",
  },
];

const MONSTER_VIEWS = [
  {
    id: "composer",
    label: "Composer",
    icon: "fa-solid fa-dna",
    tooltip: "Composer",
    panelId: "monsterComposerPanel",
  },
];

function getInitialSection() {
  if (typeof window === "undefined") return "home";
  const params = new URLSearchParams(window.location.search);
  return params.get("studio") === "1" || params.get("admin") === "studio" ? "inspiration-studio" : "home";
}

export default function AppRouter() {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [activeUiMode, setActiveUiMode] = useState("simple");
  const [activeCrucibleGenerator, setActiveCrucibleGenerator] = useState("darken");
  const [activeDarkenTab, setActiveDarkenTab] = useState("composer");
  const [hasOpenedMapGenerator, setHasOpenedMapGenerator] = useState(false);
  const [mapRequest, setMapRequest] = useState(null);
  const [mapRequestRevision, setMapRequestRevision] = useState(0);
  const [monsterInspirationSeed, setMonsterInspirationSeed] = useState(null);
  const darkenSnapshotProviderRef = useRef(null);

  const createMapRequestFromSnapshot = useCallback(
    (snapshot) => createMapRequestFromDarkenLocationState(snapshot),
    []
  );

  const initializeMapRequest = useCallback(
    (snapshot) => {
      setMapRequest((currentRequest) => currentRequest || createMapRequestFromSnapshot(snapshot));
    },
    [createMapRequestFromSnapshot]
  );

  const refreshMapFromComposer = useCallback(() => {
    if (hasOpenedMapGenerator) {
      const confirmed = window.confirm(
        "Refresh the map from the current Composer regions? This will replace the current generated map."
      );
      if (!confirmed) return;
    }

    const snapshot = darkenSnapshotProviderRef.current?.();
    setMapRequest(createMapRequestFromSnapshot(snapshot));
    setMapRequestRevision((value) => value + 1);
    setHasOpenedMapGenerator(true);
    setActiveCrucibleGenerator("darken");
    setActiveDarkenTab("map-generator");
    setActiveSection("crucible");
  }, [createMapRequestFromSnapshot, hasOpenedMapGenerator]);

  const openMapGenerator = useCallback(
    (snapshot) => {
      initializeMapRequest(snapshot);
      setHasOpenedMapGenerator(true);
      setActiveCrucibleGenerator("darken");
      setActiveDarkenTab("map-generator");
      setActiveSection("crucible");
    },
    [initializeMapRequest]
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
    [hasOpenedMapGenerator, initializeMapRequest]
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
    [activateCrucibleGenerator, activateDarkenTab]
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
          : "darken-workspace crucible-workspace"
      }
      aria-label="Crucible workspace"
      data-active-generator={activeCrucibleGenerator}
    >
      <CrucibleTopbar
        activeGeneratorId={activeCrucibleGenerator}
        activeViewId={activeCrucibleGenerator === "darken" ? activeDarkenTab : "composer"}
        generators={CRUCIBLE_GENERATORS}
        onGeneratorChange={activateCrucibleGenerator}
        onViewChange={activeCrucibleGenerator === "darken" ? activateDarkenTab : undefined}
        views={activeCrucibleGenerator === "darken" ? DARKEN_VIEWS : MONSTER_VIEWS}
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
              <Suspense fallback={<div className="status">Loading map generator...</div>}>
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
          <MonsterComposerPage uiMode={activeUiMode} inspirationSeed={monsterInspirationSeed} />
        </section>
      )}
    </section>
  );

  return (
    <AppShell
      activeSection={activeSection}
      activeUiMode={activeUiMode}
      activeCrucibleGenerator={activeCrucibleGenerator}
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
