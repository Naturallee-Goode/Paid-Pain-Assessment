# Iteration 1 Retrospective

We used the [Iteration 1 review](review.md) and our repository work to identify
what helped, what slowed us down, and what we will change next. These actions
are follow-through commitments for the next iteration, not claims that the
remaining work was finished by the Iteration 1 deadline.

## Keep

- **Start with the sponsor's language.** Mia's feedback and approval of the
  area-first flow gave us a clear direction: clients can start with a familiar
  body area instead of needing to know a muscle name. We will continue to
  confirm the intended user flow before finalizing interactions.
- **Use focused Issues and shared body-map data.** Separate work on supported
  areas, the muscle catalog, mappings, controls, and model focus let us build
  an integrated twelve-area workflow. Shared IDs and state reduced the risk
  of different controls disagreeing about the selected area or side.
- **Check behavior at more than one level.** Static checks, Node tests, browser
  tests, and manual anatomical review exposed different kinds of problems.
  We will keep automated checks and record human visual review where a test
  cannot judge whether the highlighted anatomy makes sense.

## Problem

- **Feature completion and integration diverged.** Work on the muscle list and
  exact-spot selection reached stacked feature branches, but it was not on
  `main` at the review snapshot. Closing an Issue before its complete user
  flow is integrated makes our Project record harder to trust. Saving all
  selected area, muscle, and side values with the form also remained
  incomplete on `main`.
- **The submission path depended on sponsor-controlled deployment settings.**
  We traced the EmailJS failure to configuration and added test credentials,
  but browser tests do not send a real email. Bluehost access and a live
  delivery check remained necessary before we could claim production form
  submission was fixed.
- **Some handoff documentation lagged behind the software.** The testing plan
  still describes an unrelated room finder, and several user, FAQ, and
  security pages remain placeholders. This makes it harder for another team
  member or the sponsor to reproduce the current checks and limitations.

## Change

- We will treat an Issue as Done only after its acceptance criteria are met in
  `main`, the relevant tests and documentation are updated, and the full flow
  can be demonstrated. Work that is merged only into a feature branch will
  stay visible as In Progress or In Review.
- We will integrate dependent body-map changes in order and run the complete
  area → muscle → side → form path before closing the final integration Issue.
  We will record which test or manual check proves each step.
- We will identify account, hosting, and production verification dependencies
  during planning. We will test with approved test data, then record a separate
  live delivery result when sponsor access is available.
- We will review the handoff docs alongside code changes so the documented
  test commands, supported behavior, and known limits match the submitted
  application.

## Action

| Action for the next iteration | Owner | Follow-through check |
| --- | --- | --- |
| Integrate Issues [#48](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/48)–[#51](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/51) into `main` and verify body area → muscle → side → saved form values as one flow. | Jay Roy | Linked PRs merged to `main`; automated and manual form-flow evidence recorded; Project status reflects integration. |
| Recheck the twelve area highlights and focus behavior with the current model, including back regions, keyboard use, and mobile widths. | Lily Oswald | Record visual acceptance results and any follow-up Issues; rerun the browser checks. |
| Coordinate sponsor-owned EmailJS and Bluehost settings and verify one end-to-end test submission outside automated CI. | Griffen Bon | Record the deployment used, the test result, and any remaining blocker without committing private account details. |
| Replace the unrelated testing plan and update the user and handoff documentation to match the current body-map workflow and test commands. | Girwan Dhakal | Documentation review linked to a PR; commands and described behavior checked against the submitted application. |

At the next planning or stand-up review, we will check these actions against
their evidence and carry any unfinished item forward visibly in the GitHub
Project.
