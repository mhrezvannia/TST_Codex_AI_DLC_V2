# Rough Mockups Questions - W2-04 Container Movement

These decisions refine `intent-statement.md`, `scope-document.md`, and
`intent-backlog.md` under the binding LinerCore shared-shell contract.

## Q1. Canonical screens

- A. `/container-movement` journey list plus `/container-movement/journeys/{id}` detail/timeline and capture composition (recommended)
- B. One dashboard-only screen with no shareable journey route
- C. A separate standalone Container Movement portal
- X. Other (please specify)
- `[Answer]:` A. Canonical journey list plus detail/timeline (Recommended)

## Q2. Capture placement

- A. A labelled capture panel on detail at desktop that becomes an accessible drawer/stacked section on narrower widths (recommended)
- B. A nested modal launched from another modal
- C. A separate full-page wizard for each movement
- X. Other (please specify)
- `[Answer]:` A. Responsive capture panel on journey detail (Recommended)

## Q3. Timeline hierarchy

- A. Identity/status/actions first, route facts second, one ordered expected-and-actual timeline third, collapsed audit last (recommended)
- B. Raw Kafka payload and schema details first
- C. Separate expected and actual pages requiring mental comparison
- X. Other (please specify)
- `[Answer]:` A. Operational hierarchy with one combined timeline (Recommended)

## Q4. Observable validation

- A. Show the next expected code but allow thin-code selection; server rejection stays inline, preserves input, names duplicate/sequence reason, and leaves state visibly unchanged (recommended)
- B. Hide every invalid option so rejection can never be observed
- C. Accept and silently reorder invalid input
- X. Other (please specify)
- `[Answer]:` A. Inline server rejection with preserved input and unchanged state (Recommended)

## Q5. Responsive list/detail behavior

- A. Compact table with intentional horizontal handling at 768+; scannable record rows and single-column detail/capture at 375 (recommended)
- B. Desktop-only fixed-width table
- C. Replace the operational list with KPI cards on mobile
- X. Other (please specify)
- `[Answer]:` A. Compact table to scannable record rows and single-column detail (Recommended)

## Q6. States, accessibility, and Booking link

- A. Specify loading, empty, error/retry, denied, populated, validation, success, keyboard/focus, light/dark, and a canonical Booking-detail link without redesigning Booking (recommended)
- B. Wireframe only the populated mouse-driven state
- C. Duplicate Booking status UI inside Container Movement
- X. Other (please specify)
- `[Answer]:` A. Full state, accessibility, responsive, theme, and Booking-link contract (Recommended)
