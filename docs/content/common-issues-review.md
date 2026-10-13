# Common-issue content review — issue 81

Prepared October 13, 2026 on `feature/issue-81`. All copy below is proposed. Mia's content approval has not been recorded. A team review or a test fixture does not count as sponsor approval.

## Content and sources

`src/common-issues-data.mjs` is the content record, keyed by the supported IDs in `src/body-areas.js`. It stores names, short descriptions, source URLs, and each area's review status, reviewer, date, evidence, and requested changes. Sources are review metadata and are not rendered in the client panel.

The draft descriptions and area assignments reuse [PR #79's content](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/blob/167db9cefa5ee1c9e4320c9846fcb09ac538fa26/src/possible-issues-data.mjs) from [issue #74](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/74). Shoulder expands that draft to match the four-item preview discussed with Girwan: rotator cuff concerns, impingement, frozen shoulder, and bursitis. Other areas keep PR #79's proposed examples instead of duplicating its research. These examples are not an exhaustive list, a frequency ranking, or an assessment of an individual's symptoms. Source support for a definition does not establish sponsor approval of its inclusion in an area.

Sources were checked during this session on October 13, 2026:

- [NHS: sprains and strains](https://www.nhs.uk/conditions/sprains-and-strains/)
- [NHS: tendonitis](https://www.nhs.uk/conditions/tendonitis/)
- [NHS: bursitis](https://www.nhs.uk/conditions/bursitis/)
- [NHS: joint pain](https://www.nhs.uk/symptoms/joint-pain/)
- [NHS: neck pain](https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/)
- [NHS: carpal tunnel syndrome](https://www.nhs.uk/conditions/carpal-tunnel-syndrome/)
- [NHS: ankle pain](https://www.nhs.uk/symptoms/foot-pain/ankle-pain/)
- [NHS: plantar fasciitis](https://www.nhs.uk/conditions/plantar-fasciitis/)
- [AAOS: rotator cuff tears](https://www.orthoinfo.org/diseases--conditions/rotator-cuff-tears/)
- [NHS: shoulder impingement](https://www.nhs.uk/conditions/shoulder-impingement-syndrome/)
- [NHS: frozen shoulder](https://www.nhs.uk/conditions/frozen-shoulder/)

## Review table

For every Pending row, the reviewer, decision date, and decision evidence are currently unset in the data. "Not recorded" means no feedback is available; it does not mean Mia requested no changes.

| Stable area ID | Area | Proposed examples | Mia's decision | Requested changes | Decision evidence |
| --- | --- | --- | --- | --- | --- |
| `neck` | Neck | Position-related neck pain; Pinched nerve | Pending | Not recorded | Not recorded |
| `shoulder` | Shoulder | Rotator cuff tear or tendon irritation; Shoulder impingement; Frozen shoulder; Shoulder bursitis | Pending | Not recorded | Not recorded |
| `upper-back` | Upper Back | Muscle strain | Pending | Not recorded | Not recorded |
| `lower-back` | Lower Back | Muscle strain | Pending | Not recorded | Not recorded |
| `arm` | Arm | Muscle strain; Tendon irritation (tendonitis) | Pending | Not recorded | Not recorded |
| `elbow` | Elbow | Tendon irritation (tendonitis); Bursitis | Pending | Not recorded | Not recorded |
| `wrist-hand` | Wrist/Hand | Joint sprain; Carpal tunnel syndrome | Pending | Not recorded | Not recorded |
| `hip` | Hip | Bursitis; Arthritis | Pending | Not recorded | Not recorded |
| `leg` | Leg | Muscle strain; Tendon irritation (tendonitis) | Pending | Not recorded | Not recorded |
| `knee` | Knee | Joint sprain; Bursitis | Pending | Not recorded | Not recorded |
| `ankle` | Ankle | Joint sprain; Achilles tendon irritation | Pending | Not recorded | Not recorded |
| `foot` | Foot | Muscle strain; Plantar fasciitis | Pending | Not recorded | Not recorded |

## Recording Mia's review

Review the exact names, descriptions, and area assignments in the data file with Mia. For each decision, update the area's `content([...], review)` call with `status` (`approved`, `changes-requested`, or `unavailable`), `reviewer: 'Mia Miller'`, the decision `date`, a link or file reference in `evidence`, and her `requestedChanges`. Update this table in the same change. If she approves revised copy, first apply her revisions to the list, then record approval for that exact copy. Any later copy change needs a new review and should return the entry to `pending`.

Pending copy is available in the local preview. Girwan requested removal of the visible review label; review status stays in this data and documentation, and removal of the label does not record sponsor approval. Missing records, empty lists, requested-change records, and incomplete approvals show **Content is not available for this area yet.** They do not reuse another area's content. To explicitly record an area with no available copy, use `content([], { status: 'unavailable', reviewer: null, date: null, evidence: null, requestedChanges: null })`.

The existing form header describes wellness education and movement support, and its consent section explains that the consultation does not provide medical diagnosis or treatment. Per Girwan's requested preview, the issue panel adds no extra disclaimer paragraph and displays no citations. The heading is **Common [area] issues** for both area and muscle detail; a muscle selection does not generate muscle-specific findings.

## Boundaries and outstanding decisions

The current supported-area configuration remains the working baseline. [Issue #96](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/96) owns sponsor decisions about Arm/Leg subdivisions and Lower Back boundaries. No subdivisions or boundary changes are introduced here. If #96 changes the baseline, update the content records and this table, and rerun the coverage test; the implementation does not assume a permanent count of 12.

Mia's review is outstanding. The actual app and screenshots show the proposed copy without a visible review label, per Girwan's instruction. This is an explicit deviation from the issue's visible approval distinction for this local preview. The approved screenshot is explicitly a **test fixture**, not evidence that she approved it. Issue #81 should stay open until actual decisions and their evidence are recorded. The review email lists every area's current names, descriptions, and citations; its local copy is `common-issues-review-email.html`.

## Verification and AI use

See [issue 81 verification and screenshots](../testing/issue-81.md). Codex assisted with adapting the researched draft copy, implementation, automated tests, and evidence. Girwan's implementation review and Mia's content review remain human steps. Implementation and evidence are prepared for pull-request review. No sponsor decision, merge, or formal stand-up post is represented as completed.
