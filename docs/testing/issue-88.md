# Issue #88: Neck and former Arm boundary review

## Current baseline and reproduction

The October 25 sponsor reference update in #121 retired the overlapping broad Arm selector. Shoulder and Forearm are the current approved replacements; there is no Arm control to reproduce the earlier Arm/shoulder report against. Neck and Shoulder still share the descending trapezius and levator scapulae records by design.

On the current model, the original area highlight material disabled depth testing and rendered whole assigned meshes over the body. This reproduced visible Neck color across the upper chest and Shoulder color across the central torso even though Neck and Chest have **no shared catalog records**. [Before front views](./evidence/issue-88-before/neck-front.png) and [Shoulder before](./evidence/issue-88-before/shoulder-front.png) show the spill. Front, back, and side captures for Neck, Shoulder, and Forearm are all in `evidence/issue-88-before/`.

## Change and result

Area highlights for Neck, Shoulder, and Forearm now clip their rendered pixels to the current spatial regions in `src/body-area-focus.mjs`. The mapped muscle records, selectable muscle details, and all other area highlights remain unchanged. This avoids the through-torso color spill while retaining a visible region; simply enabling depth testing hid most of the muscles beneath the model's outer surfaces.

The [after front views](./evidence/issue-88-after/neck-front.png), [Shoulder after](./evidence/issue-88-after/shoulder-front.png), and [Forearm after](./evidence/issue-88-after/forearm-front.png) show bounded highlights. Back and side views for each area are in `evidence/issue-88-after/`. The browser test checks that only reviewed area meshes receive area materials, no Chest-only mesh receives Neck highlighting, each material has clipping planes, and reset restores the original material of every mesh.

`npm run test:browser` passed with the full real-model workflow, including replacement, side changes, reset, model failure, and responsive layouts. The Neck/Shoulder/Forearm angle checks and screenshots ran with `ISSUE88_EVIDENCE_DIR=docs/testing/evidence/issue-88-after`. `npm run test:body-map` and `npm run lint:html` also passed.

The model uses whole objects, and clipping creates a sharp visual edge at the approved spatial bounds. Exact pixel-level contour approval remains a sponsor review question. No upper-arm subdivision or other unapproved area was introduced; Lower Back highlighting remains owned by #89.
