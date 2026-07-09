# RAID Log - Charge & Customer Agreement

## Risks

| ID | Risk | Likelihood | Impact | Owner | Mitigation |
| --- | --- | --- | --- | --- | --- |
| R-001 | Docker/Compose remains unhealthy and blocks full-stack parity. | High | Medium | Platform | Continue host-runtime build; recover Docker separately before Operation readiness. |
| R-002 | Scope expands into full commercial RMS. | Medium | High | Product | Enforce first-slice boundary: agreements, charge terms, approval, active lookup. |
| R-003 | Booking later needs lookup dimensions not captured now. | Medium | Medium | Architecture | Model lookup around customer, trade lane/location, commodity, and effective date; keep extension points. |
| R-004 | Agreement approval audit is added too late. | Low | Medium | Compliance | Include status metadata from initial domain model. |

## Assumptions

| ID | Assumption | Validation |
| --- | --- |
| A-001 | Shared Platform reference-data service provides stable IDs for charge codes, customers, currencies, commodities, locations, and trade lanes. | Validate against seed data and service API during application design. |
| A-002 | Local auth bypass remains acceptable for development while Keycloak is not running. | Keep bypass local-only and document security posture. |
| A-003 | A separate backend service is acceptable for the Charge Agreement bounded context. | Confirm in application design; fallback is a commercial service module. |
| A-004 | First users are internal commercial/pricing users. | Already aligned with intent-capture answers; revisit only if user changes scope. |

## Issues

| ID | Issue | Status | Response |
| --- | --- | --- | --- |
| I-001 | Docker commands time out in current local environment. | Open | Do not block implementation; track separately for Compose readiness. |
| I-002 | Current app has only Shared Platform UIs, not Charge Agreement UI. | Open | Add `apps/charge-agreements` or equivalent. |
| I-003 | Current Maven root only includes identity and reference-data services. | Open | Add new service module or approved alternative during construction. |

## Dependencies

| ID | Dependency | Needed for | Status |
| --- | --- | --- | --- |
| DEP-001 | Identity service | Authorization, local user context | Running locally on 8082. |
| DEP-002 | Reference Data service | Customers, charges, currencies, locations, commodities, trade lanes | Running locally on 8083. |
| DEP-003 | Postgres | Agreement persistence | Running locally on 5432. |
| DEP-004 | Local reverse proxy | Unified local app routing | Running locally on 8088. |
| DEP-005 | Booking module | Downstream consumer of active agreement lookup | Future module. |

## Decisions Needed Later

| ID | Decision | Stage |
| --- | --- | --- |
| DEC-001 | Exact service boundary: `charge-agreement-service` vs broader `commercial-service`. | Application Design |
| DEC-002 | Port allocation and proxy route for the new UI/API. | Infrastructure Design |
| DEC-003 | Whether to publish agreement events immediately or stub event publication until Kafka/Compose is healthy. | Functional/NFR Design |
