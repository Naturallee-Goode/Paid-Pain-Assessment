# Naturallee Goode Pain Assessment

This project is a browser-based pain-consultation intake for Naturallee Goode. Clients can describe their concerns, choose a familiar body area on an interactive 3D map, and optionally explore muscles before continuing to booking. The body-area information is educational and is not a diagnosis.

**Sponsor:** Mia Miller, Naturallee Goode. **Team:** Griffen Bon, Jay Roy, Lily Oswald, and Girwan Dhakal.

## Current status

Iteration 2 adds an area-first experience, optional advanced muscle browsing, area information, selection and reset improvements, and test-account booking routes. The repository's `main` branch is the integration source; the public site may serve a different version. Production editing access and live email delivery remain unresolved. The Calendly links in the repository are test-account links, not confirmed sponsor booking links. See the [iteration review](course/iterations/iteration-2/review.md) and [remaining work](https://github.com/orgs/Naturallee-Goode/projects/1/views/12).

## Run and verify

The application is static HTML, CSS, and JavaScript in `src/`. It needs an HTTP server, browser access to its CDN dependencies, and the checked-in 3D asset. For a MIME-safe local server, setup and test commands, see the [development guide](docs/development-guide/Development.md) and [test plan](docs/testing/test-plan.md). Do not use real client information when testing.

## Project and documentation

- [GitHub Project](https://github.com/orgs/Naturallee-Goode/projects/1) · [Product Backlog](https://github.com/orgs/Naturallee-Goode/projects/1/views/2) · [Iteration 2 results](https://github.com/orgs/Naturallee-Goode/projects/1/views/7) · [Remaining Backlog](https://github.com/orgs/Naturallee-Goode/projects/1/views/12)
- [User guide](docs/user-guide/README.md) · [Development guide](docs/development-guide/Development.md) · [Test plan](docs/testing/test-plan.md) · [Deployment guide](docs/deployment-guide/Deployment.md)
- [Security assessment](docs/security/security-assessment.md) · [Security maintenance](docs/security/maintenance-checklist.md) · [Handoff FAQ](docs/faq/README.md)
- Iteration 2: [planning and planning snapshot](course/iterations/iteration-2/planning.md), [review](course/iterations/iteration-2/review.md), [retrospective](course/iterations/iteration-2/retrospective.md), and [Project-view snapshots](course/iterations/iteration-2/project-snapshots/README.md).
- [Course presentations](course/presentations/) and [issues](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues).

The iteration 2 presentation and submission tag should be linked here after they are committed and created. A live demo should use synthetic data and the integrated version under review.
