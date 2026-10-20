# Issue #81 — shared common-issue content

Updated October 20, 2026 on `feature/issue-81`, integrating main at `b38b9e6` after #79 and #110 merged.

## Change

Area headings and selected-muscle details now say **Common [area] issues**. Both displays use `possible-issues-data.mjs` and the item renderer in `possible-issues.mjs`. Muscle names remain selected; the descriptions are regional examples, not findings about that muscle. The educational disclaimer and link-free display remain.

The duplicate #105 data/renderer and the separate older muscle-diagnosis dataset are removed. #110's Tennis Elbow, four Shoulder entries, missing-content message, independent area panel, and Continue behavior remain. Selection, side filtering, catalog-based area resolution, repeated-selection handling, and reset code are retained from merged main. No panel sizing/collapse changes are included; those belong to #114.

## Sponsor review

[Current review record](../content/common-issues-review.md) and `ISSUE_CONTENT_REVIEW_BY_AREA` record Mia's Elbow request without claiming full approval. Its new description was not separately reviewed. Other copy remains pending; #81 is not complete, and #105 stays in draft. The UI retains existing examples without adding a review label, as previously requested.

## Verification

Run `npm run test:body-map`, `npm run lint:html`, and `npm run test:browser`. Syntax-check all source JS/MJS files. The browser suite exercises every configured area through Continue and real muscle search, comparing both rendered lists, plus #79's selection/side/camera/keyboard regressions and #110's loading, reset, and unavailable-content cases. Unit tests cover source/review coverage, shared rendering, plain-text escaping, and stale-content cleanup.

Recorded results for this update are stored in `evidence/issue-81/verification.txt`. Desktop and phone captures were inspected. The existing capped/scrolling detail panel remains for #114 to address. Screenshots are from the actual app; missing content is a browser-only Foot fixture. No approval fixtures are used and no intake is submitted.

| View | Evidence |
| --- | --- |
| Shoulder area | [Screenshot](evidence/issue-81/shoulder-area.png) |
| Selected deltoid | [Screenshot](evidence/issue-81/shoulder-muscle.png) |
| Selected deltoid at 390px | [Screenshot](evidence/issue-81/shoulder-mobile.png) |
| Elbow sponsor revision | [Screenshot](evidence/issue-81/elbow-area.png) |
| Unavailable content fixture | [Screenshot](evidence/issue-81/unavailable-content.png) |

To regenerate these captures, set `ISSUE81_EVIDENCE_DIR=docs/testing/evidence/issue-81` before running the browser suite. Old October 13 evidence was superseded and remains available in Git history at `5ffabdb`.

## Acceptance and remaining work

- Supported stable IDs have sourced records, review metadata, and dynamic coverage tests.
- Both displays use the same names/descriptions and Common [area] issues wording.
- Missing content explicitly says it is unavailable; Continue remains accessible.
- Educational wording does not identify the cause of pain or claim sponsor approval.
- Sponsor review of the complete current copy remains outstanding; do not close #81 on this evidence alone.

Codex assisted with integration, code, tests, screenshots, and documentation. Human review and sponsor approval are not represented as completed.
