// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ComposerRail } from "./composer-rail.jsx";
import {
  ComposerStartScreen,
  ComposerWorkflowFooter,
  COMPOSER_BUILD_GUIDE_STORAGE_KEY,
  useComposerBuildGuidePreference,
} from "./composer-command-bar.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function PreferenceHarness() {
  const [visible, setVisible] = useComposerBuildGuidePreference(true);
  return <button type="button" onClick={() => setVisible((current) => !current)}>{String(visible)}</button>;
}

function setRect(element, rect) {
  element.getBoundingClientRect = () => ({
    x: rect.left,
    y: rect.top,
    top: rect.top,
    left: rect.left,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    width: rect.width,
    height: rect.height,
    toJSON: () => ({}),
  });
}

describe("Composer workflow primitives", () => {
  let container;
  let root;
  let centerAnchor;
  let rightRail;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    centerAnchor = document.createElement("div");
    rightRail = document.createElement("aside");
    centerAnchor.className = "test-composer-center";
    rightRail.className = "test-composer-right-rail";
    setRect(centerAnchor, { left: 220, top: 40, width: 720, height: 700 });
    setRect(rightRail, { left: 960, top: 40, width: 320, height: 700 });
    document.body.append(container, centerAnchor, rightRail);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    centerAnchor.remove();
    rightRail.remove();
    window.localStorage.clear();
  });

  it("renders the Build Guide centrally and only Previous/Next in detached navigation", () => {
    const onPrimary = vi.fn();
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const onGuideChange = vi.fn();

    act(() => {
      root.render(
        <ComposerWorkflowFooter
          centerAnchorSelector=".test-composer-center"
          navigationAnchorSelector=".test-composer-right-rail"
          productLabel="Dark Places"
          currentStageId="rooms"
          stages={[
            { id: "frame", label: "Frame" },
            { id: "rooms", label: "Rooms", detail: "Complete room content." },
            { id: "output", label: "Final Output" },
          ]}
          objective={{ title: "Complete the selected room", detail: "Add its missing clue." }}
          tasks={[{ id: "clue", title: "Disturbing Clue", required: true, status: "current" }]}
          primaryAction={{ label: "Add Disturbing Clue", onClick: onPrimary }}
          previousAction={{ label: "Frame", onClick: onPrevious }}
          nextAction={{ label: "Final Output", onClick: onNext }}
          showBuildGuide
          onShowBuildGuideChange={onGuideChange}
        />,
      );
    });

    const guide = document.body.querySelector(".cruor-composer-command-bar");
    const navigation = document.body.querySelector(".cruor-composer-stage-navigation");
    expect(guide).not.toBeNull();
    expect(guide.querySelector(".cruor-composer-command-bar__primary")).toBeNull();
    expect(guide.querySelector(".cruor-composer-command-bar__summary")?.textContent).toContain("Complete the selected room");
    expect(navigation.querySelectorAll("button")).toHaveLength(2);
    expect(navigation.textContent).toContain("Frame");
    expect(navigation.textContent).toContain("Final Output");
    expect(navigation.textContent).not.toContain("Rooms");
    expect(navigation.textContent).not.toContain("Build Guide");

    act(() => document.body.querySelector(".cruor-composer-command-bar__expand").click());
    expect(guide.querySelector(".cruor-composer-command-bar__summary")).toBeNull();
    expect(guide.querySelector(".cruor-composer-command-bar__stepper")?.textContent).toContain("Rooms");
    expect(guide.querySelector(".cruor-composer-command-bar__stepper")?.textContent).toContain("Final Output");
    act(() => document.body.querySelector(".cruor-composer-command-bar__primary").click());
    act(() => document.body.querySelector(".cruor-composer-stage-navigation__button--previous").click());
    act(() => document.body.querySelector(".cruor-composer-stage-navigation__button--next").click());
    act(() => document.body.querySelector(".cruor-composer-command-bar__hide").click());

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onGuideChange).toHaveBeenCalledWith(false);
  });


  it("marks completed objectives and removes redundant Required task labels", () => {
    act(() => {
      root.render(
        <ComposerWorkflowFooter
          centerAnchorSelector=".test-composer-center"
          navigationAnchorSelector=".test-composer-right-rail"
          productLabel="Dark Places"
          currentStageId="frame"
          stages={[
            { id: "frame", label: "Frame", status: "complete" },
            { id: "rooms", label: "Rooms", status: "open" },
          ]}
          objective={{ title: "Confirm the place frame", detail: "The map is ready." }}
          tasks={[
            { id: "identity", title: "Place Identity", required: true, status: "complete" },
            { id: "program", title: "Room Program", required: true, status: "complete" },
            { id: "map", title: "Generated Map", required: true, status: "complete" },
          ]}
          primaryAction={{ label: "Continue to Rooms", onClick: () => {} }}
          nextAction={{ label: "Rooms", onClick: () => {} }}
          showBuildGuide
        />,
      );
    });

    const collapsedGuide = document.body.querySelector(".cruor-composer-command-bar");
    expect(
      collapsedGuide.querySelector(".cruor-composer-command-bar__summary")?.classList.contains("is-complete"),
    ).toBe(true);

    act(() => document.body.querySelector(".cruor-composer-command-bar__expand").click());

    const guide = document.body.querySelector(".cruor-composer-command-bar");
    expect(guide.querySelector(".cruor-composer-command-bar__objective")?.classList.contains("is-complete")).toBe(true);
    expect(guide.querySelector(".cruor-composer-command-bar__tasks-head > strong")?.classList.contains("is-complete")).toBe(true);
    expect(guide.querySelector(".cruor-composer-command-bar__tasks-head > strong")?.textContent).toContain("3 of 3 required");
    expect(guide.querySelectorAll(".cruor-composer-command-bar__task-kind")).toHaveLength(0);
    expect(guide.querySelectorAll(".cruor-composer-command-bar__step")).toHaveLength(2);
    expect(guide.querySelector(".cruor-composer-command-bar__step.is-complete svg")).not.toBeNull();
    expect(guide.querySelectorAll(".cruor-composer-command-bar__step-copy small svg")).toHaveLength(2);
  });

  it("keeps the lone Next control in its right-hand navigation cell", () => {
    act(() => {
      root.render(
        <ComposerWorkflowFooter
          centerAnchorSelector=".test-composer-center"
          navigationAnchorSelector=".test-composer-right-rail"
          productLabel="Dark Places"
          currentStageId="frame"
          stages={[{ id: "frame", label: "Frame" }, { id: "rooms", label: "Rooms" }]}
          nextAction={{ label: "Rooms", onClick: () => {} }}
          showBuildGuide={false}
        />,
      );
    });

    const navigation = document.body.querySelector(".cruor-composer-stage-navigation");
    expect(navigation.classList.contains("has-previous")).toBe(false);
    expect(navigation.classList.contains("has-next")).toBe(true);
    expect(navigation.querySelector(".cruor-composer-stage-navigation__button--previous")).toBeNull();
    expect(navigation.querySelector(".cruor-composer-stage-navigation__button--next")).not.toBeNull();
    expect(document.body.querySelector(".cruor-composer-build-guide-trigger")).not.toBeNull();
  });


  it("lets a feature replace the centered hidden-guide trigger with its own rail action", () => {
    act(() => {
      root.render(
        <ComposerWorkflowFooter
          centerAnchorSelector=".test-composer-center"
          navigationAnchorSelector=".test-composer-right-rail"
          productLabel="Dark Places"
          currentStageId="frame"
          stages={[{ id: "frame", label: "Frame" }, { id: "rooms", label: "Rooms" }]}
          nextAction={{ label: "Rooms", onClick: () => {} }}
          showBuildGuide={false}
          showHiddenTrigger={false}
        />,
      );
    });

    expect(document.body.querySelector(".cruor-composer-build-guide-trigger")).toBeNull();
    expect(document.body.querySelector(".cruor-composer-stage-navigation")).not.toBeNull();
  });

  it("reserves the bottom of the right rail for detached navigation", async () => {
    act(() => {
      root.render(
        <ComposerWorkflowFooter
          centerAnchorSelector=".test-composer-center"
          navigationAnchorSelector=".test-composer-right-rail"
          currentStageId="frame"
          stages={[{ id: "frame", label: "Frame" }, { id: "rooms", label: "Rooms" }]}
          nextAction={{ label: "Rooms", onClick: () => {} }}
        />,
      );
    });

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 1));
    });

    expect(rightRail.classList.contains("has-detached-stage-navigation")).toBe(true);
    expect(rightRail.style.getPropertyValue("--cruor-detached-stage-navigation-reserve")).not.toBe("");
  });

  it("keeps rail content in a dedicated scroll body above a supplied footer", () => {
    act(() => {
      root.render(
        <ComposerRail scrollable footer={<span>Footer</span>}>
          <span>Scrollable content</span>
        </ComposerRail>,
      );
    });

    expect(container.querySelector(".cruor-composer-rail__body").textContent).toContain("Scrollable content");
    expect(container.querySelector(".cruor-composer-rail__footer").textContent).toContain("Footer");
    expect(container.querySelector(".cruor-composer-rail--with-footer")).not.toBeNull();
  });

  it("persists the site-wide Build Guide preference", () => {
    act(() => root.render(<PreferenceHarness />));
    act(() => container.querySelector("button").click());
    expect(window.localStorage.getItem(COMPOSER_BUILD_GUIDE_STORAGE_KEY)).toBe("false");
  });

  it("exposes the Build Guide choice on the shared start screen", () => {
    const onChange = vi.fn();
    act(() => {
      root.render(
        <ComposerStartScreen
          showBuildGuide
          onShowBuildGuideChange={onChange}
          onPickTemplate={() => {}}
          onBuildFromScratch={() => {}}
        />,
      );
    });
    act(() => container.querySelector('input[type="checkbox"]').click());
    expect(onChange).toHaveBeenCalledWith(false);
    expect(
      container.querySelectorAll(
        ".cruor-composer-start-screen__choice-icon.cruor-square-icon-button",
      ),
    ).toHaveLength(2);
  });
});
