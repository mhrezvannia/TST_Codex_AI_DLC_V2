# Performance Requirements - U07

## Source Alignment

Consumes `business-logic-model.md`, `business-rules.md`, `requirements.md`, and `technology-stack.md`.

## Targets

| Target | Requirement |
| --- | --- |
| Reference option load | Customer, charge, currency, location, commodity, and lane selector data loads within 500 ms p95 locally for up to 500 options per set. |
| Cached selector reopen | Reopening an unchanged selector uses cached page state within 100 ms p95. |
| Degraded reference service | Reference outage is surfaced to the affected selector within 250 ms after failed response while preserving draft agreement input. |
| Workbench isolation | A slow reference set cannot block unrelated fields or status actions. |

## Validation

UI tests cover fallback/error state. Smoke checks record reference service availability.
