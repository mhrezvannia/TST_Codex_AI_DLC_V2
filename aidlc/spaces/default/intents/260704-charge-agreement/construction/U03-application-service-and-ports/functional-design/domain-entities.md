# Domain Entities - U03 Application Service and Ports

## Commands

| Command | Fields |
| --- | --- |
| `CreateAgreementCommand` | `agreementNumber`, `customerId`, `tradeLaneId`, `commodityId`, `validFrom`, `validTo`, `terms`, `actor`, `correlationId` |
| `UpdateAgreementCommand` | Header fields, terms, `expectedVersion`, `actor`, `correlationId` |
| `StatusCommand` | `actor`, `reason`, `correlationId` |
| `AgreementSearchQuery` | `customerId`, `status`, `tradeLaneId`, `validOn`, `page`, `size` |
| `ActiveAgreementQuery` | `customerId`, `tradeLaneId`, `originLocationId`, `destinationLocationId`, `commodityId`, `effectiveDate` |

## Results

| Result | Fields |
| --- | --- |
| `AgreementDetail` | Header, status, version, terms, activity. |
| `AgreementSummary` | ID, number, customer, status, validity, lane. |
| `AgreementPage` | Items, page, size, total. |
| `ActiveAgreementResult` | `matched`, agreement summary, effective date, terms, no-match reason. |

## Relationships

Application commands convert to domain value objects before invoking `CustomerAgreement`. Application results are DTO-like records and do not leak persistence entities.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.