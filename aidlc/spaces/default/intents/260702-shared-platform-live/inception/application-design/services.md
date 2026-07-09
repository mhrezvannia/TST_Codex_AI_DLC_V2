# Services - Shared Platform Local Functionality

## Context

This service design consumes `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. It covers the services needed to make Shared Platform locally functional and integration-ready.

## Service Definitions

| Service | Runtime | Responsibility | Lifecycle |
| --- | --- | --- | --- |
| `apps-auth` | Next.js BFF | Auth entry point, session summary, local-only bypass indicator, sign-out, access-request. | Stateless app container or dev server. |
| `apps-reference-data` | Next.js BFF/UI | Reference Data workbench, server-side integration routes, readiness/contract views. | Stateless app container or dev server. |
| `identity-service` | Java Spring Boot | Authorization, effective permissions, role assignment, authorization audit. | Long-running service, local profile. |
| `reference-data-service` | Java Spring Boot | Reference data lifecycle, validation, history, outbox, publication status, publish worker endpoint. | Long-running service, local profile. |
| `postgres` | PostgreSQL 15 | Durable local state for identity, reference data, history, and outbox. | Compose backing service with volume/reset option. |
| `keycloak` | Keycloak 24 | Local identity provider, realm/client/users. | Compose backing service plus deterministic bootstrap. |
| `kafka` | Kafka | Reference-data event broker. | Compose backing service. |
| `schema-registry` | Schema Registry | Avro schema registration and compatibility checks. | Compose backing service. |
| `seed-loader` | Node script container or local script | Validates and applies seed pack through live APIs. | On-demand job. |
| `nginx` | Nginx | Local gateway for auth/reference-data apps and health. | Compose service. |
| Observability profile | Prometheus/Grafana/Jaeger/OTel | Optional local evidence and troubleshooting. | Optional Compose profile. |

## Orchestration Patterns

| Flow | Pattern | Rationale |
| --- | --- | --- |
| Session lookup | BFF orchestration | UI needs one safe session summary and no token exposure. |
| Permission lookup | BFF to identity-service synchronous request | UI action state must reflect identity authorization. |
| Reference-data read | BFF to reference-data-service synchronous request | Workbench requires current list/detail state. |
| Mutation | BFF orchestrates session, authorization, service mutation, response mapping | Browser must not call services directly, and UI needs consistent error mapping. |
| Outbox publication | reference-data-service choreography through transactional outbox and Kafka | Mutation commit should not depend on broker availability. |
| Seed apply | Job orchestration through service/admin APIs | Seed data must prove live APIs and remain idempotent. |
| Contract readiness | Test/check orchestration | Contracts must be verified against running behavior, not static files only. |

## Communication Contracts

| Caller | Callee | Protocol | Contract |
| --- | --- | --- | --- |
| Browser | Next.js apps | HTTP | UI routes and BFF route handlers. |
| `apps-auth` | Keycloak | OIDC over HTTP | authorize/callback/logout. |
| `apps-auth` | `identity-service` | HTTP JSON | effective permissions and access-request support. |
| `apps-reference-data` | `identity-service` | HTTP JSON | authorize/effective-permissions. |
| `apps-reference-data` | `reference-data-service` | HTTP JSON | OpenAPI `reference-data-service.yaml`. |
| `reference-data-service` | PostgreSQL | JDBC | service-owned tables for records, changes, outbox. |
| `identity-service` | PostgreSQL | JDBC | service-owned tables for assignments and audits. |
| `reference-data-service` | Kafka | Avro over Kafka | `referencedata.*.changed.avsc`. |
| `reference-data-service` | Schema Registry | HTTP | schema registration/check. |
| Seed loader | service/admin APIs | HTTP JSON | idempotent apply calls and summary. |

## Scaling and Local Lifecycle

| Service | Local scale | Notes |
| --- | --- | --- |
| Next.js apps | 1 instance each | Stateless, restart-safe after session cookie behavior is defined. |
| Java services | 1 instance each | Local Compose only; horizontal scaling not required for this intent. |
| PostgreSQL | 1 instance | Persistence required across local restart unless reset explicitly. |
| Kafka/Schema Registry | 1 node each | Local integration proof only. |
| Seed loader | On-demand single job | Safe to re-run; reports created/updated/skipped/failed. |

## Failure Handling

| Failure | Service behavior |
| --- | --- |
| Keycloak unavailable | Auth BFF shows service-down; local bypass only if profile allows. |
| identity-service unavailable | Reference Data BFF returns permission error/readiness blocker, not static write state. |
| reference-data-service unavailable | Workbench shows service-down state; no fixture success. |
| PostgreSQL unavailable | Java services fail health/readiness and quality gates mark runtime blocked. |
| Kafka unavailable | Mutations still persist and outbox status becomes pending/retrying. |
| Schema Registry unavailable | Publication marks retryable status. |
| Java/Maven/Docker missing | Readiness reports prerequisite blocker, not code failure. |

## Review

Verdict: READY

Inline fallback review finds this service design aligned with `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. It keeps local/on-prem Compose topology and rejects cloud substitution for this intent.

