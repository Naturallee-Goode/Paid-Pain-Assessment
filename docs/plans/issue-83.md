# Issue #83: click familiar body areas

1. Capture a front-knee click before changing production code, using #84's simple view as the baseline.
2. In simple view, classify the nearest raycast surface point using the existing twelve-area coordinate rules, rather than the intersected muscle's center/catalog membership. Use the existing store to synchronize controls, summary, and common issues. Unsupported regions retain the selection; empty space retains the existing clear behavior.
3. Preserve advanced muscle selection and click-versus-drag handling. Do not change highlight boundaries (#88/#89), introduce subdivisions, or add dependencies.
4. Exercise real pointer clicks for all twelve areas, front/inside/outside knee, no side, repeated clicks, unsupported regions, and rotation. Run existing checks and capture the same front-knee click afterward.

Iteration 2 owner: Girwan Dhakal. Branch: `feature/83-area-model-clicks`, based on `6ab1499` (includes dependency #84, ahead of current main). The twelve areas remain the working baseline; #96 is closed but supplies no decision record in its issue body, so this change does not claim approval of new boundaries. PR #79's catalog-backed advanced selection and repeat-selection fixes remain intact.

Material AI assistance: Codex prepared the plan, implementation, and automated verification; human review remains required.
