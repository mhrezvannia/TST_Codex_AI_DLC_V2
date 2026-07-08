# Reliability Requirements - U09 Local Seed Compose

## Source Trace

This artifact derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

`business-logic-model.md` defines startup health waits, idempotent seed behavior, dependency ordering, smoke checks, and failure handling. `business-rules.md` requires validation before writes, duplicate/conflict detection, health checks, seed summaries, and second-run no-duplicate behavior. `requirements.md` fixes NFR-005, NFR-017, FR-050, and the on-prem Docker Compose target.

## Reliability Requirements

| Area | Requirement |
|---|---|
| Startup | Required services declare health checks and seed loader waits within bounded timeout. |
| Validation | Missing packs, invalid schema, missing parents, and conflicting immutable keys fail before unsafe writes. |
| Idempotency | Same seed version rerun creates no duplicates and reports skipped/current records. |
| Dependency ordering | Parent reference and identity dependencies load before dependents. |
| Smoke checks | Read seeded records through APIs and authorization paths, not database shortcuts. |
| Summary | Successful run reports pack id, seed version, counts, and correlation id. |

## Failure Behavior

| Failure | Required behavior |
|---|---|
| Required dependency unhealthy | Retry within timeout, then fail with endpoint and health details. |
| Missing seed pack | Fail before writes and name missing pack. |
| Invalid seed schema | Fail before writes and print validation path. |
| Parent dependency missing | Fail dependent record unless explicitly optional. |
| Immutable key conflict | Fail run; do not silently mutate meaning. |
| Kafka/SR unavailable during event smoke | Do not claim event smoke success. |

## Non-Goals

- No production recovery procedure.
- No bypass of domain validation for convenience.
- No guarantee optional observability profile is always running locally.

