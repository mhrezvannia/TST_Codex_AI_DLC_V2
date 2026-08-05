# NFR Requirements Questions - U05 Booking Consumption and Repricing

## Context

U05 already fixes the Booking pricing fingerprint/sequence, immutable typed
snapshot history, remote-call-outside-transaction structure, 15-second local
receipt lease/fence, exact retry/circuit policy, explicit Reprice, confirmation
guard, and manual/error projections. These questions quantify only Booking-local
capacity, contention, and recovery plus a separate healthy end-to-end target.

## Questions

### Q1. What provisional local Booking pricing performance/capacity target should apply?

- A. At 10 concurrent clients over at least 10,000 Bookings, 50 typed snapshots for each of 1,000 deep-history Bookings, and 100,000 local PRICE receipts, require capture/claim p95 <=500 ms, locked completion p95 <=750 ms, current detail plus 20-history page p95 <=750 ms, and healthy fresh Price/Reprice end-to-end p99 <=1,500 ms including Charge; measure each separately and claim no production SLO **(Recommended)**
- B. Measure only U04's Charge p99 <=800 ms and set no Booking-local/end-to-end target
- C. Require every Booking-local and end-to-end operation p99 <=800 ms on the same fixture
- X. Other (please specify)

[Answer]: A. At 10 concurrent clients over at least 10,000 Bookings, 50 typed snapshots for each of 1,000 deep-history Bookings, and 100,000 local PRICE receipts, require capture/claim p95 <=500 ms, locked completion p95 <=750 ms, current detail plus 20-history page p95 <=750 ms, and healthy fresh Price/Reprice end-to-end p99 <=1,500 ms including Charge; measure each separately and claim no production SLO (Recommended)

**Mode:** guided

### Q2. What deterministic Booking pricing concurrency proof should apply?

- A. Run at least 20 fresh barrier rounds each for same local key/hash claim, expired takeover with stale completion, two completion attempts for one provider result, amendment racing completion, and divergent duplicate snapshot identity; require exact typed losers, one immutable append/current pointer, no stale overwrite/deadlock/partial receipt-audit-state **(Recommended)**
- B. Prove one representative round for each local receipt/snapshot race
- C. Add sustained production-style multi-node/provider soak and chaos testing
- X. Other (please specify)

[Answer]: A. Run at least 20 fresh barrier rounds each for same local key/hash claim, expired takeover with stale completion, two completion attempts for one provider result, amendment racing completion, and divergent duplicate snapshot identity; require exact typed losers, one immutable append/current pointer, no stale overwrite/deadlock/partial receipt-audit-state (Recommended)

**Mode:** guided

### Q3. What local durability/recovery objective should Booking pricing state use?

- A. Require RPO 0 for committed Booking pricing fields, typed snapshots, manual/error evidence, PRICE receipt payload/owner/fence/times, and audit; readiness plus exact lost-response replay and current/history read within 120 seconds after restart, expired-lease takeover, and U06 backup/restore/forward-repair proof; no production availability SLA **(Recommended)**
- B. Require transactional consistency and restart tests only, without a measured recovery bound
- C. Define a production 99.9% availability SLO and exactly-once cross-service transaction now
- X. Other (please specify)

[Answer]: A. Require RPO 0 for committed Booking pricing fields, typed snapshots, manual/error evidence, PRICE receipt payload/owner/fence/times, and audit; readiness plus exact lost-response replay and current/history read within 120 seconds after restart, expired-lease takeover, and U06 backup/restore/forward-repair proof; no production availability SLA (Recommended)

**Mode:** guided
