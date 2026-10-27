# Iteration 2 Project View Snapshots

GitHub's **Export view data** was used on October 27, 2026, around 12:00 p.m. Central. The tab-separated files preserve the rows and visible columns from the saved views at capture time. Rows were loaded before export; the exported row counts matched the counts displayed by GitHub. These are point-in-time evidence, not live views. The earlier [planning screenshot](../planning-snapshot.png) records the October 8 plan.

| Snapshot | Live view | Exported rows |
| --- | --- | ---: |
| [Product Backlog](product-backlog.tsv) | [01 - Product Backlog](https://github.com/orgs/Naturallee-Goode/projects/1/views/2) | 33 |
| [Iteration 2 results](iteration-2-results.tsv) | [06 - Iteration 2 Results](https://github.com/orgs/Naturallee-Goode/projects/1/views/7) | 25 |
| [Team Contributions](team-contributions.tsv) | [08 - Team Contributions](https://github.com/orgs/Naturallee-Goode/projects/1/views/9) | 33 |
| [Engineering & Quality Work](engineering-quality.tsv) | [09 - Engineering & Quality Work](https://github.com/orgs/Naturallee-Goode/projects/1/views/10) | 9 |
| [Remaining Backlog](remaining-backlog.tsv) | [11 - Remaining Backlog](https://github.com/orgs/Naturallee-Goode/projects/1/views/12) | 6 |

## Reading the evidence

- The exports include the fields visible in these saved views: title, URL, assignees, status, linked pull requests, and sub-issue progress. They do not capture hidden Project fields, Issue comments, or every repository Issue. The Team Contributions view was not grouped by assignee at capture; the exported assignee column still identifies recorded owners.
- The remaining-backlog export did not include the open hosting investigation [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68), although the Engineering & Quality export lists it as Todo. Check the live view and [open Issues](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues) when using it for handoff.
- The iteration-results export records the Project's statuses as displayed. Some statuses need reconciliation with actual integration evidence: [#83](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/83) is marked Done although [PR #119](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/119) merged into a feature branch; [#87](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/87) and [#88](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/88) are marked Done while related [PR #126](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/126) remains open. [PR #129](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/pull/129) merged into #126's feature branch. Conversely, [#91](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/91) is Todo although the optional-side work has reached main. Check acceptance criteria and correct statuses before the final deadline snapshot.
- Project state can change after capture. Re-export at the actual deadline after status reconciliation and final merges if the LMS requires a deadline snapshot. A repository tag does not freeze Project metadata.

Codex exported and checked the rows and drafted this index from the visible Project and linked PR records. A team member should verify the final state and submit the required LMS artifacts.
