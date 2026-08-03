# W3-04 UI/UX Pro Max Prompt — Booking Request Completeness

## Run at

Primary: Inception Refined Mockups (2.5), after W3-04 Requirements Analysis
freezes the field dictionary and User Stories approve the create, correction,
pricing, confirmation, and detail outcomes. Finalize before Application Design
chooses routes, view models, and command boundaries.

An Ideation Rough Mockups run may explore grouping and task flow, but remains
provisional. Construction uses this prompt only for conformance review.

## Inputs

- `design-system/linercore/MASTER.md`
- `design-system/linercore/SESSION-PROMPT.md`
- `docs/intents/W3-04-booking-request-completeness.md` and its complete Context Pack
- The approved W3-04 Requirements Analysis and User Stories
- The reviewed Booking queue/create/detail designs under `docs/ui-ux-design/`
- W2-02 Booking refined mockups under
  `aidlc/spaces/default/intents/260721-design-system-closure/inception/refined-mockups/`
- Current Booking create/detail source, BFF/API contracts, and live reference options

Do not create a binding page override before W3-04 Requirements and Refined
Mockups are approved. The reviewed W3-04 design may then supply the proposed
content for `design-system/linercore/pages/booking-request-completeness.md`.

## Skill commands

```powershell
python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "internal enterprise liner shipping booking request party cargo schedule equipment quantity reference validation pricing accessible dense form" `
  --design-system -p "LinerCore W3-04 Booking Request Completeness" -f markdown

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "enterprise booking form persistent labels reference lookup validation error recovery dirty state review" `
  --domain ux -n 8

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "server rendered create form mutations validation loading conflict recovery accessibility app router" `
  --stack nextjs
```

## Append this to the shared session prompt

```text
Active intent: W3-04 Booking Request Completeness.

Design the complete approved FCL-dry booking-request journey inside the existing
Booking module and shared shell. Start with the field dictionary approved in
W3-04 Requirements; do not add attractive but unsupported party, cargo,
schedule, equipment, or shipping-instruction fields.

Cover New Booking entry, grouped reference-backed and typed fields, derived
voyage/schedule evidence, equipment type × quantity without a fabricated
container number, save/validate/price/confirm progression, review before the
first irreversible commercial action, and complete Booking detail rendering.
Clearly distinguish requested facts, derived reference facts, assigned facts,
and pricing results. Keep USD/FCL-dry and every deferred capability honest.

Design live-reference loading/partial failure, no matches, stale/inactive
selection, validation-blocked, commodity-ineligible, no-rate/manual-pricing,
provider timeout/retry, duplicate submit, idempotency conflict, dirty
navigation, denied/read-only, legacy-incomplete record, persisted success, and
confirmation success. Preserve all entered values on every recoverable failure.

Produce route/task flow, information hierarchy, field grouping and dependency
rules, desktop/mobile wireframes, full state/recovery matrix, keyboard/focus and
announcement behavior, responsive designs at 375/390/768/1024/1440, accessibility
checklist, @erp/ui mapping, requirements/story traceability, and Playwright plus
visual-regression acceptance. Extend the established Booking create/detail
pattern; do not create a wizard without evidence, a second Booking workbench,
local theme, duplicate shell, invented API, or raw technical diagnostics in the
primary workflow.
```

## Skill-output decision record

Adopt persistent labels, on-blur validation, linked/announced errors, explicit
submit feedback, recovery actions, stable responsive dimensions, and canonical
reference search. Reject the generated Enterprise Gateway, hero, logo carousel,
sales CTA, replacement palette/font, remote font import, chart-first layout,
spinner-first loading, decorative cards, and Server Action advice where it
conflicts with the mandated Browser → Next.js BFF → backend contract.
