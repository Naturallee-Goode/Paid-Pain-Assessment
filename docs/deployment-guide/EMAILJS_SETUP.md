# EmailJS Configuration and Verification

The intake sends browser-side parameters through EmailJS in `src/script.js`; `src/form-submission.mjs` defines the data supplied to the email template, including body area, muscle, and side. Public browser configuration identifiers are visible to users and must not be treated as secrets. Private credentials must stay out of source control.

## Before changing production configuration

1. With the sponsor and account owner, confirm the intended EmailJS account, connected mail service, recipient, service/template identifiers, allowed origins, retention, access controls, applicable agreements, and production publishing path.
2. Compare the actual EmailJS template variables against `buildEmailParams` in `src/form-submission.mjs`; verify selected area, muscle, and side are represented as intended. Existing templates and settings must be checked in the account rather than assumed from this file.
3. Make configuration changes through a reviewed branch and the authorized deployment process. Do not copy private keys, passwords, client answers, or production messages into an Issue or PR.
4. With authorization, submit synthetic data in a suitable test environment and confirm delivery, recipient, values, failure message, and retry. The `npm run test:intake` check uses a mock and does not send a real email.

Production delivery and page editing remain open under [#5](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/5), [#40](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/40), and [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68). Use the [security assessment](../security/security-assessment.md) and [test plan](../testing/test-plan.md) when reviewing changes. Confirm current provider terms and pricing directly with the account owner.
