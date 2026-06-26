# Actual vs Target Element Report - Actual Places Stage Progress Dock → Target Monsters Stage Progress Dock

Generated: 2026-06-26T13:01:17.821Z

## Goal

Make **Actual** match **Target**. Class names are allowed to differ. The important checks are tag structure, nesting, computed CSS, pseudo-elements, and rendered layout.

## Compared Elements

- Actual: .vscode/element-snapshots/dark-places-stage-progress.html
  - Label: Actual Places: location-stage-progress-dock
  - Selector: `.location-stage-progress-dock.location-stage-progress-dock--map`
- Target: .vscode/element-snapshots/terrifying-monsters-stage-progress.html
  - Label: Target Monsters: monster-stage-progress-dock
  - Selector: `.monster-stage-progress-dock.monster-stage-progress-dock--frame`
- Viewport: 1440x900

## Summary

Result: **MISMATCH**

Major findings:
- Actual wrapper/ancestor structure differs from Target in 1 area(s).
- 6 critical root computed style value(s) in Actual do not match Target.
- 93 critical computed style value(s) differ inside matched child elements.
- 8 root bounding-box metric(s) differ.
- 4 parent-relative root layout metric(s) differ.

Counts:

| Metric | Count |
| --- | --- |
| Ancestor / wrapper differences | 1 |
| Tag-only subtree differences | 0 |
| Root computed style differences | 13 |
| Critical root computed style differences | 6 |
| Critical child computed style differences | 93 |
| Root bounding-box differences | 8 |
| Root parent-relative layout differences | 4 |
| Root pseudo-element differences | 0 |
| Class role mapping rows | 18 |
| Actual-only root classes | 2 |
| Target-only root classes | 2 |

## Implementation Checklist

| Area | Action |
| --- | --- |
| Root positioning | Update Actual dock positioning rules to compute like Target. Usually this means matching position, bottom/left/right, transform, width, min/max width, and ensuring the parent stage is the positioning context. |
| Root size | Make Actual root width/height/min/max constraints compute to Target values. |
| Rendered placement | After CSS changes, rerun the test and check bounding-box/parent-relative metrics. These are viewport-state dependent but useful for final alignment. |
| DOM structure | Change Actual wrappers/child order only where tag-only structure differs. Do not change class names just to satisfy the report. |
| Class role map | Use the Class Role Map as a translation guide: create/adjust Places-specific selectors so they compute like the corresponding Monsters selectors. |
| Child elements | Align the highest-impact child-node computed style differences first: panel, next row, timeline, nav buttons, progress nav, status row, toggle row, and stage buttons. |

## What To Change In Actual

### DOM / Nesting — Tag-only

This section ignores class names and IDs. It only checks whether Actual has the same structural element tree as Target.

Ancestor / wrapper differences:

| Kind | Actual | Target | Suggested action |
| --- | --- | --- | --- |
| ancestor-tag-chain | body > div > div > main > section > section > div > div > div > main > section > div | body > div > div > main > section > section > section > div > main > section > div > div | Ancestor tag sequence differs. Match the structural wrappers used by Target. |

Tag-only subtree differences:

None.

### Class Role Map — Informational

Use this as a translation table. Actual class names do **not** need to match Target class names; Actual Places selectors should compute like the corresponding Target Monsters roles.

| Path | Tag | Actual classes | Target classes | Suggested Places CSS role |
| --- | --- | --- | --- | --- |
| root | div | .location-stage-progress-dock .location-stage-progress-dock--map | .monster-stage-progress-dock .monster-stage-progress-dock--frame | Actual should have Places-specific CSS equivalent to Target role(s): .monster-stage-progress-dock, .monster-stage-progress-dock--frame |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-panel, .guided-flow-drawer |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__panel |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__next |
| 0.0.0.0 | div | .location-flow-drawer__next-copy | .guided-flow-drawer__next-copy | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__next-copy |
| 0.0.1 | div | .location-flow-drawer__timeline | .guided-flow-drawer__timeline | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__timeline |
| 0.0.1.0 | button | .location-flow-nav-btn .location-flow-nav-btn--previous | .monster-flow-nav-btn .monster-flow-nav-btn--previous | Actual should have Places-specific CSS equivalent to Target role(s): .monster-flow-nav-btn, .monster-flow-nav-btn--previous |
| 0.0.1.1 | nav | .location-flow-progress | .brief-wizard__progress .monster-flow-progress | Actual should have Places-specific CSS equivalent to Target role(s): .brief-wizard__progress, .monster-flow-progress |
| 0.0.1.2 | button | .location-flow-nav-btn .location-flow-nav-btn--next | .monster-flow-nav-btn .monster-flow-nav-btn--next | Actual should have Places-specific CSS equivalent to Target role(s): .monster-flow-nav-btn, .monster-flow-nav-btn--next |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__status-row |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__readiness |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__warnings |
| 0.1 | div | .location-flow-drawer__toggle-row | .guided-flow-drawer__toggle-row | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__toggle-row |
| 0.1.0 | button | .location-flow-drawer__stage-btn .location-flow-drawer__stage-btn--previous .tooltip-btn | .guided-flow-drawer__stage-btn .guided-flow-drawer__stage-btn--previous .tooltip-btn | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__stage-btn, .guided-flow-drawer__stage-btn--previous |
| 0.1.1 | button | .location-flow-drawer__toggle | .guided-flow-drawer__toggle | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__toggle |
| 0.1.1.0 | span | .location-flow-drawer__toggle-main | .guided-flow-drawer__toggle-main | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__toggle-main |
| 0.1.1.1 | span | .location-flow-drawer__toggle-meta | .guided-flow-drawer__toggle-meta | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__toggle-meta |
| 0.1.2 | button | .location-flow-drawer__stage-btn .location-flow-drawer__stage-btn--next .tooltip-btn | .guided-flow-drawer__stage-btn .guided-flow-drawer__stage-btn--next .tooltip-btn | Actual should have Places-specific CSS equivalent to Target role(s): .guided-flow-drawer__stage-btn, .guided-flow-drawer__stage-btn--next |

### Root Computed CSS

| Severity | Property | Actual | Target | Suggested action |
| --- | --- | --- | --- | --- |
| major | position | relative | absolute | Make Actual compute to Target value: position: absolute |
| minor | inset | 0px | 570.719px -212px 18px 708px | Optional alignment: inset: 570.719px -212px 18px 708px |
| minor | top | 0px | 570.719px | Optional alignment: top: 570.719px |
| minor | right | 0px | -212px | Optional alignment: right: -212px |
| minor | bottom | 0px | 18px | Optional alignment: bottom: 18px |
| minor | left | 0px | 708px | Optional alignment: left: 708px |
| major | width | 630.906px | 920px | Make Actual compute to Target value: width: 920px |
| major | min-width | auto | 0px | Make Actual compute to Target value: min-width: 0px |
| major | max-width | min(980px, 100% - 24px) | min(920px, 100% - 56px) | Make Actual compute to Target value: max-width: min(920px, 100% - 56px) |
| major | height | 161.344px | 210.875px | Make Actual compute to Target value: height: 210.875px |
| major | min-height | auto | 0px | Make Actual compute to Target value: min-height: 0px |
| minor | transform | none | matrix(1, 0, 0, 1, -460, 0) | Optional alignment: transform: matrix(1, 0, 0, 1, -460, 0) |
| minor | transform-origin | 315.453px 80.6719px | 460px 105.438px | Optional alignment: transform-origin: 460px 105.438px |

### Matched Child Computed CSS

This compares child elements with the same tree path and tag. It ignores class-name differences but checks critical computed layout/style properties.

| Path | Tag | Actual classes | Target classes | Property | Actual | Target | Suggested action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | position | static | relative | Make the Actual node at 0 compute position: relative |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | width | 630.906px | 920px | Make the Actual node at 0 compute width: 920px |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | height | 161.344px | 210.875px | Make the Actual node at 0 compute height: 210.875px |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | gap | 8px | 7px | Make the Actual node at 0 compute gap: 7px |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | row-gap | 8px | 7px | Make the Actual node at 0 compute row-gap: 7px |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | column-gap | 8px | 7px | Make the Actual node at 0 compute column-gap: 7px |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | grid-template-columns | 630.906px | 920px | Make the Actual node at 0 compute grid-template-columns: 920px |
| 0 | section | .location-flow-panel .location-flow-drawer .is-open | .guided-flow-panel .guided-flow-drawer .is-open | grid-template-rows | 111.344px 42px | 161.875px 42px | Make the Actual node at 0 compute grid-template-rows: 161.875px 42px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | width | 630.906px | 920px | Make the Actual node at 0.0 compute width: 920px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | height | 111.344px | 161.875px | Make the Actual node at 0.0 compute height: 161.875px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | padding-top | 0px | 12px | Make the Actual node at 0.0 compute padding-top: 12px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | padding-right | 0px | 12px | Make the Actual node at 0.0 compute padding-right: 12px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | padding-bottom | 0px | 12px | Make the Actual node at 0.0 compute padding-bottom: 12px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | padding-left | 0px | 12px | Make the Actual node at 0.0 compute padding-left: 12px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | gap | 8px | 9px 11px | Make the Actual node at 0.0 compute gap: 9px 11px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | row-gap | 8px | 9px | Make the Actual node at 0.0 compute row-gap: 9px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | column-gap | 8px | 11px | Make the Actual node at 0.0 compute column-gap: 11px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | align-items | stretch | normal | Make the Actual node at 0.0 compute align-items: normal |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | grid-template-columns | 273.469px 349.438px | 370.859px 512.141px | Make the Actual node at 0.0 compute grid-template-columns: 370.859px 512.141px |
| 0.0 | div | .location-flow-drawer__panel | .guided-flow-drawer__panel | grid-template-rows | 61.3438px 42px | 82.875px 44px | Make the Actual node at 0.0 compute grid-template-rows: 82.875px 44px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | width | 273.469px | 370.859px | Make the Actual node at 0.0.0 compute width: 370.859px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | height | 61.3438px | 82.875px | Make the Actual node at 0.0.0 compute height: 82.875px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | padding-top | 11px | 10px | Make the Actual node at 0.0.0 compute padding-top: 10px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | padding-right | 12px | 10px | Make the Actual node at 0.0.0 compute padding-right: 10px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | padding-bottom | 11px | 10px | Make the Actual node at 0.0.0 compute padding-bottom: 10px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | padding-left | 12px | 10px | Make the Actual node at 0.0.0 compute padding-left: 10px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | gap | 12px | 10px | Make the Actual node at 0.0.0 compute gap: 10px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | row-gap | 12px | 10px | Make the Actual node at 0.0.0 compute row-gap: 10px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | column-gap | 12px | 10px | Make the Actual node at 0.0.0 compute column-gap: 10px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | grid-template-columns | 148.188px 87.2812px | 226.156px 112.703px | Make the Actual node at 0.0.0 compute grid-template-columns: 226.156px 112.703px |
| 0.0.0 | div | .location-flow-drawer__next | .guided-flow-drawer__next | grid-template-rows | 37.3438px | 60.875px | Make the Actual node at 0.0.0 compute grid-template-rows: 60.875px |
| 0.0.0.0 | div | .location-flow-drawer__next-copy | .guided-flow-drawer__next-copy | width | 148.188px | 226.156px | Make the Actual node at 0.0.0.0 compute width: 226.156px |
| 0.0.0.0 | div | .location-flow-drawer__next-copy | .guided-flow-drawer__next-copy | height | 37.3438px | 60.875px | Make the Actual node at 0.0.0.0 compute height: 60.875px |
| 0.0.0.0 | div | .location-flow-drawer__next-copy | .guided-flow-drawer__next-copy | grid-template-columns | 148.188px | 226.156px | Make the Actual node at 0.0.0.0 compute grid-template-columns: 226.156px |
| 0.0.0.0 | div | .location-flow-drawer__next-copy | .guided-flow-drawer__next-copy | grid-template-rows | 8px 12.0938px 11.25px | 9px 16.1875px 29.6875px | Make the Actual node at 0.0.0.0 compute grid-template-rows: 9px 16.1875px 29.6875px |
| 0.0.0.1 | button | (none) | (none) | width | 87.2812px | 112.703px | Make the Actual node at 0.0.0.1 compute width: 112.703px |
| 0.0.0.1 | button | (none) | (none) | height | 36px | 34px | Make the Actual node at 0.0.0.1 compute height: 34px |
| 0.0.0.1 | button | (none) | (none) | min-height | 36px | 34px | Make the Actual node at 0.0.0.1 compute min-height: 34px |
| 0.0.0.1 | button | (none) | (none) | padding-right | 14px | 11px | Make the Actual node at 0.0.0.1 compute padding-right: 11px |
| 0.0.0.1 | button | (none) | (none) | padding-left | 14px | 11px | Make the Actual node at 0.0.0.1 compute padding-left: 11px |
| 0.0.1 | div | .location-flow-drawer__timeline | .guided-flow-drawer__timeline | width | 349.438px | 512.141px | Make the Actual node at 0.0.1 compute width: 512.141px |
| 0.0.1 | div | .location-flow-drawer__timeline | .guided-flow-drawer__timeline | height | 61.3438px | 82.875px | Make the Actual node at 0.0.1 compute height: 82.875px |
| 0.0.1 | div | .location-flow-drawer__timeline | .guided-flow-drawer__timeline | grid-template-columns | 32px 251.438px 32px | 32px 414.141px 32px | Make the Actual node at 0.0.1 compute grid-template-columns: 32px 414.141px 32px |
| 0.0.1 | div | .location-flow-drawer__timeline | .guided-flow-drawer__timeline | grid-template-rows | 41.3438px | 62.875px | Make the Actual node at 0.0.1 compute grid-template-rows: 62.875px |
| 0.0.1.0 | button | .location-flow-nav-btn .location-flow-nav-btn--previous | .monster-flow-nav-btn .monster-flow-nav-btn--previous | position | static | relative | Make the Actual node at 0.0.1.0 compute position: relative |
| 0.0.1.0 | button | .location-flow-nav-btn .location-flow-nav-btn--previous | .monster-flow-nav-btn .monster-flow-nav-btn--previous | max-width | none | 32px | Make the Actual node at 0.0.1.0 compute max-width: 32px |
| 0.0.1.0 | button | .location-flow-nav-btn .location-flow-nav-btn--previous | .monster-flow-nav-btn .monster-flow-nav-btn--previous | max-height | none | 32px | Make the Actual node at 0.0.1.0 compute max-height: 32px |
| 0.0.1.1 | nav | .location-flow-progress | .brief-wizard__progress .monster-flow-progress | width | 251.438px | 414.141px | Make the Actual node at 0.0.1.1 compute width: 414.141px |
| 0.0.1.2 | button | .location-flow-nav-btn .location-flow-nav-btn--next | .monster-flow-nav-btn .monster-flow-nav-btn--next | position | static | relative | Make the Actual node at 0.0.1.2 compute position: relative |
| 0.0.1.2 | button | .location-flow-nav-btn .location-flow-nav-btn--next | .monster-flow-nav-btn .monster-flow-nav-btn--next | max-width | none | 32px | Make the Actual node at 0.0.1.2 compute max-width: 32px |
| 0.0.1.2 | button | .location-flow-nav-btn .location-flow-nav-btn--next | .monster-flow-nav-btn .monster-flow-nav-btn--next | max-height | none | 32px | Make the Actual node at 0.0.1.2 compute max-height: 32px |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | width | 630.906px | 894px | Make the Actual node at 0.0.2 compute width: 894px |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | height | 42px | 44px | Make the Actual node at 0.0.2 compute height: 44px |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | gap | 8px | 9px | Make the Actual node at 0.0.2 compute gap: 9px |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | row-gap | 8px | 9px | Make the Actual node at 0.0.2 compute row-gap: 9px |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | column-gap | 8px | 9px | Make the Actual node at 0.0.2 compute column-gap: 9px |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | grid-template-columns | 311.453px 311.453px | 497.188px 387.797px | Make the Actual node at 0.0.2 compute grid-template-columns: 497.188px 387.797px |
| 0.0.2 | div | .location-flow-drawer__status-row | .guided-flow-drawer__status-row | grid-template-rows | 42px | 44px | Make the Actual node at 0.0.2 compute grid-template-rows: 44px |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | width | 311.453px | 140px | Make the Actual node at 0.0.2.0 compute width: 140px |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | max-width | none | 100% | Make the Actual node at 0.0.2.0 compute max-width: 100% |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | height | 42px | 44px | Make the Actual node at 0.0.2.0 compute height: 44px |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | padding-top | 7px | 8px | Make the Actual node at 0.0.2.0 compute padding-top: 8px |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | padding-right | 7px | 8px | Make the Actual node at 0.0.2.0 compute padding-right: 8px |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | padding-bottom | 7px | 8px | Make the Actual node at 0.0.2.0 compute padding-bottom: 8px |
| 0.0.2.0 | div | .location-flow-drawer__readiness | .guided-flow-drawer__readiness | padding-left | 7px | 8px | Make the Actual node at 0.0.2.0 compute padding-left: 8px |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | width | 311.453px | 387.797px | Make the Actual node at 0.0.2.1 compute width: 387.797px |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | height | 42px | 44px | Make the Actual node at 0.0.2.1 compute height: 44px |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | padding-top | 7px | 8px | Make the Actual node at 0.0.2.1 compute padding-top: 8px |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | padding-right | 7px | 8px | Make the Actual node at 0.0.2.1 compute padding-right: 8px |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | padding-bottom | 7px | 8px | Make the Actual node at 0.0.2.1 compute padding-bottom: 8px |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | padding-left | 7px | 8px | Make the Actual node at 0.0.2.1 compute padding-left: 8px |
| 0.0.2.1 | div | .location-flow-drawer__warnings | .guided-flow-drawer__warnings | justify-content | flex-end | normal | Make the Actual node at 0.0.2.1 compute justify-content: normal |
| 0.1 | div | .location-flow-drawer__toggle-row | .guided-flow-drawer__toggle-row | width | 630.906px | 920px | Make the Actual node at 0.1 compute width: 920px |
| 0.1.0 | button | .location-flow-drawer__stage-btn .location-flow-drawer__stage-btn--previous .tooltip-btn | .guided-flow-drawer__stage-btn .guided-flow-drawer__stage-btn--previous .tooltip-btn | position | static | relative | Make the Actual node at 0.1.0 compute position: relative |
| 0.1.0.1 | span | (none) | (none) | width | 38.1719px | 61.7969px | Make the Actual node at 0.1.0.1 compute width: 61.7969px |
| 0.1.1 | button | .location-flow-drawer__toggle | .guided-flow-drawer__toggle | padding-right | 13px | 10px | Make the Actual node at 0.1.1 compute padding-right: 10px |
| 0.1.1 | button | .location-flow-drawer__toggle | .guided-flow-drawer__toggle | padding-left | 13px | 12px | Make the Actual node at 0.1.1 compute padding-left: 12px |
| 0.1.1 | button | .location-flow-drawer__toggle | .guided-flow-drawer__toggle | gap | 12px | 10px | Make the Actual node at 0.1.1 compute gap: 10px |
| 0.1.1 | button | .location-flow-drawer__toggle | .guided-flow-drawer__toggle | row-gap | 12px | 10px | Make the Actual node at 0.1.1 compute row-gap: 10px |
| 0.1.1 | button | .location-flow-drawer__toggle | .guided-flow-drawer__toggle | column-gap | 12px | 10px | Make the Actual node at 0.1.1 compute column-gap: 10px |
| 0.1.1 | button | .location-flow-drawer__toggle | .guided-flow-drawer__toggle | grid-template-columns | 359.141px 88.8594px 20px | 330.25px 123.75px 22px | Make the Actual node at 0.1.1 compute grid-template-columns: 330.25px 123.75px 22px |
| 0.1.1.0 | span | .location-flow-drawer__toggle-main | .guided-flow-drawer__toggle-main | width | 359.141px | 330.25px | Make the Actual node at 0.1.1.0 compute width: 330.25px |
| 0.1.1.0 | span | .location-flow-drawer__toggle-main | .guided-flow-drawer__toggle-main | height | 19px | 26.1875px | Make the Actual node at 0.1.1.0 compute height: 26.1875px |
| 0.1.1.0 | span | .location-flow-drawer__toggle-main | .guided-flow-drawer__toggle-main | grid-template-columns | 359.141px | 330.25px | Make the Actual node at 0.1.1.0 compute grid-template-columns: 330.25px |
| 0.1.1.0 | span | .location-flow-drawer__toggle-main | .guided-flow-drawer__toggle-main | grid-template-rows | 9px 8px | 11px 13.1875px | Make the Actual node at 0.1.1.0 compute grid-template-rows: 11px 13.1875px |
| 0.1.1.1 | span | .location-flow-drawer__toggle-meta | .guided-flow-drawer__toggle-meta | width | 88.8594px | 123.75px | Make the Actual node at 0.1.1.1 compute width: 123.75px |
| 0.1.1.1 | span | .location-flow-drawer__toggle-meta | .guided-flow-drawer__toggle-meta | height | 8px | 22px | Make the Actual node at 0.1.1.1 compute height: 22px |
| 0.1.1.1 | span | .location-flow-drawer__toggle-meta | .guided-flow-drawer__toggle-meta | gap | 8px | 6px | Make the Actual node at 0.1.1.1 compute gap: 6px |
| 0.1.1.1 | span | .location-flow-drawer__toggle-meta | .guided-flow-drawer__toggle-meta | row-gap | 8px | 6px | Make the Actual node at 0.1.1.1 compute row-gap: 6px |
| 0.1.1.1 | span | .location-flow-drawer__toggle-meta | .guided-flow-drawer__toggle-meta | column-gap | 8px | 6px | Make the Actual node at 0.1.1.1 compute column-gap: 6px |
| 0.1.1.2 | svg | .lucide .lucide-chevron-down | .lucide .lucide-chevron-down | width | 15px | 16px | Make the Actual node at 0.1.1.2 compute width: 16px |
| 0.1.1.2 | svg | .lucide .lucide-chevron-down | .lucide .lucide-chevron-down | height | 15px | 16px | Make the Actual node at 0.1.1.2 compute height: 16px |
| 0.1.2 | button | .location-flow-drawer__stage-btn .location-flow-drawer__stage-btn--next .tooltip-btn | .guided-flow-drawer__stage-btn .guided-flow-drawer__stage-btn--next .tooltip-btn | position | static | relative | Make the Actual node at 0.1.2 compute position: relative |

### Root Layout

Bounding box:

| Metric | Actual | Target | Delta Actual-Target | Suggested action |
| --- | --- | --- | --- | --- |
| x | 404.55 | 260 | 144.55 | Adjust Actual x to match Target. |
| y | 702.09 | 659.11 | 42.98 | Adjust Actual y to match Target. |
| top | 702.09 | 659.11 | 42.98 | Adjust Actual top to match Target. |
| left | 404.55 | 260 | 144.55 | Adjust Actual left to match Target. |
| right | 1035.45 | 1180 | -144.55 | Adjust Actual right to match Target. |
| bottom | 863.44 | 869.98 | -6.54 | Adjust Actual bottom to match Target. |
| width | 630.91 | 920 | -289.09 | Adjust Actual width to match Target. |
| height | 161.34 | 210.88 | -49.54 | Adjust Actual height to match Target. |

Parent-relative metrics:

| Metric | Actual | Target | Delta Actual-Target | Suggested action |
| --- | --- | --- | --- | --- |
| offsetLeftFromParent | 393.55 | 249 | 144.55 | Adjust Actual parent-relative offsetLeftFromParent to match Target. |
| offsetTopFromParent | 616.70 | 571.72 | 44.98 | Adjust Actual parent-relative offsetTopFromParent to match Target. |
| widthRatioToParent | 0.44 | 0.65 | -0.21 | Adjust Actual parent-relative widthRatioToParent to match Target. |
| heightRatioToParent | 0.20 | 0.26 | -0.06 | Adjust Actual parent-relative heightRatioToParent to match Target. |

### Root Pseudo-elements

None.

## DOM Nesting

Actual ancestor chain:

```text
body
div#root
div.app-shell
main.app-shell__workspace
section
section.darken-workspace.crucible-workspace
div#darkenComposerPanel
div.cruor-composer-shell.location-composer
div.cruor-composer-workspace.location-composer__workspace
main.cruor-composer-stage.location-composer__stage
section.location-map-stage.has-live-preview.is-simple-surface.is-map-synced.location-map-stage--preview
div.location-stage-progress-dock.location-stage-progress-dock--map
```

Target ancestor chain:

```text
body
div#root
div.app-shell
main.app-shell__workspace
section
section.monster-crucible-workspace.crucible-workspace
section#monsterComposerPanel
div.cruor-composer-shell.monster-composer.monster-shell
main.monster-workspace
section.monster-anatomy-composer
div.monster-silhouette-stage.anatomy-stage.is-frame-mode
div.monster-stage-progress-dock.monster-stage-progress-dock--frame
```

## Direct Children — Tag-only

Actual:

```text
section
```

Target:

```text
section
```

## Tag-only Subtree Shape

Actual:

```text
div
  section
    div
      div
        div
        button
      div
        button
        nav
        button
      div
        div
        div
    div
      button
        svg
        span
      button
        span
        span
        svg
      button
        span
        svg
```

Target:

```text
div
  section
    div
      div
        div
        button
      div
        button
        nav
        button
      div
        div
        div
    div
      button
        svg
        span
      button
        span
        span
        svg
      button
        span
        svg
```

## Class-aware Subtree Shape — Informational

This includes class names only to help identify elements. It is not a failure by itself if the tag-only structure matches.

Actual:

```text
div.location-stage-progress-dock.location-stage-progress-dock--map
  section.location-flow-panel.location-flow-drawer.is-open
    div#locationFlowDrawerPanel.location-flow-drawer__panel
      div.location-flow-drawer__next
        div.location-flow-drawer__next-copy
        button
      div.location-flow-drawer__timeline
        button.location-flow-nav-btn.location-flow-nav-btn--previous
        nav.location-flow-progress
        button.location-flow-nav-btn.location-flow-nav-btn--next
      div.location-flow-drawer__status-row
        div.location-flow-drawer__readiness
        div.location-flow-drawer__warnings
    div.location-flow-drawer__toggle-row
      button.location-flow-drawer__stage-btn.location-flow-drawer__stage-btn--previous.tooltip-btn
        svg.lucide.lucide-chevron-left
        span
      button.location-flow-drawer__toggle
        span.location-flow-drawer__toggle-main
        span.location-flow-drawer__toggle-meta
        svg.lucide.lucide-chevron-down
      button.location-flow-drawer__stage-btn.location-flow-drawer__stage-btn--next.tooltip-btn
        span
        svg.lucide.lucide-chevron-right
```

Target:

```text
div.monster-stage-progress-dock.monster-stage-progress-dock--frame
  section.guided-flow-panel.guided-flow-drawer.is-open
    div#monsterFlowDrawerPanel.guided-flow-drawer__panel
      div.guided-flow-drawer__next
        div.guided-flow-drawer__next-copy
        button
      div.guided-flow-drawer__timeline
        button.monster-flow-nav-btn.monster-flow-nav-btn--previous
        nav.brief-wizard__progress.monster-flow-progress
        button.monster-flow-nav-btn.monster-flow-nav-btn--next
      div.guided-flow-drawer__status-row
        div.guided-flow-drawer__readiness
        div.guided-flow-drawer__warnings
    div.guided-flow-drawer__toggle-row
      button.guided-flow-drawer__stage-btn.guided-flow-drawer__stage-btn--previous.tooltip-btn
        svg.lucide.lucide-chevron-left
        span
      button.guided-flow-drawer__toggle
        span.guided-flow-drawer__toggle-main
        span.guided-flow-drawer__toggle-meta
        svg.lucide.lucide-chevron-down
      button.guided-flow-drawer__stage-btn.guided-flow-drawer__stage-btn--next.tooltip-btn
        span
        svg.lucide.lucide-chevron-right
```

## Root Class Differences — Informational

Class names do **not** need to match if the computed output and DOM role are equivalent.

Actual only:

```text
location-stage-progress-dock
location-stage-progress-dock--map
```

Target only:

```text
monster-stage-progress-dock
monster-stage-progress-dock--frame
```

Shared:

```text
None.
```

## Element Snapshots

Actual rect:

```json
{
  "x": 404.55,
  "y": 702.09,
  "width": 630.91,
  "height": 161.34,
  "top": 702.09,
  "right": 1035.45,
  "bottom": 863.44,
  "left": 404.55
}
```

Target rect:

```json
{
  "x": 260,
  "y": 659.11,
  "width": 920,
  "height": 210.88,
  "top": 659.11,
  "right": 1180,
  "bottom": 869.98,
  "left": 260
}
```

## ChatGPT Prompt Summary

Goal: make the Actual Places element match the Target Monsters element visually and structurally, while keeping Places-specific class names and CSS selectors. Actual selector: .location-stage-progress-dock.location-stage-progress-dock--map. Target selector: .monster-stage-progress-dock.monster-stage-progress-dock--frame. The browser-rendered comparison reports MISMATCH. Ancestor/wrapper DOM differences: 1. Critical root computed style differences: 6. Critical child computed style differences: 93. Root bounding-box layout differences: 8. Parent-relative root layout differences: 4. Ignore class-name differences as structural mismatches. Classes must remain Places-specific unless explicitly requested. Focus on matching tag hierarchy, child order, computed CSS, positioning, size, spacing, and rendered layout.

## Output Files

- Markdown: reports\element-comparison\20260626-150117-actual-places-stage-progress-dock-target-monsters-stage-progress-dock.md
- JSON: reports\element-comparison\20260626-150117-actual-places-stage-progress-dock-target-monsters-stage-progress-dock.json
