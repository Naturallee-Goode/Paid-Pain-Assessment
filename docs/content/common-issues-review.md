# Common-issue content review — #81

Updated October 20, 2026 after #79 and #110 merged. The single content source is `src/possible-issues-data.mjs`; both area information and selected-muscle details use it. Sources are editorial references and are not displayed as client links.

## Recorded sponsor decision

Mia requested: “delete tendon irritation under Elbow and add Tennis Elbow.” The supplied correspondence is recorded in [#111](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/111) and [merged PR #110](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/110). It was recorded October 18; the correspondence date was not supplied. Tennis Elbow replaces the generic tendon-irritation entry and Bursitis remains. The new NHS-based description was not separately reviewed by Mia. This decision does not establish approval of every regional entry.

The four Shoulder entries and other regions retain the content integrated by #110. Reusing these records in muscle details does not mean the selected muscle caused the client's pain. The separate older muscle-diagnosis lists are removed.

## Review table

| Stable area ID | Area | Current examples | Review status |
| --- | --- | --- | --- |
| `neck` | Neck | Position-related neck pain; Pinched nerve | Pending |
| `shoulder` | Shoulder | Rotator cuff tear or tendon irritation; Shoulder impingement; Frozen shoulder; Shoulder bursitis | Pending |
| `upper-back` | Upper Back | Muscle strain | Pending |
| `lower-back` | Lower Back | Muscle strain | Pending |
| `arm` | Arm | Muscle strain; Tendon irritation (tendonitis) | Pending |
| `elbow` | Elbow | Tennis Elbow; Bursitis | Revision applied; description review pending |
| `wrist-hand` | Wrist/Hand | Joint sprain; Carpal tunnel syndrome | Pending |
| `hip` | Hip | Bursitis; Arthritis | Pending |
| `leg` | Leg | Muscle strain; Tendon irritation (tendonitis) | Pending |
| `knee` | Knee | Joint sprain; Bursitis | Pending |
| `ankle` | Ankle | Joint sprain; Achilles tendon irritation | Pending |
| `foot` | Foot | Muscle strain; Plantar fasciitis | Pending |

`ISSUE_CONTENT_REVIEW_BY_AREA` records pending reviews and the applied Elbow revision. No record claims full approval. Reviewer and correspondence date remain unset where there is no decision. The Elbow record distinguishes its recorded date from the unknown correspondence date.

## Sources

These references were carried forward from the integrated #79/#110 content; they were not newly researched in this update.

- [Source](https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/)
- [Source](https://orthoinfo.aaos.org/en/diseases--conditions/rotator-cuff-tears/)
- [Source](https://www.nhs.uk/conditions/shoulder-impingement-syndrome/)
- [Source](https://www.nhs.uk/conditions/frozen-shoulder/)
- [Source](https://www.nhs.uk/conditions/bursitis/)
- [Source](https://www.nhs.uk/conditions/sprains-and-strains/)
- [Source](https://www.nhs.uk/conditions/tendonitis/)
- [Source](https://www.nhs.uk/conditions/tennis-elbow/)
- [Source](https://www.nhs.uk/conditions/carpal-tunnel-syndrome/)
- [Source](https://www.nhs.uk/symptoms/joint-pain/)
- [Source](https://www.nhs.uk/symptoms/foot-pain/ankle-pain/)
- [Source](https://www.nhs.uk/conditions/plantar-fasciitis/)

## Remaining review

Record Mia's decisions against the exact current names, descriptions, and area assignments. Her Elbow label request is implemented; approval of its new description and the remaining copy is not established by the available evidence. Keep #81 open and this PR in draft until the content acceptance criterion is resolved. The UI retains the existing educational examples without adding a review label, as previously requested; it makes no sponsor-approval claim.

The current configured area IDs remain the baseline. [#96](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/96) tracks boundary decisions; this PR does not change boundaries or subdivide Arm/Leg. If configuration changes, update content and review coverage together.

## Recording later decisions

Update the content, metadata, and this table in the same change. Record the reviewer, actual decision date, evidence, requested edits, and the exact copy approved. Do not infer approval from a passing test, a merge, or silence. A later copy change needs renewed review.
