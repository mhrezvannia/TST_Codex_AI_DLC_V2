# Component Dependency - Shared Platform Local Functionality

## Context

This dependency design consumes `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. It records allowed dependencies and data flows for making Shared Platform locally functional.

## Dependency Matrix

| Component | Depends on | Type | Notes |
| --- | --- | --- | --- |
| Browser | `apps-auth`, `apps-reference-data` | HTTP | Browser never calls Java services directly. |
| `apps-auth` | Keycloak | Sync HTTP/OIDC | Sign-in and logout. |
| `apps-auth` | `identity-service` | Sync HTTP | Effective permissions and role context. |
| `apps-reference-data` | `apps-auth` session cookie/shared auth package | Local cookie/package | Reads safe session context. |
| `apps-reference-data` | `identity-service` | Sync HTTP | Permission state and explicit authorization. |
| `apps-reference-data` | `reference-data-service` | Sync HTTP | Reference set list/detail/mutation/history/event status. |
| `identity-service` | PostgreSQL | JDBC | Role assignments and audit persistence. |
| `identity-service` | Keycloak subject data | Port/adapter | Subject resolution. |
| `reference-data-service` | `identity-service` | Sync HTTP through port | Server-side mutation authorization. |
| `reference-data-service` | PostgreSQL | JDBC | Records, changes, outbox. |
| `reference-data-service` | Kafka | Async event | Published reference-data changed events. |
| `reference-data-service` | Schema Registry | Sync HTTP | Schema registration/check before publish. |
| Seed loader | Keycloak, identity-service, reference-data-service | Sync HTTP | Applies local users, roles, and reference records. |
| Contract readiness | running services, contracts | Test/check | Verifies OpenAPI, Avro, Pact/message fixtures. |
| Readiness checks | Compose, services, scripts | Test/check | Reports prerequisite/service/quality evidence. |

## Data Flow - Reference Data Mutation

```text
Browser
  -> apps-reference-data BFF
  -> identity-service authorize/effective permissions
  -> reference-data-service create/update/deactivate
  -> PostgreSQL records and history
  -> PostgreSQL outbox
  -> Kafka publish through Schema Registry
  -> apps-reference-data refreshes detail/history/publication status
```

Properties:

- Correlation id is created or propagated at the BFF boundary and passed through every call.
- Authorization is checked before mutation in the BFF and again inside reference-data-service via `AuthorizationClientPort`.
- UI receives persisted record state, not accepted-only drafts.

## Data Flow - Seed Apply

```text
Seed pack JSON
  -> seed loader validation
  -> wait for Compose health
  -> Keycloak/admin or identity-service role/user apply
  -> reference-data-service create/update calls
  -> service persistence/history/outbox
  -> summary file with created/updated/skipped/failed
```

Properties:

- Seed apply does not write PostgreSQL tables directly.
- Natural keys and fingerprints drive idempotency.
- Failures are row-level where possible.

## Data Flow - Readiness

```text
Prerequisite check
  -> Compose service health
  -> app/service health endpoints
  -> seed dry-run/apply status
  -> contract checks
  -> smoke mutation and publication status
  -> readiness evidence summary
```

Properties:

- Missing Java, Maven, or Docker is classified as prerequisite blocked.
- Runtime smoke does not report success from static fixtures.
- Evidence files are linked from readiness output.

## Shared Resources

| Resource | Owner | Consumers |
| --- | --- | --- |
| PostgreSQL schema for identity | identity-service | identity-service only. |
| PostgreSQL schema for reference data | reference-data-service | reference-data-service only. |
| Outbox table | reference-data-service | publish worker/status APIs. |
| Kafka topics | reference-data-service publishes; downstream modules consume later. |
| Avro schemas | contracts plus reference-data-service publisher. |
| Auth session cookie | Auth BFF/shared auth package; Reference Data BFF reads safe summary. |
| Correlation id | BFF boundary creates/propagates; services log/return. |

## Prohibited Dependencies

1. Browser to Java service direct calls.
2. Browser or seed script direct database writes.
3. Downstream module runtime calls during this intent.
4. Domain-core modules importing Spring, persistence, Kafka, Jackson, Lombok, dataaccess, or messaging.
5. UI using static local arrays as source of truth after service-backed BFF routes are implemented.

## Review

Verdict: READY

Inline fallback review finds the dependency design aligned with `requirements`, `stories`, `architecture`, `component-inventory`, and `team-practices`. It preserves BFF boundaries, service-owned data, event decoupling, and local runtime evidence.

