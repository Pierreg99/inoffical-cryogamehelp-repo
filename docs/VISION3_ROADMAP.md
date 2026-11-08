# CRYOGAMEHELP — Vision 3.0 Delivery Roadmap

**Status:** Approved project direction; staged implementation, not a claim that proposed features exist.
**Reviewed current main:** `7f75b0334b6844a62128c6de619c38f897419ec1`, 8 evergreen guides, 4 supported games, EN/DE/FR website, browser-local team/deck plans and Playwright tests.
**Primary users:** mobile players looking up a guide, organizing a team or deck, and revisiting progress without an account.

## Scope and constraints

- Keep the existing fast, self-contained static site under `docs/`; avoid paid API dependencies or speculative AI integrations.
- Preserve all current game modules, all three languages, the existing localStorage plans, and the publisher/artwork source manifest.
- Distinguish **editorial strategy guidance** from live rules, current competitive rankings, ability verification and game achievements. The website does not have a verified game API.
- Treat fan art, game screenshots and trademarks as third-party material, not as MIT-licensed assets.
- Release only after passing required GitHub Actions checks, mobile/desktop testing, rights review and human acceptance. Do not auto-merge failing changes.

## Delivery stages

| Phase | Deliverable | Evidence and acceptance | State |
| --- | --- | --- | --- |
| P0 · Repair | Fix Legends checklist visual completion update | A check/uncheck changes the row class, label, progress and localStorage. Existing EN/DE/FR and 320–1440 px browser tests remain green. | **Verified on main** `370b920` ([CI](https://github.com/Pierreg99/inoffical-cryogamehelp-repo/actions/runs/42432261524)) |
| P1 · Learning | Expand structured guide progress to other evergreen guides, scoped by guide ID | Independent per-guide progress, clear reset, migration tests, no cross-guide state leakage and graceful storage-denied behavior | **Merged PR #7**, verified on main |
| P2 · Strategy Lab | Split Dragon Ball Legends planning into 3 battle slots + 3 bench slots with manual tag/Z-Ability notes | Accessible role moves, saved manual notes, six-slot limits, old team migration and text export; current synergies remain unverified | **Merged PR #8**, verified on main |
| P3 · Deck Lab | Deck validation hints for Pocket and Live, plus safe JSON import/export with a schema version | 20/60 sizes, type breakdown, validated local 64 KB JSON import/export, duplicate and copy-limit rejection, browser tests; current format legality not verified | **Merged PR #9**, verified on main |
| P4 · Visual Quality | Context-driven responsive UI refinement and keyboard/touch QA | Clear navigation, 44×44 px touch controls, focus visibility, 200% zoom, empty/error states, reduced-motion alternative; contrast and browser evidence recorded | **Merged PR #10**, Omega Lab experimental; manual a11y review outstanding |
| P5 · Optional AI Assist | Privacy-conscious screenshot/strategy assistant design after data rights and model/runtime selection | Explicit upload/consent and data deletion, evidence-linked outputs, no secret keys in client JS, human confirmation for uncertain interpretations | **Local screenshot review implemented in feature PR**; no AI model or upload; CI pending |
| P6 · Release | Versioned release notes and publisher-asset audit | CI green, smoke tests, issue triage, attribution verified and explicit release approval | **Automated metadata gate implemented in feature PR**; rights and release approval pending |

## P0: resolved regression and root cause

The workflow run [42426195045](https://github.com/Pierreg99/inoffical-cryogamehelp-repo/actions/runs/42426195045) showed **32 passed and 2 failed** browser cases, both from the same Legends progress test running on desktop and mobile.

The progress counter increased, but `[data-learning-step="0"]` never received `is-complete`. The implementation searched for `[data-progress-step]` **inside** `.learning-panel`, while the inputs are rendered in the sibling `.guide-steps`. The proposed fix scopes checkbox updates to the dialog's `.guide-steps`. A new test checks transitions in both directions.

Runner evidence confirmed the defect. Follow-up PR #6 corrected it and was merged as `370b920`; the `main` CI completed successfully. P1–P4 were merged with green main CI. Historical regression failures remain documented.

## Vision design acceptance

- **Hierarchy:** one main action per screen; guide step completion is discoverable beside its step.
- **Typography:** readable body content on handheld devices, no reliance on tiny decorative metadata.
- **Contrast:** dark/light content, badges and focus outlines tested in browser, not assumed.
- **Spacing:** consistent spacing rhythm; mobile columns reflow at 320px and above.
- **Motion:** show purpose and retain `prefers-reduced-motion` behavior.
- **Accessibility:** labelled checkboxes, text status updates, keyboard tab order, 44px minimum touch targets where feasible.
- **States:** unstarted, partial, completed, cleared, unsupported browser storage.
- **Microcopy:** mark checklist as **self-reported learning progress**, never game-server verified.

Keep the website's existing palette unless a separate design review and user approval validates a new theme. Design guidance must not silently import tokens from another project.

## Technical ownership

- `docs/data.js` — game and guide definitions; maintain stable guide IDs.
- `docs/app.js` — event delegation, local persistence, rendering and safe input handling.
- `docs/i18n.js` — English/German/French interface strings.
- `docs/styles.css` — responsive visual tokens and states.
- `tests/hub.spec.js` and `tests/layout.spec.js` — regression + responsive tests.
- `docs/assets/sources.json` — copyright and attribution records.

**No background agents:** work is performed only when a user session/authorized integration executes it. This document is a backlog and review contract, not a deployed scheduler.

## Verification commands

```sh
npm ci
npm run check
npx playwright install --with-deps chromium
npm test
```

Compare the new CI result with the exact head SHA. Record failures precisely; a green syntax check alone is not a browser test. Review existing [README PR #4](https://github.com/Pierreg99/inoffical-cryogamehelp-repo/pull/4) separately before merge, and remove descriptions of non-existent rendering loops or unsupported runtime features.

## Deliverables and decision gates

1. **P0 verified:** complete browser tests passed on the `main` merge commit.
2. **P1–P4 merged:** exact main CI passed; publisher rights and manual screenreader review remain separate gates.
3. **Release** only after rights and quality gates, with explicit sign-off.

Last updated: 2026-11-08. P1/P2 have green browser CI; P3 is implemented in a review branch, pending CI and release approval.

## P5/P6 evidence

- [Screenshot review](screenshot-review.html): local opt-in, manual notes only, no model or image upload. [Privacy boundaries](SCREENSHOT_REVIEW.md).
- [Release metadata audit](RELEASE_GATE.md): manifest/file checks in CI, but **not** publisher permission or release approval.
