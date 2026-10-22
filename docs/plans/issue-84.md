# Issue #84: simple and advanced body-map views

## Plan

1. Capture the existing Shoulder view before editing, from main at `6301b95`.
2. Replace `issuesReviewed` with one `advanced` flag in the existing store. A view change preserves area and side; returning to simple clears the optional muscle. Reset returns to simple. Changing area clears muscle and side while retaining the chosen view.
3. Replace Continue with one native button outside the area-information panel so either view can be chosen before an area. Its label and `aria-expanded` communicate the current view. Hide the existing muscle panel in simple mode; reuse the existing search in advanced mode.
4. Gate muscle selection in the store and viewer. Simple model clicks may keep selecting an area but cannot select a muscle. Restore area highlighting on return. Detailed click-position and knee-boundary work remains #83.
5. Update affected transition/browser regressions and the user guide. Run HTML, syntax, unit/DOM, and browser checks. Capture one after screenshot at the same viewport and Shoulder selection; save only `before.png` and `after.png` as visual evidence.

Reuse existing modules and styles; add no dependencies or new production modules. Search filtering/layout (#85/#92), boundary changes (#96), and content review (#81) keep their existing ownership.

Material AI assistance: Codex prepared this plan and implementation; the resulting code and behavior require human review.
