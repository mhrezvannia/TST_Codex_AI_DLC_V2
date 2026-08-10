# Infrastructure Services - U07 Live Release Acceptance

## Release Components

| Component | Responsibility | Access/failure boundary |
|---|---|---|
| preflight/schema controller | tools/ports/images/profile/fingerprint cutover | local run control |
| Compose readiness/seed driver | real services and canonical idempotent data | local environment |
| Playwright browser driver | visible journey, network, accessibility, overlap | nginx/browser only |
| topic/DB observers | exact contracts, offsets, receipts, business state | read-only evidence |
| performance collector | raw samples, nearest-rank, Docker/pool/lag | workload only |
| recovery controller | DLT replay, faults, migration, sequential restarts | protected local controls |
| quality/audit runners | tests, coverage, detector outputs | merge gate |
| manifest/attestation/Git finalizer | traceability, signature, content-addressed verdict | evidence authority |

All components are checked-in tooling around existing services; no parallel application, alternate broker, fixture-only event producer, or production cloud environment is introduced.

## Preflight and Runtime Controls

Preflight captures branch/commit/dirty summary, OS/time zone/tool versions, Docker storage/disk/images, redacted Compose config, ports, profiles, dependency locks, root/service schema hashes, and seed presence. It allow-lists local endpoints/network and fails on host PostgreSQL 5432 use, noop adapters, missing identity/replay tokens, non-local auth, unknown schema fingerprints, absent signing key, or inadequate disk.

The schema controller exports before/after subjects and performs only the exact disposable-local cutover. Readiness proves DB/Flyway, broker/SR, registrar, relay, listener assignment, auth/noop guards, service health, UI, and nginx. Seed and command operations use real APIs and stable idempotency keys.

## Data and Evidence Handling

Topic observers decode schema-valid records and record key/partition/offset/schema ID. Database observers use read-only credentials and capture selected safe rows/counts/hashes; they cannot update domain tables. Browser captures safe network metadata/screenshots. Redaction removes tokens, connection strings, environment secrets, customer PII, unrestricted payloads, and stack traces before evidence write.

Sensitive dumps/traces stay controlled and uncommitted. Release-safe artifacts store producer command, UTC time, exit, classification, SHA-256, requirement mapping, and business/correlation identity. The final manifest rejects missing, contradictory, partial, unsigned, or failed evidence.

## Source Coverage

Services realize `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U07 `business-logic-model.md`.
