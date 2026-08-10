# NFR Requirements Questions - U04 Pricing Provider and Manual Cases

## Context

Program NFR-001 already requires warm known-rate and no-rate pricing p99 <=800
ms over at least 100 post-warm-up calls. U04 already fixes agreement-first
resolution, complete-tariff fallback, exact decimal itemisation, terminal byte
replay, fenced leases, and one OPEN manual case for missing/ambiguous authority.
These questions make the workload, contention, and local durability proof exact.

## Questions

### Q1. What local pricing workload should independently meet the existing p99 <=800 ms gate?

- A. At 10 concurrent clients on the confirmed U01/U03 authority fixtures, run at least 100 fresh post-warm-up requests each for agreement success, tariff success, `NO_RATE`, and ambiguity; require every scenario independently p99 <=800 ms, retain raw samples, and measure terminal replay separately without using it to satisfy the gate **(Recommended)**
- B. Use one combined 100-request mix of known-rate and no-rate calls, with one aggregate p99 <=800 ms
- C. Apply p99 <=800 ms only to successful pricing; report no-rate and ambiguity without a threshold
- X. Other (please specify)

[Answer]: A. At 10 concurrent clients on the confirmed U01/U03 authority fixtures, run at least 100 fresh post-warm-up requests each for agreement success, tariff success, `NO_RATE`, and ambiguity; require every scenario independently p99 <=800 ms, retain raw samples, and measure terminal replay separately without using it to satisfy the gate (Recommended)

**Mode:** guided

### Q2. What deterministic concurrency proof should pricing receipts and manual cases require?

- A. Run at least 20 fresh barrier rounds each for same-key/same-hash claim contention, expired-lease takeover with a fenced old owner, same-key/different-hash conflict, and concurrent no-rate case creation; require one resolver/terminal owner, byte-stable replay, one canonical OPEN case, exact loser outcomes, and no deadlock/partial state **(Recommended)**
- B. Prove one representative round for each receipt/case race
- C. Add a sustained production-style multi-node soak and broker stress campaign
- X. Other (please specify)

[Answer]: A. Run at least 20 fresh barrier rounds each for same-key/same-hash claim contention, expired-lease takeover with a fenced old owner, same-key/different-hash conflict, and concurrent no-rate case creation; require one resolver/terminal owner, byte-stable replay, one canonical OPEN case, exact loser outcomes, and no deadlock/partial state (Recommended)

**Mode:** guided

### Q3. What local capacity and recovery objective should receipt/manual evidence use?

- A. On at least 100,000 terminal receipts and 10,000 OPEN cases, require RPO 0 for committed terminal bytes/correlation/time/case identity, readiness plus exact replay and authorized case detail within 120 seconds after restart, takeover of expired in-progress claims, and U06 backup/restore proof; no production availability SLA **(Recommended)**
- B. Require consistency and restart tests only, without fixed receipt/case capacity or recovery-time bound
- C. Define a production 99.9% availability SLO and exactly-once request execution guarantee now
- X. Other (please specify)

[Answer]: A. On at least 100,000 terminal receipts and 10,000 OPEN cases, require RPO 0 for committed terminal bytes/correlation/time/case identity, readiness plus exact replay and authorized case detail within 120 seconds after restart, takeover of expired in-progress claims, and U06 backup/restore proof; no production availability SLA (Recommended)

**Mode:** guided
