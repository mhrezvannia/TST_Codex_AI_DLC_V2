# CI/CD Pipeline - U05 Returned Status Detail

## Build and Test Gates

The pipeline validates canonical status Avro/AsyncAPI/examples/catalog and byte-identical CMM/Booking resources, then builds shared messaging, CMM, Booking, and Booking app. Serde/mapper/listener tests cover exact fields, forged key/source/container, malformed DCSA fields/times/location, integer version, duplicate/stale/ordered events, transaction rollback, record ack, transient retry, permanent DLT, and authorized replay.

Frontend/BFF tests cover server-only service URL/token, status DTO allow-list, one-second/no-overlap polling, 30-attempt stop, hidden pause, Retry, pending/delayed/unavailable distinctions, live announcement, XSS canary, accessibility, and responsive no-overlap. Static checks reject direct CMM/Kafka/SR browser calls, cross-service SQL, generic attributes as projection authority, alternate messaging infra, and raw record logs.

## Compose Journey

With PostgreSQL host 55432 and retained volumes, Compose performs the governed schema cutover, starts real Kafka adapters, confirms unique bookings, observes CMM status records, and verifies Booking detail/UI. It then duplicates/reorders events, injects DB/broker failures, crashes relay/listener around claim/commit, restarts services, and verifies receipts/projection/order remain correct.

The fixed journey/performance thresholds, changed-code coverage >=80 percent, dependency/secret/static scans, all backend/frontend/contract tests, and both audit detector suites are blocking. No noop publisher, empty happy-path DLT, missing event, or fallback UI can pass.

## Rollback and Evidence

Rollback retains canonical subjects and additive DB schemas; incompatible old consumers are forbidden. Prior application images may run only when contract/schema compatible. Evidence is content-hashed under the run ID; sensitive traces/dumps remain uncommitted and U07 performs final signing.

## Source Coverage

Pipeline enforces `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U05 `business-logic-model.md`.
