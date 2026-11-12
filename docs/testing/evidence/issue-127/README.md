# Issue #127 UI evidence

Issue: https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/127

Branch: `fix/127-intake-control-formatting`

Before screenshots show the unchanged `4aa1e1b` UI; after screenshots show the
local working changes. Each desktop pair uses the same browser viewport and
selections. Screenshots contain only synthetic option selections, with no contact
information entered and no form submission.

| Change | Before | After |
| --- | --- | --- |
| Radio size, label spacing, and sage-green color | [Before](before-radio-spacing.png) | [After](after-radio-spacing.png) |
| Session duration beneath title in secondary gray | [Before](before-session-duration.png) | [After](after-session-duration.png) |
| Consent box without green left border | [Before](before-consent-border.png) | [After](after-consent-border.png) |

Additional checks:

- [Keyboard focus](after-keyboard-focus.png): Space selects a session; ArrowRight
  moves selection to the next option, retaining a single selection and visible
  green outline.
- Mobile: [radios](after-mobile-radio-spacing.png),
  [session durations](after-mobile-session-duration.png), and
  [consent](after-mobile-consent-border.png). At the 390 × 844 browser override,
  the document client width and scroll width both measured 375 CSS pixels;
  no horizontal overflow was present.
- All radios measured 20 × 20 CSS pixels with 16 px right spacing and accent
  color `#6B8E4E`; session duration text uses existing secondary color `#666666`.
- A follow-up audit compared all 14 radios across Side, Pain Duration,
  Consultation Preference, and Product Support. All use identical control size,
  label spacing, accent color, centered label alignment, and no flex shrinking.
  The original [Side radio group](after-side-radio-consistency.png) is the
  formatting reference; no additional source changes were needed.
- The consent left border measured 0 px.
- HTML validation, JavaScript syntax checks, and `git diff --check` passed.
- All 52 existing tests passed both before and after the changes.
- The existing browser regression suite passed using installed Chrome through
  `CHROME_PATH`; the sandbox's bundled Playwright browser was unavailable.
- The local preview returned `text/javascript` for
  `/body-map-app.mjs?v=6`; the body model rendered in advanced view.

AI assistance: Codex implemented the focused HTML/CSS changes, captured browser
evidence, and ran verification. Human visual review is pending before PR creation.
