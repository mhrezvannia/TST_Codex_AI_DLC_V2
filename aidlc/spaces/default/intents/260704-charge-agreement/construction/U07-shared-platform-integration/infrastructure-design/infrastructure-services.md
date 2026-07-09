# Infrastructure Services - U07

## Source Alignment

Consumes `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.

## Services

`reference-data-service` supplies customer, charge code, currency, commodity, location, and trade-lane records. `identity-service` supplies auth/effective permissions when bypass is off.

## Boundaries

Charge Agreement stores stable IDs only.
