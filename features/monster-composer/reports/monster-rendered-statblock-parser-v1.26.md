# Monster Composer — Rendered Stat Block Parser QA v1.26

## Goal

Validate the final rendered monster stat block, not only the structured JSON/ability model.

The parser checks that export text and renderable stat block output remain aligned with the final fitted D&D 2024 rules profile.

## Added Module

- `features/monster-composer/model/monster-statblock-parser.js`

Parser version:

- `rendered-statblock-parser-v1.26`

## What the Parser Checks

### Global rendered text

- unresolved `{tokens}`
- `undefined`, `null`, or `NaN` output
- rendered CR mismatch against final target CR

### Attack actions

- attack-roll abilities must render `Attack Roll: +X`
- rendered attack bonus must match the final fitted `computed.attack`
- melee attacks should include reach
- ranged attacks should include range

### Saving throw abilities

- save abilities must render `Saving Throw: DC X`
- rendered DC must match the final fitted `computed.dc`
- save abilities should use explicit `Failure:` / `Success:` clauses

### Damage text

- damaging ability models must render a parseable damage amount/dice expression
- rendered damage without structured damage metadata is flagged for review

### Conditions

- modeled conditions should render with 2024 wording: `has the X condition`
- legacy wording such as `is Blinded` / `becomes Frightened` is flagged
- rendered condition text without structured condition metadata is flagged

### Usage / area hints

- recharge abilities should render `Recharge`
- area effects should include a clear size/shape/range expression

## Integration Points

Updated files:

- `features/monster-composer/model/monster-composer.export.js`
- `features/monster-composer/model/monster-publish-gate.js`
- `features/monster-composer/monster-composer.page.jsx`
- `features/monster-composer/qa/monster-frame-builders.js`
- `features/monster-composer/qa/monster-batch-qa.js`
- `features/inspiration-studio/qa/MonsterBatchQaModal.jsx`

## Publish Gate Behavior

Parser errors become publish blockers.

Parser warnings become review notes.

Parser info remains debug-only.

## Batch QA Additions

Generated monster summaries now include:

- `statBlockParserStatus`
- `statBlockParserErrors`
- `statBlockParserWarnings`
- `statBlockParserInfo`

Batch analytics now include:

- `statBlockParserPassed`
- `statBlockParserReview`
- `statBlockParserFailed`
- `statBlockParserNotRun`

The Studio QA modal now shows parser tiles in the summary grid.

## Notes

This is intentionally a deterministic parser, not an AI semantic reader. Metadata remains the source of mathematical truth; rendered text is checked against that metadata.
