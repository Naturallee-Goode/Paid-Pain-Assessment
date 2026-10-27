# Handoff FAQ

## What does the application do?

It provides a consultation intake with an area-first 3D body map, optional muscle exploration, confirmation, and an embedded booking flow. See the [user guide](../user-guide/README.md). The displayed common-issue information is educational, not a diagnosis.

## Where is the source and how is work tracked?

The source is the `src/` directory in the [team repository](https://github.com/Naturallee-Goode/Paid-Pain-Assessment); `main` is the integration branch. The [GitHub Project](https://github.com/orgs/Naturallee-Goode/projects/1) tracks work, and [course/](../../course/) contains iteration records. The published site must not be assumed to match `main`.

## Who owns the accounts and how is the live site changed?

The sponsor and team must confirm ownership and administrator access for the public site, EmailJS, destination mailbox, and Calendly. The exact page-editing and deployment path remains unresolved in [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68). Do not share passwords through repository files or Issues. See the [deployment guide](../deployment-guide/Deployment.md).

## How does data move, and is it stored?

The form constructs a browser-side submission and sends it through EmailJS to a configured recipient; the booking widget uses Calendly. The repository does not include an application database. Provider logs, email retention, backups, and account settings need owner verification; absence of an application database does not establish that third parties retain nothing. See the [security assessment](../security/security-assessment.md).

## Are delivery and booking production-ready?

Production editing access and a live end-to-end email check are still open ([#5](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/5), [#40](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/40), [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68)). Current Calendly routes in source point to a test account; the sponsor must confirm production event URLs. Use synthetic data for testing.

## What about service costs and limits?

Confirm the actual plans, quotas, retention settings, renewal dates, and applicable agreements with each account owner and provider. Historical estimates in investigation notes may have changed and are not a purchase recommendation.

## What work remains?

Consult the [remaining backlog view](https://github.com/orgs/Naturallee-Goode/projects/1/views/12) and [open Issues](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues). The view is a living record and may not include every open repository Issue; cross-check hosting, delivery, sponsor copy review, and accessibility follow-ups.
