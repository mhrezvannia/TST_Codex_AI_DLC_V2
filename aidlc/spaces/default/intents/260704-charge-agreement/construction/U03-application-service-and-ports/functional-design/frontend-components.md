# Frontend Components - U03 Application Service and Ports

## Applicability

U03 is backend application-service work. It does not create frontend components.

## UI Contract Impact

The frontend later consumes use-case semantics through BFF calls:

| Use case | Future UI interaction |
| --- | --- |
| Search | Filters and agreement table. |
| Create/update | Editor save flow with validation summary. |
| Approve/suspend/expire | Detail actions. |
| Active lookup | Booking lookup preview panel. |

## Handoff

U05 defines the REST DTOs and U06 maps them into UI view models.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.