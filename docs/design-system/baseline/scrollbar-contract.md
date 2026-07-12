# Scrollbar mode contract

The preference is the `scrollbar` field in localStorage key `cruor.accessibility`. Default is `custom`. Before React renders, normalized settings are applied to `document.documentElement` as `data-a11y-scrollbar="custom|browser"`; the same state remains across route changes and reloads.

## Desired Custom contract

- Root state and persistence are `custom`.
- Chromium document and intended nested owners expose WebKit pseudo-element styling.
- Firefox owners expose non-native `scrollbar-width` and `scrollbar-color` where a scrollbar is intended.
- Home document, Component Navigator, Dark Places details, Monster rail/list, map UI, Studio library, and overlay lists participate consistently.

Currently passing: persistence/navigation/reload in both browsers; keyboard selection; Home root `scrollbar-width:none` in Firefox; Home root WebKit width `0px` in Chromium; Dark Places wide-details owner with a hidden outer rail.

Known desired failure: feature-local nested rules are not governed by the preference across all routes. `Custom applies to representative nested surfaces across routes` is `test.fixme` until the scrollbar migration phase supplies one shared mode-aware system.

## Desired Browser contract

- Root state and persistence are `browser`.
- Document and nested owners reset custom WebKit pseudo-elements and Firefox scrollbar properties to native values.
- Navigation/reload cannot reintroduce feature-local custom rules.

Currently passing: persistence, root attribute and keyboard activation in both browsers.

Known desired failures:

- Chromium still receives unconditional root rules from `shared/styles/theme.css`; `Browser restores native Chromium document scrollbars` is `fixme`.
- Studio and other nested owners retain feature CSS; `Browser disables feature-local styling on nested surfaces` is `fixme` in both browsers.

The computed-style helper reads standard `scrollbarWidth`/`scrollbarColor` and Chromium `::-webkit-scrollbar`/`::-webkit-scrollbar-thumb` values. Screenshots complement but do not replace these assertions.

## Scroll ownership

`inspectScrollChain` records overflow mode, client/scroll height and every ancestor. `expectVerticalScrollOwner` rejects an unexpected independently scrollable ancestor. Passing coverage includes Dark Places' intentional hidden rail plus scrolling details, Studio/Monster named owners, and viewport-lock cleanup. Component Navigator and standalone map competing-owner contracts remain narrowly marked `fixme`; they describe the future contract rather than endorsing current nested ownership.
