# Performance Requirements - U05 Booking Consumption and Repricing

## Scope and measurement separation

These provisional local requirements consume `business-logic-model.md`,
`business-rules.md`, program `requirements.md`, and brownfield
`technology-stack.md`. Booking-local capture/completion/read timings exclude the
Charge call. Healthy end-to-end timings include BFF/Booking/Charge and both
commits, but remain separate from U04's provider-only p99 <=800 ms evidence.
No production SLO is claimed.

Evidence records commit, isolated `linercore-wave-a` topology, host CPU/RAM/OS,
Java/PostgreSQL versions, fixture counts, concurrency, warm-up, raw monotonic
timings, status/code, and nearest-rank percentiles.

## Booking-local workload

The fixture has at least 10,000 Bookings, 1,000 deep-history Bookings with exactly
50 typed snapshots each, and 100,000 local `PRICE` receipts across IN_PROGRESS,
RETRYABLE, and COMPLETED states. Legacy embedded snapshots remain a distinct
compatibility subset.

| ID | Operation and measured set | Load/target |
| --- | --- | --- |
| PERF-U05-001 | capture/claim absent unique `P|bookingRef:pricingAmendmentSeq` receipts | 10 clients; 20 warm-ups then 100 fresh calls; p95 <=500 ms |
| PERF-U05-002 | locked W2 success completion with prevalidated provider result | 10 clients; 20 warm-ups then 100 unique calls; p95 <=750 ms |
| PERF-U05-003 | current Booking detail plus first 20-entry typed-history page | 10 clients; 20 warm-ups then 100 calls spanning shallow/deep/legacy; each subtype and aggregate p95 <=750 ms |
| PERF-U05-004 | next 20-entry cursor page at equal/different timestamps | 10 clients; 100 calls; p95 <=750 ms; zero gaps/duplicates |

Capture samples require distinct local receipts and exact frozen body/fingerprint/
sequence evidence. Completion samples append one distinct immutable snapshot,
advance one current pointer, and atomically finish receipt/audit. Setup and remote
result construction are excluded. Unexpected outcomes remain and fail the set.

## Healthy fresh end-to-end target

At 10 clients, after 20 discarded warm-ups per subtype, PERF-U05-005 runs 200
fresh operations: 50 first Price/Agreement, 50 first Price/Tariff, 50 Reprice to
an Approved successor Agreement window, and 50 Reprice to changed tariff source
versions. Every subtype and Price/Reprice aggregate independently meets p99
<=1,500 ms.

Each measured operation uses a unique valid Booking number/pricing sequence,
Booking-local key, Charge key, pricingRequestId, Charge terminal receipt, and
Booking typed snapshot, with `replayed=false` at both services. Reused, replayed,
missing, or duplicate identities invalidate the complete set. The timer begins
at authenticated Booking command acceptance and ends after Booking snapshot/
state/audit/local receipt commit and response serialization. It includes one
healthy Charge call but excludes fixture setup and Playwright rendering.

Every 200 passes a field-for-field oracle: line order/category/code/basis,
quantity, numeric unit rate/amount/currency, total, pricing basis/reference,
source RateVersion IDs, AgreementVersion when applicable, requested date,
pricing request/correlation/time, and immutable prior/current history. Retained
performance evidence uses booleans/canonical hashes, not raw money.

Timeout/503 retry and circuit scenarios are measured separately against their
fixed two-second/two-call/30-second policy and are not allowed into the healthy
p99 set. No-rate/ambiguity/manual projections are correctness and U04 p99
evidence; they do not masquerade as successful Booking Price/Reprice latency.

## Contention and resource gates

At least 20 barrier rounds each run through two independently wired Spring
contexts sharing PostgreSQL:

- live same key/hash: one owner, contenders exact 409 `PRICING_IN_PROGRESS` with
  clipped 1-15 second `Retry-After`, then exact command-outcome replay;
- expired takeover: new owner has higher fence; stale transition returns exact
  internal `BookingPricingReceiptTransition.FENCE_REJECTED`; while winner is
  active public result is local in-progress, after terminal it replays stored
  outcome/current view when markers match;
- duplicate completion for the same provider result: exactly one snapshot/
  current pointer/audit/terminal receipt; stale identical attempt replays, not
  appends;
- pricing-input amendment versus completion: amendment advances pricing sequence/
  fingerprint; stale completion returns 409 `BOOKING_CHANGED`, appends nothing,
  and records RETRYABLE with NULL due/recovery `NEW_PRICING_SEQUENCE_REQUIRED`;
  the old key is non-reclaimable and the new sequence derives a new key;
- revision-only non-pricing amendment versus completion: sequence/fingerprint
  remain equal but revision advances; stale completion returns 409
  `BOOKING_CHANGED`, appends nothing, and records RETRYABLE with
  `nextAttemptAt=completedAt`/recovery `REVISION_REFRESH_REQUIRED`. An explicit
  same-key retry takes a higher fence, freezes the current revision, receives
  Charge terminal replay for the unchanged provider body/key, commits exactly
  one snapshot, and preserves every newer non-pricing field;
- divergent bytes for an existing snapshot identity: 409
  `PRICING_SNAPSHOT_CONFLICT`; existing snapshot/current pointer unchanged and
  local terminal conflict evidence stored once.

The amendment-race family runs at least 20 rounds for each pricing-input and
revision-only subtype. No round permits deadlock, pool timeout, stale overwrite, two divergent
snapshots, partial aggregate/snapshot/audit/receipt state, or a Charge call
inside a Booking DB transaction.

The fixed local mixed workload runs three cycles after warm-up with 60 seconds
quiescence. Heap minimum and RSS median over each last 30 seconds must satisfy
cycle three <= max(120% cycle one, cycle one +32 MiB), and neither may rise >5%
in both transitions. OOM/restart, pool timeout, deadlock, unbounded history, N+1
snapshot query, cursor gap/duplicate, or bound breach fails. CPU/GC are reported
without a production capacity inference.

## Upstream coverage

This artifact explicitly consumes `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and `technology-stack.md`. U06 owns live
Compose/Playwright closure; U04 retains provider-only authority/performance.
