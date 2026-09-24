# Iteration 1 Review

## Iteration Goal

Build a reliable, testable body-map workflow that lets clients identify pain using familiar body areas and see the 3D model focus on the selected region. In parallel, investigate the form-submission and deployment dependencies that could block a complete sponsor workflow.

## Plan vs. Actual

### Completed

- Refactored the body-map viewer into a clearer module and established one application entry point (PR #55).
- Defined twelve stable, user-facing body areas, including the added Arm and Leg regions (PR #57).
- Built a readable muscle catalog from the anatomical model while preserving side-specific source data (PR #58).
- Added muscle-to-area mappings for the supported regions (PRs #59 and #60).
- Added accessible body-area controls, exclusive selection, change-area behavior, and clear-selection behavior (PR #56).
- Added spatial highlighting and camera focus for selected areas, including distinct Upper Back and Lower Back views (PR #60).
- Added the shared body-map state foundation, synchronized area and side state, deterministic camera behavior, and accepted/canceled reset handling (PR #64).
- Added and repaired static-site continuous-integration checks for HTML, JavaScript, required files, and body-map tests (PRs #11 and #12).
- Reorganized the repository and expanded development, testing, deployment, and EmailJS documentation (PRs #13 and #38).
- Investigated the form-submission failure and updated the repository's EmailJS test credentials (PR #62).

### Incomplete / Blocked / Carried Forward

- The muscle-list and exact-spot work in PRs #65 and #66 was merged into stacked feature branches but has not yet been integrated into `main`.
- The selected muscle or exact-spot data is not yet saved with all required form-submission fields on `main`, despite #51 being closed.
- Email details and mobile/accessibility acceptance work remain (#52 and #53).
- The final deployment process, ownership, and production credentials still require confirmation (#40); closed issue #61 supplies test credentials only.
- The deployment investigation does not yet contain a final sponsor recommendation (#15).
- Automated browser checks do not send a real email. Live email delivery still depends on the sponsor-owned EmailJS configuration and a production deployment check.

### Added During Iteration

- Arm and Leg were added to the supported body areas, expanding the original ten-region scope to twelve regions.
- The team moved from anatomy-oriented search toward a visual workflow: choose a familiar area first, then optionally identify a more exact spot.
- Additional state, reset, responsive-layout, model-load-failure, and browser-workflow tests were added as the body-map components were integrated.
- EmailJS credential troubleshooting and related documentation became iteration work after the submission failure was reproduced.

## Demonstrated

The integrated application on `main` supports the following review path:

1. Choose one of twelve familiar body areas.
2. Observe the model highlight and focus on the selected region.
3. Rotate and zoom the model, including distinct Upper Back and Lower Back views.
4. Change the selected area, clear the selection, or reset the form while preserving or clearing state as appropriate.

The team also prepared the form-submission error and credential correction as evidence of the EmailJS investigation. The live demo should use the exact commit identified by the `iteration-1-submission` tag.

## Quality / Testing

- All 29 Node tests passed on the final reviewed `main` working tree.
- HTMLHint scanned `src/index.html`, `src/upperbodyscan.html`, and `src/lowerbodyscan.html` with zero errors.
- The GitHub Actions workflow runs HTML validation, JavaScript syntax checks, body-map tests, and required-file checks on pushes to `main` and on pull requests.
- Playwright browser coverage exercises all twelve area controls, keyboard interaction, responsive widths, camera focus, material restoration, model-load failures, and accepted and canceled reset behavior.
- Pull requests and peer review provide traceable completion evidence for the major body-map changes.

One non-blocking Node warning remains: ES modules are inferred because `package.json` does not currently declare a module type.

## Sponsor Feedback

The sponsor need emphasized an interface that clients can use without knowing anatomical terminology. That need guided the decision to present familiar regions such as Neck, Shoulder, Arm, Wrist/Hand, Hip, and Leg before offering optional exact-spot selection. Sponsor troubleshooting also helped identify the correct EmailJS configuration needed for form delivery.

## Resulting Backlog Changes

- Treat the twelve familiar body areas as the supported baseline for the body-map workflow.
- Carry form persistence for muscle/exact-spot data into the next iteration.
- Integrate the stacked muscle-list and exact-spot branches into `main` before presenting those features as part of the main application.
- Carry mobile and accessibility acceptance work forward with explicit acceptance evidence.
- Complete the deployment recommendation and document account ownership, credentials, and production configuration.
- Verify live EmailJS delivery in the production environment without making real-email delivery part of automated browser CI.
- Keep incomplete and externally blocked work visible in the GitHub Project results and remaining-backlog views.
