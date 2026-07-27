# Phase 8 — Catalog Editorial Review

## Scope

The complete Graft V2 catalog was reviewed horizontally, against MM'25 wording density, and for table playability.

## Material changes

### Attack Pattern differentiation

- **Crusher** now uses **Crushing Pin**, restricted to prone targets or targets beside a solid surface.
- **Grappler** now uses **Hooking Slam**, pulling prey into capture range instead of copying Crusher's charge package.
- **Grave Eater** now uses **Feeding Tendrils**, a single-target corpse pull, while **Corpse Binder** retains the area restraint identity.
- **Juggernaut** replaces the borrowed Acid Vomit package with **Pressure Burst**, a concussive knockdown option.
- **Venom Spitter** now uses **Clotting Spit**, a long-range slowing attack.
- **Shadow Weaver** gains access to Shadow Web at the veteran CR band instead of remaining mechanically identical to other venom patterns.

All public graft IDs and nested ability IDs remain stable.

### Cost, complexity, and compatibility

- Attack Pattern costs and complexity were corrected where compiled output exceeded legacy metadata.
- All family-level declared complexity values now meet their authored profiles.
- Spider Climb and Wall Stalker now surface a soft duplicate-climbing warning.
- Web Swing, Web Architect, Snapping Webs, Broodmother Web, and Dense Webs share a soft `web_infrastructure` warning to prevent accidental tracking overload.

### Stat-block wording

The largest rendered outliers were compressed without deleting adjudication:

- Choking Air;
- Funeral Silence;
- Broodmother Web;
- Pressure Vent;
- Dangerously Unstable;
- Changing Mask;
- Last Meal Memory;
- Shame.

The catalog retains a higher median word count than MM'25 because grafts expose reusable procedures and counterplay. No rendered ability exceeds the 90-word hard limit.

## Result

The catalog now has distinct Attack Pattern identities, aligned complexity metadata, bounded tracking combinations, verified renderer parity, and a reproducible Phase 8 publication gate.
