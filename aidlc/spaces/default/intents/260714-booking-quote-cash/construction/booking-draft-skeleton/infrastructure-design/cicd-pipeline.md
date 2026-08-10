# CI/CD Pipeline - U01 Booking Draft Skeleton

## Build and Test Stages

The online pipeline uses the repository Maven wrapper/settings and Aliyun mirror, Yarn 4/Turbo lockfile, and pinned Docker images. It builds shared contracts/platform modules before Booking, runs Booking domain/application/JDBC/API tests, Flyway empty/legacy/partial-catalog tests, frontend type/lint/unit tests, contract/catalog checks, and changed-code coverage. Transient TLS `bad_record_mac` failures are retried without changing dependency versions or trust settings.

Container assembly uses the existing `spring-service.Dockerfile` and `next-app.Dockerfile`; image labels record commit and build time. Dependency, secret, and static scans run before image use. The pipeline rejects default tokens, `NEXT_PUBLIC_*` service secrets, SQL init reactivation, `baseline-on-migrate=true`, browser-direct internal URLs, and changed-code line coverage below 80 percent.

## Promotion and Rollback

W1 promotion target is the local Compose acceptance profile, not cloud production. The pipeline starts PostgreSQL on host 55432, migrates an existing-volume fixture, seeds canonical data, drives create/list/detail in the browser, captures performance/accessibility/no-overlap evidence, restarts Booking twice, and verifies data/Flyway stability. `aidlc-audit` and `erp-fidelity-audit` are blocking.

Rollback never resets the database. Before migration, the pipeline captures a logical dump/hash. If startup validation fails before migration, the old image remains usable. After additive V2, recovery uses the tested dump or a forward-only repair migration; V1/V2 files are immutable once accepted. A failed run receives FAILED and a new run ID is required.

## Secrets and Artifacts

CI injects database/local service tokens from environment-scoped secret storage and redacts them from commands/logs. Build outputs, test reports, coverage, migration evidence, screenshots, and manifests are content-hashed. Sensitive dumps/traces are retained locally but excluded from Git; release-safe evidence is finalized by U07.

## Source Coverage

Pipeline gates enforce `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U01 `business-logic-model.md`.
