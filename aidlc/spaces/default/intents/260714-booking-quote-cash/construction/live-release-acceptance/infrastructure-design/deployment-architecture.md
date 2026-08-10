# Deployment Architecture - U07 Live Release Acceptance

## Continuous Acceptance Environment

One checked-in Node/PowerShell orchestrator drives the existing `compose.yaml` from a unique staging run directory. The real stack includes PostgreSQL 15 on host `${POSTGRES_HOST_PORT:-55432}:5432`, Kafka 7.7.1 on 9092, Schema Registry on 8081, Reference Data 8083, Charge 8084, Booking 8085, CMM 8086, Next.js apps, nginx 8088, and the existing Prometheus/Grafana/OTel/Jaeger services. Code Generation must wire Kafka profiles and `MESSAGING_REQUIRE_REAL=true`; live acceptance then verifies the shared guard rejects noop even under local and proves the concrete publisher/registrar bean classes before readiness.

The state machine is PRECHECK, SCHEMA, START, SEED, JOURNEY, NEGATIVE, PERFORMANCE, REPLAY_RESTART, ACCESSIBILITY, QUALITY, AUDITS, INDEX, then PASSED or FAILED. Each transition records its result before the next begins. A blocking failure stops dependent claims, preserves diagnostics, and requires a new run ID; volumes/evidence are never reset or overwritten to create success.

## Fixed Capacity Envelope

The environment declares source/DLT partitions three, listener concurrency three, relay batch 50/fixed 250 ms/lease 30 s, Hikari min 2/max 10/2-second acquisition, outbound cap 10, body 256 KiB, and Java RSS gate 768 MiB. Seeds provide 10,000 bookings, >=100 records/reference set, and >=100 agreements with <=100 terms while reserving unique measured journey fixtures.

Pricing runs 100 warm-up plus 1,000 measured requests at concurrency 10 within five minutes. Journey runs 10 warm-up plus 100 measured unique booking/container paths at concurrency five within ten minutes. Production forecast/autoscaling is not inferred from this local envelope.

## Trust and Finalization

Evidence is built in a mutable staging directory, fsynced, indexed, and hashed into a canonical manifest/Merkle root. An external Ed25519 private key at `W1_EVIDENCE_SIGNING_KEY_PATH` signs the root; the key never enters workspace/logs. The checked-in public key verifies sibling `artifacts/w1-01-live-attestations/<runId>.json` outside the run directory.

After verification, the finalizer marks the run read-only as an operational guard, creates a dedicated Git commit containing release-safe evidence plus attestation, and creates annotated tag `w1-01-live/<runId>`. PASS verifies signature, Git tree object, tag target, and manifest. Missing signing material fails closed; filesystem permissions alone are not a trust claim.

## Source Coverage

Deployment maps `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md` and `services.md`, and U07 `business-logic-model.md`.

## Review

The independent reviewer completed two iterations. Iteration 1 identified missing ownership for shared producer/timeout and live-noop guard changes; the design now assigns exact backward-compatible deltas and tests to `platform-messaging`. Iteration 2 observed correctly that those deltas are not yet present in source before Code Generation. The design therefore remains **NOT-READY for release until Code Generation implements the mandatory shared-module checklist**, with no claim that current W0 source already satisfies it.
