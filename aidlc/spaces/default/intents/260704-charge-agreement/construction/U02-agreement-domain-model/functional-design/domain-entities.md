# Domain Entities - U02 Agreement Domain Model

## Aggregate

| Entity | Attributes |
| --- | --- |
| `CustomerAgreement` | `id`, `agreementNumber`, `customerId`, `tradeLaneId`, `commodityId`, `validFrom`, `validTo`, `status`, `version`, `terms`, `activity` |

## Value Objects

| Value object | Attributes | Validation |
| --- | --- | --- |
| `AgreementId` | `value` | Non-blank stable ID. |
| `AgreementNumber` | `value` | Non-blank, normalized uppercase/trimming. |
| `ReferenceId` | `value` | Non-blank external stable ID. |
| `MoneyAmount` | `amount`, `currencyId` | Positive decimal and non-blank currency reference. |
| `ValidityWindow` | `from`, `to` | End is same or after start. |
| `ChargeTerm` | `id`, `chargeCodeId`, `basis`, `amount`, `validity`, `notes` | Required references, positive amount, term validity inside agreement. |
| `ActivityEntry` | `action`, `actor`, `occurredAt`, `reason` | Actor and timestamp required. |

## Enums

| Enum | Values |
| --- | --- |
| `AgreementStatus` | `DRAFT`, `APPROVED`, `SUSPENDED`, `EXPIRED` |
| `ChargeBasis` | `TEU`, `CONTAINER`, `SHIPMENT`, `BL` |

## Relationships

`CustomerAgreement` contains `ChargeTerm` and `ActivityEntry`; terms do not exist outside the aggregate in the domain model.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.