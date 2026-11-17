# Development Guide

## Project Overview

Paid Pain Assessment is a static HTML, CSS, and JavaScript application. It includes a client intake form, an interactive 3D body map, and upper- and lower-body scanner pages. EmailJS handles form email delivery, and Calendly provides booking after submission. The site runs in a browser without a build step; npm is used for development checks.

## Local Setup

From a terminal:

```bash
git clone https://github.com/Naturallee-Goode/Paid-Pain-Assessment.git
cd Paid-Pain-Assessment
npm ci
python3 -m http.server 8080 --directory src
```

Open `http://localhost:8080/` to view the intake form. Stop the server with Ctrl+C.

## Required Software

- Git and Python 3 for cloning and serving the site.
- Node.js 24 and npm for the repository's checks (Node.js 24 matches CI).
- A modern browser. Install Playwright's Chromium browser before running the browser checks: `npx playwright install chromium`.

## Codebase Structure

- `src/` — site pages, styles, JavaScript modules, and the `assets/human-body2.glb` model.
- `tests/` — automated source, browser, and intake checks.
- `docs/` — development, deployment, user, and testing documentation.
- `course/` — iteration planning and review records.
- `.github/` — issue templates and CI workflow.
- `package.json` — npm commands and development dependencies.

The main page is `src/index.html`; its form behavior is in `src/script.js`, and the 3D viewer is in `src/viewer.js`. The scanner pages are `src/upperbodyscan.html` and `src/lowerbodyscan.html`.

## Known Gotcha

Open the site through the local HTTP server, not by opening `src/index.html` with `file://`. The viewer fetches `src/assets/human-body2.glb`, which may fail to load from a local file URL.

## Running Tests

Run these commands from the repository root after `npm ci`:

```bash
npm run lint:html
npm run test:body-map
npx playwright install chromium
npm run test:browser
npm run test:intake
```

`lint:html` checks the three HTML pages. `test:body-map` runs the source tests. The browser and intake commands run Playwright checks; they start their own local HTTP servers and do not send live form emails.

## How the Application Works

The intake page loads `script.js` for form behavior and `body-map-app.mjs` for the body map. The latter initializes the area, educational-content, and side controls before importing the Three.js viewer. This lets clients choose an area and read its information while the model is loading or if it fails. There is no application server, database, account system, or save-and-resume feature.

| Responsibility | Main files |
| --- | --- |
| Intake layout and responsive styles | `src/index.html`, `src/styles.css`, `src/body-area-controls.css` |
| Supported areas and anatomical assignments | `src/body-areas.js`, `src/muscle-area-assignments.mjs`, `src/muscle-area-mapping.mjs` |
| Shared selection state and controls | `src/body-map-app.mjs`, `src/body-map-store.mjs`, `src/body-area-controls.mjs`, `src/side-controls.mjs`, `src/possible-issues.mjs` |
| Model, highlighting, camera, and muscle search | `src/viewer.js`, `src/muscle-catalog.js`, `src/muscle-options.mjs`, `src/area-muscle-search.mjs`, `src/body-area-focus.mjs` |
| Intake submission, email fields, and booking | `src/script.js`, `src/form-submission.mjs` |
| Inherited webcam scanners | `src/upperbodyscan.html`, `src/lowerbodyscan.html` |

### Body-map data and selection

1. `body-areas.js` defines the fifteen selectable IDs and labels. Keep an ID stable when changing its display label because selections and mappings use the ID. The sponsor-approved expansion replaced broad Arm and Leg choices with more precise regions in [PR #122](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/122).
2. `viewer.js` loads the checked-in `assets/human-body2.glb` file. `muscle-catalog.js` filters out non-muscle model objects, makes their names readable, and retains the original mesh and side. `muscle-area-mapping.mjs` applies the explicit assignments; `muscle-options.mjs` groups side-specific records under stable, side-neutral muscle IDs. The mapping decisions are recorded in [muscle-area-review.md](../testing/muscle-area-review.md).
3. `body-map-store.mjs` is the shared state for selected area, optional muscle and side, simple/advanced mode, and catalog readiness. Area controls, side controls, educational content, and viewer rendering subscribe to it. A new area clears the previous muscle and side. Returning to simple mode clears the muscle; Clear Selection resets the body-map state and camera without clearing unrelated form answers.
4. Simple mode starts with area selection and area-level educational content from `possible-issues-data.mjs`. Advanced mode enables area-filtered muscle browse/search and model muscle selection. A model click can select an area in simple mode; a muscle choice in advanced mode updates the store and viewer highlight. Search results remain within the current area. The educational panels are information, not a diagnosis.
5. `viewer.js` highlights the meshes assigned to the chosen area and fits the camera to their bounds. `body-area-focus.mjs` contains the region and camera rules; `body-side-filter.mjs` limits highlights to an explicitly chosen side. The viewer restores original materials when selections change or reset. Its camera and model behavior depends on the current GLB, so check multiple views when changing assignments or focus rules.

### Intake, email, and booking

`script.js` validates and collects the form answers, then reads the final body-map selection from `body-map-store.mjs`. `form-submission.mjs` turns that selection into area, muscle, and side fields and builds the EmailJS template parameters. The side and muscle may be unspecified; the form must not invent them. An EmailJS success opens the confirmation summary and Calendly widget; a failed send leaves the intake visible with an error. The confirmation and email data should agree for the same submission. The [intake browser check](../../tests/intake-submission-browser.cjs) uses a mocked EmailJS response and synthetic data.

EmailJS IDs and the consultation-to-Calendly event mapping are currently in `src/script.js`. The three Calendly URLs are test-account links from [PR #113](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/113), so confirm sponsor-owned destinations before a production handoff. The actual email layout also depends on the active EmailJS template. Account ownership, hosting, and deployment are tracked separately in [issue #137](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/137) and the [handoff FAQ](../faq/README.md); do not infer them from client-side code.

### Other pages

The upper- and lower-body scanner links lead to separate HTML pages. Each page uses MediaPipe scripts and browser camera access to show joint-angle feedback and repetition counts. Their scan results are not included in the intake email. Treat those pages as inherited functionality when describing this team's changes.

## Changes Made by This Team

The table groups major changes present on `main` at commit `3a42d0f` on November 16, 2026. A PR merged into another feature branch is listed only when that branch later reached `main`. The linked PRs give the detailed change and test history.

| Result on `main` | Implementation and PRs |
| --- | --- |
| Established stable body-area controls, a readable catalog, area mappings, camera focus, one shared state store, and browser checks. | [#55](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/55), [#56](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/56), [#57](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/57), [#58](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/58), [#60](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/60), [#64](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/64). |
| Added area-level educational information, optional side, one body-map reset control, model-loading fallback, and sponsor-requested Elbow wording. | [#79](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/79) includes [#101](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/101) and [#103](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/103); followed by [#110](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/110). |
| Made area-only selection the default, kept muscle exploration optional, and placed search results in a responsive, keyboard-accessible layout. | [#118](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/118), [#114](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/114). |
| Expanded to fifteen supported areas using sponsor anatomy references and restricted advanced muscle search to the selected area. | [#122](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/122), [#124](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/124). |
| Carried selected body details into confirmation and email data, routed consultation choices to separate Calendly test events, and changed the submit loading animation. | [#116](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/116), [#124](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/124), [#113](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/113), [#106](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/106). |
| Added automated HTML, JavaScript, body-map, and browser checks to the static-site workflow. | [#11](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/11), [#12](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/12), [#64](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/64); see `.github/workflows/static-site-ci.yml`. |

This table describes integrated code, not every proposal or documentation PR. For example, the content review in [PR #105](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/105), extra integrated-flow tests in [PR #126](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/126), and intake-formatting fix in [PR #128](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/128) were still outside `main` at this review. Recheck their status before treating them as delivered.

## How to Extend the Application

- **Change a body area:** Update its label in `body-areas.js` while keeping the ID stable. If adding or retiring an area, also review `muscle-area-assignments.mjs`, `body-area-focus.mjs`, educational content, and the mapping/browser tests. Use a reviewed area decision; the anatomy review records the current boundaries.
- **Change muscle search or highlighting:** Start with `area-muscle-search.mjs` or `viewer.js`, respectively. Preserve the store's area and muscle IDs, side-specific records, original materials, and the area-only fallback while the model loads.
- **Change intake or email fields:** Update the form in `index.html`, collection and validation in `script.js`, and the payload in `form-submission.mjs`. Check the confirmation summary, EmailJS template variables, and synthetic submission tests together.
- **Change appointment links:** Update the three consultation URLs in `script.js` after the sponsor confirms the corresponding event types. Verify each choice opens the intended duration without sending a real intake email during automated tests.
- **Change scanner behavior:** Work in the relevant scanner HTML page and check camera permission, joint-angle feedback, and repetition counting on an HTTPS or localhost origin.

Run the focused tests and the full browser check after behavior changes. CI validates HTML, JavaScript syntax, body-map tests, browser behavior, and required assets on PRs and pushes to `main`; `npm run test:intake` adds a separate mocked submission check. The live deployment and external-service accounts require their own owner-approved verification.
