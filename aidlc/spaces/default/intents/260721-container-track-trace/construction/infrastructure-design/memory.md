# Infrastructure Design Memory

## Interpretations

- 2026-07-22T07:45:00Z - U01 infrastructure remains on the existing portable Compose/service-owned topology; no AWS resource or shared database is added.

## Deviations

- 2026-07-22T07:45:00Z - Monitoring and CI/CD are specified as existing correlated evidence and reversible promotion rather than a new production platform.

## Tradeoffs

- 2026-07-22T07:45:00Z - Shared Kafka/network/service discovery are retained with explicit CMM/Booking ownership because they are required for the real broker-to-Booking proof.

## Open questions

- 2026-07-22T07:45:00Z - None for U01 infrastructure design; final acceptance must wait for W2-02 integration synchronization.
- 2026-07-22T08:05:00Z - U01 Infrastructure Design independent review iteration 1 is READY; portable topology, ownership, additive rollback, correlated evidence, demo/8088, isolated stack, W2-02 sync, and W1 waiver were affirmed.
- 2026-07-22T08:20:00Z - U02 Infrastructure Design selected the existing portable topology, correlated retry/consumer evidence, and reversible schema/acceptance promotion; acceptance seams remain non-production and W1/demo/isolated controls persist.
- 2026-07-22T08:35:00Z - U02 Infrastructure Design independent review iteration 1 is READY; topology, service ownership, retry/order evidence, additive pipeline, redaction, integration synchronization, demo/8088, isolated stack, W1 waiver, and scope boundaries were affirmed.
- 2026-07-22T08:50:00Z - U03 Infrastructure Design selected portable Compose, correlated dependency health/freshness evidence, and reversible auth/DTO/security/isolation acceptance promotion; no authority cache or replay was added.
- 2026-07-22T09:05:00Z - U03 Infrastructure Design review iteration 1 NOT-READY findings were remediated with exact matrix/lookup/write-set evidence, safe DTO/timestamp contracts, volume/demo/W2-02 isolation checks, and explicit denial-versus-outage proofs.
- 2026-07-22T09:20:00Z - U03 Infrastructure Design independent review iteration 2 is READY; exact authorization evidence, safe DTOs, write sets, volume/demo/W2-02 controls, W1 waiver, and scope boundaries were verified.
