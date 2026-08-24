# Refined Mockups Questions — W3-04 Booking Request Completeness

All design questions were resolved by the approved Requirements Analysis, User Stories, LinerCore authority, and the separately approved reviewed design at `docs/ui-ux-design/25-booking-request-completeness.md`. No new business decision is introduced here.

## Source and authority

This answer record consumes:

- `ideation/rough-mockups/wireframes.md`
- `ideation/rough-mockups/user-flow.md`
- `inception/user-stories/stories.md`
- `inception/requirements-analysis/requirements.md`
- `inception/practices-discovery/team-practices.md`

It also follows `design-system/linercore/MASTER.md`, `design-system/linercore/SESSION-PROMPT.md`, the reviewed Booking designs 10–13, and the approved W3-04 design candidate.

## Resolved questions

### Q1. How should the complete W3-04 request be represented?

- A. One task-focused form with five groups: Booking and parties, Cargo, Route and schedule, Equipment request, Review and save
- B. A multi-page wizard with a separate route for every group
- C. Extend the W1 form without changing its current field model
- X. Other (please specify)
- `[Answer]: A — approved design; one form keeps dependencies and recovery visible without creating a wizard or second frontend.`

### Q2. Which responsive interaction pattern applies?

- A. A form plus compact review rail at 1024/1440 when width permits; one-column inline Review at 375/390/768
- B. A permanently fixed action rail at every width
- C. A mobile-only stepper with hidden prior sections
- X. Other (please specify)
- `[Answer]: A — approved design; mobile actions remain in document flow and never obscure errors or schedule evidence.`

### Q3. How are requested and carrier schedule facts presented?

- A. Keep requested departure as a POL-local user preference and show voyage-derived carrier number, ETD, ETA, cargo cutoff, and documentation deadline as read-only provenance-backed facts
- B. Replace requested departure with selected voyage ETD
- C. Treat requested departure and voyage ETD as interchangeable dates
- X. Other (please specify)
- `[Answer]: A — resolved in Requirements; variance is explained and neither value overwrites the other.`

### Q4. How is equipment represented before physical assignment?

- A. One requested line with canonical equipment type and positive quantity; no equipment-ID control; assignment remains pending
- B. Require one valid ISO container ID per requested unit
- C. Populate placeholder container IDs until CMM assigns them
- X. Other (please specify)
- `[Answer]: A — resolved in Requirements and Stories; `equipmentId` is null at initial draft and confirmation.`

### Q5. How does Booking detail expose lifecycle commands and provider recovery?

- A. Exactly one authorized next action by the FR-015 precedence, with route-backed Overview, Charges, Journey, and Activity views
- B. Show Validate, Price, Confirm, Retry, and Correct together whenever technically callable
- C. Put all lifecycle work inside the create form
- X. Other (please specify)
- `[Answer]: A — approved design; Charges owns detailed price evidence and all uncertain outcomes reuse the existing operation identity.`

### Q6. Which state coverage is binding?

- A. Full initial/loading, empty/no-match, partial/all reference failure, stale/inactive, validation, legacy, save, duplicate/idempotency, conflict/concurrent, pricing, denied/read-only, confirmation, degraded, and success matrix
- B. Happy path plus one generic error state
- C. Defer all provider and conflict states to Construction
- X. Other (please specify)
- `[Answer]: A — required by FR-018, FR-027, the reviewed design, and the Refined Mockups handoff.`

### Q7. Which design-system and accessibility baseline applies?

- A. Canonical shared shell and `@erp/ui`, `--erp-*` tokens, binding WCAG 2.1 AA baseline, keyboard/focus/live-region/non-color specifications
- B. Booking-local shell and palette with WCAG checks deferred
- C. External UI/UX Pro Max palette and font recommendations
- X. Other (please specify)
- `[Answer]: A — LinerCore and executable `@erp/ui` override conflicting external or older page recommendations.`

### Q8. Which routes and breakpoints are designed?

- A. Canonical `/booking`, `/booking/new`, `/booking/{id}?tab=overview|charges|journey|activity`, with correction-route shape left to Application Design; verify 375, 390, 768, 1024, and 1440px
- B. Continue `/bookings` as a second canonical implementation
- C. Invent nested detail routes during Refined Mockups
- X. Other (please specify)
- `[Answer]: A — approved route proposal; `/bookings` remains compatibility only.`

## Story representation check

| Story | Designed representation |
|---|---|
| US-01–US-02 | Complete create/reopen request form and persisted Review |
| US-03 | Requested-versus-derived Carrier schedule panel |
| US-04 | Same-record Correct flow and legacy-incomplete state |
| US-05 | Live governed option states and Validate action |
| US-06–US-07 | Charges view, exact price basis, recovery matrix, reprice state |
| US-08 | Confirmation impact dialog and pending assignment success |
| US-09 | Canonical queue/detail route composition and one next action |
| US-10 | Permission-specific visibility, safe errors, privacy boundary |
| US-11 | Playwright/live Compose evidence plan across required states |
| US-12 | Collapsed privacy-safe Technical details |

## Open questions

No product, field-dictionary, schedule, role, responsive, or interaction question blocks this stage. Application Design must resolve the correction route/mode and exact BFF/REST/component boundaries. The reviewed multiline cargo control requires a W2-02-owned shared `TextArea`/counter; W3-04 may not create a local substitute. Live browser and Compose visual evidence was unavailable during the advisory design run and remains a downstream verification dependency.

## Approval scope

The proposed future `design-system/linercore/pages/booking-request-completeness.md` content is recorded in `design-system-mapping.md` and is pending this Refined Mockups gate. Approval accepts the proposal as a page-level contract for governed later use; it does not authorize writing that file, editing `MASTER.md`, changing `packages/ui`, or modifying production code.
