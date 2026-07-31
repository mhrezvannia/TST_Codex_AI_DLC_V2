# Performance Design - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Budget

This design implements `performance-requirements.md` and the U01
`business-logic-model.md` on the versions selected in
`tech-stack-decisions.md`. The synchronous budget covers REST edge, fresh
authorization, indexed repository work, Reference Data validation, and one
local commit. Kafka publication and Booking projection use the independent
30-second observer.

## Query and Resource Strategy

Journey list, detail, and booking-reference resolver use service-owned indexed
queries, bounded pagination, projection-shaped columns, and existing connection
pools. No cache or CDN is introduced. Capture remains asynchronous after the
local transaction; the relay claims bounded batches and never reruns domain
creation. Acceptance records nearest-rank p95/max and separate DB/UI polling
observations without cross-container clock subtraction.

## Guardrails

Read and payload limits are bounded; dependency calls have explicit timeouts;
the 10-contender probes assert no pool exhaustion. `npm run demo:guard` runs
before/after isolated `linercore-wave-a` acceptance, protecting port 8088.

## Review Iteration 1

**Verdict: READY**

1. Indexed bounded queries and explicit p95/max budgets cover list/detail, resolver, and GTOT acknowledgement; propagation uses one monotonic observer with independent 500 ms DB/UI checks.
2. Fresh application authorization is required for reads and capture, with fail-closed dependency behavior and no UI authority.
3. Additive service-owned CMM/Booking migrations and event/worker/token/version relay fencing preserve restart safety and one logical Booking projection; Booking never synchronously queries CMM for status.
4. CMM owns Container Movement pages and resolver; Avro `containermovement.status` mapping and sequence semantics remain explicit.
5. Scope exclusions, isolated stack, port 8088 guard, and W1 BLOCKED/waiver are preserved with no shared-shell or `packages/ui` redesign.
