# Actual vs Target Element Report - Actual Places Stage Progress Dock → Target Monsters Stage Progress Dock

Generated: 2026-06-26T12:54:09.699Z

## Goal

Make **Actual** match **Target**. Class names are allowed to differ. The important checks are DOM structure, nesting, computed CSS, pseudo-elements, and rendered layout.

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
- Actual DOM structure differs from Target in 2 area(s).
- 6 critical computed style value(s) in Actual do not match Target.
- 8 bounding-box metric(s) differ.
- 4 parent-relative layout metric(s) differ.

Counts:

| Metric | Count |
| --- | --- |
| DOM differences | 2 |
| Computed style differences | 13 |
| Critical computed style differences | 6 |
| Bounding-box differences | 8 |
| Parent-relative layout differences | 4 |
| Pseudo-element differences | 0 |
| Actual-only classes | 2 |
| Target-only classes | 2 |

## What To Change In Actual

### DOM / Nesting

| Kind | Actual | Target | Suggested action |
| --- | --- | --- | --- |
| ancestor-tag-chain | body > div > div > main > section > section > div > div > div > main > section > div | body > div > div > main > section > section > section > div > main > section > div > div | Ancestor tag sequence differs. Match the structural wrappers used by Target. |
| subtree-shape | div.location-stage-progress-dock.location-stage-progress-dock--map<br>  section.location-flow-panel.location-flow-drawer.is-open<br>    div#locationFlowDrawerPanel.location-flow-drawer__panel<br>      div.location-flow-drawer__next<br>        div.location-flow-drawer__next-copy<br>        button<br>      div.location-flow-drawer__timeline<br>        button.location-flow-nav-btn.location-flow-nav-btn--previous<br>        nav.location-flow-progress<br>        button.location-flow-nav-btn.location-flow-nav-btn--next<br>      div.location-flow-drawer__status-row<br>        div.location-flow-drawer__readiness<br>        div.location-flow-drawer__warnings<br>    div.location-flow-drawer__toggle-row<br>      button.location-flow-drawer__stage-btn.location-flow-drawer__stage-btn--previous.tooltip-btn<br>        svg.lucide.lucide-chevron-left<br>        span<br>      button.location-flow-drawer__toggle<br>        span.location-flow-drawer__toggle-main<br>        span.location-flow-drawer__toggle-meta<br>        svg.lucide.lucide-chevron-down<br>      button.location-flow-drawer__stage-btn.location-flow-drawer__stage-btn--next.tooltip-btn<br>        span<br>        svg.lucide.lucide-chevron-right | div.monster-stage-progress-dock.monster-stage-progress-dock--frame<br>  section.guided-flow-panel.guided-flow-drawer.is-open<br>    div#monsterFlowDrawerPanel.guided-flow-drawer__panel<br>      div.guided-flow-drawer__next<br>        div.guided-flow-drawer__next-copy<br>        button<br>      div.guided-flow-drawer__timeline<br>        button.monster-flow-nav-btn.monster-flow-nav-btn--previous<br>        nav.brief-wizard__progress.monster-flow-progress<br>        button.monster-flow-nav-btn.monster-flow-nav-btn--next<br>      div.guided-flow-drawer__status-row<br>        div.guided-flow-drawer__readiness<br>        div.guided-flow-drawer__warnings<br>    div.guided-flow-drawer__toggle-row<br>      button.guided-flow-drawer__stage-btn.guided-flow-drawer__stage-btn--previous.tooltip-btn<br>        svg.lucide.lucide-chevron-left<br>        span<br>      button.guided-flow-drawer__toggle<br>        span.guided-flow-drawer__toggle-main<br>        span.guided-flow-drawer__toggle-meta<br>        svg.lucide.lucide-chevron-down<br>      button.guided-flow-drawer__stage-btn.guided-flow-drawer__stage-btn--next.tooltip-btn<br>        span<br>        svg.lucide.lucide-chevron-right | Subtree structure differs. Match Target child hierarchy; class names may remain Places-specific. |

### Computed CSS

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

### Layout

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

### Pseudo-elements

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

## Direct Children

Actual:

```text
section
```

Target:

```text
section
```

## Class Differences 

These are informational. Class names do **not** need to match if the computed output and DOM role are equivalent.

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

## Normalized Subtree Shape

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

Goal: make the Actual Places element match the Target Monsters element visually and structurally, while keeping Places-specific class names and CSS selectors. Actual selector: .location-stage-progress-dock.location-stage-progress-dock--map. Target selector: .monster-stage-progress-dock.monster-stage-progress-dock--frame. The browser-rendered comparison reports MISMATCH. DOM/nesting differences: 2. Critical computed style differences: 6. Bounding-box layout differences: 8. Parent-relative layout differences: 4. Do not copy Monsters class names into Places unless explicitly requested; instead, make the Places CSS compute to the same values and make the Places DOM nesting/child hierarchy equivalent.

## Output Files

- Markdown: reports\element-comparison\20260626-145409-actual-places-stage-progress-dock-target-monsters-stage-progress-dock.md
- JSON: reports\element-comparison\20260626-145409-actual-places-stage-progress-dock-target-monsters-stage-progress-dock.json
