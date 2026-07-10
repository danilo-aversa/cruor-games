# Content Packs

## Scope

Content packs are stored under `shared/content/content-packs/` and documented partly under `docs/content-packs/`.

## Responsibilities

- Provide static authored content records.
- Use IDs and source anchors consumed by the shared content registry.
- Supply workflows, slots, components, inspirations, taxonomies, and provenance data where applicable.

## Consumers

`shared/content/static-registry.js` and `shared/content/registry.js` are the canonical consumers. Features should normally consume normalized registry output rather than raw pack files.

## Tests

Run `npm run content:validate` after pack changes. If the pack feeds Monster Composer or Darken workflows, run the relevant feature QA too.

## Findings

- Confirmed: content packs are canonical source data, while generated registry exports are derived.
- Risk: medium to high depending on whether IDs or schema fields are changed.

