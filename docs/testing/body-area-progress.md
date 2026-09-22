# Body-area controls — issue #46

The controls provide ten body-area choices, one pressed state at a time, a live selection announcement, Change Area, and Clear Selection. Both action buttons clear the selection and return keyboard focus to the first area button. Form reset clears selection too. These buttons never submit the form.

The controls run independently of the 3D viewer so they remain usable while the model loads or when viewer initialization fails. Changing areas restores any previously highlighted mesh and clears stale search/panel content. Legacy model selections still update the controls; areas outside the ten supported choices retain their existing form values without falsely pressing an area button.

## Scope and integration

The controls now import the shared IDs and labels from `src/body-areas.js` through `src/body-area-config.mjs`. Muscle mappings (#45) and area highlighting/camera framing (#47) are not part of this change. Selecting an area does not select a muscle. No EmailJS configuration or model URL was changed.

## Verification

```bash
npm ci
npm run test:body-map
npm run lint:html
node --check src/script.js
node --check src/viewer.js
node --check src/body-area-config.mjs
node --check src/body-area-controls.mjs
```

The unit/DOM suite runs in GitHub CI and covers selection, Change/Clear, reset, focus restoration, event synchronization, and accidental submission prevention, alongside the existing viewer-source checks.

Browser checks start and stop their own local server. Install the test browser once with `npx playwright install chromium`, then run `npm run test:browser`. Alternatively, use installed Chrome on macOS:

```bash
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:browser
```

The browser suite checks all ten choices, previous mesh-material restoration, search cleanup, keyboard Enter/Space, reset, phone/tablet/desktop widths, touch-target height, delayed and failed model loading, and unavailable viewer code. The checked-in GLB is served as a test fixture in place of the existing remote model URL. CDN JavaScript dependencies still require network access. Viewer test hooks exist only in intercepted browser-test responses. No form submissions or live emails are sent. Browser checks are run separately from CI.

## Follow-up work: issue #47

On `feat/47-body-area-focus`, a separate focus module defines spatial regions for the current model. Area selection restores old materials, highlights matching model objects, and frames their bounds using both vertical field of view and viewport aspect ratio. Upper Back and Lower Back have separate posterior regions; neither automatically selects an individual muscle. Change/Clear, form reset, or selecting an individual mesh removes region highlights. A choice made before the model loads is applied when loading completes.

The integrated unit suite contains sixteen passing tests. Browser checks additionally verify nonempty highlights for every area, old-material restoration, distinct back camera targets, and continued user rotation/zoom. The browser suite still checks the controls on phone/tablet/desktop layouts and loading/failure cases. The CI workflow checks the new module's syntax.

This branch builds on #46 and locally integrates Girwan’s reviewed #58 snapshot (`2775d2b`), which includes #43. This local integration does not merge his GitHub PRs. Spatial focus is independent of the #44 side-labeling bug, and does not implement #45's muscle catalog mappings. The bounds are specific to the current GLB and match whole objects by their bounding-box centers, so objects crossing a region boundary may extend beyond that area. Human visual acceptance of each highlighted region is still needed before closing #47. The production model URL and EmailJS remain unchanged.

### Combined verification

The browser suite now asserts 229 left, 230 right, and 3 unspecified records from the loaded Three.js catalog, in addition to the focus/selection interactions. This guards the previously observed shared-clone side-labeling bug while testing the integrated viewer. The unit suite runs all of Girwan’s tests plus the controls and focus tests. #45 still needs real source-name-to-area assignments and anatomical review; coordinate-based highlights are not used as muscle mappings.
