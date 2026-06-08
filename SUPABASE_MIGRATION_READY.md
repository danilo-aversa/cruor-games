# Cruor Games — Pre-Supabase Content Freeze

This document describes the intended stopping point before connecting Cruor Games content to Supabase.

The current goal is not to write to Supabase yet. The goal is to make the static content layer exportable, strict-validatable, and replaceable by a future repository adapter without touching the generators again.

## Current Static Content Shape

Cruor content is organized as:

```txt
shared/content/inspiration-modules/*.js
→ Inspiration Modules
→ Content Packs
→ Static Content Registry
→ Inspirations Page / Inspiration Studio / Generators
```

Each Inspiration Module owns or references:

```txt
Source Anchor
Public Inspiration Card
Monster Grafts
Location Components
Location Regions
Referenced Source Anchors
```

The active static repository currently exposes:

```txt
loadContentRegistry()
loadContentPackProvenance()
loadContentPackSummaries()
loadInspirationModules()
```

These functions are the seam that a future Supabase adapter should replace.

## Added Pre-Supabase Utilities

### Static Repository Adapter

`shared/content/content-repository.adapter.js`

Defines:

```txt
createContentRepositoryAdapter()
createStaticContentRepository()
STATIC_CONTENT_REPOSITORY
```

The existing `shared/content/content-repository.js` now routes through this adapter while preserving the public API used by the app.

### Strict Content Validation

`shared/content/content-validation.js`

Adds strict validation for static content beyond basic Content Pack checks:

```txt
Monster graft rules
Monster constraints
Monster anatomy grants
Location region metadata
Structured migration markers
Recharge values
Targeting and damage objects
```

Run:

```bash
npm run content:validate
```

### Canonical JSON Export

`scripts/export-content-registry.mjs`

Run:

```bash
npm run content:export
```

This writes canonical files to:

```txt
dist/content/cruor-content-registry.json
dist/content/cruor-content-registry-data.json
dist/content/cruor-inspiration-modules.json
dist/content/cruor-content-pack-summaries.json
dist/content/cruor-content-validation-report.json
dist/content/cruor-content-export-manifest.json
```

These files are the recommended bridge format for a future Supabase seed/import script.

## Future Supabase Mapping

Recommended tables:

```txt
content_packs
source_anchors
inspiration_cards
content_components
monster_grafts
monster_rules
monster_constraints
monster_anatomy_grants
location_components
location_regions
content_pack_memberships
taxonomies
taxonomy_values
content_taxonomy_links
```

The first Supabase migration should be an import/upsert from the canonical JSON export, not a direct rewrite of the live Studio.

## Migration Order

Recommended future order:

```txt
1. Keep static registry as source of truth.
2. Export canonical JSON.
3. Build Supabase schema from the exported shape.
4. Write local seed/upsert script.
5. Add read-only Supabase adapter.
6. Test generators against Supabase reads.
7. Only then let Inspiration Studio write to Supabase.
```

## Explicit Stop Point

Stop before:

```txt
Creating Supabase tables
Adding Supabase client credentials
Writing Studio saves to Supabase
Replacing static reads in production
```

Continue with generator QA before any database integration.

## Known Remaining Architecture Note

`shared/content/monster-components.js` still adapts legacy/core Monster Composer graft data into shared content components. This is acceptable for the pre-Supabase freeze, but the long-term ideal remains:

```txt
shared/content is the canonical source
features/* consume shared/content
features/* do not feed shared/content
```

The current adapter/export layer is designed so that this remaining inversion can be removed later without changing generator behavior.
