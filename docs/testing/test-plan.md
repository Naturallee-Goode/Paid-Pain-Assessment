# Pain Assessment Test Plan

This plan covers the integrated repository version of the static intake and body map. Run checks on the commit or PR being reviewed and record the commit, date, commands, results, and any limitations in the PR. Use synthetic information only.

## Automated checks

From the repository root, using Node 24 as in [CI](../../.github/workflows/static-site-ci.yml):

```sh
npm ci
npm run lint:html
npm run test:body-map
npx playwright install chromium
npm run test:browser
npm run test:intake
```

`test:body-map` runs the Node unit/DOM/source tests; `test:browser` exercises the body-map workflow with Playwright and the checked-in model; `test:intake` uses a mocked EmailJS response to compare submission data and confirmation. These browser checks start their own local server. Browser dependencies and CDN access may be necessary; a mock success does not prove real email delivery. CI also checks JavaScript syntax and required files; inspect the workflow for the authoritative current steps. `test:intake` is a separate local check unless it appears in that workflow.

## Manual scenarios

| Area | Verify | Expected result |
| --- | --- | --- |
| Intake validation | Leave required fields and consent empty; then complete them with synthetic data. | Required entries are identified, and an incomplete form does not submit. |
| Simple body map | Choose several areas without muscle or side. | Area name and educational information update; a muscle and side are optional. |
| Advanced search | Choose an area, open advanced mode, search and select a muscle, then change area. | Results match the chosen area; displayed selection and later confirmation agree. |
| Reset and failure | Rotate/zoom, choose an area, clear selection; exercise a model-load failure. | Clear restores the starting view and preserves unrelated answers; area controls remain usable if the viewer fails. |
| Keyboard and screen reader | Navigate and operate controls without a mouse; check announcements on a representative browser/device. | Controls are reachable and understandable, with visible focus and useful announcements. Record device and results. |
| Responsive display | Exercise the flow at phone and desktop widths. | Controls and information remain readable and usable without unintended overflow. |
| Submission and booking | In an approved test environment, use synthetic values; check success, failure/retry, confirmation, and the selected event link. | The expected values appear in the confirmation and test message; failure offers recovery. Production delivery requires separate owner-authorized verification. |
| Scanners | With permission, try upper and lower scanner controls on a supported browser. | Camera permission and start/stop behavior are understandable; document browser and limitations. |

## Evidence and outstanding verification

Feature records and screenshots are in [docs/testing](.) and linked from the [iteration review](../../course/iterations/iteration-2/review.md). The latest verified main CI result should be read from [Actions](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/actions), not inferred from an older feature run. See [#53](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/53) for remaining accessibility work and [#5](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/5), [#40](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/40), and [#68](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/68) for live delivery and hosting dependencies. Sponsor content review remains under [#81](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/81).

Pass means applicable automated checks pass and manual acceptance criteria are recorded with evidence. Record failures, omissions, mocked services, and device/browser coverage rather than assuming they passed. Review and rerun against the final integration commit before release.
