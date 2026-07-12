# Phase 0 baseline results

Date: 2026-07-12. Branch: `refactor/sitewide-design-system`. Starting and current committed HEAD: `be61f98fd2537d367c757bf9796b11735bc7d193` (all Phase 0 work remains uncommitted at measurement time).

| Command | Result | Notes |
| --- | --- | --- |
| `npm ls @playwright/test playwright --depth=0` | PASS | Both 1.60.0; package and lockfile consistent. |
| `npx playwright --version` | PASS | 1.60.0. |
| `npx playwright install --dry-run` | PASS | Expected Chromium 1223, headless shell 1223, Firefox 1522; no `PLAYWRIGHT_*` override. |
| `npx playwright install chromium firefox` | INCOMPLETE | Exit 0 but stale cache metadata left executables absent. |
| `npx playwright install --force chromium firefox` | PASS | Downloaded Chromium 148.0.7778.96, headless shell, Firefox 150.0.2, FFmpeg and Winldd. |
| Existing `npm run test:e2e` before cache access | BLOCKED | 10/10 could not see headless shell from sandbox; 242.6s and 302.2s command timeouts while reporter retained failed artifacts. |
| Existing `npm run test:e2e` with browser-cache access | FAIL (pre-existing) | 2 passed, 8 failed, 1m40s test time. Failures: outdated Home selectors (3), settings-menu sequence (1), Dark Places pointer interception (4). |
| `npx playwright test tests/e2e/design-system --list` | PASS | 80 cases / 5 files / 2 projects enumerated. |
| Chromium explicit visual update | PARTIAL then PASS after targeted reruns | Initial 21/27 passed; targeted semantic/timeout corrections generated remaining images. |
| Firefox explicit visual update | PARTIAL then PASS after targeted reruns | Initial 23/27 passed; targeted readiness and semantic corrections generated remaining images. |
| Monster Navigator targeted update | PASS | 2/2, Chromium and Firefox. |
| `npm run test:visual:design-system -- --workers=4 --reporter=list` | PASS after one targeted baseline correction | 53/54 passed initially; the stale pre-mask Home mobile Chromium baseline was explicitly updated, then passed comparison. 56 PNG files represent 54 visual tests. |
| `npm run test:scrollbars:design-system -- --workers=2 --reporter=list` | PASS | 14 passed, 12 skipped (browser-specific filters plus expected `fixme` contracts), 30.5s. |
| `npm run build` | PASS | 2198 modules, 31.68s Vite time; existing unresolved font URL and large-chunk warnings. |
| `npm run test:run` | PASS | 25 files, 165 tests, 27.94s Vitest duration. |
| `npm run monster:qa` | FAIL (pre-existing) | 18 issues: 7 errors and 11 info; same frame-fit/scaling failures recorded by the audit. |
| `npm run qa:composer-assignment` | PASS | 0 issues. |
| `npm run qa:room-design` | PASS | 0 issues. |
| `node scripts/design-system-audit/generate-inventories.mjs --check` | PASS | CSS/token outputs current. |
| `node docs/design-system/audit/.selector-audit-generator.cjs --check` | PASS | Selector inventory current and valid. |
| `npm run qa:dark-places -- --project=chromium --workers=4 --reporter=list` | FAIL (pre-existing, diagnostic run before Firefox scoping) | Nested npm script did not forward project/worker flags, so 8 tests ran. Seven timed out on the known rail interception over Generate; Firefox export additionally rejected Chromium-only clipboard permissions. Firefox is now scoped to design-system specs, preventing that accidental legacy-suite expansion on subsequent runs. |

Expected pre-existing failures were recorded, not repaired in Phase 0. The repository-map generator was not run because Phase 0 changes test infrastructure/docs only and the worktree already contains unrelated repository-map edits that must remain untouched.
