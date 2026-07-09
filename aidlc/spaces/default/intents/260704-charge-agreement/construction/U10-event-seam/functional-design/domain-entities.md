# Domain Entities - U10 Event Seam

## Published Facts

| Fact | Fields |
| --- | --- |
| `AgreementChangedFact` | `eventId`, `agreementId`, `agreementNumber`, `status`, `changedAt`, `changedBy`, `correlationId`, `changeType` |
| `AgreementApprovedFact` | `eventId`, `agreementId`, `agreementNumber`, `approvedAt`, `approvedBy`, `validFrom`, `validTo`, `correlationId` |

## Ports

| Port | Method |
| --- | --- |
| `AgreementEventPublisher` | `publishChanged(fact)` |
| `AgreementEventPublisher` | `publishApproved(fact)` |

## Relationships

Facts are generated in application-service after successful aggregate persistence. Messaging adapters consume facts, not aggregates.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.