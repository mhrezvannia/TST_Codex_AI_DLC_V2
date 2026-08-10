# W3-02 UI/UX Pro Max Prompt — D&D Pricing & Invoice

## Run at

Primary: Inception Refined Mockups (2.5), after W3-01's provider contract and
this intent's requirements/stories are approved. Use the output in Application
Design before the Booking Charges-tab API/view model is frozen.

## Inputs

- `design-system/linercore/MASTER.md`
- `design-system/linercore/SESSION-PROMPT.md`
- `design-system/linercore/pages/booking-charges-and-invoices.md`
- W2-02 Booking refined mockups under
  `aidlc/spaces/default/intents/260721-design-system-closure/inception/refined-mockups/`
- `docs/intents/W3-02-dnd-pricing-and-invoice.md` and its complete Context Pack
- Approved W3-01 interaction/contract outputs

## Skill commands

```powershell
python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "internal enterprise liner shipping booking charges demurrage invoice status itemised money provenance audit accessible master detail" `
  --design-system -p "LinerCore W3-02 D&D Pricing and Invoice" -f markdown

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "financial invoice line items status evidence audit accessible detail" `
  --domain ux -n 8

python .codex\skills\ui-ux-pro-max\scripts\search.py `
  "server rendered detail tabs deferred data loading accessibility" `
  --stack nextjs
```

## Append this to the shared session prompt

```text
Active intent: W3-02 D&D Pricing & Invoice Emission.

Extend the existing Booking detail—not the shell and not a new Finance module—
with a Charges tab that presents booking-time charges, D&D accruals, and invoice
delivery status. Show itemised lines with charge code, readable meaning, basis,
quantity/days, unit rate, amount, currency, pricing reference, source agreement/
rule/rate versions, and movement boundary DISC→GTOT. Keep correlation and raw
payload details inside a collapsed evidence disclosure.

Design the progression awaiting bounding movement → within free time/zero → D&D
pricing pending → priced → invoice pending → emitted, plus failed/retryable,
duplicate-redelivery/idempotent, denied, partial/degraded, and unavailable Charge
or Finance states. The operator must understand what happened without being
offered AR/GL, dispute, waiver, credit-note, or manual invoice workflows that are
outside scope.

Produce refined Booking-detail wireframes at 375/768/1024/1440, the Charges-tab
information hierarchy, line-item/invoice status table, state and announcement
matrix, keyboard path, responsive behavior, accessibility checklist, and @erp/ui
mapping. Preserve the W2-02 Booking page structure and contextual journey ribbon.
```
