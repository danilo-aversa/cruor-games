# Duplicate visual patterns

Audit date: 2026-07-12  
Starting commit: `be61f98fd2537d367c757bf9796b11735bc7d193`

This report groups repeated patterns for future consolidation. It is not evidence that two implementations can be deleted or aliased without route, behavior, portal, and responsive verification.

## Quantitative baseline

- 193 groups define the same normalized custom-property value under different names.
- 1,357 raw-value groups (13,256 occurrences) exist outside the current canonical token files.
- The largest likely-token repetitions are `ease` (597), `0.12s` (369), `0.14s` (90), `transparent` (84), and recurring spacing/control sizes such as 10 px (468 spacing uses), 8 px (453), 12 px (262), 32 px (117 sizing uses), and 34 px (111).
- Raw values also include legitimate structural zeros, percentages, grid tracks, viewport math, SVG/map geometry, and anatomy coordinates. Frequency alone is not a migration rule.

## Repeated component patterns

| Candidate shared pattern | Current implementations | Evidence of visual equivalence | Required exception boundary |
| --- | --- | --- | --- |
| Rectangular action button | `.btn`, `.mvp-button`, `.location-primary-action`, `.location-secondary-action`, `.studio-button`, `.cruor-home__button`, `.inspirations-page__primary-action`, Monster action families | Dark surface/blood border, compact uppercase or strong label, hover/focus/disabled variants recur | Destructive meaning, toolbar geometry, async status and feature layout remain separate |
| Square icon button | `.icon-btn`, `.cruor-composer-icon-button`, `.location-icon-toggle-button`, `.map-tool-button`, `.studio-icon-button`, topbar controls | 24–42 px square controls, border/surface/hover/focus duplication | Toggle/menu/close semantics and accessible names cannot be inferred from visuals |
| Glass/dark panel | `.cruor-ui-panel-surface`, `.panel`, `.location-panel`, `.map-panel`, `.studio-panel`, `.inspirations-panel`, Monster workbench panels | Repeated translucent dark backgrounds, one-pixel muted/blood borders and shadows | Sticky/grid/height/overflow ownership must stay on layout classes |
| Interactive card | `.cruor-ui-card-surface`, `.cruor-composer-card`, `.component-card`, `.location-component-card`, Home/Inspirations/Studio/Monster cards | Same surface, selected border/glow, hover lift and compact metadata | Dragging, selection, compatibility scoring and button/article semantics differ |
| Section header | `.section-head`, panel heads, navigator heads, modal heads, page-specific eyebrow/title/meta groups | Repeated eyebrow/title/description/actions hierarchy | Preserve semantic heading level and feature action layout |
| Field shell | `.location-field*`, `.monster-field*`, `.studio-field*`, `.control-group`, Inspirations filters | Label/help/control/error patterns recur | Grid placement, validation behavior and portal selection remain local |
| Popup select | `.filter-combobox*`, `.location-choice-*`, `.map-control-select-*`, `.monster-frame-select-*`, `.inspirations-page__select-*` | Trigger, caret, listbox and option styling are substantially equivalent | Portal root, collision math, keyboard/focus, dismissal and z-index are behavioral contracts |
| Filter chip | `.cruor-composer-filter-chip`, `.navigator-filter-chip`, Studio filters, Inspirations chips, Monster source/category chips | Compact pill/rectangular selectable tokens and selected tone recur | Static metadata chips must not gain button semantics |
| Badge/status | Composer compatibility badges, Studio warnings/readiness, Dark Places flow/room status, Inspirations pack badges | Neutral/info/success/warning/danger tone system is reusable | Domain labels and scoring remain feature-owned |
| Modal shell | Home dialogs, map tests, Monster frame/template/navigator dialogs, Studio tool modals | Overlay/dark panel/header/body/footer/close patterns recur | Focus trap, body lock, Escape/backdrop policy, portal document and secondary-window exports differ |
| Empty/notice | `.empty`, `.location-empty*`, `.monster-warning*`, Studio empty/warning/issue families, map test statuses | Repeated inset surface, icon/title/body/action and severity colors | `role=status` versus `role=alert` is component behavior |
| Scrollbar | Root theme, `.cruor-scroll-surface`, Composer normalization, route descendant rules | 6–8 px square thumb/transparent track patterns repeat | Mode switching and actual scroll ownership must be solved first |

The proposed canonical APIs are documented in `component-inventory.md`. The strongest current reusable component is `ComposerRail`; it should be retained as a Composer pattern over lower-level generic primitives.

## Repeated token/value patterns

| Pattern | Examples | Recommendation |
| --- | --- | --- |
| Semantic colors hidden behind generated/hex names | Many `--cruor-color-hex-*` aliases resolve to text, muted, accent or surface values | Keep primitive palette values, introduce stable semantic aliases, retain old names temporarily |
| Same semantic surface under page prefixes | `--home-*`, `--inspirations-*`, `--studio-panel`, Composer UI surface aliases | Compare computed values and state roles before mapping to shared surface tokens |
| Empty/filled/active status visuals | Dark Places room/slot tokens and Monster anatomy empty/filled tokens share identical shadow groups | Candidate component/status tokens; layout and domain labels remain local |
| Workspace maximum width aliases | `--cruor-composer-workspace-max`, `--darken-workspace-max`, `--inspirations-workspace-max`, `--monster-*` | Shared sizing primitive plus compatibility aliases; verify route-specific exceptions |
| Spacing scale | 4, 6, 8, 10, 12, 14, 16 and 18 px appear across most stylesheets | Establish a primitive spacing scale, but do not replace geometry math mechanically |
| Control heights | 28–42 px repeated across buttons, icon controls, fields and toolbar items | Candidate size tokens with explicit small/medium/large names |
| Motion | `ease`, 0.12s, 0.14s and 0.16s dominate | Create named fast/normal/slow durations and standard easing; preserve feature animation timing where mechanics depend on it |
| Z-index | 51 distinct raw groups and 414 occurrences | Define named stacking bands only after portals and overlay ancestry are mapped |
| Borders/shadows | One-pixel milk/blood borders and dark panel shadows repeat across routes | Component/semantic tokens; do not flatten active, danger and modal elevation variants |

## File-level duplication and parallel attempts

| Candidate | Evidence | Confidence | Boundary |
| --- | --- | --- | --- |
| Monster start-flow stylesheet copy | Component-local and root-level files both have 945 lines; 827 of 835 nonblank lines are identical. Only the component-local file is imported. The root copy contains the same relative `../../../shared/styles/colors.css` import, which is unresolved from its root location. | High duplicate, medium deletion confidence | Confirm no external/dev loader references the root copy before removal |
| `composer-primitives.css` versus current Composer system | No runtime import. Historical reports explicitly state it was replaced by `composer-system.css` after cross-feature overrides caused regressions. | High transitional confidence | Preserve for history until a deliberate cleanup task verifies no external imports |
| `crucible.styles-old.css` | 9,858 lines, no confirmed runtime import, and no tracked textual reference by filename outside generated inventory. | High import-status confidence, medium deletion confidence | The DOM Crucible implementation is runtime-capable; prove external mounting and selector ownership first |
| `home-page-overrides.css` | Two-line tracked file, no runtime import; references occur only in the historical zip-apply log. | High | Verify hosting/templates do not inject it outside module imports |
| Shared React `Button`/`Card` wrappers | No tracked runtime import; wrappers add no class or variants. | High tracked-repo confidence | External package consumers are not visible to this audit |
| Nested `tests/tests/` copies | Excluded by Vitest/Playwright configs; stale relative imports documented by repository map. | High | Preserve until a cleanup task compares any unique assertions |

## Meaningful variants that should not be collapsed

- Composer rails are a domain pattern, not a generic sidebar replacement.
- Popup selects with body portals, stage portals and inline lists need one behavioral abstraction with adapters, not CSS aliases alone.
- Map SVG colors, hit zones, room/corridor dimensions and anatomy positioning are feature mechanics.
- Home sticky-scroll math and Studio persisted rail sizes are layout/domain tokens.
- Static chips, interactive filters, status badges and destructive actions may look similar but have different semantics.
- Root scrollbars, internal scroll surfaces and scroll ownership are three different contracts.
- Overlay z-index values cannot be normalized until portal roots and secondary-window rendering are tested.

## Consolidation gate

Before treating a duplicate as canonical:

1. prove both implementations are runtime-reachable or explicitly reference-only;
2. compare normal, hover, focus, active, disabled, error and responsive computed styles;
3. check selector consumers in `selector-dependencies.json`;
4. check portal ancestry and scroll ownership;
5. add the canonical class alongside the old class;
6. validate every consuming route before removing the compatibility alias.

No duplicate file, selector, variable or runtime implementation was removed in this audit.
