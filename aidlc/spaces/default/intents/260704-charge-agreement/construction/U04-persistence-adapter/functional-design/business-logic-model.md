# Business Logic Model - U04 Persistence Adapter

## Scope

U04 implements `AgreementRepository` for Postgres-compatible storage and test-friendly local behavior. It consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`.

## Persistence Flow

1. Map `CustomerAgreement` aggregate to agreement header, terms, and activity records.
2. Save within a transaction.
3. Replace terms atomically when the aggregate terms collection changes.
4. Append or replace activity entries in aggregate order.
5. Rehydrate aggregate for detail and active lookup candidate queries.

## Query Flow

| Query | Filters |
| --- | --- |
| Detail | Agreement ID. |
| Search | Customer, status, trade lane, valid-on date, page, and size. |
| Active candidates | Customer, Approved status, effective date, lane/location, commodity. |

## Data Transformation

Persist reference fields as stable string IDs from Shared Platform. Do not duplicate customer, charge code, currency, commodity, location, or trade-lane records.

## Review

Verdict: READY

Inline architecture review completed because the configured reviewer subagent model is unavailable. U04 keeps persistence at the adapter boundary and supports search, lifecycle evidence, and active lookup candidates.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.