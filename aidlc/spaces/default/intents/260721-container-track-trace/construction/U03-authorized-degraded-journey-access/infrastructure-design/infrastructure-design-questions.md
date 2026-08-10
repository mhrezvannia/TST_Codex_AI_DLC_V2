# Infrastructure Design Questions - U03 Authorized Degraded Journey Access

## Q1. Deployment topology

- A. Retain the existing portable Compose topology and service-owned stores, with one isolated Wave A controller and no new cloud dependency. (recommended)
- B. Add a multi-region identity/cache platform.
- C. Merge all data stores behind the UI.
- X. Other (please specify)

[Answer]: Existing portable Compose (Recommended)

## Q2. Dependency monitoring

- A. Use existing correlated Identity/Reference Data health, timeout, freshness, safe-error, and Retry evidence with redacted logs. (recommended)
- B. Add a new global identity SLO platform.
- C. Monitor only browser control visibility.
- X. Other (please specify)

[Answer]: Correlated health/freshness (Recommended)

## Q3. Delivery protection

- A. Run auth/DTO/security checks, additive migrations, exact ten-request isolation, isolated Compose/Playwright evidence, and reversible promotion with demo guard. (recommended)
- B. Cache authority and replay captures during deployment.
- C. Deploy directly without dependency-outage proof.
- X. Other (please specify)

[Answer]: Checks + reversible promotion (Recommended)
