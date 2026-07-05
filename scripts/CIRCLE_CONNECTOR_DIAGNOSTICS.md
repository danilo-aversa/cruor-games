# Circle Connector Diagnostics

Diagnostic-only Vitest suite for circular room corridor anchors/connectors.

## Package script

Add this line to `package.json` under `scripts`:

```json
"qa:circle-connectors": "vitest run --config scripts/vitest.circle-connectors.config.mjs --reporter=default"
```

Then run:

```bash
npm run qa:circle-connectors
```

You can also run it directly:

```bash
npx vitest run --config scripts/vitest.circle-connectors.config.mjs --reporter=default
```

## Reports

The suite writes:

- `reports/circle-connector-diagnostics.report.md`
- `reports/circle-connector-diagnostics.report.json`

## Scope

The diagnostics stress circular room connectors and anchors across many radial drag directions. They record:

- snapped portal cell vs expected perimeter square;
- routing cell preview/commit consistency;
- whether each connector is exactly one regular grid square;
- mouth/floor continuity between circle and portal square;
- wall continuity at the circular mouth and portal square;
- repeatability for cardinal and oblique drags.
