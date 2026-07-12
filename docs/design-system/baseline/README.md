# Design-system visual baseline

Phase 0 was prepared on `refactor/sitewide-design-system` from HEAD `be61f98fd2537d367c757bf9796b11735bc7d193` on 2026-07-12. The screenshots describe the current working-tree UI; they do not authorize or include a design refactor.

## Local setup and commands

Install the browser builds matched to Playwright 1.60.0 on a clean machine:

```text
npm run test:browsers:install
```

CI machines that also need Linux browser dependencies should use `npx playwright install --with-deps chromium firefox`. Browser caches are outside the repository and must not be committed.

```text
npm run test:visual:design-system
npm run test:visual:design-system:update
npm run test:scrollbars:design-system
npm run test:design-system
```

The normal commands compare images only. Baselines change only through the explicit `:update` command.

## Browsers, viewports and storage

Chromium 148.0.7778.96 (Playwright build 1223) and Firefox 150.0.2 (build 1522) are covered. Firefox is scoped to the design-system suite so adding it does not silently broaden legacy Chromium-only E2E coverage (including unsupported clipboard permissions). Viewports are 1440x1080 (wide), 1100x800 (compact, exercising the 1120px desktop collapse boundary while remaining above 1080px rules), and 390x844 (below the audited 420px minimum mobile rule).

Snapshots live under `tests/e2e/design-system/__snapshots__/<platform>/<browser>/`. Platform is part of the path because font rasterization and native controls are OS-dependent. The current Windows set contains 56 PNG files: 28 per browser from 27 visual tests per browser (the Dark Places Composer test records both rail and immersive states).

## Stabilization

Tests seed the complete accessibility preference object, request reduced motion, wait for route readiness and `document.fonts.ready`, pause videos at time zero, disable animation/transition time, hide carets, and wait two animation frames. Home route screenshots mask only its volatile video element; the rest of the page remains visible. No time freezing or broad UI masking is used. Comparisons allow at most 100 changed pixels.

## Coverage and gaps

Coverage includes every router route, the compatibility Crucible query, three viewport tiers, application shell/topbar, open settings, focus/selected/disabled controls, tooltip and mega-menu portals, Home modal and scroll lock, Dark Places rails/collapsibles/immersive mode, Monster rails/Component Navigator, and scroll-mode/owner contracts. Dark Places export remains behaviorally covered by the existing pipeline test but that pre-existing pipeline currently fails before export. The secondary Monster popout window and data-heavy Studio tool modals are documented gaps; neither is bypassed with synthetic runtime hooks.

See [route-state-matrix.md](route-state-matrix.md), [scrollbar-contract.md](scrollbar-contract.md), [known-limitations.md](known-limitations.md), and [baseline-results.md](baseline-results.md).
