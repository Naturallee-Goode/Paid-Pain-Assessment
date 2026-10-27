# Issue #86: intake body-map selection

The body-map store is read at submission time. The submitted data, EmailJS parameters, and confirmation use one selection snapshot after any area change, view switch, or reset. The selected area is represented by its readable label and stable ID. Muscle is optional and carries its readable name and stable ID only when selected. Side is optional; an omitted side is `Not specified` in both email parameters and confirmation.

EmailJS parameters for the account template are `body_area`, `body_area_id`, `muscle`, `muscle_id`, and `pain_side`. The external template must include whichever of these fields the sponsor wants visible in delivered messages. This repository cannot confirm the account's current template or live delivery from automated tests.

## Verification

- `npm run test:body-map`: 54 passed, including area change, simple-view exit, reset, omitted side, and explicit side values.
- `npm run lint:html`: 3 files scanned, no errors.
- `ISSUE86_EVIDENCE_DIR=docs/testing/evidence/issue-86 npm run test:intake`: passed for [area only](./evidence/issue-86/area-only.png), [detailed with side unspecified](./evidence/issue-86/detailed-no-side.png), and [detailed with Both](./evidence/issue-86/detailed-both.png). The browser test replaces EmailJS with a mock and compares every displayed selection field with the captured payload. It sends no live email.

Live delivery and a sanitized delivered-email comparison remain dependent on access to the sponsor's EmailJS account and production deployment.
