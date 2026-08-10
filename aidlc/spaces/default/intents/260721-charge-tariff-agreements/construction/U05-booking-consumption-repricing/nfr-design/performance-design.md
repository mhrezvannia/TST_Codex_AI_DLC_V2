# Performance Design - U05 Booking Consumption and Repricing

## Boundary and budgets

U05 evolves the existing Booking service, database, BFF, and pricing region. It
adds no service, queue, cache, replica, global client state, or remote call
inside a Booking transaction.

| Path | Allocation | Target |
| --- | --- | --- |
| capture/claim | auth/load 150 ms; fingerprint/codec 100; receipt lock/CAS 150; margin 100 | p95 <=500 ms |
| completion | lock/revalidate 175 ms; snapshot/aggregate 250; audit/receipt 175; margin 150 | p95 <=750 ms |
| detail/history page | auth/load 125 ms; aggregate query 175; 20-row cursor query 250; mapping/margin 200 | p95 <=750 ms |
| fresh end-to-end | diagnostic spans: BFF/auth, capture, Charge, completion, response | each subtype directly measured p99 <=1,500 ms |

Healthy runs contain exactly 50 first Agreement, 50 first Tariff, 50 successor
Agreement Reprice, and 50 changed-tariff Reprice operations. Timeout/503/circuit
tests use their separate two-call/two-second/30-second assertions.

Component percentile budgets are diagnostic guardrails, not quantities added to
prove an end-to-end percentile; percentiles are not algebraically additive. The
authenticated-command-to-serialized-response monotonic sample is authoritative
for each fresh subtype and the Price/Reprice aggregates.

## Three-phase execution

`captureAndClaim` is a public short transaction that authorizes, validates,
freezes canonical input/revision/sequence/fingerprint/body/key, and performs
indexed receipt claim/replay/takeover. The HTTP resilience adapter then runs
with no Booking transaction. A second public transaction locks Booking and
receipt, revalidates revision/sequence/fingerprint/owner/fence, and atomically
commits snapshot/evidence, current pointer, aggregate, audit, and receipt.

No automatic UI or background retry exists. An explicit authenticated command
may reclaim only when the stored due/recovery policy permits.

## Query and pool design

The widened `booking_idempotency` primary key supports `P|<ChargeKey>` and
covering receipt state/owner/fence/due fields. Completion locks one receipt and
one Booking in stable order. Typed history uses an immutable primary identity
and the exact descending index/cursor
`(booking_id, amendment_seq DESC, created_at DESC, pricing_request_id DESC)`.

Reuse the existing Booking Hikari pool. One request holds one connection only
during capture, completion, or a bounded read; the two-second HTTP call holds
none. Ten independent clients therefore do not serialize on JVM locks.

## History and resource bounds

History defaults to 20 and caps at 100. Current Booking, typed page, and at most
one Legacy entry are loaded with fixed set queries; full history and N+1 are
forbidden. The cursor is base64url canonical `{a,t,id}` and applies the exact
descending tuple predicate, including equal timestamps.

The three-cycle gate rejects heap/RSS above
`max(120% cycle one, cycle one + 32 MiB)`, two successive >5% rises,
deadlock, pool timeout, unbounded histories, cursor gaps, or retained provider
bodies.

## Instrumentation

Timers separate capture, raw provider attempt, resilience operation, completion,
history, and end-to-end subtype. Bounded labels include operation/outcome/basis/
manual reason/replay/retry/circuit; money, fingerprint material, customer/route,
owner, and correlation are not labels. Evidence retains canonical hashes rather
than commercial amounts.

## Verification and traceability

Tests use 10,000 Bookings, 1,000x50 typed snapshots, 100,000 receipts, 10
clients, exact percentile populations, field-for-field provider oracles, 20
two-context rounds for every race, query plans, cursor stability, and heap/RSS.

This design consumes `performance-requirements.md`,
`security-requirements.md`, `scalability-requirements.md`,
`reliability-requirements.md`, `tech-stack-decisions.md`, and
`business-logic-model.md`.

## Review response

Iteration-one findings are resolved as follows:

1. Retry and circuit record only exhausted typed timeout/HTTP-503 operations;
   every 4xx, valid domain outcome, malformed/denied response, local conflict,
   validation result, and caller cancellation is ignored by circuit metrics.
2. A concurrent half-open rejection stores a deterministic due instant of
   `probeStartedAt + 5 seconds`, covering the admitted probe's two bounded
   two-second attempts plus one-second release margin.
3. Each raw HTTP attempt has connect/read/deadline cancellation at two seconds,
   closes response bodies in all paths, releases the client permit/socket, and
   creates no detached retry thread or unbounded future.
4. Direct fresh-operation p99 samples are authoritative; component spans are
   diagnostic and are not added as percentile proof.

## Review - Iteration 2

**Verdict: READY**

### Critical findings

None.

### High-severity findings

None.

### Medium-severity findings

None.

### Low-severity findings

None.

### Validation results

- **PASS - prior blocker 1:** the typed adapter boundary now records circuit
  failure only for exhausted timeout/HTTP-503 operations and explicitly ignores
  4xx, valid domain outcomes, denied/malformed responses, Booking-local
  outcomes, and caller cancellation. Retry and circuit each observe the
  intended abstraction once.
- **PASS - prior blocker 2:** a half-open no-permit result now persists
  `probeStartedAt + 5 seconds`, covering two sequential two-second attempts and
  one second of release/state-transition margin. Concurrent commands cannot
  remain immediately due or bypass the single admitted probe.
- **PASS - prior blocker 3:** every raw attempt has a two-second overall
  deadline plus connect/read enforcement, synchronous cancellation, response
  closure, and permit/socket release before retry. Tests retain stable permits,
  sockets, threads, and heap under repeated timeouts.
- **PASS - prior blocker 4:** component percentiles are explicitly diagnostic;
  direct monotonic command-to-response p99 samples for each fresh subtype and
  Price/Reprice aggregate are the authoritative 1,500 ms gate.
- **PASS - required sections:** before this section, H2 counts were performance
  8, security 6, and seven each for scalability, reliability, and logical
  components.
- **PASS - upstream coverage:** all five outputs reference
  `performance-requirements.md`, `security-requirements.md`,
  `scalability-requirements.md`, `reliability-requirements.md`,
  `tech-stack-decisions.md`, and `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present; the only fenced block is a plain-text interaction flow.
- **PASS - overall coherence:** retry/circuit admission, durable receipt due
  policy, capture/remote/completion boundaries, fencing, amendment races,
  bilateral recovery, latency evidence, resource bounds, existing-stack
  constraints, and LinerCore UI ownership agree across the five outputs.
  Component references resolve and no circular dependency was found.
- **Sensor note:** equivalent read-only checks were performed; the known-broken
  Windows sensor dispatcher was not run.

## Review

**Verdict: NOT-READY**

### Critical findings

None.

### High-severity findings

1. **The circuit breaker outcome predicate is not implementable from the
   design.** The artifacts state that only timeout/503 is retried and that valid
   Charge 4xx/domain outcomes must not count as circuit failures, but they do
   not define the Resilience4j `recordException`/`ignoreException` or result
   predicate after HTTP decoding. Common Java clients represent 4xx and 5xx as
   exceptions, while malformed-response and authorization mappings may also
   throw. A default configuration can therefore open the circuit after five
   no-rate, ambiguity, conflict, in-progress, or denied outcomes and persist
   false outage evidence. Specify the typed adapter algebra seen by Retry and
   CircuitBreaker, including timeout, 503, 4xx, malformed payload, cancellation,
   and `CallNotPermittedException`, and test the exact five-sample window.
2. **The occupied half-open-probe path has no durable due-time rule.** One probe
   is admitted after 30 seconds, but concurrent explicit commands for other due
   receipts can reclaim their local row and then be rejected while that probe
   is in flight. At that moment the recorded open-wait eligibility instant is
   already due, so the stated "exact probe instant" can leave those receipts
   immediately reclaimable, causing fence churn and repeated no-call requests.
   Define the `HALF_OPEN` no-permit outcome, a future bounded
   `nextAttemptAt`/guidance rule, and deterministic multi-key tests for probe
   success and failure.

### Medium-severity findings

1. **The two-second raw-call bound does not define cancellation/resource
   semantics.** The design does not name connect/read/overall timeout ownership,
   prove that a timed-out blocking call releases its connection and worker
   before the second attempt, or state the existing HTTP pool/dispatcher bounds.
   Without this, "at most two calls" does not prove the claimed absence of
   unbounded socket/thread growth under repeated timeouts. Specify one overall
   per-attempt deadline, cancellation behavior, and bounded client resources.
2. **The end-to-end allocation is not valid percentile arithmetic.** Adding an
   independently measured Charge p99 of 800 ms to Booking component allocations
   does not by itself prove an end-to-end p99 of 1,500 ms, especially when the
   other components are locally gated at p95. The independent 200-operation
   end-to-end test is the valid acceptance proof; label the table as an
   engineering budget, retain the direct p99 gate, and do not claim the sum as
   a derived guarantee.

### Low-severity findings

None.

### Validation results

- **PASS - required sections:** H2 counts are performance 6, security 6,
  scalability 7, reliability 7, and logical components 7 before this review.
- **PASS - upstream coverage:** each output references
  `performance-requirements.md`, `security-requirements.md`,
  `scalability-requirements.md`, `reliability-requirements.md`,
  `tech-stack-decisions.md`, and `business-logic-model.md`.
- **PASS - lint/type-check applicability:** no TypeScript, TSX, or JavaScript
  snippets are present; the only fenced block is a plain-text interaction flow.
- **PASS - transaction/race coherence:** capture, remote call, and completion
  boundaries agree; Booking-then-receipt locking, owner/fence CAS,
  revision/sequence/fingerprint revalidation, pricing-input retirement,
  revision-only replay, snapshot collision, and lost-response recovery are
  coherent and leave no remote call inside a Booking transaction.
- **PASS - fixed quantitative state rules:** local lease, provider and local
  `Retry-After`, retry count, circuit window/wait/probe count, history bounds,
  fixtures, latency samples, resource gate, and 120-second restart target are
  numerically stated.
- **PASS - stack and UI boundaries:** the design stays in the existing Booking
  service/database/route and LinerCore pricing region, uses focused local state
  and existing `@erp/ui`, and adds no shared primitive, shell, palette, font,
  RTK store, browser pricing authority, or new deployable.
- **FAIL - resilience implementability:** circuit outcome classification,
  concurrent half-open rejection, and timed-out HTTP resource release require
  decisions that cannot be safely inferred.
- **Sensor note:** equivalent read-only checks were performed; the known-broken
  Windows sensor dispatcher was not run.
