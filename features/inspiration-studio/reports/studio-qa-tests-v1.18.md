# Studio QA Tests v1.18

## Scope

Fixes the Monster Batch QA report export introduced in v1.17.

## Changes

- Replaced uncompressed stored ZIP exports with compressed browser-side ZIP exports using `CompressionStream("deflate-raw")` when available.
- Delayed Blob URL revocation so Chrome can finish the download before the temporary URL is released.
- Exported a compact QA JSON payload by default, stripping heavy browser-only generated contexts, rendered artifacts, full computed payloads, and long strings.
- Kept the Markdown summary inside the same ZIP.
- Added a small README inside the exported ZIP explaining that the JSON is compact.
- Added export button state feedback: `Compressing…` while the ZIP is being generated.

## Expected Result

QA report ZIP downloads should be much smaller, open normally, and no longer remain as unusable `.tmp` files.
