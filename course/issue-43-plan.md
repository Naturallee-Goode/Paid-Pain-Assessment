# Issue 43 implementation plan

Issue: [#43 - Create the supported body-area list](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/43)
Branch: `feature/43-supported-body-area-list`

## Goal

Provide one authoritative list of the familiar body areas that clients can select before any optional muscle-level detail. The list must expose stable IDs and user-facing labels, and it must keep Upper Back and Lower Back distinct.

## Scope

The supported areas for this issue are:

1. Neck
2. Shoulder
3. Upper Back
4. Lower Back
5. Elbow
6. Wrist/Hand
7. Hip
8. Knee
9. Ankle
10. Foot

Use one selected area at a time, as required by the issue constraints. Do not add side selection, muscle detail, educational content, or unrelated intake changes in this issue.

## Implementation steps

1. Inspect the body-map viewer and intake data flow introduced by the issue-42 cleanup to identify the single source of truth for selectable areas.
2. Define the ten supported areas in that source using stable, code-friendly IDs and the exact display labels approved by issue 43.
3. Connect the existing body-map selection path to the supported-area data without duplicating the list in separate HTML and JavaScript locations.
4. Preserve the existing one-selection behavior and ensure changing a selection does not mutate an area ID.
5. Keep the data structure extensible for later sponsor-approved muscle details, while limiting this issue to the area-level list.
6. Update user/developer documentation only where the supported-area behavior or data contract is described.

## Verification plan

### Automated checks

- Assert that exactly ten supported areas are present.
- Assert that every area has a non-empty stable ID and a non-empty display label.
- Assert that IDs are unique.
- Assert that the exact ten required labels are present.
- Assert that Upper Back and Lower Back are separate entries.
- Assert that selecting an area stores its stable ID and that changing selections does not alter the IDs.
- Run the repository's documented static-site checks and the relevant test suite.

### Manual checks

- Open the body-map flow in a desktop browser and confirm all ten choices are visible and understandable.
- Select each area once and confirm the selected value is the expected area.
- Change from one area to another and confirm only one area remains selected.
- Repeat the selection flow on a narrow/mobile viewport and with keyboard navigation where supported.
- Check the browser console for errors during loading, selection, and reselection.

## Acceptance-criteria evidence to capture

- Test output showing all ten areas, unique stable IDs, and distinct Upper/Lower Back entries.
- Static-site CI result for the pull request.
- A short manual-verification note, with screenshots if the UI presentation is material.
- Pull request mapping from each issue acceptance criterion to the test or manual evidence.

## Risks and decisions

- Existing body-map labels or internal names may not match the sponsor-facing labels; preserve the approved display labels and use separate stable IDs.
- Avoid maintaining a second list in markup or event-handler code, because that would recreate the duplication issue 42 addressed.
- If the existing viewer cannot represent one of the ten areas without a sponsor decision, pause implementation and record the exact mismatch rather than inventing a mapping.

## Definition of done for issue 43

The ten area records are implemented in the authoritative body-map data source, the automated and manual checks pass, the PR documents evidence for every acceptance criterion, and issue 43 is merged only after review and required CI checks succeed.
