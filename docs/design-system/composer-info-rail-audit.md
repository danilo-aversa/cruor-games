# Composer right information rail audit

## Canonical source

The canonical visual source is the Terrifying Monsters right information rail in `features/monster-composer/components/monster-composer.anatomy.jsx`:

- `FrameInfoPanel` renders Current Monster Frame.
- `GraftInfoPanel` renders the matching current-graft information variant.
- `MonsterNameEditor`, `FrameSummaryRow`, `AnatomyMeter`, and `FrameMeter` render the recurring internals.

Canonical feature styles were previously supplied by `monster-frame-info*`, `monster-frame-name-editor`, and `monster-meter*` selectors in `features/monster-composer/monster-composer.styles.css`. Existing rail/card/fact primitives and tokens already lived in `shared/styles/composer-system.css`, with final shared card edge and scrollbar treatment in `shared/styles/composer-internals.css`.

## Shared source and import order

`shared/styles/composer-system.css` is the single canonical source. It is imported globally from `app/main.jsx` before feature CSS. Migrated feature selectors are narrowed with `:not(...)` compatibility guards so they no longer replace shared visuals. `shared/styles/composer-internals.css` continues to provide the final Composer scrollbar and right-edge card treatment after feature styles.

## Canonical selectors and declarations

| Area              | Original canonical selectors                                              | Shared owner                                                                     |
| ----------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Rail              | `.monster-frame-info`, `.anatomy-stage__column--right.monster-frame-info` | `.cruor-composer-rail`, `--right`, `--info`, `--scroll`, `.cruor-scroll-surface` |
| Cards             | `.monster-frame-info-card`, `--hero`                                      | `.cruor-composer-rail-card`, `--hero`                                            |
| Hero eyebrow/meta | card child `span`, hero child `em`                                        | `.cruor-composer-rail-card__eyebrow`, `__meta`                                   |
| Name editor       | `.monster-frame-name-editor` and descendant input states                  | `.cruor-composer-rail-card__name-editor`, `__name-input`                         |
| Facts             | `.monster-frame-info-grid`, `.monster-frame-info-row` and descendants     | `.cruor-composer-fact-grid`, `-row`, `-label`, `-value`                          |
| Meters            | `.monster-meter`, `__head`, `__value`, `__track` and fill states          | `.cruor-composer-meter` and element classes                                      |

The canonical card system uses a 10px card gap, 11px padding, the shared sidebar block border/background/shadow, a 92px hero minimum height, 12px hero block padding, and a 7px hero gap. Facts use a 6px grid gap and rows use a 10px content gap with `7px 8px` padding.

The canonical meter uses a 6px internal gap, 8px stacked-meter gap, 8px header gap, 8px track height, `--cruor-color-blood-strong-a500` border, `--cruor-surface-card` track, `--cruor-gradient-linear-115-7b4295c6` fill, `--cruor-shadow-box-051`, and the existing over-budget gradient/color states.

The editable name remains a transparent, borderless 34px-minimum input using the existing font, size, weight, tracking and text shadow. Hover stays transparent; focus retains the blood-glow underline. Tooltip button colors, borders, hover and focus remain feature/canonical tooltip-button responsibilities; the meter controls only flex placement and gap.

## Variables

Existing rail/card/fact variables were reused. Meter variables added under the existing Composer token group are:

- `--cruor-composer-meter-gap`
- `--cruor-composer-meter-stack-gap`
- `--cruor-composer-meter-head-gap`
- `--cruor-composer-meter-label-color`
- `--cruor-composer-meter-label-size`
- `--cruor-composer-meter-value-color`
- `--cruor-composer-meter-over-color`
- `--cruor-composer-meter-track-height`
- `--cruor-composer-meter-track-border`
- `--cruor-composer-meter-track-background`
- `--cruor-composer-meter-fill-background`
- `--cruor-composer-meter-fill-background-over`
- `--cruor-composer-meter-fill-shadow`

## States, responsiveness, and scrolling

- Name input default, hover, and focus states are shared without behavior changes.
- Meter normal and `.is-over` value/fill states are shared.
- `ComposerRail` preserves right/info data attributes, responsive stage placement, and the single `--scroll` owner.
- Direct Dark Places details rails now use the same right/info/scroll classes and global `cruor-scroll-surface`; no nested scroll container was added.
- Feature CSS retains parent grid placement, widths, min/max heights, stage transitions, overlay stacking, compact/minimal visibility, and action-card behavior.

## Confirmed matching rails

- Terrifying Monsters Current Monster Frame.
- Terrifying Monsters Current Graft/current monster information.
- Dark Places Current Place Frame details rail.
- Dark Places Current Location recap rail.

## Exclusions

Left control rails, export rails, action-only cards, map inspectors, component pickers, navigators, debug recorder cards, toolbars, modals, and ordinary panels are not right-side entity-summary rails and remain excluded.
