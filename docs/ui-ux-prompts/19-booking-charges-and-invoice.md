$ui-ux-pro-max

Act as a principal enterprise UX designer with deep experience in ocean-freight
booking charges, demurrage and detention accrual, itemized pricing provenance,
invoice delivery evidence, and operational ERP record details. This is an
AI-DLC Inception design task for LinerCore W3-02. Do not edit production code in
this turn.

Inspect `docs/intents/W3-02-dnd-pricing-and-invoice.md` and its complete Context
Pack, the approved W3-01 provider and evidence contract, the existing Booking
detail/Charges design from prompts `12` and `18`, current Booking, Charge, and
Finance APIs/events, shared `@erp/ui`, and the running demo.

Extend the existing canonical Booking detail page. Do not create a Finance
module, separate invoice workbench, shell navigation item, AR/GL workflow,
dispute, waiver, credit-note, or manual-invoice capability.

Design the Charges tab around this hierarchy:

1. Financial summary: booking reference/revision, currency, booking-time total,
   D&D total, grand total, and invoice delivery status.
2. Booking-time charge lines and immutable pricing snapshot provenance.
3. D&D accrual using the real `DISC` to `GTOT` boundary and movement times.
4. Invoice emission and delivery evidence.
5. Collapsed technical evidence for correlation, source versions,
   idempotency, and bounded payload diagnostics.

Each line must show charge code and readable meaning, basis, quantity or days,
unit rate, amount, currency, pricing reference, and source agreement/rule/rate
version. Never silently combine currencies. Show elapsed, free, and chargeable
days so an operator can understand a D&D amount without decoding a payload.

Design this honest progression:

- Awaiting bounding movement.
- Within free time with a calculated zero result.
- D&D pricing pending.
- Priced.
- Invoice pending.
- Emitted/delivered.
- Failed and retryable with clear recovery ownership.
- Duplicate redelivery ignored through idempotency.

Also cover denied, loading, stale, partial/degraded, Charge unavailable, Finance
unavailable, and scoped retry states. Preserve available Booking facts when one
financial section fails. Do not offer a retry action to a role or module that
does not own recovery.

Use the approved LinerCore Booking detail structure and visual language. Keep
the contextual journey ribbon where the Booking contract requires it, compact
tables, labelled evidence disclosures, light neutral surfaces, restrained
maritime blue, semantic status tokens, tabular numerals, Lucide icons, and
stable skeletons. Reject decorative finance charts, remote replacement fonts,
marketing composition, nested cards, and spinner-only waits.

At 390px, charge lines become semantic labelled records with basis, amount,
currency, and status visible. At wider breakpoints, use readable itemized tables
without page-level horizontal overflow. Meet WCAG 2.2 AA with accessible table
semantics, named disclosures, logical keyboard order, polite pending/status
announcements, and textual failure reasons.

Produce:

1. Role/task and information-priority assumptions.
2. Updated Booking Charges-tab desktop/mobile wireframes.
3. High-fidelity summary, line-item, D&D calculation, invoice-status, and
   evidence-disclosure specifications.
4. Full state, announcement, recovery-owner, and action matrix.
5. Responsive behavior at 390, 768, 1024, and 1440px.
6. `@erp/ui` mapping without redesigning the shell or Booking workbench.
7. Keyboard, focus, screen-reader, and WCAG acceptance criteria.
8. Playwright and visual-regression checklist tied to W3-02 outcomes.

Do not implement until W3-01 and this design are reviewed and approved.
