# External Dependency Map - Shared Platform Local Functionality

## Context

This dependency map consumes `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. It captures blockers outside ordinary code edits.

## Dependency Register

| Dependency | Owner | Blocks | Lead time | Mitigation / workaround |
| --- | --- | --- | --- | --- |
| Java 21 on PATH | Local environment owner | B01, B05 backend compile/test evidence | User controlled | Install Java 21 or provide self-hosted runner evidence. |
| Maven 3.9+ on PATH | Local environment owner | B01, B05 backend compile/test evidence | User controlled | Install Maven 3.9+ or use wrapper/runner if added. |
| Docker daemon running | Local environment owner | B01, B03, B04, B05 Compose/runtime proof | User controlled | Start Docker Desktop or approved Docker-compatible runtime. |
| Available local ports | Local environment owner / Codex | B01 through B05 local run | Immediate check | Prerequisite check reports occupied ports before startup. |
| Keycloak local realm/bootstrap data | Codex implementation plus local runtime | B01, B02, B03 | Implementation work | Deterministic bootstrap/import or admin API setup. |
| PostgreSQL schema/migration choice | Codex implementation | B01, B03, B05 | Implementation work | Use service-owned local migrations/schema initialization. |
| Kafka/Schema Registry health | Docker/runtime | B01, B04, B05 | Runtime dependent | Readiness reports retryable publication blockers. |
| Subagent reviewer/model availability | Tool/account state | Review quality only, not implementation | External/account | Use inline review and record caveat until capacity returns. |

## Non-Dependencies

The following are not dependencies for this Shared Platform intent:

- Public cloud account, AWS IAM, RDS, MSK, CDK, or CloudFormation.
- Finance provider credentials.
- Downstream Charge, Booking, or Container Movement teams.
- Production deployment approval.

## Bolt Impact

| Bolt | External dependency exposure |
| --- | --- |
| B01 | Highest exposure: Java, Maven, Docker, ports, Keycloak, PostgreSQL, Kafka, Schema Registry. |
| B02 | Moderate exposure: frontend can progress locally; full E2E needs B01 runtime. |
| B03 | High exposure: live APIs and Keycloak/identity/reference-data services required. |
| B04 | High exposure: running services and broker/schema stack required. |
| B05 | Highest exposure: aggregates all environment and runtime evidence. |

## Review

Verdict: READY

Inline fallback review finds this map aligned with `requirements`, `stories`, `mockups`, `components`, `unit-of-work`, `unit-of-work-dependency`, `unit-of-work-story-map`, and `team-practices`. It distinguishes true external blockers from ordinary implementation tasks.

