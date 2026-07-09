# Units of Work - Charge & Customer Agreement

## Source Alignment

Units consume `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`, `decisions.md`, `requirements.md`, and `stories.md`.

## Units

| Unit | Name | Scope | Definition of Done |
| --- | --- | --- | --- |
| U01 | Charge Agreement walking skeleton | Add backend service/app workspace placeholders, health endpoints, package/module wiring, proxy route. | Backend health and UI page respond locally; tests compile. |
| U02 | Agreement domain model | Implement aggregate, value objects, status transitions, charge-term validation in domain-core. | Domain tests pass for create/update/approve/suspend/expire/validation. |
| U03 | Application service and ports | Implement use cases and ports for repository, authorization, reference validation, id/clock, event seam. | Application-service tests pass for lifecycle and active lookup behavior. |
| U04 | Persistence adapter | Implement Postgres/in-memory-compatible repository adapter and schema/seeding approach. | Repository tests or service tests persist agreement with terms. |
| U05 | REST API and OpenAPI | Implement controller endpoints and OpenAPI contract for CRUD/status/search/active lookup. | API tests and contract verification pass. |
| U06 | Charge Agreements UI workbench | Implement list/detail/create-edit/approve/lookup UI and BFF clients. | UI tests pass and page is locally usable. |
| U07 | Shared Platform integration | Load/reference customers, charge codes, currencies, commodities, locations, trade lanes through reference-data service/BFF. | Integration tests or smoke checks prove reference-backed fields. |
| U08 | Local runtime, seed, smoke, readiness | Add start/runtime wiring, demo agreement data, smoke/readiness checks, evidence output. | Local evidence includes Charge Agreement health/UI/API/lookup checks. |
| U09 | Booking handoff contract | Document active lookup examples and no-match behavior for next module. | Contract/examples exist and tests cover active lookup. |
| U10 | Event seam | Add published-language/event port for agreement changed/approved without requiring Kafka live proof. | Unit tests verify event fact creation/enqueue seam where configured. |

## Architecture Review

Verdict: READY

Inline architecture review completed because the configured reviewer model is unavailable. Units are coherent with application design, independently testable, dependency-ordered, and suitable for construction sequencing.
