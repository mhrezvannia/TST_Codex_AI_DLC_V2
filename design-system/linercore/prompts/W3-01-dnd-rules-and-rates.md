# W3-01 UI/UX Pro Max Prompt — D&D Rules & Rates

## Run at

Primary: Inception Refined Mockups (2.5), after approved requirements and user
stories. Reuse the approved result in Application Design (2.6); run focused
conformance searches again during Code Generation/Build & Test.

## Inputs

- `design-system/linercore/MASTER.md`
- `design-system/linercore/SESSION-PROMPT.md`
- `design-system/linercore/pages/charge-and-agreements.md`
- `design-system/linercore/pages/dnd-rules-and-rates.md`
- `docs/intents/W3-01-dnd-rules-and-rates.md` and its complete Context Pack

## Skill commands

```powershell
python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "internal enterprise liner shipping demurrage detention rule rates administration data tables versioned forms evaluation evidence accessible light-first" `
  --design-system -p "LinerCore W3-01 D&D Rules and Rates" -f markdown

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "versioned rate rules data table form validation approval workflow accessibility" `
  --domain ux -n 8

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "server rendered list detail forms loading mutations accessibility" `
  --stack nextjs
```

## Append this to the shared session prompt

```text
Active intent: W3-01 D&D Rules & Rates.

Design the Charge-owned D&D administration flow inside the existing authenticated
shell. Cover rule-type list/detail/create, rate list/detail/create, agreement
linkage, and a bounded evaluation panel that proves the real engine. Preserve the
three MVP meanings: demurrage DISC→GTOT, detention GTOT→GTIN, and combined. Show
port-local calendar-day basis, free days, daily rate, currency, effective window,
agreement/rate versions, and charge-code provenance.

The evaluation flow accepts a reviewed movement pair and timestamps, then shows
elapsed days, free days, chargeable days, line calculation, total, currency, and
the exact rule/rate/agreement versions. Design zero-within-free-time, chargeable,
validation, version conflict, unauthorized/read-only, loading, empty, pending,
success, service error, and degraded evidence states. Never imply that CMM owns
or edits D&D rules. Do not add Booking triggers or invoices; those belong to
W3-02.

Produce the binding interaction spec, route map, desktop/mobile refined
wireframes, state matrix, keyboard/focus sequence, responsive table behavior,
accessibility checklist, and @erp/ui mapping. Reuse the existing Charge page
contract and identify missing shared primitives without editing packages/ui from
this intent.
```
