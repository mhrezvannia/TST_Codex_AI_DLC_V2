# Scalability Requirements - U06 Reference Data App

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines navigation across nine reference sets, list/search/detail flows, form workflows, event status/history, and mobile read-only default. `business-rules.md` requires pagination, stable sorting, active/inactive filtering, prior state preservation, and BFF/shared package consumption. `requirements.md` fixes frontend maintainability and canonical provider API integration.

## Scaling Model

U06 scales as a BFF-governed frontend workspace over provider/admin APIs. It does not load complete reference universes into the browser or implement local replicas.

## Structural Requirements

| Area | Requirement |
|---|---|
| Navigation | Covers all nine reference sets without creating separate apps per set. |
| List views | Paginated, filterable, stable-sorted, active-default. |
| Detail views | Load relationship labels and audit/status data through APIs, not database joins. |
| Forms | Per-set metadata and RHF/Zod validation avoid a generic ungoverned editor. |
| Event status | Loaded separately and non-blocking. |
| Mobile | Read-only lookup default; full mobile edit is out of MVP. |

## Growth Assumptions

- More records and inactive history require pagination and filters.
- Reference sets may gain optional fields later; U06 must preserve service-driven validation.
- Contract/developer views are supplied by U07 and remain display-only in U06.

## Non-Goals

- No browser-side full dataset cache.
- No generic metadata editor that bypasses aggregate rules.
- No downstream runtime screens.

