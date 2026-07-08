# NFR Requirements Questions - U06 Reference Data App

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Frontend access model

How should browser code reach backend capabilities?

A. Browser clients call only `apps/reference-data` BFF handlers; BFF calls `identity-service` and `reference-data-service` (recommended)
B. Browser calls backend services directly
C. Browser reads service databases through generated clients
X. Other (please specify)

[Answer]: A. BFF-only backend access (Recommended)

## Q2. Read-only/denied behavior

How should users without write permission be handled?

A. Render read-only or access-denied states with safe correlation id and request-access affordance where available (recommended)
B. Hide the app entirely
C. Let disabled controls fail at submit
X. Other (please specify)

[Answer]: A. Supportable read-only/denied states (Recommended)

## Q3. Validation resilience

What must happen on validation/conflict/network errors?

A. Preserve draft/prior usable state, map service validation to fields and summary, and keep correlation id visible (recommended)
B. Clear the form on every failure
C. Show generic toast only
X. Other (please specify)

[Answer]: A. Preserve state and map errors (Recommended)

## Q4. Accessibility target

Which accessibility bar applies?

A. WCAG 2.1 AA expectations for keyboard navigation, visible focus, semantic labels/tables, contrast, form errors, live updates, and responsive zoom (recommended)
B. Desktop mouse support only
C. Accessibility later
X. Other (please specify)

[Answer]: A. WCAG 2.1 AA-oriented MVP paths (Recommended)

## Q5. Event status behavior

How should event status failures affect detail pages?

A. Event status is non-blocking; record details render with status warning if unavailable (recommended)
B. Block record detail rendering
C. Hide all event status
X. Other (please specify)

[Answer]: A. Non-blocking status (Recommended)

## Ambiguity Analysis

- `business-rules.md` fixes BFF-only access, WCAG expectations, RHF/Zod, read-only behavior, event status labels, and mobile read-only default.
- `requirements.md` fixes frontend maintainability, accessibility, status/event visibility, and no downstream runtime screens.
- No follow-up questions are needed for U06.

