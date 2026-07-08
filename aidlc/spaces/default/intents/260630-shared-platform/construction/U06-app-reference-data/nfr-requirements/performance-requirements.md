# Performance Requirements - U06 Reference Data App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines workspace navigation, list/search/detail, create/update, deactivate/reactivate, TradeLane, event status/history, and error handling workflows. `business-rules.md` fixes stable sorting, pagination, prior-state preservation, RHF/Zod validation, non-blocking event status, and BFF-only access. `requirements.md` fixes NFR-001, NFR-004, NFR-013, NFR-015, and frontend stack constraints.

## Target Requirements

| Requirement | U06 obligation |
|---|---|
| Reference list/detail responsiveness | UI/BFF must support U03 common read target p95 <= 300 ms by using paginated/filterable API calls. |
| Interaction responsiveness | Search/filter/page changes preserve prior usable state during refresh. |
| Form validation | RHF/Zod client validation catches shape errors before BFF submit. |
| Event status | Status/history loads are non-blocking and do not block record detail rendering. |
| Frontend checks | TypeScript/lint/test/accessibility-relevant checks run where configured. |

## Measurement Requirements

- Track list, detail, search/filter, form submit, deactivate/reactivate, and event-status BFF durations.
- Measure identity-service authorization latency separately from reference-data-service API latency.
- Track frontend error state frequency and validation conflict frequency.
- Preserve correlation id across BFF logs and user-visible support states.

## Non-Goals

- U06 does not own backend query optimization.
- U06 does not provide full mobile create/edit parity.
- U06 does not implement event publisher performance.

