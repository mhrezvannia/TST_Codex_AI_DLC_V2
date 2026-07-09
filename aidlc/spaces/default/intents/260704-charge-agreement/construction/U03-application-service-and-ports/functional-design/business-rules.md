# Business Rules - U03 Application Service and Ports

## Application Policies

| ID | Rule | Source |
| --- | --- | --- |
| U03-R1 | Every mutating use case requires actor and correlation ID. | `requirements.md` NFR-2, NFR-5 |
| U03-R2 | Reference IDs are validated before saving an agreement when a validator is available. | `requirements.md` FR-5.1 |
| U03-R3 | Stale expected version fails with conflict semantics. | `component-methods.md` |
| U03-R4 | Active lookup returns no-match as a successful business result, not an exception. | `requirements.md` FR-4.3 |
| U03-R5 | Local auth bypass is allowed only through the authorization port and only for local development. | `team-practices.md` |

## Port Contracts

| Port | Required behavior |
| --- | --- |
| `AgreementRepository` | Save, detail lookup, search, active candidate lookup. |
| `ReferenceDataPort` | Validate existence of customer, charge code, currency, lane, commodity, and locations. |
| `AuthorizationPort` | Check read/manage/approve/status actions. |
| `IdGenerator` | Generate agreement and term IDs. |
| `Clock` | Provide deterministic timestamps for tests. |
| `AgreementEventPublisher` | Accept changed/approved facts; may no-op locally. |

## Error Rules

Map domain validation to application validation errors, missing records to not-found, stale version to conflict, auth failures to forbidden, and upstream reference failures to unavailable.

## Upstream Traceability

This artifact traces to the functional-design upstream inputs: unit-of-work, unit-of-work-story-map, requirements, components, component-methods, and services. The unit-specific design decisions above should be read against those approved inception artifacts.