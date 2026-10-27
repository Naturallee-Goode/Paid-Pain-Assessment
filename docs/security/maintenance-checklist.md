# Security and Operations Maintenance Checklist

Review with the sponsor and technical owner before a production change and periodically thereafter. Record the reviewer, date, findings, and follow-up Issues without including credentials or client information.

- [ ] Confirm the owner and authorized maintainers for hosting, source control, EmailJS, mailbox, and Calendly; remove access that is no longer needed through the account owner.
- [ ] Confirm the actual published source and deployment procedure; check HTTPS and run an approved synthetic end-to-end test after deployment. Track access gaps in [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68).
- [ ] Review email template fields, recipient, access, logs, retention, and delivery failures with the service and mailbox owners; do not put real submissions in test evidence.
- [ ] Confirm production Calendly links and booking settings. Source currently uses test-account routes.
- [ ] Review external script dependencies and service configuration; update and run the [test plan](../testing/test-plan.md) when changes are made.
- [ ] Confirm current privacy, legal, contractual and service obligations with appropriate owners/advisers. Review [security assessment](security-assessment.md); do not infer compliance from a checklist.
- [ ] Review open defects and follow-ups in the [Project](https://github.com/orgs/Naturallee-Goode/projects/1) and [Issues](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues), including accessibility, hosting, and sponsor content approval.
- [ ] Store any credentials in the approved account or secret-management system; do not place secrets or client data in the repository, PRs, screenshots, or logs.
