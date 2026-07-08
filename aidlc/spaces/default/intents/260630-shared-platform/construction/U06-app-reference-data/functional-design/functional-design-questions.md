# Functional Design Questions - U06 Reference Data Frontend App and BFF

> Stage: Functional Design
> Unit: `U06-app-reference-data`
> Source context: `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`.

## Q1. Reference workspace pattern

How should `apps/reference-data` organize the nine reference-set workflows?

A. Use one workspace shell with reference-set navigation, shared list/detail/create/edit patterns, and per-set metadata for labels, fields, filters, and relationship rules (recommended)
B. Build nine unrelated screen flows
C. Use a generic free-form table editor for every reference set
X. Other (please specify)

[Answer]: A. Workspace shell with per-set metadata (Recommended)

## Q2. Backend access pattern

How should the frontend call platform services?

A. Browser calls only Next.js BFF route handlers; BFF handlers call `reference-data-service` and `identity-service` using approved service contracts and HttpOnly session context (recommended)
B. Browser calls backend service APIs directly
C. Frontend reads the reference-data database directly for lookup screens
X. Other (please specify)

[Answer]: A. BFF route handlers only (Recommended)

## Q3. Form and validation model

How should create/edit forms handle validation?

A. React Hook Form plus Zod for client-side shape validation, with service validation errors mapped into field errors and a validation summary without clearing draft data (recommended)
B. Server-only validation after submit
C. Inline spreadsheet editing with minimal validation messages
X. Other (please specify)

[Answer]: A. RHF/Zod plus service error mapping (Recommended)

## Q4. Authorization and read-only behavior

How should the app behave when the user lacks write permission?

A. Render allowed read workflows and replace mutating actions with read-only/access-denied states that explain the missing permission and preserve correlation id context (recommended)
B. Hide the entire app after sign-in
C. Show write controls and rely on backend errors after submit
X. Other (please specify)

[Answer]: A. Explicit read-only/access-denied state (Recommended)

## Q5. Event and publication status

How should record history and event status appear?

A. Show recent changes, operation, actor, timestamp, event id, correlation id, and pending/published/failed/retrying status as non-blocking record detail sections (recommended)
B. Omit event status from the UI until operations stages
C. Show only raw Kafka payloads
X. Other (please specify)

[Answer]: A. Record detail status/history sections (Recommended)

## Q6. Responsive and accessibility posture

What UX posture should the functional design use?

A. Desktop-first admin workspace, tablet-adaptive layout, mobile read-only lookup by default, and WCAG 2.1 AA behavior for navigation, tables, forms, dialogs, errors, and live status (recommended)
B. Desktop-only MVP
C. Full mobile editing parity for all reference sets
X. Other (please specify)

[Answer]: A. Desktop/tablet admin plus mobile read-only (Recommended)
