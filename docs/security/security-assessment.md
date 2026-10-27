# Security and Privacy Assessment

**Scope:** repository version reviewed October 27, 2026. This is an engineering assessment, not a legal determination or certification. Account configuration and the public deployment have not been independently verified.

## Data and trust boundaries

The intake collects contact and health-related answers in the browser. `src/form-submission.mjs` builds the EmailJS parameters; `src/script.js` sends them through EmailJS. A destination mailbox and the provider may retain messages or logs according to their settings. The confirmation embeds a Calendly booking widget. The 3D page loads third-party browser scripts; scanner pages load MediaPipe resources and request camera access. The repository has no application server or database, but third-party systems may store data.

## Current risks and open questions

| Area | Assessment and follow-up |
| --- | --- |
| Live hosting and access | The actual editing/deployment path is not established. Confirm the owner, deployment location, HTTPS, and edit access before production changes: [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68). |
| Email delivery and retention | Verify the intended service, template, mailbox, access, retention and production delivery with synthetic data. Existing failure is tracked in [#5](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/5) and [#40](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/40). A passing mocked test is not a live delivery test. |
| Legal and contractual requirements | Earlier investigation notes include tentative and conflicting conclusions. The sponsor should obtain appropriate legal/compliance guidance and confirm provider agreements and controls where applicable; do not claim HIPAA compliance or non-applicability from those notes alone. See [investigation notes](../testing/HIPAA%20check.txt) and [requirements notes](../testing/HIPAA%20requirements.txt). |
| Client-side configuration | Browser-delivered identifiers are visible to visitors. Never treat a public identifier as a secret or commit passwords, private keys, mailbox credentials, or real intake records. Confirm service-side restrictions and abuse controls with the account owner. |
| External dependencies | Third-party scripts and booking/email services create availability, privacy, and supply-chain dependencies. Review versions and provider policies, and test failure behavior when changing them. |
| Booking | Current source uses test-account Calendly URLs. Confirm sponsor-owned event URLs and privacy settings before production use. |
| Camera | Scanner pages require browser camera permission. Confirm the behavior and provider data handling before making claims about retention or transmission. |

## Verification and maintenance

Use [synthetic test data](../testing/test-plan.md), restrict account access to appropriate maintainers, record unresolved decisions, and use the [maintenance checklist](maintenance-checklist.md). Confirm actual deployment, service settings, and data handling with the owners before claiming readiness.
