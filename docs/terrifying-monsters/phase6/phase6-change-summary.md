# Terrifying Monsters — Phase 6 Change Summary

## Completed

- Migrated all 75 non-Attack grafts to Graft v2.
- Added explicit identity, balance, complexity, counterplay, spike-risk, migration, and authoring metadata.
- Added structured effect, defense, summon, procedure, and parity declarations where required by the original mechanic.
- Verified renderer parity for all 75 support grafts.
- Added authored CR progression to 12 mechanics whose operation materially changes with CR.
- Generalized the existing Attack Pattern progression projector so non-Attack bundles can apply CR-scoped ability and rule patches.
- Added support-graft schema validation, catalog auditing, deterministic reports, and QA integration.
- Added `progression` to the source-authority comparison boundary.
- Preserved legacy IDs, source anchors, slots, presets, and UI behavior.

## CR-scaled support grafts

`egg-carrier`, `horrific-apparition`, `dangerously-unstable`, `shadow-jump`, `underbelly-weak-spot`, `toxic-detonation`, `purge-fluid-flood`, `face-curse`, `choking-air`, `corpse-pressure-room`, `web-dancer`, and `shadow-stillness`.

## Deliberately unchanged

- No JSX, CSS, layout, controls, sidebars, stat-block presentation, or UI labels.
- No Creator Studio or Content Studio files.
- No source-authority cutover; current production families remain native-authoritative.
- No automatic DPR multiplication from CR progression.

## Remaining work

Phase 7 performs full-repository QA, batch generation, public-output hardening, preset/save compatibility checks, build verification, and removal of obsolete fallback paths only after their consumers are proven unused.
