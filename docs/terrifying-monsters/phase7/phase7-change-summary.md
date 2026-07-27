# Terrifying Monsters — Phase 7 Change Summary

## Scope

Phase 7 performs QA and public hardening only. It does not modify JSX, CSS, layout, Composer controls, Creator Studio, Content Studio, or Inspiration Studio.

## Runtime corrections

### Ability-first stat-block parsing

The parser previously resolved a rendered item through the parent graft before checking the item's full ability ID. A multi-ability Attack Pattern could therefore validate `Heavy Slam` with `Corpse Grab` rules. Exact ability IDs now have priority; parent-graft fallback is allowed only for a single unambiguous ability.

### Structured renderer precedence

Saving-throw rules now take precedence over generic trait prose. Structured area effects now take precedence over inferred defense text. This restores DC, Failure/Success clauses, named conditions, area shapes, area sizes, and origins in public stat blocks.

### Attack Pattern compatibility projection

Some patterns were rooted in a legacy secondary action such as Web, Brood Injection, Corpse Grab, or Corpse Tendrils. Existing runtime gates inspected only root `rules` and incorrectly injected a fallback Strike at high CR. Every Attack Pattern now projects its scalable primary ability to root `rules` strictly as a compatibility adapter; the full Graft v2 bundle remains authoritative.

`Corpse Tendrils` now uses the anatomy constraints of its Grave Bite primary action at pattern level. The tendril action remains an optional routine replacement rather than making the entire pattern incompatible with spirit bodies.

### Registry localization parity

The shared monster-component adapter now transports `i18n`. Seven localized Decomposition grafts previously differed from their registry shadows only because translations were dropped. Native and registry-shadow representations now match 90/90.

## QA hardening

Per-graft QA now:

- supports a `graftIds` scope for deterministic chunking and targeted diagnosis;
- supports optional debug-export validation without changing the full default;
- recognizes rendered IDs in `<graft-id>:<ability-id>` form;
- validates Graft v2 rather than only root legacy rules;
- checks only ability rules actually rendered at the selected CR;
- handles coordinated plural condition wording;
- explores multiple Monster Tiers;
- builds the least-complex legal support frame.

`buildExportArtifacts` now accepts an optional `includeDebugExport` flag. Full batch QA still validates debug payloads; fast forced coverage can skip the multi-megabyte debug export.

## Deterministic release matrix

The Phase 7 audit generates 84 monsters:

- four production Source Anchors;
- seven CR checkpoints: 1, 2, 5, 8, 10, 15, and 20;
- three frame profiles: standard, elite ambusher, and boss controller.

It also forces all 90 grafts into individual legal builds.

## Final gate

- 37/37 public-hardening checks pass.
- 90/90 forced graft cases pass.
- 84/84 deterministic matrix builds are publish-ready.
- 84/84 stat blocks pass parser validation.
- 84/84 public payloads and 84/84 debug payloads are valid.
- No synthetic high-CR fallback is added.
- No CR result is ±2 or more from target.
- Native and registry-shadow representations are equivalent 90/90.
