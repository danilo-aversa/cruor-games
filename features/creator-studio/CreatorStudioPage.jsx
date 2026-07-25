import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import SiteLink from "../../app/navigation/SiteLink.jsx";
import { StudioIcon, StudioPanelTitle } from "../inspiration-studio/ui/index.js";
import CreatorStudioHomePage from "./CreatorStudioHomePage.jsx";

const InspirationStudioPage = lazy(
  () => import("../inspiration-studio/InspirationStudioPage.jsx"),
);
const CreatorOperationsPage = lazy(
  () => import("./CreatorOperationsPage.jsx"),
);
const CreatorPublishingPage = lazy(
  () => import("./publishing/publishing.index.js"),
);

const CONTENT_STUDIO_LOADING_BUFFER_MS = 2000;

function CreatorWorkspaceLoading({
  description = "Loading content registries and authoring models…",
  eyebrow = "Creator Workspace",
  icon = "fa-screwdriver-wrench",
  title = "Loading Workspace",
}) {
  return (
    <div
      className="creator-studio__loading inspiration-studio"
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <section className="studio-panel cruor-ui-panel-surface creator-studio__loading-panel">
        <StudioPanelTitle
          eyebrow={eyebrow}
          icon={icon}
          title={title}
        />
        <div className="creator-studio__loading-bar" aria-hidden="true">
          <span />
        </div>
        <p>{description}</p>
      </section>
    </div>
  );
}

function DeferredContentStudio() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoadingVisible, setLoadingVisible] = useState(true);
  const loadingBufferTimerRef = useRef(null);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setShouldLoad(true));
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (loadingBufferTimerRef.current) {
        window.clearTimeout(loadingBufferTimerRef.current);
      }
    };
  }, []);

  const handleContentReady = useCallback(() => {
    if (loadingBufferTimerRef.current) return;

    loadingBufferTimerRef.current = window.setTimeout(() => {
      setLoadingVisible(false);
      loadingBufferTimerRef.current = null;
    }, CONTENT_STUDIO_LOADING_BUFFER_MS);
  }, []);

  if (!shouldLoad) return (
    <CreatorWorkspaceLoading
      eyebrow="Editorial Workspace"
      icon="fa-pen-ruler"
      title="Loading Content Studio"
    />
  );

  return (
    <div
      className="creator-studio__content-stage"
      data-loading={isLoadingVisible ? "true" : "false"}
    >
      <Suspense fallback={null}>
        <InspirationStudioPage onReady={handleContentReady} />
      </Suspense>
      {isLoadingVisible ? (
        <div className="creator-studio__loading-overlay">
          <CreatorWorkspaceLoading
            eyebrow="Editorial Workspace"
            icon="fa-pen-ruler"
            title="Loading Content Studio"
          />
        </div>
      ) : null}
    </div>
  );
}

const CREATOR_NAV_ITEMS = [
  {
    id: "home",
    label: "Overview",
    description: "Creator workspace",
    icon: "fa-house",
    href: "/creator-studio",
  },
  {
    id: "content",
    label: "Content Studio",
    description: "Author and publish",
    icon: "fa-pen-ruler",
    href: "/creator-studio/content",
  },
  {
    id: "operations",
    label: "Operations",
    description: "Health, QA and audits",
    icon: "fa-screwdriver-wrench",
    href: "/creator-studio/operations",
  },
  {
    id: "publishing",
    label: "Publishing",
    description: "Plan and review releases",
    icon: "fa-calendar-days",
    href: "/creator-studio/publishing",
  },
  {
    id: "insights",
    label: "Insights",
    description: "Track performance",
    icon: "fa-chart-line",
    disabled: true,
  },
  {
    id: "assets",
    label: "Assets",
    description: "Manage media",
    icon: "fa-photo-film",
    disabled: true,
  },
];

function CreatorStudioNavItem({ activeView, item, onViewChange }) {
  const isActive = activeView === item.id;
  const content = (
    <>
      <span className="creator-studio__nav-icon" aria-hidden="true">
        <StudioIcon name={item.icon} />
      </span>
      <span className="creator-studio__nav-copy">
        <strong>{item.label}</strong>
        <small>{item.description}</small>
      </span>
      {item.disabled ? <em>Soon</em> : null}
    </>
  );

  if (item.disabled) {
    return (
      <button
        className="creator-studio__nav-item cruor-ui-control-surface"
        type="button"
        disabled
      >
        {content}
      </button>
    );
  }

  return (
    <SiteLink
      className={`creator-studio__nav-item cruor-ui-control-surface${isActive ? " is-active" : ""}`}
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      onNavigate={() => onViewChange?.(item.id)}
    >
      {content}
    </SiteLink>
  );
}

export default function CreatorStudioPage({
  activeView = "home",
  authSession = null,
  onExit,
  onLogout,
  onViewChange,
}) {
  const accountName =
    authSession?.user?.displayName || authSession?.user?.username || "Admin";
  const resolvedView =
    activeView === "content"
      ? "content"
      : activeView === "operations"
        ? "operations"
        : activeView === "publishing"
          ? "publishing"
          : "home";
  const breadcrumbLabel =
    resolvedView === "content"
      ? "Content Studio"
      : resolvedView === "operations"
        ? "Operations"
        : resolvedView === "publishing"
          ? "Publishing"
          : "Overview";

  return (
    <section
      className="creator-studio"
      aria-label="Creator Studio"
      data-creator-studio-ready="true"
      data-active-view={resolvedView}
    >
      <header className="creator-studio__topbar cruor-ui-panel-surface">
        <SiteLink
          className="creator-studio__brand"
          href="/creator-studio"
          onNavigate={() => onViewChange?.("home")}
          aria-label="Open Creator Studio overview"
        >
          <span className="app-shell__logo-mark" aria-hidden="true">
            <img
              className="app-shell__logo-image"
              src="/assets/icons/cruor-logo-small.png"
              alt=""
            />
          </span>
          <span>
            <strong>Creator Studio</strong>
            <small>Cruor Games</small>
          </span>
        </SiteLink>

        <div className="creator-studio__breadcrumb" aria-label="Current Creator Studio view">
          <StudioIcon name="fa-screwdriver-wrench" />
          <span>Creator Studio</span>
          <StudioIcon name="fa-chevron-right" />
          <strong>{breadcrumbLabel}</strong>
        </div>

        <div className="creator-studio__account">
          <span>
            <strong>{accountName}</strong>
            <small>Administrator</small>
          </span>
          <button
            className="cruor-square-icon-button"
            type="button"
            aria-label="Return to Cruor Games"
            title="Return to Cruor Games"
            onClick={onExit}
          >
            <StudioIcon name="fa-arrow-up-right-from-square" />
          </button>
          <button
            className="cruor-square-icon-button"
            type="button"
            aria-label="Log out"
            title="Log out"
            onClick={onLogout}
          >
            <StudioIcon name="fa-right-from-bracket" />
          </button>
        </div>
      </header>

      <aside className="creator-studio__rail" aria-label="Creator Studio navigation">
        <span className="creator-studio__rail-label">Workspace</span>
        <nav className="creator-studio__nav">
          {CREATOR_NAV_ITEMS.map((item) => (
            <CreatorStudioNavItem
              activeView={resolvedView}
              item={item}
              key={item.id}
              onViewChange={onViewChange}
            />
          ))}
        </nav>

        <button
          className="creator-studio__exit cruor-ui-control-surface"
          type="button"
          onClick={onExit}
        >
          <StudioIcon name="fa-arrow-left" />
          <span>Return to Site</span>
        </button>
      </aside>

      <main className="creator-studio__workspace">
        {resolvedView === "content" ? (
          <DeferredContentStudio />
        ) : resolvedView === "operations" ? (
          <Suspense
            fallback={
              <CreatorWorkspaceLoading
                description="Loading health, coverage, ledger and QA workspaces…"
                eyebrow="Creator Operations"
                icon="fa-screwdriver-wrench"
                title="Loading Operations"
              />
            }
          >
            <CreatorOperationsPage />
          </Suspense>
        ) : resolvedView === "publishing" ? (
          <Suspense
            fallback={
              <CreatorWorkspaceLoading
                description="Loading release calendar, previews and publishing checks…"
                eyebrow="Publishing Workspace"
                icon="fa-calendar-days"
                title="Loading Publishing"
              />
            }
          >
            <CreatorPublishingPage />
          </Suspense>
        ) : (
          <CreatorStudioHomePage
            onOpenContentStudio={() => onViewChange?.("content")}
            onOpenOperations={() => onViewChange?.("operations")}
            onOpenPublishing={() => onViewChange?.("publishing")}
          />
        )}
      </main>
    </section>
  );
}
