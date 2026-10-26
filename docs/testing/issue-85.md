# Issue #85: advanced area muscle search

The advanced search now browses and filters the selected area's reviewed catalog. An empty search shows that area's full list; case-insensitive queries narrow it. A result retains its area's muscle record and highlights its model mesh. Search does not choose a side for the user. Area changes and reset clear the previous query and results.

The current sponsor mapping has fifteen areas. Shoulder contains the modeled upper-arm biceps heads; Thigh contains the biceps femoris heads. The test screenshots show those separate results: [Shoulder](./evidence/issue-85/shoulder-biceps.png) and [Thigh](./evidence/issue-85/thigh-biceps.png).

Verification on the #85 branch:

- `npm run test:body-map`: 53 passed.
- `npm run lint:html`: 3 files scanned, no errors.
- `ISSUE85_EVIDENCE_DIR=docs/testing/evidence/issue-85 npm run test:browser`: passed with real model, side selection, result-to-mesh behavior, responsive layouts, and loading/failure fixtures; no intake was submitted.

The browser test also checks that the opposite area's biceps do not appear, that a nonmatching query has an area-specific empty message, and that the full area's list appears when search receives focus. When catalog loading fails, the interface explains that the body-area flow remains available.
