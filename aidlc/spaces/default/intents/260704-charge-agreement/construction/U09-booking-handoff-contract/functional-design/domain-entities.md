# Domain Entities - U09 Booking Handoff Contract

## Contract DTOs

| DTO | Fields |
| --- | --- |
| `ActiveAgreementLookupRequest` | `customerId`, `tradeLaneId`, `originLocationId`, `destinationLocationId`, `commodityId`, `effectiveDate` |
| `ActiveAgreementLookupResponse` | `matched`, `agreementId`, `agreementNumber`, `validFrom`, `validTo`, `terms`, `reason` |
| `ActiveChargeTerm` | `chargeCodeId`, `basis`, `currencyId`, `amount`, `validFrom`, `validTo`, `notes` |

## Ownership

Booking owns booking creation. Charge Agreement owns commercial-term resolution. The handoff contract is the boundary.

## Versioning

The first local contract can be unversioned under `/api/charge-agreements/active-lookup`; production hardening should introduce explicit compatibility rules before external consumers.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.