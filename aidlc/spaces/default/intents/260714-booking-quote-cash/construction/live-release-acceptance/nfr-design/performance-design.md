# Performance Design - U07 Live Release Acceptance

## Harness Pipeline

Checked-in Node orchestrator creates run ID, preflight/seed, invokes workload workers with bounded concurrency and monotonic timers, streams raw JSONL/CSV, computes nearest-rank only after retaining errors, and writes summary/manifest hashes. Pricing and browser round-trip use fixed warm-up/sample/concurrency/time ceilings.

Metrics collector snapshots Docker stats, Hikari, HTTP, outbox/consumer lag, DB queries and browser marks before/during/after. Workload fails on any error, threshold/resource/lag violation, parameter drift, missing raw sample, or mismatched business/event identity.

## Source Coverage

Design realizes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and U07 `business-logic-model.md`.

## Review

The architecture review completed two iterations. After correcting guarded Flyway takeover, bounded validation fan-out, Kafka/outbox retry ownership and idempotent producer compatibility, and externally signed release evidence, the independent reviewer returned **READY** with no unresolved blockers. Deterministic required-section and upstream-coverage sensors passed for all 35 NFR Design artifacts.
