# Deployment Guide

## Architecture and current state

The repository provides a static site in `src/`, including HTML, CSS, browser JavaScript, and `src/assets/human-body2.glb`. Runtime integrations include EmailJS, Calendly, Three.js, and MediaPipe resources. The repository does not contain a backend or application database.

The public page's editing and deployment path has not been established. Access to one account or successful local preview does not prove the team can update the live assessment. Follow [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68) and confirm the page source, owner, publishing mechanism, and a reversible preview with the account owner before deploying. Do not assume the live page matches GitHub `main`.

The current source's Calendly routes use a test account. EmailJS production configuration and delivery remain unresolved in [#5](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/5) and [#40](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/40). [EmailJS setup notes](EMAILJS_SETUP.md) describe what to verify; provider plans and account settings must be confirmed directly with the owner.

## Local preview and checks

Follow the [development guide](../development-guide/Development.md) for a MIME-safe server and the [test plan](../testing/test-plan.md) for automated and manual checks. A server must return JavaScript MIME types for `.mjs`/`.js` and serve the model; the HTML response alone does not verify the viewer.

## Before an authorized production update

1. Confirm the sponsor-approved release commit, target site, owner, deployment permissions, rollback process, and actual publishing method.
2. Confirm all required files and the GLB asset will be served at the paths expected by the page. Verify JavaScript MIME types, HTTPS, and browser access to required external resources.
3. Have the account owner verify the email provider, destination, template fields, restrictions, retention, and appropriate agreements. Do not place private credentials or real client data in source control.
4. Replace test booking links with sponsor-confirmed event links through the normal reviewed workflow; check each route in an appropriate test environment.
5. Use synthetic data to verify the complete form, confirmation, booking, and email delivery on the intended deployment. Record results and unresolved limitations; review [security and privacy](../security/security-assessment.md).

For camera pages, verify browser camera permission and the deployment's secure-context requirements. Verify current service costs and quotas with the provider rather than relying on historical estimates.
