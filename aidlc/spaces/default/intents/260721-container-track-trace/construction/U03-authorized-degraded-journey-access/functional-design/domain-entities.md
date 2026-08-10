# Domain Entities - U03 Authorized Degraded Journey Access

## Source Alignment

This model specializes U03 from `unit-of-work.md` and
`unit-of-work-story-map.md`, implements `requirements.md`, and follows the
boundaries in `components.md`, `component-methods.md`, and `services.md`.
Authorization and freshness are request/view concerns; they do not become new
`ContainerJourney` lifecycle states.

## Ubiquitous Language

Authorization Decision is a fresh Identity result for one subject/resource/
action/correlation. Denial Audit is immutable security evidence. Reference
Freshness states whether persisted business facts were verified during the
current authorized request. Last-known is readable persisted data after fresh
read authorization but failed reference verification; it is never cached
authority. Dependency Failure is retryable infrastructure evidence, not a
movement rejection.

## Entities and Value Objects

- `AuthenticatedSubject`: verified subject/service identity; never populated
  from body/query actor input.
- `PermissionKey`: exact resource/action and catalog permission identity.
- `AuthorizationDecision`: ephemeral ALLOW/DENY/UNAVAILABLE result tied to
  subject, permission, correlation, and evaluated time.
- `CaptureCapabilityHint`: ephemeral ALLOW/DENY/UNAVAILABLE presentation result
  returned only after read ALLOW; it is never command authority.
- `AuthorizationDenialAudit`: immutable persisted security evidence for a real
  DENY, containing actor/resource/action/safe reason/correlation/time and an
  optional protected target identifier.
- `ReferenceFreshness`: view value object carrying state, dependency, reason,
  `checkedAt`, and `captureEnabled`.
- `DependencyFailure`: safe error value for Identity or Reference Data outage,
  carrying machine code, retryability, correlation, and no provider secret.
- `ContainerJourney`: unchanged aggregate from U01/U02; authorization outage or
  degraded read never changes its lifecycle, version, ledger, or outbox.

## Field-Level Model

| Field | Type | Allowed values / invariant |
| --- | --- | --- |
| `permission.resource` | typed string | `container-movement` |
| `permission.action` | enum | `read`, `capture-movement` |
| `permission.id` | typed string | `perm-container-movement-read`, `perm-container-movement-capture` |
| `authorization.outcome` | enum | ALLOW, DENY, UNAVAILABLE |
| `freshness.state` | enum | `fresh`, `last-known` |
| `freshness.dependency` | optional enum | absent when fresh; `REFERENCE_DATA` when last-known |
| `freshness.reasonCode` | optional string | safe dependency reason, never raw body |
| `freshness.checkedAt` | `Instant` | current dependency-check time |
| `dataUpdatedAt` | `Instant` | maps existing `ContainerJourney.updatedAt`; journey change time, not reference verification |
| `captureEnabled` | boolean | display hint; true only with fresh capture capability and references |
| `captureDisabledReason` | optional enum | INSUFFICIENT_PERMISSION, CAPABILITY_UNAVAILABLE, REFERENCE_DATA_UNAVAILABLE |
| `correlationId` | value object | shared across response, audit/log, and proof |

## Invariants and Relationships

- Authorization precedes protected repository access and Reference Data calls.
- GET calls the existing singular authorization port in order: read first, then
  capture capability only after read ALLOW. POST independently calls capture.
- Missing/invalid authentication precedes authorization; only an absent journey
  after read ALLOW can be 404.
- An enforced read/capture DENY may append only `AuthorizationDenialAudit`; it
  cannot append movement attempt/request/rejection or mutate the journey/outbox/
  Booking projection.
- Passive GET capture-capability DENY/UNAVAILABLE is not an attempted command;
  it writes no denial audit and cannot authorize a later POST.
- UNAVAILABLE is not DENY and cannot be converted to ALLOW from cache.
- `last-known` requires current read ALLOW and existing persisted facts.
- `last-known` implies `captureEnabled=false` even when the subject normally has
  capture permission.
- Capture Reference Data outage occurs before idempotency claim and writes no
  CMM database row. Identity outage likewise writes no CMM database row; both
  use correlated logs/metrics rather than a false denial/rejection.
- Restoration creates no domain event. A later request independently evaluates
  authority/freshness and may return `fresh`.

## State Model

```text
Fresh request
  -> Identity DENY        -> 403 + denial audit, no protected data/effect
  -> Identity UNAVAILABLE -> 503 + retry evidence, no protected data/effect
  -> Identity ALLOW
       -> Reference fresh       -> fresh read or normal capture path
       -> Reference unavailable -> last-known read / 503 capture, capture off
```

This request-state model is deliberately outside the semantic journey states
Allocated, Gated-out, In-transit, Discharged, and Returned-empty.
