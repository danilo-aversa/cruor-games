import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_URL = "http://localhost:5173";
const DEFAULT_VIEWPORT = { width: 1440, height: 1080 };

function parseArgs(argv) {
  const args = {
    url: DEFAULT_URL,
    headed: false,
    output: null,
    viewport: DEFAULT_VIEWPORT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [name, inlineValue] = arg.split("=");
    const value = inlineValue ?? argv[index + 1];

    if (arg === "--headed") {
      args.headed = true;
      continue;
    }

    if (name === "--url" && value) {
      args.url = value;
      if (inlineValue === undefined) index += 1;
      continue;
    }

    if (name === "--output" && value) {
      args.output = value;
      if (inlineValue === undefined) index += 1;
      continue;
    }

    if (name === "--viewport" && value) {
      const [width, height] = value.split("x").map((part) => Number.parseInt(part, 10));
      if (Number.isFinite(width) && Number.isFinite(height)) {
        args.viewport = { width, height };
      }
      if (inlineValue === undefined) index += 1;
    }
  }

  return args;
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const parsed = Number.parseFloat(value.replace("px", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value, decimals = 3) {
  if (!Number.isFinite(value)) return 0;
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

function summarizeNumbers(values) {
  const numeric = values.filter((value) => Number.isFinite(value));
  if (!numeric.length) {
    return { min: 0, median: 0, p95: 0, max: 0 };
  }

  return {
    min: round(Math.min(...numeric), 2),
    median: round(percentile(numeric, 50), 2),
    p95: round(percentile(numeric, 95), 2),
    max: round(Math.max(...numeric), 2),
  };
}

function getPhase(sample) {
  if (sample.released) return "released";
  if (sample.collapseProgress > 0.01) return "collapse";
  if (sample.revealedStep >= 3) return "output";
  if (sample.revealedStep >= 2) return "logic";
  if (sample.revealedStep >= 1) return "input";
  return "covered";
}


function getDirection(previous, current) {
  if (!previous || !current) return "none";
  const delta = current.scrollY - previous.scrollY;
  if (delta > 2) return "down";
  if (delta < -2) return "up";
  return "none";
}

function getSectionViewportState(sample) {
  const rect = sample?.section?.rect;
  const height = sample?.viewport?.height ?? 0;
  if (!rect || !height) return "missing";
  if (rect.bottom <= 0) return "above";
  if (rect.top >= height) return "below";
  if (rect.top > 0 && rect.top < height) return "entering-from-below";
  if (rect.top <= 0 && rect.bottom >= height) return "spanning-viewport";
  if (rect.bottom > 0 && rect.bottom < height) return "leaving-above";
  return "visible";
}

function getVisualDelta(previous, current) {
  if (!previous || !current) {
    return {
      scrollDelta: 0,
      direction: "none",
      collapseDelta: 0,
      stateChanged: false,
      maxLayoutDelta: 0,
      maxCardTopDelta: 0,
      maxCardHeightDelta: 0,
      transformsChanged: false,
      visualIdle: false,
    };
  }

  const scrollDelta = current.scrollY - previous.scrollY;
  const direction = getDirection(previous, current);
  const collapseDelta = Math.abs(current.collapseProgress - previous.collapseProgress);
  const stateChanged =
    current.revealedStep !== previous.revealedStep ||
    current.released !== previous.released ||
    current.className !== previous.className;

  const layoutDeltas = [
    Math.abs((current.section?.rect?.top ?? 0) - (previous.section?.rect?.top ?? 0)),
    Math.abs((current.section?.rect?.height ?? 0) - (previous.section?.rect?.height ?? 0)),
    Math.abs((current.sticky?.rect?.top ?? 0) - (previous.sticky?.rect?.top ?? 0)),
    Math.abs((current.sticky?.rect?.height ?? 0) - (previous.sticky?.rect?.height ?? 0)),
    Math.abs((current.strip?.rect?.top ?? 0) - (previous.strip?.rect?.top ?? 0)),
    Math.abs((current.strip?.rect?.height ?? 0) - (previous.strip?.rect?.height ?? 0)),
  ];

  let maxCardTopDelta = 0;
  let maxCardHeightDelta = 0;
  let transformsChanged = false;
  current.cards.forEach((card, index) => {
    const previousCard = previous.cards[index];
    if (!previousCard) return;
    maxCardTopDelta = Math.max(maxCardTopDelta, Math.abs((card.rect?.top ?? 0) - (previousCard.rect?.top ?? 0)));
    maxCardHeightDelta = Math.max(maxCardHeightDelta, Math.abs((card.rect?.height ?? 0) - (previousCard.rect?.height ?? 0)));
    transformsChanged = transformsChanged || card.transform !== previousCard.transform || card.innerTransform !== previousCard.innerTransform;
  });

  const maxLayoutDelta = Math.max(0, ...layoutDeltas, maxCardTopDelta, maxCardHeightDelta);
  const sectionState = getSectionViewportState(current);
  const sectionRelevant = !["missing", "above", "below"].includes(sectionState);
  const visualIdle =
    sectionRelevant &&
    Math.abs(scrollDelta) >= 36 &&
    !stateChanged &&
    collapseDelta < 0.012 &&
    maxLayoutDelta < 6 &&
    !transformsChanged;

  return {
    scrollDelta,
    direction,
    collapseDelta,
    stateChanged,
    maxLayoutDelta,
    maxCardTopDelta,
    maxCardHeightDelta,
    transformsChanged,
    visualIdle,
    sectionState,
  };
}

function addDerivedMetrics(samples) {
  return samples.map((sample, index) => {
    const previous = index > 0 ? samples[index - 1] : null;
    const visual = getVisualDelta(previous, sample);
    return {
      ...sample,
      phase: getPhase(sample),
      direction: visual.direction,
      scrollDelta: round(visual.scrollDelta, 2),
      sectionViewportState: getSectionViewportState(sample),
      visualIdle: visual.visualIdle,
      visualDelta: {
        collapseDelta: round(visual.collapseDelta, 4),
        maxLayoutDelta: round(visual.maxLayoutDelta, 2),
        maxCardTopDelta: round(visual.maxCardTopDelta, 2),
        maxCardHeightDelta: round(visual.maxCardHeightDelta, 2),
        transformsChanged: visual.transformsChanged,
        stateChanged: visual.stateChanged,
      },
    };
  });
}

function buildIdleScrollAnomaly(run) {
  const startPhase = run.start.phase;
  const endPhase = run.end.phase;
  const startsAfterOutput = run.start.revealedStep >= 3 || run.end.revealedStep >= 3;
  const entersSection = ["covered", "input", "logic"].includes(startPhase) || ["covered", "input", "logic"].includes(endPhase);
  const directionLabel = run.direction === "up" ? "upward" : run.direction === "down" ? "downward" : "stationary";

  let type = "visual-idle-scroll";
  if (startsAfterOutput && run.direction === "up") type = "post-output-upward-idle-scroll";
  else if (startsAfterOutput) type = "post-output-idle-scroll";
  else if (entersSection) type = "section-entry-idle-scroll";

  return {
    type,
    severity: run.cumulativeScroll > 360 || run.count >= 6 ? "high" : "medium",
    detail: `${directionLabel} scroll consumed ${round(run.cumulativeScroll, 1)}px across ${run.count} samples with no meaningful visual change (${startPhase} → ${endPhase}).`,
    scenario: run.scenario,
    sampleIndex: run.end.index,
    label: run.end.label,
    scrollY: run.end.scrollY,
    phase: endPhase,
  };
}

function detectIdleScrollRuns(samples, scenarioName) {
  const enriched = addDerivedMetrics(samples);
  const issues = [];
  let run = null;

  const closeRun = () => {
    if (!run) return;
    if (run.count >= 3 || run.cumulativeScroll >= 180) {
      issues.push(buildIdleScrollAnomaly(run));
    }
    run = null;
  };

  for (let index = 1; index < enriched.length; index += 1) {
    const previous = enriched[index - 1];
    const current = enriched[index];
    const visual = getVisualDelta(previous, current);
    const sameDirection = !run || run.direction === visual.direction;

    if (visual.visualIdle && sameDirection) {
      if (!run) {
        run = {
          scenario: scenarioName,
          direction: visual.direction,
          start: previous,
          end: current,
          count: 1,
          cumulativeScroll: Math.abs(visual.scrollDelta),
        };
      } else {
        run.end = current;
        run.count += 1;
        run.cumulativeScroll += Math.abs(visual.scrollDelta);
      }
    } else {
      closeRun();
      if (visual.visualIdle) {
        run = {
          scenario: scenarioName,
          direction: visual.direction,
          start: previous,
          end: current,
          count: 1,
          cumulativeScroll: Math.abs(visual.scrollDelta),
        };
      }
    }
  }
  closeRun();
  return issues;
}

function compareSamples(previous, current) {
  if (!previous || !current) return [];

  const issues = [];
  const phase = getPhase(current);
  const collapseJump = Math.abs(current.collapseProgress - previous.collapseProgress);
  const sectionHeightJump = Math.abs(current.section.height - previous.section.height);
  const sectionRectHeightJump = Math.abs(current.section.rect.height - previous.section.rect.height);
  const stickyTopJump = Math.abs(current.sticky.rect.top - previous.sticky.rect.top);
  const stickyHeightJump = Math.abs(current.sticky.rect.height - previous.sticky.rect.height);
  const scrollDelta = Math.abs(current.scrollY - previous.scrollY);
  const sectionShrank = current.section.rect.height < previous.section.rect.height - 8;
  const stickyShrank = current.sticky.rect.height < previous.sticky.rect.height - 8;
  const collapseChangedWithoutScroll = Math.abs(current.scrollY - previous.scrollY) < 4 && collapseJump > 0.025;

  if (collapseJump > 0.12) {
    issues.push({
      type: "collapse-progress-jump",
      severity: collapseJump > 0.22 ? "high" : "medium",
      detail: `Collapse progress changed by ${round(collapseJump)} in one sample.`,
    });
  }

  if (sectionHeightJump > 180 || sectionRectHeightJump > 180) {
    issues.push({
      type: "section-height-jump",
      severity: sectionHeightJump > 320 || sectionRectHeightJump > 320 ? "high" : "medium",
      detail: `Section height changed by ${round(Math.max(sectionHeightJump, sectionRectHeightJump), 1)}px in one sample.`,
    });
  }

  if (!current.released && stickyTopJump > 90 && scrollDelta < 260) {
    issues.push({
      type: "sticky-position-jump",
      severity: stickyTopJump > 160 ? "high" : "medium",
      detail: `Sticky top changed by ${round(stickyTopJump, 1)}px while the section was not released.`,
    });
  }

  if (!current.released && stickyHeightJump > 170) {
    issues.push({
      type: "sticky-height-jump",
      severity: stickyHeightJump > 300 ? "high" : "medium",
      detail: `Sticky height changed by ${round(stickyHeightJump, 1)}px in one sample.`,
    });
  }

  if (current.revealedStep > previous.revealedStep + 1) {
    issues.push({
      type: "reveal-step-skip",
      severity: "high",
      detail: `Revealed step jumped from ${previous.revealedStep} to ${current.revealedStep}.`,
    });
  }

  if (current.released && !previous.released && sectionHeightJump > 120) {
    issues.push({
      type: "release-height-jump",
      severity: sectionHeightJump > 240 ? "high" : "medium",
      detail: `Release changed section height by ${round(sectionHeightJump, 1)}px.`,
    });
  }

  if (collapseChangedWithoutScroll) {
    issues.push({
      type: "collapse-while-scroll-stationary",
      severity: collapseJump > 0.08 ? "high" : "medium",
      detail: `Collapse progress changed by ${round(collapseJump)} while scrollY changed by only ${round(Math.abs(current.scrollY - previous.scrollY), 1)}px.`,
    });
  }

  if (!current.released && current.revealedStep >= 3 && sectionShrank) {
    issues.push({
      type: "post-output-section-shrink",
      severity: sectionHeightJump > 80 ? "high" : "medium",
      detail: `After Output, section height shrank by ${round(sectionHeightJump, 1)}px before release.`,
    });
  }

  if (!current.released && current.revealedStep >= 3 && stickyShrank) {
    issues.push({
      type: "post-output-sticky-shrink",
      severity: stickyHeightJump > 80 ? "high" : "medium",
      detail: `After Output, sticky layer height shrank by ${round(stickyHeightJump, 1)}px before release.`,
    });
  }

  current.cards.forEach((card, index) => {
    const previousCard = previous.cards[index];
    if (!previousCard) return;

    const cardTopJump = Math.abs(card.rect.top - previousCard.rect.top);
    const cardHeightJump = Math.abs(card.rect.height - previousCard.rect.height);
    const cardTransformChanged = card.innerTransform !== previousCard.innerTransform;

    if (!current.released && cardTopJump > 130 && scrollDelta < 260) {
      issues.push({
        type: "card-position-jump",
        severity: cardTopJump > 220 ? "high" : "medium",
        detail: `Card ${index + 1} top changed by ${round(cardTopJump, 1)}px during ${phase}.`,
      });
    }

    if (!current.released && cardHeightJump > 80) {
      issues.push({
        type: "card-size-jump",
        severity: cardHeightJump > 150 ? "high" : "medium",
        detail: `Card ${index + 1} height changed by ${round(cardHeightJump, 1)}px during ${phase}.`,
      });
    }

    if (cardTransformChanged && current.revealedStep < Number(card.step)) {
      issues.push({
        type: "unexpected-card-transform",
        severity: "medium",
        detail: `Card ${index + 1} transform changed before its reveal step.`,
      });
    }
  });

  return issues;
}

async function captureMetrics(page, scenarioName, index, label) {
  return page.evaluate(
    ({ scenarioName, index, label }) => {
      const serializeRect = (rect) => ({
        top: Math.round(rect.top * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
        bottom: Math.round(rect.bottom * 100) / 100,
        left: Math.round(rect.left * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      });

      const readCssNumber = (element, property) => {
        if (!element) return 0;
        const value = window.getComputedStyle(element).getPropertyValue(property).trim();
        const parsed = Number.parseFloat(value.replace("px", ""));
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const section = document.querySelector("#workbenchFlow");
      const sticky = section?.querySelector(".cruor-home__statement-sticky") ?? null;
      const inner = section?.querySelector(".cruor-home__statement-inner") ?? null;
      const strip = section?.querySelector(".cruor-home__process-strip") ?? null;
      const sectionStyles = section ? window.getComputedStyle(section) : null;
      const stickyStyles = sticky ? window.getComputedStyle(sticky) : null;

      const cards = Array.from(section?.querySelectorAll(".cruor-home__process-step") ?? []).map((card) => {
        const cardStyles = window.getComputedStyle(card);
        const innerCard = card.querySelector(".cruor-home__process-card-inner");
        const innerStyles = innerCard ? window.getComputedStyle(innerCard) : null;
        const front = card.querySelector(".cruor-home__process-card-face--front");
        const back = card.querySelector(".cruor-home__process-card-face--back");
        const frontStyles = front ? window.getComputedStyle(front) : null;
        const backStyles = back ? window.getComputedStyle(back) : null;

        return {
          step: card.getAttribute("data-step"),
          rect: serializeRect(card.getBoundingClientRect()),
          filter: cardStyles.filter,
          opacity: cardStyles.opacity,
          transform: cardStyles.transform,
          innerTransform: innerStyles?.transform ?? "",
          innerTransition: innerStyles?.transition ?? "",
          frontVisibility: frontStyles?.visibility ?? "",
          backVisibility: backStyles?.visibility ?? "",
        };
      });

      return {
        scenarioName,
        index,
        label,
        time: Math.round(performance.now() * 100) / 100,
        scrollY: Math.round(window.scrollY * 100) / 100,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        document: {
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: document.documentElement.clientHeight,
        },
        revealedStep: Number(section?.getAttribute("data-revealed-step") ?? 0),
        released: section?.getAttribute("data-workbench-released") === "true",
        className: section?.className ?? "",
        collapseProgress: readCssNumber(section, "--workbench-collapse-progress"),
        sectionHeightVar: sectionStyles?.getPropertyValue("--workbench-section-height").trim() ?? "",
        stickyHeightVar: sectionStyles?.getPropertyValue("--workbench-sticky-height").trim() ?? "",
        section: {
          offsetTop: section?.offsetTop ?? 0,
          offsetHeight: section?.offsetHeight ?? 0,
          height: section ? readCssNumber(section, "height") || section.getBoundingClientRect().height : 0,
          minHeight: sectionStyles?.minHeight ?? "",
          rect: section ? serializeRect(section.getBoundingClientRect()) : null,
        },
        sticky: {
          position: stickyStyles?.position ?? "",
          height: sticky ? readCssNumber(sticky, "height") || sticky.getBoundingClientRect().height : 0,
          minHeight: stickyStyles?.minHeight ?? "",
          transform: stickyStyles?.transform ?? "",
          rect: sticky ? serializeRect(sticky.getBoundingClientRect()) : null,
        },
        inner: {
          rect: inner ? serializeRect(inner.getBoundingClientRect()) : null,
        },
        strip: {
          rect: strip ? serializeRect(strip.getBoundingClientRect()) : null,
        },
        cards,
      };
    },
    { scenarioName, index, label }
  );
}

async function startFrameSampler(page) {
  await page.evaluate(() => {
    window.__workbenchFrameIntervals = [];
    window.__workbenchFrameSamplerActive = true;
    window.__workbenchFrameSamplerLast = performance.now();

    const sampleFrame = (time) => {
      if (!window.__workbenchFrameSamplerActive) return;
      const last = window.__workbenchFrameSamplerLast ?? time;
      window.__workbenchFrameIntervals.push(time - last);
      window.__workbenchFrameSamplerLast = time;
      window.requestAnimationFrame(sampleFrame);
    };

    window.requestAnimationFrame(sampleFrame);
  });
}

async function stopFrameSampler(page) {
  return page.evaluate(() => {
    window.__workbenchFrameSamplerActive = false;
    return window.__workbenchFrameIntervals ?? [];
  });
}

async function primeWorkbench(page, url, startMode = "before-section") {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator("#workbenchFlow").waitFor({ state: "attached", timeout: 10_000 });
  await page.evaluate((startMode) => {
    const section = document.querySelector("#workbenchFlow");
    if (!section) throw new Error("#workbenchFlow not found");

    let startY = Math.max(0, section.offsetTop - window.innerHeight * 0.88);
    if (startMode === "at-section-top") {
      startY = Math.max(0, section.offsetTop - 4);
    } else if (startMode === "inside-section") {
      startY = Math.max(0, section.offsetTop + window.innerHeight * 0.35);
    } else if (startMode === "after-section") {
      startY = Math.max(0, section.offsetTop + section.offsetHeight + window.innerHeight * 0.18);
    }

    window.scrollTo(0, startY);
  }, startMode);
  await page.waitForTimeout(360);
}

async function maybeCaptureMilestone(page, outputDir, scenarioName, sample, capturedMilestones) {
  const milestones = [
    ["step-1", sample.revealedStep >= 1],
    ["step-2", sample.revealedStep >= 2],
    ["step-3", sample.revealedStep >= 3],
    ["collapse-25", sample.collapseProgress >= 0.25],
    ["collapse-50", sample.collapseProgress >= 0.5],
    ["collapse-75", sample.collapseProgress >= 0.75],
    ["released", sample.released],
    ["visual-idle", sample.visualIdle === true],
    ["post-output-idle", sample.visualIdle === true && sample.revealedStep >= 3],
  ];

  const paths = [];
  for (const [name, shouldCapture] of milestones) {
    const key = `${scenarioName}:${name}`;
    if (!shouldCapture || capturedMilestones.has(key)) continue;
    capturedMilestones.add(key);
    const filename = `${scenarioName}-${String(sample.index).padStart(3, "0")}-${name}.png`;
    const filepath = path.join(outputDir, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    paths.push({ milestone: name, path: filename, sampleIndex: sample.index });
  }

  return paths;
}

async function runScenario(page, url, outputDir, scenario, viewport) {
  await primeWorkbench(page, url, scenario.startMode ?? "before-section");
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  await startFrameSampler(page);

  const samples = [];
  const anomalies = [];
  const screenshots = [];
  const capturedMilestones = new Set();

  let sampleIndex = 0;
  const takeSample = async (label) => {
    const sample = await captureMetrics(page, scenario.name, sampleIndex, label);
    const previous = samples.at(-1);
    const sampleIssues = compareSamples(previous, sample).map((issue) => ({
      ...issue,
      scenario: scenario.name,
      sampleIndex,
      label,
      scrollY: sample.scrollY,
      phase: getPhase(sample),
    }));
    anomalies.push(...sampleIssues);
    samples.push(sample);
    screenshots.push(...await maybeCaptureMilestone(page, outputDir, scenario.name, sample, capturedMilestones));
    sampleIndex += 1;
    return sample;
  };

  const wheelAndSample = async ({ deltaY, waitMs, label }) => {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(waitMs);
    return takeSample(label ?? `wheel-${deltaY}`);
  };

  await takeSample("start");

  const executeAction = async (action) => {
    if (action.type === "wait") {
      await page.waitForTimeout(action.waitMs ?? 300);
      await takeSample(action.label ?? "wait");
      return;
    }

    if (action.type === "wheel") {
      for (let index = 0; index < action.count; index += 1) {
        await wheelAndSample({ deltaY: action.deltaY, waitMs: action.waitMs, label: action.label });
      }
      return;
    }

    if (action.type === "wheelUntilStep") {
      for (let index = 0; index < action.maxCount; index += 1) {
        const sample = await wheelAndSample({ deltaY: action.deltaY, waitMs: action.waitMs, label: action.label });
        if (sample.revealedStep >= action.step) break;
      }
      return;
    }

    if (action.type === "wheelUntilReleased") {
      for (let index = 0; index < action.maxCount; index += 1) {
        const sample = await wheelAndSample({ deltaY: action.deltaY, waitMs: action.waitMs, label: action.label });
        if (sample.released) break;
      }
      return;
    }

    throw new Error(`Unknown diagnostic action type: ${action.type}`);
  };

  if (Array.isArray(scenario.actions)) {
    for (const action of scenario.actions) {
      await executeAction(action);
    }
  } else {
    for (const segment of scenario.segments) {
      await executeAction({ type: "wheel", ...segment });
    }
  }

  await page.waitForTimeout(420);
  await takeSample("settled");

  anomalies.push(...detectIdleScrollRuns(samples, scenario.name));

  const frameIntervals = await stopFrameSampler(page);
  const frameSummary = summarizeNumbers(frameIntervals);
  const slowFrames = frameIntervals.filter((value) => value > 34).length;
  const verySlowFrames = frameIntervals.filter((value) => value > 50).length;

  return {
    ...scenario,
    samples: addDerivedMetrics(samples),
    anomalies,
    screenshots,
    frames: {
      count: frameIntervals.length,
      slowFrames,
      verySlowFrames,
      summary: frameSummary,
    },
  };
}

function flattenCsvRows(results) {
  const rows = [];
  for (const result of results) {
    for (const sample of result.samples) {
      rows.push({
        scenario: result.name,
        index: sample.index,
        label: sample.label,
        phase: sample.phase ?? getPhase(sample),
        direction: sample.direction ?? "none",
        sectionViewportState: sample.sectionViewportState ?? getSectionViewportState(sample),
        time: sample.time,
        scrollY: sample.scrollY,
        scrollDelta: sample.scrollDelta ?? 0,
        visualIdle: sample.visualIdle ?? false,
        visualLayoutDelta: sample.visualDelta?.maxLayoutDelta ?? 0,
        visualCollapseDelta: sample.visualDelta?.collapseDelta ?? 0,
        visualTransformsChanged: sample.visualDelta?.transformsChanged ?? false,
        revealedStep: sample.revealedStep,
        released: sample.released,
        collapseProgress: sample.collapseProgress,
        sectionTop: sample.section.rect?.top ?? 0,
        sectionBottom: sample.section.rect?.bottom ?? 0,
        sectionHeight: sample.section.rect?.height ?? 0,
        sectionOffsetHeight: sample.section.offsetHeight,
        stickyTop: sample.sticky.rect?.top ?? 0,
        stickyHeight: sample.sticky.rect?.height ?? 0,
        stripTop: sample.strip.rect?.top ?? 0,
        stripHeight: sample.strip.rect?.height ?? 0,
        card1Top: sample.cards[0]?.rect.top ?? 0,
        card1Height: sample.cards[0]?.rect.height ?? 0,
        card1Transform: sample.cards[0]?.innerTransform ?? "",
        card2Top: sample.cards[1]?.rect.top ?? 0,
        card2Height: sample.cards[1]?.rect.height ?? 0,
        card2Transform: sample.cards[1]?.innerTransform ?? "",
        card3Top: sample.cards[2]?.rect.top ?? 0,
        card3Height: sample.cards[2]?.rect.height ?? 0,
        card3Transform: sample.cards[2]?.innerTransform ?? "",
      });
    }
  }
  return rows;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

function createMarkdownReport({ url, viewport, outputDir, results, consoleMessages, pageErrors }) {
  const allAnomalies = results.flatMap((result) => result.anomalies);
  const high = allAnomalies.filter((issue) => issue.severity === "high");
  const medium = allAnomalies.filter((issue) => issue.severity === "medium");
  const screenshotRows = results.flatMap((result) => result.screenshots.map((shot) => ({ scenario: result.name, ...shot })));

  const scenarioSummary = results.map((result) => {
    const first = result.samples[0];
    const last = result.samples.at(-1);
    const maxCollapseJump = Math.max(
      0,
      ...result.samples.slice(1).map((sample, index) => Math.abs(sample.collapseProgress - result.samples[index].collapseProgress))
    );
    const maxSectionHeightJump = Math.max(
      0,
      ...result.samples.slice(1).map((sample, index) => Math.abs(sample.section.rect.height - result.samples[index].section.rect.height))
    );
    const maxStickyTopJump = Math.max(
      0,
      ...result.samples.slice(1).map((sample, index) => Math.abs(sample.sticky.rect.top - result.samples[index].sticky.rect.top))
    );
    const idleIssues = result.anomalies.filter((issue) => issue.type.includes("idle-scroll"));
    const shrinkIssues = result.anomalies.filter((issue) => issue.type.includes("shrink"));

    return {
      name: result.name,
      samples: result.samples.length,
      startScroll: first?.scrollY ?? 0,
      endScroll: last?.scrollY ?? 0,
      finalStep: last?.revealedStep ?? 0,
      released: last?.released ?? false,
      maxCollapseJump: round(maxCollapseJump),
      maxSectionHeightJump: round(maxSectionHeightJump, 1),
      maxStickyTopJump: round(maxStickyTopJump, 1),
      idleIssues: idleIssues.length,
      shrinkIssues: shrinkIssues.length,
      frameP95: result.frames.summary.p95,
      slowFrames: result.frames.slowFrames,
      issues: result.anomalies.length,
    };
  });

  const lines = [];
  lines.push("# Workbench Scroll Diagnostic Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`URL: ${url}`);
  lines.push(`Viewport: ${viewport.width}x${viewport.height}`);
  lines.push(`Output directory: ${outputDir}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Scenarios: ${results.length}`);
  lines.push(`- Samples: ${results.reduce((total, result) => total + result.samples.length, 0)}`);
  lines.push(`- High severity anomalies: ${high.length}`);
  lines.push(`- Medium severity anomalies: ${medium.length}`);
  lines.push(`- Console warnings/errors: ${consoleMessages.length}`);
  lines.push(`- Page errors: ${pageErrors.length}`);
  lines.push("");

  lines.push("## Scenario Timeline Summary");
  lines.push("");
  lines.push("| Scenario | Samples | Scroll Y | Final Step | Released | Max Collapse Jump | Max Section Height Jump | Max Sticky Top Jump | Idle Runs | Shrink | p95 Frame | Slow Frames | Issues |");
  lines.push("|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|");
  for (const item of scenarioSummary) {
    lines.push(`| ${item.name} | ${item.samples} | ${round(item.startScroll, 1)} → ${round(item.endScroll, 1)} | ${item.finalStep} | ${item.released ? "yes" : "no"} | ${item.maxCollapseJump} | ${item.maxSectionHeightJump}px | ${item.maxStickyTopJump}px | ${item.idleIssues} | ${item.shrinkIssues} | ${item.frameP95}ms | ${item.slowFrames} | ${item.issues} |`);
  }
  lines.push("");

  lines.push("## Detected Anomalies");
  lines.push("");
  if (!allAnomalies.length) {
    lines.push("No threshold-level anomalies were detected. If the animation still feels wrong, inspect `timeline.csv` for smaller rhythmic jumps.");
  } else {
    lines.push("| Severity | Type | Scenario | Sample | Phase | Scroll Y | Detail |");
    lines.push("|---|---|---|---:|---|---:|---|");
    for (const issue of allAnomalies.slice(0, 80)) {
      lines.push(`| ${issue.severity} | ${issue.type} | ${issue.scenario} | ${issue.sampleIndex} | ${issue.phase} | ${round(issue.scrollY, 1)} | ${issue.detail} |`);
    }
    if (allAnomalies.length > 80) {
      lines.push(`| … | … | … | … | … | … | ${allAnomalies.length - 80} additional anomalies omitted from markdown. See diagnostics.json. |`);
    }
  }
  lines.push("");

  const idleAnomalies = allAnomalies.filter((issue) => issue.type.includes("idle-scroll"));
  lines.push("## Idle / Empty Scroll Runs");
  lines.push("");
  if (!idleAnomalies.length) {
    lines.push("No threshold-level empty-scroll runs were detected.");
  } else {
    lines.push("| Severity | Type | Scenario | End Sample | Phase | Scroll Y | Detail |");
    lines.push("|---|---|---|---:|---|---:|---|");
    for (const issue of idleAnomalies.slice(0, 40)) {
      lines.push(`| ${issue.severity} | ${issue.type} | ${issue.scenario} | ${issue.sampleIndex} | ${issue.phase} | ${round(issue.scrollY, 1)} | ${issue.detail} |`);
    }
    if (idleAnomalies.length > 40) {
      lines.push(`| … | … | … | … | … | … | ${idleAnomalies.length - 40} additional idle-scroll runs omitted from markdown. See diagnostics.json. |`);
    }
  }
  lines.push("");

  lines.push("## Screenshots");
  lines.push("");
  if (!screenshotRows.length) {
    lines.push("No milestone screenshots were captured.");
  } else {
    lines.push("| Scenario | Milestone | Sample | File |");
    lines.push("|---|---|---:|---|");
    for (const shot of screenshotRows) {
      lines.push(`| ${shot.scenario} | ${shot.milestone} | ${shot.sampleIndex} | ${shot.path} |`);
    }
  }
  lines.push("");

  if (consoleMessages.length || pageErrors.length) {
    lines.push("## Browser Console / Page Errors");
    lines.push("");
    for (const message of consoleMessages) {
      lines.push(`- [${message.type}] ${message.text}`);
    }
    for (const error of pageErrors) {
      lines.push(`- [pageerror] ${error}`);
    }
    lines.push("");
  }

  lines.push("## Files");
  lines.push("");
  lines.push("- `diagnostics.json`: full raw timeline, metrics, screenshots, console messages, and anomalies.");
  lines.push("- `timeline.csv`: compact table useful for sorting/filtering in a spreadsheet.");
  lines.push("- `*.png`: milestone screenshots captured during scroll progression.");
  lines.push("");
  lines.push("## What to Look For");
  lines.push("");
  lines.push("- `collapse-progress-jump`: collapse is still too aggressive or raw wheel deltas are leaking through.");
  lines.push("- `sticky-position-jump`: sticky layer is changing position while it should remain pinned.");
  lines.push("- `card-position-jump`: cards are flickering or jumping during reveal/collapse.");
  lines.push("- `release-height-jump`: release still changes layout too abruptly.");
  lines.push("- High `p95 Frame` or many `Slow Frames`: animation is visually heavy, usually due to filters, shadows, 3D transforms, or layout properties changing every frame.");

  return lines.join("\n");
}

async function ensureServerReachable(url) {
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Cannot reach ${url}. Start the dev server first with: npm run dev -- --host 127.0.0.1\nOriginal error: ${error.message}`,
      { cause: error },
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputDir = path.resolve(args.output ?? path.join("reports", `workbench-scroll-${timestampSlug()}`));
  await fs.mkdir(outputDir, { recursive: true });

  await ensureServerReachable(args.url);

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({ viewport: args.viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);

  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (!["warning", "error"].includes(message.type())) return;
    consoleMessages.push({ type: message.type(), text: message.text() });
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error?.stack || error?.message || String(error));
  });

  const scenarios = [
    {
      name: "slow-down",
      description: "Small wheel deltas from before the Workbench section through release.",
      startMode: "before-section",
      segments: [{ label: "slow-down", deltaY: 72, count: 112, waitMs: 42 }],
    },
    {
      name: "fast-down",
      description: "Large wheel deltas to reproduce fast-scroll flicker.",
      startMode: "before-section",
      segments: [{ label: "fast-down", deltaY: 340, count: 42, waitMs: 24 }],
    },
    {
      name: "step3-then-up",
      description: "Scroll only until Output is revealed, then immediately reverse upward to detect empty upward scroll.",
      startMode: "before-section",
      actions: [
        { type: "wheelUntilStep", label: "down-to-step-3", deltaY: 72, waitMs: 42, maxCount: 70, step: 3 },
        { type: "wait", label: "after-step-3-settle", waitMs: 520 },
        { type: "wheel", label: "up-after-step-3", deltaY: -72, count: 48, waitMs: 42 },
      ],
    },
    {
      name: "enter-from-below-up",
      description: "Start below the Workbench section and scroll upward into it, looking for entry dead-scroll.",
      startMode: "after-section",
      segments: [{ label: "enter-up", deltaY: -96, count: 86, waitMs: 38 }],
    },
    {
      name: "release-then-reenter-up",
      description: "Scroll down until release, then scroll upward back into the section.",
      startMode: "before-section",
      actions: [
        { type: "wheelUntilReleased", label: "down-until-release", deltaY: 128, waitMs: 36, maxCount: 96 },
        { type: "wait", label: "after-release-settle", waitMs: 520 },
        { type: "wheel", label: "reenter-up", deltaY: -96, count: 72, waitMs: 38 },
      ],
    },
    {
      name: "down-up-down-around-step3",
      description: "Cross Output, reverse upward briefly, then continue downward to catch direction-change flicker.",
      startMode: "before-section",
      actions: [
        { type: "wheelUntilStep", label: "down-to-step-3", deltaY: 86, waitMs: 36, maxCount: 60, step: 3 },
        { type: "wheel", label: "short-up", deltaY: -86, count: 16, waitMs: 36 },
        { type: "wheel", label: "down-again", deltaY: 86, count: 34, waitMs: 36 },
      ],
    },
  ];

  const results = [];
  for (const scenario of scenarios) {
    console.log(`Running scenario: ${scenario.name}`);
    results.push(await runScenario(page, args.url, outputDir, scenario, args.viewport));
  }

  await browser.close();

  const diagnostics = {
    diagnosticVersion: "2026-06-25-empty-scroll-v2",
    generatedAt: new Date().toISOString(),
    url: args.url,
    viewport: args.viewport,
    outputDir,
    consoleMessages,
    pageErrors,
    results,
  };

  const csvRows = flattenCsvRows(results);
  await fs.writeFile(path.join(outputDir, "diagnostics.json"), `${JSON.stringify(diagnostics, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "timeline.csv"), `${toCsv(csvRows)}\n`, "utf8");
  await fs.writeFile(
    path.join(outputDir, "report.md"),
    createMarkdownReport({
      url: args.url,
      viewport: args.viewport,
      outputDir,
      results,
      consoleMessages,
      pageErrors,
    }),
    "utf8"
  );

  console.log("");
  console.log("Workbench scroll diagnostic complete.");
  console.log(`Report: ${path.join(outputDir, "report.md")}`);
  console.log(`Timeline: ${path.join(outputDir, "timeline.csv")}`);
  console.log(`Raw JSON: ${path.join(outputDir, "diagnostics.json")}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
