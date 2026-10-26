# Issue #83 verification

The simple-view handler uses the nearest surface intersection and the existing coordinate-to-area rules. Eleven production lines added; no new production modules or dependencies. Advanced mode retains catalog-backed muscle selection. Existing highlight geometry is unchanged (#88/#89).

## Results — October 22, 2026

- All 49 unit/DOM/source tests passed before and after implementation.
- HTML validation and changed JavaScript syntax checks passed.
- Full browser suite passed, including existing advanced selection, side transitions, reset, 390/768/1280px layouts, delayed/failed model, missing content, and unavailable viewer cases. No form was submitted.
- Real pointer clicks passed the matrix below, with no side or muscle selected. Each click updated the hidden area field, pressed area button, live selection summary, and common-issue title consistently.
- A leg click replaces Knee and vice versa; repeated knee clicks retain Knee. Head/empty space, chest, and abdomen clicks never assign an unrelated area. Empty space can clear the existing selection.
- Dragging changes the camera without changing Knee, including an out-and-back gesture ending over Arm.

## Click-position matrix

Coordinates are world-space ray targets for the checked-in `human-body2.glb`. Camera is 0.65 units from the target along the listed direction. Browser tests project each target to the canvas and send actual mouse events; they do not call the selection handler directly.

| Target (x, y, z) | View direction | Expected | Actual |
| --- | --- | --- | --- |
| (0, 1.46, 0) | Front (+z) | Neck | Neck |
| (.19, 1.38, 0) | Front | Shoulder | Shoulder |
| (.06, 1.34, 0) | Back (-z) | Upper Back | Upper Back |
| (.06, 1.17, 0) | Back | Lower Back | Lower Back |
| (.23, 1.18, 0) | Front | Arm | Arm |
| (.25, 1.08, 0) | Front | Elbow | Elbow |
| (.29, .84, 0) | Front | Wrist/Hand | Wrist/Hand |
| (.10, .78, 0) | Back | Hip | Hip |
| (.09, .60, 0) | Front | Leg | Leg |
| (.09, .45, 0) | Front | Knee | Knee |
| (.09, .45, 0) | Inside (-x) | Knee | Knee |
| (.09, .45, 0) | Outside (+x) | Knee | Knee |
| (.09, .12, 0) | Front | Ankle | Ankle |
| (.09, .04, 0) | Front | Foot | Foot |

## Screenshots

The same front-knee click at 1280×1000 selected no area on baseline `6ab1499` and selects Knee afterward. These are the only two screenshots added for this issue. Rendering was paused between test actions for reliable input timing, then explicitly rendered for capture; reduced motion was enabled.

- [Before](evidence/issue-83/before.png)
- [After](evidence/issue-83/after.png)

Run `npm run test:browser` to repeat the matrix and existing regressions. Set `ISSUE83_EVIDENCE_DIR` to capture the after image. `ISSUE83_BEFORE=1` is a capture-only option used on the unchanged baseline source.

Dependency: #84 / PR #118 supplies the simple view. The feature branch is based on that branch; review its eleven-line production diff separately from the dependency. The twelve-area baseline is unchanged. Exact anatomical highlight acceptance remains with #88/#89; no new sponsor boundary approval is inferred from #96's closed status. A recording was omitted per the user's request for only before/after screenshots. Human review and merge remain outstanding.

Material AI assistance: Codex planned, implemented, ran checks, and inspected both screenshots. No human review is claimed.
