# Issue #87: integrated body-map workflow

The integrated browser test uses synthetic contact information and a mocked EmailJS client. It compares the visible confirmation to the captured payload and sends no live email. Existing `npm run test:browser` checks the full model, camera rotation and zoom, reset to the forward view, all fifteen area controls, responsive layouts, keyboard search, and delayed/failed model states.

| Path | Width | Input | Side | Result |
| --- | ---: | --- | --- | --- |
| Simple area only | 1280 px | Pointer | Unspecified | Submitted; area, confirmation, and payload agree |
| Advanced muscle | 1280 px | Search and keyboard Enter | Unspecified | Submitted; muscle and area agree |
| Advanced muscle | 1280 px | Search and keyboard Enter | Both | Submitted; side agrees |
| Simple area only | 390 px | Pointer | Unspecified | Submitted; no horizontal overflow |
| Advanced muscle | 390 px | Search and keyboard Enter | Unspecified | Submitted; no horizontal overflow |
| Replace area, reset, then advanced | 1280 px | Keyboard only | Unspecified | Submitted; stale muscle cleared after replacement and reset |
| Model loading fails | 390 px | Keyboard area choice | Unspecified | Area-only submission succeeds |

All seven paths passed independently on October 26, 2026; the revised keyboard path passed again on October 27. Use `INTEGRATED_SCENARIO=<name> npm run test:intake` for one row or `npm run test:intake` for the whole matrix. The model failure scenario blocks only the GLB request; the form and EmailJS client are mocked. `npm run test:body-map` passed 54 tests and HTML lint found no errors.

The keyboard scenario uses Tab and Shift+Tab to reach each control, Enter/Space to activate controls and submit, and keyboard typing for required text fields. It asserts focus at key steps and verifies that navigation fails when the required email input is temporarily removed from the tab order. Only the continuous 3D render loop is paused in this test fixture to keep keyboard events deterministic.

Selected evidence: [desktop simple](./evidence/issue-87/area-only-selection.png), [desktop advanced](./evidence/issue-87/detailed-no-side-advanced.png), [phone simple](./evidence/issue-87/phone-simple-selection.png), [phone advanced](./evidence/issue-87/phone-advanced-advanced.png), [keyboard reset](./evidence/issue-87/keyboard-after-reset.png), and [model failure](./evidence/issue-87/model-failed-selection.png). Confirmation screenshots for phone and model-failure submissions are in the same evidence folder.

Live delivery and a device-screen-reader review remain separate from these automated checks. Live delivery requires the sponsor's production EmailJS and hosting access.
