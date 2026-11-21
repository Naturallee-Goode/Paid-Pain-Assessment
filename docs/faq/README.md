# Project Handoff FAQ

## What does the form do?

It collects contact details, pain information, wellness goals, and a consultation preference. Clients can mark the affected area on the body map. After submission, they see a summary and a booking calendar.

## Does the form provide a medical diagnosis?

No. The body map shows educational examples of possible issues.

## Does a client need an account?

No.

## Does a client have to select a specific muscle or side?

No. Both are optional. Use **Explore muscles (advanced)** to find a specific muscle. See the [User Guide](../user-guide/README.md).

## How can a client clear their selections?

Use **Clear Selection** to reset the body map or **Clear side** to remove the side. Resetting the entire form requires confirmation.

Changing body areas clears the muscle and side. Switching to simple view clears only the muscle.

## What information is included in the submission email?

The email mapping includes contact details, body-map selections, pain details, wellness goals, consultation preference, product interest, and submission time. The configured EmailJS template determines what appears in the email. See [form-submission.mjs](../../src/form-submission.mjs).

## Where do submissions go?

The form uses `goode@naturalleegoode.com` as the intended recipient. Verify delivery with a synthetic submission.

## Are responses saved so clients can return later?

No.

## How are submissions backed up or recovered?

The form has no built-in backup or recovery. Delivered emails may be recoverable through the receiving mailbox, depending on its retention settings.

## What happens if submission fails?

The form shows an error and keeps the intake open for a retry. A retry can send a duplicate email if the first attempt went through. If an email is missing, check the inbox, spam folder, and [EmailJS setup](../deployment-guide/EMAILJS_SETUP.md).

## Does submitting the form book an appointment?

No. Clients must complete booking in Calendly.

- Quick Pain Check — 15 minutes.
- Movement & Relief Session — 30 minutes.
- Full Wellness Assessment — 60 minutes.

Confirm the sponsor's Calendly links in [script.js](../../src/script.js).

## What are the upper- and lower-body scans?

The scans use the webcam to show joint-angle feedback. They require camera permission and process video in the browser without recording or uploading it. The intake email excludes scan results.

## Why might the body map or camera fail to load?

For the body map, check that scripts and the 3D model load. For the camera, check browser permissions, HTTPS, and whether another app is using it. See the [Deployment Guide](../deployment-guide/Deployment.md).

## Which accounts and access need to be handed over?

Confirm ownership and recovery access for hosting, the domain, EmailJS, the sending and receiving mail accounts, Calendly, the connected calendar, and GitHub. Transfer private credentials securely.

## What does the form cost to maintain?

Costs depend on hosting, domain renewal, and the active EmailJS and Calendly plans. Current costs are unverified.

## How should the form be checked after an update?

Use synthetic data to check validation, body-map selection, reset, email delivery, the confirmation summary, and all three booking options. Check the camera pages if they changed.
