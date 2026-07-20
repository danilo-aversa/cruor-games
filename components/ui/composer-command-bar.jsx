import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  EyeOff,
  Plus,
  X,
} from "lucide-react";

export const COMPOSER_BUILD_GUIDE_STORAGE_KEY = "cruor.composer.showBuildGuide";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function readComposerBuildGuidePreference(defaultValue = true) {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = window.localStorage.getItem(COMPOSER_BUILD_GUIDE_STORAGE_KEY);
    return stored === null ? defaultValue : stored === "true";
  } catch {
    return defaultValue;
  }
}

function writeComposerBuildGuidePreference(visible) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      COMPOSER_BUILD_GUIDE_STORAGE_KEY,
      visible ? "true" : "false",
    );
  } catch {
    // The preference remains usable in-memory when browser storage is unavailable.
  }
}

function readStoredOpenState(storageKey, defaultOpen) {
  if (!storageKey || typeof window === "undefined") return defaultOpen;

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === null ? defaultOpen : stored === "true";
  } catch {
    return defaultOpen;
  }
}

function writeStoredOpenState(storageKey, open) {
  if (!storageKey || typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, open ? "true" : "false");
  } catch {
    // The guide remains usable in-memory when browser storage is unavailable.
  }
}

export function useComposerBuildGuidePreference(defaultValue = true) {
  const [visible, setVisible] = useState(() => readComposerBuildGuidePreference(defaultValue));

  useEffect(() => {
    writeComposerBuildGuidePreference(visible);
  }, [visible]);

  return [visible, setVisible];
}

function normalizeAction(action) {
  if (!action) return null;

  return {
    label: String(action.label || action.title || "Continue"),
    destinationLabel: String(action.destinationLabel || action.label || action.title || "Continue"),
    detail: String(action.detail || ""),
    title: String(action.title || action.label || "Continue"),
    disabled: Boolean(action.disabled),
    onClick: typeof action.onClick === "function" ? action.onClick : null,
  };
}

function getVisibleAnchor(selector) {
  if (!selector || typeof document === "undefined") return null;

  return [...document.querySelectorAll(selector)].find((element) => {
    if (!(element instanceof HTMLElement)) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle?.(element);
    return rect.width > 0
      && rect.height > 0
      && style?.display !== "none"
      && style?.visibility !== "hidden";
  }) || null;
}

function ComposerFixedDock({
  anchorSelector,
  children,
  className = "",
  geometryKey = "",
  mode = "center",
}) {
  const dockRef = useRef(null);

  useBrowserLayoutEffect(() => {
    const dock = dockRef.current;
    if (!dock || typeof window === "undefined") return undefined;

    let anchor = null;
    let resizeObserver = null;
    let animationFrame = 0;

    const scheduleFrame = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback) => window.setTimeout(callback, 0);
    const cancelFrame = typeof window.cancelAnimationFrame === "function"
      ? window.cancelAnimationFrame.bind(window)
      : window.clearTimeout.bind(window);

    function clearAnchorReservation() {
      if (!anchor || mode !== "navigation") return;
      anchor.classList.remove("has-detached-stage-navigation");
      anchor.style.removeProperty("--cruor-detached-stage-navigation-reserve");
    }

    function bindAnchor(nextAnchor) {
      if (anchor === nextAnchor) return;
      clearAnchorReservation();
      resizeObserver?.disconnect();
      anchor = nextAnchor;
      resizeObserver = typeof ResizeObserver === "function"
        ? new ResizeObserver(scheduleUpdate)
        : null;
      if (anchor) resizeObserver?.observe(anchor);
    }

    function updateGeometry() {
      animationFrame = 0;
      bindAnchor(getVisibleAnchor(anchorSelector));

      if (!anchor) {
        dock.dataset.composerDockMeasured = "false";
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const viewportWidth = Math.max(document.documentElement?.clientWidth || 0, window.innerWidth || 0);
      const viewportPadding = 12;
      const availableWidth = Math.max(0, viewportWidth - viewportPadding * 2);

      if (mode === "navigation") {
        const width = Math.min(rect.width, availableWidth);
        const left = clamp(rect.left, viewportPadding, Math.max(viewportPadding, viewportWidth - width - viewportPadding));
        dock.style.setProperty("--cruor-fixed-dock-left", `${left}px`);
        dock.style.setProperty("--cruor-fixed-dock-width", `${width}px`);
        dock.dataset.composerDockMeasured = width > 0 ? "true" : "false";

        const reserve = Math.ceil(Math.max(64, dock.getBoundingClientRect().height) + 20);
        anchor.classList.add("has-detached-stage-navigation");
        anchor.style.setProperty("--cruor-detached-stage-navigation-reserve", `${reserve}px`);
        return;
      }

      const width = Math.min(rect.width, 980, availableWidth);
      const centeredLeft = rect.left + Math.max(0, (rect.width - width) / 2);
      const left = clamp(centeredLeft, viewportPadding, Math.max(viewportPadding, viewportWidth - width - viewportPadding));
      dock.style.setProperty("--cruor-fixed-dock-left", `${left}px`);
      dock.style.setProperty("--cruor-fixed-dock-width", `${width}px`);
      dock.dataset.composerDockMeasured = width > 0 ? "true" : "false";
    }

    function scheduleUpdate() {
      if (animationFrame) cancelFrame(animationFrame);
      animationFrame = scheduleFrame(updateGeometry);
    }

    updateGeometry();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, true);

    return () => {
      if (animationFrame) cancelFrame(animationFrame);
      resizeObserver?.disconnect();
      clearAnchorReservation();
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate, true);
    };
  }, [anchorSelector, geometryKey, mode]);

  return (
    <div
      ref={dockRef}
      className={cx(
        "cruor-composer-fixed-dock",
        `cruor-composer-fixed-dock--${mode}`,
        className,
      )}
      data-composer-dock-measured="false"
    >
      {children}
    </div>
  );
}

function ComposerPortalDock(props) {
  if (typeof document === "undefined" || !document.body) return null;
  return createPortal(<ComposerFixedDock {...props} />, document.body);
}

function CommandNavigationButton({ action, direction }) {
  const normalized = normalizeAction(action);
  const isPrevious = direction === "previous";
  const Icon = isPrevious ? ChevronLeft : ChevronRight;

  if (!normalized) return null;

  return (
    <button
      className={cx(
        "cruor-composer-stage-navigation__button",
        `cruor-composer-stage-navigation__button--${direction}`,
      )}
      type="button"
      disabled={normalized.disabled || !normalized.onClick}
      aria-label={`${isPrevious ? "Previous" : "Next"}: ${normalized.destinationLabel}`}
      title={normalized.detail || normalized.destinationLabel}
      onClick={normalized.onClick || undefined}
    >
      {isPrevious ? <Icon aria-hidden="true" /> : null}
      <span>
        <small>{isPrevious ? "Previous" : "Next"}</small>
        <strong>{normalized.destinationLabel}</strong>
      </span>
      {!isPrevious ? <Icon aria-hidden="true" /> : null}
    </button>
  );
}

function TaskStatusIcon({ status }) {
  if (status === "complete") return <Check aria-hidden="true" />;
  return <Circle aria-hidden="true" />;
}

export function ComposerStartScreen({
  description = "Choose a starting point for this Composer workflow.",
  onBuildFromScratch,
  onPickTemplate,
  onShowBuildGuideChange,
  scratchDescription = "Start with an empty structure and define it yourself.",
  scratchLabel = "Build from Scratch",
  showBuildGuide = true,
  templateDescription = "Load a prepared starting structure, then customize it.",
  templateLabel = "Pick a Template",
  title = "Choose how to begin",
}) {
  return (
    <section className="cruor-composer-start-screen" aria-label={title}>
      <div className="cruor-composer-start-screen__intro">
        <span>Start</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="cruor-composer-start-screen__choices">
        <button
          className="cruor-composer-start-screen__choice"
          type="button"
          onClick={onPickTemplate}
        >
          <span className="cruor-square-icon-button cruor-composer-start-screen__choice-icon">
            <BookOpen aria-hidden="true" />
          </span>
          <span>
            <strong>{templateLabel}</strong>
            <em>{templateDescription}</em>
          </span>
        </button>

        <button
          className="cruor-composer-start-screen__choice"
          type="button"
          onClick={onBuildFromScratch}
        >
          <span className="cruor-square-icon-button cruor-composer-start-screen__choice-icon">
            <Plus aria-hidden="true" />
          </span>
          <span>
            <strong>{scratchLabel}</strong>
            <em>{scratchDescription}</em>
          </span>
        </button>
      </div>

      <label className="cruor-composer-start-screen__guide-toggle">
        <input
          type="checkbox"
          checked={showBuildGuide}
          onChange={(event) => onShowBuildGuideChange?.(event.target.checked)}
        />
        <span>
          <strong>Show Build Guide</strong>
          <small>Display contextual tasks and shortcuts while creating.</small>
        </span>
      </label>
    </section>
  );
}

export function ComposerTemplatePicker({
  activeTemplateId = "",
  onApply,
  onClose,
  open = false,
  templates = [],
  title = "Pick a Template",
}) {
  if (!open) return null;

  return (
    <div
      className="cruor-composer-template-picker"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        className="cruor-composer-template-picker__scrim"
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
      />
      <section className="cruor-composer-template-picker__panel">
        <header className="cruor-composer-template-picker__header">
          <div>
            <span>Templates</span>
            <h2>{title}</h2>
          </div>
          <button
            className="cruor-square-icon-button"
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="cruor-composer-template-picker__grid">
          {templates.map((template) => {
            const active = template.id === activeTemplateId;
            return (
              <button
                className={cx(
                  "cruor-composer-template-picker__option",
                  active && "is-active",
                )}
                type="button"
                key={template.id}
                onClick={() => onApply?.(template)}
              >
                <span>
                  <strong>{template.label}</strong>
                  <em>{active ? "Current Template" : "Load Template"}</em>
                </span>
                <p>{template.description}</p>
                {template.meta ? <small>{template.meta}</small> : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function ComposerBuildGuide({
  blocker = null,
  context = [],
  currentStage = null,
  objective = null,
  onHide,
  primaryAction = null,
  productLabel = "Composer",
  storageKey = "",
  tasks = [],
}) {
  const generatedId = useId().replace(/:/g, "");
  const panelId = `cruor-build-guide-panel-${generatedId}`;
  const [open, setOpen] = useState(() => readStoredOpenState(storageKey, false));
  const primary = normalizeAction(primaryAction);
  const completedRequired = tasks.filter((task) => task.required && task.status === "complete").length;
  const requiredCount = tasks.filter((task) => task.required).length;

  useEffect(() => {
    writeStoredOpenState(storageKey, open);
  }, [open, storageKey]);

  return (
    <section
      className={cx("cruor-composer-command-bar", open && "is-open")}
      aria-label={`${productLabel} Build Guide`}
    >
      <div
        id={panelId}
        className="cruor-composer-command-bar__drawer"
        aria-hidden={!open}
      >
        <article className="cruor-composer-command-bar__objective">
          <span>{objective?.eyebrow || "Current Objective"}</span>
          <h2>{objective?.title || primary?.title || "Continue the build"}</h2>
          {objective?.detail ? <p>{objective.detail}</p> : null}
          {context.length ? (
            <div className="cruor-composer-command-bar__context" aria-label="Current build context">
              {context.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          ) : null}
        </article>

        <section className="cruor-composer-command-bar__tasks" aria-label="Current tasks">
          <div className="cruor-composer-command-bar__tasks-head">
            <span>Current Tasks</span>
            <strong>
              {requiredCount ? `${completedRequired} of ${requiredCount} required` : "No required tasks"}
            </strong>
          </div>

          <div className="cruor-composer-command-bar__task-list">
            {tasks.length ? tasks.map((task) => {
              const actionable = typeof task.onClick === "function" && task.status !== "complete";
              const content = (
                <>
                  <span className="cruor-composer-command-bar__task-mark">
                    <TaskStatusIcon status={task.status} />
                  </span>
                  <span className="cruor-composer-command-bar__task-copy">
                    <strong>{task.title}</strong>
                    {task.detail ? <small>{task.detail}</small> : null}
                  </span>
                  <span className="cruor-composer-command-bar__task-kind">
                    {task.required ? "Required" : "Optional"}
                  </span>
                </>
              );

              return actionable ? (
                <button
                  key={task.id}
                  className={cx(
                    "cruor-composer-command-bar__task",
                    "is-actionable",
                    task.status === "current" && "is-current",
                  )}
                  type="button"
                  onClick={task.onClick}
                >
                  {content}
                </button>
              ) : (
                <div
                  key={task.id}
                  className={cx(
                    "cruor-composer-command-bar__task",
                    task.status === "complete" && "is-complete",
                    task.status === "current" && "is-current",
                  )}
                >
                  {content}
                </div>
              );
            }) : (
              <p className="cruor-composer-command-bar__empty">
                No additional work is required in this stage.
              </p>
            )}
          </div>

          {blocker ? (
            <div className="cruor-composer-command-bar__blocker" role="status">
              <div>
                <span>{blocker.eyebrow || "Blocking Issue"}</span>
                <strong>{blocker.title}</strong>
                {blocker.detail ? <small>{blocker.detail}</small> : null}
              </div>
              {blocker.action?.onClick ? (
                <button type="button" onClick={blocker.action.onClick}>
                  {blocker.action.label || "Resolve"}
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      <div className="cruor-composer-command-bar__row">
        <div className="cruor-composer-command-bar__summary">
          <span>Build Guide · {currentStage?.label || productLabel}</span>
          <strong>{objective?.title || primary?.title || "Continue the build"}</strong>
          <small>{objective?.detail || primary?.detail || "Open the guide for contextual tasks."}</small>
        </div>

        <button
          className="cruor-composer-command-bar__primary cruor-composer-build-guide__primary"
          type="button"
          disabled={!primary?.onClick || primary.disabled}
          onClick={primary?.onClick || undefined}
        >
          {primary?.label || "Continue"}
        </button>

        <button
          className="cruor-composer-command-bar__hide cruor-square-icon-button"
          type="button"
          aria-label="Hide Build Guide"
          title="Hide Build Guide"
          onClick={onHide}
        >
          <EyeOff aria-hidden="true" />
        </button>

        <button
          className="cruor-composer-command-bar__expand cruor-square-icon-button"
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Collapse Build Guide" : "Expand Build Guide"}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}

export function ComposerStageNavigation({
  nextAction = null,
  previousAction = null,
  productLabel = "Composer",
}) {
  const hasPreviousAction = Boolean(normalizeAction(previousAction));
  const hasNextAction = Boolean(normalizeAction(nextAction));

  if (!hasPreviousAction && !hasNextAction) return null;

  return (
    <nav
      className={cx(
        "cruor-composer-stage-navigation",
        hasPreviousAction && "has-previous",
        hasNextAction && "has-next",
      )}
      aria-label={`${productLabel} stage navigation`}
    >
      <CommandNavigationButton action={previousAction} direction="previous" />
      <CommandNavigationButton action={nextAction} direction="next" />
    </nav>
  );
}

export function ComposerWorkflowFooter({
  blocker = null,
  centerAnchorSelector = ".cruor-composer-stage",
  context = [],
  currentStageId = "",
  navigationAnchorSelector = ".cruor-composer-rail--right",
  nextAction = null,
  objective = null,
  onShowBuildGuideChange,
  previousAction = null,
  primaryAction = null,
  productLabel = "Composer",
  showBuildGuide = true,
  stages = [],
  tasks = [],
}) {
  const currentStage = stages.find((stage) => stage.id === currentStageId) || stages[0] || null;
  const storageKey = `cruor.${String(productLabel).toLowerCase().replace(/[^a-z0-9]+/g, ".")}.buildGuideOpen`;

  return (
    <>
      <ComposerPortalDock
        anchorSelector={centerAnchorSelector}
        className="cruor-composer-command-dock"
        geometryKey={`${currentStageId}-${showBuildGuide ? "visible" : "hidden"}`}
        mode="center"
      >
        {showBuildGuide ? (
          <ComposerBuildGuide
            blocker={blocker}
            context={context}
            currentStage={currentStage}
            objective={objective}
            primaryAction={primaryAction}
            productLabel={productLabel}
            storageKey={storageKey}
            tasks={tasks}
            onHide={() => onShowBuildGuideChange?.(false)}
          />
        ) : (
          <button
            className="cruor-composer-build-guide-trigger"
            type="button"
            onClick={() => onShowBuildGuideChange?.(true)}
          >
            <BookOpen aria-hidden="true" />
            <span>Show Build Guide</span>
          </button>
        )}
      </ComposerPortalDock>

      <ComposerPortalDock
        anchorSelector={navigationAnchorSelector}
        className="cruor-composer-stage-navigation-dock"
        geometryKey={currentStageId}
        mode="navigation"
      >
        <ComposerStageNavigation
          nextAction={nextAction}
          previousAction={previousAction}
          productLabel={productLabel}
        />
      </ComposerPortalDock>
    </>
  );
}

// Backward-compatible exports for branches that still import the old names.
export function ComposerCommandDock({ children, className = "", ...props }) {
  return (
    <ComposerPortalDock className={className} mode="center" {...props}>
      {children}
    </ComposerPortalDock>
  );
}

export const ComposerCommandBar = ComposerBuildGuide;
