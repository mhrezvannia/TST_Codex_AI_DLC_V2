# Rough Mockups Questions - W1-01 Booking Quote-to-Cash

Source context: `ideation/intent-capture/intent-statement.md`, `ideation/scope-definition/scope-document.md`, and `ideation/scope-definition/intent-backlog.md`.

## Q1. Entry points and routes

Which Booking-local routes should form the W1 UI?

- A. Booking list/work queue as the default route, a dedicated create route, and a stable booking detail route; global shell/auth stays deferred to W2-01 (recommended)
- B. Keep all create, list, actions, and detail content in the existing single three-column workbench
- C. Build the full enterprise shell and cross-module navigation now
- X. Other (please specify)
- `[Answer]:` A. List create detail (Recommended)

## Q2. Core happy path

How should the agent complete the thin journey?

- A. List -> Create booking -> Review draft detail -> Validate -> Price -> Confirm -> wait/refresh for CMM status on the same detail route (recommended)
- B. Require direct API use for validate, price, confirm, and status inspection
- C. Add amendments, cancellation, D&D, and multi-leg steps to the W1 flow
- X. Other (please specify)
- `[Answer]:` A. Lifecycle detail (Recommended)

## Q3. Detail information hierarchy

What should be most prominent on the detail page?

- A. Header with booking reference/status and route summary; then lifecycle actions; then routing, equipment, quote, and movement status in compact scannable sections with audit metadata secondary (recommended)
- B. Lead with raw IDs, correlation IDs, and transport diagnostics
- C. Show only lifecycle status and hide route, equipment, and quote details
- X. Other (please specify)
- `[Answer]:` A. Operational summary (Recommended)

## Q4. Design-system boundary

Which visual/component baseline should W1 follow?

- A. Reuse existing `@erp/ui` primitives and restrained operational patterns, adding only Booking-local composition needed for the journey; defer full design-system migration to W2-02 (recommended)
- B. Create a new independent component library inside Booking
- C. Implement the W2 enterprise shell and full visual-system redesign in W1
- X. Other (please specify)
- `[Answer]:` A. Reuse @erp/ui (Recommended). User direction: inherit the W2-02 visual work where useful, while changing the Booking composition as needed and not importing W2-02 scope.

## Q5. Responsive support

Which form factors must the rough mockups cover?

- A. Desktop-first dense operations layout with usable tablet/mobile reflow: tables become stacked summaries, actions remain reachable, and no horizontal page overflow (recommended)
- B. Desktop only at one fixed resolution
- C. Mobile-only layout with desktop treated as stretched mobile
- X. Other (please specify)
- `[Answer]:` A. Responsive operations (Recommended)

## Q6. Accessibility target

What accessibility baseline applies?

- A. WCAG 2.1 AA: semantic landmarks/headings, keyboard-complete flow, visible focus, labelled fields, text-plus-icon status, live announcements, and 200% zoom support (recommended)
- B. Mouse-only operation is sufficient for W1
- C. Defer accessibility until W2-02
- X. Other (please specify)
- `[Answer]:` A. WCAG 2.1 AA (Recommended)

## Q7. Asynchronous movement feedback

How should the detail page expose the CMM status return?

- A. Show an explicit pending state after confirmation, poll while pending with a visible last-updated indicator, and provide a refresh control and actionable error without exposing Kafka internals (recommended)
- B. Require the user to leave and reopen the page without any pending or refresh state
- C. Display raw topic offsets, schema IDs, and broker errors as the primary user feedback
- X. Other (please specify)
- `[Answer]:` A. Pending and refresh (Recommended)
