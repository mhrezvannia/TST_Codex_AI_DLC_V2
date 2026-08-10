# Business Rules - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

Rules derive from U01 in `unit-of-work.md`, story allocation in
`unit-of-work-story-map.md`, FR/AC definitions in `requirements.md`, and the
approved boundaries/contracts in `components.md`, `component-methods.md`, and
`services.md`.

## Intake Rules

| ID | Rule | Failure/duplicate outcome | Side effects |
| --- | --- | --- | --- |
| U01-R01 | Required envelope fields/type/version, exactly one `routing[]` leg, and exactly one `equipment[]` assignment with `quantity=1` and non-null ISO-6346 `equipmentId` are required. | Stable invalid-intake reason | Receipt/audit only |
| U01-R02 | Equipment reference is canonical ISO 6346 and POL/POD are active UN/LOCODE references. | Invalid/inactive reference | Receipt/audit only |
| U01-R03 | Completed event replay returns its stored disposition before Reference Data calls. When absent, one transaction inserts unique receipt plus effects; a concurrent loser loads the winner after unique conflict. | Stored OPENED/RECONCILED/STALE/PERMANENT_FAILED truth | No durable pre-claim or orphan IN_PROGRESS row |
| U01-R04 | Stable `(bookingId, equipmentId)` owns one journey; revision is monotonic state, not identity. | Equal idempotent, lower STALE, compatible higher reconciled, incompatible assignment failed | Atomic receipt plus compatible changes only |
| U01-R05 | New journey starts Allocated with expected LOAD@POL then DISC@POD and next actual GTOT. | Invariant violation fails transaction | No partial state |
| U01-R06 | Journey creation emits exactly one seq-0 PLN LOAD status in the same transaction. | Transaction rollback | No state/outbox split |

## Capture and Lifecycle Rules

| ID | Rule | Result |
| --- | --- | --- |
| U01-R07 | Fresh application authorization requires `container-movement:capture-movement`; read permission alone is insufficient. | 403 `CMM_AUTHORIZATION_DENIED`, denial audit, no mutation |
| U01-R07A | Every list/detail use case requires fresh application authorization for `container-movement:read`. | 403/denial audit; no read-model disclosure |
| U01-R08 | U01 accepts only ACT GTOT/LADEN at active canonical location/equipment with valid occurrence/source/correlation/idempotency. | Field validation result; entered UI values preserved |
| U01-R08A | `occurredDateTime` must be less than or equal to injected application `Clock.instant()`; no unspecified future-skew tolerance applies. | Field-linked future-time validation; no DB/outbox effect |
| U01-R09 | Allocated + GTOT transitions exactly once to Gated-out and movement sequence 1. | `CaptureAccepted` and one status outbox |
| U01-R10 | Gated-out + DISC is illegal because LOAD is required next. | HTTP 409 `OUT_OF_SEQUENCE_MOVEMENT` with current state/LOAD/correlation |
| U01-R11 | Expected manual rejection appends attempt/request/rejection/audit but never snapshot/history/outbox/Booking mutation. | Rejection-only commit |
| U01-R12 | Unknown infrastructure failure rolls back business writes and maps at the boundary; it is not a domain rejection. | Retryable/500 boundary response and structured correlation log |

## Transaction and Concurrency Rules

- Intake claim/disposition, journey/plan, receipt, audit, and seq-0 outbox form one transaction; transient failure remains retryable.
- After external authorization/reference checks, accepted capture request claim/disposition/attempt/movement/versioned snapshot/audit/seq-1 outbox form one local transaction with no intermediate commit.
- Rejected capture attempt/request/rejection/audit form one transaction independent of accepted state.
- Unique constraints enforce event ID, reconciliation key, accepted occurrence, request key, movement sequence, and outbox event identity.
- Concurrent claims resolve to one durable disposition; losers observe the committed disposition and append their own attempt evidence without re-evaluating the aggregate.
- Outbox completion requires matching worker, claim token, and version; stale workers cannot publish-state transition another claim.

## Ordering and Projection Rules

- CMM accepted movement sequences are positive; seq-0 is planned/legacy compatible.
- Booking records every consumed event disposition durably.
- Higher positive sequence applies; equal identity is duplicate; lower positive is stale.
- Legacy seq-0 uses the existing occurrence/classifier fallback and never overwrites a stronger positive projection.
- Unassigned equipment/invalid booking produces a rejected receipt/audit and no projection update.
- Sequence is Avro/Java `int` and PostgreSQL `integer`, constrained non-negative; U01 emits 0 and 1.

## Migration Rules

- U01 owns the vertical migration outcome: CMM owns its journey/ledger/outbox Flyway files and Booking owns its receipt/projection Flyway files; later units consume both schemas.
- Both service chains are ordered, additive, repeatable through Flyway history, preserve existing rows, and use no cross-database SQL.
- Backfill and forward repair are deterministic and idempotent; counts/checksums and API reads verify them after restart.
- Outbox legacy state names map to the canonical Java lifecycle before enforcing the corrected check constraint.
- No acceptance proof may depend on dropping volumes or recreating databases.

## UI Rules

- CMM pages remain inside the shared authenticated shell and use existing `@erp/ui` primitives/tokens.
- One h1 per route; lifecycle/next action/rejection never rely on color alone.
- Capture fields keep values on validation/409; focus moves to the error summary, which links to field guidance.
- Loading, empty/not-found, retryable error, denied, pending, success, and rejection have actionable text.
- Booking owns latest-only presentation; CMM owns the expected/actual timeline.
- No RTK/global store, shared-shell redesign, or `packages/ui` change is authorized.
