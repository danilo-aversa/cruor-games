# Storage And Side Effects

## Browser Storage

| Key | Owner | Purpose | Risk |
| --- | --- | --- | --- |
| `cruor.accessibility` | `shared/accessibility/accessibility.settings.js` | Accessibility settings | Changes affect global document datasets |
| `cruor:darken-location-composer:draft:v1` | `features/darken-location/composer/model/location-composer-draft.js` | Darken composer draft recovery | Schema changes need migration care |
| `cruor-studio-library-rail-size` | `features/inspiration-studio/InspirationStudioPage.jsx` | Studio left rail size | UI-only persistence |
| `cruor-studio-right-rail-size` | `features/inspiration-studio/InspirationStudioPage.jsx` | Studio right rail size | UI-only persistence |
| `cruorMapDebugCoordinates` | `features/darken-location/map-generator/map-generator.page.jsx` | Map debug coordinate visibility | Debug UI state |

## URL And History

`app/router.jsx` uses browser history APIs for public routes and compatibility query parameters. It listens for `popstate` and may prompt with `window.confirm` when leaving unsaved state.

## Event Listeners

- `app/router.jsx`: `popstate` and route-transition protection.
- `app/AppShell.jsx` and accessibility helpers: document-level accessibility-change event.
- `map-generator.page.jsx`: wheel, pointer, keyboard, resize, scroll, modal, menu, and custom QA events.
- `DarkenLocationComposerPage.jsx`: draft/save timers, before-unload style safety, drawer and export interactions.
- `monster-composer.page.jsx`: document pointer-down listener for navigator closure and popout beforeunload listener.
- `InspirationStudioPage.jsx`: panel sizing and export interactions.

Each listener should have a cleanup path in the owning React effect or popout lifecycle. Map editor listeners are the highest regression risk because they combine document/window events with mutable editor refs.

## Clipboard, Downloads, And DOM

- Map Generator serializes `#cruor-map-svg`, creates Blobs, object URLs, and download anchors, and falls back around clipboard availability.
- Monster Composer writes stat block/export payloads to the clipboard and opens a live export popout with `window.open`.
- Inspiration Studio creates downloadable JSON payloads.
- Node scripts write generated content, QA outputs, and repository-map data to disk.

## Network Calls

No first-party runtime network client layer was identified in the inspected architecture baseline. Asset loading is handled by the browser/Vite public asset model.
