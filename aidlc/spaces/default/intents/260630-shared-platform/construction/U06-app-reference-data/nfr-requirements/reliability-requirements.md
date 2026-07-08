# Reliability Requirements - U06 Reference Data App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines error handling for identity-service, reference-data-service, validation, conflicts, event status, and expired sessions. `business-rules.md` requires prior usable state preservation, draft preservation, non-blocking event status, accessible status labels, and mobile read-only behavior. `requirements.md` fixes NFR-005, NFR-012, NFR-013, and frontend maintainability.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Session expired | Route guard sends user through auth flow and preserves safe return path. |
| Authorization unavailable | Protected actions fail closed; read screens show authorization unavailable where needed. |
| Service unavailable | UI shows retry/support state with correlation id. |
| Validation errors | Draft values are preserved and field/summary errors are shown. |
| Conflicts | Duplicate/stale state is distinguished and user remains in workflow. |
| Event status unavailable | Detail renders record data with non-blocking status warning. |

## Health and Smoke Requirements

- Smoke checks cover authenticated access, read-only/denied behavior, reference list/detail, one mutation where authorized, and event status display where available.
- Status labels must use text/accessibility names, not color alone.
- Dynamic validation/status/freshness warnings use appropriate live-region behavior.

## Recovery Requirements

- Prior usable result set remains visible on filter/search validation or network errors.
- Copyable event/correlation ids support support handoff.
- BFF must distinguish backend dependency failures from user validation errors.

## Non-Goals

- No offline editing support.
- No direct database fallback.
- No ownership of publisher recovery logic.

