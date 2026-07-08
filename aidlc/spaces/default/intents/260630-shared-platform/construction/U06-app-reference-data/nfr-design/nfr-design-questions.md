# NFR Design Questions - U06 Reference Data App

## Scope

This file records design questions resolved during NFR Design for `U06-app-reference-data`.

## Resolved Questions

### Q1. How should the browser access reference data?

Browser-visible code calls only `apps/reference-data` BFF route handlers. BFF handlers validate request shape, propagate correlation ids, resolve permissions through `identity-service` or approved session claims, and call `reference-data-service` provider/admin APIs.

### Q2. How does the UI support U03 read performance?

List and detail views use paginated, filterable, stable-sorted API calls with default active-only filters. Search/filter/page changes preserve prior usable state during refresh and do not load complete reference universes into the browser.

### Q3. How are write permissions represented?

Users with read but not write permission receive read-only list/detail experiences. Mutating controls are hidden or disabled with explanation, but backend/BFF authorization remains authoritative. Protected mutations fail closed when authorization data is unavailable.

### Q4. How should event status affect record detail?

Event status and history load separately from record detail. Failure to load publication status shows a non-blocking warning and does not prevent the user from reading canonical record data.

### Q5. How are form errors and conflicts handled?

React Hook Form and Zod catch client shape issues before BFF submit. Service validation, duplicate business keys, stale versions, relationship errors, authorization denial, and dependency failures map to field errors, summaries, or denied states while preserving draft values.

## Open Questions

No blocking questions remain for this stage. Full mobile editing, downstream module screens, and final U07 developer/contract view content remain outside U06 NFR Design.

## Source Trace

This decision set traces to `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.
