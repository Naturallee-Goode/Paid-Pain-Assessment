# Body-area controls — issue #46

The controls provide ten body-area choices, one pressed state at a time, a live selection announcement, Change Area, and Clear Selection. Both action buttons clear the selection and return keyboard focus to the first area button. Form reset clears selection too. These buttons never submit the form.

The controls run independently of the 3D viewer so they remain usable while the model loads or when viewer initialization fails. Changing areas restores any previously highlighted mesh and clears stale search/panel content. Legacy model selections still update the controls; areas outside the ten supported choices retain their existing form values without falsely pressing an area button.

## Scope and integration

The area labels follow #46. The IDs in `src/body-area-config.mjs` must be coordinated with the shared area data from #43 before those changes are integrated. The configuration contains only IDs and labels. Muscle mappings (#45) and area highlighting/camera framing (#47) are not part of this change. Selecting an area does not select a muscle. No EmailJS configuration or model URL was changed.

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
