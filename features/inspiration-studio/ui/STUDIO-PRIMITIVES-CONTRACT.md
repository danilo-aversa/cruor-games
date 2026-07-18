# Content Studio UI primitives contract

Status: Phase 6 cleanup complete. Monsters and all specialized Location editors consume one shared primitive library. The compatibility adapter has been removed, shared tab state is represented only by `aria-selected`, and `studio-primitives.css` is the canonical owner of controls, fields, sections, collections, warnings, and editor chrome.

## Canonical scale

| Token | Value | Use |
| --- | ---: | --- |
| `--studio-control-height` | `40px` | Input, select, textarea minimum height |
| `--studio-control-height-compact` | `30px` | Inline actions |
| `--studio-icon-control-size` | `24px` | Icon-only actions |
| `--studio-section-header-height` | `40px` | Accordion and details summaries |
| `--studio-field-gap` | `6px` | Label-to-control spacing |
| `--studio-grid-gap` | `12px` | Field grid spacing |
| `--studio-section-gap` | `10px` | Content spacing inside sections |
| `--studio-section-padding` | `12px` | Section and collection body padding |

Typography continues to use the existing site tokens. Field labels and compact actions use `--text-size-s` or `--text-size-xs`; section titles use `--text-size-m`. Domain editors must not introduce independent type scales for equivalent controls.

## Primitive responsibilities

- `StudioField` owns label, icon, tooltip, stable field anchor, width modifier, and accessible label/control association.
- `StudioFieldGrid` owns one-, two-, three-, or four-column composition. Semantic type must not select a unique grid class.
- `StudioInput`, `StudioNumberInput`, `StudioTextarea`, `StudioSelect`, and `StudioCheckbox` own controlled value conversion only. Domain normalization remains outside the UI layer.
- `StudioButton` and `StudioIconButton` own default, compact, and danger actions.
- `StudioTabs` and `StudioTab` own tab semantics and active state. Page layouts may change orientation but not redefine active styling.
- `StudioSection` is reserved for content that must always remain visible.
- `StudioCollapsibleSection` is the default authoring section.
- `StudioAdvancedDetails` contains technical metadata and low-frequency controls.
- `StudioCollectionEditor` and `StudioCollectionItem` own array presentation, item headers, per-item disclosure, add, and remove actions. They never mutate array data themselves.
- `StudioEditorHeader` owns type, title, status, coverage/readiness, and primary actions.
- `StudioWarningSummary` owns the compact four-category summary and delegates detailed field links to `StudioWarningList`.
- `StudioPreviewSection` and `StudioDangerZone` are semantic compositions of the same collapsible primitive, not independent design systems.

## State contract

Use props or generic state attributes for `compact`, `active`, `disabled`, `danger`, `warning`, `covered`, `partial`, `full-width`, and column count. `data-semantic-type` may identify content for diagnostics and tests, but must not control the editor layout.

## Disclosure defaults

Metadata, semantic authoring sections, preview, non-blocking warning details, and Danger Zone remain closed by default. Blocking warnings open their summary. Collections open at most one item initially. The editor controller opens every ancestor disclosure containing a linked invalid field, including nested collection items. Keying editors by component id resets all native disclosure state when selection changes.

## Accessibility contract

All fields receive a stable DOM id when `componentId` and `path` are supplied. Help triggers remain keyboard-focusable. Tabs expose `role="tab"` and `aria-selected`. Collapsible sections use native `details` and `summary`. Remove actions inside summaries stop propagation so they do not toggle the item. Focus styling uses the existing Studio focus token.

## Creator shell boundary

The Content Studio runs in `data-shell-mode="creator"`. The public `SiteTopbar` and its transient navigation overlay are not mounted in this mode. Creator workspaces own the full `100dvh`; desktop overflow remains constrained to the workspace while narrow layouts retain document scrolling. Switching into creator mode clears any pending transient-navigation state. Studio geometry must not subtract `--app-shell-bar-height` or target `.app-shell__bar`.

## CSS ownership

`studio-primitives.css` is the canonical owner of equivalent controls. `inspiration-studio.styles.css` remains responsible for page composition, rails, workspace geometry, and truly Studio-specific layouts. Equivalent generic declarations have been removed from the monolith; only page composition and contextual modifiers remain there.
