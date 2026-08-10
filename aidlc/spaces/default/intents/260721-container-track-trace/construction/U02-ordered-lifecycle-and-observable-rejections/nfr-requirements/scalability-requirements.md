# Scalability Requirements - U02 Ordered Lifecycle and Observable Rejections

## Source Alignment

This bounded contention model derives from U02 `business-logic-model.md`,
`business-rules.md`, `requirements.md`, and the Kafka/PostgreSQL stack in
`technology-stack.md`. It extends U01 contention evidence without defining
production traffic or partition scaling.

## Booking Ten-Record Ordering Window

Create valid booking `BK-{run}-A` assigned to `EQ-{run}-A`; reserve missing
booking `BK-{run}-MISSING` and unassigned equipment `EQ-{run}-UNASSIGNED`.
Deliver this exact run-scoped order. Because invalid-booking and unassigned
payloads may hash to different Kafka partitions, publish record `n+1` only after
the controller observes record `n`'s durable receipt disposition (or, for the
redelivery, its durable duplicate-delivery evidence). Producer acknowledgement
for record 1 starts one controller-monotonic 30-second window.

1. `E-{run}-L0A`, valid booking/equipment, sequence 0, occurrence `T+1`, classifier ACT, APPLIED by legacy fallback;
2. `E-{run}-P4`, valid booking/equipment, sequence 4, occurrence `T+4`, classifier ACT, APPLIED and strongest;
3. exact redelivery of `E-{run}-P4`, returned DUPLICATE with no new receipt and original P4 receipt still APPLIED;
4. `E-{run}-P4E`, valid booking/equipment, sequence 4, occurrence `T+4`, classifier ACT, STALE;
5. `E-{run}-P3`, valid booking/equipment, sequence 3, occurrence `T+3`, classifier ACT, STALE;
6. `E-{run}-P2`, valid booking/equipment, sequence 2, occurrence `T+2`, classifier ACT, STALE;
7. `E-{run}-P1`, valid booking/equipment, sequence 1, occurrence `T+1`, classifier ACT, STALE;
8. `E-{run}-BADBOOK`, missing booking with assigned equipment identity, sequence 5, REJECTED;
9. `E-{run}-UNASSIGNED`, valid booking with `EQ-{run}-UNASSIGNED`, sequence 5, REJECTED;
10. `E-{run}-L0B`, valid booking/equipment, sequence 0, occurrence `T+5`, classifier ACT, STALE because positive ordering already exists regardless of arrival or legacy comparator values.

The nine unique envelope IDs create exactly nine durable receipts with final
dispositions APPLIED=2 (`L0A`, `P4`), STALE=5 (`P4E`, `P3`, `P2`, `P1`,
`L0B`), and REJECTED=2 (`BADBOOK`, `UNASSIGNED`). DUPLICATE is the tenth
delivery result/audit evidence, not a mutation of P4's APPLIED receipt. Only P4
is the final strongest projection; after record 2 its projection hash is
unchanged by records 3-10. Record booking/equipment identity, occurrence,
classifier, producer acknowledgement, delivery order, partition/offset, event
ID/sequence, receipt/delivery disposition, before/after hashes, and timings.
Poll every 500 ms for nine named receipt rows with the exact disposition counts,
one duplicate-delivery evidence row for P4, the P4 latest projection in Booking
DB and detail API, and the Booking detail UI's matching APPLIED status. All four
endpoints must satisfy the same 30-second window.

## CMM Contention and Batch Bounds

U01's 10-contender capture probe remains binding. U02 additionally proves 20
run-scoped duplicate and 20 out-of-sequence transactions without accepted-state
advance, connection exhaustion, deadlock, or unbounded retry. Relay claims use a
configured bounded batch (existing default 50); Booking processing remains
idempotent across allowed broker redelivery.

## Non-Claims and Growth

The evidence is a correctness/lock-contention boundary, not Kafka messages per
second, number of concurrent operators, annual row growth, partition capacity,
autoscaling, or cost. No sharding, cache, new broker, or read replica is added.
