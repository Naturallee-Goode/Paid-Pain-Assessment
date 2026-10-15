# Issue #82 — area-information edge cases

Implemented October 15, 2026 on `codex/fix/82-area-information-edge-cases`, created from `origin/main` at `f26013a`. Owner: Girwan Dhakal; selected for Iteration 2 in the Senior Design Project. This records implementation and verification for PR review; the issue remains open until integration and review are complete.

## Plan and scope

1. Check the current main baseline and reuse the existing area content and unavailable-content renderer.
2. Render area information from the shared selection store before importing the viewer. Keep the panel outside the model's loading overlay.
3. Exercise every configured area, replacement, reset, unavailable content, and delayed/failed loading; record results and two screenshots.
4. Open a focused PR into main with the acceptance evidence. Leave sponsor approval (#81), area boundaries (#96), mode changes (#84), and camera/reset redesign (#90) with their owners.

PR #79 was not reviewed as part of this task, per Girwan's instruction. Main does not contain its wider interaction changes or PR #105's content implementation. This branch reuses only the content data and renderer from [issue #81 / PR #105](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/105), commit [`5ffabdb`](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/commit/5ffabdbeaeb319f616b55b181ed2235cc625081a). Its data originated in [#74](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/74) / [#79](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/79). No new condition descriptions were researched or written for #82.

The copied data differs only in its documentation pointer. The reused renderer retains the exact unavailable message: **Content is not available for this area yet.** The only new rendering logic subscribes to area changes, clears the panel when no area is selected, and runs independently of viewer startup. Existing store transitions and reset controls are reused without modifying their behavior.

## Acceptance / gap matrix

| Criterion | Existing implementation or demonstrated gap | Fix / verification |
| --- | --- | --- |
| Identify reused requirements and gaps after #74 | #81 contains stable-ID content, a shared renderer, and an unavailable state; its viewer calls cannot provide content when viewer startup fails. Main has area controls but no independent area-information panel. | Reuse the two #81 modules and add a store subscription in the body-map entry point; wider PR #79 review was excluded by request. |
| Every supported area shows its name and issues without muscle, side, or mode choices | Existing content covers the current configuration, but was not integrated on main. | Unit tests derive coverage from `SUPPORTED_BODY_AREAS`; browser checks use every actual area button. All current 12 areas pass with no muscle or side selected. No mode choice is introduced. |
| Changing area replaces information; reset clears stale content | Main's store already clears selection state on area changes and reset. | The panel uses that same state. Unit tests cover Change Area, Clear Selection, and store reset. Browser checks cover content replacement, Clear Selection, and confirmed form reset, including unavailable-viewer cases. |
| Missing content shows the agreed message | #81 already supplies the fallback renderer; no duplicate fallback is needed. | Unit tests cover missing/empty/unavailable records. A browser-only Foot fixture follows Shoulder/Ankle content and verifies no stale list remains. |
| Delayed/failed model loading leaves area information usable | Viewer-owned rendering is coupled to successful viewer startup and can sit behind its loading overlay. | New panel is outside the viewer. Browser scenarios cover delayed completion retaining the latest area, reset before completion remaining empty, GLB failure, and failed viewer import. |
| Durable integration and completion evidence | An open PR does not establish completion. | This record, saved logs, browser manifest, two screenshots, and the linked fix PR establish the reviewable result. Keep #82 In Progress until the fix is reviewed and merged. |

## Verification

Baseline on main: **29 unit tests**, HTML validation of all three pages, and the existing browser suite passed. The browser runtime was found at `C:\Users\g_dha\AppData\Local\ms-playwright`; the initial sandbox-default browser path was unavailable. No package or lockfile changes were needed.

| Final check | Result | Saved evidence |
| --- | --- | --- |
| `npm run test:body-map` | 33 passed, 0 failed | [Unit log](evidence/issue-82/unit-results.txt) |
| `npm run lint:html` | All three pages passed | [HTML log](evidence/issue-82/html-results.txt) |
| `node --check` for every source JS/MJS file | Passed | [Syntax log](evidence/issue-82/syntax-results.txt) |
| `npm run test:browser` | Existing loaded-model workflow and five area-information scenarios passed | [Browser log](evidence/issue-82/browser-results.txt), [scenario manifest](evidence/issue-82/browser-results.json) |

Browser checks include all current areas in each isolated scenario, no-side/no-muscle state, content replacement, Clear Selection, confirmed form reset, retained unrelated answers after Clear Selection, no accidental submissions, and no unexpected page errors. The unavailable-viewer scenario expects exactly the failed dynamic-import error; its area controls and information still work. Loaded-model layout checks at 390, 768, and 1280 pixels pass without horizontal overflow. Existing camera, highlighting, selection, keyboard, and reset regressions also pass.

The browser suite serves the actual app and uses the checked-in GLB. It pauses the existing heavy render loop for assertions. The missing-content fixture intercepts only the Foot data lookup in an isolated browser; production records remain unchanged. No intake form was submitted and no email was sent.

## Screenshots

Two new screenshots were captured by the real browser suite and visually inspected. Reset is established by the automated empty-panel/hidden-panel assertions recorded above; no additional reset screenshot was added, following the requested two-image limit.

![Shoulder area information remains visible with failed model loading and no side selected](evidence/issue-82/area-only-model-failed.png)

![Browser-only missing Foot content uses the unavailable message without stale content](evidence/issue-82/unavailable-content.png)

## Reproduce

Run `npm run test:body-map`, `npm run lint:html`, and `npm run test:browser`. To regenerate the two screenshots and manifest in PowerShell, set `ISSUE82_EVIDENCE_DIR=docs/testing/evidence/issue-82` before the browser command. On this Windows workstation also set `PLAYWRIGHT_BROWSERS_PATH=C:\Users\g_dha\AppData\Local\ms-playwright`; CI installs its own matching Chromium runtime.

## Content, integration, and AI assistance

Sponsor review remains pending under #81. Original source URLs, review statuses, and rationale are preserved in [the content data](../../src/common-issues-data.mjs) and the [original content review record](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/blob/5ffabdbeaeb319f616b55b181ed2235cc625081a/docs/content/common-issues-review.md). Reusing this copy does not record sponsor approval. The current area configuration remains the working baseline until #96 records approved changes.

Because #105 is still open, its two content modules are included here so this branch works from main. When integrating #105, retain `initializeAreaInformation` and its call in `body-map-app.mjs`; retain the reviewed content data. #79's wider muscle, side, camera, and reset changes were not imported. Existing muscle-detail behavior on main is outside this fix and remains covered by its own issues/PRs.

Codex assisted with planning, implementation, tests, screenshots, documentation, and PR preparation using the cs-495-workflow and git-commit-messages skills. Automated verification and screenshot inspection were performed by Codex; this is not a claim of human review, sponsor approval, or a completed merge.
