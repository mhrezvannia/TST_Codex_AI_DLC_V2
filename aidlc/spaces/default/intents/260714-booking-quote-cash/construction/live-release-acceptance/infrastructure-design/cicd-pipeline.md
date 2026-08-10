# CI/CD Pipeline - U07 Live Release Acceptance

## Build and Quality Sequence

The online pipeline validates contracts/catalog/examples, builds shared modules and all Maven services, runs all backend/unit/integration/serde/Pact/domain-purity tests, installs the locked Yarn workspace, and runs Booking app lint/type/unit/coverage. Changed-code line coverage >=80 percent, dependency/secret/static scans, seed/readiness checks, and generated-file drift checks are blocking. Transient Maven TLS `bad_record_mac` is retried against the configured mirror without dependency/trust changes.

Container images use the checked-in generic Dockerfiles and pinned bases; labels record commit/build. The pipeline rejects dirty generated contracts, schema-resource drift, missing `MESSAGING_REQUIRE_REAL=true`, local-noop live startup, non-local local auth, default tokens, browser service secrets, destructive DB reset, and edited detector output. Shared-module tests prove exact producer config/2.5-second timeout and require-real guard semantics before service images build.

## One Live-Proof Job

One non-split job performs preflight, governed local schema cutover, retained-volume Compose start on PostgreSQL host 55432, readiness, canonical seed, browser create/validate/price/confirm/returned-status, negative matrix, fixed workloads, DLT correction/replay, sequential restarts, migration stability, keyboard/accessibility/no-overlap, then quality reruns and both detectors:

- `bash .claude/skills/aidlc-audit/detectors.sh`
- `bash .claude/skills/erp-fidelity-audit/detectors.sh`

Each command result is written before transition. Missing/failed/threshold-violating evidence yields FAILED; unit tests or API-only/noop/fixture-only success cannot substitute for the continuous real run.

## Evidence Promotion and Rollback

The pipeline redacts, hashes, indexes, externally signs, verifies, read-only marks, and commits only release-safe evidence plus sibling attestation, then creates annotated `w1-01-live/<runId>` tag. Signature/tree/tag verification is the final gate. Sensitive dumps/traces remain uncommitted. Failed/partial runs are retained and never amended to PASS.

Application rollback preserves canonical subjects and additive DB schemas; incompatible images are blocked. Database recovery uses tested dump/forward repair without volume reset. A rerun always gets a new ID and signing attestation.

## Source Coverage

Pipeline enforces `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U07 `business-logic-model.md`.
