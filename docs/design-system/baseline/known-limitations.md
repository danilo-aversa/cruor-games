# Known limitations

## Environment

- The initial Playwright cache metadata was inconsistent: `playwright install` returned success while executables were absent. `playwright install --force chromium firefox` repaired it. The documented clean-machine command remains the normal non-force command.
- In the Codex sandbox, browser caches under `%LOCALAPPDATA%\ms-playwright` are invisible to confined processes; browser runs required permission to access the user cache. This is not a repository limitation.
- Build emits the existing unresolved `public/fonts/cruor-font.otf` warning and chunk-size warning.
- Snapshots are platform-separated. This Windows baseline does not assert pixel identity against Linux rendering.

## Determinism and masks

- Only the Home video element is masked because video decode/frame timing varied between consecutive full-page captures. It is paused at time zero first; all surrounding hero content remains compared.
- Remote/font availability can affect rasterization, hence platform-specific storage and font readiness waiting.

## Pre-existing product/test failures

- Existing E2E baseline: 2 passed, 8 failed after browsers became available. Home smoke assertions reference removed copy/actions; accessibility settings closes between choices; four Dark Places pipeline tests cannot click Generate because the left rail intercepts pointer events.
- The Monster Navigator requires the current two-step accessible flow: `Open Body Slot`, then `Focus Body`.
- Studio starts with the library collapsed at compact desktop width; owner tests expand `Inspiration library` before inspecting the list.

## Desired contracts marked `fixme`

- Browser-native Chromium document scrollbar.
- Browser mode disabling feature-local nested scrollbar CSS.
- Custom mode reaching every representative nested owner.
- A single Component Navigator vertical owner.
- No competing body/panel scroll owner in standalone map UI.

These are intentionally not encoded as passing broken behavior. They link directly to the later global scrollbar phase.

## Coverage gaps

- Monster secondary-window live export is not snapshotted.
- Dark Places export cannot receive a stable screenshot until the pre-existing Generate interception is resolved separately.
- Studio data-heavy QA/tool modals and authenticated/external surfaces have no synthetic bypass. No reachable router route requires credentials in the current tree.
