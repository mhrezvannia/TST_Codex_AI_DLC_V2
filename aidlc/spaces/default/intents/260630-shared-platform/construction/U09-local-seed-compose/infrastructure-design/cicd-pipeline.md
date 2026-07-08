# CI/CD Pipeline - U09 Local Seed Compose

## Pipeline Stages

| Stage | Checks |
|---|---|
| Compose syntax | Validate core and optional profile descriptors. |
| Seed schema | Validate seed manifests before writes. |
| Dependency plan | Verify parent ordering and missing dependency behavior. |
| Idempotency | Run same seed version twice and require no duplicates. |
| Security scan | Reject real/prohibited data and literal non-local secrets where detectable. |
| Smoke | Exercise API/BFF/service/event paths through `smokeTags`. |

## Deployment Stages

U09 is local/CI infrastructure only. It does not define production seed values or production migration procedures.

## Rollback

Local recovery is through deterministic reruns, volume reset when needed, and explicit conflict reports. No production rollback semantics are defined.

## Source Trace

This design implements constraints from `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, `components.md`, `services.md`, and `business-logic-model.md`.
