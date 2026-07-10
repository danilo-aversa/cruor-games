# Public Assets

## Scope

Public assets live under `public/` and are served by Vite without module transformation.

## Responsibilities

- Provide browser-addressable static images, videos, icons, and fonts.
- Support landing/home and feature visual surfaces.
- Preserve stable public URL conventions for any asset referenced by markup or CSS.

## Maintenance

Binary assets are individually listed in `repository-map.json`. Area-level docs group them because image internals are not useful architecture data. Before deleting an asset, search for direct public path references in source, CSS, docs, and generated content.

## Tests

Build catches some missing module-imported assets. Public URL references may require browser verification.

