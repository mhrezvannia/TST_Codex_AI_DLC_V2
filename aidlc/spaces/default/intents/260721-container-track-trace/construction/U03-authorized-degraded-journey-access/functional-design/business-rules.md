# Business Rules - U03 Authorized Degraded Journey Access

## Source Alignment

These rules specialize U03 in `unit-of-work.md` and
`unit-of-work-story-map.md`, implement `requirements.md`, and retain the
`components.md`, `component-methods.md`, and `services.md` contracts. They do
not change U01 journey ownership or U02 lifecycle/idempotency rules.

## Permission Rules

- List, detail, and booking-reference lookup require exact resource/action
  `container-movement:read` / permission `perm-container-movement-read`.
- Capture requires exact resource/action
  `container-movement:capture-movement` / permission
  `perm-container-movement-capture`; read permission never implies capture.
- `EQUIPMENT_CONTROL` is assigned read and capture; `CUSTOMER_SERVICE` is
  assigned read only through the authoritative Identity catalog/evaluator.
- Authenticated subject from verified request/session context is authority.
  Actor/body/query fields and hidden/disabled buttons are never authority.
- Authorization is evaluated inside each application use case on every fresh
  request. No positive or negative authorization cache is introduced.
- A GET first calls the existing singular authorization port for read. Only
  after read ALLOW it calls the same port again for a fresh capture capability.
  The second result is display-only: DENY or UNAVAILABLE disables the control
  and emits safe telemetry but no denial-audit row. Every POST independently
  calls the singular port for capture again.

## Failure and Evidence Rules

| Condition | Result | Required evidence | Forbidden behavior |
| --- | --- | --- | --- |
| valid subject lacks permission | 403 `CMM_AUTHORIZATION_DENIED` | denial audit: subject, resource, action, safe reason, correlation, time | protected read or capture evaluation |
| Identity unavailable | 503 `IDENTITY_DEPENDENCY_UNAVAILABLE` | safe correlated log/metric and Retry guidance | cached authorization, new data disclosure, capture effects |
| invalid/inactive reference after capture ALLOW | 400 field validation | field/correlation response | idempotency claim or business rows |
| Reference Data unavailable after read ALLOW | 200 `freshness=last-known` | dependency reason, outage check time, truthful journey-data update time | capture enabled or false verification label |
| Reference Data unavailable after capture ALLOW | 503 `REFERENCE_DATA_UNAVAILABLE` | safe correlated log/metric and Retry guidance | attempt/request/rejection/domain/outbox rows |

Denial audit is security evidence and is not a movement rejection. Dependency
outage evidence does not create a false business denial, request disposition,
or accepted/rejected movement. All error bodies redact tokens, provider URLs,
raw payloads, and stack traces.

Exact write sets are binding: an enforced read/capture DENY writes exactly one
authorization-denial audit and no attempt, request disposition, rejection,
movement/history, journey snapshot/version/lifecycle, outbox, or Booking row.
Identity/Reference Data outage and passive GET capability DENY/UNAVAILABLE write
no CMM database row at all; they emit correlated log/metric evidence only.

## Response Contract Rules

- Authorized GET 200 requires `kind=ready`, protected `data` with
  `dataUpdatedAt=ContainerJourney.updatedAt`, `correlationId`, and freshness with
  `state`, `checkedAt`, `captureEnabled`, optional dependency/reason, and a
  required disabled reason when capture is off.
- 403 requires `kind=denied`, code `CMM_AUTHORIZATION_DENIED`, correlation,
  `retryable=false`, guidance, and no protected data.
- Identity 503 requires `kind=dependency-unavailable`, code
  `IDENTITY_DEPENDENCY_UNAVAILABLE`, correlation, `retryable=true`, Retry
  guidance, and no protected data.
- Capture Reference Data 503 uses the same error shape with code
  `REFERENCE_DATA_UNAVAILABLE`; an authorized degraded GET is instead 200 with
  `state=last-known` and `captureEnabled=false`.
- Missing/invalid authentication fails before repository access. Only a missing
  protected resource after read ALLOW is 404.

## Freshness Rules

- `fresh` means the current request was authorized and Reference Data confirmed
  the persisted route/equipment/location facts during that request.
- `last-known` is permitted only after current Identity ALLOW and only for
  CMM-owned facts already persisted with the journey.
- `last-known` never means cached authorization, provisional validation, or
  permission to capture.
- `dataUpdatedAt` is the existing persisted `ContainerJourney.updatedAt` and is
  labelled only as when journey data last changed. It is never presented as a
  Reference Data verification time. `checkedAt` is the current dependency check.
- CMM database failure remains a read failure; Kafka or Booking delay affects
  publication/projection labels, not authorization or reference freshness.

## UI and Recovery Rules

- A denied list/detail exposes no journey facts and offers safe return/request-
  access guidance. A denied capture may preserve the already-authorized read.
- Identity outage never refreshes protected content; previously rendered data
  may remain visibly stale, capture-disabled, and inert.
- Reference Data outage after read authorization shows `Last-known`, the
  affected dependency, capture-disabled reason, and Retry.
- Retry performs fresh Identity evaluation followed by fresh reference checks;
  it never resubmits a movement automatically.
- Loading, empty/not-found, retryable error, denied, and degraded states use
  headings/text/icons/live-region or focus semantics and never rely on color.
- U03 composes existing shared primitives only; it changes neither the shared
  shell nor `packages/ui`.
