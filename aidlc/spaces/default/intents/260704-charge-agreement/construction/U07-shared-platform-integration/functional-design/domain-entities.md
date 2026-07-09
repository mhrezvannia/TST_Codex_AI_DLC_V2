# Domain Entities - U07 Shared Platform Integration

## Reference Types

| Type | Fields |
| --- | --- |
| `ReferenceOption` | `id`, `code`, `name`, `set`, `active` |
| `ReferenceValidationRequest` | `set`, `id`, `required` |
| `ReferenceValidationResult` | `id`, `exists`, `label`, `failureReason` |

## Agreement References

| Agreement field | Reference set |
| --- | --- |
| `customerId` | Customer/party customer |
| `tradeLaneId` | Trade lane |
| `commodityId` | Commodity |
| `chargeCodeId` | Charge code |
| `currencyId` | Currency |
| `originLocationId`, `destinationLocationId` | Location |

## Ownership

Reference data remains owned by `reference-data-service`; Charge Agreement owns only the agreement's choice of IDs.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.