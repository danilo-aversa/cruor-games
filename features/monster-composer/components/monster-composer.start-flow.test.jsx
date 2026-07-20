// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildGuidedFlow } from "../model/monster-composer.start-flow.js";
import { GuidedFlowPanel } from "./monster-composer.start-flow.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function createComputed(overrides = {}) {
  return {
    pressure: 10,
    budget: 12,
    complexity: 4,
    complexityCap: 7,
    counterplayAudit: { rating: "Playable" },
    warnings: [],
    ...overrides,
  };
}

describe("Monster GuidedFlowPanel", () => {
  let container;
  let root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.clear();
  });

  it("opens the real picker boundary for the required graft", () => {
    const onFocusSlot = vi.fn();
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: {},
      computed: createComputed(),
    });

    act(() => {
      root.render(
        <GuidedFlowPanel
          guidedFlow={flow}
          onFocusSlot={onFocusSlot}
        />,
      );
    });

    act(() => document.body.querySelector(".cruor-composer-build-guide__primary").click());

    expect(onFocusSlot).toHaveBeenCalledWith("body");
  });

  it("routes a blocked build to the real Review view", () => {
    const onOpenBalance = vi.fn();
    const flow = buildGuidedFlow({
      composerStarted: true,
      stageMode: "grafts",
      selected: { body: "body", attack: "attack", weakness: "weakness" },
      computed: createComputed({ pressure: 18, budget: 12 }),
    });

    act(() => {
      root.render(
        <GuidedFlowPanel
          guidedFlow={flow}
          onOpenBalance={onOpenBalance}
        />,
      );
    });

    act(() => document.body.querySelector(".cruor-composer-build-guide__primary").click());

    expect(onOpenBalance).toHaveBeenCalledTimes(1);
  });
});
