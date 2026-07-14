# Cruor Games Design System

Shared visual components must be reused before feature-specific visual classes are created. Consult the [component catalog](component-catalog.md) and [class decision tree](class-decision-tree.md) before styling a new reusable control. Exceptions follow the [override policy](override-policy.md).

## Official dropdown system

Dropdowns, listboxes, context menus, popup selection menus, and submenu flyouts use the site-wide `.cruor-dropdown-*` component system.

- Canonical stylesheet: `shared/styles/dropdowns.css`
- Canonical visual reference: Dark Places room style context menu and its flyouts
- Implementation audit: [dropdown-family-audit.md](dropdown-family-audit.md)
- Migration inventory: [dropdown-family-migration.json](dropdown-family-migration.json)
- API and semantic examples: [Dropdowns, Listboxes and Context Menus](component-catalog.md#dropdowns-listboxes-and-context-menus)
- Class-selection rules: [Dropdown branch](class-decision-tree.md#dropdown-branch)

New dropdowns, listboxes, context menus and submenu flyouts must use the `.cruor-dropdown-*` system.

Feature-specific classes may supplement shared dropdown classes only for layout, positioning, portal anchoring, collision handling, dimensions required by the feature, scroll ownership or feature behavior.

Feature-specific classes must not independently redefine the shared dropdown’s colors, borders, backgrounds, shadows, typography, icon treatment, hover, focus, selected or disabled states.

Shared CSS classes provide visual behavior; HTML roles, ARIA state, keyboard interaction, dismissal, focus management, and portal placement remain implementation responsibilities.

## Official Composer right information rail

Right-side Composer rails that summarize the current generated or configured entity use the existing `.cruor-composer-*` system in `shared/styles/composer-system.css`.

- Canonical visual reference: Terrifying Monsters Current Monster Frame
- Component catalog: [Composer Right Information Rails](component-catalog.md#composer-right-information-rails)
- Focused audit: [composer-info-rail-audit.md](composer-info-rail-audit.md)
- Migration inventory: [composer-info-rail-migration.json](composer-info-rail-migration.json)

New equivalent right information rails must reuse the shared rail, card, fact, name-editor, and meter classes. Feature hooks may supplement them only for placement, layout, required geometry, scroll ownership, behavior, and runtime/test selectors; they must not recreate card surfaces, typography, fact rows, name editors, meters, shared spacing, or generic states.


## Official Composer slot cards

Reusable Composer assignment slots use `ComposerSlotCard` from `components/ui/composer-slot-card.jsx` and the `.cruor-composer-slot-card*` classes in `shared/styles/composer-system.css`.

- Canonical visual reference: Terrifying Monsters silhouette slot cards.
- Shared states: `is-empty`, `is-filled`, `is-active`, and `is-linked-hover`.
- Feature code may retain data attributes, ARIA roles, refs, handlers, layout modifiers, and feature-specific mechanical states such as `is-missing` or `is-suggested`.
- Feature styles must not recreate the card surface, header/body typography, badge, or generic interaction states.
