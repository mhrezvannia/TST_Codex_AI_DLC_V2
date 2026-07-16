# Business Rules - U05 Returned Status Detail

## Contract and Publication Rules

| ID | Rule | Outcome when false |
|---|---|---|
| BR-U05-001 | Status record field spelling/casing matches canonical `.avsc` envelope and nested data exactly. | Contract test/listener failure. |
| BR-U05-002 | Topic is `containermovement.status`; key is exactly `bookingRef:containerRef`. | Permanent DLT on consumer key mismatch. |
| BR-U05-003 | CMM publishes only through shared publisher/registrar and adopted W0 relay lifecycle. | Architecture failure. |
| BR-U05-004 | Root and service-local schemas are byte-equivalent and Schema Registry compatibility is BACKWARD. | Blocking compatibility failure. |
| BR-U05-005 | Legacy flat records are not accepted by W1 consumers. | Direct DLT. |

## Receipt and Ordering Rules

- Envelope `id` is the only consumer dedupe key. Producer idempotency or movement ID does not replace it.
- Receipt and projection commit in one Booking transaction; rollback leaves neither effect.
- Projection key is `(bookingRef, containerRef)` and retains every canonical status field plus envelope provenance.
- Candidate replaces stored data only if `(occurredDateTime, classifierRank, receivedDateTime, eventId)` is lexicographically greater.
- Classifier rank is fixed: `PLN=1`, `EST=2`, `ACT=3`; rank breaks only equal occurred times.
- A distinct stale event is recorded with disposition `STALE` and acknowledged; it never regresses UI state.
- Duplicate envelope is a no-op. Replay after success never appends another business effect.
- Status projection never changes Booking aggregate revision/status or writes generic attributes.

## Invariant and Failure Rules

- Booking and confirmed container assignment must exist before a status can apply.
- Event classifier, move code, empty indicator, times, booleans, and optional location must be contract-valid.
- Unknown Booking/container, record-key mismatch, source/type/version mismatch, and malformed values are permanent.
- Database connectivity/deadlock/serialization failures are transient: initial delivery plus 250 ms and 1 second retries, then DLT.
- DLT replay requires `messaging:replay`, preserves envelope ID, and writes actor/reason/original topic-partition-offset audit.
- Raw broker payloads, stack traces, service hosts, and customer data are excluded from API/UI errors and ordinary logs.

## Detail and UI Rules

- Booking detail reads only Booking-owned persistence; it never queries CMM at request time.
- Confirmed with no projection is `PENDING_EVENT`, not an empty/unknown movement.
- Persisted projection remains visible through CMM/Kafka outage and service restart.
- Poll once per second for at most 30 seconds, stop on success/error/navigation, and pause while hidden.
- Poll exhaustion presents delayed pending plus explicit Retry; it does not fabricate failure or movement facts.
- Status shows classifier, derived status, move code, occurred/received times, container, location, and transshipment clearly; audit transport metadata is collapsed by default.
- Returned status must be visible from successful confirm within measured p95 <=5 seconds on the live stack.

## Scope Rules

U05 publishes and projects the initial/planned and later validated movement facts. It does not calculate D&D charges, infer bounding moves when applicability is empty, mutate CMM journeys, or introduce direct service-to-service reads.

## Source Coverage

Rules refine U05 from `unit-of-work.md`, US-W1-005 in `unit-of-work-story-map.md`, FR/NFR acceptance in `requirements.md`, C05/C09/C10/C11 ownership in `components.md`, projection/listener methods in `component-methods.md`, and status ordering/DLT/latency rules in `services.md`.
