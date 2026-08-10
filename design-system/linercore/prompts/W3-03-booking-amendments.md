# W3-03 UI/UX Pro Max Prompt — Booking Amendments

## Run at

Primary: Inception Refined Mockups (2.5), after requirements define editable
fields and user stories define the re-gating/reconfirmation outcomes. Finalize
before Application Design chooses command and page-state boundaries.

## Inputs

- `design-system/linercore/MASTER.md`
- `design-system/linercore/SESSION-PROMPT.md`
- `design-system/linercore/pages/booking-amendments.md`
- W2-02 Booking refined mockups under
  `aidlc/spaces/default/intents/260721-design-system-closure/inception/refined-mockups/`
- Approved W3-04 Booking Request Completeness requirements, refined mockups,
  reviewed design, and page override (when approved)
- `docs/intents/W3-03-booking-amendments.md` and its complete Context Pack

## Skill commands

```powershell
python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "internal enterprise liner shipping confirmed booking amendment compare changes reconfirm equipment assignment history accessible forms" `
  --design-system -p "LinerCore W3-03 Booking Amendments" -f markdown

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "amendment compare before after dirty form reconfirm history validation" `
  --domain ux -n 8

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "form mutations optimistic conflict loading accessibility app router" `
  --stack nextjs
```

## Append this to the shared session prompt

```text
Active intent: W3-03 Booking Amendments & Re-confirmation.

Treat the approved W3-04 field dictionary and create/detail design as the
authoritative Booking baseline. W3-03 may edit only the amendment fields its
requirements approve; it must not reopen or redesign the complete request form.

Design amendment entry from a confirmed Booking detail page, a dedicated amend
route, a review-and-reconfirm step, and amendment history. The MVP permits
equipment quantity changes and manual ISO 6346 container-number assignment. It
does not permit routing changes, cancellation, split, roll, or amendment fees.

Keep original and proposed values clearly distinguishable without color-only
meaning. Show which commercial gates will rerun, the current and next booking
revision, repricing impact, dirty-state protection, validation summary, concurrent
revision conflict, pending reconfirmation, success, broker/CMM propagation status,
and recovery when downstream reconciliation is delayed. The confirmation must
state that full booking state will be re-emitted and CMM journeys reconciled.

Produce route/task flows, before/after review wireframes, amendment-history design,
state matrix, focus behavior for validation and confirmation, responsive designs,
accessibility checklist, and @erp/ui mapping. Extend the established W2-02 Booking
detail pattern; do not create a second Booking workbench.
```
