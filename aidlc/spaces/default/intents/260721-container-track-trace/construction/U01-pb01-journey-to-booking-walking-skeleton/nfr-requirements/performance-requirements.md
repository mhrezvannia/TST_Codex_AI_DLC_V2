# Performance Requirements - U01 PB-01 Journey-to-Booking Walking Skeleton

## Source Alignment

These targets quantify U01 `business-logic-model.md` and `business-rules.md`,
retain `requirements.md` NFR-03/10, and fit the brownfield
`technology-stack.md`. They are local isolated-Compose acceptance targets, not
production SLOs or contractual SLAs.

## Response-Time Targets

| SLI | Load condition | Target | Measurement |
| --- | --- | --- | --- |
| journey list GET | one authenticated operator, 20 representative requests after warm-up | p95 <= 2 s; max <= 5 s | client-observed monotonic duration at the Wave A edge |
| journey detail GET | same | p95 <= 2 s; max <= 5 s | same, with response/status correlation |
| booking-reference journey GET | same | p95 <= 2 s; max <= 5 s | same |
| valid GTOT POST acknowledgement | one operator, 20 run-scoped one-booking/one-container fixtures | p95 <= 2 s; max <= 5 s | request start to committed accepted response, excluding Booking propagation |
| accepted commit to Booking DB/UI applied | healthy isolated stack | <= 30 s each observed movement | correlated broker/DB/UI timestamps |

One labelled warm-up per route is excluded. The GTOT warm-up and 20 measured
successes each use a unique run-scoped `booking.confirmed`/equipment identity
created through the real broker and receive exactly one GTOT. IDs carry the
acceptance run ID; database rows remain as isolated-stack evidence and teardown
stops only the `linercore-wave-a` project without deleting volumes. A rerun uses
a new run ID, so no accepted movement is reset or reused. These repeated copies
measure one-container path latency and are not a multi-container capacity claim.
HTTP 409/403/validation outcomes cannot count as successful GTOT samples.

Percentiles use nearest rank over ascending successful durations:
`rank=ceil(0.95*N)`, so N=20 p95 is the 19th value. Failed/denied calls are reported
separately rather than improving the success percentile. The evidence records
sample count, p50/p95/max, route, result, correlation, stack project, and time.

## Latency Budget and Guardrails

The synchronous budget includes edge routing, CMM application authorization,
repository work, Reference Data validation where applicable, and local commit.
Kafka publication and Booking consumption are asynchronous under the separate
30-second budget. No browser-to-Booking or service-to-service shortcut may be
introduced to meet timing.

For propagation, one acceptance controller uses a monotonic clock. Time zero is
receipt of the successful committed POST response. It polls the Booking database
projection and the Booking detail UI independently every 500 ms. The DB endpoint
is the first matching APPLIED projection row; the UI endpoint is the first
visible APPLIED state matching container, movement, lifecycle, and sequence.
Both elapsed durations must be <= 30 seconds from the same time zero. Broker and
service timestamps prove correlation only and are never subtracted across clocks.

An exceeded API or propagation target is a deterministic NFR failure unless the
one permitted environmental retry is supported by evidence. Port 8088 manager
demo traffic is outside the test and must remain protected by pre/post
`demo:guard`.

## Resource and Throughput Non-Claims

Record container CPU/memory, database connection symptoms, and Kafka lag when
available, but set no production RPS, concurrency, utilization, cost, or capacity
SLO. U01 proves a single operational journey and same-identity contention only;
multi-container sustained/spike/soak testing is not an implied requirement.

## Review Iteration 1

**Verdict: NOT-READY**

The artifacts retain the approved local-only NFR boundary, fail-closed Identity
semantics, service-owned persistence, real broker path, additive/no-reset
migration constraint, port-8088 protection, serialized `linercore-wave-a`
acceptance, scope exclusions, and the historical W1 BLOCKED/waiver wording.
The following exact corrections are required before implementation:

1. **Make the 20-sample GTOT target reset-safe and reproducible.** A valid GTOT
   can be accepted only once for the U01 journey, but
   `performance-requirements.md` permits "20 isolated fixture runs or
   equivalent reset-safe samples" without defining how those 20 successful
   acknowledgements are created on the live additive-migration stack. Name the
   deterministic non-destructive fixture/setup and cleanup procedure, state
   that 409 replays/rejections cannot count as successful GTOT samples, fix the
   warm-up count, and select the percentile calculation convention. The test
   must not silently depend on volume/database reset or broaden the business
   claim into multi-container capacity.
2. **Define one observable clock boundary for the 30-second propagation SLI.**
   "Accepted commit to Booking DB/UI applied" and "correlated broker/DB/UI
   timestamps" do not identify the start event, the two separately required end
   observations, polling interval, or clock source. Use a single observer's
   monotonic interval (for example, committed POST acknowledgement to Booking
   projection row observed and Booking detail visibly APPLIED), report DB and UI
   endpoints separately, and keep broker/service timestamps as correlation
   evidence rather than subtracting clocks from different containers.
3. **Split the two 10-contender scenarios and specify their exact write sets.**
   `scalability-requirements.md` currently combines same-event Booking intake
   and same-request movement capture into an "or" outcome, then requires one
   accepted movement even for the intake case. State independent intake and
   capture probes. Intake must identify the single receipt/journey/plan/seq-0
   outbox winner and the exact loser replay-audit effects. Capture must identify
   the one immutable accepted request disposition, movement, version advance,
   audit, and seq-1 outbox effect, plus the exact per-loser attempt/rejection/
   audit effects while the winner disposition remains immutable. This is needed
   to distinguish correct durable contention evidence from duplicate business
   mutation.
4. **Complete the STRIDE coverage without inventing compliance.** The security
   matrix covers spoofing, tampering, repudiation, information disclosure, and
   elevation of privilege, but has no denial-of-service/availability row. Add a
   bounded local control and evidence set appropriate to this slice (bounded
   payload/identifier lengths, paginated/bounded reads, dependency timeouts and
   the approved 10-contender no-exhaustion proof). Do not turn this into a
   production rate-limit, availability, or certification claim.
5. **Bind restart recovery to an executable outbox state and fence.** Define the
   pre-restart fixture as a committed `PENDING` row before relay claim, or state
   how an `IN_PROGRESS` lease is reclaimed within the same bound; choose one
   readiness/relay-resume timestamp rather than the current alternative. Require
   completion to condition on event ID, `IN_PROGRESS`, worker, token, and
   fencing version, and make the Booking APPLIED observation use the same
   30-second measurement rule. Preserve the at-least-once allowance: a publish
   before lease loss may redeliver, but receipts must yield one logical
   projection.
6. **Correct executable version fidelity.** `tech-stack-decisions.md` presents
   Next.js `15.1.3` and TypeScript `5.7.2` as fixed selected versions, while the
   root manifests declare caret ranges and the current lock resolves Next.js
   `15.5.19` and TypeScript `5.9.3`. Record declared range versus resolved
   version (or deliberately pin and regenerate the lock) so evidence runs the
   stack the decision claims. Java 21, Spring Boot 3.3.7, Avro 1.11.4,
   Confluent 7.7.1, PostgreSQL 15, React 18.3.1, and Playwright 1.61.1 otherwise
align with the inspected executable inventory.

## Builder Remediation after Review Iteration 1

The builder made the 20 GTOT samples run-scoped/non-destructive with one warm-up
and nearest-rank p95, defined one monotonic DB/UI propagation observer, split
intake/capture contention write sets, added bounded DoS evidence, fixed the
PENDING restart/fencing probe, and recorded declared versus lock-resolved
frontend versions.

## Review Iteration 2

**Verdict: READY**

- The GTOT latency probe now has one labelled warm-up and 20 successful,
  run-scoped one-booking/one-container fixtures driven through the real
  `booking.confirmed` broker seam. Every identity is accepted once, HTTP
  409/403/validation results are excluded, reruns use a new run ID, and neither
  database nor volume reset is permitted. Nearest-rank p95 is exact and the
  repeated fixtures are explicitly evidence sampling rather than a fleet-scale
  capacity claim.
- Propagation uses one controller monotonic start at the committed POST response
  and independently polls Booking DB and visible Booking UI APPLIED endpoints at
  500 ms. Both must meet 30 seconds; broker/service wall-clock timestamps are
  correlation evidence only, so no cross-container clock subtraction remains.
- Intake and capture contention are separate 10-contender probes with exact
  winner and loser write sets. Intake yields one receipt/journey/two-row plan/
  accepted audit/seq-0 outbox plus nine replay audits. Capture yields one
  accepted disposition/attempt/movement/version advance/audit/seq-1 outbox plus
  nine attempt/rejection/audit-only losers, with accepted state and the winner
  disposition immutable.
- The threat matrix now completes STRIDE with bounded local denial-of-service
  controls and measurable validation, timeout, pagination/batch, contention,
  and resource/error evidence, while expressly declining production rate-limit,
  availability, autoscaling, certification, and volumetric-attack claims.
- Restart recovery uses the existing relay-enabled property seam to prove a
  committed, unclaimed PENDING row before restart, one service-ready monotonic
  time zero, the complete event ID + IN_PROGRESS + worker + token + version
  completion fence, and separate 500 ms Booking DB/UI observations within the
  same 30-second bound. At-least-once redelivery remains compatible with one
  logical receipt/projection.
- The stack record now distinguishes declared caret ranges from lock-resolved
  Next.js 15.5.19 and TypeScript 5.9.3. The remaining backend, contract,
  database, React, and Playwright versions align with the inspected executable
  inventory.
- Scope and evidence constraints remain intact: no EDI/public DCSA/fleet/depot/
  M&R/cloud or shared-shell expansion, no destructive migration proof, W2-02-
  first synchronization before final visual/live acceptance, exclusive
  `linercore-wave-a` control via `scripts/wave-a-compose.mjs`, pre/post
  `demo:guard`, and no relabelling of the historical W1 BLOCKED/waiver as PASS.
