# PBI #90: Clear Selection

The duplicate Change Area action is removed, leaving one **Clear Selection** button. Selecting a different area directly replaces the previous selection and clears stale muscle and side state. Clear Selection resets the area, muscle, side, possible-issue review, search text, selection details, and highlights while leaving contact information and other intake answers unchanged.

Clear Selection always remains enabled. When the model is available, it stops any active camera transition and immediately restores the full forward-facing camera position, target, and zoom. The same state reset remains usable while the model is loading, after loading fails, or if viewer code is unavailable.

## Automated evidence

- `npm run test:body-map`: covers state cleanup, a reset emitted from already-empty state, keyboard focus, direct replacement, no accidental submission, and loading-independent controls.
- `npm run test:browser`: covers detailed-selection cleanup, exact camera and target restoration after rotation/zoom, camera-only recovery with no selected area, keyboard activation, unrelated-answer preservation, and delayed/failed/unavailable viewer scenarios.
- `npm run lint:html`: validates removal of the obsolete duplicate controls.

## Screenshots

- `evidence/pbi-90/before-reset.png`: selected and user-adjusted model before reset.
- `evidence/pbi-90/after-reset.png`: cleared body map at the full forward-facing default view.
