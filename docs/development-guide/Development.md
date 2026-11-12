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
