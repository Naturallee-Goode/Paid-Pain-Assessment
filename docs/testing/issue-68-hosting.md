# Issue #68: where the public pain assessment is served

Checked October 27, 2026. This is a read-only investigation; no production page or account settings were changed.

## Observed public delivery path

| Evidence | Observation | What it establishes |
| --- | --- | --- |
| `curl -IL https://naturalleegoode.com/pain-assessment` | HTTP 200 with `server: cloudflare`, `bc-ray`, and `x-bc-store-id: 1001418660` | The public route passes through the sponsor's BigCommerce storefront edge. The Cloudflare header identifies its public proxy, not the page's authoring system. |
| `curl -IL https://www.naturalleegoode.com/pain-assessment` | HTTP 301 to the apex-domain route | The apex route is canonical. |
| Public page HTML at that URL | A standalone document with inline CSS and JavaScript, including the older unrestricted muscle search | The deployed HTML is not the current repository's modular `src/index.html` plus `script.js`, `styles.css`, and `viewer.js`. |
| Public page model loader | Requests `https://SamBillante.github.io/Paid-Pain-Assessment/assets/human-body2.glb` | The page depends on an asset URL from the predecessor GitHub Pages project. This URL does not establish where the HTML is edited. |
| This repository's `.github/workflows/static-site-ci.yml` | Validation on PRs and `main`, without a deployment job | A merge to this repository does not, by itself, show a deployment path to the sponsor's route. |
| Existing team note in `docs/testing/deployment issue.txt` | Sponsor-provided Bluehost access had no matching pain-assessment file; the available BigCommerce editor did not show this page | The team has not yet identified the editable source or demonstrated control over this route. |

The response also includes `x-makeswift-*` headers, but those headers alone do not prove that this particular page is authored in Makeswift or Catalyst. The current evidence establishes BigCommerce delivery and an older standalone page, not the specific editor, storage location, or deploy mechanism.

## What completes the investigation

An account owner needs to identify the route mapping for `/pain-assessment` in BigCommerce and any connected page-builder, app, theme, or custom route, then show which source document or repository publishes that response. A preview or other reversible update to a non-sensitive marker would demonstrate edit access. Record the controlling account, source location, publish steps, and rollback path without committing credentials. If the route cannot be edited with available access, record the missing permission and the account owner who can grant it.

The issue's proof-of-access criterion remains open until that check is performed. The same dependency blocks live verification of EmailJS template changes on the production page.
