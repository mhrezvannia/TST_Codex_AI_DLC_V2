# CI/CD Pipeline - U01 PB-01 Journey-to-Booking Walking Skeleton

## Inputs and Checks

This pipeline implements U01 `performance-design.md`, `security-design.md`,
`scalability-design.md`, `reliability-design.md`, `logical-components.md`,
`components.md`, `services.md`, and `business-logic-model.md`.

Stages are: source/build, unit and integration tests, Avro/AsyncAPI/Pact
compatibility, static/type/security checks, additive Flyway upgrade/backfill
verification, container image creation, isolated `linercore-wave-a` Compose
acceptance through `scripts/wave-a-compose.mjs`, broker-to-DB-to-Booking proof,
and Playwright evidence. `npm run demo:guard` runs before and after live
acceptance; W2-02 merge/integration synchronization precedes final visual
acceptance.

## Promotion and Rollback

Artifacts are immutable tagged images/config. Promotion is reversible by
restoring the prior image/config and applying only forward-compatible migrations;
volumes are never reset. Schema-incompatible or deterministic failures stop the
pipeline; only the approved environmental retry is evidence-preserving. Secrets
use existing CI/runtime injection and are never logged.

