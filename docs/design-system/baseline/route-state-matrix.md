# Route and state matrix

All visual rows run in Chromium and Firefox. `W/C/M` means wide 1440x1080, compact 1100x800, and mobile 390x844.

| Route / surface | Entry point | Viewports | Captured states | Portal / scroll state | Test | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/` Home | `app/HomePage.jsx` | W/C/M | default, topbar, settings, focus, selected, disabled | body mega menu, tooltip context, contact dialog, document top/lock/restore | `routes.visual.spec.js`, `portals.visual.spec.js` | Baseline |
| `/?section=crucible` | `app/router.jsx` compatibility branch | W/C/M | routed Crucible default | shell and viewport lock boundary | `routes.visual.spec.js` | Baseline; compatibility URL only |
| `/darkplaces` | `DarkenLocationPage` | W/C/M | default, left/right rails, collapsible open/closed, immersive on/off | tooltip portal, rail/detail owner, body lock and navigation cleanup | `routes.visual.spec.js`, `composers.visual.spec.js`, `scroll-owners.spec.js` | Baseline; existing Generate pointer interception documented |
| `/darkplaces/map` | map-generator panel | W/C/M | standalone map workspace | panel/body owner contract | `routes.visual.spec.js`, `scroll-owners.spec.js` | Visual baseline; competing-owner desired test is fixme |
| `/terrifyingmonsters` | Monster Composer page | W/C/M | default, started composer, left/right rails, Body selected, Navigator open | Navigator ancestry, intentional rail/list owner | `routes.visual.spec.js`, `composers.visual.spec.js`, `scroll-owners.spec.js` | Baseline |
| `/inspirations` | Inspirations page | W/C/M | default dossier/archive | document scroll; immersive lock cleanup target | `routes.visual.spec.js`, `scroll-owners.spec.js` | Baseline |
| `/inspiration-studio` | Inspiration Studio page | W/C/M | default editor, compact collapsed rails | viewport lock; library owner after semantic expansion | `routes.visual.spec.js`, `scroll-owners.spec.js` | Baseline |
| Global shell/topbar | `AppShell`, `SiteTopbar` | W plus route matrix | default, hover, focus-visible, selected, disabled, settings open, Escape/focus return | mega menu under body, tooltip portal | `routes.visual.spec.js`, `portals.visual.spec.js` | Baseline |
| Dark Places output/export | Dark Places room key | existing desktop E2E | Frame to Rooms to Export journey | room-key list | `dark-places-pipeline.spec.js` | Pre-existing failure before export; no snapshot normalized |
| Monster output/export | Monster live export/popout | route baseline only | route default and composer state | secondary window | — | Gap: popout screenshot deferred; window creation is environment-sensitive |

The router exposes no independent legacy Crucible page. Its compatibility query resolves to the current Dark Places generator, so the matrix records that boundary without inventing another route.
