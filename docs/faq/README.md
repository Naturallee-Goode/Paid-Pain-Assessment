# Project Handoff FAQ

## What does the form do?

The pain-assessment form collects a client's contact information, pain details, wellness goals, and preferred consultation type. Clients can use an interactive body map to identify an area of concern and optionally select a muscle and side. After submission through EmailJS, the form displays a summary and a Calendly booking calendar.

## Does the form provide a medical diagnosis?

No. The form is intended for wellness education and movement support. The possible issues displayed beside the body map are educational examples, not a diagnosis or a prediction about the client's pain.

## Does a client need an account?

No. The form does not include client registration, login, or a client dashboard.

## Does a client have to select a specific muscle or side?

No. Muscle and side selections are optional. The simple view allows clients to choose a body area and read related educational information. **Explore muscles (advanced)** opens muscle search and selection for clients who want to provide more detail.

See the [User Guide](../user-guide/README.md) for body-map instructions.

## How can a client clear their selections?

**Clear Selection** resets the body map. **Clear side** removes only the side selection. Resetting the entire form asks for confirmation before clearing the entered information.

Changing body areas clears the previous muscle and side. Returning from advanced to simple view clears the muscle while keeping the selected area and side.

## What information is included in the submission email?

The current email mapping includes:

- Name, email address, and phone number.
- Selected body area, optional muscle, and optional side.
- Pain duration, discomfort type, pain level, triggers, and notes.
- Wellness goals, consultation preference, and product interest.
- Submission date and time.

The actual email layout depends on the configured EmailJS template. Check the template against these fields during handoff. The mapping is defined in [form-submission.mjs](../../src/form-submission.mjs).

## Where do submissions go?

The current code supplies `goode@naturalleegoode.com` as the intended recipient. The receiving address and template settings must also be verified in the active EmailJS account with a synthetic test submission.

## Are responses saved so clients can return later?

The form has no implemented save-and-resume feature or submission database. Its submission code does not save answers to browser local storage or session storage.

Responses remain in the current page while it is open, including the confirmation summary after submission. Clients should not rely on refreshing or closing the page to preserve their answers.

## How are submissions backed up or recovered?

There is no built-in submission backup or recovery system. Successfully delivered emails may provide a record, depending on the receiving mailbox's retention and backup settings.

EmailJS records, mailbox retention, deletion procedures, and who can access submissions still need to be confirmed with the account owners. A repository backup preserves the form's code and assets; it does not back up client submissions.

## What happens if submission fails?

The form displays an error and keeps the intake visible so the client can try again. The confirmation and booking screen appears only after EmailJS reports success.

For a missing submission, check the receiving inbox and spam folder, then review the EmailJS configuration, service connection, and account limits. Repeated attempts can create duplicate emails if an earlier attempt was delivered. See the [EmailJS Setup Guide](../deployment-guide/EMAILJS_SETUP.md) for configuration details; compare its template examples with the current email mapping.

## Does submitting the form book an appointment?

No. Submission opens a separate Calendly booking step. The client must select an available appointment and complete the booking.

The current code maps consultation choices to:

- Quick Pain Check — 15 minutes.
- Movement & Relief Session — 30 minutes.
- Full Wellness Assessment — 60 minutes.

The links currently point to Calendly events under `griffen-bon`. Before sponsor handoff, confirm the intended scheduling account and replace these links in [script.js](../../src/script.js) if necessary.

## What are the upper- and lower-body scans?

The form links to separate webcam pages that use movement tracking to display joint-angle feedback. Camera permission is required.

The current scan code processes camera frames in the browser and contains no implemented video recording or upload feature. It downloads supporting scripts and model resources from external services. Scan results are not currently included in the intake email.

## Why might the body map or camera fail to load?

The body map depends on JavaScript modules, external resources, and the included `human-body2.glb` model. Missing files, blocked downloads, or incorrect server file types can prevent it from loading. Body-area controls and educational information are designed to work independently of the 3D model.

For camera problems, check browser permission and whether another program is using the camera. The deployed form should use HTTPS. See the [Deployment Guide](../deployment-guide/Deployment.md) for deployment troubleshooting, subject to the outstanding corrections below.

## Where is the form hosted, and how is it updated?

The production hosting platform and deployment process remain unconfirmed. Girwan's follow-up with Sam is to establish whether the form was deployed on Bluehost or BigCommerce and request a deployment walkthrough.

The current repository contains static form files under `src/`, including the required modules and model asset. The handoff must confirm the live URL, hosting account owner, upload location, update process, and rollback procedure. Coordinate this answer with Griffen's [deployment documentation issue #137](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/137).

The existing Deployment Guide describes an older file layout, booking URL, and example service prices. Those details need reconciliation with the current code and confirmed hosting before they are used for production changes.

## Which accounts and access need to be handed over?

The handoff should identify who controls:

- Hosting and the domain, including billing and renewals.
- EmailJS and its connected sending email service.
- The receiving mailbox.
- Calendly and its connected calendar.
- The GitHub repository and maintenance access.

These ownership details are not fully established in the repository. The sponsor and current account holders should confirm access and recovery arrangements before student access is removed.

Passwords, recovery codes, and private credentials should be transferred through an agreed secure method and kept out of the repository and documentation. The EmailJS public key and service/template identifiers used by the browser are visible in the form's source; they do not replace account access.

## What does the form cost to maintain?

Actual costs depend on the hosting and domain arrangements and the active EmailJS and Calendly plans. Current billing, renewal dates, email quotas, and scheduling limits have not been verified.

Older deployment notes list example prices and limits. Confirm the active plans with the account owners before using those figures for budgeting. The maintainer should monitor available email sends and confirm that each required booking event remains available under the active scheduling plan.

## What limitations remain at handoff?

The form depends on external services for email delivery, booking, and supporting resources. It has no client accounts, submission database, save-and-resume feature, or built-in submission recovery.

Hosting, service ownership, billing, and sponsor booking links still require confirmation. The [Security Assessment](../security/security-assessment.md) and [Security Maintenance Checklist](../security/maintenance-checklist.md) are currently placeholders, so the repository does not establish a completed security review or compliance assessment.

## Who needs to resolve the outstanding handoff questions?

| Question | Follow-up owner | Confirmation needed |
| --- | --- | --- |
| Hosting platform and production update process | Girwan, coordinating with Sam and Griffen | Live URL, host, deployment walkthrough, and rollback process; update #137 documentation. |
| Hosting, domain, and service access | Sponsor and current account holders, coordinated by the team | Account ownership, recovery access, billing responsibility, and removal of student access. |
| Email delivery, retention, and backups | EmailJS and receiving-mailbox owners, coordinated by the team | Correct recipient and template, synthetic delivery test, retention/deletion policy, and recovery arrangements. |
| Sponsor scheduling links | Griffen and the sponsor | Intended Calendly account, three event URLs, durations, and connected calendar. |
| Service costs and limits | Sponsor and billing account holders | Active plans, quotas, renewal dates, and payment responsibility. |
| Security documentation | Team and sponsor; responsible maintainer to be confirmed | Complete the assessment and maintenance checklist before treating them as handoff evidence. |

## How should the form be checked after an update?

Use synthetic information to check validation, body-area selection, optional muscle and side selection, reset behavior, email delivery, the confirmation summary, and all three booking choices. Check the camera pages if they were affected.

The repository also provides HTML, body-map, and browser checks. Record the results and any remaining problems in the related issue or pull request. See the [Test Plan](../testing/test-plan.md) for the testing record.
