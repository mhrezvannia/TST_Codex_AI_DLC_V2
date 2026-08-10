# Infrastructure Design Questions - U02 Ordered Lifecycle and Observable Rejections

## Q1. Deployment topology

- A. Retain the existing portable Compose topology and service-owned CMM/Booking databases, with one isolated Wave A controller. (recommended)
- B. Add a cloud multi-region retry platform.
- C. Merge CMM and Booking persistence.
- X. Other (please specify)

[Answer]: Existing portable Compose (Recommended)

## Q2. Retry monitoring

- A. Use existing correlated outbox/consumer metrics, fence evidence, receipt/projection health, bounded alerts, and redacted logs. (recommended)
- B. Add a new production observability platform and throughput SLO.
- C. Monitor only broker container stdout.
- X. Other (please specify)

[Answer]: Correlated existing metrics (Recommended)

## Q3. Delivery pipeline

- A. Run contract/schema checks, additive migrations, deterministic ten-delivery acceptance, isolated Compose/Playwright proof, and reversible promotion without volume reset. (recommended)
- B. Reset databases and replay all events on failure.
- C. Deploy retry code directly without acceptance proof.
- X. Other (please specify)

[Answer]: Checks + reversible promotion (Recommended)
