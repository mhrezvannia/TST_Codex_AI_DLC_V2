# Infrastructure Design Questions - U01 PB-01 Journey-to-Booking Walking Skeleton

U01's approved designs fix the portable service topology, owned PostgreSQL
stores, Kafka boundary, fenced relay, isolated Compose acceptance, and demo
guard. These questions choose infrastructure implementation details without
adding a cloud dependency.

## Q1. Deployment topology

Which deployment topology should the U01 infrastructure design target?

- A. Keep the existing portable container/Compose topology: CMM, Booking, Kafka, Schema Registry, PostgreSQL stores, Identity, Reference Data, shared edge, and the CMM app; no new AWS resource. (recommended)
- B. Introduce a cloud-managed multi-region deployment now.
- C. Collapse services into one VM and shared database.
- X. Other (please specify)

[Answer]: Existing portable Compose (Recommended)

## Q2. Monitoring evidence

Which monitoring approach should prove the bounded slice?

- A. Use existing service logs/metrics/traces plus correlation IDs, outbox/consumer health, DB/UI timing, and bounded alerts; keep evidence local and redacted. (recommended)
- B. Add a new production observability platform and global SLOs.
- C. Rely on container stdout without structured correlation.
- X. Other (please specify)

[Answer]: Existing correlated evidence (Recommended)

## Q3. CI/CD and rollback

Which pipeline pattern should protect the additive migration and demo?

- A. Build/test/contract checks, additive Flyway verification, isolated Compose acceptance, serialized visual evidence, and reversible image/config promotion; never reset volumes. (recommended)
- B. Deploy directly after compilation and reset databases on failure.
- C. Add blue-green cloud infrastructure before the vertical slice is proven.
- X. Other (please specify)

[Answer]: Checks + reversible promotion (Recommended)
