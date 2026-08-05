# Services — W2-02 Design-System Closure

## Design Basis

The service design is intentionally preservative. `requirements.md` and `stories.md` require a real integrated journey, while brownfield `architecture.md`, `component-inventory.md`, and `team-practices.md` prohibit a new service/data/deployment topology. W2-02 adds no AWS service, database, queue, public API, or production environment.

## Existing Runtime Services

| Service/runtime | Responsibility | Communication | Data ownership | Closure change |
|---|---|---|---|---|
| nginx edge | Canonical public routing to authenticated shell and internal apps | HTTP routing | None | Preserve route ownership; verify canonical `/booking` |
| Authenticated shell | Session-aware shell and canonical Booking presentation | Server/client rendering; HTTP to Booking BFF | No domain store | Migrate presentation to `@erp/ui`; one shell |
| Booking BFF (`apps/booking`) | Protected subject/correlation/idempotency/limit/timeout adapter | Synchronous HTTP to Booking service and support APIs | No domain store | Preserve endpoints; retire/redirect standalone pages |
| Identity/Keycloak seam | Authentication, session, subject/role context | Existing auth/session protocols | Existing identity stores | Preserve |
| Booking service | Booking commands, validation, pricing integration, lifecycle, outbox | Synchronous API; async event publication | Booking-owned database | Preserve |
| Reference Data service | Lookup and validation source | Synchronous service call | Reference-owned database | Preserve |
| Charge Agreement/pricing service | Agreement eligibility and price computation | Synchronous service call | Agreement-owned database | Preserve |
| Kafka + Schema Registry/platform messaging | Booking lifecycle event transport | Asynchronous events | Event log/schema ownership as existing | Preserve |
| Container Movement service | Confirmed-Booking event consumer | Asynchronous consumption | Movement-owned database | Preserve |

## Orchestration and Choreography

### User-facing synchronous orchestration

```text
Browser
  -> nginx canonical /booking
  -> apps/shell authenticated route
  -> apps/shell same-origin /api/booking/*
  -> apps/booking BFF
  -> booking-service
      -> reference-data-service (validation/lookup)
      -> charge-agreement-service (pricing)
  <- normalized response through the same chain
```

The shell orchestrates presentation state only. The BFF preserves transport/security protections. Booking service remains the business workflow authority.

### Existing asynchronous choreography

```text
booking-service transaction
  -> Booking outbox
  -> Kafka/schema-registry publication
  -> container-movement consumer
  -> movement-owned persistence
```

W2-02 observes this seam where useful but does not make UI completion synchronous on downstream event consumption, alter event schemas, or write cross-service data.

## Communication Contracts

- **Shell → BFF:** same-origin HTTP route handlers; cookie/session and correlation forwarded; GET/POST only as existing.
- **BFF → Booking service:** authenticated subject metadata, correlation ID, idempotency for commands, request-size and timeout enforcement, safe error mapping.
- **Booking → support services:** existing synchronous adapters and typed service responses; failure appears to UI through existing normalized behavior.
- **Booking → Kafka:** existing outbox/event contract and at-least-once/deduplication posture.
- **Acceptance harness → system:** browser through canonical nginx/shell route; controlled interception only for hard-to-produce presentation states, not happy-path business completion.

## Lifecycle and Scaling Characteristics

- No new availability, throughput, concurrency, or scaling target is introduced.
- Existing Next.js apps and Java services retain their Compose lifecycle and health behavior.
- Existing BFF timeouts, request limits, and idempotency protections remain the governing user-journey constraints.
- The acceptance harness is local and ephemeral; evidence is durable in the repository artifact path.
- `linercore-wave-a` is the only test project. `linercore-shared-platform` remains outside the acceptance lifecycle.
- Production deployment, AWS mapping, multi-AZ, autoscaling, and cost design are out of scope because the intent makes no infrastructure change.

## Failure and Degradation Mapping

| Dependency failure | Service behavior preserved | Required presentation outcome |
|---|---|---|
| Identity/session denied | Existing auth/authorization response | Explicit denied state in shared shell |
| Booking list unavailable | BFF safe error/timeout | Error/retry; filters retained |
| Reference lookup unavailable | Existing lookup error | Scoped degraded/error lookup; form values retained |
| Validation rejected | Existing domain validation payload | Summary + field errors; values retained |
| Pricing unavailable | Existing pricing error | Actionable degraded/error status; retry |
| Confirm transient failure | Existing idempotent command protection | No duplicate confirm; preserved record context |
| Downstream movement delayed | Existing async semantics | Booking confirmation stays truthful; secondary evidence may be degraded |

## Service-Level Non-Goals

- No direct shell-to-service calls.
- No shared UI database or cross-service joins.
- No new event-driven UI workflow.
- No change to service ownership, persistence, or event schemas.
- No new AWS service, IaC stack, cloud credential, production pipeline, or rollback claim.
